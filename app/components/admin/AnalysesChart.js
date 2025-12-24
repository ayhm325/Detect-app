import React from "react";
import useLocale from "../../hooks/useLocale";
import en from "../../locales/en";
import ar from "../../locales/ar";

export default function AnalysesChart() {
  const { locale } = useLocale();
  // Pick translation object based on locale
  const tr = locale === "ar" ? ar.adminAnalysis : en.adminAnalysis;
  // Try both possible keys for chart title
  const chartTitle =
    (tr.analysisPage && tr.analysisPage.chartTitle) ||
    (tr.analysisSection && tr.analysisSection.chartTitle) ||
    "رسم بياني للتحليلات";

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-red-200 mt-8">
      <h3 className="font-bold text-lg mb-4 text-red-700">{chartTitle}</h3>
      <div className="w-full h-32 bg-linear-to-r from-yellow-100 via-red-100/40 to-white rounded-xl" />
    </div>
  );
}
