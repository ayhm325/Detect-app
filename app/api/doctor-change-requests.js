
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import prisma from '../../lib/prismaClient.js';

// GET /api/doctor-change-requests
export async function GET() {
  try {
    // Return doctors suitable for patient selection.
    // Include both active and pending in dev so patients can see options.
    const doctors = await prisma.doctor.findMany({
      where: { status: { in: ['active', 'pending'] } },
      include: { user: true },
      orderBy: { createdAt: 'asc' }
    });
    return NextResponse.json({ success: true, doctors });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

function getTokenFromRequest(request) {
  try {
    const cookie = request.cookies?.get?.('token')?.value;
    if (cookie) return cookie;
  } catch (e) {}
  const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) return authHeader.split(' ')[1];
  const cookieHeader = request.headers.get('cookie');
  if (cookieHeader) {
    const match = cookieHeader.match(/(?:^|; )token=([^;]+)/);
    if (match) return match[1];
  }
  return null;
}

// POST /api/doctor-change-requests
export async function POST(request) {
  try {
    const token = getTokenFromRequest(request);
    if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    } catch (e) {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
    }
    if (!payload || payload.role !== 'patient') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }
    const body = await request.json();
    const userId = payload.id || payload.userId || payload.sub;
    const patient = await prisma.patient.findFirst({ where: { userId } });
    if (!patient) return NextResponse.json({ success: false, error: 'Patient not found' }, { status: 404 });

    const requestedDoctorId = body.requestedDoctorId || body.newDoctorId || body.newDoctor;
    const reason = body.reason || '';

    // create change request
    const cr = await prisma.changeRequest.create({
      data: {
        userId: userId,
        type: 'doctor_change',
        status: 'pending',
        details: { patientId: patient.id, currentDoctorId: patient.doctorId || null, requestedDoctorId, reason }
      }
    });

    return NextResponse.json({ success: true, request: cr }, { status: 201 });
  } catch (error) {
    console.error('Failed to create doctor change request', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
