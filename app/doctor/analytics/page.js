"use client";

import DoctorLayout from "../DoctorLayout";
import { useToast } from "@/app/components/ui/Toast";
import { useState } from "react";
import {
  FaUserInjured,
  FaXRay,
  FaCheckCircle,
  FaClock,
  FaChartLine,
  FaCalendarAlt,
  FaArrowUp,
  FaArrowDown,
  FaDownload,
  FaFilter,
  FaEye,
} from "react-icons/fa";

export default function DoctorAnalyticsPage() {
  const { showToast, ToastContainer } = useToast();
  const [timeRange, setTimeRange] = useState("week");
  const [selectedMetric, setSelectedMetric] = useState("patients");

  // Statistics Data
  const stats = {
    week: {
      patients: { current: 45, previous: 38, percentage: 18.4 },
      scans: { current: 62, previous: 55, percentage: 12.7 },
      completed: { current: 58, previous: 48, percentage: 20.8 },
      pending: { current: 4, previous: 7, percentage: -42.9 },
    },
    month: {
      patients: { current: 180, previous: 165, percentage: 9.1 },
      scans: { current: 245, previous: 220, percentage: 11.4 },
      completed: { current: 238, previous: 210, percentage: 13.3 },
      pending: { current: 7, previous: 10, percentage: -30.0 },
    },
    year: {
      patients: { current: 2160, previous: 1980, percentage: 9.1 },
      scans: { current: 2940, previous: 2640, percentage: 11.4 },
      completed: { current: 2856, previous: 2520, percentage: 13.3 },
      pending: { current: 84, previous: 120, percentage: -30.0 },
    },
  };

  const currentStats = stats[timeRange];

  // Chart Data - Patient Distribution by Day
  const patientChartData = [
    { day: "السبت", value: 8, color: "bg-blue-500" },
    { day: "الأحد", value: 12, color: "bg-blue-500" },
    { day: "الإثنين", value: 6, color: "bg-blue-500" },
    { day: "الثلاثاء", value: 9, color: "bg-blue-500" },
    { day: "الأربعاء", value: 7, color: "bg-blue-500" },
    { day: "الخميس", value: 3, color: "bg-blue-500" },
    { day: "الجمعة", value: 0, color: "bg-gray-300" },
  ];

  const maxValue = Math.max(...patientChartData.map((d) => d.value));

  // Scan Types Distribution
  const scanTypes = [
    { type: "أشعة سينية", count: 28, percentage: 45, color: "bg-blue-500" },
    { type: "CT Scan", count: 18, percentage: 29, color: "bg-purple-500" },
    { type: "MRI", count: 12, percentage: 19, color: "bg-green-500" },
    { type: "أخرى", count: 4, percentage: 7, color: "bg-gray-400" },
  ];

  // Recent Activity
  const recentActivity = [
    { action: "تم فحص صورة أشعة", patient: "محمد علي", time: "منذ 5 دقائق", status: "completed" },
    { action: "موعد جديد", patient: "فاطمة أحمد", time: "منذ 15 دقيقة", status: "scheduled" },
    { action: "تقرير جاهز", patient: "أحمد حسن", time: "منذ 30 دقيقة", status: "completed" },
    { action: "في انتظار المراجعة", patient: "سارة محمود", time: "منذ ساعة", status: "pending" },
    { action: "تم إرسال التقرير", patient: "عمر خالد", time: "منذ ساعتين", status: "sent" },
  ];

  const handleExport = () => {
    showToast("جاري تصدير التقرير...", "info");
    setTimeout(() => {
      showToast("تم تصدير التقرير بنجاح", "success");
    }, 1500);
  };

  return (
    <DoctorLayout>
      <ToastContainer />
      <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-blue-50 p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <FaChartLine className="text-blue-600" />
                التحليلات والإحصائيات
              </h1>
              <p className="mt-2 text-gray-600">نظرة شاملة على أدائك وإنجازاتك</p>
            </div>

            <div className="flex items-center gap-3">
              {/* Time Range Filter */}
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="week">هذا الأسبوع</option>
                <option value="month">هذا الشهر</option>
                <option value="year">هذه السنة</option>
              </select>

              <button
                onClick={handleExport}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <FaDownload />
                تصدير التقرير
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {/* Total Patients */}
            <div className="group relative overflow-hidden rounded-xl bg-white p-6 shadow-lg border border-gray-100 transition-all hover:shadow-xl">
              <div className="absolute top-0 right-0 h-24 w-24 translate-x-8 -translate-y-8 transform rounded-full bg-blue-500 opacity-10 transition-transform group-hover:scale-150"></div>
              <div className="relative">
                <div className="flex items-center justify-between">
                  <FaUserInjured className="text-4xl text-blue-600" />
                  <div
                    className={`flex items-center gap-1 text-sm font-medium ${
                      currentStats.patients.percentage > 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {currentStats.patients.percentage > 0 ? <FaArrowUp /> : <FaArrowDown />}
                    {Math.abs(currentStats.patients.percentage)}%
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-600">إجمالي المرضى</p>
                  <p className="mt-1 text-3xl font-bold text-gray-900">{currentStats.patients.current}</p>
                  <p className="mt-1 text-xs text-gray-500">
                    السابق: {currentStats.patients.previous}
                  </p>
                </div>
              </div>
            </div>

            {/* Total Scans */}
            <div className="group relative overflow-hidden rounded-xl bg-white p-6 shadow-lg border border-gray-100 transition-all hover:shadow-xl">
              <div className="absolute top-0 right-0 h-24 w-24 translate-x-8 -translate-y-8 transform rounded-full bg-purple-500 opacity-10 transition-transform group-hover:scale-150"></div>
              <div className="relative">
                <div className="flex items-center justify-between">
                  <FaXRay className="text-4xl text-purple-600" />
                  <div
                    className={`flex items-center gap-1 text-sm font-medium ${
                      currentStats.scans.percentage > 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {currentStats.scans.percentage > 0 ? <FaArrowUp /> : <FaArrowDown />}
                    {Math.abs(currentStats.scans.percentage)}%
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-600">إجمالي الفحوصات</p>
                  <p className="mt-1 text-3xl font-bold text-gray-900">{currentStats.scans.current}</p>
                  <p className="mt-1 text-xs text-gray-500">السابق: {currentStats.scans.previous}</p>
                </div>
              </div>
            </div>

            {/* Completed */}
            <div className="group relative overflow-hidden rounded-xl bg-white p-6 shadow-lg border border-gray-100 transition-all hover:shadow-xl">
              <div className="absolute top-0 right-0 h-24 w-24 translate-x-8 -translate-y-8 transform rounded-full bg-green-500 opacity-10 transition-transform group-hover:scale-150"></div>
              <div className="relative">
                <div className="flex items-center justify-between">
                  <FaCheckCircle className="text-4xl text-green-600" />
                  <div
                    className={`flex items-center gap-1 text-sm font-medium ${
                      currentStats.completed.percentage > 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {currentStats.completed.percentage > 0 ? <FaArrowUp /> : <FaArrowDown />}
                    {Math.abs(currentStats.completed.percentage)}%
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-600">مكتملة</p>
                  <p className="mt-1 text-3xl font-bold text-gray-900">{currentStats.completed.current}</p>
                  <p className="mt-1 text-xs text-gray-500">
                    السابق: {currentStats.completed.previous}
                  </p>
                </div>
              </div>
            </div>

            {/* Pending */}
            <div className="group relative overflow-hidden rounded-xl bg-white p-6 shadow-lg border border-gray-100 transition-all hover:shadow-xl">
              <div className="absolute top-0 right-0 h-24 w-24 translate-x-8 -translate-y-8 transform rounded-full bg-orange-500 opacity-10 transition-transform group-hover:scale-150"></div>
              <div className="relative">
                <div className="flex items-center justify-between">
                  <FaClock className="text-4xl text-orange-600" />
                  <div
                    className={`flex items-center gap-1 text-sm font-medium ${
                      currentStats.pending.percentage < 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {currentStats.pending.percentage < 0 ? <FaArrowDown /> : <FaArrowUp />}
                    {Math.abs(currentStats.pending.percentage)}%
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-600">قيد الانتظار</p>
                  <p className="mt-1 text-3xl font-bold text-gray-900">{currentStats.pending.current}</p>
                  <p className="mt-1 text-xs text-gray-500">السابق: {currentStats.pending.previous}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Patient Distribution Chart */}
            <div className="lg:col-span-2 rounded-xl bg-white p-6 shadow-lg border border-gray-100">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <FaCalendarAlt className="text-blue-600" />
                  توزيع المرضى خلال الأسبوع
                </h2>
              </div>

              <div className="space-y-4">
                {patientChartData.map((item, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="w-20 text-sm font-medium text-gray-700">{item.day}</div>
                    <div className="flex-1">
                      <div className="relative h-10 rounded-lg bg-gray-100">
                        <div
                          className={`absolute right-0 top-0 h-full rounded-lg ${item.color} flex items-center justify-end px-3 transition-all duration-500`}
                          style={{ width: `${(item.value / maxValue) * 100}%` }}
                        >
                          {item.value > 0 && (
                            <span className="text-sm font-bold text-white">{item.value}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="w-12 text-sm text-gray-600">{item.value} مريض</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Scan Types Distribution */}
            <div className="rounded-xl bg-white p-6 shadow-lg border border-gray-100">
              <h2 className="mb-6 text-xl font-bold text-gray-900 flex items-center gap-2">
                <FaXRay className="text-purple-600" />
                أنواع الفحوصات
              </h2>

              <div className="space-y-4">
                {scanTypes.map((scan, index) => (
                  <div key={index}>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">{scan.type}</span>
                      <span className="text-sm font-bold text-gray-900">{scan.count}</span>
                    </div>
                    <div className="relative h-3 rounded-full bg-gray-100">
                      <div
                        className={`absolute right-0 top-0 h-full rounded-full ${scan.color} transition-all duration-500`}
                        style={{ width: `${scan.percentage}%` }}
                      ></div>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">{scan.percentage}% من الإجمالي</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="rounded-xl bg-white p-6 shadow-lg border border-gray-100">
            <h2 className="mb-6 text-xl font-bold text-gray-900 flex items-center gap-2">
              <FaClock className="text-blue-600" />
              النشاط الأخير
            </h2>

            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-lg border border-gray-200 p-4 transition-all hover:bg-gray-50"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full ${
                        activity.status === "completed"
                          ? "bg-green-100"
                          : activity.status === "pending"
                          ? "bg-orange-100"
                          : activity.status === "sent"
                          ? "bg-blue-100"
                          : "bg-purple-100"
                      }`}
                    >
                      {activity.status === "completed" ? (
                        <FaCheckCircle className="text-green-600" />
                      ) : activity.status === "pending" ? (
                        <FaClock className="text-orange-600" />
                      ) : (
                        <FaEye className="text-blue-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{activity.action}</p>
                      <p className="text-sm text-gray-600">{activity.patient}</p>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="text-sm text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DoctorLayout>
  );
}
