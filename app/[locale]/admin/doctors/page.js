
"use client";


// توحيد منطق الحالة للطبيب بناءً على الحقل الرسمي فقط
const getDoctorStatus = (doctor) => {
  // الحالة الرسمية الوحيدة هي doctor.status
  // القيم: pending | active | banned
  return doctor.status || "pending";
};
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
// Page is rendered inside the route-level AdminLayout; avoid double-wrapping
import DoctorDetailsCard from "../../../components/admin/DoctorDetailsCard";
import DoctorsTable from "../../../components/admin/DoctorsTable";
import { useToast, ToastContainer } from "../../../components/ui/ToastProvider";
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
  FaStethoscope,
  FaVial,
  FaCertificate,
  FaStar,
} from "react-icons/fa6";


function DoctorsPage() {
    // Add Doctor logic
    const handleAddDoctor = async () => {
      // Basic validation
      if (!formData.name?.trim() || !formData.email?.trim() || !formData.phone?.trim() || !formData.licenseNumber?.trim() || !formData.status?.trim()) {
        showError(tDoctors('toast.fillFields'));
        return;
      }
      try {
        const res = await fetch('/api/admin/doctors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name.trim(),
            email: formData.email.trim(),
            phone: formData.phone.trim(),
            licenseNumber: formData.licenseNumber.trim(),
            status: formData.status.trim()
          })
        });
        if (res.ok) {
          const data = await res.json();
          setDoctors([data.doctor, ...doctors]);
          showSuccess(tDoctors('toast.doctorAdded'));
          setShowAddModal(false);
          setFormData({
            name: '',
            email: '',
            phone: '',
            licenseNumber: '',
            status: 'active',
            specialty: 'general',
            experience: ''
          });
        } else {
          const errorData = await res.json();
          showError(errorData?.error || tDoctors('toast.deleteFailed') || 'Add failed');
        }
      } catch (e) {
        showError(e?.message || tDoctors('toast.deleteFailed') || 'Add failed');
      }
    };
  const searchParams = useSearchParams();
  const { showSuccess, showError, showInfo } = useToast();
  const tDoctors = useTranslations('DoctorsManagement');

  // State
  const [search, setSearch] = useState("");
  const [filterSpecialty, setFilterSpecialty] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    specialty: "general",
    experience: "",
    status: "active",
  });


  // جلب جميع الأطباء
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  // جلب الطلبات المعلقة فقط
  const [pendingDoctors, setPendingDoctors] = useState([]);
  useEffect(() => {
    // جلب جميع الأطباء (لجدول الكل)
    fetch("/api/admin/dashboard-stats")
      .then((res) => res.json())
      .then((data) => {
        setDoctors(data.debug?.allDoctors || []);
        setPatients(data.debug?.allPatients || []);
        setAdmins((data.debug?.allUsers || []).filter(u => u.role === "admin"));
        setLoading(false);
      });
    // جلب الأطباء المعلقين فقط
    fetch("/api/admin/doctors")
      .then((res) => res.json())
      .then((data) => {
        setPendingDoctors(Array.isArray(data.doctors) ? data.doctors.filter(d => getDoctorStatus(d) === "pending") : []);
      });
  }, []);


  // إحصائيات شاملة
  const stats = [
    {
      title: tDoctors('stats.totalDoctors'),
      value: doctors.length,
      icon: FaStethoscope,
      color: "text-blue-600",
      bgLight: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      title: tDoctors('stats.totalPatients'),
      value: patients.length,
      icon: FaUsers,
      color: "text-green-600",
      bgLight: "bg-green-50 dark:bg-green-900/20",
    },
    {
      title: tDoctors('stats.totalAdmins'),
      value: admins.length,
      icon: FaCertificate,
      color: "text-purple-600",
      bgLight: "bg-purple-50 dark:bg-purple-900/20",
    },
  ];

  // Helper Functions
  const specialtiesMap = {
    radiology: tDoctors('specialties.radiology'),
    pulmonology: tDoctors('specialties.pulmonology'),
    orthopedics: tDoctors('specialties.orthopedics'),
    gynecology: tDoctors('specialties.gynecology'),
    cardiology: tDoctors('specialties.cardiology'),
    internal: tDoctors('specialties.internal'),
    general: tDoctors('specialties.general'),
  };
  
  const statusesMap = {
    active: tDoctors('statuses.active'),
    suspended: tDoctors('statuses.suspended'),
    banned: tDoctors('statuses.banned'),
    pending: tDoctors('statuses.pending'),
  };
  
  const specialties = Object.keys(specialtiesMap);

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300";
      case "suspended":
        return "border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300";
      case "banned":
        return "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300";
      default:
        return "border-gray-500 bg-gray-50 dark:bg-gray-900/20 text-gray-700 dark:text-gray-300";
    }
  };

  const getRatingColor = (rating) => {
    if (rating >= 4.7) return "text-yellow-500";
    if (rating >= 4.5) return "text-yellow-400";
    return "text-gray-400";
  };

  // ...باقي الكود...
