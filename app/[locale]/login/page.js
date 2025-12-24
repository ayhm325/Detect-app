import { headers } from "next/headers";
import Link from "next/link";
import { FaHome } from "react-icons/fa";
import { getTranslations } from "next-intl/server";
import LoginForm from "../../components/LoginForm";

export async function generateMetadata() {
  const t = await getTranslations("meta.login");
  return {
    title: t("title"),
    description: t("description"),
    openGraph: {
      title: t("title"),
      description: t("description"),
      type: "website",
    },
  };
}

export default async function LoginPage() {
  const headerList = await headers();
  const rawPath = headerList.get("x-forwarded-uri") || headerList.get("referer") || "/";
  const locale = rawPath.startsWith("/en") ? "en" : "ar";
  const dir = locale === "ar" ? "rtl" : "ltr";
  const homeHref = locale === "en" ? "/en" : "/ar";
  const authCopy = (await import(`../../locales/${locale}/auth.json`)).default.auth;

  return (
    <div className="min-h-screen flex flex-col md:flex-row w-full bg-linear-to-br from-yellow-50 via-white to-red-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950" dir={dir} lang={locale}>
      {/* Removed LoginSide (decor) */}
      <div className="w-full md:w-1/2 h-72 md:h-auto order-2 md:order-1 flex items-stretch justify-center relative p-4">
        {/* زر العودة للرئيسية تم حذفه */}
      </div>
      <div className="w-full md:w-1/2 h-auto order-1 md:order-2 flex items-center justify-center p-4">
        <LoginForm />
      </div>
    </div>
  );
}
