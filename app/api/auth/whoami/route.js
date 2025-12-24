import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(request) {
  try {
    // Accept token from cookie OR Authorization header (Bearer) as fallback
    let token = request.cookies.get('token')?.value;
    if (!token) {
      const hdr = request.headers.get('authorization') || request.headers.get('Authorization');
      if (hdr && hdr.startsWith('Bearer ')) token = hdr.slice(7).trim();
    }
    if (!token) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
    let user;
    try {
      user = jwt.verify(token, SECRET);
    } catch (e) {
      return NextResponse.json({ error: 'invalid_token' }, { status: 401 });
    }
    // return minimal payload
    return NextResponse.json({ id: user.id, role: user.role, email: user.email });
  } catch (e) {
    console.error('/api/auth/whoami error', e);
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
