"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "../../../components/ui/Toast";
import {
  FaCalendarAlt,
  FaVideo,
  FaMapMarkerAlt,
  FaClock,
  FaUserMd,
  FaSearch,
  FaFilter,
  FaPlus,
  FaPhone,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf
} from "react-icons/fa";
import { useTranslations, useLocale } from "next-intl";

export default function PatientAppointmentsPage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("patient");
  const { showToast, ToastContainer } = useToast();

  const basePrefix = locale === "en" ? "/en" : "/ar";

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [showBookModal, setShowBookModal] = useState(false);

  /* ===================== DATA ===================== */
  const appointments = useMemo(
    () => [
      {
        id: 1,
        doctorName: "Dr. Smith",
        specialty: "Cardiology",
        date: "2025-12-19",
        time: "10:00",
        type: "clinic",
        status: "confirmed",
        location: "Clinic A",
        phone: "123-456-7890",
        reason: "Routine checkup"
      },
      {
        id: 2,
        doctorName: "Dr. John Doe",
        specialty: "Dermatology",
        date: "2025-12-20",
        time: "14:00",
        type: "online",
        status: "pending",
        phone: "987-654-3210",
        reason: "Skin rash"
      }
    ],
    []
  );

  /* ===================== FILTERING ===================== */
  const filteredAppointments = appointments.filter((a) => {
    const matchesSearch =
      a.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.reason.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = filterStatus === "all" || a.status === filterStatus;
    const matchesType = filterType === "all" || a.type === filterType;

    return matchesSearch && matchesStatus && matchesType;
  });

  const upcoming = filteredAppointments.filter(
    (a) => new Date(a.date) >= new Date() && a.status !== "cancelled"
  );

  const past = filteredAppointments.filter(
    (a) => new Date(a.date) < new Date() || a.status === "cancelled"
  );

  /* ===================== HELPERS ===================== */
  const statusClass = (status) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-700";
      case "pending":
        return "bg-orange-100 text-orange-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  /* ===================== ACTIONS ===================== */
  const confirmAppointment = () =>
    showToast(t("appointments.toast.confirm"), "success");

  const cancelAppointment = () =>
    showToast(t("appointments.toast.cancel"), "info");

  /* ===================== RENDER ===================== */
  return (
    <>
      <ToastContainer />

      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 p-6">
        {/* Header */}
        <div className="flex justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">{t("appointments.title")}</h1>
            <p className="text-gray-500">{t("appointments.subtitle")}</p>
          </div>

          <button
            onClick={() => setShowBookModal(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center gap-2"
          >
            <FaPlus /> {t("appointments.new")}
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="relative">
            <FaSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("appointments.search")}
              className="w-full pr-10 p-3 rounded-lg border"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="p-3 rounded-lg border"
          >
            <option value="all">{t("appointments.status.all")}</option>
            <option value="confirmed">{t("appointments.status.confirmed")}</option>
            <option value="pending">{t("appointments.status.pending")}</option>
            <option value="cancelled">{t("appointments.status.cancelled")}</option>
          </select>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="p-3 rounded-lg border"
          >
            <option value="all">{t("appointments.type.all")}</option>
            <option value="clinic">{t("appointments.type.clinic")}</option>
            <option value="online">{t("appointments.type.online")}</option>
          </select>
        </div>

        {/* Upcoming */}
        <h2 className="text-2xl font-bold mb-4">{t("appointments.upcoming")}</h2>

        {upcoming.length === 0 ? (
          <p className="text-gray-500">{t("appointments.noUpcoming")}</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {upcoming.map((a) => (
              <div key={a.id} className="bg-white p-6 rounded-xl shadow">
                <div className="flex justify-between mb-4">
                  <div>
                    <h3 className="font-bold">{a.doctorName}</h3>
                    <p className="text-sm text-gray-500">{a.specialty}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs ${statusClass(a.status)}`}>
                    {t(`appointments.status.${a.status}`)}
                  </span>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  <div><FaCalendarAlt /> {a.date}</div>
                  <div><FaClock /> {a.time}</div>
                  {a.type === "clinic" && <div><FaMapMarkerAlt /> {a.location}</div>}
                  {a.type === "online" && <div><FaVideo /> {t("appointments.online")}</div>}
                  <div><FaPhone /> {a.phone}</div>
                </div>

                <div className="flex gap-2 mt-4">
                  {a.status === "pending" && (
                    <button onClick={confirmAppointment} className="bg-green-600 text-white px-4 py-2 rounded">
                      {t("appointments.actions.confirm")}
                    </button>
                  )}
                  <button onClick={cancelAppointment} className="bg-red-600 text-white px-4 py-2 rounded">
                    {t("appointments.actions.cancel")}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
