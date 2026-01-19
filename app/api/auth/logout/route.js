// نقطة نهاية API لتسجيل الخروج (Logout) وإلغاء صلاحية التوكن
import { NextResponse } from "next/server";
import { addRevokedToken } from "../../../../lib/auth/revocation.server";
import jwt from "jsonwebtoken";

// دالة POST تستقبل طلب تسجيل خروج وتقوم بإلغاء صلاحية التوكن وحذف الكوكيز
export async function POST(request) {
  try {
   
    // استخراج التوكن من الكوكيز إذا كان موجود
    let token = request.cookies.get("token")?.value;
    // إذا لم يوجد في الكوكيز، حاول استخراجه من الهيدر (Authorization: Bearer ...)
    if (!token) {
      const hdr =
        request.headers.get("authorization") ||
        request.headers.get("Authorization");
      if (hdr && hdr.startsWith("Bearer ")) token = hdr.slice(7).trim();
    }
    // إذا لم يوجد في الكوكيز أو الهيدر، حاول استخراجه من جسم الطلب (body)
    if (!token) {
      try {
        const body = await request.json();
        token = body?.token;
      } catch (e) {}
    }

    // إذا لم يوجد توكن بعد كل المحاولات، أرجع خطأ
    if (!token)
      return NextResponse.json({ error: "no_token_provided" }, { status: 400 });

    
    // محاولة فك تشفير التوكن للحصول على وقت الانتهاء (exp)
    let decoded;
    try {
      decoded = jwt.decode(token) || {};
    } catch (e) {
      decoded = {};
    }
    const exp = decoded.exp ? decoded.exp * 1000 : null;

    // إضافة التوكن إلى قائمة التوكنات الملغية (revoked) في قاعدة البيانات
    try {
      await addRevokedToken(token, exp);
    } catch (e) {
      console.error(
        "/api/auth/logout: could not add revoked token",
        e && e.message,
      );
    }

    
    // تجهيز الاستجابة النهائية
    const res = NextResponse.json({ ok: true });
    // محاولة حذف الكوكيز من المتصفح (إفراغ التوكن)
    try {
      const isProd = process.env.NODE_ENV === "production";
      const sameSite = isProd ? "none" : "lax";
      const secure = isProd;
      res.cookies.set("token", "", {
        httpOnly: true,
        path: "/",
        maxAge: 0,
        sameSite,
        secure,
      });
    } catch (e) {
      // في حال فشل حذف الكوكيز، يتم تسجيل تحذير فقط
      console.warn("/api/auth/logout: could not clear cookie", e && e.message);
    }
    // إرجاع الاستجابة النهائية
    return res;
  } catch (e) {
    // في حال حدوث خطأ غير متوقع، يتم تسجيله وإرجاع رسالة خطأ للواجهة
    console.error("/api/auth/logout error", e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
