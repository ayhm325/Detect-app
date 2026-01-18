import { getTranslations } from "next-intl/server";
import ForgotPasswordForm from "../../components/ForgotPasswordForm";

export async function generateMetadata({ params }) {
  const resolvedParams =
    typeof params?.then === "function" ? await params : params;
  const locale = resolvedParams?.locale || "en";
  const dir = locale === "ar" ? "rtl" : "ltr";
  const t = await getTranslations({ locale, namespace: "meta" });

  return {
    title: t("forgotPassword.title"),
    description: t("forgotPassword.description"),
    openGraph: {
      title: t("forgotPassword.openGraph.title"),
      description: t("forgotPassword.openGraph.description"),
      type: "website",
      locale,
    },
    alternates: {
      canonical: `/${locale}/forgot-password`,
      languages: {
        [locale]: `/${locale}/forgot-password`,
      },
    },
    other: { locale, dir },
  };
}

export default async function ForgotPasswordPage({ params }) {
  const resolvedParams =
    typeof params?.then === "function" ? await params : params;
  const locale = resolvedParams?.locale || "en";
  const dir = locale === "ar" ? "rtl" : "ltr";

  // Render only the client component; locale and dir available as props if needed
  return <ForgotPasswordForm locale={locale} dir={dir} />;
}
