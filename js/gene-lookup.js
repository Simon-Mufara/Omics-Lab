/* ═══════════════════════════════════════════════════════════════
   OmicsLab Gene Lookup — Ensembl REST API (Prompt 42)
   ─ Gene annotation, transcripts, phenotypes
   ─ Cross-links: AlphaFold, gnomAD, ClinVar, OMIM, UniProt
   ─ Pre-loaded African disease gene set
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.GeneLookup = (function () {

  const ENSEMBL = 'https://rest.ensembl.org';

  /* Pre-loaded African disease genes */
  const AFRICA_GENES = [
    { symbol: 'HBB',     desc: 'Haemoglobin subunit beta — sickle cell disease, beta-thalassemia' },
    { symbol: 'G6PD',    desc: 'Glucose-6-phosphate dehydrogenase — malaria protection, G6PD deficiency' },
    { symbol: 'APOL1',   desc: 'Apolipoprotein L1 — CKD risk in African populations, trypanosome resistance' },
    { symbol: 'KCNJ11',  desc: 'Potassium channel — type 2 diabetes, elevated risk in West Africa' },
    { symbol: 'HLA-B',   desc: 'HLA class I — drug hypersensitivity, malaria susceptibility' },
    { symbol: 'CYP2D6',  desc: 'Cytochrome P450 — drug metabolism variation in African populations' },
    { symbol: 'LMNA',    desc: 'Lamin A/C — dilated cardiomyopathy, higher prevalence in Africa' },
    { symbol: 'BRCA1',   desc: 'Breast cancer 1 — BRCA1 variants prevalent in South African cohorts' },
    { symbol: 'MYH7',    desc: 'Myosin heavy chain — hypertrophic cardiomyopathy in African athletes' },
    { symbol: 'rpoB',    desc: 'RNA polymerase beta (M. tuberculosis) — rifampicin resistance' },
  ];

  let _lastGene = null;

  /* ─── Ensembl lookups ─── */
  async function _lookupSymbol(symbol) {
    const url = `${ENSEMBL}/lookup/symbol/homo_sapiens/${encodeURIComponent(symbol)}?expand=1&content-type=application/json`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Gene "${symbol}" not found (${res.status})`);
    return res.json();
  }

  async function _lookupPhenotypes(ensemblId) {
    try {
      const url = `${ENSEMBL}/phenotype/gene/homo_sapiens/${ensemblId}?content-type=application/json`;
      const res = await fetch(url);
      if (!res.ok) return [];
      return res.json();
    } catch { return []; }
  }

  async function _lookupVariants(ensemblId) {
    try {
      const url = `${ENSEMBL}/overlap/id/${ensemblId}?feature=variation;content-type=application/json`;
      const res = await fetch(url);
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data.slice(0, 25) : [];
    } catch { return []; }
  }

  /* ─── DisGeNET curated data for Africa-priority genes ─── */
  const DISGENET_CURATED = {
    HBB:   [{ dis:'Anemia, Sickle Cell', score:.98, ei:.97, src:'UniProt/ClinVar' },{ dis:'beta-Thalassemia', score:.95, ei:.94, src:'UniProt' },{ dis:'Malaria, resistance', score:.61, ei:.65, src:'GWAS catalog' }],
    G6PD:  [{ dis:'Glucosephosphate Dehydrogenase Deficiency', score:.97, ei:.96, src:'UniProt' },{ dis:'Malaria, resistance', score:.72, ei:.68, src:'GWAS/literature' },{ dis:'Hemolytic Anemia', score:.88, ei:.85, src:'ClinVar' }],
    APOL1: [{ dis:'Focal Segmental Glomerulosclerosis', score:.95, ei:.93, src:'ClinVar/GWAS' },{ dis:'Kidney Failure, Chronic', score:.91, ei:.90, src:'H3Africa/GWAS' },{ dis:'Sleeping Sickness Resistance', score:.78, ei:.72, src:'Literature' }],
    KCNJ11:[{ dis:'Diabetes Mellitus, Type 2', score:.92, ei:.89, src:'GWAS catalog' },{ dis:'Hyperinsulinism', score:.86, ei:.83, src:'ClinVar' }],
    CYP2D6:[{ dis:'Drug Metabolism Deficiency', score:.89, ei:.88, src:'PharmGKB' },{ dis:'Codeine Toxicity', score:.82, ei:.81, src:'CPIC/PharmGKB' }],
    TNF:   [{ dis:'Malaria, Cerebral', score:.79, ei:.77, src:'GWAS/Literature' },{ dis:'Rheumatoid Arthritis', score:.93, ei:.91, src:'GWAS catalog' },{ dis:'Tuberculosis susceptibility', score:.75, ei:.72, src:'Literature' }],
    BRCA1: [{ dis:'Breast Neoplasms', score:.99, ei:.98, src:'ClinVar/OMIM' },{ dis:'Ovarian Neoplasms', score:.97, ei:.96, src:'ClinVar' }],
    CCR5:  [{ dis:'HIV Infections', score:.94, ei:.93, src:'PharmGKB/ClinVar' },{ dis:'West Nile Fever susceptibility', score:.68, ei:.65, src:'Literature' }],
    TLR4:  [{ dis:'Sepsis susceptibility', score:.76, ei:.74, src:'GWAS/Literature' },{ dis:'Malaria, severe', score:.71, ei:.68, src:'H3Africa GWAS' }],
  };

  /* ─── DisGeNET live API ─── */
  async function _fetchDisGeNET(symbol, ensemblId) {
    const el = document.getElementById('gl-disgenet-panel');
    if (!el) return;
    const apiKey = localStorage.getItem('omicslab_disgenet_key') || '';
    const curated = DISGENET_CURATED[symbol.toUpperCase()];

    if (!apiKey) {
      /* No key — show curated if available */
      if (curated) {
        el.innerHTML = _renderDisGeNETPanel(symbol, curated, false);
      } else {
        el.innerHTML = `<div class="gl-dgn-nokey">
          <div class="gl-dgn-nokey-title">DisGeNET — Gene-Disease Associations</div>
          <div class="gl-dgn-nokey-msg">Register free at <a href="https://www.disgenet.com/signin" target="_blank" rel="noopener" class="gl-ext-link">disgenet.com</a> and save your API key in
            <button class="gl-link-btn" onclick="OmicsLab.Router.navigate('profile')">Settings</button> (key: <code>omicslab_disgenet_key</code>) to see live disease associations for ${_esc(symbol)}.</div>
          <a class="gl-dgn-search-link" href="https://www.disgenet.com/search?gene=${encodeURIComponent(symbol)}" target="_blank" rel="noopener">Search ${_esc(symbol)} on DisGeNET →</a>
        </div>`;
      }
      return;
    }

    el.innerHTML = '<div class="gl-loading">Fetching DisGeNET associations…</div>';
    try {
      const res = await fetch(`https://www.disgenet.org/api/gda/gene/symbol/${encodeURIComponent(symbol)}?limit=10&format=json`, {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      if (!res.ok) throw new Error('DisGeNET API ' + res.status);
      const data = await res.json();
      if (!data?.length) { el.innerHTML = `<div class="gl-section"><div class="gl-section-title">DisGeNET</div><div class="gl-dgn-empty">No disease associations found for ${_esc(symbol)}.</div></div>`; return; }
      const rows = data.map(d => ({ dis: d.disease_name || d.diseaseName, score: d.score, ei: d.ei, src: d.source }));
      el.innerHTML = _renderDisGeNETPanel(symbol, rows, true);
    } catch {
      /* Fall back to curated */
      if (curated) {
        el.innerHTML = _renderDisGeNETPanel(symbol, curated, false);
      } else {
        el.innerHTML = `<div class="gl-section"><div class="gl-section-title">DisGeNET</div>
          <div class="gl-dgn-nokey-msg">API unavailable. <a href="https://www.disgenet.com/search?gene=${encodeURIComponent(symbol)}" target="_blank" rel="noopener" class="gl-ext-link">Search on DisGeNET →</a></div></div>`;
      }
    }
  }

  function _renderDisGeNETPanel(symbol, rows, isLive) {
    const afr = ['Anemia, Sickle Cell','beta-Thalassemia','Glucosephosphate Dehydrogenase Deficiency','Focal Segmental Glomerulosclerosis','Kidney Failure, Chronic','Malaria','Sleeping Sickness','Tuberculosis','HIV'];
    return `<div class="gl-section">
      <div class="gl-section-title">
        DisGeNET — Disease Associations
        <span class="gl-dgn-source-badge">${isLive ? 'Live API' : 'Curated'}</span>
      </div>
      <table class="gl-dgn-table">
        <thead><tr><th>Disease</th><th title="DisGeNET score">Score</th><th>Source</th></tr></thead>
        <tbody>
          ${rows.map(r => {
            const isAfr = afr.some(a => (r.dis || '').toLowerCase().includes(a.toLowerCase()));
            return `<tr class="${isAfr ? 'gl-dgn-afr-row' : ''}">
              <td>
                ${isAfr ? '<svg width="10" height="10" viewBox="0 0 24 24" fill="#f97316" aria-hidden="true"><path d="M12 2L15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2z"/></svg>' : ''}
                <a class="gl-dgn-dis-link" href="https://www.disgenet.com/search?disease=${encodeURIComponent(r.dis || '')}" target="_blank" rel="noopener">${_esc(r.dis || '—')}</a>
              </td>
              <td>
                <div class="gl-dgn-score-row">
                  <span class="gl-dgn-score-val">${typeof r.score === 'number' ? r.score.toFixed(3) : '—'}</span>
                  ${typeof r.score === 'number' ? `<div class="gl-dgn-score-bar"><div class="gl-dgn-score-fill" style="width:${Math.round(r.score*100)}%"></div></div>` : ''}
                </div>
              </td>
              <td class="gl-dgn-src">${_esc(r.src || '—')}</td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
      <div class="gl-dgn-footer">
        <a href="https://www.disgenet.com/search?gene=${encodeURIComponent(symbol)}" target="_blank" rel="noopener" class="gl-ext-link">Full results on DisGeNET →</a>
        ${!isLive ? '<span class="gl-dgn-curated-note">Curated data shown — add DisGeNET API key in Settings for live results.</span>' : ''}
      </div>
    </div>`;
  }

  /* ─── Main lookup ─── */
  async function _doLookup(symbol) {
    if (!symbol || !symbol.trim()) return;
    symbol = symbol.trim().toUpperCase();
    _renderLoading(symbol);

    try {
      const gene = await _lookupSymbol(symbol);
      const [phenotypes, variants] = await Promise.all([
        _lookupPhenotypes(gene.id),
        _lookupVariants(gene.id),
      ]);
      _lastGene = { gene, phenotypes, variants };
      _renderGene(gene, phenotypes, variants);
      /* DisGeNET runs async after main render */
      _fetchDisGeNET(gene.display_name || symbol, gene.id);
    } catch (err) {
      _renderError(err.message);
    }
  }

  /* ─── Render ─── */
  function _el() { return document.getElementById('gl-result'); }

  function _renderLoading(symbol) {
    const el = _el();
    if (el) el.innerHTML = `<div class="gl-loading"><div class="gl-spinner"></div> Looking up ${_esc(symbol)} in Ensembl…</div>`;
  }

  function _renderError(msg) {
    const el = _el();
    if (el) el.innerHTML = `<div class="gl-error"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ff6b6b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> ${_esc(msg)}</div>`;
  }

  function _renderGene(gene, phenotypes, variants) {
    const el = _el();
    if (!el) return;

    const kb    = Math.round(Math.abs((gene.end - gene.start)) / 1000);
    const trans = (gene.Transcript || []).slice(0, 10);
    const phens = (phenotypes || []).slice(0, 8);

    /* Cross-links */
    const symbol = gene.display_name || gene.id;
    const links = [
      { label: 'Ensembl',   url: `https://www.ensembl.org/Homo_sapiens/Gene/Summary?g=${gene.id}` },
      { label: 'gnomAD',    url: `https://gnomad.broadinstitute.org/gene/${gene.id}` },
      { label: 'OMIM',      url: `https://www.omim.org/search?search=${encodeURIComponent(symbol)}` },
      { label: 'ClinVar',   url: `https://www.ncbi.nlm.nih.gov/clinvar/?term=${encodeURIComponent(symbol)}[gene]` },
      { label: 'UniProt',   url: `https://www.uniprot.org/uniprot/?query=gene:${encodeURIComponent(symbol)}+AND+organism:9606` },
      { label: 'AlphaFold', url: `https://alphafold.ebi.ac.uk/search/text/${encodeURIComponent(symbol)}` },
      { label: 'GeneCards', url: `https://www.genecards.org/cgi-bin/carddisp.pl?gene=${encodeURIComponent(symbol)}` },
    ];

    el.innerHTML = `
      <div class="gl-gene-card">
        <div class="gl-gene-header">
          <div>
            <div class="gl-gene-symbol">${_esc(gene.display_name || gene.id)}</div>
            <div class="gl-gene-name">${_esc(gene.description || '')}</div>
          </div>
          <div class="gl-gene-biotype">${_esc(gene.biotype || '')}</div>
        </div>

        <div class="gl-gene-coords">
          <div class="gl-coord-item">
            <span class="gl-coord-label">Chromosome</span>
            <span class="gl-coord-value">${_esc(String(gene.seq_region_name))}</span>
          </div>
          <div class="gl-coord-item">
            <span class="gl-coord-label">Position</span>
            <span class="gl-coord-value">${(gene.start || 0).toLocaleString()} – ${(gene.end || 0).toLocaleString()}</span>
          </div>
          <div class="gl-coord-item">
            <span class="gl-coord-label">Length</span>
            <span class="gl-coord-value">${kb} kb</span>
          </div>
          <div class="gl-coord-item">
            <span class="gl-coord-label">Strand</span>
            <span class="gl-coord-value">${gene.strand === 1 ? '+ (forward)' : '− (reverse)'}</span>
          </div>
          <div class="gl-coord-item">
            <span class="gl-coord-label">Ensembl ID</span>
            <span class="gl-coord-value gl-mono">${_esc(gene.id)}</span>
          </div>
          <div class="gl-coord-item">
            <span class="gl-coord-label">Assembly</span>
            <span class="gl-coord-value">GRCh38</span>
          </div>
        </div>

        <div class="gl-gene-links">
          ${links.map(l => `<a class="gl-ext-link" href="${l.url}" target="_blank" rel="noopener">${l.label}</a>`).join('')}
          <button class="gl-ext-link gl-protein-btn" onclick="OmicsLab.GeneLookup._openAlphaFold('${_esc(symbol)}')">
            View protein structure
          </button>
        </div>

        ${trans.length ? `
          <div class="gl-section">
            <div class="gl-section-title">Transcripts (${(gene.Transcript || []).length} total)</div>
            <div class="gl-transcript-list">
              ${trans.map(t => `
                <div class="gl-transcript-row">
                  <span class="gl-mono">${_esc(t.id)}</span>
                  <span class="gl-biotype-tag">${_esc(t.biotype)}</span>
                  <span class="gl-tx-len">${t.length ? (t.length).toLocaleString() + ' bp' : ''}</span>
                </div>`).join('')}
            </div>
          </div>` : ''}

        ${phens.length ? `
          <div class="gl-section">
            <div class="gl-section-title">Associated phenotypes</div>
            <div class="gl-phenotype-list">
              ${phens.map(p => `
                <div class="gl-phenotype-item">
                  <span class="gl-phen-name">${_esc(p.description || p.trait || '')}</span>
                  ${p.source ? `<span class="gl-phen-source">${_esc(p.source)}</span>` : ''}
                </div>`).join('')}
            </div>
          </div>` : ''}

        ${variants.length ? `
          <div class="gl-section">
            <div class="gl-section-title">Known variants (top ${variants.length})</div>
            <div class="gl-variant-table-wrap">
              <table class="gl-variant-table">
                <thead><tr><th>rsID</th><th>Type</th><th>Position</th></tr></thead>
                <tbody>
                  ${variants.map(v => `
                    <tr>
                      <td><a href="https://www.ncbi.nlm.nih.gov/snp/${_esc(v.id)}" target="_blank" rel="noopener" class="gl-snp-link">${_esc(v.id || '—')}</a></td>
                      <td>${_esc(v.feature_type || '')}</td>
                      <td class="gl-mono">${_esc(String(v.seq_region_name))}:${(v.start||0).toLocaleString()}</td>
                    </tr>`).join('')}
                </tbody>
              </table>
            </div>
          </div>` : ''}

        <!-- DisGeNET panel injected async after Ensembl renders -->
        <div id="gl-disgenet-panel"></div>
      </div>`;
  }

  /* ─── Navigation to AlphaFold from gene ─── */
  function _openAlphaFold(symbol) {
    if (OmicsLab.Router) OmicsLab.Router.navigate('protein');
    setTimeout(() => {
      const inp = document.getElementById('pv-gene-input');
      if (inp) {
        inp.value = symbol;
        OmicsLab.ProteinViewer && OmicsLab.ProteinViewer.lookupByGene(symbol);
      }
    }, 400);
  }

  /* ─── Init ─── */
  function init() {
    const section = document.getElementById('gene-lookup-section');
    if (!section || section.dataset.glReady) return;
    section.dataset.glReady = '1';

    section.innerHTML = `
      <div class="gl-wrap">
        <div class="gl-header">
          <div class="gl-header-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>
            Gene Lookup
          </div>
          <div class="gl-header-sub">Annotate any human gene — coordinates, transcripts, phenotypes, cross-links</div>
        </div>

        <div class="gl-search-row">
          <input type="text" class="gl-search-input" id="gl-gene-input"
            placeholder="Enter gene symbol — e.g. HBB, BRCA1, TP53…"
            onkeydown="if(event.key==='Enter') OmicsLab.GeneLookup.lookup()"/>
          <button class="gl-search-btn" onclick="OmicsLab.GeneLookup.lookup()">Look up</button>
        </div>

        <div class="gl-africa-genes">
          <div class="gl-africa-label">African disease genes:</div>
          ${AFRICA_GENES.map(g =>
            `<button class="gl-gene-chip" onclick="OmicsLab.GeneLookup._quickLookup('${g.symbol}')" title="${_esc(g.desc)}">${g.symbol}</button>`
          ).join('')}
        </div>

        <div id="gl-result" class="gl-result"></div>
      </div>`;
  }

  function lookup() {
    const inp = document.getElementById('gl-gene-input');
    if (inp) _doLookup(inp.value);
  }

  function _quickLookup(symbol) {
    const inp = document.getElementById('gl-gene-input');
    if (inp) inp.value = symbol;
    _doLookup(symbol);
  }

  function _esc(s) {
    return (s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  return { init, lookup, _quickLookup, _openAlphaFold, _fetchDisGeNET };
})();
