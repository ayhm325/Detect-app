"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "../../../components/ui/Toast";
import {
  FaCalendarAlt,
  FaVideo,
  FaMapMarkerAlt,
  FaClock,
  FaUserMd,
  FaPhone,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf
} from "react-icons/fa";
import { useTranslations, useLocale } from "next-intl";
import toLatin from "./toLatin";

export default function PatientAppointmentsPage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("patient");
  const { showToast, ToastContainer } = useToast();

  const basePrefix = locale === "en" ? "/en" : "/ar";

  
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
  const [bookLocation, setBookLocation] = useState("");

  const loadAppointments = useCallback(async () => {
    try {
      const res = await fetch("/api/patient/appointments", { cache: "no-store", credentials: "same-origin" });
      if (!res.ok) {
        setAppointments([]);
        return;
      }
      const json = await res.json();
      const list = Array.isArray(json) ? json : json.appointments || [];
      // Normalize API shape to the UI shape expected by this page
      const mapped = (list || []).map((a) => {
        const scheduled = a.scheduledAt ? new Date(a.scheduledAt) : null;
        const dateStr = scheduled
          ? scheduled.toLocaleDateString(locale === "en" ? "en-US" : "ar-EG", { weekday: "long", year: "numeric", month: "long", day: "numeric" })
          : "";
        const timeStr = scheduled
          ? scheduled.toLocaleTimeString(locale === "en" ? "en-US" : "ar-EG", { hour: "2-digit", minute: "2-digit" })
          : "";
        return {
          id: a.id,
          doctorName: typeof a.doctor === "string" ? a.doctor : (a.doctor?.name || a.doctorName || (a.doctor?.user?.fullName) || ""),
          specialty: a.specialty || (a.doctor?.specialty) || "",
          date: dateStr,
          time: timeStr,
          type: a.type || a.raw?.type || "clinic",
          location: a.location || "",
          phone: (typeof a.doctor === "object" && a.doctor ? a.doctor.phone || (a.doctor.user && a.doctor.user.phone) : null) || a.phone || "",
          reason: a.reason || "",
          status: a.status || "scheduled",
          raw: a
        };
      });
      setAppointments(mapped);
    } catch (e) {
      setAppointments([]);
    }
  }, [locale]);

  useEffect(() => {
    let mounted = true;
    Promise.resolve().then(async () => {
      if (!mounted) return;
      await loadAppointments();
    });
    return () => {
      mounted = false;
    };
  }, [loadAppointments]);

  async function createAppointment(e) {
    e.preventDefault();
    if (!bookDoctorId || !bookDate || !bookTime || !bookReason || !bookLocation) {
      showToast(t("appointments.toast.fillRequired"), "error");
      return;
    }
    const scheduledAt = new Date(`${bookDate}T${bookTime}`);
    try {
      const res = await fetch("/api/patient/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ doctorId: bookDoctorId, scheduledAt: scheduledAt.toISOString(), type: bookType, reason: bookReason, phone: bookPhone, location: bookLocation })
      });
      if (!res.ok) {
        const err = await res.text();
        showToast(err || t("appointments.toast.error"), "error");
        return;
      }
      showToast(t("appointments.toast.created"), "success");
      setShowBookModal(false);
      setBookDoctorId(""); setBookDate(""); setBookTime(""); setBookType("clinic"); setBookReason(""); setBookPhone(""); setBookLocation("");
      await loadAppointments();
    } catch (err) {
      showToast(t("appointments.toast.error"), "error");
    }
  }

  /* ===================== GROUPING ===================== */
  const upcoming = appointments.filter(
    (a) => new Date(a.raw?.scheduledAt || a.date) >= new Date() && a.status !== "cancelled"
  );

  const past = appointments.filter(
    (a) => new Date(a.raw?.scheduledAt || a.date) < new Date() || a.status === "cancelled"
  );
  const statusClass = (status) => {
    switch (status) {
      case "confirmed":
      case "completed":
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
  const confirmAppointment = async (id) => {
    try {
      const res = await fetch(`/api/patient/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ action: "confirm" })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        showToast(err.error || t("appointments.toast.error"), "error");
        return;
      }
      showToast(t("appointments.toast.confirm"), "success");
      await loadAppointments();
    } catch (e) {
      showToast(t("appointments.toast.error"), "error");
    }
  };

  // نافذة سبب الإلغاء
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelId, setCancelId] = useState(null);

  const openCancelModal = (id) => {
    setCancelId(id);
    setCancelReason("");
    setShowCancelModal(true);
  };

  const handleCancelSubmit = async (e) => {
    e.preventDefault();
    if (!cancelReason) {
      showToast(t("appointments.form.cancelReasonRequired") || "يرجى إدخال سبب الإلغاء", "error");
      return;
    }
    try {
      const res = await fetch(`/api/patient/appointments/${cancelId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ action: "cancel", patientReason: cancelReason })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        showToast(err.error || t("appointments.toast.error"), "error");
        return;
      }
      showToast(t("appointments.toast.cancel"), "info");
      setShowCancelModal(false);
      setCancelId(null);
      setCancelReason("");
      await loadAppointments();
    } catch (e) {
      showToast(t("appointments.toast.error"), "error");
    }
  };

  const deleteAppointment = async (id) => {
    try {
      const res = await fetch(`/api/patient/appointments/${id}`, {
        method: "DELETE",
        credentials: "same-origin"
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        showToast(err.error || t("appointments.toast.error"), "error");
        return;
      }
      showToast(t("appointments.toast.cancel"), "info");
      await loadAppointments();
    } catch (e) {
      showToast(t("appointments.toast.error"), "error");
    }
  };



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
        </div>

      

        {/* Upcoming */}
        <h2 className="text-2xl font-bold mb-4">{t("appointments.upcoming")}</h2>
        {upcoming.length === 0 ? (
          <p className="text-gray-500">{t("appointments.noUpcoming")}</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {upcoming.map((a) => (
              <div key={a.id} className="bg-white p-7 rounded-2xl shadow-lg flex flex-col gap-4 border border-gray-200">
                <div className="flex justify-between items-center mb-2">
                  <span className={`px-4 py-1 rounded-full text-base font-bold tracking-wide ${statusClass(a.status)}`}>{t(`appointments.status.${a.status}`)}</span>
                  <div className="flex flex-col items-end">
                    <span className="font-extrabold text-2xl text-gray-900">{a.doctorName}</span>
                    <span className="text-sm text-gray-500 font-medium">{a.specialty}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-6 text-lg text-gray-800 items-center mb-2">
                  <div className="flex items-center gap-2"><FaCalendarAlt className="text-blue-500 text-xl" /> <span className="font-bold">{toLatin(a.date)}</span></div>
                  <div className="flex items-center gap-2"><FaClock className="text-purple-500 text-xl" /> <span className="font-bold">{toLatin(a.time)}</span></div>
                  <div className="flex items-center gap-2"><FaMapMarkerAlt className="text-red-500 text-xl" />
                    <span className="font-bold">
                      {a.type === "online"
                        ? t("appointments.type.online")
                        : (a.location && a.location !== "عن بعد")
                          ? a.location
                          : t("appointments.type.clinic")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2"><FaPhone className="text-blue-600 text-xl" /> <span className="font-mono text-lg">{toLatin(a.phone)}</span></div>                 
                </div>
                {a.reason && (
                  <div className="text-base text-gray-900 mt-1"><span className="font-bold">{t("appointments.form.reason")}</span>: <span className="font-bold">{a.reason}</span></div>
                )}
                <div className="flex gap-3 mt-6">
                  {(a.status === "confirmed" || a.status === "completed") ? (
                    <span className="bg-green-100 text-green-700 px-6 py-2 rounded-lg flex items-center gap-2 text-lg font-bold shadow-sm transition">
                      <FaCheckCircle /> {t("appointments.status.confirmed")}
                    </span>
                  ) : a.status === "cancelled" ? (
                    <span className="bg-red-100 text-red-700 px-6 py-2 rounded-lg flex items-center gap-2 text-lg font-bold shadow-sm transition">
                      <FaTimesCircle /> {t("appointments.status.cancelled")} {a.raw?.patientReason && (
                        <span className="ml-2 text-base font-normal">- {a.raw.patientReason}</span>
                      )}
                    </span>
                  ) : (
                    <>
                      <button onClick={() => confirmAppointment(a.id)} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 text-lg font-bold shadow-sm transition">
                        <FaCheckCircle /> موافقة
                      </button>
                      <button onClick={() => openCancelModal(a.id)} className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 text-lg font-bold shadow-sm transition">
                        <FaTimesCircle /> إلغاء
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Past/Cancelled */}
        <h2 className="text-2xl font-bold mt-10 mb-4">{t("appointments.pastOrCancelled", { defaultValue: "المواعيد السابقة / الملغاة" })}</h2>
        {past.length === 0 ? (
          <p className="text-gray-500">{t("appointments.noPastOrCancelled", { defaultValue: "لا يوجد مواعيد سابقة أو ملغاة" })}</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {past.map((a) => (
              <div key={a.id} className="bg-white p-7 rounded-2xl shadow-lg flex flex-col gap-4 border border-gray-200 opacity-80">
                <div className="flex justify-between items-center mb-2">
                  <span className={`px-4 py-1 rounded-full text-base font-bold tracking-wide ${statusClass(a.status)}`}>{t(`appointments.status.${a.status}`)}</span>
                  <div className="flex flex-col items-end">
                    <span className="font-extrabold text-2xl text-gray-900">{a.doctorName}</span>
                    <span className="text-sm text-gray-500 font-medium">{a.specialty}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-6 text-lg text-gray-800 items-center mb-2">
                  <div className="flex items-center gap-2"><FaCalendarAlt className="text-blue-500 text-xl" /> <span className="font-bold">{toLatin(a.date)}</span></div>
                  <div className="flex items-center gap-2"><FaClock className="text-purple-500 text-xl" /> <span className="font-bold">{toLatin(a.time)}</span></div>
                  <div className="flex items-center gap-2"><FaMapMarkerAlt className="text-red-500 text-xl" />
                    <span className="font-bold">
                      {a.type === "online"
                        ? t("appointments.type.online")
                        : (a.location && a.location !== "عن بعد")
                          ? a.location
                          : t("appointments.type.clinic")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2"><FaPhone className="text-blue-600 text-xl" /> <span className="font-mono text-lg">{toLatin(a.phone)}</span></div>                 
                </div>
                {a.reason && (
                  <div className="text-base text-gray-900 mt-1"><span className="font-bold">{t("appointments.form.reason")}</span>: <span className="font-bold">{a.reason}</span></div>
                )}
                {a.status === "cancelled" && a.raw?.patientReason && (
                  <div className="text-base text-red-700 mt-1"><span className="font-bold">{t("appointments.form.cancelReasonLabel")}</span>: {a.raw.patientReason}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* نافذة سبب الإلغاء */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <form onSubmit={handleCancelSubmit} className="bg-white dark:bg-slate-800 p-6 rounded-lg w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">{t("appointments.form.cancelReasonTitle") || "سبب الإلغاء"}</h3>
            <label className="block mb-2 text-sm">{t("appointments.form.cancelReasonLabel") || "يرجى كتابة سبب الإلغاء"}</label>
            <textarea value={cancelReason} onChange={e => setCancelReason(e.target.value)} className="w-full p-2 border rounded mb-3" required rows={3} />
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setShowCancelModal(false)} className="px-4 py-2 rounded border">{t("appointments.form.cancel")}</button>
              <button type="submit" className="px-4 py-2 rounded bg-orange-600 text-white">{t("appointments.form.submit")}</button>
            </div>
          </form>
        </div>
      )}

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
            <input value={bookReason} onChange={(e) => setBookReason(e.target.value)} className="w-full p-2 border rounded mb-3" required />

            <label className="block mb-2 text-sm">{t("appointments.form.location") || "الموقع"}</label>
            <input value={bookLocation} onChange={(e) => setBookLocation(e.target.value)} className="w-full p-2 border rounded mb-3" required />

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
