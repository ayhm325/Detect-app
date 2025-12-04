import Link from "next/link";
import { FaUserMd } from "react-icons/fa";

export default function DoctorsSidebarItem() {
  return (
    <Link href="/admin/doctors" className="flex items-center gap-3 py-2.5 px-4 rounded-xl hover:bg-yellow-50 dark:hover:bg-zinc-800 font-bold text-zinc-700 dark:text-zinc-200 transition group">
      <FaUserMd className="text-red-500 text-lg group-hover:scale-110 transition-transform" />
      <span>الأطباء</span>
    </Link>
  );
}
