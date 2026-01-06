import prisma from '../../../../lib/prismaClient.js';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return Response.json({ error: 'invalid_content_type' }, { status: 400 });
    }

    let body;
    try {
      body = await request.json();
    } catch (e) {
      return Response.json({ error: 'invalid_json' }, { status: 400 });
    }

    const { email, currentPassword, newPassword } = body || {};
    if (!email || !currentPassword || !newPassword) {
      return Response.json({ error: 'missing_fields' }, { status: 400 });
    }

    const currentPw = String(currentPassword).trim();
    const newPw = String(newPassword).trim();
    if (currentPw && newPw && currentPw === newPw) {
      return Response.json({ error: 'same_password' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return Response.json({ error: 'user_not_found' }, { status: 404 });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password || '');
    if (!isMatch) {
      return Response.json({ error: 'wrong_current_password' }, { status: 401 });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { email }, data: { password: hashedPassword } });
    return Response.json({ success: true });
  } catch (error) {
    console.error('خطأ أثناء تغيير كلمة المرور:', error?.message);
    return Response.json({ error: 'server_error' }, { status: 500 });
  }
}
