import prisma from '../prismaClient.js';

// جلب جميع المواعيد مع بيانات الطبيب والمريض
export async function getAllAppointmentsWithDetails() {
  return await prisma.appointment.findMany({
    include: {
      doctor: { include: { user: true } },
      patient: { include: { user: true } },
      medicalRecord: true,
      billing: true
    }
  });
}

// جلب كل السجلات الطبية لمريض معيّن مع بيانات الطبيب والموعد
export async function getMedicalRecordsForPatient(patientId) {
  return await prisma.medicalRecord.findMany({
    where: { patientId },
    include: {
      doctor: { include: { user: true } },
      appointment: true
    }
  });
}

// جلب كل الفواتير لمريض مع بيانات الموعد
export async function getBillingsForPatient(patientId) {
  return await prisma.billing.findMany({
    where: { patientId },
    include: { appointment: true }
  });
}

// جلب كل الإشعارات لمستخدم معيّن
export async function getNotificationsForUser(userId) {
  return await prisma.notification.findMany({
    where: { userId }
  });
}

// جلب كل طلبات التغيير التي راجعها مدير معيّن
export async function getReviewedChangeRequests(adminId) {
  return await prisma.changeRequest.findMany({
    where: { reviewedById: adminId },
    include: { user: true }
  });
}

// جلب كل المرضى لطبيب معيّن (عبر المواعيد)
export async function getPatientsForDoctor(doctorId) {
  const appointments = await prisma.appointment.findMany({
    where: { doctorId },
    include: { patient: { include: { user: true } } }
  });
  // استخراج المرضى بدون تكرار
  const uniquePatients = [];
  const seen = new Set();
  for (const appt of appointments) {
    if (appt.patient && !seen.has(appt.patient.userId)) {
      uniquePatients.push(appt.patient);
      seen.add(appt.patient.userId);
    }
  }
  return uniquePatients;
}

// جلب كل المواعيد لطبيب معيّن مع بيانات المريض
export async function getAppointmentsForDoctor(doctorId) {
  return await prisma.appointment.findMany({
    where: { doctorId },
    include: { patient: { include: { user: true } }, medicalRecord: true, billing: true }
  });
}

// جلب كل المواعيد لمريض معيّن مع بيانات الطبيب
export async function getAppointmentsForPatient(patientId) {
  return await prisma.appointment.findMany({
    where: { patientId },
    include: { doctor: { include: { user: true } }, medicalRecord: true, billing: true }
  });
}
