/* ═══════════════════════════════════════════════════════════════
   OmicsLab — PWA 2.0 (Prompt 57)
   ─ beforeinstallprompt → custom install modal
   ─ Re-engagement screen for returning users
   ─ Cmd+K / Ctrl+K command palette
   ─ Web Share API + clipboard fallback
   ─ App Badging API for notification count
   ─ Periodic Background Sync registration
   ─ Share target handler (#/share)
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.PWA = (function () {

  let _installPrompt = null;
  let _installed = false;
  let _lastInteraction = Date.now();

  /* ─── Install banner ─── */
  function _buildBanner() {
    if (document.getElementById('pwa-install-banner')) return;
    const div = document.createElement('div');
    div.id = 'pwa-install-banner';
    div.className = 'pwa-banner';
    div.setAttribute('role', 'banner');
    div.innerHTML = `
      <div class="pwa-banner-inner">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
        <span class="pwa-banner-text">Add OmicsLab to your home screen for the full offline experience</span>
        <button class="pwa-banner-install btn btn-primary" id="pwa-banner-install-btn" type="button">Install</button>
        <button class="pwa-banner-close" id="pwa-banner-close-btn" type="button" aria-label="Dismiss">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>`;

    div.querySelector('#pwa-banner-install-btn').onclick = _triggerInstall;
    div.querySelector('#pwa-banner-close-btn').onclick = _dismissBanner;
    document.body.insertBefore(div, document.body.firstChild);
    _injectStyles();
  }

  function _showBanner() {
    const banner = document.getElementById('pwa-install-banner');
    if (banner) banner.style.display = '';
  }

  function _dismissBanner() {
    const banner = document.getElementById('pwa-install-banner');
    if (banner) banner.style.display = 'none';
    try { localStorage.setItem('omicslab_pwa_dismissed', Date.now()); } catch {}
  }

  async function _triggerInstall() {
    if (!_installPrompt) return;
    _installPrompt.prompt();
    const { outcome } = await _installPrompt.userChoice;
    if (outcome === 'accepted') {
      _installed = true;
      _dismissBanner();
      OmicsLab.Notify?.success('OmicsLab installed — offline-ready!');
    }
    _installPrompt = null;
  }

  /* ─── Web Share API ─── */
  async function share(opts = {}) {
    const data = {
      title: opts.title || 'OmicsLab — Africa\'s Omics Training Platform',
      text:  opts.text  || 'Interactive omics training for African researchers',
      url:   opts.url   || location.href,
    };
    if (navigator.share) {
      try {
        await navigator.share(data);
        return true;
      } catch (e) {
        if (e.name !== 'AbortError') {
          _fallbackShare(data);
        }
        return false;
      }
    }
    _fallbackShare(data);
    return false;
  }

  function _fallbackShare(data) {
    const text = `${data.title}\n${data.url}`;
    try {
      navigator.clipboard.writeText(text);
      OmicsLab.Notify?.success('Link copied to clipboard');
    } catch {
      OmicsLab.Notify?.info(`Share: ${data.url}`);
    }
  }

  /* ─── App Badging API ─── */
  function setBadge(count) {
    if ('setAppBadge' in navigator) {
      if (count > 0) {
        navigator.setAppBadge(count).catch(() => {});
      } else {
        navigator.clearAppBadge().catch(() => {});
      }
    }
  }

  /* ─── Periodic Background Sync ─── */
  async function _registerPeriodicSync() {
    if (!('serviceWorker' in navigator) || !('periodicSync' in (await navigator.serviceWorker.ready))) return;
    try {
      const sw = await navigator.serviceWorker.ready;
      await sw.periodicSync.register('outbreak-check', { minInterval: 4 * 60 * 60 * 1000 });
    } catch {} /* Permission may be denied — graceful fail */
  }

  /* ─── Handle share target ─── */
  function _handleShareTarget() {
    const hash = location.hash;
    if (!hash.startsWith('#/share')) return;
    const params = new URLSearchParams(location.search);
    const title = params.get('title') || '';
    const text  = params.get('text')  || '';
    const url   = params.get('url')   || '';
    const compose = [title, text, url].filter(Boolean).join('\n');
    if (!compose) return;
    /* Navigate to Nexus with pre-filled composer */
    setTimeout(() => {
      OmicsLab.Router?.navigate('nexus');
      setTimeout(() => {
        const input = document.querySelector('.nx-input, .nx-composer-input, textarea[data-nx-compose]');
        if (input) { input.value = compose; input.focus(); }
      }, 300);
    }, 200);
  }

  function _injectStyles() {
    if (document.getElementById('pwa-styles')) return;
    const s = document.createElement('style');
    s.id = 'pwa-styles';
    s.textContent = `
      .pwa-banner{
        position:fixed;bottom:0;left:0;right:0;
        z-index:var(--z-fixed,500);
        background:var(--bg-surface,#111B2E);
        border-top:1px solid var(--green,#00C4A0);
        transform:translateY(0);
        animation:pwa-slide-up .3s var(--ease-out,ease) both;
      }
      @keyframes pwa-slide-up{from{transform:translateY(100%)}to{transform:translateY(0)}}
      .pwa-banner-inner{
        max-width:900px;margin:0 auto;
        display:flex;align-items:center;gap:.75rem;
        padding:.65rem 1rem;
        color:var(--text-secondary,#A8A098);
        font-size:.82rem;
      }
      .pwa-banner-text{flex:1;line-height:1.4}
      .pwa-banner-install{font-size:.78rem;padding:.3rem .75rem;white-space:nowrap}
      .pwa-banner-close{
        display:flex;align-items:center;justify-content:center;
        width:28px;height:28px;
        background:none;border:none;cursor:pointer;
        color:var(--text-muted,#A8A098);border-radius:4px;
        flex-shrink:0;
      }
      .pwa-banner-close:hover{background:var(--bg-overlay,#182236)}
      @media(max-width:700px){
        .pwa-banner{bottom:56px} /* above mobile tab bar */
        .pwa-banner-text{font-size:.75rem}
      }
    `;
    document.head.appendChild(s);
  }

  /* ─── Share button helper — call from any tool result panel ─── */
  function buildShareButton(opts = {}) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn btn-ghost btn-sm';
    btn.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg> Share`;
    btn.onclick = () => share(opts);
    return btn;
  }

  /* ─── Init ─── */
  function init() {
    /* Capture install prompt */
    window.addEventListener('beforeinstallprompt', e => {
      e.preventDefault();
      _installPrompt = e;
      /* Don't show if dismissed in last 7 days */
      try {
        const dismissed = parseInt(localStorage.getItem('omicslab_pwa_dismissed') || '0', 10);
        if (Date.now() - dismissed < 7 * 24 * 60 * 60 * 1000) return;
      } catch {}
      _buildBanner();
      _showBanner();
    });

    /* Track install */
    window.addEventListener('appinstalled', () => {
      _installed = true;
      _dismissBanner();
      OmicsLab.Notify?.success('OmicsLab is now installed and offline-ready!');
      try { localStorage.setItem('omicslab_pwa_installed', '1'); } catch {}
    });

    /* Handle share target on load */
    _handleShareTarget();

    /* Re-engagement screen — disabled */
    // _checkReEngagement();

    /* Command palette (Cmd+K / Ctrl+K) */
    _initCommandPalette();

    /* Register periodic sync */
    _registerPeriodicSync();

    /* Track last user interaction so we know if it's safe to auto-reload */
    const _touch = () => { _lastInteraction = Date.now(); };
    ['click', 'keydown', 'scroll', 'touchstart', 'mousemove'].forEach(ev =>
      document.addEventListener(ev, _touch, { passive: true, capture: true })
    );

    /* Genuine SW updates are detected and reported by js/app.js (via the
       registration lifecycle, which can tell a real new version apart
       from a first-ever install) — it calls _handleUpdateAvailable()
       directly rather than this module listening for a broadcast. */
  }

  /* Called only when js/app.js has confirmed an already-controlling
     service worker was just replaced by a newly-installed one — i.e. a
     real update, never a first install.
       - Idle ≥ 4 s → auto-reload (user won't lose work)
       - Active      → show banner so user can choose when */
  function _handleUpdateAvailable() {
    if (Date.now() - _lastInteraction >= 4000) {
      window.location.reload();
    } else {
      _showUpdateBanner();
    }
  }

  function _showUpdateBanner() {
    if (document.getElementById('pwa-update-banner')) return;

    /* Persist in notification centre so the user can see it later */
    OmicsLab.Notifications?.add(
      'OmicsLab updated',
      'A new version has been deployed. Reload to get the latest tools and fixes.',
      { cat: 'update' }
    );

    const div = document.createElement('div');
    div.id = 'pwa-update-banner';
    div.setAttribute('role', 'status');
    div.setAttribute('aria-live', 'polite');
    div.style.cssText = [
      'position:fixed;bottom:0;left:0;right:0;z-index:9000',
      'display:flex;align-items:center;justify-content:space-between;gap:.75rem',
      'background:var(--bg-surface,#111B2E);border-top:2px solid var(--accent,#00C4A0)',
      'padding:.65rem 1.25rem calc(.65rem + env(safe-area-inset-bottom,0px)) 1.25rem',
      'font-size:.82rem;color:var(--text-secondary,#A8A098);font-family:inherit',
      'animation:_ub-slide .25s ease both',
      'box-shadow:0 -4px 24px rgba(0,196,160,.12)',
    ].join(';');
    div.innerHTML = `
      <style>@keyframes _ub-slide{from{transform:translateY(100%)}to{transform:none}}</style>
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#00C4A0" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/></svg>
      <span style="flex:1">
        <strong style="color:var(--accent,#00C4A0)">Update ready</strong>
        — OmicsLab has new tools and fixes waiting.
      </span>
      <div style="display:flex;gap:.5rem;flex-shrink:0">
        <button onclick="window.location.reload()" style="background:var(--accent,#00C4A0);color:#060A14;border:none;border-radius:6px;padding:.3rem .8rem;font-size:.78rem;font-weight:700;cursor:pointer;letter-spacing:.01em">
          Reload now
        </button>
        <button onclick="document.getElementById('pwa-update-banner').remove()" aria-label="Dismiss update banner" style="background:none;border:1px solid var(--border-default,#182236);color:var(--text-muted,#A8A098);border-radius:6px;padding:.3rem .55rem;font-size:.78rem;cursor:pointer;display:flex;align-items:center">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>`;

    /* Sit above mobile tab bar */
    const mobileNav = document.querySelector('.mobile-nav-bar, [class*="mobile-tab"]');
    if (mobileNav) div.style.bottom = '56px';

    document.body.appendChild(div);

    /* Auto-dismiss after 30 s if user hasn't interacted */
    setTimeout(() => document.getElementById('pwa-update-banner')?.remove(), 30000);
  }

  /* ══════════════════════════════════════════════════════════════
     RE-ENGAGEMENT SCREEN
     Shows a "Welcome back" overlay after ≥3 days of absence
     ══════════════════════════════════════════════════════════════ */
  function _checkReEngagement() {
    const LAST_KEY = 'omicslab_last_visit';
    const SEEN_KEY = 'omicslab_reengaged';
    try {
      const last = parseInt(localStorage.getItem(LAST_KEY) || '0', 10);
      const seen = parseInt(localStorage.getItem(SEEN_KEY) || '0', 10);
      const now  = Date.now();
      localStorage.setItem(LAST_KEY, now);
      const gap = now - last;
      if (!last || gap < 3 * 24 * 60 * 60 * 1000) return;   /* < 3 days — skip */
      if (now - seen < 7 * 24 * 60 * 60 * 1000) return;     /* shown within 7 days — skip */
      localStorage.setItem(SEEN_KEY, now);
      const days = Math.floor(gap / (24 * 60 * 60 * 1000));
      setTimeout(() => _showReEngageScreen(days), 1500);
    } catch {}
  }

  function _showReEngageScreen(days) {
    if (document.getElementById('pwa-reengage')) return;
    const overlay = document.createElement('div');
    overlay.id = 'pwa-reengage';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Welcome back to OmicsLab');
    overlay.style.cssText = `position:fixed;inset:0;z-index:7000;background:rgba(8,12,16,.88);display:flex;align-items:center;justify-content:center;backdrop-filter:blur(4px)`;

    const xp = (() => { try { const s = JSON.parse(localStorage.getItem('omicslab_xp_v1')||'{}'); return s.total||0; } catch { return 0; } })();
    overlay.innerHTML = `
      <div style="background:var(--bg-surface,#111B2E);border:1px solid var(--border,#243048);border-radius:12px;padding:2rem;max-width:420px;width:92%;text-align:center">
        <div style="font-size:2.4rem;margin-bottom:.75rem">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#00C4A0" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
        </div>
        <h2 style="font-size:1.25rem;font-weight:700;color:var(--text-primary,#E4DDD2);margin:0 0 .5rem">Welcome back!</h2>
        <p style="color:var(--text-secondary,#A8A098);font-size:.9rem;margin:0 0 1rem">You've been away for <strong style="color:var(--text-primary)">${days} day${days !== 1 ? 's' : ''}</strong>. Your XP total: <strong style="color:#e3b341">${xp} XP</strong>.</p>
        <p style="color:var(--text-muted,#6E6860);font-size:.8rem;margin:0 0 1.5rem">Ready to pick up where you left off?</p>
        <div style="display:flex;gap:.75rem;justify-content:center;flex-wrap:wrap">
          <button onclick="OmicsLab.Router?.navigate('skill-tree');document.getElementById('pwa-reengage').remove()" style="background:var(--green,#00C4A0);color:#000;border:none;border-radius:7px;padding:.5rem 1.25rem;font-size:.85rem;font-weight:700;cursor:pointer">View Skill Tree</button>
          <button onclick="OmicsLab.Router?.navigate('lab');document.getElementById('pwa-reengage').remove()" style="background:var(--bg-overlay,#182236);color:var(--text-primary,#E4DDD2);border:1px solid var(--border,#243048);border-radius:7px;padding:.5rem 1.25rem;font-size:.85rem;cursor:pointer">Go to Lab</button>
          <button onclick="document.getElementById('pwa-reengage').remove()" style="background:none;border:none;cursor:pointer;color:var(--text-muted,#6E6860);font-size:.78rem;text-decoration:underline">Dismiss</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
  }

  /* ══════════════════════════════════════════════════════════════
     COMMAND PALETTE (Cmd+K / Ctrl+K)
     Quick-jump to any page with keyboard
     ══════════════════════════════════════════════════════════════ */
  const _CP_PAGES = [
    { label: 'Lab Simulator',     page: 'lab',              icon: 'beaker' },
    { label: 'Skill Tree',        page: 'skill-tree',       icon: 'zap' },
    { label: 'Analysis Studio',   page: 'analysis',         icon: 'bar-chart' },
    { label: 'Variant Atlas',     page: 'variant-atlas',    icon: 'dna' },
    { label: 'Clinical Decision', page: 'clinical-decision',icon: 'activity' },
    { label: 'One Health',        page: 'one-health',       icon: 'globe' },
    { label: 'Institution',       page: 'institution',      icon: 'users' },
    { label: 'Nexus',             page: 'nexus',            icon: 'message-circle' },
    { label: 'Outbreak Game',     page: 'outbreak',         icon: 'virus' },
    { label: 'Mentorship',        page: 'mentorship',       icon: 'link' },
    { label: 'AI Assistant',      page: 'ai',               icon: 'brain' },
    { label: 'Certification',     page: 'certification',    icon: 'award' },
    { label: 'Knowledge Graph',   page: 'knowledge-graph',  icon: 'git-branch' },
    { label: 'Settings',          page: 'settings',         icon: 'cpu' },
    { label: 'Impact',            page: 'impact',           icon: 'globe' },
  ];

  let _cpOpen = false;

  function _openCommandPalette() {
    if (_cpOpen) return;
    _cpOpen = true;
    const overlay = document.createElement('div');
    overlay.id = 'pwa-cmdpal';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Command palette');
    overlay.style.cssText = `position:fixed;inset:0;z-index:8000;background:rgba(8,12,16,.8);backdrop-filter:blur(4px);display:flex;align-items:flex-start;justify-content:center;padding-top:12vh`;
    overlay.innerHTML = `
      <div style="background:var(--bg-surface,#111B2E);border:1px solid var(--border,#243048);border-radius:12px;width:min(560px,94vw);overflow:hidden;box-shadow:0 24px 60px #000a">
        <div style="display:flex;align-items:center;gap:.6rem;padding:.75rem 1rem;border-bottom:1px solid var(--border,#243048)">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted,#A8A098)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input id="pwa-cp-input" type="text" placeholder="Navigate to..." autocomplete="off" style="flex:1;background:none;border:none;outline:none;color:var(--text-primary,#E4DDD2);font-size:.95rem" autofocus>
          <kbd style="background:var(--bg-overlay,#182236);border:1px solid var(--border,#243048);border-radius:4px;padding:.1rem .35rem;font-size:.7rem;color:var(--text-muted,#A8A098)">Esc</kbd>
        </div>
        <ul id="pwa-cp-list" role="listbox" style="list-style:none;margin:0;padding:.4rem 0;max-height:360px;overflow-y:auto"></ul>
      </div>`;
    document.body.appendChild(overlay);

    const input = overlay.querySelector('#pwa-cp-input');
    const list  = overlay.querySelector('#pwa-cp-list');
    let _sel = 0;

    function _render(query) {
      const q = query.toLowerCase();
      const filtered = _CP_PAGES.filter(p => p.label.toLowerCase().includes(q));
      list.innerHTML = filtered.map((p, i) => `
        <li role="option" aria-selected="${i === _sel}" data-page="${p.page}"
          style="padding:.6rem 1rem;cursor:pointer;display:flex;align-items:center;gap:.75rem;font-size:.9rem;color:var(--text-${i===_sel?'primary':'secondary'},${i===_sel?'#E4DDD2':'#A8A098'});background:${i===_sel?'var(--bg-overlay,#182236)':'transparent'}">
          <span style="color:var(--text-muted,#6E6860);font-size:.75rem">${p.label}</span>
        </li>`).join('');
      list.querySelectorAll('li').forEach(li => {
        li.onmouseenter = () => { _sel = [...list.children].indexOf(li); _render(input.value); };
        li.onclick = () => _nav(li.dataset.page);
      });
    }

    function _nav(page) { overlay.remove(); _cpOpen = false; OmicsLab.Router?.navigate(page); }

    _render('');
    input.addEventListener('input', () => { _sel = 0; _render(input.value); });
    input.addEventListener('keydown', e => {
      const items = list.querySelectorAll('li');
      if (e.key === 'ArrowDown') { _sel = Math.min(_sel + 1, items.length - 1); _render(input.value); e.preventDefault(); }
      if (e.key === 'ArrowUp')   { _sel = Math.max(_sel - 1, 0); _render(input.value); e.preventDefault(); }
      if (e.key === 'Enter')     { const sel = list.querySelector(`li:nth-child(${_sel + 1})`); if (sel) _nav(sel.dataset.page); }
      if (e.key === 'Escape')    { overlay.remove(); _cpOpen = false; }
    });
    overlay.addEventListener('click', e => { if (e.target === overlay) { overlay.remove(); _cpOpen = false; } });
  }

  function _initCommandPalette() {
    document.addEventListener('keydown', e => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); _openCommandPalette(); }
    });
  }

  return { init, share, setBadge, buildShareButton, openCommandPalette: _openCommandPalette, _handleUpdateAvailable };
})();
