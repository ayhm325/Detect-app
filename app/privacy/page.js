export const metadata = {
  title: "سياسة الخصوصية - Detect AI",
  description: "سياسة الخصوصية وحماية البيانات في نظام Detect AI",
  openGraph: {
    title: "سياسة الخصوصية - Detect AI",
    description: "كيف نحمي بياناتك وخصوصيتك",
    type: "website",
  },
};

// تاريخ ثابت لتجنب مشاكل Hydration
const LAST_UPDATE = "١ ديسمبر ٢٠٢٥";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-red-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 animate-fadeIn">
          <h1 className="text-5xl font-bold mb-6">
            <span className="bg-linear-to-r from-yellow-600 to-red-600 bg-clip-text text-transparent">
              سياسة الخصوصية
            </span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            آخر تحديث: {LAST_UPDATE}
          </p>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 md:p-12 shadow-2xl animate-slideUp">
          <div className="prose prose-lg dark:prose-invert max-w-none space-y-8">
            {/* Section 1 */}
            <section>
              <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">1. المقدمة</h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                في Detect AI، نحن ملتزمون بحماية خصوصيتك وأمان معلوماتك الشخصية والطبية. 
                توضح هذه السياسة كيفية جمع واستخدام وحماية بياناتك عند استخدام خدماتنا.
              </p>
            </section>

            {/* Section 2 */}
            <section>
              <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">2. المعلومات التي نجمعها</h2>
              <div className="space-y-4 text-gray-600 dark:text-gray-400">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">2.1 المعلومات الشخصية</h3>
                  <ul className="list-disc pr-6 space-y-2">
                    <li>الاسم الكامل</li>
                    <li>البريد الإلكتروني</li>
                    <li>رقم الهاتف</li>
                    <li>تاريخ الميلاد</li>
                    <li>معلومات الحساب</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">2.2 المعلومات الطبية</h3>
                  <ul className="list-disc pr-6 space-y-2">
                    <li>الصور الطبية (الأشعة السينية، وغيرها)</li>
                    <li>التقارير الطبية</li>
                    <li>نتائج التحاليل</li>
                    <li>السجلات الطبية</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 3 */}
            <section>
              <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">3. كيفية استخدام المعلومات</h2>
              <ul className="list-disc pr-6 space-y-2 text-gray-600 dark:text-gray-400">
                <li>تقديم وتحسين خدمات التشخيص بالذكاء الاصطناعي</li>
                <li>التواصل معك بشأن حسابك ونتائج التحاليل</li>
                <li>تحسين دقة النماذج الذكية (بعد إزالة البيانات الشخصية)</li>
                <li>الامتثال للمتطلبات القانونية والتنظيمية</li>
                <li>ضمان أمن وسلامة المنصة</li>
              </ul>
            </section>

            {/* Section 4 */}
            <section>
              <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">4. حماية البيانات</h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                نطبق إجراءات أمنية صارمة لحماية معلوماتك:
              </p>
              <ul className="list-disc pr-6 space-y-2 text-gray-600 dark:text-gray-400">
                <li>تشفير البيانات أثناء النقل والتخزين (SSL/TLS 256-bit)</li>
                <li>خوادم آمنة ومحمية بجدران نارية متقدمة</li>
                <li>التحكم الصارم في الوصول للبيانات</li>
                <li>المصادقة متعددة العوامل</li>
                <li>مراقبة أمنية على مدار الساعة</li>
                <li>نسخ احتياطي منتظم ومشفر</li>
              </ul>
            </section>

            {/* Section 5 */}
            <section>
              <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">5. مشاركة المعلومات</h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                لن نشارك معلوماتك الشخصية أو الطبية مع أي طرف ثالث إلا في الحالات التالية:
              </p>
              <ul className="list-disc pr-6 space-y-2 text-gray-600 dark:text-gray-400">
                <li>بموافقتك الصريحة</li>
                <li>مع الأطباء المخولين لعلاجك</li>
                <li>عند الضرورة القانونية أو التنظيمية</li>
                <li>لحماية حقوق وسلامة المستخدمين</li>
              </ul>
            </section>

            {/* Section 6 */}
            <section>
              <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">6. حقوقك</h2>
              <ul className="list-disc pr-6 space-y-2 text-gray-600 dark:text-gray-400">
                <li>الوصول إلى بياناتك الشخصية</li>
                <li>تصحيح البيانات غير الدقيقة</li>
                <li>حذف بياناتك (وفقاً للقوانين المعمول بها)</li>
                <li>سحب الموافقة على معالجة البيانات</li>
                <li>تحميل نسخة من بياناتك</li>
                <li>الاعتراض على معالجة بياناتك</li>
              </ul>
            </section>

            {/* Section 7 */}
            <section>
              <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">7. الامتثال القانوني</h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                نلتزم بجميع القوانين واللوائح المتعلقة بحماية البيانات الطبية، بما في ذلك:
              </p>
              <ul className="list-disc pr-6 space-y-2 text-gray-600 dark:text-gray-400 mt-4">
                <li>قانون حماية البيانات الشخصية السعودي</li>
                <li>قانون HIPAA (للمستخدمين الأمريكيين)</li>
                <li>القانون العام لحماية البيانات GDPR (للمستخدمين الأوروبيين)</li>
              </ul>
            </section>

            {/* Section 8 */}
            <section>
              <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">8. ملفات تعريف الارتباط (Cookies)</h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                نستخدم ملفات تعريف الارتباط لتحسين تجربتك على الموقع. يمكنك التحكم في إعدادات الكوكيز من متصفحك.
              </p>
            </section>

            {/* Section 9 */}
            <section>
              <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">9. التحديثات على السياسة</h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                قد نقوم بتحديث سياسة الخصوصية من وقت لآخر. سنقوم بإعلامك بأي تغييرات جوهرية عبر البريد الإلكتروني أو إشعار على الموقع.
              </p>
            </section>

            {/* Section 10 */}
            <section>
              <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">10. اتصل بنا</h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                إذا كان لديك أي أسئلة حول سياسة الخصوصية أو كيفية معالجة بياناتك، يرجى التواصل معنا:
              </p>
              <div className="bg-gradient-to-r from-yellow-50 to-red-50 dark:from-yellow-900/10 dark:to-red-900/10 p-6 rounded-2xl">
                <p className="text-gray-700 dark:text-gray-300 font-semibold mb-2">
                  البريد الإلكتروني: privacy@detect-ai.com
                </p>
                <p className="text-gray-700 dark:text-gray-300 font-semibold">
                  الهاتف: +966 50 123 4567
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
