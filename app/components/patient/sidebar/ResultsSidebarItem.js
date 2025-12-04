import Link from "next/link";

export default function ResultsSidebarItem() {
  return (
    <Link href="/patient/results" className="py-2 px-4 rounded hover:bg-blue-100 dark:hover:bg-zinc-800 font-medium block">
      Results History
    </Link>
  );
}
