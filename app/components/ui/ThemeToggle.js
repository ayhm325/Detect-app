"use client";

import { useTheme } from "@/app/theme-provider";
import { useTranslations } from "next-intl";

export default function ThemeToggle({ className = "" }) {
  const { theme, setTheme } = useTheme();
  const dark = theme === "dark";
  const t = useTranslations("theme");

  return (
    <button
      type="button"
      aria-label={dark ? t("aria.switchToLight") : t("aria.switchToDark")}
      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 transition-colors ${
        dark
          ? "bg-(--ui-surface) text-(--ui-foreground) border border-(--ui-border)"
          : "bg-(--ui-surface-2) text-(--ui-foreground) border border-(--ui-border)"
      } ${className}`}
      onClick={() => setTheme(dark ? "light" : "dark")}
    >
      <span className="font-semibold">{dark ? t("mode.dark") : t("mode.light")}</span>
    </button>
  );
}
