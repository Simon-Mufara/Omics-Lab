/* ═══════════════════════════════════════════════════════════════
   OmicsLab — Entitlements (single source of truth for "who gets what")
   Shared by API routes (server-side enforcement) and js/entitlements.js
   (client-side UX gating). Keep these two in sync — this file is the
   one that's actually authoritative; the client copy mirrors it for
   instant UI response and must never be trusted on its own.
   ═══════════════════════════════════════════════════════════════ */

export const TIERS = ['free', 'scholar', 'practitioner', 'campus', 'enterprise'];

/* Feature key → minimum tier required. A tier not listed here for a
   given feature is not entitled. Order in TIERS defines rank, so
   'campus'/'enterprise' inherit everything 'practitioner' has. */
const RANK = Object.fromEntries(TIERS.map((t, i) => [t, i]));

export const FEATURES = {
  'variant-interpreter.custom-data': 'scholar',
  'scrna.unlimited':                 'scholar',
  'scrna.export':                    'scholar',
  'certificate.verified':            'scholar',
  'ai-tutor.unlimited':              'scholar',
  'sandbox.export':                  'practitioner',
  'grant-generator':                 'practitioner',
  'thesis-coach':                    'practitioner',
  'ai-tutor.priority':               'practitioner',
};

export function hasAccess(plan, feature) {
  const required = FEATURES[feature];
  if (!required) return true; /* ungated feature */
  const userRank = RANK[plan] ?? 0;
  const requiredRank = RANK[required] ?? Infinity;
  return userRank >= requiredRank;
}

/* Bench (free) tier's AI Tutor cap — enforced by api/ai-tutor-quota.js
   against the ai_tutor_usage table. Paid tiers (scholar+) are unmetered. */
export const FREE_AI_TUTOR_DAILY_LIMIT = 3;
