import { NextResponse } from "next/server";
import { isTokenRevoked } from "../../../../lib/auth/revocation.server";

export async function POST(request) {
  try {
    let token = request.cookies.get("token")?.value;
    if (!token) {
      const hdr =
        request.headers.get("authorization") ||
        request.headers.get("Authorization");
      if (hdr && hdr.startsWith("Bearer ")) token = hdr.slice(7).trim();
    }
    if (!token) return NextResponse.json({ revoked: false });

    const revoked = await isTokenRevoked(token);
    return NextResponse.json({ revoked: Boolean(revoked) });
  } catch (e) {
    console.error("/api/auth/is-revoked error", e);
    return NextResponse.json({ revoked: false }, { status: 500 });
  }
}
