export interface JwtClaims {
  sub: string;
  username: string;
  type: string;
  exp?: number;
}

/**
 * Decodes the payload segment of a JWT without verifying the signature.
 * SSR-safe: returns null when `atob` is unavailable (non-browser environment).
 */
export function decodeJwt(token: string): JwtClaims | null {
  if (typeof atob === 'undefined') {
    return null;
  }

  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    // Base64url → Base64
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(base64);
    const payload = JSON.parse(json) as Record<string, unknown>;

    if (!payload['sub'] || !payload['username'] || !payload['type']) {
      return null;
    }

    return {
      sub: payload['sub'] as string,
      username: payload['username'] as string,
      type: payload['type'] as string,
      exp: payload['exp'] as number | undefined,
    };
  } catch {
    return null;
  }
}
