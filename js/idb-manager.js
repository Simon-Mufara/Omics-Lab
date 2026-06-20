/* ═══════════════════════════════════════════════════════════════
   OmicsLab — IndexedDB Manager v2 (Prompt 54: Progressive Data Sync)
   ─ Multi-store IDB: files, notes, progress, cache
   ─ Full export/import as JSON bundle (FAIR-compatible)
   ─ BroadcastChannel cross-tab sync
   ─ localStorage-to-IDB migration helper
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.IDB = (function () {
  const DB_NAME    = 'OmicsLabFiles';
  const DB_VERSION = 2;
  const STORES = { files: 'files', notes: 'notes', progress: 'progress', cache: 'ol_cache' };
  let _db = null;

  /* ── BroadcastChannel cross-tab sync ── */
  const _ch = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('omicslab_sync') : null;
  const _listeners = {};

  if (_ch) {
    _ch.onmessage = ({ data }) => {
      if (data && data.type && _listeners[data.type]) {
        _listeners[data.type].forEach(fn => fn(data.payload));
      }
    };
  }

  function onSync(type, fn) {
    if (!_listeners[type]) _listeners[type] = [];
    _listeners[type].push(fn);
  }

  function _broadcast(type, payload) {
    if (_ch) _ch.postMessage({ type, payload });
  }

  /* ── Open / upgrade DB ── */
  function _open() {
    if (_db) return Promise.resolve(_db);
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = e => {
        const db = e.target.result;
        /* files store (v1 compat) */
        if (!db.objectStoreNames.contains(STORES.files)) {
          const fs = db.createObjectStore(STORES.files, { keyPath: 'id' });
          fs.createIndex('name', 'name', { unique: false });
          fs.createIndex('type', 'type', { unique: false });
        }
        /* notes store — lab notebook entries */
        if (!db.objectStoreNames.contains(STORES.notes)) {
          const ns = db.createObjectStore(STORES.notes, { keyPath: 'id' });
          ns.createIndex('updatedAt', 'updatedAt', { unique: false });
          ns.createIndex('tags', 'tags', { unique: false, multiEntry: true });
        }
        /* progress store — XP snapshots, skill states, study plan progress */
        if (!db.objectStoreNames.contains(STORES.progress)) {
          db.createObjectStore(STORES.progress, { keyPath: 'key' });
        }
        /* cache store — AI responses, offline content */
        if (!db.objectStoreNames.contains(STORES.cache)) {
          const cs = db.createObjectStore(STORES.cache, { keyPath: 'key' });
          cs.createIndex('expiresAt', 'expiresAt', { unique: false });
        }
      };
      req.onsuccess = e => { _db = e.target.result; resolve(_db); };
      req.onerror  = e => reject(e.target.error);
    });
  }

  /* ── Generic store helpers ── */
  function _put(storeName, record) {
    return _open().then(db => new Promise((resolve, reject) => {
      const tx  = db.transaction(storeName, 'readwrite');
      const req = tx.objectStore(storeName).put(record);
      req.onsuccess = () => resolve();
      req.onerror   = e => reject(e.target.error);
    }));
  }

  function _get(storeName, key) {
    return _open().then(db => new Promise((resolve, reject) => {
      const tx  = db.transaction(storeName, 'readonly');
      const req = tx.objectStore(storeName).get(key);
      req.onsuccess = e => resolve(e.target.result);
      req.onerror   = e => reject(e.target.error);
    }));
  }

  function _getAll(storeName) {
    return _open().then(db => new Promise((resolve, reject) => {
      const tx  = db.transaction(storeName, 'readonly');
      const req = tx.objectStore(storeName).getAll();
      req.onsuccess = e => resolve(e.target.result);
      req.onerror   = e => reject(e.target.error);
    }));
  }

  function _delete(storeName, key) {
    return _open().then(db => new Promise((resolve, reject) => {
      const tx  = db.transaction(storeName, 'readwrite');
      const req = tx.objectStore(storeName).delete(key);
      req.onsuccess = () => resolve();
      req.onerror   = e => reject(e.target.error);
    }));
  }

  function _clear(storeName) {
    return _open().then(db => new Promise((resolve, reject) => {
      const tx  = db.transaction(storeName, 'readwrite');
      const req = tx.objectStore(storeName).clear();
      req.onsuccess = () => resolve();
      req.onerror   = e => reject(e.target.error);
    }));
  }

  /* ══════════════════════════════════════════════════════════════
     FILES API (v1 compat)
     ══════════════════════════════════════════════════════════════ */
  function put(id, name, type, data) {
    const record = { id, name, type, data, size: data?.byteLength || data?.size || 0, savedAt: Date.now() };
    return _put(STORES.files, record).then(() => _broadcast('file_saved', { id, name, type }));
  }

  function get(id)     { return _get(STORES.files, id); }
  function remove(id)  { return _delete(STORES.files, id).then(() => _broadcast('file_removed', { id })); }
  function clearAll()  { return _clear(STORES.files); }

  function list() {
    return _getAll(STORES.files).then(rows =>
      rows.map(r => ({ id: r.id, name: r.name, type: r.type, size: r.size, savedAt: r.savedAt }))
    );
  }

  /* ══════════════════════════════════════════════════════════════
     NOTES API — persistent lab notebook entries in IDB
     ══════════════════════════════════════════════════════════════ */
  const Notes = {
    save(note) {
      note.updatedAt = Date.now();
      return _put(STORES.notes, note).then(() => _broadcast('note_saved', { id: note.id }));
    },
    get(id)      { return _get(STORES.notes, id); },
    getAll()     { return _getAll(STORES.notes); },
    delete(id)   { return _delete(STORES.notes, id).then(() => _broadcast('note_deleted', { id })); },
    clearAll()   { return _clear(STORES.notes); },
  };

  /* ══════════════════════════════════════════════════════════════
     PROGRESS API — XP / skill / study-plan snapshots
     ══════════════════════════════════════════════════════════════ */
  const Progress = {
    save(key, value) { return _put(STORES.progress, { key, value, savedAt: Date.now() }).then(() => _broadcast('progress_saved', { key })); },
    get(key)         { return _get(STORES.progress, key).then(r => r?.value); },
    getAll()         { return _getAll(STORES.progress); },
    delete(key)      { return _delete(STORES.progress, key); },
    clearAll()       { return _clear(STORES.progress); },
  };

  /* ══════════════════════════════════════════════════════════════
     CACHE API — offline AI responses, cached fetches
     ══════════════════════════════════════════════════════════════ */
  const Cache = {
    set(key, value, ttlMs = 24 * 60 * 60 * 1000) {
      return _put(STORES.cache, { key, value, savedAt: Date.now(), expiresAt: Date.now() + ttlMs });
    },
    get(key) {
      return _get(STORES.cache, key).then(r => {
        if (!r) return null;
        if (r.expiresAt && r.expiresAt < Date.now()) { _delete(STORES.cache, key); return null; }
        return r.value;
      });
    },
    delete(key) { return _delete(STORES.cache, key); },
    clearExpired() {
      return _getAll(STORES.cache).then(rows => {
        const now = Date.now();
        return Promise.all(rows.filter(r => r.expiresAt && r.expiresAt < now).map(r => _delete(STORES.cache, r.key)));
      });
    },
  };

  /* ══════════════════════════════════════════════════════════════
     EXPORT — full data bundle as JSON
     ══════════════════════════════════════════════════════════════ */
  function exportBundle() {
    return Promise.all([list(), Notes.getAll(), Progress.getAll()]).then(([files, notes, progress]) => {
      /* Collect relevant localStorage keys */
      const LS_KEYS = [
        'omicslab_xp_v1','omicslab_skills_v1','omicslab_last_active',
        'omicslab_credentials','omicslab_study_plan_v1',
        'omicslab_institution_v1','omicslab_cohort_students_v1',
      ];
      const ls = {};
      LS_KEYS.forEach(k => { const v = localStorage.getItem(k); if (v) ls[k] = v; });

      const bundle = {
        schemaVersion: '2.0',
        exportedAt: new Date().toISOString(),
        platform: 'OmicsLab Simulator',
        files: files.map(f => ({ ...f, data: undefined })), /* exclude binary data */
        notes,
        progress,
        localStorage: ls,
      };

      const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `omicslab-export-${Date.now()}.json`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      return bundle;
    });
  }

  /* ══════════════════════════════════════════════════════════════
     IMPORT — restore from JSON bundle
     ══════════════════════════════════════════════════════════════ */
  function importBundle(jsonText) {
    let bundle;
    try { bundle = JSON.parse(jsonText); } catch { return Promise.reject(new Error('Invalid JSON')); }
    if (!bundle.schemaVersion) return Promise.reject(new Error('Not an OmicsLab export bundle'));

    const tasks = [];

    /* Restore notes */
    if (Array.isArray(bundle.notes)) {
      bundle.notes.forEach(n => tasks.push(Notes.save(n)));
    }

    /* Restore progress */
    if (Array.isArray(bundle.progress)) {
      bundle.progress.forEach(p => tasks.push(Progress.save(p.key, p.value)));
    }

    /* Restore localStorage keys */
    if (bundle.localStorage) {
      Object.entries(bundle.localStorage).forEach(([k, v]) => localStorage.setItem(k, v));
    }

    return Promise.all(tasks).then(() => {
      _broadcast('bundle_imported', { schemaVersion: bundle.schemaVersion });
      OmicsLab.Toast?.show('Data restored from bundle', 'success');
      return bundle;
    });
  }

  /* ══════════════════════════════════════════════════════════════
     MIGRATION — copy existing localStorage XP/skill data → IDB progress
     ══════════════════════════════════════════════════════════════ */
  function migrateFromLocalStorage() {
    const keys = ['omicslab_xp_v1', 'omicslab_skills_v1', 'omicslab_study_plan_v1'];
    const tasks = keys.map(k => {
      const v = localStorage.getItem(k);
      return v ? Progress.save(k, v) : Promise.resolve();
    });
    return Promise.all(tasks);
  }

  /* ── Storage quota ── */
  function estimateUsage() {
    if (navigator.storage && navigator.storage.estimate) {
      return navigator.storage.estimate().then(est => ({
        used: est.usage || 0, quota: est.quota || 0,
        pct: est.quota ? ((est.usage / est.quota) * 100).toFixed(1) : '?',
      }));
    }
    return Promise.resolve({ used: 0, quota: 0, pct: '?' });
  }

  /* ── Public API ── */
  return {
    /* Files (v1 compat) */
    put, get, list, remove, clearAll,
    /* Extended stores */
    Notes, Progress, Cache,
    /* Sync */
    onSync, _broadcast,
    /* Data portability */
    exportBundle, importBundle, migrateFromLocalStorage,
    /* Utility */
    estimateUsage,
  };
})();
