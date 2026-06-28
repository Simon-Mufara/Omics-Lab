/* ═══════════════════════════════════════════════════════════════
   OmicsLab Service Worker — Workbox-style manual strategies
   v33: Platform showcase, mobile fixes, offline.html precache, _si() hardened, schema versioning
   ═══════════════════════════════════════════════════════════════ */

const STATIC_CACHE  = 'ol-static-v33';  /* js/ css/ images/ */
const PAGES_CACHE   = 'ol-pages-v2';   /* index.html + offline.html */
const FONTS_CACHE   = 'ol-fonts-v1';   /* Google Fonts — long-lived */

/* Precache offline fallback on install */
const OFFLINE_URL = '/Omics-Lab/offline.html';

const ORIGIN = self.location.origin;

/* ─── Install: precache offline.html, then skip waiting ─── */
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(PAGES_CACHE)
      .then(cache => cache.add(OFFLINE_URL))
      .then(() => self.skipWaiting())
  );
});

/* ─── Activate: delete old caches, claim clients ─── */
self.addEventListener('activate', e => {
  const CURRENT = new Set([STATIC_CACHE, PAGES_CACHE, FONTS_CACHE]);
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => !CURRENT.has(k)).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
      .then(() => self.clients.matchAll({ type: 'window' }))
      .then(clients => clients.forEach(c => c.postMessage({ type: 'SW_UPDATED' })))
  );
});

/* ─── Fetch handler ─── */
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = e.request.url;

  /* 1. Cross-origin Google Fonts CSS → Cache-First (365 days) */
  if (url.startsWith('https://fonts.googleapis.com') ||
      url.startsWith('https://fonts.gstatic.com')) {
    e.respondWith(_cacheFirst(e.request, FONTS_CACHE));
    return;
  }

  /* 2. Cross-origin (CDNs, APIs) → pass through, no caching */
  if (!url.startsWith(ORIGIN)) return;

  /* 3. Auth / API routes → Network-Only (never cache auth data) */
  const path = url.slice(ORIGIN.length);
  if (path.startsWith('/auth/') || path.startsWith('/api/') ||
      path.startsWith('/analytics/')) {
    return; /* let the request pass through unmodified */
  }

  /* 4. index.html → Network-First with 3s timeout; offline.html fallback */
  if (path === '/' || path === '/Omics-Lab/' || path.endsWith('/index.html') ||
      path === '/Omics-Lab' || path === '') {
    e.respondWith(_networkFirstWithOffline(e.request, PAGES_CACHE, 3000));
    return;
  }

  /* 5. JS / CSS / JSON → Stale-While-Revalidate */
  if (path.match(/\.(js|css|json|webmanifest)(\?.*)?$/)) {
    e.respondWith(_staleWhileRevalidate(e.request, STATIC_CACHE));
    return;
  }

  /* 6. Images / fonts / SVG → Cache-First */
  if (path.match(/\.(png|jpg|jpeg|gif|svg|webp|ico|woff2?|ttf|otf)(\?.*)?$/)) {
    e.respondWith(_cacheFirst(e.request, STATIC_CACHE));
    return;
  }

  /* 7. Everything else → Network-First */
  e.respondWith(_networkFirst(e.request, STATIC_CACHE, 5000));
});

/* ─── Stale-While-Revalidate ─── */
async function _staleWhileRevalidate(req, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(req);
  /* Fire revalidation in background regardless */
  const fetchPromise = fetch(req).then(res => {
    if (res && res.ok) cache.put(req, res.clone());
    return res;
  }).catch(() => null);
  /* Return cached immediately, or wait for network if nothing cached */
  return cached || fetchPromise;
}

/* ─── Network-First with timeout fallback ─── */
async function _networkFirst(req, cacheName, timeoutMs) {
  const cache = await caches.open(cacheName);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(req, { signal: controller.signal });
    clearTimeout(timer);
    if (res && res.ok) cache.put(req, res.clone());
    return res;
  } catch {
    clearTimeout(timer);
    const cached = await cache.match(req);
    return cached || Response.error();
  }
}

/* ─── Network-First for index.html with offline.html fallback ─── */
async function _networkFirstWithOffline(req, cacheName, timeoutMs) {
  const cache = await caches.open(cacheName);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(req, { signal: controller.signal });
    clearTimeout(timer);
    if (res && res.ok) cache.put(req, res.clone());
    return res;
  } catch {
    clearTimeout(timer);
    const cached = await cache.match(req);
    if (cached) return cached;
    /* First-time offline — serve precached offline page */
    const offline = await caches.match(OFFLINE_URL);
    return offline || Response.error();
  }
}

/* ─── Cache-First ─── */
async function _cacheFirst(req, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(req);
  if (cached) return cached;
  try {
    const res = await fetch(req);
    if (res && res.ok) cache.put(req, res.clone());
    return res;
  } catch {
    return Response.error();
  }
}

/* ─── Background Sync: flush analytics queue ─── */
self.addEventListener('sync', e => {
  if (e.tag === 'analytics-flush') {
    e.waitUntil(_flushAnalytics());
  }
});

async function _flushAnalytics() {
  try {
    /* Read queued events from IDB (if available) and POST them */
    /* Minimal implementation — full IDB handling in idb-manager.js */
    const clients = await self.clients.matchAll({ type: 'window' });
    clients.forEach(c => c.postMessage({ type: 'ANALYTICS_FLUSH' }));
  } catch {}
}

/* ─── Periodic Background Sync: outbreak alerts every 4h ─── */
self.addEventListener('periodicsync', e => {
  if (e.tag === 'outbreak-check') {
    e.waitUntil(_checkOutbreaks());
  }
});

async function _checkOutbreaks() {
  try {
    const clients = await self.clients.matchAll({ type: 'window' });
    clients.forEach(c => c.postMessage({ type: 'CHECK_OUTBREAKS' }));
  } catch {}
}
