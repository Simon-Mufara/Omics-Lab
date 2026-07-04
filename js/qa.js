/* ═══════════════════════════════════════════════════════════════
   OmicsLab — Built-in Q&A Engine
   No API needed — keyword search over pre-written omics answers
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.QA_DATA = [

  /* ── BASICS ───────────────────────────────────────────────── */
  {
    id: 'what-is-omics',
    category: 'Basics',
    q: 'What is omics?',
    a: 'Omics is an umbrella term for large-scale molecular profiling technologies. Each "ome" refers to a complete set of molecules of a given type: the <strong>genome</strong> (all DNA), <strong>transcriptome</strong> (all RNA), <strong>proteome</strong> (all proteins), <strong>metabolome</strong> (all metabolites), and <strong>epigenome</strong> (all epigenetic marks). Omics technologies generate massive datasets that reveal how biological systems work — and how they break down in disease.',
    tags: ['omics','genome','transcriptome','proteome','metabolome','epigenome','basics']
  },
  {
    id: 'what-is-wgs',
    category: 'Genomics',
    q: 'What is Whole Genome Sequencing (WGS)?',
    a: 'WGS determines the complete DNA sequence of an organism — all ~3 billion base pairs in humans. It detects SNPs, indels, structural variants, copy number variants, and chromosomal rearrangements. WGS is used for: population genetics, cancer driver discovery, rare disease diagnosis, and pathogen genomics. Typical sequencing depth is 30× (germline) to 100× (tumour). Data analysis follows the GATK Best Practices pipeline: alignment → duplicate marking → base quality recalibration → variant calling → annotation.',
    tags: ['wgs','whole genome','sequencing','snp','indel','variant','gatk']
  },
  {
    id: 'what-is-wes',
    category: 'Genomics',
    q: 'What is Whole Exome Sequencing (WES)?',
    a: 'WES sequences only the coding regions of the genome (exons), which make up ~1–2% of the genome but contain ~85% of disease-causing variants. It is faster and cheaper than WGS (~$100–300 vs ~$500–1000 per sample). The limitation is that it misses regulatory regions, non-coding variants, large structural variants, and deep intronic mutations. Standard depth is 100×. Use WES when you suspect a Mendelian disease caused by coding mutations, or when budget is limited.',
    tags: ['wes','exome','exon','sequencing','coding','mendelian']
  },
  {
    id: 'what-is-rnaseq',
    category: 'Transcriptomics',
    q: 'What is RNA-seq and why is it used?',
    a: 'RNA-seq (RNA sequencing) quantifies the transcriptome — all RNA molecules present in a sample at a given moment. It measures gene expression levels, detects alternative splicing, identifies fusion genes, and discovers novel transcripts. The workflow: RNA extraction → quality check (RIN ≥ 7 recommended) → rRNA depletion or poly-A selection → library prep → sequencing (usually 2×75 or 2×150 bp) → alignment (STAR) → quantification (featureCounts or RSEM) → differential expression analysis (DESeq2 or edgeR). RNA-seq replaces microarrays as the gold standard for transcriptomics.',
    tags: ['rna-seq','rnaseq','transcriptome','gene expression','deseq2','star','differential expression']
  },
  {
    id: 'what-is-scrna',
    category: 'Transcriptomics',
    q: 'What is single-cell RNA-seq (scRNA-seq)?',
    a: 'scRNA-seq measures gene expression in individual cells rather than a bulk average, revealing cellular heterogeneity hidden in bulk RNA-seq. Key steps: single-cell dissociation → cell capture (10x Genomics Chromium or droplet microfluidics) → barcoding → library preparation → sequencing → Cell Ranger demultiplexing → Seurat or Scanpy analysis. Applications: identifying rare cell types, mapping the tumour microenvironment, developmental trajectories, and immune profiling. Typical output: 1,000–10,000 cells with ~3,000 genes detected per cell.',
    tags: ['scrna','single cell','scrna-seq','10x genomics','seurat','scanpy','cell types','tumour microenvironment']
  },
  {
    id: 'what-is-atac',
    category: 'Epigenomics',
    q: 'What is ATAC-seq?',
    a: 'ATAC-seq (Assay for Transposase-Accessible Chromatin with high-throughput sequencing) maps open chromatin regions — regions where DNA is accessible and actively regulated. Tn5 transposase simultaneously cuts and ligates sequencing adapters at accessible sites. Open regions indicate active enhancers, promoters, and transcription factor binding sites. ATAC-seq requires far fewer cells than FAIRE-seq or DNase-seq (~500–50,000 cells). Analysis: align to genome → call peaks (MACS2) → motif analysis (HOMER or FIMO) → compare conditions. Commonly paired with RNA-seq to link chromatin accessibility to gene expression.',
    tags: ['atac','atac-seq','chromatin','accessibility','open chromatin','tn5','macs2','enhancer','promoter']
  },
  {
    id: 'what-is-chipseq',
    category: 'Epigenomics',
    q: 'What is ChIP-seq?',
    a: 'ChIP-seq (Chromatin Immunoprecipitation sequencing) maps where specific proteins (transcription factors, histone modifications) bind across the genome. Chromatin is fragmented and immunoprecipitated using an antibody against the protein of interest, then sequenced. Histone marks reveal chromatin state: H3K27ac marks active enhancers, H3K4me3 marks active promoters, H3K27me3 marks repressed regions. Key QC metric: FRiP score (Fraction of Reads in Peaks) — should be >0.01 for TFs and >0.3 for histone marks. Analysis uses MACS2 for peak calling.',
    tags: ['chip','chip-seq','histone','transcription factor','chromatin immunoprecipitation','h3k27ac','h3k4me3','macs2']
  },
  {
    id: 'what-is-metagenomics',
    category: 'Metagenomics',
    q: 'What is metagenomics?',
    a: 'Metagenomics is the direct sequencing of genetic material from an environmental or clinical sample — no culturing required. Shotgun metagenomics sequences all DNA in a sample, revealing which organisms are present and what metabolic functions they carry. 16S amplicon sequencing targets the bacterial 16S rRNA gene (a phylogenetic marker) to identify bacteria at lower cost. Applications: gut microbiome profiling, environmental monitoring, pathogen surveillance, and antimicrobial resistance gene detection. Key tools: Kraken2 (taxonomic classification), HUMAnN3 (functional profiling), QIIME2 (16S analysis).',
    tags: ['metagenomics','microbiome','16s','shotgun','taxonomic','kraken','qiime','functional profiling','gut']
  },
  {
    id: 'what-is-proteomics',
    category: 'Proteomics',
    q: 'What is proteomics and how does LC-MS/MS work?',
    a: 'Proteomics identifies and quantifies all proteins in a biological sample. LC-MS/MS (Liquid Chromatography coupled to tandem Mass Spectrometry) is the gold standard. Proteins are digested into peptides with trypsin, separated by liquid chromatography (retention time), ionised, selected by mass, fragmented, and the fragment masses are matched against a protein database. Label-free quantification (LFQ) or isobaric labelling (TMT, iTRAQ) enables differential abundance analysis. MaxQuant and Proteome Discoverer are the standard analysis platforms. Proteomics captures post-translational modifications (phosphorylation, ubiquitination) that RNA-seq cannot detect.',
    tags: ['proteomics','lc-ms','mass spectrometry','peptide','protein','trypsin','tmT','maxquant','phosphorylation']
  },
  {
    id: 'what-is-metabolomics',
    category: 'Metabolomics',
    q: 'What is metabolomics?',
    a: 'Metabolomics profiles small molecules (metabolites, MW < 1500 Da) in a biological sample — amino acids, lipids, sugars, organic acids, and drug metabolites. It captures the downstream phenotypic effect of gene expression and environmental exposures. Platforms: LC-MS (targeted or untargeted), GC-MS, and NMR spectroscopy. Untargeted metabolomics detects thousands of features without prior knowledge; targeted metabolomics quantifies specific metabolites with internal standards. XCMS and MZmine handle raw data processing; MetaboAnalyst is used for statistical analysis. Key applications: biomarker discovery, drug metabolism, and nutrition research.',
    tags: ['metabolomics','metabolite','lc-ms','gc-ms','nmr','xcms','metaboanalyst','biomarker','lipid']
  },

  /* ── QC METRICS ───────────────────────────────────────────── */
  {
    id: 'what-is-rin',
    category: 'QC Metrics',
    q: 'What is RIN score and why does it matter?',
    a: 'RIN (RNA Integrity Number) is a 1–10 score that measures RNA sample quality based on the electropherogram profile. RIN 10 = intact RNA; RIN 1 = completely degraded RNA. <strong>Minimum thresholds:</strong> RNA-seq requires RIN ≥ 7, ideally ≥ 8. FFPE samples often have RIN < 5 due to formalin fixation — use FFPE-specific library kits (Agilent XTHS). Low RIN causes 3′ bias (reads pile up at the 3′ end of transcripts), reducing coverage of full-length transcripts and inflating duplication rates. Measured using the Agilent Bioanalyzer or TapeStation.',
    tags: ['rin','rna integrity','rna quality','bioanalyzer','tapestation','ffpe','degraded','rna-seq']
  },
  {
    id: 'what-is-q30',
    category: 'QC Metrics',
    q: 'What is Q30 score in sequencing?',
    a: 'Q30 is the percentage of bases with a Phred quality score ≥ 30, meaning a <0.1% probability of an error (99.9% accuracy). Phred score Q = −10 × log₁₀(P), where P is the probability of error. Q30 ≥ 75% is the minimum for most analyses; Illumina NovaSeq typically achieves Q30 > 85%. Low Q30 (< 60%) indicates sequencing chemistry issues, over-clustering, or damaged flow cells. Downstream effects: more false-positive variants, lower alignment rates, and reduced sensitivity in peak calling.',
    tags: ['q30','phred','quality score','base quality','illumina','sequencing quality','error rate']
  },
  {
    id: 'what-is-duplication',
    category: 'QC Metrics',
    q: 'What is duplication rate and when is it a problem?',
    a: 'Duplication rate is the percentage of reads that are PCR duplicates — identical reads arising from PCR amplification of the same DNA fragment rather than independent sampling. Standard thresholds: <15% for WGS, <30% for RNA-seq, <50% for ChIP-seq (due to low input). High duplication (>50% for WGS) is caused by: low input DNA quantity, over-amplification, or very small libraries. Duplicates are marked (Picard MarkDuplicates) or removed. They do NOT count toward coverage depth in variant calling, inflating apparent depth while reducing effective coverage.',
    tags: ['duplication','pcr duplicates','picard','markduplicates','library complexity','coverage']
  },
  {
    id: 'what-is-260-280',
    category: 'QC Metrics',
    q: 'What does the 260/280 ratio mean in nucleic acid QC?',
    a: 'The 260/280 absorbance ratio measures nucleic acid purity using a spectrophotometer (NanoDrop). DNA absorbs maximally at 260 nm; proteins/phenol absorb at 280 nm. <strong>Acceptable values:</strong> DNA: 1.8–2.0; RNA: 2.0–2.1. Ratio < 1.7 indicates protein or phenol contamination (use column purification or ethanol precipitation). Ratio > 2.2 indicates RNA contamination in DNA samples. The 260/230 ratio additionally detects chaotropic salt (EDTA, guanidinium) contamination — should be 1.8–2.2.',
    tags: ['260/280','nanodrop','spectrophotometer','purity','dna quality','rna quality','protein contamination']
  },
  {
    id: 'what-is-alignment-rate',
    category: 'QC Metrics',
    q: 'What is a good alignment rate?',
    a: 'Alignment rate is the percentage of reads that map to the reference genome. Expected values: Human WGS/WES: ≥ 95%; RNA-seq (same species): ≥ 80%; 16S amplicon (matched database): > 90%; Metagenomics (complex communities): 20–80% (high host contamination reduces this). Low alignment rates indicate: wrong reference genome, severe adapter contamination (trim first with Trimmomatic/fastp), highly contaminated samples, or novel organisms not represented in the reference.',
    tags: ['alignment','mapping rate','bwa','star','bowtie','reference genome','adapter']
  },
  {
    id: 'what-is-coverage',
    category: 'QC Metrics',
    q: 'What sequencing depth (coverage) do I need?',
    a: 'Sequencing depth (coverage) is the average number of times each base is read. <strong>Recommended minimums:</strong> Germline WGS: 30× (GATK recommends ≥ 20×); Somatic tumour WGS: 80–100× (tumour) + 40× (normal); WES: 100× mean, >20× at 95% of target; RNA-seq: 20–30 million reads for differential expression; scRNA-seq: 25,000–50,000 reads per cell; ChIP-seq: 20–40 million reads; ATAC-seq: 50 million reads. More depth = better sensitivity for low-frequency variants and rare transcripts, but with diminishing returns.',
    tags: ['coverage','depth','sequencing depth','30x','reads','sensitivity']
  },
  {
    id: 'what-is-frip',
    category: 'QC Metrics',
    q: 'What is FRiP score in ChIP-seq?',
    a: 'FRiP (Fraction of Reads in Peaks) measures ChIP-seq enrichment quality — the proportion of reads that fall within called peak regions. FRiP < 0.01 = failed enrichment; FRiP 0.01–0.05 = marginal (common for most TF ChIPs); FRiP > 0.3 = excellent (expected for broad histone marks like H3K27me3). The ENCODE consortium requires FRiP ≥ 0.01 for TFs and ≥ 0.3 for histone modifications. Low FRiP can indicate antibody failure, suboptimal crosslinking, or insufficient chromatin shearing.',
    tags: ['frip','chip-seq','peak','enrichment','encode','histone','transcription factor','quality']
  },
  {
    id: 'what-is-contamination',
    category: 'QC Metrics',
    q: 'How do I detect cross-sample contamination?',
    a: 'Cross-sample contamination occurs when DNA from one sample contaminates another during processing. Detection tools: <strong>VerifyBamID</strong> estimates contamination from SNP allele frequencies — values > 3% indicate contamination. <strong>ConpairFAST</strong> checks tumour-normal pair concordance. In RNA-seq, FastQ Screen maps reads against multiple genomes to detect exogenous species. Signs: unexpected heterozygous calls, allele frequencies inconsistent with copy number, or unexpected genetic diversity. Prevention: physical separation of samples, dedicated equipment, and negative controls.',
    tags: ['contamination','verifybamid','cross-contamination','sample swap','fastq screen']
  },

  /* ── TOOLS ────────────────────────────────────────────────── */
  {
    id: 'what-is-gatk',
    category: 'Tools',
    q: 'What is GATK and how does it call variants?',
    a: 'GATK (Genome Analysis Toolkit) by the Broad Institute is the standard tool for germline and somatic variant calling from WGS/WES data. For germline SNPs/indels: GATK HaplotypeCaller uses a local de-novo assembly of reads in active regions, then models haplotypes probabilistically (HMM). For somatic variants: Mutect2 uses a tumour-normal paired model that filters germline variants. The GATK Best Practices pipeline: BWA-MEM alignment → Picard MarkDuplicates → BQSR (base quality score recalibration) → HaplotypeCaller → VQSR (variant quality score recalibration) → annotation with ANNOVAR or VEP.',
    tags: ['gatk','haplotypecaller','mutect2','variant calling','snp','indel','broad institute','bqsr','vqsr']
  },
  {
    id: 'what-is-bwa',
    category: 'Tools',
    q: 'What is BWA and when should I use BWA-MEM vs BWA-MEM2?',
    a: 'BWA (Burrows-Wheeler Aligner) aligns short reads to a large reference genome. <strong>BWA-MEM</strong> is the standard for reads >70 bp — handles paired-end, split-read, and chimeric alignments. <strong>BWA-MEM2</strong> is a performance-optimised version (3–4× faster using SIMD vectorisation) with identical output to BWA-MEM. Use BWA-MEM2 for production pipelines where speed matters (large cohorts, cloud computing). Alternative: <strong>bwa-mem2</strong> with AVX512 for maximum throughput on modern CPUs. For long reads (Oxford Nanopore or PacBio), use Minimap2 instead.',
    tags: ['bwa','bwa-mem','alignment','short reads','mapper','bwa-mem2','minimap2']
  },
  {
    id: 'what-is-star',
    category: 'Tools',
    q: 'What is STAR aligner and why is it used for RNA-seq?',
    a: 'STAR (Spliced Transcripts Alignment to a Reference) is the standard aligner for RNA-seq data. Unlike DNA aligners, STAR handles splice junctions — it splits reads that span exon-exon junctions and maps each segment independently. STAR requires a pre-built genome index (with genome + GTF annotation) using ~30 GB RAM for the human genome. Key parameters: --outSAMtype BAM SortedByCoordinate, --quantMode GeneCounts. STAR is also the aligner used by Cell Ranger for scRNA-seq. Alternative: HISAT2 (uses less memory, ~8 GB). STAR is faster but requires more RAM.',
    tags: ['star','aligner','rna-seq','splice junction','splicing','mrna','gtf','annotation']
  },
  {
    id: 'what-is-deseq2',
    category: 'Tools',
    q: 'What is DESeq2 and how does it find differentially expressed genes?',
    a: 'DESeq2 is the gold-standard R package for differential expression analysis from RNA-seq count data. It uses a negative binomial distribution to model count variability (overdispersion). Key steps: (1) size factor normalisation to account for sequencing depth differences; (2) shrinkage estimation of dispersions (variance); (3) Wald test or LRT for differential expression. Output: log2FoldChange, Wald statistic, p-value, and adjusted p-value (Benjamini-Hochberg FDR). Threshold: adjusted p < 0.05 and |log2FC| > 1 is standard. DESeq2 outperforms edgeR for small sample sizes (n=3) but both are recommended by ENCODE.',
    tags: ['deseq2','differential expression','rna-seq','negative binomial','fold change','fdr','edger','r package']
  },
  {
    id: 'what-is-seurat',
    category: 'Tools',
    q: 'What is Seurat and what does it do?',
    a: 'Seurat is the most widely used R package for single-cell RNA-seq analysis, developed by the Satija lab. Key steps in the Seurat pipeline: (1) Quality filtering (remove cells with very high mitochondrial reads or too few/many genes); (2) Normalisation (log-normalise or SCTransform); (3) Feature selection (highly variable genes); (4) PCA dimensionality reduction; (5) Nearest-neighbour graph construction; (6) Louvain/Leiden clustering; (7) UMAP/t-SNE visualisation; (8) Cluster marker identification (Wilcoxon rank-sum test); (9) Cell type annotation. Python alternative: Scanpy. Integration with datasets uses Harmony or RPCA.',
    tags: ['seurat','scrna-seq','single cell','clustering','umap','pca','harmony','cell annotation','scanpy']
  },
  {
    id: 'what-is-trimmomatic',
    category: 'Tools',
    q: 'When should I trim reads and which trimmer should I use?',
    a: 'Read trimming removes adapter sequences and low-quality bases before alignment. <strong>When to trim:</strong> Always for ATAC-seq and ChIP-seq; for RNA-seq and WGS, modern aligners (STAR, BWA-MEM) handle adapters reasonably well with soft-clipping, so trimming is optional unless FastQC shows severe adapter contamination (>10%). <strong>Trimmers:</strong> Trimmomatic (Java, ILLUMINACLIP mode for adapter removal); fastp (faster, C++, auto-detects adapters, generates HTML report); TrimGalore (wraps Cutadapt, easy to use for novices). After trimming, always re-run FastQC to verify.',
    tags: ['trimming','adapter','trimmomatic','fastp','trimgalore','cutadapt','fastqc','quality control','preprocessing']
  },
  {
    id: 'what-is-macs2',
    category: 'Tools',
    q: 'What is MACS2/MACS3 and how does it call peaks?',
    a: 'MACS2 (Model-based Analysis of ChIP-seq 2) is the standard peak caller for ChIP-seq and ATAC-seq. It models the tag distribution, removes duplicates, builds a local background model, and calls enriched regions (peaks) using a Poisson test. Key parameters: --gsize (effective genome size — hg38: 2.7e9); --nomodel --shift -100 --extsize 200 (for ATAC-seq nucleosome-free regions); -q 0.05 (FDR threshold). MACS3 (Python 3 rewrite) is faster and the recommended successor. IDR (Irreproducibility Discovery Rate) is used after MACS2 to select reproducible peaks across replicates.',
    tags: ['macs2','macs3','peak calling','chip-seq','atac-seq','idr','peaks','enrichment']
  },
  {
    id: 'what-is-kraken',
    category: 'Tools',
    q: 'What is Kraken2 and how does it classify metagenomics reads?',
    a: 'Kraken2 classifies metagenomic reads by exact k-mer matching against a genomic database. Each read\'s k-mers are looked up in a hash table of pre-computed genome assignments. The lowest common ancestor (LCA) algorithm resolves ambiguous matches. Kraken2 is extremely fast (millions of reads per minute) but requires a large database (8–80 GB RAM). Bracken (Bayesian Reestimation of Abundance with KrakEN) uses Kraken2 classifications to estimate species-level abundances. Standard databases: RefSeq (standard-8, standard-16 GB) or NCBI nt (80 GB, most comprehensive).',
    tags: ['kraken2','kraken','taxonomic classification','metagenomics','kmer','bracken','database','lca']
  },
  {
    id: 'what-is-annovar',
    category: 'Tools',
    q: 'How do I annotate variants after GATK? ANNOVAR vs VEP?',
    a: 'Both annotate VCF files with functional consequences, population frequencies, and clinical significance. <strong>ANNOVAR</strong> is faster, standalone (no web dependency), with a modular database system — good for custom pipelines. <strong>VEP</strong> (Variant Effect Predictor, Ensembl) produces more comprehensive output including regulatory effects, and is the standard for clinical reporting. Annotations include: gene/transcript consequence (synonymous, missense, stop-gain, splice), dbSNP rsID, gnomAD allele frequency, ClinVar classification, SIFT/PolyPhen-2 pathogenicity scores, and CADD deleteriousness score.',
    tags: ['annovar','vep','annotation','variant','snp','clinical','gnomad','clinvar','sift','polyphen','cadd']
  },
  {
    id: 'what-is-deepvariant',
    category: 'Tools',
    q: 'What is DeepVariant and how does it differ from GATK?',
    a: 'DeepVariant (Google) uses a deep convolutional neural network to call variants from BAM files. It converts pileup images around each candidate site into a visual representation and classifies them (hom-ref, het, hom-alt). DeepVariant consistently outperforms GATK HaplotypeCaller on benchmarks (PrecisionFDA Truth Challenges). However, it requires a GPU for reasonable speed, is a black box (hard to interpret), and has less flexibility for custom filtering. GATK remains preferred in clinical settings due to its transparency, established validation, and ACMG/FDA acceptance. Best practice: run both and compare.',
    tags: ['deepvariant','google','neural network','variant calling','gatk','benchmark','gpu']
  },
  {
    id: 'what-is-samtools',
    category: 'Tools',
    q: 'What is SAMtools used for?',
    a: 'SAMtools is the essential toolkit for manipulating SAM/BAM/CRAM alignment files. Key commands: <strong>samtools view</strong> (filter/convert); <strong>samtools sort</strong> (sort by coordinate or name); <strong>samtools index</strong> (create .bai index for random access); <strong>samtools flagstat</strong> (alignment statistics — total reads, mapped, paired, properly paired); <strong>samtools idxstats</strong> (reads per chromosome); <strong>samtools depth</strong> (per-base coverage); <strong>samtools mpileup</strong> (pileup for variant calling); <strong>samtools markdup</strong> (remove duplicates, alternative to Picard). Part of the htslib ecosystem alongside BCFtools (for VCF manipulation).',
    tags: ['samtools','bam','sam','cram','alignment','flagstat','sort','index','htslib']
  },
  {
    id: 'what-is-fastqc',
    category: 'Tools',
    q: 'What does FastQC check and how do I interpret it?',
    a: 'FastQC provides a quality report for raw FASTQ files across 11 modules. Key modules: <strong>Per-base sequence quality</strong>: Q30 across read length — should stay green (>28) for most positions; quality drops at read ends are normal. <strong>Per-sequence GC content</strong>: should follow a normal distribution around 50%; bimodal suggests contamination. <strong>Sequence duplication levels</strong>: high duplication in non-amplicon data suggests library complexity issues. <strong>Adapter content</strong>: any adapter signal means trimming is needed. <strong>Overrepresented sequences</strong>: common culprits — rRNA, adapter dimers. Failing modules don\'t always mean bad data — context matters.',
    tags: ['fastqc','fastq','quality control','adapter','duplication','gc content','overrepresented','raw data']
  },
  {
    id: 'what-is-multiqc',
    category: 'Tools',
    q: 'What is MultiQC?',
    a: 'MultiQC aggregates quality control reports from dozens of bioinformatics tools into a single HTML report — FastQC, STAR, featureCounts, Trimmomatic, Picard, SAMtools, and more. It searches a directory recursively for output files, parses them, and creates interactive plots comparing all samples side by side. This is essential for cohort-level QC to spot outlier samples. Run: <code>multiqc /path/to/results/</code>. Supports 150+ tools. Output: multiqc_report.html and multiqc_data/ directory with parsed tables.',
    tags: ['multiqc','quality report','fastqc','aggregation','cohort','qc report','html']
  },

  /* ── WORKFLOWS ─────────────────────────────────────────────── */
  {
    id: 'wgs-vs-wes',
    category: 'Genomics',
    q: 'Should I use WGS or WES for my project?',
    a: '<strong>Choose WGS when:</strong> you need structural variants (SVs), copy number variants (CNVs), or regulatory variants; studying non-coding disease mechanisms; building reference panels for GWAS imputation; pathogen/viral genomics (small genome). <strong>Choose WES when:</strong> Mendelian disease diagnosis (85% of pathogenic variants are coding); tight budget; large cohorts; diagnostic clinical lab (well-established bioinformatics pipelines). <strong>Key tradeoffs:</strong> WGS cost: ~$500–1,000/sample; WES: ~$100–300/sample. WES misses ~15% of OMIM disease genes with non-coding pathogenic variants. WGS enables better population stratification and polygenic risk scores.',
    tags: ['wgs','wes','exome','genome','comparison','structural variant','cost','mendelian','diagnostic']
  },
  {
    id: 'rnaseq-workflow',
    category: 'Transcriptomics',
    q: 'What is the standard RNA-seq analysis pipeline?',
    a: 'Standard RNA-seq pipeline: (1) <strong>QC</strong>: FastQC → MultiQC; (2) <strong>Trimming</strong> (if needed): fastp or Trimmomatic; (3) <strong>Alignment</strong>: STAR (splice-aware) → BAM file; (4) <strong>QC post-alignment</strong>: RSeQC or RNA-SeQC (read distribution, junction saturation, duplication); (5) <strong>Quantification</strong>: featureCounts or RSEM → count matrix; (6) <strong>Differential expression</strong>: DESeq2 or edgeR in R; (7) <strong>Downstream</strong>: GO enrichment (clusterProfiler), GSEA (fgsea), heatmaps (ComplexHeatmap), PCA. Salmon + tximeta is an increasingly popular alignment-free approach (3× faster, corrects for GC and positional bias).',
    tags: ['rna-seq','pipeline','star','deseq2','featurecounts','salmon','gsea','go enrichment','workflow']
  },
  {
    id: 'viral-wgs-workflow',
    category: 'Virology',
    q: 'How is SARS-CoV-2 / viral sequencing done?',
    a: 'Viral whole-genome sequencing for SARS-CoV-2 uses amplicon-based sequencing. The ARTIC protocol (v4.1 for SARS-CoV-2) uses 98 tiled PCR primer pairs to amplify the entire ~30 kb genome in two multiplex pools. Sequencing is done on Illumina MiSeq or Oxford Nanopore MinION (faster, portable). Analysis: (1) Primer trimming (iVar); (2) Alignment to reference (Wuhan-Hu-1, NC_045512.2); (3) Consensus generation (iVar or Medaka for Nanopore); (4) Lineage assignment (Pangolin); (5) Phylogenetic analysis (IQ-TREE + NextClade). Minimum depth: 20× per site; sites below threshold are masked with N.',
    tags: ['viral','sars-cov-2','covid','artic','amplicon','pangolin','lineage','nanopore','ivar','nextclade']
  },
  {
    id: 'cite-seq',
    category: 'Transcriptomics',
    q: 'What is CITE-seq?',
    a: 'CITE-seq (Cellular Indexing of Transcriptomes and Epitopes by Sequencing) simultaneously measures gene expression (RNA) and protein surface markers in single cells using antibody-derived tags (ADTs). Antibodies conjugated to oligonucleotide barcodes bind to cell surface proteins; these barcodes are captured and sequenced alongside the mRNA. This enables precise cell type identification combining transcriptomic and proteomic information — for example, distinguishing T cell subsets (CD4+CD8−CD45RA+) with protein markers while capturing the full transcriptome. Analysis uses Seurat\'s multimodal integration (WNN — weighted nearest neighbour) to jointly cluster RNA + protein data.',
    tags: ['cite-seq','multiomics','single cell','protein','adt','seurat','wnn','surface marker','cell typing']
  },
  {
    id: 'amplicon-seq',
    category: 'Genomics',
    q: 'What is amplicon sequencing and when should I use it?',
    a: 'Amplicon sequencing uses PCR amplification of specific regions followed by sequencing. It achieves very high depth (1,000–100,000×) at low cost for targeted regions. Applications: (1) <strong>Variant detection</strong>: somatic mutations at low allele frequencies (<1%); (2) <strong>SARS-CoV-2/pathogen surveillance</strong>: ARTIC protocol; (3) <strong>16S rRNA amplicon</strong>: microbiome profiling (V3-V4 region); (4) <strong>Pharmacogenomics</strong>: CYP450 gene variants affecting drug metabolism. The tradeoff: extremely targeted — only detects variants in amplified regions, no discovery of novel targets. Requires careful primer design to avoid primer dimers and off-target amplification.',
    tags: ['amplicon','targeted sequencing','16s','variant','somatic','high depth','pcr','primer']
  },

  /* ── DISEASES ──────────────────────────────────────────────── */
  {
    id: 'cancer-genomics',
    category: 'Diseases',
    q: 'How is omics used to study cancer?',
    a: 'Cancer genomics identifies somatic driver mutations, germline predisposition variants, and therapeutic targets. Key applications: (1) <strong>Tumour profiling (WGS/WES)</strong>: COSMIC cancer driver mutations, mutational signatures (SBS patterns), tumour mutational burden (TMB); (2) <strong>RNA-seq</strong>: gene expression subtypes (PAM50 for breast cancer), fusion gene detection (STAR-Fusion); (3) <strong>scRNA-seq</strong>: tumour microenvironment mapping; (4) <strong>Liquid biopsy (cfDNA)</strong>: circulating tumour DNA (ctDNA) for early detection and treatment monitoring; (5) <strong>Proteomics</strong>: phosphoproteomics reveals pathway activation not captured by RNA. Pan-cancer analyses (TCGA, ICGC) have catalogued driver genes across 33 cancer types.',
    tags: ['cancer','oncology','somatic','driver mutation','tmb','tcga','liquid biopsy','ctdna','tumour','fusion']
  },
  {
    id: 'infectious-disease',
    category: 'Diseases',
    q: 'How is genomics used for infectious disease surveillance?',
    a: 'Pathogen genomics enables real-time outbreak detection, transmission chain reconstruction, and antimicrobial resistance (AMR) surveillance. Workflow: sample → extraction → library prep → sequencing (Nanopore for speed, Illumina for accuracy) → assembly → typing → phylogeny. Key tools: Prokka (bacterial genome annotation), Roary (pan-genome analysis), Pathogenwatch (web-based Neisseria/Salmonella typing), ARIBA (AMR gene detection). For Africa: WHO GLASS (AMR surveillance), Africa CDC Pathogen Genomics Initiative (Africa PGI), and H3Africa Consortium support local sequencing capacity building.',
    tags: ['infectious disease','outbreak','amr','antimicrobial resistance','surveillance','pathogen','bacterial','phylogeny','africa cdc']
  },
  {
    id: 'malaria-genomics',
    category: 'Diseases',
    q: 'How is genomics applied to malaria research?',
    a: 'Plasmodium falciparum genomics tracks drug resistance mutations (e.g., PfKelch13 for artemisinin resistance, PfCRT for chloroquine resistance), maps parasite population structure, and identifies vaccine targets. The <strong>MalariaGEN</strong> consortium has sequenced >10,000 African parasite genomes. Key tools: mSPREAD (genome-wide selection scans), hmmIBD (identity-by-descent for relatedness), Pf3D7 reference genome (PlasmoDB). For vector control: Anopheles gambiae genomics (Ag1000G project) identifies insecticide resistance variants (vgsc, Rdl genes). WGS of field isolates needs careful handling of polyclonal infections (multiple parasite strains per patient).',
    tags: ['malaria','plasmodium','falciparum','drug resistance','artemisinin','malariagen','africa','vaccine','mosquito']
  },
  {
    id: 'tb-genomics',
    category: 'Diseases',
    q: 'How is genomics used for tuberculosis (TB) research?',
    a: 'Mycobacterium tuberculosis (Mtb) genomics enables rapid drug resistance prediction (replacing 6-week culture-based DST), transmission cluster identification, and lineage typing. The Mtb genome is 4.4 Mb with no horizontal gene transfer — highly clonal. Key mutations: rpoB (rifampicin), katG/inhA (isoniazid), gyrA (fluoroquinolones), rrs (aminoglycosides). Tools: Mykrobe, TB-Profiler (resistance prediction from WGS); Transmission Analysis Platform (TransPhylo). WHO released a catalogue of Mtb mutations graded by confidence for resistance prediction. Africa has the highest TB burden — H3ABioNet and KRISP (KwaZulu-Natal) lead African Mtb genomics.',
    tags: ['tb','tuberculosis','mycobacterium','drug resistance','mykrobe','tb-profiler','rifampicin','africa','lineage']
  },
  {
    id: 'hiv-genomics',
    category: 'Diseases',
    q: 'How is HIV genomics used in clinical and research settings?',
    a: 'HIV is an RNA retrovirus with an ~9.7 kb genome that integrates into the host genome (provirus). Genomics applications: (1) <strong>Drug resistance testing</strong>: Sanger or next-gen sequencing of HIV pol gene identifies resistance mutations to NRTIs, NNRTIs, PIs (Stanford HIVdb, Geno2Pheno); (2) <strong>Phylodynamics</strong>: reconstructing transmission networks for prevention (BEAST, IQ-TREE); (3) <strong>Reservoir characterisation</strong>: proviruses in latent reservoirs (intact vs defective genome by IPDA assay); (4) <strong>Vaccine design</strong>: Env diversity mapping, broadly neutralising antibody (bNAb) epitope conservation. SubtypeB dominates globally; subtype C is most prevalent in Africa (HVTN, CAPRISA). Key databases: Los Alamos HIV Database.',
    tags: ['hiv','retrovirus','drug resistance','hivdb','subtype','africa','phylodynamics','vaccine','reservoir','southern africa']
  },

  /* ── AFRICAN CONTEXT ──────────────────────────────────────── */
  {
    id: 'africa-genomics',
    category: 'African Context',
    q: 'Why is African genomics important?',
    a: 'Africa is the most genetically diverse continent — humans originated in Africa ~200,000 years ago, and African populations carry ~90% of human genetic variation. Yet Africans represent <3% of participants in published GWAS studies. Consequences: polygenic risk scores and pharmacogenomic guidelines calibrated on European populations perform poorly in African individuals. Key initiatives addressing this: <strong>H3Africa</strong> (Human Heredity and Health in Africa); <strong>AWI-Gen</strong> (African Wits-INDEPTH partnership for Genomic studies); <strong>Africa CDC Africa PGI</strong> (pathogen genomics); <strong>APCDR</strong> (African Population Cohort Described Reference); <strong>SAIGE</strong> (statistical method for African GWAS).',
    tags: ['africa','diversity','gwas','h3africa','inclusion','genetic diversity','polygenic','ancestry','african genomics']
  },
  {
    id: 'africa-research-gaps',
    category: 'African Context',
    q: 'What are the challenges of doing genomics research in Africa?',
    a: 'Key challenges: (1) <strong>Infrastructure</strong>: limited high-performance computing, unreliable power supply, slow internet for data transfer; cloud computing (AWS, Google Cloud, DNAnexus) is increasingly critical. (2) <strong>Cost</strong>: sequencing reagents are expensive; shipping samples overseas risks degradation. (3) <strong>Reference bias</strong>: standard reference genomes (GRCh38) don\'t capture African-specific structural variants and haplotypes — the <strong>African Pangenome Reference</strong> is being built. (4) <strong>Talent drain</strong>: trained bioinformaticians emigrate; local training programs (AIBST, H3ABioNet, EMBL-EBI training) are critical. (5) <strong>Ethical frameworks</strong>: data sovereignty, community consent, and biospecimen return policies.',
    tags: ['africa','challenges','infrastructure','hpc','cloud computing','reference genome','training','h3abionet','ethics','capacity']
  },
  {
    id: 'sickle-cell-genomics',
    category: 'African Context',
    q: 'How is genomics used for sickle cell disease research in Africa?',
    a: 'Sickle cell disease (SCD) is caused by the HbS mutation (rs334, p.Glu6Val in HBB). It affects ~300,000 newborns annually, 75% in Africa. Genomic approaches: (1) <strong>Newborn screening</strong>: HbS genotyping by Sanger, RFLP, or targeted NGS; (2) <strong>Modifier gene discovery</strong>: fetal haemoglobin (HbF) level is the key modifier — variants in BCL11A, HBS1L-MYB locus, and HBG2 promoter raise HbF and reduce severity; (3) <strong>Gene therapy</strong>: CRISPR reactivation of HbF (CTX001/exa-cel); (4) <strong>Malaria protection</strong>: HbAS heterozygotes (sickle trait) are partially protected against severe P. falciparum — balancing selection. The SickleInAfrica consortium leads African SCD genomics.',
    tags: ['sickle cell','scd','hbs','hbf','bcl11a','africa','crispr','gene therapy','sickle in africa','malaria protection']
  },
  {
    id: 'h3africa',
    category: 'African Context',
    q: 'What is H3Africa and what resources does it provide?',
    a: 'H3Africa (Human Heredity & Health in Africa) is a consortium funded by NIH and Wellcome Trust to build African genomics research capacity. It includes >40 projects across 30 African countries. Key resources: <strong>H3ABioNet</strong> (African bioinformatics network — provides training, analysis pipelines, and HPC access); <strong>H3Africa Biorepository Network</strong> (standardised biospecimen collection and storage); <strong>Africa Bioinformatics Network (ABioNET)</strong>. Ethical framework: developed the first African-specific genomics data governance policy addressing data sharing, community benefit, and biospecimen return. H3Africa has produced cohorts studying stroke, heart disease, kidney disease, schizophrenia, and infectious diseases across Africa.',
    tags: ['h3africa','h3abionet','africa','consortium','biorepository','nih','wellcome','bioinformatics','capacity building']
  },
  {
    id: 'pharmacogenomics-africa',
    category: 'African Context',
    q: 'Why does pharmacogenomics matter specifically for African populations?',
    a: 'Pharmacogenomics studies how genetic variation affects drug response. African populations have unique CYP450 variants that affect drug metabolism — many not captured in current FDA pharmacogenomic labels calibrated on European populations. Key examples: (1) <strong>CYP2B6*6/*18</strong>: very high frequency in African populations; affects efavirenz (HIV antiretroviral) metabolism — standard doses cause toxicity; (2) <strong>CYP2D6</strong>: "ultra-rapid metabolisers" are more common in some African ethnicities, affecting codeine/tramadol (opioid) efficacy; (3) <strong>G6PD variants</strong>: common in malaria-endemic regions, affects primaquine and rasburicase safety; (4) <strong>NAT2 slow acetylators</strong>: affects isoniazid (TB) toxicity risk. PharmGKB and CPIC guidelines are expanding African variant coverage.',
    tags: ['pharmacogenomics','cyp2b6','efavirenz','hiv','g6pd','nat2','drug metabolism','africa','cpic','pharmgkb']
  },

  /* ── DATABASES ─────────────────────────────────────────────── */
  {
    id: 'what-is-gnomad',
    category: 'Databases',
    q: 'What is gnomAD and how do I use it for variant interpretation?',
    a: 'gnomAD (Genome Aggregation Database, Broad Institute) aggregates WGS and WES data from >140,000 unrelated individuals across diverse ancestries. It is the primary resource for population allele frequencies — essential for distinguishing disease-causing variants (rare, MAF < 0.1%) from benign polymorphisms (common, MAF > 1%). Key uses: filtering out common variants in Mendelian disease analysis; assessing constraint metrics (pLI score for loss-of-function intolerance — pLI > 0.9 means the gene is highly constrained); Z-score for missense constraint. gnomAD v4 includes >800,000 exomes. Access: gnomad.broadinstitute.org or via API.',
    tags: ['gnomad','allele frequency','variant interpretation','benign','pathogenic','pli','constraint','broad','population']
  },
  {
    id: 'what-is-clinvar',
    category: 'Databases',
    q: 'What is ClinVar?',
    a: 'ClinVar (NCBI) is the primary public database of variants with clinical significance annotations — submitted by clinical labs, research groups, and expert panels. Classifications follow ACMG/AMP 5-tier system: Pathogenic, Likely Pathogenic, Uncertain Significance (VUS), Likely Benign, Benign. Key uses: (1) interpreting germline variants in diagnostic WES/WGS; (2) filtering variants for clinical reporting. Limitations: many variants are classified as VUS (uncertain significance) — 50–60% of clinically submitted variants. Reclassifications are common; always check submission date and number of submitters. Expert panels (ClinGen) provide gold-standard classifications.',
    tags: ['clinvar','pathogenic','benign','vus','acmg','clinical','diagnostic','ncbi','variant classification']
  },
  {
    id: 'what-is-cosmic',
    category: 'Databases',
    q: 'What is the COSMIC database?',
    a: 'COSMIC (Catalogue of Somatic Mutations in Cancer, Sanger Institute) is the largest expert-curated database of somatic cancer mutations. It includes: (1) cancer driver gene census (>750 genes); (2) mutational signatures (96 trinucleotide substitution patterns — SBS signatures); (3) drug resistance mutations; (4) cancer gene fusions; (5) CNV data. Key use: annotating somatic variants identified in tumour sequencing — identifying known cancer hotspots (KRAS G12C, EGFR L858R, BRAF V600E). COSMIC signatures reveal mutagenic processes: SBS4 = smoking, SBS6 = mismatch repair deficiency (microsatellite instability), SBS2/13 = APOBEC activity.',
    tags: ['cosmic','somatic','cancer','mutations','mutational signatures','sbs','driver gene','sanger','braf','kras']
  },
  {
    id: 'what-is-ensembl',
    category: 'Databases',
    q: 'What is Ensembl and when should I use it vs NCBI RefSeq?',
    a: 'Ensembl (EMBL-EBI/Sanger) provides genome assemblies, gene annotation, variation data, and comparative genomics for hundreds of species. Gene IDs use the ENSG format. <strong>Ensembl vs RefSeq:</strong> Ensembl uses automated GENCODE annotation + manual Havana curation; RefSeq (NCBI) is manually curated (NM_ transcripts) with stricter evidence requirements. Ensembl often has more transcripts (alternative isoforms); RefSeq has fewer but higher-confidence entries. For Africa: Ensembl contains African population variant data (1000 Genomes, gnomAD). Use Ensembl IDs for most bioinformatics tools (STAR, HISAT2, featureCounts); use RefSeq for clinical variant reporting.',
    tags: ['ensembl','ncbi','refseq','genome','annotation','gene id','isoform','gencode','transcript']
  },

  /* ── COMPUTING ─────────────────────────────────────────────── */
  {
    id: 'cloud-computing',
    category: 'Bioinformatics',
    q: 'How do I run genomics pipelines in the cloud?',
    a: 'Cloud computing enables scalable genomics without local HPC. Key platforms: <strong>AWS</strong>: S3 (data storage), EC2 (compute), Batch (job scheduling), and AWS HealthOmics (managed genomics workflows); <strong>Google Cloud Life Sciences / Batch</strong>: integrates with Terra (Broad Institute\'s cloud platform for GATK4/WDL workflows); <strong>DNAnexus</strong>: managed genomics platform used by UK Biobank; <strong>Nextflow</strong> workflow language can run locally, on SLURM HPC, or on cloud with Nextflow Tower/Seqera. For Africa: AWS, Google, and Microsoft offer research credits; H3ABioNet maintains regional HPC clusters in South Africa (CHPC) and Nigeria.',
    tags: ['cloud','aws','google cloud','terra','nextflow','workflow','hpc','snakemake','wdl','seqera']
  },
  {
    id: 'workflow-managers',
    category: 'Bioinformatics',
    q: 'What are Snakemake and Nextflow? When should I use each?',
    a: 'Both are workflow managers that automate multi-step bioinformatics pipelines with dependency resolution, parallel execution, and reproducibility. <strong>Snakemake</strong> (Python-based): Makefile-like syntax; excellent for local/HPC use; nfcore-equivalent community pipelines in Snakemake-Wrappers; better for Python developers. <strong>Nextflow</strong> (Groovy-based): DSL2 modular syntax; native cloud support; <strong>nf-core</strong> community (100+ validated pipelines for RNA-seq, WGS, ATAC-seq, etc.); preferred for large teams and cloud deployments. Rule of thumb: if deploying on nf-core pipelines or to cloud, use Nextflow. If building a custom local pipeline in Python, use Snakemake.',
    tags: ['snakemake','nextflow','workflow','pipeline','nfcore','reproducibility','automation','parallel']
  },
  {
    id: 'file-formats',
    category: 'Bioinformatics',
    q: 'What are the key genomics file formats I should know?',
    a: '<strong>FASTQ</strong>: raw reads with quality scores (4 lines per read). <strong>SAM/BAM/CRAM</strong>: aligned reads (SAM = text, BAM = binary compressed, CRAM = reference-compressed for storage). <strong>VCF/BCF</strong>: variant calls (CHROM, POS, REF, ALT, QUAL, FILTER, INFO, FORMAT columns). <strong>BED</strong>: genomic intervals (0-based, half-open coordinates). <strong>GTF/GFF3</strong>: gene annotation with features (gene, transcript, exon, CDS). <strong>FASTA</strong>: sequences for reference genomes or proteins. <strong>BigWig/bedGraph</strong>: continuous-valued genome tracks for ChIP-seq/ATAC-seq signal. <strong>HDF5/Loom/h5ad</strong>: single-cell matrices (Seurat saves as RDS; AnnData/Scanpy uses h5ad).',
    tags: ['fastq','bam','vcf','bed','gtf','fasta','bigwig','h5ad','file format','anndata']
  },
  {
    id: 'docker-containers',
    category: 'Bioinformatics',
    q: 'Why should I use Docker or Singularity for bioinformatics?',
    a: 'Containers package software with all its dependencies, ensuring reproducibility across machines. <strong>Docker</strong>: standard for local development and cloud (AWS/GCP). <strong>Singularity/Apptainer</strong>: preferred on shared HPC clusters (does not require root privileges, can run Docker images). Bioinformatics-specific container registries: <strong>BioContainers</strong> (automatic containers for all Bioconda tools); <strong>Quay.io</strong> (community containers). Benefits: exact software version tracking, no "it works on my machine" issues, and direct integration with Nextflow (-profile docker) and Snakemake (conda or container directives). Always pin to specific tool versions (e.g., biocontainers/samtools:1.17).',
    tags: ['docker','singularity','container','reproducibility','bioconda','biocontainers','hpc','apptainer']
  },

  /* ── ETHICS & CAREER ──────────────────────────────────────── */
  {
    id: 'data-sharing',
    category: 'Ethics & Career',
    q: 'What are the rules for sharing genomic data?',
    a: 'Genomic data from human subjects requires careful governance. Key repositories and access modes: <strong>dbGaP</strong> (controlled access, requires NIH data access committee approval); <strong>EGA</strong> (European Genome-phenome Archive, controlled access); <strong>SRA/ENA</strong> (open access for non-sensitive data). GDPR applies to European participants. For African data: H3Africa Data Access Committee governs consortium data with specific community benefit requirements. Sensitive data (WGS can re-identify individuals even without names) should never be placed in open repositories. FAIR data principles (Findable, Accessible, Interoperable, Reusable) guide good data management.',
    tags: ['data sharing','dbgap','ega','sra','gdpr','h3africa','consent','fair data','ethics','re-identification']
  },
  {
    id: 'how-to-learn-bioinformatics',
    category: 'Ethics & Career',
    q: 'How do I learn bioinformatics? Best resources?',
    a: 'Recommended learning path: (1) <strong>Linux/command line</strong>: Software Carpentry "The Unix Shell" (free); (2) <strong>Python</strong>: Rosalind (bioinformatics problem sets, free at rosalind.info); (3) <strong>R for bioinformatics</strong>: Bioconductor workflows; (4) <strong>Specific tools</strong>: Galaxy Training Network (GTN) — browser-based, no installation; (5) <strong>Structured courses</strong>: Bioinformatics Specialisation on Coursera (UC San Diego); H3ABioNet online courses (African focus, free); EMBL-EBI training; Harvard Chan Bioinformatics Core. For African students: AIBST, KEMRI Wellcome Trust BGVG course, and the African Bioinformatics Network (ABioNET). Practice on publicly available datasets (GEO, SRA, TCGA).',
    tags: ['learn','bioinformatics','training','linux','python','r','coursera','h3abionet','embl-ebi','career','africa']
  }
];

