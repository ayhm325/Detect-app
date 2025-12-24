import { headers } from "next/headers";
import Link from "next/link";
import { FaHome } from "react-icons/fa";
import { getTranslations } from "next-intl/server";
import SignUpForm from "../../components/SignUpForm";

export async function generateMetadata() {
  const t = await getTranslations("meta.signup");
  return {
    title: t("title", { defaultValue: "Sign Up" }),
    description: t("description", { defaultValue: "Create your account" }),
    openGraph: {
      title: t("openGraph.title", { defaultValue: "Sign Up" }),
      description: t("openGraph.description", { defaultValue: "Create your account" }),
      type: "website",
    },
  };
}

export default async function SignUpPage() {
  const headerList = await headers();
  const rawPath = headerList.get("x-forwarded-uri") || headerList.get("referer") || "/";
  const locale = rawPath.startsWith("/en") ? "en" : "ar";
  const dir = locale === "ar" ? "rtl" : "ltr";
  const homeHref = locale === "en" ? "/en" : "/ar";
  const authCopy = (await import(`../../locales/${locale}/signup.json`)).default.signup;

  return (
    <div
      className="min-h-screen flex items-center justify-center w-full relative bg-cover bg-center"
      style={{
        backgroundImage: 'linear-gradient(135deg, rgba(30,64,175,0.7) 0%, rgba(59,130,246,0.7) 100%), url(/icons/bluesignup.jpg)',
        backgroundBlendMode: 'overlay',
      }}
      dir={dir}
      lang={locale}
    >
      {/* Glassmorphism Form Container */}
      <div className="w-full max-w-lg mx-auto flex flex-col items-center justify-center relative z-10">
        <SignUpForm />
      </div>
      {/* Optional: overlay for better contrast */}
      <div className="absolute inset-0 bg-white/40 dark:bg-zinc-900/60 pointer-events-none" />
    </div>
  );
}
