/* ═══════════════════════════════════════════════════════
   OmicsLab — IndexedDB Manager (Part 7)
   Utility module for storing large genomic files
   (FASTQ, BAM, VCF) in the browser via IndexedDB.
   Exposes OmicsLab.IDB for other modules to use.
   ═══════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.IDB = (function () {
  const DB_NAME = 'OmicsLabFiles';
  const DB_VERSION = 1;
  const STORE = 'files';
  let _db = null;

  function _open() {
    if (_db) return Promise.resolve(_db);
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = e => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(STORE)) {
          const store = db.createObjectStore(STORE, { keyPath: 'id' });
          store.createIndex('name', 'name', { unique: false });
          store.createIndex('type', 'type', { unique: false });
        }
      };
      req.onsuccess = e => { _db = e.target.result; resolve(_db); };
      req.onerror = e => reject(e.target.error);
    });
  }

  function put(id, name, type, data) {
    return _open().then(db => new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      const req = tx.objectStore(STORE).put({ id, name, type, data, size: data.byteLength || data.size || 0, savedAt: Date.now() });
      req.onsuccess = () => resolve();
      req.onerror = e => reject(e.target.error);
    }));
  }

  function get(id) {
    return _open().then(db => new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readonly');
      const req = tx.objectStore(STORE).get(id);
      req.onsuccess = e => resolve(e.target.result);
      req.onerror = e => reject(e.target.error);
    }));
  }

  function list() {
    return _open().then(db => new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readonly');
      const req = tx.objectStore(STORE).getAll();
      req.onsuccess = e => resolve(e.target.result.map(r => ({ id:r.id, name:r.name, type:r.type, size:r.size, savedAt:r.savedAt })));
      req.onerror = e => reject(e.target.error);
    }));
  }

  function remove(id) {
    return _open().then(db => new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      const req = tx.objectStore(STORE).delete(id);
      req.onsuccess = () => resolve();
      req.onerror = e => reject(e.target.error);
    }));
  }

  function clearAll() {
    return _open().then(db => new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      const req = tx.objectStore(STORE).clear();
      req.onsuccess = () => resolve();
      req.onerror = e => reject(e.target.error);
    }));
  }

  function estimateUsage() {
    if (navigator.storage && navigator.storage.estimate) {
      return navigator.storage.estimate().then(est => ({
        used: est.usage || 0,
        quota: est.quota || 0,
        pct: est.quota ? ((est.usage / est.quota) * 100).toFixed(1) : '?',
      }));
    }
    return Promise.resolve({ used: 0, quota: 0, pct: '?' });
  }

  return { put, get, list, remove, clearAll, estimateUsage };
})();
