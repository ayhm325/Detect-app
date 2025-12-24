import useLocale from "../../hooks/useLocale";
import en from "../../locales/en";
import ar from "../../locales/ar";

export default function AnalysisDetails({ analysis, onClose }) {
  const { locale } = useLocale();
  const tr = locale === "ar" ? ar.adminAnalysis : en.adminAnalysis;
  const detailsTr = tr.detailsModal || {};

  if (!analysis) return null;
  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-yellow-100 max-w-md mx-auto mt-8">
      <h3 className="font-bold text-xl mb-4 text-yellow-700">{detailsTr.title || "تفاصيل التحليل"}</h3>
      <div className="mb-2"><span className="font-bold">{detailsTr.patientInfo || "اسم المريض:"}</span> {analysis.patientName}</div>
      <div className="mb-2"><span className="font-bold">{detailsTr.date || "تاريخ التحليل:"}</span> {analysis.date}</div>
      <div className="mb-2"><span className="font-bold">{detailsTr.status || "الحالة:"}</span> {analysis.status}</div>
      <button className="mt-6 px-6 py-2 rounded-full bg-yellow-400 text-white font-bold" onClick={onClose}>{detailsTr.close || (locale === "ar" ? "إغلاق" : "Close")}</button>
    </div>
  );
}
