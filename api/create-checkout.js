/* ═══════════════════════════════════════════════════════════════
   OmicsLab — Stripe Checkout Session API Route
   POST /api/create-checkout   (requires Authorization: Bearer <clerk-jwt>)
   Body: { priceId, email, successUrl, cancelUrl }
   Returns: { url } — redirect to Stripe Checkout
   ═══════════════════════════════════════════════════════════════ */
import { requireAuth, AuthError } from '../lib/clerk-auth.js';
import { supabaseServiceRequest } from '../lib/supabase-admin.js';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const APP_URL           = process.env.NEXT_PUBLIC_APP_URL || 'https://omicslab.africa';

/* subscriptions/users rows are keyed by the Supabase users.id (uuid),
   not the Clerk user id — resolve the verified caller to that row so
   Stripe metadata carries the identifier stripe-webhook.js actually
   filters on. */
async function resolveSupabaseUserId(clerkId) {
  const res = await supabaseServiceRequest(`users?clerk_id=eq.${encodeURIComponent(clerkId)}&select=id`, 'GET');
  if (!res) return null; /* Supabase not configured */
  const rows = await res.json();
  return rows?.[0]?.id || null;
}

/* Only ever redirect back into this app — a client-supplied
   successUrl/cancelUrl otherwise lets anyone turn a real Stripe
   checkout into an open redirect. */
function sameOrigin(url) {
  if (typeof url !== 'string' || !url) return false;
  try { return new URL(url, APP_URL).origin === new URL(APP_URL).origin; } catch { return false; }
}

async function stripeRequest(path, body) {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(body)) {
    if (Array.isArray(v)) {
      v.forEach((item, i) => {
        if (typeof item === 'object') {
          Object.entries(item).forEach(([ik, iv]) => params.append(`${k}[${i}][${ik}]`, iv));
        } else {
          params.append(`${k}[${i}]`, item);
        }
      });
    } else if (typeof v === 'object' && v !== null) {
      Object.entries(v).forEach(([sk, sv]) => params.append(`${k}[${sk}]`, sv));
    } else {
      params.append(k, v);
    }
  }

  const res = await fetch(`https://api.stripe.com/v1/${path}`, {
    method:  'POST',
    headers: {
      'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
      'Content-Type':  'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });
  return res.json();
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!STRIPE_SECRET_KEY)    return res.status(503).json({ error: 'Payments not configured' });

  let auth;
  try {
    auth = await requireAuth(req);
  } catch (err) {
    if (err instanceof AuthError) return res.status(err.status).json({ error: err.message });
    throw err;
  }

  const userId = await resolveSupabaseUserId(auth.clerkId).catch(() => null);
  if (!userId) return res.status(404).json({ error: 'No account found for this session' });

  const {
    priceId,
    email,
    successUrl: rawSuccessUrl,
    cancelUrl:  rawCancelUrl,
  } = req.body || {};

  if (!priceId) return res.status(400).json({ error: 'Missing priceId' });

  const successUrl = sameOrigin(rawSuccessUrl) ? rawSuccessUrl : `${APP_URL}/?payment=success`;
  const cancelUrl  = sameOrigin(rawCancelUrl)  ? rawCancelUrl  : `${APP_URL}/?payment=cancelled`;

  try {
    const session = await stripeRequest('checkout/sessions', {
      mode:               'subscription',
      'line_items[0][price]':    priceId,
      'line_items[0][quantity]': '1',
      success_url:        `${successUrl}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:         cancelUrl,
      'customer_email':   email || '',
      'metadata[userId]': userId || '',
      'subscription_data[metadata][userId]': userId || '',
      'allow_promotion_codes': 'true',
      'billing_address_collection': 'auto',
    });

    if (session.error) return res.status(400).json({ error: session.error.message });

    return res.status(200).json({ url: session.url, sessionId: session.id });
  } catch (err) {
    console.error('[create-checkout]', err);
    return res.status(500).json({ error: 'Failed to create checkout session' });
  }
}
