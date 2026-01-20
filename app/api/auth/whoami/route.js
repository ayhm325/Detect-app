import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { isTokenRevoked } from "../../../../lib/auth/revocation.server";
import { getJwtSecret } from "../../../../lib/auth/jwtSecret.js";

export async function GET(request) {
  try {
    // محاولة الحصول على التوكن من الكوكيز أولاً
    let token = request.cookies.get("token")?.value;

    // إذا لم يكن موجودًا في الكوكيز، جرب الهيدر Authorization كخيار احتياطي
    if (!token) {
      const hdr =
        request.headers.get("authorization") ||
        request.headers.get("Authorization");
      if (hdr && hdr.startsWith("Bearer ")) token = hdr.slice(7).trim();
    }

    // إذا لم يتم العثور على توكن في أي مكان، نعيد خطأ 401
    if (!token)
      return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    // التحقق من أن التوكن غير ملغى باستخدام helper مشترك
    try {
      const revoked = await isTokenRevoked(token);
      if (revoked)
        return NextResponse.json({ error: "token_revoked" }, { status: 401 });
    } catch (e) {
      console.warn("/api/auth/whoami: revoked check failed", e && e.message);
      // نكمل التحقق العادي حتى لو فشل فحص الملغى
    }

    let user;
    try {
      // التحقق من صحة التوكن باستخدام السر الخاص بالتوقيع
      user = jwt.verify(token, getJwtSecret());
    } catch (e) {
      return NextResponse.json({ error: "invalid_token" }, { status: 401 });
    }

    // إعادة معلومات المستخدم الأساسية فقط (payload مصغر)
    return NextResponse.json({
      id: user.id,
      role: user.role,
      email: user.email,
    });
  } catch (e) {
    console.error("/api/auth/whoami error", e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
