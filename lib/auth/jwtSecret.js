// قيمة افتراضية سرية (غير آمنة) للاستخدام فقط أثناء التطوير أو الاختبار
const DEV_FALLBACK = "dev-only-insecure-secret-change-me";

// دالة جلب قيمة السر الخاصة بـ JWT
export function getJwtSecret() {
  // جلب قيمة السر من متغير البيئة JWT_SECRET
  const secret = process.env.JWT_SECRET;
  // تحديد إذا كان التطبيق يعمل في بيئة الإنتاج
  const isProd = process.env.NODE_ENV === "production";

  // إذا كانت قيمة السر موجودة وطولها 32 حرف أو أكثر، يتم إرجاعها مباشرة (آمن)
  if (secret && String(secret).length >= 32) return secret;

  // في بيئة الإنتاج: يجب وجود قيمة سرية قوية وإلا يتم رمي خطأ ويمنع التشغيل
  if (isProd) {
    throw new Error(
      "JWT_SECRET is required in production and must be at least 32 characters.",
    );
  }

  // في بيئة التطوير أو الاختبار: يسمح باستخدام قيمة سرية قصيرة أو فارغة (للتسهيل فقط)
  // إذا لم يوجد secret يرجع القيمة الافتراضية DEV_FALLBACK
  return secret || DEV_FALLBACK;
}
