import prisma from "../../../../lib/prismaClient";
import { withRBAC } from "../../../../lib/auth/withRBAC";
import { rateLimit } from "../../../../lib/security/rateLimiter";
import { logAudit } from "../../../../lib/security/auditLogger";

// GET /api/admin/notifications-unread
export const GET = withRBAC(
  async (request, user) => {
    const rl = await rateLimit(request);
    if (rl.limited) {
      logAudit({
        event: "rate_limit_exceeded",
        userId: user.id,
        ip: request.headers.get("x-forwarded-for"),
        details: { endpoint: "GET /api/admin/notifications-unread" },
      });
      return Response.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    try {
      const [unread, pendingDoctorApprovals, pendingDoctorChangeRequests] =
        await Promise.all([
          prisma.notification.count({
            where: {
              userId: user.id,
              isRead: false,
              isDeleted: false,
            },
          }),
          prisma.doctor.count({ where: { status: "pending" } }),
          prisma.changeRequest.count({
            where: {
              type: "doctor_change",
              status: "pending",
              isDeleted: false,
            },
          }),
        ]);

      const badge =
        unread + pendingDoctorApprovals + pendingDoctorChangeRequests;
      return Response.json({ unread, badge });
    } catch (error) {
      logAudit({
        event: "admin_notifications_unread_error",
        userId: user.id,
        ip: request.headers.get("x-forwarded-for"),
        details: { error: error?.message },
      });
      return Response.json({ error: "Internal error" }, { status: 500 });
    }
  },
  ["admin"],
);
