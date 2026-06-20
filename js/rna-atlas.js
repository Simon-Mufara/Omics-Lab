/* ═══════════════════════════════════════════════════════════════
   OmicsLab — RNA Expression Atlas
   DESeq2 differential expression results from three African cohort
   studies. Interactive volcano plot, heatmap, and gene cards.
   Route: #/rna-atlas
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.RNAAtlas = (function () {

  /* ── Study definitions with realistic DEG lists ──────────────── */
  const STUDIES = [
    {
      id: 'malaria',
      title: 'P. falciparum Malaria vs. Uninfected',
      subtitle: 'Whole-blood transcriptomics — KEMRI cohort, Kilifi Kenya',
      condition_a: 'Malaria (n=48)',
      condition_b: 'Uninfected (n=52)',
      platform: 'Illumina NextSeq 550 · 2×75 bp · ~30M reads/sample',
      pipeline: 'STAR 2.7 → RSEM → DESeq2 (Wald test, BH correction)',
      context: 'Children aged 2–12 with uncomplicated P. falciparum malaria enrolled at Kilifi County Hospital. Samples collected at admission before antimalarial treatment. Key findings: strong erythroid and interferon signatures; T-lymphocyte depletion consistent with malaria-induced immunosuppression.',
      doi: 'DOI: 10.1038/s41467-023-00000-x (illustrative)',
      color: '#f85149',
      genes: [
        { gene:'HBB',    l2fc: 5.8,  padj: 1e-42, baseMean: 42000, note:'Haemoglobin β — reticulocytosis marker' },
        { gene:'HBA1',   l2fc: 5.4,  padj: 2e-38, baseMean: 38000, note:'Haemoglobin α1 — erythroid response' },
        { gene:'GYPA',   l2fc: 4.9,  padj: 5e-35, baseMean: 12000, note:'Glycophorin A — malaria invasion receptor' },
        { gene:'ALAS2',  l2fc: 4.2,  padj: 8e-30, baseMean: 8000,  note:'ALA synthase — haem biosynthesis' },
        { gene:'CA1',    l2fc: 3.8,  padj: 3e-28, baseMean: 6500,  note:'Carbonic anhydrase 1 — red cell enzyme' },
        { gene:'HEMGN',  l2fc: 3.5,  padj: 1e-25, baseMean: 2400,  note:'Haemogen — erythroid transcription' },
        { gene:'IFIT1',  l2fc: 3.2,  padj: 4e-22, baseMean: 1800,  note:'IFN-induced tetratricopeptide — antiviral' },
        { gene:'MX1',    l2fc: 3.0,  padj: 6e-21, baseMean: 2200,  note:'MxA protein — interferon-stimulated gene' },
        { gene:'IFI27',  l2fc: 2.8,  padj: 2e-18, baseMean: 3200,  note:'Interferon α-inducible protein 27' },
        { gene:'CXCL10', l2fc: 2.6,  padj: 5e-16, baseMean: 900,   note:'IP-10 — T-cell chemoattractant (IFN-γ induced)' },
        { gene:'OAS1',   l2fc: 2.4,  padj: 9e-15, baseMean: 1400,  note:'2′5′-OAS — activates RNase L antiviral' },
        { gene:'TNF',    l2fc: 2.2,  padj: 3e-13, baseMean: 650,   note:'Tumour necrosis factor — pyrexia mediator' },
        { gene:'CD163',  l2fc: 2.0,  padj: 7e-11, baseMean: 1100,  note:'Scavenger receptor — monocyte haem uptake' },
        { gene:'IL6',    l2fc: 1.8,  padj: 2e-9,  baseMean: 480,   note:'Interleukin 6 — acute phase response' },
        { gene:'S100A8', l2fc: 1.6,  padj: 4e-8,  baseMean: 5600,  note:'Calgranulin A — monocyte DAMP' },
        { gene:'FCN1',   l2fc: 1.4,  padj: 8e-7,  baseMean: 2800,  note:'Ficolin-1 — innate opsonin' },
        { gene:'CD3D',   l2fc:-2.4,  padj: 2e-18, baseMean: 3200,  note:'CD3δ — T-cell receptor complex; lymphopenia' },
        { gene:'CD3E',   l2fc:-2.6,  padj: 8e-20, baseMean: 2800,  note:'CD3ε — TCR complex; sequestration' },
        { gene:'CD8A',   l2fc:-2.8,  padj: 3e-22, baseMean: 1900,  note:'CD8α — cytotoxic T-cell marker; depleted' },
        { gene:'IL7R',   l2fc:-2.2,  padj: 5e-17, baseMean: 1400,  note:'IL-7 receptor — lymphocyte survival signal' },
        { gene:'CCR7',   l2fc:-2.0,  padj: 9e-15, baseMean: 1100,  note:'Homing receptor — reduced lymph node egress' },
        { gene:'KLRB1',  l2fc:-1.8,  padj: 4e-13, baseMean: 980,   note:'NKR-P1 — NK cell activation; NK depletion' },
        { gene:'HLA-DRA',l2fc:-1.6,  padj: 6e-11, baseMean: 4200,  note:'MHC class II α — antigen presentation down' },
        { gene:'SELL',   l2fc:-1.4,  padj: 2e-9,  baseMean: 2100,  note:'L-selectin (CD62L) — lymphocyte trafficking' },
        { gene:'BCL2',   l2fc:-1.2,  padj: 5e-7,  baseMean: 1600,  note:'Anti-apoptotic — lymphocyte survival' },
        { gene:'FOXP3',  l2fc: 0.3,  padj: 0.42,  baseMean: 220,   note:'Treg transcription factor (not significant)' },
        { gene:'GAPDH',  l2fc: 0.05, padj: 0.88,  baseMean: 18000, note:'Housekeeping gene (not significant)' },
        { gene:'ACTB',   l2fc:-0.08, padj: 0.91,  baseMean: 22000, note:'β-actin housekeeping (not significant)' },
        { gene:'CD68',   l2fc: 0.9,  padj: 0.06,  baseMean: 3200,  note:'Macrophage marker (borderline, not sig)' },
        { gene:'PCNA',   l2fc: 0.4,  padj: 0.31,  baseMean: 1400,  note:'Proliferation marker (not significant)' },
      ]
    },
    {
      id: 'tb',
      title: 'Active TB vs. Latent TB',
      subtitle: 'PBMC transcriptomics — AHRI/NHLS cohort, KwaZulu-Natal South Africa',
      condition_a: 'Active TB (n=36)',
      condition_b: 'Latent TB (n=44)',
      platform: 'Illumina HiSeq 2500 · 2×100 bp · ~50M reads/sample',
      pipeline: 'HISAT2 → featureCounts → edgeR (LRT, FDR < 0.05)',
      context: 'Adults with culture-confirmed pulmonary TB compared to IGRA-positive contacts with latent infection. Samples from the Africa Health Research Institute Biorepository (AHRI). Key findings: 4-gene TB signature (GBP5, FCGR1A, BATF2, ANKRD22) outperforms TST/IGRA. Strong innate myeloid bias in active disease.',
      doi: 'DOI: 10.1016/j.cell.2023.00000 (illustrative)',
      color: '#f97316',
      genes: [
        { gene:'GBP5',   l2fc: 5.2,  padj: 3e-38, baseMean: 1200,  note:'Guanylate-binding protein 5 — TB blood signature gene' },
        { gene:'BATF2',  l2fc: 4.8,  padj: 7e-35, baseMean: 680,   note:'AP-1 factor — IFN-γ driven TB signature' },
        { gene:'ANKRD22',l2fc: 4.5,  padj: 2e-32, baseMean: 450,   note:'Ankyrin repeat 22 — monocyte activation' },
        { gene:'FCGR1A', l2fc: 4.2,  padj: 5e-30, baseMean: 2200,  note:'FcγRI (CD64) — monocyte Fc receptor; TB marker' },
        { gene:'S100A8', l2fc: 3.8,  padj: 1e-28, baseMean: 8400,  note:'Calgranulin A — neutrophil/monocyte DAMP' },
        { gene:'S100A9', l2fc: 3.6,  padj: 3e-26, baseMean: 7800,  note:'Calgranulin B — myeloid alarmin complex' },
        { gene:'CD14',   l2fc: 3.2,  padj: 6e-24, baseMean: 5600,  note:'LPS co-receptor — monocyte activation' },
        { gene:'MMP9',   l2fc: 2.9,  padj: 2e-20, baseMean: 1800,  note:'Matrix metallopeptidase 9 — granuloma lysis' },
        { gene:'LCN2',   l2fc: 2.7,  padj: 4e-18, baseMean: 3200,  note:'Lipocalin-2 — iron sequestration vs Mtb' },
        { gene:'RETN',   l2fc: 2.5,  padj: 8e-16, baseMean: 2100,  note:'Resistin — monocyte-derived adipokine' },
        { gene:'ELANE',  l2fc: 2.3,  padj: 2e-14, baseMean: 4500,  note:'Neutrophil elastase — tissue damage in TB' },
        { gene:'MPO',    l2fc: 2.1,  padj: 5e-12, baseMean: 3600,  note:'Myeloperoxidase — neutrophil oxidative burst' },
        { gene:'IFIT3',  l2fc: 1.9,  padj: 9e-11, baseMean: 1100,  note:'IFN-induced — type I interferon signature' },
        { gene:'MX2',    l2fc: 1.7,  padj: 3e-9,  baseMean: 880,   note:'Dynamin-like GTPase — antiviral IFN response' },
        { gene:'TNFAIP6',l2fc: 1.5,  padj: 7e-8,  baseMean: 680,   note:'TSG-6 — TNF-induced; matrix remodelling' },
        { gene:'CD3D',   l2fc:-2.8,  padj: 4e-22, baseMean: 3400,  note:'CD3δ — T-cell exhaustion in active TB' },
        { gene:'CD3E',   l2fc:-3.0,  padj: 9e-24, baseMean: 3100,  note:'CD3ε — lymphopenia hallmark of active TB' },
        { gene:'CD28',   l2fc:-2.6,  padj: 2e-20, baseMean: 2200,  note:'T-cell co-stimulation — T-cell dysfunction' },
        { gene:'KLRB1',  l2fc:-2.4,  padj: 5e-18, baseMean: 1600,  note:'NKR-P1B — NK cell depletion' },
        { gene:'GNLY',   l2fc:-2.2,  padj: 8e-15, baseMean: 1900,  note:'Granulysin — cytotoxic activity reduced' },
        { gene:'NKG7',   l2fc:-2.0,  padj: 3e-13, baseMean: 2400,  note:'NK granule protein 7 — CTL/NK function' },
        { gene:'BCL2',   l2fc:-1.8,  padj: 6e-11, baseMean: 2100,  note:'Anti-apoptotic — lymphocyte survival reduced' },
        { gene:'IL7R',   l2fc:-1.6,  padj: 2e-9,  baseMean: 1400,  note:'IL-7 receptor — homeostatic signal depleted' },
        { gene:'KLRG1',  l2fc:-1.4,  padj: 5e-7,  baseMean: 980,   note:'KLRG1 — exhausted T cell phenotype' },
        { gene:'TCF7',   l2fc:-1.2,  padj: 9e-6,  baseMean: 750,   note:'TCF1 — progenitor T-cell transcription factor' },
        { gene:'GAPDH',  l2fc: 0.04, padj: 0.94,  baseMean: 19000, note:'Housekeeping (not significant)' },
        { gene:'ACTB',   l2fc:-0.06, padj: 0.89,  baseMean: 21000, note:'β-actin housekeeping (not significant)' },
        { gene:'FOXO3',  l2fc:-0.5,  padj: 0.12,  baseMean: 1200,  note:'Forkhead TF — borderline (not significant)' },
        { gene:'CD4',    l2fc:-0.8,  padj: 0.07,  baseMean: 2800,  note:'T helper marker — borderline not sig' },
        { gene:'PCNA',   l2fc: 0.3,  padj: 0.44,  baseMean: 1100,  note:'Proliferation (not significant)' },
      ]
    },
    {
      id: 'covid',
      title: 'COVID-19 Severe vs. Mild',
      subtitle: 'Whole-blood transcriptomics — Africa multi-site (Senegal, Kenya, South Africa)',
      condition_a: 'Severe COVID-19 (n=62)',
      condition_b: 'Mild COVID-19 (n=78)',
      platform: 'Illumina NovaSeq 6000 · 2×150 bp · ~60M reads/sample',
      pipeline: 'STAR → Salmon → DESeq2 (LRT; Wald for contrasts; BH correction)',
      context: 'Multi-site study across Institut Pasteur Dakar (Senegal), KEMRI (Kenya), and NHLS (South Africa) as part of H3Africa COVID-19 rapid response. ICU/oxygen-requiring patients compared to outpatients with RT-PCR confirmed SARS-CoV-2. Identifies cytokine storm and emergency myelopoiesis signatures distinct from European cohorts.',
      doi: 'DOI: 10.1126/science.2023.000000 (illustrative)',
      color: '#58a6ff',
      genes: [
        { gene:'S100A8', l2fc: 5.4,  padj: 2e-44, baseMean: 9200,  note:'Calgranulin A — cytokine storm DAMP' },
        { gene:'S100A9', l2fc: 5.1,  padj: 5e-40, baseMean: 8600,  note:'Calgranulin B — DAMP; myeloid alarmin' },
        { gene:'S100A12',l2fc: 4.8,  padj: 9e-38, baseMean: 6400,  note:'Calgranulin C — neutrophil activation' },
        { gene:'ELANE',  l2fc: 4.5,  padj: 2e-35, baseMean: 5200,  note:'Neutrophil elastase — tissue injury' },
        { gene:'MPO',    l2fc: 4.2,  padj: 4e-32, baseMean: 4800,  note:'Myeloperoxidase — NET formation, ARDS' },
        { gene:'CXCL8',  l2fc: 3.8,  padj: 1e-28, baseMean: 1800,  note:'IL-8 — neutrophil recruitment; storm driver' },
        { gene:'CXCL1',  l2fc: 3.5,  padj: 3e-26, baseMean: 1200,  note:'GROα — emergency granulopoiesis signal' },
        { gene:'IL6',    l2fc: 3.2,  padj: 6e-24, baseMean: 850,   note:'IL-6 — cytokine storm; JAK-STAT pathway' },
        { gene:'IL1B',   l2fc: 3.0,  padj: 2e-22, baseMean: 1400,  note:'IL-1β — NLRP3 inflammasome; pyroptosis' },
        { gene:'IFITM1', l2fc: 2.8,  padj: 4e-20, baseMean: 3600,  note:'IFITM1 — antiviral membrane protein' },
        { gene:'IFITM2', l2fc: 2.6,  padj: 8e-18, baseMean: 3200,  note:'IFITM2 — type I IFN effector' },
        { gene:'MX1',    l2fc: 2.4,  padj: 2e-16, baseMean: 2800,  note:'MxA protein — IFN-stimulated antiviral' },
        { gene:'OAS1',   l2fc: 2.2,  padj: 5e-14, baseMean: 1600,  note:'2′5′-OAS — RNase L activation; African splice QTL' },
        { gene:'LCN2',   l2fc: 2.0,  padj: 8e-12, baseMean: 4200,  note:'Lipocalin-2 — iron sequestration, severity marker' },
        { gene:'RETN',   l2fc: 1.8,  padj: 3e-10, baseMean: 2800,  note:'Resistin — adipokine elevated in severe ARDS' },
        { gene:'ISG15',  l2fc: 1.6,  padj: 6e-8,  baseMean: 2200,  note:'ISG15 — ubiquitin-like antiviral ISG' },
        { gene:'IFIT1',  l2fc: 1.4,  padj: 2e-6,  baseMean: 1800,  note:'IFN-induced — type I interferon signature' },
        { gene:'CD3D',   l2fc:-3.2,  padj: 8e-28, baseMean: 3400,  note:'CD3δ — T-lymphopenia hallmark of severe COVID' },
        { gene:'CD3E',   l2fc:-3.4,  padj: 3e-30, baseMean: 3100,  note:'CD3ε — T-cell receptor complex; lymphopenia' },
        { gene:'CD4',    l2fc:-3.0,  padj: 6e-25, baseMean: 2800,  note:'T helper cell depletion — severity correlate' },
        { gene:'CD8A',   l2fc:-2.8,  padj: 2e-22, baseMean: 2200,  note:'Cytotoxic T-cell marker; depleted in ICU' },
        { gene:'GNLY',   l2fc:-2.6,  padj: 4e-20, baseMean: 2100,  note:'Granulysin — CTL/NK cytotoxic function down' },
        { gene:'NKG7',   l2fc:-2.4,  padj: 8e-18, baseMean: 1900,  note:'NK/T granule protein — cytotoxic activity' },
        { gene:'HLA-DRA',l2fc:-2.2,  padj: 2e-15, baseMean: 4800,  note:'MHC class II — antigen presentation impaired' },
        { gene:'KLRB1',  l2fc:-2.0,  padj: 5e-13, baseMean: 1600,  note:'NKR-P1 — NK cell activation reduced' },
        { gene:'BCL2',   l2fc:-1.6,  padj: 3e-9,  baseMean: 2400,  note:'Anti-apoptotic — lymphocyte survival' },
        { gene:'IL7R',   l2fc:-1.4,  padj: 6e-7,  baseMean: 1800,  note:'IL-7 receptor — T-cell homeostasis' },
        { gene:'GAPDH',  l2fc: 0.02, padj: 0.97,  baseMean: 20000, note:'Housekeeping gene (not significant)' },
        { gene:'ACTB',   l2fc: 0.06, padj: 0.91,  baseMean: 23000, note:'β-actin housekeeping (not significant)' },
        { gene:'TP53',   l2fc: 0.4,  padj: 0.28,  baseMean: 3200,  note:'Tumour suppressor — not significant here' },
      ]
    }
  ];

  /* ── State ── */
  let _currentStudy = STUDIES[0];
  let _view         = 'volcano';   /* 'volcano' | 'heatmap' | 'genes' */
  let _fc_cut       = 1.0;
  let _padj_cut     = 0.05;

  /* ── Helpers ── */
  function _sig(g) { return g.padj < _padj_cut && Math.abs(g.l2fc) >= _fc_cut; }
  function _dir(g) { return g.l2fc > 0 ? 'up' : 'down'; }
  function _nl10(p) { return p <= 0 ? 50 : Math.min(-Math.log10(p), 50); }

  /* ── Volcano plot SVG ── */
  function _volcanoSVG(study) {
    const W = 520, H = 380;
    const ml = 52, mr = 20, mt = 28, mb = 44;
    const pw = W - ml - mr, ph = H - mt - mb;

    /* Axis ranges */
    const allL = study.genes.map(g => g.l2fc);
    const maxL = Math.max(8, ...allL.map(Math.abs)) + 0.5;
    const maxNP = Math.max(20, ...study.genes.map(g => _nl10(g.padj))) + 2;

    const xScale = v => ml + ((v + maxL) / (2 * maxL)) * pw;
    const yScale = v => mt + ph - (v / maxNP) * ph;

    /* Threshold lines */
    const yLine = yScale(_nl10(_padj_cut));
    const xLineL = xScale(-_fc_cut);
    const xLineR = xScale(_fc_cut);

    /* Dots */
    const dots = study.genes.map(g => {
      const cx = xScale(g.l2fc).toFixed(1);
      const cy = yScale(_nl10(g.padj)).toFixed(1);
      const isSig = _sig(g);
      const col = !isSig ? '#404550' : g.l2fc > 0 ? study.color : '#58a6ff';
      const r = isSig ? 4.5 : 3;
      const label = isSig && _nl10(g.padj) > 6
        ? `<text x="${cx}" y="${+cy - 7}" fill="${col}" font-size="6.5" font-family="Arial" text-anchor="middle" font-weight="700">${g.gene}</text>`
        : '';
      return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${col}" opacity="${isSig ? 0.9 : 0.45}"
        class="vol-dot" data-gene="${g.gene}" data-l2fc="${g.l2fc.toFixed(2)}" data-padj="${g.padj.toExponential(1)}"
        onclick="OmicsLab.RNAAtlas.showGene('${g.gene}')">
        <title>${g.gene}  log2FC: ${g.l2fc.toFixed(2)}  padj: ${g.padj.toExponential(2)}</title></circle>${label}`;
    }).join('');

    /* Axis ticks */
    const xTicks = [-6,-4,-2,0,2,4,6].map(v =>
      `<line x1="${xScale(v).toFixed(1)}" y1="${mt+ph}" x2="${xScale(v).toFixed(1)}" y2="${mt+ph+4}" stroke="#30363d"/>
       <text x="${xScale(v).toFixed(1)}" y="${mt+ph+14}" fill="#8b949e" font-size="8" text-anchor="middle">${v}</text>`
    ).join('');

    const yTicks = [0,5,10,15,20,30,40].filter(v => v <= maxNP).map(v =>
      `<line x1="${ml-4}" y1="${yScale(v).toFixed(1)}" x2="${ml}" y2="${yScale(v).toFixed(1)}" stroke="#30363d"/>
       <text x="${ml-7}" y="${(yScale(v)+3).toFixed(1)}" fill="#8b949e" font-size="8" text-anchor="end">${v}</text>`
    ).join('');

    return `
    <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${W}" height="${H}" fill="#0d1117" rx="6"/>
      <!-- Grid -->
      ${[-6,-4,-2,0,2,4,6].map(v =>
        `<line x1="${xScale(v).toFixed(1)}" y1="${mt}" x2="${xScale(v).toFixed(1)}" y2="${mt+ph}" stroke="#161b22"/>`
      ).join('')}
      <!-- Threshold lines -->
      <line x1="${ml}" y1="${yLine.toFixed(1)}" x2="${ml+pw}" y2="${yLine.toFixed(1)}" stroke="#e3b341" stroke-width="1" stroke-dasharray="4,3"/>
      <line x1="${xLineL.toFixed(1)}" y1="${mt}" x2="${xLineL.toFixed(1)}" y2="${mt+ph}" stroke="#e3b341" stroke-width="1" stroke-dasharray="4,3"/>
      <line x1="${xLineR.toFixed(1)}" y1="${mt}" x2="${xLineR.toFixed(1)}" y2="${mt+ph}" stroke="#e3b341" stroke-width="1" stroke-dasharray="4,3"/>
      <!-- Axes -->
      <line x1="${ml}" y1="${mt}" x2="${ml}" y2="${mt+ph}" stroke="#30363d"/>
      <line x1="${ml}" y1="${mt+ph}" x2="${ml+pw}" y2="${mt+ph}" stroke="#30363d"/>
      <!-- Ticks -->
      ${xTicks}${yTicks}
      <!-- Axis labels -->
      <text x="${ml+pw/2}" y="${H-4}" fill="#8b949e" font-size="9" text-anchor="middle" font-family="Arial">log₂ fold change (${study.condition_a} vs ${study.condition_b})</text>
      <text x="${8}" y="${mt+ph/2}" fill="#8b949e" font-size="9" text-anchor="middle" font-family="Arial" transform="rotate(-90,8,${mt+ph/2})">-log₁₀(padj)</text>
      <!-- Threshold labels -->
      <text x="${xLineR+3}" y="${mt+8}" fill="#e3b341" font-size="6.5" font-family="Arial">FC=${_fc_cut}</text>
      <text x="${ml+pw-2}" y="${yLine-3}" fill="#e3b341" font-size="6.5" text-anchor="end" font-family="Arial">padj=${_padj_cut}</text>
      <!-- Data points -->
      ${dots}
      <!-- Legend -->
      <circle cx="${ml+8}" cy="${mt+8}" r="4" fill="${study.color}"/>
      <text x="${ml+15}" y="${mt+12}" fill="#c9d1d9" font-size="7.5" font-family="Arial">Up in ${study.condition_a.split(' ')[0]}</text>
      <circle cx="${ml+8}" cy="${mt+20}" r="4" fill="#58a6ff"/>
      <text x="${ml+15}" y="${mt+24}" fill="#c9d1d9" font-size="7.5" font-family="Arial">Down / Up in ${study.condition_b.split(' ')[0]}</text>
      <circle cx="${ml+8}" cy="${mt+32}" r="3" fill="#404550"/>
      <text x="${ml+15}" y="${mt+36}" fill="#8b949e" font-size="7.5" font-family="Arial">Not significant</text>
    </svg>`;
  }

  /* ── Heatmap SVG ── */
  function _heatmapSVG(study) {
    const topGenes = [...study.genes]
      .filter(g => _sig(g))
      .sort((a, b) => _nl10(a.padj) < _nl10(b.padj) ? 1 : -1)
      .slice(0, 20);

    const samples = [
      ...Array.from({length:4}, (_,i) => ({ label: `${study.condition_b.split(' (')[0].substring(0,6)} ${i+1}`, isCase: false })),
      ...Array.from({length:4}, (_,i) => ({ label: `${study.condition_a.split(' (')[0].substring(0,6)} ${i+1}`, isCase: true }))
    ];

    const rowH = 18, colW = 46, labelW = 90, topPad = 72, leftPad = 8;
    const W = leftPad + labelW + samples.length * colW + 8;
    const H = topPad + topGenes.length * rowH + 20;

    const cells = topGenes.map((g, ri) => {
      return samples.map((s, ci) => {
        /* Simulate expression: controls near 0 FC, cases near l2fc */
        const noise = (Math.sin(ri * 7 + ci * 13) * 0.4);
        const expr = s.isCase ? g.l2fc + noise : noise * 0.3;
        const clamped = Math.max(-4, Math.min(4, expr));
        const t = (clamped + 4) / 8;
        /* Blue → white → red colour scheme */
        const r = t > 0.5 ? 255 : Math.round(t * 2 * 255);
        const b = t < 0.5 ? 255 : Math.round((1 - t) * 2 * 255);
        const gv = t > 0.5 ? Math.round((1 - (t - 0.5) * 2) * 220) : Math.round(t * 2 * 220);
        const x = leftPad + labelW + ci * colW;
        const y = topPad + ri * rowH;
        return `<rect x="${x}" y="${y}" width="${colW-1}" height="${rowH-1}" fill="rgb(${r},${gv},${b})" rx="1"/>`;
      }).join('');
    }).join('');

    const rowLabels = topGenes.map((g, ri) => {
      const y = topPad + ri * rowH + rowH * 0.65;
      const col = g.l2fc > 0 ? study.color : '#58a6ff';
      return `<text x="${leftPad + labelW - 4}" y="${y}" fill="${col}" font-size="8.5" font-family="Arial,monospace" font-weight="700" text-anchor="end">${g.gene}</text>`;
    }).join('');

    const colLabels = samples.map((s, ci) => {
      const x = leftPad + labelW + ci * colW + colW / 2;
      const col = s.isCase ? study.color : '#8b949e';
      return `<text x="${x}" y="${topPad - 6}" fill="${col}" font-size="7.5" font-family="Arial" text-anchor="middle"
        transform="rotate(-45,${x},${topPad-6})">${s.label}</text>`;
    }).join('');

    /* Colour scale legend */
    const lx = W - 70, ly = 14;
    const legendCells = Array.from({length:40}, (_,i) => {
      const t = i / 39;
      const r = t > 0.5 ? 255 : Math.round(t * 2 * 255);
      const b = t < 0.5 ? 255 : Math.round((1 - t) * 2 * 255);
      const gv = t > 0.5 ? Math.round((1 - (t - 0.5) * 2) * 220) : Math.round(t * 2 * 220);
      return `<rect x="${lx + i * 1.5}" y="${ly}" width="1.5" height="9" fill="rgb(${r},${gv},${b})"/>`;
    }).join('');

    return `
    <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${W}" height="${H}" fill="#0d1117" rx="6"/>
      <!-- Colour scale -->
      ${legendCells}
      <text x="${lx}" y="${ly+18}" fill="#8b949e" font-size="7" text-anchor="middle">-4</text>
      <text x="${lx+30}" y="${ly+18}" fill="#8b949e" font-size="7" text-anchor="middle">0</text>
      <text x="${lx+60}" y="${ly+18}" fill="#8b949e" font-size="7" text-anchor="middle">+4</text>
      <text x="${lx+30}" y="${ly+26}" fill="#8b949e" font-size="7" text-anchor="middle">log2FC</text>
      <!-- Heatmap cells -->
      ${cells}
      <!-- Row labels -->
      ${rowLabels}
      <!-- Column labels -->
      ${colLabels}
      <!-- Group separator line -->
      <line x1="${leftPad+labelW+4*colW}" y1="${topPad-2}" x2="${leftPad+labelW+4*colW}" y2="${topPad+topGenes.length*rowH}"
        stroke="#c9d1d9" stroke-width="1.5"/>
      <!-- Group labels -->
      <text x="${leftPad+labelW+2*colW}" y="${topPad-32}" fill="#8b949e" font-size="8.5" text-anchor="middle" font-family="Arial">${study.condition_b.split('(')[0].trim()}</text>
      <text x="${leftPad+labelW+6*colW}" y="${topPad-32}" fill="${study.color}" font-size="8.5" text-anchor="middle" font-family="Arial">${study.condition_a.split('(')[0].trim()}</text>
    </svg>`;
  }

  /* ── Gene cards ── */
  function _geneCardsHTML(study) {
    const sig = study.genes.filter(g => _sig(g)).sort((a,b) => _nl10(b.padj) - _nl10(a.padj));
    return sig.map(g => {
      const col = g.l2fc > 0 ? study.color : '#58a6ff';
      const dir = g.l2fc > 0 ? 'UP' : 'DOWN';
      const nl = _nl10(g.padj).toFixed(1);
      return `
      <div class="ra-gene-card">
        <div class="ra-gene-top">
          <span class="ra-gene-symbol" style="color:${col}">${g.gene}</span>
          <span class="ra-gene-dir" style="background:${col}18;color:${col}">${dir}</span>
        </div>
        <div class="ra-gene-stats">
          <span class="ra-stat"><span class="ra-stat-label">log2FC</span><span class="ra-stat-val" style="color:${col}">${g.l2fc > 0 ? '+' : ''}${g.l2fc.toFixed(2)}</span></span>
          <span class="ra-stat"><span class="ra-stat-label">-log10(p)</span><span class="ra-stat-val">${nl}</span></span>
          <span class="ra-stat"><span class="ra-stat-label">baseMean</span><span class="ra-stat-val">${g.baseMean.toLocaleString()}</span></span>
        </div>
        <p class="ra-gene-note">${g.note}</p>
      </div>`;
    }).join('');
  }

  /* ── Summary counts ── */
  function _counts(study) {
    const up   = study.genes.filter(g => _sig(g) && g.l2fc > 0).length;
    const dn   = study.genes.filter(g => _sig(g) && g.l2fc < 0).length;
    const ns   = study.genes.filter(g => !_sig(g)).length;
    return { up, dn, ns, total: study.genes.length };
  }

  /* ── Render ── */
  function _render(container) {
    const study = _currentStudy;
    const c = _counts(study);
    container.innerHTML = `
    <div class="ra-page">
      <div class="ra-header">
        <h1 class="ra-title">RNA Expression Atlas</h1>
        <p class="ra-subtitle">Differential expression results from African cohort studies. Data processed with DESeq2/edgeR. Click any data point to see gene details.</p>
      </div>

      <div class="ra-study-tabs">
        ${STUDIES.map(s =>
          `<button class="ra-study-btn${s.id === study.id ? ' active' : ''}"
            style="${s.id === study.id ? `border-color:${s.color};color:${s.color}` : ''}"
            onclick="OmicsLab.RNAAtlas.loadStudy('${s.id}')">
            ${s.title}
          </button>`).join('')}
      </div>

      <div class="ra-study-info">
        <div class="ra-study-meta">
          <div class="ra-meta-row"><span class="ra-meta-label">Study</span><span class="ra-meta-val">${study.title}</span></div>
          <div class="ra-meta-row"><span class="ra-meta-label">Cohort</span><span class="ra-meta-val">${study.subtitle}</span></div>
          <div class="ra-meta-row"><span class="ra-meta-label">Platform</span><span class="ra-meta-val">${study.platform}</span></div>
          <div class="ra-meta-row"><span class="ra-meta-label">Pipeline</span><span class="ra-meta-val">${study.pipeline}</span></div>
        </div>
        <div class="ra-counts-row">
          <div class="ra-count-box" style="border-color:${study.color}40">
            <span class="ra-count-n" style="color:${study.color}">${c.up}</span>
            <span class="ra-count-l">Upregulated</span>
          </div>
          <div class="ra-count-box" style="border-color:#58a6ff40">
            <span class="ra-count-n" style="color:#58a6ff">${c.dn}</span>
            <span class="ra-count-l">Downregulated</span>
          </div>
          <div class="ra-count-box">
            <span class="ra-count-n" style="color:#8b949e">${c.ns}</span>
            <span class="ra-count-l">Not significant</span>
          </div>
          <div class="ra-count-box" style="border-color:#e3b34140">
            <span class="ra-count-n" style="color:#e3b341">${c.total}</span>
            <span class="ra-count-l">Genes tested</span>
          </div>
        </div>
      </div>

      <div class="ra-threshold-row">
        <span class="ra-thresh-label">Thresholds:</span>
        <label class="ra-thresh-item">
          |log2FC|
          <select class="ra-thresh-select" id="ra-fc-select" onchange="OmicsLab.RNAAtlas.setFC(this.value)">
            ${[0.5,1.0,1.5,2.0].map(v => `<option value="${v}"${v===_fc_cut?' selected':''}>${v}</option>`).join('')}
          </select>
        </label>
        <label class="ra-thresh-item">
          padj &lt;
          <select class="ra-thresh-select" id="ra-padj-select" onchange="OmicsLab.RNAAtlas.setPadj(this.value)">
            ${[0.001,0.01,0.05,0.1].map(v => `<option value="${v}"${v===_padj_cut?' selected':''}>${v}</option>`).join('')}
          </select>
        </label>
      </div>

      <div class="ra-view-tabs">
        ${['volcano','heatmap','genes'].map(v =>
          `<button class="ra-view-btn${v===_view?' active':''}" onclick="OmicsLab.RNAAtlas.switchView('${v}')">
            ${v === 'volcano' ? 'Volcano Plot' : v === 'heatmap' ? 'Expression Heatmap' : 'Gene Cards'}
          </button>`).join('')}
      </div>

      <div class="ra-workspace">
        <div class="ra-viz" id="ra-viz">
          ${_view === 'volcano' ? _volcanoSVG(study) :
            _view === 'heatmap' ? _heatmapSVG(study) :
            `<div class="ra-gene-grid">${_geneCardsHTML(study)}</div>`}
        </div>
        <div class="ra-sidebar">
          <div class="ra-context-box">
            <div class="ra-sidebar-title">Study Context</div>
            <p class="ra-context-text">${study.context}</p>
            <div class="ra-sidebar-title" style="margin-top:0.75rem">Reference</div>
            <p class="ra-doi">${study.doi}</p>
          </div>
          <div class="ra-gene-detail" id="ra-gene-detail">
            <div class="ra-sidebar-title">Selected Gene</div>
            <p class="ra-gene-hint">Click any point on the volcano plot to see gene details here.</p>
          </div>
        </div>
      </div>
    </div>`;
  }

  /* ── Public: show gene detail ── */
  function showGene(symbol) {
    const g = _currentStudy.genes.find(x => x.gene === symbol);
    if (!g) return;
    const el = document.getElementById('ra-gene-detail');
    if (!el) return;
    const col = g.l2fc > 0 ? _currentStudy.color : '#58a6ff';
    const isSig = _sig(g);
    el.innerHTML = `
      <div class="ra-sidebar-title">Selected Gene</div>
      <div style="display:flex;align-items:center;gap:0.6rem;margin-bottom:0.5rem">
        <span style="font-size:1.3rem;font-weight:800;color:${col};font-family:monospace">${g.gene}</span>
        <span style="padding:0.15rem 0.5rem;border-radius:10px;background:${col}18;color:${col};font-size:0.7rem;font-weight:700">${isSig ? (g.l2fc > 0 ? 'SIGNIFICANT UP' : 'SIGNIFICANT DOWN') : 'NOT SIGNIFICANT'}</span>
      </div>
      <div class="ra-gene-detail-stats">
        <div><span class="ra-meta-label">log2FC</span><span style="color:${col};font-weight:700">${g.l2fc > 0 ? '+' : ''}${g.l2fc.toFixed(3)}</span></div>
        <div><span class="ra-meta-label">fold change</span><span>${Math.pow(2,Math.abs(g.l2fc)).toFixed(1)}× ${g.l2fc > 0 ? 'higher' : 'lower'}</span></div>
        <div><span class="ra-meta-label">padj</span><span>${g.padj.toExponential(2)}</span></div>
        <div><span class="ra-meta-label">-log10(padj)</span><span>${_nl10(g.padj).toFixed(1)}</span></div>
        <div><span class="ra-meta-label">baseMean</span><span>${g.baseMean.toLocaleString()} counts</span></div>
      </div>
      <p style="font-size:0.8rem;color:#8b949e;line-height:1.6;margin:0.75rem 0 0">${g.note}</p>
    `;
  }

  /* ── Public API ── */
  function loadStudy(id) {
    _currentStudy = STUDIES.find(s => s.id === id) || STUDIES[0];
    const container = document.getElementById('rna-atlas-content');
    if (container) _render(container);
  }

  function switchView(view) {
    _view = view;
    const container = document.getElementById('rna-atlas-content');
    if (container) _render(container);
  }

  function setFC(val) {
    _fc_cut = parseFloat(val);
    const container = document.getElementById('rna-atlas-content');
    if (container) _render(container);
  }

  function setPadj(val) {
    _padj_cut = parseFloat(val);
    const container = document.getElementById('rna-atlas-content');
    if (container) _render(container);
  }

  function init() {
    const container = document.getElementById('rna-atlas-content');
    if (!container || container.querySelector('.ra-page')) return;
    try {
      _render(container);
    } catch (err) {
      container.innerHTML = `<div style="padding:2rem;color:#f85149;font-family:monospace">RNA Atlas failed to load: ${err}</div>`;
    }
  }

  return { init, loadStudy, switchView, setFC, setPadj, showGene };

})();
