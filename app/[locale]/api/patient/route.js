import prisma from "../../../../lib/prismaClient.js";
import bcrypt from "bcryptjs";

export async function GET() {
  // Mock patient data; replace with DB/service integration.
  const patient = {
    fullName: "Ahmed Mohammed Ali",
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
          meta: { role: user.role }
        }
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
