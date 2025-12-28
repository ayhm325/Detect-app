import { NextResponse } from 'next/server';
import { addRevokedToken } from '../../../../lib/auth/revocation.server';
import jwt from 'jsonwebtoken';

export async function POST(request) {
  try {
    // Accept token from cookie OR Authorization header OR body
    let token = request.cookies.get('token')?.value;
    if (!token) {
      const hdr = request.headers.get('authorization') || request.headers.get('Authorization');
      if (hdr && hdr.startsWith('Bearer ')) token = hdr.slice(7).trim();
    }
    if (!token) {
      try {
        const body = await request.json();
        token = body?.token;
      } catch (e) {}
    }

    if (!token) return NextResponse.json({ error: 'no_token_provided' }, { status: 400 });

    // try decode to get expiry
    let decoded;
    try {
      decoded = jwt.decode(token) || {};
    } catch (e) {
      decoded = {};
    }
    const exp = decoded.exp ? decoded.exp * 1000 : null;

    try {
      await addRevokedToken(token, exp);
    } catch (e) {
      console.error('/api/auth/logout: could not add revoked token', e && e.message);
      // still proceed to return ok (best-effort)
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('/api/auth/logout error', e);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
