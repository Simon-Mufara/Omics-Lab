/* ═══════════════════════════════════════════════════════════════
   OmicsLab — PWA Install, Share & Native Features (Prompt 31)
   ─ beforeinstallprompt → install banner
   ─ Web Share API helper
   ─ App Badging API for notification count
   ─ Periodic Background Sync registration
   ─ Share target handler (#/share)
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.PWA = (function () {

  let _installPrompt = null;
  let _installed = false;

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
        background:var(--bg-surface,#161b22);
        border-top:1px solid var(--green,#3fb950);
        transform:translateY(0);
        animation:pwa-slide-up .3s var(--ease-out,ease) both;
      }
      @keyframes pwa-slide-up{from{transform:translateY(100%)}to{transform:translateY(0)}}
      .pwa-banner-inner{
        max-width:900px;margin:0 auto;
        display:flex;align-items:center;gap:.75rem;
        padding:.65rem 1rem;
        color:var(--text-secondary,#c9d1d9);
        font-size:.82rem;
      }
      .pwa-banner-text{flex:1;line-height:1.4}
      .pwa-banner-install{font-size:.78rem;padding:.3rem .75rem;white-space:nowrap}
      .pwa-banner-close{
        display:flex;align-items:center;justify-content:center;
        width:28px;height:28px;
        background:none;border:none;cursor:pointer;
        color:var(--text-muted,#8b949e);border-radius:4px;
        flex-shrink:0;
      }
      .pwa-banner-close:hover{background:var(--bg-overlay,#21262d)}
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

    /* Register periodic sync */
    _registerPeriodicSync();

    /* SW update message → show banner */
    navigator.serviceWorker?.addEventListener('message', e => {
      if (e.data?.type === 'SW_UPDATED') {
        _showUpdateBanner();
      }
    });
  }

  function _showUpdateBanner() {
    if (document.getElementById('pwa-update-banner')) return;
    const div = document.createElement('div');
    div.id = 'pwa-update-banner';
    div.style.cssText = `position:fixed;top:56px;left:0;right:0;z-index:6000;background:#1a4731;border-bottom:1px solid var(--green,#3fb950);padding:.5rem 1rem;display:flex;align-items:center;gap:.75rem;font-size:.8rem;color:var(--text-primary,#e6edf3)`;
    div.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/></svg>
      <span style="flex:1">OmicsLab has been updated.</span>
      <button onclick="window.location.reload()" style="background:var(--green,#3fb950);color:#000;border:none;border-radius:5px;padding:.25rem .65rem;font-size:.75rem;font-weight:700;cursor:pointer">Reload</button>
      <button onclick="this.closest('#pwa-update-banner').remove()" style="background:none;border:none;cursor:pointer;color:var(--text-muted,#8b949e);padding:0 4px">✕</button>`;
    document.body.appendChild(div);
  }

  return { init, share, setBadge, buildShareButton };
})();
