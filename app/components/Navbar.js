"use client";

import Link from "next/link";
import { createNavigation } from "next-intl/navigation";
const { useRouter, usePathname } = createNavigation();
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
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
      aria-label={isDark ? t("theme.switchToLightAria") : t("theme.switchToDarkAria")}
      title={isDark ? t("theme.switchToLightAria") : t("theme.switchToDarkAria")}
    >
      {isDark ? (
        // Show a clear sun icon when in dark mode (indicates switching to light)
        <svg className="w-6 h-6 text-(--ui-foreground)" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
        <svg className="w-6 h-6 text-(--ui-foreground)" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .galaxy-bg {
          animation: spin-slow 200s linear infinite;
        }
      ` }} />
      <nav className="w-full flex items-center justify-between py-2 px-4 lg:px-12 relative z-50 overflow-hidden text-(--ui-foreground)">
        {/* خلفية المجرة المتحركة */}
        <div className="galaxy-bg absolute inset-0 -z-10 pointer-events-none">
          <div className="absolute inset-0 bg-(--ui-surface)" />
          <div className="absolute inset-0 brand-gradient opacity-15" />
          <div className="absolute inset-0 opacity-50">
            <div className="absolute top-0 -left-1/4 w-1/2 h-1/2 bg-(--color-primary-500) rounded-full mix-blend-multiply filter blur-3xl animate-pulse" />
            <div className="absolute top-0 -right-1/4 w-1/2 h-1/2 bg-(--color-accent-500) rounded-full mix-blend-multiply filter blur-3xl animate-pulse animation-delay-2000" />
            <div className="absolute -bottom-1/4 left-1/3 w-1/2 h-1/2 bg-(--color-secondary-500) rounded-full mix-blend-multiply filter blur-3xl animate-pulse animation-delay-4000" />
          </div>
        </div>

        {/* شعار الموقع */}
        <a href={homeHref} className="flex items-center gap-2" onClick={handleLogoClick}>
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
              <linearGradient id="lungGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--color-bright-500)" />
                <stop offset="100%" stopColor="var(--color-primary-500)" />
              </linearGradient>
            </defs>
          </svg>
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className="text-xl" aria-label={t("logoIconAria")}>🫁</span>
              <span className="font-black text-2xl brand-gradient-text">
                {t("brand")}
              </span>
            </div>
            <div className="text-xs text-(--ui-muted-foreground) font-semibold mt-0.5">
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

        {/* زر القائمة للموبايل */}
        <button
          className="lg:hidden p-2 rounded-lg bg-(--ui-surface-2) border border-(--ui-border) absolute right-4 top-1/2 -translate-y-1/2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={t("menuToggleAria")}
        >
          <svg className="w-6 h-6 text-(--ui-foreground)" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

        {/* قائمة الموبايل */}
        {mobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 w-full bg-(--ui-surface) backdrop-blur-md border-b border-(--ui-border) shadow-xl">
            <ul className="flex flex-col p-4 gap-3">
              {!isHome && (
                <li>
                  <Link
                    href={homeHref}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-(--ui-foreground)"
                  >
                    {/* يمكنك استبدال هذه الأيقونة إذا أردت */}
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                    {t("home")}
                  </Link>
                </li>
              )}
              <li className="px-4">
                <ThemeToggleButton />
              </li>
              <li>
                <button
                  onClick={() => {
                    handleSwitchLocale();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full px-4 py-3 rounded-xl font-bold btn-gradient"
                >
                  {t("langSwitch")}
                </button>
              </li>
            </ul>
          </div>
        )}
      </nav>
    </>
  );
}