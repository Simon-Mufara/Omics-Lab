/* ═══════════════════════════════════════════════════════════════
   OmicsLab — Disease & Application Context
   Maps every disease to the workflows that study it,
   the biomarkers being hunted, and the expected findings
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.DISEASES = {

  /* ── ONCOLOGY ─────────────────────────────────────────────── */
  'breast-cancer': {
    name: 'Breast Cancer', category: 'Oncology', icon: '🎗️',
    color: '#ff7b9c',
    description: 'The most common cancer in women globally. TNBC and HER2+ subtypes have poor prognosis. African women have higher rates of aggressive TNBC.',
    workflows: ['wgs','rna-seq','scrna-seq','atac-seq','chip-seq','proteomics','lc-ms'],
    biomarkers: ['BRCA1/BRCA2 mutations','HER2 amplification','ESR1 mutations','PIK3CA mutations','Ki-67 proliferation index','ctDNA'],
    findings: 'WGS identifies somatic driver mutations and homologous recombination deficiency. RNA-seq classifies intrinsic subtypes (Luminal A/B, HER2-enriched, Basal-like). scRNA-seq maps the tumour microenvironment and immune infiltrate.',
    tools: ['GATK HaplotypeCaller','MutSig2CV','STAR-Fusion','InferCNV','clusterProfiler'],
    databases: ['TCGA BRCA','COSMIC','ClinVar','METABRIC'],
    africanContext: 'High TNBC frequency in sub-Saharan Africa linked to BRCA1/2 germline variants and unique somatic mutational signatures.'
  },

  'lung-cancer': {
    name: 'Lung Cancer (NSCLC)', category: 'Oncology', icon: '🫁',
    color: '#87ceeb',
    description: 'Leading cause of cancer death worldwide. NSCLC accounts for ~85% of cases. EGFR, KRAS, and ALK mutations drive targeted therapy selection.',
    workflows: ['wgs','wes','rna-seq','scrna-seq','lc-ms'],
    biomarkers: ['EGFR L858R / exon 19 del','KRAS G12C','ALK fusion','PD-L1 TPS','STK11','KEAP1','TMB'],
    findings: 'WGS detects copy number alterations and structural rearrangements (ALK/ROS1 fusions). scRNA-seq resolves treatment-resistant cell sub-populations. LC-MS identifies metabolic reprogramming markers.',
    tools: ['GATK','Arriba (fusions)','DESeq2','Seurat','MetaboAnalyst'],
    databases: ['TCGA LUAD/LUSC','COSMIC','OncoKB','GENIE'],
    africanContext: 'Lower smoking rates but increasing urban air pollution exposure drives different mutational spectra in African populations.'
  },

  'colorectal-cancer': {
    name: 'Colorectal Cancer (CRC)', category: 'Oncology', icon: '🔴',
    color: '#e74c3c',
    description: 'Third most common cancer. Characterised by chromosomal instability (CIN) or microsatellite instability (MSI). MSI-high tumours respond to immunotherapy.',
    workflows: ['wgs','wes','rna-seq','scrna-seq','shotgun-meta','lc-ms'],
    biomarkers: ['KRAS/NRAS/BRAF mutations','APC truncation','MSI status','CpG island methylation','CEA','Fusobacterium nucleatum abundance'],
    findings: 'WGS identifies the 4 consensus molecular subtypes (CMS1-4). Metagenomics links gut dysbiosis (Fusobacterium nucleatum) to tumour stage. Metabolomics shows altered bile acid and tryptophan metabolism.',
    tools: ['GATK','MSIsensor','STAR','HUMAnN3','XCMS'],
    databases: ['TCGA COAD','COSMIC','KEGG','HMDB'],
    africanContext: 'Rising CRC incidence in urban Africa linked to dietary westernisation. Unique microbiome compositions in South African cohorts.'
  },

  'leukemia': {
    name: 'Acute Myeloid Leukaemia (AML)', category: 'Oncology', icon: '🩸',
    color: '#c0392b',
    description: 'Aggressive blood cancer of myeloid progenitor cells. FLT3, NPM1, DNMT3A, and IDH1/2 mutations define treatment-relevant subgroups.',
    workflows: ['wgs','wes','rna-seq','scrna-seq','atac-seq','chip-seq'],
    biomarkers: ['FLT3-ITD','NPM1 insertion','IDH1/2 mutations','DNMT3A R882','WT1 expression','MRD (measurable residual disease)'],
    findings: 'scRNA-seq identifies leukaemic stem cell populations that drive relapse. ATAC-seq maps open chromatin changes during differentiation arrest. ChIP-seq profiles abnormal PRC2-mediated silencing.',
    tools: ['GATK','Cell Ranger','Seurat','MACS3','ChIPseeker','Harmony'],
    databases: ['TCGA LAML','BEAT AML','BloodSpot','ENCODE'],
    africanContext: 'Limited genomic data from African AML patients — H3Africa consortium filling this gap.'
  },

  /* ── INFECTIOUS DISEASE ───────────────────────────────────── */
  'tuberculosis': {
    name: 'Tuberculosis (TB)', category: 'Infectious Disease', icon: '🦠',
    color: '#f39c12',
    description: 'Global leading infectious disease killer. M. tuberculosis H37Rv has a 4.4 Mb genome. Drug resistance (MDR-TB, XDR-TB) is driven by specific SNPs in rpoB, katG, inhA.',
    workflows: ['wgs','rna-seq','shotgun-meta'],
    biomarkers: ['rpoB S450L (rifampicin resistance)','katG S315T (isoniazid)','embB M306V (ethambutol)','pncA variants (pyrazinamide)','Drug resistance index','Beijing lineage'],
    findings: 'WGS provides full drug-resistance profile in <48h vs weeks for culture-based DST. Whole-genome phylogeny traces outbreak transmission chains. RNA-seq reveals host immune gene signatures distinguishing active vs latent TB.',
    tools: ['MTBseq','TBProfiler','KvarQ','BEAST2','DESeq2'],
    databases: ['CRyPTIC','ReSeqTB','PATRIC','NCBI RefSeq H37Rv'],
    africanContext: 'South Africa has one of the world\'s highest TB burdens (520/100,000). H3Africa and DTHF driving African genomic TB surveillance.'
  },

  'sars-cov2': {
    name: 'SARS-CoV-2 / COVID-19', category: 'Infectious Disease', icon: '🦠',
    color: '#8e44ad',
    description: 'The betacoronavirus responsible for the COVID-19 pandemic. A 30 kb positive-sense RNA genome. Spike protein mutations drive immune evasion and increased transmissibility.',
    workflows: ['viral-wgs','rna-seq','scrna-seq','lc-ms','proteomics','shotgun-meta'],
    biomarkers: ['Spike S protein mutations (BA.2.86, XBB.1.5)','Furin cleavage site','N501Y, E484K, K417N','ACE2 binding affinity','Ct value','Variant of Concern classification'],
    findings: 'ARTIC amplicon WGS provides variant classification and phylogenetic placement in real time. RNA-seq reveals interferon suppression signatures. scRNA-seq maps cell-type tropism and cytokine storm transcriptomics. Metabolomics identifies tryptophan pathway disruption in long COVID.',
    tools: ['iVar','Pangolin','Nextclade','BEAST2','STAR','Seurat'],
    databases: ['GISAID','NCBI SRA','NCBI RefSeq NC_045512.2','EpiCoV'],
    africanContext: 'Africa CDC SARS-CoV-2 surveillance network. NICD South Africa sequenced first Omicron (BA.1) genomes (Nov 2021).'
  },

  'hiv': {
    name: 'HIV-1', category: 'Infectious Disease', icon: '🔴',
    color: '#e74c3c',
    description: 'A 9.7 kb RNA retrovirus causing AIDS. Africa carries >70% of the global burden. Drug resistance profiling and host genetics determine treatment outcomes.',
    workflows: ['viral-wgs','rna-seq','scrna-seq','shotgun-meta','lc-ms'],
    biomarkers: ['RT mutations (M184V, K65R, K103N)','Protease mutations (D30N, I50V)','CD4+ count','Viral load','HLA-B*57:01 (abacavir hypersensitivity)','CCR5 tropism'],
    findings: 'WGS of HIV-1 pol/env genes provides drug resistance genotyping. scRNA-seq maps CD4+ T cell depletion dynamics. Metagenomics characterises gut dysbiosis associated with disease progression.',
    tools: ['HIV-GRADE','Stanford HIVdb','DESeq2','Kraken2','STAR'],
    databases: ['Los Alamos HIV Database','Stanford HIVdb','GISAID'],
    africanContext: 'South Africa: 8.2M people living with HIV — the world\'s largest epidemic. H3Africa genome-wide association studies of host genetic factors.'
  },

  'malaria': {
    name: 'Malaria (P. falciparum)', category: 'Infectious Disease', icon: '🦟',
    color: '#27ae60',
    description: 'A 23 Mb genome parasite transmitted by Anopheles mosquitoes. Artemisinin resistance is expanding globally. Africa bears >90% of global malaria deaths.',
    workflows: ['wgs','rna-seq','lc-ms'],
    biomarkers: ['kelch13 mutations (artemisinin resistance)','pfcrt (chloroquine)','pfmdr1 (lumefantrine)','Plasmodium species ID','Multiplicity of infection','var gene expression'],
    findings: 'WGS identifies drug resistance mutations and parasite relatedness for transmission mapping. RNA-seq profiles stage-specific transcriptomes. Metabolomics identifies haemozoin metabolism as drug target.',
    tools: ['GATK','SnpEff','DESeq2','Artemis','MalariaGEN pipeline'],
    databases: ['MalariaGEN','PlasmoDB','WHO drug resistance report'],
    africanContext: 'Africa Centres for Disease Control driving genomic surveillance. WWARN coordinating African artemisinin resistance monitoring.'
  },

  /* ── NEUROLOGICAL ─────────────────────────────────────────── */
  'alzheimers': {
    name: 'Alzheimer\'s Disease', category: 'Neurological', icon: '🧠',
    color: '#9b59b6',
    description: 'Most common neurodegenerative disease. APOE ε4 is the strongest genetic risk factor. Amyloid-β and tau pathology drive neuronal loss.',
    workflows: ['wgs','wes','rna-seq','scrna-seq','proteomics','lc-ms'],
    biomarkers: ['APOE ε4 allele','APP/PSEN1/PSEN2 mutations (familial)','CSF Aβ42/tau ratio','NfL (neurofilament light chain)','TREM2 variants','Synaptic proteins'],
    findings: 'WGS/WES identifies rare coding variants in SORL1, ABCA7, CLU. scRNA-seq reveals microglia activation states and disease-associated microglia (DAM). CSF proteomics finds synaptic and inflammatory markers preceding symptoms by 10+ years.',
    tools: ['GATK','MAGMA','STAR','Seurat','MaxQuant','MetaboAnalyst'],
    databases: ['ADNI','ROSMAP','UK Biobank','AlzGene'],
    africanContext: 'APOE ε4 is more common in African populations but paradoxically confers lower AD risk — a major open research question.'
  },

  /* ── AUTOIMMUNE & INFLAMMATORY ────────────────────────────── */
  'ibd': {
    name: 'Inflammatory Bowel Disease (IBD)', category: 'Autoimmune', icon: '🫁',
    color: '#e67e22',
    description: 'Chronic relapsing inflammation of the GI tract. Crohn\'s disease and ulcerative colitis. Driven by genetic susceptibility + gut microbiome dysbiosis.',
    workflows: ['wgs','wes','rna-seq','scrna-seq','shotgun-meta','16s-amplicon','lc-ms','atac-seq'],
    biomarkers: ['NOD2 variants','IL23R/IL10/CARD9 loci','Faecalibacterium prausnitzii abundance','Calprotectin','CRP','Tight junction proteins','Short-chain fatty acids'],
    findings: 'Metagenomics identifies loss of Firmicutes and expansion of Proteobacteria. scRNA-seq maps inflammatory fibroblast and macrophage activation. ATAC-seq reveals regulatory changes at IBD GWAS loci in intestinal epithelial cells.',
    tools: ['GATK','PLINK','DESeq2','Seurat','QIIME2','LEfSe','XCMS'],
    databases: ['NIDDK IBDGC','iHMP','gutMEGA','IMG/HMP'],
    africanContext: 'Low IBD prevalence in rural Africa vs rising incidence with urbanisation — ideal natural experiment for microbiome-disease interaction.'
  },

  /* ── METABOLIC ────────────────────────────────────────────── */
  'diabetes-t2': {
    name: 'Type 2 Diabetes (T2D)', category: 'Metabolic', icon: '🩸',
    color: '#3498db',
    description: 'A metabolic disorder of insulin resistance and beta-cell dysfunction. 537 million cases globally. African populations have unique genetic architecture and risk factors.',
    workflows: ['wgs','wes','rna-seq','shotgun-meta','16s-amplicon','lc-ms','proteomics'],
    biomarkers: ['TCF7L2 rs7903146','KCNJ11 variants','HbA1c','Fasting glucose','HOMA-IR','SCFA-producing bacteria','Branched-chain amino acids','Acylcarnitines'],
    findings: 'GWAS finds >400 T2D loci, many population-specific. Metagenomics shows Akkermansia muciniphila depletion. Metabolomics identifies BCAA elevation as early T2D biomarker.',
    tools: ['PLINK','METAL','GATK','HUMAnN3','XCMS','MetaboAnalyst'],
    databases: ['DIAGRAM','UK Biobank','AWI-Gen (Africa-specific)','HMDB'],
    africanContext: 'Africa Wits-INDEPTH partnership (AWI-Gen) — largest African T2D GWAS. Unique African ancestral genetic background yields novel loci not found in European cohorts.'
  },

  /* ── RARE DISEASE ─────────────────────────────────────────── */
  'rare-mendelian': {
    name: 'Rare Mendelian Disorders', category: 'Rare Disease', icon: '🧬',
    color: '#1abc9c',
    description: 'Over 7,000 rare diseases, 80% genetic. Exome sequencing has transformed diagnosis — ~35-40% diagnostic yield for unsolved cases.',
    workflows: ['wes','wgs'],
    biomarkers: ['De novo variants','Homozygous rare variants (consanguinity)','Copy number variants','Compound heterozygosity','Splicing-disrupting variants','Mitochondrial variants'],
    findings: 'WES identifies causal variants in 35-40% of unsolved rare disease cases. The diagnostic rate increases to 50%+ with trio sequencing (proband + parents) enabling de novo variant detection.',
    tools: ['GATK HC','ANNOVAR','VEP','Phenolyzer','PhenoTips','Franklin','CADD'],
    databases: ['ClinVar','OMIM','gnomAD','HGMD','ClinGen'],
    africanContext: 'High consanguinity in some African communities increases homozygous variant discovery. Founder effects create unique pathogenic variant spectra not in European databases.'
  },

  /* ── EPIGENETICS & DEVELOPMENT ────────────────────────────── */
  'cancer-epigenetics': {
    name: 'Cancer Epigenetics', category: 'Epigenomics', icon: '🔓',
    color: '#d2a8ff',
    description: 'Aberrant DNA methylation, histone modifications, and chromatin remodelling drive cancer gene expression changes independent of DNA sequence mutations.',
    workflows: ['atac-seq','chip-seq','rna-seq','scrna-seq'],
    biomarkers: ['H3K27ac super-enhancers','EZH2/PRC2 activity','CpG island methylation','CTCF binding','BRD4 at oncogene promoters','Pioneer TF binding'],
    findings: 'ATAC-seq maps cis-regulatory elements hijacked by oncogenic TFs. ChIP-seq identifies H3K27ac super-enhancers driving MYC and other oncogene expression. Combined ATAC+RNA-seq links enhancer activity to gene expression changes.',
    tools: ['MACS3','deepTools','GREAT','HOMER','ChIPseeker','diffBind'],
    databases: ['ENCODE','Roadmap Epigenomics','GEO','4D Nucleome'],
    africanContext: 'Under-representation of African samples in reference epigenome maps — major gap in regulatory variant interpretation.'
  }
};

