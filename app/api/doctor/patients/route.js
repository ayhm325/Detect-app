import { withRBAC } from "../../../../lib/auth/withRBAC";
import prisma from "../../../../lib/prismaClient";
import { rateLimit } from "../../../../lib/security/rateLimiter";
import { logAudit } from "../../../../lib/security/auditLogger";

// GET /api/doctor/patients
export const GET = withRBAC(async (request, user) => {
  const rl = await rateLimit(request);
  if (rl.limited) {
    logAudit({ event: "rate_limit_exceeded", userId: user.id, ip: request.headers.get('x-forwarded-for'), details: { endpoint: "GET /api/doctor/patients" } });
    return Response.json({ error: "Rate limit exceeded" }, { status: 429 });
  }
  try {
    // جلب المرضى النشطين المرتبطين بالطبيب الحالي فقط
    const patients = await prisma.patient.findMany({
      where: { status: 'active', doctorId: user.id },
      include: {
        medicalRecords: {
          where: { doctorId: user.id },
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            id: true,
            doctorNotes: true,
            createdAt: true,
          },
        },
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            createdAt: true,
            isActive: true,
          },
        },
      },
      orderBy: { fullName: 'asc' },
    });

    const shaped = patients.map((p) => {
      const latest = p.medicalRecords && p.medicalRecords[0] ? p.medicalRecords[0] : null;
      // Explicit field for UI: doctor-authored diagnosis/notes (latest for this doctor)
      const latestDoctorDiagnosis = latest?.doctorNotes ? String(latest.doctorNotes) : "";
      const diagnosisUpdatedAt = latest?.createdAt ? latest.createdAt : null;

      // Avoid leaking relation details by default; UI should use explicit fields
      // eslint-disable-next-line no-unused-vars
      const { medicalRecords, ...rest } = p;
      return {
        ...rest,
        latestDoctorDiagnosis,
        diagnosisUpdatedAt,
      };
    });
    logAudit({ event: "doctor_patients_listed", userId: user.id, ip: request.headers.get('x-forwarded-for'), details: { count: patients.length } });
    return Response.json(shaped);
  } catch (error) {
    logAudit({ event: "doctor_patients_list_error", userId: user.id, ip: request.headers.get('x-forwarded-for'), details: { error: error.message } });
    return Response.json({ error: "Internal error" }, { status: 500 });
  }
}, ["doctor"]);