// ...existing code continues...

  const handleEditDoctor = async () => {
    console.log('DEBUG formData:', formData);
    // Trim all fields before validation
    const name = (formData.name || '').trim();
    const email = (formData.email || '').trim();
    const phone = (formData.phone || '').trim();
    const status = (formData.status || '').trim();
    const licenseNumber = (formData.licenseNumber || '').trim();
    if (!name || !email || !phone || !status || !licenseNumber) {
      showError(tDoctors('toast.fillFields'));
      return;
    }
    if (!selectedDoctor) return;
    // Always use userId for PATCH endpoint if available
    const doctorId = selectedDoctor.userId || selectedDoctor.id;
    console.log('DEBUG PATCH doctorId:', doctorId, selectedDoctor);
    if (!doctorId) {
      showError('لا يوجد معرف للطبيب');
      return;
    }
    try {
      const res = await fetch(`/api/admin/doctors/${doctorId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          status: formData.status,
          licenseNumber: formData.licenseNumber
        })
      });
      if (res.ok) {
        setDoctors(doctors.map((d) => d.id === selectedDoctor.id ? { ...d, ...formData, status: formData.status } : d));
        setSelectedDoctor((prev) => prev && prev.id === selectedDoctor.id ? { ...prev, ...formData, status: formData.status } : prev);
        showSuccess(tDoctors('toast.doctorUpdated'));
        setShowEditModal(false);
      } else {
        const errorData = await res.json();
        showError(errorData?.error || tDoctors('toast.deleteFailed') || "Update failed");
      }
    } catch (e) {
      showError(e?.message || tDoctors('toast.deleteFailed') || "Update failed");
    }
  };

  const handleExport = () => {
    const headers = [
      tDoctors('table.doctor'),
      tDoctors('table.status'),
      tDoctors('table.joinDate'),
      tDoctors('table.lastVisit'),
      tDoctors('table.actions')
    ];
    const csv = [
      headers,
      ...doctors.map((d) => [
        d.licenseNumber,
        d.name,
        d.email,
        d.phone,
        specialtiesMap[d.specialty] || d.specialty,
        d.experience,
        statusesMap[d.status] || d.status,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "doctors.csv";
    a.click();
    showSuccess(tDoctors('toast.exportStarted'));
  };

  const openEditModal = (doctor) => {
    // Always set id to userId (or fallback to id)
    setSelectedDoctor({ ...doctor, id: doctor.userId || doctor.id });
    setFormData({
      name: doctor.name || doctor.fullName || (doctor.user && (doctor.user.fullName || doctor.user.name)) || "",
      email: doctor.email || (doctor.user && doctor.user.email) || "",
      phone: doctor.phone || (doctor.user && doctor.user.phone) || "",
      specialty: doctor.specialty || "general",
      experience: doctor.experience || "",
      status: doctor.status || "active",
      licenseNumber: doctor.licenseNumber || (doctor.user && doctor.user.licenseNumber) || ""
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (doctor) => {
    setSelectedDoctor(doctor);
    setShowDeleteModal(true);
  };

  const openDetailsModal = (doctor) => {
    setSelectedDoctor({ ...doctor, status: getDoctorStatus(doctor) });
    setShowDetailsModal(true);
  };


  // فلترة الأطباء حسب البحث والفلاتر
  let filteredDoctors = [];
  if (!loading && Array.isArray(doctors)) {
    filteredDoctors = doctors.filter((doctor) => {
      const matchSearch =
        doctor.name?.toLowerCase().includes(search.toLowerCase()) ||
        doctor.email?.toLowerCase().includes(search.toLowerCase()) ||
        doctor.phone?.toLowerCase().includes(search.toLowerCase()) ||
        doctor.licenseNumber?.toLowerCase().includes(search.toLowerCase());
      const matchSpecialty =
        filterSpecialty === "all" || doctor.specialty === filterSpecialty;
      const matchStatus = filterStatus === "all" || getDoctorStatus(doctor) === filterStatus;
      return matchSearch && matchSpecialty && matchStatus;
    });
  }

  // منطق عرض الطلبات المعلقة فقط
  const [showPendingOnly, setShowPendingOnly] = useState(false);
  const displayedDoctors = Array.isArray(showPendingOnly ? pendingDoctors : filteredDoctors)
    ? (showPendingOnly ? pendingDoctors : filteredDoctors)
    : [];
  // ... باقي الكود و JSX ...

  // Approve/Reject handlers
  // موافقة/رفض الطبيب عبر API
  const handleApproveDoctor = async (doctor) => {
    const userId = doctor.userId || doctor.id;
    const res = await fetch("/api/admin/doctors", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: userId, status: "active" }),
    });
    if (res.ok) {
      const updatedDoctors = doctors.map((d) =>
        d.id === doctor.id
          ? { ...d, status: "active", isActive: true, user: d.user ? { ...d.user, isActive: true } : d.user }
          : d
      );
      setDoctors(updatedDoctors);
      // أعد تصفية قائمة المعلقين بناءً على الحالة الجديدة
      setPendingDoctors(updatedDoctors.filter((d) => getDoctorStatus(d) === "pending"));
      showSuccess(tDoctors('toast.doctorVerified'));
    } else {
      showError("فشل التفعيل");
    }
  };
  const handleRejectDoctor = async (doctor) => {
    const userId = doctor.userId || doctor.id;
    const res = await fetch("/api/admin/doctors", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: userId, status: "banned" }),
    });
    if (res.ok) {
      const updatedDoctors = doctors.map((d) => d.id === doctor.id ? { ...d, status: "banned" } : d);
      setDoctors(updatedDoctors);
      setPendingDoctors(updatedDoctors.filter((d) => getDoctorStatus(d) === "pending"));
      showInfo(tDoctors('toast.doctorRejected'));
    } else {
      showError("فشل الرفض");
    }
  };

  // حذف الطبيب عبر API
  const handleDeleteDoctor = async () => {
    if (!selectedDoctor) return;
    try {
      // يمكنك تعديل هذا المسار حسب API الحذف لديك
      const res = await fetch(`/api/admin/doctors/${selectedDoctor.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        setDoctors(doctors.filter((d) => d.id !== selectedDoctor.id));
        showSuccess(tDoctors('toast.doctorDeleted') || "تم حذف الطبيب بنجاح");
        setShowDeleteModal(false);
      } else {
        showError(tDoctors('toast.deleteFailed') || "فشل حذف الطبيب");
      }
    } catch (e) {
      showError(tDoctors('toast.deleteFailed') || "فشل حذف الطبيب");
    }
  };

  return (
    <>
      <ToastContainer />
      <div className="p-6">
         
       
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{tDoctors('headerTitle')}</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">{tDoctors('headerSubtitle')}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <FaDownload />
              <span>{tDoctors('exportButton')}</span>
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <FaPlus />
              <span>{tDoctors('addButton')}</span>
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
                placeholder={tDoctors('filters.searchPlaceholder')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pr-10 pl-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
           
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">{tDoctors('filters.statusAll')}</option>
              <option value="active">{statusesMap.active}</option>
              <option value="suspended">{statusesMap.suspended}</option>
              <option value="banned">{statusesMap.banned}</option>
            </select>
          </div>
        </div>


        {/* Doctors Table (with verification actions) */}
        <DoctorsTable
          doctors={Array.isArray(displayedDoctors) ? displayedDoctors.map(d => ({ ...d, status: getDoctorStatus(d) })) : []}
          onEdit={openEditModal}
          onDelete={openDeleteModal}
          onDetails={openDetailsModal}
          onAdd={() => setShowAddModal(true)}
          onApprove={handleApproveDoctor}
          onReject={handleRejectDoctor}
        />

        {displayedDoctors.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">{showPendingOnly ? (tDoctors('noPendingRequests') || 'لا توجد طلبات معلقة حالياً') : tDoctors('table.noMatches')}</p>
          </div>
        )}

        {/* Add Doctor Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{tDoctors('modals.addTitle')}</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"
                >
                  <FaX className="text-gray-600 dark:text-gray-400" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{tDoctors('modals.fullName')}</label>
                  <input
                    type="text"
                    value={formData.name || ""}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{tDoctors('modals.email')}</label>
                  <input
                    type="email"
                    value={formData.email || ""}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{tDoctors('modals.licenseNumber') || 'License Number'}</label>
                  <input
                    type="text"
                    value={formData.licenseNumber || ""}
                    onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{tDoctors('modals.phone')}</label>
                  <input
                    type="tel"
                    value={formData.phone || ""}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{tDoctors('modals.status')}</label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      className={`flex-1 px-4 py-3 rounded-lg font-bold transition-colors border ${formData.status === 'active' ? 'bg-green-600 text-white border-green-700' : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-slate-600'}`}
                      onClick={() => setFormData({ ...formData, status: 'active' })}
                    >
                      {statusesMap.active}
                    </button>
                    <button
                      type="button"
                      className={`flex-1 px-4 py-3 rounded-lg font-bold transition-colors border ${formData.status === 'banned' ? 'bg-red-600 text-white border-red-700' : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-slate-600'}`}
                      onClick={() => setFormData({ ...formData, status: 'banned' })}
                    >
                      {statusesMap.banned}
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleAddDoctor}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg transition-colors"
                >
                  <FaFloppyDisk />
                  <span>{tDoctors('buttons.save')}</span>
                </button>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-lg transition-colors"
                >
                  {tDoctors('buttons.cancel')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Doctor Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{tDoctors('modals.editTitle')}</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"
                >
                  <FaX className="text-gray-600 dark:text-gray-400" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{tDoctors('modals.fullName')}</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{tDoctors('modals.email')}</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{tDoctors('modals.licenseNumber') || 'License Number'}</label>
                  <input
                    type="text"
                    value={formData.licenseNumber || ''}
                    onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{tDoctors('modals.phone')}</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{tDoctors('modals.status')}</label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      className={`flex-1 px-4 py-3 rounded-lg font-bold transition-colors border ${formData.status === 'active' ? 'bg-green-600 text-white border-green-700' : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-slate-600'}`}
                      onClick={() => setFormData({ ...formData, status: 'active' })}
                    >
                      {statusesMap.active}
                    </button>
                    <button
                      type="button"
                      className={`flex-1 px-4 py-3 rounded-lg font-bold transition-colors border ${formData.status === 'banned' ? 'bg-red-600 text-white border-red-700' : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-slate-600'}`}
                      onClick={() => setFormData({ ...formData, status: 'banned' })}
                    >
                      {statusesMap.banned}
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleEditDoctor}
                  className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg transition-colors"
                >
                  <FaFloppyDisk />
                  <span>{tDoctors('buttons.saveChanges')}</span>
                </button>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-lg transition-colors"
                >
                  {tDoctors('buttons.cancel')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Details Modal (bilingual, with approve/reject) */}
        {showDetailsModal && selectedDoctor && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <DoctorDetailsCard
              doctor={selectedDoctor}
              onClose={() => setShowDetailsModal(false)}
              onApprove={handleApproveDoctor}
              onReject={handleRejectDoctor}
            />
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && selectedDoctor && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-md w-full p-6">
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">⚠️</div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{tDoctors('confirmDelete.title')}</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {tDoctors('confirmDelete.description', { name: selectedDoctor.name })}
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleDeleteDoctor}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg transition-colors font-medium"
                >
                  {tDoctors('confirmDelete.yes')}
                </button>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-lg transition-colors"
                >
                  {tDoctors('confirmDelete.no')}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </>
  );
}


export default DoctorsPage;

