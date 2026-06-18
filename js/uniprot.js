/* ═══════════════════════════════════════════════════════════════
   OmicsLab UniProt Search — Prompt 45
   ─ UniProt REST API: search, protein cards, function, diseases
   ─ Cross-links to Protein Viewer (AlphaFold) and Gene Lookup
   ─ Africa protein set pre-loaded
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.UniProt = (function () {

  const BASE = 'https://rest.uniprot.org/uniprotkb';

  const FIELDS = [
    'accession', 'gene_names', 'protein_name', 'organism_name',
    'sequence_length', 'annotation_score', 'cc_function',
    'cc_disease', 'cc_subcellular_location', 'feature_count',
    'xref_ensembl',
  ].join(',');

  /* Quick Africa proteins */
  const AFRICA_QUERIES = [
    { label: 'Sickle cell (HBB)',       q: 'gene:HBB AND organism_id:9606 AND reviewed:true' },
    { label: 'G6PD deficiency',          q: 'gene:G6PD AND organism_id:9606 AND reviewed:true' },
    { label: 'APOL1 kidney disease',    q: 'gene:APOL1 AND organism_id:9606 AND reviewed:true' },
    { label: 'P. falciparum proteins',  q: 'organism_id:36329 AND reviewed:true' },
    { label: 'TB (M. tuberculosis)',     q: 'organism_id:83332 AND reviewed:true' },
    { label: 'HIV-1 proteins',          q: 'organism_id:11676 AND reviewed:true' },
    { label: 'African trypanosomes',    q: 'organism_id:5691 AND reviewed:true' },
    { label: 'Lassa virus',             q: 'organism_id:11620 AND reviewed:true' },
  ];

  let _lastResults = [];
  let _debTimer    = null;
  let _page        = 0;
  let _total       = 0;
  let _query       = '';
  let _reviewed    = true;
  const PAGE_SIZE  = 20;

  /* ─── Search ─── */
  async function _doSearch(page = 0) {
    if (!_query.trim()) { _renderEmpty('Enter a protein name, gene, or disease above.'); return; }
    _page = page;
    _renderLoading();

    let q = _query.trim();
    if (_reviewed && !q.includes('reviewed:')) q += ' AND reviewed:true';

    const params = new URLSearchParams({
      query:  q,
      format: 'json',
      size:   PAGE_SIZE,
      cursor: page > 0 ? _cursor || '' : '',
      fields: FIELDS,
    });
    if (page === 0) delete _cursor;

    try {
      const url = `${BASE}/search?${params}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('UniProt API ' + res.status);

      /* Capture next-page link from Link header */
      const link = res.headers.get('Link') || '';
      const nextMatch = link.match(/<([^>]+)>;\s*rel="next"/);
      _nextLink = nextMatch ? nextMatch[1] : null;

      const data = await res.json();
      _total = parseInt(res.headers.get('X-Total-Results') || '0', 10) || (data.results || []).length;
      _lastResults = data.results || [];
      _renderResults(_lastResults);
    } catch (err) {
      _renderError('Could not reach UniProt — ' + err.message);
    }
  }

  let _nextLink = null;

  async function _nextPage() {
    if (!_nextLink) return;
    _renderLoading();
    try {
      const res = await fetch(_nextLink);
      if (!res.ok) throw new Error('UniProt API ' + res.status);
      const link = res.headers.get('Link') || '';
      const nm = link.match(/<([^>]+)>;\s*rel="next"/);
      _nextLink = nm ? nm[1] : null;
      const data = await res.json();
      _lastResults = data.results || [];
      _page++;
      _renderResults(_lastResults);
    } catch (err) {
      _renderError(err.message);
    }
  }

  /* ─── Helpers ─── */
  function _proteinName(entry) {
    const rec = entry.proteinDescription?.recommendedName;
    return rec?.fullName?.value || entry.proteinDescription?.submissionNames?.[0]?.fullName?.value || '—';
  }

  function _geneNames(entry) {
    return (entry.genes || []).map(g => g.geneName?.value || '').filter(Boolean).join(', ') || '—';
  }

  function _functionText(entry) {
    const fn = (entry.comments || []).find(c => c.commentType === 'FUNCTION');
    const text = fn?.texts?.[0]?.value || '';
    return text ? text.slice(0, 240) + (text.length > 240 ? '…' : '') : '';
  }

  function _diseases(entry) {
    return (entry.comments || [])
      .filter(c => c.commentType === 'DISEASE')
      .map(c => c.disease?.diseaseId || c.disease?.diseaseName || '')
      .filter(Boolean)
      .slice(0, 4);
  }

  function _subcellular(entry) {
    const sc = (entry.comments || []).find(c => c.commentType === 'SUBCELLULAR_LOCATION');
    return (sc?.subcellularLocations || []).map(l => l.location?.value).filter(Boolean).slice(0, 3).join(', ');
  }

  function _score(entry) {
    return entry.annotationScore || 0;
  }

  /* ─── Render ─── */
  function _el() { return document.getElementById('up-results'); }

  function _renderLoading() {
    const el = _el();
    if (el) el.innerHTML = `<div class="up-loading"><div class="up-spinner"></div> Searching UniProt…</div>`;
  }

  function _renderEmpty(msg) {
    const el = _el();
    if (el) el.innerHTML = `<div class="up-empty"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#484f58" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg><div>${msg}</div></div>`;
  }

  function _renderError(msg) {
    const el = _el();
    if (el) el.innerHTML = `<div class="up-error"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ff6b6b" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> ${_esc(msg)}</div>`;
  }

  function _scoreStars(n) {
    const filled = Math.round(n);
    return Array.from({ length: 5 }, (_, i) =>
      `<svg width="9" height="9" viewBox="0 0 24 24" fill="${i < filled ? '#e3b341' : 'none'}" stroke="#e3b341" stroke-width="2" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`
    ).join('');
  }

  function _renderResults(entries) {
    const el = _el();
    if (!el) return;

    if (!entries.length) { _renderEmpty('No results. Try a broader search or toggle reviewed filter.'); return; }

    el.innerHTML = `
      <div class="up-results-header">
        <span class="up-count">${_total.toLocaleString()} proteins</span>
        <span class="up-page-info">Page ${_page + 1}</span>
      </div>
      <div class="up-card-list">
        ${entries.map(e => _cardHtml(e)).join('')}
      </div>
      ${_nextLink ? `
        <div class="up-pagination">
          <button class="up-page-btn" onclick="OmicsLab.UniProt._nextPage()">
            Load next 20
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>` : ''}`;
  }

  function _cardHtml(e) {
    const acc      = e.primaryAccession;
    const name     = _proteinName(e);
    const gene     = _geneNames(e);
    const org      = e.organism?.scientificName || '';
    const length   = e.sequence?.length || 0;
    const fn       = _functionText(e);
    const diseases = _diseases(e);
    const subloc   = _subcellular(e);
    const score    = _score(e);
    const isReviewed = e.entryType?.includes('Swiss') || e.entryType === 'UniProtKB reviewed (Swiss-Prot)';

    return `
      <div class="up-card">
        <div class="up-card-head">
          <div>
            <div class="up-card-name">${_esc(name)}</div>
            <div class="up-card-meta">
              <span class="up-acc">${acc}</span>
              ${gene !== '—' ? `<span class="up-gene">· ${_esc(gene)}</span>` : ''}
              ${org ? `<span class="up-org">· ${_esc(org)}</span>` : ''}
              ${length ? `<span class="up-len">· ${length} aa</span>` : ''}
            </div>
          </div>
          <div class="up-card-badges">
            ${isReviewed ? '<span class="up-badge-reviewed">Swiss-Prot</span>' : '<span class="up-badge-trembl">TrEMBL</span>'}
            <div class="up-score" title="Annotation score">${_scoreStars(score)}</div>
          </div>
        </div>

        ${fn ? `<div class="up-function">${_esc(fn)}</div>` : ''}

        ${diseases.length ? `
          <div class="up-diseases">
            ${diseases.map(d => `<span class="up-disease-tag">${_esc(d)}</span>`).join('')}
          </div>` : ''}

        ${subloc ? `<div class="up-subloc"><span class="up-subloc-label">Location:</span> ${_esc(subloc)}</div>` : ''}

        <div class="up-card-actions">
          <a class="up-action-link" href="https://www.uniprot.org/uniprot/${acc}" target="_blank" rel="noopener">UniProt</a>
          <button class="up-action-btn" onclick="OmicsLab.UniProt._viewStructure('${acc}','${_esc(gene.split(',')[0].trim())}')">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M2 12C2 6.48 6.48 2 12 2s10 4.48 10 10-4.48 10-10 10S2 17.52 2 12z"/><path d="M12 8v4l3 3"/></svg>
            AlphaFold structure
          </button>
          ${gene !== '—' ? `
            <button class="up-action-btn" onclick="OmicsLab.UniProt._lookupGene('${_esc(gene.split(',')[0].trim())}')">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>
              Gene Lookup
            </button>` : ''}
        </div>
      </div>`;
  }

  function _viewStructure(acc, gene) {
    if (OmicsLab.Router) OmicsLab.Router.navigate('protein');
    setTimeout(() => {
      const inp = document.getElementById('pv-acc-input');
      const gInp = document.getElementById('pv-gene-input');
      if (inp) inp.value = acc;
      if (gInp && gene) gInp.value = gene;
      OmicsLab.ProteinViewer && OmicsLab.ProteinViewer._lookupAcc();
    }, 400);
  }

  function _lookupGene(gene) {
    if (OmicsLab.Router) OmicsLab.Router.navigate('gene-lookup');
    setTimeout(() => {
      const inp = document.getElementById('gl-gene-input');
      if (inp) inp.value = gene;
      OmicsLab.GeneLookup && OmicsLab.GeneLookup._quickLookup(gene);
    }, 400);
  }

  function _esc(s) {
    return (s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function _quickSearch(q) {
    _query = q;
    const inp = document.getElementById('up-search-input');
    if (inp) inp.value = q;
    _doSearch(0);
  }

  function _onInput(val) {
    _query = val;
    clearTimeout(_debTimer);
    _debTimer = setTimeout(() => { if (_query.length >= 3) _doSearch(0); }, 350);
  }

  function _toggleReviewed() {
    _reviewed = !_reviewed;
    const btn = document.getElementById('up-reviewed-btn');
    if (btn) {
      btn.classList.toggle('up-filter-active', _reviewed);
      btn.textContent = _reviewed ? 'Swiss-Prot only: ON' : 'Swiss-Prot only: OFF';
    }
    if (_query) _doSearch(0);
  }

  /* ─── Init ─── */
  function init() {
    const section = document.getElementById('uniprot-section');
    if (!section || section.dataset.upReady) return;
    section.dataset.upReady = '1';

    section.innerHTML = `
      <div class="up-wrap">
        <div class="up-header">
          <div class="up-header-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
            UniProt Protein Search
          </div>
          <div class="up-header-sub">215M+ proteins — Swiss-Prot curated entries with function and disease annotations</div>
        </div>

        <div class="up-search-bar">
          <div class="up-search-row">
            <input type="text" class="up-search-input" id="up-search-input"
              placeholder="Protein name, gene symbol, UniProt accession or disease — e.g. haemoglobin, HBB, P68871…"
              oninput="OmicsLab.UniProt._onInput(this.value)"
              onkeydown="if(event.key==='Enter') OmicsLab.UniProt._doSearch(0)"/>
            <button class="up-search-btn" onclick="OmicsLab.UniProt._doSearch(0)">Search</button>
          </div>
          <div class="up-filters">
            <button class="up-filter-btn up-filter-active" id="up-reviewed-btn" onclick="OmicsLab.UniProt._toggleReviewed()">Swiss-Prot only: ON</button>
          </div>
        </div>

        <div class="up-quick-searches">
          <div class="up-quick-label">Africa quick searches:</div>
          ${AFRICA_QUERIES.map(q =>
            `<button class="up-quick-btn" onclick="OmicsLab.UniProt._quickSearch('${_esc(q.q)}')">${q.label}</button>`
          ).join('')}
        </div>

        <div id="up-results" class="up-results">
          <div class="up-empty">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#484f58" stroke-width="1.25" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <div>Search UniProt or choose an Africa quick search above</div>
          </div>
        </div>
      </div>`;
  }

  return { init, _doSearch, _nextPage, _quickSearch, _onInput, _toggleReviewed, _viewStructure, _lookupGene };
})();
