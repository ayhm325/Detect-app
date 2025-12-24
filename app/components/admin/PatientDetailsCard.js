import useLocale from "../../hooks/useLocale";
import en from "../../locales/en";
import ar from "../../locales/ar";

export default function PatientDetailsCard({ patient, onClose }) {
  const { locale } = useLocale();
  const tr = locale === "ar" ? ar.adminAnalysis : en.adminAnalysis;
  const patientTr = tr.patientDetailsCard || {};
  const title = patientTr.title || (locale === "ar" ? "تفاصيل المريض" : "Patient Details");
  const nameLabel = patientTr.name || (locale === "ar" ? "الاسم:" : "Name:");
  const ageLabel = patientTr.age || (locale === "ar" ? "العمر:" : "Age:");
  const emailLabel = patientTr.email || (locale === "ar" ? "البريد الإلكتروني:" : "Email:");
  const closeLabel = patientTr.close || (locale === "ar" ? "إغلاق" : "Close");
  if (!patient) return null;
  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-yellow-100 max-w-md mx-auto mt-8">
      <h3 className="font-bold text-xl mb-4 text-yellow-700">{title}</h3>
      <div className="mb-2"><span className="font-bold">{nameLabel}</span> {patient.name}</div>
      <div className="mb-2"><span className="font-bold">{ageLabel}</span> {patient.age}</div>
      <div className="mb-2"><span className="font-bold">{emailLabel}</span> {patient.email}</div>
      <button className="mt-6 px-6 py-2 rounded-full bg-yellow-400 text-white font-bold" onClick={onClose}>{closeLabel}</button>
    </div>
  );
}
