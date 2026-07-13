import { supabase } from './supabaseClient.js';

export const SORT_OPTIONS = [
  { value: 'downloads', label: 'Most downloaded' },
  { value: 'usability', label: 'Highest usability' },
  { value: 'newest', label: 'Newest' },
  { value: 'trending', label: 'Trending (30d)' },
];

export const CATEGORY_LABELS = {
  tabular: 'Tabular / intro ML',
  'gene-expression': 'Gene expression',
  variant: 'Variant data',
  'single-cell': 'scRNA-seq',
  gwas: 'GWAS summary stats',
  protein: 'Protein / sequence',
  'africa-cohort': 'Africa cohort',
  challenge: 'Challenge',
  general: 'General',
};

/* One round trip: search + every filter + sort, via the
   search_datasets() Postgres function (see db/schema.sql) — a plain
   client-side filter chain can't do a partial-match search across the
   tags text[] column, so the whole query lives server-side. */
export async function searchDatasets({
  search = '',
  category = null,
  tags = null,
  difficulty = null,
  license = null,
  hasStarterExercise = null,
  sort = 'newest',
} = {}) {
  const { data, error } = await supabase.rpc('search_datasets', {
    p_search: search || null,
    p_category: category || null,
    p_tags: tags && tags.length ? tags : null,
    p_difficulty: difficulty || null,
    p_license: license || null,
    p_has_starter_exercise: hasStarterExercise ?? null,
    p_sort: sort,
  });
  return { data: data || [], error };
}

export async function getDatasetBySlug(slug) {
  const { data, error } = await supabase.from('datasets_with_trending').select('*').eq('slug', slug).maybeSingle();
  return { data, error };
}

export async function getDatasetFiles(datasetId) {
  const { data, error } = await supabase
    .from('dataset_files')
    .select('*')
    .eq('dataset_id', datasetId)
    .order('created_at', { ascending: true });
  return { data: data || [], error };
}

/* Owner lookups are a separate query keyed on the distinct owner_ids
   present in a page of results, rather than a join — Supabase's
   PostgREST embedding needs a declared FK relationship in its schema
   cache, and keeping this as an explicit second query avoids coupling
   the datasets query to that. Seed datasets have owner_id = null
   (OmicsLab-curated), so this is skipped for most cards. */
export async function getOwnersByIds(ids) {
  const uniqueIds = [...new Set(ids.filter(Boolean))];
  if (!uniqueIds.length) return {};
  const { data, error } = await supabase
    .from('users')
    .select('id,username,display_name,name,avatar_url')
    .in('id', uniqueIds);
  if (error || !data) return {};
  return Object.fromEntries(data.map((u) => [u.id, u]));
}

export async function logDatasetEvent(datasetId, eventType) {
  return supabase.rpc('log_dataset_event', { p_dataset_id: datasetId, p_event_type: eventType });
}

export function formatBytes(bytes) {
  if (bytes == null) return '—';
  if (bytes < 1024) return `${bytes} B`;
  const units = ['KB', 'MB', 'GB'];
  let val = bytes / 1024;
  let i = 0;
  while (val >= 1024 && i < units.length - 1) {
    val /= 1024;
    i++;
  }
  return `${val.toFixed(val < 10 ? 1 : 0)} ${units[i]}`;
}
