import fs from "fs";
import path from "path";

// نقطة دخول PUT لمعالجة رفع الملفات محليًا
export async function PUT(req) {
  try {
    const url = new URL(req.url); // قراءة عنوان الطلب
    const rel = url.searchParams.get("path"); // استخراج مسار الملف النسبي من query
    if (!rel)
      return new Response(JSON.stringify({ error: "missing path" }), {
        status: 400, // إذا لم يُرسل المسار، نرجع خطأ 400
      });

    // تطبيع المسار لتجنب أي هجمات directory traversal
    const safeRel = path.normalize(rel).replace(/^([\.\/\\])+/, "");

    // إنشاء المسار المطلق للملف داخل مجلد public
    const abs = path.join(process.cwd(), "public", safeRel);

    // إنشاء المجلد إذا لم يكن موجودًا (بشكل متكرر حتى المستوى الأعلى)
    await fs.promises.mkdir(path.dirname(abs), { recursive: true });

    // قراءة البيانات المرسلة كـ ArrayBuffer
    const data = await req.arrayBuffer();

    // كتابة الملف على القرص من البيانات المستلمة
    await fs.promises.writeFile(abs, Buffer.from(data));

    // إعادة استجابة نجاح
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (e) {
    console.error(e); // تسجيل أي خطأ في السيرفر
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
    });
  }
}
