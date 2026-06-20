/* ═══════════════════════════════════════════════════════════════
   OmicsLab — WASM Bioinformatics Core (Prompt 51)
   ─ Real bioinformatics operations in the browser
   ─ seqtk-like FASTA/FASTQ subsample & format conversion
   ─ Minimap2-style alignment (pure JS approximation)
   ─ Real-mode vs Simulation-mode toggle for Analysis Studio
   ─ Note: Full WASM binaries not bundled — pure-JS fallback
     that performs real computation on actual sequence data.
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.WasmTools = (function () {

  const MODE_KEY = 'omicslab_wasm_mode';
  let _mode = localStorage.getItem(MODE_KEY) || 'simulation';

  function getMode()       { return _mode; }
  function isRealMode()    { return _mode === 'real'; }
  function setMode(m)      { _mode = m; localStorage.setItem(MODE_KEY, m); }
  function toggleMode()    { setMode(_mode === 'real' ? 'simulation' : 'real'); return _mode; }

  /* ══════════════════════════════════════════════════════════════
     FASTA / FASTQ tools (seqtk-equivalent, pure JS)
     ══════════════════════════════════════════════════════════════ */

  /* ─── Parse FASTQ → array of {id, seq, qual} ─── */
  function parseFASTQ(text) {
    const records = [];
    const lines = text.trim().split(/\r?\n/);
    for (let i = 0; i < lines.length - 3; i += 4) {
      const id   = lines[i].slice(1).trim();
      const seq  = lines[i + 1].trim();
      const qual = lines[i + 3].trim();
      if (id && seq && qual.length === seq.length) records.push({ id, seq, qual });
    }
    return records;
  }

  /* ─── Parse FASTA → array of {id, seq} ─── */
  function parseFASTA(text) {
    const records = [];
    let current = null;
    for (const line of text.trim().split(/\r?\n/)) {
      if (line.startsWith('>')) {
        if (current) records.push(current);
        current = { id: line.slice(1).trim(), seq: '' };
      } else if (current) {
        current.seq += line.trim().toUpperCase();
      }
    }
    if (current) records.push(current);
    return records;
  }

  /* ─── Subsample FASTQ (seqtk sample equivalent) ─── */
  function subsampleFASTQ(text, fraction = 0.1, seed = 42) {
    const records = parseFASTQ(text);
    /* Seeded pseudo-random (LCG) */
    let rng = seed;
    const next = () => { rng = (rng * 1664525 + 1013904223) & 0xffffffff; return (rng >>> 0) / 0xffffffff; };
    const sampled = records.filter(() => next() < fraction);
    return sampled.map(r => `@${r.id}\n${r.seq}\n+\n${r.qual}`).join('\n');
  }

  /* ─── FASTQ → FASTA conversion ─── */
  function fastqToFasta(text) {
    return parseFASTQ(text).map(r => `>${r.id}\n${r.seq}`).join('\n');
  }

  /* ─── Reverse complement ─── */
  function reverseComplement(seq) {
    const comp = { A:'T', T:'A', G:'C', C:'G', N:'N', U:'A', a:'t', t:'a', g:'c', c:'g', n:'n' };
    return seq.split('').reverse().map(b => comp[b] || 'N').join('');
  }

  /* ─── GC content ─── */
  function gcContent(seq) {
    const upper = seq.toUpperCase();
    const gc = (upper.match(/[GC]/g) || []).length;
    return upper.length ? (gc / upper.length * 100).toFixed(1) : '0.0';
  }

  /* ─── N50 calculation ─── */
  function n50(sequences) {
    const lengths = sequences.map(s => s.seq.length).sort((a, b) => b - a);
    const total   = lengths.reduce((s, l) => s + l, 0);
    let cum = 0;
    for (const l of lengths) {
      cum += l;
      if (cum >= total / 2) return l;
    }
    return 0;
  }

  /* ─── Basic QC stats for FASTQ ─── */
  function fastqStats(text) {
    const records = parseFASTQ(text);
    if (!records.length) return null;
    const readLengths = records.map(r => r.seq.length);
    const avgPhred = records.map(r => {
      const q = r.qual.split('').map(c => c.charCodeAt(0) - 33);
      return q.reduce((s, v) => s + v, 0) / q.length;
    });
    const totalBases = readLengths.reduce((s, l) => s + l, 0);
    return {
      reads: records.length,
      totalBases,
      avgLength: Math.round(totalBases / records.length),
      minLength: Math.min(...readLengths),
      maxLength: Math.max(...readLengths),
      avgQ: (avgPhred.reduce((s, v) => s + v, 0) / avgPhred.length).toFixed(1),
      q30Pct: (records.filter(r => {
        const q = r.qual.split('').map(c => c.charCodeAt(0) - 33);
        return q.every(v => v >= 30);
      }).length / records.length * 100).toFixed(1),
      gcContent: gcContent(records.map(r => r.seq).join('')),
    };
  }

  /* ══════════════════════════════════════════════════════════════
     Pairwise alignment (Smith-Waterman, pure JS)
     ══════════════════════════════════════════════════════════════ */

  function smithWaterman(seqA, seqB, opts = {}) {
    const MATCH    = opts.match    || 2;
    const MISMATCH = opts.mismatch || -1;
    const GAP      = opts.gap      || -2;

    const m = seqA.length, n = seqB.length;
    const H = Array.from({ length: m + 1 }, () => new Int16Array(n + 1));
    let maxScore = 0, maxI = 0, maxJ = 0;

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        const diag = H[i-1][j-1] + (seqA[i-1] === seqB[j-1] ? MATCH : MISMATCH);
        const up   = H[i-1][j]   + GAP;
        const left = H[i][j-1]   + GAP;
        H[i][j] = Math.max(0, diag, up, left);
        if (H[i][j] > maxScore) { maxScore = H[i][j]; maxI = i; maxJ = j; }
      }
    }

    /* Traceback */
    let i = maxI, j = maxJ;
    let alignA = '', alignB = '', match = '';
    while (i > 0 && j > 0 && H[i][j] > 0) {
      if (H[i][j] === H[i-1][j-1] + (seqA[i-1] === seqB[j-1] ? MATCH : MISMATCH)) {
        alignA = seqA[i-1] + alignA; alignB = seqB[j-1] + alignB;
        match = (seqA[i-1] === seqB[j-1] ? '|' : '.') + match;
        i--; j--;
      } else if (H[i][j] === H[i-1][j] + GAP) {
        alignA = seqA[i-1] + alignA; alignB = '-' + alignB; match = ' ' + match; i--;
      } else {
        alignA = '-' + alignA; alignB = seqB[j-1] + alignB; match = ' ' + match; j--;
      }
    }

    const identity = (match.split('|').length - 1) / Math.max(alignA.length, 1) * 100;
    return { score: maxScore, alignA, alignB, matchStr: match, identity: identity.toFixed(1), startI: i, startJ: j };
  }

  /* ──────────────────────────────────────────────────
     k-mer based alignment sketch (fast approximation)
     Mimics minimap2 seeding approach without WASM
     ────────────────────────────────────────────────── */
  function kmerSketch(seq, k = 15) {
    const kmers = new Map();
    for (let i = 0; i <= seq.length - k; i++) {
      const km = seq.slice(i, i + k);
      if (!kmers.has(km)) kmers.set(km, []);
      kmers.get(km).push(i);
    }
    return kmers;
  }

  function quickAlign(query, target, k = 15) {
    const qKmers = kmerSketch(query, k);
    const tKmers = kmerSketch(target, k);
    let hits = 0;
    qKmers.forEach((qpos, km) => { if (tKmers.has(km)) hits += Math.min(qpos.length, tKmers.get(km).length); });
    const possible = Math.max(query.length - k + 1, 1);
    const identity = Math.min(100, (hits / possible * 100 * 1.8)).toFixed(1);
    return { hits, possible, identity, aligned: hits > 3 };
  }

  /* ══════════════════════════════════════════════════════════════
     BAM/SAM subset parser (real header + flagstat computation)
     ══════════════════════════════════════════════════════════════ */

  function parseSAMFlagstat(samText) {
    const lines = samText.split(/\r?\n/).filter(l => l && !l.startsWith('@'));
    let total = 0, mapped = 0, paired = 0, properPaired = 0, qcFail = 0, dup = 0;
    for (const line of lines) {
      const cols = line.split('\t');
      if (cols.length < 11) continue;
      const flag = parseInt(cols[1]);
      total++;
      if (flag & 0x4)   { /* unmapped */ } else mapped++;
      if (flag & 0x1)   paired++;
      if (flag & 0x2)   properPaired++;
      if (flag & 0x200) qcFail++;
      if (flag & 0x400) dup++;
    }
    return { total, mapped, unmapped: total - mapped, paired, properPaired, qcFail, dup,
      mappedPct: total ? (mapped / total * 100).toFixed(1) : '0.0' };
  }

  /* ══════════════════════════════════════════════════════════════
     Render mode toggle badge (used in Analysis Studio)
     ══════════════════════════════════════════════════════════════ */

  function renderModeBadge(container, onToggle) {
    const badge = document.createElement('div');
    badge.className = 'wt-mode-badge';
    badge.innerHTML = _badgeHTML();
    badge.querySelector('.wt-toggle').addEventListener('click', () => {
      const newMode = toggleMode();
      badge.innerHTML = _badgeHTML();
      badge.querySelector('.wt-toggle').addEventListener('click', () => location.reload());
      if (onToggle) onToggle(newMode);
    });
    container.prepend(badge);
  }

  function _badgeHTML() {
    const real = isRealMode();
    return `
      <div class="wt-badge ${real ? 'wt-badge--real' : 'wt-badge--sim'}">
        <span class="wt-badge-dot"></span>
        <span class="wt-badge-label">${real ? 'Real Computation' : 'Simulation Mode'}</span>
        <button class="btn btn-ghost btn-xs wt-toggle" title="Toggle computation mode">
          Switch to ${real ? 'Simulation' : 'Real'} Mode
        </button>
      </div>
    `;
  }

  /* ─── Public API ─── */
  return {
    getMode, isRealMode, setMode, toggleMode, renderModeBadge,
    /* FASTA/FASTQ */
    parseFASTQ, parseFASTA, fastqToFasta, subsampleFASTQ, fastqStats,
    reverseComplement, gcContent, n50,
    /* Alignment */
    smithWaterman, quickAlign, kmerSketch,
    /* SAM */
    parseSAMFlagstat,
  };
})();
