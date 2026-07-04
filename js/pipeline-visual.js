/* ═══════════════════════════════════════════════════════════════
   OmicsLab — Visual Bioinformatics Pipeline Builder
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.PipelineVisual = (function () {

  const PIPELINES = {
    wgs: {
      name: 'WGS Variant Calling', abbr: 'WGS', color: '#58a6ff',
      description: 'GATK4 Best Practices pipeline for human whole-genome sequencing. Used by H3Africa, AWI-Gen, and most African WGS cohorts.',
      organism: 'Human (GRCh38)', reference: 'GATK4 Best Practices',
      nodes: [
        { id: 'fastqc', name: 'FastQC', version: 'v0.12.1', color: '#00C4A0', type: 'QC',
          inputs: ['FASTQ R1', 'FASTQ R2'], outputs: ['HTML Report', 'ZIP Archive'],
          purpose: 'Assess raw sequencing quality before any processing. Detects adapter contamination, GC bias, per-base quality drops, and overrepresented sequences.',
          params: [{ k: '-t', v: '4', d: 'CPU threads' }, { k: '--extract', v: '', d: 'Unzip output directory' }],
          time: '5 min', cpu: '4 cores', memory: '512 MB',
          tips: ['If adapter content >10%: add fastp/Trimmomatic before alignment', 'If per-base quality drops at 3\' end: trim last 15bp', 'GC content should match your organism (human ≈ 41%, M.tb ≈ 65%)'],
          afrContext: 'KEMRI runs FastQC on every sample before uploading to H3Africa data portal. All submissions require QC HTML reports.' },
        { id: 'fastp', name: 'fastp', version: 'v0.23.4', color: '#e3b341', type: 'Trim',
          inputs: ['Raw FASTQ R1/R2'], outputs: ['Clean FASTQ R1/R2', 'QC JSON', 'QC HTML'],
          purpose: 'Adapter trimming, quality filtering, duplicate removal, and UMI handling in a single fast pass. Generates its own QC report.',
          params: [{ k: '-w', v: '8', d: 'Worker threads' }, { k: '-q', v: '20', d: 'Min base quality' }, { k: '--length_required', v: '35', d: 'Discard reads shorter than 35bp' }, { k: '--detect_adapter_for_pe', v: '', d: 'Auto-detect PE adapters' }],
          time: '12 min', cpu: '8 cores', memory: '512 MB',
          tips: ['fastp auto-detects Illumina TruSeq, Nextera XT adapters', 'Do NOT over-trim — losing bases reduces variant sensitivity', 'Check JSON report for duplication level before MarkDuplicates'],
          afrContext: 'Standard preprocessing for all H3Africa WGS and Malaria Genomic Epidemiology Network (MalariaGEN) samples.' },
        { id: 'bwa', name: 'BWA-MEM2', version: 'v2.2.1', color: '#58a6ff', type: 'Align',
          inputs: ['Clean FASTQ R1/R2', 'GRCh38 FASTA'], outputs: ['SAM file'],
          purpose: 'Align short reads to the reference genome. The -R read group flag is MANDATORY for GATK — GATK will refuse to run without it.',
          params: [{ k: '-t', v: '16', d: 'Threads (use all cores)' }, { k: '-R', v: '"@RG\\tID:s\\tSM:s\\tPL:ILLUMINA\\tLB:lib"', d: 'Read group (required for GATK)' }],
          time: '45 min', cpu: '16 cores', memory: '28 GB',
          tips: ['Map rate <70%: check reference genome build (GRCh37 vs GRCh38)', 'For M. tuberculosis: use MTB H37Rv reference (NC_000962.3)', 'The read group SM: field becomes the sample name in final VCF'],
          afrContext: 'AWI-Gen used BWA-MEM (v1) for initial alignment; consortium has moved to BWA-MEM2 for 2× speed improvement on African server clusters.' },
        { id: 'samtools', name: 'samtools', version: 'v1.17', color: '#bc8cff', type: 'Process',
          inputs: ['SAM file'], outputs: ['Sorted BAM', 'BAM Index (.bai)'],
          purpose: 'Convert SAM to binary BAM, sort by genomic coordinate, and index for random access. Also used for flagstat QC and coverage calculation.',
          params: [{ k: 'sort -@ 8', v: '', d: 'Sort using 8 threads' }, { k: '-m 4G', v: '', d: '4GB RAM per thread' }, { k: 'index', v: '', d: 'Create .bai index' }],
          time: '18 min', cpu: '8 cores', memory: '4 GB',
          tips: ['Always run samtools flagstat to check % mapped reads', 'samtools depth | awk can calculate mean coverage', 'Coordinate-sorted BAM is required for all downstream GATK tools'],
          afrContext: 'samtools is the most universally used tool in African bioinformatics labs. Part of every WGS, RNA-seq, and metagenomics pipeline.' },
        { id: 'gatk', name: 'GATK HaplotypeCaller', version: 'v4.4.0', color: '#f97316', type: 'Variant Call',
          inputs: ['Sorted BAM', 'GRCh38 FASTA', 'dbSNP VCF'], outputs: ['gVCF'],
          purpose: 'Haplotype-based SNP and indel variant caller. Run in GVCF mode (-ERC GVCF) for cohort joint genotyping — this is the H3Africa standard.',
          params: [{ k: '-ERC GVCF', v: '', d: 'Emit gVCF for joint genotyping' }, { k: '--dbsnp', v: 'dbsnp.vcf.gz', d: 'dbSNP for annotation' }, { k: '-L', v: 'targets.bed', d: 'Restrict to target regions (optional)' }],
          time: '4 hours', cpu: '4 cores', memory: '8 GB',
          tips: ['For cohort analysis: run GenotypeGVCFs after HaplotypeCaller', 'VQSR recalibration requires >30 samples — use hard filters for smaller cohorts', 'African cohort: add known variants from AWI-Gen or 1000G AFR for VQSR training'],
          afrContext: 'H3Africa Consortium standard variant caller. All participating sites use GATK4 HaplotypeCaller for consistency and cross-site comparability.' },
        { id: 'vep', name: 'Ensembl VEP', version: 'v111', color: '#ff79c6', type: 'Annotate',
          inputs: ['VCF'], outputs: ['Annotated VCF', 'Summary HTML'],
          purpose: 'Annotate variants with gene names, consequence (missense, stop_gained, etc.), gnomAD allele frequencies, CADD pathogenicity scores, and ClinVar clinical significance.',
          params: [{ k: '--cache', v: '', d: 'Use local Ensembl cache (offline)' }, { k: '--af_gnomadg', v: '', d: 'gnomAD genome AF' }, { k: '--plugin CADD', v: '', d: 'CADD pathogenicity scores' }, { k: '--everything', v: '', d: 'Enable all standard annotations' }],
          time: '25 min', cpu: '4 cores', memory: '2 GB',
          tips: ['gnomAD-AFR allele frequencies are essential for African cohorts', 'CADD >20 = top 1% most deleterious variants in human genome', 'Use --pick_allele to get one consequence per variant for filtering'],
          afrContext: 'VEP gnomAD-AFR population should always be consulted for African variants. Many "rare" variants in European databases are common in African populations (and vice versa).' },
      ],
    },
    rnaseq: {
      name: 'Bulk RNA-seq DEG', abbr: 'RNA', color: '#f85149',
      description: 'Differential gene expression pipeline using STAR and DESeq2. Standard for African infectious disease transcriptomics studies.',
      organism: 'Human or pathogen', reference: 'Bioconductor DESeq2 workflow',
      nodes: [
        { id: 'fq-qc', name: 'FastQC', version: 'v0.12.1', color: '#00C4A0', type: 'QC', inputs: ['FASTQ R1/R2'], outputs: ['QC Report'],
          purpose: 'Assess RNA-seq read quality. RNA-seq often shows higher duplication (normal from amplification) and polyA contamination.', params: [{ k: '-t', v: '4', d: 'Threads' }], time: '4 min', cpu: '4 cores', memory: '256 MB',
          tips: ['High duplication in RNA-seq is expected — do NOT filter duplicates for DEG analysis', 'rRNA contamination shows as GC-content spike', 'Check overrepresented sequences for polyA tails'], afrContext: 'AHRI South Africa routinely QCs RNA-seq from TB patient blood before STAR alignment.' },
        { id: 'star', name: 'STAR', version: 'v2.7.11', color: '#58a6ff', type: 'Align', inputs: ['FASTQ R1/R2', 'Genome Index'], outputs: ['Sorted BAM', 'Log files'],
          purpose: 'Splice-aware aligner for RNA-seq. Handles exon-spanning reads. Generates a 2-pass alignment for highest sensitivity.',
          params: [{ k: '--runThreadN', v: '16', d: 'Threads' }, { k: '--twopassMode Basic', v: '', d: 'Two-pass alignment' }, { k: '--outSAMtype BAM SortedByCoordinate', v: '', d: 'Output sorted BAM' }, { k: '--quantMode GeneCounts', v: '', d: 'Count reads per gene' }],
          time: '35 min', cpu: '16 cores', memory: '32 GB',
          tips: ['Uniquely mapped reads should be >75% of total', 'STAR genome index requires 32GB RAM — pre-built indices save time', 'Multimapping >10% can indicate repetitive regions or contamination'],
          afrContext: 'MalariaGEN uses STAR for alignment of P. falciparum RNA-seq data against the 3D7 reference genome.' },
        { id: 'featurecounts', name: 'featureCounts', version: 'v2.0.6', color: '#e3b341', type: 'Quantify', inputs: ['Sorted BAM files', 'GTF annotation'], outputs: ['Count matrix', 'QC summary'],
          purpose: 'Count reads mapped to each gene from a set of BAM files. Produces a count matrix (genes × samples) for DESeq2 input.',
          params: [{ k: '-T', v: '8', d: 'Threads' }, { k: '-p', v: '', d: 'Paired-end reads' }, { k: '-s', v: '1', d: 'Strand-specific (check library)' }, { k: '-t exon', v: '', d: 'Count at exon level' }],
          time: '8 min', cpu: '8 cores', memory: '1 GB',
          tips: ['Check assignment rate in QC summary (>60% is good)', 'Wrong strand flag (-s) is the #1 cause of all-zeros count matrix', 'Use Salmon/Kallisto for faster transcript-level quantification'],
          afrContext: 'featureCounts is used by the KEMRI RNA-seq pipeline for all infectious disease transcriptomics studies.' },
        { id: 'deseq2', name: 'DESeq2', version: 'v1.40', color: '#bc8cff', type: 'DEG Analysis', inputs: ['Count matrix', 'Sample metadata'], outputs: ['DEG results table', 'MA plot', 'PCA plot'],
          purpose: 'Negative binomial model for differential gene expression. Handles low counts, normalizes for library size, and controls for multiple testing (BH-adjusted p-values).',
          params: [{ k: 'design = ~condition', v: '', d: 'Model formula' }, { k: 'lfcShrinkage', v: 'apeglm', d: 'Shrink log2FC estimates' }, { k: 'alpha = 0.05', v: '', d: 'FDR threshold' }],
          time: '5 min', cpu: '4 cores', memory: '4 GB',
          tips: ['Minimum 3 biological replicates per condition for statistical power', 'PCA plot should show samples clustering by condition, not batch', 'If samples cluster by batch: add batch to model design = ~batch + condition'],
          afrContext: 'DESeq2 is the gold standard for African disease transcriptomics (TB blood signatures, malaria PBMC studies, COVID-19 severity). Used in all H3Africa RNA-seq analyses.' },
        { id: 'volcano', name: 'Volcano Plot', version: 'R/ggplot2', color: '#f85149', type: 'Visualise', inputs: ['DESeq2 results'], outputs: ['Volcano SVG', 'Top DEG list'],
          purpose: 'Visualize differential expression results: X-axis = log2 fold change, Y-axis = -log10(adjusted p-value). Genes above horizontal line (padj<0.05) and outside vertical lines (|log2FC|≥1) are significant.',
          params: [{ k: 'padj_cutoff', v: '0.05', d: 'FDR significance threshold' }, { k: 'lfc_cutoff', v: '1.0', d: 'Log2 fold change threshold' }],
          time: '2 min', cpu: '1 core', memory: '256 MB',
          tips: ['Label top 10 DEGs by significance for publication', 'Color by regulation direction (red=up, blue=down)', 'GBP5 and BATF2 are Africa TB blood signature markers — always check they appear'],
          afrContext: 'The RNA Atlas module in OmicsLab shows interactive volcano plots for African malaria, TB, and COVID-19 disease cohorts.' },
      ],
    },
    metagenomics: {
      name: 'Metagenomics Profiling', abbr: 'META', color: '#f97316',
      description: 'Taxonomic classification of metagenomic samples using Kraken2+Bracken. Used for African gut microbiome, environmental surveillance, and clinical pathogen detection.',
      organism: 'Environmental / clinical sample', reference: 'Kraken2 + Bracken workflow',
      nodes: [
        { id: 'fastp-m', name: 'fastp', version: 'v0.23.4', color: '#e3b341', type: 'Trim', inputs: ['Raw FASTQ R1/R2'], outputs: ['Clean FASTQ'],
          purpose: 'Remove low-quality reads and adapters. Critical for metagenomics — contaminant reads can create false species classifications.',
          params: [{ k: '-q', v: '20', d: 'Min base quality' }, { k: '--length_required', v: '50', d: 'Min read length' }, { k: '-w', v: '8', d: 'Threads' }],
          time: '10 min', cpu: '8 cores', memory: '512 MB',
          tips: ['Stringent quality filtering improves classification accuracy', 'Remove human host reads with Bowtie2 before Kraken2 for clinical samples'],
          afrContext: 'Africa gut microbiome studies (AWI-Gen, MicrobiAfrica) use fastp preprocessing before taxonomic classification.' },
        { id: 'kraken2', name: 'Kraken2', version: 'v2.1.3', color: '#f97316', type: 'Classify', inputs: ['Clean FASTQ', 'Kraken2 DB'], outputs: ['Classification report', 'Output file'],
          purpose: 'k-mer exact matching against a reference database. Classifies each read to the most specific taxon possible. Extremely fast but database-dependent.',
          params: [{ k: '--db', v: 'k2_standard_20230605', d: 'Standard database' }, { k: '--threads', v: '16', d: 'Threads' }, { k: '--report', v: 'report.txt', d: 'Sample report' }, { k: '--paired', v: '', d: 'Paired-end reads' }],
          time: '20 min', cpu: '16 cores', memory: '60 GB',
          tips: ['Classification rate <30% often means wrong database or degraded sample', 'Standard DB (60GB) covers bacteria, archaea, virus, human', 'For Africa: add PlasmoDB (P. falciparum) to custom database'],
          afrContext: 'KEMRI uses Kraken2 with a custom database including African pathogen genomes for clinical metagenomics.' },
        { id: 'bracken', name: 'Bracken', version: 'v2.9', color: '#bc8cff', type: 'Quantify', inputs: ['Kraken2 report'], outputs: ['Abundance estimates', 'Bracken report'],
          purpose: 'Re-estimates species-level abundances from Kraken2 genus/species-level reads using Bayesian statistics. More accurate than raw Kraken2 counts for abundance.',
          params: [{ k: '-r', v: '150', d: 'Read length (match your data)' }, { k: '-l', v: 'S', d: 'Classification level (S=species)' }, { k: '-t', v: '10', d: 'Min read threshold' }],
          time: '2 min', cpu: '1 core', memory: '512 MB',
          tips: ['Always use Bracken after Kraken2 for abundance — Kraken2 alone underestimates true abundance', 'Compare samples with Bray-Curtis dissimilarity for community analysis'],
          afrContext: 'Bracken is used in the AWI-Gen microbiome sub-study for gut community profiling in Southern African populations.' },
        { id: 'krona', name: 'KronaTools', version: 'v2.8.1', color: '#00C4A0', type: 'Visualise', inputs: ['Bracken report'], outputs: ['Interactive Krona HTML'],
          purpose: 'Interactive radial tree visualization of taxonomic composition. Multi-level zoomable chart from kingdom down to species. Essential for presenting metagenomic community structure.',
          params: [{ k: 'ktImportTaxonomy', v: '', d: 'Import taxonomy classification' }, { k: '-t', v: '3', d: 'Taxonomy column' }, { k: '-s', v: '4', d: 'Score column' }],
          time: '1 min', cpu: '1 core', memory: '256 MB',
          tips: ['Krona requires internet for first use (taxonomy database download)', 'For publication: use ggplot2 or Microbiome Analyst for static figures'],
          afrContext: 'MicrobiAfrica consortium uses KronaTools to visualize taxonomic composition across 14 African populations.' },
      ],
    },
    nanopore: {
      name: 'Nanopore ARTIC (COVID)', abbr: 'ONT', color: '#00C4A0',
      description: 'Oxford Nanopore ARTIC amplicon sequencing pipeline for SARS-CoV-2 variant calling and lineage assignment. Used by Africa CDC and 15+ African SARS-CoV-2 surveillance programs.',
      organism: 'SARS-CoV-2', reference: 'ARTIC v4 / ARTIC Network',
      nodes: [
        { id: 'guppy', name: 'Guppy Basecaller', version: 'v6.5.7', color: '#50fa7b', type: 'Basecall', inputs: ['FAST5 raw signals'], outputs: ['FASTQ reads', 'Basecall summary'],
          purpose: 'Convert raw Nanopore electrical signals (FAST5) to nucleotide sequences (FASTQ). ONT\'s GPU-accelerated basecaller. High-accuracy (HAC) model recommended for clinical use.',
          params: [{ k: '--config', v: 'dna_r9.4.1_e8_hac@v3.3', d: 'High accuracy config' }, { k: '--device', v: 'cuda:0', d: 'GPU device' }, { k: '--min_qscore', v: '8', d: 'Min read quality' }],
          time: '20 min', cpu: 'GPU required', memory: '8 GB VRAM',
          tips: ['HAC model is 5× slower than FAST but needed for clinical accuracy', 'Without GPU, use Dorado basecaller on CPU (very slow, only for small datasets)', 'R10.4.1 flowcell + v4.3 config improves accuracy to >99%'],
          afrContext: 'KRISP (KwaZulu-Natal) ran real-time Guppy basecalling on GPU workstations to identify Beta, Delta, and Omicron variants days before global detection.' },
        { id: 'artic', name: 'ARTIC medaka', version: 'v1.6.0', color: '#00C4A0', type: 'Variant Call', inputs: ['FASTQ reads', 'Primer scheme'], outputs: ['Consensus FASTA', 'VCF'],
          purpose: 'ARTIC pipeline: demultiplexes amplicons, trims primers, aligns reads, and calls variants using medaka consensus. Produces reference-quality consensus genome.',
          params: [{ k: '--medaka', v: '', d: 'Use medaka variant caller' }, { k: '--scheme-directory', v: 'artic/primer-schemes', d: 'Primer scheme location' }, { k: '--min-length', v: '400', d: 'Min amplicon length' }, { k: '--normalise', v: '200', d: 'Normalise coverage to 200×' }],
          time: '15 min', cpu: '8 cores', memory: '4 GB',
          tips: ['Minimum 20× coverage per amplicon for reliable consensus', 'Low coverage amplicons → failed ARTIC regions → gaps in consensus', 'Use --no-frameshifts to avoid erroneous insertions/deletions in consensus'],
          afrContext: 'ARTIC protocol + medaka pipeline generated the first published African SARS-CoV-2 sequences in 2020 (KEMRI, AHRI, UVRI). Over 180,000 African SARS-CoV-2 genomes on GISAID were processed with this exact pipeline.' },
        { id: 'nextclade', name: 'Nextclade', version: 'v3.0', color: '#58a6ff', type: 'Clade', inputs: ['Consensus FASTA'], outputs: ['Clade/lineage', 'QC report', 'AA mutations'],
          purpose: 'Phylogenetic clade assignment, quality control, and amino acid mutation identification for SARS-CoV-2. Integrates Pango lineage via integrated algorithm.',
          params: [{ k: '--dataset-name', v: 'sars-cov-2', d: 'SARS-CoV-2 dataset' }, { k: '--output-tsv', v: 'results.tsv', d: 'Tab-separated output' }],
          time: '2 min', cpu: '4 cores', memory: '512 MB',
          tips: ['Nextclade replaces Pangolin for lineage calling as of 2024', 'QC score >80% indicates high-quality consensus', 'Check for frameshift warnings — often indicate primer dropout'],
          afrContext: 'Africa CDC uses Nextclade to monitor circulating variants across 54 countries in near real time. GISAID + Nextstrain allow tracking of variant spread patterns across Africa.' },
        { id: 'gisaid', name: 'GISAID Upload', version: '—', color: '#f97316', type: 'Share', inputs: ['Consensus FASTA', 'Metadata'], outputs: ['EPI_ISL accession'],
          purpose: 'Submit SARS-CoV-2 consensus sequences to GISAID for global surveillance. African sequences enable tracking of variant emergence and cross-border spread.',
          params: [{ k: 'EPI_ISL accession', v: '', d: 'Assigned after submission' }, { k: 'Collection date', v: 'YYYY-MM-DD', d: 'Sample collection date (required)' }, { k: 'Location', v: 'Africa / Country / Region', d: 'Geographic metadata' }],
          time: '5 min', cpu: '—', memory: '—',
          tips: ['Complete metadata improves usefulness of your sequences to global surveillance', 'GISAID requires at least 90% complete genome for standard submission', 'Africa CDC recommends <72h from sequencing to GISAID submission for outbreak response'],
          afrContext: 'African institutions collectively submitted >180,000 SARS-CoV-2 genomes to GISAID (2020-2024), revealing Beta, Delta, Omicron, and multiple sub-lineage emergences from Africa first.' },
      ],
    },
  };

  let _pipeline = PIPELINES.wgs;
  let _selectedNode = null;
  let _running = false;
  let _runProgress = [];

  function _nodeColor(node, done, running) {
    if (done) return { fill: 'rgba(0,196,160,0.15)', stroke: '#00C4A0', text: '#00C4A0' };
    if (running) return { fill: 'rgba(227,179,65,0.15)', stroke: '#e3b341', text: '#e3b341' };
    if (_selectedNode && _selectedNode.id === node.id) return { fill: `rgba(${_hexToRgb(node.color)},0.15)`, stroke: node.color, text: node.color };
    return { fill: 'rgba(255,255,255,0.03)', stroke: '#243048', text: '#A8A098' };
  }

  function _hexToRgb(hex) {
    const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
    return `${r},${g},${b}`;
  }

  function _buildSVG() {
    const nodes = _pipeline.nodes;
    const N = nodes.length;
    const NW = 138, NH = 68, GAP = 52;
    const COLS = Math.ceil(N / 2);
    const W = COLS * (NW + GAP) + 32, H = N > 4 ? 230 : 130;
    const ROW1 = Math.ceil(N / 2), ROW2 = Math.floor(N / 2);

    let svg = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:${W}px;display:block">`;
    svg += `<defs><marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="#243048"/></marker></defs>`;

    // Layout: 1 or 2 rows
    const positions = nodes.map((node, i) => {
      if (N <= 4) {
        // Single row
        return { x: 16 + i * (NW + GAP) + NW / 2, y: H / 2 };
      } else if (i < ROW1) {
        // Top row: left to right
        return { x: 16 + i * (NW + GAP) + NW / 2, y: 70 };
      } else {
        // Bottom row: right to left (snake)
        const j = N - 1 - i;
        return { x: 16 + j * (NW + GAP) + NW / 2, y: 170 };
      }
    });

    // Draw connections
    nodes.forEach((node, i) => {
      if (i === nodes.length - 1) return;
      const from = positions[i], to = positions[i + 1];
      const done = _runProgress[i];
      const lineColor = done ? '#00C4A0' : '#243048';

      if (from.y === to.y) {
        // Horizontal connection
        svg += `<line x1="${from.x + NW/2}" y1="${from.y}" x2="${to.x - NW/2}" y2="${to.y}" stroke="${lineColor}" stroke-width="1.5" marker-end="url(#arrowhead)"/>`;
      } else {
        // Curve down (snake turn)
        const mx = from.x + NW / 2 + 20;
        svg += `<path d="M ${from.x + NW/2} ${from.y} C ${mx} ${from.y}, ${mx} ${to.y}, ${to.x + NW/2} ${to.y}" fill="none" stroke="${lineColor}" stroke-width="1.5" stroke-dasharray="4,3"/>`;
      }
    });

    // Draw nodes
    nodes.forEach((node, i) => {
      const { x, y } = positions[i];
      const nx = x - NW / 2, ny = y - NH / 2;
      const done = _runProgress[i] === true;
      const running = _runProgress[i] === 'running';
      const c = _nodeColor(node, done, running);
      const isSelected = _selectedNode && _selectedNode.id === node.id;

      svg += `<g class="pvl-node" onclick="OmicsLab.PipelineVisual.selectNode(${i})" style="cursor:pointer">`;
      svg += `<rect x="${nx}" y="${ny}" width="${NW}" height="${NH}" rx="8" fill="${c.fill}" stroke="${c.stroke}" stroke-width="${isSelected ? 2 : 1.5}"/>`;
      // Type badge
      svg += `<rect x="${nx+6}" y="${ny+6}" width="${node.type.length * 5.8 + 8}" height="14" rx="3" fill="${node.color}" opacity="0.2"/>`;
      svg += `<text x="${nx+10}" y="${ny+17}" fill="${node.color}" font-size="8.5" font-weight="700" font-family="Inter,sans-serif">${node.type}</text>`;
      // Tool name
      svg += `<text x="${nx+NW/2}" y="${ny+36}" text-anchor="middle" fill="${c.text}" font-size="11.5" font-weight="800" font-family="Sora,Inter,sans-serif">${node.name}</text>`;
      // Version
      svg += `<text x="${nx+NW/2}" y="${ny+50}" text-anchor="middle" fill="#6E6860" font-size="9" font-family="monospace">${node.version}</text>`;
      // Done checkmark
      if (done) svg += `<text x="${nx+NW-10}" y="${ny+14}" fill="#00C4A0" font-size="13">✓</text>`;
      if (running) svg += `<text x="${nx+NW-10}" y="${ny+14}" fill="#e3b341" font-size="11">▶</text>`;
      svg += '</g>';
    });

    svg += '</svg>';
    return svg;
  }

  function _renderNodeDetail() {
    const el = document.getElementById('pvl-detail');
    if (!el) return;
    if (!_selectedNode) {
      el.innerHTML = `<div class="pvl-detail-hint">Click any tool in the pipeline to see parameters, tips, and African context.</div>`;
      return;
    }
    const n = _selectedNode;
    el.innerHTML = `
      <div class="pvl-detail-header" style="border-color:${n.color}">
        <div class="pvl-detail-name" style="color:${n.color}">${n.name}</div>
        <div class="pvl-detail-ver">${n.version}</div>
        <span class="pvl-type-badge" style="background:${n.color}20;color:${n.color}">${n.type}</span>
      </div>
      <p class="pvl-detail-purpose">${n.purpose}</p>
      <div class="pvl-detail-section">IO</div>
      <div class="pvl-io-row">
        <div class="pvl-io-col">
          <div class="pvl-io-label">Inputs</div>
          ${n.inputs.map(i => `<div class="pvl-io-item pvl-input">${i}</div>`).join('')}
        </div>
        <div class="pvl-io-arrow">→</div>
        <div class="pvl-io-col">
          <div class="pvl-io-label">Outputs</div>
          ${n.outputs.map(o => `<div class="pvl-io-item pvl-output">${o}</div>`).join('')}
        </div>
      </div>
      <div class="pvl-detail-section">Key Parameters</div>
      <table class="pvl-params-tbl">
        ${n.params.map(p => `<tr><td class="pvl-param-key">${p.k}</td><td class="pvl-param-val">${p.v}</td><td class="pvl-param-desc">${p.d}</td></tr>`).join('')}
      </table>
      <div class="pvl-detail-section">Resources</div>
      <div class="pvl-resource-row">
        <span class="pvl-resource"><span class="pvl-r-label">Time</span>${n.time}</span>
        <span class="pvl-resource"><span class="pvl-r-label">CPU</span>${n.cpu}</span>
        <span class="pvl-resource"><span class="pvl-r-label">RAM</span>${n.memory}</span>
      </div>
      <div class="pvl-detail-section">Tips</div>
      <ul class="pvl-tips">${n.tips.map(t => `<li>${t}</li>`).join('')}</ul>
      <div class="pvl-detail-section">Africa Context</div>
      <p class="pvl-africa-context">${n.afrContext}</p>`;
  }

  function _refreshSVG() {
    const el = document.getElementById('pvl-graph');
    if (el) el.innerHTML = _buildSVG();
  }

  async function _runPipeline() {
    if (_running) return;
    _running = true;
    _runProgress = [];
    _selectedNode = null;
    _renderNodeDetail();
    const btn = document.getElementById('pvl-run-btn');
    if (btn) btn.disabled = true;

    const nodes = _pipeline.nodes;
    for (let i = 0; i < nodes.length; i++) {
      _runProgress[i] = 'running';
      _refreshSVG();
      await new Promise(r => setTimeout(r, 900 + Math.random() * 400));
      _runProgress[i] = true;
      _refreshSVG();
      await new Promise(r => setTimeout(r, 200));
    }

    _running = false;
    if (btn) btn.disabled = false;
    const statusEl = document.getElementById('pvl-run-status');
    if (statusEl) {
      statusEl.textContent = `Pipeline complete — ${nodes.length} tools executed successfully`;
      statusEl.style.color = '#00C4A0';
      setTimeout(() => { if (statusEl) { statusEl.textContent = ''; _runProgress = []; _refreshSVG(); } }, 4000);
    }
  }

  function init() {
    const container = document.getElementById('pipeline-visual-content');
    if (!container) return;
    if (container.querySelector('.pvl-page')) return;

    container.innerHTML = `
<div class="pvl-page">
  <div class="pvl-header">
    <h1 class="pvl-title">Visual Pipeline Builder</h1>
    <p class="pvl-sub">Explore real bioinformatics pipelines as interactive node graphs. Click any tool to see parameters, resource requirements, common errors, and African research context. Run to simulate pipeline execution.</p>
  </div>

  <div class="pvl-pipeline-tabs">
    ${Object.entries(PIPELINES).map(([id, p]) => `
      <button class="pvl-pipe-btn${id==='wgs'?' active':''}" style="${id==='wgs'?`border-color:${p.color};background:${p.color}14`:''}"
              onclick="OmicsLab.PipelineVisual.selectPipeline('${id}', this)">
        <span class="pvl-pipe-abbr" style="color:${p.color}">${p.abbr}</span>
        <span class="pvl-pipe-name">${p.name}</span>
      </button>`).join('')}
  </div>

  <div class="pvl-meta-bar">
    <span id="pvl-desc"></span>
    <span class="pvl-meta-sep">·</span>
    <span id="pvl-org"></span>
    <span class="pvl-meta-sep">·</span>
    <span id="pvl-ref"></span>
  </div>

  <div class="pvl-layout">
    <div class="pvl-left">
      <div class="pvl-graph-card">
        <div id="pvl-graph" class="pvl-graph"></div>
        <div class="pvl-graph-footer">
          <button id="pvl-run-btn" class="pvl-run-btn" onclick="OmicsLab.PipelineVisual.run()">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            Run Pipeline
          </button>
          <span id="pvl-run-status" class="pvl-run-status"></span>
        </div>
      </div>
    </div>
    <aside class="pvl-sidebar">
      <div class="pvl-sb-title">Tool Details</div>
      <div id="pvl-detail" class="pvl-detail"></div>
    </aside>
  </div>
</div>`;

    _updateMeta();
    _refreshSVG();
    _renderNodeDetail();
  }

  function _updateMeta() {
    const p = _pipeline;
    const descEl = document.getElementById('pvl-desc');
    const orgEl = document.getElementById('pvl-org');
    const refEl = document.getElementById('pvl-ref');
    if (descEl) descEl.textContent = p.description;
    if (orgEl) orgEl.textContent = p.organism;
    if (refEl) refEl.textContent = p.reference;
  }

  function selectPipeline(id, btn) {
    _pipeline = PIPELINES[id] || PIPELINES.wgs;
    _selectedNode = null;
    _runProgress = [];
    document.querySelectorAll('.pvl-pipe-btn').forEach((b, i) => {
      const pid = Object.keys(PIPELINES)[i];
      const active = pid === id;
      b.classList.toggle('active', active);
      b.style.borderColor = active ? _pipeline.color : '';
      b.style.background = active ? _pipeline.color + '14' : '';
    });
    _updateMeta();
    _refreshSVG();
    _renderNodeDetail();
  }

  function selectNode(i) {
    const node = _pipeline.nodes[i];
    _selectedNode = (_selectedNode && _selectedNode.id === node.id) ? null : node;
    _refreshSVG();
    _renderNodeDetail();
  }

  function run() { _runPipeline(); }

  return { init, selectPipeline, selectNode, run };
})();
