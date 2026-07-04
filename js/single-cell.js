/* ═══════════════════════════════════════════════════════════════
   OmicsLab — Single-Cell RNA-seq Explorer
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.SingleCell = (function () {

  const STUDIES = [
    {
      id: 'malaria-pbmc', name: 'Malaria PBMC Atlas',
      institution: 'KEMRI-Wellcome Trust, Nairobi, Kenya',
      description: 'Peripheral blood mononuclear cells from Kenyan children with severe malaria (n=12) vs healthy controls (n=10). Identifies expanded erythrocyte progenitors and suppressed T-cell subsets.',
      cells: 565, genes: 18420, accession: 'GSE149161',
      clusters: [
        { id: 0, name: 'CD4+ T', color: '#00C4A0', cx: -5.5, cy: 2.8, n: 115, markers: ['CD3D','CD4','IL7R','TCF7','MAL'], biology: 'Helper T cells — coordinate adaptive immunity. Reduced in severe malaria due to T-cell exhaustion.' },
        { id: 1, name: 'CD8+ T', color: '#58a6ff', cx: -2.8, cy: 5.2, n: 78, markers: ['CD3D','CD8A','GZMB','PRF1','NKG7'], biology: 'Cytotoxic T cells — kill infected erythrocytes. GZMB+ subset expanded in acute malaria.' },
        { id: 2, name: 'NK cell', color: '#f97316', cx: 0.8, cy: 6.8, n: 55, markers: ['NCAM1','GNLY','NKG7','FCGR3A','KLRD1'], biology: 'Natural killer cells — rapid response to P. falciparum-infected erythrocytes. Elevated activation markers.' },
        { id: 3, name: 'B cell', color: '#bc8cff', cx: 4.8, cy: 3.6, n: 62, markers: ['CD79A','MS4A1','CD19','IGHM','IGHG1'], biology: 'B cells — produce malaria-specific antibodies. IGHG1+ plasma blasts increased in infection.' },
        { id: 4, name: 'Classical Mono', color: '#f85149', cx: 6.5, cy: -1.8, n: 98, markers: ['CD14','LYZ','S100A8','S100A9','CSF1R'], biology: 'Pro-inflammatory monocytes — phagocytose parasitised erythrocytes. S100A8/A9 drives cytokine storm.' },
        { id: 5, name: 'Non-classical Mono', color: '#e3b341', cx: 3.8, cy: -3.2, n: 32, markers: ['FCGR3A','MS4A7','CX3CR1','SERPINA1','CFP'], biology: 'Patrolling monocytes — survey vasculature. Reduced in malaria as infection diverts immune response.' },
        { id: 6, name: 'pDC', color: '#ff79c6', cx: 1.2, cy: -5.2, n: 18, markers: ['LILRA4','CLEC4C','IL3RA','GZMB','PTCRA'], biology: 'Plasmacytoid dendritic cells — produce type I interferons. IFN response critical in early parasite control.' },
        { id: 7, name: 'Ery. Progenitor', color: '#50fa7b', cx: -5.8, cy: -4.2, n: 107, markers: ['HBB','HBA1','GYPA','ALAS2','KLF1'], biology: 'Erythrocyte progenitors — massively expanded in malaria. HBB+ cells are target of P. falciparum invasion.' },
      ],
    },
    {
      id: 'tb-granuloma', name: 'TB Lung Granuloma',
      institution: 'AHRI, Durban, South Africa',
      description: 'Single-cell transcriptomics of BAL cells and induced sputum from pulmonary TB patients (n=8) in a South African cohort. Identifies immunosuppressive macrophage subsets and exhausted T cells.',
      cells: 482, genes: 16340, accession: 'GSE158055',
      clusters: [
        { id: 0, name: 'CD4+ T (exhausted)', color: '#58a6ff', cx: -4.8, cy: 3.2, n: 95, markers: ['CD3D','CD4','PDCD1','LAG3','HAVCR2'], biology: 'Exhausted CD4+ T cells — upregulate checkpoint molecules PD-1 (PDCD1), LAG-3, and TIM-3 in chronic TB.' },
        { id: 1, name: 'CD8+ T (effector)', color: '#00C4A0', cx: -2.2, cy: 5.5, n: 68, markers: ['CD3D','CD8A','GZMB','IFNG','TNF'], biology: 'Effector CD8+ T cells — GZMB+/IFNG+ cytotoxic activity targets Mtb-infected macrophages.' },
        { id: 2, name: 'Alveolar Macro', color: '#f97316', cx: 5.2, cy: 2.0, n: 88, markers: ['MRC1','CD163','APOE','MARCO','TREM2'], biology: 'Anti-inflammatory alveolar macrophages — TREM2+ subset accumulates in granulomas and supports Mtb persistence.' },
        { id: 3, name: 'Interstitial Macro', color: '#f85149', cx: 7.0, cy: -1.2, n: 72, markers: ['CD14','S100A8','FCN1','GBP5','BATF2'], biology: 'Pro-inflammatory macrophages — GBP5 and BATF2 are leading TB blood signatures used for diagnosis.' },
        { id: 4, name: 'B cell', color: '#bc8cff', cx: 3.5, cy: 5.5, n: 48, markers: ['CD79A','MS4A1','IGHM','JCHAIN','XBP1'], biology: 'B cell aggregates form tertiary lymphoid structures (TLS) at TB granuloma periphery.' },
        { id: 5, name: 'NK cell', color: '#e3b341', cx: 0.5, cy: 7.5, n: 42, markers: ['NCAM1','NKG7','KLRD1','FCGR3A','IL18RAP'], biology: 'NK cells contribute early IFN-γ before adaptive responses establish. Reduced in cavitary disease.' },
        { id: 6, name: 'DC (myeloid)', color: '#ff79c6', cx: 2.0, cy: -4.5, n: 36, markers: ['CLEC10A','CD1C','FCER1A','HLA-DRA','ITGAX'], biology: 'Myeloid dendritic cells — present Mtb antigens to T cells. CD1c+ subtype activates CD4+ T cells.' },
        { id: 7, name: 'Mast / Basophil', color: '#50fa7b', cx: -5.0, cy: -3.8, n: 33, markers: ['TPSAB1','CPA3','GATA2','HDC','MS4A2'], biology: 'Mast cells in TB lung — CPA3+ cells are elevated; contribute to tissue remodelling in granuloma.' },
      ],
    },
  ];

  let _study = STUDIES[0];
  let _selectedCluster = null;

  function _rng(seed) { let s = seed; return () => { s = (s*16807)%2147483647; return (s-1)/2147483646; }; }

  function _generateCells(study) {
    const cells = [];
    study.clusters.forEach(cl => {
      const r = _rng(cl.id * 7919 + study.id.length * 131);
      for (let i = 0; i < cl.n; i++) {
        const angle = r() * Math.PI * 2;
        const radius = Math.sqrt(-2 * Math.log(Math.max(0.001, r()))) * 1.1;
        cells.push({ x: cl.cx + Math.cos(angle) * radius, y: cl.cy + Math.sin(angle) * radius, cluster: cl.id });
      }
    });
    return cells;
  }

  function _umapSVG(study, selectedCluster) {
    const cells = _generateCells(study);
    const W = 500, H = 380, pad = 28;
    const allX = cells.map(c => c.x), allY = cells.map(c => c.y);
    const minX = Math.min(...allX) - 1, maxX = Math.max(...allX) + 1;
    const minY = Math.min(...allY) - 1, maxY = Math.max(...allY) + 1;
    const xs = x => pad + ((x - minX) / (maxX - minX)) * (W - 2*pad);
    const ys = y => pad + (1 - (y - minY) / (maxY - minY)) * (H - 2*pad);

    let svg = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="width:100%;display:block">`;
    svg += `<rect width="${W}" height="${H}" fill="#0D1524"/>`;

    cells.forEach(c => {
      const cl = study.clusters[c.cluster];
      const dim = selectedCluster !== null && c.cluster !== selectedCluster;
      const col = cl.color;
      svg += `<circle cx="${xs(c.x)}" cy="${ys(c.y)}" r="2.5" fill="${col}" opacity="${dim?0.12:0.75}" />`;
    });

    /* Cluster labels */
    study.clusters.forEach(cl => {
      svg += `<text x="${xs(cl.cx)}" y="${ys(cl.cy)-8}" text-anchor="middle" fill="#A8A098" font-size="8.5" font-weight="600" font-family="Inter,sans-serif" opacity="0.9">${cl.name}</text>`;
    });

    svg += `<text x="4" y="${H-4}" fill="#6E6860" font-size="9" font-family="Inter,sans-serif">UMAP 1</text>`;
    svg += `<text x="4" y="14" fill="#6E6860" font-size="9" font-family="Inter,sans-serif" transform="rotate(-90 10 ${H/2}) translate(0 0)">UMAP 2</text>`;
    svg += '</svg>';
    return svg;
  }

  function _dotplotSVG(study, selectedCluster) {
    const cl = selectedCluster !== null ? [study.clusters[selectedCluster]] : study.clusters;
    const allMarkers = [...new Set(cl.flatMap(c => c.markers.slice(0, 3)))];
    const W = 500, ROW = 26, COL = 56, ml = 110, mt = 28, mr = 12, mb = 24;
    const H = mt + mb + cl.length * ROW;
    const colW = allMarkers.length > 0 ? (W - ml - mr) / allMarkers.length : COL;

    let svg = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="width:100%;display:block">`;
    svg += `<rect width="${W}" height="${H}" fill="#0D1524"/>`;

    allMarkers.forEach((gene, gi) => {
      const x = ml + gi * colW + colW / 2;
      svg += `<text x="${x}" y="${mt-8}" text-anchor="middle" fill="#A8A098" font-size="9" font-family="monospace">${gene}</text>`;
    });

    cl.forEach((c, ci) => {
      const r = _rng(c.id * 37 + ci);
      const y = mt + ci * ROW + ROW / 2;
      svg += `<text x="${ml-6}" y="${y+4}" text-anchor="end" fill="${c.color}" font-size="9.5" font-weight="600" font-family="Inter,sans-serif">${c.name}</text>`;
      allMarkers.forEach((gene, gi) => {
        const x = ml + gi * colW + colW / 2;
        const isMarker = c.markers.includes(gene);
        const expr = isMarker ? 0.6 + r() * 0.4 : r() * 0.25;
        const pct = isMarker ? 0.55 + r() * 0.35 : r() * 0.2;
        const radius = Math.max(3, pct * 10);
        svg += `<circle cx="${x}" cy="${y}" r="${radius}" fill="${c.color}" opacity="${expr.toFixed(2)}"/>`;
      });
    });

    svg += `<text x="${W/2}" y="${H-6}" text-anchor="middle" fill="#6E6860" font-size="9" font-family="Inter,sans-serif">Marker Genes — dot size = % expressing, opacity = mean expression</text>`;
    svg += '</svg>';
    return svg;
  }

  function _renderPanels() {
    const umapEl = document.getElementById('sc-umap');
    const dotEl = document.getElementById('sc-dotplot');
    if (umapEl) umapEl.innerHTML = _umapSVG(_study, _selectedCluster);
    if (dotEl) dotEl.innerHTML = _dotplotSVG(_study, _selectedCluster);
    _renderClusterList();
  }

  function _renderClusterList() {
    const el = document.getElementById('sc-clusters');
    if (!el) return;
    el.innerHTML = _study.clusters.map(cl => `
      <button class="sc-cl-btn${_selectedCluster === cl.id ? ' active' : ''}" style="--cl-color:${cl.color}"
              onclick="OmicsLab.SingleCell.selectCluster(${cl.id})">
        <span class="sc-cl-dot" style="background:${cl.color}"></span>
        <span class="sc-cl-name">${cl.name}</span>
        <span class="sc-cl-n">${cl.n}</span>
      </button>`).join('');

    const infoEl = document.getElementById('sc-cluster-info');
    if (!infoEl) return;
    if (_selectedCluster === null) {
      infoEl.innerHTML = `<p class="sc-info-hint">Select a cluster to see cell type biology, marker genes, and disease context.</p>`;
    } else {
      const cl = _study.clusters[_selectedCluster];
      infoEl.innerHTML = `
        <div class="sc-info-name" style="color:${cl.color}">${cl.name}</div>
        <div class="sc-info-count">${cl.n} cells (${Math.round(cl.n/_study.cells*100)}% of total)</div>
        <div class="sc-info-section">Marker genes</div>
        <div class="sc-marker-row">${cl.markers.map(g => `<span class="sc-gene-tag">${g}</span>`).join('')}</div>
        <div class="sc-info-section">Disease context</div>
        <p class="sc-info-bio">${cl.biology}</p>`;
    }
  }

  function init() {
    const container = document.getElementById('single-cell-content');
    if (!container) return;
    if (container.querySelector('.sc-page')) return;

    container.innerHTML = `
<div class="sc-page">
  <div class="sc-header">
    <h1 class="sc-title">Single-Cell RNA-seq Explorer</h1>
    <p class="sc-sub">UMAP visualization and cell type annotation for African disease cohorts. Explore cluster biology, marker gene expression, and disease-specific immune profiles.</p>
  </div>

  <div class="sc-study-tabs">
    ${STUDIES.map(s => `<button class="sc-study-btn${s.id===_study.id?' active':''}" onclick="OmicsLab.SingleCell.selectStudy('${s.id}')">
      <span class="sc-study-name">${s.name}</span>
      <span class="sc-study-inst">${s.institution}</span>
    </button>`).join('')}
  </div>

  <div class="sc-study-meta">
    <div id="sc-meta-cells"></div>
  </div>

  <div class="sc-layout">
    <div class="sc-plots">
      <div class="sc-plot-card">
        <div class="sc-plot-title">UMAP Embedding — ${_study.cells} cells</div>
        <div class="sc-plot-sub">Click a cell type in the legend to highlight it</div>
        <div id="sc-umap"></div>
      </div>
      <div class="sc-plot-card">
        <div class="sc-plot-title">Marker Gene Dotplot</div>
        <div class="sc-plot-sub">Top 3 markers per selected cluster</div>
        <div id="sc-dotplot"></div>
      </div>
    </div>

    <aside class="sc-sidebar">
      <div class="sc-sb-title">Cell Types</div>
      <div id="sc-clusters"></div>
      <button class="sc-clear-btn" onclick="OmicsLab.SingleCell.selectCluster(null)">Show all clusters</button>
      <div class="sc-sb-title" style="margin-top:1rem">Cell Type Detail</div>
      <div id="sc-cluster-info"></div>
    </aside>
  </div>
</div>`;

    _updateMeta();
    _renderPanels();
  }

  function _updateMeta() {
    const el = document.getElementById('sc-meta-cells');
    if (!el) return;
    const s = _study;
    el.innerHTML = `<div class="sc-meta-row">
      <span class="sc-meta-item"><strong>${s.cells.toLocaleString()}</strong> cells</span>
      <span class="sc-meta-sep">·</span>
      <span class="sc-meta-item"><strong>${s.genes.toLocaleString()}</strong> genes</span>
      <span class="sc-meta-sep">·</span>
      <span class="sc-meta-item"><strong>${s.clusters.length}</strong> cell types</span>
      <span class="sc-meta-sep">·</span>
      <span class="sc-meta-item">${s.institution}</span>
      <span class="sc-meta-sep">·</span>
      <span class="sc-meta-item" style="font-family:monospace;color:#58a6ff">${s.accession}</span>
    </div>
    <p class="sc-meta-desc">${s.description}</p>`;
  }

  function selectStudy(id) {
    _study = STUDIES.find(s => s.id === id) || STUDIES[0];
    _selectedCluster = null;
    document.querySelectorAll('.sc-study-btn').forEach((b, i) => b.classList.toggle('active', STUDIES[i]?.id === id));
    const titleEl = document.querySelector('.sc-plot-title');
    if (titleEl) titleEl.textContent = `UMAP Embedding — ${_study.cells} cells`;
    _updateMeta();
    _renderPanels();
  }

  function selectCluster(id) {
    _selectedCluster = (id === null || id === _selectedCluster) ? null : id;
    _renderPanels();
  }

  return { init, selectStudy, selectCluster };
})();
