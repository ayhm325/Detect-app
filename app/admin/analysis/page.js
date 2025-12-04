"use client";
import { useState } from "react";
import AdminLayout from "../AdminLayout";
import { useToast } from "../../components/ui/Toast";
import {
  FaFileLines,
  FaMagnifyingGlass,
  FaPlus,
  FaDownload,
  FaEye,
  FaX,
  FaFloppyDisk,
  FaCalendar,
  FaClock,
  FaCheck,
  FaExclamation,
  FaHourglass,
  FaChartLine,
  FaUser,
  FaImage,
} from "react-icons/fa6";


export default function AnalysisPage() {
  const { showToast, ToastContainer } = useToast();

  // State
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);

  // Sample Data
  const [analyses, setAnalyses] = useState([
    {
      id: 1,
      patientName: "منى عبد الله محمد",
      patientId: "PAT-001",
      type: "أشعة سينية",
      date: "2025-12-03",
      time: "10:30",
      status: "مكتمل",
      doctor: "د. محمد سالم",
      findings: "طبيعي",
      notes: "لا توجد ملاحظات طبية",
      imageUrl: "🩻",
      result: "سالب",
    },
    {
      id: 2,
      patientName: "سعيد حسن إبراهيم",
      patientId: "PAT-002",
      type: "أشعة مقطعية",
      date: "2025-12-02",
      time: "14:15",
      status: "قيد المراجعة",
      doctor: "د. ليلى حسن",
      findings: "تحت الدراسة",
      notes: "في انتظار مراجعة الطبيب",
      imageUrl: "🔬",
      result: "معلق",
    },
    {
      id: 3,
      patientName: "هالة يوسف علي",
      patientId: "PAT-003",
      type: "فحص مخبري",
      date: "2025-12-01",
      time: "09:45",
      status: "مكتمل",
      doctor: "د. سامي يوسف",
      findings: "متوازن",
      notes: "النتائج ضمن المعدل الطبيعي",
      imageUrl: "🧪",
      result: "موجب",
    },
    {
      id: 4,
      patientName: "أحمد محمود خالد",
      patientId: "PAT-004",
      type: "أشعة سينية",
      date: "2025-11-30",
      time: "11:00",
      status: "مكتمل",
      doctor: "د. فاطمة أحمد",
      findings: "تحسن ملحوظ",
      notes: "تحسن الحالة مقارنة بالأشعة السابقة",
      imageUrl: "🩻",
      result: "موجب",
    },
    {
      id: 5,
      patientName: "فاطمة سالم محمد",
      patientId: "PAT-005",
      type: "فحص مخبري",
      date: "2025-11-28",
      time: "16:30",
      status: "مكتمل",
      doctor: "د. عمر خالد",
      findings: "طبيعي",
      notes: "جميع المؤشرات طبيعية",
      imageUrl: "🧪",
      result: "سالب",
    },
    {
      id: 6,
      patientName: "علي عمر محمد",
      patientId: "PAT-006",
      type: "أشعة مقطعية",
      date: "2025-11-25",
      time: "13:20",
      status: "قيد الانتظار",
      doctor: "د. نور محمود",
      findings: "قيد الفحص",
      notes: "في انتظار مراجعة الطبيب المختص",
      imageUrl: "🔬",
      result: "معلق",
    },
  ]);

  // Stats Configuration
  const stats = [
    {
      title: "إجمالي التحليلات",
      value: analyses.length,
      icon: FaFileLines,
      color: "text-blue-600",
      bgLight: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      title: "مكتملة",
      value: analyses.filter((a) => a.status === "مكتمل").length,
      icon: FaCheck,
      color: "text-green-600",
      bgLight: "bg-green-50 dark:bg-green-900/20",
    },
    {
      title: "قيد المراجعة",
      value: analyses.filter((a) => a.status === "قيد المراجعة").length,
      icon: FaChartLine,
      color: "text-orange-600",
      bgLight: "bg-orange-50 dark:bg-orange-900/20",
    },
    {
      title: "قيد الانتظار",
      value: analyses.filter((a) => a.status === "قيد الانتظار").length,
      icon: FaHourglass,
      color: "text-purple-600",
      bgLight: "bg-purple-50 dark:bg-purple-900/20",
    },
  ];

  // Helper Functions
  const types = ["أشعة سينية", "أشعة مقطعية", "فحص مخبري"];

  const getStatusIcon = (status) => {
    switch (status) {
      case "مكتمل":
        return <FaCheck className="text-green-600" />;
      case "قيد المراجعة":
        return <FaChartLine className="text-orange-600" />;
      case "قيد الانتظار":
        return <FaHourglass className="text-purple-600" />;
      default:
        return <FaExclamation className="text-red-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "مكتمل":
        return "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300";
      case "قيد المراجعة":
        return "border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300";
      case "قيد الانتظار":
        return "border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300";
      default:
        return "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300";
    }
  };

  const getResultColor = (result) => {
    switch (result) {
      case "موجب":
        return "text-red-600";
      case "سالب":
        return "text-green-600";
      case "معلق":
        return "text-orange-600";
      default:
        return "text-gray-600";
    }
  };

  // Event Handlers
  const handleExport = () => {
    const csv = [
      ["رقم التحليل", "اسم المريض", "النوع", "التاريخ", "الحالة", "النتيجة"],
      ...analyses.map((a) => [a.id, a.patientName, a.type, a.date, a.status, a.result]),
    ]
      .map((row) => row.join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "analyses.csv";
    a.click();
    showToast("تم تصدير البيانات بنجاح", "success");
  };

  const openDetailsModal = (analysis) => {
    setSelectedAnalysis(analysis);
    setShowDetailsModal(true);
  };

  const openViewModal = (analysis) => {
    setSelectedAnalysis(analysis);
    setShowViewModal(true);
  };

  // Filtering
  const filteredAnalyses = analyses.filter((analysis) => {
    const matchSearch =
      analysis.patientName.includes(search) ||
      analysis.patientId.includes(search) ||
      analysis.type.includes(search) ||
      analysis.doctor.includes(search);
    const matchStatus = filterStatus === "all" || analysis.status === filterStatus;
    const matchType = filterType === "all" || analysis.type === filterType;
    return matchSearch && matchStatus && matchType;
  });

  return (
    <AdminLayout breadcrumbs={["الرئيسية", "التحليلات"]}>
      <ToastContainer />
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">إدارة التحليلات الطبية</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">عرض وإدارة التحليلات والأشعات الطبية</p>
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <FaDownload />
            <span>تصدير</span>
          </button>
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
                placeholder="بحث بالاسم، المريض، النوع، أو الطبيب..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pr-10 pl-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">جميع الأنواع</option>
              {types.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">جميع الحالات</option>
              <option value="مكتمل">مكتمل</option>
              <option value="قيد المراجعة">قيد المراجعة</option>
              <option value="قيد الانتظار">قيد الانتظار</option>
            </select>
          </div>
        </div>

        {/* Analyses Table */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700">
                <tr>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-900 dark:text-white">المريض</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-900 dark:text-white">النوع</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-900 dark:text-white">التاريخ والوقت</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-900 dark:text-white">الطبيب</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-900 dark:text-white">الحالة</th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-900 dark:text-white">النتيجة</th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-gray-900 dark:text-white">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                {filteredAnalyses.map((analysis) => (
                  <tr key={analysis.id} className="hover:bg-gray-50 dark:hover:bg-slate-900 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white">{analysis.patientName}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{analysis.patientId}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <span className="text-2xl">{analysis.imageUrl}</span>
                        {analysis.type}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <FaCalendar className="text-gray-400" />
                        {analysis.date}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                        <FaClock className="text-gray-400" />
                        {analysis.time}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{analysis.doctor}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs border flex items-center gap-2 w-fit ${getStatusColor(analysis.status)}`}>
                        {getStatusIcon(analysis.status)}
                        {analysis.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-bold ${getResultColor(analysis.result)}`}>
                        {analysis.result}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openViewModal(analysis)}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          title="عرض التفاصيل"
                        >
                          <FaEye />
                        </button>
                        <button
                          onClick={() => openDetailsModal(analysis)}
                          className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                          title="تفاصيل كاملة"
                        >
                          <FaImage />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredAnalyses.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">لا توجد تحليلات مطابقة للفلاتر المحددة</p>
          </div>
        )}

        {/* View Modal */}
        {showViewModal && selectedAnalysis && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-2xl w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">عرض التحليل</h3>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"
                >
                  <FaX className="text-gray-600 dark:text-gray-400" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="text-center p-8 bg-gray-50 dark:bg-slate-900 rounded-lg">
                  <div className="text-8xl mb-4">{selectedAnalysis.imageUrl}</div>
                  <p className="text-gray-600 dark:text-gray-400">صورة التحليل ({selectedAnalysis.type})</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 dark:bg-slate-900 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">النوع</p>
                    <p className="font-bold text-gray-900 dark:text-white">{selectedAnalysis.type}</p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-slate-900 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">النتيجة</p>
                    <p className={`font-bold ${getResultColor(selectedAnalysis.result)}`}>{selectedAnalysis.result}</p>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-blue-700 dark:text-blue-300 mb-1">الملاحظات</p>
                  <p className="text-blue-900 dark:text-blue-100">{selectedAnalysis.notes}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Details Modal */}
        {showDetailsModal && selectedAnalysis && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">تفاصيل التحليل</h3>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"
                >
                  <FaX className="text-gray-600 dark:text-gray-400" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Patient Info */}
                <div className="p-4 bg-gray-50 dark:bg-slate-900 rounded-lg">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-2">
                    <FaUser />
                    <span className="text-sm font-medium">معلومات المريض</span>
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold text-gray-900 dark:text-white">{selectedAnalysis.patientName}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{selectedAnalysis.patientId}</p>
                  </div>
                </div>

                {/* Analysis Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm text-blue-700 dark:text-blue-300 mb-1">نوع التحليل</p>
                    <p className="font-bold text-blue-900 dark:text-blue-100">{selectedAnalysis.type}</p>
                  </div>
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <p className="text-sm text-green-700 dark:text-green-300 mb-1">الطبيب المسؤول</p>
                    <p className="font-bold text-green-900 dark:text-green-100">{selectedAnalysis.doctor}</p>
                  </div>
                </div>

                {/* Status and Result */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <p className="text-sm text-orange-700 dark:text-orange-300 mb-1">الحالة</p>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(selectedAnalysis.status)}
                      <span className="font-bold text-orange-900 dark:text-orange-100">{selectedAnalysis.status}</span>
                    </div>
                  </div>
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <p className="text-sm text-purple-700 dark:text-purple-300 mb-1">النتيجة</p>
                    <p className={`font-bold ${getResultColor(selectedAnalysis.result)}`}>{selectedAnalysis.result}</p>
                  </div>
                </div>

                {/* Date and Time */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 dark:bg-slate-900 rounded-lg">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-1">
                      <FaCalendar />
                      <span className="text-sm">التاريخ</span>
                    </div>
                    <p className="font-bold text-gray-900 dark:text-white">{selectedAnalysis.date}</p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-slate-900 rounded-lg">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-1">
                      <FaClock />
                      <span className="text-sm">الوقت</span>
                    </div>
                    <p className="font-bold text-gray-900 dark:text-white">{selectedAnalysis.time}</p>
                  </div>
                </div>

                {/* Findings */}
                <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                  <p className="text-sm text-indigo-700 dark:text-indigo-300 mb-2 font-medium">النتائج والملاحظات</p>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-indigo-600 dark:text-indigo-400">الملاحظات الطبية:</p>
                      <p className="text-indigo-900 dark:text-indigo-100">{selectedAnalysis.findings}</p>
                    </div>
                    <div>
                      <p className="text-xs text-indigo-600 dark:text-indigo-400">ملاحظات إضافية:</p>
                      <p className="text-indigo-900 dark:text-indigo-100">{selectedAnalysis.notes}</p>
                    </div>
                  </div>
                </div>

                {/* Image Preview */}
                <div className="text-center p-6 bg-gray-50 dark:bg-slate-900 rounded-lg">
                  <div className="text-6xl mb-2">{selectedAnalysis.imageUrl}</div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">صورة التحليل</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
