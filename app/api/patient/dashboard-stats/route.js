import { NextResponse } from "next/server";
import prisma from "../../../../lib/prismaClient";
import { getMedicalRecordsForPatient } from "../../../../lib/prismaQueries";
import { withRBAC } from "../../../../lib/auth/withRBAC";
import { rateLimit } from "../../../../lib/security/rateLimiter";
import { logAudit } from "../../../../lib/security/auditLogger";



export const GET = withRBAC(async (request, user) => {
  const rl = await rateLimit(request);
  if (rl.limited) {
    logAudit({ event: "rate_limit_exceeded", userId: user.id, ip: request.headers.get('x-forwarded-for'), details: { endpoint: "GET /api/patient/dashboard-stats" } });
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }
  try {
    const userId = user.id;
    const patient = await prisma.patient.findFirst({ where: { userId } });
    if (!patient) return NextResponse.json({ error: "Patient not found" }, { status: 404 });

    const upcomingAppointments = await prisma.appointment.count({
      where: {
        patientId: patient.id,
        isDeleted: false,
        status: "scheduled",
        scheduledAt: { gte: new Date() }
      }
    });

    let records = [];
    try {
      records = await getMedicalRecordsForPatient(patient.id);
    } catch (e) {
      records = await prisma.medicalRecord.findMany({ where: { patientId: patient.id } });
    }
    const totalReports = records.length;
    const readyReports = records.filter(r => r.reviewedByDoctor === true).length;
    const pendingReports = totalReports - readyReports;

    const newMessages = await prisma.message.count({
      where: { chat: { patientId: patient.id }, status: { not: "read" }, sender: "doctor" }
    });

    logAudit({ event: "patient_dashboard_stats_viewed", userId: user.id, ip: request.headers.get('x-forwarded-for'), details: { patientId: patient.id } });
    return NextResponse.json({
      upcomingAppointments,
      totalReports,
      readyReports,
      pendingReports,
      newMessages,
      clinicalStatus: patient.clinicalStatus || null
    }, { status: 200 });
  } catch (err) {
    logAudit({ event: "patient_dashboard_stats_error", userId: user.id, ip: request.headers.get('x-forwarded-for'), details: { error: err.message } });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}, ["patient"]);
