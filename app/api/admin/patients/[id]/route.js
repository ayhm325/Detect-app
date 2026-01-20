import prisma from "../../../../../lib/prismaClient";
import { withRBAC } from "../../../../../lib/auth/withRBAC";
import { rateLimit } from "../../../../../lib/security/rateLimiter";
import { logAudit } from "../../../../../lib/security/auditLogger";
import { createNotificationBestEffort } from "../../../../../lib/notifications";

/* ============================================================================
   PATCH /api/admin/patients/[id]
   - تعديل بيانات المريض والمستخدم المرتبط
   - تحديث الطبيب المعين للمريض (Doctor)
   - تحديث حالة المريض وعكسها على isActive للمستخدم
   - إشعار الطبيب الجديد عند تغييره (best-effort)
============================================================================ */
export const PATCH = withRBAC(
  async (request, user, context) => {
    // =========================
    // التحكم بعدد الطلبات (Rate Limiting)
    // =========================
    const rl = await rateLimit(request);
    if (rl.limited) {
      logAudit({
        event: "rate_limit_exceeded",
        userId: user.id,
        ip: request.headers.get("x-forwarded-for"),
        details: { endpoint: "PATCH /api/admin/patients/[id]" },
      });
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded" }),
        { status: 429 }
      );
    }

    // =========================
    // جلب معرف المريض من المعاملات
    // =========================
    const resolvedParams =
      typeof context?.params?.then === "function"
        ? await context.params
        : context?.params;
    const { id } = resolvedParams || {};
    if (!id) {
      return new Response(JSON.stringify({ error: "Missing patient id" }), {
        status: 400,
      });
    }

    // =========================
    // جلب بيانات المريض للتأكد من وجوده والحصول على userId
    // =========================
    let patient;
    try {
      patient = await prisma.patient.findUnique({ where: { id } });
    } catch (e) {
      return new Response(
        JSON.stringify({ error: "Database error: " + (e.message || e) }),
        { status: 500 }
      );
    }
    if (!patient) {
      return new Response(JSON.stringify({ error: "Patient not found" }), {
        status: 404,
      });
    }

    const userId = patient.userId;
    if (!userId) {
      return new Response(
        JSON.stringify({
          error: "Patient record missing userId, cannot update user.",
        }),
        { status: 400 }
      );
    }

    // =========================
    // جلب البيانات من الـ body
    // =========================
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
        status: 400,
      });
    }

    const {
      name,
      email,
      phone,
      gender,
      doctorId,
      status,
      bloodType,
      birthDate,
      medicalId,
      allergies,
      chronicDiseases,
    } = body;

    // =========================
    // تحويل القيم القديمة إلى قيم متوافقة مع Prisma enums
    // =========================
    let normalizedStatus = status;
    if (status === "banned") normalizedStatus = "suspended";

    try {
      const prevDoctorId = patient.doctorId || null;

      // =========================
      // تحديث المستخدم والمريض في Transaction لضمان atomicity
      // =========================
      const result = await prisma.$transaction(async (tx) => {
        // تحديث بيانات المستخدم
        const updatedUser = await tx.user.update({
          where: { id: userId },
          data: {
            ...(name ? { fullName: name } : {}),
            ...(email ? { email } : {}),
          },
        });

        // تحديث بيانات المريض
        const patientUpdate = {
          ...(phone !== undefined ? { phone } : {}),
          ...(gender ? { gender } : {}),
          ...(medicalId ? { medicalId } : {}),
          ...(bloodType ? { bloodType } : {}),
          ...(birthDate ? { birthDate: new Date(birthDate) } : {}),
          // يمكن إضافة الحقول الأخرى مثل allergies أو chronicDiseases إذا كان Schema يدعمها
        };

        if (doctorId) patientUpdate.doctorId = doctorId;
        if (normalizedStatus) patientUpdate.status = normalizedStatus;

        const updatedPatient = await tx.patient.update({
          where: { id },
          data: patientUpdate,
        });

        // تحديث حالة المستخدم بناءً على حالة المريض
        if (normalizedStatus && userId) {
          await tx.user.update({
            where: { id: userId },
            data: { isActive: normalizedStatus === "active" },
          });
        }

        return { user: updatedUser, patient: updatedPatient };
      });

      // =========================
      // إرجاع المريض مع بيانات المستخدم المحدثة
      // =========================
      const patientWithUser = await prisma.patient.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              role: true,
              isActive: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },
      });

      // =========================
      // إشعار الطبيب الجديد في حالة تغيير الطبيب
      // =========================
      try {
        const nextDoctorId = doctorId ? String(doctorId).trim() : null;
        if (nextDoctorId && nextDoctorId !== prevDoctorId) {
          const patientName =
            patientWithUser?.user?.fullName || patient?.fullName || "";
          await createNotificationBestEffort(prisma, {
            userId: nextDoctorId,
            type: "info",
            message: {
              ar: `تم إسناد مريض إليك: ${patientName || "مريض جديد"}.`,
              en: `A patient has been assigned to you: ${
                patientName || "a new patient"
              }.`,
            },
          });
        }
      } catch {}

      // =========================
      // تسجيل النشاط في سجل التدقيق
      // =========================
      logAudit({
        event: "admin_patient_updated",
        userId: user.id,
        ip: request.headers.get("x-forwarded-for"),
        details: { patientId: id, updatedFields: body },
      });

      return new Response(JSON.stringify(patientWithUser), { status: 200 });
    } catch (error) {
      // تسجيل الأخطاء في سجل التدقيق
      logAudit({
        event: "admin_patient_update_error",
        userId: user.id,
        ip: request.headers.get("x-forwarded-for"),
        details: { patientId: id, error: error?.message },
      });

      return new Response(JSON.stringify({ error: "Server error" }), {
        status: 500,
      });
    }
  },
  ["admin"] // صلاحية الوصول: الأدمن فقط
);
