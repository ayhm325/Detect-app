// app/[locale]/patient/dashboard/page.js


// ---- Client Component Wrapper ----
"use client";


// ---- Server Component Part ----
// منع الكاش
export const headers = () => {
  return [["Cache-Control", "no-store"]];
};

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "../../../components/ui/Toast";
import { FaCalendarAlt, FaFileAlt, FaEnvelope, FaHeartbeat, FaArrowUp, FaBell } from "react-icons/fa";
import { useTranslations, useLocale } from "next-intl";
import PatientDashboardWrapper from "../../../components/PatientDashboardWrapper";

export default function PatientDashboardPage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("patient");
  const basePrefix = locale === "en" ? "/en" : "/ar";

  // تحويل الأرقام العربية إلى 0123456789
  function toWesternDigits(str) {
    return str.replace(/[\u0660-\u0669]/g, d => "0123456789"[d.charCodeAt(0) - 0x0660]);
  }

  let today = new Date().toLocaleDateString(locale === "ar" ? "ar-JO" : "en-US", { dateStyle: "full" });
  if (locale === "ar") today = toWesternDigits(today);


  /* ===================== STATS ===================== */
  const [stats, setStats] = useState([
    { title: t("dashboard.stats.upcomingAppointments"), value: "-", change: null, icon: FaCalendarAlt },
    { title: t("dashboard.stats.readyReports"), value: "-", change: null, icon: FaFileAlt },
    { title: t("dashboard.stats.newMessages"), value: "-", change: null, icon: FaEnvelope },
    { title: t("dashboard.stats.vitalSigns"), value: "-", icon: FaHeartbeat },
  ]);

  // Unread notifications count
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/patient/dashboard-stats", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        setStats([
          { title: t("dashboard.stats.upcomingAppointments"), value: data.upcomingAppointments, change: null, icon: FaCalendarAlt },
          { title: t("dashboard.stats.readyReports"), value: data.readyReports, change: null, icon: FaFileAlt },
          { title: t("dashboard.stats.newMessages"), value: data.newMessages, change: null, icon: FaEnvelope },
          { title: t("dashboard.stats.vitalSigns"), value: data.vitalSigns, icon: FaHeartbeat },
        ]);
      } catch {}
    }
    fetchStats();
  }, [t]);

  // Fetch unread notifications count
  useEffect(() => {
    async function fetchUnreadCount() {
      try {
        const res = await fetch("/api/patient/notifications?userId=demo-user-id", { method: "HEAD" });
        if (res.ok) {
          const count = res.headers.get("X-Unread-Count");
          setUnreadCount(Number(count) || 0);
        }
      } catch {}
    }
    fetchUnreadCount();
  }, []);

  /* ===================== QUICK ACTIONS ===================== */
  const quickActions = [
    { title: t("dashboard.quickActions.bookAppointment"), desc: t("dashboard.quickActions.desc.bookAppointment"), icon: "📅", href: "/patient/appointments" },
    { title: t("dashboard.quickActions.uploadXray"), desc: t("dashboard.quickActions.desc.uploadXray") || "", icon: "🩻", href: "/patient/upload-xray" },
    { title: t("dashboard.quickActions.viewReports"), desc: t("dashboard.quickActions.desc.viewReports"), icon: "📋", href: "/patient/results" },
    { title: t("dashboard.quickActions.chatDoctor"), desc: t("dashboard.quickActions.desc.chatDoctor"), icon: "💬", href: "/patient/chat" },
  ];


  return (
    <PatientDashboardWrapper>
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {t("dashboard.welcome")} 👋
            </h1>
            <p className="text-gray-500 mt-2">{today}</p>
          </div>

          <button
            onClick={() => router.push(`${basePrefix}/patient/notifications`)}
            className="relative p-3 bg-white dark:bg-slate-800 rounded-full shadow"
          >
            <FaBell />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          {stats.map((s, i) => (
            <div key={i} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow">
              <div className="flex justify-between mb-3">
                <s.icon className="text-2xl text-blue-500" />
              </div>
              <p className="text-gray-500 text-sm">{s.title}</p>
              <p className="text-3xl font-bold">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <h2 className="text-2xl font-bold mb-4">{t("dashboard.quickActions.title")}</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {quickActions.map((a, i) => (
            <button
              key={i}
              onClick={() => router.push(`${basePrefix}${a.href}`)}
              className="bg-linear-to-br from-yellow-500 to-red-500 text-white p-6 rounded-xl shadow hover:scale-105 transition"
            >
              <div className="text-4xl mb-3">{a.icon}</div>
              <h3 className="font-bold">{a.title}</h3>
              <p className="text-sm opacity-90">{a.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </PatientDashboardWrapper>
  );
}
