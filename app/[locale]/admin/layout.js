import AdminLayout from "./AdminLayout";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import crypto from "crypto";
import { getJwtSecret } from "../../../lib/auth/jwtSecret.js";
import { getJwtAudience, getJwtIssuer } from "../../../lib/auth/jwtClaims.js";

function base64urlToBase64(b64url) {
  return b64url.replace(/-/g, "+").replace(/_/g, "/");
}

function verifyToken(token) {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [headerB64, payloadB64, sigB64] = parts;
  const data = `${headerB64}.${payloadB64}`;
  const SECRET = getJwtSecret();
  const expected = crypto
    .createHmac('sha256', SECRET)
    .update(data)
    .digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  if (expected !== sigB64) return null;
  try {
    const payloadJson = JSON.parse(Buffer.from(base64urlToBase64(payloadB64), 'base64').toString('utf8'));
    const now = Math.floor(Date.now() / 1000);
    if (typeof payloadJson?.nbf === 'number' && payloadJson.nbf > now) return null;
    if (typeof payloadJson?.exp === 'number' && payloadJson.exp <= now) return null;

    const issuer = getJwtIssuer();
    if (issuer && payloadJson?.iss !== issuer) return null;
    const audience = getJwtAudience();
    if (audience) {
      const aud = payloadJson?.aud;
      const ok = Array.isArray(aud) ? aud.includes(audience) : aud === audience;
      if (!ok) return null;
    }
    return payloadJson;
  } catch (e) {
    return null;
  }
}

export default async function AdminLayoutWrapper({ children, params }) {
  const resolvedParams = await params;
  const locale = (resolvedParams && resolvedParams.locale) || 'en';
  let token;
  try {
    const c = await cookies();
    if (c && typeof c.get === 'function') {
      token = c.get('token')?.value;
    } else {
      const h = await headers();
      const cookieHeader = (h && typeof h.get === 'function') ? (h.get('cookie') || '') : (h && (h.cookie || h['cookie']) ? (h.cookie || h['cookie']) : '');
      token = cookieHeader.split(';').map(s => s.trim()).reduce((acc, pair) => {
        const [k, v] = pair.split('=');
        if (k === 'token') return decodeURIComponent(v || '');
        return acc;
      }, undefined);
    }
  } catch (e) {
    const h = await headers();
    const cookieHeader = (h && typeof h.get === 'function') ? (h.get('cookie') || '') : (h && (h.cookie || h['cookie']) ? (h.cookie || h['cookie']) : '');
    token = cookieHeader.split(';').map(s => s.trim()).reduce((acc, pair) => {
      const [k, v] = pair.split('=');
      if (k === 'token') return decodeURIComponent(v || '');
      return acc;
    }, undefined);
  }
  const user = verifyToken(token);
  if (!user) {
    redirect(`/${locale}/login`);
  }
  if (user.isActive === false || user.isDeleted === true) {
    redirect(`/${locale}/login`);
  }
  if (user.role !== 'admin') {
    redirect(`/${locale}/unauthorized`);
  }

  return <AdminLayout>{children}</AdminLayout>;
}
