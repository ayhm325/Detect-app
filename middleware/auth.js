// JWT middleware for API protection (for API routes if needed)
import jwt from "jsonwebtoken";
import { getJwtSecret } from "../lib/auth/jwtSecret.js";
import { getJwtVerifyOptions } from "../lib/auth/jwtClaims.js";

const SECRET = getJwtSecret();

export function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Token required" });
  jwt.verify(token, SECRET, getJwtVerifyOptions(), (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    req.user = user;
    next();
  });
}

// ملاحظة: الحماية الأساسية لمسارات Next.js تتم عبر middleware.js في الجذر.
