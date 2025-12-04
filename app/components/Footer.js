
  "use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import translations from "../lib/translations";

export default function Footer() {
  const pathname = usePathname();
  const currentLocale = pathname.startsWith("/ar") ? "ar" : "en";
  const t = translations[currentLocale];
  const year = new Date().getFullYear();
  return (
    <footer className="relative w-full py-10 bg-zinc-950/90 dark:bg-zinc-900/90 border-t-2 border-cyan-400/20 mt-12 footer-glass-bg overflow-hidden">
      {/* Glassy neon background and animated gradient line */}
      <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-cyan-400 via-fuchsia-400 to-blue-400 opacity-40 blur-sm animate-pulse" />
      <div className="absolute inset-0 pointer-events-none select-none z-0">
        <svg className="w-full h-full animate-pulse-slow" viewBox="0 0 1440 120" fill="none">
          <defs>
            <radialGradient id="footerBg" cx="50%" cy="50%" r="80%">
              <stop offset="0%" stopColor="#00fff7" stopOpacity="0.10" />
              <stop offset="100%" stopColor="#7f00ff" stopOpacity="0.05" />
            </radialGradient>
          </defs>
          <rect width="1440" height="120" fill="url(#footerBg)" />
          {/* Animated dots (fixed positions for SSR) */}
          {[120,320,520,720,920,1120,1320,220,420,620].map((cx,i) => (
            <circle key={i} cx={cx} cy={30+(i%5)*18} r={12+(i%3)*2} fill="#00fff7" opacity="0.07" />
          ))}
        </svg>
      </div>
      <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
        <div className="flex items-center gap-3">
          <Image src="/next.svg" alt="Logo" width={28} height={14} className="dark:invert" style={{width: '100%', height: 'auto'}} />
          <span className="text-2xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-cyan-300 via-fuchsia-400 to-blue-400 drop-shadow-[0_0_12px_#00fff7,0_0_24px_#7f00ff]">{t.brand}</span>
        </div>
        <ul className="flex items-center gap-6 text-sm text-cyan-200 dark:text-cyan-300">
          <li><Link href="/contact" className="footer-modern-link flex items-center gap-2 px-4 py-2"><span className="footer-icon-glow"><Image src='/window.svg' alt='' width={22} height={22} /></span>{t.contact}</Link></li>
          <li><Link href="/privacy" className="footer-modern-link flex items-center gap-2 px-4 py-2"><span className="footer-icon-glow"><Image src='/file.svg' alt='' width={22} height={22} /></span>{t.privacy}</Link></li>
          <li><Link href="/terms" className="footer-modern-link flex items-center gap-2 px-4 py-2"><span className="footer-icon-glow"><Image src='/globe.svg' alt='' width={22} height={22} /></span>{t.terms}</Link></li>
        </ul>
        <div className="flex items-center gap-2 text-xs text-cyan-300 dark:text-cyan-200">
          <span>{t.copyright(year)}</span>
        </div>
      </div>
    </footer>
  );
}
