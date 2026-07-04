/* ═══════════════════════════════════════════════════════════════
   OmicsLab — Data Import (Prompt 37)
   ─ Drag-drop zone for FASTQ / VCF / expression matrix files
   ─ Web Worker parsing (non-blocking) with progress bar
   ─ Results panel: QC summary cards + per-metric pass/fail
   ─ Accessible: aria-live result announcements
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.DataImport = (function () {

  const WORKER_PATH = 'js/parsers/worker.js';
  let _worker   = null;
  let _jobId    = 0;
  let _pending  = {};   /* id → { resolve, reject } */
  let _inited   = false;

  const MAX_BYTES = 100 * 1024 * 1024; /* 100 MB hard limit */
  const WARN_BYTES = 50 * 1024 * 1024; /* 50 MB warn */

  /* ─── Web Worker lifecycle ─── */
  function _getWorker() {
    if (_worker) return _worker;
    if (typeof Worker === 'undefined') return null;
    try {
      _worker = new Worker(WORKER_PATH);
      _worker.onmessage = e => {
        const { id, ok, result, error } = e.data;
        const job = _pending[id];
        if (!job) return;
        delete _pending[id];
        if (ok) job.resolve(result);
        else    job.reject(new Error(error || 'Parse error'));
      };
      _worker.onerror = err => {
        Object.values(_pending).forEach(j => j.reject(new Error(err.message || 'Worker error')));
        _pending = {};
        _worker = null;
      };
      return _worker;
    } catch { return null; }
  }

  function _parse(type, text) {
    return new Promise((resolve, reject) => {
      const w = _getWorker();
      if (!w) {
        /* Fallback: synchronous parse on main thread */
        try {
          let r;
          if (type === 'fastq' && OmicsLab.Parsers?.fastq)   r = OmicsLab.Parsers.fastq(text);
          else if (type === 'vcf' && OmicsLab.Parsers?.vcf)  r = OmicsLab.Parsers.vcf(text);
          else if (type === 'matrix' && OmicsLab.Parsers?.matrix) r = OmicsLab.Parsers.matrix(text);
          else { reject(new Error('Parser not available')); return; }
          resolve(r);
        } catch (e) { reject(e); }
        return;
      }
      const id = ++_jobId;
      _pending[id] = { resolve, reject };
      w.postMessage({ id, type, text });
    });
  }

  /* ─── Detect file type from extension + sniff first bytes ─── */
  function _detectType(file, text) {
    const name = file.name.toLowerCase();
    if (name.endsWith('.fastq') || name.endsWith('.fq') ||
        name.endsWith('.fastq.gz') || name.endsWith('.fq.gz') ||
        text.trimStart().startsWith('@')) return 'fastq';
    if (name.endsWith('.vcf') || name.endsWith('.vcf.gz') ||
        text.includes('##fileformat=VCF') || text.startsWith('##')) return 'vcf';
    if (name.endsWith('.csv') || name.endsWith('.tsv') || name.endsWith('.txt'))
      return 'matrix';
    return null;
  }

  /* ─── Format file size ─── */
  function _fmt(n) {
    if (n < 1024) return n + ' B';
    if (n < 1048576) return (n / 1024).toFixed(1) + ' KB';
    return (n / 1048576).toFixed(1) + ' MB';
  }

  /* ─── Handle a dropped / selected file ─── */
  async function _handleFile(file, zone) {
    if (file.size > MAX_BYTES) {
      OmicsLab.Notify?.error(`File too large (${_fmt(file.size)}). Maximum is 100 MB.`);
      return;
    }
    if (file.size > WARN_BYTES) {
      OmicsLab.Notify?.warning(`Large file (${_fmt(file.size)}) — parsing may take a moment`);
    }

    _setProgress(zone, 10, 'Reading file…');

    let text;
    try {
      text = await file.text();
    } catch (e) {
      _setProgress(zone, 0, '');
      OmicsLab.Notify?.error('Could not read file: ' + e.message);
      return;
    }

    const type = _detectType(file, text);
    if (!type) {
      _setProgress(zone, 0, '');
      OmicsLab.Notify?.error('Unrecognised file type. Supported: .fastq, .vcf, .csv, .tsv');
      return;
    }

    _setProgress(zone, 40, `Parsing ${type.toUpperCase()}…`);
    let result;
    try {
      result = await _parse(type, text);
    } catch (e) {
      _setProgress(zone, 0, '');
      OmicsLab.Notify?.error('Parse error: ' + e.message);
      return;
    }

    _setProgress(zone, 100, 'Done');
    setTimeout(() => _setProgress(zone, 0, ''), 600);

    if (result.error) {
      OmicsLab.Notify?.error(result.error);
      _renderResult(zone, type, null, file.name, file.size);
    } else {
      _renderResult(zone, type, result, file.name, file.size);
      OmicsLab.A11y?.announce(`${type.toUpperCase()} parsed: ${file.name}. ${_summarySentence(type, result)}`);
    }
  }

  function _summarySentence(type, r) {
    if (type === 'fastq') return `${r.readCount.toLocaleString()} reads, mean Q${r.meanQuality}, ${r.q30Pct}% ≥Q30.`;
    if (type === 'vcf')   return `${r.variantCount.toLocaleString()} variants, ${r.passRate}% PASS.`;
    if (type === 'matrix') return `${r.geneCount.toLocaleString()} genes × ${r.sampleCount} samples.`;
    return '';
  }

  /* ─── Simulated progress bar ─── */
  function _setProgress(zone, pct, label) {
    const bar = zone.querySelector('.di-progress-bar-fill');
    const lbl = zone.querySelector('.di-progress-label');
    const wrap = zone.querySelector('.di-progress-wrap');
    if (bar)  bar.style.width = pct + '%';
    if (lbl)  lbl.textContent  = label;
    if (wrap) wrap.style.display = pct > 0 ? '' : 'none';
  }

  /* ─── Render result cards ─── */
  function _renderResult(zone, type, r, filename, size) {
    const out = zone.querySelector('.di-result-area');
    if (!out) return;
    let html = `<div class="di-result-header">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
      <span class="di-result-filename">${filename}</span>
      <span class="di-result-size">${_fmt(size)}</span>
    </div>`;

    if (!r) { html += `<div class="di-error-card">Could not parse file — see error message above.</div>`; out.innerHTML = html; return; }

    if (type === 'fastq') html += _fastqCards(r);
    else if (type === 'vcf') html += _vcfCards(r);
    else if (type === 'matrix') html += _matrixCards(r);

    out.innerHTML = html;
    out.style.display = '';
  }

  /* ─── FASTQ result cards ─── */
  function _fastqCards(r) {
    const passColor = r.pass ? '#00C4A0' : '#f97316';
    const passLabel = r.pass ? 'PASS' : 'REVIEW';

    const metrics = [
      { label: 'Total reads',       value: r.readCount.toLocaleString(),      ok: true },
      { label: 'Total bases',       value: _fmtBases(r.totalBases),            ok: true },
      { label: 'Mean quality',      value: `Q${r.meanQuality}`,                ok: r.meanQuality >= 28 },
      { label: '≥Q30 bases',       value: `${r.q30Pct}%`,                      ok: r.q30Pct >= 75 },
      { label: '≥Q20 bases',       value: `${r.q20Pct}%`,                      ok: r.q20Pct >= 90 },
      { label: 'GC content',        value: `${r.gcPct}%`,                       ok: r.gcPct >= 35 && r.gcPct <= 70 },
      { label: 'N bases',           value: `${r.nPct}%`,                        ok: r.nPct < 5 },
      { label: 'Median read length', value: `${r.medianReadLength} bp`,          ok: r.medianReadLength >= 50 },
    ];

    const metricHtml = metrics.map(m => `
      <div class="di-metric">
        <div class="di-metric-label">${m.label}</div>
        <div class="di-metric-value" style="color:${m.ok ? '#00C4A0' : '#f97316'}">${m.value}</div>
        <div class="di-metric-dot" style="background:${m.ok ? '#00C4A0' : '#f97316'}"></div>
      </div>`).join('');

    /* Per-base quality miniature bar chart */
    const chartHtml = r.perBaseQ.length ? `
      <div class="di-chart-title">Per-base quality score</div>
      <div class="di-bar-chart" aria-label="Per-base quality score bar chart">
        ${r.perBaseQ.map((q, i) => {
          const h = Math.round(q / 40 * 40);
          const c = q >= 30 ? '#00C4A0' : q >= 20 ? '#e3b341' : '#ff6b6b';
          return `<div class="di-bar" style="height:${h}px;background:${c}" title="Pos ${i+1}: Q${q}"></div>`;
        }).join('')}
      </div>
      <div class="di-chart-axis"><span>Position 1</span><span>Position ${r.perBaseQ.length}</span></div>` : '';

    const issuesHtml = r.issues.length ? `
      <div class="di-issues-list">
        ${r.issues.map(issue => `
          <div class="di-issue">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f97316" stroke-width="2.5" aria-hidden="true"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            ${issue}
          </div>`).join('')}
      </div>` : '';

    return `
      <div class="di-status-badge" style="background:rgba(${r.pass?'63,185,80':'249,115,22'},.1);color:${passColor};border:1px solid ${passColor}40">
        ${r.pass ? '[OK]' : '!'} ${passLabel}
      </div>
      <div class="di-metrics-grid">${metricHtml}</div>
      ${chartHtml}
      ${issuesHtml}`;
  }

  /* ─── VCF result cards ─── */
  function _vcfCards(r) {
    const metrics = [
      { label: 'Total variants',   value: r.variantCount.toLocaleString(), ok: true },
      { label: 'PASS rate',        value: `${r.passRate}%`,                ok: r.passRate >= 90 },
      { label: 'SNPs',             value: `${r.snpCount.toLocaleString()} (${r.snpRate}%)`, ok: true },
      { label: 'Indels',           value: r.indelCount.toLocaleString(),   ok: true },
      { label: 'Mean QUAL',        value: r.meanQual ? `${r.meanQual}` : 'N/A', ok: (r.meanQual || 0) >= 30 },
      { label: 'Ti/Tv ratio',      value: r.tiTvRatio ? `${r.tiTvRatio}` : 'N/A', ok: !r.tiTvRatio || (r.tiTvRatio >= 1.8 && r.tiTvRatio <= 3.0) },
      { label: 'Samples',          value: String(r.sampleCount || 0),      ok: true },
      { label: 'File format',      value: r.fileFormat,                    ok: true },
    ];

    const metricHtml = metrics.map(m => `
      <div class="di-metric">
        <div class="di-metric-label">${m.label}</div>
        <div class="di-metric-value" style="color:${m.ok ? '#00C4A0' : '#f97316'}">${m.value}</div>
        <div class="di-metric-dot" style="background:${m.ok ? '#00C4A0' : '#f97316'}"></div>
      </div>`).join('');

    /* Chrom distribution bar chart */
    const maxCount = Math.max(...r.chromDistribution.map(c => c.count), 1);
    const chromHtml = r.chromDistribution.length ? `
      <div class="di-chart-title">Variant count per chromosome</div>
      <div class="di-chrom-chart">
        ${r.chromDistribution.map(c => `
          <div class="di-chrom-row">
            <span class="di-chrom-label">${c.chrom}</span>
            <div class="di-chrom-bar-wrap">
              <div class="di-chrom-bar" style="width:${Math.round(c.count/maxCount*100)}%"></div>
            </div>
            <span class="di-chrom-count">${c.count.toLocaleString()}</span>
          </div>`).join('')}
      </div>` : '';

    /* Preview table */
    const previewHtml = r.preview.length ? `
      <div class="di-chart-title">Variant preview</div>
      <div class="di-vcf-preview-wrap">
        <table class="di-vcf-table">
          <thead><tr><th>CHROM</th><th>POS</th><th>REF</th><th>ALT</th><th>QUAL</th><th>FILTER</th></tr></thead>
          <tbody>${r.preview.map(v => `
            <tr>
              <td>${v.chrom}</td><td>${v.pos.toLocaleString()}</td>
              <td class="di-base-ref">${v.ref}</td>
              <td class="di-base-alt">${v.alt}</td>
              <td>${v.qual != null && !isNaN(v.qual) ? v.qual.toFixed(1) : '.'}</td>
              <td style="color:${v.filter==='PASS'?'#00C4A0':'#A8A098'}">${v.filter}</td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>` : '';

    const tiTvNote = r.tiTvRatio && (r.tiTvRatio < 1.8 || r.tiTvRatio > 3.0)
      ? `<div class="di-issue"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f97316" stroke-width="2.5" aria-hidden="true"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>Ti/Tv ratio ${r.tiTvRatio} outside expected range (1.8–3.0) — check for sequencing artefacts</div>` : '';

    return `
      <div class="di-metrics-grid">${metricHtml}</div>
      ${tiTvNote ? `<div class="di-issues-list">${tiTvNote}</div>` : ''}
      ${chromHtml}
      ${previewHtml}`;
  }

  /* ─── Matrix result cards ─── */
  function _matrixCards(r) {
    const metrics = [
      { label: 'Genes',           value: r.geneCount.toLocaleString(),   ok: r.geneCount > 100 },
      { label: 'Samples',         value: String(r.sampleCount),           ok: r.sampleCount >= 2 },
      { label: 'Format',          value: r.format,                        ok: true },
      { label: 'Min value',       value: String(r.globalMin),             ok: true },
      { label: 'Max value',       value: String(r.globalMax),             ok: true },
      { label: 'Mean expression', value: String(r.meanExpression),        ok: true },
      { label: 'Zero fraction',   value: `${r.zeroFraction}%`,            ok: r.zeroFraction < 80 },
      { label: 'Type',            value: r.isNormalised ? 'Normalised' : 'Raw counts', ok: true },
    ];

    const metricHtml = metrics.map(m => `
      <div class="di-metric">
        <div class="di-metric-label">${m.label}</div>
        <div class="di-metric-value" style="color:${m.ok ? '#00C4A0' : '#f97316'}">${m.value}</div>
        <div class="di-metric-dot" style="background:${m.ok ? '#00C4A0' : '#f97316'}"></div>
      </div>`).join('');

    /* Top genes table */
    const topHtml = r.topGenes.length ? `
      <div class="di-chart-title">Top expressed genes</div>
      <div class="di-vcf-preview-wrap">
        <table class="di-vcf-table">
          <thead><tr><th>Gene</th><th>Total counts</th><th>Mean expression</th></tr></thead>
          <tbody>${r.topGenes.map(g => `
            <tr>
              <td style="color:#58a6ff;font-family:'JetBrains Mono',monospace">${g.name}</td>
              <td>${g.totalCount.toLocaleString()}</td>
              <td>${g.meanExpr}</td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>` : '';

    /* Sample totals */
    const sampleHtml = r.sampleTotals.length ? `
      <div class="di-chart-title">Sample sequencing depth</div>
      <div class="di-chrom-chart">
        ${(() => {
          const maxT = Math.max(...r.sampleTotals.map(s => s.total), 1);
          return r.sampleTotals.map(s => `
            <div class="di-chrom-row">
              <span class="di-chrom-label" title="${s.name}">${s.name.length > 10 ? s.name.slice(0,9)+'…' : s.name}</span>
              <div class="di-chrom-bar-wrap">
                <div class="di-chrom-bar" style="width:${Math.round(s.total/maxT*100)}%;background:#58a6ff"></div>
              </div>
              <span class="di-chrom-count">${s.total.toLocaleString()}</span>
            </div>`).join('');
        })()}
      </div>` : '';

    const warnHtml = r.warnings.length ? `
      <div class="di-issues-list">
        ${r.warnings.map(w => `
          <div class="di-issue">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#e3b341" stroke-width="2.5" aria-hidden="true"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            ${w}
          </div>`).join('')}
      </div>` : '';

    return `
      <div class="di-metrics-grid">${metricHtml}</div>
      ${warnHtml}
      ${sampleHtml}
      ${topHtml}`;
  }

  function _fmtBases(n) {
    if (n < 1000) return n + ' bp';
    if (n < 1e6)  return (n / 1000).toFixed(0) + ' Kbp';
    if (n < 1e9)  return (n / 1e6).toFixed(1) + ' Mbp';
    return (n / 1e9).toFixed(2) + ' Gbp';
  }

  /* ─── Build the import panel ─── */
  function _buildPanel() {
    const panel = document.createElement('div');
    panel.id    = 'di-panel';
    panel.className = 'di-panel';
    panel.setAttribute('role', 'region');
    panel.setAttribute('aria-label', 'Data Import');

    panel.innerHTML = `
      <div class="di-panel-header">
        <span class="di-panel-title">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          Import Genomics File
        </span>
        <span class="di-panel-sub">FASTQ · VCF · CSV/TSV — up to 100 MB · parsed in a Web Worker</span>
      </div>

      <div class="di-zones-row">
        ${[
          { id:'fastq', icon:'bar-chart', label:'FASTQ File', hint:'.fastq  .fq', color:'#00C4A0', accept:'.fastq,.fq,.fastq.gz,.fq.gz,.txt' },
          { id:'vcf',   icon:'microscope', label:'VCF File',   hint:'.vcf  .vcf.gz', color:'#bc8cff', accept:'.vcf,.vcf.gz,.txt' },
          { id:'matrix',icon:'trending-up', label:'Expression Matrix', hint:'.csv  .tsv', color:'#58a6ff', accept:'.csv,.tsv,.txt' },
        ].map(z => `
          <div class="di-zone" id="di-zone-${z.id}" data-type="${z.id}"
               tabindex="0" role="button"
               aria-label="Drop ${z.label} file here or click to browse"
               style="--di-color:${z.color}">
            <div class="di-zone-icon">${OmicsLab.Icons?.svg(z.icon, 28) || ''}</div>
            <div class="di-zone-label">${z.label}</div>
            <div class="di-zone-hint">${z.hint}</div>
            <label class="di-file-btn">
              Browse
              <input type="file" accept="${z.accept}" style="display:none" class="di-file-input">
            </label>
            <div class="di-progress-wrap" style="display:none">
              <div class="di-progress-bar"><div class="di-progress-bar-fill"></div></div>
              <div class="di-progress-label">Processing…</div>
            </div>
            <div class="di-result-area" style="display:none"></div>
          </div>`).join('')}
      </div>

      <div class="di-global-drop-hint">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><polyline points="8 17 12 21 16 17"/><line x1="12" y1="3" x2="12" y2="21"/></svg>
        You can drag a file anywhere on this panel
      </div>`;

    return panel;
  }

  /* ─── Wire drag-drop and file input to a zone ─── */
  function _wireZone(zone) {
    const input = zone.querySelector('.di-file-input');
    if (input) {
      input.addEventListener('change', e => {
        const f = e.target.files?.[0];
        if (f) _handleFile(f, zone);
        e.target.value = '';
      });
    }

    zone.addEventListener('dragover', e => {
      e.preventDefault();
      zone.classList.add('di-zone-over');
    });
    zone.addEventListener('dragleave', e => {
      if (!zone.contains(e.relatedTarget)) zone.classList.remove('di-zone-over');
    });
    zone.addEventListener('drop', e => {
      e.preventDefault();
      zone.classList.remove('di-zone-over');
      const f = e.dataTransfer.files?.[0];
      if (f) _handleFile(f, zone);
    });
    zone.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); input?.click(); }
    });
  }

  /* ─── Global panel drag (auto-route to correct zone) ─── */
  function _wireGlobalDrop(panel) {
    panel.addEventListener('dragover', e => { e.preventDefault(); });
    panel.addEventListener('drop', e => {
      e.preventDefault();
      const f = e.dataTransfer.files?.[0];
      if (!f) return;
      const name = f.name.toLowerCase();
      let zoneId = 'matrix';
      if (name.includes('.fastq') || name.includes('.fq')) zoneId = 'fastq';
      else if (name.includes('.vcf')) zoneId = 'vcf';
      const zone = panel.querySelector(`#di-zone-${zoneId}`);
      if (zone) _handleFile(f, zone);
    });
  }

  /* ─── Inject panel into Analysis section ─── */
  function _inject() {
    if (document.getElementById('di-panel')) return;
    const analysisSection = document.getElementById('analysis-section');
    if (!analysisSection) return;

    /* Build + inject a tab trigger */
    const tabs = analysisSection.querySelector('.az-tabs');
    if (tabs && !tabs.querySelector('[data-tab="import"]')) {
      const btn = document.createElement('button');
      btn.className = 'az-tab';
      btn.dataset.tab = 'import';
      btn.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg> Import File`;
      btn.onclick = () => {
        tabs.querySelectorAll('.az-tab').forEach(t => t.classList.remove('active'));
        btn.classList.add('active');
        document.querySelectorAll('.az-panel-content').forEach(p => p.classList.remove('active'));
        const diWrap = document.getElementById('di-panel-wrap');
        if (diWrap) { diWrap.style.display = ''; }
      };
      tabs.appendChild(btn);
    }

    /* Hide other panels when Import tab is open — show others when they click another tab */
    if (tabs) {
      tabs.querySelectorAll('.az-tab:not([data-tab="import"])').forEach(t => {
        const orig = t.onclick;
        t.addEventListener('click', () => {
          const diWrap = document.getElementById('di-panel-wrap');
          if (diWrap) diWrap.style.display = 'none';
        });
      });
    }

    const panel = _buildPanel();
    const wrap = document.createElement('div');
    wrap.id = 'di-panel-wrap';
    wrap.style.display = 'none';
    wrap.appendChild(panel);
    analysisSection.appendChild(wrap);

    ['fastq','vcf','matrix'].forEach(id => {
      const zone = panel.querySelector(`#di-zone-${id}`);
      if (zone) _wireZone(zone);
    });
    _wireGlobalDrop(panel);

    _injectStyles();
  }

  /* ─── CSS ─── */
  function _injectStyles() {
    if (document.getElementById('di-styles')) return;
    const s = document.createElement('style');
    s.id = 'di-styles';
    s.textContent = `
      .di-panel{padding:1.25rem;border:1px solid #182236;border-radius:10px;background:#0D1524;margin-top:1rem}
      .di-panel-header{margin-bottom:1rem}
      .di-panel-title{font-size:.95rem;font-weight:700;color:#E4DDD2;display:flex;align-items:center;gap:.4rem}
      .di-panel-sub{display:block;font-size:.72rem;color:#A8A098;margin-top:.2rem}
      .di-zones-row{display:grid;grid-template-columns:repeat(3,1fr);gap:.75rem}
      @media(max-width:700px){.di-zones-row{grid-template-columns:1fr}}
      .di-zone{background:#111B2E;border:1.5px dashed #243048;border-radius:9px;padding:1.25rem 1rem;display:flex;flex-direction:column;align-items:center;gap:.4rem;cursor:pointer;transition:border-color .15s,background .15s;position:relative}
      .di-zone:hover,.di-zone:focus{border-color:var(--di-color,#58a6ff);background:rgba(88,166,255,.04);outline:none}
      .di-zone.di-zone-over{border-color:var(--di-color,#58a6ff);background:rgba(88,166,255,.08);border-style:solid}
      .di-zone-icon{display:flex;align-items:center;justify-content:center;color:var(--di-color,#58a6ff)}
      .di-zone-label{font-size:.82rem;font-weight:600;color:#E4DDD2}
      .di-zone-hint{font-size:.68rem;color:#A8A098;font-family:'JetBrains Mono',monospace}
      .di-file-btn{font-size:.72rem;padding:.22rem .65rem;background:#182236;border:1px solid #243048;border-radius:5px;cursor:pointer;color:#A8A098;margin-top:.2rem;transition:background .15s}
      .di-file-btn:hover{background:#243048}
      .di-progress-wrap{width:100%;margin-top:.5rem}
      .di-progress-bar{background:#182236;border-radius:3px;height:5px;overflow:hidden}
      .di-progress-bar-fill{height:100%;background:var(--di-color,#58a6ff);width:0;transition:width .4s}
      .di-progress-label{font-size:.65rem;color:#A8A098;text-align:center;margin-top:.2rem}
      .di-result-area{width:100%;margin-top:.6rem}
      .di-result-header{display:flex;align-items:center;gap:.4rem;font-size:.72rem;color:#A8A098;padding:.4rem .5rem;background:#111B2E;border-radius:5px;margin-bottom:.5rem;overflow:hidden}
      .di-result-filename{color:#E4DDD2;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1;min-width:0}
      .di-result-size{flex-shrink:0;color:#A8A098}
      .di-status-badge{display:inline-flex;padding:.2rem .6rem;border-radius:20px;font-size:.72rem;font-weight:700;margin-bottom:.5rem}
      .di-metrics-grid{display:grid;grid-template-columns:1fr 1fr;gap:.3rem;margin-bottom:.5rem}
      .di-metric{background:#0D1524;border:1px solid #182236;border-radius:5px;padding:.3rem .45rem;display:grid;grid-template-columns:1fr auto 8px;align-items:center;gap:.25rem}
      .di-metric-label{font-size:.66rem;color:#A8A098}
      .di-metric-value{font-size:.72rem;font-weight:700;text-align:right}
      .di-metric-dot{width:6px;height:6px;border-radius:50%}
      .di-chart-title{font-size:.7rem;font-weight:600;color:#A8A098;margin:.5rem 0 .25rem;text-transform:uppercase;letter-spacing:.05em}
      .di-bar-chart{display:flex;align-items:flex-end;gap:1px;height:42px;background:#111B2E;border-radius:4px;padding:3px 3px 0;overflow:hidden}
      .di-bar{flex:1;min-width:1px;border-radius:1px 1px 0 0;transition:height .3s}
      .di-chart-axis{display:flex;justify-content:space-between;font-size:.6rem;color:#A8A098;margin-top:.1rem}
      .di-chrom-chart{display:flex;flex-direction:column;gap:.2rem}
      .di-chrom-row{display:grid;grid-template-columns:60px 1fr 50px;align-items:center;gap:.3rem;font-size:.66rem}
      .di-chrom-label{color:#A8A098;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-family:'JetBrains Mono',monospace}
      .di-chrom-bar-wrap{background:#182236;border-radius:2px;height:10px;overflow:hidden}
      .di-chrom-bar{height:100%;background:#bc8cff;border-radius:2px;transition:width .4s}
      .di-chrom-count{text-align:right;color:#A8A098}
      .di-vcf-preview-wrap{overflow-x:auto;-webkit-overflow-scrolling:touch}
      .di-vcf-table{width:100%;border-collapse:collapse;font-size:.66rem}
      .di-vcf-table th{color:#A8A098;font-weight:600;padding:.25rem .35rem;border-bottom:1px solid #182236;text-align:left;white-space:nowrap}
      .di-vcf-table td{padding:.22rem .35rem;border-bottom:1px solid #111B2E;color:#E4DDD2;white-space:nowrap}
      .di-vcf-table tr:hover td{background:#111B2E}
      .di-base-ref{color:#ff6b6b;font-family:'JetBrains Mono',monospace}
      .di-base-alt{color:#00C4A0;font-family:'JetBrains Mono',monospace}
      .di-issues-list{margin:.3rem 0;display:flex;flex-direction:column;gap:.25rem}
      .di-issue{display:flex;align-items:flex-start;gap:.35rem;font-size:.68rem;color:#f97316;background:rgba(249,115,22,.06);border:1px solid rgba(249,115,22,.2);border-radius:5px;padding:.3rem .45rem}
      .di-error-card{background:rgba(255,107,107,.06);border:1px solid rgba(255,107,107,.2);border-radius:6px;padding:.5rem;font-size:.72rem;color:#ff6b6b}
      .di-global-drop-hint{text-align:center;font-size:.66rem;color:#A8A098;margin-top:.5rem;display:flex;align-items:center;justify-content:center;gap:.3rem}
    `;
    document.head.appendChild(s);
  }

  /* ─── Init: called when Analysis page is opened ─── */
  function init() {
    if (_inited) return;
    _inited = true;
    /* Wait for the analysis tabs to be rendered */
    const tryInject = () => {
      if (document.querySelector('.az-tabs')) _inject();
      else setTimeout(tryInject, 100);
    };
    setTimeout(tryInject, 150);
  }

  return { init };
})();
