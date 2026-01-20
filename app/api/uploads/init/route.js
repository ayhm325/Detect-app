import fs from "fs";
import path from "path";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// إعدادات S3 من المتغيرات البيئية
const S3_BUCKET = process.env.S3_BUCKET;
const AWS_REGION = process.env.AWS_REGION || "us-east-1";

// دالة لتوليد اسم ملف آمن عند التخزين محليًا
async function makeLocalKey(filename) {
  // استبدال الفراغات بـ "_" وحذف أي حروف غير مسموح بها
  const safeName = filename
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9._-]/g, "");
  const timestamp = Date.now(); // إضافة طابع زمني لضمان التميز
  return `uploads/${timestamp}-${safeName}`; // مثال: uploads/1671234567890-my_file.pdf
}

// نقطة دخول POST لإنشاء رابط رفع الملف
export async function POST(req) {
  try {
    const body = await req.json(); // قراءة البيانات المرسلة من العميل
    const { chatId, filename, contentType } = body || {};

    // التحقق من وجود المعطيات الأساسية
    if (!chatId || !filename)
      return new Response(JSON.stringify({ error: "Invalid parameters" }), {
        status: 400,
      });

    // إذا تم إعداد S3، نرجع رابط رفع موقّع (Presigned URL)
    if (
      S3_BUCKET &&
      process.env.AWS_ACCESS_KEY_ID &&
      process.env.AWS_SECRET_ACCESS_KEY
    ) {
      // توليد مفتاح فريد للملف على S3
      const key = `uploads/${Date.now()}-${filename.replace(/\s+/g, "_")}`;
      const client = new S3Client({ region: AWS_REGION }); // إنشاء عميل S3
      const cmd = new PutObjectCommand({
        Bucket: S3_BUCKET,
        Key: key,
        ContentType: contentType || "application/octet-stream", // نوع الملف المرسل
      });
      // إنشاء رابط رفع موقّع صالح لمدة 15 دقيقة
      const uploadUrl = await getSignedUrl(client, cmd, { expiresIn: 900 });
      return new Response(
        JSON.stringify({ uploadUrl, key, provider: "s3", bucket: S3_BUCKET }),
        { status: 200 },
      );
    }

    // إذا لم يكن S3 مهيأ، نستخدم رفع محلي
    const key = await makeLocalKey(filename); // توليد اسم ملف آمن
    const absDir = path.join(process.cwd(), "public", path.dirname(key));
    await fs.promises.mkdir(absDir, { recursive: true }); // إنشاء المجلد إذا لم يكن موجودًا
    // رابط رفع محلي سيتم التعامل معه بواسطة endpoint مخصص
    const uploadUrl = `/api/uploads/local-upload?path=${encodeURIComponent(key)}`;
    return new Response(JSON.stringify({ uploadUrl, key, provider: "local" }), {
      status: 200,
    });
  } catch (e) {
    console.error(e); // تسجيل أي خطأ في السيرفر
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
    });
  }
}
