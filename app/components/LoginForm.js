"use client";
import { useState } from "react";
import { FaFacebook, FaGoogle, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaShield, FaHouse } from "react-icons/fa6";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useLocaleContext } from "../hooks/useLocaleContext";

export default function LoginForm() {
  const locale = useLocale();
  const t = useTranslations("login");
  const { toggleLocale } = useLocaleContext();
  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Add withLocale helper for localized routing
  const withLocale = (path) => {
    const base = path.startsWith("/") ? path : `/${path}`;
    if (base.startsWith("/en") || base.startsWith("/ar")) return base;
    return `/${locale}${base === "/" ? "" : base}`;
  };


  // حذف المستخدمين الوهميين واستخدام API حقيقي

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, password: form.password })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "حدث خطأ غير متوقع");
        setLoading(false);
        return;
      }
      // توجيه حسب الدور
      const user = data.user;
      // dev helper: expose tokenForDev to window for Socket.io handshake
      if (typeof window !== 'undefined' && data.tokenForDev) {
        try { window.__DEV_TOKEN = data.tokenForDev; } catch (e) { /* ignore */ }
      }
      const basePath = locale === "ar" ? "/ar" : "/en";
      if (user.role === "doctor") window.location.href = `${basePath}/doctor/dashboard`;
      else if (user.role === "patient") window.location.href = `${basePath}/patient/dashboard`;
      else if (user.role === "admin") window.location.href = `${basePath}/admin/dashboard`;
    } catch (err) {
      setError("حدث خطأ في الاتصال بالخادم");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative" dir={dir} lang={locale}>
      {/* خلفية زرقاء خاصة بتسجيل الدخول */}
      <div className="fixed inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(/icons/bluelogin.jpg)' }}
        />
        {/* طبقة شفافة لزيادة التباين */}
        <div className="absolute inset-0 bg-blue-900/40 pointer-events-none" />
      </div>
      
      {/* الفورم المحصور في المنتصف */}
      <div className="relative z-10 w-full max-w-md flex items-center justify-center min-h-[80vh] mx-auto">
        <form
          onSubmit={handleSubmit}
          className="w-full glass-morph bg-white/20 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/30 p-8 max-h-[90vh] overflow-y-auto"
        >
          {/* Section 1: Header */}
          <div className="mb-8 flex flex-col items-center gap-4">
            <div className="inline-block p-4 rounded-full glass-morph bg-white/30 shadow-xl">
              <FaShield className="text-4xl text-white" />
            </div>
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-1">{t("auth.login.title") || "تسجيل الدخول"}</h2>
              <p className="text-white/90 text-base">{t("auth.login.subtitle") || "أدخل بيانات حسابك للمتابعة"}</p>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Link
                href={locale === "en" ? "/en" : "/ar"}
                className="w-10 h-10 flex items-center justify-center rounded-full glass-morph bg-white/30 text-white hover:bg-white/40 shadow-md border border-white/40 transition-all focus:outline-none focus:ring-2 focus:ring-white/40"
                title={locale === "ar" ? "العودة للرئيسية" : "Back to home"}
                aria-label={locale === "ar" ? "العودة للرئيسية" : "Back to home"}
                onClick={e => {
                  const homePath = locale === "en" ? "/en" : "/ar";
                  const current = window.location.pathname;
                  // إذا كان على الجذر امنع إعادة التحميل
                  if (current === homePath) {
                    e.preventDefault();
                    return;
                  }
                  // إذا كان على /ar/ar أو /en/en أو أي مسار يبدأ بـ /ar/ أو /en/ أعد التوجيه للجذر
                  if (
                    current === `${homePath}/${locale}` ||
                    current.startsWith(`${homePath}/`)
                  ) {
                    e.preventDefault();
                    window.location.href = homePath;
                  }
                }}
              >
                <FaHouse className="text-xl" />
              </Link>
              <button
                type="button"
                onClick={toggleLocale}
                className="flex items-center gap-2 px-3 py-2 rounded-full glass-morph bg-white/30 text-white hover:bg-white/40 transition-colors font-medium text-sm"
                title={locale === "ar" ? "Switch to English" : "التبديل للعربية"}
              >
                <span>🌐</span>
                <span>{locale === "ar" ? "EN" : "AR"}</span>
              </button>
            </div>
          </div>
          
          {/* Section 2: Social Login */}
          <div className="mb-6 pb-6 border-b border-white/20">
            <div className="flex items-center justify-center gap-4">
              <button type="button" className="flex-1 max-w-40 h-12 rounded-xl glass-morph bg-white/20 text-white shadow-lg transition-all hover:scale-105 ring-2 ring-white/30 flex items-center justify-center gap-2 font-medium border border-white/40" title="Facebook">
                <span className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-600 shadow">
                  <FaFacebook className="text-lg text-white" />
                </span>
                <span className="text-sm">Facebook</span>
              </button>
              <button type="button" className="flex-1 max-w-40 h-12 rounded-xl glass-morph bg-white/20 text-white shadow-lg transition-all hover:scale-105 ring-2 ring-white/30 flex items-center justify-center gap-2 font-medium border border-white/40" title="Google">
                <span className="w-8 h-8 flex items-center justify-center rounded-full bg-red-500 shadow">
                  <FaGoogle className="text-lg text-white" />
                </span>
                <span className="text-sm">Google</span>
              </button>
            </div>
            <div className="flex items-center justify-center gap-3 mt-4">
              <div className="h-px bg-white/30 flex-1"></div>
              <span className="text-white/90 text-sm font-medium">{t("auth.login.socialDivider") || "أو باستخدام البريد الإلكتروني"}</span>
              <div className="h-px bg-white/30 flex-1"></div>
            </div>
          </div>
          
          {/* Section 3: Form Fields */}
          <div className="space-y-3">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-semibold text-white mb-3">{t("auth.login.emailLabel") || "البريد الإلكتروني"}</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full glass-morph bg-white/30">
                  <FaEnvelope className="text-white text-lg" />
                </span>
                <input
                  type="email"
                  name="email"
                  placeholder="example@email.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-4 py-4 border-2 border-white/30 rounded-xl glass-morph bg-white/20 text-white placeholder:text-white/60 focus:outline-none focus:border-white/50 focus:ring-4 focus:ring-white/20 transition-all text-base"
                />
              </div>
            </div>
            
            {/* Password Field */}
            <div>
              <label className="block text-sm font-semibold text-white mb-3">{t("auth.login.passwordLabel") || "كلمة المرور"}</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full glass-morph bg-white/30">
                  <FaLock className="text-white text-lg" />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-12 py-4 border-2 border-white/30 rounded-xl glass-morph bg-white/20 text-white placeholder:text-white/60 focus:outline-none focus:border-white/50 focus:ring-4 focus:ring-white/20 transition-all text-base"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-yellow-300 transition-colors"
                >
                  {showPassword ? <FaEyeSlash className="text-xl" /> : <FaEye className="text-xl" />}
                </button>
              </div>
            </div>
          </div>
          
          {/* Error Message */}
          {error && (
            <div className="bg-red-900/20 backdrop-blur border-2 border-red-800 rounded-xl p-4 text-red-400 text-base flex items-center gap-3 mt-4">
              <span className="text-xl shrink-0">⚠️</span>
              <span className="font-medium">{error}</span>
            </div>
          )}
          
          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl bg-linear-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] mt-6"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {t("auth.login.loading") || "جاري التحقق..."}
              </span>
            ) : (
              t("auth.login.ctaPrimary") || "دخول"
            )}
          </button>
          
          {/* Extra Links */}
          <div className="flex flex-col gap-3 text-center text-sm mt-6">
            <Link href={withLocale("/forgot-password")} className="text-blue-200 hover:text-white font-semibold transition-colors">
              {t("auth.login.forgot") || "هل نسيت كلمة المرور؟"}
            </Link>
            <div className="text-blue-100">
              {t("auth.login.noAccount") || "ليس لديك حساب؟"}{" "}
              <Link href={withLocale("/signup")} className="text-blue-200 hover:text-white font-semibold transition-colors">
                {t("auth.login.goSignup") || "سجل الآن"}
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}