/* ═══════════════════════════════════════════════════════════════
   OmicsLab — Progress Export / Import
   Allows students to back up and restore all their progress
   across devices or after clearing browser storage.
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.Progress = (function () {

  const MODAL_ID = 'progress-modal-overlay';

  /* ─── Collect all OmicsLab localStorage keys ─── */
  function _snapshot() {
    const data = { _version: 3, _exported: new Date().toISOString(), keys: {} };
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith('omicslab')) {
          data.keys[k] = localStorage.getItem(k);
        }
      }
    } catch {}
    return data;
  }

  /* ─── Count progress items ─── */
  function _stats() {
    const snap = _snapshot();
    const keys = Object.keys(snap.keys);
    let badges = 0, lessons = 0, workflows = 0, lang = 'en';
    keys.forEach(k => {
      if (k.includes('badge')) badges++;
      if (k.includes('lesson') || k.includes('curriculum')) lessons++;
      if (k.includes('workflow') || k.includes('completed_wf')) workflows++;
      if (k === 'omicslab_lang_v2') lang = snap.keys[k];
    });
    return { total: keys.length, badges, lessons, workflows, lang };
  }

  /* ─── Export as downloadable JSON ─── */
  function exportProgress() {
    const data = _snapshot();
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `omicslab-progress-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    _showToast('Progress exported successfully! Keep this file safe.');
  }

  /* ─── Import from JSON file ─── */
  function importProgress(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (e) {
      try {
        const data = JSON.parse(e.target.result);
        if (!data.keys || typeof data.keys !== 'object') throw new Error('Invalid file format');
        let count = 0;
        Object.entries(data.keys).forEach(([k, v]) => {
          if (k.startsWith('omicslab')) {
            localStorage.setItem(k, v);
            count++;
          }
        });
        _showToast(`✓ ${count} progress items restored! Reloading...`);
        setTimeout(() => location.reload(), 1800);
      } catch {
        _showToast('⚠ Could not read file — make sure it is a valid OmicsLab export.', true);
      }
    };
    reader.readAsText(file);
  }

  /* ─── Clear all progress (with confirmation) ─── */
  function clearProgress() {
    if (!confirm('Are you sure? This will permanently delete ALL your OmicsLab progress, badges, and certificates.')) return;
    try {
      const toRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith('omicslab')) toRemove.push(k);
      }
      toRemove.forEach(k => localStorage.removeItem(k));
    } catch {}
    _showToast('Progress cleared. Reloading...', true);
    setTimeout(() => location.reload(), 1800);
  }

  /* ─── Toast notification ─── */
  function _showToast(msg, isWarn = false) {
    let t = document.getElementById('progress-toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'progress-toast';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.className = 'progress-toast' + (isWarn ? ' warn' : '');
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3500);
  }

  /* ─── Render modal ─── */
  function _renderModal() {
    const stats = _stats();
    return `
      <div class="progress-modal" role="dialog" aria-modal="true" aria-labelledby="progress-modal-title">
        <div class="pm-header">
          <div class="pm-title" id="progress-modal-title">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"/>
              <path d="M12 8V12L15 15"/>
            </svg>
            My Progress
          </div>
          <button class="pm-close" onclick="OmicsLab.Progress.closeModal()" aria-label="Close">✕</button>
        </div>

        <div class="pm-body">
          <!-- Stats grid -->
          <div class="pm-stats-grid">
            <div class="pm-stat">
              <div class="pm-stat-num">${stats.total}</div>
              <div class="pm-stat-label">Items saved</div>
            </div>
            <div class="pm-stat">
              <div class="pm-stat-num">${stats.badges}</div>
              <div class="pm-stat-label">Badges earned</div>
            </div>
            <div class="pm-stat">
              <div class="pm-stat-num">${stats.workflows}</div>
              <div class="pm-stat-label">Workflows done</div>
            </div>
            <div class="pm-stat">
              <div class="pm-stat-num">${stats.lang.toUpperCase()}</div>
              <div class="pm-stat-label">Language</div>
            </div>
          </div>

          <p class="pm-desc">
            Your progress is saved in this browser. Export it to keep a backup or
            transfer your progress to another device.
          </p>

          <!-- Export -->
          <div class="pm-section">
            <div class="pm-section-title">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Export Progress
            </div>
            <p class="pm-section-desc">Download a JSON backup of all your badges, curriculum progress, and settings.</p>
            <button class="btn-pm-primary" onclick="OmicsLab.Progress.exportProgress()">
              Download Backup File
            </button>
          </div>

          <!-- Import -->
          <div class="pm-section">
            <div class="pm-section-title">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              Restore Progress
            </div>
            <p class="pm-section-desc">Load a previously exported backup file to restore your progress on this device.</p>
            <label class="btn-pm-secondary" role="button" tabindex="0">
              Choose Backup File
              <input type="file" accept=".json,application/json" style="display:none"
                     onchange="OmicsLab.Progress.importProgress(this.files[0])">
            </label>
          </div>

          <!-- Danger zone -->
          <div class="pm-section pm-danger-section">
            <div class="pm-section-title pm-danger-title">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              Reset Everything
            </div>
            <p class="pm-section-desc">Permanently delete all progress, badges, and settings. Export first if you want a backup.</p>
            <button class="btn-pm-danger" onclick="OmicsLab.Progress.clearProgress()">
              Clear All Progress
            </button>
          </div>
        </div>
      </div>`;
  }

  /* ─── Open modal ─── */
  function openModal() {
    let overlay = document.getElementById(MODAL_ID);
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = MODAL_ID;
      overlay.className = 'progress-modal-overlay';
      overlay.setAttribute('role', 'dialog');
      overlay.addEventListener('click', e => {
        if (e.target === overlay) closeModal();
      });
      document.body.appendChild(overlay);
    }
    overlay.innerHTML = _renderModal();
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';

    /* Trap focus */
    const firstFocusable = overlay.querySelector('button');
    if (firstFocusable) firstFocusable.focus();
  }

  /* ─── Close modal ─── */
  function closeModal() {
    const overlay = document.getElementById(MODAL_ID);
    if (overlay) overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  /* ─── Keyboard close ─── */
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });

  return { openModal, closeModal, exportProgress, importProgress, clearProgress };
})();
