import prisma from "../../../../lib/prismaClient";

export async function GET(req) {
  try {
    // جلب أحدث 10 نشاطات من جدول activity (أو logs)
    const activities = await prisma.activity.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
    });
    return new Response(JSON.stringify({ activities }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "خطأ في جلب النشاطات" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
