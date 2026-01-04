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
      const hdr = request.headers.get("authorization") || request.headers.get("Authorization");
      if (hdr && hdr.startsWith("Bearer ")) token = hdr.slice(7).trim();
    }
    if (!token) {
      return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
    }

    let user;
    try {
      user = jwt.verify(token, getJwtSecret(), getJwtVerifyOptions());
    } catch {
      return NextResponse.json({ error: "invalid_token" }, { status: 401 });
    }

    if (user.role !== "admin") {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }

    const chats = await prisma.chat.findMany({
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        updatedAt: true,
        patient: { select: { id: true, fullName: true, email: true, status: true } },
        doctor: {
          select: {
            userId: true,
            user: { select: { id: true, fullName: true, email: true } },
          },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: {
            id: true,
            sender: true,
            text: true,
            fileUrl: true,
            mimeType: true,
            fileName: true,
            status: true,
            createdAt: true,
          },
        },
      },
    });

    return NextResponse.json({ chats });
  } catch (error) {
    console.error("/api/chat/admin error", error);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
