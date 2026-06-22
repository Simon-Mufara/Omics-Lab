/* ═══════════════════════════════════════════════════════════════
   OmicsLab — AI & Machine Learning in Bioinformatics
   window.OmicsLab.AIMLBio
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.AIMLBio = (function () {

  /* ─── LLM / Foundation Model catalogue ─── */
  const MODELS = [
    {
      id: 'nucleotide-transformer', name: 'Nucleotide Transformer', org: 'InstaDeep + H3Africa',
      type: 'DNA LLM', color: '#3fb950',
      params: '500M – 2.5B', trained: '3,202 diverse genomes · NCBI RefSeq',
      tasks: ['Splice site prediction', 'Promoter detection', 'Chromatin accessibility', 'Variant effect scoring'],
      africa: 'Developed with H3Africa data — explicitly trained on African genomic diversity to reduce ancestral bias in variant interpretation.',
      cite: 'Dalla-Torre et al. 2023, Nature Methods',
      code: `from transformers import AutoTokenizer, AutoModelForMaskedLM\nimport torch\n\ntokenizer = AutoTokenizer.from_pretrained(\n    "InstaDeepAI/nucleotide-transformer-2.5b-multi-species"\n)\nmodel = AutoModelForMaskedLM.from_pretrained(\n    "InstaDeepAI/nucleotide-transformer-2.5b-multi-species"\n)\n\nseq = "ATGCGTACG[MASK]TAGCGATCG"\ntokens = tokenizer(seq, return_tensors="pt")\nwith torch.no_grad():\n    logits = model(**tokens).logits\nprint("Top predicted nucleotide:", tokenizer.decode(\n    logits[0, tokens.input_ids[0] == tokenizer.mask_token_id].argmax(-1)\n))`
    },
    {
      id: 'esm2', name: 'ESM-2', org: 'Meta AI',
      type: 'Protein LLM', color: '#58a6ff',
      params: '8M – 15B', trained: '250M protein sequences · UniRef90',
      tasks: ['Zero-shot variant effect', 'Protein embeddings', 'Structure-aware representations', 'Functional site prediction'],
      africa: 'Used to predict pathogenicity of novel P. falciparum and M. tuberculosis variants before experimental validation — critical for African disease research.',
      cite: 'Lin et al. 2023, Science',
      code: `import esm, torch\n\nmodel, alphabet = esm.pretrained.esm2_t33_650M_UR50D()\nbatch_converter = alphabet.get_batch_converter()\nmodel.eval()\n\n# Example: M. tuberculosis rpoB protein fragment\ndata = [("rpoB_mtb", "MVLSPADKTNVKAAWGKVGAHAGEYGAEALERMFLSFPTTKTYFPHFDLSHGSAQVKGHGK")]\nbatch_labels, batch_strs, batch_tokens = batch_converter(data)\nwith torch.no_grad():\n    results = model(batch_tokens, repr_layers=[33], return_contacts=True)\nprint("Embedding shape:", results["representations"][33].shape)`
    },
    {
      id: 'alphafold2', name: 'AlphaFold 2', org: 'DeepMind',
      type: 'Structure Prediction', color: '#bc8cff',
      params: '93M', trained: 'PDB + genetic databases · MSA',
      tasks: ['3D structure prediction', 'Drug target identification', 'Protein-protein docking', 'pLDDT confidence scoring'],
      africa: 'AlphaFold structures of KCNQ1, HBB, G6PD, CYP2D6 — all African disease-relevant proteins — are precomputed and freely available via EBI AlphaFold DB.',
      cite: 'Jumper et al. 2021, Nature',
      code: `# Using AlphaFold DB REST API (no GPU required)\nimport requests\n\nuniprot_id = "P69905"  # Human HBB (sickle cell gene)\nurl = f"https://alphafold.ebi.ac.uk/api/prediction/{uniprot_id}"\nresult = requests.get(url).json()[0]\n\nprint(f"Model URL:  {result['pdbUrl']}")\nprint(f"CIF URL:    {result['cifUrl']}")\nprint(f"PAE URL:    {result['paeDocUrl']}")\nprint(f"Created:    {result['modelCreatedDate']}")`
    },
    {
      id: 'scgpt', name: 'scGPT', org: 'University of Toronto',
      type: 'Single-Cell LLM', color: '#e3b341',
      params: '70M', trained: '33M human cells · CellXGene',
      tasks: ['Cell type annotation', 'Gene perturbation prediction', 'Multi-omic integration', 'GRN inference'],
      africa: 'Directly applicable to African scRNA-seq cohorts (e.g., KEMRI malaria PBMC atlas) — reduces need for large local training datasets.',
      cite: 'Cui et al. 2024, Nature Methods',
      code: `import scgpt\nimport scanpy as sc\n\n# Load your AnnData (African scRNA-seq)\nadata = sc.read_h5ad("kemri_malaria_pbmc.h5ad")\nsc.pp.normalize_total(adata, target_sum=1e4)\nsc.pp.log1p(adata)\n\n# Run scGPT cell type annotation\nmodel_dir = "scGPT_human"  # pretrained checkpoint\nscgpt.tasks.annotate_data(\n    adata,\n    model_dir=model_dir,\n    batch_key="patient_id",\n    cell_type_key="predicted_cell_type"\n)\nprint(adata.obs["predicted_cell_type"].value_counts())`
    },
    {
      id: 'biogpt', name: 'BioGPT', org: 'Microsoft Research',
      type: 'Biomedical Text LLM', color: '#f97316',
      params: '347M', trained: '15M PubMed abstracts',
      tasks: ['Literature-based QA', 'Relation extraction (gene-disease)', 'Drug target text mining', 'Clinical note summarization'],
      africa: 'Extracts gene-disease associations from African genomics literature — useful for curating H3Africa publication findings automatically.',
      cite: 'Luo et al. 2022, Briefings in Bioinformatics',
      code: `from transformers import pipeline\n\nbio_qa = pipeline(\n    "text-generation",\n    model="microsoft/biogpt",\n    max_new_tokens=200\n)\n\nprompt = "The relationship between the HBB gene and sickle cell disease in African populations is"\nresult = bio_qa(prompt)\nprint(result[0]["generated_text"])`
    },
    {
      id: 'geneformer', name: 'Geneformer', org: 'Broad Institute',
      type: 'Single-Cell LLM', color: '#ff6b6b',
      params: '10M', trained: '29.9M single-cell transcriptomes',
      tasks: ['Network dosage sensitivity', 'Cell state transitions', 'Disease gene prioritization', 'Chromatin dynamics'],
      africa: 'Applicable to sickle cell disease differentiation studies and TB granuloma cell state work in South African cohorts.',
      cite: 'Theodoris et al. 2023, Nature',
      code: `from geneformer import TranscriptomeTokenizer, EmbExtractor\nimport scanpy as sc\n\n# Tokenize single-cell data\ntk = TranscriptomeTokenizer(\n    custom_attr_name_dict={"cell_type": "cell_type"},\n    nproc=4\n)\ntk.tokenize_data(\n    data_directory="sc_data/",\n    output_directory="tokenized/",\n    output_prefix="malaria_pbmc"\n)\n\n# Extract gene network embeddings\nextractor = EmbExtractor(model_type="Pretrained", emb_layer=0)\nextractor.extract_embs(\n    model_directory="Geneformer",\n    input_data_file="tokenized/malaria_pbmc.dataset",\n    output_directory="embeddings/"\n)`
    },
  ];

  /* ─── Neural network demo data ─── */
  const NN_LAYERS = [
    { name: 'Input', nodes: 4, labels: ['GC%', 'Length', 'Q-score', 'Coverage'], color: '#58a6ff' },
    { name: 'Hidden 1', nodes: 6, labels: [], color: '#bc8cff' },
    { name: 'Hidden 2', nodes: 4, labels: [], color: '#e3b341' },
    { name: 'Output', nodes: 2, labels: ['Pathogenic', 'Benign'], color: '#3fb950' },
  ];

  /* ─── Classical ML algorithms ─── */
  const ML_ALGOS = [
    { name: 'Random Forest', icon: 'bar-chart', color: '#3fb950', use: 'AMR prediction · Variant pathogenicity · Gene expression classification', pro: 'Handles mixed data; interpretable feature importance; no scaling needed', con: 'Slow on very large datasets; black-box individual trees', example: 'Predict MDR-TB resistance from 20 M. tuberculosis SNPs (97% accuracy)' },
    { name: 'Support Vector Machine', icon: 'activity', color: '#58a6ff', use: 'Protein subcellular localization · Splice site prediction · Enhancer classification', pro: 'Effective in high-dimensional spaces; robust to outliers', con: 'Slow to train on large datasets; kernel choice is critical', example: 'Classify P. falciparum protein subcellular location from sequence features' },
    { name: 'Logistic Regression', icon: 'trending-up', color: '#e3b341', use: 'GWAS case-control · Binary phenotype · Treatment response prediction', pro: 'Interpretable odds ratios; fast; probabilistic output', con: 'Assumes linearity; struggles with non-linear interactions', example: 'Association of HBB rs334 with sickle cell trait across AWI-Gen cohort' },
    { name: 'k-Means Clustering', icon: 'layers', color: '#bc8cff', use: 'Transcriptomic subtypes · Patient stratification · Variant co-occurrence patterns', pro: 'Simple; scales well; interpretable cluster centroids', con: 'Requires k choice; sensitive to initialization; spherical assumption', example: 'Identify TB patient endotypes from whole-blood RNA-seq (H3Africa)' },
    { name: 'Gradient Boosting (XGBoost)', icon: 'zap', color: '#f97316', use: 'Polygenic risk scores · Drug-target scoring · GWAS hits prioritization', pro: 'State-of-the-art tabular performance; handles missing values', con: 'Many hyperparameters; prone to overfitting without tuning', example: 'T2D polygenic risk score for AWI-Gen 11,000 African participants' },
    { name: 'Autoencoder (VAE)', icon: 'cpu', color: '#ff6b6b', use: 'Single-cell dimensionality reduction (scVI) · Denoising · Batch correction', pro: 'Learns compact representations; generative; denoises', con: 'Complex to train; interpretability limited; mode collapse risk', example: 'scVI batch-corrects 4 African TB lung granuloma scRNA-seq datasets' },
  ];

  /* ─── Feature selection exercise data (stable order) ─── */
  const GOOD_FEATS = ['GC content', 'k-mer frequencies', 'Sequence entropy', 'Conservation score', 'Codon bias'];
  const BAD_FEATS  = ['Sample collection date', 'Researcher initials', 'File creation timestamp', 'Gel image filename'];
  const ALL_FEATS  = ['GC content', 'Sample collection date', 'k-mer frequencies', 'Researcher initials', 'Sequence entropy', 'File creation timestamp', 'Conservation score', 'Codon bias', 'Gel image filename'];

  /* ─── State ─── */
  let _tab = 'llms';
  let _modelId = 'nucleotide-transformer';
  let _nnRunning = false;
  let _nnActivations = []; /* per-layer activation strength 0-1 */

  /* ─── Seeded RNG for reproducible visuals ─── */
  function _rng(seed) { let s = seed; return () => { s = (s*16807)%2147483647; return (s-1)/2147483646; }; }

  /* ═══════════ INIT ════════════ */
  function init() {
    const container = document.getElementById('ai-ml-bio-content');
    if (!container || container.querySelector('.aml-page')) return;
    try { _render(container); } catch(e) { console.error('AIMLBio init error:', e); throw e; }
  }

  function _render(container) {
    container.innerHTML = `
    <div class="aml-page">
      <div class="aml-header">
        <h1 class="aml-title">AI & Machine Learning in Bioinformatics</h1>
        <p class="aml-sub">Foundation models, neural networks, and classical ML — how they transform omics data into biological insight, with a focus on African disease applications.</p>
      </div>

      <div class="aml-tabs" role="tablist">
        ${[
          ['llms',     'Foundation Models & LLMs'],
          ['nn',       'Neural Networks'],
          ['classical','Classical ML'],
          ['workflows','Workflows & Code'],
          ['africa',   'Africa Applications'],
          ['practice', 'Practice & Build'],
        ].map(([id,label]) => `
          <button class="aml-tab${_tab===id?' active':''}" role="tab" aria-selected="${_tab===id}" data-tab="${id}"
                  onclick="OmicsLab.AIMLBio.setTab('${id}')">${label}</button>
        `).join('')}
      </div>

      <div id="aml-tab-body"></div>
    </div>`;

    _renderTab();
  }

  /* ═══════════ TAB DISPATCH ════════════ */
  function setTab(id) {
    _tab = id;
    document.querySelectorAll('.aml-tab').forEach(b => {
      b.classList.toggle('active', b.dataset.tab === id);
      b.setAttribute('aria-selected', b.dataset.tab === id);
    });
    _renderTab();
  }

  function _renderTab() {
    const body = document.getElementById('aml-tab-body');
    if (!body) return;
    if (_tab === 'llms')      body.innerHTML = _tabLLMs();
    if (_tab === 'nn')        { body.innerHTML = _tabNN(); _initNNCanvas(); }
    if (_tab === 'classical') body.innerHTML = _tabClassical();
    if (_tab === 'workflows') body.innerHTML = _tabWorkflows();
    if (_tab === 'africa')    body.innerHTML = _tabAfrica();
    if (_tab === 'practice')  body.innerHTML = _tabPractice();
  }

  /* ═══════════ TAB: LLMs ════════════ */
  function _tabLLMs() {
    const m = MODELS.find(x => x.id === _modelId) || MODELS[0];
    return `
    <div class="aml-llm-layout">
      <div class="aml-model-list">
        <div class="aml-sb-title">Foundation Models</div>
        ${MODELS.map(mod => `
          <button class="aml-model-btn${mod.id===_modelId?' active':''}" onclick="OmicsLab.AIMLBio.selectModel('${mod.id}')"
                  style="--mc:${mod.color}">
            <span class="aml-model-type" style="color:${mod.color}">${mod.type}</span>
            <span class="aml-model-name">${mod.name}</span>
            <span class="aml-model-org">${mod.org}</span>
          </button>`).join('')}
      </div>
      <div class="aml-model-detail">
        <div class="aml-md-header" style="border-color:${m.color}">
          <div style="display:flex;align-items:center;gap:1rem;flex-wrap:wrap">
            <div>
              <div class="aml-md-type" style="color:${m.color}">${m.type}</div>
              <div class="aml-md-name">${m.name}</div>
              <div class="aml-md-org">${m.org}</div>
            </div>
            <div class="aml-md-stats">
              <div class="aml-md-stat"><span class="aml-md-stat-label">Parameters</span><span>${m.params}</span></div>
              <div class="aml-md-stat"><span class="aml-md-stat-label">Training data</span><span>${m.trained}</span></div>
            </div>
          </div>
        </div>
        <div class="aml-md-body">
          <div class="aml-md-section">Key Tasks</div>
          <div class="aml-task-chips">${m.tasks.map(t=>`<span class="aml-task-chip" style="border-color:${m.color}20;color:${m.color}">${t}</span>`).join('')}</div>
          <div class="aml-md-section">Africa Relevance</div>
          <p class="aml-africa-note" style="border-color:${m.color}">${m.africa}</p>
          <div class="aml-md-section">Citation</div>
          <p class="aml-cite">${m.cite}</p>
          <div class="aml-md-section">Example Code</div>
          <pre class="aml-code"><code>${_esc(m.code)}</code></pre>
        </div>
      </div>
    </div>
    <div class="aml-capability-matrix">
      <div class="aml-sb-title" style="margin-bottom:0.75rem">Capability Matrix — what each model can do</div>
      <div class="aml-matrix-wrap">
        <table class="aml-matrix-tbl">
          <thead><tr><th>Model</th><th>Variant Effect</th><th>Structure</th><th>Cell Type</th><th>Text Mining</th><th>Generation</th></tr></thead>
          <tbody>
            ${MODELS.map(mod=>{
              const caps = {
                'nucleotide-transformer': [1,0,0,0,0],
                'esm2':                  [1,1,0,0,0],
                'alphafold2':            [0,1,0,0,0],
                'scgpt':                 [0,0,1,0,0],
                'biogpt':                [0,0,0,1,1],
                'geneformer':            [1,0,1,0,0],
              }[mod.id]||[0,0,0,0,0];
              return `<tr><td style="color:${mod.color};font-weight:700">${mod.name}</td>${caps.map(c=>`<td>${c?'<span class="aml-cap-yes">Yes</span>':'<span class="aml-cap-no">—</span>'}</td>`).join('')}</tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
  }

  /* ═══════════ TAB: Neural Networks ════════════ */
  function _tabNN() {
    return `
    <div class="aml-nn-layout">
      <div class="aml-nn-main">
        <div class="aml-sb-title">Interactive Neural Network — Variant Pathogenicity Classifier</div>
        <p class="aml-nn-desc">A 4-layer feedforward network that takes sequence features as input and predicts whether a variant is pathogenic or benign. Click <strong>Run Forward Pass</strong> to watch activations propagate.</p>
        <div class="aml-nn-card">
          <svg id="aml-nn-svg" width="680" height="260" viewBox="0 0 680 260" style="max-width:100%;overflow:visible" aria-label="Neural network diagram"></svg>
          <div class="aml-nn-controls">
            <button class="aml-run-btn" id="aml-nn-run-btn" onclick="OmicsLab.AIMLBio.runForwardPass()">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              Run Forward Pass
            </button>
            <button class="aml-reset-btn" onclick="OmicsLab.AIMLBio.resetNN()">Reset</button>
          </div>
        </div>

        <div class="aml-arch-cards">
          ${[
            { name: 'Convolutional Neural Network (CNN)', color: '#58a6ff', use: 'Sequence motif detection', how: 'Sliding filters detect local patterns (e.g., TATA box, splice donor) across DNA/protein sequences. Each filter learns a different motif.', apps: ['Splicing prediction (SpliceAI)', 'TF binding site detection (DeepBind)', 'Chromatin accessibility (Basset)'] },
            { name: 'Transformer', color: '#bc8cff', use: 'Long-range sequence dependencies', how: 'Self-attention mechanism captures relationships between distant positions in a sequence — essential for protein folding where distant residues interact.', apps: ['AlphaFold2 structure prediction', 'Nucleotide Transformer variant effect', 'ESM-2 protein embeddings'] },
            { name: 'Graph Neural Network (GNN)', color: '#e3b341', use: 'Molecular & network data', how: 'Treats atoms, residues, or genes as nodes with edges for bonds/interactions. Message-passing updates each node using its neighbours.', apps: ['Drug-target interaction (GraphDTA)', 'PPI network link prediction', 'Protein side-chain packing'] },
            { name: 'Variational Autoencoder (VAE)', color: '#3fb950', use: 'Latent representation learning', how: 'Encodes high-dimensional data (e.g., 20,000-gene expression) into a low-dimensional latent space and reconstructs it — learns the underlying data distribution.', apps: ['scVI single-cell batch correction', 'scVAE trajectory inference', 'Protein sequence generation'] },
          ].map(a => `
            <div class="aml-arch-card" style="border-top-color:${a.color}">
              <div class="aml-arch-name" style="color:${a.color}">${a.name}</div>
              <div class="aml-arch-use">${a.use}</div>
              <p class="aml-arch-how">${a.how}</p>
              <div class="aml-arch-apps">${a.apps.map(x=>`<span class="aml-arch-app">${x}</span>`).join('')}</div>
            </div>`).join('')}
        </div>
      </div>
    </div>`;
  }

  function _initNNCanvas() {
    const svg = document.getElementById('aml-nn-svg');
    if (!svg) return;
    _nnActivations = NN_LAYERS.map(() => 0);
    _drawNN(svg, _nnActivations);
  }

  function _drawNN(svg, activations) {
    const W = 680, H = 260;
    const layerX = [60, 210, 390, 580];
    const rng = _rng(42);

    let html = `<defs>
      <filter id="aml-glow"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    </defs>`;

    /* Compute node Y positions */
    const positions = NN_LAYERS.map((layer, li) => {
      const n = layer.nodes;
      const gap = Math.min(46, (H - 40) / n);
      const total = (n - 1) * gap;
      const startY = H / 2 - total / 2;
      return Array.from({length: n}, (_, i) => ({ x: layerX[li], y: startY + i * gap }));
    });

    /* Edges */
    NN_LAYERS.forEach((layer, li) => {
      if (li === NN_LAYERS.length - 1) return;
      const from = positions[li], to = positions[li + 1];
      from.forEach(fp => {
        to.forEach(tp => {
          const act = activations[li];
          const w = rng() * 0.8 + 0.2;
          const alpha = act > 0 ? Math.min(1, act * w * 1.2) : 0.1;
          const stroke = act > 0 ? `rgba(88,166,255,${alpha.toFixed(2)})` : '#21262d';
          const sw = act > 0 ? 1.5 * alpha : 0.6;
          html += `<line x1="${fp.x}" y1="${fp.y}" x2="${tp.x}" y2="${tp.y}" stroke="${stroke}" stroke-width="${sw.toFixed(1)}"/>`;
        });
      });
    });

    /* Nodes + labels */
    NN_LAYERS.forEach((layer, li) => {
      const act = activations[li];
      positions[li].forEach((pos, ni) => {
        const fill = act > 0 ? layer.color : '#21262d';
        const r = act > 0 ? 14 : 12;
        const filter = act > 0 ? 'filter="url(#aml-glow)"' : '';
        html += `<circle cx="${pos.x}" cy="${pos.y}" r="${r}" fill="${fill}" stroke="${layer.color}" stroke-width="1.5" opacity="${act > 0 ? 0.9 : 0.5}" ${filter}/>`;
        if (layer.labels[ni]) {
          const anchor = li === 0 ? 'end' : 'start';
          const dx = li === 0 ? -20 : 20;
          html += `<text x="${pos.x + dx}" y="${pos.y + 5}" text-anchor="${anchor}" fill="#8b949e" font-size="10" font-family="monospace">${_esc(layer.labels[ni])}</text>`;
        }
      });
      /* Layer label */
      const lx = layerX[li];
      html += `<text x="${lx}" y="246" text-anchor="middle" fill="${layer.color}" font-size="10" font-weight="700">${layer.name}</text>`;
      html += `<text x="${lx}" y="258" text-anchor="middle" fill="#6e7681" font-size="9">${layer.nodes} nodes</text>`;
    });

    svg.innerHTML = html;
  }

  function runForwardPass() {
    if (_nnRunning) return;
    _nnRunning = true;
    const btn = document.getElementById('aml-nn-run-btn');
    if (btn) btn.disabled = true;
    const svg = document.getElementById('aml-nn-svg');
    if (!svg) { _nnRunning = false; return; }

    let layer = 0;
    const activations = NN_LAYERS.map(() => 0);
    const interval = setInterval(() => {
      if (layer >= NN_LAYERS.length) {
        clearInterval(interval);
        _nnRunning = false;
        if (btn) btn.disabled = false;
        return;
      }
      activations[layer] = 0.85 + Math.random() * 0.15;
      _drawNN(svg, [...activations]);
      layer++;
    }, 420);
  }

  function resetNN() {
    _nnRunning = false;
    const svg = document.getElementById('aml-nn-svg');
    const btn = document.getElementById('aml-nn-run-btn');
    if (btn) btn.disabled = false;
    if (svg) _drawNN(svg, NN_LAYERS.map(() => 0));
  }

  /* ═══════════ TAB: Classical ML ════════════ */
  function _tabClassical() {
    return `
    <div class="aml-classical-grid">
      ${ML_ALGOS.map(a => `
        <div class="aml-algo-card" style="--ac:${a.color}">
          <div class="aml-algo-header">
            <div class="aml-algo-name" style="color:${a.color}">${a.name}</div>
          </div>
          <div class="aml-algo-use">${a.use}</div>
          <div class="aml-algo-pros-cons">
            <div>
              <div class="aml-pro-con-label" style="color:#3fb950">Advantages</div>
              <p class="aml-pro-con-text">${a.pro}</p>
            </div>
            <div>
              <div class="aml-pro-con-label" style="color:#f85149">Limitations</div>
              <p class="aml-pro-con-text">${a.con}</p>
            </div>
          </div>
          <div class="aml-algo-example">
            <span class="aml-algo-example-label">African genomics example</span>
            <span>${a.example}</span>
          </div>
        </div>`).join('')}
    </div>
    <div class="aml-ml-chooser">
      <div class="aml-sb-title" style="margin-bottom:0.75rem">Which algorithm should I use?</div>
      <div class="aml-chooser-grid">
        ${[
          { q: 'Predict a binary label (disease/control)', ans: 'Logistic Regression → Random Forest → XGBoost', color: '#3fb950' },
          { q: 'Find groups in expression data', ans: 'k-Means → Hierarchical Clustering → VAE (scVI)', color: '#58a6ff' },
          { q: 'Classify DNA/protein sequences', ans: 'CNN → Transformer (fine-tuned LLM)', color: '#bc8cff' },
          { q: 'Predict protein 3D structure', ans: 'AlphaFold2 (ESMFold for fast inference)', color: '#e3b341' },
          { q: 'Annotate cell types from scRNA-seq', ans: 'scGPT → Geneformer → Random Forest on markers', color: '#f97316' },
          { q: 'Interpret variant pathogenicity', ans: 'ESM-2 zero-shot → Nucleotide Transformer → CADD score', color: '#ff6b6b' },
        ].map(c => `
          <div class="aml-chooser-item">
            <div class="aml-chooser-q">${c.q}</div>
            <div class="aml-chooser-a" style="color:${c.color}">${c.ans}</div>
          </div>`).join('')}
      </div>
    </div>`;
  }

  /* ═══════════ TAB: Workflows & Code ════════════ */
  function _tabWorkflows() {
    return `
    <div class="aml-wf-section">
      <div class="aml-sb-title" style="margin-bottom:1rem">End-to-End ML Bioinformatics Pipelines</div>
      ${[
        {
          title: 'Variant Pathogenicity Prediction (ESM-2 + XGBoost)',
          color: '#58a6ff', steps: 4,
          desc: 'Use ESM-2 embeddings as features for a gradient-boosted classifier — no labelled African variant data required for the embedding step.',
          pipeline: [
            { step: 1, name: 'Protein sequence', tool: 'Ensembl VEP', output: 'p.Glu6Val HGVS notation → full protein FASTA' },
            { step: 2, name: 'ESM-2 Embedding', tool: 'facebook/esm2_t33_650M', output: '1280-dim per-residue vector for wild-type and mutant' },
            { step: 3, name: 'Delta Embedding', tool: 'NumPy subtract', output: 'Mutant − WT difference vector captures functional shift' },
            { step: 4, name: 'XGBoost Classify', tool: 'scikit-learn XGBClassifier', output: 'Pathogenic 0.91 / Benign 0.09 with SHAP explanations' },
          ],
          code: `import esm, torch, numpy as np, xgboost as xgb\nfrom Bio import SeqIO\n\n# 1. Load ESM-2\nmodel, alphabet = esm.pretrained.esm2_t33_650M_UR50D()\nbatch_converter = alphabet.get_batch_converter()\nmodel.eval()\n\ndef embed(seq_id, sequence):\n    data = [(seq_id, sequence)]\n    _, _, tokens = batch_converter(data)\n    with torch.no_grad():\n        rep = model(tokens, repr_layers=[33])["representations"][33]\n    return rep[0].mean(0).numpy()  # mean-pool → 1280-dim\n\n# 2. Compute delta embedding for HBB p.Glu6Val\nwt = embed("HBB_WT",  "MVLSPADKTNVK...")\nmut = embed("HBB_MUT", "MVLSPADKTNVK...".replace("E","V", 1))\ndelta = mut - wt\n\n# 3. Predict with pre-trained XGBoost\nclf = xgb.XGBClassifier()\nclf.load_model("esm_xgb_pathogenicity.json")\nprob = clf.predict_proba(delta.reshape(1,-1))\nprint(f"Pathogenic: {prob[0][1]:.2%}")`
        },
        {
          title: 'scRNA-seq Cell Type Annotation (scGPT)',
          color: '#e3b341', steps: 3,
          desc: 'Fine-tune scGPT on KEMRI malaria PBMC reference atlas; transfer to new samples without retraining.',
          pipeline: [
            { step: 1, name: 'Preprocessing', tool: 'scanpy', output: 'Filtered cells (>200 genes), normalized, log1p, HVG 2000' },
            { step: 2, name: 'scGPT tokenization', tool: 'scGPT TranscriptomeTokenizer', output: 'Gene-rank tokens + expression bins per cell' },
            { step: 3, name: 'Cell annotation', tool: 'scGPT CellTypeAnnotator', output: 'Cell type labels + attention weights over marker genes' },
          ],
          code: `import scanpy as sc\nfrom scgpt.tasks import GeneEmbedding, CellAnnotation\n\n# Load African PBMC data\nadata = sc.read_h5ad("kemri_new_samples.h5ad")\n\n# Preprocess\nsc.pp.filter_cells(adata, min_genes=200)\nsc.pp.normalize_total(adata, target_sum=1e4)\nsc.pp.log1p(adata)\nsc.pp.highly_variable_genes(adata, n_top_genes=2000)\n\n# Annotate with scGPT\nannotator = CellAnnotation(\n    model_dir="scGPT_blood",\n    n_top_genes=2000,\n    batch_size=64\n)\nadata = annotator.annotate(\n    adata,\n    batch_key="sample_id",\n    cell_type_key="predicted_type"\n)\nprint(adata.obs["predicted_type"].value_counts())`
        },
        {
          title: 'Drug-Resistance AMR Prediction (Random Forest)',
          color: '#3fb950', steps: 3,
          desc: 'Predict rifampicin resistance in M. tuberculosis from SNP profiles — replicates WHO AMR catalogue logic with ML interpretability.',
          pipeline: [
            { step: 1, name: 'SNP profile', tool: 'GATK HaplotypeCaller → VCF', output: 'Binary 0/1 vector across 20 known AMR loci (rpoB, katG, etc.)' },
            { step: 2, name: 'Feature engineering', tool: 'scikit-learn', output: 'One-hot encoded mutation + SIFT score + codon position' },
            { step: 3, name: 'RF prediction', tool: 'RandomForestClassifier(n_estimators=500)', output: 'MDR label + feature importance for each mutation' },
          ],
          code: `from sklearn.ensemble import RandomForestClassifier\nfrom sklearn.model_selection import StratifiedKFold\nfrom sklearn.metrics import roc_auc_score\nimport numpy as np, pandas as pd\n\n# Load AHRI South Africa TB dataset (N=892 isolates)\ndf = pd.read_csv("ahri_tb_snp_matrix.csv")\nX = df.drop(columns=["rifampicin_resistant", "sample_id"])\ny = df["rifampicin_resistant"]\n\n# 5-fold stratified CV\nskf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)\naucs = []\nfor train, test in skf.split(X, y):\n    clf = RandomForestClassifier(n_estimators=500, class_weight="balanced")\n    clf.fit(X.iloc[train], y.iloc[train])\n    aucs.append(roc_auc_score(y.iloc[test], clf.predict_proba(X.iloc[test])[:,1]))\n\nprint(f"Mean AUC: {np.mean(aucs):.3f} ± {np.std(aucs):.3f}")\n# Feature importance → top mutation\nimport_df = pd.Series(clf.feature_importances_, index=X.columns).nlargest(5)\nprint(import_df)`
        },
      ].map(wf => `
        <div class="aml-wf-card" style="border-top:3px solid ${wf.color}">
          <div class="aml-wf-title" style="color:${wf.color}">${wf.title}</div>
          <p class="aml-wf-desc">${wf.desc}</p>
          <div class="aml-pipeline-steps">
            ${wf.pipeline.map(s => `
              <div class="aml-pipe-step">
                <div class="aml-pipe-num" style="background:${wf.color}">${s.step}</div>
                <div class="aml-pipe-info">
                  <div class="aml-pipe-name">${s.name}</div>
                  <div class="aml-pipe-tool">${s.tool}</div>
                  <div class="aml-pipe-out">${s.output}</div>
                </div>
              </div>`).join('<div class="aml-pipe-arrow">→</div>')}
          </div>
          <details class="aml-code-details">
            <summary class="aml-code-summary">View Python code</summary>
            <pre class="aml-code"><code>${_esc(wf.code)}</code></pre>
          </details>
        </div>`).join('')}
    </div>`;
  }

  /* ═══════════ TAB: Africa Applications ════════════ */
  function _tabAfrica() {
    return `
    <div class="aml-africa-section">
      <div class="aml-africa-hero">
        <div class="aml-africa-hero-title">AI for African Genomics</div>
        <p class="aml-africa-hero-sub">Most foundation models were trained predominantly on European-ancestry genomes. These initiatives are working to change that — and to build African AI capacity directly.</p>
      </div>
      <div class="aml-africa-cards">
        ${[
          { org: 'InstaDeep × H3Africa', color: '#3fb950', icon: 'dna',
            title: 'Nucleotide Transformer with African Data',
            body: 'InstaDeep partnered with H3Africa to include 3,202 diverse genomes — including African populations — in the Nucleotide Transformer pretraining corpus. This directly reduces reference bias when predicting variant effects in African cohorts.',
            impact: 'Improves splice site prediction for variants specific to African haplotypes (e.g., common HBB haplotypes in West Africa)',
            link: 'InstaDeepAI/nucleotide-transformer on Hugging Face' },
          { org: 'H3ABioNet + Deep Learning Working Group', color: '#58a6ff', icon: 'brain',
            title: 'African Bioinformatics AI Training Initiative',
            body: 'H3ABioNet runs annual deep learning workshops specifically for African bioinformaticians, covering PyTorch, graph neural networks, and LLM fine-tuning — all framed around African disease datasets (TB, malaria, sickle cell).',
            impact: 'Has trained 400+ African researchers in applied ML for genomics since 2019',
            link: 'h3abionet.org/training' },
          { org: 'Wellcome Sanger × MalariaGEN', color: '#bc8cff', icon: 'activity',
            title: 'ML-Based Malaria Drug Resistance Surveillance',
            body: 'MalariaGEN uses random forests and gradient boosting on whole-genome SNP data from 20,000+ P. falciparum samples across Africa to predict artemisinin and chloroquine resistance — with clinical implications for treatment guidelines.',
            impact: 'Identified novel kelch13 variants predictive of partial artemisinin resistance in East Africa',
            link: 'malariagen.net' },
          { org: 'AHRI, South Africa', color: '#e3b341', icon: 'shield',
            title: 'Deep Learning for MDR-TB Diagnosis',
            body: 'AHRI\'s computational team uses convolutional networks trained on chest X-ray images alongside genomic variant profiles to predict drug resistance patterns in M. tuberculosis — reducing the 6-week culture time to hours.',
            impact: 'CNN model achieved 94% accuracy on external South African TB cohort; deployed in pilot clinic study',
            link: 'ahri.ac.za' },
          { org: 'AWI-Gen Consortium', color: '#f97316', icon: 'bar-chart',
            title: 'Polygenic Risk Scores for African T2D',
            body: 'The AWI-Gen study (11,000 participants across Ghana, Kenya, South Africa, Nigeria) uses XGBoost and LDpred2 to build T2D polygenic risk scores anchored to African LD structures — which differ substantially from European reference panels.',
            impact: 'African-calibrated PRS shows 2.3× better predictive performance than Eurocentric PRS in AWI-Gen cohort',
            link: 'awigen.org' },
          { org: 'Africa CDC × GISAID × Pathoplexus', color: '#ff6b6b', icon: 'globe',
            title: 'Phylogeographic ML for Outbreak Surveillance',
            body: 'During COVID-19, African genomics labs used transformer-based phylogeographic models (TreeTime + BEAST + custom GNNs) to reconstruct SARS-CoV-2 introduction events and track variant emergence (Beta, C.1.2, XBB.1.5) across 35 African countries.',
            impact: 'Beta variant (B.1.351) first identified in South Africa via this surveillance system — informing global vaccine updates',
            link: 'africacdc.org' },
        ].map(c => `
          <div class="aml-africa-card" style="border-left:3px solid ${c.color}">
            <div class="aml-africa-card-header">
              <span class="aml-africa-org" style="color:${c.color}">${c.org}</span>
            </div>
            <div class="aml-africa-card-title">${c.title}</div>
            <p class="aml-africa-card-body">${c.body}</p>
            <div class="aml-africa-impact">
              <span class="aml-impact-label">Impact</span>
              <span>${c.impact}</span>
            </div>
          </div>`).join('')}
      </div>
    </div>`;
  }

  /* ═══════════ TAB: PRACTICE & BUILD ════════════ */

  /* ── Practice state (persists across tab switches) ── */
  let _px = {
    q1idx: 0, q1answered: null, q1score: 0, q1total: 0,
    pipeBuilt: [],
    cmAnswers: { sens: '', prec: '', spec: '', fdr: '' },
    cmChecked: false,
    featChosen: new Set(),
    featChecked: false,
    featResult: null,
  };

  const _EX1 = [
    {
      scenario: 'You have WGS data from 500 sickle cell patients and 500 healthy controls — 50,000 SNPs per sample. You need to identify which variants predict hospitalisation rate AND explain your findings to a clinical team.',
      options: ['Deep Neural Network (10 layers)', 'Random Forest with feature importance', 'k-Means Clustering', 'PCA dimensionality reduction'],
      correct: 1,
      explain: 'Random Forest ranks each SNP by Gini importance, runs well on 1,000 samples with 50,000 features, and produces decision trees clinicians can follow. Neural networks need more samples and are hard to explain. k-Means is unsupervised (no outcome label). PCA is dimension reduction, not classification.',
    },
    {
      scenario: 'You have 50,000 bulk RNA-seq samples from multiple cancers. You want to discover entirely new cancer subtypes — nobody has defined them yet and you don\'t know how many groups exist.',
      options: ['Logistic Regression (binary)', 'SVM with RBF kernel', 'Graph-based clustering (Leiden/Louvain)', 'Random Forest classifier'],
      correct: 2,
      explain: 'Subtype discovery is unsupervised. Leiden/Louvain algorithms build a k-NN graph and optimise cluster modularity — the resolution parameter explores different granularities without specifying k. All supervised methods (LR, SVM, RF) require labelled training data with predefined categories.',
    },
    {
      scenario: 'Your lab in Nairobi will classify M. tuberculosis drug resistance from 5,000 whole-genome sequences. The model must run offline on a laptop with no GPU, and needs to handle 10 antibiotics at once.',
      options: ['GPT-4 via API', 'Shallow Random Forest (compressed)', 'AlphaFold2 structure prediction', 'Large transformer with 1B parameters'],
      correct: 1,
      explain: 'A shallow RF (max_depth ≤ 10) with SNPs as binary features compresses to < 10 MB, runs in milliseconds without GPU, handles multi-label prediction (each antibiotic is a separate tree), and achieved 97% accuracy on the 10,000-genome CRyPTIC dataset. LLMs need internet/GPU; AlphaFold predicts 3D structure, not resistance; large transformers require GPU inference.',
    },
  ];

  function _tabPractice() {
    const q = _EX1[_px.q1idx];
    const q1answered = _px.q1answered !== null;
    const pipeOrder  = ['Load raw FASTQ reads','Quality control (FastQC)','Trim adapters & low-quality bases','Extract k-mer / feature matrix','Split train / validation / test sets','Fit model on training set only','Evaluate on held-out test set','Report AUC, sensitivity, specificity'];
    const pipeAvail  = pipeOrder.filter(s => !_px.pipeBuilt.includes(s));
    const pipeCorrect = _px.pipeBuilt.join('||') === pipeOrder.slice(0, _px.pipeBuilt.length).join('||');

    const cm = { tp: 87, fp: 13, fn: 9, tn: 91 };
    const cmTotal = cm.tp + cm.fp + cm.fn + cm.tn;

    return `
    <div class="aml-practice-page">
      <div class="aml-concept-box" style="border-color:rgba(227,179,65,0.3);background:rgba(227,179,65,0.05)">
        <div class="aml-concept-title" style="color:#e3b341">Practice Exercises</div>
        <p class="aml-concept-body">Four hands-on exercises — choose the right model, build a valid pipeline, interpret a real classifier output, and identify biologically meaningful features. These are decisions you make daily as an applied ML bioinformatician.</p>
      </div>

      <!-- ══ Exercise 1: Model Selection ══ -->
      <div class="aml-ex-card">
        <div class="aml-ex-header">
          <span class="aml-ex-num">01</span>
          <div>
            <div class="aml-ex-title">Choose the Right Model</div>
            <div class="aml-ex-sub">Scenario ${_px.q1idx + 1} of ${_EX1.length} — select the best ML approach</div>
          </div>
          <div class="aml-ex-score">${_px.q1score}/${_px.q1total} correct</div>
        </div>
        <div class="aml-ex-body">
          <div class="aml-scenario-box">${q.scenario}</div>
          <div class="aml-options-grid">
            ${q.options.map((opt, i) => {
              let cls = 'aml-option-btn';
              if (q1answered) cls += i === q.correct ? ' opt-correct' : (i === _px.q1answered ? ' opt-wrong' : ' opt-dim');
              return `<button class="${cls}" onclick="OmicsLab.AIMLBio._answerQ1(${i})" ${q1answered ? 'disabled' : ''}>${opt}</button>`;
            }).join('')}
          </div>
          ${q1answered ? `
            <div class="aml-feedback-box ${_px.q1answered === q.correct ? 'fb-correct' : 'fb-wrong'}">
              <strong>${_px.q1answered === q.correct ? 'Correct!' : 'Not quite —'}</strong> ${q.explain}
            </div>
            ${_px.q1idx < _EX1.length - 1
              ? `<button class="aml-next-btn" onclick="OmicsLab.AIMLBio._nextQ1()">Next scenario →</button>`
              : `<div class="aml-ex-complete">All scenarios complete — score: ${_px.q1score}/${_px.q1total}</div>`}
          ` : ''}
        </div>
      </div>

      <!-- ══ Exercise 2: Pipeline Builder ══ -->
      <div class="aml-ex-card">
        <div class="aml-ex-header">
          <span class="aml-ex-num">02</span>
          <div>
            <div class="aml-ex-title">Build an ML Analysis Pipeline</div>
            <div class="aml-ex-sub">Click the steps in the correct order for a DNA sequence classifier</div>
          </div>
        </div>
        <div class="aml-ex-body">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1rem">
            <div>
              <div class="aml-ex-section-label">Available steps — click to add</div>
              <div class="aml-pipe-available" id="aml-pipe-avail">
                ${pipeAvail.map(s => `<button class="aml-pipe-step-btn" onclick="OmicsLab.AIMLBio._addPipeStep('${s.replace(/'/g, "\\'")}')">${s}</button>`).join('')}
                ${pipeAvail.length === 0 ? '<div class="aml-pipe-done">All steps placed!</div>' : ''}
              </div>
            </div>
            <div>
              <div class="aml-ex-section-label">Your pipeline (${_px.pipeBuilt.length}/${pipeOrder.length} steps)</div>
              <div class="aml-pipe-built">
                ${_px.pipeBuilt.map((s, i) => {
                  const correct = s === pipeOrder[i];
                  return `<div class="aml-pipe-built-step ${correct ? 'step-ok' : 'step-err'}">
                    <span class="aml-pipe-step-n">${i + 1}</span>
                    <span>${s}</span>
                  </div>`;
                }).join('')}
                ${_px.pipeBuilt.length === 0 ? '<div style="font-size:.76rem;color:#484f58;padding:.5rem">Click steps on the left to build your pipeline</div>' : ''}
              </div>
              ${_px.pipeBuilt.length > 0 ? `<button class="aml-reset-btn" onclick="OmicsLab.AIMLBio._resetPipe()">Reset pipeline</button>` : ''}
            </div>
          </div>
          ${!pipeCorrect && _px.pipeBuilt.length > 0 ? `
            <div class="aml-feedback-box fb-wrong" style="font-size:.77rem">
              Step ${_px.pipeBuilt.length} is incorrect. Hint: <em>${pipeOrder[_px.pipeBuilt.length - 1] === _px.pipeBuilt[_px.pipeBuilt.length - 1] ? pipeOrder[_px.pipeBuilt.length]?.split(' ').slice(0,2).join(' ') + '…' : 'think about what needs to happen before "' + _px.pipeBuilt[_px.pipeBuilt.length - 1] + '"'}</em>
            </div>` : ''}
          ${_px.pipeBuilt.length === pipeOrder.length && pipeCorrect ? `
            <div class="aml-feedback-box fb-correct">Pipeline complete and correct! Key rule: always split data BEFORE fitting the model to prevent data leakage.</div>` : ''}
        </div>
      </div>

      <!-- ══ Exercise 3: Confusion Matrix ══ -->
      <div class="aml-ex-card">
        <div class="aml-ex-header">
          <span class="aml-ex-num">03</span>
          <div>
            <div class="aml-ex-title">Interpret a Classifier</div>
            <div class="aml-ex-sub">A Random Forest predicts MDR-TB resistance from SNPs. Calculate the metrics below.</div>
          </div>
        </div>
        <div class="aml-ex-body">
          <div style="display:grid;grid-template-columns:auto 1fr;gap:1.5rem;align-items:start">
            <div>
              <div class="aml-ex-section-label" style="margin-bottom:.5rem">Confusion matrix (n=${cmTotal})</div>
              <table class="aml-cm-tbl">
                <thead><tr><th></th><th>Predicted +</th><th>Predicted −</th></tr></thead>
                <tbody>
                  <tr><td><strong>Actual +</strong></td><td class="aml-cm-tp">TP = ${cm.tp}</td><td class="aml-cm-fn">FN = ${cm.fn}</td></tr>
                  <tr><td><strong>Actual −</strong></td><td class="aml-cm-fp">FP = ${cm.fp}</td><td class="aml-cm-tn">TN = ${cm.tn}</td></tr>
                </tbody>
              </table>
              <div style="font-size:.68rem;color:#6e7681;margin-top:.4rem">+ = MDR-TB resistant &nbsp;|&nbsp; − = susceptible</div>
            </div>
            <div>
              <div class="aml-ex-section-label" style="margin-bottom:.5rem">Your calculations (enter % rounded to nearest whole number)</div>
              <div class="aml-cm-inputs">
                ${[
                  ['sens', 'Sensitivity (Recall)  = TP / (TP + FN)', Math.round(cm.tp / (cm.tp + cm.fn) * 100)],
                  ['spec', 'Specificity           = TN / (TN + FP)', Math.round(cm.tn / (cm.tn + cm.fp) * 100)],
                  ['prec', 'Precision (PPV)       = TP / (TP + FP)', Math.round(cm.tp / (cm.tp + cm.fp) * 100)],
                  ['fdr',  'False Discovery Rate  = FP / (FP + TP)', Math.round(cm.fp / (cm.fp + cm.tp) * 100)],
                ].map(([key, lbl, ans]) => {
                  const val  = _px.cmAnswers[key];
                  const ok   = _px.cmChecked && parseInt(val) === ans;
                  const bad  = _px.cmChecked && parseInt(val) !== ans;
                  return `<div class="aml-cm-row">
                    <span class="aml-cm-lbl">${lbl}</span>
                    <div style="display:flex;align-items:center;gap:.4rem">
                      <input class="aml-cm-input ${ok ? 'cm-ok' : bad ? 'cm-bad' : ''}" type="number" min="0" max="100"
                        value="${val}" placeholder="?"
                        oninput="OmicsLab.AIMLBio._cmInput('${key}', this.value)"/>
                      <span>%</span>
                      ${_px.cmChecked ? `<span class="${ok ? 'cm-tick' : 'cm-cross'}">${ok ? '✓' : '✗ ' + ans + '%'}</span>` : ''}
                    </div>
                  </div>`;
                }).join('')}
              </div>
              <div style="display:flex;gap:.5rem;margin-top:.75rem;align-items:center">
                <button class="aml-next-btn" onclick="OmicsLab.AIMLBio._checkCM()">Check answers</button>
                ${_px.cmChecked ? '<button class="aml-reset-btn" onclick="OmicsLab.AIMLBio._resetCM()">Reset</button>' : ''}
              </div>
              ${_px.cmChecked ? `
                <div class="aml-feedback-box ${Object.entries({sens: Math.round(cm.tp/(cm.tp+cm.fn)*100), spec: Math.round(cm.tn/(cm.tn+cm.fp)*100), prec: Math.round(cm.tp/(cm.tp+cm.fp)*100), fdr: Math.round(cm.fp/(cm.fp+cm.tp)*100)}).every(([k,v]) => parseInt(_px.cmAnswers[k]) === v) ? 'fb-correct' : 'fb-wrong'}" style="margin-top:.6rem;font-size:.76rem">
                  For MDR-TB screening, <strong>sensitivity (${Math.round(cm.tp/(cm.tp+cm.fn)*100)}%)</strong> matters most — missing a resistant case risks treatment failure. The FDR (${Math.round(cm.fp/(cm.fp+cm.tp)*100)}%) tells you how often the test cries wolf. Trade-offs depend on clinical context.
                </div>` : ''}
            </div>
          </div>
        </div>
      </div>

      <!-- ══ Exercise 4: Feature Selection ══ -->
      <div class="aml-ex-card">
        <div class="aml-ex-header">
          <span class="aml-ex-num">04</span>
          <div>
            <div class="aml-ex-title">Feature Selection</div>
            <div class="aml-ex-sub">Select only biologically valid features — avoid leakage and noise</div>
          </div>
        </div>
        <div class="aml-ex-body">
          <p class="aml-scenario-box">You are training a Random Forest to classify pathogenic vs. benign DNA variants. Your dataset has 9 candidate features. Select only the features with genuine biological signal — including anything else would introduce data leakage or add noise with no predictive value.</p>
          <div class="aml-feat-grid">
            ${ALL_FEATS.map(f => {
              const active = _px.featChosen.has(f);
              const isGood = GOOD_FEATS.includes(f);
              let cls = 'aml-feat-chip' + (active ? ' feat-active' : '');
              if (_px.featChecked) cls += active && isGood ? ' feat-ok' : active && !isGood ? ' feat-bad' : !active && isGood ? ' feat-missed' : '';
              return `<button class="${cls}" onclick="OmicsLab.AIMLBio._featToggle('${f.replace(/'/g, '\\u0027')}')" ${_px.featChecked ? 'disabled' : ''}>${f}</button>`;
            }).join('')}
          </div>
          <div style="display:flex;gap:.5rem;margin-top:.85rem;align-items:center;flex-wrap:wrap">
            <button class="aml-next-btn" onclick="OmicsLab.AIMLBio._checkFeats()" ${_px.featChecked ? 'disabled' : ''}>Check selection</button>
            ${_px.featChecked ? `<button class="aml-reset-btn" onclick="OmicsLab.AIMLBio._resetFeats()">Try again</button>` : ''}
          </div>
          ${_px.featChecked ? (() => {
            const correct = GOOD_FEATS.every(f => _px.featChosen.has(f)) && [..._px.featChosen].every(f => GOOD_FEATS.includes(f));
            return `<div class="aml-feedback-box ${correct ? 'fb-correct' : 'fb-wrong'}" style="margin-top:.65rem;font-size:.76rem">
              ${correct
                ? '<strong>Excellent!</strong> All five biological features selected. GC content, k-mer profiles, entropy, conservation, and codon bias directly capture sequence-level signals linked to pathogenicity and function.'
                : `<strong>Not quite.</strong> Valid features: <em>${GOOD_FEATS.join(', ')}</em>. Avoid administrative metadata (collection date, initials, timestamps, filenames) — models that learn these patterns will fail on new samples and give a false sense of accuracy.`}
            </div>`;
          })() : ''}
        </div>
      </div>

    </div>`;
  }

  /* ── Exercise 1 handlers ── */
  function _answerQ1(i) {
    if (_px.q1answered !== null) return;
    _px.q1answered = i;
    _px.q1total++;
    if (i === _EX1[_px.q1idx].correct) _px.q1score++;
    setTab('practice');
  }

  function _nextQ1() {
    _px.q1idx   = (_px.q1idx + 1) % _EX1.length;
    _px.q1answered = null;
    setTab('practice');
  }

  /* ── Exercise 2 handlers ── */
  const _PIPE_ORDER = ['Load raw FASTQ reads','Quality control (FastQC)','Trim adapters & low-quality bases','Extract k-mer / feature matrix','Split train / validation / test sets','Fit model on training set only','Evaluate on held-out test set','Report AUC, sensitivity, specificity'];

  function _addPipeStep(step) {
    if (_px.pipeBuilt.includes(step)) return;
    _px.pipeBuilt.push(step);
    setTab('practice');
  }

  function _resetPipe() {
    _px.pipeBuilt = [];
    setTab('practice');
  }

  /* ── Exercise 3 handlers ── */
  function _cmInput(key, val) { _px.cmAnswers[key] = val; }

  function _checkCM() {
    _px.cmChecked = true;
    setTab('practice');
  }

  function _resetCM() {
    _px.cmAnswers = { sens: '', prec: '', spec: '', fdr: '' };
    _px.cmChecked = false;
    setTab('practice');
  }

  /* ── Exercise 4 handlers ── */
  function _featToggle(f) {
    if (_px.featChecked) return;
    if (_px.featChosen.has(f)) _px.featChosen.delete(f); else _px.featChosen.add(f);
    setTab('practice');
  }

  function _checkFeats() {
    _px.featChecked = true;
    setTab('practice');
  }

  function _resetFeats() {
    _px.featChosen = new Set();
    _px.featChecked = false;
    setTab('practice');
  }

  /* ─── Helpers ─── */
  function selectModel(id) { _modelId = id; setTab('llms'); }
  function _esc(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  return { init, setTab, selectModel, runForwardPass, resetNN, _answerQ1, _nextQ1, _addPipeStep, _resetPipe, _cmInput, _checkCM, _resetCM, _featToggle, _checkFeats, _resetFeats };
})();
