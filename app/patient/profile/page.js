"use client";

import { useState } from "react";
import { useToast } from "@/app/components/ui/Toast";
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCalendarAlt, FaIdCard, FaHeartbeat, FaWeight, FaRuler, FaAllergies, FaNotesMedical, FaEdit, FaSave, FaTimes, FaBell, FaLock, FaLanguage, FaMoon, FaEye, FaEyeSlash } from "react-icons/fa";

export default function PatientProfilePage() {
  const { showToast, ToastContainer } = useToast();
  
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [profileData, setProfileData] = useState({
    fullName: "أحمد محمد علي",
    email: "ahmed.ali@example.com",
    phone: "0501234567",
    birthDate: "1983-05-15",
    gender: "ذكر",
    nationalId: "1234567890",
    address: "الرياض، حي النخيل، شارع الملك فهد",
    bloodType: "O+",
    height: "175",
    weight: "72",
    emergencyContactName: "فاطمة علي",
    emergencyContactPhone: "0509876543",
    emergencyContactRelation: "زوجة"
  });

  const [healthData, setHealthData] = useState({
    allergies: ["حساسية الغبار", "حساسية البنسلين"],
    chronicDiseases: ["ضغط الدم المرتفع"],
    medications: ["أملوديبين 5mg - مرة يومياً"],
    surgeries: ["استئصال الزائدة الدودية - 2015"],
    familyHistory: ["السكري (الأب)", "ضغط الدم (الأم)"]
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: true,
    pushNotifications: true,
    appointmentReminders: true,
    reportUpdates: true,
    medicationReminders: true,
    healthTips: false
  });

  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const calculateBMI = () => {
    const heightM = parseFloat(profileData.height) / 100;
    const weightKg = parseFloat(profileData.weight);
    const bmi = (weightKg / (heightM * heightM)).toFixed(1);
    return bmi;
  };

  const getBMIStatus = () => {
    const bmi = parseFloat(calculateBMI());
    if (bmi < 18.5) return { text: "نحيف", color: "text-blue-600" };
    if (bmi < 25) return { text: "طبيعي", color: "text-green-600" };
    if (bmi < 30) return { text: "زيادة وزن", color: "text-orange-600" };
    return { text: "سمنة", color: "text-red-600" };
  };

  const handleSaveProfile = () => {
    setIsEditing(false);
    showToast("تم حفظ التغييرات بنجاح", "success");
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    showToast("تم إلغاء التعديلات", "info");
  };

  const handleChangePassword = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast("كلمات المرور غير متطابقة", "error");
      return;
    }
    if (passwordData.newPassword.length < 8) {
      showToast("كلمة المرور يجب أن تكون 8 أحرف على الأقل", "error");
      return;
    }
    showToast("تم تغيير كلمة المرور بنجاح", "success");
    setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
  };

  const handleNotificationToggle = (key) => {
    setNotificationSettings({ ...notificationSettings, [key]: !notificationSettings[key] });
    showToast("تم تحديث إعدادات الإشعارات", "success");
  };

  const bmiStatus = getBMIStatus();

  return (
    <>
      <ToastContainer />
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">الحساب الشخصي</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">إدارة معلوماتك الشخصية والصحية</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 mb-8 border border-gray-200 dark:border-slate-700">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-linear-to-br from-blue-400 to-purple-600 flex items-center justify-center text-white text-4xl font-bold">
              {profileData.fullName.split(" ").map(n => n[0]).slice(0, 2).join("")}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{profileData.fullName}</h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">رقم المريض: {profileData.nationalId}</p>
              <div className="flex items-center gap-4 mt-3">
                <span className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <FaEnvelope className="text-blue-500" />
                  {profileData.email}
                </span>
                <span className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <FaPhone className="text-green-500" />
                  {profileData.phone}
                </span>
              </div>
            </div>
            <div className="text-left">
              <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-4 py-2 rounded-full text-sm font-medium mb-2">
                حساب نشط
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">عضو منذ 2020</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 mb-8">
          <div className="flex border-b border-gray-200 dark:border-slate-700">
            <button
              onClick={() => setActiveTab("profile")}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === "profile"
                  ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <FaUser className="inline ml-2" />
              المعلومات الشخصية
            </button>
            <button
              onClick={() => setActiveTab("health")}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === "health"
                  ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <FaHeartbeat className="inline ml-2" />
              المعلومات الصحية
            </button>
            <button
              onClick={() => setActiveTab("notifications")}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === "notifications"
                  ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <FaBell className="inline ml-2" />
              الإشعارات
            </button>
            <button
              onClick={() => setActiveTab("security")}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === "security"
                  ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <FaLock className="inline ml-2" />
              الأمان
            </button>
          </div>

          <div className="p-6">
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">المعلومات الشخصية</h3>
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      <FaEdit />
                      <span>تعديل</span>
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveProfile}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        <FaSave />
                        <span>حفظ</span>
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        <FaTimes />
                        <span>إلغاء</span>
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <FaUser className="inline ml-2 text-blue-500" />
                      الاسم الكامل
                    </label>
                    <input
                      type="text"
                      value={profileData.fullName}
                      onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white disabled:opacity-60"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <FaEnvelope className="inline ml-2 text-green-500" />
                      البريد الإلكتروني
                    </label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white disabled:opacity-60"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <FaPhone className="inline ml-2 text-orange-500" />
                      رقم الجوال
                    </label>
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white disabled:opacity-60"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <FaCalendarAlt className="inline ml-2 text-purple-500" />
                      تاريخ الميلاد
                    </label>
                    <input
                      type="date"
                      value={profileData.birthDate}
                      onChange={(e) => setProfileData({ ...profileData, birthDate: e.target.value })}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white disabled:opacity-60"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <FaIdCard className="inline ml-2 text-red-500" />
                      رقم الهوية
                    </label>
                    <input
                      type="text"
                      value={profileData.nationalId}
                      onChange={(e) => setProfileData({ ...profileData, nationalId: e.target.value })}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white disabled:opacity-60"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <FaHeartbeat className="inline ml-2 text-pink-500" />
                      فصيلة الدم
                    </label>
                    <select
                      value={profileData.bloodType}
                      onChange={(e) => setProfileData({ ...profileData, bloodType: e.target.value })}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white disabled:opacity-60"
                    >
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <FaMapMarkerAlt className="inline ml-2 text-blue-500" />
                      العنوان
                    </label>
                    <input
                      type="text"
                      value={profileData.address}
                      onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                      disabled={!isEditing}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white disabled:opacity-60"
                    />
                  </div>
                </div>

                {/* Body Measurements */}
                <div className="border-t border-gray-200 dark:border-slate-700 pt-6 mt-6">
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">القياسات الجسدية</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <FaRuler className="inline ml-2 text-blue-500" />
                        الطول (سم)
                      </label>
                      <input
                        type="number"
                        value={profileData.height}
                        onChange={(e) => setProfileData({ ...profileData, height: e.target.value })}
                        disabled={!isEditing}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white disabled:opacity-60"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <FaWeight className="inline ml-2 text-green-500" />
                        الوزن (كجم)
                      </label>
                      <input
                        type="number"
                        value={profileData.weight}
                        onChange={(e) => setProfileData({ ...profileData, weight: e.target.value })}
                        disabled={!isEditing}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white disabled:opacity-60"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        مؤشر كتلة الجسم (BMI)
                      </label>
                      <div className="px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-100 dark:bg-slate-800">
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">{calculateBMI()}</span>
                        <span className={`mr-2 text-sm font-medium ${bmiStatus.color}`}>({bmiStatus.text})</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Emergency Contact */}
                <div className="border-t border-gray-200 dark:border-slate-700 pt-6 mt-6">
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">جهة الاتصال الطارئة</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">الاسم</label>
                      <input
                        type="text"
                        value={profileData.emergencyContactName}
                        onChange={(e) => setProfileData({ ...profileData, emergencyContactName: e.target.value })}
                        disabled={!isEditing}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white disabled:opacity-60"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">رقم الجوال</label>
                      <input
                        type="tel"
                        value={profileData.emergencyContactPhone}
                        onChange={(e) => setProfileData({ ...profileData, emergencyContactPhone: e.target.value })}
                        disabled={!isEditing}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white disabled:opacity-60"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">صلة القرابة</label>
                      <input
                        type="text"
                        value={profileData.emergencyContactRelation}
                        onChange={(e) => setProfileData({ ...profileData, emergencyContactRelation: e.target.value })}
                        disabled={!isEditing}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white disabled:opacity-60"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Health Tab */}
            {activeTab === "health" && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">المعلومات الصحية</h3>

                <div className="space-y-6">
                  <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                    <h4 className="font-bold text-red-900 dark:text-red-300 mb-3 flex items-center gap-2">
                      <FaAllergies />
                      الحساسية
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {healthData.allergies.map((allergy, idx) => (
                        <span key={idx} className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-3 py-1 rounded-full text-sm">
                          {allergy}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
                    <h4 className="font-bold text-orange-900 dark:text-orange-300 mb-3 flex items-center gap-2">
                      <FaNotesMedical />
                      الأمراض المزمنة
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {healthData.chronicDiseases.map((disease, idx) => (
                        <span key={idx} className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-3 py-1 rounded-full text-sm">
                          {disease}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                    <h4 className="font-bold text-blue-900 dark:text-blue-300 mb-3">الأدوية الحالية</h4>
                    <ul className="space-y-2">
                      {healthData.medications.map((med, idx) => (
                        <li key={idx} className="text-blue-700 dark:text-blue-300 flex items-start gap-2">
                          <span>💊</span>
                          <span>{med}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                    <h4 className="font-bold text-purple-900 dark:text-purple-300 mb-3">العمليات الجراحية السابقة</h4>
                    <ul className="space-y-2">
                      {healthData.surgeries.map((surgery, idx) => (
                        <li key={idx} className="text-purple-700 dark:text-purple-300 flex items-start gap-2">
                          <span>🏥</span>
                          <span>{surgery}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                    <h4 className="font-bold text-green-900 dark:text-green-300 mb-3">التاريخ العائلي</h4>
                    <ul className="space-y-2">
                      {healthData.familyHistory.map((history, idx) => (
                        <li key={idx} className="text-green-700 dark:text-green-300 flex items-start gap-2">
                          <span>👨‍👩‍👦</span>
                          <span>{history}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === "notifications" && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">إعدادات الإشعارات</h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-900 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">إشعارات البريد الإلكتروني</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">استلام الإشعارات عبر البريد</p>
                    </div>
                    <button
                      onClick={() => handleNotificationToggle("emailNotifications")}
                      className={`w-14 h-7 rounded-full transition-colors ${
                        notificationSettings.emailNotifications ? "bg-blue-600" : "bg-gray-300"
                      }`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                        notificationSettings.emailNotifications ? "translate-x-8" : "translate-x-1"
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-900 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">إشعارات الرسائل النصية</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">استلام الإشعارات عبر SMS</p>
                    </div>
                    <button
                      onClick={() => handleNotificationToggle("smsNotifications")}
                      className={`w-14 h-7 rounded-full transition-colors ${
                        notificationSettings.smsNotifications ? "bg-blue-600" : "bg-gray-300"
                      }`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                        notificationSettings.smsNotifications ? "translate-x-8" : "translate-x-1"
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-900 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">الإشعارات الفورية</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">استلام إشعارات التطبيق</p>
                    </div>
                    <button
                      onClick={() => handleNotificationToggle("pushNotifications")}
                      className={`w-14 h-7 rounded-full transition-colors ${
                        notificationSettings.pushNotifications ? "bg-blue-600" : "bg-gray-300"
                      }`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                        notificationSettings.pushNotifications ? "translate-x-8" : "translate-x-1"
                      }`} />
                    </button>
                  </div>

                  <div className="border-t border-gray-200 dark:border-slate-700 pt-4 mt-4">
                    <h4 className="font-bold text-gray-900 dark:text-white mb-4">تفضيلات الإشعارات</h4>
                    
                    <div className="space-y-3">
                      {[
                        { key: "appointmentReminders", label: "تذكير بالمواعيد" },
                        { key: "reportUpdates", label: "تحديثات التقارير" },
                        { key: "medicationReminders", label: "تذكير بالأدوية" },
                        { key: "healthTips", label: "نصائح صحية" }
                      ].map((item) => (
                        <div key={item.key} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-900 rounded-lg">
                          <span className="text-gray-900 dark:text-white">{item.label}</span>
                          <button
                            onClick={() => handleNotificationToggle(item.key)}
                            className={`w-12 h-6 rounded-full transition-colors ${
                              notificationSettings[item.key] ? "bg-green-600" : "bg-gray-300"
                            }`}
                          >
                            <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                              notificationSettings[item.key] ? "translate-x-7" : "translate-x-1"
                            }`} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === "security" && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">الأمان وكلمة المرور</h3>

                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
                  <h4 className="font-bold text-blue-900 dark:text-blue-300 mb-2">نصائح لكلمة مرور قوية:</h4>
                  <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                    <li>✓ استخدم 8 أحرف على الأقل</li>
                    <li>✓ اجمع بين الأحرف الكبيرة والصغيرة</li>
                    <li>✓ أضف أرقاماً ورموزاً خاصة</li>
                    <li>✓ تجنب استخدام معلومات شخصية</li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      كلمة المرور الحالية
                    </label>
                    <div className="relative">
                      <input
                        type={showOldPassword ? "text" : "password"}
                        value={passwordData.oldPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowOldPassword(!showOldPassword)}
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                      >
                        {showOldPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      كلمة المرور الجديدة
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                      >
                        {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      تأكيد كلمة المرور
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white pr-12"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                      >
                        {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleChangePassword}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors font-medium"
                  >
                    تغيير كلمة المرور
                  </button>
                </div>

                <div className="border-t border-gray-200 dark:border-slate-700 pt-6 mt-6">
                  <h4 className="font-bold text-gray-900 dark:text-white mb-4">الجلسات النشطة</h4>
                  <div className="space-y-3">
                    <div className="p-4 bg-gray-50 dark:bg-slate-900 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">💻 Windows - Chrome</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">الرياض، السعودية - نشط الآن</p>
                        </div>
                        <span className="text-green-600 text-sm">الجهاز الحالي</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
