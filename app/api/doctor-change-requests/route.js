import { NextResponse } from "next/server";
import prisma from "../../../lib/prismaClient.js";
import { withRBAC } from "../../../lib/auth/withRBAC";
import { rateLimit } from "../../../lib/security/rateLimiter";
import { logAudit } from "../../../lib/security/auditLogger";

// GET /api/doctor-change-requests
export const GET = withRBAC(
  async (request, user) => {
    const rl = await rateLimit(request);
    if (rl.limited) {
      logAudit({
        event: "rate_limit_exceeded",
        userId: user.id,
        ip: request.headers.get("x-forwarded-for"),
        details: { endpoint: "GET /api/doctor-change-requests" },
      });
      return NextResponse.json(
        { success: false, error: "Rate limit exceeded" },
        { status: 429 },
      );
    }
    try {
      const doctors = await prisma.doctor.findMany({
        where: { status: { in: ["active", "pending"] } },
        select: {
          userId: true,
          status: true,
          phone: true,
          clinic: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              isActive: true,
              role: true,
              createdAt: true,
            },
          },
        },
        orderBy: { createdAt: "asc" },
      });
      logAudit({
        event: "doctor_change_doctors_listed",
        userId: user.id,
        ip: request.headers.get("x-forwarded-for"),
        details: { count: doctors.length },
      });
      return NextResponse.json({ success: true, doctors });
    } catch (error) {
      logAudit({
        event: "doctor_change_doctors_list_error",
        userId: user.id,
        ip: request.headers.get("x-forwarded-for"),
        details: { error: error.message },
      });
      return NextResponse.json(
        { success: false, error: "Server error" },
        { status: 500 },
      );
    }
  },
  ["patient"],
);

// POST /api/doctor-change-requests
export const POST = withRBAC(
  async (request, user) => {
    const rl = await rateLimit(request);
    if (rl.limited) {
      logAudit({
        event: "rate_limit_exceeded",
        userId: user.id,
        ip: request.headers.get("x-forwarded-for"),
        details: { endpoint: "POST /api/doctor-change-requests" },
      });
      return NextResponse.json(
        { success: false, error: "Rate limit exceeded" },
        { status: 429 },
      );
    }
    try {
      const body = await request.json();
      const userId = user.id;
      const patient = await prisma.patient.findFirst({ where: { userId } });
      if (!patient)
        return NextResponse.json(
          { success: false, error: "Patient not found" },
          { status: 404 },
        );

      const requestedDoctorIdRaw =
        body.requestedDoctorId || body.newDoctorId || body.newDoctor;
      const requestedDoctorId =
        typeof requestedDoctorIdRaw === "string"
          ? requestedDoctorIdRaw.trim()
          : requestedDoctorIdRaw;
      const reason = body.reason || "";

      if (!requestedDoctorId) {
        return NextResponse.json(
          { success: false, error: "Missing requestedDoctorId" },
          { status: 400 },
        );
      }

      if (patient.doctorId && requestedDoctorId === patient.doctorId) {
        return NextResponse.json(
          {
            success: false,
            error: "Requested doctor is the same as current doctor",
          },
          { status: 400 },
        );
      }

      const cr = await prisma.changeRequest.create({
        data: {
          userId: userId,
          type: "doctor_change",
          status: "pending",
          details: {
            patientId: patient.id,
            currentDoctorId: patient.doctorId || null,
            requestedDoctorId,
            reason,
          },
        },
      });

      logAudit({
        event: "doctor_change_requested",
        userId: user.id,
        ip: request.headers.get("x-forwarded-for"),
        details: { patientId: patient.id, requestedDoctorId },
      });
      return NextResponse.json({ success: true, request: cr }, { status: 201 });
    } catch (error) {
      logAudit({
        event: "doctor_change_request_error",
        userId: user.id,
        ip: request.headers.get("x-forwarded-for"),
        details: { error: error.message },
      });
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 },
      );
    }
  },
  ["patient"],
);
