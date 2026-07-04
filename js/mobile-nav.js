/* ═══════════════════════════════════════════════════════════════
   OmicsLab — Mobile Navigation (Prompt 6)
   ─ Bottom tab bar, slide-up modal, touch enhancements
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.MobileNav = (function () {

  /* The 5 bottom-bar tabs */
  const TABS = [
    {
      id: 'home',
      label: 'Home',
      icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
    },
    {
      id: 'lab',
      label: 'Lab',
      icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 2v7.527a2 2 0 0 1-.211.896L4.72 20.55a1 1 0 0 0 .9 1.45h12.76a1 1 0 0 0 .9-1.45l-5.069-10.127A2 2 0 0 1 14 9.527V2"/><path d="M8.5 2h7"/><path d="M7 16h10"/></svg>`,
    },
    {
      id: '_tools',
      label: 'Tools',
      icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
      sheet: true, /* opens tool picker sheet */
    },
    {
      id: 'research',
      label: 'Research',
      icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`,
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
    },
  ];

  /* Tool picker entries for the "Tools" sheet */
  const TOOL_SHEET_ITEMS = [
    { id: 'analysis',        label: 'Analysis Suite',      color: '#e3b341' },
    { id: 'variantinterp',   label: 'Variant Interpreter', color: '#bc8cff' },
    { id: 'study',           label: 'Study Pack',          color: '#58a6ff' },
    { id: 'terminal',        label: 'Terminal',            color: '#00C4A0' },
    { id: 'primerdesign',    label: 'Primer Design',       color: '#00C4A0' },
    { id: 'phylo',           label: 'Phylo Tree',          color: '#00C4A0' },
    { id: 'heatmap',         label: 'Expression Viewer',   color: '#e3b341' },
    { id: 'qualitypredictor',label: 'Quality Predictor',   color: '#00C4A0' },
    { id: 'gene-lookup',     label: 'Gene Lookup',         color: '#00C4A0' },
    { id: 'pubmed',          label: 'PubMed',              color: '#58a6ff' },
    { id: 'gatk',            label: 'GATK Builder',        color: '#e3b341' },
  ];

  let _active = 'home';

  /* ─── Inject the tab bar ─── */
  function _build() {
    if (document.getElementById('mob-tabbar')) return;

    const bar = document.createElement('nav');
    bar.id = 'mob-tabbar';
    bar.className = 'mob-tabbar';
    bar.setAttribute('aria-label', 'Mobile primary navigation');
    bar.setAttribute('role', 'navigation');

    bar.innerHTML = TABS.map(tab => `
      <button
        class="mob-tab${tab.id === _active ? ' active' : ''}"
        id="mob-tab-${tab.id}"
        aria-label="${tab.label}"
        onclick="OmicsLab.MobileNav._onTab('${tab.id}')"
        type="button"
      >
        <span class="mob-tab-wrap">
          ${tab.icon}
        </span>
        <span class="mob-tab-label">${tab.label}</span>
      </button>`).join('');

    document.body.appendChild(bar);
  }

  /* ─── Handle tab tap ─── */
  function _onTab(id) {
    if (id === '_tools') {
      _openToolSheet();
      return;
    }
    _setActive(id);
    OmicsLab.Router?.navigate(id);
  }

  function _setActive(page) {
    _active = page;
    document.querySelectorAll('.mob-tab').forEach(btn => {
      btn.classList.toggle('active', btn.id === `mob-tab-${page}`);
    });
  }

  /* ─── Tool picker bottom sheet ─── */
  function _openToolSheet() {
    let overlay = document.getElementById('mob-tool-sheet');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'mob-tool-sheet';
      overlay.className = 'mob-modal-overlay';
      overlay.setAttribute('role', 'dialog');
      overlay.setAttribute('aria-modal', 'true');
      overlay.setAttribute('aria-label', 'Tools');
      overlay.innerHTML = `
        <div class="mob-modal-sheet" role="document">
          <div class="mob-modal-handle"></div>
          <div class="mob-modal-title">Tools</div>
          <div style="padding:.25rem .75rem .75rem;display:grid;grid-template-columns:1fr 1fr;gap:.5rem">
            ${TOOL_SHEET_ITEMS.map(t => `
              <button
                class="mob-tool-item"
                style="--tool-color:${t.color}"
                onclick="OmicsLab.MobileNav._pickTool('${t.id}')"
                type="button"
              >
                <span class="mob-tool-dot" style="background:${t.color}"></span>
                ${_esc(t.label)}
              </button>`).join('')}
          </div>
        </div>`;
      /* Close on backdrop click */
      overlay.addEventListener('click', e => { if (e.target === overlay) _closeSheet(); });
      document.body.appendChild(overlay);
      _injectSheetStyles();
    }
    requestAnimationFrame(() => overlay.classList.add('open'));
    document.addEventListener('keydown', _onSheetKey);
  }

  function _closeSheet() {
    const overlay = document.getElementById('mob-tool-sheet');
    if (overlay) {
      overlay.classList.remove('open');
      document.removeEventListener('keydown', _onSheetKey);
    }
  }

  function _onSheetKey(e) { if (e.key === 'Escape') _closeSheet(); }

  function _pickTool(id) {
    _closeSheet();
    _setActive('_tools');
    /* Keep tools tab visually active */
    const toolsBtn = document.getElementById('mob-tab-_tools');
    if (toolsBtn) toolsBtn.classList.add('active');
    OmicsLab.Router?.navigate(id);
  }

  function _injectSheetStyles() {
    if (document.getElementById('mob-sheet-styles')) return;
    const s = document.createElement('style');
    s.id = 'mob-sheet-styles';
    s.textContent = `
      .mob-tool-item{
        display:flex;align-items:center;gap:.45rem;
        background:var(--bg-surface,#111B2E);
        border:1px solid var(--border-default,#182236);
        border-radius:8px;padding:.55rem .65rem;
        font-size:.78rem;font-weight:600;
        color:var(--text-secondary,#A8A098);
        cursor:pointer;text-align:left;
        min-height:44px;
        transition:background .1s,border-color .1s;
        -webkit-tap-highlight-color:transparent;
      }
      .mob-tool-item:active{background:var(--bg-overlay,#182236)}
      .mob-tool-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0}
    `;
    document.head.appendChild(s);
  }

  /* ─── Public API — called by router to sync active state ─── */
  function syncPage(page) {
    /* Map page → tab id */
    const tabMap = {
      home: 'home',
      lab: 'lab', 'virtual-lab': 'lab', outbreak: 'lab', debugger: 'lab',
      profile: 'profile', settings: 'profile', guide: 'profile',
      research: 'research', africa: 'research', datasets: 'research',
      nexus: 'research', paperhub: 'research', teams: 'research',
      grants: 'research', alerts: 'research', labnotebook: 'research',
      'output-tracker': 'research', collab: 'research', impact: 'research',
    };
    const tools = [
      'analysis','variantinterp','primerdesign','phylo','heatmap','study',
      'qualitypredictor','knowledge-graph','gene-lookup','pathways','pubmed',
      'terminal','codon','nanopore','amr','kraken','popstruct','genome-browser','gatk',
      'uniprot','protein','string','preprints','sra','pipeline-gen','metaanalysis',
      'citations','bionlp','assistant','ask','learn','glossary','case-files',
      'seq-align','pipeline-visual','journalclub','quizbattle','epigenomics',
      'crispr','proteomics','ai-ml-bio','stats-genomics','gwas','pharmacogenomics',
      'single-cell','assembly','enrichment','recombination','alignment-viewer',
    ];

    if (tools.includes(page)) {
      _setActive('_tools');
      const toolsBtn = document.getElementById('mob-tab-_tools');
      if (toolsBtn) toolsBtn.classList.add('active');
      return;
    }

    const tabId = tabMap[page] || 'home';
    _setActive(tabId);
  }

  function _esc(s) { return String(s||'').replace(/[<>&"']/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&#39;'}[c])); }

  /* ─── Init ─── */
  function init() {
    _build();
  }

  return { init, syncPage, _onTab, _pickTool, _setActive };
})();
