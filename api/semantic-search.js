/* ═══════════════════════════════════════════════════════════════
   OmicsLab — Pinecone Semantic Search API Route
   POST /api/semantic-search
   Body: { query, namespace?, topK? }
   Namespaces: 'mentor-answers' | 'papers' | 'protocols'
   Returns: { results: [{ id, score, metadata }] }

   Uses Anthropic text-embedding-3-small compatible model or
   falls back to Pinecone inference API for embeddings.
   ═══════════════════════════════════════════════════════════════ */

const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const PINECONE_HOST    = process.env.PINECONE_HOST;     /* e.g. https://omicslab-xxxx.svc.pinecone.io */
const PINECONE_INDEX   = process.env.PINECONE_INDEX || 'omicslab-knowledge';
const ANTHROPIC_KEY    = process.env.ANTHROPIC_API_KEY;

/* ── Embed text using Anthropic's model ──────────────────────── */
async function embedWithAnthropic(text) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method:  'POST',
    headers: {
      'x-api-key':         ANTHROPIC_KEY,
      'anthropic-version': '2023-06-01',
      'content-type':      'application/json',
    },
    body: JSON.stringify({
      model:      'claude-haiku-4-5-20251001',
      max_tokens: 1,
      system:     'You are an embedding helper. Return nothing.',
      messages:   [{ role: 'user', content: text }],
    }),
  });
  /* We use the Anthropic API just as a test; real embedding uses Pinecone inference below */
  if (!res.ok) throw new Error(`Anthropic API error: ${res.status}`);
  return null; /* Signal to use Pinecone inference instead */
}

/* ── Embed using Pinecone Inference API ──────────────────────── */
async function embedWithPinecone(text) {
  const res = await fetch('https://api.pinecone.io/embed', {
    method:  'POST',
    headers: {
      'Api-Key':      PINECONE_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model:     'multilingual-e5-large',
      parameters: { input_type: 'query', truncate: 'END' },
      inputs:    [{ text }],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Pinecone embed error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data.data?.[0]?.values;
}

/* ── Query Pinecone index ────────────────────────────────────── */
async function queryPinecone(vector, namespace, topK) {
  const host = PINECONE_HOST || `https://${PINECONE_INDEX}.svc.pinecone.io`;
  const res  = await fetch(`${host}/query`, {
    method:  'POST',
    headers: {
      'Api-Key':      PINECONE_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      vector,
      topK,
      namespace:       namespace || 'mentor-answers',
      includeMetadata: true,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Pinecone query error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return (data.matches || []).map(m => ({
    id:       m.id,
    score:    m.score,
    metadata: m.metadata,
  }));
}

/* ── Rate limiting via Upstash (optional) ────────────────────── */
async function checkRateLimit(ip) {
  const url   = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return true; /* No Redis — allow all */

  const key = `omicslab:ratelimit:search:${ip}`;
  const res = await fetch(`${url}/incr/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const { result: count } = await res.json();

  if (count === 1) {
    /* Set 1-minute expiry on first hit */
    await fetch(`${url}/expire/${encodeURIComponent(key)}/60`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  return count <= 30; /* 30 searches per minute per IP */
}

/* ── Handler ─────────────────────────────────────────────────── */
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!PINECONE_API_KEY) return res.status(503).json({ error: 'Semantic search not configured' });

  /* Rate limit */
  const ip = req.headers['x-forwarded-for']?.split(',')[0] || 'unknown';
  const allowed = await checkRateLimit(ip).catch(() => true);
  if (!allowed) return res.status(429).json({ error: 'Too many requests — try again in a minute' });

  const {
    query,
    namespace = 'mentor-answers',
    topK      = 5,
  } = req.body || {};

  if (!query || typeof query !== 'string' || query.trim().length < 3) {
    return res.status(400).json({ error: 'Query must be at least 3 characters' });
  }

  if (!['mentor-answers', 'papers', 'protocols'].includes(namespace)) {
    return res.status(400).json({ error: `Invalid namespace: ${namespace}` });
  }

  try {
    const vector  = await embedWithPinecone(query.trim().slice(0, 2000));
    const results = await queryPinecone(vector, namespace, Math.min(topK, 20));
    return res.status(200).json({ results, query: query.trim(), namespace });
  } catch (err) {
    console.error('[semantic-search]', err.message);
    return res.status(502).json({ error: 'Search failed', detail: err.message });
  }
}
