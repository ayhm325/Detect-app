"use client";
import { useState } from "react";
import AdminLayout from "../AdminLayout";
import { useToast } from "../../components/ui/Toast";
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


export default function DoctorsPage() {
  const { showToast, ToastContainer } = useToast();

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
    specialty: "عام",
    experience: "",
    status: "نشط",
  });

  // Sample Data
  const [doctors, setDoctors] = useState([
    {
      id: 1,
      name: "د. محمد سالم علي",
      email: "m.salem@hospital.com",
      phone: "0501234567",
      specialty: "أشعة تشخيصية",
      experience: 12,
      status: "نشط",
      joinDate: "2013-05-20",
      licenseNumber: "MED-2013-001",
      avatar: "👨‍⚕️",
      rating: 4.8,
      reviewsCount: 156,
      patientsCount: 320,
      appointmentsToday: 8,
      qualifications: ["بكالوريوس طب", "ماجستير الأشعة", "شهادة البورد"],
    },
    {
      id: 2,
      name: "د. ليلى حسن محمود",
      email: "l.hassan@hospital.com",
      phone: "0502345678",
      specialty: "أمراض الصدرية",
      experience: 10,
      status: "نشط",
      joinDate: "2015-03-10",
      licenseNumber: "MED-2015-002",
      avatar: "👩‍⚕️",
      rating: 4.9,
      reviewsCount: 203,
      patientsCount: 285,
      appointmentsToday: 6,
      qualifications: ["بكالوريوس طب", "ماجستير الصدرية"],
    },
    {
      id: 3,
      name: "د. سامي يوسف إبراهيم",
      email: "s.youssef@hospital.com",
      phone: "0503456789",
      specialty: "جراحة العظام",
      experience: 15,
      status: "نشط",
      joinDate: "2010-01-15",
      licenseNumber: "MED-2010-003",
      avatar: "👨‍⚕️",
      rating: 4.7,
      reviewsCount: 189,
      patientsCount: 410,
      appointmentsToday: 10,
      qualifications: ["بكالوريوس طب", "ماجستير الجراحة", "شهادة البورد الأمريكي"],
    },
    {
      id: 4,
      name: "د. فاطمة أحمد محمد",
      email: "f.ahmed@hospital.com",
      phone: "0504567890",
      specialty: "طب النساء والتوليد",
      experience: 8,
      status: "معلق",
      joinDate: "2017-07-22",
      licenseNumber: "MED-2017-004",
      avatar: "👩‍⚕️",
      rating: 4.6,
      reviewsCount: 142,
      patientsCount: 215,
      appointmentsToday: 5,
      qualifications: ["بكالوريوس طب", "ماجستير النساء والتوليد"],
    },
    {
      id: 5,
      name: "د. عمر خالد السيد",
      email: "o.khalid@hospital.com",
      phone: "0505678901",
      specialty: "طب القلب",
      experience: 13,
      status: "نشط",
      joinDate: "2012-09-05",
      licenseNumber: "MED-2012-005",
      avatar: "👨‍⚕️",
      rating: 4.9,
      reviewsCount: 218,
      patientsCount: 350,
      appointmentsToday: 7,
      qualifications: ["بكالوريوس طب", "ماجستير القلب", "شهادة البورد"],
    },
    {
      id: 6,
      name: "د. نور محمود علي",
      email: "n.mahmoud@hospital.com",
      phone: "0506789012",
      specialty: "الأمراض الباطنية",
      experience: 9,
      status: "نشط",
      joinDate: "2016-02-18",
      licenseNumber: "MED-2016-006",
      avatar: "👩‍⚕️",
      rating: 4.5,
      reviewsCount: 127,
      patientsCount: 280,
      appointmentsToday: 6,
      qualifications: ["بكالوريوس طب", "ماجستير الأمراض الباطنية"],
    },
  ]);

  // Stats Configuration
  const stats = [
    {
      title: "إجمالي الأطباء",
      value: doctors.length,
      icon: FaUsers,
      color: "text-blue-600",
      bgLight: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      title: "الأطباء النشطين",
      value: doctors.filter((d) => d.status === "نشط").length,
      icon: FaStethoscope,
      color: "text-green-600",
      bgLight: "bg-green-50 dark:bg-green-900/20",
    },
    {
      title: "المواعيد اليوم",
      value: doctors.reduce((sum, d) => sum + d.appointmentsToday, 0),
      icon: FaCalendar,
      color: "text-orange-600",
      bgLight: "bg-orange-50 dark:bg-orange-900/20",
    },
    {
      title: "إجمالي المرضى",
      value: doctors.reduce((sum, d) => sum + d.patientsCount, 0),
      icon: FaVial,
      color: "text-purple-600",
      bgLight: "bg-purple-50 dark:bg-purple-900/20",
    },
  ];

  // Helper Functions
  const specialties = [
    "أشعة تشخيصية",
    "أمراض الصدرية",
    "جراحة العظام",
    "طب النساء والتوليد",
    "طب القلب",
    "الأمراض الباطنية",
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "نشط":
        return "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300";
      case "معلق":
        return "border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300";
      case "محظور":
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

  // Event Handlers
  const handleAddDoctor = () => {
    if (!formData.name || !formData.email || !formData.phone || !formData.specialty) {
      showToast("الرجاء ملء جميع الحقول", "error");
      return;
    }
    const newDoctor = {
      id: doctors.length + 1,
      ...formData,
      joinDate: new Date().toISOString().split("T")[0],
      licenseNumber: `MED-${new Date().getFullYear()}-${String(doctors.length + 1).padStart(3, "0")}`,
      avatar: "👨‍⚕️",
      rating: 4.5,
      reviewsCount: 0,
      patientsCount: 0,
      appointmentsToday: 0,
      qualifications: [],
    };
    setDoctors([...doctors, newDoctor]);
    setFormData({
      name: "",
      email: "",
      phone: "",
      specialty: "عام",
      experience: "",
      status: "نشط",
    });
    setShowAddModal(false);
    showToast("تم إضافة الطبيب بنجاح", "success");
  };

  const handleEditDoctor = () => {
    if (!formData.name || !formData.email || !formData.phone || !formData.specialty) {
      showToast("الرجاء ملء جميع الحقول", "error");
      return;
    }
    setDoctors(
      doctors.map((d) =>
        d.id === selectedDoctor.id ? { ...d, ...formData } : d
      )
    );
    setFormData({
      name: "",
      email: "",
      phone: "",
      specialty: "عام",
      experience: "",
      status: "نشط",
    });
    setShowEditModal(false);
    showToast("تم تحديث بيانات الطبيب بنجاح", "success");
  };

  const handleDeleteDoctor = () => {
    setDoctors(doctors.filter((d) => d.id !== selectedDoctor.id));
    setShowDeleteModal(false);
    showToast("تم حذف الطبيب بنجاح", "success");
  };

  const handleExport = () => {
    const csv = [
      ["رقم الترخيص", "الاسم", "البريد الإلكتروني", "رقم الجوال", "التخصص", "سنوات الخبرة", "الحالة"],
      ...doctors.map((d) => [
        d.licenseNumber,
        d.name,
        d.email,
        d.phone,
        d.specialty,
        d.experience,
        d.status,
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
    showToast("تم تصدير البيانات بنجاح", "success");
  };

  const openEditModal = (doctor) => {
    setSelectedDoctor(doctor);
    setFormData({
      name: doctor.name,
      email: doctor.email,
      phone: doctor.phone,
      specialty: doctor.specialty,
      experience: doctor.experience,
      status: doctor.status,
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (doctor) => {
    setSelectedDoctor(doctor);
    setShowDeleteModal(true);
  };

  const openDetailsModal = (doctor) => {
    setSelectedDoctor(doctor);
    setShowDetailsModal(true);
  };

  // Filtering
  const filteredDoctors = doctors.filter((doctor) => {
    const matchSearch =
      doctor.name.includes(search) ||
      doctor.email.includes(search) ||
      doctor.phone.includes(search) ||
      doctor.licenseNumber.includes(search);
    const matchSpecialty =
      filterSpecialty === "all" || doctor.specialty === filterSpecialty;
    const matchStatus = filterStatus === "all" || doctor.status === filterStatus;
    return matchSearch && matchSpecialty && matchStatus;
  });

  return (
    <AdminLayout breadcrumbs={["الرئيسية", "الأطباء"]}>
      <ToastContainer />
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">إدارة الأطباء</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">عرض وإدارة حسابات الأطباء والترخيصات الطبية</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <FaDownload />
              <span>تصدير</span>
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <FaPlus />
              <span>إضافة طبيب</span>
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
                placeholder="بحث بالاسم، البريد، الجوال، أو رقم الترخيص..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pr-10 pl-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={filterSpecialty}
              onChange={(e) => setFilterSpecialty(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">جميع التخصصات</option>
              {specialties.map((spec) => (
                <option key={spec} value={spec}>
                  {spec}
                </option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">جميع الحالات</option>
              <option value="نشط">نشط</option>
              <option value="معلق">معلق</option>
              <option value="محظور">محظور</option>
            </select>
          </div>
        </div>

        {/* Doctors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map((doctor) => (
            <div
              key={doctor.id}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 overflow-hidden hover:shadow-xl transition-shadow"
            >
              <div className="p-6">
                {/* Doctor Header */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-4xl">{doctor.avatar}</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{doctor.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{doctor.specialty}</p>
                    <div className="flex gap-2 mt-2">
                      <span className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(doctor.status)}`}>
                        {doctor.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Rating and Reviews */}
                <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-200 dark:border-slate-700">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <FaStar
                        key={i}
                        className={`${i < Math.floor(doctor.rating) ? "text-yellow-400" : "text-gray-300"}`}
                      />
                    ))}
                  </div>
                  <span className={`font-bold ${getRatingColor(doctor.rating)}`}>{doctor.rating}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">({doctor.reviewsCount} تقييم)</span>
                </div>

                {/* Doctor Info */}
                <div className="space-y-3 mb-4 pb-4 border-b border-gray-200 dark:border-slate-700">
                  <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                    <FaEnvelope className="text-gray-400" />
                    <span className="truncate">{doctor.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                    <FaPhone className="text-gray-400" />
                    <span>{doctor.phone}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                    <FaCertificate className="text-gray-400" />
                    <span className="truncate">{doctor.licenseNumber}</span>
                  </div>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-3 gap-2 mb-4 pb-4 border-b border-gray-200 dark:border-slate-700">
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-center">
                    <p className="text-xs text-gray-600 dark:text-gray-400">الخبرة</p>
                    <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{doctor.experience}س</p>
                  </div>
                  <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded text-center">
                    <p className="text-xs text-gray-600 dark:text-gray-400">المرضى</p>
                    <p className="text-lg font-bold text-green-600 dark:text-green-400">{doctor.patientsCount}</p>
                  </div>
                  <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded text-center">
                    <p className="text-xs text-gray-600 dark:text-gray-400">اليوم</p>
                    <p className="text-lg font-bold text-orange-600 dark:text-orange-400">{doctor.appointmentsToday}</p>
                  </div>
                </div>

                {/* Join Date */}
                <div className="mb-4 p-3 bg-gray-50 dark:bg-slate-900 rounded-lg text-sm">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-1">
                    <FaCalendar className="text-gray-400" />
                    <span>تاريخ الانضمام:</span>
                  </div>
                  <p className="font-medium text-gray-900 dark:text-white">{doctor.joinDate}</p>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => openDetailsModal(doctor)}
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg transition-colors text-sm"
                  >
                    <FaEye />
                    عرض
                  </button>
                  <button
                    onClick={() => openEditModal(doctor)}
                    className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg transition-colors text-sm"
                  >
                    <FaPencil />
                    تعديل
                  </button>
                  <button
                    onClick={() => openDeleteModal(doctor)}
                    className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg transition-colors text-sm"
                  >
                    <FaTrash />
                    حذف
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredDoctors.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">لا توجد أطباء مطابقة للفلاتر المحددة</p>
          </div>
        )}

        {/* Add Doctor Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">إضافة طبيب جديد</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"
                >
                  <FaX className="text-gray-600 dark:text-gray-400" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">الاسم الكامل</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">البريد الإلكتروني</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">رقم الجوال</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">التخصص</label>
                  <select
                    value={formData.specialty}
                    onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white"
                  >
                    {specialties.map((spec) => (
                      <option key={spec} value={spec}>
                        {spec}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">سنوات الخبرة</label>
                  <input
                    type="number"
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleAddDoctor}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg transition-colors"
                >
                  <FaFloppyDisk />
                  <span>حفظ</span>
                </button>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-lg transition-colors"
                >
                  إلغاء
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
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">تعديل بيانات الطبيب</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"
                >
                  <FaX className="text-gray-600 dark:text-gray-400" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">الاسم الكامل</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">البريد الإلكتروني</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">رقم الجوال</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">التخصص</label>
                  <select
                    value={formData.specialty}
                    onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white"
                  >
                    {specialties.map((spec) => (
                      <option key={spec} value={spec}>
                        {spec}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">سنوات الخبرة</label>
                  <input
                    type="number"
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">الحالة</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white"
                  >
                    <option value="نشط">نشط</option>
                    <option value="معلق">معلق</option>
                    <option value="محظور">محظور</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleEditDoctor}
                  className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg transition-colors"
                >
                  <FaFloppyDisk />
                  <span>حفظ التغييرات</span>
                </button>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-lg transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Details Modal */}
        {showDetailsModal && selectedDoctor && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">تفاصيل الطبيب</h3>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"
                >
                  <FaX className="text-gray-600 dark:text-gray-400" />
                </button>
              </div>

              <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 dark:bg-slate-900 rounded-lg">
                <div className="text-5xl">{selectedDoctor.avatar}</div>
                <div>
                  <h4 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedDoctor.name}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{selectedDoctor.specialty}</p>
                  <div className="flex gap-2 mt-2">
                    <span className={`px-3 py-1 rounded-full text-xs border ${getStatusColor(selectedDoctor.status)}`}>
                      {selectedDoctor.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="p-4 bg-gray-50 dark:bg-slate-900 rounded-lg">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-1">
                    <FaEnvelope />
                    <span className="text-sm">البريد الإلكتروني</span>
                  </div>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedDoctor.email}</p>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-slate-900 rounded-lg">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-1">
                    <FaPhone />
                    <span className="text-sm">رقم الجوال</span>
                  </div>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedDoctor.phone}</p>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-slate-900 rounded-lg">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-1">
                    <FaCertificate />
                    <span className="text-sm">رقم الترخيص</span>
                  </div>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedDoctor.licenseNumber}</p>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-slate-900 rounded-lg">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-1">
                    <FaCalendar />
                    <span className="text-sm">تاريخ الانضمام</span>
                  </div>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedDoctor.joinDate}</p>
                </div>
              </div>

              {/* Rating and Experience */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-center">
                  <div className="flex items-center justify-center gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <FaStar
                        key={i}
                        className={`text-sm ${i < Math.floor(selectedDoctor.rating) ? "text-yellow-400" : "text-gray-300"}`}
                      />
                    ))}
                  </div>
                  <p className="text-lg font-bold text-yellow-600 dark:text-yellow-400">{selectedDoctor.rating}</p>
                  <p className="text-xs text-yellow-700 dark:text-yellow-300">({selectedDoctor.reviewsCount} تقييم)</p>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
                  <p className="text-sm text-blue-700 dark:text-blue-300 mb-1">سنوات الخبرة</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{selectedDoctor.experience}</p>
                </div>

                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
                  <p className="text-sm text-green-700 dark:text-green-300 mb-1">إجمالي المرضى</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">{selectedDoctor.patientsCount}</p>
                </div>
              </div>

              {/* Qualifications */}
              {selectedDoctor.qualifications && selectedDoctor.qualifications.length > 0 && (
                <div className="mb-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <h5 className="font-bold text-purple-900 dark:text-purple-300 mb-2">🎓 المؤهلات العلمية</h5>
                  <div className="flex flex-wrap gap-2">
                    {selectedDoctor.qualifications.map((qual, idx) => (
                      <span key={idx} className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs">
                        {qual}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Appointments Today */}
              <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-orange-700 dark:text-orange-300 mb-1">المواعيد المجدولة اليوم</p>
                    <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{selectedDoctor.appointmentsToday}</p>
                  </div>
                  <FaCalendar className="text-5xl text-orange-200 dark:text-orange-900/50" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && selectedDoctor && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-md w-full p-6">
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">⚠️</div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">تأكيد الحذف</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  هل أنت متأكد من حذف الطبيب <span className="font-bold">{selectedDoctor.name}</span>؟
                  لا يمكن التراجع عن هذا الإجراء.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleDeleteDoctor}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg transition-colors font-medium"
                >
                  نعم، احذف
                </button>
                <button
                  onClick={() => setShowDeleteModal(false)}
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
