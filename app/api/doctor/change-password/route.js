import prisma from '../../../../lib/prismaClient.js';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const { email, currentPassword, newPassword } = await request.json();
    if (!email || !currentPassword || !newPassword) {
      return Response.json({ error: 'جميع الحقول مطلوبة' }, { status: 400 });
    }
    // ابحث عن المستخدم
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return Response.json({ error: 'المستخدم غير موجود' }, { status: 404 });
    }
    // تحقق من كلمة المرور الحالية
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return Response.json({ error: 'كلمة المرور الحالية غير صحيحة' }, { status: 401 });
    }
    // حدث كلمة المرور
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });
    return Response.json({ success: true });
  } catch (error) {
    console.error('خطأ أثناء تغيير كلمة المرور:', error?.message);
    return Response.json({ error: 'حدث خطأ أثناء تغيير كلمة المرور' }, { status: 500 });
  }
}
