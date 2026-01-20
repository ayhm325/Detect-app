import { withRBAC } from "../../../../../lib/auth/withRBAC.js";
import prisma from "../../../../../lib/prismaClient";
import { rateLimit } from "../../../../../lib/security/rateLimiter";
import { logAudit } from "../../../../../lib/security/auditLogger";

/**
 * DELETE /api/admin/users/[id]
 * - الحذف الفيزيائي معطل لتجنب مشاكل العلاقات (FK)
 * - استخدام PATCH لتفعيل/تعطيل المستخدم
 */
export const DELETE = withRBAC(
  async (request, user) => {
    const rl = await rateLimit(request);
    if (rl.limited) {
      logAudit({
        event: "rate_limit_exceeded",
        userId: user.id,
        ip: request.headers.get("x-forwarded-for"),
        details: { endpoint: "DELETE /api/admin/users/[id]" },
      });
      return Response.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    logAudit({
      event: "admin_user_delete_attempt_disabled",
      userId: user.id,
      ip: request.headers.get("x-forwarded-for"),
      details: { note: "Deletes disabled; use PATCH to toggle active/banned" },
    });

    return Response.json(
      {
        error:
          "Deletes are disabled. Use PATCH /api/admin/users/:id to toggle active/banned.",
      },
      { status: 405 },
    );
  },
  ["admin"]
);

/**
 * PATCH /api/admin/users/[id]
 * - تفعيل أو تعطيل المستخدم
 * - يعكس الحالة في جدول User وأيضاً في Doctor/Patient إذا كان مرتبط
 */
export const PATCH = withRBAC(
  async (request, user) => {
    const rl = await rateLimit(request);
    if (rl.limited) {
      logAudit({
        event: "rate_limit_exceeded",
        userId: user.id,
        ip: request.headers.get("x-forwarded-for"),
        details: { endpoint: "PATCH /api/admin/users/[id]" },
      });
      return Response.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    try {
      // =========================
      // استخراج معرف المستخدم من URL
      // =========================
      const url = new URL(request.url);
      const id = url.pathname.split("/").pop();
      if (!id) {
        return Response.json({ error: "User ID required" }, { status: 400 });
      }

      // =========================
      // قراءة body لتحديد isActive
      // =========================
      const body = await request.json().catch(() => ({}));
      let isActive = body.isActive;
      if (typeof isActive === "undefined" && typeof body.status === "string") {
        isActive = body.status === "active";
      }

      if (typeof isActive !== "boolean") {
        return Response.json(
          { error: "isActive (boolean) is required in body" },
          { status: 400 }
        );
      }

      // =========================
      // التحقق من وجود Doctor/Patient مرتبط
      // =========================
      const doctor = await prisma.doctor.findUnique({ where: { userId: id } });
      const patient = await prisma.patient.findUnique({ where: { userId: id } });

      // =========================
      // تحديث الجداول في معاملة واحدة لضمان الاتساق
      // =========================
      const updates = [];
      updates.push(prisma.user.update({ where: { id }, data: { isActive } }));

      if (doctor) {
        // استخدم status enum للطبيب: active/banned
        updates.push(
          prisma.doctor.update({
            where: { userId: id },
            data: { status: isActive ? "active" : "banned" },
          })
        );
      }

      if (patient) {
        // استخدم status enum للمريض: active/suspended
        updates.push(
          prisma.patient.update({
            where: { userId: id },
            data: { status: isActive ? "active" : "suspended" },
          })
        );
      }

      // تنفيذ التحديثات ضمن معاملة
      await prisma.$transaction(updates);

      // =========================
      // تسجيل النشاط
      // =========================
      logAudit({
        event: "admin_user_toggled_active",
        userId: user.id,
        ip: request.headers.get("x-forwarded-for"),
        details: { targetUserId: id, isActive },
      });

      // =========================
      // إعادة المستخدم بعد التحديث مع إخفاء كلمة المرور
      // =========================
      const updatedUser = await prisma.user.findUnique({
        where: { id },
        include: { doctor: true, patient: true },
      });
      const { password: _pw, ...safeUser } = updatedUser || {};

      return Response.json({ success: true, user: safeUser });
    } catch (error) {
      logAudit({
        event: "admin_user_toggle_error",
        userId: user.id,
        ip: request.headers.get("x-forwarded-for"),
        details: { error: error.message },
      });
      return Response.json({ error: "Internal error" }, { status: 500 });
    }
  },
  ["admin"]
);
