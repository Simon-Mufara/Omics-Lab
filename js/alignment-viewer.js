/* ═══════════════════════════════════════════════════════════════
   OmicsLab — Multiple Sequence Alignment Viewer
   AliView-equivalent: FASTA input, colour-coded nucleotides,
   conservation row, position ruler, column stats
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.AlignmentViewer = (function () {

  /* ─── State ─── */
  let _seqs = [];          // [{id, seq}]
  let _coloured = true;
  let _showRuler = true;
  let _showCons = true;
  let _fontSize = 12;
  let _highlight = '';     // 'identical' | 'conserved' | '' = all chars
  let _selCol = null;      // column index for stats panel
  const MAX_DISPLAY = 10000; // max columns rendered (for perf)

  /* ─── Nucleotide / AA colour palettes ─── */
  const NUC_COLOR = {
    A: '#4caf50', T: '#f44336', U: '#f44336',
    G: '#ffc107', C: '#2196f3', '-': '#3a3a3a',
    N: '#7c3aed', R: '#00bcd4', Y: '#ff9800',
    S: '#9c27b0', W: '#795548', K: '#607d8b',
    M: '#e91e63', B: '#ff5722', D: '#8bc34a',
    H: '#03a9f4', V: '#673ab7',
  };
  const AA_COLOR = {
    A:'#a0a0a0',R:'#3366cc',N:'#cc99ff',D:'#ff3300',C:'#ffff00',
    Q:'#cc99ff',E:'#ff3300',G:'#a0a0a0',H:'#3366cc',I:'#00cc00',
    L:'#00cc00',K:'#3366cc',M:'#00cc00',F:'#00cc00',P:'#ffaa00',
    S:'#ff6699',T:'#ff6699',W:'#00cc00',Y:'#00cc00',V:'#00cc00',
    '-':'#3a3a3a','*':'#666666',
  };
  const DEMO_FASTA = `>AF_HIV1_ZA_001
ATGGAGCCAGTAGATCCTAGA-CTAGAGCCCTGGAAGCATCCAGGAAGTCAGCCTAAAACTGCTTGTACCAATTGCTATT
>AF_HIV1_KE_002
ATGGAGCCAGTAGATCCTAGAACTAGAGCCCTGGAAGCATCCAGGAAGTCAGCCTAAAACTGCTTGTACCAATTGCTATT
>AF_HIV1_NG_003
ATGGAGCCAGTAGATCCTAGA-CTAGAGCCCTGGAAACATCCAGGAAGTCAGCCTAAAACTGCTTGTACGAATTGCTATT
>REF_HIV1_HXB2
ATGGAGCCAGTAGATCCTAGA-CTAGAGCCCTGGAAGCATCCAGGAAGTCAGCCTAAAACTGCTTGTACCAATTGCTATT`;

  /* ─── Init ─── */
  function init() {
    const section = document.getElementById('alignment-viewer-section');
    if (!section) return;
    if (section.dataset.avReady) { _render(); return; }
    section.dataset.avReady = '1';
    _render();
  }

  /* ─── Master render ─── */
  function _render() {
    const section = document.getElementById('alignment-viewer-section');
    if (!section) return;

    section.innerHTML = `
    <div class="av-page">
      <div class="av-header">
        <div class="av-badge">ALIGNMENT VIEWER</div>
        <h1 class="av-title">Multiple Sequence Alignment</h1>
        <p class="av-sub">Paste aligned FASTA sequences to visualise and analyse a multiple sequence alignment. Colour-coded by nucleotide or amino acid. Supports DNA, RNA, and protein alignments.</p>
      </div>

      <!-- Input panel -->
      <div class="av-input-panel" id="av-input-panel">
        <div class="av-input-hdr">
          <span class="av-input-title">Input</span>
          <button class="av-btn-demo" onclick="OmicsLab.AlignmentViewer._loadDemo()">Load demo (HIV-1 Africa)</button>
          <button class="av-btn-clear" onclick="OmicsLab.AlignmentViewer._clear()">Clear</button>
        </div>
        <textarea class="av-fasta-input" id="av-fasta-input" spellcheck="false"
          placeholder="Paste aligned FASTA sequences here…
All sequences must be the same length (already aligned).
Gaps represented as '-' characters.
Example:
&gt;Sequence1
ATGCGTACG---TTAGCCAT
&gt;Sequence2
ATGCGTACGATTTTAGCCAT">${_seqs.length ? '>' + _seqs.map(s => s.id + '\n' + s.seq).join('\n>') : ''}</textarea>
        <button class="av-btn-load" onclick="OmicsLab.AlignmentViewer._load()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>
          Visualise alignment
        </button>
      </div>

      ${_seqs.length > 0 ? _renderViewer() : ''}
    </div>`;
  }

  /* ─── Viewer panel ─── */
  function _renderViewer() {
    const len = _seqs[0]?.seq.length || 0;
    const truncated = len > MAX_DISPLAY;

    return `
    <!-- Toolbar -->
    <div class="av-toolbar">
      <div class="av-toolbar-left">
        <button class="av-tool-btn ${_coloured ? 'active' : ''}" onclick="OmicsLab.AlignmentViewer._toggle('coloured')" title="Toggle colour">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
          Colour
        </button>
        <button class="av-tool-btn ${_showCons ? 'active' : ''}" onclick="OmicsLab.AlignmentViewer._toggle('cons')" title="Toggle conservation">
          Conservation
        </button>
        <button class="av-tool-btn ${_showRuler ? 'active' : ''}" onclick="OmicsLab.AlignmentViewer._toggle('ruler')" title="Toggle ruler">
          Ruler
        </button>
        <label class="av-font-ctrl">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>
          <input type="range" min="8" max="18" value="${_fontSize}" step="1"
            oninput="OmicsLab.AlignmentViewer._setFont(+this.value)"/>
          <span id="av-font-val">${_fontSize}px</span>
        </label>
      </div>
      <div class="av-toolbar-right">
        <div class="av-stats-chip">${_seqs.length} sequences · ${len} columns</div>
        <button class="av-btn-export-fa" onclick="OmicsLab.AlignmentViewer._exportFasta()">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Export FASTA
        </button>
      </div>
    </div>

    <!-- Alignment grid + stats panel -->
    <div class="av-viewer-wrap">
      <div class="av-grid-wrap" id="av-grid-wrap">
        ${truncated ? `<div class="av-trunc-notice">Showing first ${MAX_DISPLAY} of ${len} columns for performance.</div>` : ''}
        ${_buildGrid()}
      </div>
      ${_selCol !== null ? _buildColStats() : '<div class="av-stats-placeholder">Click a column to see statistics</div>'}
    </div>

    <!-- Conservation chart -->
    ${_showCons ? _buildConsChart() : ''}`;
  }

  /* ─── Build the alignment grid ─── */
  function _buildGrid() {
    if (!_seqs.length) return '';
    const seqLen = Math.min(_seqs[0].seq.length, MAX_DISPLAY);
    const isNuc = _detectNuc();
    const palette = isNuc ? NUC_COLOR : AA_COLOR;

    /* Build ruler row */
    let rulerRow = '';
    if (_showRuler) {
      let ticks = '';
      for (let i = 0; i < seqLen; i++) {
        if (i % 10 === 0) ticks += `<span class="av-tick">${i + 1}</span>`;
        else ticks += '<span class="av-tick-empty"> </span>';
      }
      rulerRow = `<div class="av-row av-ruler-row"><div class="av-seq-id av-ruler-id">Position</div><div class="av-ruler">${ticks}</div></div>`;
    }

    /* Build sequence rows */
    const rows = _seqs.map(seq => {
      let cells = '';
      for (let i = 0; i < seqLen; i++) {
        const ch = (seq.seq[i] || ' ').toUpperCase();
        const bg = _coloured ? (palette[ch] || '#555') : 'transparent';
        const isIdent = _isIdentical(i);
        const isCons  = _isConserved(i);
        const opacity = _highlight === 'identical' ? (isIdent ? '1' : '0.18') :
                        _highlight === 'conserved' ? (isCons  ? '1' : '0.25') : '1';
        const cellStyle = _coloured
          ? `background:${bg};color:${_textContrast(bg)};opacity:${opacity}`
          : `opacity:${opacity}`;
        cells += `<span class="av-cell" data-col="${i}" style="${cellStyle}"
          onclick="OmicsLab.AlignmentViewer._clickCol(${i})">${ch}</span>`;
      }
      return `<div class="av-row"><div class="av-seq-id" title="${seq.id}">${seq.id}</div><div class="av-seq">${cells}</div></div>`;
    }).join('');

    /* Build conservation row */
    let consRow = '';
    if (_showCons) {
      let bars = '';
      for (let i = 0; i < seqLen; i++) {
        const pct = _conservationPct(i);
        const ch = pct === 100 ? '*' : pct >= 80 ? ':' : pct >= 60 ? '.' : ' ';
        const col = pct === 100 ? '#00C4A0' : pct >= 80 ? '#58a6ff' : pct >= 60 ? '#e3b341' : '#333';
        bars += `<span class="av-cell av-cons-cell" style="color:${col};background:transparent">${ch}</span>`;
      }
      consRow = `<div class="av-row av-cons-row"><div class="av-seq-id" style="color:#6E6860">Conservation</div><div class="av-seq">${bars}</div></div>`;
    }

    return `<div class="av-grid" style="font-size:${_fontSize}px">${rulerRow}${rows}${consRow}</div>`;
  }

  /* ─── Column statistics panel ─── */
  function _buildColStats() {
    const col = _selCol;
    const chars = _seqs.map(s => (s.seq[col] || '-').toUpperCase());
    const freq = {};
    chars.forEach(c => { freq[c] = (freq[c] || 0) + 1; });
    const total = chars.length;
    const rows = Object.entries(freq).sort((a, b) => b[1] - a[1]).map(([c, n]) => {
      const pct = ((n / total) * 100).toFixed(1);
      return `<div class="av-stat-row"><span class="av-stat-char">${c}</span><div class="av-stat-bar"><div style="width:${pct}%;background:${NUC_COLOR[c] || '#555'}"></div></div><span class="av-stat-val">${n} (${pct}%)</span></div>`;
    }).join('');
    return `<div class="av-col-stats">
      <div class="av-cs-title">Column ${col + 1} stats</div>
      ${rows}
      <div class="av-cs-meta">Gap fraction: ${((freq['-'] || 0) / total * 100).toFixed(1)}%</div>
      <div class="av-cs-meta">Conservation: ${_conservationPct(col)}%</div>
    </div>`;
  }

  /* ─── Conservation chart (SVG bar chart) ─── */
  function _buildConsChart() {
    const seqLen = Math.min((_seqs[0]?.seq.length || 0), MAX_DISPLAY);
    if (!seqLen) return '';

    /* sample every N columns to keep SVG small */
    const SAMPLE = Math.max(1, Math.floor(seqLen / 500));
    const bars = [];
    for (let i = 0; i < seqLen; i += SAMPLE) {
      bars.push({ pos: i, pct: _conservationPct(i) });
    }
    const W = 900, H = 60, barW = Math.max(1, W / bars.length);

    const rects = bars.map((b, idx) => {
      const h = (b.pct / 100) * H;
      const fill = b.pct === 100 ? '#00C4A0' : b.pct >= 80 ? '#58a6ff' : b.pct >= 60 ? '#e3b341' : '#243048';
      return `<rect x="${idx * barW}" y="${H - h}" width="${barW}" height="${h}" fill="${fill}" opacity="0.85"/>`;
    }).join('');

    return `<div class="av-cons-chart">
      <div class="av-cc-title">Conservation profile <span class="av-cc-legend"><span style="background:#00C4A0"></span>100% <span style="background:#58a6ff"></span>≥80% <span style="background:#e3b341"></span>≥60% <span style="background:#243048"></span>&lt;60%</span></div>
      <svg viewBox="0 0 ${W} ${H}" width="100%" height="${H}" preserveAspectRatio="none">${rects}</svg>
    </div>`;
  }

  /* ─── Load / parse ─── */
  function _load() {
    const raw = document.getElementById('av-fasta-input')?.value.trim();
    if (!raw) { OmicsLab.Notify?.error('Please paste aligned FASTA sequences first.'); return; }
    const parsed = _parseFasta(raw);
    if (parsed.length < 2) { OmicsLab.Notify?.error('Please provide at least 2 sequences.'); return; }
    const firstLen = parsed[0].seq.length;
    const unaligned = parsed.filter(s => s.seq.replace(/-/g, '').length !== s.seq.replace(/-/g, '').length);
    /* allow different lengths — user may not have aligned yet */
    _seqs = parsed;
    _selCol = null;
    _render();
    OmicsLab.Notify?.success(`Loaded ${parsed.length} sequences (${firstLen} columns)`);
  }

  function _loadDemo() {
    document.getElementById('av-fasta-input').value = DEMO_FASTA;
    const parsed = _parseFasta(DEMO_FASTA);
    _seqs = parsed;
    _selCol = null;
    _render();
    OmicsLab.Notify?.success('Demo loaded: HIV-1 env sequences from Africa');
  }

  function _clear() {
    _seqs = [];
    _selCol = null;
    _render();
  }

  function _parseFasta(raw) {
    const seqs = [];
    let cur = null;
    for (const line of raw.split('\n')) {
      const t = line.trim();
      if (!t) continue;
      if (t.startsWith('>')) {
        if (cur) seqs.push(cur);
        cur = { id: t.slice(1).split(/\s+/)[0], seq: '' };
      } else if (cur) {
        cur.seq += t.toUpperCase();
      }
    }
    if (cur) seqs.push(cur);
    return seqs;
  }

  /* ─── Analysis helpers ─── */
  function _conservationPct(col) {
    if (!_seqs.length) return 0;
    const chars = _seqs.map(s => (s.seq[col] || '-').toUpperCase());
    const gaps = chars.filter(c => c === '-').length;
    const nonGap = chars.filter(c => c !== '-');
    if (!nonGap.length) return 0;
    const mode = nonGap.reduce((a, c, _, arr) =>
      arr.filter(x => x === c).length > arr.filter(x => x === a).length ? c : a, nonGap[0]);
    return Math.round((nonGap.filter(c => c === mode).length / _seqs.length) * 100);
  }

  function _isIdentical(col) { return _conservationPct(col) === 100; }
  function _isConserved(col) { return _conservationPct(col) >= 80; }

  function _detectNuc() {
    const sample = (_seqs[0]?.seq || '').slice(0, 100).toUpperCase();
    const nucChars = new Set(['A','T','G','C','U','N','-','R','Y','S','W','K','M','B','D','H','V']);
    const nucCount = [...sample].filter(c => nucChars.has(c)).length;
    return nucCount / (sample.length || 1) > 0.85;
  }

  function _textContrast(hex) {
    /* simple luminance for readable text */
    if (!hex || hex === 'transparent' || hex.startsWith('rgba')) return '#fff';
    const c = hex.replace('#', '');
    const r = parseInt(c.slice(0, 2), 16);
    const g = parseInt(c.slice(2, 4), 16);
    const b = parseInt(c.slice(4, 6), 16);
    return (r * 0.299 + g * 0.587 + b * 0.114) > 128 ? '#000' : '#fff';
  }

  /* ─── Interactive ─── */
  function _toggle(what) {
    if (what === 'coloured') _coloured = !_coloured;
    if (what === 'cons') _showCons = !_showCons;
    if (what === 'ruler') _showRuler = !_showRuler;
    _render();
  }

  function _setFont(n) {
    _fontSize = n;
    const grid = document.querySelector('.av-grid');
    if (grid) grid.style.fontSize = n + 'px';
    const lbl = document.getElementById('av-font-val');
    if (lbl) lbl.textContent = n + 'px';
  }

  function _clickCol(col) {
    _selCol = _selCol === col ? null : col;
    /* only re-render the stats panel part for speed */
    const wrap = document.querySelector('.av-viewer-wrap');
    if (!wrap) return;
    const statArea = wrap.querySelector('.av-col-stats, .av-stats-placeholder');
    if (statArea) {
      statArea.outerHTML = _selCol !== null ? _buildColStats() : '<div class="av-stats-placeholder">Click a column to see statistics</div>';
    }
  }

  /* ─── Export ─── */
  function _exportFasta() {
    if (!_seqs.length) return;
    const text = _seqs.map(s => `>${s.id}\n${s.seq}`).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'alignment_' + new Date().toISOString().slice(0, 10) + '.fasta';
    a.click();
    URL.revokeObjectURL(a.href);
    OmicsLab.Notify?.success('Alignment exported');
  }

  return { init, _load, _loadDemo, _clear, _toggle, _setFont, _clickCol, _exportFasta };
})();
