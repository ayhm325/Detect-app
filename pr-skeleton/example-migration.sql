-- Example migration: add clientKey column (nullable) to Message
-- Run via Prisma migration or apply cautiously in environments

ALTER TABLE "Message" ADD COLUMN IF NOT EXISTS "clientKey" text;

-- Optional unique index (requires ensuring no duplicates/backfill)
-- CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS message_clientkey_unique ON "Message" ("chatId", "clientKey") WHERE ("clientKey" IS NOT NULL);
