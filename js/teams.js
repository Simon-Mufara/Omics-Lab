/* ═══════════════════════════════════════════════════════════════
   OmicsLab Teams — Research Meeting & Collaboration Platform
   ─ Meeting rooms, video/audio, screen sharing, in-call chat
   ─ Graceful microphone/camera permission error handling
   ─ BroadcastChannel signaling for same-device multi-tab testing
   ─ Designed to plug into WebSocket signaling backend (see spec)
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.Teams = (function () {

  const STORE = 'omicslab_teams_v1';

  /* ─── Seed rooms ─── */
  const SEED_ROOMS = [
    { id: 'rm-genomics',   name: 'African Genomics Lab Meeting', icon: 'dna', color: '#3fb950', desc: 'Weekly WGS pipeline review and data governance updates', scheduled: 'Mondays 10:00 WAT', participants: 4, locked: false },
    { id: 'rm-outbreak',   name: 'Outbreak Response Coordination', icon: 'alert-triangle', color: '#ff6b6b', desc: 'Real-time outbreak genomics coordination across APSED/WHO nodes', scheduled: 'On demand', participants: 7, locked: false },
    { id: 'rm-h3africa',   name: 'H3Africa Consortium Call', icon: 'globe', color: '#f97316', desc: 'Consortium-wide biannual review — data governance, ethics, publications', scheduled: 'Biannual', participants: 12, locked: true },
    { id: 'rm-training',   name: 'Bioinformatics Training Room', icon: 'book-open', color: '#58a6ff', desc: 'Live hands-on training sessions and student office hours', scheduled: 'Thursdays 14:00 EAT', participants: 0, locked: false },
    { id: 'rm-journal',    name: 'Journal Club',                 icon: 'file-text', color: '#bc8cff', desc: 'Weekly paper discussion — African genomics, outbreak genomics, methods', scheduled: 'Fridays 15:00 SAST', participants: 3, locked: false },
  ];

  /* ─── State ─── */
  let _rooms     = [];
  let _inMeeting = false;
  let _roomId    = null;
  let _stream    = null;     // local MediaStream
  let _screen    = null;     // screen share stream
  let _muted     = false;
  let _camOff    = false;
  let _handRaised = false;
  let _chatMessages = [];
  let _channel   = null;     // BroadcastChannel for same-device testing
  let _peers     = [];       // connected peer display names

  /* ─── Storage ─── */
  function _load() {
    try {
      const raw = localStorage.getItem(STORE);
      if (raw) {
        const s = JSON.parse(raw);
        _rooms = s.rooms || SEED_ROOMS;
        return;
      }
    } catch {}
    _rooms = SEED_ROOMS.map(r => ({ ...r }));
    _save();
  }

  function _save() {
    try { localStorage.setItem(STORE, JSON.stringify({ rooms: _rooms })); } catch {}
  }

  /* ──────────────────────────────────────────────────────────────
     Media permission handling — central helper used by all calls
     Returns { stream, audioOnly, denied, error }
     ────────────────────────────────────────────────────────────── */
  async function _requestMedia(wantVideo = true, wantAudio = true) {
    /* First: enumerate devices to understand what's available */
    let hasVideo = false, hasAudio = false;
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      hasVideo = devices.some(d => d.kind === 'videoinput');
      hasAudio = devices.some(d => d.kind === 'audioinput');
    } catch {}

    /* Attempt with both video+audio */
    if (wantVideo && hasVideo && wantAudio && hasAudio) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 360, facingMode: 'user' }, audio: { echoCancellation: true, noiseSuppression: true } });
        return { stream, audioOnly: false, denied: false };
      } catch (err) {
        if (_isDenied(err)) return { stream: null, denied: true, reason: 'both', err };
      }
    }

    /* Fallback: audio only */
    if (wantAudio && hasAudio) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
        return { stream, audioOnly: true, denied: false };
      } catch (err) {
        if (_isDenied(err)) return { stream: null, denied: true, reason: 'audio', err };
      }
    }

    /* No device available */
    if (!hasAudio && !hasVideo) return { stream: null, denied: false, noDevice: true };

    return { stream: null, denied: false, error: 'Could not access media devices' };
  }

  function _isDenied(err) {
    return err && (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError' ||
      err.name === 'SecurityError' || (err.message && err.message.toLowerCase().includes('denied')));
  }

  /* ══════════════════════════════════════════════════════════
     ARTICLE ANALYSER
     ══════════════════════════════════════════════════════════ */

  const ART_STORE = 'omicslab_article_v1';

  /* Knowledge bases for pattern matching */
  const _studyTypes = [
    { label:'Genome-Wide Association Study (GWAS)',      patterns:['gwas','genome-wide association','association study'] },
    { label:'Whole Genome Sequencing (WGS)',             patterns:['whole genome sequencing','wgs','whole-genome'] },
    { label:'RNA-sequencing / Transcriptomics',          patterns:['rna-seq','rna sequencing','transcriptom','rnaseq','deseq','edger','star aligner'] },
    { label:'Metagenomics',                              patterns:['metagenom','16s rrna','amplicon sequencing','kraken','metaphlan','shotgun sequencing'] },
    { label:'Phylogenetics / Phylogenomics',             patterns:['phylogen','phylogram','maximum likelihood','bayesian phylo','iq-tree','raxml','beast'] },
    { label:'Variant Calling / Population Genomics',     patterns:['variant call','snp','indel','gatk','haplotypecaller','freebayes','population genomics','vcf'] },
    { label:'ChIP-seq / Epigenomics',                   patterns:['chip-seq','atac-seq','epigenom','histone','methylation','bisulfite'] },
    { label:'Single-cell RNA-seq (scRNA-seq)',           patterns:['single-cell','scrna','10x genomics','seurat','scanpy','cell ranger'] },
    { label:'Proteomics / Mass Spectrometry',            patterns:['proteom','mass spectrometry','maxquant','perseus','tandem mass'] },
    { label:'Randomised Controlled Trial (RCT)',         patterns:['randomized controlled trial','randomised controlled','rct','placebo-controlled','double-blind','clinical trial'] },
    { label:'Cohort Study',                              patterns:['cohort study','prospective cohort','retrospective cohort','follow-up study'] },
    { label:'Systematic Review / Meta-analysis',         patterns:['systematic review','meta-analysis','forest plot','funnel plot','cochrane','prisma'] },
    { label:'Case-Control Study',                        patterns:['case-control','case control','matched controls','odds ratio'] },
    { label:'Protein Structure / AlphaFold',             patterns:['alphafold','protein structure','cryo-em','x-ray crystallography','homology modelling','molecular docking'] },
  ];

  const _tools = [
    'GATK','BWA','BWA-MEM2','STAR','HISAT2','DESeq2','edgeR','limma','Samtools','Picard',
    'Trimmomatic','fastp','FastQC','MultiQC','PLINK','ADMIXTURE','STRUCTURE','EIGENSOFT',
    'IQ-TREE','RAxML','BEAST','PhyML','Bowtie2','minimap2','Kraken2','MetaPhlAn',
    'MaxQuant','Perseus','Seurat','Scanpy','Monocle','Harmony','MACS2','Homer',
    'VEP','SnpEff','CADD','gnomAD','ClinVar','dbSNP','Ensembl','UCSC Genome Browser',
    'AlphaFold','Pymol','Chimera','AutoDock','Rosetta','R','Python','Snakemake','Nextflow',
    'Docker','Singularity','Galaxy','Bioconductor','Conda','Jupyter'
  ];

  const _africaCountries = [
    'Nigeria','Kenya','South Africa','Ethiopia','Ghana','Uganda','Tanzania','Zimbabwe','Zambia',
    'Cameroon','Senegal','Côte d\'Ivoire','Rwanda','Mozambique','Malawi','Botswana','Namibia',
    'Egypt','Morocco','Tunisia','Algeria','Sudan','DRC','Congo','Angola','Madagascar',
    'Mali','Burkina Faso','Niger','Togo','Benin','Guinea','Sierra Leone','Liberia','Gambia',
    'Eswatini','Lesotho','Gabon','Equatorial Guinea','Djibouti','Eritrea','Somalia','Comoros'
  ];

  const _africaPopulations = [
    'Yoruba','Bantu','Nilotic','Khoisan','Berber','Hausa','Igbo','Zulu','Xhosa','Ndebele',
    'Amhara','Oromo','Somali','Wolof','Akan','Igbo','Fula','Mandinka','Ashanti',
    'H3Africa','AWI-Gen','AGVP','1000 Genomes Africa','MalariaGEN'
  ];

  const _africaDiseases = [
    'malaria','tuberculosis','TB','HIV','AIDS','sickle cell','schistosomiasis','trypanosomiasis',
    'leishmaniasis','cholera','Ebola','Marburg','COVID','monkeypox','yellow fever','dengue',
    'lassa fever','meningitis','typhoid','sleeping sickness','river blindness','onchocerciasis'
  ];

  function _lower(t) { return (t || '').toLowerCase(); }

  function _detectStudyType(text) {
    const t = _lower(text);
    const found = [];
    for (const s of _studyTypes) {
      if (s.patterns.some(p => t.includes(p))) found.push(s.label);
    }
    return found.length ? found : ['Observational/descriptive study'];
  }

  function _detectTools(text) {
    const t = _lower(text);
    return _tools.filter(tool => t.includes(_lower(tool)));
  }

  function _detectAfrica(text) {
    const t = _lower(text);
    return {
      countries:   _africaCountries.filter(c => t.includes(_lower(c))),
      populations: _africaPopulations.filter(p => t.includes(_lower(p))),
      diseases:    _africaDiseases.filter(d => t.includes(d)),
    };
  }

  function _extractFindings(text) {
    const sentences = text.replace(/\n+/g, ' ').split(/[.!?]+/);
    const markers = ['we found','we identified','we report','our results show','our analysis','we demonstrate',
                     'was associated','were associated','significantly','revealed that','showed that',
                     'demonstrated that','concluded that','we observed','our study'];
    const hits = sentences.filter(s => {
      const sl = _lower(s);
      return markers.some(m => sl.includes(m)) && s.trim().length > 40;
    });
    return hits.slice(0, 4).map(s => s.trim());
  }

  function _extractSearchTerms(text, types, tools, africa) {
    const terms = new Set();
    types.forEach(t => {
      const short = t.replace(/\s*\([^)]+\)/,'').trim();
      terms.add(short);
    });
    tools.slice(0,5).forEach(t => terms.add(t));
    africa.diseases.slice(0,3).forEach(d => terms.add(d));
    africa.countries.slice(0,3).forEach(c => terms.add(c + ' genomics'));
    const keywords = ['genomics','bioinformatics','Africa','H3Africa','population genetics'];
    const t = _lower(text);
    keywords.forEach(k => { if (t.includes(_lower(k))) terms.add(k); });
    return [...terms].slice(0, 10);
  }

  function _buildReproGuide(types, tools, africa) {
    const steps = [];
    const t = types[0] || '';
    const hasWGS    = types.some(x => x.includes('WGS') || x.includes('Variant'));
    const hasRNA    = types.some(x => x.includes('RNA'));
    const hasGWAS   = types.some(x => x.includes('GWAS'));
    const hasMeta   = types.some(x => x.includes('Metagenom'));
    const hasPhylo  = types.some(x => x.includes('Phylo'));
    const hasSingle = types.some(x => x.includes('single-cell') || x.includes('scRNA'));
    const hasClinical = types.some(x => x.includes('RCT') || x.includes('Cohort') || x.includes('Case-Control'));

    steps.push('Obtain ethics clearance from your institutional review board (IRB) for human genomics data');

    if (hasGWAS || hasWGS) {
      steps.push('Download reference genome (GRCh38/hg38) from NCBI or Ensembl using wget/Aspera');
      steps.push('Request raw FASTQ data from SRA/ENA using SRA Toolkit: ' + (tools.includes('SRA Toolkit') ? 'SRA Toolkit' : 'prefetch + fasterq-dump'));
      steps.push('Quality control reads with FastQC + MultiQC; trim adapters with fastp or Trimmomatic');
      steps.push('Align to reference with ' + (tools.includes('BWA-MEM2') ? 'BWA-MEM2' : tools.includes('BWA') ? 'BWA' : 'BWA-MEM2') + '; sort and mark duplicates with Picard/Samtools');
      if (hasWGS) steps.push('Call variants using GATK HaplotypeCaller → GenotypeGVCFs → VQSR filtering pipeline');
      if (hasGWAS) steps.push('Perform quality control in PLINK: filter by MAF > 1%, genotyping rate > 95%, HWE p > 1e-6');
      if (hasGWAS) steps.push('Run population stratification with ADMIXTURE or PCA (EIGENSOFT/PLINK --pca)');
      if (hasGWAS) steps.push('Association testing: PLINK logistic/linear regression or SAIGE for mixed models');
    }
    if (hasRNA) {
      steps.push('Quality control: FastQC, MultiQC, remove adapters with fastp (--detect_adapter_for_pe)');
      steps.push('Align with STAR (splice-aware) or HISAT2; generate count matrix with featureCounts or HTSeq');
      steps.push('Differential expression: DESeq2 (Bioconductor) with design formula accounting for batch effects');
      steps.push('Functional enrichment: clusterProfiler (GO terms, KEGG pathways); pathway visualisation with pathview');
    }
    if (hasMeta) {
      steps.push('Taxonomic classification with Kraken2 (k-mer-based) or MetaPhlAn4 (marker genes)');
      steps.push('Estimate alpha diversity (Shannon index) and beta diversity (Bray-Curtis) using phyloseq in R');
      steps.push('Functional prediction with HUMAnN3 or PICRUSt2 for pathway analysis');
    }
    if (hasPhylo) {
      steps.push('Generate multiple sequence alignment using MAFFT or MUSCLE');
      steps.push('Select substitution model using ModelTest-NG; construct ML tree with IQ-TREE2 (--bb 1000 ultrafast bootstrap)');
      steps.push('Temporal analysis with BEAST2 if time-calibrated tree is needed (requires dated sequences)');
    }
    if (hasSingle) {
      steps.push('Pre-process FASTQ with Cell Ranger (10x data) or STARsolo to generate count matrix');
      steps.push('Load into Seurat or Scanpy; filter low-quality cells (nFeature, mitochondrial %)');
      steps.push('Normalise, scale, and cluster; assign cell types using known marker genes or SingleR');
    }
    if (hasClinical) {
      steps.push('Register the study on a clinical trials registry (ClinicalTrials.gov or PACTR for African trials)');
      steps.push('Obtain IRB approval at each participating site; document consent procedures');
      steps.push('Randomisation: use sealed envelopes or a web-based randomisation service');
      steps.push('Define primary and secondary endpoints a priori; calculate sample size using G*Power');
      steps.push('Statistical analysis plan: pre-register before unblinding; use intention-to-treat analysis');
    }

    steps.push('Document all software versions (conda list --export or sessionInfo() in R) for reproducibility');
    steps.push('Archive analysis scripts on GitHub/GitLab; deposit raw data in SRA/ENA/DDBJ or H3Africa repository');
    steps.push('Report following ARRIVE, STROBE, CONSORT, or MIAME guidelines as appropriate');

    return steps;
  }

  function _buildResearchOpportunities(types, tools, africa, text) {
    const ideas = [];
    const hasAfrica = africa.countries.length > 0 || africa.populations.length > 0;
    const hasDisease = africa.diseases.length > 0;
    const t = _lower(text);
    const disease = africa.diseases[0] || 'the condition studied';
    const country = africa.countries[0] || 'sub-Saharan Africa';

    if (types.some(x => x.includes('GWAS'))) {
      ideas.push({
        title: 'Trans-ethnic replication in diverse African populations',
        desc: `Replicate the lead GWAS signals across distinct African ethnic groups (Yoruba, Bantu, Nilotic, Khoisan) to assess which associations are pan-African vs population-specific. Use H3Africa cohort data or AWI-Gen.`,
        tools: ['SAIGE','PLINK2','METAL (meta-analysis)'],
      });
    }
    if (types.some(x => x.includes('WGS') || x.includes('Variant'))) {
      ideas.push({
        title: 'African variant database contribution',
        desc: `Annotate identified variants against the gnomAD African subset and H3Africa Variant Database. Variants absent from reference panels could represent novel Africa-specific risk alleles for ${disease}.`,
        tools: ['VEP','SnpEff','gnomAD','H3Africa Variant DB'],
      });
    }
    if (hasDisease) {
      ideas.push({
        title: `Multi-omics characterisation of ${disease} in ${country}`,
        desc: `Integrate WGS (host genetics), RNA-seq (transcriptomics), and pathogen WGS to build a complete picture of host-pathogen interaction in ${country}. This supports the development of Africa-specific diagnostic and therapeutic targets.`,
        tools: ['GATK','DESeq2','STAR','mixOmics'],
      });
      ideas.push({
        title: `Antimicrobial resistance genomics for ${disease} in East/West Africa`,
        desc: `Conduct whole-genome sequencing of ${disease} isolates from multiple African sites to map resistance mutations. Build a continental resistance surveillance platform using MLST and phylogeography.`,
        tools: ['Kraken2','ResFinder','MLST','IQ-TREE'],
      });
    }
    if (types.some(x => x.includes('Phylo'))) {
      ideas.push({
        title: 'Bayesian time-resolved phylogeographic analysis across Africa',
        desc: `Extend the phylogenetic analysis with BEAST2 to estimate divergence times and geographic spread patterns across African regions. Incorporate epidemiological metadata (sampling date, location) for phylogeographic inference.`,
        tools: ['BEAST2','TREEANNOTATOR','FigTree','SPREAD'],
      });
    }
    if (types.some(x => x.includes('RNA'))) {
      ideas.push({
        title: 'Single-cell transcriptomics to resolve cell-type-specific expression',
        desc: `Use scRNA-seq (10x Chromium) to deconvolve the bulk RNA-seq signal into cell-type-specific expression patterns. This could reveal which immune cell types drive the differential expression observed in this study.`,
        tools: ['Cell Ranger','Seurat','Harmony','SingleR'],
      });
    }
    ideas.push({
      title: 'Health equity analysis: access to genomic medicine in low-resource settings',
      desc: `Design a systematic review examining how the findings from this study could be translated into diagnostics or interventions deliverable in sub-Saharan African health systems. Include cost-effectiveness modelling.`,
      tools: ['R (meta-analysis)','GRADE framework','TreeAge (cost-effectiveness)'],
    });

    return ideas.slice(0, 5);
  }

  function _buildThesisOutline(types, tools, africa, findings) {
    const studyType = types[0] || 'genomic study';
    const disease = africa.diseases[0] || 'the study condition';
    const region = africa.countries.length ? africa.countries.slice(0,2).join(' and ') : 'Africa';

    return [
      {
        num: 1,
        title: 'Introduction and Literature Review',
        content: [
          `Background on ${disease} in ${region}: burden of disease, current management, knowledge gaps`,
          `Review of genomic epidemiology methods, with emphasis on ${studyType}`,
          'State of genomics infrastructure and data availability in African research settings',
          'Rationale and objectives: how this paper shapes your research questions',
          'Thesis aims and specific objectives (SMART format)',
        ],
      },
      {
        num: 2,
        title: 'Materials and Methods',
        content: [
          `Study design, population, inclusion/exclusion criteria (adapted from or contrasted with the source paper)`,
          tools.length ? `Bioinformatics pipeline: ${tools.slice(0,5).join(', ')} — justify each tool selection` : 'Software and statistical analysis plan',
          'Ethics: IRB approval, community engagement, data sovereignty considerations',
          'Sample size calculation and power analysis',
          'Quality control criteria and reproducibility measures',
        ],
      },
      {
        num: 3,
        title: 'Results',
        content: [
          'Cohort/sample characteristics: tables and demographic breakdown by region or population',
          findings.length ? `Key finding replication/extension: ${findings[0]?.slice(0,80)}…` : 'Primary analysis results with effect sizes and confidence intervals',
          'Secondary analyses: subgroup breakdowns, sensitivity analyses',
          'Visualisations: Manhattan plots / volcano plots / phylogenetic trees / heatmaps',
        ],
      },
      {
        num: 4,
        title: 'Discussion',
        content: [
          'Interpretation of findings in the context of the source paper and existing African genomics literature',
          'Novel contributions specific to your population/region',
          'Limitations: missing data, sample size, potential confounders, reference panel gaps',
          'Implications for clinical practice and public health policy in Africa',
          'Future directions: follow-up studies you propose',
        ],
      },
      {
        num: 5,
        title: 'Conclusion and Recommendations',
        content: [
          'Summary of key findings and their significance',
          'Recommendations for health policy, clinical guidelines, or further research',
          'Contribution to Africa-led genomics knowledge',
          'Dissemination plan: publications, conferences (H3Africa Congress, ESHG, ASHG), community feedback',
        ],
      },
    ];
  }

  /* ─── HTML for Article Hub tab ─── */
  function _renderArticleHubHtml() {
    const saved = (() => { try { return JSON.parse(localStorage.getItem(ART_STORE) || 'null'); } catch { return null; } })();
    return `
      <div class="art-hub">
        <div class="art-input-panel">
          <div class="art-panel-header">
            <div class="art-panel-title">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
              Research Article Input
            </div>
            <div class="art-panel-sub">Paste article text, abstract, or upload a .txt file — get full research analysis instantly</div>
          </div>

          <div class="art-tabs">
            <button class="art-input-tab art-input-tab-active" id="art-tab-paste" onclick="OmicsLab.Teams._artTab('paste')">Paste text</button>
            <button class="art-input-tab" id="art-tab-file"  onclick="OmicsLab.Teams._artTab('file')">Upload file</button>
          </div>

          <div id="art-paste-panel" class="art-input-section">
            <textarea class="art-textarea" id="art-text-input"
              placeholder="Paste the full article text, abstract, or a key excerpt here.&#10;&#10;The analyser will detect the study type, methodology tools, Africa relevance, reproducibility steps, research opportunities, and thesis outline — all offline, no data leaves your device."
              spellcheck="false">${saved?.text || ''}</textarea>
          </div>

          <div id="art-file-panel" class="art-input-section" style="display:none">
            <div class="art-drop-zone" id="art-drop-zone"
              onclick="document.getElementById('art-file-input').click()"
              ondragover="event.preventDefault();this.classList.add('art-drop-hover')"
              ondragleave="this.classList.remove('art-drop-hover')"
              ondrop="OmicsLab.Teams._artDrop(event)">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#8b949e" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              <div class="art-drop-label">Click to browse or drag a file here</div>
              <div class="art-drop-sub">.txt · .md · .csv — max 2 MB · PDF: copy-paste text instead</div>
              <input type="file" id="art-file-input" accept=".txt,.md,.csv,.text" style="display:none"
                onchange="OmicsLab.Teams._artFileRead(this.files[0])"/>
            </div>
            <div id="art-file-status" class="art-file-status" style="display:none"></div>
          </div>

          <div class="art-input-footer">
            <div class="art-char-count"><span id="art-char-count">0</span> characters</div>
            <div class="art-input-actions">
              <button class="tm-btn-secondary" onclick="OmicsLab.Teams._artClear()">Clear</button>
              <button class="tm-btn-primary" onclick="OmicsLab.Teams._artAnalyse()">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                Analyse article
              </button>
            </div>
          </div>
        </div>

        <div class="art-result-panel" id="art-result-panel">
          ${saved?.result ? saved.result : `
            <div class="art-empty-state">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#484f58" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
              <div class="art-empty-title">Article analysis will appear here</div>
              <div class="art-empty-sub">Paste any research article — abstract, full text, or excerpt — to get study type detection, reproducibility steps, research opportunities, and a thesis outline.</div>
            </div>`}
        </div>
      </div>`;
  }

  function _bindArticleHub() {
    const ta = document.getElementById('art-text-input');
    if (ta) {
      ta.addEventListener('input', () => {
        const n = document.getElementById('art-char-count');
        if (n) n.textContent = ta.value.length.toLocaleString();
      });
      const n = document.getElementById('art-char-count');
      if (n) n.textContent = (ta.value || '').length.toLocaleString();
    }
  }

  function _artTab(tab) {
    document.getElementById('art-paste-panel').style.display = tab === 'paste' ? '' : 'none';
    document.getElementById('art-file-panel').style.display  = tab === 'file'  ? '' : 'none';
    document.getElementById('art-tab-paste').classList.toggle('art-input-tab-active', tab === 'paste');
    document.getElementById('art-tab-file').classList.toggle('art-input-tab-active',  tab === 'file');
  }

  function _artFileRead(file) {
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { alert('File too large — max 2 MB. For PDF: copy-paste the text instead.'); return; }
    const status = document.getElementById('art-file-status');
    if (status) { status.style.display = ''; status.textContent = 'Reading ' + file.name + '…'; }
    const reader = new FileReader();
    reader.onload = e => {
      const text = e.target.result;
      const ta = document.getElementById('art-text-input');
      if (ta) ta.value = text;
      _artTab('paste');
      const n = document.getElementById('art-char-count');
      if (n) n.textContent = text.length.toLocaleString();
    };
    reader.onerror = () => { if (status) status.textContent = 'Could not read file.'; };
    reader.readAsText(file);
  }

  function _artDrop(e) {
    e.preventDefault();
    document.getElementById('art-drop-zone')?.classList.remove('art-drop-hover');
    const file = e.dataTransfer.files[0];
    if (file) _artFileRead(file);
  }

  function _artClear() {
    const ta = document.getElementById('art-text-input');
    if (ta) ta.value = '';
    const n = document.getElementById('art-char-count');
    if (n) n.textContent = '0';
    document.getElementById('art-result-panel').innerHTML = `
      <div class="art-empty-state">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#484f58" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
        <div class="art-empty-title">Article analysis will appear here</div>
        <div class="art-empty-sub">Paste any research article to get started.</div>
      </div>`;
    try { localStorage.removeItem(ART_STORE); } catch {}
  }

  function _artAnalyse() {
    const text = document.getElementById('art-text-input')?.value?.trim() || '';
    if (text.length < 100) {
      const panel = document.getElementById('art-result-panel');
      if (panel) panel.innerHTML = `<div class="art-error"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ff6b6b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> Please paste at least a paragraph of article text to analyse.</div>`;
      return;
    }

    const panel = document.getElementById('art-result-panel');
    if (panel) panel.innerHTML = `<div class="art-loading"><div class="art-spinner"></div> Analysing article…</div>`;

    setTimeout(() => {
      const types    = _detectStudyType(text);
      const tools    = _detectTools(text);
      const africa   = _detectAfrica(text);
      const findings = _extractFindings(text);
      const terms    = _extractSearchTerms(text, types, tools, africa);
      const repro    = _buildReproGuide(types, tools, africa);
      const opps     = _buildResearchOpportunities(types, tools, africa, text);
      const thesis   = _buildThesisOutline(types, tools, africa, findings);

      const html = _artResultHtml(text, types, tools, africa, findings, terms, repro, opps, thesis);
      if (panel) panel.innerHTML = html;

      try { localStorage.setItem(ART_STORE, JSON.stringify({ text: text.slice(0, 20000), result: html })); } catch {}
    }, 300);
  }

  function _artResultHtml(text, types, tools, africa, findings, terms, repro, opps, thesis) {
    const hasAfrica = africa.countries.length + africa.populations.length + africa.diseases.length > 0;

    return `
      <div class="art-result">

        <div class="art-result-toolbar">
          <div class="art-result-title">Analysis complete</div>
          <button class="tm-btn-secondary art-download-btn" onclick="OmicsLab.Teams._artDownload()">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Download report
          </button>
        </div>

        <!-- Study type -->
        <div class="art-section">
          <div class="art-section-head">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#3fb950" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            Study Type Detected
          </div>
          <div class="art-tag-row">
            ${types.map(t => `<span class="art-tag art-tag-green">${t}</span>`).join('')}
          </div>
        </div>

        <!-- Key findings -->
        ${findings.length ? `
        <div class="art-section">
          <div class="art-section-head">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#58a6ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            Key Findings Detected
          </div>
          <ul class="art-list">
            ${findings.map(f => `<li class="art-finding">${_escHtml(f)}.</li>`).join('')}
          </ul>
        </div>` : ''}

        <!-- Tools -->
        ${tools.length ? `
        <div class="art-section">
          <div class="art-section-head">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#bc8cff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
            Methodology Tools Identified
          </div>
          <div class="art-tag-row">
            ${tools.map(t => `<span class="art-tag art-tag-purple">${t}</span>`).join('')}
          </div>
        </div>` : ''}

        <!-- Africa relevance -->
        ${hasAfrica ? `
        <div class="art-section art-section-africa">
          <div class="art-section-head">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f97316" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
            Africa Relevance
          </div>
          ${africa.countries.length ? `<div class="art-africa-row"><span class="art-africa-label">Countries:</span>${africa.countries.map(c => `<span class="art-tag art-tag-orange">${c}</span>`).join('')}</div>` : ''}
          ${africa.populations.length ? `<div class="art-africa-row"><span class="art-africa-label">Populations:</span>${africa.populations.map(p => `<span class="art-tag art-tag-orange">${p}</span>`).join('')}</div>` : ''}
          ${africa.diseases.length ? `<div class="art-africa-row"><span class="art-africa-label">Diseases:</span>${africa.diseases.map(d => `<span class="art-tag art-tag-red">${d}</span>`).join('')}</div>` : ''}
        </div>` : ''}

        <!-- Reproducibility -->
        <div class="art-section">
          <div class="art-section-head">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#e3b341" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
            Reproducibility Checklist
          </div>
          <ol class="art-ordered-list">
            ${repro.map(s => `<li>${s}</li>`).join('')}
          </ol>
        </div>

        <!-- Research opportunities -->
        <div class="art-section">
          <div class="art-section-head">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#58a6ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Research Opportunities
          </div>
          <div class="art-opps-grid">
            ${opps.map((o, i) => `
              <div class="art-opp-card">
                <div class="art-opp-num">${i + 1}</div>
                <div class="art-opp-body">
                  <div class="art-opp-title">${o.title}</div>
                  <div class="art-opp-desc">${o.desc}</div>
                  <div class="art-opp-tools">
                    ${o.tools.map(t => `<span class="art-tag art-tag-sm">${t}</span>`).join('')}
                  </div>
                </div>
              </div>`).join('')}
          </div>
        </div>

        <!-- Thesis outline -->
        <div class="art-section">
          <div class="art-section-head">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#bc8cff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
            Thesis / Dissertation Outline
          </div>
          <div class="art-thesis">
            ${thesis.map(ch => `
              <div class="art-thesis-chapter">
                <div class="art-thesis-ch-head">
                  <span class="art-thesis-num">Chapter ${ch.num}</span>
                  <span class="art-thesis-title">${ch.title}</span>
                </div>
                <ul class="art-thesis-points">
                  ${ch.content.map(p => `<li>${p}</li>`).join('')}
                </ul>
              </div>`).join('')}
          </div>
        </div>

        <!-- Search terms -->
        <div class="art-section">
          <div class="art-section-head">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#8b949e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            Suggested Search Terms
          </div>
          <div class="art-tag-row art-search-row">
            ${terms.map(t => `<span class="art-tag art-tag-blue art-search-tag" onclick="OmicsLab.Teams._artSearchCopy('${t.replace(/'/g,'\\\'')}')" title="Click to copy">${t}</span>`).join('')}
          </div>
          <div class="art-search-hint">Click any term to copy — paste into PubMed, Google Scholar, or Semantic Scholar</div>
        </div>
      </div>`;
  }

  function _artSearchCopy(term) {
    navigator.clipboard?.writeText(term).then(() => {
      const notice = document.createElement('div');
      notice.className = 'art-copy-toast';
      notice.textContent = 'Copied: ' + term;
      document.body.appendChild(notice);
      setTimeout(() => notice.remove(), 2000);
    }).catch(() => {});
  }

  function _artDownload() {
    const text = document.getElementById('art-text-input')?.value?.trim() || '';
    if (text.length < 100) return;

    const types    = _detectStudyType(text);
    const tools    = _detectTools(text);
    const africa   = _detectAfrica(text);
    const findings = _extractFindings(text);
    const terms    = _extractSearchTerms(text, types, tools, africa);
    const repro    = _buildReproGuide(types, tools, africa);
    const opps     = _buildResearchOpportunities(types, tools, africa, text);
    const thesis   = _buildThesisOutline(types, tools, africa, findings);

    const lines = [
      'OMICSLAB — ARTICLE ANALYSIS REPORT',
      'Generated: ' + new Date().toLocaleString(),
      '═'.repeat(60),
      '',
      'STUDY TYPE',
      types.join('\n'),
      '',
      findings.length ? 'KEY FINDINGS\n' + findings.map(f => '• ' + f).join('\n') : '',
      '',
      tools.length ? 'TOOLS IDENTIFIED\n' + tools.join(', ') : '',
      '',
      africa.countries.length ? 'COUNTRIES: ' + africa.countries.join(', ') : '',
      africa.diseases.length  ? 'DISEASES:  ' + africa.diseases.join(', ')  : '',
      '',
      'REPRODUCIBILITY CHECKLIST',
      repro.map((s, i) => (i+1) + '. ' + s).join('\n'),
      '',
      'RESEARCH OPPORTUNITIES',
      opps.map((o, i) => (i+1) + '. ' + o.title + '\n   ' + o.desc + '\n   Tools: ' + o.tools.join(', ')).join('\n\n'),
      '',
      'THESIS OUTLINE',
      thesis.map(ch => 'Chapter ' + ch.num + ': ' + ch.title + '\n' + ch.content.map(p => '  • ' + p).join('\n')).join('\n\n'),
      '',
      'SEARCH TERMS',
      terms.join(', '),
      '',
      '─'.repeat(60),
      'Generated by OmicsLab — Africa\'s Genomics Training Platform',
    ].filter(l => l !== undefined).join('\n');

    const blob = new Blob([lines], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'omicslab-article-analysis.txt';
    a.click();
    URL.revokeObjectURL(a.href);
  }

  /* ─── Active tab ─── */
  let _activeTab = 'rooms';

  function _switchTab(tab) {
    _activeTab = tab;
    _renderRooms();
  }

  /* ─── Render rooms list ─── */
  function _renderRooms() {
    const section = document.getElementById('teams-section');
    if (!section) return;

    const user = OmicsLab.Auth?.currentUser();

    section.innerHTML = `
      <div class="tm-wrap">
        <div class="tm-header">
          <div class="tm-header-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            OmicsLab Teams
          </div>
          <div class="tm-header-sub">Research meetings, article analysis, and collaboration across Africa's genomics network</div>
          <div class="tm-header-actions">
            ${_activeTab === 'rooms' ? `<button class="tm-btn-primary" onclick="OmicsLab.Teams._showCreateRoom()">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              New meeting room
            </button>` : ''}
          </div>
        </div>

        <!-- Tab bar -->
        <div class="tm-tab-bar">
          <button class="tm-tab ${_activeTab === 'rooms' ? 'tm-tab-active' : ''}" onclick="OmicsLab.Teams._switchTab('rooms')">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
            Meeting Rooms
          </button>
          <button class="tm-tab ${_activeTab === 'article' ? 'tm-tab-active' : ''}" onclick="OmicsLab.Teams._switchTab('article')">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
            Article Analyser
          </button>
        </div>

        ${_activeTab === 'rooms' ? `
          ${!user ? `<div class="tm-auth-notice">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
            Sign in to create rooms, record meetings, and sync your meeting history across devices.
            <button class="tm-auth-link" onclick="OmicsLab.Auth.openModal('signin')">Sign in</button>
          </div>` : ''}
          <div class="tm-rooms-grid" id="tm-rooms-grid">
            ${_rooms.map(r => _roomCardHtml(r)).join('')}
          </div>
          <div class="tm-info-strip">
            <div class="tm-info-item">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
              <span>Same-device multi-tab meetings work now. Cross-device calls require the WebSocket signaling server.</span>
            </div>
            <div class="tm-info-item">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              <span>All video is processed locally — no data leaves your device without a backend server.</span>
            </div>
          </div>
        ` : _renderArticleHubHtml()}
      </div>`;

    if (_activeTab === 'article') _bindArticleHub();
  }

  function _roomCardHtml(r) {
    const active = r.participants > 0;
    return `
      <div class="tm-room-card ${active ? 'tm-room-active' : ''}">
        <div class="tm-room-top">
          <div class="tm-room-icon" style="background:${r.color}22;border-color:${r.color}44">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${r.color}" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              ${_iconPath(r.icon)}
            </svg>
          </div>
          <div class="tm-room-meta">
            ${active ? `<span class="tm-live-badge"><span class="tm-live-dot"></span>Live · ${r.participants} in call</span>` : ''}
            ${r.locked ? `<span class="tm-locked-badge"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg> Invite only</span>` : ''}
          </div>
        </div>
        <h3 class="tm-room-name">${r.name}</h3>
        <p class="tm-room-desc">${r.desc}</p>
        <div class="tm-room-schedule">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          ${r.scheduled}
        </div>
        <div class="tm-room-footer">
          <button class="tm-join-btn" onclick="OmicsLab.Teams.joinRoom('${r.id}')">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            ${active ? 'Join now' : 'Join room'}
          </button>
        </div>
      </div>`;
  }

  /* ─── Icon path lookup ─── */
  function _iconPath(name) {
    const P = {
      'dna': '<path d="M2 15c6.667-6 13.333 0 20-6"/><path d="M9 22c1.798-1.998 2.518-3.995 2.807-5.993"/><path d="M15 2c-1.798 1.998-2.518 3.995-2.807 5.993"/>',
      'alert-triangle': '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
      'globe': '<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
      'book-open': '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
      'file-text': '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>',
      'users': '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    };
    return P[name] || P['users'];
  }

  /* ─── Show create room dialog ─── */
  function _showCreateRoom() {
    const overlay = document.createElement('div');
    overlay.id = 'tm-create-overlay';
    overlay.className = 'tm-overlay';
    overlay.onclick = e => { if (e.target === overlay) overlay.remove(); };
    overlay.innerHTML = `
      <div class="tm-dialog">
        <div class="tm-dialog-header">
          <span>Create a new room</span>
          <button class="auth-close" onclick="document.getElementById('tm-create-overlay').remove()">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="tm-dialog-body">
          <div class="auth-field">
            <label class="auth-label">Room name</label>
            <input class="auth-input" id="tmcr-name" type="text" placeholder="e.g. African Genomics Lab Meeting"/>
          </div>
          <div class="auth-field">
            <label class="auth-label">Description</label>
            <input class="auth-input" id="tmcr-desc" type="text" placeholder="Brief description of this room's purpose"/>
          </div>
          <div class="auth-field-row">
            <div class="auth-field">
              <label class="auth-label">Schedule</label>
              <input class="auth-input" id="tmcr-schedule" type="text" placeholder="e.g. Mondays 10:00 WAT"/>
            </div>
            <div class="auth-field">
              <label class="auth-label">Access</label>
              <select class="auth-input auth-select" id="tmcr-locked">
                <option value="0">Open — anyone can join</option>
                <option value="1">Invite only</option>
              </select>
            </div>
          </div>
          <button class="auth-submit-btn" onclick="OmicsLab.Teams._createRoom()">Create room</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    setTimeout(() => document.getElementById('tmcr-name')?.focus(), 100);
  }

  function _createRoom() {
    const name     = document.getElementById('tmcr-name')?.value?.trim();
    const desc     = document.getElementById('tmcr-desc')?.value?.trim();
    const schedule = document.getElementById('tmcr-schedule')?.value?.trim() || 'On demand';
    const locked   = document.getElementById('tmcr-locked')?.value === '1';
    if (!name) return;
    const room = {
      id: 'rm-' + Date.now().toString(36),
      name, desc: desc || 'Custom meeting room',
      icon: 'users', color: '#58a6ff',
      scheduled: schedule, participants: 0, locked,
    };
    _rooms.push(room);
    _save();
    document.getElementById('tm-create-overlay')?.remove();
    _renderRooms();
  }

  /* ─── Join a room → request media → show meeting UI ─── */
  async function joinRoom(roomId) {
    const room = _rooms.find(r => r.id === roomId);
    if (!room) return;

    _roomId = roomId;

    /* Show loading / permission request state */
    const section = document.getElementById('teams-section');
    if (section) {
      section.innerHTML = `
        <div class="tm-meeting-loading">
          <div class="tm-perm-card" id="tm-perm-card">
            <div class="tm-perm-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#58a6ff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
            </div>
            <h3 class="tm-perm-title">Allow microphone and camera</h3>
            <p class="tm-perm-desc">OmicsLab needs access to your camera and microphone for the meeting.<br>Your browser will ask for permission — click <strong>Allow</strong>.</p>
            <div class="tm-perm-spinner" id="tm-perm-spinner">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3fb950" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
              Requesting permission…
            </div>
            <button class="tm-btn-secondary" onclick="OmicsLab.Teams._cancelJoin()" style="margin-top:1rem">Cancel</button>
          </div>
        </div>`;
    }

    /* Request media */
    const result = await _requestMedia(true, true);

    if (result.denied) {
      _showPermDenied(room, result.reason);
      return;
    }

    if (result.noDevice) {
      _showNoDevice(room);
      return;
    }

    _stream = result.stream;

    /* Update room participant count */
    room.participants = (room.participants || 0) + 1;
    _save();

    /* Setup BroadcastChannel for same-device signaling */
    try {
      _channel = new BroadcastChannel('omicslab_meeting_' + roomId);
      _channel.onmessage = _onBroadcastMsg;
      _channel.postMessage({ type: 'JOINED', name: _myName() });
    } catch {}

    _chatMessages = [];
    _inMeeting = true;
    _muted = false;
    _camOff = result.audioOnly;
    _handRaised = false;
    _peers = [];

    _renderMeeting(room, result.audioOnly);
  }

  /* ─── Permission denied UI ─── */
  function _showPermDenied(room, reason) {
    const section = document.getElementById('teams-section');
    if (!section) return;

    const isAudio = reason === 'audio';
    const browserGuide = _getBrowserGuide();

    section.innerHTML = `
      <div class="tm-meeting-loading">
        <div class="tm-perm-card tm-perm-denied">
          <div class="tm-perm-denied-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ff6b6b" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
          </div>
          <h3 class="tm-perm-title" style="color:#ff6b6b">${isAudio ? 'Microphone' : 'Camera &amp; microphone'} access denied</h3>
          <p class="tm-perm-desc">
            Your browser blocked access. To join the meeting you need to grant permission.
          </p>
          <div class="tm-perm-steps">
            <div class="tm-perm-step-label">How to fix this in ${browserGuide.name}:</div>
            ${browserGuide.steps.map((s, i) => `<div class="tm-perm-step"><span class="tm-perm-step-num">${i+1}</span>${s}</div>`).join('')}
          </div>
          <div class="tm-perm-actions">
            <button class="tm-btn-primary" onclick="OmicsLab.Teams.joinRoom('${room.id}')">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-.18-5.57"/></svg>
              Try again
            </button>
            <button class="tm-btn-secondary" onclick="OmicsLab.Teams._joinAudioOnly('${room.id}')">Join with audio only</button>
            <button class="tm-btn-secondary" onclick="OmicsLab.Teams._cancelJoin()">Back to rooms</button>
          </div>
        </div>
      </div>`;
  }

  function _showNoDevice(room) {
    const section = document.getElementById('teams-section');
    if (!section) return;
    section.innerHTML = `
      <div class="tm-meeting-loading">
        <div class="tm-perm-card tm-perm-denied">
          <div class="tm-perm-denied-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#e3b341" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
          </div>
          <h3 class="tm-perm-title" style="color:#e3b341">No microphone found</h3>
          <p class="tm-perm-desc">No microphone or camera was detected on this device. Connect a headset or USB microphone and try again.</p>
          <div class="tm-perm-actions">
            <button class="tm-btn-primary" onclick="OmicsLab.Teams.joinRoom('${room.id}')">Try again</button>
            <button class="tm-btn-secondary" onclick="OmicsLab.Teams._cancelJoin()">Back to rooms</button>
          </div>
        </div>
      </div>`;
  }

  /* ─── Browser-specific permission guide ─── */
  function _getBrowserGuide() {
    const ua = navigator.userAgent;
    if (/Firefox/i.test(ua)) return {
      name: 'Firefox',
      steps: [
        'Click the camera/microphone icon in the address bar.',
        'Select <strong>Allow</strong> for both camera and microphone.',
        'Reload the page and click Try again.',
      ],
    };
    if (/Edg/i.test(ua)) return {
      name: 'Edge',
      steps: [
        'Click the lock icon (or camera icon) in the address bar.',
        'Set Camera and Microphone to <strong>Allow</strong>.',
        'Click Try again — no reload needed.',
      ],
    };
    if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) return {
      name: 'Safari',
      steps: [
        'Go to <strong>Safari → Settings → Websites → Camera</strong>.',
        'Find this website and set it to <strong>Allow</strong>.',
        'Do the same under <strong>Microphone</strong>.',
        'Reload the page and click Try again.',
      ],
    };
    /* Default Chrome */
    return {
      name: 'Chrome',
      steps: [
        'Click the camera/microphone icon on the right side of the address bar.',
        'Select <strong>Always allow</strong> for both camera and microphone.',
        'Click Try again — no reload needed.',
      ],
    };
  }

  /* ─── Join audio only ─── */
  async function _joinAudioOnly(roomId) {
    const room = _rooms.find(r => r.id === roomId);
    if (!room) return;
    _roomId = roomId;
    const result = await _requestMedia(false, true);
    if (result.denied) { _showPermDenied(room, 'audio'); return; }
    if (result.noDevice) { _showNoDevice(room); return; }
    _stream = result.stream;
    _camOff = true;
    _inMeeting = true;
    _muted = false;
    _handRaised = false;
    _peers = [];
    try {
      _channel = new BroadcastChannel('omicslab_meeting_' + roomId);
      _channel.onmessage = _onBroadcastMsg;
      _channel.postMessage({ type: 'JOINED', name: _myName() });
    } catch {}
    _chatMessages = [];
    _renderMeeting(room, true);
  }

  function _cancelJoin() {
    _cleanup();
    init();
  }

  /* ─── Render meeting view ─── */
  function _renderMeeting(room, audioOnly) {
    const section = document.getElementById('teams-section');
    if (!section) return;

    section.innerHTML = `
      <div class="tm-meeting">
        <!-- Header bar -->
        <div class="tm-meeting-header">
          <div class="tm-meeting-title">
            <span class="tm-meeting-name">${room.name}</span>
            <span class="tm-meeting-live"><span class="tm-live-dot"></span>Live</span>
          </div>
          <div class="tm-meeting-timer" id="tm-timer">00:00</div>
          <div style="flex:1"></div>
          <div class="tm-meeting-participants-count" id="tm-participants-count">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            <span id="tm-count-num">1</span>
          </div>
        </div>

        <!-- Main area: video grid + sidebar -->
        <div class="tm-meeting-body">
          <div class="tm-video-area" id="tm-video-area">
            <!-- Local tile -->
            <div class="tm-video-tile tm-tile-self" id="tm-tile-self">
              ${audioOnly || _camOff ? `
                <div class="tm-video-avatar">${_myName()[0].toUpperCase()}</div>
              ` : ''}
              <video id="tm-local-video" autoplay muted playsinline style="${audioOnly || _camOff ? 'display:none' : ''}"></video>
              <div class="tm-tile-label">
                <span class="tm-tile-name">${_myName()} (You)</span>
                ${audioOnly ? '<span class="tm-tile-audio-only">Audio only</span>' : ''}
              </div>
              ${_muted ? `<div class="tm-mute-overlay"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ff6b6b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg></div>` : ''}
            </div>
            <div id="tm-peer-tiles"></div>
          </div>

          <!-- Chat sidebar -->
          <div class="tm-chat-sidebar" id="tm-chat-sidebar">
            <div class="tm-chat-header">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              Meeting chat
            </div>
            <div class="tm-chat-messages" id="tm-chat-messages">
              <div class="tm-chat-system">Meeting started. Messages are visible to everyone in this room.</div>
            </div>
            <div class="tm-chat-composer">
              <input type="text" class="tm-chat-input" id="tm-chat-input" placeholder="Type a message…" onkeydown="OmicsLab.Teams._chatKey(event)"/>
              <button class="tm-chat-send" onclick="OmicsLab.Teams._sendChat()">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Controls bar -->
        <div class="tm-controls">
          <button class="tm-ctrl-btn ${_muted ? 'tm-ctrl-off' : ''}" id="tm-btn-mute" onclick="OmicsLab.Teams.toggleMute()" title="Toggle mute (M)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" id="tm-icon-mic">${_muted ? '<line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>' : '<path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>'}</svg>
            <span>${_muted ? 'Unmute' : 'Mute'}</span>
          </button>

          <button class="tm-ctrl-btn ${_camOff || audioOnly ? 'tm-ctrl-off' : ''}" id="tm-btn-cam" onclick="OmicsLab.Teams.toggleCamera()" title="Toggle camera (V)" ${audioOnly ? 'disabled title="No camera"' : ''}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" id="tm-icon-cam">${_camOff || audioOnly ? '<line x1="1" y1="1" x2="23" y2="23"/><path d="M21 21H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3m3-3h6l2 3h4a2 2 0 0 1 2 2v9.34"/>' : '<path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>'}</svg>
            <span>${_camOff || audioOnly ? 'Camera off' : 'Camera'}</span>
          </button>

          <button class="tm-ctrl-btn" id="tm-btn-screen" onclick="OmicsLab.Teams.toggleScreenShare()" title="Share screen">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
            <span>Share</span>
          </button>

          <button class="tm-ctrl-btn ${_handRaised ? 'tm-ctrl-hand' : ''}" id="tm-btn-hand" onclick="OmicsLab.Teams.toggleHand()" title="Raise hand">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 11.5v-5a2 2 0 0 0-4 0v4.5"/><path d="M14 10.5V6a2 2 0 0 0-4 0v5"/><path d="M10 10.5V8a2 2 0 0 0-4 0v8a6 6 0 0 0 6 6h2a6 6 0 0 0 6-6v-2.5a2 2 0 0 0-4 0"/></svg>
            <span>${_handRaised ? 'Lower hand' : 'Raise hand'}</span>
          </button>

          <button class="tm-ctrl-btn tm-ctrl-leave" onclick="OmicsLab.Teams.leaveMeeting()" title="Leave meeting">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            <span>Leave</span>
          </button>
        </div>
      </div>`;

    /* Attach local video */
    if (_stream && !audioOnly && !_camOff) {
      const vid = document.getElementById('tm-local-video');
      if (vid) { vid.srcObject = _stream; vid.play().catch(() => {}); }
    }

    /* Start timer */
    _startTimer();

    /* Keyboard shortcuts */
    document.addEventListener('keydown', _meetingKeydown, { once: false });
  }

  /* ─── Controls ─── */
  function toggleMute() {
    if (!_stream) return;
    _muted = !_muted;
    _stream.getAudioTracks().forEach(t => { t.enabled = !_muted; });
    _broadcastEvent({ type: 'MUTE', muted: _muted, name: _myName() });
    _updateControlBtn('tm-btn-mute', _muted, 'Mute', 'Unmute', '<path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>', '<line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>');
  }

  function toggleCamera() {
    if (!_stream) return;
    const tracks = _stream.getVideoTracks();
    if (!tracks.length) return;
    _camOff = !_camOff;
    tracks.forEach(t => { t.enabled = !_camOff; });
    const tile = document.getElementById('tm-tile-self');
    const vid  = document.getElementById('tm-local-video');
    let av = tile?.querySelector('.tm-video-avatar');
    if (_camOff) {
      if (vid) vid.style.display = 'none';
      if (!av) { av = document.createElement('div'); av.className = 'tm-video-avatar'; av.textContent = _myName()[0].toUpperCase(); tile?.prepend(av); }
    } else {
      if (vid) vid.style.display = '';
      if (av) av.remove();
    }
    _updateControlBtn('tm-btn-cam', _camOff, 'Camera', 'Camera off', '<path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>', '<line x1="1" y1="1" x2="23" y2="23"/><path d="M21 21H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3m3-3h6l2 3h4a2 2 0 0 1 2 2v9.34"/>');
  }

  async function toggleScreenShare() {
    const btn = document.getElementById('tm-btn-screen');
    if (_screen) {
      _screen.getTracks().forEach(t => t.stop());
      _screen = null;
      if (btn) btn.classList.remove('tm-ctrl-active');
      const vid = document.getElementById('tm-local-video');
      if (vid && _stream) { vid.srcObject = _stream; }
      return;
    }
    try {
      _screen = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      _screen.getVideoTracks()[0].onended = () => { _screen = null; if (btn) btn.classList.remove('tm-ctrl-active'); };
      if (btn) btn.classList.add('tm-ctrl-active');
      const vid = document.getElementById('tm-local-video');
      if (vid) { vid.srcObject = _screen; vid.play().catch(() => {}); }
    } catch (err) {
      if (err.name !== 'NotAllowedError') {
        const msg = document.createElement('div');
        msg.className = 'tm-toast';
        msg.textContent = 'Screen sharing not available in this browser.';
        document.body.appendChild(msg);
        setTimeout(() => msg.remove(), 3000);
      }
    }
  }

  function toggleHand() {
    _handRaised = !_handRaised;
    _broadcastEvent({ type: 'HAND', raised: _handRaised, name: _myName() });
    const btn = document.getElementById('tm-btn-hand');
    if (btn) {
      btn.classList.toggle('tm-ctrl-hand', _handRaised);
      btn.querySelector('span').textContent = _handRaised ? 'Lower hand' : 'Raise hand';
    }
    if (_handRaised) _addChatSystem(_myName() + ' raised their hand.');
  }

  function _updateControlBtn(id, isOff, labelOn, labelOff, pathOn, pathOff) {
    const btn = document.getElementById(id);
    if (!btn) return;
    btn.classList.toggle('tm-ctrl-off', isOff);
    btn.querySelector('svg').innerHTML = isOff ? pathOff : pathOn;
    btn.querySelector('span').textContent = isOff ? labelOff : labelOn;
  }

  /* ─── Chat ─── */
  function _chatKey(e) { if (e.key === 'Enter') _sendChat(); }

  function _sendChat() {
    const input = document.getElementById('tm-chat-input');
    const text = input?.value?.trim();
    if (!text) return;
    const msg = { name: _myName(), text, ts: Date.now() };
    _chatMessages.push(msg);
    _broadcastEvent({ type: 'CHAT', ...msg });
    _appendChatMsg(msg.name, msg.text, true);
    if (input) input.value = '';
  }

  function _appendChatMsg(name, text, isSelf) {
    const list = document.getElementById('tm-chat-messages');
    if (!list) return;
    const div = document.createElement('div');
    div.className = 'tm-chat-msg ' + (isSelf ? 'tm-chat-self' : '');
    div.innerHTML = `<span class="tm-chat-name">${_escHtml(name)}</span><span class="tm-chat-text">${_escHtml(text)}</span>`;
    list.appendChild(div);
    list.scrollTop = list.scrollHeight;
  }

  function _addChatSystem(text) {
    const list = document.getElementById('tm-chat-messages');
    if (!list) return;
    const div = document.createElement('div');
    div.className = 'tm-chat-system';
    div.textContent = text;
    list.appendChild(div);
    list.scrollTop = list.scrollHeight;
  }

  /* ─── BroadcastChannel (same-device multi-tab) ─── */
  function _broadcastEvent(data) {
    try { _channel?.postMessage(data); } catch {}
  }

  function _onBroadcastMsg(e) {
    const { type, name } = e.data || {};
    if (type === 'JOINED') {
      if (!_peers.includes(name)) {
        _peers.push(name);
        _updatePeerCount();
        _addPeerTile(name);
        _addChatSystem(name + ' joined the meeting.');
        _broadcastEvent({ type: 'ANNOUNCE', name: _myName() });
      }
    } else if (type === 'ANNOUNCE') {
      if (!_peers.includes(name)) {
        _peers.push(name);
        _updatePeerCount();
        _addPeerTile(name);
      }
    } else if (type === 'LEFT') {
      _peers = _peers.filter(p => p !== name);
      _updatePeerCount();
      _removePeerTile(name);
      _addChatSystem(name + ' left the meeting.');
    } else if (type === 'CHAT') {
      _appendChatMsg(name, e.data.text, false);
    } else if (type === 'HAND' && e.data.raised) {
      _addChatSystem(name + ' raised their hand.');
    } else if (type === 'MUTE') {
      const tile = document.querySelector(`[data-peer="${name}"]`);
      if (tile) {
        let badge = tile.querySelector('.tm-mute-overlay');
        if (e.data.muted && !badge) {
          badge = document.createElement('div');
          badge.className = 'tm-mute-overlay';
          badge.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ff6b6b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/></svg>`;
          tile.appendChild(badge);
        } else if (!e.data.muted && badge) badge.remove();
      }
    }
  }

  function _addPeerTile(name) {
    const area = document.getElementById('tm-peer-tiles');
    if (!area) return;
    const tile = document.createElement('div');
    tile.className = 'tm-video-tile';
    tile.dataset.peer = name;
    tile.innerHTML = `<div class="tm-video-avatar">${name[0].toUpperCase()}</div><div class="tm-tile-label"><span class="tm-tile-name">${_escHtml(name)}</span></div>`;
    area.appendChild(tile);
  }

  function _removePeerTile(name) {
    document.querySelector(`[data-peer="${name}"]`)?.remove();
  }

  function _updatePeerCount() {
    const el = document.getElementById('tm-count-num');
    if (el) el.textContent = 1 + _peers.length;
  }

  /* ─── Leave meeting ─── */
  function leaveMeeting() {
    _broadcastEvent({ type: 'LEFT', name: _myName() });
    /* Decrement participant count */
    const room = _rooms.find(r => r.id === _roomId);
    if (room && room.participants > 0) room.participants--;
    _save();
    _cleanup();
    init();
  }

  function _cleanup() {
    _inMeeting = false;
    if (_stream)  { _stream.getTracks().forEach(t => t.stop());  _stream = null; }
    if (_screen)  { _screen.getTracks().forEach(t => t.stop());  _screen = null; }
    if (_channel) { try { _channel.close(); } catch {} _channel = null; }
    if (_timerInterval) { clearInterval(_timerInterval); _timerInterval = null; }
    document.removeEventListener('keydown', _meetingKeydown);
  }

  /* ─── Timer ─── */
  let _timerInterval = null;
  let _timerStart = 0;

  function _startTimer() {
    _timerStart = Date.now();
    _timerInterval = setInterval(() => {
      const el = document.getElementById('tm-timer');
      if (!el) { clearInterval(_timerInterval); return; }
      const s = Math.floor((Date.now() - _timerStart) / 1000);
      const m = Math.floor(s / 60);
      el.textContent = String(m).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
    }, 1000);
  }

  /* ─── Keyboard shortcuts ─── */
  function _meetingKeydown(e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (e.key === 'm' || e.key === 'M') { e.preventDefault(); toggleMute(); }
    if (e.key === 'v' || e.key === 'V') { e.preventDefault(); toggleCamera(); }
  }

  /* ─── Helpers ─── */
  function _myName() {
    return OmicsLab.Auth?.currentUser()?.name || 'You';
  }

  function _escHtml(s) {
    return (s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  /* ─── Init ─── */
  function init() {
    const section = document.getElementById('teams-section');
    if (!section) return;
    section.dataset.tmReady = '1';
    _load();
    _renderRooms();
  }

  return { init, joinRoom, leaveMeeting, toggleMute, toggleCamera, toggleScreenShare, toggleHand, _chatKey, _sendChat, _cancelJoin, _joinAudioOnly, _showCreateRoom, _createRoom, _switchTab, _artTab, _artFileRead, _artDrop, _artClear, _artAnalyse, _artSearchCopy, _artDownload };
})();
