import useLocale from "../../hooks/useLocale";
import en from "../../locales/en";
import ar from "../../locales/ar";

export default function PatientHistoryList({ history }) {
  const { locale } = useLocale();
  const tr = locale === "ar" ? ar.adminAnalysis : en.adminAnalysis;
  const histTr = tr.patientHistoryList || {};
  const noHistory = histTr.noHistory || (locale === "ar" ? "لا يوجد سجل للمريض." : "No patient history.");
  const title = histTr.title || (locale === "ar" ? "سجل المريض" : "Patient History");
  if (!history || history.length === 0) return (
    <div className="text-center text-gray-400 py-4">{noHistory}</div>
  );
  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-yellow-100 mt-8">
      <h3 className="font-bold text-lg mb-4 text-yellow-700">{title}</h3>
      <ul className="space-y-3">
        {history.map((item, idx) => (
          <li key={idx} className="flex justify-between text-zinc-700">
            <span>{item.event}</span>
            <span className="text-xs text-zinc-400">{item.date}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
