/**
 * API Route
 * GET /api/admin/dashboard-stats
 *
 * الغرض:
 *  - إرجاع إحصائيات لوحة تحكم الأدمن
 *  - محمي بـ RBAC (admin فقط)
 *  - محمي بـ Rate Limiting
 *  - جميع العمليات مسجلة في Audit Log
 */

import prisma from "../../../../lib/prismaClient";
import { withRBAC } from "../../../../lib/auth/withRBAC";
import { rateLimit } from "../../../../lib/security/rateLimiter";
import { logAudit } from "../../../../lib/security/auditLogger";
import { NextResponse } from "next/server";

/**
 * =========================
 * GET Handler
 * =========================
 * يتم تغليف الدالة بـ withRBAC لضمان أن المستخدم يمتلك دور admin
 */
export const GET = withRBAC(
  async (request, user) => {
    /**
     * =========================
     * 1) Rate Limiting
     * =========================
     * حماية الـ API من الطلبات المتكررة أو الهجمات
     */
    const rl = await rateLimit(request);

    if (rl.limited) {
      // تسجيل محاولة تجاوز الحد المسموح
      logAudit({
        event: "rate_limit_exceeded",
        userId: user.id,
        ip: request.headers.get("x-forwarded-for"),
        details: {
          endpoint: "GET /api/admin/dashboard-stats",
        },
      });

      return NextResponse.json(
        { error: "Rate limit exceeded" },
        { status: 429 },
      );
    }

    try {
      /**
       * =========================
       * 2) حساب بداية ونهاية اليوم الحالي
       * =========================
       * تُستخدم لحساب عدد السجلات (Scans) التي تمت اليوم فقط
       */
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);

      const endOfToday = new Date();
      endOfToday.setHours(23, 59, 59, 999);

      /**
       * =========================
       * 3) جلب الإحصائيات بالتوازي
       * =========================
       * Promise.all لتحسين الأداء وتقليل زمن الاستجابة
       */
      const [
        totalUsers,   // العدد الكلي للمستخدمين
        doctors,      // عدد المستخدمين بدور doctor
        patients,     // عدد المستخدمين بدور patient
        todayScans,   // عدد الفحوصات/السجلات الطبية اليوم
        totalScans,   // العدد الكلي للفحوصات
      ] = await Promise.all([
        prisma.user.count(),

        prisma.user.count({
          where: { role: "doctor" },
        }),

        prisma.user.count({
          where: { role: "patient" },
        }),

        prisma.medicalRecord.count({
          where: {
            createdAt: {
              gte: startOfToday,
              lte: endOfToday,
            },
          },
        }),

        prisma.medicalRecord.count(),
      ]);

      /**
       * =========================
       * 4) تسجيل العملية في Audit Log
       * =========================
       * لتتبع استخدام الأدمن للـ Dashboard
       */
      logAudit({
        event: "admin_dashboard_stats",
        userId: user.id,
        ip: request.headers.get("x-forwarded-for"),
        details: {
          totalUsers,
          doctors,
          patients,
          todayScans,
          totalScans,
        },
      });

      /**
       * =========================
       * 5) إرجاع البيانات للواجهة
       * =========================
       */
      return NextResponse.json({
        totalUsers,
        doctors,
        patients,
        todayScans,
        totalScans,
      });
    } catch (error) {
      /**
       * =========================
       * 6) التعامل مع الأخطاء
       * =========================
       * - تسجيل الخطأ في Audit Log
       * - عدم تسريب تفاصيل تقنية للمستخدم
       */
      logAudit({
        event: "admin_dashboard_stats_error",
        userId: user.id,
        ip: request.headers.get("x-forwarded-for"),
        details: {
          error: error?.message,
        },
      });

      return NextResponse.json(
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
