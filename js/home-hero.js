/* ═══════════════════════════════════════════════════════════════
   OmicsLab — Home Visual Hero
   DNA double-helix canvas · Central dogma flow · Category grid
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.HomeHero = (function () {
  let _raf   = null;
  let _t     = 0;
  let _canvas = null;

  /* ── Nucleotide palette (A T G C) ── */
  const BASES = [
    { label:'A', full:'Adenine',  c:'#3fb950', r:[63,185,80]  },
    { label:'T', full:'Thymine',  c:'#58a6ff', r:[88,166,255] },
    { label:'G', full:'Guanine',  c:'#bc8cff', r:[188,140,255]},
    { label:'C', full:'Cytosine', c:'#f97316', r:[249,115,22] },
  ];
  const NC = BASES.map(b => b.c);

  /* Complementary pairs: A-T (idx 0↔1), G-C (idx 2↔3) */
  const COMP = [1, 0, 3, 2];

  /* ── Draw one frame of the DNA helix ── */
  function _frame(ctx, W, H, t) {
    ctx.clearRect(0, 0, W, H);

    const cx      = W / 2;
    const r       = Math.min(W * 0.28, 80);   /* helix radius */
    const pitch   = 110;                        /* px per full turn */
    const bpStep  = 18;                         /* px between base pairs */
    const STEP    = 1.5;                        /* strand curve smoothness */

    /* ── Faint centreline glow ── */
    const glowGrad = ctx.createLinearGradient(cx, 0, cx, H);
    glowGrad.addColorStop(0,   'rgba(88,166,255,0)');
    glowGrad.addColorStop(0.5, 'rgba(88,166,255,0.03)');
    glowGrad.addColorStop(1,   'rgba(88,166,255,0)');
    ctx.fillStyle = glowGrad;
    ctx.fillRect(cx - r, 0, r * 2, H);

    /* ── Build strand point arrays ── */
    const s1 = [], s2 = [];
    for (let y = -STEP * 2; y <= H + STEP * 2; y += STEP) {
      const θ = (y / pitch) * Math.PI * 2 + t;
      s1.push({ x: cx + r * Math.cos(θ),           y, z: Math.sin(θ) });
      s2.push({ x: cx + r * Math.cos(θ + Math.PI), y, z: Math.sin(θ + Math.PI) });
    }

    /* ── Build base pair descriptors ── */
    const bps = [];
    for (let y = bpStep; y <= H - bpStep; y += bpStep) {
      const θ   = (y / pitch) * Math.PI * 2 + t;
      const z1  = Math.sin(θ);
      const z2  = Math.sin(θ + Math.PI);
      const idx = Math.floor(y / bpStep) % 4;
      bps.push({ y, idx, cIdx: COMP[idx],
        x1: cx + r * Math.cos(θ),
        x2: cx + r * Math.cos(θ + Math.PI),
        z1, z2, avgZ: (z1 + z2) / 2 });
    }

    const bpBack  = bps.filter(b => b.avgZ <  0);
    const bpFront = bps.filter(b => b.avgZ >= 0);

    /* ── Draw one base pair ── */
    function _drawBP(bp) {
      const depthF = (bp.avgZ + 1) * 0.5;   /* 0 = far back, 1 = front */

      /* Hydrogen-bond connecting rung */
      const rungA = 0.06 + depthF * 0.22;
      const grad  = ctx.createLinearGradient(bp.x1, bp.y, bp.x2, bp.y);
      grad.addColorStop(0,   `rgba(${BASES[bp.idx].r},${rungA})`);
      grad.addColorStop(0.5, `rgba(200,220,255,${rungA * 0.5})`);
      grad.addColorStop(1,   `rgba(${BASES[bp.cIdx].r},${rungA})`);
      ctx.beginPath();
      ctx.moveTo(bp.x1, bp.y);
      ctx.lineTo(bp.x2, bp.y);
      ctx.strokeStyle = grad;
      ctx.lineWidth   = 1 + depthF * 1.2;
      ctx.stroke();

      /* Nucleotide spheres */
      [
        { x: bp.x1, z: bp.z1, base: BASES[bp.idx]  },
        { x: bp.x2, z: bp.z2, base: BASES[bp.cIdx] },
      ].forEach(({ x, z, base }) => {
        const depth = (z + 1) * 0.5;
        const radius  = 4 + depth * 6;          /* 4–10 px */
        const alpha   = 0.25 + depth * 0.65;    /* 0.25–0.90 */
        const [rr, gg, bb] = base.r;

        /* wide outer glow */
        const glow = ctx.createRadialGradient(x, bp.y, 0, x, bp.y, radius * 3.2);
        glow.addColorStop(0,   `rgba(${rr},${gg},${bb},${alpha * 0.35})`);
        glow.addColorStop(0.5, `rgba(${rr},${gg},${bb},${alpha * 0.12})`);
        glow.addColorStop(1,   `rgba(${rr},${gg},${bb},0)`);
        ctx.beginPath(); ctx.arc(x, bp.y, radius * 3.2, 0, Math.PI * 2);
        ctx.fillStyle = glow; ctx.fill();

        /* mid halo */
        const halo = ctx.createRadialGradient(x, bp.y, 0, x, bp.y, radius * 1.8);
        halo.addColorStop(0,   `rgba(${rr},${gg},${bb},${alpha * 0.6})`);
        halo.addColorStop(1,   `rgba(${rr},${gg},${bb},0)`);
        ctx.beginPath(); ctx.arc(x, bp.y, radius * 1.8, 0, Math.PI * 2);
        ctx.fillStyle = halo; ctx.fill();

        /* core sphere */
        const sphere = ctx.createRadialGradient(x - radius * 0.3, bp.y - radius * 0.3, radius * 0.1, x, bp.y, radius);
        sphere.addColorStop(0,   `rgba(255,255,255,${alpha * 0.55})`);
        sphere.addColorStop(0.4, `rgba(${rr},${gg},${bb},${alpha})`);
        sphere.addColorStop(1,   `rgba(${Math.max(0,rr-60)},${Math.max(0,gg-60)},${Math.max(0,bb-60)},${alpha})`);
        ctx.beginPath(); ctx.arc(x, bp.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = sphere; ctx.fill();

        /* base letter label — only on front-facing atoms */
        if (depth > 0.55 && radius > 6.5) {
          const fs = Math.round(radius * 0.95);
          ctx.font        = `700 ${fs}px -apple-system,sans-serif`;
          ctx.textAlign   = 'center';
          ctx.textBaseline= 'middle';
          ctx.fillStyle   = `rgba(255,255,255,${alpha * 0.9})`;
          ctx.fillText(base.label, x, bp.y);
        }
      });
    }

    /* ── Draw one strand as a smooth thick ribbon ── */
    function _drawStrand(pts, rgb, alphaBase, highlight) {
      if (pts.length < 2) return;
      /* Draw as series of short bezier segments, width = f(z) */
      for (let i = 1; i < pts.length; i++) {
        const p   = pts[i], pp = pts[i - 1];
        const z   = (p.z + pp.z) / 2;
        const depth   = (z + 1) * 0.5;
        const alpha   = alphaBase + depth * 0.72;
        const lw      = 1.5 + depth * 7;   /* 1.5 – 8.5 px */

        /* strand gradient — lighter highlight on top face */
        const perp    = lw * 0.5;
        const gStrand = ctx.createLinearGradient(pp.x - perp, pp.y, pp.x + perp, pp.y);
        gStrand.addColorStop(0,   `rgba(${rgb},${alpha * 0.5})`);
        gStrand.addColorStop(0.35,`rgba(255,255,255,${alpha * 0.25})`);
        gStrand.addColorStop(0.65,`rgba(${rgb},${alpha})`);
        gStrand.addColorStop(1,   `rgba(${rgb},${alpha * 0.5})`);

        ctx.beginPath();
        ctx.moveTo(pp.x, pp.y);
        ctx.lineTo(p.x,  p.y);
        ctx.strokeStyle = gStrand;
        ctx.lineWidth   = lw;
        ctx.lineCap     = 'round';
        ctx.stroke();

        /* bright specular highlight line */
        if (depth > 0.55) {
          ctx.beginPath();
          ctx.moveTo(pp.x, pp.y);
          ctx.lineTo(p.x,  p.y);
          ctx.strokeStyle = `rgba(${highlight},${depth * 0.28})`;
          ctx.lineWidth   = lw * 0.22;
          ctx.stroke();
        }
      }
    }

    /* ── Depth-ordered render: back BPs → strands → front BPs ── */
    bpBack.forEach(_drawBP);
    _drawStrand(s1, '63,185,80',  0.08, '200,255,210');
    _drawStrand(s2, '88,166,255', 0.08, '200,230,255');
    bpFront.forEach(_drawBP);
  }

  /* ── Animation loop ── */
  function _animate(canvas) {
    if (_raf) cancelAnimationFrame(_raf);
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    function loop() {
      _frame(ctx, canvas.width, canvas.height, _t);
      _t += 0.009;
      _raf = requestAnimationFrame(loop);
    }
    loop();
  }

  /* ── Stop on navigation away ── */
  function stop() {
    if (_raf) { cancelAnimationFrame(_raf); _raf = null; }
  }

  /* ── Central dogma section ── */
  function _dogmaHtml() {
    return `
<section class="hv-dogma">
  <div class="hv-wrap">
    <div class="hv-section-eyebrow">The Central Dogma of Molecular Biology</div>
    <h2 class="hv-section-title">How information flows from DNA to function</h2>
    <p class="hv-section-sub">Every living organism runs this programme. OmicsLab teaches you to read, analyse, and interrogate it.</p>

    <div class="hv-dogma-flow">

      <!-- NODE: DNA -->
      <div class="hv-d-node">
        <div class="hv-d-icon hv-d-icon-dna">
          <svg viewBox="0 0 64 72" fill="none" width="52" height="58">
            <path d="M32 4 C44 18 44 36 32 50 C20 36 20 18 32 4Z" stroke="#3fb950" stroke-width="1.5" fill="rgba(63,185,80,0.06)"/>
            <path d="M32 4 C20 18 20 36 32 50 C44 36 44 18 32 4Z" stroke="#58a6ff" stroke-width="1.5" fill="rgba(88,166,255,0.06)"/>
            <line x1="17" y1="20" x2="47" y2="20" stroke="#3fb950"  stroke-width="1.2" opacity="0.45"/>
            <line x1="13" y1="30" x2="51" y2="30" stroke="#58a6ff"  stroke-width="1.2" opacity="0.45"/>
            <line x1="13" y1="40" x2="51" y2="40" stroke="#bc8cff" stroke-width="1.2" opacity="0.45"/>
            <line x1="17" y1="50" x2="47" y2="50" stroke="#f97316"  stroke-width="1.2" opacity="0.45"/>
          </svg>
        </div>
        <div class="hv-d-label">DNA</div>
        <div class="hv-d-sub">Double helix · Blueprint</div>
      </div>

      <!-- ARROW: Transcription -->
      <div class="hv-d-arrow">
        <div class="hv-d-arr-track">
          <div class="hv-d-particle hv-dp-a"></div>
          <div class="hv-d-particle hv-dp-b"></div>
          <div class="hv-d-particle hv-dp-c"></div>
          <svg viewBox="0 0 100 14" class="hv-d-arr-svg" preserveAspectRatio="none">
            <line x1="2" y1="7" x2="88" y2="7" stroke="#3fb950" stroke-width="1.8" stroke-dasharray="5 3"/>
            <polygon points="88,3 98,7 88,11" fill="#3fb950"/>
          </svg>
        </div>
        <span class="hv-d-arr-label">Transcription</span>
      </div>

      <!-- NODE: mRNA -->
      <div class="hv-d-node">
        <div class="hv-d-icon hv-d-icon-mrna">
          <svg viewBox="0 0 72 56" fill="none" width="58" height="44">
            <path d="M4 28 Q14 12 24 28 Q34 44 44 28 Q54 12 64 28" stroke="#3fb950" stroke-width="2.5" stroke-linecap="round" fill="none"/>
            <circle cx="4"  cy="28" r="4" fill="#3fb950"  opacity="0.8"/>
            <circle cx="14" cy="14" r="3.5" fill="#58a6ff"  opacity="0.8"/>
            <circle cx="24" cy="28" r="4" fill="#bc8cff" opacity="0.8"/>
            <circle cx="34" cy="42" r="3.5" fill="#f97316"  opacity="0.8"/>
            <circle cx="44" cy="28" r="4" fill="#3fb950"  opacity="0.8"/>
            <circle cx="54" cy="14" r="3.5" fill="#58a6ff"  opacity="0.8"/>
            <circle cx="64" cy="28" r="4" fill="#bc8cff" opacity="0.8"/>
          </svg>
        </div>
        <div class="hv-d-label">mRNA</div>
        <div class="hv-d-sub">Codon sequence · Template</div>
      </div>

      <!-- ARROW: Translation -->
      <div class="hv-d-arrow">
        <div class="hv-d-arr-track">
          <div class="hv-d-particle hv-dp-a" style="animation-delay:.4s"></div>
          <div class="hv-d-particle hv-dp-b" style="animation-delay:1.2s"></div>
          <div class="hv-d-particle hv-dp-c" style="animation-delay:2s"></div>
          <svg viewBox="0 0 100 14" class="hv-d-arr-svg" preserveAspectRatio="none">
            <line x1="2" y1="7" x2="88" y2="7" stroke="#58a6ff" stroke-width="1.8" stroke-dasharray="5 3"/>
            <polygon points="88,3 98,7 88,11" fill="#58a6ff"/>
          </svg>
        </div>
        <span class="hv-d-arr-label">Translation</span>
      </div>

      <!-- NODE: Ribosome -->
      <div class="hv-d-node">
        <div class="hv-d-icon hv-d-icon-ribosome">
          <svg viewBox="0 0 72 64" fill="none" width="56" height="50">
            <ellipse cx="36" cy="24" rx="28" ry="13" fill="rgba(88,166,255,0.1)" stroke="#58a6ff" stroke-width="1.5"/>
            <ellipse cx="36" cy="44" rx="20" ry="10" fill="rgba(88,166,255,0.16)" stroke="#58a6ff" stroke-width="1.5"/>
            <path d="M12 34 Q36 30 60 34" stroke="#58a6ff" stroke-width="1" stroke-dasharray="3 2" opacity="0.4"/>
          </svg>
        </div>
        <div class="hv-d-label">Ribosome</div>
        <div class="hv-d-sub">60S + 40S · Assembler</div>
      </div>

      <!-- ARROW: Folding -->
      <div class="hv-d-arrow">
        <div class="hv-d-arr-track">
          <div class="hv-d-particle hv-dp-a" style="animation-delay:.8s"></div>
          <div class="hv-d-particle hv-dp-b" style="animation-delay:1.8s"></div>
          <svg viewBox="0 0 100 14" class="hv-d-arr-svg" preserveAspectRatio="none">
            <line x1="2" y1="7" x2="88" y2="7" stroke="#bc8cff" stroke-width="1.8" stroke-dasharray="5 3"/>
            <polygon points="88,3 98,7 88,11" fill="#bc8cff"/>
          </svg>
        </div>
        <span class="hv-d-arr-label">Folding</span>
      </div>

      <!-- NODE: Protein -->
      <div class="hv-d-node">
        <div class="hv-d-icon hv-d-icon-protein">
          <svg viewBox="0 0 72 60" fill="none" width="56" height="46">
            <circle cx="10" cy="40" r="6"  fill="rgba(249,115,22,0.2)" stroke="#f97316" stroke-width="1.5"/>
            <path d="M16 38 Q22 18 30 30" stroke="#e3b341" stroke-width="1.5" stroke-linecap="round" fill="none"/>
            <circle cx="30" cy="30" r="6"  fill="rgba(188,140,255,0.2)" stroke="#bc8cff" stroke-width="1.5"/>
            <path d="M36 30 Q42 46 50 32" stroke="#58a6ff" stroke-width="1.5" stroke-linecap="round" fill="none"/>
            <circle cx="50" cy="30" r="6"  fill="rgba(63,185,80,0.2)" stroke="#3fb950" stroke-width="1.5"/>
            <path d="M56 30 Q62 18 66 26" stroke="#3fb950" stroke-width="1.5" stroke-linecap="round" fill="none"/>
            <circle cx="66" cy="24" r="5"  fill="rgba(88,166,255,0.2)" stroke="#58a6ff" stroke-width="1.5"/>
          </svg>
        </div>
        <div class="hv-d-label">Protein</div>
        <div class="hv-d-sub">Amino acid chain · Function</div>
      </div>
    </div>

    <!-- Quick-access tools -->
    <div class="hv-dogma-chips">
      <span class="hv-dc-label">Explore in OmicsLab:</span>
      <button class="hv-dc-chip" onclick="OmicsLab.Router.navigate('seq-align')">Sequence Alignment</button>
      <button class="hv-dc-chip" onclick="OmicsLab.Router.navigate('fastqc')">Read QC</button>
      <button class="hv-dc-chip" onclick="OmicsLab.Router.navigate('heatmap')">Expression</button>
      <button class="hv-dc-chip" onclick="OmicsLab.Router.navigate('single-cell')">Single Cell</button>
      <button class="hv-dc-chip" onclick="OmicsLab.Router.navigate('proteomics')">Proteomics</button>
      <button class="hv-dc-chip" onclick="OmicsLab.Router.navigate('variantinterp')">Variants</button>
      <button class="hv-dc-chip hv-dc-chip-accent" onclick="OmicsLab.Router.navigate('guide')">
        View all 87+ tools →
      </button>
    </div>
  </div>
</section>`;
  }

  /* ── Platform categories grid ── */
  function _catsHtml() {
    const CATS = [
      { name:'Lab Simulations',          n:14, c:'#3fb950', p:'lab',            ic:'flask',        d:'14 wet-lab protocols · live QC · error cascade' },
      { name:'Genomics & Sequencing',    n:12, c:'#58a6ff', p:'analysis',       ic:'layers',       d:'FASTQ QC · alignment · variant calling · assembly' },
      { name:'Variant & Clinical',       n:7,  c:'#bc8cff', p:'variantinterp',  ic:'dna',          d:'ACMG classification · GWAS · pharmacogenomics' },
      { name:'Expression & Proteomics',  n:6,  c:'#f85149', p:'heatmap',        ic:'activity',     d:'Heatmaps · RNA atlas · single-cell · mass-spec' },
      { name:'Bioinformatics Pipelines', n:8,  c:'#e3b341', p:'pipeline-visual',ic:'git-branch',   d:'Pipeline builder · terminal · script generator' },
      { name:'African Genomics',         n:10, c:'#f97316', p:'africa',         ic:'globe',        d:'Africa Hub · H3Africa · population structure' },
      { name:'Research & Writing',       n:8,  c:'#58a6ff', p:'grant',          ic:'file-text',    d:'Lab notebook · grant writer · thesis coach' },
      { name:'Training & Community',     n:10, c:'#3fb950', p:'certification',  ic:'award',        d:'Certification · quiz battle · case files · social' },
    ];

    return `
<section class="hv-cats">
  <div class="hv-wrap">
    <div class="hv-section-eyebrow">Platform Overview</div>
    <h2 class="hv-section-title">87+ tools · 8 omics domains</h2>
    <p class="hv-section-sub">Every module is interconnected — progress in one domain deepens understanding across all others.</p>

    <div class="hv-cats-grid">
      ${CATS.map(c => `
        <button class="hv-cat-card" onclick="OmicsLab.Router.navigate('${c.p}')" style="--cc:${c.c}">
          <div class="hv-cat-top">
            <div class="hv-cat-icon">${OmicsLab.Icons?.svg(c.ic, 18) || ''}</div>
            <span class="hv-cat-n">${c.n}</span>
          </div>
          <div class="hv-cat-name">${c.name}</div>
          <div class="hv-cat-desc">${c.d}</div>
        </button>`).join('')}
    </div>

    <div class="hv-cats-footer">
      <button class="hv-guide-cta" onclick="OmicsLab.Router.navigate('guide')">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
        </svg>
        Open the User Guide — full manual with all 87+ tools
      </button>
    </div>
  </div>
</section>`;
  }

  /* ── DNA canvas + feature bullets ── */
  function _dnaHtml() {
    return `
<section class="hv-dna-section">
  <div class="hv-wrap">
    <div class="hv-dna-inner">
      <div class="hv-dna-left">
        <div class="hv-section-eyebrow">Built on Real Science</div>
        <h2 class="hv-dna-title">
          The molecular biology<br>
          <span class="hv-accent">behind every tool</span>
        </h2>
        <p class="hv-dna-body">
          OmicsLab is grounded in the same workflows used in leading African research institutions —
          from DNA extraction to published variant calls. Every simulation teaches you the "why",
          not just the "how".
        </p>
        <ul class="hv-feat-list">
          <li class="hv-feat-item">
            <span class="hv-feat-dot" style="background:#3fb950"></span>
            Real African disease datasets (TB, malaria, sickle cell, COVID-19)
          </li>
          <li class="hv-feat-item">
            <span class="hv-feat-dot" style="background:#58a6ff"></span>
            Industry-standard tools (GATK4, BWA-MEM2, STAR, DESeq2, Kraken2)
          </li>
          <li class="hv-feat-item">
            <span class="hv-feat-dot" style="background:#bc8cff"></span>
            Open Badge 3.0 verifiable certificates across 54 African countries
          </li>
          <li class="hv-feat-item">
            <span class="hv-feat-dot" style="background:#f97316"></span>
            Fully offline — optimised for variable connectivity environments
          </li>
        </ul>
        <div class="hv-dna-btns">
          <button class="hv-btn-p" onclick="OmicsLab.Router.navigate('lab')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            Start Learning
          </button>
          <button class="hv-btn-g" onclick="OmicsLab.Router.navigate('guide')">User Guide</button>
        </div>
      </div>

      <div class="hv-dna-right">
        <div class="hv-canvas-wrap">
          <canvas id="hv-dna-canvas" class="hv-dna-canvas" aria-label="Animated DNA double helix"></canvas>
          <div class="hv-canvas-glow-top"></div>
          <div class="hv-canvas-glow-bot"></div>
        </div>
        <div class="hv-dna-legend">
          ${BASES.map(b => `<span class="hv-leg"><span class="hv-leg-dot" style="background:${b.c};box-shadow:0 0 6px ${b.c}88"></span>${b.full} <em>(${b.label})</em></span>`).join('')}
        </div>
        <div class="hv-dna-pairs-note">A–T &nbsp;·&nbsp; G–C &nbsp; Watson-Crick base pairing</div>
      </div>
    </div>
  </div>
</section>`;
  }

  /* ── Public API ── */
  function init() {
    const el = document.getElementById('home-visual-section');
    if (!el || el.dataset.hvReady) return;
    el.dataset.hvReady = '1';

    el.innerHTML = _dnaHtml() + _dogmaHtml() + _catsHtml();

    /* Resize + start canvas */
    const canvas = document.getElementById('hv-dna-canvas');
    if (canvas) {
      _canvas = canvas;
      function resize() {
        const wrap = canvas.parentElement;
        if (!wrap) return;
        const w = wrap.clientWidth  || 320;
        const h = wrap.clientHeight || 480;
        if (canvas.width !== w || canvas.height !== h) {
          canvas.width  = w;
          canvas.height = h;
        }
      }
      resize();
      window.addEventListener('resize', resize, { passive: true });
      _animate(canvas);
    }
  }

  return { init, stop };
})();
