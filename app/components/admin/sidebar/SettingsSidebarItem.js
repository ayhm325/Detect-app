import Link from "next/link";
import { FaCogs } from "react-icons/fa";

export default function SettingsSidebarItem() {
  return (
    <Link href="/admin/settings" className="flex items-center gap-3 py-2.5 px-4 rounded-xl hover:bg-yellow-50 dark:hover:bg-zinc-800 font-bold text-zinc-700 dark:text-zinc-200 transition group">
      <FaCogs className="text-yellow-800 text-lg group-hover:scale-110 transition-transform" />
      <span>الإعدادات</span>
    </Link>
  );
}
