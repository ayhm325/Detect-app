// StatusBadge: شارة حالة عامة للاستخدام في جميع أجزاء التطبيق
// يمكنك توسيع الحالات حسب الحاجة
import React from "react";

const STATUS_MAP = {
  ready: { label: "جاهز", className: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  processing: { label: "قيد الإعداد", className: "bg-amber-50 text-amber-700 ring-amber-200" },
  reviewed: { label: "تمت المراجعة", className: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  pending: { label: "قيد المراجعة", className: "bg-amber-50 text-amber-700 ring-amber-200" },
  confirmed: { label: "مؤكد", className: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  online: { label: "متاح", className: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  offline: { label: "غير متاح", className: "bg-gray-50 text-gray-700 ring-gray-200" },
  // أضف حالات أخرى حسب الحاجة
};

export default function StatusBadge({ status, t }) {
  const fallback = { label: status || "—", className: "bg-gray-50 text-gray-700 ring-gray-200" };
  const { label, className } = STATUS_MAP[status] || fallback;
  return (
    <span className={`inline-flex rounded-md px-2.5 py-1 text-sm ring-1 ring-inset ${className}`}>
      {t ? t(label) : label}
    </span>
  );
}
