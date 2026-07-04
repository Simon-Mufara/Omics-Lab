/* ═══════════════════════════════════════════════════════════════
   OmicsLab — Global Notification & Toast System (Prompt 2)
   ─ Replaces all per-module toast implementations
   ─ success | error | warning | info | loading types
   ─ Stacked top-right (desktop) / top-centre (mobile)
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.Notify = (function () {
  let _container = null;
  let _uid = 0;
  const MAX = 4;

  const ICONS = {
    success: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
    error:   '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
    warning: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
    info:    '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
    loading: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="nt-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>',
  };

  const COLORS = {
    success: '#00C4A0',
    error:   '#ff6b6b',
    warning: '#e3b341',
    info:    '#58a6ff',
    loading: '#A8A098',
  };

  function _ensure() {
    if (_container) return;
    _container = document.createElement('div');
    _container.id = 'nt-container';
    _container.setAttribute('aria-live', 'polite');
    _container.setAttribute('aria-atomic', 'false');
    document.body.appendChild(_container);

    const style = document.createElement('style');
    style.textContent = `
      #nt-container{position:fixed;top:3.75rem;right:1rem;z-index:8000;display:flex;flex-direction:column;gap:.45rem;pointer-events:none;max-width:340px;width:calc(100vw - 2rem)}
      @media(max-width:600px){#nt-container{right:50%;transform:translateX(50%)}}
      .nt-toast{pointer-events:all;background:#111B2E;border:1px solid #243048;border-left:3px solid var(--nt-c);border-radius:9px;padding:.65rem .9rem;display:flex;align-items:flex-start;gap:.55rem;box-shadow:0 8px 24px rgba(0,0,0,.5);animation:nt-in .22s cubic-bezier(.16,1,.3,1) both;position:relative;overflow:hidden}
      .nt-toast.nt-out{animation:nt-out .18s ease-in forwards}
      .nt-icon{flex-shrink:0;color:var(--nt-c);margin-top:.1rem}
      .nt-body{flex:1;min-width:0}
      .nt-msg{font-size:.82rem;color:#E4DDD2;line-height:1.45;word-break:break-word}
      .nt-actions{display:flex;gap:.4rem;margin-top:.35rem;flex-wrap:wrap}
      .nt-action-btn{background:none;border:1px solid #243048;border-radius:5px;padding:.18rem .55rem;font-size:.72rem;color:#A8A098;cursor:pointer}
      .nt-action-btn:hover{background:#182236}
      .nt-close{background:none;border:none;color:#A8A098;cursor:pointer;padding:.15rem;flex-shrink:0;margin-top:-.05rem}
      .nt-close:hover{color:#E4DDD2}
      .nt-progress{position:absolute;bottom:0;left:0;height:2px;background:var(--nt-c);opacity:.4;animation:nt-progress var(--nt-dur,4000ms) linear forwards}
      @keyframes nt-in{from{opacity:0;transform:translateY(-6px) scale(.97)}to{opacity:1;transform:none}}
      @keyframes nt-out{to{opacity:0;transform:translateX(8px) scale(.96)}}
      @keyframes nt-progress{from{width:100%}to{width:0}}
      .nt-spin{animation:nt-rotate 1s linear infinite;transform-origin:center}
      @keyframes nt-rotate{to{transform:rotate(360deg)}}
    `;
    document.head.appendChild(style);
  }

  function show(message, type = 'info', options = {}) {
    _ensure();
    const { duration = 4000, actions = [], id: customId, persist = false } = options;
    const id = customId || `nt-${++_uid}`;

    /* Dismiss oldest if at max */
    const existing = _container.querySelectorAll('.nt-toast');
    if (existing.length >= MAX) _dismiss(existing[0].id);

    const el = document.createElement('div');
    el.className = 'nt-toast';
    el.id = id;
    el.style.setProperty('--nt-c', COLORS[type] || COLORS.info);
    if (!persist && duration > 0) el.style.setProperty('--nt-dur', duration + 'ms');

    el.innerHTML = `
      <span class="nt-icon" aria-hidden="true">${ICONS[type] || ICONS.info}</span>
      <div class="nt-body">
        <div class="nt-msg">${String(message).replace(/</g,'&lt;')}</div>
        ${actions.length ? `<div class="nt-actions">${actions.map((a,i) =>
          `<button class="nt-action-btn" data-ai="${i}">${String(a.label).replace(/</g,'&lt;')}</button>`
        ).join('')}</div>` : ''}
      </div>
      <button class="nt-close" aria-label="Dismiss" onclick="OmicsLab.Notify.dismiss('${id}')">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
      ${!persist && duration > 0 ? '<div class="nt-progress"></div>' : ''}`;

    /* Wire action buttons */
    actions.forEach((a, i) => {
      el.querySelector(`[data-ai="${i}"]`)?.addEventListener('click', () => { a.onClick?.(); _dismiss(id); });
    });

    _container.appendChild(el);

    if (!persist && duration > 0) {
      setTimeout(() => _dismiss(id), duration);
    }
    return id;
  }

  function _dismiss(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.add('nt-out');
    el.addEventListener('animationend', () => el.remove(), { once: true });
  }

  function dismiss(id) { _dismiss(id); }
  function dismissAll() { _container?.querySelectorAll('.nt-toast').forEach(el => _dismiss(el.id)); }
  function success(msg, opts) { return show(msg, 'success', opts); }
  function error(msg, opts) { return show(msg, 'error', { persist: true, ...opts }); }
  function warning(msg, opts) { return show(msg, 'warning', opts); }
  function info(msg, opts) { return show(msg, 'info', opts); }
  function loading(msg, opts) { return show(msg, 'loading', { persist: true, ...opts }); }

  return { show, dismiss, dismissAll, success, error, warning, info, loading };
})();
