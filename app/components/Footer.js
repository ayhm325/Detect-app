"use client";
import Image from "next/image";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

export default function Footer() {
  const locale = useLocale();
  const t = useTranslations('footer');
  const year = new Date().getFullYear();

  const withLocale = (path) => {
    const base = path.startsWith("/") ? path : `/${path}`;
    if (base.startsWith("/en") || base.startsWith("/ar")) return base;
    return `/${locale}${base === "/" ? "" : base}`;
  };

  const homeHref = withLocale("/");

  // ضمان أن quickLinks و supportLinks دائمًا مصفوفة
  const quickLinks = [
    { label: t("home", { defaultValue: locale === "en" ? "Home" : "الرئيسية" }), href: "/" },
    { label: locale === "en" ? "About" : "من نحن", href: "/about" },
    { label: locale === "en" ? "Services" : "الخدمات", href: "/services" },
    { label: locale === "en" ? "Blog" : "المدونة", href: "/blog" },
  ];

  const supportLinks = [
    { label: locale === "en" ? "FAQ" : "الأسئلة الشائعة", href: "/faq" },
    { label: t("contactPage.title", { defaultValue: locale === "en" ? "Contact" : "اتصل بنا" }), href: "/contact" },
    { label: t("privacyPage.title", { defaultValue: locale === "en" ? "Privacy" : "سياسة الخصوصية" }), href: "/privacy" },
    { label: t("termsPage.title", { defaultValue: locale === "en" ? "Terms" : "الشروط والأحكام" }), href: "/terms" },
  ];

  return (
    <footer className="relative w-full bg-zinc-900 dark:bg-zinc-950 text-white overflow-hidden">
      {/* Top Gradient Line */}
      <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-yellow-400 via-red-400 to-red-600" />

      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(45deg, rgba(251, 191, 36, 0.1) 25%, transparent 25%),
              linear-gradient(-45deg, rgba(239, 68, 68, 0.1) 25%, transparent 25%),
              linear-gradient(45deg, transparent 75%, rgba(251, 191, 36, 0.1) 75%),
              linear-gradient(-45deg, transparent 75%, rgba(239, 68, 68, 0.1) 75%)
            `,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <Link href={homeHref} className="inline-flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-linear-to-br from-yellow-400 to-red-600 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
                <div className="relative w-12 h-12 bg-linear-to-br from-yellow-400 to-red-600 rounded-xl flex items-center justify-center">
                  <span className="text-3xl" aria-label="Lung icon">🫁</span>
                </div>
              </div>
              <span className="text-2xl font-black bg-linear-to-r from-yellow-400 to-red-600 bg-clip-text text-transparent">
                {t("brand", { defaultValue: "Detect AI" })}
              </span>
            </Link>
            <p className="text-sm text-zinc-400 leading-relaxed">
              {t("footer.description", {
                defaultValue: "نظام متطور للتشخيص الطبي بالذكاء الاصطناعي. نوفر لك أدق النتائج بأسرع وقت ممكن.",
              })}
            </p>
            <div className="flex gap-3">
              {[
                { icon: "📘", label: "Facebook" },
                { icon: "🐦", label: "Twitter" },
                { icon: "📷", label: "Instagram" },
                { icon: "💼", label: "LinkedIn" },
              ].map((social, i) => (
                <button
                  key={i}
                  className="w-10 h-10 rounded-lg bg-zinc-800 hover:bg-linear-to-br hover:from-yellow-500 hover:to-red-600 flex items-center justify-center transform hover:scale-110 transition-all duration-300"
                  aria-label={social.label}
                >
                  <span className="text-xl">{social.icon}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-white">
              {t("quickLinksHeading", { defaultValue: locale === "en" ? "Quick Links" : "روابط سريعة" })}
            </h3>
            <ul className="space-y-2">
              {quickLinks.map((link, i) => (
                <li key={i}>
                  <Link
                    href={withLocale(link.href)}
                    className="text-zinc-400 hover:text-yellow-400 transition-colors duration-300 text-sm flex items-center gap-2 group"
                  >
                    <span className="w-0 h-0.5 bg-yellow-400 group-hover:w-4 transition-all duration-300" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-white">
              {t("supportHeading", { defaultValue: locale === "en" ? "Support" : "الدعم" })}
            </h3>
            <ul className="space-y-2">
              {supportLinks.map((link, i) => (
                <li key={i}>
                  <Link
                    href={withLocale(link.href)}
                    className="text-zinc-400 hover:text-red-400 transition-colors duration-300 text-sm flex items-center gap-2 group"
                  >
                    <span className="w-0 h-0.5 bg-red-400 group-hover:w-4 transition-all duration-300" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-white">
              {t("contactHeading", { defaultValue: locale === "en" ? "Contact" : "تواصل معنا" })}
            </h3>
            <ul className="space-y-3 text-sm text-zinc-400">
              <li className="flex items-start gap-3">
                <span className="text-xl">📧</span>
                <div>
                  <div className="text-white font-semibold mb-1">
                    {t("footer.contact.emailLabel", { defaultValue: "البريد الإلكتروني" })}
                  </div>
                  <a href="mailto:info@detect-ai.com" className="hover:text-yellow-400 transition-colors">
                    info@detect-ai.com
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-xl">📱</span>
                <div>
                  <div className="text-white font-semibold mb-1">
                    {t("footer.contact.phoneLabel", { defaultValue: "الهاتف" })}
                  </div>
                  <a href="tel:+966123456789" className="hover:text-yellow-400 transition-colors" dir="ltr">
                    +966 12 345 6789
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-xl">📍</span>
                <div>
                  <div className="text-white font-semibold mb-1">
                    {t("footer.contact.addressLabel", { defaultValue: "العنوان" })}
                  </div>
                  <p>{t("footer.contact.address", { defaultValue: "أربد، المملكة الأردنية الهاشمية" })}</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-zinc-800">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-zinc-500">
            <div className="flex items-center gap-2">
              <span>
                {t("footer.copyright", { defaultValue: `© ${year} جميع الحقوق محفوظة`, year })}
              </span>
              <span className="hidden sm:inline">•</span>
              <span className="text-yellow-400 font-semibold">PneumoDetect</span>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span>{t("footer.serviceStatus", { defaultValue: "الخدمة متاحة" })}</span>
              </div>
              <div className="text-zinc-400">{t("footer.madeIn", { defaultValue: "Made with ❤️ in Irbed" })}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 w-full h-px bg-linear-to-r from-transparent via-yellow-500/50 to-transparent" />
    </footer>
  );
}
