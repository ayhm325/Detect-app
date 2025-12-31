"use client";
export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "../../theme-provider";
import { useLocaleContext } from "../../hooks/useLocaleContext";
import AuthGuard from "../../components/AuthGuard";

export default function PatientLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const { toggleLocale } = useLocaleContext();
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";
  const basePath = locale === "en" ? "/en" : "/ar";
  const t = useTranslations("patient");

  // Safe translation helper: next-intl throws when a key is missing for a locale.
  // Use this to return a fallback string when translations are not present.
  const safeT = (key, fallback) => {
    try {
      const v = t(key);
      // If the translation function returns the key itself, treat as missing
      if (typeof v === 'string' && v === key) return fallback;
      return v;
    } catch (e) {
      return fallback;
    }
  };

  // Patient navigation items with translation
  const patientNavItems = [
    {
      href: `${basePath}/patient/dashboard`,
      label: safeT("nav.home", locale === 'ar' ? 'الرئيسية' : 'Home'),
      icon: "🏠",
    },
    {
      href: `${basePath}/patient/appointments`,
      label: safeT("nav.appointments", locale === 'ar' ? 'المواعيد' : 'Appointments'),
      icon: "📅",
    },
    {
      href: `${basePath}/patient/analysis`,
      label: safeT("nav.analysis", locale === 'ar' ? 'التحاليل' : 'Analysis'),
      icon: "🔬",
    },
    {
      href: `${basePath}/patient/analysis/history`,
      label: safeT("nav.history", locale === 'ar' ? 'التاريخ' : 'History'),
      icon: "📜",
    },
    {
      href: `${basePath}/patient/results`,
      label: safeT("nav.results", locale === 'ar' ? 'النتائج' : 'Results'),
      icon: "📄",
    },
    {
      href: `${basePath}/patient/chat`,
      label: safeT("nav.chat", locale === 'ar' ? 'الدردشة' : 'Chat'),
      icon: "💬",
    },
    {
      href: `${basePath}/patient/profile`,
      label: safeT("nav.profile", locale === 'ar' ? 'الملف' : 'Profile'),
      icon: "👤",
    },
    {
      href: "__logout__",
      label: safeT("nav.logout", locale === 'ar' ? 'تسجيل الخروج' : 'Logout'),
      icon: "🚪",
    },
  ];


  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.clear();
      sessionStorage.clear();
    }
    router.push(`${basePath}/patient/logout`);
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex" dir={locale === "ar" ? "rtl" : "ltr"}>
        {/* Fixed Sidebar */}
        <div
          className={`fixed ${locale === "ar" ? "right-0" : "left-0"} top-0 h-screen bg-linear-to-b from-gray-50 via-white to-gray-100 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900 shadow-2xl transition-all duration-300 z-50 ${
            collapsed ? "w-20" : "w-64"
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-slate-700">
            {!collapsed && (
              <div className="flex items-center gap-2">
                <div className="relative">
                  <div className="absolute inset-0 bg-linear-to-br from-yellow-400 to-red-600 rounded-full blur opacity-40" />
                  <div className="relative flex items-center justify-center w-10 h-10 bg-linear-to-br from-yellow-400 via-red-400 to-red-600 rounded-full shadow-lg">
                    <span className="text-xl" aria-label="Lung icon">🫁</span>
                  </div>
                </div>
                <span className="font-black text-lg bg-linear-to-r from-yellow-600 via-red-500 to-red-700 bg-clip-text text-transparent">{safeT("brand", locale === 'ar' ? 'تطبيق التحاليل' : 'Analysis App')}</span>
              </div>
            )}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition-colors text-gray-700 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white"
              title={collapsed ? (locale === "ar" ? "فتح الشريط" : "Expand sidebar") : (locale === "ar" ? "إغلاق الشريط" : "Collapse sidebar")}
            >
              {collapsed ? "←" : "→"}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4 px-3">
            <div className="space-y-1">
              {patientNavItems.map((item) => {
                const normalize = (p) => (p || "").replace(/\/+$|^\s+|\s+$/g, '');
                const np = normalize(pathname);
                const ih = normalize(item.href);
                // Prevent parent 'analysis' from matching child '/analysis/history'
                const isActive = (() => {
                  if (!np || !ih) return false;
                  if (item.href === `${basePath}/patient/analysis`) {
                    return np === ih;
                  }
                  return np === ih || np.startsWith(ih + '/');
                })();
                const isLogout = item.href === "__logout__";

                if (isLogout) {
                  return (
                    <button
                      key="logout"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white hover:bg-red-100 dark:hover:bg-red-500/20 transition-all"
                      title={collapsed ? item.label : ""}
                    >
                      <span className="text-lg shrink-0">{item.icon}</span>
                      {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
                    </button>
                  );
                }

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                      isActive
                        ? "bg-linear-to-r from-yellow-500 to-red-500 text-white shadow-lg"
                        : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-700/50"
                    }`}
                    title={collapsed ? item.label : ""}
                  >
                    <span className="text-lg shrink-0">{item.icon}</span>
                    {!collapsed && <span className="text-sm font-medium truncate">{item.label}</span>}
                  </Link>
                );
              })}

              {/* Theme toggle */}
              <button
                onClick={() => setTheme(isDark ? "light" : "dark")}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-700/50 transition-all w-full"
                title={collapsed ? (isDark ? safeT("theme.light", locale === 'ar' ? 'وضع فاتح' : 'Light theme') : safeT("theme.dark", locale === 'ar' ? 'وضع داكن' : 'Dark theme')) : ""}
              >
                <span className="text-lg shrink-0">{isDark ? "☀️" : "🌙"}</span>
                {!collapsed && <span className="text-sm font-medium">{isDark ? safeT("theme.light", locale === 'ar' ? 'وضع فاتح' : 'Light theme') : safeT("theme.dark", locale === 'ar' ? 'وضع داكن' : 'Dark theme')}</span>}
              </button>
              <button
                onClick={toggleLocale}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-all w-full"
                title={collapsed ? "تبديل اللغة" : ""}
              >
                <span className="text-lg shrink-0">🌐</span>
                {!collapsed && <span className="text-sm font-medium">{locale === "ar" ? "English" : "العربية"}</span>}
              </button>
            </div>
          </nav>

          {/* Footer */}
          {!collapsed && (
            <div className="border-t border-gray-200 dark:border-zinc-700 p-3 text-xs text-gray-500 dark:text-zinc-400 space-y-1">
              <div>{safeT("version", "v1.0.0")}</div>
              <div>{safeT("status", locale === 'ar' ? 'الاتصال بخادم' : 'Server status')}</div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div
          className={`flex-1 transition-all duration-300 ${
            collapsed ? (locale === "ar" ? "mr-20" : "ml-20") : (locale === "ar" ? "mr-64" : "ml-64")
          }`}
        >
          <div className="min-h-screen">{children}</div>
        </div>
      </div>
    </AuthGuard>
  );
}
