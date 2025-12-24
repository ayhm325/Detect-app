"use client";

import { FaUserInjured, FaUserPlus } from "react-icons/fa";
import Button from "../ui/Button";
import { Table, THead, TRow, TH, TD } from "../ui/Table";
import Pagination from "../ui/Pagination";
import useLocale from "../../hooks/useLocale";
import en from "../../locales/en";
import ar from "../../locales/ar";

export default function PatientsTableClient({ patients, onEdit, onDelete, onDetails, onAdd, page = 1, pageCount = 1, onPageChange }) {
  const { locale } = useLocale();
  const tr = locale === "ar" ? ar.adminAnalysis : en.adminAnalysis;
  const tableTr = tr.patientsTable || {};
  const thName = tableTr.name || (locale === "ar" ? "الاسم" : "Name");
  const thAge = tableTr.age || (locale === "ar" ? "العمر" : "Age");
  const thEmail = tableTr.email || (locale === "ar" ? "البريد الإلكتروني" : "Email");
  const thActions = tableTr.actions || (locale === "ar" ? "إجراءات" : "Actions");
  const editLabel = tableTr.edit || (locale === "ar" ? "تعديل" : "Edit");
  const deleteLabel = tableTr.delete || (locale === "ar" ? "حذف" : "Delete");
  const detailsLabel = tableTr.details || (locale === "ar" ? "تفاصيل" : "Details");
  const addLabel = tableTr.add || (locale === "ar" ? "إضافة مريض جديد" : "Add New Patient");

  return (
    <div className="mt-8">
      <Table>
        <THead>
          <TRow className="bg-linear-to-r from-yellow-100 via-red-100/40 to-white dark:from-zinc-800 dark:via-zinc-800/60 dark:to-zinc-900">
            <TH>#</TH>
            <TH>{thName}</TH>
            <TH>{thAge}</TH>
            <TH>{thEmail}</TH>
            <TH>{thActions}</TH>
          </TRow>
        </THead>
        <tbody>
          {patients.map((patient, i) => (
            <TRow key={patient.id} className="hover:bg-yellow-50/40 dark:hover:bg-zinc-800/40">
              <TD className="text-center font-bold">{i + 1}</TD>
              <TD className="text-center">
                <span className="inline-flex items-center gap-2 justify-center">
                  <FaUserInjured className="text-red-400" />{patient.name}
                </span>
              </TD>
              <TD className="text-center">{patient.age}</TD>
              <TD className="text-center">{patient.email}</TD>
              <TD>
                <div className="flex items-center justify-center gap-2">
                  <Button variant="ghost" className="px-3 py-2" title={editLabel} onClick={() => onEdit && onEdit(patient)}>{editLabel}</Button>
                  <Button variant="ghost" className="px-3 py-2 text-red-700" title={deleteLabel} onClick={() => onDelete && onDelete(patient)}>{deleteLabel}</Button>
                  <Button variant="ghost" className="px-3 py-2 text-blue-700" title={detailsLabel} onClick={() => onDetails && onDetails(patient)}>{detailsLabel}</Button>
                </div>
              </TD>
            </TRow>
          ))}
        </tbody>
      </Table>

      <div className="flex items-center justify-between mt-6">
        <Button variant="primary" className="px-6" onClick={() => onAdd && onAdd()}>
          <span className="inline-flex items-center gap-2"><FaUserPlus /> {addLabel}</span>
        </Button>
        <Pagination page={page} pageCount={pageCount} onPageChange={onPageChange} />
      </div>
    </div>
  );
}
