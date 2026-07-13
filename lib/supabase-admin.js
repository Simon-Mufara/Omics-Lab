/* ═══════════════════════════════════════════════════════════════
   OmicsLab — Supabase service-role REST helper (bypasses RLS)
   Shared by api/* routes that write on the backend's authority
   (Stripe webhook, checkout session setup).
   ═══════════════════════════════════════════════════════════════ */
const SUPABASE_URL         = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

/* Throws on any non-2xx response so callers never mistake a failed
   write for a successful one — let the caller's own error handling
   (e.g. returning 5xx so Stripe retries the webhook) take over. */
export async function supabaseServiceRequest(path, method, body, opts = {}) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) return null;

  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method,
    headers: {
      apikey:         SUPABASE_SERVICE_KEY,
      Authorization:  `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json',
      Prefer:         opts.prefer || 'return=minimal',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`Supabase ${method} ${path} failed: ${res.status} ${detail}`);
  }
  return res;
}

/* Downloads an object from a private Storage bucket using the service
   role — the only way to read `challenge-answers` (no client-facing
   policy exists on that bucket at all) and a callers-eye view of any
   other bucket regardless of its RLS policies. Returns the raw text
   body, or null if the object doesn't exist / Supabase isn't configured. */
export async function supabaseStorageDownloadText(bucket, path) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) return null;

  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${bucket}/${path}`, {
    headers: {
      apikey:        SUPABASE_SERVICE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
    },
  });
  if (!res.ok) return null;
  return res.text();
}
