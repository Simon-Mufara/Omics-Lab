import { supabase } from './supabaseClient.js';

export async function getDatasetLearning(datasetId) {
  const { data, error } = await supabase.from('dataset_learning').select('*').eq('dataset_id', datasetId).maybeSingle();
  return { data, error };
}

export async function getDatasetExercises(datasetId) {
  const { data, error } = await supabase.from('dataset_exercises').select('*').eq('dataset_id', datasetId).order('created_at', { ascending: true });
  return { data: data || [], error };
}

/* Takes the exercise ids already fetched for this dataset rather than
   embedding through dataset_exercises — a plain `.in()` filter avoids
   depending on PostgREST's embedded-resource-filter syntax for what's
   otherwise a one-hop lookup. */
export async function getExerciseCompletions(userId, exerciseIds) {
  if (!userId || !exerciseIds.length) return { data: [], error: null };
  const { data, error } = await supabase
    .from('dataset_exercise_completions')
    .select('exercise_id')
    .eq('user_id', userId)
    .in('exercise_id', exerciseIds);
  return { data: (data || []).map((r) => r.exercise_id), error };
}

export async function completeExercise(exerciseId) {
  return supabase.rpc('complete_dataset_exercise', { p_exercise_id: exerciseId });
}

export async function markDatasetProgress(datasetId, status) {
  return supabase.rpc('mark_dataset_progress', { p_dataset_id: datasetId, p_status: status });
}

export async function getUserDatasetProgress(userId, datasetId) {
  if (!userId) return { data: null, error: null };
  const { data, error } = await supabase
    .from('user_dataset_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('dataset_id', datasetId)
    .maybeSingle();
  return { data, error };
}

export async function getActiveChallenge(datasetId) {
  const { data, error } = await supabase
    .from('challenges')
    .select('id,dataset_id,title,description_md,metric,deadline,is_active,created_at')
    .eq('dataset_id', datasetId)
    .eq('is_active', true)
    .maybeSingle();
  return { data, error };
}

export async function getChallengeLeaderboard(challengeId) {
  const { data, error } = await supabase.rpc('challenge_leaderboard', { p_challenge_id: challengeId });
  return { data: data || [], error };
}

export async function getMySubmissions(challengeId, userId) {
  if (!userId) return { data: [], error: null };
  const { data, error } = await supabase
    .from('submissions')
    .select('*')
    .eq('challenge_id', challengeId)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return { data: data || [], error };
}

/* Uploads directly to the private `submissions` bucket under this
   user's own {challenge_id}/{user_id}/ prefix (RLS-enforced — see
   db/schema.sql) — the actual scoring, which needs the private
   held-out answer key, happens server-side via /api/score-challenge. */
export async function uploadSubmissionFile(challengeId, userId, file) {
  const path = `${challengeId}/${userId}/${Date.now()}-${file.name}`;
  const { error } = await supabase.storage.from('submissions').upload(path, file, { upsert: false });
  return { path, error };
}

/* getToken should be Clerk's default (no JWT template) session token —
   /api/score-challenge verifies it server-side with @clerk/backend,
   a different verification path than the Supabase "supabase" JWT
   template used for direct Postgres RLS calls. */
export async function scoreChallenge(getToken, challengeId, submissionStoragePath) {
  const token = await getToken();
  const res = await fetch('/api/score-challenge', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ challengeId, submissionStoragePath }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) return { error: new Error(body.error || `Scoring failed (${res.status})`) };
  return { data: body, error: null };
}
