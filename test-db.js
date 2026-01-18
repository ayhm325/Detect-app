import prisma from "./lib/prismaClient.js";

async function main() {
  try {
    // استعلام بسيط لجلب أول مستخدم (أو أي جدول موجود عندك)
    const user = await prisma.user.findFirst();
    console.log("نجح الاتصال! أول مستخدم:", user);
  } catch (error) {
    console.error("فشل الاتصال بقاعدة البيانات:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
