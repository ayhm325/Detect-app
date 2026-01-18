import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "../../../../lib/prismaClient.js";
import { getJwtSecret } from "../../../../lib/auth/jwtSecret.js";
import { getJwtVerifyOptions } from "../../../../lib/auth/jwtClaims.js";

export function POST() {
  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
}

export async function GET(request) {
  try {
    // Accept token from cookie OR Authorization header (Bearer) as fallback
    let token = request.cookies.get("token")?.value;
    if (!token) {
      const hdr =
        request.headers.get("authorization") ||
        request.headers.get("Authorization");
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

    // Ensure we return all patients assigned to this doctor.
    // For patients without a Chat row yet, create one so doctor can start messaging.
    // only include patients who are currently active
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

    const chats = [];
    for (const p of patients) {
      let chat = await prisma.chat.findFirst({
        where: { doctorId: user.id, patientId: p.id },
        include: { messages: { orderBy: { createdAt: "desc" }, take: 1 } },
      });
      if (!chat) {
        chat = await prisma.chat.create({
          data: { doctorId: user.id, patientId: p.id },
        });
      }
      chats.push({ id: chat.id, patient: p, messages: chat.messages || [] });
    }

    // Also include any chats that might exist for this doctor but whose patient isn't linked via doctorId
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
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    });
    for (const c of extraChats) {
      // avoid duplicates and only include if patient is active
      if (!chats.find((x) => x.id === c.id) && c.patient?.status === "active")
        chats.push(c);
    }

    // sort by last updated (messages or chat.updatedAt)
    chats.sort((a, b) => {
      const ta =
        a.messages && a.messages[0]?.createdAt
          ? new Date(a.messages[0].createdAt).getTime()
          : 0;
      const tb =
        b.messages && b.messages[0]?.createdAt
          ? new Date(b.messages[0].createdAt).getTime()
          : 0;
      return tb - ta;
    });

    // Unread messages for doctor: messages sent by patient and not yet read.
    const chatIds = chats.map((c) => c.id);
    const unreadByChat = new Map();
    try {
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
          unreadByChat.set(row.chatId, row._count?._all || 0);
        }
      }
    } catch (e) {
      // Best-effort: if groupBy isn't supported in this Prisma version, fall back to 0.
      console.warn(
        "/api/chat/doctor unreadCount compute failed",
        e?.message || e,
      );
    }

    const chatsWithUnread = chats.map((c) => ({
      ...c,
      unreadCount: unreadByChat.get(c.id) || 0,
    }));

    return NextResponse.json({ chats: chatsWithUnread });
  } catch (error) {
    console.error("/api/chat/doctor error", error);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
