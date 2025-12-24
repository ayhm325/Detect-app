import prisma from '../prismaClient.js';

/**
 * جلب جميع الأطباء الذين حالتهم "معلق" (pending)
 * بعد الموافقة، لا يمكن العودة إلى "معلق"
 */
export async function getPendingDoctors() {
  return await prisma.doctor.findMany({
    where: {
      status: 'pending', // المصدر الرسمي للحالة
      isDeleted: false,  // نتجاهل الأطباء المحذوفين
    },
    include: {
      user: true,        // جلب بيانات المستخدم المرتبط
    },
    orderBy: {
      createdAt: 'asc',  // ترتيب حسب تاريخ الإنشاء (اختياري)
    },
  });
}
