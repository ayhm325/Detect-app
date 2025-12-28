
import { NextResponse } from 'next/server';
const SECRET = process.env.JWT_SECRET || 'your-secret';

function base64urlDecodeToString(b64url) {
  // Replace URL-safe chars
  let b64 = b64url.replace(/-/g, '+').replace(/_/g, '/');
  // Pad with '='
  while (b64.length % 4) b64 += '=';
  const bytes = Buffer.from(b64, 'base64');
  return bytes.toString('utf8');
}

function base64urlToUint8Array(b64url) {
  let b64 = b64url.replace(/-/g, '+').replace(/_/g, '/');
  while (b64.length % 4) b64 += '=';
  const binary = Buffer.from(b64, 'base64');
  return new Uint8Array(binary);
}

async function verifyHMAC256(token, secret) {
  if (!token) throw new Error('No token');
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('Invalid token format');
  const [headerB64, payloadB64, sigB64] = parts;
  const data = new TextEncoder().encode(`${headerB64}.${payloadB64}`);
  const sig = base64urlToUint8Array(sigB64);
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']);
  const valid = await crypto.subtle.verify('HMAC', key, sig, data);
  if (!valid) throw new Error('Invalid signature');
  const payloadJson = JSON.parse(base64urlDecodeToString(payloadB64));
  return payloadJson;
}

const locales = ['en', 'ar'];
const protectedRoutes = [
  { path: /^\/admin/, roles: ['admin'] },
  { path: /^\/doctor/, roles: ['doctor'] },
  { path: /^\/patient/, roles: ['patient'] },
];

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Exclude Next.js internals, static files, and public assets
  if (
    pathname.startsWith('/_next/') ||
    pathname.includes('.') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/robots') ||
    pathname.startsWith('/sitemap') ||
    pathname.startsWith('/icons/')
  ) {
    return NextResponse.next();
  }

  // Rewrite localized API requests like `/en/api/admin/...` -> `/api/admin/...`
  const localeApiMatch = pathname.match(/^\/[a-z]{2}\/api\/(admin|doctor|patient)(\/.*|$)/);
  if (localeApiMatch) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.replace(/^\/[a-z]{2}\/api/, '/api');
    return NextResponse.rewrite(url);
  }

  // Detect API route
  const isApi = pathname.startsWith('/api');

  // Handle API routes separately: normalize cleanPath by stripping '/api'
  // so '/api/admin/...' becomes '/admin/...', allowing the same RBAC checks below.
  if (isApi) {
    const cleanPath = pathname.replace(/^\/api/, '') || '/';
    // allow empty api root to continue
    // Proceed to protected route lookup using cleanPath
    // Prevent access to empty API root
    if (cleanPath === '/' ) return NextResponse.next();
    // Attach cleaned path to a local var used below via re-assignment
    request.nextUrl.pathname = pathname; // keep original
    // set variable in scope for later use
    var _cleanPath = cleanPath;
    // Only check protected routes (will look at _cleanPath)
    const routeApi = protectedRoutes.find(r => r.path.test(_cleanPath));
    if (!routeApi) return NextResponse.next();
    // extract token and run RBAC logic below using _cleanPath
    // (fall through to the main auth logic and use _cleanPath where needed)
  }

  // Locale-based routing for UI routes
  const segments = pathname.split('/');
  const locale = segments[1];
  if (!locales.includes(locale)) {
    // For UI routes, redirect to default locale
    return NextResponse.redirect(new URL(`/en${pathname}`, request.url));
  }

  // Remove locale for RBAC check
  const cleanSegments = segments.slice(2);
  const cleanPath = '/' + cleanSegments.join('/');

  // Prevent access to empty locale root (e.g. /ar)
  if (!isApi && (cleanSegments.length === 0 || cleanSegments[0] === '')) {
    return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
  }

  // Only check protected routes (use normalized path for API)
  const effectiveCleanPath = isApi ? _cleanPath : cleanPath;
  const route = protectedRoutes.find(r => r.path.test(effectiveCleanPath));
  if (!route) return NextResponse.next();

  // Get JWT from cookie
  const token = request.cookies.get('token')?.value;
  try {
    // Debug: log token presence for E2E troubleshooting
    console.log('[middleware] path=', pathname, 'cleanPath=', effectiveCleanPath, 'token=', Boolean(token));
  } catch (e) {}
  if (!token) {
    if (isApi) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    } else {
      return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
    }
  }
  // Check revoked tokens using shared helper when possible
  try {
    const { isTokenRevoked } = await import('./lib/auth/revocation.js');
    const revoked = await isTokenRevoked(token, request.url);
    if (revoked) {
      if (isApi) return NextResponse.json({ error: 'token_revoked' }, { status: 401 });
      return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
    }
  } catch (e) {
    // If helper isn't available (e.g. Edge runtime), decide fail-open vs fail-closed
    const isAdminRoute = route && route.roles && route.roles.includes('admin');
    if (e && e.code === 'FS_UNAVAILABLE') {
      if (isAdminRoute) {
        // For admin routes prefer fail-closed
        if (isApi) return NextResponse.json({ error: 'revocation_check_unavailable' }, { status: 401 });
        return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
      }
      // Non-admin: fallback to previous fetch-based check (best-effort)
      try {
        const checkUrl = new URL('/api/auth/is-revoked', request.url);
        const resp = await fetch(checkUrl.toString(), {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          cache: 'no-store',
        });
        if (resp && resp.ok) {
          const body = await resp.json();
          if (body?.revoked) {
            if (isApi) return NextResponse.json({ error: 'token_revoked' }, { status: 401 });
            return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
          }
        }
      } catch (e2) {
        console.warn('[middleware] fallback is-revoked check failed', e2 && e2.message);
      }
    } else {
      console.warn('[middleware] is-revoked check error', e && e.message);
    }
  }
  // Security: Lightweight gate for authentication. Distinguishes API vs UI routes.
  // API returns JSON 401/403, UI uses redirects. No inline RBAC.
  let user;
  try {
    user = await verifyHMAC256(token, SECRET);
      try {
      console.log('[middleware] jwt.verify success, role=', user?.role);
    } catch (e) {}
  } catch (err) {
    try { console.log('[middleware] jwt.verify error:', err && err.message); } catch (e) {}
    if (isApi) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    } else {
      return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
    }
  }

  if (!isApi) {
    if (!route.roles.includes(user.role)) {
      return NextResponse.redirect(new URL(`/${locale}/unauthorized`, request.url));
    }
    if (user.isActive === false || user.isDeleted === true) {
      return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
    }
  }
  if (isApi && !route.roles.includes(user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/:locale/admin/:path*',
    '/:locale/doctor/:path*',
    '/:locale/patient/:path*',
    '/admin/:path*',
    '/doctor/:path*',
    '/patient/:path*',
    '/api/admin/:path*',
    '/api/doctor/:path*',
    '/api/patient/:path*',
    '/:locale/api/admin/:path*',
    '/:locale/api/doctor/:path*',
    '/:locale/api/patient/:path*',
  ],
};
