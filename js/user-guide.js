/* ═══════════════════════════════════════════════════════════════
   OmicsLab — User Guide & Manual
   Searchable directory of all 87+ modules with descriptions,
   why-it-matters notes, and navigation links.
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.UserGuide = (function () {

  /* ── Category definitions ── */
  const CATS = [
    { id:'all',        label:'All Tools' },
    { id:'start',      label:'Getting Started' },
    { id:'genomics',   label:'Genomics & Sequencing' },
    { id:'variants',   label:'Variant & Clinical' },
    { id:'expression', label:'Expression & Proteomics' },
    { id:'pipelines',  label:'Pipelines & Tools' },
    { id:'africa',     label:'African Genomics' },
    { id:'research',   label:'Research & Writing' },
    { id:'training',   label:'Training & Community' },
    { id:'platform',   label:'Platform' },
  ];

  /* ── Module data ── */
  const MODULES = [
    /* ═══ Getting Started ═══ */
    {
      id:'lab', cat:'start', page:'lab', color:'#3fb950',
      name:'Lab Simulations',
      tagline:'14 interactive wet-lab protocols',
      desc:'The heart of OmicsLab. Run realistic omics experiments end-to-end — from sample collection through sequencing to data output. Every decision ripples into your QC metrics, just like a real bench.',
      why:'Builds the intuition that separates a bioinformatician who understands data from one who just runs tools.',
      how:'Train → Lab Simulations',
      tags:['Core','Beginner–Advanced','Offline'],
    },
    {
      id:'virtual-lab', cat:'start', page:'virtual-lab', color:'#3fb950',
      name:'Virtual Lab',
      tagline:'360° genomics instrument tour',
      desc:'Walk through a virtual genomics laboratory. Explore 20+ real instruments — Illumina sequencers, PacBio Revio, MinION, ABI 3730, thermocyclers — and understand how each fits into African research workflows.',
      why:'Students who can visualise the instrument behind the data interpret QC results far more accurately.',
      how:'Train → Virtual Lab',
      tags:['Visual','Beginner','Offline'],
    },
    {
      id:'learn', cat:'start', page:'learn', color:'#58a6ff',
      name:'Curriculum Tracks',
      tagline:'Structured 12-week learning paths',
      desc:'Follow guided learning paths covering Genomics, Transcriptomics, Metagenomics, GWAS, and Clinical Genomics. Each track has weekly modules, quizzes, and a final certificate on completion.',
      why:'Structured progression prevents the "tutorial trap" — you build expertise, not just familiarity.',
      how:'Train → Curriculum Tracks',
      tags:['Core','All Levels','Certificate'],
    },
    {
      id:'skill-tree', cat:'start', page:'skill-tree', color:'#e3b341',
      name:'Skill Tree',
      tagline:'Adaptive XP engine & progression map',
      desc:'Visualise your learning journey as an RPG skill tree. Every module you complete earns XP and unlocks new branches. Track your bioinformatics level, compare with the global community, and set your next goal.',
      why:'Gamified progression sustains motivation across a 12-week curriculum better than any syllabus.',
      how:'Train → Skill Tree (also in the top nav bar)',
      tags:['Gamification','Progress','Offline'],
    },
    {
      id:'case-files', cat:'start', page:'case-files', color:'#f97316',
      name:'Genomics Case Files',
      tagline:'5 real African clinical mysteries',
      desc:'Solve five decision-tree clinical genomics cases: MDR-TB outbreak investigation, sickle-cell genetic counselling, COVID-19 sequencing chain-of-custody, GWAS signal interpretation, and a paediatric rare disease diagnosis.',
      why:'Case-based learning is the fastest way to build clinical genomics judgment — the kind that matters in real patient care.',
      how:'Train → Genomics Case Files',
      tags:['Case Study','Clinical','Africa'],
    },

    /* ═══ Genomics & Sequencing ═══ */
    {
      id:'fastqc', cat:'genomics', page:'fastqc', color:'#3fb950',
      name:'Read QC (FastQC)',
      tagline:'Per-base quality metrics for raw reads',
      desc:'FastQC-style read quality analysis in your browser. Input sequencing metrics to get per-base quality boxplots, GC-content distribution, adapter contamination flags, and PASS/WARN/FAIL assessments calibrated for African disease sequencing data.',
      why:'Raw read QC is the first gate every dataset must pass — catching problems here saves weeks of downstream trouble.',
      how:'Tools → Read QC',
      tags:['QC','Beginner','Offline'],
    },
    {
      id:'qualitypredictor', cat:'genomics', page:'qualitypredictor', color:'#3fb950',
      name:'Quality Predictor',
      tagline:'PASS/FAIL prediction from QC metrics',
      desc:'Enter your QC metrics — coverage, duplication rate, read length, GC bias — and a logistic regression model trained on GATK, ENCODE, and H3Africa thresholds returns a PASS/FAIL verdict with per-metric root-cause advice.',
      why:'Saves hours of manual threshold-checking; instantly tells you which metric is failing and why.',
      how:'Tools → Quality Predictor',
      tags:['QC','Intermediate','Offline'],
    },
    {
      id:'alignment-viewer', cat:'genomics', page:'alignment-viewer', color:'#58a6ff',
      name:'Alignment Viewer',
      tagline:'AliView-equivalent MSA browser',
      desc:'Visualise multiple sequence alignments with colour-coded nucleotides. Inspect conservation profiles, column statistics, and alignment quality at every position. Supports FASTA input and exports aligned sequences.',
      why:'MSA is the foundation for phylogenetics, variant calling, and primer design — seeing it visually removes ambiguity.',
      how:'Tools → Alignment Viewer',
      tags:['MSA','Intermediate','Offline'],
    },
    {
      id:'genome-browser', cat:'genomics', page:'genome-browser', color:'#58a6ff',
      name:'Genome Browser',
      tagline:'IGV-style browser for key African disease loci',
      desc:'Explore HBB (sickle cell), G6PD, APOL1, and CYP2D6 genomic loci with depth tracks, variant annotations, and gene structure overlays — just like UCSC/IGV but offline and Africa-focused.',
      why:'Understanding the genomic context of a variant is essential for clinical interpretation; a browser makes this concrete.',
      how:'Tools → Genome Browser',
      tags:['Browser','Intermediate','Offline'],
    },
    {
      id:'assembly', cat:'genomics', page:'assembly', color:'#e3b341',
      name:'Assembly Evaluator',
      tagline:'Genome assembly QC — N50, BUSCO, Nx',
      desc:'Evaluate genome assemblies using N50 statistics, Nx plots, contig-length distributions, and BUSCO completeness scores. Compare short-read, long-read, and hybrid assemblies of African pathogens side by side.',
      why:'A good assembly is the bedrock of every downstream analysis; poor assemblies silently contaminate every result.',
      how:'Tools → Assembly Evaluator',
      tags:['Assembly','Advanced','Offline'],
    },
    {
      id:'nanopore', cat:'genomics', page:'nanopore', color:'#3fb950',
      name:'Nanopore QC',
      tagline:'Oxford Nanopore sequencing QC for field use',
      desc:'Paste NanoStat output or enter read-length/quality metrics to get PASS/WARN/FAIL thresholds specifically calibrated for field-deployed MinION sequencing of African pathogens (TB, SARS-CoV-2, mpox, malaria).',
      why:'MinION is increasingly deployed in African field labs; knowing how to interpret its QC is a career-defining skill.',
      how:'Tools → Nanopore QC',
      tags:['Nanopore','Intermediate','Offline'],
    },
    {
      id:'seq-align', cat:'genomics', page:'seq-align', color:'#3fb950',
      name:'Sequence Alignment',
      tagline:'Animated Needleman-Wunsch & Smith-Waterman',
      desc:'Watch global (NW) and local (SW) sequence alignment unfold step by step with a live DP table visualisation. Pre-loaded presets include HBB, rpoB, kelch13, and CYP2B6 — key genes in African disease research.',
      why:'Understanding alignment algorithms at this level is what separates those who understand GATK outputs from those who guess.',
      how:'Train → Sequence Alignment',
      tags:['Algorithm','Beginner','Visual'],
    },
    {
      id:'primerdesign', cat:'genomics', page:'primerdesign', color:'#3fb950',
      name:'Primer Design',
      tagline:'PCR primer validation with 6 African pathogen templates',
      desc:'Auto-design or validate PCR primer pairs — Wallace melting temperature, GC%, self-complementarity check, dimer risk, and a SVG alignment diagram. Six presets cover TB rpoB, malaria pfkelch13, HIV pol, HBB, COVID-19 ORF1ab, and SARS spike.',
      why:'Bad primers waste weeks; correct primer design is the most common skill gap in African genomics labs.',
      how:'Tools → Primer Design',
      tags:['PCR','Intermediate','Offline'],
    },

    /* ═══ Variant & Clinical ═══ */
    {
      id:'variantinterp', cat:'variants', page:'variantinterp', color:'#bc8cff',
      name:'Variant Interpreter',
      tagline:'ACMG/AMP classification with Africa-specific AF',
      desc:'Enter a VCF line or HGVS notation to receive full ACMG/AMP 2015 five-tier classification, gnomAD African allele frequencies, ClinVar significance for 20+ Africa-relevant disease variants, and a step-by-step criterion score.',
      why:'ACMG classification is now mandatory in clinical genomics labs across Africa; this module teaches the method interactively.',
      how:'Tools → Variant Interpreter',
      tags:['Clinical','Advanced','Offline'],
    },
    {
      id:'variant-atlas', cat:'variants', page:'variant-atlas', color:'#bc8cff',
      name:'Variant Atlas',
      tagline:'40+ clinically significant Africa variants',
      desc:'A curated atlas of 40+ variants with high clinical relevance in African populations — sickle cell HBB E6V, G6PD A-, APOL1 G1/G2, NAT2 slow acetylators, CYP2B6 efavirenz metabolisers, and more — with Africa-specific allele frequencies.',
      why:'African populations are massively under-represented in ClinVar; this atlas fills a critical knowledge gap.',
      how:'Tools → Variant Atlas',
      tags:['Africa','Clinical','Offline'],
    },
    {
      id:'gwas', cat:'variants', page:'gwas', color:'#58a6ff',
      name:'GWAS Suite',
      tagline:'GWAS for African cohorts — Manhattan, QQ, PCA',
      desc:'Run genome-wide association analysis pipelines for African cohorts. Generates Manhattan plots, QQ plots, PCA scatter, and produces PLINK2/REGENIE command templates calibrated against the AWI-Gen and H3Africa reference panels.',
      why:'Africa-specific GWAS requires different MAF thresholds and population structure correction than European studies — this teaches you why.',
      how:'Tools → GWAS Suite',
      tags:['GWAS','Advanced','Africa'],
    },
    {
      id:'clinical-decision', cat:'variants', page:'clinical-decision', color:'#ff6b6b',
      name:'Clinical Genomics',
      tagline:'HPO-based diagnostic genomics recommendations',
      desc:'Select patient phenotype terms using HPO ontology and receive Africa-appropriate genomic test recommendations — WGS, WES, or targeted panels — with estimated diagnostic yields from African cohort data.',
      why:'Choosing the right test is a clinical decision, not a technical one; this tool trains that judgment at scale.',
      how:'Tools → Clinical Genomics',
      tags:['Clinical','Advanced','Africa'],
    },
    {
      id:'pharmacogenomics', cat:'variants', page:'pharmacogenomics', color:'#f97316',
      name:'Pharmacogenomics',
      tagline:'Drug-gene interactions in African populations',
      desc:'CYP2B6 efavirenz toxicity, G6PD primaquine haemolysis, NAT2 isoniazid slow acetylation, SLCO1B1 statin myopathy — African-relevant drug-gene pairs with CPIC/WHO clinical action guidelines and population-specific allele frequencies.',
      why:'PGx variants that are rare in Europeans are common in Africans — this tool makes that clinically actionable.',
      how:'Tools → Pharmacogenomics',
      tags:['Clinical','Advanced','Africa'],
    },
    {
      id:'amr', cat:'variants', page:'amr', color:'#ff6b6b',
      name:'AMR Profiler',
      tagline:'Antimicrobial resistance classification',
      desc:'Enter mutation profiles to classify MDR-TB, XDR-TB, CRE, and ESBL organisms. Linked to WHO resistance breakpoints and African surveillance data from NHLS, KEMRI, and H3Africa partner networks.',
      why:'AMR is Africa\'s fastest-growing infectious disease crisis; clinical genomics is central to surveillance.',
      how:'Tools → AMR Profiler',
      tags:['AMR','Intermediate','Africa'],
    },

    /* ═══ Expression & Proteomics ═══ */
    {
      id:'heatmap', cat:'expression', page:'heatmap', color:'#e3b341',
      name:'Expression Visualiser',
      tagline:'DESeq2/edgeR volcano plots & heatmaps',
      desc:'Paste differential expression output and get an interactive volcano plot, top-gene heatmap, and ranked DE table instantly. Supports DESeq2 and edgeR output formats. All rendered offline with Chart.js.',
      why:'Visualising DE results is the moment most students understand what gene expression actually means.',
      how:'Tools → Expression Visualiser',
      tags:['RNA-seq','Intermediate','Offline'],
    },
    {
      id:'rna-atlas', cat:'expression', page:'rna-atlas', color:'#f85149',
      name:'RNA Expression Atlas',
      tagline:'African disease cohort expression profiles',
      desc:'Interactive volcano plots and heatmaps for real differential expression datasets from African disease cohorts — malaria PBMC, TB granuloma, COVID-19 BALF, and sickle cell reticulocytes. Drill into any gene for annotation.',
      why:'Working with real data, not toy examples, is the only way to develop genuine bioinformatics judgment.',
      how:'Tools → RNA Expression Atlas',
      tags:['RNA-seq','Intermediate','Africa'],
    },
    {
      id:'single-cell', cat:'expression', page:'single-cell', color:'#bc8cff',
      name:'Single-Cell Explorer',
      tagline:'scRNA-seq UMAP · clustering · Africa cohorts',
      desc:'Explore single-cell RNA-seq data from African disease cohorts — a malaria PBMC atlas and a TB lung granuloma dataset. Visualise UMAPs, examine cluster marker genes, and annotate cell types interactively.',
      why:'scRNA-seq is the fastest-growing method in the field; understanding it is now required for competitive grant applications.',
      how:'Tools → Single-Cell Explorer',
      tags:['scRNA-seq','Advanced','Africa'],
    },
    {
      id:'pathways', cat:'expression', page:'pathways', color:'#3fb950',
      name:'Pathways',
      tagline:'KEGG + Reactome pathway browser',
      desc:'Browse KEGG disease pathway maps and Reactome pathway diagrams with an Africa-disease focus. Overlay your own gene lists, search by keyword, and navigate between pathways with linked gene annotations.',
      why:'Pathway context transforms a list of DE genes into a biological story — essential for manuscript writing.',
      how:'Tools → Pathways',
      tags:['Pathway','Intermediate','Online'],
    },
    {
      id:'enrichment', cat:'expression', page:'enrichment', color:'#58a6ff',
      name:'GO Enrichment',
      tagline:'GO and KEGG enrichment analysis',
      desc:'Paste a gene list from your differential expression analysis and receive GO and KEGG pathway enrichment results visualised as bar charts and bubble plots. Pre-loaded malaria, TB, and COVID-19 DEG lists for practice.',
      why:'Enrichment analysis is how raw gene lists become publishable biological insights.',
      how:'Tools → GO Enrichment',
      tags:['Enrichment','Intermediate','Offline'],
    },
    {
      id:'proteomics', cat:'expression', page:'proteomics', color:'#bc8cff',
      name:'Proteomics Fundamentals',
      tagline:'LC-MS/MS · quantification · Africa proteomes',
      desc:'Learn the complete mass-spectrometry-based proteomics workflow: sample prep, LC-MS/MS data acquisition, database searching, protein quantification (LFQ/TMT/SILAC/MRM), and data interpretation — illustrated with African disease proteomics studies.',
      why:'Multi-omics integration is the frontier of disease research; proteomics is the missing layer for most genomicists.',
      how:'Train → Proteomics Fundamentals',
      tags:['Proteomics','Intermediate','Offline'],
    },

    /* ═══ Pipelines & Tools ═══ */
    {
      id:'pipeline-visual', cat:'pipelines', page:'pipeline-visual', color:'#3fb950',
      name:'Pipeline Visualiser',
      tagline:'Node-by-node pipeline explorer',
      desc:'Explore WGS, RNA-seq, metagenomics, and Nanopore ARTIC bioinformatics pipelines as interactive node graphs. Click any step to see the tool, its parameters, expected outputs, and common failure modes.',
      why:'Most students memorise pipeline steps without understanding why they are in that order. This fixes that.',
      how:'Train → Pipeline Visualiser',
      tags:['Pipeline','Beginner','Offline'],
    },
    {
      id:'pipeline-gen', cat:'pipelines', page:'pipeline-gen', color:'#bc8cff',
      name:'Pipeline Generator',
      tagline:'Snakemake & Nextflow DSL2 boilerplate',
      desc:'Generate production-ready Snakemake or Nextflow DSL2 pipeline scripts for WGS GATK4, bulk RNA-seq, metagenomics, and Africa GWAS workflows. One-click copy with HPC SLURM job submission headers.',
      why:'Getting a pipeline from scratch to running on an HPC cluster takes days; this cuts it to minutes.',
      how:'Tools → Pipeline Gen',
      tags:['Pipeline','Intermediate','Offline'],
    },
    {
      id:'terminal', cat:'pipelines', page:'terminal', color:'#3fb950',
      name:'Terminal',
      tagline:'Simulated CLI for real pipeline commands',
      desc:'A browser-based terminal environment where you practice real bioinformatics commands — BWA, samtools, GATK, bcftools, featureCounts — with simulated outputs that mirror what you would see on an actual HPC cluster.',
      why:'Command-line fluency is non-negotiable for a working bioinformatician; this builds it without requiring server access.',
      how:'Train → Terminal',
      tags:['CLI','Beginner','Offline'],
    },
    {
      id:'codon', cat:'pipelines', page:'codon', color:'#58a6ff',
      name:'Codon Usage',
      tagline:'RSCU codon bias analysis',
      desc:'Analyse relative synonymous codon usage (RSCU) bias for any DNA sequence. Compare against human, M. tuberculosis, and P. falciparum reference codon tables — useful for optimising recombinant expression and identifying viral adaptation.',
      why:'Codon bias analysis is an under-taught but highly useful tool for vaccine design and expression optimisation.',
      how:'Tools → Codon Usage',
      tags:['Codon','Intermediate','Offline'],
    },
    {
      id:'kraken', cat:'pipelines', page:'kraken', color:'#e3b341',
      name:'Metagenomics',
      tagline:'Kraken2-style taxonomic profiling',
      desc:'Simulate Kraken2 metagenomic classification for six African field sample profiles — gut microbiome, environmental water, clinical sputum, soil, blood-borne pathogen panel, and hospital wastewater. Results include a Krona-style donut chart and TSV export.',
      why:'Metagenomics is the primary tool for outbreak investigation and AMR surveillance in resource-limited African settings.',
      how:'Tools → Metagenomics',
      tags:['Metagenomics','Intermediate','Offline'],
    },
    {
      id:'debugger', cat:'pipelines', page:'debugger', color:'#ff6b6b',
      name:'Protocol Debugger',
      tagline:'200+ rules for QC root-cause diagnosis',
      desc:'Paste your QC report or describe a failed experiment step. A rule engine with 200+ conditions matches your description to root causes, biological explanations, and corrective actions — covering FASTQ, alignment, variant calling, and library prep failures.',
      why:'Understanding WHY an experiment failed is more valuable than knowing THAT it failed.',
      how:'Train → Protocol Debugger',
      tags:['Debugging','All Levels','Offline'],
    },
    {
      id:'bionlp', cat:'pipelines', page:'bionlp', color:'#3fb950',
      name:'BioNLP',
      tagline:'Offline biomedical entity recognition',
      desc:'Browser-side named entity recognition for biomedical text — extract genes, diseases, variants, drugs, organisms, and Africa-specific terms from abstracts or notes without sending data to any server.',
      why:'Text mining at scale is transforming literature review; understanding how NER works makes you a better collaborator with AI tools.',
      how:'Tools → BioNLP',
      tags:['NLP','Advanced','Offline'],
    },
    {
      id:'analysis', cat:'pipelines', page:'analysis', color:'#e3b341',
      name:'Analysis Studio',
      tagline:'FASTQ · FASTA · VCF · expression matrix',
      desc:'A multi-tab analysis workspace: FASTQ QC, FASTA tools (GC%, reverse complement, translation), VCF explorer (filter by AF, impact, gene), and expression matrix operations (normalisation, PCA). All offline, no data leaves your browser.',
      why:'Data wrangling accounts for 80% of bioinformatics work; building these skills saves enormous time downstream.',
      how:'Train → Analysis Studio',
      tags:['Analysis','All Levels','Offline'],
    },

    /* ═══ African Genomics ═══ */
    {
      id:'africa', cat:'africa', page:'africa', color:'#f97316',
      name:'Africa Hub',
      tagline:'African genomics science · 54 countries',
      desc:'A centralised hub for African genomics — interactive map of research institutions, open datasets, active studies, and training resources across all 54 African nations. Browse by country, disease, or consortium.',
      why:'The Africa Hub contextualises the science within the continent\'s health priorities, which global platforms consistently overlook.',
      how:'Research → Africa Hub',
      tags:['Africa','Core','Offline'],
    },
    {
      id:'h3africa', cat:'africa', page:'h3africa', color:'#f97316',
      name:'H3Africa Portal',
      tagline:'Pan-African genomics research hub',
      desc:'Explore H3Africa consortium projects, datasets, tools, and training resources. Browse AWI-Gen, SSACOHORT, PanSickle, and 30+ studies across 30 countries. Links to data access requests and ethics board contacts.',
      why:'H3Africa is the continent\'s most important genomics infrastructure; every African bioinformatician should understand it.',
      how:'Research → H3Africa Portal',
      tags:['Africa','Consortium','Data'],
    },
    {
      id:'popstruct', cat:'africa', page:'popstruct', color:'#bc8cff',
      name:'Population Structure',
      tagline:'ADMIXTURE Q-matrix · PCA for African cohorts',
      desc:'Visualise population structure using ADMIXTURE Q-matrix stacked bars and PCA scatter for AWI-Gen, 1000 Genomes African superpopulation, and sickle cell disease cohorts. Adjust K from 2 to 10 and export results.',
      why:'African population structure is enormously complex and systematically misrepresented when using European reference panels.',
      how:'Tools → Pop Structure',
      tags:['Population Genetics','Advanced','Offline'],
    },
    {
      id:'pathogen-tracker', cat:'africa', page:'pathogen-tracker', color:'#ff6b6b',
      name:'Pathogen Tracker',
      tagline:'Africa genomic surveillance · 30+ countries',
      desc:'Live surveillance dashboard for SARS-CoV-2, TB, malaria, mpox, and cholera across 30+ African countries. Displays Nextstrain-derived clade distributions, sequencing capacity per country, and outbreak timeline.',
      why:'Genomic epidemiology is Africa\'s best weapon against infectious disease outbreaks; this shows how it works in practice.',
      how:'Research → Pathogen Tracker',
      tags:['Surveillance','Africa','Online'],
    },
    {
      id:'one-health', cat:'africa', page:'one-health', color:'#3fb950',
      name:'One Health',
      tagline:'Human-animal-environment disease nexus',
      desc:'A One Health surveillance dashboard covering 15 zoonotic diseases across Africa — rabies, brucellosis, Rift Valley fever, mpox, COVID-19, and more — with genomic, climate, and land-use drivers visualised together.',
      why:'70% of emerging infections are zoonotic; One Health thinking is the only effective approach to outbreak prevention.',
      how:'Research → One Health',
      tags:['One Health','Africa','Intermediate'],
    },
    {
      id:'knowledge-graph', cat:'africa', page:'knowledge-graph', color:'#bc8cff',
      name:'Knowledge Graph',
      tagline:'Variant-disease-gene-country network',
      desc:'An interactive force-directed network graph connecting African diseases, causal genes, key variants, populations, and countries. Click any node to expand its connections. Built from H3Africa, gnomAD, and ClinVar data.',
      why:'Genomics is fundamentally a network science; seeing variants in the context of disease and population is more instructive than any table.',
      how:'Tools → Knowledge Graph',
      tags:['Network','Visual','Africa'],
    },
    {
      id:'outbreak', cat:'africa', page:'outbreak', color:'#f97316',
      name:'Outbreak Simulator',
      tagline:'Sequence · phylogeny · trace the index case',
      desc:'Simulate a complete genomic outbreak investigation across Africa. Collect samples, sequence them in a simulated MinION run, build a maximum-likelihood phylogenetic tree, and use temporal signal to identify the index case.',
      why:'Genomic outbreak investigation is one of the highest-impact applications of African bioinformatics; this teaches the full workflow.',
      how:'Train → Outbreak Simulator',
      tags:['Epidemiology','Advanced','Africa'],
    },

    /* ═══ Research & Writing ═══ */
    {
      id:'labnotebook', cat:'research', page:'labnotebook', color:'#3fb950',
      name:'Lab Notebook',
      tagline:'Digital research records — stored offline',
      desc:'A structured digital lab notebook for recording experiments, analyses, protocols, hypotheses, and results. Entries are timestamped, taggable by project, searchable, and exportable to Markdown or PDF.',
      why:'Good record-keeping is the foundation of reproducible science and is increasingly required for publication.',
      how:'Train → Lab Notebook',
      tags:['Research','All Levels','Offline'],
    },
    {
      id:'grant', cat:'research', page:'grant', color:'#e3b341',
      name:'Grant Generator',
      tagline:'NIH Fogarty · Wellcome · H3Africa boilerplate',
      desc:'Generate draft sections for NIH Fogarty D43, Wellcome Trust, and H3Africa grant applications — Specific Aims, Research Strategy, Budget Justification, Ethical Considerations, and Data Management Plan. Customisable templates with Africa-specific language.',
      why:'Grant-writing is a learnable skill, but most researchers are never taught it. This module demystifies the process.',
      how:'Research → Grant Generator',
      tags:['Grant','Advanced','Offline'],
    },
    {
      id:'thesis', cat:'research', page:'thesis', color:'#bc8cff',
      name:'Thesis Coach',
      tagline:'AI-powered thesis writing assistant',
      desc:'AI-assisted thesis writing with a 5-chapter progress tracker, chapter-by-chapter draft generation, abstract writer, and word-count dashboard. Upload your Claude API key to unlock AI generation.',
      why:'A well-structured thesis is the most visible output of a PhD; coaching students through it is a high-leverage intervention.',
      how:'Research → Thesis Coach',
      tags:['Thesis','AI','Writing'],
    },
    {
      id:'peerreview', cat:'research', page:'peerreview', color:'#bc8cff',
      name:'Peer Review Simulator',
      tagline:'3 virtual reviewers · 40+ quality indicators',
      desc:'Submit a manuscript abstract or methods section and receive structured reviews from three virtual reviewers: a biostatistician, a genomics methods specialist, and an African ethics expert. Rubric-based feedback against 40+ evidence quality indicators.',
      why:'Peer review literacy — both receiving and giving it — is the most under-trained skill in African academia.',
      how:'Research → Peer Review',
      tags:['Peer Review','Advanced','Offline'],
    },
    {
      id:'research-wizard', cat:'research', page:'research-wizard', color:'#bc8cff',
      name:'Research Design Wizard',
      tagline:'Step-by-step study design from hypothesis to protocol',
      desc:'A guided wizard that walks you from PICO research question through study type selection, sample size calculation, ethics checklist, bioinformatics pipeline recommendation, and exportable protocol document.',
      why:'Most research failures are design failures. Getting the design right before starting is the highest-leverage act in science.',
      how:'Research → Research Design Wizard',
      tags:['Research Design','Beginner','Offline'],
    },
    {
      id:'collab', cat:'research', page:'collab', color:'#58a6ff',
      name:'Collaborate',
      tagline:'Real-time WebRTC peer-to-peer lab sessions',
      desc:'Share a session code with a colleague and work on OmicsLab side-by-side in real time. Built on WebRTC — no server stores your data. Synchronized cursor, shared analysis state, and in-app voice toggle.',
      why:'Science is collaborative; the ability to work live with remote colleagues across Africa is a 21st-century research skill.',
      how:'Research → Collaborate',
      tags:['Collaboration','Intermediate','Offline'],
    },
    {
      id:'output-tracker', cat:'research', page:'output-tracker', color:'#3fb950',
      name:'Output Tracker',
      tagline:'Publications · datasets · talks · grants',
      desc:'Track your research outputs across publications, datasets, conference talks, posters, and grants. Add DOIs, dates, co-authors, and links. Export as CSV or BibTeX for use in funding reports and CVs.',
      why:'Demonstrating research impact with a well-maintained output record is essential for career advancement and grant applications.',
      how:'Train → Output Tracker',
      tags:['Research','All Levels','Offline'],
    },

    /* ═══ Training & Community ═══ */
    {
      id:'certification', cat:'training', page:'certification', color:'#e3b341',
      name:'Certification',
      tagline:'Open Badge 3.0 verifiable certificates',
      desc:'Earn OmicsLab certificates by completing curriculum tracks. Certificates are issued as Open Badge 3.0 W3C Verifiable Credentials — share them on LinkedIn or email a verification link to employers. Downloadable as PDF.',
      why:'Recognised credentials are how African researchers demonstrate competence to international collaborators and funders.',
      how:'Train → Certification',
      tags:['Certificate','Core','Offline'],
    },
    {
      id:'quizbattle', cat:'training', page:'quizbattle', color:'#ff6b6b',
      name:'Quiz Battle',
      tagline:'65+ questions · 12 omics categories',
      desc:'Test your knowledge across genomics, transcriptomics, metagenomics, clinical genomics, tools, statistics, ethics, and African genomics. Solo timed mode or same-device multiplayer via BroadcastChannel. Immediate explanations for wrong answers.',
      why:'Active recall is the most effective revision technique; these quizzes are built around common exam and interview questions.',
      how:'Train → Quiz Battle',
      tags:['Quiz','All Levels','Offline'],
    },
    {
      id:'journalclub', cat:'training', page:'journalclub', color:'#3fb950',
      name:'Journal Club',
      tagline:'20+ landmark African genomics papers',
      desc:'Read plain-language summaries of landmark African genomics papers — H3Africa consortium outputs, AWI-Gen GWAS, MalariaGEN reports, African COVID-19 lineages, sickle cell genomics. Each has key findings, Africa context, and discussion questions.',
      why:'Knowing the literature is what makes a researcher credible; this module builds that foundation efficiently.',
      how:'Train → Journal Club',
      tags:['Literature','Beginner','Offline'],
    },
    {
      id:'leaderboard', cat:'training', page:'leaderboard', color:'#e3b341',
      name:'Leaderboard',
      tagline:'Global rankings · streaks · Africa map',
      desc:'See global XP rankings, weekly streaks, and a world map showing OmicsLab learners across 80+ countries. Share your rank on social media and challenge colleagues.',
      why:'Healthy competition accelerates learning; the global community provides benchmarking context for learners in any country.',
      how:'Train → Leaderboard',
      tags:['Community','All Levels','Online'],
    },
    {
      id:'social', cat:'training', page:'social', color:'#3fb950',
      name:'Social Hub',
      tagline:'Peer learning · friend codes · in-app chat',
      desc:'Connect with other OmicsLab researchers. See who is online, add friends by sharing codes, and chat directly inside the platform. Shared session notifications so you can jump into a colleague\'s analysis.',
      why:'Learning in community beats learning alone; peer accountability is one of the strongest predictors of course completion.',
      how:'Research → Social Hub',
      tags:['Community','All Levels','Offline'],
    },
    {
      id:'ai-ml-bio', cat:'training', page:'ai-ml-bio', color:'#bc8cff',
      name:'AI & ML in Bioinformatics',
      tagline:'Foundation models · neural nets · AlphaFold · ESM-2',
      desc:'A comprehensive module covering the AI revolution in bioinformatics — large language models (ESM-2, AlphaFold, scGPT), classical ML for variant pathogenicity prediction, an interactive neural network visualiser, and Africa\'s AI research landscape.',
      why:'AI is reshaping bioinformatics faster than any prior technology; getting a conceptual foundation now is urgent.',
      how:'Train → AI & ML in Bioinformatics',
      tags:['AI/ML','Advanced','Offline'],
    },
    {
      id:'epigenomics', cat:'training', page:'epigenomics', color:'#3fb950',
      name:'Epigenomics Explorer',
      tagline:'Methylation · histone marks · ATAC-seq',
      desc:'Explore DNA methylation patterns, histone modification landscapes, and chromatin accessibility through ATAC-seq — applied to the epigenetic regulation of malaria, TB, and sickle cell disease genes in African populations.',
      why:'Epigenomics explains phenotypic variation that genetics alone cannot; it\'s the next frontier in African disease research.',
      how:'Train → Epigenomics',
      tags:['Epigenomics','Intermediate','Offline'],
    },

    /* ═══ Platform ═══ */
    {
      id:'institution', cat:'platform', page:'institution', color:'#58a6ff',
      name:'Institution Mode',
      tagline:'Cohort management · 12-week curriculum · CSV export',
      desc:'Instructors can create a cohort with a unique code, assign a 12-week structured curriculum, and track student XP, skill completion, and week-by-week progress — all offline, without a server or login.',
      why:'Structured institutional delivery is how OmicsLab scales from individual learners to department-wide training programmes.',
      how:'Train → Institution (or "For Institutions" in the nav)',
      tags:['Institutional','Offline','Admin'],
    },
    {
      id:'pricing', cat:'platform', page:'pricing', color:'#3fb950',
      name:'Plans & Pricing',
      tagline:'Community · Campus · Enterprise tiers',
      desc:'OmicsLab is free for individual learners forever. Institutions can add cohort management, admin dashboards, priority support, and custom curriculum branding under Campus or Enterprise licensing. 60% discount for African academic and NGO institutions.',
      why:'Sustainable funding for open science tools allows them to keep improving; institutional licensing is how OmicsLab funds its future.',
      how:'"For Institutions" in the top nav bar',
      tags:['Licensing','Institutional'],
    },
    {
      id:'ai', cat:'platform', page:'ai', color:'#58a6ff',
      name:'AI Assistant',
      tagline:'Claude-powered genomics expert',
      desc:'A Claude-powered AI assistant with a genomics-focused system prompt. Ask about tools, workflows, African disease variants, statistics, or anything bioinformatics-related. Add your own Claude API key in Settings for full access.',
      why:'Having an expert available at 3am, in a language you understand, at a cost that is effectively zero, changes how researchers learn.',
      how:'(Key icon) AI Assistant in settings — or Tools → AI',
      tags:['AI','All Levels','API Key'],
    },
    {
      id:'scrna-explorer', cat:'platform', page:'scrna-explorer', color:'#bc8cff',
      name:'scRNA-seq Explorer (App)',
      tagline:'Live Streamlit app — full scRNA-seq pipeline',
      desc:'A full single-cell RNA-seq analysis app built by Simon Mufara and embedded live inside OmicsLab. Upload count matrices, run UMAP dimensionality reduction, perform clustering, and annotate cell types interactively.',
      why:'Real scRNA-seq analysis demands real tools — this embedded app bridges the gap between simulation and production.',
      how:'Tools → scRNA-seq Explorer (or in nav bar)',
      tags:['scRNA-seq','Advanced','Live App'],
    },
    {
      id:'variants-explorer', cat:'platform', page:'variants-explorer', color:'#58a6ff',
      name:'Variant Analysis Suite (App)',
      tagline:'Live Streamlit app — clinical-grade variant pipeline',
      desc:'A clinical-grade variant analysis application built by Simon Mufara and embedded inside OmicsLab. Upload VCF files, annotate with ClinVar/gnomAD, apply ACMG filters, and export clinical reports.',
      why:'Production variant analysis in the browser — the same workflow used in clinical genetics laboratories.',
      how:'Tools → Variant Analysis Suite (or in nav bar)',
      tags:['Variants','Advanced','Live App'],
    },
  ];

  /* ── State ── */
  let _activeCat = 'all';
  let _searchQ   = '';

  /* ── Filter modules ── */
  function _filtered() {
    const q = _searchQ.trim().toLowerCase();
    return MODULES.filter(m => {
      if (_activeCat !== 'all' && m.cat !== _activeCat) return false;
      if (!q) return true;
      return (
        m.name.toLowerCase().includes(q) ||
        m.desc.toLowerCase().includes(q) ||
        m.tagline.toLowerCase().includes(q) ||
        (m.tags || []).some(t => t.toLowerCase().includes(q))
      );
    });
  }

  /* ── Render a single module card ── */
  function _cardHtml(m) {
    const icon = OmicsLab.Icons?.svg(
      ({ flask:'flask', layers:'layers', dna:'dna', activity:'activity', 'git-branch':'git-branch',
         globe:'globe', 'file-text':'file-text', award:'award', cpu:'cpu', brain:'brain',
         bar:'bar-chart', scissors:'scissors', shield:'shield', 'bar-chart':'bar-chart',
      })[m.id] || 'layers', 16
    ) || '';
    const tags = (m.tags || []).map(t =>
      `<span class="ug-tag">${t}</span>`
    ).join('');

    return `
      <div class="ug-card" data-cat="${m.cat}">
        <div class="ug-card-top" style="--mc:${m.color}">
          <div class="ug-card-icon">${icon}</div>
          <div class="ug-card-meta">
            <div class="ug-card-name">${m.name}</div>
            <div class="ug-card-tagline">${m.tagline}</div>
          </div>
        </div>
        <p class="ug-card-desc">${m.desc}</p>
        <div class="ug-card-why">
          <span class="ug-why-label">Why it matters</span>
          <span class="ug-why-text">${m.why}</span>
        </div>
        <div class="ug-card-footer">
          <div class="ug-tags">${tags}</div>
          <button class="ug-open-btn" onclick="OmicsLab.Router.navigate('${m.page}')">
            Open
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
        <div class="ug-card-how">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>
          ${m.how}
        </div>
      </div>`;
  }

  /* ── Re-render the card grid ── */
  function _refreshGrid(el) {
    const grid = el.querySelector('#ug-grid');
    if (!grid) return;
    const results = _filtered();
    if (results.length === 0) {
      grid.innerHTML = `<div class="ug-empty">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#484f58" stroke-width="1.5">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <p>No modules match "<strong>${_searchQ}</strong>"</p>
        <button class="ug-clear-btn" onclick="OmicsLab.UserGuide.clearSearch()">Clear search</button>
      </div>`;
    } else {
      grid.innerHTML = results.map(_cardHtml).join('');
    }
    /* Update count */
    const count = el.querySelector('#ug-count');
    if (count) count.textContent = `${results.length} tool${results.length !== 1 ? 's' : ''}`;
  }

  /* ── Handle search input ── */
  function onSearch(val) {
    _searchQ = val;
    const el = document.getElementById('guide-section');
    if (el) _refreshGrid(el);
  }

  /* ── Handle category click ── */
  function onCat(id) {
    _activeCat = id;
    const el = document.getElementById('guide-section');
    if (!el) return;
    el.querySelectorAll('.ug-cat-btn').forEach(b => {
      b.classList.toggle('ug-cat-active', b.dataset.cat === id);
    });
    _refreshGrid(el);
  }

  /* ── Clear search ── */
  function clearSearch() {
    _searchQ = '';
    const el = document.getElementById('guide-section');
    if (!el) return;
    const inp = el.querySelector('#ug-search');
    if (inp) inp.value = '';
    _refreshGrid(el);
  }

  /* ── Full render ── */
  function init() {
    const el = document.getElementById('guide-section');
    if (!el || el.dataset.ugReady) return;
    el.dataset.ugReady = '1';

    const catBtns = CATS.map(c =>
      `<button class="ug-cat-btn${c.id === _activeCat ? ' ug-cat-active' : ''}" data-cat="${c.id}"
         onclick="OmicsLab.UserGuide.onCat('${c.id}')">${c.label}</button>`
    ).join('');

    el.innerHTML = `
      <div class="ug-page">
        <div class="ug-header">
          <div class="ug-header-inner">
            <div class="ug-eyebrow">User Guide & Manual</div>
            <h1 class="ug-title">Everything in OmicsLab — how to use it and why it matters</h1>
            <p class="ug-subtitle">
              ${MODULES.length} tools across 10 categories, with descriptions, purpose notes, and one-click navigation.
              A complete reference for students, researchers, and instructors.
            </p>
            <div class="ug-search-wrap">
              <svg class="ug-search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <input id="ug-search" class="ug-search-input" type="search"
                     placeholder="Search tools, topics, methods…"
                     oninput="OmicsLab.UserGuide.onSearch(this.value)" autocomplete="off"/>
            </div>
          </div>
        </div>

        <div class="ug-body">
          <div class="ug-sidebar">
            <div class="ug-cats">${catBtns}</div>
          </div>
          <div class="ug-main">
            <div class="ug-toolbar">
              <span id="ug-count" class="ug-count">${MODULES.length} tools</span>
            </div>
            <div id="ug-grid" class="ug-grid">
              ${MODULES.map(_cardHtml).join('')}
            </div>
          </div>
        </div>
      </div>`;
  }

  return { init, onSearch, onCat, clearSearch };
})();
