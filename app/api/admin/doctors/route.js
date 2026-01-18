import prisma from "../../../../lib/prismaClient";
import { withRBAC } from "../../../../lib/auth/withRBAC";
import { rateLimit } from "../../../../lib/security/rateLimiter";
import { logAudit } from "../../../../lib/security/auditLogger";
import { createNotificationBestEffort } from "../../../../lib/notifications";

export const GET = withRBAC(
  async (request, user) => {
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
      const doctors = await prisma.doctor.findMany({ include: { user: true } });
      const doctorsWithUser = doctors.map((d) => ({
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
              isDeleted: d.user.isDeleted,
            }
          : null,
      }));
      logAudit({
        event: "admin_doctors_listed",
        userId: user.id,
        ip: request.headers.get("x-forwarded-for"),
        details: { count: doctorsWithUser.length },
      });
      return Response.json({ doctors: doctorsWithUser });
    } catch (error) {
      logAudit({
        event: "admin_doctors_list_error",
        userId: user.id,
        ip: request.headers.get("x-forwarded-for"),
        details: { error: error.message },
      });
      return Response.json(
        { error: "حدث خطأ أثناء جلب الأطباء" },
        { status: 500 },
      );
    }
  },
  ["admin"],
);

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
      if (!name || !email || !phone || !licenseNumber) {
        return Response.json(
          { error: "يرجى تعبئة جميع الحقول" },
          { status: 400 },
        );
      }

      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return Response.json(
          { error: "البريد الإلكتروني مستخدم بالفعل" },
          { status: 400 },
        );
      }

      const defaultPassword = process.env.DEFAULT_DOCTOR_PASSWORD;
      const rawPassword =
        password ||
        defaultPassword ||
        (process.env.NODE_ENV === "development" ? "doctor123" : null);
      if (!rawPassword) {
        return Response.json(
          {
            error:
              "Missing password (set DEFAULT_DOCTOR_PASSWORD in production)",
          },
          { status: 400 },
        );
      }

      const bcryptMod = await import("bcrypt");
      const bcrypt = bcryptMod?.default || bcryptMod;
      const hashedPassword = await bcrypt.hash(rawPassword, 10);

      const userCreated = await prisma.user.create({
        data: {
          fullName: name,
          email,
          role: "doctor",
          password: hashedPassword,
          isActive: true,
        },
      });

      const doctor = await prisma.doctor.create({
        data: {
          userId: userCreated.id,
          phone,
          licenseNumber,
          status: "active",
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
        details: { error: error.message },
      });
      return Response.json(
        { error: "حدث خطأ أثناء إضافة الطبيب" },
        { status: 500 },
      );
    }
  },
  ["admin"],
);

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
      const body = await request.json();
      const id = body?.id;
      const status = body?.status;
      if (!id || !status) {
        return Response.json({ error: "بيانات غير صالحة" }, { status: 400 });
      }

      await prisma.doctor.update({ where: { userId: id }, data: { status } });
      await prisma.user.update({
        where: { id },
        data: { isActive: status === "active" },
      });
      const affectedUser = await prisma.user.findUnique({ where: { id } });

      try {
        await prisma.activity.create({
          data: {
            type:
              status === "active"
                ? "approve_doctor"
                : "reject_or_delete_doctor",
            description:
              status === "active"
                ? `تمت الموافقة على طبيب: ${affectedUser?.fullName || id} (${affectedUser?.email || ""})`
                : `تم رفض أو حذف طبيب: ${affectedUser?.fullName || id} (${affectedUser?.email || ""})`,
            userId: id,
            meta: { status },
          },
        });
      } catch (e) {
        logAudit({
          event: "admin_doctor_activity_log_error",
          userId: user.id,
          ip: request.headers.get("x-forwarded-for"),
          details: { error: e.message },
        });
      }

      // Security/account status notification to the doctor
      await createNotificationBestEffort(prisma, {
        userId: id,
        type: status === "active" ? "success" : "warning",
        message: {
          ar:
            status === "active"
              ? "تم تفعيل حساب الطبيب الخاص بك."
              : "تم تعطيل/رفض حساب الطبيب الخاص بك.",
          en:
            status === "active"
              ? "Your doctor account has been activated."
              : "Your doctor account has been disabled/rejected.",
          meta: { kind: "security_account_status", status },
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
        details: { error: error.message },
      });
      return Response.json({ error: "حدث خطأ أثناء التحديث" }, { status: 500 });
    }
  },
  ["admin"],
);
