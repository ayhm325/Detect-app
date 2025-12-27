import { getNotificationsForUser } from '../../../../lib/prismaQueries.js';
import prisma from '../../../../lib/prismaClient.js';

// Get unread notifications count for a user
export async function HEAD(req) {
  const userId = req.nextUrl.searchParams.get('userId') || 'demo-user-id';
  const count = await prisma.notification.count({ where: { userId, isRead: false, isDeleted: false } });
  return new Response(null, { status: 200, headers: { 'X-Unread-Count': count.toString() } });
}

export async function GET(req) {
  // هنا يجب أن تحصل على userId من الجلسة أو التوكن أو الكوكيز
  // مؤقتاً سنستخدم userId ثابت للتجربة
  const userId = req.nextUrl.searchParams.get('userId') || 'demo-user-id';
  const notifications = await getNotificationsForUser(userId);
  return Response.json(notifications);
}

// Mark all notifications as read for a user
export async function PUT(req) {
  const userId = req.nextUrl.searchParams.get('userId') || 'demo-user-id';
  const id = req.nextUrl.searchParams.get('id');
  const body = req.body ? await req.json() : {};
  if (id) {
    // تحديث إشعار واحد
    await prisma.notification.update({
      where: { id },
      data: { ...body }
    });
    return Response.json({ success: true });
  } else {
    // تحديث الكل كمقروء
    await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true }
    });
    return Response.json({ success: true });
  }
}

// Delete all notifications for a user
export async function DELETE(req) {
  const userId = req.nextUrl.searchParams.get('userId') || 'demo-user-id';
  const id = req.nextUrl.searchParams.get('id');
  if (id) {
    // حذف إشعار واحد
    await prisma.notification.delete({ where: { id } });
    return Response.json({ success: true });
  } else {
    // حذف جميع الإشعارات
    await prisma.notification.deleteMany({ where: { userId } });
    return Response.json({ success: true });
  }
}
