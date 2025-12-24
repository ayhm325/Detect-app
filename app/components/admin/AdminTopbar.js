import React, { useState } from "react";
import NotificationBell from "../ui/NotificationBell";
import useLocale from "../../hooks/useLocale";
import en from "../../locales/en";
import ar from "../../locales/ar";

export default function AdminTopbar() {
  const { locale } = useLocale();
  const tr = locale === "ar" ? ar.adminAnalysis : en.adminAnalysis;
  // العنوان من ملف الترجمة أو نص افتراضي
  const title = tr.adminTopbarTitle || (locale === "ar" ? "لوحة تحكم الأدمن" : "Admin Dashboard");
  // إشعارات تجريبية مترجمة
  const notifications = [
    {
      id: 1,
      title: tr.notifications?.newUserTitle || (locale === "ar" ? "مستخدم جديد" : "New User"),
      message: tr.notifications?.newUserMsg || (locale === "ar" ? "تم إضافة مستخدم جديد للنظام" : "A new user has been added to the system"),
      time: tr.notifications?.minutesAgo5 || (locale === "ar" ? "منذ 5 دقائق" : "5 minutes ago"),
      read: false,
    },
    {
      id: 2,
      title: tr.notifications?.newTestTitle || (locale === "ar" ? "فحص جديد" : "New Test"),
      message: tr.notifications?.newTestMsg || (locale === "ar" ? "تم رفع فحص طبي جديد للمراجعة" : "A new medical test has been uploaded for review"),
      time: tr.notifications?.minutesAgo15 || (locale === "ar" ? "منذ 15 دقيقة" : "15 minutes ago"),
      read: false,
    },
    {
      id: 3,
      title: tr.notifications?.systemAlertTitle || (locale === "ar" ? "تنبيه النظام" : "System Alert"),
      message: tr.notifications?.systemAlertMsg || (locale === "ar" ? "استخدام الذاكرة 85%" : "Memory usage 85%"),
      time: tr.notifications?.minutesAgo30 || (locale === "ar" ? "منذ 30 دقيقة" : "30 minutes ago"),
      read: true,
    },
  ];

  return (
    <header className="w-full h-16 bg-linear-to-r from-yellow-400 via-red-400 to-red-700 flex items-center justify-between px-6 shadow">
      <h2 className="text-xl font-bold text-white">{title}</h2>
      <NotificationBell notifications={notifications} />
    </header>
  );
}
