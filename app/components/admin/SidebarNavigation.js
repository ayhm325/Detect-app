
import Image from "next/image";
import React from "react";
import DoctorChangeRequestsSidebarItem from "./sidebar/DoctorChangeRequestsSidebarItem";
import DashboardSidebarItem from "./sidebar/DashboardSidebarItem";
import UsersSidebarItem from "./sidebar/UsersSidebarItem";
import DoctorsSidebarItem from "./sidebar/DoctorsSidebarItem";
import PatientsSidebarItem from "./sidebar/PatientsSidebarItem";
import AnalysisSidebarItem from "./sidebar/AnalysisSidebarItem";
import ChatSidebarItem from "./sidebar/ChatSidebarItem";
import SettingsSidebarItem from "./sidebar/SettingsSidebarItem";
import LogoutSidebarItem from "./sidebar/LogoutSidebarItem";
import { useTheme } from "@/app/theme-provider";
import useLocale from "../../hooks/useLocale";
import { useTranslations } from "next-intl";

export default function SidebarNavigation() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";
  const { locale, switchLocale } = useLocale();
  const t = useTranslations("adminSidebar.ui");
  return (
    <aside className={`w-full md:w-60 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 h-full flex flex-col p-4 gap-2`} dir={locale === "ar" ? "rtl" : "ltr"}>
      {/* شعار PneumoDetect مع أيقونة الرئتين */}
      <div className="flex items-center gap-2 mb-4">
        <div className="relative flex items-center justify-center w-10 h-10 bg-linear-to-br from-yellow-400 via-red-400 to-red-600 rounded-full shadow-lg">
          <span className="text-xl" aria-label="Lung icon">🫁</span>
        </div>
        <span className="font-black text-lg bg-linear-to-r from-yellow-600 via-red-500 to-red-700 bg-clip-text text-transparent">PneumoDetect</span>
      </div>
      <nav className="flex flex-col gap-2">
        <DashboardSidebarItem />
        <UsersSidebarItem />
        <DoctorsSidebarItem />
        <PatientsSidebarItem />
        <DoctorChangeRequestsSidebarItem />
        <AnalysisSidebarItem />
        <ChatSidebarItem />
        <SettingsSidebarItem />
        <button
          onClick={() => setTheme(isDark ? "light" : "dark")}
          className="flex items-center gap-3 py-2.5 px-4 rounded-xl font-bold text-zinc-700 dark:text-zinc-200 hover:bg-yellow-50 dark:hover:bg-zinc-800 transition group"
          title={t(isDark ? "themeLight" : "themeDark")}
        >
          <span className="text-xl">{isDark ? "☀️" : "🌙"}</span>
          <span className="text-base font-bold">{t(isDark ? "themeLight" : "themeDark")}</span>
        </button>
        <button
          onClick={switchLocale}
          className="flex items-center gap-3 py-2.5 px-4 rounded-xl font-bold text-zinc-700 dark:text-zinc-200 hover:bg-yellow-50 dark:hover:bg-zinc-800 transition group"
          title={t(locale === "ar" ? "switchToEn" : "switchTo")}
        >
          <span className="text-xl">🌐</span>
          <span className="text-base font-bold">{t(locale === "ar" ? "switchToEn" : "switchTo")}</span>
        </button>
        <LogoutSidebarItem />
      </nav>
    </aside>
  );
}
