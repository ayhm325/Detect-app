"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "../../../components/ui/Toast";
import { FaFileAlt, FaXRay, FaSearch, FaFilter, FaDownload, FaEye, FaShare, FaPrint, FaTimes, FaCheckCircle, FaHourglassHalf } from "react-icons/fa";
import { useTranslations } from "next-intl";

export default function PatientResultsPage() {
  const router = useRouter();
  const { showToast, ToastContainer } = useToast();
  const t = useTranslations("patientResults");

  // UI state variables
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const labels = t;

  // fetch real reports from API (only chest X-rays will be returned)
  const [reports, setReports] = useState([]);

  // load real reports from API (server returns chest X-rays only)
  useEffect(() => {
    Promise.resolve().then(async () => {
      try {
        const res = await fetch("/api/patient/results");
        if (!res.ok) return;
        const data = await res.json();
        setReports(data.records || []);
      } catch (err) {
        console.error("Failed to load patient results:", err);
      }
    });
  }, []);
  const statsLabels = {
    total: t("stats.total"),
    ready: t("stats.ready"),
    pending: t("stats.pending"),
    thisMonth: t("stats.thisMonth")
  };

  const statusSynonyms = t.raw?.("statusSynonyms") || {};
  const prioritySynonyms = t.raw?.("prioritySynonyms") || {};

  const normalizeToken = (value) => String(value ?? "").trim().toLowerCase();
  const tokenInList = (value, list) => {
    const token = normalizeToken(value);
    if (!token) return false;
    return Array.isArray(list) && list.some((x) => normalizeToken(x) === token);
  };

  const normalizeStatus = (status) => {
    if (tokenInList(status, statusSynonyms.ready)) return "ready";
    if (tokenInList(status, statusSynonyms.pending)) return "pending";
    if (tokenInList(status, statusSynonyms.urgent)) return "urgent";
    return "unknown";
  };

  const normalizePriority = (priority) => {
    if (tokenInList(priority, prioritySynonyms.urgent)) return "urgent";
    if (tokenInList(priority, prioritySynonyms.normal)) return "normal";
    return "unknown";
  };

  const getStatusLabel = (status) => {
    const normalized = normalizeStatus(status);
    if (normalized === "ready") return labels("statuses.ready");
    if (normalized === "pending") return labels("statuses.pending");
    if (normalized === "urgent") return labels("priorities.urgent");
    return status;
  };

  const getPriorityLabel = (priority) => {
    const normalized = normalizePriority(priority);
    if (normalized === "urgent") return labels("priorities.urgent");
    if (normalized === "normal") return labels("priorities.normal");
    return priority;
  };

  const stats = [
    {
      title: statsLabels.total,
      value: reports.length,
      icon: FaFileAlt,
      iconClass: "text-(--ui-info)",
      bgClass: "bg-(--ui-info-bg)"
    },
    {
      title: statsLabels.ready,
      value: reports.filter(r => normalizeStatus(r.status) === "ready").length,
      icon: FaCheckCircle,
      iconClass: "text-(--ui-success)",
      bgClass: "bg-(--ui-success-bg)"
    },
    {
      title: statsLabels.pending,
      value: reports.filter(r => normalizeStatus(r.status) === "pending").length,
      icon: FaHourglassHalf,
      iconClass: "text-(--ui-warning)",
      bgClass: "bg-(--ui-warning-bg)"
    },
    {
      title: statsLabels.thisMonth,
      value: reports.filter(r => new Date(r.date).getMonth() === new Date().getMonth()).length,
      icon: FaXRay,
      iconClass: "text-(--ui-info)",
      bgClass: "bg-(--ui-info-bg)"
    }
  ];

  const getStatusColor = (status) => {
    const normalized = normalizeStatus(status);
    if (normalized === "ready") {
      return "bg-(--ui-success-bg) text-(--ui-success-foreground) border-(--ui-success-border)";
    } else if (normalized === "pending") {
      return "bg-(--ui-warning-bg) text-(--ui-warning-foreground) border-(--ui-warning-border)";
    } else if (normalized === "urgent") {
      return "bg-(--ui-danger-bg) text-(--ui-danger-foreground) border-(--ui-danger-border)";
    } else {
      return "bg-(--ui-surface-2)/60 text-(--ui-muted-foreground) border-(--ui-border)";
    }
  };

  const getPriorityColor = (priority) => {
    const normalized = normalizePriority(priority);
    if (normalized === "urgent") {
      return "bg-(--ui-danger-bg) text-(--ui-danger-foreground) border-(--ui-danger-border)";
    } else if (normalized === "normal") {
      return "bg-(--ui-info-bg) text-(--ui-info-foreground) border-(--ui-info-border)";
    } else {
      return "bg-(--ui-surface-2)/60 text-(--ui-muted-foreground) border-(--ui-border)";
    }
  };

  const getFindingColor = (type) => {
    switch (type) {
      case "normal":
        return "text-(--ui-success)";
      case "warning":
        return "text-(--ui-warning)";
      case "info":
        return "text-(--ui-info)";
      default:
        return "text-(--ui-muted-foreground)";
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
    const matchesStatus = filterStatus === "all" || normalizeStatus(report.status) === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <>
      <ToastContainer />
      <div className="min-h-screen bg-(--ui-surface) text-(--ui-foreground) p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-(--ui-foreground)">{labels("title")}</h1>
          <p className="text-(--ui-muted-foreground) mt-2">{labels("subtitle")}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="card-glass rounded-xl p-6 border border-(--ui-border)"
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${stat.bgClass}`}>
                  <stat.icon className={`text-2xl ${stat.iconClass}`} />
                </div>
                <div>
                  <p className="text-(--ui-muted-foreground) text-sm">{stat.title}</p>
                  <p className="text-3xl font-bold text-(--ui-foreground)">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="card-glass rounded-xl p-6 mb-8 border border-(--ui-border)">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-(--ui-muted-foreground)" />
              <input
                type="text"
                placeholder={labels("searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-10 pl-4 py-3 border border-(--ui-border) rounded-lg bg-(--ui-surface) text-(--ui-foreground) focus:outline-none focus-visible:ring-2 focus-visible:ring-(--ui-ring)"
              />
            </div>        
            <div className="relative">
              <FaFilter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-(--ui-muted-foreground)" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full pr-10 pl-4 py-3 border border-(--ui-border) rounded-lg bg-(--ui-surface) text-(--ui-foreground) focus:outline-none focus-visible:ring-2 focus-visible:ring-(--ui-ring) appearance-none"
              >
                <option value="all">{labels('filters.allStatuses')}</option>
                <option value="ready">{labels('statuses.ready')}</option>
                <option value="pending">{labels('statuses.pending')}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Reports Grid */}
        {filteredReports.length === 0 ? (
          <div className="card-glass rounded-xl p-12 text-center border border-(--ui-border)">
            <FaFileAlt className="text-6xl text-(--ui-muted-foreground) mx-auto mb-4" />
            <p className="text-(--ui-muted-foreground) text-lg">{labels("emptyState")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredReports.map((report) => (
              <div
                key={report.id}
                className="card-glass rounded-xl p-6 border border-(--ui-border) hover:bg-(--ui-surface-2)/40 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    <div className="text-4xl">{report.typeIcon}</div>
                    <div>
                      <h3 className="text-lg font-bold text-(--ui-foreground)">{report.title}</h3>
                      <p className="text-sm text-(--ui-muted-foreground)">{report.type}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs border ${getStatusColor(report.status)}`}>
                      {getStatusLabel(report.status)}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs border ${getPriorityColor(report.priority)}`}>
                      {getPriorityLabel(report.priority)}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 mb-4 text-sm text-(--ui-muted-foreground)">
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
                <div className="bg-(--ui-info-bg) rounded-lg p-4 mb-4 border border-(--ui-info-border)">
                  <div className="flex items-start gap-2">
                    <span className="text-(--ui-info) font-bold text-sm">{labels('reportLabels.aiSummary')}:</span>
                  </div>
                  <p className="text-sm text-(--ui-foreground) mt-2">{report.aiSummary}</p>
                </div>

                {/* Findings */}
                <div className="mb-4">
                  <h4 className="font-bold text-(--ui-foreground) mb-2 text-sm">{labels('reportLabels.findings')}:</h4>
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
                  <div className="bg-(--ui-surface-2)/40 rounded-lg p-3 mb-4 border border-(--ui-border)">
                    <p className="text-sm font-medium text-(--ui-foreground) mb-1">{labels('reportLabels.notes')}:</p>
                    <p className="text-sm text-(--ui-muted-foreground)">{report.notes}</p>
                  </div>
                )}

                {/* Images */}
                {report.images.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-(--ui-foreground) mb-2">
                      {t("sections.imagesCount", { count: report.images.length })}
                    </p>
                    <div className="flex gap-2 overflow-x-auto">
                      {report.images.map((img, idx) => (
                        <div
                          key={idx}
                          onClick={() => {
                            setSelectedReport(report);
                            setShowImageModal(true);
                          }}
                          className="w-20 h-20 rounded-lg bg-(--ui-surface-2) border border-(--ui-border) flex items-center justify-center cursor-pointer hover:bg-(--ui-surface-2)/60 transition-colors"
                        >
                          <FaEye className="text-(--ui-muted-foreground)" />
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
                    className="flex-1 btn-gradient px-4 py-2 rounded-lg text-sm flex items-center justify-center gap-2"
                  >
                    <FaEye />
                    <span>{labels('actions.view')}</span>
                  </button>
                  <button
                    onClick={() => handleDownload(report.id)}
                    className="bg-(--ui-success) hover:bg-(--ui-success)/90 text-(--ui-success-foreground) px-4 py-2 rounded-lg text-sm transition-colors"
                  >
                    <FaDownload />
                  </button>
                  <button
                    onClick={() => handleShare(report.id)}
                    className="bg-(--ui-info) hover:bg-(--ui-info)/90 text-(--ui-info-foreground) px-4 py-2 rounded-lg text-sm transition-colors"
                  >
                    <FaShare />
                  </button>
                  <button
                    onClick={() => handlePrint(report.id)}
                    className="bg-(--ui-surface-2) hover:bg-(--ui-surface-2)/70 text-(--ui-foreground) border border-(--ui-border) px-4 py-2 rounded-lg text-sm transition-colors"
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
          <div className="fixed inset-0 bg-(--color-neutral)/80 flex items-center justify-center z-50 p-4">
            <div className="card-glass rounded-xl border border-(--ui-border) max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-(--ui-surface) border-b border-(--ui-border) p-6 flex items-center justify-between z-10">
                <div>
                  <h3 className="text-xl font-bold text-(--ui-foreground)">{selectedReport.title}</h3>
                  <p className="text-sm text-(--ui-muted-foreground)">{selectedReport.type} - {selectedReport.date}</p>
                </div>
                <button
                  onClick={() => setShowImageModal(false)}
                  className="p-2 hover:bg-(--ui-surface-2)/60 rounded-lg transition-colors"
                >
                  <FaTimes className="text-xl text-(--ui-muted-foreground)" />
                </button>
              </div>
              
              <div className="p-6">
                {/* AI Summary */}
                <div className="bg-(--ui-info-bg) border border-(--ui-info-border) rounded-lg p-4 mb-6">
                  <h4 className="font-bold text-(--ui-info) mb-2">{labels('reportLabels.aiSummary')}</h4>
                  <p className="text-(--ui-foreground)">{selectedReport.aiSummary}</p>
                </div>

                {/* Findings */}
                <div className="mb-6">
                  <h4 className="font-bold text-(--ui-foreground) mb-3">{labels('reportLabels.findings')}:</h4>
                  <div className="space-y-2">
                    {selectedReport.findings.map((finding, idx) => (
                      <div key={idx} className={`flex items-start gap-3 p-3 rounded-lg bg-(--ui-surface-2)/40 border border-(--ui-border) ${getFindingColor(finding.type)}`}>
                        <span className="font-bold text-lg">{getFindingIcon(finding.type)}</span>
                        <span>{finding.text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Images */}
                {selectedReport.images.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-bold text-(--ui-foreground) mb-3">{t("modal.medicalImages")}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedReport.images.map((img, idx) => (
                        <div key={idx} className="aspect-square bg-(--ui-surface-2) border border-(--ui-border) rounded-lg flex items-center justify-center">
                          <FaXRay className="text-6xl text-(--ui-muted-foreground)" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Doctor Info */}
                <div className="bg-(--ui-surface-2)/40 border border-(--ui-border) rounded-lg p-4">
                  <h4 className="font-bold text-(--ui-foreground) mb-2">{t("modal.doctorInformation")}</h4>
                  <div className="space-y-1 text-sm text-(--ui-muted-foreground)">
                    <p><span className="font-medium">{labels('reportLabels.doctor')}</span> {selectedReport.doctor}</p>
                    <p><span className="font-medium">{labels('reportLabels.facility')}</span> {selectedReport.facility}</p>
                    <p><span className="font-medium">{labels('reportLabels.date')}</span> {selectedReport.date} - {selectedReport.time}</p>
                    {selectedReport.notes && (
                      <p className="mt-2 pt-2 border-t border-(--ui-border)">
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
