"use client";
import { useState, useMemo, useEffect } from "react";
// Page is rendered inside the route-level AdminLayout; avoid double-wrapping
import { useToast } from "../../../components/ui/Toast";
import useLocale from "../../../hooks/useLocale";
import { useTranslations } from "next-intl";
import { 
  FaUsers, FaUserShield, FaUserMd, FaUserInjured, FaSearch, FaPlus, FaTrash, FaEye, FaEyeSlash, FaDownload, FaTimes, FaSave, FaEnvelope, FaPhone, FaCalendarAlt, FaCheckCircle, FaTimesCircle, FaClock 
} from "react-icons/fa";

export default function UsersPage() {
  const { showToast, ToastContainer } = useToast();
  const { locale } = useLocale();
  const t = useTranslations("adminUsers");
  
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    let mounted = true;
    async function loadUsers() {
      try {
        const res = await fetch('/api/admin/users');
        if (!res.ok) throw new Error('Failed to fetch users');
        const data = await res.json();

        const mapped = data.map(u => {
          const role = u.role;
          const phone = (u.doctor && u.doctor.phone) || (u.patient && u.patient.phone) || '';
          const status = role === 'admin' ? (u.isActive ? 'active' : 'suspended') : (role === 'doctor' ? (u.doctor?.status || 'pending') : (u.patient?.status || 'active'));
          const roleDisplay = role;
          const statusDisplay = status;
          const joinDate = u.patient?.joinDate ? new Date(u.patient.joinDate).toISOString().split('T')[0] : (u.createdAt ? new Date(u.createdAt).toISOString().split('T')[0] : '');
          const lastLogin = u.updatedAt ? new Date(u.updatedAt).toISOString().replace('T', ' ').substring(0, 16) : '';

          return {
            id: u.id,
            name: u.fullName || u.name,
            email: u.email,
            phone,
            role,
            roleDisplay,
            status,
            statusDisplay,
            joinDate,
            lastLogin,
            avatar: role === 'admin' ? t('avatars.admin') : role === 'doctor' ? t('avatars.doctor') : t('avatars.patient'),
            specialty: u.doctor?.specialty,
            license: u.doctor?.licenseNumber,
            patientId: u.patient?.id,
            permissions: [],
          };
        });

        if (mounted) setUsers(mapped);
      } catch (err) {
        console.error('Failed to load users:', err);
      }
    }

    loadUsers();
    return () => { mounted = false; };
  }, [locale, t]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "admin",
    status: "active"
  });

  const [showPassword, setShowPassword] = useState(false);

  // Filter users based on search and filters
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = search === "" || 
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase()) ||
        user.phone.includes(search);
      
      const matchesRole = filterRole === "all" || user.role === filterRole;
      const matchesStatus = filterStatus === "all" || user.status === filterStatus;
      
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, filterRole, filterStatus]);

  const stats = [
    {
      title: t('stats.totalUsers'),
      value: users.length,
      icon: FaUsers,
      color: "bg-blue-500",
      bgLight: "bg-blue-50 dark:bg-blue-900/20"
    },
    {
      title: t('stats.admins'),
      value: users.filter(u => u.role === "admin").length,
      icon: FaUserShield,
      color: "bg-purple-500",
      bgLight: "bg-purple-50 dark:bg-purple-900/20"
    },
    {
      title: t('stats.doctors'),
      value: users.filter(u => u.role === "doctor").length,
      icon: FaUserMd,
      color: "bg-green-500",
      bgLight: "bg-green-50 dark:bg-green-900/20"
    },
    {
      title: t('stats.patients'),
      value: users.filter(u => u.role === "patient").length,
      icon: FaUserInjured,
      color: "bg-orange-500",
      bgLight: "bg-orange-50 dark:bg-orange-900/20"
    }
  ];

  const getRoleColor = (role) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800";
      case "doctor":
        return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800";
      case "patient":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800";
      default:
        return "bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800";
      case "suspended":
        return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800";
      case "banned":
        return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800";
      default:
        return "bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800";
    }
  };

  // Handler functions
  const handleExport = () => {
    try {
      if (!users || users.length === 0) {
        showToast(t('toast.notLoggedIn'), 'info');
        return;
      }

      const headers = [
        t('csv.headers.id'),
        t('csv.headers.name'),
        t('csv.headers.email'),
        t('csv.headers.phone'),
        t('csv.headers.role'),
        t('csv.headers.status'),
        t('csv.headers.joinDate'),
        t('csv.headers.lastLogin'),
        t('csv.headers.specialty'),
        t('csv.headers.license'),
        t('csv.headers.patientId')
      ];

      const escapeCell = (val) => {
        if (val === null || val === undefined) return '';
        const s = String(val);
        if (s.includes(',') || s.includes('"') || s.includes('\n')) {
          return '"' + s.replace(/"/g, '""') + '"';
        }
        return s;
      };

      const rows = users.map(u => [
        u.id,
        u.name,
        u.email,
        u.phone || '',
        u.role || '',
        u.status || '',
        u.joinDate || '',
        u.lastLogin || '',
        u.specialty || '',
        u.license || '',
        u.patientId || ''
      ].map(escapeCell).join(','));

      const csv = [headers.join(','), ...rows].join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const date = new Date().toISOString().slice(0,10);
      a.download = t('csv.filename', { date });
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      showToast(t('toast.exportStarted'), 'success');
    } catch (err) {
      console.error('Export failed', err);
      showToast(t('errors.exportFailed'), 'error');
    }
  };

  const handleAddUser = () => {
    // In a real app, this would add the user to a database
    const newUser = {
      id: users.length + 1,
      name: formData.name,
      email: formData.email,
      role: "admin",
      roleDisplay: t('roles.admin'),
      status: formData.status,
      statusDisplay: t(`statuses.${formData.status}`),
      joinDate: new Date().toISOString().split('T')[0],
      lastLogin: new Date().toISOString().replace('T', ' ').substring(0, 16),
      phone: "",
      password: formData.password || 'changeme',
      avatar: t('avatars.admin')
    };
    
    setUsers([...users, newUser]);
    setShowAddModal(false);
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "admin",
      status: "active"
    });
    showToast(t('toast.userAdded'), 'success');
    // Create admin via API
    (async () => {
      try {
        const res = await fetch('/api/admin/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: formData.name, email: formData.email, password: formData.password, status: formData.status })
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          showToast(err.error || t('errors.createAdminFailed'), 'error');
          return;
        }

        const created = await res.json();

        const uiUser = {
          id: created.id,
          name: created.fullName || formData.name,
          email: created.email,
          phone: '',
          role: created.role || 'admin',
          roleDisplay: t(`roles.${created.role || 'admin'}`),
          status: created.isActive ? 'active' : 'suspended',
          statusDisplay: t(`statuses.${created.isActive ? 'active' : 'suspended'}`),
          joinDate: created.createdAt ? new Date(created.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          lastLogin: created.updatedAt ? new Date(created.updatedAt).toISOString().replace('T', ' ').substring(0, 16) : new Date().toISOString().replace('T', ' ').substring(0, 16),
          avatar: t('avatars.admin'),
          permissions: []
        };

        setUsers(prev => [uiUser, ...prev]);
        setShowAddModal(false);
        setFormData({ name: '', email: '', password: '', role: 'admin', status: 'active' });
        showToast(t('messages.adminCreated'), 'success');
      } catch (err) {
        console.error(err);
        showToast(t('errors.createAdminFailed'), 'error');
      }
    })();
  };

  const openDetailsModal = (user) => {
    setSelectedUser(user);
    setShowDetailsModal(true);
  };

  const openDeleteModal = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    try {
      const res = await fetch(`/api/admin/users/${selectedUser.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        showToast(err.error || t('errors.exportFailed'), 'error');
        return;
      }
      setUsers(users.filter(user => user.id !== selectedUser.id));
      setShowDeleteModal(false);
      setSelectedUser(null);
      showToast(t('toast.userDeleted'), 'success');
    } catch (err) {
      showToast(t('errors.exportFailed'), 'error');
    }
  };

  return (
    <>
      <ToastContainer />
      <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('title')}</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">{t('subtitle')}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleExport}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <FaDownload />
                <span>{t('exportButton')}</span>
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <FaPlus />
                <span>{t('addButton')}</span>
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
                  placeholder={t('searchPlaceholder')}
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
                <option value="all">{t('filters.allRoles')}</option>
                <option value="admin">{t('roles.admin')}</option>
                <option value="doctor">{t('roles.doctor')}</option>
                <option value="patient">{t('roles.patient')}</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">{t('filters.allStatuses')}</option>
                <option value="active">{t('statuses.active')}</option>
                <option value="suspended">{t('statuses.suspended')}</option>
                <option value="banned">{t('statuses.banned')}</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700">
                  <tr>
                    <th className="px-6 py-4 text-right text-sm font-bold text-gray-900 dark:text-white">{t('table.user')}</th>
                    <th className="px-6 py-4 text-right text-sm font-bold text-gray-900 dark:text-white">{t('table.role')}</th>
                    <th className="px-6 py-4 text-right text-sm font-bold text-gray-900 dark:text-white">{t('table.status')}</th>
                    <th className="px-6 py-4 text-right text-sm font-bold text-gray-900 dark:text-white">{t('table.joinDate')}</th>
                    <th className="px-6 py-4 text-right text-sm font-bold text-gray-900 dark:text-white">{t('table.lastLogin')}</th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-gray-900 dark:text-white">{t('table.actions')}</th>
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
                            {t(`roles.${user.role}`)}
                          </span>
                      </td>
                      <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs border ${getStatusColor(user.status)}`}>
                            {t(`statuses.${user.status}`)}
                          </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{user.joinDate}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{user.lastLogin}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openDetailsModal(user)}
                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            title={t('actions.viewDetails')}
                          >
                            <FaEye />
                          </button>
                          {/* Edit button removed as requested */}
                          <button
                            onClick={() => openDeleteModal(user)}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title={t('actions.delete')}
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

          {/* Add Admin Modal */}
          {showAddModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-md w-full p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t('modal.addTitle')}</h3>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"
                  >
                    <FaTimes className="text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('form.fullName')}</label>
                    <input
                      type="text"
                      id="add-user-name"
                      name="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('form.email')}</label>
                    <input
                      type="email"
                      id="add-user-email"
                      name="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('form.password')}</label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="add-user-password"
                      name="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full pl-10 px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-300 p-1"
                      title={showPassword ? t('actions.hidePassword') : t('actions.showPassword')}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('form.status')}</label>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, status: 'active' })}
                        className={`flex-1 px-4 py-3 rounded-lg transition-colors font-medium ${formData.status === 'active' ? 'bg-green-600 text-white' : 'bg-gray-100 dark:bg-slate-900 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-600'}`}
                        aria-pressed={formData.status === 'active'}
                      >
                        {t('statuses.active')}
                      </button>

                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, status: 'banned' })}
                        className={`flex-1 px-4 py-3 rounded-lg transition-colors font-medium ${formData.status === 'banned' ? 'bg-red-600 text-white' : 'bg-gray-100 dark:bg-slate-900 text-gray-900 dark:text-white border border-gray-300 dark:border-slate-600'}`}
                        aria-pressed={formData.status === 'banned'}
                      >
                        {t('statuses.banned')}
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handleAddUser}
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg transition-colors"
                  >
                    <FaSave />
                    <span>{t('modal.add')}</span>
                  </button>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-lg transition-colors"
                  >
                    {t('modal.cancel')}
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
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t('modal.detailsTitle')}</h3>
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
                        {t(`roles.${selectedUser.role}`)}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs border ${getStatusColor(selectedUser.status)}`}>
                        {t(`statuses.${selectedUser.status}`)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 dark:bg-slate-900 rounded-lg">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-1">
                      <FaEnvelope />
                      <span className="text-sm">{t('details.email')}</span>
                    </div>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedUser.email}</p>
                  </div>

                  <div className="p-4 bg-gray-50 dark:bg-slate-900 rounded-lg">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-1">
                      <FaPhone />
                      <span className="text-sm">{t('details.phone')}</span>
                    </div>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedUser.phone}</p>
                  </div>

                  <div className="p-4 bg-gray-50 dark:bg-slate-900 rounded-lg">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-1">
                      <FaCalendarAlt />
                      <span className="text-sm">{t('details.joinDate')}</span>
                    </div>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedUser.joinDate}</p>
                  </div>

                  <div className="p-4 bg-gray-50 dark:bg-slate-900 rounded-lg">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-1">
                      <FaClock />
                      <span className="text-sm">{t('details.lastLogin')}</span>
                    </div>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedUser.lastLogin}</p>
                  </div>
                </div>

                {selectedUser.role === "doctor" && (
                  <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <h5 className="font-bold text-blue-900 dark:text-blue-300 mb-2">{t('details.doctorInfo')}</h5>
                    <p className="text-sm text-blue-700 dark:text-blue-300">{t('details.specialty')}: {selectedUser.specialty}</p>
                    <p className="text-sm text-blue-700 dark:text-blue-300">{t('details.license')}: {selectedUser.license}</p>
                  </div>
                )}

                {selectedUser.role === "patient" && (
                  <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <h5 className="font-bold text-green-900 dark:text-green-300 mb-2">{t('details.patientInfo')}</h5>
                    <p className="text-sm text-green-700 dark:text-green-300">{t('details.patientId')}: {selectedUser.patientId}</p>
                  </div>
                )}

                {selectedUser.permissions && (
                  <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <h5 className="font-bold text-purple-900 dark:text-purple-300 mb-2">{t('details.permissions')}</h5>
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
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('modal.deleteTitle')}</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {t('modal.deleteMessage')} <span className="font-bold">{selectedUser.name}</span>?
                    {" "}{t('modal.deleteWarning')}
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleDeleteUser}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg transition-colors font-medium"
                  >
                    {t('modal.confirmDelete')}
                  </button>
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-lg transition-colors"
                  >
                    {t('modal.cancel')}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
    </>
  );
}