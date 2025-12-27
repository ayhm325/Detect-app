import { NextResponse } from "next/server";
import prisma from "../../../../lib/prismaClient.js";
import { withRBAC } from "../../../../lib/auth/withRBAC";
import { rateLimit } from "../../../../lib/security/rateLimiter";
import { logAudit } from "../../../../lib/security/auditLogger";

export const GET = withRBAC(async (request, user) => {
  const rl = rateLimit(request);
  if (rl.limited) {
    logAudit({ event: "rate_limit_exceeded", userId: user.id, ip: request.headers.get('x-forwarded-for'), details: { endpoint: "GET /api/chat/patient" } });
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }
  try {
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

    logAudit({ event: "patient_chats_listed", userId: user.id, ip: request.headers.get('x-forwarded-for'), details: { chatCount: chats.length } });
    return NextResponse.json({ chats });
  } catch (error) {
    logAudit({ event: "patient_chats_list_error", userId: user.id, ip: request.headers.get('x-forwarded-for'), details: { error: error.message } });
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}, ["patient"]);
