/* ═══════════════════════════════════════════════════════════════
   OmicsLab — Challenge submission scoring
   POST /api/score-challenge   (requires Authorization: Bearer <clerk-jwt>)
   Body: { challengeId, submissionStoragePath }

   The client uploads its predictions CSV directly to the private
   `submissions` Storage bucket (RLS lets a signed-in user write only
   under their own {challenge_id}/{user_id}/ prefix — see db/schema.sql),
   then calls this endpoint with the resulting path. Scoring itself must
   run here rather than in the browser: it's the only place allowed to
   read `challenge-answers`, a bucket with NO client-facing Storage
   policy at all (service-role only), so the held-out answer key never
   reaches the client in any form.
   ═══════════════════════════════════════════════════════════════ */
import { requireAuth, AuthError } from '../lib/clerk-auth.js';
import { supabaseServiceRequest, supabaseStorageDownloadText } from '../lib/supabase-admin.js';
import { resolveOrProvisionUser } from '../lib/user-provisioning.js';

async function resolveUserId(clerkId) {
  const user = await resolveOrProvisionUser(clerkId).catch(() => null);
  return user?.id || null;
}

/* Minimal CSV parser — handles quoted fields with escaped `""`, which
   is as much of RFC 4180 as these small, machine-generated challenge
   files need. Returns { header: string[], rows: string[][] }. */
function parseCsv(text) {
  const lines = text.split(/\r\n|\n/).filter((l) => l.length > 0);
  const parseLine = (line) => {
    const cells = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (inQuotes) {
        if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++; }
        else if (ch === '"') inQuotes = false;
        else cur += ch;
      } else if (ch === '"') inQuotes = true;
      else if (ch === ',') { cells.push(cur); cur = ''; }
      else cur += ch;
    }
    cells.push(cur);
    return cells.map((c) => c.trim());
  };
  const [header, ...rows] = lines.map(parseLine);
  return { header, rows };
}

/* Joins truth/prediction rows on the FIRST column (assumed to be a
   shared row identifier, e.g. isolate_id) and scores the LAST column
   of each file — the contract every challenge's train/test files
   already follow in this codebase (see db/seed_datasets.sql). */
function joinByFirstColumn(answerCsv, submissionCsv) {
  const truthById = new Map();
  for (const row of answerCsv.rows) {
    if (!row[0]) continue;
    truthById.set(row[0], row[row.length - 1]);
  }
  const pairs = [];
  for (const row of submissionCsv.rows) {
    const id = row[0];
    if (!id || !truthById.has(id)) continue;
    pairs.push({ truth: truthById.get(id), pred: row[row.length - 1] });
  }
  return pairs;
}

function toBinary(value) {
  const n = Number(value);
  if (!Number.isNaN(n)) return n >= 0.5 ? 1 : 0;
  const s = String(value).trim().toLowerCase();
  return ['1', 'true', 'yes', 'resistant', 'positive'].includes(s) ? 1 : 0;
}

