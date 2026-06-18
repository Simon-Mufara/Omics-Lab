/* ═══════════════════════════════════════════════════════════════
   OmicsLab Open Targets — Prompt 46
   ─ GraphQL API for disease-gene associations
   ─ Dual mode: gene→diseases, disease→genes
   ─ Evidence type breakdown, score bars
   ─ African disease quick lookups
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.OpenTargets = (function () {

  const GQL = 'https://api.platform.opentargets.org/api/v4/graphql';

  /* African disease EFO/MONDO IDs */
  const AFRICA_DISEASES = [
    { label: 'Sickle cell disease',      id: 'EFO_0004251' },
    { label: 'Malaria',                  id: 'EFO_0001068' },
    { label: 'Tuberculosis',             id: 'MONDO_0018076' },
    { label: 'HIV/AIDS',                 id: 'EFO_0000764' },
    { label: 'G6PD deficiency',          id: 'EFO_0000549' },
    { label: 'Chronic kidney disease',   id: 'EFO_0003884' },
    { label: 'Burkitt lymphoma',         id: 'EFO_0000183' },
    { label: 'Lassa fever',              id: 'EFO_0007245' },
  ];

  /* African disease genes */
  const AFRICA_GENES = [
    { label: 'HBB — sickle cell',   ensemblId: 'ENSG00000244734' },
    { label: 'G6PD — G6PD def.',    ensemblId: 'ENSG00000160211' },
    { label: 'APOL1 — CKD',         ensemblId: 'ENSG00000100342' },
    { label: 'BRCA1 — breast Ca',   ensemblId: 'ENSG00000012048' },
    { label: 'TP53 — cancer',       ensemblId: 'ENSG00000141510' },
    { label: 'CYP2D6 — drug met.',  ensemblId: 'ENSG00000100197' },
  ];

  /* Evidence datatype colours */
  const DATATYPE_COLOR = {
    genetic_association:   '#bc8cff',
    somatic_mutation:      '#ff6b6b',
    known_drug:            '#3fb950',
    literature:            '#58a6ff',
    rna_expression:        '#e3b341',
    animal_model:          '#f97316',
    affected_pathway:      '#79c0ff',
  };

  let _mode = 'disease'; /* 'disease' | 'gene' */

  /* ─── GraphQL queries ─── */
  const DISEASE_QUERY = `
    query diseaseAssoc($efoId: String!) {
      disease(efoId: $efoId) {
        id name description
        associatedTargets(page: { index: 0, size: 25 }) {
          count
          rows {
            target { id approvedSymbol approvedName }
            score
            datatypeScores { componentId score }
          }
        }
      }
    }`;

  const GENE_QUERY = `
    query geneAssoc($ensemblId: String!) {
      target(ensemblId: $ensemblId) {
        id approvedSymbol approvedName biotype
        associatedDiseases(page: { index: 0, size: 25 }) {
          count
          rows {
            disease { id name description }
            score
            datatypeScores { componentId score }
          }
        }
      }
    }`;

  const DISEASE_SEARCH = `
    query searchDisease($q: String!) {
      search(queryString: $q, entityNames: ["disease"], page: { index: 0, size: 6 }) {
        hits {
          id name entity
        }
      }
    }`;

  const GENE_SEARCH = `
    query searchGene($q: String!) {
      search(queryString: $q, entityNames: ["target"], page: { index: 0, size: 6 }) {
        hits {
          id name entity
        }
      }
    }`;

  async function _gql(query, variables) {
    const res = await fetch(GQL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables }),
    });
    if (!res.ok) throw new Error('Open Targets API ' + res.status);
    const data = await res.json();
    if (data.errors) throw new Error(data.errors[0].message);
    return data.data;
  }

  /* ─── Search (autocomplete-style) ─── */
  async function _searchAndShow(term) {
    if (!term.trim()) return;
    _renderLoading('Searching…');
    try {
      const q = _mode === 'disease' ? DISEASE_SEARCH : GENE_SEARCH;
      const data = await _gql(q, { q: term });
      const hits = data.search?.hits || [];
      if (!hits.length) { _renderEmpty('No results found — try a different term.'); return; }
      _renderSearchHits(hits);
    } catch (err) {
      _renderError(err.message);
    }
  }

  /* ─── Load by known ID ─── */
  async function _loadById(id) {
    _renderLoading('Loading associations…');
    try {
      if (_mode === 'disease') {
        const data = await _gql(DISEASE_QUERY, { efoId: id });
        _renderDiseaseResult(data.disease);
      } else {
        const data = await _gql(GENE_QUERY, { ensemblId: id });
        _renderGeneResult(data.target);
      }
    } catch (err) {
      _renderError(err.message);
    }
  }

  /* ─── Render helpers ─── */
  function _el() { return document.getElementById('ot-results'); }

  function _renderLoading(msg) {
    const el = _el();
    if (el) el.innerHTML = `<div class="ot-loading"><div class="ot-spinner"></div> ${msg}</div>`;
  }

  function _renderEmpty(msg) {
    const el = _el();
    if (el) el.innerHTML = `<div class="ot-empty">${msg}</div>`;
  }

  function _renderError(msg) {
    const el = _el();
    if (el) el.innerHTML = `<div class="ot-error"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ff6b6b" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> ${_esc(msg)}</div>`;
  }

  function _scoreBar(score) {
    const pct = (score * 100).toFixed(0);
    const col = score > 0.7 ? '#3fb950' : score > 0.4 ? '#e3b341' : '#58a6ff';
    return `<div class="ot-score-bar-wrap"><div class="ot-score-bar" style="width:${pct}%;background:${col}"></div></div><span class="ot-score-num">${score.toFixed(3)}</span>`;
  }

  function _datatypeChips(dtScores) {
    return (dtScores || [])
      .filter(d => d.score > 0.01)
      .sort((a, b) => b.score - a.score)
      .map(d => {
        const col = DATATYPE_COLOR[d.componentId] || '#6e7681';
        const label = d.componentId.replace(/_/g, ' ');
        return `<span class="ot-dt-chip" style="border-color:${col};color:${col}" title="Score: ${d.score.toFixed(3)}">${label}</span>`;
      }).join('');
  }

  function _renderSearchHits(hits) {
    const el = _el();
    if (!el) return;
    el.innerHTML = `
      <div class="ot-search-hits">
        <div class="ot-search-hits-label">Select to load associations:</div>
        ${hits.map(h => `
          <button class="ot-hit-btn" onclick="OmicsLab.OpenTargets._loadById('${_esc(h.id)}')">
            <span class="ot-hit-name">${_esc(h.name)}</span>
            <span class="ot-hit-id">${_esc(h.id)}</span>
          </button>`).join('')}
      </div>`;
  }

  function _renderDiseaseResult(disease) {
    const el = _el();
    if (!el || !disease) { _renderEmpty('Disease not found.'); return; }

    const rows = disease.associatedTargets?.rows || [];
    const count = disease.associatedTargets?.count || 0;

    el.innerHTML = `
      <div class="ot-result-header">
        <div class="ot-result-name">${_esc(disease.name)}</div>
        <div class="ot-result-id">${disease.id}</div>
        ${disease.description ? `<div class="ot-result-desc">${_esc(disease.description.slice(0, 200))}…</div>` : ''}
        <div class="ot-result-count">${count.toLocaleString()} associated genes (showing top ${rows.length})</div>
        <a class="ot-ext-link" href="https://platform.opentargets.org/disease/${disease.id}" target="_blank" rel="noopener">Open Targets Platform</a>
      </div>

      <div class="ot-assoc-list">
        ${rows.map(r => `
          <div class="ot-assoc-row">
            <div class="ot-assoc-target">
              <span class="ot-gene-sym">${_esc(r.target.approvedSymbol)}</span>
              <span class="ot-gene-name">${_esc(r.target.approvedName || '')}</span>
            </div>
            <div class="ot-assoc-score">${_scoreBar(r.score)}</div>
            <div class="ot-dt-chips">${_datatypeChips(r.datatypeScores)}</div>
            <div class="ot-assoc-links">
              <a class="ot-mini-link" href="https://platform.opentargets.org/evidence/${r.target.id}/${disease.id}" target="_blank" rel="noopener">Evidence</a>
              <button class="ot-mini-btn" onclick="OmicsLab.GeneLookup && (OmicsLab.Router.navigate('gene-lookup'), setTimeout(()=>OmicsLab.GeneLookup._quickLookup('${_esc(r.target.approvedSymbol)}'),400))">Gene Lookup</button>
            </div>
          </div>`).join('')}
      </div>`;
  }

  function _renderGeneResult(target) {
    const el = _el();
    if (!el || !target) { _renderEmpty('Gene not found.'); return; }

    const rows = target.associatedDiseases?.rows || [];
    const count = target.associatedDiseases?.count || 0;

    el.innerHTML = `
      <div class="ot-result-header">
        <div class="ot-result-name">${_esc(target.approvedSymbol)} — ${_esc(target.approvedName || '')}</div>
        <div class="ot-result-id">${target.id} · ${_esc(target.biotype || '')}</div>
        <div class="ot-result-count">${count.toLocaleString()} associated diseases (showing top ${rows.length})</div>
        <a class="ot-ext-link" href="https://platform.opentargets.org/target/${target.id}" target="_blank" rel="noopener">Open Targets Platform</a>
      </div>

      <div class="ot-assoc-list">
        ${rows.map(r => `
          <div class="ot-assoc-row">
            <div class="ot-assoc-target">
              <span class="ot-gene-sym">${_esc(r.disease.name)}</span>
              <span class="ot-gene-name">${_esc(r.disease.id)}</span>
            </div>
            <div class="ot-assoc-score">${_scoreBar(r.score)}</div>
            <div class="ot-dt-chips">${_datatypeChips(r.datatypeScores)}</div>
            <div class="ot-assoc-links">
              <a class="ot-mini-link" href="https://platform.opentargets.org/evidence/${target.id}/${r.disease.id}" target="_blank" rel="noopener">Evidence</a>
            </div>
          </div>`).join('')}
      </div>`;
  }

  function _esc(s) {
    return (s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function _setMode(mode) {
    _mode = mode;
    document.getElementById('ot-mode-disease')?.classList.toggle('ot-mode-active', mode === 'disease');
    document.getElementById('ot-mode-gene')?.classList.toggle('ot-mode-active', mode === 'gene');
    /* Update quick searches visibility */
    document.getElementById('ot-quick-diseases')?.style.setProperty('display', mode === 'disease' ? 'flex' : 'none');
    document.getElementById('ot-quick-genes')?.style.setProperty('display', mode === 'gene' ? 'flex' : 'none');
    const inp = document.getElementById('ot-search-input');
    if (inp) inp.placeholder = mode === 'disease'
      ? 'Disease name — e.g. malaria, sickle cell, tuberculosis…'
      : 'Gene symbol or name — e.g. HBB, APOL1, G6PD…';
    _renderEmpty('');
  }

  /* ─── Init ─── */
  function init() {
    const section = document.getElementById('open-targets-section');
    if (!section || section.dataset.otReady) return;
    section.dataset.otReady = '1';

    section.innerHTML = `
      <div class="ot-wrap">
        <div class="ot-header">
          <div class="ot-header-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
            Open Targets
          </div>
          <div class="ot-header-sub">Disease-gene associations — genetic, drug, pathway, and literature evidence</div>
        </div>

        <div class="ot-mode-row">
          <button class="ot-mode-btn ot-mode-active" id="ot-mode-disease" onclick="OmicsLab.OpenTargets._setMode('disease')">Disease → Genes</button>
          <button class="ot-mode-btn" id="ot-mode-gene" onclick="OmicsLab.OpenTargets._setMode('gene')">Gene → Diseases</button>
        </div>

        <div class="ot-search-bar">
          <div class="ot-search-row">
            <input type="text" class="ot-search-input" id="ot-search-input"
              placeholder="Disease name — e.g. malaria, sickle cell, tuberculosis…"
              onkeydown="if(event.key==='Enter') OmicsLab.OpenTargets._searchAndShow(this.value)"/>
            <button class="ot-search-btn" onclick="OmicsLab.OpenTargets._searchAndShow(document.getElementById('ot-search-input').value)">Search</button>
          </div>
        </div>

        <div class="ot-quick-row">
          <div id="ot-quick-diseases" class="ot-quick-searches" style="display:flex">
            <span class="ot-quick-label">African diseases:</span>
            ${AFRICA_DISEASES.map(d =>
              `<button class="ot-quick-btn" onclick="OmicsLab.OpenTargets._loadById('${d.id}')">${d.label}</button>`
            ).join('')}
          </div>
          <div id="ot-quick-genes" class="ot-quick-searches" style="display:none">
            <span class="ot-quick-label">African disease genes:</span>
            ${AFRICA_GENES.map(g =>
              `<button class="ot-quick-btn" onclick="OmicsLab.OpenTargets._loadById('${g.ensemblId}')">${g.label}</button>`
            ).join('')}
          </div>
        </div>

        <div id="ot-results" class="ot-results">
          <div class="ot-empty">Select a disease or gene above, or search by name</div>
        </div>
      </div>`;
  }

  return { init, _loadById, _searchAndShow, _setMode };
})();
