/* ═══════════════════════════════════════════════════════════════
   OmicsLab — Client-Side Configuration
   Fill in your keys here, or fetch them from /api/config
   Public keys only — never put secret keys in this file.
   ═══════════════════════════════════════════════════════════════ */
window.OMICSLAB_CONFIG = {

  /* ── Supabase ──────────────────────────────────────────────────
     supabase.com → Project Settings → API → Project URL / anon key  */
  supabaseUrl:     '',   // e.g. 'https://xxxx.supabase.co'
  supabaseAnonKey: '',   // starts with 'eyJ...'

  /* ── Clerk ─────────────────────────────────────────────────────
     dashboard.clerk.com → API Keys → Publishable Key              */
  clerkPublishableKey: '',  // starts with 'pk_live_' or 'pk_test_'

  /* ── Stripe (publishable — safe for client) ────────────────────
     dashboard.stripe.com → Developers → API Keys                   */
  stripePublishableKey: '',  // starts with 'pk_live_' or 'pk_test_'

  /* ── PostHog ────────────────────────────────────────────────────
     app.posthog.com → Project Settings → Project API Key           */
  posthogKey:  '',   // starts with 'phc_'
  posthogHost: 'https://app.posthog.com',

  /* ── Sentry ─────────────────────────────────────────────────────
     sentry.io → Settings → Projects → Client Keys → DSN            */
  sentryDsn: '',     // 'https://xxx@xxx.ingest.sentry.io/xxx'

  /* ── Pricing page plan IDs (match Stripe Price IDs) ─────────── */
  plans: {
    campus:     { priceId: '', amount: 49,  label: 'Campus'     },
    enterprise: { priceId: '', amount: 199, label: 'Enterprise' },
  },

};
