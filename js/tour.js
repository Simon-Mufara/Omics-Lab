/* ═══════════════════════════════════════════════════════════════
   OmicsLab — Guided First-Run Tour
   Pure JS/CSS spotlight tour, no external library.

   Triggered by OmicsLab.Profile after setup modal completes.
   Marks itself done in localStorage so it never re-runs.

   4 steps:
     1. .featured-wf-section  — workflow grid
     2. button[data-group="train"]  — Lab / Train nav
     3. #how-it-works         — Learn / how it works
     4. #nav-user-pill        — progress & profile
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.Tour = (function () {

  const DONE_KEY = 'omicslab_tour_done';

  /* ── Step definitions ──────────────────────────────────────── */
  const STEPS = [
    {
      target:    '.featured-wf-section',
      fallback:  '#home-page-content',
      title:     'Pick your first workflow',
      body:      '14 scientifically accurate protocols — Whole Genome Sequencing, RNA-seq, metagenomics, ATAC-seq, and more — each built around real African diseases. Click any card to begin.',
      placement: 'above',   /* tooltip appears above spotlight */
      pad:       14,
      radius:    '14px',
    },
    {
      target:    'button[data-group="train"]',
      fallback:  '#ng-train',
      title:     'Drag reagents. Get real feedback.',
      body:      'The Train menu opens Lab Simulations and Curriculum Tracks. Tune instrument parameters, watch 8 live QC metrics update in real time, and see exactly how early mistakes cascade downstream.',
      placement: 'below',
      pad:       10,
      radius:    '10px',
    },
    {
      target:    '#how-it-works',
      fallback:  '#home-page-content',
      title:     'Study diseases, tools & pipelines',
      body:      'The Learn section covers 40+ diseases, 50+ bioinformatics tools, HPC training, and structured curriculum tracks. Complete a track and earn a shareable certificate.',
      placement: 'above',
      pad:       14,
      radius:    '14px',
    },
    {
      target:    '#nav-user-pill',
      fallback:  '#nav-right',
      title:     'Your progress is always saved',
      body:      'Everything is stored locally — no account needed. Open your profile to see earned badges, curriculum progress, total time studied, and personalised workflow recommendations.',
      placement: 'below',
      pad:       10,
      radius:    '9999px',  /* pill shape for the user pill */
    },
  ];

  /* ── State ──────────────────────────────────────────────────── */
  let _step    = 0;
  let _running = false;
  let _navZ    = '';        /* saved nav z-index */
  let _resizeT = null;

  /* ─── Public API ────────────────────────────────────────────── */

  /* start() — call after setup modal completes */
  function start() {
    if (_running) return;
    if (localStorage.getItem(DONE_KEY)) return;

    _running = true;
    _step    = 0;

    _buildDom();
    _goToStep(0);
    window.addEventListener('resize', _onResize);
    document.addEventListener('keydown', _onKey);
  }

  /* next() — advance to next step (called from inline onclick) */
  function next() {
    if (!_running) return;
    if (_step < STEPS.length - 1) {
      _goToStep(_step + 1);
    } else {
      end();
    }
  }

  /* end() — close tour and mark done */
  function end() {
    localStorage.setItem(DONE_KEY, '1');
    _teardown();
  }

  /* reset() — for debugging: lets the tour run again */
  function reset() { localStorage.removeItem(DONE_KEY); }

  /* ─── DOM helpers ───────────────────────────────────────────── */

  function _buildDom() {
    _wipeDom();

    /* Pointer-blocking backdrop: covers everything below z-index 8001 */
    const bd = document.createElement('div');
    bd.id = 'tour-backdrop';
    bd.className = 'tour-backdrop';
    bd.addEventListener('click', _onBackdropClick);

    /* Transparent spotlight div whose box-shadow IS the dark overlay */
    const sp = document.createElement('div');
    sp.id = 'tour-spotlight';
    sp.className = 'tour-spotlight no-transition';

    /* Tooltip card */
    const tt = document.createElement('div');
    tt.id = 'tour-tooltip';
    tt.className = 'tour-tooltip no-transition';

    document.body.appendChild(bd);
    document.body.appendChild(sp);
    document.body.appendChild(tt);
  }

  function _wipeDom() {
    ['tour-backdrop', 'tour-spotlight', 'tour-tooltip'].forEach(id => {
      document.getElementById(id)?.remove();
    });
  }

  function _teardown() {
    _running = false;
    _unlockScroll();
    _restoreNav();
    _wipeDom();
    window.removeEventListener('resize', _onResize);
    document.removeEventListener('keydown', _onKey);
  }

  /* ─── Navigation logic ──────────────────────────────────────── */

  function _goToStep(idx) {
    _step = idx;

    const def = STEPS[idx];
    const target = _resolve(def.target, def.fallback);

    /* Gracefully skip steps with no matching target */
    if (!target) {
      if (idx < STEPS.length - 1) { _goToStep(idx + 1); } else { end(); }
      return;
    }

    const inNav = _isInNav(target);

    /* Fade everything out before repositioning */
    _setVisible(false);
    _restoreNav();

    if (inNav) {
      /* Nav element: always in viewport, no scroll needed */
      _elevateNav();
      setTimeout(() => _revealStep(def, target, idx), 200);
    } else {
      /* Page content: scroll into view first */
      _unlockScroll();
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => {
        _lockScroll();
        _revealStep(def, target, idx);
      }, 530);
    }
  }

  function _revealStep(def, target, idx) {
    const sp = document.getElementById('tour-spotlight');
    const tt = document.getElementById('tour-tooltip');
    if (!sp || !tt) return;

    /* On first display, disable position transitions so spotlight
       appears instantly at the right spot (not flying in from 0,0) */
    const isFirst = idx === 0;

    /* Remove no-transition briefly, then re-enable smooth moves */
    if (!isFirst) {
      sp.classList.remove('no-transition');
      tt.classList.remove('no-transition');
    }

    _placeSpotlight(def, target);
    _renderTooltip(def, idx, target);

    /* Small delay lets the DOM paint before fading in */
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        _setVisible(true);
        /* After first step we keep transitions on */
        if (isFirst) {
          sp.classList.remove('no-transition');
          tt.classList.remove('no-transition');
        }
      });
    });
  }

  /* ─── Spotlight positioning ─────────────────────────────────── */

  function _placeSpotlight(def, target) {
    const sp   = document.getElementById('tour-spotlight');
    if (!sp) return;
    const rect = target.getBoundingClientRect();
    const pad  = def.pad || 10;

    sp.style.top          = (rect.top    - pad) + 'px';
    sp.style.left         = (rect.left   - pad) + 'px';
    sp.style.width        = (rect.width  + pad * 2) + 'px';
    sp.style.height       = (rect.height + pad * 2) + 'px';
    sp.style.borderRadius = def.radius || '10px';
  }

  /* ─── Tooltip render + positioning ─────────────────────────── */

  function _renderTooltip(def, idx, target) {
    const tt = document.getElementById('tour-tooltip');
    if (!tt) return;

    const isLast = idx === STEPS.length - 1;
    const dots   = STEPS.map((_, i) =>
      `<span class="tour-dot ${i < idx ? 'done' : i === idx ? 'active' : ''}"></span>`
    ).join('');

    /* Determine if arrow should point up (tooltip below) or down (tooltip above) */
    const arrowClass = def.placement === 'below' ? 'tour-arrow-up' : 'tour-arrow-down';

    tt.innerHTML = `
      <div class="tour-tt-head">
        <div class="tour-dots">${dots}</div>
        <button class="tour-close-btn" onclick="OmicsLab.Tour.end()" aria-label="Close tour">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      <div class="tour-step-label">Step ${idx + 1} of ${STEPS.length}</div>
      <h3 class="tour-title">${def.title}</h3>
      <p class="tour-body">${def.body}</p>
      <div class="tour-actions">
        ${!isLast
          ? `<button class="tour-skip-btn" onclick="OmicsLab.Tour.end()">Skip tour</button>`
          : '<span></span>'}
        <button class="tour-next-btn" onclick="OmicsLab.Tour.next()">
          ${isLast ? 'Start Exploring' : 'Next'}
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </button>
      </div>
      <div class="tour-arrow ${arrowClass}" id="tour-arrow"></div>`;

    _placeTooltip(def, target);
  }

  function _placeTooltip(def, target) {
    const tt   = document.getElementById('tour-tooltip');
    const arr  = document.getElementById('tour-arrow');
    if (!tt) return;

    const rect = target.getBoundingClientRect();
    const pad  = def.pad || 10;
    const GAP  = 18;
    const TW   = Math.min(340, window.innerWidth - 32);
    const TH   = tt.offsetHeight || 230;
    const vw   = window.innerWidth;
    const vh   = window.innerHeight;

    let top, below;

    if (def.placement === 'below') {
      top   = rect.bottom + pad + GAP;
      below = true;
      /* Flip above if not enough room below */
      if (top + TH > vh - 12) {
        top   = rect.top - pad - TH - GAP;
        below = false;
      }
    } else {
      top   = rect.top - pad - TH - GAP;
      below = false;
      /* Flip below if not enough room above */
      if (top < 12) {
        top   = rect.bottom + pad + GAP;
        below = true;
      }
    }

    /* Center tooltip horizontally over target; clamp to viewport */
    const idealLeft = rect.left + rect.width / 2 - TW / 2;
    const left      = Math.max(16, Math.min(idealLeft, vw - TW - 16));

    tt.style.top   = top  + 'px';
    tt.style.left  = left + 'px';
    tt.style.width = TW   + 'px';

    /* Position arrow to point at the target center horizontally */
    if (arr) {
      const targetCenter = rect.left + rect.width / 2;
      const arrowLeft    = Math.min(Math.max(targetCenter - left, 24), TW - 24);
      arr.style.left      = arrowLeft + 'px';
      arr.style.transform = 'translateX(-50%)';

      /* Swap arrow direction class if placement flipped */
      if (below) {
        arr.className = 'tour-arrow tour-arrow-up';
      } else {
        arr.className = 'tour-arrow tour-arrow-down';
      }
    }
  }

  /* ─── Visibility ────────────────────────────────────────────── */

  function _setVisible(on) {
    document.getElementById('tour-spotlight')?.classList.toggle('visible', on);
    document.getElementById('tour-tooltip')  ?.classList.toggle('visible', on);
  }

  /* ─── Nav elevation ─────────────────────────────────────────── */
  /* When targeting an element inside the sticky nav, we temporarily
     raise the nav's z-index above the spotlight so it paints on top. */

  function _isInNav(el) {
    const nav = document.getElementById('main-nav');
    return nav ? nav.contains(el) : false;
  }

  function _elevateNav() {
    const nav = document.getElementById('main-nav');
    if (nav) { _navZ = nav.style.zIndex; nav.style.zIndex = '8003'; }
  }

  function _restoreNav() {
    const nav = document.getElementById('main-nav');
    if (nav && nav.style.zIndex === '8003') nav.style.zIndex = _navZ;
  }

  /* ─── Scroll locking ────────────────────────────────────────── */

  function _lockScroll()   { document.body.style.overflow = 'hidden'; }
  function _unlockScroll() { document.body.style.overflow = ''; }

  /* ─── Target resolution ─────────────────────────────────────── */

  function _resolve(selector, fallback) {
    return document.querySelector(selector)
        || (fallback && document.querySelector(fallback))
        || null;
  }

  /* ─── Event handlers ────────────────────────────────────────── */

  function _onBackdropClick(e) {
    /* Ignore clicks that actually land on the tooltip */
    const tt = document.getElementById('tour-tooltip');
    if (tt && tt.contains(e.target)) return;

    /* Clicking outside the spotlight during the tour advances to next step */
    next();
  }

  function _onKey(e) {
    if (!_running) return;
    if (e.key === 'ArrowRight' || e.key === 'Enter') next();
    if (e.key === 'Escape') end();
  }

  function _onResize() {
    clearTimeout(_resizeT);
    _resizeT = setTimeout(() => {
      if (!_running) return;
      const def    = STEPS[_step];
      const target = _resolve(def.target, def.fallback);
      if (!target) return;
      _placeSpotlight(def, target);
      _placeTooltip(def, target);
    }, 150);
  }

  return { start, next, end, reset };

})();
