# OmicsLab Simulator

**A professional interactive training platform for wet-lab to bioinformatics workflows.**

Open `index.html` in any modern browser. No npm, no build step, no internet required.

---

## Domains & Workflows

| Domain | Workflows | Steps |
|---|---|---|
| Genomics | WGS, WES | 7 + 4 |
| Transcriptomics | Bulk RNA-seq, scRNA-seq (10x) | 7 + 7 |
| Epigenomics | ATAC-seq, ChIP-seq | 6 + 5 |
| Metagenomics | Shotgun, 16S rRNA Amplicon | 5 + 4 |
| Metabolomics | LC-MS Untargeted | 5 |
| Proteomics | Shotgun LC-MS/MS | 5 |
| Virology | Viral WGS / SARS-CoV-2 ARTIC | 5 |
| Multi-omics | CITE-seq (RNA + Protein) | 4 |

**Total: 12 workflows · 64 protocol steps · 59 reagents**

---

## Features

- **True drag-and-drop** — HTML5 Drag API with full touch support
- **Live QC dashboard** — 8 metrics update after every decision
- **Error propagation** — early mistakes amplify downstream (up to 2.5×)
- **Educational tooltips** — expert explanations at every step
- **Graded results** — A–D grade, pipeline cascade, PASS/FAIL QC table
- **Zero dependencies** — pure HTML/CSS/JS, works offline

---

## File Structure

```
omicslab-simulator/
├── index.html          ← App shell (3 screens)
├── css/
│   └── app.css         ← All styles (dark lab aesthetic, glassmorphism)
└── js/
    ├── workflows.js    ← All workflow & step definitions
    ├── engine.js       ← Quality engine + error propagation
    ├── bench.js        ← Bench renderer + drag-drop system
    └── app.js          ← App controller + landing + results
```

---

## Deploy to GitHub Pages

```bash
git remote add origin https://github.com/YOUR_USERNAME/omicslab-simulator.git
git push -u origin master
```

Then enable GitHub Pages from the `master` branch root in Settings → Pages.

---

## Built By

Simon Mufara — Computational Biologist & Bioinformatician
MSc Computational Health Informatics, University of Cape Town
simon.mufara1@gmail.com
