# PR Skeleton: Add `clientKey` for message deduplication

This branch is a skeleton to prepare and review the planned changes for adding `clientKey` to `Message`.

Checklist
- [ ] Add `clientKey` to Prisma schema (nullable)
- [ ] Create and run migration in a dev environment (do not run on prod without backup)
- [ ] Update socket server `message` handler to use `clientKey` for idempotency
- [ ] Update HTTP fallback `/api/chat/:id/messages` to accept `clientKey`
- [ ] Update client optimistic send logic to include `clientKey`
- [ ] Update tests: Jest unit tests + e2e socket test
- [ ] Add upgrade notes and backfill plan if adding unique constraint

Files in this PR skeleton:
- `docs/clientKey-plan.md` (design and plan)
- `pr-skeleton/example-migration.sql` (example SQL)
- `pr-skeleton/clientKey-mocks.js` (test helper)

## Local testing & commands (suggested)

# dry run to find potential duplicates and produce a report
node scripts/find-clientkey-duplicates.mjs --dry-run --out=reports/clientkey-duplicates.json

# run e2e that simulates duplicate sends (increase retries to stress test)
node scripts/e2e-socket-test.mjs --chatId=<chatId> --doctorEmail=doc@example.com --patientEmail=pat@example.com --retries=2

# run unit tests
npm test

# run migration in dev (prisma)
npx prisma migrate dev --name add-clientKey --create-only

# create index in Postgres (concurrent, safe for production):
-- CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS message_clientkey_unique
--   ON "Message" ("chatId", "clientKey")
--   WHERE ("clientKey" IS NOT NULL);

## Backfill approach (quick)
1. Run dry-run and inspect `reports/clientkey-duplicates.json`.
2. Decide whether to leave historical rows NULL or generate stable `clientKey` for backfill.
3. After backfill, create the partial unique index and validate.

