/* ═══════════════════════════════════════════════════════════════
   OmicsLab — GO and Pathway Enrichment Analysis
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.Enrichment = (function () {

  const DATASETS = [
    {
      id: 'malaria-up', name: 'Malaria Upregulated', source: 'KEMRI Kenya DEG list',
      color: '#f85149', background: '#3a0d0b',
      description: 'Top 50 upregulated genes from P. falciparum malaria PBMC study (KEMRI, Kenya). Pathways reflect pro-inflammatory response and erythrocyte biology.',
      terms: [
        { id: 'GO:0006955', name: 'Immune response', db: 'GO', genes: 24, total: 840, padj: 2.1e-18, geneRatio: 0.48, category: 'Biological Process' },
        { id: 'GO:0045087', name: 'Innate immune response', db: 'GO', genes: 18, total: 642, padj: 4.3e-14, geneRatio: 0.36, category: 'Biological Process' },
        { id: 'GO:0006952', name: 'Defense response', db: 'GO', genes: 21, total: 930, padj: 8.1e-13, geneRatio: 0.42, category: 'Biological Process' },
        { id: 'hsa05144', name: 'Malaria (KEGG)', db: 'KEGG', genes: 15, total: 85, padj: 1.2e-12, geneRatio: 0.30, category: 'Disease pathway' },
        { id: 'GO:0019221', name: 'Cytokine-mediated signaling', db: 'GO', genes: 16, total: 512, padj: 3.4e-11, geneRatio: 0.32, category: 'Biological Process' },
        { id: 'GO:0002250', name: 'Adaptive immune response', db: 'GO', genes: 12, total: 430, padj: 9.8e-10, geneRatio: 0.24, category: 'Biological Process' },
        { id: 'hsa04060', name: 'Cytokine-cytokine interaction (KEGG)', db: 'KEGG', genes: 14, total: 294, padj: 2.1e-9, geneRatio: 0.28, category: 'Signaling' },
        { id: 'GO:0055076', name: 'Transition metal ion homeostasis', db: 'GO', genes: 10, total: 180, padj: 5.6e-9, geneRatio: 0.20, category: 'Biological Process' },
        { id: 'GO:0030218', name: 'Erythrocyte differentiation', db: 'GO', genes: 9, total: 142, padj: 1.3e-8, geneRatio: 0.18, category: 'Biological Process' },
        { id: 'hsa04151', name: 'PI3K-Akt signaling (KEGG)', db: 'KEGG', genes: 11, total: 348, padj: 4.2e-7, geneRatio: 0.22, category: 'Signaling' },
        { id: 'GO:0071346', name: 'Cellular response to IFN-gamma', db: 'GO', genes: 8, total: 220, padj: 1.8e-6, geneRatio: 0.16, category: 'Biological Process' },
        { id: 'GO:0042116', name: 'Macrophage activation', db: 'GO', genes: 7, total: 165, padj: 4.1e-6, geneRatio: 0.14, category: 'Biological Process' },
      ],
    },
    {
      id: 'tb-up', name: 'TB Upregulated', source: 'AHRI South Africa DEG list',
      color: '#f97316', background: '#2e1408',
      description: 'Top 50 upregulated genes from M. tuberculosis blood signature study (AHRI, South Africa). Dominated by interferon-stimulated genes and neutrophil activation.',
      terms: [
        { id: 'GO:0060337', name: 'Type I interferon signaling', db: 'GO', genes: 22, total: 380, padj: 1.4e-20, geneRatio: 0.44, category: 'Biological Process' },
        { id: 'GO:0045087', name: 'Innate immune response', db: 'GO', genes: 20, total: 642, padj: 2.8e-17, geneRatio: 0.40, category: 'Biological Process' },
        { id: 'hsa05152', name: 'Tuberculosis (KEGG)', db: 'KEGG', genes: 18, total: 178, padj: 3.1e-16, geneRatio: 0.36, category: 'Disease pathway' },
        { id: 'GO:0034340', name: 'Response to type I interferon', db: 'GO', genes: 17, total: 295, padj: 5.2e-15, geneRatio: 0.34, category: 'Biological Process' },
        { id: 'GO:0043312', name: 'Neutrophil degranulation', db: 'GO', genes: 15, total: 480, padj: 8.9e-12, geneRatio: 0.30, category: 'Biological Process' },
        { id: 'hsa04620', name: 'Toll-like receptor signaling (KEGG)', db: 'KEGG', genes: 13, total: 104, padj: 2.3e-11, geneRatio: 0.26, category: 'Signaling' },
        { id: 'GO:0002230', name: 'Positive regulation of defense', db: 'GO', genes: 12, total: 342, padj: 7.1e-10, geneRatio: 0.24, category: 'Biological Process' },
        { id: 'GO:0030168', name: 'Platelet activation', db: 'GO', genes: 9, total: 210, padj: 1.9e-8, geneRatio: 0.18, category: 'Biological Process' },
        { id: 'hsa04064', name: 'NF-kB signaling (KEGG)', db: 'KEGG', genes: 10, total: 98, padj: 3.4e-8, geneRatio: 0.20, category: 'Signaling' },
        { id: 'GO:0006909', name: 'Phagocytosis', db: 'GO', genes: 8, total: 156, padj: 9.1e-7, geneRatio: 0.16, category: 'Biological Process' },
        { id: 'GO:0002281', name: 'Macrophage activation (innate)', db: 'GO', genes: 7, total: 120, padj: 2.3e-6, geneRatio: 0.14, category: 'Biological Process' },
        { id: 'GO:0050778', name: 'Positive regulation of immune response', db: 'GO', genes: 11, total: 540, padj: 4.8e-6, geneRatio: 0.22, category: 'Biological Process' },
      ],
    },
    {
      id: 'covid-up', name: 'COVID-19 Upregulated', source: 'Multi-site Africa DEG list',
      color: '#58a6ff', background: '#0a1628',
      description: 'Top 50 upregulated genes from severe COVID-19 blood study conducted across five African sites. Shows myeloid activation and S100A8/A9-driven cytokine storm signature.',
      terms: [
        { id: 'GO:0006955', name: 'Immune response', db: 'GO', genes: 26, total: 840, padj: 8.2e-22, geneRatio: 0.52, category: 'Biological Process' },
        { id: 'GO:0002526', name: 'Acute inflammatory response', db: 'GO', genes: 19, total: 420, padj: 1.6e-17, geneRatio: 0.38, category: 'Biological Process' },
        { id: 'hsa05171', name: 'Coronavirus disease (KEGG)', db: 'KEGG', genes: 21, total: 232, padj: 3.4e-16, geneRatio: 0.42, category: 'Disease pathway' },
        { id: 'GO:0043312', name: 'Neutrophil degranulation', db: 'GO', genes: 17, total: 480, padj: 5.7e-14, geneRatio: 0.34, category: 'Biological Process' },
        { id: 'GO:0019221', name: 'Cytokine-mediated signaling', db: 'GO', genes: 15, total: 512, padj: 2.1e-12, geneRatio: 0.30, category: 'Biological Process' },
        { id: 'hsa04668', name: 'TNF signaling (KEGG)', db: 'KEGG', genes: 12, total: 110, padj: 4.3e-11, geneRatio: 0.24, category: 'Signaling' },
        { id: 'GO:0071222', name: 'Response to LPS', db: 'GO', genes: 11, total: 280, padj: 8.9e-10, geneRatio: 0.22, category: 'Biological Process' },
        { id: 'GO:0010248', name: 'Cellular response to oxygen levels', db: 'GO', genes: 10, total: 310, padj: 2.2e-8, geneRatio: 0.20, category: 'Biological Process' },
        { id: 'hsa04640', name: 'Hematopoietic cell lineage (KEGG)', db: 'KEGG', genes: 9, total: 87, padj: 5.8e-8, geneRatio: 0.18, category: 'Development' },
        { id: 'GO:0030099', name: 'Myeloid cell differentiation', db: 'GO', genes: 8, total: 240, padj: 1.4e-7, geneRatio: 0.16, category: 'Biological Process' },
        { id: 'GO:0006878', name: 'Cellular copper ion homeostasis', db: 'GO', genes: 6, total: 88, padj: 3.2e-6, geneRatio: 0.12, category: 'Biological Process' },
        { id: 'GO:0032729', name: 'Positive regulation of IFN-gamma', db: 'GO', genes: 7, total: 195, padj: 6.1e-6, geneRatio: 0.14, category: 'Biological Process' },
      ],
    },
  ];

  let _dataset = DATASETS[0];
  let _view = 'bar';
  let _dbFilter = 'all';

  function _filteredTerms() {
    return _dataset.terms.filter(t => _dbFilter === 'all' || t.db === _dbFilter).slice(0, 12);
  }

  function _fmtP(p) {
    if (p === 0) return '0';
    const exp = Math.floor(Math.log10(p));
    const man = (p / Math.pow(10, exp)).toFixed(1);
    return `${man}e${exp}`;
  }

  function _barSVG(terms) {
    const W = 640, H = 28 * terms.length + 52, ml = 228, mr = 80, mt = 28, mb = 24;
    const pw = W - ml - mr;
    const maxScore = Math.max(...terms.map(t => -Math.log10(t.padj)));
    const xs = v => ml + (v / maxScore) * pw;
    let svg = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="width:100%;display:block">`;
    svg += `<rect width="${W}" height="${H}" fill="#0D1524"/>`;
    svg += `<text x="${ml + pw/2}" y="${mt-8}" text-anchor="middle" fill="#A8A098" font-size="10">-log10(adjusted p-value)</text>`;

    terms.forEach((t, i) => {
      const y = mt + i * 28;
      const score = -Math.log10(t.padj);
      const barW = (score / maxScore) * pw;
      const col = t.db === 'KEGG' ? '#f97316' : _dataset.color;
      svg += `<text x="${ml-6}" y="${y+9}" text-anchor="end" fill="#A8A098" font-size="9" font-family="Inter,sans-serif">${t.name.length > 32 ? t.name.slice(0,30)+'…' : t.name}</text>`;
      svg += `<rect x="${ml}" y="${y}" width="${barW}" height="18" fill="${col}" opacity="0.75" rx="3"/>`;
      svg += `<text x="${ml + barW + 4}" y="${y+11}" fill="#A8A098" font-size="8.5" font-family="monospace">${_fmtP(t.padj)}</text>`;
      const gCol = t.db === 'KEGG' ? '#f97316' : '#6E6860';
      svg += `<text x="${W - mr + 4}" y="${y+11}" fill="${gCol}" font-size="8.5" font-family="monospace">${t.genes}/${t.total}</text>`;
    });

    svg += `<text x="${W-mr+4}" y="${mt-8}" fill="#6E6860" font-size="8.5">n/total</text>`;
    svg += `<line x1="${ml}" y1="${mt-14}" x2="${ml}" y2="${H-mb}" stroke="#182236" stroke-width="1"/>`;
    svg += '</svg>';
    return svg;
  }

  function _bubbleSVG(terms) {
    const W = 520, H = 340, ml = 50, mr = 18, mt = 28, mb = 40;
    const pw = W - ml - mr, ph = H - mt - mb;
    const maxGR = Math.max(...terms.map(t => t.geneRatio));
    const minP = Math.min(...terms.map(t => t.padj));
    const maxP = Math.max(...terms.map(t => t.padj));
    const xs = gr => ml + (gr / maxGR) * pw;
    const ys = p => mt + (Math.log10(p) - Math.log10(minP)) / (Math.log10(maxP) - Math.log10(minP)) * ph;
    const sz = n => Math.max(5, Math.min(20, 4 + n * 0.8));

    let svg = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="width:100%;display:block">`;
    svg += `<rect width="${W}" height="${H}" fill="#0D1524"/>`;

    [0.1, 0.2, 0.3, 0.4, 0.5].filter(v => v <= maxGR).forEach(v => {
      const x = xs(v);
      svg += `<line x1="${x}" y1="${mt}" x2="${x}" y2="${mt+ph}" stroke="#182236" stroke-width="1"/>`;
      svg += `<text x="${x}" y="${mt+ph+14}" text-anchor="middle" fill="#6E6860" font-size="8.5">${v}</text>`;
    });

    terms.forEach(t => {
      const x = xs(t.geneRatio), y = ys(t.padj), r = sz(t.genes);
      const col = t.db === 'KEGG' ? '#f97316' : _dataset.color;
      svg += `<circle cx="${x}" cy="${y}" r="${r}" fill="${col}" opacity="0.7"><title>${t.name}\npadj: ${_fmtP(t.padj)}\ngenes: ${t.genes}</title></circle>`;
    });

    svg += `<text x="${ml+pw/2}" y="${H-4}" text-anchor="middle" fill="#6E6860" font-size="10">Gene Ratio</text>`;
    svg += `<text x="10" y="${mt+ph/2}" text-anchor="middle" fill="#6E6860" font-size="10" transform="rotate(-90 10 ${mt+ph/2})">-log10(padj) →</text>`;

    svg += `<circle cx="${W-mr-60}" cy="${mt+12}" r="4" fill="${_dataset.color}"/><text x="${W-mr-52}" y="${mt+16}" fill="#6E6860" font-size="8.5">GO</text>`;
    svg += `<circle cx="${W-mr-30}" cy="${mt+12}" r="4" fill="#f97316"/><text x="${W-mr-22}" y="${mt+16}" fill="#6E6860" font-size="8.5">KEGG</text>`;
    svg += '</svg>';
    return svg;
  }

  function _renderViz() {
    const el = document.getElementById('enr-viz');
    if (!el) return;
    const terms = _filteredTerms();
    el.innerHTML = _view === 'bar' ? _barSVG(terms) : _bubbleSVG(terms);
  }

  function _renderTable() {
    const el = document.getElementById('enr-table');
    if (!el) return;
    const terms = _filteredTerms();
    el.innerHTML = `<table class="enr-tbl">
      <thead><tr><th>Term ID</th><th>Name</th><th>DB</th><th>Genes</th><th>GeneRatio</th><th>adj. p-value</th></tr></thead>
      <tbody>${terms.map(t => `<tr>
        <td class="enr-id" style="color:${t.db==='KEGG'?'#f97316':'#58a6ff'}">${t.id}</td>
        <td>${t.name}</td>
        <td><span class="enr-db-badge ${t.db}">${t.db}</span></td>
        <td>${t.genes} / ${t.total}</td>
        <td>${t.geneRatio.toFixed(2)}</td>
        <td class="enr-p">${_fmtP(t.padj)}</td>
      </tr>`).join('')}</tbody>
    </table>`;
  }

  function init() {
    const container = document.getElementById('enrichment-content');
    if (!container) return;
    if (container.querySelector('.enr-page')) return;

    container.innerHTML = `
<div class="enr-page">
  <div class="enr-header">
    <h1 class="enr-title">GO and Pathway Enrichment Analysis</h1>
    <p class="enr-sub">Functional enrichment results from African disease DEG lists — malaria, TB, and COVID-19. Visualise top enriched GO biological processes and KEGG pathways as bar charts or bubble plots.</p>
  </div>

  <div class="enr-dataset-tabs">
    ${DATASETS.map(d => `<button class="enr-ds-btn${d.id===_dataset.id?' active':''}" style="${d.id===_dataset.id?`background:${d.background};border-color:${d.color}`:''}"
        onclick="OmicsLab.Enrichment.selectDataset('${d.id}')">
      <span class="enr-ds-name" style="color:${d.color}">${d.name}</span>
      <span class="enr-ds-src">${d.source}</span>
    </button>`).join('')}
  </div>

  <div class="enr-meta">
    <p id="enr-desc"></p>
  </div>

  <div class="enr-controls">
    <div class="enr-ctrl-group">
      <span class="enr-ctrl-label">View</span>
      <button class="enr-view-btn active" onclick="OmicsLab.Enrichment.setView('bar',this)">Bar Chart</button>
      <button class="enr-view-btn" onclick="OmicsLab.Enrichment.setView('bubble',this)">Bubble Plot</button>
    </div>
    <div class="enr-ctrl-group">
      <span class="enr-ctrl-label">Database</span>
      <button class="enr-db-btn active" onclick="OmicsLab.Enrichment.setDb('all',this)">All</button>
      <button class="enr-db-btn" onclick="OmicsLab.Enrichment.setDb('GO',this)">GO</button>
      <button class="enr-db-btn" onclick="OmicsLab.Enrichment.setDb('KEGG',this)">KEGG</button>
    </div>
  </div>

  <div class="enr-viz-box" id="enr-viz"></div>

  <div class="enr-table-wrap" id="enr-table"></div>
</div>`;

    _refreshDesc();
    _renderViz();
    _renderTable();
  }

  function _refreshDesc() {
    const el = document.getElementById('enr-desc');
    if (el) el.textContent = _dataset.description;
  }

  function selectDataset(id) {
    _dataset = DATASETS.find(d => d.id === id) || DATASETS[0];
    document.querySelectorAll('.enr-ds-btn').forEach((b, i) => {
      const active = DATASETS[i]?.id === id;
      b.classList.toggle('active', active);
      b.style.background = active ? DATASETS[i].background : '';
      b.style.borderColor = active ? DATASETS[i].color : '';
    });
    _refreshDesc(); _renderViz(); _renderTable();
  }

  function setView(v, btn) {
    _view = v;
    document.querySelectorAll('.enr-view-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    _renderViz();
  }

  function setDb(db, btn) {
    _dbFilter = db;
    document.querySelectorAll('.enr-db-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    _renderViz(); _renderTable();
  }

  return { init, selectDataset, setView, setDb };
})();
