import { NextResponse } from "next/server";
import prisma from "../../../../../lib/prismaClient";
import { withRBAC } from "../../../../../lib/auth/withRBAC";
import { rateLimit } from "../../../../../lib/security/rateLimiter";
import { logAudit } from "../../../../../lib/security/auditLogger";
import {
  createNotificationBestEffort,
  formatDateTimeForLocale,
} from "../../../../../lib/notifications";

export const PATCH = withRBAC(
  async (request, user, paramsArg) => {
    const rl = await rateLimit(request);
    if (rl.limited) {
      logAudit({
        event: "rate_limit_exceeded",
        userId: user.id,
        ip: request.headers.get("x-forwarded-for"),
        details: { endpoint: "PATCH /api/doctor/appointments/[id]" },
      });
      return NextResponse.json(
        { error: "Rate limit exceeded" },
        { status: 429 },
      );
    }
    try {
      let params =
        typeof paramsArg?.then === "function" ? await paramsArg : paramsArg;
      if (params && params.params) params = params.params;
      const id = params?.id;
      if (!id)
        return NextResponse.json({ error: "Missing id" }, { status: 400 });

      let body = {};
      try {
        body = await request.json();
      } catch {
        body = {};
      }
      const action = body.action || body.status;
      if (!action)
        return NextResponse.json({ error: "Missing action" }, { status: 400 });

      const appt = await prisma.appointment.findUnique({
        where: { id },
        include: { patient: { select: { userId: true, fullName: true } } },
      });
      if (!appt || appt.doctorId !== user.id) {
        return NextResponse.json(
          { error: "Appointment not found or unauthorized" },
          { status: 404 },
        );
      }

      let updated = null;
      if (action === "cancel" || action === "cancelled") {
        updated = await prisma.appointment.update({
          where: { id },
          data: { status: "cancelled" },
        });
        const patientUserId = appt?.patient?.userId || null;
        if (patientUserId) {
          await createNotificationBestEffort(prisma, {
            userId: patientUserId,
            type: "warning",
            message: {
              ar: `تم إلغاء الموعد من قبل الطبيب بتاريخ ${formatDateTimeForLocale(appt.scheduledAt, "ar")}.`,
              en: `Your appointment on ${formatDateTimeForLocale(appt.scheduledAt, "en")} was cancelled by the doctor.`,
            },
          });
        }
        logAudit({
          event: "doctor_appointment_cancelled",
          userId: user.id,
          ip: request.headers.get("x-forwarded-for"),
          details: { appointmentId: id },
        });
      } else if (
        action === "confirm" ||
        action === "confirmed" ||
        action === "complete" ||
        action === "completed"
      ) {
        updated = await prisma.appointment.update({
          where: { id },
          data: { status: "completed" },
        });
        const patientUserId = appt?.patient?.userId || null;
        if (patientUserId) {
          await createNotificationBestEffort(prisma, {
            userId: patientUserId,
            type: "success",
            message: {
              ar: `تم تأكيد إتمام الموعد بتاريخ ${formatDateTimeForLocale(appt.scheduledAt, "ar")}.`,
              en: `Your appointment on ${formatDateTimeForLocale(appt.scheduledAt, "en")} was marked as completed by the doctor.`,
            },
          });
        }
        logAudit({
          event: "doctor_appointment_completed",
          userId: user.id,
          ip: request.headers.get("x-forwarded-for"),
          details: { appointmentId: id },
        });
      } else if (action === "reschedule") {
        const nextDateRaw = body.scheduledAt || body.newScheduledAt;
        if (!nextDateRaw)
          return NextResponse.json(
            { error: "Missing scheduledAt" },
            { status: 400 },
          );
        const nextDate = new Date(nextDateRaw);
        if (Number.isNaN(nextDate.getTime()))
          return NextResponse.json(
            { error: "Invalid scheduledAt" },
            { status: 400 },
          );

        updated = await prisma.appointment.update({
          where: { id },
          data: { scheduledAt: nextDate, status: "scheduled" },
        });
        const patientUserId = appt?.patient?.userId || null;
        if (patientUserId) {
          await createNotificationBestEffort(prisma, {
            userId: patientUserId,
            type: "info",
            message: {
              ar: `تم تعديل موعدك إلى ${formatDateTimeForLocale(nextDate, "ar")}.`,
              en: `Your appointment was rescheduled to ${formatDateTimeForLocale(nextDate, "en")}.`,
            },
          });
        }
        logAudit({
          event: "doctor_appointment_rescheduled",
          userId: user.id,
          ip: request.headers.get("x-forwarded-for"),
          details: { appointmentId: id, scheduledAt: nextDate.toISOString() },
        });
      } else {
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
      }

      return NextResponse.json({ appointment: updated }, { status: 200 });
    } catch (err) {
      logAudit({
        event: "doctor_appointment_patch_error",
        userId: user?.id,
        ip: request.headers.get("x-forwarded-for"),
        details: { error: err.message },
      });
      return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
  },
  ["doctor"],
);

export const DELETE = withRBAC(
  async (request, user, paramsArg) => {
    const rl = await rateLimit(request);
    if (rl.limited) {
      logAudit({
        event: "rate_limit_exceeded",
        userId: user.id,
        ip: request.headers.get("x-forwarded-for"),
        details: { endpoint: "DELETE /api/doctor/appointments/[id]" },
      });
      return NextResponse.json(
        { error: "Rate limit exceeded" },
        { status: 429 },
      );
    }
    try {
      const params =
        typeof paramsArg?.then === "function" ? await paramsArg : paramsArg;
      let id = params?.id;
      if (!id) {
        // Try to extract id from the URL (last segment)
        const urlParts = request.url.split("/");
        id = urlParts[urlParts.length - 1] || urlParts[urlParts.length - 2];
      }
      if (!id)
        return NextResponse.json({ error: "Missing id" }, { status: 400 });
      // تحقق أن الطبيب هو صاحب الموعد
      const appt = await prisma.appointment.findUnique({
        where: { id },
        include: { patient: { select: { userId: true } } },
      });
      if (!appt || appt.doctorId !== user.id)
        return NextResponse.json(
          { error: "Appointment not found or unauthorized" },
          { status: 404 },
        );
      // حذف الموعد بشكل منطقي (soft delete)
      await prisma.appointment.update({
        where: { id },
        data: { isDeleted: true },
      });

      const patientUserId = appt?.patient?.userId || null;
      if (patientUserId) {
        await createNotificationBestEffort(prisma, {
          userId: patientUserId,
          type: "warning",
          message: {
            ar: `تم إلغاء الموعد من قبل الطبيب بتاريخ ${formatDateTimeForLocale(appt.scheduledAt, "ar")}.`,
            en: `Your appointment on ${formatDateTimeForLocale(appt.scheduledAt, "en")} was cancelled by the doctor.`,
          },
        });
      }

      logAudit({
        event: "doctor_appointment_deleted",
        userId: user.id,
        ip: request.headers.get("x-forwarded-for"),
        details: { appointmentId: id },
      });
      return NextResponse.json({ success: true }, { status: 200 });
    } catch (err) {
      logAudit({
        event: "doctor_appointment_delete_error",
        userId: user?.id,
        ip: request.headers.get("x-forwarded-for"),
        details: { error: err.message },
      });
      return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
  },
  ["doctor"],
);
