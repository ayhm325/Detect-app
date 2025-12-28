import { withRBAC } from "../../../../lib/auth/withRBAC";
import prisma from "../../../../lib/prismaClient";
import { rateLimit } from "../../../../lib/security/rateLimiter";
import { logAudit } from "../../../../lib/security/auditLogger";

// GET /api/doctor/patients
export const GET = withRBAC(async (request, user) => {
  const rl = rateLimit(request);
  if (rl.limited) {
    logAudit({ event: "rate_limit_exceeded", userId: user.id, ip: request.headers.get('x-forwarded-for'), details: { endpoint: "GET /api/doctor/patients" } });
    return Response.json({ error: "Rate limit exceeded" }, { status: 429 });
  }
  try {
    // جلب المرضى النشطين المرتبطين بالطبيب الحالي فقط
    const patients = await prisma.patient.findMany({
      where: { status: 'active', doctorId: user.id },
      include: { user: true },
      orderBy: { fullName: 'asc' },
    });
    logAudit({ event: "doctor_patients_listed", userId: user.id, ip: request.headers.get('x-forwarded-for'), details: { count: patients.length } });
    return Response.json(patients);
  } catch (error) {
    logAudit({ event: "doctor_patients_list_error", userId: user.id, ip: request.headers.get('x-forwarded-for'), details: { error: error.message } });
    return Response.json({ error: "Internal error" }, { status: 500 });
  }
}, ["doctor"]);
