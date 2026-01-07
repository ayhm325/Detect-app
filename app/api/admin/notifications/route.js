import prisma from "../../../../lib/prismaClient";
import { NextResponse } from 'next/server';
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

export const PUT = withRBAC(async (request, user) => {
  const rl = await rateLimit(request);
  if (rl.limited) {
    logAudit({ event: "rate_limit_exceeded", userId: user.id, ip: request.headers.get("x-forwarded-for"), details: { endpoint: "PUT /api/admin/notifications" } });
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  try {
    const id = request.nextUrl.searchParams.get("id");
    let body = {};
    try { body = await request.json(); } catch {}

    const nextIsRead = typeof body?.isRead === 'boolean' ? body.isRead : undefined;

    if (id) {
      const existing = await prisma.notification.findUnique({ where: { id } });
      if (!existing || existing.userId !== user.id) {
        return NextResponse.json({ error: 'not_found' }, { status: 404 });
      }
      const updated = await prisma.notification.update({ where: { id }, data: { ...(typeof nextIsRead === 'boolean' ? { isRead: nextIsRead } : {}) } });
      return NextResponse.json({ success: true, updated }, { status: 200 });
    }

    // Mark all as read for this admin
    await prisma.notification.updateMany({ where: { userId: user.id, isDeleted: false, isRead: false }, data: { isRead: true } });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (e) {
    logAudit({ event: 'admin_notifications_update_error', userId: user.id, ip: request.headers.get('x-forwarded-for'), details: { error: e?.message } });
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}, ["admin"]);
