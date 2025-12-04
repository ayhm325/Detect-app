"use client";
import { useState } from "react";
import { useToast } from "@/app/components/ui/Toast";
import { FaBell, FaTrash, FaCheck, FaCheckDouble } from "react-icons/fa";

export default function PatientNotificationsPage() {
  const { showToast, ToastContainer } = useToast();
  const [filter, setFilter] = useState("all");
  
  const [notifications, setNotifications] = useState([
    { id: 1, title: "موعدك مع الدكتور", message: "تم تأكيد موعدك مع د. محمد سالم غداً الساعة 3 مساءً", time: "منذ 10 دقائق", read: false, type: "appointment" },
    { id: 2, title: "نتيجة الفحص جاهزة", message: "نتائج فحصك الطبي أخيراً متاحة الآن، يرجى مراجعتها", time: "منذ 20 دقيقة", read: false, type: "result" },
    { id: 3, title: "رد من الدكتور", message: "د. ليلى حسن ردت على استفسارك بخصوص الدواء", time: "منذ ساعة", read: true, type: "message" },
    { id: 4, title: "تذكير بالموعد", message: "لديك موعد مع د. سامي يوسف في خلال 3 أيام", time: "منذ 2 ساعة", read: true, type: "reminder" },
    { id: 5, title: "تحديث الحساب", message: "تم تحديث بياناتك الشخصية بنجاح", time: "منذ يومين", read: false, type: "system" }
  ]);

  const filteredNotifications = notifications.filter(notif => {
    if (filter === "unread") return !notif.read;
    if (filter === "read") return notif.read;
    return true;
  });

  const handleDelete = (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
    showToast("تم حذف الإشعار", "info");
  };

  const handleDeleteAll = () => {
    if (window.confirm("هل تريد حذف جميع الإشعارات؟")) {
      setNotifications([]);
      showToast("تم حذف جميع الإشعارات", "success");
    }
  };

  const handleMarkAsRead = (id) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
    showToast("تم تحديد كمقروء", "info");
  };

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    showToast("تم تحديد جميع الإشعارات كمقروءة", "success");
  };

  const handleMarkAsUnread = (id) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: false } : n
    ));
  };

  const getTypeIcon = (type) => {
    const icons = {
      appointment: "📅",
      result: "📊",
      message: "💬",
      reminder: "🔔",
      system: "⚙️"
    };
    return icons[type] || "🔔";
  };

  const getTypeBadgeColor = (type) => {
    const colors = {
      appointment: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
      result: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
      message: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
      reminder: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
      system: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
    };
    return colors[type] || "bg-gray-100 text-gray-700";
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const totalCount = notifications.length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8 px-4">
      <ToastContainer />
      
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">إشعاراتي</h1>
            <p className="text-gray-600 dark:text-gray-400">
              {unreadCount > 0 ? `لديك ${unreadCount} إشعار غير مقروء من أصل ${totalCount}` : `جميع الإشعارات مقروءة (${totalCount})`}
            </p>
          </div>
          <FaBell size={32} className="text-green-600 dark:text-green-400" />
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-3 mb-8 flex-wrap">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg transition ${
              filter === "all"
                ? "bg-green-600 text-white"
                : "bg-gray-200 dark:bg-slate-700 text-gray-900 dark:text-white hover:bg-gray-300"
            }`}
          >
            الكل ({totalCount})
          </button>
          <button
            onClick={() => setFilter("unread")}
            className={`px-4 py-2 rounded-lg transition ${
              filter === "unread"
                ? "bg-green-600 text-white"
                : "bg-gray-200 dark:bg-slate-700 text-gray-900 dark:text-white hover:bg-gray-300"
            }`}
          >
            غير المقروءة ({unreadCount})
          </button>
          <button
            onClick={() => setFilter("read")}
            className={`px-4 py-2 rounded-lg transition ${
              filter === "read"
                ? "bg-green-600 text-white"
                : "bg-gray-200 dark:bg-slate-700 text-gray-900 dark:text-white hover:bg-gray-300"
            }`}
          >
            المقروءة ({notifications.filter(n => n.read).length})
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mb-8 flex-wrap">
          <button
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition"
          >
            <FaCheckDouble size={14} />
            تحديد الكل كمقروء
          </button>
          <button
            onClick={handleDeleteAll}
            disabled={totalCount === 0}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-lg transition"
          >
            <FaTrash size={14} />
            حذف الكل
          </button>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-12 text-center">
              <FaBell size={48} className="mx-auto mb-4 text-gray-400 dark:text-gray-600" />
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                {filter === "unread" ? "لا توجد إشعارات غير مقروءة" : 
                 filter === "read" ? "لا توجد إشعارات مقروءة" : 
                 "لا توجد إشعارات"}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                className={`bg-white dark:bg-slate-800 rounded-xl shadow p-6 border-l-4 transition hover:shadow-lg ${
                  notif.read 
                    ? "border-l-gray-400 dark:border-l-slate-600" 
                    : "border-l-green-600 dark:border-l-green-400"
                } ${!notif.read ? "bg-green-50 dark:bg-green-900/10" : ""}`}
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <span className="text-2xl">{getTypeIcon(notif.type)}</span>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {notif.title}
                      </h3>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${getTypeBadgeColor(notif.type)}`}>
                        {notif.type === "appointment" ? "موعد" :
                         notif.type === "result" ? "نتيجة" :
                         notif.type === "message" ? "رسالة" :
                         notif.type === "reminder" ? "تذكير" :
                         "نظام"}
                      </span>
                      {!notif.read && (
                        <div className="w-3 h-3 bg-green-600 rounded-full ml-auto shrink-0"></div>
                      )}
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-2">
                      {notif.message}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      {notif.time}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 shrink-0">
                    {!notif.read ? (
                      <button
                        onClick={() => handleMarkAsRead(notif.id)}
                        title="تحديد كمقروء"
                        className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition"
                      >
                        <FaCheck size={18} />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleMarkAsUnread(notif.id)}
                        title="تحديد كغير مقروء"
                        className="p-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition"
                      >
                        <FaCheck size={18} />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(notif.id)}
                      title="حذف الإشعار"
                      className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition"
                    >
                      <FaTrash size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Stats */}
        {totalCount > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-6 border-t-4 border-blue-600">
              <h4 className="text-gray-600 dark:text-gray-300 text-sm font-medium mb-2">إجمالي الإشعارات</h4>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{totalCount}</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-6 border-t-4 border-yellow-600">
              <h4 className="text-gray-600 dark:text-gray-300 text-sm font-medium mb-2">غير المقروءة</h4>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{unreadCount}</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-6 border-t-4 border-green-600">
              <h4 className="text-gray-600 dark:text-gray-300 text-sm font-medium mb-2">المقروءة</h4>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{notifications.filter(n => n.read).length}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
