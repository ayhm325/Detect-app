
"use client";
import { useTranslations, useLocale } from "next-intl";
import aboutEn from "../../app/locales/en/about.json";
import aboutAr from "../../app/locales/ar/about.json";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function AboutPageClient() {
  const t = useTranslations("about");
  const ui = useTranslations("ui");
  const locale = useLocale();
  const dir = locale === "ar" ? "rtl" : "ltr";
  let values = locale === "ar" ? aboutAr.valuesList : aboutEn.valuesList;
  let stats = locale === "ar" ? aboutAr.stats : aboutEn.stats;
  let techList = locale === "ar" ? aboutAr.techList : aboutEn.techList;

  const router = useRouter();
  const pathname = usePathname();
  // Helper to switch locale in the URL
  const toggleLocale = () => {
    const newLocale = locale === "ar" ? "en" : "ar";
    // Replace the first segment (locale) in the path
    const segments = pathname.split("/");
    if (segments[1] === "ar" || segments[1] === "en") {
      segments[1] = newLocale;
    } else {
      segments.splice(1, 0, newLocale);
    }
    router.push(segments.join("/"));
  };

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950" dir={dir} lang={locale}>
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex justify-end mb-4">
            <button
              onClick={toggleLocale}
              className="px-4 py-2 rounded-full bg-gray-200 dark:bg-zinc-800 text-gray-800 dark:text-gray-100 font-semibold shadow hover:bg-gray-300 dark:hover:bg-zinc-700 transition-colors"
              aria-label={locale === "ar" ? ui("language.switchToEnglish") : ui("language.switchToArabic")}
            >
              {locale === "ar" ? ui("language.english") : ui("language.arabic")}
            </button>
          </div>
          <h1 className="text-4xl font-bold text-center mb-4">
            {t("title")}
          </h1>
          <p className="text-center text-gray-600 dark:text-gray-300 mb-10">
            {t("description")}
          </p>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-yellow-50 dark:bg-zinc-900 rounded-2xl p-6 shadow">
              <h2 className="text-2xl font-bold mb-2 text-yellow-700 dark:text-yellow-300">{t("visionTitle")}</h2>
              <p className="text-gray-700 dark:text-gray-200">{t("visionDesc")}</p>
            </div>
            <div className="bg-red-50 dark:bg-zinc-900 rounded-2xl p-6 shadow">
              <h2 className="text-2xl font-bold mb-2 text-red-700 dark:text-red-300">{t("missionTitle")}</h2>
              <p className="text-gray-700 dark:text-gray-200">{t("missionDesc")}</p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-center mb-6">{t("valuesTitle")}</h2>
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {values.map((value, idx) => (
              <div key={idx} className="bg-white dark:bg-zinc-800 rounded-xl p-4 shadow text-center">
                <div className="font-semibold text-lg mb-2">{value.title}</div>
                <div className="text-gray-600 dark:text-gray-300 text-sm">{value.desc}</div>
              </div>
            ))}
          </div>

          <h2 className="text-2xl font-bold text-center mb-6">{t("techTitle")}</h2>
          <p className="text-center text-gray-600 dark:text-gray-300 mb-6">{t("techDesc")}</p>
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {techList.map((tech, idx) => (
              <span key={idx} className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-4 py-2 rounded-full text-sm font-medium shadow">
                {tech}
              </span>
            ))}
          </div>

          <h2 className="text-2xl font-bold text-center mb-6">{t("statsTitle")}</h2>
          <div className="flex flex-wrap justify-center gap-6 mb-10">
            {stats.map((stat, idx) => (
              <div key={idx} className="bg-yellow-50 dark:bg-zinc-900 rounded-xl p-4 shadow text-center min-w-25">
                <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300 mb-1">{stat.num}</div>
                <div className="text-gray-700 dark:text-gray-200 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="flex justify-center mt-8">
            <Link href={`/${locale}`} className="px-6 py-2 rounded-full bg-yellow-500 text-white font-semibold shadow hover:bg-yellow-600 transition-colors">
              {t("backToHome")}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