function computeMetric(metric, pairs) {
  if (pairs.length === 0) return null;

  if (metric === 'accuracy') {
    const correct = pairs.filter((p) => String(p.truth).trim() === String(p.pred).trim()).length;
    return correct / pairs.length;
  }

  if (metric === 'f1') {
    let tp = 0, fp = 0, fn = 0;
    for (const p of pairs) {
      const t = toBinary(p.truth), pr = toBinary(p.pred);
      if (pr === 1 && t === 1) tp++;
      else if (pr === 1 && t === 0) fp++;
      else if (pr === 0 && t === 1) fn++;
    }
    const precision = tp + fp > 0 ? tp / (tp + fp) : 0;
    const recall = tp + fn > 0 ? tp / (tp + fn) : 0;
    return precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;
  }

  if (metric === 'rmse') {
    const sqErrSum = pairs.reduce((sum, p) => {
      const diff = Number(p.pred) - Number(p.truth);
      return sum + (Number.isNaN(diff) ? 0 : diff * diff);
    }, 0);
    return Math.sqrt(sqErrSum / pairs.length);
  }

  if (metric === 'auc') {
    // Rank-based (Mann–Whitney) AUC — ties get the average rank of their group.
    const scored = pairs.map((p) => ({ score: Number(p.pred), label: toBinary(p.truth) })).filter((p) => !Number.isNaN(p.score));
    const sorted = [...scored].sort((a, b) => a.score - b.score);
    const ranks = new Array(sorted.length);
    let i = 0;
    while (i < sorted.length) {
      let j = i;
      while (j + 1 < sorted.length && sorted[j + 1].score === sorted[i].score) j++;
      const avgRank = (i + 1 + j + 1) / 2;
      for (let k = i; k <= j; k++) ranks[k] = avgRank;
      i = j + 1;
    }
    let rankSumPos = 0, nPos = 0, nNeg = 0;
    sorted.forEach((s, idx) => {
      if (s.label === 1) { rankSumPos += ranks[idx]; nPos++; }
      else nNeg++;
    });
    if (nPos === 0 || nNeg === 0) return null;
    return (rankSumPos - (nPos * (nPos + 1)) / 2) / (nPos * nNeg);
  }

  return null;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  let auth;
  try {
    auth = await requireAuth(req);
  } catch (err) {
    if (err instanceof AuthError) return res.status(err.status).json({ error: err.message });
    throw err;
  }

  const userId = await resolveUserId(auth.clerkId).catch(() => null);
  if (!userId) return res.status(404).json({ error: 'No account found for this session' });

  const { challengeId, submissionStoragePath } = req.body || {};
  if (!challengeId || !submissionStoragePath) return res.status(400).json({ error: 'Missing challengeId or submissionStoragePath' });

  // Path convention is {challenge_id}/{user_id}/{filename} — reject
  // anything that doesn't match this caller's own prefix, defense in
  // depth on top of the Storage RLS policy that already enforces it.
  const expectedPrefix = `${challengeId}/${userId}/`;
  if (!submissionStoragePath.startsWith(expectedPrefix)) {
    return res.status(403).json({ error: 'submissionStoragePath does not belong to this challenge/user' });
  }

  const challengeRes = await supabaseServiceRequest(
    `challenges?id=eq.${encodeURIComponent(challengeId)}&select=id,metric,held_out_answer_path,is_active,deadline`,
    'GET'
  ).catch(() => null);
  const challenge = (await challengeRes?.json())?.[0];
  if (!challenge) return res.status(404).json({ error: 'Challenge not found' });
  if (!challenge.is_active) return res.status(400).json({ error: 'This challenge is no longer active' });
  if (challenge.deadline && new Date(challenge.deadline) < new Date()) {
    return res.status(400).json({ error: 'The submission deadline for this challenge has passed' });
  }
  if (!challenge.held_out_answer_path) return res.status(503).json({ error: 'Challenge answer key not configured yet' });

  const [answerText, submissionText] = await Promise.all([
    supabaseStorageDownloadText('challenge-answers', challenge.held_out_answer_path),
    supabaseStorageDownloadText('submissions', submissionStoragePath),
  ]);
  if (!answerText) return res.status(503).json({ error: 'Could not load the answer key' });
  if (!submissionText) return res.status(400).json({ error: 'Could not load your submission file' });

  const pairs = joinByFirstColumn(parseCsv(answerText), parseCsv(submissionText));
  if (pairs.length === 0) {
    return res.status(400).json({ error: 'No matching rows between your submission and the held-out set — check the ID column matches test.csv' });
  }

  const score = computeMetric(challenge.metric, pairs);
  if (score === null || Number.isNaN(score)) {
    return res.status(400).json({ error: 'Could not compute a score from this submission — check the prediction column' });
  }

  const insertRes = await supabaseServiceRequest(
    'submissions', 'POST',
    { challenge_id: challengeId, user_id: userId, submitted_file_path: submissionStoragePath, score },
    { prefer: 'return=representation' }
  ).catch((err) => { throw err; });

  const rows = await insertRes.json();
  return res.status(200).json({ submission: rows?.[0], score, metric: challenge.metric, matchedRows: pairs.length });
}
