"use client";

import { useState } from "react";
import AdminLayout from "../AdminLayout";
import { useToast } from "../../../components/ui/Toast";
import { FaSave } from "react-icons/fa";
import { FiSettings, FiGlobe, FiUser, FiClock, FiLock, FiUsers } from "react-icons/fi";

export default function SettingsPage() {
  const { showToast, ToastContainer } = useToast();

  // State للإعدادات
  const [settings, setSettings] = useState({
    systemName: "PneumoDetect",
    defaultLanguage: "ar",
    registrationEnabled: true,
    allowPatientChangeDoctor: false,
    maxDoctorChangeRequests: 3,
    appointmentInterval: 15,
    rolePermissions: {
      admin: true,
      doctor: true,
      patient: true,
    },
    sessionDuration: 30,
    enableTwoFactor: false,
  });

  const handleChange = (field, value) => {
    setSettings({ ...settings, [field]: value });
  };

  return (
    <AdminLayout>
      <ToastContainer />
      <div className="min-h-screen w-full p-10 bg-gradient-to-b from-slate-100 via-white to-white flex items-start">
        <div className="w-full max-w-6xl mx-auto bg-white/60 backdrop-blur-md rounded-3xl p-6 shadow-xl">
        <header className="flex items-center justify-between gap-4">
          <h1 className="text-xl font-semibold flex items-center gap-3 text-slate-800">
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-tr from-sky-500 to-indigo-500 text-white shadow-sm">
              <FiSettings />
            </span>
            إعدادات النظام
          </h1>
          <p className="text-sm text-slate-500">إدارة إعدادات التطبيق العامة والطبية والأمنية</p>
        </header>
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* اسم النظام */}
          <section className="relative overflow-hidden bg-white p-5 rounded-xl shadow-sm hover:shadow-lg transition transform hover:-translate-y-1">
            <div className="absolute -top-1 left-6 right-6 h-1 bg-gradient-to-r from-indigo-400 to-sky-400 rounded"></div>
            <div className="flex items-center gap-3 mb-3">
              <span className="w-11 h-11 rounded-lg inline-flex items-center justify-center bg-gradient-to-tr from-sky-500 to-indigo-500 text-white shadow-md">
                <FiSettings className="text-lg" />
              </span>
              <div>
                <label className="block font-semibold text-slate-800">اسم النظام</label>
                <p className="text-xs text-slate-500">الاسم الظاهر في واجهات المستخدم</p>
              </div>
            </div>
            <input
              type="text"
              value={settings.systemName}
              onChange={(e) => handleChange("systemName", e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-300 transition bg-white"
            />
          </section>

          {/* اللغة الافتراضية */}
          <section className="relative overflow-hidden bg-white p-5 rounded-xl shadow-sm hover:shadow-lg transition transform hover:-translate-y-1">
            <div className="absolute -top-1 left-6 right-6 h-1 bg-gradient-to-r from-indigo-300 to-indigo-500 rounded"></div>
            <div className="flex items-center gap-3 mb-3">
              <span className="w-11 h-11 rounded-lg inline-flex items-center justify-center bg-indigo-50 text-indigo-600 shadow-inner">
                <FiGlobe className="text-lg" />
              </span>
              <div>
                <label className="block font-semibold text-slate-800">اللغة الافتراضية</label>
                <p className="text-xs text-slate-500">اختيار لغة واجهة المستخدم</p>
              </div>
            </div>
            <select
              value={settings.defaultLanguage}
              onChange={(e) => handleChange("defaultLanguage", e.target.value)}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-300 transition"
            >
              <option value="ar">العربية</option>
              <option value="en">English</option>
            </select>
          </section>

          {/* تفعيل/تعطيل التسجيل */}
          <section className="relative overflow-hidden bg-white p-5 rounded-xl shadow-sm hover:shadow-lg transition transform hover:-translate-y-1">
            <div className="absolute -top-1 left-6 right-6 h-1 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded"></div>
            <div className="flex items-center gap-3 mb-3">
              <span className="w-11 h-11 rounded-lg inline-flex items-center justify-center bg-emerald-500/10 text-emerald-600 shadow-inner">
                <FiUsers className="text-lg" />
              </span>
              <div>
                <label className="block font-semibold text-slate-800">الوصول والتسجيل</label>
                <p className="text-xs text-slate-500">خيارات فتح الحساب والتسجيل للمستخدمين</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-600">تفعيل التسجيل</div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={settings.registrationEnabled} onChange={(e) => handleChange("registrationEnabled", e.target.checked)} />
                <div className="w-11 h-6 bg-slate-200 peer-checked:bg-emerald-500 rounded-full peer-focus:ring-2 peer-focus:ring-emerald-300 transition" />
                <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow transform peer-checked:translate-x-5 transition" />
              </label>
            </div>
          </section>

          {/* إعدادات طبية */}
          <section className="relative overflow-hidden bg-white p-5 rounded-xl shadow-sm hover:shadow-lg transition transform hover:-translate-y-1">
            <div className="absolute -top-1 left-6 right-6 h-1 bg-gradient-to-r from-rose-400 to-rose-600 rounded"></div>
            <div className="flex items-center gap-3 mb-3">
              <span className="w-11 h-11 rounded-lg inline-flex items-center justify-center bg-rose-500/10 text-rose-600 shadow-inner">
                <FiUser className="text-lg" />
              </span>
              <div>
                <h2 className="font-semibold text-slate-800">إعدادات طبية</h2>
                <p className="text-xs text-slate-500">خيارات خاصة بعمل الأطباء والمرضى</p>
              </div>
            </div>

            <div className="flex items-center justify-between mb-3">
              <div className="text-sm text-slate-600">هل يمكن للمريض تغيير الطبيب؟</div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={settings.allowPatientChangeDoctor} onChange={(e) => handleChange("allowPatientChangeDoctor", e.target.checked)} />
                <div className="w-11 h-6 bg-slate-200 peer-checked:bg-rose-500 rounded-full peer-focus:ring-2 peer-focus:ring-rose-300 transition" />
                <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow transform peer-checked:translate-x-5 transition" />
              </label>
            </div>

            <div className="mb-3">
              <label className="text-sm mb-1 block">الحد الأقصى لطلبات تغيير الطبيب</label>
              <input
                type="number"
                min={0}
                value={settings.maxDoctorChangeRequests}
                onChange={(e) => handleChange("maxDoctorChangeRequests", parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-200 transition bg-white"
              />
            </div>

            <div>
              <label className="text-sm mb-1 block">فترات المواعيد (دقائق)</label>
              <select
                value={settings.appointmentInterval}
                onChange={(e) => handleChange("appointmentInterval", parseInt(e.target.value))}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-rose-200 transition"
              >
                <option value={15}>15 دقيقة</option>
                <option value={30}>30 دقيقة</option>
              </select>
            </div>
          </section>

          {/* صلاحيات الأدوار */}
          <section className="relative overflow-hidden bg-white p-5 rounded-xl shadow-sm hover:shadow-lg transition transform hover:-translate-y-1">
            <div className="absolute -top-1 left-6 right-6 h-1 bg-gradient-to-r from-sky-400 to-indigo-500 rounded"></div>
            <div className="flex items-center gap-3 mb-3">
              <span className="w-11 h-11 rounded-lg inline-flex items-center justify-center bg-sky-50 text-sky-600 shadow-inner">
                <FiLock className="text-lg" />
              </span>
              <div>
                <h2 className="font-semibold text-slate-800">صلاحيات الأدوار</h2>
                <p className="text-xs text-slate-500">تحكم ما يمكن لكل دور فعله داخل النظام</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {Object.keys(settings.rolePermissions).map((role) => (
                <button
                  key={role}
                  onClick={() =>
                    setSettings({
                      ...settings,
                      rolePermissions: { ...settings.rolePermissions, [role]: !settings.rolePermissions[role] },
                    })
                  }
                  className={`flex items-center gap-2 p-2 rounded-lg justify-between ${
                    settings.rolePermissions[role]
                      ? 'bg-sky-600 text-white shadow-md'
                      : 'bg-white/60 text-slate-700 border border-slate-100'
                  }`}
                >
                  <span className="capitalize text-sm">{role}</span>
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white/20">
                    {settings.rolePermissions[role] ? '✓' : ''}
                  </span>
                </button>
              ))}
            </div>
          </section>

          {/* إعدادات الأمان */}
          <section className="relative overflow-hidden bg-white p-5 rounded-xl shadow-sm hover:shadow-lg transition transform hover:-translate-y-1">
            <div className="absolute -top-1 left-6 right-6 h-1 bg-gradient-to-r from-indigo-400 to-indigo-600 rounded"></div>
            <div className="flex items-center gap-3 mb-3">
              <span className="w-11 h-11 rounded-lg inline-flex items-center justify-center bg-indigo-50 text-indigo-600 shadow-inner">
                <FiClock className="text-lg" />
              </span>
              <div>
                <h2 className="font-semibold text-slate-800">إعدادات الأمان</h2>
                <p className="text-xs text-slate-500">حماية الجلسات والتحقق</p>
              </div>
            </div>

            <div className="mb-3">
              <label className="text-sm mb-1 block">مدة الجلسة (دقائق)</label>
              <input
                type="number"
                min={1}
                value={settings.sessionDuration}
                onChange={(e) => handleChange("sessionDuration", parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-200 transition bg-white"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-600">تفعيل التحقق الثنائي</div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={settings.enableTwoFactor} onChange={(e) => handleChange("enableTwoFactor", e.target.checked)} />
                <div className="w-11 h-6 bg-slate-200 peer-checked:bg-indigo-500 rounded-full peer-focus:ring-2 peer-focus:ring-indigo-300 transition" />
                <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow transform peer-checked:translate-x-5 transition" />
              </label>
            </div>
          </section>

        </div>

        {/* زر الحفظ */}
        <div className="flex justify-end mt-6">
          <button
            onClick={() => showToast("تم حفظ الإعدادات!", "success")}
            className="flex items-center gap-2 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-transform active:translate-y-0.5"
          >
            <FaSave /> حفظ
          </button>
        </div>
        </div>
      </div>
    </AdminLayout>
  );
}
