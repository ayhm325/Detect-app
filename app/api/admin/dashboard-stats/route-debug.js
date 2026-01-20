/**
 * API Route (Debug Only)
 * GET /api/admin/dashboard-stats/route-debug
 *
 * الغرض:
 *  - جلب إحصائيات لوحة تحكم الأدمن
 *  - endpoint مخصص للتطوير فقط (غير متاح في production)
 *  - محمي بـ RBAC (admin فقط)
 *  - محمي بـ Rate Limiting
 *  - جميع العمليات مسجلة في Audit Log
 */

import prisma from "./prismaClient";
import { withRBAC } from "../../../../lib/auth/withRBAC";
import { rateLimit } from "../../../../lib/security/rateLimiter";
import { logAudit } from "../../../../lib/security/auditLogger";

/**
 * =========================
 * GET Handler
 * =========================
 * يتم لف الدالة بـ withRBAC لضمان أن المستخدم Admin
 */
export const GET = withRBAC(
  async (request, user) => {
    /**
     * =========================
     * 1) تعطيل الـ Endpoint في Production
     * =========================
     * هذا المسار مخصص للتطوير/debug فقط
     * لمنع تسريب بيانات حساسة في بيئة الإنتاج
     */
    if (process.env.NODE_ENV === "production") {
      return Response.json(
        { error: "Not Found" },
        { status: 404 },
      );
    }

    /**
     * =========================
     * 2) Rate Limiting
     * =========================
     * حماية المسار من الاستدعاءات المفرطة
     */
    const rl = await rateLimit(request);

    if (rl.limited) {
      // تسجيل محاولة تجاوز الحد المسموح
      logAudit({
        event: "rate_limit_exceeded",
        userId: user.id,
        ip: request.headers.get("x-forwarded-for"),
        details: {
          endpoint: "GET /api/admin/dashboard-stats/route-debug",
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
       * 3) جلب الإحصائيات الأساسية
       * =========================
       * يتم التنفيذ بالتوازي باستخدام Promise.all
       * لتحسين الأداء وتقليل زمن الاستجابة
       */
      const [
        totalUsers,     // عدد المستخدمين الكلي
        doctors,        // عدد الأطباء
        patients,       // عدد المرضى
        todayScans,     // عدد التحاليل المنفذة اليوم
        allUsers,       // جميع المستخدمين (Debug)
        allDoctors,     // جميع الأطباء (Debug)
        allPatients,    // جميع المرضى (Debug)
        allAnalysis,    // جميع التحاليل (Debug)
      ] = await Promise.all([
        // العدد الكلي للمستخدمين
        prisma.user.count(),

        // عدد المستخدمين بدور doctor
        prisma.user.count({
          where: { role: "doctor" },
        }),

        // عدد المستخدمين بدور patient
        prisma.user.count({
          where: { role: "patient" },
        }),

        // عدد التحاليل التي تمت اليوم
        prisma.analysis.count({
          where: {
            createdAt: {
              gte: new Date(
                new Date().setHours(0, 0, 0, 0),
              ),
            },
          },
        }),

        /**
         * =========================
         * بيانات Debug (حساسة)
         * =========================
         * لذلك يتم حمايتها:
         * - RBAC
         * - Environment Check
         */
        prisma.user.findMany({
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
            isActive: true,
            isDeleted: true,
            createdAt: true,
          },
        }),

        prisma.user.findMany({
          where: { role: "doctor" },
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
            isActive: true,
            isDeleted: true,
            createdAt: true,
          },
        }),

        prisma.user.findMany({
          where: { role: "patient" },
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
            isActive: true,
            isDeleted: true,
            createdAt: true,
          },
        }),

        prisma.analysis.findMany(),
      ]);

      /**
       * =========================
       * 4) تسجيل العملية في Audit Log
       * =========================
       * لتتبع استخدام الأدمن للمسارات الحساسة
       */
      logAudit({
        event: "admin_dashboard_stats_debug",
        userId: user.id,
        ip: request.headers.get("x-forwarded-for"),
        details: {
          totalUsers,
          doctors,
          patients,
          todayScans,
        },
      });

      /**
       * =========================
       * 5) إرجاع البيانات
       * =========================
       */
      return Response.json({
        totalUsers,
        doctors,
        patients,
        todayScans,
        debug: {
          allUsers,
          allDoctors,
          allPatients,
          allAnalysis,
        },
      });
    } catch (error) {
      /**
       * =========================
       * 6) تسجيل الخطأ
       * =========================
       * لا يتم تسريب تفاصيل تقنية للمستخدم
       */
      logAudit({
        event: "admin_dashboard_stats_debug_error",
        userId: user.id,
        ip: request.headers.get("x-forwarded-for"),
        details: {
          error: error?.message,
        },
      });

      return Response.json(
        { error: "حدث خطأ أثناء جلب الإحصائيات" },
        { status: 500 },
      );
    }
  },

  /**
   * =========================
   * الأدوار المسموح لها
   * =========================
   */
  ["admin"],
);
