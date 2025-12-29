
export const POST = withRBAC(async (request, user) => {
  try {
    const body = await request.json();
    // If doctor, keep old logic
    if (user.role === "doctor") {
      const { patientId } = body;
      if (!patientId) {
        return NextResponse.json({ error: "missing_patient_id" }, { status: 400 });
      }
      // Check if chat already exists
      let chat = await prisma.chat.findFirst({ where: { doctorId: user.id, patientId } });
      if (!chat) {
        chat = await prisma.chat.create({ data: { doctorId: user.id, patientId } });
      }
      return NextResponse.json({ chat }, { status: 201 });
    }
    // If patient, allow them to start a chat with their assigned doctor
    if (user.role === "patient") {
      // Find patient record
      const patient = await prisma.patient.findUnique({ where: { userId: user.id } });
      if (!patient) {
        return NextResponse.json({ error: "patient_not_found" }, { status: 404 });
      }
      if (!patient.doctorId) {
        return NextResponse.json({ error: "no_doctor_linked" }, { status: 400 });
      }
      // Check if chat already exists
      let chat = await prisma.chat.findFirst({ where: { doctorId: patient.doctorId, patientId: patient.id } });
      if (!chat) {
        chat = await prisma.chat.create({ data: { doctorId: patient.doctorId, patientId: patient.id } });
      }
      return NextResponse.json({ chat }, { status: 201 });
    }
    // Otherwise, forbidden
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("/api/chat/patient POST error:", error);
      return NextResponse.json({ error: error.message || String(error) }, { status: 500 });
    }
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}, ["doctor", "patient"]);
import { NextResponse } from "next/server";
import prisma from "../../../../lib/prismaClient.js";
import { withRBAC } from "../../../../lib/auth/withRBAC";
import { rateLimit } from "../../../../lib/security/rateLimiter";
import { logAudit } from "../../../../lib/security/auditLogger";

export const GET = withRBAC(async (request, user) => {
  const rl = rateLimit(request);
  if (rl.limited) {
    logAudit({ event: "rate_limit_exceeded", userId: user.id, ip: request.headers.get('x-forwarded-for'), details: { endpoint: "GET /api/chat/patient" } });
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }
  try {
    const patient = await prisma.patient.findUnique({ where: { userId: user.id } });
    if (!patient) return NextResponse.json({ error: "patient_not_found" }, { status: 404 });

    const chats = await prisma.chat.findMany({
      where: { patientId: patient.id },
      include: {
        doctor: { include: { user: true } },
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
      },
      orderBy: { updatedAt: "desc" },
    });

    logAudit({ event: "patient_chats_listed", userId: user.id, ip: request.headers.get('x-forwarded-for'), details: { chatCount: chats.length } });
    return NextResponse.json({ chats });
  } catch (error) {
    logAudit({ event: "patient_chats_list_error", userId: user.id, ip: request.headers.get('x-forwarded-for'), details: { error: error.message } });
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}, ["patient"]);
