import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import prisma from "../../../../lib/prismaClient.js";

const SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function GET(request) {
  try {
    // Accept token from cookie OR Authorization header (Bearer) as fallback
    let token = request.cookies.get("token")?.value;
    if (!token) {
      const hdr = request.headers.get("authorization") || request.headers.get("Authorization");
      if (hdr && hdr.startsWith("Bearer ")) token = hdr.slice(7).trim();
    }
    if (!token) {
      console.warn("/api/chat/patient missing auth token (cookie/header)");
      return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
    }
    let user;
    try {
      user = jwt.verify(token, SECRET);
      console.debug("/api/chat/patient decoded user:", user);
    } catch (e) {
      return NextResponse.json({ error: "invalid_token" }, { status: 401 });
    }
    if (user.role !== "patient") {
      console.warn("/api/chat/patient forbidden - user role:", user.role);
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }

    // find patient record
    const patient = await prisma.patient.findUnique({ where: { userId: user.id } });
    if (!patient) return NextResponse.json({ error: "patient_not_found" }, { status: 404 });

    const chats = await prisma.chat.findMany({
      where: { patientId: patient.id },
      include: {
        doctor: { include: { user: true } },
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ chats });
  } catch (error) {
    console.error("/api/chat/patient error", error);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
