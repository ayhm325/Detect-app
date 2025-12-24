// تعديل بيانات الطبيب (الاسم، البريد، الجوال، الحالة)
export async function PATCH(request, context) {
  const { id } = await context.params;
  if (!id) {
    return Response.json({ error: "معرّف الطبيب غير موجود" }, { status: 400 });
  }
  try {
    const data = await request.json();
    // تحقق من وجود الطبيب والمستخدم
    const doctor = await prisma.doctor.findUnique({ where: { userId: id } });
    if (!doctor) {
      return Response.json({ error: "الطبيب غير موجود" }, { status: 404 });
    }
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return Response.json({ error: "المستخدم غير موجود" }, { status: 404 });
    }
    // تحديث بيانات المستخدم
    await prisma.user.update({
      where: { id },
      data: {
        fullName: data.name,
        email: data.email,
      }
    });
    // تحديث بيانات الطبيب
    await prisma.doctor.update({
      where: { userId: id },
      data: {
        phone: data.phone,
        licenseNumber: data.licenseNumber,
        status: data.status
      }
    });
    // تحديث حالة المستخدم المرتبط عند الموافقة
    if (data.status === "active") {
      await prisma.user.update({ where: { id }, data: { isActive: true } });
    } else {
      await prisma.user.update({ where: { id }, data: { isActive: false } });
    }
    // تسجيل النشاط
    try {
      await prisma.activity.create({
        data: {
          type: "update_doctor",
          description: `تم تعديل بيانات الطبيب: ${id}`,
          userId: id,
          meta: { ...data }
        }
      });
    } catch (e) {}
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: "حدث خطأ أثناء تعديل بيانات الطبيب" }, { status: 500 });
  }
}
import prisma from "../../../../../lib/prismaClient";

// حذف (soft delete) طبيب عبر userId
export async function DELETE(request, context) {
  const { id } = await context.params;
  if (!id) {
    return Response.json({ error: "معرّف الطبيب غير موجود" }, { status: 400 });
  }
  try {
    // تحقق من وجود الطبيب
    const doctor = await prisma.doctor.findUnique({ where: { userId: id } });
    if (!doctor) {
      return Response.json({ error: "الطبيب غير موجود" }, { status: 404 });
    }
    // حظر الطبيب فقط (عدم الحذف)
    await prisma.doctor.update({ where: { userId: id }, data: { status: "banned" } });
    await prisma.user.update({ where: { id }, data: { isActive: false } });
    // تسجيل النشاط
    try {
      await prisma.activity.create({
        data: {
          type: "block_doctor",
          description: `تم حظر طبيب: ${doctor.userId}`,
          userId: id,
          meta: {}
        }
      });
    } catch (e) {}
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: "حدث خطأ أثناء حظر الطبيب" }, { status: 500 });
  }
}
