"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

const FuturisticStars = dynamic(() => import("./FuturisticStars"), { ssr: false });

export default function FuturisticHero() {
  const t = useTranslations("hero");
  const locale = useLocale();
  const basePrefix = locale === "en" ? "/en" : "/ar";
  return (
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center overflow-hidden bg-transparent bg-linear-to-br from-(--color-primary-500) via-(--color-secondary-500) to-(--color-dark-500)">
      {/* Neon SVG Gradient Overlay for Sci-Fi Glow */}
      <div className="absolute inset-0 -z-30 pointer-events-none">
        <svg className="w-full h-full" width="100%" height="100%" viewBox="0 0 1440 800" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="neonBg" cx="50%" cy="50%" r="80%">
              <stop offset="0%" stopColor="var(--color-primary-500)" stopOpacity="0.25" />
              <stop offset="50%" stopColor="var(--color-secondary-500)" stopOpacity="0.18" />
              <stop offset="100%" stopColor="var(--color-dark-500)" stopOpacity="0.95" />
            </radialGradient>
          </defs>
          <rect width="1440" height="800" fill="url(#neonBg)" />
          <ellipse cx="400" cy="200" rx="220" ry="80" fill="var(--color-primary-500)" opacity="0.10" />
          <ellipse cx="1100" cy="600" rx="180" ry="60" fill="var(--color-secondary-500)" opacity="0.10" />
          <ellipse cx="800" cy="400" rx="300" ry="120" fill="var(--color-secondary-500)" opacity="0.08" />
        </svg>
      </div>
      {/* Starry/Cyber Cityscape Background (Client-only, no hydration mismatch) */}
      <FuturisticStars />
      {/* Holographic Floating Shapes */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        <svg className="w-full h-full" viewBox="0 0 1440 800" fill="none">
          {/* Floating neon polygons */}
          <g className="animate-float-slow">
            <polygon points="200,200 250,250 200,300 150,250" fill="var(--color-primary-500)" opacity="0.18" filter="url(#glow)" />
            <polygon points="1200,400 1250,450 1200,500 1150,450" fill="var(--color-secondary-500)" opacity="0.13" />
            <rect x="700" y="100" width="80" height="80" rx="18" fill="var(--color-secondary-500)" opacity="0.12" />
            <ellipse cx="400" cy="600" rx="60" ry="24" fill="var(--color-primary-500)" opacity="0.09" />
          </g>
        </svg>
      </div>
      {/* Holographic Interface Overlay */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 z-10">
          <div className="w-105 h-55 rounded-3xl border-2 border-(--ui-border) card-glass shadow-2xl backdrop-blur-2xl flex flex-col items-center justify-center relative text-white">
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-32 h-2 rounded-full bg-(--color-primary-500)/40 blur-md animate-pulse" />
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-32 h-2 rounded-full bg-(--color-secondary-500)/40 blur-md animate-pulse" />
          <div className="absolute left-4 top-4 w-6 h-6 rounded-full bg-(--color-primary-500)/30 blur-lg animate-pulse" />
          <div className="absolute right-4 bottom-4 w-6 h-6 rounded-full bg-(--color-secondary-500)/30 blur-lg animate-pulse" />
          <h1 className="text-4xl md:text-5xl font-extrabold brand-gradient-text drop-shadow-2xl animate-gradient-x neon-text-glow text-center">
            {t("futuristic.title")}
          </h1>
          <p className="mt-4 text-lg max-w-xl card-glass rounded-2xl px-6 py-3 shadow-2xl backdrop-blur-2xl glassmorph-sci-fi text-center text-white drop-shadow-lg">
            {t("futuristic.description")}
          </p>
          <Link
            href={`${basePrefix}/admin/analysis`}
            className="mt-6 px-10 py-4 rounded-2xl btn-gradient shadow-2xl transition text-white text-xl font-extrabold flex items-center gap-4 border-2 border-(--ui-border) backdrop-blur-2xl animate-glow neon-btn-glow drop-shadow-lg"
          >
            <span className="inline-block text-white">{t("futuristic.actions.analyzeXray")}</span>
          </Link>
        </div>
      </div>
    </section>
  );
}