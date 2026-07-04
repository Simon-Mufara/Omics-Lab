/* ═══════════════════════════════════════════════════════════════
   OmicsLab — Workflow Definitions
   All 14 workflows across 8 omics domains
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.REAGENTS = {
  /* Extraction & lysis */
  'dneasy':        { label: 'DNeasy Kit',         emoji: '', cat: 'Extraction' },
  'phenol-ci':     { label: 'Phenol-Chloroform',  emoji: '⚗️',  cat: 'Extraction' },
  'trizol':        { label: 'TRIzol',             emoji: '', cat: 'Extraction' },
  'trizol-col':    { label: 'TRIzol + Column',    emoji: '', cat: 'Extraction' },
  'rneasy':        { label: 'RNeasy Kit',         emoji: '', cat: 'Extraction' },
  'boiling':       { label: 'Boiling Water',      emoji: '', cat: 'DIY' },
  'powersoil':     { label: 'PowerSoil Kit',      emoji: '🪨', cat: 'Extraction' },
  'powerlyzer':    { label: 'PowerLyzer Pro',     emoji: '⚙️',  cat: 'Mechanical' },
  'zymobiomics':   { label: 'ZymoBIOMICS',        emoji: '', cat: 'Extraction' },
  'acetonitrile':  { label: 'Acetonitrile (ACN)', emoji: '', cat: 'Precipitation' },
  'methanol':      { label: 'Methanol',           emoji: '', cat: 'Precipitation' },
  'pbs-lysis':     { label: 'PBS (no lysis)',     emoji: '', cat: 'Buffer' },
  'digitonin':     { label: 'Digitonin Lysis',    emoji: '', cat: 'Lysis' },
  'np40-lysis':    { label: 'NP-40 Lysis Buffer', emoji: '', cat: 'Lysis' },
  'sds-lysis':     { label: 'SDS Lysis (1%)',     emoji: '[!]️',  cat: 'Lysis' },
  /* Enzymes & reagents */
  'tn5':           { label: 'Tn5 Transposase',    emoji: '️',  cat: 'Enzyme' },
  'tn5-low':       { label: 'Tn5 (Low conc.)',    emoji: '️',  cat: 'Enzyme' },
  'proteinase-k':  { label: 'Proteinase K',       emoji: '', cat: 'Enzyme' },
  'rnase-a':       { label: 'RNase A',            emoji: '', cat: 'Enzyme' },
  'dnase':         { label: 'DNase I',            emoji: '', cat: 'Enzyme' },
  'collagenase':   { label: 'Collagenase IV',     emoji: '', cat: 'Enzyme' },
  'trypsin':       { label: 'Trypsin-EDTA',       emoji: '', cat: 'Enzyme' },
  /* Antibodies */
  'chipgrade-ab':  { label: 'ChIP-grade Ab',      emoji: '', cat: 'Antibody' },
  'ihc-ab':        { label: 'IHC-grade Ab',       emoji: '', cat: 'Antibody' },
  'expired-ab':    { label: 'Expired Ab (−20°C)', emoji: '[!]️',  cat: 'Antibody' },
  'no-ab':         { label: 'No antibody (ctrl)', emoji: '[FAIL]', cat: 'Antibody' },
  /* Kits */
  'nextera-xt':    { label: 'Nextera XT Kit',     emoji: '', cat: 'Library Prep' },
  'truseq':        { label: 'TruSeq Nano',        emoji: '', cat: 'Library Prep' },
  'smartseq':      { label: 'Smart-seq3xpress',   emoji: '', cat: 'Library Prep' },
  'kapa-hifi':     { label: 'KAPA HiFi Master',   emoji: '', cat: 'PCR' },
  'phusion':       { label: 'Phusion Polymerase', emoji: '', cat: 'PCR' },
  'taq':           { label: 'Taq Polymerase',     emoji: '', cat: 'PCR' },
  /* Sample types */
  'fresh-tissue':  { label: 'Fresh Frozen Tissue',emoji: '🧊', cat: 'Sample' },
  'ffpe':          { label: 'FFPE Block',         emoji: '🧱', cat: 'Sample' },
  'blood-edta':    { label: 'EDTA Blood',         emoji: '🩸', cat: 'Sample' },
  'cultured-cells':{ label: 'Cultured Cells',     emoji: '🫧', cat: 'Sample' },
  'stool':         { label: 'Stool Sample',       emoji: '💩', cat: 'Sample' },
  'urine':         { label: 'Urine (−80°C)',      emoji: '', cat: 'Sample' },
  'serum':         { label: 'Serum (−80°C)',      emoji: '', cat: 'Sample' },
  /* Buffers & beads */
  'ampure-xp':     { label: 'AMPure XP Beads',   emoji: '', cat: 'Cleanup' },
  'spri-03x':      { label: 'SPRI (0.3×)',        emoji: '', cat: 'Cleanup' },
  'dtt':           { label: 'DTT',                emoji: '', cat: 'Reducing agent' },
  'iaa':           { label: 'Iodoacetamide (IAA)',emoji: '', cat: 'Alkylation' },
  'trypsin-prot':  { label: 'Trypsin (Prot.)',    emoji: '️',  cat: 'Protease' },
  'lys-c':         { label: 'Lys-C Protease',     emoji: '️',  cat: 'Protease' },
  'glu-c':         { label: 'Glu-C Protease',     emoji: '️',  cat: 'Protease' },
  /* Primers */
  'univ-16s':      { label: '515F/806R Primers',  emoji: '', cat: 'Primers' },
  'wrong-16s':     { label: '27F/1492R (too long)',emoji: '', cat: 'Primers' },
  'virus-primers': { label: 'ARTIC v4.1 Primers', emoji: '', cat: 'Primers' },
  'random-hex':    { label: 'Random Hexamers',    emoji: '', cat: 'Primers' },
  /* Internal standards */
  'istd-mix':      { label: 'Internal Std Mix',   emoji: '⚖️',  cat: 'Standard' },
  'no-istd':       { label: 'No Internal Std',    emoji: '[FAIL]', cat: 'Standard' },
  /* Misc */
  'cold-protease': { label: 'Cold Protease (4°C)',emoji: '❄️',  cat: 'Dissociation' },
  '10x-v3':        { label: '10x Chromium (v3.1)',emoji: '', cat: 'Chip' },
  '10x-v2':        { label: '10x Chromium (v2)',  emoji: '', cat: 'Chip' },
  'visium-chip':   { label: 'Visium Capture Area',emoji: '🗺️',  cat: 'Chip' },
  'wrong-chip':    { label: '10x Visium (wrong)', emoji: '[!]️',  cat: 'Chip' },
  'cite-ab-panel': { label: 'TotalSeq-B Ab Panel',emoji: '🏷️',  cat: 'Antibody' },
  'cite-no-ab':    { label: 'No Ab Panel',        emoji: '[FAIL]', cat: 'Antibody' },

  /* ── Thermo Fisher Scientific ── */
  'superscript-iv':{ label: 'SuperScript IV VILO',  cat: 'Enzyme' },
  'purelink-rna':  { label: 'PureLink RNA Mini Kit', cat: 'Extraction' },
  'magmax-rna':    { label: 'MagMAX mirVana RNA',    cat: 'Extraction' },
  'taqman-mm':     { label: 'TaqMan Adv. Master Mix',cat: 'PCR' },
  'sybr-adv':      { label: 'PowerUp SYBR Green',   cat: 'PCR' },
  'ion-amp-lib':   { label: 'Ion AmpliSeq Lib+ Kit', cat: 'Library Prep' },

  /* ── QIAGEN ── */
  'qiaseq-fx':     { label: 'QIAseq FX DNA Lib Kit', cat: 'Library Prep' },
  'qiaseq-stranded':{ label: 'QIAseq Stranded RNA',  cat: 'Library Prep' },
  'qiamp-viral':   { label: 'QIAamp Viral RNA Kit',  cat: 'Extraction' },
  'qiamp-ffdna':   { label: 'QIAamp DNA FFPE Kit',   cat: 'Extraction' },
  'mirneasy':      { label: 'miRNeasy Mini Kit',      cat: 'Extraction' },
  'hotstar-taq':   { label: 'HotStarTaq Plus MM',    cat: 'PCR' },
};

/* ── Quality function presets (resolved by engine) ── */
OmicsLab.QFns = {
  linear_from_optimal: (v, optimal, range) => {
    const d = Math.abs(v - optimal);
    const frac = d / (range / 2);
    return Math.min(frac * 1.5, 1.5);
  },
  sharp_threshold: (v, optimal, range) => {
    const d = Math.abs(v - optimal);
    return d > range * 0.25 ? 1.5 : d > range * 0.1 ? 0.6 : 0;
  }
};

/* ── Helper to build a slider step ── */
function sliderStep(id, phase, title, desc, edu, pipelineStage, min, max, optimal, unit, label, qfn, deltas) {
  return { id, phase, title, desc, edu, pipelineStage, type: 'slider',
           min, max, optimal, unit, label, qfn,
           quality_fn: deltas.quality_fn,
           score_fn:   deltas.score_fn };
}

/* ── Helper to build a choice step ── */
function choiceStep(id, phase, title, desc, edu, pipelineStage, options) {
  return { id, phase, title, desc, edu, pipelineStage, type: 'choice', options };
}

/* ── Helper to build a drag step ── */
function dragStep(id, phase, title, desc, edu, pipelineStage, equipIcon, equipName, dropHint, reagentIds, optionMap) {
  return { id, phase, title, desc, edu, pipelineStage, type: 'drag',
           equipIcon, equipName, dropHint, reagentIds, optionMap };
}

/* ══════════════════════════════════════════════════════════════
   WORKFLOW DEFINITIONS
   ══════════════════════════════════════════════════════════════ */
OmicsLab.Workflows = {};

/* ────────────────────────────────────────────────────────────
   1. WGS — Whole Genome Sequencing
   ──────────────────────────────────────────────────────────── */
