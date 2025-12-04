"use client";

import DoctorLayout from "../DoctorLayout";
import { useToast } from "@/app/components/ui/Toast";
import { useState } from "react";
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

export default function DoctorSettingsPage() {
  const { showToast, ToastContainer } = useToast();

  // Profile Settings
  const [profile, setProfile] = useState({
    name: "د. أحمد محمد",
    specialty: "أخصائي الأشعة التشخيصية",
    email: "dr.ahmed@hospital.com",
    phone: "+966 50 123 4567",
    bio: "خبرة 15 عاماً في مجال الأشعة التشخيصية والتصوير الطبي",
    licenseNumber: "MED-2024-15678",
  });

  // Availability Settings
  const [availability, setAvailability] = useState({
    workDays: ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس"],
    startTime: "08:00",
    endTime: "16:00",
    slotDuration: "30",
    maxPatients: "20",
  });

  // Notification Settings
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    newAppointment: true,
    appointmentReminder: true,
    patientMessages: true,
    systemUpdates: false,
  });

  // Security Settings
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
    showToast("تم حفظ معلومات الملف الشخصي بنجاح", "success");
  };

  const handleSaveAvailability = () => {
    showToast("تم تحديث أوقات العمل بنجاح", "success");
  };

  const handleSaveNotifications = () => {
    showToast("تم حفظ إعدادات الإشعارات بنجاح", "success");
  };

  const handleChangePassword = () => {
    if (!security.currentPassword || !security.newPassword || !security.confirmPassword) {
      showToast("يرجى ملء جميع حقول كلمة المرور", "error");
      return;
    }
    if (security.newPassword !== security.confirmPassword) {
      showToast("كلمة المرور الجديدة غير متطابقة", "error");
      return;
    }
    if (security.newPassword.length < 8) {
      showToast("كلمة المرور يجب أن تكون 8 أحرف على الأقل", "error");
      return;
    }
    showToast("تم تغيير كلمة المرور بنجاح", "success");
    setSecurity({ currentPassword: "", newPassword: "", confirmPassword: "" });
  };

  const tabs = [
    { id: "profile", label: "الملف الشخصي", icon: FaUser },
    { id: "availability", label: "أوقات العمل", icon: FaClock },
    { id: "notifications", label: "الإشعارات", icon: FaBell },
    { id: "security", label: "الأمان", icon: FaLock },
  ];

  return (
    <DoctorLayout>
      <ToastContainer />
      <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-blue-50 p-6">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <FaUserMd className="text-blue-600" />
              إعدادات الحساب
            </h1>
            <p className="mt-2 text-gray-600">إدارة معلومات حسابك وتفضيلاتك</p>
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
                <h2 className="text-2xl font-bold text-gray-900">المعلومات الشخصية</h2>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    <FaUser className="inline ml-2" />
                    الاسم الكامل
                  </label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    <FaStethoscope className="inline ml-2" />
                    التخصص
                  </label>
                  <input
                    type="text"
                    value={profile.specialty}
                    onChange={(e) => setProfile({ ...profile, specialty: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    <FaEnvelope className="inline ml-2" />
                    البريد الإلكتروني
                  </label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    <FaPhone className="inline ml-2" />
                    رقم الهاتف
                  </label>
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    رقم الترخيص الطبي
                  </label>
                  <input
                    type="text"
                    value={profile.licenseNumber}
                    onChange={(e) => setProfile({ ...profile, licenseNumber: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-gray-700">نبذة مختصرة</label>
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
                حفظ التغييرات
              </button>
            </div>
          )}

          {/* Availability Settings */}
          {activeTab === "availability" && (
            <div className="rounded-xl bg-white p-8 shadow-lg border border-gray-100">
              <div className="mb-6 flex items-center gap-3">
                <FaClock className="text-2xl text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">أوقات العمل والمواعيد</h2>
              </div>

              <div className="space-y-6">
                {/* Work Days */}
                <div>
                  <label className="mb-3 block text-sm font-medium text-gray-700">
                    <FaCalendarAlt className="inline ml-2" />
                    أيام العمل
                  </label>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-7">
                    {["السبت", "الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"].map(
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
                    <label className="mb-2 block text-sm font-medium text-gray-700">وقت البدء</label>
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
                    <label className="mb-2 block text-sm font-medium text-gray-700">وقت الانتهاء</label>
                    <input
                      type="time"
                      value={availability.endTime}
                      onChange={(e) => setAvailability({ ...availability, endTime: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      مدة الموعد (بالدقائق)
                    </label>
                    <select
                      value={availability.slotDuration}
                      onChange={(e) =>
                        setAvailability({ ...availability, slotDuration: e.target.value })
                      }
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value="15">15 دقيقة</option>
                      <option value="30">30 دقيقة</option>
                      <option value="45">45 دقيقة</option>
                      <option value="60">60 دقيقة</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      الحد الأقصى للمرضى يومياً
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
                حفظ أوقات العمل
              </button>
            </div>
          )}

          {/* Notifications Settings */}
          {activeTab === "notifications" && (
            <div className="rounded-xl bg-white p-8 shadow-lg border border-gray-100">
              <div className="mb-6 flex items-center gap-3">
                <FaBell className="text-2xl text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">تفضيلات الإشعارات</h2>
              </div>

              <div className="space-y-6">
                {/* General Notification Methods */}
                <div>
                  <h3 className="mb-4 text-lg font-semibold text-gray-900">طرق التواصل</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-4">
                      <div className="flex items-center gap-3">
                        <FaEnvelope className="text-xl text-blue-600" />
                        <div>
                          <p className="font-medium text-gray-900">إشعارات البريد الإلكتروني</p>
                          <p className="text-sm text-gray-600">
                            استلام الإشعارات عبر البريد الإلكتروني
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
                          <p className="font-medium text-gray-900">إشعارات الرسائل القصيرة</p>
                          <p className="text-sm text-gray-600">استلام الإشعارات عبر SMS</p>
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
                          <p className="font-medium text-gray-900">الإشعارات الفورية</p>
                          <p className="text-sm text-gray-600">استلام الإشعارات داخل التطبيق</p>
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
                  <h3 className="mb-4 text-lg font-semibold text-gray-900">أنواع الإشعارات</h3>
                  <div className="space-y-3">
                    {[
                      { key: "newAppointment", label: "موعد جديد", desc: "عند حجز موعد جديد" },
                      {
                        key: "appointmentReminder",
                        label: "تذكير بالموعد",
                        desc: "قبل الموعد بساعة",
                      },
                      {
                        key: "patientMessages",
                        label: "رسائل المرضى",
                        desc: "عند استلام رسالة جديدة",
                      },
                      {
                        key: "systemUpdates",
                        label: "تحديثات النظام",
                        desc: "إشعارات حول التحديثات",
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
                حفظ الإعدادات
              </button>
            </div>
          )}

          {/* Security Settings */}
          {activeTab === "security" && (
            <div className="rounded-xl bg-white p-8 shadow-lg border border-gray-100">
              <div className="mb-6 flex items-center gap-3">
                <FaLock className="text-2xl text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">الأمان وكلمة المرور</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    كلمة المرور الحالية
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
                    كلمة المرور الجديدة
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
                  <p className="mt-1 text-sm text-gray-600">يجب أن تكون 8 أحرف على الأقل</p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    تأكيد كلمة المرور الجديدة
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

                <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
                  <h4 className="mb-2 font-medium text-blue-900">نصائح الأمان:</h4>
                  <ul className="space-y-1 text-sm text-blue-800">
                    <li>• استخدم كلمة مرور قوية تحتوي على أحرف وأرقام ورموز</li>
                    <li>• لا تشارك كلمة المرور مع أي شخص</li>
                    <li>• قم بتغيير كلمة المرور بشكل دوري</li>
                    <li>• لا تستخدم نفس كلمة المرور لحسابات مختلفة</li>
                  </ul>
                </div>
              </div>

              <button
                onClick={handleChangePassword}
                className="mt-6 flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-all hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <FaLock />
                تغيير كلمة المرور
              </button>
            </div>
          )}
        </div>
      </div>
    </DoctorLayout>
  );
}
