"use client";
import { useState } from "react";
import AdminLayout from "../AdminLayout";
import { useToast } from "../../components/ui/Toast";
import { FaUsers, FaUserShield, FaUserMd, FaUserInjured, FaSearch, FaPlus, FaEdit, FaTrash, FaEye, FaDownload, FaTimes, FaSave, FaEnvelope, FaPhone, FaCalendarAlt, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

export default function UsersPage() {
  const { showToast, ToastContainer } = useToast();
  
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [users, setUsers] = useState([
    {
      id: 1,
      name: "أحمد محمد علي",
      email: "ahmed.ali@example.com",
      phone: "0501234567",
      role: "مدير",
      status: "نشط",
      joinDate: "2023-01-15",
      lastLogin: "2025-12-04 10:30",
      permissions: ["عرض", "تعديل", "حذف"],
      avatar: "👨‍💼"
    },
    {
      id: 2,
      name: "د. سارة أحمد",
      email: "sara.ahmed@example.com",
      phone: "0509876543",
      role: "طبيب",
      status: "نشط",
      joinDate: "2023-03-20",
      lastLogin: "2025-12-04 09:15",
      specialty: "أخصائي أشعة",
      license: "MED-12345",
      avatar: "👩‍⚕️"
    },
    {
      id: 3,
      name: "محمد خالد",
      email: "mohamed.k@example.com",
      phone: "0551234567",
      role: "مريض",
      status: "نشط",
      joinDate: "2024-05-10",
      lastLogin: "2025-12-03 18:45",
      patientId: "PAT-001",
      avatar: "👤"
    },
    {
      id: 4,
      name: "فاطمة حسن",
      email: "fatima.h@example.com",
      phone: "0567890123",
      role: "مدير",
      status: "معلق",
      joinDate: "2023-07-12",
      lastLogin: "2025-11-30 14:20",
      permissions: ["عرض", "تعديل"],
      avatar: "👩‍💼"
    },
    {
      id: 5,
      name: "د. محمد علي",
      email: "mohamed.ali@example.com",
      phone: "0523456789",
      role: "طبيب",
      status: "نشط",
      joinDate: "2023-09-05",
      lastLogin: "2025-12-04 08:00",
      specialty: "جراح عظام",
      license: "MED-67890",
      avatar: "👨‍⚕️"
    },
    {
      id: 6,
      name: "ليلى يوسف",
      email: "layla.y@example.com",
      phone: "0534567890",
      role: "مريض",
      status: "نشط",
      joinDate: "2024-02-18",
      lastLogin: "2025-12-04 11:00",
      patientId: "PAT-002",
      avatar: "👤"
    },
    {
      id: 7,
      name: "عمر السيد",
      email: "omar.s@example.com",
      phone: "0545678901",
      role: "مدير",
      status: "نشط",
      joinDate: "2023-11-22",
      lastLogin: "2025-12-04 07:30",
      permissions: ["عرض"],
      avatar: "👨‍💼"
    },
    {
      id: 8,
      name: "د. فاطمة علي",
      email: "fatima.ali@example.com",
      phone: "0556789012",
      role: "طبيب",
      status: "معلق",
      joinDate: "2024-01-08",
      lastLogin: "2025-11-28 16:45",
      specialty: "طب عام",
      license: "MED-54321",
      avatar: "👩‍⚕️"
    }
  ]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "مريض",
    status: "نشط"
  });

  const stats = [
    {
      title: "إجمالي المستخدمين",
      value: users.length,
      icon: FaUsers,
      color: "bg-blue-500",
      bgLight: "bg-blue-50 dark:bg-blue-900/20"
    },
    {
      title: "المديرين",
      value: users.filter(u => u.role === "مدير").length,
      icon: FaUserShield,
      color: "bg-purple-500",
      bgLight: "bg-purple-50 dark:bg-purple-900/20"
    },
    {
      title: "الأطباء",
      value: users.filter(u => u.role === "طبيب").length,
      icon: FaUserMd,
      color: "bg-green-500",
      bgLight: "bg-green-50 dark:bg-green-900/20"
    },
    {
      title: "المرضى",
      value: users.filter(u => u.role === "مريض").length,
      icon: FaUserInjured,
      color: "bg-orange-500",
      bgLight: "bg-orange-50 dark:bg-orange-900/20"
    }
  ];

  const getRoleColor = (role) => {
    switch (role) {
      case "مدير":
        return "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800";
      case "طبيب":
        return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800";
      case "مريض":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800";
      default:
        return "bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "نشط":
        return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800";
      case "معلق":
        return "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800";
      case "محظور":
        return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800";
      default:
        return "bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800";
    }
  };

  const handleAddUser = () => {
    if (!formData.name || !formData.email || !formData.phone) {
      showToast("يرجى ملء جميع الحقول", "error");
      return;
    }
    const newUser = {
      id: users.length + 1,
      ...formData,
      joinDate: new Date().toISOString().split('T')[0],
      lastLogin: "لم يسجل دخول بعد",
      avatar: formData.role === "مدير" ? "👨‍💼" : formData.role === "طبيب" ? "👨‍⚕️" : "👤"
    };
    setUsers([...users, newUser]);
    setShowAddModal(false);
    setFormData({ name: "", email: "", phone: "", role: "مريض", status: "نشط" });
    showToast("تم إضافة المستخدم بنجاح", "success");
  };

  const handleEditUser = () => {
    setUsers(users.map(u => u.id === selectedUser.id ? { ...u, ...formData } : u));
    setShowEditModal(false);
    setSelectedUser(null);
    showToast("تم تحديث المستخدم بنجاح", "success");
  };

  const handleDeleteUser = () => {
    setUsers(users.filter(u => u.id !== selectedUser.id));
    setShowDeleteModal(false);
    setSelectedUser(null);
    showToast("تم حذف المستخدم", "info");
  };

  const handleExport = () => {
    showToast("جاري تصدير البيانات...", "success");
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const openDetailsModal = (user) => {
    setSelectedUser(user);
    setShowDetailsModal(true);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(search.toLowerCase()) ||
                         user.email.toLowerCase().includes(search.toLowerCase()) ||
                         user.phone.includes(search);
    const matchesRole = filterRole === "all" || user.role === filterRole;
    const matchesStatus = filterStatus === "all" || user.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <AdminLayout breadcrumbs={["الرئيسية", "المستخدمين"]}>
      <ToastContainer />
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">إدارة المستخدمين</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">عرض وإدارة جميع المستخدمين في النظام</p>
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
              <span>إضافة مستخدم</span>
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
                  <stat.icon className={`text-2xl ${stat.color.replace('bg-', 'text-')}`} />
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
              <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="بحث بالاسم، البريد، أو الهاتف..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pr-10 pl-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">جميع الأدوار</option>
              <option value="مدير">مدير</option>
              <option value="طبيب">طبيب</option>
              <option value="مريض">مريض</option>
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

        {/* Users Table */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700">
                <tr>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-900 dark:text-white">المستخدم</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-900 dark:text-white">الدور</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-900 dark:text-white">الحالة</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-900 dark:text-white">تاريخ الانضمام</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-900 dark:text-white">آخر تسجيل</th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-gray-900 dark:text-white">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-slate-900 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="text-3xl">{user.avatar}</div>
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white">{user.name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{user.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs border ${getRoleColor(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs border ${getStatusColor(user.status)}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{user.joinDate}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{user.lastLogin}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openDetailsModal(user)}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          title="عرض التفاصيل"
                        >
                          <FaEye />
                        </button>
                        <button
                          onClick={() => openEditModal(user)}
                          className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                          title="تعديل"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => openDeleteModal(user)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="حذف"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add User Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">إضافة مستخدم جديد</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"
                >
                  <FaTimes className="text-gray-600 dark:text-gray-400" />
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">الدور</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white"
                  >
                    <option value="مريض">مريض</option>
                    <option value="طبيب">طبيب</option>
                    <option value="مدير">مدير</option>
                  </select>
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
                  onClick={handleAddUser}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg transition-colors"
                >
                  <FaSave />
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

        {/* Edit User Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">تعديل المستخدم</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"
                >
                  <FaTimes className="text-gray-600 dark:text-gray-400" />
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">الدور</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white"
                  >
                    <option value="مريض">مريض</option>
                    <option value="طبيب">طبيب</option>
                    <option value="مدير">مدير</option>
                  </select>
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
                  onClick={handleEditUser}
                  className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg transition-colors"
                >
                  <FaSave />
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
        {showDetailsModal && selectedUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">تفاصيل المستخدم</h3>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"
                >
                  <FaTimes className="text-gray-600 dark:text-gray-400" />
                </button>
              </div>
              
              <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 dark:bg-slate-900 rounded-lg">
                <div className="text-5xl">{selectedUser.avatar}</div>
                <div>
                  <h4 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedUser.name}</h4>
                  <div className="flex gap-2 mt-2">
                    <span className={`px-3 py-1 rounded-full text-xs border ${getRoleColor(selectedUser.role)}`}>
                      {selectedUser.role}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs border ${getStatusColor(selectedUser.status)}`}>
                      {selectedUser.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-slate-900 rounded-lg">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-1">
                    <FaEnvelope />
                    <span className="text-sm">البريد الإلكتروني</span>
                  </div>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedUser.email}</p>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-slate-900 rounded-lg">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-1">
                    <FaPhone />
                    <span className="text-sm">رقم الجوال</span>
                  </div>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedUser.phone}</p>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-slate-900 rounded-lg">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-1">
                    <FaCalendarAlt />
                    <span className="text-sm">تاريخ الانضمام</span>
                  </div>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedUser.joinDate}</p>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-slate-900 rounded-lg">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-1">
                    <FaClock />
                    <span className="text-sm">آخر تسجيل دخول</span>
                  </div>
                  <p className="font-medium text-gray-900 dark:text-white">{selectedUser.lastLogin}</p>
                </div>
              </div>

              {selectedUser.role === "طبيب" && (
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h5 className="font-bold text-blue-900 dark:text-blue-300 mb-2">معلومات الطبيب</h5>
                  <p className="text-sm text-blue-700 dark:text-blue-300">التخصص: {selectedUser.specialty}</p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">رقم الترخيص: {selectedUser.license}</p>
                </div>
              )}

              {selectedUser.role === "مريض" && (
                <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <h5 className="font-bold text-green-900 dark:text-green-300 mb-2">معلومات المريض</h5>
                  <p className="text-sm text-green-700 dark:text-green-300">رقم المريض: {selectedUser.patientId}</p>
                </div>
              )}

              {selectedUser.permissions && (
                <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <h5 className="font-bold text-purple-900 dark:text-purple-300 mb-2">الصلاحيات</h5>
                  <div className="flex flex-wrap gap-2">
                    {selectedUser.permissions.map((perm, idx) => (
                      <span key={idx} className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs">
                        {perm}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && selectedUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-md w-full p-6">
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">⚠️</div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">تأكيد الحذف</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  هل أنت متأكد من حذف المستخدم <span className="font-bold">{selectedUser.name}</span>؟
                  لا يمكن التراجع عن هذا الإجراء.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleDeleteUser}
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
