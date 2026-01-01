"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from 'next/navigation';
import { useToast } from "../../../components/ui/Toast";
import { useTranslations, useLocale } from "next-intl";
import { FaUser, FaEnvelope, FaPhone, FaEye, FaEyeSlash, FaIdCard, FaUserMd, FaLock, FaSave, FaTimes, FaEdit, FaShieldAlt, FaHeart, FaCalendar } from "react-icons/fa";

export default function PatientProfilePage() {
  const locale = useLocale();
  const t = useTranslations("profile");
  const { showToast, ToastContainer } = useToast();
  const router = useRouter();
  const pathname = usePathname();

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false); // For initial load

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

  // Fetch Profile Data
  useEffect(() => {
    let mounted = true;
    setLoading(true);
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
      } finally {
        if (mounted) setLoading(false);
      }
    });
    return () => { mounted = false; };
  }, []);

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/patient/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData)
      });
      if (!res.ok) {
        showToast(t('toastSaveError', { defaultValue: 'Save failed' }), 'error');
        setLoading(false);
        return;
      }
      const data = await res.json();
      setProfileData((prev) => ({ ...prev, ...data.profile }));
      setIsEditing(false);
      showToast(t('toastSaveSuccess', { defaultValue: 'Saved successfully' }), 'success');
    } catch (err) {
      showToast(t('toastSaveError', { defaultValue: 'Save failed' }), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reload to discard changes
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
    showToast(t('toastCancelEdit', { defaultValue: 'Edit cancelled' }), 'info');
  };

  if (loading && !profileData.id) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <>
      <ToastContainer />
      <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] text-slate-800 dark:text-slate-100 font-sans selection:bg-indigo-500 selection:text-white relative overflow-hidden">
        
        {/* Decorative Background Elements */}
        <div className="absolute top-[-10%] left-[-5%] w-125 h-125 bg-indigo-400/10 dark:bg-indigo-900/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-100 h-100 bg-emerald-400/10 dark:bg-emerald-900/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl mx-auto p-6 md:p-10 space-y-8">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-linear-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
                {t("pageTitle", { defaultValue: "Profile" })}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-lg mt-2">{t("pageSubtitle", { defaultValue: "Your profile details" })}</p>
            </div>
            <div className="flex gap-3">
              {!isEditing ? (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-500/30 transition-all hover:-translate-y-1 font-medium"
                >
                  <FaEdit /> {t("btnEdit", { defaultValue: "Edit" })}
                </button>
              ) : (
                <>
                  <button 
                    onClick={handleCancel}
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all font-medium"
                  >
                    <FaTimes /> {t("btnCancel", { defaultValue: "Cancel" })}
                  </button>
                  <button 
                    onClick={handleSave}
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg shadow-emerald-500/30 transition-all hover:-translate-y-1 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FaSave /> {loading ? t('saving', { defaultValue: 'Saving...' }) : t("btnSave", { defaultValue: "Save" })}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Profile Card */}
          <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-4xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.04)] border border-white/50 dark:border-white/5">
            
            {/* Avatar & Identity */}
            <div className="flex flex-col md:flex-row gap-8 items-center md:items-start mb-8 border-b border-slate-100 dark:border-slate-800 pb-8">
              <div className="relative shrink-0">
                <div className="w-32 h-32 rounded-full bg-linear-to-br from-indigo-100 to-slate-100 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center text-5xl text-indigo-600 dark:text-indigo-400 shadow-inner border-4 border-white dark:border-slate-800">
                  <FaUser />
                </div>
                {profileData.status === 'active' && (
                  <div className="absolute bottom-2 right-2 w-6 h-6 bg-emerald-500 border-4 border-white dark:border-slate-900 rounded-full"></div>
                )}
              </div>
              
              <div className="flex-1 w-full space-y-4">
                {/* Name */}
                <div className="group">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">{t("field.fullName", { defaultValue: "Full Name" })}</label>
                  {isEditing ? (
                    <input name="fullName" value={profileData.fullName} onChange={handleFieldChange} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all font-bold text-lg text-slate-900 dark:text-white" />
                  ) : (
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">{profileData.fullName || t('placeholder.empty', { defaultValue: '—' })}</div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Email */}
                  <div className="group">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-2"><FaEnvelope className="text-indigo-400"/> {t("field.email", { defaultValue: "Email" })}</label>
                    {isEditing ? (
                      <input name="email" value={profileData.email} onChange={handleFieldChange} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all text-slate-800 dark:text-slate-200" />
                    ) : (
                      <div className="text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">{profileData.email || t('placeholder.empty', { defaultValue: '—' })}</div>
                    )}
                  </div>
                  {/* Phone */}
                  <div className="group">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-2"><FaPhone className="text-indigo-400"/> {t("field.phone", { defaultValue: "Phone" })}</label>
                    {isEditing ? (
                      <input name="phone" value={profileData.phone} onChange={handleFieldChange} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all text-slate-800 dark:text-slate-200" />
                    ) : (
                      <div className="text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">{profileData.phone || t('placeholder.empty', { defaultValue: '—' })}</div>
                    )}
                  </div>
                </div>
                
                {/* IDs */}
                <div className="flex flex-wrap gap-4 text-xs font-mono text-slate-400 pt-2">
                  <div className="flex items-center gap-2"><FaIdCard /> {t("field.patientNumber", { defaultValue: "Patient No." })}: {profileData.id}</div>
                  <div className="flex items-center gap-2"><FaIdCard /> {t('userId', { defaultValue: 'User ID' })}: {profileData.userId}</div>
                </div>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Birth Date */}
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">{t("field.birthDate", { defaultValue: "Birth Date" })}</label>
                {isEditing ? (
                  <input type="date" name="birthDate" value={profileData.birthDate ? profileData.birthDate.slice(0,10) : ''} onChange={handleFieldChange} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all text-slate-800 dark:text-slate-200" />
                ) : (
                  <div className="text-slate-800 dark:text-slate-200 font-medium">{profileData.birthDate ? new Date(profileData.birthDate).toLocaleDateString(locale) : t('placeholder.empty', { defaultValue: '—' })}</div>
                )}
              </div>

              {/* Gender */}
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">{t("field.genderLabel", { defaultValue: "Gender" })}</label>
                {isEditing ? (
                  <select name="gender" value={profileData.gender || ''} onChange={handleFieldChange} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all text-slate-800 dark:text-slate-200 appearance-none">
                    <option value="">{t('placeholder.empty', { defaultValue: '—' })}</option>
                    <option value="male">{t('field.gender.male', { defaultValue: 'Male' })}</option>
                    <option value="female">{t('field.gender.female', { defaultValue: 'Female' })}</option>
                  </select>
                ) : (
                  <div className="text-slate-800 dark:text-slate-200 font-medium">
                    {profileData.gender === 'male' && t('field.gender.male', { defaultValue: 'Male' })}
                    {profileData.gender === 'female' && t('field.gender.female', { defaultValue: 'Female' })}
                    {!profileData.gender && t('placeholder.empty', { defaultValue: '—' })}
                  </div>
                )}
              </div>

              {/* Blood Type */}
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2"><FaHeart className="text-rose-400"/> {t("field.bloodType", { defaultValue: "Blood Type" })}</label>
                {isEditing ? (
                  <input name="bloodType" value={profileData.bloodType} onChange={handleFieldChange} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all text-slate-800 dark:text-slate-200" />
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold border border-rose-100 dark:border-rose-900/50">{profileData.bloodType || '?'}</span>                    
                  </div>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">{t("field.notes", { defaultValue: "Notes" })}</label>
                  {isEditing ? (
                  <input name="notes" value={profileData.notes} onChange={handleFieldChange} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all text-slate-800 dark:text-slate-200" />
                ) : (
                  <div className="text-slate-600 dark:text-slate-400 italic text-sm">{profileData.notes || t('placeholder.empty', { defaultValue: '—' })}</div>
                )}
              </div>
            </div>

            {/* Doctor & Stats Row */}
            {(profileData.doctorName || profileData.joinDate) && (
              <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {profileData.doctorName && (
                  <div className="flex items-center gap-3 p-3 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-xl border border-indigo-100 dark:border-indigo-900/20">
                    <div className="p-2 bg-white dark:bg-slate-800 rounded-lg text-indigo-600 shadow-sm"><FaUserMd /></div>
                    <div>
                      <div className="text-xs text-slate-500 uppercase font-bold">{t('currentDoctor', { defaultValue: 'Doctor' })}</div>
                      <div className="text-sm font-bold text-slate-800 dark:text-white truncate">{profileData.doctorName}</div>
                    </div>
                  </div>
                )}
                {profileData.joinDate && (
                   <div className="flex items-center gap-3 p-3 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-xl border border-emerald-100 dark:border-emerald-900/20">
                    <div className="p-2 bg-white dark:bg-slate-800 rounded-lg text-emerald-600 shadow-sm"><FaCalendar /></div>
                    <div>
                      <div className="text-xs text-slate-500 uppercase font-bold">{t('joinDate', { defaultValue: 'Joined' })}</div>
                      <div className="text-sm font-bold text-slate-800 dark:text-white">{new Date(profileData.joinDate).toLocaleDateString(locale)}</div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Doctor Change Request Card */}
          <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-4xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.04)] border border-white/50 dark:border-white/5 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-400/5 dark:bg-cyan-900/5 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 rounded-xl">
                  <FaUserMd size={20} />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t('doctorChange.title', { defaultValue: 'Change Doctor Request' })}</h2>
              </div>
              <DoctorChangeRequestForm showToast={showToast} t={t} />
            </div>
          </div>

          {/* Security Card */}
          <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-4xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.04)] border border-white/50 dark:border-white/5 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-32 h-32 bg-rose-400/5 dark:bg-rose-900/5 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-xl">
                  <FaShieldAlt size={20} />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t('security.changePasswordTitle', { defaultValue: 'Change Password' })}</h2>
              </div>
              <ChangePasswordForm showToast={showToast} t={t} router={router} pathname={pathname} />
            </div>
          </div>

        </div>
      </div>
    </>
  );
}

