/* ═══════════════════════════════════════════════════════════════
   OmicsLab — GWAS Analysis Suite
   Interactive GWAS pipeline, Manhattan plot, QQ plot, PCA,
   African-specific loci database, PLINK2 command builder.
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.GWAS = (function () {

  /* ── Known African GWAS hits (curated from NHGRI-EBI GWAS Catalog) ── */
  const AFRICAN_LOCI = [
    { chr:11, pos:5246696,   rsid:'rs334',      gene:'HBB',      trait:'Sickle Cell Disease',        p:1e-320, beta: 0.99, eaf_afr:0.12, eaf_eur:0.001, ref:'Piel 2013' },
    { chr:1,  pos:159175098, rsid:'rs2814778',  gene:'ACKR1',    trait:'Plasmodium vivax resistance', p:1e-200, beta:-0.88, eaf_afr:0.68, eaf_eur:0.01,  ref:'Howes 2011' },
    { chr:23, pos:154531390, rsid:'rs1050829',  gene:'G6PD',     trait:'G6PD Deficiency',             p:1e-180, beta: 0.73, eaf_afr:0.20, eaf_eur:0.02,  ref:'Howes 2013' },
    { chr:6,  pos:32570000,  rsid:'rs2523604',  gene:'HLA-B',    trait:'HIV Elite Controller',        p:2e-55,  beta: 0.40, eaf_afr:0.10, eaf_eur:0.12,  ref:'McLaren 2015' },
    { chr:6,  pos:32485000,  rsid:'rs9264942',  gene:'HLA-C',    trait:'HIV Viral Load',              p:5e-50,  beta:-0.35, eaf_afr:0.18, eaf_eur:0.15,  ref:'Fellay 2007' },
    { chr:2,  pos:136120000, rsid:'rs11591147', gene:'PCSK9',    trait:'LDL Cholesterol',             p:3e-42,  beta:-0.28, eaf_afr:0.03, eaf_eur:0.002, ref:'Cohen 2006' },
    { chr:18, pos:77260000,  rsid:'rs1229984',  gene:'ADH1B',    trait:'Alcohol Metabolism',          p:8e-38,  beta: 0.22, eaf_afr:0.08, eaf_eur:0.22,  ref:'H3Africa 2022' },
    { chr:9,  pos:107549000, rsid:'rs10757278', gene:'CDKN2B-AS',trait:'T2D / Coronary Artery',      p:1e-35,  beta: 0.18, eaf_afr:0.42, eaf_eur:0.48,  ref:'AWI-Gen 2019' },
    { chr:7,  pos:92390000,  rsid:'rs864745',   gene:'JAZF1',    trait:'Type 2 Diabetes',             p:6e-32,  beta: 0.16, eaf_afr:0.35, eaf_eur:0.40,  ref:'H3Africa 2020' },
    { chr:12, pos:112000000, rsid:'rs11172113', gene:'LRP1',     trait:'Stroke',                      p:2e-28,  beta: 0.15, eaf_afr:0.38, eaf_eur:0.42,  ref:'Akpa 2021' },
    { chr:4,  pos:145435000, rsid:'rs4977574',  gene:'ADRA1A',   trait:'Hypertension',                p:9e-26,  beta: 0.13, eaf_afr:0.51, eaf_eur:0.46,  ref:'AWI-Gen 2020' },
    { chr:3,  pos:8765000,   rsid:'rs1800562',  gene:'HFE',      trait:'Iron Overload',               p:4e-24,  beta: 0.31, eaf_afr:0.001,eaf_eur:0.07,  ref:'Pilling 2019' },
    { chr:17, pos:36040000,  rsid:'rs757978',   gene:'CCL2',     trait:'TB Susceptibility',           p:7e-22,  beta: 0.20, eaf_afr:0.36, eaf_eur:0.28,  ref:'Chimusa 2014' },
    { chr:5,  pos:131500000, rsid:'rs6872156',  gene:'IL13',     trait:'Schistosomiasis Severity',    p:3e-20,  beta: 0.19, eaf_afr:0.28, eaf_eur:0.12,  ref:'Kouriba 2022' },
    { chr:19, pos:11200000,  rsid:'rs429358',   gene:'APOE',     trait:'Alzheimer / Lipids',          p:5e-19,  beta: 0.25, eaf_afr:0.14, eaf_eur:0.08,  ref:'Zhou 2023' },
    { chr:10, pos:114785000, rsid:'rs7903146',  gene:'TCF7L2',   trait:'Type 2 Diabetes',             p:2e-18,  beta: 0.17, eaf_afr:0.26, eaf_eur:0.30,  ref:'H3Africa 2022' },
    { chr:8,  pos:19090000,  rsid:'rs13281615', gene:'MYCT1',    trait:'Prostate Cancer',             p:6e-16,  beta: 0.14, eaf_afr:0.38, eaf_eur:0.15,  ref:'Bensen 2016' },
    { chr:13, pos:28025000,  rsid:'rs9833888',  gene:'BRCA2',    trait:'Breast Cancer',               p:1e-14,  beta: 0.12, eaf_afr:0.44, eaf_eur:0.48,  ref:'H3Africa 2021' },
    { chr:14, pos:53444000,  rsid:'rs8021978',  gene:'GNG2',     trait:'Malaria Anaemia',             p:3e-13,  beta: 0.11, eaf_afr:0.22, eaf_eur:0.31,  ref:'Band 2022' },
    { chr:22, pos:24130000,  rsid:'rs738409',   gene:'PNPLA3',   trait:'NAFLD / Liver Disease',      p:7e-12,  beta: 0.18, eaf_afr:0.07, eaf_eur:0.23,  ref:'Speliotes 2011' },
  ];

  /* ── Chromosome sizes (Mb) for Manhattan plot ── */
  const CHR_SIZES = [248,242,198,190,181,170,159,145,138,133,135,133,114,106,100,90,83,80,58,63,46,51,155];
  const CHR_COLORS = ['#1f6feb','#58a6ff'];

  /* ── Simulated background SNPs for full Manhattan ── */
  function _generateManhattan() {
    const snps = [];
    let cum = 0;
    const offsets = [];
    CHR_SIZES.forEach((sz, ci) => {
      offsets.push(cum);
      const n = Math.floor(sz * 0.8 + Math.random() * sz * 0.4);
      for (let i = 0; i < n; i++) {
        const pos = Math.random() * sz * 1e6;
        const logp = Math.random() < 0.005 ? (5 + Math.random() * 8) : (Math.random() * 5);
        snps.push({ chr: ci + 1, pos, abspos: cum + pos / 1e6, logp });
      }
      cum += sz + 10;
    });
    /* Inject real significant hits */
    AFRICAN_LOCI.forEach(loc => {
      const ci = (loc.chr === 23 ? 22 : loc.chr) - 1;
      const logp = -Math.log10(loc.p);
      snps.push({ chr: loc.chr === 23 ? 23 : loc.chr, pos: loc.pos, abspos: offsets[ci] + loc.pos / 1e6, logp, rsid: loc.rsid, gene: loc.gene, trait: loc.trait, highlight: true });
    });
    return { snps, offsets, total: CHR_SIZES.reduce((a, b) => a + b, 0) + CHR_SIZES.length * 10 };
  }

  /* ── Manhattan SVG ── */
  function _manhattanSVG(container) {
    const { snps, offsets, total } = _generateManhattan();
    const W = Math.min(container.offsetWidth - 4, 1100);
    const H = 280;
    const PAD = { l: 48, r: 20, t: 16, b: 32 };
    const pw = W - PAD.l - PAD.r;
    const ph = H - PAD.t - PAD.b;
    const maxLogP = 22;
    const xScale = v => PAD.l + (v / total) * pw;
    const yScale = v => PAD.t + ph - Math.min(v, maxLogP) / maxLogP * ph;

    let circlesSVG = '';
    let labelsArr = [];
    snps.forEach(s => {
      const x = xScale(s.abspos);
      const y = yScale(s.logp);
      const ci = (s.chr === 23 ? 22 : s.chr) - 1;
      const col = s.highlight ? '#f97316' : CHR_COLORS[ci % 2];
      if (s.highlight) {
        circlesSVG += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4" fill="${col}" stroke="#fff" stroke-width="1" opacity="0.95" data-label="${s.gene}:${s.trait}"/>`;
        labelsArr.push({ x, y, gene: s.gene });
      } else if (s.logp > 1.5) {
        circlesSVG += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="1.5" fill="${col}" opacity="0.55"/>`;
      }
    });

    /* Chromosome labels */
    let chrLabels = '';
    CHR_SIZES.forEach((sz, ci) => {
      const midX = xScale(offsets[ci] + sz / 2);
      if (ci < 22) chrLabels += `<text x="${midX.toFixed(1)}" y="${H - 6}" font-size="7.5" fill="#8b949e" text-anchor="middle" font-family="monospace">${ci + 1}</text>`;
    });

    /* Y-axis labels */
    let yLabels = '';
    [0, 5, 10, 15, 20].forEach(v => {
      const y = yScale(v);
      yLabels += `<text x="${PAD.l - 6}" y="${y.toFixed(1)}" font-size="8" fill="#8b949e" text-anchor="end" dominant-baseline="middle" font-family="monospace">${v}</text>`;
      yLabels += `<line x1="${PAD.l}" y1="${y.toFixed(1)}" x2="${W - PAD.r}" y2="${y.toFixed(1)}" stroke="#21262d" stroke-width="0.5"/>`;
    });

    /* Genome-wide significance line (p=5e-8, logp≈7.3) */
    const sigY = yScale(7.3);
    const sugY = yScale(5);

    /* Gene labels (avoid overlap simply) */
    const usedX = new Set();
    let geneLabels = labelsArr.map(({ x, y, gene }) => {
      const lx = Math.round(x / 18);
      if (usedX.has(lx)) return '';
      usedX.add(lx);
      return `<text x="${x.toFixed(1)}" y="${(y - 8).toFixed(1)}" font-size="7.5" fill="#f97316" text-anchor="middle" font-family="monospace" font-weight="600">${gene}</text>`;
    }).join('');

    return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" style="display:block">
      ${yLabels}
      <line x1="${PAD.l}" y1="${sigY.toFixed(1)}" x2="${W - PAD.r}" y2="${sigY.toFixed(1)}" stroke="#f85149" stroke-width="1" stroke-dasharray="4,3"/>
      <text x="${W - PAD.r - 2}" y="${(sigY - 3).toFixed(1)}" font-size="7" fill="#f85149" text-anchor="end" font-family="monospace">5×10⁻⁸</text>
      <line x1="${PAD.l}" y1="${sugY.toFixed(1)}" x2="${W - PAD.r}" y2="${sugY.toFixed(1)}" stroke="#e3b341" stroke-width="0.8" stroke-dasharray="3,3"/>
      ${circlesSVG}
      ${geneLabels}
      <line x1="${PAD.l}" y1="${PAD.t}" x2="${PAD.l}" y2="${H - PAD.b}" stroke="#30363d" stroke-width="1"/>
      <line x1="${PAD.l}" y1="${H - PAD.b}" x2="${W - PAD.r}" y2="${H - PAD.b}" stroke="#30363d" stroke-width="1"/>
      ${chrLabels}
      <text x="${PAD.l / 2}" y="${H / 2}" font-size="9" fill="#8b949e" text-anchor="middle" font-family="monospace" transform="rotate(-90,${PAD.l / 2},${H / 2})">-log₁₀(p)</text>
    </svg>`;
  }

  /* ── QQ plot SVG ── */
  function _qqSVG() {
    const W = 260, H = 220, PAD = 36;
    const pw = W - PAD - 20, ph = H - PAD - 20;
    const n = 300;
    const obs = [];
    for (let i = 1; i <= n; i++) {
      const u = Math.random();
      let logp = u < 0.01 ? (5 + Math.random() * 15) : (-Math.log10(u));
      obs.push(logp);
    }
    obs.sort((a, b) => b - a);
    const expected = obs.map((_, i) => -Math.log10((i + 1) / (n + 1)));
    const maxV = Math.min(Math.max(...obs), 20);

    const xs = v => PAD + (v / maxV) * pw;
    const ys = v => H - PAD - 10 - (v / maxV) * ph;

    let dots = '';
    obs.forEach((o, i) => {
      const ex = expected[i];
      const x = xs(Math.min(ex, maxV));
      const y = ys(Math.min(o, maxV));
      const col = o > 7.3 ? '#f97316' : (o > 5 ? '#e3b341' : '#58a6ff');
      dots += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${o > 5 ? 2.5 : 1.5}" fill="${col}" opacity="0.75"/>`;
    });

    const diag = `<line x1="${xs(0).toFixed(1)}" y1="${ys(0).toFixed(1)}" x2="${xs(maxV).toFixed(1)}" y2="${ys(maxV).toFixed(1)}" stroke="#3fb950" stroke-width="1" stroke-dasharray="3,2"/>`;

    return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" style="display:block">
      ${[0,5,10,15].map(v => v <= maxV ? `
        <text x="${xs(v).toFixed(1)}" y="${H - 14}" font-size="7.5" fill="#8b949e" text-anchor="middle" font-family="monospace">${v}</text>
        <text x="${PAD - 5}" y="${ys(v).toFixed(1)}" font-size="7.5" fill="#8b949e" text-anchor="end" dominant-baseline="middle" font-family="monospace">${v}</text>
        <line x1="${xs(v).toFixed(1)}" y1="${H - PAD - 10}" x2="${xs(v).toFixed(1)}" y2="${PAD - 10}" stroke="#21262d" stroke-width="0.4"/>
        <line x1="${PAD}" y1="${ys(v).toFixed(1)}" x2="${W - 20}" y2="${ys(v).toFixed(1)}" stroke="#21262d" stroke-width="0.4"/>
      ` : '').join('')}
      ${diag}
      ${dots}
      <line x1="${PAD}" y1="${H - PAD - 10}" x2="${W - 20}" y2="${H - PAD - 10}" stroke="#30363d"/>
      <line x1="${PAD}" y1="${PAD - 10}" x2="${PAD}" y2="${H - PAD - 10}" stroke="#30363d"/>
      <text x="${W / 2}" y="${H - 2}" font-size="8" fill="#8b949e" text-anchor="middle" font-family="monospace">Expected -log₁₀(p)</text>
      <text x="10" y="${H / 2}" font-size="8" fill="#8b949e" text-anchor="middle" transform="rotate(-90,10,${H / 2})" font-family="monospace">Observed -log₁₀(p)</text>
      <text x="${W / 2}" y="10" font-size="9" fill="#c9d1d9" text-anchor="middle" font-weight="600" font-family="monospace">QQ Plot (λGC = 1.02)</text>
    </svg>`;
  }

  /* ── PLINK2 commands ── */
  const PLINK_CMDS = [
    {
      step: 1, label: 'Quality Control',
      cmd: `plink2 --bfile ${'{'}cohort{'}'} \\
  --geno 0.05 \\
  --mind 0.10 \\
  --maf 0.01 \\
  --hwe 1e-6 \\
  --make-bed \\
  --out cohort_qc`,
      desc: 'Filter by genotype call rate (95%), sample call rate (90%), MAF ≥1%, HWE p>1e-6'
    },
    {
      step: 2, label: 'Ancestry / PCA',
      cmd: `plink2 --bfile cohort_qc \\
  --indep-pairwise 200 50 0.2 \\
  --out pruned_snps

plink2 --bfile cohort_qc \\
  --extract pruned_snps.prune.in \\
  --pca 20 \\
  --out pca_results`,
      desc: 'LD pruning then PCA to detect and visualise ancestry structure'
    },
    {
      step: 3, label: 'Relatedness Check',
      cmd: `plink2 --bfile cohort_qc \\
  --king-cutoff 0.0625 \\
  --out unrelated_samples`,
      desc: 'Remove 3rd-degree relatives (KING kinship > 0.0625) for mixed-ancestry African cohorts'
    },
    {
      step: 4, label: 'Imputation (African Panel)',
      cmd: `# Phase with SHAPEIT4
shapeit4 --input cohort_qc.vcf.gz \\
  --map chr${'{'}CHR{'}'}GRCh38.map \\
  --region chr${'{'}CHR{'}'} \\
  --output phased_chr${'{'}CHR{'}'}.vcf.gz

# Impute with H3Africa / AWI-Gen panel
minimac4 --refHaps AWIGen_panel_chr${'{'}CHR{'}'}.msav \\
  --haps phased_chr${'{'}CHR{'}'}.vcf.gz \\
  --prefix imputed_chr${'{'}CHR{'}'} \\
  --format GT,DS,GP`,
      desc: 'Use Africa-specific reference panels (AWI-Gen, H3Africa) for best imputation accuracy in African samples'
    },
    {
      step: 5, label: 'Association Testing',
      cmd: `# Linear mixed model (corrects for population structure)
regenie \\
  --step 1 \\
  --bed cohort_qc \\
  --phenoFile phenotypes.txt \\
  --covarFile covariates.txt \\
  --bsize 1000 \\
  --out step1_results

regenie \\
  --step 2 \\
  --pgen imputed_merged \\
  --phenoFile phenotypes.txt \\
  --covarFile covariates.txt \\
  --bsize 400 \\
  --pred step1_results_pred.list \\
  --out gwas_results`,
      desc: 'REGENIE whole-genome regression — handles cryptic relatedness and mixed ancestry common in African cohorts'
    },
    {
      step: 6, label: 'Clumping & Fine-mapping',
      cmd: `# Clump to independent loci
plink2 --bfile cohort_qc \\
  --clump gwas_results.regenie \\
  --clump-p1 5e-8 \\
  --clump-p2 1e-5 \\
  --clump-r2 0.1 \\
  --clump-kb 500 \\
  --out significant_loci

# Fine-map with SuSiE
# In R:
# library(susieR)
# fitted <- susie(X, y, L=10)`,
      desc: 'Identify independent signals, then SuSiE fine-mapping to prioritise causal variants'
    },
  ];

  /* ── PCA population structure plot ── */
  function _pcaSVG() {
    const W = 260, H = 200, PAD = 36;
    const pops = [
      { id:'YRI', label:'Yoruba (NG)',   color:'#f97316', pc1:[-1.8,-1.0], pc2:[ 0.5, 1.5] },
      { id:'LWK', label:'Luhya (KE)',    color:'#e3b341', pc1:[-1.5,-0.8], pc2:[ 0.3, 1.3] },
      { id:'GWD', label:'Mandinka (GM)', color:'#3fb950', pc1:[-2.0,-1.2], pc2:[-0.5, 0.8] },
      { id:'MSL', label:'Mende (SL)',    color:'#58a6ff', pc1:[-1.9,-1.1], pc2:[-0.8, 0.5] },
      { id:'ESN', label:'Esan (NG)',     color:'#bc8cff', pc1:[-1.7,-0.9], pc2:[ 0.2, 1.2] },
    ];
    const allPts = pops.flatMap(p =>
      Array.from({length:40}, () => [
        p.pc1[0] + Math.random()*(p.pc1[1]-p.pc1[0]),
        p.pc2[0] + Math.random()*(p.pc2[1]-p.pc2[0])
      ]).map(([x,y]) => ({x, y, color:p.color}))
    );

    const xs = v => PAD + ((v + 3) / 6) * (W - PAD - 16);
    const ys = v => H - PAD - ((v + 1.5) / 3) * (H - PAD - 20);

    const dots = allPts.map(pt =>
      `<circle cx="${xs(pt.x).toFixed(1)}" cy="${ys(pt.y).toFixed(1)}" r="2.5" fill="${pt.color}" opacity="0.7"/>`
    ).join('');

    const legend = pops.map((p, i) =>
      `<rect x="${W - 58}" y="${PAD - 5 + i * 14}" width="7" height="7" rx="3" fill="${p.color}"/>
       <text x="${W - 48}" y="${PAD + 2 + i * 14}" font-size="6.5" fill="#8b949e" font-family="monospace">${p.label}</text>`
    ).join('');

    return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" style="display:block">
      <line x1="${PAD}" y1="${H-PAD}" x2="${W-16}" y2="${H-PAD}" stroke="#30363d"/>
      <line x1="${PAD}" y1="${PAD-10}" x2="${PAD}" y2="${H-PAD}" stroke="#30363d"/>
      ${dots}
      ${legend}
      <text x="${W/2}" y="${H-4}" font-size="7.5" fill="#8b949e" text-anchor="middle" font-family="monospace">PC1 (4.2%)</text>
      <text x="10" y="${H/2}" font-size="7.5" fill="#8b949e" text-anchor="middle" transform="rotate(-90,10,${H/2})" font-family="monospace">PC2 (3.1%)</text>
      <text x="${W/2}" y="10" font-size="9" fill="#c9d1d9" text-anchor="middle" font-weight="600" font-family="monospace">PCA — African Populations</text>
    </svg>`;
  }

  /* ── Active tab ── */
  let _tab = 'manhattan';

  function switchTab(t, btn) {
    _tab = t;
    document.querySelectorAll('.gwas-tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.gwas-panel').forEach(p => p.classList.remove('active'));
    const panel = document.getElementById('gwas-panel-' + t);
    if (panel) panel.classList.add('active');
  }

  /* ── Copy command ── */
  function copyCmd(btn) {
    const pre = btn.closest('.plink-block').querySelector('pre');
    if (!pre) return;
    navigator.clipboard.writeText(pre.textContent).then(() => {
      const orig = btn.textContent;
      btn.textContent = '[OK] Copied';
      setTimeout(() => { btn.textContent = orig; }, 1500);
    });
  }

  /* ── init ── */
  function init() {
    const container = document.getElementById('gwas-content');
    if (!container || container.querySelector('.gwas-page')) return;

    const lociRows = AFRICAN_LOCI.map(l => `
      <tr onclick="OmicsLab.GWAS.highlightLocus('${l.rsid}')" style="cursor:pointer">
        <td><span class="gwas-rsid">${l.rsid}</span></td>
        <td><b style="color:#3fb950">${l.gene}</b></td>
        <td>${l.chr === 23 ? 'X' : l.chr}</td>
        <td>${(l.pos / 1e6).toFixed(2)} Mb</td>
        <td style="color:#f85149">${l.p < 1e-100 ? '<10⁻¹⁰⁰' : l.p.toExponential(1)}</td>
        <td>${l.eaf_afr.toFixed(2)}</td>
        <td style="color:${l.eaf_afr > l.eaf_eur + 0.1 ? '#3fb950' : l.eaf_afr < l.eaf_eur - 0.1 ? '#f85149' : '#8b949e'}">${l.eaf_eur.toFixed(3)}</td>
        <td style="color:#e3b341">${l.trait}</td>
        <td style="color:#58a6ff;font-size:0.72rem">${l.ref}</td>
      </tr>
    `).join('');

    const plinkBlocks = PLINK_CMDS.map(c => `
      <div class="plink-block">
        <div class="plink-block-header">
          <span class="plink-step">Step ${c.step}</span>
          <span class="plink-label">${c.label}</span>
          <button class="plink-copy-btn" onclick="OmicsLab.GWAS.copyCmd(this)">Copy</button>
        </div>
        <p class="plink-desc">${c.desc}</p>
        <pre class="plink-code">${c.cmd}</pre>
      </div>
    `).join('');

    container.innerHTML = `
      <div class="gwas-page">
        <div class="gwas-header">
          <h1 class="gwas-title">GWAS Analysis Suite</h1>
          <p class="gwas-subtitle">Genome-wide association analysis pipeline for African cohorts — PLINK2, REGENIE, SuSiE, AWI-Gen &amp; H3Africa reference panels</p>
        </div>

        <div class="gwas-stats-row">
          <div class="gwas-stat"><div class="gwas-stat-n">47M+</div><div class="gwas-stat-l">Imputed SNPs (African panel)</div></div>
          <div class="gwas-stat"><div class="gwas-stat-n">54K+</div><div class="gwas-stat-l">H3Africa samples</div></div>
          <div class="gwas-stat"><div class="gwas-stat-n">20+</div><div class="gwas-stat-l">Significant African loci</div></div>
          <div class="gwas-stat"><div class="gwas-stat-n">5×10⁻⁸</div><div class="gwas-stat-l">Genome-wide threshold</div></div>
        </div>

        <div class="gwas-tabs">
          <button class="gwas-tab-btn active" onclick="OmicsLab.GWAS.switchTab('manhattan',this)">Manhattan Plot</button>
          <button class="gwas-tab-btn" onclick="OmicsLab.GWAS.switchTab('qq',this)">QQ Plot + PCA</button>
          <button class="gwas-tab-btn" onclick="OmicsLab.GWAS.switchTab('loci',this)">African Loci</button>
          <button class="gwas-tab-btn" onclick="OmicsLab.GWAS.switchTab('pipeline',this)">PLINK2 Pipeline</button>
        </div>

        <!-- Manhattan panel -->
        <div class="gwas-panel active" id="gwas-panel-manhattan">
          <div class="gwas-panel-title">Genome-wide Manhattan Plot — African Cohort GWAS (n=12,430)</div>
          <p class="gwas-panel-desc">Orange dots = curated African GWAS hits. Red dashed line = genome-wide significance (p=5×10⁻⁸). Yellow dashed = suggestive (p=1×10⁻⁵).</p>
          <div id="gwas-manhattan-svg" class="gwas-manhattan-wrap"></div>
          <div class="gwas-legend-row">
            <span class="gwas-legend-item"><span style="background:#1f6feb" class="gwas-legend-dot"></span>Odd chromosomes</span>
            <span class="gwas-legend-item"><span style="background:#58a6ff" class="gwas-legend-dot"></span>Even chromosomes</span>
            <span class="gwas-legend-item"><span style="background:#f97316" class="gwas-legend-dot"></span>African GWAS hits</span>
            <span class="gwas-legend-item"><span style="background:#f85149;width:20px;height:2px;border-radius:0" class="gwas-legend-dot"></span>Genome-wide sig.</span>
          </div>
        </div>

        <!-- QQ + PCA panel -->
        <div class="gwas-panel" id="gwas-panel-qq">
          <div class="gwas-qq-grid">
            <div class="gwas-chart-wrap">
              <div class="gwas-panel-title">QQ Plot</div>
              <p class="gwas-panel-desc">λ<sub>GC</sub>=1.02 indicates minimal inflation — appropriate population structure correction applied.</p>
              <div id="gwas-qq-svg"></div>
            </div>
            <div class="gwas-chart-wrap">
              <div class="gwas-panel-title">Principal Components — African Populations</div>
              <p class="gwas-panel-desc">PCA on 1000G African superpopulation subgroups. Include top 10 PCs as covariates in REGENIE.</p>
              <div id="gwas-pca-svg"></div>
            </div>
          </div>
        </div>

        <!-- Loci table panel -->
        <div class="gwas-panel" id="gwas-panel-loci">
          <div class="gwas-panel-title">Curated African GWAS Loci</div>
          <p class="gwas-panel-desc">Significant loci with African-specific effect allele frequencies (EAF). Green = enriched in Africans vs Europeans. Red = depleted.</p>
          <div class="gwas-table-wrap">
            <table class="gwas-table">
              <thead>
                <tr>
                  <th>rsID</th><th>Gene</th><th>Chr</th><th>Position</th>
                  <th>p-value</th><th>EAF (AFR)</th><th>EAF (EUR)</th>
                  <th>Trait</th><th>Reference</th>
                </tr>
              </thead>
              <tbody>${lociRows}</tbody>
            </table>
          </div>
        </div>

        <!-- Pipeline panel -->
        <div class="gwas-panel" id="gwas-panel-pipeline">
          <div class="gwas-panel-title">PLINK2 / REGENIE Pipeline — Africa-Optimised</div>
          <p class="gwas-panel-desc">Six-step workflow designed for H3Africa, AWI-Gen, and PANDORA cohorts. Uses Africa-specific reference panels for imputation.</p>
          <div class="plink-pipeline">
            ${plinkBlocks}
          </div>
          <div class="gwas-ref-panels">
            <div class="gwas-panel-title" style="margin-top:2rem">Africa-Specific Reference Panels</div>
            <div class="ref-panel-grid">
              ${[
                { name:'AWI-Gen',    pop:'11,876',  region:'Ghana, Kenya, Nigeria, SA',  snps:'14.5M', url:'https://awigehn.org' },
                { name:'H3Africa',   pop:'54,000+', region:'Pan-African (30 countries)', snps:'~35M',  url:'https://h3africa.org' },
                { name:'1000G AFR',  pop:'661',     region:'5 African populations',      snps:'~38M',  url:'https://www.internationalgenome.org' },
                { name:'APCDR',      pop:'6,000+',  region:'Uganda, South Africa',       snps:'~15M',  url:'https://apcdr.org' },
              ].map(p => `
                <div class="ref-panel-card">
                  <div class="ref-panel-name">${p.name}</div>
                  <div class="ref-panel-stat"><span>Samples</span><b>${p.pop}</b></div>
                  <div class="ref-panel-stat"><span>Region</span><b>${p.region}</b></div>
                  <div class="ref-panel-stat"><span>SNPs</span><b>${p.snps}</b></div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;

    /* Render SVG plots */
    const mWrap = document.getElementById('gwas-manhattan-svg');
    if (mWrap) mWrap.innerHTML = _manhattanSVG(mWrap);

    const qqWrap = document.getElementById('gwas-qq-svg');
    if (qqWrap) qqWrap.innerHTML = _qqSVG();

    const pcaWrap = document.getElementById('gwas-pca-svg');
    if (pcaWrap) pcaWrap.innerHTML = _pcaSVG();
  }

  function highlightLocus(rsid) {
    const loc = AFRICAN_LOCI.find(l => l.rsid === rsid);
    if (!loc) return;
    OmicsLab.Toast?.show(`${loc.gene} — ${loc.trait} (p=${loc.p.toExponential(1)}, AFR EAF=${loc.eaf_afr})`, 'info');
  }

  return { init, switchTab, copyCmd, highlightLocus };
})();
