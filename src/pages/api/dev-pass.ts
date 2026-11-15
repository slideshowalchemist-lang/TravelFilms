import type { APIRoute } from 'astro';
import { COOKIE_NAME, issuePassCookie } from '../../lib/access';

export const prerender = false;

// Local testing only: lets you see paid cards as a customer would.
// Returns 404 on the live site.
export const GET: APIRoute = ({ cookies, url, redirect }) => {
  if (!import.meta.env.DEV) return new Response(null, { status: 404 });
  if (url.searchParams.has('off')) cookies.delete(COOKIE_NAME, { path: '/' });
  else issuePassCookie(cookies, 'dev@localhost');
  return redirect(url.searchParams.get('next') ?? '/trip-pass');
};
