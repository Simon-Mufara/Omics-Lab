/* ═══════════════════════════════════════════════════════════════
   OmicsLab — Global Search
   Full-text search across workflows, diseases, tools, equipment,
   and Q&A answers. Keyboard accessible. Offline-ready.
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.Search = (function () {

  let _index = null;
  let _open  = false;
  const RECENT_KEY = 'omicslab_search_recent';

  function _getRecent() {
    try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]'); } catch { return []; }
  }
  function _addRecent(title, action) {
    const list = _getRecent().filter(r => r.title !== title).slice(0, 5);
    list.unshift({ title, ts: Date.now() });
    try { localStorage.setItem(RECENT_KEY, JSON.stringify(list)); } catch {}
  }

  /* ─── Build the search index from existing data ─── */
  function _buildIndex() {
    if (_index) return _index;
    _index = [];

    /* Workflows */
    try {
      Object.values(OmicsLab.Workflows || {}).forEach(domain => {
        if (!domain || !domain.workflows) return;
        domain.workflows.forEach(wf => {
          _index.push({
            type: 'workflow',
            icon: '🧪',
            title: wf.name || wf.id,
            desc: wf.desc || wf.description || domain.label || '',
            tags: [domain.label, wf.disease, wf.id].filter(Boolean).join(' '),
            action: () => {
              document.getElementById('domain-section')?.scrollIntoView({ behavior: 'smooth' });
            },
            section: 'Workflows',
          });
        });
      });
    } catch {}

    /* Diseases */
    try {
      const diseases = OmicsLab.DISEASES || [];
      (Array.isArray(diseases) ? diseases : Object.values(diseases)).forEach(d => {
        if (!d || !d.name) return;
        _index.push({
          type: 'disease',
          icon: '🦠',
          title: d.name,
          desc: d.category ? `${d.category} · ${d.stats || ''}` : (d.stats || ''),
          tags: [d.category, d.name, ...(d.biomarkers || []), ...(d.workflows || [])].filter(Boolean).join(' '),
          action: () => {
            document.getElementById('disease-explorer-section')?.scrollIntoView({ behavior: 'smooth' });
          },
          section: 'Disease Explorer',
        });
      });
    } catch {}

    /* Tools */
    try {
      const tools = OmicsLab.TOOLS || [];
      (Array.isArray(tools) ? tools : Object.values(tools)).forEach(t => {
        if (!t || !t.name) return;
        _index.push({
          type: 'tool',
          icon: '🛠️',
          title: t.name,
          desc: t.desc || t.description || t.category || '',
          tags: [t.name, t.category, t.input, t.output, t.use].filter(Boolean).join(' '),
          action: () => {
            document.getElementById('tool-explorer-section')?.scrollIntoView({ behavior: 'smooth' });
          },
          section: 'Tool Explorer',
        });
      });
    } catch {}

    /* Equipment / Gallery */
    try {
      const equip = OmicsLab.EQUIPMENT || OmicsLab.Gallery || [];
      (Array.isArray(equip) ? equip : Object.values(equip)).forEach(e => {
        if (!e || !e.name) return;
        _index.push({
          type: 'equipment',
          icon: '🔬',
          title: e.name,
          desc: e.manufacturer ? `${e.manufacturer} · ${e.type || ''}` : (e.type || e.category || ''),
          tags: [e.name, e.manufacturer, e.type, e.category, ...(e.applications || [])].filter(Boolean).join(' '),
          action: () => {
            document.getElementById('equipment-gallery-section')?.scrollIntoView({ behavior: 'smooth' });
          },
          section: 'Equipment Gallery',
        });
      });
    } catch {}

    /* Q&A entries */
    try {
      const qa = OmicsLab.QAEngine?._entries || OmicsLab.QA_DATA || [];
      (Array.isArray(qa) ? qa : Object.values(qa)).forEach(q => {
        if (!q || !q.q) return;
        _index.push({
          type: 'qa',
          icon: '💬',
          title: q.q,
          desc: typeof q.a === 'string' ? q.a.slice(0, 120) + (q.a.length > 120 ? '…' : '') : '',
          tags: [q.q, q.category, ...(q.tags || [])].filter(Boolean).join(' '),
          action: () => {
            const qaInput = document.getElementById('qa-input');
            document.getElementById('qa-section')?.scrollIntoView({ behavior: 'smooth' });
            if (qaInput) { qaInput.value = q.q; qaInput.dispatchEvent(new Event('input')); }
          },
          section: 'Ask OmicsLab',
        });
      });
    } catch {}

    /* Repositories */
    try {
      const repos = OmicsLab.REPOSITORIES || [];
      (Array.isArray(repos) ? repos : Object.values(repos)).forEach(r => {
        if (!r || !r.name) return;
        _index.push({
          type: 'repo',
          icon: '🗄️',
          title: r.name,
          desc: r.desc || r.description || '',
          tags: [r.name, r.category, r.url].filter(Boolean).join(' '),
          action: () => {
            document.getElementById('repo-explorer-section')?.scrollIntoView({ behavior: 'smooth' });
          },
          section: 'Data Repositories',
        });
      });
    } catch {}

    /* Static section entries for navigation */
    const staticEntries = [
      { icon: '🧬', title: 'Bioinformatics Pipeline Guide', desc: 'Follow a complete WGS pipeline from FASTQ to variant annotation', section: 'Learn', sectionId: 'bioinfo-pipeline-section' },
      { icon: '⚙️', title: 'HPC Training', desc: 'SLURM job builder, queue simulator, workflow engines', section: 'Learn', sectionId: 'hpc-training-section' },
      { icon: '🎓', title: 'Curriculum Learning Paths', desc: 'Wet-Lab, Bioinformatician, and Public Health tracks', section: 'Learn', sectionId: 'curriculum-section' },
      { icon: '🏆', title: 'Badges & Certificates', desc: '17 achievements with printable PDF certificates', section: 'Learn', sectionId: 'badges-section' },
      { icon: '🌍', title: 'Africa Science Hub', desc: 'H3Africa, data governance, population genomics, One Health', section: 'Africa', sectionId: 'africa-hub-section' },
      { icon: '🗺️', title: 'Africa Genomics Map', desc: 'Interactive map of 20+ active genomics labs across Africa', section: 'Africa', sectionId: 'africa-map-section' },
      { icon: '♻️', title: 'Reproducibility Hub', desc: 'Submit studies, get FAIR scores, browse community research', section: 'Research', sectionId: 'repro-hub-section' },
      { icon: '🔭', title: 'Research Project Mode', desc: 'Design a reproducible omics study from scratch', section: 'Research', sectionId: 'research-mode-section' },
      { icon: '🏫', title: 'Workshop & Instructor Mode', desc: 'Create sessions, track student progress, export reports', section: 'Research', sectionId: 'workshop-section' },
      { icon: '⚖️', title: 'Compare Workflows', desc: 'Side-by-side cost, time, and instrument comparison', section: 'Lab', sectionId: 'compare-section' },
      { icon: '🔧', title: 'Pipeline Sandbox', desc: 'Drag-and-drop bioinformatics pipeline builder', section: 'Lab', sectionId: 'sandbox-section' },
      { icon: '🎯', title: 'Error Injection / Sabotage Mode', desc: 'Find hidden errors in wet-lab steps — teaching mode', section: 'Lab', sectionId: 'sabotage-section' },
    ];

    staticEntries.forEach(e => {
      _index.push({
        type: 'section',
        icon: e.icon,
        title: e.title,
        desc: e.desc,
        tags: e.title + ' ' + e.desc,
        action: () => document.getElementById(e.sectionId)?.scrollIntoView({ behavior: 'smooth' }),
        section: e.section,
      });
    });

    /* All router pages — navigate to route on select */
    const PAGE_ENTRIES = [
      { route:'lab',             icon:'🧪', title:'Lab Simulator',          desc:'14 interactive wet-lab protocols — WGS, RNA-seq, metagenomics, ATAC-seq', tags:'lab protocol simulation omics genome sequencing' },
      { route:'analysis',        icon:'📊', title:'Analysis Suite',          desc:'FASTQ QC, FASTA tools, VCF explorer, expression matrix, MSA viewer', tags:'analysis fastq vcf fasta quality control bioinformatics' },
      { route:'terminal',        icon:'🖥️', title:'Terminal / Codespaces',   desc:'Browser shell with pipeline simulation + GitHub Codespaces integration', tags:'terminal bash shell pipeline codespace linux' },
      { route:'outbreak',        icon:'🔴', title:'Outbreak Simulator',       desc:'Genomic outbreak simulation — phylo trees, contact tracing, index case', tags:'outbreak phylogenetics epidemiology genomic surveillance' },
      { route:'alerts',          icon:'🚨', title:'Outbreak Alerts',          desc:'Live African disease outbreak feed with genomic surveillance notes', tags:'alerts disease surveillance outbreak africa' },
      { route:'datasets',        icon:'🗂️', title:'African Datasets',         desc:'20 curated African omics datasets from SRA, ENA, GISAID', tags:'datasets africa sra ena genomics download' },
      { route:'career',          icon:'🧭', title:'Career Path Quiz',          desc:'Personalised genomics career roadmap + African employer guide', tags:'career bioinformatics job genomics africa' },
      { route:'leaderboard',     icon:'🏆', title:'Leaderboard',              desc:'Global rankings, streaks, world map of 80+ OmicsLab learners', tags:'leaderboard rank score achievement gamification' },
      { route:'protocols',       icon:'🔬', title:'Protocols',                desc:'Community-contributed lab protocols from African genomics researchers', tags:'protocols method lab africa wetlab' },
      { route:'collab',          icon:'🤝', title:'Live Collaboration',       desc:'WebRTC peer-to-peer lab sessions with real-time sync', tags:'collaboration webrtc realtime co-work peer' },
      { route:'grant',           icon:'📝', title:'Grant Generator',           desc:'NIH Fogarty, Wellcome Trust, H3Africa grant sections offline', tags:'grant funding NIH Wellcome H3Africa Africa writing' },
      { route:'debugger',        icon:'🔬', title:'Protocol Debugger',         desc:'200+ rules — root cause, biology, and corrective actions', tags:'debug protocol error QC fix diagnosis' },
      { route:'phylo',           icon:'🌿', title:'Phylo Tree Builder',         desc:'Neighbor-Joining and UPGMA trees from FASTA — SVG, Newick export', tags:'phylogenetics tree UPGMA NJ FASTA newick evolution' },
      { route:'peerreview',      icon:'📋', title:'Peer Review Simulator',      desc:'3 virtual reviewers with ACMG/stats/ethics rubrics', tags:'peer review manuscript paper critique statistics ethics' },
      { route:'heatmap',         icon:'🔥', title:'Expression Visualiser',      desc:'Volcano plot, heatmap, and ranked DE table from DESeq2/edgeR output', tags:'heatmap volcano deseq2 edger expression rnaseq differential' },
      { route:'journalclub',     icon:'📰', title:'Journal Club',               desc:'20+ landmark African genomics papers with plain-language summaries', tags:'journal club paper summary africa genomics landmark' },
      { route:'citations',       icon:'📚', title:'Citation Manager',           desc:'APA, Vancouver, Nature, BibTeX, RIS export — stored offline', tags:'citation reference bib bibtex apa vancouver latex' },
      { route:'quizbattle',      icon:'⚔️', title:'Quiz Battle',                desc:'65+ questions across 12 omics categories — solo or multiplayer', tags:'quiz battle omics questions categories knowledge test' },
      { route:'qualitypredictor',icon:'🔬', title:'Quality Predictor',          desc:'Logistic regression over GATK, ENCODE and H3Africa QC thresholds', tags:'quality predictor QC metric WGS sequencing GATK ENCODE' },
      { route:'variantinterp',   icon:'🧬', title:'Variant Interpreter',        desc:'ACMG/AMP 2015 criteria, gnomAD African AF, ClinVar significance', tags:'variant ACMG ClinVar gnomAD VCF pathogenic benign interpretation' },
      { route:'primerdesign',    icon:'🔬', title:'Primer Design',               desc:'Wallace Tm, GC%, self-complementarity, dimer checks, 6 Africa pathogen templates', tags:'primer PCR design Tm GC complementarity amplicon' },
      { route:'nexus',           icon:'💬', title:'Nexus Hub',                   desc:'Research communication — channels, threads, @mentions, pinned resources', tags:'nexus chat channel thread mention community discuss' },
      { route:'teams',           icon:'📹', title:'Research Teams',              desc:'Video meetings — rooms, screen share, hands, live collaboration', tags:'teams video meeting conference call collaboration' },
      { route:'paperhub',        icon:'📄', title:'PaperHub',                   desc:'African genomics research library — browse, save, cite, discuss papers', tags:'paper library research Africa genomics literature review' },
      { route:'pubmed',          icon:'📰', title:'PubMed Search',               desc:'Live 36M citations with Africa-first filter + Article Analyser', tags:'pubmed ncbi literature search abstract citation africa' },
      { route:'gene-lookup',     icon:'🔍', title:'Gene Lookup',                 desc:'Ensembl annotation, transcripts, phenotypes, AlphaFold, gnomAD', tags:'gene ensembl annotation transcript phenotype lookup search' },
      { route:'protein',         icon:'🧬', title:'Protein Viewer',              desc:'AlphaFold structure predictions — pLDDT, 3D viewer, PDB download', tags:'protein structure alphafold 3D pdb mmcif plddt' },
      { route:'uniprot',         icon:'🔖', title:'UniProt Search',              desc:'215M+ proteins — Swiss-Prot function, disease, cross-links', tags:'uniprot protein function disease swissprot trembl annotation' },
      { route:'targets',         icon:'🎯', title:'Open Targets',               desc:'Disease-gene associations — genetic, drug, pathway, literature scores', tags:'open targets disease gene association drug target' },
      { route:'string',          icon:'🕸️', title:'STRING Network',              desc:'Protein-protein interaction network — experimental, co-expression', tags:'string PPI protein interaction network co-expression' },
      { route:'preprints',       icon:'📑', title:'Preprints',                   desc:'bioRxiv & medRxiv — Africa-first filter, Article Analyser', tags:'preprint biorxiv medrxiv africa filter article' },
      { route:'pathways',        icon:'🔬', title:'Pathways',                    desc:'KEGG disease pathway maps + Reactome browser — Africa diseases', tags:'pathway KEGG reactome disease malaria TB HIV metabolism' },
      { route:'sra',             icon:'🗄️', title:'SRA Browser',                desc:'NCBI Sequence Read Archive — curated Africa datasets, download', tags:'SRA NCBI sequencing archive Africa download fastq data' },
      { route:'knowledge-graph', icon:'🕸️', title:'Knowledge Graph',            desc:'Diseases · genes · tools · populations as force-directed graph', tags:'knowledge graph network disease gene tool population africa' },
      { route:'ai',              icon:'🤖', title:'AI Assistant',               desc:'Claude-powered genomics expert — streaming answers, Africa-focused', tags:'AI claude assistant genomics expert Africa answer help' },
      { route:'thesis',          icon:'📝', title:'Thesis Coach',               desc:'5-chapter tracker, AI draft, abstract writer, word-count progress', tags:'thesis writing PhD dissertation abstract chapter coach' },
      { route:'bionlp',          icon:'🔬', title:'BioNLP',                     desc:'Offline biomedical entity recognition — genes, diseases, variants', tags:'NLP biomedical text mining entity recognition variant gene disease' },
      { route:'codon',           icon:'🧬', title:'Codon Usage',                desc:'RSCU codon usage bias — human, M. tuberculosis, P. falciparum', tags:'codon usage RSCU bias MTB malaria falciparum human expression' },
      { route:'nanopore',        icon:'🔬', title:'Nanopore QC',                desc:'Oxford Nanopore QC — NanoStat thresholds for field sequencing', tags:'nanopore ONT MinION field sequencing QC N50 quality' },
      { route:'amr',             icon:'🛡️', title:'AMR Profiler',               desc:'MDR-TB, XDR-TB, CRE, ESBL classification from mutation profiles', tags:'AMR antibiotic resistance MDR XDR TB CRE ESBL mutation' },
      { route:'kraken',          icon:'🦠', title:'Metagenomics',               desc:'Kraken2-style taxonomy simulation — 6 African field sample profiles', tags:'metagenomics kraken2 taxonomy microbiome classification Africa' },
      { route:'popstruct',       icon:'📊', title:'Pop Structure',              desc:'ADMIXTURE + PCA for AWI-Gen, 1000G African, and SCD cohorts', tags:'population structure ADMIXTURE PCA Africa AWI ancestry' },
      { route:'genome-browser',  icon:'🔭', title:'Genome Browser',             desc:'IGV-style browser — HBB, G6PD, APOL1, CYP2D6 loci', tags:'genome browser IGV tracks HBB G6PD APOL1 CYP2D6 variant' },
      { route:'directory',       icon:'👥', title:'Researcher Directory',       desc:'Africa bioinformatics researchers — search by country, role', tags:'directory researcher Africa bioinformatics register network' },
      { route:'hackathon',       icon:'⚡', title:'Hackathon',                  desc:'Africa bioinformatics hackathon — challenges, teams, leaderboard', tags:'hackathon challenge team Africa bioinformatics coding' },
      { route:'mentorship',      icon:'🤝', title:'Mentorship',                 desc:'Peer mentorship network — students with experienced researchers', tags:'mentorship mentor student Africa bioinformatics network' },
      { route:'h3africa',        icon:'🌍', title:'H3Africa Portal',            desc:'H3Africa projects, datasets, tools, training resources', tags:'H3Africa genome Africa cohort consortium dataset training' },
      { route:'pathogen-tracker',icon:'🛡️', title:'Pathogen Tracker',          desc:'Africa pathogen genomics — SARS-CoV-2, TB, malaria, mpox, cholera', tags:'pathogen tracker Africa SARS malaria mpox cholera TB surveillance' },
      { route:'glossary',        icon:'📖', title:'Glossary',                   desc:'200+ terms in English, Swahili, Hausa, Yoruba, Amharic, French', tags:'glossary dictionary terms bioinformatics multilingual Africa' },
      { route:'offline-data',    icon:'📦', title:'Offline Data Packages',      desc:'H3Africa, malaria, TB, SCD, ancestry reference for low-bandwidth', tags:'offline data package download bandwidth Africa lowres cache' },
      { route:'labnotebook',     icon:'📓', title:'Lab Notebook',               desc:'Offline structured research entries — experiments, protocols, results', tags:'lab notebook research entries offline structured' },
      { route:'pipeline-gen',    icon:'⚙️', title:'Pipeline Generator',         desc:'Snakemake and Nextflow DSL2 pipeline boilerplate — WGS, RNA-seq, GWAS', tags:'pipeline snakemake nextflow generator WGS rnaseq GWAS boilerplate' },
      { route:'metaanalysis',    icon:'📈', title:'Meta-analysis',              desc:'Fixed/random effects with forest plot — Africa GWAS cohorts', tags:'meta analysis forest plot fixed random GWAS Africa effect size' },
      { route:'api-docs',        icon:'⌨️', title:'Developer API Docs',         desc:'Embed modules, set context, build extensions — public JS API', tags:'API developer docs embed JavaScript extension module SDK' },
      { route:'certification',   icon:'🎓', title:'Certification',              desc:'Track learning progress, earn badges, downloadable certificate', tags:'certification certificate badge learning progress Africa' },
      { route:'impact',          icon:'📡', title:'Impact Observatory',         desc:'OmicsLab reach: users, countries, analyses, tool metrics', tags:'impact metrics users countries analytics Africa usage' },
      { route:'partners',        icon:'🤝', title:'Partners',                   desc:'Organisations and people making OmicsLab possible', tags:'partners sponsors collaborators H3Africa WHO Wellcome KEMRI' },
      { route:'output-tracker',  icon:'📋', title:'Output Tracker',             desc:'Track publications, datasets, talks, grants — CSV/BibTeX export', tags:'output publication dataset grant talk poster research track' },
      { route:'settings',        icon:'⚙️', title:'Settings',                   desc:'Appearance, language, API keys, data privacy, about', tags:'settings theme language accent privacy data API keys' },
    ];

    PAGE_ENTRIES.forEach(e => {
      _index.push({
        type: 'page',
        icon: e.icon,
        title: e.title,
        desc: e.desc,
        tags: e.tags,
        route: e.route,
        action: () => OmicsLab.Router?.navigate(e.route),
        section: 'Pages',
      });
    });

    /* Knowledge Graph nodes */
    try {
      (OmicsLab.KnowledgeGraph?._nodes || []).forEach(n => {
        if (!n || !n.label) return;
        _index.push({
          type: 'graph-node',
          icon: n.type === 'disease' ? '🦠' : n.type === 'gene' ? '🧬' : n.type === 'tool' ? '🛠️' : n.type === 'population' ? '👥' : '🌍',
          title: n.label,
          desc: (n.desc || '').slice(0, 120),
          tags: `${n.label} ${n.type} ${n.desc || ''} Africa knowledge graph`,
          action: () => { OmicsLab.Router?.navigate('knowledge-graph'); setTimeout(() => OmicsLab.KnowledgeGraph?._select(n.id), 400); },
          section: 'Knowledge Graph',
        });
      });
    } catch {}

    return _index;
  }

  /* ─── Score a query against an entry ─── */
  function _score(entry, query) {
    const q = query.toLowerCase();
    const titleLow = (entry.title || '').toLowerCase();
    const tagsLow  = (entry.tags  || '').toLowerCase();
    const descLow  = (entry.desc  || '').toLowerCase();
    if (titleLow.startsWith(q)) return 100;
    if (titleLow.includes(q)) return 80;
    if (tagsLow.includes(q)) return 60;
    if (descLow.includes(q)) return 40;
    /* Word-by-word fuzzy */
    const words = q.split(/\s+/).filter(Boolean);
    if (words.length > 1) {
      const allMatch = words.every(w => tagsLow.includes(w) || descLow.includes(w));
      if (allMatch) return 50;
      const anyMatch = words.some(w => titleLow.includes(w) || tagsLow.includes(w));
      if (anyMatch) return 30;
    }
    return 0;
  }

  /* ─── Run search ─── */
  function _search(query) {
    if (!query || query.trim().length < 2) return [];
    const idx = _buildIndex();
    return idx
      .map(entry => ({ entry, score: _score(entry, query.trim()) }))
      .filter(x => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 24)
      .map(x => x.entry);
  }

  /* ─── Render results ─── */
  function _renderResults(results, query) {
    const box = document.getElementById('search-results-box');
    if (!box) return;

    if (!query || query.trim().length < 2) {
      const recents = _getRecent();
      box.innerHTML = `
        <div class="search-empty">
          <div class="search-empty-icon">🔍</div>
          <div>Search across 60+ pages, diseases, genes, tools, papers, and more</div>
          ${recents.length ? `
            <div class="search-group-label" style="margin-top:.85rem">Recent searches</div>
            <div class="search-hints">
              ${recents.map(r => `<span class="search-hint-chip search-hint-recent" onclick="document.getElementById('search-input').value='${_esc(r.title)}';OmicsLab.Search._triggerSearch()">${_esc(r.title)}</span>`).join('')}
            </div>` : ''}
          <div class="search-group-label" style="margin-top:.85rem">Try searching for…</div>
          <div class="search-hints">
            ${['malaria','RNA-seq','GATK','H3Africa','APOL1','nanopore','ACMG','metagenomics'].map(t =>
              `<span class="search-hint-chip" onclick="document.getElementById('search-input').value='${t}';OmicsLab.Search._triggerSearch()">${t}</span>`).join('')}
          </div>
        </div>`;
      return;
    }

    if (results.length === 0) {
      box.innerHTML = `
        <div class="search-empty">
          <div class="search-empty-icon">😕</div>
          <div>No results for "<strong>${_esc(query)}</strong>"</div>
          <div style="margin-top:.5rem;color:var(--text-muted);font-size:.85rem">Try searching for a disease name, workflow type, or tool name</div>
        </div>`;
      return;
    }

    /* Group by section */
    const groups = {};
    results.forEach(r => {
      if (!groups[r.section]) groups[r.section] = [];
      groups[r.section].push(r);
    });

    const html = Object.entries(groups).map(([section, items]) => `
      <div class="search-group">
        <div class="search-group-label">${_esc(section)}</div>
        ${items.map((item, i) => `
          <button class="search-result-item" data-result-idx="${i}" onclick="OmicsLab.Search._pickResult(${_index ? _index.indexOf(item) : 0})">
            <span class="sri-icon">${item.icon}</span>
            <div class="sri-text">
              <div class="sri-title">${_highlight(item.title, query)}</div>
              ${item.desc ? `<div class="sri-desc">${_highlight(item.desc.slice(0, 100) + (item.desc.length > 100 ? '…' : ''), query)}</div>` : ''}
            </div>
            <span class="sri-arrow">→</span>
          </button>`).join('')}
      </div>`).join('');

    box.innerHTML = `<div class="search-count">${results.length} result${results.length !== 1 ? 's' : ''} for "<strong>${_esc(query)}</strong>"</div>${html}`;
  }

  /* ─── Highlight matching text ─── */
  function _highlight(text, query) {
    if (!text || !query) return _esc(text || '');
    const words = query.trim().split(/\s+/).filter(Boolean);
    let escaped = _esc(text);
    words.forEach(w => {
      const re = new RegExp('(' + w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
      escaped = escaped.replace(re, '<mark class="search-mark">$1</mark>');
    });
    return escaped;
  }

  function _esc(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /* ─── Pick a result ─── */
  function _pickResult(idx) {
    const entry = _index && _index[idx];
    if (!entry) return;
    _addRecent(entry.title);
    close();
    setTimeout(() => { try { entry.action(); } catch {} }, 120);
  }

  /* ─── Trigger search from hint chips ─── */
  function _triggerSearch() {
    const inp = document.getElementById('search-input');
    if (inp) inp.dispatchEvent(new Event('input'));
  }

  /* ─── Open ─── */
  function open() {
    let overlay = document.getElementById('search-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'search-overlay';
      overlay.className = 'search-overlay';
      overlay.innerHTML = `
        <div class="search-modal" role="search">
          <div class="search-topbar">
            <svg class="search-icon-left" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input id="search-input" class="search-input" type="search" autocomplete="off" spellcheck="false"
                   placeholder="Search workflows, diseases, tools, equipment…"
                   oninput="OmicsLab.Search._onInput(this.value)"
                   onkeydown="OmicsLab.Search._onKey(event)">
            <button class="search-close-btn" onclick="OmicsLab.Search.close()" aria-label="Close search">✕</button>
          </div>
          <div id="search-results-box" class="search-results-box"></div>
          <div class="search-footer">
            <span>↑↓ navigate</span>
            <span>Enter to select</span>
            <span>Esc to close</span>
          </div>
        </div>`;

      overlay.addEventListener('click', e => {
        if (e.target === overlay) close();
      });
      document.body.appendChild(overlay);
    }

    overlay.classList.add('open');
    _open = true;
    document.body.style.overflow = 'hidden';

    setTimeout(() => {
      const inp = document.getElementById('search-input');
      if (inp) { inp.focus(); inp.select(); }
      /* Pre-render empty state */
      _renderResults([], '');
    }, 50);
  }

  /* ─── Close ─── */
  function close() {
    const overlay = document.getElementById('search-overlay');
    if (overlay) overlay.classList.remove('open');
    _open = false;
    document.body.style.overflow = '';
  }

  /* ─── Input handler ─── */
  let _debounce = null;
  function _onInput(val) {
    clearTimeout(_debounce);
    _debounce = setTimeout(() => {
      const results = _search(val);
      _renderResults(results, val);
    }, 80);
  }

  /* ─── Keyboard navigation ─── */
  function _onKey(e) {
    const box = document.getElementById('search-results-box');
    if (!box) return;
    const items = Array.from(box.querySelectorAll('.search-result-item'));
    const current = box.querySelector('.search-result-item.focused');
    let idx = items.indexOf(current);

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (current) current.classList.remove('focused');
      idx = Math.min(idx + 1, items.length - 1);
      if (items[idx]) { items[idx].classList.add('focused'); items[idx].scrollIntoView({ block: 'nearest' }); }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (current) current.classList.remove('focused');
      idx = Math.max(idx - 1, 0);
      if (items[idx]) { items[idx].classList.add('focused'); items[idx].scrollIntoView({ block: 'nearest' }); }
    } else if (e.key === 'Enter') {
      if (current) current.click();
    } else if (e.key === 'Escape') {
      close();
    }
  }

  /* ─── Keyboard shortcut (Ctrl+K / Cmd+K) ─── */
  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      _open ? close() : open();
    }
    if (e.key === 'Escape' && _open) close();
  });

  return { open, close, _onInput, _onKey, _pickResult, _triggerSearch };
})();
