"use client";
import { useState, useEffect } from "react";
import { useToast } from "../../../components/ui/Toast";
import { useTranslations } from "next-intl";
import { FaBell, FaTrash, FaCheck, FaCheckDouble } from "react-icons/fa";
import useLocale from "../../../hooks/useLocale";

export default function PatientNotificationsPage() {
  const { locale } = useLocale();
  const { showToast, ToastContainer } = useToast();
  const [filter, setFilter] = useState("all");
  const t = useTranslations("notifications");
  const labels = {
    pageTitle: t("pageTitle"),
    unreadCount: (...args) => t("unreadCount", { unread: args[0], total: args[1] }),
    allRead: (...args) => t("allRead", { total: args[0] }),
    filterAll: t("filterAll"),
    filterUnread: t("filterUnread"),
    filterRead: t("filterRead"),
    markAllRead: t("markAllRead"),
    deleteAll: t("deleteAll"),
    markAsRead: t("markAsRead"),
    markAsUnread: t("markAsUnread"),
    deleteNotification: t("deleteNotification"),
    typeAppointment: t("typeAppointment"),
    typeResult: t("typeResult"),
    typeMessage: t("typeMessage"),
    typeReminder: t("typeReminder"),
    typeSystem: t("typeSystem"),
    noUnread: t("noUnread"),
    noRead: t("noRead"),
    noNotifications: t("noNotifications"),
    statsTotal: t("statsTotal"),
    statsUnread: t("statsUnread"),
    statsRead: t("statsRead"),
    toast: {
      notificationDeleted: t("notificationDeleted"),
      allDeleted: t("allDeleted"),
      markedRead: t("markedRead"),
      allMarkedRead: t("allMarkedRead"),
      markedUnread: t("markedUnread")
    },
    confirmDeleteAll: t("confirmDeleteAll"),
    timeMinutesAgo: (mins) => t("timeMinutesAgo", { mins }),
    timeHourAgo: () => t("timeHourAgo"),
    timeHoursAgo: (hours) => t("timeHoursAgo", { hours }),
    timeDaysAgo: (days) => t("timeDaysAgo", { days }),
    timeJustNow: () => t("timeJustNow"),
    // ...add all other keys as needed...
  };
  // ...existing code...
  // The following block is misplaced and should be removed or integrated into the i18n system.
  // Removed duplicate Arabic labels object.
  
  // Start with empty notifications (no fake data)
  const [notifications, setNotifications] = useState([]);

  // جلب الإشعارات الحقيقية من API
  useEffect(() => {
    async function fetchNotifications() {
      try {
        // يمكن تعديل userId حسب نظام المصادقة لديك
        const res = await fetch("/api/patient/notifications?userId=demo-user-id");
        if (res.ok) {
          const data = await res.json();
          setNotifications(data);
        }
      } catch (err) {
        // يمكن عرض رسالة خطأ إذا أردت
      }
    }
    fetchNotifications();
  }, []);

  const filteredNotifications = notifications.filter(notif => {
    if (filter === "unread") return !notif.read;
    if (filter === "read") return notif.read;
    return true;
  });

  const handleDelete = async (id) => {
    await fetch(`/api/patient/notifications?userId=demo-user-id&id=${id}`, { method: "DELETE" });
    setNotifications(notifications.filter(n => n.id !== id));
    showToast(labels.toast.notificationDeleted, "info");
  };

  const handleDeleteAll = async () => {
    if (window.confirm(labels.confirmDeleteAll)) {
      // حذف من الباك-إند
      await fetch("/api/patient/notifications?userId=demo-user-id", { method: "DELETE" });
      setNotifications([]);
      showToast(labels.toast.allDeleted, "success");
    }
  };

  const handleMarkAsRead = async (id) => {
    await fetch(`/api/patient/notifications?userId=demo-user-id&id=${id}`, { method: "PUT", body: JSON.stringify({ read: true }), headers: { "Content-Type": "application/json" } });
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
    showToast(labels.toast.markedRead, "info");
  };

  const handleMarkAllAsRead = async () => {
    // تحديث في الباك-إند
    await fetch("/api/patient/notifications?userId=demo-user-id", { method: "PUT" });
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    showToast(labels.toast.allMarkedRead, "success");
  };

  const handleMarkAsUnread = async (id) => {
    await fetch(`/api/patient/notifications?userId=demo-user-id&id=${id}`, { method: "PUT", body: JSON.stringify({ read: false }), headers: { "Content-Type": "application/json" } });
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: false } : n
    ));
    showToast(labels.toast.markedUnread, "info");
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
      appointment: "bg-(--ui-info-bg) text-(--ui-foreground) border border-(--ui-info-border)",
      result: "bg-(--ui-success-bg) text-(--ui-foreground) border border-(--ui-success-border)",
      message: "bg-(--ui-info-bg) text-(--ui-foreground) border border-(--ui-info-border)",
      reminder: "bg-(--ui-warning-bg) text-(--ui-foreground) border border-(--ui-warning-border)",
      system: "bg-(--ui-warning-bg) text-(--ui-foreground) border border-(--ui-warning-border)"
    };
    return colors[type] || "bg-(--ui-surface-2)/60 text-(--ui-foreground) border border-(--ui-border)";
  };

  const getTypeLabel = (type) => {
    const typeLabels = {
      appointment: labels.typeAppointment,
      result: labels.typeResult,
      message: labels.typeMessage,
      reminder: labels.typeReminder,
      system: labels.typeSystem
    };
    return typeLabels[type] || labels.typeSystem;
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const totalCount = notifications.length;

  return (
    <div className="min-h-screen bg-(--ui-surface) text-(--ui-foreground) py-8 px-4">
      <ToastContainer />
      
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold text-(--ui-foreground) mb-2">{labels.pageTitle}</h1>
            <p className="text-(--ui-muted-foreground)">
              {unreadCount > 0 ? labels.unreadCount(unreadCount, totalCount) : labels.allRead(totalCount)}
            </p>
          </div>
          <FaBell size={32} className="text-(--ui-success)" />
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-3 mb-8 flex-wrap">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg transition ${
              filter === "all"
                ? "bg-(--ui-success) text-(--ui-success-foreground)"
                : "bg-(--ui-surface-2)/60 text-(--ui-foreground) border border-(--ui-border) hover:bg-(--ui-surface-2)"
            }`}
          >
            {labels.filterAll} ({totalCount})
          </button>
          <button
            onClick={() => setFilter("unread")}
            className={`px-4 py-2 rounded-lg transition ${
              filter === "unread"
                ? "bg-(--ui-success) text-(--ui-success-foreground)"
                : "bg-(--ui-surface-2)/60 text-(--ui-foreground) border border-(--ui-border) hover:bg-(--ui-surface-2)"
            }`}
          >
            {labels.filterUnread} ({unreadCount})
          </button>
          <button
            onClick={() => setFilter("read")}
            className={`px-4 py-2 rounded-lg transition ${
              filter === "read"
                ? "bg-(--ui-success) text-(--ui-success-foreground)"
                : "bg-(--ui-surface-2)/60 text-(--ui-foreground) border border-(--ui-border) hover:bg-(--ui-surface-2)"
            }`}
          >
            {labels.filterRead} ({notifications.filter(n => n.read).length})
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mb-8 flex-wrap">
          <button
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0}
            className="inline-flex items-center gap-2 px-4 py-2 bg-(--ui-success) hover:bg-(--ui-success)/90 disabled:opacity-50 text-(--ui-success-foreground) rounded-lg transition"
          >
            <FaCheckDouble size={14} />
            {labels.markAllRead}
          </button>
          <button
            onClick={handleDeleteAll}
            disabled={totalCount === 0}
            className="inline-flex items-center gap-2 px-4 py-2 bg-(--ui-danger) hover:bg-(--ui-danger)/90 disabled:opacity-50 text-(--ui-danger-foreground) rounded-lg transition"
          >
            <FaTrash size={14} />
            {labels.deleteAll}
          </button>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <div className="card-glass border border-(--ui-border) rounded-xl p-12 text-center">
              <FaBell size={48} className="mx-auto mb-4 text-(--ui-muted-foreground)" />
              <p className="text-(--ui-muted-foreground) text-lg">
                {filter === "unread" ? labels.noUnread : 
                 filter === "read" ? labels.noRead : 
                 labels.noNotifications}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                className={`card-glass border border-(--ui-border) rounded-xl p-6 border-l-4 transition hover:shadow-lg ${
                  notif.read
                    ? "border-l-(--ui-border)"
                    : "border-l-(--ui-success)"
                } ${!notif.read ? "bg-(--ui-success-bg)" : ""}`}
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <span className="text-2xl">{getTypeIcon(notif.type)}</span>
                      <h3 className="text-lg font-semibold text-(--ui-foreground)">
                        {notif.title}
                      </h3>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${getTypeBadgeColor(notif.type)}`}>
                        {getTypeLabel(notif.type)}
                      </span>
                      {!notif.read && (
                        <div className="w-3 h-3 bg-(--ui-success) rounded-full ml-auto shrink-0"></div>
                      )}
                    </div>
                    <p className="text-(--ui-muted-foreground) mb-2">
                      {notif.message}
                    </p>
                    <p className="text-sm text-(--ui-muted-foreground)">
                      {notif.time}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 shrink-0">
                    {!notif.read ? (
                      <button
                        onClick={() => handleMarkAsRead(notif.id)}
                        title={labels.markAsRead}
                        className="p-2 text-(--ui-success) hover:bg-(--ui-success-bg) rounded-lg transition"
                      >
                        <FaCheck size={18} />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleMarkAsUnread(notif.id)}
                        title={labels.markAsUnread}
                        className="p-2 text-(--ui-muted-foreground) hover:bg-(--ui-surface-2)/60 rounded-lg transition"
                      >
                        <FaCheck size={18} />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(notif.id)}
                      title={labels.deleteNotification}
                      className="p-2 text-(--ui-danger) hover:bg-(--ui-danger-bg) rounded-lg transition"
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
            <div className="card-glass border border-(--ui-border) rounded-xl p-6 border-t-4 border-t-(--ui-info)">
              <h4 className="text-(--ui-muted-foreground) text-sm font-medium mb-2">{labels.statsTotal}</h4>
              <p className="text-3xl font-bold text-(--ui-foreground)">{totalCount}</p>
            </div>
            <div className="card-glass border border-(--ui-border) rounded-xl p-6 border-t-4 border-t-(--ui-warning)">
              <h4 className="text-(--ui-muted-foreground) text-sm font-medium mb-2">{labels.statsUnread}</h4>
              <p className="text-3xl font-bold text-(--ui-foreground)">{unreadCount}</p>
            </div>
            <div className="card-glass border border-(--ui-border) rounded-xl p-6 border-t-4 border-t-(--ui-success)">
              <h4 className="text-(--ui-muted-foreground) text-sm font-medium mb-2">{labels.statsRead}</h4>
              <p className="text-3xl font-bold text-(--ui-foreground)">{notifications.filter(n => n.read).length}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
