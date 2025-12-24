"use client";
import { useState } from "react";
import { FaEnvelope, FaShield, FaArrowLeft, FaHouse } from "react-icons/fa6";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useLocaleContext } from "../hooks/useLocaleContext";

export default function ForgotPasswordForm() {
  const locale = useLocale();
  const t = useTranslations("forgotpasswordform");
  const { toggleLocale } = useLocaleContext();
  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  const [form, setForm] = useState({ email: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // Add withLocale helper for localized routing
  const withLocale = (path) => {
    const base = path.startsWith("/") ? path : `/${path}`;
    if (base.startsWith("/en") || base.startsWith("/ar")) return base;
    return `/${locale}${base === "/" ? "" : base}`;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    // Simulate sending reset email
    setTimeout(() => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(form.email)) {
        setError(t("auth.forgotPassword.errors.invalidEmail") || "البريد الإلكتروني غير صحيح");
        setLoading(false);
        return;
      }

      // Simulate email sent
      setSuccess(true);
      setForm({ email: "" });
      setLoading(false);
    }, 1200);
  };

  // Bilingual labels
  const labels = locale === "en" ? {
    title: "Reset Password",
    subtitle: "Enter your email to receive a password reset link",
    emailLabel: "Email Address",
    emailPlaceholder: "example@email.com",
    submitButton: "Send Reset Link",
    loading: "Sending...",
    backToLogin: "Back to Login",
    successMessage: "Reset link sent! Check your email for instructions.",
    invalidEmail: "Please enter a valid email address",
    tryAnother: "Try another email",
    noAccount: "Don't have an account?",
    signup: "Sign up here",
  } : {
    title: "إعادة تعيين كلمة المرور",
    subtitle: "أدخل بريدك الإلكتروني لتلقي رابط إعادة التعيين",
    emailLabel: "البريد الإلكتروني",
    emailPlaceholder: "example@email.com",
    submitButton: "إرسال رابط التعيين",
    loading: "جاري الإرسال...",
    backToLogin: "العودة لتسجيل الدخول",
    successMessage: "تم إرسال الرابط! تحقق من بريدك الإلكتروني للتعليمات.",
    invalidEmail: "يرجى إدخال بريد إلكتروني صحيح",
    tryAnother: "جرب بريد آخر",
    noAccount: "ليس لديك حساب؟",
    signup: "سجل هنا",
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative no-scrollbar" dir={dir} lang={locale} style={{ overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {/* خلفية زرقاء خاصة بإعادة تعيين كلمة المرور */}
      <div className="fixed inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(/icons/bluelogin.jpg)' }}
        />
        {/* طبقة شفافة لزيادة التباين */}
        <div className="absolute inset-0 bg-blue-900/40 pointer-events-none" />
      </div>
      
      {/* الفورم المحصور في المنتصف */}
      <div className="relative z-10 w-full max-w-md">
        <form
          onSubmit={handleSubmit}
          className="w-full glass-morph bg-white/20 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/30 p-8"
        >
          {/* Section 1: Header */}
          <div className="mb-8 flex items-center justify-between gap-2">
            <div className="flex flex-col items-center gap-4 flex-1">
              <div className="inline-block p-4 rounded-full glass-morph bg-white/30 shadow-xl">
                <FaShield className="text-4xl text-white" />
              </div>
              <div className="text-center">
                <h2 className="text-3xl font-bold text-white mb-1">{labels.title}</h2>
                <p className="text-white/90 text-base">{labels.subtitle}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href={locale === "en" ? "/en" : "/ar"}
                className="w-10 h-10 flex items-center justify-center rounded-full glass-morph bg-white/30 text-white hover:bg-white/40 shadow-md border border-white/40 transition-all focus:outline-none focus:ring-2 focus:ring-white/40"
                title={locale === "ar" ? "العودة للرئيسية" : "Back to home"}
                aria-label={locale === "ar" ? "العودة للرئيسية" : "Back to home"}
                onClick={e => {
                  const homePath = locale === "en" ? "/en" : "/ar";
                  const current = window.location.pathname;
                  if (current === homePath) {
                    e.preventDefault();
                    return;
                  }
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

          {/* Success Message */}
          {success && (
            <div className="bg-green-500/20 backdrop-blur border-2 border-green-400/50 rounded-xl p-4 text-white text-base flex items-start gap-3 mt-4">
              <span className="text-xl shrink-0 mt-0.5">✅</span>
              <div className="flex-1 space-y-2">
                <p className="font-semibold">{labels.successMessage}</p>
                <button
                  type="button"
                  onClick={() => {
                    setSuccess(false);
                    setForm({ email: "" });
                  }}
                  className="text-sm font-medium hover:underline"
                >
                  {labels.tryAnother}
                </button>
              </div>
            </div>
          )}

          {/* Email Field */}
          {!success && (
            <>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-white mb-3">{labels.emailLabel}</label>
                <div className="relative">
                  <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-xl" />
                  <input
                    type="email"
                    name="email"
                    placeholder={labels.emailPlaceholder}
                    value={form.email}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    className="w-full pl-12 pr-4 py-4 border-2 border-white/30 rounded-xl glass-morph bg-white/20 text-white placeholder:text-white/60 focus:outline-none focus:border-white/50 focus:ring-4 focus:ring-white/20 transition-all text-base"
                  />
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-900/20 backdrop-blur border-2 border-red-800 rounded-xl p-4 text-red-400 text-base flex items-center gap-3 mb-4">
                  <span className="text-xl shrink-0">⚠️</span>
                  <span className="font-medium">{error}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-xl bg-linear-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] mb-6"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {labels.loading}
                  </span>
                ) : (
                  labels.submitButton
                )}
              </button>
            </>
          )}

          {/* Back to Login */}
          <div className="flex flex-col gap-3 text-center text-sm">
            <Link
              href="/login"
              className="flex items-center justify-center gap-2 text-blue-200 hover:text-white font-semibold transition-colors"
            >
              <FaArrowLeft className="text-lg" />
              {labels.backToLogin}
            </Link>
            <div className="text-blue-100">
              {labels.noAccount}{" "}
              <Link href={withLocale("/signup")} className="text-blue-200 hover:text-white font-semibold transition-colors">
                {labels.signup}
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}