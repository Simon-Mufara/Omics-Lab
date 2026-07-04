/* ═══════════════════════════════════════════════════════════════
   OmicsLab — Grant Text Generator (Prompt 9)
   Generates IRB-ready, H3Africa-aligned, NIH/Wellcome-formatted
   grant section text from user lab session data + form inputs.
   Zero external API — all text assembled offline from templates.
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.Grant = (function () {

  /* ─── African Grants Database ─── */
  const GRANTS_DB = [
    { funder:'NIH Fogarty International Center', name:'D43 International Training Grant', type:'Capacity Building', amount:'Up to $750,000/yr', regions:['Sub-Saharan Africa','North Africa'], focus:'Any health research; LMIC PI co-lead required', deadline:'Rolling (PA-23-077)', url:'https://www.fic.nih.gov/Grants' },
    { funder:'NIH Fogarty International Center', name:'R21 Exploratory Research (Africa focus)', type:'Research', amount:'Up to $275,000 (2yr)', regions:['Sub-Saharan Africa'], focus:'Infectious disease, genomics, NCD', deadline:'Standard NIH dates (Feb/Jun/Oct)', url:'https://www.fic.nih.gov' },
    { funder:'NIH NIAID', name:'K43 International Career Development Award', type:'Early Career', amount:'Up to $150,000/yr (5yr)', regions:['Sub-Saharan Africa','Southeast Asia'], focus:'Infectious disease; for mid-career African investigators', deadline:'Feb 12 / Jun 12 / Oct 12', url:'https://grants.nih.gov/grants/guide/pa-files/PAR-23-160.html' },
    { funder:'Wellcome Trust', name:'Discovery Research Award', type:'Research', amount:'Up to £5,000,000 (5yr)', regions:['Africa','Global'], focus:'Basic science, genomics, global health; Africa LMIC lead eligible', deadline:'Rolling (Expression of Interest first)', url:'https://wellcome.org/grant-funding' },
    { funder:'Wellcome Trust', name:'Collaborative Award', type:'Research', amount:'Up to £3,000,000 (5yr)', regions:['Africa','Global'], focus:'Multi-team; cross-continental consortia', deadline:'Rolling', url:'https://wellcome.org/grant-funding' },
    { funder:'Wellcome Trust', name:'Early Career Award', type:'Early Career', amount:'Up to £400,000 (5yr)', regions:['Africa','Global'], focus:'Post-PhD to 5yrs post-fellowship; Africa institutions eligible', deadline:'Jan and Jun annually', url:'https://wellcome.org/grant-funding/schemes/early-career-awards' },
    { funder:'H3Africa Consortium', name:'H3Africa Collaborative Research Grants', type:'Research', amount:'$500,000–$1.5M/yr', regions:['Sub-Saharan Africa'], focus:'Genomics, population health, biobanking; African PI required', deadline:'Through NIH parent announcements', url:'https://h3africa.org' },
    { funder:'African Academy of Sciences', name:'DELTAS Africa Phase II', type:'Capacity Building', amount:'Up to £2,000,000 (5yr)', regions:['Sub-Saharan Africa'], focus:'Doctoral training and postdoctoral fellowships; consortium model', deadline:'Closed — watch for Phase III', url:'https://www.aasciences.africa/aas/grants-awards' },
    { funder:'African Academy of Sciences', name:'AAS-GBSA Grand Challenges Africa', type:'Research', amount:'Up to $100,000 (2yr)', regions:['Sub-Saharan Africa'], focus:'Innovative solutions to African health challenges; early-phase R&D', deadline:'Annual (typically April)', url:'https://www.aasciences.africa' },
    { funder:'MRC UK / Newton Fund', name:'Newton Advanced Fellowship (Africa)', type:'Early Career', amount:'Up to £110,000 (2yr)', regions:['Kenya','South Africa','Nigeria','Ghana','Ethiopia'], focus:'Any biomedical research; African PI hosts UK collaborator', deadline:'Annual (March/April)', url:'https://royalsociety.org/grants/newton-advanced-fellowships/' },
    { funder:'Bill & Melinda Gates Foundation', name:'Grand Challenges Explorations', type:'Research', amount:'$100,000 seed; up to $1M phase 2', regions:['Sub-Saharan Africa','South Asia'], focus:'Malaria, TB, NTDs, maternal health, nutrition', deadline:'Biannual rounds', url:'https://gcgh.grandchallenges.org' },
    { funder:'Bill & Melinda Gates Foundation', name:'Global Health Program (direct grants)', type:'Research', amount:'Variable ($1M–$10M+)', regions:['Africa','South Asia'], focus:'Vaccines, diagnostics, sequencing capacity, outbreak response', deadline:'By invitation / LOI', url:'https://www.gatesfoundation.org/about/how-we-work/grant-seekers' },
    { funder:'EDCTP', name:'Senior Fellowship', type:'Early Career', amount:'Up to €1,200,000 (5yr)', regions:['Sub-Saharan Africa'], focus:'Sub-Saharan African researchers in clinical trials, infectious disease', deadline:'Annual (varies by call)', url:'https://www.edctp.org/funding/calls' },
    { funder:'EDCTP', name:'Collaborative Research Project', type:'Research', amount:'Up to €6,000,000 (5yr)', regions:['Sub-Saharan Africa','Europe'], focus:'Clinical trials for poverty-related diseases; African-European partnership', deadline:'Annual (varies by call)', url:'https://www.edctp.org/funding/calls' },
    { funder:'National Research Foundation (NRF)', name:'Scarce Skills Doctoral Scholarship', type:'Early Career', amount:'ZAR 120,000/yr (3yr)', regions:['South Africa'], focus:'Genomics, bioinformatics, public health; SA nationals or residents', deadline:'Annual (August)', url:'https://www.nrf.ac.za' },
    { funder:'National Research Foundation (NRF)', name:'Incentive Funding for Rated Researchers', type:'Research', amount:'ZAR 200,000–1,200,000/yr', regions:['South Africa'], focus:'Peer-reviewed research; NRF-rated SA researchers only', deadline:'Annual', url:'https://www.nrf.ac.za' },
    { funder:'USAID Development Innovation Ventures', name:'DIV Stage 1 / Stage 2', type:'Research', amount:'$25,000–$15,000,000', regions:['Sub-Saharan Africa','Asia'], focus:'Innovative development solutions; health, diagnostics, agriculture', deadline:'Rolling', url:'https://www.usaid.gov/div' },
    { funder:'Chan Zuckerberg Initiative', name:'CZI Science — Collaborative Pairs', type:'Research', amount:'Up to $2,000,000 (3yr)', regions:['Africa','Global'], focus:'Single-cell biology, infectious disease, rare disease; open-access required', deadline:'Annual LOI round', url:'https://chanzuckerberg.com/science/programs' },
    { funder:'Merck Foundation', name:'Africa Research Summit Grants', type:'Early Career', amount:'Up to $20,000', regions:['Sub-Saharan Africa'], focus:'NCDs, maternal health, endocrinology; early-career African researchers', deadline:'Annual (June)', url:'https://www.merck-africa-asiaresearch.com' },
    { funder:'WHO/TDR', name:'TDR Research Grants for Climate Sensitive ID', type:'Research', amount:'Up to $50,000 (2yr)', regions:['Sub-Saharan Africa','Asia-Pacific'], focus:'Infectious diseases linked to climate change; LMIC institutions', deadline:'Annual (March)', url:'https://tdr.who.int/funding' },
    { funder:'Rockefeller Foundation', name:'Health Initiative Grants', type:'Research', amount:'Variable ($500K–$5M)', regions:['Africa','Asia','Americas'], focus:'Health equity, pandemic preparedness, food systems', deadline:'By invitation / LOI', url:'https://www.rockefellerfoundation.org/grants' },
    { funder:'IDRC Canada', name:'Research in Developing Regions (Health)', type:'Research', amount:'CAD 500,000–2,500,000', regions:['Sub-Saharan Africa','South Asia'], focus:'Health systems, One Health, genomic surveillance; LMIC PI required', deadline:'Periodic calls + rolling', url:'https://www.idrc.ca/en/funding' },
    { funder:'European Research Council', name:'Global Challenges Research Fund (GCRF)', type:'Research', amount:'Up to £10,000,000', regions:['ODA-eligible countries (most of Africa)'], focus:'Multi-disciplinary; must address ODA country challenges', deadline:'Annual (UK-based but collaborative)', url:'https://www.ukri.org/councils/esrc/guidance-for-applicants/types-of-funding-we-offer/global-challenges-research-fund' },
    { funder:'Simons Foundation', name:'SFARI / Math+X (Africa program)', type:'Research', amount:'Up to $500,000 (3yr)', regions:['Africa'], focus:'Basic research; computational biology, mathematical modeling', deadline:'Annual', url:'https://www.simonsfoundation.org/grants' },
    { funder:'Sida (Sweden)', name:'Health Research Partnerships', type:'Research', amount:'SEK 1,000,000–5,000,000', regions:['East Africa','Southern Africa'], focus:'Infectious disease, maternal health, genomic epidemiology', deadline:'Through Swedish universities', url:'https://www.sida.se/en/for-organisations/research' },
    { funder:'DFG Germany', name:'Research Grants — Africa Partnership', type:'Research', amount:'€150,000–€800,000 (3yr)', regions:['Sub-Saharan Africa'], focus:'Basic and applied research; German-African co-PI model', deadline:'Rolling', url:'https://www.dfg.de/en/research-funding/funding-opportunities' },
    { funder:'Wellcome / DBT India Alliance', name:'Margdarshi Fellowship (India-Africa)', type:'Early Career', amount:'Up to INR 30,000,000 (5yr)', regions:['India','Africa'], focus:'Biomedical research; India-Africa collaborative focus', deadline:'Annual', url:'https://www.indiaalliance.org' },
    { funder:'President\'s Malaria Initiative', name:'PMI Applied Research Grants', type:'Research', amount:'Variable (government)', regions:['Malaria-endemic Africa'], focus:'Malaria epidemiology, vector control, diagnostics', deadline:'Through USAID implementing partners', url:'https://www.pmi.gov' },
    { funder:'Global Fund', name:'Country Concept Notes — Research Component', type:'Infrastructure', amount:'Variable (country-level)', regions:['Sub-Saharan Africa'], focus:'HIV, TB, malaria; requires national health ministry partnership', deadline:'Country allocation cycles', url:'https://www.theglobalfund.org/en/applying-for-funding' },
    { funder:'World Bank', name:'Africa Centers of Excellence (ACE) Program', type:'Infrastructure', amount:'$8,000,000–$12,000,000 (5yr)', regions:['West Africa','East Africa'], focus:'STEM capacity building; African university consortia', deadline:'Periodic (through national governments)', url:'https://ace.daad.de' },
    { funder:'African Development Bank', name:'Higher Education, Science & Technology (HEST)', type:'Infrastructure', amount:'Variable', regions:['Africa'], focus:'University infrastructure, research centres, training programs', deadline:'Through national governments', url:'https://www.afdb.org/en/topics-and-sectors/sectors/education' },
    { funder:'Open Philanthropy', name:'Global Health & Wellbeing Grants', type:'Research', amount:'Variable ($100K–$5M+)', regions:['Sub-Saharan Africa','Global'], focus:'Neglected diseases, global health R&D, biosecurity', deadline:'By invitation / LOI', url:'https://www.openphilanthropy.org/how-to-apply' },
    { funder:'Horizon Europe / Africa Initiative', name:'EU-Africa Research Partnership Grants', type:'Research', amount:'€1,000,000–€5,000,000', regions:['Africa (ACP countries)'], focus:'Climate, health, digital transformation; EU-Africa consortium', deadline:'Annual work programme calls', url:'https://ec.europa.eu/info/research-and-innovation/funding/funding-opportunities/funding-programmes-and-open-calls/horizon-europe' },
    { funder:'Africa CDC', name:'Africa CDC Fellowships & Research Grants', type:'Early Career', amount:'Up to $50,000', regions:['Sub-Saharan Africa'], focus:'Epidemiology, outbreak response, genomic surveillance', deadline:'Annual', url:'https://africacdc.org' },
    { funder:'PEPFAR / NIH', name:'NIAID International HIV Research (D43/R01)', type:'Research', amount:'$300,000–$1,500,000', regions:['Sub-Saharan Africa'], focus:'HIV prevention, treatment, comorbidities; African-led required', deadline:'Standard NIH dates', url:'https://www.niaid.nih.gov/grants-contracts' },
  ];

  /* ─── Grant section templates ─── */
  const TEMPLATES = {
    aims: (d) => `\
SPECIFIC AIMS

${d.title} stands as one of the most pressing health challenges across ${d.region}, affecting millions of individuals and imposing a disproportionate burden on healthcare systems with limited resources. Despite recent advances in omics technologies, the molecular mechanisms underlying ${d.disease} remain incompletely characterised in African populations, who have historically been underrepresented in genomic research.

This proposal addresses these critical gaps through three inter-related Specific Aims:

Aim 1: Characterise the genomic landscape of ${d.disease} in ${d.country} using ${d.approach} (Year 1–2)
We will recruit ${d.samples} participants from ${d.institution} and apply ${d.approach} to identify disease-associated variants and expression signatures unique to the African context. We expect to generate a high-quality reference dataset of ${d.samples} deeply phenotyped samples with linked ${d.dataType} profiles.

Aim 2: Develop and validate a predictive biomarker panel applicable to resource-limited settings (Year 2–3)
Using machine learning approaches applied to data generated in Aim 1, we will identify a minimal panel of robust biomarkers with clinical utility in settings where advanced diagnostics are unavailable. We will validate this panel in an independent cohort of ${Math.round(d.samples * 0.4)} participants.

Aim 3: Build open-access data infrastructure and train the next generation of African genomics scientists (Year 1–3)
All data will be deposited in H3Africa Data Repositories under FAIR principles. We will design and deliver three intensive training workshops at ${d.institution} and partner institutions, reaching at least 45 early-career researchers across ${d.region}.

The long-term goal of this research is to establish an evidence base that directly informs prevention and treatment strategies for ${d.disease} in Africa, and to build durable omics research capacity that will outlast the grant period.`,

    background: (d) => `\
BACKGROUND AND SIGNIFICANCE

${d.disease} exerts an enormous burden on populations across ${d.region}. Current estimates indicate that ${d.burden}. Despite this scale, the vast majority of large-scale genomic studies have been conducted in populations of predominantly European ancestry, leaving African populations — the most genetically diverse humans on Earth — critically underrepresented.

Methodological context
${d.approach} has emerged as a powerful strategy for ${d.methodDesc}. When applied to African cohorts, this approach has the potential to uncover novel biology not discoverable in homogeneous reference populations. Previous work at ${d.institution} and partner sites has demonstrated feasibility: pilot experiments processing ${Math.round(d.samples * 0.1)} samples confirmed ${d.pilotResult}.

Gap analysis
Three critical gaps remain unaddressed in the literature:
  1. No large-scale ${d.dataType} study of ${d.disease} exists for the ${d.country} population.
  2. Existing diagnostic and therapeutic strategies have not been validated for efficacy in African genetic backgrounds.
  3. Analytical pipelines and training materials remain inaccessible to most researchers across the continent.

Innovation
This proposal is innovative in that it: (i) applies cutting-edge ${d.approach} at unprecedented scale in Africa; (ii) integrates community engagement and co-design principles that reflect H3Africa ethical frameworks; and (iii) deploys an open-access OmicsLab Simulator environment to enable continuous training beyond the grant period.`,

    methods: (d) => `\
APPROACH AND METHODS

Study Design
This is a prospective ${d.studyDesign} study enrolling ${d.samples} participants from ${d.institution}, ${d.country}. Participants will be recruited through ${d.recruitment} with written informed consent obtained in ${d.language}. The study has received ethical approval from the ${d.ethics} Institutional Review Board (Reference: pending) and complies with all H3Africa data governance requirements.

Sample Collection and Processing
${d.wetLabSteps}

Sequencing and Data Generation
Libraries will be prepared using ${d.libraryPrep} and sequenced on the ${d.instrument} platform to a target depth of ${d.depth}×. Quality control will be performed using FastQC (v0.11.9) and MultiQC (v1.12), with adapter trimming by fastp (v0.23). All raw data will be deposited in the European Nucleotide Archive (ENA) under the H3Africa consortium umbrella prior to publication.

Bioinformatics Analysis Pipeline
${d.bioinfoPipeline}

Statistical Analysis
Statistical analyses will be conducted in R (v4.3.0). For genome-wide association analyses, we will apply linear/logistic mixed models implemented in SAIGE to account for population stratification. A Bonferroni-corrected significance threshold of p < ${(0.05 / 1e6).toExponential(1)} will be used for genome-wide analyses. Secondary analyses will include pathway enrichment using fgsea and network analysis using STRING.

Data Sharing and Open Science
All processed data, analysis code, and trained models will be deposited in Zenodo and H3Data under CC BY 4.0. A dedicated GitHub repository will host fully reproducible Snakemake/Nextflow workflow scripts. The OmicsLab Simulator will be updated with a module reflecting this study's protocols for ongoing training use.

Potential Pitfalls and Contingencies
${d.pitfalls}`,

    budget: (d) => `\
BUDGET JUSTIFICATION

Personnel (${d.currency} ${d.budget.toLocaleString()} — ${d.budgetPct.personnel}% of total)
  • Principal Investigator (10% effort): Scientific leadership, study design, manuscript preparation
  • Co-Investigator / Bioinformatician (50% effort): Pipeline development, data analysis, training delivery
  • Research Nurse / Coordinator (100% effort): Participant recruitment, consent, sample collection
  • Lab Technician (100% effort): Sample processing, library preparation, QC
  • Biostatistician (25% effort): Statistical analysis plan, power calculations, reporting

Direct Laboratory Costs (${d.currency} ${Math.round(d.budget * d.budgetPct.lab / 100).toLocaleString()} — ${d.budgetPct.lab}%)
  • Library preparation kits for ${d.samples} samples: estimated at ${d.currency} ${Math.round(d.kitCost * d.samples).toLocaleString()}
  • Sequencing costs at ${d.depth}× depth (${d.samples} samples): estimated at ${d.currency} ${Math.round(d.seqCost * d.samples).toLocaleString()}
  • Consumables (tubes, reagents, tips, PPE): ${d.currency} ${Math.round(d.budget * 0.04).toLocaleString()}
  • Cold-chain shipping and bio-bank storage: ${d.currency} ${Math.round(d.budget * 0.02).toLocaleString()}

Computing Infrastructure (${d.currency} ${Math.round(d.budget * d.budgetPct.compute / 100).toLocaleString()} — ${d.budgetPct.compute}%)
  • Cloud HPC allocation (AWS/Google Batch or local cluster): analysis of ${d.samples} samples at ${d.depth}× depth
  • Data storage (5-year archiving for ${Math.round(d.samples * d.gbPerSample)} GB raw data)

Training and Dissemination (${d.currency} ${Math.round(d.budget * d.budgetPct.training / 100).toLocaleString()} — ${d.budgetPct.training}%)
  • Three training workshops (venue, materials, travel bursaries for 15 trainees each)
  • Open-access publication fees (minimum 2 papers)
  • Conference attendance: ASBCB, H3Africa Consortium Annual Meeting, ESHG

Indirect Costs / Overhead (${d.currency} ${Math.round(d.budget * d.budgetPct.overhead / 100).toLocaleString()} — ${d.budgetPct.overhead}%)
  Standard institutional overhead rate applied to direct costs`,

    ethics: (d) => `\
ETHICAL CONSIDERATIONS AND DATA GOVERNANCE

Community Engagement
Prior to study initiation, a community advisory board (CAB) comprising ${d.samples > 100 ? '12' : '8'} community representatives, traditional leaders, and patient advocates will be constituted at ${d.institution}. The CAB will review study materials, inform recruitment strategy, and participate in the interpretation and dissemination of results.

Informed Consent
Bilingual consent forms (English and ${d.language}) drafted at a Grade 8 reading level will be administered by trained research nurses. Participants will be informed of: (i) the nature and purpose of the study; (ii) data storage and sharing arrangements; (iii) their right to withdraw at any time; and (iv) any foreseeable risks or benefits. Separate consent will be obtained for biobank storage of residual samples.

Data Governance — H3Africa Framework
This study complies with the H3Africa Consortium Data Access Policy (v3.0). Specifically:
  • Genomic data will not be stored outside Africa without explicit CAB and ethics approval
  • A Data Access Committee (DAC) will review all external data access requests
  • De-identified datasets will be deposited in the H3Africa Biorepository and Data Repository
  • Results will be returned to participants through community clinics within 18 months of analysis

Privacy and Security
All participant data will be pseudonymised at the point of collection. Identifiable data will be stored in encrypted servers at ${d.institution} accessible only to named investigators. Cloud-based computation will use de-identified data only.

Benefit Sharing
A proportion of any intellectual property generated from this work will be held by ${d.institution} as the African institution of record. Any diagnostic tools developed will be licensed on terms that enable affordable access in LMIC settings.`,
  };

  /* ─── Disease burden data (for auto-population) ─── */
  const BURDEN_DATA = {
    malaria:       'the WHO estimates approximately 249 million cases and 608,000 deaths occur globally each year, with over 95% of the burden concentrated in sub-Saharan Africa',
    tuberculosis:  'Africa carries nearly 25% of the global TB burden, with an estimated 2.5 million new cases annually and alarming rates of drug-resistant TB emerging across the continent',
    hiv:           'sub-Saharan Africa accounts for approximately 69% of people living with HIV globally, representing approximately 25.6 million individuals',
    sickle_cell:   'sickle cell disease affects approximately 300,000 newborns per year in Africa, representing over 75% of the global burden, yet receives a fraction of the research attention of rarer genetic diseases',
    cancer:        'Africa faces a rapidly growing cancer burden, projected to double to 1.1 million deaths per year by 2030 due to demographic change, limited screening, and late-stage presentation',
    diabetes:      'Africa has the highest proportion of undiagnosed diabetes globally (~60%), with an estimated 24 million adults affected and projections rising to 55 million by 2045',
    hypertension:  'hypertension affects approximately 130 million adults in Africa and is the leading attributable risk factor for cardiovascular mortality on the continent',
    helminth:      'soil-transmitted helminths and schistosomiasis infect an estimated 800 million people in sub-Saharan Africa, with profound impacts on child development and workforce productivity',
  };

  /* ─── Method descriptions ─── */
  const METHOD_DESCS = {
    'Whole Genome Sequencing': 'unbiased, base-resolution characterisation of the entire genome, enabling discovery of SNPs, indels, structural variants, and copy number alterations simultaneously',
    'RNA-seq': 'genome-wide quantification of gene expression, enabling identification of differentially expressed genes, novel transcripts, and splicing variants relevant to disease pathogenesis',
    'ATAC-seq': 'mapping of chromatin accessibility at single-nucleotide resolution, revealing regulatory elements and transcription factor binding landscapes that drive disease-relevant gene programs',
    'ChIP-seq': 'genome-wide mapping of protein–DNA interactions, enabling identification of transcription factor binding sites and histone modification patterns',
    'Metagenomics': 'culture-independent characterisation of complex microbial communities, enabling taxonomic and functional profiling of the microbiome in health and disease',
    'Single-cell RNA-seq': 'transcriptomic profiling at single-cell resolution, enabling identification of rare cell populations and cell-type-specific responses that are obscured in bulk analyses',
    'Proteomics': 'large-scale identification and quantification of the protein complement of a biological sample, enabling discovery of disease biomarkers and therapeutic targets',
    'Metabolomics': 'comprehensive profiling of small-molecule metabolites in biological fluids, providing a dynamic readout of host–pathogen–microbiome interactions',
  };

  /* ─── Build document data from form ─── */
  function _collectFormData() {
    const get = id => (document.getElementById(id)?.value || '').trim();
    const getN = (id, def) => parseFloat(document.getElementById(id)?.value) || def;

    const approach = get('gr-approach') || 'Whole Genome Sequencing';
    const disease  = get('gr-disease') || 'a priority infectious disease';
    const country  = get('gr-country') || 'South Africa';
    const samples  = getN('gr-samples', 100);
    const budget   = getN('gr-budget', 500000);
    const currency = get('gr-currency') || 'USD';
    const disKey   = disease.toLowerCase().replace(/\s+/g,'_').replace(/[^a-z_]/g,'');

    /* Wet lab steps from protocols if available */
    const myProtos = JSON.parse(localStorage.getItem('omicslab_my_protocols_v1') || '[]');
    const proto = myProtos[0];
    const wetLabSteps = proto
      ? proto.steps.map(s => `  • Step ${s.n}: ${s.title} — ${s.detail}`).join('\n')
      : `  • Blood/tissue collection using ${get('gr-sample-type') || 'EDTA blood tubes'} following standard phlebotomy
  • DNA/RNA extraction using column-based or bead-based method validated for African tropical samples
  • Quality control using Qubit fluorometry and Bioanalyzer/TapeStation (RIN ≥ 7 required)
  • Library preparation targeting ${get('gr-depth') || '30'}× genome coverage per sample`;

    const bioinfoPipeline = `\
  Raw reads will be quality-trimmed with fastp and aligned to the human reference genome (GRCh38 with African-specific alternate loci) using BWA-MEM2. Duplicate marking will be performed with Picard MarkDuplicates. Base quality score recalibration (BQSR) and variant calling will use GATK4 HaplotypeCaller in GVCF mode with joint genotyping across all ${samples} samples. Variants will be filtered using VQSR and annotated with Ensembl VEP (v110) against clinically relevant databases including ClinVar, gnomAD v3.1 (which includes 12,487 African genomes), and the AWI-Gen GWAS catalogue.`;

    const pitfalls = `\
  Challenge 1 — Sample attrition: We anticipate up to 15% dropout. Contingency: over-recruit by 20% (${Math.round(samples * 1.2)} initial enrolees).
  Challenge 2 — Poor DNA quality from tropical storage: Contingency: validated storage protocol using RNAlater/buffer ATL, and a backup extraction method (CTAB) for degraded samples.
  Challenge 3 — Population stratification: Contingency: principal component analysis and use of African-ancestry-specific reference panels from the African Genome Variation Project.
  Challenge 4 — Compute cost overrun: Contingency: negotiate HPC allocation from CHPC (South Africa) or AWIGEN consortium cloud credits.`;

    return {
      title:       get('gr-title') || `Genomic Epidemiology of ${disease} in ${country}`,
      disease,
      region:      get('gr-region') || 'sub-Saharan Africa',
      country,
      institution: get('gr-institution') || 'University of Cape Town',
      approach,
      dataType:    get('gr-datatype') || 'genomic',
      samples,
      budget,
      currency,
      depth:       getN('gr-depth', 30),
      language:    get('gr-lang') || 'Zulu/Xhosa',
      studyDesign: get('gr-design') || 'prospective case-control',
      recruitment: get('gr-recruitment') || 'outpatient clinic referral',
      ethics:      get('gr-ethics') || 'University of Cape Town Human Research',
      kitCost:     300,
      seqCost:     150,
      gbPerSample: 90,
      burden:      BURDEN_DATA[disKey] || `the disease represents a significant and growing health challenge in ${get('gr-region') || 'Africa'}`,
      pilotResult: 'adequate library quality with mean insert size 350 bp and duplication rates < 15%',
      methodDesc:  METHOD_DESCS[approach] || 'systematic characterisation of molecular profiles at scale',
      libraryPrep: approach.includes('RNA') ? 'Illumina Stranded Total RNA Prep with Ribo-Zero' : 'Illumina DNA PCR-Free Prep',
      instrument:  'Illumina NovaSeq 6000 (S4 flow cell)',
      wetLabSteps,
      bioinfoPipeline,
      pitfalls,
      budgetPct: { personnel: 45, lab: 30, compute: 10, training: 8, overhead: 7 },
      funder:    get('gr-funder') || 'NIH Fogarty / Wellcome Trust / H3Africa',
    };
  }

  /* ─── Render output ─── */
  function _generate() {
    const d = _collectFormData();
    const sections = _getSelectedSections();
    if (!sections.length) { _toast('Select at least one section to generate.', true); return; }

    const output = sections.map(s => TEMPLATES[s](d)).join('\n\n' + '─'.repeat(72) + '\n\n');

    const outEl = document.getElementById('gr-output');
    if (!outEl) return;
    outEl.textContent = output;
    outEl.parentElement.style.display = '';
    document.getElementById('gr-output-panel').scrollIntoView({ behavior: 'smooth', block: 'start' });
    _toast('Grant text generated — review and edit before submitting');
  }

  function _getSelectedSections() {
    return ['aims','background','methods','budget','ethics'].filter(s => {
      const el = document.getElementById('gr-sec-' + s);
      return el && el.checked;
    });
  }

  function _copyOutput() {
    const el = document.getElementById('gr-output');
    if (!el || !el.textContent) return;
    navigator.clipboard.writeText(el.textContent).then(() => {
      const btn = document.getElementById('gr-copy-btn');
      if (btn) { const o = btn.textContent; btn.textContent = 'Copied!'; btn.style.color = '#00C4A0'; setTimeout(() => { btn.textContent = o; btn.style.color = ''; }, 2000); }
    });
  }

  function _downloadOutput() {
    const el = document.getElementById('gr-output');
    if (!el || !el.textContent) return;
    const blob = new Blob([el.textContent], { type: 'text/plain' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = 'OmicsLab_Grant_' + Date.now() + '.txt';
    a.click();
    URL.revokeObjectURL(url);
  }

  function _toast(msg, isError) {
    if (isError) OmicsLab.Notify.error(msg);
    else OmicsLab.Notify.success(msg);
  }

  /* ─── Auto-fill from last lab session ─── */
  function _autoFill() {
    const session = JSON.parse(localStorage.getItem('omicslab_last_session') || '{}');
    if (!session.domain) { _toast('No recent lab session found — fill the form manually.', true); return; }
    const wf = session.workflowName || session.domain || '';
    const di = (session.disease || '').toLowerCase();

    if (wf && document.getElementById('gr-approach')) document.getElementById('gr-approach').value = wf;
    if (di && document.getElementById('gr-disease'))  document.getElementById('gr-disease').value  = di;
    if (session.score && document.getElementById('gr-pilot')) {
      document.getElementById('gr-pilot').value = `OmicsLab simulation score ${session.score}/100`;
    }
    _toast('Auto-filled from last lab session');
  }

  /* ─── Render page ─── */
  function init() {
    const section = document.getElementById('grant-section');
    if (!section || section.dataset.grantReady) return;
    section.dataset.grantReady = '1';

    section.innerHTML = `
      <div class="grant-wrap">
        <div class="grant-header">
          <div>
            <div class="grant-badge">GRANT GENERATOR</div>
            <h2 class="grant-title">Grant Application Text Generator</h2>
            <p class="grant-subtitle">Fill in your study details and generate professionally structured, IRB-ready grant sections — Specific Aims, Background, Methods, Budget, and Ethics — formatted for NIH Fogarty, Wellcome Trust, or H3Africa funding mechanisms. Fully offline.</p>
          </div>
          <div class="grant-funders">
            <span class="grant-funder-tag">NIH Fogarty</span>
            <span class="grant-funder-tag">Wellcome Trust</span>
            <span class="grant-funder-tag">H3Africa</span>
            <span class="grant-funder-tag">MRC UK</span>
          </div>
        </div>

        <!-- Form -->
        <div class="grant-form-grid">

          <!-- Study identity -->
          <div class="grant-card">
            <div class="grant-card-title">Study Details</div>
            <div class="grant-field">
              <label class="grant-label" for="gr-title">Grant title / project name</label>
              <input class="grant-input" id="gr-title" placeholder="e.g. Genomic Epidemiology of Drug-Resistant TB in Ethiopia">
            </div>
            <div class="grant-field-row">
              <div class="grant-field">
                <label class="grant-label" for="gr-disease">Disease / condition</label>
                <input class="grant-input" id="gr-disease" placeholder="e.g. Tuberculosis, Malaria, Sickle Cell">
              </div>
              <div class="grant-field">
                <label class="grant-label" for="gr-approach">Omics approach</label>
                <select class="grant-input" id="gr-approach">
                  <option>Whole Genome Sequencing</option>
                  <option>RNA-seq</option>
                  <option>ATAC-seq</option>
                  <option>ChIP-seq</option>
                  <option>Metagenomics</option>
                  <option>Single-cell RNA-seq</option>
                  <option>Proteomics</option>
                  <option>Metabolomics</option>
                </select>
              </div>
            </div>
            <div class="grant-field-row">
              <div class="grant-field">
                <label class="grant-label" for="gr-country">Country</label>
                <select class="grant-input" id="gr-country">
                  <option>South Africa</option><option>Nigeria</option><option>Kenya</option>
                  <option>Ethiopia</option><option>Uganda</option><option>Ghana</option>
                  <option>Tanzania</option><option>Senegal</option><option>Cameroon</option>
                  <option>Zimbabwe</option><option>Zambia</option><option>Malawi</option>
                  <option>Botswana</option><option>Rwanda</option><option>Egypt</option>
                </select>
              </div>
              <div class="grant-field">
                <label class="grant-label" for="gr-region">Broader region</label>
                <input class="grant-input" id="gr-region" placeholder="e.g. East Africa" value="sub-Saharan Africa">
              </div>
            </div>
            <div class="grant-field">
              <label class="grant-label" for="gr-institution">Host institution</label>
              <input class="grant-input" id="gr-institution" placeholder="e.g. KEMRI, UCT, Makerere University">
            </div>
          </div>

          <!-- Methods -->
          <div class="grant-card">
            <div class="grant-card-title">Study Parameters</div>
            <div class="grant-field-row">
              <div class="grant-field">
                <label class="grant-label" for="gr-samples">Sample size (n)</label>
                <input class="grant-input" id="gr-samples" type="number" min="10" max="10000" value="200" placeholder="200">
              </div>
              <div class="grant-field">
                <label class="grant-label" for="gr-depth">Sequencing depth (×)</label>
                <input class="grant-input" id="gr-depth" type="number" min="1" max="3000" value="30" placeholder="30">
              </div>
            </div>
            <div class="grant-field-row">
              <div class="grant-field">
                <label class="grant-label" for="gr-design">Study design</label>
                <select class="grant-input" id="gr-design">
                  <option>prospective case-control</option>
                  <option>longitudinal cohort</option>
                  <option>cross-sectional</option>
                  <option>randomised controlled trial</option>
                  <option>retrospective</option>
                </select>
              </div>
              <div class="grant-field">
                <label class="grant-label" for="gr-datatype">Data type</label>
                <select class="grant-input" id="gr-datatype">
                  <option>genomic</option><option>transcriptomic</option>
                  <option>epigenomic</option><option>metagenomic</option>
                  <option>proteomic</option><option>metabolomic</option>
                </select>
              </div>
            </div>
            <div class="grant-field-row">
              <div class="grant-field">
                <label class="grant-label" for="gr-recruitment">Recruitment method</label>
                <input class="grant-input" id="gr-recruitment" placeholder="e.g. outpatient clinic referral">
              </div>
              <div class="grant-field">
                <label class="grant-label" for="gr-lang">Local consent language</label>
                <input class="grant-input" id="gr-lang" placeholder="e.g. Kiswahili, Zulu, Amharic">
              </div>
            </div>
            <div class="grant-field">
              <label class="grant-label" for="gr-ethics">Ethics committee name</label>
              <input class="grant-input" id="gr-ethics" placeholder="e.g. University of Nairobi Ethics Review">
            </div>
          </div>

          <!-- Budget -->
          <div class="grant-card">
            <div class="grant-card-title">Budget &amp; Funder</div>
            <div class="grant-field-row">
              <div class="grant-field">
                <label class="grant-label" for="gr-budget">Total budget amount</label>
                <input class="grant-input" id="gr-budget" type="number" min="1000" value="500000" placeholder="500000">
              </div>
              <div class="grant-field">
                <label class="grant-label" for="gr-currency">Currency</label>
                <select class="grant-input" id="gr-currency">
                  <option>USD</option><option>GBP</option><option>EUR</option>
                  <option>ZAR</option><option>KES</option><option>NGN</option>
                </select>
              </div>
            </div>
            <div class="grant-field">
              <label class="grant-label" for="gr-funder">Target funder</label>
              <select class="grant-input" id="gr-funder">
                <option>NIH Fogarty International Center</option>
                <option>Wellcome Trust</option>
                <option>H3Africa</option>
                <option>MRC UK</option>
                <option>Bill &amp; Melinda Gates Foundation</option>
                <option>African Academy of Sciences</option>
                <option>ERC Global Challenges Research Fund</option>
              </select>
            </div>
          </div>

          <!-- Sections to generate -->
          <div class="grant-card">
            <div class="grant-card-title">Sections to Generate</div>
            <div class="grant-sections-grid">
              ${[
                {id:'aims',       label:'Specific Aims',     desc:'3-aim structure with long-term goal'},
                {id:'background', label:'Background',        desc:'Burden data, gap analysis, innovation'},
                {id:'methods',    label:'Approach & Methods',desc:'Study design, wet lab, bioinformatics, stats'},
                {id:'budget',     label:'Budget Justification',desc:'Personnel, lab, compute, training breakdown'},
                {id:'ethics',     label:'Ethics & Governance',desc:'Consent, H3Africa framework, benefit sharing'},
              ].map(s => `
                <label class="grant-sec-check">
                  <input type="checkbox" id="gr-sec-${s.id}" ${s.id === 'aims' || s.id === 'methods' ? 'checked' : ''}>
                  <div class="grant-sec-body">
                    <span class="grant-sec-label">${s.label}</span>
                    <span class="grant-sec-desc">${s.desc}</span>
                  </div>
                </label>`).join('')}
            </div>
            <div class="grant-actions">
              <button class="grant-autofill-btn" onclick="OmicsLab.Grant._autoFill()">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>
                Auto-fill from Lab Session
              </button>
              <button class="grant-generate-btn" onclick="OmicsLab.Grant._generate()">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                Generate Grant Text
              </button>
            </div>
          </div>

        </div>

        <!-- Output panel -->
        <div id="gr-output-panel" style="display:none;margin-top:1.5rem">
          <div class="grant-output-header">
            <div class="grant-output-label">Generated Grant Text</div>
            <div class="grant-output-actions">
              <button class="grant-out-btn" id="gr-copy-btn" onclick="OmicsLab.Grant._copyOutput()">Copy All</button>
              <button class="grant-out-btn" onclick="OmicsLab.Grant._downloadOutput()">Download .txt</button>
              <button class="grant-out-btn grant-ai-polish-btn" onclick="OmicsLab.Grant._aiPolish()">AI Polish with Claude</button>
            </div>
          </div>
          <pre class="grant-output" id="gr-output"></pre>
          <div class="grant-disclaimer">
            ${OmicsLab.Icons?.svg('alert-triangle', 14) || ''} This text is AI-assisted and uses template language. Always review, fact-check, and customise before submission. Pilot data, actual IRB details, and institutional signatures must be added by you. OmicsLab provides structure, not a substitute for scientific writing.
          </div>
        </div>

        <!-- Tips panel -->
        <div class="grant-tips">
          <div class="grant-tips-title">Writing tips for African-context grants</div>
          <div class="grant-tips-grid">
            <div class="grant-tip">
              <div class="grant-tip-icon">${OmicsLab.Icons?.svg('target', 20) || ''}</div>
              <div class="grant-tip-text"><strong>Lead with burden</strong> — Open with Africa-specific disease burden statistics from WHO AFRO or GBD. Reviewers want to see continental context before global numbers.</div>
            </div>
            <div class="grant-tip">
              <div class="grant-tip-icon">${OmicsLab.Icons?.svg('globe', 20) || ''}</div>
              <div class="grant-tip-text"><strong>Cite H3Africa policies</strong> — Wellcome Trust and NIH Fogarty expect explicit reference to H3Africa Data Access Policy and FAIR principles for data sharing.</div>
            </div>
            <div class="grant-tip">
              <div class="grant-tip-icon">${OmicsLab.Icons?.svg('dna', 20) || ''}</div>
              <div class="grant-tip-text"><strong>Name African reference panels</strong> — Mention AWI-Gen, H3Africa, or African Genome Variation Project as reference populations. This signals awareness of population-specific methodology.</div>
            </div>
            <div class="grant-tip">
              <div class="grant-tip-icon">${OmicsLab.Icons?.svg('file-text', 20) || ''}</div>
              <div class="grant-tip-text"><strong>Quantify capacity building</strong> — Funders value mentorship. State exact numbers: "training 3 PhD students + 12 workshop participants" beats "building capacity".</div>
            </div>
            <div class="grant-tip">
              <div class="grant-tip-icon">${OmicsLab.Icons?.svg('link', 20) || ''}</div>
              <div class="grant-tip-text"><strong>Community advisory board</strong> — H3Africa and Wellcome require evidence of community engagement. Name your CAB structure and when it was formed, even in early proposals.</div>
            </div>
            <div class="grant-tip">
              <div class="grant-tip-icon">${OmicsLab.Icons?.svg('scale', 20) || ''}</div>
              <div class="grant-tip-text"><strong>Justify every line item</strong> — African grant reviewers often query whether costs are appropriate for local context. Cite local market rates or consortium pricing for kits and sequencing.</div>
            </div>
          </div>
        </div>

        <!-- Grants database -->
        <div class="grant-db-wrap">
          <div class="grant-db-hdr">
            <div>
              <div class="grant-db-title">African Grants Database</div>
              <div class="grant-db-sub">${GRANTS_DB.length} funding opportunities for African researchers</div>
            </div>
            <div class="grant-db-controls">
              <input class="grant-db-search" id="gr-db-q" placeholder="Search funders, disease, keywords..." oninput="OmicsLab.Grant._filterGrants()">
              <select class="grant-db-filter" id="gr-db-type" onchange="OmicsLab.Grant._filterGrants()">
                <option value="">All types</option>
                <option>Research</option>
                <option>Capacity Building</option>
                <option>Early Career</option>
                <option>Infrastructure</option>
              </select>
            </div>
          </div>
          <div id="gr-db-list" class="grant-db-list"></div>
        </div>
      </div>`;

    _renderGrantsList('', '');
  }

  function _filterGrants() {
    const q = (document.getElementById('gr-db-q')?.value || '').toLowerCase();
    const t = document.getElementById('gr-db-type')?.value || '';
    _renderGrantsList(q, t);
  }

  function _renderGrantsList(q, typeFilter) {
    const list = document.getElementById('gr-db-list');
    if (!list) return;
    const matches = GRANTS_DB.filter(g => {
      const txt = (g.funder + g.name + g.focus + g.type + g.regions.join(' ')).toLowerCase();
      return (!q || txt.includes(q)) && (!typeFilter || g.type === typeFilter);
    });
    if (!matches.length) { list.innerHTML = '<div class="grant-db-empty">No grants match your search.</div>'; return; }
    const typeColor = { Research:'#58a6ff', 'Capacity Building':'#00C4A0', 'Early Career':'#bc8cff', Infrastructure:'#e3b341' };
    list.innerHTML = matches.map(g => `
      <div class="grant-db-card">
        <div class="grant-db-card-hdr">
          <div>
            <div class="grant-db-funder">${g.funder}</div>
            <div class="grant-db-name">${g.name}</div>
          </div>
          <span class="grant-db-type-badge" style="color:${typeColor[g.type]||'#A8A098'};border-color:${typeColor[g.type]||'#243048'}">${g.type}</span>
        </div>
        <div class="grant-db-meta">
          <span class="grant-db-amount">${g.amount}</span>
          <span class="grant-db-regions">${g.regions.join(' · ')}</span>
        </div>
        <div class="grant-db-focus">${g.focus}</div>
        <div class="grant-db-footer">
          <span class="grant-db-deadline">Deadline: ${g.deadline}</span>
          <a class="grant-db-link" href="${g.url}" target="_blank" rel="noopener">Learn more</a>
        </div>
      </div>`).join('');
  }

  function _aiPolish() {
    const el = document.getElementById('gr-output');
    if (!el || !el.textContent.trim()) { _toast('Generate grant text first, then AI Polish.', true); return; }
    const generated = el.textContent.trim().substring(0, 3000);
    const ctx = `The user has generated the following grant text using OmicsLab Grant Generator. Please polish it for clarity, improve the scientific language, and strengthen the Africa-specific framing. Keep all factual content and structure but improve readability and impact:\n\n---\n${generated}\n---`;
    if (OmicsLab.Assistant && OmicsLab.Assistant.setContext) {
      OmicsLab.Assistant.setContext(ctx);
    }
    if (OmicsLab.Router) OmicsLab.Router.navigate('ai');
    _toast('Sending to AI assistant — ask it to polish the text');
  }

  return { init, _generate, _autoFill, _copyOutput, _downloadOutput, _filterGrants, _aiPolish };
})();
