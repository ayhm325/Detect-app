import React from "react";
import DashboardCard from "./DashboardCard";
import { FaUsers, FaUserMd, FaUserInjured, FaChartBar } from "react-icons/fa";
import useLocale from "../../hooks/useLocale";
import en from "../../locales/en";
import ar from "../../locales/ar";

export default function StatsGrid() {
  const { locale } = useLocale();
  const tr = locale === "ar" ? ar.adminAnalysis : en.adminAnalysis;
  const statsTr = tr.statsGrid || tr.stats || {};
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mt-8">
      <DashboardCard icon={<FaUsers className="text-yellow-500" />} title={statsTr.totalUsers || (locale === "ar" ? "إجمالي المستخدمين" : "Total Users")} value={120} color="border-yellow-200" />
      <DashboardCard icon={<FaUserMd className="text-red-500" />} title={statsTr.doctors || (locale === "ar" ? "عدد الأطباء" : "Doctors")} value={35} color="border-red-200" />
      <DashboardCard icon={<FaUserInjured className="text-yellow-600" />} title={statsTr.patients || (locale === "ar" ? "عدد المرضى" : "Patients")} value={85} color="border-yellow-300" />
      <DashboardCard icon={<FaChartBar className="text-green-500" />} title={statsTr.analyses || (locale === "ar" ? "عدد التحليلات" : "Analyses")} value={230} color="border-green-200" />
    </div>
  );
}
