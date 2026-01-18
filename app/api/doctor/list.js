import prisma from "../../../../lib/prismaClient.js";

export async function GET(request) {
  try {
    // دعم معامل استعلام لتضمين الأطباء المعلّقين أثناء التطوير
    // استخدم ?includePending=true لإرجاع الأطباء بحالة pending و active
    const url = new URL(request.url);
    const includePending =
      url.searchParams.get("includePending") === "true" ||
      process.env.DEBUG_INCLUDE_PENDING === "true";

    const whereClause = includePending
      ? { status: { in: ["active", "pending"] } }
      : { status: "active" };

    const doctors = await prisma.doctor.findMany({
      where: whereClause,
      include: {
        user: {
          select: { id: true, fullName: true, email: true },
        },
      },
    });
    // إعادة تنسيق البيانات لتسهيل التعامل مع الواجهة
    const result = doctors.map((doc) => ({
      id: doc.userId,
      fullName: doc.user?.fullName,
      email: doc.user?.email,
    }));
    return Response.json({ doctors: result });
  } catch (error) {
    return Response.json({ error: "فشل جلب قائمة الأطباء" }, { status: 500 });
  }
}
