import useLocale from "../../hooks/useLocale";
import en from "../../locales/en";
import ar from "../../locales/ar";

export default function SpecialtyBadge({ specialty }) {
  const { locale } = useLocale();
  const tr = locale === "ar" ? ar.adminAnalysis : en.adminAnalysis;
  const specialtiesTr = tr.specialties || {};
  let color = "bg-gray-200 text-gray-700";
  let label = specialty;
  if (specialty === "أشعة" || specialty === "Radiology") {
    color = "bg-yellow-200 text-yellow-700";
    label = specialtiesTr.radiology || (locale === "ar" ? "أشعة" : "Radiology");
  }
  if (specialty === "صدرية" || specialty === "Pulmonology") {
    color = "bg-red-200 text-red-700";
    label = specialtiesTr.pulmonology || (locale === "ar" ? "صدرية" : "Pulmonology");
  }
  if (specialty === "عظام" || specialty === "Orthopedics") {
    color = "bg-blue-200 text-blue-700";
    label = specialtiesTr.orthopedics || (locale === "ar" ? "عظام" : "Orthopedics");
  }
  return (
    <span className={`px-3 py-1 rounded-full font-bold text-sm ${color}`}>{label}</span>
  );
}
