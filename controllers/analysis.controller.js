// controllers/analysis.controller.js

// استدعاء خدمة الذكاء الاصطناعي التي تقوم بتحليل الصورة وتشغيل النموذج
const { runInference } = require("../ai/inference/inference.service");

// استدعاء خدمات قاعدة البيانات لحفظ واسترجاع نتائج التحليل
const {
  saveAnalysisResult,
  getAnalysisHistory,
} = require("../services/analysisResult.service");

/**
 * دالة لمعالجة طلب تحليل صورة (Endpoint)
 * تستقبل الصورة من العميل وتحفظ نتيجة التحليل في قاعدة البيانات
 */
async function analyzeImage(req, res) {
  try {
    // جلب الملف المرفق في الطلب (عادةً عبر multer أو أي middleware رفع ملفات)
    const file = req.file;

    // جلب معرف المستخدم من الجلسة أو التوكن
    const userId = req.user && req.user.id;

    // التحقق من وجود معرف المستخدم، وإلا يُعتبر الطلب غير مصرح به
    if (!userId) throw new Error("Unauthorized: missing user");

    // تشغيل نموذج الذكاء الاصطناعي على الصورة المستلمة
    const analysisResult = await runInference(file);

    // مسار مؤقت لتخزين الصورة — يمكن تغييره لاحقًا ليناسب تخزينك الفعلي (S3, Cloud, local)
    const imageUrl = `/uploads/${file.originalname}`;

    // حفظ نتيجة التحليل في قاعدة البيانات
    const savedResult = await saveAnalysisResult({
      userId,          // ربط النتيجة بالمستخدم
      imageUrl,        // رابط الصورة
      analysisData: analysisResult, // بيانات التحليل الناتجة عن النموذج
    });

    // إعادة الاستجابة للعميل بالنجاح والبيانات المحفوظة
    return res.status(200).json({
      success: true,
      data: savedResult,
    });
  } catch (error) {
    // في حال حدوث خطأ، إعادة رسالة الخطأ للعميل مع حالة HTTP 400
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

/**
 * دالة لجلب تاريخ تحليلات المستخدم
 * تُستخدم في صفحة "سجل التحاليل" أو API لإظهار النتائج السابقة
 */
async function getAnalysisHistoryController(req, res) {
  try {
    // جلب معرف المستخدم من الجلسة أو التوكن
    const userId = req.user && req.user.id;

    // التحقق من وجود المستخدم
    if (!userId) throw new Error("Unauthorized: missing user");

    // استدعاء الخدمة لجلب كل نتائج التحليل الخاصة بالمستخدم
    const results = await getAnalysisHistory(userId);

    // إعادة النتائج للعميل
    return res.json({ success: true, data: results });
  } catch (error) {
    // إعادة رسالة الخطأ في حالة وجود مشكلة
    return res.status(400).json({ success: false, message: error.message });
  }
}

// تصدير الدوال لاستخدامها في ملفات الراوتر أو الـ endpoints
module.exports = {
  analyzeImage,
  getAnalysisHistory: getAnalysisHistoryController,
};
