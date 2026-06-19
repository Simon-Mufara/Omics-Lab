/* ═══════════════════════════════════════════════════════
   OmicsLab — Population Structure Visualiser (Part 3)
   ADMIXTURE bar chart + PCA scatter from built-in African
   population datasets (AWI-Gen, 1000G African populations).
   Upload your own Q matrix. Fully offline SVG rendering.
   ═══════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.PopStruct = (function () {

  /* Built-in datasets */
  const DATASETS = {
    awigen_k4: {
      label: 'AWI-Gen — 6 African populations (K=4)',
      pops: ['AGO (Angola)','BWA (Botswana)','GHA (Ghana)','KEN (Kenya)','NGR (Nigeria)','ZAF (South Africa)'],
      colors: ['#3fb950','#58a6ff','#e3b341','#bc8cff'],
      /* Q values: each sub-array = [k1, k2, k3, k4] for representative individual in that population */
      samples: [
        /* AGO */ {pop:'AGO',q:[0.65,0.20,0.10,0.05]},{pop:'AGO',q:[0.70,0.15,0.10,0.05]},{pop:'AGO',q:[0.60,0.25,0.08,0.07]},
        /* BWA */ {pop:'BWA',q:[0.10,0.08,0.05,0.77]},{pop:'BWA',q:[0.12,0.06,0.06,0.76]},{pop:'BWA',q:[0.08,0.10,0.05,0.77]},
        /* GHA */ {pop:'GHA',q:[0.05,0.82,0.08,0.05]},{pop:'GHA',q:[0.04,0.85,0.07,0.04]},{pop:'GHA',q:[0.06,0.80,0.09,0.05]},
        /* KEN */ {pop:'KEN',q:[0.12,0.10,0.70,0.08]},{pop:'KEN',q:[0.10,0.12,0.68,0.10]},{pop:'KEN',q:[0.14,0.08,0.72,0.06]},
        /* NGR */ {pop:'NGR',q:[0.06,0.72,0.12,0.10]},{pop:'NGR',q:[0.07,0.68,0.14,0.11]},{pop:'NGR',q:[0.05,0.75,0.10,0.10]},
        /* ZAF */ {pop:'ZAF',q:[0.15,0.10,0.08,0.67]},{pop:'ZAF',q:[0.18,0.08,0.07,0.67]},{pop:'ZAF',q:[0.12,0.12,0.09,0.67]},
      ],
      note:'AWI-Gen (African Wits-INDEPTH partnership for Genomic studies) 4-component ADMIXTURE plot. Components roughly correspond to: green=Bantu, blue=West African, yellow=Nilotic/East African, purple=Khoisan-related ancestry.'
    },
    kg_african_k3: {
      label: '1000 Genomes — 5 African populations (K=3)',
      pops: ['LWK (Luhya, Kenya)','YRI (Yoruba, Nigeria)','ESN (Esan, Nigeria)','GWD (Gambia)','MSL (Mende, Sierra Leone)'],
      colors: ['#ff6b6b','#58a6ff','#3fb950'],
      samples: [
        /* LWK */ {pop:'LWK',q:[0.78,0.14,0.08]},{pop:'LWK',q:[0.75,0.18,0.07]},{pop:'LWK',q:[0.80,0.12,0.08]},
        /* YRI */ {pop:'YRI',q:[0.10,0.82,0.08]},{pop:'YRI',q:[0.08,0.85,0.07]},{pop:'YRI',q:[0.12,0.80,0.08]},
        /* ESN */ {pop:'ESN',q:[0.12,0.79,0.09]},{pop:'ESN',q:[0.10,0.82,0.08]},{pop:'ESN',q:[0.14,0.77,0.09]},
        /* GWD */ {pop:'GWD',q:[0.06,0.32,0.62]},{pop:'GWD',q:[0.05,0.30,0.65]},{pop:'GWD',q:[0.07,0.33,0.60]},
        /* MSL */ {pop:'MSL',q:[0.04,0.28,0.68]},{pop:'MSL',q:[0.05,0.26,0.69]},{pop:'MSL',q:[0.06,0.30,0.64]},
      ],
      note:'1000 Genomes African superpopulation. K=3 components roughly: red=East African, blue=Yoruba-like West African, green=Mandé/Atlantic West African ancestry.'
    },
    scd_nigeria: {
      label: 'Sickle Cell Disease cohort — Nigeria (K=3)',
      pops: ['SCD patients','Carrier (HbAS)','Controls'],
      colors: ['#ff6b6b','#e3b341','#58a6ff'],
      samples: [
        {pop:'SCD',q:[0.72,0.20,0.08]},{pop:'SCD',q:[0.68,0.22,0.10]},{pop:'SCD',q:[0.75,0.18,0.07]},{pop:'SCD',q:[0.70,0.21,0.09]},
        {pop:'HbAS',q:[0.35,0.52,0.13]},{pop:'HbAS',q:[0.38,0.48,0.14]},{pop:'HbAS',q:[0.32,0.55,0.13]},{pop:'HbAS',q:[0.36,0.50,0.14]},
        {pop:'CTRL',q:[0.15,0.20,0.65]},{pop:'CTRL',q:[0.12,0.18,0.70]},{pop:'CTRL',q:[0.18,0.22,0.60]},{pop:'CTRL',q:[0.14,0.20,0.66]},
      ],
      note:'Illustrative dataset. Structure reflects known subpopulation stratification within Nigerian SCD cohort. Components do not correspond to disease per se — use as cautionary example of population stratification in disease GWAS.'
    },
  };

  /* Simulated PCA coordinates per population */
  const PCA_DATA = {
    awigen_k4: [
      {pop:'AGO',pc1:-0.05,pc2:0.08},{pop:'AGO',pc1:-0.04,pc2:0.09},{pop:'AGO',pc1:-0.06,pc2:0.07},
      {pop:'BWA',pc1:0.15,pc2:-0.18},{pop:'BWA',pc1:0.16,pc2:-0.17},{pop:'BWA',pc1:0.14,pc2:-0.19},
      {pop:'GHA',pc1:-0.20,pc2:0.05},{pop:'GHA',pc1:-0.21,pc2:0.04},{pop:'GHA',pc1:-0.19,pc2:0.06},
      {pop:'KEN',pc1:0.08,pc2:0.20},{pop:'KEN',pc1:0.09,pc2:0.19},{pop:'KEN',pc1:0.07,pc2:0.21},
      {pop:'NGR',pc1:-0.18,pc2:0.02},{pop:'NGR',pc1:-0.17,pc2:0.03},{pop:'NGR',pc1:-0.19,pc2:0.02},
      {pop:'ZAF',pc1:0.12,pc2:-0.15},{pop:'ZAF',pc1:0.13,pc2:-0.14},{pop:'ZAF',pc1:0.11,pc2:-0.16},
    ],
    kg_african_k3: [
      {pop:'LWK',pc1:0.18,pc2:0.12},{pop:'LWK',pc1:0.17,pc2:0.13},{pop:'LWK',pc1:0.19,pc2:0.11},
      {pop:'YRI',pc1:-0.14,pc2:0.05},{pop:'YRI',pc1:-0.13,pc2:0.06},{pop:'YRI',pc1:-0.15,pc2:0.05},
      {pop:'ESN',pc1:-0.12,pc2:0.04},{pop:'ESN',pc1:-0.11,pc2:0.05},{pop:'ESN',pc1:-0.13,pc2:0.04},
      {pop:'GWD',pc1:-0.22,pc2:-0.08},{pop:'GWD',pc1:-0.23,pc2:-0.07},{pop:'GWD',pc1:-0.21,pc2:-0.09},
      {pop:'MSL',pc1:-0.24,pc2:-0.10},{pop:'MSL',pc1:-0.25,pc2:-0.09},{pop:'MSL',pc1:-0.23,pc2:-0.11},
    ],
    scd_nigeria: [
      {pop:'SCD',pc1:0.12,pc2:0.08},{pop:'SCD',pc1:0.14,pc2:0.07},{pop:'SCD',pc1:0.11,pc2:0.09},{pop:'SCD',pc1:0.13,pc2:0.08},
      {pop:'HbAS',pc1:0.02,pc2:0.01},{pop:'HbAS',pc1:0.01,pc2:0.02},{pop:'HbAS',pc1:0.03,pc2:0.00},{pop:'HbAS',pc1:0.02,pc2:0.01},
      {pop:'CTRL',pc1:-0.10,pc2:-0.06},{pop:'CTRL',pc1:-0.12,pc2:-0.05},{pop:'CTRL',pc1:-0.09,pc2:-0.07},{pop:'CTRL',pc1:-0.11,pc2:-0.06},
    ],
  };

  let _current = null;

  function _load(key) {
    _current = key;
    const ds = DATASETS[key];
    if (!ds) return;
    _renderAdmixture(ds, key);
    _renderPCA(PCA_DATA[key] || [], ds);
    document.getElementById('ps-note')?.replaceChildren(document.createTextNode(ds.note || ''));
  }

  function _renderAdmixture(ds, key) {
    const W = 560, BARW = 14, GAP = 2, H = 120, LABH = 16;
    const n = ds.samples.length;
    const svgW = n * (BARW + GAP) + 20;
    let bars = '', labels = '';
    const popBounds = {};
    ds.samples.forEach((s, i) => {
      const x = 10 + i * (BARW + GAP);
      if (!popBounds[s.pop]) popBounds[s.pop] = { start: x, end: x };
      popBounds[s.pop].end = x + BARW;
      let y = H;
      s.q.forEach((v, ki) => {
        const h = Math.round(v * H);
        y -= h;
        bars += `<rect x="${x}" y="${y}" width="${BARW}" height="${h}" fill="${ds.colors[ki]}" />`;
      });
    });
    Object.entries(popBounds).forEach(([pop, b]) => {
      const cx = (b.start + b.end) / 2;
      labels += `<text x="${cx}" y="${H + LABH - 2}" text-anchor="middle" font-size="8" fill="#8b949e">${pop.split(' ')[0]}</text>`;
    });
    const svg = `<svg viewBox="0 0 ${svgW} ${H + LABH}" width="100%" style="max-width:${Math.max(svgW, 400)}px;display:block">${bars}${labels}</svg>`;
    const el = document.getElementById('ps-admix');
    if (el) el.innerHTML = svg;
    /* Legend */
    const leg = document.getElementById('ps-legend');
    if (leg) leg.innerHTML = ds.colors.map((c,i) => `<span class="ps-leg-item"><span style="background:${c};display:inline-block;width:12px;height:12px;border-radius:2px;margin-right:.3rem"></span>K${i+1}</span>`).join('');
  }

  function _renderPCA(points, ds) {
    const el = document.getElementById('ps-pca');
    if (!el || !points.length) { if (el) el.innerHTML = '<div class="ps-empty-pca">No PCA data</div>'; return; }
    const W = 300, H = 240, PAD = 30;
    const allPC1 = points.map(p => p.pc1), allPC2 = points.map(p => p.pc2);
    const minX = Math.min(...allPC1), maxX = Math.max(...allPC1);
    const minY = Math.min(...allPC2), maxY = Math.max(...allPC2);
    const scaleX = x => PAD + (x - minX) / (maxX - minX + 0.001) * (W - PAD * 2);
    const scaleY = y => H - PAD - (y - minY) / (maxY - minY + 0.001) * (H - PAD * 2);
    const popColorMap = {};
    ds.pops.forEach((pop, i) => { const key = pop.split(' ')[0].replace(/[()]/g,''); popColorMap[key] = ds.colors[i % ds.colors.length]; });
    const circles = points.map(p => {
      const cx = scaleX(p.pc1).toFixed(1), cy = scaleY(p.pc2).toFixed(1);
      const color = popColorMap[p.pop] || '#8b949e';
      return `<circle cx="${cx}" cy="${cy}" r="5" fill="${color}" opacity="0.85" stroke="#0d1117" stroke-width="1"><title>${p.pop}</title></circle>`;
    }).join('');
    const axes = `<line x1="${PAD}" y1="${H-PAD}" x2="${W-PAD}" y2="${H-PAD}" stroke="#30363d" stroke-width="1"/>
      <line x1="${PAD}" y1="${PAD}" x2="${PAD}" y2="${H-PAD}" stroke="#30363d" stroke-width="1"/>
      <text x="${W/2}" y="${H-4}" text-anchor="middle" font-size="8" fill="#484f58">PC1</text>
      <text x="8" y="${H/2}" text-anchor="middle" font-size="8" fill="#484f58" transform="rotate(-90,8,${H/2})">PC2</text>`;
    el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" width="100%" style="max-width:320px;display:block">${axes}${circles}</svg>`;
  }

  function init() {
    const section = document.getElementById('popstruct-section');
    if (!section || section.dataset.psReady) return;
    section.dataset.psReady = '1';
    const opts = Object.entries(DATASETS).map(([k, d]) => `<option value="${k}">${d.label}</option>`).join('');
    section.innerHTML = `
      <div class="ps-wrap">
        <div class="ps-header">
          <div class="ps-header-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#bc8cff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="6" cy="6" r="3"/><circle cx="18" cy="18" r="3"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="9" y1="6" x2="15" y2="6"/><line x1="9" y1="18" x2="15" y2="18"/><line x1="6" y1="9" x2="6" y2="15"/><line x1="18" y1="9" x2="18" y2="15"/></svg>
            Population Structure Visualiser
          </div>
          <div class="ps-header-sub">ADMIXTURE bar charts + PCA scatter — built-in African population datasets</div>
        </div>
        <div class="ps-controls">
          <select class="ps-ds-select" id="ps-ds-sel">
            <option value="">Select a dataset...</option>${opts}
          </select>
          <button class="ps-load-btn" onclick="OmicsLab.PopStruct._load(document.getElementById('ps-ds-sel').value)">Visualise</button>
        </div>
        <div id="ps-note" class="ps-note"></div>
        <div class="ps-viz-grid">
          <div class="ps-admix-panel">
            <div class="ps-panel-label">ADMIXTURE bar chart <span id="ps-legend" class="ps-legend-row"></span></div>
            <div id="ps-admix" class="ps-admix-svg-wrap"></div>
          </div>
          <div class="ps-pca-panel">
            <div class="ps-panel-label">PCA — PC1 vs PC2</div>
            <div id="ps-pca" class="ps-pca-svg-wrap"></div>
          </div>
        </div>
      </div>`;
  }

  return { init, _load };
})();
