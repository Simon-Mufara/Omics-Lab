/* ═══════════════════════════════════════════════════════════════
   OmicsLab — Explainer (flat-vector animated scene component)
   Config-driven, staggered-entrance, themeable via CSS variables.
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.Explainer = (function () {

  const NS = 'http://www.w3.org/2000/svg';

  /* shape id → [viewBox, aspect-ratio, default width % of stage] */
  const SHAPE_META = {
    person:    { viewBox: '0 0 24 36', ratio: '24/36', width: 9  },
    tube:      { viewBox: '0 0 14 36', ratio: '14/36', width: 5  },
    fridge:    { viewBox: '0 0 30 40', ratio: '30/40', width: 12 },
    sequencer: { viewBox: '0 0 44 28', ratio: '44/28', width: 20 },
    icon:      { viewBox: '0 0 24 24', ratio: '1/1',   width: 8  },
  };

  const SYMBOLS = `
    <symbol id="ol-shape-person" viewBox="0 0 24 36">
      <circle class="ol-shape-primary" cx="12" cy="6" r="5"/>
      <path class="ol-shape-primary" d="M4 34 C4 21 6 13 12 13 C18 13 20 21 20 34 Z"/>
    </symbol>
    <symbol id="ol-shape-tube" viewBox="0 0 14 36">
      <path class="ol-shape-neutral" d="M2 2 H12 V26 C12 31 9.7 34 7 34 C4.3 34 2 31 2 26 Z"/>
      <path class="ol-shape-accent"  d="M3 19 H11 V25 C11 29 9.2 31 7 31 C4.8 31 3 29 3 25 Z"/>
      <rect class="ol-shape-primary" x="1" y="0" width="12" height="4" rx="1.2"/>
    </symbol>
    <symbol id="ol-shape-fridge" viewBox="0 0 30 40">
      <rect class="ol-shape-primary" x="2" y="2" width="26" height="36" rx="3"/>
      <rect class="ol-shape-neutral" x="2" y="17" width="26" height="2.4"/>
      <rect class="ol-shape-neutral" x="23" y="5.5" width="3" height="8" rx="1.3"/>
      <rect class="ol-shape-neutral" x="23" y="22.5" width="3" height="8" rx="1.3"/>
      <circle class="ol-shape-accent" cx="6.5" cy="8" r="2.2"/>
    </symbol>
    <symbol id="ol-shape-sequencer" viewBox="0 0 44 28">
      <rect class="ol-shape-primary" x="1" y="4" width="42" height="22" rx="3"/>
      <rect class="ol-shape-accent"  x="5" y="8" width="17" height="11" rx="1.4"/>
      <polyline class="ol-shape-onaccent ol-shape-line" points="7,16 9,11 11,17 13,10 15,16 17,12 19,15" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
      <rect class="ol-shape-neutral" x="26" y="19" width="15" height="3" rx="1.5"/>
    </symbol>
    <symbol id="ol-shape-icon-dna" viewBox="0 0 24 24">
      <path class="ol-shape-primary ol-shape-line" d="M6 2 C6 6 18 6 18 10 C18 14 6 14 6 18 C6 20 6 21 6 22" stroke-width="2" stroke-linecap="round"/>
      <path class="ol-shape-accent ol-shape-line"  d="M18 2 C18 6 6 6 6 10 C6 14 18 14 18 18 C18 20 18 21 18 22" stroke-width="2" stroke-linecap="round"/>
    </symbol>
    <symbol id="ol-shape-icon-file" viewBox="0 0 24 24">
      <path class="ol-shape-primary" d="M6 2 H14 L18 6 V22 H6 Z"/>
      <path class="ol-shape-onaccent" d="M14 2 V6 H18 Z"/>
      <rect class="ol-shape-neutral" x="8.5" y="10.5" width="7" height="1.5"/>
      <rect class="ol-shape-neutral" x="8.5" y="13.8" width="7" height="1.5"/>
      <rect class="ol-shape-accent"  x="8.5" y="17.1" width="4.5" height="1.5"/>
    </symbol>
    <symbol id="ol-shape-icon-cloud" viewBox="0 0 24 24">
      <path class="ol-shape-primary" d="M7 17 C4 17 2 15 2 12.5 C2 10 4 8.3 6.5 8.1 C7.2 5.2 9.9 3 13 3 C16.6 3 19.5 5.8 19.8 9.3 C21.7 9.8 23 11.5 23 13.5 C23 15.9 21 17.8 18.5 17.8 Z"/>
    </symbol>
    <symbol id="ol-shape-icon-check" viewBox="0 0 24 24">
      <circle class="ol-shape-accent" cx="12" cy="12" r="10"/>
      <path class="ol-shape-onaccent ol-shape-line" d="M7.5 12.5 L10.5 15.5 L16.5 8.5" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"/>
    </symbol>
  `;

  /* ── Shared preset: the "bench to bytes" lab-workflow journey ──
     Single source of truth reused by the landing hero, the User Guide,
     and the Lab screen's "how it works" trigger. ── */
  const JOURNEY_SCENES = [
    {
      id: 'sample',
      scene: 'From patient to sample',
      elements: [
        { shape: 'person', x: 28, y: 60, enterAt: 0,   motion: 'fade' },
        { shape: 'tube',   x: 64, y: 62, enterAt: 350, motion: 'slide-up' },
      ],
      caption: 'A blood sample is drawn and labelled for the lab.',
      next: 'prep',
    },
    {
      id: 'prep',
      scene: 'Bench preparation',
      elements: [
        { shape: 'tube',   x: 22, y: 62, enterAt: 0,   motion: 'fade' },
        { shape: 'fridge', x: 70, y: 55, enterAt: 300, motion: 'slide-left' },
        { shape: 'icon',   icon: 'dna', x: 46, y: 22, enterAt: 650, motion: 'slide-down' },
      ],
      caption: 'DNA is extracted and stored at the right temperature before sequencing.',
      next: 'sequence',
    },
    {
      id: 'sequence',
      scene: 'Sequencing run',
      elements: [
        { shape: 'tube',      x: 14, y: 66, scale: 0.7, enterAt: 0,   motion: 'slide-right' },
        { shape: 'sequencer', x: 55, y: 55, enterAt: 300, motion: 'fade' },
      ],
      caption: 'The prepared library runs through the sequencer, generating raw reads — this is where OmicsLab picks up.',
      next: 'data',
    },
    {
      id: 'data',
      scene: 'From bytes to insight',
      palette: { accent: '#f6a821' },
      elements: [
        { shape: 'icon', icon: 'file',  x: 26, y: 52, enterAt: 0,   motion: 'slide-up' },
        { shape: 'icon', icon: 'cloud', x: 54, y: 28, enterAt: 320, motion: 'fade' },
        { shape: 'icon', icon: 'check', x: 78, y: 55, enterAt: 640, motion: 'slide-up' },
      ],
      caption: 'Reads are processed into data files, ready for analysis and interpretation — the part you’ll run yourself.',
    },
  ];

  const JOURNEY_THEME = { primary: 'var(--green)', accent: 'var(--blue)', neutral: 'var(--text-muted)' };

  let _spriteReady = false;

  function _injectSprite() {
    if (_spriteReady || document.getElementById('ol-exp-sprite')) { _spriteReady = true; return; }
    const svg = document.createElementNS(NS, 'svg');
    svg.id = 'ol-exp-sprite';
    svg.setAttribute('aria-hidden', 'true');
    svg.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
    svg.innerHTML = SYMBOLS;
    document.body.appendChild(svg);
    _spriteReady = true;
  }

  function _symbolId(el) {
    return el.shape === 'icon' ? `ol-shape-icon-${el.icon || 'file'}` : `ol-shape-${el.shape}`;
  }

  function _applyPalette(container, palette) {
    if (!palette) return;
    if (palette.primary) container.style.setProperty('--exp-primary', palette.primary);
    if (palette.accent)  container.style.setProperty('--exp-accent',  palette.accent);
    if (palette.neutral) container.style.setProperty('--exp-neutral', palette.neutral);
  }

  function mount(container, scenes, opts) {
    opts = opts || {};
    if (typeof container === 'string') container = document.querySelector(container);
    if (!container || !scenes || !scenes.length) return null;

    _injectSprite();

    container.classList.add('ol-explainer');
    container.setAttribute('role', 'group');
    container.setAttribute('aria-roledescription', 'carousel');
    container.setAttribute('aria-label', opts.label || 'Explainer');
    if (opts.theme) _applyPalette(container, opts.theme);

    container.innerHTML = `
      <div class="ol-exp-stage"></div>
      <p class="ol-exp-caption" aria-live="polite"></p>
      <div class="ol-exp-controls">
        <button type="button" class="btn btn-secondary btn-icon ol-exp-prev" aria-label="Previous scene">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <div class="ol-exp-dots" role="tablist" aria-label="Scenes"></div>
        <button type="button" class="btn btn-secondary btn-icon ol-exp-next" aria-label="Next scene">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>
    `;

    const stage    = container.querySelector('.ol-exp-stage');
    const caption  = container.querySelector('.ol-exp-caption');
    const dotsWrap = container.querySelector('.ol-exp-dots');
    const prevBtn  = container.querySelector('.ol-exp-prev');
    const nextBtn  = container.querySelector('.ol-exp-next');

    let index = Math.max(0, scenes.findIndex(s => s.id === opts.start));
    let timers = [];

    function _clearTimers() { timers.forEach(clearTimeout); timers = []; }

    function _renderDots() {
      dotsWrap.innerHTML = scenes.map((s, i) => `
        <button type="button" class="ol-exp-dot${i === index ? ' is-active' : ''}"
          data-i="${i}" role="tab" aria-selected="${i === index}"
          aria-label="Scene ${i + 1}: ${s.scene}"></button>
      `).join('');
      dotsWrap.querySelectorAll('.ol-exp-dot').forEach(d =>
        d.addEventListener('click', () => renderScene(parseInt(d.dataset.i, 10)))
      );
    }

    function renderScene(i) {
      _clearTimers();
      index = Math.max(0, Math.min(scenes.length - 1, i));
      const s = scenes[index];

      _applyPalette(container, s.palette);
      stage.setAttribute('aria-label', s.scene || '');
      stage.innerHTML = '';

      (s.elements || []).forEach(el => {
        const meta = SHAPE_META[el.shape] || SHAPE_META.icon;
        const w = meta.width * (el.scale || 1);
        const wrap = document.createElementNS(NS, 'svg');
        wrap.setAttribute('viewBox', meta.viewBox);
        wrap.setAttribute('class', `ol-exp-el`);
        wrap.setAttribute('data-motion', el.motion || 'fade');
        wrap.style.left = el.x + '%';
        wrap.style.top = el.y + '%';
        wrap.style.width = w + '%';
        wrap.style.aspectRatio = meta.ratio;
        const use = document.createElementNS(NS, 'use');
        use.setAttribute('href', `#${_symbolId(el)}`);
        wrap.appendChild(use);
        stage.appendChild(wrap);

        const t = setTimeout(() => wrap.classList.add('is-in'), Math.max(0, el.enterAt || 0));
        timers.push(t);
      });

      caption.textContent = s.caption || '';
      prevBtn.disabled = index === 0;
      nextBtn.disabled = index === scenes.length - 1 && !s.next;
      _renderDots();
      container.dispatchEvent(new CustomEvent('scenechange', { detail: { id: s.id, index } }));
    }

    function next() {
      const s = scenes[index];
      const toId = s.next ? scenes.findIndex(x => x.id === s.next) : -1;
      if (toId > -1) renderScene(toId);
      else if (index < scenes.length - 1) renderScene(index + 1);
    }
    function prev() { if (index > 0) renderScene(index - 1); }
    function goTo(id) {
      const i = scenes.findIndex(x => x.id === id);
      if (i > -1) renderScene(i);
    }

    prevBtn.addEventListener('click', prev);
    nextBtn.addEventListener('click', next);
    if (!container.hasAttribute('tabindex')) container.tabIndex = 0;
    container.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    });

    renderScene(index);

    return {
      next, prev, goTo,
      destroy() {
        _clearTimers();
        container.innerHTML = '';
        container.classList.remove('ol-explainer');
      },
    };
  }

  /* ── Modal launcher — lets any screen offer the explainer as an opt-in
     "watch how it works" trigger instead of embedding it inline, so it
     never crowds a space-constrained layout (e.g. the Lab workspace). ── */
  let _modalInstance = null;

  function _onEsc(e) { if (e.key === 'Escape') closeModal(); }

  function openModal(scenes, opts) {
    opts = opts || {};
    closeModal();

    const overlay = document.createElement('div');
    overlay.id = 'ol-exp-modal-overlay';
    overlay.className = 'ol-exp-modal-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', opts.label || 'How it works');
    overlay.innerHTML = `
      <div class="ol-exp-modal-card">
        <button type="button" class="ol-exp-modal-close" aria-label="Close">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
        <div class="ol-exp-modal-mount"></div>
      </div>`;
    document.body.appendChild(overlay);

    overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
    overlay.querySelector('.ol-exp-modal-close').addEventListener('click', closeModal);
    document.addEventListener('keydown', _onEsc);

    _modalInstance = mount(overlay.querySelector('.ol-exp-modal-mount'), scenes, opts);
  }

  function closeModal() {
    const overlay = document.getElementById('ol-exp-modal-overlay');
    if (overlay) overlay.remove();
    document.removeEventListener('keydown', _onEsc);
    if (_modalInstance) { _modalInstance.destroy?.(); _modalInstance = null; }
  }

  return { mount, openModal, closeModal, JOURNEY_SCENES, JOURNEY_THEME };
})();
