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
        setError(data.error || t("auth.login.errors.unexpected"));
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
      setError(t("auth.login.errors.serverConnection"));
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
        <div className="absolute inset-0 bg-(--ui-foreground)/40 pointer-events-none" />
      </div>
      
      {/* الفورم المحصور في المنتصف */}
      <div className="relative z-10 w-full max-w-md flex items-center justify-center min-h-[80vh] mx-auto">
        <form
          onSubmit={handleSubmit}
          className="w-full glass-morph bg-(--color-neutral)/20 backdrop-blur-lg rounded-3xl shadow-2xl border border-(--color-neutral)/30 p-8 max-h-[90vh] overflow-y-auto"
        >
          {/* Section 1: Header */}
          <div className="mb-8 flex flex-col items-center gap-4">
            <div className="inline-block p-4 rounded-full glass-morph bg-(--color-neutral)/30 shadow-xl">
              <FaShield className="text-4xl text-white" />
            </div>
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-1">{t("auth.login.title")}</h2>
              <p className="text-white/90 text-base">{t("auth.login.subtitle")}</p>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Link
                href={locale === "en" ? "/en" : "/ar"}
                className="w-10 h-10 flex items-center justify-center rounded-full glass-morph bg-(--color-neutral)/30 text-white hover:bg-(--color-neutral)/40 shadow-md border border-(--color-neutral)/40 transition-all focus:outline-none focus:ring-2 focus:ring-(--color-neutral)/40"
                title={t("ui.backHomeTitle")}
                aria-label={t("ui.backHomeTitle")}
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
                className="flex items-center gap-2 px-3 py-2 rounded-full glass-morph bg-(--color-neutral)/30 text-white hover:bg-(--color-neutral)/40 transition-colors font-medium text-sm"
                title={t("ui.switchLanguageTitle")}
              >
                <span>🌐</span>
                <span>{t("ui.switchLanguageShort")}</span>
              </button>
            </div>
          </div>
          
          {/* Section 2: Social Login */}
          <div className="mb-6 pb-6 border-b border-(--color-neutral)/20">
            <div className="flex items-center justify-center gap-4">
              <button type="button" className="flex-1 max-w-40 h-12 rounded-xl glass-morph bg-background/15 text-white shadow-lg transition-all hover:scale-105 ring-2 ring-(--ui-border) flex items-center justify-center gap-2 font-medium border border-(--ui-border)" title={t("social.facebook")}>
                <span className="w-8 h-8 flex items-center justify-center rounded-full bg-(--ui-info) shadow">
                  <FaFacebook className="text-lg text-(--ui-info-foreground)" />
                </span>
                <span className="text-sm">{t("social.facebook")}</span>
              </button>
              <button type="button" className="flex-1 max-w-40 h-12 rounded-xl glass-morph bg-background/15 text-white shadow-lg transition-all hover:scale-105 ring-2 ring-(--ui-border) flex items-center justify-center gap-2 font-medium border border-(--ui-border)" title={t("social.google")}>
                <span className="w-8 h-8 flex items-center justify-center rounded-full bg-(--ui-danger) shadow">
                  <FaGoogle className="text-lg text-(--ui-danger-foreground)" />
                </span>
                <span className="text-sm">{t("social.google")}</span>
              </button>
            </div>
            <div className="flex items-center justify-center gap-3 mt-4">
              <div className="h-px bg-(--color-neutral)/30 flex-1"></div>
              <span className="text-white/90 text-sm font-medium">{t("auth.login.socialDivider")}</span>
              <div className="h-px bg-(--color-neutral)/30 flex-1"></div>
            </div>
          </div>
          
          {/* Section 3: Form Fields */}
          <div className="space-y-3">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-semibold text-white mb-3">{t("auth.login.emailLabel")}</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full glass-morph bg-(--color-neutral)/30">
                  <FaEnvelope className="text-white text-lg" />
                </span>
                <input
                  type="email"
                  name="email"
                  placeholder={t("auth.login.emailPlaceholder")}
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-4 py-4 border-2 border-(--ui-border) rounded-xl glass-morph bg-background/15 text-white placeholder:text-white/60 focus:outline-none focus:border-(--ui-ring) focus:ring-4 focus:ring-(--ui-ring)/20 transition-all text-base"
                />
              </div>
            </div>
            
            {/* Password Field */}
            <div>
              <label className="block text-sm font-semibold text-white mb-3">{t("auth.login.passwordLabel")}</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full glass-morph bg-(--color-neutral)/30">
                  <FaLock className="text-white text-lg" />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-12 py-4 border-2 border-(--ui-border) rounded-xl glass-morph bg-background/15 text-white placeholder:text-white/60 focus:outline-none focus:border-(--ui-ring) focus:ring-4 focus:ring-(--ui-ring)/20 transition-all text-base"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-(--ui-ring) transition-colors"
                >
                  {showPassword ? <FaEyeSlash className="text-xl" /> : <FaEye className="text-xl" />}
                </button>
              </div>
            </div>
          </div>
          
          {/* Error Message */}
          {error && (
            <div className="bg-(--ui-danger-bg) backdrop-blur border-2 border-(--ui-danger-border) rounded-xl p-4 text-white text-base flex items-center gap-3 mt-4">
              <span className="text-xl shrink-0">⚠️</span>
              <span className="font-medium">{error}</span>
            </div>
          )}
          
          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl btn-gradient font-bold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] mt-6"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    {t("auth.login.loading")}
              </span>
            ) : (
              t("auth.login.ctaPrimary")
            )}
          </button>
          
          {/* Extra Links */}
          <div className="flex flex-col gap-3 text-center text-sm mt-6">
            <Link href={withLocale("/forgot-password")} className="text-(--ui-info) hover:text-white font-semibold transition-colors">
              {t("auth.login.forgot")}
            </Link>
            <div className="text-white/80">
              {t("auth.login.noAccount")}{" "}
              <Link href={withLocale("/signup")} className="text-(--ui-info) hover:text-white font-semibold transition-colors">
                {t("auth.login.goSignup")}
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}