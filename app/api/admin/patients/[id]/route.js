import prisma from "../../../../../lib/prismaClient";
import { withRBAC } from "../../../../../lib/auth/withRBAC";
import { rateLimit } from "../../../../../lib/security/rateLimiter";
import { logAudit } from "../../../../../lib/security/auditLogger";
import { createNotificationBestEffort } from "../../../../../lib/notifications";

export const PATCH = withRBAC(
  async (request, user, context) => {
    const rl = await rateLimit(request);
    if (rl.limited) {
      logAudit({
        event: "rate_limit_exceeded",
        userId: user.id,
        ip: request.headers.get("x-forwarded-for"),
        details: { endpoint: "PATCH /api/admin/patients/[id]" },
      });
      return Response.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    const resolvedParams =
      typeof context?.params?.then === "function"
        ? await context.params
        : context?.params;
    const { id } = resolvedParams || {};
    if (!id) {
      return new Response(JSON.stringify({ error: "Missing patient id" }), {
        status: 400,
      });
    }

    // Look up patient to get userId
    let patient;
    try {
      patient = await prisma.patient.findUnique({ where: { id } });
    } catch (e) {
      return new Response(
        JSON.stringify({ error: "Database error: " + (e.message || e) }),
        { status: 500 },
      );
    }
    if (!patient) {
      return new Response(JSON.stringify({ error: "Patient not found" }), {
        status: 404,
      });
    }
    const userId = patient.userId;
    if (!userId) {
      return new Response(
        JSON.stringify({
          error: "Patient record missing userId, cannot update user.",
        }),
        { status: 400 },
      );
    }

    let body;
    try {
      body = await request.json();
    } catch (e) {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
        status: 400,
      });
    }

    const {
      name,
      email,
      phone,
      gender,
      doctorId,
      status,
      bloodType,
      birthDate,
      medicalId,
      allergies,
      chronicDiseases,
    } = body;

    // normalize legacy client values to Prisma enum-compatible values
    let normalizedStatus = status;
    if (status === "banned") {
      normalizedStatus = "suspended";
    }

    try {
      const prevDoctorId = patient?.doctorId || null;

      // Update user (fullName/email) and patient (phone/gender) in a transaction
      const result = await prisma.$transaction(async (tx) => {
        const updatedUser = await tx.user.update({
          where: { id: userId },
          data: {
            ...(name ? { fullName: name } : {}),
            ...(email ? { email } : {}),
          },
        });

        const patientUpdate = {
          ...(phone !== undefined ? { phone } : {}),
          ...(gender ? { gender } : {}),
          ...(medicalId ? { medicalId } : {}),
          ...(bloodType ? { bloodType } : {}),
          ...(birthDate
            ? { birthDate: birthDate ? new Date(birthDate) : undefined }
            : {}),
          // ...(Array.isArray(allergies) ? { allergies } : {}),
          // ...(Array.isArray(chronicDiseases) ? { chronicDiseases } : {}),
        };

        // If doctorId is provided, set relation by userId or doctor id depending on schema
        if (doctorId) {
          // attempt to set doctorId field directly
          patientUpdate.doctorId = doctorId;
        }

        // If status is provided, update patient.status if exists (use normalized value)
        if (normalizedStatus) {
          patientUpdate.status = normalizedStatus;
        }

        const updatedPatient = await tx.patient.update({
          where: { id },
          data: patientUpdate,
        });

        // If status changed and a linked user exists, reflect it in user.isActive
        if (normalizedStatus && userId) {
          await tx.user.update({
            where: { id: userId },
            data: { isActive: normalizedStatus === "active" },
          });
        }

        return { user: updatedUser, patient: updatedPatient };
      });

      // Return updated patient with included user
      const patientWithUser = await prisma.patient.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              role: true,
              isActive: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },
      });

      // Notify newly assigned doctor (best-effort)
      try {
        const nextDoctorId = doctorId ? String(doctorId).trim() : null;
        if (nextDoctorId && nextDoctorId !== prevDoctorId) {
          const patientName = (
            patientWithUser?.user?.fullName ||
            patient?.fullName ||
            ""
          ).trim();
          await createNotificationBestEffort(prisma, {
            userId: nextDoctorId,
            type: "info",
            message: {
              ar: `تم إسناد مريض إليك: ${patientName || "مريض جديد"}.`,
              en: `A patient has been assigned to you: ${patientName || "a new patient"}.`,
            },
          });
        }
      } catch {}

      logAudit({
        event: "admin_patient_updated",
        userId: user.id,
        ip: request.headers.get("x-forwarded-for"),
        details: { patientId: id },
      });
      return new Response(JSON.stringify(patientWithUser), { status: 200 });
    } catch (error) {
      logAudit({
        event: "admin_patient_update_error",
        userId: user.id,
        ip: request.headers.get("x-forwarded-for"),
        details: { patientId: id, error: error?.message },
      });
      return new Response(JSON.stringify({ error: "Server error" }), {
        status: 500,
      });
    }
  },
  ["admin"],
);
