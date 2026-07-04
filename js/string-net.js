/* ═══════════════════════════════════════════════════════════════
   OmicsLab STRING Network — Prompt 48
   ─ STRING protein-protein interaction API
   ─ Interaction partners table with subscore breakdown
   ─ Score filter, African disease protein quick loads
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.StringNet = (function () {

  const BASE    = 'https://string-db.org/api';
  const SPECIES = 9606; /* Homo sapiens */
  const CALLER  = 'OmicsLab';

  /* Pre-loaded African disease proteins */
  const AFRICA_PROTEINS = [
    { gene: 'HBB',   desc: 'Haemoglobin β — sickle cell' },
    { gene: 'G6PD',  desc: 'G6PD — malaria protection' },
    { gene: 'APOL1', desc: 'Apolipoprotein L1 — CKD risk' },
    { gene: 'TP53',  desc: 'p53 — cancer suppressor' },
    { gene: 'BRCA1', desc: 'BRCA1 — breast cancer' },
    { gene: 'LMNA',  desc: 'Lamin A/C — cardiomyopathy' },
    { gene: 'MYH7',  desc: 'Myosin heavy chain — HCM' },
    { gene: 'IL6',   desc: 'Interleukin-6 — inflammation' },
  ];

  /* Subscore labels */
  const SUBSCORES = [
    { key: 'escore', label: 'Experimental',    color: '#00C4A0' },
    { key: 'dscore', label: 'Database',         color: '#58a6ff' },
    { key: 'tscore', label: 'Text mining',      color: '#e3b341' },
    { key: 'ascore', label: 'Coexpression',     color: '#bc8cff' },
    { key: 'pscore', label: 'Co-occurrence',    color: '#f97316' },
    { key: 'nscore', label: 'Neighborhood',     color: '#79c0ff' },
    { key: 'fscore', label: 'Gene fusion',      color: '#ff7b93' },
  ];

  let _minScore  = 400;
  let _allRows   = [];
  let _protein   = '';

  /* ─── Resolve protein to STRING ID ─── */
  async function _resolve(gene) {
    const params = new URLSearchParams({
      identifier:    gene,
      species:       SPECIES,
      caller_identity: CALLER,
      format:        'json',
      limit:         1,
    });
    const res = await fetch(`${BASE}/json/get_string_ids?${params}`);
    if (!res.ok) throw new Error('STRING resolve failed ' + res.status);
    const data = await res.json();
    if (!data.length) throw new Error(`"${gene}" not found in STRING (Homo sapiens)`);
    return data[0];
  }

  /* ─── Fetch interaction partners ─── */
  async function _fetchPartners(stringId, gene) {
    const params = new URLSearchParams({
      identifier:      stringId,
      species:         SPECIES,
      caller_identity: CALLER,
      format:          'json',
      limit:           50,
    });
    const res = await fetch(`${BASE}/json/interaction_partners?${params}`);
    if (!res.ok) throw new Error('STRING partners fetch failed ' + res.status);
    return res.json();
  }

  /* ─── Main lookup ─── */
  async function _doLookup(gene) {
    if (!gene || !gene.trim()) return;
    gene = gene.trim().toUpperCase();
    _protein = gene;
    _renderLoading(gene);

    try {
      const resolved = await _resolve(gene);
      const rows = await _fetchPartners(resolved.stringId, gene);
      _allRows = rows;
      _renderTable(rows, resolved);
    } catch (err) {
      _renderError(err.message);
    }
  }

  /* ─── Render ─── */
  function _el() { return document.getElementById('sn-results'); }

  function _renderLoading(gene) {
    const el = _el();
    if (el) el.innerHTML = `<div class="sn-loading"><div class="sn-spinner"></div> Fetching STRING interactions for ${_esc(gene)}…</div>`;
  }

  function _renderError(msg) {
    const el = _el();
    if (el) el.innerHTML = `<div class="sn-error"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ff6b6b" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> ${_esc(msg)}</div>`;
  }

  function _renderTable(rows, resolved) {
    const el = _el();
    if (!el) return;

    const filtered = rows.filter(r => (r.score || 0) * 1000 >= _minScore);
    const queryGene = resolved.preferredName || _protein;

    if (!filtered.length) {
      el.innerHTML = `<div class="sn-empty">No interactions above score threshold ${_minScore}. Try lowering the filter.</div>`;
      return;
    }

    /* Summary stats */
    const avgScore = filtered.reduce((s, r) => s + r.score, 0) / filtered.length;
    const expCount = filtered.filter(r => (r.escore || 0) > 0.15).length;

    el.innerHTML = `
      <div class="sn-result-header">
        <div class="sn-result-protein">${_esc(queryGene)} interaction network</div>
        <div class="sn-result-stats">
          <span>${filtered.length} partners</span>
          <span>· avg score ${avgScore.toFixed(3)}</span>
          <span>· ${expCount} experimentally supported</span>
        </div>
        <a class="sn-ext-link" href="https://string-db.org/network/${SPECIES}.${_esc(resolved.stringId)}" target="_blank" rel="noopener">View network on STRING</a>
      </div>

      <div class="sn-legend">
        ${SUBSCORES.map(s => `
          <span class="sn-legend-item">
            <span class="sn-legend-dot" style="background:${s.color}"></span>
            ${s.label}
          </span>`).join('')}
      </div>

      <div class="sn-table-wrap">
        <table class="sn-table">
          <thead>
            <tr>
              <th>Partner</th>
              <th>Combined score</th>
              ${SUBSCORES.map(s => `<th title="${s.label}">${s.label.slice(0,4)}</th>`).join('')}
              <th></th>
            </tr>
          </thead>
          <tbody>
            ${filtered.slice(0, 30).map(r => _rowHtml(r)).join('')}
          </tbody>
        </table>
      </div>`;
  }

  function _rowHtml(r) {
    const partner = r.preferredName_B || r.stringId_B || '—';
    const score   = r.score || 0;
    const pct     = Math.min(score * 100, 100);
    const col     = score > 0.7 ? '#00C4A0' : score > 0.4 ? '#e3b341' : '#58a6ff';

    const subscoreCells = SUBSCORES.map(s => {
      const v = r[s.key] || 0;
      const vPct = Math.min(v * 100, 100);
      return `<td>
        <div class="sn-sub-wrap">
          <div class="sn-sub-bar" style="width:${vPct.toFixed(0)}%;background:${s.color}"></div>
        </div>
      </td>`;
    }).join('');

    return `
      <tr class="sn-row">
        <td>
          <span class="sn-partner-name">${_esc(partner)}</span>
        </td>
        <td>
          <div class="sn-score-wrap">
            <div class="sn-score-bar" style="width:${pct.toFixed(0)}%;background:${col}"></div>
            <span class="sn-score-val">${score.toFixed(3)}</span>
          </div>
        </td>
        ${subscoreCells}
        <td>
          <div class="sn-row-actions">
            <button class="sn-row-btn" onclick="OmicsLab.StringNet._drillDown('${_esc(partner)}')">Expand</button>
            <button class="sn-row-btn" onclick="OmicsLab.GeneLookup && (OmicsLab.Router.navigate('gene-lookup'), setTimeout(()=>OmicsLab.GeneLookup._quickLookup('${_esc(partner)}'),400))">Gene</button>
          </div>
        </td>
      </tr>`;
  }

  function _drillDown(gene) {
    const inp = document.getElementById('sn-gene-input');
    if (inp) inp.value = gene;
    _doLookup(gene);
    const el = document.getElementById('sn-results');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function _setScore(val) {
    _minScore = parseInt(val, 10);
    const label = document.getElementById('sn-score-label');
    if (label) label.textContent = val;
    if (_allRows.length) {
      const inp = document.getElementById('sn-gene-input');
      const gene = inp?.value || _protein;
      _renderTable(_allRows, { preferredName: gene, stringId: gene });
    }
  }

  function _quickLoad(gene) {
    const inp = document.getElementById('sn-gene-input');
    if (inp) inp.value = gene;
    _doLookup(gene);
  }

  function _esc(s) {
    return (s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  /* ─── Init ─── */
  function init() {
    const section = document.getElementById('string-section');
    if (!section || section.dataset.snReady) return;
    section.dataset.snReady = '1';

    section.innerHTML = `
      <div class="sn-wrap">
        <div class="sn-header">
          <div class="sn-header-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
            STRING Protein Interactions
          </div>
          <div class="sn-header-sub">Live STRING v12 — experimental, database, co-expression, text-mining scores</div>
        </div>

        <div class="sn-search-bar">
          <div class="sn-search-row">
            <input type="text" class="sn-gene-input" id="sn-gene-input"
              placeholder="Protein / gene symbol — e.g. HBB, TP53, APOL1…"
              onkeydown="if(event.key==='Enter') OmicsLab.StringNet._doLookup(this.value)"/>
            <button class="sn-search-btn" onclick="OmicsLab.StringNet._doLookup(document.getElementById('sn-gene-input').value)">Find interactions</button>
          </div>

          <div class="sn-filter-row">
            <label class="sn-filter-label">Min combined score: <strong id="sn-score-label">400</strong></label>
            <input type="range" class="sn-score-range" min="150" max="900" step="50" value="400"
              oninput="OmicsLab.StringNet._setScore(this.value)"/>
            <span class="sn-score-hint">Low confidence = 150 · Medium = 400 · High = 700 · Highest = 900</span>
          </div>
        </div>

        <div class="sn-quick-proteins">
          <span class="sn-quick-label">African disease proteins:</span>
          ${AFRICA_PROTEINS.map(p =>
            `<button class="sn-protein-chip" onclick="OmicsLab.StringNet._quickLoad('${p.gene}')" title="${_esc(p.desc)}">${p.gene}</button>`
          ).join('')}
        </div>

        <div id="sn-results" class="sn-results">
          <div class="sn-empty">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#354060" stroke-width="1.25" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
            <div>Enter a protein name or choose one above</div>
          </div>
        </div>
      </div>`;
  }

  return { init, _doLookup, _quickLoad, _setScore, _drillDown };
})();
