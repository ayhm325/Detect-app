import React from "react";
import useLocale from "../../hooks/useLocale";
import en from "../../locales/en";
import ar from "../../locales/ar";

export default function RecentActivity() {
  const { locale } = useLocale();
  const tr = locale === "ar" ? ar.adminAnalysis : en.adminAnalysis;
  const activityTr = tr.recentActivity || {};
  const title = activityTr.title || (locale === "ar" ? "آخر الأنشطة" : "Recent Activity");
  // أنشطة تجريبية مترجمة
  const activities = [
    {
      id: 1,
      text: activityTr.addUser || (locale === "ar" ? "تم إضافة مستخدم جديد: أحمد علي" : "New user added: Ahmed Ali"),
      time: activityTr.minuteAgo || (locale === "ar" ? "قبل دقيقة" : "a minute ago"),
    },
    {
      id: 2,
      text: activityTr.editPatient || (locale === "ar" ? "تم تعديل بيانات مريض: منى عبد الله" : "Patient updated: Mona Abdullah"),
      time: activityTr.minutesAgo5 || (locale === "ar" ? "قبل 5 دقائق" : "5 minutes ago"),
    },
    {
      id: 3,
      text: activityTr.deleteDoctor || (locale === "ar" ? "تم حذف طبيب: د. سامي يوسف" : "Doctor deleted: Dr. Sami Youssef"),
      time: activityTr.minutesAgo10 || (locale === "ar" ? "قبل 10 دقائق" : "10 minutes ago"),
    },
  ];
  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-yellow-100 mt-8">
      <h3 className="font-bold text-lg mb-4 text-yellow-700">{title}</h3>
      <ul className="space-y-3">
        {activities.map(act => (
          <li key={act.id} className="flex justify-between text-zinc-700">
            <span>{act.text}</span>
            <span className="text-xs text-zinc-400">{act.time}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
