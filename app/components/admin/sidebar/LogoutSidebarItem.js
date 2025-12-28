"use client";

import Link from "next/link";
import { FaSignOutAlt } from "react-icons/fa";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { withLocale } from "../../../i18n/routing";

export default function LogoutSidebarItem() {
  const t = useTranslations("adminSidebar.nav");
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname?.startsWith("/en") ? "en" : "ar";
  const basePrefix = locale === "en" ? "/en" : "/ar";

  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
        headers: token ? { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' },
        body: token ? JSON.stringify({ token }) : undefined,
      }).catch(() => {});
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        sessionStorage.clear();
      }
      router.replace(basePrefix);
    }
  };

  return (
    <a href="#" onClick={handleLogout} className="flex items-center gap-3 py-2.5 px-4 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-zinc-800 font-bold transition group">
      <FaSignOutAlt className="text-red-500 text-lg group-hover:scale-110 transition-transform" />
      <span>{t("logout")}</span>
    </a>
  );
}
