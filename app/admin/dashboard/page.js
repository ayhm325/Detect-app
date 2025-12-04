"use client";
import { useRouter } from "next/navigation";
import { useToast } from "@/app/components/ui/Toast";
import AdminLayout from "../AdminLayout";
import { FaUsers, FaUserMd, FaUserInjured, FaXRay, FaArrowUp, FaArrowDown, FaBell, FaChartLine, FaExclamationTriangle, FaCheckCircle, FaClock } from "react-icons/fa";

export default function AdminDashboardPage() {
  const router = useRouter();
  const { showToast, ToastContainer } = useToast();

  // Get current date in Arabic
  const now = new Date();
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const arabicDate = now.toLocaleDateString('ar-EG', options);

  const stats = [
    {
      title: "إجمالي المستخدمين",
      value: "156",
      change: "+12",
      changePercent: "+8.3%",
      icon: FaUsers,
      color: "bg-blue-500",
      bgLight: "bg-blue-50 dark:bg-blue-900/20",
      trend: "up"
    },
    {
      title: "الأطباء",
      value: "32",
      change: "+3",
      changePercent: "+10.3%",
      icon: FaUserMd,
      color: "bg-green-500",
      bgLight: "bg-green-50 dark:bg-green-900/20",
      trend: "up"
    },
    {
      title: "المرضى",
      value: "124",
      change: "+9",
      changePercent: "+7.8%",
      icon: FaUserInjured,
      color: "bg-purple-500",
      bgLight: "bg-purple-50 dark:bg-purple-900/20",
      trend: "up"
    },
    {
      title: "الفحوصات اليوم",
      value: "28",
      change: "-5",
      changePercent: "-15%",
      icon: FaXRay,
      color: "bg-orange-500",
      bgLight: "bg-orange-50 dark:bg-orange-900/20",
      trend: "down"
    }
  ];

  const quickActions = [
    {
      title: "إدارة المستخدمين",
      description: "عرض وتعديل حسابات المستخدمين",
      icon: "👥",
      gradient: "from-blue-600 to-blue-500",
      action: () => router.push("/admin/users")
    },
    {
      title: "إدارة الأطباء",
      description: "إضافة وتعديل بيانات الأطباء",
      icon: "👨‍⚕️",
      gradient: "from-green-600 to-green-500",
      action: () => router.push("/admin/doctors")
    },
    {
      title: "إدارة المرضى",
      description: "عرض ومتابعة سجلات المرضى",
      icon: "🏥",
      gradient: "from-purple-600 to-purple-500",
      action: () => router.push("/admin/patients")
    },
    {
      title: "التحليلات والتقارير",
      description: "عرض الإحصائيات والتقارير",
      icon: "📊",
      gradient: "from-orange-600 to-orange-500",
      action: () => router.push("/admin/analysis")
    }
  ];

  const systemStatus = [
    { label: "توفر الخادم", value: "99.9%", status: "success", icon: FaCheckCircle },
    { label: "وقت الاستجابة", value: "45ms", status: "success", icon: FaClock },
    { label: "استخدام الذاكرة", value: "62%", status: "warning", icon: FaExclamationTriangle },
    { label: "حجم قاعدة البيانات", value: "2.4 GB", status: "success", icon: FaCheckCircle }
  ];

  const recentActivities = [
    { id: 1, action: "تسجيل مستخدم جديد: أحمد محمد", time: "منذ 5 دقائق", icon: "👤", color: "blue" },
    { id: 2, action: "تحليل جديد تم رفعه من د. سارة", time: "منذ 15 دقيقة", icon: "🩻", color: "green" },
    { id: 3, action: "تحديث بيانات المريض: فاطمة علي", time: "منذ 30 دقيقة", icon: "📝", color: "purple" },
    { id: 4, action: "إضافة طبيب جديد: د. محمد خالد", time: "منذ ساعة", icon: "👨‍⚕️", color: "orange" },
    { id: 5, action: "نسخة احتياطية للنظام مكتملة", time: "منذ ساعتين", icon: "💾", color: "gray" }
  ];

  const pendingApprovals = [
    { id: 1, type: "طلب تسجيل طبيب", name: "د. عمر السيد", time: "منذ يوم" },
    { id: 2, type: "طلب تحديث بيانات", name: "د. ليلى يوسف", time: "منذ يومين" },
    { id: 3, type: "طلب صلاحيات إضافية", name: "د. أحمد خالد", time: "منذ 3 أيام" }
  ];

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

  return (
    <AdminLayout breadcrumbs={["لوحة التحكم"]}>
      <ToastContainer />
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              لوحة تحكم المدير 👨‍💼
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">{arabicDate}</p>
          </div>
          <button
            onClick={() => router.push("/admin/notifications")}
            className="relative p-3 bg-white dark:bg-slate-800 rounded-full shadow-lg hover:shadow-xl transition-shadow"
          >
            <FaBell className="text-xl text-gray-700 dark:text-gray-300" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
              7
            </span>
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-slate-700 hover:shadow-xl transition-shadow"
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
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                {stat.change} من الشهر الماضي
              </p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">إجراءات سريعة</h2>
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
                  <span className="text-sm">المزيد</span>
                  <span className="group-hover:-translate-x-1 transition-transform">←</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* System Status */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">حالة النظام</h2>
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
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">الطلبات المعلقة</h2>
              <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-3 py-1 rounded-full text-sm font-bold">
                {pendingApprovals.length}
              </span>
            </div>
            <div className="space-y-3">
              {pendingApprovals.map((approval) => (
                <div
                  key={approval.id}
                  className="p-4 bg-gray-50 dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white">{approval.type}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{approval.name}</p>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{approval.time}</span>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => showToast("تم الموافقة على الطلب", "success")}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                    >
                      قبول
                    </button>
                    <button
                      onClick={() => showToast("تم رفض الطلب", "error")}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                    >
                      رفض
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => router.push("/admin/approvals")}
              className="w-full mt-4 text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium"
            >
              عرض جميع الطلبات
            </button>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="mt-8 bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-slate-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">النشاط الأخير</h2>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-slate-900 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="text-3xl">{activity.icon}</div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">{activity.action}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
