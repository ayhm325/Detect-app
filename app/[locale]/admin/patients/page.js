"use client";
import React, { useState } from "react";
import useSWR from 'swr';
import { useToast } from "../../../components/ui/Toast";
import useLocale from "../../../hooks/useLocale";
import { useTranslations } from "next-intl";
import {
  FaUsers, FaMagnifyingGlass, FaPlus, FaDownload,
  FaPencil, FaTrash, FaX, FaFloppyDisk, FaEnvelope,
  FaPhone, FaCalendar, FaHeart, FaVial, FaUserDoctor
} from "react-icons/fa6";

const CURRENT_YEAR = new Date().getUTCFullYear();

export default function PatientsPage() {
  const { showToast, ToastContainer } = useToast();
  const tPatients = useTranslations('PatientsManagement');
  const locale = useLocale();

  // State
  const [search, setSearch] = useState("");
  const [filterGender, setFilterGender] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const emptyForm = { name: "", email: "", phone: "", gender: "male", age: "", medicalId: "", doctorId: "", status: "active", bloodType: "", birthDate: "", allergies: "", chronicDiseases: "" };
  const [formData, setFormData] = useState({ ...emptyForm });
  const [doctorsList, setDoctorsList] = useState([]);

  // Data Fetching
  const fetcher = (url) => fetch(url).then((res) => res.json());
  const { data: patients = [], error, isLoading, mutate } = useSWR('/api/admin/patients', fetcher);

  // Helpers
  const formatDate = React.useCallback((d) => {
    if (!d) return "";
    try { return new Date(d).toLocaleString(locale === 'en' ? 'en-US' : 'ar-SA', { dateStyle: 'medium', timeStyle: 'short' }); }
    catch { return String(d); }
  }, [locale]);

  const safeT = (key, fallback = "") => {
    try { const v = tPatients(key); return typeof v === 'string' && v.length ? v : fallback; }
    catch (e) { return fallback; }
  };

  // Normalize patients via memoization to avoid state updates inside effects
  const normalizedPatients = React.useMemo(() => {
    if (!patients || !Array.isArray(patients)) return [];
    const computeAgeFrom = (birthDate) => {
      if (!birthDate) return null;
      try { const bd = new Date(birthDate); return Math.abs(CURRENT_YEAR - bd.getUTCFullYear()); }
      catch { return null; }
    };
    return patients.map((p) => {
      const user = p.user || {};
      const doctorUser = p.doctor?.user || p.doctor || null;
      return {
        id: p.id || null,
        userId: p.userId || user.id || null,
        name: user.fullName || p.fullName || "",
        email: user.email || p.email || "",
        phone: p.phone || user.phone || "",
        gender: p.gender || "",
        age: p.age ?? computeAgeFrom(p.birthDate || p.birthdate) ?? null,
        birthDate: p.birthDate || p.birthdate || null,
        medicalId: p.medicalId || p.patientId || null,
        avatar: p.avatar || null,
        status: p.status || null,
        appointmentsCount: p._count?.appointments ?? 0,
        reportsCount: p._count?.medicalRecords ?? 0,
        lastVisit: p.lastVisit ? formatDate(p.lastVisit) : (p.updatedAt ? formatDate(p.updatedAt) : ""),
        joinDate: p.joinDate ? formatDate(p.joinDate) : (p.createdAt ? formatDate(p.createdAt) : ""),
        bloodType: p.bloodType || "",
        allergies: p.allergies || [],
        chronicDiseases: p.chronicDiseases || [],
        doctorId: p.doctor?.id || p.doctorId || (doctorUser ? (doctorUser.id || doctorUser.userId) : null),
        doctorName: doctorUser ? (doctorUser.fullName || doctorUser.name) : (p.doctorName || ""),
      };
    });
  }, [patients, formatDate]);


  // Fetch Doctors
  React.useEffect(() => {
    let mounted = true;
    fetch('/api/admin/doctors').then((res) => res.json()).then((data) => {
      const list = Array.isArray(data) ? data : (data.doctors || []);
      if (mounted) setDoctorsList(list);
    }).catch(() => { if (mounted) setDoctorsList([]); });
    return () => { mounted = false; };
  }, []);

  if (error) return <div className="p-10 text-center text-rose-500 font-medium">{tPatients('errorFetching')}</div>;
  if (isLoading) return <div className="flex h-screen items-center justify-center text-indigo-500 animate-pulse text-xl font-bold">{tPatients('loading')}</div>;

  // Stats Configuration
  const stats = [
    { title: tPatients('stats.totalPatients'), value: normalizedPatients.length, icon: FaUsers, gradient: "from-blue-500 to-cyan-400", bg: "bg-blue-50", darkBg: "dark:bg-blue-900/20" },
    { title: tPatients('stats.activePatients'), value: normalizedPatients.filter((p) => p.status === "active").length, icon: FaHeart, gradient: "from-emerald-500 to-teal-400", bg: "bg-emerald-50", darkBg: "dark:bg-emerald-900/20" },
    { title: tPatients('stats.todayVisits'), value: normalizedPatients.reduce((sum, p) => sum + (p.appointmentsCount || 0), 0), icon: FaCalendar, gradient: "from-amber-500 to-orange-400", bg: "bg-amber-50", darkBg: "dark:bg-amber-900/20" },
    { title: tPatients('stats.totalReports'), value: normalizedPatients.reduce((sum, p) => sum + (p.reportsCount || 0), 0), icon: FaVial, gradient: "from-purple-500 to-pink-400", bg: "bg-purple-50", darkBg: "dark:bg-purple-900/20" },
  ];

  // Mappings
  const gendersMap = { male: tPatients('genders.male'), female: tPatients('genders.female') };
  const statusesMap = {
    active: tPatients('statuses.active'),
    pending: tPatients('statuses.suspended') || tPatients('statuses.pending'),
    banned: tPatients('statuses.banned'), suspended: tPatients('statuses.banned'),
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "active": return "bg-emerald-100/50 text-emerald-700 border-emerald-200 shadow-emerald-100/50";
      case "pending": return "bg-amber-100/50 text-amber-700 border-amber-200 shadow-amber-100/50";
      case "banned": case "suspended": return "bg-rose-100/50 text-rose-700 border-rose-200 shadow-rose-100/50";
      default: return "bg-slate-100/50 text-slate-600 border-slate-200";
    }
  };

  // Handlers
  const handleAddPatient = async () => {
    if (!formData.name || !formData.email || !formData.phone) { showToast(tPatients('toast.fillFields'), "error"); return; }
    try {
      const payload = { name: formData.name, email: formData.email, phone: formData.phone, gender: formData.gender, medicalId: formData.medicalId || undefined, doctorId: formData.doctorId || undefined, status: formData.status === 'banned' || formData.status === 'suspended' ? 'suspended' : 'active', bloodType: formData.bloodType || undefined, birthDate: formData.birthDate || undefined, allergies: formData.allergies ? formData.allergies.split(',').map(s => s.trim()).filter(Boolean) : undefined, chronicDiseases: formData.chronicDiseases ? formData.chronicDiseases.split(',').map(s => s.trim()).filter(Boolean) : undefined };
      const res = await fetch('/api/admin/patients', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) { const err = await res.json().catch(() => ({})); showToast(err?.error || tPatients('toast.patientAdded'), 'error'); return; }
      await mutate(); setFormData({ ...emptyForm }); setShowAddModal(false); showToast(tPatients('toast.patientAdded'), "success");
    } catch (e) { console.error(e); showToast(e.message, 'error'); }
  };

  const handleEditPatient = async () => {
    if (!formData.name || !formData.email || !formData.phone) { showToast(tPatients('toast.fillFields'), "error"); return; }
    if (!selectedPatient?.id) { showToast(tPatients('toast.patientUpdated'), "error"); return; }
    try {
      const payload = { name: formData.name, email: formData.email, phone: formData.phone, gender: formData.gender, age: formData.age || undefined, medicalId: formData.medicalId || undefined, doctorId: formData.doctorId || undefined, status: formData.status === 'banned' || formData.status === 'suspended' ? 'suspended' : (formData.status || undefined), bloodType: formData.bloodType || undefined, birthDate: formData.birthDate || undefined, allergies: formData.allergies ? formData.allergies.split(',').map(s => s.trim()).filter(Boolean) : undefined, chronicDiseases: formData.chronicDiseases ? formData.chronicDiseases.split(',').map(s => s.trim()).filter(Boolean) : undefined };
      const targetId = selectedPatient.id || selectedPatient.userId;
      const res = await fetch(`/api/admin/patients/${targetId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) { const errObj = await res.json().catch(() => ({})); showToast(errObj?.error || tPatients('toast.patientUpdated'), 'error'); return; }
      await mutate(); setFormData({ name: "", email: "", phone: "", gender: "male", age: "", medicalId: "", doctorId: "", status: "", bloodType: "", birthDate: "", allergies: "", chronicDiseases: "" }); setShowEditModal(false); showToast(tPatients('toast.patientUpdated'), "success");
    } catch (e) { console.error(e); showToast(e.message, 'error'); }
  };

  const handleDeletePatient = () => {
    (async () => {
      try {
        const targetId = selectedPatient?.id || selectedPatient?.userId;
        if (!targetId) { setShowDeleteModal(false); return; }
        const res = await fetch(`/api/admin/patients/${targetId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'suspended' }) });
        if (!res.ok) { const errObj = await res.json().catch(() => ({})); showToast(errObj?.error || tPatients('toast.patientDeleted'), 'error'); setShowDeleteModal(false); return; }
        await mutate(); setShowDeleteModal(false); showToast(tPatients('toast.patientDeleted'), 'success');
      } catch (e) { console.error(e); showToast(e.message, 'error'); setShowDeleteModal(false); }
    })();
  };

  const handleExport = () => {
    const headers = [tPatients('csvHeader_id'), tPatients('csvHeader_name'), tPatients('csvHeader_gender'), tPatients('csvHeader_birthDate'), tPatients('csvHeader_bloodType'), tPatients('csvHeader_phone'), tPatients('csvHeader_email'), tPatients('csvHeader_status'), tPatients('csvHeader_joinDate'), tPatients('csvHeader_doctor')];
    const csv = [headers, ...normalizedPatients.map((p) => [p.medicalId, p.name, gendersMap[p.gender] || p.gender, p.birthDate, p.bloodType, p.phone, p.email, statusesMap[p.status] || p.status, p.joinDate, p.doctorName])].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "patients.csv"; a.click();
    showToast(tPatients('toast.exportStarted'), "success");
  };

  const openEditModal = (patient) => {
    setSelectedPatient(patient);
    setFormData({
      name: patient.name, email: patient.email, phone: patient.phone, gender: patient.gender, age: patient.age, medicalId: patient.medicalId, doctorId: patient.doctorId,
      status: patient.status === 'banned' ? 'suspended' : (patient.status || ""), bloodType: patient.bloodType, birthDate: patient.birthDate ? (new Date(patient.birthDate)).toISOString().split('T')[0] : "",
      allergies: Array.isArray(patient.allergies) ? patient.allergies.join(', ') : (patient.allergies || '').toString(),
      chronicDiseases: Array.isArray(patient.chronicDiseases) ? patient.chronicDiseases.join(', ') : (patient.chronicDiseases || '').toString(),
    });
    setShowEditModal(true);
  };
  const openDeleteModal = (patient) => { setSelectedPatient(patient); setShowDeleteModal(true); };

  const filteredPatients = normalizedPatients.filter((patient) => {
    const lowerSearch = (search || "").toString().trim().toLowerCase();
    const matchSearch = lowerSearch === "" || (patient.name || "").toLowerCase().includes(lowerSearch) || (patient.email || "").toLowerCase().includes(lowerSearch) || (patient.phone || "").toLowerCase().includes(lowerSearch) || (patient.medicalId || "").toLowerCase().includes(lowerSearch);
    const matchGender = filterGender === "all" || (patient.gender || "male") === filterGender;
    const matchStatus = filterStatus === "all" || (patient.status || "pending") === filterStatus;
    return matchSearch && matchGender && matchStatus;
  });

  return (
    <>
      <ToastContainer />
      {/* Premium Background with Gradient Mesh */}
      <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] text-slate-800 dark:text-slate-100 font-sans selection:bg-indigo-500 selection:text-white overflow-hidden relative">
        
        {/* Decorative Background Blurs */}
        <div className="absolute top-[-10%] right-[-5%] w-125 h-125 bg-indigo-400/20 dark:bg-indigo-900/20 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-100 h-100 bg-rose-400/20 dark:bg-rose-900/20 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="relative z-10 max-w-7xl mx-auto p-6 md:p-10 space-y-10">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 animate-[fadeIn_0.6s_ease-out]">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-linear-to-r from-slate-900 via-indigo-800 to-slate-900 dark:from-white dark:via-indigo-200 dark:to-white mb-2">
                {tPatients('headerTitle')}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-lg font-medium">{tPatients('headerSubtitle')}</p>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={handleExport} className="group flex items-center gap-3 px-6 py-3 bg-white dark:bg-slate-800/50 text-slate-700 dark:text-slate-200 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_25px_rgba(0,0,0,0.1)] border border-slate-100 dark:border-slate-700 transition-all duration-300 hover:-translate-y-1">
                <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 rounded-xl group-hover:scale-110 transition-transform">
                  <FaDownload size={18} />
                </div>
                <span className="font-semibold hidden sm:block">{tPatients('exportButton')}</span>
              </button>
              <button onClick={() => setShowAddModal(true)} className="group flex items-center gap-3 px-6 py-3 bg-linear-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-2xl shadow-[0_8px_20px_rgba(99,102,241,0.3)] hover:shadow-[0_12px_30px_rgba(99,102,241,0.4)] transition-all duration-300 hover:-translate-y-1">
                <div className="bg-white/20 p-2 rounded-xl group-hover:rotate-90 transition-transform duration-500">
                  <FaPlus size={18} />
                </div>
                <span className="font-semibold hidden sm:block">{tPatients('addButton')}</span>
              </button>
            </div>
          </div>

          {/* Glass Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="group relative bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border border-white/60 dark:border-white/5 rounded-4xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-500 hover:-translate-y-2 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-white/40 to-transparent dark:from-white/5 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
                <div className="relative z-10 flex flex-col h-full">
                  <div className={`flex items-center justify-between mb-4`}>
                    <div className={`w-14 h-14 rounded-2xl bg-linear-to-br ${stat.gradient} flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform duration-500`}>
                      <stat.icon className="text-xl" />
                    </div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">{tPatients('statLabel')}</div>
                  </div>
                  <h3 className="text-slate-500 dark:text-slate-400 font-medium mb-1">{stat.title}</h3>
                  <p className="text-4xl font-extrabold text-slate-800 dark:text-white tracking-tight">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Filter Toolbar - Glass */}
          <div className="sticky top-6 z-40 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/50 dark:border-slate-700/50 rounded-3xl p-4 shadow-[0_8px_32px_rgba(0,0,0,0.04)] flex flex-col md:flex-row gap-4 items-center">
            <div className="relative w-full md:w-100 group">
              <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                <FaMagnifyingGlass />
              </div>
              <input
                type="text"
                placeholder={tPatients('searchPlaceholder')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pr-12 pl-4 py-3.5 bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-slate-800 dark:text-slate-100 placeholder-slate-400 transition-all outline-none"
              />
            </div>
            <div className="flex gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
               <select value={filterGender ?? ""} onChange={(e) => setFilterGender(e.target.value)} className="flex-1 min-w-30 px-5 py-3.5 bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-slate-700 dark:text-slate-200 transition-all outline-none appearance-none cursor-pointer font-medium hover:bg-slate-100 dark:hover:bg-slate-800">
                <option value="all">{tPatients('filters.genderAll')}</option>
                <option value="male">{gendersMap.male}</option>
                <option value="female">{gendersMap.female}</option>
              </select>
              <select value={filterStatus ?? ""} onChange={(e) => setFilterStatus(e.target.value)} className="flex-1 min-w-30 px-5 py-3.5 bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-slate-700 dark:text-slate-200 transition-all outline-none appearance-none cursor-pointer font-medium hover:bg-slate-100 dark:hover:bg-slate-800">
                <option value="all">{tPatients('filters.statusAll') || 'الكل'}</option>
                <option value="active">{statusesMap.active}</option>
                <option value="suspended">{statusesMap.suspended}</option>
              </select>
            </div>
          </div>

          {/* Patient Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 pb-20">
            {filteredPatients.map((patient, idx) => (
              <div key={patient.id || idx} className="group relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/50 dark:border-slate-700/50 rounded-4xl p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_25px_50px_rgba(0,0,0,0.1)] transition-all duration-500 hover:-translate-y-3 overflow-hidden">
                
                {/* Shiny Hover Effect */}
                <div className="absolute inset-0 bg-linear-to-tr from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none"></div>

                <div className="relative z-10 flex flex-col h-full">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-4xl bg-linear-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center text-4xl shadow-inner border border-white/50 dark:border-slate-600">
                        {patient.avatar || (patient.gender === 'male' ? '👨‍⚕️' : '👩‍⚕️')}
                      </div>
                      <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-md border border-slate-100 dark:border-slate-700">
                         <span className={`text-lg ${patient.gender === 'male' ? 'text-blue-500' : 'text-pink-500'}`}>{patient.gender === 'male' ? '♂' : '♀'}</span>
                      </div>
                    </div>
                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusStyle(patient.status)} backdrop-blur-md`}>
                      {statusesMap[patient.status] || patient.status}
                    </span>
                  </div>

                  {/* Identity */}
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{patient.name}</h3>
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm font-medium">
                      <FaEnvelope className="text-slate-400" /> {patient.email}
                    </div>
                  </div>

                  {/* Info Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="p-3 rounded-2xl bg-slate-50/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 flex flex-col gap-1 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                      <span className="text-xs text-slate-400 font-semibold uppercase">{tPatients('labels.phone')}</span>
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate">{patient.phone || '-'}</span>
                    </div>
                    <div className="p-3 rounded-2xl bg-slate-50/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 flex flex-col gap-1 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                      <span className="text-xs text-slate-400 font-semibold uppercase">{tPatients('labels.age')}</span>
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{patient.age || '-'} {tPatients('ageUnit')}</span>
                    </div>
                    <div className="p-3 rounded-2xl bg-rose-50/50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/30 flex flex-col gap-1">
                      <span className="text-xs text-rose-400 font-semibold uppercase flex items-center gap-1"><FaHeart /> {tPatients('labels.blood')}</span>
                      <span className="text-sm font-bold text-rose-700 dark:text-rose-300">{patient.bloodType || '-'}</span>
                    </div>
                    <div className="p-3 rounded-2xl bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30 flex flex-col gap-1">
                      <span className="text-xs text-indigo-400 font-semibold uppercase flex items-center gap-1"><FaUserDoctor /> {tPatients('labels.doctor')}</span>
                      <span className="text-sm font-bold text-indigo-700 dark:text-indigo-300 truncate" title={patient.doctorName}>{patient.doctorName || '-'}</span>
                    </div>
                  </div>

                  {/* Tags */}
                  {(patient.allergies?.length > 0 || patient.chronicDiseases?.length > 0) && (
                    <div className="flex flex-wrap gap-2 mb-8">
                      {patient.allergies?.slice(0, 2).map((a, i) => (
                        <span key={i} className="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-rose-800">{a}</span>
                      ))}
                      {patient.chronicDiseases?.slice(0, 2).map((d, i) => (
                        <span key={i} className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-300 border border-amber-200 dark:border-amber-800">{d}</span>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-800/50 flex gap-4">
                    <button onClick={() => openEditModal(patient)} className="flex-1 group/btn flex items-center justify-center gap-2 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 transition-all duration-300 font-medium text-sm">
                      <FaPencil className="group-hover/btn:scale-110 transition-transform" size={14} />
                      {tPatients('actions.edit')}
                    </button>
                    <button onClick={() => openDeleteModal(patient)} className="flex-1 group/btn flex items-center justify-center gap-2 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-rose-600 hover:text-white dark:hover:bg-rose-600 transition-all duration-300 font-medium text-sm">
                      <FaTrash className="group-hover/btn:scale-110 transition-transform" size={14} />
                      {tPatients('actions.delete')}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredPatients.length === 0 && (
            <div className="text-center py-24 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md rounded-4xl border border-dashed border-slate-300 dark:border-slate-700">
              <div className="inline-block p-6 rounded-full bg-slate-100 dark:bg-slate-800 mb-6 text-slate-400 animate-bounce">
                <FaUsers size={48} />
              </div>
              <p className="text-xl font-medium text-slate-500 dark:text-slate-400">{tPatients('table.noMatches')}</p>
            </div>
          )}
        </div>

        {/* ================= Premium Modals ================= */}
        {(showAddModal || showEditModal || showDeleteModal) && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
             {/* Backdrop */}
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300" onClick={() => { setShowAddModal(false); setShowEditModal(false); setShowDeleteModal(false); }}></div>

            {/* Modal Content */}
            {(showAddModal || showEditModal) && (
                <div className="relative bg-white dark:bg-slate-900 rounded-4xl shadow-2xl w-full max-w-lg overflow-hidden animate-[slideUp_0.3s_ease-out] border border-white/20">
                  <div className="bg-linear-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                    {showAddModal ? tPatients('modals.addTitle') : tPatients('modals.editTitle')}
                  </h3>
                  <button onClick={() => { setShowAddModal(false); setShowEditModal(false); }} className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-rose-100 hover:text-rose-500 transition-colors">
                    <FaX />
                  </button>
                </div>
                
                <div className="p-8 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">{tPatients('modals.fullName')}</label>
                      <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all text-slate-800 dark:text-white" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">{tPatients('modals.email')}</label>
                      <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-slate-800 dark:text-white" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">{tPatients('modals.phone')}</label>
                    <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-slate-800 dark:text-white" />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">{tPatients('modals.gender')}</label>
                      <select value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-slate-800 dark:text-white appearance-none">
                        <option value="male">{gendersMap.male}</option>
                        <option value="female">{gendersMap.female}</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">{tPatients('modals.bloodType')}</label>
                      <input type="text" value={formData.bloodType} onChange={(e) => setFormData({ ...formData, bloodType: e.target.value })} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-slate-800 dark:text-white" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">{tPatients('modals.doctor')}</label>
                    <select value={formData.doctorId ?? ""} onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-slate-800 dark:text-white appearance-none">
                      <option value="">{tPatients('selectDoctorPlaceholder')}</option>
                      {doctorsList.map((d) => (<option key={d.id} value={d.id}>{(d.user && d.user.fullName) || d.fullName || d.email}</option>))}
                    </select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">{safeT('modals.birthDate')}</label>
                      <input type="date" value={formData.birthDate || ""} onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-slate-800 dark:text-white" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">{safeT('modals.status')}</label>
                      <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-slate-800 dark:text-white appearance-none">
                        <option value="active">{statusesMap.active}</option>
                        <option value="suspended">{statusesMap.suspended}</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="px-8 py-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex gap-4">
                  <button onClick={showAddModal ? handleAddPatient : handleEditPatient} className="flex-1 bg-linear-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white py-3.5 rounded-2xl font-bold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all active:scale-95 flex items-center justify-center gap-2">
                    <FaFloppyDisk /> {showAddModal ? tPatients('buttons.save') : tPatients('buttons.saveChanges')}
                  </button>
                  <button onClick={() => { setShowAddModal(false); setShowEditModal(false); }} className="px-8 py-3.5 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all active:scale-95">
                    {tPatients('buttons.cancel')}
                  </button>
                </div>
              </div>
            )}

            {/* Delete Modal */}
            {showDeleteModal && selectedPatient && (
              <div className="relative bg-white dark:bg-slate-900 rounded-4xl shadow-2xl w-full max-w-sm p-8 text-center animate-[zoomIn_0.2s_ease-out]">
                <div className="w-20 h-20 bg-linear-to-br from-rose-100 to-rose-50 dark:from-rose-900/20 dark:to-rose-900/10 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl shadow-inner border border-rose-100 dark:border-rose-800">⚠️</div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">{tPatients('confirmDelete.title')}</h3>
                <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm leading-relaxed">
                  {tPatients('confirmDelete.description', { name: selectedPatient.name })}
                </p>
                <div className="flex gap-4">
                  <button onClick={handleDeletePatient} className="flex-1 bg-linear-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white py-3.5 rounded-2xl font-bold shadow-lg shadow-rose-500/25 transition-all active:scale-95">
                    {tPatients('confirmDelete.yes')}
                  </button>
                  <button onClick={() => setShowDeleteModal(false)} className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 py-3.5 rounded-2xl font-bold transition-all active:scale-95">
                    {tPatients('confirmDelete.no')}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}