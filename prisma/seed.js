const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  // admin
  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      password: "changeme",
      fullName: "Admin User",
      role: "admin",
      isActive: true,
    },
  });

  // doctor user + doctor
  const doctorUser = await prisma.user.upsert({
    where: { email: "doctor@example.com" },
    update: {},
    create: {
      email: "doctor@example.com",
      password: "changeme",
      fullName: "Dr. John Doe",
      role: "doctor",
      isActive: true,
    },
  });

  const doctor = await prisma.doctor.upsert({
    where: { userId: doctorUser.id },
    update: {},
    create: {
      userId: doctorUser.id,
      phone: "0500000001",
      licenseNumber: "LIC-12345",
      status: "active",
    },
  });

  // patient user + patient
  const patientUser = await prisma.user.upsert({
    where: { email: "patient@example.com" },
    update: {},
    create: {
      email: "patient@example.com",
      password: "changeme",
      fullName: "Patient One",
      role: "patient",
      isActive: true,
    },
  });

  const patient = await prisma.patient.upsert({
    where: { userId: patientUser.id },
    update: {},
    create: {
      userId: patientUser.id,
      fullName: "Patient One",
      email: "patient@example.com",
      doctorId: doctor.userId,
    },
  });

  // chat for tests
  await prisma.chat.upsert({
    where: { id: "seed-chat-1" },
    update: {},
    create: {
      id: "seed-chat-1",
      doctorId: doctor.userId,
      patientId: patient.id,
    },
  });

  console.log("Database seeded successfully");
  console.log({
    adminId: admin.id,
    doctorUserId: doctorUser.id,
    patientUserId: patientUser.id,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
