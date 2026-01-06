
import { NextResponse } from "next/server";
import prisma from "./prismaClient";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getJwtSecret } from "../../../lib/auth/jwtSecret.js";
import { applyJwtClaimsToSignOptions } from "../../../lib/auth/jwtClaims.js";
import { createNotificationBestEffort } from "../../../lib/notifications";

// تخزين مؤقت لمحاولات الدخول (ذاكرة السيرفر فقط)
const loginAttempts = new Map();
const MAX_ATTEMPTS = 5;
const WINDOW_MINUTES = 15;

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ error: "يرجى إدخال البريد وكلمة المرور" }, { status: 400 });
    }

    // حماية brute-force: تحقق من عدد المحاولات
    const now = Date.now();
    const entry = loginAttempts.get(email) || { count: 0, first: now };
    if (entry.count >= MAX_ATTEMPTS && now - entry.first < WINDOW_MINUTES * 60 * 1000) {
      return NextResponse.json({ error: `تم تجاوز الحد الأقصى لمحاولات الدخول. يرجى المحاولة بعد ${WINDOW_MINUTES} دقيقة.` }, { status: 429 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { doctor: true },
    });
    if (!user) {
      // زيادة المحاولة
      if (entry.count === 0 || now - entry.first > WINDOW_MINUTES * 60 * 1000) {
        loginAttempts.set(email, { count: 1, first: now });
      } else {
        loginAttempts.set(email, { count: entry.count + 1, first: entry.first });
      }
      return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 });
    }
    if (process.env.DEBUG_AUTH === '1') {
      console.log("[login] user found:", { id: user.id, email: user.email, isActive: user.isActive, doctorActive: user.doctor?.isActive });
    }
    if (user.role === "doctor") {
      if (!user.doctor) {
        return NextResponse.json({ error: "حسابك قيد المراجعة من الإدارة" }, { status: 403 });
      }
      if (user.doctor.status === "banned") {
        return NextResponse.json({ error: "تم رفض طلبك" }, { status: 403 });
      }
      if (user.doctor.status !== "active") {
        return NextResponse.json({ error: "حسابك قيد المراجعة من الإدارة" }, { status: 403 });
      }
    } else {
      if (!user.isActive) {
        return NextResponse.json({ error: "الحساب غير مفعل" }, { status: 403 });
      }
    }
    if (user.isDeleted) {
      return NextResponse.json({ error: "الحساب محذوف" }, { status: 403 });
    }

    // تحقق من كلمة المرور (bcrypt)
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      // زيادة المحاولة
      if (entry.count === 0 || now - entry.first > WINDOW_MINUTES * 60 * 1000) {
        loginAttempts.set(email, { count: 1, first: now });
      } else {
        loginAttempts.set(email, { count: entry.count + 1, first: entry.first });
      }
      return NextResponse.json({ error: "كلمة المرور غير صحيحة" }, { status: 401 });
    }

    // نجاح الدخول: إعادة تعيين العداد
    loginAttempts.delete(email);

    // تسجيل نشاط الدخول في جدول Activity
    try {
      await prisma.activity.create({
        data: {
          type: "login",
          description: `تسجيل دخول: ${user.fullName} (${user.email})`,
          userId: user.id,
          meta: {
            fullName: user.fullName,
            email: user.email,
            role: user.role,
            ip: request.headers.get('x-forwarded-for') || request.headers.get('host'),
          }
        }
      });
    } catch (e) {
      // تجاهل الخطأ في تسجيل النشاط حتى لا يؤثر على عملية الدخول
      console.error("خطأ في تسجيل نشاط الدخول:", e);
    }

    // إشعار أمني (مخفف) - مرة كل 12 ساعة
    try {
      const ip = request.headers.get('x-forwarded-for') || request.headers.get('host') || null;
      const since = new Date(Date.now() - 12 * 60 * 60 * 1000);
      const existing = await prisma.notification.findFirst({
        where: {
          userId: user.id,
          isDeleted: false,
          createdAt: { gte: since },
          message: { contains: '"kind":"security_login"' },
        },
        select: { id: true },
      });
      if (!existing) {
        await createNotificationBestEffort(prisma, {
          userId: user.id,
          type: 'warning',
          message: {
            ar: 'تنبيه أمني: تم تسجيل الدخول إلى حسابك.',
            en: 'Security alert: a login to your account was detected.',
            meta: { kind: 'security_login', ip }
          }
        });
      }
    } catch (e) {
      // best-effort
      if (process.env.DEBUG_AUTH === '1') {
        console.warn('[login] security notification failed', e && e.message);
      }
    }

    // لا ترجع كلمة المرور
    const { password: _, ...userData } = user;

    // توليد JWT
    const SECRET = getJwtSecret();
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
      },
      SECRET,
      applyJwtClaimsToSignOptions({ expiresIn: '2h' }) // صلاحية التوكن ساعتان فقط
    );

    // تخزين JWT في HttpOnly Cookie
    const responseBody = { user: userData };
    // In development, also return token in body so client can use Bearer fallback if cookie isn't sent (debug only)
    const isProd = process.env.NODE_ENV === 'production';
    if (!isProd) {
      responseBody.tokenForDev = token;
    }

    const response = NextResponse.json(responseBody, { status: 200 });

    // Choose SameSite based on environment:
    // - development: use 'lax' and secure=false so cookie works on http://localhost
    // - production: use 'none' and secure=true to allow cross-site usage when needed
    const sameSite = isProd ? 'none' : 'lax';
    const secure = isProd;

    response.cookies.set('token', token, {
      httpOnly: true,
      secure,
      sameSite,
      path: '/',
      maxAge: 60 * 60 * 2, // ساعتان
    });
    return response;
  } catch (error) {
    console.error("[LOGIN ERROR]", error);
    return NextResponse.json({ error: "حدث خطأ في الخادم" }, { status: 500 });
  }
}