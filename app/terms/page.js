import { headers } from "next/headers";
import { useLocale, useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";

// Localized metadata for Terms
export async function generateMetadata() {
  const headerList = await headers();
  const rawPath = headerList.get("x-forwarded-uri") || headerList.get("referer") || "/";
  const locale = rawPath.startsWith("/en") ? "en" : "ar";
  const t = await getTranslations({ locale, namespace: "termsPage" });
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: `${base}/en/terms`,
      languages: {
        en: `${base}/en/terms`,
        ar: `${base}/ar/terms`,
      },
    },
    openGraph: {
      title: t("title"),
      description: t("description"),
      url: `${base}/${locale}/terms`,
      type: "article",
    },
  };
}

export default function TermsPage() {
  const locale = useLocale();
  const dir = locale === "ar" ? "rtl" : "ltr";
  const t = useTranslations("termsPage");
  const tp = t.raw ? t.raw() : {};

  return (
    <div className="min-h-screen bg-(--ui-surface) text-(--ui-foreground) py-20" dir={dir} lang={locale}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 animate-fadeIn">
          <h1 className="text-5xl font-bold mb-6">
            <span className="brand-gradient-text">
              {t("title")}
            </span>
          </h1>
          <p className="text-lg text-(--ui-muted-foreground)">
              {t("lastUpdate")}: {new Date().toLocaleDateString(locale === "en" ? "en-US" : "ar-EG")}
          </p>
        </div>

        {/* Content */}
        <div className="card-glass rounded-3xl p-8 md:p-12 shadow-2xl animate-slideUp">
          <div className="prose prose-lg max-w-none space-y-8 prose-headings:text-(--ui-foreground) prose-p:text-(--ui-muted-foreground) prose-li:text-(--ui-muted-foreground)">
            {/* Section 1 */}
            <section>
              <h2 className="text-3xl font-bold mb-4 text-(--ui-foreground)">{t("acceptance.heading")}</h2>
              <p className="text-(--ui-muted-foreground) leading-relaxed">
                {t("acceptance.content")}
              </p>
            </section>

            {/* Section 2 */}
            <section>
              <h2 className="text-3xl font-bold mb-4 text-(--ui-foreground)">{t("serviceDescription.heading")}</h2>
              <p className="text-(--ui-muted-foreground) leading-relaxed mb-4">
                {t("serviceDescription.intro")}
              </p>
              <ul className="list-disc pr-6 space-y-2 text-(--ui-muted-foreground)">
                {(tp.serviceDescription?.items || []).map((item, idx) => <li key={idx}>{item}</li>)}
              </ul>
            </section>

            {/* Section 3 */}
            <section>
              <h2 className="text-3xl font-bold mb-4 text-(--ui-foreground)">{t("registration.heading")}</h2>
              <p className="text-(--ui-muted-foreground) leading-relaxed mb-4">
                {t("registration.intro")}
              </p>
              <ul className="list-disc pr-6 space-y-2 text-(--ui-muted-foreground)">
                {(tp.registration?.items || []).map((item, idx) => <li key={idx}>{item}</li>)}
              </ul>
            </section>

            {/* Section 4 */}
            <section>
              <h2 className="text-3xl font-bold mb-4 text-(--ui-foreground)">{t("serviceUsage.heading")}</h2>
              <h3 className="text-xl font-semibold text-(--ui-foreground) mb-3">{t("serviceUsage.allowed.title")}</h3>
              <ul className="list-disc pr-6 space-y-2 text-(--ui-muted-foreground) mb-6">
                {(tp.serviceUsage?.allowed?.items || []).map((item, idx) => <li key={idx}>{item}</li>)}
              </ul>
              <h3 className="text-xl font-semibold text-(--ui-foreground) mb-3">{t("serviceUsage.prohibited.title")}</h3>
              <ul className="list-disc pr-6 space-y-2 text-(--ui-muted-foreground)">
                {(tp.serviceUsage?.prohibited?.items || []).map((item, idx) => <li key={idx}>{item}</li>)}
              </ul>
            </section>

            {/* Section 5 */}
            <section>
              <div className="bg-(--ui-danger-bg) border-2 border-(--ui-danger-border) rounded-2xl p-6">
                <h2 className="text-3xl font-bold mb-4 text-(--ui-danger-foreground)">{t("medicalDisclaimer.heading")}</h2>
                <p className="text-(--ui-foreground) font-semibold leading-relaxed">
                  {t("medicalDisclaimer.content")}
                </p>
              </div>
            </section>

            {/* Section 6 */}
            <section>
              <h2 className="text-3xl font-bold mb-4 text-(--ui-foreground)">{t("limitation.heading")}</h2>
              <ul className="list-disc pr-6 space-y-2 text-(--ui-muted-foreground)">
                {(tp.limitation?.items || []).map((item, idx) => <li key={idx}>{item}</li>)}
              </ul>
            </section>

            {/* Section 7 */}
            <section>
              <h2 className="text-3xl font-bold mb-4 text-(--ui-foreground)">{t("changes.heading")}</h2>
              <p className="text-(--ui-muted-foreground) leading-relaxed">
                {t("changes.content")}
              </p>
            </section>

            {/* Section 8 */}
            <section>
              <h2 className="text-3xl font-bold mb-4 text-(--ui-foreground)">{t("contact.heading")}</h2>
              <p className="text-(--ui-muted-foreground) leading-relaxed">
                {t("contact.content")}
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
