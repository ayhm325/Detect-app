import prisma from "./prismaClient";

export async function GET() {
  try {
    // جلب الإحصائيات مع طباعة النتائج في الكونسول للفحص
    const [totalUsers, doctors, patients, todayScans, allUsers, allDoctors, allPatients, allAnalysis] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "doctor" } }),
      prisma.user.count({ where: { role: "patient" } }),
      prisma.analysis.count({ where: { createdAt: { gte: new Date(new Date().setHours(0,0,0,0)) } } }),
      prisma.user.findMany(),
      prisma.user.findMany({ where: { role: "doctor" } }),
      prisma.user.findMany({ where: { role: "patient" } }),
      prisma.analysis.findMany(),
    ]);

    console.log("--- فحص الإحصائيات ---");
    console.log({ totalUsers, doctors, patients, todayScans });
    console.log("كل المستخدمين:", allUsers);
    console.log("الأطباء:", allDoctors);
    console.log("المرضى:", allPatients);
    console.log("كل التحاليل:", allAnalysis);
    console.log("----------------------");

    return Response.json({
      totalUsers,
      doctors,
      patients,
      todayScans,
      debug: {
        allUsers,
        allDoctors,
        allPatients,
        allAnalysis
      }
    });
  } catch (error) {
    console.error("خطأ في جلب الإحصائيات:", error);
    return Response.json({ error: "حدث خطأ أثناء جلب الإحصائيات" }, { status: 500 });
  }
}
