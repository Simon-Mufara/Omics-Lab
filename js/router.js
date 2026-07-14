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
      sections: ['home-visual-section', 'changelog-section'],
    },
    guide: {
      label: 'User Guide',
      icon: 'file-text',
      color: '#58a6ff',
      tagline: 'Complete manual for all 87+ OmicsLab tools — searchable, categorised, with why-it-matters notes for every module',
      sections: ['guide-section'],
    },
    lab: {
      label: 'Lab',
      icon: 'flask',
      color: '#00C4A0',
      tagline: 'Interactive wet-lab simulations with live QC feedback',
      /* 'lab' opens the full-screen experiment chooser instead of showing landing
         sections (see navigate() below) — it owns no sections of its own. */
      sections: [],
    },
    sandbox: {
      label: 'Pipeline Sandbox',
      icon: 'hexagon',
      color: '#00C4A0',
      tagline: 'Drag-and-drop bioinformatics pipeline builder with input/output validation',
      sections: ['sandbox-section'],
    },
    sabotage: {
      label: 'Error Injection Mode',
      icon: 'target',
      color: '#f97316',
      tagline: 'Teaching mode — one step secretly receives a wrong input; trace it back from the QC metrics',
      sections: ['sabotage-section'],
    },
    compare: {
      label: 'Compare Workflows',
      icon: 'scale',
      color: '#bc8cff',
      tagline: 'Side-by-side workflow comparison — cost, turnaround time, instruments, and sample requirements',
      sections: ['compare-section'],
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
      color: '#00C4A0',
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
      color: '#00C4A0',
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
      color: '#00C4A0',
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
      color: '#00C4A0',
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
      color: '#00C4A0',
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
      color: '#00C4A0',
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
      color: '#00C4A0',
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
      color: '#00C4A0',
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
      color: '#00C4A0',
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
      color: '#00C4A0',
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
      color: '#00C4A0',
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
      color: '#00C4A0',
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
      color: '#00C4A0',
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
      color: '#00C4A0',
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
    pricing: {
      label: 'Plans & Pricing',
      icon: 'trending-up',
      color: '#00C4A0',
      tagline: 'OmicsLab licensing tiers — Community (free), Campus, and Enterprise. Bring structured bioinformatics training to your institution.',
      sections: ['pricing-section'],
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
      color: '#00C4A0',
      tagline: 'Impact Observatory — OmicsLab\'s reach across Africa: users, countries, analyses, and tool usage metrics',
      sections: ['impact-section'],
    },
    partners: {
      label: 'About & Inspiration',
      icon: 'globe',
      color: '#00C4A0',
      tagline: 'About OmicsLab — Simon Mufara, UCT, and the mission to make world-class omics training free across Africa',
      sections: ['partners-section'],
    },
    about: {
      label: 'About',
      icon: 'globe',
      color: '#00C4A0',
      tagline: 'About OmicsLab — Simon Mufara, UCT, and the mission to make world-class omics training free across Africa',
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
      color: '#00C4A0',
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
      color: '#00C4A0',
      tagline: 'African Genomics Network — H3Africa, AWI-Gen, KEMRI, SANBI, AHRI, PANDORA, Africa CDC and 18 major research institutions across 55 countries',
      sections: ['network-hub-section'],
    },
    'rna-atlas': {
      label: 'RNA Expression Atlas',
      icon: 'bar-chart',
      color: '#f85149',
      tagline: 'Differential expression results from African disease cohorts — malaria, TB, COVID-19 — interactive volcano plots, heatmaps, and gene cards',
      sections: ['rna-atlas-section'],
    },
    fastqc: {
      label: 'Read QC (FastQC)',
      icon: 'activity',
      color: '#00C4A0',
      tagline: 'FastQC-style read quality metrics — per-base quality boxplots, GC distribution, module PASS/WARN/FAIL — illustrated with African disease sequencing data',
      sections: ['fastqc-section'],
    },
    gatk: {
      label: 'GATK Command Builder',
      icon: 'terminal',
      color: '#e3b341',
      tagline: 'Build GATK4 best-practices commands for germline variant calling — HaplotypeCaller, BQSR, MarkDuplicates, GenotypeGVCFs, VQSR, and more',
      sections: ['gatk-section'],
    },
    'single-cell': {
      label: 'Single-Cell Explorer',
      icon: 'layers',
      color: '#bc8cff',
      tagline: 'UMAP visualization and cell type annotation for African scRNA-seq cohorts — malaria PBMC atlas and TB lung granuloma, with marker gene dotplots',
      sections: ['single-cell-section'],
    },
    assembly: {
      label: 'Assembly Evaluator',
      icon: 'cpu',
      color: '#e3b341',
      tagline: 'Genome assembly QC — N50, Nx plot, contig distribution, BUSCO completeness — compare short-read, long-read, and hybrid assemblies of African pathogens',
      sections: ['assembly-section'],
    },
    bioethics: {
      label: 'Bioethics Hub',
      icon: 'shield',
      color: '#f97316',
      tagline: 'African genomics bioethics — CONTEST principles, consent types, data sovereignty case studies, and ethics checklist grounded in H3Africa and Nagoya Protocol',
      sections: ['bioethics-section'],
    },
    enrichment: {
      label: 'GO Enrichment',
      icon: 'git-branch',
      color: '#58a6ff',
      tagline: 'GO and KEGG pathway enrichment analysis — bar charts and bubble plots for malaria, TB, and COVID-19 DEG lists from African disease cohorts',
      sections: ['enrichment-section'],
    },
    'pipeline-visual': {
      label: 'Pipeline Visualiser',
      icon: 'git-branch',
      color: '#00C4A0',
      tagline: 'Interactive bioinformatics pipeline builder — explore WGS, RNA-seq, metagenomics, and Nanopore ARTIC workflows node-by-node with African genomics context',
      sections: ['pipeline-visual-section'],
    },
    'case-files': {
      label: 'Genomics Case Files',
      icon: 'clipboard',
      color: '#f97316',
      tagline: '5 real African clinical genomics cases — solve MDR-TB, sickle cell, outbreak, GWAS, and SARS-CoV-2 mysteries through decision-based investigation',
      sections: ['case-files-section'],
    },
    'ai-ml-bio': {
      label: 'AI & ML in Bioinformatics',
      icon: 'brain',
      color: '#bc8cff',
      tagline: 'Foundation models, neural networks, and classical ML for genomics — LLMs (ESM-2, AlphaFold, scGPT), interactive NN visualizer, workflow code, and African AI initiatives',
      sections: ['ai-ml-bio-section'],
    },
    'stats-genomics': {
      label: 'Statistics for Genomics',
      icon: 'bar-chart',
      color: '#58a6ff',
      tagline: 'Multiple testing (Bonferroni, FDR), power analysis with interactive calculators, effect sizes (OR, Cohen\'s d, FST), Bayesian variant classification, and critical pitfalls',
      sections: ['stats-genomics-section'],
    },
    'seq-align': {
      label: 'Sequence Alignment',
      icon: 'layers',
      color: '#00C4A0',
      tagline: 'Animated Needleman-Wunsch & Smith-Waterman with DP table visualisation — HBB, rpoB, kelch13, CYP2B6 African disease presets, scoring matrices, MSA theory',
      sections: ['seq-align-section'],
    },
    epigenomics: {
      label: 'Epigenomics Explorer',
      icon: 'layers',
      color: '#00C4A0',
      tagline: 'DNA methylation, histone modifications, chromatin accessibility (ATAC-seq), and epigenetic regulation of African disease genes — malaria, TB, sickle cell',
      sections: ['epigenomics-section'],
    },
    crispr: {
      label: 'CRISPR Design Lab',
      icon: 'scissors',
      color: '#f85149',
      tagline: 'CRISPR-Cas9 mechanism, guide RNA design tool, editing outcomes (NHEJ/HDR/base editing/prime editing), CRISPR systems comparison, and Africa applications',
      sections: ['crispr-section'],
    },
    proteomics: {
      label: 'Proteomics Fundamentals',
      icon: 'layers',
      color: '#bc8cff',
      tagline: 'Mass spectrometry basics, LC-MS/MS workflow, protein quantification strategies (LFQ/TMT/SILAC/MRM), and African disease proteomics studies',
      sections: ['proteomics-section'],
    },
    'research-wizard': {
      label: 'Research Design Wizard',
      icon: 'compass',
      color: '#bc8cff',
      tagline: 'Guided step-by-step research design: PICO hypothesis → study type → sample planning → ethics → bioinformatics pipeline → exportable protocol',
      sections: ['research-wizard-section'],
    },
    'alignment-viewer': {
      label: 'Alignment Viewer',
      icon: 'align-left',
      color: '#58a6ff',
      tagline: 'Visual multiple sequence alignment viewer — AliView-equivalent: colour-coded nucleotides, conservation profile, column statistics, FASTA export',
      sections: ['alignment-viewer-section'],
    },
    study: {
      label: 'Study Pack',
      icon: 'file-text',
      color: '#58a6ff',
      tagline: 'Structured study guide for 35 core modules — learning objectives, key concepts, persistent note-taking, progress tracking, and export',
      sections: ['study-section'],
    },
    recombination: {
      label: 'Recombination Scanner',
      icon: 'activity',
      color: '#f97316',
      tagline: 'Multi-method recombination detection: SimPlot, Bootscan, MaxChi, SiScan, 3Seq — inspired by RDP4/5 (UCT CBIO)',
      sections: ['recombination-section'],
    },
    social: {
      label: 'Social Hub',
      icon: 'users',
      color: '#00C4A0',
      tagline: 'Connect with other OmicsLab researchers — see who is online, add friends by code, and chat directly in the platform',
      sections: ['social-section'],
    },
    community: {
      label: 'Community',
      icon: 'message-square',
      color: '#58a6ff',
      tagline: 'Discussion topics, questions, and shared results from genomics learners and researchers across the OmicsLab community',
      sections: ['community-section'],
    },
    'scrna-explorer': {
      label: 'scRNA-seq Explorer',
      icon: 'layers',
      color: '#bc8cff',
      tagline: 'Full scRNA-seq analysis — UMAP, clustering, differential expression, and cell-type annotation — built by Simon Mufara and embedded live inside OmicsLab',
      sections: ['scrna-explorer-section'],
    },
    'variants-explorer': {
      label: 'Variant Analysis Suite',
      icon: 'dna',
      color: '#58a6ff',
      tagline: 'Clinical-grade variant analysis — VCF upload, annotation, gnomAD frequencies, ACMG classification, and filtering — built by Simon Mufara and embedded live inside OmicsLab',
      sections: ['variants-explorer-section'],
    },
    settings: {
      label: 'Settings',
      icon: 'cpu',
      color: '#A8A098',
      tagline: 'Platform preferences — appearance, language, API keys, data privacy, and about',
      sections: ['settings-section'],
    },
    'output-tracker': {
      label: 'Output Tracker',
      icon: 'clipboard',
      color: '#00C4A0',
      tagline: 'Track your publications, datasets, talks, posters, and grants — CSV and BibTeX export',
      sections: ['output-tracker-section'],
    },
    privacy: {
      label: 'Privacy Policy',
      icon: 'lock-open',
      color: '#A8A098',
      tagline: 'How OmicsLab handles your data — fully local, never shared',
      sections: ['privacy-section'],
    },
    terms: {
      label: 'Terms of Use',
      icon: 'file-text',
      color: '#A8A098',
      tagline: 'Terms and conditions for using the OmicsLab platform — free for education and research',
      sections: ['terms-section'],
    },
  };

  /* Maps each page to its primary nav group for active-state highlighting */
  const PAGE_TO_GROUP = {
    /* Learn — tr-simulate (Practice) + tr-learn (Concepts) tabs */
    lab: 'train', analysis: 'train', terminal: 'train', debugger: 'train', 'virtual-lab': 'train', outbreak: 'train',
    sandbox: 'train', sabotage: 'train', compare: 'train',
    learn: 'train', 'ai-ml-bio': 'train', 'stats-genomics': 'train', 'seq-align': 'train', 'pipeline-visual': 'train',
    epigenomics: 'train', crispr: 'train', proteomics: 'train', 'case-files': 'train', study: 'train',
    journalclub: 'train', quizbattle: 'train', glossary: 'train',
    /* not linked from the current nav markup — kept on their prior sensible group */
    'skill-tree': 'train',

    /* Research — res-plan / res-africa / res-community / res-lit tabs */
    research: 'research', peerreview: 'research', grant: 'research', labnotebook: 'research', 'output-tracker': 'research',
    'research-wizard': 'research', social: 'research', community: 'research',
    africa: 'research', alerts: 'research', datasets: 'research', 'pathogen-tracker': 'research', bioethics: 'research', 'network-hub': 'research',
    nexus: 'research', teams: 'research', collab: 'research', mentorship: 'research', hackathon: 'research', directory: 'research',
    pubmed: 'research', preprints: 'research', paperhub: 'research', thesis: 'research', sra: 'research',
    /* not linked from the current nav markup — kept on their prior sensible group */
    protocols: 'research', h3africa: 'research', 'offline-data': 'research', 'one-health': 'research',

    /* Tools — tools-genomics / tools-expr / tools-db / tools-ai tabs */
    variantinterp: 'tools', phylo: 'tools', 'alignment-viewer': 'tools', recombination: 'tools', 'scrna-explorer': 'tools',
    'variants-explorer': 'tools', primerdesign: 'tools', 'genome-browser': 'tools', nanopore: 'tools', amr: 'tools',
    kraken: 'tools', popstruct: 'tools', gwas: 'tools', pharmacogenomics: 'tools', fastqc: 'tools', assembly: 'tools',
    heatmap: 'tools', qualitypredictor: 'tools', codon: 'tools', metaanalysis: 'tools', 'single-cell': 'tools',
    enrichment: 'tools', 'rna-atlas': 'tools', 'pipeline-gen': 'tools',
    'gene-lookup': 'tools', protein: 'tools', uniprot: 'tools', string: 'tools', pathways: 'tools', targets: 'tools',
    'knowledge-graph': 'tools', citations: 'tools',
    ai: 'tools', bionlp: 'tools', 'api-docs': 'tools', ask: 'tools', mentor: 'tools',
    /* not linked from the current nav markup — kept on their prior sensible group */
    'variant-atlas': 'tools', 'clinical-decision': 'tools',

    /* About — flat mega-menu */
    certification: 'about', leaderboard: 'about', impact: 'about',
    career: 'about', guide: 'about', pricing: 'about', partners: 'about', about: 'about',
    workshop: 'about', /* not a standalone route (nested workshop-section in research); item deep-links to 'research' for now */
    institution: 'about',

    settings: null,
    profile: null, /* user pill is the nav element for profile */
    privacy: null,
    terms: null,
  };

  /* All section IDs that belong to any page (not home) */
  const ALL_SECTIONS = Object.values(PAGES).flatMap(p => p.sections);

  /* Always-visible sections (footer, changelog) */
  const GLOBAL_SECTIONS = ['changelog-section'];

  /* ─── CSS lazy-loading: map each route to its stylesheet(s) ─── */
  /* Critical CSS (tokens, components, app, nav, auth, home) is in <head>.
     Everything else is injected on first visit to avoid loading 100 files upfront. */
  const PAGE_CSS = {
    guide:              ['css/user-guide.css'],
    learn:              ['css/disease-learning.css','css/equipment.css','css/study-pack.css','css/certification.css','css/bioethics.css','css/enrichment.css'],
    research:           ['css/research-mode.css','css/research-wizard.css','css/datasets.css','css/collab.css','css/grant.css','css/paperhub.css','css/pubmed.css','css/preprints.css','css/sra-browser.css','css/popstruct.css','css/peerreview.css','css/citations.css','css/metaanalysis.css'],
    africa:             ['css/h3africa.css','css/one-health.css'],
    analysis:           ['css/analysis.css','css/alignment-viewer.css','css/heatmap.css','css/qualitypredictor.css','css/variantinterp.css','css/protein-viewer.css','css/pathways.css','css/genomebrowser.css','css/variant-atlas.css'],
    terminal:           ['css/terminal.css'],
    ask:                ['css/mentor.css'],
    ai:                 ['css/assistant.css'],
    settings:           ['css/settings.css'],
    profile:            ['css/profile.css'],
    career:             ['css/career.css','css/mentorship.css','css/thesis-coach.css'],
    lab:                ['css/lab.css'],
    outbreak:           ['css/outbreak.css'],
    datasets:           ['css/datasets.css'],
    mentor:             ['css/mentor.css'],
    protocols:          ['css/protocols.css'],
    collab:             ['css/collab.css'],
    grant:              ['css/grant.css'],
    leaderboard:        ['css/leaderboard.css'],
    debugger:           ['css/debugger.css'],
    alerts:             ['css/alerts.css'],
    phylo:              ['css/phylo.css'],
    peerreview:         ['css/peerreview.css'],
    heatmap:            ['css/heatmap.css'],
    journalclub:        ['css/journalclub.css'],
    citations:          ['css/citations.css'],
    quizbattle:         ['css/quizbattle.css'],
    qualitypredictor:   ['css/qualitypredictor.css'],
    variantinterp:      ['css/variantinterp.css'],
    primerdesign:       ['css/primerdesign.css'],
    /* Nexus now hosts Community's Forum and Social's People tabs directly
       (see the merge in js/nexus.js _switchView) — both stylesheets need
       to load with Nexus itself, not just when navigating to the old
       standalone /community or /social routes (which now redirect here
       before PAGE_CSS for those slugs would ever be requested). */
    nexus:              ['css/nexus.css', 'css/community.css', 'css/social.css'],
    teams:              ['css/teams.css'],
    paperhub:           ['css/paperhub.css'],
    pubmed:             ['css/pubmed.css'],
    'gene-lookup':      ['css/gene-lookup.css'],
    protein:            ['css/protein-viewer.css'],
    uniprot:            ['css/uniprot.css'],
    targets:            ['css/open-targets.css'],
    string:             ['css/string-net.css'],
    preprints:          ['css/preprints.css'],
    pathways:           ['css/pathways.css'],
    sra:                ['css/sra-browser.css'],
    bionlp:             ['css/bionlp.css'],
    codon:              ['css/codon.css'],
    nanopore:           ['css/nanopore.css'],
    amr:                ['css/amr.css'],
    gatk:               ['css/gatk.css'],
    kraken:             ['css/kraken.css'],
    popstruct:          ['css/popstruct.css'],
    'genome-browser':   ['css/genomebrowser.css'],
    directory:          ['css/directory.css'],
    hackathon:          ['css/hackathon.css'],
    mentorship:         ['css/mentorship.css'],
    glossary:           ['css/glossary.css'],
    h3africa:           ['css/h3africa.css'],
    'pathogen-tracker': ['css/pathogen-tracker.css'],
    'offline-data':     ['css/offline-data.css'],
    labnotebook:        ['css/labnotebook.css'],
    'pipeline-gen':     ['css/pipeline-gen.css'],
    metaanalysis:       ['css/metaanalysis.css'],
    'api-docs':         ['css/api-docs.css'],
    certification:      ['css/certification.css'],
    impact:             ['css/impact.css'],
    partners:           ['css/partners.css'],
    tour:               ['css/tour.css'],
    'knowledge-graph':  ['css/knowledge-graph.css'],
    'output-tracker':   ['css/output-tracker.css'],
    'skill-tree':       ['css/skill-tree.css'],
    'variant-atlas':    ['css/variant-atlas.css'],
    'clinical-decision':['css/clinical-decision.css'],
    'one-health':       ['css/one-health.css'],
    institution:        ['css/institution.css'],
    pricing:            ['css/pricing.css'],
    social:             ['css/social.css'],
    community:          ['css/community.css'],
    'virtual-lab':      ['css/virtual-lab.css'],
    gwas:               ['css/gwas.css'],
    pharmacogenomics:   ['css/pharmacogenomics.css'],
    'network-hub':      ['css/network-hub.css'],
    'rna-atlas':        ['css/rna-atlas.css'],
    fastqc:             ['css/fastqc.css'],
    'single-cell':      ['css/single-cell.css'],
    assembly:           ['css/assembly.css'],
    bioethics:          ['css/bioethics.css'],
    enrichment:         ['css/enrichment.css'],
    'pipeline-visual':  ['css/pipeline-visual.css'],
    'case-files':       ['css/case-files.css'],
    'ai-ml-bio':        ['css/ai-ml-bio.css'],
    'stats-genomics':   ['css/stats-genomics.css'],
    'seq-align':        ['css/seq-align.css'],
    epigenomics:        ['css/epigenomics.css'],
    crispr:             ['css/crispr.css'],
    proteomics:         ['css/proteomics.css'],
    'research-wizard':  ['css/research-wizard.css'],
    'alignment-viewer': ['css/alignment-viewer.css'],
    study:              ['css/study-pack.css'],
    recombination:      ['css/recombination.css'],
  };

  /* Inject <link> tags on demand; idempotent — each href loaded once.
     Returns a Promise that resolves once every NEWLY-requested file has
     either loaded or failed (already-loaded files resolve immediately) —
     _navigateInner uses this to keep the incoming page invisible until
     its CSS is actually applied, instead of showing a flash of unstyled
     HTML while the <link> fetch is still in flight (very visible on a
     first cold-cache visit to any page — every route hits this, not
     just one page). */
  const _loadedCss = new Set();
  function _loadCss(page) {
    const files = PAGE_CSS[page];
    if (!files) return Promise.resolve();
    const pending = [];
    files.forEach(href => {
      if (_loadedCss.has(href)) return;
      _loadedCss.add(href);
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      pending.push(new Promise(resolve => {
        link.onload  = resolve;
        link.onerror = resolve; /* don't hang the reveal on one bad stylesheet */
      }));
      document.head.appendChild(link);
    });
    return pending.length ? Promise.all(pending) : Promise.resolve();
  }

  let _currentPage = 'home';
  let _prevPage    = 'home';

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
  function _navigateInner(page) {
    /* Social and Community were fragmented, inconsistently auth-gated
       destinations — merged into Nexus as "People" and "Forum" tabs.
       Redirect old links/bookmarks instead of showing a stale
       standalone page that no longer reflects where people actually
       communicate on the hub. */
    if (page === 'social' || page === 'community') {
      const view = page === 'social' ? 'people' : 'forum';
      _navigateInner('nexus');
      setTimeout(() => OmicsLab.Nexus?._switchView?.(view), 150);
      return;
    }
    if (!PAGES[page]) {
      OmicsLab.Error?.render404(page);
      return;
    }
    const _cssReady = _loadCss(page);
    _npStart();
    if (_currentPage !== page) _prevPage = _currentPage;
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

    /* Update URL to clean path (SEO-friendly, no hash) */
    const path = page === 'home' ? '/' : '/' + page;
    if (location.pathname !== path) history.pushState(null, '', path);

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

    /* Show/hide sections. Newly-shown sections stay visibility:hidden
       until _cssReady resolves — otherwise the section's HTML renders
       immediately (synchronously, below) while its <link rel=stylesheet>
       is still an in-flight network request, producing a visible flash
       of unstyled content on every first visit to a route this session
       (cold cache, or right after a fresh deploy bumps the URL). An 800ms
       fallback timeout reveals it regardless, in case a stylesheet never
       fires load/error for some reason — content must never stay hidden
       forever over a CSS hiccup. */
    const targetSections = PAGES[page].sections;
    const _shownEls = [];
    ALL_SECTIONS.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      const show = targetSections.includes(id);
      el.style.display = show ? '' : 'none';
      if (show) {
        el.style.visibility = 'hidden';
        _shownEls.push(el);
        _animateIn(el);
      }
    });
    if (_shownEls.length) {
      const _reveal = () => _shownEls.forEach(el => { el.style.visibility = ''; });
      Promise.race([_cssReady, new Promise(r => setTimeout(r, 800))]).then(_reveal);
    }

    /* Show/hide home content */
    const homeContent = document.getElementById('home-page-content');
    if (homeContent) {
      const showHome = page === 'home';
      homeContent.style.display = showHome ? '' : 'none';
      if (showHome) _animateIn(homeContent);
    }

    /* Footer: the full marketing footer (mission blurb, language pills,
       stats row, feedback box) lives inside #screen-landing, which is
       the persistent app shell — router.js only ever toggles the
       tool-specific sections, never screen-landing itself, so the
       footer previously showed on every single page regardless of
       route. Swap it for a compact legal-links-only footer everywhere
       except home. */
    const footerFull    = document.getElementById('site-footer-full');
    const footerCompact = document.getElementById('site-footer-compact');
    if (footerFull)    footerFull.style.display    = page === 'home' ? '' : 'none';
    if (footerCompact) footerCompact.style.display = page === 'home' ? 'none' : '';

    /* Home visual hero (DNA animation) — init on every home visit, stop on leave.
       (Showcase carousel removed — redundant with the how-it-works explainer.) */
    if (page === 'home') {
      try { OmicsLab.HomeHero?.init(); } catch(e) { console.warn('[OmicsLab] HomeHero init failed:', e); }
    } else {
      try { OmicsLab.HomeHero?.stop(); } catch {}
    }

    /* Show/hide hero + stats strip + how-it-works explainer */
    const hero  = document.querySelector('.hero');
    const stats = document.querySelector('.stats-strip');
    const howItWorks = document.getElementById('how-it-works-section');
    if (hero)  { hero.style.display  = page === 'home' ? '' : 'none'; if (page === 'home') _animateIn(hero); }
    if (stats) { stats.style.display = page === 'home' ? '' : 'none'; if (page === 'home') _animateIn(stats); }
    if (howItWorks) { howItWorks.style.display = page === 'home' ? '' : 'none'; if (page === 'home') _animateIn(howItWorks); }

    /* Dashboard — shown on home only when a user exists (Clerk or localStorage) */
    const dash = document.getElementById('home-dashboard');
    if (dash) {
      const _dashUser = () => {
        if (OmicsLab.AuthClerk?.getUser?.()) return true;
        try { return !!JSON.parse(localStorage.getItem('omicslab_user_profile') || 'null'); } catch { return false; }
      };
      const showDash = page === 'home' && _dashUser();
      if (showDash) OmicsLab.Dashboard?.render(dash);
      dash.style.display = showDash ? '' : 'none';
    }

    /* Track page for personalised dashboard + continue-where-you-left-off */
    if (page !== 'home') {
      OmicsLab.Dashboard?.trackPage(page);
      try {
        const p = PAGES[page];
        localStorage.setItem('omicslab_last_page', JSON.stringify({
          page, label: p?.label || page, color: p?.color || '#00C4A0',
          tagline: p?.tagline || '', ts: Date.now(),
        }));
      } catch {}
    }
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
      try {
        mod?.init();
      } catch(e) {
        if (OmicsLab.Error?.renderPageError) {
          OmicsLab.Error.renderPageError(sec, name, e);
        } else {
          const el = document.getElementById(sec);
          if (el) el.innerHTML = `<div style="padding:2rem;text-align:center;color:var(--text-muted)">
            <p style="margin-bottom:1rem;font-size:0.9rem">Failed to load <strong style="color:var(--text-primary)">${name}</strong>.</p>
            <button onclick="location.reload()" style="background:#00C4A0;color:#060A14;border:none;border-radius:6px;padding:0.5rem 1.2rem;font-weight:700;cursor:pointer">Reload</button>
          </div>`;
        }
        console.error('[OmicsLab] module init failed:', name, e);
      }
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
          el.innerHTML = `<div style="padding:3rem 2rem;text-align:center;color:#A8A098;font-family:monospace">
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
    if (page === 'rna-atlas' && OmicsLab.RNAAtlas) {
      const el = document.getElementById('rna-atlas-content');
      if (el && !el.querySelector('.ra-page')) try { OmicsLab.RNAAtlas.init(); } catch(e) { OmicsLab.Error?.renderPageError('rna-atlas-content','RNAAtlas',e); }
    }
    if (page === 'fastqc' && OmicsLab.FastQC) {
      const el = document.getElementById('fastqc-content');
      if (el && !el.querySelector('.fqc-page')) try { OmicsLab.FastQC.init(); } catch(e) { OmicsLab.Error?.renderPageError('fastqc-content','FastQC',e); }
    }
    if (page === 'gatk' && OmicsLab.GATK) {
      const el = document.getElementById('gatk-section');
      if (el && !el.dataset.gatkReady) try { OmicsLab.GATK.init(); } catch(e) {}
    }
    if (page === 'single-cell' && OmicsLab.SingleCell) {
      const el = document.getElementById('single-cell-content');
      if (el && !el.querySelector('.sc-page')) try { OmicsLab.SingleCell.init(); } catch(e) { OmicsLab.Error?.renderPageError('single-cell-content','SingleCell',e); }
    }
    if (page === 'assembly' && OmicsLab.Assembly) {
      const el = document.getElementById('assembly-content');
      if (el && !el.querySelector('.asm-page')) try { OmicsLab.Assembly.init(); } catch(e) { OmicsLab.Error?.renderPageError('assembly-content','Assembly',e); }
    }
    if (page === 'bioethics' && OmicsLab.Bioethics) {
      const el = document.getElementById('bioethics-content');
      if (el && !el.querySelector('.be-page')) try { OmicsLab.Bioethics.init(); } catch(e) { OmicsLab.Error?.renderPageError('bioethics-content','Bioethics',e); }
    }
    if (page === 'enrichment' && OmicsLab.Enrichment) {
      const el = document.getElementById('enrichment-content');
      if (el && !el.querySelector('.enr-page')) try { OmicsLab.Enrichment.init(); } catch(e) { OmicsLab.Error?.renderPageError('enrichment-content','Enrichment',e); }
    }
    if (page === 'pipeline-visual' && OmicsLab.PipelineVisual) {
      const el = document.getElementById('pipeline-visual-content');
      if (el && !el.querySelector('.pvl-page')) try { OmicsLab.PipelineVisual.init(); } catch(e) { OmicsLab.Error?.renderPageError('pipeline-visual-content','PipelineVisual',e); }
    }
    if (page === 'case-files' && OmicsLab.CaseFiles) {
      const el = document.getElementById('case-files-content');
      if (el && !el.querySelector('.cf-page')) try { OmicsLab.CaseFiles.init(); } catch(e) { OmicsLab.Error?.renderPageError('case-files-content','CaseFiles',e); }
    }
    if (page === 'ai-ml-bio' && OmicsLab.AIMLBio) {
      const el = document.getElementById('ai-ml-bio-content');
      if (el && !el.querySelector('.aml-page')) try { OmicsLab.AIMLBio.init(); } catch(e) { OmicsLab.Error?.renderPageError('ai-ml-bio-content','AIMLBio',e); }
    }
    if (page === 'stats-genomics' && OmicsLab.StatsGenomics) {
      const el = document.getElementById('stats-genomics-content');
      if (el && !el.querySelector('.sg-page')) try { OmicsLab.StatsGenomics.init(); } catch(e) { OmicsLab.Error?.renderPageError('stats-genomics-content','StatsGenomics',e); }
    }
    if (page === 'seq-align' && OmicsLab.SeqAlign) {
      const el = document.getElementById('seq-align-content');
      if (el && !el.querySelector('.sa-page')) try { OmicsLab.SeqAlign.init(); } catch(e) { OmicsLab.Error?.renderPageError('seq-align-content','SeqAlign',e); }
    }
    if (page === 'epigenomics' && OmicsLab.Epigenomics) {
      const el = document.getElementById('epigenomics-content');
      if (el && !el.querySelector('.epi-page')) try { OmicsLab.Epigenomics.init(); } catch(e) { OmicsLab.Error?.renderPageError('epigenomics-content','Epigenomics',e); }
    }
    if (page === 'crispr' && OmicsLab.CRISPR) {
      const el = document.getElementById('crispr-content');
      if (el && !el.querySelector('.crispr-page')) try { OmicsLab.CRISPR.init(); } catch(e) { OmicsLab.Error?.renderPageError('crispr-content','CRISPR',e); }
    }
    if (page === 'proteomics' && OmicsLab.Proteomics) {
      const el = document.getElementById('proteomics-content');
      if (el && !el.querySelector('.prot-page')) try { OmicsLab.Proteomics.init(); } catch(e) { OmicsLab.Error?.renderPageError('proteomics-content','Proteomics',e); }
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
    if (page === 'sandbox' && OmicsLab.Sandbox) _si(OmicsLab.Sandbox, 'sandbox-container', 'Sandbox');
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
    if ((page === 'partners' || page === 'about') && OmicsLab.Partners) _si(OmicsLab.Partners, 'partners-section', 'Partners');
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
    if (page === 'pricing' && OmicsLab.Pricing)               _si(OmicsLab.Pricing,           'pricing-section',           'Pricing');
    if (page === 'guide'   && OmicsLab.UserGuide)             _si(OmicsLab.UserGuide,         'guide-section',             'UserGuide');
    if (page === 'study'   && OmicsLab.StudyPack)             _si(OmicsLab.StudyPack,         'study-section',             'StudyPack');
    if (page === 'research-wizard' && OmicsLab.ResearchWizard) _si(OmicsLab.ResearchWizard, 'research-wizard-section', 'ResearchWizard');
    if (page === 'alignment-viewer' && OmicsLab.AlignmentViewer) _si(OmicsLab.AlignmentViewer, 'alignment-viewer-section', 'AlignmentViewer');
    if (page === 'recombination' && OmicsLab.Recombination)   _si(OmicsLab.Recombination,   'recombination-section',     'Recombination');
    /* 'social' / 'community' dispatch removed — both now redirect to
       'nexus' at the top of _navigateInner(), see the merge comment there. */
    if (page === 'scrna-explorer')     OmicsLab.EmbeddedApps?.init('scrna-explorer');
    if (page === 'variants-explorer')  OmicsLab.EmbeddedApps?.init('variants-explorer');
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

  /* ─── Navigate to a page (safe wrapper) ───
     A throw anywhere inside _navigateInner (e.g. a page-specific render
     hitting stale post-deploy localStorage data) used to leave the app
     half-rendered with no recovery — this is the direct fix for "hard
     refresh breaks the page and doesn't start fresh." One retry to
     'home' covers the common case; if even that throws, fall back to a
     raw DOM reveal of the landing screen so the user always sees
     something rather than a blank page. */
  function navigate(page) {
    try {
      _navigateInner(page);
    } catch (e) {
      console.error('[Router] navigate("' + page + '") failed', e);
      try { window.Sentry?.captureException?.(e); } catch (e2) {}
      if (page !== 'home') {
        try {
          _navigateInner('home');
          return;
        } catch (e3) {
          console.error('[Router] fallback navigate("home") also failed', e3);
        }
      }
      const landing = document.getElementById('screen-landing');
      if (landing) landing.style.display = '';
    }
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
    const backDest  = (_prevPage && _prevPage !== page) ? _prevPage : 'home';
    const backLabel = backDest === 'home' ? 'Home' : (PAGES[backDest]?.label || 'Back');
    header.style.display = '';
    header.innerHTML = `
      <div class="page-route-header">
        <div class="prh-left">
          <button class="prh-home-btn" onclick="OmicsLab.Router.navigate('${backDest}')" aria-label="Back to ${backLabel}">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            ${backLabel}
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

    /* ── Continue where you left off ── */
    let continueHtml = '';
    try {
      const lp = JSON.parse(localStorage.getItem('omicslab_last_page') || 'null');
      if (lp && lp.page && lp.label) {
        const mins = Math.round((Date.now() - lp.ts) / 60000);
        const when = mins < 2 ? 'just now' : mins < 60 ? `${mins}m ago` : mins < 1440 ? `${Math.round(mins/60)}h ago` : `${Math.round(mins/1440)}d ago`;
        continueHtml = `
        <div class="home-continue-banner" onclick="OmicsLab.Router.navigate('${lp.page}')" role="button" tabindex="0"
             onkeydown="if(event.key==='Enter')OmicsLab.Router.navigate('${lp.page}')"
             style="--cont-color:${lp.color || '#00C4A0'}">
          <div class="home-continue-dot"></div>
          <div class="home-continue-body">
            <span class="home-continue-label">Continue where you left off</span>
            <span class="home-continue-page">${lp.label}</span>
          </div>
          <div class="home-continue-meta">${when}</div>
          <svg class="home-continue-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </div>`;
      }
    } catch {}

    /* Trimmed to just the personalised "continue" banner — the old block also
       duplicated the hero's 3-step explainer, the tools category grid, and the
       hero's own CTAs a second and third time. Renders nothing for new visitors. */
    homeContent.innerHTML = continueHtml ? `<div class="home-focus-row">${continueHtml}</div>` : '';
  }

  /* ─── Sync nav active state to current page on init ─── */
  function _buildNav() {
    /* Nav is now static HTML — just sync the initial active state */
    const activeGroup = PAGE_TO_GROUP[_currentPage] || null;
    document.querySelectorAll('.nav-group-btn').forEach(btn => {
      btn.classList.toggle('active', !!activeGroup && btn.dataset.group === activeGroup);
    });
  }

  /* ─── Parse URL → page slug (supports both /page paths and legacy #/page hashes) ─── */
  function _hashToPage() {
    /* Prefer pathname-based routing (new) */
    const path = location.pathname.replace(/^\//, '').split('/')[0];
    if (path && PAGES[path]) return path;
    /* Fall back to hash (legacy bookmarks) */
    const hash = location.hash;
    if (!hash || hash === '#/' || hash === '#') return 'home';
    const slug = hash.replace(/^#\//, '').split('/')[0];
    return PAGES[slug] ? slug : 'home';
  }

  /* ─── Init ─── */
  function init() {
    /* Registered FIRST, before anything below that could throw — this
       listener fixes the earlier "dashboard flash" bug (re-renders once
       Clerk resolves auth ~1-3s after load). It used to be the LAST
       statement in init(), so if navigate() (400+ lines, run further
       down) threw on stale post-deploy localStorage data, this listener
       never got wired up and the dashboard stayed stuck — one visible
       symptom of the "hard refresh doesn't start fresh" bug. */
    OmicsLab.AuthClerk?.onAuthChange?.(function(user) {
      if (_currentPage !== 'home') return;
      const dash = document.getElementById('home-dashboard');
      if (!dash) return;
      if (user) {
        OmicsLab.Dashboard?.render(dash);
        dash.style.display = '';
      } else {
        dash.style.display = 'none';
      }
    });

    OmicsLab.Theme?.init();
    OmicsLab.Error?.init();
    OmicsLab.Notifications?.init();
    OmicsLab.OfflineIndicator?.init();
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

    /* Dataset Hub deep link: /?openLab=<workflowId>&payload=<json>
       lands straight inside a workflow with the dataset preview shown
       in a banner, bypassing the normal chooser flow. This must NOT
       also call navigate() below — screen-lab is a top-level screen
       outside the router's own page system (see the dual-navigation
       note near showScreen in app.js), so running both would just
       have navigate()'s page underneath the lab screen fight for
       state. The URL is cleaned immediately after so a reload/back
       doesn't re-trigger it. */
    const _deepLinkParams = new URLSearchParams(location.search);
    const _openLabWfId = _deepLinkParams.get('openLab');
    if (_openLabWfId && OmicsLab.Workflows?.[_openLabWfId] && OmicsLab.App?.startWorkflow) {
      let preload = null;
      try { preload = JSON.parse(_deepLinkParams.get('payload') || 'null'); } catch { preload = null; }
      history.replaceState(null, '', location.pathname + location.hash);
      OmicsLab.App.startWorkflow(_openLabWfId, { preload });
    } else {
      /* Navigate to hash or home */
      navigate(_hashToPage());
    }

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

  /* ─── AI Pipeline Recommender (mini widget on home) ─── */
  async function _pipelineRecommend() {
    const input  = document.getElementById('hpm-input');
    const result = document.getElementById('hpm-result');
    if (!input || !result) return;

    const query = input.value.trim();
    if (!query) { input.focus(); return; }

    const key = localStorage.getItem('omicslab_anthropic_key');
    if (!key) {
      result.style.display = 'block';
      result.innerHTML = `<span style="color:#f97316">Add your Claude API key in Settings to use AI features.</span>`;
      return;
    }

    result.style.display = 'block';
    result.innerHTML = `<span style="color:#A8A098;font-style:italic">Analysing your data description…</span>`;

    try {
      const resp = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': key,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-fable-5',
          max_tokens: 512,
          system: 'You are an expert bioinformatics pipeline advisor specialising in African genomics. Given a brief data description, recommend the best analysis pipeline in 3-5 bullet points: recommended tools in order, key QC thresholds, and one common pitfall to avoid. Be concise and practical. Use markdown bullet points.',
          messages: [{ role: 'user', content: `Data description: ${query}\n\nRecommend the best bioinformatics pipeline for this data.` }],
        }),
      });
      const data = await resp.json();
      const text = data?.content?.[0]?.text || 'No response received.';
      /* Convert markdown bullets to HTML */
      const html = text
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/^[-*•]\s+(.+)$/gm, '<li>$1</li>')
        .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
        .replace(/\n\n/g, '<br>');
      result.innerHTML = `<div class="hpm-answer">${html}</div>`;
    } catch (err) {
      result.innerHTML = `<span style="color:#f85149">Error: ${err.message || 'Request failed'}</span>`;
    }
  }

  return { init, navigate, PAGES, _pipelineRecommend };
})();
