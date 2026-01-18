// production-ready Redis rate limiter for Next.js / Node.js
import jwt from "jsonwebtoken";
import Redis from "ioredis";

// إعدادات البيئة مع قيم افتراضية
const RATE_LIMIT_WINDOW_MS =
  parseInt(process.env.RATE_LIMIT_WINDOW_MS || "") || 60 * 1000;
const RATE_LIMIT_MAX = parseInt(process.env.RATE_LIMIT_MAX || "") || 10;
const RATE_LIMIT_CHAT_MAX =
  parseInt(process.env.RATE_LIMIT_CHAT_MAX || "") || 60;
const RATE_LIMIT_REDIS_RETRIES =
  parseInt(process.env.RATE_LIMIT_REDIS_RETRIES || "") || 3;

// fallback in-memory store
const ipHits = new Map();

// Singleton Redis client
function getRedisClient() {
  if (globalThis.__rl_redis) return globalThis.__rl_redis;
  const redisUrl =
    process.env.REDIS_URL || process.env.REDIS_URI || "redis://127.0.0.1:6379";
  const client = new Redis(redisUrl);
  globalThis.__rl_redis = client;
  client.on("error", (err) => console.error("Redis client error:", err));
  return client;
}

// FNV-1a hash for anonymous users
function fnv1aHex(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return (h >>> 0).toString(16);
}

// Core async rate limiter
export async function rateLimit(request) {
  if (
    process.env.NODE_ENV === "development" &&
    process.env.RATE_LIMIT_DISABLE_DEV !== "false"
  ) {
    return { limited: false };
  }

  let key = null;
  try {
    const token = request.cookies?.get?.("token")?.value;
    if (token) {
      const decoded = jwt.decode(token);
      if (decoded && decoded.id) key = `rl:user:${decoded.id}`;
    }
  } catch (e) {
    console.warn("JWT decode failed:", e.message);
  }

  const ip = request.headers.get("x-forwarded-for") || request.ip || "unknown";
  if (!key) {
    const ua = request.headers.get("user-agent") || "";
    const uaHash = ua ? fnv1aHex(ua).slice(0, 8) : "no-ua";
    key = `rl:anon:${ip}:${uaHash}`;
  }

  let max = RATE_LIMIT_MAX;
  try {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api/chat")) max = RATE_LIMIT_CHAT_MAX;
  } catch (e) {
    console.warn("URL parsing failed, using default max:", e.message);
  }

  const redis = getRedisClient();
  const luaScript = `
    local v = redis.call('INCR', KEYS[1])
    if tonumber(v) == 1 then
      redis.call('PEXPIRE', KEYS[1], ARGV[1])
    end
    return v
  `;

  // Try Redis with retries
  for (let attempt = 1; attempt <= RATE_LIMIT_REDIS_RETRIES; attempt++) {
    try {
      const current = await redis.eval(luaScript, 1, key, RATE_LIMIT_WINDOW_MS);
      const count = Number(current || 0);
      if (count > max) {
        console.info(`Rate limit exceeded for ${key}: ${count} > ${max}`);
        return { limited: true };
      }
      return { limited: false };
    } catch (err) {
      console.warn(
        `Redis attempt ${attempt} failed for key ${key}:`,
        err.message,
      );
      if (attempt === RATE_LIMIT_REDIS_RETRIES) {
        console.error("Redis unavailable, falling back to memory store");
      } else {
        await new Promise((res) => setTimeout(res, 50 * attempt)); // small backoff
      }
    }
  }

  // Memory fallback (best-effort)
  try {
    const now = Date.now();
    if (!ipHits.has(key)) ipHits.set(key, []);
    const recent = ipHits
      .get(key)
      .filter((ts) => now - ts < RATE_LIMIT_WINDOW_MS);
    if (recent.length >= max) {
      console.info(
        `Memory fallback rate limit exceeded for ${key}: ${recent.length} > ${max}`,
      );
      return { limited: true };
    }
    recent.push(now);
    ipHits.set(key, recent);
    return { limited: false };
  } catch (memErr) {
    console.error("Memory fallback error:", memErr);
    return { limited: false };
  }
}
