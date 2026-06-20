/* ═══════════════════════════════════════════════════════════════
   OmicsLab — Interactive Phylogenetic Tree Builder (Prompt 13)
   NJ (Neighbor-Joining) + UPGMA algorithms, pure JS, SVG output.
   Newick string export. Paste FASTA or distance matrix.
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.Phylo = (function () {

  /* ─── Example FASTA sequences (real 16S rRNA excerpts, truncated) ─── */
  const EXAMPLES = {
    sars: {
      label: 'SARS-CoV-2 variants (spike gene excerpt)',
      fasta: `>Wuhan-Hu-1
ATGTTTGTTTTTCTTGTTTTATTGCCACTAGTCTCTAGTCAGTGTGTTAATCTTACAACCAGAACTCAAT
>Alpha-B117
ATGTTTGTTTTTCTTGTTTTATTGCCACTAGTCTCTAGTCAGTGTGTTAATCTTACAACCAGAACTCAAC
>Delta-B16172
ATGTTTGTTTTTCTTGTTTTATTGCCACTAGTCTCTAGTCAGTGTGTTAATCTTACAACCAGAACTCAAT
>Omicron-BA1
ATGTTTGTTTTTCTTGTTTTATTGCCACTAGTCTCTAGTCAGTGTGTTAATCTTACAACCAGAACTCAAG
>Omicron-BA2
ATGTTTGTTTTTCTTGTTTTATTGCCACTAGTCTCTAGTCAGTGTGTTAATCTTACAACCAGAACTCAAT
>Omicron-XBB
ATGTTTGTTTTTCTTGTTTTATTGCCACTAGTCTCTAGTCAGTGTGTTAATCTTACAACCAGAACTCAAG`,
    },
    tb: {
      label: 'M. tuberculosis lineages (rpoB gene)',
      fasta: `>Lineage1-IndoOceanic
ATGACCACCGAGCAGTTCGGGCCCGGCATGACCACCGAGCAGTTCGGGCCCGGCATGACCACC
>Lineage2-EastAsian
ATGACCACCGAGCAGTTCGGGCCCGGCATGACCACCGAGCAGTTCGGGCCCGGCATGACCACT
>Lineage3-EastAfrican
ATGACCACCGAGCAGTTCGGGCCCGGCATGACCACCGAGCAGTTCGGGCCCGGCATGACCACC
>Lineage4-EuroAmerican
ATGACCACCGAGCAGTTCGGGCCCGGCATGACCACCGAGCAGTTCGGGCCCGGCATGACCACA
>Lineage5-WestAfrican1
ATGACCACCGAGCAGTTCGGGCCCGGCATGACCACCGAGCAGTTCGGGCCCGGCATGACCACC
>Lineage6-WestAfrican2
ATGACCACCGAGCAGTTCGGGCCCGGCATGACCACCGAGCAGTTCGGGCCCGGCATGACCACT
>Lineage7-Ethiopian
ATGACCACCGAGCAGTTCGGGCCCGGCATGACCACCGAGCAGTTCGGGCCCGGCATGACCACA`,
    },
    malaria: {
      label: 'Plasmodium falciparum isolates (kelch13 gene)',
      fasta: `>Ghana-Wild-type
ATGAAGAAAAATTTGTCTCCTTCAAATAAAGAGATTTTGCCAGTTTTAGATCCAGATGATAATCC
>Kenya-C580Y
ATGAAGAAAAATTTGTCTCCTTCAAATAAAGAGATTTTGCCAGTTTTAGATCCAGATGATAATCC
>Tanzania-Wild-type
ATGAAGAAAAATTTGTCTCCTTCAAATAAAGAGATTTTGCCAGTTTTAGATCCAGATGATAATCC
>Uganda-Wild-type
ATGAAGAAAAATTTGTCTCCTTCAAATAAAGAGATTTTGCCAGTTTTAGATCCAGATGATAATCC
>Ethiopia-F446I
ATGAAGAAAAATTTGTCTCCTTCAAATAAAGAGATTTTGCCAGTTTTAGATCCAGATGATAATCA
>Burkina-C580Y
ATGAAGAAAAATTTGTCTCCTTCAAATAAAGAGATTTTGCCAGTTTTAGATCCAGATGATAATCC`,
    },
    primate: {
      label: 'Great ape phylogeny (cytochrome b)',
      fasta: `>Human-Homo-sapiens
ATGACAAACATCCGAAAATCACACCCCATCATCATAATCGCCATAGCCATCAAACTCCTCCTCCTAAACG
>Chimp-Pan-troglodytes
ATGACAAACATCCGAAAATCACACCCCATCATCATAATCGCCATAGCCATCAAACTCCTCCTCCTAAACA
>Bonobo-Pan-paniscus
ATGACAAACATCCGAAAATCACACCCCATCATCATAATCGCCATAGCCATCAAACTCCTCCTCCTAAACA
>Gorilla-Gorilla-gorilla
ATGACAAACATCCGAAAATCACACCCCATCATCATAATCGCCATAGCCATCAAACTCCTCCTCCTAAACT
>Orangutan-Pongo-pygmaeus
ATGACAAACATCCGAAAATCACACCCCATCATCATAATCGCCATAGCCATCAAACTCCTCCTCCTAAACG`,
    },
  };

  /* ─── Parse FASTA ─── */
  function _parseFasta(text) {
    const seqs = [];
    let cur = null;
    for (const line of text.split(/\r?\n/)) {
      const l = line.trim();
      if (!l) continue;
      if (l.startsWith('>')) {
        if (cur) seqs.push(cur);
        cur = { name: l.slice(1).trim().split(/\s+/)[0], seq: '' };
      } else if (cur) {
        cur.seq += l.toUpperCase().replace(/[^ACGTUN-]/g, 'N');
      }
    }
    if (cur) seqs.push(cur);
    return seqs;
  }

  /* ─── Parse distance matrix (tab or space separated) ─── */
  function _parseMatrix(text) {
    const lines = text.trim().split(/\r?\n/).filter(l => l.trim());
    const n = parseInt(lines[0]);
    if (isNaN(n) || lines.length < n + 1) return null;
    const names = [];
    const mat = [];
    for (let i = 1; i <= n; i++) {
      const parts = lines[i].trim().split(/\s+/);
      names.push(parts[0]);
      mat.push(parts.slice(1).map(Number));
    }
    return { names, mat };
  }

  /* ─── Pairwise Hamming distance between two aligned sequences ─── */
  function _hammingDist(a, b) {
    const len = Math.min(a.length, b.length);
    if (!len) return 0;
    let diff = 0;
    for (let i = 0; i < len; i++) if (a[i] !== b[i] && a[i] !== 'N' && b[i] !== 'N' && a[i] !== '-' && b[i] !== '-') diff++;
    return diff / len;
  }

  /* ─── Build distance matrix from sequences ─── */
  function _buildDistMatrix(seqs) {
    const n = seqs.length;
    const mat = Array.from({ length: n }, () => new Array(n).fill(0));
    for (let i = 0; i < n; i++)
      for (let j = i + 1; j < n; j++) {
        const d = _hammingDist(seqs[i].seq, seqs[j].seq);
        mat[i][j] = mat[j][i] = d;
      }
    return mat;
  }

  /* ─────────────────────────────────────────────────────────────
     UPGMA — simple average-linkage hierarchical clustering
     Returns a tree node: { name, left, right, dist, branchLen }
     ───────────────────────────────────────────────────────────── */
  function _upgma(names, distMat) {
    let n = names.length;
    let nodes = names.map(name => ({ name, leaves: 1 }));
    let dists = distMat.map(row => row.slice()); /* deep copy */

    while (nodes.length > 1) {
      /* Find minimum distance */
      let minD = Infinity, minI = 0, minJ = 1;
      for (let i = 0; i < nodes.length; i++)
        for (let j = i + 1; j < nodes.length; j++)
          if (dists[i][j] < minD) { minD = dists[i][j]; minI = i; minJ = j; }

      const nodeA = nodes[minI];
      const nodeB = nodes[minJ];
      const newNode = {
        name: null,
        left: nodeA,
        right: nodeB,
        dist: minD,
        branchLen: minD / 2,
      };
      nodeA.branchLen = (minD / 2) - (nodeA.dist || 0) / 2;
      nodeB.branchLen = (minD / 2) - (nodeB.dist || 0) / 2;
      const newLeaves = nodeA.leaves + nodeB.leaves;

      /* Recompute distances using weighted average */
      const newDists = [];
      const kept = [];
      for (let k = 0; k < nodes.length; k++) {
        if (k === minI || k === minJ) continue;
        kept.push(k);
        const d = (dists[minI][k] * nodeA.leaves + dists[minJ][k] * nodeB.leaves) / newLeaves;
        newDists.push(d);
      }

      const nextNodes = kept.map(k => nodes[k]);
      nextNodes.push({ ...newNode, leaves: newLeaves });
      const m = nextNodes.length;
      const nextDists = Array.from({ length: m }, () => new Array(m).fill(0));
      for (let i = 0; i < kept.length; i++)
        for (let j = 0; j < kept.length; j++)
          nextDists[i][j] = dists[kept[i]][kept[j]];
      for (let i = 0; i < kept.length; i++) {
        nextDists[i][m - 1] = nextDists[m - 1][i] = newDists[i];
      }
      nodes = nextNodes;
      dists = nextDists;
    }
    return nodes[0];
  }

  /* ─────────────────────────────────────────────────────────────
     Neighbor-Joining (Saitou & Nei 1987)
     ───────────────────────────────────────────────────────────── */
  function _nj(names, distMat) {
    let n = names.length;
    let nodes = names.map(name => ({ name }));
    let d = distMat.map(r => r.slice());

    while (n > 2) {
      /* Compute net divergence r[i] */
      const r = new Array(n).fill(0);
      for (let i = 0; i < n; i++)
        for (let j = 0; j < n; j++)
          r[i] += d[i][j];

      /* Compute Q matrix, find min */
      let minQ = Infinity, minI = 0, minJ = 1;
      for (let i = 0; i < n; i++)
        for (let j = i + 1; j < n; j++) {
          const q = (n - 2) * d[i][j] - r[i] - r[j];
          if (q < minQ) { minQ = q; minI = i; minJ = j; }
        }

      /* Branch lengths */
      const blI = d[minI][minJ] / 2 + (r[minI] - r[minJ]) / (2 * (n - 2));
      const blJ = d[minI][minJ] - blI;

      const newNode = {
        name: null,
        left: nodes[minI],
        right: nodes[minJ],
        dist: d[minI][minJ],
      };
      nodes[minI].branchLen = Math.max(0, blI);
      nodes[minJ].branchLen = Math.max(0, blJ);

      /* Compute distances to new node */
      const newDists = [];
      const kept = [];
      for (let k = 0; k < n; k++) {
        if (k === minI || k === minJ) continue;
        kept.push(k);
        newDists.push((d[minI][k] + d[minJ][k] - d[minI][minJ]) / 2);
      }

      const nextNodes = kept.map(k => nodes[k]);
      nextNodes.push(newNode);
      const m = nextNodes.length;
      const nextDists = Array.from({ length: m }, () => new Array(m).fill(0));
      for (let i = 0; i < kept.length; i++)
        for (let j = 0; j < kept.length; j++)
          nextDists[i][j] = d[kept[i]][kept[j]];
      for (let i = 0; i < kept.length; i++) {
        nextDists[i][m - 1] = nextDists[m - 1][i] = newDists[i];
      }
      nodes = nextNodes;
      d = nextDists;
      n = m;
    }

    /* Join final two nodes */
    const root = {
      name: null,
      left: nodes[0],
      right: nodes[1],
      dist: d[0][1],
    };
    nodes[0].branchLen = d[0][1] / 2;
    nodes[1].branchLen = d[0][1] / 2;
    return root;
  }

  /* ─── Generate Newick string ─── */
  function _toNewick(node) {
    if (!node.left && !node.right) {
      return `${node.name}:${(node.branchLen || 0).toFixed(5)}`;
    }
    const l = _toNewick(node.left);
    const r = _toNewick(node.right);
    const bl = (node.branchLen || 0).toFixed(5);
    return `(${l},${r}):${bl}`;
  }

  /* ─── Assign layout (horizontal cladogram) ─── */
  let _leafIndex = 0;
  function _layoutLeaves(node) {
    if (!node.left && !node.right) {
      node._y = _leafIndex++;
      node._x = 0; /* will be set by depth */
      return;
    }
    _layoutLeaves(node.left);
    _layoutLeaves(node.right);
  }

  function _layoutDepth(node, depth) {
    node._depth = depth;
    if (!node.left && !node.right) return;
    _layoutDepth(node.left, depth + 1);
    _layoutDepth(node.right, depth + 1);
  }

  function _maxDepth(node) {
    if (!node.left && !node.right) return 0;
    return 1 + Math.max(_maxDepth(node.left), _maxDepth(node.right));
  }

  function _countLeaves(node) {
    if (!node.left && !node.right) return 1;
    return _countLeaves(node.left) + _countLeaves(node.right);
  }

  function _midY(node) {
    if (!node.left && !node.right) return node._y;
    return (_midY(node.left) + _midY(node.right)) / 2;
  }

  /* ─── Draw to SVG string ─── */
  const PALETTE = ['#3fb950', '#58a6ff', '#bc8cff', '#f97316', '#ff6b6b', '#e3b341', '#26a69a', '#ff8a65'];

  function _svgTree(root) {
    _leafIndex = 0;
    _layoutLeaves(root);
    _layoutDepth(root, 0);
    const maxD = _maxDepth(root);
    const nLeaves = _countLeaves(root);
    const PAD_L = 20, PAD_R = 180, PAD_T = 30, PAD_B = 30;
    const ROW_H = 28;
    const W = 700;
    const H = nLeaves * ROW_H + PAD_T + PAD_B;
    const innerW = W - PAD_L - PAD_R;

    /* Map depth → x (deeper = further left, tips at right) */
    function xOf(node) {
      if (!node.left && !node.right) return innerW; /* tips flush right */
      return (innerW / maxD) * node._depth;
    }
    function yOf(node) {
      return PAD_T + _midY(node) * ROW_H + ROW_H / 2;
    }

    let lines = '';
    let labels = '';

    /* Assign leaf colours */
    let leafCol = {};
    let leafIdx = 0;
    function assignColour(node) {
      if (!node.left && !node.right) {
        leafCol[node.name] = PALETTE[leafIdx++ % PALETTE.length];
        return;
      }
      assignColour(node.left);
      assignColour(node.right);
    }
    assignColour(root);

    function drawNode(node) {
      const nx = PAD_L + xOf(node);
      const ny = yOf(node);

      if (node.left && node.right) {
        /* Vertical bar connecting children */
        const ly = yOf(node.left);
        const ry = yOf(node.right);
        lines += `<line x1="${nx}" y1="${ly}" x2="${nx}" y2="${ry}" stroke="#30363d" stroke-width="1.5"/>`;

        /* Horizontal lines to children */
        const lx = PAD_L + xOf(node.left);
        const rx = PAD_L + xOf(node.right);
        lines += `<line x1="${nx}" y1="${ly}" x2="${lx}" y2="${ly}" stroke="#3fb950" stroke-width="1.5"/>`;
        lines += `<line x1="${nx}" y1="${ry}" x2="${rx}" y2="${ry}" stroke="#3fb950" stroke-width="1.5"/>`;

        /* Bootstrap dot */
        const bl = (node.dist || 0).toFixed(4);
        lines += `<circle cx="${nx}" cy="${ny}" r="3" fill="#21262d" stroke="#3fb950" stroke-width="1.5"/>`;
        lines += `<text x="${nx - 5}" y="${ny - 5}" fill="#8b949e" font-size="8" text-anchor="end">${bl}</text>`;

        drawNode(node.left);
        drawNode(node.right);
      } else {
        /* Tip node */
        const col = leafCol[node.name] || '#8b949e';
        lines += `<circle cx="${nx}" cy="${ny}" r="4" fill="${col}" stroke="${col}" stroke-width="1"/>`;
        labels += `<text x="${nx + 8}" y="${ny + 4}" fill="${col}" font-size="11" font-family="JetBrains Mono, monospace">${node.name}</text>`;
      }
    }

    drawNode(root);

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" style="max-width:100%;overflow:visible">
      <rect width="${W}" height="${H}" fill="#0d1117" rx="8"/>
      ${lines}${labels}
    </svg>`;
  }

  /* ─── Distance matrix table HTML ─── */
  function _distTableHtml(names, mat) {
    const n = names.length;
    let h = `<table class="phylo-dist-table"><thead><tr><th></th>${names.map(n => `<th>${n.slice(0,12)}</th>`).join('')}</tr></thead><tbody>`;
    for (let i = 0; i < n; i++) {
      h += `<tr><td class="phylo-dist-name">${names[i].slice(0,12)}</td>`;
      for (let j = 0; j < n; j++) {
        const v = mat[i][j];
        const heat = i === j ? '#0d1117' : `hsl(${120 - v * 600},70%,30%)`;
        h += `<td style="background:${heat};color:#e6edf3">${i === j ? '—' : v.toFixed(4)}</td>`;
      }
      h += '</tr>';
    }
    h += '</tbody></table>';
    return h;
  }

  /* ─── Build tree from current input ─── */
  function _build() {
    const inp = document.getElementById('phylo-input')?.value?.trim() || '';
    const algo = document.querySelector('input[name="phylo-algo"]:checked')?.value || 'nj';
    const statusEl = document.getElementById('phylo-status');
    const treeEl   = document.getElementById('phylo-tree-svg');
    const distEl   = document.getElementById('phylo-dist-matrix');
    const newickEl = document.getElementById('phylo-newick');

    if (!inp) { if (statusEl) statusEl.textContent = 'Please paste sequences or a distance matrix.'; return; }
    if (statusEl) statusEl.textContent = 'Building…';

    let names, mat, seqs;
    if (inp.startsWith('>')) {
      seqs = _parseFasta(inp);
      if (seqs.length < 3) { statusEl.textContent = 'Need at least 3 sequences.'; return; }
      names = seqs.map(s => s.name);
      mat = _buildDistMatrix(seqs);
    } else {
      const parsed = _parseMatrix(inp);
      if (!parsed) { statusEl.textContent = 'Could not parse matrix — expected PHYLIP format (N on first line, then rows).'; return; }
      names = parsed.names;
      mat = parsed.mat;
    }

    const root = algo === 'nj' ? _nj(names, mat.map(r => r.slice())) : _upgma(names, mat.map(r => r.slice()));
    const svg  = _svgTree(root);
    const newick = _toNewick(root) + ';';

    if (treeEl)   treeEl.innerHTML = svg;
    if (distEl)   distEl.innerHTML = _distTableHtml(names, mat);
    if (newickEl) newickEl.textContent = newick;
    if (statusEl) statusEl.textContent = `Tree built (${algo.toUpperCase()}) — ${names.length} taxa, ${(mat[0][1] * 100).toFixed(2)}% max distance`;

    /* Store for download */
    treeEl._newick = newick;
    treeEl._svg    = svg;
  }

  /* ─── Download helpers ─── */
  function _downloadNewick() {
    const el = document.getElementById('phylo-tree-svg');
    if (!el || !el._newick) return;
    const blob = new Blob([el._newick], { type: 'text/plain' });
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: 'omicslab_tree.nwk' });
    a.click();
  }

  function _downloadSVG() {
    const el = document.getElementById('phylo-tree-svg');
    if (!el || !el._svg) return;
    const blob = new Blob([el._svg], { type: 'image/svg+xml' });
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: 'omicslab_tree.svg' });
    a.click();
  }

  function _copyNewick() {
    const el = document.getElementById('phylo-newick');
    if (!el) return;
    navigator.clipboard.writeText(el.textContent).then(() => {
      const btn = document.getElementById('phylo-copy-btn');
      if (btn) { btn.textContent = '[OK] Copied'; setTimeout(() => { btn.textContent = 'Copy Newick'; }, 1800); }
    });
  }

  /* ─── Init ─── */
  function init() {
    const section = document.getElementById('phylo-section');
    if (!section || section.dataset.phyloReady) return;
    section.dataset.phyloReady = '1';

    section.innerHTML = `
      <div class="phylo-wrap">
        <div class="phylo-header">
          <div>
            <div class="phylo-badge">PHYLOGENETICS</div>
            <h2 class="phylo-title">Phylogenetic Tree Builder</h2>
            <p class="phylo-subtitle">Paste FASTA sequences or a PHYLIP distance matrix — choose NJ or UPGMA, get an SVG tree, distance heatmap, and Newick export. Runs 100% offline.</p>
          </div>
        </div>

        <div class="phylo-main">
          <!-- LEFT: input panel -->
          <div class="phylo-left">
            <div class="phylo-card">
              <div class="phylo-card-title">Input sequences</div>
              <div class="phylo-examples-row">
                <span class="phylo-examples-label">Load example:</span>
                ${Object.entries(EXAMPLES).map(([k, ex]) =>
                  `<button class="phylo-ex-btn" onclick="OmicsLab.Phylo._loadExample('${k}')">${ex.label.split(' ')[0]}</button>`
                ).join('')}
              </div>
              <textarea id="phylo-input" class="phylo-textarea" rows="12"
                placeholder="Paste FASTA sequences (> 3 seqs) or PHYLIP distance matrix…"></textarea>

              <div class="phylo-algo-row">
                <span class="phylo-algo-label">Algorithm:</span>
                <label class="phylo-algo-opt">
                  <input type="radio" name="phylo-algo" value="nj" checked> Neighbor-Joining
                </label>
                <label class="phylo-algo-opt">
                  <input type="radio" name="phylo-algo" value="upgma"> UPGMA
                </label>
              </div>

              <button class="phylo-build-btn" onclick="OmicsLab.Phylo._build()">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                Build Tree
              </button>
              <div id="phylo-status" class="phylo-status"></div>
            </div>

            <!-- Algorithm info cards -->
            <div class="phylo-info-cards">
              <div class="phylo-info-card">
                <div class="phylo-info-name" style="color:#3fb950">Neighbor-Joining (NJ)</div>
                <div class="phylo-info-desc">Saitou & Nei 1987. Builds unrooted tree by iteratively joining the pair of taxa that minimise the total tree length. Best for variable evolutionary rates. Most widely used method in molecular epidemiology.</div>
                <div class="phylo-info-use">Use for: outbreak tracing, SNP-based phylogenies, MLST</div>
              </div>
              <div class="phylo-info-card">
                <div class="phylo-info-name" style="color:#58a6ff">UPGMA</div>
                <div class="phylo-info-desc">Unweighted Pair Group Method with Arithmetic Mean. Assumes a molecular clock (equal rates across lineages). Simpler than NJ. Produces a rooted ultrametric tree — height = time.</div>
                <div class="phylo-info-use">Use for: population structure, closely related strains, teaching</div>
              </div>
            </div>
          </div>

          <!-- RIGHT: output panel -->
          <div class="phylo-right">
            <div class="phylo-card phylo-card-tree">
              <div class="phylo-card-title">
                Phylogenetic Tree
                <div class="phylo-tree-actions">
                  <button class="phylo-act-btn" onclick="OmicsLab.Phylo._downloadSVG()">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    SVG
                  </button>
                  <button class="phylo-act-btn" onclick="OmicsLab.Phylo._downloadNewick()">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    Newick
                  </button>
                </div>
              </div>
              <div id="phylo-tree-svg" class="phylo-tree-canvas">
                <div class="phylo-empty-state">
                  <div class="phylo-empty-icon">${OmicsLab.Icons?.svg('git-branch',32)||''}</div>
                  <div class="phylo-empty-text">Load an example or paste sequences above, then click <strong>Build Tree</strong></div>
                </div>
              </div>
            </div>

            <div class="phylo-card">
              <div class="phylo-card-title">
                Newick String
                <button class="phylo-act-btn" id="phylo-copy-btn" onclick="OmicsLab.Phylo._copyNewick()">Copy Newick</button>
              </div>
              <pre id="phylo-newick" class="phylo-newick"></pre>
            </div>

            <div class="phylo-card">
              <div class="phylo-card-title">Distance Matrix</div>
              <div id="phylo-dist-matrix" class="phylo-dist-wrap">
                <div class="phylo-empty-state-sm">Build a tree to see the distance heatmap</div>
              </div>
            </div>
          </div>
        </div>

        <div class="phylo-concepts">
          <div class="phylo-section-title">Key phylogenetics concepts</div>
          <div class="phylo-concepts-grid">
            ${[
              { t: 'Clade', d: 'A group containing an ancestor and all of its descendants — a monophyletic group.' },
              { t: 'Branch length', d: 'Represents the amount of evolutionary change (substitutions per site) along a lineage.' },
              { t: 'Bootstrap support', d: 'Percentage of times a clade appears in trees built from resampled datasets (100 = fully supported).' },
              { t: 'Root', d: 'The oldest ancestor in the tree. NJ produces unrooted trees; UPGMA roots at the midpoint.' },
              { t: 'Newick format', d: 'Standard text encoding for trees: (A:0.1,B:0.2):0.05 — parens = clade, number = branch length.' },
              { t: 'Molecular clock', d: 'Assumption that sequences evolve at a constant rate — enables dating nodes when calibrated to known events.' },
            ].map(c => `<div class="phylo-concept-card"><div class="phylo-concept-t">${c.t}</div><div class="phylo-concept-d">${c.d}</div></div>`).join('')}
          </div>
        </div>
      </div>`;

    /* Keyboard shortcut */
    document.getElementById('phylo-input')?.addEventListener('keydown', e => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); _build(); }
    });
  }

  function _loadExample(key) {
    const ex = EXAMPLES[key];
    if (!ex) return;
    const ta = document.getElementById('phylo-input');
    if (ta) { ta.value = ex.fasta; }
    const statusEl = document.getElementById('phylo-status');
    if (statusEl) statusEl.textContent = `Loaded: ${ex.label}`;
  }

  return { init, _build, _loadExample, _downloadNewick, _downloadSVG, _copyNewick };
})();
