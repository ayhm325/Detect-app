"use client";
import DashboardSidebarItem from "./sidebar/DashboardSidebarItem";
import AnalysisSidebarItem from "./sidebar/AnalysisSidebarItem";
import ResultsSidebarItem from "./sidebar/ResultsSidebarItem";
import ChatSidebarItem from "./sidebar/ChatSidebarItem";
import ProfileSidebarItem from "./sidebar/ProfileSidebarItem";
import LogoutSidebarItem from "./sidebar/LogoutSidebarItem";
import { useTheme } from "@/app/theme-provider";

export default function SidebarNavigation() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <aside className="w-full md:w-60 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 h-full flex flex-col p-4 gap-2">
      <nav className="flex flex-col gap-2">
        <DashboardSidebarItem />
        <AnalysisSidebarItem />
        <ResultsSidebarItem />
        <ChatSidebarItem />
        <ProfileSidebarItem />
        <button
          onClick={() => setTheme(isDark ? "light" : "dark")}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-yellow-50 dark:hover:bg-zinc-800 transition-all"
          title={isDark ? "الوضع النهاري" : "الوضع الليلي"}
        >
          <span className="text-xl">{isDark ? "☀️" : "🌙"}</span>
          <span className="text-sm font-medium">{isDark ? "الوضع النهاري" : "الوضع الليلي"}</span>
        </button>
        <LogoutSidebarItem />
      </nav>
    </aside>
  );
}
