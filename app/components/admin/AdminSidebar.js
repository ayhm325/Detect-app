"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useTheme } from "../../theme-provider";
import { useLocaleContext } from "../../hooks/useLocaleContext";
import { useTranslations } from "next-intl";

export default function AdminSidebar({ collapsed, setCollapsed }) {
  // Removed unnecessary setMounted and useEffect
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { toggleLocale } = useLocaleContext();
  const locale = pathname?.startsWith("/en") ? "en" : "ar";
  const t = useTranslations("adminSidebar");
  const basePrefix = `/${locale}`;
  const isDark = theme === "dark";
  const router = useRouter();

  const handleLogoutClick = async () => {
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
  // ...existing code...
  // Use t("key") for all navigation labels
  const items = [
    {
      href: `${basePrefix}/admin/dashboard`,
      label: t("nav.dashboard"),
      icon: "📊"
    },
    {
      href: `${basePrefix}/admin/users`,
      label: t("nav.users"),
      icon: "👥"
    },
    {
      href: `${basePrefix}/admin/patients`,
      label: t("nav.patients"),
      icon: "🧑‍🤝‍🧑"
    },
    {
      href: `${basePrefix}/admin/doctors`,
      label: t("nav.doctors"),
      icon: "🧑‍⚕️"
    },
    {
      href: `${basePrefix}/admin/doctor-change-requests-page`,
      label: t("nav.doctorChangeRequests"),
      icon: "📝"
    },
    
    {
      href: `${basePrefix}/admin/settings`,
      label: t("nav.settings"),
      icon: "⚙️"
    },
    {
      href: "__logout__",
      label: t("nav.logout"),
      icon: "🚪"
    },
  ];
  return (
    <div className={`fixed top-0 h-screen bg-linear-to-b from-gray-50 via-white to-gray-100 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900 shadow-2xl transition-all duration-300 z-50 ${collapsed ? "w-20" : "w-64"} ${locale === "ar" ? "right-0" : "left-0"}`}> 
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-zinc-700">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="absolute inset-0 bg-linear-to-br from-yellow-400 to-red-600 rounded-full blur opacity-40" />
              <div className="relative flex items-center justify-center w-10 h-10 bg-linear-to-br from-yellow-400 via-red-400 to-red-600 rounded-full shadow-lg">
                <span className="text-xl" aria-label="Lung icon">🫁</span>
              </div>
            </div>
            <span className="font-black text-lg bg-linear-to-r from-yellow-600 via-red-500 to-red-700 bg-clip-text text-transparent">PneumoDetect</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition-colors text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white"
          title={collapsed ? t("ui.collapseOpen") : t("ui.collapseClose")}
        >
          {collapsed ? "←" : "→"}
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <div className="space-y-1">
          {items.map((item) => {
            const isActive = pathname?.startsWith(item.href);
            const isLogout = item.href === "__logout__";
            if (isLogout) {
              return (
                <button
                  key="logout"
                  onClick={handleLogoutClick}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white hover:bg-red-100 dark:hover:bg-red-500/20 transition-all ${collapsed ? "justify-center" : ""}`}
                  title={collapsed ? item.label : ""}
                >
                  <span className="text-lg shrink-0">{item.icon}</span>
                  {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
                </button>
              );
            }
            return (
              <a
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                  isActive
                    ? "bg-linear-to-r from-yellow-500 to-red-500 text-white shadow-lg"
                    : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-700/50"
                } ${collapsed ? "justify-center" : ""}`}
                title={collapsed ? item.label : ""}
              >
                <span className="text-lg shrink-0">{item.icon}</span>
                {!collapsed && <span className="text-sm font-medium truncate">{item.label}</span>}
              </a>
            );
          })}
          {/* زر تبديل الوضع الليلي */}
          <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-700/50 transition-all w-full ${collapsed ? "justify-center" : ""}`}
            title={collapsed ? (isDark ? t("ui.themeLight") : t("ui.themeDark")) : ""}
          >
            <span className="text-lg shrink-0">{isDark ? "☀️" : "🌙"}</span>
            {!collapsed && <span className="text-sm font-medium">{isDark ? t("ui.themeLight") : t("ui.themeDark")}</span>}
          </button>
          {/* زر تبديل اللغة */}
          <button
            onClick={toggleLocale}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-all w-full ${collapsed ? "justify-center" : ""}`}
            title={collapsed ? (locale === "ar" ? t("ui.switchToEn") : t("ui.switchTo")) : ""}
          >
            <span className="text-lg shrink-0">🌐</span>
            {!collapsed && <span className="text-sm font-medium">{locale === "ar" ? t("ui.switchToEn") : t("ui.switchTo")}</span>}
          </button>
        </div>
      </nav>
      {/* Footer */}
      {!collapsed && (
        <div className="border-t border-gray-200 dark:border-zinc-700 p-3 text-xs text-gray-500 dark:text-zinc-400 space-y-1">
          <div>{t("footer.version")}</div>
          <div>{t("footer.operational")}</div>
        </div>
      )}
    </div>
  );
}
