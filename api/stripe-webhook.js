/* ═══════════════════════════════════════════════════════════════
   OmicsLab — Stripe Webhook Handler
   POST /api/stripe-webhook
   Handles: checkout.session.completed, customer.subscription.updated,
            customer.subscription.deleted, invoice.payment_failed
   ═══════════════════════════════════════════════════════════════ */

import Stripe from 'stripe';
import { supabaseServiceRequest } from '../lib/supabase-admin.js';

const STRIPE_SECRET_KEY     = process.env.STRIPE_SECRET_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

const stripe = STRIPE_SECRET_KEY ? new Stripe(STRIPE_SECRET_KEY) : null;

/* Vercel auto-parses application/json bodies, which destroys the exact
   byte sequence Stripe signed — re-serializing the parsed object with
   JSON.stringify never reliably reproduces it (key order, whitespace,
   number formatting can all differ), so signature verification against
   a re-stringified body silently fails for real requests. Disable the
   platform body parser for this route and verify against the raw
   bytes instead, via Stripe's own (battle-tested) SDK. */
export const config = { api: { bodyParser: false } };

async function readRawBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  return Buffer.concat(chunks);
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

  /* Upsert subscription row — PostgREST only resolves on_conflict when
     told to via Prefer: resolution=merge-duplicates; without it, a
     POST that collides with an existing user_id row errors instead of
     updating it (e.g. every returning/resubscribing customer). */
  await supabaseServiceRequest('subscriptions?on_conflict=user_id', 'POST', {
    user_id:                userId,
    stripe_subscription_id: subId,
    stripe_price_id:        priceId,
    plan,
    status:                 sub.status,
    current_period_end:     new Date(sub.current_period_end * 1000).toISOString(),
  }, { prefer: 'return=minimal,resolution=merge-duplicates' });

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

  if (!STRIPE_WEBHOOK_SECRET || !stripe) {
    return res.status(503).json({ error: 'Webhook secret not configured' });
  }

  const sigHeader = req.headers['stripe-signature'];
  const rawBody   = await readRawBody(req);

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sigHeader, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('[stripe-webhook] Signature verification failed:', err.message);
    return res.status(400).json({ error: 'Invalid signature' });
  }

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
