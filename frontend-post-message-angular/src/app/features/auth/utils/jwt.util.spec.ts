import { decodeJwt } from './jwt.util';

function buildJwt(payload: object): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload));
  return `${header}.${body}.signature`;
}

describe('decodeJwt', () => {
  it('returns correct claims for a valid JWT', () => {
    const token = buildJwt({ sub: 'u1', username: 'alice', type: 'user', exp: 9999999999 });
    const claims = decodeJwt(token);
    expect(claims).not.toBeNull();
    expect(claims!.sub).toBe('u1');
    expect(claims!.username).toBe('alice');
    expect(claims!.type).toBe('user');
  });

  it('returns null for malformed base64 (not a valid JWT)', () => {
    const result = decodeJwt('not.a.jwt!!!');
    expect(result).toBeNull();
  });

  it('returns null when username claim is missing', () => {
    const token = buildJwt({ sub: 'u1', type: 'user' });
    const result = decodeJwt(token);
    expect(result).toBeNull();
  });

  it('returns null when sub claim is missing', () => {
    const token = buildJwt({ username: 'alice', type: 'user' });
    const result = decodeJwt(token);
    expect(result).toBeNull();
  });
});
