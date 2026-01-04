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
import { useLocale, useTranslations } from "next-intl";

export default function DoctorSettingsPage() {
  const { showToast, ToastContainer } = useToast();
  const locale = useLocale();
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
    showToast(t("doctorSettings.profile.toast.saved"), "success");
  };

  const handleSaveAvailability = () => {
    // عند توفر API: أرسل البيانات الحقيقية هنا
    showToast(t("doctorSettings.availability.toast.saved"), "success");
  };

  const handleSaveNotifications = () => {
    // عند توفر API: أرسل البيانات الحقيقية هنا
    showToast(t("doctorSettings.notifications.toast.saved"), "success");
  };

  const handleChangePassword = () => {
    if (!security.currentPassword || !security.newPassword || !security.confirmPassword) {
      showToast(t("doctorSettings.security.toast.fillFields"), "error");
      return;
    }
    if (security.newPassword !== security.confirmPassword) {
      showToast(t("doctorSettings.security.toast.mismatch"), "error");
      return;
    }
    if (security.newPassword.length < 8) {
      showToast(t("doctorSettings.security_min_length"), "error");
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
          showToast(t("doctorSettings.security.toast.changedSuccess"), "success");
          setSecurity({ currentPassword: "", newPassword: "", confirmPassword: "" });
          // تسجيل خروج المستخدم تلقائياً بعد تغيير كلمة المرور
          setTimeout(async () => {
            try {
              const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
              await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include',
                headers: token ? { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' },
                body: token ? JSON.stringify({ token }) : undefined,
              }).catch(() => {});
            } finally {
              if (typeof window !== 'undefined') {
                localStorage.clear();
                sessionStorage.clear();
              }
              window.location.href = locale === 'en' ? '/en' : '/ar';
            }
          }, 1200); // إعطاء المستخدم إشعار النجاح أولاً
        } else {
          showToast(data.error || t("doctorSettings.security.toast.changeFailed"), "error");
        }
      })
      .catch(() => {
        showToast(t("doctorSettings.security.toast.changeFailed"), "error");
      });
  };

  const allDaysRaw = t.raw("doctorSettings.availability.days");
  const allDays = Array.isArray(allDaysRaw) ? allDaysRaw : [];

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
        className="min-h-screen bg-(--ui-surface-2) text-(--ui-foreground) p-6"
      >
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-(--ui-foreground) flex items-center gap-3">
              <FaUserMd className="text-(--ui-info)" />
              {t("doctorSettings.title")}
            </h1>
            <p className="mt-2 text-(--ui-muted-foreground)">{t("doctorSettings.subtitle")}</p>
          </div>

          {/* Tabs Navigation */}
          <div className="mb-6 flex flex-wrap gap-2 border-b border-(--ui-border)">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 font-medium transition-all ${
                  activeTab === tab.id
                    ? "border-b-2 border-(--ui-info) text-(--ui-info)"
                    : "text-(--ui-muted-foreground) hover:text-(--ui-foreground)"
                }`}
              >
                <tab.icon />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Profile Settings */}
          {activeTab === "profile" && (
            <div className="card-glass rounded-xl p-8 shadow-(--shadow-soft) border border-(--ui-border)">
              <div className="mb-6 flex items-center gap-3">
                <FaUserMd className="text-2xl text-(--ui-info)" />
                <h2 className="text-2xl font-bold text-(--ui-foreground)">{t('doctorSettings.profile.header')}</h2>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-(--ui-muted-foreground)">
                    <FaUser className="inline ml-2" />
                    {t('doctorSettings.profile.name')}
                  </label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="w-full rounded-lg border border-(--ui-border) bg-(--ui-surface) px-4 py-3 text-(--ui-foreground) focus:border-(--ui-ring) focus:outline-none focus:ring-2 focus:ring-(--ui-ring)/20"
                  />
                </div>



                <div>
                  <label className="mb-2 block text-sm font-medium text-(--ui-muted-foreground)">
                    <FaEnvelope className="inline ml-2" />
                    {t('doctorSettings.profile.email')}
                  </label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="w-full rounded-lg border border-(--ui-border) bg-(--ui-surface) px-4 py-3 text-(--ui-foreground) focus:border-(--ui-ring) focus:outline-none focus:ring-2 focus:ring-(--ui-ring)/20"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-(--ui-muted-foreground)">
                    <FaPhone className="inline ml-2" />
                    {t('doctorSettings.profile.phone')}
                  </label>
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="w-full rounded-lg border border-(--ui-border) bg-(--ui-surface) px-4 py-3 text-(--ui-foreground) focus:border-(--ui-ring) focus:outline-none focus:ring-2 focus:ring-(--ui-ring)/20"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-(--ui-muted-foreground)">
                    {t('doctorSettings.profile.license')}
                  </label>
                  <input
                    type="text"
                    value={profile.licenseNumber}
                    onChange={(e) => setProfile({ ...profile, licenseNumber: e.target.value })}
                    className="w-full rounded-lg border border-(--ui-border) bg-(--ui-surface) px-4 py-3 text-(--ui-foreground) focus:border-(--ui-ring) focus:outline-none focus:ring-2 focus:ring-(--ui-ring)/20"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-(--ui-muted-foreground)">{t('doctorSettings.profile.bio')}</label>
                  <textarea
                    rows={4}
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    className="w-full rounded-lg border border-(--ui-border) bg-(--ui-surface) px-4 py-3 text-(--ui-foreground) focus:border-(--ui-ring) focus:outline-none focus:ring-2 focus:ring-(--ui-ring)/20"
                  />
                </div>
              </div>

              <button
                onClick={handleSaveProfile}
                className="mt-6 flex items-center gap-2 rounded-lg btn-gradient px-6 py-3 font-medium text-white transition-all focus:outline-none focus:ring-2 focus:ring-(--ui-ring)/30"
              >
                <FaSave />
                {t('doctorSettings.profile.save')}
              </button>
            </div>
          )}

          {/* Availability Settings */}
          {activeTab === "availability" && (
            <div className="card-glass rounded-xl p-8 shadow-(--shadow-soft) border border-(--ui-border)">
              <div className="mb-6 flex items-center gap-3">
                <FaClock className="text-2xl text-(--ui-info)" />
                <h2 className="text-2xl font-bold text-(--ui-foreground)">{t('doctorSettings.availability.header')}</h2>
              </div>

              <div className="space-y-6">
                {/* Work Days */}
                <div>
                  <label className="mb-3 block text-sm font-medium text-(--ui-muted-foreground)">
                    <FaCalendarAlt className="inline ml-2" />
                    {t('doctorSettings.availability.workDays')}
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
                              ? "border-(--ui-info-border) bg-(--ui-info-bg) text-(--ui-info)"
                              : "border-(--ui-border) bg-(--ui-surface) text-(--ui-foreground) hover:border-(--ui-ring)"
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
                    <label className="mb-2 block text-sm font-medium text-(--ui-muted-foreground)">{t('doctorSettings.availability.startTime')}</label>
                    <input
                      type="time"
                      value={availability.startTime}
                      onChange={(e) =>
                        setAvailability({ ...availability, startTime: e.target.value })
                      }
                      className="w-full rounded-lg border border-(--ui-border) bg-(--ui-surface) px-4 py-3 text-(--ui-foreground) focus:border-(--ui-ring) focus:outline-none focus:ring-2 focus:ring-(--ui-ring)/20"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-(--ui-muted-foreground)">{t('doctorSettings.availability.endTime')}</label>
                    <input
                      type="time"
                      value={availability.endTime}
                      onChange={(e) => setAvailability({ ...availability, endTime: e.target.value })}
                      className="w-full rounded-lg border border-(--ui-border) bg-(--ui-surface) px-4 py-3 text-(--ui-foreground) focus:border-(--ui-ring) focus:outline-none focus:ring-2 focus:ring-(--ui-ring)/20"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-(--ui-muted-foreground)">
                      {t('doctorSettings.availability.slotDuration')}
                    </label>
                    <select
                      value={availability.slotDuration}
                      onChange={(e) =>
                        setAvailability({ ...availability, slotDuration: e.target.value })
                      }
                      className="w-full rounded-lg border border-(--ui-border) bg-(--ui-surface) px-4 py-3 text-(--ui-foreground) focus:border-(--ui-ring) focus:outline-none focus:ring-2 focus:ring-(--ui-ring)/20"
                    >
                      <option value="15">15 {t('doctorSettings.availability.minutes')}</option>
                      <option value="30">30 {t('doctorSettings.availability.minutes')}</option>
                      <option value="45">45 {t('doctorSettings.availability.minutes')}</option>
                      <option value="60">60 {t('doctorSettings.availability.minutes')}</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-(--ui-muted-foreground)">
                      {t('doctorSettings.availability.maxPatients')}
                    </label>
                    <input
                      type="number"
                      value={availability.maxPatients}
                      onChange={(e) =>
                        setAvailability({ ...availability, maxPatients: e.target.value })
                      }
                      className="w-full rounded-lg border border-(--ui-border) bg-(--ui-surface) px-4 py-3 text-(--ui-foreground) focus:border-(--ui-ring) focus:outline-none focus:ring-2 focus:ring-(--ui-ring)/20"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={handleSaveAvailability}
                className="mt-6 flex items-center gap-2 rounded-lg btn-gradient px-6 py-3 font-medium text-white transition-all focus:outline-none focus:ring-2 focus:ring-(--ui-ring)/30"
              >
                <FaSave />
                {t('doctorSettings.availability.saveButton')}
              </button>
            </div>
          )}

          {/* Notifications Settings */}
          {activeTab === "notifications" && (
            <div className="card-glass rounded-xl p-8 shadow-(--shadow-soft) border border-(--ui-border)">
              <div className="mb-6 flex items-center gap-3">
                <FaBell className="text-2xl text-(--ui-info)" />
                <h2 className="text-2xl font-bold text-(--ui-foreground)">{t('doctorSettings.notifications.title')}</h2>
              </div>

              <div className="space-y-6">
                {/* General Notification Methods */}
                <div>
                  <h3 className="mb-4 text-lg font-semibold text-(--ui-foreground)">{t('doctorSettings.notifications.communicationMethodsTitle')}</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between rounded-lg border border-(--ui-border) bg-(--ui-surface-2) p-4">
                      <div className="flex items-center gap-3">
                        <FaEnvelope className="text-xl text-(--ui-info)" />
                        <div>
                          <p className="font-medium text-(--ui-foreground)">{t('doctorSettings.notifications.email')}</p>
                          <p className="text-sm text-(--ui-muted-foreground)">
                            {t('doctorSettings.notifications.emailDesc')}
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
                          <FaToggleOn className="text-(--ui-info)" />
                        ) : (
                          <FaToggleOff className="text-(--ui-muted-foreground)" />
                        )}
                      </button>
                    </div>

                    <div className="flex items-center justify-between rounded-lg border border-(--ui-border) bg-(--ui-surface-2) p-4">
                      <div className="flex items-center gap-3">
                        <FaSms className="text-xl text-(--ui-success)" />
                        <div>
                          <p className="font-medium text-(--ui-foreground)">{t('doctorSettings.notifications.sms')}</p>
                          <p className="text-sm text-(--ui-muted-foreground)">{t('doctorSettings.notifications.smsDesc')}</p>
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
                          <FaToggleOn className="text-(--ui-success)" />
                        ) : (
                          <FaToggleOff className="text-(--ui-muted-foreground)" />
                        )}
                      </button>
                    </div>

                    <div className="flex items-center justify-between rounded-lg border border-(--ui-border) bg-(--ui-surface-2) p-4">
                      <div className="flex items-center gap-3">
                        <FaBell className="text-xl text-(--ui-info)" />
                        <div>
                          <p className="font-medium text-(--ui-foreground)">{t('doctorSettings.notifications.push')}</p>
                          <p className="text-sm text-(--ui-muted-foreground)">{t('doctorSettings.notifications.pushDesc')}</p>
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
                          <FaToggleOn className="text-(--ui-info)" />
                        ) : (
                          <FaToggleOff className="text-(--ui-muted-foreground)" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Notification Types */}
                <div>
                  <h3 className="mb-4 text-lg font-semibold text-(--ui-foreground)">{t('doctorSettings.notifications.typesTitle')}</h3>
                  <div className="space-y-3">
                    {[
                      {
                        key: "newAppointment",
                        label: t('doctorSettings.notifications.newAppointment'),
                        desc: t('doctorSettings.notifications.typeDesc.newAppointment'),
                      },
                      {
                        key: "appointmentReminder",
                        label: t('doctorSettings.notifications.appointmentReminder'),
                        desc: t('doctorSettings.notifications.typeDesc.appointmentReminder'),
                      },
                      {
                        key: "patientMessages",
                        label: t('doctorSettings.notifications.patientMessages'),
                        desc: t('doctorSettings.notifications.typeDesc.patientMessages'),
                      },
                      {
                        key: "systemUpdates",
                        label: t('doctorSettings.notifications.systemUpdates'),
                        desc: t('doctorSettings.notifications.typeDesc.systemUpdates'),
                      },
                    ].map((item) => (
                      <div
                        key={item.key}
                        className="flex items-center justify-between rounded-lg border border-(--ui-border) bg-(--ui-surface-2) p-4"
                      >
                        <div>
                          <p className="font-medium text-(--ui-foreground)">{item.label}</p>
                          <p className="text-sm text-(--ui-muted-foreground)">{item.desc}</p>
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
                            <FaToggleOn className="text-(--ui-info)" />
                          ) : (
                            <FaToggleOff className="text-(--ui-muted-foreground)" />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={handleSaveNotifications}
                className="mt-6 flex items-center gap-2 rounded-lg btn-gradient px-6 py-3 font-medium text-white transition-all focus:outline-none focus:ring-2 focus:ring-(--ui-ring)/30"
              >
                <FaSave />
                {t('doctorSettings.notifications.saveButton')}
              </button>
            </div>
          )}

          {/* Security Settings */}
          {activeTab === "security" && (
            <div className="card-glass rounded-xl p-8 shadow-(--shadow-soft) border border-(--ui-border)">
              <div className="mb-6 flex items-center gap-3">
                <FaLock className="text-2xl text-(--ui-info)" />
                <h2 className="text-2xl font-bold text-(--ui-foreground)">{t('doctorSettings.change_password')}</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="mb-2 block text-sm font-medium text-(--ui-muted-foreground)">
                    {t('doctorSettings.current_password')}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword.current ? "text" : "password"}
                      value={security.currentPassword}
                      onChange={(e) =>
                        setSecurity({ ...security, currentPassword: e.target.value })
                      }
                      className="w-full rounded-lg border border-(--ui-border) bg-(--ui-surface) px-4 py-3 pr-12 text-(--ui-foreground) focus:border-(--ui-ring) focus:outline-none focus:ring-2 focus:ring-(--ui-ring)/20"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword({ ...showPassword, current: !showPassword.current })
                      }
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-(--ui-muted-foreground) hover:text-(--ui-foreground)"
                    >
                      {showPassword.current ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-(--ui-muted-foreground)">
                    {t('doctorSettings.new_password')}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword.new ? "text" : "password"}
                      value={security.newPassword}
                      onChange={(e) => setSecurity({ ...security, newPassword: e.target.value })}
                      className="w-full rounded-lg border border-(--ui-border) bg-(--ui-surface) px-4 py-3 pr-12 text-(--ui-foreground) focus:border-(--ui-ring) focus:outline-none focus:ring-2 focus:ring-(--ui-ring)/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword({ ...showPassword, new: !showPassword.new })}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-(--ui-muted-foreground) hover:text-(--ui-foreground)"
                    >
                      {showPassword.new ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  <p className="mt-1 text-sm text-(--ui-muted-foreground)">{t('doctorSettings.security_min_length')}</p>
                  <p className="mt-1 text-sm text-(--ui-muted-foreground)">{t('doctorSettings.security_min_length')}</p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-(--ui-muted-foreground)">
                    {t('doctorSettings.confirm_password')}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword.confirm ? "text" : "password"}
                      value={security.confirmPassword}
                      onChange={(e) =>
                        setSecurity({ ...security, confirmPassword: e.target.value })
                      }
                      className="w-full rounded-lg border border-(--ui-border) bg-(--ui-surface) px-4 py-3 pr-12 text-(--ui-foreground) focus:border-(--ui-ring) focus:outline-none focus:ring-2 focus:ring-(--ui-ring)/20"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword({ ...showPassword, confirm: !showPassword.confirm })
                      }
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-(--ui-muted-foreground) hover:text-(--ui-foreground)"
                    >
                      {showPassword.confirm ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>
              </div>

              <button
                onClick={handleChangePassword}
                className="mt-6 flex items-center gap-2 rounded-lg btn-gradient px-6 py-3 font-medium text-white transition-all focus:outline-none focus:ring-2 focus:ring-(--ui-ring)/30"
              >
                <FaLock />
                {t('doctorSettings.change_password')}
              </button>
            </div>
          )}
        </div>
      </div>
    </DoctorLayout>
  );
}
