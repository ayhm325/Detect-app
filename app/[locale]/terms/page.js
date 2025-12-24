import LanguageToggle from "../../../components/ui/LanguageToggle";

export const dynamicParams = true;


export default async function TermsPage(props) {
  let params = props.params;
  if (typeof params?.then === 'function') {
    params = await params;
  }
  const locale = params?.locale || "ar";
  const dir = locale === "ar" ? "rtl" : "ltr";
  // Load terms JSON directly
  const t = (await import(`../../locales/${locale}/terms.json`)).default;

  return (
    <div
      className="min-h-screen bg-linear-to-br from-yellow-50 via-white to-red-50
                 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 py-20"
      dir={dir}
      lang={locale}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Language Toggle */}
        <div className="flex justify-end mb-8">
          <LanguageToggle currentLocale={locale} />
        </div>

        {/* Header */}
        <div className="text-center mb-16 animate-fadeIn">
          <h1 className="text-5xl font-bold mb-6">
            <span className="bg-linear-to-r from-yellow-600 to-red-600 bg-clip-text text-transparent">
              {t.title}
            </span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {t.lastUpdate}: {new Date('2025-12-20').toLocaleDateString('en-US')}
          </p>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 md:p-12 shadow-2xl space-y-12">

          {/* Acceptance */}
          <section>
            <h2 className="section-title">{t.acceptance.title}</h2>
            <p>{t.acceptance.content}</p>
          </section>

          {/* Service Description */}
          <section>
            <h2 className="section-title">{t.serviceDescription.title}</h2>
            <p>{t.serviceDescription.intro}</p>
          </section>

          {/* Registration */}
          <section>
            <h2 className="section-title">{t.registration.title}</h2>
            <p>{t.registration.intro}</p>
            {Array.isArray(t.registration.items) && t.registration.items.length > 0 && (
              <ul className="list-disc pr-6 space-y-2">
                {t.registration.items.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            )}
          </section>

          {/* Service Usage */}
          <section>
            <h2 className="section-title">{t.serviceUsage.title}</h2>

            <h3 className="text-xl font-semibold mb-3">
              {t.serviceUsage.allowed.title}
            </h3>
            {Array.isArray(t.serviceUsage.allowed.items) && t.serviceUsage.allowed.items.length > 0 && (
              <ul className="list-disc pr-6 space-y-2 mb-6">
                {t.serviceUsage.allowed.items.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            )}

            <h3 className="text-xl font-semibold mb-3">
              {t.serviceUsage.prohibited.title}
            </h3>
            {Array.isArray(t.serviceUsage.prohibited.items) && t.serviceUsage.prohibited.items.length > 0 && (
              <ul className="list-disc pr-6 space-y-2">
                {t.serviceUsage.prohibited.items.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            )}
          </section>

          {/* Medical Disclaimer */}
          <section>
            <div className="bg-red-50 dark:bg-red-900/20 border-2
                            border-red-200 dark:border-red-800
                            rounded-2xl p-6">
              <h2 className="text-3xl font-bold mb-4 text-red-900 dark:text-red-200">
                {t.medicalDisclaimer.title}
              </h2>
              <p className="font-semibold">
                {t.medicalDisclaimer.content}
              </p>
            </div>
          </section>

          {/* Limitation */}
          <section>
            <h2 className="section-title">{t.limitation.title}</h2>
            {Array.isArray(t.limitation.items) && t.limitation.items.length > 0 && (
              <ul className="list-disc pr-6 space-y-2">
                {t.limitation.items.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            )}
          </section>

          {/* Changes */}
          <section>
            <h2 className="section-title">{t.changes.title}</h2>
            <p>{t.changes.content}</p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="section-title">{t.contact.title}</h2>
            <p>{t.contact.content}</p>
          </section>

        </div>

        {/* Back to Home */}
        <div className="mt-10 text-center">
          <a
            href={`/${locale}`}
            className="inline-block px-8 py-4 bg-red-600 text-white
                       font-bold rounded-full hover:bg-red-700
                       transition-colors shadow-lg"
          >
            {t.backToHome}
          </a>
        </div>

      </div>
    </div>
  );
}
