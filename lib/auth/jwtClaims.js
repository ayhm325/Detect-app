export function getJwtIssuer() {
  const v = process.env.JWT_ISSUER;
  const issuer = typeof v === "string" ? v.trim() : "";
  return issuer || undefined;
}

export function getJwtAudience() {
  const v = process.env.JWT_AUDIENCE;
  const audience = typeof v === "string" ? v.trim() : "";
  return audience || undefined;
}

export function getJwtVerifyOptions() {
  const issuer = getJwtIssuer();
  const audience = getJwtAudience();
  const opts = {};
  if (issuer) opts.issuer = issuer;
  if (audience) opts.audience = audience;
  return opts;
}

export function applyJwtClaimsToSignOptions(options) {
  const issuer = getJwtIssuer();
  const audience = getJwtAudience();
  if (issuer) options.issuer = issuer;
  if (audience) options.audience = audience;
  return options;
}
