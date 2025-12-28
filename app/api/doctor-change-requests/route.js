import { NextResponse } from 'next/server';
import prisma from '../../../lib/prismaClient.js';
import { withRBAC } from "../../../lib/auth/withRBAC";
import { rateLimit } from "../../../lib/security/rateLimiter";
import { logAudit } from "../../../lib/security/auditLogger";

// GET /api/doctor-change-requests
export async function GET() {
  try {
    const doctors = await prisma.doctor.findMany({
      where: { status: { in: ['active', 'pending'] } },
      include: { user: true },
      orderBy: { createdAt: 'asc' }
    });
    return NextResponse.json({ success: true, doctors });
  } catch (error) {
    console.error('GET /api/doctor-change-requests error', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}



// POST /api/doctor-change-requests
export const POST = withRBAC(async (request, user) => {
  const rl = rateLimit(request);
  if (rl.limited) {
    logAudit({ event: "rate_limit_exceeded", userId: user.id, ip: request.headers.get('x-forwarded-for'), details: { endpoint: "POST /api/doctor-change-requests" } });
    return NextResponse.json({ success: false, error: "Rate limit exceeded" }, { status: 429 });
  }
  try {
    const body = await request.json();
    const userId = user.id;
    const patient = await prisma.patient.findFirst({ where: { userId } });
    if (!patient) return NextResponse.json({ success: false, error: 'Patient not found' }, { status: 404 });

    const requestedDoctorId = body.requestedDoctorId || body.newDoctorId || body.newDoctor;
    const reason = body.reason || '';

    const cr = await prisma.changeRequest.create({
      data: {
        userId: userId,
        type: 'doctor_change',
        status: 'pending',
        details: { patientId: patient.id, currentDoctorId: patient.doctorId || null, requestedDoctorId, reason }
      }
    });

    logAudit({ event: "doctor_change_requested", userId: user.id, ip: request.headers.get('x-forwarded-for'), details: { patientId: patient.id, requestedDoctorId } });
    return NextResponse.json({ success: true, request: cr }, { status: 201 });
  } catch (error) {
    logAudit({ event: "doctor_change_request_error", userId: user.id, ip: request.headers.get('x-forwarded-for'), details: { error: error.message } });
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}, ["patient"]);
