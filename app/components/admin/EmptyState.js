import React from "react";
import useLocale from "../../hooks/useLocale";
import en from "../../locales/en";
import ar from "../../locales/ar";

export default function EmptyState({ message }) {
  const { locale } = useLocale();
  const tr = locale === "ar" ? ar.adminAnalysis : en.adminAnalysis;
  // يدعم analysisPage.noData أو analysisSection.noData أو tr.noData أو نص افتراضي
  const noDataText = message || tr.analysisPage?.noData || tr.analysisSection?.noData || tr.noData || (locale === "ar" ? "لا توجد بيانات لعرضها." : "No data to display.");
  return (
    <div className="text-center text-gray-400 py-8">
      <p>{noDataText}</p>
    </div>
  );
}
