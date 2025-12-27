import prisma from '../../../../lib/prismaClient.js';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const { email, currentPassword, newPassword } = await request.json();
    console.log('طلب تغيير كلمة المرور:', { email, currentPassword, newPassword });
    if (!email || !currentPassword || !newPassword) {
      console.log('حقول ناقصة');
      return Response.json({ error: 'جميع الحقول مطلوبة' }, { status: 400 });
    }
    // ابحث عن المستخدم
    const user = await prisma.user.findUnique({ where: { email } });
    console.log('نتيجة البحث عن المستخدم:', user);
    if (!user) {
      console.log('المستخدم غير موجود');
      return Response.json({ error: 'المستخدم غير موجود' }, { status: 404 });
    }
    // تحقق من كلمة المرور الحالية
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    console.log('نتيجة التحقق من كلمة المرور:', isMatch);
    if (!isMatch) {
      console.log('كلمة المرور الحالية غير صحيحة');
      return Response.json({ error: 'كلمة المرور الحالية غير صحيحة' }, { status: 401 });
    }
    // حدث كلمة المرور
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });
    console.log('تم تحديث كلمة المرور بنجاح');
    return Response.json({ success: true });
  } catch (error) {
    console.error('خطأ أثناء تغيير كلمة المرور:', error);
    return Response.json({ error: 'حدث خطأ أثناء تغيير كلمة المرور' }, { status: 500 });
  }
}
