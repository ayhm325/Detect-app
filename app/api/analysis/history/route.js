// نقطة نهاية API لإدارة سجل تحاليل الأشعة
// يدعم جلب سجل التحاليل (GET) وحذف نتيجة محددة (DELETE)
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { isTokenRevoked } from "../../../../lib/auth/revocation.server.js";
import {
  getAnalysisHistory,
  deleteAnalysisResult,
} from "../../../../services/analysisResult.service.js";
import { getJwtSecret } from "../../../../lib/auth/jwtSecret.js";

// دالة جلب سجل التحاليل للمستخدم الحالي
export async function GET(request) {
  try {
    // استخراج التوكن من الكوكيز أو الهيدر
    let token = request.cookies.get("token")?.value;
    if (!token) {
      const hdr =
        request.headers.get("authorization") ||
        request.headers.get("Authorization");
      if (hdr && hdr.startsWith("Bearer ")) token = hdr.slice(7).trim();
    }
    if (!token)
      return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    // التحقق من أن التوكن غير ملغي (مستخدم محظور)
    try {
      const revoked = await isTokenRevoked(token);
      if (revoked)
        return NextResponse.json({ error: "token_revoked" }, { status: 401 });
    } catch (e) {
      console.warn(
        "/api/analysis/history: revoked check failed",
        e && e.message,
      );
    }

    let payload;
    // فك تشفير التوكن والتحقق منه
    try {
      payload = jwt.verify(token, getJwtSecret());
    } catch (e) {
      return NextResponse.json({ error: "invalid_token" }, { status: 401 });
    }

    const userId = payload.id;
    if (!userId)
      return NextResponse.json(
        { error: "invalid_token_payload" },
        { status: 401 },
      );

    // جلب سجل التحاليل من قاعدة البيانات
    const results = await getAnalysisHistory(userId);

    // إرجاع النتائج للواجهة
    return NextResponse.json({ success: true, data: results });
  } catch (e) {
    // في حال حدوث خطأ غير متوقع، يتم تسجيله وإرجاع رسالة خطأ للواجهة
    console.error("/api/analysis/history error", e && e.message, e && e.stack);
    if (process.env.NODE_ENV !== "production") {
      return NextResponse.json(
        { error: e.message || String(e), stack: e.stack },
        { status: 500 },
      );
    }
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}

// دالة حذف نتيجة تحليل من سجل المستخدم
export async function DELETE(request) {
  try {
    // نفس خطوات المصادقة كما في GET
    let token = request.cookies.get("token")?.value;
    if (!token) {
      const hdr =
        request.headers.get("authorization") ||
        request.headers.get("Authorization");
      if (hdr && hdr.startsWith("Bearer ")) token = hdr.slice(7).trim();
    }
    if (!token)
      return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    // التحقق من أن التوكن غير ملغي (مستخدم محظور)
    try {
      const revoked = await isTokenRevoked(token);
      if (revoked)
        return NextResponse.json({ error: "token_revoked" }, { status: 401 });
    } catch (e) {
      console.warn(
        "/api/analysis/history DELETE: revoked check failed",
        e && e.message,
      );
    }

    let payload;
    // فك تشفير التوكن والتحقق منه
    try {
      payload = jwt.verify(token, getJwtSecret());
    } catch (e) {
      return NextResponse.json({ error: "invalid_token" }, { status: 401 });
    }

    const userId = payload.id;
    if (!userId)
      return NextResponse.json(
        { error: "invalid_token_payload" },
        { status: 401 },
      );

    // قبول معرف النتيجة (id) من الاستعلام أو من جسم الطلب
    const url = new URL(request.url);
    let id = url.searchParams.get("id");
    if (!id) {
      const body = await request.json().catch(() => ({}));
      id = body && body.id;
    }

    if (!id) return NextResponse.json({ error: "missing_id" }, { status: 400 });

    // حذف النتيجة من قاعدة البيانات
    const result = await deleteAnalysisResult(userId, id);

    // إرجاع عدد النتائج المحذوفة
    return NextResponse.json({ success: true, deletedCount: result.count });
  } catch (e) {
    // في حال حدوث خطأ غير متوقع، يتم تسجيله وإرجاع رسالة خطأ للواجهة
    console.error(
      "/api/analysis/history DELETE error",
      e && e.message,
      e && e.stack,
    );
    if (process.env.NODE_ENV !== "production") {
      return NextResponse.json(
        { error: e.message || String(e), stack: e.stack },
        { status: 500 },
      );
    }
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
