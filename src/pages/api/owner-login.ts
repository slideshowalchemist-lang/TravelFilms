import type { APIRoute } from 'astro';
import { issueOwnerCookie, ownerPasswordMatches } from '../../lib/access';

export const prerender = false;

// Only ever send people back into the trip pass, never to another site.
const safeNext = (n: FormDataEntryValue | null) =>
  typeof n === 'string' && /^\/trip-pass(\/|\?|$)/.test(n) && !n.startsWith('//') ? n : '/trip-pass';

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const form = await request.formData();
  const next = safeNext(form.get('next'));
  const password = String(form.get('password') ?? '');
  const ok = ownerPasswordMatches(password);

  if (ok === null) return redirect(`/trip-pass/sign-in?error=setup&next=${encodeURIComponent(next)}`, 303);
  if (!ok) {
    await new Promise((r) => setTimeout(r, 800)); // slows down guessing
    return redirect(`/trip-pass/sign-in?error=1&next=${encodeURIComponent(next)}`, 303);
  }
  issueOwnerCookie(cookies);
  return redirect(next, 303);
};
