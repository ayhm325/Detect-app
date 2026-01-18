"use client";

import Link from "next/link";
import { createNavigation } from "next-intl/navigation";
const { useRouter, usePathname } = createNavigation();
import { useLocale, useTranslations } from "next-intl";
import { useTheme } from "../theme-provider";

/* =======================
   Theme Toggle Button
======================= */
function ThemeToggleButton() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";
  const t = useTranslations("navbar");

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="group relative p-2.5 rounded-full bg-(--ui-surface-2) border border-(--ui-border) hover:scale-110 transition-all shadow"
      aria-label={
        isDark ? t("theme.switchToLightAria") : t("theme.switchToDarkAria")
      }
      title={
        isDark ? t("theme.switchToLightAria") : t("theme.switchToDarkAria")
      }
    >
      {isDark ? (
        // Show a clear sun icon when in dark mode (indicates switching to light)
        <svg
          className="w-6 h-6 text-(--ui-foreground)"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2" />
          <path d="M12 20v2" />
          <path d="M4.22 4.22l1.42 1.42" />
          <path d="M18.36 18.36l1.42 1.42" />
          <path d="M1 12h2" />
          <path d="M21 12h2" />
          <path d="M4.22 19.78l1.42-1.42" />
          <path d="M18.36 5.64l1.42-1.42" />
        </svg>
      ) : (
        // Show a clean crescent moon when in light mode (indicates switching to dark)
        <svg
          className="w-6 h-6 text-(--ui-foreground)"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
        </svg>
      )}
    </button>
  );
}

/* =======================
   Navbar
======================= */
export default function Navbar() {
  const t = useTranslations("navbar");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  /* تبديل اللغة مع الحفاظ على نفس الصفحة */
  function handleSwitchLocale() {
    const nextLocale = locale === "ar" ? "en" : "ar";
    router.replace(pathname, { locale: nextLocale });
  }

  const homeHref = "/";
  const isHome = pathname === "/" || pathname === "/ar" || pathname === "/en";

  // Scroll to top when clicking the logo
  function handleLogoClick(e) {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes float {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes float-delayed {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(-30px, 50px) scale(0.9); }
          66% { transform: translate(20px, -20px) scale(1.1); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-float {
          animation: float 20s infinite ease-in-out;
        }
        .animate-float-delayed {
          animation: float-delayed 25s infinite ease-in-out;
        }
      `,
        }}
      />
      <nav className="w-full flex items-center justify-between py-2 px-4 lg:px-12 relative z-50 overflow-hidden text-(--ui-foreground)">
        {/* خلفية التدرج المتحركة الجديدة (Mesh Gradient) */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none opacity-60">
          {/* الخلفية الأساسية */}
          <div className="absolute inset-0 bg-(--ui-surface)" />

          {/* الكرات اللونية المتحركة (Orbs) */}
          {/* Orb 1: Primary Color */}
          <div className="hidden sm:block absolute top-[-10%] left-[-10%] w-125 h-125 bg-(--color-primary-500) rounded-full mix-blend-multiply filter blur-[100px] animate-float opacity-30" />

          {/* Orb 2: Secondary Color */}
          <div className="hidden sm:block absolute bottom-[-10%] right-[-10%] w-125 h-125 bg-(--color-secondary-500) rounded-full mix-blend-multiply filter blur-[100px] animate-float-delayed opacity-30" />

          {/* Orb 3: Accent Color (Smaller, faster) */}
          <div className="hidden sm:block absolute top-[20%] right-[20%] w-75 h-75 bg-(--color-accent-500) rounded-full mix-blend-screen filter blur-[80px] animate-float opacity-20 animation-delay-2000" />
        </div>

        {/* شعار الموقع */}
        <a
          href={homeHref}
          className="flex items-center gap-2 shrink-0"
          onClick={handleLogoClick}
        >
          <svg
            width="36"
            height="36"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="mr-2"
            aria-hidden="true"
          >
            <defs>
              <linearGradient
                id="lungGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="var(--color-bright-500)" />
                <stop offset="100%" stopColor="var(--color-primary-500)" />
              </linearGradient>
            </defs>
          </svg>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1">
              <span className="text-xl" aria-label={t("logoIconAria")}>
                🫁
              </span>
              <span className="font-black text-2xl brand-gradient-text truncate hidden sm:inline">
                {t("brand")}
              </span>
              <span className="font-black text-2xl brand-gradient-text sm:hidden">
                {t("brandShort")}
              </span>
            </div>
            <div className="text-xs text-(--ui-muted-foreground) font-semibold mt-0.5 hidden sm:block truncate">
              {t("navTagline")}
            </div>
          </div>
        </a>

        {/* عناصر التحكم (الوضع الليلي وتبديل اللغة) */}
        <div className="flex items-center gap-3">
          <ThemeToggleButton />
          <button
            onClick={handleSwitchLocale}
            className="px-5 py-2.5 rounded-full font-bold btn-gradient hover:scale-105 transition"
            aria-label={t("langSwitchAria")}
          >
            {t("langSwitch")}
          </button>
        </div>
      </nav>
    </>
  );
}
