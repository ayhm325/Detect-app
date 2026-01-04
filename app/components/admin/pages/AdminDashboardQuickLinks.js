"use client";

import { FaChartBar, FaComments, FaCogs } from "react-icons/fa";
import { useTranslations } from "next-intl";
import { withLocale } from "../../../i18n/routing";

// ...existing code...

export default function AdminDashboardQuickLinks() {
  const t = useTranslations("adminDashboardQuickLinks");

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
      <a href={withLocale("/admin/analysis")} className="card-glass flex flex-col items-center p-6 rounded-2xl border border-(--ui-border) hover:bg-(--ui-surface-2) shadow-(--shadow-soft) group transition">
        <FaChartBar className="text-3xl text-(--ui-muted-2) mb-2 group-hover:scale-110 transition-transform" />
        <span className="font-bold text-foreground">{t("analysis")}</span>
      </a>
      <a href={withLocale("/admin/chat")} className="card-glass flex flex-col items-center p-6 rounded-2xl border border-(--ui-border) hover:bg-(--ui-surface-2) shadow-(--shadow-soft) group transition">
        <FaComments className="text-3xl text-(--ui-muted-2) mb-2 group-hover:scale-110 transition-transform" />
        <span className="font-bold text-foreground">{t("chat")}</span>
      </a>
      <a href={withLocale("/admin/settings")} className="card-glass flex flex-col items-center p-6 rounded-2xl border border-(--ui-border) hover:bg-(--ui-surface-2) shadow-(--shadow-soft) group transition">
        <FaCogs className="text-3xl text-(--ui-muted-2) mb-2 group-hover:scale-110 transition-transform" />
        <span className="font-bold text-foreground">{t("settings")}</span>
      </a>
    </div>
  );
}
