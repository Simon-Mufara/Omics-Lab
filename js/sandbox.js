/* ═══════════════════════════════════════════════════════════════
   OmicsLab — Pipeline Sandbox (Visual Builder)
   Drag-and-drop bioinformatics tool nodes on a canvas
   Connect tools with arrows, validate compatibility
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.Sandbox = (function() {

  const TOOLS = [
    { id:'fastqc',    label:'FastQC',          cat:'QC',          input:'FASTQ',   output:'HTML/QC',     color:'#58a6ff', desc:'Per-base quality, adapter content, GC distribution' },
    { id:'trimmomatic',label:'Trimmomatic',    cat:'QC',          input:'FASTQ',   output:'FASTQ(trim)', color:'#58a6ff', desc:'Adapter removal and quality trimming of paired-end reads' },
    { id:'bwamem2',   label:'BWA-MEM2',        cat:'Alignment',   input:'FASTQ',   output:'BAM',         color:'#00C4A0', desc:'Short-read DNA alignment to reference genome' },
    { id:'star',      label:'STAR',            cat:'Alignment',   input:'FASTQ',   output:'BAM',         color:'#00C4A0', desc:'RNA-seq splice-aware alignment; generates junction files' },
    { id:'hisat2',    label:'HISAT2',          cat:'Alignment',   input:'FASTQ',   output:'BAM',         color:'#00C4A0', desc:'Fast splice-aware RNA-seq alignment with graph-based index' },
    { id:'samtools',  label:'SAMtools',        cat:'Processing',  input:'BAM',     output:'BAM(sort)',   color:'#e3b341', desc:'Sort, index, filter, and convert SAM/BAM/CRAM files' },
    { id:'picard',    label:'Picard MarkDups', cat:'Processing',  input:'BAM(sort)',output:'BAM(dedup)',  color:'#e3b341', desc:'Mark or remove PCR duplicates; collect library metrics' },
    { id:'gatk',      label:'GATK HaplotypeCaller',cat:'Variant', input:'BAM(dedup)',output:'GVCF',      color:'#a371f7', desc:'Germline SNP/indel calling with local re-assembly' },
    { id:'deepvariant',label:'DeepVariant',    cat:'Variant',     input:'BAM(dedup)',output:'VCF',       color:'#a371f7', desc:'CNN-based variant caller; often best accuracy for substitutions' },
    { id:'annovar',   label:'ANNOVAR',         cat:'Annotation',  input:'VCF',     output:'TSV(ann)',    color:'#ff7b72', desc:'Annotate with ClinVar, gnomAD, OMIM, splicing predictions' },
    { id:'vep',       label:'VEP (Ensembl)',   cat:'Annotation',  input:'VCF',     output:'TSV(ann)',    color:'#ff7b72', desc:'Variant Effect Predictor; regulatory and protein-level effects' },
    { id:'featurecounts',label:'featureCounts',cat:'Counting',    input:'BAM',     output:'Count matrix',color:'#e3b341', desc:'Count reads per gene from aligned BAM using GTF annotation' },
    { id:'deseq2',    label:'DESeq2',          cat:'DE Analysis', input:'Count matrix',output:'DE results',color:'#ff7b72',desc:'Negative binomial model for differential gene expression' },
    { id:'macs3',     label:'MACS3',           cat:'Peak Calling',input:'BAM',     output:'BED(peaks)', color:'#a371f7', desc:'Peak calling for ChIP-seq and ATAC-seq enriched regions' },
    { id:'dada2',     label:'DADA2',           cat:'Metagenomics',input:'FASTQ',   output:'ASV table',  color:'#00C4A0', desc:'Amplicon error correction and ASV generation for 16S data' },
    { id:'kraken2',   label:'Kraken2',         cat:'Metagenomics',input:'FASTQ',   output:'Classification',color:'#00C4A0',desc:'Taxonomic classification of shotgun metagenomic reads' },
    { id:'nextclade', label:'Nextclade',       cat:'Virology',    input:'FASTA',   output:'Clade calls', color:'#58a6ff', desc:'Clade assignment and mutation calling for viral genomes' },
    { id:'medaka',    label:'Medaka',          cat:'Virology',    input:'FASTQ(ont)',output:'VCF',       color:'#58a6ff', desc:'Oxford Nanopore variant calling pipeline' },
  ];

  const CAT_COLORS = {
    'QC':'#58a6ff','Alignment':'#00C4A0','Processing':'#e3b341',
    'Variant':'#a371f7','Annotation':'#ff7b72','Counting':'#e3b341',
    'DE Analysis':'#ff7b72','Peak Calling':'#a371f7','Metagenomics':'#00C4A0','Virology':'#58a6ff'
  };

  let _nodes = [];    /* { id, toolId, x, y, label, input, output, color } */
  let _edges = [];    /* { from, to } */
  let _dragging = null;
  let _connecting = null;
  let _nodeIdCounter = 0;
  let _svgEl = null;
  let _canvasEl = null;

  function init() {
    const container = document.getElementById('sandbox-container');
    if (!container || container.dataset.init) return;
    container.dataset.init = '1';
    container.innerHTML = _buildUI();
    _svgEl = container.querySelector('.sb-svg');
    _canvasEl = container.querySelector('.sb-canvas');
    _attachToolbarEvents();
    _attachCanvasEvents();
  }

  function _buildUI() {
    const toolItems = TOOLS.map(t => `
      <div class="sb-tool-item" data-tool="${t.id}" draggable="true" title="${t.desc}">
        <span class="sb-tool-dot" style="background:${t.color}"></span>
        <span class="sb-tool-label">${t.label}</span>
        <span class="sb-tool-io">${t.input} → ${t.output}</span>
      </div>`).join('');

    const cats = [...new Set(TOOLS.map(t=>t.cat))];
    const catFilters = cats.map(c => `<button class="sb-cat-btn" data-cat="${c}" style="--cc:${CAT_COLORS[c]||'#aaa'}">${c}</button>`).join('');

    return `
      <div class="sb-layout">
        <aside class="sb-sidebar">
          <div class="sb-sidebar-title">Tools</div>
          <div class="sb-cat-filters">${catFilters}</div>
          <div class="sb-tool-list" id="sb-tool-list">${toolItems}</div>
        </aside>
        <div class="sb-canvas-wrap">
          <div class="sb-toolbar">
            <button class="sb-toolbar-btn" onclick="OmicsLab.Sandbox.validate()" title="Validate pipeline">Validate</button>
            <button class="sb-toolbar-btn" onclick="OmicsLab.Sandbox.clearCanvas()" title="Clear all nodes">Clear</button>
            <div class="sb-toolbar-hint">Drag tools from the left panel onto the canvas. Click a node output to start a connection, then click another node input.</div>
          </div>
          <div class="sb-canvas-area">
            <svg class="sb-svg" id="sb-svg"></svg>
            <div class="sb-canvas" id="sb-canvas" ondragover="event.preventDefault()" ondrop="OmicsLab.Sandbox._onDrop(event)">
              <!-- Nodes rendered here -->
            </div>
          </div>
          <div class="sb-validation-output" id="sb-validation-output"></div>
        </div>
      </div>`;
  }

  function _attachToolbarEvents() {
    const container = document.getElementById('sandbox-container');
    if (!container) return;

    /* Tool drag start */
    container.querySelectorAll('.sb-tool-item').forEach(el => {
      el.addEventListener('dragstart', e => {
        e.dataTransfer.setData('toolId', el.dataset.tool);
        e.dataTransfer.effectAllowed = 'copy';
      });
    });

    /* Category filters */
    container.querySelectorAll('.sb-cat-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const cat = btn.dataset.cat;
        const active = btn.classList.toggle('active');
        container.querySelectorAll('.sb-tool-item').forEach(item => {
          const tool = TOOLS.find(t=>t.id===item.dataset.tool);
          if (!active) { item.style.display = ''; return; }
          item.style.display = (tool && tool.cat === cat) ? '' : 'none';
        });
      });
    });
  }

  function _onDrop(e) {
    e.preventDefault();
    const toolId = e.dataTransfer.getData('toolId');
    if (!toolId) return;
    const tool = TOOLS.find(t=>t.id===toolId);
    if (!tool) return;

    const canvas = document.getElementById('sb-canvas');
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left - 60;
    const y = e.clientY - rect.top  - 25;

    _addNode(tool, Math.max(0,x), Math.max(0,y));
  }

  function _addNode(tool, x, y) {
    const nodeId = 'n' + (++_nodeIdCounter);
    _nodes.push({ id:nodeId, toolId:tool.id, x, y, label:tool.label, input:tool.input, output:tool.output, color:tool.color });
    _renderNodes();
    _renderEdges();
  }

  function _renderNodes() {
    const canvas = document.getElementById('sb-canvas');
    if (!canvas) return;
    /* Remove existing node els */
    canvas.querySelectorAll('.sb-node').forEach(el => el.remove());

    _nodes.forEach(node => {
      const el = document.createElement('div');
      el.className = 'sb-node';
      el.dataset.nid = node.id;
      el.style.left = node.x + 'px';
      el.style.top  = node.y + 'px';
      el.style.borderColor = node.color;
      el.innerHTML = `
        <div class="sb-node-head" style="background:${node.color}22">
          <span class="sb-node-dot" style="background:${node.color}"></span>
          <span class="sb-node-label">${node.label}</span>
          <button class="sb-node-del" onclick="OmicsLab.Sandbox.deleteNode('${node.id}')" title="Remove">×</button>
        </div>
        <div class="sb-node-io">
          <span class="sb-node-in"  data-nid="${node.id}" data-port="in"  onclick="OmicsLab.Sandbox._portClick('${node.id}','in')">${node.input}</span>
          <span class="sb-node-arrow">→</span>
          <span class="sb-node-out" data-nid="${node.id}" data-port="out" onclick="OmicsLab.Sandbox._portClick('${node.id}','out')">${node.output}</span>
        </div>`;

      /* Drag to reposition */
      let ox=0, oy=0, startX=0, startY=0;
      el.querySelector('.sb-node-head').addEventListener('mousedown', me => {
        if (me.target.classList.contains('sb-node-del')) return;
        me.preventDefault();
        startX = me.clientX; startY = me.clientY;
        ox = node.x; oy = node.y;
        const onMove = mv => {
          node.x = ox + mv.clientX - startX;
          node.y = oy + mv.clientY - startY;
          el.style.left = node.x + 'px';
          el.style.top  = node.y + 'px';
          _renderEdges();
        };
        const onUp = () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
      });

      canvas.appendChild(el);
    });
  }

  function _portClick(nid, port) {
    if (!_connecting) {
      if (port === 'out') { _connecting = { fromId: nid }; _highlightConnecting(nid); }
      return;
    }
    if (port === 'in' && _connecting.fromId !== nid) {
      _edges.push({ from: _connecting.fromId, to: nid });
      _connecting = null;
      _clearHighlight();
      _renderEdges();
    } else {
      _connecting = null;
      _clearHighlight();
    }
  }

  function _highlightConnecting(nid) {
    document.querySelectorAll('.sb-node').forEach(el => {
      el.classList.toggle('sb-node-connecting', el.dataset.nid === nid);
    });
  }

  function _clearHighlight() {
    document.querySelectorAll('.sb-node').forEach(el => el.classList.remove('sb-node-connecting'));
  }

  function _attachCanvasEvents() {
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') { _connecting = null; _clearHighlight(); }
    });
  }

  function _renderEdges() {
    const svg = document.getElementById('sb-svg');
    const canvas = document.getElementById('sb-canvas');
    if (!svg || !canvas) return;
    const cRect = canvas.getBoundingClientRect();
    svg.setAttribute('width', canvas.offsetWidth);
    svg.setAttribute('height', canvas.offsetHeight);
    svg.innerHTML = '';

    _edges.forEach((edge, i) => {
      const fromNode = _nodes.find(n=>n.id===edge.from);
      const toNode   = _nodes.find(n=>n.id===edge.to);
      if (!fromNode || !toNode) return;

      /* Centre-right of source node, centre-left of target node */
      const NODE_W = 160, NODE_H = 58;
      const x1 = fromNode.x + NODE_W;
      const y1 = fromNode.y + NODE_H / 2;
      const x2 = toNode.x;
      const y2 = toNode.y + NODE_H / 2;
      const cx1 = x1 + 40, cx2 = x2 - 40;

      const path = document.createElementNS('http://www.w3.org/2000/svg','path');
      path.setAttribute('d',`M${x1},${y1} C${cx1},${y1} ${cx2},${y2} ${x2},${y2}`);
      path.setAttribute('fill','none');
      path.setAttribute('stroke', fromNode.color || '#00C4A0');
      path.setAttribute('stroke-width','2');
      path.setAttribute('marker-end','url(#arrow)');

      /* Arrow marker */
      if (i === 0) {
        const defs = document.createElementNS('http://www.w3.org/2000/svg','defs');
        const marker = document.createElementNS('http://www.w3.org/2000/svg','marker');
        marker.setAttribute('id','arrow');
        marker.setAttribute('markerWidth','8');
        marker.setAttribute('markerHeight','8');
        marker.setAttribute('refX','6');
        marker.setAttribute('refY','3');
        marker.setAttribute('orient','auto');
        const arrowPath = document.createElementNS('http://www.w3.org/2000/svg','path');
        arrowPath.setAttribute('d','M0,0 L0,6 L9,3 z');
        arrowPath.setAttribute('fill','#00C4A0');
        marker.appendChild(arrowPath);
        defs.appendChild(marker);
        svg.appendChild(defs);
      }
      svg.appendChild(path);
    });
  }

  function deleteNode(nid) {
    _nodes = _nodes.filter(n=>n.id!==nid);
    _edges = _edges.filter(e=>e.from!==nid&&e.to!==nid);
    _renderNodes();
    _renderEdges();
  }

  function clearCanvas() {
    _nodes = []; _edges = []; _connecting = null; _nodeIdCounter = 0;
    _renderNodes(); _renderEdges();
    const out = document.getElementById('sb-validation-output');
    if (out) out.innerHTML = '';
  }

  function validate() {
    const out = document.getElementById('sb-validation-output');
    if (!out) return;
    if (_nodes.length === 0) { out.innerHTML = '<div class="sb-val-warn">Add at least one tool to the canvas.</div>'; return; }

    const issues = [];
    const successes = [];

    /* Check edge compatibility: source output must match target input (case-insensitive prefix) */
    _edges.forEach(edge => {
      const fromNode = _nodes.find(n=>n.id===edge.from);
      const toNode   = _nodes.find(n=>n.id===edge.to);
      if (!fromNode || !toNode) return;
      const outLower = fromNode.output.toLowerCase();
      const inLower  = toNode.input.toLowerCase();
      const compatible = outLower.includes(inLower.split('(')[0]) || inLower.includes(outLower.split('(')[0]);
      if (!compatible) {
        issues.push(`<li><strong>${fromNode.label}</strong> outputs <code>${fromNode.output}</code> but <strong>${toNode.label}</strong> expects <code>${toNode.input}</code> — incompatible connection.</li>`);
      } else {
        successes.push(`<li>${fromNode.label} → ${toNode.label} (compatible)</li>`);
      }
    });

    /* Check for nodes with no connections */
    _nodes.forEach(node => {
      const hasIn  = _edges.some(e=>e.to===node.id);
      const hasOut = _edges.some(e=>e.from===node.id);
      if (!hasIn && !hasOut && _nodes.length > 1) {
        issues.push(`<li><strong>${node.label}</strong> is not connected to any other tool.</li>`);
      }
    });

    /* Check for disconnected start node that should have input */
    const startNodes = _nodes.filter(n => !_edges.some(e=>e.to===n.id));
    if (startNodes.length > 1) {
      issues.push(`<li>Multiple pipeline start points detected — ${startNodes.map(n=>n.label).join(', ')}. A valid pipeline has a single input source.</li>`);
    }

    const html = issues.length
      ? `<div class="sb-val-issues"><strong>Issues found:</strong><ul>${issues.join('')}</ul></div>`
      : `<div class="sb-val-ok"><strong>Pipeline Valid!</strong> All connections are compatible. <ul>${successes.join('')}</ul></div>`;

    out.innerHTML = html;
  }

  return { init, deleteNode, clearCanvas, validate, _portClick, _onDrop };
})();
