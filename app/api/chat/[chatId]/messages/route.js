import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "../../../../../lib/prismaClient.js";

const SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function GET(request, context) {
  try {
    const params = context?.params;
    const resolvedParams = typeof params?.then === "function" ? await params : params;
    const { chatId } = resolvedParams || {};
    if (!chatId || typeof chatId !== "string") {
      console.error("/api/chat/[chatId]/messages GET missing chatId", resolvedParams);
      return NextResponse.json({ error: "missing_chat_id" }, { status: 400 });
    }
    // Accept token from cookie OR Authorization header (Bearer) as fallback
    let token = request.cookies.get("token")?.value;
    if (!token) {
      const hdr = request.headers.get("authorization") || request.headers.get("Authorization");
      if (hdr && hdr.startsWith("Bearer ")) token = hdr.slice(7).trim();
    }
    if (!token) {
      console.warn("/api/chat/[chatId]/messages GET missing auth token (cookie/header)");
      return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
    }
    let user;
    try {
      user = jwt.verify(token, SECRET);
    } catch (e) {
      return NextResponse.json({ error: "invalid_token" }, { status: 401 });
    }

    const chat = await prisma.chat.findUnique({ where: { id: chatId } });
    if (!chat) return NextResponse.json({ error: "chat_not_found" }, { status: 404 });

    // authorize: doctor or patient participant
    if (user.role === "doctor") {
      if (chat.doctorId !== user.id) return NextResponse.json({ error: "forbidden" }, { status: 403 });
    } else if (user.role === "patient") {
      const patient = await prisma.patient.findUnique({ where: { userId: user.id } });
      if (!patient || patient.id !== chat.patientId) return NextResponse.json({ error: "forbidden" }, { status: 403 });
    } else {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }

    const messages = await prisma.message.findMany({ where: { chatId }, orderBy: { createdAt: "asc" } });
    return NextResponse.json({ messages });
  } catch (error) {
    console.error("/api/chat/[chatId]/messages GET error", error);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}

export async function POST(request, context) {
  try {
    const params = context?.params;
    const resolvedParams = typeof params?.then === "function" ? await params : params;
    const { chatId } = resolvedParams || {};
    if (!chatId || typeof chatId !== "string") {
      console.error("/api/chat/[chatId]/messages POST missing chatId", resolvedParams);
      return NextResponse.json({ error: "missing_chat_id" }, { status: 400 });
    }
    // Accept token from cookie OR Authorization header (Bearer) as fallback
    let token = request.cookies.get("token")?.value;
    if (!token) {
      const hdr = request.headers.get("authorization") || request.headers.get("Authorization");
      if (hdr && hdr.startsWith("Bearer ")) token = hdr.slice(7).trim();
    }
    if (!token) {
      console.warn("/api/chat/[chatId]/messages POST missing auth token (cookie/header)");
      return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
    }
    let user;
    try {
      user = jwt.verify(token, SECRET);
    } catch (e) {
      return NextResponse.json({ error: "invalid_token" }, { status: 401 });
    }

    const body = await request.json();
    const { text, clientKey } = body;
    if (!text || !text.trim()) return NextResponse.json({ error: "empty_message" }, { status: 400 });

    const chat = await prisma.chat.findUnique({ where: { id: chatId } });
    if (!chat) return NextResponse.json({ error: "chat_not_found" }, { status: 404 });

    if (user.role === "doctor") {
      if (chat.doctorId !== user.id) return NextResponse.json({ error: "forbidden" }, { status: 403 });
    } else if (user.role === "patient") {
      const patient = await prisma.patient.findUnique({ where: { userId: user.id } });
      if (!patient || patient.id !== chat.patientId) return NextResponse.json({ error: "forbidden" }, { status: 403 });
    } else {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }

    const sender = user.role === "doctor" ? "doctor" : "patient";

    // If clientKey provided, attempt idempotent lookup first
    if (clientKey) {
      const existing = await prisma.message.findFirst({ where: { chatId, clientKey } });
      if (existing) {
        return NextResponse.json({ message: existing, existing: true }, { status: 200 });
      }
    }

    const message = await prisma.message.create({ data: { chatId, sender, text, clientKey } });

    // touch chat updatedAt
    await prisma.chat.update({ where: { id: chatId }, data: { updatedAt: new Date() } });

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    console.error("/api/chat/[chatId]/messages POST error", error);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
