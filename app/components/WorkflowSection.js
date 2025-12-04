
"use client";
import Image from "next/image";
import { usePathname } from "next/navigation";
import translations from "../lib/translations";

export default function WorkflowSection() {
  const pathname = usePathname();
  const currentLocale = pathname.startsWith("/ar") ? "ar" : "en";
  const t = translations[currentLocale];
  return (
    <section className="relative w-full py-20 bg-linear-to-br from-[#0ff2] via-[#7f00ff22] to-[#000c] overflow-hidden workflow-glass-bg">
      {/* Glassy animated background with floating lines */}
      <div className="absolute inset-0 pointer-events-none select-none z-0">
        <svg className="w-full h-full animate-pulse-slow" viewBox="0 0 1440 400" fill="none">
          <defs>
            <radialGradient id="workflowBg" cx="50%" cy="50%" r="80%">
              <stop offset="0%" stopColor="#00fff7" stopOpacity="0.10" />
              <stop offset="100%" stopColor="#7f00ff" stopOpacity="0.05" />
            </radialGradient>
          </defs>
          <rect width="1440" height="400" fill="url(#workflowBg)" />
          {/* Animated dashed lines */}
          {Array.from({length: 8}).map((_,i) => (
            <line key={i} x1={i*180} y1="0" x2={i*180} y2="400" stroke="#00fff7" strokeWidth="2" strokeDasharray="12 12" opacity="0.08" />
          ))}
        </svg>
      </div>
      <div className="max-w-5xl mx-auto px-6 relative z-10">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-14 text-transparent bg-clip-text bg-linear-to-r from-cyan-300 via-fuchsia-400 to-blue-400 drop-shadow-xl neon-text-glow">
          {t.workflowTitle}
        </h2>
        <div className="flex flex-col md:flex-row items-center justify-center gap-12 md:gap-8">
          {t.workflow.map((step, i) => (
            <div key={i} className="group flex flex-col items-center workflow-glass-card rounded-3xl border-2 border-cyan-400/40 shadow-2xl p-8 gap-5 transition-all duration-300 hover:scale-105 hover:border-fuchsia-400/80 hover:shadow-fuchsia-400/40 relative overflow-hidden w-full md:w-1/3">
              <div className="relative mb-2 flex items-center justify-center">
                {/* 3D SVG frame with animated glow */}
                <svg width="72" height="72" viewBox="0 0 72 72" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-0 animate-spin-slow" style={{filter:'drop-shadow(0 4px 24px #00fff7cc) drop-shadow(0 0 12px #7f00ffbb)'}}>
                  <defs>
                    <radialGradient id={`workflow3dBg${i}`} cx="50%" cy="40%" r="70%">
                      <stop offset="0%" stopColor="#fff" stopOpacity="0.8" />
                      <stop offset="60%" stopColor="#00fff7" stopOpacity="0.22" />
                      <stop offset="100%" stopColor="#7f00ff" stopOpacity="0.13" />
                    </radialGradient>
                    <linearGradient id={`workflow3dEdge${i}`} x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#00fff7" />
                      <stop offset="100%" stopColor="#7f00ff" />
                    </linearGradient>
                  </defs>
                  <circle cx="36" cy="36" r="32" fill={`url(#workflow3dBg${i})`} stroke={`url(#workflow3dEdge${i})`} strokeWidth="3" />
                  <ellipse cx="36" cy="28" rx="18" ry="7" fill="#fff" opacity="0.18" />
                </svg>
                {/* Icon image with animated floating effect */}
                <Image src={step.icon} alt={step.title} width={56} height={56} className="relative z-10 drop-shadow-neon animate-float" style={{borderRadius:'50%'}} />
                <svg width="56" height="56" viewBox="0 0 56 56" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
                  <ellipse cx="28" cy="16" rx="16" ry="6" fill="#fff" opacity="0.22" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-transparent bg-clip-text bg-linear-to-r from-cyan-300 via-fuchsia-400 to-blue-400 drop-shadow-lg neon-text-glow text-center">
                {step.title}
              </h3>
              <p className="text-zinc-700 dark:text-zinc-200 text-center text-base font-medium bg-white/10 dark:bg-zinc-900/20 rounded-xl px-4 py-3 shadow backdrop-blur-md border border-cyan-400/10">
                {step.desc}
              </p>
              {i < t.workflow.length - 1 && (
                <div className="absolute right-0 md:left-1/2 md:-bottom-8 md:top-auto top-1/2 md:translate-x-0 -translate-y-1/2 md:translate-y-0 w-12 h-12 flex items-center justify-center z-20 animate-arrow-move">
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                    <defs>
                      <linearGradient id="arrow3d" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#00fff7" />
                        <stop offset="100%" stopColor="#7f00ff" />
                      </linearGradient>
                    </defs>
                    <path d="M12 24h24m-8-8 8 8-8 8" stroke="url(#arrow3d)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
