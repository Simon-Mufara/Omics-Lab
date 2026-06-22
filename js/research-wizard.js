/* ═══════════════════════════════════════════════════════════════
   OmicsLab — Research Design Wizard
   Guided 6-step workflow: hypothesis → study type → samples →
   ethics → bioinformatics pipeline → summary & export
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.ResearchWizard = (function () {

  const STEPS = ['Research Question','Study Design','Samples & Sites','Ethics & Data','Pipeline','Summary & Export'];
  let _step = 1;

  /* ─── Persistent state across step navigation ─── */
  let _d = {
    /* Step 1 */
    exposure: '', outcome: '', population: '', significance: '',
    /* Step 2 */
    studyType: '',
    /* Step 3 */
    sampleN: '', sampleJustification: '', sites: [], dataSource: '', inclusion: '', exclusion: '',
    /* Step 4 */
    sampleTypes: [], ethics: '', consent: '', dataGov: [],
    /* Step 5 – auto-generated, user can toggle */
    pipelineSteps: [],
    /* Step 6 – notes */
    notes: '',
  };

  /* ─── Study type catalogue ─── */
  const STUDY_TYPES = [
    { id: 'gwas', name: 'GWAS / Population Genetics', color: '#3fb950',
      desc: 'Genome-wide association: identify SNPs linked to a phenotype across a large population.',
      sampleHint: 'Minimum: 1,000 cases + 1,000 controls for common variants (MAF > 5%)',
      pipeline: ['WGS or high-density SNP array genotyping','PLINK/REGENIE variant QC (call rate, HWE, MAF filters)','Population stratification via PCA (remove outliers)','GWAS association testing (logistic/linear regression)','LD clumping & fine-mapping (FINEMAP/SuSiE)','Functional annotation (VEP, GTEx eQTL lookup)','GWAS catalog comparison & meta-analysis'],
      analysis: 'Logistic/linear regression with genomic inflation control (REGENIE, SAIGE)',
      correction: 'Genome-wide significance p < 5×10⁻⁸; suggestive p < 1×10⁻⁵',
    },
    { id: 'casecontrol', name: 'Case-Control (Targeted)', color: '#58a6ff',
      desc: 'Compare genomic or molecular profiles between disease-affected individuals and matched healthy controls.',
      sampleHint: 'Minimum: ≥ 100 cases per arm; 1:2–1:3 case:control ratio maximises power',
      pipeline: ['Participant recruitment & sample collection','DNA/RNA extraction & quality assessment (Qubit, TapeStation)','Targeted sequencing or WGS library preparation','Alignment (BWA-MEM2) & variant calling (GATK HaplotypeCaller)','Variant annotation (VEP, ClinVar, gnomAD AFR)','Case-control association testing with matched covariates','Sensitivity analysis & replication in independent cohort'],
      analysis: 'Logistic regression adjusted for age, sex, principal components',
      correction: 'Bonferroni correction or FDR (Benjamini-Hochberg) q < 0.05',
    },
    { id: 'cohort', name: 'Prospective Cohort', color: '#bc8cff',
      desc: 'Follow a defined group over time to measure incidence of outcomes and exposure-outcome relationships.',
      sampleHint: 'Power depends on expected event rate; typically ≥ 500 participants for genomic studies',
      pipeline: ['Baseline recruitment & biobanking','Follow-up sample collection at defined intervals','Longitudinal phenotype data collection','Genomic QC & batch correction across time points','Survival / time-to-event analysis (Cox model)','Mixed-effects model for repeated measures','Mediation & interaction analysis'],
      analysis: 'Cox proportional hazards model with time-varying covariates',
      correction: 'FDR (Benjamini-Hochberg) or Bonferroni depending on number of tests',
    },
    { id: 'rnaseq', name: 'Bulk RNA-seq (DE Analysis)', color: '#e3b341',
      desc: 'Measure genome-wide gene expression — compare between conditions, time points, or treatment groups.',
      sampleHint: 'Minimum: ≥ 3 biological replicates per group; 6+ for robust DE detection',
      pipeline: ['RNA extraction & quality check (RIN ≥ 7, Bioanalyzer)','Poly-A selection or rRNA depletion library prep','Paired-end sequencing (≥ 50M reads per sample)','STAR 2-pass alignment to reference genome','featureCounts / Salmon transcript quantification','DESeq2 or edgeR differential expression analysis','Gene Ontology & KEGG pathway enrichment (clusterProfiler)'],
      analysis: 'Negative binomial GLM (DESeq2) or quasi-likelihood F-test (edgeR)',
      correction: 'FDR-adjusted p-value (padj) < 0.05; |log2FC| > 1',
    },
    { id: 'scrna', name: 'Single-Cell RNA-seq', color: '#f97316',
      desc: 'Resolve cell-type-specific gene expression at single-cell resolution.',
      sampleHint: 'Minimum: ≥ 3,000 cells per sample; 2–5 samples per group for pseudobulk DE',
      pipeline: ['Fresh tissue dissociation or PBMC isolation','10x Chromium capture or Smart-seq2 (plate-based)','CellRanger alignment & UMI counting','Seurat/Scanpy QC: filter low-quality cells & doublets','Normalisation (scran), PCA, UMAP embedding','Leiden/Louvain clustering & cell type annotation','Pseudobulk differential expression per cell type','Trajectory / pseudotime analysis (Monocle3/Diffusion Maps)'],
      analysis: 'Wilcoxon rank-sum test per cluster or pseudobulk DESeq2',
      correction: 'FDR per cluster; minimum 25 cells per group',
    },
    { id: 'proteomics', name: 'Proteomics (LC-MS/MS)', color: '#ff6b6b',
      desc: 'Identify and quantify proteins using mass spectrometry — discover biomarkers or characterise proteomes.',
      sampleHint: 'Discovery: ≥ 20 per group; Validation (targeted MRM): ≥ 50 per group',
      pipeline: ['Sample preparation (FASP or SP3 protocol)','TMT labelling or label-free quantification (LFQ)','LC-MS/MS data acquisition (DDA or DIA)','MaxQuant / DIA-NN database search (reviewed UniProtKB)','Perseus or MSstats statistical analysis','Protein network analysis (STRING, Reactome)','Biomarker validation by targeted MRM/PRM or ELISA'],
      analysis: 'Linear model with limma or MSstats; minimum 2 unique peptides per protein',
      correction: 'FDR q < 0.01 for discovery; Bonferroni for validation set',
    },
    { id: 'metagenomics', name: 'Metagenomics / Microbiome', color: '#3fb950',
      desc: 'Characterise microbial communities from environmental or clinical samples using 16S or shotgun WGS.',
      sampleHint: 'Alpha diversity: ≥ 20 samples; differential abundance: ≥ 50 per group',
      pipeline: ['Bead-beating DNA extraction (PowerSoil for stool)','16S rRNA V3-V4 amplicon OR shotgun WGS sequencing','DADA2 (16S) or Kraken2/MetaPhlAn4 (WGS) classification','QIIME2 / Phyloseq diversity analysis (alpha, beta)','UniFrac PCoA ordination for beta-diversity','ANCOM-BC or MaAsLin2 differential abundance','Functional prediction (PICRUSt2 for 16S; HUMAnN3 for WGS)'],
      analysis: 'ANCOM-BC (compositionality-aware) for differential taxa abundance',
      correction: 'FDR q < 0.05; replicate in independent cohort',
    },
    { id: 'epigenomics', name: 'Epigenomics (ATAC-seq / WGBS)', color: '#58a6ff',
      desc: 'Characterise chromatin accessibility, DNA methylation, or histone modifications.',
      sampleHint: 'ATAC-seq: ≥ 3 replicates per condition (minimum 50,000 cells); WGBS: ≥ 30× coverage',
      pipeline: ['Sample preparation (nucleus isolation for ATAC, bisulfite conversion for WGBS)','Paired-end sequencing (≥ 50M reads)','Trimmomatic adapter trimming','STAR / Bismark alignment','Peak calling (MACS3 for ATAC; Bismark methylation extraction)','DiffBind / DSS differential analysis','Motif enrichment (HOMER, MEME-ChIP)','Integration with RNA-seq (correlate open chromatin with expression)'],
      analysis: 'edgeR / DESeq2 for peak counts (ATAC); beta-binomial for methylation (DSS)',
      correction: 'FDR q < 0.05; minimum 2× fold change in peak signal',
    },
    { id: 'computational', name: 'Computational / In Silico', color: '#8b949e',
      desc: 'Analysis of public datasets — re-analysis, benchmarking, method development, or integrative multi-omics.',
      sampleHint: 'Validate on ≥ 2 independent cohorts; use benchmarking datasets (CAMDA, DREAM challenges)',
      pipeline: ['Identify & download public datasets (GEO, SRA, TCGA, ENCODE)','Data harmonisation, batch correction (ComBat-seq)','Exploratory analysis & dimensionality reduction','Method application and cross-validation (5-fold)','Comparison with published methods (AUC, MCC, F1)','Sensitivity analysis: remove individual cohorts'],
      analysis: 'Cross-validation metrics (AUC-ROC, AUPRC, Matthews Correlation Coefficient)',
      correction: 'Bootstrap 95% CIs; permutation test for feature importance',
    },
  ];

  const AFRICA_SITES = [
    'AWI-Gen (South Africa, Ghana, Burkina Faso, Kenya, Tanzania, Nigeria)',
    'H3Africa Network (pan-Africa, 11+ countries)','KEMRI (Kenya)','NIMR (Nigeria)',
    'MUHAS (Tanzania)','University of Ghana Medical School','University of Cape Town / South Africa',
    'CIDRZ (Zambia)','SANTHE (South Africa — HIV focus)','Makerere University (Uganda)',
    'Institut Pasteur Dakar (Senegal)','Noguchi Memorial Institute (Ghana)',
    'African Institute for Mathematical Sciences (multi-national)','MalariaGEN partner site',
    'International (non-Africa primary site)','Multi-site international collaboration',
  ];

  const ETHICS_BODIES = [
    'H3Africa Ethics Review (pan-African)','KEMRI Scientific & Ethics Review Unit (Kenya)',
    'NIMR Health Research Ethics Committee (Nigeria)','UCT Human Research Ethics Committee (South Africa)',
    'University of Ghana Ethics Review Board','Makerere School of Biomedical Sciences ERC (Uganda)',
    'MUHAS Institutional Review Board (Tanzania)','National Commission for Science & Technology (Malawi)',
    'National Health Research Authority (Zambia)','NHREC — South African national body',
    'Institut Pasteur Ethics Committee (West Africa)','Multiple national ethics committees',
  ];

  /* ─── Init ─── */
  function init() {
    const section = document.getElementById('research-wizard-section');
    if (!section) return;
    if (section.dataset.rwReady) { _render(); return; }
    section.dataset.rwReady = '1';
    _render();
  }

  /* ─── Full render ─── */
  function _render() {
    const section = document.getElementById('research-wizard-section');
    if (!section) return;

    section.innerHTML = `
    <div class="rwiz-page">
      <div class="rwiz-header">
        <div class="rwiz-badge">RESEARCH DESIGN WIZARD</div>
        <h1 class="rwiz-title">Design Your Study</h1>
        <p class="rwiz-sub">A guided walkthrough from hypothesis to publication plan — structured around African genomics and bioinformatics best practices.</p>
      </div>

      <!-- Progress stepper -->
      <div class="rwiz-stepper" role="progressbar" aria-valuenow="${_step}" aria-valuemax="${STEPS.length}">
        ${STEPS.map((label, i) => {
          const n = i + 1;
          const cls = n === _step ? 'rwiz-step rwiz-step-current' : n < _step ? 'rwiz-step rwiz-step-done' : 'rwiz-step';
          return `<div class="${cls}">
            <div class="rwiz-dot">
              ${n < _step
                ? '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5"><polyline points="20 6 9 17 4 12"/></svg>'
                : n}
            </div>
            <div class="rwiz-dot-label">${label}</div>
          </div>${i < STEPS.length - 1 ? '<div class="rwiz-dot-line"></div>' : ''}`;
        }).join('')}
      </div>

      <!-- Step content -->
      <div class="rwiz-card" id="rwiz-card">
        ${_renderStep()}
      </div>

      <!-- Footer nav -->
      <div class="rwiz-footer">
        ${_step > 1
          ? `<button class="rwiz-btn-back" onclick="OmicsLab.ResearchWizard._prev()">
               <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
               Back
             </button>`
          : '<div></div>'}
        <div class="rwiz-step-label">Step ${_step} of ${STEPS.length}</div>
        ${_step < STEPS.length
          ? `<button class="rwiz-btn-next" onclick="OmicsLab.ResearchWizard._next()">
               Continue
               <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
             </button>`
          : `<button class="rwiz-btn-export" onclick="OmicsLab.ResearchWizard._export()">
               <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
               Download Study Design
             </button>`}
      </div>
    </div>`;
  }

  /* ─── Step renderers ─── */
  function _renderStep() {
    switch (_step) {
      case 1: return _step1();
      case 2: return _step2();
      case 3: return _step3();
      case 4: return _step4();
      case 5: return _step5();
      case 6: return _step6();
    }
    return '';
  }

  function _step1() {
    return `
    <div class="rwiz-step-title">What is your research question?</div>
    <p class="rwiz-step-desc">Use the PICO framework to structure your hypothesis clearly. This shapes everything downstream — study design, sample size, and analysis plan.</p>
    <div class="rwiz-pico-grid">
      <div class="rwiz-pico-card" style="border-color:#3fb950">
        <div class="rwiz-pico-label" style="color:#3fb950">P — Population</div>
        <div class="rwiz-pico-hint">Who are you studying? Be specific: age group, disease status, ancestry, geography.</div>
        <input class="rwiz-input" id="rwiz-population" value="${_e(_d.population)}"
          placeholder="e.g. HIV-positive adults in sub-Saharan Africa aged 18–50"/>
      </div>
      <div class="rwiz-pico-card" style="border-color:#58a6ff">
        <div class="rwiz-pico-label" style="color:#58a6ff">I — Exposure / Variable</div>
        <div class="rwiz-pico-hint">What genetic variant, treatment, condition, or exposure are you investigating?</div>
        <input class="rwiz-input" id="rwiz-exposure" value="${_e(_d.exposure)}"
          placeholder="e.g. HLA-B*57:01 allele / first-line ART regimen / BCL11A methylation level"/>
      </div>
      <div class="rwiz-pico-card" style="border-color:#e3b341">
        <div class="rwiz-pico-label" style="color:#e3b341">O — Outcome</div>
        <div class="rwiz-pico-hint">What will you measure? Choose a primary outcome that maps to your study design.</div>
        <input class="rwiz-input" id="rwiz-outcome" value="${_e(_d.outcome)}"
          placeholder="e.g. virological suppression at 12 months / CD4 count change / adverse drug reaction incidence"/>
      </div>
      <div class="rwiz-pico-card" style="border-color:#bc8cff">
        <div class="rwiz-pico-label" style="color:#bc8cff">Why it matters (Significance)</div>
        <div class="rwiz-pico-hint">Why does this question matter for African health or science? One or two sentences.</div>
        <textarea class="rwiz-textarea" id="rwiz-significance" rows="2"
          placeholder="e.g. CYP2B6 pharmacogenomics is understudied in African populations — most dosing guidelines were derived from European cohorts...">${_e(_d.significance)}</textarea>
      </div>
    </div>
    <div class="rwiz-tip">
      <strong>Tip:</strong> A well-specified PICO question makes ethics applications, sample size calculations, and analysis plans dramatically easier to write. Write it as a question: "In [P], does [I] lead to [O] compared to [C]?"
    </div>`;
  }

  function _step2() {
    return `
    <div class="rwiz-step-title">Select your study design</div>
    <p class="rwiz-step-desc">Choose the design that best fits your research question. Each type has different requirements for sample size, data collection, and analysis.</p>
    <div class="rwiz-study-grid">
      ${STUDY_TYPES.map(st => `
        <div class="rwiz-study-card ${_d.studyType === st.id ? 'selected' : ''}" onclick="OmicsLab.ResearchWizard._selectStudyType('${st.id}')" style="--sc:${st.color}">
          <div class="rwiz-sc-name" style="color:${st.color}">${st.name}</div>
          <div class="rwiz-sc-desc">${st.desc}</div>
          <div class="rwiz-sc-hint">${st.sampleHint}</div>
          ${_d.studyType === st.id ? '<div class="rwiz-sc-check"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg></div>' : ''}
        </div>`).join('')}
    </div>`;
  }

  function _step3() {
    const st = STUDY_TYPES.find(s => s.id === _d.studyType);
    return `
    <div class="rwiz-step-title">Sample size & study sites</div>
    <p class="rwiz-step-desc">Define who you will recruit and how many. Africa-specific considerations: always account for population stratification and use local ancestry-matched controls.</p>
    ${st ? `<div class="rwiz-tip" style="border-color:${st.color}40;background:${st.color}08"><strong>${st.name}:</strong> ${st.sampleHint}</div>` : ''}
    <div class="rwiz-form-grid">
      <div class="rwiz-form-field">
        <label class="rwiz-label">Target sample size (N)</label>
        <input class="rwiz-input" id="rwiz-sampleN" type="number" min="1" value="${_e(_d.sampleN)}" placeholder="e.g. 500"/>
        <div class="rwiz-field-hint">Use G*Power or pwr (R package) to justify this number. Upload power analysis to ethics submission.</div>
      </div>
      <div class="rwiz-form-field">
        <label class="rwiz-label">Sample size justification (brief)</label>
        <input class="rwiz-input" id="rwiz-sampleJustification" value="${_e(_d.sampleJustification)}" placeholder="e.g. 80% power to detect OR 1.5, MAF 0.05, α = 0.05 with 1:2 case:control"/>
      </div>
      <div class="rwiz-form-field">
        <label class="rwiz-label">Primary data source</label>
        <select class="rwiz-select" id="rwiz-dataSource">
          <option value="" disabled ${!_d.dataSource ? 'selected' : ''}>Select...</option>
          ${['New participant recruitment','Existing cohort / biobank','Public database (GEO, SRA, TCGA, EVA)','H3Africa consortium data','AWI-Gen dataset','Multi-site combination'].map(s => `<option ${_d.dataSource === s ? 'selected' : ''} value="${s}">${s}</option>`).join('')}
        </select>
      </div>
      <div class="rwiz-form-field">
        <label class="rwiz-label">Study site(s)</label>
        <div class="rwiz-checkbox-grid" id="rwiz-sites">
          ${AFRICA_SITES.map(s => `
            <label class="rwiz-checkbox-item">
              <input type="checkbox" value="${s}" ${_d.sites.includes(s) ? 'checked' : ''}
                onchange="OmicsLab.ResearchWizard._toggleSite('${s.replace(/'/g,"\\'")}',this.checked)"/>
              <span>${s}</span>
            </label>`).join('')}
        </div>
      </div>
      <div class="rwiz-form-field">
        <label class="rwiz-label">Inclusion criteria</label>
        <textarea class="rwiz-textarea" id="rwiz-inclusion" rows="2" placeholder="e.g. Age 18–65, confirmed HIV+ diagnosis, ≥ 6 months on ART, residing in study catchment area...">${_e(_d.inclusion)}</textarea>
      </div>
      <div class="rwiz-form-field">
        <label class="rwiz-label">Exclusion criteria</label>
        <textarea class="rwiz-textarea" id="rwiz-exclusion" rows="2" placeholder="e.g. Active opportunistic infection, previous TB treatment, pregnant or breastfeeding, unable to provide informed consent...">${_e(_d.exclusion)}</textarea>
      </div>
    </div>`;
  }

  function _step4() {
    return `
    <div class="rwiz-step-title">Ethics, consent & data governance</div>
    <p class="rwiz-step-desc">African research requires rigorous ethics review. The H3Africa Consortium has developed specific guidelines for genomic data governance — follow these for any data involving African participants.</p>
    <div class="rwiz-form-grid">
      <div class="rwiz-form-field">
        <label class="rwiz-label">Primary sample type(s) to collect</label>
        <div class="rwiz-checkbox-grid">
          ${['Whole blood (EDTA)','PBMC (buffy coat)','Serum','Plasma','Saliva/buccal swab','Tissue biopsy (FFPE)','Fresh tissue','Stool','Urine','Cord blood','Cerebrospinal fluid','Public/existing dataset (no new samples)'].map(s => `
            <label class="rwiz-checkbox-item">
              <input type="checkbox" value="${s}" ${_d.sampleTypes.includes(s) ? 'checked' : ''}
                onchange="OmicsLab.ResearchWizard._toggleSampleType('${s.replace(/'/g,"\\'")}',this.checked)"/>
              <span>${s}</span>
            </label>`).join('')}
        </div>
      </div>
      <div class="rwiz-form-field">
        <label class="rwiz-label">Ethics review committee</label>
        <select class="rwiz-select" id="rwiz-ethics">
          <option value="" disabled ${!_d.ethics ? 'selected' : ''}>Select...</option>
          ${ETHICS_BODIES.map(s => `<option ${_d.ethics === s ? 'selected' : ''} value="${s}">${s}</option>`).join('')}
        </select>
      </div>
      <div class="rwiz-form-field">
        <label class="rwiz-label">Consent model</label>
        <div class="rwiz-radio-group" id="rwiz-consent">
          ${['Broad consent (H3Africa recommended for biobanking)','Study-specific informed consent','Tiered consent (participants choose data sharing scope)','Waiver of consent (secondary analysis of public data)'].map(s => `
            <label class="rwiz-radio-item">
              <input type="radio" name="rwiz-consent-radio" value="${s}" ${_d.consent === s ? 'checked' : ''}
                onchange="OmicsLab.ResearchWizard._setConsent('${s.replace(/'/g,"\\'")}')"/>
              <span>${s}</span>
            </label>`).join('')}
        </div>
      </div>
      <div class="rwiz-form-field">
        <label class="rwiz-label">Data governance framework(s)</label>
        <div class="rwiz-checkbox-grid">
          ${['H3Africa Data Access Policy','POPIA (South Africa)','GDPR (if EU partners involved)','NIH Data Sharing Policy','FAIR data principles (Findable, Accessible, Interoperable, Reusable)','African Union Convention on Cyber Security','Local institutional data policy'].map(s => `
            <label class="rwiz-checkbox-item">
              <input type="checkbox" value="${s}" ${_d.dataGov.includes(s) ? 'checked' : ''}
                onchange="OmicsLab.ResearchWizard._toggleDataGov('${s.replace(/'/g,"\\'")}',this.checked)"/>
              <span>${s}</span>
            </label>`).join('')}
        </div>
      </div>
    </div>
    <div class="rwiz-tip" style="border-color:rgba(249,115,22,0.4);background:rgba(249,115,22,0.05)">
      <strong>H3Africa principle:</strong> Genomic data from African participants must be returned to African researchers — avoid exclusive deposition in dbGaP (US) only. Consider H3Africa Data Archive as a co-primary repository.
    </div>`;
  }

  function _step5() {
    const st = STUDY_TYPES.find(s => s.id === _d.studyType);
    if (!st) return `<div class="rwiz-step-title">Bioinformatics pipeline</div><p class="rwiz-step-desc">Please go back and select a study design first.</p>`;

    /* Auto-populate if empty */
    if (_d.pipelineSteps.length === 0) _d.pipelineSteps = [...st.pipeline];

    return `
    <div class="rwiz-step-title">Bioinformatics pipeline</div>
    <p class="rwiz-step-desc">Recommended pipeline for <strong>${st.name}</strong>. Toggle steps to customise. All recommended tools are open-source and accessible without institutional licences.</p>
    <div class="rwiz-pipeline-list" id="rwiz-pipeline-list">
      ${_d.pipelineSteps.map((step, i) => `
        <div class="rwiz-pipe-step">
          <span class="rwiz-pipe-n">${i + 1}</span>
          <span class="rwiz-pipe-text">${step}</span>
          <button class="rwiz-pipe-remove" onclick="OmicsLab.ResearchWizard._removePipeStep(${i})" title="Remove step">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>`).join('')}
    </div>
    <div style="display:flex;gap:.5rem;align-items:center;margin-top:1rem;flex-wrap:wrap">
      <input class="rwiz-input" id="rwiz-new-step" placeholder="Add custom step…" style="max-width:340px"/>
      <button class="rwiz-btn-add" onclick="OmicsLab.ResearchWizard._addPipeStep()">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Add step
      </button>
      <button class="rwiz-btn-reset-pipe" onclick="OmicsLab.ResearchWizard._resetPipeline()">Reset to default</button>
    </div>
    <div class="rwiz-tip" style="margin-top:1rem">
      <strong>Statistical analysis plan:</strong> ${st.analysis}<br>
      <strong>Multiple testing correction:</strong> ${st.correction}
    </div>`;
  }

  function _step6() {
    const st = STUDY_TYPES.find(s => s.id === _d.studyType);
    const summary = _buildSummary();
    return `
    <div class="rwiz-step-title">Study design summary</div>
    <p class="rwiz-step-desc">Your complete research design document. Download it as a text file to use as the basis for your ethics application, grant proposal, or project protocol.</p>
    <div class="rwiz-summary-box" id="rwiz-summary">
<pre class="rwiz-summary-pre">${summary}</pre>
    </div>
    <div class="rwiz-form-field" style="margin-top:1rem">
      <label class="rwiz-label">Additional notes / custom sections</label>
      <textarea class="rwiz-textarea" id="rwiz-notes" rows="3"
        placeholder="Risk mitigation, community engagement plan, budget notes, timeline…"
        oninput="OmicsLab.ResearchWizard._saveNotes(this.value)">${_e(_d.notes)}</textarea>
    </div>
    <div class="rwiz-export-actions">
      <button class="rwiz-btn-export" onclick="OmicsLab.ResearchWizard._export()">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        Download .txt
      </button>
      <button class="rwiz-btn-copy" onclick="OmicsLab.ResearchWizard._copyText()">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
        Copy to clipboard
      </button>
      <button class="rwiz-btn-reset" onclick="OmicsLab.ResearchWizard._restart()">Start over</button>
    </div>`;
  }

  /* ─── Navigation & state save ─── */
  function _next() {
    _saveCurrentStep();
    if (!_validateCurrentStep()) return;
    _step = Math.min(_step + 1, STEPS.length);
    _render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function _prev() {
    _saveCurrentStep();
    _step = Math.max(_step - 1, 1);
    _render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function _saveCurrentStep() {
    const g = id => document.getElementById(id);
    switch (_step) {
      case 1:
        _d.population = g('rwiz-population')?.value || _d.population;
        _d.exposure   = g('rwiz-exposure')?.value   || _d.exposure;
        _d.outcome    = g('rwiz-outcome')?.value     || _d.outcome;
        _d.significance = g('rwiz-significance')?.value || _d.significance;
        break;
      case 3:
        _d.sampleN = g('rwiz-sampleN')?.value || _d.sampleN;
        _d.sampleJustification = g('rwiz-sampleJustification')?.value || _d.sampleJustification;
        _d.dataSource = g('rwiz-dataSource')?.value || _d.dataSource;
        _d.inclusion  = g('rwiz-inclusion')?.value  || _d.inclusion;
        _d.exclusion  = g('rwiz-exclusion')?.value  || _d.exclusion;
        break;
      case 4:
        _d.ethics = g('rwiz-ethics')?.value || _d.ethics;
        break;
    }
  }

  function _validateCurrentStep() {
    if (_step === 1 && !(_d.population && _d.exposure && _d.outcome)) {
      OmicsLab.Notify?.error('Please fill in Population, Exposure/Variable, and Outcome before continuing.');
      return false;
    }
    if (_step === 2 && !_d.studyType) {
      OmicsLab.Notify?.error('Please select a study design before continuing.');
      return false;
    }
    return true;
  }

  /* ─── Interactive handlers ─── */
  function _selectStudyType(id) {
    _d.studyType = id;
    _d.pipelineSteps = [];
    document.querySelectorAll('.rwiz-study-card').forEach(el => el.classList.remove('selected'));
    event?.currentTarget?.classList.add('selected');
    _render();
  }

  function _toggleSite(site, checked) {
    if (checked) { if (!_d.sites.includes(site)) _d.sites.push(site); }
    else _d.sites = _d.sites.filter(s => s !== site);
  }

  function _toggleSampleType(type, checked) {
    if (checked) { if (!_d.sampleTypes.includes(type)) _d.sampleTypes.push(type); }
    else _d.sampleTypes = _d.sampleTypes.filter(s => s !== type);
  }

  function _toggleDataGov(item, checked) {
    if (checked) { if (!_d.dataGov.includes(item)) _d.dataGov.push(item); }
    else _d.dataGov = _d.dataGov.filter(s => s !== item);
  }

  function _setConsent(val) { _d.consent = val; }

  function _addPipeStep() {
    const inp = document.getElementById('rwiz-new-step');
    const val = inp?.value.trim();
    if (!val) return;
    _d.pipelineSteps.push(val);
    inp.value = '';
    const list = document.getElementById('rwiz-pipeline-list');
    if (list) {
      const div = document.createElement('div');
      div.className = 'rwiz-pipe-step';
      const idx = _d.pipelineSteps.length - 1;
      div.innerHTML = `<span class="rwiz-pipe-n">${idx + 1}</span><span class="rwiz-pipe-text">${val}</span>
        <button class="rwiz-pipe-remove" onclick="OmicsLab.ResearchWizard._removePipeStep(${idx})" title="Remove step">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>`;
      list.appendChild(div);
    }
  }

  function _removePipeStep(idx) {
    _d.pipelineSteps.splice(idx, 1);
    _render();
  }

  function _resetPipeline() {
    const st = STUDY_TYPES.find(s => s.id === _d.studyType);
    if (st) { _d.pipelineSteps = [...st.pipeline]; _render(); }
  }

  function _saveNotes(val) { _d.notes = val; }

  /* ─── Build summary text ─── */
  function _buildSummary() {
    const st = STUDY_TYPES.find(s => s.id === _d.studyType);
    const now = new Date().toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' });
    return [
      '═══════════════════════════════════════════════════════',
      '  RESEARCH STUDY DESIGN SUMMARY',
      '  Generated by OmicsLab Simulator — ' + now,
      '═══════════════════════════════════════════════════════',
      '',
      '1. RESEARCH QUESTION',
      '─────────────────────────────────────────────────────',
      `   Population:      ${_d.population || '(not specified)'}`,
      `   Exposure:        ${_d.exposure   || '(not specified)'}`,
      `   Outcome:         ${_d.outcome    || '(not specified)'}`,
      '',
      _d.significance ? `   Significance: ${_d.significance}` : '',
      '',
      '2. STUDY DESIGN',
      '─────────────────────────────────────────────────────',
      `   Design type:     ${st ? st.name : '(not selected)'}`,
      st ? `   Description:    ${st.desc}` : '',
      '',
      '3. SAMPLE & POPULATION',
      '─────────────────────────────────────────────────────',
      `   Target N:        ${_d.sampleN || '(not specified)'}`,
      _d.sampleJustification ? `   Power analysis:  ${_d.sampleJustification}` : '',
      `   Data source:     ${_d.dataSource || '(not specified)'}`,
      _d.sites.length ? `   Study sites:     ${_d.sites.join('; ')}` : '',
      _d.inclusion ? `   Inclusion:       ${_d.inclusion}` : '',
      _d.exclusion ? `   Exclusion:       ${_d.exclusion}` : '',
      '',
      '4. ETHICS & DATA GOVERNANCE',
      '─────────────────────────────────────────────────────',
      _d.sampleTypes.length ? `   Sample types:    ${_d.sampleTypes.join(', ')}` : '',
      `   Ethics body:     ${_d.ethics || '(not specified)'}`,
      `   Consent model:   ${_d.consent || '(not specified)'}`,
      _d.dataGov.length ? `   Governance:      ${_d.dataGov.join('; ')}` : '',
      '',
      '5. BIOINFORMATICS PIPELINE',
      '─────────────────────────────────────────────────────',
      ..._d.pipelineSteps.map((s, i) => `   ${String(i + 1).padStart(2)}. ${s}`),
      '',
      st ? `   Statistical analysis: ${st.analysis}` : '',
      st ? `   Correction:           ${st.correction}` : '',
      '',
      _d.notes ? '6. ADDITIONAL NOTES\n─────────────────────────────────────────────────────\n   ' + _d.notes : '',
      '',
      '═══════════════════════════════════════════════════════',
      '  OmicsLab Simulator | simon.mufara1@gmail.com',
      '  This document is for educational and planning purposes.',
      '═══════════════════════════════════════════════════════',
    ].filter(l => l !== null && l !== undefined).join('\n');
  }

  /* ─── Export ─── */
  function _export() {
    _saveCurrentStep();
    const text = _buildSummary() + (_d.notes ? '\n\nNotes:\n' + _d.notes : '');
    const blob = new Blob([text], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'OmicsLab_StudyDesign_' + new Date().toISOString().slice(0, 10) + '.txt';
    a.click();
    URL.revokeObjectURL(a.href);
    OmicsLab.Notify?.success('Study design downloaded');
  }

  function _copyText() {
    navigator.clipboard.writeText(_buildSummary()).then(() => {
      OmicsLab.Notify?.success('Copied to clipboard');
    });
  }

  function _restart() {
    _step = 1;
    _d = { exposure: '', outcome: '', population: '', significance: '', studyType: '',
           sampleN: '', sampleJustification: '', sites: [], dataSource: '', inclusion: '', exclusion: '',
           sampleTypes: [], ethics: '', consent: '', dataGov: [], pipelineSteps: [], notes: '' };
    _render();
  }

  /* ─── Helpers ─── */
  function _e(s) { return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

  return { init, _prev, _next, _selectStudyType, _toggleSite, _toggleSampleType, _toggleDataGov, _setConsent, _addPipeStep, _removePipeStep, _resetPipeline, _saveNotes, _export, _copyText, _restart };
})();
