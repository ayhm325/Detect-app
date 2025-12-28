import { withRBAC } from "../../../../lib/auth/withRBAC";
import prisma from "../../../../lib/prismaClient";
import { rateLimit } from "../../../../lib/security/rateLimiter";
import { logAudit } from "../../../../lib/security/auditLogger";

// GET /api/doctor/results
export const GET = withRBAC(async (request, user) => {
  const rl = rateLimit(request);
  if (rl.limited) {
    logAudit({ event: "rate_limit_exceeded", userId: user.id, ip: request.headers.get('x-forwarded-for'), details: { endpoint: "GET /api/doctor/results" } });
    return Response.json({ error: "Rate limit exceeded" }, { status: 429 });
  }
  try {
    // جلب كل السجلات الطبية للمرضى المرتبطين بالطبيب الحالي
    const records = await prisma.medicalRecord.findMany({
      where: { doctorId: user.id },
      include: {
        patient: { select: { id: true, fullName: true, email: true } },
        doctor: { include: { user: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    const out = records.map((r) => ({
      id: r.id,
      title: r.title || "Chest X-Ray",
      imageUrl: r.imageUrl || null,
      aiResult: r.aiResult || null,
      confidenceScore: r.confidenceScore || null,
      createdAt: r.createdAt,
      patient: r.patient ? { id: r.patient.id, name: r.patient.fullName, email: r.patient.email } : null,
      doctor: r.doctor?.user ? { id: r.doctor.id, name: r.doctor.user.fullName } : null
    }));
    logAudit({ event: "doctor_results_viewed", userId: user.id, ip: request.headers.get('x-forwarded-for'), details: { count: out.length } });
    return Response.json({ records: out }, { status: 200 });
  } catch (err) {
    logAudit({ event: "doctor_results_view_error", userId: user.id, ip: request.headers.get('x-forwarded-for'), details: { error: err.message } });
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}, ["doctor"]);
