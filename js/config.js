/* ═══════════════════════════════════════════════════════════════
   OmicsLab — Client-Side Configuration
   Fill in your keys here, or fetch them from /api/config
   Public keys only — never put secret keys in this file.
   ═══════════════════════════════════════════════════════════════ */
window.OMICSLAB_CONFIG = {

  /* ── Supabase ──────────────────────────────────────────────────
     supabase.com → Project Settings → API → Project URL / anon key  */
  supabaseUrl:     'https://gfsuklduvlnpilvretkz.supabase.co',
  supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdmc3VrbGR1dmxucGlsdnJldGt6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMwMTYzMDcsImV4cCI6MjA5ODU5MjMwN30.DvGRkEyiBHRXS4PHSY6be0EDGvcGs1WVJu_kNBpDgqI',

  /* ── Clerk ─────────────────────────────────────────────────────
     dashboard.clerk.com → API Keys → Publishable Key              */
  clerkPublishableKey: '',  // ← paste your pk_live_... key from Clerk → API Keys

  /* ── Stripe (publishable — safe for client) ────────────────────
     dashboard.stripe.com → Developers → API Keys                   */
  stripePublishableKey: '',  // starts with 'pk_live_' or 'pk_test_'

  /* ── PostHog ────────────────────────────────────────────────────
     app.posthog.com → Project Settings → Project API Key           */
  posthogKey:  '',   // starts with 'phc_'
  posthogHost: 'https://app.posthog.com',

  /* ── Sentry ─────────────────────────────────────────────────────
     sentry.io → Settings → Projects → Client Keys → DSN            */
  appUrl: 'https://omicsdatalab.tech',

  sentryDsn: '',     // 'https://xxx@xxx.ingest.sentry.io/xxx'

  /* ── Pricing page plan IDs (match Stripe Price IDs) ─────────── */
  plans: {
    campus:     { priceId: '', amount: 49,  label: 'Campus'     },
    enterprise: { priceId: '', amount: 199, label: 'Enterprise' },
  },

};
