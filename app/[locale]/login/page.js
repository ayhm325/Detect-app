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
    <div dir={dir} lang={locale}>
      <LoginForm />
    </div>
  );
}
