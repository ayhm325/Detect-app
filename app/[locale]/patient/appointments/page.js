"use client";

import { useState, useEffect } from "react";
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
  const [appointments, setAppointments] = useState([]);

  // booking form state
  const [bookDoctorId, setBookDoctorId] = useState("");
  const [bookDate, setBookDate] = useState("");
  const [bookTime, setBookTime] = useState("");
  const [bookType, setBookType] = useState("clinic");
  const [bookReason, setBookReason] = useState("");
  const [bookPhone, setBookPhone] = useState("");

  async function loadAppointments() {
    try {
      const res = await fetch("/api/patient/appointments", { cache: "no-store", credentials: "same-origin" });
      if (!res.ok) {
        setAppointments([]);
        return;
      }
      const json = await res.json();
      const list = Array.isArray(json) ? json : json.appointments || [];
      setAppointments(list);
    } catch (e) {
      setAppointments([]);
    }
  }

  useEffect(() => {
    let mounted = true;
    // schedule load in microtask to avoid synchronous setState inside effect
    Promise.resolve().then(async () => {
      if (!mounted) return;
      await loadAppointments();
    });
    return () => {
      mounted = false;
    };
  }, []);

  async function createAppointment(e) {
    e.preventDefault();
    if (!bookDoctorId || !bookDate || !bookTime) {
      showToast(t("appointments.toast.fillRequired"), "error");
      return;
    }
    const scheduledAt = new Date(`${bookDate}T${bookTime}`);
    try {
      const res = await fetch("/api/patient/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ doctorId: bookDoctorId, scheduledAt: scheduledAt.toISOString(), type: bookType, reason: bookReason, phone: bookPhone })
      });
      if (!res.ok) {
        const err = await res.text();
        showToast(err || t("appointments.toast.error"), "error");
        return;
      }
      showToast(t("appointments.toast.created"), "success");
      setShowBookModal(false);
      setBookDoctorId(""); setBookDate(""); setBookTime(""); setBookType("clinic"); setBookReason(""); setBookPhone("");
      await loadAppointments();
    } catch (err) {
      showToast(t("appointments.toast.error"), "error");
    }
  }

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
      
      {showBookModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <form onSubmit={createAppointment} className="bg-white dark:bg-slate-800 p-6 rounded-lg w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">{t("appointments.new")}</h3>

            <label className="block mb-2 text-sm">{t("appointments.form.doctorId")}</label>
            <input value={bookDoctorId} onChange={(e) => setBookDoctorId(e.target.value)} className="w-full p-2 border rounded mb-3" />

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block mb-2 text-sm">{t("appointments.form.date")}</label>
                <input type="date" value={bookDate} onChange={(e) => setBookDate(e.target.value)} className="w-full p-2 border rounded" />
              </div>
              <div>
                <label className="block mb-2 text-sm">{t("appointments.form.time")}</label>
                <input type="time" value={bookTime} onChange={(e) => setBookTime(e.target.value)} className="w-full p-2 border rounded" />
              </div>
            </div>

            <label className="block mb-2 text-sm">{t("appointments.form.type")}</label>
            <select value={bookType} onChange={(e) => setBookType(e.target.value)} className="w-full p-2 border rounded mb-3">
              <option value="clinic">{t("appointments.type.clinic")}</option>
              <option value="online">{t("appointments.type.online")}</option>
            </select>

            <label className="block mb-2 text-sm">{t("appointments.form.reason")}</label>
            <input value={bookReason} onChange={(e) => setBookReason(e.target.value)} className="w-full p-2 border rounded mb-3" />

            <label className="block mb-2 text-sm">{t("appointments.form.phone")}</label>
            <input value={bookPhone} onChange={(e) => setBookPhone(e.target.value)} className="w-full p-2 border rounded mb-3" />

            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setShowBookModal(false)} className="px-4 py-2 rounded border">{t("appointments.form.cancel")}</button>
              <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white">{t("appointments.form.submit")}</button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
