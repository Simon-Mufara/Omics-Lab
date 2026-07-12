/* ═══════════════════════════════════════════════════════════════
   OmicsLab — Paystack Checkout Initialization
   POST /api/create-paystack-checkout   (requires Authorization: Bearer <clerk-jwt>)
   Body: { plan, period, verified, amountZAR, successUrl, cancelUrl }
   Returns: { authorization_url, reference } — redirect to Paystack's
   hosted, PCI-compliant checkout page. Card details never touch this
   server or the browser DOM — that's the whole point of using Paystack's
   hosted flow instead of building a card form ourselves.
   ═══════════════════════════════════════════════════════════════ */
import { requireAuth, AuthError } from '../lib/clerk-auth.js';
import { supabaseServiceRequest } from '../lib/supabase-admin.js';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const APP_URL             = process.env.NEXT_PUBLIC_APP_URL || 'https://omicslab.africa';

/* Recurring billing on Paystack is modelled as a Plan created in the
   dashboard (or via the Plan API) — we only ever reference its plan_code
   here, never define pricing ourselves, so the numbers a customer is
   charged always match what's actually configured in Paystack. */
const PLAN_CODES = {
  'scholar:monthly':               process.env.PAYSTACK_PLAN_SCHOLAR_MONTHLY,
  'scholar:monthly:student':       process.env.PAYSTACK_PLAN_SCHOLAR_MONTHLY_STUDENT,
  'scholar:annual':                process.env.PAYSTACK_PLAN_SCHOLAR_ANNUAL,
  'scholar:annual:student':        process.env.PAYSTACK_PLAN_SCHOLAR_ANNUAL_STUDENT,
  'practitioner:monthly':          process.env.PAYSTACK_PLAN_PRACTITIONER_MONTHLY,
  'practitioner:annual':           process.env.PAYSTACK_PLAN_PRACTITIONER_ANNUAL,
};

async function resolveSupabaseUserId(clerkId) {
  const res = await supabaseServiceRequest(`users?clerk_id=eq.${encodeURIComponent(clerkId)}&select=id,email`, 'GET');
  if (!res) return null; /* Supabase not configured */
  const rows = await res.json();
  return rows?.[0] || null;
}

function sameOrigin(url) {
  if (typeof url !== 'string' || !url) return false;
  try { return new URL(url, APP_URL).origin === new URL(APP_URL).origin; } catch { return false; }
}

async function paystackRequest(path, body) {
  const res = await fetch(`https://api.paystack.co/${path}`, {
    method:  'POST',
    headers: {
      'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
      'Content-Type':  'application/json',
    },
    body: JSON.stringify(body),
  });
  return res.json();
}

export default async function handler(req, res) {
  if (req.method !== 'POST')      return res.status(405).json({ error: 'Method not allowed' });
  if (!PAYSTACK_SECRET_KEY)       return res.status(503).json({ error: 'Payments not configured' });

  let auth;
  try {
    auth = await requireAuth(req);
  } catch (err) {
    if (err instanceof AuthError) return res.status(err.status).json({ error: err.message });
    throw err;
  }

  const user = await resolveSupabaseUserId(auth.clerkId).catch(() => null);
  if (!user) return res.status(404).json({ error: 'No account found for this session' });

  const {
    plan, period, verified,
    successUrl: rawSuccessUrl,
    cancelUrl:  rawCancelUrl,
  } = req.body || {};

  if (!plan || !period) return res.status(400).json({ error: 'Missing plan or period' });

  const planKey  = `${plan}:${period}${verified ? ':student' : ''}`;
  const planCode = PLAN_CODES[planKey];
  if (!planCode) return res.status(503).json({ error: 'Payments not configured', missingPlan: planKey });

  const callbackUrl = sameOrigin(rawSuccessUrl) ? rawSuccessUrl : `${APP_URL}/?payment=success`;

  try {
    const init = await paystackRequest('transaction/initialize', {
      email:        user.email,
      plan:         planCode,
      callback_url: callbackUrl,
      currency:     'ZAR',
      metadata: {
        userId: user.id,
        plan, period, verified: !!verified,
        cancel_action: sameOrigin(rawCancelUrl) ? rawCancelUrl : `${APP_URL}/pricing?payment=cancelled`,
      },
    });

    if (!init.status) return res.status(400).json({ error: init.message || 'Could not start checkout' });

    return res.status(200).json({
      authorization_url: init.data.authorization_url,
      reference:          init.data.reference,
    });
  } catch (err) {
    console.error('[create-paystack-checkout]', err);
    return res.status(500).json({ error: 'Failed to start checkout' });
  }
}
