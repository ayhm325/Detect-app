// Server component: fetch real doctor data and pass to client DashboardHome
export const headers = () => {
  return [["Cache-Control", "no-store"]];
};

import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import prisma from "../../../../lib/prismaClient.js";
import DoctorDashboardWrapper from "../../../components/DoctorDashboardWrapper";
import DoctorLayout from "../DoctorLayout";
import DashboardHome from "./DashboardHome";
import { getJwtSecret } from "../../../../lib/auth/jwtSecret.js";
import { getJwtVerifyOptions } from "../../../../lib/auth/jwtClaims.js";
import { getTranslations } from "next-intl/server";

export default async function DoctorDashboard({ params }) {
  const resolvedParams = typeof params?.then === 'function' ? await params : params;
  const locale = resolvedParams?.locale;
  const basePrefix = `/${locale}`;
  const tNav = await getTranslations({ locale, namespace: "navigation" });

  // read token from cookies and verify
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  let user = null;
  try {
    if (token) user = jwt.verify(token, getJwtSecret(), getJwtVerifyOptions());
  } catch (e) {
    user = null;
  }

  let serverData = {};
  if (user && user.id && user.role === "doctor") {
    // fetch doctor and counts
    const doctor = await prisma.doctor.findUnique({
      where: { userId: user.id },
      include: { user: true }
    });

    if (!doctor) {
      const breadcrumbs = [{ label: tNav("home"), href: `${basePrefix}/doctor/dashboard` }];
      return (
        <DoctorDashboardWrapper>
          <DoctorLayout breadcrumbs={breadcrumbs}>
            <DashboardHome serverData={{}} />
          </DoctorLayout>
        </DoctorDashboardWrapper>
      );
    }

    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const doctorId = doctor.userId;

    const [patientsCount, todayAppointmentsCount, pendingScansCount, newMessagesCount, todayAppointmentsList, recentActivity, pendingScansList] = await Promise.all([
      prisma.patient.count({ where: { doctorId } }),
      prisma.appointment.count({ where: { doctorId, scheduledAt: { gte: start, lte: end } } }),
      prisma.medicalRecord.count({ where: { doctorId, reviewedByDoctor: false } }),
      prisma.message.count({
        where: {
          chat: { doctorId },
          status: { not: "read" },
          sender: "patient",
        },
      }),
      prisma.appointment.findMany({ where: { doctorId, scheduledAt: { gte: start, lte: end } }, include: { patient: true }, orderBy: { scheduledAt: 'asc' }, take: 10 }),
      prisma.activity.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' }, take: 6 }),
      prisma.medicalRecord.findMany({
        where: { doctorId, reviewedByDoctor: false },
        include: {
          patient: { select: { fullName: true } },
          appointment: { select: { type: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 3,
      }),
    ]);

    serverData = {
      doctor: doctor ?? null,
      counts: {
        patients: patientsCount ?? 0,
        todayAppointments: todayAppointmentsCount ?? 0,
        pendingScans: pendingScansCount ?? 0,
        newMessages: newMessagesCount ?? 0,
      },
      todayAppointments: todayAppointmentsList.map((a) => ({
        id: a.id,
        time: a.scheduledAt,
        patient: a.patient?.fullName ?? a.patientId,
        type: a.type ?? null,
        status: a.status,
      })),
      recentActivity: recentActivity.map((r) => ({
        id: r.id,
        type: r.type,
        description: r.description,
        meta: r.meta,
        time: r.createdAt,
      })),
      pendingScansList: pendingScansList.map((r) => ({
        id: r.id,
        patient: r.patient?.fullName ?? r.patientId,
        type: r.appointment?.type ?? null,
        confidenceScore: r.confidenceScore,
        createdAt: r.createdAt.toISOString(),
      })),
    };
  }

  const breadcrumbs = [{ label: tNav("home"), href: `${basePrefix}/doctor/dashboard` }];

  return (
    <DoctorDashboardWrapper>
      <DoctorLayout breadcrumbs={breadcrumbs}>
        <DashboardHome serverData={serverData} />
      </DoctorLayout>
    </DoctorDashboardWrapper>
  );
}
