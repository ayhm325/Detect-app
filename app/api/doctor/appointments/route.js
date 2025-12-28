import { withRBAC } from "../../../../lib/auth/withRBAC";
import prisma from "../../../../lib/prismaClient";
import { rateLimit } from "../../../../lib/security/rateLimiter";
import { logAudit } from "../../../../lib/security/auditLogger";

// GET /api/doctor/appointments
export const GET = withRBAC(async (request, user) => {
  const rl = rateLimit(request);
  if (rl.limited) {
    logAudit({ event: "rate_limit_exceeded", userId: user.id, ip: request.headers.get('x-forwarded-for'), details: { endpoint: "GET /api/doctor/appointments" } });
    return Response.json({ error: "Rate limit exceeded" }, { status: 429 });
  }
  try {
    // جلب كل المواعيد للطبيب الحالي
    const appointments = await prisma.appointment.findMany({
      where: { doctorId: user.id, isDeleted: false },
      include: {
        patient: { select: { id: true, fullName: true, email: true } },
        doctor: { include: { user: true } },
      },
      orderBy: { scheduledAt: "asc" },
    });
    const out = appointments.map((a) => ({
      id: a.id,
      patient: a.patient ? { id: a.patient.id, name: a.patient.fullName, email: a.patient.email } : null,
      doctor: a.doctor?.user ? { id: a.doctor.id, name: a.doctor.user.fullName } : null,
      scheduledAt: a.scheduledAt,
      status: a.status,
      reason: a.reason,
      createdAt: a.createdAt
    }));
    logAudit({ event: "doctor_appointments_listed", userId: user.id, ip: request.headers.get('x-forwarded-for'), details: { count: out.length } });
    return Response.json({ appointments: out }, { status: 200 });
  } catch (err) {
    logAudit({ event: "doctor_appointments_list_error", userId: user.id, ip: request.headers.get('x-forwarded-for'), details: { error: err.message } });
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}, ["doctor"]);
