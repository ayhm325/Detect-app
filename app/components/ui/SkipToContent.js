"use client";

import { useTranslations } from "next-intl";

export default function SkipToContent() {
  const tUi = useTranslations("ui");

  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-100 focus:px-6 focus:py-3 focus:bg-(--ui-info) focus:text-(--ui-info-foreground) focus:rounded-full focus:font-semibold focus:shadow-lg focus:outline-none focus:ring-4 focus:ring-(--ui-ring)/50"
    >
      {tUi("aria.skipToContent")}
    </a>
  );
}
