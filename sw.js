/* OmicsLab Service Worker — offline-first app shell */
const CACHE = 'omicslab-v3';
const SHELL = [
  '/Omics-Lab/',
  '/Omics-Lab/index.html',
  '/Omics-Lab/css/app.css',
  '/Omics-Lab/css/equipment.css',
  '/Omics-Lab/js/icons.js',
  '/Omics-Lab/js/workflows.js',
  '/Omics-Lab/js/diseases.js',
  '/Omics-Lab/js/gallery.js',
  '/Omics-Lab/js/equipment.js',
  '/Omics-Lab/js/engine.js',
  '/Omics-Lab/js/bench.js',
  '/Omics-Lab/js/app.js',
  '/Omics-Lab/manifest.json',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  /* Cache-first for app shell; network-first for Wikimedia images */
  if (e.request.url.includes('wikimedia.org')) {
    e.respondWith(
      fetch(e.request).catch(() => caches.match(e.request))
    );
    return;
  }
  e.respondWith(
    caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
      if (res.ok && e.request.method === 'GET') {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
      }
      return res;
    }))
  );
});
