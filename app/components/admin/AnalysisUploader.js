import { useRef } from "react";
import useLocale from "../../hooks/useLocale";
import en from "../../locales/en";
import ar from "../../locales/ar";

export default function AnalysisUploader({ onUpload }) {
  const fileRef = useRef();
  const { locale } = useLocale();
  const tr = locale === "ar" ? ar.adminAnalysis : en.adminAnalysis;
  // يدعم analysisPage.buttons أو analysisSection.buttons أو tr.buttons أو نص افتراضي
  const uploadLabel = tr.analysisPage?.buttons?.upload || tr.analysisSection?.buttons?.upload || tr.buttons?.upload || (locale === "ar" ? "رفع صورة تحليل" : "Upload Analysis Image");
  return (
    <div className="flex flex-col items-center gap-4 mt-4">
      <input type="file" accept="image/*" ref={fileRef} className="hidden" onChange={e => onUpload(e.target.files[0])} />
      <button className="px-6 py-2 bg-yellow-500 text-white rounded" onClick={() => fileRef.current.click()}>{uploadLabel}</button>
    </div>
  );
}
