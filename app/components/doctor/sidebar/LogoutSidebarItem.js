"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

export default function LogoutSidebarItem() {
  const pathname = usePathname();
  const locale = pathname?.startsWith("/en") ? "en" : "ar";
  const basePrefix = locale === "en" ? "/en" : "/ar";
  const t = useTranslations("doctorSidebar");

  return (
    <Link
      href={`${basePrefix}/doctor/logout`}
      className="py-2 px-4 rounded text-(--ui-danger) hover:bg-(--ui-danger-bg) font-medium block"
    >
      {t("logout")}
    </Link>
  );
}
