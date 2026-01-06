import prisma from "../../../../lib/prismaClient";
import { createNotificationBestEffort, formatDateTimeForLocale } from "../../../../lib/notifications";

function isAuthorized(request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  const auth = request.headers.get("authorization") || request.headers.get("Authorization") || "";
  if (auth.startsWith("Bearer ") && auth.slice(7).trim() === secret) return true;

  try {
    const url = new URL(request.url);
    const token = url.searchParams.get("token");
    if (token && token === secret) return true;
  } catch {
    // ignore
  }

  return false;
}

async function runReminders({ now }) {
  const nowMs = now.getTime();

  const windows = [
    { key: "1h", fromMs: 55 * 60 * 1000, toMs: 65 * 60 * 1000 },
    { key: "24h", fromMs: 23 * 60 * 60 * 1000, toMs: 25 * 60 * 60 * 1000 },
  ];

  let created = 0;
  const details = [];

  for (const w of windows) {
    const from = new Date(nowMs + w.fromMs);
    const to = new Date(nowMs + w.toMs);

    const appts = await prisma.appointment.findMany({
      where: {
        isDeleted: false,
        status: "scheduled",
        scheduledAt: { gte: from, lt: to },
      },
      include: {
        patient: { select: { userId: true, fullName: true } },
        doctor: { select: { userId: true, user: { select: { fullName: true } } } },
      },
    });

    for (const appt of appts) {
      const patientUserId = appt?.patient?.userId;
      if (!patientUserId) continue;

      // Dedupe: one reminder per appointment+window per 30h
      const dedupeSince = new Date(nowMs - 30 * 60 * 60 * 1000);
      const existing = await prisma.notification.findFirst({
        where: {
          userId: patientUserId,
          isDeleted: false,
          createdAt: { gte: dedupeSince },
          AND: [
            { message: { contains: '"kind":"appointment_reminder"' } },
            { message: { contains: `"appointmentId":"${appt.id}"` } },
            { message: { contains: `"window":"${w.key}"` } },
          ],
        },
        select: { id: true },
      });

      if (existing) continue;

      const doctorName = appt?.doctor?.user?.fullName || null;
      await createNotificationBestEffort(prisma, {
        userId: patientUserId,
        type: "info",
        message: {
          ar: `تذكير: لديك موعد${doctorName ? ` مع د. ${doctorName}` : ""} بتاريخ ${formatDateTimeForLocale(appt.scheduledAt, "ar")}.`,
          en: `Reminder: you have an appointment${doctorName ? ` with Dr. ${doctorName}` : ""} on ${formatDateTimeForLocale(appt.scheduledAt, "en")}.`,
          meta: { kind: "appointment_reminder", appointmentId: appt.id, window: w.key },
        },
      });

      created += 1;
      details.push({ appointmentId: appt.id, window: w.key, patientUserId });
    }
  }

  return { created, details };
}

export async function GET(request) {
  if (!isAuthorized(request)) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();
    const result = await runReminders({ now });
    return Response.json({ ok: true, now: now.toISOString(), ...result });
  } catch (e) {
    return Response.json({ ok: false, error: e?.message || "server_error" }, { status: 500 });
  }
}

export async function POST(request) {
  return GET(request);
}
