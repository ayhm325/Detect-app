// StatusBadge: شارة حالة عامة للاستخدام في جميع أجزاء التطبيق
// يمكنك توسيع الحالات حسب الحاجة
import React from "react";
import { useTranslations } from "next-intl";

const STATUS_MAP = {
  ready: { labelKey: "ready", className: "bg-(--ui-success-bg) text-(--ui-success-foreground) ring-(--ui-success-border)" },
  processing: { labelKey: "processing", className: "bg-(--ui-warning-bg) text-(--ui-warning-foreground) ring-(--ui-warning-border)" },
  reviewed: { labelKey: "reviewed", className: "bg-(--ui-success-bg) text-(--ui-success-foreground) ring-(--ui-success-border)" },
  pending: { labelKey: "pending", className: "bg-(--ui-warning-bg) text-(--ui-warning-foreground) ring-(--ui-warning-border)" },
  confirmed: { labelKey: "confirmed", className: "bg-(--ui-success-bg) text-(--ui-success-foreground) ring-(--ui-success-border)" },
  online: { labelKey: "online", className: "bg-(--ui-success-bg) text-(--ui-success-foreground) ring-(--ui-success-border)" },
  offline: { labelKey: "offline", className: "bg-(--ui-surface-2) text-(--ui-muted-foreground) ring-(--ui-border)" },
  // add more statuses as needed
};

export default function StatusBadge({ status, t }) {
  const ui = useTranslations("ui");
  const placeholder = ui("placeholder");

  const defaultFallback = { labelKey: null, className: "bg-(--ui-surface-2) text-(--ui-muted-foreground) ring-(--ui-border)" };
  const { labelKey, className } = STATUS_MAP[status] || defaultFallback;
  const display = labelKey
    ? (typeof t === "function" ? t(labelKey) : ui(`status.${labelKey}`))
    : placeholder;
  return (
    <span className={`inline-flex rounded-md px-2.5 py-1 text-sm ring-1 ring-inset ${className}`}>
      {display}
    </span>
  );
}
