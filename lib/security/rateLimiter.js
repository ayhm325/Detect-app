// Security: Simple in-memory rate limiter for sensitive endpoints (production should use Redis or similar)
// Configurable via env vars:
// - RATE_LIMIT_WINDOW_MS (ms)
// - RATE_LIMIT_MAX (default global max)
// - RATE_LIMIT_CHAT_MAX (override for /api/chat endpoints)
// This implementation prefers to key limits by authenticated user id (from JWT cookie) when available
// to avoid all requests being aggregated under a single 'unknown' IP key in local/dev environments.
import jwt from "jsonwebtoken";

const RATE_LIMIT_WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '') || 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = parseInt(process.env.RATE_LIMIT_MAX || '') || 10; // default max requests per window
const RATE_LIMIT_CHAT_MAX = parseInt(process.env.RATE_LIMIT_CHAT_MAX || '') || 60; // higher default for chat endpoints
const ipHits = new Map();

export function rateLimit(request) {
  const now = Date.now();

  // Try to prefer authenticated user id as the rate-limit key
  let key = null;
  try {
    const token = request.cookies?.get?.("token")?.value;
    if (token) {
      const decoded = jwt.decode(token);
      if (decoded && decoded.id) {
        key = `user:${decoded.id}`;
      }
    }
  } catch (e) {
    // ignore decode errors and fall back to IP based key
  }

  const ip = request.headers.get('x-forwarded-for') || request.ip || 'unknown';
  if (!key) {
    // For anonymous requests, include a short hash of the User-Agent to avoid grouping all
    // local/dev requests under a single 'unknown' key. This is still best-effort and
    // non-cryptographic.
    const ua = request.headers.get('user-agent') || '';
    function fnv1aHex(str) {
      let h = 2166136261;
      for (let i = 0; i < str.length; i++) {
        h ^= str.charCodeAt(i);
        h = Math.imul(h, 16777619) >>> 0;
      }
      return (h >>> 0).toString(16);
    }
    const uaHash = ua ? fnv1aHex(ua).slice(0, 8) : 'no-ua';
    key = `anon:${ip}:${uaHash}`;
  }

  if (!ipHits.has(key)) ipHits.set(key, []);

  // determine applicable max for this endpoint (allow higher limits for chat)
  let max = RATE_LIMIT_MAX;
  try {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/api/chat')) {
      max = RATE_LIMIT_CHAT_MAX;
    }
  } catch (e) {
    // ignore URL parsing errors and use global max
  }

  const recent = ipHits.get(key).filter(ts => now - ts < RATE_LIMIT_WINDOW_MS);
  if (recent.length >= max) {
    return { limited: true };
  }
  recent.push(now);
  ipHits.set(key, recent);
  return { limited: false };
}
