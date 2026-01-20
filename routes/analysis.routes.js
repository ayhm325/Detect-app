// routes/analysis.routes.js

const express = require("express"); // استدعاء إطار عمل Express لإنشاء السيرفر ونقاط النهاية
const router = express.Router(); // إنشاء راوتر خاص بالـ analysis لفصل نقاط النهاية
const multer = require("multer"); // مكتبة لمعالجة رفع الملفات (multipart/form-data)

const {
  analyzeImage,       // الدالة المسؤولة عن تحليل الصورة وتشغيل الـ AI
  getAnalysisHistory, // الدالة المسؤولة عن جلب سجل التحليلات للمستخدم
} = require("../controllers/analysis.controller");

// إعداد Multer لتخزين الملفات في الذاكرة مؤقتًا (MemoryStorage)
const upload = multer({ storage: multer.memoryStorage() });

// نقطة النهاية لتحليل صورة واحدة
// استخدام upload.single("image") يعني استقبال ملف واحد باسم "image" من الفورم
router.post("/analyze", upload.single("image"), analyzeImage);

// نقطة النهاية لجلب سجل التحليلات للمستخدم الحالي
router.get("/history", getAnalysisHistory);

// تصدير الراوتر ليتم استخدامه في ملف السيرفر الرئيسي (app.js أو index.js)
module.exports = router;
