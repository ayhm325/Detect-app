const isProd = process.env.NODE_ENV === 'production';

function fail(message) {
  console.error(`ENV CHECK FAILED: ${message}`);
  process.exit(1);
}

function requireVar(name, { minLen } = {}) {
  const v = process.env[name];
  if (!v) fail(`${name} is required`);
  if (minLen && String(v).length < minLen) fail(`${name} must be at least ${minLen} characters`);
  return v;
}

if (isProd) {
  requireVar('JWT_SECRET', { minLen: 32 });
  requireVar('DATABASE_URL');
  // Recommended (not required): REDIS_URL for token revocation in production.
  if (!process.env.REDIS_URL) {
    console.warn('ENV CHECK WARNING: REDIS_URL is not set; revocation will fallback to file store.');
  }
}

process.exit(0);
