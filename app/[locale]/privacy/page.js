import LanguageToggle from "../../../components/ui/LanguageToggle";

export default async function PrivacyPolicyPage(props) {
  const params = props.params ? (typeof props.params.then === 'function' ? await props.params : props.params) : {};
  const locale = params?.locale || "ar";
  const t = (await import(`../../locales/${locale}/privacy.json`)).default;
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <div
      className="min-h-screen bg-linear-to-br from-yellow-50 via-white to-red-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 py-20"
      dir={dir}
      lang={locale}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Language toggle at the very top */}
        <div className="flex justify-end mb-8">
          <LanguageToggle currentLocale={locale} />
        </div>
        {/* Header */}
        <div className="text-center mb-16 animate-fadeIn">
          <h1 className="text-5xl font-bold mb-6">
            <span className="bg-linear-to-r from-yellow-600 to-red-600 bg-clip-text text-transparent">
              {t.title || "Privacy Policy"}
            </span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {t.lastUpdate || "Last updated"}: {new Date().toLocaleDateString("en-US")}
          </p>
        </div>
        {/* Content */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 md:p-12 shadow-2xl animate-slideUp">
          <div className="prose prose-lg dark:prose-invert max-w-none space-y-12">
            {/* Introduction */}
            <section>
              <h2 className="section-title">{t.introduction?.title || "Introduction"}</h2>
              <p>{t.introduction?.content || "..."}</p>
            </section>
            {/* Information Collection */}
            <section>
              <h2 className="section-title">{t.informationCollection?.title || "Information Collection"}</h2>
              {Object.entries(t.informationCollection || {}).filter(([k]) => k !== "title").map(([key, val]) => (
                <div key={key} className="mt-6">
                  <h3 className="text-xl font-semibold mb-2">{val.title || key}</h3>
                  <p>{val.content || "..."}</p>
                </div>
              ))}
            </section>
            {/* Data Usage */}
            <section>
              <h2 className="section-title">{t.dataUsage?.title || "Data Usage"}</h2>
              <p>{t.dataUsage?.content || "..."}</p>
            </section>
            {/* Data Protection */}
            <section>
              <h2 className="section-title">{t.dataProtection?.title || "Data Protection"}</h2>
              <p>{t.dataProtection?.content || "..."}</p>
            </section>
            {/* User Rights */}
            <section>
              <h2 className="section-title">{t.userRights?.title || "User Rights"}</h2>
              <p>{t.userRights?.content || "..."}</p>
            </section>
            {/* Cookies */}
            <section>
              <h2 className="section-title">{t.cookies?.title || "Cookies"}</h2>
              <p>{t.cookies?.content || "..."}</p>
            </section>
            {/* Policy Changes */}
            <section>
              <h2 className="section-title">{t.policyChanges?.title || "Policy Changes"}</h2>
              <p>{t.policyChanges?.content || "..."}</p>
            </section>
            {/* Contact */}
            <section>
              <h2 className="section-title">{t.contact?.title || "Contact"}</h2>
              <p>{t.contact?.content || "..."}</p>
            </section>
          </div>
        </div>
        {/* Back to Home */}
        <div className="mt-10 text-center">
          <a
            href={`/${locale}`}
            className="inline-block px-8 py-4 bg-red-600 text-white font-bold rounded-full hover:bg-red-700 transition-colors shadow-lg"
          >
            {t.backToHome || "Back to Home"}
          </a>
        </div>
      </div>
    </div>
  );
}
