import React from "react";
import useLocale from "../../hooks/useLocale";
import en from "../../locales/en";
import ar from "../../locales/ar";

export default function Modal({ open, onClose, children }) {
  const { locale } = useLocale();
  const tr = locale === "ar" ? ar.adminAnalysis : en.adminAnalysis;
  const closeLabel = tr.analysisPage?.buttons?.close || tr.analysisSection?.buttons?.close || tr.buttons?.close || (locale === "ar" ? "إغلاق" : "Close");
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-lg min-w-75">
        {children}
        <button onClick={onClose} className="mt-4 px-4 py-2 bg-red-500 text-white rounded">{closeLabel}</button>
      </div>
    </div>
  );
}
