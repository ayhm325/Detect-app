"use client";

import React, { useState } from "react";
import { FaSave, FaCheck, FaGlobeAmericas, FaUserMd, FaUserShield, FaClock, FaLock } from "react-icons/fa";
import { FiSettings, FiUsers } from "react-icons/fi";
import { useTranslations } from "next-intl";
import useLocale from "../../../hooks/useLocale";
import { useToast } from "../../../components/ui/Toast";

// --- مكون Toggle Switch مخصص ---
const ToggleSwitch = ({ checked, onChange, label }) => (
  <div className="flex items-center justify-between w-full">
    <span className="text-sm font-medium text-slate-700">{label}</span>
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        value=""
        className="sr-only peer"
        checked={checked}
        onChange={onChange}
      />
      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-sky-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-linear-to-r peer-checked:from-sky-500 peer-checked:to-indigo-600 shadow-inner"></div>
    </label>
  </div>
);

// --- الصفحة الرئيسية ---
export default function SettingsPage() {
  const { showToast } = useToast();
  const { locale } = useLocale();
  const t = useTranslations("adminSettings");
  const isRTL = locale === "ar";

  // الحالة الأولية للإعدادات
  const [settings, setSettings] = useState({
    systemName: t('defaults.systemName'),
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

  // التعامل مع تغيير الحقول
  const handleChange = (field, value) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  // التعامل مع التغييرات المتداخلة (مثل الصلاحيات)
  const handleNestedChange = (parent, field, value) => {
    setSettings((prev) => ({
      ...prev,
      [parent]: { ...prev[parent], [field]: value },
    }));
  };

  // حفظ الإعدادات
  const handleSave = () => {
    // هنا يمكنك إضافة منطق إرسال البيانات للباك إند
    showToast(t('messages.success'), "success");
  };

  // Build appointment options by mapping known values to localized labels.
  // Avoid calling `t('system.config.appointmentOptions')` directly because next-intl
  // treats nested objects as non-string messages and will error. Locale files
  // provide a mapping like { "15": "15m", ... } so we call t for each key.
  const appointmentValueKeys = [15, 30, 45, 60];
  const appointmentOptions = appointmentValueKeys.map((v) => ({
    value: v,
    label: t(`system.config.appointmentOptions.${v}`) || String(v),
  }));

  return (
    <>
      <div className={`min-h-screen w-full p-4 md:p-8 bg-linear-to-br from-slate-50 via-white to-indigo-50/30 ${isRTL ? 'rtl' : 'ltr'}`}>
        
        {/* حاوية المحتوى */}
        <div className="w-full max-w-7xl mx-auto space-y-8">
          
          {/* رأس الصفحة */}
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-linear-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/30">
                <FiSettings size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
                  {t('header.title')}
                </h1>
                <p className="text-slate-500 text-sm mt-0.5">{t('header.subtitle')}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-400 px-3 py-1 bg-slate-100 rounded-full">{t('ui.version')}</span>
            </div>
          </header>

          {/* شبكة الإعدادات */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            {/* 1. الإعدادات العامة */}
            <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-shadow duration-300 flex flex-col gap-5">
              <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                  <FaGlobeAmericas className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-slate-800">{t('sections.general')}</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">
                    {t('labels.systemName.label')}
                  </label>
                  <input
                    type="text"
                    value={settings.systemName}
                    onChange={(e) => handleChange("systemName", e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm text-slate-700"
                  />
                  <p className="text-xs text-slate-400 mt-1">{t('labels.systemName.description')}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1.5">
                    {t('labels.defaultLanguage.label')}
                  </label>
                  <div className="relative">
                    <select
                      value={settings.defaultLanguage}
                      onChange={(e) => handleChange("defaultLanguage", e.target.value)}
                      className="w-full appearance-none px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm text-slate-700 cursor-pointer"
                    >
                      {['ar', 'en'].map((lang) => (
                        <option key={lang} value={lang}>{t(`system.config.languageOptions.${lang}`)}</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 left-0 flex items-center px-3 pointer-events-none text-slate-500">
                      <FaGlobeAmericas size={16} />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 2. الوصول والتسجيل */}
            <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-shadow duration-300 flex flex-col gap-5">
              <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                  <FiUsers className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-slate-800">{t('sections.access')}</h3>
              </div>

              <div className="space-y-6 pt-2">
                <ToggleSwitch
                  label={t('labels.registrationEnabled.label')}
                  checked={settings.registrationEnabled}
                  onChange={(e) => handleChange("registrationEnabled", e.target.checked)}
                />
                <p className="text-xs text-slate-400 leading-relaxed -mt-4">
                  {t('labels.registrationEnabled.description')}
                </p>
              </div>
            </section>

            {/* 3. الإعدادات الطبية */}
            <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-shadow duration-300 flex flex-col gap-5">
              <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
                <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
                  <FaUserMd className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-slate-800">{t('sections.medical')}</h3>
              </div>

              <div className="space-y-5">
                <ToggleSwitch
                  label={t('labels.allowPatientChangeDoctor.label')}
                  checked={settings.allowPatientChangeDoctor}
                  onChange={(e) => handleChange("allowPatientChangeDoctor", e.target.checked)}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">
                      {t('labels.maxDoctorChangeRequests.label')}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={settings.maxDoctorChangeRequests}
                      onChange={(e) => handleChange("maxDoctorChangeRequests", parseInt(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">
                      {t('labels.appointmentInterval.label')}
                    </label>
                    <select
                      value={settings.appointmentInterval}
                      onChange={(e) => handleChange("appointmentInterval", parseInt(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all cursor-pointer"
                    >
                      {appointmentOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </section>

            {/* 4. صلاحيات الأدوار */}
            <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-shadow duration-300 flex flex-col gap-5 md:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
                <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                  <FaUserShield className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-slate-800">{t('labels.rolePermissions.label')}</h3>
              </div>

              <div className="grid grid-cols-1 gap-3 pt-2">
                {Object.keys(settings.rolePermissions).map((role) => (
                  <button
                    key={role}
                    onClick={() => handleNestedChange("rolePermissions", role, !settings.rolePermissions[role])}
                    className={`flex items-center justify-between p-3 rounded-xl transition-all duration-200 group ${
                      settings.rolePermissions[role]
                        ? 'bg-linear-to-r from-sky-50 to-indigo-50 border border-sky-200/50 shadow-sm'
                        : 'bg-slate-50 border border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <span className={`font-medium capitalize text-sm ${settings.rolePermissions[role] ? 'text-slate-800' : 'text-slate-500'}`}>
                      {role}
                    </span>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${settings.rolePermissions[role] ? 'bg-sky-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                      {settings.rolePermissions[role] ? <FaCheck size={10} /> : ''}
                    </div>
                  </button>
                ))}
              </div>
            </section>

            {/* 5. الأمان */}
            <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-md transition-shadow duration-300 flex flex-col gap-5 md:col-span-2 lg:col-span-2">
              <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                  <FaLock className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-slate-800">{t('sections.security')}</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="space-y-5">
                  <div>
                    <label className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                      <FaClock size={14} className="text-slate-400" />
                      {t('labels.sessionDuration.label')}
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="5"
                        max="120"
                        step="5"
                        value={settings.sessionDuration}
                        onChange={(e) => handleChange("sessionDuration", parseInt(e.target.value))}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                      />
                      <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded min-w-14 text-center">
                        {settings.sessionDuration}{t('units.minutes')}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-2">{t('labels.sessionDuration.description')}</p>
                  </div>

                  <div className="pt-2">
                    <ToggleSwitch
                      label={
                        <span className="flex items-center gap-2">
                          {t('labels.enableTwoFactor.label')}
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-700 tracking-wide">{t('ui.secureBadge')}</span>
                        </span>
                      }
                      checked={settings.enableTwoFactor}
                      onChange={(e) => handleChange("enableTwoFactor", e.target.checked)}
                    />
                  </div>
                </div>

                {/* رسم توضيحي بسيط للأمان */}
                <div className="hidden md:flex justify-center bg-slate-50 rounded-xl p-6 border border-slate-100">
                   <div className="text-center space-y-2">
                      <div className="w-16 h-16 bg-white rounded-full shadow-sm border border-slate-200 flex items-center justify-center mx-auto text-indigo-500 text-2xl">
                        <FaLock />
                      </div>
                      <p className="text-xs text-slate-500 max-w-50 mx-auto">
                        {t('security.hipaaNotice')}
                      </p>
                   </div>
                </div>
              </div>
            </section>

          </div>

          {/* زر الحفظ الثابت في الأسفل */}
          <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center pointer-events-none">
            <div className="bg-white/90 backdrop-blur-md p-2 rounded-2xl shadow-2xl border border-slate-200 pointer-events-auto flex items-center gap-4">
               <div className="hidden sm:block text-xs text-slate-400 px-2 border-r border-slate-200">
                 {t('ui.unsavedChanges')}
               </div>
               <button
                onClick={handleSave}
                className="flex items-center gap-2 bg-linear-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white px-6 py-2.5 rounded-xl shadow-lg shadow-indigo-500/30 transition-all transform hover:scale-105 active:scale-95 font-medium text-sm"
              >
                <FaSave /> {t('actions.save')}
              </button>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}