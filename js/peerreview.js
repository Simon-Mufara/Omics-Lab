/* ═══════════════════════════════════════════════════════════════
   OmicsLab — Peer Review Simulator (Prompt 14)
   3 virtual reviewers give rubric-based critiques on research
   abstracts/methods sections. Offline, no API.
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.PeerReview = (function () {

  /* ─── Reviewer personas ─── */
  const REVIEWERS = [
    {
      id: 'statistician',
      name: 'Dr. Yewande Adeyemi',
      title: 'Biostatistician & Epidemiologist',
      institution: 'IHVN, Abuja',
      avatar: 'YA',
      flag: '🇳🇬',
      focus: 'Statistical rigour · sample size · confounding · effect size reporting',
      color: '#58a6ff',
      personality: 'Meticulous and data-driven. Expects power calculations, confidence intervals, and pre-registration of analyses. Will reject papers with p-hacking or underpowered studies.',
    },
    {
      id: 'methods',
      name: 'Prof. Kagiso Motsepe',
      title: 'Genomics Methods Specialist',
      institution: 'KRISP, Durban',
      avatar: 'KM',
      flag: '🇿🇦',
      focus: 'Wet-lab reproducibility · QC thresholds · bioinformatics pipeline documentation',
      color: '#00C4A0',
      personality: 'Practical and protocol-obsessed. Demands exact reagent lots, software versions, and parameter settings. Reviewer #2 energy — thorough but fair.',
    },
    {
      id: 'context',
      name: 'Dr. Amira Hassan',
      title: 'African Genomics & Ethics Specialist',
      institution: 'ACEGID, Ede',
      avatar: 'AH',
      flag: '🇬🇭',
      focus: 'Africa-specific context · ethics · FAIR data · community benefit',
      color: '#bc8cff',
      personality: 'Big-picture thinker focused on equity, open science, and whether the research actually serves African communities. Checks for parachute science and data sovereignty issues.',
    },
  ];

  /* ─── Rubric categories ─── */
  const RUBRIC = [
    { id: 'hypothesis', label: 'Hypothesis & Aims', weight: 15 },
    { id: 'methods',    label: 'Methods & Reproducibility', weight: 25 },
    { id: 'stats',      label: 'Statistical Design', weight: 20 },
    { id: 'ethics',     label: 'Ethics & Data Governance', weight: 15 },
    { id: 'novelty',    label: 'Novelty & Significance', weight: 15 },
    { id: 'writing',    label: 'Clarity & Writing Quality', weight: 10 },
  ];

  /* ─── Pattern-based scoring rules ─── */
  /* Each rule: { pattern, category, score (±), comment, reviewer } */
  /* reviewer: 'statistician' | 'methods' | 'context' | 'all' */
  const RULES = [
    /* ── Sample size / power ── */
    { pattern: /\b(power\s+calc|power\s+analysis|sample\s+size\s+calc|80%\s+power|90%\s+power)/i, category: 'stats', score: +8, reviewer: 'statistician', comment: 'Power calculation reported — strong statistical design.' },
    { pattern: /\bn\s*=\s*\d{3,}/i, category: 'stats', score: +4, reviewer: 'statistician', comment: 'Adequate sample size (n ≥ 100). Confirm power analysis was conducted prospectively.' },
    { pattern: /\bn\s*=\s*[1-9]\d?[^0-9]/i, category: 'stats', score: -8, reviewer: 'statistician', comment: 'Very small sample size (n < 100). Results may be underpowered. Provide a post-hoc power calculation.' },
    { pattern: /\bp\s*[<=>]\s*0\.0[0-9]+/i, category: 'stats', score: +3, reviewer: 'statistician', comment: 'P-values reported with exact values — good statistical transparency.' },
    { pattern: /\b(p\s*<\s*0\.05\b(?!\s*(was|were|is|are)\s+considered))/i, category: 'stats', score: -3, reviewer: 'statistician', comment: 'Sole reliance on p < 0.05 threshold without effect sizes is insufficient. Report confidence intervals and effect sizes (Cohen\'s d, OR, HR).' },
    { pattern: /\b(confidence\s+interval|95%\s+CI|\bCI\b)/i, category: 'stats', score: +5, reviewer: 'statistician', comment: 'Confidence intervals reported — good precision estimate.' },
    { pattern: /\b(bonferroni|FDR|false\s+discovery|multiple\s+test|correction)/i, category: 'stats', score: +5, reviewer: 'statistician', comment: 'Multiple testing correction applied — rigorous.' },
    { pattern: /\b(adjust(ed|ment)\s+for\s+(age|sex|bmi|covariate|confounder)|multivariable|multivariate)/i, category: 'stats', score: +4, reviewer: 'statistician', comment: 'Adjustment for confounders noted — important for causal inference.' },
    { pattern: /\b(pre.?register|pre.?registered|clinicaltrials\.gov|PROSPERO|OSF\.io)/i, category: 'stats', score: +6, reviewer: 'statistician', comment: 'Pre-registration noted — eliminates risk of outcome-switching bias.' },

    /* ── Methods / reproducibility ── */
    { pattern: /\b(github|gitlab|zenodo|figshare|code\s+available|data\s+available|OSF)/i, category: 'methods', score: +8, reviewer: 'methods', comment: 'Code/data availability statement present — supports reproducibility.' },
    { pattern: /\b(snakemake|nextflow|cromwell|wdl|cwl|workflow\s+manager)/i, category: 'methods', score: +6, reviewer: 'methods', comment: 'Workflow manager used — excellent for reproducibility and portability.' },
    { pattern: /\b(docker|singularity|conda|bioconda|container)/i, category: 'methods', score: +5, reviewer: 'methods', comment: 'Containerised environment described — reproducibility supported.' },
    { pattern: /\b(version\s+\d|\bv\d+\.\d+|release\s+\d|commit\s+[a-f0-9]{7})/i, category: 'methods', score: +4, reviewer: 'methods', comment: 'Software version numbers reported — essential for reproducibility.' },
    { pattern: /\b(fastp|trimmomatic|trim\s+galore|adapter\s+trimm)/i, category: 'methods', score: +3, reviewer: 'methods', comment: 'Read trimming step described.' },
    { pattern: /\b(fastqc|multiqc|qualimap|rseqc)/i, category: 'methods', score: +3, reviewer: 'methods', comment: 'QC tool named — verify threshold values are specified.' },
    { pattern: /\b(BWA|STAR|bowtie2|hisat2|minimap2)\s*[-_]?(mem|2)?/i, category: 'methods', score: +2, reviewer: 'methods', comment: 'Aligner specified.' },
    { pattern: /\b(GATK|haplotypecaller|freebayes|deepvariant|bcftools\s+call)/i, category: 'methods', score: +2, reviewer: 'methods', comment: 'Variant caller specified.' },
    { pattern: /\b(deseq2|edgeR|limma|voom|sleuth)/i, category: 'methods', score: +2, reviewer: 'methods', comment: 'Differential expression method specified.' },
    { pattern: /\b(kraken2|metaphlan|bracken|kaiju|centrifuge)/i, category: 'methods', score: +2, reviewer: 'methods', comment: 'Taxonomic profiler specified.' },
    { pattern: /\b(reference\s+genome|hg38|grch38|hg19|mm10|GCF_|GCA_)/i, category: 'methods', score: +3, reviewer: 'methods', comment: 'Reference genome version specified.' },
    { pattern: /\b(NCBI\s+SRA|EBI\s+ENA|GISAID|ArrayExpress|accession\s+number|BioProject|PRJNA|PRJEB)/i, category: 'methods', score: +7, reviewer: 'methods', comment: 'Raw data deposited in public repository — excellent for FAIRness.' },
    { pattern: /\b(cell\s+line|passage\s+number|mycoplasma|authentication)/i, category: 'methods', score: +3, reviewer: 'methods', comment: 'Cell line authentication noted — important for reproducibility.' },

    /* ── Ethics & governance ── */
    { pattern: /\b(IRB|ethics\s+committee|ethical\s+approval|ethical\s+clearance|Helsinki|REC\s+number)/i, category: 'ethics', score: +8, reviewer: 'context', comment: 'Ethics committee approval stated — required for human subject research.' },
    { pattern: /\b(informed\s+consent|written\s+consent|consent\s+form)/i, category: 'ethics', score: +5, reviewer: 'context', comment: 'Informed consent process described.' },
    { pattern: /\b(community\s+(engagement|advisory|liaison)|stakeholder|CBPR|community.based)/i, category: 'ethics', score: +6, reviewer: 'context', comment: 'Community engagement process described — critical for African research contexts.' },
    { pattern: /\b(data\s+sharing|open\s+access|open\s+data|FAIR\b|data\s+governance)/i, category: 'ethics', score: +5, reviewer: 'context', comment: 'Data sharing and governance addressed.' },
    { pattern: /\b(H3Africa|AWI.?Gen|AfricaArray|SANHAC|MalariaGEN|H3.?Africa)/i, category: 'context', score: +6, reviewer: 'context', comment: 'Alignment with major African genomics consortia noted — increases scientific impact.' },
    { pattern: /\b(parachute\s+science|extractive|benefit.?shar|local\s+capacity|technology\s+transfer)/i, category: 'ethics', score: +5, reviewer: 'context', comment: 'Addresses community benefit and capacity building — exemplary for African-context research.' },
    { pattern: /\b(ancestry|African\s+population|population\s+stratification|Bantu|Nilotic|Afroasiatic)/i, category: 'context', score: +4, reviewer: 'context', comment: 'African population genetics context acknowledged.' },

    /* ── Hypothesis / aims ── */
    { pattern: /\b(hypothesis|hypothesize|we\s+aim\s+to|aim\s+of\s+this|research\s+(question|objective))/i, category: 'hypothesis', score: +5, reviewer: 'all', comment: 'Research hypothesis or aims clearly stated.' },
    { pattern: /\b(primary\s+(outcome|endpoint)|secondary\s+(outcome|endpoint))/i, category: 'hypothesis', score: +4, reviewer: 'statistician', comment: 'Primary and secondary outcomes pre-specified — reduces outcome-switching risk.' },
    { pattern: /\b(gap\s+in\s+(the\s+)?literature|knowledge\s+gap|unmet\s+need|unexplored)/i, category: 'hypothesis', score: +4, reviewer: 'all', comment: 'Rationale for the study and knowledge gap clearly articulated.' },

    /* ── Novelty ── */
    { pattern: /\b(first\s+study|first\s+time|novel|previously\s+unreported|unprecedented)/i, category: 'novelty', score: +4, reviewer: 'all', comment: 'Novelty claim made — ensure it is supported by a literature review.' },
    { pattern: /\b(clinical\s+(implication|impact|translation)|public\s+health\s+impact|policy)/i, category: 'novelty', score: +4, reviewer: 'context', comment: 'Clinical or public health implications discussed.' },

    /* ── Writing quality ── */
    { pattern: /\b(abstract|introduction|methods|results|discussion|conclusion)/i, category: 'writing', score: +3, reviewer: 'all', comment: 'Standard IMRAD structure present.' },
    { pattern: /[A-Z]{4,}/, category: 'writing', score: -2, reviewer: 'all', comment: 'Excessive use of unexplained acronyms detected. Define all abbreviations at first use.' },
    { pattern: /(.)\1{4,}/, category: 'writing', score: -3, reviewer: 'all', comment: 'Repeated characters detected — possible text artefact or encoding issue.' },

    /* ── Negative indicators ── */
    { pattern: /\b(not\s+shown|data\s+not\s+shown|supplementary\s+figure\s+not\s+available)/i, category: 'methods', score: -4, reviewer: 'methods', comment: '"Data not shown" is not acceptable — all key data must be presented or deposited.' },
    { pattern: /\b(we\s+believe|we\s+think|we\s+feel)\b/i, category: 'writing', score: -3, reviewer: 'all', comment: 'Avoid subjective language ("we believe"). State findings objectively or qualify with "our data suggest".' },
  ];

  /* ─── Example abstracts ─── */
  const EXAMPLES = {
    wgs: {
      label: 'WGS outbreak investigation',
      text: `Introduction: Drug-resistant tuberculosis (DR-TB) represents a major public health threat in South Africa, particularly in KwaZulu-Natal Province. We aimed to characterise the genomic epidemiology of a putative XDR-TB cluster at a tertiary hospital in Durban.

Methods: We prospectively recruited 47 culture-confirmed TB patients over 12 months following ethics committee approval (BREC 2023/004) and written informed consent. Whole-genome sequencing was performed on Illumina NovaSeq 6000 using Nextera XT library preparation (mean depth 100×, minimum 20×). Bioinformatic analysis used the TBProfiler pipeline (v4.4.0) for resistance prediction and snippy (v4.6.0) on GCF_000195955.2 for SNP-based phylogenetics. A Bayesian molecular clock was estimated in BEAST2 (v2.6.7) calibrated to M. tuberculosis mutation rate (1×10⁻⁷ substitutions/site/year). Statistical analysis was performed in R 4.3.1. All sequence data were deposited in NCBI SRA (BioProject PRJNA887345).

Results: Whole-genome sequencing identified a single-source cluster of 18 patients sharing a Beijing lineage strain (Lineage 2.2.1) with ≤5 SNP difference. The cluster isolates harboured katG (S315T), rpoB (S450L), and eis (C-14T) mutations conferring INH, RIF, and AMK resistance. Molecular clock analysis estimated cluster emergence 14 months prior to detection (95% CI: 9–21 months). Spatial analysis identified the hospital radiology suite as the likely transmission hotspot.

Conclusions: This study identifies a nosocomial XDR-TB cluster with defined molecular source and likely transmission route. Our findings have direct implications for hospital infection control policy and support scale-up of routine WGS in national TB surveillance.`,
    },
    rnaseq: {
      label: 'RNA-seq with methodological gaps',
      text: `Background: Malaria remains a significant public health problem in sub-Saharan Africa. We investigated gene expression changes in P. falciparum following artemisinin treatment.

Methods: We performed RNA sequencing on parasite samples. Samples were collected from patients at a clinic in Ghana. Total RNA was extracted and libraries prepared. Sequencing was done on Illumina platform. We used standard bioinformatics tools for analysis. Differential expression analysis was performed.

Results: We identified significant differences in gene expression between treated and untreated parasites. n=8 samples per group showed statistically significant results (p < 0.05). A total of 312 genes were differentially expressed. We believe these genes are important for artemisinin resistance. Data not shown for supplementary figures.

Conclusion: Our results suggest that artemisinin treatment causes gene expression changes in malaria parasites. Further studies are needed.`,
    },
    scrnaseq: {
      label: 'scRNA-seq with strong design',
      text: `Hypothesis: We hypothesise that HIV-associated neurocognitive disorder (HAND) is driven by distinct microglial activation states detectable by single-cell transcriptomics in post-mortem brain tissue.

Aims: (1) Characterise microglial subpopulations in HAND versus HIV-seronegative controls; (2) Identify HAND-specific transcriptional programmes; (3) Validate candidate pathways in a Zambian replication cohort.

Methods: Post-mortem frontal cortex tissue from 24 HIV+ individuals with confirmed HAND and 12 HIV-seronegative controls was obtained under UNZA BIOMED ethics protocol (REC/BIOM/2023-089) with written consent from legal next-of-kin. Single-nucleus RNA sequencing (snRNA-seq) was performed on the 10x Chromium platform (v3.1 chemistry). Cell Ranger v7.1.0 was used for alignment to GRCh38, followed by Seurat v5.0 (R 4.3.2) for clustering, DoubletFinder (v2.0.3) for doublet removal, and MAST for differential expression. Power analysis confirmed 80% power to detect a 1.5-fold change at FDR < 0.05 with the given cell numbers. Pre-registration: OSF.io/xyz123. All raw data deposited: NCBI SRA BioProject PRJNA920441. Code available: github.com/lab/HAND-snRNAseq.

Results: We identified 9 microglial subpopulations. A novel HAND-specific subcluster (MG-HAND, n=4,218 cells) expressed high levels of TREM2, C1Q, and SPP1 and was enriched for complement and phagocytosis pathways (adjusted p < 0.001; OR 3.2, 95% CI 2.1–4.9). These findings were validated in the Zambian replication cohort (n=8 HAND, n=6 control). Community advisory board consultation confirmed the relevance of these findings to affected communities in Lusaka.

Conclusions: snRNA-seq reveals a HAND-specific microglial activation state with potential as a therapeutic target. Data and code are fully open access to support replication in African research centres.`,
    },
  };

  /* ─── Score a manuscript ─── */
  function _score(text) {
    const rubricScores = {};
    RUBRIC.forEach(r => { rubricScores[r.id] = 50; /* baseline */ });

    const comments = { statistician: [], methods: [], context: [] };

    RULES.forEach(rule => {
      if (!rule.pattern.test(text)) return;
      const cat = rule.category === 'context' ? 'ethics' : rule.category; /* map context → ethics rubric */
      if (rubricScores[cat] !== undefined) rubricScores[cat] = Math.min(100, Math.max(0, rubricScores[cat] + rule.score));
      const target = rule.reviewer === 'all' ? ['statistician', 'methods', 'context'] : [rule.reviewer];
      target.forEach(r => {
        if (!comments[r].find(c => c.comment === rule.comment)) {
          comments[r].push({ category: rule.category, comment: rule.comment, score: rule.score });
        }
      });
    });

    /* Word-count bonus */
    const words = text.split(/\s+/).filter(Boolean).length;
    if (words > 300) Object.keys(rubricScores).forEach(k => { rubricScores[k] = Math.min(100, rubricScores[k] + 3); });
    if (words < 80)  Object.keys(rubricScores).forEach(k => { rubricScores[k] = Math.max(0, rubricScores[k] - 10); });

    /* Overall weighted score */
    let overall = 0;
    RUBRIC.forEach(r => { overall += rubricScores[r.id] * (r.weight / 100); });

    return { rubricScores, comments, overall: Math.round(overall), words };
  }

  /* ─── Verdict label ─── */
  function _verdict(score) {
    if (score >= 80) return { label: 'Accept', color: '#00C4A0', icon: OmicsLab.Icons?.svg('check-circle',14)||'' };
    if (score >= 65) return { label: 'Minor Revision', color: '#e3b341', icon: OmicsLab.Icons?.svg('rotate-cw',14)||'' };
    if (score >= 45) return { label: 'Major Revision', color: '#f97316', icon: OmicsLab.Icons?.svg('alert-triangle',14)||'' };
    return { label: 'Reject', color: '#ff6b6b', icon: OmicsLab.Icons?.svg('x-circle',14)||'' };
  }

  /* ─── Render reviewer card ─── */
  function _reviewerHtml(reviewer, comments, overall) {
    const v = _verdict(overall);
    const myComments = comments[reviewer.id];
    const positives = myComments.filter(c => c.score > 0);
    const negatives = myComments.filter(c => c.score <= 0);

    /* Reviewer-specific overall opinion */
    const opinion = overall >= 80 ? 'I recommend acceptance with minor textual revisions.'
      : overall >= 65 ? 'The work is promising but requires targeted revisions before publication.'
      : overall >= 45 ? 'Substantial issues must be addressed. I recommend a major revision with re-review.'
      : 'In its current form, this manuscript is not suitable for publication. Fundamental concerns must be addressed.';

    return `
      <div class="pr-reviewer-card" style="--pr-color:${reviewer.color}">
        <div class="pr-rev-header">
          <div class="pr-rev-avatar" style="background:${reviewer.color}">${reviewer.avatar}</div>
          <div class="pr-rev-info">
            <div class="pr-rev-name">${reviewer.name} ${reviewer.flag}</div>
            <div class="pr-rev-title">${reviewer.title} · ${reviewer.institution}</div>
            <div class="pr-rev-focus">${reviewer.focus}</div>
          </div>
          <div class="pr-rev-verdict" style="color:${v.color}">
            ${v.icon} ${v.label}
          </div>
        </div>
        <div class="pr-rev-opinion">"${opinion}"</div>
        ${positives.length ? `
          <div class="pr-comment-section">
            <div class="pr-comment-heading pr-heading-pos">Strengths</div>
            ${positives.map(c => `<div class="pr-comment pr-comment-pos"><span class="pr-comment-icon">+</span>${c.comment}</div>`).join('')}
          </div>` : ''}
        ${negatives.length ? `
          <div class="pr-comment-section">
            <div class="pr-comment-heading pr-heading-neg">Concerns & Required Changes</div>
            ${negatives.map(c => `<div class="pr-comment pr-comment-neg"><span class="pr-comment-icon">!</span>${c.comment}</div>`).join('')}
          </div>` : ''}
        ${(!positives.length && !negatives.length) ? `<div class="pr-no-comments">Add more detail to your manuscript to receive specific feedback from this reviewer.</div>` : ''}
      </div>`;
  }

  /* ─── Run review ─── */
  function _review() {
    const text = document.getElementById('pr-input')?.value?.trim() || '';
    const statusEl = document.getElementById('pr-status');

    if (text.length < 50) {
      if (statusEl) statusEl.textContent = 'Please paste at least a paragraph of your manuscript.';
      return;
    }
    if (statusEl) statusEl.textContent = 'Reviewers are reading your manuscript…';

    const { rubricScores, comments, overall, words } = _score(text);
    const v = _verdict(overall);

    /* Render results */
    const out = document.getElementById('pr-output');
    if (!out) return;

    const rubricHtml = RUBRIC.map(r => {
      const s = rubricScores[r.id];
      const col = s >= 70 ? '#00C4A0' : s >= 45 ? '#e3b341' : '#ff6b6b';
      return `
        <div class="pr-rubric-row">
          <div class="pr-rubric-label">${r.label}</div>
          <div class="pr-rubric-bar-wrap"><div class="pr-rubric-bar" style="width:${s}%;background:${col}"></div></div>
          <div class="pr-rubric-score" style="color:${col}">${s}</div>
          <div class="pr-rubric-weight">${r.weight}%</div>
        </div>`;
    }).join('');

    out.innerHTML = `
      <div class="pr-results-header">
        <div class="pr-overall-badge" style="--v-color:${v.color}">
          <div class="pr-overall-icon">${v.icon}</div>
          <div class="pr-overall-label">Editorial Decision</div>
          <div class="pr-overall-verdict" style="color:${v.color}">${v.label}</div>
          <div class="pr-overall-score">${overall} / 100</div>
        </div>
        <div class="pr-rubric-panel">
          <div class="pr-rubric-title">Score by Criterion</div>
          ${rubricHtml}
          <div class="pr-word-count">${words.toLocaleString()} words analysed</div>
        </div>
      </div>
      <div class="pr-reviews-grid">
        ${REVIEWERS.map(r => _reviewerHtml(r, comments, overall)).join('')}
      </div>
      <div class="pr-meta-note">
        <strong>How scoring works:</strong> Each reviewer searches your text for 40+ evidence-based quality indicators — statistical rigour, reproducibility signals, ethics compliance, and writing quality. Scores start at 50/100 and adjust based on what is present or missing. This tool supplements, not replaces, real peer review.
      </div>`;

    if (statusEl) statusEl.textContent = `Review complete — ${overall}/100 overall · ${v.label}`;
  }

  /* ─── Init ─── */
  function init() {
    const section = document.getElementById('peerreview-section');
    if (!section || section.dataset.prReady) return;
    section.dataset.prReady = '1';

    section.innerHTML = `
      <div class="pr-wrap">
        <div class="pr-header">
          <div>
            <div class="pr-badge">PEER REVIEW SIMULATOR</div>
            <h2 class="pr-title">Peer Review Simulator</h2>
            <p class="pr-subtitle">Paste your abstract or methods section. Three virtual reviewers — a biostatistician, a genomics methods specialist, and an African genomics ethics expert — give rubric-based critiques against 40+ evidence quality indicators.</p>
          </div>
        </div>

        <div class="pr-main">
          <div class="pr-left">
            <div class="pr-card">
              <div class="pr-card-title">Your Manuscript</div>
              <div class="pr-examples-row">
                <span class="pr-examples-label">Load example:</span>
                ${Object.entries(EXAMPLES).map(([k, ex]) =>
                  `<button class="pr-ex-btn" onclick="OmicsLab.PeerReview._loadExample('${k}')">${ex.label}</button>`
                ).join('')}
              </div>
              <textarea id="pr-input" class="pr-textarea" rows="16"
                placeholder="Paste your abstract, methods, or full manuscript section here…&#10;&#10;Tip: include your ethics approval, sample size justification, software versions, and data availability statement for the best score."></textarea>
              <button class="pr-submit-btn" onclick="OmicsLab.PeerReview._review()">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                Submit for Peer Review
              </button>
              <div id="pr-status" class="pr-status"></div>
            </div>

            <!-- Reviewer bios -->
            <div class="pr-bios">
              <div class="pr-bios-title">Your Reviewers</div>
              ${REVIEWERS.map(r => `
                <div class="pr-bio-card" style="--pr-color:${r.color}">
                  <div class="pr-bio-avatar" style="background:${r.color}">${r.avatar}</div>
                  <div class="pr-bio-info">
                    <div class="pr-bio-name">${r.name} ${r.flag}</div>
                    <div class="pr-bio-title">${r.title}</div>
                    <div class="pr-bio-focus">${r.focus}</div>
                    <div class="pr-bio-personality">"${r.personality}"</div>
                  </div>
                </div>`).join('')}
            </div>
          </div>

          <div class="pr-right" id="pr-output">
            <div class="pr-empty-state">
              <div class="pr-empty-icon">${OmicsLab.Icons?.svg('clipboard',28)||''}</div>
              <div class="pr-empty-title">Waiting for your manuscript</div>
              <div class="pr-empty-text">Paste your text on the left and click Submit for Peer Review. The more detail you include, the more specific the feedback.</div>
              <div class="pr-checklist">
                <div class="pr-checklist-title">Checklist for a strong submission:</div>
                ${[
                  'Clear hypothesis or research aims',
                  'Ethics committee approval number',
                  'Informed consent description',
                  'Sample size + power calculation',
                  'Software names and version numbers',
                  'Reference genome build specified',
                  'Data deposited (SRA / ENA / Zenodo)',
                  'Code available (GitHub / Zenodo)',
                  'Multiple testing correction applied',
                  'Confidence intervals reported',
                ].map(item => `<div class="pr-check-item">○ ${item}</div>`).join('')}
              </div>
            </div>
          </div>
        </div>
      </div>`;

    document.getElementById('pr-input')?.addEventListener('keydown', e => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); _review(); }
    });
  }

  function _loadExample(key) {
    const ex = EXAMPLES[key];
    if (!ex) return;
    const ta = document.getElementById('pr-input');
    if (ta) ta.value = ex.text;
    const s = document.getElementById('pr-status');
    if (s) s.textContent = `Loaded: ${ex.label}`;
  }

  return { init, _review, _loadExample };
})();
