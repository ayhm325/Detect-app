import prisma from '../../../../lib/prismaClient.js';

// GET /api/admin/notifications/unread-count
export async function GET(req) {
  // يجب تحديد userId الأدمن من الجلسة أو التوكن
  // مؤقتاً: جلب كل الإشعارات غير المقروءة للإدارة
  const count = await prisma.notification.count({
    where: {
      isRead: false,
      isDeleted: false,
      // يمكن تخصيصها لاحقاً لنوع إشعار أو userId الأدمن
      userRole: 'admin'
    }
  });
  return Response.json({ unread: count });
}
