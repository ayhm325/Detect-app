// Security: Simple in-memory rate limiter for sensitive endpoints (production should use Redis or similar)
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 10; // max requests per window
const ipHits = new Map();

export function rateLimit(request) {
  const ip = request.headers.get('x-forwarded-for') || request.ip || 'unknown';
  const now = Date.now();
  if (!ipHits.has(ip)) ipHits.set(ip, []);
  const hits = ipHits.get(ip).filter(ts => now - ts < RATE_LIMIT_WINDOW_MS);
  if (hits.length >= RATE_LIMIT_MAX) {
    return { limited: true };
  }
  hits.push(now);
  ipHits.set(ip, hits);
  return { limited: false };
}
