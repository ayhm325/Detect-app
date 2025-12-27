import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prismaClient.js';

// GET /api/admin/doctor-change-requests
export async function GET() {
  try {
    const reqs = await prisma.changeRequest.findMany({
      where: { type: 'doctor_change', status: 'pending' },
      include: { user: true }
    });
    // Normalize output for admin UI
    const out = reqs.map((r) => ({
      id: r.id,
      userId: r.userId,
      patientName: r.user?.fullName || r.userId,
      status: r.status,
      details: r.details || {},
      reason: r.details?.reason || '',
      requestedDoctorId: r.details?.requestedDoctorId || null,
      createdAt: r.createdAt
    }));
    return NextResponse.json({ success: true, requests: out });
  } catch (e) {
    console.error('admin doctor-change-requests GET failed', e);
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

// PATCH /api/admin/doctor-change-requests
export async function PATCH(request) {
  try {
    const body = await request.json();
    const { id, action } = body || {};
    if (!id || !action) return NextResponse.json({ success: false, error: 'Missing id or action' }, { status: 400 });

    const req = await prisma.changeRequest.findUnique({ where: { id } });
    if (!req) return NextResponse.json({ success: false, error: 'Request not found' }, { status: 404 });
    if (req.type !== 'doctor_change') return NextResponse.json({ success: false, error: 'Invalid request type' }, { status: 400 });
    if (req.status !== 'pending') return NextResponse.json({ success: false, error: 'Request not pending' }, { status: 400 });

    if (action === 'approve') {
      const details = req.details || {};
      const patientId = details.patientId || null;
      const requestedDoctorId = details.requestedDoctorId || null;

      if (!patientId || !requestedDoctorId) {
        return NextResponse.json({ success: false, error: 'Request details incomplete' }, { status: 400 });
      }

      // Update the patient record to set the new doctor
      await prisma.patient.update({ where: { id: patientId }, data: { doctorId: requestedDoctorId } });

      // Mark change request as approved
      const updated = await prisma.changeRequest.update({ where: { id }, data: { status: 'approved', reviewedAt: new Date() } });
      return NextResponse.json({ success: true, request: updated });
    }

    if (action === 'reject') {
      const updated = await prisma.changeRequest.update({ where: { id }, data: { status: 'rejected', reviewedAt: new Date() } });
      return NextResponse.json({ success: true, request: updated });
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
  } catch (e) {
    console.error('admin doctor-change-requests PATCH failed', e);
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
