/* ═══════════════════════════════════════════════════════
   OmicsLab — Genome Browser (Part 3)
   IGV-style locus viewer for key African disease genes.
   Shows reference sequence track, gene annotation, and
   simulated variant + read depth tracks. No BAM parsing —
   all data is synthetic but biologically accurate.
   ═══════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.GenomeBrowser = (function () {

  /* Pre-defined loci */
  const LOCI = {
    HBB: {
      label: 'HBB — Sickle Cell / β-Thalassaemia',
      chrom: 'chr11', start: 5246000, end: 5249000,
      gene: { name:'HBB', strand:'-', exons:[[5246696,5246956],[5247806,5247956],[5248158,5248232],[5248600,5248868]] },
      variants: [
        { pos:5246956, ref:'A', alt:'T', id:'rs334', type:'missense', label:'HBB c.20A>T (SCD)', color:'#ff6b6b' },
        { pos:5247093, ref:'G', alt:'A', id:'rs35004220', type:'missense', label:'HBB p.Glu26Lys (HbE)', color:'#e3b341' },
        { pos:5248232, ref:'G', alt:'A', id:'rs76723693', type:'splice', label:'HBB IVS-I-1 (β-thal)', color:'#f97316' },
      ],
      depth_profile: 'uniform_30',
      note: 'β-globin gene. Sickle cell mutation rs334 at position 5,246,956 is the most common pathogenic variant in sub-Saharan Africa (12–20% allele frequency in West Africa).'
    },
    G6PD: {
      label: 'G6PD — Glucose-6-Phosphate Dehydrogenase',
      chrom: 'chrX', start: 154530000, end: 154540000,
      gene: { name:'G6PD', strand:'+', exons:[[154531355,154531500],[154532200,154532450],[154533100,154533300],[154534800,154535100],[154535650,154536000]] },
      variants: [
        { pos:154535077, ref:'G', alt:'A', id:'rs1050829', type:'missense', label:'G6PD c.202G>A (A- variant)', color:'#ff6b6b' },
        { pos:154531391, ref:'C', alt:'T', id:'rs5030868', type:'missense', label:'G6PD c.563C>T (Mediterranean)', color:'#e3b341' },
      ],
      depth_profile: 'uniform_25',
      note: 'G6PD deficiency protects against malaria. G6PD A- (rs1050829) is present in ~24% of West African populations and causes haemolytic anaemia with certain antimalarials.'
    },
    APOL1: {
      label: 'APOL1 — Kidney Disease Risk (G1/G2)',
      chrom: 'chr22', start: 36264000, end: 36268000,
      gene: { name:'APOL1', strand:'+', exons:[[36264700,36264900],[36265400,36265700],[36266100,36266400],[36267000,36267300]] },
      variants: [
        { pos:36265860, ref:'G', alt:'A', id:'rs73885319', type:'missense', label:'APOL1 G1a p.Ser342Gly', color:'#bc8cff' },
        { pos:36265863, ref:'G', alt:'T', id:'rs60910145', type:'missense', label:'APOL1 G1b p.Ile384Met', color:'#bc8cff' },
        { pos:36265860, ref:'GTATTT', alt:'G', id:'rs71785313', type:'indel', label:'APOL1 G2 6bp del', color:'#58a6ff' },
      ],
      depth_profile: 'uniform_22',
      note: 'APOL1 G1 and G2 risk alleles are nearly exclusive to people of African ancestry. Having 2 risk alleles increases focal segmental glomerulosclerosis risk 7–29-fold.'
    },
    CYP2D6: {
      label: 'CYP2D6 — Pharmacogenomics',
      chrom: 'chr22', start: 42522000, end: 42527000,
      gene: { name:'CYP2D6', strand:'-', exons:[[42522500,42522700],[42523300,42523500],[42524000,42524300],[42524800,42525100],[42525600,42525800],[42526000,42526300]] },
      variants: [
        { pos:42523803, ref:'C', alt:'A', id:'rs1065852', type:'missense', label:'CYP2D6*10 c.100C>T', color:'#e3b341' },
        { pos:42524244, ref:'G', alt:'A', id:'rs16947', type:'missense', label:'CYP2D6*2 c.2850C>T', color:'#00C4A0' },
      ],
      depth_profile: 'cnv_dip',
      note: 'CYP2D6 metabolises ~25% of drugs including codeine, tamoxifen, and many psychotropics. African populations have unique CYP2D6 allele distributions affecting drug dosing.'
    },
  };

  let _currentLocus = null;

  function _view(key) {
    const locus = LOCI[key];
    if (!locus) return;
    _currentLocus = locus;
    _render(locus);
  }

  function _render(locus) {
    const out = document.getElementById('gb-canvas');
    if (!out) return;

    const W = out.clientWidth || 800;
    const RANGE = locus.end - locus.start;
    const toX = pos => Math.round(((pos - locus.start) / RANGE) * (W - 80) + 40);

    /* Depth track */
    const depthSVG = _renderDepth(locus, W);
    /* Gene track */
    const geneSVG = _renderGene(locus, W, toX);
    /* Variant track */
    const varSVG = _renderVariants(locus, W, toX);
    /* Ruler */
    const rulerSVG = _renderRuler(locus, W, toX);

    out.innerHTML = `
      <div class="gb-locus-label">${locus.chrom}:${locus.start.toLocaleString()}–${locus.end.toLocaleString()} · ${locus.gene.name} · ${(RANGE/1000).toFixed(1)} kb window</div>
      <div class="gb-note">${locus.note}</div>
      <div class="gb-tracks">
        <div class="gb-track-row">
          <div class="gb-track-label">Ruler</div>
          <div class="gb-track-svg">${rulerSVG}</div>
        </div>
        <div class="gb-track-row">
          <div class="gb-track-label">Read depth<br><span class="gb-track-sublbl">(simulated)</span></div>
          <div class="gb-track-svg">${depthSVG}</div>
        </div>
        <div class="gb-track-row">
          <div class="gb-track-label">Variants</div>
          <div class="gb-track-svg">${varSVG}</div>
        </div>
        <div class="gb-track-row">
          <div class="gb-track-label">Gene</div>
          <div class="gb-track-svg">${geneSVG}</div>
        </div>
      </div>
      <div class="gb-variant-legend">
        ${locus.variants.map(v => `<div class="gb-var-row"><span class="gb-var-dot" style="background:${v.color}"></span><span class="gb-var-id">${v.id}</span><span class="gb-var-label">${v.label}</span></div>`).join('')}
      </div>`;
  }

  function _renderRuler(locus, W, toX) {
    const ticks = 6;
    const step = Math.round((locus.end - locus.start) / ticks);
    let lines = '';
    for (let i = 0; i <= ticks; i++) {
      const pos = locus.start + i * step;
      const x = toX(pos);
      lines += `<line x1="${x}" y1="12" x2="${x}" y2="18" stroke="#243048" stroke-width="1"/>
        <text x="${x}" y="10" text-anchor="middle" font-size="8" fill="#354060">${(pos/1000).toFixed(1)}k</text>`;
    }
    return `<svg width="100%" height="22" viewBox="0 0 ${W} 22">
      <line x1="40" y1="16" x2="${W-40}" y2="16" stroke="#243048" stroke-width="1"/>
      ${lines}
    </svg>`;
  }

  function _renderDepth(locus, W) {
    const pts = 200;
    const base = locus.depth_profile === 'cnv_dip' ? 22 : 28;
    const vals = [];
    for (let i = 0; i < pts; i++) {
      let d = base + (Math.sin(i * 0.3) * 4) + (Math.random() * 6 - 3);
      if (locus.depth_profile === 'cnv_dip' && i > 80 && i < 120) d *= 0.5;
      vals.push(Math.max(0, d));
    }
    const H = 40;
    const xScale = (W - 80) / pts;
    const maxD = Math.max(...vals);
    const points = vals.map((v, i) => `${(40 + i * xScale).toFixed(1)},${(H - 4 - (v / maxD) * (H - 8)).toFixed(1)}`).join(' ');
    return `<svg width="100%" height="${H}" viewBox="0 0 ${W} ${H}">
      <polyline points="${points}" fill="none" stroke="#58a6ff" stroke-width="1.2" opacity="0.7"/>
      <text x="${W - 36}" y="12" font-size="8" fill="#354060">max:${Math.round(maxD)}×</text>
    </svg>`;
  }

  function _renderGene(locus, W, toX) {
    const H = 36, gene = locus.gene;
    const y = H / 2;
    const x1 = toX(locus.start + 200), x2 = toX(locus.end - 200);
    let svg = `<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="#00C4A0" stroke-width="2" opacity="0.5"/>`;
    gene.exons.forEach(([es, ee]) => {
      const ex = toX(es), ew = Math.max(toX(ee) - toX(es), 4);
      svg += `<rect x="${ex}" y="${y - 7}" width="${ew}" height="14" fill="#00C4A0" rx="2"/>`;
    });
    svg += `<text x="${(x1 + x2) / 2}" y="${H - 4}" text-anchor="middle" font-size="9" fill="#00C4A0">${gene.name} (${gene.strand})</text>`;
    return `<svg width="100%" height="${H}" viewBox="0 0 ${W} ${H}">${svg}</svg>`;
  }

  function _renderVariants(locus, W, toX) {
    const H = 28;
    let svg = '';
    locus.variants.forEach(v => {
      const x = toX(v.pos);
      svg += `<line x1="${x}" y1="2" x2="${x}" y2="${H - 4}" stroke="${v.color}" stroke-width="2"/>
        <circle cx="${x}" cy="4" r="4" fill="${v.color}"><title>${v.label} (${v.id})</title></circle>`;
    });
    return `<svg width="100%" height="${H}" viewBox="0 0 ${W} ${H}">${svg}</svg>`;
  }

  function init() {
    const section = document.getElementById('genomebrowser-section');
    if (!section || section.dataset.gbReady) return;
    section.dataset.gbReady = '1';
    const lociOpts = Object.entries(LOCI).map(([k, l]) => `<option value="${k}">${l.label}</option>`).join('');
    section.innerHTML = `
      <div class="gb-wrap">
        <div class="gb-header">
          <div class="gb-header-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00C4A0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 3h18v18H3z"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/></svg>
            Genome Browser
          </div>
          <div class="gb-header-sub">IGV-style locus viewer — African disease genes, variant tracks, simulated read depth</div>
        </div>
        <div class="gb-controls">
          <select class="gb-locus-select" id="gb-locus-sel">
            <option value="">Select a gene locus...</option>${lociOpts}
          </select>
          <button class="gb-view-btn" onclick="OmicsLab.GenomeBrowser._view(document.getElementById('gb-locus-sel').value)">View Locus</button>
        </div>
        <div id="gb-canvas" class="gb-canvas">
          <div class="gb-empty">Select a locus to view the genome browser</div>
        </div>
      </div>`;
  }

  return { init, _view };
})();
