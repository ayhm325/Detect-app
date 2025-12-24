import os from "os";
import prisma from "../dashboard-stats/prismaClient";

export async function GET() {
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
    const memoryPercent = ((memoryUsage.rss / os.totalmem()) * 100).toFixed(1) + "%";

    // زمن الاستجابة (استعلام بسيط)
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const responseTime = `${Date.now() - start}ms`;

    // حجم قاعدة البيانات (PostgreSQL)
    const dbSizeResult = await prisma.$queryRawUnsafe(
      `SELECT pg_database_size(current_database()) as size`
    );
    const dbSizeBytes = dbSizeResult?.[0]?.size || 0;
    // تحويل BigInt إلى Number بشكل آمن
    const dbSizeMB = (Number(dbSizeBytes) / 1024 / 1024).toFixed(2) + " MB";

    return Response.json({
      serverUptime: uptime,
      responseTime,
      memoryUsage: `${usedMB}MB / ${totalMB}MB (${memoryPercent})`,
      dbSize: dbSizeMB
    });
  } catch (error) {
    console.error("System Status API Error:", error);
    return Response.json({ error: "حدث خطأ أثناء جلب حالة النظام", details: String(error) }, { status: 500 });
  }
}
