# OmicsLab Simulator

**A grant-ready interactive training platform for omics science — built specifically for African researchers, students, and institutions.**

Zero install. Zero server. Works offline. Open `index.html` in any browser.

🌐 **Live:** https://simon-mufara.github.io/Omics-Lab/

---

## What OmicsLab Is

OmicsLab is an open-source, browser-based omics training platform that lets students and researchers simulate real laboratory workflows, follow structured learning paths, explore African genomics data governance, and generate reproducible research metadata — all without installing anything.

Built for low-bandwidth environments. Works offline as a PWA. Designed for Africa.

---

## Workflows (14 across 8 domains)

| Domain | Workflows | Steps |
|---|---|---|
| Genomics | WGS, WES, Ion AmpliSeq Targeted Panel | 7 + 4 + 5 |
| Transcriptomics | Bulk RNA-seq, scRNA-seq (10x), RT-qPCR | 7 + 7 + 7 |
| Epigenomics | ATAC-seq, ChIP-seq | 6 + 5 |
| Metagenomics | Shotgun, 16S rRNA Amplicon | 5 + 4 |
| Metabolomics | LC-MS Untargeted | 5 |
| Proteomics | Shotgun LC-MS/MS | 5 |
| Virology | Viral WGS / SARS-CoV-2 ARTIC | 5 |
| Multi-omics | CITE-seq (RNA + Protein) | 4 |

---

## Full Feature Set

### 🔬 Core Lab Simulation
- **14 interactive workflow simulations** — drag reagents, set parameters, watch QC scores update in real time
- **Sabotage Mode** — hidden error injected into workflow; student must find and fix it
- **Pipeline Sandbox** — drag-and-drop bioinformatics pipeline builder
- **Workflow Comparison** — side-by-side comparison of any two workflows
- **Quiz Mode** — per-workflow knowledge checks
- **Cost Calculator** — per-step cost estimation for African lab contexts
- **Troubleshoot Tree** — decision tree for common wet-lab failures
- **Variant Walkthrough** — step-by-step genomic variant interpretation

### 📖 Learn (dropdown navigation group)
- **Disease Explorer** — 40+ diseases with molecular biology, biomarkers, and African context
- **Disease Learning Layer** — structured disease deep-dives with learning journeys
- **Equipment Gallery** — 20+ real instruments with photos, specs, and cost estimates
- **Tool Explorer** — 50+ bioinformatics tools with use cases and input/output descriptions
- **Bioinformatics Pipeline Guide** — complete WGS pipeline from FASTQ to variant annotation with dry-run scripts
- **HPC Training Layer** — SLURM job builder, queue simulator, memory error scenarios, Snakemake/Nextflow/WDL comparison, Singularity containers
- **Data Repositories** — major omics archives with African relevance notes

### 🎓 Curriculum Learning Paths
Three structured tracks with per-lesson progress tracking:
- **Wet-Lab Scientist** (5 lessons): Sample collection → extraction → library prep → sequencing platforms → QC metrics
- **Bioinformatician** (5 lessons): Linux/HPC → QC → alignment → variant calling → workflow engines
- **Public Health Researcher** (5 lessons): Genomic epidemiology → surveillance → data governance → communication → publishing

Track completion triggers badge unlock. All progress stored in localStorage.

### 🏆 Badges & Certificates
17 achievements across 5 categories (Curriculum, Lab, Research, Knowledge, Workshop). Click any earned badge to generate a printable PDF certificate with your name, the badge, and consortium attribution (H3Africa · H3ABioNet · Africa CDC).

### 🌍 Africa Science Hub
- **Data Governance** — H3Africa CONTEST principles, AU Data Policy Framework, Nagoya Protocol, GDPR applicability
- **Population Genomics** — African diversity statistics, H3Africa / AWI-Gen / APCDR / MalariaGEN / H3ABioNet consortium profiles
- **One Health** — Human/animal/environmental health interface, zoonotic surveillance platforms
- **Impact & Grant Alignment** — NIH Fogarty, Wellcome Trust, Gates Foundation, H3Africa, Africa CDC, EU Horizon grant relevance statements
- **Training Opportunities** — H3ABioNet, EMBL-EBI, Africa CDC Genomics Academy, WACCBIP, KEMRI, AIBST

