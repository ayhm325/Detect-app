"use client";

import { FaChartBar, FaComments, FaCogs } from "react-icons/fa";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { withLocale } from "../../../i18n/routing";

// ...existing code...

export default function AdminDashboardQuickLinks() {
  const t = useTranslations("adminDashboardQuickLinks");

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
      <a href={withLocale("/admin/analysis")} className="flex flex-col items-center p-6 rounded-2xl bg-white/80 hover:bg-yellow-100 border-2 border-yellow-200 shadow group transition">
        <FaChartBar className="text-3xl text-yellow-500 mb-2 group-hover:scale-110 transition-transform" />
        <span className="font-bold text-zinc-700">{t("analysis")}</span>
      </a>
      <a href={withLocale("/admin/chat")} className="flex flex-col items-center p-6 rounded-2xl bg-white/80 hover:bg-red-100 border-2 border-red-200 shadow group transition">
        <FaComments className="text-3xl text-red-500 mb-2 group-hover:scale-110 transition-transform" />
        <span className="font-bold text-zinc-700">{t("chat")}</span>
      </a>
      <a href={withLocale("/admin/settings")} className="flex flex-col items-center p-6 rounded-2xl bg-white/80 hover:bg-yellow-50 border-2 border-yellow-400 shadow group transition">
        <FaCogs className="text-3xl text-yellow-700 mb-2 group-hover:scale-110 transition-transform" />
        <span className="font-bold text-zinc-700">{t("settings")}</span>
      </a>
    </div>
  );
}
