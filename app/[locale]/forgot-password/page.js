
import { headers } from "next/headers";
import ForgotPasswordForm from "../../components/ForgotPasswordForm";

export const metadata = {
  title: "Reset Password - Detect AI",
  description: "Reset your password to access your Detect AI account",
  openGraph: {
    title: "Reset Password - Detect AI",
    description: "Reset your password to access your Detect AI account",
    type: "website",
  },
};

export default async function ForgotPasswordPage() {
  const headerList = await headers();
  const rawPath = headerList.get("x-forwarded-uri") || headerList.get("referer") || "/";
  const locale = rawPath.startsWith("/en") ? "en" : "ar";
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
      <div className="bg-white/80 dark:bg-zinc-900/80 rounded-2xl shadow-lg p-8 w-full max-w-md flex items-center justify-center" style={{margin: 0}}>
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
