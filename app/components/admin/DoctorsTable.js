
import { FaUserMd, FaUserPlus } from "react-icons/fa";
import SpecialtyBadge from "./SpecialtyBadge";
import Button from "../ui/Button";
import { Table, THead, TRow, TH, TD } from "../ui/Table";
import Pagination from "../ui/Pagination";

import { useTranslations } from "next-intl";

export default function DoctorsTable({ doctors, onEdit, onDelete, onDetails, onAdd, onApprove, onReject, page = 1, pageCount = 1, onPageChange }) {
  const t = useTranslations("doctorsTable");
  return (
    <div className="mt-8">
      <Table>
        <THead>
          <TRow className="bg-linear-to-r from-yellow-100 via-red-100/40 to-white dark:from-zinc-800 dark:via-zinc-800/60 dark:to-zinc-900">
            <TH className="py-3 px-4 text-center">#</TH>
            <TH className="py-3 px-4 text-center">{t("name")}</TH>
            <TH className="py-3 px-4 text-center">{t("license")}</TH>
            <TH className="py-3 px-4 text-center">{t("phone")}</TH>
            <TH className="py-3 px-4 text-center">{t("email")}</TH>
            <TH className="py-3 px-4 text-center">{t("actions")}</TH>
          </TRow>
        </THead>
        <tbody>
          {doctors.map((doctor, i) => {
            const name = doctor.user?.fullName || doctor.name;
            const email = doctor.user?.email || doctor.email;
            // Handle both possible shapes: top-level or inside doctor.user
            const licenseNumber = doctor.licenseNumber || doctor.user?.licenseNumber || "—";
            const phone = doctor.phone || doctor.user?.phone || "—";
            return (
              <TRow key={doctor.id || doctor.userId} className="hover:bg-yellow-50/40 dark:hover:bg-zinc-800/40">
                <TD className="py-2 px-4 text-center font-bold">{i + 1}</TD>
                <TD className="py-2 px-4 text-center">
                  <span className="inline-flex items-center gap-2 justify-center">
                    <FaUserMd className="text-yellow-600" />{name}
                  </span>
                </TD>
                <TD className="py-2 px-4 text-center">{licenseNumber}</TD>
                <TD className="py-2 px-4 text-center">{phone}</TD>
                <TD className="py-2 px-4 text-center">{email}</TD>
                <TD className="py-2 px-4">
                  <div className="flex items-center justify-center gap-2 flex-wrap">
                    <Button variant="ghost" className="px-3 py-2" title={t("edit")} onClick={() => onEdit(doctor)}>{t("edit")}</Button>
                    <Button variant="ghost" className="px-3 py-2 text-red-700" title={t("delete")} onClick={() => onDelete(doctor)}>{t("delete")}</Button>
                    <Button variant="ghost" className="px-3 py-2 text-blue-700" title={t("details")} onClick={() => onDetails(doctor)}>{t("details")}</Button>
                  </div>
                </TD>
              </TRow>
            );
          })}
        </tbody>
      </Table>

      <div className="flex items-center justify-between mt-6">
        <Button variant="primary" className="px-6" onClick={onAdd}>
          <span className="inline-flex items-center gap-2"><FaUserPlus /> {t("add")}</span>
        </Button>
        <Pagination page={page} pageCount={pageCount} onPageChange={onPageChange} />
      </div>
    </div>
  );
}
