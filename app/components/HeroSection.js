
"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import translations from "../lib/translations";


export default function HeroSection() {
  const pathname = usePathname();
  const currentLocale = pathname.startsWith("/ar") ? "ar" : "en";
  const t = translations[currentLocale];

  // رسم الأمواج المتحركة فقط على جانب العميل
  const [showWaves, setShowWaves] = useState(false);
  useEffect(() => {
    setShowWaves(true);
  }, []);

  // مكون الأمواج المتحركة (يتم تحميله فقط على العميل)
  const AnimatedWaves = dynamic(() => import("./_AnimatedWaves"), { ssr: false, loading: () => null });

  return (
    <section className="relative flex flex-col items-center justify-center min-h-[80vh] w-full py-24 px-6 overflow-hidden">
      {/* خلفية SVG 3D جديدة (أعمق طبقة) */}
      <div className="absolute inset-0 -z-30 pointer-events-none">
        <Image
          src="/bg-hero.svg"
          alt="Hero Background"
          fill
          priority
          sizes="100vw"
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>
      {/* طبقة تدرج لوني فوق الخلفية */}
      <div className="absolute inset-0 -z-20 pointer-events-none bg-linear-to-br from-yellow-100/60 via-red-100/40 to-transparent" />
      {/* أمواج وخطوط متحركة (عميل فقط) — طبقة وسطية */}
      {showWaves && (
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <AnimatedWaves />
        </div>
      )}
      {/* أيقونات 3D عصرية */}
      <div className="relative z-10 flex gap-8 mb-12 flex-wrap justify-center">
        <span className="shadow-2xl p-4 rounded-3xl bg-white/30 backdrop-blur-xl border-2 border-yellow-200">
          <Image src="/icons/ai.svg" alt="AI" width={56} height={56} />
        </span>
        <span className="shadow-2xl p-4 rounded-3xl bg-white/30 backdrop-blur-xl border-2 border-red-200">
          <Image src="/icons/xray.svg" alt="X-Ray" width={56} height={56} />
        </span>
        <span className="shadow-2xl p-4 rounded-3xl bg-white/30 backdrop-blur-xl border-2 border-yellow-300">
          <Image src="/icons/result.svg" alt="Result" width={56} height={56} />
        </span>
        <span className="shadow-2xl p-4 rounded-3xl bg-white/30 backdrop-blur-xl border-2 border-red-300">
          <Image src="/icons/settings.svg" alt="Settings" width={56} height={56} />
        </span>
      </div>
      {/* العنوان */}
      <h1 className="relative z-10 text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-yellow-400 via-red-400 to-red-700 drop-shadow-2xl text-center mb-8">
        {t.heroTitle}
      </h1>
      {/* الوصف */}
      <p className="relative z-10 text-2xl md:text-3xl text-yellow-900/90 dark:text-red-900/90 max-w-2xl mx-auto bg-white/60 rounded-3xl px-10 py-7 shadow-2xl border-2 border-yellow-300/30 text-center mb-10 font-semibold">
        {t.heroDesc}
      </p>
      {/* زر رئيسي */}
      <Link href="/analyze" className="relative z-10 mt-2 w-full max-w-xs px-14 py-6 rounded-full bg-linear-to-r from-yellow-400 via-red-400 to-red-600 hover:from-yellow-500 hover:to-red-700 shadow-2xl transition text-white text-2xl font-extrabold flex items-center justify-center gap-4 border-2 border-yellow-300/40 animate-glow">
        <svg width="36" height="36" fill="none" viewBox="0 0 36 36"><circle cx="18" cy="18" r="16" stroke="#fbbf24" strokeWidth="2.5" /><path d="M12 18h12M18 12l6 6-6 6" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        {t.analyze}
      </Link>
    </section>
  );
}
