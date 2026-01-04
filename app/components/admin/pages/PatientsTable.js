"use client";

import { FaUserInjured, FaUserEdit, FaUserTimes, FaUserPlus } from "react-icons/fa";
import { useTranslations } from "next-intl";

export default function PatientsTable() {
  const t = useTranslations("adminPatients");
  const ui = useTranslations("ui");
  const placeholder = ui("placeholder");

  const demoPatients = t.raw("PatientsManagement.demoItems");
  const patients = Array.isArray(demoPatients) ? demoPatients : [];

  return (
    <div className="overflow-x-auto mt-8">
      <table className="min-w-full rounded-2xl border border-(--ui-border) bg-(--ui-surface)">
        <thead>
          <tr className="bg-(--ui-surface-2)">
            <th className="py-3 px-4 text-start text-xs font-semibold text-(--ui-muted-2)">{t("PatientsManagement.csvHeader_id")}</th>
            <th className="py-3 px-4 text-start text-xs font-semibold text-(--ui-muted-2)">{t("PatientsManagement.csvHeader_name")}</th>
            <th className="py-3 px-4 text-start text-xs font-semibold text-(--ui-muted-2)">{t("PatientsManagement.labels.age")}</th>
            <th className="py-3 px-4 text-start text-xs font-semibold text-(--ui-muted-2)">{t("PatientsManagement.csvHeader_email")}</th>
            <th className="py-3 px-4 text-start text-xs font-semibold text-(--ui-muted-2)">{t("PatientsManagement.table.actions")}</th>
          </tr>
        </thead>
        <tbody>
          {patients.map((patient, i) => (
            <tr key={patient.id} className="border-t border-(--ui-border) hover:bg-(--ui-surface-2)/60">
              <td className="py-3 px-4 text-start text-sm font-semibold text-foreground">{i+1}</td>
              <td className="py-3 px-4 text-start text-sm text-foreground flex items-center gap-2">
                <FaUserInjured className="text-(--ui-muted-2)" />
                {patient.name || placeholder}
              </td>
              <td className="py-3 px-4 text-start text-sm text-foreground">{patient.age ?? placeholder}</td>
              <td className="py-3 px-4 text-start text-sm text-(--ui-muted-2)">{patient.email || placeholder}</td>
              <td className="py-3 px-4">
                <div className="flex items-center gap-3">
                  <button className="rounded-xl border border-(--ui-border) bg-(--ui-surface-2) p-2 text-foreground hover:opacity-90" title={t("PatientsManagement.actions.edit")}><FaUserEdit /></button>
                  <button className="rounded-xl border border-(--ui-danger-border) bg-(--ui-danger) p-2 text-white hover:opacity-90" title={t("PatientsManagement.actions.delete")}><FaUserTimes /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button className="btn-gradient mt-6 flex items-center gap-2 rounded-xl px-6 py-3 font-semibold">
        <FaUserPlus /> {t("PatientsManagement.addButton")}
      </button>
    </div>
  );
}
