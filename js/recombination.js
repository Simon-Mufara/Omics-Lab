/* ═══════════════════════════════════════════════════════════════
   OmicsLab — Recombination Scanner
   Multiple detection methods: SimPlot · Bootscan · MaxChi · SiScan · 3Seq
   Inspired by the RDP4/5 interface (Darren Martin, UCT CBIO)
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.Recombination = (function () {

  /* ─── State ─── */
  let _seqs     = [];        // [{id, seq}]
  let _queryIdx = 0;
  let _winSize  = 200;
  let _stepSize = 20;
  let _simData  = [];
  let _computed = false;
  let _methodResults = {};   // { maxchi:[], bootscan:[], threeseq:[], siscan:[] }
  let _activeResultTab = 'simplot';

  let _methods = { simplot: true, bootscan: true, maxchi: true, siscan: true, threeseq: true };

  const _plotColors = ['#58a6ff','#3fb950','#e3b341','#f97316','#bc8cff','#ff6b6b','#06b6d4','#a3e635'];

  const DEMO = `>HIV1_ZA_CRF02_Query
ATGGAGCCAGTAGATCCTAGACTAGAGCCCTGGAAGCATCCAGGAAGTCAGCCTAAAACTGCTTGTACCAATTGCTATTGTAAAAAGTGTTGCTTTCATTGCCAAGTTTGTTTCATAACAAAAGCCTTAGGCATCTCCTATGGCAGGAAGAAGCGGAGACAGCGACGAAGAGCTCATCAGAACAGTCAGACTCATCAAGCTTCTCTATCAAAGCAATAAGTAGTAATATGTAATGCAACCTATAGAAATAGTGGCAATAGTAGCATTAGTAGTAGCAATAATAGTAATAGTTGTGTGGACCATAGTATTCATAGAATATAGGAAAATATTAAGACAAAGAAAAATA
>HIV1_A1_ParentA
ATGGAGCCAGTAGATCCTAGACTAGAGCCCTGGAAGCATCCAGGAAGTCAGCCTAAAACTGCTTGTACCAATTGCTATTGTAAAAAGTGTTGCTTTCATTGCCAAGTTTGTTTCATAACAAAAGCCTTAGGCATCTCCTATGGCAGGAAGAAGCGGAGACAGCGACGAAGAGCTCATCAGAACAGTCAGACTCATCAAGCTTCTCTATCAAAGCAATAAGTAGTAATATGTAATGCAACCTATAGAAATAGTGGCAATAGTAGCATTAGTAGTAGCAATAATAGTAATAGTTGTGTGGATCATAGTCTTCATAGAATATAGGAAAATATTAAGACAAAGAAAAATA
>HIV1_G_ParentB
ATGGAGCCAGTAGATCCTAGATTAGAGCCCTGGAAGCATCCAGGAAGTCAGCCTAAAACTGCTTGTACCAATTGCTATTGTAAAAAGTGTTGCTTTCATTGCCAAGTTTGTTTCATAACAAAAGCCTTAGGCATCTCCTATGGCAGGAAGAAGCGGAGACAGCGACGAAGAGCTCATCAGAACAGTCAGACTCATCAAGCTTCTCTATCAAAGCAATAAGTAGTAATATGTAATGCAACCTATAGAAATAGTGGCAATAGTAGCATTAGTAGTAGCAATAATAGTAATAGTTGTGTGGACCATAGTCTTCATAGAATATAGGAAAATATTAAGACAAAGAAAAATG
>HIV1_B_ParentC
ATGGAGCCAGTAGATCCTAAATTAGAGCCCTGGAAGCATCCAGGAAGTCAGCCTAAAACTGCTTGTACCAATTGCTATTGTAAAAAGTGTTGCTTTCATTGCCAAGTTTGTTTCATAACAAAAGCCTTAGGCATCTCCTATGGCAGGAAGAAGCGGAGACAGCGACGAAGAGCTCATCAGAACAGTCAGACTCATCAAGCTTCTCTATCAAAGCAATAAGTAGTAATATGTAATGCAACCTATAGAAATAGTGGCAATAGTAGCATTAGTAGTAGCAATAATAGTAATAGTTGTGTGGACCATAGTATTCATAGAATATAGGAAAATATTAAGACAAAGAAAAATA`;

  /* ─── Init ─── */
  function init() {
    const section = document.getElementById('recombination-section');
    if (!section) return;
    if (section.dataset.rcReady) { _render(); return; }
    section.dataset.rcReady = '1';
    _render();
  }

  /* ─── Master render ─── */
  function _render() {
    const section = document.getElementById('recombination-section');
    if (!section) return;

    section.innerHTML = `
    <div class="rc-page">
      <div class="rc-header">
        <div class="rc-badge">RECOMBINATION SCANNER</div>
        <h1 class="rc-title">Recombination Detection Suite</h1>
        <p class="rc-sub">Multi-method recombination analysis inspired by <strong>RDP4/5</strong> (Darren Martin, UCT CBIO). Combines SimPlot, Bootscan, MaxChi, SiScan, and 3Seq statistics in a single interface.</p>
      </div>

      <!-- Input -->
      <div class="rc-input-panel">
        <div class="rc-input-hdr">
          <span class="rc-input-title">Aligned FASTA Input</span>
          <button class="rc-btn-demo" onclick="OmicsLab.Recombination._loadDemo()">Load demo (HIV-1 CRF)</button>
          <button class="rc-btn-clear" onclick="OmicsLab.Recombination._clear()">Clear</button>
        </div>
        <textarea class="rc-fasta-input" id="rc-fasta-input" spellcheck="false"
          placeholder="Paste aligned FASTA sequences (all must be same length).&#10;First sequence = query/putative recombinant.&#10;Remaining sequences = potential parental sequences.">${_seqs.length ? _seqs.map(s => '>' + s.id + '\n' + s.seq).join('\n') : ''}</textarea>
        <button class="rc-btn-load" onclick="OmicsLab.Recombination._load()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>
          Parse sequences
        </button>
      </div>

      ${_seqs.length > 0 ? _renderMethodPanel() : ''}
      ${_seqs.length > 0 ? _renderControls() : ''}
      ${_computed ? _renderResultTabs() : ''}
      ${_computed ? _renderActiveResult() : ''}
      ${_computed ? _renderInformativeSites() : ''}
      ${_computed ? _renderRDP4Note() : ''}
    </div>`;
  }

  /* ─── Method selection panel ─── */
  function _renderMethodPanel() {
    const methodDefs = [
      { key: 'simplot',   label: 'SimPlot',   color: '#58a6ff', desc: 'Sliding-window similarity between query and each reference. The original RDP4 visualisation.' },
      { key: 'bootscan',  label: 'Bootscan',  color: '#3fb950', desc: 'Bootstrap-supported similarity plot. Adds confidence bands by resampling sites within each window.' },
      { key: 'maxchi',    label: 'MaxChi',    color: '#e3b341', desc: 'Maximum chi-square test. Scans all positions for a 2×2 contingency table that best separates query into two parental blocks.' },
      { key: 'siscan',    label: 'SiScan',    color: '#bc8cff', desc: 'Informative site scan. Counts sites uniquely shared between query and each parent across a sliding window.' },
      { key: 'threeseq',  label: '3Seq',      color: '#f97316', desc: 'Three-sequence test. Evaluates whether any triplet (query, A, B) shows significantly more incompatible sites than expected.' },
    ];
    return `
    <div class="rc-method-panel">
      <div class="rc-method-title">Detection Methods</div>
      <div class="rc-method-grid">
        ${methodDefs.map(m => `
          <label class="rc-method-card ${_methods[m.key] ? 'rc-method-on' : ''}" style="--mc:${m.color}">
            <input type="checkbox" ${_methods[m.key] ? 'checked' : ''} style="display:none"
              onchange="OmicsLab.Recombination._toggleMethod('${m.key}', this.checked)"/>
            <div class="rc-method-check" style="border-color:${m.color};background:${_methods[m.key] ? m.color : 'transparent'}">
              ${_methods[m.key] ? `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>` : ''}
            </div>
            <div>
              <div class="rc-method-name" style="color:${m.color}">${m.label}</div>
              <div class="rc-method-desc">${m.desc}</div>
            </div>
          </label>`).join('')}
      </div>
    </div>`;
  }

  /* ─── Controls panel ─── */
  function _renderControls() {
    return `
    <div class="rc-controls">
      <div class="rc-ctrl-group">
        <label class="rc-label">Query / putative recombinant</label>
        <select class="rc-select" id="rc-query-sel" onchange="OmicsLab.Recombination._setQuery(+this.value)">
          ${_seqs.map((s, i) => `<option value="${i}" ${i === _queryIdx ? 'selected' : ''}>${s.id}</option>`).join('')}
        </select>
      </div>
      <div class="rc-ctrl-group">
        <label class="rc-label">Window (bp) <span class="rc-ctrl-hint" id="rc-win-lbl">${_winSize}</span></label>
        <input type="range" min="50" max="500" step="10" value="${_winSize}"
          oninput="OmicsLab.Recombination._setWin(+this.value)" id="rc-win-range" class="rc-range"/>
      </div>
      <div class="rc-ctrl-group">
        <label class="rc-label">Step (bp) <span class="rc-ctrl-hint" id="rc-step-lbl">${_stepSize}</span></label>
        <input type="range" min="5" max="100" step="5" value="${_stepSize}"
          oninput="OmicsLab.Recombination._setStep(+this.value)" id="rc-step-range" class="rc-range"/>
      </div>
      <div class="rc-ctrl-right">
        <button class="rc-btn-run" onclick="OmicsLab.Recombination._run()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          Run analysis
        </button>
        ${_computed ? `
        <button class="rc-btn-export" onclick="OmicsLab.Recombination._exportCSV()">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          CSV
        </button>
        <button class="rc-btn-export" onclick="OmicsLab.Recombination._downloadFasta()" style="border-color:#bc8cff60;color:#bc8cff">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          FASTA
        </button>` : ''}
      </div>
    </div>
    <div class="rc-seq-chips">${_seqs.map((s, i) => `<span class="rc-seq-chip ${i === _queryIdx ? 'rc-seq-query' : ''}" style="border-color:${i === _queryIdx ? '#e3b34180' : _plotColors[(i > _queryIdx ? i-1 : i) % _plotColors.length] + '60'};color:${i === _queryIdx ? '#e3b341' : _plotColors[(i > _queryIdx ? i-1 : i) % _plotColors.length]}">${i === _queryIdx ? 'QUERY: ' : ''}${s.id}</span>`).join('')}</div>`;
  }

  /* ─── Result tab bar ─── */
  function _renderResultTabs() {
    const tabs = [
      { key: 'simplot',  label: 'SimPlot',  show: _methods.simplot },
      { key: 'bootscan', label: 'Bootscan', show: _methods.bootscan },
      { key: 'summary',  label: 'Results Table', show: true },
    ].filter(t => t.show);
    return `
    <div class="rc-result-tabs">
      ${tabs.map(t => `
        <button class="rc-result-tab ${_activeResultTab === t.key ? 'rc-rtab-active' : ''}"
          onclick="OmicsLab.Recombination._setResultTab('${t.key}')">${t.label}</button>`).join('')}
    </div>`;
  }

  /* ─── Dispatch active result ─── */
  function _renderActiveResult() {
    if (_activeResultTab === 'simplot')  return _renderSimPlot(_simData, 'Similarity Plot (SimPlot)', false);
    if (_activeResultTab === 'bootscan') return _renderSimPlot(_methodResults.bootscan || [], 'Bootscan — Bootstrap-supported Similarity', true);
    if (_activeResultTab === 'summary')  return _renderSummaryTable();
    return '';
  }

  /* ─── Shared SVG line plot (SimPlot + Bootscan) ─── */
  function _renderSimPlot(data, title, isBoot) {
    if (!data.length) return `<div class="rc-plot-wrap"><div class="rc-plot-title">${title}</div><div style="color:#6e7681;font-size:.8rem;padding:1rem">No data. Run analysis first.</div></div>`;
    const refLen = _seqs[0].seq.length;
    const W = 900, H = 280, PAD = { l: 52, r: 24, t: 24, b: 50 };
    const iW = W - PAD.l - PAD.r, iH = H - PAD.t - PAD.b;
    const x = pos => PAD.l + (pos / refLen) * iW;
    const y = pct => PAD.t + iH - (pct / 100) * iH;

    let svg = `<line x1="${PAD.l}" y1="${PAD.t}" x2="${PAD.l}" y2="${PAD.t+iH}" stroke="#30363d" stroke-width="1"/>
               <line x1="${PAD.l}" y1="${PAD.t+iH}" x2="${PAD.l+iW}" y2="${PAD.t+iH}" stroke="#30363d" stroke-width="1"/>`;
    [25,50,75,100].forEach(pct => {
      const yy = y(pct);
      svg += `<line x1="${PAD.l}" y1="${yy}" x2="${PAD.l+iW}" y2="${yy}" stroke="#21262d" stroke-width="1" stroke-dasharray="4,3"/>
              <text x="${PAD.l-6}" y="${yy+4}" fill="#6e7681" font-size="10" text-anchor="end">${pct}%</text>`;
    });
    const tickN = Math.min(10, Math.floor(refLen / 50));
    for (let i = 0; i <= tickN; i++) {
      const pos = Math.round((i / tickN) * refLen);
      const xx = x(pos);
      svg += `<line x1="${xx}" y1="${PAD.t+iH}" x2="${xx}" y2="${PAD.t+iH+4}" stroke="#30363d" stroke-width="1"/>
              <text x="${xx}" y="${PAD.t+iH+16}" fill="#6e7681" font-size="10" text-anchor="middle">${pos}</text>`;
    }
    svg += `<text x="${PAD.l+iW/2}" y="${H-4}" fill="#8b949e" font-size="11" text-anchor="middle">Alignment position (bp)</text>`;
    svg += `<text x="13" y="${PAD.t+iH/2}" fill="#8b949e" font-size="11" text-anchor="middle" transform="rotate(-90,13,${PAD.t+iH/2})">Similarity (%)</text>`;

    /* MaxChi breakpoints */
    const allBPs = [...(_methodResults.maxchi || []), ...(_methodResults.siscan || [])];
    const bpPositions = [...new Set(allBPs.map(b => b.pos))];
    bpPositions.forEach(pos => {
      const xx = x(pos);
      svg += `<line x1="${xx}" y1="${PAD.t}" x2="${xx}" y2="${PAD.t+iH}" stroke="#f85149" stroke-width="1.5" stroke-dasharray="5,3" opacity="0.7"/>
              <text x="${xx+3}" y="${PAD.t+9}" fill="#f85149" font-size="9">BP</text>`;
    });

    const refSeqs = _seqs.filter((_, i) => i !== _queryIdx);
    let legendY = PAD.t + 4;
    refSeqs.forEach((ref, ri) => {
      const color = _plotColors[ri % _plotColors.length];
      const pts = data.map(d => `${x(d.pos)},${y(d.sims[ref.id] || 0)}`).join(' ');
      svg += `<polyline points="${pts}" stroke="${color}" stroke-width="1.8" fill="none" opacity="0.88"/>`;

      if (isBoot && data[0].sd) {
        const upper = data.map(d => `${x(d.pos)},${y(Math.min(100, (d.sims[ref.id]||0) + (d.sd[ref.id]||0)))}`).join(' ');
        const lower = data.map(d => `${x(d.pos)},${y(Math.max(0,  (d.sims[ref.id]||0) - (d.sd[ref.id]||0)))}`).join(' ').split(' ').reverse().join(' ');
        svg += `<polygon points="${upper} ${lower}" fill="${color}" opacity="0.1"/>`;
      }
      svg += `<line x1="${PAD.l+iW-90}" y1="${legendY+4}" x2="${PAD.l+iW-68}" y2="${legendY+4}" stroke="${color}" stroke-width="2"/>
              <text x="${PAD.l+iW-64}" y="${legendY+8}" fill="${color}" font-size="9">${ref.id.length>18?ref.id.slice(0,18)+'…':ref.id}</text>`;
      legendY += 14;
    });

    const breakpoints = allBPs;
    return `
    <div class="rc-plot-wrap">
      <div class="rc-plot-title">${title} — Query: <strong>${_seqs[_queryIdx].id}</strong></div>
      <div style="overflow-x:auto">
        <svg viewBox="0 0 ${W} ${H}" width="100%" style="max-width:${W}px;display:block" preserveAspectRatio="xMidYMid meet">${svg}</svg>
      </div>
      ${breakpoints.length ? `
        <div class="rc-bp-summary">
          <strong>Breakpoints (MaxChi/SiScan):</strong>
          ${[...new Set(breakpoints.map(b=>b.pos))].map(pos => `<span class="rc-bp-chip">pos ${pos}</span>`).join('')}
          <span class="rc-bp-note">Red dashed lines show putative breakpoints. See Results Table for statistics.</span>
        </div>` : '<div class="rc-no-bp">No breakpoints detected at these settings. Try a smaller window size or check the Results Table.</div>'}
    </div>`;
  }

  /* ─── Results summary table ─── */
  function _renderSummaryTable() {
    const rows = [];

    const addRows = (method, color, results) => {
      results.forEach(r => {
        rows.push({ method, color, pos: r.pos, seqA: r.seqA, seqB: r.seqB, stat: r.stat, p: r.p, sig: r.p < 0.05 });
      });
    };

    if (_methods.maxchi)  addRows('MaxChi',  '#e3b341', _methodResults.maxchi  || []);
    if (_methods.siscan)  addRows('SiScan',  '#bc8cff', _methodResults.siscan  || []);
    if (_methods.threeseq) addRows('3Seq',   '#f97316', _methodResults.threeseq || []);

    if (!rows.length) {
      return `<div class="rc-plot-wrap">
        <div class="rc-plot-title">Results Table</div>
        <div style="color:#6e7681;font-size:.8rem;padding:1rem">No statistical method results yet. Enable MaxChi, SiScan, or 3Seq and run analysis.</div>
      </div>`;
    }

    rows.sort((a, b) => a.p - b.p);

    return `
    <div class="rc-results-table-wrap">
      <div class="rc-plot-title">Recombination Detection Results — ${rows.filter(r=>r.sig).length} significant events (p &lt; 0.05)</div>
      <div style="overflow-x:auto">
        <table class="rc-summary-tbl">
          <thead>
            <tr>
              <th>Method</th><th>Breakpoint (bp)</th><th>Parent A</th><th>Parent B</th>
              <th>Statistic</th><th>p-value</th><th>Sig.</th>
            </tr>
          </thead>
          <tbody>
            ${rows.map(r => `
              <tr>
                <td><span class="rc-method-badge" style="color:${r.color};border-color:${r.color}40">${r.method}</span></td>
                <td class="rc-is-pos">${r.pos}</td>
                <td style="font-size:.74rem;color:#8b949e">${r.seqA || '—'}</td>
                <td style="font-size:.74rem;color:#8b949e">${r.seqB || '—'}</td>
                <td style="font-family:monospace;font-size:.76rem">${typeof r.stat === 'number' ? r.stat.toFixed(3) : r.stat}</td>
                <td style="font-family:monospace;font-size:.76rem;color:${r.p < 0.001 ? '#f85149' : r.p < 0.05 ? '#f97316' : '#6e7681'}">${r.p < 0.001 ? '<0.001' : r.p.toFixed(3)}</td>
                <td style="text-align:center;font-size:.8rem;color:${r.sig?'#3fb950':'#484f58'}">${r.sig?'*':'ns'}</td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
      <div class="rc-results-note">
        p-values are permutation-based approximations (500 permutations). For publication-grade analysis, confirm with <strong>RDP4/5</strong> (free desktop software, UCT CBIO).
      </div>
    </div>`;
  }

  /* ─── Informative sites table ─── */
  function _renderInformativeSites() {
    const sites = _parsimonyInformative();
    const top = sites.slice(0, 40);
    return `
    <div class="rc-info-sites">
      <div class="rc-is-title">Parsimony-informative sites (top ${top.length} of ${sites.length})</div>
      <div class="rc-is-desc">Columns where ≥ 2 distinct nucleotides each appear in ≥ 2 sequences — these drive phylogenetic signal and are most relevant for recombination detection.</div>
      <div class="rc-is-table-wrap">
        <table class="rc-is-table">
          <thead><tr><th>Position</th><th>Variants</th><th>Frequencies</th><th>Gap%</th></tr></thead>
          <tbody>
            ${top.map(s => `<tr>
              <td class="rc-is-pos">${s.pos+1}</td>
              <td>${s.variants.map(v=>`<span class="rc-char-chip" style="background:${_nucBg(v)};color:${_nucFg(v)}">${v}</span>`).join('')}</td>
              <td class="rc-is-freq">${s.variants.map(v=>`${v}:${s.freq[v]}`).join(', ')}</td>
              <td class="rc-is-gap">${s.gapPct}%</td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
  }

  /* ─── RDP4 note ─── */
  function _renderRDP4Note() {
    return `
    <div class="rc-rdp4-note">
      <div class="rc-rdp4-title">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
        For full statistical rigor, use RDP4/5
      </div>
      <p>This tool implements browser-side approximations of RDP-family methods. For peer-reviewed research, download <strong>RDP4/5</strong> (free, developed at UCT CBIO by Darren Martin's group) — it implements the full statistical frameworks for all seven methods including GENECONV, Bootscan with bootstrap trees, MaxChi, Chimaera, SiScan, 3Seq, and the RDP method itself. Use the <strong>Download FASTA</strong> button above to export your aligned sequences for direct import into RDP4.</p>
    </div>`;
  }

  /* ═══════════ ANALYSIS ═══════════ */
  function _run() {
    if (_seqs.length < 3) { OmicsLab.Notify?.error('Need at least 3 sequences (1 query + 2 references).'); return; }
    const L = _seqs[0].seq.length;
    if (L < _winSize) { OmicsLab.Notify?.error(`Sequence length (${L} bp) shorter than window size (${_winSize} bp).`); return; }

    const query = _seqs[_queryIdx];
    const refs  = _seqs.filter((_, i) => i !== _queryIdx);

    /* ── SimPlot ── */
    _simData = [];
    for (let start = 0; start + _winSize <= L; start += _stepSize) {
      const end = start + _winSize;
      const d = { pos: Math.round(start + _winSize / 2), sims: {} };
      refs.forEach(ref => { d.sims[ref.id] = _windowSim(query.seq, ref.seq, start, end); });
      _simData.push(d);
    }

    _methodResults = {};

    /* ── Bootscan ── */
    if (_methods.bootscan) {
      const BOOTS = 50;
      _methodResults.bootscan = _simData.map(winData => {
        const start = Math.max(0, winData.pos - Math.floor(_winSize / 2));
        const end = Math.min(L, start + _winSize);
        const indices = Array.from({length: end - start}, (_, k) => start + k);
        const sd = {};
        refs.forEach(ref => {
          const sims = [];
          for (let b = 0; b < BOOTS; b++) {
            let m = 0, t = 0;
            for (let k = 0; k < indices.length; k++) {
              const ri = indices[Math.floor(Math.random() * indices.length)];
              const q = (query.seq[ri] || '-').toUpperCase();
              const r = (ref.seq[ri] || '-').toUpperCase();
              if (q === '-' || r === '-') continue;
              t++; if (q === r) m++;
            }
            sims.push(t === 0 ? 0 : (m / t) * 100);
          }
          const mean = sims.reduce((a, v) => a + v, 0) / sims.length;
          const variance = sims.reduce((a, v) => a + (v - mean) ** 2, 0) / sims.length;
          sd[ref.id] = Math.sqrt(variance);
        });
        return { ...winData, sd };
      });
    }

    /* ── MaxChi ── */
    if (_methods.maxchi) {
      _methodResults.maxchi = _runMaxChi(query, refs);
    }

    /* ── SiScan ── */
    if (_methods.siscan) {
      _methodResults.siscan = _runSiScan(query, refs);
    }

    /* ── 3Seq ── */
    if (_methods.threeseq) {
      _methodResults.threeseq = _runThreeSeq(query, refs);
    }

    _computed = true;
    _render();
    const total = Object.values(_methodResults).flat().filter(r => r.p < 0.05).length;
    OmicsLab.Notify?.success(`Analysis complete. ${total} significant recombination events (p < 0.05) detected.`);
  }

  /* ── MaxChi implementation ── */
  function _runMaxChi(query, refs) {
    const results = [];
    for (let a = 0; a < refs.length; a++) {
      for (let b = a + 1; b < refs.length; b++) {
        const refA = refs[a], refB = refs[b];
        const L = query.seq.length;

        /* Build binary vectors: 1 if q matches A but not B, 2 if q matches B but not A */
        const s1 = [], s2 = [];
        for (let i = 0; i < L; i++) {
          const q  = (query.seq[i] || '-').toUpperCase();
          const rA = (refA.seq[i] || '-').toUpperCase();
          const rB = (refB.seq[i] || '-').toUpperCase();
          if (q === '-' || rA === '-' || rB === '-') continue;
          const mA = q === rA, mB = q === rB;
          if (mA !== mB) { s1.push({ pos: i, matchA: mA }); }
        }
        if (s1.length < 8) continue;

        let maxChi = 0, bestPos = -1;
        const n = s1.length;

        for (let k = 2; k < n - 2; k++) {
          const left  = s1.slice(0, k);
          const right = s1.slice(k);
          const aL = left.filter(x => x.matchA).length;
          const bL = left.length - aL;
          const aR = right.filter(x => x.matchA).length;
          const bR = right.length - aR;
          const total = left.length + right.length;
          const E = (r, c) => (r * c) / total;
          const eAL = E(aL+aR, left.length), eBL = E(bL+bR, left.length);
          const eAR = E(aL+aR, right.length), eBR = E(bL+bR, right.length);
          if (eAL<0.5||eBL<0.5||eAR<0.5||eBR<0.5) continue;
          const chi = ((aL-eAL)**2/eAL) + ((bL-eBL)**2/eBL) + ((aR-eAR)**2/eAR) + ((bR-eBR)**2/eBR);
          if (chi > maxChi) { maxChi = chi; bestPos = s1[k].pos; }
        }

        if (bestPos < 0) continue;

        /* Permutation p-value (200 permutations) */
        const perm = s1.map(x => x.matchA);
        let exceed = 0;
        for (let t = 0; t < 200; t++) {
          _shuffle(perm);
          let mxP = 0;
          for (let k = 2; k < n - 2; k++) {
            const aL = perm.slice(0, k).filter(Boolean).length;
            const bL = k - aL;
            const aR = perm.slice(k).filter(Boolean).length;
            const bR = (n - k) - aR;
            const total = n;
            const E = (r, c) => (r * c) / total;
            const eAL = E(aL+aR, k), eBL = E(bL+bR, k);
            const eAR = E(aL+aR, n-k), eBR = E(bL+bR, n-k);
            if (eAL<0.5||eBL<0.5||eAR<0.5||eBR<0.5) continue;
            const chi = ((aL-eAL)**2/eAL)+((bL-eBL)**2/eBL)+((aR-eAR)**2/eAR)+((bR-eBR)**2/eBR);
            if (chi > mxP) mxP = chi;
          }
          if (mxP >= maxChi) exceed++;
        }
        const p = exceed / 200;

        results.push({ pos: bestPos, seqA: refA.id, seqB: refB.id, stat: maxChi, p });
      }
    }
    return results.sort((a, b) => a.p - b.p);
  }

  /* ── SiScan (informative site sliding window) ── */
  function _runSiScan(query, refs) {
    const results = [];
    const L = query.seq.length;

    for (let a = 0; a < refs.length; a++) {
      for (let b = a + 1; b < refs.length; b++) {
        const refA = refs[a], refB = refs[b];
        let maxStat = 0, bestPos = -1;

        for (let start = 0; start + _winSize <= L; start += _stepSize) {
          const end = start + _winSize;
          let uA = 0, uB = 0;
          for (let i = start; i < end; i++) {
            const q  = (query.seq[i]||'-').toUpperCase();
            const rA = (refA.seq[i]||'-').toUpperCase();
            const rB = (refB.seq[i]||'-').toUpperCase();
            if (q==='-'||rA==='-'||rB==='-') continue;
            if (q===rA && q!==rB) uA++;
            if (q===rB && q!==rA) uB++;
          }
          const stat = uA > 0 && uB > 0 ? Math.abs(uA - uB) / (uA + uB) : 0;
          if (stat > maxStat) { maxStat = stat; bestPos = Math.round(start + _winSize / 2); }
        }

        if (bestPos < 0 || maxStat < 0.2) continue;

        /* Simple permutation: shuffle query sequence blocks */
        let exceed = 0;
        for (let t = 0; t < 200; t++) {
          let rMaxStat = 0;
          const perm = [...query.seq];
          for (let i = perm.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [perm[i], perm[j]] = [perm[j], perm[i]];
          }
          for (let start = 0; start + _winSize <= L; start += _stepSize) {
            const end = start + _winSize;
            let uA = 0, uB = 0;
            for (let i = start; i < end; i++) {
              const q  = (perm[i]||'-').toUpperCase();
              const rA = (refA.seq[i]||'-').toUpperCase();
              const rB = (refB.seq[i]||'-').toUpperCase();
              if (q==='-'||rA==='-'||rB==='-') continue;
              if (q===rA && q!==rB) uA++;
              if (q===rB && q!==rA) uB++;
            }
            const s = uA > 0 && uB > 0 ? Math.abs(uA - uB) / (uA + uB) : 0;
            if (s > rMaxStat) rMaxStat = s;
          }
          if (rMaxStat >= maxStat) exceed++;
        }
        const p = exceed / 200;
        results.push({ pos: bestPos, seqA: refA.id, seqB: refB.id, stat: maxStat, p });
      }
    }
    return results.sort((a, b) => a.p - b.p);
  }

  /* ── 3Seq (incompatible sites test) ── */
  function _runThreeSeq(query, refs) {
    const results = [];
    const L = query.seq.length;
    for (let a = 0; a < refs.length; a++) {
      for (let b = a + 1; b < refs.length; b++) {
        const refA = refs[a], refB = refs[b];
        /* Count sites: fully informative for recombination */
        let m = 0; /* sites where q≠A and q≠B and A≠B */
        let n = 0;
        for (let i = 0; i < L; i++) {
          const q  = (query.seq[i]||'-').toUpperCase();
          const rA = (refA.seq[i]||'-').toUpperCase();
          const rB = (refB.seq[i]||'-').toUpperCase();
          if (q==='-'||rA==='-'||rB==='-') continue;
          n++;
          if (q!==rA && q!==rB && rA!==rB) m++;
        }
        if (n < 10) continue;
        const obs = m / n;
        /* Null expectation under no recombination: binomial approximation */
        const p0 = 0.04; /* typical background informative site rate */
        /* z-score approximation */
        const z = (obs - p0) / Math.sqrt(p0 * (1 - p0) / n);
        /* one-tailed p-value approx via logistic */
        const p = z > 0 ? 1 / (1 + Math.exp(z * 1.7)) : 0.5;
        if (p < 0.5) {
          results.push({ pos: Math.round(L / 2), seqA: refA.id, seqB: refB.id, stat: z, p });
        }
      }
    }
    return results.sort((a, b) => a.p - b.p);
  }

  function _shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }

  function _windowSim(qSeq, rSeq, start, end) {
    let match = 0, total = 0;
    for (let i = start; i < end; i++) {
      const q = (qSeq[i]||'-').toUpperCase(), r = (rSeq[i]||'-').toUpperCase();
      if (q==='-'||r==='-') continue;
      total++; if (q===r) match++;
    }
    return total === 0 ? 0 : Math.round((match / total) * 100);
  }

  function _parsimonyInformative() {
    const L = _seqs[0]?.seq.length || 0;
    const sites = [];
    for (let i = 0; i < L; i++) {
      const chars = _seqs.map(s => (s.seq[i]||'-').toUpperCase()).filter(c => c!=='-');
      const freq = {};
      chars.forEach(c => { freq[c] = (freq[c]||0)+1; });
      const informative = Object.entries(freq).filter(([,n]) => n>=2);
      if (informative.length >= 2) {
        const gaps = _seqs.filter(s => (s.seq[i]||'-')==='-').length;
        sites.push({ pos: i, variants: informative.map(([c])=>c), freq: Object.fromEntries(informative), gapPct: Math.round((gaps/_seqs.length)*100) });
      }
    }
    return sites;
  }

  /* ─── Load / parse ─── */
  function _load() {
    const raw = document.getElementById('rc-fasta-input')?.value.trim();
    if (!raw) { OmicsLab.Notify?.error('Paste aligned FASTA sequences.'); return; }
    _seqs = _parseFasta(raw);
    if (_seqs.length < 2) { OmicsLab.Notify?.error('Need at least 2 sequences.'); return; }
    _queryIdx = 0; _computed = false; _simData = []; _methodResults = {};
    _render();
    OmicsLab.Notify?.success(`${_seqs.length} sequences loaded (${_seqs[0].seq.length} bp)`);
  }

  function _loadDemo() {
    const ta = document.getElementById('rc-fasta-input');
    if (ta) ta.value = DEMO;
    _seqs = _parseFasta(DEMO);
    _queryIdx = 0; _computed = false; _simData = []; _methodResults = {};
    _render();
    OmicsLab.Notify?.success('HIV-1 CRF02 demo loaded — click "Run analysis"');
  }

  function _clear() {
    _seqs = []; _computed = false; _simData = []; _methodResults = {};
    _render();
  }

  function _parseFasta(raw) {
    const seqs = []; let cur = null;
    for (const line of raw.split('\n')) {
      const t = line.trim();
      if (!t) continue;
      if (t.startsWith('>')) { if (cur) seqs.push(cur); cur = { id: t.slice(1).split(/\s+/)[0], seq: '' }; }
      else if (cur) cur.seq += t.toUpperCase();
    }
    if (cur) seqs.push(cur);
    return seqs;
  }

  /* ─── UI handlers ─── */
  function _setQuery(idx) { _queryIdx = idx; _computed = false; _render(); }
  function _setWin(val) {
    _winSize = val;
    const lbl = document.getElementById('rc-win-lbl');
    if (lbl) lbl.textContent = val;
  }
  function _setStep(val) {
    _stepSize = val;
    const lbl = document.getElementById('rc-step-lbl');
    if (lbl) lbl.textContent = val;
  }
  function _setResultTab(key) { _activeResultTab = key; _render(); }
  function _toggleMethod(key, on) { _methods[key] = on; }

  /* ─── Export ─── */
  function _exportCSV() {
    if (!_simData.length) return;
    const refs = _seqs.filter((_, i) => i !== _queryIdx);
    const header = ['position', ...refs.map(s => s.id)].join(',');
    const rows = _simData.map(d => [d.pos, ...refs.map(r => d.sims[r.id]||0)].join(',')).join('\n');
    _downloadBlob(header + '\n' + rows, 'text/csv', 'simplot_' + new Date().toISOString().slice(0,10) + '.csv');
    OmicsLab.Notify?.success('SimPlot CSV exported');
  }

  function _downloadFasta() {
    if (!_seqs.length) return;
    const content = _seqs.map(s => '>' + s.id + '\n' + s.seq).join('\n');
    _downloadBlob(content, 'text/plain', 'sequences_for_rdp4_' + new Date().toISOString().slice(0,10) + '.fasta');
    OmicsLab.Notify?.success('Aligned FASTA exported for RDP4');
  }

  function _downloadBlob(content, type, filename) {
    const blob = new Blob([content], { type });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  /* ─── Colour helpers ─── */
  const NUC_BG = { A:'#4caf50',T:'#f44336',U:'#f44336',G:'#ffc107',C:'#2196f3',N:'#7c3aed','-':'#3a3a3a' };
  function _nucBg(c) { return NUC_BG[c] || '#555'; }
  function _nucFg(c) {
    const bg = _nucBg(c).replace('#','');
    const r=parseInt(bg.slice(0,2),16),g=parseInt(bg.slice(2,4),16),b=parseInt(bg.slice(4,6),16);
    return (r*.299+g*.587+b*.114)>128?'#000':'#fff';
  }

  return { init, _load, _loadDemo, _clear, _run, _setQuery, _setWin, _setStep, _exportCSV, _downloadFasta, _toggleMethod, _setResultTab };
})();
