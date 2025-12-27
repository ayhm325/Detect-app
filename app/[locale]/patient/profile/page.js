
"use client";

import { useState, useEffect } from "react";
import { useToast } from "../../../components/ui/Toast";
import { useTranslations, useLocale } from "next-intl";
import { FaUser, FaEnvelope, FaPhone } from "react-icons/fa";

export default function PatientProfilePage() {
    // ...existing code...
  const locale = useLocale();
  const t = useTranslations("profile");
  const { showToast, ToastContainer } = useToast();
  
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const labels = {
    pageTitle: t("pageTitle", { defaultValue: "Profile" }),
    pageSubtitle: t("pageSubtitle", { defaultValue: "Your profile details" }),
    activeNow: t("activeNow", { defaultValue: "Active now" }),
    btnEdit: t("btnEdit", { defaultValue: "Edit" }),
    btnSave: t("btnSave", { defaultValue: "Save" }),
    btnCancel: t("btnCancel", { defaultValue: "Cancel" }),
    toastSaveSuccess: t("toastSaveSuccess", { defaultValue: "Saved successfully" }),
    toastCancelEdit: t("toastCancelEdit", { defaultValue: "Edit cancelled" }),
    toastPasswordMismatch: t("toastPasswordMismatch", { defaultValue: "Passwords do not match" }),
    toastPasswordLength: t("toastPasswordLength", { defaultValue: "Password too short" }),
    toastPasswordChanged: t("toastPasswordChanged", { defaultValue: "Password changed" }),
    toastNotificationUpdated: t("toastNotificationUpdated", { defaultValue: "Notification updated" }),
    // Common UI labels for fields
    tabPersonalInfo: t("tab.personalInfo", { defaultValue: "Personal" }),
    tabHealthInfo: t("tab.health", { defaultValue: "Health" }),
    tabNotifications: t("tab.notifications", { defaultValue: "Notifications" }),
    tabSecurity: t("tab.security", { defaultValue: "Security" }),
    sectionPersonalInfo: t("section.personalInfo", { defaultValue: "Personal Information" }),
    sectionBodyMeasurements: t("section.bodyMeasurements", { defaultValue: "Body Measurements" }),
    sectionEmergencyContact: t("section.emergencyContact", { defaultValue: "Emergency Contact" }),
    sectionHealthInfo: t("section.healthInfo", { defaultValue: "Health Information" }),

    fullName: t("field.fullName", { defaultValue: "Full name" }),
    email: t("field.email", { defaultValue: "Email" }),
    phone: t("field.phone", { defaultValue: "Phone" }),
    birthDate: t("field.birthDate", { defaultValue: "Birth date" }),
    nationalId: t("field.nationalId", { defaultValue: "National ID" }),
    address: t("field.address", { defaultValue: "Address" }),
    bloodType: t("field.bloodType", { defaultValue: "Blood type" }),
    height: t("field.height", { defaultValue: "Height (cm)" }),
    weight: t("field.weight", { defaultValue: "Weight (kg)" }),
    bmi: t("field.bmi", { defaultValue: "BMI" }),
    bmiNotAvailable: t("field.bmiNotAvailable", { defaultValue: "Not available" }),

    emergencyName: t("field.emergencyName", { defaultValue: "Contact name" }),
    emergencyPhone: t("field.emergencyPhone", { defaultValue: "Contact phone" }),
    emergencyRelation: t("field.emergencyRelation", { defaultValue: "Relation" }),

    patientNumber: t("field.patientNumber", { defaultValue: "Patient No." }),
    activeAccount: t("field.activeAccount", { defaultValue: "Active Account" }),
    memberSince: t("field.memberSince", { defaultValue: "Member since" })
  };

  const [profileData, setProfileData] = useState({
    id: '',
    userId: '',
    fullName: '',
    email: '',
    doctorId: '',
    doctorName: '',
    phone: '',
    gender: '',
    birthDate: '',
    bloodType: '',
    joinDate: '',
    lastVisit: '',
    status: '',
    notes: '',
    createdAt: '',
    updatedAt: ''
  });
  // (تمت إزالة useEffect غير الضروري الذي يعدل الحالة مباشرة)

  // healthData removed per request — no default sample health info

  // load profile from API
  useEffect(() => {
    let mounted = true;
    Promise.resolve().then(async () => {
      try {
        const res = await fetch('/api/patient/profile');
        if (!res.ok) return;
        const data = await res.json();
        if (!mounted) return;
        const p = data.profile || {};
        setProfileData({
          id: p.id || '',
          userId: p.userId || '',
          fullName: p.fullName || '',
          email: p.email || '',
          doctorId: p.doctorId || '',
          doctorName: p.doctor?.fullName || '',
          phone: p.phone || '',
          gender: p.gender || '',
          birthDate: p.birthDate || '',
          bloodType: p.bloodType || '',
          joinDate: p.joinDate || '',
          lastVisit: p.lastVisit || '',
          status: p.status || '',
          notes: p.notes || '',
          createdAt: p.createdAt || '',
          updatedAt: p.updatedAt || ''
        });
      } catch (err) {
        console.error('Failed to load profile', err);
      }
    });
    return () => { mounted = false; };
  }, []);

  // ...existing code...

  // ...existing code...

  // ...existing code...

  // ...existing code...

  // ...existing code...

  // --- Editable fields ---
  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const res = await fetch('/api/patient/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData)
      });
      if (!res.ok) {
        showToast(labels.toastSaveError || 'Save failed', 'error');
        return;
      }
      const data = await res.json();
      setProfileData((prev) => ({ ...prev, ...data.profile }));
      setIsEditing(false);
      showToast(labels.toastSaveSuccess, 'success');
    } catch (err) {
      showToast(labels.toastSaveError || 'Save failed', 'error');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // reload profile from API to discard changes
    (async () => {
      try {
        const res = await fetch('/api/patient/profile');
        if (!res.ok) return;
        const data = await res.json();
        const p = data.profile || {};
        setProfileData({
          id: p.id || '',
          userId: p.userId || '',
          fullName: p.fullName || '',
          email: p.email || '',
          doctorId: p.doctorId || '',
          doctorName: p.doctor?.fullName || '',
          phone: p.phone || '',
          gender: p.gender || '',
          birthDate: p.birthDate || '',
          bloodType: p.bloodType || '',
          joinDate: p.joinDate || '',
          lastVisit: p.lastVisit || '',
          status: p.status || '',
          notes: p.notes || '',
          createdAt: p.createdAt || '',
          updatedAt: p.updatedAt || ''
        });
      } catch {}
    })();
    showToast(labels.toastCancelEdit, 'info');
  };

  return (
    <>
      <ToastContainer />
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 p-6 flex justify-center">
        <div className="w-full max-w-2xl">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">{labels.pageTitle}</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">{labels.pageSubtitle}</p>
            </div>
            <div>
              {!isEditing && (
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded" onClick={() => setIsEditing(true)}>{labels.btnEdit}</button>
              )}
              {isEditing && (
                <>
                  <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded mr-2" onClick={handleSave}>{labels.btnSave}</button>
                  <button className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded" onClick={handleCancel}>{labels.btnCancel}</button>
                </>
              )}
            </div>
          </div>

          {/* Profile Card */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-8 flex flex-col gap-6">
            <div className="flex items-center gap-6">
              <div className="shrink-0 w-20 h-20 rounded-full bg-blue-100 dark:bg-slate-700 flex items-center justify-center text-4xl text-blue-600 dark:text-blue-300">
                <FaUser />
              </div>
              <div>
                {isEditing ? (
                  <input name="fullName" value={profileData.fullName} onChange={handleFieldChange} className="text-xl font-bold text-gray-900 dark:text-white bg-transparent border-b border-gray-300 focus:outline-none focus:border-blue-500" />
                ) : (
                  <div className="text-xl font-bold text-gray-900 dark:text-white">{profileData.fullName || '—'}</div>
                )}
                <div className="text-gray-500 dark:text-gray-300 mt-1 flex items-center gap-2">
                  <FaEnvelope className="inline" />
                  {isEditing ? (
                    <input name="email" value={profileData.email} onChange={handleFieldChange} className="bg-transparent border-b border-gray-300 focus:outline-none focus:border-blue-500" />
                  ) : (
                    profileData.email || '—'
                  )}
                </div>
                <div className="text-gray-500 dark:text-gray-300 mt-1 flex items-center gap-2">
                  <FaPhone className="inline" />
                  {isEditing ? (
                    <input name="phone" value={profileData.phone} onChange={handleFieldChange} className="bg-transparent border-b border-gray-300 focus:outline-none focus:border-blue-500" />
                  ) : (
                    profileData.phone || '—'
                  )}
                </div>
                {profileData.id && (
                  <div className="text-gray-400 text-xs mt-1">{labels.patientNumber || 'Patient No.'}: {profileData.id}</div>
                )}
                {profileData.userId && (
                  <div className="text-gray-400 text-xs mt-1">User ID: {profileData.userId}</div>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-gray-700 dark:text-gray-200 font-medium mb-1">{labels.birthDate}</div>
                {isEditing ? (
                  <input type="date" name="birthDate" value={profileData.birthDate ? profileData.birthDate.slice(0,10) : ''} onChange={handleFieldChange} className="bg-transparent border-b border-gray-300 focus:outline-none focus:border-blue-500 text-gray-900 dark:text-white" />
                ) : (
                  <div className="text-gray-900 dark:text-white">{profileData.birthDate ? new Date(profileData.birthDate).toLocaleDateString(locale) : '—'}</div>
                )}
              </div>
              <div>
                <div className="text-gray-700 dark:text-gray-200 font-medium mb-1">{labels.bloodType}</div>
                {isEditing ? (
                  <input name="bloodType" value={profileData.bloodType} onChange={handleFieldChange} className="bg-transparent border-b border-gray-300 focus:outline-none focus:border-blue-500 text-gray-900 dark:text-white" />
                ) : (
                  <div className="text-gray-900 dark:text-white">{profileData.bloodType || '—'}</div>
                )}
              </div>
              <div>
                <div className="text-gray-700 dark:text-gray-200 font-medium mb-1">{labels.gender || 'الجنس'}</div>
                {isEditing ? (
                  <input name="gender" value={profileData.gender} onChange={handleFieldChange} className="bg-transparent border-b border-gray-300 focus:outline-none focus:border-blue-500 text-gray-900 dark:text-white" />
                ) : (
                  <div className="text-gray-900 dark:text-white">{profileData.gender || '—'}</div>
                )}
              </div>
              <div>
                <div className="text-gray-700 dark:text-gray-200 font-medium mb-1">{labels.notes || 'ملاحظات'}</div>
                {isEditing ? (
                  <input name="notes" value={profileData.notes} onChange={handleFieldChange} className="bg-transparent border-b border-gray-300 focus:outline-none focus:border-blue-500 text-gray-900 dark:text-white" />
                ) : (
                  <div className="text-gray-900 dark:text-white">{profileData.notes || '—'}</div>
                )}
              </div>
              {profileData.doctorName && (
                <div>
                  <div className="text-gray-700 dark:text-gray-200 font-medium mb-1">الطبيب الحالي</div>
                  <div className="text-gray-900 dark:text-white">{profileData.doctorName} {profileData.doctorId && <span className="text-xs text-gray-400">({profileData.doctorId})</span>}</div>
                </div>
              )}
              {profileData.joinDate && (
                <div>
                  <div className="text-gray-700 dark:text-gray-200 font-medium mb-1">تاريخ الانضمام</div>
                  <div className="text-gray-900 dark:text-white">{new Date(profileData.joinDate).toLocaleDateString(locale)}</div>
                </div>
              )}
              {profileData.lastVisit && (
                <div>
                  <div className="text-gray-700 dark:text-gray-200 font-medium mb-1">آخر زيارة</div>
                  <div className="text-gray-900 dark:text-white">{new Date(profileData.lastVisit).toLocaleDateString(locale)}</div>
                </div>
              )}
              {profileData.status && (
                <div>
                  <div className="text-gray-700 dark:text-gray-200 font-medium mb-1">الحالة</div>
                  <div className="text-gray-900 dark:text-white">{profileData.status}</div>
                </div>
              )}
              {profileData.createdAt && (
                <div>
                  <div className="text-gray-700 dark:text-gray-200 font-medium mb-1">تاريخ الإنشاء</div>
                  <div className="text-gray-900 dark:text-white">{new Date(profileData.createdAt).toLocaleDateString(locale)}</div>
                </div>
              )}
              {profileData.updatedAt && (
                <div>
                  <div className="text-gray-700 dark:text-gray-200 font-medium mb-1">آخر تحديث</div>
                  <div className="text-gray-900 dark:text-white">{new Date(profileData.updatedAt).toLocaleDateString(locale)}</div>
                </div>
              )}
            </div>
          </div>

          {/* Doctor Change Request Section */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-6 mt-8">
            <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">طلب تغيير الطبيب</h2>
            <DoctorChangeRequestForm showToast={showToast} />
          </div>
        </div>
      </div>
    </>
  );
}

// --- DoctorChangeRequestForm: fetches real doctors and renders the form ---
function DoctorChangeRequestForm({ showToast }) {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch('/api/doctor/list');
        if (!res.ok) throw new Error('فشل جلب قائمة الأطباء');
        const data = await res.json();
        if (mounted) setDoctors(data.doctors || []);
      } catch {
        if (mounted) setDoctors([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        const form = e.target;
        const requestedDoctorId = form.requestedDoctorId.value;
        const reason = form.reason.value;
        if (!requestedDoctorId) {
          showToast('يرجى اختيار طبيب جديد', 'error');
          return;
        }
        try {
          const res = await fetch('/api/doctor-change-requests', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ requestedDoctorId, reason })
          });
          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            showToast(err.error || 'فشل الطلب', 'error');
            return;
          }
          showToast('تم إرسال طلب تغيير الطبيب للإدارة وسيتم مراجعته قريباً', 'success');
          form.reset();
        } catch (err) {
          showToast('فشل الاتصال', 'error');
        }
      }}
      className="flex flex-col gap-4"
    >
      <div>
        <label className="block mb-1 text-gray-700 dark:text-gray-200">اختر الطبيب الجديد</label>
        <select name="requestedDoctorId" className="w-full border rounded p-2 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white" disabled={loading}>
          <option value="">-- اختر --</option>
          {loading && <option disabled>جاري التحميل...</option>}
          {!loading && doctors.length === 0 && <option disabled>لا يوجد أطباء متاحون</option>}
          {doctors.map((doc) => (
            <option key={doc.id} value={doc.id}>{doc.fullName || doc.name || doc.email || doc.id}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block mb-1 text-gray-700 dark:text-gray-200">سبب الطلب (اختياري)</label>
        <textarea name="reason" className="w-full border rounded p-2 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white" rows={2} placeholder="اكتب سبب رغبتك في تغيير الطبيب (اختياري)" />
      </div>
      <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded self-end">إرسال الطلب</button>
    </form>
  );
}