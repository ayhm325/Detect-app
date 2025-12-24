import AnalysisStatusBadge from "./AnalysisStatusBadge";
import Button from "../ui/Button";
import { Table, THead, TRow, TH, TD } from "../ui/Table";
import Pagination from "../ui/Pagination";
import useLocale from "../../hooks/useLocale";
import en from "../../locales/en";
import ar from "../../locales/ar";

export default function AnalysesTable({ analyses, onView, onDetails, onCompare, page = 1, pageCount = 1, onPageChange }) {
  const { locale } = useLocale();
  const tr = locale === "ar" ? ar.adminAnalysis : en.adminAnalysis;
  // يدعم مفتاح table أو analysisPage.table أو analysisSection.table
  const tableTr = tr.table || tr.analysisPage?.table || tr.analysisSection?.table || {};
  const actionsTr = tr.analysisPage?.actions || tr.analysisSection?.actions || {};

  return (
    <div className="mt-8">
      <Table>
        <THead>
          <TRow className="bg-linear-to-r from-yellow-100 via-red-100/40 to-white dark:from-zinc-800 dark:via-zinc-800/60 dark:to-zinc-900">
            <TH>#</TH>
            <TH>{tableTr.patient || "اسم المريض"}</TH>
            <TH>{tableTr.dateTime || tableTr.date || "تاريخ التحليل"}</TH>
            <TH>{tableTr.status || "الحالة"}</TH>
            <TH>{tableTr.actions || "إجراءات"}</TH>
          </TRow>
        </THead>
        <tbody>
          {analyses.map((analysis, i) => (
            <TRow key={analysis.id} className="hover:bg-yellow-50/40 dark:hover:bg-zinc-800/40">
              <TD className="text-center font-bold">{i + 1}</TD>
              <TD className="text-center">{analysis.patientName}</TD>
              <TD className="text-center">{analysis.date}</TD>
              <TD className="text-center"><AnalysisStatusBadge status={analysis.status} /></TD>
              <TD>
                <div className="flex items-center justify-center gap-2">
                  <Button variant="ghost" className="px-3 py-2 text-blue-700" title={actionsTr.view || "عرض"} onClick={() => onView(analysis)}>{actionsTr.view || "عرض"}</Button>
                  <Button variant="ghost" className="px-3 py-2" title={actionsTr.details || "تفاصيل"} onClick={() => onDetails(analysis)}>{actionsTr.details || "تفاصيل"}</Button>
                  <Button variant="ghost" className="px-3 py-2 text-green-700" title={actionsTr.compare || "مقارنة"} onClick={() => onCompare(analysis)}>{actionsTr.compare || "مقارنة"}</Button>
                </div>
              </TD>
            </TRow>
          ))}
        </tbody>
      </Table>
      <div className="flex items-center justify-end mt-6">
        <Pagination page={page} pageCount={pageCount} onPageChange={onPageChange} />
      </div>
    </div>
  );
}
