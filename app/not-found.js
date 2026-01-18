import { headers } from "next/headers";

export default async function NotFound() {
  const headerList = await headers();
  const rawPath =
    headerList.get("x-forwarded-uri") || headerList.get("referer") || "/";
  const locale = rawPath.startsWith("/en") ? "en" : "ar";
  const dir = locale === "ar" ? "rtl" : "ltr";
  const t = (await import(`./locales/${locale}/notFound.json`)).default;

  return (
    <div
      className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4"
      dir={dir}
      lang={locale}
    >
      <h1 className="text-5xl font-extrabold text-(--ui-danger)">404</h1>
      <p className="mt-3 text-2xl text-(--ui-muted-2)">{t.message}</p>
    </div>
  );
}
