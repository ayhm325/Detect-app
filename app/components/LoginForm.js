"use client";
import { useState } from "react";
import { FaFacebook, FaGoogle, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaShield } from "react-icons/fa6";
import { Link } from "@/i18n/routing";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useLocaleContext } from "../hooks/useLocaleContext";

export default function LoginForm() {
  const locale = useLocale();
  const t = useTranslations();
  const { toggleLocale } = useLocaleContext();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // محاكاة تحقق من Firebase
  const fakeUsers = [
    { email: "doctor@test.com", password: "123456", type: "doctor" },
    { email: "patient@test.com", password: "123456", type: "patient" },
    { email: "admin@test.com", password: "123456", type: "admin", disabled: true },
  ];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setTimeout(() => {
      const user = fakeUsers.find((u) => u.email === form.email);
      if (!user) {
        setError(t("auth.login.errors.notFound") || "البريد الإلكتروني غير مسجل");
        setLoading(false);
        return;
      }
      if (user.disabled) {
        setError(t("auth.login.errors.disabled") || "هذا الحساب معطل");
        setLoading(false);
        return;
      }
      if (user.password !== form.password) {
        setError(t("auth.login.errors.wrongPassword") || "كلمة المرور غير صحيحة");
        setLoading(false);
        return;
      }
      // توجيه حسب نوع المستخدم
      const basePath = locale === "ar" ? "/ar" : "/en";
      if (user.type === "doctor") window.location.href = `${basePath}/doctor/dashboard`;
      else if (user.type === "patient") window.location.href = `${basePath}/patient/dashboard`;
      else if (user.type === "admin") window.location.href = `${basePath}/admin/dashboard`;
    }, 1200);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl p-8 md:p-12 border border-yellow-100 dark:border-zinc-800 space-y-6"
    >
      {/* العنوان والأيقونة */}
      <div className="flex flex-col items-center text-center space-y-3 relative">
        <div className="absolute top-0 right-0">
          <button
            type="button"
            onClick={toggleLocale}
            className="flex items-center gap-2 px-3 py-2 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-200 dark:hover:bg-yellow-900/50 transition-colors font-medium text-sm"
            title={locale === "ar" ? "Switch to English" : "التبديل للعربية"}
          >
            <span>🌐</span>
            <span>{locale === "ar" ? "EN" : "AR"}</span>
          </button>
        </div>
        <div className="p-4 bg-gradient-to-br from-yellow-100 to-red-100 dark:from-yellow-900/30 dark:to-red-900/30 rounded-2xl">
          <FaShield className="text-5xl text-yellow-600 dark:text-yellow-400" />
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-600 to-red-600 bg-clip-text text-transparent">
          {t("auth.login.title") || "تسجيل الدخول"}
        </h1>
        <p className="text-base text-gray-600 dark:text-gray-400">{t("auth.login.subtitle") || "أدخل بيانات حسابك للمتابعة"}</p>
      </div>

      {/* خيارات الدخول الاجتماعي */}
      <div className="space-y-4">
        <div className="flex gap-4">
          <button
            type="button"
            className="flex-1 flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium shadow-lg transition-all hover:scale-[1.02] border-2 border-blue-400/30"
          >
            <FaFacebook className="text-xl" />
            <span>Facebook</span>
          </button>
          <button
            type="button"
            className="flex-1 flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium shadow-lg transition-all hover:scale-[1.02] border-2 border-red-400/30"
          >
            <FaGoogle className="text-xl" />
            <span>Google</span>
          </button>
        </div>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-zinc-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white dark:bg-zinc-900 text-gray-500 dark:text-gray-400">{t("auth.login.socialDivider") || "أو باستخدام البريد الإلكتروني"}</span>
          </div>
        </div>
      </div>

      {/* حقل البريد الإلكتروني */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">{t("auth.login.emailLabel") || "البريد الإلكتروني"}</label>
        <div className="relative">
          <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-yellow-600 dark:text-yellow-400 text-xl" />
          <input
            type="email"
            name="email"
            placeholder="example@email.com"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full pl-12 pr-4 py-4 text-base border-2 border-gray-300 dark:border-zinc-700 rounded-xl bg-gray-50 dark:bg-zinc-800 text-gray-900 dark:text-white placeholder:text-gray-500 focus:border-yellow-500 dark:focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 transition-all"
          />
        </div>
      </div>

      {/* حقل كلمة المرور */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">{t("auth.login.passwordLabel") || "كلمة المرور"}</label>
        <div className="relative">
          <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-yellow-600 dark:text-yellow-400 text-xl" />
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="••••••••"
            value={form.password}
            onChange={handleChange}
            required
            className="w-full pl-12 pr-12 py-4 text-base border-2 border-gray-300 dark:border-zinc-700 rounded-xl bg-gray-50 dark:bg-zinc-800 text-gray-900 dark:text-white placeholder:text-gray-500 focus:border-yellow-500 dark:focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 transition-all"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-yellow-600 dark:text-yellow-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
          >
            {showPassword ? <FaEyeSlash className="text-xl" /> : <FaEye className="text-xl" />}
          </button>
        </div>
      </div>

      {/* رسالة الخطأ */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-800 rounded-xl p-4 text-red-700 dark:text-red-400 text-base flex items-center gap-3">
          <span className="text-xl shrink-0">⚠️</span>
          <span className="font-medium">{error}</span>
        </div>
      )}

      {/* زر تسجيل الدخول */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-4 rounded-xl bg-gradient-to-r from-yellow-500 to-red-500 hover:from-yellow-600 hover:to-red-600 text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02]"
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

      {/* روابط إضافية */}
      <div className="flex flex-col gap-3 text-center text-sm">
        <Link href="/forgot-password" className="text-yellow-600 dark:text-yellow-400 hover:text-red-600 dark:hover:text-red-400 font-semibold transition-colors">
          {t("auth.login.forgot") || "هل نسيت كلمة المرور؟"}
        </Link>
        <div className="text-gray-600 dark:text-gray-400">
          {t("auth.login.noAccount") || "ليس لديك حساب؟"}{" "}
          <Link href="/signup" className="text-yellow-600 dark:text-yellow-400 hover:text-red-600 dark:hover:text-red-400 font-semibold transition-colors">
            {t("auth.login.goSignup") || "سجل الآن"}
          </Link>
        </div>
      </div>
    </form>
  );
}
