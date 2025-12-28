-- Example migration: add clientKey column (nullable) to Message
-- Run via Prisma migration or apply cautiously in environments

ALTER TABLE "Message" ADD COLUMN IF NOT EXISTS "clientKey" text;

-- Recommended: create a partial unique index to avoid NULL collision
-- This index enforces uniqueness only for non-null clientKey values.
-- Use CONCURRENTLY in production to avoid long locks (Postgres):
-- CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS message_clientkey_unique
--   ON "Message" ("chatId", "clientKey")
--   WHERE ("clientKey" IS NOT NULL);

-- Rollback (if needed):
-- DROP INDEX IF EXISTS message_clientkey_unique;
-- ALTER TABLE "Message" DROP COLUMN IF EXISTS "clientKey";

-- Notes:
-- 1) Run a dry-run/backfill script before creating the index to ensure no duplicates.
-- 2) If you need to create the index in a single step safely, consider:
--    - Create the index CONCURRENTLY
--    - Validate or attach a constraint after verification
-- 3) If duplicates exist, generate a report and backfill or cleanup before applying the unique index.
