/* ═══════════════════════════════════════════════════════════════
   OmicsLab — Proteomics Fundamentals
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.Proteomics = (function () {

  const IONIZATION = [
    { method:'ESI (Electrospray Ionisation)', type:'Liquid-based', use:'LC-MS/MS · proteins · peptides · metabolites · large biomolecules', chars:'Soft ionisation (minimal fragmentation) · produces multiply charged ions [M+nH]ⁿ⁺ · compatible with online LC', africa:'Standard for HIV protease inhibitor pharmacokinetics in African patient cohorts' },
    { method:'MALDI (Matrix-Assisted Laser Desorption)', type:'Solid/plate', use:'Intact protein fingerprinting · MALDI-TOF for pathogen ID · imaging mass spec', chars:'Single charge [M+H]⁺ typical · robust · high throughput · incompatible with LC online', africa:'MALDI-TOF used in TB clinical diagnostics at NHLS (South Africa) — identifies 97% of M. tuberculosis within 2h' },
    { method:'APCI (Atmospheric Pressure Chemical Ionisation)', type:'Gas-phase', use:'Small molecules · lipids · drugs · metabolites under 1500 Da', chars:'Proton transfer ionisation · handles non-polar compounds poorly ionised by ESI', africa:'Malaria drug (artemisinin) quantification in dried blood spots from African trial participants' },
    { method:'NanoESI', type:'Chip / nanospray', use:'Ultra-low input proteomics · single-cell · clinical biopsies · rare samples', chars:'Flow rate 20–200 nL/min · higher sensitivity than standard ESI · reduced sample consumption', africa:'Single-cell proteomics of P. falciparum ring-stage parasites — requires nanospray for parasite mass ≤45 fL' },
  ];

  const QUANT_METHODS = [
    { name:'Label-Free Quantification (LFQ)', type:'Label-Free', color:'#3fb950', desc:'Peptide peak areas compared across LC-MS runs without chemical labels. Simplest and cheapest — no labelling reagent cost. Requires excellent chromatographic reproducibility (CV <5%) and alignment algorithms (MaxQuant LFQ or FlashLFQ).', use:'Discovery proteomics · serum biomarkers · clinical sample series · >12 conditions', limit:'Run-to-run variation · missing values · requires more replicates' },
    { name:'TMT (Tandem Mass Tags)', type:'Isobaric Labels', color:'#58a6ff', desc:'Chemical tags of identical mass label peptides from different samples. Mixed in equal amounts, co-isolated for fragmentation. Tag reporter ions (126–135 Da) quantified in MS3 or MS2. Up to 18-plex (TMTpro 18) enables very high sample throughput.', use:'Time-course · drug response · large clinical cohorts · phosphoproteomics', limit:'Co-isolation interference (ratio compression) · high reagent cost' },
    { name:'SILAC (Stable Isotope Labelling)', type:'Metabolic Labels', color:'#e3b341', desc:'Cells grown in ¹³C/¹⁵N-labelled amino acids (heavy Lys/Arg) — label incorporated into all newly synthesised proteins. Heavy and light samples mixed 1:1, measured in MS1. Gold standard for cell culture proteomics.', use:'Cell biology · signalling · protein turnover · SILAC mouse', limit:'Not applicable to primary patient samples or tissues · expensive heavy amino acids' },
    { name:'Targeted MRM/PRM', type:'Targeted', color:'#bc8cff', desc:'Pre-selected peptide transitions monitored in multiple reaction monitoring (triple-quadrupole) or parallel reaction monitoring (high-res Orbitrap). Extremely high sensitivity and reproducibility (CV 2–5%). Ideal for biomarker verification.', use:'Biomarker validation · clinical diagnostics · drug PK/PD · specific protein quantification in complex matrices', limit:'Low multiplexing (30–200 peptides) · requires prior knowledge of targets' },
  ];

  const AFRICA_PROT = [
    { study:'Plasmodium falciparum Proteome', finding:'Complete intraerythrocytic developmental proteome mapped — 3,208 proteins quantified across 6 developmental stages (ring, trophozoite, schizont, gametocyte). Identifies drug targets in metabolic stages absent from genome annotation.', doi:'10.1126/science.1260403' },
    { study:'TB Serum Biomarkers (SA)', finding:'Discovery of 4-protein signature (NCAM1, CXCL10, CD14, LILRB2) in serum of active TB patients vs latent TB vs healthy controls in South African cohort — 96% sensitivity, 92% specificity. Validated in 350-person Uganda cohort.', doi:'10.1016/j.chom.2021.09.005' },
    { study:'HIV-1 Host Proteome', finding:'Quantitative proteomics of CD4+ T cells from viremic vs suppressed HIV patients in Durban identifies 285 differentially abundant proteins; SAMHD1 and BST-2 restriction factors restored under ART — potential predictors of viral rebound.', doi:'10.1016/j.celrep.2022.110756' },
    { study:'Sickle Cell Erythrocyte Proteome', finding:'Sickle erythrocyte proteome (Nigeria/UCT cohort) shows 162 proteins differentially abundant vs normal — vesicle proteins (flotillin-1, stomatin), oxidative stress markers, and complement regulators changed. Links to vaso-occlusive crisis frequency.', doi:'10.1182/blood.2020010240' },
    { study:'African Cancer Proteogenomics (IARC/H3Africa)', finding:'Proteogenomic profiling of triple-negative breast cancer in 82 Nigerian women reveals African-specific molecular subtype driven by BRCA2 loss and alternative splicing — different from TCGA profiles, requires Africa-specific therapeutic strategy.', doi:'10.1016/j.ccell.2024.02.001' },
  ];

  function init() {
    const container = document.getElementById('proteomics-content');
    if (!container) return;
    if (container.querySelector('.prot-page')) return;
    try {
      container.innerHTML = `
<div class="prot-page">
  <header class="prot-header">
    <h1 class="prot-title">Proteomics Fundamentals</h1>
    <p class="prot-sub">Mass spectrometry · LC-MS/MS workflow · protein identification · quantification strategies · African disease proteomics</p>
  </header>
  <div class="prot-tabs" role="tablist">
    <button class="prot-tab active" onclick="OmicsLab.Proteomics.setTab('ms',this)">MS Basics</button>
    <button class="prot-tab" onclick="OmicsLab.Proteomics.setTab('workflow',this)">Workflow</button>
    <button class="prot-tab" onclick="OmicsLab.Proteomics.setTab('quant',this)">Quantification</button>
    <button class="prot-tab" onclick="OmicsLab.Proteomics.setTab('africa',this)">Africa Studies</button>
  </div>
  <div id="prot-panel-ms">${_msPanel()}</div>
  <div id="prot-panel-workflow" hidden>${_workflowPanel()}</div>
  <div id="prot-panel-quant" hidden>${_quantPanel()}</div>
  <div id="prot-panel-africa" hidden>${_africaPanel()}</div>
</div>`;
    } catch(e) { container.innerHTML = `<p style="color:#f85149;padding:2rem">Proteomics module error: ${e}</p>`; }
  }

  function setTab(id, btn) {
    document.querySelectorAll('.prot-tab').forEach(t => t.classList.toggle('active', t === btn));
    ['ms','workflow','quant','africa'].forEach(p => {
      const el = document.getElementById('prot-panel-' + p);
      if (el) el.hidden = (p !== id);
    });
  }

  function _msPanel() {
    const iCards = IONIZATION.map(i => `
      <div class="prot-ion-card">
        <div class="prot-ion-name">${i.method}</div>
        <div class="prot-ion-type">${i.type}</div>
        <div class="prot-ion-row"><span class="prot-il">Use</span>${i.use}</div>
        <div class="prot-ion-row"><span class="prot-il">Characteristics</span>${i.chars}</div>
        <div class="prot-ion-africa"><span class="prot-il">Africa context</span>${i.africa}</div>
      </div>`).join('');

    const specSvg = _drawSpectrum();

    return `
<div class="prot-concept-box">
  <div class="prot-concept-title">How Mass Spectrometry Works</div>
  <p class="prot-concept-body">Mass spectrometry measures the mass-to-charge ratio (m/z) of gas-phase ions. In proteomics, proteins are digested by trypsin into peptides, ionised (most commonly by ESI), separated by m/z in a mass analyser, and detected. Tandem MS (MS/MS) selects peptide precursor ions for fragmentation — generating b- and y-ion series that spell out the peptide amino acid sequence. Database searching (Mascot, SEQUEST, MSFragger) matches fragment patterns to theoretical spectra to identify proteins.</p>
</div>
<div class="prot-ionization-grid">${iCards}</div>
<div class="prot-spectrum-card">
  <div class="prot-sb-title">Simulated MS/MS Spectrum — Tryptic Peptide Fragment Ions</div>
  ${specSvg}
  <p class="prot-spec-note">b-ions (blue): N-terminal fragments containing the charge carrier. y-ions (orange): C-terminal fragments. The mass difference between consecutive ions identifies each amino acid residue. Gly = 57, Ala = 71, Val = 99, Leu/Ile = 113, Pro = 97, Ser = 87, Thr = 101, Phe = 147, Trp = 186, Lys = 128, Arg = 156.</p>
</div>
<div class="prot-analyser-card">
  <div class="prot-sb-title">Mass Analyser Types</div>
  <div class="prot-analyser-grid">
    <div class="prot-an-item"><span class="prot-an-name">Orbitrap</span><span class="prot-an-res">Res: 15,000–500,000</span><span class="prot-an-use">Gold standard for proteomics · high accuracy (2 ppm) · Thermo Fisher Exploris/Eclipse</span></div>
    <div class="prot-an-item"><span class="prot-an-name">Q-TOF</span><span class="prot-an-res">Res: 10,000–40,000</span><span class="prot-an-use">High speed · intact protein analysis · Waters Synapt · Bruker maXis</span></div>
    <div class="prot-an-item"><span class="prot-an-name">Triple-Quad</span><span class="prot-an-res">Res: 1,000–3,000</span><span class="prot-an-use">Targeted MRM quantification · highest sensitivity for known peptides · clinical labs</span></div>
    <div class="prot-an-item"><span class="prot-an-name">Ion Trap</span><span class="prot-an-res">Res: 1,000–10,000</span><span class="prot-an-use">Fast scan speed · MSⁿ capability · lower mass accuracy · often hybrid (LTQ-Orbitrap)</span></div>
    <div class="prot-an-item"><span class="prot-an-name">timsTOF</span><span class="prot-an-res">Res: 20,000–50,000</span><span class="prot-an-use">Ion mobility separation (TIMS) + TOF · Bruker · single-cell proteomics · diaPASEF</span></div>
    <div class="prot-an-item"><span class="prot-an-name">Astral</span><span class="prot-an-res">Res: 200,000</span><span class="prot-an-use">Ultra-high speed DIA (200 Hz) · 5,000+ proteins in 5 min · Thermo Fisher (2023+)</span></div>
  </div>
</div>`;
  }

  function _drawSpectrum() {
    const W = 500, H = 160;
    const peaks = [
      {mz:175,int:0.95,ion:'y1',col:'#f97316'},{mz:274,int:0.72,ion:'y2',col:'#f97316'},
      {mz:387,int:0.55,ion:'y3',col:'#f97316'},{mz:458,int:0.88,ion:'y4',col:'#f97316'},
      {mz:129,int:0.6, ion:'b1',col:'#58a6ff'},{mz:242,int:0.45,ion:'b2',col:'#58a6ff'},
      {mz:355,int:0.78,ion:'b3',col:'#58a6ff'},{mz:468,int:0.5, ion:'b4',col:'#58a6ff'},
      {mz:576,int:0.35,ion:'b5',col:'#58a6ff'},{mz:620,int:0.25,ion:'',col:'#6e7681'},
    ];
    const maxMZ = 680, pad = { l:30, r:10, t:20, b:30 };
    const pw = W - pad.l - pad.r, ph = H - pad.t - pad.b;
    const xs = mz => pad.l + (mz / maxMZ) * pw;
    const ys = i  => pad.t + ph * (1 - i);

    const lines = peaks.map(p => {
      const x = xs(p.mz);
      return `<line x1="${x}" y1="${ys(0)}" x2="${x}" y2="${ys(p.int)}" stroke="${p.col}" stroke-width="${p.int > 0.7 ? 2 : 1.2}"/>
        ${p.ion ? `<text x="${x}" y="${ys(p.int) - 4}" text-anchor="middle" fill="${p.col}" font-size="8" font-family="monospace">${p.ion}</text>` : ''}`;
    }).join('');

    const xLabels = [100,200,300,400,500,600].map(v =>
      `<text x="${xs(v)}" y="${H - pad.b + 12}" text-anchor="middle" fill="#6e7681" font-size="8">${v}</text>`
    ).join('');

    return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" style="width:100%;max-width:${W}px;display:block;margin:0 auto" aria-label="Simulated MS/MS spectrum">
      <line x1="${pad.l}" y1="${ys(0)}" x2="${W-pad.r}" y2="${ys(0)}" stroke="#21262d" stroke-width="1"/>
      ${lines}${xLabels}
      <text x="${W/2}" y="${H}" text-anchor="middle" fill="#6e7681" font-size="9">m/z</text>
      <text x="8" y="${H/2}" text-anchor="middle" fill="#6e7681" font-size="9" transform="rotate(-90,8,${H/2})">Intensity</text>
      <rect x="${W-90}" y="4" width="8" height="8" fill="#58a6ff"/><text x="${W-78}" y="12" fill="#58a6ff" font-size="8">b-ions</text>
      <rect x="${W-90}" y="16" width="8" height="8" fill="#f97316"/><text x="${W-78}" y="24" fill="#f97316" font-size="8">y-ions</text>
    </svg>`;
  }

  function _workflowPanel() {
    const steps = [
      { n:'1', title:'Sample Preparation', col:'#3fb950', body:'Cell lysis (RIPA/SDS), protein extraction, quantification (BCA/Bradford). Critical: consistent lysis conditions across samples. Filter-aided sample preparation (FASP) or S-trap columns remove detergents and concentrate proteins.' },
      { n:'2', title:'Protein Digestion', col:'#58a6ff', body:'Trypsin cleaves after Lys/Arg (not before Pro) producing peptides 7–25 AA — ideal for LC-MS. Reduction (DTT 10 mM) + alkylation (iodoacetamide 55 mM) before digestion prevents cysteine re-bridging. LysC + Trypsin sequential digest improves missed cleavage rate.' },
      { n:'3', title:'Peptide Desalting &amp; Fractionation', col:'#e3b341', body:'C18 StageTips or Sep-Pak cartridges remove salts and detergents. High-pH reverse-phase fractionation (HPRP) or strong cation exchange (SCX) pre-fractionation increases proteome depth 3–5× by reducing sample complexity per LC-MS run.' },
      { n:'4', title:'nanoLC Separation', col:'#bc8cff', body:'75 µm ID reverse-phase C18 column (50 cm EASY-Spray), 300 nL/min flow, 2–95% acetonitrile gradient over 60–240 min. Peptides elute by hydrophobicity. Column temperature 50°C for reproducibility. DIA: all peptides fragmented; DDA: top-N most intense precursors selected.' },
      { n:'5', title:'MS Acquisition', col:'#f97316', body:'DDA (Data-Dependent Acquisition): survey MS1 scan, then fragment top 10–20 precursors. DIA (Data-Independent Acquisition): all precursors in isolation windows fragmented simultaneously — reproducible quantification, no missing values, preferred for clinical biomarker studies.' },
      { n:'6', title:'Database Search &amp; Protein ID', col:'#f85149', body:'MSFragger, Mascot, or SEQUEST matches MS2 spectra to in-silico tryptic peptides from FASTA database (UniProt, custom African variant database). FDR ≤ 1% at peptide level (target-decoy approach). Protein inference: MaxQuant, Percolator, PeptideShaker.' },
      { n:'7', title:'Quantification &amp; Statistics', col:'#58a6ff', body:'LFQ intensities, TMT reporter ratios, or MRM areas extracted. Log₂ transformation → median normalisation → imputation of missing values (KNN or MinProb). limma or t-test for differential abundance. Volcano plot, heatmap, GO enrichment of significant proteins.' },
    ];

    return `
<div class="prot-concept-box">
  <div class="prot-concept-title">Bottom-Up Proteomics Workflow</div>
  <p class="prot-concept-body">Bottom-up (shotgun) proteomics digests proteins into peptides before MS analysis — the dominant approach for global proteome quantification. The workflow converts a complex protein mixture into a reproducible set of tryptic peptides detectable by LC-MS/MS. Each step must be optimised carefully: variability introduced early propagates through the entire experiment.</p>
</div>
<div class="prot-workflow-steps">${steps.map(s => `
  <div class="prot-wf-step">
    <div class="prot-wf-num" style="background:${s.col}20;color:${s.col};border-color:${s.col}">${s.n}</div>
    <div>
      <div class="prot-wf-title" style="color:${s.col}">${s.title}</div>
      <p class="prot-wf-body">${s.body}</p>
    </div>
  </div>`).join('')}</div>`;
  }

  function _quantPanel() {
    return `
<div class="prot-concept-box">
  <div class="prot-concept-title">Protein Quantification Strategies</div>
  <p class="prot-concept-body">Choosing the right quantification strategy depends on sample type, number of conditions, required accuracy, budget, and whether the experiment is discovery or targeted. All strategies measure peptide abundance as a proxy for protein abundance — protein inference from peptides remains a fundamental challenge in proteomics.</p>
</div>
<div class="prot-quant-grid">${QUANT_METHODS.map(q => `
  <div class="prot-quant-card" style="border-top-color:${q.color}">
    <div class="prot-qc-name" style="color:${q.color}">${q.name}</div>
    <div class="prot-qc-type">${q.type}</div>
    <p class="prot-qc-desc">${q.desc}</p>
    <div class="prot-qc-use"><span class="prot-qc-lbl">Best for</span>${q.use}</div>
    <div class="prot-qc-limit"><span class="prot-qc-lbl">Limitations</span>${q.limit}</div>
  </div>`).join('')}</div>
<div class="prot-fdr-card">
  <div class="prot-sb-title">Protein Identification FDR — Target-Decoy Approach</div>
  <div class="prot-fdr-steps">
    <div class="prot-fd-step"><span class="prot-fd-n">1</span>Append a decoy database to the target FASTA (reversed or scrambled sequences)</div>
    <div class="prot-fd-step"><span class="prot-fd-n">2</span>Search all spectra against combined target + decoy database</div>
    <div class="prot-fd-step"><span class="prot-fd-n">3</span>Count decoy hits at each score threshold = estimated false positives</div>
    <div class="prot-fd-step"><span class="prot-fd-n">4</span>FDR = decoy hits / target hits at that threshold</div>
    <div class="prot-fd-step"><span class="prot-fd-n">5</span>Accept identifications above score threshold where FDR ≤ 1% (peptide-level)</div>
    <div class="prot-fd-step"><span class="prot-fd-n">6</span>Apply protein-level FDR (≤ 1%) — requires ≥ 2 unique peptides per protein for high confidence</div>
  </div>
</div>`;
  }

  function _africaPanel() {
    const cards = AFRICA_PROT.map(s => `
      <div class="prot-africa-card">
        <div class="prot-af-study">${s.study}</div>
        <p class="prot-af-finding">${s.finding}</p>
      </div>`).join('');

    return `
<div class="prot-concept-box">
  <div class="prot-concept-title">African Proteomics — Closing the Protein Data Gap</div>
  <p class="prot-concept-body">Africa is severely under-represented in proteomics databases. The Human Proteome Project (HUPO), proteomics initiatives within H3Africa, and Wellcome-funded African research programmes are working to build Africa-first protein atlases. Priority diseases include malaria, TB, HIV, sickle cell disease, and cancers with distinct African molecular profiles — all requiring Africa-specific reference proteomes.</p>
</div>
<div class="prot-africa-grid">${cards}</div>
<div class="prot-tools-card">
  <div class="prot-sb-title">Essential Proteomics Software Tools</div>
  <div class="prot-tools-grid">
    <div class="prot-tool"><span class="prot-tn">MaxQuant</span><span class="prot-tu">LFQ · TMT · SILAC quantification · Perseus stats</span></div>
    <div class="prot-tool"><span class="prot-tn">MSFragger</span><span class="prot-tu">Ultra-fast DB search · open search · PTMs</span></div>
    <div class="prot-tool"><span class="prot-tn">Spectronaut</span><span class="prot-tu">DIA analysis · spectral library · directDIA</span></div>
    <div class="prot-tool"><span class="prot-tn">Skyline</span><span class="prot-tu">Targeted MRM/PRM · method building · results</span></div>
    <div class="prot-tool"><span class="prot-tn">Perseus</span><span class="prot-tu">Statistical analysis · volcano · heatmap · GO</span></div>
    <div class="prot-tool"><span class="prot-tn">PeptideShaker</span><span class="prot-tu">Multi-engine results · PEP scores · protein groups</span></div>
    <div class="prot-tool"><span class="prot-tn">ProteomicsDB</span><span class="prot-tu">Human proteome atlas · expression maps</span></div>
    <div class="prot-tool"><span class="prot-tn">PRIDE Archive</span><span class="prot-tu">EBI data repository · raw data submission · reanalysis</span></div>
  </div>
</div>`;
  }

  return { init, setTab };
})();
