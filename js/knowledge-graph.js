/* ═══════════════════════════════════════════════════════════════
   OmicsLab — Africa Genomics Knowledge Graph (Prompt 38)
   ─ Force-directed SVG graph of diseases, genes, tools, populations
   ─ Click to explore, path-finding, search, export
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.KnowledgeGraph = (function () {

  /* ─── Graph data ─── */
  const NODES = [
    /* Diseases */
    { id:'malaria',   label:'Malaria',            type:'disease',    color:'#ff6b6b', desc:'Plasmodium falciparum infection — #1 infectious disease killer of children in Africa.' },
    { id:'tb',        label:'Tuberculosis',        type:'disease',    color:'#ff6b6b', desc:'Mycobacterium tuberculosis — highest burden in sub-Saharan Africa; MDR-TB rising.' },
    { id:'hiv',       label:'HIV/AIDS',            type:'disease',    color:'#ff6b6b', desc:'Human Immunodeficiency Virus — ~25M people living with HIV in Africa.' },
    { id:'scd',       label:'Sickle Cell Disease', type:'disease',    color:'#ff6b6b', desc:'HBB p.Glu7Val — ~300,000 affected births/year; 75% in Africa.' },
    { id:'g6pd_dis',  label:'G6PD Deficiency',     type:'disease',    color:'#ff6b6b', desc:'X-linked enzyme deficiency — haemolytic anaemia on oxidative stress; protects against malaria.' },
    { id:'ckd',       label:'Chronic Kidney Dis.', type:'disease',    color:'#ff6b6b', desc:'APOL1 G1/G2 variants confer 3–29× risk in individuals of African ancestry.' },
    { id:'covid19',   label:'COVID-19',            type:'disease',    color:'#ff6b6b', desc:'SARS-CoV-2 — Africa hosted the Beta (B.1.351) and C.1 variants.' },
    { id:'mpox',      label:'Mpox',                type:'disease',    color:'#ff6b6b', desc:'Monkeypox virus — endemic in Central/West Africa; Clade I outbreak in DRC 2023–2024.' },
    { id:'cholera',   label:'Cholera',             type:'disease',    color:'#ff6b6b', desc:'Vibrio cholerae O1 — 2022–2024 global surge driven by East/Southern Africa outbreaks.' },
    { id:'ebola',     label:'Ebola',               type:'disease',    color:'#ff6b6b', desc:'EBOV — largest epidemic: West Africa 2014-2016 (28,600 cases).' },
    /* Genes */
    { id:'hbb',       label:'HBB',                 type:'gene',       color:'#3fb950', desc:'Haemoglobin subunit beta — HBB c.20A>T causes sickle cell anaemia. Chr 11p15.' },
    { id:'g6pd',      label:'G6PD',                type:'gene',       color:'#3fb950', desc:'Glucose-6-phosphate dehydrogenase — X-linked. 202A (African) and 376G variants most common in Africa.' },
    { id:'apol1',     label:'APOL1',               type:'gene',       color:'#3fb950', desc:'Apolipoprotein L1 — G1 (S342G+I384M) and G2 (del388-389) confer both CKD risk and trypanosome resistance.' },
    { id:'kelch13',   label:'kelch13',             type:'gene',       color:'#3fb950', desc:'P. falciparum kelch13 — R539T, Y493H, M476I variants linked to artemisinin partial resistance.' },
    { id:'rpob',      label:'rpoB',                type:'gene',       color:'#3fb950', desc:'MTB RNA polymerase beta — >95% of rifampicin resistance in MTB is rpoB mutation.' },
    { id:'ccr5',      label:'CCR5',                type:'gene',       color:'#3fb950', desc:'C-C chemokine receptor 5 — HIV co-receptor. CCR5Δ32 protective allele nearly absent in African populations.' },
    { id:'hlab',      label:'HLA-B*57:01',         type:'gene',       color:'#3fb950', desc:'HLA allele — abacavir hypersensitivity. Pre-treatment screening now required by WHO HIV guidelines.' },
    { id:'cyp2d6',    label:'CYP2D6',              type:'gene',       color:'#3fb950', desc:'Cytochrome P450 — drug metaboliser. Ultra-rapid (*17) and poor metaboliser variants differ in Africa vs Europe.' },
    { id:'tlr4',      label:'TLR4',                type:'gene',       color:'#3fb950', desc:'Toll-like receptor 4 — Asp299Gly at ~10% in West/East Africa; alters sepsis/malaria susceptibility.' },
    { id:'brca1',     label:'BRCA1',               type:'gene',       color:'#3fb950', desc:'Breast cancer susceptibility — South African Afrikaner founder mutation c.1374delC (185delAG equivalent).' },
    /* Tools */
    { id:'gatk',      label:'GATK',                type:'tool',       color:'#58a6ff', desc:'Genome Analysis Toolkit — gold standard for germline SNP/indel calling. HaplotypeCaller used in H3Africa.' },
    { id:'bwa',       label:'BWA-MEM2',            type:'tool',       color:'#58a6ff', desc:'Burrows-Wheeler Aligner — read mapping. BWA-MEM2 is the current recommended version.' },
    { id:'deseq2',    label:'DESeq2',              type:'tool',       color:'#58a6ff', desc:'Differential expression — negative binomial model, shrinkage estimation. Standard for RNA-seq in Africa.' },
    { id:'kraken2',   label:'Kraken2',             type:'tool',       color:'#58a6ff', desc:'Metagenomics k-mer classifier — real-time pathogen detection in clinical and environmental samples.' },
    { id:'iqtree2',   label:'IQ-TREE 2',           type:'tool',       color:'#58a6ff', desc:'Maximum-likelihood phylogenomics — used in Africa SARS-CoV-2, Ebola, and MTB outbreak reconstruction.' },
    { id:'plink2',    label:'PLINK 2',             type:'tool',       color:'#58a6ff', desc:'GWAS analysis suite — QC, PCA, association testing. Used in AWI-Gen, H3Africa GWAS studies.' },
    { id:'nextflow',  label:'Nextflow',            type:'tool',       color:'#58a6ff', desc:'Workflow manager — H3ABioNet standard pipeline framework for reproducible African genomics.' },
    { id:'medaka',    label:'Medaka',              type:'tool',       color:'#58a6ff', desc:'Nanopore variant calling — used in African field sequencing labs (MinION in field hospitals).' },
    /* Populations */
    { id:'yoruba',    label:'Yoruba (YRI)',         type:'population', color:'#f97316', desc:'West African population — 99 samples in 1000 Genomes. Highest haplotype diversity globally.' },
    { id:'bantu',     label:'Bantu',               type:'population', color:'#f97316', desc:'Major African language family — ~450M speakers across sub-Saharan Africa; H3Africa focus.' },
    { id:'nilotic',   label:'Nilotic',             type:'population', color:'#f97316', desc:'East African pastoralist populations (Luo, Dinka, Maasai) — distinct population structure.' },
    { id:'khoisan',   label:'Khoisan',             type:'population', color:'#f97316', desc:'Southern African hunter-gatherer populations — deepest divergence in human evolutionary tree.' },
    { id:'hausa',     label:'Hausa-Fulani',        type:'population', color:'#f97316', desc:'Northern Nigeria/Niger — H3Africa cardiometabolic disease studies (THIN, H3Africa WP4).' },
    /* Countries / regions */
    { id:'nigeria',   label:'Nigeria',             type:'country',    color:'#bc8cff', desc:'Most populous African nation — H3Africa, Nigeria 100K Genome Project, NCDC pathogen genomics.' },
    { id:'southafrica', label:'South Africa',      type:'country',    color:'#bc8cff', desc:'Hub for African genomics — UCT, KRISP, NICD, WITS Health Consortium, AWI-Gen.' },
    { id:'kenya',     label:'Kenya',               type:'country',    color:'#bc8cff', desc:'KEMRI-Wellcome, ILRI, ICIPE — malaria, HIV, and pathogen surveillance genomics hub.' },
    { id:'ghana',     label:'Ghana',               type:'country',    color:'#bc8cff', desc:'WACCBIP, Noguchi Memorial — H3ABioNet training node, malaria genomics, SCD programs.' },
    { id:'ethiopia',  label:'Ethiopia',            type:'country',    color:'#bc8cff', desc:'AHRI, Armauer Hansen — TB genomics, Drosophila population genomics, malaria hotspot tracking.' },
  ];

  const EDGES = [
    /* Disease ↔ Gene associations */
    { s:'malaria', t:'hbb',     rel:'protective allele' },
    { s:'malaria', t:'g6pd',    rel:'protective allele' },
    { s:'malaria', t:'kelch13', rel:'drug resistance gene' },
    { s:'malaria', t:'tlr4',    rel:'susceptibility gene' },
    { s:'scd',     t:'hbb',     rel:'causative mutation' },
    { s:'g6pd_dis',t:'g6pd',   rel:'causative mutation' },
    { s:'hiv',     t:'ccr5',    rel:'co-receptor' },
    { s:'hiv',     t:'hlab',    rel:'drug hypersensitivity' },
    { s:'hiv',     t:'cyp2d6',  rel:'drug metabolism' },
    { s:'tb',      t:'rpob',    rel:'drug resistance gene' },
    { s:'ckd',     t:'apol1',   rel:'risk gene' },
    { s:'ckd',     t:'hiv',     rel:'HIV-associated nephropathy' },
    /* Gene ↔ Gene interactions */
    { s:'hbb',     t:'g6pd',    rel:'co-inheritance' },
    { s:'apol1',   t:'ccr5',    rel:'same chromosome 22' },
    /* Disease ↔ Tool */
    { s:'malaria', t:'kraken2', rel:'detected by' },
    { s:'malaria', t:'iqtree2', rel:'phylogenomics' },
    { s:'tb',      t:'gatk',    rel:'variant calling' },
    { s:'tb',      t:'kraken2', rel:'metagenomics' },
    { s:'covid19', t:'iqtree2', rel:'outbreak reconstruction' },
    { s:'covid19', t:'medaka',  rel:'Nanopore analysis' },
    { s:'scd',     t:'gatk',    rel:'variant calling' },
    /* Tool ↔ Tool workflows */
    { s:'bwa',     t:'gatk',    rel:'upstream pipeline' },
    { s:'bwa',     t:'nextflow',rel:'orchestrated by' },
    { s:'gatk',    t:'plink2',  rel:'output → GWAS input' },
    { s:'nextflow',t:'kraken2', rel:'orchestrates' },
    /* Population ↔ Country */
    { s:'yoruba',  t:'nigeria', rel:'origin' },
    { s:'hausa',   t:'nigeria', rel:'origin' },
    { s:'bantu',   t:'kenya',   rel:'major group' },
    { s:'bantu',   t:'southafrica', rel:'major group' },
    { s:'nilotic', t:'kenya',   rel:'present in' },
    { s:'nilotic', t:'ethiopia',rel:'present in' },
    { s:'khoisan', t:'southafrica', rel:'origin' },
    /* Population ↔ Disease */
    { s:'yoruba',  t:'scd',     rel:'high prevalence' },
    { s:'bantu',   t:'malaria', rel:'endemic region' },
    { s:'yoruba',  t:'apol1',   rel:'G1/G2 allele freq ~20%' },
    /* Country ↔ Disease */
    { s:'nigeria', t:'scd',     rel:'highest burden globally' },
    { s:'southafrica', t:'tb',  rel:'highest MDR-TB burden' },
    { s:'southafrica', t:'hiv', rel:'highest absolute burden' },
    { s:'kenya',   t:'malaria', rel:'endemic' },
    { s:'ethiopia',t:'tb',      rel:'high burden' },
  ];

  /* ─── State ─── */
  let _svg = null, _g = null;
  let _nodes = [], _edges = [];
  let _selectedId = null;
  let _search = '';
  let _zoom = 1, _panX = 0, _panY = 0;
  let _dragging = null, _dragStart = null;
  let _W = 800, _H = 580;
  let _simRunning = false;
  let _animFrame = null;

  /* ─── Init force layout ─── */
  function _initSimulation() {
    _nodes = NODES.map(n => ({
      ...n,
      x: _W/2 + (Math.random()-.5)*300,
      y: _H/2 + (Math.random()-.5)*260,
      vx: 0, vy: 0, fx: null, fy: null,
    }));
    _edges = EDGES.map(e => ({ ...e }));
  }

  const REPULSION = 3200;
  const ATTRACTION = 0.018;
  const DAMPING = 0.82;
  const GRAVITY = 0.025;

  function _tick() {
    /* Repulsion between nodes */
    for (let i = 0; i < _nodes.length; i++) {
      const a = _nodes[i];
      if (a.fx !== null) { a.x = a.fx; a.y = a.fy; continue; }
      for (let j = i+1; j < _nodes.length; j++) {
        const b = _nodes[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const d2 = dx*dx + dy*dy + 0.01;
        const f = REPULSION / d2;
        a.vx += f*dx/Math.sqrt(d2); a.vy += f*dy/Math.sqrt(d2);
        b.vx -= f*dx/Math.sqrt(d2); b.vy -= f*dy/Math.sqrt(d2);
      }
    }
    /* Attraction along edges */
    _edges.forEach(e => {
      const a = _nodes.find(n => n.id === e.s);
      const b = _nodes.find(n => n.id === e.t);
      if (!a || !b) return;
      const dx = b.x - a.x, dy = b.y - a.y;
      const d = Math.sqrt(dx*dx + dy*dy) + 0.01;
      const f = ATTRACTION * d;
      a.vx += f*dx/d; a.vy += f*dy/d;
      b.vx -= f*dx/d; b.vy -= f*dy/d;
    });
    /* Gravity toward centre */
    _nodes.forEach(n => {
      if (n.fx !== null) return;
      n.vx += (_W/2 - n.x) * GRAVITY;
      n.vy += (_H/2 - n.y) * GRAVITY;
      n.vx *= DAMPING; n.vy *= DAMPING;
      n.x = Math.max(20, Math.min(_W-20, n.x + n.vx));
      n.y = Math.max(20, Math.min(_H-20, n.y + n.vy));
    });
  }

  function _render() {
    if (!_svg) return;
    const lowE = _search ? _edges.filter(e => {
      const sa = _matchNode(e.s) || _matchNode(e.t);
      return sa;
    }) : _edges;

    _g.querySelector('.kg-edges').innerHTML = lowE.map(e => {
      const a = _nodes.find(n => n.id === e.s);
      const b = _nodes.find(n => n.id === e.t);
      if (!a || !b) return '';
      const active = _selectedId && (e.s === _selectedId || e.t === _selectedId);
      return `<line class="kg-edge${active?' kg-edge-active':''}"
        x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}"
        title="${_esc(e.rel)}"/>`;
    }).join('');

    _g.querySelector('.kg-nodes').innerHTML = _nodes.map(n => {
      const match = _search ? _matchNode(n.id) : true;
      const sel = n.id === _selectedId;
      const r = 10;
      return `<g class="kg-node${sel?' kg-node-sel':''}" data-id="${n.id}"
        transform="translate(${n.x},${n.y})"
        onclick="OmicsLab.KnowledgeGraph._select('${n.id}')"
        style="opacity:${match?1:0.2}">
        <circle r="${r}" fill="${n.color}" fill-opacity="${sel?.95:.7}" stroke="${sel?'#fff':n.color}" stroke-width="${sel?2:1}"/>
        <text class="kg-node-label" y="${r+12}" text-anchor="middle" font-size="10">${_esc(n.label)}</text>
      </g>`;
    }).join('');
  }

  function _matchNode(id) {
    if (!_search) return true;
    const n = NODES.find(nd => nd.id === id);
    if (!n) return false;
    const q = _search.toLowerCase();
    return n.label.toLowerCase().includes(q) || n.type.includes(q) || n.desc.toLowerCase().includes(q);
  }

  function _select(id) {
    _selectedId = _selectedId === id ? null : id;
    _render();
    _renderDetail(id);
  }

  function _renderDetail(id) {
    const el = document.getElementById('kg-detail');
    if (!el) return;
    if (!id || _selectedId !== id) { el.innerHTML = '<div class="kg-detail-empty">Click a node to explore</div>'; return; }
    const n = NODES.find(nd => nd.id === id);
    if (!n) return;
    const connected = _edges.filter(e => e.s === id || e.t === id).map(e => {
      const otherId = e.s === id ? e.t : e.s;
      const other = NODES.find(nd => nd.id === otherId);
      return { node: other, rel: e.rel, isOut: e.s === id };
    }).filter(c => c.node);

    const typeColor = { disease:'#ff6b6b', gene:'#3fb950', tool:'#58a6ff', population:'#f97316', country:'#bc8cff' };
    el.innerHTML = `
      <div class="kg-detail-card">
        <div class="kg-detail-header">
          <span class="kg-detail-name" style="color:${n.color}">${_esc(n.label)}</span>
          <span class="kg-detail-type" style="background:${n.color}22;color:${n.color}">${n.type}</span>
        </div>
        <div class="kg-detail-desc">${_esc(n.desc)}</div>
        ${_getNodePage(n) ? `<button class="btn btn-ghost btn-xs kg-detail-nav-btn" onclick="OmicsLab.Router?.navigate('${_getNodePage(n)}')" style="margin:.5rem 0;font-size:.75rem">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          Explore in ${_getNodePage(n).replace(/-/g, ' ')}
        </button>` : ''}
        ${connected.length ? `
          <div class="kg-detail-rels-title">Connections (${connected.length})</div>
          <div class="kg-detail-rels">
            ${connected.map(c => `
              <div class="kg-detail-rel" onclick="OmicsLab.KnowledgeGraph._select('${c.node.id}')">
                <span class="kg-rel-arrow">${c.isOut ? '→' : '←'}</span>
                <span class="kg-rel-label">${_esc(c.rel)}</span>
                <span class="kg-rel-node" style="color:${c.node.color}">${_esc(c.node.label)}</span>
              </div>`).join('')}
          </div>` : ''}
      </div>`;
  }

  /* ─── Zoom/pan ─── */
  function _zoom_in() { _zoom = Math.min(3, _zoom * 1.25); _applyTransform(); }
  function _zoom_out() { _zoom = Math.max(0.3, _zoom / 1.25); _applyTransform(); }
  function _zoom_reset() { _zoom = 1; _panX = 0; _panY = 0; _applyTransform(); }
  function _applyTransform() {
    if (_g) _g.setAttribute('transform', `translate(${_panX},${_panY}) scale(${_zoom})`);
  }

  /* ─── Export ─── */
  function _exportSVG() {
    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(_svg);
    const blob = new Blob([svgStr], { type:'image/svg+xml' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'omicslab-knowledge-graph.svg';
    a.click();
  }

  function _esc(s) { return String(s||'').replace(/[<>&"']/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&#39;'}[c])); }

  /* ─── Init ─── */
  function init() {
    const section = document.getElementById('knowledge-graph-section');
    if (!section || section.dataset.kgReady) return;
    section.dataset.kgReady = '1';

    section.innerHTML = `
      <div class="kg-wrap">
        <div class="kg-header">
          <div class="kg-header-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#bc8cff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M6.3 6.3a8 8 0 1 0 11.4 0 8 8 0 0 0-11.4 0"/></svg>
            Africa Genomics Knowledge Graph
          </div>
          <div class="kg-header-sub">Diseases · Genes · Tools · Populations · Countries — click any node to explore connections</div>
        </div>
        <div class="kg-controls">
          <div class="kg-search-wrap">
            <input class="kg-search" placeholder="Search nodes…" oninput="OmicsLab.KnowledgeGraph._onSearch(this.value)">
          </div>
          <div class="kg-legend">
            ${[['disease','#ff6b6b'],['gene','#3fb950'],['tool','#58a6ff'],['population','#f97316'],['country','#bc8cff']].map(([t,c]) =>
              `<span class="kg-legend-item"><span class="kg-legend-dot" style="background:${c}"></span>${t}</span>`).join('')}
          </div>
          <div class="kg-zoom-btns">
            <button class="kg-ctrl-btn" onclick="OmicsLab.KnowledgeGraph._zoom_in()">+</button>
            <button class="kg-ctrl-btn" onclick="OmicsLab.KnowledgeGraph._zoom_out()">−</button>
            <button class="kg-ctrl-btn" onclick="OmicsLab.KnowledgeGraph._zoom_reset()">1:1</button>
            <button class="kg-ctrl-btn" onclick="OmicsLab.KnowledgeGraph._exportSVG()">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            </button>
          </div>
        </div>
        <div class="kg-body">
          <div class="kg-canvas-wrap">
            <svg class="kg-svg" id="kg-svg" viewBox="0 0 ${_W} ${_H}">
              <g id="kg-g">
                <g class="kg-edges"></g>
                <g class="kg-nodes"></g>
              </g>
            </svg>
          </div>
          <div class="kg-sidebar">
            <div class="kg-detail" id="kg-detail">
              <div class="kg-detail-empty">Click a node to explore</div>
            </div>
            <div class="kg-stats">
              <div class="kg-stat">${NODES.length} nodes</div>
              <div class="kg-stat">${EDGES.length} edges</div>
              <div class="kg-stat">${[...new Set(NODES.map(n=>n.type))].length} types</div>
            </div>
          </div>
        </div>
      </div>`;

    _svg = document.getElementById('kg-svg');
    _g   = document.getElementById('kg-g');
    _initSimulation();

    /* Run simulation */
    let ticks = 0;
    _simRunning = true;
    function step() {
      if (ticks++ < 180) { _tick(); _tick(); }
      _render();
      if (_simRunning) _animFrame = requestAnimationFrame(step);
    }
    _animFrame = requestAnimationFrame(step);

    /* Pan support */
    let panning = false, px0 = 0, py0 = 0;
    _svg.addEventListener('mousedown', e => {
      if (e.target.closest('.kg-node')) return;
      panning = true; px0 = e.clientX - _panX; py0 = e.clientY - _panY;
    });
    document.addEventListener('mousemove', e => {
      if (!panning) return;
      _panX = e.clientX - px0; _panY = e.clientY - py0; _applyTransform();
    });
    document.addEventListener('mouseup', () => { panning = false; });
    _svg.addEventListener('wheel', e => {
      e.preventDefault();
      const factor = e.deltaY < 0 ? 1.12 : 0.89;
      _zoom = Math.max(0.3, Math.min(3, _zoom * factor));
      _applyTransform();
    }, { passive: false });
  }

  function _onSearch(v) {
    _search = v.trim();
    _render();
    /* Auto-select first match for node jump (Prompt 52) */
    if (_search.length >= 2) {
      const match = NODES.find(n => n.label.toLowerCase().includes(_search.toLowerCase()));
      if (match) { _selectedId = match.id; _renderDetail(match.id); }
    } else {
      document.getElementById('kg-detail').innerHTML = '<div class="kg-detail-empty">Click a node to explore</div>';
    }
  }

  /* ── Node → OmicsLab page link map (Prompt 52) ── */
  const NODE_PAGE_MAP = {
    /* Diseases → variant-atlas or clinical-decision */
    disease:    (n) => n.label.toLowerCase().includes('sickle') || n.label.toLowerCase().includes('malaria') || n.label.toLowerCase().includes('tb') ? 'variant-atlas' : 'clinical-decision',
    /* Genes → variant-atlas */
    gene:       () => 'variant-atlas',
    /* Tools → analysis */
    tool:       () => 'analysis',
    /* Populations → popstruct or one-health */
    population: () => 'popstruct',
    /* Countries → one-health */
    country:    () => 'one-health',
  };

  function _getNodePage(n) {
    const fn = NODE_PAGE_MAP[n.type];
    return fn ? fn(n) : null;
  }

  /* Cleanup on page leave */
  function destroy() {
    _simRunning = false;
    if (_animFrame) cancelAnimationFrame(_animFrame);
  }

  return { init, destroy, _select, _zoom_in, _zoom_out, _zoom_reset, _onSearch, _exportSVG };
})();
