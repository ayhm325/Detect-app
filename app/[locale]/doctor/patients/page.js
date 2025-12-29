"use client";

import DoctorLayout from "../DoctorLayout";
import { useToast } from "../../../components/ui/Toast";
import { useEffect, useMemo, useState } from "react";
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
  const t = useTranslations("doctorPatients");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [patients, setPatients] = useState([]);

  // Helper: compute age from birthDate string
  const computeAge = (birthDate) => {
    if (!birthDate) return "";
    try {
      const bd = new Date(birthDate);
      const diff = Date.now() - bd.getTime();
      const ageDt = new Date(diff);
      return Math.abs(ageDt.getUTCFullYear() - 1970);
    } catch (e) {
      return "";
    }
  };

  // Map server patient shape to UI shape expected by this page
  const mapPatient = (p) => {
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
  };

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
        // eslint-disable-next-line no-console
        console.error("Failed to fetch doctor patients:", err);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [locale]);

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

  const handleCall = (patient) => {
    showToast(`${t("toast.call")} ${patient.name}...`, "info");
  };

  const getStatusConfig = (status) => {
    const config = {
      stable: { label: t("statuses.stable"), color: "bg-green-100 text-green-700 border-green-200", icon: FaCheckCircle },
      critical: { label: t("statuses.critical"), color: "bg-red-100 text-red-700 border-red-200", icon: FaExclamationTriangle },
      recovering: { label: t("statuses.recovering"), color: "bg-orange-100 text-orange-700 border-orange-200", icon: FaClock },
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
                <FaUsers className="text-blue-600" />
                {t("title")}
              </h1>
              <p className="mt-2 text-gray-600">{t("subtitle")}</p>
            </div>

            {/* Add patient button removed per request */}
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl bg-white p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{t("stats.total")}</p>
                  <p className="mt-1 text-3xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <FaUsers className="text-3xl text-blue-600" />
              </div>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{t("stats.stable")}</p>
                  <p className="mt-1 text-3xl font-bold text-green-600">{stats.stable}</p>
                </div>
                <FaCheckCircle className="text-3xl text-green-600" />
              </div>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{t("stats.critical")}</p>
                  <p className="mt-1 text-3xl font-bold text-red-600">{stats.critical}</p>
                </div>
                <FaExclamationTriangle className="text-3xl text-red-600" />
              </div>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{t("stats.recovering")}</p>
                  <p className="mt-1 text-3xl font-bold text-orange-600">{stats.recovering}</p>
                </div>
                <FaClock className="text-3xl text-orange-600" />
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
                    placeholder={t("searchPlaceholder")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white py-2 pr-10 pl-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2">
                <FaFilter className="text-gray-500" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
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
                className="group rounded-xl bg-white p-6 shadow-lg border border-gray-100 transition-all hover:shadow-2xl"
              >
                {/* Header */}
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-3xl">
                      {patient.avatar}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{patient.name}</h3>
                      <p className="text-sm text-gray-600">
                        {patient.age} {t("ageSuffix")} • {patient.gender}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(patient.status)}
                </div>

                {/* Patient Info */}
                <div className="mb-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FaPhone className="text-blue-600" />
                    {patient.phone}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FaEnvelope className="text-purple-600" />
                    {patient.email}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FaCalendarAlt className="text-green-600" />
                    {t("labels.lastVisit")} {formatDate(patient.lastVisit, locale)}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FaCalendarAlt className="text-orange-600" />
                    {t("labels.nextAppointment")} {formatDate(patient.nextAppointment, locale)}
                  </div>
                </div>

                {/* Diagnosis */}
                <div className="mb-4 rounded-lg bg-blue-50 border border-blue-200 p-3">
                  <p className="text-xs font-medium text-blue-900 mb-1">{t("labels.diagnosis")}</p>
                  <p className="text-sm text-blue-800">{patient.diagnosis}</p>
                </div>

                {/* Medical Info */}
                <div className="mb-4 flex items-center justify-between text-sm">
                  <div>
                    <span className="text-gray-600">{t("labels.bloodType")}</span>
                    <span className="ml-2 font-bold text-red-600">{patient.bloodType}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">{t("labels.scans")}</span>
                    <span className="ml-2 font-bold text-blue-600">{patient.scansCount}</span>
                  </div>
                </div>

                {/* Conditions */}
                {patient.conditions && patient.conditions.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-medium text-gray-700 mb-1">{t("labels.chronic")}</p>
                    <div className="flex flex-wrap gap-1">
                      {patient.conditions.split(/,|،/).map((condition, idx) => (
                        <span
                          key={idx}
                          className="rounded-full bg-orange-100 border border-orange-200 px-2 py-1 text-xs text-orange-700"
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
                    className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-all hover:bg-blue-700"
                  >
                    <FaEye />
                    {t("actions.view")}
                  </button>
                  <button
                    onClick={() => handleStartChat(patient)}
                    className="flex items-center justify-center rounded-lg bg-green-600 px-3 py-2 text-white transition-all hover:bg-green-700"
                    title={t("actions.chat")}
                  >
                    <FaComments />
                  </button>
                  <button
                    onClick={() => handleCall(patient)}
                    className="flex items-center justify-center rounded-lg bg-purple-600 px-3 py-2 text-white transition-all hover:bg-purple-700"
                    title={t("actions.call")}
                  >
                    <FaPhone />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredPatients.length === 0 && (
            <div className="rounded-xl bg-white p-12 text-center shadow-lg border border-gray-100">
              <FaUsers className="mx-auto mb-4 text-5xl text-gray-300" />
              <p className="text-lg text-gray-600">{t("emptyState")}</p>
            </div>
          )}
        </div>
      </div>

      {/* Patient Details Modal */}
      {viewModalOpen && selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative w-full max-w-3xl rounded-xl bg-white shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-200 p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-4xl">
                  {selectedPatient.avatar}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedPatient.name}</h2>
                  <p className="text-gray-600">
                    {selectedPatient.age} {t("ageSuffix")} • {selectedPatient.gender}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewModalOpen(false)}
                className="rounded-lg p-2 text-gray-600 transition-all hover:bg-gray-100"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="max-h-[70vh] overflow-y-auto p-6">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Contact Info */}
                <div className="rounded-lg bg-gray-50 border border-gray-200 p-4">
                  <h3 className="mb-3 font-bold text-gray-900 flex items-center gap-2">
                    <FaPhone className="text-blue-600" />
                    {t("sections.contact")}
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-600">{t("labels.phone")}</span>
                      <span className="mr-2 font-medium">{selectedPatient.phone}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">{t("labels.email")}</span>
                      <span className="mr-2 font-medium">{selectedPatient.email}</span>
                    </div>
                  </div>
                </div>

                {/* Medical Info */}
                <div className="rounded-lg bg-gray-50 border border-gray-200 p-4">
                  <h3 className="mb-3 font-bold text-gray-900 flex items-center gap-2">
                    <FaHospital className="text-red-600" />
                    {t("sections.medical")}
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-600">{t("labels.bloodType")}</span>
                      <span className="mr-2 font-bold text-red-600">{selectedPatient.bloodType}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">{t("labels.status")}</span>
                      <span className="mr-2">{getStatusBadge(selectedPatient.status)}</span>
                    </div>
                  </div>
                </div>

                {/* Diagnosis */}
                <div className="md:col-span-2 rounded-lg bg-blue-50 border border-blue-200 p-4">
                  <h3 className="mb-2 font-bold text-blue-900 flex items-center gap-2">
                    <FaFileAlt />
                    {t("sections.diagnosis")}
                  </h3>
                  <p className="text-blue-800">{selectedPatient.diagnosis}</p>
                </div>

                {/* Appointments */}
                <div className="rounded-lg bg-gray-50 border border-gray-200 p-4">
                  <h3 className="mb-3 font-bold text-gray-900 flex items-center gap-2">
                    <FaCalendarAlt className="text-green-600" />
                    {t("sections.appointments")}
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-600">{t("labels.lastVisit")}</span>
                      <span className="mr-2 font-medium">
                        {formatDate(selectedPatient.lastVisit, locale)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">{t("labels.nextAppointment")}</span>
                      <span className="mr-2 font-medium">
                        {formatDate(selectedPatient.nextAppointment, locale)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="rounded-lg bg-gray-50 border border-gray-200 p-4">
                  <h3 className="mb-3 font-bold text-gray-900 flex items-center gap-2">
                    <FaHistory className="text-purple-600" />
                    {t("sections.stats")}
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-600">{t("labels.scans")}</span>
                      <span className="mr-2 font-bold text-blue-600">{selectedPatient.scansCount}</span>
                    </div>
                  </div>
                </div>

                {/* Chronic Conditions */}
                {selectedPatient.conditions && selectedPatient.conditions.length > 0 && (
                  <div className="md:col-span-2 rounded-lg bg-orange-50 border border-orange-200 p-4">
                    <h3 className="mb-3 font-bold text-orange-900">{t("labels.chronic")}</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedPatient.conditions.split(/,|،/).map((condition, idx) => (
                        <span
                          key={idx}
                          className="rounded-full bg-orange-100 border border-orange-300 px-3 py-1 text-sm text-orange-800"
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
