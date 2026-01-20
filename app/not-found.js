import { headers } from "next/headers";

export default async function NotFound() {
  // جلب رؤوس الطلب لمعرفة المسار الحالي
  const headerList = await headers();
  const rawPath =
    headerList.get("x-forwarded-uri") || headerList.get("referer") || "/";

  // تحديد اللغة اعتمادًا على المسار
  const locale = rawPath.startsWith("/en") ? "en" : "ar";
  const dir = locale === "ar" ? "rtl" : "ltr";

  // استيراد الترجمات الخاصة باللغة الحالية
  const t = (await import(`./locales/${locale}/notFound.json`)).default;

  return (
    <div
      className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4"
      dir={dir} // ضبط اتجاه النص (rtl أو ltr)
      lang={locale} // تعيين لغة الصفحة
    >
      {/* رمز الخطأ */}
      <h1 className="text-5xl font-extrabold text-(--ui-danger)">404</h1>

      {/* رسالة الخطأ من ملف الترجمات */}
      <p className="mt-3 text-2xl text-(--ui-muted-2)">{t.message}</p>
    </div>
  );
}
