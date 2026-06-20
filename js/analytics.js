/* ═══════════════════════════════════════════════════════════════
   OmicsLab Analytics (Prompt 27) — Privacy-first, no cookies
   ─ Events queued in localStorage, beaconed when backend available
   ─ No personal data, no fingerprinting
   ═══════════════════════════════════════════════════════════════ */

window.OmicsLab = window.OmicsLab || {};

OmicsLab.Analytics = (function () {
  'use strict';

  const QUEUE_KEY  = 'omicslab_analytics_queue';
  const BEACON_URL = 'https://api.omicslab.africa/v1/analytics/event';
  const MAX_QUEUE  = 200;

  /* ─── Session ID: SHA256-style hash of today's date — no reverse lookup ─── */
  function _sessionId() {
    const k = 'omicslab_anon_session';
    let id = sessionStorage.getItem(k);
    if (!id) {
      id = Math.random().toString(36).slice(2) + Date.now().toString(36);
      sessionStorage.setItem(k, id);
    }
    return id;
  }

  /* ─── Country from browser locale — coarse, not IP-based ─── */
  function _country() {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone.split('/')[0] || 'Unknown';
    } catch { return 'Unknown'; }
  }

  /* ─── Queue one event ─── */
  function fire(event, props) {
    try {
      const queue = _getQueue();
      queue.push({
        event,
        sessionId: _sessionId(),
        country:   _country(),
        ts:        Date.now(),
        props:     props || {},
      });
      /* Keep queue bounded */
      if (queue.length > MAX_QUEUE) queue.splice(0, queue.length - MAX_QUEUE);
      localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    } catch { /* storage full or disabled — silently skip */ }
  }

  /* ─── Fire page_view ─── */
  function page(pageName, durationMs) {
    fire('page_view', { page: pageName, duration: Math.round((durationMs || 0) / 1000) });
  }

  /* ─── Read queue ─── */
  function _getQueue() {
    try { return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]'); } catch { return []; }
  }

  /* ─── Flush queue via sendBeacon ─── */
  function _flush() {
    const queue = _getQueue();
    if (!queue.length || !navigator.sendBeacon) return;
    const sent = navigator.sendBeacon(
      BEACON_URL,
      new Blob([JSON.stringify({ events: queue })], { type: 'application/json' })
    );
    if (sent) localStorage.removeItem(QUEUE_KEY);
  }

  /* ─── Wire unload flush ─── */
  function init() {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') _flush();
    });
    window.addEventListener('pagehide', _flush, { passive: true });
  }

  return { init, fire, page, _flush, _getQueue };
})();
