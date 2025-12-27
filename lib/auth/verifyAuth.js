// Security: Centralized server-side JWT authentication and RBAC enforcement.
// Only reads JWT from HttpOnly cookies, validates signature, expiration, and user status.
// Throws clear errors for missing/invalid/expired/inactive/deleted tokens.

import jwt from "jsonwebtoken";

// Enforce: No fallback for JWT secret, must be set in environment
export function verifyAuth(request, allowedRoles) {
  const SECRET = process.env.JWT_SECRET;
  if (!SECRET || SECRET === 'your-secret-key' || SECRET === 'secret') {
    throw new Error("JWT_SECRET must be set securely in environment. Fallbacks are forbidden.");
  }

  const token = request.cookies.get("token")?.value;
  if (!token) throw Object.assign(new Error("Missing token"), { code: "MISSING_TOKEN" });

  let user;
  try {
    user = jwt.verify(token, SECRET);
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      throw Object.assign(new Error("Token expired"), { code: "EXPIRED_TOKEN" });
    }
    throw Object.assign(new Error("Invalid token"), { code: "INVALID_TOKEN" });
  }

  if (!user || !user.id || !user.role) {
    throw Object.assign(new Error("Invalid token payload"), { code: "INVALID_TOKEN" });
  }
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    throw Object.assign(new Error("Forbidden role"), { code: "FORBIDDEN_ROLE" });
  }
  if (user.isActive === false) {
    throw Object.assign(new Error("Inactive user"), { code: "INACTIVE_USER" });
  }
  if (user.isDeleted === true) {
    throw Object.assign(new Error("Deleted user"), { code: "DELETED_USER" });
  }

  return {
    id: user.id,
    role: user.role,
    isActive: user.isActive !== false,
    isDeleted: !!user.isDeleted,
  };
}
