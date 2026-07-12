/* ═══════════════════════════════════════════════════════════════
   OmicsLab — Current user's plan & entitlements
   GET /api/me   (requires Authorization: Bearer <clerk-jwt>)
   The client fetches this once per session (js/entitlements.js) and
   caches it in memory — never in localStorage, since a stale cached
   "paid" flag surviving a cancellation would be a real bug, not just
   a UX nit.
   ═══════════════════════════════════════════════════════════════ */
import { requireAuth, AuthError } from '../lib/clerk-auth.js';
import { supabaseServiceRequest } from '../lib/supabase-admin.js';
import { FEATURES, FREE_AI_TUTOR_DAILY_LIMIT } from '../lib/entitlements.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  let auth;
  try {
    auth = await requireAuth(req);
  } catch (err) {
    if (err instanceof AuthError) return res.status(err.status).json({ error: err.message });
    throw err;
  }

  const userRes = await supabaseServiceRequest(
    `users?clerk_id=eq.${encodeURIComponent(auth.clerkId)}&select=plan,billing_period,student_verified`,
    'GET'
  ).catch(() => null);

  if (!userRes) {
    /* Supabase not configured, or lookup failed — fail safe to the free tier
       rather than 500ing the whole app for every signed-in visitor. */
    return res.status(200).json({ plan: 'free', billingPeriod: null, studentVerified: false, features: FEATURES, freeAiTutorLimit: FREE_AI_TUTOR_DAILY_LIMIT });
  }

  const rows = await userRes.json();
  const user = rows?.[0];

  return res.status(200).json({
    plan:            user?.plan || 'free',
    billingPeriod:   user?.billing_period || null,
    studentVerified: !!user?.student_verified,
    features:        FEATURES,
    freeAiTutorLimit: FREE_AI_TUTOR_DAILY_LIMIT,
  });
}
