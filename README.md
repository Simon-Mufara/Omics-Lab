# OmicsLab

An open-source, offline-first training platform for genomics and omics science, built for African researchers, students, and institutions.

No installation. No server. No cost. Open `index.html` in any browser.

Live: <https://simon-mufara.github.io/Omics-Lab/>

---

## Overview

OmicsLab is a browser-based simulation and training environment covering the complete omics research lifecycle — from wet-lab sample preparation through bioinformatics analysis, clinical interpretation, and research publication. It is designed around the realities of African genomics: low-bandwidth environments, intermittent power, limited HPC access, and the specific diseases and populations that African scientists study.

The platform runs as a Progressive Web Application (PWA) and caches all assets for offline use after the first load. No data leaves the browser. All state is stored in `localStorage`.

---

## Intended Users

- Graduate students and postdocs beginning omics research
- Wet-lab scientists learning bioinformatics workflows
- Bioinformaticians learning experimental design and QC
- Public health researchers integrating genomics into surveillance
- Workshop instructors running cohort training sessions
- Principal investigators building training programmes for their labs

---

## Core Lab Simulation

The simulation engine drives 14 interactive workflow scenarios. Each workflow presents a sequence of steps where the student sets parameters, mixes reagents, and receives immediate feedback. QC scores, yield estimates, and pass/fail criteria update in real time.

### Genomics

- Whole-Genome Sequencing (WGS) — 7 steps
- Whole-Exome Sequencing (WES) — 4 steps
- Ion AmpliSeq Targeted Panel — 5 steps

### Transcriptomics

- Bulk RNA-seq — 7 steps
- Single-Cell RNA-seq (10x Chromium) — 7 steps
- RT-qPCR — 7 steps

### Epigenomics

- ATAC-seq (chromatin accessibility) — 6 steps
- ChIP-seq (histone modification) — 5 steps

### Metagenomics

- Shotgun metagenomics — 5 steps
- 16S rRNA amplicon sequencing — 4 steps

### Other Domains

- Metabolomics: LC-MS untargeted — 5 steps
- Proteomics: Shotgun LC-MS/MS — 5 steps
- Virology: SARS-CoV-2 ARTIC protocol — 5 steps
- Multi-omics: CITE-seq (RNA + protein) — 4 steps

Each workflow includes parameter-setting UI, sabotage mode (hidden error to diagnose), cost calculator (reagent costs in ZAR/USD), troubleshoot decision tree, quiz mode, and side-by-side workflow comparison.

---

## Analysis Tools

| Module | Route | Description |
| --- | --- | --- |
| Pipeline Terminal | `/terminal` | Simulated Linux terminal with WGS and RNA-seq pipeline scripts |
| Variant Interpretation | `/variantinterp` | ACMG/AMP variant classification with African population context |
| Quality Predictor | `/qualitypredictor` | FastQC-style per-base quality score simulator |
| Primer Design | `/primerdesign` | PCR primer design with Tm calculator and specificity check |
| Phylogenomics | `/phylo` | Maximum-likelihood tree construction and visualisation |
| Nanopore Tools | `/nanopore` | ARTIC pipeline, basecalling parameters, MinION run metrics |
| Pipeline Debugger | `/debugger` | Identify and fix common bioinformatics pipeline failures |
| Heatmap | `/heatmap` | Interactive gene expression heatmap with clustering |
| Genome Browser | `/genome-browser` | IGV-style read alignment viewer |
| Population Structure | `/popstruct` | PCA and ADMIXTURE visualisation for African 1000G populations |
| AMR Analysis | `/amr` | Antimicrobial resistance gene detection and resistance profiling |
| Metagenomics (Kraken) | `/kraken` | Taxonomic classification and microbial diversity analysis |
| Codon Tools | `/codon` | Codon usage table, optimisation, and translation |
| GWAS Suite | `/gwas` | Manhattan plot, QQ plot, PCA, 20 African GWAS loci, PLINK2 pipeline |
| Pharmacogenomics | `/pharmacogenomics` | CYP2B6/2D6/3A5, NAT2, G6PD — allele frequencies in African populations |
| RNA Expression Atlas | `/rna-atlas` | DESeq2-style results for malaria, TB, COVID-19 — volcano plots and heatmaps |
| Variant Atlas | `/variant-atlas` | Population-stratified variant frequency browser with African cohort data |
| Clinical Decision | `/clinical-decision` | ACMG variant interpretation decision support |
| One Health | `/one-health` | Human-animal-environment interface for zoonotic surveillance |
| Virtual Lab | `/virtual-lab` | 360-degree tour of a genomics lab with real instrument illustrations |
| BioNLP | `/bionlp` | Named entity recognition in biomedical text |
| Knowledge Graph | `/knowledge-graph` | Gene-disease-pathway network visualisation |

