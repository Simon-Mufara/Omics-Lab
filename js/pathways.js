/* ═══════════════════════════════════════════════════════════════
   OmicsLab — Biological Pathways: KEGG + Reactome (Prompts 47 & 52)
   ─ Africa-priority disease pathways
   ─ KEGG image maps + Reactome embedded browser
   ─ Gene→pathway lookup, live KEGG keyword search
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.Pathways = (function () {

  const KEGG_BASE = 'https://rest.kegg.jp';

  const AFRICA_PATHWAYS = [
    { id: 'hsa05144', name: 'Malaria',                    cat: 'Infectious Disease',   kegg: 'hsa05144', react: 'R-HSA-1280215', color: '#f97316', genes: ['HBB','GYPA','CD36','CR1'],          desc: 'P. falciparum invasion, G6PD interaction, haemoglobin polymerisation, cytoadherence in African populations.' },
    { id: 'hsa05152', name: 'Tuberculosis',               cat: 'Infectious Disease',   kegg: 'hsa05152', react: 'R-HSA-5620971', color: '#e3b341', genes: ['TNF','IL10','TLR2','VDR'],           desc: 'M. tuberculosis survival in macrophages, immune evasion — MTB is the leading infectious disease killer in Africa.' },
    { id: 'hsa05170', name: 'HIV Infection',              cat: 'Infectious Disease',   kegg: 'hsa05170', react: 'R-HSA-162906',  color: '#bc8cff', genes: ['CCR5','TRIM5','APOBEC3G','BST2'],   desc: 'HIV-1 entry, innate restriction factors, CCR5 delta32 absent in most African populations.' },
    { id: 'hsa00480', name: 'Glutathione Metabolism',     cat: 'Metabolism',           kegg: 'hsa00480', react: 'R-HSA-174403',  color: '#3fb950', genes: ['G6PD','GSS','GPX1','GCLC'],         desc: 'G6PD deficiency — redox balance, haemolytic anaemia, antimalarial drug toxicity (primaquine, dapsone).' },
    { id: 'hsa00030', name: 'Pentose Phosphate Pathway',  cat: 'Metabolism',           kegg: 'hsa00030', react: 'R-HSA-71336',   color: '#3fb950', genes: ['G6PD','PGD','RPIA','TALDO1'],       desc: 'G6PD central role in erythrocyte NADPH production — key to malaria parasite-induced oxidative stress defence.' },
    { id: 'hsa04620', name: 'Toll-like Receptor Signalling', cat: 'Immune System',     kegg: 'hsa04620', react: 'R-HSA-168928',  color: '#58a6ff', genes: ['TLR1','TLR4','TLR6','MYD88'],       desc: 'TLR4 Asp299Gly variant at high frequency in Africa — alters malaria and sepsis susceptibility.' },
    { id: 'hsa04060', name: 'Cytokine–Cytokine Receptor', cat: 'Immune System',        kegg: 'hsa04060', react: 'R-HSA-1280215', color: '#58a6ff', genes: ['TNF','IL6','IFNG','IL10'],           desc: 'Cytokine profiles differ substantially in African malaria, TB, and HIV co-infections.' },
    { id: 'hsa05133', name: 'Pertussis',                  cat: 'Infectious Disease',   kegg: 'hsa05133', react: 'R-HSA-5620971', color: '#f97316', genes: ['TLR4','IL1B','NFKB1','CASP1'],      desc: 'Bordetella pertussis — re-emerging in Africa; vaccine-schedule gaps in under-5 cohorts.' },
  ];

  const GENE_EXAMPLES = [
    { symbol:'HBB',   ncbiId:'3043', label:'HBB (Sickle cell / beta-thal)' },
    { symbol:'G6PD',  ncbiId:'2539', label:'G6PD (G6PD deficiency)' },
    { symbol:'APOL1', ncbiId:'8542', label:'APOL1 (CKD in Africa)' },
    { symbol:'TNF',   ncbiId:'7124', label:'TNF (Malaria/TB immunity)' },
    { symbol:'CCR5',  ncbiId:'1234', label:'CCR5 (HIV entry receptor)' },
    { symbol:'TLR4',  ncbiId:'7099', label:'TLR4 (Sepsis/Malaria risk)' },
  ];

  let _activeTab = 'kegg';
  let _selectedPath = AFRICA_PATHWAYS[0];
  let _mapScale = 1;
  let _searchTimer = null;

  /* ─── Escape helper ─── */
  function _esc(s) {
    return String(s).replace(/[<>&"']/g, c => ({ '<':'&lt;', '>':'&gt;', '&':'&amp;', '"':'&quot;', "'":'&#39;' }[c]));
  }

  /* ─── Tab switch ─── */
  function _switchTab(tab) {
    _activeTab = tab;
    ['kegg', 'reactome'].forEach(t => {
      const btn = document.getElementById(`pw-tab-${t}`);
      const pnl = document.getElementById(`pw-panel-${t}`);
      if (btn) btn.classList.toggle('pw-tab-active', t === tab);
      if (pnl) pnl.style.display = t === tab ? '' : 'none';
    });
    if (tab === 'reactome') _renderReactome();
  }

  /* ─── Select pathway from sidebar ─── */
  function _selectPath(id) {
    _selectedPath = AFRICA_PATHWAYS.find(p => p.id === id) || AFRICA_PATHWAYS[0];
    document.querySelectorAll('.pw-path-item').forEach(el =>
      el.classList.toggle('pw-path-active', el.dataset.id === id));
    if (_activeTab === 'kegg') _renderPathwayDetail();
    else _renderReactome();
  }

  /* ─── Render KEGG detail panel ─── */
  function _renderPathwayDetail() {
    const p = _selectedPath;
    const wrap = document.getElementById('pw-kegg-map-wrap');
    if (!wrap) return;
    wrap.innerHTML = `
      <div class="pw-map-header">
        <div>
          <div class="pw-map-title">${_esc(p.name)}</div>
          <span class="pw-map-cat" style="background:${p.color}22;color:${p.color}">${_esc(p.cat)}</span>
        </div>
        <div class="pw-map-controls">
          <button class="pw-ctrl-btn" onclick="OmicsLab.Pathways._zoomMap(1.25)" title="Zoom in">+</button>
          <button class="pw-ctrl-btn" onclick="OmicsLab.Pathways._zoomMap(0.8)" title="Zoom out">−</button>
          <button class="pw-ctrl-btn" onclick="OmicsLab.Pathways._zoomMap(1)" title="Reset">1:1</button>
          <a class="pw-ext-link" href="https://www.kegg.jp/kegg-bin/show_pathway?${p.kegg}" target="_blank" rel="noopener">
            KEGG.jp
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          </a>
          <a class="pw-ext-link" href="https://reactome.org/PathwayBrowser/#/${p.react}" target="_blank" rel="noopener">
            Reactome
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          </a>
        </div>
      </div>
      <div class="pw-map-desc">${_esc(p.desc)}</div>
      <div class="pw-map-genes"><span class="pw-genes-label">Key genes:</span> ${p.genes.map(g => `<span class="pw-gene-chip">${g}</span>`).join('')}</div>
      <div class="pw-map-scroll">
        <div class="pw-map-inner" id="pw-map-inner">
          <img class="pw-map-img" id="pw-map-img"
            src="https://rest.kegg.jp/get/${p.kegg}/image"
            alt="${_esc(p.name)} KEGG pathway"
            style="opacity:0;transition:opacity .35s"
            onload="this.style.opacity=1"
            onerror="document.getElementById('pw-map-inner').innerHTML='<div class=pw-map-err>KEGG image unavailable — <a href=https://www.kegg.jp/kegg-bin/show_pathway?${p.kegg} target=_blank class=pw-ext-link>view on KEGG.jp</a></div>'">
        </div>
      </div>`;
    _mapScale = 1;
  }

  /* ─── Load arbitrary KEGG map ─── */
  function _loadKeggMap(keggId, name) {
    const wrap = document.getElementById('pw-kegg-map-wrap');
    if (!wrap) return;
    wrap.innerHTML = `
      <div class="pw-map-header">
        <div class="pw-map-title">${_esc(name || keggId)}</div>
        <div class="pw-map-controls">
          <button class="pw-ctrl-btn" onclick="OmicsLab.Pathways._zoomMap(1.25)">+</button>
          <button class="pw-ctrl-btn" onclick="OmicsLab.Pathways._zoomMap(0.8)">−</button>
          <button class="pw-ctrl-btn" onclick="OmicsLab.Pathways._zoomMap(1)">1:1</button>
          <a class="pw-ext-link" href="https://www.kegg.jp/kegg-bin/show_pathway?${keggId}" target="_blank" rel="noopener">KEGG.jp →</a>
        </div>
      </div>
      <div class="pw-map-scroll">
        <div class="pw-map-inner" id="pw-map-inner">
          <img class="pw-map-img"
            src="https://rest.kegg.jp/get/${keggId}/image"
            alt="${_esc(keggId)} pathway"
            style="opacity:0;transition:opacity .35s"
            onload="this.style.opacity=1"
            onerror="document.getElementById('pw-map-inner').innerHTML='<div class=pw-map-err>Image unavailable — <a href=https://www.kegg.jp/kegg-bin/show_pathway?${keggId} target=_blank class=pw-ext-link>KEGG.jp</a></div>'">
        </div>
      </div>`;
    _mapScale = 1;
  }

  /* ─── Zoom ─── */
  function _zoomMap(factor) {
    _mapScale = factor === 1 ? 1 : Math.max(0.3, Math.min(5, _mapScale * factor));
    const inner = document.getElementById('pw-map-inner');
    if (inner) inner.style.transform = `scale(${_mapScale})`;
  }

  /* ─── KEGG live keyword search ─── */
  function _debounceSearch(kw) {
    clearTimeout(_searchTimer);
    if (!kw.trim()) { const el = document.getElementById('pw-search-results'); if (el) el.innerHTML = ''; return; }
    _searchTimer = setTimeout(() => _searchKegg(kw), 420);
  }

  async function _searchKegg(keyword) {
    const el = document.getElementById('pw-search-results');
    if (!el) return;
    el.innerHTML = '<div class="pw-loading">Querying KEGG…</div>';
    try {
      const res = await fetch(`${KEGG_BASE}/find/pathway/${encodeURIComponent(keyword)}`, { signal: AbortSignal.timeout ? AbortSignal.timeout(6000) : undefined });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const text = await res.text();
      const rows = text.trim().split('\n').filter(Boolean).slice(0, 14).map(line => {
        const [id, name] = line.split('\t');
        return { id: id.replace('path:', ''), name: name || id };
      });
      if (!rows.length) { el.innerHTML = '<div class="pw-search-empty">No pathways found.</div>'; return; }
      el.innerHTML = rows.map(r => `
        <div class="pw-search-item" onclick="OmicsLab.Pathways._loadKeggMap('${r.id}','${_esc(r.name)}')">
          <span class="pw-search-id">${r.id}</span>
          <span class="pw-search-name">${_esc(r.name)}</span>
        </div>`).join('');
    } catch {
      el.innerHTML = `<div class="pw-search-err">KEGG API requires server-side proxy for browser access.
        <a href="https://www.kegg.jp/kegg-bin/search_pathway_text?query=${encodeURIComponent(keyword)}&org=hsa" target="_blank" rel="noopener" class="pw-ext-link">Search on KEGG.jp →</a></div>`;
    }
  }

  /* ─── Gene → pathways ─── */
  function _onGeneLookup() {
    const sel = document.getElementById('pw-gene-select');
    if (!sel || !sel.value) return;
    const [ncbiId, symbol] = sel.value.split('|');
    _lookupGenePathways(ncbiId, symbol);
  }

  async function _lookupGenePathways(ncbiId, symbol) {
    const el = document.getElementById('pw-gene-result');
    if (!el) return;
    el.innerHTML = '<div class="pw-loading">Fetching pathways…</div>';
    try {
      const res = await fetch(`${KEGG_BASE}/link/pathway/hsa:${ncbiId}`);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const text = await res.text();
      const paths = text.trim().split('\n').filter(Boolean).map(l => l.split('\t')[1]?.replace('path:','') || '');
      if (!paths.length) { el.innerHTML = `<div class="pw-search-empty">No KEGG pathways for ${_esc(symbol)}.</div>`; return; }
      el.innerHTML = `<div class="pw-gene-result-label">${_esc(symbol)} → ${paths.length} pathway(s):</div>
        <div class="pw-gene-path-chips">
          ${paths.slice(0,12).map(pid =>
            `<button class="pw-gene-path-chip" onclick="OmicsLab.Pathways._loadKeggMap('${pid}','${pid}')">${pid}</button>`
          ).join('')}
        </div>`;
    } catch {
      el.innerHTML = `<div class="pw-search-err">KEGG CORS limit.
        <a href="https://www.kegg.jp/dbget-bin/www_bget?${symbol}" target="_blank" rel="noopener" class="pw-ext-link">View ${_esc(symbol)} on KEGG →</a></div>`;
    }
  }

  /* ─── Reactome panel ─── */
  function _renderReactome() {
    const pnl = document.getElementById('pw-reactome-content');
    if (!pnl) return;
    const p = _selectedPath;
    pnl.innerHTML = `
      <div class="pw-reactome-ctrl">
        <label class="pw-select-label">Pathway:</label>
        <select class="pw-select" onchange="OmicsLab.Pathways._loadReactomePathway(this.value)">
          ${AFRICA_PATHWAYS.map(ap =>
            `<option value="${ap.react}"${ap.id === p.id ? ' selected' : ''}>${_esc(ap.name)}</option>`
          ).join('')}
        </select>
        <a class="pw-ext-link" href="https://reactome.org/PathwayBrowser/#/${p.react}" target="_blank" rel="noopener">Full screen →</a>
      </div>
      <div class="pw-reactome-meta">${_esc(p.desc)}</div>
      <div class="pw-reactome-iframe-wrap" id="pw-reactome-iframe-wrap">
        <iframe
          src="https://reactome.org/PathwayBrowser/#/${p.react}"
          title="Reactome — ${_esc(p.name)}"
          class="pw-reactome-iframe"
          loading="lazy"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups">
        </iframe>
      </div>
      <p class="pw-reactome-note">Embedded Reactome Pathway Browser — human-curated biological pathways with full interactive diagram.</p>`;
  }

  function _loadReactomePathway(reactomeId) {
    const path = AFRICA_PATHWAYS.find(p => p.react === reactomeId);
    if (path) {
      _selectedPath = path;
      document.querySelectorAll('.pw-path-item').forEach(el =>
        el.classList.toggle('pw-path-active', el.dataset.id === path.id));
    }
    const wrap = document.getElementById('pw-reactome-iframe-wrap');
    if (wrap) wrap.innerHTML = `<iframe src="https://reactome.org/PathwayBrowser/#/${reactomeId}" title="Reactome Pathway Browser" class="pw-reactome-iframe" loading="lazy" sandbox="allow-scripts allow-same-origin allow-forms allow-popups"></iframe>`;
  }

  /* ─── Init ─── */
  function init() {
    const section = document.getElementById('pathways-section');
    if (!section || section.dataset.pwReady) return;
    section.dataset.pwReady = '1';

    section.innerHTML = `
      <div class="pw-wrap">
        <div class="pw-header">
          <div class="pw-header-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3fb950" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.64 5.64l2.12 2.12M16.24 16.24l2.12 2.12M5.64 18.36l2.12-2.12M16.24 7.76l2.12-2.12"/></svg>
            Biological Pathways
          </div>
          <div class="pw-header-sub">KEGG disease pathway maps · Reactome embedded browser · Africa disease focus</div>
        </div>

        <div class="pw-tabs" role="tablist">
          <button class="pw-tab pw-tab-active" id="pw-tab-kegg" role="tab" aria-selected="true"
            onclick="OmicsLab.Pathways._switchTab('kegg')">KEGG Pathways</button>
          <button class="pw-tab" id="pw-tab-reactome" role="tab" aria-selected="false"
            onclick="OmicsLab.Pathways._switchTab('reactome')">Reactome Browser</button>
        </div>

        <div id="pw-panel-kegg">
          <div class="pw-layout">
            <div class="pw-sidebar">
              <div class="pw-section-label">Africa Disease Pathways</div>
              <div class="pw-path-list">
                ${AFRICA_PATHWAYS.map(p => `
                  <button class="pw-path-item${p.id === _selectedPath.id ? ' pw-path-active' : ''}" data-id="${p.id}"
                    onclick="OmicsLab.Pathways._selectPath('${p.id}')">
                    <span class="pw-path-dot" style="background:${p.color}"></span>
                    <span class="pw-path-texts">
                      <span class="pw-path-name">${_esc(p.name)}</span>
                      <span class="pw-path-cat">${_esc(p.cat)}</span>
                    </span>
                  </button>`).join('')}
              </div>

              <div class="pw-section-label" style="margin-top:1.25rem">Search KEGG</div>
              <input class="pw-search-input" placeholder="Disease or pathway keyword…"
                oninput="OmicsLab.Pathways._debounceSearch(this.value)" autocomplete="off">
              <div id="pw-search-results"></div>

              <div class="pw-section-label" style="margin-top:1.25rem">Gene → Pathways</div>
              <div class="pw-gene-row">
                <select class="pw-select" id="pw-gene-select" style="flex:1">
                  <option value="">Select gene…</option>
                  ${GENE_EXAMPLES.map(g => `<option value="${g.ncbiId}|${g.symbol}">${_esc(g.label)}</option>`).join('')}
                </select>
                <button class="pw-btn" onclick="OmicsLab.Pathways._onGeneLookup()">Find</button>
              </div>
              <div id="pw-gene-result"></div>
            </div>

            <div class="pw-main" id="pw-kegg-map-wrap"></div>
          </div>
        </div>

        <div id="pw-panel-reactome" style="display:none">
          <div id="pw-reactome-content"></div>
        </div>
      </div>`;

    _renderPathwayDetail();
  }

  return { init, _switchTab, _selectPath, _loadKeggMap, _zoomMap, _debounceSearch, _searchKegg, _onGeneLookup, _lookupGenePathways, _loadReactomePathway };
})();
