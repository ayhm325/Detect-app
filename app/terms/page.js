export const metadata = {
  title: "شروط الخدمة - Detect AI",
  description: "شروط وأحكام استخدام نظام Detect AI للكشف عن الأمراض بالذكاء الاصطناعي",
  openGraph: {
    title: "شروط الخدمة - Detect AI",
    description: "شروط وأحكام الاستخدام",
    type: "website",
  },
};

// تاريخ ثابت لتجنب مشاكل Hydration
const LAST_UPDATE = "١ ديسمبر ٢٠٢٥";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-red-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 animate-fadeIn">
          <h1 className="text-5xl font-bold mb-6">
            <span className="bg-linear-to-r from-yellow-600 to-red-600 bg-clip-text text-transparent">
              شروط الخدمة
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
              <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">1. قبول الشروط</h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                باستخدامك لنظام Detect AI، فإنك توافق على الالتزام بهذه الشروط والأحكام. 
                إذا كنت لا توافق على أي من هذه الشروط، يرجى عدم استخدام الخدمة.
              </p>
            </section>

            {/* Section 2 */}
            <section>
              <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">2. وصف الخدمة</h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                Detect AI هو نظام للكشف عن الأمراض باستخدام الذكاء الاصطناعي. الخدمة تشمل:
              </p>
              <ul className="list-disc pr-6 space-y-2 text-gray-600 dark:text-gray-400">
                <li>تحليل الصور الطبية بالذكاء الاصطناعي</li>
                <li>تقديم تقارير وتوصيات طبية</li>
                <li>التواصل مع الأطباء المعتمدين</li>
                <li>إدارة السجلات الطبية</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section>
              <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">3. التسجيل والحساب</h2>
              <div className="space-y-4 text-gray-600 dark:text-gray-400">
                <p className="leading-relaxed">
                  عند إنشاء حساب، أنت توافق على:
                </p>
                <ul className="list-disc pr-6 space-y-2">
                  <li>تقديم معلومات دقيقة وكاملة وحديثة</li>
                  <li>الحفاظ على سرية كلمة المرور الخاصة بك</li>
                  <li>إخطارنا فوراً بأي استخدام غير مصرح به لحسابك</li>
                  <li>تحمل المسؤولية عن جميع الأنشطة التي تحدث في حسابك</li>
                </ul>
              </div>
            </section>

            {/* Section 4 */}
            <section>
              <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">4. استخدام الخدمة</h2>
              <div className="space-y-4 text-gray-600 dark:text-gray-400">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">4.1 الاستخدام المسموح</h3>
                <ul className="list-disc pr-6 space-y-2">
                  <li>استخدام الخدمة للأغراض الطبية الشخصية فقط</li>
                  <li>رفع صور طبية صحيحة وواضحة</li>
                  <li>احترام حقوق المستخدمين الآخرين</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6">4.2 الاستخدام المحظور</h3>
                <ul className="list-disc pr-6 space-y-2">
                  <li>استخدام الخدمة لأغراض غير قانونية</li>
                  <li>محاولة اختراق أو تعطيل النظام</li>
                  <li>رفع محتوى مسيء أو غير لائق</li>
                  <li>انتهاك حقوق الملكية الفكرية</li>
                  <li>مشاركة حسابك مع الآخرين</li>
                </ul>
              </div>
            </section>

            {/* Section 5 */}
            <section>
              <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">5. التنويه الطبي</h2>
              <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-2xl p-6">
                <p className="text-gray-700 dark:text-gray-300 font-semibold leading-relaxed">
                  ⚠️ مهم: النتائج التي يقدمها Detect AI هي لأغراض إعلامية فقط ولا تشكل تشخيصاً طبياً نهائياً. 
                  يجب دائماً استشارة طبيب مختص لتأكيد أي تشخيص واتخاذ قرارات العلاج.
                </p>
              </div>
            </section>

            {/* Section 6 */}
            <section>
              <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">6. الدفع والاشتراكات</h2>
              <ul className="list-disc pr-6 space-y-2 text-gray-600 dark:text-gray-400">
                <li>جميع الرسوم غير قابلة للاسترداد ما لم ينص القانون على خلاف ذلك</li>
                <li>يتم تجديد الاشتراكات تلقائياً ما لم يتم إلغاؤها</li>
                <li>نحتفظ بالحق في تغيير الأسعار مع إشعار مسبق</li>
                <li>يمكنك إلغاء الاشتراك في أي وقت من إعدادات الحساب</li>
              </ul>
            </section>

            {/* Section 7 */}
            <section>
              <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">7. الملكية الفكرية</h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                جميع الحقوق والملكية الفكرية للنظام والمحتوى والعلامات التجارية مملوكة لـ Detect AI. 
                لا يحق لك نسخ أو توزيع أو تعديل أي جزء من الخدمة دون إذن كتابي مسبق.
              </p>
            </section>

            {/* Section 8 */}
            <section>
              <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">8. إخلاء المسؤولية</h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                Detect AI لا تتحمل المسؤولية عن:
              </p>
              <ul className="list-disc pr-6 space-y-2 text-gray-600 dark:text-gray-400">
                <li>دقة النتائج بنسبة 100%</li>
                <li>القرارات الطبية المتخذة بناءً على النتائج</li>
                <li>الأضرار الناتجة عن استخدام الخدمة</li>
                <li>انقطاع الخدمة أو الأعطال التقنية</li>
                <li>فقدان البيانات بسبب ظروف خارجة عن إرادتنا</li>
              </ul>
            </section>

            {/* Section 9 */}
            <section>
              <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">9. إنهاء الخدمة</h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                نحتفظ بالحق في إيقاف أو إنهاء حسابك في حالة انتهاك هذه الشروط دون إشعار مسبق. 
                يمكنك أيضاً إنهاء حسابك في أي وقت من إعدادات الحساب.
              </p>
            </section>

            {/* Section 10 */}
            <section>
              <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">10. التعديلات على الشروط</h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                نحتفظ بالحق في تعديل هذه الشروط في أي وقت. سنقوم بإخطارك بأي تغييرات جوهرية. 
                استمرارك في استخدام الخدمة بعد التعديلات يعني موافقتك على الشروط الجديدة.
              </p>
            </section>

            {/* Section 11 */}
            <section>
              <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">11. القانون المطبق</h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                تخضع هذه الشروط لقوانين المملكة العربية السعودية. أي نزاع ينشأ عن هذه الشروط يخضع للمحاكم السعودية.
              </p>
            </section>

            {/* Section 12 */}
            <section>
              <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">12. اتصل بنا</h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                لأي استفسارات حول شروط الخدمة، يرجى التواصل معنا:
              </p>
              <div className="bg-gradient-to-r from-yellow-50 to-red-50 dark:from-yellow-900/10 dark:to-red-900/10 p-6 rounded-2xl">
                <p className="text-gray-700 dark:text-gray-300 font-semibold mb-2">
                  البريد الإلكتروني: legal@detect-ai.com
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
