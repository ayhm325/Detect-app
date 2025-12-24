import prisma from "../../../../lib/prismaClient";

export async function GET() {
  try {
    // تحديد بداية ونهاية اليوم
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const [totalUsers, doctors, patients, todayScans, totalScans, allUsers, allDoctors, allPatients, allMedicalRecords] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "doctor" } }),
      prisma.user.count({ where: { role: "patient" } }),
      prisma.medicalRecord.count({ where: { createdAt: { gte: startOfToday, lte: endOfToday } } }),
      prisma.medicalRecord.count(),
      prisma.user.findMany(),
      prisma.doctor.findMany({
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              createdAt: true,
            }
          }
        }
      }),
      prisma.user.findMany({ where: { role: "patient" } }),
      prisma.medicalRecord.findMany({ where: { createdAt: { gte: startOfToday, lte: endOfToday } } }),
    ]);

    // Debug log for new doctor structure
    console.log("--- فحص الإحصائيات ---");
    console.log({ totalUsers, doctors, patients, todayScans });
    console.log("كل المستخدمين:", allUsers);
    console.log("الأطباء (Doctor table):", allDoctors);
    console.log("المرضى:", allPatients);
    console.log("كل السجلات الطبية (اليوم):", allMedicalRecords);
    console.log("----------------------");

    return Response.json({
      totalUsers,
      doctors,
      patients,
      todayScans,
      totalScans,
      debug: {
        allUsers,
        allDoctors, // now contains licenseNumber, phone, and user info
        allPatients,
        allMedicalRecords
      }
    });
  } catch (error) {
    console.error("خطأ في جلب الإحصائيات:", error);
    return Response.json({ error: "حدث خطأ أثناء جلب الإحصائيات" }, { status: 500 });
  }
}
