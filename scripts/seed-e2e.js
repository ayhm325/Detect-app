import prisma from '../lib/prismaClient.js';

async function seedE2E() {
  try {
    // create a doctor user + doctor record
    const doctorEmail = `e2e-doctor-${Date.now()}@example.com`;
    const doctorUser = await prisma.user.create({
      data: {
        email: doctorEmail,
        password: 'changeme',
        fullName: 'E2E Doctor',
        role: 'doctor',
        isActive: true,
      },
    });

    const doctor = await prisma.doctor.create({
      data: {
        userId: doctorUser.id,
        phone: '0500000000',
        licenseNumber: `LIC-${Math.floor(Math.random() * 100000)}`,
        status: 'active',
      },
    });

    // create a patient user + patient record linked to the doctor
    const patientEmail = `e2e-patient-${Date.now()}@example.com`;
    const patientUser = await prisma.user.create({
      data: {
        email: patientEmail,
        password: 'changeme',
        fullName: 'E2E Patient',
        role: 'patient',
        isActive: true,
      },
    });

    const patient = await prisma.patient.create({
      data: {
        userId: patientUser.id,
        fullName: patientUser.fullName,
        email: patientUser.email,
        doctorId: doctor.userId,
        phone: '0590000000',
        status: 'active',
      },
    });

    // create a chat between them
    const chat = await prisma.chat.create({
      data: {
        doctorId: doctor.userId,
        patientId: patient.id,
      },
    });

    // debug counts
    const usersCount = await prisma.user.count();
    const doctorsCount = await prisma.doctor.count();
    const patientsCount = await prisma.patient.count();
    const chatsCount = await prisma.chat.count();

    console.log(JSON.stringify({ doctorUserId: doctor.userId, patientId: patient.id, chatId: chat.id, counts: { usersCount, doctorsCount, patientsCount, chatsCount } }));
  } catch (e) {
    console.error('seed-e2e error', e && e.message ? e.message : e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedE2E();
