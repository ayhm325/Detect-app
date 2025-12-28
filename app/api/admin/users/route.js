// Security: All API routes are protected by withRBAC() for authentication and RBAC. No inline JWT logic.
// Rate limiting and audit logging enabled for sensitive admin endpoints.

import { withRBAC } from "../../../../lib/auth/withRBAC";
import prisma from "../../../../lib/prismaClient";
import { rateLimit } from "../../../../lib/security/rateLimiter";
import { logAudit } from "../../../../lib/security/auditLogger";

export const GET = withRBAC(async (request, user) => {
  const rl = rateLimit(request);
  if (rl.limited) {
    logAudit({ event: "rate_limit_exceeded", userId: user.id, ip: request.headers.get('x-forwarded-for'), details: { endpoint: "GET /api/admin/users" } });
    return Response.json({ error: "Rate limit exceeded" }, { status: 429 });
  }
  try {
    const users = await prisma.user.findMany({
      include: {
        doctor: true,
        patient: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    logAudit({ event: "admin_users_listed", userId: user.id, ip: request.headers.get('x-forwarded-for'), details: { count: users.length } });
    return Response.json(users);
  } catch (error) {
    logAudit({ event: "admin_users_list_error", userId: user.id, ip: request.headers.get('x-forwarded-for'), details: { error: error.message } });
    return Response.json({ error: "Internal error" }, { status: 500 });
  }
}, ["admin"]);

export const POST = withRBAC(async (request, user) => {
  const rl = rateLimit(request);
  if (rl.limited) {
    logAudit({ event: "rate_limit_exceeded", userId: user.id, ip: request.headers.get('x-forwarded-for'), details: { endpoint: "POST /api/admin/users" } });
    return Response.json({ error: "Rate limit exceeded" }, { status: 429 });
  }
  try {
    const body = await request.json();
    const { name, email, password, status } = body;
    if (!name || !email || !password) {
      return Response.json({ error: 'name, email and password are required' }, { status: 400 });
    }
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return Response.json({ error: 'User with this email already exists' }, { status: 409 });
    }
    const bcrypt = await import('bcrypt');
    const hashed = await bcrypt.hash(password, 10);
    const userCreated = await prisma.user.create({
      data: {
        fullName: name,
        email,
        password: hashed,
        role: 'admin',
        isActive: (status || 'active') === 'active'
      }
    });
    logAudit({ event: "admin_user_created", userId: user.id, ip: request.headers.get('x-forwarded-for'), details: { createdUserId: userCreated.id } });
    const { password: _pw, ...safe } = userCreated;
    return Response.json(safe, { status: 201 });
  } catch (error) {
    logAudit({ event: "admin_user_create_error", userId: user.id, ip: request.headers.get('x-forwarded-for'), details: { error: error.message } });
    return Response.json({ error: "Internal error" }, { status: 500 });
  }
}, ["admin"]);
