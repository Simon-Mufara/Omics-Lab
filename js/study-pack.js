/* ═══════════════════════════════════════════════════════════════
   OmicsLab — Study Pack
   Structured learning objectives, key concepts, and persistent
   note-taking for 35 core modules.
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.StudyPack = (function () {

  /* ── Storage ── */
  function _getNote(id)      { return localStorage.getItem('omicslab_sp_note_'   + id) || ''; }
  function _getStatus(id)    { return localStorage.getItem('omicslab_sp_status_' + id) || 'not-started'; }
  function _isBm(id)         { return localStorage.getItem('omicslab_sp_bm_'     + id) === '1'; }
  function _saveNote(id, v)  { localStorage.setItem('omicslab_sp_note_'   + id, v); }
  function _saveStatus(id,v) { localStorage.setItem('omicslab_sp_status_' + id, v); }
  function _toggleBm(id)     {
    const was = _isBm(id);
    localStorage.setItem('omicslab_sp_bm_' + id, was ? '0' : '1');
    return !was;
  }

  /* ── Data ── */
  const CATS = [
    { id:'all',         label:'All Modules'     },
    { id:'simulation',  label:'Simulation'      },
    { id:'genomics',    label:'Genomics'        },
    { id:'variants',    label:'Variants'        },
    { id:'expression',  label:'Expression'      },
    { id:'pipelines',   label:'Pipelines'       },
    { id:'africa',      label:'African Genomics'},
    { id:'research',    label:'Research'        },
    { id:'training',    label:'Training'        },
  ];

  const MODULES = [

    /* ── SIMULATION ── */
    { id:'lab-sim',    cat:'simulation', page:'lab',         color:'#3fb950', time:'3h',
      name:'Lab Simulations',
      why:'Builds protocol intuition without consuming reagents — the fastest path from theory to technique.',
      objectives:[
        'Execute end-to-end wet-lab workflows: DNA extraction → library prep → sequencing',
        'Read and act on live QC metrics (RIN, duplication rate, on-target rate)',
        'Trace error cascades from upstream protocol decisions to final results',
        'Apply ENCODE, GATK, and 10x Genomics quality thresholds',
      ],
      concepts:[
        ['RIN Score','RNA Integrity Number (0–10). Below 7 typically disqualifies RNA-seq samples.'],
        ['Library Complexity','Count of unique DNA fragments. Low complexity = over-amplified duplicates.'],
        ['Error Cascade','Propagation of one protocol mistake into multiple downstream QC failures.'],
        ['Duplication Rate','Fraction of reads that are PCR copies. Above ~30% inflates false DE calls.'],
        ['On-target Rate','Fraction of reads aligning to intended regions; low rates waste sequencing depth.'],
      ],
    },
    { id:'analysis',   cat:'simulation', page:'analysis',    color:'#58a6ff', time:'2h',
      name:'Analysis Studio',
      why:'File-format literacy is foundational — you cannot analyse data you cannot correctly parse and interpret.',
      objectives:[
        'Parse FASTQ, FASTA, VCF, and expression matrix files',
        'Assess per-base quality with Phred scores and decide when to trim',
        'Run multiple sequence alignment in the browser',
        'Visualise variant data and differential expression results',
      ],
      concepts:[
        ['FASTQ','Text file storing sequencing reads with per-base quality scores (ASCII-encoded Phred).'],
        ['FASTA','Text file storing nucleotide or protein sequences without quality scores.'],
        ['VCF','Variant Call Format — tab-delimited file listing genomic variants with INFO fields.'],
        ['Phred Score','Quality = −10 log₁₀(P_error). Q30 = 99.9% base-call accuracy.'],
        ['MSA','Multiple Sequence Alignment: simultaneous alignment of ≥3 sequences to reveal conservation.'],
      ],
    },
    { id:'outbreak',   cat:'simulation', page:'outbreak',    color:'#f97316', time:'2h',
      name:'Outbreak Simulator',
      why:'Genomic epidemiology is now the standard for outbreak response; practising it virtually saves lives.',
      objectives:[
        'Simulate sample collection during a viral outbreak across Africa',
        'Build a maximum-likelihood phylogenetic tree from sequences',
        'Identify the index case using ancestral reconstruction',
        'Interpret transmission chains and super-spreader events',
      ],
      concepts:[
        ['Index Case','The first person infected in an outbreak chain.'],
        ['Phylogenetic Tree','Diagram showing evolutionary relationships and divergence times between sequences.'],
        ['Maximum Likelihood','Statistical method for inferring the tree most likely to produce observed sequences.'],
        ['Transmission Chain','Sequence of infections linking source to subsequent cases.'],
        ['Genomic Epidemiology','Use of pathogen whole-genome sequencing to track disease spread.'],
      ],
    },
    { id:'debugger',   cat:'simulation', page:'debugger',    color:'#ff6b6b', time:'1h',
      name:'Protocol Debugger',
      why:'Root-cause diagnosis of failed experiments is the most under-taught skill in bioinformatics.',
      objectives:[
        'Describe a failed experiment or paste a QC report into the debugger',
        'Identify root causes using the 200+ rule knowledge base',
        'Distinguish primary causes from downstream artefacts',
        'Generate corrective actions for the identified failure mode',
      ],
      concepts:[
        ['QC Report','Summary of quality metrics from tools like FastQC, samtools flagstat, or MultiQC.'],
        ['Root Cause','The upstream decision or contamination event that initiated a failure cascade.'],
        ['Downstream Artefact','A secondary metric failure caused by an upstream error (not the cause itself).'],
        ['Corrective Action','Protocol or analysis change that resolves the root cause.'],
      ],
    },
    { id:'virtual-lab',cat:'simulation', page:'virtual-lab', color:'#3fb950', time:'1h',
      name:'Virtual Lab Tour',
      why:'Instrument familiarity reduces errors; knowing what a machine looks like makes manuals make sense.',
      objectives:[
        'Identify 20+ real genomics instruments by name and function',
        'Match instruments to the omics technique they support',
        'Understand throughput, cost, and read-length trade-offs',
        'Navigate a 360° tour of a modern sequencing facility',
      ],
      concepts:[
        ['Illumina NovaSeq','High-throughput short-read sequencer; up to 6 Tb per run.'],
        ['Oxford Nanopore MinION','Pocket-sized long-read sequencer; real-time basecalling.'],
        ['Mass Spectrometer','Proteomics instrument; separates peptides by mass-to-charge ratio (m/z).'],
        ['Flow Cytometer','Counts and sorts cells by fluorescence; used in single-cell library prep.'],
        ['PacBio Sequel','Long-read SMRT sequencer; >20 kb average read length.'],
      ],
    },

    /* ── GENOMICS ── */
    { id:'fastqc',     cat:'genomics',   page:'fastqc',      color:'#3fb950', time:'1.5h',
      name:'Read QC (FastQC)',
      why:'Raw data quality sets the ceiling for your analysis — poor reads cannot be rescued downstream.',
      objectives:[
        'Interpret per-base quality score distributions across read positions',
        'Detect adapter contamination, overrepresented sequences, and GC bias',
        'Apply PASS/WARN/FAIL thresholds appropriate to the sequencing platform',
        'Decide when to trim versus discard reads',
      ],
      concepts:[
        ['Per-base Quality','Phred score distribution across read positions; drops at 3\' end are normal.'],
        ['Adapter Contamination','Sequencing adapters ligated to short inserts; inflate false variants if unremoved.'],
        ['GC Content','Genome-specific baseline; deviations may indicate contamination or PCR bias.'],
        ['Overrepresented Sequence','Read appearing at >0.1% frequency; often rRNA, adapter dimers, or vector.'],
        ['N Content','Bases the sequencer could not call; high N% indicates low-quality cycles.'],
      ],
    },
    { id:'seq-align',  cat:'genomics',   page:'seq-align',   color:'#3fb950', time:'2h',
      name:'Sequence Alignment',
      why:'All variant calling, gene annotation, and evolutionary analysis depends on correct sequence alignment.',
      objectives:[
        'Implement Needleman-Wunsch global alignment and trace the optimal path',
        'Implement Smith-Waterman local alignment for domain detection',
        'Interpret the dynamic programming matrix and back-tracking',
        'Align real sequences (HBB, rpoB) and interpret the biological results',
      ],
      concepts:[
        ['Needleman-Wunsch','DP algorithm for optimal global alignment of two sequences.'],
        ['Smith-Waterman','Local alignment algorithm that finds the highest-scoring local region.'],
        ['Gap Penalty','Score subtracted for opening or extending an alignment gap.'],
        ['DP Matrix','Scoring matrix filled in O(mn); back-tracking recovers the alignment path.'],
        ['BLOSUM62','Substitution matrix derived from conserved protein blocks; standard for proteins.'],
      ],
    },
    { id:'gwas',       cat:'genomics',   page:'gwas',        color:'#58a6ff', time:'2.5h',
      name:'GWAS Suite',
      why:'GWAS has identified thousands of disease loci; African populations are critically under-represented.',
      objectives:[
        'Perform quality control on genotype data (MAF, HWE, missingness)',
        'Conduct association testing with logistic regression under the additive model',
        'Generate and interpret Manhattan and QQ plots',
        'Apply Bonferroni and FDR corrections for multiple testing',
      ],
      concepts:[
        ['MAF','Minor Allele Frequency. Variants <1–5% MAF are often filtered to reduce noise.'],
        ['HWE','Hardy-Weinberg Equilibrium: expected allele frequency in a non-evolving population.'],
        ['Manhattan Plot','Scatter of −log₁₀(p) vs chromosomal position; significant hits appear as peaks.'],
        ['QQ Plot','Quantile-quantile plot of observed vs expected p-values; inflation indicates confounding.'],
        ['Genomic Inflation λ','Median observed/expected χ²; λ > 1.05 suggests population stratification.'],
      ],
    },
    { id:'assembly',   cat:'genomics',   page:'assembly',    color:'#e3b341', time:'2h',
      name:'Genome Assembly',
      why:'De novo assembly is essential for novel pathogens and species with no reference genome.',
      objectives:[
        'Distinguish OLC from de Bruijn graph assembly approaches',
        'Interpret N50, NG50, and Nx curve statistics',
        'Compare short-read, long-read, and hybrid assembly quality',
        'Identify scaffolds vs contigs and understand their limitations',
      ],
      concepts:[
        ['N50','Length of the shortest contig in the largest 50% of assembled bases.'],
        ['Contig','Contiguous assembled sequence with no gaps (no N characters).'],
        ['Scaffold','Contigs joined by paired-end evidence; contains N-filled gaps.'],
        ['de Bruijn Graph','Graph where nodes are k-mers and edges are k−1 overlaps; used by SPAdes.'],
        ['Hybrid Assembly','Combining Illumina short reads with Nanopore long reads for optimal quality.'],
      ],
    },
    { id:'nanopore',   cat:'genomics',   page:'nanopore',    color:'#3fb950', time:'1.5h',
      name:'Nanopore QC',
      why:'ONT sequencing is transforming African genomics surveillance; its QC metrics differ from Illumina.',
      objectives:[
        'Interpret ONT-specific QC metrics (N50 read length, Q-score distribution)',
        'Apply PASS/WARN/FAIL thresholds from Nanopore community guidelines',
        'Compare R9.4 vs R10.4 pore chemistry quality profiles',
        'Assess data suitability for assembly vs genotyping applications',
      ],
      concepts:[
        ['Q-score','Phred score for nanopore reads; Q10 (~90%) typical with R9.4; Q20 with R10.4.'],
        ['Read N50','Half of all sequenced bases are in reads longer than this value.'],
        ['Pore Occupancy','Fraction of nanopores actively sequencing; affects throughput.'],
        ['Basecalling','Converting raw electrical signals (squiggle) to nucleotide sequence.'],
        ['Guppy/Dorado','ONT basecalling software; Dorado is the current production tool.'],
      ],
    },

    /* ── VARIANTS ── */
    { id:'variantinterp', cat:'variants', page:'variantinterp', color:'#bc8cff', time:'2h',
      name:'Variant Interpreter',
      why:'Incorrect variant classification has direct patient-safety consequences in clinical genomics.',
      objectives:[
        'Apply ACMG/AMP 2015 criteria to classify variants (pathogenic/benign/VUS)',
        'Interpret gnomAD African (AFR) allele frequencies',
        'Retrieve ClinVar evidence for disease-associated variants',
        'Differentiate germline from somatic variant interpretation',
      ],
      concepts:[
        ['ACMG/AMP Criteria','28 criteria (PVS1–BP7) for classifying sequence variants as P/LP/VUS/LB/B.'],
        ['VUS','Variant of Uncertain Significance: insufficient evidence to classify as pathogenic or benign.'],
        ['gnomAD AFR','African/African-American cohort in gnomAD; the largest African reference panel.'],
        ['ClinVar','NCBI database of human variants with curated clinical significance entries.'],
        ['Allele Frequency','Proportion of chromosomes carrying a variant; rarity correlates with pathogenicity.'],
      ],
    },
    { id:'pharmacogenomics', cat:'variants', page:'pharmacogenomics', color:'#f97316', time:'2h',
      name:'Pharmacogenomics',
      why:'Drug-gene interactions cause 5–10% of adverse drug reactions; African variants are poorly catalogued.',
      objectives:[
        'Identify CYP450 variants affecting drug metabolism (CYP2B6, CYP2D6, CYP3A5)',
        'Predict metaboliser phenotype (PM/IM/NM/UM) from star alleles',
        'Apply PGx findings to TB, HIV, and malaria treatment in Africa',
        'Recognise that African populations carry unique PGx variants absent from European references',
      ],
      concepts:[
        ['Star Allele','Named haplotype (e.g. CYP2B6*6) defining metaboliser function.'],
        ['Poor Metaboliser (PM)','No functional enzyme; drug accumulates causing toxicity.'],
        ['Ultrarapid Metaboliser (UM)','Extra gene copies; drug cleared too fast leading to treatment failure.'],
        ['CYP2B6*6','Most common star allele in Africans; reduces efavirenz clearance 3-fold.'],
        ['DPWG','Dutch Pharmacogenetics Working Group guidelines for PGx-based dosing.'],
      ],
    },
    { id:'crispr',     cat:'variants', page:'crispr',        color:'#f85149', time:'1.5h',
      name:'CRISPR Design Lab',
      why:'CRISPR is now in clinical trials for sickle cell disease — understanding design principles is essential.',
      objectives:[
        'Design sgRNA sequences targeting a gene of interest',
        'Score off-target sites using computational heuristics',
        'Predict editing outcomes (HDR vs NHEJ)',
        'Apply the tool to sickle cell (HBB) and malaria (PCNA) targets',
      ],
      concepts:[
        ['sgRNA','Single guide RNA: ~20-nt spacer + scaffold that directs Cas9 to target.'],
        ['PAM','Protospacer Adjacent Motif (e.g. NGG for SpCas9); required for Cas9 binding.'],
        ['Off-target Site','Genomic locus with partial sgRNA complementarity; causes unintended edits.'],
        ['HDR','Homology-Directed Repair: precise editing using a donor template.'],
        ['NHEJ','Non-Homologous End Joining: error-prone repair creating indels; used for knockouts.'],
      ],
    },
    { id:'amr',        cat:'variants', page:'amr',           color:'#ff6b6b', time:'1.5h',
      name:'AMR Profiler',
      why:'Africa carries the highest MDR-TB burden globally; genomic AMR surveillance is a public-health priority.',
      objectives:[
        'Identify AMR-conferring mutations in TB, HIV, and gram-negative genomes',
        'Classify isolates as MDR-TB, XDR-TB, or pre-XDR-TB',
        'Distinguish acquired resistance (mutation) from intrinsic resistance',
        'Generate WHO-compliant AMR interpretation reports',
      ],
      concepts:[
        ['MDR-TB','Multi-drug-resistant TB: resistant to at least isoniazid and rifampicin.'],
        ['XDR-TB','Extensively drug-resistant TB: MDR-TB + resistance to fluoroquinolone + bedaquiline/linezolid.'],
        ['Resistome','Full complement of AMR genes in a genome or metagenome.'],
        ['rpoB S450L','The most common rifampicin-resistance mutation in M. tuberculosis.'],
        ['CARD','Comprehensive Antibiotic Resistance Database; reference for AMR gene identification.'],
      ],
    },

    /* ── EXPRESSION ── */
    { id:'heatmap',    cat:'expression', page:'heatmap',     color:'#e3b341', time:'2h',
      name:'Expression Visualiser',
      why:'Differential expression is the most common RNA-seq output; interpreting it correctly is critical.',
      objectives:[
        'Input DESeq2/edgeR output and generate a volcano plot',
        'Build and cluster a heatmap of top differentially expressed genes',
        'Apply log₂FC and FDR thresholds to define significance',
        'Interpret up- vs down-regulated genes in biological context',
      ],
      concepts:[
        ['log₂FC','Log₂ fold change: log₂(treated/control). Values >1 mean 2-fold up-regulated.'],
        ['FDR','False Discovery Rate (Benjamini-Hochberg corrected p-value). <0.05 is standard.'],
        ['Volcano Plot','Scatter of log₂FC (x) vs −log₁₀(FDR) (y); hits appear top-left or top-right.'],
        ['Heatmap','Colour-coded matrix of expression values; rows = genes, columns = samples.'],
        ['Hierarchical Clustering','Groups genes/samples by expression similarity; reveals co-expression modules.'],
      ],
    },
    { id:'single-cell',cat:'expression', page:'single-cell', color:'#bc8cff', time:'2.5h',
      name:'scRNA-seq Explorer',
      why:'Single-cell resolution reveals heterogeneity invisible to bulk RNA-seq — crucial for immunity and cancer.',
      objectives:[
        'Describe the 10x Genomics Chromium library preparation workflow',
        'Interpret UMAP embeddings and identify cell clusters',
        'Annotate cell types using canonical marker genes',
        'Compare scRNA-seq data across conditions or donors',
      ],
      concepts:[
        ['UMAP','Uniform Manifold Approximation & Projection: non-linear dimensionality reduction.'],
        ['Leiden/Louvain','Graph-based clustering algorithms for identifying cell communities.'],
        ['Cell Barcode','Short DNA sequence identifying reads from one cell in a 10x library.'],
        ['UMI','Unique Molecular Identifier: counts transcripts without PCR amplification bias.'],
        ['Marker Gene','Gene highly expressed in one cluster; used to annotate cell identity.'],
      ],
    },
    { id:'proteomics', cat:'expression', page:'proteomics',  color:'#bc8cff', time:'2h',
      name:'Proteomics Fundamentals',
      why:'The proteome is the functional output of the genome — proteins are what diseases actually disrupt.',
      objectives:[
        'Describe the LC-MS/MS data acquisition workflow',
        'Explain peptide identification by database searching (Mascot, MaxQuant)',
        'Distinguish label-free from iTRAQ/TMT quantification strategies',
        'Interpret protein expression differences in African disease proteomes',
      ],
      concepts:[
        ['LC-MS/MS','Liquid chromatography + tandem mass spectrometry; the workhorse of proteomics.'],
        ['Peptide','Short amino acid chain produced by protease (usually trypsin) digestion of proteins.'],
        ['m/z','Mass-to-charge ratio: the unit mass spectrometers measure.'],
        ['FDR 1%','Standard confidence threshold for peptide-spectrum match acceptance.'],
        ['iTRAQ','Isobaric Tag for Relative and Absolute Quantification; 8-plex multiplexing reagent.'],
      ],
    },
    { id:'epigenomics',cat:'expression', page:'epigenomics', color:'#3fb950', time:'2h',
      name:'Epigenomics Explorer',
      why:'Epigenetic marks explain why identical genomes produce different cell types and disease risks.',
      objectives:[
        'Differentiate DNA methylation, histone modification, and chromatin accessibility assays',
        'Interpret bisulfite sequencing (WGBS) methylation profiles',
        'Analyse ATAC-seq peaks as proxies for open chromatin',
        'Contextualise epigenetic findings in African disease studies',
      ],
      concepts:[
        ['CpG Methylation','Addition of a methyl group to cytosine in CpG dinucleotides; silences promoters.'],
        ['H3K27ac','Histone H3 lysine 27 acetylation; marks active enhancers.'],
        ['ATAC-seq','Assay for Transposase-Accessible Chromatin; maps open chromatin genome-wide.'],
        ['Bisulfite Sequencing','Chemical conversion unmethylated C→T; sequencing reveals methylation state.'],
        ['DMR','Differentially Methylated Region: locus with methylation differences between conditions.'],
      ],
    },

    /* ── PIPELINES ── */
    { id:'pipeline-visual',cat:'pipelines', page:'pipeline-visual', color:'#e3b341', time:'2h',
      name:'Pipeline Visualiser',
      why:'Understanding the full WGS/RNA-seq pipeline before running it prevents the most common errors.',
      objectives:[
        'Navigate node-by-node visualisation of WGS, RNA-seq, and Nanopore pipelines',
        'Identify the tool, input format, and output format for each step',
        'Explain why each QC checkpoint exists and what it catches',
        'Customise the pipeline for low-coverage vs deep-sequencing scenarios',
      ],
      concepts:[
        ['BWA-MEM2','Short-read aligner; maps Illumina reads to a reference using BWT-FM index.'],
        ['GATK HaplotypeCaller','Variant caller; uses local de novo assembly of active regions.'],
        ['STAR','Spliced aligner for RNA-seq; handles exon-spanning reads efficiently.'],
        ['featureCounts','Counts reads overlapping annotated genomic features (genes, exons).'],
        ['Nextflow/Snakemake','Workflow languages for reproducible, scalable bioinformatics pipelines.'],
      ],
    },
    { id:'terminal',   cat:'pipelines', page:'terminal',     color:'#3fb950', time:'2h',
      name:'Terminal Simulator',
      why:'Command-line fluency is non-negotiable for bioinformatics — all production pipelines run at the terminal.',
      objectives:[
        'Navigate the Linux filesystem and manage files/directories',
        'Run simulated FastQC, BWA, samtools, and GATK commands',
        'Write and submit SLURM job scripts for HPC environments',
        'Chain commands with pipes and redirect output to files',
      ],
      concepts:[
        ['stdin/stdout/stderr','Three standard I/O streams; piping redirects stdout to another command\'s stdin.'],
        ['SLURM','Resource manager for HPC; schedules jobs via sbatch and squeue.'],
        ['Conda environment','Isolated package environment preventing version conflicts.'],
        ['Samtools','Swiss-army knife for BAM/SAM: sort, index, flagstat, view, depth.'],
        ['Pipe (|)','Redirects output of one command as input to the next without a temp file.'],
      ],
    },
    { id:'kraken',     cat:'pipelines', page:'kraken',       color:'#e3b341', time:'1.5h',
      name:'Metagenomics (Kraken2)',
      why:'Metagenomics identifies pathogens directly from clinical samples without culture — transformative for African diagnostics.',
      objectives:[
        'Classify metagenomic reads at species level using the Kraken2 k-mer approach',
        'Interpret Bracken-corrected abundance estimates',
        'Distinguish host reads from microbial reads',
        'Analyse 6 African gut and clinical microbiome profiles',
      ],
      concepts:[
        ['k-mer','Short DNA string of length k; Kraken2 uses 31-mers for rapid taxonomic classification.'],
        ['Bracken','Bayesian re-estimation of abundance from Kraken2 classifications.'],
        ['Alpha Diversity','Diversity within a sample (Shannon index, species richness).'],
        ['Beta Diversity','Diversity between samples (Bray-Curtis dissimilarity, UniFrac distance).'],
        ['OTU','Operational Taxonomic Unit: cluster of reads as a proxy for a microbial species.'],
      ],
    },
    { id:'popstruct',  cat:'pipelines', page:'popstruct',    color:'#bc8cff', time:'2h',
      name:'Population Structure',
      why:'African populations show the highest genetic diversity on Earth; ignoring this creates biased research.',
      objectives:[
        'Perform ADMIXTURE analysis and interpret K-value ancestry bars',
        'Run PCA on genotype data and interpret principal components',
        'Detect population stratification as a GWAS confounder',
        'Compare AWI-Gen and H3Africa population structure results',
      ],
      concepts:[
        ['PCA','Principal Component Analysis: reduces SNP matrix to orthogonal components.'],
        ['ADMIXTURE','Model-based clustering of individuals into K ancestral populations.'],
        ['FST','Fixation index: measure of genetic differentiation (0 = none, 1 = complete).'],
        ['Linkage Disequilibrium (LD)','Non-random association of alleles at different loci.'],
        ['AWI-Gen','Africa Wits-INDEPTH Partnership for Genomic Studies; major African GWAS cohort.'],
      ],
    },

    /* ── AFRICAN GENOMICS ── */
    { id:'africa',     cat:'africa',    page:'africa',       color:'#f97316', time:'2h',
      name:'Africa Hub',
      why:'The most genetically diverse continent remains the most under-sequenced — this must change.',
      objectives:[
        'Describe the H3Africa Consortium structure and member institutions',
        'Identify genomics infrastructure across 54 African nations',
        'Navigate African-specific datasets (AWI-Gen, H3Africa Biobank, APCDR)',
        'Apply African GWAS findings to disease interpretation',
      ],
      concepts:[
        ['H3Africa','Human Heredity & Health in Africa initiative; the largest African genomics network.'],
        ['AWI-Gen','Africa Wits-INDEPTH Partnership for Genomic Studies; 10,000+ participants.'],
        ['APCDR','African Partnership for Chronic Disease Research; cardiometabolic focus.'],
        ['SANBI','South African National Bioinformatics Institute; genomics training and infrastructure.'],
        ['Data Sovereignty','Principle that African genomic data should be controlled by African institutions.'],
      ],
    },
    { id:'bioethics',  cat:'africa',    page:'bioethics',    color:'#f97316', time:'1.5h',
      name:'Bioethics Hub',
      why:'Ethical genomics research in Africa requires understanding local consent frameworks and data governance.',
      objectives:[
        'Apply the CONTEST framework for community engagement in genomics research',
        'Distinguish individual from community consent in African research contexts',
        'Interpret the Nagoya Protocol on access and benefit sharing',
        'Evaluate ethical dimensions of a genomics case study',
      ],
      concepts:[
        ['CONTEST','Community Engagement for Genomics in Africa: structured ethical recruitment framework.'],
        ['Community Consent','Consent from a community leader/council in addition to individual consent.'],
        ['Nagoya Protocol','International treaty on access and benefit-sharing of genetic resources.'],
        ['FAIR Principles','Findable, Accessible, Interoperable, Reusable — principles for data sharing.'],
        ['Return of Results','Ethical obligation to report clinically actionable findings to participants.'],
      ],
    },
    { id:'pathogen-tracker', cat:'africa', page:'pathogen-tracker', color:'#ff6b6b', time:'1h',
      name:'Pathogen Tracker',
      why:'Africa leads in endemic infectious disease burden; genomic surveillance enables earlier outbreak detection.',
      objectives:[
        'Track genomic variants of SARS-CoV-2, TB, malaria, and mpox in Africa',
        'Interpret lineage designations (Pango, Nextstrain clades)',
        'Correlate genomic data with clinical severity metadata',
        'Identify emerging drug resistance or immune-escape mutations',
      ],
      concepts:[
        ['Pango Lineage','Hierarchical naming system for SARS-CoV-2 variants (e.g. BA.2.86).'],
        ['Nextstrain Clade','Alternative SARS-CoV-2 classification used by CDC and WHO.'],
        ['Phylodynamics','Integration of phylogenetics with epidemiological models.'],
        ['GISAID','Global platform for sharing influenza and SARS-CoV-2 genome sequences.'],
        ['Variant of Concern','Pathogen variant with increased transmissibility, severity, or immune evasion.'],
      ],
    },

    /* ── RESEARCH ── */
    { id:'research',   cat:'research',  page:'research',     color:'#bc8cff', time:'2h',
      name:'Research Mode',
      why:'Study design errors are the leading reason for retraction — planning rigorously saves years.',
      objectives:[
        'Apply the PICO framework to formulate a research question',
        'Select an appropriate study design (case-control, cohort, cross-sectional)',
        'Score a study plan using FAIR principles',
        'Estimate required sample size for a genomics study',
      ],
      concepts:[
        ['PICO','Population, Intervention/Exposure, Comparator, Outcome — study design framework.'],
        ['Power Analysis','Statistical calculation of the sample size needed to detect an effect at α, β.'],
        ['Confounder','Variable correlated with both exposure and outcome, distorting the association.'],
        ['Pre-registration','Posting a study plan publicly before data collection; prevents p-hacking.'],
        ['FAIR Data','Findable, Accessible, Interoperable, Reusable — guiding principles for data.'],
      ],
    },
    { id:'grant',      cat:'research',  page:'grant',        color:'#e3b341', time:'2h',
      name:'Grant Generator',
      why:'Research funding is the bottleneck for African genomics — strong grants directly accelerate science.',
      objectives:[
        'Draft NIH Fogarty Aims, Background, and Methods sections',
        'Generate Wellcome Trust grant language for Africa-specific focus areas',
        'Write H3Africa application sections (ethics, data sharing, training)',
        'Build a realistic budget justification for sequencing projects',
      ],
      concepts:[
        ['Specific Aims','1-page NIH section summarising hypothesis and 3 aims; the most-read section.'],
        ['Budget Justification','Narrative explaining each line-item in the grant budget.'],
        ['F&A Rate','Facilities & Administrative (indirect) costs rate charged by the institution.'],
        ['Impact Score','NIH reviewer score 1–9; below 2.0 typically required for funding.'],
        ['LOI','Letter of Intent: pre-application notice required by some funders.'],
      ],
    },
    { id:'peerreview', cat:'research',  page:'peerreview',   color:'#bc8cff', time:'2h',
      name:'Peer Review Simulator',
      why:'Learning to give and receive rigorous peer review makes you a better scientist and communicator.',
      objectives:[
        'Submit a genomics manuscript for review by 3 virtual reviewers',
        'Interpret structured rubric-based feedback on methods and results',
        'Identify common weaknesses in genomics manuscripts',
        'Revise a manuscript in response to reviewer comments',
      ],
      concepts:[
        ['Double-blind Review','Both reviewer and author identities are concealed.'],
        ['Major Revision','Decision requiring substantial changes and typically re-review.'],
        ['Methods Reproducibility','Degree to which methods are described in enough detail to replicate.'],
        ['Statistical Power','Probability of detecting a true effect; often under-powered in small cohorts.'],
        ['Reporting Bias','Tendency to publish positive results only; countered by pre-registration.'],
      ],
    },

    /* ── TRAINING ── */
    { id:'certification', cat:'training', page:'certification', color:'#e3b341', time:'1h',
      name:'Certification',
      why:'Open Badge 3.0 credentials are verifiable, shareable, and internationally recognised.',
      objectives:[
        'Earn a completion badge for each major OmicsLab module',
        'Generate a verifiable Open Badge 3.0 credential with W3C VC metadata',
        'Export a PDF certificate for institutional submission',
        'Share badges via LinkedIn, email, and public badge URLs',
      ],
      concepts:[
        ['Open Badge 3.0','W3C Verifiable Credentials standard for digital learning achievements.'],
        ['W3C VC','Verifiable Credential: cryptographically signed, tamper-evident digital claim.'],
        ['Badge Assertion','JSON-LD document proving a specific person earned a specific badge.'],
        ['Digital Portfolio','Collection of verifiable achievements; increasingly required by employers.'],
      ],
    },
    { id:'quizbattle', cat:'training',  page:'quizbattle',   color:'#ff6b6b', time:'1h',
      name:'Quiz Battle',
      why:'Active recall through testing is proven to be the most effective study technique for retention.',
      objectives:[
        'Test knowledge across 12 omics categories with 65+ questions',
        'Compete in same-device multiplayer via BroadcastChannel API',
        'Track score improvements over repeated attempts',
        'Identify knowledge gaps from wrong-answer analysis',
      ],
      concepts:[
        ['Active Recall','Retrieval practice: testing rather than re-reading improves retention 50–80%.'],
        ['Spaced Repetition','Reviewing material at increasing intervals; optimises long-term memory.'],
        ['Knowledge Gap','Specific topic area with low correct-answer rates; prioritise for review.'],
        ['BroadcastChannel API','Browser API for real-time same-device tab communication without a server.'],
      ],
    },
    { id:'case-files', cat:'training',  page:'case-files',   color:'#f97316', time:'2.5h',
      name:'Genomics Case Files',
      why:'Case-based learning builds clinical reasoning — the skill used when interpreting real patient data.',
      objectives:[
        'Work through 5 cases: MDR-TB, sickle cell, COVID-19 outbreak, GWAS, and cancer',
        'Integrate multiple omics data types to reach a diagnosis or research conclusion',
        'Apply variant interpretation, phylogenetics, and expression analysis in context',
        'Document decisions and reasoning in a structured case report',
      ],
      concepts:[
        ['Differential Diagnosis','List of conditions consistent with a presentation; refined by test results.'],
        ['Integrative Omics','Combining genome, transcriptome, and proteome data for richer insight.'],
        ['Sickle Cell (HBB)','HBB p.Glu6Val (rs334) causes haemoglobin polymerisation; common in West Africa.'],
        ['MDR-TB WGS','Whole-genome sequencing of M. tuberculosis for resistance profiling.'],
        ['GWAS Case','Population study associating SNPs with a complex trait (e.g. hypertension, T2D).'],
      ],
    },
    { id:'career',     cat:'training',  page:'career',       color:'#bc8cff', time:'1h',
      name:'Career Pathfinder',
      why:'Bioinformatics career paths are diverse and poorly signposted — a roadmap saves years of trial and error.',
      objectives:[
        'Complete a skills assessment quiz to identify strengths and gaps',
        'Explore 8+ bioinformatics career tracks (clinical, academic, industry)',
        'Build a personalised skills roadmap using OmicsLab modules',
        'Discover African institutions and companies hiring bioinformaticians',
      ],
      concepts:[
        ['Clinical Bioinformatician','Analyses patient genomes in a clinical diagnostics or hospital setting.'],
        ['Research Scientist','Drives hypothesis-driven genomics in academia or research institutes.'],
        ['Bioinformatics Engineer','Builds pipelines and databases; primarily a software engineering role.'],
        ['Computational Epidemiologist','Applies genomic and statistical methods to population health.'],
        ['H3ABioNet','Pan-African bioinformatics network; key employer and training provider.'],
      ],
    },

  ]; /* end MODULES */

  /* ── State ── */
  let _cat = 'all', _sf = 'all', _q = '', _timers = {};

  /* ── Computed ── */
  function _progress() {
    const done = MODULES.filter(m => _getStatus(m.id) === 'completed').length;
    const ip   = MODULES.filter(m => _getStatus(m.id) === 'in-progress').length;
    return { done, ip, total: MODULES.length };
  }
  function _filtered() {
    return MODULES.filter(m => {
      if (_cat !== 'all' && m.cat !== _cat) return false;
      if (_sf === 'bookmarked' && !_isBm(m.id)) return false;
      if (_sf !== 'all' && _sf !== 'bookmarked' && _getStatus(m.id) !== _sf) return false;
      if (_q) {
        const q = _q.toLowerCase();
        if (!m.name.toLowerCase().includes(q) && !m.cat.includes(q) &&
            !m.concepts.some(([t]) => t.toLowerCase().includes(q)) &&
            !m.objectives.some(o => o.toLowerCase().includes(q))) return false;
      }
      return true;
    });
  }

  /* ── Render helpers ── */
  function _statusBadge(id) {
    const s = _getStatus(id);
    const L = {'not-started':'Not Started','in-progress':'In Progress','completed':'Completed'};
    const C = {'not-started':'sp-badge-ns','in-progress':'sp-badge-ip','completed':'sp-badge-done'};
    return `<span class="sp-status-badge ${C[s]}">${L[s]}</span>`;
  }

  function _cardHtml(m) {
    const status = _getStatus(m.id), note = _getNote(m.id), bmmed = _isBm(m.id);
    return `
<div class="sp-card" id="spc-${m.id}" data-cat="${m.cat}" style="--mc:${m.color}">
  <div class="sp-card-head" onclick="OmicsLab.StudyPack._toggle('${m.id}')">
    <div class="sp-card-left">
      <span class="sp-cat-tag" style="background:${m.color}22;color:${m.color}">${m.cat}</span>
      <span class="sp-card-name">${m.name}</span>
      ${note.trim() ? '<span class="sp-note-dot" title="Has notes"></span>' : ''}
    </div>
    <div class="sp-card-right">
      <span class="sp-time">${m.time}</span>
      ${_statusBadge(m.id)}
      <button class="sp-bm-btn${bmmed ? ' sp-bm-active' : ''}" title="Bookmark"
        onclick="event.stopPropagation();OmicsLab.StudyPack._bookmark('${m.id}')">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="${bmmed?'currentColor':'none'}" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
      </button>
      <svg class="sp-caret" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 9l6 6 6-6"/></svg>
    </div>
  </div>

  <div class="sp-card-body" id="spb-${m.id}" style="display:none">
    <p class="sp-why">${m.why}</p>

    <div class="sp-section-title">Learning Objectives</div>
    <ul class="sp-obj-list">
      ${m.objectives.map(o => `<li class="sp-obj-item">${o}</li>`).join('')}
    </ul>

    <div class="sp-section-title">Key Concepts</div>
    <div class="sp-concepts">
      ${m.concepts.map(([t,d]) => `
        <div class="sp-concept">
          <span class="sp-concept-term">${t}</span>
          <span class="sp-concept-def">${d}</span>
        </div>`).join('')}
    </div>

    <div class="sp-notes-area">
      <div class="sp-notes-head">
        <span class="sp-section-title" style="margin:0">My Notes</span>
        <span class="sp-save-ind" id="sp-si-${m.id}"></span>
      </div>
      <textarea class="sp-notes-ta" id="sp-ta-${m.id}"
        placeholder="Write your notes, summaries, or questions here&#10;&#10;Tip: try to explain each concept in your own words — that is the most effective way to learn."
        rows="5"
        oninput="OmicsLab.StudyPack._noteInput('${m.id}')">${note.replace(/</g,'&lt;')}</textarea>
      <div class="sp-notes-foot">
        <span class="sp-char-count" id="sp-cc-${m.id}">${note.length} chars</span>
      </div>
    </div>

    <div class="sp-card-actions">
      <select class="sp-status-sel" onchange="OmicsLab.StudyPack._setStatus('${m.id}',this.value)">
        <option value="not-started" ${status==='not-started'?'selected':''}>Not Started</option>
        <option value="in-progress" ${status==='in-progress'?'selected':''}>In Progress</option>
        <option value="completed"   ${status==='completed'  ?'selected':''}>Completed</option>
      </select>
      <button class="sp-open-btn" onclick="OmicsLab.Router.navigate('${m.page}')">
        Open Module
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
      </button>
    </div>
  </div>
</div>`;
  }

  function _progressHtml(p) {
    const pct = p.total ? Math.round((p.done / p.total) * 100) : 0;
    return `
<div class="sp-prog-stats">
  <span class="sp-prog-num">${p.done}<span class="sp-prog-den">/${p.total}</span></span>
  <span class="sp-prog-label">completed</span>
  <span class="sp-prog-sep"></span>
  <span class="sp-prog-ip">${p.ip} in progress</span>
</div>
<div class="sp-prog-bar-wrap"><div class="sp-prog-bar" style="width:${pct}%"></div></div>`;
  }

  /* ── Public: toggle accordion ── */
  function _toggle(id) {
    const body = document.getElementById('spb-' + id);
    if (!body) return;
    const open = body.style.display !== 'none';
    body.style.display = open ? 'none' : '';
    const card = document.getElementById('spc-' + id);
    if (card) card.classList.toggle('sp-card-open', !open);
  }

  /* ── Public: bookmark ── */
  function _bookmark(id) {
    const nowBm = _toggleBm(id);
    const btn = document.querySelector(`#spc-${id} .sp-bm-btn`);
    if (btn) {
      btn.classList.toggle('sp-bm-active', nowBm);
      btn.querySelector('svg').setAttribute('fill', nowBm ? 'currentColor' : 'none');
    }
    if (_sf === 'bookmarked') _refreshGrid();
  }

  /* ── Public: status change ── */
  function _setStatus(id, val) {
    _saveStatus(id, val);
    const card = document.getElementById('spc-' + id);
    if (card) {
      const badge = card.querySelector('.sp-status-badge');
      if (badge) badge.outerHTML = _statusBadge(id);
    }
    const pw = document.getElementById('sp-progress');
    if (pw) pw.innerHTML = _progressHtml(_progress());
  }

  /* ── Public: note input ── */
  function _noteInput(id) {
    const ta  = document.getElementById('sp-ta-'  + id);
    const ind = document.getElementById('sp-si-'  + id);
    const cc  = document.getElementById('sp-cc-'  + id);
    if (!ta) return;
    if (cc)  cc.textContent  = ta.value.length + ' chars';
    if (ind) ind.textContent = 'Saving…';
    clearTimeout(_timers[id]);
    _timers[id] = setTimeout(() => {
      _saveNote(id, ta.value);
      if (ind) {
        ind.textContent = 'Saved';
        setTimeout(() => { if (ind.textContent === 'Saved') ind.textContent = ''; }, 2000);
      }
      /* update dot */
      const card = document.getElementById('spc-' + id);
      if (card) {
        const dot  = card.querySelector('.sp-note-dot');
        const left = card.querySelector('.sp-card-left');
        if (ta.value.trim() && !dot && left) {
          const s = document.createElement('span');
          s.className = 'sp-note-dot'; s.title = 'Has notes';
          left.appendChild(s);
        } else if (!ta.value.trim() && dot) dot.remove();
      }
    }, 600);
  }

  /* ── Export all notes as .txt ── */
  function _exportNotes() {
    const lines = ['OmicsLab Study Pack — My Notes', '='.repeat(50), ''];
    MODULES.forEach(m => {
      const n = _getNote(m.id);
      if (!n.trim()) return;
      lines.push(`## ${m.name}  [${m.cat}]  Status: ${_getStatus(m.id)}`);
      lines.push(n.trim()); lines.push(''); lines.push('-'.repeat(40)); lines.push('');
    });
    if (lines.length <= 4) { alert('No notes to export yet.'); return; }
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'omicslab-study-notes.txt';
    a.click();
    URL.revokeObjectURL(a.href);
  }

  /* ── Filter callbacks ── */
  function onCat(id) {
    _cat = id;
    document.querySelectorAll('.sp-cat-btn').forEach(b => b.classList.toggle('sp-cat-active', b.dataset.cat === id));
    _refreshGrid();
  }
  function onStatus(id) {
    _sf = id;
    document.querySelectorAll('.sp-sf-btn').forEach(b => b.classList.toggle('sp-sf-active', b.dataset.sf === id));
    _refreshGrid();
  }
  function onSearch(val) { _q = val.trim(); _refreshGrid(); }

  function _refreshGrid() {
    const grid = document.getElementById('sp-grid');
    if (!grid) return;
    const list = _filtered();
    const cnt  = document.getElementById('sp-count');
    if (cnt) cnt.textContent = list.length + ' module' + (list.length !== 1 ? 's' : '');
    grid.innerHTML = list.length ? list.map(_cardHtml).join('') : '<div class="sp-empty">No modules match your filters.</div>';
  }

  /* ── Init ── */
  function init() {
    const el = document.getElementById('study-section');
    if (!el || el.dataset.spReady) return;
    el.dataset.spReady = '1';

    const p = _progress();
    const catCounts = Object.fromEntries(
      CATS.map(c => [c.id, c.id === 'all' ? MODULES.length : MODULES.filter(m => m.cat === c.id).length])
    );
    const sfOpts = [
      {id:'all',label:'All'},{id:'not-started',label:'Not Started'},
      {id:'in-progress',label:'In Progress'},{id:'completed',label:'Completed'},
      {id:'bookmarked',label:'Bookmarked'},
    ];

    el.innerHTML = `
<div class="sp-wrap">
  <div class="sp-header">
    <div class="sp-header-inner">
      <div class="sp-header-top">
        <div>
          <div class="sp-eyebrow">OmicsLab · Structured Learning</div>
          <h1 class="sp-title">Study Pack</h1>
          <p class="sp-sub">Learning objectives, key concepts, and note-taking for ${MODULES.length} core modules. Notes are saved locally — private to your browser.</p>
        </div>
        <button class="sp-export-btn" onclick="OmicsLab.StudyPack._exportNotes()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Export Notes
        </button>
      </div>
      <div id="sp-progress" class="sp-progress-wrap">${_progressHtml(p)}</div>
    </div>
  </div>

  <div class="sp-body">
    <aside class="sp-sidebar">
      <div class="sp-search-wrap">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input class="sp-search" type="search" placeholder="Search modules…" oninput="OmicsLab.StudyPack.onSearch(this.value)">
      </div>
      <div class="sp-filter-group">
        <div class="sp-filter-label">Category</div>
        ${CATS.map(c => `
          <button class="sp-cat-btn${c.id===_cat?' sp-cat-active':''}" data-cat="${c.id}" onclick="OmicsLab.StudyPack.onCat('${c.id}')">
            <span>${c.label}</span><span class="sp-filter-count">${catCounts[c.id]}</span>
          </button>`).join('')}
      </div>
      <div class="sp-filter-group">
        <div class="sp-filter-label">Status</div>
        ${sfOpts.map(s => `
          <button class="sp-sf-btn${s.id===_sf?' sp-sf-active':''}" data-sf="${s.id}" onclick="OmicsLab.StudyPack.onStatus('${s.id}')">
            ${s.label}
          </button>`).join('')}
      </div>
    </aside>

    <main class="sp-main">
      <div class="sp-grid-head">
        <span id="sp-count" class="sp-count">${MODULES.length} modules</span>
      </div>
      <div id="sp-grid" class="sp-grid">${MODULES.map(_cardHtml).join('')}</div>
    </main>
  </div>
</div>`;
  }

  return { init, onCat, onStatus, onSearch, _toggle, _bookmark, _setStatus, _noteInput, _exportNotes };
})();
