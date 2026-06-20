/* ═══════════════════════════════════════════════════════════════
   OmicsLab — Offline AI Mentor (Prompt 5)
   Chat-style interface over 300+ pre-written expert answers.
   Zero API calls — fully offline. Smart keyword scoring + follow-ups.
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

/* ─── Extended Q&A data (~250 new entries) ─── */
OmicsLab.MENTOR_DATA = [

  /* ── TOOLS ──────────────────────────────────────────────────── */
  { id:'bwa','category':'Tools',q:'What is BWA-MEM and when should I use it?',
    a:'BWA-MEM (Burrows-Wheeler Aligner) is the standard read aligner for Illumina reads ≥70 bp. Use BWA-MEM for DNA-seq, WGS, and WES. For very short reads (<70 bp) use BWA-backtrack. BWA-MEM2 is a 3× faster drop-in replacement — use it on large genomes.',
    tags:['bwa','bwa-mem','alignment','dna-seq','wgs']},
  { id:'star-aligner','category':'Tools',q:'When should I use STAR instead of BWA?',
    a:'STAR is designed for RNA-seq alignment because it handles splice junctions — reads that span exon-exon boundaries. BWA is for DNA, STAR is for RNA. STAR requires 30–50 GB RAM for the human genome index. Hisat2 is an alternative if RAM is limited.',
    tags:['star','rna-seq','splicing','alignment','hisat2']},
  { id:'samtools','category':'Tools',q:'What does samtools do?',
    a:'Samtools is a suite for manipulating SAM/BAM alignment files. Key commands: <code>sort</code> (sort by coordinate), <code>index</code> (create .bai index), <code>flagstat</code> (alignment stats), <code>view</code> (filter/convert), <code>depth</code> (per-base coverage), <code>mpileup</code> (pileup for variant calling).',
    tags:['samtools','bam','sam','alignment','sort','index']},
  { id:'gatk-haplotype','category':'Tools',q:'What is GATK HaplotypeCaller?',
    a:'HaplotypeCaller is GATK\'s variant caller for SNPs and indels in germline samples. It uses a local de novo assembly step (unlike older callers) making it more accurate in complex regions. For cohort variant calling use GVCF mode → GenomicsDBImport → GenotypeGVCFs.',
    tags:['gatk','haplotypecaller','snp','indel','variant calling','germline']},
  { id:'deepvariant','category':'Tools',q:'What is DeepVariant and how does it compare to GATK?',
    a:'DeepVariant is a Google AI variant caller that reformulates SNP/indel detection as an image classification problem using a convolutional neural network. It often outperforms GATK on precision metrics, especially on ONT long reads. Computationally heavier than GATK but available free on Terra/Google Cloud.',
    tags:['deepvariant','variant calling','deep learning','cnn','google','nanopore']},
  { id:'deseq2','category':'Tools',q:'How does DESeq2 normalise RNA-seq counts?',
    a:'DESeq2 uses the median of ratios method: for each sample it calculates the geometric mean count across all genes, then the sample\'s size factor is the median of all per-gene ratios. This handles outlier genes better than total-count normalisation. VST or rlog transforms are used for visualisation and unsupervised clustering.',
    tags:['deseq2','normalisation','rna-seq','size factor','counts','differential expression']},
  { id:'edger','category':'Tools',q:'When should I use edgeR instead of DESeq2?',
    a:'Both are excellent for bulk RNA-seq differential expression. Use edgeR when you have very few replicates (n=2), as it uses the quasi-likelihood F-test which is more conservative. DESeq2 is generally preferred for ≥3 replicates. For very large sample sizes (n>50), limma-voom is fastest.',
    tags:['edger','deseq2','limma','rna-seq','differential expression','replicates']},
  { id:'trimmomatic','category':'Tools',q:'What does Trimmomatic do?',
    a:'Trimmomatic removes adapter sequences and low-quality bases from Illumina FASTQ reads. Key parameters: LEADING/TRAILING (minimum base quality at ends), SLIDINGWINDOW (scan quality), MINLEN (drop short reads). Fastp is a modern faster alternative with HTML QC reports.',
    tags:['trimmomatic','fastp','adapter','trimming','quality','fastq']},
  { id:'fastqc','category':'Tools',q:'What QC metrics does FastQC report?',
    a:'FastQC reports: per-base sequence quality, per-base N content, sequence length distribution, GC content distribution, overrepresented sequences (adapter contamination), duplication levels, and K-mer content. Fail flags are warnings — context matters. Always look at adapter content and per-base quality.',
    tags:['fastqc','qc','quality','adapter','gc','n-content','per-base']},
  { id:'multiqc','category':'Tools',q:'What is MultiQC?',
    a:'MultiQC aggregates QC reports from many samples and tools (FastQC, Trimmomatic, STAR, samtools, Picard, featureCounts) into a single interactive HTML report. Essential for comparing QC across large cohorts. Run: <code>multiqc .</code> in the directory containing your QC output files.',
    tags:['multiqc','qc','aggregation','report','html','cohort']},
  { id:'picard','category':'Tools',q:'What is Picard MarkDuplicates?',
    a:'Picard MarkDuplicates identifies PCR/optical duplicates in SAM/BAM files — reads with identical start positions. It marks (or removes) them so variant callers don\'t double-count. Duplicates are expected: WGS germline ~5–15%, amplicon panels can be 60–80%. Always mark; only remove for low-coverage samples.',
    tags:['picard','duplicates','mark duplicates','pcr','optical duplicates']},
  { id:'snakemake','category':'Tools',q:'What is Snakemake and why use it for bioinformatics?',
    a:'Snakemake is a Python-based workflow manager that defines pipelines as rules with inputs, outputs, and shell commands. It automatically determines execution order, reruns only steps where inputs changed, and scales to HPC clusters. Nextflow is an alternative with better cloud-native support.',
    tags:['snakemake','nextflow','workflow','pipeline','hpc','automation']},
  { id:'nextflow','category':'Tools',q:'What is the difference between Snakemake and Nextflow?',
    a:'Snakemake: Python-based, rule-driven, excellent for local and SLURM HPC. Nextflow: Groovy/DSL2-based, process-driven, excellent for AWS/Google Cloud, has nf-core community pipelines. nf-core is a key advantage of Nextflow — hundreds of validated pipelines ready to use.',
    tags:['nextflow','snakemake','nf-core','cloud','hpc','workflow']},
  { id:'conda','category':'Tools',q:'What is Conda and why do bioinformaticians use it?',
    a:'Conda is a cross-platform package and environment manager. It solves dependency conflicts by isolating environments — each tool gets its own Python/library versions. Use <code>conda create -n myenv</code> to create environments. Bioconda is the channel with 8,000+ bioinformatics tools.',
    tags:['conda','bioconda','environment','dependencies','python','tools']},
  { id:'docker','category':'Tools',q:'What is Docker and why is it useful for reproducibility?',
    a:'Docker packages software and all its dependencies into a container — a lightweight virtual machine. A container runs identically on any OS. In bioinformatics, Docker ensures your pipeline works the same on your laptop, on HPC, and in five years. Singularity is Docker\'s HPC equivalent (no root required).',
    tags:['docker','singularity','container','reproducibility','hpc']},
  { id:'igv','category':'Tools',q:'What is IGV and how do I use it?',
    a:'IGV (Integrative Genomics Viewer) is a desktop app for visually inspecting aligned reads in BAM files and variants in VCF files. Load a reference genome, then drag a BAM or VCF file. Navigate to a variant of interest to see the supporting reads. Essential for manual variant validation.',
    tags:['igv','visualisation','bam','vcf','variant','reads','browser']},
  { id:'vep','category':'Tools',q:'What does VEP (Variant Effect Predictor) do?',
    a:'Ensembl VEP annotates VCF variants with: gene, transcript, consequence (missense, nonsense, splice-site), SIFT/PolyPhen pathogenicity predictions, ClinVar clinical significance, dbSNP/gnomAD frequencies, and regulatory context. Use VEP via the Ensembl web server or command-line for large datasets.',
    tags:['vep','annotation','variant','missense','sift','polyphen','clinvar','ensembl']},
  { id:'annovar','category':'Tools',q:'How is ANNOVAR different from VEP?',
    a:'Both annotate variants but differ in philosophy: VEP uses Ensembl databases and is transcript-centric; ANNOVAR is database-centric with flexible input of custom annotation databases. ANNOVAR is faster for very large VCFs and easier to add custom databases. VEP is preferred for clinical reporting.',
    tags:['annovar','vep','annotation','vcf','databases','clinical']},
  { id:'bcftools','category':'Tools',q:'What can BCFtools do with VCF files?',
    a:'BCFtools is to VCF what samtools is to BAM. Key uses: <code>bcftools view</code> (filter variants), <code>bcftools stats</code> (QC), <code>bcftools merge</code> (merge cohort VCFs), <code>bcftools filter</code> (apply FILTER tags), <code>bcftools annotate</code> (add INFO fields). Faster than GATK SelectVariants for simple operations.',
    tags:['bcftools','vcf','filter','merge','stats','tools']},
  { id:'plink','category':'Tools',q:'What is PLINK used for?',
    a:'PLINK is the standard tool for GWAS analysis of large-scale genetic data. It performs: quality control (HWE, missingness, MAF filters), principal components analysis (PCA), association testing (logistic/linear regression), and LD pruning. PLINK 2.0 is 10-100× faster for large cohorts.',
    tags:['plink','gwas','population genetics','pca','association','snp array','qc']},
  { id:'gcta','category':'Tools',q:'What does GCTA do?',
    a:'GCTA (Genome-wide Complex Trait Analysis) estimates heritability from GWAS data using GREML (genome-based restricted maximum likelihood), performs bivariate genetic correlation, COJO conditional analysis, and SNP-based heritability partitioning. Used extensively in H3Africa GWAS studies.',
    tags:['gcta','heritability','greml','gwas','genetic correlation']},
  { id:'kraken2','category':'Tools',q:'What is Kraken2 and how does it work?',
    a:'Kraken2 performs taxonomic classification of metagenomic reads by exact k-mer matching against a reference database. It is extremely fast (~2–5 million reads/min) but requires a large database (60–100 GB for Standard). Use Bracken for abundance re-estimation after Kraken2 classification.',
    tags:['kraken2','metagenomics','taxonomy','k-mer','bracken','classification']},
  { id:'kaiju','category':'Tools',q:'What is Kaiju and when should I use it instead of Kraken2?',
    a:'Kaiju does protein-level (translated) taxonomic classification — better for classifying reads from novel organisms with low nucleotide identity to known genomes. Use Kaiju when Kraken2 misses many reads (low classification rate <30%), especially for environmental or deep-sea metagenomes.',
    tags:['kaiju','metagenomics','taxonomy','protein','translated','novel organisms']},
  { id:'seurat','category':'Tools',q:'What is Seurat and what can it do?',
    a:'Seurat is the R package standard for single-cell RNA-seq analysis. It handles: data normalisation (SCTransform), dimensionality reduction (PCA, UMAP), clustering (Louvain/Leiden), differential gene expression between clusters, cell-type annotation, and integration of multiple datasets (Seurat v5 / harmony).',
    tags:['seurat','single cell','scRNA-seq','umap','clustering','integration']},
  { id:'scanpy','category':'Tools',q:'What is the difference between Seurat and Scanpy?',
    a:'Seurat is R-based; Scanpy is Python-based. Both do the same core analyses. Scanpy is faster for very large datasets (>1M cells) using AnnData sparse matrices. Seurat has more mature spatial transcriptomics tools. If your team is Python-first use Scanpy; if R-first use Seurat.',
    tags:['scanpy','seurat','python','r','single cell','anndata']},
  { id:'iqtree','category':'Tools',q:'What is IQ-TREE and what is it used for?',
    a:'IQ-TREE is a maximum-likelihood phylogenetic tree inference tool. Given a multiple sequence alignment, it finds the best-fit substitution model (ModelFinder), builds the ML tree, and computes bootstrap support values. Standard for pathogen phylogenomics — faster and more accurate than RAxML on most datasets.',
    tags:['iqtree','phylogenetics','maximum likelihood','bootstrap','substitution model']},
  { id:'beast','category':'Tools',q:'What is BEAST and what does it do?',
    a:'BEAST (Bayesian Evolutionary Analysis Sampling Trees) infers time-calibrated phylogenies (molecular clocks) using Bayesian MCMC sampling. It estimates divergence dates and evolutionary rates. Used in outbreak genomics to date SARS-CoV-2 introductions and TB transmission events. Requires MCMCtree or Tracer for convergence assessment.',
    tags:['beast','bayesian','phylogenetics','molecular clock','mcmc','divergence time']},
  { id:'nextstrain','category':'Tools',q:'What is Nextstrain?',
    a:'Nextstrain is a real-time genomic epidemiology platform that builds time-resolved phylogeographic trees and displays them interactively in the browser. It runs Augur (analysis pipeline) + Auspice (visualisation). Widely used for SARS-CoV-2, influenza, and Ebola outbreak surveillance.',
    tags:['nextstrain','phylogeography','augur','auspice','epidemiology','outbreak','sars-cov-2']},
  { id:'nf-core','category':'Tools',q:'What is nf-core?',
    a:'nf-core is a community effort maintaining validated, containerised Nextflow pipelines for common bioinformatics tasks. Key pipelines: nf-core/rnaseq, nf-core/sarek (WGS/WES somatic+germline), nf-core/viralrecon (pathogen sequencing), nf-core/ampliseq (16S metagenomics). All are peer-reviewed and follow FAIR principles.',
    tags:['nf-core','nextflow','pipeline','rnaseq','sarek','viralrecon','community']},
  { id:'macs2','category':'Tools',q:'What is MACS2 and when is it used?',
    a:'MACS2 is a peak caller for ChIP-seq and ATAC-seq data. It identifies enriched genomic regions (peaks) by comparing immunoprecipitated reads to a control (input or IgG). For ATAC-seq use <code>--nomodel --extsize 200</code> mode. MACS3 is the latest version with improved FDR control.',
    tags:['macs2','chip-seq','atac-seq','peaks','peak calling','enrichment']},
  { id:'hisat2','category':'Tools',q:'What is HISAT2?',
    a:'HISAT2 is a splice-aware RNA-seq aligner using a graph-based Hierarchical Indexing for Spliced Alignment of Transcripts. It uses 4–8 GB RAM (vs 30–50 GB for STAR), making it practical on smaller machines. Slightly lower sensitivity than STAR but much more memory-efficient.',
    tags:['hisat2','rna-seq','alignment','splice','memory','transcript']},
  { id:'featurecounts','category':'Tools',q:'What does featureCounts do?',
    a:'featureCounts (part of Subread) counts how many reads overlap each feature (gene, exon, transcript) in a BAM file using a GTF annotation file. Output: a count matrix (samples × genes). Key parameters: stranded (0=unstranded, 1=sense, 2=antisense) — strand must match your library prep protocol.',
    tags:['featurecounts','subread','counts','rna-seq','gtf','count matrix','stranded']},

  /* ── STATISTICS & METHODS ────────────────────────────────── */
  { id:'p-value','category':'Statistics',q:'What is a p-value in genomics?',
    a:'A p-value is the probability of observing a result as extreme as the data under the null hypothesis. In GWAS, typical significance threshold is p < 5×10⁻⁸ (Bonferroni-corrected for ~1M tests). In RNA-seq, the threshold after FDR correction is usually q < 0.05. Low p-value alone is not enough — always check effect size.',
    tags:['p-value','statistics','significance','bonferroni','fdr','gwas','rna-seq']},
  { id:'fdr','category':'Statistics',q:'What is FDR correction and how does it differ from Bonferroni?',
    a:'FDR (False Discovery Rate) controls the expected proportion of false positives among all significant results. Benjamini-Hochberg is the standard method, giving q-values. Bonferroni is far more conservative — it controls the probability of any false positive. Use FDR for RNA-seq (many correlated tests); Bonferroni for GWAS where independent hits are critical.',
    tags:['fdr','bonferroni','multiple testing','q-value','benjamini-hochberg','statistics']},
  { id:'pca','category':'Statistics',q:'Why do we use PCA in genomics?',
    a:'PCA (Principal Components Analysis) reduces high-dimensional genomic data to 2–3 axes capturing maximum variance. In GWAS it corrects for population stratification — PC1 and PC2 often separate African, European, and Asian populations. In RNA-seq, PCA reveals batch effects, outliers, and treatment group separation before analysis.',
    tags:['pca','principal components','population stratification','batch effects','gwas','rna-seq']},
  { id:'umap','category':'Statistics',q:'What is UMAP and how does it differ from PCA in single-cell?',
    a:'UMAP (Uniform Manifold Approximation and Projection) is a non-linear dimensionality reduction method that preserves local neighbourhood structure better than PCA. In scRNA-seq, UMAP reveals distinct cell clusters that PCA would blend together. Run PCA first (50 PCs), then UMAP on top of the PCA embedding.',
    tags:['umap','tsne','pca','single cell','dimensionality reduction','clustering']},
  { id:'batch-effects','category':'Statistics',q:'What are batch effects and how do I correct for them?',
    a:'Batch effects are technical variations between samples processed at different times, in different labs, or with different reagents. In RNA-seq: Combat-Seq (before DE analysis) or include batch as a covariate in DESeq2 design. In scRNA-seq: Harmony, Seurat Integration, or scVI. In GWAS: PCA and mixed models (SAIGE, BOLT-LMM) correct for population structure.',
    tags:['batch effects','combat','harmony','rna-seq','single cell','gwas','correction']},
  { id:'logfc','category':'Statistics',q:'What is log fold change (logFC) in RNA-seq?',
    a:'Log fold change measures the magnitude of expression change between conditions: log₂(condition A / condition B). logFC = 1 means 2-fold upregulation; logFC = −1 means 2-fold downregulation. The typical filter is |logFC| > 1 AND FDR < 0.05 to call a gene differentially expressed.',
    tags:['logfc','fold change','differential expression','rna-seq','upreg','downreg']},
  { id:'hwe','category':'Statistics',q:'What is Hardy-Weinberg Equilibrium in GWAS QC?',
    a:'HWE states that allele frequencies remain constant across generations in a randomly mating population. Severe HWE deviation (p < 10⁻⁶) in a control sample suggests genotyping errors, not biology. In PLINK use --hwe 1e-6 to filter failing variants. Do NOT apply HWE filtering to cases — disease association can break HWE.',
    tags:['hwe','hardy-weinberg','gwas','qc','plink','genotyping','allele frequency']},
  { id:'maf','category':'Statistics',q:'What is Minor Allele Frequency (MAF) and why does it matter?',
    a:'MAF is the frequency of the less common allele in a population. Low-MAF variants (<1%) are rare and have insufficient statistical power in standard GWAS unless sample sizes are very large. PLINK filters out variants below a MAF threshold (--maf 0.01) to reduce noise. African genomes have more rare variants than European cohorts.',
    tags:['maf','minor allele frequency','gwas','rare variants','population genetics','plink']},
  { id:'ld','category':'Statistics',q:'What is Linkage Disequilibrium (LD)?',
    a:'LD is the non-random association of alleles at different loci — variants inherited together more often than expected by chance. In African populations LD blocks are shorter (more recombination events over longer evolutionary time), so GWAS fine-mapping is naturally sharper. LD pruning (PLINK --indep-pairwise) is used before PCA to avoid biasing toward high-LD regions.',
    tags:['ld','linkage disequilibrium','gwas','fine mapping','population genetics','african']},
  { id:'imputation','category':'Statistics',q:'What is genotype imputation?',
    a:'Imputation predicts un-genotyped variants using a reference panel of fully sequenced individuals. Genotype arrays assay ~1M SNPs; imputation extrapolates to 10–80M variants using population LD patterns. For African GWAS use the H3Africa reference panel or AWI-Gen panel — European panels miss African-specific variants.',
    tags:['imputation','reference panel','h3africa','gwas','snp array','missing variants']},
  { id:'gwas-caveat','category':'Statistics',q:'What are the key limitations of GWAS studies in Africa?',
    a:'Most GWAS loci were discovered in European cohorts and have reduced portability to African populations due to LD differences, allele frequency differences, and lack of African reference panels for imputation. The H3Africa GWAS initiative, AWI-Gen, and Wits cohorts are addressing this. Polygenic risk scores (PRS) built on European data systematically underperform in African individuals.',
    tags:['gwas','africa','transferability','prs','polygenic risk score','european bias']},
  { id:'volcano','category':'Statistics',q:'What is a volcano plot and what does it show?',
    a:'A volcano plot displays differential expression results: x-axis = log₂FC, y-axis = −log₁₀(p-value or FDR). Genes in the upper-left are significantly downregulated; upper-right are significantly upregulated. Points above a horizontal FDR threshold line and beyond a vertical |logFC| threshold are called significant.',
    tags:['volcano','plot','differential expression','rna-seq','visualisation','log2fc']},
  { id:'coverage','category':'Statistics',q:'What sequencing depth (coverage) do I need?',
    a:'WGS germline: 30× minimum, 50× recommended. WGS tumour: 100× (30-50× normal). WES: 100× minimum. RNA-seq (differential expression): 20–30M read pairs. RNA-seq (rare isoforms): 50–100M read pairs. scRNA-seq: 2,000–5,000 reads/cell (50k–200k cells = 100M–1B reads total).',
    tags:['coverage','sequencing depth','wgs','rna-seq','exome','single cell','cost']},

  /* ── AFRICAN GENOMICS ──────────────────────────────────── */
  { id:'h3africa','category':'African Genomics',q:'What is H3Africa?',
    a:'H3Africa (Human Heredity and Health in Africa) is an NIH/Wellcome funded consortium enabling genomic research in Africa. It has genotyped 50,000+ Africans, established biobanks in 18 countries, developed the H3Africa SNP array (tailored for African allele frequencies), and created data governance frameworks for responsible African genomic data sharing.',
    tags:['h3africa','consortium','nih','wellcome','biobank','african array','governance']},
  { id:'h3abionet','category':'African Genomics',q:'What does H3ABioNet do?',
    a:'H3ABioNet is the bioinformatics network of H3Africa. It provides training (the IBT bioinformatics course, workshops), supports 27 African institutions with infrastructure and analysis support, develops African-specific bioinformatics tools, and hosts the H3Africa Data Archive. Critical for building African bioinformatics capacity.',
    tags:['h3abionet','h3africa','training','bioinformatics','capacity building','ibt','africa']},
  { id:'awigen','category':'African Genomics',q:'What is AWI-Gen?',
    a:'AWI-Gen (Africa Wits-INDEPTH Partnership for Genomic Studies) is a multi-site GWAS of 12,000+ adults from Ghana, Burkina Faso, Kenya, and South Africa. It studies cardiometabolic risk factors (hypertension, type 2 diabetes, HIV-associated metabolic disease) in African urban/rural populations. It has produced a dense African reference panel.',
    tags:['awigen','gwas','ghana','kenya','south africa','cardiometabolic','reference panel']},
  { id:'africa-cdc','category':'African Genomics',q:'What is the Africa CDC Pathogen Genomics Initiative (Africa PGI)?',
    a:'Africa PGI is Africa CDC\'s programme to build continent-wide genomic surveillance capacity. It has trained 2,500+ health workers in pathogen sequencing, established genomics laboratories in 40+ African countries, and created SARS-CoV-2, mpox, and AMR surveillance networks. The goal is 50 sentinel surveillance laboratories across all 55 AU member states.',
    tags:['africa cdc','pgi','pathogen genomics','surveillance','sars-cov-2','mpox','capacity']},
  { id:'rislnet','category':'African Genomics',q:'What is RISLNET?',
    a:'RISLNET (Respiratory Illness Surveillance Linked to Novel Technology Network) is Africa CDC\'s network for respiratory pathogen genomic surveillance. It links national reference labs and academic centres to detect and characterise novel respiratory pathogens (influenza, SARS-CoV-2, RSV, MPV) using WGS and bioinformatics.',
    tags:['rislnet','africa cdc','respiratory','surveillance','influenza','sars-cov-2']},
  { id:'apcdr','category':'African Genomics',q:'What is APCDR?',
    a:'APCDR (African Population and Clinical Research Database) is a biobank and data infrastructure based at the Wellcome Sanger Institute with operations in Uganda. It links genomic data to electronic health records for infectious disease and NCD research in Africa. Partners include MRC Uganda, IHVN Nigeria, and KEMRI Kenya.',
    tags:['apcdr','biobank','wellcome sanger','uganda','kenya','nigeria','ehr','infectious disease']},
  { id:'malagogen','category':'African Genomics',q:'What is MalariaGEN?',
    a:'MalariaGEN is a global network generating and sharing genomic data on malaria parasites (Plasmodium falciparum, vivax) and the Anopheles mosquito vector, plus human malaria resistance variants. Key outputs: Pf3k (7,000 samples), Pf7 (20,000 samples), and human GWAS of malaria severe outcomes in African children.',
    tags:['malariagen','plasmodium','falciparum','malaria','gwas','mosquito','anopheles','pf3k']},
  { id:'human-heredity','category':'African Genomics',q:'Why is African genomic data underrepresented in global databases?',
    a:'Africa contains ~16% of global population and the most genetic diversity, but <3% of GWAS participants are African-ancestry. Historical reasons: limited infrastructure, lack of funding for African-led research, data colonialism concerns, and prior export of samples without community benefit. H3Africa, APCDR, and deCODE-Africa initiatives are directly addressing this.',
    tags:['representation','diversity','gwas','africa','data colonialism','equity']},
  { id:'africa-specific-variants','category':'African Genomics',q:'Are there variants unique to African populations?',
    a:'Yes. African populations carry millions of variants absent from European/Asian genomes, reflecting longer evolutionary history and adaptation to African environments. Examples: DARC null allele (Duffy) near-fixed in sub-Saharan Africa (malaria protection); G6PD A- (sickle cell protection); variants in HLA, APOL1 (kidney disease), and TB resistance loci unique to African populations.',
    tags:['african variants','darc','duffy','g6pd','apol1','adaptation','population specific']},
  { id:'apol1','category':'African Genomics',q:'What is APOL1 and why is it important in African genomics?',
    a:'APOL1 variants G1 and G2 are found almost exclusively in West African-ancestry individuals and provide protection against Trypanosoma brucei (sleeping sickness) but increase risk of kidney disease (focal segmental glomerulosclerosis, hypertension-attributed CKD) when two risk alleles are inherited. A key example of Africa-specific variant-disease architecture.',
    tags:['apol1','kidney','ckd','west african','sleeping sickness','g1','g2','trypanosoma']},
  { id:'sickle-cell-africa','category':'African Genomics',q:'How does genomics help with sickle cell disease in Africa?',
    a:'WGS can identify modifier loci (BCL11A, HBG promoter) affecting fetal haemoglobin levels, which predicts disease severity. Pharmacogenomics can guide hydroxyurea dosing. Newborn screening using PCR/HPLC prevents disease deaths. Ghana, Nigeria, and South Africa have H3Africa sickle cell genomics projects identifying Africa-specific modifier variants.',
    tags:['sickle cell','hbss','bcl11a','fetal haemoglobin','hydroxyurea','newborn screening','africa']},
  { id:'tb-africa','category':'African Genomics',q:'How is WGS used for TB management in Africa?',
    a:'WGS replaces phenotypic DST: it detects resistance mutations in 18 drug-resistance loci (rpoB for rifampicin, katG+inhA for isoniazid, gyrA for fluoroquinolones) within 48 hours instead of 6–8 weeks. WGS also identifies transmission clusters for contact tracing. South Africa, Kenya, and Ethiopia run routine WGS-based TB surveillance.',
    tags:['tb','tuberculosis','wgs','drug resistance','dst','africa','rpob','katg']},
  { id:'malaria-resistance','category':'African Genomics',q:'Which human genetic variants protect against malaria?',
    a:'HbS (sickle cell trait, HBB E6V): 50–90% protection in heterozygotes. HbC (HBB E6K): 90% protection in homozygotes. G6PD deficiency: ~58% protection in female heterozygotes. Duffy null (DARC): 100% protection against P. vivax. Alpha-thalassaemia: 30–60% protection. These variants are maintained by balancing selection in malaria-endemic Africa.',
    tags:['malaria','protection','hbs','hbc','g6pd','duffy','alpha thalassaemia','balancing selection']},
  { id:'hiv-genomics','category':'African Genomics',q:'How is genomics used in HIV research in Africa?',
    a:'HIV genomics applications in Africa: drug resistance surveillance (pol gene sequencing to guide ART), phylogenetic analysis to map transmission networks, host GWAS identifying protective HLA alleles (HLA-B*57:01), vaccine antigen design, and viral evolution monitoring. APCDR and KEMRI lead East African HIV genomics programmes.',
    tags:['hiv','drug resistance','pol','hla','phylogenetics','apcdr','kemri','east africa']},
  { id:'covid-africa','category':'African Genomics',q:'What was Africa\'s contribution to SARS-CoV-2 genomics?',
    a:'Africa detected 3 of the 5 WHO Variants of Concern: Beta (South Africa, NGS-SA), Omicron (South Africa + Botswana, BHP), and contributed key Delta surveillance data. H3ABioNet\'s rapid capacity building enabled 40+ African countries to sequence within 12 months of the pandemic start. African sequencing revealed the Omicron receptor-binding domain mutations a week before global spread.',
    tags:['sars-cov-2','beta','omicron','south africa','ngs-sa','h3abionet','voc','surveillance']},
  { id:'one-health','category':'African Genomics',q:'What is One Health genomics?',
    a:'One Health recognises that human, animal, and environmental health are interconnected. One Health genomics uses WGS to track pathogens (Ebola, RVFV, avian flu, anthrax) across the human-animal-environment interface in Africa, identify zoonotic spillover events, and guide surveillance. ILRI and Africa CDC lead African One Health genomics.',
    tags:['one health','zoonosis','ebola','rvfv','spillover','ilri','africa cdc','surveillance']},
  { id:'pan-african-reference','category':'African Genomics',q:'Why does Africa need its own reference genome?',
    a:'The GRCh38 reference genome is primarily derived from individuals of European ancestry (~79% European), containing underrepresentation of African haplotypes. African-specific variants map poorly or are misclassified as novel. The Human Pangenome Reference Consortium (HPRC) graph genome includes 47 haplotype-diverse individuals including African ancestry. The African reference genome initiative (ARG) aims for >100 African reference genomes.',
    tags:['reference genome','pangenome','hprc','africa','grch38','haplotype','bias']},

  /* ── QC TROUBLESHOOTING ────────────────────────────────── */
  { id:'low-q30','category':'QC Troubleshooting',q:'My Q30 base quality score is below 80% — what went wrong?',
    a:'Low Q30 (<80%) usually indicates: sequencer wash/maintenance due, cluster density too high (reads bleed into adjacent clusters), or degraded DNA/RNA (RIN <7). Check the flow cell for bubble artefacts. Compare with a passing run. If consistently low, escalate to the sequencing facility.',
    tags:['q30','quality','fastq','sequencer','rta','cluster density','low quality']},
  { id:'low-mapping','category':'QC Troubleshooting',q:'My read mapping rate is below 70% — what should I check?',
    a:'Low mapping: (1) Wrong reference genome species — double-check. (2) Adapter contamination — run FastQC, check overrepresented sequences. (3) Heavily degraded RNA/DNA. (4) Wrong aligner settings for read length. (5) High PCR duplication preventing concordant pairing. (6) rRNA contamination in RNA-seq (forgot rRNA depletion).',
    tags:['mapping','alignment','low mapping','adapter','rrna','reference genome','troubleshooting']},
  { id:'high-duplication','category':'QC Troubleshooting',q:'My PCR duplication rate is 80% — is that a problem?',
    a:'80% duplication means only 20% of reads are informative. This is acceptable for targeted amplicon panels (e.g., ARTIC COVID-19 sequencing) where high duplication is expected. For WGS/RNA-seq it indicates insufficient input material, over-amplification, or low library complexity. Try increasing input DNA, reducing PCR cycles, or re-extracting the sample.',
    tags:['duplication','pcr','library','amplicon','wgs','rna-seq','complexity']},
  { id:'adapter-contamination','category':'QC Troubleshooting',q:'FastQC shows high adapter content — what do I do?',
    a:'Adapter contamination happens when reads are longer than the insert (short DNA fragments). Run Trimmomatic or Fastp to trim adapter sequences before alignment. Use the adapter sequence for your specific kit (Illumina TruSeq, Nextera, ARTIC). Check FastQC "Overrepresented Sequences" for the first 10 bases of the adapter to confirm.',
    tags:['adapter','trimming','fastqc','trimmomatic','fastp','insert size']},
  { id:'low-coverage','category':'QC Troubleshooting',q:'My WGS coverage is only 5× — can I still call variants?',
    a:'5× coverage is generally insufficient for reliable germline variant calling (need ≥20×). Options: (1) Add more sequencing lanes to increase depth. (2) Use low-coverage GWAS imputation (Minimac4 + Michigan Imputation Server) — works from 0.5×. (3) For viral WGS, 5× may be enough with consensus calling. Never call indels from <10× coverage.',
    tags:['coverage','low coverage','imputation','minimac','wgs','variant calling']},
  { id:'gc-bias','category':'QC Troubleshooting',q:'FastQC shows a curved GC distribution — is this abnormal?',
    a:'A bell-shaped GC curve peaking near your genome\'s GC content is normal (~42% for human). A bimodal curve suggests contamination from another organism (bacteria, human DNA in a bacterial sample). A sharp spike suggests adapter dimers. In RNA-seq, transcriptome GC differs from genome — compare to a reference RNA-seq GC profile.',
    tags:['gc content','gc bias','contamination','fastqc','adapter dimer','rna-seq']},
  { id:'rin-threshold','category':'QC Troubleshooting',q:'What is a minimum RIN score for RNA-seq?',
    a:'RIN (RNA Integrity Number) ranges 1–10. For high-quality RNA-seq: RIN ≥ 8. For acceptable: RIN 6–7 (some 3\' bias in transcript coverage, use poly-A selection). For degraded FFPE samples: RIN 3–5 (requires rRNA depletion and special normalisation). Below RIN 3, RNA-seq data is unreliable; avoid sequencing.',
    tags:['rin','rna quality','rna integrity','ffpe','poly-a','rrna','rna-seq']},
  { id:'strand-specific','category':'QC Troubleshooting',q:'How do I know if my RNA-seq library is strand-specific?',
    a:'Run RSeQC\'s infer_experiment.py on a BAM file — it reports the percentage of reads consistent with each strand orientation. TruSeq Stranded = RF/fr-firststrand (parameter: --rna-strandness RF in featureCounts). KAPA stranded = also RF. If infer_experiment returns 50/50 it is unstranded. Getting strandedness wrong inflates false-positive DE genes.',
    tags:['stranded','strand','rna-seq','rseqc','infer experiment','truseq','featurecounts']},
  { id:'sex-contamination','category':'QC Troubleshooting',q:'How do I detect sample swap or sex mismatches in WGS data?',
    a:'In PLINK: check --check-sex using the X chromosome heterozygosity (females are heterozygous on X; males are hemizygous). F-statistic > 0.8 = male; < 0.2 = female; 0.2–0.8 = mismatch or abnormal karyotype. Sample swaps appear as identity-by-descent (IBD) mismatches. Somalier and Peddy are dedicated sample-swap detection tools.',
    tags:['sample swap','sex mismatch','plink','somalier','wgs','ibd','quality control']},
  { id:'heterozygosity','category':'QC Troubleshooting',q:'What does outlier heterozygosity indicate in GWAS QC?',
    a:'Excess heterozygosity (F < −0.2) may indicate sample contamination — reads from two different individuals. Low heterozygosity (F > 0.2 in an autosomal locus) may indicate inbreeding, cryptic relatedness, or genotyping errors. Filter samples outside ±3 SD of the mean F-statistic in PLINK with --het.',
    tags:['heterozygosity','contamination','inbreeding','plink','gwas','qc','f-statistic']},

  /* ── DATABASES & RESOURCES ────────────────────────────── */
  { id:'ncbi-sra','category':'Databases',q:'What is the NCBI SRA?',
    a:'The NCBI Sequence Read Archive (SRA) is the world\'s largest repository of raw sequencing data. Over 50 petabases of data from millions of samples. Access via the SRA Toolkit (fasterq-dump), NCBI website, or Seven Bridges cloud. Use SRA-Accession numbers (SRR = run, SRX = experiment, SRP = project).',
    tags:['sra','ncbi','sequencing archive','download','fasterq-dump','raw data']},
  { id:'ena','category':'Databases',q:'What is ENA (European Nucleotide Archive)?',
    a:'ENA is the European counterpart to NCBI SRA — it mirrors most public sequencing data and also accepts submissions. ENA is often faster to access data programmatically (FTP downloads without SRA Toolkit). Use ENA accessions (ERR = run, ERP = project, ERS = sample). The ENA browser provides excellent metadata search.',
    tags:['ena','european nucleotide archive','ebi','sequencing','download','ftp']},
  { id:'gnomad','category':'Databases',q:'What is gnomAD and why is it important?',
    a:'gnomAD (Genome Aggregation Database) contains WGS and WES data from 143,000+ unrelated individuals across diverse ancestries, providing allele frequencies for ~800M variants. Use gnomAD to distinguish rare disease-causing variants from common benign variants. African-ancestry individuals are underrepresented (~8,000 in gnomAD v3) — a known limitation for African clinical genomics.',
    tags:['gnomad','allele frequency','variant','population','clinical','african','database']},
  { id:'clinvar','category':'Databases',q:'What is ClinVar?',
    a:'ClinVar is NCBI\'s archive of human variants with clinical significance — Pathogenic, Likely Pathogenic, Uncertain Significance (VUS), Likely Benign, Benign. Variant interpretations follow ACMG 2015 criteria. Critical for clinical genomics: a Pathogenic ClinVar entry is strong evidence for disease causation. African variants are systematically under-interpreted (more VUS) due to lack of African clinical data.',
    tags:['clinvar','clinical significance','pathogenic','vus','acmg','variant','database']},
  { id:'omim','category':'Databases',q:'What is OMIM?',
    a:'OMIM (Online Mendelian Inheritance in Man) is the authoritative catalog of Mendelian diseases and their causative genes. Each disease has an OMIM number (phenotype) and a gene entry (locus number). Use OMIM to identify known genes causing a candidate disease before interpreting WES variants. Access free at omim.org.',
    tags:['omim','mendelian','disease gene','database','rare disease','clinical genetics']},
  { id:'uniprot','category':'Databases',q:'What is UniProt and when is it used in omics?',
    a:'UniProt provides curated protein sequence and functional annotation. Key sub-databases: Swiss-Prot (manually curated, high-quality), TrEMBL (computationally annotated). Used in proteomics (protein identification), genome annotation (gene function), and pathway analysis (linking genes to biological processes).',
    tags:['uniprot','protein','database','annotation','swissprot','trembl','proteomics']},
  { id:'kegg','category':'Databases',q:'What is KEGG and how is it used in pathway analysis?',
    a:'KEGG (Kyoto Encyclopedia of Genes and Genomes) provides manually curated metabolic and signalling pathway maps. In RNA-seq pathway analysis: use clusterProfiler\'s enrichKEGG() to test whether your differentially expressed genes are enriched in KEGG pathways. Shows if "African sleeping sickness pathway" or "malaria pathway" is activated.',
    tags:['kegg','pathway analysis','rna-seq','enrichment','metabolic','signalling','clusterprofilier']},
  { id:'go-terms','category':'Databases',q:'What are Gene Ontology (GO) terms?',
    a:'GO (Gene Ontology) provides a standardised vocabulary for gene function: Biological Process (BP), Molecular Function (MF), and Cellular Component (CC). GO enrichment analysis finds over-represented functions in your gene list. In DESeq2 results: run clusterProfiler::enrichGO() to see which biological processes are changed between conditions.',
    tags:['go','gene ontology','bp','mf','cc','enrichment','pathway','clusterprofiler']},
  { id:'ensembl','category':'Databases',q:'What is Ensembl?',
    a:'Ensembl is a genome browser and annotation database for vertebrates (and some non-vertebrates). It provides gene models, transcript structures, cross-species comparisons (Compara), regulatory features, and variant consequences (VEP). Ensembl gene IDs (ENSG...) are the standard in RNA-seq count matrices.',
    tags:['ensembl','genome browser','gene annotation','vep','comparative genomics']},
  { id:'ucsc','category':'Databases',q:'What is the UCSC Genome Browser?',
    a:'The UCSC Genome Browser allows visualisation of any genomic region with annotation tracks: genes, conservation, repeats, epigenomic marks, and user-uploaded data. It has custom track support for uploading BED, BigWig, and VCF files. The ENCODE and Roadmap Epigenomics datasets are hosted on UCSC.',
    tags:['ucsc','genome browser','visualisation','encode','tracks','custom track']},
  { id:'gisaid','category':'Databases',q:'What is GISAID?',
    a:'GISAID (Global Initiative on Sharing Avian Influenza Data) is the primary international database for influenza and SARS-CoV-2 genome sequences. It requires user registration (free) and uses a data access agreement. Over 15 million SARS-CoV-2 sequences deposited, including 200,000+ from Africa. Essential for variant surveillance.',
    tags:['gisaid','sars-cov-2','influenza','sequencing','surveillance','variant','access']},
  { id:'h3africa-archive','category':'Databases',q:'Where can I access H3Africa genomic data?',
    a:'H3Africa data is accessed through the H3Africa Data Archive (https://h3africa.org/), dbGaP under controlled access (phs002299), and the European Genome-Phenome Archive (EGA). Access requires ethics approval from your institution. The AWI-Gen genotyping data is at the EGA under EGAS00001004516.',
    tags:['h3africa','data archive','controlled access','dbgap','ega','ethics','access']},

  /* ── PROTOCOLS & WET LAB ─────────────────────────────── */
  { id:'dna-extraction','category':'Wet Lab',q:'What is the best method for DNA extraction from whole blood?',
    a:'QIAGEN QIAamp DNA Blood Mini Kit is the gold standard — reliable, scalable, and produces high-quality DNA suitable for WGS (OD260/280 ≥ 1.8). Magnetic bead-based methods (Beckman Coulter Agencourt) are faster for large numbers. For FFPE tissue, QIAGEN FFPE kit removes formaldehyde adducts critical for library prep.',
    tags:['dna extraction','blood','qiagen','ffpe','magnetic bead','od260','quality']},
  { id:'rna-extraction','category':'Wet Lab',q:'How do I extract high-quality RNA from tissue?',
    a:'Work on dry ice, pre-chill all equipment. Homogenise with TRIzol (phase separation method) or RNeasy (column-based). Key RIN killers: RNases on bench, warm temperatures, thaw-freeze cycles. Measure RIN on Agilent Bioanalyzer before sequencing. Treat samples with DNase I to remove genomic DNA contamination.',
    tags:['rna extraction','trizol','rneasy','rin','dnase','tissue','mrna','quality']},
  { id:'library-prep','category':'Wet Lab',q:'What is Illumina library preparation?',
    a:'DNA library prep: fragment DNA → end-repair → A-tailing → adapter ligation → PCR amplification → size selection. RNA library prep adds a reverse transcription step (cDNA synthesis). Key kits: Illumina TruSeq (standard), Nextera DNA Flex (tagmentation, uses less input), NEBNext Ultra II. Check fragment size distribution on Bioanalyzer before sequencing.',
    tags:['library prep','illumina','truseq','nextera','fragmentation','adapter','pcr','bioanalyzer']},
  { id:'nanopore','category':'Wet Lab',q:'How does Oxford Nanopore sequencing work?',
    a:'Nanopore passes single-stranded DNA through a protein nanopore in a membrane under an electric field. As each base passes, it disrupts the current in a unique way — the signal is decoded into a base sequence by basecalling software (Guppy, Dorado). Reads are 1–50 kb (long reads, excellent for structural variants and phasing). Error rate ~1–5% (higher than Illumina).',
    tags:['nanopore','oxford nanopore','ont','minion','guppy','dorado','long read','basecalling']},
  { id:'pacbio','category':'Wet Lab',q:'When should I use PacBio sequencing?',
    a:'PacBio (SMRT sequencing) produces very long reads (average 15–25 kb, up to 500 kb for HiFi) with very high accuracy after consensus (>99.9% for HiFi reads). Use for: genome assembly, phasing haplotypes, detecting large structural variants, and full-length transcript sequencing (Iso-Seq). More expensive than Illumina, but transformative for difficult regions.',
    tags:['pacbio','smrt','hifi','long read','structural variant','phasing','genome assembly']},
  { id:'artic','category':'Wet Lab',q:'What is the ARTIC protocol and why is it used in Africa?',
    a:'ARTIC is a tiled amplicon sequencing protocol for pathogen WGS (originally for Zika/Ebola, widely used for SARS-CoV-2). Amplicons cover the entire viral genome. Compatible with both Illumina and Nanopore. Key advantages: works from low-quantity degraded clinical samples, rapid (12–24 hours), and low cost (~$20 per sample). Used by Africa CDC PGI and H3ABioNet for COVID-19 and mpox surveillance.',
    tags:['artic','amplicon','sars-cov-2','nanopore','illumina','viral','surveillance','africa']},
  { id:'ngs-qc-fail','category':'Wet Lab',q:'My Illumina run failed — what are the most common causes?',
    a:'Common run failures: (1) Improper library loading concentration (too high → overclustering, too low → low yield). (2) Incomplete denaturing of DNA. (3) Incorrect PhiX percentage (use 5–20% for diversity). (4) Flow cell already used (damaged lane). (5) Index crosstalk (wrong demultiplexing). Check the run metrics in BaseSpace immediately after sequencing.',
    tags:['illumina','run failure','clustering','phix','demultiplexing','basespace','library loading']},
  { id:'qubit','category':'Wet Lab',q:'What is Qubit used for and how is it different from NanoDrop?',
    a:'Qubit uses fluorescent dyes specific to dsDNA, ssDNA, or RNA — very accurate and unaffected by protein contamination. NanoDrop measures UV absorbance (OD260/OD280) and is fast but inaccurate for low-concentration or impure samples. Use NanoDrop for an initial check; use Qubit for the accurate measurement before library prep.',
    tags:['qubit','nanodrop','od260','concentration','dna quantification','library prep','fluorescence']},

  /* ── PROTEOMICS & METABOLOMICS ─────────────────────── */
  { id:'mass-spec','category':'Proteomics',q:'What is mass spectrometry-based proteomics?',
    a:'MS proteomics identifies and quantifies proteins by measuring the mass-to-charge ratio of peptides. Workflow: protein extraction → digestion (trypsin) → LC-MS/MS → peptide identification (Mascot, MaxQuant, Proteome Discoverer). Label-free quantification (LFQ) or TMT labelling for comparing multiple samples.',
    tags:['mass spectrometry','proteomics','lc-ms','peptide','maxquant','tmt','lfq']},
  { id:'metabolomics','category':'Metabolomics',q:'What is metabolomics?',
    a:'Metabolomics measures all small molecules (metabolites, <1500 Da) in a biological sample — the metabolome. Methods: NMR (untargeted, qualitative), LC-MS (untargeted + targeted, quantitative). Key uses: biomarker discovery, drug metabolism, microbiome-host interactions. MetaboAnalyst is the standard web tool for metabolomics data analysis.',
    tags:['metabolomics','metabolite','nmr','lc-ms','metaboanalyst','biomarker','small molecule']},
  { id:'dia-proteomics','category':'Proteomics',q:'What is DIA proteomics?',
    a:'DIA (Data-Independent Acquisition) systematically fragments ALL peptides in a sample rather than selecting the most abundant (DDA). This gives better reproducibility across samples. DIA-NN and Spectronaut are the analysis tools. DIA is becoming the standard for large clinical cohort proteomics.',
    tags:['dia','dda','proteomics','dia-nn','spectronaut','acquisition','clinical']},

  /* ── EPIGENOMICS ─────────────────────────────────────── */
  { id:'bisulfite','category':'Epigenomics',q:'What is bisulfite sequencing (WGBS)?',
    a:'Whole-genome bisulfite sequencing maps DNA methylation at single-base resolution. Bisulfite converts unmethylated cytosines (C) to uracil (read as thymine); methylated 5mC is protected. After sequencing, compare T vs C at each CpG position. Bismark is the standard aligner. RRBS (reduced representation) is a cost-effective alternative covering CpG islands.',
    tags:['bisulfite','wgbs','rrbs','methylation','5mc','cpg','bismark','epigenomics']},
  { id:'chip-seq','category':'Epigenomics',q:'What is ChIP-seq?',
    a:'ChIP-seq (Chromatin Immunoprecipitation Sequencing) maps protein-DNA binding across the genome. Antibody immunoprecipitates a protein of interest (histone mark, transcription factor) crosslinked to chromatin; the bound DNA is sequenced. Peak caller: MACS2. Used to map H3K27ac (active enhancers), H3K4me3 (active promoters), and TF binding sites.',
    tags:['chip-seq','histone','chromatin','immunoprecipitation','enhancer','promoter','macs2']},
  { id:'cut-and-run','category':'Epigenomics',q:'What is CUT&RUN and how does it improve on ChIP-seq?',
    a:'CUT&RUN uses protein A-MNase fusion to cleave DNA near the target protein in intact cells — no formaldehyde crosslinking or sonication needed. Requires far fewer cells (10,000 vs 1 million for ChIP-seq), lower sequencing depth, and lower background. Particularly useful for low-abundance TFs and primary African clinical samples.',
    tags:['cut and run','cut run','chip-seq','mnase','chromatin','tf','histone']},

  /* ── DATA GOVERNANCE & ETHICS ─────────────────────── */
  { id:'fair','category':'Data Governance',q:'What does FAIR data mean?',
    a:'FAIR data is: Findable (persistent identifier, searchable metadata), Accessible (open or controlled access, standard protocol), Interoperable (uses standard formats and ontologies), Reusable (clear license, provenance). All H3Africa studies must deposit FAIR data in the H3Africa archive. FAIR maximises the scientific return on expensive genomic investments.',
    tags:['fair','findable','accessible','interoperable','reusable','h3africa','data sharing']},
  { id:'community-engagement','category':'Data Governance',q:'Why is community engagement critical for African genomics?',
    a:'African genomics has a history of extractive research — samples collected and exported without community benefit, consent, or data return. Community engagement ensures: informed consent in local languages, community advisory boards, results returned to participants, local capacity building, and research driven by African health priorities. H3Africa mandates community engagement protocols.',
    tags:['community engagement','consent','ethics','h3africa','data colonialism','capacity building']},
  { id:'hipaa-popi','category':'Data Governance',q:'What privacy laws govern genomic data in Africa?',
    a:'South Africa: POPIA (Protection of Personal Information Act) governs health data including genomics — requires explicit consent and data minimisation. Nigeria: NDPR (Nigeria Data Protection Regulation). Kenya: Data Protection Act 2019. EU GDPR applies to data transferred to/from European collaborators. The H3Africa Data Access Committee oversees controlled-access data requests.',
    tags:['popia','ndpr','data protection','privacy','south africa','nigeria','kenya','gdpr']},
  { id:'dbgap-access','category':'Data Governance',q:'How do I access controlled-access data on dbGaP?',
    a:'Apply at dbGaP through your institution\'s Signing Official. Your Data Access Request (DAR) needs: research purpose, IRB approval number, and IT security attestation. Approval takes 2–6 weeks. Data is downloaded via SRA Toolkit with eRA Commons credentials. All controlled-access data use agreements prohibit re-identification and require data destruction after study completion.',
    tags:['dbgap','controlled access','era commons','dar','irb','data access','ncbi']},

  /* ── CAREER & TRAINING ─────────────────────────────── */
  { id:'ibt-course','category':'Career',q:'What is the H3ABioNet IBT bioinformatics course?',
    a:'The IBT (Introduction to Bioinformatics) is an annual 3-month online course run by H3ABioNet. It covers Linux, Python, R, NGS data analysis, and African genomics. Free, open to all African researchers. Applications open annually in September. Certificates are highly valued by African genomics employers.',
    tags:['ibt','h3abionet','bioinformatics','training','course','linux','python','africa']},
  { id:'wellcome-africa','category':'Career',q:'What funding opportunities does Wellcome Trust offer for African genomics researchers?',
    a:'Wellcome African Programmes: Wellcome Africa & Asia Research Programmes (WARA/WAACP), African Institutions Initiative, Wellcome Sanger Africa programs, and International Intermediate Fellowship (postdocs). Key: Wellcome prioritises applicants who will remain in Africa and build institutional capacity. Typical awards: £50k–£1M.',
    tags:['wellcome','funding','africa','fellowship','grant','postdoc','intermediate']},
  { id:'nih-fogarty','category':'Career',q:'What NIH programs fund African genomics training?',
    a:'Fogarty International Center funds African training via: D43 (international training), K43 (African early career investigators), and R21/R01 global health research. H3Africa uses U01/U54 consortium mechanisms. NIH also funds African scientists through R01 supplements (R01AI) for HIV, malaria, and TB genomics.',
    tags:['nih','fogarty','funding','d43','k43','h3africa','africa','grant']},
  { id:'data-science-fellowship','category':'Career',q:'What is the African Institute for Mathematical Sciences (AIMS) role in genomics?',
    a:'AIMS offers MSc and postgraduate diplomas in mathematical sciences including biostatistics and bioinformatics across 6 African countries (South Africa, Senegal, Ghana, Cameroon, Rwanda, Tanzania). AIMS graduates are well-prepared for bioinformatics careers. AIMS has a Data Science for Health initiative in collaboration with African genomics centres.',
    tags:['aims','africa','data science','bioinformatics','msc','fellowship','mathematics']},

  /* ── SPECIFIC DISEASES ─────────────────────────────── */
  { id:'ebola-genomics','category':'Infectious Diseases',q:'How was genomics used in the West Africa Ebola outbreak?',
    a:'During the 2013–2016 West Africa Ebola epidemic, real-time WGS revealed: sustained human-to-human transmission (not multiple zoonotic spillovers), timing of cross-border introductions into Guinea/Sierra Leone/Liberia, and identified superspreader events. This was the first large epidemic where real-time genomics guided public health response.',
    tags:['ebola','west africa','wgs','outbreak','real-time genomics','phylogenetics','guinea','sierra leone']},
  { id:'mpox-genomics','category':'Infectious Diseases',q:'What have we learned from mpox genomics?',
    a:'Genomics revealed: MPXV Clade I (DRC-endemic, higher CFR) vs Clade II (2022 global outbreak, lower CFR). The 2022 outbreak strain accumulated far more APOBEC3-driven mutations than expected from zoonotic evolution — evidence of sustained human-to-human transmission predating the outbreak. Phylogenetic analysis mapped spread from West Africa to Europe and Americas.',
    tags:['mpox','monkeypox','clade I','clade II','apobec3','phylogenetics','drc','genomics']},
  { id:'cholera-genomics','category':'Infectious Diseases',q:'How has WGS transformed cholera surveillance in Africa?',
    a:'WGS showed the 7th pandemic V. cholerae O1 El Tor strain spread in multiple waves from Asia to Africa. ST69 lineage dominates African outbreaks. SXT integrative conjugative elements carry multidrug resistance (ampicillin, tetracycline, chloramphenicol). Real-time WGS during DRC outbreaks distinguishes local endemic spread from cross-border importation.',
    tags:['cholera','vibrio cholerae','wgs','7th pandemic','drc','sxt','drug resistance','africa']},
  { id:'tb-drug-resistance','category':'Infectious Diseases',q:'What genomic markers indicate drug resistance in M. tuberculosis?',
    a:'Key mutations: rpoB (rifampicin), katG+inhA (isoniazid), gyrA/B (fluoroquinolones), rrs+eis (aminoglycosides), rpsL (streptomycin), pncA (pyrazinamide), tlyA (capreomycin), rv0678 (bedaquiline/clofazimine). The WHO Catalogue of Resistance-Associated Variants (WHO-CRyPTIC) grades mutations I-V for clinical confidence. TBProfiler and Mykrobe do automated WGS-based DST.',
    tags:['tb','m tuberculosis','drug resistance','rpob','katg','gyra','bedaquiline','tbprofiler','mykrobe']},
  { id:'malaria-drug-resistance','category':'Infectious Diseases',q:'How does P. falciparum develop drug resistance?',
    a:'Key resistance mutations: pfcrt K76T (chloroquine), pfmdr1 N86Y (lumefantrine), kelch13 (artemisinin — C580Y most common in SE Asia, rare in Africa), pfdhfr/pfdhps (SP/sulfadoxine-pyrimethamine). Africa harbours emerging kelch13 mutations (A675V, C469Y in Rwanda/Uganda) — a critical surveillance concern. WGS enables simultaneous detection of all resistance markers.',
    tags:['plasmodium falciparum','drug resistance','kelch13','pfcrt','artemisinin','chloroquine','malaria','africa']},
  { id:'hiv-drug-resistance','category':'Infectious Diseases',q:'What are the common HIV drug resistance mutations in Africa?',
    a:'RT mutations: K65R (tenofovir), M184V (lamivudine/emtricitabine), K103N (efavirenz/nevirapine — common pre-treatment resistance in Africa at 4–8%). Protease mutations: D30N, V82A, I84V (PIs). The Stanford HIV Drug Resistance Database (hivdb.stanford.edu) interprets pol gene mutations. Africa has high pre-treatment NNRTI resistance (WHO threshold exceeded in most countries).',
    tags:['hiv','drug resistance','k65r','m184v','k103n','nnrti','pol gene','pre-treatment','africa']},

  /* ── GRANT WRITING ─────────────────────────────────── */
  { id:'grant-specific-aims','category':'Grant Writing',q:'What makes a strong Specific Aims page for an African genomics grant?',
    a:'A strong Aims page: (1) Opens with the public health burden in Africa (numbers, countries, deaths). (2) Clearly states the knowledge gap. (3) Proposes a hypothesis. (4) Lists 3 aims that each advance the hypothesis — not just a task list. (5) States the expected impact on African health. Reviewers decide in the first 10 minutes whether to fund based on Aims alone.',
    tags:['grant writing','specific aims','nih','wellcome','hypothesis','aims','africa','public health']},
  { id:'fogarty-d43','category':'Grant Writing',q:'What does a Fogarty D43 Training Grant fund?',
    a:'The D43 (International Research Training) funds training programmes to strengthen research capacity in low- and middle-income countries (LMICs). It funds: short-term training (1–6 weeks), long-term training (Masters/PhD abroad), research exchanges, curriculum development, and mentoring. Applicants must be US-based but partner with LMIC institutions. Duration: 5 years, budget: $500k–$1.5M total.',
    tags:['fogarty','d43','training grant','lmic','nih','capacity building','africa']},
  { id:'gates-grand-challenges','category':'Grant Writing',q:'What is the Gates Foundation Grand Challenges?',
    a:'The Bill & Melinda Gates Foundation Grand Challenges awards Exploration grants ($100k) and Grand Challenges grants ($1M+) for bold innovations in global health, including African infectious disease genomics. No preliminary data required for Exploration grants — idea-stage proposals welcome. Applications accepted year-round, 2-month review cycle.',
    tags:['gates foundation','grand challenges','exploration','grant','africa','global health','innovation']},

  /* ── MISCELLANEOUS ────────────────────────────────── */
  { id:'crispr-africa','category':'Genomics',q:'Is CRISPR being used in Africa?',
    a:'CRISPR applications in Africa: malaria-resistant mosquitoes (gene drive research at CSIRO/Target Malaria partnership), crop improvement (drought-resistant cassava, CIMMYT wheat), sickle cell disease correction (clinical trials starting in South Africa and Nigeria), and TB vaccine development. Kenya, Uganda, South Africa, and Ghana have active CRISPR research programmes.',
    tags:['crispr','gene drive','crop improvement','sickle cell','malaria','africa','target malaria']},
  { id:'pangenome','category':'Genomics',q:'What is a pangenome and why does it matter for Africa?',
    a:'A pangenome is a collection of genome sequences representing the full genetic diversity of a species — unlike a single linear reference. The Human Pangenome Reference Consortium (HPRC) built a graph genome from 47 diverse haplotypes. For Africa, pangenomes capture structural variants and haplotypes absent from GRCh38, improving read mapping by ~15% and variant detection.',
    tags:['pangenome','hprc','graph genome','structural variant','africa','reference','diversity']},
  { id:'structural-variants','category':'Genomics',q:'What are structural variants (SVs) and how are they detected?',
    a:'SVs are genomic alterations >50 bp: deletions, insertions, duplications, inversions, and translocations. Short-read WGS detects SVs imperfectly; long-read sequencing (PacBio HiFi, Nanopore) is far superior. Tools: Manta (short-read), PBSV (PacBio), Sniffles (Nanopore), LUMPY (paired-end). SVs cause ~10–20% of rare diseases missed by SNP-based analysis.',
    tags:['structural variants','sv','deletion','insertion','duplication','inversion','long read','manta','sniffles']},
  { id:'polygenic-risk','category':'Genomics',q:'What is a Polygenic Risk Score (PRS)?',
    a:'A PRS aggregates the effects of thousands of genetic variants into a single score predicting disease risk. PRS = sum(effect allele × effect size). PRS from European GWAS performs poorly in African individuals (r²=0.04 vs r²=0.34 in Europeans). African-specific GWAS discovery (H3Africa, APCDR) is critical to building accurate PRS for African populations.',
    tags:['prs','polygenic risk score','gwas','africa','transferability','risk prediction']},
  { id:'pharmacogenomics','category':'Genomics',q:'What is pharmacogenomics and why does it matter in Africa?',
    a:'Pharmacogenomics studies how genetic variants affect drug metabolism and response. Key examples: CYP2B6*6 allele (efavirenz metabolism for HIV — high frequency in sub-Saharan Africa → higher drug exposure, more side effects), NAT2 (isoniazid toxicity in TB), CYP2D6 (codeine and antidepressants). Africa\'s high frequency of slow-metaboliser alleles is actionable clinical genomics.',
    tags:['pharmacogenomics','cyp2b6','cyp2d6','nat2','drug metabolism','hiv','tb','africa','efavirenz']},
];