/* ─── Q&A Engine ─── */
OmicsLab.QAEngine = (function() {

  const SUGGESTED = [
    'What is RIN score?',
    'How does GATK call variants?',
    'What is Q30 score?',
    'WGS or WES — which should I use?',
    'What is ATAC-seq?',
    'How do I analyse RNA-seq data?',
    'What is gnomAD?',
    'Why is African genomics important?',
    'What is FRiP score?',
    'How does scRNA-seq work?',
  ];

  let _activeCat = 'All';
  let _debounceTimer = null;

  function _score(pair, terms) {
    let score = 0;
    const text = (pair.q + ' ' + pair.a + ' ' + pair.tags.join(' ')).toLowerCase();
    terms.forEach(t => {
      if (pair.q.toLowerCase().includes(t)) score += 4;
      else if (pair.tags.some(tag => tag.includes(t))) score += 3;
      else if (text.includes(t)) score += 1;
    });
    return score;
  }

  function _poolForCat() {
    return _activeCat === 'All'
      ? OmicsLab.QA_DATA
      : OmicsLab.QA_DATA.filter(p => p.category === _activeCat);
  }

  function search(query) {
    clearTimeout(_debounceTimer);
    _debounceTimer = setTimeout(() => _doSearch(query), 180);
    const btn = document.getElementById('qa-clear-btn');
    if (btn) btn.style.display = query.trim() ? 'flex' : 'none';
  }

  function _doSearch(query) {
    const resultsEl = document.getElementById('qa-results');
    const suggestEl = document.getElementById('qa-suggestions');
    if (!resultsEl) return;

    const q = query.trim().toLowerCase();
    if (!q) {
      resultsEl.innerHTML = '';
      if (suggestEl) suggestEl.style.display = 'flex';
      return;
    }
    if (suggestEl) suggestEl.style.display = 'none';

    const terms = q.split(/\s+/).filter(t => t.length > 1);
    const pool  = _poolForCat();
    const scored = pool.map(p => ({ p, s: _score(p, terms) })).filter(x => x.s > 0);
    scored.sort((a, b) => b.s - a.s);
    const top = scored.slice(0, 6).map(x => x.p);

    if (!top.length) {
      resultsEl.innerHTML = `
        <div class="qa-no-results">
          <div class="qa-nr-icon">${OmicsLab.Icons.svg('search', 28)}</div>
          <div class="qa-nr-title">No results for "${_esc(query)}"</div>
          <div class="qa-nr-hint">Try: RIN, Q30, GATK, ATAC-seq, Africa, gnomAD…</div>
        </div>`;
      return;
    }

    resultsEl.innerHTML = top.map(p => _card(p, terms)).join('');
  }

  function _card(p, highlightTerms) {
    const catColor = _catColor(p.category);
    return `<div class="qa-card">
      <div class="qa-card-head">
        <span class="qa-cat-pill" style="background:${catColor}22;color:${catColor};border:1px solid ${catColor}44">${p.category}</span>
        <span class="qa-q-text">${_highlight(p.q, highlightTerms || [])}</span>
      </div>
      <div class="qa-a-text">${p.a}</div>
    </div>`;
  }

  function _highlight(text, terms) {
    if (!terms.length) return text;
    const re = new RegExp('(' + terms.map(_escRe).join('|') + ')', 'gi');
    return text.replace(re, '<mark class="qa-highlight">$1</mark>');
  }

  function _esc(s) { return s.replace(/[<>&"]/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c])); }
  function _escRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

  function _catColor(cat) {
    return {
      'Basics':          '#A8A098',
      'Genomics':        '#58a6ff',
      'Transcriptomics': '#00C4A0',
      'Epigenomics':     '#d2a8ff',
      'Metagenomics':    '#ffa657',
      'Proteomics':      '#79c0ff',
      'Metabolomics':    '#f78166',
      'Virology':        '#ff7b72',
      'QC Metrics':      '#e3b341',
      'Tools':           '#58a6ff',
      'Workflows':       '#00C4A0',
      'Diseases':        '#f78166',
      'Databases':       '#d2a8ff',
      'Bioinformatics':  '#ffa657',
      'African Context': '#00C4A0',
      'Ethics & Career': '#A8A098',
    }[cat] || '#A8A098';
  }

  function clear() {
    const input = document.getElementById('qa-input');
    const results = document.getElementById('qa-results');
    const suggestEl = document.getElementById('qa-suggestions');
    if (input) { input.value = ''; input.focus(); }
    if (results) results.innerHTML = '';
    if (suggestEl) suggestEl.style.display = 'flex';
    const btn = document.getElementById('qa-clear-btn');
    if (btn) btn.style.display = 'none';
  }

  function selectSuggestion(text) {
    const input = document.getElementById('qa-input');
    if (input) { input.value = text; input.focus(); }
    _doSearch(text);
    const suggestEl = document.getElementById('qa-suggestions');
    if (suggestEl) suggestEl.style.display = 'none';
    const btn = document.getElementById('qa-clear-btn');
    if (btn) btn.style.display = 'flex';
  }

  function _setCategory(cat, btn) {
    _activeCat = cat;
    document.querySelectorAll('.qa-cat-tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    const input = document.getElementById('qa-input');
    if (input && input.value.trim()) _doSearch(input.value);
  }

  function init() {
    const catTabsEl = document.getElementById('qa-cat-tabs');
    const suggestEl = document.getElementById('qa-suggestions');

    if (catTabsEl) {
      const cats = ['All', ...new Set(OmicsLab.QA_DATA.map(p => p.category))];
      catTabsEl.innerHTML = cats.map((cat, i) =>
        `<button class="qa-cat-tab ${i===0?'active':''}" onclick="OmicsLab.QAEngine._setCategory('${cat}',this)">${cat}</button>`
      ).join('');
    }

    if (suggestEl) {
      suggestEl.innerHTML = SUGGESTED.map(q =>
        `<button class="qa-suggest-chip" onclick="OmicsLab.QAEngine.selectSuggestion(${JSON.stringify(q)})">${q}</button>`
      ).join('');
    }
  }

  return { search, clear, selectSuggestion, _setCategory, init };
})();
