/* ═══════════════════════════════════════════════════════════════
   OmicsLab — 360° Virtual Genomics Lab (Interior Panorama)
   User stands at the centre; machines surround them on the walls.
   Drag left/right to look around.  Click a machine to learn.
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.VirtualLab = (function () {

  /* ──────────────────────────────────────────────────────────────
     LAB STATIONS — each an actual machine with its real appearance
     SVG viewBox: "0 0 380 480" — machine on a dark bench in a lab room
  ────────────────────────────────────────────────────────────── */
  const STATIONS = [

    /* 1 ─ Illumina NextSeq 2000 ─────────────────────────────── */
    {
      id: 'illumina-nextseq',
      name: 'Illumina NextSeq 2000',
      category: 'Short-Read Sequencer',
      color: '#0082c8',
      desc: 'The NextSeq 2000 is a benchtop short-read sequencer producing up to 300 Gb per run at 2×150 bp. Its compact form factor makes it ideal for African genomics cores — used in H3Africa, AWI-Gen, and SARS-CoV-2 national surveillance programs.',
      specs: ['Output: up to 300 Gb per run', 'Read length: 2×50 / 2×100 / 2×150 bp', 'Run time: 11–29 hours', 'Flow cell: P1, P2, P3 (up to 300 Gb)', 'Applications: WGS, WES, RNA-seq, ATAC-seq, 16S'],
      usage: 'Core workhorse in H3Africa consortium labs. Used by KEMRI, WACCBIP, and AHRI for whole-genome sequencing of African populations, discovering novel variants absent from Eurocentric databases.',
      svg: `
<defs>
  <linearGradient id="ng-body" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#e8e9ea"/>
    <stop offset="100%" stop-color="#d0d2d4"/>
  </linearGradient>
  <linearGradient id="ng-side" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0%" stop-color="#b8babb"/>
    <stop offset="100%" stop-color="#c8cacc"/>
  </linearGradient>
</defs>
<!-- Lab ceiling -->
<rect x="0" y="0" width="380" height="480" fill="#0d1117"/>
<!-- LED strip lights -->
<rect x="40" y="8" width="300" height="4" rx="2" fill="#e0ecff" opacity="0.7"/>
<rect x="40" y="8" width="300" height="12" rx="2" fill="none"/>
<rect x="40" y="9" width="300" height="10" rx="2" fill="url(#ng-body)" opacity="0.06"/>
<!-- Lab wall -->
<rect x="0" y="20" width="380" height="290" fill="#111419"/>
<!-- Bench surface -->
<rect x="0" y="305" width="380" height="175" fill="#181c22"/>
<rect x="0" y="305" width="380" height="6" rx="1" fill="#232830"/>

<!-- Machine shadow on bench -->
<ellipse cx="190" cy="313" rx="95" ry="7" fill="#000" opacity="0.5"/>

<!-- RIGHT SIDE FACE (3D illusion) -->
<polygon points="293,65 308,55 308,295 293,305" fill="#b4b6b8"/>
<!-- TOP FACE (3D illusion) -->
<polygon points="88,65 103,55 308,55 293,65" fill="#c8cacc"/>
<!-- MAIN FRONT BODY — white/light-gray -->
<rect x="88" y="65" width="205" height="240" rx="6" fill="url(#ng-body)" stroke="#c0c2c4" stroke-width="1"/>

<!-- TOUCHSCREEN (upper-left of front panel) -->
<rect x="96" y="78" width="112" height="82" rx="4" fill="#0a0d14" stroke="#1a2a3a" stroke-width="1.5"/>
<rect x="97" y="79" width="110" height="80" rx="3" fill="#060a12"/>
<!-- Screen glow border -->
<rect x="97" y="79" width="110" height="80" rx="3" fill="none" stroke="#0082c8" stroke-width="0.8" opacity="0.7"/>
<!-- Illumina run screen content -->
<text x="152" y="94" fill="#0082c8" font-size="7" font-family="Arial,sans-serif" text-anchor="middle" font-weight="700">NextSeq 2000</text>
<rect x="102" y="97" width="100" height="1" fill="#1a3a5a" opacity="0.8"/>
<text x="152" y="108" fill="#26c45a" font-size="6" font-family="monospace" text-anchor="middle">● SEQUENCING</text>
<!-- Run progress bar on screen -->
<rect x="102" y="113" width="100" height="5" rx="2" fill="#0d1a0d"/>
<rect x="102" y="113" width="65" height="5" rx="2" fill="#26c45a"/>
<text x="152" y="124" fill="#5a7a9a" font-size="5.5" font-family="monospace" text-anchor="middle">Cycle 87/150 · 14h left</text>
<text x="152" y="133" fill="#0082c8" font-size="5.5" font-family="monospace" text-anchor="middle">Output: 112 Gb / 300 Gb</text>
<text x="152" y="142" fill="#4a6a8a" font-size="5" font-family="monospace" text-anchor="middle">Q30: 92.4% · 1.2B clusters</text>
<text x="152" y="152" fill="#2a8a4a" font-size="5.5" font-family="monospace" text-anchor="middle">P3 Flow Cell v1.5</text>

<!-- STATUS LED (blue, top-right of screen area) -->
<circle cx="214" cy="85" r="4.5" fill="#0082c8"/>
<circle cx="214" cy="85" r="7" fill="none" stroke="#0082c8" stroke-width="1" opacity="0.35"/>
<text x="213" y="100" fill="#6a8aaa" font-size="4.5" font-family="Arial" text-anchor="middle">PWR</text>

<!-- FLOW CELL DOOR (upper-right of front panel) -->
<rect x="218" y="78" width="68" height="55" rx="4" fill="#d4d6d8" stroke="#b8babc" stroke-width="1"/>
<rect x="220" y="80" width="64" height="51" rx="3" fill="#cccece"/>
<text x="252" y="99" fill="#555" font-size="6" font-family="Arial" text-anchor="middle" font-weight="600">FLOW CELL</text>
<rect x="228" y="103" width="48" height="18" rx="2" fill="#bbbdbe" stroke="#a8aaac"/>
<text x="252" y="115" fill="#0082c8" font-size="5.5" font-family="monospace" text-anchor="middle">P3 Loaded ✓</text>
<!-- Door latch handle -->
<rect x="248" y="126" width="8" height="3" rx="1.5" fill="#909294"/>

<!-- REAGENT CARTRIDGE DOOR (lower-right) -->
<rect x="218" y="140" width="68" height="80" rx="4" fill="#c8cacb" stroke="#aaaaac" stroke-width="1"/>
<rect x="222" y="144" width="60" height="72" rx="2" fill="#bebfc1"/>
<text x="252" y="163" fill="#444" font-size="5.5" font-family="Arial" text-anchor="middle" font-weight="600">REAGENT</text>
<text x="252" y="172" fill="#444" font-size="5" font-family="Arial" text-anchor="middle">CARTRIDGE</text>
<rect x="228" y="177" width="48" height="28" rx="3" fill="#aaaaab" stroke="#909091"/>
<text x="252" y="189" fill="#0082c8" font-size="5" font-family="monospace" text-anchor="middle">300-cycle</text>
<text x="252" y="198" fill="#0082c8" font-size="5" font-family="monospace" text-anchor="middle">v1.5 Loaded</text>
<!-- Cartridge latch -->
<rect x="248" y="210" width="8" height="3" rx="1.5" fill="#888"/>

<!-- WASTE AREA (lower left of front panel) -->
<rect x="96" y="168" width="112" height="55" rx="3" fill="#d0d2d3" stroke="#b8babc" stroke-width="0.5"/>
<text x="152" y="184" fill="#555" font-size="5.5" font-family="Arial" text-anchor="middle">WASTE / BUFFER</text>
<rect x="104" y="188" width="96" height="28" rx="2" fill="#b8babc" stroke="#a0a2a3"/>
<text x="152" y="205" fill="#888" font-size="5" font-family="monospace" text-anchor="middle">Bottle: 35 / 900 mL</text>

<!-- VENTILATION GRILLE (bottom of front panel) -->
<rect x="96" y="230" width="190" height="18" rx="3" fill="#c4c6c7"/>
${Array.from({length:18}, (_, i) => `<rect x="${99 + i * 10}" y="233" width="7" height="12" rx="1" fill="#b0b2b3"/>`).join('')}

<!-- ILLUMINA BRANDING strip -->
<rect x="96" y="252" width="190" height="28" rx="3" fill="#e4e6e8" stroke="#c8cacc"/>
<text x="191" y="271" fill="#0082c8" font-size="12" font-family="Arial,sans-serif" text-anchor="middle" font-weight="800" font-style="italic">illumina</text>
<text x="191" y="282" fill="#888" font-size="5.5" font-family="Arial" text-anchor="middle">NextSeq 2000</text>

<!-- Ethernet + power ports on left side of bench -->
<rect x="72" y="155" width="16" height="60" rx="2" fill="#1a1c1e" stroke="#333" stroke-width="0.5"/>
<rect x="75" y="162" width="10" height="8" rx="1" fill="#222"/>
<rect x="75" y="176" width="10" height="8" rx="1" fill="#222"/>
<text x="80" y="232" fill="#444" font-size="4" font-family="monospace" text-anchor="middle">I/O</text>

<!-- Power cable on bench -->
<path d="M 165 305 Q 160 320 150 335 Q 140 345 130 348" fill="none" stroke="#1a1a1a" stroke-width="3.5" stroke-linecap="round"/>

<!-- Component labels -->
<line x1="152" y1="160" x2="152" y2="200" stroke="#0082c8" stroke-width="0.6" stroke-dasharray="2,2"/>
<text x="30" y="125" fill="#0082c8" font-size="6" font-family="Arial">Touchscreen</text>
<line x1="88" y1="120" x2="97" y2="120" stroke="#0082c8" stroke-width="0.6"/>
<text x="30" y="105" fill="#888" font-size="5.5" font-family="Arial">Run control</text>

<text x="320" y="105" fill="#0082c8" font-size="6" font-family="Arial" text-anchor="end">Flow cell</text>
<line x1="286" y1="108" x2="318" y2="105" stroke="#0082c8" stroke-width="0.6"/>
<text x="320" y="175" fill="#888" font-size="6" font-family="Arial" text-anchor="end">Reagent</text>
<line x1="286" y1="175" x2="317" y2="175" stroke="#888" stroke-width="0.6"/>
      `
    },

    /* 2 ─ Oxford Nanopore GridION ───────────────────────────── */
    {
      id: 'nanopore-gridion',
      name: 'Oxford Nanopore GridION',
      category: 'Long-Read Sequencer',
      color: '#f97316',
      desc: 'The GridION hosts up to 5 MinION flow cells simultaneously, generating real-time long reads (10–100 kb). Deployed across 25+ African countries for SARS-CoV-2, Ebola, and mpox surveillance via the ARTIC network.',
      specs: ['Flow cells: up to 5 simultaneous', 'Read length: 10–100 kb (N50)', 'Real-time basecalling on-board GPU', 'Throughput: up to 250 Gb total (5 × 50 Gb)', 'Applications: structural variants, metagenomics, full-length cDNA, rapid diagnostics'],
      usage: 'PANDORA-ID-NET deployed GridIONs across Africa for COVID-19 and mpox genomic surveillance. Enables same-day outbreak sequencing in field settings using the ARTIC amplicon protocol.',
      svg: `
<defs>
  <linearGradient id="ont-body" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#1e2226"/>
    <stop offset="100%" stop-color="#12151a"/>
  </linearGradient>
</defs>
<!-- Lab ceiling -->
<rect x="0" y="0" width="380" height="480" fill="#0d1117"/>
<rect x="40" y="8" width="300" height="4" rx="2" fill="#ffe8cc" opacity="0.7"/>
<!-- Wall -->
<rect x="0" y="20" width="380" height="290" fill="#111419"/>
<!-- Bench -->
<rect x="0" y="305" width="380" height="175" fill="#181c22"/>
<rect x="0" y="305" width="380" height="6" rx="1" fill="#232830"/>

<!-- Machine shadow -->
<ellipse cx="190" cy="313" rx="105" ry="7" fill="#000" opacity="0.55"/>

<!-- GridION main body — black compact desktop unit -->
<!-- Side face (3D illusion) -->
<polygon points="300,75 316,62 316,310 300,310" fill="#0d0f12"/>
<!-- Top face -->
<polygon points="80,75 96,62 316,62 300,75" fill="#1a1d21"/>
<!-- Front face — main black body -->
<rect x="80" y="75" width="220" height="235" rx="6" fill="url(#ont-body)" stroke="#2a2d31" stroke-width="1.5"/>

<!-- ── TOP SECTION: 5 FLOW CELL PORTS ── -->
<rect x="88" y="83" width="204" height="105" rx="4" fill="#0a0c0f" stroke="#222629"/>
<!-- Port label -->
<text x="190" y="96" fill="#f97316" font-size="6.5" font-family="Arial" text-anchor="middle" font-weight="700">FLOW CELL POSITIONS</text>

<!-- 5 MinION-style ports in a row -->
${[0,1,2,3,4].map(i => {
  const x = 96 + i * 39;
  const active = i < 3;
  return `
  <!-- Port ${i+1} -->
  <rect x="${x}" y="102" width="32" height="78" rx="4" fill="${active ? '#141a1f' : '#0d1015'}" stroke="${active ? '#f97316' : '#2a2d31'}" stroke-width="${active ? '1.2' : '0.7'}"/>
  <!-- Port opening (MinION slot) -->
  <rect x="${x+4}" y="106" width="24" height="40" rx="2" fill="#080b0d"/>
  <rect x="${x+4}" y="106" width="24" height="40" rx="2" fill="none" stroke="${active ? '#f9731680' : '#1a1d2160'}" stroke-width="1"/>
  <!-- Flow cell indicator -->
  <rect x="${x+6}" y="108" width="20" height="36" rx="1" fill="${active ? '#0d1a0a' : '#0a0a0a'}"/>
  ${active ? `
  <text x="${x+16}" y="124" fill="#f97316" font-size="5" font-family="monospace" text-anchor="middle">FC ${i+1}</text>
  <text x="${x+16}" y="133" fill="#26c45a" font-size="4.5" font-family="monospace" text-anchor="middle">ACTIVE</text>
  <text x="${x+16}" y="142" fill="#4a7aaa" font-size="4" font-family="monospace" text-anchor="middle">${['R10.4','R10.4','R10.4'][i]}</text>
  ` : `
  <text x="${x+16}" y="128" fill="#333" font-size="5" font-family="monospace" text-anchor="middle">FC ${i+1}</text>
  <text x="${x+16}" y="138" fill="#222" font-size="4.5" font-family="monospace" text-anchor="middle">EMPTY</text>
  `}
  <!-- Status LED below port -->
  <circle cx="${x+16}" cy="${154}" r="4" fill="${active ? '#f97316' : '#1a1a1a'}"/>
  ${active ? `<circle cx="${x+16}" cy="154" r="6.5" fill="none" stroke="#f97316" stroke-width="0.8" opacity="0.4"/>` : ''}
  <!-- Port number -->
  <text x="${x+16}" y="175" fill="${active ? '#888' : '#444'}" font-size="5.5" font-family="monospace" text-anchor="middle">${i+1}</text>
  `;
}).join('')}

<!-- ── MIDDLE SECTION: Status display ── -->
<rect x="88" y="195" width="140" height="70" rx="3" fill="#090c0f" stroke="#1e2226"/>
<!-- GPU / stats display -->
<text x="158" y="210" fill="#f97316" font-size="6.5" font-family="monospace" text-anchor="middle" font-weight="700">BASECALLING</text>
<text x="158" y="223" fill="#26c45a" font-size="6" font-family="monospace" text-anchor="middle">● GPU: 94% utilised</text>
<rect x="95" y="228" width="126" height="4" rx="2" fill="#1a1a1a"/>
<rect x="95" y="228" width="119" height="4" rx="2" fill="#f97316"/>
<text x="158" y="240" fill="#5a7a9a" font-size="5.5" font-family="monospace" text-anchor="middle">Reads: 4.2M · N50: 26kb</text>
<text x="158" y="250" fill="#5a7a9a" font-size="5.5" font-family="monospace" text-anchor="middle">Total: 38.4 Gb output</text>
<text x="158" y="260" fill="#888" font-size="5" font-family="monospace" text-anchor="middle">Guppy 6.4 · sup model</text>

<!-- ── RIGHT PANEL: I/O ports ── -->
<rect x="240" y="195" width="52" height="70" rx="3" fill="#090c0f" stroke="#1e2226"/>
<text x="266" y="209" fill="#666" font-size="5" font-family="monospace" text-anchor="middle">PORTS</text>
<!-- USB-A ports -->
<rect x="248" y="213" width="12" height="8" rx="1" fill="#1a1a1a" stroke="#333"/>
<rect x="248" y="225" width="12" height="8" rx="1" fill="#1a1a1a" stroke="#333"/>
<!-- Ethernet -->
<rect x="265" y="213" width="18" height="8" rx="1" fill="#1a1a1a" stroke="#333"/>
<!-- Power LED -->
<circle cx="270" cy="255" r="4" fill="#26c45a"/>
<circle cx="270" cy="255" r="6" fill="none" stroke="#26c45a" stroke-width="0.8" opacity="0.4"/>

<!-- ── BOTTOM: ONT Branding ── -->
<rect x="88" y="275" width="204" height="30" rx="3" fill="#0d0f12" stroke="#1e2226"/>
<text x="190" y="286" fill="#f97316" font-size="8" font-family="Arial" text-anchor="middle" font-weight="800">Oxford Nanopore</text>
<text x="190" y="298" fill="#666" font-size="6" font-family="Arial" text-anchor="middle" letter-spacing="2">GRIDION</text>

<!-- Power cable -->
<path d="M 190 310 Q 195 325 200 340 Q 204 350 198 355" fill="none" stroke="#222" stroke-width="4" stroke-linecap="round"/>

<!-- Component labels -->
<text x="30" y="133" fill="#f97316" font-size="5.5" font-family="Arial">MinION slots</text>
<line x1="80" y1="133" x2="88" y2="133" stroke="#f97316" stroke-width="0.6"/>
<text x="340" y="210" fill="#888" font-size="5.5" font-family="Arial">GPU basecall</text>
<line x1="295" y1="228" x2="338" y2="225" stroke="#888" stroke-width="0.6"/>
      `
    },

    /* 3 ─ Oxford Nanopore MinION ─────────────────────────────── */
    {
      id: 'nanopore-minion',
      name: 'Oxford Nanopore MinION',
      category: 'Portable Sequencer',
      color: '#fb923c',
      desc: 'The MinION is the world\'s smallest sequencer — about the size of a USB stick. It enabled real-time SARS-CoV-2 sequencing across Africa in laboratories, field clinics, and even remote bush hospitals with just a laptop and USB power.',
      specs: ['Size: 105 × 34 × 23 mm (pocket-sized!)', 'Read length: up to 4 Mb (ultra-long)', 'Throughput: up to 50 Gb per flow cell', 'Power: USB-C only (no mains needed)', 'Applications: outbreak sequencing, field metagenomics, rapid diagnostics'],
      usage: 'Used by Africa CDC rapid response teams during COVID-19, Ebola, and mpox outbreaks. Can sequence in the field without stable power. KEMRI and AHRI used MinIONs for TB whole-genome sequencing in remote clinics.',
      svg: `
<defs>
  <linearGradient id="mn-body" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#e8e0d0"/>
    <stop offset="100%" stop-color="#d0c8b8"/>
  </linearGradient>
  <linearGradient id="laptop-screen" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#0d1425"/>
    <stop offset="100%" stop-color="#0a0f1a"/>
  </linearGradient>
</defs>
<!-- Lab ceiling -->
<rect x="0" y="0" width="380" height="480" fill="#0d1117"/>
<rect x="40" y="8" width="300" height="4" rx="2" fill="#ffe8cc" opacity="0.7"/>
<rect x="0" y="20" width="380" height="285" fill="#111419"/>
<rect x="0" y="305" width="380" height="175" fill="#181c22"/>
<rect x="0" y="305" width="380" height="6" rx="1" fill="#232830"/>

<!-- LAPTOP (for scale reference) -->
<!-- Laptop screen (open, angled back) -->
<polygon points="45,250 45,85 305,85 305,250" fill="#1a1d21" stroke="#2a2d31" stroke-width="2"/>
<polygon points="45,85 50,78 310,78 305,85" fill="#1c1f24" stroke="#2a2d31"/>
<rect x="50" y="90" width="250" height="155" rx="3" fill="url(#laptop-screen)"/>
<!-- MinION driver / Oxford Nanopore MinKNOW software on screen -->
<text x="175" y="108" fill="#fb923c" font-size="8" font-family="monospace" text-anchor="middle" font-weight="700">MinKNOW</text>
<text x="175" y="120" fill="#666" font-size="6" font-family="monospace" text-anchor="middle">Oxford Nanopore Technologies</text>
<rect x="58" y="125" width="234" height="1" fill="#1e2a3a"/>

<!-- Live read chart on screen -->
<text x="85" y="138" fill="#fb923c" font-size="5.5" font-family="monospace">● SEQUENCING</text>
<text x="255" y="138" fill="#26c45a" font-size="5.5" font-family="monospace" text-anchor="end">R9.4.1 flow cell</text>

<!-- Fake waveform / reads on screen -->
${Array.from({length:12}, (_,i) => {
  const h = 8 + (i*17 + 31) % 35;
  return `<rect x="${62 + i*18}" y="${195-h}" width="14" height="${h}" rx="1" fill="#fb923c" opacity="${0.4 + i*0.05}"/>`;
}).join('')}
<text x="175" y="205" fill="#5a7a9a" font-size="5" font-family="monospace" text-anchor="middle">Reads passing: 284,920 · Bases: 1.84 Gb</text>
<text x="175" y="215" fill="#5a7a9a" font-size="5" font-family="monospace" text-anchor="middle">N50: 22.4 kb · Active pores: 1,247 / 2,048</text>
<text x="175" y="225" fill="#26c45a" font-size="5.5" font-family="monospace" text-anchor="middle">Pore activity: 61%</text>
<text x="175" y="235" fill="#888" font-size="5" font-family="monospace" text-anchor="middle">Elapsed: 04h 22min</text>

<!-- Camera dot on laptop -->
<circle cx="175" cy="83" r="2" fill="#0d0d0d"/>

<!-- Laptop base / keyboard -->
<rect x="35" y="250" width="310" height="12" rx="3" fill="#1e2126" stroke="#2a2d31"/>
<rect x="130" y="255" width="120" height="5" rx="2" fill="#151820"/>

<!-- MINION DEVICE plugged into laptop side -->
<!-- MinION body — cream/tan colored USB-ish device -->
<rect x="290" y="195" width="68" height="28" rx="5" fill="url(#mn-body)" stroke="#b0a898" stroke-width="1.5"/>
<!-- Front face of MinION -->
<rect x="290" y="195" width="68" height="28" rx="5" fill="url(#mn-body)"/>
<!-- Flow cell window (top face of MinION) -->
<rect x="296" y="197" width="40" height="12" rx="2" fill="#d8d0c0" stroke="#c0b8a8"/>
<text x="316" y="206" fill="#888" font-size="5" font-family="Arial" text-anchor="middle">FLOW CELL</text>
<!-- LED indicator -->
<circle cx="344" cy="205" r="3.5" fill="#fb923c"/>
<circle cx="344" cy="205" r="5" fill="none" stroke="#fb923c" stroke-width="0.8" opacity="0.5"/>
<!-- USB-C cable going into laptop -->
<rect x="358" y="207" width="18" height="8" rx="2" fill="#c8c0b0"/>
<!-- Cable -->
<path d="M 376 211 Q 380 211 380 215" fill="none" stroke="#888" stroke-width="3" stroke-linecap="round"/>

<!-- ONT logo on MinION -->
<text x="307" y="218" fill="#888" font-size="4.5" font-family="Arial">Oxford Nanopore</text>
<text x="307" y="226" fill="#fb923c" font-size="5" font-family="Arial" font-weight="700">MinION</text>

<!-- Size comparison label -->
<line x1="290" y1="185" x2="358" y2="185" stroke="#fb923c" stroke-width="0.8"/>
<line x1="290" y1="182" x2="290" y2="188" stroke="#fb923c" stroke-width="0.8"/>
<line x1="358" y1="182" x2="358" y2="188" stroke="#fb923c" stroke-width="0.8"/>
<text x="324" y="180" fill="#fb923c" font-size="5.5" font-family="Arial" text-anchor="middle">105 mm — pocket sized!</text>

<!-- Component labels on screen -->
<text x="15" y="200" fill="#fb923c" font-size="5.5" font-family="Arial">MinION</text>
<text x="15" y="208" fill="#fb923c" font-size="5.5" font-family="Arial">device</text>
<line x1="50" y1="206" x2="290" y2="209" stroke="#fb923c" stroke-width="0.5" stroke-dasharray="3,2"/>
      `
    },

    /* 4 ─ PCR Thermocycler (Bio-Rad C1000 Touch) ────────────── */
    {
      id: 'pcr-thermocycler',
      name: 'PCR Thermocycler',
      category: 'DNA Amplification',
      color: '#3fb950',
      desc: 'The polymerase chain reaction (PCR) machine amplifies specific DNA sequences using temperature cycling. Essential for library preparation, TB/malaria/COVID diagnostics, genotyping, and as the first step in nearly every NGS workflow.',
      specs: ['96-well or 384-well block options', 'Temperature range: 4–99°C', 'Ramp rate: up to 6°C/second', 'Gradient capability: ±20°C across block', 'Applications: diagnostic PCR, genotyping, LAMP, RT-PCR, library prep'],
      usage: 'Every African genomics lab has at least one thermocycler. Used for TB GeneXpert prep, malaria diagnostic PCR, SARS-CoV-2 RT-PCR, and library amplification before sequencing.',
      svg: `
<defs>
  <linearGradient id="pcr-body" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#e4e6e8"/>
    <stop offset="100%" stop-color="#d0d2d5"/>
  </linearGradient>
  <linearGradient id="pcr-lid" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#2a2c2e"/>
    <stop offset="100%" stop-color="#1a1c1e"/>
  </linearGradient>
</defs>
<!-- Lab ceiling -->
<rect x="0" y="0" width="380" height="480" fill="#0d1117"/>
<rect x="40" y="8" width="300" height="4" rx="2" fill="#e0ecff" opacity="0.7"/>
<rect x="0" y="20" width="380" height="285" fill="#111419"/>
<rect x="0" y="305" width="380" height="175" fill="#181c22"/>
<rect x="0" y="305" width="380" height="6" rx="1" fill="#232830"/>

<!-- Machine shadow -->
<ellipse cx="190" cy="311" rx="100" ry="6" fill="#000" opacity="0.5"/>

<!-- PCR machine body (Bio-Rad C1000 style) -->
<!-- Side face -->
<polygon points="295,100 308,90 308,305 295,305" fill="#c0c2c4"/>
<!-- Top of lid-open area -->
<polygon points="95,100 108,90 308,90 295,100" fill="#cccece"/>
<!-- Main white body -->
<rect x="95" y="100" width="200" height="205" rx="5" fill="url(#pcr-body)" stroke="#c0c2c4" stroke-width="1"/>

<!-- LID (black, slightly angled/open revealing wells) -->
<rect x="95" y="80" width="200" height="45" rx="5" fill="url(#pcr-lid)" stroke="#3a3c3e" stroke-width="1.5"/>
<!-- Lid hinge line -->
<rect x="95" y="118" width="200" height="3" fill="#222"/>
<!-- Lid handle -->
<rect x="175" y="84" width="30" height="10" rx="5" fill="#3a3d40" stroke="#4a4d50"/>
<text x="190" y="92" fill="#888" font-size="5" font-family="Arial" text-anchor="middle">OPEN</text>

<!-- LID INNER — heated lid visible -->
<rect x="102" y="100" width="186" height="18" rx="2" fill="#1a1a1a"/>
<text x="195" y="113" fill="#f97316" font-size="5.5" font-family="monospace" text-anchor="middle">HEATED LID: 105.0°C</text>

<!-- 96-WELL PLATE area (top of body, just below lid) -->
<rect x="102" y="120" width="186" height="100" rx="3" fill="#d8dadc" stroke="#b8babc"/>
<!-- 96-well grid: 8 rows × 12 columns -->
${Array.from({length:8}, (_, row) =>
  Array.from({length:12}, (_, col) => {
    const wellColor = (row * 12 + col) < 72
      ? `hsl(${120 + (row*12+col)*2}, 60%, 35%)`
      : '#c8cacc';
    return `<circle cx="${109 + col*14}" cy="${127 + row*10}" r="4.5" fill="${wellColor}" stroke="#a0a2a4" stroke-width="0.5"/>`;
  }).join('')
).join('')}

<!-- Row labels A-H -->
${['A','B','C','D','E','F','G','H'].map((l,i) =>
  `<text x="103" y="${131 + i*10}" fill="#666" font-size="5" font-family="monospace" text-anchor="middle">${l}</text>`
).join('')}
<!-- Column labels 1-12 -->
${Array.from({length:12}, (_,i) =>
  `<text x="${109 + i*14}" y="${123}" fill="#666" font-size="4.5" font-family="monospace" text-anchor="middle">${i+1}</text>`
).join('')}

<!-- FRONT DISPLAY PANEL -->
<rect x="102" y="226" width="112" height="68" rx="4" fill="#0a0d10" stroke="#1e2226"/>
<!-- Display screen showing PCR program -->
<rect x="104" y="228" width="108" height="64" rx="3" fill="#060a0e"/>
<text x="158" y="242" fill="#3fb950" font-size="7" font-family="monospace" text-anchor="middle" font-weight="700">RUNNING</text>
<text x="158" y="253" fill="#8b949e" font-size="5.5" font-family="monospace" text-anchor="middle">Step 3: Extension</text>
<text x="158" y="263" fill="#3fb950" font-size="9" font-family="monospace" text-anchor="middle">72.0°C</text>
<text x="158" y="274" fill="#8b949e" font-size="5.5" font-family="monospace" text-anchor="middle">Cycle 24 / 35</text>
<text x="158" y="284" fill="#5a8a7a" font-size="5" font-family="monospace" text-anchor="middle">Time left: 01:22:44</text>

<!-- Touch buttons (right of display) -->
<rect x="222" y="226" width="68" height="68" rx="4" fill="#d4d6d8" stroke="#b8babc"/>
<rect x="228" y="232" width="56" height="15" rx="3" fill="#26c45a"/>
<text x="256" y="243" fill="#fff" font-size="6" font-family="Arial" text-anchor="middle" font-weight="700">RUN</text>
<rect x="228" y="252" width="56" height="15" rx="3" fill="#e0e2e4" stroke="#c0c2c4"/>
<text x="256" y="263" fill="#333" font-size="6" font-family="Arial" text-anchor="middle">PAUSE</text>
<rect x="228" y="272" width="56" height="15" rx="3" fill="#e0e2e4" stroke="#c0c2c4"/>
<text x="256" y="283" fill="#333" font-size="6" font-family="Arial" text-anchor="middle">STOP</text>

<!-- Bio-Rad branding -->
<rect x="102" y="298" width="188" height="12" rx="2" fill="#e8eaec" stroke="#c8cacc"/>
<text x="196" y="308" fill="#c00" font-size="7" font-family="Arial" text-anchor="middle" font-weight="700">Bio-Rad</text>
<text x="275" y="308" fill="#666" font-size="5.5" font-family="Arial" text-anchor="start">C1000 Touch</text>

<!-- Component labels -->
<text x="25" y="115" fill="#1a1a1a" font-size="5.5" font-family="Arial">Heated lid</text>
<line x1="65" y1="112" x2="95" y2="105" stroke="#888" stroke-width="0.6"/>
<text x="25" y="145" fill="#3fb950" font-size="5.5" font-family="Arial">96-well</text>
<text x="25" y="153" fill="#3fb950" font-size="5.5" font-family="Arial">plate</text>
<line x1="65" y1="147" x2="102" y2="147" stroke="#3fb950" stroke-width="0.6"/>
      `
    },

    /* 5 ─ Centrifuge (Eppendorf 5424R) ──────────────────────── */
    {
      id: 'centrifuge',
      name: 'High-Speed Centrifuge',
      category: 'Sample Processing',
      color: '#bc8cff',
      desc: 'Centrifuges separate biological components by density using centrifugal force. The Eppendorf 5424R can reach 30,000 RPM (25,000 × g) and cool samples to -9°C. Essential for DNA/RNA extraction, plasma separation, and library clean-up.',
      specs: ['Max speed: 30,000 RPM (microcentrifuge)', 'Max RCF: 25,200 × g', 'Temperature control: -9°C to +40°C', 'Capacity: 24 × 1.5 mL or 2 mL tubes', 'Applications: DNA extraction, RNA pellets, beadclean-up, plasma separation'],
      usage: 'DNA and RNA extraction from blood, sputum, and tissue always requires centrifugation. Every African genomics lab runs centrifuges dozens of times daily for sample preparation before sequencing.',
      svg: `
<defs>
  <linearGradient id="cf-body" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#e6e8ea"/>
    <stop offset="100%" stop-color="#d0d4d8"/>
  </linearGradient>
  <radialGradient id="cf-lid-grad" cx="50%" cy="30%" r="70%">
    <stop offset="0%" stop-color="#e0e2e4"/>
    <stop offset="100%" stop-color="#b8babc"/>
  </radialGradient>
</defs>
<!-- Lab ceiling -->
<rect x="0" y="0" width="380" height="480" fill="#0d1117"/>
<rect x="40" y="8" width="300" height="4" rx="2" fill="#e0ecff" opacity="0.7"/>
<rect x="0" y="20" width="380" height="285" fill="#111419"/>
<rect x="0" y="305" width="380" height="175" fill="#181c22"/>
<rect x="0" y="305" width="380" height="6" rx="1" fill="#232830"/>

<!-- Machine shadow -->
<ellipse cx="190" cy="313" rx="88" ry="6" fill="#000" opacity="0.5"/>

<!-- Centrifuge body (Eppendorf 5424R style) -->
<!-- Side -->
<polygon points="255,115 268,105 268,305 255,305" fill="#c0c2c5"/>
<!-- Top bevel -->
<polygon points="125,115 138,105 268,105 255,115" fill="#cccfd2"/>
<!-- Main body (rounded top, squarish) -->
<rect x="125" y="115" width="130" height="190" rx="8" fill="url(#cf-body)" stroke="#c0c2c5" stroke-width="1"/>

<!-- LID — circular, on top of body -->
<ellipse cx="190" cy="145" rx="60" ry="20" fill="url(#cf-lid-grad)" stroke="#b0b2b5" stroke-width="2"/>
<!-- Lid surface -->
<ellipse cx="190" cy="143" rx="58" ry="18" fill="#d8dadc" stroke="#b8babc"/>
<!-- Safety latch indicator -->
<rect x="182" y="135" width="16" height="5" rx="2" fill="#26c45a"/>
<text x="190" y="140" fill="#fff" font-size="4.5" font-family="monospace" text-anchor="middle">LOCKED</text>

<!-- Eppendorf logo mark on lid -->
<circle cx="190" cy="148" r="8" fill="none" stroke="#0082c8" stroke-width="1.5"/>
<text x="190" y="152" fill="#0082c8" font-size="5" font-family="Arial" text-anchor="middle" font-weight="700">E</text>

<!-- LID RING  -->
<ellipse cx="190" cy="145" rx="60" ry="20" fill="none" stroke="#a8aaad" stroke-width="1.5"/>

<!-- FRONT DISPLAY (lower front panel) -->
<rect x="134" y="175" width="112" height="90" rx="5" fill="#0a0c0f" stroke="#1a1c1f"/>
<rect x="136" y="177" width="108" height="86" rx="4" fill="#060809"/>
<!-- Display content -->
<text x="190" y="193" fill="#bc8cff" font-size="6.5" font-family="monospace" text-anchor="middle" font-weight="700">CENTRIFUGE</text>
<text x="190" y="207" fill="#26c45a" font-size="7" font-family="monospace" text-anchor="middle">14,000 RPM</text>
<text x="190" y="220" fill="#8b949e" font-size="5.5" font-family="monospace" text-anchor="middle">Time: 09:52 / 10:00</text>
<!-- Time progress bar -->
<rect x="142" y="224" width="96" height="4" rx="2" fill="#1a1a2a"/>
<rect x="142" y="224" width="95" height="4" rx="2" fill="#bc8cff"/>
<text x="190" y="237" fill="#5a7aaa" font-size="5.5" font-family="monospace" text-anchor="middle">Temp: 4.0°C</text>
<text x="190" y="249" fill="#5a7aaa" font-size="5.5" font-family="monospace" text-anchor="middle">RCF: 16,873 × g</text>
<text x="190" y="259" fill="#888" font-size="5" font-family="monospace" text-anchor="middle">Rotor: FA-45-24-11</text>

<!-- Control buttons (right of display) -->
<rect x="254" y="187" width="16" height="16" rx="3" fill="#26c45a"/>
<text x="262" y="199" fill="#fff" font-size="7" font-family="Arial" text-anchor="middle">▶</text>
<rect x="254" y="207" width="16" height="16" rx="3" fill="#d0d2d5" stroke="#b8babc"/>
<text x="262" y="219" fill="#555" font-size="7" font-family="Arial" text-anchor="middle">■</text>

<!-- Eppendorf branding (lower body) -->
<rect x="134" y="272" width="112" height="22" rx="3" fill="#dce0e4" stroke="#c0c4c8"/>
<text x="190" y="287" fill="#0082c8" font-size="8" font-family="Arial" text-anchor="middle" font-weight="700">Eppendorf</text>

<!-- Component labels -->
<text x="30" y="143" fill="#bc8cff" font-size="5.5" font-family="Arial">Safety lid</text>
<line x1="72" y1="141" x2="130" y2="141" stroke="#bc8cff" stroke-width="0.6"/>
<text x="340" y="230" fill="#888" font-size="5.5" font-family="Arial" text-anchor="end">4°C cooling</text>
<line x1="254" y1="234" x2="336" y2="233" stroke="#888" stroke-width="0.6"/>
      `
    },

    /* 6 ─ Agilent Bioanalyzer 2100 ──────────────────────────── */
    {
      id: 'bioanalyzer',
      name: 'Agilent Bioanalyzer 2100',
      category: 'RNA / DNA QC',
      color: '#58a6ff',
      desc: 'The Bioanalyzer 2100 uses microfluidic chips to assess DNA/RNA quality and quantity in just 1 µL of sample. It generates RNA Integrity Numbers (RIN) — a score from 1–10 — that are critical for RNA-seq experiment success.',
      specs: ['Sample volume: 1 µL per well', 'RIN score: 1–10 (RNA Integrity Number)', 'DNA sizing: 100 bp – 12,000 bp', 'Analysis time: 30–40 min for 12 samples', 'Applications: RNA-seq QC, library QC, cfDNA, gDNA quality'],
      usage: 'RNA-seq experiments require RIN > 7 to produce high-quality data. H3Africa consortium labs routinely QC all RNA samples on the Bioanalyzer before committing to sequencing runs. Also used for library fragment size verification.',
      svg: `
<defs>
  <linearGradient id="ba-body" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#e6e8ea"/>
    <stop offset="100%" stop-color="#d4d6d8"/>
  </linearGradient>
</defs>
<!-- Lab ceiling -->
<rect x="0" y="0" width="380" height="480" fill="#0d1117"/>
<rect x="40" y="8" width="300" height="4" rx="2" fill="#e0ecff" opacity="0.7"/>
<rect x="0" y="20" width="380" height="285" fill="#111419"/>
<rect x="0" y="305" width="380" height="175" fill="#181c22"/>
<rect x="0" y="305" width="380" height="6" rx="1" fill="#232830"/>

<!-- Machine shadow -->
<ellipse cx="165" cy="312" rx="80" ry="5" fill="#000" opacity="0.5"/>

<!-- BIOANALYZER 2100 main unit (white desktop box) -->
<!-- Side face -->
<polygon points="240,110 252,100 252,305 240,305" fill="#c0c2c5"/>
<!-- Top face -->
<polygon points="92,110 104,100 252,100 240,110" fill="#cccfd2"/>
<!-- Front face -->
<rect x="92" y="110" width="148" height="195" rx="5" fill="url(#ba-body)" stroke="#c0c2c5" stroke-width="1"/>

<!-- CHIP LOADING STATION (top area — key distinguishing feature) -->
<rect x="100" y="118" width="132" height="85" rx="4" fill="#d4d6d8" stroke="#b8babc"/>
<text x="166" y="133" fill="#444" font-size="6" font-family="Arial" text-anchor="middle" font-weight="600">CHIP STATION</text>
<!-- Chip port (the distinctive microfluidic chip slot) -->
<rect x="120" y="138" width="92" height="55" rx="3" fill="#b8babc" stroke="#9a9ca0"/>
<rect x="126" y="143" width="80" height="45" rx="2" fill="#a8aaad"/>
<!-- Chip contacts visible inside port -->
${Array.from({length:4}, (_,i) =>
  `<circle cx="${135 + i*20}" cy="${155}" r="4" fill="#888" stroke="#666" stroke-width="0.5"/>
   <circle cx="${135 + i*20}" cy="${175}" r="4" fill="#888" stroke="#666" stroke-width="0.5"/>`
).join('')}
<text x="166" y="193" fill="#666" font-size="5" font-family="monospace" text-anchor="middle">Insert Chip ▼</text>
<!-- Status LED -->
<circle cx="225" cy="135" r="4" fill="#26c45a"/>
<circle cx="225" cy="135" r="6" fill="none" stroke="#26c45a" stroke-width="0.8" opacity="0.4"/>

<!-- FRONT DISPLAY / STATUS -->
<rect x="100" y="210" width="132" height="80" rx="4" fill="#0a0c0f" stroke="#1a1c20"/>
<rect x="102" y="212" width="128" height="76" rx="3" fill="#060a0e"/>
<!-- Electropherogram peaks on screen -->
<text x="166" y="225" fill="#58a6ff" font-size="6" font-family="monospace" text-anchor="middle" font-weight="700">RNA 6000 Nano</text>
<!-- Fake electropherogram -->
<polyline points="108,268 115,266 118,248 122,270 130,264 135,240 140,268 146,258 150,238 155,268 161,255 166,230 172,268 178,258 182,245 190,268 195,260 200,242 206,270 212,265 216,272 220,270"
  fill="none" stroke="#58a6ff" stroke-width="1.5"/>
<line x1="108" y1="270" x2="220" y2="270" stroke="#1a2a4a" stroke-width="0.5"/>
<!-- RIN score label on screen -->
<text x="166" y="284" fill="#5a8aaa" font-size="5.5" font-family="monospace" text-anchor="middle">RIN: 9.2 · 28S/18S: 1.9</text>

<!-- Branding -->
<rect x="100" y="296" width="132" height="18" rx="3" fill="#e0e2e4" stroke="#c8cacc"/>
<text x="140" y="308" fill="#0082c8" font-size="7" font-family="Arial" text-anchor="middle" font-weight="700">Agilent</text>
<text x="192" y="308" fill="#666" font-size="6" font-family="Arial" text-anchor="start">2100</text>

<!-- LAPTOP SCREEN (connected, showing analysis results) -->
<rect x="260" y="105" width="108" height="80" rx="4" fill="#0a0c10" stroke="#1a1c22"/>
<rect x="262" y="107" width="104" height="76" rx="3" fill="#060809"/>
<!-- Laptop screen content: analysis report -->
<text x="314" y="120" fill="#58a6ff" font-size="5.5" font-family="monospace" text-anchor="middle">Sample QC Report</text>
<rect x="265" y="123" width="98" height="1" fill="#1e2a3a"/>
${[
  ['S1_RNA', '9.2', '#26c45a'],
  ['S2_RNA', '8.7', '#26c45a'],
  ['S3_RNA', '7.1', '#e3b341'],
  ['S4_RNA', '5.8', '#f85149'],
  ['S5_RNA', '9.0', '#26c45a'],
].map(([s,r,c], i) =>
  `<text x="267" y="${132+i*10}" fill="#8b949e" font-size="4.5" font-family="monospace">${s}</text>
   <text x="330" y="${132+i*10}" fill="${c}" font-size="4.5" font-family="monospace" text-anchor="end">RIN: ${r}</text>`
).join('')}
<text x="314" y="182" fill="#666" font-size="5" font-family="monospace" text-anchor="middle">5/5 samples analyzed</text>
<!-- Laptop base -->
<rect x="252" y="185" width="124" height="8" rx="2" fill="#1a1d22" stroke="#2a2d31"/>

<!-- Connection cable to laptop -->
<path d="M 240 175 Q 248 175 252 175" fill="none" stroke="#444" stroke-width="2.5" stroke-linecap="round"/>

<!-- Component labels -->
<text x="25" y="165" fill="#58a6ff" font-size="5.5" font-family="Arial">Chip port</text>
<line x1="70" y1="163" x2="100" y2="163" stroke="#58a6ff" stroke-width="0.6"/>
<text x="25" y="255" fill="#888" font-size="5.5" font-family="Arial">Run display</text>
<line x1="70" y1="253" x2="100" y2="253" stroke="#888" stroke-width="0.6"/>
      `
    },

    /* 7 ─ Biosafety Cabinet Class II ────────────────────────── */
    {
      id: 'biosafety-cabinet',
      name: 'Biosafety Cabinet Class II',
      category: 'Containment / Safety',
      color: '#ff7b72',
      desc: 'Class II Biological Safety Cabinets provide personnel, environmental, and product protection when working with BSL-2 pathogens. The HEPA-filtered laminar downflow prevents aerosols from escaping — essential for handling TB sputum, blood, and infectious disease samples.',
      specs: ['BSL-2 certified (Class II Type A2)', 'HEPA filtration: 99.97% at 0.3 µm', 'Inflow velocity: 0.53 m/s (protection)', 'Downflow velocity: 0.25 m/s (product protection)', 'UV sterilisation lamp (pre-work cycle)', 'Sash opening: 200 mm safe operating height'],
      usage: 'All clinical sample handling for HIV, TB, malaria, and Ebola genomics must occur in a BSC. H3Africa labs handling patient blood and tissue before DNA extraction use Class II cabinets to protect both researchers and samples.',
      svg: `
<defs>
  <linearGradient id="bsc-body" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#d8dadc"/>
    <stop offset="100%" stop-color="#c4c6c8"/>
  </linearGradient>
</defs>
<!-- Lab ceiling -->
<rect x="0" y="0" width="380" height="480" fill="#0d1117"/>
<rect x="40" y="8" width="300" height="4" rx="2" fill="#e0ecff" opacity="0.7"/>
<rect x="0" y="20" width="380" height="285" fill="#111419"/>
<rect x="0" y="305" width="380" height="175" fill="#181c22"/>
<rect x="0" y="305" width="380" height="6" rx="1" fill="#232830"/>

<!-- Cabinet shadow (large unit) -->
<ellipse cx="190" cy="312" rx="140" ry="7" fill="#000" opacity="0.5"/>

<!-- BSC — large floor-standing unit -->
<!-- Top housing (HEPA filter above) -->
<rect x="38" y="38" width="310" height="38" rx="4" fill="#c8cacc" stroke="#b0b2b5" stroke-width="1"/>
<text x="193" y="55" fill="#555" font-size="6" font-family="Arial" text-anchor="middle">HEPA FILTER HOUSING</text>
<text x="193" y="66" fill="#888" font-size="5.5" font-family="monospace" text-anchor="middle">99.97% @ 0.3µm · Downflow active</text>
<!-- Airflow arrows on HEPA housing -->
${Array.from({length:5}, (_,i) =>
  `<text x="${65 + i*52}" y="61" fill="#58a6ff" font-size="8" font-family="Arial" text-anchor="middle" opacity="0.6">↓</text>`
).join('')}

<!-- Main cabinet body (stainless/white outer) -->
<rect x="38" y="76" width="310" height="230" fill="url(#bsc-body)" stroke="#c0c2c5" stroke-width="1.5"/>

<!-- SASH / GLASS FRONT (the viewing window — slides up) -->
<!-- Glass panel — with slight tint -->
<rect x="45" y="80" width="296" height="140" rx="2" fill="rgba(160,180,200,0.12)" stroke="#88aacc" stroke-width="1.5"/>
<!-- Sash frame (bottom edge of sliding glass) -->
<rect x="43" y="214" width="300" height="8" rx="2" fill="#d0d2d5" stroke="#a8aaad"/>
<text x="193" y="221" fill="#666" font-size="5" font-family="Arial" text-anchor="middle">SASH — 200mm OPEN (SAFE OPERATING HEIGHT)</text>

<!-- INTERIOR of cabinet (visible through glass) -->
<rect x="50" y="84" width="286" height="125" fill="#0e1215" opacity="0.85"/>

<!-- UV Lamp fixture at top of interior -->
<rect x="55" y="86" width="276" height="6" rx="2" fill="#2a2a4a"/>
<text x="193" y="91" fill="#6666cc" font-size="4" font-family="monospace" text-anchor="middle">UV LAMP — OFF (run before use)</text>

<!-- Lab supplies visible inside cabinet -->
<!-- Tube rack with eppendorf tubes -->
<rect x="65" y="165" width="30" height="35" rx="2" fill="#1a2a1a" stroke="#333"/>
${Array.from({length:6}, (_,i) =>
  `<rect x="${68+i*4}" y="${175}" width="3" height="20" rx="1" fill="hsl(${i*40},60%,40%)"/>`
).join('')}
<text x="80" y="207" fill="#666" font-size="4.5" font-family="Arial" text-anchor="middle">1.5mL</text>
<text x="80" y="212" fill="#666" font-size="4.5" font-family="Arial" text-anchor="middle">tubes</text>

<!-- Pipette tips box -->
<rect x="105" y="168" width="42" height="30" rx="2" fill="#1a1a3a" stroke="#2a2a5a"/>
<text x="126" y="181" fill="#5a5aaa" font-size="5" font-family="Arial" text-anchor="middle">TIPS</text>
<text x="126" y="190" fill="#5a5aaa" font-size="4.5" font-family="Arial" text-anchor="middle">200µL</text>

<!-- Reagent bottles -->
<rect x="158" y="158" width="18" height="42" rx="3" fill="#0a1a0a" stroke="#1a3a1a"/>
<text x="167" y="202" fill="#3fb950" font-size="4.5" font-family="Arial" text-anchor="middle" transform="rotate(-90,167,202)">TE buffer</text>
<rect x="180" y="158" width="18" height="42" rx="3" fill="#0a0a1a" stroke="#1a1a3a"/>
<text x="189" y="202" fill="#5a5aff" font-size="4.5" font-family="Arial" text-anchor="middle" transform="rotate(-90,189,202)">ProtK</text>
<rect x="202" y="158" width="18" height="42" rx="3" fill="#1a0a0a" stroke="#3a1a1a"/>
<text x="211" y="202" fill="#ff5a5a" font-size="4.5" font-family="Arial" text-anchor="middle" transform="rotate(-90,211,202)">Lysis buf</text>

<!-- Gloves on the ledge -->
<path d="M 240 200 Q 255 195 270 198 Q 280 200 282 210 Q 270 215 255 212 Q 242 210 240 200Z" fill="#87ceeb" opacity="0.7"/>
<path d="M 285 202 Q 300 197 315 200 Q 322 202 324 210 Q 312 217 297 214 Q 283 210 285 202Z" fill="#87ceeb" opacity="0.7"/>
<text x="282" y="222" fill="#4a8aaa" font-size="5" font-family="Arial" text-anchor="middle">nitrile gloves</text>

<!-- CONTROL PANEL below sash -->
<rect x="38" y="225" width="310" height="55" rx="0" fill="#d0d2d5" stroke="#b8babc"/>
<!-- HEPA/fan controls -->
<rect x="48" y="233" width="80" height="38" rx="3" fill="#c4c6c8" stroke="#aaaaac"/>
<text x="88" y="245" fill="#444" font-size="5.5" font-family="Arial" text-anchor="middle">AIRFLOW</text>
<rect x="52" y="249" width="30" height="12" rx="2" fill="#26c45a"/>
<text x="67" y="258" fill="#fff" font-size="5.5" font-family="Arial" text-anchor="middle">ON</text>
<rect x="86" y="249" width="30" height="12" rx="2" fill="#c4c6c8" stroke="#aaaaac"/>
<text x="101" y="258" fill="#888" font-size="5.5" font-family="Arial" text-anchor="middle">OFF</text>

<!-- Display -->
<rect x="138" y="233" width="112" height="38" rx="3" fill="#0a0d10" stroke="#1a1c20"/>
<text x="194" y="248" fill="#26c45a" font-size="6" font-family="monospace" text-anchor="middle">PROTECTION ACTIVE</text>
<text x="194" y="260" fill="#8b949e" font-size="5" font-family="monospace" text-anchor="middle">Inflow: 0.53 m/s · Downflow: 0.25 m/s</text>
<text x="194" y="270" fill="#5a7aaa" font-size="5" font-family="monospace" text-anchor="middle">UV cycle due: 04:00 AM</text>

<!-- Brand label -->
<rect x="258" y="233" width="85" height="38" rx="3" fill="#c8cacc" stroke="#b0b2b5"/>
<text x="300" y="248" fill="#444" font-size="6" font-family="Arial" text-anchor="middle" font-weight="700">Labculture</text>
<text x="300" y="260" fill="#444" font-size="5.5" font-family="Arial" text-anchor="middle">Class II BSC</text>
<text x="300" y="270" fill="#ff7b72" font-size="5" font-family="Arial" text-anchor="middle">BSL-2</text>

<!-- Legs of cabinet -->
<rect x="50" y="280" width="20" height="25" rx="2" fill="#b0b2b5" stroke="#a0a2a5"/>
<rect x="316" y="280" width="20" height="25" rx="2" fill="#b0b2b5" stroke="#a0a2a5"/>

<!-- Component labels -->
<text x="18" y="60" fill="#58a6ff" font-size="5.5" font-family="Arial">HEPA</text>
<line x1="36" y1="58" x2="38" y2="58" stroke="#58a6ff" stroke-width="0.6"/>
<text x="348" y="148" fill="#888" font-size="5.5" font-family="Arial">Glass sash</text>
<line x1="344" y1="150" x2="340" y2="150" stroke="#888" stroke-width="0.6"/>
      `
    },

    /* 8 ─ Fluorescence Microscope (Zeiss Axio style) ─────────── */
    {
      id: 'fluorescence-microscope',
      name: 'Fluorescence Microscope',
      category: 'Cell Biology / Imaging',
      color: '#a371f7',
      desc: 'Fluorescence microscopes excite fluorescent dyes with specific wavelengths of light, enabling visualisation of cellular structures, parasites, and tagged proteins. Essential for malaria smear reading, cell counting before RNA extraction, and spatial transcriptomics validation.',
      specs: ['Objectives: 4×, 10×, 40×, 100× (oil)', 'Filter sets: DAPI, FITC, TRITC, Cy5', 'Light source: LED (multi-band, low heat)', 'Camera: monochrome sCMOS (high sensitivity)', 'Applications: malaria smears, immunofluorescence, spatial omics'],
      usage: 'Used in every African infectious disease lab for malaria thick/thin smear reading (Plasmodium detection), counting cells before RNA extraction, and validating FISH probes. Spatial transcriptomics at KEMRI uses high-resolution fluorescence imaging.',
      svg: `
<defs>
  <linearGradient id="mic-body" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#1e2226"/>
    <stop offset="100%" stop-color="#141618"/>
  </linearGradient>
</defs>
<!-- Lab ceiling -->
<rect x="0" y="0" width="380" height="480" fill="#0d1117"/>
<rect x="40" y="8" width="300" height="4" rx="2" fill="#e0ecff" opacity="0.7"/>
<rect x="0" y="20" width="380" height="285" fill="#111419"/>
<rect x="0" y="305" width="380" height="175" fill="#181c22"/>
<rect x="0" y="305" width="380" height="6" rx="1" fill="#232830"/>

<!-- Machine shadow -->
<ellipse cx="160" cy="311" rx="75" ry="6" fill="#000" opacity="0.5"/>

<!-- ── FLUORESCENCE MICROSCOPE — upright black body ── -->
<!-- Base (heavy, stable) -->
<rect x="85" y="275" width="150" height="30" rx="5" fill="#1e2226" stroke="#2a2d31" stroke-width="1.5"/>
<rect x="90" y="277" width="140" height="6" rx="2" fill="#2a2d31"/>
<!-- Focus wheel / coarse focus knob (left of base-column) -->
<circle cx="92" cy="235" r="14" fill="#282c30" stroke="#3a3d42" stroke-width="2"/>
<circle cx="92" cy="235" r="9" fill="#1e2226"/>
<text x="92" y="239" fill="#666" font-size="5" font-family="Arial" text-anchor="middle">FOCUS</text>
<!-- Fine focus knob -->
<circle cx="92" cy="258" r="10" fill="#282c30" stroke="#3a3d42" stroke-width="1.5"/>
<circle cx="92" cy="258" r="6" fill="#1e2226"/>
<text x="92" y="261" fill="#555" font-size="4" font-family="Arial" text-anchor="middle">FINE</text>

<!-- Main upright column -->
<rect x="106" y="80" width="40" height="195" rx="4" fill="url(#mic-body)" stroke="#2a2d31" stroke-width="1.5"/>
<!-- Column highlight line -->
<rect x="120" y="84" width="2" height="187" rx="1" fill="#2e3236" opacity="0.6"/>

<!-- STAGE (slide holder in middle) -->
<rect x="88" y="210" width="144" height="22" rx="3" fill="#1a1d21" stroke="#2e3236" stroke-width="1.5"/>
<!-- Stage X-Y movement visible -->
<rect x="98" y="214" width="56" height="14" rx="2" fill="#141618" stroke="#252830"/>
<text x="126" y="224" fill="#666" font-size="5" font-family="monospace" text-anchor="middle">X: +2.34mm</text>
<!-- Slide on stage -->
<rect x="108" y="216" width="36" height="10" rx="1" fill="rgba(180,200,220,0.3)" stroke="#58a6ff" stroke-width="0.8"/>
<!-- Stage controls (right side) -->
<circle cx="218" cy="218" r="8" fill="#1e2226" stroke="#2e3236"/>
<circle cx="218" cy="218" r="4" fill="#141618"/>
<text x="230" y="218" fill="#666" font-size="4.5" font-family="monospace">XY</text>

<!-- OBJECTIVE TURRET (below stage / actually above in inverted, but here upright) -->
<ellipse cx="128" cy="208" rx="24" ry="7" fill="#1a1d21" stroke="#2a2d31" stroke-width="1.5"/>
<!-- Objective lenses (turret) -->
<rect x="118" y="185" width="8" height="24" rx="2" fill="#a371f7" opacity="0.8"/>
<text x="122" y="196" fill="#fff" font-size="4" font-family="monospace" text-anchor="middle" transform="rotate(-90,122,196)">100×</text>
<rect x="130" y="188" width="7" height="20" rx="2" fill="#58a6ff" opacity="0.8"/>
<text x="133" y="198" fill="#fff" font-size="4" font-family="monospace" text-anchor="middle" transform="rotate(-90,133,198)">40×</text>
<rect x="140" y="192" width="7" height="16" rx="2" fill="#3fb950" opacity="0.8"/>
<text x="144" y="200" fill="#fff" font-size="4" font-family="monospace" text-anchor="middle" transform="rotate(-90,144,200)">10×</text>

<!-- BODY (main microscope head area) -->
<rect x="104" y="82" width="90" height="100" rx="6" fill="#1a1d21" stroke="#2a2d31" stroke-width="1.5"/>

<!-- BINOCULAR EYEPIECE (top of microscope) -->
<rect x="110" y="60" width="78" height="28" rx="5" fill="#1e2226" stroke="#2e3236" stroke-width="1.5"/>
<!-- Two eyepieces -->
<circle cx="128" cy="74" r="10" fill="#0a0c0f" stroke="#2a2d31" stroke-width="1.5"/>
<circle cx="128" cy="74" r="6" fill="#141618"/>
<circle cx="128" cy="74" r="3" fill="#050508"/>
<circle cx="170" cy="74" r="10" fill="#0a0c0f" stroke="#2a2d31" stroke-width="1.5"/>
<circle cx="170" cy="74" r="6" fill="#141618"/>
<circle cx="170" cy="74" r="3" fill="#050508"/>
<!-- Inter-pupillary adjustment -->
<rect x="136" y="72" width="26" height="4" rx="2" fill="#0d0f12"/>
<text x="149" y="77" fill="#333" font-size="4" font-family="Arial" text-anchor="middle">IPD</text>

<!-- FLUORESCENCE LIGHT SOURCE (top/side of body) -->
<rect x="157" y="95" width="35" height="70" rx="4" fill="#1a1d21" stroke="#2a2d31" stroke-width="1.2"/>
<!-- Filter cubes visible through a window -->
<rect x="160" y="100" width="29" height="50" rx="2" fill="#0a0c0f"/>
${[
  ['DAPI','#8888ff','108'],
  ['FITC','#26c45a','118'],
  ['TRITC','#ff7744','128'],
].map(([n,c,y]) =>
  `<rect x="163" y="${y}" width="23" height="8" rx="1" fill="${c}" opacity="0.25" stroke="${c}" stroke-width="0.5"/>
   <text x="174" y="${+y+6}" fill="${c}" font-size="4.5" font-family="monospace" text-anchor="middle">${n}</text>`
).join('')}
<!-- LED indicator (light on) -->
<circle cx="185" cy="155" r="4" fill="#a371f7"/>
<circle cx="185" cy="155" r="6" fill="none" stroke="#a371f7" stroke-width="1" opacity="0.4"/>

<!-- CAMERA PORT (top of scope body) -->
<rect x="107" y="84" width="28" height="20" rx="3" fill="#141618" stroke="#2a2d31"/>
<text x="121" y="98" fill="#888" font-size="5" font-family="monospace" text-anchor="middle">CAM</text>

<!-- MONITOR (to the right — showing live fluorescence image) -->
<rect x="240" y="90" width="118" height="90" rx="4" fill="#0a0c10" stroke="#1a1c22" stroke-width="1.5"/>
<rect x="242" y="92" width="114" height="86" rx="3" fill="#05070a"/>
<!-- Fluorescence image on screen — dark background, colored cells -->
<rect x="244" y="94" width="110" height="82" rx="2" fill="#02030a"/>
<!-- Simulated DAPI-stained nuclei (blue dots) -->
${Array.from({length:20}, (_,i) => {
  const x = 250 + (i*23 + 11) % 98;
  const y = 98 + (i*17 + 7) % 72;
  const size = 3 + i % 4;
  const colors = ['rgba(100,100,255,0.9)','rgba(60,200,60,0.7)','rgba(255,60,60,0.6)'];
  const c = colors[i % 3];
  return `<circle cx="${x}" cy="${y}" r="${size}" fill="${c}"/>`;
}).join('')}
<text x="299" y="185" fill="#6a7aaa" font-size="5" font-family="monospace" text-anchor="middle">DAPI · 40× · Live</text>

<!-- Monitor stand -->
<rect x="287" y="180" width="8" height="15" fill="#1a1d22" stroke="#2a2d31"/>
<rect x="268" y="194" width="46" height="6" rx="2" fill="#1a1d22" stroke="#2a2d31"/>

<!-- Component labels -->
<text x="30" y="72" fill="#a371f7" font-size="5.5" font-family="Arial">Eyepieces</text>
<line x1="75" y1="72" x2="110" y2="72" stroke="#a371f7" stroke-width="0.6"/>
<text x="30" y="200" fill="#3fb950" font-size="5.5" font-family="Arial">Objectives</text>
<line x1="75" y1="198" x2="104" y2="200" stroke="#3fb950" stroke-width="0.6"/>
<text x="30" y="215" fill="#888" font-size="5.5" font-family="Arial">Slide stage</text>
<line x1="75" y1="213" x2="88" y2="213" stroke="#888" stroke-width="0.6"/>
      `
    }
  ];

  /* ── State ── */
  let _angle       = 0;
  let _tilt        = 0;
  let _targetAngle = 0;
  let _targetTilt  = 0;
  let _dragging    = false;
  let _lastX       = 0;
  let _lastY       = 0;
  let _animRaf     = null;
  let _activeStation = null;
  let _sceneEl     = null;
  let _infoEl      = null;
  let _idleTimer   = null;

  const N      = STATIONS.length;
  const STEP   = 360 / N;
  const PANEL_W = 380;
  const PANEL_H = 480;
  /* Radius: inward panorama — large so panels nearly fill the viewport */
  const RADIUS = Math.round(PANEL_W / (2 * Math.tan(Math.PI / N))) + 80;

  /* ── Smooth animation loop ── */
  function _tick() {
    const da = _targetAngle - _angle;
    const dt = _targetTilt  - _tilt;
    _angle += da * 0.1;
    _tilt  += dt * 0.1;
    if (_sceneEl) {
      _sceneEl.style.transform =
        `rotateX(${_tilt.toFixed(2)}deg) rotateY(${_angle.toFixed(2)}deg)`;
    }
    _syncDots();
    if (Math.abs(da) > 0.05 || Math.abs(dt) > 0.05) {
      _animRaf = requestAnimationFrame(_tick);
    } else {
      _animRaf = null;
      _syncDots();
    }
  }

  function _startTick() {
    if (!_animRaf) _animRaf = requestAnimationFrame(_tick);
  }

  /* ── Which station is facing us right now ── */
  function _currentIdx() {
    const norm = ((-_angle % 360) + 360) % 360;
    return Math.round(norm / STEP) % N;
  }

  function _syncDots() {
    const idx = _currentIdx();
    document.querySelectorAll('.vl-dot').forEach((d, i) =>
      d.classList.toggle('vl-dot-active', i === idx));
  }

  /* ── Navigate to station index ── */
  function goTo(idx) {
    idx = ((idx % N) + N) % N;
    _targetAngle = -(idx * STEP);
    _startTick();
    /* Show info after scene settles */
    clearTimeout(_goToTimer);
    _goToTimer = setTimeout(() => _showStation(STATIONS[idx].id), 350);
  }
  let _goToTimer = null;

  /* ── Select station by ID ── */
  function select(id) {
    const idx = STATIONS.findIndex(s => s.id === id);
    if (idx < 0) return;
    goTo(idx);
  }

  /* ── Rotate one step ── */
  function rotate(dir) {
    _targetAngle -= dir * STEP;
    _startTick();
  }

  /* ── Show info panel for a station ── */
  function _showStation(id) {
    const st = STATIONS.find(s => s.id === id);
    if (!st || !_infoEl) return;
    _activeStation = id;

    document.querySelectorAll('.vl-panel').forEach(p =>
      p.classList.toggle('vl-panel-active', p.dataset.id === id));

    _infoEl.innerHTML = `
      <button class="vl-info-close" onclick="OmicsLab.VirtualLab.closeInfo()" title="Close">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
      <div class="vl-info-cat" style="color:${st.color}">${st.category}</div>
      <div class="vl-info-name">${st.name}</div>
      <p class="vl-info-desc">${st.desc}</p>
      <div class="vl-info-sub">Specifications</div>
      <ul class="vl-info-specs">${st.specs.map(s => `<li>${s}</li>`).join('')}</ul>
      <div class="vl-info-sub">Use in African Genomics</div>
      <p class="vl-info-usage">${st.usage}</p>
    `;
    _infoEl.classList.add('vl-info-open');
  }

  /* ── Close info panel ── */
  function closeInfo() {
    if (_infoEl) _infoEl.classList.remove('vl-info-open');
    document.querySelectorAll('.vl-panel').forEach(p => p.classList.remove('vl-panel-active'));
    _activeStation = null;
  }

  /* ── Build the 3D panorama HTML ── */
  function _buildPanorama() {
    /* Inward-facing panels: rotateY(angle) then translateZ and flip to face viewer */
    const panels = STATIONS.map((st, i) => {
      const rotY = STEP * i;
      return `
        <div class="vl-panel" data-id="${st.id}"
          style="width:${PANEL_W}px;height:${PANEL_H}px;
                 transform:rotateY(${rotY}deg) translateZ(${RADIUS}px);
                 border-color:${st.color}30"
          onclick="OmicsLab.VirtualLab.select('${st.id}')">
          <svg width="${PANEL_W}" height="${PANEL_H}" viewBox="0 0 380 480"
               xmlns="http://www.w3.org/2000/svg" style="display:block">
            ${st.svg}
          </svg>
          <div class="vl-panel-name" style="background:${st.color}18;border-top:2px solid ${st.color}60">
            <span class="vl-panel-cat" style="color:${st.color}">${st.category}</span>
            <span class="vl-panel-title">${st.name}</span>
          </div>
        </div>`;
    }).join('');

    const dots = STATIONS.map((st, i) =>
      `<button class="vl-dot" data-idx="${i}"
         style="border-color:${st.color}" title="${st.name}"
         onclick="OmicsLab.VirtualLab.goTo(${i})"></button>`
    ).join('');

    return { panels, dots };
  }

  /* ── Init ── */
  function init() {
    const container = document.getElementById('virtual-lab-content');
    if (!container || container.querySelector('.vl-page')) return;

    const { panels, dots } = _buildPanorama();

    container.innerHTML = `
      <div class="vl-page">
        <div class="vl-header">
          <h1 class="vl-title">360° Virtual Genomics Laboratory</h1>
          <p class="vl-subtitle">
            You are standing inside the lab. Drag left or right to look around.
            Click any instrument to learn how it is used in African genomics.
          </p>
        </div>

        <div class="vl-workspace">
          <!-- Panoramic room viewport -->
          <div class="vl-room" id="vl-room">
            <div class="vl-drag-hint" id="vl-hint">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 8h4a2 2 0 0 1 2 2v0a2 2 0 0 1-2 2h-1"/>
                <path d="M18 12l-3 6-3-6"/>
                <path d="M6 8H2a2 2 0 0 0-2 2v0a2 2 0 0 0 2 2h1"/>
                <path d="M6 12l3 6 3-6"/>
              </svg>
              Drag to look around the lab
            </div>

            <div class="vl-scene-wrap" id="vl-scene-wrap">
              <div class="vl-scene" id="vl-scene">${panels}</div>
            </div>

            <div class="vl-room-nav">
              <button class="vl-nav-btn" onclick="OmicsLab.VirtualLab.rotate(-1)" title="Look left">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
              </button>
              <div class="vl-dots" id="vl-dots">${dots}</div>
              <button class="vl-nav-btn" onclick="OmicsLab.VirtualLab.rotate(1)" title="Look right">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            </div>

            <div class="vl-station-counter" id="vl-counter">
              ${STATIONS.map((st,i) => `
                <button class="vl-counter-item" onclick="OmicsLab.VirtualLab.goTo(${i})"
                  style="border-left:3px solid ${st.color}">
                  <span class="vl-counter-num" style="color:${st.color}">${String(i+1).padStart(2,'0')}</span>
                  <span class="vl-counter-name">${st.name}</span>
                </button>`).join('')}
            </div>
          </div>

          <!-- Info panel -->
          <div class="vl-info-panel" id="vl-info">
            <div class="vl-info-empty">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#3fb950" stroke-width="1.2">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <p>Click any instrument to see its full specifications and role in African genomics.</p>
            </div>
          </div>
        </div>
      </div>
    `;

    _sceneEl = document.getElementById('vl-scene');
    _infoEl  = document.getElementById('vl-info');
    const room = document.getElementById('vl-room');

    /* ── Pointer drag (looking around) ── */
    room.addEventListener('pointerdown', e => {
      if (e.target.closest('button') || e.target.closest('.vl-station-counter')) return;
      _dragging = true;
      _lastX = e.clientX;
      _lastY = e.clientY;
      room.style.cursor = 'grabbing';
      e.currentTarget.setPointerCapture(e.pointerId);
      _stopIdle();
      /* Hide drag hint */
      const hint = document.getElementById('vl-hint');
      if (hint) hint.style.opacity = '0';
    });

    room.addEventListener('pointermove', e => {
      if (!_dragging) return;
      const dx = e.clientX - _lastX;
      const dy = e.clientY - _lastY;
      _lastX = e.clientX;
      _lastY = e.clientY;
      /* Drag RIGHT = look right = scene rotates left = angle decreases */
      _targetAngle -= dx * 0.35;
      _targetTilt   = Math.max(-15, Math.min(8, _targetTilt + dy * 0.15));
      _startTick();
    });

    room.addEventListener('pointerup', () => {
      _dragging = false;
      room.style.cursor = 'grab';
      _startIdleAfterDelay();
    });
    room.addEventListener('pointerleave', () => {
      if (_dragging) {
        _dragging = false;
        room.style.cursor = 'grab';
      }
    });

    /* Mouse wheel = look left/right */
    room.addEventListener('wheel', e => {
      e.preventDefault();
      _targetAngle -= e.deltaY * 0.25;
      _startTick();
      _stopIdle();
      _startIdleAfterDelay();
    }, { passive: false });

    /* Keyboard navigation */
    document.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft')  { _targetAngle += STEP; _startTick(); }
      if (e.key === 'ArrowRight') { _targetAngle -= STEP; _startTick(); }
      if (e.key === 'Escape')     closeInfo();
    });

    /* Start with a slow auto-tour */
    _startIdle();
    _syncDots();
  }

  let _idleDelay = null;

  function _startIdle() {
    _stopIdle();
    _idleTimer = setInterval(() => {
      if (!_dragging && !_activeStation) {
        _targetAngle -= STEP;
        _startTick();
      }
    }, 5000);
  }

  function _stopIdle() {
    if (_idleTimer) { clearInterval(_idleTimer); _idleTimer = null; }
    if (_idleDelay) { clearTimeout(_idleDelay);  _idleDelay = null; }
  }

  function _startIdleAfterDelay() {
    _stopIdle();
    _idleDelay = setTimeout(_startIdle, 8000);
  }

  return { init, select, goTo, rotate, closeInfo };

})();
