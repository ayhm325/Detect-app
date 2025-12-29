"use client";

import DoctorLayout from "../DoctorLayout";
import { useToast } from "../../../components/ui/Toast";
import { useState, useEffect } from "react";
import {
  FaUser,
  FaClock,
  FaBell,
  FaLock,
  FaEnvelope,
  FaPhone,
  FaGlobe,
  FaSave,
  FaUserMd,
  FaStethoscope,
  FaCalendarAlt,
  FaSms,
  FaToggleOn,
  FaToggleOff,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import useLocale from "../../../hooks/useLocale";
import { useTranslations } from "next-intl";

export default function DoctorSettingsPage() {
  const { showToast, ToastContainer } = useToast();
  const { locale } = useLocale();
  const t = useTranslations("doctorSettings");
  // All UI labels should use t("key") directly, e.g. t("title"), t("profile.header"), t("availability.header"), etc.

  // بيانات الطبيب الحقيقية (تُجلب من API لاحقاً)
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    bio: "",
    licenseNumber: ""
  });
  const [userEmail, setUserEmail] = useState("");

  // جلب البريد الإلكتروني الحقيقي للمستخدم الحالي عند تحميل الصفحة
  useEffect(() => {
    // جلب بيانات الطبيب الحقيقية من API الجديد
    fetch("/api/doctor/me")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.profile) {
          setProfile({
            name: data.profile.name || "",
            email: data.profile.email || "",
            phone: data.profile.phone || "",
            bio: data.profile.bio || "",
            licenseNumber: data.profile.licenseNumber || ""
          });
          setUserEmail(data.profile.email || "");
        }
      });
  }, []);

  // إعدادات المواعيد (تُجلب من API لاحقاً)
  const [availability, setAvailability] = useState({
    workDays: [],
    startTime: "",
    endTime: "",
    slotDuration: "",
    maxPatients: ""
  });

  // إعدادات الإشعارات (تُجلب من API لاحقاً)
  const [notifications, setNotifications] = useState({
    emailNotifications: false,
    smsNotifications: false,
    pushNotifications: false,
    newAppointment: false,
    appointmentReminder: false,
    patientMessages: false,
    systemUpdates: false,
  });

  // إعدادات الأمان
  const [security, setSecurity] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [activeTab, setActiveTab] = useState("profile");


  const handleSaveProfile = () => {
    // عند توفر API: أرسل البيانات الحقيقية هنا
    showToast(t("profile.toast.saved"), "success");
  };

  const handleSaveAvailability = () => {
    // عند توفر API: أرسل البيانات الحقيقية هنا
    showToast(t("availability.toast.saved"), "success");
  };

  const handleSaveNotifications = () => {
    // عند توفر API: أرسل البيانات الحقيقية هنا
    showToast(t("notifications.toast.saved"), "success");
  };

  const handleChangePassword = () => {
    if (!security.currentPassword || !security.newPassword || !security.confirmPassword) {
      showToast(locale === "en" ? "Please fill all password fields" : "يرجى ملء جميع حقول كلمة السر", "error");
      return;
    }
    if (security.newPassword !== security.confirmPassword) {
      showToast(t("security.toast.mismatch"), "error");
      return;
    }
    if (security.newPassword.length < 8) {
      showToast(locale === "en" ? "Password must be at least 8 characters" : "كلمة السر يجب أن تكون 8 أحرف على الأقل", "error");
      return;
    }
    // إرسال الطلب إلى API لتغيير كلمة المرور
    fetch("/api/doctor/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: userEmail,
        currentPassword: security.currentPassword,
        newPassword: security.newPassword,
      }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (res.ok && data.success) {
          showToast(locale === "en" ? "Password changed successfully" : "تم تغيير كلمة المرور بنجاح", "success");
          setSecurity({ currentPassword: "", newPassword: "", confirmPassword: "" });
          // تسجيل خروج المستخدم تلقائياً بعد تغيير كلمة المرور
          setTimeout(() => {
            window.location.href = "/logout";
          }, 1200); // إعطاء المستخدم إشعار النجاح أولاً
        } else {
          showToast(data.error || (locale === "en" ? "Failed to change password" : "فشل تغيير كلمة المرور"), "error");
        }
      })
      .catch(() => {
        showToast(locale === "en" ? "Failed to change password" : "فشل تغيير كلمة المرور", "error");
      });
  };

  const allDays = locale === "en"
    ? ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    : ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

  const tabs = [
    { id: "profile", label: t("doctorSettings.tabs.profile"), icon: FaUser },
    { id: "availability", label: t("doctorSettings.tabs.availability"), icon: FaClock },
    { id: "notifications", label: t("doctorSettings.tabs.notifications"), icon: FaBell },
    { id: "security", label: t("doctorSettings.tabs.security"), icon: FaLock },
  ];

  return (
    <DoctorLayout>
      <ToastContainer />
      <div
        className={`min-h-screen bg-linear-to-br from-blue-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-6 text-gray-900 dark:text-gray-100
        [&_div.bg-white]:dark:bg-zinc-900 [&_div.bg-white]:dark:border-zinc-800
        [&_p.text-gray-900]:dark:text-white [&_p.text-gray-600]:dark:text-gray-300 [&_p.text-gray-500]:dark:text-gray-400
        [&_span.text-gray-900]:dark:text-white [&_span.text-gray-600]:dark:text-gray-300
        [&_input.bg-white]:dark:bg-zinc-900 [&_input.border-gray-300]:dark:border-zinc-700 [&_input.text-gray-900]:dark:text-gray-100
        [&_textarea.bg-white]:dark:bg-zinc-900 [&_textarea.border-gray-300]:dark:border-zinc-700 [&_textarea.text-gray-900]:dark:text-gray-100`}
      >
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <FaUserMd className="text-blue-600" />
              {t("doctorSettings.title")}
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-300">{t("doctorSettings.subtitle")}</p>
          </div>

          {/* Tabs Navigation */}
          <div className="mb-6 flex flex-wrap gap-2 border-b border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 font-medium transition-all ${
                  activeTab === tab.id
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-600 hover:text-blue-600"
                }`}
              >
                <tab.icon />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Profile Settings */}
          {activeTab === "profile" && (
            <div className="rounded-xl bg-white p-8 shadow-lg border border-gray-100">
              <div className="mb-6 flex items-center gap-3">
                <FaUserMd className="text-2xl text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('doctorSettings.profile.header')}</h2>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    <FaUser className="inline ml-2" />
                    {t('doctorSettings.profile.name')}
                  </label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>



                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    <FaEnvelope className="inline ml-2" />
                    {t('doctorSettings.profile.email')}
                  </label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    <FaPhone className="inline ml-2" />
                    {t('doctorSettings.profile.phone')}
                  </label>
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('doctorSettings.profile.license')}
                  </label>
                  <input
                    type="text"
                    value={profile.licenseNumber}
                    onChange={(e) => setProfile({ ...profile, licenseNumber: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">{t('doctorSettings.profile.bio')}</label>
                  <textarea
                    rows={4}
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <button
                onClick={handleSaveProfile}
                className="mt-6 flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-all hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <FaSave />
                {t('doctorSettings.profile.save')}
              </button>
            </div>
          )}

          {/* Availability Settings */}
          {activeTab === "availability" && (
            <div className="rounded-xl bg-white p-8 shadow-lg border border-gray-100">
              <div className="mb-6 flex items-center gap-3">
                <FaClock className="text-2xl text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('doctorSettings.availability.header', { defaultValue: 'مواعيد العمل' })}</h2>
              </div>

              <div className="space-y-6">
                {/* Work Days */}
                <div>
                  <label className="mb-3 block text-sm font-medium text-gray-700">
                    <FaCalendarAlt className="inline ml-2" />
                    {t('doctorSettings.availability.workDays', { defaultValue: 'Work Days' })}
                  </label>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-7">
                    {allDays.map(
                      (day) => (
                        <button
                          key={day}
                          onClick={() => {
                            setAvailability({
                              ...availability,
                              workDays: availability.workDays.includes(day)
                                ? availability.workDays.filter((d) => d !== day)
                                : [...availability.workDays, day],
                            });
                          }}
                          className={`rounded-lg border px-4 py-3 text-sm font-medium transition-all ${
                            availability.workDays.includes(day)
                              ? "border-blue-600 bg-blue-50 text-blue-600"
                              : "border-gray-300 bg-white text-gray-700 hover:border-blue-400"
                          }`}
                        >
                          {day}
                        </button>
                      )
                    )}
                  </div>
                </div>

                {/* Working Hours */}
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">{t('doctorSettings.availability.startTime', { defaultValue: 'Start Time' })}</label>
                    <input
                      type="time"
                      value={availability.startTime}
                      onChange={(e) =>
                        setAvailability({ ...availability, startTime: e.target.value })
                      }
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">{t('doctorSettings.availability.endTime', { defaultValue: 'End Time' })}</label>
                    <input
                      type="time"
                      value={availability.endTime}
                      onChange={(e) => setAvailability({ ...availability, endTime: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      {t('doctorSettings.availability.slotDuration', { defaultValue: 'Appointment Duration (minutes)' })}
                    </label>
                    <select
                      value={availability.slotDuration}
                      onChange={(e) =>
                        setAvailability({ ...availability, slotDuration: e.target.value })
                      }
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value="15">15 {locale === "en" ? "minutes" : "دقيقة"}</option>
                      <option value="30">30 {locale === "en" ? "minutes" : "دقيقة"}</option>
                      <option value="45">45 {locale === "en" ? "minutes" : "دقيقة"}</option>
                      <option value="60">60 {locale === "en" ? "minutes" : "دقيقة"}</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      {t('doctorSettings.availability.maxPatients', { defaultValue: 'Max Patients Per Day' })}
                    </label>
                    <input
                      type="number"
                      value={availability.maxPatients}
                      onChange={(e) =>
                        setAvailability({ ...availability, maxPatients: e.target.value })
                      }
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={handleSaveAvailability}
                className="mt-6 flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-all hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <FaSave />
                {t('doctorSettings.availability.saveButton', { defaultValue: 'Save Hours' })}
              </button>
            </div>
          )}

          {/* Notifications Settings */}
          {activeTab === "notifications" && (
            <div className="rounded-xl bg-white p-8 shadow-lg border border-gray-100">
              <div className="mb-6 flex items-center gap-3">
                <FaBell className="text-2xl text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">{t('doctorSettings.notifications.title', { defaultValue: 'Notification Settings' })}</h2>
              </div>

              <div className="space-y-6">
                {/* General Notification Methods */}
                <div>
                  <h3 className="mb-4 text-lg font-semibold text-gray-900">{locale === "en" ? "Communication Methods" : "طرق التواصل"}</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-4">
                      <div className="flex items-center gap-3">
                        <FaEnvelope className="text-xl text-blue-600" />
                        <div>
                          <p className="font-medium text-gray-900">{t('doctorSettings.notifications.email', { defaultValue: 'Email Notifications' })}</p>
                          <p className="text-sm text-gray-600">
                            {locale === "en" ? "Receive notifications via email" : "استلام الإشعارات عبر بريد إلكتروني"}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          setNotifications({
                            ...notifications,
                            emailNotifications: !notifications.emailNotifications,
                          })
                        }
                        className="text-3xl"
                      >
                        {notifications.emailNotifications ? (
                          <FaToggleOn className="text-blue-600" />
                        ) : (
                          <FaToggleOff className="text-gray-400" />
                        )}
                      </button>
                    </div>

                    <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-4">
                      <div className="flex items-center gap-3">
                        <FaSms className="text-xl text-green-600" />
                        <div>
                          <p className="font-medium text-gray-900">{t('doctorSettings.notifications.sms', { defaultValue: 'SMS Notifications' })}</p>
                          <p className="text-sm text-gray-600">{locale === "en" ? "Receive notifications via SMS" : "استلام الإشعارات عبر SMS"}</p>
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          setNotifications({
                            ...notifications,
                            smsNotifications: !notifications.smsNotifications,
                          })
                        }
                        className="text-3xl"
                      >
                        {notifications.smsNotifications ? (
                          <FaToggleOn className="text-green-600" />
                        ) : (
                          <FaToggleOff className="text-gray-400" />
                        )}
                      </button>
                    </div>

                    <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-4">
                      <div className="flex items-center gap-3">
                        <FaBell className="text-xl text-purple-600" />
                        <div>
                          <p className="font-medium text-gray-900">{t('doctorSettings.notifications.push', { defaultValue: 'Push Notifications' })}</p>
                          <p className="text-sm text-gray-600">{locale === "en" ? "Receive notifications in app" : "استلام الإشعارات داخل التطبيق"}</p>
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          setNotifications({
                            ...notifications,
                            pushNotifications: !notifications.pushNotifications,
                          })
                        }
                        className="text-3xl"
                      >
                        {notifications.pushNotifications ? (
                          <FaToggleOn className="text-purple-600" />
                        ) : (
                          <FaToggleOff className="text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Notification Types */}
                <div>
                  <h3 className="mb-4 text-lg font-semibold text-gray-900">{locale === "en" ? "Notification Types" : "أنواع الإشعارات"}</h3>
                  <div className="space-y-3">
                    {[
                      {
                        key: "newAppointment",
                        label: t('doctorSettings.notifications.newAppointment', { defaultValue: 'New Appointments' }),
                        desc: locale === "en" ? "When a new appointment is booked" : "عند حجز موعد جديد",
                      },
                      {
                        key: "appointmentReminder",
                        label: t('doctorSettings.notifications.appointmentReminder', { defaultValue: 'Appointment Reminders' }),
                        desc: locale === "en" ? "One hour before appointment" : "قبل الموعد بساعة",
                      },
                      {
                        key: "patientMessages",
                        label: t('doctorSettings.notifications.patientMessages', { defaultValue: 'Patient Messages' }),
                        desc: locale === "en" ? "When receiving a new message" : "عند استلام رسالة جديدة",
                      },
                      {
                        key: "systemUpdates",
                        label: t('doctorSettings.notifications.systemUpdates', { defaultValue: 'System Updates' }),
                        desc: locale === "en" ? "About system updates" : "إشعارات حول التحديثات",
                      },
                    ].map((item) => (
                      <div
                        key={item.key}
                        className="flex items-center justify-between rounded-lg border border-gray-200 p-4"
                      >
                        <div>
                          <p className="font-medium text-gray-900">{item.label}</p>
                          <p className="text-sm text-gray-600">{item.desc}</p>
                        </div>
                        <button
                          onClick={() =>
                            setNotifications({
                              ...notifications,
                              [item.key]: !notifications[item.key],
                            })
                          }
                          className="text-3xl"
                        >
                          {notifications[item.key] ? (
                            <FaToggleOn className="text-blue-600" />
                          ) : (
                            <FaToggleOff className="text-gray-400" />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={handleSaveNotifications}
                className="mt-6 flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-all hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <FaSave />
                {t('doctorSettings.notifications.saveButton', { defaultValue: 'حفظ التفضيلات' })}
              </button>
            </div>
          )}

          {/* Security Settings */}
          {activeTab === "security" && (
            <div className="rounded-xl bg-white p-8 shadow-lg border border-gray-100">
              <div className="mb-6 flex items-center gap-3">
                <FaLock className="text-2xl text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">{t('doctorSettings.change_password', { defaultValue: 'Change Password' })}</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    {t('doctorSettings.current_password', { defaultValue: 'Current Password' })}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword.current ? "text" : "password"}
                      value={security.currentPassword}
                      onChange={(e) =>
                        setSecurity({ ...security, currentPassword: e.target.value })
                      }
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 pr-12 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword({ ...showPassword, current: !showPassword.current })
                      }
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword.current ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    {t('doctorSettings.new_password', { defaultValue: 'New Password' })}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword.new ? "text" : "password"}
                      value={security.newPassword}
                      onChange={(e) => setSecurity({ ...security, newPassword: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 pr-12 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword({ ...showPassword, new: !showPassword.new })}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword.new ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                   <p className="mt-1 text-sm text-gray-600">{t('doctorSettings.security_min_length', { defaultValue: 'Password must be at least 8 characters' })}</p>
                                   <p className="mt-1 text-sm text-gray-600">{t('doctorSettings.security_min_length', { defaultValue: 'Password must be at least 8 characters' })}</p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    {t('doctorSettings.confirm_password', { defaultValue: 'Confirm Password' })}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword.confirm ? "text" : "password"}
                      value={security.confirmPassword}
                      onChange={(e) =>
                        setSecurity({ ...security, confirmPassword: e.target.value })
                      }
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 pr-12 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword({ ...showPassword, confirm: !showPassword.confirm })
                      }
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword.confirm ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>
              </div>

              <button
                onClick={handleChangePassword}
                className="mt-6 flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-all hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <FaLock />
                {t('doctorSettings.change_password', { defaultValue: 'Change Password' })}
              </button>
            </div>
          )}
        </div>
      </div>
    </DoctorLayout>
  );
}
