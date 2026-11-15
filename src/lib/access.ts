import { createHmac, timingSafeEqual } from 'node:crypto';

// The trip pass is a signed cookie: "<customer>|<expiry-ms>.<signature>".
// Nothing is stored anywhere — the signature proves we issued it, the expiry ends it.
// The payment provider's "purchase complete" step (see README) calls issuePassCookie().

export const COOKIE_NAME = 'tc_pass';
export const PASS_DAYS = 365;

function secret(): string {
  const s = import.meta.env.ACCESS_SECRET ?? process.env.ACCESS_SECRET;
  if (s) return s;
  if (import.meta.env.DEV) return 'dev-only-secret';
  throw new Error('ACCESS_SECRET is not set');
}

const sign = (payload: string) => createHmac('sha256', secret()).update(payload).digest('base64url');

export function createPassToken(customer: string, days = PASS_DAYS): { token: string; expires: Date } {
  const expires = new Date(Date.now() + days * 86_400_000);
  const payload = Buffer.from(`${customer}|${expires.getTime()}`).toString('base64url');
  return { token: `${payload}.${sign(payload)}`, expires };
}

export function verifyPassToken(token: string | undefined): boolean {
  if (!token) return false;
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return false;
  const expected = Buffer.from(sign(payload));
  const given = Buffer.from(sig);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return false;
  const [, expiry] = Buffer.from(payload, 'base64url').toString().split('|');
  return Number(expiry) > Date.now();
}

type CookieJar = { set: (name: string, value: string, opts: Record<string, unknown>) => void };

export function issuePassCookie(cookies: CookieJar, customer: string) {
  const { token, expires } = createPassToken(customer);
  cookies.set(COOKIE_NAME, token, {
    path: '/',
    httpOnly: true,
    secure: !import.meta.env.DEV,
    sameSite: 'lax',
    expires,
  });
}
