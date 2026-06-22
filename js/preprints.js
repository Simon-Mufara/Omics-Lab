/* ═══════════════════════════════════════════════════════════════
   OmicsLab Preprints — Prompt 49
   ─ bioRxiv + medRxiv feed via CrossRef API
   ─ Africa-first filter, category filter, date range
   ─ Save to PaperHub, open in Article Analyser
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.Preprints = (function () {

  const CROSSREF = 'https://api.crossref.org/works';
  const BIORXIV  = 'https://api.biorxiv.org/details/biorxiv';
  const PAGE_SIZE = 20;

  const AFRICA_FILTER = '(Africa OR "sub-Saharan" OR Nigeria OR Kenya OR "South Africa" OR Ethiopia OR Ghana OR Uganda OR Tanzania OR H3Africa OR "AWI-Gen" OR Malawi OR Rwanda OR Zambia)';

  /* Pre-built Africa quick searches */
  const QUICK_SEARCHES = [
    { label: 'Malaria Africa genomics',       q: 'malaria genomics Africa' },
    { label: 'Sickle cell genetics',           q: 'sickle cell HBB Africa' },
    { label: 'COVID Africa variants',          q: 'SARS-CoV-2 Africa sequencing' },
    { label: 'Nanopore Africa field sequencing', q: 'Oxford Nanopore MinION Africa' },
    { label: 'H3Africa consortium',            q: 'H3Africa genomics' },
    { label: 'APOL1 kidney Africa',            q: 'APOL1 kidney disease Africa' },
    { label: 'TB drug resistance Africa',      q: 'tuberculosis drug resistance Africa' },
    { label: 'Pan-African WGS',               q: 'whole genome sequencing African population' },
  ];

  /* bioRxiv subject categories */
  const CATEGORIES = [
    { value: '',               label: 'All subjects' },
    { value: 'genomics',       label: 'Genomics' },
    { value: 'evolutionary-biology', label: 'Evolutionary Biology' },
    { value: 'bioinformatics', label: 'Bioinformatics' },
    { value: 'microbiology',   label: 'Microbiology' },
    { value: 'genetics',       label: 'Genetics' },
    { value: 'epidemiology',   label: 'Epidemiology (medRxiv)' },
    { value: 'infectious-diseases', label: 'Infectious Diseases (medRxiv)' },
  ];

  let _query       = '';
  let _africaOn    = true;
  let _server      = 'all';  /* 'all' | 'biorxiv' | 'medrxiv' */
  let _debTimer    = null;
  let _offset      = 0;
  let _lastResults = [];

  /* ─── Build CrossRef query ─── */
  function _buildQuery(term) {
    let q = term.trim();
    if (_africaOn) q += ' ' + AFRICA_FILTER;
    return q;
  }

  /* ─── CrossRef search ─── */
  async function _searchCrossRef(term, offset = 0) {
    const q = _buildQuery(term);

    let filter = 'type:posted-content';
    if (_server === 'biorxiv')  filter += ',prefix:10.1101';
    if (_server === 'medrxiv')  filter += ',prefix:10.1101'; /* medRxiv also uses 10.1101 */

    const params = new URLSearchParams({
      query:   q,
      filter:  filter,
      rows:    PAGE_SIZE,
      offset:  offset,
      sort:    'relevance',
      select:  'DOI,title,author,posted,abstract,URL,institution,publisher,container-title',
    });

    const res = await fetch(`${CROSSREF}?${params}`, {
      headers: { 'User-Agent': 'OmicsLab (simon.mufara1@gmail.com)' },
    });
    if (!res.ok) throw new Error('CrossRef API ' + res.status);
    const data = await res.json();
    return {
      items: data.message?.items || [],
      total: data.message?.['total-results'] || 0,
    };
  }

  /* ─── Parse preprint item ─── */
  function _parseItem(item) {
    const title = (Array.isArray(item.title) ? item.title[0] : item.title) || 'Untitled';
    const authors = (item.author || []).slice(0, 3).map(a =>
      [a.given, a.family].filter(Boolean).join(' ')
    ).join(', ') + ((item.author || []).length > 3 ? ' et al.' : '');

    const posted = item.posted?.['date-parts']?.[0];
    const dateStr = posted ? posted.join('-') : '';
    const year    = posted?.[0] || '';

    const doi  = item.DOI || '';
    const url  = item.URL || (doi ? `https://doi.org/${doi}` : '');
    const abs  = item.abstract || '';
    const publisher = item.publisher || '';

    /* Determine source server from publisher name */
    const ismedRxiv = publisher.toLowerCase().includes('medrxiv') || publisher.toLowerCase().includes('cold spring harbor laboratory medRxiv');

    return { title, authors, dateStr, year, doi, url, abs, publisher, ismedRxiv };
  }

  /* ─── Main search ─── */
  async function _doSearch(page = 0) {
    if (!_query.trim()) { _renderEmpty('Enter a search term above.'); return; }
    _offset = page * PAGE_SIZE;
    _renderLoading();

    try {
      const { items, total } = await _searchCrossRef(_query, _offset);
      _lastResults = items.map(_parseItem);
      _renderResults(_lastResults, total, page);
    } catch (err) {
      _renderError('Could not reach CrossRef — ' + err.message);
    }
  }

  /* ─── Render ─── */
  function _el() { return document.getElementById('pp-results'); }

  function _renderLoading() {
    const el = _el();
    if (el) el.innerHTML = `<div class="pp-loading"><div class="pp-spinner"></div> Searching bioRxiv &amp; medRxiv preprints…</div>`;
  }

  function _renderEmpty(msg) {
    const el = _el();
    if (el) el.innerHTML = `<div class="pp-empty"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#484f58" stroke-width="1.25" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg><div>${msg}</div></div>`;
  }

  function _renderError(msg) {
    const el = _el();
    if (el) el.innerHTML = `<div class="pp-error"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ff6b6b" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> ${msg}</div>`;
  }

  function _renderResults(items, total, page) {
    const el = _el();
    if (!el) return;

    if (!items.length) { _renderEmpty('No preprints found. Try broader terms or disable Africa filter.'); return; }

    const totalPages = Math.ceil(total / PAGE_SIZE);
    const current    = page + 1;

    el.innerHTML = `
      <div class="pp-results-header">
        <span class="pp-count">${total.toLocaleString()} preprints</span>
        <button class="pp-export-btn" onclick="OmicsLab.Preprints.exportCSV()">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          CSV
        </button>
      </div>

      <div class="pp-card-list">
        ${items.map((p, i) => _cardHtml(p, i)).join('')}
      </div>

      ${totalPages > 1 ? `
        <div class="pp-pagination">
          <button class="pp-page-btn" onclick="OmicsLab.Preprints._doSearch(${page - 1})" ${page === 0 ? 'disabled' : ''}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><polyline points="15 18 9 12 15 6"/></svg> Prev
          </button>
          <span class="pp-page-info">Page ${current} of ${Math.min(totalPages, 50)}</span>
          <button class="pp-page-btn" onclick="OmicsLab.Preprints._doSearch(${page + 1})" ${page >= totalPages - 1 || page >= 49 ? 'disabled' : ''}>
            Next <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>` : ''}`;
  }

  function _cardHtml(p, idx) {
    const serverLabel = p.ismedRxiv ? 'medRxiv' : 'bioRxiv';
    const serverColor = p.ismedRxiv ? '#e3b341' : '#3fb950';
    const absShort = p.abs
      ? p.abs.replace(/<[^>]+>/g, '').slice(0, 320) + (p.abs.length > 320 ? '…' : '')
      : '';

    return `
      <div class="pp-card">
        <div class="pp-card-meta">
          <span class="pp-server" style="color:${serverColor};border-color:${serverColor}40">${serverLabel}</span>
          ${p.year ? `<span class="pp-year">${p.year}</span>` : ''}
          ${p.dateStr ? `<span class="pp-date">${p.dateStr}</span>` : ''}
        </div>
        <a class="pp-title" href="${_esc(p.url)}" target="_blank" rel="noopener">${_esc(p.title)}</a>
        ${p.authors ? `<div class="pp-authors">${_esc(p.authors)}</div>` : ''}
        ${absShort ? `<div class="pp-abstract">${_esc(absShort)}</div>` : ''}
        <div class="pp-card-actions">
          <a class="pp-action-link" href="${_esc(p.url)}" target="_blank" rel="noopener">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            Preprint
          </a>
          ${p.doi ? `<a class="pp-action-link" href="https://doi.org/${p.doi}" target="_blank" rel="noopener">DOI</a>` : ''}
          <button class="pp-action-btn" onclick="OmicsLab.Preprints.analysePreprint(${idx})">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            Analyse
          </button>
        </div>
      </div>`;
  }

  /* ─── Actions ─── */
  function analysePreprint(idx) {
    const p = _lastResults[idx];
    if (!p) return;
    const text = [p.title, p.authors, p.year, p.abs?.replace(/<[^>]+>/g, '') || ''].join('\n\n');
    if (OmicsLab.Router) OmicsLab.Router.navigate('teams');
    setTimeout(() => {
      if (OmicsLab.Teams) {
        OmicsLab.Teams._switchTab('article');
        setTimeout(() => {
          const ta = document.getElementById('art-text-input');
          if (ta) {
            ta.value = text;
            const n = document.getElementById('art-char-count');
            if (n) n.textContent = text.length.toLocaleString();
            OmicsLab.Teams._artAnalyse();
          }
        }, 200);
      }
    }, 400);
  }

  function exportCSV() {
    if (!_lastResults.length) return;
    const rows = [['Title', 'Authors', 'Date', 'DOI', 'URL']];
    _lastResults.forEach(p => {
      rows.push([`"${(p.title||'').replace(/"/g,'""')}"`, `"${p.authors}"`, p.dateStr, p.doi, p.url]);
    });
    const csv  = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url; a.download = 'preprints.csv'; a.click();
    URL.revokeObjectURL(url);
  }

  function _esc(s) {
    return (s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function _toggleAfrica() {
    _africaOn = !_africaOn;
    const btn = document.getElementById('pp-africa-btn');
    if (btn) {
      btn.classList.toggle('pp-filter-active', _africaOn);
      btn.textContent = _africaOn ? 'Africa filter: ON' : 'Africa filter: OFF';
    }
    if (_query) _doSearch(0);
  }

  function _setServer(val) {
    _server = val;
    if (_query) _doSearch(0);
  }

  function _quickSearch(q) {
    _query = q;
    const inp = document.getElementById('pp-search-input');
    if (inp) inp.value = q;
    _doSearch(0);
  }

  function _onInput(val) {
    _query = val;
    clearTimeout(_debTimer);
    _debTimer = setTimeout(() => { if (_query.length >= 3) _doSearch(0); }, 400);
  }

  /* ─── Init ─── */
  function init() {
    const section = document.getElementById('preprints-section');
    if (!section || section.dataset.ppReady) return;
    section.dataset.ppReady = '1';

    section.innerHTML = `
      <div class="pp-wrap">
        <div class="pp-header">
          <div class="pp-header-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            Preprint Feed
          </div>
          <div class="pp-header-sub">bioRxiv &amp; medRxiv via CrossRef — Africa-first filter, analyse in Article Analyser</div>
        </div>

        <div class="pp-search-bar">
          <div class="pp-search-row">
            <input type="text" class="pp-search-input" id="pp-search-input"
              placeholder="Search preprints — e.g. malaria Africa sequencing…"
              oninput="OmicsLab.Preprints._onInput(this.value)"
              onkeydown="if(event.key==='Enter') OmicsLab.Preprints._doSearch(0)"/>
            <button class="pp-search-btn" onclick="OmicsLab.Preprints._doSearch(0)">Search</button>
          </div>
          <div class="pp-filters">
            <button class="pp-filter-btn pp-filter-active" id="pp-africa-btn" onclick="OmicsLab.Preprints._toggleAfrica()">Africa filter: ON</button>
            <select class="pp-filter-select" onchange="OmicsLab.Preprints._setServer(this.value)">
              <option value="all">bioRxiv + medRxiv</option>
              <option value="biorxiv">bioRxiv only</option>
              <option value="medrxiv">medRxiv only</option>
            </select>
          </div>
        </div>

        <div class="pp-quick-searches">
          <div class="pp-quick-label">Quick searches:</div>
          ${QUICK_SEARCHES.map(s =>
            `<button class="pp-quick-btn" onclick="OmicsLab.Preprints._quickSearch('${_esc(s.q)}')">${s.label}</button>`
          ).join('')}
        </div>

        <div id="pp-results" class="pp-results">
          <div class="pp-empty">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#484f58" stroke-width="1.25" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            <div>Enter a search term or choose a quick search above</div>
          </div>
        </div>
      </div>`;
  }

  return { init, analysePreprint, exportCSV, _doSearch, _toggleAfrica, _setServer, _quickSearch, _onInput };
})();
