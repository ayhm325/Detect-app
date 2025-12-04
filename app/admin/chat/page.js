"use client";
import { useState } from "react";
import AdminLayout from "../AdminLayout";
import { useToast } from "../../components/ui/Toast";
import {
  FaMagnifyingGlass,
  FaMessage,
  FaTrash,
  FaBoxArchive,
  FaX,
  FaEye,
  FaCheckDouble,
  FaExclamation,
  FaCheck,
} from "react-icons/fa6";

export default function AdminChatPage() {
  const { showToast, ToastContainer } = useToast();

  // Sample conversations
  const [conversations, setConversations] = useState([
    {
      id: 1,
      patientName: "أحمد محمد",
      patientId: "P001",
      doctorName: "د. فاطمة علي",
      lastMessage: "شكراً على الاستشارة",
      timestamp: "2025-12-04 14:30",
      unread: 3,
      status: "active",
      messages: 45,
      createdAt: "2025-11-15",
    },
    {
      id: 2,
      patientName: "سارة محمود",
      patientId: "P002",
      doctorName: "د. محمد أحمد",
      lastMessage: "تم استقبال التقرير الطبي",
      timestamp: "2025-12-04 13:15",
      unread: 1,
      status: "active",
      messages: 32,
      createdAt: "2025-11-20",
    },
    {
      id: 3,
      patientName: "علي سالم",
      patientId: "P003",
      doctorName: "د. فاطمة علي",
      lastMessage: "الموعد القادم الأسبوع القادم",
      timestamp: "2025-12-04 11:45",
      unread: 0,
      status: "inactive",
      messages: 28,
      createdAt: "2025-11-10",
    },
    {
      id: 4,
      patientName: "مريم عبدالله",
      patientId: "P004",
      doctorName: "د. سعيد خالد",
      lastMessage: "يرجى تجنب الأطعمة الدهنية",
      timestamp: "2025-12-03 16:20",
      unread: 0,
      status: "active",
      messages: 56,
      createdAt: "2025-10-25",
    },
    {
      id: 5,
      patientName: "خالد حسن",
      patientId: "P005",
      doctorName: "د. محمد أحمد",
      lastMessage: "تم تغيير الدواء كما اتفقنا",
      timestamp: "2025-12-03 09:10",
      unread: 0,
      status: "archived",
      messages: 19,
      createdAt: "2025-09-30",
    },
    {
      id: 6,
      patientName: "ليلى إبراهيم",
      patientId: "P006",
      doctorName: "د. فاطمة علي",
      lastMessage: "استشارة متابعة بعد الجراحة",
      timestamp: "2025-12-02 15:50",
      unread: 2,
      status: "active",
      messages: 41,
      createdAt: "2025-11-01",
    },
  ]);

  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showConversationModal, setShowConversationModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // Filter conversations
  const filteredConversations = conversations.filter((conv) => {
    const matchesSearch =
      conv.patientName.includes(searchQuery) ||
      conv.doctorName.includes(searchQuery) ||
      conv.patientId.includes(searchQuery);
    const matchesStatus =
      filterStatus === "all" || conv.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Stats
  const stats = [
    {
      label: "إجمالي المحادثات",
      value: conversations.length,
      color: "blue",
      icon: FaMessage,
    },
    {
      label: "المحادثات النشطة",
      value: conversations.filter((c) => c.status === "active").length,
      color: "green",
      icon: FaCheck,
    },
    {
      label: "الرسائل غير المقروءة",
      value: conversations.reduce((sum, c) => sum + c.unread, 0),
      color: "orange",
      icon: FaExclamation,
    },
    {
      label: "المحفوظة",
      value: conversations.filter((c) => c.status === "archived").length,
      color: "purple",
      icon: FaBoxArchive,
    },
  ];

  // Handle delete
  const handleDelete = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    setConversations(conversations.filter((c) => c.id !== deleteId));
    showToast("تم حذف المحادثة بنجاح", "success");
    setShowDeleteModal(false);
    setDeleteId(null);
  };

  // Handle archive
  const handleArchive = (id) => {
    setConversations(
      conversations.map((c) =>
        c.id === id ? { ...c, status: "archived" } : c
      )
    );
    showToast("تم أرشفة المحادثة", "success");
  };

  // Handle mark as read
  const handleMarkAsRead = (id) => {
    setConversations(
      conversations.map((c) => (c.id === id ? { ...c, unread: 0 } : c))
    );
    showToast("تم تحديد المحادثة كمقروءة", "success");
  };

  return (
    <AdminLayout breadcrumbs={["الرئيسية", "المحادثات"]}>
      <ToastContainer />
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <FaMessage className="text-4xl text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              إدارة المحادثات
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              عرض ومراقبة جميع المحادثات بين الأطباء والمرضى
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const StatIcon = stat.icon;
            const colorClasses = {
              blue: "bg-blue-100 dark:bg-blue-900/30 text-blue-600",
              green: "bg-green-100 dark:bg-green-900/30 text-green-600",
              orange: "bg-orange-100 dark:bg-orange-900/30 text-orange-600",
              purple: "bg-purple-100 dark:bg-purple-900/30 text-purple-600",
            };
            return (
              <div
                key={index}
                className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-slate-700"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {stat.label}
                    </p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`p-4 rounded-xl ${colorClasses[stat.color]}`}>
                    <StatIcon className="text-2xl" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <FaMagnifyingGlass className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="بحث عن مريض أو طبيب..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white"
          >
            <option value="all">جميع الحالات</option>
            <option value="active">نشطة</option>
            <option value="inactive">غير نشطة</option>
            <option value="archived">مؤرشفة</option>
          </select>
        </div>

        {/* Conversations Table */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700">
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-900 dark:text-white">
                    المريض
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-900 dark:text-white">
                    الطبيب
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-900 dark:text-white">
                    آخر رسالة
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-900 dark:text-white">
                    الوقت
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-900 dark:text-white">
                    الحالة
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-900 dark:text-white">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredConversations.length > 0 ? (
                  filteredConversations.map((conv) => (
                    <tr
                      key={conv.id}
                      className="border-b border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {conv.patientName}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {conv.patientId}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                        {conv.doctorName}
                      </td>
                      <td className="px-6 py-4 text-gray-700 dark:text-gray-300 max-w-xs truncate">
                        {conv.lastMessage}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {conv.timestamp}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {conv.status === "active" && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                              <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                              نشطة
                            </span>
                          )}
                          {conv.status === "inactive" && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300">
                              <span className="w-2 h-2 bg-gray-600 rounded-full"></span>
                              غير نشطة
                            </span>
                          )}
                          {conv.status === "archived" && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                              <FaBoxArchive className="text-xs" />
                              مؤرشفة
                            </span>
                          )}
                          {conv.unread > 0 && (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-xs font-bold">
                              {conv.unread}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedConversation(conv);
                              setShowConversationModal(true);
                            }}
                            className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/20 text-blue-600 rounded-lg transition-colors"
                            title="عرض"
                          >
                            <FaEye />
                          </button>
                          {conv.unread > 0 && (
                            <button
                              onClick={() => handleMarkAsRead(conv.id)}
                              className="p-2 hover:bg-green-100 dark:hover:bg-green-900/20 text-green-600 rounded-lg transition-colors"
                              title="تحديد كمقروء"
                            >
                              <FaCheckDouble />
                            </button>
                          )}
                          {conv.status !== "archived" && (
                            <button
                              onClick={() => handleArchive(conv.id)}
                              className="p-2 hover:bg-purple-100 dark:hover:bg-purple-900/20 text-purple-600 rounded-lg transition-colors"
                              title="أرشفة"
                            >
                              <FaBoxArchive />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(conv.id)}
                            className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 rounded-lg transition-colors"
                            title="حذف"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-12 text-center text-gray-500 dark:text-gray-400"
                    >
                      <FaMessage className="mx-auto text-4xl mb-4 opacity-50" />
                      <p>لا توجد محادثات</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* View Conversation Modal */}
        {showConversationModal && selectedConversation && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {selectedConversation.patientName}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    مع {selectedConversation.doctorName}
                  </p>
                </div>
                <button
                  onClick={() => setShowConversationModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <FaX className="text-2xl" />
                </button>
              </div>

              {/* Conversation Details */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {/* Conversation Stats */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-blue-600">
                      {selectedConversation.messages}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      الرسائل
                    </p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {selectedConversation.unread}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      غير مقروءة
                    </p>
                  </div>
                  <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3 text-center">
                    <p className="text-sm font-bold text-orange-600">
                      {selectedConversation.createdAt}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      تاريخ الإنشاء
                    </p>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 text-center">
                    <p className="text-sm font-bold text-purple-600">
                      {selectedConversation.status}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      الحالة
                    </p>
                  </div>
                </div>

                {/* Sample Messages */}
                <div className="space-y-3">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                    آخر الرسائل:
                  </p>

                  <div className="flex justify-end">
                    <div className="bg-blue-600 text-white rounded-lg rounded-tr-none px-4 py-2 max-w-xs">
                      <p className="text-sm">صباح الخير دكتور</p>
                      <p className="text-xs opacity-70 mt-1">14:20</p>
                    </div>
                  </div>

                  <div className="flex justify-start">
                    <div className="bg-gray-200 dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg rounded-tl-none px-4 py-2 max-w-xs">
                      <p className="text-sm">صباح الخير، كيف حالك اليوم؟</p>
                      <p className="text-xs opacity-70 mt-1">14:25</p>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <div className="bg-blue-600 text-white rounded-lg rounded-tr-none px-4 py-2 max-w-xs">
                      <p className="text-sm">الحمد لله بخير، بفضل العلاج</p>
                      <p className="text-xs opacity-70 mt-1">14:30</p>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <div className="bg-blue-600 text-white rounded-lg rounded-tr-none px-4 py-2 max-w-xs">
                      <p className="text-sm">
                        {selectedConversation.lastMessage}
                      </p>
                      <p className="text-xs opacity-70 mt-1">
                        {selectedConversation.timestamp.split(" ")[1]}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="border-t border-gray-200 dark:border-slate-700 p-6 bg-gray-50 dark:bg-slate-900 flex gap-3">
                <button
                  onClick={() => setShowConversationModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                >
                  إغلاق
                </button>
                <button
                  onClick={() => {
                    handleMarkAsRead(selectedConversation.id);
                    setShowConversationModal(false);
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  تحديد كمقروء
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-md w-full p-6">
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaExclamation className="text-2xl text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  حذف المحادثة
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  هل أنت متأكد من حذف هذه المحادثة؟ لا يمكن التراجع عن هذا الإجراء.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  حذف
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