### 🔁 Research Metadata & Reproducibility Hub
- Submit studies with full metadata (experimental, sample, sequencing, bioinformatics, FAIR)
- Auto-scoring: Reproducibility, Completeness, and FAIR scores computed on the fly
- Browse, fork, validate, and reproduce community submissions
- 3 seed African genomics studies (KEMRI malaria WGS, NHLS TB nanopore, WACCBIP COVID-19 RNA-seq)
- Export submissions as JSON

### 🏫 Workshop & Instructor Mode
- Create session with shareable 6-character code
- Students join with code + name
- Cohort progress dashboard — per-student module completion
- Export CSV attendance report for grant reporting

### 🗺️ Africa Genomics Lab Map
Interactive SVG map of 20+ active genomics laboratories, H3Africa hubs, and surveillance centres across Africa.

### 💬 Ask OmicsLab (Q&A)
Rule-based Q&A engine covering diseases, workflows, sequencing platforms, and African genomics.

### 🔬 Research Project Mode
Design a simulated omics study: select disease + workflow + partner lab + sample count, generate reproducibility score, run simulation, export project JSON.

### 🌐 EN / FR Language Toggle
Full English ↔ French translation of nav, hero, all section headers/descriptions, and key UI text.

---

## Technical Stack

| | |
|---|---|
| **Runtime** | Pure HTML/CSS/JS — zero build step, zero npm |
| **Deployment** | GitHub Pages (free, zero cost) |
| **PWA** | Service Worker with network-first caching + offline fallback |
| **Storage** | localStorage only — no backend, no user accounts |
| **Fonts** | Inter (UI) + JetBrains Mono (code) via Google Fonts |
| **Icons** | Inline SVG sprite (no CDN dependency) |
| **i18n** | EN/FR toggle with 200+ translated strings |

---

## Grant Relevance

OmicsLab directly addresses the training gap described in H3Africa, NIH Fogarty, Wellcome Trust, Gates Foundation, and Africa CDC grant mandates:

> Sub-Saharan Africa has fewer than 1 bioinformatician per 1,000,000 people. A single H3Africa study can generate terabytes of data that nobody in-country can analyse.

OmicsLab closes this gap at zero cost, zero infrastructure, with offline-first delivery suitable for low-bandwidth African environments.

---

## File Structure

```
index.html          — Main app shell
css/
  app.css           — Full design system (3500+ lines)
  disease-learning.css
  equipment.css
  research-mode.css
js/
  app.js            — Main controller, landing page builder
  workflows.js      — 14 workflow definitions
  diseases.js       — 40+ disease profiles
  engine.js         — Simulation engine
  bench.js          — Lab bench UI
  africa-map.js     — Africa genomics map
  curriculum.js     — Learning paths + progress
  badges.js         — Achievement + certificate system
  africa-hub.js     — Africa Science Hub content
  workshop.js       — Instructor/cohort mode
  repro-hub.js      — Reproducibility Hub
  hpc-training.js   — HPC/SLURM training layer
  research-mode.js  — Research project mode
  i18n.js           — EN/FR language toggle
  compare.js        — Workflow comparison modal
  quiz.js           — Quiz mode
  sandbox.js        — Pipeline sandbox
  troubleshoot.js   — Troubleshoot tree
  disease-learning.js
  equipment.js
  gallery.js
  icons.js
  qa.js
examples/
  bioinformatics/   — WGS dry-run script + Snakefile
sw.js               — Service Worker (offline PWA)
manifest.json       — PWA manifest
```

---

## Contributing

OmicsLab is open source. Contributions welcome — especially:
- New disease profiles (add to `js/diseases.js`)
- New workflows (add to `js/workflows.js`)
- French/Swahili/Portuguese translations (extend `js/i18n.js`)
- New African lab centres (add to `js/africa-map.js`)

---

*Built for African omics researchers, by Simon Mufara. Powered by H3Africa principles.*
