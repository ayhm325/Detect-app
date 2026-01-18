import { writeFile } from "fs/promises";
import path from "path";

export async function POST(req, { params }) {
  try {
    const resolved = await params;
    const chatId = resolved.chatId;
    const formData = await req.formData();
    const file = formData.get("file");
    if (!file) {
      return new Response(JSON.stringify({ error: "لم يتم اختيار ملف" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    // تحديد اسم الملف ومساره
    const ext = file.name.split(".").pop();
    const fileName = `${chatId}_${Date.now()}.${ext}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    const filePath = path.join(uploadDir, fileName);
    // إنشاء مجلد الرفع إذا لم يكن موجوداً
    await import("fs").then((fs) => {
      if (!fs.existsSync(uploadDir))
        fs.mkdirSync(uploadDir, { recursive: true });
    });
    // حفظ الملف
    const arrayBuffer = await file.arrayBuffer();
    await writeFile(filePath, Buffer.from(arrayBuffer));
    // إنشاء رابط الملف
    const url = `/uploads/${fileName}`;
    return new Response(JSON.stringify({ url }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: "خطأ في رفع الملف" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