OmicsLab.Workflows['wgs'] = {
  id:'wgs', domain:'genomics', domainLabel:'Genomics',
  name:'Whole Genome Sequencing', difficulty:'intermediate', icon:'dna',
  color:'var(--genomics)', colorHex:'#58a6ff',
  desc:'Extract high-MW genomic DNA, build a short-read library, sequence at 30×, and call variants against a reference genome.',
  pipeline:['DNA Extraction','QC','Fragmentation','Library Prep','Sequencing','Trimming','BWA-MEM2 Align','GATK HC','Annotation'],
  steps:[
    dragStep('dna-source','Sample Preparation','Select Sample Type',
      'Drag the appropriate sample type onto the DNA extraction tube.',
      'High-molecular-weight DNA is critical for WGS. FFPE tissue has crosslinked, fragmented DNA — alignment rates drop below 70% from FFPE. Fresh blood or frozen tissue gives 10–50 kb fragments before deliberate fragmentation.',
      0,'droplet','DNA Extraction Tube','Drop sample type here',
      ['fresh-tissue','blood-edta','ffpe','cultured-cells'],
      { 'fresh-tissue':  { impact:'good', score:0,   quality:{} },
        'blood-edta':    { impact:'good', score:0,   quality:{} },
        'cultured-cells':{ impact:'good', score:0,   quality:{} },
        'ffpe':          { impact:'bad',  score:-22, quality:{ sampleIntegrity:-40, purity:-15 } } }),

    dragStep('dna-extraction','Sample Preparation','DNA Extraction Kit',
      'Choose the extraction kit and drag it to the bead mill / column.',
      'Column-based kits (DNeasy) give consistently high purity (A260/280 ~ 1.8–1.9) but slightly lower yield than phenol-chloroform. Phenol-chloroform carries-over phenol that inhibits downstream enzymes. Boiling denatures DNA irreversibly.',
      0,'flask','Spin Column / Bead Mill','Drag extraction kit here',
      ['dneasy','phenol-ci','trizol','boiling'],
      { 'dneasy':   { impact:'good', score:0,   quality:{} },
        'trizol':   { impact:'warn', score:-5,  quality:{ purity:-10 } },
        'phenol-ci':{ impact:'warn', score:-10, quality:{ purity:-22, sampleIntegrity:-8 } },
        'boiling':  { impact:'bad',  score:-35, quality:{ sampleIntegrity:-70, yield:-50 } } }),

    { id:'fragment-size', phase:'Library Preparation', title:'Set Sonication Fragment Size',
      desc:'Target fragment size (bp) for the library — set the Covaris S220 duty cycle to achieve this.',
      edu:'Illumina sequencing reads 150 bp paired-end. Libraries should be fragmented to 350–550 bp insert size to maximise usable sequence. Too small (<150 bp): adapter-dominated reads. Too large (>800 bp): poor cluster amplification on the flow cell.',
      pipelineStage:2, type:'slider', min:100, max:1000, optimal:400, unit:'bp', label:'Target fragment size',
      quality_fn:(v)=>{ if(v<200||v>700){return{libraryComplexity:-20,duplication:10};} if(v<250||v>600){return{libraryComplexity:-8};} return{}; },
      score_fn:(v)=>{ const d=Math.abs(v-400); return d>300?-20:d>150?-8:0; } },

    choiceStep('adapter','Library Preparation','Adapter & Index Selection',
      'Which adapter chemistry will you use for multiplexed sequencing?',
      'Illumina TruSeq adapters use Y-shaped ligation and 8-bp dual indices. Nextera XT uses tagmentation (faster) but has higher duplication for low-input samples. Unique dual indexing (UDI) prevents index hopping on patterned flow cells (NovaSeq, NextSeq2000) — essential when demultiplexing >24 samples.',
      3,
      [{ label:'TruSeq Nano + UDI', desc:'Standard ligation-based. Best quality for high-input.', impact:'good', score:0, quality:{} },
       { label:'Nextera XT (tagmentation)', desc:'Faster, lower input. Slightly higher duplication.', impact:'good', score:-3, quality:{ duplication:5 } },
       { label:'TruSeq + IDT (no UDI)', desc:'Single index — index hopping risk on NovaSeq.', impact:'warn', score:-8, quality:{ contamination:8 } },
       { label:'No index (no multiplexing)', desc:'One sample per flow cell — prohibitively expensive.', impact:'warn', score:-5, quality:{} }]),

    { id:'pcr-cycles-wgs', phase:'Library Preparation', title:'PCR Amplification Cycles',
      desc:'Amplify the adapter-ligated library. Set the number of enrichment PCR cycles.',
      edu:'High-input WGS libraries (>500 ng) can often be sequenced without PCR (PCR-free). PCR-free libraries have the lowest duplication rate and best GC coverage uniformity. If PCR is needed, 4–6 cycles is standard. >10 cycles causes duplication bias, especially at GC-extreme regions.',
      pipelineStage:3, type:'slider', min:0, max:18, optimal:5, unit:'cycles', label:'PCR enrichment cycles',
      quality_fn:(v)=>{ if(v===0){return{libraryComplexity:5,duplication:-3};} if(v>10){return{duplication:15+(v-10)*2,libraryComplexity:-12};} return{}; },
      score_fn:(v)=>{ if(v>10){return-15;} if(v>8){return-5;} return 0; } },

    choiceStep('sequencer-wgs','Sequencing','Select Sequencing Platform',
      'Choose the sequencing instrument for WGS.',
      'Illumina NovaSeq X Plus (25B flow cell) gives >10,000 Gb per run at $1/Gb. The older HiSeq 2500 is 10× more expensive per Gb. PacBio HiFi (long-read) gives 15–20 kb reads — excellent for structural variants, but 10× the cost of short-read WGS per Gb.',
      4,
      [{ label:'Illumina NovaSeq X Plus', desc:'Current gold standard. 150 bp PE. Best cost per Gb.', impact:'good', score:0, quality:{} },
       { label:'Illumina NextSeq 2000', desc:'Mid-throughput. Good for smaller projects.', impact:'good', score:0, quality:{ sequencingQ30:-3 } },
       { label:'PacBio HiFi (Revio)', desc:'Long-read. Excellent for SVs but costly per Gb.', impact:'warn', score:-5, quality:{ alignmentRate:3 } },
       { label:'Illumina HiSeq 2500 (legacy)', desc:'Retired instrument. Error-prone, expensive per Gb.', impact:'bad', score:-18, quality:{ sequencingQ30:-15, alignmentRate:-10 } }]),

    choiceStep('variant-caller','Bioinformatics','GATK HaplotypeCaller vs Alternatives',
      'Choose the variant calling algorithm for germline SNP/indel detection.',
      'GATK HaplotypeCaller is the GATK Best Practices standard — it locally re-assembles reads in active regions to improve indel detection. DeepVariant (Google) uses a CNN trained on image representations of pileups and often outperforms GATK on substitution accuracy. FreeBayes is good for non-human organisms. Freeware callers without local reassembly miss complex indels.',
      7,
      [{ label:'GATK HaplotypeCaller', desc:'Best Practices standard. Excellent for SNPs and indels.', impact:'good', score:0, quality:{} },
       { label:'DeepVariant (GPU)', desc:'Often best accuracy. Requires GPU resources.', impact:'good', score:0, quality:{ sequencingQ30:2 } },
       { label:'FreeBayes', desc:'Good open-source alternative. Lower sensitivity for indels.', impact:'good', score:-5, quality:{ alignmentRate:-5 } },
       { label:'SAMtools mpileup (legacy)', desc:'No local reassembly — misses complex variants.', impact:'bad', score:-20, quality:{ libraryComplexity:-15, alignmentRate:-10 } }])
  ]
};

/* ────────────────────────────────────────────────────────────
   2. WES — Whole Exome Sequencing
   ──────────────────────────────────────────────────────────── */
OmicsLab.Workflows['wes'] = {
  id:'wes', domain:'genomics', domainLabel:'Genomics',
  name:'Whole Exome Sequencing', difficulty:'beginner', icon:'dna',
  color:'var(--genomics)', colorHex:'#58a6ff',
  desc:'Capture the 1–2% of the genome that encodes proteins, then sequence at 100× depth for clinical variant detection.',
  pipeline:['DNA Extraction','QC','Library Prep','Exome Capture','Sequencing','Alignment','Variant Calling','Annotation'],
  steps:[
    dragStep('dna-wes','Sample Preparation','Sample & DNA Extraction',
      'Drag the correct extraction kit for clinical exome samples.',
      'Exome sequencing requires high-purity DNA (A260/280 ≥ 1.8). Minimum input is typically 100–200 ng, though some capture kits work from 50 ng. FFPE can be used with specialised kits but requires additional steps to repair oxidative damage.',
      0,'flask','DNA Column','Drop extraction kit here',
      ['blood-edta','dneasy','ffpe','phenol-ci'],
      { 'blood-edta':{ impact:'good', score:0,   quality:{} },
        'dneasy':    { impact:'good', score:0,   quality:{} },
        'ffpe':      { impact:'warn', score:-15, quality:{ sampleIntegrity:-30, purity:-10 } },
        'phenol-ci': { impact:'warn', score:-8,  quality:{ purity:-18 } } }),

    { id:'capture-kit', phase:'Exome Capture', title:'Choose Capture Kit',
      desc:'Select the hybridisation capture panel for exome enrichment.',
      edu:'Exome capture uses biotinylated RNA/DNA baits to pull down exonic sequences. Broader panels (WEX, >98 Mb) cover more UTRs and regulatory regions. Smaller panels (e.g., Agilent SureSelect v8, 35 Mb) are cheaper and give higher on-target reads. Mismatched capture kits for your organism produce almost no on-target reads.',
      pipelineStage:3, type:'choice',
      options:[
        { label:'Agilent SureSelect Human All Exon v8', desc:'Industry standard. 35 Mb. >96% on-target rate.', impact:'good', score:0, quality:{} },
        { label:'IDT xGen Exome Research v2', desc:'Competitive performance. Good for cohort studies.', impact:'good', score:0, quality:{} },
        { label:'Twist Human Core Exome', desc:'High uniformity. Excellent RefSeq coverage.', impact:'good', score:0, quality:{} },
        { label:'Broad ICE (older v1)', desc:'Legacy panel — lower coverage of CCDS exons.', impact:'warn', score:-10, quality:{ alignmentRate:-12, libraryComplexity:-8 } }] },

    { id:'on-target', phase:'Sequencing', title:'Set Target Coverage Depth',
      desc:'How many reads per base do you need for clinical-grade variant calling?',
      edu:'Germline WES for rare disease diagnostics requires ≥100× mean depth on target, with >90% of bases at ≥20×. Somatic tumour/normal WES for cancer requires ≥200× tumour depth. Under-sequencing at <50× causes false negatives for heterozygous variants (minor allele frequency ~50% requires ≥20× to call reliably).',
      pipelineStage:4, type:'slider', min:20, max:400, optimal:150, unit:'×', label:'Mean on-target depth',
      quality_fn:(v)=>{ if(v<60){return{alignmentRate:-15,libraryComplexity:-10};} if(v<100){return{alignmentRate:-5};} return{}; },
      score_fn:(v)=>{ if(v<60){return-20;} if(v<100){return-8;} return 0; } },

    choiceStep('annotation-wes','Bioinformatics','Variant Annotation Tool',
      'Annotate your called variants with clinical and functional significance.',
      'ANNOVAR (combined annotation database) is the standard for rare disease — it integrates ClinVar, OMIM, gnomAD, and splicing predictions. VEP (Ensembl) is open-source and excellent for regulatory annotation. Franklin (Genoox) uses AI to prioritise pathogenic variants. Annotating with a pipeline mismatched to your genome build (GRCh37 vs GRCh38) silently corrupts coordinates — the most common catastrophic error in clinical WES.',
      7,
      [{ label:'ANNOVAR + ClinVar + gnomAD', desc:'Gold standard for rare disease gene discovery.', impact:'good', score:0, quality:{} },
       { label:'VEP (Ensembl)', desc:'Excellent open-source annotation with regulatory features.', impact:'good', score:0, quality:{} },
       { label:'Franklin (Genoox AI)', desc:'AI-assisted pathogenicity classification.', impact:'good', score:0, quality:{} },
       { label:'Wrong genome build (GRCh37 on GRCh38 calls)', desc:'Coordinates corrupted — all downstream analysis invalid.', impact:'bad', score:-40, quality:{ alignmentRate:-50, libraryComplexity:-40 } }])
  ]
};

/* ────────────────────────────────────────────────────────────
   3. Bulk RNA-seq
   ──────────────────────────────────────────────────────────── */
