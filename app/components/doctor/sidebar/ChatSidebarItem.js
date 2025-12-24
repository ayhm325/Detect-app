"use client";


import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

export default function ChatSidebarItem() {
  const pathname = usePathname();
  const locale = pathname?.startsWith("/en") ? "en" : "ar";
  const basePrefix = locale === "en" ? "/en" : "/ar";
  const t = useTranslations("doctorSidebar");

  return (
    <Link href={`${basePrefix}/doctor/chat`} className="py-2 px-4 rounded hover:bg-blue-100 dark:hover:bg-zinc-800 font-medium block">
      {t("chat")}
    </Link>
  );
}
