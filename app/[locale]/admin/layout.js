import AdminLayout from "./AdminLayout";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import crypto from "crypto";

const SECRET = process.env.JWT_SECRET || "your-secret";

function base64urlToBase64(b64url) {
  return b64url.replace(/-/g, "+").replace(/_/g, "/");
}

function verifyToken(token) {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [headerB64, payloadB64, sigB64] = parts;
  const data = `${headerB64}.${payloadB64}`;
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
