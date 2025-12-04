import Image from "next/image";
import DashboardSidebarItem from "./sidebar/DashboardSidebarItem";
import UsersSidebarItem from "./sidebar/UsersSidebarItem";
import DoctorsSidebarItem from "./sidebar/DoctorsSidebarItem";
import PatientsSidebarItem from "./sidebar/PatientsSidebarItem";
import AnalysisSidebarItem from "./sidebar/AnalysisSidebarItem";
import ChatSidebarItem from "./sidebar/ChatSidebarItem";
import SettingsSidebarItem from "./sidebar/SettingsSidebarItem";
import LogoutSidebarItem from "./sidebar/LogoutSidebarItem";

export default function SidebarNavigation() {
  return (
    <aside className="w-full md:w-64 h-full flex flex-col p-0 shadow-xl relative z-20 bg-linear-to-br from-yellow-50 via-red-50 to-white/80 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900 border-r border-zinc-200 dark:border-zinc-800 backdrop-blur-xl">
      {/* شعار الموقع */}
      <div className="flex items-center gap-3 px-6 py-7 border-b border-zinc-100 dark:border-zinc-800 mb-2">
        <Image src="/icons/ai.svg" alt="Logo" width={40} height={40} className="drop-shadow" />
        <span className="text-2xl font-extrabold bg-clip-text text-transparent bg-linear-to-r from-yellow-400 via-red-400 to-red-700 select-none">Detect Admin</span>
      </div>
      <nav className="flex flex-col gap-1 px-2 pb-4">
        <DashboardSidebarItem />
        <UsersSidebarItem />
        <DoctorsSidebarItem />
        <PatientsSidebarItem />
        <AnalysisSidebarItem />
        <ChatSidebarItem />
        <SettingsSidebarItem />
        <LogoutSidebarItem />
      </nav>
      <div className="mt-auto mb-2 px-6 text-sm font-semibold text-zinc-500 select-none">© {new Date().getFullYear()} Detect</div>
    </aside>
  );
}
