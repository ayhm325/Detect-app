Manual QA for middleware and admin layout

1) Incognito test (UI):
   - Open a new Incognito/Private window.
   - Visit: /en/admin/users
   - Expected: Redirected to /en/login (no access without token).

2) Wrong role test (UI):
   - Set a cookie named `token` containing a JWT with role `patient`.
   - Visit: /en/admin/users
   - Expected: Redirect to /en/unauthorized.

3) Correct role test (UI):
   - Set a cookie named `token` containing a JWT with role `admin`.
   - Visit: /en/admin/users
   - Expected: Page loads and shows admin sidebar (no flashing protected UI).

4) API test (via curl or Postman):
   - Call an API under /api/admin/... without token
   - Expected: JSON 401 Unauthorized
   - Call with token but wrong role
   - Expected: JSON 403 Forbidden

Notes:
- Middleware enforces RBAC and locale-aware redirects.
- `app/[locale]/admin/layout.js` is UX-only (wraps AdminLayout + AuthGuard). Do not rely on it for security.
