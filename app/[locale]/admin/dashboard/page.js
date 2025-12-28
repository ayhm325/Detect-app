"use client";

export const headers = () => {
  return [
    ["Cache-Control", "no-store"]
  ];
};

import AdminDashboardWrapper from "../../../components/AdminDashboardWrapper";
import { useMemo, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast, ToastContainer } from "../../../components/ui/ToastProvider";
import { FaUsers, FaUserMd, FaUserInjured, FaXRay, FaArrowUp, FaArrowDown, FaBell, FaChartLine, FaExclamationTriangle, FaCheckCircle, FaClock } from "react-icons/fa";
import useLocale from "../../../hooks/useLocale";

export default function AdminDashboardPage() {
  const router = useRouter();
  const { t, locale } = useLocale();
  const basePrefix = locale === "en" ? "/en" : "/ar";
  const ad = t.adminDashboard || {};

  const { showInfo, showSuccess, showError } = useToast();


  let formattedDate = new Date().toLocaleDateString(locale === "en" ? "en-US" : "ar-EG", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  // جلب الإحصائيات الحقيقية من API
  const [statsData, setStatsData] = useState({ totalUsers: 0, doctors: 0, patients: 0, todayScans: 0, totalScans: 0 });
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState(null);

  // Replace Arabic digits with Western digits if locale is Arabic
  if (locale === "ar") {
    formattedDate = formattedDate.replace(/[٠-٩]/g, d => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));
  }

  useEffect(() => {
    fetch("/api/admin/dashboard-stats")
      .then((res) => res.json())
      .then((data) => {
        setStatsData(data);
        setStatsLoading(false);
      })
      .catch((err) => {
        setStatsError("خطأ في جلب الإحصائيات");
        setStatsLoading(false);
      });
  }, []);

  const stats = [
    { title: ad.stats?.totalUsers || t.adminDashboard?.stats?.totalUsers, value: statsData.totalUsers, change: "", changePercent: "", icon: FaUsers, color: "bg-blue-500", bgLight: "bg-blue-50 dark:bg-blue-900/20", trend: "up" },
    { title: ad.stats?.doctors || t.adminDashboard?.stats?.doctors, value: statsData.doctors, change: "", changePercent: "", icon: FaUserMd, color: "bg-green-500", bgLight: "bg-green-50 dark:bg-green-900/20", trend: "up" },
    { title: ad.stats?.patients || t.adminDashboard?.stats?.patients, value: statsData.patients, change: "", changePercent: "", icon: FaUserInjured, color: "bg-purple-500", bgLight: "bg-purple-50 dark:bg-purple-900/20", trend: "up" },
    { title: ad.stats?.todayScans || t.adminDashboard?.stats?.todayScans, value: statsData.todayScans, change: "", changePercent: "", icon: FaXRay, color: "bg-orange-500", bgLight: "bg-orange-50 dark:bg-orange-900/20", trend: "down" },
    { title: ad.stats?.totalScansAll || t.adminDashboard?.stats?.totalScansAll, value: statsData.totalScans, change: "", changePercent: "", icon: FaXRay, color: "bg-cyan-500", bgLight: "bg-cyan-50 dark:bg-cyan-900/20", trend: "up" },
  ];

  const quickActions = [
    { title: ad.quickActions?.users?.title || t.adminDashboard?.quickActions?.users?.title, description: ad.quickActions?.users?.desc || t.adminDashboard?.quickActions?.users?.desc, icon: "👥", gradient: "from-yellow-500 to-red-500", action: () => router.push(`${basePrefix}/admin/users`) },
    { title: ad.quickActions?.doctors?.title || t.adminDashboard?.quickActions?.doctors?.title, description: ad.quickActions?.doctors?.desc || t.adminDashboard?.quickActions?.doctors?.desc, icon: "👨‍⚕️", gradient: "from-yellow-400 to-orange-500", action: () => router.push(`${basePrefix}/admin/doctors`) },
    { title: ad.quickActions?.patients?.title || t.adminDashboard?.quickActions?.patients?.title, description: ad.quickActions?.patients?.desc || t.adminDashboard?.quickActions?.patients?.desc, icon: "🏥", gradient: "from-red-500 to-red-600", action: () => router.push(`${basePrefix}/admin/patients`) },
    // analysis quick action removed because page was deleted
  ];

  // معلومات النظام الحقيقية
  const [systemStatusData, setSystemStatusData] = useState({
    serverUptime: "-",
    responseTime: "-",
    memoryUsage: "-",
    dbSize: "-"
  });
  useEffect(() => {
    fetch("/api/admin/system-status")
      .then((res) => res.json())
      .then((data) => setSystemStatusData(data))
      .catch(() => {});
  }, []);
  const systemStatus = [
    { label: ad.systemStatus?.serverUptime || t.adminDashboard?.systemStatus?.serverUptime, value: systemStatusData.serverUptime, status: "success", icon: FaCheckCircle },
    { label: ad.systemStatus?.responseTime || t.adminDashboard?.systemStatus?.responseTime, value: systemStatusData.responseTime, status: "success", icon: FaClock },
    { label: ad.systemStatus?.memoryUsage || t.adminDashboard?.systemStatus?.memoryUsage, value: systemStatusData.memoryUsage, status: "success", icon: FaCheckCircle },
    { label: ad.systemStatus?.dbSize || t.adminDashboard?.systemStatus?.dbSize, value: systemStatusData.dbSize, status: "success", icon: FaCheckCircle }
  ];

  // جلب النشاطات الحقيقية من API
  const [recentActivities, setRecentActivities] = useState([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [activitiesError, setActivitiesError] = useState(null);

  useEffect(() => {
    setActivitiesLoading(true);
    fetch("/api/admin/recent-activities")
      .then((res) => res.json())
      .then((data) => {
        setRecentActivities(data.activities || []);
        setActivitiesLoading(false);
      })
      .catch(() => {
        setActivitiesError("خطأ في جلب النشاطات");
        setActivitiesLoading(false);
      });
  }, []);

  // الطلبات المعلقة الحقيقية (الأطباء غير الموافق عليهم)
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [pendingLoading, setPendingLoading] = useState(true);
  const [pendingError, setPendingError] = useState(null);

  useEffect(() => {
    const fetchPendingApprovals = async () => {
      setPendingLoading(true);
      try {
        const res = await fetch("/api/admin/doctors");
        const data = await res.json();
        if (data.doctors) {
          // تصفية الأطباء المعلقين فقط
          const pending = data.doctors
            .filter((doc) => doc.status === "pending")
            .map((doc) => ({
              id: doc.user?.id || doc.userId || doc.id,
              fullName: doc.user?.fullName || "—",
              email: doc.user?.email || "—",
              createdAt: doc.user?.createdAt || null,
              licenseNumber: doc.licenseNumber,
              phone: doc.phone
            }));
          console.log("[Dashboard] Pending Approvals (frontend):", pending);
          setPendingApprovals(pending);
        } else {
          setPendingApprovals([]);
        }
      } catch {
        setPendingError("خطأ في جلب الطلبات المعلقة");
      } finally {
        setPendingLoading(false);
      }
    };
    fetchPendingApprovals();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "success":
        return "text-green-600 dark:text-green-400";
      case "warning":
        return "text-orange-600 dark:text-orange-400";
      case "error":
        return "text-red-600 dark:text-red-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  // إشعارات الأدمن
  const [unreadCount, setUnreadCount] = useState(0);
  useEffect(() => {
    fetch("/api/admin/notifications-unread")
      .then((res) => res.json())
      .then((data) => setUnreadCount(data.unread || 0))
      .catch(() => setUnreadCount(0));
  }, []);

  return (
    <>
      {/* ToastContainer is rendered by ToastProvider at the app root. Do not render here. */}
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              {ad.title || t.adminDashboard?.title} 👨‍💼
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">{formattedDate}</p>
          </div>
          <button
            onClick={() => router.push(`${basePrefix}/admin/notifications`)}
            className="relative p-3 bg-white dark:bg-slate-800 rounded-full shadow-lg hover:shadow-xl transition-shadow"
            title={ad.notifications || t.adminDashboard?.notifications}
          >
            <FaBell className="text-xl text-gray-700 dark:text-gray-300" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* Stats Row - always in one line, scrollable on small screens */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-8 w-full">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-slate-700 hover:shadow-xl transition-shadow w-full"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.bgLight}`}>
                  <stat.icon className={`text-2xl ${stat.color.replace('bg-', 'text-')}`} />
                </div>
                <div className={`flex items-center gap-1 text-sm ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.trend === 'up' ? <FaArrowUp /> : <FaArrowDown />}
                  <span>{stat.changePercent}</span>
                </div>
              </div>
              <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-2">
                {stat.title}
              </h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {stat.value}
              </p>
              {/* تم حذف جملة (من الشهر الماضي) */}
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{ad.quickActions?.title || t.adminDashboard?.quickActionsTitle}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className={`bg-linear-to-br ${action.gradient} text-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all hover:scale-105 group`}
              >
                <div className="text-4xl mb-3">{action.icon}</div>
                <h3 className="text-lg font-bold mb-2">{action.title}</h3>
                <p className="text-sm opacity-90">{action.description}</p>
                <div className="mt-4 flex items-center gap-2 opacity-80 group-hover:gap-3 transition-all">
                  <span className="text-sm">{ad.quickActions?.more || t.adminDashboard?.more}</span>
                  <span className="group-hover:-translate-x-1 transition-transform">{locale === "en" ? "→" : "←"}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* System Status */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{ad.systemStatus?.title || t.adminDashboard?.systemStatusTitle}</h2>
              <FaChartLine className="text-2xl text-blue-500" />
            </div>
            <div className="space-y-4">
              {systemStatus.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-900 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <item.icon className={getStatusColor(item.status)} />
                    <span className="text-gray-900 dark:text-white font-medium">{item.label}</span>
                  </div>
                  <span className={`font-bold ${getStatusColor(item.status)}`}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Pending Approvals */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{ad.pendingApprovals?.title || t.adminDashboard?.pendingApprovalsTitle}</h2>
              <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-3 py-1 rounded-full text-sm font-bold">
                {pendingLoading ? "..." : pendingApprovals.length}
              </span>
            </div>
            {pendingError && (
              <div className="text-red-600 dark:text-red-400 mb-4">{pendingError}</div>
            )}
            <div className="space-y-3">
              {pendingLoading ? (
                <div className="text-gray-500 dark:text-gray-400">جاري التحميل...</div>
              ) : pendingApprovals.length === 0 ? (
                <div className="text-gray-500 dark:text-gray-400">لا توجد طلبات معلقة حالياً</div>
              ) : (
                <>
                  {pendingApprovals.map((approval, idx) => (
                    <div
                      key={approval.id || idx}
                      className="p-4 bg-gray-50 dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700 hover:shadow-md transition-shadow mb-2"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-bold text-gray-900 dark:text-white">{locale === "en" ? "Doctor registration request" : "طلب تسجيل طبيب"}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            <b>ID:</b> {approval.id?.toString() || "-"} <br/>
                            <b>Name:</b> {approval.fullName || "-"} <br/>
                            <b>Email:</b> {approval.email || "-"} <br/>
                            <b>License:</b> {approval.licenseNumber || "-"} <br/>
                            <b>Phone:</b> {approval.phone || "-"} <br/>
                            <b>Created:</b> {approval.createdAt ? new Date(approval.createdAt).toLocaleString(locale === "en" ? "en-US" : "ar-EG") : "-"}
                          </p>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{approval.createdAt ? new Date(approval.createdAt).toLocaleDateString(locale === "en" ? "en-US" : "ar-EG") : "-"}</span>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={async () => {
                            await fetch("/api/admin/doctors", {
                              method: "PATCH",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ id: approval.id, status: "active" })
                            });
                            setPendingApprovals((prev) => prev.filter((d) => d.id !== approval.id));
                            showSuccess(ad.toast?.approved || t.adminDashboard?.toast?.approved);
                          }}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                        >
                          {ad.pendingApprovals?.approve || tr.pendingApprovals.approve}
                        </button>
                        <button
                          onClick={async () => {
                            await fetch("/api/admin/doctors", {
                              method: "PATCH",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ id: approval.id, status: "banned" })
                            });
                            setPendingApprovals((prev) => prev.filter((d) => d.id !== approval.id));
                            showError(ad.toast?.rejected || t.adminDashboard?.toast?.rejected);
                          }}
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                        >
                          {ad.pendingApprovals?.reject || tr.pendingApprovals.reject}
                        </button>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
            <button
              onClick={() => router.push(`${basePrefix}/admin/doctors?pending=1`)}
              className="w-full mt-4 text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium"
            >
              {ad.pendingApprovals?.viewAll || t.adminDashboard?.pendingApprovals?.viewAll}
            </button>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="mt-8 bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-slate-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">{ad.recentActivity?.title || t.adminDashboard?.recentActivityTitle}</h2>
          <div className="space-y-4">
            {activitiesLoading ? (
              <div className="text-gray-500 dark:text-gray-400">جاري تحميل النشاطات...</div>
            ) : activitiesError ? (
              <div className="text-red-600 dark:text-red-400">{activitiesError}</div>
            ) : recentActivities.length === 0 ? (
              <div className="text-gray-500 dark:text-gray-400">لا توجد نشاطات حديثة</div>
            ) : (
              recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-slate-900 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="text-3xl">📝</div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">{activity.description}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(activity.createdAt).toLocaleString(locale === "en" ? "en-US" : "ar-EG")}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
