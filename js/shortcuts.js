/* ═══════════════════════════════════════════════════════════════
   OmicsLab — Keyboard Shortcuts (#14)
   ? → cheat sheet modal
   G H / G L / G A / G T / G R / G S → navigate pages
   / → open global search
   Esc → close modals
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.Shortcuts = (function () {

  let _gBuffer = false; // waiting for second key after 'g'
  let _gTimer  = null;

  const NAV_MAP = {
    h: 'home', l: 'lab', a: 'africa', t: 'terminal',
    r: 'research', s: 'study', v: 'variantinterp',
    q: 'ask', p: 'profile', g: 'guide',
  };

  const SHEET = [
    { group: 'Navigation (press G then…)',
      items: [
        { key: 'G H', desc: 'Go Home' },
        { key: 'G L', desc: 'Go Lab Simulations' },
        { key: 'G A', desc: 'Go Africa Hub' },
        { key: 'G T', desc: 'Go Terminal' },
        { key: 'G R', desc: 'Go Research' },
        { key: 'G S', desc: 'Go Study Pack' },
        { key: 'G V', desc: 'Go Variant Interpreter' },
        { key: 'G Q', desc: 'Go Ask / FAQ' },
      ]},
    { group: 'Actions',
      items: [
        { key: '/', desc: 'Open search' },
        { key: '?', desc: 'Show this help' },
        { key: 'Esc', desc: 'Close modal / menu' },
        { key: 'Ctrl K', desc: 'Open search (alternative)' },
      ]},
    { group: 'In Study Pack',
      items: [
        { key: 'F', desc: 'Flashcard mode' },
        { key: 'E', desc: 'Export notes' },
      ]},
    { group: 'In Variant Interpreter',
      items: [
        { key: 'Enter', desc: 'Interpret variant' },
        { key: 'Ctrl R', desc: 'Generate AI report' },
      ]},
  ];

  function _onKey(e) {
    const tag = (e.target.tagName || '').toLowerCase();
    const inField = tag === 'input' || tag === 'textarea' || tag === 'select' || e.target.isContentEditable;

    /* Esc always works */
    if (e.key === 'Escape') {
      _clearGBuffer();
      OmicsLab.Auth?.closeModal();
      _closeSheet();
      return;
    }

    if (inField) return;

    /* ? → shortcut cheat sheet */
    if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      _toggleSheet();
      return;
    }

    /* / → search */
    if (e.key === '/' && !e.ctrlKey) {
      e.preventDefault();
      OmicsLab.Search?.open();
      return;
    }

    /* Ctrl+K → search */
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      OmicsLab.Search?.open();
      return;
    }

    /* Ctrl+R in variantinterp → AI report */
    if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
      const btn = document.getElementById('vi-ai-report-btn');
      if (btn) { e.preventDefault(); btn.click(); }
      return;
    }

    /* G-chord navigation */
    if (e.key.toLowerCase() === 'g' && !e.ctrlKey && !e.metaKey && !_gBuffer) {
      _gBuffer = true;
      clearTimeout(_gTimer);
      _gTimer = setTimeout(_clearGBuffer, 1200);
      return;
    }

    if (_gBuffer) {
      _clearGBuffer();
      const dest = NAV_MAP[e.key.toLowerCase()];
      if (dest) {
        e.preventDefault();
        OmicsLab.Router?.navigate(dest);
      }
      return;
    }

    /* F in study pack → flashcard mode */
    if (e.key.toLowerCase() === 'f') {
      const studyEl = document.getElementById('study-section');
      if (studyEl && studyEl.style.display !== 'none') {
        OmicsLab.StudyPack?.openFlashcards?.();
      }
    }

    /* E in study pack → export */
    if (e.key.toLowerCase() === 'e') {
      const studyEl = document.getElementById('study-section');
      if (studyEl && studyEl.style.display !== 'none') {
        OmicsLab.StudyPack?.exportNotes?.();
      }
    }
  }

  function _clearGBuffer() {
    _gBuffer = false;
    clearTimeout(_gTimer);
  }

  /* ── Cheat sheet modal ── */
  let _sheetOpen = false;

  function _toggleSheet() {
    _sheetOpen ? _closeSheet() : _openSheet();
  }

  function _openSheet() {
    _sheetOpen = true;
    let overlay = document.getElementById('sc-shortcut-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'sc-shortcut-overlay';
      overlay.style.cssText = 'position:fixed;inset:0;background:rgba(1,4,9,.75);backdrop-filter:blur(4px);z-index:9000;display:flex;align-items:center;justify-content:center;padding:1rem;animation:sc-fade .15s ease';
      overlay.onclick = e => { if (e.target === overlay) _closeSheet(); };
      document.body.appendChild(overlay);
    }
    overlay.style.display = 'flex';
    overlay.innerHTML = `
      <style>
        @keyframes sc-fade { from{opacity:0;transform:scale(.97)} to{opacity:1;transform:none} }
        .sc-sheet { background:#111B2E;border:1px solid #243048;border-radius:14px;padding:1.5rem;max-width:560px;width:100%;max-height:85vh;overflow-y:auto;box-shadow:0 24px 64px rgba(0,0,0,.6) }
        .sc-sheet-header { display:flex;align-items:center;justify-content:space-between;margin-bottom:1.25rem }
        .sc-sheet-title { font-size:1rem;font-weight:700;color:#E4DDD2 }
        .sc-sheet-close { background:none;border:none;color:#A8A098;cursor:pointer;padding:.25rem;border-radius:4px;display:flex;align-items:center }
        .sc-sheet-close:hover{color:#E4DDD2;background:#182236}
        .sc-group { margin-bottom:1.25rem }
        .sc-group-label { font-size:.65rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#A8A098;margin-bottom:.6rem;border-bottom:1px solid #182236;padding-bottom:.3rem }
        .sc-item { display:flex;align-items:center;gap:.75rem;padding:.3rem 0 }
        .sc-key { display:inline-flex;gap:.2rem;flex-shrink:0 }
        .sc-kbd { display:inline-block;background:#182236;border:1px solid #243048;border-radius:4px;padding:.1rem .4rem;font-family:monospace;font-size:.72rem;color:#A8A098;box-shadow:0 1px 0 rgba(0,0,0,.4) }
        .sc-desc { font-size:.8rem;color:#A8A098 }
        @media(max-width:540px){.sc-sheet{border-radius:10px 10px 0 0;margin-bottom:0;max-height:80vh}}
      </style>
      <div class="sc-sheet" role="dialog" aria-label="Keyboard shortcuts">
        <div class="sc-sheet-header">
          <span class="sc-sheet-title">Keyboard Shortcuts</span>
          <button class="sc-sheet-close" onclick="OmicsLab.Shortcuts.close()" aria-label="Close">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        ${SHEET.map(g => `
          <div class="sc-group">
            <div class="sc-group-label">${g.group}</div>
            ${g.items.map(i => `
              <div class="sc-item">
                <span class="sc-key">${i.key.split(' ').map(k => `<kbd class="sc-kbd">${k}</kbd>`).join('')}</span>
                <span class="sc-desc">${i.desc}</span>
              </div>`).join('')}
          </div>`).join('')}
        <div style="margin-top:.5rem;font-size:.68rem;color:#354060;border-top:1px solid #182236;padding-top:.75rem">
          Tip: Shortcuts are disabled while typing in a text field.
        </div>
      </div>`;
  }

  function _closeSheet() {
    _sheetOpen = false;
    const overlay = document.getElementById('sc-shortcut-overlay');
    if (overlay) overlay.style.display = 'none';
  }

  function init() {
    document.addEventListener('keydown', _onKey);
  }

  return { init, close: _closeSheet, open: _openSheet };
})();
