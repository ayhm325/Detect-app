import prisma from "../../../../lib/prismaClient.js";
import bcrypt from "../../../../lib/auth/bcryptWrapper.mjs";

export async function GET() {
  try {
    // جلب أول مستخدم بدور "patient" من قاعدة البيانات
    const user = await prisma.user.findFirst({
      where: { role: "patient" },
      include: {
        patient: true,
      },
    });
    if (!user) {
      return Response.json({ error: "NO_PATIENT_FOUND" }, { status: 404 });
    }
    // يمكنك تخصيص البيانات حسب الحاجة
    const patientData = {
      fullName: user.fullName,
      age: user.patient?.age ?? null,
      gender: user.patient?.gender ?? null,
      patientId: user.patient?.patientId ?? user.id,
      healthStatus: user.patient?.healthStatus ?? null,
      avatarUrl: user.patient?.avatarUrl ?? null,
      lastLogin: user.lastLogin ?? null,
      email: user.email,
    };
    return Response.json(patientData, { status: 200 });
  } catch (error) {
    return Response.json({ error: "SERVER_ERROR" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { email, password, fullName, role } = await request.json();
    if (!email || !password || !fullName || !role) {
      return Response.json({ error: "REQUIRED_FIELDS" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return Response.json({ error: "EMAIL_ALREADY_USED" }, { status: 409 });
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
        console.error("Error creating Patient record:", e);
      }
    }

    // Create registration activity
    try {
      await prisma.activity.create({
        data: {
          type: "register",
          description: `New user registered: ${user.fullName} (${user.email})`,
          userId: user.id,
          meta: { role: user.role },
        },
      });
    } catch (e) {
      console.error("Error logging registration activity:", e);
    }
    const { password: _, ...userData } = user;
    return Response.json({ user: userData }, { status: 201 });
  } catch (error) {
    return Response.json({ error: "SERVER_ERROR" }, { status: 500 });
  }
}
