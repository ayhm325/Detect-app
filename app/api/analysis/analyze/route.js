// نقطة نهاية لتحليل صورة أشعة وإرجاع النتيجة وحفظها في قاعدة البيانات
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";
import crypto from "crypto";

// إنشاء UUID الإصدار 4 بدون تبعية خارجية كخيار احتياطي آمن
// دالة لتوليد معرف فريد (UUID) للصورة المرفوعة
function generateUUID() {
  if (globalThis.crypto && typeof globalThis.crypto.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }
  if (crypto && typeof crypto.randomUUID === "function")
    return crypto.randomUUID();
  // تطبيق احتياطي (متوافق إلى حد ما مع الإصدار 4 من RFC4122)
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = Math.floor(Math.random() * 16);
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
// استيراد دوال التحقق من صلاحية التوكن، ودوال الذكاء الاصطناعي وحفظ النتائج
import { isTokenRevoked } from "../../../../lib/auth/revocation.server.js";
import { runInference } from "../../../../ai/inference/inference.service.js";
import { saveAnalysisResult } from "../../../../services/analysisResult.service.js";
import { getJwtSecret } from "../../../../lib/auth/jwtSecret.js";
import { createNotificationBestEffort } from "../../../../lib/notifications.js";

// دالة لجلب كائن Prisma (قاعدة البيانات)
async function _getPrisma() {
  const mod = await import("../../../../lib/prismaClient.js");
  return mod.default;
}

// تحويل نتيجة الذكاء الاصطناعي إلى قيمة موجبة أو سالبة
function toAiResult(prediction) {
  const p = String(prediction || "").toLowerCase();
  // Treat "normal"/"negative" as NEGATIVE; everything else defaults to POSITIVE
  if (
    p.includes("normal") ||
    p.includes("negative") ||
    p.includes("no finding")
  )
    return "NEGATIVE";
  return "POSITIVE";
}

// ضبط قيمة الثقة بين 0 و 1
function clamp01(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(1, n));
}

