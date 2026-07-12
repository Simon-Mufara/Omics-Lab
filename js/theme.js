/* ═══════════════════════════════════════════════════════════════
   OmicsLab — Theme Toggle (Prompt 20)
   ─ dark / light / system  stored in localStorage as omicslab_theme
   ─ Injects sun/moon/monitor button into nav-right at init
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.Theme = (function () {

  const KEY = 'omicslab_theme';

  /* The three possible stored values */
  const MODES = ['system', 'dark', 'light'];

  /* ─── SVG icons ─── */
  const ICONS = {
    dark: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`,
    light: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`,
    system: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`,
  };

  const LABELS = { dark: 'Dark theme', light: 'Light theme', system: 'System theme' };

  /* ─── Current resolved theme (what is actually applied) ─── */
  function _systemIsDark() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  function getStored() {
    return localStorage.getItem(KEY) || 'dark';
  }

  function getResolved() {
    const stored = getStored();
    if (stored === 'system') return _systemIsDark() ? 'dark' : 'light';
    return stored;
  }

  /* ─── Apply theme to <html> ─── */
  function apply(mode) {
    const prev = getStored();
    localStorage.setItem(KEY, mode);
    const resolved = mode === 'system' ? ((_systemIsDark() ? 'dark' : 'light')) : mode;
    document.documentElement.dataset.theme = resolved;
    _updateButton(mode);
    /* Let settings page know if it's open */
    OmicsLab.Settings?._syncTheme?.();
    if (prev !== mode) {
      OmicsLab.Notify?.info?.(`Switched to ${LABELS[mode]}`, { ttl: 1800 });
    }
  }

  /* ─── Cycle through modes ─── */
  function cycle() {
    const current = getStored();
    const next = MODES[(MODES.indexOf(current) + 1) % MODES.length];
    apply(next);
  }

  /* ─── Update button icon + label ─── */
  function _updateButton(mode) {
    const btn = document.getElementById('theme-toggle-btn');
    if (!btn) return;
    btn.innerHTML = ICONS[mode];
    btn.title = LABELS[mode] + ' (click to cycle)';
    btn.setAttribute('aria-label', LABELS[mode]);
  }

  /* ─── Inject button into nav-right before settings btn ─── */
  function _injectButton() {
    if (document.getElementById('theme-toggle-btn')) return;
    const btn = document.createElement('button');
    btn.id = 'theme-toggle-btn';
    btn.className = 'nav-icon-btn nav-theme-btn';
    btn.type = 'button';
    btn.onclick = cycle;
    const mode = getStored();
    btn.innerHTML = ICONS[mode];
    btn.title = LABELS[mode] + ' (click to cycle)';
    btn.setAttribute('aria-label', LABELS[mode]);

    /* Insert before settings button */
    const settingsBtn = document.querySelector('.nav-settings-btn');
    if (settingsBtn) {
      settingsBtn.parentNode.insertBefore(btn, settingsBtn);
    } else {
      const navRight = document.getElementById('nav-right');
      if (navRight) navRight.appendChild(btn);
    }

    _injectStyles();
  }

  function _injectStyles() {
    if (document.getElementById('theme-toggle-styles')) return;
    const s = document.createElement('style');
    s.id = 'theme-toggle-styles';
    s.textContent = `
      .nav-theme-btn{
        display:flex;align-items:center;justify-content:center;
        width:32px;height:32px;
        background:none;border:1px solid transparent;
        border-radius:6px;cursor:pointer;
        color:var(--text-secondary,#A8A098);
        transition:background .15s,border-color .15s,color .15s;
        flex-shrink:0;
      }
      .nav-theme-btn:hover{
        background:var(--bg-overlay,#182236);
        border-color:var(--border-muted,#243048);
        color:var(--text-primary,#E4DDD2);
      }
      .nav-theme-btn:active{background:var(--bg-inset,#0D1524)}
    `;
    document.head.appendChild(s);
  }

  /* ─── Listen to OS-level preference change ─── */
  function _watchSystem() {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (getStored() === 'system') {
        document.documentElement.dataset.theme = _systemIsDark() ? 'dark' : 'light';
      }
    });
  }

  /* ─── Init ─── */
  function init() {
    const mode = getStored();
    const resolved = mode === 'system' ? (_systemIsDark() ? 'dark' : 'light') : mode;
    document.documentElement.dataset.theme = resolved;
    _injectButton();
    _watchSystem();
  }

  return { init, apply, cycle, getStored, getResolved };
})();
