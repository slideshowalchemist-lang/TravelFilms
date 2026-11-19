import type { APIRoute } from 'astro';
import { OWNER_COOKIE } from '../../lib/access';

export const prerender = false;

export const POST: APIRoute = ({ cookies, redirect }) => {
  cookies.delete(OWNER_COOKIE, { path: '/' });
  return redirect('/', 303);
};
