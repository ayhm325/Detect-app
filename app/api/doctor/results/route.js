import { withRBAC } from "../../../../lib/auth/withRBAC";
import prisma from "../../../../lib/prismaClient";
import { rateLimit } from "../../../../lib/security/rateLimiter";
import { logAudit } from "../../../../lib/security/auditLogger";
import { createNotificationBestEffort } from "../../../../lib/notifications";

// GET /api/doctor/results
export const GET = withRBAC(async (request, user) => {
  const rl = await rateLimit(request);
  if (rl.limited) {
    logAudit({ event: "rate_limit_exceeded", userId: user.id, ip: request.headers.get('x-forwarded-for'), details: { endpoint: "GET /api/doctor/results" } });
    return Response.json({ error: "Rate limit exceeded" }, { status: 429 });
  }
  try {
    const { searchParams } = new URL(request.url);
    const patientId = (searchParams.get("patientId") || "").trim();

    // جلب كل السجلات الطبية للمرضى المرتبطين بالطبيب الحالي
    const records = await prisma.medicalRecord.findMany({
      where: { doctorId: user.id, ...(patientId ? { patientId } : {}) },
      include: {
        patient: { select: { id: true, fullName: true, email: true, clinicalStatus: true } },
        doctor: {
          select: {
            userId: true,
            user: { select: { id: true, fullName: true, email: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    const out = records.map((r) => ({
      id: r.id,
      title: r.title || "Chest X-Ray",
      imageUrl: r.imageUrl || null,
      aiResult: r.aiResult || null,
      confidenceScore: r.confidenceScore || null,
      reviewedByDoctor: Boolean(r.reviewedByDoctor),
      doctorNotes: r.doctorNotes || null,
      createdAt: r.createdAt,
      patient: r.patient ? { id: r.patient.id, name: r.patient.fullName, email: r.patient.email, clinicalStatus: r.patient.clinicalStatus || null } : null,
      patientClinicalStatus: r.patient?.clinicalStatus || null,
      doctor: r.doctor?.user ? { id: r.doctor.userId, name: r.doctor.user.fullName || null } : null
    }));
    logAudit({ event: "doctor_results_viewed", userId: user.id, ip: request.headers.get('x-forwarded-for'), details: { count: out.length } });
    return Response.json({ records: out }, { status: 200 });
  } catch (err) {
    logAudit({ event: "doctor_results_view_error", userId: user.id, ip: request.headers.get('x-forwarded-for'), details: { error: err.message } });
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}, ["doctor"]);

// PATCH /api/doctor/results
// Body: { id: string, reviewedByDoctor?: boolean, doctorNotes?: string|null }
export const PATCH = withRBAC(async (request, user) => {
  const rl = await rateLimit(request);
  if (rl.limited) {
    logAudit({ event: "rate_limit_exceeded", userId: user.id, ip: request.headers.get('x-forwarded-for'), details: { endpoint: "PATCH /api/doctor/results" } });
    return Response.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const id = typeof body?.id === "string" ? body.id.trim() : "";
    if (!id) return Response.json({ error: "missing_id" }, { status: 400 });

    const before = await prisma.medicalRecord.findFirst({
      where: { id, doctorId: user.id },
      select: {
        patientId: true,
        reviewedByDoctor: true,
        doctorNotes: true,
        patient: { select: { id: true, userId: true, fullName: true } },
      },
    });

    if (!before) {
      logAudit({ event: "doctor_results_update_denied", userId: user.id, ip: request.headers.get('x-forwarded-for'), details: { id } });
      return Response.json({ error: "not_found" }, { status: 404 });
    }

    const reviewedByDoctor = typeof body.reviewedByDoctor === "boolean" ? body.reviewedByDoctor : true;
    const doctorNotesRaw = body.doctorNotes;
    const doctorNotes = doctorNotesRaw == null ? null : String(doctorNotesRaw).trim();

    const clinicalStatusRaw = body?.clinicalStatus;
    const clinicalStatus = clinicalStatusRaw == null ? null : String(clinicalStatusRaw).trim();
    const allowedClinical = new Set(["stable", "critical", "recovering"]);
    if (clinicalStatus && !allowedClinical.has(clinicalStatus)) {
      return Response.json({ error: "invalid_clinical_status" }, { status: 400 });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const updatedRecord = await tx.medicalRecord.updateMany({
        where: { id, doctorId: user.id },
        data: {
          reviewedByDoctor,
          doctorNotes: doctorNotes || null,
        },
      });

      if (clinicalStatus && before?.patient?.id) {
        // Update only patients owned by this doctor
        await tx.patient.updateMany({
          where: { id: before.patient.id, doctorId: user.id },
          data: { clinicalStatus },
        });
      }

      return updatedRecord;
    });

    if (updated.count === 0) {
      logAudit({ event: "doctor_results_update_denied", userId: user.id, ip: request.headers.get('x-forwarded-for'), details: { id } });
      return Response.json({ error: "not_found" }, { status: 404 });
    }

    // Notify patient (best-effort)
    try {
      const patientUserId = before?.patient?.userId || null;
      const patientName = before?.patient?.fullName || null;
      const prevReviewed = Boolean(before.reviewedByDoctor);
      const prevNotes = (before.doctorNotes || "").trim();
      const nextReviewed = Boolean(reviewedByDoctor);
      const nextNotes = (doctorNotes || "").trim();

      const didBecomeReviewed = !prevReviewed && nextReviewed;
      const didAddOrChangeNotes = Boolean(nextNotes) && nextNotes !== prevNotes;

      if (patientUserId && (didBecomeReviewed || didAddOrChangeNotes)) {
        const arMsg = didBecomeReviewed && didAddOrChangeNotes
          ? `قام الطبيب بمراجعة نتيجتك وأضاف ملاحظات جديدة.${patientName ? ` (${patientName})` : ''}`
          : didAddOrChangeNotes
          ? `قام الطبيب بإضافة ملاحظات جديدة على نتيجتك.${patientName ? ` (${patientName})` : ''}`
          : `قام الطبيب بمراجعة نتيجتك.${patientName ? ` (${patientName})` : ''}`;

        const enMsg = didBecomeReviewed && didAddOrChangeNotes
          ? `Your doctor reviewed your result and added new notes.${patientName ? ` (${patientName})` : ''}`
          : didAddOrChangeNotes
          ? `Your doctor added new notes to your result.${patientName ? ` (${patientName})` : ''}`
          : `Your doctor reviewed your result.${patientName ? ` (${patientName})` : ''}`;

        await createNotificationBestEffort(prisma, {
          userId: patientUserId,
          type: didAddOrChangeNotes ? 'info' : 'success',
          message: { ar: arMsg, en: enMsg },
        });
      }
    } catch {}

    const record = await prisma.medicalRecord.findFirst({
      where: { id, doctorId: user.id },
      include: {
        patient: { select: { id: true, fullName: true, email: true } },
        doctor: {
          select: {
            userId: true,
            user: { select: { id: true, fullName: true, email: true } },
          },
        },
      },
    });

    logAudit({
      event: "doctor_results_updated",
      userId: user.id,
      ip: request.headers.get('x-forwarded-for'),
      details: { id, reviewedByDoctor: Boolean(reviewedByDoctor), hasNotes: Boolean(doctorNotes) },
    });

    return Response.json(
      {
        record: record
          ? {
              id: record.id,
              title: record.title || "Chest X-Ray",
              imageUrl: record.imageUrl || null,
              aiResult: record.aiResult || null,
              confidenceScore: record.confidenceScore || null,
              reviewedByDoctor: Boolean(record.reviewedByDoctor),
              doctorNotes: record.doctorNotes || null,
              createdAt: record.createdAt,
              patient: record.patient ? { id: record.patient.id, name: record.patient.fullName, email: record.patient.email } : null,
              doctor: record.doctor?.user ? { id: record.doctor.userId, name: record.doctor.user.fullName || null } : null,
            }
          : null,
      },
      { status: 200 }
    );
  } catch (err) {
    logAudit({ event: "doctor_results_update_error", userId: user.id, ip: request.headers.get('x-forwarded-for'), details: { error: err.message } });
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}, ["doctor"]);
