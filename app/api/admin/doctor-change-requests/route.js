/**
 * API Route
 * /api/admin/doctor-change-requests
 *
 * الوظائف:
 *  - GET   : عرض طلبات تغيير الطبيب
 *  - PATCH : الموافقة أو الرفض على الطلب
 *
 * الحماية:
 *  - RBAC (admin فقط)
 *  - Rate Limiting
 *  - Audit Logging
 */

import { NextResponse } from "next/server";
import prisma from "../../../../lib/prismaClient.js";
import { withRBAC } from "../../../../lib/auth/withRBAC";
import { rateLimit } from "../../../../lib/security/rateLimiter";
import { logAudit } from "../../../../lib/security/auditLogger";
import { createNotificationBestEffort } from "../../../../lib/notifications.js";

/* =========================================================
 * GET /api/admin/doctor-change-requests
 * =========================================================
 * عرض طلبات تغيير الطبيب
 * - افتراضيًا: الطلبات المعلقة فقط
 * - ?all=1 : عرض جميع الطلبات
 */
export const GET = withRBAC(
  async (request, user) => {
    /**
     * =========================
     * 1) Rate Limiting
     * =========================
     */
    const rl = await rateLimit(request);
    if (rl.limited) {
      logAudit({
        event: "rate_limit_exceeded",
        userId: user.id,
        ip: request.headers.get("x-forwarded-for"),
        details: {
          endpoint: "GET /api/admin/doctor-change-requests",
        },
      });
      return NextResponse.json(
        { success: false, error: "Rate limit exceeded" },
        { status: 429 },
      );
    }

    try {
      /**
       * =========================
       * 2) تحديد نوع العرض
       * =========================
       * all=1 => جميع الطلبات
       * غير ذلك => pending فقط
       */
      const all =
        request?.nextUrl?.searchParams?.get("all") === "1";

      /**
       * =========================
       * 3) جلب طلبات تغيير الطبيب
       * =========================
       */
      const reqs = await prisma.changeRequest.findMany({
        where: {
          type: "doctor_change",
          ...(all ? {} : { status: "pending" }),
          isDeleted: false,
        },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              role: true,
              isActive: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },
      });

      /**
       * =========================
       * 4) استخراج معرفات المرضى والأطباء
       * =========================
       */
      const patientIds = Array.from(
        new Set(
          reqs
            .map((r) => r?.details?.patientId)
            .filter(
              (v) => typeof v === "string" && v.length > 0,
            ),
        ),
      );

      const requestedDoctorIds = Array.from(
        new Set(
          reqs
            .map((r) => r?.details?.requestedDoctorId)
            .filter(
              (v) => typeof v === "string" && v.length > 0,
            ),
        ),
      );

      /**
       * =========================
       * 5) جلب المرضى وأطبائهم الحاليين
       * =========================
       */
      const patients = patientIds.length
        ? await prisma.patient.findMany({
            where: { id: { in: patientIds } },
            select: { id: true, doctorId: true },
          })
        : [];

      const patientDoctorMap = new Map(
        patients.map((p) => [p.id, p.doctorId]),
      );

      /**
       * =========================
       * 6) جلب بيانات جميع الأطباء المعنيين
       * =========================
       */
      const allDoctorIds = Array.from(
        new Set(
          [
            ...requestedDoctorIds,
            ...patients.map((p) => p.doctorId),
          ].filter(
            (v) => typeof v === "string" && v.length > 0,
          ),
        ),
      );

      const doctors = allDoctorIds.length
        ? await prisma.doctor.findMany({
            where: { userId: { in: allDoctorIds } },
            include: {
              user: {
                select: {
                  fullName: true,
                  email: true,
                },
              },
            },
          })
        : [];

      const doctorNameById = new Map(
        doctors.map((d) => [
          d.userId,
          d.user?.fullName ||
            d.user?.email ||
            d.userId,
        ]),
      );

      /**
       * =========================
       * 7) تجهيز البيانات لواجهة الأدمن
       * =========================
       */
      const out = reqs.map((r) => {
        const patientId = r.details?.patientId || null;
        const currentDoctorId = patientId
          ? patientDoctorMap.get(patientId) || null
          : null;

        const requestedDoctorId =
          r.details?.requestedDoctorId || null;

        return {
          id: r.id,
          userId: r.userId,
          patientName:
            r.user?.fullName || r.userId,
          status: r.status,
          details: {
            ...(r.details || {}),
            patientId,
            currentDoctorId,
            currentDoctorName: currentDoctorId
              ? doctorNameById.get(currentDoctorId) ||
                currentDoctorId
              : null,
            requestedDoctorId,
            requestedDoctorName: requestedDoctorId
              ? doctorNameById.get(
                  requestedDoctorId,
                ) || requestedDoctorId
              : null,
          },
          reason: r.details?.reason || "",
          requestedDoctorId,
          createdAt: r.createdAt,
        };
      });

      /**
       * =========================
       * 8) Audit Log
       * =========================
       */
      logAudit({
        event: "admin_doctor_change_requests_viewed",
        userId: user.id,
        ip: request.headers.get("x-forwarded-for"),
        details: { count: out.length },
      });

      return NextResponse.json({
        success: true,
        requests: out,
      });
    } catch (e) {
      logAudit({
        event: "admin_doctor_change_requests_view_error",
        userId: user.id,
        ip: request.headers.get("x-forwarded-for"),
        details: { error: e?.message },
      });

      return NextResponse.json(
        { success: false, error: "Server error" },
        { status: 500 },
      );
    }
  },
  ["admin"],
);

