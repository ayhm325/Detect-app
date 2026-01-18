import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import SignUpForm from "../../components/SignUpForm";

export async function generateMetadata() {
  const t = await getTranslations("meta.signup");
  return {
    title: t("title"),
    description: t("description"),
    openGraph: {
      title: t("openGraph.title"),
      description: t("openGraph.description"),
      type: "website",
    },
  };
}

export default async function SignUpPage() {
  const headerList = await headers();
  const rawPath =
    headerList.get("x-forwarded-uri") || headerList.get("referer") || "/";
  const locale = rawPath.startsWith("/en") ? "en" : "ar";
  const dir = locale === "ar" ? "rtl" : "ltr";
  return (
    <div dir={dir} lang={locale}>
      <SignUpForm />
    </div>
  );
}
