"use client";

import Link from "next/link";
import { FaComments } from "react-icons/fa";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { withLocale } from "../../../i18n/routing";

export default function ChatSidebarItem() {
  const t = useTranslations("adminSidebar.nav");

  return (
    <Link
      href={withLocale("/admin/chat")}
      className="flex items-center gap-3 py-2.5 px-4 rounded-xl hover:bg-yellow-50 dark:hover:bg-zinc-800 font-bold text-zinc-700 dark:text-zinc-200 transition group"
    >
      <FaComments className="text-red-400 text-lg group-hover:scale-110 transition-transform" />
      <span>{t("chat")}</span>
    </Link>
  );
}