/* ─── Mentor chat UI ─── */
OmicsLab.Mentor = (function () {

  let _history = []; /* {role:'user'|'bot', text, id?} */
  let _allData = null; /* combined QA corpus */

  function _getCorpus() {
    if (_allData) return _allData;
    _allData = [
      ...(OmicsLab.QA_DATA || []),
      ...OmicsLab.MENTOR_DATA,
    ];
    return _allData;
  }

  /* ─── Score a question against corpus ─── */
  function _score(query, entry) {
    const words = query.toLowerCase().split(/\W+/).filter(w => w.length > 2);
    if (!words.length) return 0;
    let score = 0;
    const text = (entry.q + ' ' + entry.a + ' ' + (entry.tags || []).join(' ')).toLowerCase();
    words.forEach(w => {
      if (entry.q.toLowerCase().includes(w)) score += 4;     /* title match */
      if ((entry.tags || []).some(t => t.toLowerCase().includes(w))) score += 3;
      if (text.includes(w)) score += 1;
    });
    return score;
  }

  /* ─── Find best matching answer ─── */
  function _findAnswer(query) {
    const corpus = _getCorpus();
    const scored = corpus
      .map(e => ({ e, s: _score(query, e) }))
      .filter(x => x.s > 0)
      .sort((a, b) => b.s - a.s);

    if (!scored.length) return null;

    const best = scored[0].e;
    /* Related questions: next 3 highest scores in same or related category */
    const related = scored.slice(1, 6)
      .map(x => x.e)
      .filter(e => e.id !== best.id);

    return { answer: best, related: related.slice(0, 3) };
  }

  /* ─── Render message ─── */
  function _appendMessage(role, html, extraClass) {
    const feed = document.getElementById('mentor-feed');
    if (!feed) return;
    const div = document.createElement('div');
    div.className = `mentor-msg mentor-msg-${role}${extraClass ? ' ' + extraClass : ''}`;
    div.innerHTML = html;
    feed.appendChild(div);
    feed.scrollTop = feed.scrollHeight;
  }

  /* ─── Handle user question ─── */
  function _ask(query) {
    query = (query || '').trim();
    if (!query) return;

    /* Clear input */
    const input = document.getElementById('mentor-input');
    if (input) input.value = '';

    /* Show user message */
    _appendMessage('user', `<span class="mentor-user-bubble">${query.replace(/</g,'&lt;')}</span>`);

    /* Think delay for realism */
    setTimeout(() => {
      const result = _findAnswer(query);

      if (!result) {
        _appendMessage('bot', `
          <div class="mentor-bot-wrap">
            <div class="mentor-bot-avatar">${OmicsLab.Icons?.svg('dna',16)||''}</div>
            <div class="mentor-bot-bubble">
              <p>I don't have a specific answer for that yet. Try rephrasing, or browse topics using the category buttons above. You can also check the
              <a href="https://www.h3abionet.org/education-and-training" target="_blank" rel="noopener noreferrer">H3ABioNet training materials</a> for specialised resources.</p>
            </div>
          </div>`);
        return;
      }

      const { answer, related } = result;
      const relatedHtml = related.length ? `
        <div class="mentor-follow-ups">
          <div class="mentor-follow-label">You might also ask:</div>
          ${related.map(r => `<button class="mentor-follow-chip" onclick="OmicsLab.Mentor._ask(${JSON.stringify(r.q)})">${r.q}</button>`).join('')}
        </div>` : '';

      _appendMessage('bot', `
        <div class="mentor-bot-wrap">
          <div class="mentor-bot-avatar">${OmicsLab.Icons?.svg('dna',16)||''}</div>
          <div class="mentor-bot-bubble">
            <div class="mentor-category-tag">${answer.category}</div>
            <p class="mentor-answer-q">${answer.q}</p>
            <div class="mentor-answer-body">${answer.a}</div>
            ${relatedHtml}
          </div>
        </div>`);
    }, 280);
  }

  /* ─── Welcome message ─── */
  function _welcome() {
    const corpus = _getCorpus();
    const categories = [...new Set(corpus.map(e => e.category))];

    _appendMessage('bot', `
      <div class="mentor-bot-wrap">
        <div class="mentor-bot-avatar">${OmicsLab.Icons?.svg('dna',16)||''}</div>
        <div class="mentor-bot-bubble mentor-welcome">
          <div class="mentor-welcome-title">Hi! I'm your Offline AI Mentor</div>
          <p class="mentor-welcome-sub">Ask me anything about omics, bioinformatics, African genomics, tools, careers, or wet-lab protocols. I have <strong>${corpus.length}+ expert answers</strong> — all offline, no internet required.</p>
          <div class="mentor-starter-label">Suggested questions to get started:</div>
          <div class="mentor-starters">
            ${[
              'What is the GATK Best Practices pipeline?',
              'How does H3Africa support African researchers?',
              'What tools do I need for RNA-seq analysis?',
              'How is WGS used for TB drug resistance?',
              'What is APOL1 and why does it matter?',
              'How do I correct for batch effects?',
            ].map(q => `<button class="mentor-starter-btn" onclick="OmicsLab.Mentor._ask(${JSON.stringify(q)})">${q}</button>`).join('')}
          </div>
        </div>
      </div>`);
  }

  /* ─── Category quick-browse ─── */
  function _browseCategory(cat) {
    const corpus = _getCorpus();
    const entries = corpus.filter(e => e.category === cat);
    if (!entries.length) return;

    const listHtml = entries.slice(0, 8).map(e =>
      `<button class="mentor-browse-q" onclick="OmicsLab.Mentor._ask(${JSON.stringify(e.q)})">${e.q}</button>`
    ).join('');

    _appendMessage('bot', `
      <div class="mentor-bot-wrap">
        <div class="mentor-bot-avatar">${OmicsLab.Icons?.svg('file-text',16)||''}</div>
        <div class="mentor-bot-bubble">
          <div class="mentor-category-tag">${cat}</div>
          <p>Here are questions in the <strong>${cat}</strong> category — click any to get the answer:</p>
          <div class="mentor-browse-list">${listHtml}</div>
          ${entries.length > 8 ? `<div class="mentor-browse-more">…and ${entries.length - 8} more. Ask me anything from this category!</div>` : ''}
        </div>
      </div>`);
  }

  /* ─── Init ─── */
  function init() {
    const section = document.getElementById('mentor-section');
    if (!section || section.dataset.mentorReady) return;
    section.dataset.mentorReady = '1';

    const corpus = _getCorpus();
    const categories = [...new Set(corpus.map(e => e.category))];

    section.innerHTML = `
      <div class="mentor-wrap">
        <div class="mentor-header">
          <div>
            <div class="mentor-badge">OFFLINE AI MENTOR</div>
            <h2 class="mentor-title">Your Omics Knowledge Assistant</h2>
            <p class="mentor-subtitle">Ask anything about genomics, tools, African research, or careers. All ${corpus.length}+ answers are bundled offline — no internet needed.</p>
          </div>
          <div class="mentor-corpus-stat">
            <span class="mentor-stat-n">${corpus.length}+</span>
            <span class="mentor-stat-l">Expert Answers</span>
          </div>
        </div>

        <!-- Category browser -->
        <div class="mentor-cats">
          ${categories.map(c => `
            <button class="mentor-cat-chip" onclick="OmicsLab.Mentor._browseCategory('${c.replace(/'/g,'\\\'')}')">${c}</button>`).join('')}
        </div>

        <!-- Chat feed -->
        <div class="mentor-feed" id="mentor-feed"></div>

        <!-- Input area -->
        <div class="mentor-input-area">
          <div class="mentor-input-wrap">
            <svg class="mentor-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            <input id="mentor-input" class="mentor-input" type="text"
                   placeholder="Ask about omics tools, African genomics, careers, wet-lab protocols…"
                   onkeydown="if(event.key==='Enter')OmicsLab.Mentor._ask(this.value)"
                   autocomplete="off" autocorrect="off" spellcheck="false"/>
            <button class="mentor-send-btn" onclick="OmicsLab.Mentor._ask(document.getElementById('mentor-input').value)">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
          </div>
          <div class="mentor-input-hint">Try: "What is STAR aligner?" · "How does H3Africa fund research?" · "Why do I get low Q30 scores?"</div>
        </div>
      </div>`;

    _welcome();
  }

  return { init, _ask, _browseCategory };
})();
