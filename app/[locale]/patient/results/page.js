"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "../../../components/ui/Toast";
import { FaFileAlt, FaXRay, FaSearch, FaFilter, FaDownload, FaEye, FaShare, FaPrint, FaTimes, FaCheckCircle, FaHourglassHalf, FaExclamationTriangle } from "react-icons/fa";
import { useTranslations, useLocale } from "next-intl";

export default function PatientResultsPage() {
  const router = useRouter();
  const { showToast, ToastContainer } = useToast();
  const t = useTranslations("patientResults");
  const locale = useLocale();

  // UI state variables
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const labels = t;

  // ...existing code...
  const reportsTemplate = locale === "en"
    ? [
      {
        id: 1,
        title: t("report1Title", { defaultValue: "Report 1" }),
        type: t("report1Type", { defaultValue: "Type" }),
        typeIcon: t("report1TypeIcon", { defaultValue: "Icon" }),
        date: t("report1Date", { defaultValue: "2025-12-19" }),
        time: t("report1Time", { defaultValue: "10:00" }),
        status: t("report1Status", { defaultValue: "Completed" }),
        doctor: t("report1Doctor", { defaultValue: "Dr. Smith" }),
        facility: t("report1Facility", { defaultValue: "Clinic A" }),
        priority: t("report1Priority", { defaultValue: "Normal" }),
        aiSummary: t("report1AiSummary", { defaultValue: "No issues detected" }),
        findings: [
          { text: t("report1Findings", { defaultValue: "All clear" }), type: "normal" }
        ],
        images: [t("report1Images", { defaultValue: "Image" })],
        notes: t("report1Notes", { defaultValue: "No additional notes" })
      },
      // ...repeat for other reports with short keys and defaultValue
      {
        id: 5,
        title: "Electrocardiogram (ECG)",
        type: "ECG",
        typeIcon: "❤️",
        date: "2025-11-20",
        time: "03:30 PM",
        status: "ready",
        doctor: "Dr. Layla Youssef",
        facility: "Specialized Heart Center",
        priority: "Urgent",
        aiSummary: "Heart rhythm is regular with a slight increase in heart rate noted.",
        findings: [
          { text: "Heart rhythm is regular", type: "normal" },
          { text: "Heart rate: 95 beats/minute", type: "warning" },
          { text: "No signs of blood clots", type: "normal" },
          { text: "Heart rate monitoring recommended", type: "info" }
        ],
        images: [],
        notes: "Reducing caffeine and stress is recommended"
      },
      {
        id: 6,
        title: "Kidney Function Test",
        type: "Laboratory",
        typeIcon: "🔬",
        date: "2025-11-15",
        time: "08:00 AM",
        status: "ready",
        doctor: "Dr. Omar Al-Sayed",
        facility: "Hope Medical Laboratory",
        priority: "Normal",
        aiSummary: "All kidney function values are within normal range.",
        findings: [
          { text: "Creatinine: 1.0 mg/dL (normal)", type: "normal" },
          { text: "Urea: 25 mg/dL (normal)", type: "normal" },
          { text: "Glomerular filtration rate: 95 mL/min (normal)", type: "normal" }
        ],
        images: [],
        notes: "Kidneys are functioning with excellent efficiency"
      }
    ]
    : [
      {
        id: 1,
        title: "أشعة الصدر",
        type: "أشعة",
        typeIcon: "🩻",
        date: "2025-12-02",
        time: "10:30 صباحاً",
        status: "جاهز",
        doctor: "د. سارة أحمد",
        facility: "مركز الأشعة التخصصي",
        priority: "عادي",
        aiSummary: "النتائج طبيعية، لا توجد مؤشرات على أي مشاكل في الرئتين أو الصدر.",
        findings: [
          { text: "الرئتان نظيفتان وخاليتان من الالتهابات", type: "normal" },
          { text: "القلب بحجم طبيعي", type: "normal" },
          { text: "لا توجد كسور في القفص الصدري", type: "normal" }
        ],
        images: ["/icons/patient-placeholder.png"],
        notes: "يُنصح بإجراء فحص متابعة بعد 6 أشهر"
      },
      {
        id: 2,
        title: "تحليل دم شامل",
        type: "تحاليل",
        typeIcon: "🔬",
        date: "2025-12-01",
        time: "09:00 صباحاً",
        status: "جاهز",
        doctor: "د. محمد علي",
        facility: "مختبر الحياة الطبي",
        priority: "عادي",
        aiSummary: "معظم القيم ضمن المعدل الطبيعي مع ملاحظة انخفاض طفيف في فيتامين D.",
        findings: [
          { text: "تعداد كريات الدم البيضاء: 7,500 (طبيعي)", type: "normal" },
          { text: "تعداد كريات الدم الحمراء: 5.2 مليون (طبيعي)", type: "normal" },
          { text: "الهيموجلوبين: 14.5 جم/ديسيلتر (طبيعي)", type: "normal" },
          { text: "فيتامين D: 18 نانوغرام/مل (منخفض)", type: "warning" }
        ],
        images: [],
        notes: "يُنصح بتناول مكملات فيتامين D والتعرض للشمس"
      },
      {
        id: 3,
        title: "أشعة الركبة اليمنى",
        type: "أشعة",
        typeIcon: "🩻",
        date: "2025-11-28",
        time: "02:00 مساءً",
        status: "قيد المراجعة",
        doctor: "د. فاطمة حسن",
        facility: "مستشفى السلام",
        priority: "عاجل",
        aiSummary: "يتم حالياً مراجعة الصور من قبل الطبيب المختص.",
        findings: [
          { text: "في انتظار تقرير الطبيب المفصل", type: "info" }
        ],
        images: ["/icons/patient-placeholder.png", "/icons/patient-placeholder.png"],
        notes: "سيتم إبلاغك عند جاهزية التقرير النهائي"
      },
      {
        id: 4,
        title: "أشعة مقطعية للبطن",
        type: "أشعة مقطعية",
        typeIcon: "🔬",
        date: "2025-11-25",
        time: "11:00 صباحاً",
        status: "جاهز",
        doctor: "د. أحمد خالد",
        facility: "مركز التصوير المتقدم",
        priority: "عادي",
        aiSummary: "الفحص يظهر جميع الأعضاء بحالة طبيعية دون أي علامات مرضية.",
        findings: [
          { text: "الكبد والطحال بحجم طبيعي", type: "normal" },
          { text: "الكليتان تعملان بشكل طبيعي", type: "normal" },
          { text: "البنكرياس سليم", type: "normal" },
          { text: "لا توجد كتل أو أورام", type: "normal" }
        ],
        images: ["/icons/patient-placeholder.png"],
        notes: "النتائج ممتازة، لا حاجة لمتابعة إضافية"
      },
      {
        id: 5,
        title: "تخطيط القلب الكهربائي",
        type: "تخطيط قلب",
        typeIcon: "❤️",
        date: "2025-11-20",
        time: "03:30 مساءً",
        status: "جاهز",
        doctor: "د. ليلى يوسف",
        facility: "مركز القلب التخصصي",
        priority: "عاجل",
        aiSummary: "نظم القلب منتظم مع ملاحظة زيادة طفيفة في معدل ضربات القلب.",
        findings: [
          { text: "النظم القلبي منتظم", type: "normal" },
          { text: "معدل ضربات القلب: 95 نبضة/دقيقة", type: "warning" },
          { text: "لا توجد علامات على جلطات", type: "normal" },
          { text: "يُنصح بمراقبة معدل القلب", type: "info" }
        ],
        images: [],
        notes: "يُنصح بتقليل الكافيين والتوتر"
      },
      {
        id: 6,
        title: "تحليل وظائف الكلى",
        type: "تحاليل",
        typeIcon: "🔬",
        date: "2025-11-15",
        time: "08:00 صباحاً",
        status: "جاهز",
        doctor: "د. عمر السيد",
        facility: "مختبر الأمل الطبي",
        priority: "عادي",
        aiSummary: "جميع قيم وظائف الكلى ضمن المعدل الطبيعي.",
        findings: [
          { text: "الكرياتينين: 1.0 ملغ/ديسيلتر (طبيعي)", type: "normal" },
          { text: "اليوريا: 25 ملغ/ديسيلتر (طبيعي)", type: "normal" },
          { text: "معدل الترشيح الكبيبي: 95 مل/دقيقة (طبيعي)", type: "normal" }
        ],
        images: [],
        notes: "الكليتان تعملان بكفاءة ممتازة"
      }
    ];

  const [reports, setReports] = useState(reportsTemplate);

  const tResults = useTranslations("patientResults");
  const statsLabels = {
    total: tResults("stats.total"),
    ready: tResults("stats.ready"),
    pending: tResults("stats.pending"),
    thisMonth: tResults("stats.thisMonth")
  };
  const readyStatus = tResults("status.ready");
  const pendingStatus = tResults("status.pending");

  const stats = [
    {
      title: statsLabels.total,
      value: reports.length,
      icon: FaFileAlt,
      color: "bg-blue-500",
      bgLight: "bg-blue-50 dark:bg-blue-900/20"
    },
    {
      title: statsLabels.ready,
      value: reports.filter(r => r.status === readyStatus).length,
      icon: FaCheckCircle,
      color: "bg-green-500",
      bgLight: "bg-green-50 dark:bg-green-900/20"
    },
    {
      title: statsLabels.pending,
      value: reports.filter(r => r.status === pendingStatus).length,
      icon: FaHourglassHalf,
      color: "bg-orange-500",
      bgLight: "bg-orange-50 dark:bg-orange-900/20"
    },
    {
      title: statsLabels.thisMonth,
      value: reports.filter(r => new Date(r.date).getMonth() === new Date().getMonth()).length,
      icon: FaXRay,
      color: "bg-purple-500",
      bgLight: "bg-purple-50 dark:bg-purple-900/20"
    }
  ];

  const getStatusColor = (status) => {
    if (status === "ready" || status === "جاهز") {
      return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800";
    } else if (status === "pending" || status === "قيد المراجعة") {
      return "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800";
    } else if (status === "urgent" || status === "عاجل") {
      return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800";
    } else {
      return "bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800";
    }
  };

  const getPriorityColor = (priority) => {
    if (priority === "Urgent" || priority === "عاجل") {
      return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800";
    } else if (priority === "Normal" || priority === "عادي") {
      return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800";
    } else {
      return "bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800";
    }
  };

  const getFindingColor = (type) => {
    switch (type) {
      case "normal":
        return "text-green-600 dark:text-green-400";
      case "warning":
        return "text-orange-600 dark:text-orange-400";
      case "info":
        return "text-blue-600 dark:text-blue-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  const getFindingIcon = (type) => {
    switch (type) {
      case "normal":
        return "✓";
      case "warning":
        return "⚠";
      case "info":
        return "ℹ";
      default:
        return "•";
    }
  };

  const handleDownload = (reportId) => {
    showToast(labels('toast.download'), "success");
  };

  const handleShare = (reportId) => {
    showToast(labels('toast.share'), "success");
  };

  const handlePrint = (reportId) => {
    showToast(labels('toast.print'), "info");
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         report.doctor.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         report.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || report.type === filterType;
    const matchesStatus = filterStatus === "all" || report.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <>
      <ToastContainer />
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{labels.title}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">{labels.subtitle}</p>
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
                placeholder={labels.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-10 pl-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <FaFilter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full pr-10 pl-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
              >
                <option value="all">{labels('filters.allTypes')}</option>
                <option value={locale === "en" ? "X-Ray" : "أشعة"}>{labels('types.xray')}</option>
                <option value={locale === "en" ? "CT Scan" : "أشعة مقطعية"}>{labels('types.ct')}</option>
                <option value={locale === "en" ? "MRI" : "رنين مغناطيسي"}>{labels('types.mri')}</option>
                <option value={locale === "en" ? "Laboratory" : "تحاليل"}>{labels('types.lab')}</option>
                <option value={locale === "en" ? "ECG" : "تخطيط قلب"}>{labels('types.ultrasound')}</option>
              </select>
            </div>
            <div className="relative">
              <FaFilter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full pr-10 pl-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
              >
                <option value="all">{labels('filters.allStatuses')}</option>
                <option value={readyStatus}>{labels('statuses.ready')}</option>
                <option value={pendingStatus}>{labels('statuses.pending')}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Reports Grid */}
        {filteredReports.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-12 text-center border border-gray-200 dark:border-slate-700">
            <FaFileAlt className="text-6xl text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-lg">{labels.emptyState}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredReports.map((report) => (
              <div
                key={report.id}
                className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-slate-700 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    <div className="text-4xl">{report.typeIcon}</div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">{report.title}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{report.type}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs border ${getStatusColor(report.status)}`}>
                      {report.status}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs border ${getPriorityColor(report.priority)}`}>
                      {report.priority}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 mb-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{labels('reportLabels.doctor')}</span>
                    <span>{report.doctor}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{labels('reportLabels.facility')}</span>
                    <span>{report.facility}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{labels('reportLabels.date')}</span>
                    <span>{report.date} - {report.time}</span>
                  </div>
                </div>

                {/* AI Summary */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-2">
                    <span className="text-blue-600 dark:text-blue-400 font-bold text-sm">{labels('reportLabels.aiSummary')}:</span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">{report.aiSummary}</p>
                </div>

                {/* Findings */}
                <div className="mb-4">
                  <h4 className="font-bold text-gray-900 dark:text-white mb-2 text-sm">{labels('reportLabels.findings')}:</h4>
                  <div className="space-y-2">
                    {report.findings.map((finding, idx) => (
                      <div key={idx} className={`flex items-start gap-2 text-sm ${getFindingColor(finding.type)}`}>
                        <span className="font-bold">{getFindingIcon(finding.type)}</span>
                        <span>{finding.text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                {report.notes && (
                  <div className="bg-gray-50 dark:bg-slate-900 rounded-lg p-3 mb-4">
                    <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">{labels('reportLabels.notes')}:</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{report.notes}</p>
                  </div>
                )}

                {/* Images */}
                {report.images.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                      {locale === "en" ? `Images (${report.images.length})` : `الصور (${report.images.length})`}
                    </p>
                    <div className="flex gap-2 overflow-x-auto">
                      {report.images.map((img, idx) => (
                        <div
                          key={idx}
                          onClick={() => {
                            setSelectedReport(report);
                            setShowImageModal(true);
                          }}
                          className="w-20 h-20 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
                        >
                          <FaEye className="text-gray-500 dark:text-gray-400" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedReport(report);
                      setShowImageModal(true);
                    }}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
                  >
                    <FaEye />
                    <span>{labels('actions.view')}</span>
                  </button>
                  <button
                    onClick={() => handleDownload(report.id)}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                  >
                    <FaDownload />
                  </button>
                  <button
                    onClick={() => handleShare(report.id)}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                  >
                    <FaShare />
                  </button>
                  <button
                    onClick={() => handlePrint(report.id)}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                  >
                    <FaPrint />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Image Viewer Modal */}
        {showImageModal && selectedReport && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 p-6 flex items-center justify-between z-10">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{selectedReport.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{selectedReport.type} - {selectedReport.date}</p>
                </div>
                <button
                  onClick={() => setShowImageModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <FaTimes className="text-xl text-gray-600 dark:text-gray-400" />
                </button>
              </div>
              
              <div className="p-6">
                {/* AI Summary */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
                  <h4 className="font-bold text-blue-900 dark:text-blue-300 mb-2">{labels('reportLabels.aiSummary')}</h4>
                  <p className="text-gray-700 dark:text-gray-300">{selectedReport.aiSummary}</p>
                </div>

                {/* Findings */}
                <div className="mb-6">
                  <h4 className="font-bold text-gray-900 dark:text-white mb-3">{labels('reportLabels.findings')}:</h4>
                  <div className="space-y-2">
                    {selectedReport.findings.map((finding, idx) => (
                      <div key={idx} className={`flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-slate-900 ${getFindingColor(finding.type)}`}>
                        <span className="font-bold text-lg">{getFindingIcon(finding.type)}</span>
                        <span>{finding.text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Images */}
                {selectedReport.images.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-bold text-gray-900 dark:text-white mb-3">{locale === "en" ? "Medical Images:" : "الصور الطبية:"}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedReport.images.map((img, idx) => (
                        <div key={idx} className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                          <FaXRay className="text-6xl text-gray-400" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Doctor Info */}
                <div className="bg-gray-50 dark:bg-slate-900 rounded-lg p-4">
                  <h4 className="font-bold text-gray-900 dark:text-white mb-2">{locale === "en" ? "Doctor Information:" : "معلومات الطبيب:"}</h4>
                  <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    <p><span className="font-medium">{labels('reportLabels.doctor')}</span> {selectedReport.doctor}</p>
                    <p><span className="font-medium">{labels('reportLabels.facility')}</span> {selectedReport.facility}</p>
                    <p><span className="font-medium">{labels('reportLabels.date')}</span> {selectedReport.date} - {selectedReport.time}</p>
                    {selectedReport.notes && (
                      <p className="mt-2 pt-2 border-t border-gray-200 dark:border-slate-700">
                        <span className="font-medium">{labels('reportLabels.notes')}:</span> {selectedReport.notes}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
