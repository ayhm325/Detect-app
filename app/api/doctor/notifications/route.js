import { NextResponse } from "next/server";
import prisma from "../../../../lib/prismaClient.js";
import { withRBAC } from "../../../../lib/auth/withRBAC";
import { rateLimit } from "../../../../lib/security/rateLimiter";
import { logAudit } from "../../../../lib/security/auditLogger";

export const HEAD = withRBAC(
  async (request, user) => {
    const rl = await rateLimit(request);
    if (rl.limited) {
      logAudit({
        event: "rate_limit_exceeded",
        userId: user.id,
        ip: request.headers.get("x-forwarded-for"),
        details: { endpoint: "HEAD /api/doctor/notifications" },
      });
      return new Response(null, {
        status: 429,
        headers: { "X-Unread-Count": "0" },
      });
    }
    try {
      const unread = await prisma.notification.count({
        where: { userId: user.id, isRead: false, isDeleted: false },
      });
      return new Response(null, {
        status: 200,
        headers: { "X-Unread-Count": String(unread) },
      });
    } catch (e) {
      logAudit({
        event: "doctor_notifications_unread_error",
        userId: user.id,
        ip: request.headers.get("x-forwarded-for"),
        details: { error: e?.message },
      });
      return new Response(null, {
        status: 200,
        headers: { "X-Unread-Count": "0" },
      });
    }
  },
  ["doctor"],
);

export const GET = withRBAC(
  async (request, user) => {
    const rl = await rateLimit(request);
    if (rl.limited) {
      logAudit({
        event: "rate_limit_exceeded",
        userId: user.id,
        ip: request.headers.get("x-forwarded-for"),
        details: { endpoint: "GET /api/doctor/notifications" },
      });
      return NextResponse.json({ error: "rate_limited" }, { status: 429 });
    }
    try {
      const notifications = await prisma.notification.findMany({
        where: { userId: user.id, isDeleted: false },
        orderBy: { createdAt: "desc" },
        take: 200,
      });
      logAudit({
        event: "doctor_notifications_listed",
        userId: user.id,
        ip: request.headers.get("x-forwarded-for"),
        details: { count: notifications.length },
      });
      return NextResponse.json({ notifications }, { status: 200 });
    } catch (e) {
      logAudit({
        event: "doctor_notifications_list_error",
        userId: user.id,
        ip: request.headers.get("x-forwarded-for"),
        details: { error: e?.message },
      });
      return NextResponse.json({ error: "server_error" }, { status: 500 });
    }
  },
  ["doctor"],
);

export const PUT = withRBAC(
  async (request, user) => {
    const rl = await rateLimit(request);
    if (rl.limited) {
      logAudit({
        event: "rate_limit_exceeded",
        userId: user.id,
        ip: request.headers.get("x-forwarded-for"),
        details: { endpoint: "PUT /api/doctor/notifications" },
      });
      return NextResponse.json({ error: "rate_limited" }, { status: 429 });
    }
    try {
      const id = request.nextUrl.searchParams.get("id");
      if (id && typeof id !== "string") {
        return NextResponse.json(
          { error: "Invalid notification id" },
          { status: 400 },
        );
      }
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
            ...(typeof nextIsRead === "boolean" ? { isRead: nextIsRead } : {}),
          },
        });
        return NextResponse.json({ success: true, updated }, { status: 200 });
      }

      // Mark all as read
      await prisma.notification.updateMany({
        where: { userId: user.id, isDeleted: false, isRead: false },
        data: { isRead: true },
      });
      return NextResponse.json({ success: true }, { status: 200 });
    } catch (e) {
      logAudit({
        event: "doctor_notifications_update_error",
        userId: user.id,
        ip: request.headers.get("x-forwarded-for"),
        details: { error: e?.message },
      });
      return NextResponse.json({ error: "server_error" }, { status: 500 });
    }
  },
  ["doctor"],
);

export const DELETE = withRBAC(
  async (request, user) => {
    const rl = await rateLimit(request);
    if (rl.limited) {
      logAudit({
        event: "rate_limit_exceeded",
        userId: user.id,
        ip: request.headers.get("x-forwarded-for"),
        details: { endpoint: "DELETE /api/doctor/notifications" },
      });
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
          data: { isDeleted: true },
        });
        return NextResponse.json({ success: true }, { status: 200 });
      }

      await prisma.notification.updateMany({
        where: { userId: user.id, isDeleted: false },
        data: { isDeleted: true },
      });
      return NextResponse.json({ success: true }, { status: 200 });
    } catch (e) {
      logAudit({
        event: "doctor_notifications_delete_error",
        userId: user.id,
        ip: request.headers.get("x-forwarded-for"),
        details: { error: e?.message },
      });
      return NextResponse.json({ error: "server_error" }, { status: 500 });
    }
  },
  ["doctor"],
);
