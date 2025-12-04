import Link from "next/link";
import { FaUserInjured } from "react-icons/fa";

export default function PatientsSidebarItem() {
  return (
    <Link href="/admin/patients" className="flex items-center gap-3 py-2.5 px-4 rounded-xl hover:bg-yellow-50 dark:hover:bg-zinc-800 font-bold text-zinc-700 dark:text-zinc-200 transition group">
      <FaUserInjured className="text-yellow-700 text-lg group-hover:scale-110 transition-transform" />
      <span>المرضى</span>
    </Link>
  );
}
