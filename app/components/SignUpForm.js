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
        const apiPath = `/api/doctor/list${process.env.NEXT_PUBLIC_DEBUG_INCLUDE_PENDING === 'true' ? '?includePending=true' : ''}`;
        const res = await fetch(apiPath);
        const data = await res.json();
        if (data.doctors) {
          setDoctors(
            data.doctors.map((doc) => ({
              id: doc.id,
              name: doc.fullName || doc.name || doc.email || doc.id,
              specialty: doc.specialty || "",
              email: doc.email || ""
            }))
          );
        } else {
          setDoctors([]);
        }
        setDoctorsLoading(false);
      } catch {
        setDoctorsError(t("signup.errors.loadDoctorsFailed"));
        setDoctorsLoading(false);
      }
    };
    fetchDoctors();
  }, [form.userType, locale, t]);

  const passwordHints = [
    t("signup.passwordHint1"),
    t("signup.passwordHint2"),
    t("signup.passwordHint3"),
    t("signup.passwordHint4")
  ];
  const passwordStrengthLabel = t("signup.passwordStrengthLabel");
  const haveAccountText = t("signup.haveAccount");
  const loginText = t("signup.loginCta");

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
      setError(t("signup.errors.required"));
      return;
    }
    if (form.userType === "doctor" && (!form.licenseNumber.trim() || !form.phone.trim())) {
      setError(t("signup.errors.doctorLicensePhoneRequired"));
      return;
    }
    if (form.userType === "patient" && !form.doctorId) {
      setError(t("signup.errors.doctorMissing"));
      return;
    }
    const isPasswordStrong = Object.values(passwordChecks).every(Boolean);
    if (!isPasswordStrong) {
      setError(t("signup.errors.weakPassword"));
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError(t("signup.errors.mismatch"));
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
        setError(data.error || t("signup.errors.registrationFailed"));
        return;
      }
      setSuccess(t("signup.success"));
      setTimeout(() => {
        window.location.href = withLocale(locale, "/login");
      }, 2000);
    } catch (err) {
      setLoading(false);
      setError(t("signup.errors.serverConnection"));
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
          className="w-full glass-morph bg-background/15 backdrop-blur-lg rounded-3xl shadow-2xl border border-(--ui-border) p-8 max-h-[90vh] overflow-y-auto"
        >
          {/* Section 1: Header */}
          <div className="mb-8 flex items-center justify-between gap-2">
            <div className="flex flex-col items-center gap-4 flex-1">
              <div className="inline-block p-4 rounded-full glass-morph bg-background/20 shadow-xl">
                <FaUserPlus className="text-4xl text-white" />
              </div>
              <div className="text-center">
                <h2 className="text-3xl font-bold text-white mb-1">{t("signup.title")}</h2>
                <p className="text-white/90 text-base">{t("signup.subtitle")}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href={locale === "en" ? "/en" : "/ar"}
                className="w-10 h-10 flex items-center justify-center rounded-full glass-morph bg-background/20 text-white hover:bg-background/25 shadow-md border border-(--ui-border) transition-all focus:outline-none focus:ring-2 focus:ring-(--ui-ring)/40"
                title={t("ui.backHomeTitle")}
                aria-label={t("ui.backHomeTitle")}
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
                className="flex items-center gap-2 px-3 py-2 rounded-full glass-morph bg-background/20 text-white hover:bg-background/25 transition-colors font-medium text-sm"
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
              <div className="h-px bg-(--ui-border) flex-1"></div>
              <span className="text-white/90 text-sm font-medium">{t("signup.socialDivider")}</span>
              <div className="h-px bg-(--ui-border) flex-1"></div>
            </div>
          </div>

          {/* Section 3: Role Selection */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-white mb-4 text-center">{t("signup.roleLabel")}</label>
            <div className="flex items-center justify-center gap-6">
              <button
                type="button"
                onClick={() => handleUserTypeChange("doctor")}
                className={`group flex items-center justify-center p-0 rounded-full transition-all duration-300 w-16 h-16 ${
                  form.userType === "doctor"
                    ? "ring-4 ring-(--ui-ring)/60 scale-110 shadow-xl"
                    : "ring-2 ring-(--ui-border) hover:ring-(--ui-ring)/40 hover:scale-105"
                }`}
                title={t("signup.doctorRole")}
              >
                <span className="w-14 h-14 flex items-center justify-center rounded-full glass-morph bg-background/20 shadow-md">
                  <FaStethoscope className="text-3xl text-white transition-transform group-hover:rotate-12" />
                </span>
              </button>
              <button
                type="button"
                onClick={() => handleUserTypeChange("patient")}
                className={`group flex items-center justify-center p-0 rounded-full transition-all duration-300 w-16 h-16 ${
                  form.userType === "patient"
                    ? "ring-4 ring-(--ui-ring)/60 scale-110 shadow-xl"
                    : "ring-2 ring-(--ui-border) hover:ring-(--ui-ring)/40 hover:scale-105"
                }`}
                title={t("signup.patientRole")}
              >
                <span className="w-14 h-14 flex items-center justify-center rounded-full glass-morph bg-background/20 shadow-md">
                  <FaBed className="text-3xl text-white transition-transform group-hover:rotate-12" />
                </span>
              </button>
            </div>
          </div>

          {/* Section 4: Form Fields */}
          <div className="space-y-3">
            {/* Name Field */}
            <div>
              <label className="block text-sm font-semibold text-white mb-3">{t("signup.nameLabel")} *</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full glass-morph bg-background/20">
                  <FaUser className="text-white text-lg" />
                </span>
                <input
                  type="text"
                  name="name"
                  placeholder={t("signup.namePlaceholder")}
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-4 py-4 border-2 border-(--ui-border) rounded-xl glass-morph bg-background/15 text-white placeholder:text-white/60 focus:outline-none focus:border-(--ui-ring) focus:ring-4 focus:ring-(--ui-ring)/20 transition-all text-base"
                />
              </div>
            </div>
            {/* Doctor License Number & Phone (only for doctors) */}
            {form.userType === "doctor" && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-white mb-3">{t("signup.licenseNumberLabel")} *</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full glass-morph bg-background/20">
                      <FaStethoscope className="text-white text-lg" />
                    </span>
                    <input
                      type="text"
                      name="licenseNumber"
                      placeholder={t("signup.licenseNumberPlaceholder")}
                      value={form.licenseNumber}
                      onChange={handleChange}
                      required
                      className="w-full pl-12 pr-4 py-4 border-2 border-(--ui-border) rounded-xl glass-morph bg-background/15 text-white placeholder:text-white/60 focus:outline-none focus:border-(--ui-ring) focus:ring-4 focus:ring-(--ui-ring)/20 transition-all text-base"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-white mb-3">{t("signup.phoneLabel")} *</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full glass-morph bg-background/20">
                      <FaPhone className="text-white text-lg" />
                    </span>
                    <input
                      type="tel"
                      name="phone"
                      placeholder={t("signup.phonePlaceholder")}
                      value={form.phone}
                      onChange={handleChange}
                      required
                      className="w-full pl-12 pr-4 py-4 border-2 border-(--ui-border) rounded-xl glass-morph bg-background/15 text-white placeholder:text-white/60 focus:outline-none focus:border-(--ui-ring) focus:ring-4 focus:ring-(--ui-ring)/20 transition-all text-base"
                    />
                  </div>
                </div>
              </>
            )}
            {/* Email Field */}
            <div>
              <label className="block text-sm font-semibold text-white mb-3">{t("signup.emailLabel")} *</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full glass-morph bg-background/20">
                  <FaEnvelope className="text-white text-lg" />
                </span>
                <input
                  type="email"
                  name="email"
                  placeholder={t("signup.emailPlaceholder")}
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-4 py-4 border-2 border-(--ui-border) rounded-xl glass-morph bg-background/15 text-white placeholder:text-white/60 focus:outline-none focus:border-(--ui-ring) focus:ring-4 focus:ring-(--ui-ring)/20 transition-all text-base"
                />
              </div>
            </div>
            {/* Doctor Selection for Patients */}
            {form.userType === "patient" && (
              <div>
                <label className="block text-sm font-semibold text-white mb-3">{t("signup.doctorPickerLabel")} *</label>
                {doctorsLoading ? (
                  <div className="text-white">{t("signup.doctorsLoading")}</div>
                ) : doctorsError ? (
                  <div className="text-(--ui-danger)">{doctorsError}</div>
                ) : (
                  <select
                    name="doctorId"
                    value={form.doctorId}
                    onChange={handleChange}
                    className="w-full px-4 py-4 border-2 border-(--ui-border) rounded-xl glass-morph bg-background/15 text-white focus:outline-none focus:border-(--ui-ring) focus:ring-4 focus:ring-(--ui-ring)/20 transition-all text-base"
                  >
                    <option value="" className="text-(--ui-foreground)">{t("signup.doctorPlaceholder")}</option>
                    {doctors.map((doc) => (
                      <option key={doc.id} value={doc.id} className="text-(--ui-foreground)">
                        {doc.name}{doc.specialty ? ` - ${doc.specialty}` : ""}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}
            {/* Password Field */}
            <div>
              <label className="block text-sm font-semibold text-white mb-3">{t("signup.passwordLabel")} *</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full glass-morph bg-background/20">
                  <FaLock className="text-white text-lg" />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-24 py-4 border-2 border-(--ui-border) rounded-xl glass-morph bg-background/15 text-white placeholder:text-white/60 focus:outline-none focus:border-(--ui-ring) focus:ring-4 focus:ring-(--ui-ring)/20 transition-all text-base"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-(--ui-ring) hover:text-white transition-colors"
                  title={showPassword ? t("signup.passwordHide") : t("signup.passwordShow")}
                >
                  {showPassword ? <FaEyeSlash className="text-xl" /> : <FaEye className="text-xl" />}
                </button>
              </div>
            </div>
            {/* Confirm Password Field */}
            <div>
              <label className="block text-sm font-semibold text-white mb-3">{t("signup.confirmPasswordLabel")} *</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full glass-morph bg-background/20">
                  <FaLock className="text-white text-lg" />
                </span>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="••••••••"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-4 py-4 border-2 border-(--ui-border) rounded-xl glass-morph bg-background/15 text-white placeholder:text-white/60 focus:outline-none focus:border-(--ui-ring) focus:ring-4 focus:ring-(--ui-ring)/20 transition-all text-base"
                />
              </div>
            </div>
            {/* شريط قوة كلمة المرور مع emoji */}
            {form.password && (
              <div className="bg-background/15 backdrop-blur rounded-xl p-4 space-y-3 border-2 border-(--ui-border)">
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
                <div className="w-full h-3 bg-(--ui-surface-2) rounded-full overflow-hidden">
                  <div
                    style={{
                      width: `${[passwordChecks.length, passwordChecks.uppercase, passwordChecks.number, passwordChecks.symbol].filter(Boolean).length * 25}%`,
                      backgroundColor: (() => {
                        const checks = [passwordChecks.length, passwordChecks.uppercase, passwordChecks.number, passwordChecks.symbol].filter(Boolean).length;
                        if (checks <= 1) return "var(--ui-danger)";
                        if (checks <= 3) return "var(--ui-warning)";
                        return "var(--ui-success)";
                      })()
                    }}
                    className="h-3 rounded-full transition-all duration-300"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className={passwordChecks.length ? "text-(--ui-success) font-bold" : "text-white/60"}>
                    {passwordChecks.length ? "✔" : "✗"} {passwordHints[0]}
                  </span>
                  <span className={passwordChecks.uppercase ? "text-(--ui-success) font-bold" : "text-white/60"}>
                    {passwordChecks.uppercase ? "✔" : "✗"} {passwordHints[1]}
                  </span>
                  <span className={passwordChecks.number ? "text-(--ui-success) font-bold" : "text-white/60"}>
                    {passwordChecks.number ? "✔" : "✗"} {passwordHints[2]}
                  </span>
                  <span className={passwordChecks.symbol ? "text-(--ui-success) font-bold" : "text-white/60"}>
                    {passwordChecks.symbol ? "✔" : "✗"} {passwordHints[3]}
                  </span>
                </div>
              </div>
            )}
          </div>
          {/* Section 5: Messages & Submit Button */}
          <div className="border-t border-(--color-neutral)/20 pt-6 space-y-4 mt-6">
            {/* رسائل الأخطاء والنجاح */}
            {error && (
              <div className="w-full bg-(--ui-danger-bg) backdrop-blur border-2 border-(--ui-danger-border) rounded-xl p-3 text-white text-sm text-center font-medium">
                {error}
              </div>
            )}
            {success && (
              <div className="w-full bg-(--ui-success-bg) backdrop-blur border-2 border-(--ui-success-border) rounded-xl p-3 text-white text-sm flex items-center justify-center gap-2 font-medium">
                <FaCheck className="text-base shrink-0" />
                <span>{success}</span>
              </div>
            )}
            {/* زر الإنشاء */}
            <button
              type="submit"
              disabled={loading || !Object.values(passwordChecks).every(Boolean)}
              className="w-full px-8 py-4 rounded-xl btn-gradient text-white font-bold text-lg shadow-xl transition-all hover:shadow-2xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <span className="inline-block w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  {t("signup.loading")}
                </>
              ) : (
                <>
                  <FaUserPlus className="text-xl" />
                  {t("signup.submit")}
                </>
              )}
            </button>
            {/* رابط تسجيل الدخول */}
            <div className="text-center text-white/80 text-base">
              {haveAccountText}{" "}
              <Link href={withLocale(locale, "/login")} className="text-white hover:text-(--ui-ring) font-bold transition-colors underline">
                {loginText}
              </Link>
            </div>
            {/* روابط الخصوصية والشروط */}
            <div className="text-center text-white/80 text-sm mt-4">
              <p>
                {t("signup.termsAgreement")} {" "}
                <Link href={withLocale(locale, "/privacy")} className="text-(--ui-info) hover:text-white font-bold transition-colors underline">
                  {t("signup.privacyPolicy")}
                </Link>
                {" "}{t("signup.and")}{" "}
                <Link href={withLocale(locale, "/terms")} className="text-(--ui-info) hover:text-white font-bold transition-colors underline">
                  {t("signup.termsConditions")}
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