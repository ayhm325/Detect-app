import prisma from "../../../../lib/prismaClient";

export async function POST(req) {
  try {
    const { type, description, userId, meta } = await req.json();
    const activity = await prisma.activity.create({
      data: { type, description, userId, meta },
    });
    return new Response(JSON.stringify({ activity }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "خطأ في إضافة النشاط" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
