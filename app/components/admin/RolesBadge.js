import useLocale from "../../hooks/useLocale";
import en from "../../locales/en";
import ar from "../../locales/ar";

export default function RolesBadge({ role }) {
  const { locale } = useLocale();
  const tr = locale === "ar" ? ar.adminAnalysis : en.adminAnalysis;
  const rolesTr = tr.usersSection?.roles || {};
  let color = "bg-gray-200 text-gray-700";
  let label = role;
  if (role === "أدمن" || role === "Admin") {
    color = "bg-yellow-200 text-yellow-700";
    label = rolesTr.admin || (locale === "ar" ? "أدمن" : "Admin");
  }
  if (role === "طبيب" || role === "Doctor") {
    color = "bg-red-200 text-red-700";
    label = rolesTr.doctor || (locale === "ar" ? "طبيب" : "Doctor");
  }
  if (role === "مريض" || role === "Patient") {
    color = "bg-blue-200 text-blue-700";
    label = rolesTr.patient || (locale === "ar" ? "مريض" : "Patient");
  }
  return (
    <span className={`px-3 py-1 rounded-full font-bold text-sm ${color}`}>{label}</span>
  );
}
