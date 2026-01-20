// ai/inference/index.js
// هذا الملف يعمل كمبدل للنموذج (Model Switcher):
// يختار بين نموذج وهمي (Mock) للتجارب أو النموذج الحقيقي (Python) للتحليل الفعلي.

// استيراد النموذج الوهمي
import { runMockModel } from "./mockModel.js";

// استيراد النموذج الحقيقي (Python backend)
import { runPyModel } from "./pyModel.js";

// قراءة إعداد البيئة لتحديد استخدام النموذج الوهمي أم الحقيقي
// إذا لم يُحدد ENV، الافتراضي هو استخدام النموذج الوهمي
const useMock = (process.env.AI_USE_MOCK || "true").toLowerCase() !== "false";

/**
 * دالة لإرجاع كائن يمثل النموذج المختار
 * يحتوي على:
 *  - infer: دالة لتنفيذ الاستدلال (inference)
 *  - name: اسم النموذج المختار
 */
// الدالة getModel() توفر واجهة موحدة لتشغيل أي نموذج دون الحاجة لتغيير بقية الكود
function getModel() {
  if (useMock) {
    // حالة استخدام النموذج الوهمي
    return {
      infer: async (prepared, opts = {}) => {
        // يتم تمرير البيانات المحضرة (buffer) للنموذج الوهمي
        return await runMockModel(prepared.buffer);
      },
      name: "mock", // اسم النموذج المستخدم حالياً
    };
  }

  // حالة استخدام النموذج الحقيقي عبر Python backend
  return {
    infer: async (prepared, opts = {}) => {
      // تمرير البيانات المحضرة وخيارات إضافية للنموذج الحقيقي
      return await runPyModel(prepared, opts);
    },
    name: "python", // اسم النموذج المستخدم حالياً
  };
}

// تصدير الدوال والثوابت لاستخدامها في ملفات أخرى
export { getModel, useMock };
