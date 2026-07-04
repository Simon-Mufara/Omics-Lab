/* ═══════════════════════════════════════════════════════════════
   OmicsLab — Career Pathfinder (Prompt 4)
   Interactive career mapping for African genomics researchers.
   Quiz → personalised career path → skills gap analysis → resources.
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.Career = (function () {

  /* ─── Career paths ─── */
  const PATHS = {
    bioinformatician: {
      id: 'bioinformatician',
      title: 'Bioinformatician',
      icon: 'cpu',
      color: '#58a6ff',
      tagline: 'Develop pipelines, analyse multi-omics data, publish algorithms',
      demand: 'Very High',
      salaryRange: 'USD 25k–95k (Africa-wide)',
      employers: ['H3ABioNet', 'APCDR', 'KEMRI', 'UCT', 'Sanger Institute (remote)', 'Gates Foundation'],
      description: 'Bioinformaticians build and run computational pipelines that transform raw sequencing data into biological insight. You will work across WGS, RNA-seq, metagenomics, and single-cell data types.',
      skills: [
        { name: 'Linux / Bash scripting', level: 'Essential' },
        { name: 'Python or R programming', level: 'Essential' },
        { name: 'FASTQ QC (FastQC, MultiQC)', level: 'Essential' },
        { name: 'Read alignment (BWA, STAR, Bowtie2)', level: 'Essential' },
        { name: 'Variant calling (GATK, DeepVariant)', level: 'Intermediate' },
        { name: 'RNA-seq analysis (DESeq2, edgeR)', level: 'Intermediate' },
        { name: 'Snakemake / Nextflow workflows', level: 'Intermediate' },
        { name: 'HPC / cloud computing (AWS, SLURM)', level: 'Intermediate' },
        { name: 'Single-cell analysis (Seurat, Scanpy)', level: 'Advanced' },
        { name: 'Git / GitHub version control', level: 'Essential' },
      ],
      certifications: [
        { name: 'H3ABioNet Introduction to Bioinformatics', url: 'https://www.h3abionet.org/education-and-training' },
        { name: 'EMBL-EBI Bioinformatics Online Courses', url: 'https://www.ebi.ac.uk/training' },
        { name: 'Coursera Genomic Data Science Specialization', url: 'https://www.coursera.org/specializations/genomic-data-science' },
      ],
      steps: [
        'Complete an introductory programming course in Python or R',
        'Run your first FASTQ → BAM → VCF pipeline on public data',
        'Join H3ABioNet and attend their annual IBRO workshop',
        'Contribute to an open-source bioinformatics tool on GitHub',
        'Apply for APCDR or KEMRI Junior Bioinformatician position',
        'Publish a methods paper or pre-print on bioRxiv',
      ],
    },
    wet_lab_scientist: {
      id: 'wet_lab_scientist',
      title: 'Wet Lab Genomics Scientist',
      icon: 'flask',
      color: '#00C4A0',
      tagline: 'Extract DNA/RNA, build libraries, operate sequencers, interpret QC',
      demand: 'High',
      salaryRange: 'USD 15k–60k (Africa-wide)',
      employers: ['NICD South Africa', 'KEMRI', 'MRC Gambia', 'WACCBIP Ghana', 'ILRI', 'Africa CDC'],
      description: 'Wet lab scientists perform the hands-on molecular biology that generates sequencing data — from sample collection and nucleic acid extraction through library preparation and sequencer operation.',
      skills: [
        { name: 'DNA/RNA extraction (QIAGEN, magnetic beads)', level: 'Essential' },
        { name: 'PCR and quantitative RT-PCR', level: 'Essential' },
        { name: 'Library preparation (Nextera, NEBNext, ARTIC)', level: 'Essential' },
        { name: 'Illumina sequencer operation (MiSeq, NextSeq)', level: 'Essential' },
        { name: 'Nanopore sequencing (MinION, GridION)', level: 'Intermediate' },
        { name: 'FASTQ QC interpretation (Q-scores, coverage)', level: 'Intermediate' },
        { name: 'Gel electrophoresis and Bioanalyser', level: 'Essential' },
        { name: 'Biosafety level 2/3 laboratory practice', level: 'Essential' },
        { name: 'Cell culture and primary sample processing', level: 'Intermediate' },
        { name: 'GLP documentation and LIMS systems', level: 'Intermediate' },
      ],
      certifications: [
        { name: 'ILRI Africa Biosciences Wet Lab Training', url: 'https://www.ilri.org/training' },
        { name: 'Oxford Nanopore Technology Certified Training', url: 'https://nanoporetech.com/community/training' },
        { name: 'WHO Laboratory Biosafety Manual Certification', url: 'https://www.who.int/publications/i/item/9789240011311' },
      ],
      steps: [
        'Complete a BSc or MSc in Biochemistry, Molecular Biology, or Life Sciences',
        'Gain hands-on experience with DNA extraction and PCR in a teaching lab',
        'Train on one sequencing platform (Illumina MiSeq or Oxford Nanopore MinION)',
        'Attend an ARTIC Network workshop for pathogen sequencing',
        'Apply for a research assistant role at a genomics centre near you',
        'Work toward biosafety certification for higher containment work',
      ],
    },
    public_health_genomicist: {
      id: 'public_health_genomicist',
      title: 'Public Health Genomicist',
      icon: 'globe',
      color: '#f97316',
      tagline: 'Translate genomic surveillance into policy and outbreak response',
      demand: 'Very High (post-COVID surge)',
      salaryRange: 'USD 30k–110k (government + international orgs)',
      employers: ['Africa CDC', 'WHO AFRO', 'ECDC', 'CDC Africa', 'National Public Health Institutes', 'Global Fund'],
      description: 'Public health genomicists bridge the lab and policy worlds. You will lead genomic surveillance programmes, interpret pathogen phylogenetics for outbreak response, and communicate findings to governments and international agencies.',
      skills: [
        { name: 'Epidemiology fundamentals (R0, incubation, CFR)', level: 'Essential' },
        { name: 'Pathogen whole-genome sequencing', level: 'Essential' },
        { name: 'Phylogenetic analysis (IQ-TREE, BEAST, Nextstrain)', level: 'Intermediate' },
        { name: 'Outbreak investigation and cluster detection', level: 'Essential' },
        { name: 'R for epidemiological analysis (EpiEstim, incidence)', level: 'Intermediate' },
        { name: 'GISAID and SRA data submission', level: 'Intermediate' },
        { name: 'Risk communication and science writing', level: 'Essential' },
        { name: 'IHR (International Health Regulations) framework', level: 'Intermediate' },
        { name: 'One Health surveillance design', level: 'Advanced' },
        { name: 'Grant writing (NIH, Wellcome, Gates)', level: 'Intermediate' },
      ],
      certifications: [
        { name: 'Africa CDC RISLNET Genomics Surveillance Training', url: 'https://africacdc.org/disease-surveillance' },
        { name: 'WHO OpenWHO Genomics in Public Health', url: 'https://openwho.org' },
        { name: 'Johns Hopkins Bloomberg School of Public Health Epi Certificate', url: 'https://onlinelearning.jhsph.edu' },
      ],
      steps: [
        'Complete an MPH or equivalent public health qualification',
        'Get foundational genomics skills through H3ABioNet or EMBL-EBI courses',
        'Volunteer with your national public health institute during an outbreak',
        'Learn Nextstrain to build and interpret phylogeographic trees',
        'Publish a surveillance report in WHO Weekly Epidemiological Record or Eurosurveillance',
        'Apply for Africa CDC fellowships or WHO AFRO technical officer positions',
      ],
    },
    clinical_genomicist: {
      id: 'clinical_genomicist',
      title: 'Clinical Genomicist',
      icon: 'heart-pulse',
      color: '#bc8cff',
      tagline: 'Apply genomics to patient diagnosis, precision medicine, and pharmacogenomics',
      demand: 'High (growing rapidly)',
      salaryRange: 'USD 35k–120k (clinical + academic)',
      employers: ['Steve Biko Academic Hospital', 'KCMC Tanzania', 'Groote Schuur Hospital', 'UCT/WITS Medical School', 'NHLS South Africa', 'H3Africa network hospitals'],
      description: 'Clinical genomicists apply WGS, exome sequencing, and pharmacogenomics to patient care — diagnosing rare diseases, identifying cancer drivers, optimising drug dosing, and counselling families about inherited risk.',
      skills: [
        { name: 'Human genome variant interpretation (ACMG guidelines)', level: 'Essential' },
        { name: 'Exome / panel sequencing analysis', level: 'Essential' },
        { name: 'Pharmacogenomics (PGx) and drug-gene interactions', level: 'Intermediate' },
        { name: 'Cancer genomics (somatic mutations, CNV, fusion genes)', level: 'Intermediate' },
        { name: 'Genetic counselling communication skills', level: 'Essential' },
        { name: 'ClinVar, OMIM, gnomAD database curation', level: 'Essential' },
        { name: 'Rare disease differential diagnosis', level: 'Intermediate' },
        { name: 'CLIA/CAP laboratory accreditation standards', level: 'Intermediate' },
        { name: 'Electronic health record (EHR) integration', level: 'Intermediate' },
        { name: 'Research ethics and patient data governance', level: 'Essential' },
      ],
      certifications: [
        { name: 'ABMGG Board Certification (Clinical Molecular Genetics)', url: 'https://www.abmgg.org' },
        { name: 'H3Africa Data Governance and Ethics Training', url: 'https://www.h3africa.org/index.php/training' },
        { name: 'ESHG European Training in Genomics and Genomic Medicine', url: 'https://www.eshg.org/education' },
      ],
      steps: [
        'Complete an MBChB, MBBCh, or PhD in Human Genetics or Medical Genetics',
        'Rotate through a clinical genetics department at a teaching hospital',
        'Learn ACMG variant classification guidelines and practice on ClinVar cases',
        'Work on an H3Africa project involving patient WGS data',
        'Attend the African Society of Human Genetics annual conference',
        'Pursue subspecialty certification or fellowship in clinical genomics',
      ],
    },
    data_scientist: {
      id: 'data_scientist',
      title: 'Omics Data Scientist / ML Researcher',
      icon: 'bar-chart',
      color: '#e3b341',
      tagline: 'Build ML models for drug discovery, variant prioritisation, and omics integration',
      demand: 'High (strong industry pull)',
      salaryRange: 'USD 40k–150k (academia + industry)',
      employers: ['Insitro', 'Recursion Pharma', 'AstraZeneca Africa R&D', 'Google Health', 'Sanger Institute', 'Chan Zuckerberg Initiative'],
      description: 'Omics data scientists apply machine learning, deep learning, and statistical modelling to large-scale multi-omics datasets for drug target identification, patient stratification, and precision medicine.',
      skills: [
        { name: 'Python (numpy, pandas, scikit-learn, PyTorch)', level: 'Essential' },
        { name: 'Statistical machine learning (classification, regression, clustering)', level: 'Essential' },
        { name: 'Deep learning for genomics (CNN, transformers, graph NN)', level: 'Advanced' },
        { name: 'Multi-omics data integration (MOFA, DIABLO)', level: 'Advanced' },
        { name: 'Single-cell analysis (Seurat, Scanpy, scVI)', level: 'Intermediate' },
        { name: 'R for statistical genetics (PLINK, GCTA)', level: 'Intermediate' },
        { name: 'Cloud ML platforms (AWS SageMaker, Google Vertex AI)', level: 'Intermediate' },
        { name: 'GWAS and polygenic risk score modelling', level: 'Intermediate' },
        { name: 'Drug-target interaction prediction', level: 'Advanced' },
        { name: 'Reproducible research (Jupyter, Snakemake, containers)', level: 'Essential' },
      ],
      certifications: [
        { name: 'fast.ai Practical Deep Learning for Coders', url: 'https://www.fast.ai' },
        { name: 'Rosalind Bioinformatics Programming Challenges', url: 'https://rosalind.info' },
        { name: 'DeepMind / Google ML Crash Course', url: 'https://developers.google.com/machine-learning/crash-course' },
      ],
      steps: [
        'Master Python data science stack: numpy, pandas, matplotlib, scikit-learn',
        'Complete a genomics data analysis course (H3ABioNet, EMBL-EBI)',
        'Implement a published GWAS or RNA-seq analysis from scratch',
        'Enter a bioinformatics hackathon or Kaggle-style omics challenge',
        'Publish a tool or pre-print applying ML to a genomics problem',
        'Target industry ML roles at pharma companies with Africa R&D offices',
      ],
    },
  };

  /* ─── Quiz questions ─── */
  const QUESTIONS = [
    {
      id: 'q_role',
      text: 'What best describes your current background?',
      icon: 'award',
      options: [
        { val: 'lab', label: 'I work or study in a wet lab (bench work, experiments)' },
        { val: 'comp', label: 'I have a computational / IT background (coding, data analysis)' },
        { val: 'health', label: 'I have a public health or clinical background (medicine, epidemiology)' },
        { val: 'student', label: 'I\'m a student and still exploring my options' },
      ],
    },
    {
      id: 'q_passion',
      text: 'Which area excites you the most?',
      icon: 'flame',
      options: [
        { val: 'pipelines', label: 'Building computational pipelines and analysing big datasets' },
        { val: 'bench', label: 'Working with samples, instruments, and generating data in the lab' },
        { val: 'policy', label: 'Connecting genomic findings to public health decisions and policy' },
        { val: 'patients', label: 'Applying genomics to help patients — diagnosis and precision medicine' },
      ],
    },
    {
      id: 'q_skill_level',
      text: 'How would you rate your current genomics skills?',
      icon: 'trending-up',
      options: [
        { val: 'beginner', label: 'Beginner — just starting out, mostly self-study' },
        { val: 'some', label: 'Some experience — I\'ve run a few analyses or bench experiments' },
        { val: 'intermediate', label: 'Intermediate — I can work independently on standard tasks' },
        { val: 'advanced', label: 'Advanced — I lead projects and mentor others' },
      ],
    },
    {
      id: 'q_goal',
      text: 'What is your primary career goal?',
      icon: 'target',
      options: [
        { val: 'academia', label: 'Academic research — publish, lecture, supervise PhD students' },
        { val: 'industry', label: 'Industry or pharma — higher salary, product-driven work' },
        { val: 'public_service', label: 'Government or international organisations (WHO, Africa CDC, Gates Foundation)' },
        { val: 'hospital', label: 'Clinical work in a hospital or diagnostic lab' },
      ],
    },
    {
      id: 'q_africa',
      text: 'Which African challenge motivates you most?',
      icon: 'globe',
      options: [
        { val: 'infectious', label: 'Infectious disease surveillance and outbreak response' },
        { val: 'ncd', label: 'Non-communicable diseases — diabetes, hypertension, cancer in Africa' },
        { val: 'ag', label: 'Agricultural genomics — crop improvement, food security, livestock' },
        { val: 'equity', label: 'Genomic equity — ensuring African populations are represented in research' },
      ],
    },
  ];

  /* ─── Score map: [question][answer] → path score additions ─── */
  const SCORES = {
    q_role: {
      lab:     { wet_lab_scientist: 3, clinical_genomicist: 1 },
      comp:    { bioinformatician: 3, data_scientist: 2 },
      health:  { public_health_genomicist: 3, clinical_genomicist: 1 },
      student: { bioinformatician: 1, wet_lab_scientist: 1, public_health_genomicist: 1, clinical_genomicist: 1, data_scientist: 1 },
    },
    q_passion: {
      pipelines: { bioinformatician: 3, data_scientist: 2 },
      bench:     { wet_lab_scientist: 3 },
      policy:    { public_health_genomicist: 3 },
      patients:  { clinical_genomicist: 3, public_health_genomicist: 1 },
    },
    q_skill_level: {
      beginner:     { wet_lab_scientist: 1 },
      some:         { wet_lab_scientist: 1, bioinformatician: 1 },
      intermediate: { bioinformatician: 1, public_health_genomicist: 1 },
      advanced:     { data_scientist: 1, clinical_genomicist: 1 },
    },
    q_goal: {
      academia:       { bioinformatician: 2, data_scientist: 1 },
      industry:       { data_scientist: 3, bioinformatician: 1 },
      public_service: { public_health_genomicist: 3 },
      hospital:       { clinical_genomicist: 3 },
    },
    q_africa: {
      infectious: { public_health_genomicist: 2, wet_lab_scientist: 1 },
      ncd:        { clinical_genomicist: 2, data_scientist: 1 },
      ag:         { bioinformatician: 1, wet_lab_scientist: 1 },
      equity:     { public_health_genomicist: 1, data_scientist: 1, bioinformatician: 1 },
    },
  };

  /* ─── State ─── */
  let _answers = {};
  let _currentQ = 0;
  let _result = null;

  /* ─── Init ─── */
  function init() {
    const section = document.getElementById('career-section');
    if (!section || section.dataset.cpReady) return;
    section.dataset.cpReady = '1';
    _render(section);
  }

  /* ─── Render shell ─── */
  function _render(section) {
    section.innerHTML = `
      <div class="cp-wrap">
        <div class="cp-header">
          <div>
            <div class="cp-badge">CAREER PATHFINDER</div>
            <h2 class="cp-title">Find Your Path in African Genomics</h2>
            <p class="cp-subtitle">Answer 5 questions and get a personalised career roadmap — skills to build, certifications to earn, and employers to target across Africa.</p>
          </div>
          <div class="cp-stats-row">
            ${Object.values(PATHS).map(p => `
              <div class="cp-path-pill" style="--cp-color:${p.color}">
                <span>${OmicsLab.Icons?.svg(p.icon, 14) || ''}</span>
                <span>${p.title.split(' ')[0]}</span>
              </div>`).join('')}
          </div>
        </div>
        <div id="cp-body"></div>
      </div>`;
    _renderQuiz();
  }

  /* ─── Render quiz ─── */
  function _renderQuiz() {
    const body = document.getElementById('cp-body');
    if (!body) return;

    if (_currentQ >= QUESTIONS.length) {
      _computeResult();
      _renderResult();
      return;
    }

    const q = QUESTIONS[_currentQ];
    const progress = ((_currentQ) / QUESTIONS.length) * 100;

    body.innerHTML = `
      <div class="cp-quiz">
        <div class="cp-progress-wrap">
          <div class="cp-progress-bar"><div class="cp-progress-fill" style="width:${progress}%"></div></div>
          <span class="cp-progress-label">Question ${_currentQ + 1} of ${QUESTIONS.length}</span>
        </div>
        <div class="cp-question-card">
          <div class="cp-q-icon">${OmicsLab.Icons?.svg(q.icon, 28) || ''}</div>
          <div class="cp-q-text">${q.text}</div>
          <div class="cp-q-options">
            ${q.options.map(opt => `
              <button class="cp-option${_answers[q.id] === opt.val ? ' selected' : ''}"
                      onclick="OmicsLab.Career._pick('${q.id}','${opt.val}')">
                <span class="cp-opt-radio"></span>
                <span class="cp-opt-label">${opt.label}</span>
              </button>`).join('')}
          </div>
          <div class="cp-q-nav">
            <button class="cp-btn-back" onclick="OmicsLab.Career._back()"
                    ${_currentQ === 0 ? 'style="visibility:hidden"' : ''}>← Back</button>
            <button class="cp-btn-next" id="cp-next"
                    onclick="OmicsLab.Career._next()"
                    ${!_answers[q.id] ? 'disabled' : ''}>
              ${_currentQ < QUESTIONS.length - 1 ? 'Next →' : 'See my career path →'}
            </button>
          </div>
        </div>
      </div>`;
  }

  function _pick(qId, val) {
    _answers[qId] = val;
    /* Update option highlight */
    document.querySelectorAll('.cp-option').forEach(btn => btn.classList.remove('selected'));
    const opts = document.querySelectorAll('.cp-option');
    const q = QUESTIONS.find(q => q.id === qId);
    if (q) {
      const idx = q.options.findIndex(o => o.val === val);
      if (idx >= 0 && opts[idx]) opts[idx].classList.add('selected');
    }
    const nextBtn = document.getElementById('cp-next');
    if (nextBtn) nextBtn.disabled = false;
  }

  function _next() {
    const q = QUESTIONS[_currentQ];
    if (!_answers[q.id]) return;
    _currentQ++;
    _renderQuiz();
  }

  function _back() {
    if (_currentQ > 0) {
      _currentQ--;
      _renderQuiz();
    }
  }

  /* ─── Score and pick best path ─── */
  function _computeResult() {
    const totals = {};
    Object.keys(PATHS).forEach(p => { totals[p] = 0; });

    Object.entries(_answers).forEach(([qId, val]) => {
      const scoreMap = SCORES[qId]?.[val] || {};
      Object.entries(scoreMap).forEach(([path, pts]) => {
        totals[path] = (totals[path] || 0) + pts;
      });
    });

    const sorted = Object.entries(totals).sort((a, b) => b[1] - a[1]);
    _result = {
      primary: PATHS[sorted[0][0]],
      secondary: PATHS[sorted[1][0]],
      tertiary: PATHS[sorted[2][0]],
      scores: totals,
    };
  }

  /* ─── Render result ─── */
  function _renderResult() {
    const body = document.getElementById('cp-body');
    if (!body || !_result) return;
    const p = _result.primary;
    const maxScore = Math.max(...Object.values(_result.scores));

    body.innerHTML = `
      <div class="cp-result">
        <div class="cp-result-hero" style="--cp-color:${p.color}">
          <div class="cp-result-icon">${OmicsLab.Icons?.svg(p.icon, 36) || ''}</div>
          <div>
            <div class="cp-result-match">Your best match</div>
            <h3 class="cp-result-title">${p.title}</h3>
            <p class="cp-result-tagline">${p.tagline}</p>
          </div>
          <button class="cp-retry-btn" onclick="OmicsLab.Career._reset()">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
            Retake
          </button>
        </div>

        <!-- Score bars for all paths -->
        <div class="cp-score-section">
          <div class="cp-section-label">Fit score by career path</div>
          <div class="cp-score-bars">
            ${Object.entries(_result.scores).sort((a,b) => b[1]-a[1]).map(([id, score]) => {
              const path = PATHS[id];
              const pct = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
              return `<div class="cp-score-row">
                <span class="cp-score-icon">${OmicsLab.Icons?.svg(path.icon, 16) || ''}</span>
                <span class="cp-score-name">${path.title}</span>
                <div class="cp-score-bar-wrap">
                  <div class="cp-score-bar-fill" style="width:${pct}%;background:${path.color}"></div>
                </div>
                <span class="cp-score-pct">${pct}%</span>
              </div>`;
            }).join('')}
          </div>
        </div>

        <!-- Two-column: details + skills -->
        <div class="cp-details-grid">

          <!-- Left: overview + steps -->
          <div class="cp-details-left">
            <div class="cp-detail-card">
              <div class="cp-section-label">About this career</div>
              <p class="cp-detail-desc">${p.description}</p>
              <div class="cp-quick-stats">
                <div class="cp-qs-item">
                  <span class="cp-qs-label">Demand</span>
                  <span class="cp-qs-val" style="color:${p.color}">${p.demand}</span>
                </div>
                <div class="cp-qs-item">
                  <span class="cp-qs-label">Salary Range</span>
                  <span class="cp-qs-val">${p.salaryRange}</span>
                </div>
              </div>
              <div class="cp-employers">
                <div class="cp-section-label" style="margin-bottom:0.5rem">Typical employers in Africa</div>
                <div class="cp-emp-chips">
                  ${p.employers.map(e => `<span class="cp-emp-chip">${e}</span>`).join('')}
                </div>
              </div>
            </div>

            <div class="cp-detail-card">
              <div class="cp-section-label">Your 6-step roadmap</div>
              <div class="cp-steps">
                ${p.steps.map((s, i) => `
                  <div class="cp-step">
                    <div class="cp-step-num" style="background:rgba(${_hexToRgb(p.color)},0.12);color:${p.color}">${i+1}</div>
                    <div class="cp-step-text">${s}</div>
                  </div>`).join('')}
              </div>
            </div>
          </div>

          <!-- Right: skills gap + certifications -->
          <div class="cp-details-right">
            <div class="cp-detail-card">
              <div class="cp-section-label">Skills to build</div>
              <div class="cp-skills-list">
                ${p.skills.map(s => `
                  <div class="cp-skill-row">
                    <div class="cp-skill-info">
                      <span class="cp-skill-name">${s.name}</span>
                      <span class="cp-skill-level cp-level-${s.level.toLowerCase().replace(' ','')}">${s.level}</span>
                    </div>
                    <div class="cp-skill-bar-wrap">
                      <div class="cp-skill-bar-fill" style="width:${s.level==='Essential'?100:s.level==='Intermediate'?65:35}%;background:${p.color}"></div>
                    </div>
                  </div>`).join('')}
              </div>
            </div>

            <div class="cp-detail-card">
              <div class="cp-section-label">Recommended certifications</div>
              <div class="cp-cert-list">
                ${p.certifications.map(c => `
                  <a class="cp-cert-item" href="${c.url}" target="_blank" rel="noopener noreferrer">
                    <svg class="cp-cert-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M6 20v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/><path d="M9 11l.5 2L12 16l2.5-3 .5-2"/></svg>
                    <span>${c.name}</span>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="cp-cert-arrow" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                  </a>`).join('')}
              </div>
            </div>

            <div class="cp-detail-card">
              <div class="cp-section-label">Also consider</div>
              <div class="cp-also-list">
                ${[_result.secondary, _result.tertiary].map(alt => `
                  <button class="cp-also-card" onclick="OmicsLab.Career._viewPath('${alt.id}')"
                          style="--cp-color:${alt.color}">
                    <span class="cp-also-icon">${OmicsLab.Icons?.svg(alt.icon, 20) || ''}</span>
                    <div>
                      <div class="cp-also-title">${alt.title}</div>
                      <div class="cp-also-tagline">${alt.tagline}</div>
                    </div>
                  </button>`).join('')}
              </div>
            </div>
          </div>
        </div>
      </div>`;
  }

  function _hexToRgb(hex) {
    const r = parseInt(hex.slice(1,3), 16);
    const g = parseInt(hex.slice(3,5), 16);
    const b = parseInt(hex.slice(5,7), 16);
    return `${r},${g},${b}`;
  }

  function _reset() {
    _answers = {};
    _currentQ = 0;
    _result = null;
    _renderQuiz();
  }

  function _viewPath(id) {
    /* Temporarily override primary with clicked path and re-render */
    const orig = _result.primary;
    _result.primary = PATHS[id];
    _renderResult();
    _result.primary = orig; /* restore so retake still uses real scores */
  }

  return { init, _pick, _next, _back, _reset, _viewPath };
})();