OmicsLab.Workflows['rna-seq'] = {
  id:'rna-seq', domain:'transcriptomics', domainLabel:'Transcriptomics',
  name:'Bulk RNA-seq', difficulty:'beginner', icon:'activity',
  color:'var(--transcripto)', colorHex:'#00C4A0',
  desc:'Quantify genome-wide gene expression by sequencing poly-A selected or rRNA-depleted RNA from tissue or cell populations.',
  pipeline:['RNA Extraction','QC','rRNA Depletion','Library Prep','Sequencing','STAR Align','featureCounts','DESeq2'],
  steps:[
    dragStep('rna-sample','Sample Preparation','Select RNA Source',
      'Drag your sample type to the homogenisation tube.',
      'RNA is the most labile biological molecule — RNases are ubiquitous and active even on surfaces. Snap-frozen tissue in LN₂ preserves RNA integrity (RIN ≥ 8). FFPE tissue has irreversibly degraded, crosslinked RNA — poly-A selection fails, requiring rRNA depletion from as little as 10 ng. Fresh cell culture is ideal.',
      0,'snowflake','Homogenisation Tube','Drop sample here',
      ['fresh-tissue','cultured-cells','ffpe','blood-edta'],
      { 'fresh-tissue':  { impact:'good', score:0,   quality:{} },
        'cultured-cells':{ impact:'good', score:0,   quality:{} },
        'blood-edta':    { impact:'good', score:-3,  quality:{ sampleIntegrity:-5 } },
        'ffpe':          { impact:'bad',  score:-25, quality:{ sampleIntegrity:-50, purity:-15 } } }),

    dragStep('rna-extraction','RNA Extraction','RNA Extraction Method',
      'Select the extraction kit and drag it to the sample tube.',
      'TRIzol gives maximum yield but co-purifies lipids — a column cleanup step is needed. RNeasy gives high purity (A260/280 = 1.9–2.1) with a silica column. Boiling irreversibly degrades RNA and leaves RNases intact.',
      0,'flask','RNA Extraction Column','Drag kit here',
      ['trizol-col','rneasy','trizol','boiling'],
      { 'trizol-col':{ impact:'good', score:0,   quality:{} },
        'rneasy':    { impact:'good', score:0,   quality:{} },
        'trizol':    { impact:'warn', score:-8,  quality:{ purity:-20 } },
        'boiling':   { impact:'bad',  score:-30, quality:{ sampleIntegrity:-60, yield:-40 } } }),

    choiceStep('rrna-method','Library Preparation','rRNA Removal Strategy',
      'Remove ribosomal RNA (85–95% of total RNA) to enrich for coding transcripts.',
      'Poly-A selection (oligo-dT beads) captures polyadenylated mRNAs — perfect for coding gene expression but misses lncRNAs, circRNAs, and bacterial RNA. rRNA depletion (RiboZero Plus) works on total RNA including degraded FFPE samples. Skipping rRNA removal wastes >85% of reads on uninformative rRNA.',
      2,
      [{ label:'Poly-A selection (oligo-dT)', desc:'Best for high-quality RNA and mRNA-focused studies.', impact:'good', score:0, quality:{} },
       { label:'RiboZero Plus (rRNA depletion)', desc:'Captures all RNA types. Works on degraded samples.', impact:'good', score:0, quality:{} },
       { label:'No rRNA removal', desc:'>85% of reads will be ribosomal — data unusable for DE.', impact:'bad', score:-35, quality:{ libraryComplexity:-70, alignmentRate:-30 } },
       { label:'DNase only (forgot rRNA step)', desc:'Removes DNA but not rRNA.', impact:'bad', score:-28, quality:{ libraryComplexity:-55 } }]),

    { id:'frag-time','phase':'Library Preparation', title:'RNA Fragmentation Time',
      desc:'Thermally fragment RNA to 200–300 bp at 94°C. Set fragmentation time (minutes).',
      edu:'Under-fragmentation (>500 bp fragments): poor bridge amplification on patterned flow cells, fewer clusters. Over-fragmentation (<100 bp): adapter-dominated clusters — FastQC will show <30 bp insert sizes and very high duplication. The optimal 4–6 minutes at 94°C with Mg²⁺ gives a tight insert size distribution peaking at ~250 bp.',
      pipelineStage:2, type:'slider', min:1, max:15, optimal:5, unit:'min', label:'Fragmentation time at 94°C',
      quality_fn:(v)=>{ if(v<2){return{libraryComplexity:-25,yield:-15};} if(v>9){return{libraryComplexity:-30,duplication:18};} return{}; },
      score_fn:(v)=>{ const d=Math.abs(v-5); return d>6?-22:d>3?-8:0; } },

    { id:'pcr-rna', phase:'Library Preparation', title:'PCR Amplification Cycles',
      desc:'Enrich the adapter-ligated library by PCR. Set number of cycles.',
      edu:'Standard RNA-seq from 500 ng total RNA uses 12 cycles. Low-input (<100 ng) may require 15–18 cycles. Over-amplification inflates counts for highly expressed genes through PCR jackpotting. UMIs (not standard in bulk RNA-seq) would correct for this, but at 12–14 cycles duplication is manageable (<20%).',
      pipelineStage:2, type:'slider', min:4, max:22, optimal:12, unit:'cycles', label:'PCR cycles',
      quality_fn:(v)=>{ if(v<8){return{yield:-25};} if(v>16){return{duplication:18+(v-16)*3,libraryComplexity:-12};} return{}; },
      score_fn:(v)=>{ if(v<8||v>20){return-20;} if(v>16){return-10;} return 0; } },

    choiceStep('aligner-rna','Bioinformatics','Select RNA Aligner',
      'Align FASTQ reads to the reference genome — tool choice affects splice-junction detection.',
      'STAR is the gold standard for RNA-seq: it builds a genome index and uses a seed-and-extend algorithm with splice-aware alignment. HISAT2 uses a graph-based index (lower memory). Bowtie2 and BWA-MEM are DNA aligners — they cannot bridge introns and will discard up to 30% of RNA-seq reads that span splice junctions.',
      5,
      [{ label:'STAR (splice-aware)', desc:'Gold standard. Detects novel junctions. ~30 GB RAM.', impact:'good', score:0, quality:{} },
       { label:'HISAT2 (graph-based)', desc:'Lower memory. Slightly less sensitive for novel junctions.', impact:'good', score:-3, quality:{ alignmentRate:-5 } },
       { label:'Bowtie2 (DNA aligner)', desc:'Cannot map splice-spanning reads — 20–30% reads lost.', impact:'bad', score:-28, quality:{ alignmentRate:-40 } },
       { label:'Salmon (quasi-mapping)', desc:'Pseudo-alignment — very fast, no BAM output. Use only for counts.', impact:'good', score:0, quality:{} }]),

    choiceStep('de-method','Bioinformatics','Differential Expression Method',
      'Identify genes with statistically significant expression differences between conditions.',
      'DESeq2 uses a negative binomial model with shrinkage estimation — robust for small sample sizes (n=3). edgeR uses similar modelling and performs comparably. limma-voom transforms counts and applies linear modelling — excellent for large studies. Raw-count comparisons or fold-change thresholds alone ignore variance and produce thousands of false positives.',
      7,
      [{ label:'DESeq2 (shrinkage estimation)', desc:'Best for n=3–6 per group. Robust FDR control.', impact:'good', score:0, quality:{} },
       { label:'edgeR (GLM)', desc:'Comparable to DESeq2. Slightly more flexible model.', impact:'good', score:0, quality:{} },
       { label:'limma-voom', desc:'Best for large n (>10). Linear modelling after variance stabilisation.', impact:'good', score:0, quality:{} },
       { label:'t-test on TPM values', desc:'Ignores count dispersion — massively inflated false positives.', impact:'bad', score:-25, quality:{ purity:-20 } }])
  ]
};

/* ────────────────────────────────────────────────────────────
   4. scRNA-seq (10x Chromium)
   ──────────────────────────────────────────────────────────── */
OmicsLab.Workflows['scrna-seq'] = {
  id:'scrna-seq', domain:'transcriptomics', domainLabel:'Transcriptomics',
  name:'scRNA-seq (10x Chromium)', difficulty:'intermediate', icon:'hexagon',
  color:'var(--transcripto)', colorHex:'#00C4A0',
  desc:'Resolve the transcriptome of thousands of individual cells using GEM-based barcoding and UMI counting.',
  pipeline:['Dissociation','Viability Check','10x GEM','cDNA Amp','Library Prep','Cell Ranger','Seurat/Scanpy','UMAP'],
  steps:[
    dragStep('dissociation','Sample Preparation','Tissue Dissociation Enzyme',
      'Choose the enzyme for single-cell dissociation and drag it to the tissue.',
      'Aggressive enzymatic dissociation kills cells, raises ambient RNA, and induces stress-response transcripts (immediate-early genes: FOS, JUN, HSPA1A). Cold protease (Miltenyi, 4°C) minimises stress artefacts. Collagenase IV at 37°C for 15 min is standard for soft tissue.',
      0,'cpu','Dissociation Tube','Drop dissociation enzyme here',
      ['collagenase','cold-protease','trypsin','boiling'],
      { 'collagenase':  { impact:'good', score:0,   quality:{} },
        'cold-protease':{ impact:'good', score:0,   quality:{ sampleIntegrity:3 } },
        'trypsin':      { impact:'warn', score:-8,  quality:{ sampleIntegrity:-12, contamination:8 } },
        'boiling':      { impact:'bad',  score:-35, quality:{ sampleIntegrity:-70, contamination:40 } } }),

    { id:'viability', phase:'Sample QC', title:'Cell Viability Threshold',
      desc:'Set the minimum cell viability (%) you will accept before loading the 10x chip.',
      edu:'Dead cells release RNA into the suspension → ambient RNA contamination in all droplets. The SoupX / CellBender tools partially correct for this computationally, but cannot fully recover from >25% dead cells. 10x Genomics requires >80% viability. <70%: high doublet rate AND ambient RNA confounders.',
      pipelineStage:1, type:'slider', min:50, max:99, optimal:88, unit:'% viable', label:'Minimum viability threshold',
      quality_fn:(v)=>{ if(v<70){return{contamination:35,sampleIntegrity:-28};} if(v<80){return{contamination:15,sampleIntegrity:-8};} return{}; },
      score_fn:(v)=>{ if(v<70){return-30;} if(v<80){return-12;} return 0; } },

    dragStep('gem-chip','10x Chromium Loading','Select 10x Chromium Chip',
      'Drag the correct chip to the Chromium Controller.',
      'The Next GEM Chip K (v3.1) uses improved bead chemistry that increases gene sensitivity by 30% vs v2, with a lower doublet rate. Visium chips are for spatial transcriptomics — wrong protocol if loaded here.',
      2,'cpu','Chromium Controller','Drop chip version here',
      ['10x-v3','10x-v2','wrong-chip'],
      { '10x-v3':    { impact:'good', score:0,   quality:{} },
        '10x-v2':    { impact:'warn', score:-8,  quality:{ libraryComplexity:-12,contamination:5 } },
        'wrong-chip':{ impact:'bad',  score:-45, quality:{ sampleIntegrity:-80,libraryComplexity:-80 } } }),

    { id:'cell-load', phase:'10x Loading', title:'Cell Loading Concentration',
      desc:'Target cells/µL to load into the Chromium Controller for ~8,000 recovered cells.',
      edu:'The Chromium Co-encapsulates cells with barcoded gel beads. At 1,000 cells/µL the doublet rate is ~8% (Poisson). At 2,000 cells/µL it rises to ~16%. At 500 cells/µL you lose yield substantially. The 10x loading nomogram targets 700–1,200 cells/µL for the standard 10,000-cell protocol.',
      pipelineStage:2, type:'slider', min:200, max:2500, optimal:1000, unit:'cells/µL', label:'Cell loading concentration',
      quality_fn:(v)=>{ if(v>1600){return{contamination:20,libraryComplexity:-15};} if(v<500){return{yield:-30};} return{}; },
      score_fn:(v)=>{ if(v>1600||v<500){return-20;} if(v>1300){return-8;} return 0; } },

    { id:'cdna-cycles', phase:'Library Preparation', title:'cDNA Amplification Cycles',
      desc:'Amplify the GEM-barcoded cDNA before fragmentation and library indexing.',
      edu:'scRNA-seq starts from pg-scale RNA per cell. 12 cycles of cDNA amplification is standard (10x protocol). UMIs allow deduplication — but UMI collisions increase with >15 cycles. Too few cycles (<10): insufficient cDNA for library prep; Flow cell under-loaded.',
      pipelineStage:3, type:'slider', min:8, max:18, optimal:12, unit:'cycles', label:'cDNA PCR cycles',
      quality_fn:(v)=>{ if(v>15){return{duplication:22,libraryComplexity:-15};} if(v<10){return{yield:-28};} return{}; },
      score_fn:(v)=>{ if(v>15||v<10){return-18;} return 0; } },

    choiceStep('doublet-removal','Bioinformatics','Doublet Detection',
      'Identify and remove multiplet droplets (two+ cells in one GEM) before clustering.',
      'Without doublet removal, mixed-transcriptome droplets appear as "transition cell states" or rare populations — a common source of published artefacts. Scrublet and DoubletFinder simulate artificial doublets by summing random cell pairs, then score real cells against the simulated doublet density. Expected doublet rate: ~8% per 10,000 loaded cells.',
      6,
      [{ label:'Scrublet (auto threshold)', desc:'Fast and standard. Works well for most datasets.', impact:'good', score:0, quality:{} },
       { label:'DoubletFinder + Seurat', desc:'More accurate. Requires expected doublet rate.', impact:'good', score:0, quality:{} },
       { label:'Filter nGenes > 5000 only', desc:'Crude — misses same-cell-type doublets.', impact:'warn', score:-12, quality:{ libraryComplexity:-8 } },
       { label:'Skip (do not filter doublets)', desc:'Doublets remain as artifact clusters — common retraction cause.', impact:'bad', score:-25, quality:{ contamination:22,libraryComplexity:-15 } }]),

    choiceStep('batch-correction','Bioinformatics','Batch Effect Correction',
      'Correct for technical variation between samples processed on different days or runs.',
      'Harmony (fast iterative PCA correction) is currently the most widely used tool. Scanorama uses canonical correlation. ComBat-seq operates on count matrices. No correction when samples are from different batches produces cell-type clusters driven by technical artefact rather than biology — the cells appear in batch-specific UMAP islands.',
      6,
      [{ label:'Harmony (PCA-level)', desc:'Standard choice. Fast, scalable to millions of cells.', impact:'good', score:0, quality:{} },
       { label:'scVI (variational autoencoder)', desc:'Deep learning approach. Best for complex batch effects.', impact:'good', score:0, quality:{} },
       { label:'No correction (single run)', desc:'Acceptable only for single-batch experiments.', impact:'good', score:0, quality:{} },
       { label:'No correction (multi-batch)', desc:'Batch-driven clusters misinterpreted as biology.', impact:'bad', score:-20, quality:{ contamination:18 } }])
  ]
};

/* ────────────────────────────────────────────────────────────
   5. ATAC-seq
   ──────────────────────────────────────────────────────────── */
