# Revocation helper — Hash-based storage

Summary
-------
The revocation helper now stores a SHA-256 `hash` of revoked tokens instead of the token text.

What changed
------------
- `lib/auth/revocation.server.js` computes `hash = SHA256(token)` and stores `{ hash, revokedAt, exp }`.
- The public API remains the same: `addRevokedToken(token, exp)` and `isTokenRevoked(token)`.

Migration behavior
-----------------
- Existing file entries that used to store `{ token, ... }` are supported: the helper maps them to `hash` when reading the file.
- No manual migration script required for the existing JSON store — conversion is performed at read-time.

Environment / configuration
---------------------------
- Default file path: `data/revokedTokens.json` (same as before).
- You can override the path with `REVOKED_TOKENS_PATH` env var.

Why hash?
----------
- Prevents storing tokens in plaintext.
- Even if the revocation store leaks, the full token is not directly exposed.

Production notes — Redis recommendation
-------------------------------------
When moving to Redis (recommended for production / multi-instance setups):

1. Store the token `hash` as the Redis key (or in a set), not the token itself.
2. Use TTL on revoked entries (if applicable) to let them expire automatically.
3. Keep the helper API identical so switching storage is a drop-in change.

Example Redis pseudocode (server-side):

```js
// ioredis example (pseudo)
import Redis from 'ioredis';
const redis = new Redis(process.env.REDIS_URL);

export async function isTokenRevoked(token) {
  const h = sha256(token);
  return Boolean(await redis.get(`revoked:${h}`));
}

export async function addRevokedToken(token, exp=null) {
  const h = sha256(token);
  if (exp) {
    const ttl = Math.max(1, Math.floor(exp * 1000 - Date.now()));
    await redis.set(`revoked:${h}`, '1', 'PX', ttl);
  } else {
    await redis.set(`revoked:${h}`, '1');
  }
}
```

Tests
-----
- Unit tests already cover `isTokenRevoked` and `addRevokedToken` behavior.

Security notes
--------------
- SHA-256 is used as a one-way identifier. If you need extra protection, compute an HMAC
  with a server-only secret before storing (HMAC-SHA256), e.g. `HMAC(secret, token)`.

Contact
-------
If you want, I can:
- add a short migration-check script to proactively convert the JSON file,
- implement the Redis-backed helper now (drop-in replacement), or
- add CI checks that validate the data format on PRs.
