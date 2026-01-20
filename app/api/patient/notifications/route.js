import { NextResponse } from "next/server";
import prisma from "../../../../lib/prismaClient.js";
import { withRBAC } from "../../../../lib/auth/withRBAC";
import { rateLimit } from "../../../../lib/security/rateLimiter";
import { logAudit } from "../../../../lib/security/auditLogger";
import { getNotificationCache, setNotificationCache, clearNotificationCache } from "../../../../lib/cache/notificationCache";


// دالة مساعدة لتقليل التكرار: تحقق من rateLimit وسجل Audit
async function checkRateLimitAndAudit(request, user, endpoint) {
  const rl = await rateLimit(request);
  if (rl.limited) {
    logAudit({
      event: "rate_limit_exceeded",
      userId: user.id,
      ip: request.headers.get("x-forwarded-for"),
      details: { endpoint },
    });
    return true;
  }
  return false;
}

export const HEAD = withRBAC(
  async (request, user) => {
    if (await checkRateLimitAndAudit(request, user, "HEAD /api/patient/notifications")) {
      return new Response(null, {
        status: 429,
        headers: {
          "X-Unread-Count": "0",
          "Access-Control-Expose-Headers": "X-Unread-Count"
        },
      });
    }
    try {
      // استخدم cache إذا متاح
      let unread = await getNotificationCache(user.id);
      if (typeof unread !== "number") {
        unread = await prisma.notification.count({
          where: { userId: user.id, isRead: false, isDeleted: false },
        });
        setNotificationCache(user.id, unread);
      }
      return new Response(null, {
        status: 200,
        headers: {
          "X-Unread-Count": String(unread),
          "Access-Control-Expose-Headers": "X-Unread-Count"
        },
      });
    } catch (e) {
      logAudit({
        event: "patient_notifications_unread_error",
        userId: user.id,
        ip: request.headers.get("x-forwarded-for"),
        details: { error: e?.message },
      });
      return new Response(null, {
        status: 200,
        headers: {
          "X-Unread-Count": "0",
          "Access-Control-Expose-Headers": "X-Unread-Count"
        },
      });
    }
  },
  ["patient"],
);

export const GET = withRBAC(
  async (request, user) => {
    if (await checkRateLimitAndAudit(request, user, "GET /api/patient/notifications")) {
      return NextResponse.json({ error: "rate_limited" }, { status: 429 });
    }
    try {
      // دعم pagination
      const url = new URL(request.url);
      const cursor = url.searchParams.get("cursor");
      const take = Math.min(Number(url.searchParams.get("take")) || 20, 100);
      let where = { userId: user.id, isDeleted: false };
      let notifications, nextCursor;
      if (cursor) {
        notifications = await prisma.notification.findMany({
          where,
          orderBy: { createdAt: "desc" },
          take: take + 1,
          cursor: { id: cursor },
          skip: 1,
        });
      } else {
        notifications = await prisma.notification.findMany({
          where,
          orderBy: { createdAt: "desc" },
          take: take + 1,
        });
      }
      if (notifications.length > take) {
        nextCursor = notifications[take].id;
        notifications = notifications.slice(0, take);
      }
      logAudit({
        event: "patient_notifications_listed",
        userId: user.id,
        ip: request.headers.get("x-forwarded-for"),
        details: { count: notifications.length },
      });
      return NextResponse.json({ notifications, nextCursor }, { status: 200 });
    } catch (e) {
      logAudit({
        event: "patient_notifications_list_error",
        userId: user.id,
        ip: request.headers.get("x-forwarded-for"),
        details: { error: e?.message },
      });
      return NextResponse.json({ error: "server_error" }, { status: 500 });
    }
  },
  ["patient"],
);

export const PUT = withRBAC(
  async (request, user) => {
    if (await checkRateLimitAndAudit(request, user, "PUT /api/patient/notifications")) {
      return NextResponse.json({ error: "rate_limited" }, { status: 429 });
    }
    try {
      const id = request.nextUrl.searchParams.get("id");
      let body = {};
      try {
        body = await request.json();
      } catch {}

      const nextIsRead =
        typeof body?.isRead === "boolean" ? body.isRead : undefined;

      if (id) {
        const existing = await prisma.notification.findUnique({
          where: { id },
        });
        if (!existing || existing.userId !== user.id) {
          return NextResponse.json({ error: "not_found" }, { status: 404 });
        }
        const updated = await prisma.notification.update({
          where: { id },
          data: {
            ...(typeof nextIsRead === "boolean" ? { isRead: nextIsRead, readAt: nextIsRead ? new Date() : null } : {}),
          },
        });
        clearNotificationCache(user.id);
        return NextResponse.json({ success: true, updated }, { status: 200 });
      }

      // Mark all as read (batch update)
      const result = await prisma.notification.updateMany({
        where: { userId: user.id, isDeleted: false, isRead: false },
        data: { isRead: true, readAt: new Date() },
      });
      clearNotificationCache(user.id);
      return NextResponse.json({ success: true, updatedCount: result.count }, { status: 200 });
    } catch (e) {
      logAudit({
        event: "patient_notifications_update_error",
        userId: user.id,
        ip: request.headers.get("x-forwarded-for"),
        details: { error: e?.message },
      });
      return NextResponse.json({ error: "server_error" }, { status: 500 });
    }
  },
  ["patient"],
);

export const DELETE = withRBAC(
  async (request, user) => {
    if (await checkRateLimitAndAudit(request, user, "DELETE /api/patient/notifications")) {
      return NextResponse.json({ error: "rate_limited" }, { status: 429 });
    }
    try {
      const id = request.nextUrl.searchParams.get("id");
      if (id) {
        const existing = await prisma.notification.findUnique({
          where: { id },
        });
        if (!existing || existing.userId !== user.id) {
          return NextResponse.json({ error: "not_found" }, { status: 404 });
        }
        await prisma.notification.update({
          where: { id },
          data: { isDeleted: true, archivedAt: new Date() },
        });
        clearNotificationCache(user.id);
        return NextResponse.json({ success: true }, { status: 200 });
      }

      // batch soft delete + archive
      const result = await prisma.notification.updateMany({
        where: { userId: user.id, isDeleted: false },
        data: { isDeleted: true, archivedAt: new Date() },
      });
      clearNotificationCache(user.id);
      return NextResponse.json({ success: true, deletedCount: result.count }, { status: 200 });
    } catch (e) {
      logAudit({
        event: "patient_notifications_delete_error",
        userId: user.id,
        ip: request.headers.get("x-forwarded-for"),
        details: { error: e?.message },
      });
      return NextResponse.json({ error: "server_error" }, { status: 500 });
    }
  },
  ["patient"],
);
