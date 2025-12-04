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
        <div className="absolute left-1/2 top-1/4 w-96 h-96 bg-cyan-500 opacity-5 rounded-full blur-3xl" />
        <div className="absolute right-1/4 bottom-1/4 w-96 h-96 bg-purple-500 opacity-5 rounded-full blur-3xl" />
      </div>

      <form
        onSubmit={handleSubmit}
        className="relative z-10 flex flex-col w-full h-full max-w-none bg-linear-to-br from-slate-900 via-slate-800 to-black bg-opacity-95 shadow-2xl backdrop-blur-xl border border-cyan-400/20"
      >
        {/* Section 1: Header (10% height) */}
        <div className="h-[10%] px-6 border-b border-cyan-400/10 flex items-center justify-center shrink-0">
          <div className="flex items-center justify-center gap-3">
            <div className="inline-block p-3 bg-linear-to-br from-cyan-500 to-blue-600 rounded-full shadow-lg">
              <FaUserPlus className="text-3xl text-white" />
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white">إنشاء حساب</h2>
              <p className="text-gray-400 text-sm">انضم لمنصتنا الطبية</p>
            </div>
          </div>
        </div>

        {/* Section 2: Social Login (8% height) */}
        <div className="h-[8%] px-6 flex items-center justify-center gap-3 border-b border-cyan-400/10 shrink-0">
          <button type="button" className="h-12 w-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-all hover:scale-110 ring-2 ring-blue-400/30 flex items-center justify-center" title="Facebook">
            <FaFacebook className="text-xl" />
          </button>
          <span className="text-gray-400 text-sm">أو</span>
          <button type="button" className="h-12 w-12 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg transition-all hover:scale-110 ring-2 ring-red-400/30 flex items-center justify-center" title="Google">
            <FaGoogle className="text-xl" />
          </button>
        </div>

        {/* Section 3: Role Selection (12% height) */}
        <div className="h-[12%] px-6 flex items-center justify-center gap-6 border-b border-cyan-400/10 shrink-0">
          <button
            type="button"
            onClick={() => handleUserTypeChange("doctor")}
            className={`w-16 h-16 rounded-full transition-all duration-300 flex items-center justify-center shrink-0 ${
              form.userType === "doctor"
                ? "bg-linear-to-br from-cyan-400 to-blue-600 text-white shadow-lg shadow-cyan-500/50 ring-2 ring-cyan-400/50 scale-110"
                : "bg-slate-700/40 text-cyan-400 hover:text-cyan-300 border border-slate-600/50 hover:border-cyan-400/50"
            }`}
            title="Doctor"
          >
            <FaStethoscope className="text-3xl" />
          </button>
          
          <button
            type="button"
            onClick={() => handleUserTypeChange("patient")}
            className={`w-16 h-16 rounded-full transition-all duration-300 flex items-center justify-center shrink-0 ${
              form.userType === "patient"
                ? "bg-linear-to-br from-pink-400 to-rose-600 text-white shadow-lg shadow-pink-500/50 ring-2 ring-pink-400/50 scale-110"
                : "bg-slate-700/40 text-pink-400 hover:text-pink-300 border border-slate-600/50 hover:border-pink-400/50"
            }`}
            title="Patient"
          >
            <FaBed className="text-3xl" />
          </button>
        </div>

        {/* Section 4: Form Fields (55% height) - Scrollable */}
        <div className="h-[55%] px-6 py-4 overflow-y-auto space-y-3">
          {/* Name Field */}
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-2">الاسم الكامل *</label>
            <div className="relative">
              <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400 text-sm" />
              <input
                type="text"
                name="name"
                placeholder="أحمد محمد"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-3 border-2 border-cyan-400/30 rounded-lg bg-slate-800/50 text-white placeholder:text-gray-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all text-sm"
              />
            </div>
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-2">البريد الإلكتروني *</label>
            <div className="relative">
              <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400 text-sm" />
              <input
                type="email"
                name="email"
                placeholder="example@email.com"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-3 border-2 border-blue-400/30 rounded-lg bg-slate-800/50 text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all text-sm"
              />
            </div>
          </div>

          {/* Doctor Selection for Patients */}
          {form.userType === "patient" && (
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-2">الطبيب المعالج *</label>
              <select
                name="doctorId"
                value={form.doctorId}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-purple-400/30 rounded-lg bg-slate-800/50 text-white focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all text-sm"
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
            <label className="block text-xs font-medium text-gray-300 mb-2">كلمة المرور *</label>
            <div className="relative">
              <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400 text-sm" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-10 py-3 border-2 border-purple-400/30 rounded-lg bg-slate-800/50 text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-400 hover:text-purple-300 transition-colors text-xs"
              >
                {showPassword ? "إخفاء" : "اظهار"}
              </button>
            </div>
          </div>

          {/* Confirm Password Field */}
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-2">تأكيد كلمة المرور *</label>
            <div className="relative">
              <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-400 text-sm" />
              <input
                type="password"
                name="confirmPassword"
                placeholder="••••••••"
                value={form.confirmPassword}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-3 border-2 border-pink-400/30 rounded-lg bg-slate-800/50 text-white placeholder:text-gray-500 focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-400/20 transition-all text-sm"
              />
            </div>
          </div>

          {/* شريط قوة كلمة المرور مع emoji */}
          {form.password && (
            <div className="bg-slate-800/50 rounded-lg p-2 space-y-2 border border-gray-700">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-gray-300">قوة كلمة المرور:</p>
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
              <div className="w-full h-2 bg-gray-700 rounded overflow-hidden">
                <div
                  style={{
                    width: `${[passwordChecks.length, passwordChecks.uppercase, passwordChecks.number, passwordChecks.symbol].filter(Boolean).length * 25}%`,
                    backgroundColor: (() => {
                      const checks = [passwordChecks.length, passwordChecks.uppercase, passwordChecks.number, passwordChecks.symbol].filter(Boolean).length;
                      if (checks <= 1) return "#ef4444";
                      if (checks === 2) return "#eab308";
                      if (checks === 3) return "#3b82f6";
                      return "#22c55e";
                    })()
                  }}
                  className="h-2 rounded transition-all duration-300"
                />
              </div>
              <div className="grid grid-cols-2 gap-1 text-xs">
                <span className={passwordChecks.length ? "text-green-400 font-semibold" : "text-gray-500"}>
                  {passwordChecks.length ? "✔" : "✗"} 8 أحرف
                </span>
                <span className={passwordChecks.uppercase ? "text-green-400 font-semibold" : "text-gray-500"}>
                  {passwordChecks.uppercase ? "✔" : "✗"} حرف كبير
                </span>
                <span className={passwordChecks.number ? "text-green-400 font-semibold" : "text-gray-500"}>
                  {passwordChecks.number ? "✔" : "✗"} رقم
                </span>
                <span className={passwordChecks.symbol ? "text-green-400 font-semibold" : "text-gray-500"}>
                  {passwordChecks.symbol ? "✔" : "✗"} رمز خاص
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Section 5: Messages & Submit Button (15% height) */}
        <div className="h-[15%] px-6 border-t border-cyan-400/10 shrink-0 flex flex-col items-center justify-center gap-1 overflow-hidden">
          {/* رسائل الأخطاء والنجاح */}
          {error && (
            <div className="w-full bg-red-900/30 border border-red-500/50 rounded p-1 text-red-300 text-xs text-center truncate">
              {error}
            </div>
          )}
          {success && (
            <div className="w-full bg-green-900/30 border border-green-500/50 rounded p-1 text-green-300 text-xs flex items-center justify-center gap-1">
              <FaCheck className="text-xs shrink-0" />
              <span className="truncate">{success}</span>
            </div>
          )}

          {/* زر الإنشاء */}
          <button
            type="submit"
            disabled={loading || !isPasswordStrong}
            className="px-6 py-2.5 rounded-lg bg-linear-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold text-sm shadow-lg transition-all hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mx-auto mt-3 mb-4"
          >
            {loading ? (
              <>
                <span className="inline-block w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                جاري
              </>
            ) : (
              <>
                <FaUserPlus className="text-sm" />
                إنشاء الحساب
              </>
            )}
          </button>

          {/* رابط تسجيل الدخول */}
          <div className="text-center text-gray-400 text-xs whitespace-nowrap">
            لديك حساب؟{" "}
            <a href="/login" className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors">
              دخول
            </a>
          </div>
        </div>
      </form>
    </div>
  );
}