---

## Database Browsers

| Module | Route | Description |
| --- | --- | --- |
| Gene Lookup | `/gene-lookup` | NCBI Gene and Ensembl annotations |
| Protein Viewer | `/protein` | 3D structure from AlphaFold/PDB |
| UniProt | `/uniprot` | Protein function, GO terms, disease associations |
| Drug Targets | `/targets` | Open Targets therapeutic target associations |
| STRING Network | `/string` | Protein-protein interaction networks |
| Pathways | `/pathways` | KEGG and Reactome pathway enrichment |
| SRA Browser | `/sra` | NCBI SRA dataset search with African cohort filters |
| PubMed | `/pubmed` | Literature search with African genomics relevance scoring |
| Preprints | `/preprints` | bioRxiv/medRxiv African genomics preprint feed |

---

## Learning and Curriculum

**Structured Learning Paths** (`/learn`)

Three tracks with per-lesson progress bars, competency checkpoints, and completion badges:

- Wet-Lab Scientist — sample collection, extraction, library prep, sequencing platforms, QC
- Bioinformatician — Linux/HPC, read QC, alignment, variant calling, workflow management
- Public Health Researcher — genomic epidemiology, surveillance, data governance, publication

**Skill Tree** (`/skill-tree`) — visual competency map across six omics disciplines. Unlock nodes by completing modules. Tracks progression from novice to advanced researcher.

**Career Pathways** (`/career`) — role profiles for 12 genomics careers in African institutions, with required skills, salary ranges, hiring institutions, and typical grant involvement.

**Glossary** (`/glossary`) — 200+ terms with plain-language definitions and cross-links to relevant modules.

**HPC Training** (`/hpc-training`) — SLURM job scripts, memory error scenarios, Nextflow/Snakemake/WDL comparison, Singularity containers, PBS/Torque compatibility.

---

## Gamification

- **Leaderboard** (`/leaderboard`) — Points earned for completing workflows, quizzes, and modules. Filterable by country and institution.
- **Quiz Battle** (`/quizbattle`) — Head-to-head knowledge challenges on genomics topics.
- **Badges and Certificates** (`/certification`) — 17 achievements across five categories. Earned badges generate printable PDF certificates.
- **Hackathon Hub** (`/hackathon`) — Time-boxed challenges: variant calling accuracy, pipeline optimisation, de novo assembly.

---

## Research and Collaboration Tools

| Module | Route | Description |
| --- | --- | --- |
| Lab Notebook | `/labnotebook` | Structured experiment logging with JSON/CSV export |
| Collaboration | `/collab` | Project sharing, task assignment, version comments |
| Protocols | `/protocols` | Community protocol library with step-by-step editing |
| Peer Review | `/peerreview` | Structured manuscript review rubrics for genomics papers |
| Grant Writing | `/grant` | Templates for H3Africa, Wellcome, NIH Fogarty, Gates Foundation |
| Citations | `/citations` | Reference manager with African genomics journal style guides |
| Output Tracker | `/output-tracker` | Publications, datasets, talks, and training outputs dashboard |
| Thesis Coach | `/thesis` | Chapter guidance for omics MSc/PhD theses |
| Meta-analysis | `/metaanalysis` | Fixed and random-effects meta-analysis with forest plot |
| Pipeline Generator | `/pipeline-gen` | Generate Snakemake or Nextflow pipeline skeletons |
| Reproducibility Hub | `/research` | Submit study metadata; receive FAIR and reproducibility scores |

