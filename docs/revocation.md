# Revocation Design and Migration

This document describes the token revocation design, migration steps, tests, and related socket fixes included in the recent changes.

## Overview

- Tokens are no longer relied on purely client-side for logout: a server-side revocation store ensures logged-out tokens are rejected.
- Revoked tokens are recorded as SHA-256(hex) hashes for improved security (no raw tokens stored).
- Production store: Redis (key: `revoked:<hash>` with TTL derived from token `exp`).
- Development fallback: `data/revokedTokens.json` (file-based) when `REDIS_URL` is not configured.

## Files added / modified

- `lib/auth/revocation.server.js` — server-only helper; computes SHA-256 and writes fallback file or delegates to Redis.
- `lib/auth/revocation.redis.js` — ioredis helper for production use.
- `lib/auth/revocation.js` — Edge-safe helper used by `middleware` (calls internal API).
- `app/api/auth/logout/route.js` — POST route to revoke current token server-side.
- `app/api/auth/is-revoked/route.js` — POST route used by Edge helpers to check revocation.
- `app/api/auth/whoami/route.js` — updated to check revocation before returning identity.
- `middleware.js` — updated to call Edge-safe revocation helper and reject revoked tokens for protected routes.
- `scripts/migrate-revoked-to-redis.mjs` — migration script with `--dry-run` and `--confirm` to move file entries to Redis (creates backup).
- `scripts/check-revoked-redis.mjs` — quick verification of `revoked:*` keys and PTTL in Redis.
- `__tests__/revocation.test.js` — Jest tests validating `whoami` rejects revoked tokens.
- `app/components/chat/useSocket.client.js` and `app/[locale]/patient/chat/page.js` — socket dedupe and optimistic-send fixes to avoid duplicate messages.

## Local setup & running

1. Ensure local Redis is available and set `REDIS_URL` to point to it if you want Redis support.
2. If `REDIS_URL` is unset, the server will use `data/revokedTokens.json` as a fallback.

Running the migration (dry-run):

```bash
node scripts/migrate-revoked-to-redis.mjs --dry-run
```

To perform migration (after reviewing dry-run):

```bash
REDIS_URL=redis://localhost:6379 node scripts/migrate-revoked-to-redis.mjs --confirm
```

## Tests

- Unit tests (Jest): `npm test` — includes `__tests__/revocation.test.js` verifying revoked tokens are rejected.
- E2E socket test: `node scripts/e2e-socket-test.mjs <chatId> <doctorEmail> <patientEmail>` — simulates doctor+patient and validates single message emission and DB persistence.

## Socket/Chat fixes

- `useSocket.client.js` now returns a stable API (memoized) and uses global, reference-counted socket instance to avoid multiple connections during HMR.
- Client-side dedupe added in chat page handlers to avoid duplicate messages from optimistic updates + socket emits (checks `id`, `clientKey`, and text/time similarity).

## Security notes

- Stored revoked token identifiers are SHA-256 hashes; the system never stores raw tokens in production Redis.
- TTLs for revoked keys match token expiration to avoid indefinite growth.

## Next steps / optional improvements

- Consider adding a `clientKey` column on `Message` model and write it on optimistic sends to support server-side idempotency and stronger dedupe guarantees (requires DB migration and server change to respect `clientKey`).
- Monitor Redis keys and set up retention/monitoring in production.

## Contact / references

For implementation details see files listed above and `lib/auth/README.md` for helper usage.
