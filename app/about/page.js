export const metadata = {
  title: "من نحن - Detect AI",
  description: "تعرف على Detect AI - نظام رائد في مجال الكشف عن الأمراض بالذكاء الاصطناعي",
  openGraph: {
    title: "من نحن - Detect AI",
    description: "نظام رائد في مجال الكشف عن الأمراض بالذكاء الاصطناعي",
    type: "website",
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-red-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fadeIn">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-linear-to-r from-yellow-600 to-red-600 bg-clip-text text-transparent">
                من نحن
              </span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
              نحن فريق من الخبراء المتخصصين في الذكاء الاصطناعي والطب، نعمل على تطوير حلول مبتكرة لتحسين الرعاية الصحية
            </p>
          </div>

          {/* Mission & Vision */}
          <div className="grid md:grid-cols-2 gap-8 mb-20">
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 shadow-2xl animate-slideUp">
              <div className="w-16 h-16 bg-linear-to-br from-yellow-100 to-yellow-200 dark:from-yellow-900/30 dark:to-yellow-800/30 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">رؤيتنا</h2>
              <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
                أن نكون الرائدين عالمياً في تطبيق الذكاء الاصطناعي للكشف المبكر عن الأمراض، مما يساهم في إنقاذ الأرواح وتحسين جودة الرعاية الصحية.
              </p>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 shadow-2xl animate-slideUp" style={{ animationDelay: "0.2s" }}>
              <div className="w-16 h-16 bg-linear-to-br from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">مهمتنا</h2>
              <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
                توفير نظام ذكي دقيق وسريع للكشف عن الأمراض من خلال تحليل الصور الطبية، مع الحفاظ على أعلى معايير الخصوصية والأمان.
              </p>
            </div>
          </div>

          {/* Values */}
          <div className="mb-20">
            <h2 className="text-4xl font-bold text-center mb-12">
              <span className="bg-linear-to-r from-yellow-600 to-red-600 bg-clip-text text-transparent">
                قيمنا
              </span>
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: (
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  ),
                  title: "الدقة والجودة",
                  desc: "نلتزم بأعلى معايير الدقة في التشخيص"
                },
                {
                  icon: (
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  ),
                  title: "الخصوصية والأمان",
                  desc: "حماية بيانات المرضى هي أولويتنا القصوى"
                },
                {
                  icon: (
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  ),
                  title: "الابتكار المستمر",
                  desc: "نطور تقنياتنا باستمرار لخدمة أفضل"
                },
              ].map((value, idx) => (
                <div 
                  key={idx}
                  className="bg-white dark:bg-zinc-900 rounded-3xl p-8 shadow-2xl text-center animate-slideUp hover:scale-105 transition-transform"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  <div className="w-16 h-16 bg-linear-to-br from-yellow-100 to-red-200 dark:from-yellow-900/30 dark:to-red-800/30 rounded-2xl flex items-center justify-center mx-auto mb-6 text-yellow-600 dark:text-yellow-400">
                    {value.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">{value.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{value.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Team Stats */}
          <div className="bg-linear-to-r from-yellow-500 to-red-500 rounded-3xl p-12 text-white mb-20 animate-fadeIn">
            <div className="grid md:grid-cols-4 gap-8 text-center">
              {[
                { num: "50+", label: "خبير متخصص" },
                { num: "10K+", label: "مريض سعيد" },
                { num: "98%", label: "دقة التشخيص" },
                { num: "24/7", label: "دعم مستمر" },
              ].map((stat, idx) => (
                <div key={idx} className="animate-slideUp" style={{ animationDelay: `${idx * 0.1}s` }}>
                  <div className="text-5xl font-bold mb-2">{stat.num}</div>
                  <div className="text-lg opacity-90">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Technology */}
          <div className="text-center">
            <h2 className="text-4xl font-bold mb-8">
              <span className="bg-linear-to-r from-yellow-600 to-red-600 bg-clip-text text-transparent">
                تقنيتنا
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-12 leading-relaxed">
              نستخدم أحدث تقنيات التعلم العميق والشبكات العصبية الاصطناعية لتحليل الصور الطبية بدقة عالية.
              نموذجنا مدرب على ملايين الصور الطبية من مصادر موثوقة حول العالم.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              {["التعلم العميق", "الشبكات العصبية", "معالجة الصور"].map((tech, idx) => (
                <div 
                  key={idx}
                  className="bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-lg animate-slideUp"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">{tech}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
