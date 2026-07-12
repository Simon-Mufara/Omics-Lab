/* ═══════════════════════════════════════════════════════════════
   OmicsLab — Shared safety utilities
   Guards localStorage reads/writes and module init calls so that
   one corrupted key or one throwing module can never cascade into
   a half-rendered app (the root cause of "hard refresh breaks the
   page" — a deploy can change what shape a key holds while
   localStorage itself is never cleared by a refresh).
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.Utils = (function () {

  /* Parse a JSON value out of localStorage. On any failure (missing
     key, corrupted/old-shaped JSON, localStorage blocked in private
     mode) return `fallback` and drop the bad key so it can't keep
     failing on every future load. */
  function safeParse(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return fallback;
      return JSON.parse(raw);
    } catch (e) {
      console.warn('[Utils] safeParse: bad value for "' + key + '", resetting', e);
      try { localStorage.removeItem(key); } catch (e2) {}
      return fallback;
    }
  }

  /* Write a JSON value to localStorage. Swallows quota-exceeded /
     private-mode errors rather than throwing into caller code. */
  function safeSet(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.warn('[Utils] safeSet: could not persist "' + key + '"', e);
      return false;
    }
  }

  /* Run a module init function in isolation. A throw here is logged
     (and reported to Sentry if loaded) but never propagates, so the
     rest of the boot sequence in index.html keeps running even if
     one module fails. */
  function safeInit(name, fn) {
    try {
      fn();
    } catch (e) {
      console.error('[Utils] init failed: ' + name, e);
      try { window.Sentry?.captureException?.(e); } catch (e2) {}
    }
  }

  return { safeParse, safeSet, safeInit };
})();
