import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "../../../../lib/prismaClient";
import { getAppointmentsForPatient } from "../../../../lib/prismaQueries";

import { withRBAC } from "../../../../lib/auth/withRBAC";

function getTokenFromRequest(request) {
  try {
    const cookie = request.cookies?.get?.("token")?.value;
    if (cookie) return cookie;
  } catch (e) {}
  const authHeader = request.headers.get("authorization") || request.headers.get("Authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) return authHeader.split(" ")[1];
  const cookieHeader = request.headers.get("cookie");
  if (cookieHeader) {
    const match = cookieHeader.match(/(?:^|; )token=([^;]+)/);
    if (match) return match[1];
  }
  return null;
}

export const GET = withRBAC(async (request, user) => {
  const rl = rateLimit(request);
  if (rl.limited) {
    logAudit({ event: "rate_limit_exceeded", userId: user.id, ip: request.headers.get('x-forwarded-for'), details: { endpoint: "GET /api/patient/appointments" } });
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }
  try {
    const userId = user.id;
    const patient = await prisma.patient.findFirst({ where: { userId } });
    if (!patient) return NextResponse.json({ error: "Patient not found" }, { status: 404 });

    let appointments = [];
    try {
      appointments = await getAppointmentsForPatient(patient.id);
    } catch (e) {
      appointments = await prisma.appointment.findMany({
        where: { patientId: patient.id, isDeleted: false },
        include: { doctor: { include: { user: true } } },
        orderBy: { scheduledAt: "asc" }
      });
    }

    const out = appointments.map((a) => ({
      id: a.id,
      doctor: a.doctor?.user?.fullName || a.doctor?.user?.displayName || null,
      doctorId: a.doctorId,
      scheduledAt: a.scheduledAt,
      status: a.status,
      reason: a.reason,
      createdAt: a.createdAt
    }));

    logAudit({ event: "patient_appointments_listed", userId: user.id, ip: request.headers.get('x-forwarded-for'), details: { count: out.length } });
    return NextResponse.json({ appointments: out }, { status: 200 });
  } catch (err) {
    logAudit({ event: "patient_appointments_list_error", userId: user.id, ip: request.headers.get('x-forwarded-for'), details: { error: err.message } });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}, ["patient"]);

export const POST = withRBAC(async (request, user) => {
  const rl = rateLimit(request);
  if (rl.limited) {
    logAudit({ event: "rate_limit_exceeded", userId: user.id, ip: request.headers.get('x-forwarded-for'), details: { endpoint: "POST /api/patient/appointments" } });
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }
  try {
    const body = await request.json();
    const { doctorId, scheduledAt, reason } = body;
    if (!doctorId || !scheduledAt) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const userId = user.id;
    const patient = await prisma.patient.findFirst({ where: { userId } });
    if (!patient) return NextResponse.json({ error: "Patient not found" }, { status: 404 });

    const scheduledDate = new Date(scheduledAt);
    try {
      const created = await prisma.appointment.create({
        data: {
          doctorId,
          patientId: patient.id,
          scheduledAt: scheduledDate,
          status: "scheduled",
          reason: reason || null
        }
      });

      logAudit({ event: "patient_appointment_created", userId: user.id, ip: request.headers.get('x-forwarded-for'), details: { appointmentId: created.id } });
      return NextResponse.json({ appointment: created }, { status: 201 });
    } catch (createErr) {
      if (createErr && createErr.code === "P2002") {
        return NextResponse.json({ error: "Appointment conflict" }, { status: 409 });
      }
      logAudit({ event: "patient_appointment_create_error", userId: user.id, ip: request.headers.get('x-forwarded-for'), details: { error: createErr.message } });
      return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
  } catch (err) {
    logAudit({ event: "patient_appointment_create_error", userId: user.id, ip: request.headers.get('x-forwarded-for'), details: { error: err.message } });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}, ["patient"]);
