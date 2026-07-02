/* ═══════════════════════════════════════════════════════════════
   OmicsLab — Stripe Webhook Handler
   POST /api/stripe-webhook
   Handles: checkout.session.completed, customer.subscription.updated,
            customer.subscription.deleted, invoice.payment_failed
   ═══════════════════════════════════════════════════════════════ */

const STRIPE_SECRET_KEY     = process.env.STRIPE_SECRET_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
const SUPABASE_URL          = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY;

/* Minimal Stripe signature verification (no SDK needed) */
async function verifyStripeSignature(payload, sigHeader, secret) {
  const [, ts] = sigHeader.match(/t=(\d+)/) || [];
  const [, v1] = sigHeader.match(/v1=([a-f0-9]+)/) || [];
  if (!ts || !v1) throw new Error('Invalid signature header');

  const signed = `${ts}.${payload}`;

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(signed));
  const hex = Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');

  if (hex !== v1) throw new Error('Signature mismatch');

  /* Reject if older than 5 minutes */
  if (Math.abs(Date.now() / 1000 - parseInt(ts)) > 300) throw new Error('Timestamp too old');
}

/* Supabase service-role request (bypasses RLS) */
async function supabaseServiceRequest(path, method, body) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) return null;
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method,
    headers: {
      'apikey':        SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Content-Type':  'application/json',
      'Prefer':        'return=minimal',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return res;
}

function planFromPriceId(priceId) {
  const campusId     = process.env.STRIPE_PRICE_CAMPUS;
  const enterpriseId = process.env.STRIPE_PRICE_ENTERPRISE;
  if (priceId === campusId)     return 'campus';
  if (priceId === enterpriseId) return 'enterprise';
  return 'campus'; /* default for unknown price */
}

async function handleCheckoutCompleted(event) {
  const session = event.data.object;
  const userId  = session.metadata?.userId;
  const subId   = session.subscription;
  if (!userId || !subId) return;

  /* Fetch the subscription to get plan price */
  const stripeRes = await fetch(`https://api.stripe.com/v1/subscriptions/${subId}`, {
    headers: { 'Authorization': `Bearer ${STRIPE_SECRET_KEY}` },
  });
  const sub = await stripeRes.json();
  const priceId = sub.items?.data?.[0]?.price?.id;
  const plan    = planFromPriceId(priceId);

  /* Upsert subscription row */
  await supabaseServiceRequest('subscriptions?on_conflict=user_id', 'POST', {
    user_id:                userId,
    stripe_subscription_id: subId,
    stripe_price_id:        priceId,
    plan,
    status:                 sub.status,
    current_period_end:     new Date(sub.current_period_end * 1000).toISOString(),
  });

  /* Update user plan */
  await supabaseServiceRequest(`users?id=eq.${userId}`, 'PATCH', { plan });
}

async function handleSubscriptionUpdated(event) {
  const sub     = event.data.object;
  const priceId = sub.items?.data?.[0]?.price?.id;
  const plan    = planFromPriceId(priceId);

  await supabaseServiceRequest(
    `subscriptions?stripe_subscription_id=eq.${sub.id}`,
    'PATCH',
    {
      plan,
      status:             sub.status,
      current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
    }
  );

  /* Reflect plan on user row */
  const userId = sub.metadata?.userId;
  if (userId) {
    const newPlan = sub.status === 'active' ? plan : 'free';
    await supabaseServiceRequest(`users?id=eq.${userId}`, 'PATCH', { plan: newPlan });
  }
}

async function handleSubscriptionDeleted(event) {
  const sub = event.data.object;
  await supabaseServiceRequest(
    `subscriptions?stripe_subscription_id=eq.${sub.id}`,
    'PATCH',
    { status: 'canceled', plan: 'free' }
  );

  const userId = sub.metadata?.userId;
  if (userId) {
    await supabaseServiceRequest(`users?id=eq.${userId}`, 'PATCH', { plan: 'free' });
  }
}

async function handlePaymentFailed(event) {
  const invoice = event.data.object;
  const subId   = invoice.subscription;
  if (!subId) return;
  await supabaseServiceRequest(
    `subscriptions?stripe_subscription_id=eq.${subId}`,
    'PATCH',
    { status: 'past_due' }
  );
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!STRIPE_WEBHOOK_SECRET) {
    return res.status(503).json({ error: 'Webhook secret not configured' });
  }

  const sigHeader = req.headers['stripe-signature'];
  const rawBody   = req.body; /* Vercel buffers raw body as string when Content-Type is application/json */

  try {
    await verifyStripeSignature(
      typeof rawBody === 'string' ? rawBody : JSON.stringify(rawBody),
      sigHeader,
      STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('[stripe-webhook] Signature verification failed:', err.message);
    return res.status(400).json({ error: 'Invalid signature' });
  }

  const event = typeof rawBody === 'string' ? JSON.parse(rawBody) : rawBody;

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event);
        break;
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event);
        break;
      case 'invoice.payment_failed':
        await handlePaymentFailed(event);
        break;
      default:
        /* Unhandled event type — return 200 so Stripe doesn't retry */
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error('[stripe-webhook] Handler error:', err);
    return res.status(500).json({ error: 'Webhook handler failed' });
  }
}
