import { NextResponse } from "next/server";
import prisma from "../../../../lib/prismaClient";
import { getMedicalRecordsForPatient } from "../../../../lib/prismaQueries";
import { withRBAC } from "../../../../lib/auth/withRBAC";
import { rateLimit } from "../../../../lib/security/rateLimiter";
import { logAudit } from "../../../../lib/security/auditLogger";



export const GET = withRBAC(async (request, user) => {
  const rl = await rateLimit(request);
  if (rl.limited) {
    logAudit({ event: "rate_limit_exceeded", userId: user.id, ip: request.headers.get('x-forwarded-for'), details: { endpoint: "GET /api/patient/results" } });
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }
  try {
    const userId = user.id;
    const patient = await prisma.patient.findFirst({ where: { userId } });
    if (!patient) return NextResponse.json({ error: "Patient not found" }, { status: 404 });

    let records = [];
    try {
      records = await getMedicalRecordsForPatient(patient.id);
    } catch (e) {
      records = await prisma.medicalRecord.findMany({
        where: { patientId: patient.id },
        include: {
          doctor: {
            select: {
              userId: true,
              user: { select: { id: true, fullName: true, email: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" }
      });
    }

    const chestRecords = records.filter((r) => {
      if (!r) return false;
      if (r.imageUrl && /chest|x-?ray|cxr/i.test(r.imageUrl)) return true;
      if (r.title && /chest|x-?ray|cxr/i.test(r.title)) return true;
      if (r.notes && /chest|x-?ray|cxr/i.test(r.notes)) return true;
      return false;
    });

    const out = chestRecords.map((r) => ({
      id: r.id,
      title: r.title || "Chest X-Ray",
      imageUrl: r.imageUrl || null,
      aiResult: r.aiResult || null,
      confidenceScore: r.confidenceScore || null,
      createdAt: r.createdAt,
      doctor: r.doctor?.user ? { id: r.doctor.userId, name: r.doctor.user.fullName || null } : null
    }));

    logAudit({ event: "patient_results_viewed", userId: user.id, ip: request.headers.get('x-forwarded-for'), details: { count: out.length } });
    return NextResponse.json({ records: out }, { status: 200 });
  } catch (err) {
    logAudit({ event: "patient_results_view_error", userId: user.id, ip: request.headers.get('x-forwarded-for'), details: { error: err.message } });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}, ["patient"]);
