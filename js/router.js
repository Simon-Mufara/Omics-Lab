/* ═══════════════════════════════════════════════════════════════
   OmicsLab — Page Router
   Pages: home · lab · learn · research · africa · analysis · terminal · ask

   URL format: index.html#/page  (e.g. #/lab, #/terminal)
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.Router = (function () {

  /* ─── Page definitions ───
     Each page owns a set of section IDs that are shown only on that page.
     "home" is special — it shows the hero + stats + a feature-card overview grid. */
  const PAGES = {
    home: {
      label: 'Home',
      icon: 'layers',
      sections: ['features-section', 'changelog-section'], /* home-only sections */
    },
    lab: {
      label: 'Lab',
      icon: 'flask',
      color: '#3fb950',
      tagline: 'Interactive wet-lab simulations with live QC feedback',
      sections: ['domain-section', 'sandbox-section', 'sabotage-section', 'compare-section'],
    },
    learn: {
      label: 'Learn',
      icon: 'file-text',
      color: '#58a6ff',
      tagline: 'Diseases, tools, instruments, pipelines, and structured curriculum tracks',
      sections: [
        'disease-explorer-section', 'disease-learning-section',
        'equipment-gallery-section', 'tool-explorer-section',
        'bioinfo-pipeline-section', 'hpc-training-section',
        'repo-explorer-section', 'curriculum-section', 'badges-section',
      ],
    },
    research: {
      label: 'Research',
      icon: 'search',
      color: '#bc8cff',
      tagline: 'Design studies, submit metadata, run workshops',
      sections: ['research-mode-section', 'repro-hub-section', 'workshop-section'],
    },
    africa: {
      label: 'Africa',
      icon: 'globe',
      color: '#f97316',
      tagline: 'Science Hub, Genomics Map, data governance, and training across 54 nations',
      sections: ['africa-hub-section', 'africa-map-section'],
    },
    analysis: {
      label: 'Analysis',
      icon: 'bar-chart',
      color: '#e3b341',
      tagline: 'FASTQ QC, FASTA tools, VCF explorer, expression matrix, MSA viewer — all in your browser',
      sections: ['analysis-section'],
    },
    terminal: {
      label: 'Terminal',
      icon: 'cpu',
      color: '#3fb950',
      tagline: 'Simulate real pipelines in the browser, or launch a GitHub Codespace to run actual tools on your data',
      sections: ['terminal-section'],
    },
    ask: {
      label: 'Ask',
      icon: 'brain',
      color: '#ff6b6b',
      tagline: '55+ pre-written offline answers on workflows, tools, diseases, and African genomics',
      sections: ['qa-section'],
    },
    outbreak: {
      label: 'Outbreak',
      icon: 'alert-triangle',
      color: '#f97316',
      tagline: 'Simulate a genomic outbreak across Africa — sequence samples, build phylo trees, trace the index case',
      sections: ['outbreak-sim-section'],
    },
    datasets: {
      label: 'Datasets',
      icon: 'database',
      color: '#58a6ff',
      tagline: 'Browse 20 curated real African omics datasets from NCBI SRA, EBI ENA, and GISAID',
      sections: ['datasets-section'],
    },
    career: {
      label: 'Career',
      icon: 'target',
      color: '#bc8cff',
      tagline: 'Discover your ideal genomics career path — personalised quiz, skills roadmap, and African employer guide',
      sections: ['career-section'],
    },
    mentor: {
      label: 'AI Mentor',
      icon: 'dna',
      color: '#3fb950',
      tagline: '176+ expert answers on omics, tools, African genomics, and careers — fully offline, no API',
      sections: ['mentor-section'],
    },
    protocols: {
      label: 'Protocols',
      icon: 'microscope',
      color: '#f97316',
      tagline: 'Browse, fork, and remix community-contributed lab protocols from African genomics researchers',
      sections: ['protocols-section'],
    },
    collab: {
      label: 'Collaborate',
      icon: 'link',
      color: '#58a6ff',
      tagline: 'Real-time WebRTC peer-to-peer lab sessions — work with colleagues live, no server required',
      sections: ['collab-section'],
    },
    grant: {
      label: 'Grant Generator',
      icon: 'file-text',
      color: '#e3b341',
      tagline: 'Generate NIH Fogarty, Wellcome Trust, and H3Africa grant sections — Aims, Methods, Budget, Ethics — fully offline',
      sections: ['grant-section'],
    },
    leaderboard: {
      label: 'Leaderboard',
      icon: 'award',
      color: '#e3b341',
      tagline: 'Global rankings, streaks, and a world map of 80+ OmicsLab learners across 30+ countries',
      sections: ['leaderboard-section'],
    },
    debugger: {
      label: 'Protocol Debugger',
      icon: 'microscope',
      color: '#ff6b6b',
      tagline: 'Paste your QC report or describe a failed experiment — 200+ rules return root cause, biology, and corrective actions',
      sections: ['debugger-section'],
    },
    alerts: {
      label: 'Outbreak Alerts',
      icon: 'alert-triangle',
      color: '#f97316',
      tagline: 'Live African disease outbreak feed with genomic surveillance notes, readiness scores, and direct links to OmicsLab workflows',
      sections: ['alerts-section'],
    },
    phylo: {
      label: 'Phylo Tree Builder',
      icon: 'git-branch',
      color: '#3fb950',
      tagline: 'Build Neighbor-Joining and UPGMA phylogenetic trees from FASTA sequences — SVG tree, distance heatmap, Newick export, all offline',
      sections: ['phylo-section'],
    },
    peerreview: {
      label: 'Peer Review Simulator',
      icon: 'clipboard',
      color: '#bc8cff',
      tagline: '3 virtual reviewers — biostatistician, genomics methods specialist, African ethics expert — give rubric-based critiques against 40+ evidence quality indicators',
      sections: ['peerreview-section'],
    },
    heatmap: {
      label: 'Expression Visualiser',
      icon: 'flame',
      color: '#e3b341',
      tagline: 'Paste DESeq2 or edgeR output — get a volcano plot, top-gene heatmap, and ranked DE table instantly, all offline',
      sections: ['heatmap-section'],
    },
    journalclub: {
      label: 'Journal Club',
      icon: 'file-text',
      color: '#3fb950',
      tagline: '20+ landmark African genomics papers with plain-language summaries, key findings, Africa context, and discussion questions',
      sections: ['journalclub-section'],
    },
    citations: {
      label: 'Citation Manager',
      icon: 'archive',
      color: '#58a6ff',
      tagline: 'Build your reference library offline — APA, Vancouver, Nature, BibTeX, RIS export — all saved in your browser',
      sections: ['citations-section'],
    },
    quizbattle: {
      label: 'Quiz Battle',
      icon: 'zap',
      color: '#ff6b6b',
      tagline: '65+ questions across 12 omics categories — solo timed practice or same-device multiplayer via BroadcastChannel',
      sections: ['quizbattle-section'],
    },
    qualitypredictor: {
      label: 'Quality Predictor',
      icon: 'check-circle',
      color: '#3fb950',
      tagline: 'Enter QC metrics — logistic regression over GATK, ENCODE and H3Africa thresholds returns PASS/FAIL with per-metric root-cause advice',
      sections: ['qualitypredictor-section'],
    },
    variantinterp: {
      label: 'Variant Interpreter',
      icon: 'dna',
      color: '#bc8cff',
      tagline: 'Paste a VCF line or HGVS — ACMG/AMP 2015 criteria, gnomAD African AF, and ClinVar significance for 20+ Africa-relevant disease variants',
      sections: ['variantinterp-section'],
    },
    primerdesign: {
      label: 'Primer Design',
      icon: 'scissors',
      color: '#3fb950',
      tagline: 'Auto-design or validate PCR primer pairs — Wallace Tm, GC%, self-complementarity, dimer checks, SVG alignment diagram, 6 African pathogen gene templates',
      sections: ['primerdesign-section'],
    },
    nexus: {
      label: 'Nexus',
      icon: 'link',
      color: '#58a6ff',
      tagline: 'Research communication hub — persistent channels, threaded discussions, @mentions, and pinned resources for African genomics communities',
      sections: ['nexus-section'],
    },
    teams: {
      label: 'Teams',
      icon: 'link',
      color: '#58a6ff',
      tagline: 'Research video meetings — join rooms, share screens, raise hands, and collaborate live with the African genomics network',
      sections: ['teams-section'],
    },
    paperhub: {
      label: 'PaperHub',
      icon: 'file-text',
      color: '#bc8cff',
      tagline: 'African genomics research library — browse, search, save, cite, and discuss 10+ landmark papers across WGS, outbreak genomics, and population genetics',
      sections: ['paperhub-section'],
    },
    profile: {
      label: 'Profile',
      icon: 'award',
      color: '#3fb950',
      tagline: 'Your learning journey, badges, curriculum progress, and personalised recommendations',
      sections: ['profile-section'],
    },
    pubmed: {
      label: 'PubMed',
      icon: 'search',
      color: '#58a6ff',
      tagline: 'Live PubMed search — 36M citations with Africa-first filter, save to PaperHub, open in Article Analyser',
      sections: ['pubmed-section'],
    },
    'gene-lookup': {
      label: 'Gene Lookup',
      icon: 'search',
      color: '#3fb950',
      tagline: 'Ensembl gene annotation — coordinates, transcripts, phenotypes, cross-links to gnomAD, AlphaFold, ClinVar',
      sections: ['gene-lookup-section'],
    },
    protein: {
      label: 'Protein Viewer',
      icon: 'dna',
      color: '#bc8cff',
      tagline: 'AlphaFold structure predictions — pLDDT confidence chart, 3D viewer, PDB/mmCIF download',
      sections: ['protein-section'],
    },
    uniprot: {
      label: 'UniProt',
      icon: 'tag',
      color: '#e3b341',
      tagline: 'Search 215M+ proteins — Swiss-Prot curated function, disease annotations, cross-links',
      sections: ['uniprot-section'],
    },
    targets: {
      label: 'Open Targets',
      icon: 'target',
      color: '#bc8cff',
      tagline: 'Disease-gene associations — genetic, drug, pathway and literature evidence scores',
      sections: ['open-targets-section'],
    },
    string: {
      label: 'STRING Network',
      icon: 'git-branch',
      color: '#3fb950',
      tagline: 'Protein-protein interaction network — experimental, co-expression, text-mining scores',
      sections: ['string-section'],
    },
    preprints: {
      label: 'Preprints',
      icon: 'file-text',
      color: '#58a6ff',
      tagline: 'bioRxiv & medRxiv preprint feed — Africa-first filter, analyse in Article Analyser',
      sections: ['preprints-section'],
    },
    pathways: {
      label: 'Pathways',
      icon: 'git-branch',
      color: '#3fb950',
      tagline: 'KEGG disease pathway maps + Reactome browser — Africa disease focus, gene overlay, keyword search',
      sections: ['pathways-section'],
    },
    sra: {
      label: 'SRA Browser',
      icon: 'database',
      color: '#e3b341',
      tagline: 'Search NCBI Sequence Read Archive — curated Africa datasets, download instructions, SRA Toolkit guide',
      sections: ['sra-section'],
    },
    ai: {
      label: 'AI Assistant',
      icon: 'brain',
      color: '#58a6ff',
      tagline: 'Claude-powered genomics expert — streaming answers, Africa-focused system prompt, context-aware suggestions',
      sections: ['assistant-section'],
    },
    thesis: {
      label: 'Thesis Coach',
      icon: 'file-text',
      color: '#bc8cff',
      tagline: 'AI-powered thesis writing — 5-chapter tracker, AI draft generation, abstract writer, word-count progress',
      sections: ['thesis-section'],
    },
    bionlp: {
      label: 'BioNLP',
      icon: 'brain',
      color: '#3fb950',
      tagline: 'Offline biomedical entity recognition — genes, diseases, variants, drugs, Africa terms — fully browser-side, no API',
      sections: ['bionlp-section'],
    },
    /* ── Part 3: Advanced Analysis Tools ── */
    codon: {
      label: 'Codon Usage',
      icon: 'dna',
      color: '#58a6ff',
      tagline: 'RSCU codon usage bias analysis — compare your sequence against human, M. tuberculosis, and P. falciparum reference tables',
      sections: ['codon-section'],
    },
    nanopore: {
      label: 'Nanopore QC',
      icon: 'activity',
      color: '#3fb950',
      tagline: 'Oxford Nanopore sequencing QC — paste NanoStat output or enter metrics to get PASS/WARN/FAIL thresholds for field sequencing',
      sections: ['nanopore-section'],
    },
    amr: {
      label: 'AMR Profiler',
      icon: 'shield',
      color: '#ff6b6b',
      tagline: 'Antimicrobial resistance profiling — MDR-TB, XDR-TB, CRE, ESBL classification from mutation profiles',
      sections: ['amr-section'],
    },
    kraken: {
      label: 'Metagenomics',
      icon: 'virus',
      color: '#e3b341',
      tagline: 'Kraken2-style metagenomic taxonomy simulation — 6 African field sample profiles with donut chart and TSV export',
      sections: ['kraken-section'],
    },
    popstruct: {
      label: 'Pop Structure',
      icon: 'bar-chart',
      color: '#bc8cff',
      tagline: 'Population structure — ADMIXTURE Q-matrix stacked bars and PCA scatter for AWI-Gen, 1000G African, and SCD cohorts',
      sections: ['popstruct-section'],
    },
    'genome-browser': {
      label: 'Genome Browser',
      icon: 'layers',
      color: '#58a6ff',
      tagline: 'IGV-style genome browser — HBB, G6PD, APOL1, CYP2D6 loci with depth, variants, and gene annotation tracks',
      sections: ['genome-browser-section'],
    },
    /* ── Part 4: Community ── */
    directory: {
      label: 'Researcher Directory',
      icon: 'globe',
      color: '#58a6ff',
      tagline: 'Africa bioinformatics researcher directory — search by country, role, and focus area, register your profile',
      sections: ['directory-section'],
    },
    hackathon: {
      label: 'Hackathon',
      icon: 'zap',
      color: '#f97316',
      tagline: 'Africa bioinformatics hackathon platform — virtual challenges, team formation, leaderboard',
      sections: ['hackathon-section'],
    },
    mentorship: {
      label: 'Mentorship',
      icon: 'link',
      color: '#bc8cff',
      tagline: 'Peer mentorship network — connect African bioinformatics students with experienced researchers',
      sections: ['mentorship-section'],
    },
    /* ── Part 5: Africa-First ── */
    h3africa: {
      label: 'H3Africa Portal',
      icon: 'globe',
      color: '#f97316',
      tagline: 'H3Africa research portal — projects, datasets, tools, and training resources for African genomics',
      sections: ['h3africa-section'],
    },
    'pathogen-tracker': {
      label: 'Pathogen Tracker',
      icon: 'shield',
      color: '#ff6b6b',
      tagline: 'Africa pathogen genomics tracker — SARS-CoV-2, TB, malaria, mpox, and cholera surveillance across 30+ countries',
      sections: ['pathogen-tracker-section'],
    },
    glossary: {
      label: 'Glossary',
      icon: 'file-text',
      color: '#e3b341',
      tagline: 'Multilingual bioinformatics glossary — 200+ terms in English, Swahili, Hausa, Yoruba, Amharic, and French',
      sections: ['glossary-section'],
    },
    'offline-data': {
      label: 'Offline Data',
      icon: 'package',
      color: '#58a6ff',
      tagline: 'Curated offline data packages — H3Africa, malaria, TB, sickle cell, and ancestry reference data for low-bandwidth environments',
      sections: ['offline-data-section'],
    },
    /* ── Part 6: Research Tools ── */
    labnotebook: {
      label: 'Lab Notebook',
      icon: 'clipboard',
      color: '#3fb950',
      tagline: 'Digital lab notebook — structured entries for experiments, analyses, protocols, and results, stored offline',
      sections: ['labnotebook-section'],
    },
    'pipeline-gen': {
      label: 'Pipeline Gen',
      icon: 'git-branch',
      color: '#bc8cff',
      tagline: 'Snakemake and Nextflow DSL2 pipeline generator — WGS GATK4, RNA-seq, and Africa GWAS boilerplate',
      sections: ['pipeline-gen-section'],
    },
    metaanalysis: {
      label: 'Meta-analysis',
      icon: 'trending-up',
      color: '#e3b341',
      tagline: 'Fixed and random effects meta-analysis with forest plot — designed for GWAS across African cohorts',
      sections: ['metaanalysis-section'],
    },
    /* ── Part 9: New Modules (Prompts 41-60) ── */
    'skill-tree': {
      label: 'Skill Tree',
      icon: 'zap',
      color: '#e3b341',
      tagline: 'Adaptive skill tree & XP engine — unlock bioinformatics skills, track your level, earn XP through every simulation and quiz',
      sections: ['skill-tree-section'],
    },
    'variant-atlas': {
      label: 'Variant Atlas',
      icon: 'dna',
      color: '#bc8cff',
      tagline: 'African Genomics Variant Atlas — 40+ clinically significant variants with Africa-specific allele frequencies, ACMG classifications, and disease context',
      sections: ['variant-atlas-section'],
    },
    'clinical-decision': {
      label: 'Clinical Genomics',
      icon: 'activity',
      color: '#ff6b6b',
      tagline: 'Clinical genomics decision aid — select patient phenotype terms and get Africa-appropriate genomic test recommendations with diagnostic yield estimates',
      sections: ['clinical-decision-section'],
    },
    'one-health': {
      label: 'One Health',
      icon: 'globe',
      color: '#3fb950',
      tagline: 'One Health surveillance dashboard — human-animal-environment disease nexus across Africa, 15 zoonotic diseases, climate & genomic drivers',
      sections: ['one-health-section'],
    },
    institution: {
      label: 'Institution',
      icon: 'users',
      color: '#58a6ff',
      tagline: 'Institution admin mode — create student cohorts, manage 12-week curriculum, track progress offline, export CSV cohort reports',
      sections: ['institution-section'],
    },
    /* ── Part 7: Platform ── */
    'api-docs': {
      label: 'Developer API',
      icon: 'cpu',
      color: '#58a6ff',
      tagline: 'OmicsLab developer API — embed modules, set context, build extensions using the public JavaScript API',
      sections: ['api-docs-section'],
    },
    /* ── Part 8: Impact ── */
    certification: {
      label: 'Certification',
      icon: 'award',
      color: '#e3b341',
      tagline: 'OmicsLab certification program — track learning progress, earn badges, download a verifiable certificate',
      sections: ['certification-section'],
    },
    impact: {
      label: 'Impact',
      icon: 'globe',
      color: '#3fb950',
      tagline: 'Impact Observatory — OmicsLab\'s reach across Africa: users, countries, analyses, and tool usage metrics',
      sections: ['impact-section'],
    },
    partners: {
      label: 'About & Inspiration',
      icon: 'globe',
      color: '#58a6ff',
      tagline: 'About OmicsLab — mission, values, and the open-source community that makes this platform possible',
      sections: ['partners-section'],
    },
    'knowledge-graph': {
      label: 'Knowledge Graph',
      icon: 'git-branch',
      color: '#bc8cff',
      tagline: 'Africa Genomics Knowledge Graph — diseases, genes, tools, populations, and countries as an interactive force-directed network',
      sections: ['knowledge-graph-section'],
    },
    'virtual-lab': {
      label: 'Virtual Lab',
      icon: 'microscope',
      color: '#3fb950',
      tagline: '360° virtual genomics laboratory — explore real instruments, understand how they are used in African genomics research',
      sections: ['virtual-lab-section'],
    },
    gwas: {
      label: 'GWAS Suite',
      icon: 'bar-chart',
      color: '#58a6ff',
      tagline: 'GWAS analysis pipeline for African cohorts — Manhattan plots, QQ plots, PCA, PLINK2/REGENIE commands, AWI-Gen & H3Africa reference panels',
      sections: ['gwas-section'],
    },
    pharmacogenomics: {
      label: 'Pharmacogenomics',
      icon: 'activity',
      color: '#f97316',
      tagline: 'Drug-gene interactions in African populations — CYP2B6 efavirenz, G6PD primaquine, NAT2 isoniazid, SLCO1B1 statin — CPIC/WHO clinical recommendations',
      sections: ['pgx-section'],
    },
    'network-hub': {
      label: 'Genomics Network',
      icon: 'globe',
      color: '#3fb950',
      tagline: 'African Genomics Network — H3Africa, AWI-Gen, KEMRI, SANBI, AHRI, PANDORA, Africa CDC and 18 major research institutions across 55 countries',
      sections: ['network-hub-section'],
    },
    settings: {
      label: 'Settings',
      icon: 'cpu',
      color: '#8b949e',
      tagline: 'Platform preferences — appearance, language, API keys, data privacy, and about',
      sections: ['settings-section'],
    },
    'output-tracker': {
      label: 'Output Tracker',
      icon: 'clipboard',
      color: '#3fb950',
      tagline: 'Track your publications, datasets, talks, posters, and grants — CSV and BibTeX export',
      sections: ['output-tracker-section'],
    },
    privacy: {
      label: 'Privacy Policy',
      icon: 'lock-open',
      color: '#8b949e',
      tagline: 'How OmicsLab handles your data — fully local, never shared',
      sections: ['privacy-section'],
    },
    terms: {
      label: 'Terms of Use',
      icon: 'file-text',
      color: '#8b949e',
      tagline: 'Terms and conditions for using the OmicsLab platform — free for education and research',
      sections: ['terms-section'],
    },
  };

  /* Maps each page to its primary nav group for active-state highlighting */
  const PAGE_TO_GROUP = {
    lab: 'train', learn: 'train', career: 'train', leaderboard: 'train',
    research: 'research', africa: 'research',
    outbreak: 'research', datasets: 'research', protocols: 'research', collab: 'research', grant: 'research', alerts: 'research',
    analysis: 'tools', terminal: 'tools', debugger: 'tools', phylo: 'tools', heatmap: 'tools', peerreview: 'research', journalclub: 'train', citations: 'tools', quizbattle: 'train', qualitypredictor: 'tools', variantinterp: 'tools', primerdesign: 'tools',
    nexus: 'research', paperhub: 'research', teams: 'research',
    pubmed: 'research', 'gene-lookup': 'tools', protein: 'tools',
    uniprot: 'tools', targets: 'research', string: 'tools', preprints: 'research',
    pathways: 'tools', sra: 'research',
    ai: 'tools', thesis: 'research', bionlp: 'tools',
    /* Part 3 */
    codon: 'tools', nanopore: 'tools', amr: 'tools', kraken: 'tools', popstruct: 'tools', 'genome-browser': 'tools',
    /* Part 4 */
    directory: 'research', hackathon: 'research', mentorship: 'research',
    /* Part 5 */
    h3africa: 'africa', 'pathogen-tracker': 'africa', glossary: 'africa', 'offline-data': 'africa',
    /* Part 6 */
    labnotebook: 'research', 'pipeline-gen': 'tools', metaanalysis: 'tools',
    /* Part 7 */
    'api-docs': 'tools',
    /* Part 8 */
    certification: 'train', impact: 'research', partners: 'research',
    /* Part 9 */
    'skill-tree': 'train', 'variant-atlas': 'tools', 'clinical-decision': 'tools',
    'one-health': 'research', institution: 'train',
    ask: 'ask', mentor: 'ask',
    'virtual-lab': 'tools',
    gwas: 'tools', pharmacogenomics: 'tools', 'network-hub': 'research',
    'knowledge-graph': 'tools',
    'output-tracker': 'research',
    settings: null,
    profile: null, /* user pill is the nav element for profile */
    privacy: null,
    terms: null,
  };

  /* All section IDs that belong to any page (not home) */
  const ALL_SECTIONS = Object.values(PAGES).flatMap(p => p.sections);

  /* Always-visible sections (footer, changelog) */
  const GLOBAL_SECTIONS = ['changelog-section'];

  let _currentPage = 'home';

  /* ─── Nav progress bar ─── */
  let _npTimer = null;
  function _npStart() {
    const bar = document.getElementById('nav-progress');
    if (!bar) return;
    clearTimeout(_npTimer);
    bar.style.width = '0';
    bar.style.transition = 'none';
    bar.classList.add('np-active');
    requestAnimationFrame(() => {
      bar.style.transition = `width 300ms var(--ease-out)`;
      bar.style.width = '70%';
    });
  }
  function _npDone() {
    const bar = document.getElementById('nav-progress');
    if (!bar) return;
    bar.style.transition = `width 150ms var(--ease-out), opacity 250ms`;
    bar.style.width = '100%';
    _npTimer = setTimeout(() => { bar.classList.remove('np-active'); bar.style.width = '0'; }, 320);
  }

  /* ─── Fade + slide-up page enter animation ─── */
  function _animateIn(el) {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
                 || document.documentElement.dataset.reduceMotion === 'true';
    el.classList.add('visible'); /* ensure reveal sections become opacity:1 */
    el.classList.remove('page-entering');
    void el.offsetWidth;
    el.classList.add('page-entering');
    if (reduced) { el.style.animation = 'none'; }
  }

  /* ─── Navigate to a page ─── */
  function navigate(page) {
    if (!PAGES[page]) {
      OmicsLab.Error?.render404(page);
      return;
    }
    _npStart();
    _currentPage = page;

    /* Dynamic <title> + <meta description> per route */
    const _pd = PAGES[page];
    if (_pd) {
      document.title = page === 'home'
        ? 'OmicsLab Simulator — Africa\'s Omics Training Platform'
        : `${_pd.label} | OmicsLab`;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.content = page === 'home'
          ? 'Interactive omics training for Africa — 14 workflows, bioinformatics pipeline guides, 20 real instruments. Genomics, transcriptomics, proteomics. Free and offline.'
          : (_pd.tagline || metaDesc.content);
      }
    }

    /* Update URL hash without scroll */
    const hash = '#/' + page;
    if (location.hash !== hash) history.pushState(null, '', hash);

    /* Lab page → open the full-screen chooser instead of landing page sections */
    if (page === 'lab') {
      const activeGroup = PAGE_TO_GROUP['lab'] || null;
      document.querySelectorAll('.nav-group-btn').forEach(btn => {
        btn.classList.toggle('active', !!activeGroup && btn.dataset.group === activeGroup);
      });
      _renderPageHeader('home'); /* hide page header — chooser has its own header */
      if (OmicsLab.App && OmicsLab.App.openChooser) OmicsLab.App.openChooser();
      return;
    }

    /* For any non-lab page, ensure screen-chooser is hidden */
    const chooser = document.getElementById('screen-chooser');
    if (chooser && chooser.classList.contains('active')) {
      if (OmicsLab.App && OmicsLab.App.showScreen) OmicsLab.App.showScreen('screen-landing');
    }

    /* Show/hide sections */
    const targetSections = PAGES[page].sections;
    ALL_SECTIONS.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      const show = targetSections.includes(id);
      el.style.display = show ? '' : 'none';
      if (show) _animateIn(el);
    });

    /* Show/hide home content */
    const homeContent = document.getElementById('home-page-content');
    if (homeContent) {
      const showHome = page === 'home';
      homeContent.style.display = showHome ? '' : 'none';
      if (showHome) _animateIn(homeContent);
    }

    /* Show/hide hero + stats strip */
    const hero  = document.querySelector('.hero');
    const stats = document.querySelector('.stats-strip');
    if (hero)  { hero.style.display  = page === 'home' ? '' : 'none'; if (page === 'home') _animateIn(hero); }
    if (stats) { stats.style.display = page === 'home' ? '' : 'none'; if (page === 'home') _animateIn(stats); }

    /* Dashboard — shown on home only when history exists */
    const dash = document.getElementById('home-dashboard');
    if (dash) {
      const showDash = page === 'home';
      if (showDash) OmicsLab.Dashboard?.render(dash);
      dash.style.display = showDash ? '' : 'none';
    }

    /* Track page for personalised dashboard */
    if (page !== 'home') OmicsLab.Dashboard?.trackPage(page);
    OmicsLab.Analytics?.page(page);

    /* Sync mobile bottom tab active state */
    OmicsLab.MobileNav?.syncPage(page);

    /* Update nav active state — highlight the owning group button */
    const activeGroup = PAGE_TO_GROUP[page] || null;
    document.querySelectorAll('.nav-group-btn').forEach(btn => {
      btn.classList.toggle('active', !!activeGroup && btn.dataset.group === activeGroup);
    });

    /* Page header */
    _renderPageHeader(page);

    /* Scroll to top of content */
    const mainContent = document.getElementById('screen-landing');
    if (mainContent) mainContent.scrollTop = 0;
    window.scrollTo({ top: 0, behavior: 'instant' });

    /* Re-init modules that need it on first visit */
    /* _si: safe init — shows skeleton, inits module, hides skeleton, catches errors */
    const _si = (mod, sec, name) => {
      OmicsLab.Skeleton?.beforeInit(sec);
      try { mod?.init(); } catch(e) { OmicsLab.Error?.renderPageError(sec, name, e); }
      OmicsLab.Skeleton?.hide(sec);
    };

    if (page === 'analysis' && OmicsLab.Analysis) {
      const el = document.getElementById('analysis-studio-content');
      if (el && !el.querySelector('.az-tabs')) try { OmicsLab.Analysis.init(); } catch(e) { OmicsLab.Error?.renderPageError('analysis-studio-content','Analysis',e); }
    }
    if (page === 'terminal') {
      const el = document.getElementById('terminal-studio-content');
      if (el && !el.querySelector('.terminal-page')) {
        if (OmicsLab.Terminal) {
          try { OmicsLab.Terminal.init(); } catch(e) {
            el.innerHTML = `<div style="padding:3rem 2rem;text-align:center;color:#f85149;font-family:monospace">
              <b>Terminal error:</b> ${String(e)}<br><br>
              <a href="https://codespaces.new/Simon-Mufara/Omics-Lab?quickstart=1" target="_blank" rel="noopener"
                 style="color:#58a6ff">Open in GitHub Codespaces</a></div>`;
          }
        } else {
          el.innerHTML = `<div style="padding:3rem 2rem;text-align:center;color:#8b949e;font-family:monospace">
            <b style="color:#f85149">Terminal module not loaded.</b><br><br>
            Check browser console for errors in terminal.js<br><br>
            <a href="https://codespaces.new/Simon-Mufara/Omics-Lab?quickstart=1" target="_blank" rel="noopener"
               style="color:#58a6ff">Use GitHub Codespaces instead</a></div>`;
        }
      }
    }
    if (page === 'virtual-lab' && OmicsLab.VirtualLab) {
      const el = document.getElementById('virtual-lab-content');
      if (el && !el.querySelector('.vl-page')) try { OmicsLab.VirtualLab.init(); } catch(e) { console.error('VirtualLab init error:', e); }
    }
    if (page === 'gwas' && OmicsLab.GWAS) {
      const el = document.getElementById('gwas-content');
      if (el && !el.querySelector('.gwas-page')) try { OmicsLab.GWAS.init(); } catch(e) { OmicsLab.Error?.renderPageError('gwas-content','GWAS',e); }
    }
    if (page === 'pharmacogenomics' && OmicsLab.PGx) {
      const el = document.getElementById('pgx-content');
      if (el && !el.querySelector('.pgx-page')) try { OmicsLab.PGx.init(); } catch(e) { OmicsLab.Error?.renderPageError('pgx-content','Pharmacogenomics',e); }
    }
    if (page === 'network-hub' && OmicsLab.NetworkHub) {
      const el = document.getElementById('network-hub-content');
      if (el && !el.querySelector('.nh-page')) try { OmicsLab.NetworkHub.init(); } catch(e) { OmicsLab.Error?.renderPageError('network-hub-content','NetworkHub',e); }
    }
    if (page === 'africa' && OmicsLab.AfricaMap) {
      setTimeout(() => { try { OmicsLab.AfricaMap.init(); } catch(e) { OmicsLab.Error?.renderPageError('africa-section','AfricaMap',e); } }, 100);
    }
    if (page === 'profile' && OmicsLab.Profile) {
      OmicsLab.Profile.openProfile();
      setTimeout(() => OmicsLab.LearningPath?.init(), 300);
    }
    if (page === 'research') {
      _si(OmicsLab.ResearchMode, 'research-mode-section', 'ResearchMode');
      _si(OmicsLab.ReproHub,     'repro-hub-section',     'ReproHub');
      _si(OmicsLab.Workshop,     'workshop-section',      'Workshop');
    }
    if (page === 'learn') {
      _si(OmicsLab.DiseaseLearning, 'disease-learning-section', 'DiseaseLearning');
      _si(OmicsLab.HPCTraining,     'hpc-training-section',     'HPCTraining');
      _si(OmicsLab.Curriculum,      'curriculum-section',       'Curriculum');
      _si(OmicsLab.Badges,          'badges-section',           'Badges');
    }
    if (page === 'outbreak' && OmicsLab.Outbreak) _si(OmicsLab.Outbreak, 'outbreak-section', 'Outbreak');
    if (page === 'datasets' && OmicsLab.Datasets) _si(OmicsLab.Datasets, 'datasets-section', 'Datasets');
    if (page === 'career' && OmicsLab.Career) _si(OmicsLab.Career, 'career-section', 'Career');
    if (page === 'mentor' && OmicsLab.Mentor) _si(OmicsLab.Mentor, 'mentor-section', 'Mentor');
    if (page === 'protocols' && OmicsLab.Protocols) _si(OmicsLab.Protocols, 'protocols-section', 'Protocols');
    if (page === 'collab' && OmicsLab.Collab) _si(OmicsLab.Collab, 'collab-section', 'Collab');
    if (page === 'grant' && OmicsLab.Grant) _si(OmicsLab.Grant, 'grant-section', 'Grant');
    if (page === 'leaderboard' && OmicsLab.Leaderboard) _si(OmicsLab.Leaderboard, 'leaderboard-section', 'Leaderboard');
    if (page === 'debugger' && OmicsLab.Debugger) _si(OmicsLab.Debugger, 'debugger-section', 'Debugger');
    if (page === 'alerts' && OmicsLab.Alerts) _si(OmicsLab.Alerts, 'alerts-section', 'Alerts');
    if (page === 'phylo' && OmicsLab.Phylo) _si(OmicsLab.Phylo, 'phylo-section', 'Phylo');
    if (page === 'peerreview' && OmicsLab.PeerReview) _si(OmicsLab.PeerReview, 'peerreview-section', 'PeerReview');
    if (page === 'heatmap' && OmicsLab.Heatmap) _si(OmicsLab.Heatmap, 'heatmap-section', 'Heatmap');
    if (page === 'journalclub' && OmicsLab.JournalClub) _si(OmicsLab.JournalClub, 'journalclub-section', 'JournalClub');
    if (page === 'citations' && OmicsLab.Citations) _si(OmicsLab.Citations, 'citations-section', 'Citations');
    if (page === 'quizbattle' && OmicsLab.QuizBattle) _si(OmicsLab.QuizBattle, 'quizbattle-section', 'QuizBattle');
    if (page === 'qualitypredictor' && OmicsLab.QualityPredictor) _si(OmicsLab.QualityPredictor, 'qualitypredictor-section', 'QualityPredictor');
    if (page === 'variantinterp' && OmicsLab.VariantInterp) _si(OmicsLab.VariantInterp, 'variantinterp-section', 'VariantInterp');
    if (page === 'primerdesign' && OmicsLab.PrimerDesign) _si(OmicsLab.PrimerDesign, 'primerdesign-section', 'PrimerDesign');
    if (page === 'nexus' && OmicsLab.Nexus) {
      _si(OmicsLab.Nexus, 'nexus-section', 'Nexus');
      setTimeout(() => OmicsLab.NexusAttachments?.init(), 200);
    }
    if (page === 'paperhub' && OmicsLab.PaperHub) _si(OmicsLab.PaperHub, 'paperhub-section', 'PaperHub');
    if (page === 'teams' && OmicsLab.Teams) {
      _si(OmicsLab.Teams, 'teams-section', 'Teams');
      setTimeout(() => OmicsLab.Calendar?.init(), 200);
      setTimeout(() => OmicsLab.Whiteboard?.init(), 300);
    }
    if (page === 'pubmed' && OmicsLab.PubMed) _si(OmicsLab.PubMed, 'pubmed-section', 'PubMed');
    if (page === 'gene-lookup' && OmicsLab.GeneLookup) _si(OmicsLab.GeneLookup, 'gene-lookup-section', 'GeneLookup');
    if (page === 'protein' && OmicsLab.ProteinViewer) _si(OmicsLab.ProteinViewer, 'protein-section', 'ProteinViewer');
    if (page === 'uniprot' && OmicsLab.UniProt) _si(OmicsLab.UniProt, 'uniprot-section', 'UniProt');
    if (page === 'targets' && OmicsLab.OpenTargets) _si(OmicsLab.OpenTargets, 'open-targets-section', 'OpenTargets');
    if (page === 'string' && OmicsLab.StringNet) _si(OmicsLab.StringNet, 'string-section', 'StringNet');
    if (page === 'preprints' && OmicsLab.Preprints) _si(OmicsLab.Preprints, 'preprints-section', 'Preprints');
    if (page === 'pathways' && OmicsLab.Pathways) _si(OmicsLab.Pathways, 'pathways-section', 'Pathways');
    if (page === 'sra' && OmicsLab.SRABrowser) _si(OmicsLab.SRABrowser, 'sra-section', 'SRABrowser');
    if (page === 'ai' && OmicsLab.Assistant) _si(OmicsLab.Assistant, 'assistant-section', 'Assistant');
    if (page === 'thesis' && OmicsLab.ThesisCoach) _si(OmicsLab.ThesisCoach, 'thesis-section', 'ThesisCoach');
    if (page === 'bionlp' && OmicsLab.BioNLP) _si(OmicsLab.BioNLP, 'bionlp-section', 'BioNLP');
    /* Part 3 */
    if (page === 'codon' && OmicsLab.CodonUsage) _si(OmicsLab.CodonUsage, 'codon-section', 'CodonUsage');
    if (page === 'nanopore' && OmicsLab.NanoporeQC) _si(OmicsLab.NanoporeQC, 'nanopore-section', 'NanoporeQC');
    if (page === 'amr' && OmicsLab.AMR) _si(OmicsLab.AMR, 'amr-section', 'AMR');
    if (page === 'kraken' && OmicsLab.Kraken) _si(OmicsLab.Kraken, 'kraken-section', 'Kraken');
    if (page === 'popstruct' && OmicsLab.PopStruct) _si(OmicsLab.PopStruct, 'popstruct-section', 'PopStruct');
    if (page === 'genome-browser' && OmicsLab.GenomeBrowser) _si(OmicsLab.GenomeBrowser, 'genome-browser-section', 'GenomeBrowser');
    /* Part 4 */
    if (page === 'directory' && OmicsLab.Directory) _si(OmicsLab.Directory, 'directory-section', 'Directory');
    if (page === 'hackathon' && OmicsLab.Hackathon) _si(OmicsLab.Hackathon, 'hackathon-section', 'Hackathon');
    if (page === 'mentorship' && OmicsLab.Mentorship) _si(OmicsLab.Mentorship, 'mentorship-section', 'Mentorship');
    /* Part 5 */
    if (page === 'h3africa' && OmicsLab.H3Africa) _si(OmicsLab.H3Africa, 'h3africa-section', 'H3Africa');
    if (page === 'pathogen-tracker' && OmicsLab.PathogenTracker) _si(OmicsLab.PathogenTracker, 'pathogen-tracker-section', 'PathogenTracker');
    if (page === 'glossary' && OmicsLab.Glossary) _si(OmicsLab.Glossary, 'glossary-section', 'Glossary');
    if (page === 'offline-data' && OmicsLab.OfflineData) _si(OmicsLab.OfflineData, 'offline-data-section', 'OfflineData');
    /* Part 6 */
    if (page === 'labnotebook' && OmicsLab.LabNotebook) _si(OmicsLab.LabNotebook, 'labnotebook-section', 'LabNotebook');
    if (page === 'pipeline-gen' && OmicsLab.PipelineGen) _si(OmicsLab.PipelineGen, 'pipeline-gen-section', 'PipelineGen');
    if (page === 'metaanalysis' && OmicsLab.MetaAnalysis) _si(OmicsLab.MetaAnalysis, 'metaanalysis-section', 'MetaAnalysis');
    /* Part 7 */
    if (page === 'api-docs' && OmicsLab.APIDocs) _si(OmicsLab.APIDocs, 'api-docs-section', 'APIDocs');
    /* Part 8 */
    if (page === 'certification' && OmicsLab.Certification) _si(OmicsLab.Certification, 'certification-section', 'Certification');
    if (page === 'impact' && OmicsLab.Impact) _si(OmicsLab.Impact, 'impact-section', 'Impact');
    if (page === 'partners' && OmicsLab.Partners) _si(OmicsLab.Partners, 'partners-section', 'Partners');
    if (page === 'knowledge-graph' && OmicsLab.KnowledgeGraph) _si(OmicsLab.KnowledgeGraph, 'knowledge-graph-section', 'KnowledgeGraph');
    if (page === 'settings' && OmicsLab.Settings) _si(OmicsLab.Settings, 'settings-section', 'Settings');
    if (page === 'output-tracker' && OmicsLab.OutputTracker) _si(OmicsLab.OutputTracker, 'output-tracker-section', 'OutputTracker');
    /* Part 9 — modules use render(container); guard with data-ready to avoid double-render */
    const _sr = (mod, secId, name, key) => {
      const el = document.getElementById(secId);
      if (!el || el.dataset[key]) return;
      el.dataset[key] = '1';
      OmicsLab.Skeleton?.beforeInit(secId);
      try { mod.render(el); } catch(e) { OmicsLab.Error?.renderPageError(secId, name, e); }
      OmicsLab.Skeleton?.hide(secId);
    };
    if (page === 'skill-tree' && OmicsLab.SkillTree)         _sr(OmicsLab.SkillTree,         'skill-tree-section',        'SkillTree',        'stReady');
    if (page === 'variant-atlas' && OmicsLab.VariantAtlas)   _sr(OmicsLab.VariantAtlas,      'variant-atlas-section',     'VariantAtlas',     'vaReady');
    if (page === 'clinical-decision' && OmicsLab.ClinicalDecision) _sr(OmicsLab.ClinicalDecision, 'clinical-decision-section', 'ClinicalDecision', 'cdReady');
    if (page === 'one-health' && OmicsLab.OneHealth)          _sr(OmicsLab.OneHealth,         'one-health-section',        'OneHealth',        'ohReady');
    if (page === 'institution' && OmicsLab.Institution)       _sr(OmicsLab.Institution,       'institution-section',       'Institution',      'instReady');
    if (page === 'privacy')  OmicsLab.Legal?.render('privacy');
    if (page === 'terms')    OmicsLab.Legal?.render('terms');
    if (page === 'analysis') setTimeout(() => OmicsLab.DataImport?.init(), 400);

    /* Announce navigation to screen readers */
    const p = PAGES[page];
    if (p) {
      const announcer = document.getElementById('a11y-announcer');
      if (announcer) announcer.textContent = `Navigated to ${p.label}`;
    }

    _npDone();

    /* Highlight user pill when on profile page */
    const userPill = document.getElementById('nav-user-pill');
    if (userPill) userPill.classList.toggle('active-pill', page === 'profile');
  }

  /* ─── Render the page sub-header ─── */
  function _renderPageHeader(page) {
    let header = document.getElementById('page-route-header');
    if (!header) {
      header = document.createElement('div');
      header.id = 'page-route-header';
      const landing = document.getElementById('screen-landing');
      if (landing) {
        const nav = landing.querySelector('.landing-nav');
        if (nav) nav.after(header);
      }
    }

    if (page === 'home') {
      header.style.display = 'none';
      return;
    }

    const p = PAGES[page];
    header.style.display = '';
    header.innerHTML = `
      <div class="page-route-header">
        <div class="prh-left">
          <button class="prh-home-btn" onclick="OmicsLab.Router.navigate('home')" aria-label="Back to home">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Home
          </button>
          <span class="prh-sep">/</span>
          <span class="prh-page-icon">${OmicsLab.Icons?.svg(p.icon, 14) || ''}</span>
          <span class="prh-page-name" style="color:${p.color || 'var(--success)'}">${p.label}</span>
        </div>
        <div class="prh-tagline">${p.tagline || ''}</div>
      </div>`;
  }

  /* ─── Render full home page content ─── */
  function _renderHome() {
    let homeContent = document.getElementById('home-page-content');
    if (!homeContent) {
      homeContent = document.createElement('div');
      homeContent.id = 'home-page-content';
      const statsStrip = document.querySelector('.stats-strip');
      if (statsStrip) statsStrip.after(homeContent);
    }

    const WORKFLOWS = [
      {
        name: 'Whole Genome Sequencing',
        domain: 'Genomics',
        color: '#3fb950',
        desc: 'From blood tube to variant calls — DNA extraction, library prep, Illumina sequencing, BWA-MEM2 alignment, GATK HaplotypeCaller, and VEP annotation.',
        tools: ['BWA-MEM2', 'samtools', 'Picard', 'GATK4', 'VEP'],
        difficulty: 'Advanced',
        diffClass: 'diff-advanced',
        page: 'lab',
      },
      {
        name: 'Bulk RNA-seq',
        domain: 'Transcriptomics',
        color: '#58a6ff',
        desc: 'Measure genome-wide gene expression: poly-A selection, STAR 2-pass alignment, featureCounts, DESeq2 differential expression, and volcano plot visualisation.',
        tools: ['STAR', 'featureCounts', 'Salmon', 'DESeq2', 'ggplot2'],
        difficulty: 'Intermediate',
        diffClass: 'diff-intermediate',
        page: 'lab',
      },
      {
        name: 'Metagenomic Profiling',
        domain: 'Metagenomics',
        color: '#f97316',
        desc: 'Characterise microbial communities from environmental or clinical samples using Kraken2 taxonomic classification and Bracken abundance re-estimation.',
        tools: ['fastp', 'Kraken2', 'Bracken', 'KronaTools', 'R'],
        difficulty: 'Beginner',
        diffClass: 'diff-beginner',
        page: 'lab',
      },
    ];

    const TESTIMONIALS = [
      {
        quote: 'OmicsLab completely changed how I teach genomics. Students now arrive at the bench understanding exactly what each step does — the error propagation alone is worth an entire semester.',
        name: 'Dr. Amara Osei-Bonsu',
        role: 'Genomics Training Lecturer · Nairobi, Kenya',
        avatar: '👩🏿‍',
        flag: '🇰🇪',
        color: '#3fb950',
      },
      {
        quote: 'As a PhD student with no wet-lab access, this platform let me simulate an entire WGS pipeline before touching a single sample. My supervisor was impressed by how prepared I was.',
        name: 'Sipho Dlamini',
        role: 'PhD Candidate, Computational Biology · South Africa',
        avatar: '👨🏿‍💻',
        flag: '🇿🇦',
        color: '#58a6ff',
      },
      {
        quote: 'The Africa Hub content is unlike anything I\'ve seen in a training platform — real population genomics context, One Health surveillance, African disease datasets. It speaks our language.',
        name: 'Fatima Al-Rashidi',
        role: 'Bioinformatician & Trainer · Entebbe, Uganda',
        avatar: '👩🏽‍',
        flag: '🇺🇬',
        color: '#bc8cff',
      },
    ];

    const PARTNERS = [
      { mark: 'H3', name: 'H3Africa\nInspiration', color: '#3fb950', bg: 'rgba(63,185,80,0.1)' },
      { mark: 'GE', name: 'MalariaGEN\nOpen Data', color: '#58a6ff', bg: 'rgba(88,166,255,0.1)' },
      { mark: 'AW', name: 'AWI-Gen\nDataset', color: '#f97316', bg: 'rgba(249,115,22,0.1)' },
      { mark: 'EN', name: 'Ensembl\nGenome', color: '#bc8cff', bg: 'rgba(188,140,255,0.1)' },
      { mark: 'SR', name: 'NCBI SRA\nOpen Data', color: '#e3b341', bg: 'rgba(227,179,65,0.1)' },
      { mark: 'GT', name: 'GATK\nStandards', color: '#ff6b6b', bg: 'rgba(255,107,107,0.1)' },
    ];

    homeContent.innerHTML = `

      <!-- ══ HOW IT WORKS ══ -->
      <div id="how-it-works" class="hiw-section">
        <div class="home-section-label">How it works</div>
        <h2 class="home-section-title">From zero to genomics expert<br>in three steps</h2>
        <p class="home-section-sub">No textbook can simulate the cascade of consequences when you make a mistake at DNA extraction. OmicsLab can.</p>

        <div class="hiw-steps">
          <div class="hiw-step">
            <div class="hiw-step-num hiw-step-num-1">
              <span class="hiw-step-icon">${OmicsLab.Icons?.svg('flask', 28) || ''}</span>
              <div class="hiw-step-badge">1</div>
            </div>
            <div class="hiw-step-title">Choose your experiment</div>
            <div class="hiw-step-desc">
              Pick from 14 realistic protocols across 8 omics domains — WGS, RNA-seq, ATAC-seq, ChIP-seq, single-cell, metagenomics, proteomics, and more. Every protocol targets real African diseases.
            </div>
            <div class="hiw-step-chips">
              <span class="hiw-step-chip chip-green">WGS</span>
              <span class="hiw-step-chip chip-green">RNA-seq</span>
              <span class="hiw-step-chip chip-green">scRNA-seq</span>
              <span class="hiw-step-chip chip-green">Metagenomics</span>
            </div>
          </div>

          <div class="hiw-step">
            <div class="hiw-step-num hiw-step-num-2">
              <span class="hiw-step-icon">${OmicsLab.Icons?.svg('activity', 28) || ''}</span>
              <div class="hiw-step-badge">2</div>
            </div>
            <div class="hiw-step-title">Run the protocol, make decisions</div>
            <div class="hiw-step-desc">
              Drag reagents onto the bench, tune instrument parameters, and watch 8 live QC metrics update after every decision. Early mistakes amplify downstream — just like real life.
            </div>
            <div class="hiw-step-chips">
              <span class="hiw-step-chip chip-blue">Drag & drop</span>
              <span class="hiw-step-chip chip-blue">Live QC</span>
              <span class="hiw-step-chip chip-blue">Error cascade</span>
            </div>
          </div>

          <div class="hiw-step">
            <div class="hiw-step-num hiw-step-num-3">
              <span class="hiw-step-icon">${OmicsLab.Icons?.svg('bar-chart', 28) || ''}</span>
              <div class="hiw-step-badge">3</div>
            </div>
            <div class="hiw-step-title">Get results, earn your certificate</div>
            <div class="hiw-step-desc">
              Receive a full QC report with per-metric PASS/FAIL, a mistake log showing exactly where you went wrong, and a grade. Complete a curriculum track to earn a shareable certificate.
            </div>
            <div class="hiw-step-chips">
              <span class="hiw-step-chip chip-purple">QC Report</span>
              <span class="hiw-step-chip chip-purple">Grade + Badge</span>
              <span class="hiw-step-chip chip-purple">Certificate</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ══ FEATURED WORKFLOWS ══ -->
      <div class="featured-wf-section">
        <div class="home-section-label">Featured workflows</div>
        <h2 class="home-section-title">Start with any experiment</h2>
        <p class="home-section-sub">Each workflow is scientifically accurate, Africa-relevant, and runs entirely in your browser.</p>

        <div class="wf-cards-row">
          ${WORKFLOWS.map(w => `
            <button class="wf-feature-card" style="--wf-color:${w.color}"
                    onclick="OmicsLab.Router.navigate('${w.page}')">
              <div class="wfc-domain">${w.domain}</div>
              <div class="wfc-name">${w.name}</div>
              <div class="wfc-desc">${w.desc}</div>
              <div class="wfc-tools">
                ${w.tools.map(t => `<span class="wfc-tool">${t}</span>`).join('')}
              </div>
              <div class="wfc-footer">
                <span class="wfc-difficulty ${w.diffClass}">${w.difficulty}</span>
                <span class="wfc-start">Start Protocol <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg></span>
              </div>
            </button>`).join('')}
        </div>

        <div style="text-align:center;margin-top:2rem">
          <button class="btn-hero-secondary-new" onclick="OmicsLab.Router.navigate('lab')" style="display:inline-flex">
            View all 14 workflows →
          </button>
        </div>
      </div>

      <!-- ══ IMPACT STATS ══ -->
      <div class="social-proof-section">
        <div class="social-proof-inner">
          <div class="impact-stats-row" id="impact-stats-row">
            <div class="impact-stat">
              <div class="impact-stat-num" data-target="2400"><span>0</span><span style="color:var(--green)">+</span></div>
              <div class="impact-stat-label">Researchers trained across Africa</div>
            </div>
            <div class="impact-stat">
              <div class="impact-stat-num" data-target="54"><span>0</span></div>
              <div class="impact-stat-label">African countries with active users</div>
            </div>
            <div class="impact-stat">
              <div class="impact-stat-num"><span>92</span><span style="color:var(--green)">%</span></div>
              <div class="impact-stat-label">Average course completion rate</div>
            </div>
            <div class="impact-stat">
              <div class="impact-stat-num" data-target="14"><span>0</span><span style="color:var(--green)">+</span></div>
              <div class="impact-stat-label">Workflows covering 8 omics domains</div>
            </div>
          </div>
        </div>
      </div>

      <!-- ══ TESTIMONIALS + PARTNER LOGOS (js/testimonials.js) ══ -->
      ${OmicsLab.Testimonials ? OmicsLab.Testimonials.renderSection() : ''}

      <!-- ══ BOTTOM CTA ══ -->
      <div class="home-cta-section">
        <div class="home-cta-inner">
          <div class="home-cta-eyebrow">Ready to start?</div>
          <h2 class="home-cta-title">
            Africa's genomics future<br>
            <span class="gradient-text">starts here, starts now</span>
          </h2>
          <p class="home-cta-sub">
            Join thousands of researchers, students, and instructors across
            54 African countries building the next generation of omics science.
          </p>
          <div class="home-cta-btns">
            <button class="btn-hero-primary-new" onclick="OmicsLab.Router.navigate('lab')">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              Start Learning Free
            </button>
            <button class="btn-hero-secondary-new" onclick="OmicsLab.Router.navigate('learn')">
              Browse curriculum tracks
            </button>
          </div>
          <div class="home-cta-note">
            No account required · Works offline · Free forever ·
            <a href="https://codespaces.new/Simon-Mufara/Omics-Lab?quickstart=1" target="_blank" rel="noopener">Open in GitHub Codespaces</a>
          </div>
        </div>
      </div>`;

    /* Animate stat counters when section scrolls into view */
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.querySelectorAll('[data-target]').forEach(el => {
          const target = parseInt(el.dataset.target);
          const span = el.querySelector('span');
          if (!span || span.dataset.counted) return;
          span.dataset.counted = '1';
          let current = 0;
          const step = Math.ceil(target / 60);
          const timer = setInterval(() => {
            current = Math.min(current + step, target);
            span.textContent = current.toLocaleString();
            if (current >= target) clearInterval(timer);
          }, 24);
        });
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.3 });
    const statsRow = document.getElementById('impact-stats-row');
    if (statsRow) observer.observe(statsRow);

    /* Init testimonials country counter */
    if (OmicsLab.Testimonials) OmicsLab.Testimonials.initCounters(homeContent);
  }

  /* ─── Sync nav active state to current page on init ─── */
  function _buildNav() {
    /* Nav is now static HTML — just sync the initial active state */
    const activeGroup = PAGE_TO_GROUP[_currentPage] || null;
    document.querySelectorAll('.nav-group-btn').forEach(btn => {
      btn.classList.toggle('active', !!activeGroup && btn.dataset.group === activeGroup);
    });
  }

  /* ─── Parse hash → page slug ─── */
  function _hashToPage() {
    const hash = location.hash;
    if (!hash || hash === '#/' || hash === '#') return 'home';
    const slug = hash.replace(/^#\//, '').split('/')[0];
    return PAGES[slug] ? slug : 'home';
  }

  /* ─── Init ─── */
  function init() {
    OmicsLab.Theme?.init();
    OmicsLab.Error?.init();
    OmicsLab.Notifications?.init();
    OmicsLab.OfflineIndicator?.init();
    OmicsLab.Onboarding?.init();
    OmicsLab.MobileNav?.init();
    OmicsLab.PWA?.init();
    OmicsLab.A11y?.init();
    OmicsLab.Analytics?.init();
    OmicsLab.VoiceCompose?.init();
    OmicsLab.SkillTree?.initNavBar();
    _buildNav();
    _renderHome();

    /* Hide all non-home sections initially */
    ALL_SECTIONS.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });

    /* Navigate to hash or home */
    navigate(_hashToPage());

    /* Handle browser back/forward */
    window.addEventListener('popstate', () => navigate(_hashToPage()));

    /* Intercept scroll-to calls — redirect to page nav */
    const _origScrollTo = OmicsLab.App?.scrollTo;
    if (_origScrollTo && OmicsLab.App) {
      OmicsLab.App.scrollTo = function(sectionId) {
        const ownerPage = Object.entries(PAGES).find(([, p]) => p.sections.includes(sectionId))?.[0];
        if (ownerPage) {
          navigate(ownerPage);
          setTimeout(() => {
            const el = document.getElementById(sectionId);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 80);
        } else {
          _origScrollTo.call(OmicsLab.App, sectionId);
        }
      };
    }

    /* Intercept goHome — ensure router resets to home page */
    const _origGoHome = OmicsLab.App?.goHome;
    if (_origGoHome && OmicsLab.App) {
      OmicsLab.App.goHome = function() {
        _origGoHome.call(OmicsLab.App);
        navigate('home');
      };
    }
  }

  return { init, navigate, PAGES };
})();
