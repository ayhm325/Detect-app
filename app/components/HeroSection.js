"use client";

import Image from "next/image";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useTheme } from "../theme-provider";

export default function HeroSection() {
  const t = useTranslations("hero");
  const locale = useLocale();
  // ...existing code...
  // Use t("key") for all hero text and stats, remove any hardcoded text
  const heroStats = [
    { number: "92%", label: t("statsLabel1") },
    { number: "100K+", label: t("statsLabel3") },
    { number: "24/7", label: t("statsLabel4") },
  ];
  const heroImages = [
    { src: "/icons/hero1.jpeg" },
    { src: "/icons/hero2.jpeg" },
    { src: "/icons/hero3.jpeg" },
  ];
  const generateParticles = () =>
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      width: Math.random() * 200 + 50,
      height: Math.random() * 200 + 50,
      left: Math.random() * 100,
      top: Math.random() * 100,
      animationDelay: Math.random() * 5,
      animationDuration: Math.random() * 10 + 10,
    }));

  // Initialize empty on the server to avoid hydration mismatches.
  // Generate particles only on the client after mount. Defer the state
  // update with requestAnimationFrame to avoid synchronous setState in
  // the effect (avoids cascading renders flagged by the linter).
  const [particles, setParticles] = useState([]);
  useEffect(() => {
    let raf = null;
    if (typeof window !== "undefined") {
      raf = requestAnimationFrame(() => setParticles(generateParticles()));
    }
    return () => {
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
  const withLocale = (path) => {
    const base = path.startsWith("/") ? path : `/${path}`;
    if (base.startsWith("/en") || base.startsWith("/ar")) return base;
    return `/${locale}${base === "/" ? "" : base}`;
  };

  // particles are generated on the client after mount to ensure deterministic
  // server-rendered HTML and avoid hydration mismatches.

  const { theme } = useTheme();
  const isDark = theme === "dark";
  const heroLightBg = "#F0FAF4";
  const heroGreenShadow =
    "0 24px 80px rgba(34,197,94,0.14), 0 6px 24px rgba(34,197,94,0.08)";

  return (
    <section
      className="relative flex flex-col items-center justify-center min-h-[90vh] w-full py-20 px-4 sm:px-6 lg:px-8 overflow-hidden"
      style={isDark ? undefined : { backgroundColor: heroLightBg }}
    >
      {/* Background SVG and Animated Waves removed as requested */}

      {/* Floating Particles */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute rounded-full bg-(--ui-ring)/20 blur-xl animate-float"
            style={{
              width: `${particle.width}px`,
              height: `${particle.height}px`,
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              animationDelay: `${particle.animationDelay}s`,
              animationDuration: `${particle.animationDuration}s`,
            }}
          />
        ))}
      </div>

      {/* Floating Icons with 3D Effect */}
      <div className="relative z-10 flex gap-4 sm:gap-6 lg:gap-8 mb-12 flex-wrap justify-center">
        {[
          { src: "/icons/ai.svg", alt: t("aria.iconAi") },
          { src: "/icons/xray.svg", alt: t("aria.iconXray") },
          { src: "/icons/result.svg", alt: t("aria.iconResult") },
          { src: "/icons/settings.svg", alt: t("aria.iconSettings") },
        ].map((icon, i) => (
          <div
            key={i}
            className="group relative animate-float"
            style={{ animationDelay: `${i * 0.2}s` }}
          >
            <div className="absolute inset-0 brand-gradient rounded-3xl blur-2xl opacity-40 group-hover:opacity-60 transition-opacity" />
            <div
              className="relative p-4 sm:p-5 rounded-3xl card-glass shadow-2xl transform group-hover:scale-110 group-hover:-translate-y-2 transition-all duration-300"
              style={isDark ? undefined : { boxShadow: heroGreenShadow }}
            >
              <Image
                src={icon.src}
                alt={icon.alt}
                width={48}
                height={48}
                className="sm:w-14 sm:h-14 drop-shadow-2xl"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Two-column hero: left = copy + CTAs + stats, right = diagonal/staggered images */}
      <div className="relative z-10 w-full max-w-6xl mx-auto mb-10 px-4">
        <div className="flex flex-col-reverse md:flex-row items-center md:items-start gap-10">
          {/* Left column: copy */}
          <div className="w-full md:w-1/2">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-(--ui-foreground) mb-4">
              {t("content.hero.title")}
            </h1>
            <p className="text-(--ui-muted-foreground) text-base sm:text-lg md:text-xl mb-6">
              {t("content.hero.subtitle")}
            </p>
            <p className="text-(--ui-muted-foreground) max-w-xl mb-6 leading-relaxed">
              {t("content.hero.desc")}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mb-6">
              <Link
                href={withLocale("/signup")}
                className="inline-flex items-center gap-3 px-6 py-3 rounded-full btn-gradient text-base font-bold shadow-md hover:-translate-y-0.5 transition-transform"
              >
                {t("content.hero.primaryCta")}
              </Link>
              <Link
                href={withLocale("/login")}
                className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-(--ui-surface) border-2 border-(--ui-border-strong) text-(--ui-foreground) text-base font-bold shadow-sm hover:shadow-md transition-all"
              >
                {t("content.hero.secondaryCta")}
              </Link>
            </div>

            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {heroStats.map((stat, i) => (
                <div
                  key={i}
                  className="p-4 rounded-2xl card-glass shadow-sm"
                  style={
                    isDark
                      ? undefined
                      : {
                          backgroundColor: heroLightBg,
                          boxShadow: heroGreenShadow,
                        }
                  }
                >
                  <div className="text-xl sm:text-2xl font-black brand-gradient-text mb-1">
                    {stat.number}
                  </div>
                  <div className="text-xs text-(--ui-muted-foreground) font-semibold">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right column: images */}
          <div className="w-full md:w-1/2">
            <div className="sm:hidden grid grid-cols-1 gap-4 mb-4">
              {heroImages.map((img, i) => (
                <div
                  key={i}
                  className="rounded-2xl overflow-hidden shadow-lg bg-(--ui-surface-2)"
                  style={isDark ? undefined : { boxShadow: heroGreenShadow }}
                >
                  <div className="relative w-full h-44">
                    <Image
                      src={img.src}
                      alt={`Hero ${i + 1}`}
                      fill
                      sizes="100vw"
                      className="object-cover"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop layout: large left image + two stacked on the right (left height = sum of two right images) */}
            <div className="hidden sm:grid grid-cols-2 gap-6 items-start h-72 md:h-88 lg:h-112">
              {/* Large image (spans left column) */}
              <div
                className="rounded-2xl overflow-hidden shadow-2xl transform hover:-translate-y-2 hover:scale-105 h-full"
                style={isDark ? undefined : { boxShadow: heroGreenShadow }}
              >
                <div className="relative w-full h-full">
                  <Image
                    src={heroImages[0].src}
                    alt={`Hero 1`}
                    fill
                    sizes="(max-width: 1024px) 60vw, 720px"
                    className="object-cover"
                  />
                </div>
              </div>

              {/* Right column: two stacked images, each half of the container */}
              <div className="grid grid-rows-2 gap-6 h-full">
                <div
                  className="rounded-2xl overflow-hidden shadow-2xl transform hover:-translate-y-2 hover:scale-105 h-full"
                  style={isDark ? undefined : { boxShadow: heroGreenShadow }}
                >
                  <div className="relative w-full h-full">
                    <Image
                      src={heroImages[1].src}
                      alt={`Hero 2`}
                      fill
                      sizes="(max-width: 1024px) 30vw, 360px"
                      className="object-cover"
                    />
                  </div>
                </div>
                <div
                  className="rounded-2xl overflow-hidden shadow-2xl transform hover:-translate-y-2 hover:scale-105 h-full"
                  style={isDark ? undefined : { boxShadow: heroGreenShadow }}
                >
                  <div className="relative w-full h-full">
                    <Image
                      src={heroImages[2].src}
                      alt={`Hero 3`}
                      fill
                      sizes="(max-width: 1024px) 30vw, 360px"
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <svg
          className="w-6 h-6 text-(--ui-muted-foreground)"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </div>
    </section>
  );
}
