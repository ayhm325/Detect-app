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
  const rawPath = headerList.get("x-forwarded-uri") || headerList.get("referer") || "/";
  const locale = rawPath.startsWith("/en") ? "en" : "ar";
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <div
      className="min-h-screen flex items-center justify-center w-full relative bg-cover bg-center"
      style={{
        backgroundImage: 'url(/icons/bluesignup.jpg)',
      }}
      dir={dir}
      lang={locale}
    >
      {/* Gradient overlay (tokenized) */}
      <div className="absolute inset-0 bg-linear-to-br from-(--color-accent-500)/55 to-(--color-primary-500)/55 pointer-events-none" />
      {/* Glassmorphism Form Container */}
      <div className="w-full max-w-lg mx-auto flex flex-col items-center justify-center relative z-10">
        <SignUpForm />
      </div>
      {/* Optional: overlay for better contrast */}
      <div className="absolute inset-0 bg-(--ui-surface)/40 pointer-events-none" />
    </div>
  );
}
