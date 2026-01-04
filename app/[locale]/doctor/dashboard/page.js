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

    const [patientsCount, todayAppointmentsCount, pendingScansCount, unreadNotificationsCount, todayAppointmentsList, recentActivity, pendingScansList] = await Promise.all([
      prisma.patient.count({ where: { doctorId: doctor.id } }),
      prisma.appointment.count({ where: { doctorId: doctor.id, scheduledAt: { gte: start, lte: end } } }),
      prisma.medicalRecord.count({ where: { doctorId: doctor.id, reviewedByDoctor: false } }),
      prisma.notification.count({ where: { userId: user.id, isRead: false, isDeleted: false } }),
      prisma.appointment.findMany({ where: { doctorId: doctor.id, scheduledAt: { gte: start, lte: end } }, include: { patient: true }, orderBy: { scheduledAt: 'asc' }, take: 10 }),
      prisma.activity.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' }, take: 6 }),
      prisma.medicalRecord.findMany({
        where: { doctorId: doctor.id, reviewedByDoctor: false },
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
        newMessages: unreadNotificationsCount ?? 0,
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
        action: r.description,
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
