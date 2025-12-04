"use client";
import { useState } from "react";
import { FaFacebook, FaGoogle, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaShield } from "react-icons/fa6";
import Link from "next/link";

export default function LoginForm() {
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
        setError("البريد الإلكتروني غير مسجل");
        setLoading(false);
        return;
      }
      if (user.disabled) {
        setError("هذا الحساب معطل");
        setLoading(false);
        return;
      }
      if (user.password !== form.password) {
        setError("كلمة المرور غير صحيحة");
        setLoading(false);
        return;
      }
      // توجيه حسب نوع المستخدم
      if (user.type === "doctor") window.location.href = "/doctor/dashboard";
      else if (user.type === "patient") window.location.href = "/patient/dashboard";
      else if (user.type === "admin") window.location.href = "/admin/dashboard";
    }, 1200);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="relative flex flex-col gap-6 w-full h-full justify-center items-center bg-linear-to-br from-slate-900 via-slate-800 to-black backdrop-blur-xl shadow-2xl p-8 md:p-16 text-lg overflow-hidden border border-cyan-400/20"
    >
      {/* خلفية cyberpunk محسّنة */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* شبكة خطوط نيون */}
        <svg width="100%" height="100%" viewBox="0 0 800 600" className="absolute inset-0 w-full h-full" style={{mixBlendMode:'screen'}}>
          <defs>
            <linearGradient id="neonLine" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00fff7" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#a259ff" stopOpacity="0.5" />
            </linearGradient>
          </defs>
          {[...Array(8)].map((_, i) => (
            <line key={i} x1="0" y1={75*i+40} x2="800" y2={75*i+40} stroke="url(#neonLine)" strokeWidth="2" opacity="0.12" />
          ))}
          {[...Array(6)].map((_, i) => (
            <line key={i+10} x1={i*160+40} y1="0" x2={i*160+40} y2="600" stroke="url(#neonLine)" strokeWidth="2" opacity="0.08" />
          ))}
        </svg>
        {/* جسيمات ضوء متوهجة */}
        <div className="absolute left-1/4 top-1/4 w-96 h-96 bg-cyan-500 opacity-10 rounded-full blur-3xl" />
        <div className="absolute right-1/4 bottom-1/4 w-96 h-96 bg-purple-500 opacity-10 rounded-full blur-3xl" />
      </div>

      {/* المحتوى */}
      <div className="relative z-10 flex flex-col gap-4 w-full max-w-md">
        {/* الأيقونة والعنوان */}
        <div className="text-center mb-2">
          <div className="inline-block p-4 bg-linear-to-br from-cyan-500 to-blue-600 rounded-full mb-4 shadow-lg">
            <FaLock className="text-4xl text-white" />
          </div>
          <h2 className="text-4xl font-bold mb-2 text-white">تسجيل الدخول</h2>
          <p className="text-gray-400 text-sm">أدخل بيانات حسابك للمتابعة</p>
        </div>

        {/* خيارات الدخول الاجتماعي */}
        <div className="flex justify-center gap-4 mb-4">
          <button type="button" className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-all hover:scale-110 ring-2 ring-blue-400/30">
            <FaFacebook className="text-lg" />
          </button>
          <button type="button" className="flex items-center justify-center w-12 h-12 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg transition-all hover:scale-110 ring-2 ring-red-400/30">
            <FaGoogle className="text-lg" />
          </button>
        </div>

        {/* الفاصل */}
        <div className="flex items-center gap-3 my-2">
          <div className="flex-1 h-px bg-gray-600" />
          <span className="text-gray-400 text-xs">أو</span>
          <div className="flex-1 h-px bg-gray-600" />
        </div>
      </div>

      {/* حقل البريد الإلكتروني */}
      <div className="relative z-10 w-full max-w-md">
        <label className="block text-sm font-medium text-gray-300 mb-2">البريد الإلكتروني</label>
        <div className="relative">
          <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400 text-lg" />
          <input
            type="email"
            name="email"
            placeholder="example@email.com"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full pl-12 pr-4 py-3 border-2 border-cyan-400/30 rounded-lg bg-slate-800/50 text-white placeholder:text-gray-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all"
          />
        </div>
      </div>

      {/* حقل كلمة المرور */}
      <div className="relative z-10 w-full max-w-md">
        <label className="block text-sm font-medium text-gray-300 mb-2">كلمة المرور</label>
        <div className="relative">
          <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400 text-lg" />
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="••••••••"
            value={form.password}
            onChange={handleChange}
            required
            className="w-full pl-12 pr-12 py-3 border-2 border-cyan-400/30 rounded-lg bg-slate-800/50 text-white placeholder:text-gray-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-cyan-400 hover:text-cyan-300 transition-colors mt-1"
          >
            {showPassword ? <FaEyeSlash className="text-lg" /> : <FaEye className="text-lg" />}
          </button>
        </div>
      </div>

      {/* رسالة الخطأ */}
      {error && (
        <div className="relative z-10 w-full max-w-md bg-red-900/30 border border-red-500/50 rounded-lg p-3 text-red-300 text-sm flex items-center gap-2">
          <FaShield className="text-lg shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* زر تسجيل الدخول */}
      <button
        type="submit"
        disabled={loading}
        className="relative z-10 w-full max-w-md py-3 rounded-lg bg-linear-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold text-lg shadow-xl transition-all hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            جاري التحقق...
          </span>
        ) : (
          "دخول"
        )}
      </button>

      {/* روابط إضافية */}
      <div className="relative z-10 w-full max-w-md flex flex-col gap-3 text-center mt-2">
        <a href="#" className="text-cyan-400 hover:text-cyan-300 text-sm transition-colors">
          هل نسيت كلمة المرور؟
        </a>
        <div className="text-gray-400 text-sm">
          ليس لديك حساب؟{" "}
          <a href="/signup" className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors">
            سجل الآن
          </a>
        </div>
      </div>
    </form>
  );
}
