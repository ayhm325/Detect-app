import prisma from "../../../lib/prismaClient.js";
import bcrypt from "bcryptjs";

export async function POST(request) {
  try {
    const data = await request.json();
    const { email, password, fullName, licenseNumber, phone } = data;
    if (!email || !password || !fullName || !licenseNumber || !phone) {
      return Response.json({ error: "جميع الحقول مطلوبة" }, { status: 400 });
    }

    // تحقق مبكر من عدم تكرار رقم الهاتف أو رقم الترخيص (حتى نظهر رسالة واضحة)
    // ملاحظة: حتى مع هذا التحقق يبقى احتمال سباق (race) لذلك نعالج P2002 أيضاً.
    const [existingPhone, existingLicense] = await Promise.all([
      prisma.doctor.findUnique({ where: { phone } }),
      prisma.doctor.findUnique({ where: { licenseNumber } }),
    ]);
    if (existingPhone) {
      return Response.json(
        { errorCode: "PHONE_ALREADY_USED", error: "رقم الهاتف مستخدم بالفعل" },
        { status: 409 }
      );
    }
    if (existingLicense) {
      return Response.json(
        { errorCode: "LICENSE_ALREADY_USED", error: "رقم الترخيص مستخدم بالفعل" },
        { status: 409 }
      );
    }

    // تحقق من عدم وجود مستخدم بنفس الإيميل
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return Response.json(
        { errorCode: "EMAIL_ALREADY_USED", error: "البريد الإلكتروني مستخدم بالفعل" },
        { status: 409 }
      );
    }
    // تشفير كلمة المرور
    const hashedPassword = await bcrypt.hash(password, 10);

    // إنشاء المستخدم + سجل الطبيب ضمن Transaction لتفادي إنشاء مستخدم بدون سجل طبيب عند فشل unique
    const user = await prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          fullName,
          role: "doctor",
        },
      });

      await tx.doctor.create({
        data: {
          userId: createdUser.id,
          licenseNumber,
          phone,
          status: "pending",
        },
      });

      return createdUser;
    });
    // تسجيل نشاط إضافة طبيب جديد
    try {
      await prisma.activity.create({
        data: {
          type: "add_doctor",
          description: `إضافة طبيب جديد: ${user.fullName} (${user.email})`,
          userId: user.id,
          meta: { licenseNumber, phone }
        }
      });
    } catch (e) {
      console.error("خطأ في تسجيل نشاط إضافة الطبيب:", e);
    }
    return Response.json({ success: true });
  } catch (error) {
    console.error("تفاصيل الخطأ أثناء تسجيل الطبيب:", error);

    // Prisma unique constraint violations
    if (error && typeof error === 'object' && error.code === 'P2002') {
      const target = error.meta?.target;
      const fields = Array.isArray(target) ? target : (typeof target === 'string' ? [target] : []);
      if (fields.some((f) => String(f).includes('phone'))) {
        return Response.json(
          { errorCode: "PHONE_ALREADY_USED", error: "رقم الهاتف مستخدم بالفعل" },
          { status: 409 }
        );
      }
      if (fields.some((f) => String(f).includes('licenseNumber'))) {
        return Response.json(
          { errorCode: "LICENSE_ALREADY_USED", error: "رقم الترخيص مستخدم بالفعل" },
          { status: 409 }
        );
      }
      if (fields.some((f) => String(f).includes('email'))) {
        return Response.json(
          { errorCode: "EMAIL_ALREADY_USED", error: "البريد الإلكتروني مستخدم بالفعل" },
          { status: 409 }
        );
      }
      return Response.json(
        { errorCode: "DATA_ALREADY_USED", error: "بيانات مستخدمة بالفعل" },
        { status: 409 }
      );
    }

    return Response.json({ error: "حدث خطأ أثناء التسجيل" }, { status: 500 });
  }
}
