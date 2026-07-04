/* ═══════════════════════════════════════════════════════════════
   OmicsLab — Sequence Alignment Explorer
   window.OmicsLab.SeqAlign
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.SeqAlign = (function () {

  /* ─── Presets ─── */
  const PRESETS = [
    { id: 'hbb', name: 'HBB Sickle Cell', type: 'DNA',
      seq1: 'ATGGTGCACCTGACTCCTGAGGAGAAGTCTGCCGTTACT', seq2: 'ATGGTGCACCTGACTCCTGTGGAGAAGTCTGCCGTTACT',
      note: 'HBB codon 6: GAG→GTG (Glu→Val). The A→T SNP (rs334) causes sickle cell disease. Highly prevalent in African populations due to malaria heterozygote advantage.' },
    { id: 'rpob', name: 'rpoB Rifampicin Resistance', type: 'DNA',
      seq1: 'CGCGATCAAGGAGTTCTTCGGCACCAGCCAGCTGAGCCAATTCATGGAC', seq2: 'CGCGATCAAGGAGTTCTTCGGCACCAGCCAGCTGAGCCAGTTCATGGAC',
      note: 'M. tuberculosis rpoB H526Y mutation (CAC→TAC): the most common rifampicin-resistance mutation found in MDR-TB clinical isolates in South Africa and Mozambique.' },
    { id: 'kelch13', name: 'kelch13 Artemisinin Resistance', type: 'Protein',
      seq1: 'MLKNFKNSSSFHYNEIATFFKDNLNQKLIEIPNLKS', seq2: 'MLKNFKNSSSFHYNEIATFFKDNLNQKLIEIPYLKS',
      note: 'P. falciparum kelch13 C580Y (TGT→TAT): most common Southeast Asian artemisinin-resistance mutation; rare in Africa — important surveillance target for MalariaGEN.' },
    { id: 'cyp2b6', name: 'CYP2B6 Efavirenz Metabolism', type: 'Protein',
      seq1: 'MASSSPQQGTPLHHTLVHNLCAAHEPRYKAMVVSAARTLLAAFQLKQKG', seq2: 'MASSSPQQGTPLHHTLVHNLCAAHEPRYKAMVVSAQRTLLAAFQLKQKG',
      note: 'CYP2B6 Q172H variant: affects efavirenz (HIV drug) metabolism. *6 allele frequency is ~40-50% in sub-Saharan Africa — much higher than other populations, affecting standard dosing.' },
  ];

  /* ─── Scoring matrices ─── */
  const MATRICES = {
    'Simple DNA': { match: 2, mismatch: -1, gap: -2, type: 'dna' },
    'BLOSUM62':   { gap: -4, type: 'protein',
      scores: { A:{A:4,R:-1,N:-2,D:-2,C:0,Q:-1,E:-1,G:0,H:-2,I:-1,L:-1,K:-1,M:-1,F:-2,P:-1,S:1,T:0,W:-3,Y:-2,V:0}, R:{A:-1,R:5,N:0,D:-2,C:-3,Q:1,E:0,G:-2,H:0,I:-3,L:-2,K:2,M:-1,F:-3,P:-2,S:-1,T:-1,W:-3,Y:-2,V:-3}, /* ... simplified for common AAs */ }
    },
    'PAM250': { gap: -8, type: 'protein', match: 2, mismatch: -1 },
  };

  let _state = {
    preset: 'hbb',
    mode: 'global', /* global | local */
    matrix: 'Simple DNA',
    seq1: '', seq2: '',
    result: null,
  };

  /* ════════ INIT ════════ */
  function init() {
    const container = document.getElementById('seq-align-content');
    if (!container || container.querySelector('.sa-page')) return;
    try {
      _state.seq1 = PRESETS[0].seq1;
      _state.seq2 = PRESETS[0].seq2;
      _render(container);
    } catch(e) { console.error('SeqAlign init error:', e); throw e; }
  }

  function _render(container) {
    container.innerHTML = `
    <div class="sa-page">
      <div class="sa-header">
        <h1 class="sa-title">Sequence Alignment Explorer</h1>
        <p class="sa-sub">Visualise pairwise alignment algorithms, dynamic programming matrices, and multiple sequence alignment — with real African pathogen and disease gene examples.</p>
      </div>

      <div class="sa-controls-row">
        <div class="sa-presets">
          <div class="sa-ctrl-label">Preset sequences</div>
          <div class="sa-preset-btns">
            ${PRESETS.map(p=>`
              <button class="sa-preset-btn${p.id===_state.preset?' active':''}" onclick="OmicsLab.SeqAlign.loadPreset('${p.id}')">${p.name}</button>
            `).join('')}
          </div>
        </div>
        <div class="sa-mode-row">
          <div class="sa-ctrl-label">Algorithm</div>
          <div class="sa-mode-btns">
            <button class="sa-mode-btn${_state.mode==='global'?' active':''}" onclick="OmicsLab.SeqAlign.setMode('global')">Needleman-Wunsch (Global)</button>
            <button class="sa-mode-btn${_state.mode==='local'?' active':''}" onclick="OmicsLab.SeqAlign.setMode('local')">Smith-Waterman (Local)</button>
          </div>
        </div>
      </div>

      <div class="sa-seq-inputs">
        <div class="sa-seq-group">
          <label class="sa-seq-label">Sequence 1</label>
          <textarea class="sa-seq-input" id="sa-seq1" rows="2" placeholder="Enter DNA or protein sequence" spellcheck="false">${_state.seq1}</textarea>
        </div>
        <div class="sa-seq-group">
          <label class="sa-seq-label">Sequence 2</label>
          <textarea class="sa-seq-input" id="sa-seq2" rows="2" placeholder="Enter DNA or protein sequence" spellcheck="false">${_state.seq2}</textarea>
        </div>
        <button class="sa-align-btn" onclick="OmicsLab.SeqAlign.align()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          Align
        </button>
      </div>

      <div id="sa-preset-note" class="sa-preset-note">${PRESETS[0].note}</div>
      <div id="sa-result-section" style="display:none"></div>

      <div class="sa-theory-section">
        <div class="sa-sb-title">Algorithm Comparison</div>
        <div class="sa-algo-compare">
          <div class="sa-algo-card" style="border-top-color:#00C4A0">
            <div class="sa-algo-name" style="color:#00C4A0">Needleman-Wunsch (Global)</div>
            <div class="sa-algo-type">Dynamic Programming — O(mn) time & space</div>
            <p class="sa-algo-desc">Aligns the <em>entire length</em> of both sequences. Best for: closely related sequences of similar length (e.g., orthologous genes, variant comparison). Initialises first row/column with gap penalties.</p>
            <div class="sa-algo-eg">HBB WT vs HbS — identify exact position of Glu6Val substitution</div>
          </div>
          <div class="sa-algo-card" style="border-top-color:#58a6ff">
            <div class="sa-algo-name" style="color:#58a6ff">Smith-Waterman (Local)</div>
            <div class="sa-algo-type">Dynamic Programming — O(mn) time & space</div>
            <p class="sa-algo-desc">Finds the highest-scoring <em>local</em> alignment — the best-matching subsequence. Best for: finding conserved domains within longer divergent sequences. Scores never go below zero.</p>
            <div class="sa-algo-eg">Finding the RNAP binding domain in rpoB across mycobacterial species</div>
          </div>
          <div class="sa-algo-card" style="border-top-color:#bc8cff">
            <div class="sa-algo-name" style="color:#bc8cff">BLAST (Heuristic)</div>
            <div class="sa-algo-type">Heuristic — O(mn) worst case, O(n) average</div>
            <p class="sa-algo-desc">Seeds with exact k-mer matches then extends. Not optimal but fast enough for billion-nucleotide databases. Uses substitution matrices (BLOSUM62) and E-value statistics.</p>
            <div class="sa-algo-eg">Querying a novel SARS-CoV-2 spike sequence against NCBI nt/nr in seconds</div>
          </div>
          <div class="sa-algo-card" style="border-top-color:#e3b341">
            <div class="sa-algo-name" style="color:#e3b341">ClustalΩ / MAFFT (MSA)</div>
            <div class="sa-algo-type">Progressive / Iterative — O(n² log n)</div>
            <p class="sa-algo-desc">Multiple Sequence Alignment: first builds a guide tree (neighbour-joining), then aligns sequences pairwise along the tree. MAFFT uses FFT for fast sequence comparison. Output used for phylogenetic tree building.</p>
            <div class="sa-algo-eg">Aligning 50 KEMRI malaria kelch13 sequences to identify variant positions across samples</div>
          </div>
        </div>

        <div class="sa-scoring-section">
          <div class="sa-sb-title" style="margin-bottom:0.75rem">Scoring Matrix & Gap Penalties Explained</div>
          <div class="sa-scoring-grid">
            <div class="sa-scoring-card">
              <div class="sa-sc-name">Match / Mismatch (DNA)</div>
              <p class="sa-sc-body">Simple: +2 for match, −1 for mismatch. Every position is compared and scored. The gap penalty (−2 per gap) must be calibrated — too harsh means the aligner avoids biologically real insertions.</p>
              <div class="sa-sc-matrix">
                <table class="sa-mini-matrix">
                  <tr><th></th><th>A</th><th>T</th><th>G</th><th>C</th></tr>
                  <tr><th>A</th><td class="m">+2</td><td class="mm">−1</td><td class="mm">−1</td><td class="mm">−1</td></tr>
                  <tr><th>T</th><td class="mm">−1</td><td class="m">+2</td><td class="mm">−1</td><td class="mm">−1</td></tr>
                  <tr><th>G</th><td class="mm">−1</td><td class="mm">−1</td><td class="m">+2</td><td class="mm">−1</td></tr>
                  <tr><th>C</th><td class="mm">−1</td><td class="mm">−1</td><td class="mm">−1</td><td class="m">+2</td></tr>
                </table>
              </div>
            </div>
            <div class="sa-scoring-card">
              <div class="sa-sc-name">BLOSUM62 (Protein)</div>
              <p class="sa-sc-body">Derived from observed substitution frequencies in aligned protein blocks. Positive scores = substitutions seen more often than random; negative = avoided. Conservative substitutions (Ile↔Val) score higher than radical ones (Glu↔Trp).</p>
              <div class="sa-sc-matrix">
                <table class="sa-mini-matrix">
                  <tr><th></th><th>A</th><th>I</th><th>V</th><th>K</th><th>W</th></tr>
                  <tr><th>A</th><td class="m">4</td><td class="mm">−1</td><td class="mm">0</td><td class="mm">−1</td><td class="mm">−3</td></tr>
                  <tr><th>I</th><td class="mm">−1</td><td class="m">4</td><td class="half">3</td><td class="mm">−1</td><td class="mm">−3</td></tr>
                  <tr><th>V</th><td class="mm">0</td><td class="half">3</td><td class="m">4</td><td class="mm">−2</td><td class="mm">−3</td></tr>
                  <tr><th>K</th><td class="mm">−1</td><td class="mm">−1</td><td class="mm">−2</td><td class="m">5</td><td class="mm">−3</td></tr>
                  <tr><th>W</th><td class="mm">−3</td><td class="mm">−3</td><td class="mm">−3</td><td class="mm">−3</td><td class="m">11</td></tr>
                </table>
              </div>
            </div>
            <div class="sa-scoring-card">
              <div class="sa-sc-name">Gap Penalty Models</div>
              <p class="sa-sc-body">Linear gap penalty: every gap costs the same (−2 per position). Affine gap penalty (open+extend): opening a gap costs more (−10) than extending it (−0.5 per position) — biologically realistic since indels tend to occur in runs.</p>
              <div style="margin-top:0.75rem;display:flex;flex-direction:column;gap:0.5rem">
                <div class="sa-gap-example"><span class="sa-gap-type">Linear (−2/gap)</span><span class="sa-gap-seq">A-T-G vs A-TT-G → gap at each position costs −2 each</span></div>
                <div class="sa-gap-example"><span class="sa-gap-type">Affine (−10+−0.5/pos)</span><span class="sa-gap-seq">Opening 3-nt gap: −10 + (−0.5×3) = −11.5 vs 3 single gaps: −12</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>`;
  }

  /* ════════ ALIGN ════════ */
  function align() {
    const s1 = (document.getElementById('sa-seq1')?.value || _state.seq1).toUpperCase().replace(/\s/g,'');
    const s2 = (document.getElementById('sa-seq2')?.value || _state.seq2).toUpperCase().replace(/\s/g,'');
    if (!s1 || !s2) return;
    if (s1.length > 60 || s2.length > 60) {
      const el = document.getElementById('sa-result-section');
      if (el) { el.style.display=''; el.innerHTML='<div class="sa-error">Sequences must be ≤60 characters for the DP table visualisation. Longer sequences are aligned by BLAST in a real workflow.</div>'; }
      return;
    }
    _state.seq1 = s1; _state.seq2 = s2;
    const result = _state.mode === 'global' ? _nw(s1, s2) : _sw(s1, s2);
    _state.result = result;
    _renderResult(result, s1, s2);
  }

  /* ─── Needleman-Wunsch ─── */
  function _nw(s1, s2, match=2, mm=-1, gap=-2) {
    const m=s1.length, n=s2.length;
    const dp=Array.from({length:m+1},(_,i)=>Array.from({length:n+1},(_,j)=>i===0?j*gap:j===0?i*gap:0));
    for(let i=1;i<=m;i++) for(let j=1;j<=n;j++){
      const score=s1[i-1]===s2[j-1]?match:mm;
      dp[i][j]=Math.max(dp[i-1][j-1]+score, dp[i-1][j]+gap, dp[i][j-1]+gap);
    }
    /* traceback */
    let i=m,j=n,a1='',a2='',mid='';
    while(i>0&&j>0){
      const score=s1[i-1]===s2[j-1]?match:mm;
      if(dp[i][j]===dp[i-1][j-1]+score){a1=s1[i-1]+a1;a2=s2[j-1]+a2;mid=(s1[i-1]===s2[j-1]?'|':' ')+mid;i--;j--;}
      else if(dp[i][j]===dp[i-1][j]+gap){a1=s1[i-1]+a1;a2='-'+a2;mid=' '+mid;i--;}
      else{a1='-'+a1;a2=s2[j-1]+a2;mid=' '+mid;j--;}
    }
    while(i>0){a1=s1[i-1]+a1;a2='-'+a2;mid=' '+mid;i--;}
    while(j>0){a1='-'+a1;a2=s2[j-1]+a2;mid=' '+mid;j--;}
    return {dp,a1,a2,mid,score:dp[m][n],s1,s2,algorithm:'Needleman-Wunsch (Global)'};
  }

  /* ─── Smith-Waterman ─── */
  function _sw(s1, s2, match=2, mm=-1, gap=-2) {
    const m=s1.length, n=s2.length;
    const dp=Array.from({length:m+1},()=>new Array(n+1).fill(0));
    let maxScore=0, maxI=0, maxJ=0;
    for(let i=1;i<=m;i++) for(let j=1;j<=n;j++){
      const score=s1[i-1]===s2[j-1]?match:mm;
      dp[i][j]=Math.max(0, dp[i-1][j-1]+score, dp[i-1][j]+gap, dp[i][j-1]+gap);
      if(dp[i][j]>maxScore){maxScore=dp[i][j];maxI=i;maxJ=j;}
    }
    /* traceback from max */
    let i=maxI,j=maxJ,a1='',a2='',mid='';
    while(i>0&&j>0&&dp[i][j]>0){
      const score=s1[i-1]===s2[j-1]?match:mm;
      if(dp[i][j]===dp[i-1][j-1]+score){a1=s1[i-1]+a1;a2=s2[j-1]+a2;mid=(s1[i-1]===s2[j-1]?'|':' ')+mid;i--;j--;}
      else if(dp[i][j]===dp[i-1][j]+gap){a1=s1[i-1]+a1;a2='-'+a2;mid=' '+mid;i--;}
      else{a1='-'+a1;a2=s2[j-1]+a2;mid=' '+mid;j--;}
    }
    return {dp,a1,a2,mid,score:maxScore,s1,s2,algorithm:'Smith-Waterman (Local)'};
  }

  /* ─── Render result ─── */
  function _renderResult(res, s1, s2) {
    const el = document.getElementById('sa-result-section');
    if (!el) return;
    el.style.display = '';

    /* Identity */
    const matches = [...res.mid].filter(c=>c==='|').length;
    const identity = (matches/res.a1.length*100).toFixed(1);
    const gaps = [...res.a1].filter(c=>c==='-').length + [...res.a2].filter(c=>c==='-').length;

    /* DP table (truncated to 20x20) */
    const showM = Math.min(s1.length, 18), showN = Math.min(s2.length, 18);
    let table = `<table class="sa-dp-table"><tr><th></th><th></th>${s2.slice(0,showN).split('').map(c=>`<th>${c}</th>`).join('')}</tr>`;
    for(let i=0;i<=showM;i++){
      table += `<tr><th>${i===0?'':s1[i-1]||''}</th>`;
      for(let j=0;j<=showN;j++){
        const v=res.dp[i][j];
        const max=res.dp.flat().reduce((a,b)=>Math.max(a,b),0);
        const intensity=max>0?Math.max(0,v/max):0;
        const bg=_state.mode==='local'
          ? (v===res.score&&v>0?'#00C4A0':v>0?`rgba(0,196,160,${(intensity*0.7).toFixed(2)})`:'#0D1524')
          : (v===res.dp[s1.length][s2.length]?'#58a6ff':v>0?`rgba(88,166,255,${(intensity*0.5).toFixed(2)})`:'#0D1524');
        table+=`<td style="background:${bg};color:${v<0?'#6E6860':'#A8A098'}">${v}</td>`;
      }
      table+=`</tr>`;
    }
    table += '</table>';
    if (s1.length > 18 || s2.length > 18) table += `<div class="sa-dp-note">Table truncated to 18×18. Full alignment shown below.</div>`;

    /* Alignment display */
    const CHUNK = 50;
    let alignHTML = '';
    for(let i=0;i<res.a1.length;i+=CHUNK){
      const chunk1 = res.a1.slice(i,i+CHUNK);
      const chunkM = res.mid.slice(i,i+CHUNK);
      const chunk2 = res.a2.slice(i,i+CHUNK);
      alignHTML += `<div class="sa-aln-block">
        <span class="sa-aln-pos">${String(i+1).padStart(4,' ')}</span>
        <span class="sa-aln-seq">${_colorAln(chunk1)}</span>
        <span class="sa-aln-end">${i+chunk1.length}</span>
      </div>
      <div class="sa-aln-block">
        <span class="sa-aln-pos">    </span>
        <span class="sa-aln-mid">${chunkM}</span>
      </div>
      <div class="sa-aln-block">
        <span class="sa-aln-pos">${String(i+1).padStart(4,' ')}</span>
        <span class="sa-aln-seq">${_colorAln(chunk2)}</span>
        <span class="sa-aln-end">${i+chunk2.length}</span>
      </div><br>`;
    }

    el.innerHTML = `
    <div class="sa-result-card">
      <div class="sa-result-header">
        <div class="sa-result-title">${res.algorithm} Result</div>
        <div class="sa-result-stats">
          <div class="sa-stat-box"><span class="sa-stat-val">${identity}%</span><span class="sa-stat-label">Identity</span></div>
          <div class="sa-stat-box"><span class="sa-stat-val">${res.score}</span><span class="sa-stat-label">Score</span></div>
          <div class="sa-stat-box"><span class="sa-stat-val">${matches}</span><span class="sa-stat-label">Matches</span></div>
          <div class="sa-stat-box"><span class="sa-stat-val">${gaps}</span><span class="sa-stat-label">Gaps</span></div>
        </div>
      </div>
      <div class="sa-result-body">
        <div class="sa-dp-section">
          <div class="sa-sb-title">Dynamic Programming Matrix <span style="color:#6E6860;font-weight:400;font-size:0.7rem">(highlighted: optimal path / maximum score)</span></div>
          <div class="sa-dp-wrap">${table}</div>
        </div>
        <div class="sa-aln-section">
          <div class="sa-sb-title">Pairwise Alignment</div>
          <div class="sa-aln-box"><pre class="sa-aln-pre">${alignHTML}</pre></div>
        </div>
      </div>
    </div>`;
  }

  function _colorAln(seq) {
    return seq.split('').map(c=>{
      const colors = {A:'#00C4A0',T:'#58a6ff',G:'#e3b341',C:'#f97316',U:'#bc8cff','-':'#f85149'};
      const col = colors[c] || '#A8A098';
      return `<span style="color:${col}">${c}</span>`;
    }).join('');
  }

  function loadPreset(id) {
    const p = PRESETS.find(x=>x.id===id);
    if (!p) return;
    _state.preset = id;
    _state.seq1 = p.seq1;
    _state.seq2 = p.seq2;
    _state.mode = p.type === 'DNA' ? 'global' : 'local';
    document.querySelectorAll('.sa-preset-btn').forEach(b=>b.classList.toggle('active', b.textContent===p.name));
    document.querySelectorAll('.sa-mode-btn').forEach(b=>b.classList.toggle('active', b.textContent.startsWith(_state.mode==='global'?'Needleman':'Smith')));
    const in1=document.getElementById('sa-seq1'), in2=document.getElementById('sa-seq2');
    if(in1) in1.value=p.seq1;
    if(in2) in2.value=p.seq2;
    const note=document.getElementById('sa-preset-note');
    if(note) note.textContent=p.note;
    const res=document.getElementById('sa-result-section');
    if(res) res.style.display='none';
  }

  function setMode(mode) {
    _state.mode = mode;
    document.querySelectorAll('.sa-mode-btn').forEach(b=>b.classList.toggle('active',
      (mode==='global'&&b.textContent.startsWith('Needleman'))||(mode==='local'&&b.textContent.startsWith('Smith'))));
  }

  return { init, align, loadPreset, setMode };
})();
