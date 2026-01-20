import prisma from "../../../../lib/prismaClient";

/**
 * POST /api/admin/activities
 * - إضافة نشاط جديد في جدول Activity
 * - يمكن ربط النشاط بمستخدم محدد عبر userId
 */
export async function POST(req) {
  try {
    // =========================
    // جلب بيانات النشاط من جسم الطلب
    // =========================
    const { type, description, userId, meta } = await req.json();

    // التحقق من وجود الحقول الأساسية
    if (!type || !description) {
      return new Response(
        JSON.stringify({ error: "نوع النشاط والوصف مطلوبان" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // =========================
    // إنشاء النشاط في قاعدة البيانات
    // =========================
    const activity = await prisma.activity.create({
      data: { type, description, userId, meta },
    });

    // =========================
    // إرجاع النشاط الذي تم إنشاؤه
    // =========================
    return new Response(JSON.stringify({ activity }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // =========================
    // تسجيل الخطأ في الـ console وإرجاع رسالة مناسبة
    // =========================
    console.error("Error creating activity:", error);
    return new Response(
      JSON.stringify({ error: "حدث خطأ أثناء إضافة النشاط" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
