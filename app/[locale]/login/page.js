import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import LoginForm from "../../components/LoginForm";

export async function generateMetadata() {
  const t = await getTranslations("meta");
  return {
    title: t("login.title"),
    description: t("login.description"),
    openGraph: {
      title: t("login.title"),
      description: t("login.description"),
      type: "website",
    },
  };
}

export default async function LoginPage() {
  const headerList = await headers();
  const rawPath = headerList.get("x-forwarded-uri") || headerList.get("referer") || "/";
  const locale = rawPath.startsWith("/en") ? "en" : "ar";
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <div
      className="min-h-screen flex flex-col md:flex-row w-full bg-(--ui-surface) text-(--ui-foreground)"
      dir={dir}
      lang={locale}
    >
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
