/* ═══════════════════════════════════════════════════════════════
   OmicsLab — Stripe Checkout Session API Route
   POST /api/create-checkout
   Body: { priceId, userId, email, successUrl, cancelUrl }
   Returns: { url } — redirect to Stripe Checkout
   ═══════════════════════════════════════════════════════════════ */

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const APP_URL           = process.env.NEXT_PUBLIC_APP_URL || 'https://omicslab.africa';

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

  const {
    priceId,
    userId,
    email,
    successUrl = `${APP_URL}/?payment=success`,
    cancelUrl  = `${APP_URL}/?payment=cancelled`,
  } = req.body || {};

  if (!priceId) return res.status(400).json({ error: 'Missing priceId' });

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
