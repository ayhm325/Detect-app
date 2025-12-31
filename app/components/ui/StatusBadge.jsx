// StatusBadge: شارة حالة عامة للاستخدام في جميع أجزاء التطبيق
// يمكنك توسيع الحالات حسب الحاجة
import React from "react";

const STATUS_MAP = {
  ready: { labelKey: "ready", defaultLabel: "Ready", className: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  processing: { labelKey: "processing", defaultLabel: "Processing", className: "bg-amber-50 text-amber-700 ring-amber-200" },
  reviewed: { labelKey: "reviewed", defaultLabel: "Reviewed", className: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  pending: { labelKey: "pending", defaultLabel: "Pending", className: "bg-amber-50 text-amber-700 ring-amber-200" },
  confirmed: { labelKey: "confirmed", defaultLabel: "Confirmed", className: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  online: { labelKey: "online", defaultLabel: "Online", className: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  offline: { labelKey: "offline", defaultLabel: "Offline", className: "bg-gray-50 text-gray-700 ring-gray-200" },
  // add more statuses as needed
};

export default function StatusBadge({ status, t }) {
  const defaultFallback = { labelKey: null, defaultLabel: status || "—", className: "bg-gray-50 text-gray-700 ring-gray-200" };
  const { labelKey, defaultLabel, className } = STATUS_MAP[status] || defaultFallback;
  const display = labelKey && t ? t(labelKey, { defaultValue: defaultLabel }) : defaultLabel;
  return (
    <span className={`inline-flex rounded-md px-2.5 py-1 text-sm ring-1 ring-inset ${className}`}>
      {display}
    </span>
  );
}
