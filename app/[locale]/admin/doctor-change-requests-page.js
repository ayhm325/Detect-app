"use client";

import { useState } from "react";
import {
  useDoctorChangeRequests,
  approveDoctorChangeRequest,
  rejectDoctorChangeRequest,
} from "./doctor-change-requests";
// Page is rendered inside the route-level AdminLayout; avoid double-wrapping
import useLocale from "../../hooks/useLocale";
import en from "../../locales/en";
import ar from "../../locales/ar";
import { FaCheck, FaTimes, FaUserMd, FaUser } from "react-icons/fa";

export default function DoctorChangeRequestsPage() {
  const { locale } = useLocale();

  const t =
    locale === "ar"
      ? ar.doctorChangeRequests
      : en.doctorChangeRequests;

  const tResolved =
    t ||
    (locale === "ar"
      ? ar.default?.doctorChangeRequests
      : en.default?.doctorChangeRequests);

  const [refresh, setRefresh] = useState(0);
  const requests = useDoctorChangeRequests();
  const [actionLoading, setActionLoading] = useState(null);

  const handleApprove = async (id) => {
    setActionLoading(id);
    await approveDoctorChangeRequest(id);
    setActionLoading(null);
    setRefresh((v) => v + 1);
  };

  const handleReject = async (id) => {
    setActionLoading(id);
    await rejectDoctorChangeRequest(id);
    setActionLoading(null);
    setRefresh((v) => v + 1);
  };

  if (!tResolved || !tResolved.title) {
    return (
      <>
        <div className="p-8">
          <h1 className="text-3xl font-bold text-red-600">
            Translation for DoctorChangeRequests is missing
          </h1>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="py-8 px-4 md:px-8">
        <h1 className="text-3xl font-bold mb-6">{tResolved.title}</h1>

        {requests.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-8 text-center">
            <FaUserMd
              size={48}
              className="mx-auto mb-4 text-gray-400 dark:text-gray-600"
            />
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              {tResolved.noRequests}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto max-w-3xl">
            <table className="w-full border bg-white dark:bg-slate-800">
              <thead>
                <tr className="bg-gray-100 dark:bg-slate-700">
                  <th className="p-2 border">المريض</th>
                  <th className="p-2 border">الطبيب الحالي</th>
                  <th className="p-2 border">الطبيب المطلوب</th>
                  <th className="p-2 border">السبب</th>
                  <th className="p-2 border">الحالة</th>
                  <th className="p-2 border">إجراء</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr key={req.id} className="border-b">
                    <td className="p-2 border">{req.patientName || '—'}</td>
                    <td className="p-2 border">{req.currentDoctorName || '—'}</td>
                    <td className="p-2 border">{req.requestedDoctorName || '—'}</td>
                    <td className="p-2 border">{req.reason || '—'}</td>
                    <td className="p-2 border">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        req.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : req.status === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {req.status === 'pending'
                          ? tResolved.pending
                          : req.status === 'approved'
                          ? tResolved.approved
                          : tResolved.rejected}
                      </span>
                    </td>
                    <td className="p-2 border">
                      {req.status === 'pending' ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApprove(req.id)}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded disabled:opacity-50"
                            disabled={actionLoading === req.id}
                          >
                            موافقة
                          </button>
                          <button
                            onClick={() => handleReject(req.id)}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded disabled:opacity-50"
                            disabled={actionLoading === req.id}
                          >
                            رفض
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
