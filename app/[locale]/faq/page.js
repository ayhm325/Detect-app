
export const dynamicParams = true;

import { getTranslations } from "next-intl/server";
import LanguageToggle from "../../../components/ui/LanguageToggle";
import React from "react";

export async function generateMetadata() {
  const t = await getTranslations("meta.faq");
  return {
    title: t("title"),
    description: t("description"),
    openGraph: {
      title: t("title"),
      description: t("description"),
      type: "website",
    },
  };
}

export default async function FAQPage(props) {
  const params = props.params ? (typeof props.params.then === 'function' ? await props.params : props.params) : {};
  const locale = params?.locale || "ar";
  const dir = locale === "ar" ? "rtl" : "ltr";
  const faqData = (await import(`../../locales/${locale}/faq.json`)).default;
  const t = faqData;
  const faqs = t.categories || [];

  function buildPath(targetLocale, path = "/") {
    const cleanPath = path.replace(/^\/(en|ar)/, "");
    const normalized = cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`;
    return `/${targetLocale}${normalized}`;
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-yellow-50 via-white to-red-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 py-20" dir={dir} lang={locale}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Language toggle at the very top */}
        <div className="flex justify-end mb-8">
          <LanguageToggle currentLocale={locale} />
        </div>
        {/* Header */}
        <div className="text-center mb-16 animate-fadeIn">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-linear-to-r from-yellow-600 to-red-600 bg-clip-text text-transparent">
              {t.title || "الأسئلة الشائعة"}
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {t.description || "إجابات على أكثر الأسئلة شيوعاً حول Detect AI"}
          </p>
        </div>

        {/* Back to Home Button */}
        <div className="mt-10 text-center">
          <a
            href={buildPath(locale, "/")}
            className="inline-block px-8 py-4 bg-red-600 text-white font-bold rounded-full hover:bg-red-700 transition-colors shadow-lg"
          >
            {locale === "ar" ? "عودة إلى الرئيسية" : "Back to Home"}
          </a>
        </div>

        {/* FAQ Categories */}
        <div className="space-y-12">
          {faqs.map((category, catIdx) => (
            <div key={catIdx} className="animate-slideUp" style={{ animationDelay: `${catIdx * 0.1}s` }}>
              <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-3">
                <span className="w-2 h-8 bg-linear-to-b from-yellow-500 to-red-500 rounded-full"></span>
                {category.category}
              </h2>
              <div className="space-y-4">
                {category.questions.map((faq, qIdx) => (
                  <details 
                    key={qIdx}
                    className="group bg-white dark:bg-zinc-900 rounded-2xl shadow-lg overflow-hidden transition-all hover:shadow-xl"
                  >
                    <summary className="cursor-pointer p-6 flex justify-between items-center text-lg font-semibold text-gray-900 dark:text-white list-none">
                      <span>{faq.q}</span>
                      <svg 
                        className="w-6 h-6 text-gray-400 transition-transform group-open:rotate-180" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </summary>
                    <div className="px-6 pb-6">
                      <p className="text-gray-600 dark:text-gray-400 leading-relaxed border-t border-gray-200 dark:border-zinc-800 pt-4">
                        {faq.a}
                      </p>
                    </div>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Still have questions */}
        <div className="mt-16 bg-linear-to-r from-yellow-500 to-red-500 rounded-3xl p-12 text-center text-white animate-fadeIn">
          <h3 className="text-3xl font-bold mb-4">{t.ctaTitle || "لم تجد إجابة لسؤالك؟"}</h3>
          <p className="text-xl mb-8 opacity-90">{t.ctaSubtitle || "تواصل معنا وسنكون سعداء بمساعدتك"}</p>
          <a 
            href={buildPath(locale, "/contact")}
            className="inline-block px-8 py-4 bg-white text-red-600 font-bold rounded-full hover:bg-gray-100 transition-colors shadow-lg"
          >
            {t.ctaButton || "اتصل بنا"}
          </a>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-linear-to-br from-yellow-50 via-white to-red-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 py-20" dir={dir} lang={locale}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Language toggle at the very top */}
        <div className="flex justify-end mb-8">
          <LanguageToggle currentLocale={locale} />
        </div>
        {/* Header */}
        <div className="text-center mb-16 animate-fadeIn">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-linear-to-r from-yellow-600 to-red-600 bg-clip-text text-transparent">
              {t.title || "الأسئلة الشائعة"}
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {t.description || "إجابات على أكثر الأسئلة شيوعاً حول Detect AI"}
          </p>
        </div>

        {/* Back to Home Button */}
        <div className="mt-10 text-center">
          <a
            href={buildPath(locale, "/")}
            className="inline-block px-8 py-4 bg-red-600 text-white font-bold rounded-full hover:bg-red-700 transition-colors shadow-lg"
          >
            {locale === "ar" ? "عودة إلى الرئيسية" : "Back to Home"}
          </a>
        </div>

        {/* FAQ Categories */}
        <div className="space-y-12">
          {faqs.map((category, catIdx) => (
            <div key={catIdx} className="animate-slideUp" style={{ animationDelay: `${catIdx * 0.1}s` }}>
              <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-3">
                <span className="w-2 h-8 bg-linear-to-b from-yellow-500 to-red-500 rounded-full"></span>
                {category.category}
              </h2>
              <div className="space-y-4">
                {category.questions.map((faq, qIdx) => (
                  <details 
                    key={qIdx}
                    className="group bg-white dark:bg-zinc-900 rounded-2xl shadow-lg overflow-hidden transition-all hover:shadow-xl"
                  >
                    <summary className="cursor-pointer p-6 flex justify-between items-center text-lg font-semibold text-gray-900 dark:text-white list-none">
                      <span>{faq.q}</span>
                      <svg 
                        className="w-6 h-6 text-gray-400 transition-transform group-open:rotate-180" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </summary>
                    <div className="px-6 pb-6">
                      <p className="text-gray-600 dark:text-gray-400 leading-relaxed border-t border-gray-200 dark:border-zinc-800 pt-4">
                        {faq.a}
                      </p>
                    </div>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Still have questions */}
        <div className="mt-16 bg-linear-to-r from-yellow-500 to-red-500 rounded-3xl p-12 text-center text-white animate-fadeIn">
          <h3 className="text-3xl font-bold mb-4">{t.ctaTitle || "لم تجد إجابة لسؤالك؟"}</h3>
          <p className="text-xl mb-8 opacity-90">{t.ctaSubtitle || "تواصل معنا وسنكون سعداء بمساعدتك"}</p>
          <a 
            href={buildPath(locale, "/contact")}
            className="inline-block px-8 py-4 bg-white text-red-600 font-bold rounded-full hover:bg-gray-100 transition-colors shadow-lg"
          >
            {t.ctaButton || "اتصل بنا"}
          </a>
        </div>
      </div>
    </div>
  );
}
