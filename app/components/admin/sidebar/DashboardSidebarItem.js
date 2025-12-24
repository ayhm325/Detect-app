"use client";

import Link from "next/link";
import { FaTachometerAlt } from "react-icons/fa";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { withLocale } from "../../../i18n/routing";

export default function DashboardSidebarItem() {
  const t = useTranslations("adminSidebar.nav");
  // ...existing code...
  // Use withLocale for locale-aware links

  return (
    <Link href={withLocale("/admin/dashboard")} className="flex items-center gap-3 py-2.5 px-4 rounded-xl hover:bg-yellow-50 dark:hover:bg-zinc-800 font-bold text-zinc-700 dark:text-zinc-200 transition group">
      <FaTachometerAlt className="text-yellow-500 text-lg group-hover:scale-110 transition-transform" />
      <span>{t("dashboard")}</span>
    </Link>
  );
}
