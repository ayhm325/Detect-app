// Edge-safe helper: use internal API to check revocation when imported in Edge/middleware.
// Exports a single function `isTokenRevoked(token, baseUrl)` — baseUrl should be the request URL
// (e.g. `request.url`) to construct an absolute URL for the internal API call.
export async function isTokenRevoked(token, baseUrl) {
  if (!token) return false;
  if (!baseUrl) throw new Error("baseUrl required in Edge runtime");
  try {
    const url = new URL("/api/auth/is-revoked", baseUrl);
    const resp = await fetch(url.toString(), {
      method: "POST",
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });
    if (!resp.ok) return false;
    const body = await resp.json();
    return Boolean(body?.revoked);
  } catch (e) {
    const err = new Error("FS_UNAVAILABLE");
    err.code = "FS_UNAVAILABLE";
    throw err;
  }
}
