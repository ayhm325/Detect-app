import Link from "next/link";

export default function LogoutSidebarItem() {
  return (
    <Link href="/doctor/logout" className="py-2 px-4 rounded text-red-600 hover:bg-red-50 dark:hover:bg-zinc-800 font-medium block">
      Logout
    </Link>
  );
}
