"use client";

import { useCallback } from "react";
import { useLocale as useIntlLocale, useMessages } from "next-intl";
import { usePathname, useRouter } from "next/navigation";

/**
 * هوك لإدارة اللغة الحالية وتبديلها ضمن التطبيق
 */
export default function useLocale() {
  const locale = useIntlLocale(); // اللغة الحالية من next-intl
  const dir = locale === "ar" ? "rtl" : "ltr"; // اتجاه النص
  const messages = useMessages(); // رسائل الترجمة
  const pathname = usePathname() || "/"; // المسار الحالي
  const router = useRouter(); // أداة التنقل

  /**
   * ابني مسار جديد بناءً على اللغة المستهدفة
   * @param {"en"|"ar"} targetLocale
   * @param {string} [path] اختياري: مسار محدد لتغييره بدل المسار الحالي
   */
  const buildPath = useCallback(
    (targetLocale, path) => {
      const effectivePath = path ?? pathname;

      // إزالة أي بادئة لغة موجودة مسبقًا (en أو ar)
      const cleanPath = effectivePath.replace(/^\/(en|ar)/, "");

      // التأكد من أن المسار يبدأ بـ "/"
      const normalized = cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`;

      // إعادة بناء المسار بالبادئة الجديدة للغة
      return `/${targetLocale}${normalized}`;
    },
    [pathname]
  );

  /**
   * تبديل اللغة الحالية إلى اللغة الأخرى
   */
  const switchLocale = useCallback(() => {
    const nextLocale = locale === "en" ? "ar" : "en";
    const newPath = buildPath(nextLocale); // بناء المسار الجديد
    router.replace(newPath); // الانتقال إلى المسار الجديد دون إضافة تاريخ للتصفح
  }, [locale, router, buildPath]);

  return {
    locale,       // اللغة الحالية
    dir,          // اتجاه النص (rtl / ltr)
    isRTL: dir === "rtl", // قيمة منطقية للتحقق من الاتجاه
    t: messages,  // رسائل الترجمة
    switchLocale, // دالة لتبديل اللغة
    buildPath,    // دالة لبناء مسار جديد بلغة معينة
  };
}
