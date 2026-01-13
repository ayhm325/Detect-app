"use client";

import { useState } from "react";
import { FaFacebook, FaGoogle, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaShield, FaHouse } from "react-icons/fa6";
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
} from "./authStyles";

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
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url(/icons/bluelogin.jpg)' }} />
        <div className="absolute inset-0 bg-transparent pointer-events-none" />
      </div>

      {/* Form */}
      <div className="relative z-10 w-full max-w-md flex items-center justify-center min-h-[80vh] mx-auto">
        <form onSubmit={handleSubmit} className={glassContainer} aria-live="polite">
          
          {/* Header */}
          <div className="mb-8 flex flex-col items-center gap-4">
            <div className="inline-block p-4 rounded-full" aria-hidden>
              <FaShield className="text-4xl text-green-600" />
            </div>
            <div className="text-center">
              <h2 className="text-3xl font-bold text-green-600 mb-1">{t("auth.login.title")}</h2>
              <p className="text-green-600 text-base">{t("auth.login.subtitle")}</p>
            </div>

            <div className="flex items-center gap-2 mt-2">
              <Link href={withLocale("/")} className={backHomeBtn} title={t("ui.backHomeTitle")} aria-label={t("ui.backHomeTitle")}>
                <FaHouse className="text-xl text-green-600" />
              </Link>
              <button type="button" onClick={toggleLocale} className="flex items-center gap-2 px-3 py-2 rounded-full glass-morph bg-green-10 text-green-700 hover:bg-green-800/40 transition-colors font-medium text-sm">
                🌐 <span>{t("ui.switchLanguageShort")}</span>
              </button>
            </div>
          </div>

          {/* Social Login */}
          <div className="mb-6 pb-6 border-b border-green-500/20">
            <div className="flex items-center justify-center gap-4">
              <button type="button" className={socialButton} title={t("social.facebook")}>
                <span className="w-8 h-8 flex items-center justify-center rounded-full bg-green-600/30 shadow">
                  <FaFacebook className="text-lg text-green-600" />
                </span>
                <span className="text-green-600">{t("social.facebook")}</span>
              </button>
              <button type="button" className={socialButton} title={t("social.google")}>
                <span className="w-8 h-8 flex items-center justify-center rounded-full bg-green-600/30 shadow">
                  <FaGoogle className="text-lg text-green-600" />
                </span>
                <span className="text-green-600">{t("social.google")}</span>
              </button>
            </div>
            <div className="flex items-center justify-center gap-3 mt-4">
              <div className="h-px bg-green-600/30 flex-1"></div>
              <span className="text-green-600 text-sm font-medium">{t("auth.login.socialDivider")}</span>
              <div className="h-px bg-green-600/30 flex-1"></div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-semibold text-green-600 mb-3">{t("auth.login.emailLabel")}</label>
              <div className="relative">
                <span className={iconBubble}><FaEnvelope className="text-green-600 text-lg" /></span>
                <input type="email" name="email" value={form.email} onChange={handleChange} required placeholder={t("auth.login.emailPlaceholder")} className={inputBase} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-green-600 mb-3">{t("auth.login.passwordLabel")}</label>
              <div className="relative">
                <span className={iconBubble}><FaLock className="text-green-600 text-lg" /></span>
                <input type={showPassword ? "text" : "password"} name="password" value={form.password} onChange={handleChange} required placeholder={t("auth.login.passwordPlaceholder")} className={inputBasePassword} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-green-600 hover:text-green-600 transition-colors">
                  {showPassword ? <FaEyeSlash className="text-xl" /> : <FaEye className="text-xl" />}
                </button>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div role="alert" className="bg-green-900/50 backdrop-blur border-2 border-green-500 rounded-xl p-4 text-green-600 text-base flex items-center gap-3 mt-4">
              ⚠️ <span className="font-medium">{error}</span>
            </div>
          )}

          {/* Submit */}
          <button type="submit" disabled={loading} className={btnPrimary}>
            {loading ? <span className="flex items-center justify-center gap-2"><span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin text-green-600" />{t("auth.login.loading")}</span> : <span className="text-green-100">{t("auth.login.ctaPrimary")}</span>}
          </button>

          {/* Extra Links */}
          <div className="flex flex-col gap-3 text-center text-sm mt-6">
            <Link href={withLocale("/forgot-password")} className="text-green-600 hover:text-green-600 font-semibold">{t("auth.login.forgot")}</Link>
            <div className="text-green-600">
              {t("auth.login.noAccount")} <Link href={withLocale("/signup")} className="text-green-600 hover:text-green-600 font-semibold">{t("auth.login.goSignup")}</Link>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}