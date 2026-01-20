import prisma from "../../../../lib/prismaClient.js";
import { NextResponse } from "next/server";

/**
 * GET /api/admin/notifications/unread-count
 * جلب عدد الإشعارات غير المقروءة للأدمن
 */
export async function GET(req) {
  try {
    // حاليًا نقوم بحساب جميع الإشعارات غير المقروءة وغير المحذوفة للأدمن
    const unreadCount = await prisma.notification.count({
      where: {
        isRead: false,
        isDeleted: false,
        userRole: "admin", // تأكد من وجود حقل userRole في جدول notifications
      },
    });

    return NextResponse.json({ unread: unreadCount }, { status: 200 });
  } catch (error) {
    // إذا حدث خطأ في قاعدة البيانات، نرجع رسالة خطأ
    console.error("Error fetching unread notifications:", error);

    return NextResponse.json(
      { error: "حدث خطأ أثناء جلب عدد الإشعارات غير المقروءة" },
      { status: 500 }
    );
  }
}
