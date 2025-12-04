import Link from "next/link";

export default function UploadXRaySidebarItem() {
  return (
    <Link href="/doctor/upload-xray" className="py-2 px-4 rounded hover:bg-blue-100 dark:hover:bg-zinc-800 font-medium block">
      Upload X-Ray
    </Link>
  );
}
