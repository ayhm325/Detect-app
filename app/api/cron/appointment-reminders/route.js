import prisma from "../../../../lib/prismaClient";
import {
  createNotificationBestEffort,
  formatDateTimeForLocale,
} from "../../../../lib/notifications";

/**
 * التحقق من أن الطلب مصرح له باستخدام CRON_SECRET
 * - يدعم Authorization Header
 * - أو token في query string
 */
function isAuthorized(request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  // 1️⃣ التحقق من Authorization Header
  const authHeader =
    request.headers.get("authorization") ||
    request.headers.get("Authorization") ||
    "";

  if (
    authHeader.startsWith("Bearer ") &&
    authHeader.slice(7).trim() === secret
  ) {
    return true;
  }

  // 2️⃣ التحقق من token في query string
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get("token");
    if (token === secret) return true;
  } catch {
    // في حال كان URL غير صالح — نتجاهل
  }

  return false;
}

/**
 * تنفيذ منطق إرسال تذكيرات المواعيد
 * @param now الوقت الحالي (مُمرر لتسهيل الاختبار)
 */
async function runReminders({ now }) {
  const nowMs = now.getTime();

  /**
   * نوافذ التذكير:
   * - 1h: قبل الموعد بساعة تقريبًا
   * - 24h: قبل الموعد بيوم تقريبًا
   */
  const windows = [
    { key: "1h", fromMs: 55 * 60 * 1000, toMs: 65 * 60 * 1000 },
    { key: "24h", fromMs: 23 * 60 * 60 * 1000, toMs: 25 * 60 * 60 * 1000 },
  ];

  let created = 0;
  const details = [];

  for (const window of windows) {
    // حساب نطاق الوقت المطلوب
    const from = new Date(nowMs + window.fromMs);
    const to = new Date(nowMs + window.toMs);

    /**
     * جلب المواعيد:
     * - غير محذوفة
     * - حالتها scheduled
     * - تقع ضمن نافذة التذكير
     */
    const appointments = await prisma.appointment.findMany({
      where: {
        isDeleted: false,
        status: "scheduled",
        scheduledAt: {
          gte: from,
          lt: to,
        },
      },
      include: {
        patient: {
          select: {
            userId: true,
            fullName: true,
          },
        },
        doctor: {
          select: {
            userId: true,
            user: {
              select: { fullName: true },
            },
          },
        },
      },
    });

    for (const appt of appointments) {
      const patientUserId = appt?.patient?.userId;
      if (!patientUserId) continue;

      /**
       * 🛑 منع التكرار (Deduplication)
       * - لا نرسل نفس التذكير أكثر من مرة
       * - لكل appointment + window
       * - خلال آخر 30 ساعة
       */
      const dedupeSince = new Date(nowMs - 30 * 60 * 60 * 1000);

      const existingNotification =
        await prisma.notification.findFirst({
          where: {
            userId: patientUserId,
            isDeleted: false,
            createdAt: { gte: dedupeSince },
            AND: [
              { message: { contains: '"kind":"appointment_reminder"' } },
              { message: { contains: `"appointmentId":"${appt.id}"` } },
              { message: { contains: `"window":"${window.key}"` } },
            ],
          },
          select: { id: true },
        });

      if (existingNotification) continue;

      const doctorName = appt?.doctor?.user?.fullName || null;

      /**
       * إنشاء الإشعار (Best Effort)
       * - يدعم لغتين
       * - يحتوي meta لتتبع السبب
       */
      await createNotificationBestEffort(prisma, {
        userId: patientUserId,
        type: "info",
        message: {
          ar: `تذكير: لديك موعد${
            doctorName ? ` مع د. ${doctorName}` : ""
          } بتاريخ ${formatDateTimeForLocale(appt.scheduledAt, "ar")}.`,
          en: `Reminder: you have an appointment${
            doctorName ? ` with Dr. ${doctorName}` : ""
          } on ${formatDateTimeForLocale(appt.scheduledAt, "en")}.`,
          meta: {
            kind: "appointment_reminder",
            appointmentId: appt.id,
            window: window.key,
          },
        },
      });

      created += 1;
      details.push({
        appointmentId: appt.id,
        window: window.key,
        patientUserId,
      });
    }
  }

  return { created, details };
}

/**
 * GET endpoint
 * - يستخدم من CRON أو استدعاء يدوي
 */
export async function GET(request) {
  if (!isAuthorized(request)) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();
    const result = await runReminders({ now });

    return Response.json({
      ok: true,
      now: now.toISOString(),
      ...result,
    });
  } catch (error) {
    return Response.json(
      {
        ok: false,
        error: error?.message || "server_error",
      },
      { status: 500 },
    );
  }
}

/**
 * POST → يعاد توجيهه إلى GET
 * لتسهيل التكامل مع CRON providers
 */
export async function POST(request) {
  return GET(request);
}
