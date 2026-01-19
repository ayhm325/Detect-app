import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "../../../../lib/prismaClient.js";
import { getOrCreateChat, getUnreadCount } from "../../../../lib/chatUtils.js";
import { getJwtSecret } from "../../../../lib/auth/jwtSecret.js";
import { getJwtVerifyOptions } from "../../../../lib/auth/jwtClaims.js";

export function POST() {
  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
}

export async function GET(request) {
  try {
    // استخراج التوكن والتحقق من الصلاحية
    let token = request.cookies.get("token")?.value;
    if (!token) {
      const hdr = request.headers.get("authorization") || request.headers.get("Authorization");
      if (hdr && hdr.startsWith("Bearer ")) token = hdr.slice(7).trim();
    }
    if (!token) {
      console.warn("/api/chat/doctor missing auth token (cookie/header)");
      return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
    }
    let user;
    try {
      user = jwt.verify(token, getJwtSecret(), getJwtVerifyOptions());
    } catch (e) {
      return NextResponse.json({ error: "invalid_token" }, { status: 401 });
    }
    if (user.role !== "doctor") {
      console.warn("/api/chat/doctor forbidden - user role:", user.role);
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }

    // جلب المرضى المرتبطين بالطبيب
    const patients = await prisma.patient.findMany({
      where: { doctorId: user.id, status: "active" },
      select: {
        id: true,
        userId: true,
        fullName: true,
        email: true,
        status: true,
      },
    });

    // جلب أو إنشاء المحادثات لكل مريض بشكل متوازي
    const chats = await Promise.all(
      patients.map(async (p) => {
        const { chat } = await getOrCreateChat(user.id, p.id);
        return { id: chat.id, patient: p };
      })
    );

    // جلب أي محادثات إضافية للطبيب مع مرضى غير مرتبطين مباشرة
    const extraChats = await prisma.chat.findMany({
      where: { doctorId: user.id },
      include: {
        patient: {
          select: {
            id: true,
            userId: true,
            fullName: true,
            email: true,
            status: true,
          },
        },
      },
    });
    for (const c of extraChats) {
      if (!chats.find((x) => x.id === c.id) && c.patient?.status === "active")
        chats.push({ id: c.id, patient: c.patient });
    }

    // جلب آخر رسالة لكل محادثة في استعلام واحد
    const chatIds = chats.map((c) => c.id);
    let lastMessages = [];
    if (chatIds.length) {
      lastMessages = await prisma.message.findMany({
        where: { chatId: { in: chatIds } },
        orderBy: [{ chatId: "asc" }, { createdAt: "desc" }],
        distinct: ["chatId"],
        take: chatIds.length,
      });
    }

    // حساب الرسائل غير المقروءة لكل محادثة في استعلام واحد
    let unreadCounts = {};
    if (chatIds.length) {
      const grouped = await prisma.message.groupBy({
        by: ["chatId"],
        where: {
          chatId: { in: chatIds },
          sender: "patient",
          status: { not: "read" },
        },
        _count: { _all: true },
      });
      for (const row of grouped) {
        unreadCounts[row.chatId] = row._count?._all || 0;
      }
    }

    // بناء الاستجابة النهائية
    const chatsWithDetails = chats.map((c) => {
      const lastMsg = lastMessages.find((m) => m.chatId === c.id);
      return {
        id: c.id,
        patient: c.patient,
        messages: lastMsg ? [lastMsg] : [],
        unreadCount: unreadCounts[c.id] || 0,
      };
    });

    // ترتيب حسب آخر رسالة
    chatsWithDetails.sort((a, b) => {
      const ta = a.messages[0]?.createdAt ? new Date(a.messages[0].createdAt).getTime() : 0;
      const tb = b.messages[0]?.createdAt ? new Date(b.messages[0].createdAt).getTime() : 0;
      return tb - ta;
    });

    return NextResponse.json({ chats: chatsWithDetails });
  } catch (error) {
    console.error("/api/chat/doctor error", error);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
