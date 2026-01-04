import { getTranslations } from "next-intl/server";
import ForgotPasswordForm from "../../components/ForgotPasswordForm";

export async function generateMetadata({ params }) {
  const locale = params?.locale;
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    title: t("forgotPassword.title"),
    description: t("forgotPassword.description"),
    openGraph: {
      title: t("forgotPassword.openGraph.title"),
      description: t("forgotPassword.openGraph.description"),
      type: "website",
    },
  };
}

export default async function ForgotPasswordPage({ params }) {
  const locale = params?.locale;
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center no-scrollbar"
      dir={dir}
      lang={locale}
      style={{
        backgroundImage: 'url(/icons/forgot.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div className="card-glass rounded-2xl p-8 w-full max-w-md flex items-center justify-center" style={{margin: 0}}>
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
