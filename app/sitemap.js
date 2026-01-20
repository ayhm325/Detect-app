// الحصول على عنوان الموقع الأساسي من المتغير البيئي أو localhost
const base = (process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000").replace(/\/$/, "");

// اللغات المدعومة
const locales = ["en", "ar"];

// المسارات الثابتة التي سيتم تضمينها في Sitemap
const staticPaths = [
  "", // الصفحة الرئيسية
  "/login",
  "/signup",
  "/about",
  "/contact",
  "/faq",
  "/privacy",
  "/terms",
  "/doctor/dashboard",
  "/patient/dashboard",
  "/admin/dashboard",
];

// الدالة المسؤولة عن توليد Sitemap
export default async function sitemap() {
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  return locales.flatMap((locale) => {
    return staticPaths.map((path) => {
      const normalized = path.startsWith("/") ? path : `/${path}`;
      
      // توليد URL كامل
      const url = `${base}/${locale}${normalized}`.replace(/\\+/, "/");

      return {
        url,
        lastModified: today,       // تاريخ آخر تعديل
        changeFrequency: "weekly", // مدى تكرار التغيير المتوقع
        priority: path === "" ? 1.0 : 0.7, // أولوية الصفحة (الصفحة الرئيسية الأعلى)
      };
    });
  });
}
