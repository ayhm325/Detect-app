import prisma from './prismaClient.js';

/**
 * جلب جميع الأطباء المتاحين (نشطون) للاختيار من قبل المرضى
 */
export async function getAvailableDoctors() {
  return await prisma.doctor.findMany({
    where: {
      status: 'active'
    },
    include: {
      user: true
    },
    orderBy: {
      createdAt: 'asc'
    }
  });
}