---

## African Genomics Content

**African Genomics Network** (`/network-hub`) — Profiles of 18 major institutions: H3Africa, SANBI, KEMRI, WACCBIP, AHRI, IHVN, AWI-Gen, Institut Pasteur Dakar, Africa CDC PGI, H3ABioNet, and others. Filterable by region and research focus.

**H3Africa Hub** (`/h3africa`) — H3Africa Consortium overview, biorepository network, ethical review frameworks, consortium data access policies, and active studies.

**Africa Science Hub** (`/africa`) — Data governance (AU framework, Nagoya Protocol, GDPR applicability), population genomics diversity statistics, One Health platform, grant impact statements.

**Pathogen Tracker** (`/pathogen-tracker`) — Outbreak surveillance, genomic epidemiology of SARS-CoV-2, monkeypox, cholera, and meningitis across African regions.

**Disease Explorer** — 40+ disease profiles with molecular biology, African epidemiology, relevant omics approaches, and key publications.

---

## Community

| Module | Route | Description |
| --- | --- | --- |
| Nexus | `/nexus` | Social feed: share results, questions, and resources |
| Teams | `/teams` | Create or join research groups with a shared workspace |
| Paper Hub | `/paperhub` | African genomics preprint and publication tracker |
| Journal Club | `/journalclub` | Structured paper discussions with guided questions |
| Mentorship | `/mentorship` | Mentor-mentee matching for African genomics researchers |
| Researcher Directory | `/directory` | Searchable database of researchers and institutions |

---

## Platform Features

- **Authentication** — Email-based registration stored locally; no external identity provider required.
- **Dashboard** (`/dashboard`) — Personalised progress summary, recent activity, recommended modules.
- **Settings** (`/settings`) — Theme (dark/light/high-contrast), language, notifications, Claude API key.
- **AI Assistant** — Claude API integration for genomics Q&A. Key stored only in `localStorage`; sent directly to Anthropic, never to OmicsLab servers. User supplies their own key.
- **Internationalisation** — English, French, Swahili, Hausa, Amharic, Arabic, Portuguese, Zulu, Xhosa, Afrikaans, and nine additional African languages. 200+ translated strings.
- **Offline-first PWA** — Service Worker caches all JS, CSS, and HTML after first load. Full functionality without internet.
- **Accessibility** — ARIA labels, keyboard navigation, focus trapping on modals, high-contrast theme, screen-reader announcements.

---

## Technical Architecture

```text
index.html          Main application shell (single HTML file, SPA)
sw.js               Service Worker — stale-while-revalidate caching strategy
manifest.json       PWA manifest
sitemap.xml         All routes listed for search indexing

css/
  app.css           Global design system (CSS custom properties, layout, components)
  [module].css      One stylesheet per major module

js/
  app.js            Application bootstrap
  router.js         Hash-based SPA router (PAGES object, _dispatch function)
  engine.js         Workflow simulation engine
  workflows.js      14 workflow definitions
  diseases.js       40+ disease profiles
  i18n.js           Internationalisation (200+ strings, 18 languages)
  error.js          Global error boundary
  [module].js       One IIFE per feature, registers on window.OmicsLab

js/parsers/         Client-side FASTQ, VCF, and expression matrix parsers
js/locales/         Translation files (en, fr, sw, ha, am, ar, pt, zu, xh, af, ...)
```

