import prisma from "../../../../lib/prismaClient";
import { NextResponse } from "next/server";
import { withRBAC } from "../../../../lib/auth/withRBAC";
import { rateLimit } from "../../../../lib/security/rateLimiter";
import { logAudit } from "../../../../lib/security/auditLogger";

/* ============================================================================
   GET /api/admin/notifications
   - جلب آخر إشعارات الأدمن
   - بحد أقصى 50 إشعار
   - لا يجلب المحذوف (isDeleted = false)
============================================================================ */
export const GET = withRBAC(
  async (request, user) => {
    // =========================
    // Rate Limiting
    // =========================
    const rl = await rateLimit(request);
    if (rl.limited) {
      logAudit({
        event: "rate_limit_exceeded",
        userId: user.id,
        ip: request.headers.get("x-forwarded-for"),
        details: { endpoint: "GET /api/admin/notifications" },
      });
      return NextResponse.json(
        { error: "Rate limit exceeded" },
        { status: 429 },
      );
    }

    try {
      // جلب إشعارات الأدمن مرتبة من الأحدث للأقدم
      const notifications = await prisma.notification.findMany({
        where: {
          userId: user.id,      // الأدمن الحالي فقط
          isDeleted: false,     // تجاهل الإشعارات المحذوفة
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 50, // حماية من تحميل عدد كبير من السجلات
      });

      return NextResponse.json({ notifications });
    } catch (error) {
      // تسجيل الخطأ في سجل التدقيق
      logAudit({
        event: "admin_notifications_list_error",
        userId: user.id,
        ip: request.headers.get("x-forwarded-for"),
        details: { error: error?.message },
      });

      return NextResponse.json(
        { error: "Internal error" },
        { status: 500 },
      );
    }
  },
  ["admin"],
);

/* ============================================================================
   PUT /api/admin/notifications
   - حالتان:
     1) تحديث إشعار واحد (isRead)
     2) تعليم جميع إشعارات الأدمن كمقروءة
============================================================================ */
export const PUT = withRBAC(
  async (request, user) => {
    // =========================
    // Rate Limiting
    // =========================
    const rl = await rateLimit(request);
    if (rl.limited) {
      logAudit({
        event: "rate_limit_exceeded",
        userId: user.id,
        ip: request.headers.get("x-forwarded-for"),
        details: { endpoint: "PUT /api/admin/notifications" },
      });
      return NextResponse.json(
        { error: "rate_limited" },
        { status: 429 },
      );
    }

    try {
      // قراءة ID من query string (اختياري)
      const id = request.nextUrl.searchParams.get("id");

      // قراءة body إن وجد (بأمان)
      let body = {};
      try {
        body = await request.json();
      } catch {
        // body اختياري
      }

      // تحديد قيمة isRead الجديدة إن وُجدت
      const nextIsRead =
        typeof body?.isRead === "boolean" ? body.isRead : undefined;

      /* =========================
         تحديث إشعار واحد
      ========================= */
      if (id) {
        // التأكد أن الإشعار موجود ويخص هذا الأدمن
        const existing = await prisma.notification.findUnique({
          where: { id },
        });

        if (!existing || existing.userId !== user.id) {
          return NextResponse.json(
            { error: "not_found" },
            { status: 404 },
          );
        }

        // تحديث حالة القراءة فقط
        const updated = await prisma.notification.update({
          where: { id },
          data: {
            ...(typeof nextIsRead === "boolean"
              ? { isRead: nextIsRead }
              : {}),
          },
        });

        return NextResponse.json(
          { success: true, updated },
          { status: 200 },
        );
      }

      /* =========================
         تعليم جميع الإشعارات كمقروءة
      ========================= */
      await prisma.notification.updateMany({
        where: {
          userId: user.id,
          isDeleted: false,
          isRead: false,
        },
        data: {
          isRead: true,
        },
      });

      return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
      // تسجيل أي خطأ غير متوقع
      logAudit({
        event: "admin_notifications_update_error",
        userId: user.id,
        ip: request.headers.get("x-forwarded-for"),
        details: { error: error?.message },
      });

      return NextResponse.json(
        { error: "server_error" },
        { status: 500 },
      );
    }
  },
  ["admin"],
);
