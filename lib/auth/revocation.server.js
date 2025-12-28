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

export async function isTokenRevoked(token) {
  if (!token) return false;
  const h = hashToken(token);
  const revoked = await readRevokedFile();
  return Boolean(revoked.find((r) => r.hash === h));
}

export async function addRevokedToken(token, exp = null) {
  if (!token) return;
  const list = await readRevokedFile();
  const h = hashToken(token);
  if (!list.find((r) => r.hash === h)) {
    list.push({ hash: h, revokedAt: Date.now(), exp });
    await writeRevokedFile(list);
  }
}

export async function clearRevokedForTest() {
  await writeRevokedFile([]);
}
