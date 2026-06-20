/* ═══════════════════════════════════════════════════════════════
   OmicsLab — 360° Virtual Genomics Lab
   CSS 3D rotating panorama of real lab instruments.
   Drag / arrow keys to rotate. Click instruments for details.
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.VirtualLab = (function () {

  /* ── Instrument data ── */
  const INSTRUMENTS = [
    {
      id: 'illumina',
      name: 'Illumina NextSeq 2000',
      category: 'DNA Sequencer',
      color: '#1f6feb',
      desc: 'Short-read sequencer producing 300Gb per run at 2×150bp. The workhorse of African genomics initiatives — used by H3Africa, AWI-Gen, and SARS-CoV-2 surveillance programmes.',
      specs: ['Output: up to 300 Gb/run', 'Read length: 2×150 bp', 'Run time: 11–29 hours', 'Applications: WGS, WES, RNA-seq, ATAC-seq'],
      usage: 'Used for whole-genome sequencing of African populations to discover novel variants not in Eurocentric databases.',
      svg: `<g transform="translate(10,10)">
        <rect x="0" y="0" width="160" height="120" rx="8" fill="#0d1117" stroke="#1f6feb" stroke-width="2"/>
        <rect x="10" y="8" width="140" height="60" rx="4" fill="#161b22" stroke="#30363d"/>
        <text x="80" y="26" fill="#1f6feb" font-size="8" font-family="monospace" text-anchor="middle">ILLUMINA NextSeq 2000</text>
        <rect x="20" y="32" width="120" height="28" rx="2" fill="#0a0e17"/>
        <text x="80" y="50" fill="#3fb950" font-size="7" font-family="monospace" text-anchor="middle">STATUS: SEQUENCING RUN 3/8</text>
        <rect x="20" y="55" width="80" height="5" rx="2" fill="#21262d"/>
        <rect x="20" y="55" width="50" height="5" rx="2" fill="#1f6feb"/>
        <circle cx="130" cy="57" r="6" fill="#3fb950" opacity="0.8"/>
        <rect x="20" y="78" width="50" height="35" rx="4" fill="#161b22" stroke="#30363d"/>
        <text x="45" y="90" fill="#8b949e" font-size="6" font-family="monospace" text-anchor="middle">CARTRIDGE</text>
        <rect x="25" y="93" width="40" height="15" rx="2" fill="#0a0e17"/>
        <text x="45" y="103" fill="#58a6ff" font-size="5" font-family="monospace" text-anchor="middle">REAGENT LOADED</text>
        <rect x="80" y="78" width="75" height="35" rx="4" fill="#161b22" stroke="#30363d"/>
        <text x="117" y="91" fill="#8b949e" font-size="5.5" font-family="monospace" text-anchor="middle">FLOW CELL</text>
        <rect x="85" y="95" width="65" height="12" rx="2" fill="#1f6feb" opacity="0.3"/>
        <text x="117" y="104" fill="#58a6ff" font-size="5" font-family="monospace" text-anchor="middle">v1.5 — 300 Gb</text>
      </g>`
    },
    {
      id: 'nanopore',
      name: 'Oxford Nanopore GridION',
      category: 'Long-read Sequencer',
      color: '#f97316',
      desc: 'Nanopore long-read sequencer generating reads of 10–100kb. Used extensively for SARS-CoV-2 genome surveillance across Africa — deployed in >20 countries via ARTIC protocol.',
      specs: ['Read length: 10–100 kb (N50)', 'Real-time basecalling', 'Up to 5 flow cells simultaneously', 'Applications: structural variants, full-length isoforms, metagenomics'],
      usage: 'Central to COVID-19 genomic surveillance in Africa (PANDORA-ID-NET, Africa CDC). Enables same-day results in field hospitals.',
      svg: `<g transform="translate(10,10)">
        <rect x="0" y="0" width="160" height="120" rx="6" fill="#0d1117" stroke="#f97316" stroke-width="2"/>
        <text x="80" y="18" fill="#f97316" font-size="8" font-family="monospace" text-anchor="middle" font-weight="bold">GridION</text>
        <text x="80" y="27" fill="#8b949e" font-size="5.5" font-family="monospace" text-anchor="middle">Oxford Nanopore Technologies</text>
        <rect x="10" y="32" width="140" height="50" rx="4" fill="#161b22" stroke="#30363d"/>
        ${[0,1,2,3,4].map(i=>`
          <rect x="${15+i*26}" y="36" width="22" height="38" rx="3" fill="${i<3?'#1c2128':'#0d1117'}" stroke="#30363d"/>
          <text x="${26+i*26}" y="56" fill="${i<3?'#f97316':'#30363d'}" font-size="5" font-family="monospace" text-anchor="middle">FC${i+1}</text>
          ${i<3?`<circle cx="${26+i*26}" cy="66" r="3" fill="#3fb950" opacity="0.8"/>`:
                 `<circle cx="${26+i*26}" cy="66" r="3" fill="#30363d"/>`}
        `).join('')}
        <rect x="10" y="88" width="60" height="24" rx="3" fill="#161b22" stroke="#30363d"/>
        <text x="40" y="98" fill="#8b949e" font-size="5.5" font-family="monospace" text-anchor="middle">BASECALLING</text>
        <text x="40" y="107" fill="#3fb950" font-size="5" font-family="monospace" text-anchor="middle">GPU: 96% util</text>
        <rect x="80" y="88" width="70" height="24" rx="3" fill="#161b22" stroke="#30363d"/>
        <text x="115" y="98" fill="#8b949e" font-size="5.5" font-family="monospace" text-anchor="middle">READS: 2.4M</text>
        <text x="115" y="107" fill="#f97316" font-size="5" font-family="monospace" text-anchor="middle">N50: 28.4 kb</text>
      </g>`
    },
    {
      id: 'pcr',
      name: 'PCR Thermocycler',
      category: 'DNA Amplification',
      color: '#3fb950',
      desc: 'Polymerase Chain Reaction machine that amplifies DNA. Essential for library prep, pathogen detection (TB, malaria, SARS-CoV-2), and diagnostic testing across Africa.',
      specs: ['96-well block', 'Temperature range: 0–99°C', 'Ramp rate: 6°C/sec', 'Applications: library prep, genotyping, diagnostics, RT-PCR'],
      usage: 'Used for TB and malaria diagnostics, SARS-CoV-2 detection, STR genotyping, and library preparation before sequencing.',
      svg: `<g transform="translate(10,10)">
        <rect x="0" y="0" width="160" height="120" rx="8" fill="#161b22" stroke="#3fb950" stroke-width="2"/>
        <text x="80" y="16" fill="#3fb950" font-size="7" font-family="monospace" text-anchor="middle" font-weight="bold">THERMAL CYCLER</text>
        <rect x="10" y="22" width="140" height="68" rx="4" fill="#0d1117" stroke="#30363d"/>
        ${Array.from({length:8}, (_,row) => Array.from({length:12}, (_,col) =>
          `<rect x="${14+col*11}" y="${26+row*7}" width="9" height="5.5" rx="1" fill="${Math.random()>0.3?'#1f3a1f':'#1a1a2e'}" stroke="#21262d" stroke-width="0.5"/>`
        ).join('')).join('')}
        <rect x="10" y="96" width="80" height="16" rx="3" fill="#161b22" stroke="#30363d"/>
        <text x="50" y="104" fill="#8b949e" font-size="5.5" font-family="monospace" text-anchor="middle">STEP 3: 72°C EXT</text>
        <text x="50" y="110" fill="#3fb950" font-size="5" font-family="monospace" text-anchor="middle">CYCLE 24/35 — 01:42</text>
        <rect x="98" y="96" width="52" height="16" rx="3" fill="#0d3014" stroke="#3fb950"/>
        <text x="124" y="107" fill="#3fb950" font-size="5" font-family="monospace" text-anchor="middle">RUNNING</text>
      </g>`
    },
    {
      id: 'centrifuge',
      name: 'High-Speed Centrifuge',
      category: 'Sample Processing',
      color: '#bc8cff',
      desc: 'Separates biological components by density. Used for DNA/RNA extraction, cell pellets, plasma separation, and library purification steps critical to all NGS workflows.',
      specs: ['Max speed: 30,000 RPM', 'Max RCF: 100,000 × g', 'Temperature: 4–40°C', 'Capacity: 24 × 1.5ml tubes or rotors'],
      usage: 'Required for DNA/RNA extraction from blood, tissue, or pathogen isolates before sequencing in African genomics labs.',
      svg: `<g transform="translate(10,10)">
        <rect x="0" y="0" width="160" height="120" rx="10" fill="#0d1117" stroke="#bc8cff" stroke-width="2"/>
        <text x="80" y="16" fill="#bc8cff" font-size="7" font-family="monospace" text-anchor="middle" font-weight="bold">CENTRIFUGE</text>
        <circle cx="80" cy="65" r="45" fill="#161b22" stroke="#30363d"/>
        <circle cx="80" cy="65" r="35" fill="#0d1117" stroke="#bc8cff" stroke-width="1.5" stroke-dasharray="4,2"/>
        <circle cx="80" cy="65" r="8" fill="#bc8cff" opacity="0.3"/>
        ${[0,45,90,135,180,225,270,315].map(deg => {
          const rad = deg*Math.PI/180;
          const x = 80+28*Math.cos(rad);
          const y = 65+28*Math.sin(rad);
          return `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="6" ry="3" fill="#1c2128" stroke="#bc8cff" stroke-width="0.8" transform="rotate(${deg},${x.toFixed(1)},${y.toFixed(1)})"/>`;
        }).join('')}
        <rect x="20" y="108" width="120" height="5" rx="2" fill="#161b22" stroke="#30363d"/>
        <text x="80" y="117" fill="#8b949e" font-size="5.5" font-family="monospace" text-anchor="middle">14,000 RPM · 4°C · 10 min</text>
      </g>`
    },
    {
      id: 'gel',
      name: 'Gel Electrophoresis',
      category: 'DNA Analysis',
      color: '#e3b341',
      desc: 'Separates DNA/RNA fragments by size through an agarose gel under electric current. Used to verify PCR products, check RNA quality, and assess library fragment distribution.',
      specs: ['Voltage: 50–150V', 'Gel: 0.8–2% agarose', 'Buffer: TAE or TBE', 'UV transilluminator for band visualization'],
      usage: 'Used in every African genomics lab to verify DNA extraction quality, confirm PCR amplification, and check library insert sizes.',
      svg: `<g transform="translate(10,10)">
        <rect x="0" y="0" width="160" height="120" rx="6" fill="#0d1117" stroke="#e3b341" stroke-width="2"/>
        <text x="80" y="14" fill="#e3b341" font-size="7" font-family="monospace" text-anchor="middle" font-weight="bold">GEL ELECTROPHORESIS</text>
        <rect x="15" y="20" width="130" height="75" rx="4" fill="#001a00"/>
        <rect x="15" y="20" width="130" height="75" rx="4" fill="none" stroke="#e3b341" stroke-width="1"/>
        <text x="80" y="32" fill="#8b949e" font-size="5" text-anchor="middle">— + CURRENT RUNNING —</text>
        ${[0,1,2,3,4,5,6,7,8,9].map(lane => {
          const laneX = 22 + lane*13;
          const bands = lane===0 ? [38,46,54,60,66,72,78,84] :
                        lane===1 ? [42,55,68] : lane===2 ? [38,48,63,75] :
                        lane===3 ? [45,62] : lane===4 ? [40,52,67,79] :
                        lane===5 ? [44,57] : lane===6 ? [39,50,64,76] :
                        lane===7 ? [42,60] : lane===8 ? [38,49,61,73,83] : [45,58,70];
          return bands.map(y =>
            `<rect x="${laneX}" y="${y}" width="10" height="${1.5+Math.random()*2}" rx="0.5" fill="#e3b341" opacity="${0.5+Math.random()*0.5}"/>`
          ).join('');
        }).join('')}
        <text x="22" y="98" fill="#8b949e" font-size="4.5" transform="rotate(-90,22,98)" text-anchor="end">100bp</text>
        <rect x="20" y="100" width="120" height="10" rx="3" fill="#161b22" stroke="#30363d"/>
        <text x="80" y="108" fill="#e3b341" font-size="5.5" font-family="monospace" text-anchor="middle">80V · 45 min · 1.5% agarose</text>
      </g>`
    },
    {
      id: 'bioanalyzer',
      name: 'Agilent Bioanalyzer',
      category: 'QC / Fragment Analysis',
      color: '#58a6ff',
      desc: 'Microfluidic chip-based system for DNA/RNA quality and quantity assessment. Generates electropherograms and RIN scores critical for RNA-seq library QC.',
      specs: ['Sample volume: 1 µL', 'RIN score: 1–10', 'DNA sizing: 100–12,000 bp', 'RNA integrity, cell-free DNA, library QC'],
      usage: 'Ensures RNA quality (RIN > 7) before RNA-seq experiments. Used for library fragment size analysis and cfDNA cancer detection assays.',
      svg: `<g transform="translate(10,10)">
        <rect x="0" y="0" width="160" height="120" rx="8" fill="#0d1117" stroke="#58a6ff" stroke-width="2"/>
        <text x="80" y="14" fill="#58a6ff" font-size="7" font-family="monospace" text-anchor="middle" font-weight="bold">Bioanalyzer 2100</text>
        <rect x="10" y="20" width="140" height="65" rx="4" fill="#0a0e17" stroke="#30363d"/>
        <polyline points="15,75 30,72 40,45 48,70 58,38 68,55 78,32 90,52 100,25 115,60 125,80 135,42 145,82"
          fill="none" stroke="#58a6ff" stroke-width="1.5"/>
        <line x1="15" y1="20" x2="15" y2="85" stroke="#30363d" stroke-width="0.5"/>
        <line x1="15" y1="85" x2="145" y2="85" stroke="#30363d" stroke-width="0.5"/>
        <text x="80" y="92" fill="#8b949e" font-size="5" font-family="monospace" text-anchor="middle">Time (s)</text>
        <rect x="10" y="90" width="140" height="22" rx="3" fill="#161b22" stroke="#30363d"/>
        <text x="50" y="99" fill="#58a6ff" font-size="5.5" font-family="monospace" text-anchor="middle">RIN: 9.2</text>
        <text x="80" y="99" fill="#3fb950" font-size="5.5" font-family="monospace" text-anchor="middle">28S/18S: 1.9</text>
        <text x="120" y="99" fill="#e3b341" font-size="5.5" font-family="monospace" text-anchor="middle">Conc: 450</text>
        <text x="80" y="108" fill="#8b949e" font-size="4.5" font-family="monospace" text-anchor="middle">RNA Analysis — PASS</text>
      </g>`
    },
    {
      id: 'biosafety',
      name: 'Biosafety Cabinet II',
      category: 'Sample Containment',
      color: '#ff6b6b',
      desc: 'Class II laminar flow biosafety cabinet for working with BSL-2 pathogens. Provides personnel, sample, and environmental protection for infectious disease genomics work.',
      specs: ['BSL-2 certified', 'HEPA filtration (99.99%)', 'UV sterilisation lamp', 'Applications: pathogen DNA/RNA extraction, clinical sample handling'],
      usage: 'Required for handling clinical samples (blood, sputum, CSF) from TB, HIV, malaria, and Ebola patients before genomic extraction.',
      svg: `<g transform="translate(10,10)">
        <rect x="0" y="0" width="160" height="120" rx="6" fill="#161b22" stroke="#ff6b6b" stroke-width="2"/>
        <text x="80" y="14" fill="#ff6b6b" font-size="6.5" font-family="monospace" text-anchor="middle" font-weight="bold">BIOSAFETY CABINET II</text>
        <rect x="10" y="18" width="140" height="80" rx="3" fill="#0d1117" stroke="#30363d"/>
        <rect x="10" y="18" width="140" height="10" rx="3" fill="#1c2128"/>
        <text x="80" y="26" fill="#8b949e" font-size="5" font-family="monospace" text-anchor="middle">HEPA FILTRATION ACTIVE</text>
        <rect x="15" y="30" width="130" height="65" rx="2" fill="rgba(255,107,107,0.04)" stroke="#ff6b6b" stroke-width="0.5"/>
        <rect x="25" y="38" width="30" height="25" rx="3" fill="#0d1117" stroke="#30363d"/>
        <text x="40" y="50" fill="#3fb950" font-size="4.5" font-family="monospace" text-anchor="middle">EPPENDORF</text>
        <text x="40" y="57" fill="#8b949e" font-size="4" font-family="monospace" text-anchor="middle">2 mL × 6</text>
        <rect x="65" y="38" width="30" height="25" rx="3" fill="#0d1117" stroke="#30363d"/>
        <text x="80" y="50" fill="#58a6ff" font-size="4.5" font-family="monospace" text-anchor="middle">DNA ELUTE</text>
        <text x="80" y="57" fill="#8b949e" font-size="4" font-family="monospace" text-anchor="middle">TE buffer</text>
        <rect x="105" y="38" width="30" height="25" rx="3" fill="#0d1117" stroke="#30363d"/>
        <text x="120" y="50" fill="#e3b341" font-size="4.5" font-family="monospace" text-anchor="middle">REAGENTS</text>
        <text x="120" y="57" fill="#8b949e" font-size="4" font-family="monospace" text-anchor="middle">proteinase K</text>
        <rect x="15" y="70" width="130" height="18" fill="rgba(30,40,50,0.7)"/>
        <text x="80" y="82" fill="#8b949e" font-size="5" font-family="monospace" text-anchor="middle">SASH POSITION: 25 cm (safe operating height)</text>
        <rect x="10" y="100" width="140" height="14" rx="3" fill="#1c2128" stroke="#30363d"/>
        <text x="80" y="110" fill="#ff6b6b" font-size="5.5" font-family="monospace" text-anchor="middle">BSL-2 CERTIFIED — UV CYCLE: 20 min</text>
      </g>`
    },
    {
      id: 'microscope',
      name: 'Fluorescence Microscope',
      category: 'Cell Biology',
      color: '#a371f7',
      desc: 'Fluorescence microscope for cell visualization, parasite detection (malaria thick smears), and spatial transcriptomics validation. Connects genomics to cell morphology.',
      specs: ['40× and 100× oil objectives', 'DAPI, FITC, TRITC channels', 'Digital camera integration', 'Applications: malaria smear reading, cell counting, spatial omics'],
      usage: 'Used for malaria slide reading, counting cells before RNA extraction, and validating spatial transcriptomics experiments on African tissue samples.',
      svg: `<g transform="translate(10,10)">
        <rect x="0" y="0" width="160" height="120" rx="6" fill="#0d1117" stroke="#a371f7" stroke-width="2"/>
        <text x="80" y="14" fill="#a371f7" font-size="7" font-family="monospace" text-anchor="middle" font-weight="bold">FLUORESCENCE MICROSCOPE</text>
        <rect x="50" y="100" width="60" height="10" rx="3" fill="#161b22" stroke="#30363d"/>
        <rect x="75" y="75" width="10" height="25" fill="#161b22" stroke="#30363d"/>
        <rect x="65" y="70" width="30" height="8" rx="2" fill="#1c2128" stroke="#a371f7" stroke-width="1"/>
        <text x="80" y="76.5" fill="#a371f7" font-size="4.5" font-family="monospace" text-anchor="middle">40× OBJ</text>
        <ellipse cx="80" cy="60" rx="20" ry="10" fill="#0a0e17" stroke="#a371f7" stroke-width="1.5"/>
        <ellipse cx="80" cy="60" rx="12" ry="6" fill="#1a0a3e" stroke="#a371f7" stroke-width="1"/>
        <circle cx="80" cy="60" r="4" fill="rgba(163,113,247,0.3)"/>
        <rect x="15" y="20" width="55" height="45" rx="3" fill="#0a0e17" stroke="#30363d"/>
        <text x="42" y="32" fill="#a371f7" font-size="5.5" font-family="monospace" text-anchor="middle">CHANNEL</text>
        ${['DAPI','FITC','TRITC'].map((ch,i)=>`
          <text x="22" y="${43+i*8}" fill="#8b949e" font-size="4.5" font-family="monospace">${ch}</text>
          <rect x="44" y="${38+i*8}" width="22" height="5" rx="1" fill="${i===0?'#1a1a4e':i===1?'#0a2e0a':'#2e0a0a'}"/>
          <rect x="44" y="${38+i*8}" width="${i===0?22:i===1?16:18}" height="5" rx="1" fill="${i===0?'rgba(100,100,255,0.8)':i===1?'rgba(50,255,50,0.8)':'rgba(255,60,60,0.8)'}"/>
        `).join('')}
        <rect x="90" y="20" width="60" height="45" rx="3" fill="#0a0e17" stroke="#30363d"/>
        <text x="120" y="32" fill="#8b949e" font-size="5" font-family="monospace" text-anchor="middle">LIVE IMAGE</text>
        <circle cx="120" cy="50" r="18" fill="#050518"/>
        <circle cx="120" cy="50" r="12" fill="#0a0a2e"/>
        ${Array.from({length:15},(_,i)=>{const x=107+Math.random()*26;const y=38+Math.random()*24;const c=Math.random();return `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${0.8+Math.random()*2}" fill="${c<0.33?'rgba(100,100,255,0.9)':c<0.66?'rgba(50,200,50,0.7)':'rgba(255,80,80,0.8)'}"/>`}).join('')}
      </g>`
    }
  ];

  /* ── State ── */
  let _angle   = 0;      /* current Y rotation in degrees */
  let _tilt    = -8;     /* X rotation (slight looking-down angle) */
  let _dragging = false;
  let _lastX   = 0;
  let _lastY   = 0;
  let _animRaf = null;
  let _targetAngle = 0;
  let _targetTilt  = -8;
  let _velocity    = 0;
  let _activeInstrument = null;
  let _sceneEl    = null;
  let _infoEl     = null;

  /* ── Smoothing ── */
  function _tick() {
    const diff = _targetAngle - _angle;
    _angle    += diff * 0.12;
    const tDiff = _targetTilt - _tilt;
    _tilt     += tDiff * 0.12;

    if (_sceneEl) {
      _sceneEl.style.transform = `rotateX(${_tilt.toFixed(2)}deg) rotateY(${_angle.toFixed(2)}deg)`;
    }

    if (Math.abs(diff) > 0.05 || Math.abs(tDiff) > 0.05) {
      _animRaf = requestAnimationFrame(_tick);
    } else {
      _animRaf = null;
    }
  }

  function _setTarget(angle, tilt) {
    _targetAngle = angle;
    _targetTilt  = tilt !== undefined ? tilt : _targetTilt;
    if (!_animRaf) _animRaf = requestAnimationFrame(_tick);
  }

  /* ── Instrument detail panel ── */
  function _showInstrument(id) {
    const inst = INSTRUMENTS.find(i => i.id === id);
    if (!inst || !_infoEl) return;
    _activeInstrument = id;

    document.querySelectorAll('.vl-face').forEach(f =>
      f.classList.toggle('vl-face-active', f.dataset.id === id)
    );

    _infoEl.innerHTML = `
      <div class="vl-info-header" style="border-color:${inst.color}">
        <div class="vl-info-category" style="color:${inst.color}">${inst.category}</div>
        <div class="vl-info-name">${inst.name}</div>
        <button class="vl-info-close" onclick="OmicsLab.VirtualLab.closeInfo()">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      <p class="vl-info-desc">${inst.desc}</p>
      <div class="vl-info-section-title">Specifications</div>
      <ul class="vl-info-specs">
        ${inst.specs.map(s => `<li>${s}</li>`).join('')}
      </ul>
      <div class="vl-info-section-title">Use in African Genomics</div>
      <p class="vl-info-usage">${inst.usage}</p>
    `;
    _infoEl.classList.add('vl-info-visible');
  }

  function closeInfo() {
    if (_infoEl) _infoEl.classList.remove('vl-info-visible');
    document.querySelectorAll('.vl-face').forEach(f => f.classList.remove('vl-face-active'));
    _activeInstrument = null;
  }

  /* ── Navigation ── */
  function _rotateTo(idx) {
    const step = 360 / INSTRUMENTS.length;
    _setTarget(-idx * step, _targetTilt);
  }

  /* ── Keyboard ── */
  function _onKey(e) {
    const step = 360 / INSTRUMENTS.length;
    if (e.key === 'ArrowLeft')  { _targetAngle += step; _tick(); }
    if (e.key === 'ArrowRight') { _targetAngle -= step; _tick(); }
    if (e.key === 'Escape') closeInfo();
  }

  /* ── Build the 3D carousel HTML ── */
  function _buildScene() {
    const n = INSTRUMENTS.length;
    const faceW  = 200;
    const faceH  = 160;
    const radius = Math.round(faceW / (2 * Math.tan(Math.PI / n)));

    const faces = INSTRUMENTS.map((inst, i) => {
      const rotY = (360 / n) * i;
      return `<div class="vl-face" data-id="${inst.id}"
          style="width:${faceW}px;height:${faceH}px;transform:rotateY(${rotY}deg) translateZ(${radius}px);border-color:${inst.color}40"
          onclick="OmicsLab.VirtualLab.select('${inst.id}')">
          <div class="vl-face-inner">
            <svg width="${faceW}" height="${faceH}" viewBox="0 0 180 140" xmlns="http://www.w3.org/2000/svg">
              ${inst.svg}
            </svg>
          </div>
          <div class="vl-face-label" style="color:${inst.color}">${inst.name}</div>
        </div>`;
    }).join('');

    const dots = INSTRUMENTS.map((inst, i) =>
      `<button class="vl-dot" data-idx="${i}" style="background:${inst.color}60;border-color:${inst.color}"
         onclick="OmicsLab.VirtualLab.goTo(${i})" title="${inst.name}"></button>`
    ).join('');

    return { faces, radius, dots };
  }

  /* ── Public: navigate to instrument by index ── */
  function goTo(idx) {
    _rotateTo(idx);
    setTimeout(() => _showInstrument(INSTRUMENTS[idx].id), 200);
  }

  /* ── Public: select instrument by ID ── */
  function select(id) {
    _showInstrument(id);
    const idx = INSTRUMENTS.findIndex(i => i.id === id);
    if (idx >= 0) _rotateTo(idx);
  }

  /* ── init ── */
  function init() {
    const container = document.getElementById('virtual-lab-content');
    if (!container) return;
    if (container.querySelector('.vl-viewport')) return;

    const { faces, radius, dots } = _buildScene();

    container.innerHTML = `
      <div class="vl-page">
        <div class="vl-header">
          <h1 class="vl-title">Virtual Genomics Laboratory</h1>
          <p class="vl-subtitle">
            Drag to explore. Click any instrument to learn how it is used in African genomics research.
          </p>
        </div>

        <div class="vl-layout">
          <!-- 3D Viewport -->
          <div class="vl-viewport" id="vl-viewport">
            <div class="vl-hint vl-hint-drag">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M5 9l-3 3 3 3M9 5l3-3 3 3M15 19l-3 3-3-3M19 9l3 3-3 3M2 12h20M12 2v20"/>
              </svg>
              Drag to rotate
            </div>
            <div class="vl-scene-wrap">
              <div class="vl-scene" id="vl-scene" style="transform-style:preserve-3d">
                ${faces}
              </div>
            </div>
            <div class="vl-controls">
              <button class="vl-ctrl-btn" onclick="OmicsLab.VirtualLab.rotate(-1)" title="Rotate left">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="15 18 9 12 15 6"/>
                </svg>
              </button>
              <div class="vl-dots">${dots}</div>
              <button class="vl-ctrl-btn" onclick="OmicsLab.VirtualLab.rotate(1)" title="Rotate right">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Info panel -->
          <div class="vl-info" id="vl-info">
            <div class="vl-info-placeholder">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#3fb950" stroke-width="1.5">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              <p>Click any instrument in the lab to see its specifications, how it works, and its role in African genomics research.</p>
              <div class="vl-quick-btns">
                ${INSTRUMENTS.slice(0,4).map((inst,i)=>`
                  <button class="vl-quick-btn" style="border-color:${inst.color}60;color:${inst.color}"
                    onclick="OmicsLab.VirtualLab.goTo(${i})">${inst.name}</button>
                `).join('')}
              </div>
            </div>
          </div>
        </div>

        <!-- Instrument grid (for mobile / overview) -->
        <div class="vl-grid">
          <div class="vl-grid-title">All Lab Instruments</div>
          <div class="vl-grid-items">
            ${INSTRUMENTS.map((inst,i)=>`
              <button class="vl-grid-item" onclick="OmicsLab.VirtualLab.goTo(${i})"
                style="border-color:${inst.color}40">
                <div class="vl-grid-dot" style="background:${inst.color}"></div>
                <div class="vl-grid-label">
                  <div class="vl-grid-name">${inst.name}</div>
                  <div class="vl-grid-cat" style="color:${inst.color}">${inst.category}</div>
                </div>
              </button>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    _sceneEl = document.getElementById('vl-scene');
    _infoEl  = document.getElementById('vl-info');
    const viewport = document.getElementById('vl-viewport');

    /* Pointer drag handlers */
    viewport.addEventListener('pointerdown', e => {
      _dragging = true;
      _lastX = e.clientX;
      _lastY = e.clientY;
      viewport.style.cursor = 'grabbing';
      e.currentTarget.setPointerCapture(e.pointerId);
    });
    viewport.addEventListener('pointermove', e => {
      if (!_dragging) return;
      const dx = e.clientX - _lastX;
      const dy = e.clientY - _lastY;
      _lastX = e.clientX;
      _lastY = e.clientY;
      _targetAngle += dx * 0.4;
      _targetTilt   = Math.max(-20, Math.min(5, _targetTilt - dy * 0.2));
      if (!_animRaf) _animRaf = requestAnimationFrame(_tick);
    });
    viewport.addEventListener('pointerup', () => {
      _dragging = false;
      viewport.style.cursor = 'grab';
    });
    viewport.addEventListener('pointerleave', () => {
      _dragging = false;
      viewport.style.cursor = 'grab';
    });

    /* Touch pinch zoom (basic) */
    viewport.addEventListener('wheel', e => {
      e.preventDefault();
      _targetAngle += e.deltaX * 0.3;
      if (!_animRaf) _animRaf = requestAnimationFrame(_tick);
    }, { passive: false });

    document.addEventListener('keydown', _onKey);

    /* Start idle rotation */
    _startIdle();
  }

  let _idleTimer = null;
  function _startIdle() {
    _idleTimer = setInterval(() => {
      if (!_dragging && !_activeInstrument) {
        _targetAngle -= (360 / INSTRUMENTS.length);
        if (!_animRaf) _animRaf = requestAnimationFrame(_tick);
      }
    }, 4000);
  }

  /* ── Public rotate one step ── */
  function rotate(dir) {
    _targetAngle += dir * (360 / INSTRUMENTS.length);
    if (!_animRaf) _animRaf = requestAnimationFrame(_tick);
  }

  return { init, select, goTo, rotate, closeInfo };

})();