// دالة استقبال طلب تحليل صورة أشعة
export async function POST(request) {
  try {
   // المصادقة: قبول الرمز المميز من ملف تعريف الارتباط أو رأس المصادقة أو نص الطلب
    // استخراج التوكن من الكوكيز أو الهيدر أو جسم الطلب
    let token = request.cookies.get("token")?.value;
    // (no dynamic import helpers or debug bypass in production code)
    if (!token) {
      const hdr =
        request.headers.get("authorization") ||
        request.headers.get("Authorization");
      if (hdr && hdr.startsWith("Bearer ")) token = hdr.slice(7).trim();
    }

    // optional: allow token in form body as fallback
    // (we'll parse formData below)

    if (!token)
      return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    // التحقق من أن التوكن غير ملغي (مستخدم محظور)
    try {
      const revoked = await isTokenRevoked(token);
      if (revoked)
        return NextResponse.json({ error: "token_revoked" }, { status: 401 });
    } catch (e) {
      console.warn(
        "/api/analysis/analyze: revoked check failed",
        e && e.message,
      );
    }

    let payload;
    // فك تشفير التوكن والتحقق منه
    try {
      payload = jwt.verify(token, getJwtSecret());
    } catch (e) {
      console.error(
        "/api/analysis/analyze: token verify failed",
        e && e.message,
      );
      return NextResponse.json({ error: "invalid_token" }, { status: 401 });
    }

    const userId = payload.id;
    if (!userId)
      return NextResponse.json(
        { error: "invalid_token_payload" },
        { status: 401 },
      );

    // استخراج بيانات الصورة من النموذج المرسل (formData)
    const form = await request.formData();
    const file = form.get("image");
    if (!file)
      return NextResponse.json({ error: "missing_file" }, { status: 400 });

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // التحقق من حجم الصورة المرفوعة وعدم تجاوز الحد الأقصى
    const MAX_FILE_SIZE = Number(
      process.env.MAX_UPLOAD_BYTES || 10 * 1024 * 1024,
    ); // default 10MB
    if (buffer.length > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: "file_too_large",
          message: `File exceeds maximum size of ${Math.round(MAX_FILE_SIZE / 1024 / 1024)}MB`,
        },
        { status: 413 },
      );
    }

    const fileObj = {
      buffer,
      mimetype: file.type || "application/octet-stream",
      originalname: file.name || "upload",
      size: buffer.length,
    };

    // استخراج خيار توليد خريطة حرارية (heatmap) إذا تم تفعيله في النموذج
    try {
      const withHeatmapRaw = form.get("with_heatmap");
      if (withHeatmapRaw !== null) {
        // حقول النموذج تصل كسلاسل نصية: 'true'/'false' أو 'on'
        fileObj.with_heatmap =
          String(withHeatmapRaw) === "true" || String(withHeatmapRaw) === "on";
      }
    } catch (e) {
      fileObj.with_heatmap = false;
    }

    // محاولة اكتشاف نوع الملف المرفوع من البيانات وليس فقط من الامتداد
    let detected = null;
    try {
      const ft = await import("file-type");
      if (ft && typeof ft.fileTypeFromBuffer === "function") {
        detected = await ft.fileTypeFromBuffer(buffer);
      }
    } catch (e) {
      // لم يتم تثبيت مكتبة file-type أو فشلت — سنعود إلى استخدام الامتداد/نوع MIME كاحتياط
      detected = null;
    }

    // حفظ الصورة المرفوعة في مجلد uploads بشكل آمن مع اسم فريد
    try {
      const uploadsDir = path.join(process.cwd(), "public", "uploads");
      if (!fs.existsSync(uploadsDir))
        fs.mkdirSync(uploadsDir, { recursive: true });

      // توليد اسم ملف فريد (استخدم دالة مساعدة داخلية)
      const uuid = generateUUID();

      // امتدادات مسموح بها صارمة وخريطة
      const allowed = new Set([
        ".png",
        ".jpg",
        ".jpeg",
        ".gif",
        ".bmp",
        ".webp",
        ".tif",
        ".tiff",
      ]);

      // يفضل استخدام الامتداد المكتشف إن وجد
      let safeExt = "";
      let detectedMime = "";
      if (detected && detected.ext) {
        const detExt = `.${String(detected.ext).toLowerCase()}`;
        if (allowed.has(detExt)) safeExt = detExt;
        detectedMime = detected.mime || "";
      }

      // الرجوع إلى الامتداد أو نوع MIME الذي يوفره العميل إذا لم يتم الكشف عنه
      if (!safeExt) {
        const rawExt = path.extname(fileObj.originalname || "") || "";
        const ext = String(rawExt).toLowerCase();
        if (allowed.has(ext)) safeExt = ext;
        else if (
          fileObj.mimetype &&
          String(fileObj.mimetype).startsWith("image/")
        ) {
          if (fileObj.mimetype.includes("jpeg")) safeExt = ".jpg";
          else if (fileObj.mimetype.includes("png")) safeExt = ".png";
          else if (fileObj.mimetype.includes("webp")) safeExt = ".webp";
          else if (
            fileObj.mimetype.includes("tiff") ||
            fileObj.mimetype.includes("tif")
          )
            safeExt = ".tiff";
          detectedMime = fileObj.mimetype;
        }
      }

      // فحص دقيق: رفض أنواع الصور غير المدعومة/غير المعروفة
      if (!safeExt || (!detectedMime && !fileObj.mimetype)) {
        return NextResponse.json(
          {
            error: "invalid_file_type",
            message: "Uploaded file is not a supported image type",
          },
          { status: 400 },
        );
      }

      // إذا أعاد نوع الملف نوع MIME، فتأكد من أنه صورة
      if (detectedMime && !String(detectedMime).startsWith("image/")) {
        return NextResponse.json(
          {
            error: "invalid_file_type",
            message: "Detected file type is not an image",
          },
          { status: 400 },
        );
      }

      const uniqueFileName = `${uuid}${safeExt}`;

      // ensure filename contains no path characters (prevent traversal)
      const safeFileName = path.basename(uniqueFileName);
      const filePath = path.join(uploadsDir, safeFileName);

      await fs.promises.writeFile(filePath, buffer);

      // توليد رابط الصورة ليتمكن الواجهة من عرضها
      var imageUrl = `/uploads/${encodeURIComponent(safeFileName)}`;
      // في حال التفعيل، قم بإنشاء عنوان URL موقّع (ملاحظة: تطبيق التحقق من التوقيع يتطلب وجود Middleware)
      if (process.env.ENABLE_SIGNED_URLS === "1") {
        const signingSecret =
          process.env.UPLOAD_URL_SIGNING_SECRET || getJwtSecret();
        const expires =
          Date.now() + (Number(process.env.UPLOAD_URL_EXP_MS) || 5 * 60 * 1000);
        const sig = crypto
          .createHmac("sha256", signingSecret)
          .update(`${safeFileName}:${expires}`)
          .digest("hex");
        imageUrl = `/uploads/${encodeURIComponent(safeFileName)}?exp=${expires}&sig=${sig}`;
      }

      // تحديث كائن الملف للاستخدام في المراحل التالية
      fileObj.savedPath = filePath;
      fileObj.savedUrl = imageUrl;
    } catch (e) {
      console.warn(
        "/api/analysis/analyze: failed to save uploaded file",
        e && e.message,
      );
      // الاستمرار حتى لو فشل الحفظ؛ يمكن للذكاء الاصطناعي أن يعمل على البيانات في الذاكرة
      var imageUrl = `/uploads/${fileObj.originalname}`;
    }

    // استدعاء خدمة الذكاء الاصطناعي لتحليل الصورة
    const rawAnalysisResult = await runInference(fileObj);

    // توحيد شكل نتيجة التحليل بغض النظر عن تنسيق الحقول
    const normalize = (r) => ({
      analysisId: r.analysis_id ?? r.analysisId ?? null,
      prediction: r.prediction ?? "Unknown",
      confidence:
        typeof r.confidence === "number"
          ? r.confidence
          : Number(r.confidence) || 0,
      explanation: r.explanation ?? "",
      heatmapUrl: r.heatmap_url ?? r.heatmapUrl ?? null,
      modelVersion: r.model_version ?? r.modelVersion ?? "unknown",
      inferenceTimeMs: r.inference_time_ms ?? r.inferenceTimeMs ?? 0,
      createdAt: r.created_at ?? r.createdAt ?? new Date().toISOString(),
    });

    const analysisResult = normalize(rawAnalysisResult);

    // التأكد من وجود رابط للصورة حتى لو فشل الحفظ
    const finalImageUrl =
      typeof imageUrl === "string"
        ? imageUrl
        : `/uploads/${fileObj.originalname}`;

    // حفظ نتيجة التحليل في قاعدة البيانات (جدول التحليلات)
    let saved = null;
    let saveError = null;
    try {
      saved = await saveAnalysisResult({
        userId,
        imageUrl: finalImageUrl,
        analysisData: analysisResult,
      });
    } catch (e) {
      saveError = e && (e.message ?? String(e));
      console.warn("Failed to save analysis result", saveError, e && e.stack);
      // الاستمرار حتى لو فشل الحفظ
    }

    // إضافة نتيجة التحليل إلى سجل المريض الطبي (MedicalRecord)
    // وإرسال إشعار للمريض والطبيب عند نجاح العملية
    try {
      const prisma = await _getPrisma();
      const patient = await prisma.patient.findUnique({
        where: { userId },
        select: { id: true, doctorId: true, fullName: true },
      });

      if (patient?.id) {
        await prisma.medicalRecord.create({
          data: {
            patientId: patient.id,
            doctorId: patient.doctorId || null,
            aiResult: toAiResult(analysisResult.prediction),
            confidenceScore: clamp01(analysisResult.confidence),
            imageUrl: finalImageUrl,
            reviewedByDoctor: false,
            doctorNotes: null,
          },
        });

        // إشعار المريض بوجود نتيجة فحص جديدة في سجله
        await createNotificationBestEffort(prisma, {
          userId,
          type: "success",
          message: {
            ar: "تمت إضافة نتيجة فحص جديدة إلى سجلك.",
            en: "A new analysis result has been added to your records.",
          },
        });

         // إشعار الطبيب المسؤول بوجود نتيجة فحص جديدة لأحد مرضاه
        if (patient?.doctorId) {
          const patientName = patient?.fullName || null;
          await createNotificationBestEffort(prisma, {
            userId: patient.doctorId,
            type: "info",
            message: {
              ar: `تمت إضافة نتيجة فحص جديدة${patientName ? ` للمريض ${patientName}` : " لأحد مرضاك"}.`,
              en: `A new analysis result was added${patientName ? ` for patient ${patientName}` : " for one of your patients"}.`,
            },
          });
        }
      }
    } catch (e) {
      console.warn(
        "/api/analysis/analyze: failed to create MedicalRecord",
        e && e.message,
      );
    }

    // تجهيز الاستجابة النهائية للواجهة (تتضمن النتيجة وحالة الحفظ)
    const responsePayload = {
      success: true,
      data: saved ?? analysisResult,
      saved: Boolean(saved),
    };
    if (!saved && saveError && process.env.NODE_ENV !== "production")
      responsePayload.saveError = saveError;

    return NextResponse.json(responsePayload);
  } catch (e) {
    // في حال حدوث خطأ غير متوقع، يتم تسجيله وإرجاع رسالة خطأ للواجهة
    console.error("/api/analysis/analyze error", e && e.message, e && e.stack);
    if (process.env.NODE_ENV !== "production") {
      return NextResponse.json(
        { error: e.message || String(e), stack: e.stack },
        { status: 500 },
      );
    }
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
