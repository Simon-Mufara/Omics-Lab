/* ═══════════════════════════════════════════════════════════════
   OmicsLab — Quiz Mode
   5 MCQ per workflow with explanations
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.Quiz = (function() {

  const QUESTIONS = {
    'wgs': [
      { q:'What is the minimum recommended RIN score for high-quality WGS?',
        opts:['RIN > 4','RIN > 6','RIN ≥ 8','RIN ≥ 10'], ans:2,
        exp:'RIN ≥ 8 is required for WGS. RIN < 6 indicates significant degradation, causing poor coverage uniformity and high duplication, especially at GC-extreme regions.' },
      { q:'Which adapter chemistry prevents index hopping on patterned flow cells (NovaSeq)?',
        opts:['TruSeq with single index','Nextera XT','TruSeq + Unique Dual Index (UDI)','NEB Ultra II (no index)'], ans:2,
        exp:'Unique Dual Indexing (UDI) is essential for NovaSeq patterned flow cells — without it, index hopping can misassign up to 1% of reads when multiplexing many samples.' },
      { q:'What insert size is optimal for Illumina 150 bp paired-end WGS?',
        opts:['100–200 bp','350–550 bp','800–1000 bp','1500–2000 bp'], ans:1,
        exp:'A 350–550 bp insert maximises usable paired-end sequence. Too small = adapter contamination reads; too large = poor cluster generation and reduced coverage uniformity.' },
      { q:'Which variant caller locally re-assembles reads to detect complex indels?',
        opts:['SAMtools mpileup','GATK HaplotypeCaller','FreeBayes','VarScan2'], ans:1,
        exp:'GATK HaplotypeCaller builds a de Bruijn graph in "active regions" to locally re-assemble reads — making it the best standard caller for complex indels and multi-nucleotide variants.' },
      { q:'Why is PCR-free WGS preferred for high-input samples?',
        opts:['It is cheaper','It uses less DNA','It eliminates PCR duplication bias at GC-extreme regions','It gives longer reads'], ans:2,
        exp:'PCR amplification preferentially amplifies GC-moderate regions, causing under-coverage at CpG islands and GC-poor regions. PCR-free libraries give the most uniform genome-wide coverage.' }
    ],
    'wes': [
      { q:'What minimum mean on-target depth is needed for reliable germline WES?',
        opts:['20×','50×','100×','200×'], ans:2,
        exp:'Germline WES requires ≥100× mean on-target depth. A heterozygous variant at 50% allele frequency needs ≥20× to be reliably called — 100× mean depth ensures most loci meet this threshold.' },
      { q:'What happens when you annotate GRCh38 calls with GRCh37 databases?',
        opts:['Annotations are slightly off','All variant coordinates are corrupted silently','Only UTR annotations fail','No effect — coordinates are identical'], ans:1,
        exp:'GRCh37 and GRCh38 differ at thousands of coordinates. Using mismatched genome builds silently corrupts all annotations — the most catastrophic and common error in clinical WES.' },
      { q:'Which tool is the gold standard for rare-disease variant annotation?',
        opts:['bcftools annotate','ANNOVAR + ClinVar + gnomAD','SnpEff only','GATK FilterVariantTranches'], ans:1,
        exp:'ANNOVAR integrates ClinVar, gnomAD, OMIM, and splice predictors — providing the most complete annotation pipeline for rare disease diagnosis.' },
      { q:'Why does FFPE DNA perform poorly in standard WES?',
        opts:['It is too concentrated','Formalin causes C→T deamination artefacts and DNA cross-linking','It requires RNA extraction first','FFPE DNA is always HMW'], ans:1,
        exp:'Formalin fixation causes cytosine deamination (C→T artefacts) and cross-links proteins to DNA. Specialised repair kits and modified protocols are needed for FFPE exome sequencing.' },
      { q:'What exome capture kit achieves >96% on-target rate?',
        opts:['Agilent SureSelect Human All Exon v8','Broad ICE v1','Twist Bioscience Core (unvalidated)','Illumina TruSeq Exome v1'], ans:0,
        exp:'Agilent SureSelect Human All Exon v8 (35 Mb) is the industry standard — achieving >96% on-target efficiency and excellent RefSeq coverage in clinical and research settings.' }
    ],
    'rna-seq': [
      { q:'What RIN threshold is required for bulk RNA-seq?',
        opts:['RIN > 3','RIN > 5','RIN ≥ 7','RIN ≥ 9'], ans:2,
        exp:'RIN ≥ 7 is the standard for bulk RNA-seq. RIN < 6 leads to 3′ bias, reduced gene detection, and unreliable differential expression results.' },
      { q:'Which library prep method preserves strand information?',
        opts:['Standard TruSeq (unstranded)','dUTP-based stranded prep','Random priming only','Boiling lysis'], ans:1,
        exp:'dUTP-based stranded prep (TruSeq Stranded mRNA) incorporates dUTP into the second strand then degrades it, preserving strand-of-origin — critical for antisense RNA and overlapping gene loci.' },
      { q:'Why does DESeq2 use a negative binomial model?',
        opts:['It is computationally fastest','RNA count data is overdispersed — variance exceeds the mean','Normal distribution assumes log-normal counts','DESeq2 does not use statistics'], ans:1,
        exp:'RNA-seq counts are overdispersed (variance > mean). The Poisson distribution underfits this, inflating false positives. DESeq2\'s negative binomial model correctly estimates per-gene dispersion.' },
      { q:'What does kallisto do differently from HISAT2 + HTSeq?',
        opts:['kallisto aligns to the genome; HISAT2 to transcriptome','kallisto pseudoaligns to the transcriptome (10–100× faster); HISAT2 aligns to the genome then counts','They are identical tools','kallisto only works on mouse'], ans:1,
        exp:'kallisto uses pseudoalignment — reads are assigned to k-mer compatibility classes from a transcriptome index without full alignment. 10–100× faster than genome-based approaches with similar accuracy for well-annotated organisms.' },
      { q:'What read depth is recommended per sample for differential expression analysis?',
        opts:['1M reads','5M reads','20–30M paired-end reads','200M reads'], ans:2,
        exp:'20–30M paired-end reads per sample is standard for well-expressed genes. Rare transcripts may require 50–100M reads. Over-sequencing does not improve DE analysis for abundant transcripts.' }
    ],
    'scrna-seq': [
      { q:'What is the typical cell recovery target for 10x Chromium v3.1?',
        opts:['~100 cells','~500 cells','~3000–10000 cells','~100 000 cells'], ans:2,
        exp:'10x Chromium targets 3000–10000 cell recovery. Loading ~500 cells/µL targets ~3000–4000 captured cells. Over-loading increases doublet rate; under-loading wastes GEMs.' },
      { q:'What is the biggest technical artefact in scRNA-seq data?',
        opts:['Too many reads per cell','Ambient RNA contamination and doublets','Too few PCR cycles','Insufficient adapter ligation'], ans:1,
        exp:'Ambient RNA (from lysed cells) contaminates droplets — corrected by SoupX. Doublets (two cells per droplet) appear as hybrid transcriptomes with unusually high gene counts — detected by DoubletFinder.' },
      { q:'Which dimensionality reduction is used for scRNA-seq visualisation?',
        opts:['PCA alone','UMAP or t-SNE after PCA reduction to ~30 PCs','GATK HaplotypeCaller','STAR aligner'], ans:1,
        exp:'PCA reduces to ~30 PCs; then UMAP or t-SNE creates a 2D embedding where clusters correspond to cell types. UMAP is now preferred over t-SNE for preserving global structure.' },
      { q:'What does Seurat\'s FindMarkers compute?',
        opts:['Read alignment statistics','Differentially expressed genes between cell clusters','Doublet detection scores','Cell cycle phase assignment'], ans:1,
        exp:'FindMarkers identifies genes significantly upregulated in one cluster vs another. Marker genes annotate cell types (e.g., CD3E = T cells, CD19 = B cells). Uses Wilcoxon rank-sum by default.' },
      { q:'What distinguishes 10x Chromium v3.1 from v2?',
        opts:['v3.1 uses longer barcodes','v3.1 is cheaper per cell','v3.1 detects ~3× more genes per cell with improved UMI capture','v2 and v3.1 are identical'], ans:2,
        exp:'v3.1 detects ~3000–5000 genes/cell vs ~1500–2000 in v2, due to improved bead chemistry and capture efficiency. v3.1 also reduces cell-to-cell variability in UMI counts.' }
    ],
    'atac-seq': [
      { q:'What does ATAC-seq directly measure?',
        opts:['mRNA expression','Protein-DNA interactions','Chromatin accessibility (open vs closed regions)','DNA methylation'], ans:2,
        exp:'ATAC-seq uses Tn5 transposase to insert sequencing adapters into accessible (nucleosome-free) chromatin regions, generating a genome-wide map of open chromatin at promoters and enhancers.' },
      { q:'What fragment size class represents active regulatory elements in ATAC-seq?',
        opts:['NFR fragments <150 bp (nucleosome-free regions)','Mono-nucleosome fragments 150–300 bp','Di-nucleosome fragments >300 bp','All fragment sizes equally'], ans:0,
        exp:'NFR (<150 bp) fragments correspond to active regulatory regions where nucleosomes are displaced — promoters, enhancers, and CTCF sites. Mono-nucleosomal fragments (150–300 bp) mark positioned nucleosomes at regulatory elements.' },
      { q:'What Tn5 shift correction is needed for TF footprinting in ATAC-seq?',
        opts:['No shift needed','+4 bp (+ strand) and −5 bp (− strand) to centre on the cut site','−4 bp and +5 bp','±10 bp random shift'], ans:1,
        exp:'Tn5 inserts adapters with a 9-bp stagger. To identify the precise insertion site for TF footprinting, read starts are shifted +4 bp on the + strand and −5 bp on the − strand.' },
      { q:'Which tool calls peaks from ATAC-seq data?',
        opts:['STAR','MACS3','GATK HaplotypeCaller','kallisto'], ans:1,
        exp:'MACS3 (Model-based Analysis of ChIP-seq/ATAC-seq) models the fragment size distribution to identify enriched regions above background. It is the standard peak caller for both ATAC-seq and ChIP-seq.' },
      { q:'What cell input is needed for bulk ATAC-seq?',
        opts:['10 cells','500–50 000 cells','10 million cells','1 billion cells'], ans:1,
        exp:'Bulk ATAC-seq works with 500–50 000 cells. Fewer cells reduce signal-to-noise. OMNI-ATAC (detergent lysis) works better with frozen cells. Single-nucleus ATAC (snATAC-seq) extends this to frozen tissue.' }
    ],
    'chip-seq': [
      { q:'What is the most critical quality step in ChIP-seq?',
        opts:['Choosing the sequencer','Antibody validation for ChIP specificity','PCR cycles','Fragment size selection'], ans:1,
        exp:'The antibody determines everything. A non-specific antibody produces random signal with no real peaks. ChIP-grade antibodies must be validated by Western blot and ideally by ChIP-qPCR at known positive loci.' },
      { q:'What chromatin fragment size is recommended for ChIP-seq?',
        opts:['50–100 bp','200–500 bp','1–5 kb','10–20 kb'], ans:1,
        exp:'200–500 bp chromatin fragments give optimal resolution for most histone marks. Too large (~1 kb) reduces peak resolution; too small (<100 bp) reduces immunoprecipitation efficiency.' },
      { q:'What does the input control correct for in ChIP-seq analysis?',
        opts:['PCR errors','Regional copy number variation, mappability bias, and background enrichment','Adapter contamination','Index hopping'], ans:1,
        exp:'The input control (chromatin without IP) accounts for regional CNV, mappability biases, and background. MACS3 subtracts input from ChIP signal to identify true binding sites.' },
      { q:'Which histone mark is the canonical marker of active gene promoters?',
        opts:['H3K27me3 (Polycomb silencing)','H3K9me3 (heterochromatin)','H3K4me3 (active promoters)','H3K36me2 (gene bodies)'], ans:2,
        exp:'H3K4me3 (trimethylation of histone H3 lysine 4) marks active promoters. Deposited by the COMPASS complex, it is among the most studied epigenetic marks in cancer, development, and differentiation.' },
      { q:'What does spike-in normalisation enable in ChIP-seq?',
        opts:['Correcting PCR duplicates','Quantitative comparison of absolute histone modification levels across conditions','Removing adapter sequences','Calibrating sequencing depth'], ans:1,
        exp:'Drosophila chromatin spike-ins allow absolute quantification of histone mark changes between conditions. Without spike-ins, changes in IP efficiency between samples mask real biological differences in histone levels.' }
    ],
    'shotgun-meta': [
      { q:'What key advantage does shotgun metagenomics have over 16S amplicon sequencing?',
        opts:['Lower cost per sample','Functional gene profiling and true species-level resolution','Requires less DNA','Works with archival samples'], ans:1,
        exp:'Shotgun metagenomics sequences all DNA — giving functional information (AMR genes, metabolic pathways) and true species-level resolution. 16S only targets a marker gene and cannot detect non-bacterial organisms.' },
      { q:'Why is host depletion important in shotgun metagenomics of human samples?',
        opts:['To improve library quality','Human reads dominate (>90%) in most samples, wasting sequencing budget on non-microbial reads','Human DNA causes ligation failure','It is not important'], ans:1,
        exp:'In human stool, saliva, and tissue, >90% of reads map to the human genome. Without host depletion or reference-based removal, most sequencing budget is wasted on human reads rather than microbial content.' },
      { q:'What does HUMAnN3 compute from metagenomic data?',
        opts:['Taxonomic classification at genus level','Species-stratified pathway abundances from shotgun data','Viral genome assembly','Host alignment statistics'], ans:1,
        exp:'HUMAnN3 profiles the functional capacity of microbiomes from shotgun data — reporting which species contribute to which metabolic pathways (e.g., butyrate synthesis by specific bacteria).' },
      { q:'Which tool detects antibiotic resistance genes from metagenomes?',
        opts:['GATK HaplotypeCaller','RGI (CARD database) / ResFinder','Kallisto','MACS3'], ans:1,
        exp:'RGI (Resistance Gene Identifier) against the CARD database and ResFinder identify AMR genes from assembled or raw metagenomic reads — critical for AMR surveillance in African hospital and community settings.' },
      { q:'Which extraction kit is preferred for gut microbiome shotgun metagenomics?',
        opts:['DNeasy Blood & Tissue','PowerSoil Pro (Qiagen)','TRIzol (for RNA)','Phenol-chloroform (manual)'], ans:1,
        exp:'PowerSoil Pro uses mechanical bead-beating to lyse tough bacterial cell walls and fungal spores that column-only kits consistently miss — the gold standard for environmental and gut microbiome DNA extraction.' }
    ],
    '16s-amplicon': [
      { q:'What 16S variable region do the 515F/806R (Earth Microbiome Project) primers target?',
        opts:['V1–V2','V3–V4','V4 region only','V6–V8'], ans:2,
        exp:'515F/806R amplifies the V4 hypervariable region (~250 bp) — ideal for Illumina MiSeq 2×250 paired-end reads, with good bacterial taxonomy resolution and wide adoption across microbiome studies.' },
      { q:'What does DADA2 produce instead of OTUs?',
        opts:['Genome assemblies','Amplicon Sequence Variants (ASVs) at single-nucleotide resolution','Shotgun reads','Protein predictions'], ans:1,
        exp:'DADA2 uses a statistical error model to distinguish sequencing errors from true biological variation, producing ASVs — exact sequences reproducible across studies, unlike 97% OTUs which lump similar sequences.' },
      { q:'Why are 27F/1492R (full-length) primers NOT suitable for Illumina MiSeq?',
        opts:['They are too expensive','The ~1500 bp amplicon is too long for Illumina 2×250 reads to span','They only detect fungi','They require higher input DNA'], ans:1,
        exp:'MiSeq 2×250 can only span amplicons up to ~500 bp with paired-end overlap. Full-length 16S (~1500 bp) requires Nanopore MinION or PacBio for complete coverage.' },
      { q:'What is the main limitation of 16S rRNA amplicon sequencing?',
        opts:['It is more expensive than shotgun','No functional information, genus-level resolution only, primer amplification bias','It requires more DNA input','It cannot detect bacteria'], ans:1,
        exp:'16S provides only taxonomic composition (typically genus-level), cannot profile functional genes, and has primer bias — some bacteria are consistently over- or under-represented with any primer pair.' },
      { q:'Which database is the primary reference for 16S taxonomic classification?',
        opts:['RefSeq','SILVA (ribosomal RNA sequence database)','gnomAD','CARD'], ans:1,
        exp:'SILVA contains >2M curated rRNA sequences and is the standard reference for 16S taxonomy. GTDB-Tk is increasingly used for shotgun metagenomics due to its phylogenomically consistent naming system.' }
    ],
    'lc-ms': [
      { q:'What internal standard is essential for metabolomics quantification?',
        opts:['External calibration only','Stable isotope-labelled internal standards (13C or 2H-labelled)','No standard if using HILIC','BSA protein standard'], ans:1,
        exp:'Stable isotope-labelled internal standards (deuterated or 13C-labelled metabolites) correct for matrix effects, injection volume variation, and ionisation suppression — without them, quantification is semi-quantitative at best.' },
      { q:'Why is HILIC chromatography used in metabolomics alongside reverse-phase C18?',
        opts:['HILIC is faster','HILIC retains polar metabolites (amino acids, nucleotides) that elute in the void volume on C18','HILIC is cheaper','HILIC gives sharper peaks for lipids'], ans:1,
        exp:'Reversed-phase C18 does not retain highly polar metabolites. HILIC uses a water-enriched stationary phase to retain polar compounds — together C18 + HILIC give broader metabolome coverage.' },
      { q:'What does XCMS do in an untargeted metabolomics pipeline?',
        opts:['Calls variants from metabolomics data','Peak detection, retention time alignment, and feature grouping across samples','Statistical differential testing','Metabolite ID by MS/MS matching'], ans:1,
        exp:'XCMS performs chromatographic peak picking, retention time alignment across samples, and feature grouping — producing a data matrix of m/z × retention time features with intensities for downstream analysis.' },
      { q:'What m/z tolerance is standard for Orbitrap metabolite identification?',
        opts:['±500 ppm','±50 ppm','±5 ppm','±0.5 Da (unit mass)'], ans:2,
        exp:'Orbitrap instruments achieve <5 ppm mass accuracy, allowing confident molecular formula assignment from HMDB or METLIN within ±5 ppm. Unit mass resolution (±0.5 Da) only allows targeted known-compound analysis.' },
      { q:'Which database is the primary resource for human metabolite identification?',
        opts:['gnomAD','HMDB (Human Metabolome Database)','SILVA','CARD'], ans:1,
        exp:'HMDB contains >220 000 metabolite entries with MS/MS spectra, SMILES structures, pathway annotations, and disease associations. Combined with METLIN and MassBank, it forms the core metabolomics annotation infrastructure.' }
    ],
    'proteomics': [
      { q:'Why is trypsin the preferred protease for bottom-up proteomics?',
        opts:['It is cheapest','It cleaves at K/R — producing peptides in the 700–2500 Da range ideal for MS/MS','It works in any buffer','It requires no reduction/alkylation'], ans:1,
        exp:'Trypsin cleaves C-terminal to lysine (K) and arginine (R), producing peptides with a basic C-terminal residue that ionises well by ESI-MS. The resulting size range (700–2500 Da) falls in the optimal Orbitrap MS/MS window.' },
      { q:'What is the role of DTT in proteomics sample preparation?',
        opts:['It digests proteins','It reduces disulphide bonds to allow unfolding and alkylation','It precipitates contaminants','It labels cysteine for quantification'], ans:1,
        exp:'DTT breaks disulphide bonds between cysteines. After reduction, iodoacetamide (IAA) alkylates the free thiols to prevent re-oxidation — both steps are required before trypsin digestion for complete sequence coverage.' },
      { q:'What is data-independent acquisition (DIA)?',
        opts:['Only the most abundant peptides are fragmented — better for focused studies','All precursors in predefined m/z windows are fragmented systematically — more complete than stochastic DDA','DIA skips the MS2 scan','DIA and DDA are identical'], ans:1,
        exp:'DIA/SWATH cycles through predefined isolation windows (e.g., 25 Da), fragmenting ALL peptides in each window. Unlike DDA (which stochastically picks top-N peaks), DIA gives complete, reproducible quantification across all samples.' },
      { q:'What does MaxQuant LFQ compute?',
        opts:['Fragment ion peak areas','Label-free protein quantification intensities with cross-run normalisation','Peptide sequences from MS2','False discovery rate'], ans:1,
        exp:'MaxLFQ (Label-Free Quantification) in MaxQuant normalises peptide intensities using a delayed normalisation strategy, producing protein-level intensities stable across a large dynamic range — the standard for label-free proteomics.' },
      { q:'Which PTM is most studied in cancer signalling proteomics?',
        opts:['N-glycosylation','Phosphorylation (especially tyrosine phosphorylation by RTKs)','SUMOylation','Acetylation of tRNA'], ans:1,
        exp:'Phosphorylation by receptor tyrosine kinases (EGFR, HER2, VEGFR) regulates virtually every cancer signalling pathway. Phosphoproteomics with TiO2 or IMAC enrichment maps dysregulated signalling in tumours.' }
    ],
    'viral-wgs': [
      { q:'What Ct value indicates sufficient viral RNA for ARTIC amplicon sequencing?',
        opts:['Ct > 35','Ct < 30','Ct = 40','Ct < 10 only'], ans:1,
        exp:'Ct < 30 indicates sufficient viral load for ARTIC amplicon sequencing. Samples with Ct > 35 have very low RNA, producing poor amplicon coverage and inflated false SNP rates.' },
      { q:'Which sequencer gives genome results in <12 hours for outbreak genomics?',
        opts:['Illumina NovaSeq 6000','PacBio Revio','Oxford Nanopore MinION','Ion Torrent PGM'], ans:2,
        exp:'The MinION generates data in real time — viral genomes can be assembled within 6–12 hours. This enabled real-time SARS-CoV-2 surveillance during COVID-19 and has been deployed for Ebola, Lassa, and Mpox outbreaks.' },
      { q:'What is the ARTIC protocol designed for?',
        opts:['Whole human genome sequencing','Tiled amplicon sequencing of RNA viruses','16S microbiome profiling','ChIP-seq of viral chromatin'], ans:1,
        exp:'The ARTIC protocol uses overlapping primer pools to generate tiled amplicons across an entire viral genome. Developed for Zika, it was adapted for SARS-CoV-2 v4.1, Ebola, Mpox, dengue, and other RNA viruses.' },
      { q:'What does Nextclade do in a viral genomics pipeline?',
        opts:['Assembles raw reads into contigs','Assigns sequences to clades/lineages and identifies amino acid mutations vs reference','Filters low-quality reads','Calculates sequencing depth per position'], ans:1,
        exp:'Nextclade (Nextstrain) aligns viral sequences, identifies amino acid changes and QC issues, and assigns sequences to phylogenetic clades — essential for SARS-CoV-2 variant (Omicron, Delta) and emerging pathogen surveillance.' },
      { q:'Why is H3Africa critical for viral outbreak genomics in Africa?',
        opts:['It provides free sequencing reagents to all labs','It built ethical frameworks and genomic infrastructure across 30+ African countries enabling coordinated outbreak response','It created the ARTIC protocol','It funds only malaria genomics'], ans:1,
        exp:'H3Africa established biobanks, data-sharing platforms, and sequencing capacity across >30 African nations — making real-time, coordinated outbreak genomics (COVID-19, Ebola, Mpox) possible where it previously was not.' }
    ],
    'cite-seq': [
      { q:'What does CITE-seq simultaneously measure?',
        opts:['DNA and RNA','Surface protein markers (ADT) and mRNA transcriptome at single-cell resolution','Chromatin and RNA','Metabolites and RNA'], ans:1,
        exp:'CITE-seq uses antibodies conjugated to DNA barcodes (TotalSeq). During 10x Chromium capture, both mRNA and antibody-derived tags (ADTs) are barcoded simultaneously — giving protein + transcriptome per cell.' },
      { q:'What is the main advantage of CITE-seq over flow cytometry?',
        opts:['CITE-seq is cheaper','CITE-seq provides genome-wide transcriptome alongside protein markers','CITE-seq works with fixed cells','CITE-seq does not require antibodies'], ans:1,
        exp:'Flow cytometry measures only surface proteins (typically 10–50 markers). CITE-seq simultaneously captures the full transcriptome (~20 000 genes) plus up to 300+ protein markers, enabling marker-validated transcriptomic cell-type annotation.' },
      { q:'What does Seurat\'s Weighted Nearest Neighbour (WNN) do in CITE-seq analysis?',
        opts:['It aligns reads to the genome','It learns the relative contribution of RNA vs protein to each cell\'s neighbourhood and integrates both modalities','It calls variants from single cells','It detects doublets'], ans:1,
        exp:'WNN in Seurat v4+ learns per-cell weights for RNA and ADT modalities, building an integrated neighbourhood graph. This improves cell-type identification compared to using either modality alone.' },
      { q:'Why is TotalSeq-B preferred over TotalSeq-A for 10x Chromium CITE-seq?',
        opts:['TotalSeq-B is cheaper','TotalSeq-B oligos have poly-A tails compatible with 10x capture beads; TotalSeq-A requires custom workflow','TotalSeq-B has more antibodies','They are identical'], ans:1,
        exp:'TotalSeq-B antibody-oligo conjugates are specifically designed for 10x Chromium — the ADT oligos use the same poly-A capture mechanism as mRNA. TotalSeq-A is designed for BD Rhapsody systems.' },
      { q:'What cell type is identified by CD3E (mRNA) + CD3 (ADT) co-expression in CITE-seq?',
        opts:['B cells (CD19+)','T cells (CD3+)','NK cells (CD56+)','Dendritic cells (CD11c+)'], ans:1,
        exp:'CD3E (CD3 epsilon) is specific to T cell receptor complex components expressed on T cells. Concordance between CD3E mRNA and CD3 ADT protein provides high-confidence T cell identification — a key multimodal validation advantage of CITE-seq.' }
    ],
    'rt-qpcr': [
      { q:'What does the Cq value represent in qPCR?',
        opts:['Total PCR cycles run','The fractional cycle at which fluorescence crosses threshold — inversely proportional to starting quantity','Number of PCR errors','Primer melting temperature'], ans:1,
        exp:'Cq (also Ct or Cp) is the cycle number where amplification crosses an automated threshold. Each 3.32 Cq difference = 10-fold difference in starting copy number (assuming 100% amplification efficiency).' },
      { q:'What acceptable qPCR efficiency range is defined by MIQE guidelines?',
        opts:['Any efficiency','90–110% (some allow 80–120%)','Exactly 100% only','50–60%'], ans:1,
        exp:'MIQE guidelines specify 90–110% efficiency (slope −3.1 to −3.6 on a standard curve). Efficiency <80% indicates inhibition or poor primer design; >120% suggests non-specific amplification or primer dimers.' },
      { q:'Why is SYBR Green problematic with primer dimers?',
        opts:['Primer dimers inhibit polymerase','SYBR Green intercalates ALL dsDNA including primer dimers — causing false-positive signal at low Cq','Primer dimers block adapter ligation','Primer dimers reduce buffer volume'], ans:1,
        exp:'SYBR Green is non-specific — it intercalates any double-stranded DNA. Primer dimers produce dsDNA that generates signal, appearing as false amplification at low Cq. A melt curve (single peak = specific product) is mandatory.' },
      { q:'What does the 2^(−ΔΔCq) method calculate?',
        opts:['Absolute copy number per reaction','Relative fold change in expression between treatment and control groups','Primer efficiency coefficient','DNA concentration in ng/µL'], ans:1,
        exp:'2^(−ΔΔCq) = fold change: ΔΔCq = (Cq_target − Cq_ref)_treated − (Cq_target − Cq_ref)_control. Assumes equal primer efficiencies; if not, use the Pfaffl method with individual efficiency correction.' },
      { q:'Which reference genes are recommended for RT-qPCR normalisation?',
        opts:['Any single housekeeping gene','At least 2–3 validated stable reference genes (e.g., GAPDH, ACTB, HPRT1 — validated by geNorm)','The gene of interest itself','No reference gene if using absolute quantification'], ans:1,
        exp:'MIQE guidelines recommend ≥2 validated reference genes. GAPDH and ACTB can vary with hypoxia and cytoskeletal stimuli respectively. geNorm or NormFinder should be used to identify the most stable pair for your experimental conditions.' }
    ],
    'ampli-seq': [
      { q:'What is the main advantage of targeted amplicon panels over WGS in oncology?',
        opts:['Panels sequence more of the genome','Deep sequencing (>500×) of cancer hotspots at a fraction of WGS cost, detecting low-VAF variants','Panels work for all variant types including SVs','WGS cannot detect mutations'], ans:1,
        exp:'Targeted panels achieve >500× depth on cancer gene hotspots at dramatically lower cost. High depth detects somatic mutations at 1–5% VAF — critical for liquid biopsy ctDNA detection and tumour monitoring.' },
      { q:'What minimum VAF can targeted panels reliably detect with UMI error correction?',
        opts:['50% VAF (germline only)','1–5% VAF at ≥500× depth with UMIs','0.001% VAF','VAF > 20% only'], ans:1,
        exp:'At ≥500× depth with Unique Molecular Identifiers (UMIs) to collapse PCR errors, panels reliably detect variants at 1–5% VAF — enabling plasma ctDNA detection for minimal residual disease monitoring.' },
      { q:'What is a Unique Molecular Identifier (UMI)?',
        opts:['A sample demultiplexing barcode','A random tag added before PCR — allows PCR duplicates to be distinguished from true rare variants','A Phred quality score','An antibody barcode for CITE-seq'], ans:1,
        exp:'UMIs are short random sequences (6–12 bp) ligated to each original molecule before PCR. Reads from the same UMI family are collapsed, distinguishing true variants (multiple input copies) from PCR/sequencing errors (single copy).' },
      { q:'Why does FFPE DNA work well with short amplicon panels?',
        opts:['FFPE DNA is higher molecular weight','Short amplicons (<200 bp) capture intact template from fragmented FFPE DNA that would fail long-range WGS','FFPE has less contamination','FFPE panels are cheaper'], ans:1,
        exp:'Formalin fixation fragments DNA over time to <300 bp. Short amplicons (<200 bp) in FFPE-compatible kits capture intact template fragments — while WGS requires long HMW DNA that FFPE cannot provide reliably.' },
      { q:'Which databases are used to interpret somatic oncology mutations?',
        opts:['SILVA + HMDB','OncoKB and COSMIC','gnomAD only','CARD (AMR database)'], ans:1,
        exp:'OncoKB provides actionability levels (Levels 1–4: FDA-approved to preclinical) for cancer mutations. COSMIC documents every known cancer somatic mutation with frequency across tumour types — together they are the standard for oncology variant interpretation.' }
    ]
  };

  const FALLBACK = [
    { q:'What does QC stand for in an omics workflow?',
      opts:['Quick Count','Quality Control','Quantitative Calibration','Qubit Concentration'], ans:1,
      exp:'Quality Control verifies that samples, libraries, and sequencing runs meet the standards required for reliable downstream analysis. Skipping QC is the most common cause of failed omics experiments.' },
    { q:'Why is RIN score important for RNA-based workflows?',
      opts:['It measures DNA concentration','It measures RNA integrity (1–10 scale) — low RIN indicates degraded RNA','It is a sequencing quality score','It measures library complexity'], ans:1,
      exp:'RIN (RNA Integrity Number) from the Bioanalyzer predicts RNA quality. RIN < 6 means significant degradation, leading to 3′ bias, reduced gene detection, and unreliable differential expression results.' },
    { q:'What does Q30 measure in Illumina sequencing output?',
      opts:['Library complexity','% of bases with Phred quality ≥ 30 (99.9% base call accuracy)','Alignment rate to reference','Duplication percentage'], ans:1,
      exp:'Q30 = the % of bases the sequencer is ≥99.9% confident about. Q30 > 75% is the standard acceptable threshold for a sequencing run. Drops in Q30 indicate flow cell or chemistry issues.' },
    { q:'What does high PCR duplication rate indicate about a library?',
      opts:['Excellent amplification','Overamplification — fewer unique molecules than reads, reducing variant calling sensitivity','Ideal primer design','High fragment diversity'], ans:1,
      exp:'PCR duplicates are identical reads from the same original molecule. High duplication (>15% in WGS) reduces independent observations, impairing coverage uniformity and variant calling sensitivity.' },
    { q:'Which aligner is the standard for DNA short-read alignment to a reference genome?',
      opts:['DESeq2','BWA-MEM2 (for DNA) or STAR (for RNA)','DADA2','MaxQuant'], ans:1,
      exp:'BWA-MEM2 (for genomic DNA) and STAR (for RNA-seq) are the gold-standard short-read aligners. They map sequencing reads to a reference genome — a prerequisite for variant calling, expression quantification, and peak calling.' }
  ];

  let _state = null;

  function start(wfId) {
    const qs = (QUESTIONS[wfId] || FALLBACK).slice();
    _state = { wfId, qs, idx:0, score:0 };
    _renderQ();
  }

  function _renderQ() {
    const box = document.getElementById('results-content');
    if (!box || !_state) return;
    const { qs, idx, wfId } = _state;
    const q = qs[idx];
    const wf = OmicsLab.Workflows[wfId] || {};
    box.innerHTML = `
      <div class="quiz-wrap">
        <div class="quiz-header">
          <div class="quiz-title">${OmicsLab.Icons ? OmicsLab.Icons.svg('help-circle',18)+' ' : ''}Quiz — ${wf.name || 'OmicsLab'}</div>
          <div class="quiz-progress">Question ${idx+1} / ${qs.length}</div>
        </div>
        <div class="quiz-q-text">${q.q}</div>
        <div class="quiz-opts">
          ${q.opts.map((o,i)=>`<button class="quiz-opt" onclick="OmicsLab.Quiz._answer(${i})">${o}</button>`).join('')}
        </div>
        <div class="quiz-footer">
          <button class="btn-result-secondary" onclick="OmicsLab.App.showResults()">← Exit Quiz</button>
        </div>
      </div>`;
  }

  function _answer(chosen) {
    if (!_state) return;
    const q = _state.qs[_state.idx];
    const correct = chosen === q.ans;
    if (correct) _state.score++;
    const opts = q.opts.map((o,i) => {
      const cls = i === q.ans ? 'quiz-opt correct' : (i === chosen && !correct ? 'quiz-opt wrong' : 'quiz-opt neutral');
      return `<button class="${cls}" disabled>${o}</button>`;
    }).join('');
    const { qs, idx, wfId } = _state;
    const isLast = idx === qs.length - 1;
    const wf = OmicsLab.Workflows[wfId] || {};
    const box = document.getElementById('results-content');
    if (!box) return;
    box.innerHTML = `
      <div class="quiz-wrap">
        <div class="quiz-header">
          <div class="quiz-title">${OmicsLab.Icons ? OmicsLab.Icons.svg('help-circle',18)+' ' : ''}Quiz — ${wf.name || 'OmicsLab'}</div>
          <div class="quiz-progress">Question ${idx+1} / ${qs.length}</div>
        </div>
        <div class="quiz-q-text">${q.q}</div>
        <div class="quiz-opts">${opts}</div>
        <div class="quiz-explanation ${correct?'quiz-exp-correct':'quiz-exp-wrong'}">
          <strong>${correct ? '✓ Correct!' : '✗ Incorrect'}</strong> — ${q.exp}
        </div>
        <div class="quiz-footer">
          <button class="quiz-next-btn" onclick="${isLast?'OmicsLab.Quiz._showScore()':'OmicsLab.Quiz._next()'}">
            ${isLast ? 'See Score →' : 'Next Question →'}
          </button>
        </div>
      </div>`;
  }

  function _next() {
    if (!_state) return;
    _state.idx++;
    _renderQ();
  }

  function _showScore() {
    if (!_state) return;
    const { score, qs, wfId } = _state;
    const pct = Math.round(score / qs.length * 100);
    const letter = pct >= 80 ? 'A' : pct >= 60 ? 'B' : pct >= 40 ? 'C' : 'D';
    const msg = pct >= 80 ? 'Expert-level knowledge!' : pct >= 60 ? 'Good understanding of this workflow' : pct >= 40 ? 'Review the protocol notes and try again' : 'Work through the step explanations carefully';
    const box = document.getElementById('results-content');
    if (!box) return;
    box.innerHTML = `
      <div class="quiz-wrap">
        <div class="quiz-header"><div class="quiz-title">Quiz Complete!</div></div>
        <div class="quiz-score-ring grade-${letter}">${letter}</div>
        <div class="quiz-score-msg">${msg}</div>
        <div class="quiz-score-detail">${score} / ${qs.length} correct &nbsp;·&nbsp; ${pct}%</div>
        <div class="quiz-footer" style="gap:1rem;flex-wrap:wrap">
          <button class="quiz-next-btn" onclick="OmicsLab.Quiz.start('${wfId}')">Retry Quiz</button>
          <button class="btn-result-secondary" onclick="OmicsLab.App.showResults()">← Back to Results</button>
          <button class="btn-result-secondary" onclick="OmicsLab.App.goHome()">Choose Workflow</button>
        </div>
      </div>`;
    _state = null;
  }

  return { start, _answer, _next, _showScore };
})();
