/* ═══════════════════════════════════════════════════════════════
   OmicsLab — Offline Indicator Banner (Prompt 14)
   ─ Listens to navigator.onLine / online / offline events
   ─ Shows a slim banner when offline; dismisses on reconnect
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.OfflineIndicator = (function () {
  let _bar = null;
  let _isOnline = navigator.onLine;

  function _injectStyles() {
    if (document.getElementById('oi-styles')) return;
    const s = document.createElement('style');
    s.id = 'oi-styles';
    s.textContent = `
      #oi-bar{position:fixed;top:56px;left:0;right:0;z-index:4999;
        background:#1c1f23;border-bottom:1px solid #243048;
        padding:.38rem 1rem;display:flex;align-items:center;gap:.55rem;
        font-size:.78rem;color:#A8A098;
        transform:translateY(-100%);transition:transform .25s ease;pointer-events:none}
      #oi-bar.oi-show{transform:none;pointer-events:all}
      .oi-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;background:#ff6b6b}
      .oi-dot.oi-online{background:#00C4A0;animation:oi-pulse 1.5s ease-in-out 3}
      .oi-msg{flex:1}
      .oi-detail{font-size:.7rem;color:#A8A098}
      .oi-close{background:none;border:none;color:#A8A098;cursor:pointer;padding:.1rem .3rem;border-radius:4px;pointer-events:all}
      .oi-close:hover{background:#182236;color:#E4DDD2}
      @keyframes oi-pulse{0%,100%{opacity:1}50%{opacity:.4}}
    `;
    document.head.appendChild(s);
  }

  function _ensureBar() {
    if (_bar) return;
    _bar = document.createElement('div');
    _bar.id = 'oi-bar';
    _bar.setAttribute('role', 'status');
    _bar.setAttribute('aria-live', 'polite');
    document.body.appendChild(_bar);
  }

  function _showOffline() {
    _ensureBar();
    _bar.innerHTML = `
      <span class="oi-dot"></span>
      <span class="oi-msg">
        <strong>You're offline</strong>
        <span class="oi-detail"> — OmicsLab is cached and fully functional. Data-dependent tools will use offline fallbacks.</span>
      </span>
      <button class="oi-close" onclick="OmicsLab.OfflineIndicator.dismiss()" aria-label="Dismiss">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>`;
    requestAnimationFrame(() => _bar.classList.add('oi-show'));
    OmicsLab.Notifications?.add(
      'Offline Mode Active',
      'OmicsLab is fully cached. All tools work without internet. Data-dependent features use offline fallbacks.',
      { cat: 'system', link: null }
    );
  }

  /* No "Back online" banner — it sat fixed under the header and
     interrupted the page every time connectivity flapped (including
     spurious online/offline events from WebSocket reconnects, sleep/
     wake, flaky wifi), which happens often enough during real use that
     it read as a recurring UI glitch rather than useful information.
     Silently dismiss whatever offline banner might be showing instead. */
  function _showBackOnline() {
    dismiss();
  }

  function dismiss() {
    _bar?.classList.remove('oi-show');
  }

  function init() {
    _injectStyles();

    window.addEventListener('offline', () => {
      _isOnline = false;
      _showOffline();
    });

    window.addEventListener('online', () => {
      _isOnline = true;
      _showBackOnline();
    });

    /* Show immediately if already offline */
    if (!navigator.onLine) _showOffline();
  }

  return { init, dismiss };
})();
