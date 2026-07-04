/* ═══════════════════════════════════════════════════════════════
   OmicsLab — Analysis Studio
   Real bioinformatics analysis in the browser. No server needed.

   Modules:
   1. FASTQ QC Analyzer     — per-base quality, Q30, GC, read lengths
   2. FASTA Sequence Tools  — GC, ORFs, translation, reverse complement, restriction sites
   3. VCF Variant Explorer  — SNP/INDEL counts, filter stats, quality distribution
   4. Expression Analyzer   — count matrix → CPM, top genes, basic stats
   5. Alignment Viewer      — coloured multiple sequence alignment
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.Analysis = (function () {

  /* ══════════════════════════════════════════════════════════
     SHARED UTILITIES
     ══════════════════════════════════════════════════════════ */

  function _esc(s) {
    return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }
  function _mean(arr) {
    if (!arr.length) return 0;
    return arr.reduce((a,b) => a+b, 0) / arr.length;
  }
  function _median(arr) {
    if (!arr.length) return 0;
    const s = [...arr].sort((a,b) => a-b);
    const m = Math.floor(s.length/2);
    return s.length % 2 ? s[m] : (s[m-1]+s[m])/2;
  }
  function _phredToProb(q) { return Math.pow(10, -q/10); }

  /* Tiny sparkline bar chart */
  function _barSVG(values, maxVal, width, height, color) {
    if (!values.length) return '';
    const bw = Math.max(1, Math.floor(width / values.length));
    const bars = values.map((v, i) => {
      const h = Math.max(1, Math.round((v / maxVal) * height));
      return `<rect x="${i*bw}" y="${height-h}" width="${bw-0.5}" height="${h}" fill="${color}"/>`;
    }).join('');
    return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">${bars}</svg>`;
  }

  /* Quality color (green→yellow→red by Phred score) */
  function _qualColor(q) {
    if (q >= 30) return '#00C4A0';
    if (q >= 20) return '#e3b341';
    return '#f85149';
  }

  /* Read a file → text */
  function _readFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  /* ══════════════════════════════════════════════════════════
     MODULE 1 — FASTQ QC ANALYZER
     ══════════════════════════════════════════════════════════ */
  const FASTQ = {
    MAX_READS: 50000, /* cap for browser performance */

    _parsePhred(qualStr) {
      return [...qualStr].map(c => c.charCodeAt(0) - 33);
    },

    analyze(text) {
      const lines = text.split('\n');
      const reads = [];
      let i = 0;
      while (i < lines.length && reads.length < this.MAX_READS) {
        const header = lines[i]?.trim();
        const seq    = lines[i+1]?.trim();
        const plus   = lines[i+2]?.trim();
        const qual   = lines[i+3]?.trim();
        if (!header?.startsWith('@') || !seq || plus !== '+' && !plus?.startsWith('+') || !qual) { i++; continue; }
        if (seq.length !== qual.length) { i += 4; continue; }
        reads.push({ seq, qual: this._parsePhred(qual), len: seq.length });
        i += 4;
      }
      if (!reads.length) return null;

      const totalReads = reads.length;
      const lengths    = reads.map(r => r.len);
      const avgLen     = Math.round(_mean(lengths));
      const medLen     = Math.round(_median(lengths));
      const minLen     = Math.min(...lengths);
      const maxLen     = Math.max(...lengths);

      /* Per-position quality */
      const maxPos = Math.min(Math.max(...lengths), 300);
      const posQuals = [];
      for (let p = 0; p < maxPos; p++) {
        const qs = reads.filter(r => r.len > p).map(r => r.qual[p]);
        posQuals.push({ mean: _mean(qs), median: _median(qs) });
      }

      /* Q30 overall */
      let totalBases = 0, q30Bases = 0, q20Bases = 0;
      let gcBases = 0, atBases = 0;
      reads.forEach(r => {
        r.qual.forEach(q => { totalBases++; if (q >= 30) q30Bases++; if (q >= 20) q20Bases++; });
        [...r.seq].forEach(b => {
          const u = b.toUpperCase();
          if (u === 'G' || u === 'C') gcBases++;
          if (u === 'A' || u === 'T') atBases++;
        });
      });
      const q30 = ((q30Bases / totalBases) * 100).toFixed(1);
      const q20 = ((q20Bases / totalBases) * 100).toFixed(1);
      const gc  = ((gcBases / totalBases) * 100).toFixed(1);

      /* Read length distribution (histogram) */
      const lenBuckets = {};
      lengths.forEach(l => { lenBuckets[l] = (lenBuckets[l] || 0) + 1; });
      const lenKeys   = Object.keys(lenBuckets).map(Number).sort((a,b)=>a-b);
      const lenCounts = lenKeys.map(k => lenBuckets[k]);

      /* Per-base GC bias */
      const posGC = [];
      for (let p = 0; p < maxPos; p++) {
        const bases = reads.filter(r => r.len > p).map(r => r.seq[p].toUpperCase());
        const gc_p  = bases.filter(b => b==='G'||b==='C').length / bases.length * 100;
        posGC.push(Math.round(gc_p));
      }

      /* Basic duplication estimate (first 10k seq hashes) */
      const seqSample = reads.slice(0, 10000).map(r => r.seq.slice(0, 50));
      const uniqSample = new Set(seqSample).size;
      const dupRate = ((1 - uniqSample / seqSample.length) * 100).toFixed(1);

      return { totalReads, avgLen, medLen, minLen, maxLen, q30, q20, gc, dupRate, posQuals, posGC, lenKeys, lenCounts, totalBases, truncated: reads.length === this.MAX_READS };
    },

    render(result, containerId) {
      const el = document.getElementById(containerId);
      if (!el) return;
      if (!result) { el.innerHTML = '<div class="az-error">Could not parse FASTQ — check the format (4 lines per read: @header, sequence, +, quality).</div>'; return; }

      const { totalReads, avgLen, medLen, minLen, maxLen, q30, q20, gc, dupRate, posQuals, posGC, lenKeys, lenCounts, truncated } = result;

      /* Per-position quality SVG */
      const pqWidth  = Math.min(posQuals.length, 300);
      const pqHeight = 80;
      const bw       = Math.max(1, Math.floor(pqWidth / posQuals.length));
      const pqBars   = posQuals.map((p, i) => {
        const h  = Math.max(1, Math.round((p.mean / 40) * pqHeight));
        const co = _qualColor(p.mean);
        return `<rect x="${i*bw}" y="${pqHeight-h}" width="${bw-0.5}" height="${h}" fill="${co}" opacity="0.9"/><title>Pos ${i+1}: Q${Math.round(p.mean)}</title>`;
      }).join('');
      const pqSVG = `<svg width="${pqWidth}" height="${pqHeight}" viewBox="0 0 ${pqWidth} ${pqHeight}" style="width:100%;height:${pqHeight}px" xmlns="http://www.w3.org/2000/svg">
        <line x1="0" y1="${pqHeight - (30/40)*pqHeight}" x2="${pqWidth}" y2="${pqHeight - (30/40)*pqHeight}" stroke="#e3b341" stroke-width="0.5" stroke-dasharray="3,2" opacity="0.6"/>
        <line x1="0" y1="${pqHeight - (20/40)*pqHeight}" x2="${pqWidth}" y2="${pqHeight - (20/40)*pqHeight}" stroke="#f85149" stroke-width="0.5" stroke-dasharray="3,2" opacity="0.6"/>
        ${pqBars}
      </svg>`;

      /* Read length histogram SVG */
      const lhMax = Math.max(...lenCounts);
      const lhSVG = lenCounts.length ? _barSVG(lenCounts.slice(0, 60), lhMax, Math.min(lenCounts.length*6, 360), 60, '#58a6ff') : '';

      /* GC per position SVG */
      const gcMax   = 100;
      const gcWidth = Math.min(posGC.length, 300);
      const gcBars  = posGC.map((g, i) => {
        const h = Math.max(1, Math.round((g / gcMax) * 50));
        return `<rect x="${i*Math.max(1,Math.floor(gcWidth/posGC.length))}" y="${50-h}" width="${Math.max(1,Math.floor(gcWidth/posGC.length))-0.5}" height="${h}" fill="#bc8cff" opacity="0.8"/>`;
      }).join('');
      const gcSVG = `<svg width="${gcWidth}" height="50" viewBox="0 0 ${gcWidth} 50" style="width:100%;height:50px" xmlns="http://www.w3.org/2000/svg"><line x1="0" y1="25" x2="${gcWidth}" y2="25" stroke="#bc8cff" stroke-width="0.5" stroke-dasharray="3,2" opacity="0.4"/>${gcBars}</svg>`;

      const q30Color = q30 >= 75 ? 'pass' : q30 >= 50 ? 'warn' : 'fail';
      const gcColor  = (gc >= 40 && gc <= 60) ? 'pass' : 'warn';
      const dupColor = dupRate <= 20 ? 'pass' : dupRate <= 40 ? 'warn' : 'fail';

      el.innerHTML = `
        <div class="az-result">
          ${truncated ? `<div class="az-notice"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg> Analysed first ${(50000).toLocaleString()} reads for browser performance.</div>` : ''}

          <div class="az-stats-grid">
            <div class="az-stat">
              <div class="az-stat-val">${totalReads.toLocaleString()}</div>
              <div class="az-stat-label">Total Reads</div>
            </div>
            <div class="az-stat">
              <div class="az-stat-val az-${q30Color}">${q30}%</div>
              <div class="az-stat-label">Q30 Score</div>
            </div>
            <div class="az-stat">
              <div class="az-stat-val">${q20}%</div>
              <div class="az-stat-label">Q20 Score</div>
            </div>
            <div class="az-stat">
              <div class="az-stat-val az-${gcColor}">${gc}%</div>
              <div class="az-stat-label">GC Content</div>
            </div>
            <div class="az-stat">
              <div class="az-stat-val">${avgLen} bp</div>
              <div class="az-stat-label">Avg Read Length</div>
            </div>
            <div class="az-stat">
              <div class="az-stat-val az-${dupColor}">${dupRate}%</div>
              <div class="az-stat-label">Est. Duplication</div>
            </div>
          </div>

          <div class="az-chart-row">
            <div class="az-chart-box">
              <div class="az-chart-title">Per-Base Sequence Quality
                <span class="az-legend"><span class="az-dot" style="background:#00C4A0"></span>Q≥30</span>
                <span class="az-legend"><span class="az-dot" style="background:#e3b341"></span>Q≥20</span>
                <span class="az-legend"><span class="az-dot" style="background:#f85149"></span>Q&lt;20</span>
              </div>
              <div class="az-chart-area">${pqSVG}</div>
              <div class="az-chart-xlab">Position in read (bp)</div>
            </div>
            <div class="az-chart-box">
              <div class="az-chart-title">Per-Base GC Content <span class="az-legend"><span class="az-dot" style="background:#bc8cff"></span>GC%</span></div>
              <div class="az-chart-area">${gcSVG}</div>
              <div class="az-chart-xlab">Position in read (bp) — 50% line shown</div>
            </div>
          </div>

          <div class="az-chart-row">
            <div class="az-chart-box">
              <div class="az-chart-title">Read Length Distribution</div>
              <div class="az-chart-area">${lhSVG}</div>
              <div class="az-chart-xlab">Length bins: ${minLen}–${maxLen} bp · Median: ${medLen} bp</div>
            </div>
            <div class="az-chart-box">
              <div class="az-chart-title">QC Summary</div>
              <div class="az-qc-table">
                ${[
                  ['Total reads', totalReads.toLocaleString(), ''],
                  ['Q30 (Illumina pass threshold)', q30 + '%', q30 >= 75 ? 'PASS' : 'WARN'],
                  ['Q20', q20 + '%', q20 >= 90 ? 'PASS' : 'WARN'],
                  ['GC content (expected 40–60%)', gc + '%', (gc>=40&&gc<=60)?'PASS':'WARN'],
                  ['Estimated duplication', dupRate + '%', dupRate<=20?'PASS':dupRate<=40?'WARN':'FAIL'],
                  ['Min / Max read length', minLen + ' / ' + maxLen + ' bp', ''],
                  ['Median read length', medLen + ' bp', ''],
                ].map(([k,v,badge]) => `
                  <div class="az-qc-row">
                    <span class="az-qc-key">${k}</span>
                    <span class="az-qc-val">${v}</span>
                    ${badge ? `<span class="az-badge az-badge-${badge.toLowerCase()}">${badge}</span>` : ''}
                  </div>`).join('')}
              </div>
            </div>
          </div>
        </div>`;
    }
  };

  /* ══════════════════════════════════════════════════════════
     MODULE 2 — FASTA SEQUENCE TOOLS
     ══════════════════════════════════════════════════════════ */
  const FASTA = {
    CODON_TABLE: {
      'TTT':'Phe','TTC':'Phe','TTA':'Leu','TTG':'Leu',
      'CTT':'Leu','CTC':'Leu','CTA':'Leu','CTG':'Leu',
      'ATT':'Ile','ATC':'Ile','ATA':'Ile','ATG':'Met*',
      'GTT':'Val','GTC':'Val','GTA':'Val','GTG':'Val',
      'TCT':'Ser','TCC':'Ser','TCA':'Ser','TCG':'Ser',
      'CCT':'Pro','CCC':'Pro','CCA':'Pro','CCG':'Pro',
      'ACT':'Thr','ACC':'Thr','ACA':'Thr','ACG':'Thr',
      'GCT':'Ala','GCC':'Ala','GCA':'Ala','GCG':'Ala',
      'TAT':'Tyr','TAC':'Tyr','TAA':'Stop','TAG':'Stop',
      'CAT':'His','CAC':'His','CAA':'Gln','CAG':'Gln',
      'AAT':'Asn','AAC':'Asn','AAA':'Lys','AAG':'Lys',
      'GAT':'Asp','GAC':'Asp','GAA':'Glu','GAG':'Glu',
      'TGT':'Cys','TGC':'Cys','TGA':'Stop','TGG':'Trp',
      'CGT':'Arg','CGC':'Arg','CGA':'Arg','CGG':'Arg',
      'AGT':'Ser','AGC':'Ser','AGA':'Arg','AGG':'Arg',
      'GGT':'Gly','GGC':'Gly','GGA':'Gly','GGG':'Gly',
    },
    AA_CODE: { Phe:'F',Leu:'L',Ile:'I','Met*':'M',Val:'V',Ser:'S',Pro:'P',Thr:'T',Ala:'A',Tyr:'Y',Stop:'*',His:'H',Gln:'Q',Asn:'N',Lys:'K',Asp:'D',Glu:'E',Cys:'C',Trp:'W',Arg:'R',Gly:'G' },
    RE_SITES: {
      EcoRI:    { pattern: /GAATTC/gi,  cut: 'G↓AATTC' },
      BamHI:    { pattern: /GGATCC/gi,  cut: 'G↓GATCC' },
      HindIII:  { pattern: /AAGCTT/gi,  cut: 'A↓AGCTT' },
      NcoI:     { pattern: /CCATGG/gi,  cut: 'C↓CATGG' },
      SalI:     { pattern: /GTCGAC/gi,  cut: 'G↓TCGAC' },
      XbaI:     { pattern: /TCTAGA/gi,  cut: 'T↓CTAGA' },
      NotI:     { pattern: /GCGGCCGC/gi,cut: 'GC↓GGCCGC' },
      KpnI:     { pattern: /GGTACC/gi,  cut: 'GGTAC↓C' },
      SmaI:     { pattern: /CCCGGG/gi,  cut: 'CCC↓GGG' },
      PstI:     { pattern: /CTGCAG/gi,  cut: 'CTGCA↓G' },
    },

    parse(text) {
      const seqs = [];
      let cur = null;
      text.split('\n').forEach(line => {
        line = line.trim();
        if (line.startsWith('>')) {
          if (cur) seqs.push(cur);
          cur = { name: line.slice(1), seq: '' };
        } else if (cur && line && !line.startsWith(';')) {
          cur.seq += line.toUpperCase().replace(/[^ACGTNRYSWKMBDHV-]/g, '');
        }
      });
      if (cur) seqs.push(cur);
      return seqs;
    },

    reverseComplement(seq) {
      const comp = { A:'T',T:'A',G:'C',C:'G',N:'N',R:'Y',Y:'R',S:'S',W:'W',K:'M',M:'K',B:'V',V:'B',D:'H',H:'D' };
      return [...seq].reverse().map(b => comp[b] || b).join('');
    },

    findORFs(seq, minLen = 100) {
      const stops = new Set(['TAA','TAG','TGA']);
      const orfs  = [];
      for (let frame = 0; frame < 3; frame++) {
        let start = null;
        for (let i = frame; i < seq.length - 2; i += 3) {
          const codon = seq.slice(i, i+3);
          if (codon === 'ATG' && start === null) start = i;
          if (stops.has(codon) && start !== null) {
            if (i - start >= minLen) orfs.push({ start, end: i+3, frame: frame+1, len: i+3-start });
            start = null;
          }
        }
      }
      return orfs.sort((a,b) => b.len - a.len).slice(0, 10);
    },

    translate(seq) {
      let protein = '';
      for (let i = 0; i < seq.length - 2; i += 3) {
        const codon = seq.slice(i, i+3);
        const aa    = this.CODON_TABLE[codon];
        if (!aa) continue;
        if (aa === 'Stop') { protein += '*'; break; }
        protein += this.AA_CODE[aa] || '?';
      }
      return protein;
    },

    findRESites(seq) {
      const results = {};
      Object.entries(this.RE_SITES).forEach(([name, re]) => {
        const matches = [];
        let m;
        const rx = new RegExp(re.pattern.source, 'gi');
        while ((m = rx.exec(seq)) !== null) matches.push(m.index + 1);
        if (matches.length) results[name] = { cut: re.cut, positions: matches };
      });
      return results;
    },

    analyze(text) {
      const seqs = this.parse(text);
      if (!seqs.length) return null;
      return seqs.map(s => {
        const seq   = s.seq;
        const len   = seq.length;
        const gc    = seq.split('').filter(b => b==='G'||b==='C').length / len * 100;
        const at    = seq.split('').filter(b => b==='A'||b==='T').length / len * 100;
        const ns    = seq.split('N').length - 1;
        const rc    = this.reverseComplement(seq);
        const orfs  = this.findORFs(seq);
        const re    = this.findRESites(seq);
        const protein = seq.includes('ATG') ? this.translate(seq.slice(seq.indexOf('ATG'))) : '';
        return { name: s.name, seq, len, gc: gc.toFixed(1), at: at.toFixed(1), ns, rc, orfs, re, protein };
      });
    },

    render(results, containerId) {
      const el = document.getElementById(containerId);
      if (!el) return;
      if (!results) { el.innerHTML = '<div class="az-error">Could not parse FASTA — check the format (&gt;Header on one line, sequence on the next).</div>'; return; }

      el.innerHTML = results.map((r, ri) => `
        <div class="az-result">
          <div class="az-seq-name">${_esc(r.name)}</div>

          <div class="az-stats-grid">
            <div class="az-stat"><div class="az-stat-val">${r.len.toLocaleString()} bp</div><div class="az-stat-label">Sequence Length</div></div>
            <div class="az-stat"><div class="az-stat-val az-${r.gc>=40&&r.gc<=60?'pass':'warn'}">${r.gc}%</div><div class="az-stat-label">GC Content</div></div>
            <div class="az-stat"><div class="az-stat-val">${r.at}%</div><div class="az-stat-label">AT Content</div></div>
            <div class="az-stat"><div class="az-stat-val">${r.ns}</div><div class="az-stat-label">N Bases</div></div>
            <div class="az-stat"><div class="az-stat-val">${r.orfs.length}</div><div class="az-stat-label">ORFs Found</div></div>
            <div class="az-stat"><div class="az-stat-val">${Object.keys(r.re).length}</div><div class="az-stat-label">RE Sites</div></div>
          </div>

          <div class="az-two-col">
            <div class="az-panel">
              <div class="az-panel-title">Open Reading Frames (ORFs)</div>
              ${r.orfs.length ? r.orfs.map(o => `
                <div class="az-orf-row">
                  <span class="az-orf-frame">Frame +${o.frame}</span>
                  <span class="az-orf-pos">pos ${o.start.toLocaleString()}–${o.end.toLocaleString()}</span>
                  <span class="az-orf-len">${o.len} bp</span>
                  <span class="az-orf-prot">(${Math.floor(o.len/3)} aa)</span>
                </div>`).join('') : '<div class="az-empty-state">No ORFs ≥ 100 bp found</div>'}
            </div>

            <div class="az-panel">
              <div class="az-panel-title">Restriction Enzyme Sites</div>
              ${Object.entries(r.re).length ? Object.entries(r.re).map(([name,data]) => `
                <div class="az-re-row">
                  <span class="az-re-name">${name}</span>
                  <code class="az-re-cut">${data.cut}</code>
                  <span class="az-re-count">${data.positions.length}×</span>
                  <span class="az-re-pos">[${data.positions.slice(0,5).join(', ')}${data.positions.length>5?'…':''}]</span>
                </div>`).join('') : '<div class="az-empty-state">No common RE sites found</div>'}
            </div>
          </div>

          ${r.protein ? `
          <div class="az-panel">
            <div class="az-panel-title">Translated Protein (from first ATG, frame 1)</div>
            <div class="az-sequence-box az-protein-box">${_esc(r.protein.slice(0,200))}${r.protein.length>200?'…':''}</div>
            <div style="font-size:0.78rem;color:var(--text-muted);margin-top:0.35rem">${r.protein.length} amino acids</div>
          </div>` : ''}

          <div class="az-panel">
            <div class="az-panel-title">Reverse Complement</div>
            <div class="az-sequence-box">${_esc(r.rc.slice(0,200))}${r.rc.length>200?'…':''}</div>
          </div>
        </div>`).join('');
    }
  };

  /* ══════════════════════════════════════════════════════════
     MODULE 3 — VCF VARIANT EXPLORER
     ══════════════════════════════════════════════════════════ */
  const VCF = {
    parse(text) {
      const variants = [];
      const header   = [];
      let samples    = [];
      text.split('\n').forEach(line => {
        if (!line.trim()) return;
        if (line.startsWith('##')) { header.push(line); return; }
        if (line.startsWith('#CHROM')) {
          const cols = line.slice(1).split('\t');
          samples = cols.slice(9);
          return;
        }
        const parts = line.split('\t');
        if (parts.length < 8) return;
        const [chrom, pos, id, ref, alt, qual, filter, info] = parts;
        const alts   = alt.split(',');
        const isSnp  = alts.every(a => a.length === ref.length && a.length === 1);
        const isIndel = !isSnp;
        const isMnv  = !isSnp && alts.some(a => a.length === ref.length && a.length > 1);
        variants.push({
          chrom, pos: parseInt(pos), id, ref, alt, qual: parseFloat(qual) || 0,
          filter: filter || '.', info: info || '.',
          isSnp, isIndel, isMnv,
          pass: filter === 'PASS' || filter === '.',
        });
      });
      return { variants, samples, headerCount: header.length };
    },

    analyze(text) {
      const { variants, samples, headerCount } = this.parse(text);
      if (!variants.length) return null;

      const total   = variants.length;
      const snps    = variants.filter(v => v.isSnp).length;
      const indels  = variants.filter(v => v.isIndel && !v.isMnv).length;
      const mnvs    = variants.filter(v => v.isMnv).length;
      const pass    = variants.filter(v => v.pass).length;
      const titv    = (() => {
        const ti = variants.filter(v => v.isSnp && (['AG','GA','CT','TC'].includes(v.ref+v.alt))).length;
        const tv = variants.filter(v => v.isSnp && (['AC','CA','AT','TA','GC','CG','GT','TG'].includes(v.ref+v.alt))).length;
        return tv ? (ti/tv).toFixed(2) : 'N/A';
      })();

      /* Chrom distribution */
      const chromCounts = {};
      variants.forEach(v => { chromCounts[v.chrom] = (chromCounts[v.chrom]||0) + 1; });
      const topChroms = Object.entries(chromCounts).sort((a,b)=>b[1]-a[1]).slice(0, 24);

      /* Quality distribution */
      const quals = variants.filter(v => v.qual > 0).map(v => v.qual);
      const qualBuckets = [0,10,20,30,50,100,200,500,1000,Infinity];
      const qualDist = [];
      for (let i = 0; i < qualBuckets.length-1; i++) {
        const lo = qualBuckets[i], hi = qualBuckets[i+1];
        qualDist.push({ label: lo+'–'+(hi===Infinity?'+':hi), count: quals.filter(q=>q>=lo&&q<hi).length });
      }

      return { total, snps, indels, mnvs, pass, titv, topChroms, qualDist, samples, headerCount, passRate: ((pass/total)*100).toFixed(1) };
    },

    render(result, containerId) {
      const el = document.getElementById(containerId);
      if (!el) return;
      if (!result) { el.innerHTML = '<div class="az-error">Could not parse VCF — make sure the file has CHROM/POS/ID/REF/ALT/QUAL/FILTER/INFO columns.</div>'; return; }

      const { total, snps, indels, mnvs, pass, titv, topChroms, qualDist, passRate, samples } = result;
      const maxChrom = Math.max(...topChroms.map(c=>c[1]));
      const chromBars = topChroms.map(([chr, n]) => {
        const pct = (n/maxChrom*100).toFixed(0);
        return `<div class="az-chrom-row">
          <span class="az-chrom-name">${_esc(chr)}</span>
          <div class="az-chrom-bar-track"><div class="az-chrom-bar" style="width:${pct}%"></div></div>
          <span class="az-chrom-count">${n.toLocaleString()}</span>
        </div>`;
      }).join('');

      const maxQD = Math.max(...qualDist.map(q=>q.count), 1);
      const qdBars = qualDist.filter(q=>q.count>0).map(q => `
        <div class="az-qd-row">
          <span class="az-qd-label">Q${q.label}</span>
          <div class="az-chrom-bar-track"><div class="az-chrom-bar" style="width:${(q.count/maxQD*100).toFixed(0)}%;background:#00C4A0"></div></div>
          <span class="az-chrom-count">${q.count}</span>
        </div>`).join('');

      el.innerHTML = `
        <div class="az-result">
          <div class="az-stats-grid">
            <div class="az-stat"><div class="az-stat-val">${total.toLocaleString()}</div><div class="az-stat-label">Total Variants</div></div>
            <div class="az-stat"><div class="az-stat-val">${snps.toLocaleString()}</div><div class="az-stat-label">SNPs</div></div>
            <div class="az-stat"><div class="az-stat-val">${indels.toLocaleString()}</div><div class="az-stat-label">INDELs</div></div>
            <div class="az-stat"><div class="az-stat-val az-${passRate>=70?'pass':'warn'}">${passRate}%</div><div class="az-stat-label">PASS Rate</div></div>
            <div class="az-stat"><div class="az-stat-val">${titv}</div><div class="az-stat-label">Ti/Tv Ratio</div></div>
            <div class="az-stat"><div class="az-stat-val">${samples.length || '—'}</div><div class="az-stat-label">Samples</div></div>
          </div>

          <div class="az-two-col">
            <div class="az-panel">
              <div class="az-panel-title">Chromosomal Distribution (top ${topChroms.length})</div>
              ${chromBars}
            </div>
            <div class="az-panel">
              <div class="az-panel-title">Quality Score Distribution</div>
              ${qdBars || '<div class="az-empty-state">No quality scores found</div>'}
              <div class="az-panel-title" style="margin-top:1rem">QC Summary</div>
              ${[
                ['SNPs', snps.toLocaleString(), ''],
                ['INDELs', indels.toLocaleString(), ''],
                ['MNVs', mnvs.toLocaleString(), ''],
                ['PASS variants', pass.toLocaleString() + ' ('+passRate+'%)', passRate>=80?'PASS':passRate>=50?'WARN':'FAIL'],
                ['Ti/Tv ratio (expected ~2.0 for WGS)', titv, titv!='N/A'&&titv>=1.8&&titv<=2.5?'PASS':'WARN'],
              ].map(([k,v,b]) => `<div class="az-qc-row"><span class="az-qc-key">${k}</span><span class="az-qc-val">${v}</span>${b?`<span class="az-badge az-badge-${b.toLowerCase()}">${b}</span>`:''}</div>`).join('')}
            </div>
          </div>
        </div>`;
    }
  };

  /* ══════════════════════════════════════════════════════════
     MODULE 4 — EXPRESSION MATRIX ANALYZER
     ══════════════════════════════════════════════════════════ */
  const Expression = {
    parse(text) {
      const lines = text.trim().split('\n').filter(l => l.trim());
      if (lines.length < 3) return null;
      const delim   = lines[0].includes('\t') ? '\t' : ',';
      const header  = lines[0].split(delim);
      const samples = header.slice(1);
      const genes   = [];
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(delim);
        const gene  = parts[0].trim();
        const counts = parts.slice(1).map(v => parseFloat(v.trim()) || 0);
        if (counts.length === samples.length) genes.push({ gene, counts });
      }
      return { samples, genes };
    },

    normalize(genes, samples) {
      /* CPM (counts per million) */
      const libSizes = samples.map((_, si) => genes.reduce((s,g) => s + g.counts[si], 0));
      return genes.map(g => ({
        gene: g.gene,
        rawCounts: g.counts,
        cpm: g.counts.map((c, si) => libSizes[si] ? (c / libSizes[si]) * 1e6 : 0),
        total: g.counts.reduce((a,b)=>a+b,0),
        mean: _mean(g.counts),
      }));
    },

    analyze(text) {
      const parsed = this.parse(text);
      if (!parsed || !parsed.genes.length) return null;
      const { samples, genes } = parsed;
      const normed  = this.normalize(genes, samples);
      const libSizes = samples.map((_, si) => genes.reduce((s,g) => s + g.counts[si], 0));
      const topGenes = [...normed].sort((a,b) => b.mean-a.mean).slice(0, 20);
      const totalGenes = genes.length;
      const expressed = genes.filter(g => g.counts.some(c => c > 0)).length;

      /* Sample correlation (Pearson on log-CPM) */
      const correlations = [];
      for (let i = 0; i < samples.length; i++) {
        for (let j = i+1; j < samples.length; j++) {
          const x = normed.map(g => Math.log2(g.cpm[i]+1));
          const y = normed.map(g => Math.log2(g.cpm[j]+1));
          const mx = _mean(x), my = _mean(y);
          const num = x.reduce((s,v,k) => s + (v-mx)*(y[k]-my), 0);
          const denom = Math.sqrt(x.reduce((s,v)=>s+(v-mx)**2,0)*y.reduce((s,v)=>s+(v-my)**2,0));
          correlations.push({ a: samples[i], b: samples[j], r: denom ? (num/denom).toFixed(3) : 'N/A' });
        }
      }

      return { samples, totalGenes, expressed, libSizes, topGenes, correlations };
    },

    render(result, containerId) {
      const el = document.getElementById(containerId);
      if (!el) return;
      if (!result) { el.innerHTML = '<div class="az-error">Could not parse matrix. Expected TSV or CSV: first column = gene names, first row = sample names, values = read counts.</div>'; return; }

      const { samples, totalGenes, expressed, libSizes, topGenes, correlations } = result;
      const maxLib  = Math.max(...libSizes);
      const libBars = samples.map((s, i) => `
        <div class="az-chrom-row">
          <span class="az-chrom-name" style="width:100px;overflow:hidden;text-overflow:ellipsis" title="${_esc(s)}">${_esc(s.slice(0,12))}${s.length>12?'…':''}</span>
          <div class="az-chrom-bar-track"><div class="az-chrom-bar" style="width:${(libSizes[i]/maxLib*100).toFixed(0)}%;background:#58a6ff"></div></div>
          <span class="az-chrom-count">${(libSizes[i]/1e6).toFixed(1)}M</span>
        </div>`).join('');

      const maxMean = Math.max(...topGenes.map(g=>g.mean), 1);
      const geneRows = topGenes.map(g => `
        <div class="az-gene-row">
          <span class="az-gene-name">${_esc(g.gene)}</span>
          <div class="az-chrom-bar-track" style="flex:1"><div class="az-chrom-bar" style="width:${(g.mean/maxMean*100).toFixed(0)}%;background:#bc8cff"></div></div>
          <span class="az-chrom-count" style="min-width:70px">${Math.round(g.mean).toLocaleString()} avg</span>
        </div>`).join('');

      const corrRows = correlations.slice(0,10).map(c => `
        <div class="az-qc-row">
          <span class="az-qc-key">${_esc(c.a)} × ${_esc(c.b)}</span>
          <span class="az-qc-val">${c.r}</span>
          <span class="az-badge az-badge-${c.r!='N/A'&&c.r>=0.95?'pass':c.r>=0.85?'warn':'fail'}">${c.r!='N/A'&&c.r>=0.95?'HIGH':c.r>=0.85?'MOD':'LOW'}</span>
        </div>`).join('');

      el.innerHTML = `
        <div class="az-result">
          <div class="az-stats-grid">
            <div class="az-stat"><div class="az-stat-val">${samples.length}</div><div class="az-stat-label">Samples</div></div>
            <div class="az-stat"><div class="az-stat-val">${totalGenes.toLocaleString()}</div><div class="az-stat-label">Total Genes</div></div>
            <div class="az-stat"><div class="az-stat-val">${expressed.toLocaleString()}</div><div class="az-stat-label">Expressed</div></div>
            <div class="az-stat"><div class="az-stat-val">${((expressed/totalGenes)*100).toFixed(1)}%</div><div class="az-stat-label">Detection Rate</div></div>
            <div class="az-stat"><div class="az-stat-val">${(libSizes.reduce((a,b)=>a+b,0)/samples.length/1e6).toFixed(1)}M</div><div class="az-stat-label">Avg Library Size</div></div>
            <div class="az-stat"><div class="az-stat-val">${correlations.length}</div><div class="az-stat-label">Sample Pairs</div></div>
          </div>

          <div class="az-two-col">
            <div class="az-panel">
              <div class="az-panel-title">Library Sizes</div>
              ${libBars}
            </div>
            <div class="az-panel">
              <div class="az-panel-title">Top 20 Expressed Genes (by mean raw count)</div>
              ${geneRows}
            </div>
          </div>

          ${correlations.length ? `
          <div class="az-panel">
            <div class="az-panel-title">Sample Correlations (log₂ CPM Pearson r)</div>
            ${corrRows}
            ${correlations.length > 10 ? `<div style="font-size:.75rem;color:var(--text-muted);margin-top:.5rem">Showing ${Math.min(10,correlations.length)} of ${correlations.length} pairs</div>` : ''}
          </div>` : ''}
        </div>`;
    }
  };

  /* ══════════════════════════════════════════════════════════
     MODULE 5 — MULTIPLE SEQUENCE ALIGNMENT VIEWER
     ══════════════════════════════════════════════════════════ */
  const Alignment = {
    COLORS: {
      /* DNA */
      A:'#00C4A0',G:'#58a6ff',C:'#f97316',T:'#f85149',U:'#f85149',N:'#A8A098','-':'#1c2128',
      /* Amino acids by property */
      R:'#58a6ff',K:'#58a6ff',H:'#58a6ff',             /* positive */
      D:'#f85149',E:'#f85149',                          /* negative */
      S:'#e3b341',T:'#e3b341',N:'#e3b341',Q:'#e3b341', /* polar */
      A:'#00C4A0',V:'#00C4A0',I:'#00C4A0',L:'#00C4A0',M:'#00C4A0',F:'#bc8cff',W:'#bc8cff',P:'#bc8cff',Y:'#bc8cff',G:'#A8A098',C:'#f97316',
      '*':'#1c2128',
    },

    render(result, containerId) {
      const el = document.getElementById(containerId);
      if (!el) return;
      if (!result || !result.length) { el.innerHTML = '<div class="az-error">Could not parse alignment — paste a FASTA-format multiple sequence alignment (all sequences must be the same length).</div>'; return; }

      const maxNameLen = Math.max(...result.map(r => r.name.length), 10);
      const alnLen     = result[0]?.seq.length || 0;

      /* Consensus */
      const consensus = [];
      for (let p = 0; p < alnLen; p++) {
        const col = result.map(r => r.seq[p] || '-');
        const counts = {};
        col.forEach(b => { counts[b] = (counts[b]||0)+1; });
        const best = Object.entries(counts).sort((a,b)=>b[1]-a[1])[0];
        consensus.push({ base: best[0], count: best[1], pct: best[1]/result.length*100 });
      }

      /* Conservation score */
      const conserved = consensus.filter(c => c.pct >= 80).length;
      const variable  = consensus.filter(c => c.pct < 50).length;

      /* Render in 60-char windows */
      const CHUNK = 60;
      let html = `
        <div class="az-result">
          <div class="az-stats-grid">
            <div class="az-stat"><div class="az-stat-val">${result.length}</div><div class="az-stat-label">Sequences</div></div>
            <div class="az-stat"><div class="az-stat-val">${alnLen}</div><div class="az-stat-label">Alignment Length</div></div>
            <div class="az-stat"><div class="az-stat-val az-pass">${conserved}</div><div class="az-stat-label">Conserved (≥80%)</div></div>
            <div class="az-stat"><div class="az-stat-val az-warn">${variable}</div><div class="az-stat-label">Variable Sites</div></div>
            <div class="az-stat"><div class="az-stat-val">${((conserved/alnLen)*100).toFixed(1)}%</div><div class="az-stat-label">Conservation</div></div>
            <div class="az-stat"><div class="az-stat-val">${result.filter(r=>r.seq.includes('-')).length}</div><div class="az-stat-label">Gapped Seqs</div></div>
          </div>
          <div class="az-aln-container">`;

      for (let start = 0; start < alnLen; start += CHUNK) {
        const end = Math.min(start + CHUNK, alnLen);
        html += `<div class="az-aln-block">`;
        html += `<div class="az-aln-ruler"><span class="az-aln-namecol"></span><span class="az-aln-pos">${start+1}</span><span style="flex:1"></span><span class="az-aln-pos">${end}</span></div>`;
        result.forEach(r => {
          const slice = r.seq.slice(start, end);
          const colored = [...slice].map(b => {
            const col = this.COLORS[b.toUpperCase()] || '#A8A098';
            return `<span class="az-base" style="background:${col}22;color:${col}">${_esc(b)}</span>`;
          }).join('');
          html += `<div class="az-aln-row"><span class="az-aln-name" title="${_esc(r.name)}">${_esc(r.name.slice(0,18))}${r.name.length>18?'…':''}</span><span class="az-aln-seq">${colored}</span></div>`;
        });
        /* Consensus row */
        const consSlice = consensus.slice(start, end);
        const consColored = consSlice.map(c => {
          const col = c.pct >= 80 ? '#00C4A0' : c.pct >= 50 ? '#e3b341' : '#A8A098';
          return `<span class="az-base az-cons-base" style="color:${col}">${c.pct>=80?'*':c.pct>=50?'+':'.'}</span>`;
        }).join('');
        html += `<div class="az-aln-row az-cons-row"><span class="az-aln-name">Consensus</span><span class="az-aln-seq">${consColored}</span></div>`;
        html += `</div>`;
      }
      html += `</div></div>`;
      el.innerHTML = html;
    }
  };

  /* ══════════════════════════════════════════════════════════
     UI CONTROLLER
     ══════════════════════════════════════════════════════════ */
  function switchTab(tab) {
    document.querySelectorAll('.az-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
    document.querySelectorAll('.az-panel-content').forEach(p => p.classList.toggle('active', p.dataset.panel === tab));
  }

  async function runAnalysis(tab) {
    const panel   = document.querySelector(`.az-panel-content[data-panel="${tab}"]`);
    if (!panel) return;
    const textarea = panel.querySelector('textarea');
    const fileInput= panel.querySelector('input[type=file]');
    const resultId = tab + '-result';

    let text = textarea?.value.trim() || '';

    /* Try file upload first */
    if (fileInput?.files?.length) {
      try { text = await _readFile(fileInput.files[0]); } catch { text = textarea?.value.trim() || ''; }
    }

    if (!text) {
      document.getElementById(resultId).innerHTML = '<div class="az-error">Please paste data or upload a file first.</div>';
      return;
    }

    const btn = panel.querySelector('.az-run-btn');
    if (btn) { btn.textContent = 'Analysing…'; btn.disabled = true; }

    /* Yield to browser so spinner shows */
    await new Promise(r => setTimeout(r, 20));

    try {
      if (tab === 'fastq') {
        const result = FASTQ.analyze(text);
        FASTQ.render(result, resultId);
      } else if (tab === 'fasta') {
        const result = FASTA.analyze(text);
        FASTA.render(result, resultId);
      } else if (tab === 'vcf') {
        const result = VCF.analyze(text);
        VCF.render(result, resultId);
      } else if (tab === 'expression') {
        const result = Expression.analyze(text);
        Expression.render(result, resultId);
      } else if (tab === 'alignment') {
        const seqs = FASTA.parse(text);
        const maxLen = Math.max(...seqs.map(s=>s.seq.length));
        const padded = seqs.map(s => ({ name: s.name, seq: s.seq.padEnd(maxLen, '-') }));
        Alignment.render(padded.length ? padded : null, resultId);
      }
    } catch (err) {
      document.getElementById(resultId).innerHTML = `<div class="az-error">Analysis error: ${_esc(err.message)}</div>`;
    }

    if (btn) { btn.textContent = 'Run Analysis'; btn.disabled = false; }
  }

  function loadDemo(tab) {
    const panel    = document.querySelector(`.az-panel-content[data-panel="${tab}"]`);
    const textarea = panel?.querySelector('textarea');
    if (!textarea) return;
    textarea.value = DEMOS[tab] || '';
    document.getElementById(tab+'-result').innerHTML = '';
  }

  /* ── Demo data ── */
  const DEMOS = {
    fastq: `@SRR8956074.1 1 length=151
ACGTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTA
+
IIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII
@SRR8956074.2 2 length=151
TGCAATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGAT
+
HHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH
@SRR8956074.3 3 length=151
GCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCT
+
?????????????????????IIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII`,

    fasta: `>BRCA1_exon11_human GeneID:672 Homo sapiens
ATGAATTTTCTGTAAGTTTTGTTCTATTTTCTAAAAGCACCTGAAAAGATATTTGGAATAGGTGAAAGAGGTTT
TTTAAGCAAATATTCAAGGCAATTTTAGTAGTTATGTGTGTGTGTGTGTAATTTATTTTCTTTTTTTTCATGAG
AATGATGATTTTTGAAAATGGTTTTTTAAAAGCAGTTTTAAACAGATACAGAGAATTTAGATAAAGTGGTTATCA
ATGATAGAAACTGGGGCTTTTTAGGCTGAAGCTATTTTGTAATGATAGAAACTGCGGCTTTTTAGGCTGAAGCT
ATGAATTTTCTGTAAGTTTTGTTCTATTTTCTAAAAGCACCTGAAAAGATATTTGGAATAGGTGAAAGAGGTT
>BRCA2_coding_sequence GeneID:675
ATGCCTATTGGATCCAAAGAGAGGCCAACATTTTTTGAAATTTTTAAGACACGCTGCAACAAAGCAGATTTAGG
TTTTTTGTTAGTCTTTATTTCAAATGTGTCAGTTTTACAGATCCTGTATTTGGTGTTGATATAAATCCTGCATA
TTAAATCTGTAAAACAGACTTTGAATCAGAATTTGTCCCAAATGAAAACAATGAAAGCAATTTTTACTTTTATT
GAGTCAAAATAAAGGAAATGAAATTTTATTTCAAAGCATGATTTAAATAGAATTAGATAAAACAAAGAATCTGA`,

    vcf: `##fileformat=VCFv4.2
##FILTER=<ID=PASS,Description="All filters passed">
##FILTER=<ID=LowQual,Description="Low quality variant">
##contig=<ID=chr1,length=248956422>
#CHROM	POS	ID	REF	ALT	QUAL	FILTER	INFO	FORMAT	SAMPLE1
chr1	925952	rs1234	G	A	50	PASS	DP=42;AF=0.5	GT:DP	0/1:42
chr1	931279	.	A	G	30	PASS	DP=28;AF=0.6	GT:DP	0/1:28
chr1	935222	rs5678	C	T	65	PASS	DP=55;AF=0.4	GT:DP	0/1:55
chr2	744055	.	ATCG	A	12	LowQual	DP=8	GT:DP	0/1:8
chr2	877787	rs9012	T	C	45	PASS	DP=38;AF=0.5	GT:DP	0/1:38
chr3	119960144	.	G	A	80	PASS	DP=70;AF=0.5	GT:DP	0/1:70
chr3	127134547	rs3456	A	T	55	PASS	DP=50;AF=0.3	GT:DP	0/1:50
chrX	41343845	.	C	G	20	LowQual	DP=10	GT:DP	0/1:10
chrX	55217458	rs7890	T	A	75	PASS	DP=65;AF=0.7	GT:DP	0/1:65`,

    expression: `Gene\tControl_1\tControl_2\tControl_3\tTreatment_1\tTreatment_2\tTreatment_3
GAPDH\t5234\t4987\t5102\t5089\t5201\t4998
TP53\t234\t198\t221\t876\t912\t834
BRCA1\t89\t102\t95\t45\t38\t52
MYC\t456\t478\t441\t1234\t1289\t1198
ACTB\t8932\t8654\t8821\t8745\t8901\t8812
IL6\t23\t18\t25\t567\t612\t589
TNF\t45\t52\t48\t892\t934\t867
VEGFA\t189\t201\t195\t87\t92\t79
HIF1A\t345\t367\t356\t789\t812\t798
CDH1\t678\t645\t662\t234\t212\t245
EGFR\t134\t128\t141\t678\t712\t689
PTEN\t567\t589\t578\t123\t134\t118
RB1\t234\t245\t228\t98\t112\t89`,

    alignment: `>Homo_sapiens_BRCA1
MASRRGRESQTGKKKMSSSSGSSTPAGQNRFTPKKKKKKKIKKKPEGKKSSNLRSSPENNDSSGPEERESPAPPQ
>Pan_troglodytes_BRCA1
MASRRGRESQTGKKKMSSSSGSSTPAGQNRFTPKKKKKKK-KKKPEGKKSSNLRSSPENNDSSGPEERESPAPPQ
>Mus_musculus_Brca1
MASRRGRESQTGKKKMSSSSGSSTPAGQNKFTPKKKKKKK-KKKPEGKKSSNLRSSPENNESSGPEERESPAPPQ
>Rattus_norvegicus_Brca1
MASRRGRESQTGKKKMSSSSGSSTPAGQNKFTPKKKKKKK-KKKPEGKKSSNLRSSPENNESSGPEERESPAPPQ
>Gallus_gallus_BRCA1
MASRRGRESQTGQKKMSS-SGSSTPAGQNRFTPKKKKKK--KKKPEGKKSSNLRSSPENNDSSGPEERESPAPPQ`,
  };

  /* ── Render the full Analysis Studio UI ── */
  function init() {
    const el = document.getElementById('analysis-studio-content');
    if (!el) return;

    const tabs = [
      { id: 'fastq',      icon: 'bar-chart', label: 'FASTQ QC',         accept: '.fastq,.fq,.fastq.gz,.txt', placeholder: 'Paste FASTQ content here (supports Illumina and Nanopore format)…' },
      { id: 'fasta',      icon: 'dna',       label: 'FASTA Tools',      accept: '.fasta,.fa,.fna,.txt',       placeholder: 'Paste one or more FASTA sequences here…' },
      { id: 'vcf',        icon: 'microscope',label: 'VCF Explorer',     accept: '.vcf,.vcf.gz,.txt',          placeholder: 'Paste VCF content here (include the ## header lines)…' },
      { id: 'expression', icon: 'trending-up',label: 'Expression Matrix', accept: '.tsv,.csv,.txt',            placeholder: 'Paste a count matrix (TSV/CSV). First column = gene names, first row = sample names…' },
      { id: 'alignment',  icon: 'target',    label: 'MSA Viewer',        accept: '.fasta,.fa,.aln,.txt',       placeholder: 'Paste a FASTA-format multiple sequence alignment. All sequences must be the same length…' },
    ];

    el.innerHTML = `
      <div class="az-tabs">
        ${tabs.map((t, i) => `<button class="az-tab${i===0?' active':''}" data-tab="${t.id}" onclick="OmicsLab.Analysis.switchTab('${t.id}')">${OmicsLab.Icons?.svg(t.icon, 13) || ''} ${t.label}</button>`).join('')}
      </div>

      ${tabs.map((t, i) => `
        <div class="az-panel-content${i===0?' active':''}" data-panel="${t.id}">
          <div class="az-input-area">
            <div class="az-input-header">
              <span class="az-input-title">${OmicsLab.Icons?.svg(t.icon, 14) || ''} ${t.label}</span>
              <div class="az-input-actions">
                <button class="az-demo-btn" onclick="OmicsLab.Analysis.loadDemo('${t.id}')">Load demo data</button>
                <label class="az-file-btn">
                  Upload file
                  <input type="file" accept="${t.accept}" style="display:none" onchange="this.closest('.az-panel-content').querySelector('.az-filename').textContent=this.files[0]?.name||''">
                </label>
                <span class="az-filename"></span>
              </div>
            </div>
            <textarea class="az-textarea" placeholder="${t.placeholder}" rows="8" spellcheck="false"></textarea>
            <button class="az-run-btn" onclick="OmicsLab.Analysis.runAnalysis('${t.id}')">
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              Run Analysis
            </button>
          </div>
          <div id="${t.id}-result" class="az-result-area"></div>
        </div>`).join('')}`;
  }

  return { init, switchTab, runAnalysis, loadDemo };
})();
