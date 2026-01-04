"use client";
import { useMemo } from "react";
import { useToast } from "../../../components/ui/Toast";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { formatTime } from "../../../lib/date";
import {
  FaUserMd,
  FaUsers,
  FaCalendarAlt,
  FaXRay,
  FaComments,
  FaCheckCircle,
  FaHourglassHalf,
  FaExclamationTriangle,
  FaArrowUp,
  FaArrowRight,
  FaClock,
  FaBell,
  FaChartLine,
  FaClipboardList,
} from "react-icons/fa";

export default function DashboardHome({ serverData = {} }) {
  const { showToast, ToastContainer } = useToast();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("doctorDashboard");
  const ui = useTranslations("ui");
  const basePrefix = locale === "en" ? "/en" : "/ar";
  const placeholder = ui("placeholder");

  const safeRawObject = (key, fallback = {}) => {
    try {
      const val = t.raw(key);
      return val && typeof val === "object" && !Array.isArray(val) ? val : fallback;
    } catch {
      return fallback;
    }
  };

  const safeRawArray = (key, fallback = []) => {
    try {
      const val = t.raw(key);
      return Array.isArray(val) ? val : fallback;
    } catch {
      return fallback;
    }
  };

  const labels = {
    title: t("title"),
    welcome: t("welcome"),
    stats: {
      patients: t("stats.patients"),
      todayAppointments: t("stats.todayAppointments"),
      pendingScans: t("stats.pendingScans"),
      newMessages: t("stats.newMessages"),
      changeSince: t("stats.changeSince"),
    },
    quickActions: {
      viewPatients: t("quickActions.viewPatients"),
      viewPatientsDesc: t("quickActions.viewPatientsDesc"),
      medicalImages: t("quickActions.medicalImages"),
      medicalImagesDesc: t("quickActions.medicalImagesDesc"),
      appointments: t("quickActions.appointments"),
      appointmentsDesc: t("quickActions.appointmentsDesc"),
      chats: t("quickActions.chats"),
      chatsDesc: t("quickActions.chatsDesc"),
    },
    todayAppointments: {
      title: t("todayAppointments.title"),
      viewAll: t("todayAppointments.viewAll"),
      empty: t("todayAppointments.empty"),
      types: safeRawObject("todayAppointments.types", {}),
      status: safeRawObject("todayAppointments.status", {}),
    },
    pendingScans: {
      title: t("pendingScans.title"),
      viewAll: t("pendingScans.viewAll"),
      priority: safeRawObject("pendingScans.priority", {}),
    },
    recentActivityTitle: t("recentActivityTitle"),
    ui: {
      today: t("ui.today"),
      yesterday: t("ui.yesterday"),
      sampleDoctorName: t("ui.sampleDoctorName"),
    },
  };

  const formattedDateRaw = new Date().toLocaleDateString(
    locale === "en" ? "en-US" : "ar-EG-u-nu-latn",
    { weekday: "long", year: "numeric", month: "long", day: "numeric" }
  );
  const formattedDate = formattedDateRaw ? formattedDateRaw.replace(/\u060C/g, "").trim() : formattedDateRaw;

  // Normalize date/time strings to avoid hydration mismatches between server and client
  const formatDateTime = (val) => {
    if (!val) return "";
    const raw = typeof val === "string" ? val : new Date(val).toLocaleString(locale === 'en' ? 'en-US' : 'ar-EG-u-nu-latn');
    // Remove Arabic comma (U+060C) and normalize whitespace so server and client match
    return raw.replace(/\u060C/g, "").replace(/\s+/g, " ").trim();
  };

  // Map DB appointment statuses to UI status keys we use for labels/colors
  const normalizeStatus = (s) => {
    if (!s) return 'pending';
    if (s === 'completed') return 'confirmed';
    if (s === 'scheduled') return 'pending';
    if (s === 'cancelled') return 'cancelled';
    if (s === 'no_show') return 'no_show';
    return s;
  };

  const stats = [
    {
      title: labels.stats.patients,
      value: serverData.counts?.patients ?? "156",
      change: "+12",
      changePercent: "+8.3%",
      icon: FaUsers,
      color: "bg-(--ui-info)",
      bgLight: "bg-(--ui-info-bg)",
      textColor: "text-(--ui-info)",
      trend: "up",
    },
    {
      title: labels.stats.todayAppointments,
      value: serverData.counts?.todayAppointments ?? "12",
      change: "+3",
      changePercent: "+25%",
      icon: FaCalendarAlt,
      color: "bg-(--ui-success)",
      bgLight: "bg-(--ui-success-bg)",
      textColor: "text-(--ui-success)",
      trend: "up",
    },
    {
      title: labels.stats.pendingScans,
      value: serverData.counts?.pendingScans ?? "8",
      change: "-2",
      changePercent: "-20%",
      icon: FaXRay,
      color: "bg-(--ui-warning)",
      bgLight: "bg-(--ui-warning-bg)",
      textColor: "text-(--ui-warning)",
      trend: "down",
    },
    {
      title: labels.stats.newMessages,
      value: serverData.counts?.newMessages ?? "24",
      change: "+5",
      changePercent: "+26%",
      icon: FaComments,
      color: "bg-(--ui-info)",
      bgLight: "bg-(--ui-info-bg)",
      textColor: "text-(--ui-info)",
      trend: "up",
    },
  ];

  // Use appointments provided by the server. If none, show an empty array so UI can display a no-data message.
  const todayAppointments = (serverData.todayAppointments && serverData.todayAppointments.length)
    ? serverData.todayAppointments.map((a, i) => ({ id: a.id || i, time: formatTime(a.time, locale === 'en' ? 'en-US' : 'ar-EG-u-nu-latn', placeholder), patient: a.patient, type: a.type || 'consult', status: a.status }))
    : [];

  const defaultRecentActivity = useMemo(() => [
    { id: 1, action: t("recentActivity.defaults.reviewXray"), time: t("recentActivity.times.min10"), icon: FaCheckCircle, color: "text-(--ui-success)" },
    { id: 2, action: t("recentActivity.defaults.newAppointment"), time: t("recentActivity.times.min25"), icon: FaCalendarAlt, color: "text-(--ui-info)" },
    { id: 3, action: t("recentActivity.defaults.newMessage"), time: t("recentActivity.times.min45"), icon: FaComments, color: "text-(--ui-info)" },
    { id: 4, action: t("recentActivity.defaults.reportReady"), time: t("recentActivity.times.hour1"), icon: FaClipboardList, color: "text-(--ui-warning)" },
  ], [t]);

  const recentActivity = (serverData.recentActivity && serverData.recentActivity.length)
    ? serverData.recentActivity.map((r, i) => ({ id: r.id || i, action: r.action || r.description || '', time: formatDateTime(r.time), icon: FaClipboardList, color: 'text-(--ui-warning)' }))
    : defaultRecentActivity;

  const pendingScans = safeRawArray("pendingScans.defaults", []).map((s, i) => {
    const dateLabel = s.dateKey === "yesterday" ? labels.ui.yesterday : labels.ui.today;
    const typeLabel = labels.todayAppointments.types?.[s.typeKey] ?? placeholder;
    return {
      id: s.id ?? i + 1,
      patient: s.patient,
      type: typeLabel,
      date: dateLabel,
      priority: s.priority,
    };
  });

  const quickActions = [
    {
      title: labels.quickActions.viewPatients,
      description: labels.quickActions.viewPatientsDesc,
      icon: FaUsers,
      link: `${basePrefix}/doctor/patients`,
    },
    {
      title: labels.quickActions.medicalImages,
      description: labels.quickActions.medicalImagesDesc,
      icon: FaXRay,
      link: `${basePrefix}/doctor/results`,
    },
    {
      title: labels.quickActions.appointments,
      description: labels.quickActions.appointmentsDesc,
      icon: FaCalendarAlt,
      link: `${basePrefix}/doctor/appointments`,
    },
    {
      title: labels.quickActions.chats,
      description: labels.quickActions.chatsDesc,
      icon: FaComments,
      link: `${basePrefix}/doctor/chat`,
    },
  ];

  const handleQuickAction = (link) => {
    router.push(link);
  };

  return (
    <>
      <ToastContainer />
      <div className="min-h-screen bg-(--ui-surface-2) text-(--ui-foreground) p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-(--ui-foreground) flex items-center gap-3">
                <FaUserMd className="text-(--ui-info)" />
                {labels.title}
              </h1>
              <p className="mt-2 text-(--ui-muted-foreground)">{labels.welcome} {serverData.doctor?.user?.fullName || labels.ui.sampleDoctorName} - {formattedDate}</p>
            </div>
            <button
              onClick={() => router.push(`${basePrefix}/doctor/notifications`)}
              className="relative rounded-lg btn-gradient p-3 text-white transition-all"
            >
              <FaBell className="text-xl" />
              <span className="absolute -top-1 -left-1 flex h-5 w-5 items-center justify-center rounded-full bg-(--ui-danger) text-xs font-bold text-(--ui-danger-foreground)">
                {serverData.counts?.newMessages ?? 0}
              </span>
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className="group relative overflow-hidden rounded-xl card-glass p-6 shadow-(--shadow-soft) border border-(--ui-border) transition-all hover:shadow-(--shadow-lift)"
                >
                  <div className={`absolute top-0 right-0 h-20 w-20 translate-x-8 -translate-y-8 transform rounded-full ${stat.bgLight} opacity-50 transition-transform group-hover:scale-150`}></div>
                  <div className="relative">
                    <div className="flex items-center justify-between">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${stat.color}`}>
                        <Icon className="text-2xl text-white" />
                      </div>
                      <div className={`flex items-center gap-1 text-sm font-medium ${stat.trend === "up" ? "text-(--ui-success)" : "text-(--ui-danger)"}`}>
                        <FaArrowUp className={stat.trend === "down" ? "rotate-180" : ""} />
                        {stat.changePercent}
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="text-sm text-(--ui-muted-foreground)">{stat.title}</p>
                      <p className="mt-1 text-3xl font-bold text-(--ui-foreground)">{stat.value}</p>
                      <p className="mt-1 text-xs text-(--ui-muted-foreground)">
                        {stat.change} {labels.stats.changeSince}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <button
                  key={index}
                  onClick={() => handleQuickAction(action.link)}
                  className="group rounded-xl btn-gradient p-6 text-white shadow-(--shadow-soft) transition-all hover:shadow-(--shadow-lift) hover:scale-105"
                >
                  <div className="flex items-center justify-between mb-3">
                    <Icon className="text-3xl" />
                    <FaArrowRight className="transition-transform group-hover:-translate-x-1" />
                  </div>
                  <h3 className="text-lg font-bold">{action.title}</h3>
                  <p className="mt-1 text-sm opacity-90">{action.description}</p>
                </button>
              );
            })}
          </div>

          {/* Main Content Grid */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Today's Appointments */}
            <div className="lg:col-span-2 rounded-xl card-glass p-6 shadow-(--shadow-soft) border border-(--ui-border)">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-bold text-(--ui-foreground) flex items-center gap-2">
                  <FaCalendarAlt className="text-(--ui-info)" />
                  {labels.todayAppointments.title}
                </h2>
                <button
                  onClick={() => router.push(`${basePrefix}/doctor/appointments`)}
                  className="text-sm text-(--ui-info) hover:opacity-90 font-medium"
                >
                  {labels.todayAppointments.viewAll}
                </button>
              </div>
              <div className="space-y-3">
                {todayAppointments.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-(--ui-border) p-6 text-center text-(--ui-muted-foreground)">
                    {labels.todayAppointments.empty}
                  </div>
                ) : (
                  todayAppointments.map((apt) => (
                    <div
                      key={apt.id}
                      className="flex items-center justify-between rounded-lg border border-(--ui-border) p-4 transition-all hover:bg-(--ui-surface-2)"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-(--ui-info-bg)">
                          <FaClock className="text-(--ui-info)" />
                        </div>
                        <div>
                          <p className="font-bold text-(--ui-foreground)">{apt.patient}</p>
                          <p className="text-sm text-(--ui-muted-foreground)">{apt.place || apt.location || labels.todayAppointments.types[apt.type] || apt.type}</p>
                        </div>
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-(--ui-foreground)">{apt.time}</p>
                        {(() => {
                          const displayStatus = normalizeStatus(apt.status);
                          const badgeClass = displayStatus === 'confirmed'
                            ? 'bg-(--ui-success-bg) text-(--ui-success)'
                            : displayStatus === 'pending'
                            ? 'bg-(--ui-warning-bg) text-(--ui-warning)'
                            : displayStatus === 'cancelled'
                            ? 'bg-(--ui-danger-bg) text-(--ui-danger)'
                            : 'bg-(--ui-surface-2) text-(--ui-foreground)';
                          return (
                            <span className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${badgeClass}`}>
                              {labels.todayAppointments.status[displayStatus] || displayStatus}
                            </span>
                          );
                        })()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Pending Scans */}
            <div className="rounded-xl card-glass p-6 shadow-(--shadow-soft) border border-(--ui-border)">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-bold text-(--ui-foreground) flex items-center gap-2">
                  <FaXRay className="text-(--ui-warning)" />
                  {labels.pendingScans.title}
                </h2>
              </div>
              <div className="space-y-3">
                {pendingScans.map((scan) => (
                  <div
                    key={scan.id}
                    className="rounded-lg border border-(--ui-border) p-4 transition-all hover:bg-(--ui-surface-2)"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-bold text-(--ui-foreground)">{scan.patient}</p>
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                          scan.priority === "high"
                            ? "bg-(--ui-danger-bg) text-(--ui-danger)"
                            : scan.priority === "medium"
                            ? "bg-(--ui-warning-bg) text-(--ui-warning)"
                            : "bg-(--ui-info-bg) text-(--ui-info)"
                        }`}
                      >
                        {labels.pendingScans.priority[scan.priority] || scan.priority}
                      </span>
                    </div>
                    <p className="text-sm text-(--ui-muted-foreground)">{scan.type}</p>
                    <p className="text-xs text-(--ui-muted-foreground) mt-1">{scan.date}</p>
                  </div>
                ))}
                <button
                  onClick={() => router.push(`${basePrefix}/doctor/results`)}
                  className="w-full rounded-lg btn-gradient py-2 text-sm font-medium text-white transition-all"
                >
                  {labels.pendingScans.viewAll}
                </button>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="rounded-xl card-glass p-6 shadow-(--shadow-soft) border border-(--ui-border)">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-(--ui-foreground) flex items-center gap-2">
                <FaChartLine className="text-(--ui-info)" />
                {labels.recentActivityTitle}
              </h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {recentActivity.map((activity) => {
                const Icon = activity.icon;
                return (
                  <div
                    key={activity.id}
                    className="rounded-lg border border-(--ui-border) p-4 transition-all hover:bg-(--ui-surface-2)"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-1 ${activity.color}`}>
                        <Icon className="text-xl" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-(--ui-foreground) truncate">
                          {activity.action}
                        </p>
                        <p className="text-xs text-(--ui-muted-foreground) mt-1">{activity.time}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