**Namespace:** All modules are IIFEs that register on `window.OmicsLab`.

**Routing:** Hash-based (`#/route`). The `PAGES` object in `router.js` maps routes to section IDs and init functions. No server-side routing required.

**State:** All user state lives in `localStorage`. No cookies. No server calls except the optional Claude API.

---

## Getting Started

```bash
git clone https://github.com/Simon-Mufara/Omics-Lab.git
cd Omics-Lab
python -m http.server 3000
# Open http://localhost:3000
```

Any static file server works. The app requires no build step, no Node.js, and no package manager.

**Deploy to GitHub Pages:** Fork the repository, enable GitHub Pages on the `main` branch root, and the live URL is ready within minutes.

**Deploy to any static host:** Upload the repository root to Netlify, Vercel, Cloudflare Pages, or any S3-compatible bucket. No server-side configuration needed.

---

## Requirements for Full Operation

| Feature | Requirement |
| --- | --- |
| Core simulation, all analysis tools | None — works immediately offline |
| AI assistant | Anthropic API key (free tier available). Enter in Settings. |
| PDF certificate generation | Browser print-to-PDF. No server required. |
| PWA install prompt | HTTPS deployment |
| Push notifications | HTTPS deployment and browser support |

---

## Extending OmicsLab

### Adding a module

1. Create `js/mymodule.js` as an IIFE exposing `{ init }` on `window.OmicsLab.MyModule`.
2. Create `css/mymodule.css`.
3. Add `<div id="mymodule-section">` in `index.html`.
4. Register the route in `js/router.js` under `PAGES` and `PAGE_TO_GROUP`.
5. Add the init dispatch in `_dispatch()`.
6. Add `<script>` and `<link>` tags to `index.html`.
7. Bump `STATIC_CACHE` version in `sw.js`.

### Adding a workflow

Add an entry to the `WORKFLOWS` array in `js/workflows.js`. Each entry requires: `id`, `name`, `domain`, `steps[]` (each with `name`, `desc`, `params[]`, `checks[]`), `cost`, `duration`, and `quiz[]`.

### Adding a disease profile

Add an entry to `DISEASES` in `js/diseases.js`. Fields: `id`, `name`, `icd10`, `domain`, `molecular`, `biomarkers[]`, `african_context`, `workflows[]`, `references[]`.

### Adding a language

Create `js/locales/xx.js` (ISO 639-1 code). Follow the structure in `js/locales/en.js`. Register the language in `js/i18n.js`.

---

## Grant and Research Relevance

OmicsLab addresses the training capacity gap identified in:

- H3Africa (Human Heredity and Health in Africa) — consortium-wide need for in-country bioinformatics training
- NIH Fogarty International Center D43 — requirement for sustainable, scalable training infrastructure
- Wellcome Trust African Programmes — capacity development as a core deliverable
- Gates Foundation — open, accessible tools for low-resource settings
- Africa CDC Genomics Initiative — national genomics workforce development
- WHO/AFRO — pathogen genomic surveillance capacity

Sub-Saharan Africa has fewer than one bioinformatician per million people. A single H3Africa sequencing study generates terabytes of data that few researchers in-country are trained to analyse. OmicsLab provides structured, contextualised, offline-capable training at zero marginal cost per learner.

The platform is independently developed and is not formally affiliated with H3Africa, H3ABioNet, Africa CDC, or any partner organisation. It is built in admiration of and inspired by their work.

---

## Contributing

Contributions are welcome. Priority areas:

- New disease profiles (`js/diseases.js`)
- New workflows (`js/workflows.js`)
- Language translations (`js/locales/`)
- African institution profiles (`js/network-hub.js`)
- Data accuracy issues in existing modules

Please open an issue before submitting a large pull request.

---

## License

MIT License. See `LICENSE` file.

---

Built by Simon Mufara. Inspired by the H3Africa mission to build lasting genomics capacity across Africa.
