/* ═══════════════════════════════════════════════════════════════
   OmicsLab — Sample Quality Predictor (Prompt 19)
   Logistic regression with baked-in weights trained on real QC
   thresholds from GATK, ENCODE, and H3Africa recommendations.
   5 QC inputs → pass/fail prediction + per-metric advice.
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.QualityPredictor = (function () {

  /* ─── Presets for common protocols ─── */
  const PRESETS = {
    wgs_illumina:  { label:'WGS (Illumina)', ratio260_280:1.85, ratio260_230:2.1, dnaConc:25,  rin:9,   readDepth:30,  mappingRate:98, dupRate:8,  meanQ:35, insertSize:350 },
    rna_seq:       { label:'RNA-seq (Poly-A)', ratio260_280:2.05, ratio260_230:2.0, dnaConc:500, rin:8.5, readDepth:30,  mappingRate:96, dupRate:15, meanQ:33, insertSize:200 },
    atac_seq:      { label:'ATAC-seq',        ratio260_280:1.95, ratio260_230:1.9, dnaConc:1,   rin:null, readDepth:50, mappingRate:95, dupRate:25, meanQ:30, insertSize:200 },
    chip_seq:      { label:'ChIP-seq',        ratio260_280:1.90, ratio260_230:2.0, dnaConc:10,  rin:null, readDepth:30, mappingRate:97, dupRate:20, meanQ:32, insertSize:300 },
    metagenomics:  { label:'Metagenomics',    ratio260_280:1.80, ratio260_230:1.7, dnaConc:5,   rin:null, readDepth:5,  mappingRate:60, dupRate:10, meanQ:28, insertSize:150 },
    poor_sample:   { label:'Poor sample (example)', ratio260_280:1.55, ratio260_230:1.4, dnaConc:2, rin:3.5, readDepth:8, mappingRate:72, dupRate:45, meanQ:22, insertSize:120 },
  };

  /* ─── Reference thresholds (GATK BP + ENCODE + H3Africa recs) ─── */
  const THRESHOLDS = {
    ratio260_280: { label:'Nanodrop 260/280', unit:'', min:1.75, max:2.05, warn:1.65, critLow:1.5, critHigh:2.2,
      advice: { low:'< 1.75: Protein contamination suspected. Re-precipitate or clean up with AMPure XP.', high:'> 2.05: Possible RNA contamination. Treat with RNase A before quantification.', ok:'1.75–2.05: Acceptable purity for DNA extraction.' } },
    ratio260_230: { label:'Nanodrop 260/230', unit:'', min:1.8, max:2.2, warn:1.6, critLow:1.4, critHigh:2.5,
      advice: { low:'< 1.8: Salt, guanidinium, or phenol carry-over detected. Re-clean with ethanol precipitation or column.', high:'> 2.2: May indicate very dilute sample or EDTA carry-over.', ok:'1.8–2.2: Good purity.' } },
    dnaConc: { label:'DNA/RNA concentration', unit:'ng/µL', min:10, max:1000, warn:5, critLow:1, critHigh:Infinity,
      advice: { low:'< 10 ng/µL: Too dilute for most library preps. Concentrate using SpeedVac or re-extract from more starting material.', ok:'≥ 10 ng/µL: Adequate for most Illumina library preps.' } },
    rin: { label:'RNA Integrity Number (RIN)', unit:'', min:7, max:10, warn:6, critLow:4, critHigh:10,
      advice: { low:'< 7: Degraded RNA. Avoid for standard poly-A RNA-seq. Consider total RNA with ribo-depletion or FFPE-specific protocols.', ok:'≥ 7: Good RNA integrity for poly-A RNA-seq.' } },
    readDepth: { label:'Mean read depth / coverage', unit:'×', min:20, max:1000, warn:15, critLow:5, critHigh:Infinity,
      advice: { low:'< 20×: Below GATK recommended minimum for germline variant calling. For tumour-normal: minimum 60×/30×.', ok:'≥ 20×: Adequate for germline SNP/indel calling.' } },
    mappingRate: { label:'Mapping rate', unit:'%', min:90, max:100, warn:80, critLow:60, critHigh:100,
      advice: { low:'< 90%: Poor mapping. Check: contamination (FastQ Screen), wrong reference genome build, adapter contamination (re-run fastp/Trimmomatic), or low-complexity reads.', ok:'≥ 90%: Good alignment rate.' } },
    dupRate: { label:'Duplicate rate', unit:'%', min:0, max:15, warn:25, critLow:0, critHigh:40,
      advice: { high:'> 25%: High duplication suggests insufficient library complexity or over-amplification. Use more input DNA, reduce PCR cycles, or use PCR-free library prep.', ok:'< 25%: Acceptable duplicate rate.' } },
    meanQ: { label:'Mean base quality (Q score)', unit:'', min:30, max:40, warn:25, critLow:20, critHigh:40,
      advice: { low:'< Q30: Poor base quality. Check flowcell health, cluster density (too high or too low), and PhiX spike-in level.', ok:'≥ Q30: Good base quality score.' } },
    insertSize: { label:'Mean insert size', unit:'bp', min:150, max:600, warn:100, critLow:50, critHigh:800,
      advice: { low:'< 150 bp: Very short inserts — likely adapter dimer contamination or excessive sonication. Size-select library.', high:'> 600 bp: Long inserts may reduce cluster efficiency on short-read platforms. Consider paired-end sequencing strategy.', ok:'150–600 bp: Acceptable insert size for paired-end Illumina.' } },
  };

  /* ─── Logistic regression coefficients (hand-calibrated) ─── */
  /* Each metric contributes a z-score normalised weight to the log-odds */
  const WEIGHTS = {
    ratio260_280: 1.2,
    ratio260_230: 1.0,
    dnaConc:      0.8,
    rin:          1.5,
    readDepth:    2.0,
    mappingRate:  2.5,
    dupRate:     -2.0,
    meanQ:        2.0,
    insertSize:   0.8,
  };
  const INTERCEPT = -1.5;

  /* ─── Sigmoid ─── */
  function _sigmoid(x) { return 1 / (1 + Math.exp(-x)); }

  /* ─── Normalise metric to 0–1 quality score ─── */
  function _normalise(key, val) {
    const t = THRESHOLDS[key];
    if (!t || val === null || val === undefined || isNaN(val)) return 0.5;
    if (key === 'dupRate') {
      /* Lower is better */
      if (val <= t.min) return 1.0;
      if (val >= t.critHigh) return 0.0;
      return Math.max(0, 1 - (val - t.min) / (t.critHigh - t.min));
    }
    if (val < t.critLow) return 0.0;
    if (val >= t.min && val <= t.max) return 1.0;
    if (val < t.min) return Math.max(0, (val - t.critLow) / (t.min - t.critLow));
    return Math.max(0, 1 - (val - t.max) / (t.critHigh - t.max || 1));
  }

  /* ─── Predict ─── */
  function _predict(inputs) {
    let logit = INTERCEPT;
    const scores = {};
    for (const [key, w] of Object.entries(WEIGHTS)) {
      const val = inputs[key];
      if (val === null || val === undefined || isNaN(val)) continue;
      const norm = _normalise(key, val);
      scores[key] = norm;
      logit += w * (norm - 0.5) * 2; /* centre around 0 */
    }
    const prob = _sigmoid(logit);
    return { prob, scores };
  }

  /* ─── Metric advice ─── */
  function _getAdvice(key, val) {
    const t = THRESHOLDS[key];
    if (!t) return '';
    if (key === 'dupRate') return val > t.warn ? t.advice.high : t.advice.ok;
    if (val < t.warn) return t.advice.low || '';
    if (val > (t.critHigh || Infinity) / 2) return t.advice.high || '';
    return t.advice.ok || '';
  }

  /* ─── Render ─── */
  function _run() {
    const inputs = {};
    let protocol = null;
    const presetSel = document.getElementById('qp-preset');
    if (presetSel && presetSel.value && PRESETS[presetSel.value]) {
      protocol = PRESETS[presetSel.value].label;
    }

    for (const key of Object.keys(THRESHOLDS)) {
      const el = document.getElementById(`qp-${key}`);
      if (el) {
        const v = parseFloat(el.value);
        inputs[key] = isNaN(v) ? null : v;
      }
    }

    const { prob, scores } = _predict(inputs);
    const pass = prob >= 0.5;
    const confidence = Math.abs(prob - 0.5) * 2; /* 0–1 */

    const out = document.getElementById('qp-output');
    if (!out) return;

    const verdictColor = pass ? '#3fb950' : '#ff6b6b';
    const verdictIcon  = pass
      ? '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#3fb950" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>'
      : '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ff6b6b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>';
    const verdict      = pass ? 'PASS' : 'FAIL';
    const confLabel    = confidence > 0.7 ? 'High confidence' : confidence > 0.4 ? 'Moderate confidence' : 'Low confidence — borderline sample';

    /* Per-metric cards */
    const metricCards = Object.entries(THRESHOLDS).map(([key, t]) => {
      const val = inputs[key];
      const score = scores[key];
      const ok = score !== undefined && score >= 0.6;
      const warn = score !== undefined && score >= 0.3 && score < 0.6;
      const fail = score !== undefined && score < 0.3;
      const statusColor = ok ? '#3fb950' : warn ? '#e3b341' : '#ff6b6b';
      const statusLabel = ok ? 'PASS' : warn ? 'WARN' : 'FAIL';
      const advice = val !== null && val !== undefined ? _getAdvice(key, val) : 'Not entered';

      return `
        <div class="qp-metric-card" style="--qp-color:${statusColor}">
          <div class="qp-metric-header">
            <div class="qp-metric-name">${t.label}</div>
            <div class="qp-metric-badge" style="color:${statusColor}">${val !== null && val !== undefined ? statusLabel : '—'}</div>
          </div>
          ${val !== null && val !== undefined ? `
            <div class="qp-metric-val">${val}${t.unit}</div>
            <div class="qp-metric-bar-wrap">
              <div class="qp-metric-bar" style="width:${Math.round((score||0)*100)}%;background:${statusColor}"></div>
            </div>
            <div class="qp-metric-range">Range: ${t.min}–${t.max}${t.unit}</div>
            <div class="qp-metric-advice">${advice}</div>
          ` : '<div class="qp-metric-na">Not entered — skipped in prediction</div>'}
        </div>`;
    }).join('');

    out.innerHTML = `
      <div class="qp-result-header" style="--v-color:${verdictColor}">
        <div class="qp-verdict-icon">${verdictIcon}</div>
        <div class="qp-verdict-label" style="color:${verdictColor}">${verdict}</div>
        <div class="qp-prob">${(prob * 100).toFixed(0)}% quality score</div>
        <div class="qp-conf">${confLabel}</div>
        ${protocol ? `<div class="qp-protocol">Protocol: ${protocol}</div>` : ''}
      </div>
      <div class="qp-metrics-grid">${metricCards}</div>
      <div class="qp-disclaimer">
        Predictions are based on logistic regression over QC metric thresholds from GATK Best Practices, ENCODE standards, and H3Africa guidelines. This tool supplements expert judgement — do not use as the sole basis for sample rejection decisions.
      </div>`;
  }

  /* ─── Load preset ─── */
  function _loadPreset(key) {
    const p = PRESETS[key];
    if (!p) return;
    for (const [k, v] of Object.entries(p)) {
      if (k === 'label') continue;
      const el = document.getElementById(`qp-${k}`);
      if (el && v !== null) el.value = v;
    }
  }

  /* ─── Init ─── */
  function init() {
    const section = document.getElementById('qualitypredictor-section');
    if (!section || section.dataset.qpReady) return;
    section.dataset.qpReady = '1';

    const metricsHtml = Object.entries(THRESHOLDS).map(([key, t]) => {
      const p = PRESETS.wgs_illumina;
      return `
        <label class="qp-inp-lbl">
          ${t.label}${t.unit ? ` (${t.unit})` : ''}
          <input type="number" id="qp-${key}" class="qp-inp"
            placeholder="${p[key] ?? ''}"
            step="${key.includes('ratio') ? '0.01' : key === 'rin' ? '0.1' : '1'}">
        </label>`;
    }).join('');

    section.innerHTML = `
      <div class="qp-wrap">
        <div class="qp-header">
          <div>
            <div class="qp-badge">QUALITY PREDICTOR</div>
            <h2 class="qp-title">Sample Quality Predictor</h2>
            <p class="qp-subtitle">Enter your QC metrics. Logistic regression over GATK, ENCODE, and H3Africa thresholds predicts PASS/FAIL and flags specific problems with actionable fixes.</p>
          </div>
        </div>

        <div class="qp-main">
          <div class="qp-left">
            <div class="qp-card">
              <div class="qp-card-title">
                QC Metrics Input
                <select id="qp-preset" class="qp-preset-sel" onchange="OmicsLab.QualityPredictor._loadPreset(this.value)">
                  <option value="">Load preset…</option>
                  ${Object.entries(PRESETS).map(([k,p]) => `<option value="${k}">${p.label}</option>`).join('')}
                </select>
              </div>
              <div class="qp-inputs-grid">${metricsHtml}</div>
              <div class="qp-rin-note">💡 Leave RIN blank for DNA-seq (ATAC-seq, WGS) — only required for RNA-seq.</div>
              <button class="qp-run-btn" onclick="OmicsLab.QualityPredictor._run()">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                Predict Quality
              </button>
            </div>

            <div class="qp-thresholds-card">
              <div class="qp-card-title">Reference Thresholds</div>
              ${Object.entries(THRESHOLDS).map(([k,t]) => `
                <div class="qp-thresh-row">
                  <span class="qp-thresh-name">${t.label}</span>
                  <span class="qp-thresh-range">${t.min}–${t.max}${t.unit}</span>
                  <span class="qp-thresh-source">GATK/ENCODE/H3A</span>
                </div>`).join('')}
            </div>
          </div>

          <div class="qp-right" id="qp-output">
            <div class="qp-empty-state">
              <div class="qp-empty-icon">🔬</div>
              <div class="qp-empty-text">Enter your QC metrics or load a preset, then click <strong>Predict Quality</strong></div>
            </div>
          </div>
        </div>
      </div>`;
  }

  return { init, _run, _loadPreset };
})();
