import prisma from "../../../../lib/prismaClient";
import { withRBAC } from "../../../../lib/auth/withRBAC";
import { rateLimit } from "../../../../lib/security/rateLimiter";
import { logAudit } from "../../../../lib/security/auditLogger";

/* ============================================================================
   GET /api/admin/notifications-unread
   - جلب عدد الإشعارات غير المقروءة
   - حساب Badge للأدمن: مجموع الإشعارات + طلبات موافقة الأطباء + طلبات تغيير الطبيب المعلقة
============================================================================ */
export const GET = withRBAC(
  async (request, user) => {
    // =========================
    // التحكم بعدد الطلبات (Rate Limiting)
    // =========================
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
      // =========================
      // جلب البيانات بالتوازي لتحسين الأداء
      // =========================
      const [unread, pendingDoctorApprovals, pendingDoctorChangeRequests] =
        await Promise.all([
          // عدد الإشعارات غير المقروءة للأدمن الحالي
          prisma.notification.count({
            where: {
              userId: user.id,
              isRead: false,
              isDeleted: false,
            },
          }),

          // عدد الأطباء المعلقين (في انتظار الموافقة)
          prisma.doctor.count({
            where: { status: "pending" },
          }),

          // عدد طلبات تغيير الطبيب المعلقة
          prisma.changeRequest.count({
            where: {
              type: "doctor_change",
              status: "pending",
              isDeleted: false,
            },
          }),
        ]);

      // مجموع "Badge" للأدمن
      const badge = unread + pendingDoctorApprovals + pendingDoctorChangeRequests;

      return Response.json({ unread, badge });
    } catch (error) {
      // تسجيل أي خطأ في سجل التدقيق
      logAudit({
        event: "admin_notifications_unread_error",
        userId: user.id,
        ip: request.headers.get("x-forwarded-for"),
        details: { error: error?.message },
      });

      return Response.json({ error: "Internal error" }, { status: 500 });
    }
  },
  ["admin"], // صلاحية الوصول: الأدمن فقط
);
