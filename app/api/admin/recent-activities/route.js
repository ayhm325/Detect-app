import prisma from "../../../../lib/prismaClient";

/**
 * GET /api/admin/activities
 * - جلب أحدث 10 نشاطات من جدول Activity
 * - يستخدم Prisma ORM للوصول للبيانات
 */
export async function GET(req) {
  try {
    // =========================
    // استعلام لجلب أحدث 10 نشاطات مرتبة حسب تاريخ الإنشاء
    // =========================
    const activities = await prisma.activity.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    // =========================
    // إرجاع البيانات بصيغة JSON
    // =========================
    return new Response(JSON.stringify({ activities }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // =========================
    // تسجيل الأخطاء وإرجاع رسالة مناسبة
    // =========================
    console.error("Error fetching activities:", error);
    return new Response(
      JSON.stringify({ error: "حدث خطأ أثناء جلب النشاطات" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
