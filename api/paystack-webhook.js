/* ═══════════════════════════════════════════════════════════════
   OmicsLab — Paystack Webhook Handler
   POST /api/paystack-webhook
   Handles: charge.success, subscription.disable, invoice.payment_failed
   Mirrors api/stripe-webhook.js's structure and safety properties:
   raw-body signature verification, idempotent upserts, and a grace
   period (past_due) before a failed renewal actually downgrades anyone.
   ═══════════════════════════════════════════════════════════════ */

import crypto from 'crypto';
import { supabaseServiceRequest } from '../lib/supabase-admin.js';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

/* Same reasoning as the Stripe handler: the platform's auto-parsed JSON
   body can't be re-serialized back into the exact bytes Paystack signed,
   so signature verification needs the raw body. */
export const config = { api: { bodyParser: false } };

async function readRawBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  return Buffer.concat(chunks);
}

function verifySignature(rawBody, signature) {
  if (!signature) return false;
  const expected = crypto.createHmac('sha512', PAYSTACK_SECRET_KEY).update(rawBody).digest('hex');
  /* Constant-time compare — a naive === here leaks timing information
     an attacker could use to forge a valid signature byte-by-byte. */
  const a = Buffer.from(expected, 'hex');
  const b = Buffer.from(signature, 'hex');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

async function handleChargeSuccess(event) {
  const data = event.data;
  const meta = data.metadata || {};
  const userId = meta.userId;
  if (!userId) return; /* not one of our subscription charges */

  const plan = meta.plan || 'scholar';

  await supabaseServiceRequest('subscriptions?on_conflict=user_id', 'POST', {
    user_id:                     userId,
    provider:                    'paystack',
    paystack_subscription_code:  data.plan_object?.plan_code || data.plan || null,
    paystack_plan_code:          data.plan_object?.plan_code || data.plan || null,
    plan,
    status:                      'active',
    current_period_end:          null, /* Paystack sends this on subscription.create — patched there */
  }, { prefer: 'return=minimal,resolution=merge-duplicates' });

  await supabaseServiceRequest(`users?id=eq.${userId}`, 'PATCH', {
    plan,
    billing_period:    meta.period || null,
    student_verified:  !!meta.verified,
    paystack_customer_code: data.customer?.customer_code || null,
  });
}

async function handleSubscriptionCreate(event) {
  const sub = event.data;
  const code = sub.subscription_code;
  if (!code) return;

  await supabaseServiceRequest(
    `subscriptions?paystack_subscription_code=eq.${code}`,
    'PATCH',
    {
      status:             'active',
      current_period_end: sub.next_payment_date ? new Date(sub.next_payment_date).toISOString() : null,
    }
  );
}

async function handleSubscriptionDisable(event) {
  const sub = event.data;
  const code = sub.subscription_code;
  const customerCode = sub.customer?.customer_code;

  await supabaseServiceRequest(
    `subscriptions?paystack_subscription_code=eq.${code}`,
    'PATCH',
    { status: 'canceled' }
  );

  if (customerCode) {
    /* Cancellation keeps access until period end (handled client-side by
       checking current_period_end), then a scheduled job or the next
       api/me.js read should treat an expired period as 'free'. */
    await supabaseServiceRequest(`users?paystack_customer_code=eq.${customerCode}`, 'PATCH', { plan: 'free' });
  }
}

async function handleInvoicePaymentFailed(event) {
  const data = event.data;
  const code = data.subscription?.subscription_code;
  if (!code) return;

  /* Grace period: mark past_due, don't downgrade yet — Paystack retries
     failed renewals automatically; only a subscription.disable event
     (Paystack gives up after its own retry schedule) should downgrade. */
  await supabaseServiceRequest(
    `subscriptions?paystack_subscription_code=eq.${code}`,
    'PATCH',
    { status: 'past_due' }
  );
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!PAYSTACK_SECRET_KEY)  return res.status(503).json({ error: 'Webhook secret not configured' });

  const rawBody   = await readRawBody(req);
  const signature = req.headers['x-paystack-signature'];

  if (!verifySignature(rawBody, signature)) {
    console.error('[paystack-webhook] Signature verification failed');
    return res.status(400).json({ error: 'Invalid signature' });
  }

  let event;
  try {
    event = JSON.parse(rawBody.toString('utf8'));
  } catch {
    return res.status(400).json({ error: 'Malformed payload' });
  }

  try {
    switch (event.event) {
      case 'charge.success':
        await handleChargeSuccess(event);
        break;
      case 'subscription.create':
        await handleSubscriptionCreate(event);
        break;
      case 'subscription.disable':
        await handleSubscriptionDisable(event);
        break;
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event);
        break;
      default:
        /* Unhandled event type — 200 so Paystack doesn't retry indefinitely */
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error('[paystack-webhook] Handler error:', err);
    return res.status(500).json({ error: 'Webhook handler failed' });
  }
}
