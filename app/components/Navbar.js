
"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import translations from "../lib/translations";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  // Detect current locale from path
  const currentLocale = pathname.startsWith("/ar") ? "ar" : "en";
  const t = translations[currentLocale];
  const switchLocale = () => {
    const newLocale = currentLocale === "en" ? "ar" : "en";
    let newPath = pathname.replace(/^\/(en|ar)/, "");
    if (!newPath.startsWith("/")) newPath = "/" + newPath;
    router.push(`/${newLocale}${newPath}`);
  };
  return (
    <header className="sticky top-0 z-30 w-full bg-linear-to-r from-yellow-400 via-red-400 to-red-600 backdrop-blur-xl border-b-2 border-yellow-400/30 shadow-[0_2px_32px_0_#ffb73333] nav-glass-header">
      <nav className="max-w-6xl mx-auto flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-3">
          <span className="relative flex items-center justify-center w-12 h-12 bg-white/20 dark:bg-zinc-800/40 shadow-md border border-cyan-400/20">
            <Image src="/icons/ai.svg" alt="Logo" width={32} height={32} style={{width: '100%', height: 'auto'}} />
            <span className="absolute -bottom-2 right-0 w-5 h-5 bg-cyan-200 rounded-full flex items-center justify-center shadow-md border border-cyan-400/30">
              <Image src="/icons/ai.svg" alt="Brand" width={18} height={18} style={{height: '100%', width: 'auto'}} />
            </span>
          </span>
          <span className="font-extrabold text-2xl tracking-tight bg-clip-text text-transparent bg-linear-to-r from-yellow-400 via-red-400 to-red-600 drop-shadow-[0_0_12px_#ffb733,0_0_24px_#ff1744]">
            {t.brand}
          </span>
        </div>
        <ul className="flex items-center gap-4 text-base font-semibold">
          {!(pathname === "/" || pathname === "/ar" || pathname === "/en") && (
            <li>
              <Link href="/ar" className="flex items-center gap-3 px-5 py-2 bg-linear-to-r from-yellow-400 via-red-400 to-red-600 hover:from-yellow-500 hover:to-red-700 shadow-lg transition text-white border-b-4 border-yellow-400/40 font-bold modern-btn rounded-full">
                <span className="icon-glow">
                  <Image src="/icons/chat.svg" alt="Home" width={28} height={28} style={{height: 'auto'}} />
                </span>
                {t.home}
              </Link>
            </li>
          )}
          <li>
            <Link href="/login" className="flex items-center gap-3 px-5 py-2 bg-linear-to-r from-yellow-400 via-red-400 to-red-600 hover:from-yellow-500 hover:to-red-700 shadow-lg transition text-white border-b-4 border-yellow-400/40 font-bold modern-btn rounded-full">
              <span className="icon-glow">
                <Image src="/icons/xray.svg" alt="Login" width={28} height={28} style={{height: 'auto'}} />
              </span>
              {t.login}
            </Link>
          </li>
          <li>
            <Link href="/signup" className="flex items-center gap-3 px-5 py-2 bg-linear-to-r from-yellow-400 via-red-400 to-red-600 hover:from-yellow-500 hover:to-red-700 shadow-lg transition text-white border-b-4 border-yellow-400/40 font-bold modern-btn rounded-full">
              <span className="icon-glow">
                <Image src="/icons/result.svg" alt="Signup" width={28} height={28} style={{width: '100%', height: 'auto'}} />
              </span>
              {t.signup}
            </Link>
          </li>
          <li>
            <button
              className="flex items-center gap-3 px-5 py-2 bg-linear-to-r from-yellow-400 via-red-400 to-red-600 hover:from-yellow-500 hover:to-red-700 shadow-lg transition text-white border-b-4 border-yellow-400/40 font-bold modern-btn rounded-full"
              onClick={switchLocale}
              aria-label="Switch language"
            >
              <span className="icon-glow">
                <Image src="/icons/settings.svg" alt="Language" width={28} height={28} style={{height: 'auto'}} />
              </span>
              <span className="text-sm font-bold tracking-wide">{t.langSwitch}</span>
            </button>
          </li>
        </ul>
      </nav>
      {/* Animated gradient line at the bottom */}
      <div className="absolute left-0 bottom-0 w-full h-1 bg-linear-to-r from-yellow-400 via-red-400 to-red-600 opacity-60 blur-sm animate-pulse" />
    </header>
  );
}
