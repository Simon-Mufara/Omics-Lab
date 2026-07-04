/* ═══════════════════════════════════════════════════════════════
   OmicsLab — Platform Showcase
   Animated canvas cycling through 5 platform scenes.
   Each scene draws itself on a 2D canvas using requestAnimationFrame.
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

/* roundRect polyfill for older Safari / Android WebView */
if (typeof CanvasRenderingContext2D !== 'undefined' && !CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r) {
    if (w < 2*r) r = w/2;
    if (h < 2*r) r = h/2;
    this.beginPath();
    this.moveTo(x+r, y);
    this.arcTo(x+w, y,   x+w, y+h, r);
    this.arcTo(x+w, y+h, x,   y+h, r);
    this.arcTo(x,   y+h, x,   y,   r);
    this.arcTo(x,   y,   x+w, y,   r);
    this.closePath();
    return this;
  };
}

OmicsLab.Showcase = (function () {

  const SCENES = [
    {
      id: 'sequencing',
      tag: 'Genomics',
      title: 'From blood tube to base calls',
      sub: 'Simulate DNA extraction, library prep, and Illumina sequencing — with live QC metrics after every step.',
      cta: 'lab',
      ctaLabel: 'Try Lab Simulations',
      color: '#00C4A0',
    },
    {
      id: 'expression',
      tag: 'Transcriptomics',
      title: 'See which genes switch on',
      sub: 'Run a full RNA-seq pipeline in your browser — STAR alignment, DESeq2 differential expression, volcano plots.',
      cta: 'heatmap',
      ctaLabel: 'Open Expression Visualiser',
      color: '#58a6ff',
    },
    {
      id: 'phylo',
      tag: 'Outbreak Genomics',
      title: 'Trace the index case',
      sub: 'Build phylogenetic trees from pathogen genomes. Identify transmission chains and super-spreader events across Africa.',
      cta: 'outbreak',
      ctaLabel: 'Run Outbreak Simulator',
      color: '#f97316',
    },
    {
      id: 'variants',
      tag: 'Clinical Genomics',
      title: 'Classify variants to ACMG standard',
      sub: 'Interpret VCF variants with ACMG/AMP 2015 criteria, gnomAD African frequencies, and ClinVar evidence.',
      cta: 'variantinterp',
      ctaLabel: 'Open Variant Interpreter',
      color: '#bc8cff',
    },
    {
      id: 'africa',
      tag: 'African Genomics',
      title: '54 countries. One platform.',
      sub: 'H3Africa datasets, population structure, pathogen surveillance, and pharmacogenomics designed for Africa.',
      cta: 'africa',
      ctaLabel: 'Explore Africa Hub',
      color: '#f97316',
    },
  ];

  let _raf = null, _scene = 0, _t = 0, _progress = 0;
  let _canvas = null, _ctx = null, _W = 0, _H = 0;
  let _paused = false, _el = null;
  const SCENE_DURATION = 280; /* frames per scene at 60fps ≈ 4.7s */

  /* ── Colour utilities ── */
  function _hex2rgb(h) {
    const n = parseInt(h.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function _alpha(hex, a) {
    const [r,g,b] = _hex2rgb(hex);
    return `rgba(${r},${g},${b},${a})`;
  }

  /* ════════════════════════════════════════
     SCENE RENDERERS
  ════════════════════════════════════════ */

  /* Scene 0: DNA Sequencing — reads streaming onto a reference */
  function _drawSequencing(ctx, W, H, t) {
    const BASES = ['#00C4A0','#58a6ff','#bc8cff','#f97316'];
    const reads  = 18, baseW = Math.max(6, W / 55), rowH = 18;
    const refY   = H * 0.35;
    const startX = W * 0.06;
    const refW   = W * 0.88;

    /* Reference genome bar */
    const refGrad = ctx.createLinearGradient(startX, 0, startX + refW, 0);
    refGrad.addColorStop(0,   'rgba(63,185,80,0.12)');
    refGrad.addColorStop(0.5, 'rgba(88,166,255,0.18)');
    refGrad.addColorStop(1,   'rgba(63,185,80,0.12)');
    ctx.fillStyle = refGrad;
    ctx.beginPath(); ctx.roundRect(startX, refY - 6, refW, 12, 3); ctx.fill();

    /* Reference base ticks */
    for (let i = 0; i < Math.floor(refW / baseW); i++) {
      ctx.fillStyle = BASES[i % 4];
      ctx.globalAlpha = 0.18;
      ctx.fillRect(startX + i * baseW, refY - 5, baseW - 1, 10);
      ctx.globalAlpha = 1;
    }

    /* Sequencing reads flying in from left */
    for (let r = 0; r < reads; r++) {
      const phase   = (r / reads) * SCENE_DURATION * 0.7;
      const elapsed = ((t + phase) % (SCENE_DURATION * 0.7));
      const frac    = Math.min(elapsed / (SCENE_DURATION * 0.4), 1);
      const eased   = frac < 0.5 ? 2*frac*frac : 1 - Math.pow(-2*frac+2,2)/2;

      const yBase  = refY + rowH * 1.8 + r * (rowH + 3) - (reads * (rowH+3) * 0.5);
      const xStart = -refW * 0.25;
      const xEnd   = startX + (r % Math.floor(refW / (baseW * 8))) * (baseW * 8);
      const x      = xStart + (xEnd - xStart) * eased;
      const y      = yBase;
      const len    = 8; /* bases per read */

      ctx.globalAlpha = 0.12 + eased * 0.7;
      for (let b = 0; b < len; b++) {
        ctx.fillStyle = BASES[(r * 3 + b) % 4];
        ctx.beginPath(); ctx.roundRect(x + b * (baseW+1), y, baseW, rowH - 4, 2); ctx.fill();
      }
      ctx.globalAlpha = 1;

      /* Alignment dash when landed */
      if (frac > 0.9) {
        ctx.strokeStyle = `rgba(63,185,80,${(frac - 0.9) * 6})`;
        ctx.lineWidth = 1;
        ctx.setLineDash([2,2]);
        ctx.beginPath();
        ctx.moveTo(xEnd + baseW * 4, y + rowH / 2);
        ctx.lineTo(xEnd + baseW * 4, refY + 6);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    /* Quality score sparkline */
    const qY = H * 0.78;
    ctx.strokeStyle = 'rgba(63,185,80,0.5)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let x = 0; x < refW; x += 3) {
      const q = 28 + Math.sin(x * 0.08 + t * 0.05) * 6 + Math.random() * 3;
      const py = qY - (q / 40) * H * 0.12;
      x === 0 ? ctx.moveTo(startX + x, py) : ctx.lineTo(startX + x, py);
    }
    ctx.stroke();

    ctx.fillStyle = 'rgba(63,185,80,0.5)';
    ctx.font = '10px monospace';
    ctx.fillText('Per-base quality (Phred)', startX, qY - H * 0.13 - 4);
  }

  /* Scene 1: Heatmap — grid cells filling in with expression values */
  function _drawExpression(ctx, W, H, t) {
    const cols = 10, rows = 8;
    const cellW = Math.min(40, W * 0.06);
    const cellH = cellW * 0.8;
    const gridW = cols * (cellW + 2);
    const gridH = rows * (cellH + 2);
    const ox = (W - gridW) / 2;
    const oy = (H - gridH) / 2 - H * 0.03;

    /* Volcano plot in background */
    const vox = ox + gridW + W * 0.06;
    const voy = oy;
    const vw  = W - vox - W * 0.04;
    const vh  = gridH;

    ctx.strokeStyle = 'rgba(88,166,255,0.12)';
    ctx.lineWidth = 1;
    /* Axes */
    ctx.beginPath(); ctx.moveTo(vox, voy + vh); ctx.lineTo(vox + vw, voy + vh); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(vox, voy); ctx.lineTo(vox, voy + vh); ctx.stroke();

    /* Dots */
    const dots = 60;
    const seed = [3,7,11,2,8,5,1,9,4,6,12,3,7];
    for (let i = 0; i < dots; i++) {
      const phase = (i * 11.3) % SCENE_DURATION;
      if (t % SCENE_DURATION < phase) continue;
      const lfc = ((seed[i % seed.length] * 1.7 + i * 0.31) % 8) - 4;
      const pv  = ((seed[(i+3) % seed.length] * 2.1 + i * 0.19) % 35) + 1;
      const dx  = vox + vw * (0.1 + (lfc + 4) / 8 * 0.8);
      const dy  = voy + vh * (1 - Math.min(pv / 30, 0.95));
      const sig = Math.abs(lfc) > 1.5 && pv > 15;
      ctx.beginPath();
      ctx.arc(dx, dy, sig ? 4 : 2.5, 0, Math.PI * 2);
      ctx.fillStyle = sig ? (lfc > 0 ? 'rgba(248,81,73,0.75)' : 'rgba(88,166,255,0.75)') : 'rgba(139,148,158,0.3)';
      ctx.fill();
    }

    ctx.fillStyle = 'rgba(139,148,158,0.6)';
    ctx.font = '9px -apple-system,sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('log₂FC', vox + vw / 2, voy + vh + 14);
    ctx.textAlign = 'left';

    /* Heatmap */
    const vals = [];
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++) {
        const v = Math.sin(r * 1.1 + c * 0.7 + 0.3) * 0.5 + Math.cos(r * 0.6 - c * 1.2 + 0.9) * 0.5;
        vals.push(v);
      }

    for (let i = 0; i < rows * cols; i++) {
      const phase = (i * 7) % SCENE_DURATION;
      const frac  = Math.min(Math.max((t % SCENE_DURATION - phase) / 25, 0), 1);
      if (frac <= 0) continue;
      const r = Math.floor(i / cols), c = i % cols;
      const v = vals[i];
      let colour;
      if (v > 0.15)       colour = `rgba(248,81,73,${frac * 0.85})`;
      else if (v < -0.15) colour = `rgba(88,166,255,${frac * 0.85})`;
      else                colour = `rgba(255,255,255,${frac * 0.1})`;
      ctx.fillStyle = colour;
      ctx.beginPath(); ctx.roundRect(ox + c * (cellW+2), oy + r * (cellH+2), cellW, cellH, 2); ctx.fill();
    }

    /* Row labels */
    const genes = ['HBB','STAT3','IL6','TNF','MKI67','PCNA','TP53','BCL2'];
    ctx.fillStyle = 'rgba(139,148,158,0.7)';
    ctx.font = `${Math.max(8, cellH * 0.55)}px monospace`;
    ctx.textAlign = 'right';
    for (let r = 0; r < rows; r++)
      ctx.fillText(genes[r], ox - 6, oy + r * (cellH+2) + cellH * 0.72);
    ctx.textAlign = 'left';
  }

  /* Scene 2: Phylogenetic tree drawing itself */
  function _drawPhylo(ctx, W, H, t) {
    const totalFrames = SCENE_DURATION * 0.85;
    const prog = Math.min((t % SCENE_DURATION) / totalFrames, 1);
    const rootX = W * 0.08, rootY = H * 0.5;
    const treeW  = W * 0.56;

    const LEAVES = [
      { y: 0.14, label:'SARS-CoV-2 ZA/2024', col:'#f85149' },
      { y: 0.28, label:'SARS-CoV-2 KE/2024', col:'#f85149' },
      { y: 0.42, label:'SARS-CoV-2 GH/2023', col:'#f97316' },
      { y: 0.57, label:'Index Case NG/2023', col:'#e3b341' },
      { y: 0.70, label:'SARS-CoV-2 ET/2023', col:'#58a6ff' },
      { y: 0.84, label:'SARS-CoV-2 UG/2022', col:'#bc8cff' },
    ];

    const branches = [
      { x1:0,    y1:0.5,  x2:0.35, y2:0.5  },
      { x1:0.35, y1:0.5,  x2:0.35, y2:0.14 },
      { x1:0.35, y1:0.14, x2:1,    y2:0.14 },
      { x1:0.35, y1:0.5,  x2:0.35, y2:0.28 },
      { x1:0.35, y1:0.28, x2:1,    y2:0.28 },
      { x1:0.35, y1:0.5,  x2:0.6,  y2:0.5  },
      { x1:0.6,  y1:0.5,  x2:0.6,  y2:0.42 },
      { x1:0.6,  y1:0.42, x2:1,    y2:0.42 },
      { x1:0.6,  y1:0.5,  x2:0.6,  y2:0.57 },
      { x1:0.6,  y1:0.57, x2:1,    y2:0.57 },
      { x1:0.35, y1:0.5,  x2:0.35, y2:0.77 },
      { x1:0.35, y1:0.77, x2:0.7,  y2:0.77 },
      { x1:0.7,  y1:0.77, x2:0.7,  y2:0.70 },
      { x1:0.7,  y1:0.70, x2:1,    y2:0.70 },
      { x1:0.7,  y1:0.77, x2:0.7,  y2:0.84 },
      { x1:0.7,  y1:0.84, x2:1,    y2:0.84 },
    ];

    const tH = H * 0.72;
    const oY  = (H - tH) / 2;

    branches.forEach((b, i) => {
      const startFrame = i * (totalFrames / branches.length);
      const bProg = Math.min(Math.max((t % SCENE_DURATION - startFrame) / (totalFrames / branches.length), 0), 1);
      if (bProg <= 0) return;
      const x1 = rootX + b.x1 * treeW;
      const y1 = oY   + b.y1 * tH;
      const x2 = rootX + b.x2 * treeW;
      const y2 = oY   + b.y2 * tH;
      const lx = x1 + (x2 - x1) * bProg;
      const ly = y1 + (y2 - y1) * bProg;
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(lx, ly);
      ctx.strokeStyle = 'rgba(63,185,80,0.55)'; ctx.lineWidth = 1.5; ctx.stroke();
    });

    LEAVES.forEach((l, i) => {
      const lx = rootX + treeW;
      const ly = oY + l.y * tH;
      const leafFrame = (i / LEAVES.length) * totalFrames * 0.8;
      const lfrac = Math.min(Math.max((t % SCENE_DURATION - leafFrame) / 20, 0), 1);
      if (lfrac <= 0) return;
      ctx.globalAlpha = lfrac;
      ctx.beginPath(); ctx.arc(lx, ly, 4, 0, Math.PI * 2);
      ctx.fillStyle = l.col; ctx.fill();
      ctx.fillStyle = 'rgba(201,209,217,0.85)';
      ctx.font = `${Math.max(9, H * 0.022)}px -apple-system,sans-serif`;
      ctx.fillText(l.label, lx + 10, ly + 4);
      ctx.globalAlpha = 1;
    });

    /* Index case highlight ring */
    if (prog > 0.7) {
      const lx = rootX + treeW, ly = oY + 0.57 * tH;
      const ring = (prog - 0.7) / 0.3;
      ctx.beginPath(); ctx.arc(lx, ly, 4 + ring * 10, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(227,179,65,${ring * 0.6})`; ctx.lineWidth = 1.5; ctx.stroke();
    }
  }

  /* Scene 3: Variant card — ACMG classification appearing */
  function _drawVariants(ctx, W, H, t) {
    const prog = Math.min((t % SCENE_DURATION) / (SCENE_DURATION * 0.75), 1);
    const cardW = Math.min(W * 0.72, 420);
    const cardH = H * 0.7;
    const cx = (W - cardW) / 2;
    const cy = (H - cardH) / 2;

    /* Card */
    ctx.fillStyle = 'rgba(22,27,34,0.92)';
    ctx.beginPath(); ctx.roundRect(cx, cy, cardW, cardH, 10); ctx.fill();
    ctx.strokeStyle = 'rgba(188,140,255,0.25)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.roundRect(cx, cy, cardW, cardH, 10); ctx.stroke();

    if (prog < 0.05) return;

    const p = cx + 20, top = cy + 18;

    /* Gene name */
    ctx.globalAlpha = Math.min(prog * 5, 1);
    ctx.font = 'bold 15px -apple-system,sans-serif';
    ctx.fillStyle = '#bc8cff';
    ctx.fillText('HBB  p.Glu6Val', p, top + 16);
    ctx.font = '11px monospace';
    ctx.fillStyle = 'rgba(201,209,217,0.65)';
    ctx.fillText('chr11:5227002  G>T  rs334', p, top + 34);

    /* Divider */
    ctx.globalAlpha = Math.min((prog - 0.12) * 8, 1);
    ctx.fillStyle = 'rgba(48,54,61,1)';
    ctx.fillRect(p, top + 42, cardW - 40, 1);

    /* ACMG criteria pills */
    const criteria = [
      { code:'PVS1', label:'Null variant',           col:'#f85149', p:0.18 },
      { code:'PS1',  label:'Same AA change (HbS)',   col:'#f97316', p:0.28 },
      { code:'PM2',  label:'Absent in controls',     col:'#e3b341', p:0.38 },
      { code:'PP5',  label:'ClinVar Pathogenic',     col:'#58a6ff', p:0.48 },
    ];
    criteria.forEach((c, i) => {
      const a = Math.min(Math.max((prog - c.p) * 8, 0), 1);
      if (a <= 0) return;
      ctx.globalAlpha = a;
      ctx.fillStyle = _alpha(c.col, 0.18);
      ctx.beginPath(); ctx.roundRect(p, top + 54 + i * 28, cardW - 40, 22, 4); ctx.fill();
      ctx.fillStyle = c.col;
      ctx.font = 'bold 10px monospace';
      ctx.fillText(c.code, p + 8, top + 54 + i * 28 + 15);
      ctx.fillStyle = 'rgba(201,209,217,0.75)';
      ctx.font = '10px -apple-system,sans-serif';
      ctx.fillText(c.label, p + 52, top + 54 + i * 28 + 15);
    });

    /* Classification badge */
    const badgeA = Math.min(Math.max((prog - 0.7) * 4, 0), 1);
    if (badgeA > 0) {
      ctx.globalAlpha = badgeA;
      const bx = p, by = top + 54 + 4 * 28 + 14;
      ctx.fillStyle = 'rgba(248,81,73,0.12)';
      ctx.beginPath(); ctx.roundRect(bx, by, cardW - 40, 34, 6); ctx.fill();
      ctx.strokeStyle = 'rgba(248,81,73,0.35)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.roundRect(bx, by, cardW - 40, 34, 6); ctx.stroke();
      ctx.font = 'bold 13px -apple-system,sans-serif';
      ctx.fillStyle = '#f85149';
      ctx.fillText('PATHOGENIC', bx + 12, by + 22);
      ctx.font = '10px -apple-system,sans-serif';
      ctx.fillStyle = 'rgba(201,209,217,0.55)';
      ctx.fillText('ACMG/AMP 2015 · Sickle Cell Disease', bx + 120, by + 22);
    }
    ctx.globalAlpha = 1;
  }

  /* Scene 4: Africa map with data points */
  function _drawAfrica(ctx, W, H, t) {
    const prog = Math.min((t % SCENE_DURATION) / (SCENE_DURATION * 0.8), 1);
    const cx = W / 2, cy = H * 0.48;
    const scale = Math.min(W, H) * 0.32;

    /* Simplified Africa silhouette as bezier path */
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(scale / 100, scale / 100);
    ctx.beginPath();
    /* Approximate Africa outline (normalised to ±100) */
    ctx.moveTo(-30, -95);
    ctx.bezierCurveTo(-50, -90, -62, -70, -60, -50);
    ctx.bezierCurveTo(-70, -35, -75, -15, -70, 0);
    ctx.bezierCurveTo(-65, 20, -70, 40, -60, 55);
    ctx.bezierCurveTo(-45, 75, -20, 95, 0, 100);
    ctx.bezierCurveTo(20, 95, 45, 75, 55, 55);
    ctx.bezierCurveTo(65, 35, 68, 15, 62, 0);
    ctx.bezierCurveTo(80, -15, 75, -45, 60, -55);
    ctx.bezierCurveTo(65, -70, 50, -90, 30, -90);
    ctx.bezierCurveTo(15, -105, -10, -100, -30, -95);
    ctx.closePath();
    ctx.fillStyle   = 'rgba(63,185,80,0.06)';
    ctx.strokeStyle = 'rgba(63,185,80,0.22)';
    ctx.lineWidth   = 1.5 / (scale / 100);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    /* Data hotspots */
    const SPOTS = [
      { rx:-0.09, ry:-0.48, label:'Cairo',       col:'#e3b341', type:'GWAS'         },
      { rx:-0.24, ry:-0.06, label:'Dakar',        col:'#f97316', type:'Metagenomics' },
      { rx: 0.04, ry: 0.06, label:'Nairobi',      col:'#00C4A0', type:'WGS'          },
      { rx:-0.10, ry: 0.12, label:'Kinshasa',     col:'#58a6ff', type:'RNA-seq'      },
      { rx: 0.20, ry: 0.22, label:'Dar es Salaam',col:'#00C4A0', type:'AMR'          },
      { rx: 0.04, ry: 0.45, label:'Johannesburg', col:'#bc8cff', type:'scRNA-seq'    },
      { rx:-0.20, ry:-0.22, label:'Lagos',         col:'#f85149', type:'Variant'      },
      { rx: 0.22, ry:-0.28, label:'Addis Ababa',  col:'#58a6ff', type:'Phylo'        },
    ];

    SPOTS.forEach((s, i) => {
      const phase = i / SPOTS.length;
      const a = Math.min(Math.max((prog - phase * 0.7) * 4, 0), 1);
      if (a <= 0) return;
      const sx = cx + s.rx * scale * 2.2;
      const sy = cy + s.ry * scale * 2.2;

      /* Pulse ring */
      const pulse = (t * 0.025 + i * 0.4) % 1;
      ctx.beginPath(); ctx.arc(sx, sy, 5 + pulse * 18, 0, Math.PI * 2);
      ctx.strokeStyle = _alpha(s.col, a * (1 - pulse) * 0.5);
      ctx.lineWidth = 1; ctx.stroke();

      /* Dot */
      ctx.beginPath(); ctx.arc(sx, sy, 4, 0, Math.PI * 2);
      ctx.fillStyle = _alpha(s.col, a * 0.9); ctx.fill();

      /* Label */
      ctx.globalAlpha = Math.min(a * 1.5, 1);
      ctx.fillStyle = 'rgba(201,209,217,0.8)';
      ctx.font = `${Math.max(8, H * 0.018)}px -apple-system,sans-serif`;
      const lx = sx + (s.rx > 0.1 ? 8 : -8);
      ctx.textAlign = s.rx > 0.1 ? 'left' : 'right';
      ctx.fillText(s.label, lx, sy - 7);
      ctx.fillStyle = _alpha(s.col, 0.7);
      ctx.font = `${Math.max(7, H * 0.015)}px monospace`;
      ctx.fillText(s.type, lx, sy + 6);
      ctx.textAlign = 'left';
      ctx.globalAlpha = 1;
    });
  }

  /* ── Master draw ── */
  function _draw() {
    if (!_ctx || !_canvas) return;
    _ctx.clearRect(0, 0, _W, _H);

    const s = SCENES[_scene];
    const lf = Math.min(_t / 20, 1);          /* fade-in */
    const lo = Math.max(0, 1 - (_t - (SCENE_DURATION - 25)) / 20); /* fade-out */
    const alpha = Math.min(lf, lo);
    _ctx.globalAlpha = alpha;

    switch (_scene) {
      case 0: _drawSequencing(_ctx, _W, _H, _t); break;
      case 1: _drawExpression(_ctx, _W, _H, _t); break;
      case 2: _drawPhylo(_ctx, _W, _H, _t);      break;
      case 3: _drawVariants(_ctx, _W, _H, _t);   break;
      case 4: _drawAfrica(_ctx, _W, _H, _t);      break;
    }
    _ctx.globalAlpha = 1;

    /* Progress: advance t */
    if (!_paused) {
      _t++;
      _progress = _t / SCENE_DURATION;
    }

    /* Advance scene */
    if (_t >= SCENE_DURATION) {
      _t = 0;
      _scene = (_scene + 1) % SCENES.length;
      _updateMeta();
    }

    _updateProgressBar();
    _raf = requestAnimationFrame(_draw);
  }

  function _updateProgressBar() {
    const bar = document.getElementById('sc-prog-fill');
    if (bar) bar.style.width = Math.min(_progress * 100, 100) + '%';
  }

  function _updateMeta() {
    const s = SCENES[_scene];
    const tag   = document.getElementById('sc-tag');
    const title = document.getElementById('sc-title');
    const sub   = document.getElementById('sc-sub');
    const btn   = document.getElementById('sc-cta');
    const dots  = document.querySelectorAll('.sc-dot');

    if (tag)   { tag.textContent = s.tag; tag.style.color = s.color; tag.style.background = _alpha(s.color, 0.12); }
    if (title) title.textContent = s.title;
    if (sub)   sub.textContent   = s.sub;
    if (btn)   {
      btn.textContent = s.ctaLabel;
      btn.style.background = s.color;
      btn.onclick = () => OmicsLab.Router?.navigate(s.cta);
    }
    dots.forEach((d, i) => d.classList.toggle('sc-dot-active', i === _scene));
  }

  /* ── Public ── */
  function init() {
    const el = document.getElementById('showcase-section');
    if (!el || el.dataset.scReady) return;
    el.dataset.scReady = '1';
    _el = el;

    el.innerHTML = `
<div class="sc-wrap">
  <div class="sc-left">
    <span class="sc-tag" id="sc-tag"></span>
    <h2 class="sc-title" id="sc-title"></h2>
    <p class="sc-sub" id="sc-sub"></p>
    <button class="sc-cta" id="sc-cta"></button>
    <div class="sc-dots">
      ${SCENES.map((_,i) => `<button class="sc-dot${i===0?' sc-dot-active':''}" onclick="OmicsLab.Showcase.jump(${i})" aria-label="Scene ${i+1}"></button>`).join('')}
    </div>
    <div class="sc-prog-wrap"><div class="sc-prog-fill" id="sc-prog-fill"></div></div>
  </div>
  <div class="sc-right">
    <canvas id="sc-canvas" class="sc-canvas" aria-label="Platform preview animation"></canvas>
  </div>
</div>`;

    const canvas = document.getElementById('sc-canvas');
    _canvas = canvas;
    _ctx    = canvas.getContext('2d');

    function _resize() {
      const wrap = canvas.parentElement;
      _W = canvas.width  = wrap.clientWidth  || 540;
      _H = canvas.height = wrap.clientHeight || 340;
    }
    _resize();
    window.addEventListener('resize', _resize, { passive: true });

    /* Pause on hover */
    canvas.addEventListener('mouseenter', () => { _paused = true; });
    canvas.addEventListener('mouseleave', () => { _paused = false; });

    _updateMeta();
    if (_raf) cancelAnimationFrame(_raf);
    _draw();
  }

  function jump(idx) {
    _scene    = idx;
    _t        = 0;
    _progress = 0;
    _updateMeta();
  }

  function stop() {
    if (_raf) { cancelAnimationFrame(_raf); _raf = null; }
  }

  return { init, stop, jump };
})();
