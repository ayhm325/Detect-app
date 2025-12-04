import { Geist, Geist_Mono } from "next/font/google";
import Image from "next/image";
import "./globals.css";
import { ThemeProvider } from "./theme-provider";
import SkipToContent from "./components/ui/SkipToContent";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Detect AI - نظام الكشف الذكي عن الأمراض بالذكاء الاصطناعي",
  description: "نظام متطور للكشف عن الأمراض من خلال تحليل الصور الطبية بالذكاء الاصطناعي. دقة عالية، نتائج فورية، خدمة 24/7",
  keywords: ["ذكاء اصطناعي", "تشخيص طبي", "أشعة سينية", "تحليل طبي", "الالتهاب الرئوي", "صحة"],
  authors: [{ name: "Detect AI Team" }],
  creator: "Detect AI",
  publisher: "Detect AI",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "ar_SA",
    alternateLocale: ["en_US"],
    url: "https://detect-ai.com",
    siteName: "Detect AI",
    title: "Detect AI - نظام الكشف الذكي عن الأمراض",
    description: "نظام متطور للكشف عن الأمراض من خلال تحليل الصور الطبية بالذكاء الاصطناعي",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Detect AI - Medical AI Diagnosis",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Detect AI - نظام الكشف الذكي عن الأمراض",
    description: "نظام متطور للكشف عن الأمراض بالذكاء الاصطناعي",
    images: ["/twitter-image.jpg"],
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
  },
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbbf24" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                // force default light and clear any saved preference
                localStorage.removeItem('app-theme');
                const theme = 'light';
                if (theme === 'dark') {
                  document.documentElement.classList.add('dark');
                  document.documentElement.classList.remove('light');
                } else {
                  document.documentElement.classList.add('light');
                  document.documentElement.classList.remove('dark');
                }
                document.documentElement.setAttribute('data-theme', theme);
              })();
            `,
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased relative overflow-x-hidden`}>
        <ThemeProvider>
        <SkipToContent />
        {/* Animated SVG Background */}
        <div className="fixed inset-0 -z-50 w-full h-full pointer-events-none select-none">
          <Image src="/animated-bg.svg" alt="Animated Background" fill className="w-full h-full object-cover" draggable="false" priority />
        </div>
        <main id="main-content">
          {children}
        </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
