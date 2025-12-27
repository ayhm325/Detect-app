"use client";

import DoctorLayout from "../DoctorLayout";
import { useToast } from "../../../components/ui/Toast";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import {
  FaXRay,
  FaSearch,
  FaFilter,
  FaDownload,
  FaEye,
  FaCompressArrowsAlt,
  FaUser,
  FaCalendarAlt,
  FaClock,
  FaCheckCircle,
  FaHourglassHalf,
  FaExclamationTriangle,
  FaFileAlt,
  FaTimes,
  FaExpand,
  FaCompress,
  FaPrint,
  FaShare,
} from "react-icons/fa";
import useLocale from "../../../hooks/useLocale";
import { formatDate } from "../../../lib/date";
import { useTranslations } from "next-intl";

export default function DoctorResultsPage() {
  const { showToast, ToastContainer } = useToast();
  const { locale } = useLocale();
  const t = useTranslations("doctorResults");

  // ...existing code...
  // Replace all labels.X with t("key")
  // For example: t("title"), t("subtitle"), t("searchPlaceholder"), t("items.0.type"), t("items.0.status"), t("actions.view"), t("viewer.aiAnalysis"), t("emptyState")

  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedScan, setSelectedScan] = useState(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);


  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/api/doctor/results")
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch results");
        const data = await res.json();
        // Transform API data to match UI expectations
        const mapped = (data.records || []).map((r) => ({
          id: r.id,
          patientName: r.patient?.name || "-",
          patientId: r.patient?.id || "-",
          type: r.title || "X-Ray",
          bodyPart: t("bodyPart", { defaultValue: "Chest" }),
          date: r.createdAt,
          time: r.createdAt,
          status: "completed", // Assume completed for now
          aiSummary: r.aiResult || t("aiSummary", { defaultValue: "No AI summary" }),
          thumbnail: r.imageUrl || "/icons/xray-placeholder.png",
          findings: r.aiResult ? [{ type: "ai", text: r.aiResult }] : [],
        }));
        setScans(mapped);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [t]);

  const stats = {
    total: scans.length,
    completed: scans.filter((s) => s.status === "completed").length,
    pending: scans.filter((s) => s.status === "pending").length,
    today: scans.filter((s) => {
      const today = new Date();
      const scanDate = new Date(s.date);
      return (
        scanDate.getDate() === today.getDate() &&
        scanDate.getMonth() === today.getMonth() &&
        scanDate.getFullYear() === today.getFullYear()
      );
    }).length,
  };

  const filteredScans = scans
    .filter((scan) => {
      if (filterType !== "all" && scan.type !== filterType) return false;
      if (filterStatus !== "all" && scan.status !== filterStatus) return false;
      if (searchQuery) {
        return (
          (scan.patientName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          (scan.patientId || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          (scan.type || "").toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      return true;
    });

  const handleViewScan = (scan) => {
    setSelectedScan(scan);
    setViewerOpen(true);
    showToast(t("toast.viewingScan"), "info");
  };

  const handleDownload = (scan) => {
    showToast(t("toast.downloadStart"), "info");
    setTimeout(() => {
      showToast(t("toast.downloadStart"), "success");
    }, 1500);
  };

  const handlePrint = (scan) => {
    showToast(t("toast.printStart"), "info");
  };

  const handleShare = (scan) => {
    showToast(t("toast.shareCopied"), "success");
  };

  const getStatusBadge = (status) => {
    const config = {
      completed: { label: t("statuses.completed"), color: "bg-green-100 text-green-700 border-green-200", icon: FaCheckCircle },
      pending: { label: t("statuses.pending"), color: "bg-orange-100 text-orange-700 border-orange-200", icon: FaHourglassHalf },
      urgent: { label: t("statuses.urgent"), color: "bg-red-100 text-red-700 border-red-200", icon: FaExclamationTriangle },
    };
    const c = config[status] || config.pending;
    const Icon = c.icon;
    return (
      <span className={`flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium ${c.color}`}>
        <Icon />
        {c.label}
      </span>
    );
  };

  const getTypeIcon = (type) => {
    const typeConfig = {
      "X-Ray": { icon: "🩻", color: "bg-blue-100 text-blue-700" },
      "CT Scan": { icon: "🔬", color: "bg-purple-100 text-purple-700" },
      "MRI": { icon: "🧲", color: "bg-green-100 text-green-700" },
      "Ultrasound": { icon: "📡", color: "bg-orange-100 text-orange-700" },
    };
    const config = typeConfig[type] || typeConfig["X-Ray"];
    return (
      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${config.color} text-xl`}>
        {config.icon}
      </div>
    );
  };

  if (loading) {
    return (
      <DoctorLayout>
        <ToastContainer />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-lg text-gray-500">{t("loading", { defaultValue: "Loading results..." })}</div>
        </div>
      </DoctorLayout>
    );
  }

  if (error) {
    return (
      <DoctorLayout>
        <ToastContainer />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-lg text-red-500">{t("error", { defaultValue: "Error loading results:" })} {error}</div>
        </div>
      </DoctorLayout>
    );
  }

  return (
    <DoctorLayout>
      <ToastContainer />
      <div
        className={`min-h-screen bg-linear-to-br from-blue-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-6 text-gray-900 dark:text-gray-100
        [&_div.bg-white]:dark:bg-zinc-900 [&_div.bg-white]:dark:border-zinc-800
        [&_p.text-gray-900]:dark:text-white [&_p.text-gray-600]:dark:text-gray-300 [&_p.text-gray-500]:dark:text-gray-400
        [&_span.text-gray-900]:dark:text-white [&_span.text-gray-600]:dark:text-gray-300
        [&_input.bg-white]:dark:bg-zinc-900 [&_input.border-gray-300]:dark:border-zinc-700 [&_input.text-gray-900]:dark:text-gray-100`}
      >
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <FaXRay className="text-blue-600" />
                {t("title")}
              </h1>
              <p className="mt-2 text-gray-600">{t("subtitle")}</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl bg-white p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{t("stats.total", { defaultValue: "Total scans" })}</p>
                  <p className="mt-1 text-3xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <FaXRay className="text-3xl text-blue-600" />
              </div>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{t("stats.completed", { defaultValue: "Completed" })}</p>
                  <p className="mt-1 text-3xl font-bold text-green-600">{stats.completed}</p>
                </div>
                <FaCheckCircle className="text-3xl text-green-600" />
              </div>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{t("stats.pending", { defaultValue: "Under review" })}</p>
                  <p className="mt-1 text-3xl font-bold text-orange-600">{stats.pending}</p>
                </div>
                <FaHourglassHalf className="text-3xl text-orange-600" />
              </div>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{t("stats.today", { defaultValue: "Today" })}</p>
                  <p className="mt-1 text-3xl font-bold text-blue-600">{stats.today}</p>
                </div>
                <FaCalendarAlt className="text-3xl text-blue-600" />
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="rounded-xl bg-white p-6 shadow-lg border border-gray-100">
            <div className="flex flex-wrap items-center gap-4">
              {/* Search */}
              <div className="flex-1 min-w-62.5">
                <div className="relative">
                  <FaSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder={t("searchPlaceholder", { defaultValue: "Search by patient name or ID..." })}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white py-2 pr-10 pl-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>
            
              {/* Status Filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="all">{t("filters.allStatuses", { defaultValue: "All statuses" })}</option>
                <option value="completed">{t("status.completed", { defaultValue: "Completed" })}</option>
                <option value="pending">{t("status.pending", { defaultValue: "Under review" })}</option>
              </select>
            </div>
          </div>

          {/* Scans Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredScans.map((scan, idx) => (
              <div
                key={`${scan.id ?? 'scan'}-${idx}`}
                className="group rounded-xl bg-white p-6 shadow-lg border border-gray-100 transition-all hover:shadow-2xl"
              >
                {/* Header */}
                <div className="mb-4 flex items-start justify-between">
                  {getTypeIcon(scan.type)}
                  {getStatusBadge(scan.status)}
                </div>

                {/* Patient Info */}
                <div className="mb-4 space-y-2">
                  <h3 className="text-lg font-bold text-gray-900">{scan.patientName}</h3>
                  <p className="text-sm text-gray-600">{t("patientId")} {scan.patientId}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <FaCalendarAlt className="text-blue-600" />
                      {formatDate(scan.date, locale)}
                    </div>
                    <div className="flex items-center gap-1">
                      <FaClock className="text-purple-600" />
                      {scan.time}
                    </div>
                  </div>
                </div>

                {/* Scan Details */}
                <div className="mb-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">{t("type")}</span>
                    <span className="text-sm text-gray-600">{scan.type}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">{t("bodyPart")}</span>
                    <span className="text-sm text-gray-600">{scan.bodyPart}</span>
                  </div>
                </div>

                {/* AI Summary */}
                <div className="mb-4 rounded-lg bg-blue-50 border border-blue-200 p-3">
                  <p className="text-xs font-medium text-blue-900 mb-1">{t("aiSummary")}</p>
                  <p className="text-sm text-blue-800">{scan.aiSummary}</p>
                </div>

                {/* Findings */}
                {scan.findings.length > 0 && (
                  <div className="mb-4 space-y-1">
                    {scan.findings.slice(0, 2).map((finding, idx) => (
                      <div
                        key={idx}
                        className={`text-xs px-2 py-1 rounded ${
                          finding.type === "normal"
                            ? "bg-green-50 text-green-700"
                            : finding.type === "warning"
                            ? "bg-orange-50 text-orange-700"
                            : "bg-blue-50 text-blue-700"
                        }`}
                      >
                        • {finding.text}
                      </div>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleViewScan(scan)}
                    className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-blue-700"
                  >
                    <FaEye />
                    {t("actions.view")}
                  </button>
                  <button
                    onClick={() => handleDownload(scan)}
                    className="flex items-center justify-center rounded-lg bg-gray-100 px-3 py-2 text-gray-700 transition-all hover:bg-gray-200"
                    title={t("actions.download")}
                  >
                    <FaDownload />
                  </button>
                  <button
                    onClick={() => handlePrint(scan)}
                    className="flex items-center justify-center rounded-lg bg-gray-100 px-3 py-2 text-gray-700 transition-all hover:bg-gray-200"
                    title={t("actions.print")}
                  >
                    <FaPrint />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredScans.length === 0 && (
            <div className="rounded-xl bg-white p-12 text-center shadow-lg border border-gray-100">
              <FaXRay className="mx-auto mb-4 text-5xl text-gray-300" />
              <p className="text-lg text-gray-600">{t("emptyState", { defaultValue: "No results found." })}</p>
            </div>
          )}
        </div>
      </div>

      {/* Image Viewer Modal */}
      {viewerOpen && selectedScan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
          <div className={`relative bg-white rounded-xl shadow-2xl overflow-hidden ${isFullscreen ? "w-full h-full" : "max-w-5xl w-full max-h-[90vh]"}`}>
            {/* Viewer Header */}
            <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 p-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{selectedScan.patientName}</h2>
                <p className="text-sm text-gray-600">
                  {selectedScan.type} - {selectedScan.bodyPart}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="rounded-lg p-2 text-gray-600 transition-all hover:bg-gray-200"
                  title={isFullscreen ? (locale === "en" ? "Exit fullscreen" : "تصغير") : (locale === "en" ? "Fullscreen" : "ملء الشاشة")}
                >
                  {isFullscreen ? <FaCompress /> : <FaExpand />}
                </button>
                <button
                  onClick={() => handleDownload(selectedScan)}
                  className="rounded-lg p-2 text-gray-600 transition-all hover:bg-gray-200"
                  title={t("actions.download")}
                >
                  <FaDownload />
                </button>
                <button
                  onClick={() => handleShare(selectedScan)}
                  className="rounded-lg p-2 text-gray-600 transition-all hover:bg-gray-200"
                  title={locale === "en" ? "Share" : "مشاركة"}
                >
                  <FaShare />
                </button>
                <button
                  onClick={() => setViewerOpen(false)}
                  className="rounded-lg p-2 text-gray-600 transition-all hover:bg-gray-200"
                  title={t("actions.close")}
                >
                  <FaTimes />
                </button>
              </div>
            </div>

            {/* Viewer Content */}
            <div className="p-6 overflow-y-auto" style={{ maxHeight: isFullscreen ? "calc(100vh - 80px)" : "70vh" }}>
              <div className="mb-6 relative w-full overflow-hidden rounded-lg border border-gray-300 aspect-video bg-black">
                <Image
                  src={selectedScan.thumbnail}
                  alt={selectedScan.patientName}
                  fill
                  sizes="(min-width: 1024px) 900px, 100vw"
                  className="object-contain"
                />
              </div>

              {/* AI Analysis */}
              <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 mb-4">
                <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                  <FaFileAlt />
                  {t("viewer.aiAnalysis")}
                </h3>
                <p className="text-blue-800">{selectedScan.aiSummary}</p>
              </div>

              {/* Findings */}
              {selectedScan.findings.length > 0 && (
                <div className="rounded-lg bg-gray-50 border border-gray-200 p-4">
                  <h3 className="font-bold text-gray-900 mb-3">{t("viewer.findings")}:</h3>
                  <div className="space-y-2">
                    {selectedScan.findings.map((finding, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-lg ${
                          finding.type === "normal"
                            ? "bg-green-50 border border-green-200"
                            : finding.type === "warning"
                            ? "bg-orange-50 border border-orange-200"
                            : "bg-blue-50 border border-blue-200"
                        }`}
                      >
                        <p className="text-sm font-medium">{finding.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </DoctorLayout>
  );
}
