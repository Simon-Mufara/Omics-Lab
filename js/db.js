/* ═══════════════════════════════════════════════════════════════
   OmicsLab — Supabase Data Layer
   Wraps Supabase client with localStorage fallback.
   When Supabase is configured → syncs to cloud.
   When not configured → transparent localStorage only.
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.DB = (function () {

  let _client = null;
  let _ready  = false;

  /* ── Init: called after config.js loads ─────────────────────── */
  function init() {
    const cfg = window.OMICSLAB_CONFIG;
    if (!cfg?.supabaseUrl || !cfg?.supabaseAnonKey) return;

    /* Supabase CDN may still be loading — poll until available (max 8 s) */
    if (window.supabase?.createClient) {
      _boot(cfg);
    } else {
      let attempts = 0;
      const poll = setInterval(() => {
        attempts++;
        if (window.supabase?.createClient) {
          clearInterval(poll);
          _boot(cfg);
        } else if (attempts > 40) {
          clearInterval(poll);
          console.warn('[OmicsLab DB] Supabase CDN did not load within 8 s — cloud sync disabled.');
        }
      }, 200);
    }
  }

  function _boot(cfg) {
    _client = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey);
    _ready  = true;
    console.log('[OmicsLab DB] Ready ✓');
  }

  /* ── Auth token: set when Clerk signs in (Clerk manages refresh) */
  async function setSession(clerkJwt) {
    if (!_client) return;
    /* Supabase session is externally managed by Clerk — pass a stable
       placeholder as refresh_token so Supabase does not attempt its own
       refresh cycle with the same JWT. Real token refresh happens when
       auth-clerk.js calls setSession() again after Clerk rotates. */
    await _client.auth.setSession({ access_token: clerkJwt, refresh_token: 'clerk-managed' });
  }

  /* ── Generic error logger ────────────────────────────────────── */
  function _err(label, error) {
    console.error(`[OmicsLab DB] ${label}:`, error?.message || error);
  }

  /* ════════════════════════════════════════════════════════════════
     USERS
  ═══════════════════════════════════════════════════════════════ */

  async function upsertUser(profile) {
    /* Always write to localStorage as primary */
    try { localStorage.setItem('omicslab_user', JSON.stringify(profile)); } catch {}

    if (!_ready) return { ok: true, source: 'local' };
    const { error } = await _client.from('users').upsert(profile, { onConflict: 'clerk_id' });
    if (error) { _err('upsertUser', error); return { ok: false, error }; }
    return { ok: true, source: 'cloud' };
  }

  /* Explicit column list, NOT '*' — `email` has SELECT revoked for the
     anon/authenticated roles (see db/schema.sql), so `select('*')`
     would fail with a permission error for every caller, including
     reading your own row. */
  const USER_COLUMNS = 'id,clerk_id,name,avatar_url,institution,country,role,plan,username,display_name,github_username,bio,is_public,created_at,updated_at';

  async function getUser(clerkId) {
    if (!_ready) {
      const local = _localUser();
      return { ok: true, data: local, source: 'local' };
    }
    const { data, error } = await _client.from('users').select(USER_COLUMNS).eq('clerk_id', clerkId).single();
    if (error) { _err('getUser', error); return { ok: false, error }; }
    return { ok: true, data, source: 'cloud' };
  }

  function _localUser() {
    try { return JSON.parse(localStorage.getItem('omicslab_user') || 'null'); } catch { return null; }
  }

  /* ════════════════════════════════════════════════════════════════
     PROGRESS (badges, curriculum, XP, streaks)
  ═══════════════════════════════════════════════════════════════ */

  const PROGRESS_KEY = 'omicslab_progress_v2';

  function _localProgress() {
    try { return JSON.parse(localStorage.getItem(PROGRESS_KEY) || '[]'); } catch { return []; }
  }

  async function saveProgress(userId, type, key, value = {}) {
    /* Local first */
    const local = _localProgress();
    const idx = local.findIndex(p => p.type === type && p.key === key);
    const entry = { type, key, value, earned_at: new Date().toISOString() };
    if (idx >= 0) local[idx] = entry; else local.push(entry);
    try { localStorage.setItem(PROGRESS_KEY, JSON.stringify(local)); } catch {}

    if (!_ready || !userId) return { ok: true, source: 'local' };
    const { error } = await _client.from('progress').upsert(
      { user_id: userId, type, key, value, earned_at: entry.earned_at },
      { onConflict: 'user_id,type,key' }
    );
    if (error) { _err('saveProgress', error); return { ok: false, error }; }
    return { ok: true, source: 'cloud' };
  }

  async function getProgress(userId) {
    if (!_ready || !userId) {
      return { ok: true, data: _localProgress(), source: 'local' };
    }
    const { data, error } = await _client.from('progress').select('*').eq('user_id', userId).order('earned_at', { ascending: false });
    if (error) { _err('getProgress', error); return { ok: false, error }; }
    /* Merge into localStorage */
    try { localStorage.setItem(PROGRESS_KEY, JSON.stringify(data)); } catch {}
    return { ok: true, data, source: 'cloud' };
  }

  /* ════════════════════════════════════════════════════════════════
     LAB RESULTS
  ═══════════════════════════════════════════════════════════════ */

  const RESULTS_KEY = 'omicslab_results_v2';

  async function saveLabResult(userId, result) {
    /* Local first */
    const local = _localResults();
    local.unshift({ ...result, completed_at: new Date().toISOString() });
    if (local.length > 100) local.length = 100;
    try { localStorage.setItem(RESULTS_KEY, JSON.stringify(local)); } catch {}

    if (!_ready || !userId) return { ok: true, source: 'local' };
    const { error } = await _client.from('lab_results').insert({
      user_id:       userId,
      workflow_id:   result.workflow_id,
      workflow_name: result.workflow_name,
      score:         result.score,
      grade:         result.grade,
      quality:       result.quality || {},
      mistakes:      result.mistakes || [],
      elapsed_secs:  result.elapsed_secs,
    });
    if (error) { _err('saveLabResult', error); return { ok: false, error }; }
    return { ok: true, source: 'cloud' };
  }

  function _localResults() {
    try { return JSON.parse(localStorage.getItem(RESULTS_KEY) || '[]'); } catch { return []; }
  }

  async function getLabResults(userId, limit = 50) {
    if (!_ready || !userId) {
      return { ok: true, data: _localResults().slice(0, limit), source: 'local' };
    }
    const { data, error } = await _client.from('lab_results')
      .select('*').eq('user_id', userId)
      .order('completed_at', { ascending: false }).limit(limit);
    if (error) { _err('getLabResults', error); return { ok: false, error }; }
    return { ok: true, data, source: 'cloud' };
  }

  /* ════════════════════════════════════════════════════════════════
     NOTEBOOK ENTRIES
  ═══════════════════════════════════════════════════════════════ */

  const NOTEBOOK_KEY = 'omicslab_notebook_v2';

  function _localNotebook() {
    try { return JSON.parse(localStorage.getItem(NOTEBOOK_KEY) || '[]'); } catch { return []; }
  }

  async function saveNotebookEntry(userId, entry) {
    const id = entry.id || ('nb_' + Date.now().toString(36));
    const record = { ...entry, id, updated_at: new Date().toISOString() };

    /* Local */
    const local = _localNotebook();
    const idx = local.findIndex(e => e.id === id);
    if (idx >= 0) local[idx] = record; else local.unshift(record);
    try { localStorage.setItem(NOTEBOOK_KEY, JSON.stringify(local)); } catch {}

    if (!_ready || !userId) return { ok: true, data: record, source: 'local' };
    const { data, error } = await _client.from('notebook_entries').upsert({ ...record, user_id: userId }, { onConflict: 'id' }).select().single();
    if (error) { _err('saveNotebookEntry', error); return { ok: false, error }; }
    return { ok: true, data, source: 'cloud' };
  }

  async function getNotebookEntries(userId) {
    if (!_ready || !userId) return { ok: true, data: _localNotebook(), source: 'local' };
    const { data, error } = await _client.from('notebook_entries')
      .select('*').eq('user_id', userId)
      .order('updated_at', { ascending: false });
    if (error) { _err('getNotebookEntries', error); return { ok: false, error }; }
    try { localStorage.setItem(NOTEBOOK_KEY, JSON.stringify(data)); } catch {}
    return { ok: true, data, source: 'cloud' };
  }

  async function deleteNotebookEntry(userId, id) {
    const local = _localNotebook().filter(e => e.id !== id);
    try { localStorage.setItem(NOTEBOOK_KEY, JSON.stringify(local)); } catch {}
    if (!_ready || !userId) return { ok: true, source: 'local' };
    const { error } = await _client.from('notebook_entries').delete().eq('id', id).eq('user_id', userId);
    if (error) { _err('deleteNotebookEntry', error); return { ok: false, error }; }
    return { ok: true, source: 'cloud' };
  }

  /* ════════════════════════════════════════════════════════════════
     CITATIONS
  ═══════════════════════════════════════════════════════════════ */

  const CITATIONS_KEY = 'omicslab_citations_v2';

  function _localCitations() {
    try { return JSON.parse(localStorage.getItem(CITATIONS_KEY) || '[]'); } catch { return []; }
  }

  async function saveCitation(userId, citation) {
    const id = citation.id || ('cit_' + Date.now().toString(36));
    const record = { ...citation, id, saved_at: citation.saved_at || new Date().toISOString() };

    const local = _localCitations();
    if (!local.find(c => c.id === id)) local.unshift(record);
    try { localStorage.setItem(CITATIONS_KEY, JSON.stringify(local)); } catch {}

    if (!_ready || !userId) return { ok: true, source: 'local' };
    const { error } = await _client.from('citations').upsert({ ...record, user_id: userId }, { onConflict: 'id' });
    if (error) { _err('saveCitation', error); return { ok: false, error }; }
    return { ok: true, source: 'cloud' };
  }

  async function getCitations(userId) {
    if (!_ready || !userId) return { ok: true, data: _localCitations(), source: 'local' };
    const { data, error } = await _client.from('citations')
      .select('*').eq('user_id', userId)
      .order('saved_at', { ascending: false });
    if (error) { _err('getCitations', error); return { ok: false, error }; }
    try { localStorage.setItem(CITATIONS_KEY, JSON.stringify(data)); } catch {}
    return { ok: true, data, source: 'cloud' };
  }

  /* ════════════════════════════════════════════════════════════════
     LEADERBOARD
  ═══════════════════════════════════════════════════════════════ */

  async function getLeaderboard(limit = 50) {
    if (!_ready) return { ok: true, data: [], source: 'local' };
    const { data, error } = await _client.from('leaderboard')
      .select('display_name,country,total_score,workflows_done,streak_days,badges_count')
      .order('total_score', { ascending: false })
      .limit(limit);
    if (error) { _err('getLeaderboard', error); return { ok: false, error }; }
    return { ok: true, data, source: 'cloud' };
  }

  async function updateLeaderboard(userId, stats) {
    if (!_ready || !userId) return { ok: true, source: 'local' };
    const { error } = await _client.from('leaderboard').upsert({ user_id: userId, ...stats, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
    if (error) { _err('updateLeaderboard', error); return { ok: false, error }; }
    return { ok: true, source: 'cloud' };
  }

  /* ════════════════════════════════════════════════════════════════
     SYNC: push localStorage → Supabase on sign-in
  ═══════════════════════════════════════════════════════════════ */

  async function syncOnSignIn(userId) {
    if (!_ready || !userId) return;

    /* Sync progress */
    const localProgress = _localProgress();
    if (localProgress.length) {
      const rows = localProgress.map(p => ({ ...p, user_id: userId }));
      await _client.from('progress').upsert(rows, { onConflict: 'user_id,type,key' });
    }

    /* Sync lab results (last 20 only) */
    const localResults = _localResults().slice(0, 20);
    if (localResults.length) {
      const rows = localResults.map(r => ({ ...r, user_id: userId }));
      await _client.from('lab_results').upsert(rows, { onConflict: 'id' }).catch(() => {});
    }

    /* Sync notebook */
    const localNotes = _localNotebook();
    if (localNotes.length) {
      const rows = localNotes.map(n => ({ ...n, user_id: userId }));
      await _client.from('notebook_entries').upsert(rows, { onConflict: 'id' }).catch(() => {});
    }

    /* Sync citations */
    const localCitations = _localCitations();
    if (localCitations.length) {
      const rows = localCitations.map(c => ({ ...c, user_id: userId }));
      await _client.from('citations').upsert(rows, { onConflict: 'id' }).catch(() => {});
    }
  }

  /* ── Public API ─────────────────────────────────────────────── */
  return {
    init, setSession, syncOnSignIn,
    /* Users */
    upsertUser, getUser,
    /* Progress */
    saveProgress, getProgress,
    /* Lab results */
    saveLabResult, getLabResults,
    /* Notebook */
    saveNotebookEntry, getNotebookEntries, deleteNotebookEntry,
    /* Citations */
    saveCitation, getCitations,
    /* Leaderboard */
    getLeaderboard, updateLeaderboard,
    /* Internal */
    get isReady() { return _ready; },
    get client() { return _client; },
  };

})();
