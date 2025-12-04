"use client";
import { FaUserTie, FaUser, FaArrowRight, FaCheck, FaShield } from "react-icons/fa6";
import { useState, useEffect, useRef } from "react";

export default function LoginSide() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [stats, setStats] = useState({ users: 0, logins: 0, uptime: 0 });
  const [activeFeature, setActiveFeature] = useState(0);
  const [particles, setParticles] = useState([]);
  const [isClient, setIsClient] = useState(false);
  const containerRef = useRef(null);

  // توليد جزيئات فقط على الكلاينت
  useEffect(() => {
    setIsClient(true);
    const newParticles = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 0.5,
      duration: Math.random() * 8 + 10,
      delay: Math.random() * 4,
      color: ["cyan", "purple", "blue"][Math.floor(Math.random() * 3)]
    }));
    setParticles(newParticles);
  }, []);

  // إحصائيات ديناميكية
  useEffect(() => {
    const animateStats = () => {
      setStats({
        users: Math.min(8900 + Math.random() * 1100, 10000),
        logins: Math.min(4200 + Math.random() * 800, 5000),
        uptime: Math.min(99.8 + Math.random() * 0.2, 99.99)
      });
    };
    animateStats();
    const interval = setInterval(animateStats, 4000);
    return () => clearInterval(interval);
  }, []);

  // تحريك العناصر مع الماوس (Parallax)
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePos({
          x: (e.clientX - rect.left) / rect.width,
          y: (e.clientY - rect.top) / rect.height
        });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const features = [
    { icon: FaUserTie, label: "تسجيل آمن للأطباء", color: "cyan" },
    { icon: FaUser, label: "إدارة حسابات المرضى", color: "purple" },
    { icon: FaShield, label: "حماية البيانات المتقدمة", color: "blue" }
  ];

  return (
    <div 
      ref={containerRef}
      className="relative hidden md:flex flex-col items-center justify-center w-full h-full p-0 overflow-hidden shadow-lg rounded-none group"
    >
      {/* إضافة الـ CSS ديناميكي للجزيئات - فقط عند التحميل على الكلاينت */}
      {isClient && particles.length > 0 && (
        <style>{particles.map(p => `
          @keyframes float-${p.id} {
            0%, 100% { transform: translateY(0) translateX(0); opacity: 0; }
            10% { opacity: 0.8; }
            90% { opacity: 0.8; }
            100% { transform: translateY(-${p.duration * 8}px) translateX(${Math.sin(p.id) * 40}px); opacity: 0; }
          }
        `).join('\n')}</style>
      )}

      {/* الخلفية الرئيسية */}
      <div className="absolute inset-0 z-0 pointer-events-none flex items-stretch justify-stretch">
        <div className="absolute inset-0 w-full h-full bg-linear-to-br from-black via-slate-900 to-slate-950 z-0" />
        
        {/* SVG Grid والعناصر المتحركة */}
        <svg width="100%" height="100%" viewBox="0 0 800 600" className="absolute inset-0 w-full h-full z-10" style={{mixBlendMode:'screen'}}>
          <defs>
            <linearGradient id="neonLine" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00fff7" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#a259ff" stopOpacity="0.7" />
            </linearGradient>
            <radialGradient id="neonGlow1" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#00fff7" stopOpacity="0.18" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
            <radialGradient id="neonGlow2" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#a259ff" stopOpacity="0.13" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
          </defs>
          {/* خطوط أفقية */}
          <line x1="0" y1="40" x2="800" y2="40" stroke="url(#neonLine)" strokeWidth="2" opacity="0.18" />
          <line x1="0" y1="115" x2="800" y2="115" stroke="url(#neonLine)" strokeWidth="2" opacity="0.18" />
          <line x1="0" y1="190" x2="800" y2="190" stroke="url(#neonLine)" strokeWidth="2" opacity="0.18" />
          <line x1="0" y1="265" x2="800" y2="265" stroke="url(#neonLine)" strokeWidth="2" opacity="0.18" />
          <line x1="0" y1="340" x2="800" y2="340" stroke="url(#neonLine)" strokeWidth="2" opacity="0.18" />
          <line x1="0" y1="415" x2="800" y2="415" stroke="url(#neonLine)" strokeWidth="2" opacity="0.18" />
          <line x1="0" y1="490" x2="800" y2="490" stroke="url(#neonLine)" strokeWidth="2" opacity="0.18" />
          <line x1="0" y1="565" x2="800" y2="565" stroke="url(#neonLine)" strokeWidth="2" opacity="0.18" />
          {/* خطوط عمودية */}
          <line x1="40" y1="0" x2="40" y2="600" stroke="url(#neonLine)" strokeWidth="2" opacity="0.13" />
          <line x1="200" y1="0" x2="200" y2="600" stroke="url(#neonLine)" strokeWidth="2" opacity="0.13" />
          <line x1="360" y1="0" x2="360" y2="600" stroke="url(#neonLine)" strokeWidth="2" opacity="0.13" />
          <line x1="520" y1="0" x2="520" y2="600" stroke="url(#neonLine)" strokeWidth="2" opacity="0.13" />
          <line x1="680" y1="0" x2="680" y2="600" stroke="url(#neonLine)" strokeWidth="2" opacity="0.13" />
          {/* دوائر متوهجة متحركة */}
          <circle cx="120" cy="120" r="60" fill="url(#neonGlow1)">
            <animate attributeName="cy" values="120;500;120" dur="14s" repeatCount="indefinite" />
          </circle>
          <circle cx="700" cy="400" r="80" fill="url(#neonGlow2)">
            <animate attributeName="cx" values="700;100;700" dur="20s" repeatCount="indefinite" />
          </circle>
          <circle cx="400" cy="300" r="40" fill="url(#neonGlow1)">
            <animate attributeName="r" values="40;80;40" dur="12s" repeatCount="indefinite" />
          </circle>
          {/* مربع متوهج متحرك */}
          <rect x="600" y="100" width="60" height="60" rx="18" fill="url(#neonGlow2)" opacity="0.7">
            <animate attributeName="y" values="100;400;100" dur="18s" repeatCount="indefinite" />
          </rect>
        </svg>

        {/* جزيئات عائمة - فقط على الكلاينت */}
        {isClient && particles.map(particle => (
          <div
            key={particle.id}
            className="absolute rounded-full pointer-events-none"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              backgroundColor: particle.color === "cyan" ? "#06b6d4" : particle.color === "purple" ? "#a259ff" : "#3b82f6",
              boxShadow: `0 0 ${particle.size * 3}px ${particle.color === "cyan" ? "#06b6d4" : particle.color === "purple" ? "#a259ff" : "#3b82f6"}`,
              animation: `float-${particle.id} ${particle.duration}s ease-in-out ${particle.delay}s infinite`,
              filter: "blur(0.5px)"
            }}
          />
        ))}

        {/* إضاءة تتبع الماوس */}
        <div
          className="absolute w-80 h-80 bg-cyan-500 rounded-full blur-3xl pointer-events-none opacity-0 group-hover:opacity-5 transition-opacity duration-500"
          style={{
            left: `${mousePos.x * 100}%`,
            top: `${mousePos.y * 100}%`,
            transform: "translate(-50%, -50%)",
          }}
        />

        <div className="absolute inset-0 w-full h-full bg-linear-to-br from-cyan-900/40 via-purple-900/30 to-blue-900/40 z-20" />
      </div>

      {/* المحتوى الرئيسي */}
      <div className="relative z-30 flex flex-col items-center justify-center w-full h-full px-6 py-12 overflow-y-auto">
        
        {/* الأيقونات مع تأثيرات */}
        <div className="flex gap-8 mb-10">
          {[FaUserTie, FaUser, FaShield].map((Icon, idx) => (
            <div key={idx} className="relative group/icon">
              <div className="absolute -inset-5 bg-linear-to-r from-cyan-500 to-purple-500 rounded-full opacity-0 group-hover/icon:opacity-20 blur transition duration-500" />
              <Icon
                className={`text-7xl md:text-8xl drop-shadow-neon transition-all duration-300 group-hover/icon:scale-110 group-hover/icon:-rotate-12 cursor-pointer ${
                  idx === 0 ? "text-cyan-400" : idx === 1 ? "text-purple-400" : "text-blue-400"
                }`}
              />
            </div>
          ))}
        </div>

        {/* العنوان والوصف */}
        <h2 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-lg text-cyan-300 text-center animate-[fadeIn_0.8s_ease-in-out]">
          مرحباً بكم في النظام الذكي
        </h2>
        <p className="text-lg md:text-xl drop-shadow text-gray-300 text-center max-w-xl mb-10 animate-[fadeIn_1s_ease-in-out_0.2s_both]">
          تسجيل دخول آمن وسريع للوصول إلى خدماتنا الطبية المتقدمة
        </p>

        {/* المميزات التفاعلية */}
        <div className="flex flex-col gap-4 w-full max-w-md mb-10">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="group/feature cursor-pointer transition-all duration-300 hover:translate-x-2"
              onClick={() => setActiveFeature(idx)}
            >
              <div className={`flex items-center gap-4 p-4 rounded-lg backdrop-blur-sm transition-all duration-300 ${
                activeFeature === idx
                  ? `bg-${feature.color === "cyan" ? "cyan" : feature.color === "purple" ? "purple" : "blue"}-400/20 border border-${feature.color === "cyan" ? "cyan" : feature.color === "purple" ? "purple" : "blue"}-400/50 shadow-lg shadow-${feature.color === "cyan" ? "cyan" : feature.color === "purple" ? "purple" : "blue"}-500/30`
                  : "bg-slate-700/20 border border-slate-600/30 hover:border-slate-500/50"
              }`}>
                <feature.icon className={`text-2xl transition-all group-hover/feature:scale-110 group-hover/feature:rotate-180 text-${feature.color === "cyan" ? "cyan" : feature.color === "purple" ? "purple" : "blue"}-400`} />
                <span className={`text-base font-medium transition-colors ${
                  activeFeature === idx ? "text-white" : "text-gray-300"
                }`}>
                  {feature.label}
                </span>
                <FaArrowRight className={`ml-auto text-${feature.color === "cyan" ? "cyan" : feature.color === "purple" ? "purple" : "blue"}-400 transition-all text-sm ${activeFeature === idx ? "translate-x-1" : ""}`} />
              </div>
            </div>
          ))}
        </div>

        {/* الإحصائيات */}
        <div className="grid grid-cols-3 gap-4 w-full max-w-md mb-8">
          <div className="bg-linear-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-400/30 rounded-lg p-4 text-center backdrop-blur-sm hover:border-cyan-400/50 transition-all hover:shadow-lg hover:shadow-cyan-500/20">
            <p className="text-2xl font-bold text-cyan-300">{Math.floor(stats.users / 100)}</p>
            <p className="text-sm text-gray-400 mt-2">مستخدم</p>
          </div>
          
          <div className="bg-linear-to-br from-purple-500/20 to-pink-500/20 border border-purple-400/30 rounded-lg p-4 text-center backdrop-blur-sm hover:border-purple-400/50 transition-all hover:shadow-lg hover:shadow-purple-500/20">
            <p className="text-2xl font-bold text-purple-300">{Math.floor(stats.logins / 100)}</p>
            <p className="text-sm text-gray-400 mt-2">دخول</p>
          </div>
          
          <div className="bg-linear-to-br from-blue-500/20 to-cyan-500/20 border border-blue-400/30 rounded-lg p-4 text-center backdrop-blur-sm hover:border-blue-400/50 transition-all hover:shadow-lg hover:shadow-blue-500/20">
            <p className="text-2xl font-bold text-blue-300">{stats.uptime.toFixed(2)}%</p>
            <p className="text-sm text-gray-400 mt-2">توفر</p>
          </div>
        </div>

        {/* زر الدخول CTA */}
        <div className="relative group/cta">
          <div className="absolute -inset-1 bg-linear-to-r from-cyan-500 via-purple-500 to-blue-500 rounded-lg blur opacity-40 group-hover/cta:opacity-100 transition duration-300" />
          <button className="relative px-7 py-3 bg-slate-900 text-white rounded-lg font-semibold flex items-center gap-3 hover:bg-slate-800 transition-all hover:scale-105 text-base">
            <FaCheck className="text-sm" />
            ابدأ الآن
            <FaArrowRight className="text-sm" />
          </button>
        </div>
      </div>
    </div>
  );
}
