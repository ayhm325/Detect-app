import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "../../../../lib/auth/bcryptWrapper.mjs";
import prisma from "../../../../lib/prismaClient.js";
import { isTokenRevoked } from "../../../../lib/auth/revocation.server.js";
import { getJwtSecret } from "../../../../lib/auth/jwtSecret.js";
import { getJwtVerifyOptions } from "../../../../lib/auth/jwtClaims.js";
import { createNotificationBestEffort } from "../../../../lib/notifications";

export async function POST(request) {
  try {
    const contentType = request.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return NextResponse.json(
        { error: "invalid_content_type" },
        { status: 400 },
      );
    }
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json({ error: "invalid_json" }, { status: 400 });
    }

    const { oldPassword, newPassword } = body || {};
    if (!oldPassword || !newPassword) {
      return NextResponse.json({ error: "missing_fields" }, { status: 400 });
    }

    const oldPw = String(oldPassword).trim();
    const newPw = String(newPassword).trim();
    if (oldPw && newPw && oldPw === newPw) {
      return NextResponse.json({ error: "same_password" }, { status: 400 });
    }

    // Accept token from cookie OR Authorization header OR body
    let token = request.cookies.get("token")?.value;
    if (!token) {
      const hdr =
        request.headers.get("authorization") ||
        request.headers.get("Authorization");
      if (hdr && hdr.startsWith("Bearer ")) token = hdr.slice(7).trim();
    }
    if (!token) {
      // allow token in body as fallback
      token = body?.token;
    }
    if (!token)
      return NextResponse.json({ error: "unauthenticated" }, { status: 401 });

    try {
      const revoked = await isTokenRevoked(token);
      if (revoked)
        return NextResponse.json({ error: "token_revoked" }, { status: 401 });
    } catch (e) {
      console.warn(
        "/api/patient/change-password: revoked check failed",
        e && e.message,
      );
    }

    let payload;
    try {
      payload = jwt.verify(token, getJwtSecret(), getJwtVerifyOptions());
    } catch (e) {
      return NextResponse.json({ error: "invalid_token" }, { status: 401 });
    }

    const userId = payload.id;
    if (!userId)
      return NextResponse.json(
        { error: "invalid_token_payload" },
        { status: 401 },
      );

    // find user
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user)
      return NextResponse.json({ error: "user_not_found" }, { status: 404 });

    // verify old password
    const match = await bcrypt.compare(oldPassword, user.password || "");
    if (!match)
      return NextResponse.json(
        { error: "wrong_current_password" },
        { status: 400 },
      );

    // hash new password and update
    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashed },
    });

    await createNotificationBestEffort(prisma, {
      userId,
      type: "warning",
      message: {
        ar: "تنبيه أمني: تم تغيير كلمة المرور الخاصة بحسابك.",
        en: "Security alert: your account password was changed.",
        meta: { kind: "security_password_change" },
      },
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("/api/patient/change-password error", e && e.message);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
