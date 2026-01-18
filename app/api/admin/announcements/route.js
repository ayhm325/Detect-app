import prisma from "../../../../lib/prismaClient";
import { withRBAC } from "../../../../lib/auth/withRBAC";
import { rateLimit } from "../../../../lib/security/rateLimiter";
import { logAudit } from "../../../../lib/security/auditLogger";
import { serializeLocalizedMessage } from "../../../../lib/notifications";

export const POST = withRBAC(
  async (request, user) => {
    const rl = await rateLimit(request);
    if (rl.limited) {
      logAudit({
        event: "rate_limit_exceeded",
        userId: user.id,
        ip: request.headers.get("x-forwarded-for"),
        details: { endpoint: "POST /api/admin/announcements" },
      });
      return Response.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    try {
      const body = await request.json();
      const roles =
        Array.isArray(body?.roles) && body.roles.length
          ? body.roles
          : ["patient", "doctor"];
      const type = body?.type || "info";
      const message = body?.message;

      if (
        !message ||
        (typeof message !== "string" && typeof message !== "object")
      ) {
        return Response.json({ error: "missing_message" }, { status: 400 });
      }

      const users = await prisma.user.findMany({
        where: {
          role: { in: roles },
          isDeleted: false,
        },
        select: { id: true },
      });

      const msgStr = serializeLocalizedMessage({
        ...(typeof message === "string"
          ? { ar: message, en: message }
          : message),
        meta: { kind: "admin_announcement" },
      });

      // If the announcement is huge, avoid a single createMany call hitting limits by chunking.
      const chunkSize = 500;
      let created = 0;

      for (let i = 0; i < users.length; i += chunkSize) {
        const chunk = users.slice(i, i + chunkSize);
        const data = chunk.map((u) => ({
          userId: u.id,
          type,
          message: msgStr,
          isRead: false,
          isDeleted: false,
        }));
        const res = await prisma.notification.createMany({ data });
        created += res?.count || 0;
      }

      logAudit({
        event: "admin_announcement_broadcast",
        userId: user.id,
        ip: request.headers.get("x-forwarded-for"),
        details: { roles, created },
      });
      return Response.json({ success: true, created });
    } catch (error) {
      logAudit({
        event: "admin_announcement_error",
        userId: user?.id,
        ip: request.headers.get("x-forwarded-for"),
        details: { error: error.message },
      });
      return Response.json({ error: "server_error" }, { status: 500 });
    }
  },
  ["admin"],
);

// Optional: preview/list could be added later; keeping spec minimal.
