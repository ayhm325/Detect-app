clientKey (idempotency key)

Purpose
-------
`clientKey` is a client-generated idempotency key attached to chat message creation requests. It prevents duplicate messages when network retries or optimistic UI cause the client to send the same message multiple times.

Contract
--------
- Field: `clientKey` (string) — optional on the database level, but **clients should always send a unique `clientKey` for each logical message**.
- Server behavior:
  - If `clientKey` is provided, the server first searches for an existing message with the same `(chatId, clientKey)` and returns it (200 + `{ existing: true }`).
  - If not found, the server creates a new message and returns it (201).
- Do NOT reuse the same `clientKey` for different messages. Reuse is only allowed when the client intentionally re-sends the exact same logical message.

Example (HTTP POST)
--------------------
POST /api/chat/messages

Body:
```
{ "chatId": "abc123", "text": "Hello", "clientKey": "temp-uuid-01" }
```

Responses:
- Existing message found:
```
200 { "message": { ... }, "existing": true }
```
- Created:
```
201 { "message": { ... } }
```

Notes
-----
- The server also enforces a partial unique index on `(chatId, clientKey)` for non-null `clientKey`s in production to provide DB-level guarantees. Because historical rows may have `clientKey = NULL`, the index is partial (WHERE clientKey IS NOT NULL).
- Rollout recommendation: have clients start sending `clientKey` before enabling strict DB uniqueness enforcement.

See also: `scripts/backfill-clientKey.mjs`, `scripts/create-clientkey-unique-index.mjs`.
