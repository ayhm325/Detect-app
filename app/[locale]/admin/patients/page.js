"use client";
import React, { useState } from "react";
import useSWR from 'swr';
import AdminLayout from "../AdminLayout";
import { useToast } from "../../../components/ui/Toast";
import useLocale from "../../../hooks/useLocale";
import { useTranslations } from "next-intl";
import {
  FaUsers,
  FaMagnifyingGlass,
  FaPlus,
  FaDownload,
  FaEye,
  FaPencil,
  FaTrash,
  FaX,
  FaFloppyDisk,
  FaEnvelope,
  FaPhone,
  FaCalendar,
  FaClock,
  FaHeart,
  FaVial,
} from "react-icons/fa6";


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
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const emptyForm = { name: "", email: "", phone: "", gender: "male", age: "", medicalId: "", doctorId: "", status: "active", bloodType: "", birthDate: "", allergies: "", chronicDiseases: "" };
  const [formData, setFormData] = useState({ ...emptyForm });
  const [doctorsList, setDoctorsList] = useState([]);

  // جلب بيانات المرضى الحقيقية من API باستخدام SWR
  const fetcher = (url) => fetch(url).then((res) => res.json());
  const { data: patients = [], error, isLoading, mutate } = useSWR('/api/admin/patients', fetcher);
  const [patientsState, setPatients] = useState([]);
  // عند وصول البيانات من السيرفر، خزّنها في الحالة المحلية (للتعديل/الحذف/الإضافة)
  const formatDate = (d) => {
    if (!d) return "";
    try {
      return new Date(d).toLocaleString(locale === 'en' ? 'en-US' : 'ar-SA', { dateStyle: 'medium', timeStyle: 'short' });
    } catch {
      return String(d);
    }
  };

  // Age computation is performed during normalization effect to keep render pure.

  const safeT = (key, fallback = "") => {
    try {
      const v = tPatients(key);
      return typeof v === 'string' && v.length ? v : fallback;
    } catch (e) {
      return fallback;
    }
  };
  React.useEffect(() => {
    if (patients && Array.isArray(patients)) {
      // capture current time once for consistent age calculation
      const now = Date.now();
      const computeAgeFrom = (birthDate) => {
        if (!birthDate) return null;
        try {
          const bd = new Date(birthDate);
          const diff = now - bd.getTime();
          const ageDt = new Date(diff);
          return Math.abs(ageDt.getUTCFullYear() - 1970);
        } catch {
          return null;
        }
      };
      // Normalize patient objects returned from the API so UI fields exist
      const normalized = patients.map((p) => {
        const user = p.user || {};
        const doctorUser = p.doctor?.user || p.doctor || null;
        return {
          // Use fields directly from DB / relations. No computed fallbacks.
          id: p.id || null,
          userId: p.userId || user.id || null,
          name: user.fullName || p.fullName || "",
          email: user.email || p.email || "",
          phone: p.phone || user.phone || "",
          gender: p.gender || "",
          // Age: prefer DB value; otherwise compute once here using captured `now`
          age: p.age ?? computeAgeFrom(p.birthDate || p.birthdate) ?? null,
          birthDate: p.birthDate || p.birthdate || null,
          medicalId: p.medicalId || p.patientId || null,
          // Avatar only if provided by DB
          avatar: p.avatar || null,
          // Status should come from DB (do not derive from user.isActive)
          status: p.status || null,
          appointmentsCount: p._count?.appointments ?? 0,
          reportsCount: p._count?.medicalRecords ?? 0,
          // Keep formatting for display, but source is DB fields
          lastVisit: p.lastVisit ? formatDate(p.lastVisit) : (p.updatedAt ? formatDate(p.updatedAt) : ""),
          joinDate: p.joinDate ? formatDate(p.joinDate) : (p.createdAt ? formatDate(p.createdAt) : ""),
          bloodType: p.bloodType || "",
          allergies: p.allergies || [],
          chronicDiseases: p.chronicDiseases || [],
          doctorId: p.doctor?.id || p.doctorId || (doctorUser ? (doctorUser.id || doctorUser.userId) : null),
          doctorName: doctorUser ? (doctorUser.fullName || doctorUser.name) : (p.doctorName || ""),
        };
      });
      setPatients(normalized);
    }
  }, [patients?.length]);

  // Fetch doctors list for the doctor selector in edit modal
  React.useEffect(() => {
    let mounted = true;
    fetch('/api/admin/doctors')
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : (data.doctors || []);
        if (mounted) setDoctorsList(list);
      })
      .catch(() => {
        if (mounted) setDoctorsList([]);
      });
    return () => { mounted = false; };
  }, []);
  if (error) return <div>حدث خطأ أثناء جلب بيانات المرضى.</div>;
  if (isLoading) return <div>جاري تحميل بيانات المرضى...</div>;

  // Stats Configuration
  const stats = [
    {
      title: tPatients('stats.totalPatients'),
      value: patientsState.length,
      icon: FaUsers,
      color: "text-blue-600",
      bgLight: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      title: tPatients('stats.activePatients'),
      value: patientsState.filter((p) => p.status === "active").length,
      icon: FaHeart,
      color: "text-green-600",
      bgLight: "bg-green-50 dark:bg-green-900/20",
    },
    {
      title: tPatients('stats.todayVisits'),
      value: patientsState.reduce((sum, p) => sum + (p.appointmentsCount || 0), 0),
      icon: FaCalendar,
      color: "text-orange-600",
      bgLight: "bg-orange-50 dark:bg-orange-900/20",
    },
    {
      title: tPatients('stats.totalReports'),
      value: patientsState.reduce((sum, p) => sum + (p.reportsCount || 0), 0),
      icon: FaVial,
      color: "text-purple-600",
      bgLight: "bg-purple-50 dark:bg-purple-900/20",
    },
  ];

  // Helper Functions
  const gendersMap = {
    male: tPatients('genders.male'),
    female: tPatients('genders.female'),
  };

  const statusesMap = {
    active: tPatients('statuses.active'),
    pending: tPatients('statuses.suspended') || tPatients('statuses.pending'),
    banned: tPatients('statuses.banned'),
    suspended: tPatients('statuses.banned'),
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300";
      case "pending":
        return "border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300";
      case "banned":
      case "suspended":
        return "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300";
      default:
        return "border-gray-500 bg-gray-50 dark:bg-gray-900/20 text-gray-700 dark:text-gray-300";
    }
  };

  const getGenderColor = (gender) => {
    return gender === "male" ? "text-blue-600" : "text-pink-600";
  };

  // Event Handlers
  const handleAddPatient = async () => {
    if (!formData.name || !formData.email || !formData.phone) {
      showToast(tPatients('toast.fillFields'), "error");
      return;
    }
    try {
      // إعداد البيانات للإرسال (بدون age، والعمر يُحسب من birthDate في الخادم)
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        gender: formData.gender,
        medicalId: formData.medicalId || undefined,
        doctorId: formData.doctorId || undefined,
        status: formData.status === 'banned' || formData.status === 'suspended' ? 'suspended' : 'active',
        bloodType: formData.bloodType || undefined,
        birthDate: formData.birthDate || undefined,
        allergies: formData.allergies ? formData.allergies.split(',').map(s => s.trim()).filter(Boolean) : undefined,
        chronicDiseases: formData.chronicDiseases ? formData.chronicDiseases.split(',').map(s => s.trim()).filter(Boolean) : undefined,
      };
      const res = await fetch('/api/admin/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        showToast(err?.error || tPatients('toast.patientAdded'), 'error');
        return;
      }
      // تحديث القائمة من الخادم
      await mutate();
      setFormData({ ...emptyForm });
      setShowAddModal(false);
      showToast(tPatients('toast.patientAdded'), "success");
    } catch (e) {
      console.error('Add patient error:', e);
      showToast(e.message || String(e), 'error');
    }
  };

  const handleEditPatient = async () => {
    if (!formData.name || !formData.email || !formData.phone) {
      showToast(tPatients('toast.fillFields'), "error");
      return;
    }
    if (!selectedPatient?.id) {
      showToast(tPatients('toast.patientUpdated'), "error");
      return;
    }
    try {
      // Prepare payload: convert comma-separated strings to arrays where appropriate
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        gender: formData.gender,
        age: formData.age || undefined,
        medicalId: formData.medicalId || undefined,
        doctorId: formData.doctorId || undefined,
        status: formData.status === 'banned' || formData.status === 'suspended' ? 'suspended' : (formData.status || undefined),
        bloodType: formData.bloodType || undefined,
        birthDate: formData.birthDate || undefined,
        allergies: formData.allergies ? formData.allergies.split(',').map(s => s.trim()).filter(Boolean) : undefined,
        chronicDiseases: formData.chronicDiseases ? formData.chronicDiseases.split(',').map(s => s.trim()).filter(Boolean) : undefined,
      };

      const targetId = selectedPatient.id || selectedPatient.userId;
      const res = await fetch(`/api/admin/patients/${targetId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        let errText = await res.text();
        let errObj = {};
        try {
          errObj = JSON.parse(errText);
        } catch {}
        console.error('Edit patient error:', errObj, errText);
        showToast(errObj?.error || errText || tPatients('toast.patientUpdated'), 'error');
        return;
      }
      // refresh SWR cache to get authoritative data from server
      await mutate();
      setFormData({ name: "", email: "", phone: "", gender: "male", age: "", medicalId: "", doctorId: "", status: "", bloodType: "", birthDate: "", allergies: "", chronicDiseases: "" });
      setShowEditModal(false);
      showToast(tPatients('toast.patientUpdated'), "success");
    } catch (e) {
      console.error('Edit patient error:', e);
      showToast(e.message || String(e), 'error');
    }
  };

  const handleDeletePatient = () => {
    (async () => {
      try {
        const targetId = selectedPatient?.id || selectedPatient?.userId;
        if (!targetId) {
          showToast(tPatients('toast.patientDeleted'), 'error');
          setShowDeleteModal(false);
          return;
        }
        const res = await fetch(`/api/admin/patients/${targetId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'suspended' }),
        });
        if (!res.ok) {
          const txt = await res.text();
          let obj = {};
          try { obj = JSON.parse(txt); } catch {}
          console.error('Soft delete error:', obj, txt);
          showToast(obj?.error || txt || tPatients('toast.patientDeleted'), 'error');
          setShowDeleteModal(false);
          return;
        }
        await mutate();
        setShowDeleteModal(false);
        showToast(tPatients('toast.patientDeleted'), 'success');
      } catch (e) {
        console.error('Soft delete exception:', e);
        showToast(e.message || String(e), 'error');
        setShowDeleteModal(false);
      }
    })();
  };

  const handleExport = () => {
    const headers = [
      tPatients('csvHeader_id'),
      tPatients('csvHeader_name'),
      tPatients('csvHeader_gender'),
      tPatients('csvHeader_birthDate'),
      tPatients('csvHeader_bloodType'),
      tPatients('csvHeader_phone'),
      tPatients('csvHeader_email'),
      tPatients('csvHeader_status'),
      tPatients('csvHeader_joinDate'),
      tPatients('csvHeader_doctor'),
    ];
    const csv = [
      headers,
      ...patientsState.map((p) => [
        p.medicalId,
        p.name,
        gendersMap[p.gender] || p.gender,
        p.birthDate,
        p.bloodType,
        p.phone,
        p.email,
        statusesMap[p.status] || p.status,
        p.joinDate,
        p.doctorName,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "patients.csv";
    a.click();
    showToast(tPatients('toast.exportStarted'), "success");
  };

  const openEditModal = (patient) => {
    setSelectedPatient(patient);
    setFormData({
      name: patient.name || "",
      email: patient.email || "",
      phone: patient.phone || "",
      gender: patient.gender || "",
      age: patient.age || "",
      medicalId: patient.medicalId || "",
      doctorId: patient.doctorId || patient.doctorId || "",
      status: patient.status === 'banned' ? 'suspended' : (patient.status || ""),
      bloodType: patient.bloodType || "",
      birthDate: patient.birthDate ? (new Date(patient.birthDate)).toISOString().split('T')[0] : "",
      allergies: Array.isArray(patient.allergies) ? patient.allergies.join(', ') : (patient.allergies || '').toString(),
      chronicDiseases: Array.isArray(patient.chronicDiseases) ? patient.chronicDiseases.join(', ') : (patient.chronicDiseases || '').toString(),
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (patient) => {
    setSelectedPatient(patient);
    setShowDeleteModal(true);
  };

  const openDetailsModal = (patient) => {
    setSelectedPatient(patient);
    setShowDetailsModal(true);
  };

  // Filtering
  const filteredPatients = patientsState.filter((patient) => {
    const lowerSearch = (search || "").toString().trim().toLowerCase();
    const name = (patient?.name || "").toString().toLowerCase();
    const email = (patient?.email || "").toString().toLowerCase();
    const phone = (patient?.phone || "").toString().toLowerCase();
    const medicalId = (patient?.medicalId || "").toString().toLowerCase();

    const matchSearch =
      lowerSearch === "" ||
      name.includes(lowerSearch) ||
      email.includes(lowerSearch) ||
      phone.includes(lowerSearch) ||
      medicalId.includes(lowerSearch);

    const matchGender = filterGender === "all" || (patient?.gender || "male") === filterGender;
    const matchStatus = filterStatus === "all" || (patient?.status || "pending") === filterStatus;
    return matchSearch && matchGender && matchStatus;
  });

  return (
    <AdminLayout breadcrumbs={[tPatients('breadcrumbs.home'), tPatients('breadcrumbs.patients')] }>
      <ToastContainer />
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{tPatients('headerTitle')}</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">{tPatients('headerSubtitle')}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <FaDownload />
              <span>{tPatients('exportButton')}</span>
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <FaPlus />
              <span>{tPatients('addButton')}</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-slate-700"
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${stat.bgLight}`}>
                  <stat.icon className={`text-2xl ${stat.color}`} />
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 mb-8 border border-gray-200 dark:border-slate-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <FaMagnifyingGlass className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={tPatients('searchPlaceholder')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pr-10 pl-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={filterGender}
              onChange={(e) => setFilterGender(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">{tPatients('filters.genderAll')}</option>
              <option value="male">{gendersMap.male}</option>
              <option value="female">{gendersMap.female}</option>
            </select>           
          </div>
        </div>

        {/* Patients Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPatients.map((patient, idx) => (
            <div
              key={patient.id || patient.medicalId || patient.email || idx}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 overflow-hidden hover:shadow-xl transition-shadow"
            >
              <div className="p-6">
                <div className="flex flex-col sm:flex-row gap-6">
                  <div className="shrink-0 w-full sm:w-44 flex flex-col items-center text-center">
                    <div className="text-7xl">{patient.avatar}</div>
                    <div className={`mt-3 px-3 py-1 rounded-full text-sm border ${getStatusColor(patient.status)}`}>{statusesMap[patient.status] || patient.status}</div>
                    <div className="mt-4 w-full grid grid-cols-2 gap-3">
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded p-3">
                        <div className="text-sm text-gray-600 dark:text-gray-400">{tPatients('cards.appointments')}</div>
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{patient.appointmentsCount}</div>
                      </div>
                      <div className="bg-purple-50 dark:bg-purple-900/20 rounded p-3">
                        <div className="text-sm text-gray-600 dark:text-gray-400">{tPatients('cards.reports')}</div>
                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{patient.reportsCount}</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{patient.name}</h3>
                      <p className="text-base text-gray-500 dark:text-gray-400 mt-1">{patient.email || '-'}</p>
                      {patient.doctorName && (
                        <p className="text-base text-gray-500 dark:text-gray-400 mt-1">{safeT('cards.doctor','الطبيب')}: <span className="font-medium text-gray-900 dark:text-white">{patient.doctorName}</span></p>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 text-right">
                      <div className="text-xs text-gray-500">{tPatients('cards.lastVisit')}:</div>
                      <div className="font-medium text-gray-900 dark:text-white">{patient.lastVisit || '-'}</div>
                      <div className="mt-2 text-xs text-gray-500">{safeT('modals.joinDate','تاريخ الانضمام')}:</div>
                      <div className="font-medium text-gray-900 dark:text-white">{patient.joinDate || '-'}</div>
                    </div>
                  </div>

                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-base text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-3"><FaPhone className="text-lg text-gray-400" /><div className="font-medium text-gray-900 dark:text-white">{patient.phone || '-'}</div></div>
                      <div className="flex items-center gap-3"><span className={getGenderColor(patient.gender)}>{patient.gender === 'male' ? '♂️' : '♀️'}</span><div className="font-medium text-gray-900 dark:text-white">{gendersMap[patient.gender] || patient.gender} • {(patient.age !== null && patient.age !== undefined && patient.age !== "") ? patient.age : '-'} {tPatients('ageUnit')}</div></div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-4 text-base text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-3"><FaHeart className="text-2xl text-red-400" /><div>{safeT('modals.bloodType','فصيلة الدم')}: <span className="font-medium text-gray-900 dark:text-white">{patient.bloodType || '-'}</span></div></div>
                      <div className="flex items-center gap-3"><FaUsers className="text-lg text-gray-400" /><div>{safeT('modals.doctor','الطبيب')}: <span className="font-medium text-gray-900 dark:text-white">{patient.doctorName || '-'}</span></div></div>
                    </div>

                    {patient.allergies && patient.allergies.length > 0 && (
                      <div className="mt-4">
                        <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">{safeT('modals.allergies','الحساسية')}</div>
                        <div className="flex flex-wrap gap-2">
                          {patient.allergies.map((a,i) => <span key={i} className="px-4 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full text-sm">{a}</span>)}
                        </div>
                      </div>
                    )}

                    {patient.chronicDiseases && patient.chronicDiseases.length > 0 && (
                      <div className="mt-3">
                        <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">{safeT('modals.chronicDiseases','الأمراض المزمنة')}</div>
                        <div className="flex flex-wrap gap-2">
                          {patient.chronicDiseases.map((d,i) => <span key={i} className="px-4 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full text-sm">{d}</span>)}
                        </div>
                      </div>
                    )}

                    <div className="mt-4 flex gap-2">
                      <button onClick={() => openEditModal(patient)} className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg transition-colors text-sm"><FaPencil />{tPatients('actions.edit')}</button>
                      <button onClick={() => openDeleteModal(patient)} className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg transition-colors text-sm"><FaTrash />{tPatients('actions.delete')}</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredPatients.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">{tPatients('table.noMatches')}</p>
          </div>
        )}

        {/* Add Patient Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{tPatients('modals.addTitle')}</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"
                >
                  <FaX className="text-gray-600 dark:text-gray-400" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{tPatients('modals.fullName')}</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{tPatients('modals.email')}</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{tPatients('modals.phone')}</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{tPatients('modals.gender')}</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white"
                    >
                      <option value="male">{gendersMap.male}</option>
                      <option value="female">{gendersMap.female}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{tPatients('modals.bloodType') || 'فصيلة الدم'}</label>
                    <input
                      type="text"
                      value={formData.bloodType}
                      onChange={(e) => setFormData({ ...formData, bloodType: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{tPatients('modals.doctor') || 'الطبيب'}</label>
                    <select
                      value={formData.doctorId}
                      onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white"
                    >
                      <option value="">-- {safeT('modals.selectDoctor','اختر طبيب')} --</option>
                      {doctorsList.map((d) => (
                        <option key={d.id} value={d.id}>{(d.user && d.user.fullName) || d.fullName || d.user?.fullName || d.email || d.id}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{safeT('modals.status','الحالة')}</label>
                      <div className="flex items-center gap-4">
                        <label className="inline-flex items-center gap-2">
                          <input
                            type="radio"
                            name="status"
                            value="active"
                            checked={formData.status === 'active'}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            className="text-blue-600"
                          />
                          <span className="text-lg font-semibold">{statusesMap.active}</span>
                        </label>
                        <label className="inline-flex items-center gap-2">
                          <input
                            type="radio"
                            name="status"
                            value="suspended"
                            checked={formData.status === 'suspended'}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            className="text-red-600"
                          />
                          <span className="text-lg font-semibold">{statusesMap.suspended}</span>
                        </label>
                      </div>
                    </div>                   
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{safeT('modals.birthDate','تاريخ الميلاد')}</label>
                      <input
                        type="date"
                        value={formData.birthDate || ""}
                        onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handleAddPatient}
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg transition-colors"
                  >
                    <FaFloppyDisk />
                    <span>{tPatients('buttons.save')}</span>
                  </button>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-lg transition-colors"
                  >
                    {tPatients('buttons.cancel')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================== Edit Patient Modal  =======================*/}
        {showEditModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{tPatients('modals.editTitle')}</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"
                >
                  <FaX className="text-gray-600 dark:text-gray-400" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{tPatients('modals.fullName')}</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{tPatients('modals.email')}</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{tPatients('modals.phone')}</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white"
                  />
                </div>
                 <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{safeT('modals.birthDate','تاريخ الميلاد')}</label>
                      <input
                        type="date"
                        value={formData.birthDate}
                        onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white"
                      />
                  </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{tPatients('modals.gender')}</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white"
                    >
                      <option value="male">{gendersMap.male}</option>
                      <option value="female">{gendersMap.female}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{tPatients('modals.bloodType') || 'فصيلة الدم'}</label>
                    <input
                      type="text"
                      value={formData.bloodType}
                      onChange={(e) => setFormData({ ...formData, bloodType: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{tPatients('modals.doctor') || 'الطبيب'}</label>
                  <select
                    value={formData.doctorId}
                    onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white"
                  >
                    <option value="">-- {safeT('modals.selectDoctor','اختر طبيب')} --</option>
                    {doctorsList.map((d) => (
                      <option key={d.id} value={d.id}>{(d.user && d.user.fullName) || d.fullName || d.user?.fullName || d.email || d.id}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{safeT('modals.status','الحالة')}</label>
                  <div className="flex items-center gap-4">
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="radio"
                        name="edit_status"
                        value="active"
                        checked={formData.status === 'active'}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="text-blue-600"
                      />
                      <span className="text-lg font-semibold">{statusesMap.active}</span>
                    </label>
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="radio"
                        name="edit_status"
                        value="suspended"
                        checked={formData.status === 'suspended'}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="text-red-600"
                      />
                      <span className="text-lg font-semibold">{statusesMap.suspended}</span>
                    </label>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleEditPatient}
                  className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg transition-colors"
                >
                  <FaFloppyDisk />
                  <span>{tPatients('buttons.saveChanges')}</span>
                </button>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-lg transition-colors"
                >
                  {tPatients('buttons.cancel')}
                </button>
              </div>
            </div>
          </div>
        )}


        {/* Delete Confirmation Modal */}
        {showDeleteModal && selectedPatient && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-md w-full p-6">
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">⚠️</div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{tPatients('confirmDelete.title')}</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {tPatients('confirmDelete.description', { name: selectedPatient.name })}
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleDeletePatient}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg transition-colors font-medium"
                >
                  {tPatients('confirmDelete.yes')}
                </button>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-lg transition-colors"
                >
                  {tPatients('confirmDelete.no')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
