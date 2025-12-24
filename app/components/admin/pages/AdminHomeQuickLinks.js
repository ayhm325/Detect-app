"use client";

import { FaUserMd, FaUserInjured, FaChartBar, FaComments, FaCogs } from "react-icons/fa";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { withLocale } from "../../../i18n/routing";

export default function AdminHomeQuickLinks() {
  const t = useTranslations("adminHomeQuickLinks");

  return (
    <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mt-12">
      <a href={withLocale("/admin/dashboard")} className="flex flex-col items-center p-4 rounded-2xl bg-white/80 hover:bg-yellow-100 border-2 border-yellow-200 shadow group transition">
        <FaChartBar className="text-4xl text-yellow-500 mb-2 group-hover:scale-110 transition-transform" />
        <span className="font-bold text-zinc-700">{t("dashboard")}</span>
      </a>
      <a href={withLocale("/admin/analysis")} className="flex flex-col items-center p-4 rounded-2xl bg-white/80 hover:bg-blue-100 border-2 border-blue-200 shadow group transition">
        <FaChartBar className="text-4xl text-blue-500 mb-2 group-hover:scale-110 transition-transform" />
        <span className="font-bold text-zinc-700">{t("analysis")}</span>
      </a>
      <a href={withLocale("/admin/doctors")} className="flex flex-col items-center p-4 rounded-2xl bg-white/80 hover:bg-red-100 border-2 border-red-200 shadow group transition">
        <FaUserMd className="text-4xl text-red-500 mb-2 group-hover:scale-110 transition-transform" />
        <span className="font-bold text-zinc-700">{t("doctors")}</span>
      </a>
      <a href={withLocale("/admin/patients")} className="flex flex-col items-center p-4 rounded-2xl bg-white/80 hover:bg-yellow-50 border-2 border-yellow-300 shadow group transition">
        <FaUserInjured className="text-4xl text-yellow-600 mb-2 group-hover:scale-110 transition-transform" />
        <span className="font-bold text-zinc-700">{t("patients")}</span>
      </a>
      <a href={withLocale("/admin/chat")} className="flex flex-col items-center p-4 rounded-2xl bg-white/80 hover:bg-red-50 border-2 border-red-300 shadow group transition">
        <FaComments className="text-4xl text-red-400 mb-2 group-hover:scale-110 transition-transform" />
        <span className="font-bold text-zinc-700">{t("chat")}</span>
      </a>
      <a href={withLocale("/admin/settings")} className="flex flex-col items-center p-4 rounded-2xl bg-white/80 hover:bg-yellow-50 border-2 border-yellow-400 shadow group transition">
        <FaCogs className="text-4xl text-yellow-700 mb-2 group-hover:scale-110 transition-transform" />
        <span className="font-bold text-zinc-700">{t("settings")}</span>
      </a>
    </div>
  );
}
