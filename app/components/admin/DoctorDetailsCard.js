

import SpecialtyBadge from "./SpecialtyBadge";
import { useTranslations } from "next-intl";

function DoctorDetailsCard({ doctor, onApprove, onReject, onClose }) {
  const t = useTranslations("doctorDetails");
  if (!doctor) return null;
  // Normalize status to lower-case for translation keys
  const statusKey = (doctor.status || "").toLowerCase();
  const statusLabel = [
    "pending",
    "verified",
    "rejected",
    "active",
    "suspended",
    "banned"
  ].includes(statusKey)
    ? t(`statusLabels.${statusKey}`)
    : doctor.status;
  // Fallbacks for name/email if not present
  const displayName = doctor.name || doctor.fullName || (doctor.user && (doctor.user.name || doctor.user.fullName)) || "—";
  const displayEmail = doctor.email || (doctor.user && doctor.user.email) || "—";
  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-red-100 max-w-md mx-auto mt-8">
      <h3 className="font-bold text-xl mb-4 text-red-700">{t("details")}</h3>
      <div className="mb-2"><span className="font-bold">{t("name")}:</span> {displayName}</div>
      <div className="mb-2"><span className="font-bold">{t("email")}:</span> {displayEmail}</div>
      <div className="mb-2"><span className="font-bold">{t("license")}:</span> {doctor.licenseNumber}</div>
      <div className="mb-2"><span className="font-bold">{t("phone")}:</span> {doctor.phone}</div>
      <div className="mb-2"><span className="font-bold">{t("status")}:</span> {statusLabel}</div>
      {statusKey === "pending" && (
        <div className="flex gap-3 mt-6">
          <button className="flex-1 px-6 py-2 rounded-full bg-green-500 text-white font-bold" onClick={() => onApprove?.(doctor)}>{t("approve")}</button>
          <button className="flex-1 px-6 py-2 rounded-full bg-red-500 text-white font-bold" onClick={() => onReject?.(doctor)}>{t("reject")}</button>
        </div>
      )}
      <button className="mt-6 px-6 py-2 rounded-full bg-gray-400 text-white font-bold w-full" onClick={onClose}>{t("close")}</button>
    </div>
  );
}

export default DoctorDetailsCard;

// ...existing code...
