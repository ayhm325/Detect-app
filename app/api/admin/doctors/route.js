import prisma from "../../../../lib/prismaClient";
import { withRBAC } from "../../../../lib/auth/withRBAC";
import { rateLimit } from "../../../../lib/security/rateLimiter";
import { logAudit } from "../../../../lib/security/auditLogger";
import { createNotificationBestEffort } from "../../../../lib/notifications";
import { DoctorStatus } from "@prisma/client";

/* ============================================================================
   GET /api/admin/doctors
   - جلب جميع الأطباء مع بيانات المستخدم المرتبطة
   - مخصص للأدمن فقط
   - مع Rate Limiting + Audit Log
============================================================================ */
export const GET = withRBAC(
  async (request, user) => {
    // =========================
    // Rate Limiting
    // =========================
    const rl = await rateLimit(request);
    if (rl.limited) {
      logAudit({
        event: "rate_limit_exceeded",
        userId: user.id,
        ip: request.headers.get("x-forwarded-for"),
        details: { endpoint: "GET /api/admin/doctors" },
      });
      return Response.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    try {
      // جلب الأطباء مع المستخدم المرتبط (1-1)
      const doctors = await prisma.doctor.findMany({
        include: { user: true },
      });

      // إعادة تشكيل البيانات لتكون مناسبة للـ Admin UI
      const normalized = doctors.map((d) => ({
        id: d.userId,
        licenseNumber: d.licenseNumber,
        phone: d.phone,
        status: d.status,
        createdAt: d.createdAt,
        user: d.user
          ? {
              id: d.user.id,
              fullName: d.user.fullName,
              email: d.user.email,
              createdAt: d.user.createdAt,
              isActive: d.user.isActive,
            }
          : null,
      }));

      // تسجيل عملية العرض في سجل التدقيق
      logAudit({
        event: "admin_doctors_listed",
        userId: user.id,
        ip: request.headers.get("x-forwarded-for"),
        details: { count: normalized.length },
      });

      return Response.json({ doctors: normalized });
    } catch (error) {
      logAudit({
        event: "admin_doctors_list_error",
        userId: user.id,
        ip: request.headers.get("x-forwarded-for"),
        details: { error: error?.message },
      });
      return Response.json(
        { error: "حدث خطأ أثناء جلب الأطباء" },
        { status: 500 },
      );
    }
  },
  ["admin"],
);

/* ============================================================================
   POST /api/admin/doctors
   - إنشاء طبيب جديد
   - إنشاء User + Doctor
   - تفعيل الحساب مباشرة
============================================================================ */
export const POST = withRBAC(
  async (request, user) => {
    const rl = await rateLimit(request);
    if (rl.limited) {
      logAudit({
        event: "rate_limit_exceeded",
        userId: user.id,
        ip: request.headers.get("x-forwarded-for"),
        details: { endpoint: "POST /api/admin/doctors" },
      });
      return Response.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    try {
      const { name, email, phone, licenseNumber, password } =
        await request.json();

      // التحقق من البيانات الأساسية
      if (!name || !email || !phone || !licenseNumber) {
        return Response.json(
          { error: "يرجى تعبئة جميع الحقول المطلوبة" },
          { status: 400 },
        );
      }

      // منع تكرار البريد الإلكتروني
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return Response.json(
          { error: "البريد الإلكتروني مستخدم بالفعل" },
          { status: 400 },
        );
      }

      // تحديد كلمة المرور
      const defaultPassword = process.env.DEFAULT_DOCTOR_PASSWORD;
      const rawPassword =
        password ||
        defaultPassword ||
        (process.env.NODE_ENV === "development" ? "doctor123" : null);

      if (!rawPassword) {
        return Response.json(
          { error: "كلمة المرور غير متوفرة" },
          { status: 400 },
        );
      }

      // تشفير كلمة المرور
      const bcryptMod = await import("bcrypt");
      const bcrypt = bcryptMod.default || bcryptMod;
      const hashedPassword = await bcrypt.hash(rawPassword, 10);

      // ====================================================
      // إنشاء المستخدم والطبيب داخل Transaction
      // ====================================================
      const doctor = await prisma.$transaction(async (tx) => {
        const userCreated = await tx.user.create({
          data: {
            fullName: name,
            email,
            role: "doctor",
            password: hashedPassword,
            isActive: true, // تفعيل الدخول
          },
        });

        return tx.doctor.create({
          data: {
            userId: userCreated.id,
            phone,
            licenseNumber,
            status: "active", // مصدر الحقيقة لحالة الطبيب
          },
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
                createdAt: true,
                isActive: true,
              },
            },
          },
        });
      });

      logAudit({
        event: "admin_doctor_created",
        userId: user.id,
        ip: request.headers.get("x-forwarded-for"),
        details: { doctorId: doctor.userId },
      });

      return Response.json({ doctor });
    } catch (error) {
      logAudit({
        event: "admin_doctor_create_error",
        userId: user.id,
        ip: request.headers.get("x-forwarded-for"),
        details: { error: error?.message },
      });
      return Response.json(
        { error: "حدث خطأ أثناء إضافة الطبيب" },
        { status: 500 },
      );
    }
  },
  ["admin"],
);

