import useLocale from "../../hooks/useLocale";
import en from "../../locales/en";
import ar from "../../locales/ar";

export default function AnalysisStatusBadge({ status }) {
  const { locale } = useLocale();
  const tr = locale === "ar" ? ar.adminAnalysis : en.adminAnalysis;
  // يدعم analysisPage.statuses أو analysisSection.statuses أو tr.statuses
  const statusesTr = tr.statuses || tr.analysisPage?.statuses || tr.analysisSection?.statuses || {};

  let color = "bg-gray-200 text-gray-700";
  // دعم القيم بالإنجليزي والعربي
  if (status === "completed" || status === "مكتمل") color = "bg-green-200 text-green-700";
  if (status === "pending" || status === "قيد الانتظار") color = "bg-yellow-200 text-yellow-700";
  if (status === "reviewing" || status === "قيد المراجعة") color = "bg-blue-200 text-blue-700";
  if (status === "failed" || status === "فاشل") color = "bg-red-200 text-red-700";
  if (status === "success" || status === "ناجح") color = "bg-green-200 text-green-700";

  // عرض النص المترجم إذا وجد، وإلا القيمة الأصلية
  const label = statusesTr[status] || status;

  return (
    <span className={`px-3 py-1 rounded-full font-bold text-sm ${color}`}>{label}</span>
  );
}
