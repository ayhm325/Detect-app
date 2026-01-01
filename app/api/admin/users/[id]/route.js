import { withRBAC } from "../../../../../lib/auth/withRBAC.js";
import prisma from "../../../../../lib/prismaClient";
import { rateLimit } from "../../../../../lib/security/rateLimiter";
import { logAudit } from "../../../../../lib/security/auditLogger";

export const DELETE = withRBAC(async (request, user) => {
  const rl = rateLimit(request);
  if (rl.limited) {
    logAudit({ event: "rate_limit_exceeded", userId: user.id, ip: request.headers.get('x-forwarded-for'), details: { endpoint: "DELETE /api/admin/users/[id]" } });
    return Response.json({ error: "Rate limit exceeded" }, { status: 429 });
  }
  try {
    const url = new URL(request.url);
    const id = url.pathname.split("/").pop();
    if (!id) {
      return Response.json({ error: "User ID required" }, { status: 400 });
    }
    const deleted = await prisma.user.delete({ where: { id } });
    logAudit({ event: "admin_user_deleted", userId: user.id, ip: request.headers.get('x-forwarded-for'), details: { deletedUserId: id } });
    return Response.json({ success: true });
  } catch (error) {
    logAudit({ event: "admin_user_delete_error", userId: user.id, ip: request.headers.get('x-forwarded-for'), details: { error: error.message } });
    return Response.json({ error: "Internal error" }, { status: 500 });
  }
}, ["admin"]);