// --- Styled Sub-Components ---

function DoctorChangeRequestForm({ showToast, t }) {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch('/api/doctor/list');
        if (!res.ok) throw new Error('Failed');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const form = e.target;
    const requestedDoctorId = form.requestedDoctorId.value;
    const reason = form.reason.value;

    if (!requestedDoctorId) {
      showToast(t('doctorChange.selectPlaceholder', { defaultValue: 'Please select a doctor' }), 'error');
      setSubmitting(false);
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
        showToast(err.error || t('toast.doctorChangeFail', { defaultValue: 'Request failed' }), 'error');
        setSubmitting(false);
        return;
      }
      showToast(t('toast.doctorChangeSent', { defaultValue: 'Request sent successfully' }), 'success');
      form.reset();
    } catch (err) {
      showToast(t('toast.doctorChangeNetwork', { defaultValue: 'Network error' }), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-2">{t('doctorChange.selectLabel', { defaultValue: 'Select New Doctor' })}</label>
        <select name="requestedDoctorId" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 outline-none transition-all text-slate-800 dark:text-white appearance-none cursor-pointer" disabled={loading}>
          <option value="">{loading ? t('doctorChange.loading', { defaultValue: 'Loading...' }) : t('doctorChange.selectPlaceholder', { defaultValue: '-- Select --' })}</option>
          {!loading && doctors.length === 0 && <option disabled>{t('doctorChange.noDoctors', { defaultValue: 'No doctors available' })}</option>}
          {doctors.map((doc) => (
            <option key={doc.id} value={doc.id}>{doc.fullName || doc.name || doc.email || doc.id}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-2">{t('doctorChange.reasonLabel', { defaultValue: 'Reason (Optional)' })}</label>
        <textarea name="reason" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 outline-none transition-all text-slate-800 dark:text-white resize-none" rows={3} placeholder={t('doctorChange.reasonPlaceholder', { defaultValue: 'Write a reason...' })} />
      </div>
      <div className="flex justify-end">
        <button type="submit" disabled={submitting} className="flex items-center gap-2 px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl shadow-lg shadow-cyan-500/20 transition-all hover:-translate-y-0.5 font-medium disabled:opacity-50 disabled:cursor-not-allowed">
          {submitting ? t('doctorChange.sending', { defaultValue: 'Sending...' }) : <span>{t('doctorChange.submit', { defaultValue: 'Send Request' })}</span>}
        </button>
      </div>
    </form>
  );
}

function ChangePasswordForm({ showToast, t, router, pathname }) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      showToast(t('toastPasswordLength', { defaultValue: 'Password too short' }), 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast(t('toastPasswordMismatch', { defaultValue: 'Passwords do not match' }), 'error');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/patient/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ oldPassword, newPassword })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        showToast(err.error || t('toastPasswordChangeFail', { defaultValue: 'Failed' }), 'error');
        setLoading(false);
        return;
      }
      showToast(t('toastPasswordChanged', { defaultValue: 'Password changed' }), 'success');
      
      // Logout Logic
      try { await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }).catch(() => {}); } catch {}
      if (typeof window !== 'undefined') { localStorage.clear(); sessionStorage.clear(); }
      const locale = pathname?.startsWith('/en') ? 'en' : 'ar';
      const basePrefix = locale === 'en' ? '/en' : '/ar';
      router.replace(basePrefix);
      
    } catch (err) {
      showToast(t('toastPasswordChangeNetwork', { defaultValue: 'Network error' }), 'error');
    } finally {
      setLoading(false);
    }
  };

  const InputGroup = ({ label, value, onChange, show, toggleShow, type="password", name }) => (
    <div>
      <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-2">{label}</label>
      <div className="relative">
        <input
          type={show ? 'text' : type}
          name={name}
          value={value}
          onChange={onChange}
          autoComplete="new-password"
          className="w-full px-4 py-3 pr-10 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 outline-none transition-all text-slate-800 dark:text-white"
        />
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={toggleShow} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
          {show ? <FaEyeSlash /> : <FaEye />}
        </button>
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <InputGroup 
        label={t('field.oldPassword', { defaultValue: 'Current Password' })} 
        value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} 
        show={showOld} toggleShow={() => setShowOld(!showOld)} 
        name="oldPassword"
      />
      <InputGroup 
        label={t('security.newPasswordLabel', { defaultValue: 'New Password' })} 
        value={newPassword} onChange={(e) => setNewPassword(e.target.value)} 
        show={showNew} toggleShow={() => setShowNew(!showNew)} 
        name="newPassword"
      />
      <InputGroup 
        label={t('security.confirmPasswordLabel', { defaultValue: 'Confirm New Password' })} 
        value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} 
        show={showConfirm} toggleShow={() => setShowConfirm(!showConfirm)} 
        name="confirmPassword"
      />
      <div className="pt-2 flex justify-end">
        <button type="submit" disabled={loading} className="flex items-center gap-2 px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-lg shadow-rose-500/20 transition-all hover:-translate-y-0.5 font-medium disabled:opacity-50 disabled:cursor-not-allowed">
          <FaLock /> {loading ? t('saving', { defaultValue: 'Saving...' }) : t('security.changePasswordButton', { defaultValue: 'Update Password' })}
        </button>
      </div>
    </form>
  );
}