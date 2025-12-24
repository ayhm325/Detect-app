
import { NextResponse } from 'next/server';
import { getPendingDoctors } from '../../lib/getPendingDoctors.js';

// GET /api/doctor-change-requests
export async function GET() {
  try {
    const doctors = await getPendingDoctors();
    return NextResponse.json({ success: true, doctors });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
