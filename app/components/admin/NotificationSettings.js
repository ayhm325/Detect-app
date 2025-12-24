import { useState } from "react";
import useLocale from "../../hooks/useLocale";
import en from "../../locales/en";
import ar from "../../locales/ar";

export default function NotificationSettings() {
  const [enabled, setEnabled] = useState(true);
  const { locale } = useLocale();
  const tr = locale === "ar" ? ar.adminAnalysis : en.adminAnalysis;
  const notifTr = tr.notificationSettings || {};
  const title = notifTr.title || (locale === "ar" ? "إعدادات الإشعارات" : "Notification Settings");
  const enableLabel = notifTr.enable || (locale === "ar" ? "تفعيل الإشعارات" : "Enable notifications");
  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-yellow-100 max-w-xl mx-auto mt-8">
      <h3 className="font-bold text-xl mb-4 text-yellow-700">{title}</h3>
      <label className="flex items-center gap-2">
        <input type="checkbox" checked={enabled} onChange={() => setEnabled(!enabled)} />
        {enableLabel}
      </label>
    </div>
  );
}
