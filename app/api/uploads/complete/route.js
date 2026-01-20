import fs from "fs";
import path from "path";
import { S3Client, HeadObjectCommand } from "@aws-sdk/client-s3";

// الحد الأقصى لحجم الملف (10 ميجابايت افتراضي أو من ENV)
const MAX_FILE_SIZE = Number(process.env.MAX_UPLOAD_BYTES || 10 * 1024 * 1024);

// أنواع الملفات المسموح بها
const ALLOWED_EXT = [".png", ".jpg", ".jpeg", ".gif", ".pdf", ".doc", ".docx"];

// دالة للتحقق من امتداد الملف
function extAllowed(name) {
  const ext = (name || "").toLowerCase();
  return ALLOWED_EXT.some((e) => ext.endsWith(e));
}

export async function POST(req) {
  try {
    // قراءة البيانات المرسلة في الطلب
    const body = await req.json();
    const { chatId, key, filename, provider, bucket, region } = body || {};

    // تحقق من وجود القيم الأساسية
    if (!chatId || !key) {
      console.error("uploads/complete: invalid params", { body });
      return new Response(
        JSON.stringify({
          error: "Invalid parameters",
          details: { chatId: !!chatId, key: !!key },
        }),
        { status: 400 },
      );
    }

    // حالة رفع الملف على S3
    if (provider === "s3") {
      const bucketToUse = bucket || process.env.S3_BUCKET;
      const regionToUse = region || process.env.AWS_REGION || "us-east-1";
      if (!bucketToUse)
        return new Response(
          JSON.stringify({ error: "Missing bucket config" }),
          { status: 500 },
        );

      try {
        // إنشاء عميل S3
        const client = new S3Client({ region: regionToUse });
        // الحصول على بيانات الملف للتحقق من الحجم والنوع
        const head = await client.send(
          new HeadObjectCommand({ Bucket: bucketToUse, Key: key }),
        );
        const size = head.ContentLength || 0;
        const contentType = head.ContentType || "";

        // تحقق من الحجم
        if (size > MAX_FILE_SIZE)
          return new Response(JSON.stringify({ error: "file_too_large" }), {
            status: 400,
          });

        // تحقق من النوع (امتداد أو نوع محتوى)
        if (
          !extAllowed(key) &&
          !contentType.startsWith("image/") &&
          !contentType.includes("pdf") &&
          !contentType.includes("msword") &&
          !contentType.includes("officedocument")
        ) {
          return new Response(JSON.stringify({ error: "invalid_file_type" }), {
            status: 400,
          });
        }

        // توليد رابط الوصول العام للملف على S3
        const url = `https://${bucketToUse}.s3.${regionToUse}.amazonaws.com/${encodeURIComponent(key)}`;
        return new Response(
          JSON.stringify({
            url,
            key,
            provider: "s3",
            contentType,
            filename: filename || key,
          }),
          { status: 200 },
        );
      } catch (e) {
        console.error("S3 head error", { bucket: bucketToUse, key, err: e });
        return new Response(
          JSON.stringify({ error: "s3_error", message: e?.message }),
          { status: 500 },
        );
      }
    }

    // حالة رفع الملف محلياً في مجلد public
    const abs = path.join(process.cwd(), "public", key);
    const stat = await fs.promises.stat(abs).catch(() => null);

    if (!stat) {
      console.error("uploads/complete: uploaded file not found", { abs, body });
      return new Response(
        JSON.stringify({ error: "Uploaded file not found", path: abs }),
        { status: 400 },
      );
    }

    // تحقق من الحجم
    if (stat.size > MAX_FILE_SIZE) {
      console.error("uploads/complete: file too large", {
        abs,
        size: stat.size,
        max: MAX_FILE_SIZE,
      });
      return new Response(JSON.stringify({ error: "file_too_large" }), {
        status: 400,
      });
    }

    // تحقق من امتداد الملف
    if (!extAllowed(filename || key)) {
      console.error("uploads/complete: invalid file type", { filename, key });
      return new Response(JSON.stringify({ error: "invalid_file_type" }), {
        status: 400,
      });
    }

    // تخمين نوع المحتوى بناءً على الامتداد
    const guessedType = (() => {
      const ext = (filename || key || "").toLowerCase();
      if (
        ext.endsWith(".png") ||
        ext.endsWith(".jpg") ||
        ext.endsWith(".jpeg") ||
        ext.endsWith(".webp") ||
        ext.endsWith(".gif")
      )
        return "image/*";
      if (ext.endsWith(".pdf")) return "application/pdf";
      if (ext.endsWith(".doc") || ext.endsWith(".docx"))
        return "application/msword";
      return "application/octet-stream"; // افتراضي
    })();

    // رابط الوصول العام للملف
    const url = `/${key}`;
    return new Response(
      JSON.stringify({
        url,
        key,
        provider: "local",
        contentType: guessedType,
        filename: filename || key,
      }),
      { status: 200 },
    );
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
    });
  }
}
