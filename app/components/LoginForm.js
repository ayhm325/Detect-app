"use client";

import { useState } from "react";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaShield, FaHouse } from "react-icons/fa6";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useLocaleContext } from "../hooks/useLocaleContext";
import {
  glassContainer,
  iconBubble,
  inputBase,
  inputBasePassword,
  btnPrimary,
  socialButton,
  backHomeBtn,
  authText,
  authIcon,
} from "./authStyles";
import AnimatedBackground from "./ui/AnimatedBackground";

export default function LoginForm() {
  const locale = useLocale();
  const t = useTranslations("login");
  const { toggleLocale } = useLocaleContext();
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const withLocale = (path) => {
    const base = path.startsWith("/") ? path : `/${path}`;
    return base.startsWith("/en") || base.startsWith("/ar") ? base : `/${locale}${base === "/" ? "" : base}`;
  };

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

      if (typeof window !== 'undefined' && data.tokenForDev) {
        window.__DEV_TOKEN = data.tokenForDev;
      }

      const basePath = locale === "ar" ? "/ar" : "/en";
      switch (data.user.role) {
        case "doctor": window.location.href = `${basePath}/doctor/dashboard`; break;
        case "patient": window.location.href = `${basePath}/patient/dashboard`; break;
        case "admin": window.location.href = `${basePath}/admin/dashboard`; break;
      }
    } catch {
      setError(t("auth.login.errors.serverConnection"));
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative" dir={dir} lang={locale}>
      {/* Background (animated) */}
      <AnimatedBackground className="fixed inset-0" />

      {/* Form */}
      <div className="relative z-10 w-full max-w-md flex items-center justify-center min-h-[80vh] mx-auto">
        <form onSubmit={handleSubmit} className={glassContainer} aria-live="polite">
          
          {/* Header */}
          <div className="mb-8 flex flex-col items-center gap-4">
              <div className="inline-block p-4 rounded-full" aria-hidden>
              <FaShield className={`text-4xl ${authIcon}`} />
            </div>
            <div className="text-center">
              <h2 className={`text-3xl font-bold ${authText} mb-1`}>{t("auth.login.title")}</h2>
              <p className={`${authText} text-base`}>{t("auth.login.subtitle")}</p>
            </div>

            <div className="flex items-center gap-2 mt-2">
              <Link href={withLocale("/")} className={backHomeBtn} title={t("ui.backHomeTitle")} aria-label={t("ui.backHomeTitle")}>
                <FaHouse className={`text-xl ${authIcon}`} />
              </Link>
              <button type="button" onClick={toggleLocale} className={`${backHomeBtn} ${authIcon}`} aria-label={t("ui.switchLanguageShort")}>
                <span className={`uppercase text-sm font-semibold ${authIcon}`}>{locale === 'ar' ? 'EN' : 'AR'}</span>
              </button>
            </div>
          </div>

          {/* Social login removed per request */}

          {/* Form Fields */}
          <div className="space-y-3">
            <div>
              <label className={`block text-sm font-semibold ${authText} mb-3`}>{t("auth.login.emailLabel")}</label>
              <div className="relative">
                <span className={iconBubble}><FaEnvelope className={`text-lg ${authIcon}`} /></span>
                <input type="email" name="email" value={form.email} onChange={handleChange} required placeholder={t("auth.login.emailPlaceholder")} className={inputBase} />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-semibold ${authText} mb-3`}>{t("auth.login.passwordLabel")}</label>
              <div className="relative">
                <span className={iconBubble}><FaLock className={`text-lg ${authIcon}`} /></span>
                <input type={showPassword ? "text" : "password"} name="password" value={form.password} onChange={handleChange} required placeholder={t("auth.login.passwordPlaceholder")} className={inputBasePassword} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className={`absolute right-4 top-1/2 -translate-y-1/2 ${authIcon} hover:${authIcon} transition-colors`}>
                  {showPassword ? <FaEyeSlash className="text-xl" /> : <FaEye className="text-xl" />}
                </button>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div role="alert" className={`bg-green-100/50 backdrop-blur border-2 border-green-800 rounded-xl p-3 ${authText} text-base flex items-center gap-3 mt-4`}>
              ⚠️ <span className="font-medium">{error}</span>
            </div>
          )}

          {/* Submit */}
          <button type="submit" disabled={loading} className={`${btnPrimary} mt-6`}>
            {loading ? <span className="flex items-center justify-center gap-2"><span className={`inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin ${authIcon}`} />{t("auth.login.loading")}</span> : <span className="text-green-100">{t("auth.login.ctaPrimary")}</span>}
          </button>

          {/* Extra Links */}
          <div className="flex flex-col gap-3 text-center text-sm mt-6">
            <Link href={withLocale("/forgot-password")} className={`${authIcon} hover:${authIcon} font-semibold`}>{t("auth.login.forgot")}</Link>
            <div className={`${authIcon}`}>
              {t("auth.login.noAccount")} <Link href={withLocale("/signup")} className={`${authIcon} hover:${authIcon} font-semibold`}>{t("auth.login.goSignup")}</Link>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}