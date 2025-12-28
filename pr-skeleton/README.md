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
