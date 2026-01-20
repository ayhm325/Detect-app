// Security: جميع الـ API محمية بواسطة withRBAC() لتطبيق المصادقة وRBAC.
// Rate limiting و audit logging مفعلة لجميع الـ endpoints الحساسة للإدارة.

import { withRBAC } from "../../../../lib/auth/withRBAC";
import prisma from "../../../../lib/prismaClient";
import { rateLimit } from "../../../../lib/security/rateLimiter";
import { logAudit } from "../../../../lib/security/auditLogger";

/////////////////////////
// GET /api/admin/users
// جلب كل المستخدمين مع تفاصيل الطبيب/المريض (إن وجد)
/////////////////////////
export const GET = withRBAC(
  async (request, user) => {
    // تطبيق rate limiting
    const rl = await rateLimit(request);
    if (rl.limited) {
      logAudit({
        event: "rate_limit_exceeded",
        userId: user.id,
        ip: request.headers.get("x-forwarded-for"),
        details: { endpoint: "GET /api/admin/users" },
      });
      return Response.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    try {
      // جلب المستخدمين مع علاقاتهم (doctor/patient)
      const users = await prisma.user.findMany({
        include: { doctor: true, patient: true },
        orderBy: { createdAt: "desc" },
      });

      // إزالة كلمة المرور قبل الإرجاع
      const safeUsers = users.map((u) => {
        const { password: _pw, ...rest } = u;
        return rest;
      });

      logAudit({
        event: "admin_users_listed",
        userId: user.id,
        ip: request.headers.get("x-forwarded-for"),
        details: { count: users.length },
      });

      return Response.json(safeUsers);
    } catch (error) {
      logAudit({
        event: "admin_users_list_error",
        userId: user.id,
        ip: request.headers.get("x-forwarded-for"),
        details: { error: error.message },
      });
      return Response.json({ error: "Internal error" }, { status: 500 });
    }
  },
  ["admin"]
);

/////////////////////////
// POST /api/admin/users
// إنشاء مستخدم إداري جديد
/////////////////////////
export const POST = withRBAC(
  async (request, user) => {
    const rl = await rateLimit(request);
    if (rl.limited) {
      logAudit({
        event: "rate_limit_exceeded",
        userId: user.id,
        ip: request.headers.get("x-forwarded-for"),
        details: { endpoint: "POST /api/admin/users" },
      });
      return Response.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    try {
      const body = await request.json();
      const { name, email, password, status } = body;

      // التحقق من الحقول المطلوبة
      if (!name || !email || !password) {
        return Response.json(
          { error: "name, email and password are required" },
          { status: 400 }
        );
      }

      // التحقق من وجود مستخدم بنفس البريد
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        return Response.json(
          { error: "User with this email already exists" },
          { status: 409 }
        );
      }

      // تشفير كلمة المرور
      const bcryptMod = await import("../../../../lib/auth/bcryptWrapper.mjs");
      const bcrypt = bcryptMod?.default || bcryptMod;
      const hashed = await bcrypt.hash(password, 10);

      // إنشاء المستخدم
      const userCreated = await prisma.user.create({
        data: {
          fullName: name,
          email,
          password: hashed,
          role: "admin",
          isActive: (status || "active") === "active",
        },
      });

      // تسجيل النشاط
      logAudit({
        event: "admin_user_created",
        userId: user.id,
        ip: request.headers.get("x-forwarded-for"),
        details: { createdUserId: userCreated.id },
      });

      // إزالة كلمة المرور قبل الإرجاع
      const { password: _pw, ...safe } = userCreated;
      return Response.json(safe, { status: 201 });
    } catch (error) {
      logAudit({
        event: "admin_user_create_error",
        userId: user.id,
        ip: request.headers.get("x-forwarded-for"),
        details: { error: error.message },
      });
      return Response.json({ error: "Internal error" }, { status: 500 });
    }
  },
  ["admin"]
);
