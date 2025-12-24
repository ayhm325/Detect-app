import prisma from "../../../../lib/prismaClient.js";
import bcrypt from "bcryptjs";

export async function GET() {
  // Mock patient data; replace with DB/service integration.
  const patient = {
    fullName: "أحمد محمد علي",
    age: 42,
    gender: "male",
    patientId: "PAT-000123",
    healthStatus: "attention",
    avatarUrl: "/icons/patient-placeholder.png",
    lastLogin: new Date().toISOString(),
  };
  return Response.json(patient, { status: 200 });
}

export async function POST(request) {
  try {
    const { email, password, fullName, role } = await request.json();
    if (!email || !password || !fullName || !role) {
      return Response.json({ error: "جميع الحقول مطلوبة" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return Response.json({ error: "البريد الإلكتروني مستخدم بالفعل" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        fullName,
        role,
        // ensure patients are active immediately
        isActive: role === "patient",
      },
    });

    // If the new user is a patient, also create a Patient record (one-to-one)
    if (role === "patient") {
      try {
        await prisma.patient.create({
          data: {
            userId: user.id,
          },
        });
      } catch (e) {
        console.error("خطأ في إنشاء سجل Patient:", e);
      }
    }

    // تسجيل نشاط جديد
    try {
      await prisma.activity.create({
        data: {
          type: "register",
          description: `تسجيل مستخدم جديد: ${user.fullName} (${user.email})`,
          userId: user.id,
          meta: { role: user.role }
        }
      });
    } catch (e) {
      console.error("خطأ في تسجيل نشاط التسجيل:", e);
    }
    const { password: _, ...userData } = user;
    return Response.json({ user: userData }, { status: 201 });
  } catch (error) {
    return Response.json({ error: "حدث خطأ في الخادم" }, { status: 500 });
  }
}
