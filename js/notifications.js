/* ═══════════════════════════════════════════════════════════════
   OmicsLab — In-App Notification Centre (Prompt 13)
   ─ Bell icon in nav, badge count, slide-out panel
   ─ Categories: system, badge, research, outbreak, update
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.Notifications = (function () {

  const STORE_KEY = 'omicslab_notifications';
  const MAX_STORED = 60;

  /* ─── Seed notifications on first load ─── */
  const SEED = [
    { id:'n-seed-1', cat:'badge',    title:'Welcome Badge Earned', body:'You opened OmicsLab for the first time. Your "Explorer" badge has been awarded.', ts: Date.now() - 60000*5, read: false, link:'badges' },
    { id:'n-seed-2', cat:'research', title:'H3Africa AWI-Gen Dataset Available', body:'11,011 samples from the H3Africa AWI-Gen cohort are now browsable in the SRA Browser.', ts: Date.now() - 60000*30, read: false, link:'sra' },
    { id:'n-seed-3', cat:'outbreak', title:'Mpox Clade I — DRC Outbreak Update', body:'WHO reports 1,247 new confirmed cases in DRC for epidemiological week 22. Genomic data available.', ts: Date.now() - 3600000*2, read: false, link:'alerts' },
    { id:'n-seed-4', cat:'system',   title:'Offline Mode Active', body:'OmicsLab is cached and works without internet. All 55 tools are available offline.', ts: Date.now() - 3600000*4, read: true,  link:null },
    { id:'n-seed-5', cat:'update',   title:'Platform v46 Deployed', body:'Knowledge Graph, Settings page, global Notify system, and Error boundary are now live.', ts: Date.now() - 3600000*6, read: true,  link:'knowledge-graph' },
  ];

  let _panel = null;
  let _bell = null;
  let _badge = null;
  let _open = false;

  /* ─── Storage ─── */
  function _load() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    const seeded = JSON.parse(JSON.stringify(SEED));
    _save(seeded);
    return seeded;
  }

  function _save(items) {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(items.slice(0, MAX_STORED))); } catch {}
  }

  function _unreadCount() {
    return _load().filter(n => !n.read).length;
  }

  /* ─── Add a notification programmatically ─── */
  function add(title, body, options = {}) {
    const items = _load();
    const n = {
      id: 'n-' + Date.now() + '-' + Math.random().toString(36).slice(2,6),
      cat: options.cat || 'system',
      title,
      body,
      ts: Date.now(),
      read: false,
      link: options.link || null,
    };
    items.unshift(n);
    _save(items);
    _updateBadge();
    if (_open) _renderList();
    return n.id;
  }

  /* ─── Badge ─── */
  function _updateBadge() {
    const count = _unreadCount();
    if (_badge) {
      _badge.textContent = count > 9 ? '9+' : count;
      _badge.style.display = count > 0 ? '' : 'none';
    }
    try { navigator.setAppBadge?.(count); } catch {}
  }

  /* ─── Bell button (injected into nav) ─── */
  function _injectBell() {
    if (document.getElementById('nt-bell-btn')) return;
    const navRight = document.getElementById('nav-right');
    if (!navRight) return;

    const btn = document.createElement('button');
    btn.id = 'nt-bell-btn';
    btn.className = 'nav-notif-btn';
    btn.setAttribute('aria-label', 'Notifications');
    btn.title = 'Notifications';
    btn.innerHTML = `
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
      <span class="nt-bell-badge" id="nt-bell-badge" style="display:none">0</span>`;
    btn.addEventListener('click', toggle);

    /* Insert before the settings button */
    const settingsBtn = navRight.querySelector('.nav-settings-btn');
    if (settingsBtn) navRight.insertBefore(btn, settingsBtn);
    else navRight.prepend(btn);

    _bell = btn;
    _badge = document.getElementById('nt-bell-badge');
    _updateBadge();
  }

  /* ─── Panel ─── */
  function _createPanel() {
    if (_panel) return;
    _panel = document.createElement('div');
    _panel.id = 'nt-panel';
    _panel.className = 'nt-panel';
    _panel.setAttribute('role', 'dialog');
    _panel.setAttribute('aria-label', 'Notifications panel');
    document.body.appendChild(_panel);

    /* Close on outside click */
    document.addEventListener('click', e => {
      if (_open && !_panel.contains(e.target) && !document.getElementById('nt-bell-btn')?.contains(e.target)) close();
    });
  }

  function _renderList() {
    const items = _load();
    const unread = items.filter(n => !n.read).length;
    const CAT_COLOR = { system:'#58a6ff', badge:'#e3b341', research:'#3fb950', outbreak:'#ff6b6b', update:'#bc8cff' };
    const CAT_ICON = {
      system:   '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
      badge:    '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>',
      research: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
      outbreak: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
      update:   '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>',
    };

    _panel.innerHTML = `
      <div class="nt-panel-header">
        <div class="nt-panel-title">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          Notifications
          ${unread > 0 ? `<span class="nt-panel-count">${unread}</span>` : ''}
        </div>
        <div class="nt-panel-actions">
          ${unread > 0 ? `<button class="nt-panel-btn" onclick="OmicsLab.Notifications.markAllRead()">Mark all read</button>` : ''}
          <button class="nt-panel-btn nt-panel-close" onclick="OmicsLab.Notifications.close()" aria-label="Close">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      </div>
      <div class="nt-panel-list">
        ${items.length === 0 ? '<div class="nt-panel-empty">No notifications yet</div>' :
          items.map(n => {
            const col = CAT_COLOR[n.cat] || '#8b949e';
            const icon = CAT_ICON[n.cat] || CAT_ICON.system;
            const ago = _timeAgo(n.ts);
            return `
              <div class="nt-panel-item${n.read ? '' : ' nt-unread'}" data-id="${n.id}"
                   onclick="OmicsLab.Notifications._onItemClick('${n.id}','${n.link||''}')">
                <div class="nt-item-icon" style="color:${col};background:${col}18">${icon}</div>
                <div class="nt-item-body">
                  <div class="nt-item-title">${_esc(n.title)}</div>
                  <div class="nt-item-body-text">${_esc(n.body)}</div>
                  <div class="nt-item-meta">
                    <span class="nt-item-cat" style="color:${col}">${n.cat}</span>
                    <span class="nt-item-ago">${ago}</span>
                  </div>
                </div>
                ${!n.read ? '<div class="nt-item-dot"></div>' : ''}
              </div>`;
          }).join('')
        }
      </div>`;
  }

  function _timeAgo(ts) {
    const s = Math.floor((Date.now() - ts) / 1000);
    if (s < 60) return 'just now';
    if (s < 3600) return Math.floor(s/60) + 'm ago';
    if (s < 86400) return Math.floor(s/3600) + 'h ago';
    return Math.floor(s/86400) + 'd ago';
  }

  function _esc(s) { return String(s||'').replace(/[<>&"']/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&#39;'}[c])); }

  /* ─── Public API ─── */
  function toggle() { _open ? close() : open(); }

  function open() {
    _createPanel();
    _renderList();
    _panel.classList.add('nt-panel-open');
    _open = true;
  }

  function close() {
    _panel?.classList.remove('nt-panel-open');
    _open = false;
  }

  function markAllRead() {
    const items = _load().map(n => ({ ...n, read: true }));
    _save(items);
    _updateBadge();
    _renderList();
  }

  function _onItemClick(id, link) {
    const items = _load().map(n => n.id === id ? { ...n, read: true } : n);
    _save(items);
    _updateBadge();
    if (link) { close(); OmicsLab.Router?.navigate(link); }
    else _renderList();
  }

  function init() {
    _injectBell();
    _injectStyles();
  }

  function _injectStyles() {
    if (document.getElementById('nt-notif-styles')) return;
    const s = document.createElement('style');
    s.id = 'nt-notif-styles';
    s.textContent = `
      .nav-notif-btn{display:flex;align-items:center;justify-content:center;width:32px;height:32px;background:none;border:1px solid transparent;border-radius:7px;color:#6e7681;cursor:pointer;position:relative;transition:background .12s,color .12s,border-color .12s}
      .nav-notif-btn:hover{background:rgba(255,255,255,.06);color:#c9d1d9;border-color:#30363d}
      .nt-bell-badge{position:absolute;top:2px;right:2px;background:#ff6b6b;color:#fff;font-size:9px;font-weight:700;border-radius:99px;padding:0 3px;min-width:14px;height:14px;line-height:14px;text-align:center;pointer-events:none}
      .nt-panel{position:fixed;top:58px;right:1rem;width:340px;max-height:calc(100vh - 80px);background:#161b22;border:1px solid #21262d;border-radius:12px;box-shadow:0 16px 40px rgba(0,0,0,.6);z-index:4500;display:flex;flex-direction:column;overflow:hidden;transform:translateY(-6px) scale(.97);opacity:0;pointer-events:none;transition:transform .2s cubic-bezier(.16,1,.3,1),opacity .2s}
      .nt-panel-open{transform:none;opacity:1;pointer-events:all}
      .nt-panel-header{display:flex;align-items:center;justify-content:space-between;padding:.7rem .9rem;border-bottom:1px solid #21262d;flex-shrink:0}
      .nt-panel-title{display:flex;align-items:center;gap:.4rem;font-size:.85rem;font-weight:700;color:#e6edf3}
      .nt-panel-count{background:#ff6b6b;color:#fff;font-size:.65rem;font-weight:700;border-radius:99px;padding:.05rem .38rem}
      .nt-panel-actions{display:flex;align-items:center;gap:.3rem}
      .nt-panel-btn{background:none;border:none;font-size:.72rem;color:#8b949e;cursor:pointer;padding:.2rem .4rem;border-radius:5px}
      .nt-panel-btn:hover{background:#21262d;color:#e6edf3}
      .nt-panel-close{display:flex;align-items:center;justify-content:center;width:24px;height:24px;padding:0}
      .nt-panel-list{overflow-y:auto;flex:1}
      .nt-panel-empty{text-align:center;padding:2.5rem 1rem;font-size:.8rem;color:#484f58}
      .nt-panel-item{display:flex;align-items:flex-start;gap:.55rem;padding:.65rem .9rem;cursor:pointer;border-bottom:1px solid #21262d;transition:background .1s;position:relative}
      .nt-panel-item:hover{background:#0d1117}
      .nt-panel-item:last-child{border-bottom:none}
      .nt-unread{background:rgba(88,166,255,.03)}
      .nt-item-icon{flex-shrink:0;width:28px;height:28px;border-radius:7px;display:flex;align-items:center;justify-content:center}
      .nt-item-body{flex:1;min-width:0}
      .nt-item-title{font-size:.8rem;font-weight:600;color:#e6edf3;line-height:1.35;margin-bottom:.15rem}
      .nt-item-body-text{font-size:.73rem;color:#8b949e;line-height:1.5;margin-bottom:.25rem}
      .nt-item-meta{display:flex;align-items:center;gap:.4rem}
      .nt-item-cat{font-size:.65rem;font-weight:700;text-transform:uppercase;letter-spacing:.04em}
      .nt-item-ago{font-size:.65rem;color:#484f58}
      .nt-item-dot{width:7px;height:7px;border-radius:50%;background:#3fb950;flex-shrink:0;margin-top:.35rem}
    `;
    document.head.appendChild(s);
  }

  return { init, add, open, close, toggle, markAllRead, _onItemClick };
})();
