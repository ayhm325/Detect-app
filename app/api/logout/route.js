import { NextResponse } from "next/server";

export async function POST() {
  // حذف الكوكي (token)
  const isProd = process.env.NODE_ENV === "production";
  const sameSite = isProd ? "none" : "lax";
  const secure = isProd;
  const response = NextResponse.json({ message: "تم تسجيل الخروج بنجاح" });
  response.cookies.set("token", "", {
    httpOnly: true,
    secure,
    sameSite,
    path: "/",
    maxAge: 0,
  });
  return response;
}