OmicsLab.Workflows['atac-seq'] = {
  id:'atac-seq', domain:'epigenomics', domainLabel:'Epigenomics',
  name:'ATAC-seq', difficulty:'intermediate', icon:'lock-open',
  color:'var(--epigenomics)', colorHex:'#d2a8ff',
  desc:'Map genome-wide open chromatin by inserting sequencing adapters into nucleosome-free regions using Tn5 transposase.',
  pipeline:['Nuclei Isolation','Tn5 Tagmentation','PCR Amplification','Sequencing','Trimming','Bowtie2','MACS3 Peaks','Motif Analysis'],
  steps:[
    dragStep('atac-lysis','Nuclei Isolation','Select Lysis Buffer',
      'Drag the correct lysis buffer to isolate nuclei from cytoplasm.',
      'ATAC-seq targets nuclear chromatin. If cytoplasm is not removed, mitochondrial DNA dominates — >50% mito reads in a failed ATAC-seq library (mito DNA has no nucleosomes, so Tn5 cuts it indiscriminately). NP-40 (0.1%) or digitonin (0.01%) lyse the plasma membrane while preserving nuclear integrity.',
      0,'flask','Nuclei Isolation Tube','Drop lysis buffer here',
      ['np40-lysis','digitonin','sds-lysis','pbs-lysis'],
      { 'np40-lysis':{ impact:'good', score:0,   quality:{} },
        'digitonin': { impact:'good', score:0,   quality:{ sampleIntegrity:3 } },
        'pbs-lysis': { impact:'bad',  score:-25, quality:{ contamination:45, libraryComplexity:-30 } },
        'sds-lysis': { impact:'bad',  score:-30, quality:{ sampleIntegrity:-50, libraryComplexity:-40 } } }),

    { id:'tn5-conc', phase:'Tn5 Tagmentation', title:'Tn5 Transposase Concentration',
      desc:'Set the Tn5 units per reaction. This directly determines tagmentation density in accessible regions.',
      edu:'Tn5 has a beautiful dose-response: too little → sparse cuts, few fragments, low library complexity. Too much → over-cuts closed chromatin, collapses the nucleosomal ladder (expected at ~200, 400, 600 bp on a Bioanalyzer), and raises background. The optimal 2–4 U/rxn gives a classic sawtooth pattern with enrichment at NFR (<200 bp).',
      pipelineStage:1, type:'slider', min:0.5, max:10, optimal:2.5, unit:'U/rxn', label:'Tn5 units per reaction',
      quality_fn:(v)=>{ if(v<1){return{yield:-35,libraryComplexity:-25};} if(v>6){return{contamination:25,libraryComplexity:-20};} return{}; },
      score_fn:(v)=>{ const d=Math.abs(v-2.5); return d>3?-25:d>1.5?-10:0; } },

    { id:'tagment-time', phase:'Tn5 Tagmentation', title:'Tagmentation Duration',
      desc:'Set tagmentation time at 37°C (minutes). Over-incubation destroys the nucleosomal ladder.',
      edu:'30 minutes at 37°C is the standard Omni-ATAC protocol time. Under-incubation (<15 min): sparse insertions. Over-incubation (>45 min): Tn5 eventually begins cutting nucleosome-bound DNA, reducing the FRIP score (fraction of reads in peaks) from ~40% to <15%.',
      pipelineStage:1, type:'slider', min:5, max:90, optimal:30, unit:'min', label:'Tagmentation time',
      quality_fn:(v)=>{ if(v<15){return{yield:-28,libraryComplexity:-18};} if(v>55){return{contamination:20,libraryComplexity:-15};} return{}; },
      score_fn:(v)=>{ const d=Math.abs(v-30); return d>30?-22:d>15?-8:0; } },

    choiceStep('atac-pcr','Library Amplification','PCR Strategy',
      'How many PCR cycles will you use to amplify the tagmented library?',
      'The best practice for ATAC-seq is to run a pilot qPCR (side reaction) in which you amplify to saturation and determine the cycle at which 1/3 of maximum amplification is reached. Sequencing at this "linear phase" minimises PCR bias. Fixed 10-cycle protocols are acceptable for standard-input ATAC.',
      2,
      [{ label:'qPCR-guided (1/3 Rn point)', desc:'Gold standard — empirical minimum cycles.', impact:'good', score:0, quality:{} },
       { label:'Fixed 10 cycles', desc:'Standard. Slightly higher duplication.', impact:'good', score:-3, quality:{ duplication:5 } },
       { label:'Fixed 20 cycles', desc:'Over-amplified — adapter dimers dominate library.', impact:'bad', score:-22, quality:{ duplication:32, libraryComplexity:-25 } },
       { label:'Fixed 5 cycles', desc:'Under-amplified — insufficient material for sequencing.', impact:'warn', score:-15, quality:{ yield:-40 } }]),

    { id:'mito-filter', phase:'Bioinformatics', title:'Mitochondrial Read Threshold',
      desc:'Set the maximum % of mitochondrial reads allowed per sample before exclusion.',
      edu:'A high mito-read fraction is the key ATAC-seq QC metric for nuclear isolation failure. The ENCODE standard is <5% mito reads for bulk ATAC-seq. Single-cell ATAC-seq allows <20% per cell. Setting this threshold too permissively retains low-quality samples that degrade TSS enrichment scores.',
      pipelineStage:4, type:'slider', min:3, max:70, optimal:10, unit:'% mito', label:'Maximum mito read fraction',
      quality_fn:(v)=>{ if(v>30){return{contamination:22,alignmentRate:-10};} if(v>15){return{contamination:8};} return{}; },
      score_fn:(v)=>{ if(v>30){return-20;} if(v>15){return-8;} return 0; } },

    choiceStep('peak-caller','Bioinformatics','Peak Calling Tool',
      'Identify open chromatin regions from the aligned read pileups.',
      'MACS3 in narrow-peak mode is standard for ATAC-seq (the nucleosome-free region peaks). It models the background as a Poisson distribution and computes local enrichment. MACS3 --broad (for histone ChIP-seq) is incorrect for ATAC — it merges adjacent NFR peaks into artifactually broad regions. F-seq2 is excellent for ATAC-specific modelling.',
      6,
      [{ label:'MACS3 (callpeak --nomodel)', desc:'Current standard for ATAC-seq NFR peaks.', impact:'good', score:0, quality:{} },
       { label:'F-seq2', desc:'Kernel density estimator — excellent for ATAC-seq.', impact:'good', score:0, quality:{} },
       { label:'MACS3 --broad (histone mode)', desc:'Incorrect mode — merges NFR peaks, loses resolution.', impact:'bad', score:-15, quality:{ libraryComplexity:-15, alignmentRate:-5 } },
       { label:'No peak calling', desc:'Raw BAM only — no open chromatin regions identified.', impact:'bad', score:-40, quality:{ libraryComplexity:-80 } }])
  ]
};

/* ────────────────────────────────────────────────────────────
   6. ChIP-seq
   ──────────────────────────────────────────────────────────── */
OmicsLab.Workflows['chip-seq'] = {
  id:'chip-seq', domain:'epigenomics', domainLabel:'Epigenomics',
  name:'ChIP-seq', difficulty:'advanced', icon:'lock-open',
  color:'var(--epigenomics)', colorHex:'#d2a8ff',
  desc:'Immunoprecipitate chromatin-bound proteins and sequence the co-precipitated DNA to map genome-wide binding sites.',
  pipeline:['Crosslinking','Sonication','Immunoprecipitation','Elution','Library Prep','Sequencing','Alignment','MACS3','IDR','Annotation'],
  steps:[
    { id:'fixation', phase:'Chromatin Preparation', title:'Formaldehyde Crosslinking Time',
      desc:'Fix protein–DNA interactions with 1% formaldehyde at room temperature. Set the crosslinking time (minutes).',
      edu:'Formaldehyde crosslinks protein side-chains to DNA within ~12 Å — it preserves the chromatin state at fixation. Under-fixation (<5 min): protein–DNA complexes are lost during sonication → low IP yield. Over-fixation (>20 min): chromatin becomes a rigid matrix that sonicates poorly, AND is harder to reverse-crosslink before library prep → high background, poor antibody epitope access.',
      pipelineStage:0, type:'slider', min:2, max:30, optimal:10, unit:'min', label:'Crosslinking time (1% HCHO)',
      quality_fn:(v)=>{ if(v<5){return{yield:-28,sampleIntegrity:-20};} if(v>20){return{purity:-22,libraryComplexity:-25,contamination:15};} return{}; },
      score_fn:(v)=>{ const d=Math.abs(v-10); return d>12?-25:d>6?-8:0; } },

    choiceStep('sonication','Chromatin Preparation','Sonication Method',
      'Shear crosslinked chromatin to 200–500 bp fragments.',
      'Fragment size uniformity determines peak resolution. Covaris S220 (Adaptive Focused Acoustics) sonicates in a sealed tube without heat, giving tight 200–500 bp size distributions. Probe sonicators generate localised heat that damages DNA. Bath sonicators are variable and hard to calibrate.',
      0,
      [{ label:'Covaris S220 (AFA, 10 min)', desc:'Best reproducibility. Closed-tube, no heating.', impact:'good', score:0, quality:{} },
       { label:'Bioruptor Plus (30 cycles)', desc:'Good alternative. More run-to-run variability.', impact:'good', score:-3, quality:{ libraryComplexity:-5 } },
       { label:'Probe sonicator (on ice)', desc:'Heat artefacts even on ice — DNA damage.', impact:'bad', score:-22, quality:{ sampleIntegrity:-30, duplication:12 } },
       { label:'Vortex only (30 min)', desc:'Ineffective — chromatin remains as intact nuclei.', impact:'bad', score:-40, quality:{ yield:-65, libraryComplexity:-50 } }]),

    dragStep('antibody','Immunoprecipitation','Select Antibody',
      'Drag the appropriate antibody to the chromatin + beads tube.',
      'Antibody quality is the single biggest determinant of ChIP-seq success. ChIP-grade antibodies are validated on native crosslinked chromatin. IHC antibodies recognise denatured/fixed epitopes and may not bind in a ChIP context. An IgG isotype control (no antigen specificity) is essential to measure background noise level.',
      2,'flask','IP Tube + Protein A/G Beads','Drop antibody here',
      ['chipgrade-ab','ihc-ab','expired-ab','no-ab'],
      { 'chipgrade-ab':{ impact:'good', score:0,   quality:{} },
        'ihc-ab':      { impact:'bad',  score:-20, quality:{ purity:-28, alignmentRate:-15, contamination:15 } },
        'expired-ab':  { impact:'bad',  score:-35, quality:{ yield:-55, purity:-30 } },
        'no-ab':       { impact:'bad',  score:-50, quality:{ libraryComplexity:-100, yield:-100 } } }),

    { id:'wash-salt', phase:'Immunoprecipitation', title:'Wash Buffer Salt Concentration',
      desc:'Higher NaCl stringency reduces non-specific DNA co-precipitation. Set the NaCl concentration (mM).',
      edu:'The IP wash removes non-specifically bound chromatin. Low salt (150 mM): easy washes, permissive — high background. High salt (500+ mM): very stringent — may strip real signal for weaker antibody–antigen interactions (e.g., H3K4me1). The sweet spot depends on your target: transcription factors (strong binders) use 300–500 mM; broad histone marks use 150–250 mM.',
      pipelineStage:2, type:'slider', min:50, max:600, optimal:250, unit:'mM NaCl', label:'Wash buffer salt concentration',
      quality_fn:(v)=>{ if(v<120){return{contamination:28,purity:-22};} if(v>480){return{yield:-32};} return{}; },
      score_fn:(v)=>{ const d=Math.abs(v-250); return d>200?-22:d>100?-8:0; } },

    choiceStep('idr-chip','Bioinformatics','Reproducibility: IDR Analysis',
      'Assess reproducibility of peak calls across biological replicates.',
      'IDR (Irreproducible Discovery Rate) is the ENCODE consortium standard for ChIP-seq reproducibility. It ranks peaks by signal and identifies the threshold where replicate rankings diverge — peaks with IDR < 0.05 are reproducible. Skipping IDR and using a simple bedtools intersect gives a peak set inflated by 30–50% with irreproducible peaks.',
      9,
      [{ label:'IDR analysis (ENCODE pipeline)', desc:'Gold standard. Produces IDR-filtered peak set.', impact:'good', score:0, quality:{} },
       { label:'Overlap (bedtools intersect >1 bp)', desc:'Too lenient — includes many irreproducible peaks.', impact:'warn', score:-10, quality:{ purity:-10 } },
       { label:'Use only 1 replicate (no IDR)', desc:'No reproducibility assessment — high false discovery rate.', impact:'bad', score:-28, quality:{ libraryComplexity:-20, purity:-22 } },
       { label:'Skip QC entirely', desc:'Unvalidated peak set — unreliable for any downstream analysis.', impact:'bad', score:-38, quality:{ purity:-30, libraryComplexity:-25 } }])
  ]
};

/* ────────────────────────────────────────────────────────────
   7. Shotgun Metagenomics
   ──────────────────────────────────────────────────────────── */
