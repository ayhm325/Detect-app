"use client";

import Link from "next/link";
import { FaUserMd } from "react-icons/fa";
import { useTranslations } from "next-intl";
import { withLocale } from "../../../i18n/routing";

export default function DoctorsSidebarItem() {
  const t = useTranslations("adminSidebar.nav");

  return (
    <Link
      href={withLocale("/admin/doctors")}
      className="flex items-center gap-3 py-2.5 px-4 rounded-xl hover:bg-(--ui-surface-2)/60 font-semibold text-(--ui-foreground) transition group"
    >
      <FaUserMd className="text-(--ui-muted-foreground) text-lg group-hover:scale-110 transition-transform" />
      <span>{t("doctors")}</span>
    </Link>
  );
}
