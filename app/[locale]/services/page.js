"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import arServices from "../../locales/ar/services.json";
import enServices from "../../locales/en/services.json";

export default function ServicesPage() {
  const router = useRouter();
  const pathname = usePathname();
  // Detect locale from path
  const locale = pathname.split("/")[1] === "ar" ? "ar" : "en";
  const t = locale === "ar" ? arServices : enServices;
  const services = t.list || [];

  const toggleLocale = () => {
    const newLocale = locale === "ar" ? "en" : "ar";
    const segments = pathname.split("/");
    if (segments[1] === "ar" || segments[1] === "en") {
      segments[1] = newLocale;
    } else {
      segments.splice(1, 0, newLocale);
    }
    router.push(segments.join("/"));
  };

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-900 py-20">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex justify-end mb-4">
          <button
            onClick={toggleLocale}
            className="px-4 py-2 rounded-full bg-gray-200 dark:bg-zinc-800 text-gray-800 dark:text-gray-100 font-semibold shadow hover:bg-gray-300 dark:hover:bg-zinc-700 transition-colors"
            aria-label={locale === "ar" ? "Switch to English" : "التبديل إلى العربية"}
          >
            {locale === "ar" ? "English" : "العربية"}
          </button>
        </div>
        <h1 className="text-4xl font-bold mb-6 text-yellow-600 dark:text-yellow-300 text-center">{t.title}</h1>
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-12 text-center max-w-2xl mx-auto">
          {t.description}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-16">
          {services.map((service, idx) => (
            <div
              key={idx}
              className="bg-yellow-50 dark:bg-zinc-800 rounded-3xl p-10 shadow-2xl flex flex-col items-center text-center hover:scale-105 transition-transform animate-fadeIn min-h-65"
              style={{ minWidth: 0 }}
            >
              {/* يمكنك إضافة أيقونات ثابتة أو حسب idx هنا */}
              <h2 className="text-2xl md:text-3xl font-extrabold mb-4 text-yellow-700 dark:text-yellow-200">{service.name}</h2>
              <p className="text-gray-700 dark:text-gray-200 text-lg md:text-xl font-medium leading-relaxed">{service.desc}</p>
            </div>
          ))}
        </div>
        <div className="flex justify-center">
          <Link
            href="/ar"
            className="inline-block px-6 py-3 rounded-full bg-yellow-500 text-white font-semibold shadow-md hover:bg-yellow-600 transition-colors"
          >
            العودة إلى الرئيسية
          </Link>
        </div>
      </div>
    </div>
  );
}
