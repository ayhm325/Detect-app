-- Migration: add partial unique index for Message(chatId, clientKey)
-- This creates a unique index on (chatId, clientKey) for non-null clientKey values.
-- Run on staging first. Executing CONCURRENTLY to avoid locking writes.

CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_message_chat_clientkey_unique
ON "Message" ("chatId", "clientKey")
WHERE "clientKey" IS NOT NULL;
