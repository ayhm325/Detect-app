"use client";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useTheme } from "../theme-provider";

export default function AdminLayout({ children, breadcrumbs, adminName = "المسؤول", adminImage = "/admin-placeholder.png" }) {
  const [collapsed, setCollapsed] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  const toggleLanguage = () => {
    const path = pathname || "/";
    if (path.startsWith("/en")) {
      router.replace(path.slice(3) || "/");
    } else {
      router.replace(`/en${path}`);
    }
  };

  const adminNavItems = [
    { href: "/admin/dashboard", label: "لوحة التحكم", icon: "📊" },
    { href: "/admin/users", label: "المستخدمين", icon: "👥" },
    { href: "/admin/patients", label: "المرضى", icon: "🏥" },
    { href: "/admin/doctors", label: "الأطباء", icon: "👨‍⚕️" },
    { href: "/admin/analysis", label: "التحليلات", icon: "📈" },
    { href: "/admin/settings", label: "الإعدادات", icon: "⚙️" },
    { href: "/admin/chat", label: "الدردشة", icon: "💬" },
    { href: "__logout__", label: "تسجيل الخروج", icon: "🚪" },
  ];

  const handleLogout = () => {
    // Clear admin session data
    if (typeof window !== "undefined") {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminUser");
      sessionStorage.clear();
    }
    router.replace("/ar");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex" dir="rtl">
      {/* Fixed Sidebar */}
      <div
        className={`fixed right-0 top-0 h-screen bg-linear-to-b from-gray-50 via-white to-gray-100 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900 shadow-2xl transition-all duration-300 z-50 ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-zinc-700">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-red-600 rounded-full blur opacity-40" />
                <div className="relative flex items-center justify-center w-10 h-10 bg-gradient-to-br from-yellow-400 via-red-400 to-red-600 rounded-full shadow-lg">
                  <span className="text-xl" aria-label="Lung icon">🫁</span>
                </div>
              </div>
              <span className="font-black text-lg bg-gradient-to-r from-yellow-600 via-red-500 to-red-700 bg-clip-text text-transparent">PneumoDetect</span>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition-colors text-gray-700 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white"
            title={collapsed ? "فتح الشريط" : "إغلاق الشريط"}
          >
            {collapsed ? "←" : "→"}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <div className="space-y-1">
            {adminNavItems.map((item) => {
              const isActive = pathname?.startsWith(item.href);
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
                <a
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
                </a>
              );
            })}
            <button
              onClick={() => setTheme(isDark ? "light" : "dark")}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-700/50 transition-all w-full"
              title={collapsed ? (isDark ? "الوضع النهاري" : "الوضع الليلي") : ""}
            >
              <span className="text-lg shrink-0">{isDark ? "☀️" : "🌙"}</span>
              {!collapsed && <span className="text-sm font-medium">{isDark ? "الوضع النهاري" : "الوضع الليلي"}</span>}
            </button>
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-700/50 transition-all w-full"
              title={collapsed ? "تبديل اللغة" : ""}
            >
              <span className="text-lg shrink-0">🌐</span>
              {!collapsed && <span className="text-sm font-medium">تبديل اللغة</span>}
            </button>
          </div>
        </nav>

        {/* Footer */}
        {!collapsed && (
          <div className="border-t border-gray-200 dark:border-zinc-700 p-3 text-xs text-gray-500 dark:text-zinc-400 space-y-1">
            <div>الإصدار: 1.0</div>
            <div>الحالة: متصل ✓</div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${collapsed ? "mr-20" : "mr-64"}`}>
        <div className="min-h-screen">
          {children}
        </div>
      </div>
    </div>
  );
}
