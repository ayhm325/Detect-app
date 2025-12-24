"use client";
import { usePathname, useRouter } from "next/navigation";

export default function LanguageToggle({ currentLocale }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleToggle = () => {
    let target = "en";
    let path = pathname;
    if (pathname.startsWith("/en")) {
      target = "ar";
      path = pathname.slice(3);
    } else if (pathname.startsWith("/ar")) {
      target = "en";
      path = pathname.slice(3);
    } else {
      // fallback: if no prefix, use currentLocale
      target = currentLocale === "ar" ? "en" : "ar";
    }
    if (!path.startsWith("/")) path = "/" + path;
    router.push(`/${target}${path}`);
  };

  return (
    <button
      onClick={handleToggle}
      className="flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-200 dark:hover:bg-yellow-900/50 transition-colors font-medium"
      aria-label={currentLocale === "ar" ? "Switch to English" : "التبديل إلى العربية"}
    >
      <span>🌐</span>
      <span>{currentLocale === "ar" ? "English" : "العربية"}</span>
    </button>
  );
}
