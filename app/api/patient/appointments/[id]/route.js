import { NextResponse } from "next/server";
import prisma from "../../../../../lib/prismaClient";
import { withRBAC } from "../../../../../lib/auth/withRBAC";
import { rateLimit } from "../../../../../lib/security/rateLimiter";
import { logAudit } from "../../../../../lib/security/auditLogger";

export const PATCH = withRBAC(async (request, user, paramsArg) => {
  const rl = await rateLimit(request);
  if (rl.limited) {
    logAudit({ event: "rate_limit_exceeded", userId: user.id, ip: request.headers.get('x-forwarded-for'), details: { endpoint: "PATCH /api/patient/appointments/[id]" } });
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  try {
    const isProd = process.env.NODE_ENV === 'production';
    // Unwrap params from paramsArg or paramsArg.params (Next.js dynamic route)
    let params = typeof paramsArg?.then === "function" ? await paramsArg : paramsArg;
    if (params && params.params) {
      params = params.params;
    }
    const id = params.id;
    let body = {};
    try {
      body = await request.json();
    } catch (e) {
      // If body is not JSON, log it
      body = { error: "Failed to parse JSON", raw: await request.text() };
    }
    const action = body.action || body.status;

    if (!id || !action) {
      logAudit({ event: "patient_appointment_patch_missing_params", userId: user.id, ip: request.headers.get('x-forwarded-for'), details: { id, action } });
      return NextResponse.json(
        isProd
          ? { error: "Missing parameters" }
          : { error: "Missing parameters", debug: { id, action, body, paramsArg } },
        { status: 400 }
      );
    }

    // Ensure the logged-in user owns the patient record
    const patient = await prisma.patient.findFirst({ where: { userId: user.id } });
    if (!patient) {
      return NextResponse.json(
        isProd ? { error: "Patient not found" } : { error: "Patient not found", debug: { userId: user.id } },
        { status: 404 }
      );
    }

    // Fetch appointment to verify ownership
    const appt = await prisma.appointment.findUnique({ where: { id } });
    if (!appt || appt.patientId !== patient.id) {
      return NextResponse.json(
        isProd
          ? { error: "Appointment not found or unauthorized" }
          : { error: "Appointment not found or unauthorized", debug: { appt, patientId: patient.id, apptPatientId: appt?.patientId } },
        { status: 404 }
      );
    }

    let updated;
    if (action === "confirm" || action === "confirmed") {
      updated = await prisma.appointment.update({ where: { id }, data: { status: "completed" } });
      logAudit({ event: "patient_appointment_confirmed", userId: user.id, ip: request.headers.get('x-forwarded-for'), details: { appointmentId: id } });
    } else if (action === "cancel" || action === "cancelled") {
      const patientReason = body.patientReason || body.reason || null;
      if (!patientReason) {
        return NextResponse.json(
          isProd ? { error: "سبب الإلغاء مطلوب" } : { error: "سبب الإلغاء مطلوب", debug: { body } },
          { status: 400 }
        );
      }
      updated = await prisma.appointment.update({ where: { id }, data: { status: "cancelled", patientReason } });
      logAudit({ event: "patient_appointment_cancelled", userId: user.id, ip: request.headers.get('x-forwarded-for'), details: { appointmentId: id, patientReason } });
    } else if (action === "delete" || action === "remove") {
      updated = await prisma.appointment.update({ where: { id }, data: { isDeleted: true } });
      logAudit({ event: "patient_appointment_deleted", userId: user.id, ip: request.headers.get('x-forwarded-for'), details: { appointmentId: id } });
    } else {
      return NextResponse.json(
        isProd ? { error: "Unknown action" } : { error: "Unknown action", debug: { action, body } },
        { status: 400 }
      );
    }

    return NextResponse.json({ appointment: updated }, { status: 200 });
  } catch (err) {
    logAudit({ event: "patient_appointment_patch_error", userId: user?.id, ip: request.headers.get('x-forwarded-for'), details: { error: err.message, stack: err.stack } });
    const isProd = process.env.NODE_ENV === 'production';
    return NextResponse.json(
      isProd ? { error: "Server error" } : { error: "Server error", debug: { message: err.message, stack: err.stack } },
      { status: 500 }
    );
  }
}, ["patient"]);

export const DELETE = withRBAC(async (request, user, paramsArg) => {
  try {
    const params = typeof paramsArg?.then === "function" ? await paramsArg : paramsArg;
    const id = params.id;
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    const patient = await prisma.patient.findFirst({ where: { userId: user.id } });
    if (!patient) return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    const appt = await prisma.appointment.findUnique({ where: { id } });
    if (!appt || appt.patientId !== patient.id) return NextResponse.json({ error: "Appointment not found or unauthorized" }, { status: 404 });
    const updated = await prisma.appointment.update({ where: { id }, data: { isDeleted: true } });
    logAudit({ event: "patient_appointment_deleted", userId: user.id, ip: request.headers.get('x-forwarded-for'), details: { appointmentId: id } });
    return NextResponse.json({ appointment: updated }, { status: 200 });
  } catch (err) {
    logAudit({ event: "patient_appointment_delete_error", userId: user?.id, ip: request.headers.get('x-forwarded-for'), details: { error: err.message } });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}, ["patient"]);
