import { defineMiddleware } from 'astro:middleware';
import { COOKIE_NAME, verifyPassToken } from './lib/access';

export const onRequest = defineMiddleware(async (context, next) => {
  // Static pages are built ahead of time and have no visitor, so they're always "no access".
  context.locals.hasAccess = context.isPrerendered
    ? false
    : verifyPassToken(context.cookies.get(COOKIE_NAME)?.value);

  const response = await next();

  // Notes you leave in cards as <!-- comments --> are for you only:
  // strip them so they never reach a visitor's browser.
  if (!context.isPrerendered && context.url.pathname.startsWith('/trip-pass/sites/') &&
      response.headers.get('content-type')?.includes('text/html')) {
    const html = (await response.text()).replace(/<!--[\s\S]*?-->/g, '');
    return new Response(html, { status: response.status, headers: response.headers });
  }
  return response;
});
