// services/analysisResult.service.js
// خدمة للتعامل مع نتائج التحليل: حفظها واسترجاعها وحذفها باستخدام Prisma

// دالة خاصة لاستدعاء Prisma Client بشكل ديناميكي
// هذا يسمح بعدم تحميل Prisma عند استيراد الملف فقط، بل عند الحاجة فقط
async function _getPrisma() {
  const mod = await import("../lib/prismaClient.js"); // استيراد Prisma Client من ملف lib
  return mod.default; // إرجاع الكائن الافتراضي
}

// دالة لحفظ نتيجة تحليل جديدة في قاعدة البيانات
async function saveAnalysisResult({ userId, imageUrl, analysisData }) {
  const prisma = await _getPrisma(); // الحصول على نسخة من Prisma

  // إنشاء سجل جديد في جدول analysisResult
  const created = await prisma.analysisResult.create({
    data: {
      userId, // معرف المستخدم الذي قام بالتحليل
      imageUrl, // رابط الصورة التي تم تحليلها
      prediction: analysisData.prediction, // التنبؤ الناتج عن النموذج (مثال: "PNEUMONIA")
      confidence: analysisData.confidence, // درجة الثقة بالنموذج
      explanation: analysisData.explanation, // أي توضيح أو ملاحظات من النموذج (إذا وجدت)
      heatmapUrl: analysisData.heatmap_url ?? analysisData.heatmapUrl ?? null, // رابط الـ heatmap إن وجدت
      modelVersion: analysisData.model_version ?? analysisData.modelVersion ?? "unknown", // إصدار النموذج
      inferenceTimeMs: analysisData.inference_time_ms ?? analysisData.inferenceTimeMs ?? 0, // وقت تنفيذ التحليل بالمللي ثانية
    },
  });

  return created; // إرجاع السجل الجديد
}

// دالة لاسترجاع سجل التحليلات لمستخدم محدد
async function getAnalysisHistory(userId) {
  const prisma = await _getPrisma(); // الحصول على Prisma Client

  const results = await prisma.analysisResult.findMany({
    where: { userId }, // فقط السجلات الخاصة بالمستخدم
    orderBy: { createdAt: "desc" }, // ترتيب حسب تاريخ الإنشاء من الأحدث للأقدم
  });

  return results; // إرجاع قائمة النتائج
}

// دالة لحذف نتيجة تحليل معينة للمستخدم (تضمن ملكية السجل)
async function deleteAnalysisResult(userId, id) {
  const prisma = await _getPrisma();

  // استخدام deleteMany لضمان حذف السجل فقط إذا كان يخص المستخدم
  const result = await prisma.analysisResult.deleteMany({
    where: { id, userId },
  });

  return result; // النتيجة تحتوي على { count } أي عدد السجلات المحذوفة
}

// تصدير الدوال لاستخدامها في باقي أجزاء المشروع
export { saveAnalysisResult, getAnalysisHistory };
export { deleteAnalysisResult };

// تصدير كائن افتراضي (default) لتوافق الاستيراد الديناميكي ESM
const analysisResultService = {
  saveAnalysisResult,
  getAnalysisHistory,
};

export default analysisResultService;
