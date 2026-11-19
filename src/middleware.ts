import { defineMiddleware } from 'astro:middleware';
import { COOKIE_NAME, OWNER_COOKIE, verifyOwnerToken, verifyPassToken } from './lib/access';
import { TRIP_PASS_OPEN } from './data/tripPassStatus';

const isTripPassPath = (p: string) => p === '/trip-pass' || p.startsWith('/trip-pass/');

export const onRequest = defineMiddleware(async (context, next) => {
  const path = context.url.pathname.replace(/\/$/, '') || '/';

  // Static pages are built ahead of time and have no visitor, so they're always "no access".
  let isOwner = false;
  let hasPass = false;
  if (!context.isPrerendered) {
    isOwner = verifyOwnerToken(context.cookies.get(OWNER_COOKIE)?.value);
    try {
      hasPass = verifyPassToken(context.cookies.get(COOKIE_NAME)?.value);
    } catch {
      hasPass = false;
    }
  }
  context.locals.isOwner = isOwner;
  context.locals.hasAccess = isOwner || hasPass;

  const tripPass = isTripPassPath(path);
  const locked = tripPass && !TRIP_PASS_OPEN;

  // While the trip pass is "coming soon", only the owners can open it.
  if (locked && !isOwner && path !== '/trip-pass/sign-in') {
    const nextUrl = encodeURIComponent(context.url.pathname + context.url.search);
    return context.redirect(`/trip-pass/sign-in?next=${nextUrl}`, 302);
  }

  const response = await next();

  if (locked) {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
    response.headers.set('Cache-Control', 'private, no-store');
  }

  // Notes you leave in cards as <!-- comments --> are for you only:
  // strip them so they never reach a visitor's browser.
  if (!context.isPrerendered && path.startsWith('/trip-pass/sites/') &&
      response.headers.get('content-type')?.includes('text/html')) {
    const html = (await response.text()).replace(/<!--[\s\S]*?-->/g, '');
    return new Response(html, { status: response.status, headers: response.headers });
  }
  return response;
});
