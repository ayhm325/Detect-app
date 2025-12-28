import fs from 'fs/promises';
import path from 'path';
import { createHash } from 'crypto';

const DEFAULT_PATH = path.join(process.cwd(), 'data', 'revokedTokens.json');

function getRevokedPath() {
  return process.env.REVOKED_TOKENS_PATH || DEFAULT_PATH;
}

function hashToken(token) {
  return createHash('sha256').update(token).digest('hex');
}

async function readRevokedFile() {
  try {
    const p = getRevokedPath();
    const txt = await fs.readFile(p, 'utf8');
    const arr = JSON.parse(txt || '[]');
    // Migration: support old entries with `token` field by converting to `hash`
    return arr.map((it) => {
      if (it.hash) return it;
      if (it.token) return { hash: hashToken(it.token), revokedAt: it.revokedAt || Date.now(), exp: it.exp || null };
      return it;
    });
  } catch (e) {
    return [];
  }
}

async function writeRevokedFile(list) {
  const p = getRevokedPath();
  await fs.mkdir(path.dirname(p), { recursive: true });
  await fs.writeFile(p, JSON.stringify(list, null, 2), 'utf8');
}

const useRedis = Boolean(process.env.REDIS_URL);

async function ensureRedisModule() {
  if (!useRedis) return null;
  try {
    // dynamic import to avoid loading ioredis when not used
    const mod = await import('./revocation.redis.js');
    return mod;
  } catch (e) {
    console.warn('Failed to load Redis revocation module, falling back to file store', e && e.message);
    return null;
  }
}

async function file_isTokenRevoked(token) {
  if (!token) return false;
  const h = hashToken(token);
  const revoked = await readRevokedFile();
  return Boolean(revoked.find((r) => r.hash === h));
}

async function file_addRevokedToken(token, exp = null) {
  if (!token) return;
  const list = await readRevokedFile();
  const h = hashToken(token);
  if (!list.find((r) => r.hash === h)) {
    list.push({ hash: h, revokedAt: Date.now(), exp });
    await writeRevokedFile(list);
  }
}

async function file_clearRevokedForTest() {
  await writeRevokedFile([]);
}

export async function isTokenRevoked(token) {
  if (!token) return false;
  if (useRedis) {
    const mod = await ensureRedisModule();
    if (mod && mod.isTokenRevoked) return mod.isTokenRevoked(token);
  }
  return file_isTokenRevoked(token);
}

export async function addRevokedToken(token, exp = null) {
  if (!token) return;
  if (useRedis) {
    const mod = await ensureRedisModule();
    if (mod && mod.addRevokedToken) return mod.addRevokedToken(token, exp);
  }
  return file_addRevokedToken(token, exp);
}

export async function clearRevokedForTest() {
  if (useRedis) {
    const mod = await ensureRedisModule();
    if (mod && mod.clearRevokedForTest) return mod.clearRevokedForTest();
  }
  return file_clearRevokedForTest();
}