OmicsLab.Workflows['shotgun-meta'] = {
  id:'shotgun-meta', domain:'metagenomics', domainLabel:'Metagenomics',
  name:'Shotgun Metagenomics', difficulty:'intermediate', icon:'git-branch',
  color:'var(--metagenomics)', colorHex:'#ffa657',
  desc:'Sequence all DNA from a complex microbial community (gut, soil, ocean) to profile taxonomy, metabolic pathways, and antimicrobial resistance genes.',
  pipeline:['DNA Extraction','QC','Host Depletion','Library Prep','Sequencing','Trimming','Kraken2 Tax.','HUMAnN3 Function'],
  steps:[
    dragStep('meta-extraction','DNA Extraction','Select Metagenomic DNA Extraction Kit',
      'Drag the appropriate kit for complex community DNA extraction.',
      'Metagenomic samples contain microbes with vastly different cell wall compositions: gram-positive bacteria need bead beating for mechanical lysis. Standard DNeasy Blood & Tissue misses gram-positive bacteria. The PowerSoil/ZymoBIOMICS kits incorporate bead beating and work across bacteria, archaea, and fungi.',
      0,'layers','Bead Beating Tube + Column','Drop extraction kit here',
      ['powersoil','zymobiomics','dneasy','boiling'],
      { 'powersoil':  { impact:'good', score:0,   quality:{} },
        'zymobiomics':{ impact:'good', score:0,   quality:{} },
        'dneasy':     { impact:'warn', score:-15, quality:{ sampleIntegrity:-20, libraryComplexity:-25 } },
        'boiling':    { impact:'bad',  score:-35, quality:{ sampleIntegrity:-60, yield:-40 } } }),

    choiceStep('host-depletion','Sample Preparation','Host DNA Depletion Strategy',
      'Human samples contain 90–99% host DNA. Remove it before sequencing or lose most reads to the human genome.',
      'In human gut metagenomics, >99% of DNA is human host DNA in some samples (especially biopsy tissue). Depletion methods: Qiagen Host Depletion kit uses methylation-specific nuclease (host DNA is methylated, microbial often is not). Bead-based depletion uses anti-human probes. In silico subtraction after sequencing wastes resources but works. No depletion on high-host samples wastes >98% of sequencing reads.',
      0,
      [{ label:'Molzym Host Depletion Kit', desc:'Methylation-insensitive nuclease depletes host DNA.', impact:'good', score:0, quality:{} },
       { label:'In silico subtraction (post-sequencing)', desc:'Simpler but wastes sequencing capacity.', impact:'warn', score:-8, quality:{ libraryComplexity:-10 } },
       { label:'No depletion (low-host sample, e.g. soil)', desc:'Fine for low-host environmental samples.', impact:'good', score:0, quality:{} },
       { label:'No depletion (human biopsy)', desc:'>95% reads map to human genome — microbiome data unusable.', impact:'bad', score:-35, quality:{ libraryComplexity:-70, alignmentRate:-50 } }]),

    { id:'seq-depth-meta', phase:'Sequencing', title:'Set Sequencing Depth',
      desc:'How many Gb of paired-end reads will you generate per sample?',
      edu:'Standard gut metagenomics uses 3–10 Gb per sample (20–70M paired reads). Strain-level resolution and rare taxon detection require ≥10 Gb. Shallow sequencing (< 1 Gb) allows taxonomic profiling but misses all but the most abundant species and gives essentially no pathway information.',
      pipelineStage:3, type:'slider', min:0.5, max:30, optimal:10, unit:'Gb', label:'Sequencing depth per sample',
      quality_fn:(v)=>{ if(v<2){return{libraryComplexity:-40,alignmentRate:-20};} if(v<5){return{libraryComplexity:-15};} return{}; },
      score_fn:(v)=>{ if(v<2){return-28;} if(v<5){return-10;} return 0; } },

    choiceStep('tax-classifier','Bioinformatics','Taxonomic Classifier',
      'Classify metagenomic reads by taxonomy.',
      'Kraken2 + Bracken uses k-mer matching against a database and is extremely fast (processes 1M reads/minute). The database completeness is critical — use a comprehensive database (PlusPF or PlusPFP) not just the default. MetaPhlAn4 uses clade-specific marker genes and is more accurate at low abundances but misses novel species. mOTUs3 excels at strain-level resolution.',
      5,
      [{ label:'Kraken2 + Bracken (PlusPF DB)', desc:'Fast, comprehensive. Best for bacterial taxonomy.', impact:'good', score:0, quality:{} },
       { label:'MetaPhlAn4 (marker-gene based)', desc:'More accurate at low abundance. Missed novel species.', impact:'good', score:0, quality:{} },
       { label:'Kraken2 (MiniKraken DB only)', desc:'Incomplete database — misses many species.', impact:'warn', score:-12, quality:{ libraryComplexity:-15 } },
       { label:'BLAST (all reads)', desc:'Accurate but computationally prohibitive for metagenomic data.', impact:'warn', score:-10, quality:{} }]),

    choiceStep('functional','Bioinformatics','Functional Profiling Tool',
      'Determine which metabolic pathways and functions are encoded in your metagenome.',
      'HUMAnN3 (Human Microbiome Project Unified Metabolic Analysis Network) maps reads to UniRef90 genes and reconstructs MetaCyc pathway abundances. This gives stratified pathway coverages per species. SUPER-FOCUS uses subsystem profiles. KEGG annotation via Diamond is an alternative. Without functional profiling, you only know WHO is there, not WHAT they can do.',
      7,
      [{ label:'HUMAnN3 (MetaCyc pathways)', desc:'Gold standard for functional metagenomics.', impact:'good', score:0, quality:{} },
       { label:'SUPER-FOCUS (SEED subsystems)', desc:'Fast subsystem-based profiling.', impact:'good', score:-2, quality:{} },
       { label:'KEGG via Diamond', desc:'KEGG orthology annotation — good for curated pathways.', impact:'good', score:0, quality:{} },
       { label:'No functional analysis', desc:'Taxonomic data only — major loss of metagenomic value.', impact:'warn', score:-8, quality:{} }])
  ]
};

/* ────────────────────────────────────────────────────────────
   8. 16S rRNA Amplicon
   ──────────────────────────────────────────────────────────── */
OmicsLab.Workflows['16s-amplicon'] = {
  id:'16s-amplicon', domain:'metagenomics', domainLabel:'Metagenomics',
  name:'16S rRNA Amplicon Sequencing', difficulty:'beginner', icon:'rotate-cw',
  color:'var(--metagenomics)', colorHex:'#ffa657',
  desc:'Target the hypervariable V3–V4 regions of the bacterial 16S rRNA gene to profile microbial community composition cost-effectively.',
  pipeline:['DNA Extraction','PCR (16S V3-V4)','Cleanup','Library Prep','Sequencing','DADA2','Taxonomy','Alpha/Beta Diversity'],
  steps:[
    dragStep('16s-dna','DNA Extraction','DNA Extraction Kit for Stool/Soil',
      'Drag the appropriate kit for microbial DNA extraction.',
      'Stool samples require kits optimised for inhibitor removal. PCR inhibitors (bile salts, humic acids from soil) co-elute with DNA and cause amplification failure. The ZymoBIOMICS and PowerSoil kits include inhibitor-removal steps. A260/230 <1.5 indicates inhibitor carryover.',
      0,'flask','Bead Beating + Column','Drop extraction kit here',
      ['zymobiomics','powersoil','dneasy','phenol-ci'],
      { 'zymobiomics':{ impact:'good', score:0,   quality:{} },
        'powersoil':  { impact:'good', score:0,   quality:{} },
        'dneasy':     { impact:'warn', score:-12, quality:{ purity:-15,sampleIntegrity:-10 } },
        'phenol-ci':  { impact:'warn', score:-10, quality:{ purity:-20 } } }),

    dragStep('16s-primers','PCR Amplification','Select 16S Primer Pair',
      'Drag the correct primer pair to the PCR master mix.',
      'The V3–V4 region (515F/806R) amplifies a ~460 bp product covering both V3 and V4 hypervariable regions — the EARTH Microbiome Project standard. The 27F/1492R near-full-length primer pair amplifies ~1,500 bp — too long for Illumina short-read sequencing (but ideal for PacBio). V4-only primers (806R/515F) give a shorter, more sequenceable product but less taxonomic resolution.',
      1,'flask','PCR Tube (Hot-start Polymerase)','Drop primer pair here',
      ['univ-16s','wrong-16s','virus-primers','random-hex'],
      { 'univ-16s':   { impact:'good', score:0,   quality:{} },
        'wrong-16s':  { impact:'bad',  score:-30, quality:{ libraryComplexity:-50,yield:-30 } },
        'virus-primers':{ impact:'bad', score:-35, quality:{ libraryComplexity:-80 } },
        'random-hex': { impact:'bad',  score:-40, quality:{ libraryComplexity:-90,purity:-40 } } }),

    { id:'pcr-16s', phase:'PCR Amplification', title:'16S PCR Cycle Number',
      desc:'Set the number of PCR cycles for 16S amplification. Over-cycling introduces chimeric sequences.',
      edu:'16S amplicon PCR is typically 25–30 cycles. Over-cycling (>35 cycles) increases chimera formation — chimeras are PCR artefacts where two partial amplicons from different templates fuse, creating a spurious sequence that appears as a novel OTU/ASV. DADA2\'s chimera removal step eliminates most chimeras, but high chimera rates still compromise diversity estimates.',
      pipelineStage:1, type:'slider', min:15, max:45, optimal:28, unit:'cycles', label:'PCR cycles',
      quality_fn:(v)=>{ if(v<20){return{yield:-25};} if(v>35){return{contamination:20,libraryComplexity:-15};} return{}; },
      score_fn:(v)=>{ const d=Math.abs(v-28); return d>10?-20:d>5?-8:0; } },

    choiceStep('asv-otu','Bioinformatics','ASV or OTU Clustering',
      'Choose between Amplicon Sequence Variants (ASVs) and Operational Taxonomic Units (OTUs) for community profiling.',
      'DADA2 and QIIME2 can produce ASVs (exact sequence variants) or OTUs (97% similarity clusters). ASVs are single-nucleotide resolution — they can distinguish strain-level differences and are reproducible across studies. OTU clustering at 97% merges closely related strains. The field has largely moved to ASVs because they are more accurate and comparable. Picking random reads as OTU centroids (QIIME1 method) is completely obsolete.',
      6,
      [{ label:'DADA2 ASVs (denoising)', desc:'Current gold standard. Single-nucleotide resolution.', impact:'good', score:0, quality:{} },
       { label:'QIIME2 + DADA2 (pipeline)', desc:'Full pipeline with visualisation outputs.', impact:'good', score:0, quality:{} },
       { label:'OTU clustering (97%, vsearch)', desc:'Legacy method. Lower resolution than ASVs.', impact:'warn', score:-8, quality:{ libraryComplexity:-8 } },
       { label:'QIIME1 pick_open_reference_otus', desc:'Deprecated pipeline from 2013 — do not use.', impact:'bad', score:-20, quality:{ purity:-15 } }])
  ]
};

/* ────────────────────────────────────────────────────────────
   9. LC-MS Metabolomics
   ──────────────────────────────────────────────────────────── */
OmicsLab.Workflows['lc-ms'] = {
  id:'lc-ms', domain:'metabolomics', domainLabel:'Metabolomics',
  name:'LC-MS Untargeted Metabolomics', difficulty:'intermediate', icon:'flask',
  color:'var(--metabolomics)', colorHex:'#f78166',
  desc:'Profile hundreds to thousands of small molecules in biofluids or tissue using liquid chromatography–mass spectrometry.',
  pipeline:['Sample Collection','Protein Precipitation','LC Separation','MS Detection','Feature Detection','Normalisation','Statistics'],
  steps:[
    dragStep('meta-sample','Sample Preparation','Sample Type for Metabolomics',
      'Select your biofluid or tissue for metabolite extraction.',
      'Plasma and urine are the most common metabolomics matrices. Plasma requires EDTA anticoagulant (NOT heparin — heparin causes ion suppression in ESI-MS). Urine is diluted and variable. Tissue requires snap-freezing and bead-mill homogenisation. Sample handling time before freezing is critical — metabolite profiles change within minutes at room temperature (especially glycolysis intermediates).',
      0,'snowflake','Pre-cooled Collection Tube','Drop sample type here',
      ['serum','urine','fresh-tissue','blood-edta'],
      { 'serum':       { impact:'good', score:0,   quality:{} },
        'urine':       { impact:'good', score:0,   quality:{} },
        'fresh-tissue':{ impact:'good', score:0,   quality:{} },
        'blood-edta':  { impact:'good', score:0,   quality:{} } }),

    dragStep('protein-precip','Protein Precipitation','Protein Precipitation Solvent',
      'Remove proteins from the biofluid before LC-MS injection.',
      'Proteins cause ion suppression in ESI-MS and foul the LC column. Cold organic solvent (4× acetonitrile) precipitates proteins efficiently. Methanol (3×) works similarly. TCA (trichloroacetic acid) is effective but can acidify the extract and degrade acid-labile metabolites. No precipitation causes column fouling within ~10 injections and severe matrix effects.',
      0,'flask','Precipitation Tube (ice)','Drop precipitation solvent here',
      ['acetonitrile','methanol','trizol','pbs-lysis'],
      { 'acetonitrile':{ impact:'good', score:0,   quality:{} },
        'methanol':    { impact:'good', score:0,   quality:{} },
        'trizol':      { impact:'warn', score:-10, quality:{ purity:-18 } },
        'pbs-lysis':   { impact:'bad',  score:-28, quality:{ purity:-40, contamination:25 } } }),

    dragStep('istd','Sample Preparation','Internal Standard Addition',
      'Add internal standards before extraction to correct for technical variation.',
      'Isotopically labelled internal standards (¹³C, ²H, ¹⁵N) correct for ionisation efficiency variation between samples. They must be added BEFORE extraction, not after — post-extraction addition only corrects for injection variation, not sample prep losses. No internal standards make it impossible to distinguish true biological differences from technical noise.',
      0,'scale','Sample Tube (before extraction)','Drop internal standard here',
      ['istd-mix','no-istd'],
      { 'istd-mix':{ impact:'good', score:0,   quality:{} },
        'no-istd': { impact:'bad',  score:-22, quality:{ purity:-20,contamination:15 } } }),

    { id:'lc-column', phase:'LC Separation', title:'Select LC Column Type',
      desc:'Choose the chromatography column chemistry for metabolite separation.',
      edu:'Reversed-phase (RP) C18 columns separate non-polar to mid-polarity metabolites in positive ion mode — covers lipids, amino acids, nucleosides. HILIC (Hydrophilic Interaction Chromatography) retains polar metabolites (sugars, nucleotides, organic acids) that elute in the void on RP columns. Using only RP covers ~60% of the metabolome. Using both RP and HILIC in orthogonal acquisition covers ~85%.',
      pipelineStage:2, type:'choice',
      options:[
        { label:'RP C18 + HILIC (both polarities)', desc:'Maximum metabolome coverage. Gold standard.', impact:'good', score:0, quality:{} },
        { label:'RP C18 only', desc:'Good for lipids and mid-polarity metabolites. Misses polar metabolites.', impact:'warn', score:-8, quality:{ libraryComplexity:-15 } },
        { label:'HILIC only', desc:'Polar metabolites only. Misses lipidome.', impact:'warn', score:-8, quality:{ libraryComplexity:-15 } },
        { label:'No column (direct infusion)', desc:'No chromatographic separation — massive ion suppression.', impact:'bad', score:-30, quality:{ purity:-35, contamination:25 } }] },

    choiceStep('feature-detect','Bioinformatics','Feature Detection & Alignment',
      'Detect and align LC-MS features (m/z × retention time pairs) across samples.',
      'XCMS is the standard feature detection + peak alignment + gap-filling pipeline. MZmine3 provides a graphical workflow with improved algorithms. MS-DIAL excels at lipid annotation using the LIPIDMAPS database. All require careful parameter tuning — particularly the ppm mass tolerance (typically 5–10 ppm for high-res instruments) and the minimum peak intensity threshold.',
      5,
      [{ label:'XCMS (R package)', desc:'Most widely used. Best method literature support.', impact:'good', score:0, quality:{} },
       { label:'MZmine3', desc:'GUI-based. Good for beginners. Comparable performance.', impact:'good', score:0, quality:{} },
       { label:'MS-DIAL', desc:'Excellent lipid annotation. Best for lipidomics.', impact:'good', score:0, quality:{} },
       { label:'Manual m/z extraction (no software)', desc:'Not feasible for untargeted — thousands of features.', impact:'bad', score:-30, quality:{ libraryComplexity:-60 } }])
  ]
};

