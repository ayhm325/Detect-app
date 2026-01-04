"use client";
import { useState, useMemo } from "react";
import DoctorLayout from "../DoctorLayout";
import { useToast } from "../../../components/ui/Toast";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaBell, FaTrash, FaCheck, FaCheckDouble, FaFilter } from "react-icons/fa";
import { useLocale, useTranslations } from "next-intl";

export default function NotificationsPage() {
  const locale = useLocale();
  const t = useTranslations("notifications");
  const { showSuccess, showError, showWarning, showInfo } = useToast();

  const [filter, setFilter] = useState("all");
  const [notifications, setNotifications] = useState([
    {
      id: "1",
      title: t("demo.items.0.title"),
      message: t("demo.items.0.message"),
      time: t("demo.items.0.time"),
      type: "appointment",
      read: false,
    },
    {
      id: "2",
      title: t("demo.items.1.title"),
      message: t("demo.items.1.message"),
      time: t("demo.items.1.time"),
      type: "result",
      read: false,
    },
    {
      id: "3",
      title: t("demo.items.2.title"),
      message: t("demo.items.2.message"),
      time: t("demo.items.2.time"),
      type: "message",
      read: true,
    },
  ]);

  const filteredNotifications = useMemo(() => {
    if (filter === "all") return notifications;
    if (filter === "unread") return notifications.filter((n) => !n.read);
    return notifications.filter((n) => n.read);
  }, [notifications, filter]);

  const handleDelete = (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
    showInfo(t("toast.deleted"));
  };

  const handleDeleteAll = () => {
    if (window.confirm(t("confirmDeleteAll"))) {
      setNotifications([]);
      showSuccess(t("toast.deletedAll"));
    }
  };

  const handleMarkAsRead = (id) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
    showInfo(t("toast.allMarkedRead"));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    showSuccess(t("toast.allMarkedRead"));
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
    const colors = {
      appointment: "bg-(--ui-info-bg) text-(--ui-info)",
      result: "bg-(--ui-success-bg) text-(--ui-success)",
      message: "bg-(--ui-info-bg) text-(--ui-info)",
      system: "bg-(--ui-warning-bg) text-(--ui-warning)"
    };
    return colors[type] || "bg-(--ui-surface-2) text-(--ui-foreground)";
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const totalCount = notifications.length;
  const readCount = notifications.filter(n => n.read).length;

  return (
    <DoctorLayout breadcrumbs={[{ label: t("title"), href: `${locale === "en" ? "/en" : "/ar"}/doctor/notifications` }]}> 
      <ToastContainer />
      
      <div className="py-8 px-4 md:px-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold text-(--ui-foreground) mb-2">{t("pageTitle")}</h1>
            <p className="text-(--ui-muted-foreground)">
              {unreadCount > 0
                ? t("unreadCount", { unread: unreadCount, total: totalCount })
                : t("allRead", { total: totalCount })}
            </p>
          </div>
          <FaBell size={32} className="text-(--ui-info)" />
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-3 mb-8 flex-wrap">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg transition ${
              filter === "all"
                ? "bg-(--ui-info) text-(--ui-info-foreground)"
                : "bg-(--ui-surface-2) text-(--ui-foreground) border border-(--ui-border) hover:bg-(--ui-surface-2)/70"
            }`}
          >
            {t("filterAll")} ({totalCount})
          </button>
          <button
            onClick={() => setFilter("unread")}
            className={`px-4 py-2 rounded-lg transition ${
              filter === "unread"
                ? "bg-(--ui-info) text-(--ui-info-foreground)"
                : "bg-(--ui-surface-2) text-(--ui-foreground) border border-(--ui-border) hover:bg-(--ui-surface-2)/70"
            }`}
          >
            {t("filterUnread")} ({unreadCount})
          </button>
          <button
            onClick={() => setFilter("read")}
            className={`px-4 py-2 rounded-lg transition ${
              filter === "read"
                ? "bg-(--ui-info) text-(--ui-info-foreground)"
                : "bg-(--ui-surface-2) text-(--ui-foreground) border border-(--ui-border) hover:bg-(--ui-surface-2)/70"
            }`}
          >
            {t("filterRead")} ({readCount})
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mb-8 flex-wrap">
          <button
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0}
            className="inline-flex items-center gap-2 px-4 py-2 bg-(--ui-success) text-(--ui-success-foreground) hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition"
          >
            <FaCheckDouble size={14} />
            {t("markAllRead")}
          </button>
          <button
            onClick={handleDeleteAll}
            disabled={totalCount === 0}
            className="inline-flex items-center gap-2 px-4 py-2 bg-(--ui-danger) text-(--ui-danger-foreground) hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition"
          >
            <FaTrash size={14} />
            {t("deleteAll")}
          </button>
        </div>

        {/* Notifications List */}
        <div className="space-y-4 max-w-4xl">
          {filteredNotifications.length === 0 ? (
            <div className="card-glass rounded-xl shadow-(--shadow-soft) p-12 text-center border border-(--ui-border)">
              <FaBell size={48} className="mx-auto mb-4 text-(--ui-muted-foreground)" />
              <p className="text-(--ui-muted-foreground) text-lg">
                {t("emptyState.title")}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                className={`card-glass rounded-xl shadow-(--shadow-soft) p-6 border border-(--ui-border) border-l-4 transition hover:shadow-(--shadow-lift) ${
                  notif.read 
                    ? "border-l-(--ui-border)" 
                    : "border-l-(--ui-info)"
                } ${!notif.read ? "bg-(--ui-info-bg)" : ""}`}
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{getTypeIcon(notif.type)}</span>
                      <h3 className="text-lg font-semibold text-(--ui-foreground)">
                        {notif.title}
                      </h3>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${getTypeBadgeColor(notif.type)}`}>
                        {t(`types.${notif.type}`)}
                      </span>
                      {!notif.read && (
                        <div className="w-3 h-3 bg-(--ui-info) rounded-full ml-auto shrink-0"></div>
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
                        title={t("markAsRead")}
                        className="p-2 text-(--ui-success) hover:bg-(--ui-success-bg) rounded-lg transition"
                      >
                        <FaCheck size={18} />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleMarkAsUnread(notif.id)}
                        title={t("markAsUnread")}
                        className="p-2 text-(--ui-muted-foreground) hover:bg-(--ui-surface-2) rounded-lg transition"
                      >
                        <FaCheck size={18} />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(notif.id)}
                      title={t("deleteNotification")}
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12 max-w-4xl">
            <div className="card-glass rounded-xl shadow-(--shadow-soft) p-6 border border-(--ui-border) border-t-4 border-t-(--ui-info)">
              <h4 className="text-(--ui-muted-foreground) text-sm font-medium mb-2">{t("statsTotal")}</h4>
              <p className="text-3xl font-bold text-(--ui-foreground)">{totalCount}</p>
            </div>
            <div className="card-glass rounded-xl shadow-(--shadow-soft) p-6 border border-(--ui-border) border-t-4 border-t-(--ui-warning)">
              <h4 className="text-(--ui-muted-foreground) text-sm font-medium mb-2">{t("statsUnread")}</h4>
              <p className="text-3xl font-bold text-(--ui-foreground)">{unreadCount}</p>
            </div>
            <div className="card-glass rounded-xl shadow-(--shadow-soft) p-6 border border-(--ui-border) border-t-4 border-t-(--ui-success)">
              <h4 className="text-(--ui-muted-foreground) text-sm font-medium mb-2">{t("statsRead")}</h4>
              <p className="text-3xl font-bold text-(--ui-foreground)">{readCount}</p>
            </div>
          </div>
        )}
      </div>
    </DoctorLayout>
  );
}
