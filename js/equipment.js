/* ═══════════════════════════════════════════════════════════════
   OmicsLab — Lab Equipment Visual Renderers
   Animated CSS lab equipment for each step type
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.Equipment = {

  /* Sim duration per equipment type (ms) — real duration shown as label */
  _simDurations: {
    'sample-prep':  0,       // static — no timer needed
    'centrifuge':   3500,    // real: 10 min · 12,000 × g · 4°C
    'covaris':      3000,    // real: 10 min · 175 W AFA
    'thermocycler': 4000,    // real: 30–90 min · 30–35 cycles
    'bioanalyzer':  3500,    // real: 30 min electrophoresis
    'tn5-reaction': 3000,    // real: 30 min · 37°C
    'chromium':     4500,    // real: 18 min GEM generation
    'sequencer':    5000,    // real: 24–48 h SBS
    'mass-spec':    4500,    // real: 30–90 min per sample
    'hplc':         4000,    // real: 90 min LC gradient
    'qpcr':         4500,    // real: 90 min · 40 cycles
    'magnet':       2000,    // real: 2–5 min
    'sonicator':    3000,    // real: 30 min · 30s on/off
    'hemocytometer':2500,    // real: 5 min
    'bead-beat':    2500,    // real: 45 s · 6,500 rpm
    'ip-tube':      3000,    // real: overnight · 4°C
    'ice-bucket':   2500,    // real: 30 min on ice
    'wash-station': 2000,    // real: 5 min
    'bench-prep':   2000,    // real: 10 min
    'tube-spin':    3000,    // real: 30 min dissociation
    'computer':     3500,    // real: minutes–hours on HPC
    'robot':        3500,    // real: 1–2 h automated extraction
    'generic':      2500,
  },

  /* Returns HTML for a given equipment type */
  render(type, params) {
    const fn  = this._renderers[type];
    const html = fn ? fn(params || {}) : this._renderers.generic(params || {});
    const ms   = this._simDurations[type];
    if (!ms) return html;
    return html.replace('class="equip-visual', `class="equip-visual" data-sim-duration="${ms}"`);
  },

  /* Maps step ids / equipment keys → equipment type */
  resolveType(stepId, phase) {
    const map = {
      // By step ID
      'dna-source':'sample-prep',  'rna-sample':'sample-prep',
      'dna-extraction':'centrifuge', 'rna-extraction':'centrifuge',
      'meta-extraction':'bead-beat', '16s-dna':'bead-beat',
      'viral-rna':'centrifuge',
      'atac-lysis':'centrifuge',   'prot-lysis':'centrifuge',
      'meta-sample':'centrifuge',  'protein-precip':'centrifuge',
      'fragment-size':'covaris',   'frag-time':'thermocycler',
      'rin-check':'bioanalyzer',
      'tn5-conc':'tn5-reaction',   'tagment-time':'thermocycler',
      'fixation':'thermocycler',   'wash-salt':'magnet',
      'cdna-cycles':'thermocycler','pcr-rna':'thermocycler',
      'pcr-16s':'thermocycler',    'pcr-cycles-wgs':'thermocycler',
      'pcr-atac':'thermocycler',   'atac-pcr':'thermocycler',
      'cell-load':'chromium',      'gem-chip':'chromium',
      'cite-chip':'chromium',      'dissociation':'tube-spin',
      'viability':'hemocytometer',
      'sequencer-wgs':'sequencer', 'ms-acquisition':'mass-spec',
      'lc-column':'hplc',          'on-target':'sequencer',
      'ct-threshold':'qpcr',       'artic-primers':'thermocycler',
      'library-viral':'thermocycler',
      'alignment':'computer',      'aligner-rna':'computer',
      'variant-caller':'computer', 'de-method':'computer',
      'deseq-method':'computer',   'tax-classifier':'computer',
      'functional':'computer',     'normalization':'computer',
      'doublet-removal':'computer','batch-correction':'computer',
      'peak-caller':'computer',    'motif-analysis':'computer',
      'mito-filter':'computer',    'idr-chip':'computer',
      'annotation-wes':'computer', 'asv-otu':'computer',
      'feature-detect':'computer', 'prot-quant':'computer',
      'lineage':'computer',        'cite-integration':'computer',
      /* rt-qpcr steps */
      'rna-source-qpcr':'sample-prep', 'rna-kit-qpcr':'centrifuge',
      'cdna-synthesis':'thermocycler', 'qpcr-chem':'qpcr',
      'pcr-cycles-qpcr':'qpcr',        'anneal-temp':'qpcr',
      'norm-method':'computer',
      /* ampli-seq steps */
      'dna-source-amp':'sample-prep',  'dna-ext-amp':'centrifuge',
      'amp-lib-prep':'thermocycler',   'target-depth':'sequencer',
      'variant-caller-amp':'computer',
      /* misc */
      'istd':'bench-prep',         'antibody':'ip-tube',
      'chipgrade-ab':'ip-tube',    'sonication':'sonicator',
      'ip-stringency':'magnet',    'wash-cycles':'wash-station',
      'cite-ab':'ice-bucket',      '16s-primers':'thermocycler',
    };
    return map[stepId] || (phase && phase.toLowerCase().includes('bioinformatics') ? 'computer' : 'generic');
  },

  _renderers: {

    /* ── Sample preparation bench ── */
    'sample-prep': (p) => `
      <div class="equip-visual">
        <div class="equip-icon-large">${OmicsLab.Icons.svg('snowflake',40)}</div>
        <div class="equip-name-label">Sample Preparation Bench</div>
        <div class="sp-rack">
          <div class="sp-tube t-blue"></div>
          <div class="sp-tube t-red"></div>
          <div class="sp-tube t-clear"></div>
          <div class="sp-tube t-yellow"></div>
        </div>
        <div class="equip-sub">Ice bucket · Collection tubes · Labels</div>
      </div>`,

    /* ── Centrifuge ── */
    'centrifuge': (p) => `
      <div class="equip-visual centrifuge-eq">
        <div class="centrifuge-body">
          <div class="centrifuge-lid">
            <div class="lid-hinge"></div>
          </div>
          <div class="centrifuge-chamber">
            <div class="rotor-outer">
              <div class="rotor spin-fast">
                <div class="rotor-spoke s1"></div>
                <div class="rotor-spoke s2"></div>
                <div class="rotor-spoke s3"></div>
                <div class="rotor-spoke s4"></div>
                <div class="rotor-center"></div>
              </div>
            </div>
          </div>
          <div class="centrifuge-panel">
            <div class="panel-display">${p.speed || '12,000 × g'}</div>
            <div class="panel-time">${p.time || '10 min'}</div>
            <div class="panel-dot running"></div>
          </div>
        </div>
        <div class="equip-name-label">High-Speed Microcentrifuge</div>
      </div>`,

    /* ── Covaris sonicator ── */
    'covaris': (p) => `
      <div class="equip-visual">
        <div class="covaris-body">
          <div class="covaris-water-bath">
            <div class="water-wave w1"></div><div class="water-wave w2"></div>
            <div class="covaris-tube-in-bath"></div>
          </div>
          <div class="covaris-display">
            <span class="cd-label">Duty Cycle</span>
            <span class="cd-val">10%</span>
            <span class="cd-label">Peak Power</span>
            <span class="cd-val">175 W</span>
          </div>
        </div>
        <div class="equip-name-label">Covaris S220 (AFA Sonicator)</div>
        <div class="equip-sub">Target: ${p.target || '350–400 bp'}</div>
      </div>`,

    /* ── Thermocycler / PCR machine ── */
    'thermocycler': (p) => `
      <div class="equip-visual thermocycler-eq">
        <div class="tc-body">
          <div class="tc-lid-area">
            <div class="tc-heated-lid">Heated Lid 105°C</div>
          </div>
          <div class="tc-block-area">
            <div class="tc-block">
              ${Array.from({length:48},(_,i)=>`<div class="tc-well w-${i%4}" title="Well ${i+1}"></div>`).join('')}
            </div>
          </div>
          <div class="tc-display">
            <div class="tc-step-row">
              <div class="tc-step tc-active">95°C<span>30s</span></div>
              <div class="tc-step">58°C<span>30s</span></div>
              <div class="tc-step">72°C<span>1m</span></div>
            </div>
            <div class="tc-cycles">${p.cycles || '12'} cycles · Running</div>
          </div>
        </div>
        <div class="equip-name-label">Thermal Cycler (PCR Machine)</div>
      </div>`,

    /* ── Bioanalyzer / TapeStation ── */
    'bioanalyzer': (p) => `
      <div class="equip-visual bioanalyzer-eq">
        <div class="ba-chip">
          <div class="ba-chip-body">
            <div class="ba-chip-label">RNA 6000 Nano Chip</div>
            <div class="ba-wells-row">
              ${Array.from({length:12},(_,i)=>`<div class="ba-well" style="animation-delay:${i*0.15}s"></div>`).join('')}
            </div>
          </div>
        </div>
        <div class="ba-trace">
          <div class="ba-trace-label">Electropherogram</div>
          <div class="ba-electro">
            <div class="ba-peak marker"></div>
            <div class="ba-peak s18"></div>
            <div class="ba-peak s28 tall"></div>
            <div class="ba-baseline"></div>
          </div>
          <div class="rin-display">RIN: <span class="rin-val">${p.rin || '?'}</span></div>
        </div>
        <div class="equip-name-label">Agilent Bioanalyzer 2100</div>
      </div>`,

    /* ── Tn5 tagmentation reaction ── */
    'tn5-reaction': (p) => `
      <div class="equip-visual">
        <div class="tn5-visual">
          <div class="dna-helix-wrap">
            <div class="dna-strand ds1">
              ${Array.from({length:8},()=>`<div class="dna-base"></div>`).join('')}
            </div>
            <div class="tn5-enzyme">${OmicsLab.Icons.svg('scissors',22)}</div>
            <div class="dna-strand ds2">
              ${Array.from({length:8},()=>`<div class="dna-base b2"></div>`).join('')}
            </div>
          </div>
          <div class="tn5-adapter-insert">
            <div class="adapter-arm a1">P5 adapter</div>
            <div class="insert-dna"></div>
            <div class="adapter-arm a2">P7 adapter</div>
          </div>
        </div>
        <div class="equip-name-label">Tn5 Tagmentation (37°C)</div>
        <div class="equip-sub">Simultaneously fragments & adds adapters to accessible chromatin</div>
      </div>`,

    /* ── 10x Chromium ── */
    'chromium': (p) => `
      <div class="equip-visual chromium-eq">
        <div class="chromium-body">
          <div class="chromium-slot">
            <div class="chip-card">
              <div class="chip-label">Chromium Chip K</div>
              <div class="chip-lanes">
                ${Array.from({length:8},(_,i)=>`<div class="chip-lane" style="animation-delay:${i*0.2}s"><div class="gem-drop"></div></div>`).join('')}
              </div>
            </div>
          </div>
          <div class="chromium-stats">
            <div class="cs-row"><span>Target cells</span><span class="cs-val">${p.cells || '10,000'}</span></div>
            <div class="cs-row"><span>GEM volume</span><span class="cs-val">1 nL</span></div>
            <div class="cs-row"><span>Bead type</span><span class="cs-val">Next GEM</span></div>
          </div>
        </div>
        <div class="equip-name-label">10x Chromium Controller</div>
      </div>`,

    /* ── Illumina sequencer ── */
    'sequencer': (p) => `
      <div class="equip-visual sequencer-eq">
        <div class="seq-body">
          <div class="seq-flow-cell-slot">
            <div class="flow-cell">
              <div class="fc-label">Flow Cell</div>
              <div class="fc-lanes">
                ${Array.from({length:4},(_,i)=>`
                  <div class="fc-lane">
                    <div class="base-stream" style="animation-delay:${i*0.4}s">
                      ${Array.from({length:12},()=>`<span class="base-call b-${['A','T','G','C'][Math.floor(Math.random()*4)]}"></span>`).join('')}
                    </div>
                  </div>`).join('')}
              </div>
            </div>
          </div>
          <div class="seq-display">
            <div class="sq-metric"><span>Read Length</span><span class="sq-val">${p.readLen || '150 bp PE'}</span></div>
            <div class="sq-metric"><span>Platform</span><span class="sq-val">${p.platform || 'NovaSeq X'}</span></div>
            <div class="sq-metric"><span>Q30</span><span class="sq-val sq-green">&gt;90%</span></div>
          </div>
        </div>
        <div class="equip-name-label">Illumina Sequencer</div>
      </div>`,

    /* ── Mass spectrometer ── */
    'mass-spec': (p) => `
      <div class="equip-visual massspec-eq">
        <div class="ms-body">
          <div class="ms-source">
            <div class="ms-spray">ESI Spray</div>
            <div class="spray-drops"></div>
          </div>
          <div class="ms-analyzer">
            <div class="ms-quad">Q1</div>
            <div class="ms-quad">Q2 (CID)</div>
            <div class="ms-quad">Q3</div>
          </div>
          <div class="ms-spectrum">
            <div class="spec-trace">
              <div class="spec-peak" style="height:20%;left:10%"></div>
              <div class="spec-peak" style="height:80%;left:25%"></div>
              <div class="spec-peak" style="height:45%;left:40%"></div>
              <div class="spec-peak" style="height:100%;left:55%"></div>
              <div class="spec-peak" style="height:30%;left:70%"></div>
              <div class="spec-peak" style="height:15%;left:85%"></div>
            </div>
            <div class="spec-axis">m/z →</div>
          </div>
        </div>
        <div class="equip-name-label">Triple Quadrupole Mass Spectrometer</div>
        <div class="equip-sub">${p.mode || 'DDA mode · HCD fragmentation'}</div>
      </div>`,

    /* ── HPLC ── */
    'hplc': (p) => `
      <div class="equip-visual hplc-eq">
        <div class="hplc-body">
          <div class="hplc-pump">Quaternary Pump</div>
          <div class="hplc-column-area">
            <div class="hplc-col">
              <div class="hplc-col-label">${p.column || 'C18 RP Column'}</div>
              <div class="hplc-packing"></div>
              <div class="hplc-flow-arrow">↓</div>
            </div>
          </div>
          <div class="hplc-chromatogram">
            <div class="chrom-trace">
              <div class="chrom-peak" style="left:15%;height:40%"></div>
              <div class="chrom-peak" style="left:32%;height:70%"></div>
              <div class="chrom-peak" style="left:48%;height:90%"></div>
              <div class="chrom-peak" style="left:65%;height:55%"></div>
              <div class="chrom-peak" style="left:80%;height:35%"></div>
            </div>
            <div class="chrom-axis">Retention time →</div>
          </div>
        </div>
        <div class="equip-name-label">nanoLC System</div>
      </div>`,

    /* ── qPCR machine ── */
    'qpcr': (p) => `
      <div class="equip-visual qpcr-eq">
        <div class="qpcr-body">
          <div class="qpcr-plate">
            ${Array.from({length:24},(_,i)=>`<div class="qpcr-well ${i<8?'positive':'negative'}"></div>`).join('')}
          </div>
          <div class="qpcr-curves">
            <div class="amplification-curve ac1"></div>
            <div class="amplification-curve ac2"></div>
          </div>
          <div class="qpcr-ct">Ct: <span class="ct-val">${p.ct || '—'}</span></div>
        </div>
        <div class="equip-name-label">Real-Time PCR (qPCR) System</div>
        <div class="equip-sub">Quantitative viral RNA detection</div>
      </div>`,

    /* ── Magnetic rack / bead cleanup ── */
    'magnet': (p) => `
      <div class="equip-visual magnet-eq">
        <div class="magnet-rack">
          <div class="magnet-bar">${OmicsLab.Icons.svg('zap',28)}</div>
          <div class="mag-tube-row">
            ${Array.from({length:6},(_,i)=>`
              <div class="mag-tube-wrap">
                <div class="mag-tube">
                  <div class="bead-pellet" style="animation-delay:${i*0.2}s"></div>
                </div>
              </div>`).join('')}
          </div>
        </div>
        <div class="equip-name-label">DynaMag-2 Magnetic Rack</div>
        <div class="equip-sub">Separating magnetic beads from supernatant</div>
      </div>`,

    /* ── Sonicator / Bioruptor ── */
    'sonicator': (p) => `
      <div class="equip-visual sonicator-eq">
        <div class="sonicator-body">
          <div class="sonic-bath">
            <div class="sonic-wave sw1"></div>
            <div class="sonic-wave sw2"></div>
            <div class="sonic-wave sw3"></div>
            <div class="sonic-tubes">
              <div class="sonic-tube"></div><div class="sonic-tube"></div>
            </div>
          </div>
          <div class="sonic-display">Bioruptor Plus</div>
          <div class="sonic-params">30 cycles · 30s ON / 30s OFF · 4°C</div>
        </div>
        <div class="equip-name-label">Ultrasonic Chromatin Shearing</div>
      </div>`,

    /* ── Hemocytometer / cell counter ── */
    'hemocytometer': (p) => `
      <div class="equip-visual hemo-eq">
        <div class="hemo-grid">
          ${Array.from({length:25},(_,i)=>`
            <div class="hemo-sq">
              ${Math.random()>0.4?'<div class="cell-dot '+(Math.random()>0.15?'live':'dead')+'"></div>':''}
            </div>`).join('')}
        </div>
        <div class="hemo-count">
          <span class="hemo-live">● Live</span>
          <span class="hemo-dead">● Dead</span>
        </div>
        <div class="viability-bar-wrap">
          <div class="viability-bar-fill" style="width:${p.viability||85}%"></div>
        </div>
        <div class="equip-name-label">Hemocytometer / Luna-FL Cell Counter</div>
      </div>`,

    /* ── Bead beater ── */
    'bead-beat': (p) => `
      <div class="equip-visual bead-eq">
        <div class="bead-beater">
          <div class="bb-tube">
            <div class="bb-beads">
              ${Array.from({length:12},()=>`<div class="bead"></div>`).join('')}
            </div>
          </div>
          <div class="bb-motor spin-fast" style="animation-duration:0.3s">${OmicsLab.Icons.svg('cpu',24)}</div>
        </div>
        <div class="equip-name-label">PowerLyzer Bead Beater</div>
        <div class="equip-sub">6,500 rpm · 45s · 4°C · Breaks gram-positive cell walls</div>
      </div>`,

    /* ── IP tube (ChIP) ── */
    'ip-tube': (p) => `
      <div class="equip-visual ip-eq">
        <div class="ip-tube-vis">
          <div class="ip-tube-body">
            <div class="ip-chromatin"></div>
            <div class="ip-antibody ab-float">${OmicsLab.Icons.svg('key',14)} Ab</div>
            <div class="ip-beads-vis">
              <div class="ip-bead b1"></div>
              <div class="ip-bead b2"></div>
              <div class="ip-bead b3"></div>
            </div>
          </div>
        </div>
        <div class="equip-name-label">Immunoprecipitation Tube (4°C, O/N)</div>
        <div class="equip-sub">Antibody captures chromatin-bound protein</div>
      </div>`,

    /* ── Ice bucket + antibody staining ── */
    'ice-bucket': (p) => `
      <div class="equip-visual ice-eq">
        <div class="ice-bucket-vis">
          ${OmicsLab.Icons.svg('snowflake',36)}
          <div class="cell-suspension">
            <div class="cell-dots">
              ${Array.from({length:8},()=>`<div class="cell-d" style="left:${Math.random()*80}%;top:${Math.random()*80}%"></div>`).join('')}
            </div>
            <div class="ab-label-dots">
              ${Array.from({length:5},()=>`<div class="ab-d" style="left:${Math.random()*80}%;top:${Math.random()*80}%"></div>`).join('')}
            </div>
          </div>
        </div>
        <div class="equip-name-label">Cell Staining Tube (Ice, 30 min)</div>
        <div class="equip-sub">Antibodies binding surface protein epitopes</div>
      </div>`,

    /* ── Wash station (protein) ── */
    'wash-station': (p) => `
      <div class="equip-visual wash-eq">
        <div class="wash-vis">
          <div class="wash-tube">
            <div class="wash-liquid"></div>
          </div>
          <div class="wash-arrow">⬇ wash ${p.cycles || 3}×</div>
        </div>
        <div class="equip-name-label">Wash Station</div>
        <div class="equip-sub">Removing unbound antibody before 10x loading</div>
      </div>`,

    /* ── Bench prep ── */
    'bench-prep': (p) => `
      <div class="equip-visual bench-eq">
        <div class="bench-items">
          <div class="bench-item">${OmicsLab.Icons.svg('scale',16)} Balance</div>
          <div class="bench-item">${OmicsLab.Icons.svg('flask',16)} Standards</div>
          <div class="bench-item">${OmicsLab.Icons.svg('microscope',16)} Sample</div>
        </div>
        <div class="equip-name-label">Analytical Balance + Preparation Bench</div>
      </div>`,

    /* ── Tube spin (dissociation) ── */
    'tube-spin': (p) => `
      <div class="equip-visual">
        <div class="tube-spin-vis">
          <div class="ts-tube spin-slow">
            <div class="ts-liquid"></div>
            <div class="ts-cells">
              ${Array.from({length:6},()=>`<div class="ts-cell"></div>`).join('')}
            </div>
          </div>
        </div>
        <div class="equip-name-label">Dissociation Tube (GentleMACS)</div>
        <div class="equip-sub">Enzymatic + mechanical single-cell dissociation</div>
      </div>`,

    /* ── Computer / bioinformatics ── */
    'computer': (p) => `
      <div class="equip-visual computer-eq">
        <div class="terminal">
          <div class="terminal-bar">
            <div class="tb-dot red"></div>
            <div class="tb-dot yellow"></div>
            <div class="tb-dot green"></div>
            <span class="tb-title">bash — ${p.tool || 'Bioinformatics Pipeline'}</span>
          </div>
          <div class="terminal-body">
            <div class="term-line"><span class="prompt">$</span> ${p.cmd || 'loading pipeline...'}</div>
            <div class="term-line typing">Processing reads ████████░░ 82%</div>
            <div class="term-line dim">[INFO] Reads processed: 48,291,042</div>
            <div class="term-line dim">[INFO] Alignment rate: 97.3%</div>
            <div class="term-line blink">_</div>
          </div>
        </div>
        <div class="equip-name-label">HPC Cluster / Analysis Server</div>
      </div>`,

    /* ── Oxford Nanopore MinION ── */
    'nanopore': (p) => `
      <div class="equip-visual nanopore-eq">
        <div class="nanopore-body">
          <div class="nanopore-fc-slot">
            <div class="nanopore-fc">
              <div class="nanopore-fc-label">Flow Cell R10.4.1</div>
              <div class="nanopore-pore-grid">
                ${Array.from({length:16},(_,i)=>`<div class="npore" style="animation-delay:${(i*0.18).toFixed(2)}s"></div>`).join('')}
              </div>
            </div>
          </div>
          <div class="nanopore-stats">
            <div class="np-stat"><span>Bases called</span><span class="np-val np-live">● LIVE</span></div>
            <div class="np-stat"><span>Read N50</span><span class="np-val">>50 kb</span></div>
            <div class="np-stat"><span>Accuracy</span><span class="np-val np-good">>99%</span></div>
          </div>
          <div class="nanopore-usb">USB-C</div>
        </div>
        <div class="equip-name-label">Oxford Nanopore MinION</div>
      </div>`,

    /* ── PacBio SMRT / Revio ── */
    'pacbio': (p) => `
      <div class="equip-visual pacbio-eq">
        <div class="pacbio-body">
          <div class="smrt-cell-wrap">
            <div class="smrt-cell-label">SMRT Cell</div>
            <div class="smrt-grid">
              ${Array.from({length:25},(_,i)=>`<div class="zmw-well" style="animation-delay:${(i*0.09).toFixed(2)}s"></div>`).join('')}
            </div>
          </div>
          <div class="pacbio-readout">
            <div class="pb-row"><span>Mode</span><span class="pb-val">HiFi CCS</span></div>
            <div class="pb-row"><span>Accuracy</span><span class="pb-val pb-good">>99.9%</span></div>
            <div class="pb-row"><span>Read len</span><span class="pb-val">15–25 kb</span></div>
          </div>
        </div>
        <div class="equip-name-label">PacBio Revio (SMRT)</div>
      </div>`,

    /* ── NanoDrop spectrophotometer ── */
    'nanodrop': (p) => `
      <div class="equip-visual nanodrop-eq">
        <div class="nanodrop-body">
          <div class="nd-arm">
            <div class="nd-arm-top">
              <div class="nd-fiber-upper"></div>
            </div>
            <div class="nd-sample-point">
              <div class="nd-drop"></div>
              <div class="nd-uv-beam"></div>
            </div>
            <div class="nd-pedestal"></div>
          </div>
          <div class="nd-display">
            <div class="nd-metric"><span class="nd-label">260/280</span><span class="nd-value nd-ok">1.98</span></div>
            <div class="nd-metric"><span class="nd-label">260/230</span><span class="nd-value nd-ok">2.12</span></div>
            <div class="nd-metric"><span class="nd-label">ng/µL</span><span class="nd-value">482.3</span></div>
          </div>
        </div>
        <div class="equip-name-label">NanoDrop One Spectrophotometer</div>
        <div class="equip-sub">1 µL · No cuvette · 10 seconds</div>
      </div>`,

    /* ── Qubit Fluorometer ── */
    'qubit': (p) => `
      <div class="equip-visual qubit-eq">
        <div class="qubit-body">
          <div class="qubit-screen">
            <div class="qs-label">dsDNA HS Assay</div>
            <div class="qs-value"><span class="qs-num">23.4</span> <span class="qs-unit">ng/µL</span></div>
            <div class="qs-bar-wrap"><div class="qs-bar"></div></div>
          </div>
          <div class="qubit-tube-area">
            <div class="qt-laser-dot"></div>
            <div class="qt-tube">
              <div class="qt-sample"></div>
              <div class="qt-glow"></div>
            </div>
          </div>
        </div>
        <div class="equip-name-label">Qubit 4 Fluorometer</div>
        <div class="equip-sub">Fluorometric · Ignores contaminants</div>
      </div>`,

    /* ── FACS Cell Sorter ── */
    'facs': (p) => `
      <div class="equip-visual facs-eq">
        <div class="facs-body">
          <div class="facs-flow-path">
            <div class="facs-sheath">Sheath fluid</div>
            <div class="facs-stream">
              ${Array.from({length:8},(_,i)=>`<div class="facs-drop" style="animation-delay:${(i*0.25).toFixed(2)}s"></div>`).join('')}
            </div>
            <div class="facs-laser-block">
              <div class="facs-laser-beam"></div>
              <div class="facs-scatter-signal"></div>
            </div>
            <div class="facs-deflect">
              <div class="facs-plate neg">−</div>
              <div class="facs-plate pos">+</div>
            </div>
          </div>
          <div class="facs-collect">
            <div class="facs-tube t-neg"><div class="facs-tube-label">Waste</div></div>
            <div class="facs-tube t-pos"><div class="facs-tube-label">Sort</div></div>
          </div>
        </div>
        <div class="equip-name-label">BD FACSAria Fusion Cell Sorter</div>
        <div class="equip-sub">Up to 70,000 events/sec · 6 lasers</div>
      </div>`,

    /* ── Liquid-handling robot / automation workstation ── */
    'robot': (p) => `
      <div class="equip-visual robot-eq">
        <div class="robot-body">
          <div class="robot-arm-track">
            <div class="robot-arm slide-lr">
              <div class="robot-head">${OmicsLab.Icons.svg('cpu', 20)}</div>
              <div class="robot-pipette-array">
                ${Array.from({length:8},(_,i)=>`<div class="rp-tip" style="animation-delay:${(i*0.12).toFixed(2)}s"></div>`).join('')}
              </div>
            </div>
          </div>
          <div class="robot-deck">
            <div class="robot-plate">
              ${Array.from({length:24},(_,i)=>`<div class="rplate-well ${i<8?'filled':''}"></div>`).join('')}
            </div>
            <div class="robot-reagent-block">
              <div class="rrb-tube"></div>
              <div class="rrb-tube"></div>
              <div class="rrb-tube"></div>
            </div>
          </div>
          <div class="robot-display">
            <div class="rd-row"><span>Protocol</span><span class="rd-val">${p.protocol || 'RNA Extraction'}</span></div>
            <div class="rd-row"><span>Samples</span><span class="rd-val">${p.samples || '96'}</span></div>
          </div>
        </div>
        <div class="equip-name-label">${p.name || 'Liquid Handling Robot'}</div>
        <div class="equip-sub">Automated · 96-well · Walk-away processing</div>
      </div>`,

    /* ── Generic fallback ── */
    'generic': (p) => `
      <div class="equip-visual">
        <div class="equip-icon-large">${p.icon || OmicsLab.Icons.svg('microscope', 48)}</div>
        <div class="equip-name-label">${p.name || 'Lab Equipment'}</div>
        <div class="equip-sub">${p.desc || ''}</div>
      </div>`,
  }
};