/* ────────────────────────────────────────────────────────────
   10. Shotgun Proteomics (LC-MS/MS)
   ──────────────────────────────────────────────────────────── */
OmicsLab.Workflows['proteomics'] = {
  id:'proteomics', domain:'proteomics', domainLabel:'Proteomics',
  name:'Shotgun Proteomics (LC-MS/MS)', difficulty:'intermediate', icon:'layers',
  color:'var(--proteomics)', colorHex:'#79c0ff',
  desc:'Digest cellular proteins with trypsin, separate peptides by nano-LC, and identify/quantify them by data-dependent MS/MS.',
  pipeline:['Lysis','Reduction & Alkylation','Trypsin Digest','Desalting','nanoLC','DDA MS/MS','MaxQuant/Sequest','Normalisation'],
  steps:[
    choiceStep('prot-lysis','Sample Preparation','Cell/Tissue Lysis for Proteomics',
      'Choose the lysis buffer for protein extraction.',
      'SDS (1–4%) is the most efficient cell lysis buffer — it unfolds proteins for complete solubilisation. However, SDS is incompatible with enzymatic digestion and must be removed (using SDS-PAGE, SP3 beads, or detergent removal spin columns). RIPA buffer is milder — works for many proteins but may miss membrane proteins. Urea (8 M) denatures proteins without detergent and is directly compatible with peptide cleanup columns.',
      0,
      [{ label:'5% SDS (FASP or SP3 cleanup)', desc:'Most complete proteome coverage. Requires SDS removal step.', impact:'good', score:0, quality:{} },
       { label:'8 M Urea + 25 mM ABC', desc:'SDS-free. Direct compatibility with digestion.', impact:'good', score:0, quality:{} },
       { label:'RIPA buffer', desc:'Moderate lysis. Misses hydrophobic membrane proteins.', impact:'warn', score:-8, quality:{ libraryComplexity:-12 } },
       { label:'PBS only (no lysis reagent)', desc:'Incomplete lysis — most proteins remain in cell debris pellet.', impact:'bad', score:-30, quality:{ yield:-50, libraryComplexity:-40 } }]),

    dragStep('reduct-alkyl','Sample Preparation','Reduction & Alkylation Reagents',
      'Reduce disulfide bonds with DTT, then alkylate cysteines with IAA. Drag the reducing agent to the protein solution.',
      'Proteins have disulfide bonds that must be reduced (DTT or TCEP) to fully unfold the protein for trypsin access. Alkylation with iodoacetamide (IAA) permanently blocks the free thiols to prevent re-oxidation and to add a fixed modification (+57 Da on C) for peptide identification. Skipping reduction causes missed cleavages and poor sequence coverage.',
      0,'flask','Reduction Tube (60°C, 30 min)','Drop reducing agent here',
      ['dtt','iaa','pbs-lysis','boiling'],
      { 'dtt':     { impact:'good', score:0,   quality:{} },
        'iaa':     { impact:'warn', score:-5,  quality:{ libraryComplexity:-8 } },
        'pbs-lysis':{ impact:'bad', score:-25, quality:{ yield:-35, libraryComplexity:-30 } },
        'boiling': { impact:'bad',  score:-30, quality:{ sampleIntegrity:-50 } } }),

    dragStep('protease','Protein Digestion','Select Digestion Protease',
      'Drag the protease to the denatured protein solution for overnight digestion.',
      'Trypsin cleaves after K and R (not before P) — it generates peptides in the 700–3500 Da range ideal for MS/MS. The resulting peptides carry basic sites (K, R) at the C-terminus improving fragmentation and charge state. Lys-C is used as a pre-digestion step at high urea concentrations (>4 M) where trypsin is inactive. Glu-C cleaves after D and E — useful for proteins that lack K/R residues.',
      1,'flask','Digestion Tube (37°C, 16h)','Drop protease here',
      ['trypsin-prot','lys-c','glu-c','rnase-a'],
      { 'trypsin-prot':{ impact:'good', score:0,   quality:{} },
        'lys-c':       { impact:'good', score:-3,  quality:{ libraryComplexity:-5 } },
        'glu-c':       { impact:'warn', score:-10, quality:{ libraryComplexity:-20 } },
        'rnase-a':     { impact:'bad',  score:-35, quality:{ libraryComplexity:-70,yield:-30 } } }),

    { id:'ms-acquisition', phase:'LC-MS/MS', title:'MS/MS Acquisition Mode',
      desc:'Select data acquisition strategy — data-dependent (DDA) vs data-independent (DIA).',
      edu:'DDA (Data-Dependent Acquisition) selects the top-N precursor ions for MS/MS fragmentation. It misses low-abundance proteins (stochastic sampling) and is not fully reproducible across runs. DIA (Data-Independent Acquisition, e.g. SWATH) fragments all precursors in isolation windows sequentially — fully reproducible and captures low-abundance peptides missed by DDA. DIA requires specialised analysis tools (DIA-NN, Spectronaut).',
      pipelineStage:4, type:'choice',
      options:[
        { label:'DDA (Top-20 HCD)', desc:'Standard proteomics. Best database coverage.', impact:'good', score:0, quality:{} },
        { label:'DIA (SWATH, 25-Da windows)', desc:'Maximum reproducibility and quantification depth.', impact:'good', score:0, quality:{ libraryComplexity:5 } },
        { label:'SRM/MRM (targeted, known peptides)', desc:'Highest sensitivity for pre-selected peptides only.', impact:'good', score:0, quality:{} },
        { label:'MS1 only (no fragmentation)', desc:'Cannot identify peptides without MS2 spectra.', impact:'bad', score:-35, quality:{ libraryComplexity:-70 } }] },

    choiceStep('prot-quant','Bioinformatics','Quantification Strategy',
      'Choose how to quantify protein abundances across samples.',
      'Label-free quantification (LFQ) compares peak intensities across runs — requires matched sample loading and tight chromatographic reproducibility. TMT (Tandem Mass Tag) and iTRAQ chemically label peptides with isobaric tags, allowing multiplexed quantification of 6–18 samples in a single run with less missing data. MaxQuant is the leading software for LFQ; Proteome Discoverer for TMT.',
      7,
      [{ label:'MaxQuant LFQ (label-free)', desc:'Gold standard for label-free. Excellent for <12 samples.', impact:'good', score:0, quality:{} },
       { label:'TMT-16 (isobaric labelling)', desc:'Multiplexed — up to 16 samples per run. Less missing data.', impact:'good', score:0, quality:{ libraryComplexity:5 } },
       { label:'Spectral counting (PSMs)', desc:'Crude semi-quantitative method. High variance.', impact:'warn', score:-12, quality:{ purity:-10 } },
       { label:'No quantification', desc:'Identification only — no differential analysis possible.', impact:'bad', score:-25, quality:{ libraryComplexity:-30 } }])
  ]
};

/* ────────────────────────────────────────────────────────────
   11. Viral WGS (SARS-CoV-2 / General Viral)
   ──────────────────────────────────────────────────────────── */
OmicsLab.Workflows['viral-wgs'] = {
  id:'viral-wgs', domain:'virology', domainLabel:'Virology',
  name:'Viral Whole Genome Sequencing', difficulty:'intermediate', icon:'virus',
  color:'var(--virology)', colorHex:'#ff7b72',
  desc:'Sequence SARS-CoV-2 and other RNA viruses using tiled amplicon sequencing (ARTIC protocol) for outbreak surveillance and variant characterisation.',
  pipeline:['RNA Extraction','RT-PCR','ARTIC Amplification','Library Prep','Sequencing','Trimming','BWA Align','iVar Variants','Lineage (Pangolin)'],
  steps:[
    dragStep('viral-rna','RNA Extraction','Viral RNA Extraction Kit',
      'Extract RNA from a clinical nasopharyngeal swab or respiratory sample.',
      'Viral RNA in NP swabs degrades rapidly. VTM (Viral Transport Medium) stabilises the virus for 24–72 h at 4°C. RNA must be extracted within 4 hours of receiving the sample. QIAamp Viral RNA Mini Kit is the clinical standard. TRIzol LS works for liquid samples but requires BSL-2+ handling for infectious agents.',
      0,'flask','RNA Extraction Column','Drop extraction kit here',
      ['rneasy','trizol','dneasy','boiling'],
      { 'rneasy': { impact:'good', score:0,   quality:{} },
        'trizol': { impact:'good', score:-3,  quality:{ purity:-8 } },
        'dneasy': { impact:'bad',  score:-25, quality:{ yield:-40, sampleIntegrity:-30 } },
        'boiling':{ impact:'bad',  score:-35, quality:{ sampleIntegrity:-70 } } }),

    dragStep('artic-primers','RT-PCR & Amplification','Select ARTIC Primer Pool',
      'Drag the ARTIC primer scheme for tiled amplicon sequencing.',
      'The ARTIC network designed overlapping ~400 bp amplicons tiling the entire SARS-CoV-2 genome. V4.1 primers are updated to cover all current variants of concern. Older ARTIC V1–V3 primers have amplification dropouts in the Omicron lineage due to primer mismatches. Random hexamers (for standard metatranscriptomics) do not enrich viral sequences.',
      1,'dna','RT-PCR Tube (multiplex)','Drop primer scheme here',
      ['virus-primers','wrong-16s','random-hex','univ-16s'],
      { 'virus-primers':{ impact:'good', score:0,   quality:{} },
        'wrong-16s':    { impact:'bad',  score:-35, quality:{ libraryComplexity:-70,yield:-50 } },
        'random-hex':   { impact:'warn', score:-15, quality:{ libraryComplexity:-30 } },
        'univ-16s':     { impact:'bad',  score:-30, quality:{ libraryComplexity:-60 } } }),

    { id:'ct-threshold', phase:'Sample QC', title:'Ct Value Cutoff for Sequencing',
      desc:'Set the maximum Ct value (RT-qPCR) you will accept for WGS — above this the sample will not have sufficient viral RNA.',
      edu:'Ct (cycle threshold) inversely correlates with viral load: Ct 15–20 = high viral load (~10⁸ copies/mL), Ct 25–30 = moderate (~10⁵–10⁶), Ct >30 = low. Most sequencing labs set a Ct <30–33 cutoff. Above Ct 33, amplicon dropout increases substantially: <30× genome coverage for >50% of the genome, making variant calling unreliable.',
      pipelineStage:0, type:'slider', min:15, max:40, optimal:30, unit:'Ct', label:'Maximum Ct value cutoff',
      quality_fn:(v)=>{ if(v>35){return{yield:-40,sampleIntegrity:-30};} if(v>32){return{yield:-15,sampleIntegrity:-10};} return{}; },
      score_fn:(v)=>{ if(v>35){return-25;} if(v>32){return-10;} return 0; } },

    choiceStep('library-viral','Library Preparation','Library Prep for Amplicon Sequencing',
      'Prepare the Nextera XT library from ARTIC amplicons.',
      'ARTIC amplicons are prepared as Nextera XT libraries for Illumina sequencing or as native ligation libraries for Oxford Nanopore. Nextera XT tagmentation (Illumina) gives 150 bp PE reads with excellent coverage depth. Native Nanopore ligation (Rapid Sequencing Kit) gives real-time results but lower base accuracy (~99.5% consensus vs 99.9% for Illumina).',
      3,
      [{ label:'Nextera XT (Illumina, 150 bp PE)', desc:'Highest base accuracy. Gold standard for surveillance.', impact:'good', score:0, quality:{} },
       { label:'ONT Native Ligation (MinION)', desc:'Real-time results. Slightly lower consensus accuracy.', impact:'good', score:-3, quality:{ sequencingQ30:-5 } },
       { label:'ONT Rapid Sequencing Kit', desc:'Fastest prep (10 min). Highest error rate.', impact:'warn', score:-10, quality:{ sequencingQ30:-12 } },
       { label:'No library prep (shotgun RNA-seq)', desc:'Cannot enrich viral sequences — host reads dominate.', impact:'bad', score:-30, quality:{ libraryComplexity:-60 } }]),

    choiceStep('lineage','Bioinformatics','Variant & Lineage Assignment',
      'Classify the sequenced genome into SARS-CoV-2 variants of concern and lineages.',
      'Pangolin (Phylogenetic Assignment of Named Global Outbreak LINeages) is the WHO-endorsed tool for SARS-CoV-2 lineage classification. It uses a decision tree (pangoLEARN) to assign Pango nomenclature (BA.2.86, XBB.1.5, etc.). Nextclade simultaneously performs alignment, clade assignment, and quality checks. GISAID submission requires Pangolin metadata.',
      8,
      [{ label:'Pangolin + Nextclade', desc:'WHO standard. Required for GISAID submission.', impact:'good', score:0, quality:{} },
       { label:'Nextclade only', desc:'Excellent QC but uses Nextstrain clades not Pango lineages.', impact:'good', score:0, quality:{} },
       { label:'BLAST against RefSeq', desc:'Finds the closest reference but cannot assign lineages.', impact:'warn', score:-10, quality:{} },
       { label:'No lineage assignment', desc:'Sequence data with no epidemiological interpretation.', impact:'warn', score:-8, quality:{} }])
  ]
};