/* ── Tool reference database ─────────────────────────────── */
OmicsLab.TOOLS = {

  /* ─── ALIGNMENT & MAPPING ─── */
  'bwa-mem2': {
    name:'BWA-MEM2', category:'Alignment', stage:'bioinformatics',
    input:'FASTQ', output:'BAM/CRAM',
    desc:'Burrows-Wheeler Aligner — gold standard for DNA short-read alignment to a reference genome. 2× faster than BWA-MEM with identical results.',
    use:'Whole genome and exome sequencing alignment.',
    alternatives:['Bowtie2 (for ChIP-seq/ATAC-seq)','STAR (RNA-seq)'],
    url:'https://github.com/bwa-mem2/bwa-mem2'
  },
  'star': {
    name:'STAR', category:'Alignment', stage:'bioinformatics',
    input:'FASTQ', output:'BAM + splice junction BED',
    desc:'Spliced Transcripts Alignment to a Reference. Handles intron-spanning reads essential for RNA-seq. Detects novel splice junctions.',
    use:'RNA-seq and spatial transcriptomics alignment.',
    alternatives:['HISAT2','Salmon (quasi-mapping)'],
    url:'https://github.com/alexdobin/STAR'
  },
  'hisat2': {
    name:'HISAT2', category:'Alignment', stage:'bioinformatics',
    input:'FASTQ', output:'BAM',
    desc:'Hierarchical Indexing for Spliced Alignment of Transcripts. Graph-based aligner with lower memory than STAR.',
    use:'RNA-seq on memory-constrained systems.',
    alternatives:['STAR'],
    url:'https://daehwankimlab.github.io/hisat2'
  },
  'bowtie2': {
    name:'Bowtie2', category:'Alignment', stage:'bioinformatics',
    input:'FASTQ', output:'BAM',
    desc:'Fast and sensitive short-read aligner for DNA. Does NOT support splicing — use STAR for RNA-seq.',
    use:'ChIP-seq, ATAC-seq, targeted amplicon alignment.',
    alternatives:['BWA-MEM2'],
    url:'https://bowtie-bio.sourceforge.net/bowtie2'
  },

  /* ─── VARIANT CALLING ─── */
  'gatk-hc': {
    name:'GATK HaplotypeCaller', category:'Variant Calling', stage:'bioinformatics',
    input:'BAM + Reference FASTA', output:'VCF/GVCF',
    desc:'GATK Best Practices germline short variant discovery. Locally re-assembles reads in active regions to call SNPs and indels with high sensitivity.',
    use:'Germline WGS and WES variant calling.',
    alternatives:['DeepVariant','FreeBayes'],
    url:'https://gatk.broadinstitute.org'
  },
  'deepvariant': {
    name:'DeepVariant (Google)', category:'Variant Calling', stage:'bioinformatics',
    input:'BAM + Reference', output:'VCF',
    desc:'CNN-based variant caller treating pileup images as image classification. Outperforms GATK on substitution accuracy, especially on Illumina and PacBio HiFi data.',
    use:'WGS, WES, long-read variant calling.',
    alternatives:['GATK HaplotypeCaller'],
    url:'https://github.com/google/deepvariant'
  },
  'ivar': {
    name:'iVar', category:'Variant Calling', stage:'bioinformatics',
    input:'BAM (amplicon)', output:'TSV + consensus FASTA',
    desc:'Intrahost variant calling and consensus genome generation for amplicon sequencing. Essential for ARTIC/tiled amplicon viral WGS.',
    use:'Viral amplicon sequencing (SARS-CoV-2, Influenza).',
    alternatives:['Medaka (ONT)'],
    url:'https://andersen-lab.github.io/ivar'
  },
  'tbprofiler': {
    name:'TBProfiler', category:'Variant Calling', stage:'bioinformatics',
    input:'FASTQ', output:'JSON resistance report',
    desc:'End-to-end M. tuberculosis resistance profiling pipeline. Aligns, calls variants, and annotates resistance-conferring mutations from FASTQ in one command.',
    use:'TB drug resistance surveillance.',
    alternatives:['MTBseq','KvarQ'],
    url:'https://github.com/jodyphelan/TBProfiler'
  },

  /* ─── QC ─── */
  'fastqc': {
    name:'FastQC', category:'Quality Control', stage:'preprocessing',
    input:'FASTQ', output:'HTML QC report',
    desc:'Per-sequence quality scores, GC content, adapter content, sequence duplication — 12 QC modules in one HTML report.',
    use:'First-pass QC of any FASTQ file.',
    alternatives:['fastp (combined QC + trimming)','MultiQC (aggregating many FastQC reports)'],
    url:'https://www.bioinformatics.babraham.ac.uk/projects/fastqc'
  },
  'multiqc': {
    name:'MultiQC', category:'Quality Control', stage:'preprocessing',
    input:'FastQC/STAR/GATK logs', output:'Aggregated HTML report',
    desc:'Aggregates QC reports from 100+ tools into one interactive report. Identifies outlier samples across a cohort.',
    use:'Cohort-level QC before analysis.',
    alternatives:['Custom R scripts'],
    url:'https://multiqc.info'
  },
  'fastp': {
    name:'fastp', category:'Trimming & QC', stage:'preprocessing',
    input:'FASTQ', output:'Trimmed FASTQ + JSON QC',
    desc:'Ultra-fast all-in-one FASTQ preprocessor — quality trimming, adapter removal, polyG tail trimming, QC report generation in one pass.',
    use:'Pre-processing before any alignment step.',
    alternatives:['Trimmomatic','Cutadapt'],
    url:'https://github.com/OpenGene/fastp'
  },

  /* ─── SINGLE-CELL ─── */
  'cellranger': {
    name:'Cell Ranger', category:'Single-Cell', stage:'primary',
    input:'BCL/FASTQ', output:'Feature-barcode matrix + BAM',
    desc:'10x Genomics official pipeline: demultiplexing, barcode correction, UMI counting, secondary analysis. Required for 10x Chromium data.',
    use:'scRNA-seq, scATAC-seq, CITE-seq, Visium data processing.',
    alternatives:['STARsolo (faster, open-source)','Alevin-fry'],
    url:'https://support.10xgenomics.com/single-cell-gene-expression/software/pipelines/latest/what-is-cell-ranger'
  },
  'seurat': {
    name:'Seurat', category:'Single-Cell Analysis', stage:'bioinformatics',
    input:'Feature-barcode matrix', output:'R object + plots',
    desc:'The most widely used R package for scRNA-seq analysis. Normalisation, PCA, UMAP, clustering, marker gene identification, integration.',
    use:'scRNA-seq, scATAC-seq, CITE-seq analysis.',
    alternatives:['Scanpy (Python)','SingleCellExperiment (Bioconductor)'],
    url:'https://satijalab.org/seurat'
  },
  'scanpy': {
    name:'Scanpy', category:'Single-Cell Analysis', stage:'bioinformatics',
    input:'AnnData (h5ad)', output:'h5ad + plots',
    desc:'Python counterpart to Seurat. Faster for very large datasets (>1M cells). Full UMAP, Leiden clustering, trajectory analysis ecosystem.',
    use:'Large-scale scRNA-seq analysis, multi-sample integration.',
    alternatives:['Seurat (R)'],
    url:'https://scanpy.readthedocs.io'
  },
  'harmony': {
    name:'Harmony', category:'Batch Correction', stage:'bioinformatics',
    input:'PCA embedding + metadata', output:'Corrected PCA',
    desc:'Iterative PCA-space batch correction. Extremely fast (seconds for 100K cells). Works for sample, batch, and technology correction.',
    use:'Multi-sample scRNA-seq integration.',
    alternatives:['Scanorama','BBKNN','scVI'],
    url:'https://github.com/immunogenomics/harmony'
  },

  /* ─── DIFFERENTIAL EXPRESSION ─── */
  'deseq2': {
    name:'DESeq2', category:'Differential Expression', stage:'bioinformatics',
    input:'Raw count matrix', output:'DE gene table + plots',
    desc:'Negative binomial GLM with empirical Bayes shrinkage of fold changes. Gold standard for bulk RNA-seq DE with small n (3–10 per group).',
    use:'Bulk RNA-seq differential expression.',
    alternatives:['edgeR','limma-voom'],
    url:'https://bioconductor.org/packages/DESeq2'
  },
  'edger': {
    name:'edgeR', category:'Differential Expression', stage:'bioinformatics',
    input:'Raw count matrix', output:'DE gene table',
    desc:'Empirical analysis of Digital Gene Expression. Negative binomial model with tagwise dispersion estimation.',
    use:'RNA-seq DE, metagenomics differential abundance.',
    alternatives:['DESeq2'],
    url:'https://bioconductor.org/packages/edgeR'
  },
  'clusterprofiler': {
    name:'clusterProfiler', category:'Functional Enrichment', stage:'bioinformatics',
    input:'Gene list + background', output:'GO/KEGG enrichment table',
    desc:'The most comprehensive R package for gene ontology (GO), KEGG pathway, Reactome, and WikiPathways enrichment analysis.',
    use:'Interpreting DE gene lists from any omics experiment.',
    alternatives:['fgsea (GSEA)','g:Profiler'],
    url:'https://bioconductor.org/packages/clusterProfiler'
  },

  /* ─── PEAK CALLING ─── */
  'macs3': {
    name:'MACS3', category:'Peak Calling', stage:'bioinformatics',
    input:'BAM', output:'narrowPeak / broadPeak BED',
    desc:'Model-based Analysis of ChIP-Seq. The standard peak caller for ChIP-seq and ATAC-seq. Models local background to identify enriched regions.',
    use:'ChIP-seq transcription factor peaks, ATAC-seq NFR peaks.',
    alternatives:['HOMER','F-seq2 (ATAC-specific)'],
    url:'https://github.com/macs3-project/MACS'
  },
  'homer': {
    name:'HOMER', category:'Peak Calling & Motif', stage:'bioinformatics',
    input:'BAM / tag directories', output:'Peaks + motif HTML',
    desc:'Hypergeometric Optimization of Motif EnRichment. Peak calling plus integrated de novo and known motif analysis with JASPAR database.',
    use:'ChIP-seq, ATAC-seq peaks and motif enrichment.',
    alternatives:['MACS3 + FIMO','chromVAR'],
    url:'http://homer.ucsd.edu/homer'
  },
  'deeptools': {
    name:'deepTools2', category:'Visualisation', stage:'bioinformatics',
    input:'BAM/bigWig', output:'Heatmaps, profiles, bigWig',
    desc:'Suite for normalising and visualising deep sequencing data. bamCoverage, computeMatrix, plotHeatmap, plotProfile, bamCompare (log2 ChIP/Input).',
    use:'ChIP-seq, ATAC-seq, RNA-seq visualisation tracks.',
    alternatives:['IGV (interactive browser)','UCSC Genome Browser'],
    url:'https://deeptools.readthedocs.io'
  },

  /* ─── METAGENOMICS ─── */
  'kraken2': {
    name:'Kraken2', category:'Taxonomic Classification', stage:'bioinformatics',
    input:'FASTQ', output:'Kraken report + classified reads',
    desc:'k-mer exact-match taxonomic classifier. Classifies 1M reads/minute against databases of thousands of reference genomes.',
    use:'Shotgun metagenomics taxonomic profiling.',
    alternatives:['MetaPhlAn4','mOTUs3','Centrifuge'],
    url:'https://github.com/DerrickWood/kraken2'
  },
  'humann3': {
    name:'HUMAnN3', category:'Functional Profiling', stage:'bioinformatics',
    input:'FASTQ', output:'Gene families + pathway abundances',
    desc:'Human Microbiome Project Unified Metabolic Analysis Network. Maps reads to UniRef90 genes, then reconstructs MetaCyc pathways stratified by species.',
    use:'Shotgun metagenomics functional profiling.',
    alternatives:['SUPER-FOCUS','KEGG via Diamond'],
    url:'https://huttenhower.sph.harvard.edu/humann'
  },
  'qiime2': {
    name:'QIIME2', category:'16S Analysis', stage:'bioinformatics',
    input:'FASTQ (demuxed)', output:'Feature table + diversity plots',
    desc:'Quantitative Insights Into Microbial Ecology. Full 16S amplicon pipeline: denoising, taxonomy classification, alpha/beta diversity, differential abundance.',
    use:'16S rRNA amplicon community analysis.',
    alternatives:['mothur (older)'],
    url:'https://qiime2.org'
  },
  'dada2': {
    name:'DADA2', category:'ASV Inference', stage:'bioinformatics',
    input:'FASTQ', output:'ASV table + representative sequences',
    desc:'Divisive Amplicon Denoising Algorithm. Learns sequencing error models and corrects them to produce exact amplicon sequence variants (ASVs) at single-nucleotide resolution.',
    use:'16S, ITS, 18S amplicon denoising.',
    alternatives:['Deblur'],
    url:'https://benjjneb.github.io/dada2'
  },

  /* ─── METABOLOMICS ─── */
  'xcms': {
    name:'XCMS', category:'Metabolomics', stage:'bioinformatics',
    input:'mzML/mzXML raw MS files', output:'Feature matrix (m/z × RT × samples)',
    desc:'eXtensible Computational Mass Spectrometry. Peak detection (centWave), retention time alignment (obiwarp), gap filling, and isotope/adduct annotation.',
    use:'LC-MS untargeted metabolomics feature detection.',
    alternatives:['MZmine3','MS-DIAL'],
    url:'https://bioconductor.org/packages/xcms'
  },
  'metaboanalyst': {
    name:'MetaboAnalyst', category:'Metabolomics Statistics', stage:'bioinformatics',
    input:'Feature matrix (CSV)', output:'PCA, heatmaps, pathway maps',
    desc:'Comprehensive web-based platform for metabolomics statistical analysis: normalisation, PCA, PLS-DA, biomarker analysis, pathway enrichment.',
    use:'Metabolomics data interpretation and visualisation.',
    alternatives:['POMA (R)','MetaX'],
    url:'https://www.metaboanalyst.ca'
  },

  /* ─── PROTEOMICS ─── */
  'maxquant': {
    name:'MaxQuant', category:'Proteomics', stage:'bioinformatics',
    input:'Thermo RAW / mzML files', output:'proteinGroups.txt + peptides.txt',
    desc:'Quantitative proteomics software combining database searching (Andromeda) with label-free quantification (LFQ) and MaxLFQ normalisation.',
    use:'LC-MS/MS label-free quantification proteomics.',
    alternatives:['Proteome Discoverer (commercial)','DIA-NN (DIA)'],
    url:'https://www.maxquant.org'
  },
  'perseus': {
    name:'Perseus', category:'Proteomics Statistics', stage:'bioinformatics',
    input:'MaxQuant output tables', output:'Statistical analysis plots',
    desc:'Statistical analysis platform designed for MaxQuant output. Filtering, imputation, volcano plots, hierarchical clustering, GO enrichment.',
    use:'Downstream statistical analysis of proteomics data.',
    alternatives:['DEP (R Bioconductor)'],
    url:'https://maxquant.net/perseus'
  },

  /* ─── LINEAGE ASSIGNMENT ─── */
  'pangolin': {
    name:'Pangolin', category:'Viral Lineage', stage:'bioinformatics',
    input:'FASTA consensus genome', output:'Lineage CSV',
    desc:'Phylogenetic Assignment of Named Global Outbreak LINeages. The WHO-endorsed tool for SARS-CoV-2 Pango nomenclature assignment.',
    use:'SARS-CoV-2 variant classification and surveillance.',
    alternatives:['Nextclade','UShER'],
    url:'https://cov-lineages.org/resources/pangolin.html'
  },
  'nextclade': {
    name:'Nextclade', category:'Viral QC & Lineage', stage:'bioinformatics',
    input:'FASTA', output:'QC report + Nextstrain clade',
    desc:'Viral sequence quality control, mutation calling, and Nextstrain clade assignment. Runs in the browser — no installation needed.',
    use:'SARS-CoV-2 and other viral genome QC.',
    alternatives:['Pangolin'],
    url:'https://clades.nextstrain.org'
  },

  /* ─── GENOME BROWSERS & ANNOTATION ─── */
  'igv': {
    name:'IGV (Integrative Genomics Viewer)', category:'Visualisation', stage:'bioinformatics',
    input:'BAM/BED/VCF/bigWig', output:'Interactive genome browser',
    desc:'The standard desktop tool for visualising aligned reads, called variants, and genomic tracks across any genome build.',
    use:'Manual inspection of variants, peaks, and splice junctions.',
    alternatives:['UCSC Genome Browser','JBrowse2'],
    url:'https://igv.org'
  },
  'annovar': {
    name:'ANNOVAR', category:'Variant Annotation', stage:'bioinformatics',
    input:'VCF', output:'Annotated text table',
    desc:'Annotate Variation. Integrates dbSNP, ClinVar, gnomAD, SIFT, PolyPhen-2, CADD, SpliceAI, and 50+ other annotation databases.',
    use:'Clinical exome/genome variant interpretation.',
    alternatives:['VEP','Franklin'],
    url:'https://annovar.openbioinformatics.org'
  },
  'vep': {
    name:'VEP (Ensembl)', category:'Variant Annotation', stage:'bioinformatics',
    input:'VCF', output:'Annotated VCF + tabular report',
    desc:'Variant Effect Predictor. Annotates consequences against Ensembl gene models. Open-source, clinically validated, updated quarterly.',
    use:'Variant functional annotation for any organism with an Ensembl genome.',
    alternatives:['ANNOVAR'],
    url:'https://www.ensembl.org/vep'
  }
};

/* ── Workflow→Disease map (which diseases does this workflow study?) ── */
OmicsLab.WorkflowDiseases = {
  'wgs':          ['breast-cancer','colorectal-cancer','tuberculosis','malaria','rare-mendelian'],
  'wes':          ['rare-mendelian','breast-cancer','leukemia','diabetes-t2'],
  'rna-seq':      ['breast-cancer','lung-cancer','tuberculosis','sars-cov2','alzheimers'],
  'scrna-seq':    ['breast-cancer','leukemia','sars-cov2','ibd','cancer-epigenetics'],
  'atac-seq':     ['leukemia','cancer-epigenetics','ibd','breast-cancer'],
  'chip-seq':     ['cancer-epigenetics','breast-cancer','leukemia'],
  'shotgun-meta': ['ibd','colorectal-cancer','diabetes-t2','sars-cov2','hiv'],
  '16s-amplicon': ['ibd','diabetes-t2'],
  'lc-ms':        ['diabetes-t2','sars-cov2','alzheimers','colorectal-cancer'],
  'proteomics':   ['breast-cancer','alzheimers','sars-cov2'],
  'viral-wgs':    ['sars-cov2','hiv'],
  'cite-seq':     ['breast-cancer','sars-cov2','leukemia']
};
