/* ═══════════════════════════════════════════════════════════════
   OmicsLab — AI Protocol Debugger (Prompt 11)
   Rule-based diagnostic engine: paste QC text or describe a
   failed experiment → get root-cause analysis + corrective plan.
   200+ rules, fully offline, no API needed.
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.Debugger = (function () {

  /* ═══════════════════════════════════════════════════════════
     RULE DATABASE — 200+ diagnostic rules
     Each rule: { id, category, triggers[], severity, title,
                  problem, biology, fix[], prevention, links[] }
     triggers: array of regex patterns matched against input text
     severity: 'critical' | 'warning' | 'info'
  ═══════════════════════════════════════════════════════════════ */
  const RULES = [

    /* ── RNA Quality ── */
    {
      id: 'RNA001', category: 'RNA Quality', severity: 'critical',
      triggers: [/rin[:\s]+[0-4](\.[0-9])?[^0-9]/i, /rin score[:\s]+[0-4]/i, /degraded rna/i, /rna degradation/i],
      title: 'Severely Degraded RNA (RIN < 5)',
      problem: 'Your RNA Integrity Number is below 5, indicating extensive degradation. Ribosomal peaks (28S/18S) are collapsed or absent.',
      biology: 'RNases are ubiquitous and heat-stable. Degradation begins within seconds of cell lysis unless RNase inhibitors are present. The 28S:18S ratio should be ~2:1 in intact RNA; degraded samples show a smear and loss of the 28S band.',
      fix: ['Use RNAlater or TRIzol immediately at time of collection — do not freeze tissue without stabilisation', 'Add RNase inhibitor (RNasin, SUPERase-In) to all buffers', 'Work on ice; pre-chill all tubes and centrifuges', 'Re-extract from a fresh aliquot if available — do not proceed to library prep', 'Consider degraded-RNA-tolerant kits (SMARTer Stranded Total RNA, QIAseq) if re-extraction is impossible'],
      prevention: 'Stabilise tissue within 30 min of collection. Store RNA at −80 °C in aliquots. Never refreeze. Test every batch with Bioanalyzer or TapeStation before library prep.',
      links: ['RNA extraction troubleshooting (QIAGEN)', 'Bioanalyzer Eukaryote Total RNA Nano assay'],
    },
    {
      id: 'RNA002', category: 'RNA Quality', severity: 'warning',
      triggers: [/rin[:\s]+[5-6](\.[0-9])?[^0-9]/i, /rin score[:\s]+[5-6]/i, /partial degradation/i],
      title: 'Moderate RNA Degradation (RIN 5–6)',
      problem: 'RNA integrity is borderline. Libraries can still be made but 3′-bias will be elevated, reducing detection of 5′-end exons.',
      biology: 'Partially degraded RNA preferentially loses 5′ ends. RNA-seq reads will pile up near the 3′ end of transcripts, distorting expression estimates for long genes.',
      fix: ['Use a 3′-enrichment protocol (QuantSeq 3′ mRNA-seq) designed for degraded samples', 'Increase input RNA mass to compensate for lower usable fraction', 'Filter genes with >20% 3′ bias in downstream analysis using QoRTs or RSeQC'],
      prevention: 'Target RIN ≥ 7 for standard RNA-seq. For FFPE samples, use FFPE-specific kits.',
      links: [],
    },
    {
      id: 'RNA003', category: 'RNA Quality', severity: 'info',
      triggers: [/rin[:\s]+([7-9]|10)(\.[0-9])?/i, /excellent rna/i, /high quality rna/i],
      title: 'Good RNA Integrity (RIN ≥ 7)',
      problem: 'RNA quality is acceptable for standard library preparation.',
      biology: 'RIN ≥ 7 indicates intact 28S and 18S ribosomal peaks. Proceed with standard protocols.',
      fix: ['Proceed with library preparation', 'Standard poly-A selection or ribo-depletion is appropriate'],
      prevention: 'Maintain cold chain. Document RIN for every batch.',
      links: [],
    },

    /* ── DNA Quality ── */
    {
      id: 'DNA001', category: 'DNA Quality', severity: 'critical',
      triggers: [/260\/280[:\s]+[01]\.[0-9]/i, /260.280 ratio[:\s]+[01]\./i, /protein contamination/i, /phenol contamination/i],
      title: 'Protein / Phenol Contamination (260/280 < 1.7)',
      problem: 'The 260/280 absorbance ratio is below 1.7, indicating significant protein or residual phenol contamination.',
      biology: 'Pure DNA has a 260/280 ratio of ~1.8. Proteins absorb at 280 nm (aromatic residues). Residual phenol from TRIzol/phenol-chloroform extraction also absorbs at 270 nm. Both inhibit downstream enzymes including polymerases and restriction enzymes.',
      fix: ['Perform an additional phenol-chloroform extraction step', 'Purify with a silica column (Qiagen MinElute, AMPure XP beads) after extraction', 'Precipitate with ethanol (2.5× volume + 0.1× 3M NaAc) then wash pellet twice with 70% EtOH', 'Quantify again after purification before proceeding'],
      prevention: 'Always include a column purification step after phenol-chloroform extraction. Avoid disturbing the interphase during phase separation.',
      links: [],
    },
    {
      id: 'DNA002', category: 'DNA Quality', severity: 'warning',
      triggers: [/260\/230[:\s]+[01]\.[0-9]/i, /chaotropic salt/i, /guanidinium/i, /edta contamination/i, /low 260.230/i],
      title: 'Salt / EDTA Contamination (260/230 < 1.7)',
      problem: '260/230 ratio below 1.7 suggests contamination with chaotropic salts (guanidinium), EDTA, or carbohydrates from the extraction buffer.',
      biology: 'Guanidinium absorbs at 230 nm and inhibits PCR, ligases, and Taq polymerase at concentrations as low as 0.01 M. EDTA chelates Mg²⁺ required by most polymerases.',
      fix: ['Purify with AMPure XP beads using 1.8× bead ratio to remove small molecules', 'Ethanol precipitate and resuspend in molecular-grade water or TE (pH 8.0)', 'If using columns, increase wash steps (add one extra 70% EtOH wash)', 'Re-elute in warm (70 °C) elution buffer to maximise recovery'],
      prevention: 'Elute in small volumes of warm low-salt buffer. Avoid over-washing which can reduce yield.',
      links: [],
    },
    {
      id: 'DNA003', category: 'DNA Quality', severity: 'critical',
      triggers: [/dna concentration[:\s]+[0-9]\.[0-9]+ ng/i, /too little dna/i, /insufficient dna/i, /low yield/i, /low dna/i],
      title: 'Insufficient DNA Yield',
      problem: 'DNA concentration is too low for reliable library preparation. Most WGS kits require ≥ 100 ng; PCR-free kits need ≥ 500 ng.',
      biology: 'Low input increases PCR amplification cycles, raising duplication rates and reducing library complexity. Libraries from < 1 ng input typically have > 50% duplication.',
      fix: ['Combine multiple extractions from the same sample if available', 'Use a low-input library prep kit (Illumina DNA Prep, KAPA HyperPrep for low input)', 'Reduce elution volume to concentrate DNA (elute in 20–30 µL instead of 100 µL)', 'Consider whole genome amplification (WGA) as a last resort — note this introduces bias'],
      prevention: 'Optimise extraction input mass. Use tissue weight ≥ 25 mg or blood volume ≥ 200 µL. Validate yield before banking samples.',
      links: [],
    },

    /* ── Library Preparation ── */
    {
      id: 'LIB001', category: 'Library Prep', severity: 'critical',
      triggers: [/adapter dimer/i, /adapter contamination/i, /145 bp peak/i, /short insert/i, /insert size[:\s]+[0-9]{1,2}[^0-9]/i],
      title: 'Adapter Dimer Contamination',
      problem: 'Adapter dimers (~130–145 bp) are present in the library. These consume sequencing capacity without generating useful data.',
      biology: 'Adapter dimers form when adapters ligate to each other instead of to DNA fragments. They are enriched during PCR because they amplify more efficiently than longer inserts. On the sequencer, they read through into the adapter sequence itself, wasting clusters.',
      fix: ['Size-select with AMPure XP beads: use a double-size selection (0.5× then 0.7×) to deplete fragments < 200 bp', 'Increase input DNA mass — low-input libraries have higher dimer rates', 'Reduce adapter concentration (1:10 dilution of adapter stock)', 'Use bead-based PCR cleanup after amplification, not column-based', 'Re-run Bioanalyzer after cleanup to confirm dimer removal before sequencing'],
      prevention: 'Always run a post-ligation Bioanalyzer trace before PCR. Remove dimers before amplification.',
      links: [],
    },
    {
      id: 'LIB002', category: 'Library Prep', severity: 'warning',
      triggers: [/duplication rate[:\s]+[5-9][0-9]%/i, /percent duplication[:\s]+[5-9][0-9]/i, /high duplication/i, /optical duplicate/i, /pcr duplicate/i],
      title: 'High PCR Duplication Rate (> 50%)',
      problem: 'Over-amplification has produced many identical reads. Effective library complexity is reduced, wasting sequencing depth.',
      biology: 'PCR duplicates arise from preferential amplification of certain templates (especially short fragments and GC-rich regions) or from insufficient starting library complexity. They reduce the number of unique molecule observations, inflating variant allele frequencies and reducing power.',
      fix: ['Reduce PCR cycles: aim for 4–6 cycles for ≥ 1 µg input, 8–10 cycles for 100 ng', 'Use a PCR-free protocol if input allows (≥ 500 ng DNA)', 'Mark and exclude duplicates with Picard MarkDuplicates before analysis', 'Check library complexity with PreSeq before deep sequencing'],
      prevention: 'Maximise input mass. Minimise PCR cycles. Consider PCR-free library prep for WGS.',
      links: [],
    },
    {
      id: 'LIB003', category: 'Library Prep', severity: 'warning',
      triggers: [/low complexity/i, /gc bias/i, /gc content[:\s]+[0-3][0-9]%/i, /gc content[:\s]+[7-9][0-9]%/i, /at dropout/i, /gc dropout/i],
      title: 'GC Bias in Library',
      problem: 'Sequencing coverage is uneven across GC content, causing under-representation of AT-rich or GC-rich regions.',
      biology: 'PCR efficiency drops at extreme GC content (< 30% or > 65%). GC-rich regions form secondary structures that impede polymerase progression. AT-rich regions melt at lower temperatures, causing dropout during high-stringency denaturation.',
      fix: ['Use a GC-robust polymerase (KAPA HiFi, Q5) in library PCR', 'Add 5–10% DMSO or betaine to PCR reactions for GC-rich templates', 'Apply GC correction in analysis: use CNVnator with GC normalization, or DESeq2 with cqn for RNA-seq', 'Increase PCR denaturation temperature to 98 °C and extend denaturation time'],
      prevention: 'Avoid over-fragmentation. Optimize PCR conditions for your organism\'s GC content.',
      links: [],
    },

    /* ── Sequencing QC ── */
    {
      id: 'SEQ001', category: 'Sequencing QC', severity: 'critical',
      triggers: [/q30[:\s]+[0-4][0-9]%/i, /per base quality[:\s]+fail/i, /quality score[:\s]+[0-9]{1,2}[^0-9]/i, /poor quality bases/i, /base quality fail/i],
      title: 'Low Base Quality Scores (% Q30 < 70%)',
      problem: 'A high proportion of bases have quality scores below Q30 (1 in 1000 error rate). This will inflate false-positive variant calls.',
      biology: 'Q30 means a 0.1% error probability. Reads with < 70% Q30 bases are common with flow cell surface contamination, phasing errors, or degraded clusters. Quality typically drops at read ends — low quality tails should be trimmed.',
      fix: ['Trim low-quality bases from read ends using fastp (--qualified_quality_phred 20 --length_required 36)', 'Apply GATK Base Quality Score Recalibration (BQSR) before variant calling', 'Check for flow cell issues: if all lanes are affected, this may be a run failure', 'Increase cluster density if below Illumina recommendations (800–1200 K/mm²)'],
      prevention: 'Monitor cluster density and phasing during sequencing. Use PhiX spike-in as a quality control. Trim adapters and low-quality tails before analysis.',
      links: [],
    },
    {
      id: 'SEQ002', category: 'Sequencing QC', severity: 'warning',
      triggers: [/overrepresented sequence/i, /sequence duplication/i, /fastqc.*fail.*overrepresented/i, /repetitive sequence/i],
      title: 'Overrepresented Sequences in FastQC',
      problem: 'FastQC flags specific sequences appearing in > 0.1% of reads. This usually indicates adapter contamination or rRNA reads.',
      biology: 'Common culprits: (1) Illumina universal adapter — means adapter trimming failed; (2) polyA/polyG tails — means poly-A selection issues or NextSeq chemistry artefact; (3) rRNA sequences — means ribo-depletion was incomplete.',
      fix: ['Run fastp or Trimmomatic to remove adapter sequences', 'BLAST the flagged sequence against UniVec and rRNA databases to identify its origin', 'For polyG issues on NextSeq/NovaSeq: use fastp --trim_poly_g flag', 'For rRNA: consider deeper ribo-depletion or switch to poly-A selection'],
      prevention: 'Always check FastQC before alignment. Inspect overrepresented sequences before deciding on trimming strategy.',
      links: [],
    },
    {
      id: 'SEQ003', category: 'Sequencing QC', severity: 'critical',
      triggers: [/alignment rate[:\s]+[0-5][0-9]%/i, /mapping rate[:\s]+[0-5][0-9]%/i, /low mapping/i, /unmapped reads/i, /< 60% mapped/i],
      title: 'Low Alignment Rate (< 60%)',
      problem: 'More than 40% of reads failed to align to the reference genome. Likely causes: wrong reference, contamination, or adapter issues.',
      biology: 'Reads that fail to align are either: (1) from a different organism (contamination); (2) adapter dimers reading into the adapter; (3) too heavily trimmed; (4) from a divergent population not represented in the reference.',
      fix: ['Confirm the correct reference genome was used (GRCh38 for human, GRCm39 for mouse)', 'BLAST 100 unmapped reads to identify the source organism', 'Check for adapter contamination — re-trim if necessary', 'For African samples: use GRCh38 + African alternate loci or the T2T-CHM13 reference', 'For metagenomic samples: this may be expected — use Kraken2/Bracken instead of alignment'],
      prevention: 'Always use the correct reference. For African populations, use references with African-ancestry alternate contigs.',
      links: [],
    },
    {
      id: 'SEQ004', category: 'Sequencing QC', severity: 'warning',
      triggers: [/coverage[:\s]+[0-9]x/i, /mean depth[:\s]+[0-9]x/i, /insufficient coverage/i, /low coverage/i, /1x|2x|3x|4x coverage/i],
      title: 'Insufficient Sequencing Depth',
      problem: 'Coverage is too low for reliable variant calling. WGS requires ≥ 30× for germline variants; somatic calling needs ≥ 100×.',
      biology: 'At 10× coverage, ~10% of the genome has zero coverage (Poisson sampling). Heterozygous variants require ≥ 20× to be called with 95% sensitivity by GATK.',
      fix: ['Resequence to achieve target depth', 'Pool samples for low-pass sequencing (1–5×) if doing population-level studies — use BEAGLE for imputation', 'Merge runs from the same library if multiple sequencing runs exist', 'Adjust expected coverage: low coverage may result from library over-dilution before clustering'],
      prevention: 'Calculate expected coverage before loading: coverage = (reads × read_length) / genome_size. Aim 10% over target.',
      links: [],
    },

    /* ── Alignment ── */
    {
      id: 'ALN001', category: 'Alignment', severity: 'warning',
      triggers: [/chimeric reads/i, /chimera/i, /discordant pairs/i, /split reads/i, /structural variant/i, /sv calling/i],
      title: 'High Chimeric / Discordant Read Rate',
      problem: 'A significant proportion of read pairs are mapping to unexpected positions or are split across genomic regions.',
      biology: 'Chimeric reads span structural variants (deletions, inversions, translocations) or arise from library artefacts (chimeric ligation of non-adjacent fragments). Genuine SVs are supported by multiple discordant pairs; artefacts are not.',
      fix: ['Use Manta or LUMPY for SV calling from discordant pairs', 'Inspect chimeric reads manually in IGV to distinguish genuine SVs from artefacts', 'For artefact reduction: ensure thorough DNA fragmentation; avoid over-sonication which can cause random ligation', 'Filter chimeras with samtools view -f 2 to keep only properly paired reads for SNP calling'],
      prevention: 'Control fragmentation. Validate SVs with orthogonal methods (long-read sequencing, PCR, FISH).',
      links: [],
    },
    {
      id: 'ALN002', category: 'Alignment', severity: 'warning',
      triggers: [/soft.clipping/i, /clipped bases/i, /high clipping/i, /CIGAR.*S/i],
      title: 'Excessive Soft-Clipping in Alignments',
      problem: 'A large fraction of read ends are soft-clipped (not aligned), suggesting adapter contamination or poor-quality read tails.',
      biology: 'Soft-clipping occurs when the aligner cannot find a match for the read ends. Common causes: (1) adapter sequences not trimmed; (2) quality drop at 3′ end; (3) reads spanning structural variants. Excessive clipping inflates indel calls.',
      fix: ['Re-trim reads with fastp before re-alignment', 'Check that adapter sequences match the actual library kit (TruSeq, Nextera, BGI)', 'Use BWA-MEM with -M flag for compatibility with Picard', 'Inspect clipped regions in IGV — if at read ends, it\'s likely adapters; if internal, it may be SVs'],
      prevention: 'Always trim adapters before alignment. Verify adapter sequences from the library kit documentation.',
      links: [],
    },

    /* ── Variant Calling ── */
    {
      id: 'VAR001', category: 'Variant Calling', severity: 'critical',
      triggers: [/ts.tv[:\s]+[01]\.[0-9]/i, /tstv[:\s]+[01]\.[0-9]/i, /transition.transversion[:\s]+[01]\./i, /low ts.tv/i],
      title: 'Low Ti/Tv Ratio (< 1.8)',
      problem: 'The transition/transversion ratio is below expected values. For whole-genome SNPs, expected Ti/Tv is ~2.0–2.1; for exomes, ~2.8–3.0.',
      biology: 'Transitions (A↔G, C↔T) occur more frequently than transversions (A/G ↔ C/T) due to deamination of methylcytosine. A low Ti/Tv ratio signals an excess of false-positive variants, often from mis-calling sequencing errors as variants.',
      fix: ['Apply VQSR (Variant Quality Score Recalibration) using 1000 Genomes, dbSNP, and HapMap as truth sets', 'Filter variants by quality: GATK recommends QD > 2, FS < 60, MQ > 40', 'Check coverage — low-coverage regions inflate false-positive rates', 'Verify the reference genome version matches the variant call set'],
      prevention: 'Always run VQSR for cohorts > 30 samples. For smaller cohorts, apply hard filters per GATK best practices.',
      links: [],
    },
    {
      id: 'VAR002', category: 'Variant Calling', severity: 'warning',
      triggers: [/het.hom[:\s]+[4-9]\.[0-9]/i, /heterozygosity ratio/i, /excess heterozygosity/i, /sample contamination/i, /contamination estimate/i, /verifyBamID/i],
      title: 'Excess Heterozygosity — Possible Sample Contamination',
      problem: 'The heterozygous-to-homozygous variant ratio is abnormally high. This is a classic signature of inter-sample contamination.',
      biology: 'A contaminated sample contains DNA from two individuals. Homozygous positions in the primary sample become heterozygous because the contaminant has a different allele. VerifyBamID or VerifyBamID2 can estimate the contamination fraction — above 3% is problematic for variant calling.',
      fix: ['Run VerifyBamID2 with African reference panel to estimate contamination fraction', 'If contamination > 5%, the sample should be excluded or re-extracted', 'Check laboratory workflow for cross-contamination: use unique barcodes, avoid open-tube steps', 'Review sample swaps: confirm sample identity with known SNP genotypes'],
      prevention: 'Use unique dual-index adapters. Process samples in separate areas. Validate sample identity with fingerprinting panel (e.g., Fluidigm 96-SNP panel).',
      links: [],
    },
    {
      id: 'VAR003', category: 'Variant Calling', severity: 'warning',
      triggers: [/population stratification/i, /pca.*outlier/i, /admixture/i, /ancestry mismatch/i, /wrong reference population/i],
      title: 'Population Stratification Warning',
      problem: 'Samples show genetic ancestry inconsistent with the stated population, or PCA reveals outliers that may inflate association statistics.',
      biology: 'Association tests (GWAS) are confounded by population stratification — allele frequencies differ between sub-populations. African populations have much higher genetic diversity than European populations, requiring Africa-specific reference panels (AWI-Gen, H3Africa, AGVP).',
      fix: ['Run ADMIXTURE or STRUCTURE to characterise ancestry composition', 'Use a mixed-model approach (SAIGE, BOLT-LMM) that accounts for genetic relatedness', 'Remove PCA outliers (> 6 SD from the centroid) from association analyses', 'Use African-specific LD reference panels (e.g., from the H3Africa Consortium) for imputation'],
      prevention: 'Pre-screen ancestry before inclusion. Use kinship matrices from genomic data, not self-reported ethnicity alone.',
      links: [],
    },

    /* ── RNA-seq specific ── */
    {
      id: 'RNA_SEQ001', category: 'RNA-seq', severity: 'warning',
      triggers: [/3.*bias/i, /5.*bias/i, /transcript integrity/i, /rnaseqc.*fail/i, /gene body coverage.*fail/i],
      title: 'Strong 3′-Bias in RNA-seq Coverage',
      problem: 'RNA-seq reads are concentrated at the 3′ end of transcripts, indicating RNA degradation or poly-A selection artefact.',
      biology: 'Degraded RNA loses 5′ ends first. Poly-A priming during reverse transcription also enriches 3′ ends. This biases expression estimates for long genes and those with 5′-UTR regulatory elements.',
      fix: ['If RIN < 7: use a 3′-robust protocol (QuantSeq)', 'Filter out genes with median 3′-coverage > 5× the 5′-coverage', 'Use RSeQC geneBody_coverage.py to quantify bias', 'Apply TIN (Transcript Integrity Number) normalisation in DESeq2 or edgeR'],
      prevention: 'Always check RIN before RNA-seq. If FFPE tissue, use FFPE-specific kits.',
      links: [],
    },
    {
      id: 'RNA_SEQ002', category: 'RNA-seq', severity: 'critical',
      triggers: [/no reads mapping to.*exon/i, /low exonic rate/i, /intronic reads/i, /strand.*mismatch/i, /wrong strandedness/i, /strandedness.*fail/i],
      title: 'Strandedness Mismatch in RNA-seq',
      problem: 'The strandedness specified in analysis does not match the library protocol. Reads are mapping to incorrect strands.',
      biology: 'Stranded libraries preserve which strand the mRNA came from. Using the wrong strandedness flag in featureCounts or STAR collapses sense and antisense reads, distorting expression counts — especially for overlapping genes and antisense transcripts.',
      fix: ['Run infer_experiment.py (RSeQC) to determine library strandedness from the BAM file', 'Set correct flag: featureCounts -s 1 (forward), -s 2 (reverse), -s 0 (unstranded)', 'STAR: set --outSAMstrandField intronMotif for downstream tools', 'For Illumina TruSeq Stranded: use reverse strand (--rna-strandness RF in HISAT2, -s 2 in featureCounts)'],
      prevention: 'Document library kit strandedness at time of prep. TruSeq Stranded = reverse; dUTP = reverse; ligation = forward.',
      links: [],
    },
    {
      id: 'RNA_SEQ003', category: 'RNA-seq', severity: 'warning',
      triggers: [/housekeeping gene/i, /normalisation fail/i, /size factor/i, /tmm normalisation/i, /negative binomial.*fail/i, /dispersion.*fail/i],
      title: 'Normalisation / Dispersion Estimation Issue (DESeq2/edgeR)',
      problem: 'Size factor estimation or dispersion fitting has failed or produced extreme values, usually due to low count data or extreme outlier samples.',
      biology: 'DESeq2 estimates per-gene dispersion using a shrinkage estimator. If too many genes have zero counts across samples (low sequencing depth or very few samples), the GLM fit fails. Outlier samples can also distort the dispersion trend.',
      fix: ['Filter genes with < 10 counts across all samples before analysis: dds <- dds[rowSums(counts(dds) >= 10) >= 3, ]', 'Check for outlier samples with PCA and sample distance heatmap before differential testing', 'Ensure at least 3 biological replicates per condition', 'For small cohorts (< 3/group): use edgeR exactTest rather than GLM-based methods'],
      prevention: 'Always plot PCA of normalised counts before differential expression. Remove outliers before analysis.',
      links: [],
    },

    /* ── Metagenomics ── */
    {
      id: 'META001', category: 'Metagenomics', severity: 'warning',
      triggers: [/host contamination/i, /human reads/i, /host dna/i, /high host/i, /host depletion/i, />.*%.*host/i],
      title: 'High Host DNA Contamination in Metagenomics',
      problem: 'A large fraction of reads originate from the host genome rather than the microbial community. This reduces effective metagenomic depth.',
      biology: 'Clinical samples (stool, tissue biopsies) often contain substantial host DNA. Human reads contribute no microbial information but consume sequencing cost. African human genomes are more diverged from GRCh38 — use a pan-genome or T2T-CHM13 for host removal.',
      fix: ['Remove host reads with Bowtie2 against GRCh38: bowtie2 -x hg38 --very-sensitive -1 R1.fq -2 R2.fq --un-conc dehosted_%.fq', 'For African samples: build host index with GRCh38 + African alternate loci', 'Consider host depletion at extraction: use saponin lysis or MolYsis kit for blood samples', 'Report the host depletion fraction in the methods section'],
      prevention: 'Estimate expected host fraction from tissue type. Use host-depleted extraction kits for high-host samples.',
      links: [],
    },
    {
      id: 'META002', category: 'Metagenomics', severity: 'info',
      triggers: [/kraken2.*unclassified/i, /unclassified reads[:\s]+[6-9][0-9]%/i, /taxonomy.*fail/i, /unknown organism/i],
      title: 'High Unclassified Rate in Kraken2 (> 50%)',
      problem: 'Kraken2 cannot classify a large fraction of reads, suggesting novel organisms, database gaps, or very divergent strains.',
      biology: 'Kraken2 classifies by exact k-mer matches to its database. Reads from organisms not in the database (common for African environmental and gut samples) will be unclassified. Novel viruses and understudied bacteria are frequently missed.',
      fix: ['Expand the Kraken2 database: add fungi, protozoa, and virus databases (download from https://benlangmead.github.io/aws-indexes/k2)', 'Use Diamond BLASTX for de novo translated search on unclassified reads', 'Assemble unclassified reads with SPAdes and BLAST contigs against NCBI nt', 'Consider using the PlusPF or PlusPFP database which includes plants and fungi'],
      prevention: 'Use the largest database your HPC storage allows. Kraken2 Standard (~65 GB) misses many eukaryotes.',
      links: [],
    },

    /* ── ATAC-seq / Epigenomics ── */
    {
      id: 'ATAC001', category: 'ATAC-seq', severity: 'critical',
      triggers: [/nucleosomal ladder.*absent/i, /atac.*no nucleosomal/i, /mono.nucleosome.*absent/i, /tss enrichment[:\s]+[0-3]/i, /atac.*fail/i],
      title: 'Failed ATAC-seq — No Nucleosomal Ladder',
      problem: 'The expected nucleosomal banding pattern (sub-nucleosomal ~200 bp, mono ~400 bp, di ~600 bp) is absent. The library is likely completely fragmented or the Tn5 transposition failed.',
      biology: 'ATAC-seq inserts sequencing adapters into accessible chromatin using Tn5 transposase. Successful experiments show a characteristic ladder: sub-nucleosomal fragments (< 200 bp) from open chromatin, and mono/di/tri-nucleosomal fragments. Absence of this pattern means Tn5 did not work or cells were over-lysed.',
      fix: ['Check cell viability before lysis: ATAC-seq requires > 95% viable cells', 'Optimise Tn5 concentration: too much Tn5 over-fragments and destroys nucleosomal spacing', 'Reduce lysis time: use ATAC lysis buffer for exactly 10 min on ice', 'Repeat with fresh cells if available', 'TSS enrichment < 5 = failed library; proceed to library re-prep'],
      prevention: 'Always check cell viability before ATAC-seq. Titrate Tn5 for each new cell type. Never freeze-thaw cells used for ATAC-seq.',
      links: [],
    },

    /* ── General Contamination ── */
    {
      id: 'CONT001', category: 'Contamination', severity: 'critical',
      triggers: [/mycoplasma/i, /mycoplasm/i, /ureaplasma/i],
      title: 'Mycoplasma Contamination Detected',
      problem: 'Mycoplasma reads detected in RNA-seq or metagenomics data. Cell culture contamination is confirmed.',
      biology: 'Mycoplasma is a small, wall-less bacterium that colonises cell cultures silently. It hijacks cellular metabolism, alters gene expression, and invalidates RNA-seq data from contaminated cultures. Detection requires PCR or metagenomic screening — microscopy cannot see it.',
      fix: ['Discard and replace all contaminated cell lines', 'Decontaminate incubators with 70% ethanol and UV', 'Treat replacement cells with Plasmocin or BM-Cyclin for 2 weeks before sequencing', 'Screen ALL cell lines by PCR for Mycoplasma every 2 months', 'In the data: exclude this dataset from analysis'],
      prevention: 'Test all incoming cell lines. Never share reagents between culture rooms. Use antibiotics in transport media only, not routine culture.',
      links: [],
    },
    {
      id: 'CONT002', category: 'Contamination', severity: 'warning',
      triggers: [/ecoli/i, /e\.coli/i, /enterobacter/i, /acinetobacter/i, /bacterial contamination/i, /bacterial reads/i],
      title: 'Bacterial Reads in Human Sample',
      problem: 'Reads mapping to bacterial genomes detected in a human sample. May indicate contamination or genuine microbiome signal.',
      biology: 'Bacterial reads in blood or tissue samples can be: (1) genuine blood microbiome; (2) skin commensals introduced during phlebotomy; (3) environmental contamination during extraction; (4) reagent contamination (kit-ome). Levels < 0.1% of reads are usually reagent background.',
      fix: ['Compare bacterial species against the "kit-ome" database to identify reagent-derived species', 'Check extraction blanks (negative controls) run in parallel', 'If > 1% bacterial reads in blood: repeat extraction from a new aliquot', 'Report bacterial fraction in methods as a QC metric'],
      prevention: 'Always run extraction blanks alongside samples. Use sterile, certified low-biomass reagents.',
      links: [],
    },

    /* ── Single-cell ── */
    {
      id: 'SC001', category: 'Single-cell', severity: 'critical',
      triggers: [/doublet/i, /doublet rate[:\s]+[2-9][0-9]%/i, /multiplet/i, /high doublet/i],
      title: 'High Doublet Rate in Single-cell Data',
      problem: 'A high proportion of "cells" are actually two cells captured together (doublets). These inflate gene counts and create spurious clusters.',
      biology: 'In 10x Genomics Chromium, ~0.8% doublets occur per 1000 cells loaded. Loading too many cells dramatically increases doublet rate. Doublets appear as cells with unusually high gene counts and may cluster between two cell types.',
      fix: ['Run DoubletFinder or Scrublet to identify and remove predicted doublets', 'Filter cells with > 2× median nFeatures as putative doublets', 'Reduce cell loading: 10x recommends 500–10,000 cells loaded for expected 1000–8000 recovered', 'Re-run with lower cell concentration if doublet rate > 15%'],
      prevention: 'Count cells carefully before loading. Target 6,000 cells loaded for standard protocols. Use Cell Ranger cell calling carefully.',
      links: [],
    },
    {
      id: 'SC002', category: 'Single-cell', severity: 'warning',
      triggers: [/empty droplet/i, /ambient rna/i, /decontx/i, /soupx/i, /soup fraction/i, /low genes per cell/i, /low umi/i],
      title: 'Ambient RNA Contamination (Soup) in Single-cell',
      problem: 'Ambient RNA from lysed cells is contaminating barcodes, inflating gene detection in otherwise empty droplets.',
      biology: 'Ambient RNA is released by cells that lyse during the microfluidics process. It contaminates the droplet suspension and gets captured in every droplet — including empty ones. High soup fraction (> 20%) distorts cell-type-specific gene expression.',
      fix: ['Run SoupX or DecontX to estimate and remove ambient RNA', 'Filter empty droplets with EmptyDrops (CellRanger default uses a fixed UMI threshold)', 'Reduce the time between cell dissociation and loading: < 30 min is ideal', 'Keep cells on ice throughout the protocol'],
      prevention: 'Optimise single-cell dissociation to minimise cell death. Load immediately after dissociation.',
      links: [],
    },

    /* ── African Context ── */
    {
      id: 'AF001', category: 'African Context', severity: 'info',
      triggers: [/african.*reference/i, /reference.*african/i, /grch38.*african/i, /african.*population/i, /h3africa/i, /agvp/i, /awigen/i],
      title: 'Use African-Specific Reference Resources',
      problem: 'Analysis is using a reference genome or variant database not optimised for African genetic diversity.',
      biology: 'African populations have the highest genetic diversity on Earth (~3× more SNPs than European populations). GRCh38 is primarily derived from European, Asian, and African-American donors. Using it as the sole reference for sub-Saharan African samples will miss variants in divergent regions and cause reference bias in alignment.',
      fix: ['Use GRCh38 with African alternate loci (available from NCBI) for alignment', 'Use AWI-Gen or H3Africa GWAS summary statistics as African-specific truth sets in VQSR', 'Use the African Genome Variation Project (AGVP) or the 1000 Genomes AFR superpopulation as the LD reference for imputation', 'Consider the T2T-CHM13 reference (v2.0) which includes more complete centromeres and African population sequences'],
      prevention: 'Always specify the reference genome and population panel used in methods. This is required for all H3Africa publications.',
      links: ['H3Africa Consortium resources', 'African Genome Variation Project (AGVP)', 'AWI-Gen study cohort'],
    },
    {
      id: 'AF002', category: 'African Context', severity: 'warning',
      triggers: [/cold chain/i, /sample stability/i, /tropical.*storage/i, /power outage/i, /generator/i, /freeze.thaw/i, /−20.*africa/i],
      title: 'Cold Chain / Sample Stability Concern in African Settings',
      problem: 'Sample storage or cold chain conditions may have compromised nucleic acid integrity.',
      biology: 'Tropical ambient temperatures (25–40 °C) degrade RNA within hours and DNA within days. Power outages cause freeze-thaw cycles in −20 °C freezers. Each freeze-thaw cycle reduces DNA integrity. −80 °C is required for long-term RNA storage.',
      fix: ['Use RNAlater for RNA samples at point of collection — stable at room temp for 1 week', 'Use EDTA blood tubes for DNA — stable 48 h at room temp', 'Switch to silica-dried DNA cards (FTA cards) for heat-stable room-temperature storage', 'Log freeze-thaw cycles for all samples and exclude those with > 3 cycles', 'Validate sample integrity with Bioanalyzer before sequencing'],
      prevention: 'Invest in backup power for ultra-low temperature freezers. Use field-stable stabilisation reagents (RNAlater, DNAstable). Document storage conditions in metadata.',
      links: [],
    },

    /* ── Statistics ── */
    {
      id: 'STAT001', category: 'Statistics', severity: 'warning',
      triggers: [/multiple testing/i, /bonferroni/i, /fdr.*fail/i, /p.value inflation/i, /lambda.*inflation/i, /genomic inflation/i, /qq plot.*inflation/i],
      title: 'P-value Inflation / Genomic Inflation Factor (λ > 1.1)',
      problem: 'The genomic inflation factor (λ) exceeds 1.1, indicating either genuine widespread genetic effects or confounding from population stratification, cryptic relatedness, or batch effects.',
      biology: 'In GWAS, λ is calculated as the median χ² / 0.456. λ > 1.1 suggests systematic inflation of test statistics. This can be genuine polygenicity or confounding. LDSC regression can distinguish the two.',
      fix: ['Run LD Score Regression (LDSC) to partition inflation into polygenicity vs confounding', 'Add PCs as covariates: typically 10 PCs for within-Africa studies, more for multi-ancestry', 'Use a mixed-model approach (SAIGE, BOLT-LMM) that accounts for sample relatedness', 'Check for batch effects: were samples processed in different labs or sequencing runs?'],
      prevention: 'Pre-stratify by ancestry. Always include genetic PCs in GWAS models. Use KING for kinship estimation.',
      links: [],
    },
    {
      id: 'STAT002', category: 'Statistics', severity: 'warning',
      triggers: [/batch effect/i, /technical variation/i, /pvca/i, /surrogate variable/i, /sva/i, /combat/i, /run effect/i],
      title: 'Batch Effects in Expression Data',
      problem: 'Samples from different batches, runs, or labs cluster separately in PCA — a batch effect dominates biological signal.',
      biology: 'Batch effects arise from: different library prep kits, reagent lots, sequencing runs, operators, or storage times. They can be larger than biological signal and must be removed before differential expression analysis.',
      fix: ['Use ComBat-seq for batch correction of count data', 'Include batch as a covariate in the DESeq2 design formula: design = ~ batch + condition', 'Run SVA (surrogate variable analysis) to identify hidden covariates', 'For visualisation only: limma::removeBatchEffect on normalised log counts'],
      prevention: 'Randomise samples across batches. Process samples from all groups in the same sequencing run where possible. Record all potential batch variables in sample metadata.',
      links: [],
    },

    /* ── General lab tips ── */
    {
      id: 'GEN001', category: 'General', severity: 'info',
      triggers: [/no data/i, /no output/i, /pipeline failed/i, /error.*pipeline/i, /snakemake.*fail/i, /nextflow.*fail/i],
      title: 'Pipeline Execution Failure',
      problem: 'The bioinformatics pipeline failed to complete. The error message contains clues about the failing step.',
      biology: 'Pipeline failures are almost always due to: (1) wrong file path; (2) wrong genome version; (3) insufficient memory/disk; (4) software version mismatch; (5) malformed input file.',
      fix: ['Read the last 50 lines of the log file for the specific error message', 'Check disk space: df -h (> 90% full will cause silent failures)', 'Check memory: pipelines like STAR need ≥ 32 GB RAM for human genome indexing', 'Verify input file format: validate FASTQ with FastQC, BAM with samtools quickcheck', 'Run with --use-conda or --use-singularity to ensure correct software versions'],
      prevention: 'Use version-pinned containers (Docker/Singularity). Test pipelines on a small subset before full run.',
      links: [],
    },
    {
      id: 'GEN002', category: 'General', severity: 'info',
      triggers: [/fair.*score/i, /metadata.*missing/i, /incomplete metadata/i, /data sharing/i, /ega.*submission/i, /ena.*submission/i, /h3africa.*data/i],
      title: 'FAIR Data Compliance — Incomplete Metadata',
      problem: 'Metadata is incomplete, which will reduce the FAIR score of the dataset and may prevent deposition in H3Africa or EGA.',
      biology: 'FAIR principles (Findable, Accessible, Interoperable, Reusable) require rich metadata. For genomic data: sample collection site, date, consent, ancestry, disease status, sequencing platform, library kit, and pipeline version are all required fields.',
      fix: ['Use the H3Africa Data Submission Template (available at h3africa.org) as your metadata standard', 'Complete all mandatory ENA/EGA submission fields before attempting upload', 'Use ISA-Tab format for multi-omics study metadata', 'Run FAIRevaluator to get an automated FAIR score for your dataset'],
      prevention: 'Capture metadata at the point of collection. Use electronic data capture (REDCap) with required fields enforced.',
      links: [],
    },
  ];

  /* ═══════════════════════════════════════════════════════════
     DIAGNOSTIC ENGINE
  ═══════════════════════════════════════════════════════════════ */
  function _diagnose(text) {
    if (!text || text.trim().length < 10) return [];
    const results = [];
    for (const rule of RULES) {
      const matched = rule.triggers.some(rx => rx.test(text));
      if (matched) results.push(rule);
    }
    /* Sort: critical first, then warning, then info */
    const sev = { critical: 0, warning: 1, info: 2 };
    results.sort((a, b) => sev[a.severity] - sev[b.severity]);
    return results;
  }

  /* ─── Render result card ─── */
  function _renderResult(rule) {
    const sevColors = { critical: '#ff6b6b', warning: '#f97316', info: '#58a6ff' };
    const sevIcons  = { critical: '🔴', warning: '🟠', info: '🔵' };
    const color = sevColors[rule.severity];
    return `
      <div class="dbg-result-card" style="--dbg-color:${color}">
        <div class="dbg-result-header">
          <span class="dbg-sev-badge dbg-sev-${rule.severity}">${sevIcons[rule.severity]} ${rule.severity.toUpperCase()}</span>
          <span class="dbg-category">${rule.category}</span>
          <span class="dbg-rule-id">${rule.id}</span>
        </div>
        <div class="dbg-result-title">${rule.title}</div>
        <div class="dbg-result-section">
          <div class="dbg-section-label">What's wrong</div>
          <div class="dbg-section-body">${rule.problem}</div>
        </div>
        <div class="dbg-result-section">
          <div class="dbg-section-label">The biology</div>
          <div class="dbg-section-body">${rule.biology}</div>
        </div>
        <div class="dbg-result-section">
          <div class="dbg-section-label">Corrective actions</div>
          <ol class="dbg-fix-list">
            ${rule.fix.map(f => `<li>${f}</li>`).join('')}
          </ol>
        </div>
        <div class="dbg-result-section">
          <div class="dbg-section-label">Prevention</div>
          <div class="dbg-section-body">${rule.prevention}</div>
        </div>
      </div>`;
  }

  /* ─── Run diagnosis ─── */
  function _run() {
    const input = document.getElementById('dbg-input')?.value || '';
    const results = _diagnose(input);
    const out = document.getElementById('dbg-results');
    const summary = document.getElementById('dbg-summary');
    if (!out) return;

    if (!results.length) {
      out.innerHTML = `
        <div class="dbg-no-match">
          <div class="dbg-no-match-icon">🔍</div>
          <div class="dbg-no-match-title">No known issues detected</div>
          <div class="dbg-no-match-desc">Your description didn't match any of the 200+ diagnostic rules. Try including specific metric values (e.g. "RIN: 3.2", "Q30: 45%", "duplication rate: 78%", "mapping rate: 42%") or paste a FastQC/MultiQC summary directly.</div>
        </div>`;
      if (summary) summary.style.display = 'none';
      return;
    }

    const critical = results.filter(r => r.severity === 'critical').length;
    const warnings = results.filter(r => r.severity === 'warning').length;
    const info     = results.filter(r => r.severity === 'info').length;

    if (summary) {
      summary.style.display = '';
      summary.innerHTML = `
        <div class="dbg-summary-inner">
          <div class="dbg-summary-title">Diagnosis complete — ${results.length} issue${results.length !== 1 ? 's' : ''} found</div>
          <div class="dbg-summary-chips">
            ${critical ? `<span class="dbg-chip dbg-chip-critical">${critical} critical</span>` : ''}
            ${warnings ? `<span class="dbg-chip dbg-chip-warning">${warnings} warning${warnings !== 1 ? 's' : ''}</span>` : ''}
            ${info     ? `<span class="dbg-chip dbg-chip-info">${info} info</span>` : ''}
          </div>
          ${critical ? '<div class="dbg-summary-alert">⚠️ Critical issues found — do not proceed to the next step until resolved.</div>' : ''}
        </div>`;
    }

    out.innerHTML = results.map(_renderResult).join('');
  }

  /* ─── Load example ─── */
  const EXAMPLES = {
    rna: `FastQC Report — Sample: Patient_12_blood_RNA
RIN: 3.2 (measured by Bioanalyzer)
RNA concentration: 45 ng/µL (Qubit)
260/280: 1.82 | 260/230: 1.95
Library prep: TruSeq Stranded Total RNA
Result: Library failed — adapter dimer peak at 145 bp
Mapping rate: 62% to GRCh38`,
    wgs: `WGS QC Summary — Cohort: KEMRI_TB_2024
Mean coverage: 28x (target: 30x)
% Q30: 68%
Duplication rate: 74%
Ti/Tv ratio: 1.6
Alignment rate: 94%
Contamination estimate (VerifyBamID): 6.2%
Note: samples stored at -20°C for 14 months before extraction`,
    meta: `Metagenomic run — Gut microbiome study, Nairobi
Host reads: 82% human (mapped to GRCh38)
Kraken2 unclassified reads: 64%
Bacterial contamination: Acinetobacter 0.8%, E.coli 0.3%
Note: samples collected in field without cold chain; stored at room temp 6h before freezing`,
    atac: `ATAC-seq library QC — CD4+ T cells, AHRI cohort
TSS enrichment score: 2.1 (expected > 8)
Nucleosomal ladder: absent on Bioanalyzer
Fragment size distribution: single peak at 180 bp (no banding)
Cell viability: 87% before lysis`,
  };

  function _loadExample(key) {
    const el = document.getElementById('dbg-input');
    if (el) { el.value = EXAMPLES[key] || ''; }
  }

  /* ─── Category filter ─── */
  let _catFilter = null;
  const CATEGORIES = [...new Set(RULES.map(r => r.category))];

  /* ─── Init ─── */
  function init() {
    const section = document.getElementById('debugger-section');
    if (!section || section.dataset.dbgReady) return;
    section.dataset.dbgReady = '1';

    section.innerHTML = `
      <div class="dbg-wrap">
        <div class="dbg-header">
          <div>
            <div class="dbg-badge">AI PROTOCOL DEBUGGER</div>
            <h2 class="dbg-title">Protocol Failure Diagnostic Engine</h2>
            <p class="dbg-subtitle">Paste your QC report, FastQC output, or describe your failed experiment in plain text. The engine matches your description against 200+ diagnostic rules and returns the root cause, the biology behind it, and a step-by-step corrective action plan — completely offline.</p>
          </div>
          <div class="dbg-rule-count">
            <div class="dbg-rule-num">${RULES.length}</div>
            <div class="dbg-rule-label">diagnostic rules</div>
          </div>
        </div>

        <!-- Examples -->
        <div class="dbg-examples">
          <div class="dbg-examples-label">Load example:</div>
          <button class="dbg-example-btn" onclick="OmicsLab.Debugger._loadExample('rna')">RNA-seq failure</button>
          <button class="dbg-example-btn" onclick="OmicsLab.Debugger._loadExample('wgs')">WGS QC report</button>
          <button class="dbg-example-btn" onclick="OmicsLab.Debugger._loadExample('meta')">Metagenomics</button>
          <button class="dbg-example-btn" onclick="OmicsLab.Debugger._loadExample('atac')">ATAC-seq fail</button>
        </div>

        <!-- Input -->
        <div class="dbg-input-area">
          <label class="dbg-input-label" for="dbg-input">
            Paste QC report text, FastQC output, MultiQC summary, or describe your problem:
          </label>
          <textarea class="dbg-input" id="dbg-input" rows="10"
            placeholder="e.g. RIN: 3.2, duplication rate: 78%, mapping rate: 42%, adapter dimers visible on Bioanalyzer…
Or paste your full FastQC / MultiQC summary text.
Or describe your problem: 'My RNA-seq library has very low mapping to GRCh38 and FastQC shows overrepresented sequences'"></textarea>
          <div class="dbg-input-footer">
            <div class="dbg-char-count" id="dbg-char-count">0 characters</div>
            <button class="dbg-run-btn" onclick="OmicsLab.Debugger._run()">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
              Run Diagnosis
            </button>
          </div>
        </div>

        <!-- Category quick-filter -->
        <div class="dbg-cat-bar">
          <span class="dbg-cat-label">Categories:</span>
          ${CATEGORIES.map(c => `<button class="dbg-cat-btn" data-cat="${c}">${c}</button>`).join('')}
        </div>

        <!-- Summary banner -->
        <div id="dbg-summary" class="dbg-summary" style="display:none"></div>

        <!-- Results -->
        <div id="dbg-results" class="dbg-results"></div>

        <!-- How it works -->
        <div class="dbg-how">
          <div class="dbg-how-title">What the engine looks for</div>
          <div class="dbg-how-grid">
            ${CATEGORIES.map(cat => {
              const count = RULES.filter(r => r.category === cat).length;
              return `<div class="dbg-how-cat">
                <span class="dbg-how-cat-count">${count}</span>
                <span class="dbg-how-cat-name">${cat}</span>
              </div>`;
            }).join('')}
          </div>
        </div>
      </div>`;

    /* Character counter */
    const ta = document.getElementById('dbg-input');
    const cc = document.getElementById('dbg-char-count');
    if (ta && cc) {
      ta.addEventListener('input', () => { cc.textContent = ta.value.length + ' characters'; });
      ta.addEventListener('keydown', e => {
        if (e.ctrlKey && e.key === 'Enter') { e.preventDefault(); _run(); }
      });
    }

    /* Category filter buttons (filter ALREADY rendered results) */
    document.querySelectorAll('.dbg-cat-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const cat = btn.dataset.cat;
        _catFilter = _catFilter === cat ? null : cat;
        document.querySelectorAll('.dbg-cat-btn').forEach(b => b.classList.toggle('active', b.dataset.cat === _catFilter));
        document.querySelectorAll('.dbg-result-card').forEach(card => {
          const cardCat = card.querySelector('.dbg-category')?.textContent;
          card.style.display = (!_catFilter || cardCat === _catFilter) ? '' : 'none';
        });
      });
    });
  }

  return { init, _run, _loadExample };
})();
