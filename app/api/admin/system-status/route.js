import os from "os";
import prisma from "../../../../lib/prismaClient";
import { withRBAC } from "../../../../lib/auth/withRBAC";
import { rateLimit } from "../../../../lib/security/rateLimiter";
import { logAudit } from "../../../../lib/security/auditLogger";

export const GET = withRBAC(
  async (request, user) => {
    const rl = await rateLimit(request);
    if (rl.limited) {
      logAudit({
        event: "rate_limit_exceeded",
        userId: user.id,
        ip: request.headers.get("x-forwarded-for"),
        details: { endpoint: "GET /api/admin/system-status" },
      });
      return Response.json({ error: "Rate limit exceeded" }, { status: 429 });
    }
    try {
      // مدة تشغيل الخادم بالثواني
      const uptimeSeconds = process.uptime();
      const uptimeHours = Math.floor(uptimeSeconds / 3600);
      const uptimeMinutes = Math.floor((uptimeSeconds % 3600) / 60);
      const uptime = `${uptimeHours}h ${uptimeMinutes}m`;

      // استهلاك الذاكرة
      const memoryUsage = process.memoryUsage();
      const usedMB = (memoryUsage.rss / 1024 / 1024).toFixed(1);
      const totalMB = (os.totalmem() / 1024 / 1024).toFixed(1);
      const memoryPercent =
        ((memoryUsage.rss / os.totalmem()) * 100).toFixed(1) + "%";

      // زمن الاستجابة (استعلام بسيط)
      const start = Date.now();
      await prisma.$queryRaw`SELECT 1`;
      const responseTime = `${Date.now() - start}ms`;

      // حجم قاعدة البيانات (PostgreSQL)
      const dbSizeResult = await prisma.$queryRawUnsafe(
        `SELECT pg_database_size(current_database()) as size`,
      );
      const dbSizeBytes = dbSizeResult?.[0]?.size || 0;
      // تحويل BigInt إلى Number بشكل آمن
      const dbSizeMB = (Number(dbSizeBytes) / 1024 / 1024).toFixed(2) + " MB";

      const payload = {
        serverUptime: uptime,
        responseTime,
        memoryUsage: `${usedMB}MB / ${totalMB}MB (${memoryPercent})`,
        dbSize: dbSizeMB,
      };

      logAudit({
        event: "admin_system_status_viewed",
        userId: user.id,
        ip: request.headers.get("x-forwarded-for"),
        details: payload,
      });
      return Response.json(payload);
    } catch (error) {
      logAudit({
        event: "admin_system_status_error",
        userId: user.id,
        ip: request.headers.get("x-forwarded-for"),
        details: { error: error?.message },
      });
      return Response.json(
        {
          error: "حدث خطأ أثناء جلب حالة النظام",
          ...(process.env.NODE_ENV !== "production"
            ? { details: String(error) }
            : {}),
        },
        { status: 500 },
      );
    }
  },
  ["admin"],
);
