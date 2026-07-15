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
import { resolveOrProvisionUser } from '../lib/user-provisioning.js';

const PAYSTACK_SECRET_KEY = (process.env.PAYSTACK_SECRET_KEY || '').trim();
/* Fallback pointed at a domain Simon doesn't own — if NEXT_PUBLIC_APP_URL
   was ever unset, every post-payment success/cancel redirect would send
   a paying customer to a site that isn't this one. */
const APP_URL             = process.env.NEXT_PUBLIC_APP_URL || 'https://omicsdatalab.tech';

/* .trim() on every value: env vars pasted from a dashboard table (as
   these plan codes were) very easily pick up a trailing space or
   newline that's invisible in the Vercel UI but makes the stored
   string not exactly equal the real code — Paystack then correctly
   reports "Plan not found" for a plan that, by every visual check,
   obviously exists. Recurring billing itself is modelled as a Plan
   created in the dashboard (or via the Plan API) — we only ever
   reference its plan_code here, never define pricing ourselves, so
   the numbers a customer is charged always match what's actually
   configured in Paystack. */
const PLAN_CODES = {
  'scholar:monthly':               (process.env.PAYSTACK_PLAN_SCHOLAR_MONTHLY || '').trim(),
  'scholar:monthly:student':       (process.env.PAYSTACK_PLAN_SCHOLAR_MONTHLY_STUDENT || '').trim(),
  'scholar:annual':                (process.env.PAYSTACK_PLAN_SCHOLAR_ANNUAL || '').trim(),
  'scholar:annual:student':        (process.env.PAYSTACK_PLAN_SCHOLAR_ANNUAL_STUDENT || '').trim(),
  'practitioner:monthly':          (process.env.PAYSTACK_PLAN_PRACTITIONER_MONTHLY || '').trim(),
  'practitioner:annual':           (process.env.PAYSTACK_PLAN_PRACTITIONER_ANNUAL || '').trim(),
};

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

  const user = await resolveOrProvisionUser(auth.clerkId).catch(() => null);
  if (!user) return res.status(404).json({ error: 'No account found for this session' });

  const {
    plan, period, verified, amountZAR,
    successUrl: rawSuccessUrl,
    cancelUrl:  rawCancelUrl,
  } = req.body || {};

  if (!plan || !period) return res.status(400).json({ error: 'Missing plan or period' });
  if (!amountZAR || amountZAR <= 0) return res.status(400).json({ error: 'Missing or invalid amount' });

  const planKey  = `${plan}:${period}${verified ? ':student' : ''}`;
  const planCode = PLAN_CODES[planKey];
  if (!planCode) return res.status(503).json({ error: 'Payments not configured', missingPlan: planKey });

  const callbackUrl = sameOrigin(rawSuccessUrl) ? rawSuccessUrl : `${APP_URL}/?payment=success`;

  try {
    const init = await paystackRequest('transaction/initialize', {
      email:        user.email,
      /* Paystack's transaction/initialize requires `amount` even when a
         `plan` code is given — it's the amount of the FIRST charge;
         the plan governs recurrence after that. Omitting it isn't a
         silent no-op, it's a hard validation error from Paystack, which
         was exactly why every checkout attempt failed. Amount must be
         in the smallest currency unit (cents for ZAR), matching what
         js/pricing.js's IND_TIERS defines in whole Rand. */
      amount:       Math.round(amountZAR * 100),
      plan:         planCode,
      callback_url: callbackUrl,
      currency:     'ZAR',
      metadata: {
        userId: user.id,
        plan, period, verified: !!verified,
        cancel_action: sameOrigin(rawCancelUrl) ? rawCancelUrl : `${APP_URL}/pricing?payment=cancelled`,
      },
    });

    if (!init.status) {
      /* Temporary: surface Paystack's full raw response, not just
         .message — "Plan not found" for a plan code confirmed to exist
         (byte-for-byte match, correct test/live mode) has exhausted
         every code-level explanation; Paystack's response may carry
         more (an error `code`, `type`, etc.) than the message string
         alone shows. Remove once resolved. */
      console.error('[create-paystack-checkout] Paystack rejected:', JSON.stringify(init), 'planCode=', planCode, 'sentAmount=', Math.round(amountZAR * 100));
      return res.status(400).json({ error: init.message || 'Could not start checkout', paystackRaw: init });
    }

    return res.status(200).json({
      authorization_url: init.data.authorization_url,
      reference:          init.data.reference,
    });
  } catch (err) {
    console.error('[create-paystack-checkout]', err);
    return res.status(500).json({ error: 'Failed to start checkout' });
  }
}
