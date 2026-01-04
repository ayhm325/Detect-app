const DEV_FALLBACK = 'dev-only-insecure-secret-change-me';

export function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  const isProd = process.env.NODE_ENV === 'production';

  if (secret && String(secret).length >= 32) return secret;

  if (isProd) {
    throw new Error('JWT_SECRET is required in production and must be at least 32 characters.');
  }

  // Dev/test convenience: allow short/empty secret but never in production.
  return secret || DEV_FALLBACK;
}
