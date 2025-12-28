# Plan: Add `clientKey` for message deduplication

This document outlines a staged implementation plan and PR skeleton for adding a `clientKey` field to messages to improve deduplication and idempotency in chat flows.

Goals
- Ensure client-originated optimistic messages are not duplicated when the server emits the persisted message back to the room.
- Provide a server-side idempotency key that allows the server to ignore duplicate writes.

Scope (high level)
1. Database: add `clientKey` column to `Message` model (nullable, unique index optional).
2. Server/API/Socket: accept and persist `clientKey` when provided; on message create, if a message with same `clientKey` exists for the chat, return the existing message instead of creating a duplicate.
3. Client: generate a `clientKey` per optimistic message send and include it in the socket `message` payload and HTTP fallback POST.
4. Tests: add unit tests and E2E case that simulate duplicate sends and verify a single DB row + single socket emission.

Phased implementation (recommended)

- Phase 1: PR skeleton + docs (this branch)
  - Add docs and example migration SQL
  - Add test plan and example client mocks

- Phase 2: Schema change (non-destructive)
  - Add `clientKey String?` to Prisma schema for `Message` and run migration (adds column nullable)
  - Add unique index `@@unique([chatId, clientKey])` if you want DB-level dedupe (optional; migration will fail if duplicates exist)

Prisma snippet example (for review):

```prisma
model Message {
  id        String   @id @default(cuid())
  chatId    String
  senderId  String
  text      String
  createdAt DateTime @default(now())
  clientKey String?  // nullable client-provided idempotency key

  @@index([chatId])
  // Consider adding this only after backfill: @@unique([chatId, clientKey])
}
```

- Phase 3: Server + socket changes
  - Update socket `message` handler to check existing message by `chatId`+`clientKey` before creating
  - When ack-ing, return the existing message if found
  - Update HTTP POST fallback to accept `clientKey`

- Phase 4: Client changes + tests
  - Generate `clientKey` on optimistic send (e.g. `tmp-${Date.now()}-${random}` or `uuidv4()`)
  - Include the `clientKey` in socket emit and HTTP POST body
  - Update client dedupe to prefer server id or `clientKey` matching
  - Add Jest unit tests and enhance `scripts/e2e-socket-test.mjs` to assert single DB row

Migration considerations
- Dry-run: scan existing messages for duplicates or existing `clientKey` collisions.
- If adding a unique index, ensure existing rows either have `NULL` or unique `clientKey`s; you may need to backfill `clientKey` for historical messages or keep column nullable.

Backfill & validation example (high level):
- Run a dry-run script that searches for potential duplicates by `(chatId, text, createdAt window)` and outputs a report `reports/clientkey-duplicates-<ts>.json`.
- Decide on backfill strategy: either leave historical rows `NULL` or generate stable `clientKey` values for sets of messages you consider unique.
- After backfill, create a partial unique index (see `pr-skeleton/example-migration-updated.sql`) and validate.

Risks and mitigations
- Risk: race conditions if two clients send the same `clientKey` (client-side generation should be globally unique). Mitigation: make clientKey sufficiently random/unique (UUIDv4 or sha256 of timestamp+client id).
- Risk: adding unique DB constraint may fail if duplicates already exist. Mitigation: perform backfill/cleanup and/or add constraint with `NOT VALID` (Postgres) and validate after.

Files to include in PR skeleton
- `pr-skeleton/README.md` — short description and checklist
- `pr-skeleton/example-migration.sql` — suggested SQL for adding column and index (no automatic run)
- `docs/clientKey-plan.md` — this file (detailed plan)
- `tests/mocks/clientKey.mock.js` — example clientKey generator for tests

Estimated effort
- Schema + migration + server changes: 1-2 days (depending on review and production migration safety)
- Client + tests: 1 day

Next steps (if you approve)
1. Create branch `feature/clientkey-skeleton` (done by this PR skeleton task)
2. Implement Phase 2-4 as separate PRs, each with unit tests and a migration plan
