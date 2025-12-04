"use client";
import { useState } from "react";
import AdminLayout from "../AdminLayout";
import { useToast } from "../../components/ui/Toast";
import {
  FaGear,
  FaBell,
  FaLock,
  FaUsers,
  FaShieldHalved,
  FaFloppyDisk,
  FaCheck,
  FaEnvelope,
  FaPhone,
  FaToggleOn,
  FaToggleOff,
} from "react-icons/fa6";


export default function SettingsPage() {
  const { showToast, ToastContainer } = useToast();

  // State
  const [activeTab, setActiveTab] = useState("system");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);

  // System Settings
  const [systemSettings, setSystemSettings] = useState({
    hospitalName: "مركز التشخيص الطبي",
    hospitalEmail: "info@hospital.com",
    hospitalPhone: "+966 12 3456789",
    address: "الرياض، المملكة العربية السعودية",
    licenseNumber: "LIC-2023-001",
    website: "www.hospital.com",
    supportEmail: "support@hospital.com",
    timezone: "Asia/Riyadh",
    language: "ar",
    maintenanceMode: false,
    autoBackup: true,
    backupFrequency: "daily",
    maxUploadSize: "500",
    sessionTimeout: "30",
  });

  // Notification Settings
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    newUserAlert: true,
    appointmentReminder: true,
    reportReady: true,
    systemAlert: true,
    monthlyReport: false,
  });

  // Role Permissions
  const [rolePermissions, setRolePermissions] = useState({
    admin: {
      viewDashboard: true,
      manageUsers: true,
      managePatients: true,
      manageDoctors: true,
      viewReports: true,
      manageSettings: true,
      viewAnalytics: true,
      manageRoles: true,
    },
    doctor: {
      viewDashboard: true,
      managePatients: true,
      viewReports: true,
      manageSettings: false,
      viewAnalytics: false,
      manageRoles: false,
      uploadAnalysis: true,
    },
    patient: {
      viewDashboard: true,
      viewReports: true,
      bookAppointment: true,
      viewAnalytics: false,
      manageSettings: false,
      viewChat: true,
    },
  });

  // Tabs Configuration
  const tabs = [
    { id: "system", label: "إعدادات النظام", icon: FaGear },
    { id: "notifications", label: "الإشعارات", icon: FaBell },
    { id: "permissions", label: "الصلاحيات", icon: FaShieldHalved },
    { id: "security", label: "الأمان", icon: FaLock },
  ];

  // Event Handlers
  const handleSystemSettingChange = (field, value) => {
    setSystemSettings({ ...systemSettings, [field]: value });
  };

  const handleNotificationChange = (field) => {
    setNotifications({ ...notifications, [field]: !notifications[field] });
  };

  const handlePermissionChange = (role, permission) => {
    setRolePermissions({
      ...rolePermissions,
      [role]: {
        ...rolePermissions[role],
        [permission]: !rolePermissions[role][permission],
      },
    });
  };

  const handleSaveSettings = () => {
    setShowSaveModal(true);
  };

  const confirmSave = () => {
    showToast("تم حفظ الإعدادات بنجاح", "success");
    setShowSaveModal(false);
  };

  return (
    <AdminLayout breadcrumbs={["الرئيسية", "الإعدادات"]}>
      <ToastContainer />
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <FaGear className="text-4xl text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">إعدادات النظام</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">إدارة إعدادات النظام والإشعارات والصلاحيات</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {tabs.map((tab) => {
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? "bg-blue-600 text-white"
                    : "bg-white dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700"
                }`}
              >
                <TabIcon />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* System Settings Tab */}
        {activeTab === "system" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Hospital Information */}
              <div className="md:col-span-2 bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-slate-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">معلومات المستشفى</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">اسم المستشفى</label>
                    <input
                      type="text"
                      value={systemSettings.hospitalName}
                      onChange={(e) => handleSystemSettingChange("hospitalName", e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">رقم الترخيص</label>
                    <input
                      type="text"
                      value={systemSettings.licenseNumber}
                      onChange={(e) => handleSystemSettingChange("licenseNumber", e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <FaEnvelope className="text-gray-400" />
                    <input
                      type="email"
                      value={systemSettings.hospitalEmail}
                      onChange={(e) => handleSystemSettingChange("hospitalEmail", e.target.value)}
                      placeholder="البريد الإلكتروني"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <FaPhone className="text-gray-400" />
                    <input
                      type="tel"
                      value={systemSettings.hospitalPhone}
                      onChange={(e) => handleSystemSettingChange("hospitalPhone", e.target.value)}
                      placeholder="رقم الهاتف"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">العنوان</label>
                    <input
                      type="text"
                      value={systemSettings.address}
                      onChange={(e) => handleSystemSettingChange("address", e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* System Configuration */}
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-slate-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">إعدادات النظام</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">المنطقة الزمنية</label>
                    <select
                      value={systemSettings.timezone}
                      onChange={(e) => handleSystemSettingChange("timezone", e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white"
                    >
                      <option value="Asia/Riyadh">آسيا/الرياض</option>
                      <option value="Asia/Dubai">آسيا/دبي</option>
                      <option value="Africa/Cairo">أفريقيا/القاهرة</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">اللغة</label>
                    <select
                      value={systemSettings.language}
                      onChange={(e) => handleSystemSettingChange("language", e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white"
                    >
                      <option value="ar">العربية</option>
                      <option value="en">الإنجليزية</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">مهلة انتهاء الجلسة (دقيقة)</label>
                    <input
                      type="number"
                      value={systemSettings.sessionTimeout}
                      onChange={(e) => handleSystemSettingChange("sessionTimeout", e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Backup Settings */}
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-slate-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">إعدادات النسخ الاحتياطي</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-900 rounded-lg">
                    <span className="text-gray-700 dark:text-gray-300">تفعيل النسخ الاحتياطي التلقائي</span>
                    <button
                      onClick={() => handleSystemSettingChange("autoBackup", !systemSettings.autoBackup)}
                      className={`p-2 rounded-lg transition-colors ${
                        systemSettings.autoBackup ? "bg-green-100 text-green-600" : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {systemSettings.autoBackup ? <FaToggleOn className="text-2xl" /> : <FaToggleOff className="text-2xl" />}
                    </button>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">تكرار النسخ</label>
                    <select
                      value={systemSettings.backupFrequency}
                      onChange={(e) => handleSystemSettingChange("backupFrequency", e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white"
                    >
                      <option value="daily">يومي</option>
                      <option value="weekly">أسبوعي</option>
                      <option value="monthly">شهري</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Upload Settings */}
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-slate-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">إعدادات التحميل</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">أقصى حجم للملف (MB)</label>
                  <input
                    type="number"
                    value={systemSettings.maxUploadSize}
                    onChange={(e) => handleSystemSettingChange("maxUploadSize", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white"
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">الحد الأقصى الموصى به: 500 MB</p>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                onClick={handleSaveSettings}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors font-medium"
              >
                <FaFloppyDisk />
                <span>حفظ الإعدادات</span>
              </button>
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === "notifications" && (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-slate-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">إعدادات الإشعارات</h3>
            <div className="space-y-4">
              {/* Channel Settings */}
              <div className="p-4 bg-gray-50 dark:bg-slate-900 rounded-lg">
                <h4 className="font-bold text-gray-900 dark:text-white mb-4">قنوات الإشعار</h4>
                {[
                  { key: "emailNotifications", label: "إشعارات البريد الإلكتروني" },
                  { key: "smsNotifications", label: "إشعارات الرسائل النصية" },
                  { key: "pushNotifications", label: "إشعارات الضغط" },
                ].map((channel) => (
                  <div key={channel.key} className="flex items-center justify-between p-3 mb-2">
                    <span className="text-gray-700 dark:text-gray-300">{channel.label}</span>
                    <button
                      onClick={() => handleNotificationChange(channel.key)}
                      className={`p-2 rounded-lg transition-colors ${
                        notifications[channel.key] ? "bg-green-100 text-green-600" : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {notifications[channel.key] ? <FaToggleOn className="text-2xl" /> : <FaToggleOff className="text-2xl" />}
                    </button>
                  </div>
                ))}
              </div>

              {/* Event Notifications */}
              <div className="p-4 bg-gray-50 dark:bg-slate-900 rounded-lg">
                <h4 className="font-bold text-gray-900 dark:text-white mb-4">إشعارات الأحداث</h4>
                {[
                  { key: "newUserAlert", label: "تنبيهات المستخدمين الجدد" },
                  { key: "appointmentReminder", label: "تذكيرات المواعيد" },
                  { key: "reportReady", label: "التقارير الجاهزة" },
                  { key: "systemAlert", label: "تنبيهات النظام" },
                  { key: "monthlyReport", label: "التقرير الشهري" },
                ].map((event) => (
                  <div key={event.key} className="flex items-center justify-between p-3 mb-2">
                    <span className="text-gray-700 dark:text-gray-300">{event.label}</span>
                    <button
                      onClick={() => handleNotificationChange(event.key)}
                      className={`p-2 rounded-lg transition-colors ${
                        notifications[event.key] ? "bg-green-100 text-green-600" : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {notifications[event.key] ? <FaToggleOn className="text-2xl" /> : <FaToggleOff className="text-2xl" />}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSaveSettings}
              className="w-full mt-6 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors font-medium"
            >
              <FaFloppyDisk />
              <span>حفظ إعدادات الإشعارات</span>
            </button>
          </div>
        )}

        {/* Permissions Tab */}
        {activeTab === "permissions" && (
          <div className="space-y-6">
            {Object.entries(rolePermissions).map(([role, permissions]) => (
              <div key={role} className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-slate-700">
                <div className="flex items-center gap-3 mb-6">
                  <FaUsers className="text-2xl text-blue-600" />
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {role === "admin" ? "مدير" : role === "doctor" ? "طبيب" : "مريض"}
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(permissions).map(([permission, value]) => (
                    <div key={permission} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-900 rounded-lg">
                      <span className="text-gray-700 dark:text-gray-300">{permission}</span>
                      <button
                        onClick={() => handlePermissionChange(role, permission)}
                        className={`p-2 rounded-lg transition-colors ${
                          value ? "bg-green-100 text-green-600" : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {value ? <FaCheck className="text-xl" /> : "✕"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Save Button */}
            <button
              onClick={handleSaveSettings}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors font-medium"
            >
              <FaFloppyDisk />
              <span>حفظ الصلاحيات</span>
            </button>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === "security" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-3">
                <FaShieldHalved className="text-2xl text-blue-600 shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-blue-900 dark:text-blue-100 mb-2">نصائح الأمان</h4>
                  <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                    <li>• تحديث كلمات المرور بانتظام</li>
                    <li>• استخدام المصادقة الثنائية</li>
                    <li>• عمل نسخ احتياطية دورية</li>
                    <li>• مراقبة سجلات الدخول</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-slate-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">إعدادات المصادقة</h3>
              <div className="space-y-3">
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-sm text-green-700 dark:text-green-300">✓ المصادقة الثنائية: مفعلة</p>
                </div>
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-sm text-green-700 dark:text-green-300">✓ التشفير: مفعل</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-slate-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">حد المحاولات</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">عدد محاولات الدخول الفاشلة المسموحة</label>
                  <input type="number" defaultValue="5" className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">مدة الحظر (دقيقة)</label>
                  <input type="number" defaultValue="30" className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Save Confirmation Modal */}
        {showSaveModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-md w-full p-6">
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">💾</div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">تأكيد الحفظ</h3>
                <p className="text-gray-600 dark:text-gray-400">هل تريد حفظ التغييرات التي أجريتها؟</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={confirmSave}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg transition-colors font-medium"
                >
                  نعم، احفظ
                </button>
                <button
                  onClick={() => setShowSaveModal(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-lg transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
