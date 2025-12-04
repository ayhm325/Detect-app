"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function PatientLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  
  const mockPatient = {
    fullName: "أحمد محمد علي",
    avatarUrl: "/icons/patient-placeholder.png",
    notificationsCount: 3,
  };

  const patientNavItems = [
    { href: "/patient/dashboard", label: "الصفحة الرئيسية", icon: "🏠" },
    { href: "/patient/appointments", label: "المواعيد", icon: "📅" },
    { href: "/patient/results", label: "التقارير", icon: "📄" },
    { href: "/patient/chat", label: "الدردشة", icon: "💬" },
    { href: "/patient/profile", label: "الحساب", icon: "👤" },
    { href: "__logout__", label: "تسجيل الخروج", icon: "🚪" },
  ];

  const handleLogout = () => {
    // Clear auth data
    if (typeof window !== 'undefined') {
      localStorage.clear();
      sessionStorage.clear();
    }
    router.replace("/ar");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex" dir="rtl">
      {/* Fixed Sidebar */}
      <div
        className={`fixed right-0 top-0 h-screen bg-linear-to-b from-slate-900 via-slate-800 to-slate-900 shadow-2xl transition-all duration-300 z-50 ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-700">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-linear-to-br from-blue-400 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">DX</span>
              </div>
              <span className="text-white font-bold text-lg">Detect</span>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-300 hover:text-white"
            title={collapsed ? "فتح الشريط" : "إغلاق الشريط"}
          >
            {collapsed ? "←" : "→"}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <div className="space-y-1">
            {patientNavItems.map((item) => {
              const isActive = pathname?.startsWith(item.href);
              const isLogout = item.href === "__logout__";

              if (isLogout) {
                return (
                  <button
                    key="logout"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-red-500/20 transition-all"
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
                      ? "bg-linear-to-r from-blue-600 to-blue-500 text-white shadow-lg"
                      : "text-slate-300 hover:text-white hover:bg-slate-700/50"
                  }`}
                  title={collapsed ? item.label : ""}
                >
                  <span className="text-lg shrink-0">{item.icon}</span>
                  {!collapsed && <span className="text-sm font-medium truncate">{item.label}</span>}
                </a>
              );
            })}
          </div>
        </nav>

        {/* Footer */}
        {!collapsed && (
          <div className="border-t border-slate-700 p-3 text-xs text-slate-400 space-y-1">
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
