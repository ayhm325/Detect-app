import React from "react";
import useLocale from "../../hooks/useLocale";
import en from "../../locales/en";
import ar from "../../locales/ar";

export default function ErrorState({ message }) {
  const { locale } = useLocale();
  const tr = locale === "ar" ? ar.adminAnalysis : en.adminAnalysis;
  // يدعم analysisPage.error أو analysisSection.error أو tr.error أو نص افتراضي
  const errorText = message || tr.analysisPage?.error || tr.analysisSection?.error || tr.error || (locale === "ar" ? "حدث خطأ ما!" : "An error occurred!");
  return (
    <div className="text-center text-red-600 py-8">
      <p>{errorText}</p>
    </div>
  );
}
