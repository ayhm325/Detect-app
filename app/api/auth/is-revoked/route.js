// نقطة نهاية API للتحقق إذا كان التوكن ملغي (revoked) أم لا
import { NextResponse } from "next/server";
import { isTokenRevoked } from "../../../../lib/auth/revocation.server";

// دالة POST تستقبل طلب وتتحقق من حالة التوكن
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
    // إذا لم يوجد توكن، اعتبره غير ملغي (revoked: false)
    if (!token) return NextResponse.json({ revoked: false });

    // استدعاء دالة التحقق من إلغاء التوكن
    const revoked = await isTokenRevoked(token);
    // إرجاع النتيجة للواجهة (revoked: true/false)
    return NextResponse.json({ revoked: Boolean(revoked) });
  } catch (e) {
    // في حال حدوث خطأ غير متوقع، يتم تسجيله وإرجاع revoked: false مع كود خطأ 500
    console.error("/api/auth/is-revoked error", e);
    return NextResponse.json({ revoked: false }, { status: 500 });
  }
}
