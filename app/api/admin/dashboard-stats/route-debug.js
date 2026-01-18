import prisma from "./prismaClient";
import { withRBAC } from "../../../../lib/auth/withRBAC";
import { rateLimit } from "../../../../lib/security/rateLimiter";
import { logAudit } from "../../../../lib/security/auditLogger";

export const GET = withRBAC(
  async (request, user) => {
    if (process.env.NODE_ENV === "production") {
      return Response.json({ error: "Not Found" }, { status: 404 });
    }

    const rl = await rateLimit(request);
    if (rl.limited) {
      logAudit({
        event: "rate_limit_exceeded",
        userId: user.id,
        ip: request.headers.get("x-forwarded-for"),
        details: { endpoint: "GET /api/admin/dashboard-stats/route-debug" },
      });
      return Response.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    try {
      // جلب الإحصائيات
      const [
        totalUsers,
        doctors,
        patients,
        todayScans,
        allUsers,
        allDoctors,
        allPatients,
        allAnalysis,
      ] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { role: "doctor" } }),
        prisma.user.count({ where: { role: "patient" } }),
        prisma.analysis.count({
          where: {
            createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
          },
        }),
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

      logAudit({
        event: "admin_dashboard_stats_debug",
        userId: user.id,
        ip: request.headers.get("x-forwarded-for"),
        details: { totalUsers, doctors, patients, todayScans },
      });

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
      logAudit({
        event: "admin_dashboard_stats_debug_error",
        userId: user.id,
        ip: request.headers.get("x-forwarded-for"),
        details: { error: error?.message },
      });
      return Response.json(
        { error: "حدث خطأ أثناء جلب الإحصائيات" },
        { status: 500 },
      );
    }
  },
  ["admin"],
);
