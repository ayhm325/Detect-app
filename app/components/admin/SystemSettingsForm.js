import useLocale from "../../hooks/useLocale";
import en from "../../locales/en";
import ar from "../../locales/ar";

export default function SystemSettingsForm({ onSave }) {
  const { locale } = useLocale();
  const tr = locale === "ar" ? ar.adminAnalysis : en.adminAnalysis;
  const settingsTr = tr.systemSettingsForm || {};
  return (
    <form className="max-w-2xl mx-auto mt-10 bg-white rounded-3xl shadow-xl border-2 border-yellow-100 p-8 flex flex-col gap-8" onSubmit={e => {e.preventDefault(); onSave && onSave();}}>
      <div className="flex flex-col gap-2">
        <label className="font-bold text-zinc-700">{settingsTr.systemNameLabel || (locale === "ar" ? "اسم النظام" : "System Name")}</label>
        <input type="text" className="rounded-xl border border-zinc-200 px-4 py-3" placeholder={settingsTr.systemNamePlaceholder || (locale === "ar" ? "مثال: نظام إدارة الأشعة" : "e.g. Radiology Management System") } defaultValue={settingsTr.systemNameDefault || (locale === "ar" ? "نظام إدارة الأشعة" : "Radiology Management System")} />
      </div>
      <button type="submit" className="mt-2 px-8 py-4 rounded-full bg-yellow-500 text-white font-bold text-lg shadow">{settingsTr.saveButton || (locale === "ar" ? "حفظ الإعدادات" : "Save Settings")}</button>
    </form>
  );
}
