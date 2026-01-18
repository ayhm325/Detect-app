import { withRBAC } from "../../../../lib/auth/withRBAC";
import prisma from "../../../../lib/prismaClient";
import { rateLimit } from "../../../../lib/security/rateLimiter";
import { logAudit } from "../../../../lib/security/auditLogger";
import {
  createNotificationBestEffort,
  formatDateTimeForLocale,
} from "../../../../lib/notifications";

// GET /api/doctor/appointments
export const GET = withRBAC(
  async (request, user) => {
    const rl = await rateLimit(request);
    if (rl.limited) {
      logAudit({
        event: "rate_limit_exceeded",
        userId: user.id,
        ip: request.headers.get("x-forwarded-for"),
        details: { endpoint: "GET /api/doctor/appointments" },
      });
      return Response.json({ error: "Rate limit exceeded" }, { status: 429 });
    }
    try {
      // جلب كل المواعيد للطبيب الحالي
      const appointments = await prisma.appointment.findMany({
        where: { doctorId: user.id, isDeleted: false },
        include: {
          patient: {
            select: { id: true, fullName: true, email: true, phone: true },
          },
          doctor: {
            select: {
              userId: true,
              phone: true,
              user: { select: { id: true, fullName: true, email: true } },
            },
          },
        },
        orderBy: { scheduledAt: "asc" },
      });
      const out = appointments.map((a) => ({
        id: a.id,
        patient: a.patient
          ? {
              id: a.patient.id,
              name: a.patient.fullName,
              email: a.patient.email,
              phone: a.patient.phone || null,
            }
          : null,
        doctor: a.doctor
          ? {
              id: a.doctor.userId,
              name: a.doctor.user?.fullName || null,
              phone: a.doctor.phone || null,
            }
          : null,
        scheduledAt: a.scheduledAt,
        status: a.status,
        reason: a.reason,
        patientReason: a.patientReason,
        createdAt: a.createdAt,
        type: a.type || "clinic",
        location: a.location || null,
      }));
      logAudit({
        event: "doctor_appointments_listed",
        userId: user.id,
        ip: request.headers.get("x-forwarded-for"),
        details: { count: out.length },
      });
      return Response.json({ appointments: out }, { status: 200 });
    } catch (err) {
      logAudit({
        event: "doctor_appointments_list_error",
        userId: user.id,
        ip: request.headers.get("x-forwarded-for"),
        details: { error: err.message },
      });
      return Response.json({ error: "Server error" }, { status: 500 });
    }
  },
  ["doctor"],
);

// POST /api/doctor/appointments
export const POST = withRBAC(
  async (request, user) => {
    const rl = await rateLimit(request);
    if (rl.limited) {
      logAudit({
        event: "rate_limit_exceeded",
        userId: user.id,
        ip: request.headers.get("x-forwarded-for"),
        details: { endpoint: "POST /api/doctor/appointments" },
      });
      return Response.json({ error: "Rate limit exceeded" }, { status: 429 });
    }
    try {
      const body = await request.json();
      const { patientId, scheduledAt, reason, phone, type } = body || {};
      if (!patientId || !scheduledAt) {
        return Response.json(
          { error: "Missing required fields" },
          { status: 400 },
        );
      }
      const scheduled = new Date(scheduledAt);
      if (isNaN(scheduled.getTime())) {
        return Response.json({ error: "Invalid date" }, { status: 400 });
      }

      // determine location: if type is online, set to 'عن بعد', else use provided or doctor's clinic/address
      let locationValue;
      if (type === "online") {
        locationValue = "عن بعد";
      } else {
        const doctorProfile = await prisma.doctor.findUnique({
          where: { userId: user.id },
          select: { clinic: true },
        });
        locationValue =
          body.location || (doctorProfile && doctorProfile.clinic) || null;
      }

      // create appointment for the current doctor
      const created = await prisma.appointment.create({
        data: {
          doctorId: user.id,
          patientId,
          scheduledAt: scheduled.toISOString(),
          status: "scheduled",
          reason: reason || null,
          location: locationValue,
          type: type || "clinic",
        },
      });

      try {
        const patient = await prisma.patient.findUnique({
          where: { id: patientId },
          select: { userId: true, fullName: true },
        });
        const doctorUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { fullName: true },
        });
        const patientUserId = patient?.userId || null;
        const doctorName = doctorUser?.fullName || null;

        if (patientUserId) {
          await createNotificationBestEffort(prisma, {
            userId: patientUserId,
            type: "info",
            message: {
              ar: `تم تحديد موعد لك${doctorName ? ` مع د. ${doctorName}` : ""} بتاريخ ${formatDateTimeForLocale(scheduled, "ar")}.`,
              en: `An appointment${doctorName ? ` with Dr. ${doctorName}` : ""} was scheduled for ${formatDateTimeForLocale(scheduled, "en")}.`,
            },
          });
        }
      } catch (e) {
        console.warn(
          "/api/doctor/appointments: failed to notify patient",
          e && e.message,
        );
      }

      logAudit({
        event: "doctor_appointment_created",
        userId: user.id,
        ip: request.headers.get("x-forwarded-for"),
        details: { appointmentId: created.id, patientId },
      });
      return Response.json({ appointment: created }, { status: 201 });
    } catch (err) {
      logAudit({
        event: "doctor_appointment_create_error",
        userId: user?.id,
        ip: request?.headers?.get("x-forwarded-for"),
        details: { error: err.message },
      });
      return Response.json({ error: "Server error" }, { status: 500 });
    }
  },
  ["doctor"],
);
