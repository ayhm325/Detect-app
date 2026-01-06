import { NextResponse } from "next/server";
import prisma from "../../../../lib/prismaClient.js";
import { withRBAC } from "../../../../lib/auth/withRBAC";
import { rateLimit } from "../../../../lib/security/rateLimiter";
import { logAudit } from "../../../../lib/security/auditLogger";
import { createNotificationBestEffort } from "../../../../lib/notifications";

export const GET = withRBAC(async (request, user) => {
  const rl = await rateLimit(request);
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

    logAudit({ event: "patient_chats_listed", userId: user.id, ip: request.headers.get('x-forwarded-for'), details: { chatCount: chats.length } });
    return NextResponse.json({ chats });
  } catch (error) {
    logAudit({ event: "patient_chats_list_error", userId: user.id, ip: request.headers.get('x-forwarded-for'), details: { error: error.message } });
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}, ["patient"]);

export const POST = withRBAC(async (request, user) => {
  const rl = await rateLimit(request);
  if (rl.limited) {
    logAudit({ event: "rate_limit_exceeded", userId: user.id, ip: request.headers.get('x-forwarded-for'), details: { endpoint: "POST /api/chat/patient" } });
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }
  try {
    const body = await request.json();

    if (user.role === "doctor") {
      const { patientId } = body || {};
      if (!patientId) {
        return NextResponse.json({ error: "missing_patient_id" }, { status: 400 });
      }

      let chat = await prisma.chat.findFirst({ where: { doctorId: user.id, patientId } });
      let created = false;
      if (!chat) {
        chat = await prisma.chat.create({ data: { doctorId: user.id, patientId } });
        created = true;
      }

      if (created) {
        const patient = await prisma.patient.findUnique({ where: { id: patientId }, select: { userId: true } });
        if (patient?.userId) {
          await createNotificationBestEffort(prisma, {
            userId: patient.userId,
            type: "info",
            message: {
              ar: "تم بدء محادثة جديدة مع طبيبك.",
              en: "A new chat was started with your doctor.",
              meta: { kind: "chat_created", chatId: chat.id }
            }
          });
        }
      }

      logAudit({ event: "doctor_chat_created_or_reused", userId: user.id, ip: request.headers.get('x-forwarded-for'), details: { chatId: chat.id, patientId, created } });
      return NextResponse.json({ chat, created }, { status: created ? 201 : 200 });
    }

    if (user.role === "patient") {
      const patient = await prisma.patient.findUnique({ where: { userId: user.id } });
      if (!patient) {
        return NextResponse.json({ error: "patient_not_found" }, { status: 404 });
      }
      if (!patient.doctorId) {
        return NextResponse.json({ error: "no_doctor_linked" }, { status: 400 });
      }

      let chat = await prisma.chat.findFirst({ where: { doctorId: patient.doctorId, patientId: patient.id } });
      let created = false;
      if (!chat) {
        chat = await prisma.chat.create({ data: { doctorId: patient.doctorId, patientId: patient.id } });
        created = true;
      }

      if (created) {
        await createNotificationBestEffort(prisma, {
          userId: user.id,
          type: "info",
          message: {
            ar: "تم بدء محادثة جديدة مع طبيبك.",
            en: "A new chat was started with your doctor.",
            meta: { kind: "chat_created", chatId: chat.id }
          }
        });

        if (patient.doctorId) {
          const patientName = patient?.fullName || null;
          await createNotificationBestEffort(prisma, {
            userId: patient.doctorId,
            type: "info",
            message: {
              ar: `تم بدء محادثة جديدة من${patientName ? ` المريض ${patientName}` : ' أحد المرضى'}.`,
              en: `A new chat was started by${patientName ? ` patient ${patientName}` : ' a patient'}.`,
              meta: { kind: "chat_created", chatId: chat.id }
            }
          });
        }
      }

      logAudit({ event: "patient_chat_created_or_reused", userId: user.id, ip: request.headers.get('x-forwarded-for'), details: { chatId: chat.id, created } });
      return NextResponse.json({ chat, created }, { status: created ? 201 : 200 });
    }

    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  } catch (error) {
    logAudit({ event: "chat_patient_post_error", userId: user?.id, ip: request.headers.get('x-forwarded-for'), details: { error: error.message } });
    if (process.env.NODE_ENV !== "production") {
      return NextResponse.json({ error: error.message || String(error) }, { status: 500 });
    }
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}, ["doctor", "patient"]);
