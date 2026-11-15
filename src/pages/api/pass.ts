import type { APIRoute } from 'astro';
import { issuePassCookie } from '../../lib/access';

export const prerender = false;

// After a successful purchase, the payment provider sends the buyer here, e.g.
//   /api/pass?checkout_id=XXXX&next=/sites/ramesseum
//
// TODO (payments): this is the ONE place payments plug in. Before issuing the
// pass, confirm with the provider's API (server-side, using a secret key stored
// in Netlify env vars) that this checkout really was paid. Never trust the
// query string on its own. See README, "Connecting payments".
export const GET: APIRoute = async ({ url, cookies, redirect }) => {
  const checkoutId = url.searchParams.get('checkout_id');
  if (!checkoutId) return new Response('Missing checkout_id', { status: 400 });

  const verifiedCustomerEmail: string | null = null; // = await verifyCheckout(checkoutId)
  if (!verifiedCustomerEmail) {
    return new Response('Payments are not connected yet.', { status: 501 });
  }

  issuePassCookie(cookies, verifiedCustomerEmail);
  return redirect(url.searchParams.get('next') ?? '/trip-pass');
};
