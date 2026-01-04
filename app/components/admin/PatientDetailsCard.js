"use client";

import { useTranslations } from "next-intl";

export default function PatientDetailsCard({ patient, onClose }) {
  const tPatients = useTranslations("adminPatients");
  const tCommon = useTranslations("adminCommon");

  const title = tPatients("detailsCard.title");
  const nameLabel = tPatients("detailsCard.nameLabel");
  const ageLabel = tPatients("detailsCard.ageLabel");
  const emailLabel = tPatients("detailsCard.emailLabel");
  const closeLabel = tCommon("close");
  if (!patient) return null;
  return (
    <div className="card-glass p-8 border border-(--ui-border) max-w-md mx-auto mt-8">
      <h3 className="font-bold text-xl mb-4 text-foreground">{title}</h3>
      <div className="mb-2"><span className="font-bold">{nameLabel}</span> {patient.name}</div>
      <div className="mb-2"><span className="font-bold">{ageLabel}</span> {patient.age}</div>
      <div className="mb-2"><span className="font-bold">{emailLabel}</span> {patient.email}</div>
      <button className="mt-6 px-6 py-2 rounded-full btn-gradient font-bold" onClick={onClose}>{closeLabel}</button>
    </div>
  );
}
