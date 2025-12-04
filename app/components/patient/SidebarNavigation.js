import DashboardSidebarItem from "./sidebar/DashboardSidebarItem";
import UploadXRaySidebarItem from "./sidebar/UploadXRaySidebarItem";
import ResultsSidebarItem from "./sidebar/ResultsSidebarItem";
import ChatSidebarItem from "./sidebar/ChatSidebarItem";
import ProfileSidebarItem from "./sidebar/ProfileSidebarItem";
import LogoutSidebarItem from "./sidebar/LogoutSidebarItem";

export default function SidebarNavigation() {
  return (
    <aside className="w-full md:w-60 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 h-full flex flex-col p-4 gap-2">
      <nav className="flex flex-col gap-2">
        <DashboardSidebarItem />
        <UploadXRaySidebarItem />
        <ResultsSidebarItem />
        <ChatSidebarItem />
        <ProfileSidebarItem />
        <LogoutSidebarItem />
      </nav>
    </aside>
  );
}
