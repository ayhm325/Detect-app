

"use client";

import { useState, useEffect } from "react";
import { useToast } from "../../../components/ui/Toast";
import { useTranslations, useLocale } from "next-intl";
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCalendarAlt, FaIdCard, FaHeartbeat, FaWeight, FaRuler, FaAllergies, FaNotesMedical, FaEdit, FaSave, FaTimes, FaBell, FaLock, FaLanguage, FaMoon, FaEye, FaEyeSlash } from "react-icons/fa";

export default function PatientProfilePage() {
    // Doctor change modal state
    const [showChangeDoctor, setShowChangeDoctor] = useState(false);
    const [availableDoctors, setAvailableDoctors] = useState([]);
    const [doctorsLoading, setDoctorsLoading] = useState(false);

    // Doctor change request handler (frontend only)
    const handleSubmitChangeDoctor = (e) => {
        e.preventDefault();
        const form = e.target;
        const fd = new FormData(form);
        const requestedDoctorId = fd.get('requestedDoctorId');
        const reasonValue = fd.get('reason');
        (async () => {
          try {
            const res = await fetch('/api/doctor-change-requests', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({ requestedDoctorId, reason: reasonValue })
            });
            if (!res.ok) {
              const err = await res.json().catch(() => ({}));
              showToast(err.error || (locale === 'ar' ? 'فشل الطلب' : 'Request failed'), 'error');
              return;
            }
            setShowChangeDoctor(false);
            showToast(locale === "ar" ? "تم إرسال طلب تغيير الطبيب للإدارة وسيتم مراجعته قريباً" : "Your doctor change request has been sent to admin for approval.", "success");
          } catch (err) {
            console.error('Error submitting doctor change request', err);
            showToast(locale === 'ar' ? 'فشل الاتصال' : 'Network error', 'error');
          }
        })();
    };
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
    fullName: "",
    email: "",
    phone: "",
    birthDate: "",
    gender: "",
    bloodType: "",
    notes: ""
  });
  // ensure doctor fields exist
  useEffect(() => {
    setProfileData(prev => ({ id: prev.id || '', doctorId: prev.doctorId || '', doctorName: prev.doctorName || '', ...prev }));
  }, []);

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
          fullName: p.fullName || '',
          email: p.email || '',
          phone: p.phone || '',
          birthDate: p.birthDate || '',
          gender: p.gender || '',
          bloodType: p.bloodType || '',
          notes: p.notes || ''
        });
        if (p.doctor) setProfileData(prev => ({ ...prev, doctorName: p.doctor.fullName, doctorId: p.doctor.id }));
      } catch (err) {
        console.error('Failed to load profile', err);
      }
    });
    return () => { mounted = false; };
  }, []);

  // fetch available doctors when opening modal
  useEffect(() => {
    if (!showChangeDoctor) return;
    let mounted = true;
    (async () => {
      setDoctorsLoading(true);
      try {
        const res = await fetch('/api/doctor-change-requests');
        const text = await res.text();
        let data;
        try {
          data = text ? JSON.parse(text) : {};
        } catch (e) {
          console.error('Failed to parse /api/doctor-change-requests response', text, e);
          data = { success: false };
        }
        console.debug('/api/doctor-change-requests response', { ok: res.ok, status: res.status, data });
        if (!mounted) return;
        if (!res.ok || !data.success) {
          setAvailableDoctors([]);
          showToast && showToast(locale === 'ar' ? 'فشل تحميل الأطباء' : 'Failed to load doctors', 'error');
        } else {
          setAvailableDoctors(Array.isArray(data.doctors) ? data.doctors : []);
        }
      } catch (e) {
        console.error('Failed to load doctors', e);
        setAvailableDoctors([]);
        showToast && showToast(locale === 'ar' ? 'فشل الاتصال بجلب الأطباء' : 'Network error loading doctors', 'error');
      } finally {
        setDoctorsLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [showChangeDoctor, locale, showToast]);

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
    const height = parseFloat(profileData.height);
    const weight = parseFloat(profileData.weight);
    if (!height || !weight || Number.isNaN(height) || Number.isNaN(weight)) return null;
    const heightM = height / 100;
    if (heightM === 0) return null;
    const bmi = (weight / (heightM * heightM));
    if (!isFinite(bmi)) return null;
    return bmi.toFixed(1);
  };

  const getBMIStatus = () => {
    const bmiVal = calculateBMI();
    if (!bmiVal) return { text: "-", color: "text-gray-600" };
    const bmi = parseFloat(bmiVal);
    if (bmi < 18.5) return { text: labels.bmiUnderweight, color: "text-blue-600 dark:text-blue-400" };
    if (bmi < 25) return { text: labels.bmiNormal, color: "text-green-600 dark:text-green-400" };
    if (bmi < 30) return { text: labels.bmiOverweight, color: "text-orange-600 dark:text-orange-400" };
    return { text: labels.bmiObese, color: "text-red-600 dark:text-red-400" };
  };

  const handleSaveProfile = () => {
    (async () => {
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
        setProfileData(prev => ({ ...prev, ...data.profile }));
        setIsEditing(false);
        showToast(labels.toastSaveSuccess, 'success');
      } catch (err) {
        console.error('Error saving profile', err);
        showToast(labels.toastSaveError || 'Save failed', 'error');
      }
    })();
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    showToast(labels.toastCancelEdit, "info");
  };

  const handleChangePassword = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast(labels.toastPasswordMismatch, "error");
      return;
    }
    if (passwordData.newPassword.length < 8) {
      showToast(labels.toastPasswordLength, "error");
      return;
    }
    showToast(labels.toastPasswordChanged, "success");
    setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
  };

  const handleNotificationToggle = (key) => {
    const updated = { ...notificationSettings, [key]: !notificationSettings[key] };
    setNotificationSettings(updated);
    // persist change to server
    (async () => {
      try {
        const res = await fetch('/api/patient/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ notificationSettings: updated })
        });
        if (!res.ok) {
          showToast(labels.toastSaveError || 'Failed to update', 'error');
          return;
        }
        showToast(labels.toastNotificationUpdated, 'success');
      } catch (err) {
        console.error('Error saving notification settings', err);
        showToast(labels.toastSaveError || 'Failed to update', 'error');
      }
    })();
  };

  const bmiStatus = getBMIStatus();

  // Small reusable toggle button to reduce repetition and improve accessibility
  const ToggleButton = ({ checked, onClick, ariaLabel, wrapClass = "w-14 h-7", knobClass = "w-5 h-5", translateWhenOn = "translate-x-8" }) => (
    <button
      onClick={onClick}
      className={`${wrapClass} rounded-full transition-colors ${checked ? "bg-blue-600 dark:bg-blue-500" : "bg-gray-300 dark:bg-gray-600"}`}
      aria-pressed={checked}
      aria-label={ariaLabel}
    >
      <div className={`${knobClass} bg-white rounded-full transition-transform ${checked ? translateWhenOn : "translate-x-1"}`} />
    </button>
  );

  return (
    <>
      <ToastContainer />
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 p-6 flex justify-center">
        <div className="w-full max-w-4xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">{labels.pageTitle}</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">{labels.pageSubtitle}</p>
          </div>

          {/* Profile Card, Tabs, and Tab Content */}
          {/* ...insert the rest of the JSX for the profile page here, as originally structured... */}
        </div>
      </div>
    </>
// ...existing code for the rest of the JSX tabs and content goes here, properly nested inside the main fragment above...
  );
}