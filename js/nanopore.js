/* ═══════════════════════════════════════════════════════
   OmicsLab — Oxford Nanopore QC Analyser (Part 3)
   Paste NanoStat/NanoPlot output or enter metrics manually.
   Evaluates read quality against MinION/GridION field thresholds
   with Africa-specific guidance for resource-limited settings.
   ═══════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.NanoporeQC = (function () {

  /* QC thresholds — PASS / WARN / FAIL per metric */
  /* Based on ONT recommended thresholds + H3Africa/African field sequencing practice */
  const THRESHOLDS = {
    mean_quality:     { label:'Mean read quality (Q)',  unit:'',     pass:8, warn:7,  failDir:'lt', tip:'Q≥10 ideal for assembly; Q≥7 acceptable for variant calling. Field MinION runs in Africa often achieve Q8–9.' },
    n50:              { label:'Read N50 (bp)',           unit:' bp',  pass:10000, warn:5000, failDir:'lt', tip:'N50 > 10 kb preferred for assembly. Short N50 may indicate degraded DNA — common with heat-stressed field samples.' },
    total_bases:      { label:'Total bases (Gb)',        unit:' Gb',  pass:5, warn:2, failDir:'lt', tip:'≥5 Gb for 30× WGS (5 Mb pathogen). Field runs ≥2 Gb often sufficient for outbreak surveillance.' },
    pct_q10:          { label:'Reads ≥Q10 (%)',         unit:'%',    pass:70, warn:50, failDir:'lt', tip:'Target ≥70% reads at Q10. Lower pct may indicate flow cell degradation or DNA damage.' },
    pct_q15:          { label:'Reads ≥Q15 (%)',         unit:'%',    pass:40, warn:20, failDir:'lt', tip:'≥40% Q15 indicates high-accuracy duplex reads or R10 chemistry. Important for SNP calling.' },
    mean_length:      { label:'Mean read length (bp)',   unit:' bp',  pass:5000, warn:2000, failDir:'lt', tip:'Mean length < 2kb suggests DNA shearing. Check extraction protocol and avoid freeze-thaw cycles.' },
    active_channels:  { label:'Active channels',        unit:'',     pass:800, warn:400, failDir:'lt', tip:'R9.4.1 has 2,048 channels; R10 has 3,000+. <400 active may indicate clogged pores — apply wash kit.' },
    pct_active:       { label:'Channel activity (%)',   unit:'%',    pass:60, warn:30, failDir:'lt', tip:'<30% active channels significantly reduces throughput. Reload the flow cell or apply pore clearing protocol.' },
    median_quality:   { label:'Median read quality (Q)', unit:'',    pass:9, warn:7, failDir:'lt', tip:'Median Q is more robust than mean for skewed distributions. Target ≥Q9 for clinical WGS.' },
  };

  const EXAMPLE_NANOSTAT = `General summary:
Mean read length:                 8,123.5
Mean read quality:                 9.4
Median read length:               6,832.0
Median read quality:               9.8
Number of reads:                 85,432
Read length N50:                 14,200
STDEV read length:               5,432.8
Total bases:                     693,987,456
Number, percentage and megabases of reads above quality cutoffs:
>Q5:  85,432 (100.0%)  694 Mb
>Q10: 66,236 (77.5%)   541 Mb
>Q15: 38,724 (45.3%)   316 Mb`;

  function _parseNanoStat(text) {
    const r = {};
    const extract = (pat, key) => {
      const m = text.match(pat);
      if (m) r[key] = parseFloat(m[1].replace(/,/g,''));
    };
    extract(/Mean read length:\s+([\d,]+\.?\d*)/i, 'mean_length');
    extract(/Mean read quality:\s+([\d.]+)/i, 'mean_quality');
    extract(/Median read quality:\s+([\d.]+)/i, 'median_quality');
    extract(/Read length N50:\s+([\d,]+)/i, 'n50');
    extract(/Total bases:\s+([\d,]+)/i, 'total_bases_raw');
    if (r.total_bases_raw) r.total_bases = r.total_bases_raw / 1e9;
    const q10m = text.match(/>Q10[:\s]+[\d,]+\s+\(([\d.]+)%\)/i);
    if (q10m) r.pct_q10 = parseFloat(q10m[1]);
    const q15m = text.match(/>Q15[:\s]+[\d,]+\s+\(([\d.]+)%\)/i);
    if (q15m) r.pct_q15 = parseFloat(q15m[1]);
    return r;
  }

  function _grade(val, thresh) {
    if (val === undefined || val === null || val === '') return 'missing';
    const v = parseFloat(val);
    if (isNaN(v)) return 'missing';
    if (thresh.failDir === 'lt') {
      if (v >= thresh.pass) return 'pass';
      if (v >= thresh.warn) return 'warn';
      return 'fail';
    }
    if (v <= thresh.pass) return 'pass';
    if (v <= thresh.warn) return 'warn';
    return 'fail';
  }

  function _run() {
    const mode = document.querySelector('input[name="np-mode"]:checked')?.value || 'paste';
    let metrics = {};
    if (mode === 'paste') {
      const txt = document.getElementById('np-paste')?.value || '';
      metrics = _parseNanoStat(txt);
      if (!Object.keys(metrics).length) { _showMsg('Could not parse NanoStat output. Try manual entry mode.', true); return; }
    } else {
      const fields = ['mean_quality','n50_raw','total_bases','pct_q10','pct_q15','mean_length','active_channels'];
      for (const f of fields) {
        const v = document.getElementById('np-' + f)?.value;
        if (v !== '' && v !== undefined) metrics[f.replace('n50_raw','n50')] = parseFloat(v.replace(/,/g,''));
        if (f === 'n50_raw' && v) metrics.n50 = parseFloat(v.replace(/,/g,'')) * 1000;
        if (f === 'total_bases' && v) metrics.total_bases = parseFloat(v.replace(/,/g,''));
      }
    }
    _renderResult(metrics);
  }

  function _showMsg(msg, isErr) {
    const el = document.getElementById('np-output');
    if (el) el.innerHTML = `<div class="np-${isErr?'error':'info'}">${msg}</div>`;
  }

  function _renderResult(m) {
    const out = document.getElementById('np-output');
    if (!out) return;
    let passCount = 0, warnCount = 0, failCount = 0;
    const rows = Object.entries(THRESHOLDS).map(([key, th]) => {
      const val = m[key];
      const g = _grade(val, th);
      if (g === 'pass') passCount++;
      else if (g === 'warn') warnCount++;
      else if (g === 'fail') failCount++;
      const displayVal = val !== undefined ? (key === 'total_bases' ? val.toFixed(2) + ' Gb' : key === 'n50' || key === 'mean_length' ? Math.round(val).toLocaleString() + ' bp' : key.startsWith('pct') ? val.toFixed(1) + '%' : val.toFixed(1)) : '—';
      const colors = { pass:'#3fb950', warn:'#e3b341', fail:'#ff6b6b', missing:'#484f58' };
      const icons = { pass:'✓', warn:'!', fail:'✗', missing:'?' };
      return `<div class="np-metric-row">
        <span class="np-status-dot" style="background:${colors[g]}">${icons[g]}</span>
        <div class="np-metric-body">
          <div class="np-metric-name">${th.label}</div>
          <div class="np-metric-tip">${th.tip}</div>
        </div>
        <div class="np-metric-right">
          <div class="np-metric-val" style="color:${colors[g]}">${displayVal}</div>
          <div class="np-metric-thresh">Pass: ≥${th.pass}${th.unit}</div>
        </div>
      </div>`;
    }).join('');

    const overallGrade = failCount > 0 ? 'FAIL' : warnCount > 2 ? 'WARN' : 'PASS';
    const overallColor = { PASS:'#3fb950', WARN:'#e3b341', FAIL:'#ff6b6b' }[overallGrade];

    out.innerHTML = `
      <div class="np-overall" style="border-color:${overallColor}">
        <div class="np-overall-left">
          <div class="np-overall-grade" style="color:${overallColor}">${overallGrade}</div>
          <div class="np-overall-sub">Overall run quality</div>
        </div>
        <div class="np-overall-stats">
          <span style="color:#3fb950">${passCount} pass</span>
          <span style="color:#e3b341">${warnCount} warn</span>
          <span style="color:#ff6b6b">${failCount} fail</span>
        </div>
      </div>
      <div class="np-metrics-list">${rows}</div>`;
  }

  function _loadExample() {
    const el = document.getElementById('np-paste');
    if (el) { el.value = EXAMPLE_NANOSTAT; }
    const radios = document.querySelectorAll('input[name="np-mode"]');
    radios.forEach(r => { r.checked = r.value === 'paste'; });
    _toggleMode('paste');
    _run();
  }

  function _toggleMode(mode) {
    const pastePanel = document.getElementById('np-paste-panel');
    const manualPanel = document.getElementById('np-manual-panel');
    if (pastePanel) pastePanel.style.display = mode === 'paste' ? '' : 'none';
    if (manualPanel) manualPanel.style.display = mode === 'manual' ? '' : 'none';
  }

  function init() {
    const section = document.getElementById('nanopore-section');
    if (!section || section.dataset.npReady) return;
    section.dataset.npReady = '1';
    section.innerHTML = `
      <div class="np-wrap">
        <div class="np-header">
          <div class="np-header-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e3b341" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>
            Oxford Nanopore QC Analyser
          </div>
          <div class="np-header-sub">Evaluate MinION/GridION run quality against H3Africa and field sequencing thresholds</div>
        </div>
        <div class="np-layout">
          <div class="np-left">
            <div class="np-mode-row">
              <label class="np-mode-opt"><input type="radio" name="np-mode" value="paste" checked onchange="OmicsLab.NanoporeQC._toggleMode('paste')"> Paste NanoStat output</label>
              <label class="np-mode-opt"><input type="radio" name="np-mode" value="manual" onchange="OmicsLab.NanoporeQC._toggleMode('manual')"> Enter metrics manually</label>
            </div>
            <div id="np-paste-panel">
              <textarea id="np-paste" class="np-textarea" rows="12" placeholder="Paste NanoStat or NanoPlot summary output here..."></textarea>
            </div>
            <div id="np-manual-panel" style="display:none">
              ${[
                ['Mean quality (Q)', 'np-mean_quality', '9.4'],
                ['N50 read length (kb)', 'np-n50_raw', '14.2'],
                ['Total yield (Gb)', 'np-total_bases', '5.2'],
                ['Reads ≥Q10 (%)', 'np-pct_q10', '77.5'],
                ['Reads ≥Q15 (%)', 'np-pct_q15', '45.3'],
                ['Mean read length (bp)', 'np-mean_length', '8123'],
                ['Active channels', 'np-active_channels', '1200'],
              ].map(([lbl, id, ph]) => `
                <div class="np-field">
                  <label class="np-label">${lbl}</label>
                  <input class="np-input" id="${id}" type="number" step="any" placeholder="${ph}">
                </div>`).join('')}
            </div>
            <div class="np-actions">
              <button class="np-run-btn" onclick="OmicsLab.NanoporeQC._run()">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                Analyse Run
              </button>
              <button class="np-ex-btn" onclick="OmicsLab.NanoporeQC._loadExample()">Load example</button>
            </div>
          </div>
          <div class="np-right" id="np-output">
            <div class="np-empty">Paste NanoStat output or enter metrics to evaluate run quality</div>
          </div>
        </div>
      </div>`;
  }

  return { init, _run, _loadExample, _toggleMode };
})();
