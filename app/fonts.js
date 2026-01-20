// استيراد خطوط Geist من Google Fonts باستخدام Next.js
import { Geist, Geist_Mono } from "next/font/google";

/**
 * خط Sans عصري للاستخدام العام
 * - يُخزن في CSS variable لسهولة الاستخدام عبر Tailwind أو CSS عادي
 * - subsets: latin لضمان دعم الحروف اللاتينية
 */
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

/**
 * خط Mono أحادي المسافات لاستخدام الكود أو النصوص التقنية
 * - يُخزن في CSS variable لسهولة التطبيق على عناصر محددة
 * - subsets: latin لضمان دعم الحروف اللاتينية
 */
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// تصدير الخطوط لاستخدامها في أي مكون أو صفحة
export { geistSans, geistMono };