/* ============================================================================
   PATCH /api/admin/doctors
   - تغيير حالة الطبيب (active / banned / pending)
   - مزامنة حالة الدخول isActive
   - إشعار الطبيب
============================================================================ */
export const PATCH = withRBAC(
  async (request, user) => {
    const rl = await rateLimit(request);
    if (rl.limited) {
      logAudit({
        event: "rate_limit_exceeded",
        userId: user.id,
        ip: request.headers.get("x-forwarded-for"),
        details: { endpoint: "PATCH /api/admin/doctors" },
      });
      return Response.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    try {
      const { id, status } = await request.json();

      // التحقق من البيانات
      if (!id || !status) {
        return Response.json(
          { error: "بيانات غير صالحة" },
          { status: 400 },
        );
      }

      // التحقق من أن الحالة من enum الرسمي
      if (!Object.values(DoctorStatus).includes(status)) {
        return Response.json(
          { error: "حالة الطبيب غير صحيحة" },
          { status: 400 },
        );
      }

      // ====================================================
      // تنفيذ التحديث داخل Transaction
      // ====================================================
      await prisma.$transaction(async (tx) => {
        await tx.doctor.update({
          where: { userId: id },
          data: { status },
        });

        // isActive هو المصدر الوحيد للتحكم بتسجيل الدخول
        await tx.user.update({
          where: { id },
          data: { isActive: status === "active" },
        });

        await tx.activity.create({
          data: {
            type: "update_doctor_status",
            description: `تم تحديث حالة الطبيب إلى ${status}`,
            userId: id,
            meta: { status },
          },
        });
      });

      // إشعار الطبيب بتغيير الحالة (Best Effort)
      await createNotificationBestEffort(prisma, {
        userId: id,
        type: status === "active" ? "success" : "warning",
        message: {
          ar:
            status === "active"
              ? "تم تفعيل حساب الطبيب الخاص بك."
              : "تم تعطيل أو حظر حساب الطبيب الخاص بك.",
          en:
            status === "active"
              ? "Your doctor account has been activated."
              : "Your doctor account has been disabled or banned.",
        },
      });

      logAudit({
        event: "admin_doctor_status_updated",
        userId: user.id,
        ip: request.headers.get("x-forwarded-for"),
        details: { doctorId: id, status },
      });

      return Response.json({ success: true });
    } catch (error) {
      logAudit({
        event: "admin_doctor_status_update_error",
        userId: user.id,
        ip: request.headers.get("x-forwarded-for"),
        details: { error: error?.message },
      });
      return Response.json(
        { error: "حدث خطأ أثناء التحديث" },
        { status: 500 },
      );
    }
  },
  ["admin"],
);
