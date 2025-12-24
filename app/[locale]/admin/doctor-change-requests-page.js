"use client";

import { useState } from "react";
import {
  useDoctorChangeRequests,
  approveDoctorChangeRequest,
  rejectDoctorChangeRequest,
} from "./doctor-change-requests";
import AdminLayout from "./AdminLayout";
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

  const requests = useDoctorChangeRequests();
  const [, forceRerender] = useState(0);

  const handleApprove = (id) => {
    approveDoctorChangeRequest(id);
    forceRerender((v) => v + 1);
  };

  const handleReject = (id) => {
    rejectDoctorChangeRequest(id);
    forceRerender((v) => v + 1);
  };

  if (!tResolved || !tResolved.title) {
    return (
      <AdminLayout
        breadcrumbs={[
          { label: "Translation missing", href: "/admin/doctor-change-requests" },
        ]}
      >
        <div className="p-8">
          <h1 className="text-3xl font-bold text-red-600">
            Translation for DoctorChangeRequests is missing
          </h1>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      breadcrumbs={[
        { label: tResolved.title, href: "/admin/doctor-change-requests" },
      ]}
    >
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
          <div className="space-y-4 max-w-3xl">
            {requests.map((req) => {
              const patientName =
                typeof req.patientName === "object"
                  ? req.patientName[locale]
                  : req.patientName;

              const newDoctorLabel =
                typeof req.newDoctor === "object"
                  ? req.newDoctor[locale]
                  : req.newDoctor;

              return (
                <div
                  key={req.id}
                  className="bg-white dark:bg-slate-800 rounded-xl shadow p-6 border-l-4 border-yellow-500"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    {/* Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <FaUser className="text-blue-500" />
                        <span className="font-bold text-lg">
                          {patientName ||
                            (locale === "ar"
                              ? "مريض مجهول"
                              : "Unknown Patient")}
                        </span>
                      </div>

                      <div className="mb-2">
                        <span className="font-medium">
                          {tResolved.table.doctorName}:
                        </span>
                        <span className="ml-2">{newDoctorLabel}</span>
                      </div>

                      <div className="mb-2">
                        <span className="font-medium">
                          {tResolved.table.requestType}:
                        </span>
                        <span className="ml-2">{req.reason}</span>
                      </div>

                      <div>
                        <span className="font-medium">
                          {tResolved.table.status}:
                        </span>
                        <span
                          className={`ml-2 px-2 py-1 rounded text-xs font-bold ${
                            req.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : req.status === "approved"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {req.status === "pending"
                            ? tResolved.pending
                            : req.status === "approved"
                            ? tResolved.approved
                            : tResolved.rejected}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    {req.status === "pending" && (
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => handleApprove(req.id)}
                          className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg"
                          title={tResolved.approve}
                        >
                          <FaCheck size={18} />
                        </button>
                        <button
                          onClick={() => handleReject(req.id)}
                          className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg"
                          title={tResolved.reject}
                        >
                          <FaTimes size={18} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
