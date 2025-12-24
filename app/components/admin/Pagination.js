import React from "react";
import useLocale from "../../hooks/useLocale";
import en from "../../locales/en";
import ar from "../../locales/ar";

export default function Pagination({ current, total, onPageChange }) {
  const { locale } = useLocale();
  const tr = locale === "ar" ? ar.adminAnalysis : en.adminAnalysis;
  const pagTr = tr.pagination || tr.analysisPage?.pagination || tr.analysisSection?.pagination || {};
  const prevLabel = pagTr.prev || (locale === "ar" ? "السابق" : "Previous");
  const nextLabel = pagTr.next || (locale === "ar" ? "التالي" : "Next");
  const ofLabel = pagTr.ofLabel || (locale === "ar" ? "/" : "/");
  return (
    <div className="flex justify-center items-center gap-2 my-4">
      <button disabled={current === 1} onClick={() => onPageChange(current - 1)} className="px-2 py-1 bg-gray-200 rounded">{prevLabel}</button>
      <span>{current} {ofLabel} {total}</span>
      <button disabled={current === total} onClick={() => onPageChange(current + 1)} className="px-2 py-1 bg-gray-200 rounded">{nextLabel}</button>
    </div>
  );
}
