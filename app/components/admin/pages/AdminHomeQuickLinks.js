"use client";

import { FaUserMd, FaUserInjured, FaChartBar, FaComments, FaCogs } from "react-icons/fa";
import { useTranslations } from "next-intl";
import { withLocale } from "../../../i18n/routing";

export default function AdminHomeQuickLinks() {
  const t = useTranslations("adminHomeQuickLinks");

  return (
    <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mt-12">
      <a href={withLocale("/admin/dashboard")} className="card-glass flex flex-col items-center p-4 rounded-2xl border border-(--ui-border) hover:bg-(--ui-surface-2) shadow-(--shadow-soft) group transition">
        <FaChartBar className="text-4xl text-(--ui-muted-2) mb-2 group-hover:scale-110 transition-transform" />
        <span className="font-bold text-foreground">{t("dashboard")}</span>
      </a>
      <a href={withLocale("/admin/analysis")} className="card-glass flex flex-col items-center p-4 rounded-2xl border border-(--ui-border) hover:bg-(--ui-surface-2) shadow-(--shadow-soft) group transition">
        <FaChartBar className="text-4xl text-(--ui-muted-2) mb-2 group-hover:scale-110 transition-transform" />
        <span className="font-bold text-foreground">{t("analysis")}</span>
      </a>
      <a href={withLocale("/admin/doctors")} className="card-glass flex flex-col items-center p-4 rounded-2xl border border-(--ui-border) hover:bg-(--ui-surface-2) shadow-(--shadow-soft) group transition">
        <FaUserMd className="text-4xl text-(--ui-muted-2) mb-2 group-hover:scale-110 transition-transform" />
        <span className="font-bold text-foreground">{t("doctors")}</span>
      </a>
      <a href={withLocale("/admin/patients")} className="card-glass flex flex-col items-center p-4 rounded-2xl border border-(--ui-border) hover:bg-(--ui-surface-2) shadow-(--shadow-soft) group transition">
        <FaUserInjured className="text-4xl text-(--ui-muted-2) mb-2 group-hover:scale-110 transition-transform" />
        <span className="font-bold text-foreground">{t("patients")}</span>
      </a>
      <a href={withLocale("/admin/chat")} className="card-glass flex flex-col items-center p-4 rounded-2xl border border-(--ui-border) hover:bg-(--ui-surface-2) shadow-(--shadow-soft) group transition">
        <FaComments className="text-4xl text-(--ui-muted-2) mb-2 group-hover:scale-110 transition-transform" />
        <span className="font-bold text-foreground">{t("chat")}</span>
      </a>
      <a href={withLocale("/admin/settings")} className="card-glass flex flex-col items-center p-4 rounded-2xl border border-(--ui-border) hover:bg-(--ui-surface-2) shadow-(--shadow-soft) group transition">
        <FaCogs className="text-4xl text-(--ui-muted-2) mb-2 group-hover:scale-110 transition-transform" />
        <span className="font-bold text-foreground">{t("settings")}</span>
      </a>
    </div>
  );
}
