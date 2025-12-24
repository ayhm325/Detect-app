
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'your-secret-key';

// RBAC: تحديد المسارات المحمية حسب الدور
const protectedRoutes = [
  { path: /^\/admin/, roles: ['admin'] },
  { path: /^\/doctor/, roles: ['doctor'] },
  { path: /^\/patient/, roles: ['patient'] },
];

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Ignore API and static files
  if (pathname.startsWith('/_next/') || pathname.includes('.')) {
    return NextResponse.next();
  }

  // إعادة توجيه للغة الافتراضية إذا لم تكن موجودة
  const segments = pathname.split('/');
  const locale = segments[1]; // /en/... أو /ar/...
  if (!['en', 'ar'].includes(locale)) {
    return NextResponse.redirect(new URL(`/en${pathname}`, request.url));
  }

  // تحقق هل المسار محمي
  const route = protectedRoutes.find(r => r.path.test(pathname));
  if (!route) return NextResponse.next();

  // جلب التوكن من الكوكي
  const token = request.cookies.get('token')?.value;
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  try {
    const user = jwt.verify(token, SECRET);
    // تحقق من الدور
    if (!route.roles.includes(user.role)) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    // تحقق من حالة الحساب (لو أضفتها في الـ JWT)
    if (user.isActive === false || user.isDeleted === true) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  } catch (err) {
    // انتهاء صلاحية التوكن أو خطأ آخر
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: ['/admin/:path*', '/doctor/:path*', '/patient/:path*'],
};