/* ────────────────────────────────────────────────────────────
   12. CITE-seq (Multi-omics)
   ──────────────────────────────────────────────────────────── */
OmicsLab.Workflows['cite-seq'] = {
  id:'cite-seq', domain:'multiomics', domainLabel:'Multi-omics',
  name:'CITE-seq (RNA + Protein)', difficulty:'advanced', icon:'target',
  color:'var(--multiomics)', colorHex:'#e3b341',
  desc:'Simultaneously measure gene expression (RNA) and surface protein abundance (ADT) from single cells using hashtag antibodies.',
  pipeline:['Cell Staining (Ab)','10x Loading','GEM Generation','Library Prep (RNA + ADT)','Sequencing','Cell Ranger CITE','Seurat WNN','Integration'],
  steps:[
    dragStep('cite-ab','Cell Staining','CITE-seq Antibody Panel',
      'Drag the antibody panel to the cell suspension for hashtag staining.',
      'CITE-seq uses TotalSeq-B or TotalSeq-C antibodies conjugated to DNA oligos. The ADT library is sequenced alongside the RNA library. TotalSeq-B is compatible with 10x v3 chemistry. TotalSeq-A oligos use different barcode sequences — loading TotalSeq-A with a v3 chip will produce unreadable ADT reads. No antibody = RNA-only scRNA-seq, no protein data.',
      0,'tag','Cell Suspension (4°C)','Drop antibody panel here',
      ['cite-ab-panel','chipgrade-ab','no-ab','ihc-ab'],
      { 'cite-ab-panel':{ impact:'good', score:0,   quality:{} },
        'chipgrade-ab': { impact:'bad',  score:-30, quality:{ purity:-30,contamination:20 } },
        'ihc-ab':       { impact:'bad',  score:-25, quality:{ purity:-25,contamination:15 } },
        'no-ab':        { impact:'warn', score:-5,  quality:{} } }),

    { id:'wash-cycles', phase:'Cell Staining', title:'Antibody Wash Cycles',
      desc:'Set the number of washing steps to remove unbound antibody before 10x loading.',
      edu:'Unbound free antibody oligos will be encapsulated in GEMs alongside cells. In sequencing, free oligos appear as "background ADT signal" on all barcodes — including empty droplets. This inflates background protein levels and can falsely suggest high expression of all antibody targets. Three washes at 300 g are standard.',
      pipelineStage:0, type:'slider', min:1, max:8, optimal:3, unit:'wash cycles', label:'Wash cycles before loading',
      quality_fn:(v)=>{ if(v<2){return{contamination:30,purity:-20};} if(v>5){return{sampleIntegrity:-10,yield:-10};} return{}; },
      score_fn:(v)=>{ if(v<2){return-25;} if(v>5){return-8;} return 0; } },

    dragStep('cite-chip','10x Loading','Select CITE-seq Compatible Chip',
      'Drag the correct 10x chip for CITE-seq.',
      'TotalSeq-B antibodies are designed for 10x Chromium Next GEM (v3.1) chips using Feature Barcode Technology. TotalSeq-C antibodies are for the 5′ gene expression workflow. Mismatching antibody chemistry with chip version produces no interpretable ADT data. The Visium chip cannot capture ADT oligos.',
      1,'cpu','Chromium Controller','Drop chip here',
      ['10x-v3','10x-v2','wrong-chip','visium-chip'],
      { '10x-v3':     { impact:'good', score:0,   quality:{} },
        '10x-v2':     { impact:'bad',  score:-20, quality:{ libraryComplexity:-30,purity:-15 } },
        'wrong-chip': { impact:'bad',  score:-45, quality:{ sampleIntegrity:-80 } },
        'visium-chip':{ impact:'bad',  score:-45, quality:{ sampleIntegrity:-80 } } }),

    choiceStep('cite-integration','Bioinformatics','Multi-modal Integration',
      'Integrate RNA and protein modalities for joint cell-type annotation.',
      'Seurat\'s Weighted Nearest Neighbour (WNN) graph computes cell-type clusters using both RNA and ADT data, weighting each modality by its information content per cell. This outperforms single-modality clustering because rare cell types that are transcriptomically similar (e.g., CD4 T cell subsets) can be distinguished by surface protein markers. totalVI (scVI-based) learns a joint generative model.',
      7,
      [{ label:'Seurat WNN (Weighted Nearest Neighbour)', desc:'Standard multi-modal integration. Well-validated.', impact:'good', score:0, quality:{} },
       { label:'totalVI (scVI-based)', desc:'Probabilistic integration. Handles batch effects.', impact:'good', score:0, quality:{} },
       { label:'RNA-only clustering (ignore ADT)', desc:'Wastes protein data — defeats purpose of CITE-seq.', impact:'warn', score:-15, quality:{ libraryComplexity:-10 } },
       { label:'ADT-only clustering', desc:'Ignores transcriptional heterogeneity within protein+ populations.', impact:'warn', score:-12, quality:{} }])
  ]
};

/* ────────────────────────────────────────────────────────────
   15. RT-qPCR Gene Expression  (Thermo Fisher / QIAGEN)
   ──────────────────────────────────────────────────────────── */
OmicsLab.Workflows['rt-qpcr'] = {
  id:'rt-qpcr', domain:'transcriptomics', domainLabel:'Transcriptomics',
  name:'RT-qPCR Gene Expression', difficulty:'beginner', icon:'activity',
  color:'var(--transcripto)', colorHex:'#00C4A0',
  desc:'Quantify specific gene expression by reverse-transcribing RNA to cDNA and amplifying with gene-specific primers on a QuantStudio or RotorGene Q. The gold standard for validating RNA-seq hits in clinical and research settings.',
  pipeline:['RNA Extraction','RNA QC','cDNA Synthesis','Primer Design','qPCR Run','ΔΔCt Analysis','Normalisation'],
  steps:[
    dragStep('rna-source-qpcr','Sample Input','Select Sample Type',
      'Drag your starting material to the homogenisation tube.',
      'RNA quality determines qPCR sensitivity. Fresh frozen tissue (RIN ≥ 8) gives the most reproducible Ct values. FFPE introduces crosslinks that fragment RNA — minimum RIN 2.5 is acceptable when using a dedicated FFPE extraction kit. Blood must be processed within 4 hours or stabilised in PAXgene tubes. Cell culture should be lysed directly in guanidinium-based buffer to inactivate RNases immediately.',
      0,'snowflake','Sample Tube','Drop sample here',
      ['fresh-tissue','cultured-cells','blood-edta','ffpe'],
      { 'fresh-tissue':  { impact:'good', score:0,   quality:{} },
        'cultured-cells':{ impact:'good', score:0,   quality:{} },
        'blood-edta':    { impact:'good', score:-2,  quality:{ sampleIntegrity:-5 } },
        'ffpe':          { impact:'warn', score:-15, quality:{ sampleIntegrity:-30, purity:-10 } } }),

    dragStep('rna-kit-qpcr','RNA Extraction','Select Extraction Kit',
      'Choose the RNA extraction kit and drag it to the column.',
      'RNeasy Mini (QIAGEN) and PureLink RNA Mini (Thermo Fisher) use silica-column chemistry — both give high purity (A260/280 ≥ 1.9). TRIzol with column cleanup adds a phase-separation step that co-removes lipids and carbohydrates. MagMAX mirVana (Thermo Fisher) is the automated choice for the KingFisher instrument. miRNeasy (QIAGEN) isolates total RNA including small RNAs — ideal when profiling miRNAs alongside mRNAs.',
      0,'flask','Silica Column','Drag extraction kit here',
      ['rneasy','purelink-rna','trizol-col','magmax-rna','mirneasy'],
      { 'rneasy':      { impact:'good', score:0,  quality:{} },
        'purelink-rna':{ impact:'good', score:0,  quality:{} },
        'trizol-col':  { impact:'good', score:-2, quality:{ purity:-5 } },
        'magmax-rna':  { impact:'good', score:0,  quality:{} },
        'mirneasy':    { impact:'good', score:0,  quality:{} } }),

    dragStep('cdna-synthesis','cDNA Synthesis','Select Reverse Transcriptase',
      'Drag the reverse transcriptase master mix to the RNA sample.',
      'SuperScript IV VILO (Thermo Fisher) is an engineered MMLV RT active at 50–55°C — heat reduces secondary structure in GC-rich templates and gives 2× more cDNA than SuperScript III. Random hexamers prime all RNA species (mRNA + rRNA + ncRNA), increasing total cDNA but reducing specificity. Using TRIzol directly as a cDNA synthesis reaction destroys the reverse transcriptase — phenol must be completely removed first.',
      2,'flask','RT Reaction Tube','Drop RT reagent here',
      ['superscript-iv','random-hex','trizol'],
      { 'superscript-iv':{ impact:'good', score:0,   quality:{} },
        'random-hex':    { impact:'warn', score:-8,  quality:{ purity:-15, libraryComplexity:-10 } },
        'trizol':        { impact:'bad',  score:-30, quality:{ yield:-50, sampleIntegrity:-40 } } }),

    dragStep('qpcr-chem','qPCR','Select qPCR Chemistry',
      'Choose the detection chemistry and drag it to the 96-well plate on the QuantStudio.',
      'TaqMan probes (5′ nuclease assay) use a dual-labelled hydrolysis probe — highly specific, multiplexable up to 4 targets per well, no melt-curve analysis required. Designed for Tm 68–70°C with a 60°C universal annealing step. PowerUp SYBR Green (Thermo Fisher) intercalates into all dsDNA — cheaper, no probe design, but detects primer-dimers and non-specific products (always run a melt curve). HotStarTaq Plus (QIAGEN) is a conventional PCR enzyme optimised for standard PCR, not real-time detection — lacks the buffer optimisation and reference dye for QuantStudio or RotorGene Q.',
      3,'cpu','qPCR 96-well Plate','Drop chemistry here',
      ['taqman-mm','sybr-adv','hotstar-taq','kapa-hifi'],
      { 'taqman-mm':  { impact:'good', score:0,   quality:{} },
        'sybr-adv':   { impact:'good', score:-3,  quality:{ purity:-5 } },
        'hotstar-taq':{ impact:'bad',  score:-25, quality:{ libraryComplexity:-40, yield:-20 } },
        'kapa-hifi':  { impact:'warn', score:-15, quality:{ libraryComplexity:-20 } } }),

    { id:'pcr-cycles-qpcr', phase:'qPCR Run', title:'Number of qPCR Cycles',
      desc:'Set the number of amplification cycles on the QuantStudio 7 Pro or RotorGene Q.',
      edu:'Standard qPCR runs 40 cycles with a 3-step protocol: denaturation 95°C (15 s) / annealing+extension 60°C (60 s). Moderately expressed genes give Ct 18–28. Reference genes (ACTB, GAPDH) typically Ct 15–22. If your target Ct exceeds 35 at 40 cycles, increase RNA input rather than adding cycles — beyond 45 cycles you enter the plateau and amplify non-specific products. TaqMan assays use a FAM/MGB probe read during the extension step.',
      pipelineStage:3, type:'slider', min:30, max:50, optimal:40, unit:'cycles', label:'qPCR cycles',
      quality_fn:(v)=>{ if(v<35){return{yield:-20};} if(v>45){return{purity:-15,duplication:10};} return{}; },
      score_fn:(v)=>{ if(v<35||v>46){return-18;} if(v>42){return-8;} return 0; } },

    { id:'anneal-temp', phase:'qPCR Run', title:'Primer Annealing Temperature',
      desc:'Set the annealing temperature for qPCR primers. Most TaqMan assays run at 60°C.',
      edu:'Primer Tm directly controls specificity vs efficiency. Too low (< Tm − 5°C): non-specific amplification, multiple peaks on melt curve. Too high (> Tm + 5°C): reduced efficiency — Ct shifts right by 1–3 per degree. Universal annealing at 60°C covers most TaqMan assays (probe Tm 68–70°C). For SYBR Green, validate every new primer pair with a dissociation curve — a single sharp peak at Tm confirms a clean product.',
      pipelineStage:3, type:'slider', min:50, max:70, optimal:60, unit:'°C', label:'Annealing temperature',
      quality_fn:(v)=>{ if(v<55){return{purity:-20,duplication:15};} if(v>65){return{yield:-18};} return{}; },
      score_fn:(v)=>{ const d=Math.abs(v-60); return d>7?-20:d>4?-8:0; } },

    choiceStep('norm-method','Data Analysis','Reference Gene Normalisation Strategy',
      'Choose the normalisation method for ΔΔCt calculation.',
      'ΔΔCt requires a stably expressed reference gene. ACTB and GAPDH are widely used but are not universally stable — GAPDH is upregulated by insulin and hypoxia. GeNorm analysis recommends averaging ≥ 2 reference genes to reduce variability. TBP and HPRT1 are among the most stable in immune-cell panels. Using raw Ct values without normalisation cannot distinguish biological from technical variation (pipetting differences, RNA input, reverse transcription efficiency).',
      6,
      [{ label:'Two reference genes (GeNorm)', desc:'Most robust — averages variability between housekeeping genes. MIQE guideline compliant.', impact:'good', score:0, quality:{} },
       { label:'Single gene (ACTB or GAPDH)', desc:'Widely accepted but can introduce bias in metabolic or stress conditions.', impact:'good', score:-5, quality:{ purity:-8 } },
       { label:'No normalisation (raw Ct)', desc:'Cannot separate biological signal from technical noise — violates MIQE guidelines.', impact:'bad', score:-28, quality:{ purity:-40, libraryComplexity:-20 } },
       { label:'Absolute quantification (standard curve)', desc:'Valid for viral load or copy-number quantification with known standards.', impact:'good', score:-2, quality:{} }])
  ]
};

