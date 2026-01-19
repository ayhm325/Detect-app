import { NextResponse } from "next/server";
import prisma from "../../../../../lib/prismaClient.js";
import { withRBAC } from "../../../../../lib/auth/withRBAC.js";
import { rateLimit } from "../../../../../lib/security/rateLimiter.js";
import { logAudit } from "../../../../../lib/security/auditLogger.js";
import { createNotificationBestEffort } from "../../../../../lib/notifications.js";

// ------------------ ثابت إعدادات ------------------
const MAX_MESSAGE_LENGTH = 500; // الحد الأقصى لطول الرسائل
const CHAT_ROLES = ["doctor", "patient", "admin"]; // الأدوار المسموح لها

// ------------------ دوال مساعدة ------------------

// دالة لتنظيف النصوص من أي HTML أو مسافات زائدة
function sanitizeText(txt = "") {
  const stripped = txt.replace(/<[^>]*>/g, ""); // إزالة أي عناصر HTML
  return stripped.trim(); // إزالة المسافات من البداية والنهاية
}

// دالة لاستخراج التوكن من الكوكيز أو الهيدر
function extractToken(request) {
  let token = request.cookies.get("token")?.value;
  if (!token) {
    const hdr = request.headers.get("authorization") || request.headers.get("Authorization");
    if (hdr && hdr.startsWith("Bearer ")) token = hdr.slice(7).trim();
  }
  return token || null;
}

// دالة للتحقق من صلاحية المستخدم (توكن صالح + غير ملغي)
async function validateUser(request) {
  const token = extractToken(request);
  if (!token) return { error: "unauthenticated" };

  // التحقق من أن التوكن غير ملغي
  try {
    const { isTokenRevoked } = await import("../../../../../lib/auth/revocation.server.js");
    const revoked = await isTokenRevoked(token);
    if (revoked) return { error: "token_revoked" };
  } catch (e) {
    console.warn("revoked check failed", e?.message);
  }

  // فك تشفير التوكن والتحقق منه
  try {
    const { default: jwt } = await import("jsonwebtoken");
    const { getJwtSecret } = await import("../../../../../lib/auth/jwtSecret.js");
    const payload = jwt.verify(token, getJwtSecret());
    if (!payload?.id) return { error: "invalid_token_payload" };
    return { userId: payload.id };
  } catch (e) {
    return { error: "invalid_token" };
  }
}

// دالة للتحقق من وصول المستخدم إلى الدردشة حسب الدور
async function checkChatAccess(user, chat) {
  if (user.role === "doctor" && chat.doctorId !== user.id) return false;
  if (user.role === "patient") {
    const patient = await prisma.patient.findUnique({ where: { userId: user.id } });
    if (!patient || chat.patientId !== patient.id) return false;
  }
  return true; // admin يمكنه الوصول دائماً
}

// دالة لتحديث الرسائل والإشعارات كمقروءة
async function markChatAsRead(prismaClient, user, chatId) {
  try {
    // تحديث الإشعارات غير المقروءة
    let notifyUserId = user.id;
    if (user.role === "patient") {
      // إذا كان المريض، نبحث عن patientId المرتبط
      const patient = await prismaClient.patient.findUnique({ where: { userId: user.id } });
      if (patient) notifyUserId = patient.userId;
    }
    await prismaClient.notification.updateMany({
      where: {
        userId: notifyUserId,
        isDeleted: false,
        isRead: false,
        AND: [
          { message: { contains: '"kind":"chat_message"' } },
          { message: { contains: `"chatId":"${chatId}"` } },
        ],
      },
      data: { isRead: true },
    });

    // تحديث الرسائل غير المقروءة
    const unreadFrom = user.role === "doctor" ? "patient" : "doctor";
    await prismaClient.message.updateMany({
      where: {
        chatId,
        sender: unreadFrom,
        status: { not: "read" },
      },
      data: { status: "read" },
    });
  } catch {
    // إذا فشل التحديث لا نوقف العملية
  }
}

// دالة للتحقق إذا كان يجب إرسال إشعار رسالة جديدة
async function shouldSendChatNotification(prismaClient, { userId, chatId }) {
  try {
    const existing = await prismaClient.notification.findFirst({
      where: {
        userId,
        isDeleted: false,
        isRead: false,
        AND: [
          { message: { contains: '"kind":"chat_message"' } },
          { message: { contains: `"chatId":"${chatId}"` } },
        ],
      },
      select: { id: true },
    });
    return !existing;
  } catch {
    return true; // افتراضياً إرسال الإشعار
  }
}

// ------------------ Endpoints ------------------

