"use client";

import DoctorLayout from "../DoctorLayout";
import { useToast } from "../../../components/ui/Toast";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FaUsers,
  FaSearch,
  FaFilter,
  FaEye,
  FaComments,
  FaFileAlt,
  FaPhone,
  FaEnvelope,
  FaCalendarAlt,
  FaCheckCircle,
  FaExclamationTriangle,
  FaClock,
  FaUserPlus,
  FaTimes,
  FaHistory,
  FaHospital,
} from "react-icons/fa";
import { useTranslations } from "next-intl";
import { formatDate } from "../../../lib/date";

// You may need to get locale and labels from props or context, adjust as needed
export default function DoctorPatientsPage({ locale }) {
  const { showToast, ToastContainer } = useToast();
  const router = useRouter();
  const t = useTranslations("doctorPatients");
  const ui = useTranslations("ui");
  const placeholder = ui("placeholder");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [patients, setPatients] = useState([]);

  const getGenderLabel = useCallback(
    (gender) => {
      const raw = (gender ?? "").toString().trim();
      const g = raw.toLowerCase();
      if (!g) return "";

      if (g === "male" || g === "m" || g === "ذكر") return t("genders.male");
      if (g === "female" || g === "f" || g === "أنثى" || g === "انثى") return t("genders.female");

      return raw;
    },
    [t]
  );

  // Helper: compute age from birthDate string
  const computeAge = useCallback((birthDate) => {
    if (!birthDate) return "";
    try {
      const bd = new Date(birthDate);
      const diff = Date.now() - bd.getTime();
      const ageDt = new Date(diff);
      return Math.abs(ageDt.getUTCFullYear() - 1970);
    } catch (e) {
      return "";
    }
  }, []);

  // Map server patient shape to UI shape expected by this page
  const mapPatient = useCallback((p) => {
    const name = p.fullName || (p.user && p.user.fullName) || p.name || "";
    const birthDate = p.birthDate || p.birth_date || null;
    const age = p.age || computeAge(birthDate) || "";
    const gender = p.gender || (p.user && p.user.gender) || "";
    const phone = p.phone || (p.user && p.user.phone) || p.mobile || "";
    const email = p.email || (p.user && p.user.email) || "";
    // Map backend status (e.g., active/suspended) to UI status keys (stable/critical/recovering)
    let status = p.status || (p.user && p.user.status) || "stable";
    if (status === "active") status = "stable";
    if (status === "suspended") status = "critical";

    return {
      id: p.id || p.userId || Math.random().toString(36).slice(2, 9),
      name,
      age,
      gender,
      phone,
      email,
      status,
      lastVisit: p.lastVisit || p.last_visit || p.joinDate || new Date().toISOString(),
      nextAppointment: p.nextAppointment || p.next_appointment || null,
      diagnosis: p.notes || p.diagnosis || (p.medicalRecords && p.medicalRecords[0] && p.medicalRecords[0].doctorNotes) || "",
      scansCount: p.medicalRecordsCount || p.scansCount || 0,
      avatar: (name && name.charAt ? name.charAt(0) : ""),
      bloodType: p.bloodType || p.blood_type || "",
      conditions: p.conditions || p.chronicConditions || p.notes || "",
    };
  }, [computeAge]);

  // Fetch real patients from the API (fallback to translation-based template on error)
  useEffect(() => {
    let mounted = true;
    const prefix = locale ? `/${locale}` : "";
    (async () => {
      try {
        const res = await fetch(`${prefix}/api/doctor/patients`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        // support both direct array and { patients: [] }
        const list = Array.isArray(json) ? json : json.patients || json.list || [];
        const mapped = list.map(mapPatient);
        if (mounted) setPatients(mapped);
      } catch (err) {
        // fetch failed — leave `patients` as-is (the translations-based template
        // is applied by a separate effect). Log for debugging.
        console.error("Failed to fetch doctor patients:", err);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [locale, mapPatient]);

  const stats = {
    total: patients.length,
    stable: patients.filter((p) => p.status === "stable").length,
    critical: patients.filter((p) => p.status === "critical").length,
    recovering: patients.filter((p) => p.status === "recovering").length,
  };

  const filteredPatients = patients.filter((patient) => {
    const matchesSearch =
      searchQuery === "" ||
      patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.phone.includes(searchQuery) ||
      patient.diagnosis.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = filterStatus === "all" || patient.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const handleViewDetails = (patient) => {
    setSelectedPatient(patient);
    setViewModalOpen(true);
    showToast(`${t("toast.viewDetails")} ${patient.name}`, "info");
  };

  const handleStartChat = (patient) => {
    showToast(`${t("toast.chat")} ${patient.name}`, "info");
  };

  const handleViewResults = (patient) => {
    const prefix = locale ? `/${locale}` : "";
    const targetId = patient?.id;
    if (!targetId) {
      showToast(t("error"), "error");
      return;
    }
    router.push(`${prefix}/doctor/results?patientId=${encodeURIComponent(targetId)}`);
  };

  const handleCall = (patient) => {
    showToast(`${t("toast.call")} ${patient.name}...`, "info");
  };

  const getStatusConfig = (status) => {
    const config = {
      stable: {
        label: t("statuses.stable"),
        color: "bg-(--ui-success-bg) text-(--ui-success-foreground) border-(--ui-success-border)",
        icon: FaCheckCircle,
      },
      critical: {
        label: t("statuses.critical"),
        color: "bg-(--ui-danger-bg) text-(--ui-danger-foreground) border-(--ui-danger-border)",
        icon: FaExclamationTriangle,
      },
      recovering: {
        label: t("statuses.recovering"),
        color: "bg-(--ui-warning-bg) text-(--ui-warning-foreground) border-(--ui-warning-border)",
        icon: FaClock,
      },
    };
    return config[status] || config.stable;
  };


  // Helper to render status badge
  const getStatusBadge = (status) => {
    const config = getStatusConfig(status);
    const Icon = config.icon;
    return (
      <span className={`flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium ${config.color}`}>
        <Icon className="mr-1" />
        {config.label}
      </span>
    );
  };

  // No translation-based patient template — patients come from the API only.

  return (
    <DoctorLayout>
      <ToastContainer />
      <div
        className="min-h-screen bg-(--ui-surface) text-(--ui-foreground) p-6"
      >
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-(--ui-foreground) flex items-center gap-3">
                <FaUsers className="text-(--ui-info)" />
                {t("title")}
              </h1>
              <p className="mt-2 text-(--ui-muted-foreground)">{t("subtitle")}</p>
            </div>

            {/* Add patient button removed per request */}
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="card-glass rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-(--ui-muted-foreground)">{t("stats.total")}</p>
                  <p className="mt-1 text-3xl font-bold text-(--ui-foreground)">{stats.total}</p>
                </div>
                <FaUsers className="text-3xl text-(--ui-info)" />
              </div>
            </div>

            <div className="card-glass rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-(--ui-muted-foreground)">{t("stats.stable")}</p>
                  <p className="mt-1 text-3xl font-bold text-(--ui-success)">{stats.stable}</p>
                </div>
                <FaCheckCircle className="text-3xl text-(--ui-success)" />
              </div>
            </div>

            <div className="card-glass rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-(--ui-muted-foreground)">{t("stats.critical")}</p>
                  <p className="mt-1 text-3xl font-bold text-(--ui-danger)">{stats.critical}</p>
                </div>
                <FaExclamationTriangle className="text-3xl text-(--ui-danger)" />
              </div>
            </div>

            <div className="card-glass rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-(--ui-muted-foreground)">{t("stats.recovering")}</p>
                  <p className="mt-1 text-3xl font-bold text-(--ui-warning)">{stats.recovering}</p>
                </div>
                <FaClock className="text-3xl text-(--ui-warning)" />
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="card-glass rounded-xl p-6">
            <div className="flex flex-wrap items-center gap-4">
              {/* Search */}
              <div className="flex-1 min-w-62.5">
                <div className="relative">
                  <FaSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-(--ui-muted-foreground)" />
                  <input
                    type="text"
                    placeholder={t("searchPlaceholder")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-lg border border-(--ui-border) bg-(--ui-surface) py-2 pr-10 pl-4 text-sm text-(--ui-foreground) placeholder:text-(--ui-muted-foreground) focus:border-(--ui-ring) focus:outline-none focus:ring-2 focus:ring-(--ui-ring)/20"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2">
                <FaFilter className="text-(--ui-muted-foreground)" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="rounded-lg border border-(--ui-border) bg-(--ui-surface) px-4 py-2 text-sm font-medium text-(--ui-foreground) focus:border-(--ui-ring) focus:outline-none focus:ring-2 focus:ring-(--ui-ring)/20"
                >
                  <option value="all">{t("filters.all")}</option>
                  <option value="stable">{t("statuses.stable")}</option>
                  <option value="critical">{t("statuses.critical")}</option>
                  <option value="recovering">{t("statuses.recovering")}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Patients Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredPatients.map((patient) => (
              <div
                key={patient.id}
                className="group card-glass rounded-xl p-6 transition-all hover:shadow-2xl"
              >
                {/* Header */}
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-(--ui-info-bg) text-(--ui-info-foreground) text-3xl">
                      {patient.avatar}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-(--ui-foreground)">{patient.name}</h3>
                      <p className="text-sm text-(--ui-muted-foreground)">
                        {patient.age} {t("ageSuffix")}
                        {patient.gender ? ` • ${getGenderLabel(patient.gender)}` : ""}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(patient.status)}
                </div>

                {/* Patient Info */}
                <div className="mb-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-(--ui-muted-foreground)">
                    <FaPhone className="text-(--ui-info)" />
                    {patient.phone}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-(--ui-muted-foreground)">
                    <FaEnvelope className="text-(--ui-info)" />
                    {patient.email}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-(--ui-muted-foreground)">
                    <FaCalendarAlt className="text-(--ui-success)" />
                    {t("labels.lastVisit")} {formatDate(patient.lastVisit, locale, placeholder)}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-(--ui-muted-foreground)">
                    <FaCalendarAlt className="text-(--ui-warning)" />
                    {t("labels.nextAppointment")} {formatDate(patient.nextAppointment, locale, placeholder)}
                  </div>
                </div>

                {/* Diagnosis */}
                <div className="mb-4 rounded-lg bg-(--ui-info-bg) border border-(--ui-info-border) p-3">
                  <p className="text-xs font-medium text-(--ui-info-foreground) mb-1">{t("labels.diagnosis")}</p>
                  <p className="text-sm text-(--ui-info-foreground) opacity-90">{patient.diagnosis}</p>
                </div>

                {/* Medical Info */}
                <div className="mb-4 flex items-center justify-between text-sm">
                  <div>
                    <span className="text-(--ui-muted-foreground)">{t("labels.bloodType")}</span>
                    <span className="ml-2 font-bold text-(--ui-danger)">{patient.bloodType}</span>
                  </div>
                  <div>
                    <span className="text-(--ui-muted-foreground)">{t("labels.scans")}</span>
                    <span className="ml-2 font-bold text-(--ui-info)">{patient.scansCount}</span>
                  </div>
                </div>

                {/* Conditions */}
                {patient.conditions && patient.conditions.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-medium text-(--ui-foreground) opacity-80 mb-1">{t("labels.chronic")}</p>
                    <div className="flex flex-wrap gap-1">
                      {patient.conditions.split(/,|،/).map((condition, idx) => (
                        <span
                          key={idx}
                          className="rounded-full bg-(--ui-warning-bg) border border-(--ui-warning-border) px-2 py-1 text-xs text-(--ui-warning-foreground)"
                        >
                          {condition.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleViewDetails(patient)}
                    className="btn-gradient flex-1 flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium"
                  >
                    <FaEye />
                    {t("actions.view")}
                  </button>
                  <button
                    onClick={() => handleViewResults(patient)}
                    className="flex items-center justify-center rounded-lg bg-(--ui-surface-2) border border-(--ui-border) px-3 py-2 text-(--ui-foreground) transition-all hover:opacity-90"
                    title={t("actions.results")}
                  >
                    <FaFileAlt />
                  </button>
                  <button
                    onClick={() => handleStartChat(patient)}
                    className="flex items-center justify-center rounded-lg bg-(--ui-success) px-3 py-2 text-white transition-all hover:opacity-90"
                    title={t("actions.chat")}
                  >
                    <FaComments />
                  </button>
                  <button
                    onClick={() => handleCall(patient)}
                    className="flex items-center justify-center rounded-lg bg-(--ui-info) px-3 py-2 text-white transition-all hover:opacity-90"
                    title={t("actions.call")}
                  >
                    <FaPhone />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredPatients.length === 0 && (
            <div className="card-glass rounded-xl p-12 text-center">
              <FaUsers className="mx-auto mb-4 text-5xl text-(--ui-muted-foreground) opacity-50" />
              <p className="text-lg text-(--ui-muted-foreground)">{t("emptyState")}</p>
            </div>
          )}
        </div>
      </div>

      {/* Patient Details Modal */}
      {viewModalOpen && selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-(--color-neutral)/50 p-4">
          <div className="relative w-full max-w-3xl rounded-xl bg-(--ui-surface) text-(--ui-foreground) shadow-2xl border border-(--ui-border)">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-(--ui-border) p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-(--ui-info-bg) text-(--ui-info-foreground) text-4xl">
                  {selectedPatient.avatar}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-(--ui-foreground)">{selectedPatient.name}</h2>
                  <p className="text-(--ui-muted-foreground)">
                    {selectedPatient.age} {t("ageSuffix")}
                    {selectedPatient.gender ? ` • ${getGenderLabel(selectedPatient.gender)}` : ""}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewModalOpen(false)}
                className="rounded-lg p-2 text-(--ui-muted-foreground) transition-all hover:bg-(--ui-surface-2)"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="max-h-[70vh] overflow-y-auto p-6">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Contact Info */}
                <div className="rounded-lg bg-(--ui-surface-2) border border-(--ui-border) p-4">
                  <h3 className="mb-3 font-bold text-(--ui-foreground) flex items-center gap-2">
                    <FaPhone className="text-(--ui-info)" />
                    {t("sections.contact")}
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-(--ui-muted-foreground)">{t("labels.phone")}</span>
                      <span className="mr-2 font-medium">{selectedPatient.phone}</span>
                    </div>
                    <div>
                      <span className="text-(--ui-muted-foreground)">{t("labels.email")}</span>
                      <span className="mr-2 font-medium">{selectedPatient.email}</span>
                    </div>
                  </div>
                </div>

                {/* Medical Info */}
                <div className="rounded-lg bg-(--ui-surface-2) border border-(--ui-border) p-4">
                  <h3 className="mb-3 font-bold text-(--ui-foreground) flex items-center gap-2">
                    <FaHospital className="text-(--ui-danger)" />
                    {t("sections.medical")}
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-(--ui-muted-foreground)">{t("labels.bloodType")}</span>
                      <span className="mr-2 font-bold text-(--ui-danger)">{selectedPatient.bloodType}</span>
                    </div>
                    <div>
                      <span className="text-(--ui-muted-foreground)">{t("labels.status")}</span>
                      <span className="mr-2">{getStatusBadge(selectedPatient.status)}</span>
                    </div>
                  </div>
                </div>

                {/* Diagnosis */}
                <div className="md:col-span-2 rounded-lg bg-(--ui-info-bg) border border-(--ui-info-border) p-4">
                  <h3 className="mb-2 font-bold text-(--ui-info-foreground) flex items-center gap-2">
                    <FaFileAlt />
                    {t("sections.diagnosis")}
                  </h3>
                  <p className="text-(--ui-info-foreground) opacity-90">{selectedPatient.diagnosis}</p>
                </div>

                {/* Appointments */}
                <div className="rounded-lg bg-(--ui-surface-2) border border-(--ui-border) p-4">
                  <h3 className="mb-3 font-bold text-(--ui-foreground) flex items-center gap-2">
                    <FaCalendarAlt className="text-(--ui-success)" />
                    {t("sections.appointments")}
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-(--ui-muted-foreground)">{t("labels.lastVisit")}</span>
                      <span className="mr-2 font-medium">
                        {formatDate(selectedPatient.lastVisit, locale, placeholder)}
                      </span>
                    </div>
                    <div>
                      <span className="text-(--ui-muted-foreground)">{t("labels.nextAppointment")}</span>
                      <span className="mr-2 font-medium">
                        {formatDate(selectedPatient.nextAppointment, locale, placeholder)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="rounded-lg bg-(--ui-surface-2) border border-(--ui-border) p-4">
                  <h3 className="mb-3 font-bold text-(--ui-foreground) flex items-center gap-2">
                    <FaHistory className="text-(--ui-info)" />
                    {t("sections.stats")}
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-(--ui-muted-foreground)">{t("labels.scans")}</span>
                      <span className="mr-2 font-bold text-(--ui-info)">{selectedPatient.scansCount}</span>
                    </div>
                  </div>
                </div>

                {/* Chronic Conditions */}
                {selectedPatient.conditions && selectedPatient.conditions.length > 0 && (
                  <div className="md:col-span-2 rounded-lg bg-(--ui-warning-bg) border border-(--ui-warning-border) p-4">
                    <h3 className="mb-3 font-bold text-(--ui-warning-foreground)">{t("labels.chronic")}</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedPatient.conditions.split(/,|،/).map((condition, idx) => (
                        <span
                          key={idx}
                          className="rounded-full bg-(--ui-warning-bg) border border-(--ui-warning-border) px-3 py-1 text-sm text-(--ui-warning-foreground)"
                        >
                          {condition.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </DoctorLayout>
  );
}
