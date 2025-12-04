import Link from "next/link";
import { FaTachometerAlt } from "react-icons/fa";

export default function DashboardSidebarItem() {
  return (
    <Link href="/admin/dashboard" className="flex items-center gap-3 py-2.5 px-4 rounded-xl hover:bg-yellow-50 dark:hover:bg-zinc-800 font-bold text-zinc-700 dark:text-zinc-200 transition group">
      <FaTachometerAlt className="text-yellow-500 text-lg group-hover:scale-110 transition-transform" />
      <span>لوحة التحكم</span>
    </Link>
  );
}
