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

// ---------------------------------------------------------------------------
// Owner preview: while the trip pass is "coming soon" (TRIP_PASS_OPEN = false),
// every /trip-pass page is locked to the owners. Sign in at /trip-pass/sign-in
// with OWNER_PASSWORD (a Netlify environment variable). The cookie lasts 30 days.

export const OWNER_COOKIE = 'ebyg_owner';
const OWNER_DAYS = 30;

const signOwner = (payload: string) => sign(`owner:${payload}`);

/** null when OWNER_PASSWORD or ACCESS_SECRET isn't set, so the lock stays shut. */
export function ownerPasswordMatches(given: string): boolean | null {
  const real = import.meta.env.OWNER_PASSWORD ?? process.env.OWNER_PASSWORD ?? (import.meta.env.DEV ? 'dev' : undefined);
  try {
    secret();
  } catch {
    return null;
  }
  if (!real) return null;
  const a = createHmac('sha256', 'cmp').update(given).digest();
  const b = createHmac('sha256', 'cmp').update(real).digest();
  return timingSafeEqual(a, b);
}

export function issueOwnerCookie(cookies: CookieJar) {
  const expires = new Date(Date.now() + OWNER_DAYS * 86_400_000);
  const payload = Buffer.from(`owner|${expires.getTime()}`).toString('base64url');
  cookies.set(OWNER_COOKIE, `${payload}.${signOwner(payload)}`, {
    path: '/',
    httpOnly: true,
    secure: !import.meta.env.DEV,
    sameSite: 'lax',
    expires,
  });
}

export function verifyOwnerToken(token: string | undefined): boolean {
  if (!token) return false;
  try {
    const [payload, sig] = token.split('.');
    if (!payload || !sig) return false;
    const expected = Buffer.from(signOwner(payload));
    const given = Buffer.from(sig);
    if (expected.length !== given.length || !timingSafeEqual(expected, given)) return false;
    const [who, expiry] = Buffer.from(payload, 'base64url').toString().split('|');
    return who === 'owner' && Number(expiry) > Date.now();
  } catch {
    return false; // ACCESS_SECRET missing: treat as signed out
  }
}
