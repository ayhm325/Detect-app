"use client";

import DoctorLayout from "../DoctorLayout";
import { useToast } from "../../../components/ui/Toast";
import { useEffect, useMemo, useState } from "react";
import {
  FaCalendarAlt,
  FaClock,
  FaUser,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf,
  FaPlus,
  FaFilter,
  FaSearch,
  FaPhone,
  FaVideo,
  FaMapMarkerAlt,
  FaEdit,
  FaTrash,
} from "react-icons/fa";
import useLocale from "../../../hooks/useLocale";
import { useTranslations } from "next-intl";

export default function DoctorAppointmentsPage() {
  const { showToast, ToastContainer } = useToast();
  const { locale } = useLocale();
  const t = useTranslations("doctorAppointments");

  // ...existing code...
  // Replace all labels.X with t("key")
  // For example: t("title"), t("subtitle"), t("addButton"), t("toast.addSoon"), t("stats.total"), t("filters.all"), t("types.online"), t("actions.confirm"), t("statuses.confirmed")
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("list"); // list or calendar
  const [showAddModal, setShowAddModal] = useState(false);


  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // booking form state for doctor creating appointments
  const [bookPatientId, setBookPatientId] = useState("");
  const [patients, setPatients] = useState([]);
  const [patientsLoading, setPatientsLoading] = useState(false);
  const [patientSearch, setPatientSearch] = useState("");
  const [bookDate, setBookDate] = useState("");
  const [bookTime, setBookTime] = useState("");
  const [bookType, setBookType] = useState("clinic");
  const [bookReason, setBookReason] = useState("");

  useEffect(() => {
    // use reusable loader
    fetchAppointments();
    fetchPatients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t, locale]);

  async function fetchPatients() {
    setPatientsLoading(true);
    try {
      const res = await fetch("/api/doctor/patients");
      if (!res.ok) throw new Error("Failed to fetch patients");
      const data = await res.json();
      // patients returned as array of patient records
      const mapped = (data || []).map((p) => ({ id: p.id, fullName: p.fullName || p.user?.fullName || p.email, phone: p.phone || "" }));
      setPatients(mapped);
    } catch (err) {
      // ignore silently
      setPatients([]);
    } finally {
      setPatientsLoading(false);
    }
  }

  async function fetchAppointments() {
    setLoading(true);
    try {
      const res = await fetch("/api/doctor/appointments");
      if (!res.ok) throw new Error("Failed to fetch appointments");
      const data = await res.json();
      const mapped = (data.appointments || []).map((a) => ({
        id: a.id,
        patientName: a.patient?.name || "-",
        date: a.scheduledAt,
        time: a.scheduledAt ? new Date(a.scheduledAt).toLocaleTimeString(locale === "en" ? "en-US" : "ar-EG", { hour: "2-digit", minute: "2-digit" }) : "-",
        type: a.type || "clinic",
        status: a.status || "pending",
        phone: a.doctor?.phone || a.patient?.phone || "-",
        reason: a.reason || "-",
        patientReason: a.patientReason || "",
        location: a.type === "online" ? (a.location || "عن بعد") : (a.location || "العيادة")
      }));
      setAppointments(mapped);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  async function createAppointment(e) {
    e.preventDefault();
    if (!bookPatientId || !bookDate || !bookTime) {
      showToast(t("toast.fillRequired", { defaultValue: "Please fill required fields" }), "error");
      return;
    }
    const scheduledAt = new Date(`${bookDate}T${bookTime}`);
    try {
      const res = await fetch("/api/doctor/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ patientId: bookPatientId, scheduledAt: scheduledAt.toISOString(), type: bookType, reason: bookReason })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        showToast(err.error || t("toast.error", { defaultValue: "Failed to create appointment" }), "error");
        return;
      }
      showToast(t("toast.created", { defaultValue: "Appointment created" }), "success");
      setShowAddModal(false);
      setBookPatientId(""); setBookDate(""); setBookTime(""); setBookType("clinic"); setBookReason("");
      await fetchAppointments();
    } catch (err) {
      showToast(t("toast.error", { defaultValue: "Failed to create appointment" }), "error");
    }
  }

  const stats = {
    total: appointments.length,
    confirmed: appointments.filter((a) => a.status === "confirmed" || a.status === "completed").length,
    pending: appointments.filter((a) => a.status === "pending" || a.status === "scheduled" || !a.status).length,
    cancelled: appointments.filter((a) => a.status === "cancelled").length,
  };

  const filteredAppointments = appointments
    .filter((apt) => {
      if (filter === "all") return true;
      if (filter === "confirmed") return apt.status === "confirmed" || apt.status === "completed";
      return apt.status === filter;
    })
    .filter((apt) => {
      if (!searchQuery) return true;
      return (
        (apt.patientName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (apt.reason || "").toLowerCase().includes(searchQuery.toLowerCase())
      );
    });

  const handleConfirm = (id) => {
    setAppointments(
      appointments.map((apt) => (apt.id === id ? { ...apt, status: "confirmed" } : apt))
    );
          showToast(t("toast.confirm"), "success");
  };

  const handleCancel = (id) => {
    setAppointments(
      appointments.map((apt) => (apt.id === id ? { ...apt, status: "cancelled" } : apt))
    );
          showToast(t("toast.cancel"), "info");
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`/api/doctor/appointments/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        showToast(err.error || t("toast.error", { defaultValue: "Failed to delete appointment" }), "error");
        return;
      }
      setAppointments(appointments.filter((apt) => apt.id !== id));
      showToast(t("toast.delete"), "success");
    } catch (err) {
      showToast(t("toast.error", { defaultValue: "Failed to delete appointment" }), "error");
    }
  };

  const getStatusBadge = (status) => {
    let label, color;
    if (status === "confirmed" || status === "completed") {
      label = t("statuses.confirmed");
      color = "bg-green-100 text-green-700 border-green-200";
    } else if (status === "pending") {
      label = t("statuses.pending");
      color = "bg-orange-100 text-orange-700 border-orange-200";
    } else if (status === "cancelled") {
      label = t("statuses.cancelled");
      color = "bg-red-100 text-red-700 border-red-200";
    } else {
      label = t("statuses.pending");
      color = "bg-gray-100 text-gray-700 border-gray-200";
    }
    return (
      <span className={`rounded-full border px-3 py-1 text-xs font-medium ${color}`}>
        {label}
      </span>
    );
  };

  const getStatusIcon = (status) => {
    if (status === "confirmed" || status === "completed") return <FaCheckCircle className="text-green-600" />;
    if (status === "pending") return <FaHourglassHalf className="text-orange-600" />;
    return <FaTimesCircle className="text-red-600" />;
  };

  if (loading) {
    return (
      <DoctorLayout>
        <ToastContainer />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-lg text-gray-500">{t("loading", { defaultValue: "Loading appointments..." })}</div>
        </div>
      </DoctorLayout>
    );
  }

  if (error) {
    return (
      <DoctorLayout>
        <ToastContainer />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-lg text-red-500">{t("error", { defaultValue: "Error loading appointments:" })} {error}</div>
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
                <FaCalendarAlt className="text-blue-600" />
                      {t("title")}
              </h1>
                <p className="mt-2 text-gray-600">{t("subtitle")}</p>
            </div>

            <button
              onClick={() => {
                setShowAddModal(true);
                      showToast(t("toast.addSoon"), "info");
              }}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-all hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <FaPlus />
                    {t("addButton")}
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl bg-white p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                        <p className="text-sm text-gray-600">{t("stats.total")}</p>
                  <p className="mt-1 text-3xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <FaCalendarAlt className="text-3xl text-blue-600" />
              </div>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                        <p className="text-sm text-gray-600">{t("stats.confirmed")}</p>
                  <p className="mt-1 text-3xl font-bold text-green-600">{stats.confirmed}</p>
                </div>
                <FaCheckCircle className="text-3xl text-green-600" />
              </div>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                        <p className="text-sm text-gray-600">{t("stats.pending")}</p>
                  <p className="mt-1 text-3xl font-bold text-orange-600">{stats.pending}</p>
                </div>
                <FaHourglassHalf className="text-3xl text-orange-600" />
              </div>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                        <p className="text-sm text-gray-600">{t("stats.cancelled")}</p>
                  <p className="mt-1 text-3xl font-bold text-red-600">{stats.cancelled}</p>
                </div>
                <FaTimesCircle className="text-3xl text-red-600" />
              </div>
            </div>
          </div>

          {/* Filters and Search */}
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
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                        <option value="all">{t("filters.all")}</option>
                        <option value="confirmed">{t("filters.confirmed")}</option>
                        <option value="pending">{t("filters.pending")}</option>
                        <option value="cancelled">{t("filters.cancelled")}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Appointments List */}
          <div className="space-y-4">
            {filteredAppointments.length === 0 ? (
              <div className="rounded-xl bg-white p-12 text-center shadow-lg border border-gray-100">
                <FaCalendarAlt className="mx-auto mb-4 text-5xl text-gray-300" />
                      <p className="text-lg text-gray-600">{t("emptyState")}</p>
              </div>
            ) : (
              filteredAppointments.map((apt) => (
                <div
                  key={apt.id}
                  className="rounded-xl bg-white p-6 shadow-lg border border-gray-100 transition-all hover:shadow-xl"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    {/* Left Section */}
                    <div className="flex items-start gap-4">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-full ${
                          apt.status === "confirmed"
                            ? "bg-green-100"
                            : apt.status === "pending"
                            ? "bg-orange-100"
                            : "bg-red-100"
                        }`}
                      >
                        {getStatusIcon(apt.status)}
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-bold text-gray-900">{apt.patientName}</h3>
                          {getStatusBadge(apt.status)}
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <FaCalendarAlt className="text-blue-600" />
                            {new Date(apt.date).toLocaleDateString(locale === "en" ? "en-US" : "ar-EG", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </div>
                          <div className="flex items-center gap-2">
                            <FaClock className="text-purple-600" />
                            {apt.time}
                          </div>
                          <div className="flex items-center gap-2">
                            {apt.type === "online" ? (
                              <FaVideo className="text-green-600" />
                            ) : (
                              <FaMapMarkerAlt className="text-red-600" />
                            )}
                            {apt.location}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <FaPhone className="text-blue-600" />
                          {apt.phone}
                        </div>

                        <p className="text-sm text-gray-700">
                          <span className="font-bold">{t("reasonLabel")}</span> {apt.reason}
                        </p>
                        {apt.status === "cancelled" && apt.patientReason && (
                          <p className="text-sm text-red-700 mt-1">
                            <span className="font-bold">{t("cancelReasonLabel", { defaultValue: "سبب الإلغاء:" })}</span> {apt.patientReason}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right Section - Actions */}
                    <div className="flex gap-2">
                      {apt.status === "pending" && (
                        <button
                          onClick={() => handleConfirm(apt.id)}
                          className="flex items-center gap-2 rounded-lg bg-green-900 px-4 py-2 text-sm font-bold text-white transition-all hover:bg-green-700"
                        >
                          <FaCheckCircle />
                                {t("actions.confirm")}
                        </button>
                      )}
                      {apt.status !== "cancelled" && (
                        <button
                          onClick={() => handleCancel(apt.id)}
                          className="flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-bold text-white transition-all hover:bg-orange-700"
                        >
                          <FaTimesCircle />
                                {t("actions.cancel")}
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(apt.id)}
                        className="flex items-center gap-2 rounded-lg bg-red-900 px-4 py-2 text-sm font-bold text-white transition-all hover:bg-red-700"
                      >
                        <FaTrash />
                              {t("actions.delete")}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <form onSubmit={createAppointment} className="bg-white dark:bg-slate-800 p-6 rounded-lg w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">{t("addButton", { defaultValue: "Add New Appointment" })}</h3>

            <label className="block mb-2 text-sm">{t("patient", { defaultValue: "Patient" })}</label>
            <input
              placeholder={t("searchPlaceholder", { defaultValue: "Search by patient name..." })}
              value={patientSearch}
              onChange={(e) => setPatientSearch(e.target.value)}
              className="w-full p-2 border rounded mb-2"
            />
            <select
              value={bookPatientId}
              onChange={(e) => setBookPatientId(e.target.value)}
              className="w-full p-2 border rounded mb-3"
            >
              <option value="">{patientsLoading ? t("loading", { defaultValue: "Loading..." }) : t("patient", { defaultValue: "Select patient" })}</option>
              {patients
                .filter((p) => (patientSearch ? p.fullName.toLowerCase().includes(patientSearch.toLowerCase()) : true))
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.fullName} {p.phone ? ` - ${p.phone}` : ""}
                  </option>
                ))}
            </select>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block mb-2 text-sm">{t("date", { defaultValue: "Date" })}</label>
                <input type="date" value={bookDate} onChange={(e) => setBookDate(e.target.value)} className="w-full p-2 border rounded" />
              </div>
              <div>
                <label className="block mb-2 text-sm">{t("time", { defaultValue: "Time" })}</label>
                <input type="time" value={bookTime} onChange={(e) => setBookTime(e.target.value)} className="w-full p-2 border rounded" />
              </div>
            </div>

            <label className="block mb-2 text-sm">{t("types.clinic", { defaultValue: "Type" })}</label>
            <select value={bookType} onChange={(e) => setBookType(e.target.value)} className="w-full p-2 border rounded mb-3">
              <option value="clinic">{t("types.clinic", { defaultValue: "Clinic" })}</option>
              <option value="online">{t("types.online", { defaultValue: "Online" })}</option>
            </select>

            <label className="block mb-2 text-sm">{t("reasonLabel", { defaultValue: "Reason:" })}</label>
            <input value={bookReason} onChange={(e) => setBookReason(e.target.value)} className="w-full p-2 border rounded mb-3" />

            {/* phone removed from booking form */}

            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 rounded border">{t("actions.cancel", { defaultValue: "Cancel" })}</button>
              <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white">{t("appointments.form.submit", { defaultValue: "Book" })}</button>
            </div>
          </form>
        </div>
      )}

    </DoctorLayout>
  );
}

// Modal form was added above inside the component return; ensure it's included here
