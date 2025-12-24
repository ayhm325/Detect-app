"use client";
import { useState, useMemo } from "react";
import DoctorLayout from "../DoctorLayout";
import { useToast } from "../../../components/ui/Toast";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaBell, FaTrash, FaCheck, FaCheckDouble, FaFilter } from "react-icons/fa";
import useLocale from "../../../hooks/useLocale";

export default function NotificationsPage() {
  const { t, locale } = useLocale();
  const { showSuccess, showError, showWarning, showInfo } = useToast();

  const [filter, setFilter] = useState("all");
  const [notifications, setNotifications] = useState([
    {
      id: "1",
      title: locale === "ar" ? "تم حجز موعد" : "Appointment booked",
      message: locale === "ar" ? "لديك موعد جديد مع المريض أحمد" : "You have a new appointment with patient Ahmed",
      time: locale === "ar" ? "اليوم 09:00" : "Today 09:00",
      type: "appointment",
      read: false,
    },
    {
      id: "2",
      title: locale === "ar" ? "نتيجة جديدة" : "New result",
      message: locale === "ar" ? "تم رفع نتيجة مختبر" : "Lab result uploaded",
      time: locale === "ar" ? "أمس 14:20" : "Yesterday 14:20",
      type: "result",
      read: false,
    },
    {
      id: "3",
      title: locale === "ar" ? "رسالة جديدة" : "New message",
      message: locale === "ar" ? "رسالة من المريض" : "Message from patient",
      time: locale === "ar" ? "قبل 3 أيام" : "3 days ago",
      type: "message",
      read: true,
    },
  ]);

  const filterLabels = {
    all: locale === "ar" ? "الكل" : "All",
    unread: locale === "ar" ? "غير مقروءة" : "Unread",
    read: locale === "ar" ? "مقروءة" : "Read",
  };

  const unreadText = locale === "ar" ? "غير مقروءة" : "unread";
  const deleteAllText = locale === "ar" ? "حذف الكل" : "Delete all";
  const deleteText = locale === "ar" ? "حذف" : "Delete";
  const markAllReadText = locale === "ar" ? "تحديد الكل كمقروء" : "Mark all read";
  const markAsReadText = locale === "ar" ? "تحديد كمقروء" : "Mark as read";
  const markAsUnreadText = locale === "ar" ? "تحديد كغير مقروء" : "Mark as unread";
  const toastDeleted = locale === "ar" ? "تم الحذف" : "Deleted";
  const toastAllDeleted = locale === "ar" ? "تم حذف الكل" : "All deleted";
  const toastMarkedRead = locale === "ar" ? "تم التحديد كمقروء" : "Marked read";
  const toastAllMarkedRead = locale === "ar" ? "تم تحديد الكل كمقروء" : "All marked read";
  const toastConfirmDeleteAll = locale === "ar" ? "هل أنت متأكد أنك تريد حذف كل الإشعارات؟" : "Are you sure you want to delete all notifications?";
  const noNotificationsText = locale === "ar" ? "لا توجد إشعارات" : "No notifications";

  const typeLabels =
    locale === "ar"
      ? { appointment: "موعد", result: "نتيجة", message: "رسالة", system: "نظام" }
      : { appointment: "Appointment", result: "Result", message: "Message", system: "System" };

  const filteredNotifications = useMemo(() => {
    if (filter === "all") return notifications;
    if (filter === "unread") return notifications.filter((n) => !n.read);
    return notifications.filter((n) => n.read);
  }, [notifications, filter]);
  // ...existing code...
  // Remove all locale-based label objects and arrays
  // Use t("key") for all UI text and notification data
  // For example: t("filter.all"), t("filter.unread"), t("filter.read"), t("button.markAllRead"), t("button.deleteAll"), t("items.0.title"), t("items.0.message"), t("items.0.time"), t("items.0.type")

  const handleDelete = (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
    showInfo(toastDeleted);
  };

  const handleDeleteAll = () => {
    if (window.confirm(toastConfirmDeleteAll)) {
      setNotifications([]);
      showSuccess(toastAllDeleted);
    }
  };

  const handleMarkAsRead = (id) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
    showInfo(toastMarkedRead);
  };

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    showSuccess(toastAllMarkedRead);
  };

  // تحديد كغير مقروء
  const handleMarkAsUnread = (id) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: false } : n
    ));
  };

  // الحصول على أيقونة النوع
  const getTypeIcon = (type) => {
    const icons = {
      appointment: "📅",
      result: "📊",
      message: "💬",
      system: "⚙️"
    };
    return icons[type] || "🔔";
  };

  // الحصول على لون النوع
  const getTypeBadgeColor = (type) => {
      // نوع الإشعار (بالعربية/إنجليزية)
      const typeLabels = locale === "ar"
        ? { appointment: "موعد", result: "نتيجة", message: "رسالة", system: "نظام" }
        : { appointment: "Appointment", result: "Result", message: "Message", system: "System" };
    const colors = {
      appointment: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
      result: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
      message: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
      system: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
    };
    return colors[type] || "bg-gray-100 text-gray-700";
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const totalCount = notifications.length;

  return (
    <DoctorLayout breadcrumbs={[{ label: locale === "ar" ? "الإشعارات" : "Notifications", href: "/doctor/notifications" }]}> 
      <ToastContainer />
      
      <div className="py-8 px-4 md:px-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">{locale === "ar" ? "الإشعارات" : "Notifications"}</h1>
            <p className="text-gray-600 dark:text-gray-400">
              {unreadCount > 0
                ? `${unreadCount} ${unreadText} / ${totalCount}`
                : `${locale === "ar" ? "جميع الإشعارات مقروءة" : "All notifications read"} (${totalCount})`}
            </p>
          </div>
          <FaBell size={32} className="text-blue-600 dark:text-blue-400" />
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-3 mb-8 flex-wrap">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg transition ${
              filter === "all"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 dark:bg-slate-700 text-gray-900 dark:text-white hover:bg-gray-300"
            }`}
          >
            {filterLabels.all} ({totalCount})
          </button>
          <button
            onClick={() => setFilter("unread")}
            className={`px-4 py-2 rounded-lg transition ${
              filter === "unread"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 dark:bg-slate-700 text-gray-900 dark:text-white hover:bg-gray-300"
            }`}
          >
            {filterLabels.unread} ({unreadCount})
          </button>
          <button
            onClick={() => setFilter("read")}
            className={`px-4 py-2 rounded-lg transition ${
              filter === "read"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 dark:bg-slate-700 text-gray-900 dark:text-white hover:bg-gray-300"
            }`}
          >
            {filterLabels.read} ({notifications.filter(n => n.read).length})
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
            {markAllReadText}
          </button>
          <button
            onClick={handleDeleteAll}
            disabled={totalCount === 0}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-lg transition"
          >
            <FaTrash size={14} />
            {deleteAllText}
          </button>
        </div>

        {/* Notifications List */}
        <div className="space-y-4 max-w-4xl">
          {filteredNotifications.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-12 text-center">
              <FaBell size={48} className="mx-auto mb-4 text-gray-400 dark:text-gray-600" />
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                {noNotificationsText}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                className={`bg-white dark:bg-slate-800 rounded-xl shadow p-6 border-l-4 transition hover:shadow-lg ${
                  notif.read 
                    ? "border-l-gray-400 dark:border-l-slate-600" 
                    : "border-l-blue-600 dark:border-l-blue-400"
                } ${!notif.read ? "bg-blue-50 dark:bg-blue-900/10" : ""}`}
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{getTypeIcon(notif.type)}</span>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {notif.title}
                      </h3>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${getTypeBadgeColor(notif.type)}`}>
                        {typeLabels[notif.type]}
                      </span>
                      {!notif.read && (
                        <div className="w-3 h-3 bg-blue-600 rounded-full ml-auto shrink-0"></div>
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
                        title={markAsReadText}
                        className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition"
                      >
                        <FaCheck size={18} />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleMarkAsUnread(notif.id)}
                        title={markAsUnreadText}
                        className="p-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition"
                      >
                        <FaCheck size={18} />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(notif.id)}
                      title={deleteText}
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12 max-w-4xl">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-6 border-t-4 border-blue-600">
              <h4 className="text-gray-600 dark:text-gray-300 text-sm font-medium mb-2">{locale === "ar" ? "إجمالي الإشعارات" : "Total notifications"}</h4>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{totalCount}</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-6 border-t-4 border-yellow-600">
              <h4 className="text-gray-600 dark:text-gray-300 text-sm font-medium mb-2">{locale === "ar" ? "غير المقروءة" : "Unread"}</h4>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{unreadCount}</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-6 border-t-4 border-green-600">
              <h4 className="text-gray-600 dark:text-gray-300 text-sm font-medium mb-2">{locale === "ar" ? "المقروءة" : "Read"}</h4>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{notifications.filter(n => n.read).length}</p>
            </div>
          </div>
        )}
      </div>
    </DoctorLayout>
  );
}
