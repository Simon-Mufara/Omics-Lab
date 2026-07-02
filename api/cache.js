/* ═══════════════════════════════════════════════════════════════
   OmicsLab — Upstash Redis Cache Proxy
   GET /api/cache?source=pubmed&id=39123456
   GET /api/cache?source=ensembl&id=ENSG00000141510
   GET /api/cache?source=opentargets&id=ENSG00000141510

   Caches external bioinformatics API responses to reduce
   latency and avoid rate limits. TTL: 24h default.
   ═══════════════════════════════════════════════════════════════ */

const UPSTASH_URL   = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

const TTL = {
  pubmed:       86400,   /* 24h — papers don't change */
  ensembl:      86400,   /* 24h — gene data stable */
  opentargets:  3600,    /* 1h  — association scores update */
};

/* ── Redis REST helpers ──────────────────────────────────────── */
async function redisGet(key) {
  if (!UPSTASH_URL || !UPSTASH_TOKEN) return null;
  const res = await fetch(`${UPSTASH_URL}/get/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` },
  });
  const json = await res.json();
  return json.result ?? null;
}

async function redisSet(key, value, ttlSeconds) {
  if (!UPSTASH_URL || !UPSTASH_TOKEN) return;
  await fetch(`${UPSTASH_URL}/set/${encodeURIComponent(key)}`, {
    method: 'POST',
    headers: {
      Authorization:  `Bearer ${UPSTASH_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ value, ex: ttlSeconds }),
  });
}

/* ── Source fetchers ─────────────────────────────────────────── */
async function fetchPubMed(id) {
  const url = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${id}&retmode=json&tool=omicslab&email=noreply@omicslab.africa`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`PubMed returned ${res.status}`);
  const json = await res.json();
  const article = json.result?.[id];
  if (!article) throw new Error('Article not found');
  return {
    pmid:     id,
    title:    article.title,
    authors:  article.authors?.map(a => a.name).join(', '),
    journal:  article.fulljournalname,
    year:     article.pubdate?.split(' ')[0],
    source:   'pubmed',
  };
}

async function fetchEnsembl(id) {
  const isGene    = id.startsWith('ENSG');
  const endpoint  = isGene
    ? `https://rest.ensembl.org/lookup/id/${id}?content-type=application/json&expand=1`
    : `https://rest.ensembl.org/xrefs/symbol/homo_sapiens/${id}?content-type=application/json`;

  const res = await fetch(endpoint);
  if (!res.ok) throw new Error(`Ensembl returned ${res.status}`);
  const data = await res.json();

  if (!isGene) {
    /* Symbol lookup → return first Ensembl gene ID found */
    const gene = Array.isArray(data) ? data.find(x => x.type === 'gene') : null;
    return { symbol: id, ensemblId: gene?.id || null, source: 'ensembl' };
  }

  return {
    ensemblId:   data.id,
    symbol:      data.display_name,
    description: data.description,
    biotype:     data.biotype,
    chromosome:  data.seq_region_name,
    start:       data.start,
    end:         data.end,
    strand:      data.strand,
    source:      'ensembl',
  };
}

async function fetchOpenTargets(id) {
  const query = `
    query($id: String!) {
      target(ensemblId: $id) {
        id
        approvedSymbol
        approvedName
        associatedDiseases(page: { index: 0, size: 10 }) {
          rows {
            disease { id name }
            score
          }
        }
      }
    }`;

  const res = await fetch('https://api.platform.opentargets.org/api/v4/graphql', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ query, variables: { id } }),
  });
  if (!res.ok) throw new Error(`OpenTargets returned ${res.status}`);
  const json = await res.json();
  const target = json.data?.target;
  if (!target) throw new Error('Target not found');

  return {
    ensemblId:   target.id,
    symbol:      target.approvedSymbol,
    name:        target.approvedName,
    diseases:    target.associatedDiseases?.rows?.map(r => ({
      id:    r.disease.id,
      name:  r.disease.name,
      score: r.score,
    })) || [],
    source: 'opentargets',
  };
}

const FETCHERS = { pubmed: fetchPubMed, ensembl: fetchEnsembl, opentargets: fetchOpenTargets };

/* ── Handler ─────────────────────────────────────────────────── */
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { source, id } = req.query || {};
  if (!source || !id)  return res.status(400).json({ error: 'Missing source or id' });

  const fetch_fn = FETCHERS[source];
  if (!fetch_fn)       return res.status(400).json({ error: `Unknown source: ${source}` });

  const cacheKey = `omicslab:cache:${source}:${id}`;

  /* Check Redis first */
  try {
    const cached = await redisGet(cacheKey);
    if (cached) {
      const data = typeof cached === 'string' ? JSON.parse(cached) : cached;
      return res.status(200).json({ data, cached: true });
    }
  } catch (e) {
    /* Redis unavailable — continue to fetch */
  }

  /* Fetch from upstream */
  try {
    const data = await fetch_fn(id);
    /* Store in Redis (fire and forget) */
    redisSet(cacheKey, JSON.stringify(data), TTL[source] || 3600).catch(() => {});
    return res.status(200).json({ data, cached: false });
  } catch (err) {
    console.error(`[cache] ${source}/${id}:`, err.message);
    return res.status(502).json({ error: err.message });
  }
}
