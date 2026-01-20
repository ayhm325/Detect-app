"use client";

import { useContext } from "react";
import { LocaleContext } from "../contexts/LocaleContext";

/**
 * هوك لاستهلاك سياق اللغة (LocaleContext)
 * يجب استخدام هذا الهوك داخل `<LocaleProvider>`
 */
export function useLocaleContext() {
  const context = useContext(LocaleContext);

  // تحقق من أن الهوك يُستخدم ضمن مزوّد السياق
  if (!context) {
    throw new Error(
      "useLocaleContext must be used within a LocaleProvider"
    );
  }

  // إرجاع قيمة السياق: { locale, toggleLocale, setLocale }
  return context;
}
