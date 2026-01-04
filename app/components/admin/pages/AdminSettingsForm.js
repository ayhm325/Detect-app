"use client";

import { FaUserShield, FaPalette, FaBell, FaSave } from "react-icons/fa";
import { useTranslations } from "next-intl";
import { useState } from "react";

export default function AdminSettingsForm() {
  const t = useTranslations("adminSettings");
  const [systemName, setSystemName] = useState(t("defaults.systemName"));

  return (
    <form className="max-w-2xl mx-auto mt-10 card-glass rounded-3xl shadow-(--shadow-soft) border border-(--ui-border) p-8 flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <label className="font-bold text-foreground flex items-center gap-2"><FaUserShield className="text-(--ui-muted-2)" /> {t("demoForm.systemName.label")}</label>
        <input
          type="text"
          className="rounded-xl border border-(--ui-border) bg-(--ui-surface-2) text-foreground px-4 py-3 focus:ring-4 focus:ring-(--ui-ring)/20 focus:border-transparent outline-none transition-all"
          placeholder={t("demoForm.systemName.placeholder")}
          value={systemName}
          onChange={(e) => setSystemName(e.target.value)}
        />
      </div>
      <div className="flex flex-col gap-2">
        <label className="font-bold text-foreground flex items-center gap-2"><FaPalette className="text-(--ui-muted-2)" /> {t("demoForm.primaryColor.label")}</label>
        <input type="color" className="w-16 h-10 rounded-xl border border-(--ui-border) bg-(--ui-surface-2) cursor-pointer" data-token-default="--color-bright-500" />
      </div>
      <div className="flex flex-col gap-2">
        <label className="font-bold text-foreground flex items-center gap-2"><FaBell className="text-(--ui-muted-2)" /> {t("demoForm.notificationsEnabled.label")}</label>
        <select className="rounded-xl border border-(--ui-border) bg-(--ui-surface-2) text-foreground px-4 py-3 focus:ring-4 focus:ring-(--ui-ring)/20 focus:border-transparent outline-none transition-all">
          <option>{t("demoForm.notificationsEnabled.enabled")}</option>
          <option>{t("demoForm.notificationsEnabled.disabled")}</option>
        </select>
      </div>
      <button type="submit" className="mt-2 px-8 py-4 rounded-full btn-gradient font-bold text-lg flex items-center gap-2 mx-auto">
        <FaSave /> {t("demoForm.actions.save")}
      </button>
    </form>
  );
}
