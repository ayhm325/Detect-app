import { NextResponse } from "next/server";
import prisma from "../../../lib/prismaClient.js";
import { withRBAC } from "../../../lib/auth/withRBAC";
import { rateLimit } from "../../../lib/security/rateLimiter";
import { logAudit } from "../../../lib/security/auditLogger";

// ==============================
// GET /api/doctor-change-requests
// ==============================
// هذا المسار يستخدمه المريض لجلب قائمة الأطباء (النشطين أو المعلقين)
// ليختار طبيبًا جديدًا عند طلب تغيير الطبيب
export const GET = withRBAC(
  async (request, user) => {
    // تطبيق Rate Limiting لمنع إساءة الاستخدام
    const rl = await rateLimit(request);
    if (rl.limited) {
      // تسجيل محاولة تجاوز الحد في سجل التدقيق
      logAudit({
        event: "rate_limit_exceeded",
        userId: user.id,
        ip: request.headers.get("x-forwarded-for"),
        details: { endpoint: "GET /api/doctor-change-requests" },
      });

      // إرجاع خطأ 429 عند تجاوز الحد
      return NextResponse.json(
        { success: false, error: "Rate limit exceeded" },
        { status: 429 },
      );
    }

    try {
      // جلب جميع الأطباء بحالة active أو pending
      // مع بيانات المستخدم المرتبطة بكل طبيب
      const doctors = await prisma.doctor.findMany({
        where: { status: { in: ["active", "pending"] } },
        select: {
          userId: true,
          status: true,
          phone: true,
          clinic: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              isActive: true,
              role: true,
              createdAt: true,
            },
          },
        },
        // ترتيب الأطباء حسب تاريخ الإنشاء (الأقدم أولًا)
        orderBy: { createdAt: "asc" },
      });

      // تسجيل عملية جلب قائمة الأطباء في سجل التدقيق
      logAudit({
        event: "doctor_change_doctors_listed",
        userId: user.id,
        ip: request.headers.get("x-forwarded-for"),
        details: { count: doctors.length },
      });

      // إرجاع القائمة بنجاح
      return NextResponse.json({ success: true, doctors });
    } catch (error) {
      // تسجيل أي خطأ يحدث أثناء جلب البيانات
      logAudit({
        event: "doctor_change_doctors_list_error",
        userId: user.id,
        ip: request.headers.get("x-forwarded-for"),
        details: { error: error.message },
      });

      // إرجاع خطأ عام من الخادم
      return NextResponse.json(
        { success: false, error: "Server error" },
        { status: 500 },
      );
    }
  },
  // السماح فقط للمستخدمين بدور "patient"
  ["patient"],
);

// ===============================
// POST /api/doctor-change-requests
// ===============================
// هذا المسار يستخدمه المريض لإرسال طلب تغيير الطبيب الحالي
export const POST = withRBAC(
  async (request, user) => {
    // تطبيق Rate Limiting
    const rl = await rateLimit(request);
    if (rl.limited) {
      // تسجيل تجاوز الحد
      logAudit({
        event: "rate_limit_exceeded",
        userId: user.id,
        ip: request.headers.get("x-forwarded-for"),
        details: { endpoint: "POST /api/doctor-change-requests" },
      });

      return NextResponse.json(
        { success: false, error: "Rate limit exceeded" },
        { status: 429 },
      );
    }

    try {
      // قراءة بيانات الطلب (JSON body)
      const body = await request.json();

      // معرف المستخدم الحالي
      const userId = user.id;

      // جلب سجل المريض المرتبط بالمستخدم
      const patient = await prisma.patient.findFirst({ where: { userId } });
      if (!patient)
        return NextResponse.json(
          { success: false, error: "Patient not found" },
          { status: 404 },
        );

      // استخراج معرف الطبيب المطلوب من عدة احتمالات
      const requestedDoctorIdRaw =
        body.requestedDoctorId || body.newDoctorId || body.newDoctor;

      // تنظيف القيمة إذا كانت نصًا
      const requestedDoctorId =
        typeof requestedDoctorIdRaw === "string"
          ? requestedDoctorIdRaw.trim()
          : requestedDoctorIdRaw;

      // سبب طلب التغيير (اختياري)
      const reason = body.reason || "";

      // التحقق من وجود الطبيب المطلوب
      if (!requestedDoctorId) {
        return NextResponse.json(
          { success: false, error: "Missing requestedDoctorId" },
          { status: 400 },
        );
      }

      // منع إرسال طلب تغيير لنفس الطبيب الحالي
      if (patient.doctorId && requestedDoctorId === patient.doctorId) {
        return NextResponse.json(
          {
            success: false,
            error: "Requested doctor is the same as current doctor",
          },
          { status: 400 },
        );
      }

      // إنشاء طلب تغيير طبيب جديد في جدول changeRequest
      const cr = await prisma.changeRequest.create({
        data: {
          userId: userId,
          type: "doctor_change",
          status: "pending",
          details: {
            patientId: patient.id,
            currentDoctorId: patient.doctorId || null,
            requestedDoctorId,
            reason,
          },
        },
      });

      // تسجيل عملية إنشاء الطلب في سجل التدقيق
      logAudit({
        event: "doctor_change_requested",
        userId: user.id,
        ip: request.headers.get("x-forwarded-for"),
        details: { patientId: patient.id, requestedDoctorId },
      });

      // إرجاع الطلب الذي تم إنشاؤه بنجاح
      return NextResponse.json({ success: true, request: cr }, { status: 201 });
    } catch (error) {
      // تسجيل أي خطأ غير متوقع
      logAudit({
        event: "doctor_change_request_error",
        userId: user.id,
        ip: request.headers.get("x-forwarded-for"),
        details: { error: error.message },
      });

      // إرجاع الخطأ
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 },
      );
    }
  },
  // السماح فقط للمريض بإرسال الطلب
  ["patient"],
);
