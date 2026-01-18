import { NextResponse } from "next/server";
import prisma from "../../../../lib/prismaClient";
import { withRBAC } from "../../../../lib/auth/withRBAC";
import { rateLimit } from "../../../../lib/security/rateLimiter";
import { logAudit } from "../../../../lib/security/auditLogger";

export const GET = withRBAC(
  async (request, user) => {
    const rl = await rateLimit(request);
    if (rl.limited) {
      logAudit({
        event: "rate_limit_exceeded",
        userId: user.id,
        ip: request.headers.get("x-forwarded-for"),
        details: { endpoint: "GET /api/doctor/me" },
      });
      return NextResponse.json(
        { error: "Rate limit exceeded" },
        { status: 429 },
      );
    }
    try {
      // جلب بيانات المستخدم والطبيب المرتبط
      const userObj = await prisma.user.findUnique({ where: { id: user.id } });
      const doctor = await prisma.doctor.findFirst({
        where: { userId: user.id },
      });
      if (!doctor)
        return NextResponse.json(
          { error: "Doctor not found" },
          { status: 404 },
        );

      const out = {
        id: doctor.userId,
        name: userObj.fullName || "",
        email: userObj.email || "",
        phone: doctor.phone || "",
        specialty: doctor.specialty || "",
        bio: doctor.bio || "",
        licenseNumber: doctor.licenseNumber || "",
        status: doctor.status || "",
        createdAt: doctor.createdAt,
      };

      logAudit({
        event: "doctor_profile_viewed",
        userId: user.id,
        ip: request.headers.get("x-forwarded-for"),
        details: { doctorId: doctor.userId },
      });
      return NextResponse.json({ profile: out }, { status: 200 });
    } catch (err) {
      logAudit({
        event: "doctor_profile_view_error",
        userId: user.id,
        ip: request.headers.get("x-forwarded-for"),
        details: { error: err.message },
      });
      return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
  },
  ["doctor"],
);
