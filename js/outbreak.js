/* OmicsLab — Genomic Outbreak Simulator v1
   Simulates a real-time pathogen outbreak across Africa.
   Users collect samples, trigger sequencing, build a phylogenetic tree,
   and identify the index case cluster. */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.Outbreak = (function () {

  /* ─── Pathogens ─── */
  const PATHOGENS = [
    { id:'ebola',  name:'Ebola Virus (EBOV)',      color:'#f97316',
      r0:2.0, cfr:0.50, genome:'RNA', genomeLen:18959,  incubation:8,
      desc:'Filovirus — highly lethal haemorrhagic fever; spreads via direct contact.' },
    { id:'mpox',   name:'Mpox (MPXV clade Ib)',    color:'#bc8cff',
      r0:1.4, cfr:0.04, genome:'dsDNA', genomeLen:197000, incubation:12,
      desc:'Orthopoxvirus — zoonotic; resurging in DRC basin with human-to-human spread.' },
    { id:'cholera', name:'Vibrio cholerae O1',     color:'#58a6ff',
      r0:3.5, cfr:0.01, genome:'dsDNA', genomeLen:4033460, incubation:2,
      desc:'Waterborne diarrhoeal disease; linked to flooding and poor WASH infrastructure.' },
    { id:'tb',     name:'M. tuberculosis (XDR-TB)',color:'#e3b341',
      r0:2.5, cfr:0.15, genome:'dsDNA', genomeLen:4411532, incubation:42,
      desc:'Airborne bacterial infection; extensively drug-resistant strains increasing.' },
    { id:'covid',  name:'SARS-CoV-2 (novel var.)', color:'#00C4A0',
      r0:5.5, cfr:0.015, genome:'ssRNA', genomeLen:29903,  incubation:5,
      desc:'Betacoronavirus; novel variant with heightened immune evasion detected.' },
  ];

  /* ─── African cities (lat/lng → SVG x/y on 100×110 viewBox) ─── */
  /* Projection: x=(lng+17)/68*100  y=(37-lat)/72*110  clamped [2,98] */
  const CITIES = [
    { id:'nga', name:'Lagos',        country:'Nigeria',       lng:3.4,   lat:6.5  },
    { id:'gin', name:'Conakry',      country:'Guinea',        lng:-13.7, lat:9.5  },
    { id:'sle', name:'Freetown',     country:'Sierra Leone',  lng:-13.2, lat:8.5  },
    { id:'gha', name:'Accra',        country:'Ghana',         lng:-0.2,  lat:5.6  },
    { id:'abj', name:'Abidjan',      country:'Côte d\'Ivoire',lng:-4.0,  lat:5.3  },
    { id:'cmr', name:'Yaoundé',      country:'Cameroon',      lng:11.5,  lat:3.9  },
    { id:'cod', name:'Kinshasa',     country:'DR Congo',      lng:15.3,  lat:-4.3 },
    { id:'eth', name:'Addis Ababa',  country:'Ethiopia',      lng:38.7,  lat:9.0  },
    { id:'ken', name:'Nairobi',      country:'Kenya',         lng:36.8,  lat:-1.3 },
    { id:'uga', name:'Kampala',      country:'Uganda',        lng:32.6,  lat:0.3  },
    { id:'tza', name:'Dar es Salaam',country:'Tanzania',      lng:39.3,  lat:-6.8 },
    { id:'rwa', name:'Kigali',       country:'Rwanda',        lng:30.1,  lat:-1.9 },
    { id:'mwi', name:'Lilongwe',     country:'Malawi',        lng:33.8,  lat:-13.9},
    { id:'zmb', name:'Lusaka',       country:'Zambia',        lng:28.3,  lat:-15.4},
    { id:'zwe', name:'Harare',       country:'Zimbabwe',      lng:31.0,  lat:-17.8},
    { id:'moz', name:'Maputo',       country:'Mozambique',    lng:32.6,  lat:-25.9},
    { id:'zaf', name:'Johannesburg', country:'South Africa',  lng:28.0,  lat:-26.2},
    { id:'cpt', name:'Cape Town',    country:'South Africa',  lng:18.4,  lat:-33.9},
    { id:'egy', name:'Cairo',        country:'Egypt',         lng:31.2,  lat:30.1 },
    { id:'dkr', name:'Dakar',        country:'Senegal',       lng:-17.4, lat:14.7 },
  ].map(c => {
    const x = Math.min(96, Math.max(4, ((c.lng + 17) / 68) * 100));
    const y = Math.min(96, Math.max(4, ((37 - c.lat) / 72) * 110));
    return { ...c, x, y };
  });

  /* ─── State ─── */
  let _sim = null;   // active simulation object

  /* ─── Build the section HTML ─── */
  function _buildSection() {
    return `
<div class="ob-wrap">
  <!-- Header -->
  <div class="ob-header">
    <div class="ob-header-left">
      <div class="ob-badge"><span class="ob-live-dot"></span> LIVE SIMULATION</div>
      <h2 class="ob-title">Genomic Outbreak Simulator</h2>
      <p class="ob-subtitle">Select a pathogen, watch the outbreak spread, collect samples, sequence genomes, and build a phylogenetic tree to trace the index case.</p>
    </div>
    <div class="ob-stats-row" id="ob-stats-row" style="display:none">
      <div class="ob-stat"><span class="ob-stat-n" id="ob-stat-day">0</span><span class="ob-stat-l">Day</span></div>
      <div class="ob-stat"><span class="ob-stat-n" id="ob-stat-cases">0</span><span class="ob-stat-l">Cases</span></div>
      <div class="ob-stat"><span class="ob-stat-n" id="ob-stat-sites">0</span><span class="ob-stat-l">Sites</span></div>
      <div class="ob-stat"><span class="ob-stat-n" id="ob-stat-seqs">0</span><span class="ob-stat-l">Sequences</span></div>
    </div>
  </div>

  <!-- Pathogen picker -->
  <div class="ob-picker" id="ob-picker">
    <div class="ob-picker-label">Choose pathogen</div>
    <div class="ob-pathogen-grid" id="ob-pathogen-grid">
      ${PATHOGENS.map(p => `
      <button class="ob-pathogen-card" data-pid="${p.id}"
              onclick="OmicsLab.Outbreak._pickPathogen('${p.id}')">
        <span class="ob-path-dot" style="background:${p.color}"></span>
        <span class="ob-path-name">${p.name}</span>
        <span class="ob-path-stat">R₀ ${p.r0} · CFR ${(p.cfr*100).toFixed(0)}%</span>
        <span class="ob-path-desc">${p.desc}</span>
      </button>`).join('')}
    </div>
    <div class="ob-selected-info" id="ob-selected-info" style="display:none">
      <div class="ob-sel-left">
        <span class="ob-sel-name" id="ob-sel-name"></span>
        <span class="ob-sel-genome" id="ob-sel-genome"></span>
      </div>
      <button class="ob-start-btn" id="ob-start-btn"
              onclick="OmicsLab.Outbreak._startSim()">
        ${OmicsLab.Icons?.svg('alert-triangle',14)||''} Start Outbreak
      </button>
    </div>
  </div>

  <!-- Main canvas: map + phylo -->
  <div class="ob-canvas" id="ob-canvas" style="display:none">
    <!-- Africa map -->
    <div class="ob-map-panel">
      <div class="ob-panel-label">${OmicsLab.Icons?.svg('map-pin',13)||''} Live Case Map — Click outbreak sites to collect samples</div>
      <div class="ob-map-wrap">
        <svg id="ob-map-svg" viewBox="0 0 100 110" preserveAspectRatio="xMidYMid meet"
             class="ob-map-svg" aria-label="Africa outbreak map">
          <!-- Africa simplified outline -->
          <defs>
            <radialGradient id="obBg" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#0D1524"/>
              <stop offset="100%" stop-color="#080c10"/>
            </radialGradient>
            <filter id="obGlow">
              <feGaussianBlur stdDeviation="1.5" result="blur"/>
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>
          <rect width="100" height="110" fill="url(#obBg)"/>
          <!-- Africa outline (simplified) -->
          <path class="ob-continent"
            d="M28,5 L38,4 L48,6 L58,5 L68,8 L78,12 L83,18 L84,26
               L82,33 L85,40 L84,48 L80,55 L82,62 L80,70 L76,78
               L70,85 L64,90 L57,94 L50,96 L43,95 L37,91 L31,85
               L25,78 L20,70 L18,62 L15,54 L12,46 L10,38 L8,30
               L10,22 L14,15 L20,9 Z"
            fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="0.5"/>
          <!-- City dots injected by JS -->
          <g id="ob-city-layer"></g>
          <!-- Spread lines injected by JS -->
          <g id="ob-lines-layer"></g>
        </svg>
        <div class="ob-map-legend">
          <span class="ob-leg-item"><span class="ob-leg-dot" style="background:#444"></span>Unaffected</span>
          <span class="ob-leg-item"><span class="ob-leg-dot ob-leg-pulse" id="ob-leg-color"></span>Active cases</span>
          <span class="ob-leg-item"><span class="ob-leg-dot" style="background:#00C4A0"></span>Sequenced</span>
          <span class="ob-leg-item"><span class="ob-leg-dot" style="background:#58a6ff"></span>Index case</span>
        </div>
      </div>
    </div>

    <!-- Right panel: sequencing + phylo -->
    <div class="ob-right-panel">
      <!-- Timeline -->
      <div class="ob-timeline-box">
        <div class="ob-panel-label">${OmicsLab.Icons?.svg('clock',13)||''} Epidemic Timeline</div>
        <div class="ob-timeline" id="ob-timeline"></div>
      </div>
      <!-- Sequence collection -->
      <div class="ob-seq-box" id="ob-seq-box">
        <div class="ob-panel-label">${OmicsLab.Icons?.svg('dna',13)||''} Sample Collection <span id="ob-seq-count-badge" class="ob-seq-badge">0 / 5 needed</span></div>
        <div class="ob-seq-list" id="ob-seq-list">
          <div class="ob-seq-hint">Click an outbreak site on the map to collect a sample.</div>
        </div>
      </div>
      <!-- Phylo tree -->
      <div class="ob-phylo-box" id="ob-phylo-box" style="display:none">
        <div class="ob-panel-label">${OmicsLab.Icons?.svg('git-branch',13)||''} Phylogenetic Tree
          <button class="ob-phylo-rebuild" onclick="OmicsLab.Outbreak._buildPhylo()">Rebuild</button>
        </div>
        <svg id="ob-phylo-svg" class="ob-phylo-svg" viewBox="0 0 300 200"
             preserveAspectRatio="xMinYMid meet"></svg>
        <button class="ob-identify-btn" id="ob-identify-btn"
                onclick="OmicsLab.Outbreak._identifySource()"
                style="display:none">
          ${OmicsLab.Icons?.svg('search',13)||''} Identify Index Case
        </button>
      </div>
      <!-- Result panel -->
      <div class="ob-result-box" id="ob-result-box" style="display:none"></div>
    </div>
  </div>

  <!-- Control bar -->
  <div class="ob-controls" id="ob-controls" style="display:none">
    <button class="ob-ctrl-btn" id="ob-pause-btn" onclick="OmicsLab.Outbreak._togglePause()"><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg> Pause</button>
    <button class="ob-ctrl-btn" onclick="OmicsLab.Outbreak._buildPhylo()" id="ob-build-phylo-btn" disabled>${OmicsLab.Icons?.svg('git-branch',13)||''} Build Phylo Tree</button>
    <button class="ob-ctrl-btn ob-reset" onclick="OmicsLab.Outbreak._reset()">↺ Reset</button>
    <button class="ob-ctrl-btn" onclick="OmicsLab.Outbreak._mpShowSetup()" title="Co-op multiplayer mode — 2 tabs">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
      Co-op
    </button>
    <span class="ob-speed-label">Speed:</span>
    <input type="range" class="ob-speed-slider" id="ob-speed-slider" min="1" max="5" value="2"
           oninput="OmicsLab.Outbreak._setSpeed(this.value)">
  </div>
</div>`;
  }

  /* ─── Pick pathogen ─── */
  function _pickPathogen(pid) {
    const p = PATHOGENS.find(x => x.id === pid);
    if (!p) return;
    document.querySelectorAll('.ob-pathogen-card').forEach(c => c.classList.toggle('selected', c.dataset.pid === pid));
    const info = document.getElementById('ob-selected-info');
    info.style.display = 'flex';
    document.getElementById('ob-sel-name').textContent = p.name;
    document.getElementById('ob-sel-genome').textContent = `Genome: ${p.genome} · ${p.genomeLen.toLocaleString()} bp · Incubation: ${p.incubation}d`;
    info.dataset.pid = pid;
  }

  /* ─── Start simulation ─── */
  function _startSim() {
    const pid = document.getElementById('ob-selected-info')?.dataset.pid;
    if (!pid) return;
    const p = PATHOGENS.find(x => x.id === pid);

    /* Init state */
    const sourceIdx = Math.floor(Math.random() * CITIES.length);
    _sim = {
      pathogen: p,
      source: sourceIdx,
      day: 0,
      paused: false,
      speed: 2,
      sites: CITIES.map((c, i) => ({
        ...c,
        cases: i === sourceIdx ? Math.ceil(p.r0 * 2) : 0,
        total: i === sourceIdx ? Math.ceil(p.r0 * 2) : 0,
        sequenced: false,
        seqDay: null,
        mutations: _randMutations(i === sourceIdx ? 0 : null),
      })),
      sequences: [],
      timeline: [`Day 0 — First case detected in ${CITIES[sourceIdx].name}, ${CITIES[sourceIdx].country}.`],
      identified: false,
    };

    /* Show canvas */
    document.getElementById('ob-picker').style.display = 'none';
    document.getElementById('ob-canvas').style.display = 'grid';
    document.getElementById('ob-controls').style.display = 'flex';
    document.getElementById('ob-stats-row').style.display = 'flex';

    /* Set legend colour */
    const legDot = document.getElementById('ob-leg-color');
    if (legDot) legDot.style.background = p.color;

    _renderMap();
    _renderTimeline();
    _tick();
  }

  /* ─── Simulation tick ─── */
  let _tickTimer = null;
  function _tick() {
    if (!_sim || _sim.paused) return;
    _sim.day++;
    _spreadDisease();
    _renderMap();
    _renderStats();
    _renderTimeline();

    const interval = [2000, 1500, 900, 500, 250][_sim.speed - 1];
    _tickTimer = setTimeout(_tick, interval);
  }

  function _togglePause() {
    if (!_sim) return;
    _sim.paused = !_sim.paused;
    document.getElementById('ob-pause-btn').textContent = _sim.paused ? '▶ Resume' : '⏸ Pause';
    if (!_sim.paused) _tick();
  }

  function _setSpeed(v) { if (_sim) _sim.speed = +v; }

  /* ─── Disease spreading (simplified SIR-inspired) ─── */
  function _spreadDisease() {
    if (!_sim) return;
    const p = _sim.pathogen;
    const newCases = [..._sim.sites.map(s => s.cases)];

    _sim.sites.forEach((site, i) => {
      if (site.cases === 0) return;
      /* Spread to nearby cities proportional to 1/distance */
      CITIES.forEach((other, j) => {
        if (i === j) return;
        const dx = site.x - CITIES[j].x;
        const dy = site.y - CITIES[j].y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist > 35) return; // only spread to nearby cities
        const prob = (p.r0 * 0.035) / (dist * 0.3);
        if (Math.random() < prob) {
          const newC = Math.ceil(Math.random() * p.r0);
          newCases[j] += newC;
          if (_sim.sites[j].cases === 0) {
            _sim.timeline.unshift(`Day ${_sim.day} — ${newC} cases detected in ${CITIES[j].name}, ${CITIES[j].country}.`);
          }
          _sim.sites[j].total += newC;
        }
      });
      /* Logistic growth within site */
      const growth = Math.floor(site.cases * (p.r0 - 1) * 0.08 * (1 - site.cases / 500));
      if (growth > 0) {
        newCases[i] += growth;
        _sim.sites[i].total += growth;
      }
    });
    _sim.sites.forEach((s, i) => { s.cases = Math.min(newCases[i], 5000); });
  }

  /* ─── Map rendering ─── */
  function _renderMap() {
    if (!_sim) return;
    const cityLayer = document.getElementById('ob-city-layer');
    const linesLayer = document.getElementById('ob-lines-layer');
    if (!cityLayer || !linesLayer) return;

    const p = _sim.pathogen;

    /* Draw spread lines from source */
    let linesHtml = '';
    _sim.sites.forEach((site, i) => {
      if (i === _sim.source || site.cases === 0) return;
      const src = _sim.sites[_sim.source];
      linesHtml += `<line x1="${src.x}" y1="${src.y}" x2="${site.x}" y2="${site.y}"
        stroke="${p.color}" stroke-width="0.2" stroke-dasharray="1,1" opacity="0.3"/>`;
    });
    linesLayer.innerHTML = linesHtml;

    /* Draw city dots */
    cityLayer.innerHTML = _sim.sites.map((site, i) => {
      const isSource = i === _sim.source;
      const hasCase  = site.cases > 0;
      const isSeq    = site.sequenced;
      const r = hasCase ? Math.min(4, 1.2 + Math.log1p(site.cases) * 0.5) : 1.2;
      const fill = isSeq ? '#00C4A0' : (isSource ? '#58a6ff' : (hasCase ? p.color : '#2d333b'));
      const cls  = hasCase && !isSeq ? 'ob-dot-pulse' : '';
      return `<g class="ob-city-group" onclick="OmicsLab.Outbreak._collectSample(${i})"
                style="cursor:${hasCase&&!isSeq?'pointer':'default'}">
        <circle cx="${site.x}" cy="${site.y}" r="${r+1.5}" fill="${fill}" opacity="0.18" class="${cls}"/>
        <circle cx="${site.x}" cy="${site.y}" r="${r}" fill="${fill}" class="${cls}"/>
        <title>${site.name}, ${site.country}: ${site.cases.toLocaleString()} cases${isSeq?' (sequenced)':''}</title>
        ${hasCase ? `<text x="${site.x}" y="${site.y - r - 1}" text-anchor="middle"
          font-size="2.2" fill="rgba(255,255,255,0.65)">${site.name}</text>` : ''}
      </g>`;
    }).join('');
  }

  /* ─── Stats bar ─── */
  function _renderStats() {
    if (!_sim) return;
    const totalCases = _sim.sites.reduce((a, s) => a + s.cases, 0);
    const activeSites = _sim.sites.filter(s => s.cases > 0).length;
    document.getElementById('ob-stat-day').textContent   = _sim.day;
    document.getElementById('ob-stat-cases').textContent = totalCases.toLocaleString();
    document.getElementById('ob-stat-sites').textContent = activeSites;
    document.getElementById('ob-stat-seqs').textContent  = _sim.sequences.length;
  }

  /* ─── Timeline ─── */
  function _renderTimeline() {
    const el = document.getElementById('ob-timeline');
    if (!el || !_sim) return;
    el.innerHTML = _sim.timeline.slice(0, 8).map((t, i) =>
      `<div class="ob-tl-item${i===0?' ob-tl-new':''}">${t}</div>`
    ).join('');
  }

  /* ─── Collect sample from a site ─── */
  function _collectSample(siteIdx) {
    if (!_sim) return;
    const site = _sim.sites[siteIdx];
    if (!site.cases || site.sequenced || site.sequencing) return;

    site.sequencing = true;
    const seqId = `SEQ-${_sim.pathogen.id.toUpperCase()}-${String(siteIdx).padStart(3,'0')}`;
    _addSeqItem(seqId, site.name, site.country, 0);

    /* Animate progress */
    let pct = 0;
    const interval = setInterval(() => {
      pct += Math.random() * 15 + 5;
      if (pct >= 100) {
        pct = 100;
        clearInterval(interval);
        site.sequenced = true;
        site.sequencing = false;
        site.seqDay = _sim.day;
        _sim.sequences.push({ seqId, siteIdx, name: site.name, country: site.country,
          mutations: site.mutations, day: _sim.day });
        _updateSeqItem(seqId, 100, site.mutations);
        _renderMap();
        _renderStats();
        _checkPhyloReady();
      } else {
        _updateSeqItem(seqId, Math.floor(pct), null);
      }
    }, 200);
  }

  function _addSeqItem(seqId, city, country, pct) {
    const list = document.getElementById('ob-seq-list');
    const hint = list.querySelector('.ob-seq-hint');
    if (hint) hint.remove();
    const div = document.createElement('div');
    div.className = 'ob-seq-item';
    div.id = `seq-${seqId}`;
    div.innerHTML = `<div class="ob-seq-head"><span class="ob-seq-id">${seqId}</span>
      <span class="ob-seq-loc">${city}, ${country}</span></div>
      <div class="ob-seq-bar-wrap"><div class="ob-seq-bar" id="bar-${seqId}" style="width:${pct}%"></div></div>
      <div class="ob-seq-status" id="status-${seqId}">Sequencing… ${pct}%</div>`;
    list.appendChild(div);
    _updateSeqBadge();
  }

  function _updateSeqItem(seqId, pct, mutations) {
    const bar = document.getElementById(`bar-${seqId}`);
    const status = document.getElementById(`status-${seqId}`);
    if (bar) bar.style.width = pct + '%';
    if (status) {
      if (pct >= 100 && mutations !== null) {
        status.innerHTML = `${OmicsLab.Icons?.svg('check-circle',12)||''} Complete — ${mutations.length} SNPs detected`;
        status.style.color = '#00C4A0';
        document.getElementById(`bar-${seqId}`)?.parentElement?.parentElement?.classList.add('done');
      } else {
        status.textContent = `Sequencing… ${pct}%`;
      }
    }
    _updateSeqBadge();
  }

  function _updateSeqBadge() {
    const done = _sim?.sequences.length || 0;
    const badge = document.getElementById('ob-seq-count-badge');
    if (badge) badge.textContent = done < 5 ? `${done} / 5 needed` : `${done} sequences [OK]`;
    if (badge && done >= 5) badge.style.color = '#00C4A0';
  }

  /* ─── Check if phylo tree can be built ─── */
  function _checkPhyloReady() {
    const btn = document.getElementById('ob-build-phylo-btn');
    if (btn && _sim?.sequences.length >= 5) {
      btn.disabled = false;
      btn.style.animation = 'obBtnPulse 1.5s ease infinite';
    }
  }

  /* ─── Build phylogenetic tree (NJ-inspired visual) ─── */
  function _buildPhylo() {
    if (!_sim || _sim.sequences.length < 2) return;
    const seqs = _sim.sequences;
    const svg  = document.getElementById('ob-phylo-svg');
    const box  = document.getElementById('ob-phylo-box');
    const btn  = document.getElementById('ob-identify-btn');
    if (!svg || !box) return;

    box.style.display = 'block';
    btn.style.display = 'block';

    /* Build a simple distance-based dendrogram.
       Distance = |mutations difference| + |day difference| * 0.5 */
    const n = seqs.length;
    const W = 300, H = 200;
    const leafH = H / (n + 1);

    /* Assign leaves y positions */
    const leaves = seqs.map((s, i) => ({
      ...s,
      leafY: leafH * (i + 1),
      dist: s.siteIdx === _sim.source ? 0
          : Math.abs(s.mutations.length - seqs.find(x => x.siteIdx === _sim.source)?.mutations.length || 0) + s.day * 0.3,
    }));

    /* Sort by distance so source is at top */
    leaves.sort((a, b) => a.dist - b.dist);

    /* Draw tree */
    const maxDist = Math.max(...leaves.map(l => l.dist)) || 1;
    const scaleX  = (W - 80) / (maxDist + 1);
    const rootX   = 20;

    let svgContent = `<rect width="${W}" height="${H}" fill="none"/>`;
    let cladeLines = '';
    const leafXs = leaves.map(l => rootX + l.dist * scaleX);

    /* Vertical clade lines (grouping nearest neighbours) */
    /* Connect all leaves to root with horizontal lines */
    leaves.forEach((l, i) => {
      const lx = leafXs[i];
      const ly = leafH * (i + 1);
      const isSource = l.siteIdx === _sim.source;
      const color = isSource ? '#58a6ff' : _sim.pathogen.color;

      /* Horizontal branch to leaf */
      svgContent += `<line x1="${rootX}" y1="${ly}" x2="${lx}" y2="${ly}"
        stroke="${color}" stroke-width="${isSource ? 1.5 : 0.8}" opacity="0.8"/>`;
      /* Leaf label */
      svgContent += `<text x="${lx + 3}" y="${ly + 1.5}" font-size="7"
        fill="${color}" font-weight="${isSource ? 'bold' : 'normal'}">
        ${l.name}${isSource ? ' ★' : ''}</text>`;
      /* Distance tick */
      svgContent += `<circle cx="${lx}" cy="${ly}" r="2" fill="${color}"/>`;
    });

    /* Vertical clade connectors */
    if (leaves.length > 1) {
      const topY = leafH;
      const botY = leafH * leaves.length;
      svgContent += `<line x1="${rootX}" y1="${topY}" x2="${rootX}" y2="${botY}"
        stroke="rgba(255,255,255,0.25)" stroke-width="0.8"/>`;
    }

    /* Scale bar */
    svgContent += `<line x1="${rootX}" y1="${H-8}" x2="${rootX + scaleX}" y2="${H-8}"
      stroke="rgba(255,255,255,0.4)" stroke-width="0.8"/>
      <text x="${rootX}" y="${H-3}" font-size="6" fill="rgba(255,255,255,0.45)">1 SNP unit</text>`;

    svg.innerHTML = svgContent;
    svg.style.display = 'block';
  }

  /* ─── Identify source cluster ─── */
  function _identifySource() {
    if (!_sim || _sim.identified) return;
    _sim.identified = true;
    clearTimeout(_tickTimer);
    _sim.paused = true;

    const src = _sim.sites[_sim.source];
    const p = _sim.pathogen;
    const totalCases = _sim.sites.reduce((a, s) => a + s.total, 0);
    const affectedCountries = [...new Set(_sim.sites.filter(s=>s.cases>0).map(s=>s.country))];

    const box = document.getElementById('ob-result-box');
    box.style.display = 'block';
    box.innerHTML = `
<div class="ob-result">
  <div class="ob-result-title">${OmicsLab.Icons?.svg('microscope',16)||''} Index Case Identified</div>
  <div class="ob-result-card">
    <div class="ob-result-row">
      <span class="ob-result-label">Origin city</span>
      <span class="ob-result-val" style="color:#58a6ff">${src.name}, ${src.country}</span>
    </div>
    <div class="ob-result-row">
      <span class="ob-result-label">Pathogen</span>
      <span class="ob-result-val"><span class="ob-path-dot" style="background:${p.color}"></span>${p.name}</span>
    </div>
    <div class="ob-result-row">
      <span class="ob-result-label">Simulation days</span>
      <span class="ob-result-val">${_sim.day}</span>
    </div>
    <div class="ob-result-row">
      <span class="ob-result-label">Total cases</span>
      <span class="ob-result-val" style="color:${p.color}">${totalCases.toLocaleString()}</span>
    </div>
    <div class="ob-result-row">
      <span class="ob-result-label">Countries affected</span>
      <span class="ob-result-val">${affectedCountries.length} (${affectedCountries.slice(0,3).join(', ')}${affectedCountries.length>3?'…':''})</span>
    </div>
    <div class="ob-result-row">
      <span class="ob-result-label">Sequences collected</span>
      <span class="ob-result-val">${_sim.sequences.length}</span>
    </div>
  </div>
  <div class="ob-result-insight">
    <strong>Genomic insight:</strong> Phylogenetic analysis of ${_sim.sequences.length} whole-genome sequences
    placed the root of the outbreak clade in <strong>${src.name}</strong>. The ${p.genome} genome
    (${p.genomeLen.toLocaleString()} bp) accumulated ~${_sim.sequences.reduce((a,s)=>a+s.mutations.length,0)} SNPs
    across collected samples relative to the reference, consistent with ${_sim.day} days of evolution
    at the expected substitution rate for ${p.name}.
  </div>
  <button class="ob-ctrl-btn" onclick="OmicsLab.Outbreak._reset()" style="margin-top:12px">
    ↺ Run New Outbreak
  </button>
</div>`;

    /* Highlight source on map */
    document.querySelectorAll('.ob-city-group').forEach((g, i) => {
      if (i === _sim.source) g.style.filter = 'drop-shadow(0 0 4px #58a6ff)';
    });
  }

  /* ─── Random mutation set (simulated SNP list) ─── */
  function _randMutations(count) {
    const n = count ?? Math.floor(Math.random() * 8) + 1;
    const positions = new Set();
    while (positions.size < n) positions.add(Math.floor(Math.random() * 29903));
    return [...positions].map(p => ({ pos: p, ref: 'ACGT'[Math.floor(Math.random()*4)], alt: 'ACGT'[Math.floor(Math.random()*4)] }));
  }

  /* ─── Reset ─── */
  function _reset() {
    clearTimeout(_tickTimer);
    _sim = null;
    document.getElementById('ob-picker').style.display = 'block';
    document.getElementById('ob-canvas').style.display = 'none';
    document.getElementById('ob-controls').style.display = 'none';
    document.getElementById('ob-stats-row').style.display = 'none';
    document.getElementById('ob-seq-list').innerHTML = '<div class="ob-seq-hint">Click an outbreak site on the map to collect a sample.</div>';
    document.getElementById('ob-phylo-box').style.display = 'none';
    document.getElementById('ob-result-box').style.display = 'none';
    document.getElementById('ob-build-phylo-btn').disabled = true;
    document.getElementById('ob-build-phylo-btn').style.animation = '';
    document.querySelectorAll('.ob-pathogen-card').forEach(c => c.classList.remove('selected'));
    document.getElementById('ob-selected-info').style.display = 'none';
    document.getElementById('ob-pause-btn').textContent = '⏸ Pause';
  }

  /* ─── Public init — called by router ─── */
  function init() {
    const sec = document.getElementById('outbreak-sim-section');
    if (!sec) return;
    if (!sec.querySelector('.ob-wrap')) {
      sec.innerHTML = _buildSection();
    }
  }

  /* ══════════════════════════════════════════════════════════════
     MULTIPLAYER MODE (Prompt 50) — BroadcastChannel (same-device tabs)
     Role: Commander (strategy) + Field Epidemiologist (genomic actions)
     ══════════════════════════════════════════════════════════════ */
  const _MP = {
    ch: null, role: null, connected: false,
    log: [],
  };

  const MP_ROLES = {
    commander: { label: 'Commander', color: '#58a6ff', desc: 'Set containment strategy, allocate resources' },
    field:     { label: 'Field Epidemiologist', color: '#00C4A0', desc: 'Collect samples, run genomics, identify source' },
  };

  function _mpInit(role) {
    if (!window.BroadcastChannel) { OmicsLab.Toast?.show('Multiplayer requires BroadcastChannel (Chrome/Edge)', 'info'); return; }
    _MP.role = role;
    _MP.ch = new BroadcastChannel('omicslab_outbreak_mp');
    _MP.connected = true;
    _MP.ch.postMessage({ type: 'join', role, ts: Date.now() });
    _MP.ch.onmessage = ({ data }) => _mpReceive(data);
    OmicsLab.Toast?.show(`Joined as ${MP_ROLES[role].label} — open another tab to co-op`, 'success');
    _mpRenderPanel();
  }

  function _mpReceive(data) {
    if (!data?.type) return;
    _MP.log.unshift(`[${data.role || '?'}] ${data.type}: ${data.payload || ''}`);
    if (_MP.log.length > 12) _MP.log.pop();
    _mpRenderPanel();

    if (data.type === 'action_collect' && _MP.role === 'commander') {
      OmicsLab.Toast?.show('Field team collected: ' + data.payload, 'info');
    }
    if (data.type === 'strategy_lockdown' && _MP.role === 'field') {
      OmicsLab.Toast?.show('Commander ordered: Lockdown of ' + data.payload, 'info');
    }
  }

  function _mpSend(type, payload) {
    if (!_MP.ch) return;
    _MP.ch.postMessage({ type, role: _MP.role, payload, ts: Date.now() });
    _MP.log.unshift(`[You/${_MP.role}] ${type}: ${payload || ''}`);
    if (_MP.log.length > 12) _MP.log.pop();
    _mpRenderPanel();
  }

  function _mpRenderPanel() {
    let panel = document.getElementById('ob-mp-panel');
    if (!panel) {
      panel = document.createElement('div');
      panel.id = 'ob-mp-panel';
      panel.style.cssText = `position:fixed;bottom:80px;right:16px;width:260px;background:var(--bg-surface,#111B2E);border:1px solid var(--border,#243048);border-radius:10px;padding:.75rem;z-index:500;font-size:.78rem`;
      document.body.appendChild(panel);
    }
    const roleColor = MP_ROLES[_MP.role]?.color || '#A8A098';
    panel.innerHTML = `
      <div style="font-weight:700;color:${roleColor};margin-bottom:.4rem">${MP_ROLES[_MP.role]?.label || _MP.role} — Co-op Mode</div>
      ${_MP.role === 'commander' ? `
        <button onclick="OmicsLab.Outbreak._mpSend('strategy_lockdown','Region A')" style="background:#58a6ff;color:#000;border:none;border-radius:5px;padding:.3rem .7rem;font-size:.75rem;cursor:pointer;margin:.2rem .2rem 0 0">Order Lockdown</button>
        <button onclick="OmicsLab.Outbreak._mpSend('strategy_trace','all contacts')" style="background:#58a6ff;color:#000;border:none;border-radius:5px;padding:.3rem .7rem;font-size:.75rem;cursor:pointer;margin:.2rem 0 0 0">Contact Trace</button>
      ` : `
        <button onclick="OmicsLab.Outbreak._mpSend('action_collect','sample from index case')" style="background:#00C4A0;color:#000;border:none;border-radius:5px;padding:.3rem .7rem;font-size:.75rem;cursor:pointer;margin:.2rem .2rem 0 0">Collect Sample</button>
        <button onclick="OmicsLab.Outbreak._mpSend('action_sequence','WGS')" style="background:#00C4A0;color:#000;border:none;border-radius:5px;padding:.3rem .7rem;font-size:.75rem;cursor:pointer;margin:.2rem 0 0 0">Run WGS</button>
      `}
      <div style="margin-top:.6rem;max-height:110px;overflow-y:auto;border-top:1px solid var(--border,#243048);padding-top:.4rem;color:var(--text-muted,#A8A098)">
        ${_MP.log.map(l => `<div style="margin-bottom:.2rem">${l}</div>`).join('') || '<div>No events yet</div>'}
      </div>
      <button onclick="document.getElementById('ob-mp-panel').remove()" style="margin-top:.5rem;background:none;border:none;color:var(--text-muted,#6E6860);font-size:.7rem;cursor:pointer">Close panel</button>`;
  }

  function _mpShowSetup() {
    if (!window.BroadcastChannel) { OmicsLab.Toast?.show('BroadcastChannel not supported', 'info'); return; }
    const overlay = document.createElement('div');
    overlay.style.cssText = `position:fixed;inset:0;z-index:6000;background:rgba(8,12,16,.85);display:flex;align-items:center;justify-content:center`;
    overlay.innerHTML = `
      <div style="background:var(--bg-surface,#111B2E);border:1px solid var(--border,#243048);border-radius:12px;padding:2rem;max-width:400px;width:92%;text-align:center">
        <h3 style="font-size:1.1rem;font-weight:700;color:var(--text-primary,#E4DDD2);margin:0 0 .5rem">Co-op Outbreak Mode</h3>
        <p style="color:var(--text-muted,#A8A098);font-size:.85rem;margin:0 0 1.25rem">Open this page in two browser tabs. Each player picks a role — Commander coordinates strategy, Field Epidemiologist handles genomics sampling.</p>
        <div style="display:flex;gap:.75rem;justify-content:center">
          ${Object.entries(MP_ROLES).map(([k, r]) => `
            <button onclick="OmicsLab.Outbreak._mpInit('${k}');this.closest('div[style*=fixed]').remove()" style="background:${r.color};color:#000;border:none;border-radius:8px;padding:.6rem 1.2rem;font-size:.85rem;font-weight:700;cursor:pointer">
              ${r.label}
            </button>`).join('')}
        </div>
        <button onclick="this.closest('div[style*=fixed]').remove()" style="margin-top:1rem;background:none;border:none;color:var(--text-muted,#6E6860);font-size:.78rem;cursor:pointer">Cancel</button>
      </div>`;
    document.body.appendChild(overlay);
    overlay.onclick = e => { if (e.target === overlay) overlay.remove(); };
  }

  return { init, _pickPathogen, _startSim, _togglePause, _setSpeed,
           _collectSample, _buildPhylo, _identifySource, _reset,
           _mpInit, _mpSend, _mpShowSetup };
})();
