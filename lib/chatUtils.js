// lib/chatUtils.js
// دوال مشتركة لإدارة المحادثات والرسائل والإشعارات

import prisma from "./prismaClient.js";
import { createNotificationBestEffort } from "./notifications";

// دالة لإنشاء أو جلب محادثة بين طبيب ومريض
export async function getOrCreateChat(doctorId, patientId) {
  let chat = await prisma.chat.findFirst({ where: { doctorId, patientId } });
  let created = false;
  if (!chat) {
    chat = await prisma.chat.create({ data: { doctorId, patientId } });
    created = true;
  }
  return { chat, created };
}

// دالة لإرسال إشعار بدء المحادثة
export async function notifyChatCreated(userId, chatId, role, patientName = null) {
  if (role === "patient") {
    await createNotificationBestEffort(prisma, {
      userId,
      type: "info",
      message: {
        ar: "تم بدء محادثة جديدة مع طبيبك.",
        en: "A new chat was started with your doctor.",
        meta: { kind: "chat_created", chatId },
      },
    });
  } else if (role === "doctor") {
    await createNotificationBestEffort(prisma, {
      userId,
      type: "info",
      message: {
        ar: `تم بدء محادثة جديدة من${patientName ? ` المريض ${patientName}` : " أحد المرضى" }.`,
        en: `A new chat was started by${patientName ? ` patient ${patientName}` : " a patient" }.`,
        meta: { kind: "chat_created", chatId },
      },
    });
  }
}

// دالة لحساب عدد الرسائل غير المقروءة في محادثة
export async function getUnreadCount(chatId, userId, userRole) {
  const sender = userRole === "patient" ? "doctor" : "patient";
  return await prisma.message.count({
    where: {
      chatId,
      sender,
      status: { not: "read" },
    },
  });
}

// دالة تحقق صلاحية المستخدم بالنسبة للمحادثة
export async function checkChatAccess(user, chat) {
  if (user.role === "doctor") {
    return chat.doctorId === user.id;
  } else if (user.role === "patient") {
    const patient = await prisma.patient.findUnique({ where: { userId: user.id } });
    return patient && patient.id === chat.patientId;
  } else if (user.role === "admin") {
    return true;
  }
  return false;
}
