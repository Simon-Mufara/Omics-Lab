/* ═══════════════════════════════════════════════════════════════
   OmicsLab PubMed — Live NCBI Literature Search (Prompt 41)
   ─ E-utilities API (no key required for ≤3 req/sec)
   ─ Africa-first filter, article type filter, date range
   ─ Save to PaperHub, open in Article Analyser, CSV export
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.PubMed = (function () {

  const BASE    = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';
  const RETMAX  = 20;

  /* Africa keyword filter */
  const AFRICA_FILTER = '("Africa"[tiab] OR "sub-Saharan"[tiab] OR "Nigeria"[tiab] OR "Kenya"[tiab] OR "South Africa"[tiab] OR "Ethiopia"[tiab] OR "Ghana"[tiab] OR "Uganda"[tiab] OR "Tanzania"[tiab] OR "Zimbabwe"[tiab] OR "Malawi"[tiab] OR "Zambia"[tiab] OR "Senegal"[tiab] OR "Rwanda"[tiab] OR "H3Africa"[tiab] OR "AWI-Gen"[tiab])';

  /* Pre-built quick searches */
  const QUICK_SEARCHES = [
    { label: 'Africa WGS studies',           q: 'whole genome sequencing Africa cohort' },
    { label: 'Malaria genomics',              q: 'malaria Plasmodium falciparum genomics Africa' },
    { label: 'Sickle cell disease Africa',   q: 'sickle cell disease HBB Africa genetics' },
    { label: 'TB drug resistance Africa',    q: 'tuberculosis drug resistance WGS Africa rpoB' },
    { label: 'H3Africa consortium',          q: 'H3Africa consortium genomics' },
    { label: 'APOL1 kidney disease',         q: 'APOL1 kidney disease Africa' },
    { label: 'Nanopore sequencing Africa',   q: 'Oxford Nanopore MinION Africa field sequencing' },
    { label: 'COVID Africa genomics',        q: 'SARS-CoV-2 Africa variant genomics sequencing' },
  ];

  /* State */
  let _query    = '';
  let _retstart = 0;
  let _total    = 0;
  let _africaOn = true;
  let _dateRange = '';      /* '' | '5' | '10' */
  let _artType   = '';      /* '' | 'review' | 'clinical-trial' | 'meta-analysis' */
  let _debTimer  = null;
  let _lastResults = [];

  /* ─── Build NCBI query string ─── */
  function _buildQuery(term) {
    let q = term.trim();
    if (!q) return '';
    if (_africaOn) q += ' AND ' + AFRICA_FILTER;
    if (_artType === 'review')         q += ' AND "review"[pt]';
    if (_artType === 'clinical-trial') q += ' AND "clinical trial"[pt]';
    if (_artType === 'meta-analysis')  q += ' AND "meta-analysis"[pt]';
    if (_dateRange === '5')  q += ' AND ("last 5 years"[pdat])';
    if (_dateRange === '10') q += ' AND ("last 10 years"[pdat])';
    return q;
  }

  /* ─── Fetch article IDs ─── */
  async function _searchIds(query, retstart) {
    const url = `${BASE}/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmax=${RETMAX}&retstart=${retstart}&retmode=json&usehistory=n`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('NCBI search failed: ' + res.status);
    const data = await res.json();
    return {
      ids:   data.esearchresult.idlist || [],
      total: parseInt(data.esearchresult.count || '0', 10),
    };
  }

  /* ─── Fetch article summaries ─── */
  async function _fetchSummaries(ids) {
    if (!ids.length) return [];
    const url = `${BASE}/esummary.fcgi?db=pubmed&id=${ids.join(',')}&retmode=json`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('NCBI summary fetch failed');
    const data = await res.json();
    const result = data.result;
    return ids.map(id => {
      const a = result[id];
      if (!a) return null;
      const authors = (a.authors || []).slice(0, 3).map(au => au.name).join(', ');
      const moreAuth = (a.authors || []).length > 3 ? ' et al.' : '';
      return {
        pmid:     id,
        title:    a.title || 'No title',
        authors:  authors + moreAuth,
        journal:  a.source || '',
        year:     a.pubdate ? a.pubdate.slice(0, 4) : '',
        abstract: '', /* fetched separately if needed */
        doi:      (a.articleids || []).find(x => x.idtype === 'doi')?.value || '',
      };
    }).filter(Boolean);
  }

  /* ─── Fetch abstracts for visible results ─── */
  async function _fetchAbstracts(ids) {
    if (!ids.length) return {};
    const url = `${BASE}/efetch.fcgi?db=pubmed&id=${ids.join(',')}&rettype=abstract&retmode=xml`;
    const res = await fetch(url);
    if (!res.ok) return {};
    const text = await res.text();
    const parser = new DOMParser();
    const xml = parser.parseFromString(text, 'text/xml');
    const out = {};
    xml.querySelectorAll('PubmedArticle').forEach(article => {
      const pmid = article.querySelector('PMID')?.textContent;
      const abs  = article.querySelector('AbstractText')?.textContent || '';
      if (pmid) out[pmid] = abs.slice(0, 400) + (abs.length > 400 ? '…' : '');
    });
    return out;
  }

  /* ─── Main search ─── */
  async function _doSearch(page = 0) {
    const q = _buildQuery(_query);
    if (!q) { _renderEmpty('Enter a search term above.'); return; }

    _retstart = page * RETMAX;
    _renderLoading();

    try {
      const { ids, total } = await _searchIds(q, _retstart);
      _total = total;

      if (!ids.length) { _renderEmpty('No results found. Try broadening your search or disabling the Africa filter.'); return; }

      const articles = await _fetchSummaries(ids);
      const abstracts = await _fetchAbstracts(ids);
      articles.forEach(a => { a.abstract = abstracts[a.pmid] || ''; });

      _lastResults = articles;
      _renderResults(articles, total, page);

    } catch (err) {
      _renderError('Could not reach NCBI — check your internet connection. ' + err.message);
    }
  }

  /* ─── Render states ─── */
  function _resultsEl() { return document.getElementById('pm-results'); }

  function _renderLoading() {
    const el = _resultsEl();
    if (el) el.innerHTML = `<div class="pm-loading"><div class="pm-spinner"></div> Searching PubMed…</div>`;
  }

  function _renderEmpty(msg) {
    const el = _resultsEl();
    if (el) el.innerHTML = `<div class="pm-empty"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#354060" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg><div>${msg}</div></div>`;
  }

  function _renderError(msg) {
    const el = _resultsEl();
    if (el) el.innerHTML = `<div class="pm-error"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ff6b6b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> ${msg}</div>`;
  }

  function _renderResults(articles, total, page) {
    const el = _resultsEl();
    if (!el) return;

    const totalPages = Math.ceil(total / RETMAX);
    const current    = page + 1;

    el.innerHTML = `
      <div class="pm-results-header">
        <span class="pm-count">${total.toLocaleString()} results</span>
        <button class="pm-export-btn" onclick="OmicsLab.PubMed.exportCSV()">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Export CSV
        </button>
      </div>

      <div class="pm-article-list">
        ${articles.map(a => _articleHtml(a)).join('')}
      </div>

      ${totalPages > 1 ? `
        <div class="pm-pagination">
          <button class="pm-page-btn" onclick="OmicsLab.PubMed._page(${page - 1})" ${page === 0 ? 'disabled' : ''}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6"/></svg>
            Previous
          </button>
          <span class="pm-page-info">Page ${current} of ${totalPages}</span>
          <button class="pm-page-btn" onclick="OmicsLab.PubMed._page(${page + 1})" ${page >= totalPages - 1 ? 'disabled' : ''}>
            Next
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>` : ''}`;
  }

  function _articleHtml(a) {
    const pubmedUrl = `https://pubmed.ncbi.nlm.nih.gov/${a.pmid}/`;
    return `
      <div class="pm-article-card">
        <div class="pm-article-meta">
          <span class="pm-journal">${_esc(a.journal)}</span>
          ${a.year ? `<span class="pm-year">${a.year}</span>` : ''}
          <span class="pm-pmid">PMID ${a.pmid}</span>
        </div>
        <a class="pm-article-title" href="${pubmedUrl}" target="_blank" rel="noopener">${_esc(a.title)}</a>
        ${a.authors ? `<div class="pm-authors">${_esc(a.authors)}</div>` : ''}
        ${a.abstract ? `<div class="pm-abstract">${_esc(a.abstract)}</div>` : ''}
        <div class="pm-article-actions">
          <a class="pm-action-link" href="${pubmedUrl}" target="_blank" rel="noopener">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            PubMed
          </a>
          ${a.doi ? `<a class="pm-action-link" href="https://doi.org/${a.doi}" target="_blank" rel="noopener">DOI</a>` : ''}
          <button class="pm-action-btn" onclick="OmicsLab.PubMed.saveToPaperHub('${a.pmid}')">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
            Save to PaperHub
          </button>
          <button class="pm-action-btn" onclick="OmicsLab.PubMed.analyseArticle('${a.pmid}')">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            Analyse
          </button>
        </div>
      </div>`;
  }

  /* ─── Actions ─── */
  function saveToPaperHub(pmid) {
    const a = _lastResults.find(r => r.pmid === pmid);
    if (!a) return;
    /* Add to PaperHub library */
    if (OmicsLab.PaperHub && OmicsLab.PaperHub._addFromPubMed) {
      OmicsLab.PaperHub._addFromPubMed(a);
      _toast('Saved to PaperHub');
    } else {
      _toast('Navigate to PaperHub to see saved papers');
    }
  }

  function analyseArticle(pmid) {
    const a = _lastResults.find(r => r.pmid === pmid);
    if (!a) return;
    const text = [a.title, a.authors, a.journal + ' ' + a.year, a.abstract].join('\n\n');
    /* Navigate to Teams Article Analyser and pre-fill */
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
    const rows = [['PMID', 'Title', 'Authors', 'Journal', 'Year', 'DOI']];
    _lastResults.forEach(a => {
      rows.push([a.pmid, `"${a.title.replace(/"/g,'""')}"`, `"${a.authors}"`, a.journal, a.year, a.doi]);
    });
    const csv  = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const el   = document.createElement('a');
    el.href    = url;
    el.download = 'pubmed-results.csv';
    el.click();
    URL.revokeObjectURL(url);
  }

  /* ─── UI helpers ─── */
  function _page(n) {
    if (n < 0) return;
    _doSearch(n);
    const el = document.getElementById('pm-results');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function _debounce(fn, delay) {
    clearTimeout(_debTimer);
    _debTimer = setTimeout(fn, delay);
  }

  function _toast(msg) {
    OmicsLab.Notify.success(msg);
  }

  function _esc(s) {
    return (s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  function _toggleAfricaFilter() {
    _africaOn = !_africaOn;
    const btn = document.getElementById('pm-africa-btn');
    if (btn) {
      btn.classList.toggle('pm-filter-active', _africaOn);
      btn.textContent = _africaOn ? 'Africa filter: ON' : 'Africa filter: OFF';
    }
    if (_query) _doSearch(0);
  }

  function _quickSearch(q) {
    _query = q;
    const input = document.getElementById('pm-search-input');
    if (input) input.value = q;
    _doSearch(0);
  }

  /* ─── Init ─── */
  function init() {
    const section = document.getElementById('pubmed-section');
    if (!section || section.dataset.pmReady) return;
    section.dataset.pmReady = '1';

    section.innerHTML = `
      <div class="pm-wrap">
        <div class="pm-header">
          <div class="pm-header-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            PubMed Live Search
          </div>
          <div class="pm-header-sub">Search 36 million citations — Africa-first filter active by default</div>
        </div>

        <div class="pm-search-bar">
          <div class="pm-search-row">
            <div class="pm-search-input-wrap">
              <svg class="pm-search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input type="text" class="pm-search-input" id="pm-search-input"
                placeholder="Search PubMed — e.g. sickle cell HBB Nigeria genomics…"
                oninput="OmicsLab.PubMed._onInput(this.value)"
                onkeydown="if(event.key==='Enter') OmicsLab.PubMed._doSearch(0)"/>
            </div>
            <button class="pm-search-btn" onclick="OmicsLab.PubMed._doSearch(0)">Search</button>
          </div>

          <div class="pm-filters">
            <button class="pm-filter-btn pm-filter-active" id="pm-africa-btn" onclick="OmicsLab.PubMed._toggleAfricaFilter()">Africa filter: ON</button>
            <select class="pm-filter-select" onchange="OmicsLab.PubMed._setDate(this.value)">
              <option value="">Any date</option>
              <option value="5">Last 5 years</option>
              <option value="10">Last 10 years</option>
            </select>
            <select class="pm-filter-select" onchange="OmicsLab.PubMed._setType(this.value)">
              <option value="">All types</option>
              <option value="review">Reviews only</option>
              <option value="clinical-trial">Clinical trials</option>
              <option value="meta-analysis">Meta-analyses</option>
            </select>
          </div>
        </div>

        <div class="pm-quick-searches">
          <div class="pm-quick-label">Quick searches:</div>
          ${QUICK_SEARCHES.map(s =>
            `<button class="pm-quick-btn" onclick="OmicsLab.PubMed._quickSearch('${_esc(s.q)}')">${s.label}</button>`
          ).join('')}
        </div>

        <div class="pm-body">
          <div id="pm-results" class="pm-results">
            <div class="pm-empty">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#354060" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <div>Enter a search term or choose a quick search above</div>
            </div>
          </div>
        </div>
      </div>`;
  }

  function _onInput(val) {
    _query = val;
    _debounce(() => { if (_query.length >= 3) _doSearch(0); }, 350);
  }

  function _setDate(val) { _dateRange = val; if (_query) _doSearch(0); }
  function _setType(val) { _artType   = val; if (_query) _doSearch(0); }

  return { init, exportCSV, saveToPaperHub, analyseArticle, _doSearch, _page, _quickSearch, _toggleAfricaFilter, _onInput, _setDate, _setType };
})();
