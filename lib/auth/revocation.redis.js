import Redis from "ioredis";
import { createHash } from "crypto";

const redis = new Redis(process.env.REDIS_URL);

function hashToken(token) {
  return createHash("sha256").update(token).digest("hex");
}

export async function isTokenRevoked(token) {
  if (!token) return false;
  const h = hashToken(token);
  const v = await redis.get(`revoked:${h}`);
  return Boolean(v);
}

export async function addRevokedToken(token, exp = null) {
  if (!token) return;
  const h = hashToken(token);
  if (exp) {
    const ttlMs = Math.max(0, Math.floor(exp * 1000 - Date.now()));
    if (ttlMs > 0) {
      await redis.set(`revoked:${h}`, "1", "PX", ttlMs);
      return;
    }
  }
  await redis.set(`revoked:${h}`, "1");
}

export async function clearRevokedForTest() {
  // Remove all keys matching revoked:*
  const stream = redis.scanStream({ match: "revoked:*", count: 100 });
  const keys = [];
  for await (const chunk of stream) {
    if (chunk.length) keys.push(...chunk);
  }
  if (keys.length) await redis.del(...keys);
}
