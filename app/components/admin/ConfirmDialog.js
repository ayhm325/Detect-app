import React from "react";
import useLocale from "../../hooks/useLocale";
import en from "../../locales/en";
import ar from "../../locales/ar";

export default function ConfirmDialog({ open, onConfirm, onCancel, message }) {
  const { locale } = useLocale();
  const tr = locale === "ar" ? ar.adminAnalysis : en.adminAnalysis;
  const confirmTr = tr.confirmDialog || {};
  const msg = message || confirmTr.message || (locale === "ar" ? "هل أنت متأكد؟" : "Are you sure?");
  const confirmLabel = confirmTr.confirm || (locale === "ar" ? "تأكيد" : "Confirm");
  const cancelLabel = confirmTr.cancel || (locale === "ar" ? "إلغاء" : "Cancel");
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-lg min-w-75">
        <p className="mb-4">{msg}</p>
        <div className="flex gap-4">
          <button onClick={onConfirm} className="px-4 py-2 bg-green-500 text-white rounded">{confirmLabel}</button>
          <button onClick={onCancel} className="px-4 py-2 bg-gray-300 rounded">{cancelLabel}</button>
        </div>
      </div>
    </div>
  );
}
