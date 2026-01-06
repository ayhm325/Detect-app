import { NextResponse } from "next/server";
import prisma from "../../../../lib/prismaClient";
import { withRBAC } from "../../../../lib/auth/withRBAC";
import { rateLimit } from "../../../../lib/security/rateLimiter";
import { logAudit } from "../../../../lib/security/auditLogger";



export const GET = withRBAC(async (request, user) => {
  const rl = await rateLimit(request);
  if (rl.limited) {
    logAudit({ event: "rate_limit_exceeded", userId: user.id, ip: request.headers.get('x-forwarded-for'), details: { endpoint: "GET /api/patient/profile" } });
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }
  try {
    const userId = user.id;
    const userObj = await prisma.user.findUnique({ where: { id: userId } });
    const patient = await prisma.patient.findFirst({ where: { userId } });
    if (!patient) return NextResponse.json({ error: "Patient not found" }, { status: 404 });

    const out = {
      id: patient.id,
      userId: patient.userId,
      fullName: patient.fullName || userObj?.fullName || "",
      email: patient.email || userObj?.email || "",
      phone: patient.phone || "",
      doctorId: patient.doctorId || "",
      birthDate: patient.birthDate ? patient.birthDate.toISOString().split("T")[0] : "",
      gender: patient.gender || "",
      bloodType: patient.bloodType || "",
      notes: patient.notes || "",
      joinDate: patient.joinDate,
      clinicalStatus: patient.clinicalStatus || patient.status || null,
      notificationSettings: {
        emailNotifications: true,
        smsNotifications: true,
        pushNotifications: true,
        appointmentReminders: true,
        reportUpdates: true,
        medicationReminders: true,
        healthTips: false
      },
      createdAt: patient.createdAt,
      updatedAt: patient.updatedAt
    };

    try {
      const activity = await prisma.activity.findFirst({ where: { userId: userId, type: 'notificationSettings' } });
      if (activity && activity.meta) {
        out.notificationSettings = activity.meta;
      }
    } catch (e) {}

    try {
      if (patient.doctorId) {
        const docUser = await prisma.user.findUnique({ where: { id: patient.doctorId } });
        if (docUser) {
          out.doctor = { id: docUser.id, fullName: docUser.fullName || '', email: docUser.email || '' };
        }
      }
    } catch (e) {}

    logAudit({ event: "patient_profile_viewed", userId: user.id, ip: request.headers.get('x-forwarded-for'), details: { patientId: patient.id } });
    return NextResponse.json({ profile: out }, { status: 200 });
  } catch (err) {
    logAudit({ event: "patient_profile_view_error", userId: user.id, ip: request.headers.get('x-forwarded-for'), details: { error: err.message } });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}, ["patient"]);

export const PUT = withRBAC(async (request, user) => {
  const rl = await rateLimit(request);
  if (rl.limited) {
    logAudit({ event: "rate_limit_exceeded", userId: user.id, ip: request.headers.get('x-forwarded-for'), details: { endpoint: "PUT /api/patient/profile" } });
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }
  try {
    const body = await request.json();
    const userId = user.id;
    const patient = await prisma.patient.findFirst({ where: { userId } });
    if (!patient) return NextResponse.json({ error: "Patient not found" }, { status: 404 });

    const updateData = {};
    if (typeof body.fullName === "string") updateData.fullName = body.fullName;
    if (typeof body.email === "string") updateData.email = body.email;
    if (typeof body.phone === "string") updateData.phone = body.phone;
    if (typeof body.birthDate === "string" && body.birthDate) updateData.birthDate = new Date(body.birthDate);
    if (typeof body.gender === "string") updateData.gender = body.gender;
    if (typeof body.bloodType === "string") updateData.bloodType = body.bloodType;
    if (typeof body.notes === "string") updateData.notes = body.notes;

    const updated = await prisma.patient.update({ where: { id: patient.id }, data: updateData });

    if (body.fullName || body.email) {
      const userUpdate = {};
      if (body.fullName) userUpdate.fullName = body.fullName;
      if (body.email) userUpdate.email = body.email;
      try {
        await prisma.user.update({ where: { id: userId }, data: userUpdate });
      } catch (e) {
        // ignore user update errors for now
      }
    }

    if (body.notificationSettings && typeof body.notificationSettings === 'object') {
      try {
        const existing = await prisma.activity.findFirst({ where: { userId: userId, type: 'notificationSettings' } });
        if (existing) {
          await prisma.activity.update({ where: { id: existing.id }, data: { meta: body.notificationSettings } });
        } else {
          await prisma.activity.create({ data: { userId: userId, type: 'notificationSettings', description: 'User notification preferences', meta: body.notificationSettings } });
        }
      } catch (e) {}
    }

    logAudit({ event: "patient_profile_updated", userId: user.id, ip: request.headers.get('x-forwarded-for'), details: { patientId: patient.id } });
    return NextResponse.json({ profile: updated }, { status: 200 });
  } catch (err) {
    logAudit({ event: "patient_profile_update_error", userId: user.id, ip: request.headers.get('x-forwarded-for'), details: { error: err.message } });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}, ["patient"]);
