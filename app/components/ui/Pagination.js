import useLocale from "../../hooks/useLocale";
import en from "../../locales/en";
import ar from "../../locales/ar";

export default function Pagination({ page = 1, pageCount = 1, onPageChange }) {
  const { locale } = useLocale();
  const tr = locale === "ar" ? (ar.adminAnalysis || {}) : (en.adminAnalysis || {});
  // يدعم analysisPage.pagination أو analysisSection.pagination أو tr.pagination أو نصوص افتراضية
  const pagTr = (tr && (tr.pagination || tr.analysisPage?.pagination || tr.analysisSection?.pagination)) || {};
  const prevLabel = pagTr.prev || (locale === "ar" ? "السابق" : "Previous");
  const nextLabel = pagTr.next || (locale === "ar" ? "التالي" : "Next");
  const pageLabel = pagTr.pageLabel || (locale === "ar" ? "صفحة" : "Page");
  const ofLabel = pagTr.ofLabel || (locale === "ar" ? "من" : "of");

  const prevDisabled = page <= 1;
  const nextDisabled = page >= pageCount;
  return (
    <div className="mt-4 flex items-center justify-center gap-2">
      <button
        className="h-9 px-3 rounded-md border border-black/10 dark:border-white/20 bg-white dark:bg-zinc-900 disabled:opacity-50"
        disabled={prevDisabled}
        onClick={() => onPageChange?.(Math.max(1, page - 1))}
      >
        {prevLabel}
      </button>
      <span className="mx-2 text-sm">{pageLabel} {page} {ofLabel} {pageCount}</span>
      <button
        className="h-9 px-3 rounded-md border border-black/10 dark:border-white/20 bg-white dark:bg-zinc-900 disabled:opacity-50"
        disabled={nextDisabled}
        onClick={() => onPageChange?.(Math.min(pageCount, page + 1))}
      >
        {nextLabel}
      </button>
    </div>
  );
}
