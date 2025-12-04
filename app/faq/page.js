export const metadata = {
  title: "الأسئلة الشائعة - Detect AI",
  description: "إجابات على الأسئلة الشائعة حول نظام Detect AI للكشف عن الأمراض بالذكاء الاصطناعي",
  openGraph: {
    title: "الأسئلة الشائعة - Detect AI",
    description: "إجابات على أسئلتك حول نظام Detect AI",
    type: "website",
  },
};

export default function FAQPage() {
  const faqs = [
    {
      category: "عام",
      questions: [
        {
          q: "ما هو Detect AI؟",
          a: "Detect AI هو نظام متطور يستخدم الذكاء الاصطناعي للكشف عن الأمراض من خلال تحليل الصور الطبية مثل الأشعة السينية. يوفر نتائج دقيقة وسريعة لمساعدة الأطباء في التشخيص."
        },
        {
          q: "كيف يعمل النظام؟",
          a: "يستخدم النظام تقنيات التعلم العميق والشبكات العصبية الاصطناعية المدربة على ملايين الصور الطبية. يقوم بتحليل الصورة المرفوعة ومقارنتها بقاعدة بيانات ضخمة للكشف عن أي علامات مرضية."
        },
        {
          q: "هل النظام معتمد طبياً؟",
          a: "نعم، النظام حاصل على الموافقات الطبية اللازمة ويستخدم كأداة مساعدة للأطباء. ننصح دائماً بمراجعة طبيب مختص لتأكيد التشخيص."
        }
      ]
    },
    {
      category: "الاستخدام",
      questions: [
        {
          q: "كيف أقوم برفع صورة للتحليل؟",
          a: "بعد تسجيل الدخول، انتقل إلى صفحة 'رفع الأشعة' واسحب الصورة أو اضغط لاختيارها من جهازك. يدعم النظام صيغ JPG, PNG, DICOM."
        },
        {
          q: "كم يستغرق التحليل؟",
          a: "عادة يستغرق التحليل من 10-30 ثانية حسب حجم وجودة الصورة."
        },
        {
          q: "هل يمكنني حفظ النتائج؟",
          a: "نعم، يتم حفظ جميع التحليلات في ملفك الشخصي ويمكنك الرجوع إليها في أي وقت."
        }
      ]
    },
    {
      category: "الأمان والخصوصية",
      questions: [
        {
          q: "هل بياناتي آمنة؟",
          a: "نعم، نستخدم أحدث تقنيات التشفير لحماية بياناتك. جميع الصور والمعلومات الطبية مشفرة ومحمية وفقاً لأعلى معايير الأمان الطبي."
        },
        {
          q: "من يمكنه الوصول لبياناتي؟",
          a: "أنت فقط والطبيب المعالج المخول له. لا نشارك بياناتك مع أي طرف ثالث دون موافقتك الصريحة."
        },
        {
          q: "كيف تحمون خصوصيتي؟",
          a: "نلتزم بقوانين حماية البيانات الطبية (HIPAA) ونطبق سياسات صارمة لحماية خصوصية المرضى."
        }
      ]
    },
    {
      category: "الحساب والدفع",
      questions: [
        {
          q: "هل التسجيل مجاني؟",
          a: "نعم، التسجيل مجاني ويمكنك إنشاء حساب دون أي رسوم."
        },
        {
          q: "ما هي تكلفة التحليل؟",
          a: "نوفر باقات مختلفة تناسب احتياجاتك. يمكنك الاطلاع على الأسعار من صفحة الباقات."
        },
        {
          q: "كيف يمكنني إلغاء اشتراكي؟",
          a: "يمكنك إلغاء الاشتراك في أي وقت من إعدادات الحساب دون أي رسوم إضافية."
        }
      ]
    },
    {
      category: "الدعم الفني",
      questions: [
        {
          q: "كيف أتواصل مع الدعم الفني؟",
          a: "يمكنك التواصل معنا عبر البريد الإلكتروني support@detect-ai.com أو من خلال صفحة 'اتصل بنا' أو عبر نظام المحادثة المباشرة."
        },
        {
          q: "ماذا أفعل إذا واجهت مشكلة تقنية؟",
          a: "تواصل مع فريق الدعم الفني فوراً عبر المحادثة المباشرة أو البريد الإلكتروني، وسنساعدك في حل المشكلة بأسرع وقت."
        },
        {
          q: "هل الدعم متوفر 24/7؟",
          a: "نعم، فريق الدعم متاح على مدار الساعة لمساعدتك في أي استفسارات."
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-red-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 animate-fadeIn">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-linear-to-r from-yellow-600 to-red-600 bg-clip-text text-transparent">
              الأسئلة الشائعة
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            إجابات على أكثر الأسئلة شيوعاً حول Detect AI
          </p>
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
          <h3 className="text-3xl font-bold mb-4">لم تجد إجابة لسؤالك؟</h3>
          <p className="text-xl mb-8 opacity-90">تواصل معنا وسنكون سعداء بمساعدتك</p>
          <a 
            href="/contact"
            className="inline-block px-8 py-4 bg-white text-red-600 font-bold rounded-full hover:bg-gray-100 transition-colors shadow-lg"
          >
            اتصل بنا
          </a>
        </div>
      </div>
    </div>
  );
}
