import jwt from 'jsonwebtoken';
import { clearRevokedForTest, isTokenRevoked, addRevokedToken } from '../lib/auth/revocation.server.js';
import { GET as whoamiGET } from '../app/api/auth/whoami/route.js';

const SECRET = process.env.JWT_SECRET || 'your-secret-key';

describe('revocation helper and whoami route', () => {
  beforeEach(async () => {
    await clearRevokedForTest();
  });

  test('non-revoked token is accepted by whoami', async () => {
    const token = jwt.sign({ id: 'user-1', role: 'patient', email: 'a@b.com' }, SECRET);
    const revoked = await isTokenRevoked(token);
    expect(revoked).toBe(false);

    const req = {
      headers: { get: (name) => (name.toLowerCase().startsWith('authorization') ? `Bearer ${token}` : null) },
      cookies: { get: () => undefined }
    };

    const res = await whoamiGET(req);
    // NextResponse exposes status and json() promise
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.id).toBe('user-1');
  });

  test('revoked token is rejected (401) by whoami', async () => {
    const token = jwt.sign({ id: 'user-2', role: 'admin', email: 'x@y.com' }, SECRET);
    await addRevokedToken(token, Math.floor(Date.now() / 1000) + 3600);

    const revoked = await isTokenRevoked(token);
    expect(revoked).toBe(true);

    const req = {
      headers: { get: (name) => (name.toLowerCase().startsWith('authorization') ? `Bearer ${token}` : null) },
      cookies: { get: () => undefined }
    };

    const res = await whoamiGET(req);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe('token_revoked');
  });
});
