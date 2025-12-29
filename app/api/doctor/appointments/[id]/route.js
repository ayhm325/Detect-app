import { NextResponse } from "next/server";
import prisma from "../../../../../lib/prismaClient";
import { withRBAC } from "../../../../../lib/auth/withRBAC";
import { rateLimit } from "../../../../../lib/security/rateLimiter";
import { logAudit } from "../../../../../lib/security/auditLogger";

export const DELETE = withRBAC(async (request, user, paramsArg) => {
  const rl = rateLimit(request);
  if (rl.limited) {
    logAudit({ event: "rate_limit_exceeded", userId: user.id, ip: request.headers.get('x-forwarded-for'), details: { endpoint: "DELETE /api/doctor/appointments/[id]" } });
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }
  try {
    const params = typeof paramsArg?.then === "function" ? await paramsArg : paramsArg;
    let id = params?.id;
    if (!id) {
      // Try to extract id from the URL (last segment)
      const urlParts = request.url.split("/");
      id = urlParts[urlParts.length - 1] || urlParts[urlParts.length - 2];
    }
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    // تحقق أن الطبيب هو صاحب الموعد
    const appt = await prisma.appointment.findUnique({ where: { id } });
    if (!appt || appt.doctorId !== user.id) return NextResponse.json({ error: "Appointment not found or unauthorized" }, { status: 404 });
    // حذف الموعد بشكل منطقي (soft delete)
    await prisma.appointment.update({ where: { id }, data: { isDeleted: true } });
    logAudit({ event: "doctor_appointment_deleted", userId: user.id, ip: request.headers.get('x-forwarded-for'), details: { appointmentId: id } });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    logAudit({ event: "doctor_appointment_delete_error", userId: user?.id, ip: request.headers.get('x-forwarded-for'), details: { error: err.message } });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}, ["doctor"]);
