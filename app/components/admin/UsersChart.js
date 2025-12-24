import React from "react";
import useLocale from "../../hooks/useLocale";
import en from "../../locales/en";
import ar from "../../locales/ar";

export default function UsersChart() {
  const { locale } = useLocale();
  const tr = locale === "ar" ? ar.adminAnalysis : en.adminAnalysis;
  const chartTitle = tr.usersSection?.chartTitle || (locale === "ar" ? "رسم بياني للمستخدمين" : "Users Chart");
  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-yellow-200 mt-8">
      <h3 className="font-bold text-lg mb-4 text-yellow-700">{chartTitle}</h3>
      <div className="w-full h-32 bg-linear-to-r from-yellow-100 via-red-100/40 to-white rounded-xl" />
    </div>
  );
}
