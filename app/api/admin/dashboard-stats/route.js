import prisma from "../../../../lib/prismaClient";
import { withRBAC } from "../../../../lib/auth/withRBAC";
import { rateLimit } from "../../../../lib/security/rateLimiter";
import { logAudit } from "../../../../lib/security/auditLogger";
import { NextResponse } from "next/server";

export const GET = withRBAC(
  async (request, user) => {
    const rl = await rateLimit(request);
    if (rl.limited) {
      logAudit({
        event: "rate_limit_exceeded",
        userId: user.id,
        ip: request.headers.get("x-forwarded-for"),
        details: { endpoint: "GET /api/admin/dashboard-stats" },
      });
      return NextResponse.json(
        { error: "Rate limit exceeded" },
        { status: 429 },
      );
    }

    try {
      // تحديد بداية ونهاية اليوم
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      const endOfToday = new Date();
      endOfToday.setHours(23, 59, 59, 999);

      const [totalUsers, doctors, patients, todayScans, totalScans] =
        await Promise.all([
          prisma.user.count(),
          prisma.user.count({ where: { role: "doctor" } }),
          prisma.user.count({ where: { role: "patient" } }),
          prisma.medicalRecord.count({
            where: { createdAt: { gte: startOfToday, lte: endOfToday } },
          }),
          prisma.medicalRecord.count(),
        ]);

      logAudit({
        event: "admin_dashboard_stats",
        userId: user.id,
        ip: request.headers.get("x-forwarded-for"),
        details: { totalUsers, doctors, patients, todayScans, totalScans },
      });
      return NextResponse.json({
        totalUsers,
        doctors,
        patients,
        todayScans,
        totalScans,
      });
    } catch (error) {
      logAudit({
        event: "admin_dashboard_stats_error",
        userId: user.id,
        ip: request.headers.get("x-forwarded-for"),
        details: { error: error?.message },
      });
      return NextResponse.json(
        { error: "حدث خطأ أثناء جلب الإحصائيات" },
        { status: 500 },
      );
    }
  },
  ["admin"],
);
