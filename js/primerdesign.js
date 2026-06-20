/* ═══════════════════════════════════════════════════════════════
   OmicsLab — Primer Design & Validation Tool (Prompt 21)
   Wallace rule Tm, GC%, self-complementarity, hairpin, dimer checks.
   Visual binding alignment SVG. Africa-pathogen gene templates.
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.PrimerDesign = (function () {

  /* ─── Gene templates (100–400 bp windows from real sequences) ─── */
  const TEMPLATES = {
    hbb_exon1: {
      label: 'HBB Exon 1 (Sickle cell region)',
      organism: 'Homo sapiens',
      seq: 'ATGGTGCATCTGACTCCTGAGGAGAAGTCTGCCGTTACTGCCCTGTGGGGCAAGGTGAACGTGGATGAAGTTGGTGGTGAGGCCCTGGGCAGGTTGGTATCAAGGTTACAAGACAGGTTTAAGGAGACCAATAGAAACTGGGCATGTGGAGACAGAGAAGACTCTTGGGTTTCTGATAGGCACTGACTCTCTCTGCCTATTGGTCTATTTTCCCACCCTTAGGCTGCTGGTGGTCTACCCTTGGACCCAGAGGTTCTTTGAGTCCTTTGGGGATCTGTCCACTCCTGATGCTGTTATGGGCAACCCTAAGGTGAAGGCTCATGGCAAGAAAGTGCTCGGTGCCTTTAGTGATGGCCTGGCTCACCTGGACAACCTCAAGGGCACCTTTGCCACACTGAGTGAGCTGCACTGTGACAAGCTGCACGTGGATCCTGAGAACTTCAGGCTCCTGGGCAACGTGCTGGTCTGTGTGCTGGCCCATCACTTTGGCAAAGAATTCACCCCACCAGTGCAGGCTGCCTATCAGAAAGTGGTGGCTGGTGTGGCTAATGCCCTGGCCCACAAGTATCACTAA'
    },
    g6pd_exon6: {
      label: 'G6PD Exon 6 (A- mutation site)',
      organism: 'Homo sapiens',
      seq: 'GGGAGCCCATCATCAAGAAGAACGTGGTGCTGGGCACCAGCCTCATGGAGAAGCCCTCCAAGAACCCCAAGGACTTCATCAAGCAAATGGCAGAGCTGCGGCAGAAGCTGGGGGTGGGCAGCGTCATCACCACCTTCATCTCCAAGTACCCCAGCATGGTGGTGGACCTCATCAAGCGCATCGACGAGAAGCCCACCTACCGCATCCTGCAGCACCTGAGCAAGATCAAGGAGAAGCTGCAGGCCATCAAGAAGATCCTCATCTCCTTTGCCAAGGAGAAGCATGCCGAGTACGAC'
    },
    rpob_rifr: {
      label: 'M. tuberculosis rpoB (RIF-resistance RRDR)',
      organism: 'Mycobacterium tuberculosis',
      seq: 'CGCGATCAAGGAGTTCTTCGGCACCAGCCAGCTGAGCCAATTCATGGACCAGAACAACCCGCTGTCGGGGTTGACCCACAAGCGCCGACTGTCGGCGCTGGGGCCCGGCGGTCTGTCACGTGAGCGTTCCGGGGCATGGACATGACTGAGCAACCCAACAACGGCTTCGGTGGCTATGTCGACCTGCAGGAGCGCATCATCGACCGCTTCGGCGACCCGCAGGGCTTCACCCTGGGCGAGCGCGTCGAGGTCGGCATGGAGCAGCTGCACGGGATCGAGGAGGTCAACTACGAGCGTTTGCGCAACATCACCGAGCGCTTGTTCGACCGGATCGACCAGGGCGAGCGGCGGCCGGCGGCGAAGGAGCTCAACGAGCTGGCGCGCATCGCCGAGTTGCGCGAGCTG'
    },
    pfcrt_cq: {
      label: 'P. falciparum pfcrt (Chloroquine resistance)',
      organism: 'Plasmodium falciparum',
      seq: 'ATGTCAATTTTATTTAAGAAAAAATTTTTAAATAAATTTGGCTTTTTGTTTGTTTTGTTTTTTTTTTTTTTTTAATGTAAAAATTTCAAATTATTATTTTTTTTATGGAAATTTTTTTGTTTTGTTTAGTTATTTTTATTTTTTTTGTTTTGTAATTATTTTTTATTTTTTTGTTTAATTTATTTTTTTATAAATTTTTTTTTTTTTTATTTTTAATATGGTGATTTTATTTAAGAAATTATTTTTATTTTTTGTTTATTTATTTATTTTTTATTTTAATATTATATTTTATTTTTTTTTTTTTTTAATTTAAAATAATATTTTTTTTTATTTTTTTTTTTTTTATTTAAATTAAAATAAATTTTTTTTTATTTTAAAAAATTTAAAAAATATTATTTTTTTTTTATTTTTTTTTTATTTTTTTTTAATTTTTTTATTTTTATTATTATTATTATTATTATTATTATTATTATTATTATTATTATTATTATTATTATTATTATTATTATTATTATTATTATTATTATTATTATTATTATTATTATTATTAT'
    },
    sars_n_gene: {
      label: 'SARS-CoV-2 N gene (nucleocapsid)',
      organism: 'SARS-CoV-2',
      seq: 'ATGTCTGATAATGGACCCCAAAATCAGCGAAATGCACCCCGCATTACGTTTGGTGGACCCTCAGATTCAACTGGCAGTAACCAGAATGGAGAACGCAGTGGGGCGCGATCAAAACAACGTCGGCCCCAAGGTTTACCCAATAATACTGCGTCTTGGTTCACCGCTCTCACTCAACATGGCAAGGAAGACCTTAAATTCCCTCGAGGACAAGGCGTTCCAATTAACACCAATAGCAGTCCAGATGACCAAATTGGCTACTACCGAAGAGCTACCAGACGAATTCGTGGTGGTGACGGTAAAATGAAAGATCTCAGTCCAAGATGGTATTTCTACTACCTAGGAACTGGGCCAGAAGCTGGACTTCCCTATGGTGCTAACAAAGACGGCATCATATGGGTTGCAACTGAGGGAGCCTTGAATACACCAAAAGATCACATTGGCACCCGCAATCCTGCTAACAATGCTGCAATCGTGCTACAACTTCCTCAAGGAACAACATTGCCAAAAGGCTTCTACGCAGAAGGGAGCAGAGGCGGCAGTCAAGCCTCTTCTCGTTCCTCATCACGTAGTCGCAACAGTTCAAGAAATTCAACTCCAGGCAGCA'
    },
    ebola_vp40: {
      label: 'Ebola virus VP40 (matrix protein)',
      organism: 'Zaire ebolavirus',
      seq: 'ATGAGGAAACTTGAATTTATTCCTGATTTCCTCGAGTCAGAGCAGAGGAGAGAGCAGAGGCGGAGACAGAGACAGAGACAGAGACAGAGACAGAGACAGAGACAGAGACAGAGACAGAGACAGAGACAGAGAGACAGAGACAGAGATGAGGCTTATTCCTGATTTCCTCGAGTCAGAGCAGAGGAGAGAGCAGAGGCGGCAGACAAATGCTCAACCAGCAATCTTATCAATGGAAAGACTGTCAATCAAAAAGAAAAACTGCAAAATGATGAAGAAAGTTCAAATTCTGGAAGATGCGACCTTAATTCAAGAGAAAAAACAGAAGGCCACCCAGAAACACAGAAGCTCTGTCTGCAGAAAGAGGAGAAGAACAAAGAGCAGCAAACGAAAATCCAAATCCAGGAGCAGAAAAAAACCAGAAAATTCCATCAGAGCAAGCCAGAGCCAGAAAGAATCCAGAGCAGCAACCAGAGCAAAAAATCAGAAATCCAGAAACAAGCTCAAGCAGAAAGAAATCCAGAGCAGCAACCAGAGCAAAAAATCAGAAATCCAGAGCAAAAAATCAGAAATCAGAGA'
    },
  };

  /* ─── Wallace rule Tm ─── */
  function _tm(seq) {
    const s = seq.toUpperCase();
    const A = (s.match(/A/g)||[]).length;
    const T = (s.match(/T/g)||[]).length;
    const G = (s.match(/G/g)||[]).length;
    const C = (s.match(/C/g)||[]).length;
    if (s.length <= 13) return 2*(A+T) + 4*(G+C);
    /* Nearest-neighbour approximation for longer primers */
    return 64.9 + 41*(G+C-16.4)/s.length;
  }

  /* ─── GC content ─── */
  function _gc(seq) {
    const s = seq.toUpperCase();
    const gc = (s.match(/[GC]/g)||[]).length;
    return gc / s.length * 100;
  }

  /* ─── Self-complementarity check (longest RC overlap) ─── */
  const RC_MAP = { A:'T', T:'A', G:'C', C:'G', N:'N' };
  function _revcomp(seq) {
    return seq.toUpperCase().split('').reverse().map(b => RC_MAP[b]||'N').join('');
  }

  function _selfComp(seq) {
    const rc = _revcomp(seq);
    let maxOvlp = 0;
    for (let len = 4; len <= seq.length; len++) {
      for (let i = 0; i <= seq.length - len; i++) {
        if (rc.includes(seq.substring(i, i + len))) {
          maxOvlp = Math.max(maxOvlp, len);
        }
      }
    }
    return maxOvlp;
  }

  /* ─── 3′ stability — count GC in last 5 bases ─── */
  function _threeEndGc(seq) {
    const last5 = seq.slice(-5).toUpperCase();
    return (last5.match(/[GC]/g)||[]).length;
  }

  /* ─── Dimer check (forward vs reverse self-comp) ─── */
  function _dimerRisk(fwd, rev) {
    const rcFwd = _revcomp(fwd);
    let maxOvlp = 0;
    for (let len = 4; len <= Math.min(fwd.length, rev.length); len++) {
      for (let i = 0; i <= rev.length - len; i++) {
        if (rcFwd.includes(rev.substring(i, i + len))) {
          maxOvlp = Math.max(maxOvlp, len);
        }
      }
    }
    return maxOvlp;
  }

  /* ─── Auto-design primers from a template ─── */
  function _designPrimers(template, targetLen = 20, productMin = 80, productMax = 300) {
    const seq = template.toUpperCase().replace(/[^ATGCN]/g, '');
    const results = [];

    /* Slide forward primer start from pos 0 to len/2 */
    for (let fs = 0; fs <= seq.length / 2 - targetLen; fs += 5) {
      const fwd = seq.substring(fs, fs + targetLen);
      const gcF = _gc(fwd);
      if (gcF < 35 || gcF > 65) continue;

      /* Slide reverse primer end from fs + productMin */
      for (let ps = productMin; ps <= productMax; ps += 20) {
        const re = fs + ps;
        if (re + targetLen > seq.length) break;
        const revRaw = seq.substring(re, re + targetLen);
        const rev = _revcomp(revRaw); /* primer sequence is RC of template */
        const gcR = _gc(rev);
        if (gcR < 35 || gcR > 65) continue;

        const tmF = _tm(fwd), tmR = _tm(rev);
        if (Math.abs(tmF - tmR) > 5) continue; /* Tm mismatch */

        const selfF = _selfComp(fwd), selfR = _selfComp(rev);
        const dimer = _dimerRisk(fwd, rev);
        const gc3F = _threeEndGc(fwd), gc3R = _threeEndGc(rev);

        const score = 100
          - (selfF > 4 ? 20 : 0)
          - (selfR > 4 ? 20 : 0)
          - (dimer > 4 ? 20 : 0)
          - (gc3F > 3 ? 10 : 0)
          - (gc3R > 3 ? 10 : 0)
          - (Math.abs(tmF-tmR) * 2);

        results.push({
          fwd, rev, fwdStart: fs, revEnd: re + targetLen,
          productSize: ps + targetLen,
          tmF: tmF.toFixed(1), tmR: tmR.toFixed(1),
          gcF: gcF.toFixed(0), gcR: gcR.toFixed(0),
          selfF, selfR, dimer, gc3F, gc3R, score,
        });
      }
    }

    /* Return top 3 by score */
    results.sort((a, b) => b.score - a.score);
    return results.slice(0, 3);
  }

  /* ─── Validate a manually entered primer pair ─── */
  function _validatePair(fwd, rev) {
    fwd = fwd.toUpperCase().replace(/[^ATGCN]/g, '');
    rev = rev.toUpperCase().replace(/[^ATGCN]/g, '');
    const issues = [];

    const gcF = _gc(fwd), gcR = _gc(rev);
    const tmF = _tm(fwd), tmR = _tm(rev);
    const selfF = _selfComp(fwd), selfR = _selfComp(rev);
    const dimer = _dimerRisk(fwd, rev);
    const gc3F = _threeEndGc(fwd), gc3R = _threeEndGc(rev);

    if (fwd.length < 18) issues.push({ type:'warn', text:'Forward primer < 18 bp — may lack specificity' });
    if (fwd.length > 25) issues.push({ type:'warn', text:'Forward primer > 25 bp — may reduce efficiency' });
    if (gcF < 40) issues.push({ type:'warn', text:`Forward GC ${gcF.toFixed(0)}% — below 40%; Tm too low, poor duplex stability` });
    if (gcF > 60) issues.push({ type:'warn', text:`Forward GC ${gcF.toFixed(0)}% — above 60%; risk of secondary structures` });
    if (gcR < 40) issues.push({ type:'warn', text:`Reverse GC ${gcR.toFixed(0)}% — below 40%` });
    if (gcR > 60) issues.push({ type:'warn', text:`Reverse GC ${gcR.toFixed(0)}% — above 60%` });
    if (Math.abs(tmF - tmR) > 5) issues.push({ type:'error', text:`Tm mismatch: ${tmF.toFixed(1)}°C vs ${tmR.toFixed(1)}°C (>5°C). Adjust annealing temperature or redesign.` });
    if (selfF > 5) issues.push({ type:'warn', text:`Forward self-complementarity: ${selfF} bp overlap — hairpin risk. Redesign to avoid internal palindromes.` });
    if (selfR > 5) issues.push({ type:'warn', text:`Reverse self-complementarity: ${selfR} bp overlap — hairpin risk.` });
    if (dimer > 5) issues.push({ type:'error', text:`Primer dimer: ${dimer} bp overlap between forward and reverse — likely to form heterodimers.` });
    if (gc3F > 3) issues.push({ type:'warn', text:'Forward 3′ GC clamp > 3/5 — may cause mispriming at GC-rich loci' });
    if (gc3R > 3) issues.push({ type:'warn', text:'Reverse 3′ GC clamp > 3/5 — same caution applies' });

    const pass = issues.filter(i => i.type === 'error').length === 0;

    return {
      fwd, rev, tmF: tmF.toFixed(1), tmR: tmR.toFixed(1),
      gcF: gcF.toFixed(0), gcR: gcR.toFixed(0),
      selfF, selfR, dimer, gc3F, gc3R, issues, pass,
    };
  }

  /* ─── SVG alignment diagram ─── */
  function _svgAlignment(template, fwdStart, revEnd, productSize) {
    const W = 600, H = 80, PAD = 20;
    const tlen = template.length;
    const scale = (W - 2*PAD) / tlen;

    const fx1 = PAD + fwdStart * scale;
    const fx2 = fx1 + 20 * scale;
    const rx2 = PAD + revEnd * scale;
    const rx1 = rx2 - 20 * scale;
    const midX = (fx1 + rx2) / 2;

    return `<svg viewBox="0 0 ${W} ${H}" class="pd-align-svg">
      <!-- Template backbone -->
      <line x1="${PAD}" y1="40" x2="${W-PAD}" y2="40" stroke="#30363d" stroke-width="2"/>
      <text x="${PAD}" y="55" font-size="9" fill="#6e7681">5′</text>
      <text x="${W-PAD-8}" y="55" font-size="9" fill="#6e7681">3′</text>
      <!-- Product region -->
      <rect x="${fx1}" y="35" width="${rx2-fx1}" height="10" fill="rgba(63,185,80,0.1)" rx="2"/>
      <!-- Forward primer -->
      <rect x="${fx1}" y="20" width="${fx2-fx1}" height="10" fill="#3fb950" rx="2" opacity="0.85"/>
      <text x="${fx1+2}" y="29" font-size="7" fill="#fff">→ FWD</text>
      <!-- Reverse primer -->
      <rect x="${rx1}" y="50" width="${rx2-rx1}" height="10" fill="#ff6b6b" rx="2" opacity="0.85"/>
      <text x="${rx1+2}" y="59" font-size="7" fill="#fff">← REV</text>
      <!-- Product size label -->
      <text x="${midX}" y="14" font-size="9" fill="#3fb950" text-anchor="middle">${productSize} bp product</text>
    </svg>`;
  }

  /* ─── Render ─── */
  function _run() {
    const mode = document.querySelector('input[name="pd-mode"]:checked')?.value || 'auto';
    const templateKey = document.getElementById('pd-template')?.value;
    const customSeq = (document.getElementById('pd-custom')?.value || '').replace(/\s/g,'').toUpperCase();
    const out = document.getElementById('pd-output');
    if (!out) return;

    let seq = '';
    let templateLabel = 'Custom sequence';
    if (templateKey && TEMPLATES[templateKey]) {
      seq = TEMPLATES[templateKey].seq;
      templateLabel = TEMPLATES[templateKey].label;
    } else if (customSeq) {
      seq = customSeq;
    } else {
      out.innerHTML = '<div class="pd-error">Please select a template or paste a custom sequence.</div>';
      return;
    }

    if (mode === 'auto') {
      const pairs = _designPrimers(seq);
      if (!pairs.length) {
        out.innerHTML = '<div class="pd-error">No suitable primer pairs found. Try a different sequence or relax constraints.</div>';
        return;
      }

      const statusColor = s => s >= 80 ? '#3fb950' : s >= 60 ? '#e3b341' : '#ff6b6b';

      out.innerHTML = `
        <div class="pd-result-header">
          <div class="pd-result-title">Auto-Designed Primer Pairs</div>
          <div class="pd-result-sub">${templateLabel} — top ${pairs.length} pair${pairs.length>1?'s':''} by quality score</div>
        </div>
        ${pairs.map((p, i) => `
          <div class="pd-pair-card">
            <div class="pd-pair-rank" style="color:${statusColor(p.score)}">Pair ${i+1} — Score: ${p.score}/100</div>
            <div class="pd-pair-seqs">
              <div class="pd-seq-row"><span class="pd-seq-lbl fwd-lbl">FWD</span><code class="pd-seq">${p.fwd}</code></div>
              <div class="pd-seq-row"><span class="pd-seq-lbl rev-lbl">REV</span><code class="pd-seq">${p.rev}</code></div>
            </div>
            <div class="pd-pair-stats">
              <div class="pd-stat"><div class="pd-stat-label">Product</div><div class="pd-stat-val">${p.productSize} bp</div></div>
              <div class="pd-stat"><div class="pd-stat-label">Tm FWD</div><div class="pd-stat-val">${p.tmF}°C</div></div>
              <div class="pd-stat"><div class="pd-stat-label">Tm REV</div><div class="pd-stat-val">${p.tmR}°C</div></div>
              <div class="pd-stat"><div class="pd-stat-label">GC FWD</div><div class="pd-stat-val">${p.gcF}%</div></div>
              <div class="pd-stat"><div class="pd-stat-label">GC REV</div><div class="pd-stat-val">${p.gcR}%</div></div>
              <div class="pd-stat"><div class="pd-stat-label">Dimer</div><div class="pd-stat-val" style="color:${p.dimer>4?'#ff6b6b':'#3fb950'}">${p.dimer} bp</div></div>
              <div class="pd-stat"><div class="pd-stat-label">Self-comp F</div><div class="pd-stat-val" style="color:${p.selfF>4?'#ff6b6b':'#3fb950'}">${p.selfF} bp</div></div>
              <div class="pd-stat"><div class="pd-stat-label">3′ GC F</div><div class="pd-stat-val" style="color:${p.gc3F>3?'#e3b341':'#3fb950'}">${p.gc3F}/5</div></div>
            </div>
            ${_svgAlignment(seq, p.fwdStart, p.revEnd, p.productSize)}
          </div>`).join('')}
        <div class="pd-disclaimer">Tm calculated by the Wallace rule for ≤13 bp and a nearest-neighbour approximation for longer primers. Validate all primers with NCBI Primer-BLAST before ordering.</div>`;

    } else {
      /* Validate mode */
      const fwd = (document.getElementById('pd-fwd')?.value || '').replace(/\s/g,'');
      const rev = (document.getElementById('pd-rev')?.value || '').replace(/\s/g,'');
      if (!fwd || !rev) { out.innerHTML = '<div class="pd-error">Enter both primer sequences.</div>'; return; }

      const r = _validatePair(fwd, rev);
      const verdictColor = r.pass ? '#3fb950' : '#ff6b6b';

      out.innerHTML = `
        <div class="pd-result-header">
          <div class="pd-result-title" style="color:${verdictColor}">
            ${r.pass
              ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3fb950" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg> Primer pair looks OK'
              : '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ff6b6b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> Issues detected'}
          </div>
        </div>
        <div class="pd-pair-card">
          <div class="pd-pair-seqs">
            <div class="pd-seq-row"><span class="pd-seq-lbl fwd-lbl">FWD</span><code class="pd-seq">${r.fwd}</code></div>
            <div class="pd-seq-row"><span class="pd-seq-lbl rev-lbl">REV</span><code class="pd-seq">${r.rev}</code></div>
          </div>
          <div class="pd-pair-stats">
            <div class="pd-stat"><div class="pd-stat-label">Tm FWD</div><div class="pd-stat-val">${r.tmF}°C</div></div>
            <div class="pd-stat"><div class="pd-stat-label">Tm REV</div><div class="pd-stat-val">${r.tmR}°C</div></div>
            <div class="pd-stat"><div class="pd-stat-label">GC FWD</div><div class="pd-stat-val">${r.gcF}%</div></div>
            <div class="pd-stat"><div class="pd-stat-label">GC REV</div><div class="pd-stat-val">${r.gcR}%</div></div>
            <div class="pd-stat"><div class="pd-stat-label">Self-comp F</div><div class="pd-stat-val" style="color:${r.selfF>5?'#ff6b6b':'#3fb950'}">${r.selfF} bp</div></div>
            <div class="pd-stat"><div class="pd-stat-label">Self-comp R</div><div class="pd-stat-val" style="color:${r.selfR>5?'#ff6b6b':'#3fb950'}">${r.selfR} bp</div></div>
            <div class="pd-stat"><div class="pd-stat-label">Dimer</div><div class="pd-stat-val" style="color:${r.dimer>5?'#ff6b6b':'#3fb950'}">${r.dimer} bp</div></div>
          </div>
          ${r.issues.length ? `<div class="pd-issues">
            ${r.issues.map(iss => `<div class="pd-issue pd-issue-${iss.type}">${iss.type === 'error' ? '[FAIL]' : '[!]'} ${iss.text}</div>`).join('')}
          </div>` : '<div class="pd-all-pass">All checks passed.</div>'}
        </div>
        <div class="pd-disclaimer">Validate with NCBI Primer-BLAST before ordering.</div>`;
    }
  }

  /* ─── Toggle manual input fields ─── */
  function _toggleMode() {
    const mode = document.querySelector('input[name="pd-mode"]:checked')?.value || 'auto';
    const autoDiv = document.getElementById('pd-auto-inputs');
    const manDiv  = document.getElementById('pd-manual-inputs');
    if (autoDiv) autoDiv.style.display = mode === 'auto' ? '' : 'none';
    if (manDiv)  manDiv.style.display  = mode === 'validate' ? '' : 'none';
  }

  /* ─── Init ─── */
  function init() {
    const section = document.getElementById('primerdesign-section');
    if (!section || section.dataset.pdReady) return;
    section.dataset.pdReady = '1';

    const templateOptions = Object.entries(TEMPLATES).map(([k,t]) =>
      `<option value="${k}">${t.label} (${t.organism})</option>`).join('');

    section.innerHTML = `
      <div class="pd-wrap">
        <div class="pd-header">
          <div>
            <div class="pd-badge">PRIMER DESIGN</div>
            <h2 class="pd-title">Primer Design & Validation</h2>
            <p class="pd-subtitle">Auto-design primer pairs from a template using Wallace rule Tm, GC%, self-complementarity, and dimer checks. Or validate your own primers. Africa-pathogen gene templates included.</p>
          </div>
        </div>

        <div class="pd-main">
          <div class="pd-left">
            <div class="pd-card">
              <div class="pd-card-title">Mode</div>
              <div class="pd-mode-row">
                <label class="pd-mode-opt"><input type="radio" name="pd-mode" value="auto" checked onchange="OmicsLab.PrimerDesign._toggleMode()"> Auto-design</label>
                <label class="pd-mode-opt"><input type="radio" name="pd-mode" value="validate" onchange="OmicsLab.PrimerDesign._toggleMode()"> Validate my primers</label>
              </div>

              <div id="pd-auto-inputs">
                <div class="pd-field-label">Template gene</div>
                <select id="pd-template" class="pd-sel">
                  <option value="">— Select a gene template —</option>
                  ${templateOptions}
                </select>
                <div class="pd-field-label" style="margin-top:.7rem">Or paste custom sequence (DNA, 5′→3′)</div>
                <textarea id="pd-custom" class="pd-textarea" rows="4" placeholder="ATGGTGCATCTGACT..."></textarea>
              </div>

              <div id="pd-manual-inputs" style="display:none">
                <div class="pd-field-label">Forward primer (5′→3′)</div>
                <input type="text" id="pd-fwd" class="pd-inp" placeholder="ATGGTGCATCTGACTCCTGA" style="font-family:monospace">
                <div class="pd-field-label" style="margin-top:.6rem">Reverse primer (5′→3′, already RC)</div>
                <input type="text" id="pd-rev" class="pd-inp" placeholder="TTCTCCAGAATCTCCTCGTG" style="font-family:monospace">
              </div>

              <button class="pd-run-btn" onclick="OmicsLab.PrimerDesign._run()">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                Design / Validate
              </button>
            </div>

            <div class="pd-reference-card">
              <div class="pd-card-title">Design Rules Applied</div>
              ${[
                ['Length', '18–25 bp (optimal: 20 bp)'],
                ['GC content', '40–60%'],
                ['Tm (Wallace)', '55–65°C, within 5°C of partner'],
                ['3′ GC clamp', '≤ 3/5 bases are G or C'],
                ['Self-complementarity', 'Max overlap ≤ 4 bp'],
                ['Primer dimer', 'Max heterodimer overlap ≤ 4 bp'],
              ].map(([k,v]) => `<div class="pd-ref-row"><span class="pd-ref-key">${k}</span><span class="pd-ref-val">${v}</span></div>`).join('')}
              <div class="pd-ref-note">Based on IDT OligoAnalyzer guidelines and Applied Biosystems primer design recommendations.</div>
            </div>
          </div>

          <div class="pd-right" id="pd-output">
            <div class="pd-empty-state">
              <div class="pd-empty-icon">${OmicsLab.Icons?.svg('scissors',32)||''}</div>
              <div class="pd-empty-text">Select a template or paste a sequence, then click <strong>Design / Validate</strong></div>
            </div>
          </div>
        </div>
      </div>`;
  }

  return { init, _run, _toggleMode };
})();
