import { withRBAC } from "../../../../../lib/auth/withRBAC.js";
import prisma from "../../../../../lib/prismaClient";
import { rateLimit } from "../../../../../lib/security/rateLimiter";
import { logAudit } from "../../../../../lib/security/auditLogger";

// Note: physical deletes are deprecated in favor of toggling `isActive`.
// DELETE is intentionally disabled to avoid FK problems; use PATCH to toggle active/banned.
export const DELETE = withRBAC(async (request, user) => {
  const rl = await rateLimit(request);
  if (rl.limited) {
    logAudit({ event: "rate_limit_exceeded", userId: user.id, ip: request.headers.get('x-forwarded-for'), details: { endpoint: "DELETE /api/admin/users/[id]" } });
    return Response.json({ error: "Rate limit exceeded" }, { status: 429 });
  }
  logAudit({ event: "admin_user_delete_attempt_disabled", userId: user.id, ip: request.headers.get('x-forwarded-for'), details: { note: 'Deletes disabled; use PATCH to toggle active/banned' } });
  return Response.json({ error: "Deletes are disabled. Use PATCH /api/admin/users/:id to toggle active/banned." }, { status: 405 });
}, ["admin"]);

export const PATCH = withRBAC(async (request, user) => {
  const rl = await rateLimit(request);
  if (rl.limited) {
    logAudit({ event: "rate_limit_exceeded", userId: user.id, ip: request.headers.get('x-forwarded-for'), details: { endpoint: "PATCH /api/admin/users/[id]" } });
    return Response.json({ error: "Rate limit exceeded" }, { status: 429 });
  }
  try {
    const url = new URL(request.url);
    const id = url.pathname.split("/").pop();
    if (!id) {
      return Response.json({ error: "User ID required" }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    let isActive = body.isActive;
    if (typeof isActive === 'undefined' && typeof body.status === 'string') {
      isActive = body.status === 'active';
    }
    if (typeof isActive !== 'boolean') {
      return Response.json({ error: 'isActive (boolean) is required in body' }, { status: 400 });
    }

    const doctor = await prisma.doctor.findUnique({ where: { userId: id } });
    const patient = await prisma.patient.findUnique({ where: { userId: id } });

    const updates = [];
    updates.push(prisma.user.update({ where: { id }, data: { isActive } }));
    if (doctor) {
      // DoctorStatus enum uses 'banned' for disabled accounts — use banned for doctors
      updates.push(prisma.doctor.update({ where: { userId: id }, data: { status: isActive ? 'active' : 'banned' } }));
    }
    if (patient) {
      updates.push(prisma.patient.update({ where: { userId: id }, data: { status: isActive ? 'active' : 'suspended' } }));
    }

    const results = await prisma.$transaction(updates);
    logAudit({ event: "admin_user_toggled_active", userId: user.id, ip: request.headers.get('x-forwarded-for'), details: { targetUserId: id, isActive } });

    const updatedUser = await prisma.user.findUnique({ where: { id }, include: { doctor: true, patient: true } });
    const { password: _pw, ...safe } = updatedUser || {};
    return Response.json({ success: true, user: safe });
  } catch (error) {
    logAudit({ event: "admin_user_toggle_error", userId: user.id, ip: request.headers.get('x-forwarded-for'), details: { error: error.message } });
    return Response.json({ error: "Internal error" }, { status: 500 });
  }
}, ["admin"]);
