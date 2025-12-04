"use client";
import { useToast } from "@/app/components/ui/Toast";
import { useRouter } from "next/navigation";
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

export default function DashboardHome() {
  const { showToast, ToastContainer } = useToast();
  const router = useRouter();

  const stats = [
    {
      title: "إجمالي المرضى",
      value: "156",
      change: "+12",
      changePercent: "+8.3%",
      icon: FaUsers,
      color: "bg-blue-500",
      bgLight: "bg-blue-50",
      textColor: "text-blue-600",
      trend: "up",
    },
    {
      title: "المواعيد اليوم",
      value: "12",
      change: "+3",
      changePercent: "+25%",
      icon: FaCalendarAlt,
      color: "bg-green-500",
      bgLight: "bg-green-50",
      textColor: "text-green-600",
      trend: "up",
    },
    {
      title: "الفحوصات المعلقة",
      value: "8",
      change: "-2",
      changePercent: "-20%",
      icon: FaXRay,
      color: "bg-orange-500",
      bgLight: "bg-orange-50",
      textColor: "text-orange-600",
      trend: "down",
    },
    {
      title: "الرسائل الجديدة",
      value: "24",
      change: "+5",
      changePercent: "+26%",
      icon: FaComments,
      color: "bg-purple-500",
      bgLight: "bg-purple-50",
      textColor: "text-purple-600",
      trend: "up",
    },
  ];

  const todayAppointments = [
    {
      id: 1,
      time: "09:00 ص",
      patient: "محمد أحمد",
      type: "فحص أشعة",
      status: "confirmed",
    },
    {
      id: 2,
      time: "10:30 ص",
      patient: "فاطمة علي",
      type: "استشارة",
      status: "confirmed",
    },
    {
      id: 3,
      time: "11:00 ص",
      patient: "أحمد خالد",
      type: "متابعة",
      status: "pending",
    },
    {
      id: 4,
      time: "02:00 م",
      patient: "سارة محمود",
      type: "فحص CT",
      status: "confirmed",
    },
  ];

  const recentActivity = [
    {
      id: 1,
      action: "تم فحص صورة أشعة لـ محمد علي",
      time: "منذ 10 دقائق",
      icon: FaCheckCircle,
      color: "text-green-600",
    },
    {
      id: 2,
      action: "موعد جديد مع فاطمة أحمد",
      time: "منذ 25 دقيقة",
      icon: FaCalendarAlt,
      color: "text-blue-600",
    },
    {
      id: 3,
      action: "رسالة جديدة من أحمد حسن",
      time: "منذ 45 دقيقة",
      icon: FaComments,
      color: "text-purple-600",
    },
    {
      id: 4,
      action: "تقرير جاهز لسارة خالد",
      time: "منذ ساعة",
      icon: FaClipboardList,
      color: "text-orange-600",
    },
  ];

  const pendingScans = [
    { id: 1, patient: "عمر حسن", type: "X-Ray", date: "اليوم", priority: "high" },
    { id: 2, patient: "ليلى محمود", type: "CT Scan", date: "اليوم", priority: "medium" },
    { id: 3, patient: "يوسف علي", type: "MRI", date: "أمس", priority: "low" },
  ];

  const quickActions = [
    {
      title: "عرض المرضى",
      description: "إدارة قائمة مرضاك",
      icon: FaUsers,
      color: "from-blue-600 to-blue-500",
      link: "/doctor/patients",
    },
    {
      title: "الصور الطبية",
      description: "مراجعة الأشعة والفحوصات",
      icon: FaXRay,
      color: "from-green-600 to-green-500",
      link: "/doctor/results",
    },
    {
      title: "المواعيد",
      description: "إدارة جدول المواعيد",
      icon: FaCalendarAlt,
      color: "from-purple-600 to-purple-500",
      link: "/doctor/appointments",
    },
    {
      title: "المحادثات",
      description: "التواصل مع المرضى",
      icon: FaComments,
      color: "from-orange-600 to-orange-500",
      link: "/doctor/chat",
    },
  ];

  const handleQuickAction = (link) => {
    router.push(link);
  };

  return (
    <>
      <ToastContainer />
      <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-6 text-gray-900 dark:text-gray-100">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <FaUserMd className="text-blue-600" />
                لوحة التحكم الطبية
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-300">مرحباً بك د. أحمد محمد - {new Date().toLocaleDateString("ar-EG", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
            </div>
            <button
              onClick={() => router.push("/doctor/notifications")}
              className="relative rounded-lg bg-blue-600 p-3 text-white transition-all hover:bg-blue-700"
            >
              <FaBell className="text-xl" />
              <span className="absolute -top-1 -left-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold">
                5
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
                  className="group relative overflow-hidden rounded-xl bg-white dark:bg-zinc-900 p-6 shadow-lg border border-gray-100 dark:border-zinc-800 transition-all hover:shadow-2xl"
                >
                  <div className={`absolute top-0 right-0 h-20 w-20 translate-x-8 -translate-y-8 transform rounded-full ${stat.bgLight} opacity-50 transition-transform group-hover:scale-150`}></div>
                  <div className="relative">
                    <div className="flex items-center justify-between">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${stat.color}`}>
                        <Icon className="text-2xl text-white" />
                      </div>
                      <div className={`flex items-center gap-1 text-sm font-medium ${stat.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                        <FaArrowUp className={stat.trend === "down" ? "rotate-180" : ""} />
                        {stat.changePercent}
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="text-sm text-gray-600 dark:text-gray-300">{stat.title}</p>
                      <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {stat.change} من الشهر الماضي
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
                  className={`group rounded-xl bg-linear-to-r ${action.color} p-6 text-white shadow-lg transition-all hover:shadow-2xl hover:scale-105`}
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
            <div className="lg:col-span-2 rounded-xl bg-white dark:bg-zinc-900 p-6 shadow-lg border border-gray-100 dark:border-zinc-800">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <FaCalendarAlt className="text-blue-600" />
                  مواعيد اليوم
                </h2>
                <button
                  onClick={() => router.push("/doctor/appointments")}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  عرض الكل
                </button>
              </div>
              <div className="space-y-3">
                {todayAppointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-zinc-800 p-4 transition-all hover:bg-gray-50 dark:hover:bg-zinc-800"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/40">
                        <FaClock className="text-blue-600" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white">{apt.patient}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{apt.type}</p>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900 dark:text-white">{apt.time}</p>
                      <span
                        className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                          apt.status === "confirmed"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/60 dark:text-green-200"
                            : "bg-orange-100 text-orange-700 dark:bg-orange-900/60 dark:text-orange-200"
                        }`}
                      >
                        {apt.status === "confirmed" ? "مؤكد" : "قيد الانتظار"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pending Scans */}
            <div className="rounded-xl bg-white dark:bg-zinc-900 p-6 shadow-lg border border-gray-100 dark:border-zinc-800">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <FaXRay className="text-orange-600" />
                  فحوصات معلقة
                </h2>
              </div>
              <div className="space-y-3">
                {pendingScans.map((scan) => (
                  <div
                    key={scan.id}
                    className="rounded-lg border border-gray-200 dark:border-zinc-800 p-4 transition-all hover:bg-gray-50 dark:hover:bg-zinc-800"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-bold text-gray-900 dark:text-white">{scan.patient}</p>
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                          scan.priority === "high"
                            ? "bg-red-100 text-red-700 dark:bg-red-900/60 dark:text-red-200"
                            : scan.priority === "medium"
                            ? "bg-orange-100 text-orange-700 dark:bg-orange-900/60 dark:text-orange-200"
                            : "bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-200"
                        }`}
                      >
                        {scan.priority === "high"
                          ? "عاجل"
                          : scan.priority === "medium"
                          ? "متوسط"
                          : "عادي"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{scan.type}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{scan.date}</p>
                  </div>
                ))}
                <button
                  onClick={() => router.push("/doctor/results")}
                  className="w-full rounded-lg bg-orange-600 py-2 text-sm font-medium text-white transition-all hover:bg-orange-700"
                >
                  عرض جميع الفحوصات
                </button>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="rounded-xl bg-white dark:bg-zinc-900 p-6 shadow-lg border border-gray-100 dark:border-zinc-800">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <FaChartLine className="text-purple-600" />
                النشاط الأخير
              </h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {recentActivity.map((activity) => {
                const Icon = activity.icon;
                return (
                  <div
                    key={activity.id}
                    className="rounded-lg border border-gray-200 dark:border-zinc-800 p-4 transition-all hover:bg-gray-50 dark:hover:bg-zinc-800"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-1 ${activity.color}`}>
                        <Icon className="text-xl" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {activity.action}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{activity.time}</p>
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
