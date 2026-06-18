/* ═══════════════════════════════════════════════════════════════
   OmicsLab Protein Viewer — AlphaFold EBI API (Prompt 44)
   ─ Fetch prediction metadata + PDB file
   ─ pLDDT confidence chart (SVG bar chart)
   ─ AlphaFold 3D iframe embed
   ─ Pre-loaded African disease proteins
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.ProteinViewer = (function () {

  const AF_API   = 'https://alphafold.ebi.ac.uk/api';
  const UNIPROT  = 'https://rest.uniprot.org/uniprotkb';

  /* Pre-loaded proteins (gene → UniProt accession) */
  const AFRICA_PROTEINS = [
    { gene: 'HBB',    acc: 'P68871', name: 'Haemoglobin subunit beta',      disease: 'Sickle cell disease' },
    { gene: 'G6PD',   acc: 'P11413', name: 'Glucose-6-phosphate dehydrogenase', disease: 'G6PD deficiency / malaria' },
    { gene: 'APOL1',  acc: 'O14791', name: 'Apolipoprotein L1',              disease: 'Chronic kidney disease' },
    { gene: 'HBA1',   acc: 'P69905', name: 'Haemoglobin subunit alpha-1',   disease: 'Alpha-thalassemia' },
    { gene: 'BRCA1',  acc: 'P38398', name: 'Breast cancer type 1 susceptibility', disease: 'Breast cancer' },
    { gene: 'TP53',   acc: 'P04637', name: 'Cellular tumour antigen p53',    disease: 'Multiple cancers' },
    { gene: 'CYP2D6', acc: 'P10635', name: 'Cytochrome P450 2D6',           disease: 'Drug metabolism' },
    { gene: 'LMNA',   acc: 'P02545', name: 'Prelamin-A/C',                   disease: 'Dilated cardiomyopathy' },
  ];

  /* pLDDT colour tiers */
  const TIERS = [
    { min: 90, label: 'Very high (>90)', color: '#1d4ed8' },
    { min: 70, label: 'High (70–90)',    color: '#22d3ee' },
    { min: 50, label: 'Low (50–70)',     color: '#fbbf24' },
    { min: 0,  label: 'Very low (<50)', color: '#f97316' },
  ];

  let _currentAcc = null;

  /* ─── Fetch AlphaFold prediction metadata ─── */
  async function _fetchPrediction(acc) {
    const url = `${AF_API}/prediction/${acc}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`No AlphaFold structure for ${acc} (${res.status})`);
    const data = await res.json();
    return Array.isArray(data) ? data[0] : data;
  }

  /* ─── Fetch UniProt basic info ─── */
  async function _fetchUniProtInfo(acc) {
    try {
      const url = `${UNIPROT}/${acc}.json`;
      const res = await fetch(url);
      if (!res.ok) return {};
      const d = await res.json();
      return {
        name:   d.proteinDescription?.recommendedName?.fullName?.value || '',
        gene:   (d.genes || [])[0]?.geneName?.value || '',
        org:    d.organism?.scientificName || '',
        length: d.sequence?.length || 0,
        function: (d.comments || []).find(c => c.commentType === 'FUNCTION')?.texts?.[0]?.value || '',
      };
    } catch { return {}; }
  }

  /* ─── Fetch and parse PDB for pLDDT scores ─── */
  async function _fetchPLDDT(pdbUrl) {
    try {
      const res = await fetch(pdbUrl);
      if (!res.ok) return [];
      const text = await res.text();
      const scores = [];
      text.split('\n').forEach(line => {
        if (line.startsWith('ATOM') || line.startsWith('HETATM')) {
          const bfactor = parseFloat(line.slice(60, 66).trim());
          const resNum  = parseInt(line.slice(22, 26).trim(), 10);
          const ca      = line.slice(12, 16).trim() === 'CA';
          if (ca && !isNaN(bfactor) && !isNaN(resNum)) {
            scores.push({ res: resNum, plddt: bfactor });
          }
        }
      });
      return scores;
    } catch { return []; }
  }

  /* ─── Build pLDDT SVG chart ─── */
  function _buildChart(scores) {
    if (!scores.length) return '<div class="pv-no-chart">pLDDT data unavailable</div>';

    const W       = 760;
    const H       = 120;
    const PADDING = { top: 10, right: 12, bottom: 24, left: 36 };
    const cW = W - PADDING.left - PADDING.right;
    const cH = H - PADDING.top  - PADDING.bottom;

    const maxRes   = scores[scores.length - 1].res;
    const barWidth = Math.max(1, Math.floor(cW / scores.length));

    const bars = scores.map((s, i) => {
      const tier  = TIERS.find(t => s.plddt >= t.min) || TIERS[TIERS.length - 1];
      const x     = PADDING.left + (i / scores.length) * cW;
      const barH  = (s.plddt / 100) * cH;
      const y     = PADDING.top + cH - barH;
      return `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${barWidth}" height="${barH.toFixed(1)}" fill="${tier.color}" opacity="0.85"/>`;
    }).join('');

    const yLabels = [0, 25, 50, 70, 90, 100].map(v => {
      const y = PADDING.top + cH - (v / 100) * cH;
      return `<text x="${PADDING.left - 4}" y="${(y + 3).toFixed(1)}" fill="#8b949e" font-size="8" text-anchor="end">${v}</text>
              <line x1="${PADDING.left}" y1="${y.toFixed(1)}" x2="${W - PADDING.right}" y2="${y.toFixed(1)}" stroke="#21262d" stroke-width="0.5"/>`;
    }).join('');

    const avgScore = (scores.reduce((a, b) => a + b.plddt, 0) / scores.length).toFixed(1);

    const legend = TIERS.map(t =>
      `<span style="display:inline-flex;align-items:center;gap:4px;font-size:0.72rem;color:#8b949e">
        <span style="width:10px;height:10px;border-radius:2px;background:${t.color};display:inline-block;flex-shrink:0"></span>${t.label}</span>`
    ).join('');

    return `
      <div class="pv-chart-wrap">
        <div class="pv-chart-header">
          <span>pLDDT per-residue confidence</span>
          <span class="pv-avg-score">Mean: <strong>${avgScore}</strong> / 100 · ${scores.length} residues</span>
        </div>
        <svg width="100%" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" class="pv-chart-svg" aria-label="pLDDT confidence chart">
          <rect x="${PADDING.left}" y="${PADDING.top}" width="${cW}" height="${cH}" fill="#161b22"/>
          ${yLabels}
          ${bars}
          <text x="${W/2}" y="${H - 4}" fill="#484f58" font-size="8" text-anchor="middle">Residue (1–${maxRes})</text>
        </svg>
        <div class="pv-legend">${legend}</div>
      </div>`;
  }

  /* ─── Main lookup by UniProt accession ─── */
  async function _doLookup(acc) {
    if (!acc || !acc.trim()) return;
    acc = acc.trim().toUpperCase();
    _currentAcc = acc;
    _renderLoading(acc);

    try {
      const [pred, upInfo] = await Promise.all([
        _fetchPrediction(acc),
        _fetchUniProtInfo(acc),
      ]);

      const scores = pred.pdbUrl ? await _fetchPLDDT(pred.pdbUrl) : [];
      _renderProtein(pred, upInfo, scores);
    } catch (err) {
      _renderError(err.message);
    }
  }

  /* ─── Lookup by gene symbol (called from GeneLookup) ─── */
  async function lookupByGene(symbol) {
    symbol = symbol.toUpperCase();
    const known = AFRICA_PROTEINS.find(p => p.gene === symbol);
    if (known) {
      const inp = document.getElementById('pv-acc-input');
      if (inp) inp.value = known.acc;
      await _doLookup(known.acc);
      return;
    }
    /* Try UniProt search as fallback */
    _renderLoading(symbol);
    try {
      const url = `${UNIPROT}/search?query=gene:${encodeURIComponent(symbol)}+AND+organism_id:9606+AND+reviewed:true&format=json&size=1`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('UniProt lookup failed');
      const data = await res.json();
      const hit = data.results?.[0];
      if (!hit) throw new Error(`No reviewed UniProt entry for gene ${symbol}`);
      const foundAcc = hit.primaryAccession;
      const inp = document.getElementById('pv-acc-input');
      if (inp) inp.value = foundAcc;
      await _doLookup(foundAcc);
    } catch (err) {
      _renderError(err.message);
    }
  }

  /* ─── Render states ─── */
  function _el() { return document.getElementById('pv-result'); }

  function _renderLoading(id) {
    const el = _el();
    if (el) el.innerHTML = `<div class="pv-loading"><div class="pv-spinner"></div> Fetching AlphaFold prediction for ${_esc(id)}…</div>`;
  }

  function _renderError(msg) {
    const el = _el();
    if (el) el.innerHTML = `<div class="pv-error"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ff6b6b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> ${_esc(msg)}</div>`;
  }

  function _renderProtein(pred, upInfo, scores) {
    const el = _el();
    if (!el) return;

    const name   = upInfo.name || pred.uniprotDescription || 'Unknown protein';
    const gene   = upInfo.gene  || '';
    const length = upInfo.length || '';
    const org    = upInfo.org   || 'Homo sapiens';
    const avgPLDDT = scores.length
      ? (scores.reduce((a, b) => a + b.plddt, 0) / scores.length).toFixed(1)
      : 'N/A';

    const version  = pred.latestVersion || 1;
    const modelUrl = pred.cifUrl || pred.pdbUrl || '';
    const afPage   = `https://alphafold.ebi.ac.uk/entry/${_currentAcc}`;

    el.innerHTML = `
      <div class="pv-protein-card">
        <div class="pv-protein-header">
          <div>
            <div class="pv-protein-name">${_esc(name)}</div>
            ${gene ? `<div class="pv-protein-gene">Gene: <strong>${_esc(gene)}</strong></div>` : ''}
            <div class="pv-protein-meta">
              <span>${_esc(org)}</span>
              ${length ? `<span>· ${length} aa</span>` : ''}
              <span>· AlphaFold v${version}</span>
              <span>· Mean pLDDT ${avgPLDDT}</span>
            </div>
          </div>
          <a class="pv-af-link" href="${afPage}" target="_blank" rel="noopener">View on AlphaFold DB</a>
        </div>

        ${upInfo.function ? `<div class="pv-function">${_esc(upInfo.function.slice(0, 300))}${upInfo.function.length > 300 ? '…' : ''}</div>` : ''}

        ${_buildChart(scores)}

        <div class="pv-3d-section">
          <div class="pv-3d-label">3D Structure Viewer</div>
          <div class="pv-3d-frame-wrap">
            <iframe
              class="pv-3d-frame"
              src="https://alphafold.ebi.ac.uk/entry/${_esc(_currentAcc)}"
              title="AlphaFold 3D viewer for ${_esc(_currentAcc)}"
              loading="lazy"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups">
            </iframe>
          </div>
          <div class="pv-3d-note">Interactive 3D viewer powered by AlphaFold EBI. Requires internet connection.</div>
        </div>

        <div class="pv-download-row">
          ${pred.pdbUrl ? `<a class="pv-dl-btn" href="${pred.pdbUrl}" download="${_currentAcc}.pdb">Download PDB</a>` : ''}
          ${pred.cifUrl ? `<a class="pv-dl-btn" href="${pred.cifUrl}" download="${_currentAcc}.cif">Download mmCIF</a>` : ''}
          <a class="pv-dl-btn pv-dl-secondary" href="${afPage}" target="_blank" rel="noopener">AlphaFold entry</a>
          <a class="pv-dl-btn pv-dl-secondary" href="https://www.uniprot.org/uniprot/${_esc(_currentAcc)}" target="_blank" rel="noopener">UniProt entry</a>
        </div>
      </div>`;
  }

  /* ─── Init ─── */
  function init() {
    const section = document.getElementById('protein-section');
    if (!section || section.dataset.pvReady) return;
    section.dataset.pvReady = '1';

    section.innerHTML = `
      <div class="pv-wrap">
        <div class="pv-header">
          <div class="pv-header-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12C2 6.48 6.48 2 12 2s10 4.48 10 10-4.48 10-10 10S2 17.52 2 12z"/><path d="M12 8v4l3 3"/></svg>
            Protein Structure Viewer
          </div>
          <div class="pv-header-sub">AlphaFold AI structure predictions — pLDDT confidence visualisation</div>
        </div>

        <div class="pv-search-row">
          <input type="text" class="pv-search-input" id="pv-acc-input"
            placeholder="UniProt accession — e.g. P68871, O14791, P11413…"
            onkeydown="if(event.key==='Enter') OmicsLab.ProteinViewer._lookupAcc()"/>
          <input type="text" class="pv-search-input pv-gene-input" id="pv-gene-input"
            placeholder="or gene symbol — e.g. HBB, APOL1…"
            onkeydown="if(event.key==='Enter') OmicsLab.ProteinViewer.lookupByGene(this.value)"/>
          <button class="pv-search-btn" onclick="OmicsLab.ProteinViewer._lookupAcc()">View structure</button>
        </div>

        <div class="pv-preloaded">
          <div class="pv-preloaded-label">African disease proteins:</div>
          <div class="pv-preloaded-grid">
            ${AFRICA_PROTEINS.map(p => `
              <button class="pv-protein-chip" onclick="OmicsLab.ProteinViewer._quickLoad('${p.acc}','${p.gene}')" title="${_esc(p.disease)}">
                <span class="pv-chip-gene">${p.gene}</span>
                <span class="pv-chip-acc">${p.acc}</span>
              </button>`).join('')}
          </div>
        </div>

        <div id="pv-result" class="pv-result">
          <div class="pv-empty">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#484f58" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12C2 6.48 6.48 2 12 2s10 4.48 10 10-4.48 10-10 10S2 17.52 2 12z"/><path d="M12 8v4l3 3"/></svg>
            <div>Enter a UniProt accession or gene symbol, or select an African disease protein above</div>
          </div>
        </div>
      </div>`;
  }

  function _lookupAcc() {
    const inp = document.getElementById('pv-acc-input');
    if (inp && inp.value.trim()) { _doLookup(inp.value); return; }
    const gInp = document.getElementById('pv-gene-input');
    if (gInp && gInp.value.trim()) lookupByGene(gInp.value);
  }

  function _quickLoad(acc, gene) {
    const aInp = document.getElementById('pv-acc-input');
    const gInp = document.getElementById('pv-gene-input');
    if (aInp) aInp.value = acc;
    if (gInp) gInp.value = gene;
    _doLookup(acc);
  }

  function _esc(s) {
    return (s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  return { init, lookupByGene, _lookupAcc, _quickLoad };
})();
