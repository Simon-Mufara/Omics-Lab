/* ═══════════════════════════════════════════════════════════════
   OmicsLab — Epigenomics Explorer
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.Epigenomics = (function () {

  const HISTONE_MARKS = [
    { mark:'H3K4me3',  type:'Active Promoter',            color:'#3fb950', assoc:'RNA Pol II binding · TSS enrichment · high CpG density promoters', example:'BRCA1 promoter · HBB locus · rRNA genes' },
    { mark:'H3K4me1',  type:'Enhancer',                   color:'#e3b341', assoc:'Distal regulatory elements · poised or active enhancers · p300 co-factor binding', example:'Super-enhancers in T-cells · malaria invasion gene enhancers' },
    { mark:'H3K27ac',  type:'Active Enhancer',            color:'#58a6ff', assoc:'Active transcription · open chromatin · marks active over poised enhancers', example:'Active erythroid enhancers controlling HBB/HBG locus' },
    { mark:'H3K36me3', type:'Gene Body',                  color:'#bc8cff', assoc:'Transcribed gene bodies · splicing regulation · SETD2 writer · active elongation', example:'Highly expressed housekeeping genes · CYP2D6 in liver' },
    { mark:'H3K27me3', type:'Polycomb Repression',        color:'#f85149', assoc:'Gene silencing · developmental repression · PRC2 complex · bivalent in stem cells', example:'HOX genes in non-expressing tissues · tumour suppressor silencing' },
    { mark:'H3K9me3',  type:'Constitutive Heterochromatin',color:'#8b949e',assoc:'Centromeres · telomeres · silenced transposons · HP1 protein binding', example:'Pericentromeric repeats · silenced transposable elements' },
    { mark:'H3K9ac',   type:'Active Gene',                color:'#f97316', assoc:'Rapid gene activation · signal-responsive genes · early response loci', example:'Immune response genes in macrophages · IFN-stimulated genes' },
    { mark:'H3K4me2',  type:'Poised Enhancer',            color:'#79c0ff', assoc:'Primed but inactive enhancers · bivalent with H3K27me3 in pluripotent stem cells', example:'Developmental lineage enhancers in iPSCs and ES cells' },
  ];

  const METH_CONTEXTS = [
    { ctx:'CpG (5mC)',  pct:70,  desc:'Most common mammalian mark. Promoter CpG methylation → gene silencing. Gene-body methylation → active transcription. Written by DNMT1/3A/3B; removed by TET enzyme oxidation chain.', africa:'CpG hypomethylation in P. falciparum-infected erythrocytes alters cytoadherence gene expression at PfEMP1 var loci.' },
    { ctx:'CHG',        pct:10,  desc:'Predominant in plants. CMT3 enzyme. Critical for silencing transposable elements and maintaining genome stability in crop species.', africa:'CMT3 silences drought-responsive transposons in sorghum and millet grown across the Sahel and East Africa.' },
    { ctx:'CHH',        pct:5,   desc:'Plant-dominant context; rare in mammals. Found in neurons and embryonic stem cells as a non-CG methylation form.', africa:'CHH methylation in Arabidopsis under drought stress — relevant to African crop resilience and climate adaptation breeding.' },
    { ctx:'5hmC',       pct:2,   desc:'TET enzyme oxidation intermediate of 5mC. Enriched in brain, embryo, and ES cells. Active demethylation step via BER pathway. Potential gene activation mark.', africa:'5hmC depletion in malaria-associated Burkitt lymphoma versus endemic Burkitt tumour — potential diagnostic biomarker.' },
    { ctx:'m6A (RNA)',  pct:3,   desc:'N6-methyladenosine in mRNA. DRACH motif. METTL3/14 writers; FTO/ALKBH5 erasers; YTHDF1/2/3 readers. Regulates mRNA stability, splicing, and translation efficiency.', africa:'m6A reader YTHDF2 regulates P. falciparum mRNA stability during schizogony — drug target under active investigation.' },
    { ctx:'5fC / 5caC', pct:0.1, desc:'TET oxidation intermediates → base excision repair → demethylation. Enriched at active enhancers during cellular reprogramming and early embryogenesis.', africa:'Emerging epigenomic biomarkers in African cancer cohorts (H3Africa CancerEpi initiative, 2023–2026).' },
  ];

  const AFRICA_EPI = [
    { study:'H3Africa Epigenomics Consortium', finding:'Genome-wide methylation profiling across 12 African countries — HIV, TB, sickle cell, and cardiometabolic cohorts — building the first African epigenomic reference atlas (>5,000 samples).', doi:'10.1038/s41586-024-07798-0' },
    { study:'Malaria Epigenome (Broad / Wellcome Sanger)', finding:'P. falciparum chromatin organises into two transcriptional compartments during intraerythrocytic development. var gene switching (antigenic variation) is regulated by H3K9me3 boundaries at subtelomeric domains.', doi:'10.1016/j.cell.2019.10.023' },
    { study:'Sickle Cell & γ-Globin Reactivation', finding:'BCL11A erythroid enhancer (+62 kb intron 2) carries H3K27ac in erythroid progenitors. CRISPR disruption reactivates HbF to therapeutic levels (>20% HbF) — basis for Casgevy gene therapy.', doi:'10.1056/NEJMoa2032054' },
    { study:'TB Host Epigenetics (KEMRI / Wellcome)', finding:'M. tuberculosis reprograms host macrophage methylome at inflammatory loci within 72 h. HDAC inhibitors synergise with antibiotics to enhance killing in murine model — potential adjunct therapy.', doi:'10.1038/s41591-023-02451-9' },
    { study:'African Ancestry Methylation QTLs', finding:'meQTL analysis in AWI-Gen (11,000+ Africans, 6 sites) identifies 23 loci with ancestry-specific DNA methylation effects on cardiometabolic phenotypes not detected in European cohorts.', doi:'10.1016/j.ajhg.2023.05.007' },
  ];

  function init() {
    const container = document.getElementById('epigenomics-content');
    if (!container) return;
    if (container.querySelector('.epi-page')) return;
    try {
      container.innerHTML = `
<div class="epi-page">
  <header class="epi-header">
    <h1 class="epi-title">Epigenomics Explorer</h1>
    <p class="epi-sub">DNA methylation · histone modifications · chromatin accessibility · epigenetic regulation of African disease genes</p>
  </header>
  <div class="epi-tabs" role="tablist">
    <button class="epi-tab active" onclick="OmicsLab.Epigenomics.setTab('methylation',this)" role="tab">Methylation</button>
    <button class="epi-tab" onclick="OmicsLab.Epigenomics.setTab('histones',this)" role="tab">Histone Marks</button>
    <button class="epi-tab" onclick="OmicsLab.Epigenomics.setTab('chromatin',this)" role="tab">Chromatin Access</button>
    <button class="epi-tab" onclick="OmicsLab.Epigenomics.setTab('africa',this)" role="tab">Africa Studies</button>
  </div>
  <div id="epi-panel-methylation">${_buildMethPanel()}</div>
  <div id="epi-panel-histones" hidden>${_buildHistonePanel()}</div>
  <div id="epi-panel-chromatin" hidden>${_buildChromatinPanel()}</div>
  <div id="epi-panel-africa" hidden>${_buildAfricaPanel()}</div>
</div>`;
    } catch(e) { container.innerHTML = `<p style="color:#f85149;padding:2rem">Epigenomics load error: ${e}</p>`; }
  }

  function setTab(id, btn) {
    document.querySelectorAll('.epi-tab').forEach(t => t.classList.toggle('active', t === btn));
    ['methylation','histones','chromatin','africa'].forEach(p => {
      const el = document.getElementById('epi-panel-' + p);
      if (el) el.hidden = (p !== id);
    });
  }

  function _buildMethPanel() {
    const bars = METH_CONTEXTS.map(c => {
      const col = c.pct > 20 ? '#3fb950' : c.pct > 4 ? '#e3b341' : '#58a6ff';
      return `<div class="epi-meth-row">
        <div class="epi-meth-ctx">${c.ctx}</div>
        <div class="epi-meth-bar-wrap"><div class="epi-meth-bar" style="width:${Math.min(100,c.pct*1.3)}%;background:${col}"></div></div>
        <div class="epi-meth-pct">${c.pct}%</div>
      </div>
      <div class="epi-meth-body"><p class="epi-meth-desc">${c.desc}</p><p class="epi-meth-africa">${c.africa}</p></div>`;
    }).join('');

    return `
<div class="epi-concept-box">
  <div class="epi-concept-title">What is DNA Methylation?</div>
  <p class="epi-concept-body">Addition of a methyl group (CH₃) to cytosine, creating 5-methylcytosine (5mC). In mammals, this occurs predominantly at CpG dinucleotides. Promoter methylation silences genes; gene-body methylation associates with active transcription. TET enzymes oxidise 5mC through 5hmC → 5fC → 5caC, enabling active demethylation — critical during development and disease reprogramming.</p>
</div>
<div class="epi-meth-viz">
  <div class="epi-sb-title">Methylation Context Frequencies — Human &amp; Plant Genomes</div>
  ${bars}
</div>
<div class="epi-bisulfite-card">
  <div class="epi-sb-title">Bisulfite Sequencing (BS-seq) — How We Measure Methylation</div>
  <div class="epi-bs-steps">
    <div class="epi-bs-step"><span class="epi-bs-n">1</span><span>Sodium bisulfite converts unmethylated cytosine (C) → uracil (U), sequenced as T</span></div>
    <div class="epi-bs-step"><span class="epi-bs-n">2</span><span>Methylated 5mC resists conversion → still read as C after sequencing</span></div>
    <div class="epi-bs-step"><span class="epi-bs-n">3</span><span>Align converted reads to in-silico bisulfite-converted reference genome (Bismark/bsmap)</span></div>
    <div class="epi-bs-step"><span class="epi-bs-n">4</span><span>β-value = methylated reads ÷ total reads per CpG (range 0–1); M-value = log₂(β/(1−β))</span></div>
    <div class="epi-bs-step"><span class="epi-bs-n">5</span><span>WGBS: whole-genome (30× coverage); RRBS: CpG-rich regions (5× cheaper); EPIC array: 850K CpGs</span></div>
  </div>
</div>`;
  }

  function _buildHistonePanel() {
    const cards = HISTONE_MARKS.map(h => `
      <div class="epi-histone-card" style="border-top-color:${h.color}">
        <div class="epi-histone-mark" style="color:${h.color}">${h.mark}</div>
        <div class="epi-histone-type">${h.type}</div>
        <p class="epi-histone-assoc">${h.assoc}</p>
        <div class="epi-histone-eg"><span class="epi-eg-lbl">Example</span>${h.example}</div>
      </div>`).join('');

    return `
<div class="epi-concept-box">
  <div class="epi-concept-title">The Histone Code</div>
  <p class="epi-concept-body">Histone proteins are modified post-translationally at their N-terminal tails by writer enzymes (HATs, HMTs, kinases) and removed by erasers (HDACs, demethylases). Reader proteins recognise specific marks and recruit effector complexes that alter chromatin compaction and transcription. Combinations of marks — not individual modifications alone — determine the functional chromatin state.</p>
</div>
<div class="epi-histone-grid">${cards}</div>
<div class="epi-chip-card">
  <div class="epi-sb-title">ChIP-seq Workflow</div>
  <div class="epi-chip-steps">
    <div class="epi-chip-step"><span class="epi-cs-n">1</span>Cross-link protein–DNA with 1% formaldehyde (10 min, 37°C)</div>
    <div class="epi-chip-step"><span class="epi-cs-n">2</span>Sonicate chromatin → 200–500 bp fragments (Bioruptor or tip sonicator)</div>
    <div class="epi-chip-step"><span class="epi-cs-n">3</span>Immunoprecipitate with histone-mark antibody + protein A/G beads overnight</div>
    <div class="epi-chip-step"><span class="epi-cs-n">4</span>Wash, reverse cross-link, purify DNA → sequence (paired-end 150 bp)</div>
    <div class="epi-chip-step"><span class="epi-cs-n">5</span>Align reads (BWA/Bowtie2) → call peaks (MACS2) → annotate → GO enrichment</div>
    <div class="epi-chip-step"><span class="epi-cs-n">6</span>Alternative: CUT&amp;RUN / CUT&amp;TAG — antibody-tethered MNase, requires far fewer cells (1K–10K)</div>
  </div>
</div>`;
  }

  function _buildChromatinPanel() {
    const W = 340, H = 155;
    function gauss(x, mu, sig, amp) { return amp * Math.exp(-0.5 * ((x-mu)/sig)**2); }
    const pts = [];
    for (let x = 0; x <= W; x += 2) {
      let y = gauss(x,170,16,78) + gauss(x,108,20,38) + gauss(x,232,20,32) + gauss(x,55,18,18) + gauss(x,285,17,15);
      pts.push({ x, y: H - 22 - y });
    }
    const path  = 'M' + pts.map(p => `${p.x},${p.y.toFixed(1)}`).join('L');
    const fill  = path + `L${W},${H-22}L0,${H-22}Z`;

    const atacSvg = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" style="width:100%;display:block" aria-label="ATAC-seq simulated peak track">
      <defs><linearGradient id="eg-atac" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#58a6ff" stop-opacity=".55"/><stop offset="100%" stop-color="#58a6ff" stop-opacity=".04"/></linearGradient></defs>
      <line x1="0" y1="${H-22}" x2="${W}" y2="${H-22}" stroke="#21262d" stroke-width="1"/>
      <path d="${fill}" fill="url(#eg-atac)"/>
      <path d="${path}" fill="none" stroke="#58a6ff" stroke-width="1.6"/>
      <text x="170" y="11" text-anchor="middle" fill="#58a6ff" font-size="9" font-family="monospace">NFR</text>
      <line x1="170" y1="14" x2="170" y2="42" stroke="#58a6ff" stroke-width="1" stroke-dasharray="3,2"/>
      <text x="108" y="${H-6}" text-anchor="middle" fill="#6e7681" font-size="8" font-family="monospace">−1 nuc</text>
      <text x="232" y="${H-6}" text-anchor="middle" fill="#6e7681" font-size="8" font-family="monospace">+1 nuc</text>
    </svg>`;

    return `
<div class="epi-concept-box">
  <div class="epi-concept-title">Chromatin Accessibility — ATAC-seq</div>
  <p class="epi-concept-body">Open chromatin regions allow transcription factor binding and active gene regulation. ATAC-seq (Assay for Transposase-Accessible Chromatin) uses Tn5 transposase to insert sequencing adapters preferentially into nucleosome-free regions, producing a genome-wide accessibility map from as few as 500 cells. The NFR (nucleosome-free region) peak flanked by mono- and di-nucleosome peaks is a hallmark of active regulatory elements.</p>
</div>
<div class="epi-atac-layout">
  <div>
    <div class="epi-sb-title">Accessibility Assay Comparison</div>
    <div class="epi-assay-tbl">
      <div class="epi-at-hdr"><span>Assay</span><span>Input</span><span>Principle</span><span>Resolution</span></div>
      <div class="epi-at-row"><span class="epi-at-name">ATAC-seq</span><span>500–50K cells</span><span>Tn5 transposase</span><span>Single nucleosome</span></div>
      <div class="epi-at-row"><span class="epi-at-name">DNase-seq</span><span>1M+ cells</span><span>DNase I cleavage</span><span>10 bp footprint</span></div>
      <div class="epi-at-row"><span class="epi-at-name">FAIRE-seq</span><span>500K cells</span><span>Formaldehyde isolation</span><span>150–300 bp</span></div>
      <div class="epi-at-row"><span class="epi-at-name">scATAC-seq</span><span>Single cell</span><span>Tn5 + cell barcode</span><span>Cell-type resolution</span></div>
    </div>
    <div class="epi-atac-pipeline">
      <div class="epi-sb-title" style="margin-top:1.25rem">ATAC-seq Analysis Steps</div>
      <div class="epi-ap-step"><span class="epi-ap-n">1</span>Trim adapters (Trimmomatic) → align (Bowtie2 —very-sensitive)</div>
      <div class="epi-ap-step"><span class="epi-ap-n">2</span>Filter: remove mitochondrial reads + PCR duplicates (picard)</div>
      <div class="epi-ap-step"><span class="epi-ap-n">3</span>Shift reads +4 bp (forward) / −5 bp (reverse) to centre on Tn5</div>
      <div class="epi-ap-step"><span class="epi-ap-n">4</span>Call peaks: MACS2 —nomodel —shift 37 —extsize 73</div>
      <div class="epi-ap-step"><span class="epi-ap-n">5</span>Annotate (ChIPseeker) · motif enrichment (HOMER / FIMO)</div>
      <div class="epi-ap-step"><span class="epi-ap-n">6</span>Differential accessibility: DiffBind · edgeR · DESeq2</div>
    </div>
  </div>
  <div>
    <div class="epi-sb-title">Simulated ATAC-seq Peak Track</div>
    ${atacSvg}
    <p class="epi-atac-note">NFR (nucleosome-free region, ~150 bp) flanked by −1/+1 nucleosome peaks (200 bp) and −2/+2 peaks (400 bp) — the "nucleosome staircase" characteristic of active regulatory elements</p>
  </div>
</div>`;
  }

  function _buildAfricaPanel() {
    const cards = AFRICA_EPI.map(s => `
      <div class="epi-africa-card">
        <div class="epi-af-study">${s.study}</div>
        <p class="epi-af-finding">${s.finding}</p>
        <div class="epi-af-doi">DOI: ${s.doi}</div>
      </div>`).join('');

    return `
<div class="epi-concept-box">
  <div class="epi-concept-title">Why African Epigenomics Matters</div>
  <p class="epi-concept-body">The African epigenome reflects unique environmental exposures (endemic malaria, TB, HIV), the world's highest genetic diversity, and distinct developmental contexts. Standard epigenomic references (ENCODE, Roadmap Epigenomics) are overwhelmingly from European and East Asian donors. Building Africa-first epigenomic atlases is a stated priority for H3Africa, NIH HERA, and Wellcome.</p>
</div>
<div class="epi-africa-grid">${cards}</div>
<div class="epi-tools-card">
  <div class="epi-sb-title">Key Epigenomics Tools</div>
  <div class="epi-tools-grid">
    <div class="epi-tool"><span class="epi-tool-name">Bismark</span><span class="epi-tool-use">BS-seq alignment · methylation calling</span></div>
    <div class="epi-tool"><span class="epi-tool-name">methylKit</span><span class="epi-tool-use">R · differential methylation · DMRs</span></div>
    <div class="epi-tool"><span class="epi-tool-name">DeepTools</span><span class="epi-tool-use">ChIP/ATAC QC · bigWig · heatmaps</span></div>
    <div class="epi-tool"><span class="epi-tool-name">MACS2/3</span><span class="epi-tool-use">Peak calling · ChIP · ATAC</span></div>
    <div class="epi-tool"><span class="epi-tool-name">HOMER</span><span class="epi-tool-use">Motif enrichment · peak annotation</span></div>
    <div class="epi-tool"><span class="epi-tool-name">ChromHMM</span><span class="epi-tool-use">HMM · 15-state chromatin annotation</span></div>
    <div class="epi-tool"><span class="epi-tool-name">ArchR</span><span class="epi-tool-use">scATAC-seq · clustering · trajectory</span></div>
    <div class="epi-tool"><span class="epi-tool-name">minfi</span><span class="epi-tool-use">Illumina EPIC array · QC · normalization</span></div>
  </div>
</div>`;
  }

  return { init, setTab };
})();
