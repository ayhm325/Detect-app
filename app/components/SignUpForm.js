"use client";

import { FaUser, FaEnvelope, FaLock, FaUserPlus, FaCheck, FaStethoscope, FaBed, FaGoogle, FaFacebook } from "react-icons/fa6";
import { useState } from "react";

export default function SignUpForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    userType: "doctor",
    doctorId: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // تحقق شروط كلمة المرور
  const passwordChecks = {
    length: form.password.length >= 8,
    uppercase: /[A-Z]/.test(form.password),
    number: /[0-9]/.test(form.password),
    symbol: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(form.password),
  };

  const isPasswordStrong = Object.values(passwordChecks).every(Boolean);

  // بيانات أطباء وهمية
  const doctors = [
    { id: "1", name: "د. أحمد علي", specialty: "أمراض الصدرية", rating: 4.8 },
    { id: "2", name: "د. سارة يوسف", specialty: "الرئة والجهاز التنفسي", rating: 4.5 },
    { id: "3", name: "د. خالد منصور", specialty: "الطب الباطني", rating: 4.2 },
  ];

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

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // التحقق من الحقول
    if (!form.name.trim() || !form.email.trim() || !form.password || !form.confirmPassword) {
      setError("يرجى تعبئة جميع الحقول المطلوبة");
      return;
    }

    if (form.userType === "patient" && !form.doctorId) {
      setError("يرجى اختيار الطبيب المعالج");
      return;
    }

    if (!isPasswordStrong) {
      setError("كلمة المرور لا تستوفي جميع المتطلبات");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("كلمتا المرور غير متطابقتين");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess("تم إنشاء الحساب بنجاح! يتم إعادة التوجيه...");
      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
    }, 1500);
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-y-auto">
      {/* خلفية متحركة */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute left-1/2 top-1/4 w-96 h-96 bg-yellow-400 opacity-5 rounded-full blur-3xl" />
        <div className="absolute right-1/4 bottom-1/4 w-96 h-96 bg-red-500 opacity-5 rounded-full blur-3xl" />
      </div>

      <form
        onSubmit={handleSubmit}
        className="relative z-10 flex flex-col w-full h-full max-w-none bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl backdrop-blur-xl border border-yellow-400/20 dark:border-yellow-400/10 p-8"
      >
        {/* Section 1: Header */}
        <div className="mb-8 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="inline-block p-4 bg-linear-to-br from-yellow-400 to-red-600 rounded-full shadow-xl">
              <FaUserPlus className="text-4xl text-white" />
            </div>
            <div className="text-center">
              <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-1">إنشاء حساب جديد</h2>
              <p className="text-zinc-600 dark:text-gray-400 text-base">انضم لمنصتنا الطبية المتقدمة</p>
            </div>
          </div>
        </div>

        {/* Section 2: Social Login */}
        <div className="mb-6 pb-6 border-b border-yellow-400/10">
          <div className="flex items-center justify-center gap-4">
            <button type="button" className="flex-1 max-w-[160px] h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-all hover:scale-105 ring-2 ring-blue-400/30 flex items-center justify-center gap-2 font-medium" title="Facebook">
              <FaFacebook className="text-xl" />
              <span className="text-sm">Facebook</span>
            </button>
            <button type="button" className="flex-1 max-w-[160px] h-12 rounded-xl bg-red-500 hover:bg-red-600 text-white shadow-lg transition-all hover:scale-105 ring-2 ring-red-400/30 flex items-center justify-center gap-2 font-medium" title="Google">
              <FaGoogle className="text-xl" />
              <span className="text-sm">Google</span>
            </button>
          </div>
          <div className="flex items-center justify-center gap-3 mt-4">
            <div className="h-px bg-zinc-300 dark:bg-zinc-700 flex-1"></div>
            <span className="text-zinc-600 dark:text-gray-400 text-sm font-medium">أو التسجيل بالبريد</span>
            <div className="h-px bg-zinc-300 dark:bg-zinc-700 flex-1"></div>
          </div>
        </div>

        {/* Section 3: Role Selection */}
        <div className="mb-8">
          <label className="block text-sm font-semibold text-zinc-900 dark:text-white mb-4 text-center">اختر نوع الحساب</label>
          <div className="flex items-center justify-center gap-6">
            <button
              type="button"
              onClick={() => handleUserTypeChange("doctor")}
              className={`group flex items-center gap-4 px-8 py-4 rounded-2xl transition-all duration-300 min-w-[160px] ${
                form.userType === "doctor"
                  ? "bg-linear-to-br from-yellow-400 to-red-600 text-white shadow-xl shadow-yellow-500/30 ring-4 ring-yellow-400/30 scale-105"
                  : "bg-zinc-100 dark:bg-zinc-800 text-yellow-600 dark:text-yellow-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 border-2 border-zinc-300 dark:border-zinc-600 hover:border-yellow-400 hover:scale-105"
              }`}
              title="Doctor"
            >
              <FaStethoscope className="text-4xl transition-transform group-hover:rotate-12" />
              <span className="text-lg font-bold">طبيب</span>
            </button>
            
            <button
              type="button"
              onClick={() => handleUserTypeChange("patient")}
              className={`group flex items-center gap-4 px-8 py-4 rounded-2xl transition-all duration-300 min-w-[160px] ${
                form.userType === "patient"
                  ? "bg-linear-to-br from-yellow-400 to-red-600 text-white shadow-xl shadow-red-500/30 ring-4 ring-red-400/30 scale-105"
                  : "bg-zinc-100 dark:bg-zinc-800 text-red-600 dark:text-red-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 border-2 border-zinc-300 dark:border-zinc-600 hover:border-red-400 hover:scale-105"
              }`}
              title="Patient"
            >
              <FaBed className="text-4xl transition-transform group-hover:rotate-12" />
              <span className="text-lg font-bold">مريض</span>
            </button>
          </div>
        </div>

        {/* Section 4: Form Fields (55% height) - Scrollable */}
        <div className="h-[55%] px-6 py-4 overflow-y-auto space-y-3">
          {/* Name Field */}
          <div>
            <label className="block text-sm font-semibold text-zinc-900 dark:text-white mb-3">الاسم الكامل *</label>
            <div className="relative">
              <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-yellow-600 dark:text-yellow-400 text-lg" />
              <input
                type="text"
                name="name"
                placeholder="أحمد محمد"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full pl-12 pr-4 py-4 border-2 border-yellow-400/30 dark:border-yellow-400/20 rounded-xl bg-white dark:bg-zinc-800/50 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-yellow-500 dark:focus:border-yellow-400 focus:ring-4 focus:ring-yellow-400/20 transition-all text-base"
              />
            </div>
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-sm font-semibold text-zinc-900 dark:text-white mb-3">البريد الإلكتروني *</label>
            <div className="relative">
              <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-red-600 dark:text-red-400 text-lg" />
              <input
                type="email"
                name="email"
                placeholder="example@email.com"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full pl-12 pr-4 py-4 border-2 border-red-400/30 dark:border-red-400/20 rounded-xl bg-white dark:bg-zinc-800/50 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-red-500 dark:focus:border-red-400 focus:ring-4 focus:ring-red-400/20 transition-all text-base"
              />
            </div>
          </div>

          {/* Doctor Selection for Patients */}
          {form.userType === "patient" && (
            <div>
              <label className="block text-sm font-semibold text-zinc-900 dark:text-white mb-3">الطبيب المعالج *</label>
              <select
                name="doctorId"
                value={form.doctorId}
                onChange={handleChange}
                className="w-full px-4 py-4 border-2 border-amber-400/30 dark:border-amber-400/20 rounded-xl bg-white dark:bg-zinc-800/50 text-zinc-900 dark:text-white focus:outline-none focus:border-amber-500 dark:focus:border-amber-400 focus:ring-4 focus:ring-amber-400/20 transition-all text-base"
              >
                <option value="">اختر الطبيب المعالج</option>
                {doctors.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.name} - {doc.specialty}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Password Field */}
          <div>
            <label className="block text-sm font-semibold text-zinc-900 dark:text-white mb-3">كلمة المرور *</label>
            <div className="relative">
              <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-yellow-600 dark:text-yellow-400 text-lg" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                required
                className="w-full pl-12 pr-24 py-4 border-2 border-yellow-400/30 dark:border-yellow-400/20 rounded-xl bg-white dark:bg-zinc-800/50 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-yellow-500 dark:focus:border-yellow-400 focus:ring-4 focus:ring-yellow-400/20 transition-all text-base"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-yellow-600 dark:text-yellow-400 hover:text-yellow-700 dark:hover:text-yellow-300 transition-colors text-sm font-medium px-2"
              >
                {showPassword ? "إخفاء" : "إظهار"}
              </button>
            </div>
          </div>

          {/* Confirm Password Field */}
          <div>
            <label className="block text-sm font-semibold text-zinc-900 dark:text-white mb-3">تأكيد كلمة المرور *</label>
            <div className="relative">
              <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-red-600 dark:text-red-400 text-lg" />
              <input
                type="password"
                name="confirmPassword"
                placeholder="••••••••"
                value={form.confirmPassword}
                onChange={handleChange}
                required
                className="w-full pl-12 pr-4 py-4 border-2 border-red-400/30 dark:border-red-400/20 rounded-xl bg-white dark:bg-zinc-800/50 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-red-500 dark:focus:border-red-400 focus:ring-4 focus:ring-red-400/20 transition-all text-base"
              />
            </div>
          </div>

          {/* شريط قوة كلمة المرور مع emoji */}
          {form.password && (
            <div className="bg-zinc-100 dark:bg-zinc-800/50 rounded-xl p-4 space-y-3 border-2 border-zinc-300 dark:border-zinc-700">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-zinc-900 dark:text-white">قوة كلمة المرور:</p>
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
              <div className="w-full h-3 bg-zinc-300 dark:bg-zinc-700 rounded-full overflow-hidden">
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
                <span className={passwordChecks.length ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-zinc-500 dark:text-gray-500"}>
                  {passwordChecks.length ? "✔" : "✗"} 8 أحرف
                </span>
                <span className={passwordChecks.uppercase ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-zinc-500 dark:text-gray-500"}>
                  {passwordChecks.uppercase ? "✔" : "✗"} حرف كبير
                </span>
                <span className={passwordChecks.number ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-zinc-500 dark:text-gray-500"}>
                  {passwordChecks.number ? "✔" : "✗"} رقم
                </span>
                <span className={passwordChecks.symbol ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-zinc-500 dark:text-gray-500"}>
                  {passwordChecks.symbol ? "✔" : "✗"} رمز خاص
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Section 5: Messages & Submit Button */}
        <div className="border-t border-yellow-400/10 pt-6 space-y-4">
          {/* رسائل الأخطاء والنجاح */}
          {error && (
            <div className="w-full bg-red-50 dark:bg-red-900/30 border-2 border-red-300 dark:border-red-500/50 rounded-xl p-3 text-red-700 dark:text-red-300 text-sm text-center font-medium">
              {error}
            </div>
          )}
          {success && (
            <div className="w-full bg-emerald-50 dark:bg-emerald-900/30 border-2 border-emerald-300 dark:border-emerald-500/50 rounded-xl p-3 text-emerald-700 dark:text-emerald-300 text-sm flex items-center justify-center gap-2 font-medium">
              <FaCheck className="text-base shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* زر الإنشاء */}
          <button
            type="submit"
            disabled={loading || !isPasswordStrong}
            className="w-full px-8 py-4 rounded-xl bg-linear-to-r from-yellow-400 to-red-600 hover:from-yellow-500 hover:to-red-700 text-white font-bold text-lg shadow-xl transition-all hover:shadow-2xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3"
          >
            {loading ? (
              <>
                <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                جاري الإنشاء...
              </>
            ) : (
              <>
                <FaUserPlus className="text-xl" />
                إنشاء حساب جديد
              </>
            )}
          </button>

          {/* رابط تسجيل الدخول */}
          <div className="text-center text-zinc-600 dark:text-gray-400 text-base">
            لديك حساب بالفعل؟{" "}
            <a href="/login" className="text-yellow-600 dark:text-yellow-400 hover:text-red-600 dark:hover:text-red-400 font-bold transition-colors underline">
              تسجيل الدخول
            </a>
          </div>
        </div>
      </form>
    </div>
  );
}
