import prisma from '../../../../lib/prismaClient.js';

// GET /api/admin/notifications/unread-count
export async function GET(req) {
  // يجب تحديد userId الأدمن من الجلسة أو التوكن
  // مؤقتاً: جلب كل الإشعارات غير المقروءة للإدارة
  const count = await prisma.notification.count({
    where: {
      isRead: false,
      isDeleted: false,
      // لاحقاً يمكن تخصيص الفلترة حسب userId أو type إذا لزم
    }
  });
  return Response.json({ unread: count });
}
