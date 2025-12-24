// سكريبت لإضافة نشاطات تجريبية في جدول Activity
import prisma from "../lib/prismaClient.js";

async function seedActivities() {
  const activities = [
    {
      type: "register",
      description: "تسجيل مستخدم جديد: أحمد محمد",
      userId: null,
      meta: { role: "patient" }
    },
    {
      type: "add_doctor",
      description: "إضافة طبيب جديد: د. سارة علي",
      userId: null,
      meta: { specialty: "أشعة" }
    },
    {
      type: "update_patient",
      description: "تحديث بيانات المريض: فاطمة علي",
      userId: null,
      meta: { field: "العنوان" }
    },
    {
      type: "delete_user",
      description: "حذف مستخدم: محمد خالد",
      userId: null,
      meta: { reason: "طلب المستخدم" }
    },
    {
      type: "backup",
      description: "تم إنشاء نسخة احتياطية للنظام",
      userId: null,
      meta: {}
    }
  ];
  for (const activity of activities) {
    await prisma.activity.create({ data: activity });
  }
  console.log("تمت إضافة نشاطات تجريبية بنجاح.");
  process.exit(0);
}

seedActivities().catch(e => { console.error(e); process.exit(1); });
