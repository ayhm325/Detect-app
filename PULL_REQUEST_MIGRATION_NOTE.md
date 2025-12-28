## Redis Migration Summary

- Migration script `scripts/migrate-revoked-to-redis.mjs` used to move revoked tokens from `revokedTokens.json` to Redis.
- Backup created: `revokedTokens.json.<timestamp>.bak`
- Migration completed successfully:
  - Total entries migrated: 1
  - Redis keys set with TTL derived from token `exp` field
- Script safety features:
  - `--dry-run / -n` for previewing keys and TTLs without writing
  - `--confirm / -y` required to perform actual writes
  - `--file=path` to use a custom JSON file
- After verification, JSON file can be deleted or archived; server helper will fallback to file if `REDIS_URL` is not set.
- Recommended post-migration check:
  ```bash
  redis-cli keys "revoked:*"
  redis-cli pttl revoked:<hash>
  ```

---

*Notes:*
- A backup of `data/revokedTokens.json` was created alongside the migration.
- The migration script supports `--dry-run` to preview writes and `--confirm` to perform them.
