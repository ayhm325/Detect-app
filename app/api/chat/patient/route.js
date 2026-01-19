import { NextResponse } from "next/server";
import prisma from "../../../../lib/prismaClient.js";
import { withRBAC } from "../../../../lib/auth/withRBAC";
import { rateLimit } from "../../../../lib/security/rateLimiter";
import { logAudit } from "../../../../lib/security/auditLogger";
import { getOrCreateChat, notifyChatCreated, getUnreadCount } from "../../../../lib/chatUtils.js";


// جلب جميع محادثات المريض مع آخر رسالة وعدد الرسائل غير المقروءة
export const GET = withRBAC(
  async (request, user) => {
    // تحقق من الحد الأقصى للطلبات
    const rl = await rateLimit(request);
    if (rl.limited) {
      logAudit({
        event: "rate_limit_exceeded",
        userId: user.id,
        ip: request.headers.get("x-forwarded-for"),
        details: { endpoint: "GET /api/chat/patient" },
      });
      return NextResponse.json({ error: "rate_limit_exceeded", code: "RL01" }, { status: 429 });
    }
    try {
      // جلب بيانات المريض والتحقق من الحالة
      const patient = await prisma.patient.findUnique({ where: { userId: user.id }, include: { user: true } });
      if (!patient || !patient.user?.isActive) {
        logAudit({
          event: "patient_not_found",
          userId: user.id,
          ip: request.headers.get("x-forwarded-for"),
        });
        return NextResponse.json({ error: "patient_not_found", code: "PT01" }, { status: 404 });
      }

      // جلب جميع المحادثات مع آخر رسالة فقط
      const chats = await prisma.chat.findMany({
        where: { patientId: patient.id },
        include: {
          doctor: {
            select: {
              userId: true,
              phone: true,
              clinic: true,
              user: {
                select: {
                  id: true,
                  fullName: true,
                  email: true,
                  isActive: true,
                  role: true,
                  createdAt: true,
                },
              },
            },
          },
          messages: { orderBy: { createdAt: "desc" }, take: 1 },
        },
        orderBy: { updatedAt: "desc" },
      });

      // استعلام واحد لحساب الرسائل غير المقروءة
      const chatIds = chats.map((c) => c.id);
      let unreadCounts = {};
      if (chatIds.length) {
        const grouped = await prisma.message.groupBy({
          by: ["chatId"],
          where: {
            chatId: { in: chatIds },
            sender: "doctor",
            status: { not: "read" },
          },
          _count: { _all: true },
        });
        for (const row of grouped) {
          unreadCounts[row.chatId] = row._count?._all || 0;
        }
      }

      // بناء الاستجابة النهائية
      const chatsWithUnread = chats.map((chat) => ({
        ...chat,
        unreadCount: unreadCounts[chat.id] || 0,
      }));

      logAudit({
        event: "patient_chats_listed",
        userId: user.id,
        ip: request.headers.get("x-forwarded-for"),
        details: { chatCount: chats.length },
      });
      return NextResponse.json({ chats: chatsWithUnread });
    } catch (error) {
      logAudit({
        event: "patient_chats_list_error",
        userId: user.id,
        ip: request.headers.get("x-forwarded-for"),
        details: { error: error.stack || error.message },
      });
      return NextResponse.json({ error: error.message || "server_error", code: "SRV01" }, { status: 500 });
    }
  },
  ["patient"],
);

// إنشاء أو جلب محادثة بين الطبيب والمريض مع إرسال إشعار
export const POST = withRBAC(
  async (request, user) => {
    // تحقق من الحد الأقصى للطلبات
    const rl = await rateLimit(request);
    if (rl.limited) {
      logAudit({
        event: "rate_limit_exceeded",
        userId: user.id,
        ip: request.headers.get("x-forwarded-for"),
        details: { endpoint: "POST /api/chat/patient" },
      });
      return NextResponse.json({ error: "rate_limit_exceeded", code: "RL02" }, { status: 429 });
    }
    try {
      const body = await request.json();

      if (user.role === "doctor") {
        const { patientId } = body || {};
        if (!patientId) {
          return NextResponse.json({ error: "missing_patient_id", code: "PT02" }, { status: 400 });
        }
        // استخدام الدالة المشتركة
        const { chat, created } = await getOrCreateChat(user.id, patientId);
        // جلب بيانات المريض مرة واحدة فقط
        const patient = await prisma.patient.findUnique({ where: { id: patientId }, select: { userId: true, fullName: true, user: { select: { isActive: true } } } });
        if (!patient?.userId || patient.user?.isActive === false) {
          return NextResponse.json({ error: "patient_inactive", code: "PT04" }, { status: 400 });
        }
        if (created) {
          await notifyChatCreated(patient.userId, chat.id, "patient");
          await notifyChatCreated(user.id, chat.id, "doctor", patient?.fullName || null);
        }
        logAudit({
          event: "doctor_chat_created_or_reused",
          userId: user.id,
          ip: request.headers.get("x-forwarded-for"),
          details: { chatId: chat.id, patientId, created },
        });
        return NextResponse.json({ chat, created }, { status: created ? 201 : 200 });
      }

      if (user.role === "patient") {
        const patient = await prisma.patient.findUnique({ where: { userId: user.id }, include: { user: true } });
        if (!patient || !patient.user?.isActive) {
          logAudit({
            event: "patient_not_found",
            userId: user.id,
            ip: request.headers.get("x-forwarded-for"),
          });
          return NextResponse.json({ error: "patient_not_found", code: "PT01" }, { status: 404 });
        }
        if (!patient.doctorId) {
          return NextResponse.json({ error: "no_doctor_linked", code: "PT03" }, { status: 400 });
        }
        // استخدام الدالة المشتركة
        const { chat, created } = await getOrCreateChat(patient.doctorId, patient.id);
        if (created) {
          await notifyChatCreated(user.id, chat.id, "patient");
          await notifyChatCreated(patient.doctorId, chat.id, "doctor", patient?.fullName || null);
        }
        logAudit({
          event: "patient_chat_created_or_reused",
          userId: user.id,
          ip: request.headers.get("x-forwarded-for"),
          details: { chatId: chat.id, created },
        });
        return NextResponse.json({ chat, created }, { status: created ? 201 : 200 });
      }

      return NextResponse.json({ error: "forbidden", code: "AUTH01" }, { status: 403 });
    } catch (error) {
      logAudit({
        event: "chat_patient_post_error",
        userId: user?.id,
        ip: request.headers.get("x-forwarded-for"),
        details: { error: error.message },
      });
      return NextResponse.json({ error: error.message || "server_error", code: "SRV02" }, { status: 500 });
    }
  },
  ["doctor", "patient"],
);
