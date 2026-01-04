"use client";

import { useLocale, useTranslations } from "next-intl";

export default function Pagination({ page = 1, pageCount = 1, onPageChange }) {
  useLocale(); // Ensure component updates when locale changes
  const t = useTranslations("ui");

  const prevLabel = t("pagination.previous");
  const nextLabel = t("pagination.next");
  const pageLabel = t("pagination.page");
  const ofLabel = t("pagination.of");

  const prevDisabled = page <= 1;
  const nextDisabled = page >= pageCount;
  return (
    <div className="mt-4 flex items-center justify-center gap-2">
      <button
        className="h-9 px-3 rounded-md border border-(--ui-border) bg-(--ui-surface) text-(--ui-foreground) hover:bg-(--ui-surface-2) disabled:opacity-50"
        disabled={prevDisabled}
        onClick={() => onPageChange?.(Math.max(1, page - 1))}
      >
        {prevLabel}
      </button>
      <span className="mx-2 text-sm text-(--ui-muted-foreground)">{pageLabel} {page} {ofLabel} {pageCount}</span>
      <button
        className="h-9 px-3 rounded-md border border-(--ui-border) bg-(--ui-surface) text-(--ui-foreground) hover:bg-(--ui-surface-2) disabled:opacity-50"
        disabled={nextDisabled}
        onClick={() => onPageChange?.(Math.min(pageCount, page + 1))}
      >
        {nextLabel}
      </button>
    </div>
  );
}
