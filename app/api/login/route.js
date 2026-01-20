import { NextResponse } from "next/server";
import prisma from "./prismaClient";
import bcrypt from "../../../lib/auth/bcryptWrapper.mjs";
import jwt from "jsonwebtoken";
import { getJwtSecret } from "../../../lib/auth/jwtSecret.js";
import { applyJwtClaimsToSignOptions } from "../../../lib/auth/jwtClaims.js";
import { createNotificationBestEffort } from "../../../lib/notifications";

// =======================================
// تخزين مؤقت لمحاولات تسجيل الدخول
// (ذاكرة السيرفر فقط – ليست قاعدة بيانات)
// =======================================
const loginAttempts = new Map();
const MAX_ATTEMPTS = 5;        // الحد الأقصى لمحاولات الدخول
const WINDOW_MINUTES = 15;     // نافذة الزمن بالدقائق

export async function POST(request) {
  try {
    // استخراج البريد الإلكتروني وكلمة المرور من جسم الطلب
    const { email, password } = await request.json();

    // التحقق من وجود القيم المطلوبة
    if (!email || !password) {
      return NextResponse.json(
        { error: "يرجى إدخال البريد وكلمة المرور" },
        { status: 400 },
      );
    }

    // =======================================
    // حماية brute-force (محاولات متكررة)
    // =======================================
    const now = Date.now();
    const entry = loginAttempts.get(email) || { count: 0, first: now };

    // إذا تجاوز عدد المحاولات خلال الفترة الزمنية المحددة
    if (
      entry.count >= MAX_ATTEMPTS &&
      now - entry.first < WINDOW_MINUTES * 60 * 1000
    ) {
      return NextResponse.json(
        {
          error: `تم تجاوز الحد الأقصى لمحاولات الدخول. يرجى المحاولة بعد ${WINDOW_MINUTES} دقيقة.`,
        },
        { status: 429 },
      );
    }

    // =======================================
    // جلب المستخدم من قاعدة البيانات
    // =======================================
    const user = await prisma.user.findUnique({
      where: { email },
      include: { doctor: true }, // في حال كان المستخدم طبيب
    });

    // في حال لم يتم العثور على المستخدم
    if (!user) {
      // تحديث عداد المحاولات
      if (entry.count === 0 || now - entry.first > WINDOW_MINUTES * 60 * 1000) {
        loginAttempts.set(email, { count: 1, first: now });
      } else {
        loginAttempts.set(email, {
          count: entry.count + 1,
          first: entry.first,
        });
      }

      return NextResponse.json(
        { error: "المستخدم غير موجود" },
        { status: 404 },
      );
    }

    // طباعة معلومات المستخدم عند تفعيل DEBUG
    if (process.env.DEBUG_AUTH === "1") {
      console.log("[login] user found:", {
        id: user.id,
        email: user.email,
        isActive: user.isActive,
        doctorActive: user.doctor?.isActive,
      });
    }

    // =======================================
    // تحقق خاص بالأطباء
    // =======================================
    if (user.role === "doctor") {
      // في حال لا يوجد سجل طبيب مرتبط
      if (!user.doctor) {
        return NextResponse.json(
          { error: "حسابك قيد المراجعة من الإدارة" },
          { status: 403 },
        );
      }

      // في حال الطبيب محظور
      if (user.doctor.status === "banned") {
        return NextResponse.json({ error: "تم رفض طلبك" }, { status: 403 });
      }

      // في حال الطبيب غير مفعل بعد
      if (user.doctor.status !== "active") {
        return NextResponse.json(
          { error: "حسابك قيد المراجعة من الإدارة" },
          { status: 403 },
        );
      }
    } else {
      // =======================================
      // تحقق خاص بغير الأطباء (مريض / مدير ...)
      // =======================================
      if (!user.isActive) {
        return NextResponse.json({ error: "الحساب غير مفعل" }, { status: 403 });
      }
    }

    // منع الدخول للحسابات المحذوفة
    if (user.isDeleted) {
      return NextResponse.json({ error: "الحساب محذوف" }, { status: 403 });
    }

    // =======================================
    // التحقق من كلمة المرور باستخدام bcrypt
    // =======================================
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      // تحديث عداد المحاولات عند فشل كلمة المرور
      if (entry.count === 0 || now - entry.first > WINDOW_MINUTES * 60 * 1000) {
        loginAttempts.set(email, { count: 1, first: now });
      } else {
        loginAttempts.set(email, {
          count: entry.count + 1,
          first: entry.first,
        });
      }

      return NextResponse.json(
        { error: "كلمة المرور غير صحيحة" },
        { status: 401 },
      );
    }

    // =======================================
    // نجاح تسجيل الدخول
    // =======================================
    // إعادة تعيين عداد المحاولات
    loginAttempts.delete(email);

    // =======================================
    // تسجيل نشاط الدخول (Activity Log)
    // =======================================
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
            ip:
              request.headers.get("x-forwarded-for") ||
              request.headers.get("host"),
          },
        },
      });
    } catch (e) {
      // تجاهل الخطأ حتى لا يفشل تسجيل الدخول
      console.error("خطأ في تسجيل نشاط الدخول:", e);
    }

    // =======================================
    // إشعار أمني بتسجيل الدخول (مرة كل 12 ساعة)
    // =======================================
    try {
      const ip =
        request.headers.get("x-forwarded-for") ||
        request.headers.get("host") ||
        null;

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

      // إرسال الإشعار فقط إذا لم يتم إرساله خلال 12 ساعة
      if (!existing) {
        await createNotificationBestEffort(prisma, {
          userId: user.id,
          type: "warning",
          message: {
            ar: "تنبيه أمني: تم تسجيل الدخول إلى حسابك.",
            en: "Security alert: a login to your account was detected.",
            meta: { kind: "security_login", ip },
          },
        });
      }
    } catch (e) {
      // best-effort (لا يؤثر على تسجيل الدخول)
      if (process.env.DEBUG_AUTH === "1") {
        console.warn("[login] security notification failed", e && e.message);
      }
    }

    // =======================================
    // إزالة كلمة المرور من بيانات المستخدم
    // =======================================
    const { password: _, ...userData } = user;

    // =======================================
    // توليد JWT
    // =======================================
    const SECRET = getJwtSecret();
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
        isActive: !!user.isActive,
      },
      SECRET,
      applyJwtClaimsToSignOptions({ expiresIn: "2h" }), // صلاحية التوكن ساعتان
    );

    // =======================================
    // إعداد الاستجابة
    // =======================================
    const responseBody = { user: userData };

    // في وضع التطوير فقط: إرجاع التوكن داخل الـ body
    const isProd = process.env.NODE_ENV === "production";
    if (!isProd) {
      responseBody.tokenForDev = token;
    }

    const response = NextResponse.json(responseBody, { status: 200 });

    // إعدادات الكوكي حسب البيئة
    const sameSite = isProd ? "none" : "lax";
    const secure = isProd;

    // تخزين JWT داخل Cookie محمية
    response.cookies.set("token", token, {
      httpOnly: true,
      secure,
      sameSite,
      path: "/",
      maxAge: 60 * 60 * 2, // ساعتان
    });

    return response;
  } catch (error) {
    // خطأ عام غير متوقع
    console.error("[LOGIN ERROR]", error);
    return NextResponse.json({ error: "حدث خطأ في الخادم" }, { status: 500 });
  }
}
