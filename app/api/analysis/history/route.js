import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { isTokenRevoked } from '../../../../lib/auth/revocation.server.js';
import { getAnalysisHistory, deleteAnalysisResult } from '../../../../services/analysisResult.service.js';

const SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(request) {
  try {
    // extract token
    let token = request.cookies.get('token')?.value;
    if (!token) {
      const hdr = request.headers.get('authorization') || request.headers.get('Authorization');
      if (hdr && hdr.startsWith('Bearer ')) token = hdr.slice(7).trim();
    }
    if (!token) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

    try {
      const revoked = await isTokenRevoked(token);
      if (revoked) return NextResponse.json({ error: 'token_revoked' }, { status: 401 });
    } catch (e) {
      console.warn('/api/analysis/history: revoked check failed', e && e.message);
    }

    let payload;
    try {
      payload = jwt.verify(token, SECRET);
    } catch (e) {
      return NextResponse.json({ error: 'invalid_token' }, { status: 401 });
    }

    const userId = payload.id;
    if (!userId) return NextResponse.json({ error: 'invalid_token_payload' }, { status: 401 });

    const results = await getAnalysisHistory(userId);

    return NextResponse.json({ success: true, data: results });
  } catch (e) {
    console.error('/api/analysis/history error', e && e.message, e && e.stack);
    if (process.env.NODE_ENV !== 'production') {
      return NextResponse.json({ error: e.message || String(e), stack: e.stack }, { status: 500 });
    }
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    // auth same as GET
    let token = request.cookies.get('token')?.value;
    if (!token) {
      const hdr = request.headers.get('authorization') || request.headers.get('Authorization');
      if (hdr && hdr.startsWith('Bearer ')) token = hdr.slice(7).trim();
    }
    if (!token) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

    try {
      const revoked = await isTokenRevoked(token);
      if (revoked) return NextResponse.json({ error: 'token_revoked' }, { status: 401 });
    } catch (e) {
      console.warn('/api/analysis/history DELETE: revoked check failed', e && e.message);
    }

    let payload;
    try {
      payload = jwt.verify(token, SECRET);
    } catch (e) {
      return NextResponse.json({ error: 'invalid_token' }, { status: 401 });
    }

    const userId = payload.id;
    if (!userId) return NextResponse.json({ error: 'invalid_token_payload' }, { status: 401 });

    // accept id from query or body
    const url = new URL(request.url);
    let id = url.searchParams.get('id');
    if (!id) {
      const body = await request.json().catch(() => ({}));
      id = body && body.id;
    }

    if (!id) return NextResponse.json({ error: 'missing_id' }, { status: 400 });

    const result = await deleteAnalysisResult(userId, id);

    return NextResponse.json({ success: true, deletedCount: result.count });
  } catch (e) {
    console.error('/api/analysis/history DELETE error', e && e.message, e && e.stack);
    if (process.env.NODE_ENV !== 'production') {
      return NextResponse.json({ error: e.message || String(e), stack: e.stack }, { status: 500 });
    }
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
