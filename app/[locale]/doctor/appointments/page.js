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

  const appointmentTemplates = useMemo(
    () => [
      {
        id: 1,
        patientName: t("items.0.patientName"),
        date: t("items.0.date"),
        time: t("appointments.1.time"),
        type: t("appointments.1.type"),
        status: t("appointments.1.status"),
        phone: t("appointments.1.phone"),
        reason: t("appointments.1.reason")
      },
      {
        id: 2,
        patientName: t("appointments.2.patientName"),
        date: t("appointments.2.date"),
        time: t("appointments.2.time"),
        type: t("appointments.2.type"),
        status: t("appointments.2.status"),
        phone: t("appointments.2.phone"),
        reason: t("appointments.2.reason")
      },
      {
        id: 3,
        patientName: t("appointments.3.patientName"),
        date: t("appointments.3.date"),
        time: t("appointments.3.time"),
        type: t("appointments.3.type"),
        status: t("appointments.3.status"),
        phone: t("appointments.3.phone"),
        reason: t("appointments.3.reason")
      },
      {
        id: 4,
        patientName: t("appointments.4.patientName"),
        date: t("appointments.4.date"),
        time: t("appointments.4.time"),
        type: t("appointments.4.type"),
        status: t("appointments.4.status"),
        phone: t("appointments.4.phone"),
        reason: t("appointments.4.reason")
      },
      {
        id: 5,
        patientName: t("appointments.5.patientName"),
        date: t("appointments.5.date"),
        time: t("appointments.5.time"),
        type: t("appointments.5.type"),
        status: t("appointments.5.status"),
        phone: t("appointments.5.phone"),
        reason: t("appointments.5.reason")
      },
      {
        id: 6,
        patientName: t("appointments.6.patientName"),
        date: t("appointments.6.date"),
        time: t("appointments.6.time"),
        type: t("appointments.6.type"),
        status: t("appointments.6.status"),
        phone: t("appointments.6.phone"),
        reason: t("appointments.6.reason")
      }
    ],
    [t]
  );

  const [appointments, setAppointments] = useState(appointmentTemplates);

  useEffect(() => {
    setAppointments(appointmentTemplates);
  }, [appointmentTemplates]);

  const stats = {
    total: appointments.length,
    confirmed: appointments.filter((a) => a.status === "confirmed").length,
    pending: appointments.filter((a) => a.status === "pending").length,
    cancelled: appointments.filter((a) => a.status === "cancelled").length,
  };

  const filteredAppointments = appointments
    .filter((apt) => {
      if (filter === "all") return true;
      return apt.status === filter;
    })
    .filter((apt) => {
      if (!searchQuery) return true;
      return (
        apt.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        apt.reason.toLowerCase().includes(searchQuery.toLowerCase())
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

  const handleDelete = (id) => {
    setAppointments(appointments.filter((apt) => apt.id !== id));
          showToast(t("toast.delete"), "success");
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
            confirmed: { label: t("statuses.confirmed"), color: "bg-green-100 text-green-700 border-green-200" },
            pending: { label: t("statuses.pending"), color: "bg-orange-100 text-orange-700 border-orange-200" },
            cancelled: { label: t("statuses.cancelled"), color: "bg-red-100 text-red-700 border-red-200" },
    };
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`rounded-full border px-3 py-1 text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getStatusIcon = (status) => {
    if (status === "confirmed") return <FaCheckCircle className="text-green-600" />;
    if (status === "pending") return <FaHourglassHalf className="text-orange-600" />;
    return <FaTimesCircle className="text-red-600" />;
  };

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
                                  {apt.type === "online" ? t("types.online") : t("types.clinic")}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <FaPhone className="text-blue-600" />
                          {apt.phone}
                        </div>

                        <p className="text-sm text-gray-700">
                          <span className="font-medium">{t("reasonLabel")}</span> {apt.reason}
                        </p>
                      </div>
                    </div>

                    {/* Right Section - Actions */}
                    <div className="flex gap-2">
                      {apt.status === "pending" && (
                        <button
                          onClick={() => handleConfirm(apt.id)}
                          className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-green-700"
                        >
                          <FaCheckCircle />
                                {t("actions.confirm")}
                        </button>
                      )}
                      {apt.status !== "cancelled" && (
                        <button
                          onClick={() => handleCancel(apt.id)}
                          className="flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-orange-700"
                        >
                          <FaTimesCircle />
                                {t("actions.cancel")}
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(apt.id)}
                        className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-red-700"
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
    </DoctorLayout>
  );
}
