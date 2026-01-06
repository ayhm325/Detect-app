import prisma from "../../../../lib/prismaClient";
import { withRBAC } from "../../../../lib/auth/withRBAC";
import { rateLimit } from "../../../../lib/security/rateLimiter";
import { logAudit } from "../../../../lib/security/auditLogger";

// GET /api/admin/notifications
export const GET = withRBAC(async (request, user) => {
  const rl = await rateLimit(request);
  if (rl.limited) {
    logAudit({
      event: "rate_limit_exceeded",
      userId: user.id,
      ip: request.headers.get("x-forwarded-for"),
      details: { endpoint: "GET /api/admin/notifications" },
    });
    return Response.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  try {
    const notifications = await prisma.notification.findMany({
      where: {
        userId: user.id,
        isDeleted: false,
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return Response.json({ notifications });
  } catch (error) {
    logAudit({
      event: "admin_notifications_list_error",
      userId: user.id,
      ip: request.headers.get("x-forwarded-for"),
      details: { error: error?.message },
    });
    return Response.json({ error: "Internal error" }, { status: 500 });
  }
}, ["admin"]);
