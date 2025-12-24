import prisma from "../../../lib/prismaClient.js";
import bcrypt from "bcryptjs";

export async function POST(request) {
  try {
    const data = await request.json();
    const { email, password, fullName, licenseNumber, phone } = data;
    if (!email || !password || !fullName || !licenseNumber || !phone) {
      return Response.json({ error: "جميع الحقول مطلوبة" }, { status: 400 });
    }
    // تحقق من عدم وجود مستخدم بنفس الإيميل
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return Response.json({ error: "البريد الإلكتروني مستخدم بالفعل" }, { status: 409 });
    }
    // تشفير كلمة المرور
    const hashedPassword = await bcrypt.hash(password, 10);
    // إنشاء المستخدم
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        fullName,
        role: "doctor",
      },
    });
    // إنشاء سجل الطبيب مع isActive=false
    await prisma.doctor.create({
      data: {
        userId: user.id,
        licenseNumber,
        phone,
        status: "pending",
      },
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
    return Response.json({ error: "حدث خطأ أثناء التسجيل" }, { status: 500 });
  }
}