/* ────────────────────────────────────────────────────────────
   16. Ion AmpliSeq Targeted Panel  (Thermo Fisher / QIAGEN)
   ──────────────────────────────────────────────────────────── */
OmicsLab.Workflows['ampli-seq'] = {
  id:'ampli-seq', domain:'genomics', domainLabel:'Genomics',
  name:'Ion AmpliSeq Targeted Panel', difficulty:'intermediate', icon:'target',
  color:'var(--genomics)', colorHex:'#58a6ff',
  desc:'Sequence targeted panels of cancer hotspot genes, pharmacogenomics loci, or pathogen-typing amplicons from FFPE or liquid biopsy samples using Ion Torrent semiconductor sequencing on the Ion GeneStudio S5.',
  pipeline:['DNA Extraction','Quantification (Qubit)','AmpliSeq Library Prep','ISP Templating','Ion Torrent Sequencing','Coverage QC','Variant Calling','Annotation'],
  steps:[
    dragStep('dna-source-amp','Sample Input','Select DNA Source',
      'Drag your starting DNA material to the input tube.',
      'Ion AmpliSeq requires only 1–10 ng DNA — designed specifically for FFPE and low-input samples. FFPE introduces C→T deamination artefacts at low allele frequencies (< 2%) — use the Ion AmpliSeq FFPE Repair Mix before library prep. For liquid biopsy (ctDNA), ultra-low input panels require a minimum of 5 ng; allele frequencies as low as 0.1–1% can be detected at deep coverage (≥ 5,000×). Blood (EDTA) gives the cleanest DNA for germline panels.',
      0,'snowflake','Input Tube','Drop DNA source here',
      ['blood-edta','ffpe','fresh-tissue','cultured-cells'],
      { 'blood-edta':    { impact:'good', score:0,   quality:{} },
        'fresh-tissue':  { impact:'good', score:0,   quality:{} },
        'cultured-cells':{ impact:'good', score:0,   quality:{} },
        'ffpe':          { impact:'good', score:-5,  quality:{ sampleIntegrity:-10 } } }),

    dragStep('dna-ext-amp','DNA Extraction','Select Extraction Method',
      'Drag the extraction kit to the sample tube.',
      'DNeasy Blood & Tissue (QIAGEN) is standard for most inputs — 200 µL blood or 25 mg tissue, yielding 5–15 µg of high-molecular-weight DNA. QIAamp DNA FFPE Tissue Kit adds a deparaffinisation step and extended 90°C incubation to reverse formaldehyde crosslinks — critical for FFPE blocks where standard kits yield degraded, amplification-resistant DNA. Phenol-chloroform gives high yield but requires multiple hazardous reagents and generates inconsistent purity.',
      0,'flask','Extraction Column','Drop extraction kit here',
      ['dneasy','qiamp-ffdna','phenol-ci','boiling'],
      { 'dneasy':     { impact:'good', score:0,   quality:{} },
        'qiamp-ffdna':{ impact:'good', score:0,   quality:{ sampleIntegrity:5 } },
        'phenol-ci':  { impact:'warn', score:-12, quality:{ purity:-20, yield:-10 } },
        'boiling':    { impact:'bad',  score:-40, quality:{ sampleIntegrity:-70, yield:-50 } } }),

    dragStep('amp-lib-prep','Library Preparation','Select Library Preparation Kit',
      'Drag the library prep kit to the PCR amplification tube.',
      'Ion AmpliSeq Library Kit Plus (Thermo Fisher) uses pre-designed multiplexed primer pools — a single PCR reaction amplifies all targets simultaneously from as little as 1 ng DNA. QIAseq Targeted DNA Panels (QIAGEN) add unique molecular indices (UMIs) per amplicon for error correction — essential for detecting variants at < 1% VAF in liquid biopsy. TruSeq and Nextera XT are Illumina-specific kits: their adapters are incompatible with Ion Torrent ISP templating and will produce zero usable reads.',
      2,'package','Library Prep Tube','Drop kit here',
      ['ion-amp-lib','qiaseq-fx','truseq','nextera-xt'],
      { 'ion-amp-lib':{ impact:'good', score:0,   quality:{} },
        'qiaseq-fx':  { impact:'good', score:-3,  quality:{} },
        'truseq':     { impact:'bad',  score:-40, quality:{ libraryComplexity:-80, yield:-60 } },
        'nextera-xt': { impact:'bad',  score:-35, quality:{ libraryComplexity:-70 } } }),

    { id:'target-depth', phase:'Sequencing', title:'Mean Target Coverage Depth',
      desc:'Set the mean coverage depth across all targeted amplicons on the Ion GeneStudio S5.',
      edu:'Somatic variant calling in oncology panels requires ≥ 500× mean coverage to detect variants at 5% VAF with 95% confidence (Poisson statistics). Germline variant calling (pharmacogenomics, hereditary cancer) is reliable at 100–200×. Coverage uniformity matters as much as mean depth — amplicons with < 20× produce no calls regardless of panel mean. The Ion GeneStudio S5 Prime chip (Ion 550) yields 660 Mb output, supporting a 50-gene panel at 1,000× from 16 samples per run.',
      pipelineStage:5, type:'slider', min:50, max:2000, optimal:500, unit:'×', label:'Mean target coverage',
      quality_fn:(v)=>{ if(v<100){return{sampleIntegrity:-40,libraryComplexity:-30};} if(v<300){return{sampleIntegrity:-15};} return{}; },
      score_fn:(v)=>{ if(v<100){return-30;} if(v<300){return-15;} return 0; } },

    choiceStep('variant-caller-amp','Bioinformatics','Variant Calling Pipeline',
      'Select the variant calling algorithm for somatic or germline mutation detection.',
      'Torrent Variant Caller (TVC) is Ion-optimised — it models the homopolymer deletion artefacts inherent to semiconductor sequencing (e.g. repeated A/T runs produce systematic length errors). GATK HaplotypeCaller is built for Illumina error profiles and will over-report false indels in homopolymer regions on Ion data. VarScan2 is platform-agnostic and performs well on paired tumour/normal data. Annotation with ClinVar, OncoKB, or COSMIC is mandatory before clinical reporting.',
      6,
      [{ label:'Torrent Variant Caller (TVC)', desc:'Ion-optimised. Handles homopolymer errors. Required for Ion GeneStudio data.', impact:'good', score:0, quality:{} },
       { label:'VarScan2 (somatic)', desc:'Platform-agnostic. Best for paired tumour/normal panels.', impact:'good', score:-5, quality:{ purity:-5 } },
       { label:'GATK HaplotypeCaller', desc:'Illumina-optimised — over-reports indels in Ion homopolymer regions.', impact:'warn', score:-15, quality:{ purity:-25 } },
       { label:'No variant calling (coverage QC only)', desc:'Provides depth metrics but zero clinical utility — defeats the purpose of targeted sequencing.', impact:'bad', score:-35, quality:{ libraryComplexity:-60 } }])
  ]
};

/* ── Domain registry (used by landing page) ── */
OmicsLab.DOMAINS = [
  { id:'genomics',       label:'Genomics',        icon:'dna',        color:'var(--genomics)',    colorHex:'#58a6ff', rgb:'88,166,255', badge:'badge-blue',
    desc:'Map the complete DNA sequence of an organism or characterise variants linked to disease.',
    workflows:['wgs','wes','ampli-seq'] },
  { id:'transcriptomics',label:'Transcriptomics', icon:'activity',   color:'var(--transcripto)', colorHex:'#00C4A0', rgb:'63,185,80',  badge:'badge-green',
    desc:'Quantify gene expression at population (bulk) or single-cell resolution.',
    workflows:['rna-seq','scrna-seq','rt-qpcr'] },
  { id:'epigenomics',    label:'Epigenomics',     icon:'lock-open',  color:'var(--epigenomics)', colorHex:'#d2a8ff', rgb:'210,168,255',badge:'badge-blue',
    desc:'Profile chromatin accessibility, histone modifications, and DNA methylation.',
    workflows:['atac-seq','chip-seq'] },
  { id:'metagenomics',   label:'Metagenomics',    icon:'git-branch', color:'var(--metagenomics)',colorHex:'#ffa657', rgb:'255,166,87', badge:'badge-orange',
    desc:'Characterise complex microbial communities from environmental and clinical samples.',
    workflows:['shotgun-meta','16s-amplicon'] },
  { id:'metabolomics',   label:'Metabolomics',    icon:'flask',      color:'var(--metabolomics)',colorHex:'#f78166', rgb:'247,129,102',badge:'badge-red',
    desc:'Profile the small-molecule metabolites reflecting cellular and physiological state.',
    workflows:['lc-ms'] },
  { id:'proteomics',     label:'Proteomics',      icon:'layers',     color:'var(--proteomics)',  colorHex:'#79c0ff', rgb:'121,192,255',badge:'badge-blue',
    desc:'Identify and quantify proteins and their modifications at the whole-proteome level.',
    workflows:['proteomics'] },
  { id:'virology',       label:'Virology',        icon:'virus',      color:'var(--virology)',    colorHex:'#ff7b72', rgb:'255,123,114',badge:'badge-red',
    desc:'Sequence and characterise viral genomes for outbreak surveillance and strain typing.',
    workflows:['viral-wgs'] },
  { id:'multiomics',     label:'Multi-omics',     icon:'target',     color:'var(--multiomics)',  colorHex:'#e3b341', rgb:'227,179,65', badge:'badge-orange',
    desc:'Simultaneously profile multiple molecular layers from the same biological sample.',
    workflows:['cite-seq'] },
];
