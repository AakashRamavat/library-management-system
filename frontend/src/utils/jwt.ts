/**
 * Decode JWT payload without verification (client-side expiry check only).
 * Returns payload or null if invalid.
 */
export function decodeJwtPayload(token: string): { exp?: number } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(base64);
    return JSON.parse(json) as { exp?: number };
  } catch {
    return null;
  }
}

/** True if token is expired or expires within bufferSeconds. */
export function isAccessTokenExpired(token: string, bufferSeconds = 60): boolean {
  const payload = decodeJwtPayload(token);
  if (!payload || payload.exp == null) return true;
  return payload.exp <= Math.floor(Date.now() / 1000) + bufferSeconds;
}
