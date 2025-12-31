import { NextResponse } from "next/server";
import prisma from "../../../../../lib/prismaClient.js";
import { withRBAC } from "../../../../../lib/auth/withRBAC";
import { rateLimit } from "../../../../../lib/security/rateLimiter";
import { logAudit } from "../../../../../lib/security/auditLogger";

// Basic text sanitization
function sanitizeText(txt = "") {
  // remove HTML tags
  const stripped = txt.replace(/<[^>]*>/g, "");
  // further normalization
  return stripped.trim();
}

export const GET = withRBAC(async (request, user, context) => {
  const rl = await rateLimit(request);
  if (rl.limited) {
    logAudit({ event: "rate_limit_exceeded", userId: user.id, ip: request.headers.get('x-forwarded-for'), details: { endpoint: "GET /api/chat/[chatId]/messages" } });
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }
  try {
    const params = context?.params;
    const resolvedParams = typeof params?.then === "function" ? await params : params;
    const { chatId } = resolvedParams || {};
    if (!chatId || typeof chatId !== "string") {
      return NextResponse.json({ error: "missing_chat_id" }, { status: 400 });
    }

    // authorize: doctor or patient participant
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

    const messages = await prisma.message.findMany({ where: { chatId }, orderBy: { createdAt: "asc" } });
    return NextResponse.json({ messages });
  } catch (error) {
    console.error("/api/chat/[chatId]/messages GET error", error);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}, ["doctor", "patient"]);

export const POST = withRBAC(async (request, user, context) => {
  const rl = await rateLimit(request);
  if (rl.limited) {
    logAudit({ event: "rate_limit_exceeded", userId: user.id, ip: request.headers.get('x-forwarded-for'), details: { endpoint: "POST /api/chat/[chatId]/messages" } });
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
    // Accept either text or a file Url
    if (!text && !fileUrl) return NextResponse.json({ error: "empty_message" }, { status: 400 });
    if (text && text.length > 2000) return NextResponse.json({ error: "message_too_long" }, { status: 400 });

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
      if (existing) return NextResponse.json({ message: existing, existing: true }, { status: 200 });
    }

    const message = await prisma.message.create({ data: { chatId, sender, text: text || null, clientKey, fileUrl: fileUrl || null, mimeType: mimeType || null, fileName: fileName || null } });
    await prisma.chat.update({ where: { id: chatId }, data: { updatedAt: new Date() } });
    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    console.error("/api/chat/[chatId]/messages POST error", error);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}, ["doctor", "patient"]);
