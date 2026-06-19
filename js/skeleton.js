/* ═══════════════════════════════════════════════════════════════
   OmicsLab — Skeleton Loading States (Prompt 4)
   ─ Each page shows a shimmer placeholder while JS initialises
   ─ Skeleton auto-removed when the section's real content renders
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.Skeleton = (function () {

  /* Skeleton templates per route/section */
  const TEMPLATES = {
    /* Two-column tool layout */
    _twoCol: (title) => `
      <div class="skeleton-page">
        <div class="skeleton-header">
          <div class="sk-line sk-w-40 sk-h-xl sk-shimmer"></div>
          <div class="sk-line sk-w-60 sk-h-md sk-shimmer" style="margin-top:.4rem"></div>
        </div>
        <div class="skeleton-two-col">
          <div class="sk-block sk-h-300 sk-shimmer"></div>
          <div class="sk-block sk-h-300 sk-shimmer"></div>
        </div>
      </div>`,

    /* List layout */
    _list: (title, rows=5) => `
      <div class="skeleton-page">
        <div class="skeleton-header">
          <div class="sk-line sk-w-40 sk-h-xl sk-shimmer"></div>
          <div class="skeleton-row" style="margin-top:.6rem">
            <div class="sk-line sk-w-20 sk-h-sm sk-shimmer" style="border-radius:99px"></div>
            <div class="sk-line sk-w-20 sk-h-sm sk-shimmer" style="border-radius:99px"></div>
            <div class="sk-line sk-w-20 sk-h-sm sk-shimmer" style="border-radius:99px"></div>
          </div>
        </div>
        ${Array.from({length:rows},()=>`
          <div class="skeleton-row" style="background:var(--bg-surface);border:1px solid var(--border-default);border-radius:9px;padding:.75rem;margin-bottom:.5rem">
            <div class="sk-block sk-shimmer" style="width:36px;height:36px;border-radius:50%;flex-shrink:0"></div>
            <div style="flex:1">
              <div class="sk-line sk-w-60 sk-h-md sk-shimmer"></div>
              <div class="sk-line sk-w-80 sk-h-sm sk-shimmer" style="margin-top:.35rem"></div>
            </div>
          </div>`).join('')}
      </div>`,

    /* Grid of cards */
    _cardGrid: (cols=3, cards=6) => `
      <div class="skeleton-page">
        <div class="skeleton-header">
          <div class="sk-line sk-w-40 sk-h-xl sk-shimmer"></div>
        </div>
        <div style="display:grid;grid-template-columns:repeat(${cols},1fr);gap:.75rem">
          ${Array.from({length:cards},()=>`
            <div class="sk-block sk-shimmer" style="height:140px;border-radius:10px"></div>`).join('')}
        </div>
      </div>`,

    /* SVG/canvas tool */
    _canvas: () => `
      <div class="skeleton-page">
        <div class="skeleton-header">
          <div class="sk-line sk-w-40 sk-h-xl sk-shimmer"></div>
        </div>
        <div class="sk-block sk-shimmer" style="height:420px;border-radius:10px"></div>
      </div>`,
  };

  /* Per-section skeleton type */
  const SECTION_TYPE = {
    'phylo-section':              'canvas',
    'heatmap-section':            'canvas',
    'knowledge-graph-section':    'canvas',
    'genome-browser-section':     'canvas',
    'popstruct-section':          'canvas',
    'pubmed-section':             'list',
    'sra-section':                'list',
    'preprints-section':          'list',
    'paperhub-section':           'list',
    'journalclub-section':        'list',
    'citations-section':          'list',
    'output-tracker-section':     'list',
    'directory-section':          'list',
    'leaderboard-section':        'list',
    'datasets-section':           'list',
    'alerts-section':             'list',
    'variantinterp-section':      'twoCol',
    'qualitypredictor-section':   'twoCol',
    'primerdesign-section':       'twoCol',
    'gene-lookup-section':        'twoCol',
    'protein-section':            'twoCol',
    'uniprot-section':            'twoCol',
    'open-targets-section':       'twoCol',
    'string-section':             'twoCol',
    'pathways-section':           'twoCol',
    'nexus-section':              'twoCol',
    'teams-section':              'twoCol',
    'codon-section':              'twoCol',
    'nanopore-section':           'twoCol',
    'amr-section':                'twoCol',
    'kraken-section':             'twoCol',
    'career-section':             'cardGrid',
    'hackathon-section':          'cardGrid',
    'badges-section':             'cardGrid',
    'labnotebook-section':        'twoCol',
    'settings-section':           'twoCol',
  };

  function _html(sectionId) {
    const type = SECTION_TYPE[sectionId] || 'twoCol';
    if (type === 'list')     return TEMPLATES._list();
    if (type === 'cardGrid') return TEMPLATES._cardGrid();
    if (type === 'canvas')   return TEMPLATES._canvas();
    return TEMPLATES._twoCol();
  }

  /* Show skeleton in a section (call before init) */
  function show(sectionId) {
    const el = document.getElementById(sectionId);
    if (!el) return;
    /* Only inject if section is empty / not yet initialised */
    if (el.dataset.skDone || el.children.length > 0) return;
    el.insertAdjacentHTML('afterbegin', _html(sectionId));
    el.dataset.skActive = '1';
  }

  /* Hide skeleton (call after real content is rendered) */
  function hide(sectionId) {
    const el = document.getElementById(sectionId);
    if (!el || !el.dataset.skActive) return;
    const sk = el.querySelector('.skeleton-page');
    if (sk) sk.remove();
    delete el.dataset.skActive;
    el.dataset.skDone = '1';
  }

  /* Auto-instrument: called from router.js before each init() */
  function beforeInit(sectionId) {
    show(sectionId);
  }

  return { show, hide, beforeInit };
})();