/* =========================================================
 * PATCH /api/admin/doctor-change-requests
 * =========================================================
 * الموافقة أو الرفض على طلب تغيير الطبيب
 */
export const PATCH = withRBAC(
  async (request, user) => {
    /**
     * =========================
     * 1) Rate Limiting
     * =========================
     */
    const rl = await rateLimit(request);
    if (rl.limited) {
      logAudit({
        event: "rate_limit_exceeded",
        userId: user.id,
        ip: request.headers.get("x-forwarded-for"),
        details: {
          endpoint:
            "PATCH /api/admin/doctor-change-requests",
        },
      });
      return NextResponse.json(
        { success: false, error: "Rate limit exceeded" },
        { status: 429 },
      );
    }

    try {
      /**
       * =========================
       * 2) قراءة البيانات
       * =========================
       */
      const body = await request.json();
      const { id, action } = body || {};

      if (!id || !action) {
        return NextResponse.json(
          {
            success: false,
            error: "Missing id or action",
          },
          { status: 400 },
        );
      }

      /**
       * =========================
       * 3) جلب الطلب والتحقق منه
       * =========================
       */
      const req = await prisma.changeRequest.findUnique({
        where: { id },
      });

      if (!req) {
        return NextResponse.json(
          {
            success: false,
            error: "Request not found",
          },
          { status: 404 },
        );
      }

      if (req.type !== "doctor_change") {
        return NextResponse.json(
          {
            success: false,
            error: "Invalid request type",
          },
          { status: 400 },
        );
      }

      /**
       * =========================
       * 4) Idempotency
       * =========================
       */
      if (req.status !== "pending") {
        logAudit({
          event:
            "admin_doctor_change_request_non_pending",
          userId: user.id,
          ip: request.headers.get("x-forwarded-for"),
          details: {
            id,
            action,
            status: req.status,
          },
        });

        if (
          req.status === "approved" &&
          action === "approve"
        ) {
          return NextResponse.json({
            success: true,
            message: "Request already approved",
            request: req,
          });
        }

        if (
          req.status === "rejected" &&
          action === "reject"
        ) {
          return NextResponse.json({
            success: true,
            message: "Request already rejected",
            request: req,
          });
        }

        return NextResponse.json(
          {
            success: false,
            error: `Request not pending (current: ${req.status})`,
            currentStatus: req.status,
          },
          { status: 400 },
        );
      }

      /**
       * =========================
       * 5) الموافقة على الطلب
       * =========================
       */
      if (action === "approve") {
        const { patientId, requestedDoctorId } =
          req.details || {};

        if (!patientId || !requestedDoctorId) {
          return NextResponse.json(
            {
              success: false,
              error: "Request details incomplete",
            },
            { status: 400 },
          );
        }

        // تحديث طبيب المريض
        await prisma.patient.update({
          where: { id: patientId },
          data: { doctorId: requestedDoctorId },
        });

        // تحديث حالة الطلب
        const updated =
          await prisma.changeRequest.update({
            where: { id },
            data: {
              status: "approved",
              reviewedAt: new Date(),
            },
          });

        /**
         * إشعار المريض (Best Effort)
         */
        const doctor =
          await prisma.doctor.findUnique({
            where: { userId: requestedDoctorId },
            select: {
              user: {
                select: {
                  fullName: true,
                  email: true,
                },
              },
            },
          });

        const doctorName =
          doctor?.user?.fullName ||
          doctor?.user?.email ||
          requestedDoctorId;

        await createNotificationBestEffort(
          prisma,
          {
            userId: updated.userId,
            type: "success",
            message: {
              ar: `تمت الموافقة على طلب تغيير الطبيب. طبيبك الجديد: ${doctorName}.`,
              en: `Your doctor change request was approved. Your new doctor is ${doctorName}.`,
            },
          },
        );

        /**
         * إشعار الطبيب الجديد (Best Effort)
         */
        try {
          const patient =
            await prisma.patient.findUnique({
              where: { id: patientId },
              select: { fullName: true },
            });

          await createNotificationBestEffort(
            prisma,
            {
              userId: requestedDoctorId,
              type: "info",
              message: {
                ar: `تم تحويل مريض جديد إليك${
                  patient?.fullName
                    ? `: ${patient.fullName}`
                    : ""
                }.`,
                en: `A new patient has been assigned to you${
                  patient?.fullName
                    ? `: ${patient.fullName}`
                    : ""
                }.`,
              },
            },
          );
        } catch {}

        logAudit({
          event:
            "admin_doctor_change_request_approved",
          userId: user.id,
          ip: request.headers.get("x-forwarded-for"),
          details: {
            id,
            patientId,
            requestedDoctorId,
          },
        });

        return NextResponse.json({
          success: true,
          request: updated,
        });
      }

      /**
       * =========================
       * 6) رفض الطلب
       * =========================
       */
      if (action === "reject") {
        const updated =
          await prisma.changeRequest.update({
            where: { id },
            data: {
              status: "rejected",
              reviewedAt: new Date(),
            },
          });

        await createNotificationBestEffort(
          prisma,
          {
            userId: updated.userId,
            type: "warning",
            message: {
              ar: "تم رفض طلب تغيير الطبيب.",
              en: "Your doctor change request was rejected.",
            },
          },
        );

        logAudit({
          event:
            "admin_doctor_change_request_rejected",
          userId: user.id,
          ip: request.headers.get("x-forwarded-for"),
          details: { id },
        });

        return NextResponse.json({
          success: true,
          request: updated,
        });
      }

      /**
       * =========================
       * 7) Action غير معروف
       * =========================
       */
      return NextResponse.json(
        { success: false, error: "Unknown action" },
        { status: 400 },
      );
    } catch (e) {
      logAudit({
        event:
          "admin_doctor_change_request_action_error",
        userId: user.id,
        ip: request.headers.get("x-forwarded-for"),
        details: { error: e?.message },
      });

      return NextResponse.json(
        { success: false, error: "Server error" },
        { status: 500 },
      );
    }
  },
  ["admin"],
);
