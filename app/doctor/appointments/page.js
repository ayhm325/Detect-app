"use client";

import DoctorLayout from "../DoctorLayout";
import { useToast } from "@/app/components/ui/Toast";
import { useState } from "react";
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

export default function DoctorAppointmentsPage() {
  const { showToast, ToastContainer } = useToast();
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("list"); // list or calendar
  const [showAddModal, setShowAddModal] = useState(false);

  const [appointments, setAppointments] = useState([
    {
      id: 1,
      patientName: "محمد أحمد",
      date: "2025-12-04",
      time: "09:00",
      type: "عيادة",
      status: "confirmed",
      phone: "+966 50 123 4567",
      reason: "فحص أشعة الصدر",
    },
    {
      id: 2,
      patientName: "فاطمة علي",
      date: "2025-12-04",
      time: "10:30",
      type: "أونلاين",
      status: "confirmed",
      phone: "+966 55 234 5678",
      reason: "استشارة طبية",
    },
    {
      id: 3,
      patientName: "أحمد خالد",
      date: "2025-12-04",
      time: "11:00",
      type: "عيادة",
      status: "pending",
      phone: "+966 54 345 6789",
      reason: "متابعة نتائج MRI",
    },
    {
      id: 4,
      patientName: "سارة محمود",
      date: "2025-12-04",
      time: "14:00",
      type: "عيادة",
      status: "confirmed",
      phone: "+966 56 456 7890",
      reason: "فحص CT Scan",
    },
    {
      id: 5,
      patientName: "عمر حسن",
      date: "2025-12-05",
      time: "09:30",
      type: "أونلاين",
      status: "pending",
      phone: "+966 53 567 8901",
      reason: "استشارة عن نتائج الأشعة",
    },
    {
      id: 6,
      patientName: "ليلى يوسف",
      date: "2025-12-05",
      time: "13:00",
      type: "عيادة",
      status: "cancelled",
      phone: "+966 52 678 9012",
      reason: "فحص أشعة الكتف",
    },
  ]);

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
    showToast("تم تأكيد الموعد بنجاح", "success");
  };

  const handleCancel = (id) => {
    setAppointments(
      appointments.map((apt) => (apt.id === id ? { ...apt, status: "cancelled" } : apt))
    );
    showToast("تم إلغاء الموعد", "info");
  };

  const handleDelete = (id) => {
    setAppointments(appointments.filter((apt) => apt.id !== id));
    showToast("تم حذف الموعد", "success");
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      confirmed: { label: "مؤكد", color: "bg-green-100 text-green-700 border-green-200" },
      pending: { label: "قيد الانتظار", color: "bg-orange-100 text-orange-700 border-orange-200" },
      cancelled: { label: "ملغي", color: "bg-red-100 text-red-700 border-red-200" },
    };
    const config = statusConfig[status];
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
                المواعيد
              </h1>
              <p className="mt-2 text-gray-600">إدارة وجدولة المواعيد الطبية</p>
            </div>

            <button
              onClick={() => {
                setShowAddModal(true);
                showToast("ميزة إضافة موعد جديد قريباً", "info");
              }}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-all hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <FaPlus />
              موعد جديد
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl bg-white p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">الإجمالي</p>
                  <p className="mt-1 text-3xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <FaCalendarAlt className="text-3xl text-blue-600" />
              </div>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">مؤكد</p>
                  <p className="mt-1 text-3xl font-bold text-green-600">{stats.confirmed}</p>
                </div>
                <FaCheckCircle className="text-3xl text-green-600" />
              </div>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">قيد الانتظار</p>
                  <p className="mt-1 text-3xl font-bold text-orange-600">{stats.pending}</p>
                </div>
                <FaHourglassHalf className="text-3xl text-orange-600" />
              </div>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">ملغي</p>
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
              <div className="flex-1 min-w-[250px]">
                <div className="relative">
                  <FaSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="ابحث عن مريض أو سبب الزيارة..."
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
                  <option value="all">جميع المواعيد</option>
                  <option value="confirmed">مؤكد</option>
                  <option value="pending">قيد الانتظار</option>
                  <option value="cancelled">ملغي</option>
                </select>
              </div>
            </div>
          </div>

          {/* Appointments List */}
          <div className="space-y-4">
            {filteredAppointments.length === 0 ? (
              <div className="rounded-xl bg-white p-12 text-center shadow-lg border border-gray-100">
                <FaCalendarAlt className="mx-auto mb-4 text-5xl text-gray-300" />
                <p className="text-lg text-gray-600">لا توجد مواعيد</p>
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
                            {new Date(apt.date).toLocaleDateString("ar-EG", {
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
                            {apt.type === "أونلاين" ? (
                              <FaVideo className="text-green-600" />
                            ) : (
                              <FaMapMarkerAlt className="text-red-600" />
                            )}
                            {apt.type}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <FaPhone className="text-blue-600" />
                          {apt.phone}
                        </div>

                        <p className="text-sm text-gray-700">
                          <span className="font-medium">السبب:</span> {apt.reason}
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
                          تأكيد
                        </button>
                      )}
                      {apt.status !== "cancelled" && (
                        <button
                          onClick={() => handleCancel(apt.id)}
                          className="flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-orange-700"
                        >
                          <FaTimesCircle />
                          إلغاء
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(apt.id)}
                        className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-red-700"
                      >
                        <FaTrash />
                        حذف
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
