/* ═══════════════════════════════════════════════════════
   OmicsLab — Codon Usage Analyser (Part 3)
   Analyses codon usage frequencies and RSCU values from
   a DNA/mRNA sequence. Compares against H. sapiens,
   M. tuberculosis, and P. falciparum reference tables.
   Fully offline — no API needed.
   ═══════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.CodonUsage = (function () {

  /* Standard genetic code — codon → amino acid */
  const GENETIC_CODE = {
    TTT:'Phe',TTC:'Phe',TTA:'Leu',TTG:'Leu',
    CTT:'Leu',CTC:'Leu',CTA:'Leu',CTG:'Leu',
    ATT:'Ile',ATC:'Ile',ATA:'Ile',ATG:'Met',
    GTT:'Val',GTC:'Val',GTA:'Val',GTG:'Val',
    TCT:'Ser',TCC:'Ser',TCA:'Ser',TCG:'Ser',
    CCT:'Pro',CCC:'Pro',CCA:'Pro',CCG:'Pro',
    ACT:'Thr',ACC:'Thr',ACA:'Thr',ACG:'Thr',
    GCT:'Ala',GCC:'Ala',GCA:'Ala',GCG:'Ala',
    TAT:'Tyr',TAC:'Tyr',TAA:'Stop',TAG:'Stop',
    CAT:'His',CAC:'His',CAA:'Gln',CAG:'Gln',
    AAT:'Asn',AAC:'Asn',AAA:'Lys',AAG:'Lys',
    GAT:'Asp',GAC:'Asp',GAA:'Glu',GAG:'Glu',
    TGT:'Cys',TGC:'Cys',TGA:'Stop',TGG:'Trp',
    CGT:'Arg',CGC:'Arg',CGA:'Arg',CGG:'Arg',
    AGT:'Ser',AGC:'Ser',AGA:'Arg',AGG:'Arg',
    GGT:'Gly',GGC:'Gly',GGA:'Gly',GGG:'Gly',
  };

  /* RSCU reference values for 3 organisms (selected codons) */
  /* Source: Codon Usage Database (kazusa.or.jp) */
  const RSCU_REF = {
    human: {
      CTG:1.95,CTC:1.34,TTG:0.55,TTA:0.28,CTT:0.55,CTA:0.28,
      ATG:1.0,ATC:1.65,ATT:0.76,ATA:0.59,
      GTG:1.52,GTC:0.85,GTT:0.59,GTA:0.44,
      CAG:1.72,CAA:0.28,GAG:1.44,GAA:0.56,
      AAG:1.30,AAA:0.70,AGG:1.35,AGA:1.35,CGG:0.88,CGC:0.78,CGT:0.27,CGA:0.38,
      GGG:0.80,GGC:1.06,GGA:0.84,GGT:0.30,
      CCG:0.29,CCC:1.38,CCA:1.12,CCT:1.21,
      ACG:0.37,ACC:1.47,ACA:1.12,ACT:0.84,
      GCG:0.30,GCC:1.52,GCA:0.92,GCT:1.26,
      TCG:0.30,TCC:1.41,TCA:0.88,TCT:1.10,AGC:1.81,AGT:0.80,
      TAC:1.40,TAT:0.60,CAC:1.22,CAT:0.78,TGC:1.42,TGT:0.58,
      GAC:1.32,GAT:0.68,AAC:1.32,AAT:0.68,
    },
    mtb: {
      CTG:2.40,CTC:1.50,TTG:0.10,TTA:0.05,CTT:0.08,CTA:0.05,
      ATG:1.0,ATC:2.10,ATT:0.55,ATA:0.25,
      GTG:1.40,GTC:1.80,GTT:0.30,GTA:0.20,
      CAG:1.80,CAA:0.20,GAG:1.65,GAA:0.35,
      AAG:1.45,AAA:0.55,AGG:0.30,AGA:0.10,CGG:1.45,CGC:1.80,CGT:0.80,CGA:0.35,
      GGG:0.60,GGC:2.00,GGA:0.42,GGT:0.80,
      CCG:1.80,CCC:0.95,CCA:0.80,CCT:0.35,
      ACG:1.70,ACC:1.60,ACA:0.35,ACT:0.25,
      GCG:2.05,GCC:1.50,GCA:0.30,GCT:0.15,
      TCG:1.60,TCC:1.20,TCA:0.30,TCT:0.20,AGC:1.90,AGT:0.40,
      TAC:1.60,TAT:0.40,CAC:1.58,CAT:0.42,TGC:1.65,TGT:0.35,
      GAC:1.45,GAT:0.55,AAC:1.55,AAT:0.45,
    },
    pfalciparum: {
      CTG:0.30,CTC:0.30,TTG:1.50,TTA:2.85,CTT:2.10,CTA:0.95,
      ATG:1.0,ATC:0.38,ATT:2.15,ATA:1.47,
      GTG:0.45,GTC:0.30,GTT:2.45,GTA:0.80,
      CAG:0.35,CAA:1.65,GAG:0.55,GAA:1.45,
      AAG:0.45,AAA:1.55,AGG:0.20,AGA:0.25,CGG:0.25,CGC:0.12,CGT:0.80,CGA:0.50,
      GGG:0.35,GGC:0.30,GGA:0.50,GGT:2.85,
      CCG:0.18,CCC:0.35,CCA:1.65,CCT:1.82,
      ACG:0.25,ACC:0.40,ACA:1.60,ACT:1.75,
      GCG:0.30,GCC:0.45,GCA:1.20,GCT:2.05,
      TCG:0.25,TCC:0.38,TCA:1.25,TCT:1.65,AGC:0.95,AGT:1.52,
      TAC:0.42,TAT:1.58,CAC:0.40,CAT:1.60,TGC:0.55,TGT:1.45,
      GAC:0.48,GAT:1.52,AAC:0.42,AAT:1.58,
    },
  };

  /* Group synonymous codons */
  const SYN_GROUPS = {};
  for (const [codon, aa] of Object.entries(GENETIC_CODE)) {
    if (!SYN_GROUPS[aa]) SYN_GROUPS[aa] = [];
    SYN_GROUPS[aa].push(codon);
  }

  function _analyse(seq) {
    const clean = seq.toUpperCase().replace(/[^ATCGU]/g,'').replace(/U/g,'T');
    if (clean.length < 3) return null;
    const counts = {};
    for (let i = 0; i + 2 < clean.length; i += 3) {
      const codon = clean.slice(i, i + 3);
      if (GENETIC_CODE[codon]) counts[codon] = (counts[codon] || 0) + 1;
    }
    const total = Object.values(counts).reduce((s, n) => s + n, 0);
    /* RSCU = observed / expected (expected = 1/synonyms) */
    const rscu = {};
    for (const [aa, codons] of Object.entries(SYN_GROUPS)) {
      if (aa === 'Stop') continue;
      const groupTotal = codons.reduce((s, c) => s + (counts[c] || 0), 0);
      const n = codons.length;
      for (const c of codons) {
        const obs = counts[c] || 0;
        rscu[c] = groupTotal > 0 ? (obs * n) / groupTotal : 0;
      }
    }
    /* GC content */
    const gc = (clean.split('').filter(b => b === 'G' || b === 'C').length / clean.length * 100);
    /* GC3 — GC at third codon position */
    let gc3bases = 0, gc3total = 0;
    for (let i = 2; i < clean.length; i += 3) {
      gc3total++;
      if (clean[i] === 'G' || clean[i] === 'C') gc3bases++;
    }
    const gc3 = gc3total ? gc3bases / gc3total * 100 : 0;
    return { counts, rscu, total, gc, gc3, len: clean.length };
  }

  /* ─── Render ─── */
  function _run() {
    const seq = (document.getElementById('cu-seq')?.value || '').trim();
    if (!seq) return;
    const result = _analyse(seq);
    if (!result) { _showError('Sequence too short — need at least 3 nucleotides.'); return; }
    _renderResult(result);
  }

  function _showError(msg) {
    const out = document.getElementById('cu-output');
    if (out) out.innerHTML = `<div class="cu-error">${msg}</div>`;
  }

  function _renderResult(r) {
    const out = document.getElementById('cu-output');
    if (!out) return;

    const refOpt = document.getElementById('cu-ref')?.value || 'human';
    const refRscu = RSCU_REF[refOpt] || {};

    /* Sort codons by AA then by RSCU desc */
    const rows = Object.entries(r.rscu)
      .filter(([c]) => GENETIC_CODE[c] && GENETIC_CODE[c] !== 'Stop')
      .sort((a, b) => {
        const aaA = GENETIC_CODE[a[0]], aaB = GENETIC_CODE[b[0]];
        return aaA < aaB ? -1 : aaA > aaB ? 1 : b[1] - a[1];
      });

    const tableRows = rows.map(([codon, rscuVal]) => {
      const aa = GENETIC_CODE[codon];
      const cnt = r.counts[codon] || 0;
      const freq = r.total > 0 ? (cnt / r.total * 1000).toFixed(1) : '0.0';
      const refVal = refRscu[codon];
      const diff = refVal !== undefined ? (rscuVal - refVal).toFixed(2) : '—';
      const diffColor = refVal !== undefined ? (rscuVal > refVal ? '#ff6b6b' : '#00C4A0') : '#354060';
      const bar = Math.min(rscuVal / 2 * 100, 100);
      return `<tr>
        <td class="cu-codon">${codon}</td>
        <td class="cu-aa">${aa}</td>
        <td class="cu-count">${cnt}</td>
        <td class="cu-freq">${freq}</td>
        <td><div class="cu-rscu-cell"><div class="cu-rscu-bar-wrap"><div class="cu-rscu-bar" style="width:${bar}%;background:${rscuVal > 1 ? '#58a6ff' : '#243048'}"></div></div><span class="cu-rscu-val">${rscuVal.toFixed(2)}</span></div></td>
        <td style="color:${diffColor};font-size:.75rem">${diff}</td>
      </tr>`;
    }).join('');

    out.innerHTML = `
      <div class="cu-summary-strip">
        <div class="cu-stat"><span class="cu-stat-val">${r.len.toLocaleString()}</span><span class="cu-stat-lbl">nt length</span></div>
        <div class="cu-stat"><span class="cu-stat-val">${r.total}</span><span class="cu-stat-lbl">codons</span></div>
        <div class="cu-stat"><span class="cu-stat-val">${r.gc.toFixed(1)}%</span><span class="cu-stat-lbl">GC content</span></div>
        <div class="cu-stat"><span class="cu-stat-val">${r.gc3.toFixed(1)}%</span><span class="cu-stat-lbl">GC3 content</span></div>
        <button class="cu-export-btn" onclick="OmicsLab.CodonUsage._exportCsv()">Export CSV</button>
      </div>
      <div class="cu-table-wrap">
        <table class="cu-table">
          <thead><tr><th>Codon</th><th>AA</th><th>Count</th><th>Freq/1000</th><th>RSCU</th><th>vs ${refOpt.toUpperCase()}</th></tr></thead>
          <tbody>${tableRows}</tbody>
        </table>
      </div>`;
    _lastResult = r;
  }

  let _lastResult = null;

  function _exportCsv() {
    if (!_lastResult) return;
    const rows = [['Codon','AminoAcid','Count','Freq_per_1000','RSCU']];
    for (const [codon, rscuVal] of Object.entries(_lastResult.rscu)) {
      const aa = GENETIC_CODE[codon] || '';
      const cnt = _lastResult.counts[codon] || 0;
      const freq = (_lastResult.total > 0 ? cnt / _lastResult.total * 1000 : 0).toFixed(1);
      rows.push([codon, aa, cnt, freq, rscuVal.toFixed(3)]);
    }
    const csv = rows.map(r => r.join(',')).join('\n');
    const a = document.createElement('a');
    a.href = 'data:text/csv,' + encodeURIComponent(csv);
    a.download = 'codon_usage.csv';
    a.click();
  }

  const EXAMPLE_HBB = 'ATGGTGCACCTGACTCCTGAGGAGAAGTCTGCCGTTACTGCCCTGTGGGGCAAGGTGAACGTGGATGAAGTTGGTGGTGAGGCCCTGGGCAGGCTGCTGGTGGTCTACCCTTGGACCCAGAGGTTCTTTGAGTCCTTTGGGGATCTGTCCACTCCTGATGCTGTTATGGGCAACCCTAAGGTGAAGGCTCATGGCAAGAAAGTGCTCGGTGCCTTTAGTGATGGCCTGGCTCACCTGGACAACCTCAAGGGCACCTTTGCCACACTGAGTGAGCTGCACTGTGACAAGCTGCACGTGGATCCTGAGAACTTCAGG';

  function init() {
    const section = document.getElementById('codon-section');
    if (!section || section.dataset.cuReady) return;
    section.dataset.cuReady = '1';
    section.innerHTML = `
      <div class="cu-wrap">
        <div class="cu-header">
          <div class="cu-header-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00C4A0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
            Codon Usage Analyser
          </div>
          <div class="cu-header-sub">RSCU analysis, GC content, per-organism comparison — fully offline</div>
        </div>
        <div class="cu-layout">
          <div class="cu-left">
            <div class="cu-input-panel">
              <div class="cu-input-label">DNA / mRNA sequence (paste raw sequence or FASTA)</div>
              <textarea id="cu-seq" class="cu-textarea" rows="8" placeholder="Paste a coding sequence (CDS) in DNA or RNA format...&#10;ATGGTGCACCTGACT..."></textarea>
              <div class="cu-input-controls">
                <select class="cu-ref-select" id="cu-ref">
                  <option value="human">Compare vs H. sapiens</option>
                  <option value="mtb">Compare vs M. tuberculosis</option>
                  <option value="pfalciparum">Compare vs P. falciparum</option>
                </select>
                <button class="cu-run-btn" onclick="OmicsLab.CodonUsage._run()">Analyse</button>
                <button class="cu-ex-btn" onclick="OmicsLab.CodonUsage._loadEx()">Load HBB example</button>
              </div>
            </div>
            <div class="cu-info-box">
              <div class="cu-info-title">What is RSCU?</div>
              <div class="cu-info-text">Relative Synonymous Codon Usage (RSCU) measures how often a codon is used relative to the expected equal usage among synonymous codons. RSCU = 1.0 means equal usage; >1.0 means the codon is preferred; <1.0 means it is avoided. Values >1.5 or <0.5 indicate strong bias.</div>
            </div>
          </div>
          <div class="cu-right" id="cu-output">
            <div class="cu-empty">Paste a coding sequence and click Analyse</div>
          </div>
        </div>
      </div>`;
  }

  function _loadEx() {
    const ta = document.getElementById('cu-seq');
    if (ta) { ta.value = EXAMPLE_HBB; _run(); }
  }

  return { init, _run, _exportCsv, _loadEx };
})();
