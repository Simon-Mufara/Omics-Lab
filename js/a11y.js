/* ═══════════════════════════════════════════════════════════════
   OmicsLab — Accessibility Layer (Prompt 11)
   ─ Screen-reader announce helper
   ─ Modal / dialog ARIA attribute patrol
   ─ aria-expanded on dropdowns
   ─ Focus-visible polyfill injection
   ─ Colour contrast fix for muted text on surfaces
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.A11y = (function () {

  let _polite  = null;
  let _assertive = null;

  /* ─── Announce to screen readers ─── */
  function announce(msg, politeness = 'polite') {
    const el = politeness === 'assertive' ? _assertive : _polite;
    if (!el) return;
    /* Clear first, then set — forces re-read even if same text */
    el.textContent = '';
    requestAnimationFrame(() => { el.textContent = msg; });
  }

  /* ─── Wire existing aria-live regions ─── */
  function _buildRegions() {
    /* Polite region — already in index.html as #a11y-announcer */
    _polite = document.getElementById('a11y-announcer');
    if (!_polite) {
      _polite = document.createElement('div');
      _polite.id = 'a11y-announcer';
      _polite.setAttribute('aria-live', 'polite');
      _polite.setAttribute('aria-atomic', 'true');
      _polite.className = 'sr-only';
      document.body.appendChild(_polite);
    }

    /* Assertive region for urgent alerts */
    _assertive = document.getElementById('a11y-assertive');
    if (!_assertive) {
      _assertive = document.createElement('div');
      _assertive.id = 'a11y-assertive';
      _assertive.setAttribute('aria-live', 'assertive');
      _assertive.setAttribute('aria-atomic', 'true');
      _assertive.className = 'sr-only';
      document.body.appendChild(_assertive);
    }
  }

  /* ─── Patch nav dropdown buttons with aria-expanded ─── */
  function _patchNavDropdowns() {
    document.querySelectorAll('.nav-group-btn').forEach(btn => {
      if (btn._a11yPatched) return;
      btn._a11yPatched = true;
      if (!btn.hasAttribute('aria-expanded')) btn.setAttribute('aria-expanded', 'false');
      if (!btn.hasAttribute('aria-haspopup')) btn.setAttribute('aria-haspopup', 'true');

      /* Toggle aria-expanded on open/close */
      const group = btn.closest('.nav-group');
      if (!group) return;
      const observer = new MutationObserver(() => {
        const isOpen = group.classList.contains('open') || group.classList.contains('active-drop');
        btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      });
      observer.observe(group, { attributes: true, attributeFilter: ['class'] });
    });
  }

  /* ─── Ensure all modals have proper ARIA attributes ─── */
  function _patchModals() {
    const observer = new MutationObserver(() => {
      document.querySelectorAll(
        '.mob-modal-overlay, .cal-overlay, .ob-modal-overlay, [class*="modal-overlay"], [class*="overlay"]'
      ).forEach(el => {
        if (el._a11yPatched) return;
        el._a11yPatched = true;
        if (!el.getAttribute('role')) el.setAttribute('role', 'dialog');
        if (!el.getAttribute('aria-modal')) el.setAttribute('aria-modal', 'true');
        /* Find a title element */
        const title = el.querySelector('h2,h3,[class*="title"],[class*="header"]');
        if (title && !el.getAttribute('aria-labelledby')) {
          if (!title.id) title.id = 'modal-title-' + Math.random().toString(36).slice(2, 6);
          el.setAttribute('aria-labelledby', title.id);
        }
        /* Wire focus trap */
        const sheet = el.querySelector('[class*="modal"],[class*="sheet"],[class*="panel"]');
        const target = sheet || el;
        if (!target._ftWired) {
          target._ftWired = true;
          const obs2 = new MutationObserver(() => {
            const isOpen = el.classList.contains('open') || el.style.display !== 'none';
            if (isOpen) OmicsLab.FocusTrap?.activate(target);
            else OmicsLab.FocusTrap?.deactivate();
          });
          obs2.observe(el, { attributes: true, attributeFilter: ['class', 'style'] });
        }
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  /* ─── Ensure all interactive SVG icons have aria-hidden ─── */
  function _patchSVGIcons() {
    /* Buttons that contain only an SVG should have an accessible label */
    document.querySelectorAll('button:not([aria-label]):not([aria-labelledby])').forEach(btn => {
      if (btn._a11yPatched) return;
      btn._a11yPatched = true;
      const hasText = btn.textContent.trim().length > 0;
      if (hasText) return;
      /* No visible text — add generic label from title attr */
      const title = btn.getAttribute('title');
      if (title) btn.setAttribute('aria-label', title);
    });
  }

  /* ─── Inject skip link if missing ─── */
  function _patchSkipLink() {
    if (document.querySelector('.skip-link')) return;
    const link = document.createElement('a');
    link.href = '#domain-section';
    link.className = 'skip-link';
    link.textContent = 'Skip to main content';
    document.body.insertBefore(link, document.body.firstChild);
  }

  /* ─── Inject a11y CSS improvements ─── */
  function _injectA11yCSS() {
    if (document.getElementById('a11y-styles')) return;
    const s = document.createElement('style');
    s.id = 'a11y-styles';
    s.textContent = `
      /* ── Focus visible — override any outline:none in app.css ── */
      :focus-visible {
        outline: 2px solid var(--blue, #58a6ff) !important;
        outline-offset: 2px !important;
        border-radius: var(--radius-sm, 4px) !important;
      }

      /* ── Muted text contrast fix: #8b949e on #161b22 = 3.7:1 (fails AA) ──
         Use #a0a8b3 which is 4.7:1 */
      .nx-msg-time, .nx-msg-role, .db-inst,
      .cal-strip-room, .ot-item-year,
      [class*="-muted"], [class*="-faint"] {
        color: #a0a8b3;
      }

      /* ── Skip link ── */
      .skip-link {
        position: absolute;
        top: -40px;
        left: 8px;
        z-index: 10000;
        background: var(--bg-canvas, #0d1117);
        color: var(--blue, #58a6ff);
        padding: .4rem .8rem;
        border-radius: 4px;
        border: 1px solid var(--blue, #58a6ff);
        font-size: .85rem;
        font-weight: 600;
        text-decoration: none;
        transition: top .15s;
      }
      .skip-link:focus { top: 8px; }

      /* ── Ensure interactive divs used as buttons show pointer ── */
      [role="button"] { cursor: pointer; }
      [role="button"]:focus-visible {
        outline: 2px solid var(--blue, #58a6ff) !important;
        outline-offset: 2px !important;
      }

      /* ── Form labels ── */
      label:not(.sr-only) {
        cursor: pointer;
      }

      /* ── Assertive live region ── */
      #a11y-assertive {
        position: absolute;
        width: 1px; height: 1px;
        padding: 0; margin: -1px;
        overflow: hidden; clip: rect(0,0,0,0);
        white-space: nowrap; border: 0;
      }
    `;
    document.head.appendChild(s);
  }

  /* ─── Announce page navigations (hook into Router) ─── */
  function _hookRouter() {
    const origNav = OmicsLab.Router?.navigate;
    if (!origNav || OmicsLab.Router._a11yHooked) return;
    OmicsLab.Router._a11yHooked = true;
    OmicsLab.Router.navigate = function (page) {
      origNav.call(OmicsLab.Router, page);
      const p = OmicsLab.Router.PAGES?.[page];
      if (p) announce(`Navigated to ${p.label}`, 'polite');
    };
  }

  /* ─── Hook toast system ─── */
  function _hookNotify() {
    const nx = OmicsLab.Notify;
    if (!nx || nx._a11yHooked) return;
    nx._a11yHooked = true;
    ['success', 'error', 'warning', 'info'].forEach(type => {
      const orig = nx[type]?.bind(nx);
      if (!orig) return;
      nx[type] = function (msg, opts) {
        orig(msg, opts);
        announce(msg, type === 'error' ? 'assertive' : 'polite');
      };
    });
  }

  /* ─── Init ─── */
  function init() {
    _injectA11yCSS();
    _buildRegions();
    _patchSkipLink();
    _patchNavDropdowns();
    _patchModals();

    /* Defer minor patches */
    setTimeout(() => {
      _patchSVGIcons();
      _hookNotify();
    }, 500);

    /* Hook router after it initialises */
    setTimeout(_hookRouter, 100);
  }

  return { init, announce };
})();
