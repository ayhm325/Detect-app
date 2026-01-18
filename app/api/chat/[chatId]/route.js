import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "../../../../lib/prismaClient.js";
import { getJwtSecret } from "../../../../lib/auth/jwtSecret.js";
import { getJwtVerifyOptions } from "../../../../lib/auth/jwtClaims.js";

export async function DELETE(request, context) {
  try {
    const params = context?.params;
    const resolvedParams =
      typeof params?.then === "function" ? await params : params;
    const { chatId } = resolvedParams || {};
    if (!chatId || typeof chatId !== "string") {
      console.error("/api/chat/[chatId] DELETE missing chatId", resolvedParams);
      return NextResponse.json({ error: "missing_chat_id" }, { status: 400 });
    }

    // Accept token from cookie OR Authorization header (Bearer) as fallback
    let token = request.cookies.get("token")?.value;
    if (!token) {
      const hdr =
        request.headers.get("authorization") ||
        request.headers.get("Authorization");
      if (hdr && hdr.startsWith("Bearer ")) token = hdr.slice(7).trim();
    }
    if (!token) {
      console.warn(
        "/api/chat/[chatId] DELETE missing auth token (cookie/header)",
      );
      return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
    }
    let user;
    try {
      user = jwt.verify(token, getJwtSecret(), getJwtVerifyOptions());
    } catch (e) {
      return NextResponse.json({ error: "invalid_token" }, { status: 401 });
    }

    const chat = await prisma.chat.findUnique({ where: { id: chatId } });
    if (!chat)
      return NextResponse.json({ error: "chat_not_found" }, { status: 404 });

    // authorize: only doctor (owner) or patient participant can delete
    if (user.role === "doctor") {
      if (chat.doctorId !== user.id)
        return NextResponse.json({ error: "forbidden" }, { status: 403 });
    } else if (user.role === "patient") {
      const patient = await prisma.patient.findUnique({
        where: { userId: user.id },
      });
      if (!patient || patient.id !== chat.patientId)
        return NextResponse.json({ error: "forbidden" }, { status: 403 });
    } else if (user.role === "admin") {
      // admins may delete any chat
    } else {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }

    // delete messages and chat inside a transaction
    await prisma.$transaction([
      prisma.message.deleteMany({ where: { chatId } }),
      prisma.chat.delete({ where: { id: chatId } }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("/api/chat/[chatId] DELETE error", error);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
