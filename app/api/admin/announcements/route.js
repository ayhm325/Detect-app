/**
 * API Route: POST /api/admin/announcements
 * الوصف:
 *  - إرسال إعلان إداري جماعي لمستخدمين حسب الأدوار
 *  - محمي بـ RBAC (للأدمن فقط)
 *  - محمي بـ Rate Limiting
 *  - يدعم الرسائل متعددة اللغات
 *  - يسجل جميع العمليات في Audit Log
 */

import prisma from "../../../../lib/prismaClient";
import { withRBAC } from "../../../../lib/auth/withRBAC";
import { rateLimit } from "../../../../lib/security/rateLimiter";
import { logAudit } from "../../../../lib/security/auditLogger";
import { serializeLocalizedMessage } from "../../../../lib/notifications";

/**
 * Handler POST
 * يتم لف الدالة بـ withRBAC للتأكد أن المستخدم يمتلك صلاحية admin
 */
export const POST = withRBAC(
  async (request, user) => {
    /**
     * =========================
     * 1) Rate Limiting
     * =========================
     * حماية الـ API من الإغراق (Spam / Abuse)
     */
    const rl = await rateLimit(request);

    if (rl.limited) {
      // تسجيل محاولة تجاوز الحد المسموح
      logAudit({
        event: "rate_limit_exceeded",
        userId: user.id,
        ip: request.headers.get("x-forwarded-for"),
        details: {
          endpoint: "POST /api/admin/announcements",
        },
      });

      return Response.json(
        { error: "Rate limit exceeded" },
        { status: 429 },
      );
    }

    try {
      /**
       * =========================
       * 2) قراءة وتحليل Body
       * =========================
       */
      const body = await request.json();

      /**
       * الأدوار المستهدفة:
       * - إذا تم إرسال roles صحيحة وغير فارغة نستخدمها
       * - غير ذلك الافتراضي: patient + doctor
       */
      const roles =
        Array.isArray(body?.roles) && body.roles.length > 0
          ? body.roles
          : ["patient", "doctor"];

      /**
       * نوع الإشعار (info / warning / ... إلخ)
       * القيمة الافتراضية: info
       */
      const type = body?.type || "info";

      /**
       * محتوى الرسالة:
       * - إما نص string
       * - أو كائن يحتوي لغات متعددة
       */
      const message = body?.message;

      /**
       * =========================
       * 3) التحقق من صحة البيانات
       * =========================
       */
      if (
        !message ||
        (typeof message !== "string" && typeof message !== "object")
      ) {
        return Response.json(
          { error: "missing_message" },
          { status: 400 },
        );
      }

      /**
       * =========================
       * 4) جلب المستخدمين المستهدفين
       * =========================
       * - حسب الأدوار
       * - تجاهل الحسابات المحذوفة
       */
      const users = await prisma.user.findMany({
        where: {
          role: { in: roles },
          isDeleted: false,
        },
        select: {
          id: true, // نحتاج فقط ID
        },
      });

      /**
       * =========================
       * 5) تجهيز الرسالة متعددة اللغات
       * =========================
       * - إذا كانت String: نستخدمها لكل اللغات
       * - إذا كانت Object: نمررها كما هي
       * - نضيف meta لتحديد نوع الإشعار
       */
      const serializedMessage = serializeLocalizedMessage({
        ...(typeof message === "string"
          ? { ar: message, en: message }
          : message),
        meta: {
          kind: "admin_announcement",
        },
      });

      /**
       * =========================
       * 6) إدخال الإشعارات على دفعات
       * =========================
       * لتجنب:
       * - ضغط على قاعدة البيانات
       * - تجاوز حدود createMany
       */
      const CHUNK_SIZE = 500;
      let created = 0;

      for (let i = 0; i < users.length; i += CHUNK_SIZE) {
        const chunk = users.slice(i, i + CHUNK_SIZE);

        const data = chunk.map((u) => ({
          userId: u.id,
          type,
          message: serializedMessage,
          isRead: false,
          isDeleted: false,
        }));

        const result = await prisma.notification.createMany({
          data,
        });

        created += result?.count || 0;
      }

      /**
       * =========================
       * 7) Audit Log للنجاح
       * =========================
       */
      logAudit({
        event: "admin_announcement_broadcast",
        userId: user.id,
        ip: request.headers.get("x-forwarded-for"),
        details: {
          roles,
          created,
        },
      });

      return Response.json({
        success: true,
        created,
      });
    } catch (error) {
      /**
       * =========================
       * 8) Audit Log للأخطاء
       * =========================
       */
      logAudit({
        event: "admin_announcement_error",
        userId: user?.id,
        ip: request.headers.get("x-forwarded-for"),
        details: {
          error: error?.message,
        },
      });

      return Response.json(
        { error: "server_error" },
        { status: 500 },
      );
    }
  },
  /**
   * الأدوار المسموح لها باستدعاء هذا الـ API
   */
  ["admin"],
);

/**
 * ملاحظة:
 * يمكن لاحقًا إضافة:
 * - GET: لمعاينة الإعلانات
 * - DELETE: لإلغاء إعلان
 * - Pagination / Preview
 */
