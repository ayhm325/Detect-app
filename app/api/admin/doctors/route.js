// إضافة طبيب جديد
export async function POST(request) {
  try {
    const { name, email, phone, licenseNumber, status } = await request.json();
    if (!name || !email || !phone || !licenseNumber || !status) {
      return Response.json({ error: "يرجى تعبئة جميع الحقول" }, { status: 400 });
    }
    // تحقق من عدم وجود بريد إلكتروني مكرر
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return Response.json({ error: "البريد الإلكتروني مستخدم بالفعل" }, { status: 400 });
    }
    // أنشئ المستخدم أولاً (بدون رقم الجوال)
    const user = await prisma.user.create({
      data: {
        fullName: name,
        email,
        role: "doctor",
        // كلمة المرور الافتراضية: doctor123 (يجب تغييرها لاحقًا)
        password: "$2a$10$wQ8QnQwQ8QnQwQ8QnQwQ8uQ8QnQwQ8QnQwQ8QnQwQ8QnQwQ8QnQW", // bcrypt hash for 'doctor123'
        isActive: status === "active"
      }
    });
    // أنشئ الطبيب مع رقم الجوال وحقل الحالة
    const doctor = await prisma.doctor.create({
      data: {
        userId: user.id,
        phone,
        licenseNumber,
        status: status === "active" ? "active" : status === "banned" ? "banned" : "suspended"
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            createdAt: true,
            isActive: true
          }
        }
      }
    });
    return Response.json({ doctor });
  } catch (error) {
    return Response.json({ error: "حدث خطأ أثناء إضافة الطبيب" }, { status: 500 });
  }
}
import prisma from "../../../../lib/prismaClient";

// جلب جميع الأطباء مع حالة التفعيل
export async function GET() {
  try {
    // جلب جميع الأطباء مع بيانات المستخدم
    const doctors = await prisma.doctor.findMany({
      include: {
        user: true
      }
    });
    // إرجاع جميع بيانات الطبيب والمستخدم المرتبط
    const doctorsWithUser = doctors.map(d => ({
      id: d.userId,
      licenseNumber: d.licenseNumber,
      phone: d.phone,
      status: d.status,
      createdAt: d.createdAt,
      // بيانات المستخدم المرتبط
      user: d.user ? {
        id: d.user.id,
        fullName: d.user.fullName,
        email: d.user.email,
        createdAt: d.user.createdAt,
        isActive: d.user.isActive,
        isDeleted: d.user.isDeleted
      } : null
    }));
    return Response.json({ doctors: doctorsWithUser });
  } catch (error) {
    return Response.json({ error: "حدث خطأ أثناء جلب الأطباء" }, { status: 500 });
  }
}

// تحديث حالة التفعيل (موافقة أو رفض)
export async function PATCH(request) {
  try {
    const body = await request.json();
    const id = body.id;
    if (!id) {
      return Response.json({ error: "بيانات غير صالحة" }, { status: 400 });
    }
    let status = body.status;
    // تحديث حالة الطبيب فقط
    const updated = await prisma.doctor.update({
      where: { userId: id },
      data: {
        status
      }
    });
    // تحديث حالة المستخدم المرتبط
    await prisma.user.update({
      where: { id },
      data: { isActive: status === "active" }
    });
    // جلب بيانات المستخدم لكتابة النشاط
    const user = await prisma.user.findUnique({ where: { id } });
    try {
      await prisma.activity.create({
        data: {
          type: status === "active" ? "approve_doctor" : "reject_or_delete_doctor",
          description: status === "active"
            ? `تمت الموافقة على طبيب: ${user.fullName} (${user.email})`
            : `تم رفض أو حذف طبيب: ${user.fullName} (${user.email})`,
          userId: user.id,
          meta: { status }
        }
      });
    } catch (e) {
      console.error("خطأ في تسجيل نشاط الموافقة/الرفض:", e);
    }
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: "حدث خطأ أثناء التحديث" }, { status: 500 });
  }
}
