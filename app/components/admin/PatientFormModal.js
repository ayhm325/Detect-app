"use client";

import { useRouter } from "next/navigation";
import { useToast } from "../ui/ToastProvider";
import {
  FaCalendarAlt,
  FaFileAlt,
  FaEnvelope,
  FaHeartbeat,
  FaArrowUp,
  FaArrowDown,
  FaBell
} from "react-icons/fa";
import { useTranslations, useLocale } from "next-intl";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function PatientFormModal() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("patient");
  const { showSuccess, showError, showInfo, showWarning } = useToast();
  // ToastContainer لم يعد مطلوبًا هنا إذا كان ToastProvider يلتف حول التطبيق

  const basePrefix = locale === "en" ? "/en" : "/ar";

  const todayDate =
    locale === "ar"
      ? new Date().toLocaleDateString("ar-JO", { dateStyle: "full" })
      : new Date().toLocaleDateString("en-US", { dateStyle: "full" });

  /* ================= Stats ================= */
  const stats = [
    {
      title: t("dashboard.stats.upcomingAppointments"),
      value: "3",
      change: "+50%",
      icon: FaCalendarAlt,
      trend: "up"
    },
    {
      title: t("dashboard.stats.readyReports"),
      value: "8",
      change: "+33%",
      icon: FaFileAlt,
      trend: "up"
    },
    {
      title: t("dashboard.stats.newMessages"),
      value: "12",
      change: "+71%",
      icon: FaEnvelope,
      trend: "up"
    },
    {
      title: t("dashboard.stats.vitalSigns"),
      value: t("healthScoreValue"),
      icon: FaHeartbeat
    }
  ];

  /* ================= Quick Actions ================= */
  const quickActions = [
    {
      title: t("dashboard.quickActions.bookAppointment"),
      desc: t("dashboard.quickActions.desc.bookAppointment"),
      icon: "📅",
      action: () => router.push(`${basePrefix}/patient/appointments`)
    },
    {
      title: t("dashboard.quickActions.uploadXray"),
      desc: t("dashboard.quickActions.desc.uploadXray"),
      icon: "🩻",
      action: () => router.push(`${basePrefix}/patient/analysis`)
    },
    {
      title: t("dashboard.quickActions.viewReports"),
      desc: t("dashboard.quickActions.desc.viewReports"),
      icon: "📋",
      action: () => router.push(`${basePrefix}/patient/results`)
    },
    {
      title: t("dashboard.quickActions.chatDoctor"),
      desc: t("dashboard.quickActions.desc.chatDoctor"),
      icon: "💬",
      action: () => router.push(`${basePrefix}/patient/chat`)
    }
  ];

  /* ================= Helpers ================= */
  const statusClass = (s) =>
    s === "confirmed"
      ? "bg-green-100 text-green-700"
      : "bg-orange-100 text-orange-700";

  /* ================= Render ================= */
  return (
    <>
      <ToastContainer />

      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 p-6">
        {/* Header */}
        <div className="flex justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">
              {t("dashboard.welcome")} 👋
            </h1>
            <p className="text-gray-500 mt-2">{todayDate}</p>
          </div>

          <button
            onClick={() => router.push(`${basePrefix}/patient/notifications`)}
            className="relative p-3 bg-white dark:bg-slate-800 rounded-full shadow"
          >
            <FaBell />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
              3
            </span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {stats.map((s, i) => (
            <div key={i} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow">
              <div className="flex justify-between mb-3">
                <s.icon className="text-2xl text-blue-500" />
                {s.trend && (
                  <span className="text-green-600 flex items-center gap-1">
                    <FaArrowUp /> {s.change}
                  </span>
                )}
              </div>
              <p className="text-gray-500">{s.title}</p>
              <p className="text-3xl font-bold">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <h2 className="text-2xl font-bold mb-4">
          {t("dashboard.quickActions.title")}
        </h2>
        {/* يمكنك إضافة باقي كود quickActions هنا إذا كان مطلوب */}
      </div>
    </>
  );
}

export default PatientFormModal;
