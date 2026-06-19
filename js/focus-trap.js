/* ═══════════════════════════════════════════════════════════════
   OmicsLab — Focus Trap Utility (Prompt 11)
   ─ Traps Tab/Shift+Tab inside modal/dialog containers
   ─ Restores focus to trigger element on deactivate
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.FocusTrap = (function () {

  const FOCUSABLE = [
    'a[href]', 'button:not([disabled])', 'input:not([disabled])',
    'select:not([disabled])', 'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])', 'details > summary',
  ].join(',');

  let _active    = null;   /* current container */
  let _trigger   = null;   /* element that opened the trap */
  let _handler   = null;   /* stored keydown listener */

  function activate(container, trigger) {
    if (!container) return;
    deactivate();

    _active  = container;
    _trigger = trigger || document.activeElement;

    const focusables = () => Array.from(_active.querySelectorAll(FOCUSABLE)).filter(
      el => !el.closest('[hidden]') && getComputedStyle(el).display !== 'none'
    );

    /* Focus first focusable element */
    const first = focusables()[0];
    if (first) requestAnimationFrame(() => first.focus());

    _handler = function (e) {
      if (e.key !== 'Tab') return;
      const all   = focusables();
      if (!all.length) { e.preventDefault(); return; }
      const first = all[0];
      const last  = all[all.length - 1];
      if (e.shiftKey) {
        /* Shift+Tab — if on first, wrap to last */
        if (document.activeElement === first || !_active.contains(document.activeElement)) {
          e.preventDefault();
          last.focus();
        }
      } else {
        /* Tab — if on last, wrap to first */
        if (document.activeElement === last || !_active.contains(document.activeElement)) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', _handler);

    /* Also ensure container has proper dialog semantics */
    if (!container.getAttribute('role')) container.setAttribute('role', 'dialog');
    if (!container.getAttribute('aria-modal')) container.setAttribute('aria-modal', 'true');
  }

  function deactivate() {
    if (_handler) {
      document.removeEventListener('keydown', _handler);
      _handler = null;
    }
    if (_trigger && typeof _trigger.focus === 'function') {
      try { _trigger.focus(); } catch {}
    }
    _active  = null;
    _trigger = null;
  }

  /* ─── Wire to any element with data-focus-trap="true" ─── */
  function wireAll() {
    document.querySelectorAll('[data-focus-trap="true"]').forEach(el => {
      if (el._ftWired) return;
      el._ftWired = true;
      /* Activate when element becomes visible */
      const obs = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) activate(el);
          else deactivate();
        });
      });
      obs.observe(el);
    });
  }

  return { activate, deactivate, wireAll };
})();
