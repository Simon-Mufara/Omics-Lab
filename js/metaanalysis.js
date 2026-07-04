/* ═══════════════════════════════════════════════════════
   OmicsLab — Meta-analysis Tool (Part 6)
   Fixed-effects and random-effects meta-analysis with
   SVG forest plot. Designed for genetic association
   studies. All computation in-browser.
   ═══════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.MetaAnalysis = (function () {

  /* Example datasets (GWAS across African cohorts) */
  const EXAMPLES = {
    sickle: {
      label: 'HBB rs334 — SCD risk in Africa',
      trait: 'Sickle Cell Disease (HbS allele)',
      studies: [
        { name:'AWI-Gen (Ghana)',    n:1200, cases:280, controls:920, beta:1.85, se:0.18 },
        { name:'H3Africa (Nigeria)', n:950,  cases:210, controls:740, beta:1.72, se:0.21 },
        { name:'KEMRI (Kenya)',      n:780,  cases:165, controls:615, beta:1.91, se:0.25 },
        { name:'AHRI (Ethiopia)',    n:620,  cases:140, controls:480, beta:1.68, se:0.29 },
        { name:'WACCBIP (Ghana)',    n:850,  cases:190, controls:660, beta:1.80, se:0.23 },
      ],
    },
    apol1: {
      label: 'APOL1 G1 — CKD risk',
      trait: 'Chronic Kidney Disease (APOL1 G1)',
      studies: [
        { name:'H3Africa CKD',      n:2100, cases:320, controls:1780, beta:0.82, se:0.14 },
        { name:'AWI-Gen (S. Africa)',n:1800, cases:275, controls:1525, beta:0.74, se:0.16 },
        { name:'APCDR (Nigeria)',    n:1400, cases:210, controls:1190, beta:0.88, se:0.19 },
        { name:'UCT CKD Cohort',    n:960,  cases:145, controls:815,  beta:0.79, se:0.22 },
      ],
    },
    t2d: {
      label: 'TCF7L2 rs7903146 — T2D GWAS',
      trait: 'Type 2 Diabetes (TCF7L2)',
      studies: [
        { name:'AWI-Gen Ghana',     n:3200, cases:620, controls:2580, beta:0.31, se:0.07 },
        { name:'APCDR Nigeria',     n:2800, cases:530, controls:2270, beta:0.28, se:0.08 },
        { name:'AWI-Gen S. Africa', n:2600, cases:490, controls:2110, beta:0.33, se:0.09 },
        { name:'KEMRI Kenya',       n:1900, cases:360, controls:1540, beta:0.27, se:0.10 },
        { name:'WACCBIP Ghana',     n:2200, cases:420, controls:1780, beta:0.30, se:0.08 },
        { name:'AHRI Ethiopia',     n:1500, cases:285, controls:1215, beta:0.25, se:0.12 },
      ],
    },
  };

  function _parseStudies() {
    const rows = document.querySelectorAll('.ma-study-row');
    const studies = [];
    rows.forEach(row => {
      const name = row.querySelector('.ma-s-name')?.value.trim();
      const beta = parseFloat(row.querySelector('.ma-s-beta')?.value);
      const se   = parseFloat(row.querySelector('.ma-s-se')?.value);
      const n    = parseInt(row.querySelector('.ma-s-n')?.value, 10);
      if (name && !isNaN(beta) && !isNaN(se) && se > 0) studies.push({ name, beta, se, n: n || 0 });
    });
    return studies;
  }

  function _addRow(s = {}) {
    const tbody = document.getElementById('ma-study-tbody');
    if (!tbody) return;
    const tr = document.createElement('tr');
    tr.className = 'ma-study-row';
    tr.innerHTML = `
      <td><input class="ma-s-name ma-s-inp" value="${s.name||''}" placeholder="Study name"></td>
      <td><input class="ma-s-beta ma-s-inp ma-s-num" type="number" step="any" value="${s.beta !== undefined ? s.beta : ''}" placeholder="β"></td>
      <td><input class="ma-s-se ma-s-inp ma-s-num" type="number" step="any" min="0.0001" value="${s.se || ''}" placeholder="SE"></td>
      <td><input class="ma-s-n ma-s-inp ma-s-num" type="number" step="1" value="${s.n||''}" placeholder="N"></td>
      <td><button class="ma-del-btn" onclick="this.closest('.ma-study-row').remove()" title="Remove">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button></td>`;
    tbody.appendChild(tr);
  }

  function _loadExample(key) {
    const ex = EXAMPLES[key];
    if (!ex) return;
    document.getElementById('ma-trait')?.setAttribute('value', ex.trait);
    const traitEl = document.getElementById('ma-trait');
    if (traitEl) traitEl.value = ex.trait;
    const tbody = document.getElementById('ma-study-tbody');
    if (tbody) tbody.innerHTML = '';
    ex.studies.forEach(s => _addRow(s));
  }

  function _run() {
    const studies = _parseStudies();
    if (studies.length < 2) { _showError('Add at least 2 studies.'); return; }
    const model = document.querySelector('input[name="ma-model"]:checked')?.value || 'fixed';
    const trait = document.getElementById('ma-trait')?.value.trim() || 'Trait';

    /* Weights = 1 / SE^2 */
    studies.forEach(s => { s.w = 1 / (s.se * s.se); s.ci95lo = s.beta - 1.96 * s.se; s.ci95hi = s.beta + 1.96 * s.se; });
    const W = studies.reduce((sum, s) => sum + s.w, 0);
    const betaFE = studies.reduce((sum, s) => sum + s.w * s.beta, 0) / W;
    const seFE = Math.sqrt(1 / W);
    const Q = studies.reduce((sum, s) => sum + s.w * (s.beta - betaFE) ** 2, 0);
    const k = studies.length;
    const df = k - 1;
    const I2 = Math.max(0, ((Q - df) / Q) * 100);

    let betaPool = betaFE, sePool = seFE, tauSq = 0;
    if (model === 'random') {
      tauSq = Math.max(0, (Q - df) / (W - studies.reduce((sum, s) => sum + s.w ** 2, 0) / W));
      const wRE = studies.map(s => 1 / (s.se ** 2 + tauSq));
      const Wre = wRE.reduce((a, b) => a + b, 0);
      betaPool = wRE.reduce((sum, w, i) => sum + w * studies[i].beta, 0) / Wre;
      sePool = Math.sqrt(1 / Wre);
      studies.forEach((s, i) => s.wRE = wRE[i]);
    }

    const zPool = betaPool / sePool;
    const pPool = 2 * (1 - _normCDF(Math.abs(zPool)));
    const ci95lo = betaPool - 1.96 * sePool;
    const ci95hi = betaPool + 1.96 * sePool;

    _renderForestPlot(studies, { betaPool, ci95lo, ci95hi, model, trait, Q, I2, df, k, tauSq, pPool });
    _renderSummaryStats({ betaPool, sePool, ci95lo, ci95hi, zPool, pPool, Q, I2, df, model, k });
  }

  function _normCDF(z) {
    const t = 1 / (1 + 0.2316419 * Math.abs(z));
    const poly = t * (0.319381530 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
    return z >= 0 ? 1 - 0.3989422804 * Math.exp(-0.5 * z * z) * poly : 0.3989422804 * Math.exp(-0.5 * z * z) * poly;
  }

  function _renderForestPlot(studies, pooled) {
    const W = 700, H = (studies.length + 3) * 30 + 80;
    const labelW = 180, margin = { t:30, b:50, r:80 };
    const plotW = W - labelW - margin.r;
    const allBetas = studies.flatMap(s => [s.ci95lo, s.ci95hi]);
    allBetas.push(pooled.ci95lo, pooled.ci95hi);
    let xmin = Math.min(...allBetas), xmax = Math.max(...allBetas);
    const pad = (xmax - xmin) * 0.15 || 0.5;
    xmin -= pad; xmax += pad;
    const xScale = v => labelW + ((v - xmin) / (xmax - xmin)) * plotW;
    const yRow = i => margin.t + i * 30 + 15;
    const zeroX = xScale(0);

    let svg = `<svg viewBox="0 0 ${W} ${H}" class="ma-forest-svg" style="width:100%;max-width:${W}px">`;
    /* Grid line at 0 */
    svg += `<line x1="${zeroX}" y1="${margin.t - 10}" x2="${zeroX}" y2="${H - margin.b + 10}" stroke="#243048" stroke-dasharray="4 3"/>`;
    /* X axis ticks */
    const ticks = 5;
    for (let i = 0; i <= ticks; i++) {
      const v = xmin + (xmax - xmin) * (i / ticks);
      const x = xScale(v);
      svg += `<line x1="${x}" y1="${H - margin.b}" x2="${x}" y2="${H - margin.b + 4}" stroke="#A8A098" stroke-width="1"/>`;
      svg += `<text x="${x}" y="${H - margin.b + 16}" text-anchor="middle" font-size="10" fill="#A8A098">${v.toFixed(2)}</text>`;
    }
    svg += `<text x="${W/2}" y="${H - 10}" text-anchor="middle" font-size="11" fill="#A8A098">Effect size (β)</text>`;
    /* Study rows */
    studies.forEach((s, i) => {
      const y = yRow(i);
      const x0 = xScale(s.ci95lo), x1 = xScale(s.ci95hi), xc = xScale(s.beta);
      const maxW = model === 'random' && s.wRE ? s.wRE : s.w;
      const sqSz = Math.min(10, Math.max(3, 3 + 7 * (maxW / studies.reduce((a, b) => a + b.w, 0) * studies.length)));
      svg += `<text x="${labelW - 8}" y="${y + 4}" text-anchor="end" font-size="11" fill="#A8A098">${s.name}</text>`;
      svg += `<line x1="${x0}" y1="${y}" x2="${x1}" y2="${y}" stroke="#58a6ff" stroke-width="1.5"/>`;
      svg += `<line x1="${x0}" y1="${y - 3}" x2="${x0}" y2="${y + 3}" stroke="#58a6ff"/>`;
      svg += `<line x1="${x1}" y1="${y - 3}" x2="${x1}" y2="${y + 3}" stroke="#58a6ff"/>`;
      svg += `<rect x="${xc - sqSz/2}" y="${y - sqSz/2}" width="${sqSz}" height="${sqSz}" fill="#58a6ff"/>`;
      svg += `<text x="${xScale(xmax) + 5}" y="${y + 4}" font-size="10" fill="#A8A098">${s.beta.toFixed(2)} [${s.ci95lo.toFixed(2)}, ${s.ci95hi.toFixed(2)}]</text>`;
    });
    /* Pooled diamond */
    const pi = studies.length + 1;
    const y = yRow(pi);
    const dx = xScale(pooled.betaPool), dl = xScale(pooled.ci95lo), dr = xScale(pooled.ci95hi);
    const sep = yRow(pi) - yRow(pi - 1);
    svg += `<line x1="${labelW}" y1="${y - sep / 2 + 5}" x2="${W - margin.r}" y2="${y - sep / 2 + 5}" stroke="#182236"/>`;
    svg += `<polygon points="${dl},${y} ${dx},${y - 10} ${dr},${y} ${dx},${y + 10}" fill="#00C4A0" opacity=".85"/>`;
    svg += `<text x="${labelW - 8}" y="${y + 4}" text-anchor="end" font-size="11" font-weight="bold" fill="#00C4A0">Pooled (${pooled.model})</text>`;
    svg += `<text x="${xScale(xmax) + 5}" y="${y + 4}" font-size="10" fill="#00C4A0">${pooled.betaPool.toFixed(2)} [${pooled.ci95lo.toFixed(2)}, ${pooled.ci95hi.toFixed(2)}]</text>`;
    svg += '</svg>';

    const wrap = document.getElementById('ma-result');
    if (wrap) { wrap.style.display = ''; wrap.querySelector('.ma-forest-wrap').innerHTML = svg; }
  }

  function _renderSummaryStats(s) {
    const el = document.getElementById('ma-stats');
    if (!el) return;
    const fmtP = p => p < 0.0001 ? '<0.0001' : p.toFixed(4);
    const hetColor = s.I2 > 75 ? '#ff6b6b' : s.I2 > 50 ? '#e3b341' : '#00C4A0';
    el.innerHTML = `
      <div class="ma-stat-row"><span class="ma-stat-label">Pooled β</span><span class="ma-stat-val">${s.betaPool.toFixed(4)}</span></div>
      <div class="ma-stat-row"><span class="ma-stat-label">SE</span><span class="ma-stat-val">${s.sePool.toFixed(4)}</span></div>
      <div class="ma-stat-row"><span class="ma-stat-label">95% CI</span><span class="ma-stat-val">[${s.ci95lo.toFixed(4)}, ${s.ci95hi.toFixed(4)}]</span></div>
      <div class="ma-stat-row"><span class="ma-stat-label">Z</span><span class="ma-stat-val">${s.zPool.toFixed(3)}</span></div>
      <div class="ma-stat-row"><span class="ma-stat-label">P-value</span><span class="ma-stat-val">${fmtP(s.pPool)}</span></div>
      <div class="ma-stat-row"><span class="ma-stat-label">Q statistic</span><span class="ma-stat-val">${s.Q.toFixed(2)} (df=${s.df})</span></div>
      <div class="ma-stat-row"><span class="ma-stat-label">I² (heterogeneity)</span><span class="ma-stat-val" style="color:${hetColor}">${s.I2.toFixed(1)}%</span></div>
      <div class="ma-stat-row"><span class="ma-stat-label">Model</span><span class="ma-stat-val">${s.model === 'fixed' ? 'Fixed-effects (Inverse Variance)' : 'Random-effects (DerSimonian-Laird)'}</span></div>
      <div class="ma-stat-row"><span class="ma-stat-label">k studies</span><span class="ma-stat-val">${s.k}</span></div>`;
  }

  function _showError(msg) {
    const el = document.getElementById('ma-result');
    if (el) { el.style.display = ''; el.querySelector('.ma-forest-wrap').innerHTML = `<div class="ma-error">${msg}</div>`; }
  }

  function init() {
    const section = document.getElementById('metaanalysis-section');
    if (!section || section.dataset.maReady) return;
    section.dataset.maReady = '1';
    section.innerHTML = `
      <div class="ma-wrap">
        <div class="ma-header">
          <div class="ma-header-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e3b341" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>
            Meta-analysis Tool
          </div>
          <div class="ma-header-sub">Fixed-effects and random-effects meta-analysis with forest plot · Designed for GWAS</div>
        </div>
        <div class="ma-layout">
          <div class="ma-input-panel">
            <div class="ma-subsection-label">Load example</div>
            <div class="ma-ex-row">
              ${Object.entries(EXAMPLES).map(([k, e]) => `<button class="ma-ex-btn" onclick="OmicsLab.MetaAnalysis._loadExample('${k}')">${e.label}</button>`).join('')}
            </div>
            <div class="ma-subsection-label">Trait / variant</div>
            <input class="ma-trait-inp" id="ma-trait" placeholder="e.g. T2D risk — rs7903146 (TCF7L2)">
            <div class="ma-subsection-label">Model</div>
            <div class="ma-model-row">
              <label><input type="radio" name="ma-model" value="fixed" checked> Fixed-effects (IV)</label>
              <label><input type="radio" name="ma-model" value="random"> Random-effects (DL)</label>
            </div>
            <div class="ma-subsection-label">Studies</div>
            <table class="ma-table">
              <thead><tr><th>Study</th><th>β</th><th>SE</th><th>N</th><th></th></tr></thead>
              <tbody id="ma-study-tbody"></tbody>
            </table>
            <button class="ma-add-row-btn" onclick="OmicsLab.MetaAnalysis._addRow()">+ Add study</button>
            <button class="ma-run-btn" onclick="OmicsLab.MetaAnalysis._run()">Run Meta-analysis</button>
          </div>
          <div class="ma-result-panel">
            <div id="ma-result" style="display:none">
              <div class="ma-forest-wrap"></div>
              <div class="ma-stats-panel">
                <div class="ma-stats-title">Summary statistics</div>
                <div id="ma-stats"></div>
              </div>
            </div>
            <div id="ma-placeholder" class="ma-placeholder">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#243048" stroke-width="1.5"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>
              <div>Load an example or add studies,<br>then click Run.</div>
            </div>
          </div>
        </div>
      </div>`;
    _loadExample('t2d');
  }

  return { init, _run, _loadExample, _addRow };
})();
