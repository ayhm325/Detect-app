"use client";
// Helper to prefix locale to path
function withLocale(locale, path) {
  if (!path.startsWith("/")) path = "/" + path;
  if (locale === "ar" || locale === "en") {
    return `/${locale}${path}`;
  }
  return path;
}

import { FaUser, FaEnvelope, FaLock, FaUserPlus, FaCheck, FaStethoscope, FaBed, FaGoogle, FaFacebook, FaEye, FaEyeSlash, FaPhone, FaHouse } from "react-icons/fa6";
import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useLocaleContext } from "../hooks/useLocaleContext";

function SignUpForm() {
  const locale = useLocale();
  const t = useTranslations("signup");
  const { toggleLocale } = useLocaleContext();
  const dir = locale === "ar" ? "rtl" : "ltr";
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    userType: "doctor",
    doctorId: "",
    licenseNumber: "",
    phone: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // جلب الأطباء الحقيقيين من API
  const [doctors, setDoctors] = useState([]);
  const [doctorsLoading, setDoctorsLoading] = useState(false);
  const [doctorsError, setDoctorsError] = useState("");

  useEffect(() => {
    if (form.userType !== "patient") return;
    const fetchDoctors = async () => {
      setDoctorsLoading(true);
      setDoctorsError("");
      try {
        const res = await fetch("/api/admin/doctors");
        const data = await res.json();
        if (data.doctors) {
          // Some API responses include activation on the nested `user` object
          // while others put it on the doctor record. Accept either form.
          setDoctors(
            data.doctors
              .filter((doc) => (
                // allow doctor if either top-level or nested user is active and not deleted
                (doc.isActive === true || doc.status === "active" || (doc.user && doc.user.isActive === true))
                && (doc.isDeleted !== true) && !(doc.user && doc.user.isDeleted === true)
              ))
              .map((doc) => ({
                id: doc.userId || doc.id || (doc.user && doc.user.id) || "",
                name: doc.user?.fullName || doc.fullName || doc.name || "",
                specialty: Array.isArray(doc.specialties) && doc.specialties.length > 0 ? doc.specialties.map(s => s.specialty?.name).join(", ") : "",
                email: doc.user?.email || doc.email || ""
              }))
          );
        } else {
          setDoctors([]);
        }
        setDoctorsLoading(false);
      } catch {
        setDoctorsError(locale === "ar" ? "تعذر تحميل الأطباء" : "Failed to load doctors");
        setDoctorsLoading(false);
      }
    };
    fetchDoctors();
  }, [form.userType, locale]);

  const passwordHints = [
    t("signup.passwordHint1") || "8 أحرف على الأقل",
    t("signup.passwordHint2") || "حرف كبير واحد",
    t("signup.passwordHint3") || "رقم واحد",
    t("signup.passwordHint4") || "رمز خاص"
  ];
  const passwordStrengthLabel = t("signup.passwordStrengthLabel") || (locale === "en" ? "Password strength:" : "قوة كلمة المرور:");
  const haveAccountText = t("signup.haveAccount") || (locale === "en" ? "Already have an account?" : "لديك حساب بالفعل؟");
  const loginText = t("signup.loginCta") || "تسجيل الدخول";

  const passwordChecks = {
    length: form.password.length >= 8,
    uppercase: /[A-Z]/.test(form.password),
    number: /[0-9]/.test(form.password),
    symbol: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(form.password),
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
  };

  const handleUserTypeChange = (type) => {
    setForm({ ...form, userType: type, doctorId: "" });
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // التحقق من الحقول
    if (!form.name.trim() || !form.email.trim() || !form.password || !form.confirmPassword) {
      setError(t("signup.errors.required") || "يرجى تعبئة جميع الحقول المطلوبة");
      return;
    }
    if (form.userType === "doctor" && (!form.licenseNumber.trim() || !form.phone.trim())) {
      setError(locale === "en" ? "License number and phone are required for doctors." : "رقم الترخيص ورقم الجوال للطبيب مطلوبة");
      return;
    }
    if (form.userType === "patient" && !form.doctorId) {
      setError(t("signup.errors.doctorMissing") || "يرجى اختيار الطبيب المعالج");
      return;
    }
    const isPasswordStrong = Object.values(passwordChecks).every(Boolean);
    if (!isPasswordStrong) {
      setError(t("signup.errors.weakPassword") || "كلمة المرور لا تستوفي جميع المتطلبات");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError(t("signup.errors.mismatch") || "كلمتا المرور غير متطابقتين");
      return;
    }
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      let apiUrl, payload;
      if (form.userType === "doctor") {
        apiUrl = "/api/doctor";
        payload = {
          email: form.email,
          password: form.password,
          fullName: form.name,
          licenseNumber: form.licenseNumber,
          phone: form.phone,
        };
      } else {
        // patient API is localized under /[locale]/api/patient
        apiUrl = withLocale(locale, "/api/patient");
        payload = {
          email: form.email,
          password: form.password,
          fullName: form.name,
          role: form.userType,
          doctorId: form.doctorId,
        };
      }
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setLoading(false);
      if (!res.ok) {
        setError(data.error || "حدث خطأ أثناء التسجيل");
        return;
      }
      setSuccess(t("signup.success") || "تم إنشاء الحساب بنجاح! يتم إعادة التوجيه...");
      setTimeout(() => {
        window.location.href = locale === "ar" ? "/ar/login" : "/en/login";
      }, 2000);
    } catch (err) {
      setLoading(false);
      setError("حدث خطأ في الاتصال بالخادم");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" dir={dir} lang={locale}>
      {/* خلفية متدرجة بالوردي والبنفسجي */}
      <div className="fixed inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(/icons/bluesignup.jpg)' }}
        />
      </div>

      {/* الفورم المحصور في المنتصف */}
      <div className="relative z-10 w-full max-w-md">
        <form
          onSubmit={handleSubmit}
          className="w-full glass-morph bg-white/20 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/30 p-8 max-h-[90vh] overflow-y-auto"
        >
          {/* Section 1: Header */}
          <div className="mb-8 flex items-center justify-between gap-2">
            <div className="flex flex-col items-center gap-4 flex-1">
              <div className="inline-block p-4 rounded-full glass-morph bg-white/30 shadow-xl">
                <FaUserPlus className="text-4xl text-white" />
              </div>
              <div className="text-center">
                <h2 className="text-3xl font-bold text-white mb-1">{t("signup.title") || "سجل معنا"}</h2>
                <p className="text-white/90 text-base">{t("signup.subtitle") || "انضم إلى مجتمعنا"}</p>
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
              <span className="text-white/90 text-sm font-medium">{t("signup.socialDivider") || "أو التسجيل بالبريد"}</span>
              <div className="h-px bg-white/30 flex-1"></div>
            </div>
          </div>

          {/* Section 3: Role Selection */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-white mb-4 text-center">{t("signup.roleLabel") || "اختر نوع الحساب"}</label>
            <div className="flex items-center justify-center gap-6">
              <button
                type="button"
                onClick={() => handleUserTypeChange("doctor")}
                className={`group flex items-center justify-center p-0 rounded-full transition-all duration-300 w-16 h-16 ${
                  form.userType === "doctor"
                    ? "ring-4 ring-white/60 scale-110 shadow-xl"
                    : "ring-2 ring-white/30 hover:ring-white/40 hover:scale-105"
                }`}
                title="Doctor"
              >
                <span className="w-14 h-14 flex items-center justify-center rounded-full glass-morph bg-white/30 shadow-md">
                  <FaStethoscope className="text-3xl text-white transition-transform group-hover:rotate-12" />
                </span>
              </button>
              <button
                type="button"
                onClick={() => handleUserTypeChange("patient")}
                className={`group flex items-center justify-center p-0 rounded-full transition-all duration-300 w-16 h-16 ${
                  form.userType === "patient"
                    ? "ring-4 ring-white/60 scale-110 shadow-xl"
                    : "ring-2 ring-white/30 hover:ring-white/40 hover:scale-105"
                }`}
                title="Patient"
              >
                <span className="w-14 h-14 flex items-center justify-center rounded-full glass-morph bg-white/30 shadow-md">
                  <FaBed className="text-3xl text-white transition-transform group-hover:rotate-12" />
                </span>
              </button>
            </div>
          </div>

          {/* Section 4: Form Fields */}
          <div className="space-y-3">
            {/* Name Field */}
            <div>
              <label className="block text-sm font-semibold text-white mb-3">{t("signup.nameLabel") || "الاسم الكامل"} *</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full glass-morph bg-white/30">
                  <FaUser className="text-white text-lg" />
                </span>
                <input
                  type="text"
                  name="name"
                  placeholder={locale === "en" ? "John Doe" : "أحمد محمد"}
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-4 py-4 border-2 border-white/30 rounded-xl glass-morph bg-white/20 text-white placeholder:text-white/60 focus:outline-none focus:border-white/50 focus:ring-4 focus:ring-white/20 transition-all text-base"
                />
              </div>
            </div>
            {/* Doctor License Number & Phone (only for doctors) */}
            {form.userType === "doctor" && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-white mb-3">{locale === "en" ? "Medical License Number" : "رقم الترخيص الطبي"} *</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full glass-morph bg-white/30">
                      <FaStethoscope className="text-white text-lg" />
                    </span>
                    <input
                      type="text"
                      name="licenseNumber"
                      placeholder={locale === "en" ? "e.g. 123456" : "مثال: 123456"}
                      value={form.licenseNumber}
                      onChange={handleChange}
                      required
                      className="w-full pl-12 pr-4 py-4 border-2 border-white/30 rounded-xl glass-morph bg-white/20 text-white placeholder:text-white/60 focus:outline-none focus:border-white/50 focus:ring-4 focus:ring-white/20 transition-all text-base"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-white mb-3">{locale === "en" ? "Phone Number" : "رقم الجوال"} *</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full glass-morph bg-white/30">
                      <FaPhone className="text-white text-lg" />
                    </span>
                    <input
                      type="tel"
                      name="phone"
                      placeholder={locale === "en" ? "+9665xxxxxxx" : "05xxxxxxxx"}
                      value={form.phone}
                      onChange={handleChange}
                      required
                      className="w-full pl-12 pr-4 py-4 border-2 border-white/30 rounded-xl glass-morph bg-white/20 text-white placeholder:text-white/60 focus:outline-none focus:border-white/50 focus:ring-4 focus:ring-white/20 transition-all text-base"
                    />
                  </div>
                </div>
              </>
            )}
            {/* Email Field */}
            <div>
              <label className="block text-sm font-semibold text-white mb-3">{t("signup.emailLabel") || "البريد الإلكتروني"} *</label>
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
            {/* Doctor Selection for Patients */}
            {form.userType === "patient" && (
              <div>
                <label className="block text-sm font-semibold text-white mb-3">{t("signup.doctorPickerLabel") || "الطبيب المعالج"} *</label>
                {doctorsLoading ? (
                  <div className="text-white">{locale === "ar" ? "جاري تحميل الأطباء..." : "Loading doctors..."}</div>
                ) : doctorsError ? (
                  <div className="text-red-400">{doctorsError}</div>
                ) : (
                  <select
                    name="doctorId"
                    value={form.doctorId}
                    onChange={handleChange}
                    className="w-full px-4 py-4 border-2 border-white/30 rounded-xl glass-morph bg-white/20 text-white focus:outline-none focus:border-white/50 focus:ring-4 focus:ring-white/20 transition-all text-base"
                  >
                    <option value="" className="text-gray-800">{t("signup.doctorPlaceholder") || "اختر الطبيب المعالج"}</option>
                    {doctors.map((doc) => (
                      <option key={doc.id} value={doc.id} className="text-gray-800">
                        {doc.name}{doc.specialty ? ` - ${doc.specialty}` : ""}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}
            {/* Password Field */}
            <div>
              <label className="block text-sm font-semibold text-white mb-3">{t("signup.passwordLabel") || "كلمة المرور"} *</label>
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
                  className="w-full pl-12 pr-24 py-4 border-2 border-white/30 rounded-xl glass-morph bg-white/20 text-white placeholder:text-white/60 focus:outline-none focus:border-white/50 focus:ring-4 focus:ring-white/20 transition-all text-base"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-yellow-300 hover:text-yellow-200 transition-colors"
                  title={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                >
                  {showPassword ? <FaEyeSlash className="text-xl" /> : <FaEye className="text-xl" />}
                </button>
              </div>
            </div>
            {/* Confirm Password Field */}
            <div>
              <label className="block text-sm font-semibold text-white mb-3">{t("signup.confirmPasswordLabel") || "تأكيد كلمة المرور"} *</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full glass-morph bg-white/30">
                  <FaLock className="text-white text-lg" />
                </span>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="••••••••"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-4 py-4 border-2 border-white/30 rounded-xl glass-morph bg-white/20 text-white placeholder:text-white/60 focus:outline-none focus:border-white/50 focus:ring-4 focus:ring-white/20 transition-all text-base"
                />
              </div>
            </div>
            {/* شريط قوة كلمة المرور مع emoji */}
            {form.password && (
              <div className="bg-white/20 backdrop-blur rounded-xl p-4 space-y-3 border-2 border-white/30">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-white">{passwordStrengthLabel}</p>
                  <span className="text-lg">
                    {(() => {
                      const checks = [passwordChecks.length, passwordChecks.uppercase, passwordChecks.number, passwordChecks.symbol].filter(Boolean).length;
                      if (checks <= 1) return "😞";
                      if (checks === 2) return "😐";
                      if (checks === 3) return "🙂";
                      return "😍";
                    })()}
                  </span>
                </div>
                <div className="w-full h-3 bg-white/30 rounded-full overflow-hidden">
                  <div
                    style={{
                      width: `${[passwordChecks.length, passwordChecks.uppercase, passwordChecks.number, passwordChecks.symbol].filter(Boolean).length * 25}%`,
                      backgroundColor: (() => {
                        const checks = [passwordChecks.length, passwordChecks.uppercase, passwordChecks.number, passwordChecks.symbol].filter(Boolean).length;
                        if (checks <= 1) return "#ef4444";
                        if (checks === 2) return "#eab308";
                        if (checks === 3) return "#f59e0b";
                        return "#22c55e";
                      })()
                    }}
                    className="h-3 rounded-full transition-all duration-300"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className={passwordChecks.length ? "text-emerald-300 font-bold" : "text-white/60"}>
                    {passwordChecks.length ? "✔" : "✗"} {passwordHints[0] || "8 أحرف"}
                  </span>
                  <span className={passwordChecks.uppercase ? "text-emerald-300 font-bold" : "text-white/60"}>
                    {passwordChecks.uppercase ? "✔" : "✗"} {passwordHints[1] || "حرف كبير"}
                  </span>
                  <span className={passwordChecks.number ? "text-emerald-300 font-bold" : "text-white/60"}>
                    {passwordChecks.number ? "✔" : "✗"} {passwordHints[2] || "رقم"}
                  </span>
                  <span className={passwordChecks.symbol ? "text-emerald-300 font-bold" : "text-white/60"}>
                    {passwordChecks.symbol ? "✔" : "✗"} {passwordHints[3] || "رمز خاص"}
                  </span>
                </div>
              </div>
            )}
          </div>
          {/* Section 5: Messages & Submit Button */}
          <div className="border-t border-white/20 pt-6 space-y-4 mt-6">
            {/* رسائل الأخطاء والنجاح */}
            {error && (
              <div className="w-full bg-red-500/20 backdrop-blur border-2 border-red-400/50 rounded-xl p-3 text-white text-sm text-center font-medium">
                {error}
              </div>
            )}
            {success && (
              <div className="w-full bg-green-500/20 backdrop-blur border-2 border-green-400/50 rounded-xl p-3 text-white text-sm flex items-center justify-center gap-2 font-medium">
                <FaCheck className="text-base shrink-0" />
                <span>{success}</span>
              </div>
            )}
            {/* زر الإنشاء */}
            <button
              type="submit"
              disabled={loading || !Object.values(passwordChecks).every(Boolean)}
              className="w-full px-8 py-4 rounded-xl glass-morph bg-white/20 text-white font-bold text-lg shadow-xl transition-all hover:shadow-2xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3 border-2 border-white/30"
            >
              {loading ? (
                <>
                  <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {t("signup.loading") || "جاري الإنشاء..."}
                </>
              ) : (
                <>
                  <FaUserPlus className="text-xl" />
                  {t("signup.submit") || "إنشاء حساب جديد"}
                </>
              )}
            </button>
            {/* رابط تسجيل الدخول */}
            <div className="text-center text-white/80 text-base">
              {haveAccountText}{" "}
              <Link href={withLocale(locale, "/login")} className="text-white hover:text-yellow-200 font-bold transition-colors underline">
                {loginText}
              </Link>
            </div>
            {/* روابط الخصوصية والشروط */}
            <div className="text-center text-white/80 text-sm mt-4">
              <p>
                {t("signup.termsAgreement") || "أوافق على"} {" "}
                <Link href={withLocale(locale, "/privacy")} className="text-yellow-200 hover:text-yellow-100 font-bold transition-colors underline">
                  {t("signup.privacyPolicy") || "سياسة الخصوصية"}
                </Link>
                {" "}{t("signup.and") || "و"}{" "}
                <Link href={withLocale(locale, "/terms")} className="text-yellow-200 hover:text-yellow-100 font-bold transition-colors underline">
                  {t("signup.termsConditions") || "شروط الاستخدام"}
                </Link>
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SignUpForm;