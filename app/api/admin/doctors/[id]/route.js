import prisma from "../../../../../lib/prismaClient";
import { DoctorStatus } from "@prisma/client";

/* =========================================================================
   PATCH: تعديل بيانات الطبيب
   - تحديث بيانات المستخدم (User)
   - تحديث بيانات الطبيب (Doctor)
   - مزامنة حالة الدخول isActive مع حالة الطبيب الرسمية status
   - تسجيل النشاط في Activity
   ========================================================================= */
export async function PATCH(request, context) {
  const { id } = context.params;

  // التحقق من وجود المعرّف
  if (!id) {
    return Response.json(
      { error: "معرّف الطبيب غير موجود" },
      { status: 400 }
    );
  }

  try {
    const data = await request.json();

    // =========================
    // التحقق من صحة حالة الطبيب
    // =========================
    // نضمن أن القيمة المرسلة مطابقة لـ enum DoctorStatus في السكيما
    if (
      data.status &&
      !Object.values(DoctorStatus).includes(data.status)
    ) {
      return Response.json(
        { error: "حالة الطبيب غير صالحة" },
        { status: 400 }
      );
    }

    // =========================
    // التحقق من وجود الطبيب والمستخدم
    // =========================
    const doctor = await prisma.doctor.findUnique({
      where: { userId: id },
    });

    if (!doctor) {
      return Response.json(
        { error: "الطبيب غير موجود" },
        { status: 404 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return Response.json(
        { error: "المستخدم غير موجود" },
        { status: 404 }
      );
    }

    // =====================================================
    // تنفيذ جميع التحديثات داخل Transaction واحدة
    // لمنع أي حالة تحديث جزئي (Data Inconsistency)
    // =====================================================
    await prisma.$transaction(async (tx) => {
      // تحديث بيانات المستخدم الأساسية
      await tx.user.update({
        where: { id },
        data: {
          fullName: data.fullName,
          email: data.email,

          // isActive هو المصدر الوحيد للتحكم بتسجيل الدخول
          // يتم ربطه مباشرة بحالة الطبيب
          isActive: data.status === "active",
        },
      });

      // تحديث بيانات الطبيب المهنية
      await tx.doctor.update({
        where: { userId: id },
        data: {
          phone: data.phone,
          licenseNumber: data.licenseNumber,
          clinic: data.clinic,

          // status هو المصدر الوحيد لحالة الطبيب
          status: data.status,
        },
      });

      // تسجيل النشاط (Audit Log)
      await tx.activity.create({
        data: {
          type: "update_doctor",
          description: "تم تعديل بيانات الطبيب بواسطة الأدمن",
          userId: id,
          meta: {
            updatedFields: Object.keys(data),
            newStatus: data.status,
          },
        },
      });
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json(
      { error: "حدث خطأ أثناء تعديل بيانات الطبيب" },
      { status: 500 }
    );
  }
}

/* =========================================================================
   DELETE: حظر الطبيب (Soft Block)
   - لا يتم الحذف من قاعدة البيانات
   - تغيير الحالة إلى banned
   - تعطيل تسجيل الدخول للمستخدم
   - تسجيل النشاط
   ========================================================================= */
export async function DELETE(request, context) {
  const { id } = context.params;

  // التحقق من وجود المعرّف
  if (!id) {
    return Response.json(
      { error: "معرّف الطبيب غير موجود" },
      { status: 400 }
    );
  }

  try {
    // التحقق من وجود الطبيب
    const doctor = await prisma.doctor.findUnique({
      where: { userId: id },
    });

    if (!doctor) {
      return Response.json(
        { error: "الطبيب غير موجود" },
        { status: 404 }
      );
    }

    // =====================================================
    // تنفيذ الحظر داخل Transaction
    // =====================================================
    await prisma.$transaction(async (tx) => {
      // تغيير حالة الطبيب إلى banned
      await tx.doctor.update({
        where: { userId: id },
        data: { status: "banned" },
      });

      // تعطيل تسجيل دخول المستخدم المرتبط
      await tx.user.update({
        where: { id },
        data: { isActive: false },
      });

      // تسجيل النشاط
      await tx.activity.create({
        data: {
          type: "block_doctor",
          description: "تم حظر الطبيب بواسطة الأدمن",
          userId: id,
          meta: { reason: "admin_action" },
        },
      });
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json(
      { error: "حدث خطأ أثناء حظر الطبيب" },
      { status: 500 }
    );
  }
}
