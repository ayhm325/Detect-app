
"use client";
import Image from "next/image";
import { usePathname } from "next/navigation";
import translations from "../lib/translations";

export default function FeaturesSection() {
  const pathname = usePathname();
  const currentLocale = pathname.startsWith("/ar") ? "ar" : "en";
  const t = translations[currentLocale];
  return (
    <section className="relative w-full py-24 bg-linear-to-br from-yellow-100 via-red-100/30 to-white overflow-hidden">
      {/* Glassy animated background with floating dots */}
      <div className="absolute inset-0 pointer-events-none select-none z-0">
        <svg className="w-full h-full animate-pulse-slow" viewBox="0 0 1440 400" fill="none">
          <defs>
            <radialGradient id="featuresBg" cx="50%" cy="50%" r="80%">
              <stop offset="0%" stopColor="#ffe066" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#ff1744" stopOpacity="0.09" />
            </radialGradient>
            <linearGradient id="poly1" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ffe066" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#ff1744" stopOpacity="0.4" />
            </linearGradient>
          </defs>
          <rect width="1440" height="400" fill="url(#featuresBg)" />
          {/* Animated circles */}
          {[100,300,500,700,900,1100,1300,200,400,600,800,1000,1200,250,750,1050,350,950].map((cx,i) => (
            <circle key={i} cx={cx} cy={80+(i%6)*40} r={18+(i%4)*4} fill="#ffe066" opacity="0.10">
              <animate attributeName="cy" values={`${80+(i%6)*40};${100+(i%6)*40};${80+(i%6)*40}`} dur="4s" repeatCount="indefinite" />
            </circle>
          ))}
          {/* Animated polygons */}
          <polygon points="200,100 250,150 200,200 150,150" fill="url(#poly1)" opacity="0.13">
            <animateTransform attributeName="transform" type="rotate" from="0 200 150" to="360 200 150" dur="12s" repeatCount="indefinite" />
          </polygon>
          <polygon points="1200,300 1250,350 1200,400 1150,350" fill="url(#poly1)" opacity="0.10">
            <animateTransform attributeName="transform" type="rotate" from="0 1200 350" to="360 1200 350" dur="16s" repeatCount="indefinite" />
          </polygon>
          {/* Animated ellipse */}
          <ellipse cx="700" cy="200" rx="120" ry="40" fill="#ff1744" opacity="0.07">
            <animate attributeName="rx" values="120;80;120" dur="8s" repeatCount="indefinite" />
          </ellipse>
        </svg>
      </div>
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <h2 className="text-4xl md:text-5xl font-extrabold text-center mb-16 text-transparent bg-clip-text bg-linear-to-r from-yellow-400 via-red-400 to-red-700 drop-shadow-xl">
          {t.featuresTitle}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {t.features.map((f, i) => (
            <div
              key={i}
              className="group flex flex-col items-center justify-between bg-white/70 backdrop-blur-2xl rounded-3xl border-2 border-yellow-200/60 shadow-2xl p-12 gap-7 transition-all duration-300 hover:scale-105 hover:border-red-400/80 hover:shadow-red-400/40 relative overflow-hidden"
            >
              <div className="relative mb-4 flex items-center justify-center">
                <span className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-linear-to-br from-yellow-200 via-red-200 to-white shadow-xl border-4 border-yellow-300 group-hover:scale-110 transition-transform">
                  <Image src={f.icon} alt={f.title} width={64} height={64} className="drop-shadow-lg" />
                </span>
              </div>
              <h3 className="text-2xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-yellow-400 via-red-400 to-red-700 drop-shadow-lg text-center mb-2">
                {f.title}
              </h3>
              <p className="text-yellow-900/90 dark:text-red-900/90 text-center text-lg font-medium bg-white/40 rounded-xl px-6 py-4 shadow border border-yellow-200/40">
                {f.desc}
              </p>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-1 rounded-full bg-yellow-400/40 blur-md animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