// ==================== GET: جلب رسائل الدردشة ====================
export const GET = withRBAC(
  async (request, user, context) => {
    // تحقق من الحد الأقصى للطلبات
    const rl = await rateLimit(request);
    if (rl.limited) {
      logAudit({
        event: "rate_limit_exceeded",
        userId: user.id,
        ip: request.headers.get("x-forwarded-for"),
        details: { endpoint: "GET /api/chat/[chatId]/messages" },
      });
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    try {
      const params = context?.params;
      const resolvedParams = typeof params?.then === "function" ? await params : params;
      const { chatId } = resolvedParams || {};
      if (!chatId || typeof chatId !== "string") return NextResponse.json({ error: "missing_chat_id" }, { status: 400 });

      const chat = await prisma.chat.findUnique({ where: { id: chatId } });
      if (!chat) return NextResponse.json({ error: "chat_not_found" }, { status: 404 });

      const hasAccess = await checkChatAccess(user, chat);
      if (!hasAccess) return NextResponse.json({ error: "forbidden" }, { status: 403 });

      // وضع الرسائل والإشعارات كمقروءة
      if (user.role === "doctor" || user.role === "patient") {
        await markChatAsRead(prisma, user, chatId);
      }

      // جلب الرسائل بالترتيب الزمني
      const messages = await prisma.message.findMany({
        where: { chatId },
        orderBy: { createdAt: "asc" },
        take: 50,  // آخر 50 رسالة
        skip: 0,
      });

      return NextResponse.json({ messages });
    } catch (error) {
      console.error("/api/chat/[chatId]/messages GET error", error);
      return NextResponse.json({ error: "server_error" }, { status: 500 });
    }
  },
  CHAT_ROLES
);

// ==================== POST: إرسال رسالة ====================
export const POST = withRBAC(
  async (request, user, context) => {
    const rl = await rateLimit(request);
    if (rl.limited) {
      logAudit({
        event: "rate_limit_exceeded",
        userId: user.id,
        ip: request.headers.get("x-forwarded-for"),
        details: { endpoint: "POST /api/chat/[chatId]/messages" },
      });
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    try {
      const params = context?.params;
      const resolvedParams = typeof params?.then === "function" ? await params : params;
      const { chatId } = resolvedParams || {};
      if (!chatId || typeof chatId !== "string") return NextResponse.json({ error: "missing_chat_id" }, { status: 400 });

      const body = await request.json();
      let { text, clientKey, fileUrl, mimeType, fileName } = body || {};
      text = sanitizeText(text || "");

      if (!text && !fileUrl) return NextResponse.json({ error: "empty_message" }, { status: 400 });
      if (text.length > MAX_MESSAGE_LENGTH) return NextResponse.json({ error: "message_too_long" }, { status: 400 });

      const chat = await prisma.chat.findUnique({ where: { id: chatId } });
      if (!chat) return NextResponse.json({ error: "chat_not_found" }, { status: 404 });

      const hasAccess = await checkChatAccess(user, chat);
      if (!hasAccess) return NextResponse.json({ error: "forbidden" }, { status: 403 });

      const sender = user.role === "doctor" ? "doctor" : "patient";

      // منع تكرار الرسائل عند استخدام clientKey
      if (clientKey) {
        const existing = await prisma.message.findFirst({ where: { chatId, clientKey } });
        if (existing) return NextResponse.json({ message: existing, existing: true }, { status: 200 });
      }

      // إنشاء الرسالة
      const message = await prisma.message.create({
        data: { chatId, sender, text: text || null, clientKey, fileUrl: fileUrl || null, mimeType: mimeType || null, fileName: fileName || null },
      });

      // تحديث تاريخ تعديل الدردشة
      await prisma.chat.update({ where: { id: chatId }, data: { updatedAt: new Date() } });

      // إنشاء إشعار للطرف الآخر عند استقبال رسالة جديدة
      if (sender === "doctor") {
        const patient = await prisma.patient.findUnique({ where: { id: chat.patientId }, select: { userId: true } });
        if (patient?.userId) {
          const ok = await shouldSendChatNotification(prisma, { userId: patient.userId, chatId });
          if (ok) {
            await createNotificationBestEffort(prisma, {
              userId: patient.userId,
              type: "info",
              message: { ar: "لديك رسالة جديدة من طبيبك.", en: "You have a new message from your doctor.", meta: { kind: "chat_message", chatId } },
            });
          }
        }
      } else if (sender === "patient") {
        const doctor = await prisma.doctor.findUnique({ where: { userId: chat.doctorId }, select: { userId: true } });
        if (doctor?.userId) {
          const ok = await shouldSendChatNotification(prisma, { userId: doctor.userId, chatId });
          if (ok) {
            await createNotificationBestEffort(prisma, {
              userId: doctor.userId,
              type: "info",
              message: { ar: "لديك رسالة جديدة من مريضك.", en: "You have a new message from your patient.", meta: { kind: "chat_message", chatId } },
            });
          }
        }
      }

      return NextResponse.json({ message }, { status: 201 });
    } catch (error) {
      console.error("/api/chat/[chatId]/messages POST error", error);
      return NextResponse.json({ error: "server_error" }, { status: 500 });
    }
  },
  ["doctor", "patient"]
);
