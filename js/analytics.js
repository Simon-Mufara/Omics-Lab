/* ═══════════════════════════════════════════════════════════════
   OmicsLab Analytics — PostHog + local queue fallback
   Same public API (fire, page) — drop-in replacement.
   PostHog loads from CDN when key is configured in config.js.
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.Analytics = (function () {
  'use strict';

  const QUEUE_KEY = 'omicslab_analytics_queue';
  const MAX_QUEUE = 200;

  let _ph       = null;   /* posthog instance */
  let _ready    = false;
  let _userId   = null;

  /* ── Init PostHog ─────────────────────────────────────────────  */
  function init() {
    const cfg = window.OMICSLAB_CONFIG;
    const key  = cfg?.posthogKey;
    const host = cfg?.posthogHost || 'https://app.posthog.com';

    if (key && window.posthog) {
      window.posthog.init(key, {
        api_host:             host,
        autocapture:          false,   /* manual event capture only */
        capture_pageview:     false,   /* we fire page events manually */
        persistence:          'localStorage+cookie',
        disable_session_recording: false,
        loaded: (ph) => {
          _ph    = ph;
          _ready = true;
          _flushLocalQueue();
        },
      });
    }

    /* Flush local queue on page hide */
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') _flushLocalQueue();
    });
    window.addEventListener('pagehide', _flushLocalQueue, { passive: true });
  }

  /* ── Identify user (call on sign-in) ─────────────────────────  */
  function identify(userId, traits = {}) {
    _userId = userId;
    if (_ph) {
      _ph.identify(userId, traits);
    }
  }

  function reset() {
    _userId = null;
    if (_ph) _ph.reset();
  }

  /* ── Core event capture ───────────────────────────────────────  */
  function fire(event, props = {}) {
    const payload = {
      event,
      ts:        Date.now(),
      sessionId: _sessionId(),
      country:   _country(),
      props,
    };

    if (_ready && _ph) {
      /* PostHog is live — capture immediately */
      _ph.capture(event, { ...props, session_id: payload.sessionId, region: payload.country });
    } else {
      /* Queue for later flush */
      _enqueue(payload);
    }
  }

  /* ── Page views ───────────────────────────────────────────────  */
  function page(pageName, durationMs) {
    fire('page_view', { page: pageName, duration_secs: Math.round((durationMs || 0) / 1000) });
  }

  /* ── OmicsLab-specific tracked events ────────────────────────  */
  function trackWorkflowComplete(workflowId, score, grade) {
    fire('workflow_completed', { workflow: workflowId, score, grade });
  }

  function trackBadgeEarned(badgeId) {
    fire('badge_earned', { badge: badgeId });
  }

  function trackOnboardingStep(step, role) {
    fire('onboarding_step', { step, role: role || null });
  }

  function trackSearch(query, resultCount) {
    fire('search', { query_length: query?.length || 0, results: resultCount });
  }

  function trackFeatureUsed(feature) {
    fire('feature_used', { feature });
  }

  /* ── Funnels (PostHog group analytics) ───────────────────────  */
  function startFunnel(name) {
    fire(`funnel_${name}_start`);
  }

  function completeFunnel(name) {
    fire(`funnel_${name}_complete`);
  }

  /* ── Local queue helpers ──────────────────────────────────────  */
  function _enqueue(payload) {
    try {
      const q = _getQueue();
      q.push(payload);
      if (q.length > MAX_QUEUE) q.splice(0, q.length - MAX_QUEUE);
      localStorage.setItem(QUEUE_KEY, JSON.stringify(q));
    } catch {}
  }

  function _flushLocalQueue() {
    if (!_ready || !_ph) return;
    const q = _getQueue();
    if (!q.length) return;
    q.forEach(p => {
      _ph.capture(p.event, { ...p.props, session_id: p.sessionId, region: p.country, queued_at: p.ts });
    });
    localStorage.removeItem(QUEUE_KEY);
  }

  function _getQueue() {
    try { return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]'); } catch { return []; }
  }

  /* ── Helpers ──────────────────────────────────────────────────  */
  function _sessionId() {
    const k = 'omicslab_anon_session';
    let id = sessionStorage.getItem(k);
    if (!id) { id = Math.random().toString(36).slice(2) + Date.now().toString(36); sessionStorage.setItem(k, id); }
    return id;
  }

  function _country() {
    try { return Intl.DateTimeFormat().resolvedOptions().timeZone.split('/')[0] || 'Unknown'; } catch { return 'Unknown'; }
  }

  return {
    init, identify, reset,
    fire, page,
    trackWorkflowComplete, trackBadgeEarned, trackOnboardingStep,
    trackSearch, trackFeatureUsed, startFunnel, completeFunnel,
    _getQueue,
  };

})();
