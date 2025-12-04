
"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import translations from "../lib/translations";

export default function Footer() {
  const pathname = usePathname();
  const currentLocale = pathname.startsWith("/en") ? "en" : "ar";
  const t = translations[currentLocale];
  const year = new Date().getFullYear();

  return (
    <footer className="relative w-full bg-zinc-900 dark:bg-zinc-950 text-white overflow-hidden">
      {/* Top Gradient Line */}
      <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-yellow-400 via-red-400 to-red-600" />

      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(45deg, rgba(251, 191, 36, 0.1) 25%, transparent 25%),
            linear-gradient(-45deg, rgba(239, 68, 68, 0.1) 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, rgba(251, 191, 36, 0.1) 75%),
            linear-gradient(-45deg, transparent 75%, rgba(239, 68, 68, 0.1) 75%)
          `,
          backgroundSize: '40px 40px',
        }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Main Footer Content */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <Link href="/ar" className="inline-flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-linear-to-br from-yellow-400 to-red-600 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
                <div className="relative w-12 h-12 bg-linear-to-br from-yellow-400 to-red-600 rounded-xl flex items-center justify-center">
                  <Image src="/icons/ai.svg" alt="Logo" width={28} height={28} />
                </div>
              </div>
              <span className="text-2xl font-black bg-linear-to-r from-yellow-400 to-red-600 bg-clip-text text-transparent">
                {t.brand || "Detect AI"}
              </span>
            </Link>
            <p className="text-sm text-zinc-400 leading-relaxed">
              نظام متطور للتشخيص الطبي بالذكاء الاصطناعي. نوفر لك أدق النتائج بأسرع وقت ممكن.
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
            <h3 className="text-lg font-bold mb-4 text-white">روابط سريعة</h3>
            <ul className="space-y-2">
              {[
                { label: t.home || "الرئيسية", href: "/ar" },
                { label: "من نحن", href: "/about" },
                { label: "الخدمات", href: "/services" },
                { label: "المدونة", href: "/blog" },
              ].map((link, i) => (
                <li key={i}>
                  <Link 
                    href={link.href}
                    className="text-zinc-400 hover:text-yellow-400 transition-colors duration-300 text-sm flex items-center gap-2 group"
                  >
                    <span className="w-0 h-0.5 bg-yellow-400 group-hover:w-4 transition-all duration-300" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-white">الدعم</h3>
            <ul className="space-y-2">
              {[
                { label: "الأسئلة الشائعة", href: "/faq" },
                { label: t.contact || "اتصل بنا", href: "/contact" },
                { label: t.privacy || "سياسة الخصوصية", href: "/privacy" },
                { label: t.terms || "الشروط والأحكام", href: "/terms" },
              ].map((link, i) => (
                <li key={i}>
                  <Link 
                    href={link.href}
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
            <h3 className="text-lg font-bold mb-4 text-white">تواصل معنا</h3>
            <ul className="space-y-3 text-sm text-zinc-400">
              <li className="flex items-start gap-3">
                <span className="text-xl">📧</span>
                <div>
                  <div className="text-white font-semibold mb-1">البريد الإلكتروني</div>
                  <a href="mailto:info@detect-ai.com" className="hover:text-yellow-400 transition-colors">
                    info@detect-ai.com
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-xl">📱</span>
                <div>
                  <div className="text-white font-semibold mb-1">الهاتف</div>
                  <a href="tel:+966123456789" className="hover:text-yellow-400 transition-colors" dir="ltr">
                    +966 12 345 6789
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-xl">📍</span>
                <div>
                  <div className="text-white font-semibold mb-1">العنوان</div>
                  <p>أربد، المملكة الأردنية الهاشمية</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-zinc-800">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-zinc-500">
            <div className="flex items-center gap-2">
              <span>{t.copyright?.(year) || `© ${year} جميع الحقوق محفوظة`}</span>
              <span className="hidden sm:inline">•</span>
              <span className="text-yellow-400 font-semibold">PneumoDetect</span>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span>الخدمة متاحة</span>
              </div>
              <div className="text-zinc-400">
                Made with ❤️ in Saudi Arabia
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 w-full h-px bg-linear-to-r from-transparent via-yellow-500/50 to-transparent" />
    </footer>
  );
}
