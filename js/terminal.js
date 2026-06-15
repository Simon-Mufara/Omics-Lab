/* ═══════════════════════════════════════════════════════════════
   OmicsLab — Bioinformatics Terminal Simulator
   Simulates a real Linux bioinformatics environment in the browser.

   Supports: fastqc, bwa, samtools, gatk, star, salmon, fastp,
             snakemake, nextflow, bcftools, featurecounts, multiqc,
             trim-galore, bowtie2, hisat2, bedtools, picard, vep,
             plus standard Unix: ls, cd, mkdir, cat, echo, pwd, etc.
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.Terminal = (function () {

  /* ─── Virtual filesystem ─── */
  const VFS = {
    '/home/user': { type: 'dir' },
    '/home/user/workspace': { type: 'dir' },
    '/home/user/workspace/data': { type: 'dir' },
    '/home/user/workspace/data/sample_R1.fastq.gz': { type: 'file', size: '2.1G', desc: 'Raw reads (forward)' },
    '/home/user/workspace/data/sample_R2.fastq.gz': { type: 'file', size: '2.1G', desc: 'Raw reads (reverse)' },
    '/home/user/workspace/data/reference.fa': { type: 'file', size: '3.2G', desc: 'GRCh38 reference genome' },
    '/home/user/workspace/data/variants.vcf': { type: 'file', size: '48M', desc: 'Known variant sites' },
    '/home/user/workspace/data/annotation.gtf': { type: 'file', size: '880M', desc: 'Ensembl 109 annotation' },
    '/home/user/workspace/results': { type: 'dir' },
    '/home/user/workspace/scripts': { type: 'dir' },
    '/home/user/workspace/scripts/wgs_pipeline.sh': { type: 'file', size: '4.2K', desc: 'WGS analysis pipeline' },
    '/home/user/workspace/scripts/rnaseq_pipeline.sh': { type: 'file', size: '3.8K', desc: 'RNA-seq pipeline' },
  };

  let cwd = '/home/user/workspace';
  let history = [];
  let histIdx = -1;
  let _running = false;
  let _outputEl = null;
  let _inputEl = null;
  let _promptEl = null;
  let _runBtn = null;
  let _vfsDisplay = null;

  /* ─── Pipeline presets ─── */
  const PRESETS = [
    {
      id: 'wgs',
      icon: '🧬',
      name: 'WGS Pipeline',
      desc: 'BWA-MEM2 → GATK HaplotypeCaller',
      cmd: 'run-pipeline wgs',
      steps: [
        { label: 'FastQC (raw)', fn: _fastqc, args: ['data/sample_R1.fastq.gz', 'data/sample_R2.fastq.gz'] },
        { label: 'fastp trim',   fn: _fastp,  args: ['data/sample_R1.fastq.gz', 'data/sample_R2.fastq.gz'] },
        { label: 'BWA-MEM2 align', fn: _bwa, args: ['mem', '-t', '8', 'data/reference.fa', 'results/trimmed_R1.fastq.gz', 'results/trimmed_R2.fastq.gz', '-o', 'results/aligned.sam'] },
        { label: 'sam→bam+sort', fn: _samtools, args: ['sort', '-o', 'results/aligned.bam', 'results/aligned.sam'] },
        { label: 'MarkDuplicates', fn: _picard, args: ['MarkDuplicates'] },
        { label: 'BQSR', fn: _gatk,    args: ['BaseRecalibrator', '-I', 'results/dedup.bam', '-R', 'data/reference.fa', '--known-sites', 'data/variants.vcf', '-O', 'results/recal.table'] },
        { label: 'HaplotypeCaller', fn: _gatk, args: ['HaplotypeCaller', '-R', 'data/reference.fa', '-I', 'results/recal.bam', '-O', 'results/raw_variants.vcf'] },
        { label: 'VQSR / filter', fn: _gatk, args: ['VariantFiltration'] },
        { label: 'VEP annotate', fn: _vep, args: [] },
        { label: 'MultiQC report', fn: _multiqc, args: ['results/'] },
      ]
    },
    {
      id: 'rnaseq',
      icon: '📈',
      name: 'RNA-seq Pipeline',
      desc: 'STAR align → Salmon quant → DESeq2',
      cmd: 'run-pipeline rnaseq',
      steps: [
        { label: 'FastQC (raw)',  fn: _fastqc, args: ['data/sample_R1.fastq.gz'] },
        { label: 'Trim Galore',  fn: _trimGalore, args: [] },
        { label: 'STAR align',   fn: _star, args: [] },
        { label: 'featureCounts',fn: _featureCounts, args: [] },
        { label: 'Salmon quant', fn: _salmon, args: ['quant'] },
        { label: 'MultiQC',      fn: _multiqc, args: ['results/'] },
      ]
    },
    {
      id: 'variant',
      icon: '🔬',
      name: 'Variant Calling',
      desc: 'HISAT2 + bcftools mpileup',
      cmd: 'run-pipeline variant',
      steps: [
        { label: 'HISAT2 align', fn: _hisat2, args: [] },
        { label: 'sam→bam',     fn: _samtools, args: ['sort'] },
        { label: 'bcftools mpileup', fn: _bcftools, args: ['mpileup'] },
        { label: 'bcftools call',    fn: _bcftools, args: ['call'] },
        { label: 'bgzip+tabix',      fn: _bgzip,    args: [] },
      ]
    },
    {
      id: 'meta',
      icon: '🦠',
      name: 'Metagenomics',
      desc: 'Kraken2 classify → Bracken abundance',
      cmd: 'run-pipeline meta',
      steps: [
        { label: 'fastp QC',    fn: _fastp,   args: [] },
        { label: 'Kraken2',     fn: _kraken2, args: [] },
        { label: 'Bracken',     fn: _bracken, args: [] },
        { label: 'Krona plot',  fn: _krona,   args: [] },
      ]
    },
  ];

  /* ─── HTML helpers ─── */
  function _line(cls, ...parts) {
    const div = document.createElement('div');
    div.className = 'to-line';
    div.innerHTML = parts.map(([c, t]) => `<span class="${c}">${_esc(t)}</span>`).join('');
    _outputEl.appendChild(div);
    return div;
  }
  function _raw(html) {
    const div = document.createElement('div');
    div.innerHTML = html;
    _outputEl.appendChild(div);
  }
  function _blank() { _raw('<div class="to-blank"></div>'); }
  function _esc(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function _scroll() { _outputEl.scrollTop = _outputEl.scrollHeight; }

  function _echoCmd(cmd) {
    _line('to-line',
      ['to-prompt', `user@omicslab:${cwd.replace('/home/user', '~')}$`],
      ['to-cmd', ' ' + cmd]
    );
  }

  function _progress(label, pct) {
    const div = document.createElement('div');
    div.className = 'to-progress';
    div.innerHTML = `
      <span class="tp-label">${_esc(label)}</span>
      <span class="tp-bar"><span class="tp-fill" style="width:${pct}%"></span></span>
      <span class="tp-pct">${pct}%</span>`;
    _outputEl.appendChild(div);
    _scroll();
    return div;
  }

  async function _animateProgress(label, ms) {
    const div = _progress(label, 0);
    const fill = div.querySelector('.tp-fill');
    const pctEl = div.querySelector('.tp-pct');
    const steps = 18;
    const delay = ms / steps;
    for (let i = 1; i <= steps; i++) {
      await _sleep(delay);
      const p = Math.min(100, Math.round((i / steps) * 100));
      fill.style.width = p + '%';
      pctEl.textContent = p + '%';
      _scroll();
    }
  }

  function _sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

  /* ─── Tool simulation functions ─── */
  async function _fastqc(args) {
    const files = args.filter(a => !a.startsWith('-'));
    _line('to-line', ['to-info', `Started analysis in FastQC v0.12.1`]);
    for (const f of files) {
      await _animateProgress(`Analysing ${f.split('/').pop()}`, 900);
      const base = f.replace('.fastq.gz','').replace('.fastq','').split('/').pop();
      _addVFS(`results/${base}_fastqc.html`,'68K','new');
      _addVFS(`results/${base}_fastqc.zip`,'98K','new');
      _line('to-line', ['to-success', `✔ ${base}_fastqc.html written`]);
    }
    _line('to-line', ['to-success', 'Analysis complete for ' + files.length + ' file(s)']);
    return true;
  }

  async function _fastp(args) {
    _line('to-line', ['to-info', 'fastp v0.23.4 — Ultrafast all-in-one FASTQ preprocessor']);
    await _animateProgress('Detecting adapters', 400);
    await _animateProgress('Trimming reads',     900);
    await _animateProgress('Filtering quality',  400);
    _blank();
    _line('to-line', ['to-section', 'Summary:']);
    _line('to-line', ['to-stdout', '  Total reads:    '], ['to-number', '48,312,990']);
    _line('to-line', ['to-stdout', '  Passed filter:  '], ['to-success', '46,718,440 (96.70%)']);
    _line('to-line', ['to-stdout', '  Low quality:    '], ['to-warn',    '1,248,822  (2.58%)']);
    _line('to-line', ['to-stdout', '  Adapter trimmed:'], ['to-number',  '3,912,008  (8.10%)']);
    _line('to-line', ['to-stdout', '  Q30 rate:       '], ['to-success', '94.32%']);
    _blank();
    _addVFS('results/trimmed_R1.fastq.gz','1.9G','new');
    _addVFS('results/trimmed_R2.fastq.gz','1.9G','new');
    _addVFS('results/fastp.json','8.2K','new');
    _addVFS('results/fastp.html','312K','new');
    _line('to-line', ['to-success', '✔ fastp complete']);
    return true;
  }

  async function _bwa(args) {
    _line('to-line', ['to-info', 'BWA-MEM2 v2.2.1 (SMEM, AVX512 enabled)']);
    _line('to-line', ['to-stdout', `[M::bwa_idx_load_from_shm] loading BWT index from shm...`]);
    await _animateProgress('Loading index (BWT)', 500);
    await _animateProgress('Aligning reads',      2200);
    await _animateProgress('Writing SAM',         600);
    _blank();
    _line('to-line', ['to-stdout', '[M::mem_process_seqs] Processed 46,718,440 reads in 92.3 sec']);
    _line('to-line', ['to-stdout', '[main] Real time: 97.8 sec; CPU: 771.2 sec']);
    _addVFS('results/aligned.sam','18.2G','new');
    _line('to-line', ['to-success', '✔ Alignment complete']);
    return true;
  }

  async function _samtools(args) {
    const sub = args[0] || 'view';
    if (sub === 'sort') {
      _line('to-line', ['to-info', 'samtools v1.18 — sort']);
      await _animateProgress('Sorting BAM',   900);
      await _animateProgress('Building index',300);
      _addVFS('results/aligned.bam','6.4G','new');
      _addVFS('results/aligned.bam.bai','2.1M','new');
      _line('to-line', ['to-success', '✔ Sorted BAM written']);
    } else if (sub === 'flagstat') {
      _line('to-line', ['to-section', 'samtools flagstat:']);
      _line('to-line', ['to-number', '46718440 + 0 '], ['to-stdout', 'in total (QC-passed)']);
      _line('to-line', ['to-success', '45890321 + 0 '], ['to-stdout', 'mapped (98.23%)']);
      _line('to-line', ['to-number', '46718440 + 0 '], ['to-stdout', 'paired in sequencing']);
      _line('to-line', ['to-success', '23304112 + 0 '], ['to-stdout', 'properly paired (99.11%)']);
    } else if (sub === 'view') {
      _line('to-line', ['to-stdout', 'samtools view — viewing BAM records']);
      await _animateProgress('Reading BAM', 400);
    } else if (sub === 'stats') {
      _line('to-line', ['to-section', 'samtools stats:']);
      _line('to-line', ['to-stdout', 'SN  sequences:           46,718,440']);
      _line('to-line', ['to-stdout', 'SN  bases mapped:        6,912,483,560']);
      _line('to-line', ['to-stdout', 'SN  average quality:     36.2']);
      _line('to-line', ['to-stdout', 'SN  insert size average: 426']);
    }
    return true;
  }

  async function _picard(args) {
    _line('to-line', ['to-info', 'Picard v3.1.0 — MarkDuplicates']);
    await _animateProgress('Sorting reads',        700);
    await _animateProgress('Marking duplicates',   1100);
    await _animateProgress('Writing output BAM',   600);
    _blank();
    _line('to-line', ['to-section', 'METRICS SUMMARY:']);
    _line('to-line', ['to-stdout', '  ESTIMATED_LIBRARY_SIZE:    24,150,892']);
    _line('to-line', ['to-stdout', '  PERCENT_DUPLICATION:       '], ['to-warn', '0.0824 (8.24%)']);
    _line('to-line', ['to-stdout', '  READ_PAIRS_EXAMINED:       46,718,440']);
    _line('to-line', ['to-stdout', '  READ_PAIR_DUPLICATES:      3,849,279']);
    _addVFS('results/dedup.bam','5.9G','new');
    _addVFS('results/dedup.bam.bai','2.0M','new');
    _addVFS('results/dup_metrics.txt','1.2K','new');
    _line('to-line', ['to-success', '✔ MarkDuplicates complete']);
    return true;
  }

  async function _gatk(args) {
    const sub = args[0] || 'HaplotypeCaller';
    _line('to-line', ['to-info', `GATK v4.5.0.0 — ${sub}`]);
    if (sub === 'BaseRecalibrator') {
      await _animateProgress('Counting covariates', 1200);
      _addVFS('results/recal.table','28K','new');
      _line('to-line', ['to-success', '✔ BQSR table written']);
    } else if (sub === 'ApplyBQSR') {
      await _animateProgress('Applying recalibration', 900);
      _addVFS('results/recal.bam','5.8G','new');
      _line('to-line', ['to-success', '✔ Recalibrated BAM written']);
    } else if (sub === 'HaplotypeCaller') {
      await _animateProgress('Assembling haplotypes', 2400);
      _blank();
      _line('to-line', ['to-section', 'Variant discovery summary:']);
      _line('to-line', ['to-stdout', '  Total variants:   '], ['to-number', '4,892,341']);
      _line('to-line', ['to-stdout', '  SNPs:             '], ['to-success', '4,312,881']);
      _line('to-line', ['to-stdout', '  Indels:           '], ['to-warn',    '579,460']);
      _line('to-line', ['to-stdout', '  Ti/Tv ratio:      '], ['to-success', '2.18']);
      _addVFS('results/raw_variants.vcf.gz','342M','new');
      _addVFS('results/raw_variants.vcf.gz.tbi','1.2M','new');
      _line('to-line', ['to-success', '✔ HaplotypeCaller complete']);
    } else if (sub === 'VariantFiltration') {
      await _animateProgress('Applying VQSR filters', 700);
      _addVFS('results/filtered_variants.vcf.gz','298M','new');
      _line('to-line', ['to-success', '✔ Variant filtration complete']);
      _line('to-line', ['to-stdout', '  PASS variants: '], ['to-success', '4,218,902 (86.2%)']);
    } else if (sub === 'Mutect2') {
      await _animateProgress('Calling somatic variants', 2000);
      _addVFS('results/somatic_variants.vcf.gz','48M','new');
      _line('to-line', ['to-success', '✔ Mutect2 complete']);
    } else {
      await _animateProgress(`Running ${sub}`, 1000);
      _line('to-line', ['to-success', `✔ ${sub} complete`]);
    }
    return true;
  }

  async function _star(args) {
    _line('to-line', ['to-info', 'STAR v2.7.11b — Spliced Transcripts Alignment to a Reference']);
    await _animateProgress('Loading genome index',  600);
    await _animateProgress('1st pass alignment',    1400);
    await _animateProgress('Splice junction discovery', 500);
    await _animateProgress('2nd pass alignment',    1200);
    await _animateProgress('Writing BAM',           500);
    _blank();
    _line('to-line', ['to-section', 'Log summary:']);
    _line('to-line', ['to-stdout', '  Uniquely mapped reads:   '], ['to-success', '94.21%']);
    _line('to-line', ['to-stdout', '  Multi-mapped reads:      '], ['to-warn',    '3.12%']);
    _line('to-line', ['to-stdout', '  Unmapped reads:          '], ['to-number',  '2.67%']);
    _line('to-line', ['to-stdout', '  Splices:                 '], ['to-number',  '28,412,882']);
    _line('to-line', ['to-stdout', '  % reads with novel junctions: '], ['to-success', '0.54%']);
    _addVFS('results/Aligned.sortedByCoord.out.bam','4.2G','new');
    _addVFS('results/SJ.out.tab','2.8M','new');
    _addVFS('results/Log.final.out','2.4K','new');
    _line('to-line', ['to-success', '✔ STAR alignment complete']);
    return true;
  }

  async function _salmon(args) {
    const sub = args[0] || 'quant';
    _line('to-line', ['to-info', `Salmon v1.10.2 — ${sub}`]);
    if (sub === 'index') {
      await _animateProgress('Building k-mer index', 1200);
      _addVFS('results/salmon_index/','—','new');
      _line('to-line', ['to-success', '✔ Index built']);
    } else {
      await _animateProgress('Quasi-mapping reads',  900);
      await _animateProgress('EM quantification',    600);
      _blank();
      _line('to-line', ['to-stdout', '  Mapping rate: '], ['to-success', '91.34%']);
      _line('to-line', ['to-stdout', '  Transcripts:  '], ['to-number',  '228,418']);
      _addVFS('results/salmon_quant/quant.sf','3.8M','new');
      _addVFS('results/salmon_quant/cmd_info.json','420B','new');
      _line('to-line', ['to-success', '✔ Salmon quant complete']);
    }
    return true;
  }

  async function _featureCounts(args) {
    _line('to-line', ['to-info', 'featureCounts v2.0.6 (Subread package)']);
    await _animateProgress('Assigning reads', 900);
    _blank();
    _line('to-line', ['to-section', 'Assignment summary:']);
    _line('to-line', ['to-stdout', '  Assigned:               '], ['to-success', '87.44%']);
    _line('to-line', ['to-stdout', '  Unassigned_NoFeatures:  '], ['to-warn',    '9.12%']);
    _line('to-line', ['to-stdout', '  Unassigned_Ambiguity:   '], ['to-number',  '3.44%']);
    _addVFS('results/counts.txt','14.2M','new');
    _addVFS('results/counts.txt.summary','1.1K','new');
    _line('to-line', ['to-success', '✔ Feature counting complete']);
    return true;
  }

  async function _trimGalore(args) {
    _line('to-line', ['to-info', 'Trim Galore! v0.6.10 (Cutadapt wrapper)']);
    await _animateProgress('Adapter detection', 400);
    await _animateProgress('Quality trimming',  700);
    _line('to-line', ['to-stdout', '  Reads written (quality):   '], ['to-success', '97.12%']);
    _line('to-line', ['to-stdout', '  Total bases trimmed:       '], ['to-warn',    '1.24%']);
    _addVFS('results/trimmed_R1.fastq.gz','1.8G','new');
    _line('to-line', ['to-success', '✔ Trim Galore complete']);
    return true;
  }

  async function _hisat2(args) {
    _line('to-line', ['to-info', 'HISAT2 v2.2.1']);
    await _animateProgress('Loading HISAT2 index',    500);
    await _animateProgress('Aligning reads',          1500);
    _blank();
    _line('to-line', ['to-stdout', '  Overall alignment rate: '], ['to-success', '96.84%']);
    _line('to-line', ['to-stdout', '  Concordant pairs:       '], ['to-success', '94.21%']);
    _addVFS('results/hisat2_aligned.bam','4.8G','new');
    _line('to-line', ['to-success', '✔ HISAT2 alignment complete']);
    return true;
  }

  async function _bcftools(args) {
    const sub = args[0] || 'view';
    _line('to-line', ['to-info', `bcftools v1.19 — ${sub}`]);
    if (sub === 'mpileup') {
      await _animateProgress('Computing pileup', 1200);
    } else if (sub === 'call') {
      await _animateProgress('Calling variants',  900);
      _line('to-line', ['to-stdout', '  Variants called: '], ['to-number', '3,241,892']);
      _addVFS('results/calls.vcf.gz','214M','new');
    } else if (sub === 'stats') {
      _line('to-line', ['to-section', 'bcftools stats:']);
      _line('to-line', ['to-stdout', 'SN  number of SNPs:     3,012,882']);
      _line('to-line', ['to-stdout', 'SN  number of indels:   229,010']);
      _line('to-line', ['to-stdout', 'SN  number of MNPs:     8,412']);
      _line('to-line', ['to-stdout', 'TSTV  TS/TV ratio:      2.14']);
    } else {
      await _animateProgress(`bcftools ${sub}`, 600);
    }
    _line('to-line', ['to-success', `✔ bcftools ${sub} done`]);
    return true;
  }

  async function _bgzip(args) {
    _line('to-line', ['to-info', 'bgzip + tabix indexing']);
    await _animateProgress('bgzip compress',  400);
    await _animateProgress('tabix index',     300);
    _addVFS('results/calls.vcf.gz.tbi','840K','new');
    _line('to-line', ['to-success', '✔ bgzip+tabix done']);
    return true;
  }

  async function _kraken2(args) {
    _line('to-line', ['to-info', 'Kraken 2 v2.1.3']);
    await _animateProgress('Loading database',       800);
    await _animateProgress('Classifying reads',      1500);
    _blank();
    _line('to-line', ['to-stdout', '  Classified reads:    '], ['to-success', '89.34% (43,102,882)']);
    _line('to-line', ['to-stdout', '  Unclassified reads:  '], ['to-warn',    '10.66% (5,142,108)']);
    _addVFS('results/kraken2_output.txt','1.2G','new');
    _addVFS('results/kraken2_report.txt','48K','new');
    _line('to-line', ['to-success', '✔ Kraken2 classification done']);
    return true;
  }

  async function _bracken(args) {
    _line('to-line', ['to-info', 'Bracken v2.9 — Bayesian Re-estimation of Abundance']);
    await _animateProgress('Re-estimating species abundance', 700);
    _addVFS('results/bracken_output.txt','12K','new');
    _addVFS('results/bracken_species_report.txt','22K','new');
    _line('to-line', ['to-stdout', '  Top species: Homo sapiens (47.2%), Bacteroides fragilis (8.4%), ...']);
    _line('to-line', ['to-success', '✔ Bracken re-estimation done']);
    return true;
  }

  async function _krona(args) {
    _line('to-line', ['to-info', 'KronaTools — generating interactive HTML pie']);
    await _animateProgress('Building Krona chart', 400);
    _addVFS('results/krona_chart.html','2.8M','new');
    _line('to-line', ['to-success', '✔ Krona chart saved → results/krona_chart.html']);
    return true;
  }

  async function _multiqc(args) {
    _line('to-line', ['to-info', 'MultiQC v1.21']);
    _line('to-line', ['to-stdout', '  Searching for supported tools...']);
    const found = ['FastQC','fastp','STAR','featureCounts','Picard','GATK','Samtools'];
    for (const tool of found) {
      await _sleep(80);
      _line('to-line', ['to-info', `  Found ${tool} data`]);
    }
    await _animateProgress('Generating report', 700);
    _addVFS('results/multiqc_report.html','4.1M','new');
    _addVFS('results/multiqc_data/','—','new');
    _blank();
    _line('to-line', ['to-success', '✔ MultiQC report: results/multiqc_report.html']);
    return true;
  }

  async function _vep(args) {
    _line('to-line', ['to-info', 'Ensembl VEP v111 — Variant Effect Predictor']);
    await _animateProgress('Loading cache (GRCh38)',    600);
    await _animateProgress('Annotating variants',       1800);
    _blank();
    _line('to-line', ['to-section', 'VEP summary:']);
    _line('to-line', ['to-stdout', '  Variants processed:   '], ['to-number', '4,218,902']);
    _line('to-line', ['to-stdout', '  HIGH impact:          '], ['to-error',  '1,241']);
    _line('to-line', ['to-stdout', '  MODERATE impact:      '], ['to-warn',   '18,294']);
    _line('to-line', ['to-stdout', '  LOW impact:           '], ['to-number', '124,812']);
    _line('to-line', ['to-stdout', '  MODIFIER:             '], ['to-stdout', '4,074,555']);
    _addVFS('results/vep_annotated.vcf.gz','412M','new');
    _addVFS('results/vep_summary.html','1.8M','new');
    _line('to-line', ['to-success', '✔ VEP annotation complete']);
    return true;
  }

  /* ─── Unix commands ─── */
  function _ls(args) {
    const path = args[0] ? _resolvePath(args[0]) : cwd;
    const children = Object.keys(VFS).filter(k =>
      k.startsWith(path + '/') && k.slice(path.length + 1).indexOf('/') === -1
    );
    if (!children.length) {
      _line('to-line', ['to-stdout', '(empty)']);
    } else {
      children.forEach(k => {
        const name = k.split('/').pop();
        const entry = VFS[k];
        const cls = entry.type === 'dir' ? 'to-path' : (k.includes('NEW') || entry.desc === 'new') ? 'to-success' : 'to-file';
        const size = entry.size ? `  ${entry.size}` : '';
        _line('to-line', [cls, name + (entry.type === 'dir' ? '/' : '')], ['to-dim', size]);
      });
    }
  }

  function _cd(args) {
    const path = args[0] ? _resolvePath(args[0]) : '/home/user';
    if (VFS[path] && VFS[path].type === 'dir') {
      cwd = path;
      _updatePrompt();
    } else if (path === '/home/user/workspace/results' || path === '/home/user/workspace/data' || path === '/home/user/workspace/scripts') {
      cwd = path;
      _updatePrompt();
    } else {
      _line('to-line', ['to-error', `bash: cd: ${args[0]}: No such file or directory`]);
    }
  }

  function _cat(args) {
    const path = _resolvePath(args[0] || '');
    if (!args[0]) { _line('to-line', ['to-error', 'Usage: cat <file>']); return; }
    if (path.endsWith('wgs_pipeline.sh')) {
      _showScript(_WGS_SCRIPT);
    } else if (path.endsWith('rnaseq_pipeline.sh')) {
      _showScript(_RNASEQ_SCRIPT);
    } else if (VFS[path] && VFS[path].type === 'file') {
      _line('to-line', ['to-dim', `# ${VFS[path].desc || 'binary file'}`]);
    } else {
      _line('to-line', ['to-error', `cat: ${args[0]}: No such file or directory`]);
    }
  }

  function _showScript(content) {
    content.split('\n').forEach(l => {
      const cls = l.startsWith('#') ? 'to-dim' : l.startsWith('  ') ? 'to-stdout' : 'to-cmd';
      _line('to-line', [cls, l || ' ']);
    });
  }

  function _pwd() { _line('to-line', ['to-stdout', cwd]); }
  function _echo(args) { _line('to-line', ['to-stdout', args.join(' ')]); }
  function _which(args) {
    const tools = {
      fastqc:'bin/fastqc', bwa:'bin/bwa', samtools:'bin/samtools', gatk:'bin/gatk',
      star:'bin/STAR', salmon:'bin/salmon', fastp:'bin/fastp', snakemake:'bin/snakemake',
      nextflow:'bin/nextflow', bcftools:'bin/bcftools', picard:'bin/picard',
      trim_galore:'bin/trim_galore', hisat2:'bin/hisat2', featureCounts:'bin/featureCounts',
      multiqc:'bin/multiqc', vep:'bin/vep', kraken2:'bin/kraken2', bracken:'bin/bracken',
      python:'bin/python', R:'bin/R', perl:'bin/perl', conda:'bin/conda',
    };
    if (tools[args[0]]) { _line('to-line', ['to-path', `/usr/local/${tools[args[0]]}`]); }
    else _line('to-line', ['to-error', `${args[0]}: not found`]);
  }

  function _conda(args) {
    if (!args[0] || args[0] === 'activate') {
      _line('to-line', ['to-info', 'conda v23.11.0 — (bioinformatics) env active']);
    } else if (args[0] === 'list') {
      const pkgs = [
        ['fastqc','0.12.1','bioconda'],['bwa','0.7.18','bioconda'],['samtools','1.19','bioconda'],
        ['gatk4','4.5.0.0','bioconda'],['star','2.7.11b','bioconda'],['salmon','1.10.2','bioconda'],
        ['fastp','0.23.4','bioconda'],['snakemake','8.4.6','bioconda'],['nextflow','23.10.1','bioconda'],
        ['bcftools','1.19','bioconda'],['picard','3.1.0','bioconda'],['hisat2','2.2.1','bioconda'],
        ['subread','2.0.6','bioconda'],['multiqc','1.21','bioconda'],['kraken2','2.1.3','bioconda'],
        ['bracken','2.9','bioconda'],['trim-galore','0.6.10','bioconda'],['vep','111.0','bioconda'],
      ];
      _line('to-line', ['to-dim', '# packages in environment at /opt/conda/envs/bioinformatics:']);
      _line('to-line', ['to-dim', '# Name                    Version   Build   Channel']);
      pkgs.forEach(([n, v, c]) => {
        _line('to-line', ['to-stdout', n.padEnd(24)], ['to-number', v.padEnd(10)], ['to-dim', c]);
      });
    } else if (args[0] === 'install') {
      _line('to-line', ['to-info', `Collecting ${args.slice(1).join(' ')} from bioconda...`]);
    }
  }

  function _snakemake(args) {
    return (async () => {
      _line('to-line', ['to-info', 'Snakemake v8.4.6']);
      if (args.includes('--dag')) {
        _line('to-line', ['to-info', 'Generating DAG (view with: snakemake --dag | dot -Tpng > dag.png)']);
        return;
      }
      const n = parseInt(args.find(a => a.startsWith('-j'))?.slice(2) || '4');
      _line('to-line', ['to-stdout', `Building DAG with ${n} cores...`]);
      await _animateProgress('Resolving rules',   400);
      await _animateProgress('Running jobs',      1800);
      _addVFS('results/dag.png','48K','new');
      _addVFS('.snakemake/','—','new');
      _line('to-line', ['to-success', '✔ Snakemake completed successfully']);
    })();
  }

  async function _nextflow(args) {
    _line('to-line', ['to-info', 'Nextflow v23.10.1 — nf-core pipeline runner']);
    if (args[0] === 'run') {
      const pipeline = args[1] || 'nf-core/rnaseq';
      _line('to-line', ['to-info', `Pulling ${pipeline}...`]);
      await _animateProgress('Downloading pipeline',  600);
      await _animateProgress('Running workflow',      2000);
      _addVFS('results/pipeline_info/','—','new');
      _line('to-line', ['to-success', `✔ ${pipeline} complete`]);
    } else {
      _line('to-line', ['to-stdout', 'Usage: nextflow run nf-core/rnaseq --input samplesheet.csv --genome GRCh38']);
    }
  }

  function _help() {
    _blank();
    _line('to-line', ['to-section', '╔══ OmicsLab Terminal — Available Commands ══╗']);
    _blank();
    const cmds = [
      ['Bioinformatics tools', ''],
      ['  fastqc <file>', 'Quality control for FASTQ files'],
      ['  fastp -i R1 -I R2', 'Adapter trimming + QC'],
      ['  bwa mem -t 8 ref.fa R1 R2', 'BWA-MEM2 alignment'],
      ['  samtools sort|flagstat|view|stats', 'SAM/BAM operations'],
      ['  picard MarkDuplicates', 'Mark PCR duplicates'],
      ['  gatk HaplotypeCaller|Mutect2|BaseRecalibrator', 'GATK4 variant calling'],
      ['  star --runMode alignReads', 'STAR RNA-seq aligner'],
      ['  salmon quant|index', 'Quasi-mapping quantification'],
      ['  hisat2 -x index', 'Spliced read aligner'],
      ['  featureCounts -a gtf', 'Read counting'],
      ['  trim_galore -q 20', 'Adapter trimming (RNA-seq)'],
      ['  bcftools call|mpileup|stats', 'Variant calling & filtering'],
      ['  vep --vcf', 'Variant Effect Predictor'],
      ['  multiqc results/', 'Aggregate QC reports'],
      ['  kraken2|bracken', 'Taxonomic classification'],
      ['  snakemake -j 8', 'Workflow manager'],
      ['  nextflow run nf-core/rnaseq', 'nf-core pipelines'],
      ['', ''],
      ['Pipeline presets', ''],
      ['  run-pipeline wgs', 'Full WGS: trim→align→dedup→BQSR→GATK→VEP'],
      ['  run-pipeline rnaseq', 'RNA-seq: trim→STAR→featureCounts→Salmon'],
      ['  run-pipeline variant', 'Variant: HISAT2→bcftools→bgzip'],
      ['  run-pipeline meta', 'Metagenomics: Kraken2→Bracken→Krona'],
      ['', ''],
      ['Utilities', ''],
      ['  conda list|activate|install', 'Conda package management'],
      ['  ls [dir]  cd <dir>  pwd', 'Filesystem navigation'],
      ['  cat <file>  echo  which', 'File viewing'],
      ['  clear', 'Clear terminal'],
      ['  help', 'Show this message'],
    ];
    cmds.forEach(([cmd, desc]) => {
      if (!cmd) { _blank(); return; }
      if (!desc) { _line('to-line', ['to-section', cmd]); return; }
      _line('to-line', ['to-info', cmd.padEnd(42)], ['to-dim', desc]);
    });
    _blank();
  }

  /* ─── Path resolution ─── */
  function _resolvePath(p) {
    if (!p) return cwd;
    if (p.startsWith('/')) return p;
    if (p === '~') return '/home/user';
    if (p.startsWith('~/')) return '/home/user' + p.slice(1);
    if (p === '.') return cwd;
    if (p === '..') return cwd.split('/').slice(0, -1).join('/') || '/';
    return cwd + '/' + p;
  }

  /* ─── VFS update ─── */
  function _addVFS(relPath, size, tag) {
    const abs = relPath.startsWith('/') ? relPath : cwd + '/' + relPath;
    VFS[abs] = { type: relPath.endsWith('/') ? 'dir' : 'file', size, desc: tag };
    _refreshVFS();
  }

  function _refreshVFS() {
    if (!_vfsDisplay) return;
    const results = Object.keys(VFS)
      .filter(k => k.includes('/results/') && !k.endsWith('/results') && !k.endsWith('/results/'))
      .sort();
    if (!results.length) {
      _vfsDisplay.innerHTML = '<span class="to-dim">No output files yet</span>';
      return;
    }
    _vfsDisplay.innerHTML = results.map(k => {
      const name = k.split('/').pop();
      const e = VFS[k];
      const cls = e.desc === 'new' ? 'vfs-new' : (e.type === 'dir' ? 'vfs-dir' : 'vfs-file');
      return `<div><span class="${cls}">${name}${e.type==='dir'?'/':''}</span><span class="vfs-size">${e.size||''}</span></div>`;
    }).join('');
  }

  /* ─── Prompt update ─── */
  function _updatePrompt() {
    if (_promptEl) {
      _promptEl.textContent = `user@omicslab:${cwd.replace('/home/user','~')}$`;
    }
  }

  /* ─── Command dispatcher ─── */
  async function _run(raw) {
    if (_running) return;
    const cmd = raw.trim();
    if (!cmd) return;

    history.unshift(cmd);
    histIdx = -1;

    _echoCmd(cmd);
    _running = true;
    if (_runBtn) _runBtn.disabled = true;

    const parts = cmd.split(/\s+/);
    const tool = parts[0].toLowerCase();
    const args = parts.slice(1);

    try {
      if (tool === 'help' || tool === 'man') {
        _help();
      } else if (tool === 'clear' || tool === 'cls') {
        _outputEl.innerHTML = '';
        _welcome();
      } else if (tool === 'ls' || tool === 'dir') {
        _ls(args);
      } else if (tool === 'cd') {
        _cd(args);
      } else if (tool === 'pwd') {
        _pwd();
      } else if (tool === 'echo') {
        _echo(args);
      } else if (tool === 'cat') {
        _cat(args);
      } else if (tool === 'which') {
        _which(args);
      } else if (tool === 'conda') {
        _conda(args);
      } else if (tool === 'mkdir') {
        if (args[0]) { _addVFS(args[0]+'/', '—', ''); _line('to-line', ['to-success', `mkdir: created directory '${args[0]}'`]); }
      } else if (tool === 'fastqc') {
        await _fastqc(args);
      } else if (tool === 'fastp') {
        await _fastp(args);
      } else if (tool === 'bwa') {
        await _bwa(args);
      } else if (tool === 'samtools') {
        await _samtools(args);
      } else if (tool === 'picard') {
        await _picard(args);
      } else if (tool === 'gatk') {
        await _gatk(args);
      } else if (tool === 'star') {
        await _star(args);
      } else if (tool === 'salmon') {
        await _salmon(args);
      } else if (tool === 'featurecounts') {
        await _featureCounts(args);
      } else if (tool === 'trim_galore' || tool === 'trim-galore') {
        await _trimGalore(args);
      } else if (tool === 'hisat2') {
        await _hisat2(args);
      } else if (tool === 'bcftools') {
        await _bcftools(args);
      } else if (tool === 'bgzip' || tool === 'tabix') {
        await _bgzip(args);
      } else if (tool === 'multiqc') {
        await _multiqc(args);
      } else if (tool === 'vep') {
        await _vep(args);
      } else if (tool === 'kraken2') {
        await _kraken2(args);
      } else if (tool === 'bracken') {
        await _bracken(args);
      } else if (tool === 'krona' || tool === 'ktimporttaxonomy') {
        await _krona(args);
      } else if (tool === 'snakemake') {
        await _snakemake(args);
      } else if (tool === 'nextflow') {
        await _nextflow(args);
      } else if (tool === 'run-pipeline') {
        await _runPipeline(args[0]);
      } else if (tool === 'python' || tool === 'python3') {
        _line('to-line', ['to-info', 'Python 3.11.8 | Conda (bioinformatics) env']);
        _line('to-line', ['to-stdout', 'Type exit() to quit. Modules: pandas, numpy, scipy, matplotlib, seaborn, biopython...']);
      } else if (tool === 'r' || tool === 'rscript') {
        _line('to-line', ['to-info', 'R version 4.3.2 (2023-10-31)']);
        _line('to-line', ['to-stdout', 'Packages: DESeq2, edgeR, limma, ggplot2, Bioconductor...']);
      } else if (tool === 'exit' || tool === 'logout') {
        _line('to-line', ['to-warn', 'logout — use Ctrl+D or type exit to close']);
      } else if (tool === '') {
        /* ignore empty */
      } else {
        _line('to-line', ['to-error', `bash: ${tool}: command not found`]);
        _line('to-line', ['to-dim', `Type 'help' for a list of available commands`]);
      }
    } catch (e) {
      _line('to-line', ['to-error', 'Error: ' + e.message]);
    }

    _blank();
    _scroll();
    _running = false;
    if (_runBtn) _runBtn.disabled = false;
  }

  /* ─── Full pipeline runner ─── */
  async function _runPipeline(name) {
    const preset = PRESETS.find(p => p.id === name);
    if (!preset) {
      _line('to-line', ['to-error', `Unknown pipeline: ${name}`]);
      _line('to-line', ['to-dim', `Available: ${PRESETS.map(p=>p.id).join(', ')}`]);
      return;
    }
    _blank();
    _line('to-line', ['to-section', `══ Running ${preset.name} pipeline ══`]);
    _line('to-line', ['to-dim', `Steps: ${preset.steps.length}`]);
    _blank();

    for (let i = 0; i < preset.steps.length; i++) {
      const step = preset.steps[i];
      _line('to-line', ['to-info', `[${i+1}/${preset.steps.length}] ${step.label}`]);
      await step.fn(step.args);
      _blank();
    }

    _line('to-line', ['to-section', `══ Pipeline complete ══`]);
    _line('to-line', ['to-success', `✔ All ${preset.steps.length} steps finished successfully`]);
    _line('to-line', ['to-dim', `View results: ls results/ | cat results/multiqc_report.html`]);
  }

  /* ─── Welcome message ─── */
  function _welcome() {
    const lines = [
      ['to-section', '╔══════════════════════════════════════════════════════╗'],
      ['to-section', '║  OmicsLab Bioinformatics Terminal  v5.0.0            ║'],
      ['to-section', '║  Conda environment: bioinformatics                   ║'],
      ['to-section', '╚══════════════════════════════════════════════════════╝'],
    ];
    lines.forEach(([c, t]) => _raw(`<div class="to-line"><span class="${c}">${t}</span></div>`));
    _blank();
    _line('to-line', ['to-success', '✔ 22 bioinformatics tools available']);
    _line('to-line', ['to-info',    '  Type help for commands  |  Tab = autocomplete  |  ↑↓ = history']);
    _line('to-line', ['to-dim',     '  Presets: run-pipeline wgs | rnaseq | variant | meta']);
    _blank();
    _line('to-line', ['to-dim', `Last login: ${new Date().toUTCString()}`]);
    _blank();
  }

  /* ─── Tab completion ─── */
  const ALL_CMDS = [
    'fastqc','fastp','bwa','samtools','picard','gatk','star','salmon','featureCounts',
    'trim_galore','hisat2','bcftools','bgzip','tabix','multiqc','vep','kraken2',
    'bracken','snakemake','nextflow','conda','python','R','Rscript',
    'run-pipeline','ls','cd','pwd','cat','echo','which','mkdir','help','clear',
  ];

  function _tabComplete(val) {
    if (!val) return;
    const parts = val.split(/\s+/);
    const partial = parts[parts.length - 1];
    let candidates;
    if (parts.length === 1) {
      candidates = ALL_CMDS.filter(c => c.toLowerCase().startsWith(partial.toLowerCase()));
    } else {
      const paths = Object.keys(VFS).map(k => k.replace(cwd + '/', '')).filter(k => k.startsWith(partial));
      candidates = paths;
    }
    if (candidates.length === 1) {
      parts[parts.length - 1] = candidates[0];
      _inputEl.value = parts.join(' ') + (candidates[0].endsWith('/') ? '' : ' ');
    } else if (candidates.length > 1) {
      _blank();
      _line('to-line', ['to-dim', candidates.join('  ')]);
      _scroll();
    }
  }

  /* ─── Script editor templates ─── */
  const _WGS_SCRIPT = `#!/usr/bin/env bash
# WGS Analysis Pipeline — OmicsLab
# Compatible with: SLURM, PBS, local

set -euo pipefail

SAMPLE="sample"
REF="data/reference.fa"
R1="data/${SAMPLE}_R1.fastq.gz"
R2="data/${SAMPLE}_R2.fastq.gz"
THREADS=8
OUT="results"

mkdir -p $OUT

# Step 1: Quality control
fastqc $R1 $R2 -o $OUT

# Step 2: Adapter trimming
fastp -i $R1 -I $R2 \\
  -o $OUT/trimmed_R1.fastq.gz \\
  -O $OUT/trimmed_R2.fastq.gz \\
  --json $OUT/fastp.json \\
  --html $OUT/fastp.html \\
  -w $THREADS

# Step 3: Alignment
bwa mem -t $THREADS $REF \\
  $OUT/trimmed_R1.fastq.gz \\
  $OUT/trimmed_R2.fastq.gz | \\
  samtools sort -@ $THREADS -o $OUT/aligned.bam
samtools index $OUT/aligned.bam

# Step 4: Mark duplicates
picard MarkDuplicates \\
  I=$OUT/aligned.bam \\
  O=$OUT/dedup.bam \\
  M=$OUT/dup_metrics.txt
samtools index $OUT/dedup.bam

# Step 5: BQSR
gatk BaseRecalibrator \\
  -I $OUT/dedup.bam \\
  -R $REF \\
  --known-sites data/variants.vcf \\
  -O $OUT/recal.table

gatk ApplyBQSR \\
  -I $OUT/dedup.bam \\
  -R $REF \\
  --bqsr-recal-file $OUT/recal.table \\
  -O $OUT/recal.bam

# Step 6: Variant calling
gatk HaplotypeCaller \\
  -R $REF \\
  -I $OUT/recal.bam \\
  -O $OUT/raw_variants.vcf.gz \\
  --emit-ref-confidence GVCF

# Step 7: Annotation
vep --vcf --cache --offline \\
  -i $OUT/raw_variants.vcf.gz \\
  -o $OUT/annotated.vcf.gz

# Step 8: QC report
multiqc $OUT/ -o $OUT/multiqc/

echo "WGS pipeline complete!"`;

  const _RNASEQ_SCRIPT = `#!/usr/bin/env bash
# RNA-seq Pipeline — OmicsLab
# STAR 2-pass + featureCounts + Salmon

set -euo pipefail

SAMPLE="sample"
GTF="data/annotation.gtf"
STAR_IDX="data/star_index"
SALMON_IDX="data/salmon_index"
THREADS=8
OUT="results"

mkdir -p $OUT

# Step 1: FastQC
fastqc data/${SAMPLE}_R1.fastq.gz -o $OUT

# Step 2: Trim reads
trim_galore --paired --cores $THREADS \\
  data/${SAMPLE}_R1.fastq.gz \\
  data/${SAMPLE}_R2.fastq.gz \\
  -o $OUT/trimmed

# Step 3: STAR alignment (2-pass)
STAR --runMode alignReads \\
  --genomeDir $STAR_IDX \\
  --readFilesIn $OUT/trimmed/*_R1* $OUT/trimmed/*_R2* \\
  --readFilesCommand zcat \\
  --outSAMtype BAM SortedByCoordinate \\
  --outFileNamePrefix $OUT/star/ \\
  --runThreadN $THREADS \\
  --twopassMode Basic

samtools index $OUT/star/Aligned.sortedByCoord.out.bam

# Step 4: Count reads
featureCounts \\
  -T $THREADS \\
  -a $GTF \\
  -o $OUT/counts.txt \\
  $OUT/star/Aligned.sortedByCoord.out.bam

# Step 5: Salmon quasi-mapping
salmon quant \\
  --index $SALMON_IDX \\
  --libType A \\
  -1 $OUT/trimmed/*_R1* \\
  -2 $OUT/trimmed/*_R2* \\
  --validateMappings \\
  -p $THREADS \\
  -o $OUT/salmon_quant

# Step 6: Aggregate QC
multiqc $OUT/ -o $OUT/multiqc/

echo "RNA-seq pipeline complete!"`;

  const SCRIPT_TEMPLATES = [
    { icon: '🧬', name: 'WGS Pipeline', content: _WGS_SCRIPT },
    { icon: '📈', name: 'RNA-seq Pipeline', content: _RNASEQ_SCRIPT },
    {
      icon: '🐍', name: 'Snakemake Workflow', content: `# Snakemake WGS Workflow
# Run: snakemake -j 8 --use-conda

SAMPLES = ["sample1", "sample2", "sample3"]

rule all:
    input:
        expand("results/{sample}/multiqc_report.html", sample=SAMPLES)

rule fastqc:
    input:
        r1 = "data/{sample}_R1.fastq.gz",
        r2 = "data/{sample}_R2.fastq.gz"
    output:
        "results/{sample}/fastqc_done.flag"
    threads: 4
    conda: "envs/qc.yaml"
    shell:
        "fastqc {input.r1} {input.r2} -o results/{wildcards.sample}/ && touch {output}"

rule trim:
    input:
        r1 = "data/{sample}_R1.fastq.gz",
        r2 = "data/{sample}_R2.fastq.gz"
    output:
        r1 = "results/{sample}/trimmed_R1.fastq.gz",
        r2 = "results/{sample}/trimmed_R2.fastq.gz"
    threads: 4
    conda: "envs/trim.yaml"
    shell:
        "fastp -i {input.r1} -I {input.r2} -o {output.r1} -O {output.r2} -w {threads}"

rule align:
    input:
        r1 = rules.trim.output.r1,
        r2 = rules.trim.output.r2,
        ref = "data/reference.fa"
    output: "results/{sample}/aligned.bam"
    threads: 8
    conda: "envs/align.yaml"
    shell:
        "bwa mem -t {threads} {input.ref} {input.r1} {input.r2} | samtools sort -o {output}"`,
    },
    {
      icon: '🌊', name: 'Nextflow (nf-core)', content: `// nf-core/rnaseq pipeline launch
// Docs: https://nf-co.re/rnaseq

nextflow run nf-core/rnaseq \\
  --input samplesheet.csv \\
  --outdir results/ \\
  --genome GRCh38 \\
  --aligner star_salmon \\
  --pseudo_aligner salmon \\
  -profile conda \\
  -resume

// samplesheet.csv format:
// sample,fastq_1,fastq_2,strandedness
// control1,data/ctrl1_R1.fastq.gz,data/ctrl1_R2.fastq.gz,auto
// treatment1,data/trt1_R1.fastq.gz,data/trt1_R2.fastq.gz,auto`,
    },
  ];

  /* ─── Render the full terminal section ─── */
  function init() {
    const container = document.getElementById('terminal-studio-content');
    if (!container) return;
    if (container.querySelector('.terminal-page')) return; /* already init */

    container.innerHTML = `
      <div class="terminal-page">
        <div class="terminal-page-header">
          <div class="terminal-page-title">🖥️ Bioinformatics Terminal</div>
          <div class="terminal-page-desc">
            Simulate real bioinformatics pipelines in your browser, or launch a full GitHub Codespace
            to run actual tools on real data — no install, cloud-powered, VS Code in the browser.
          </div>
        </div>

        <!-- Launch bar -->
        <div class="launch-bar">
          <span class="launch-bar-label">Run in the cloud →</span>
          <a href="https://codespaces.new/Simon-Mufara/Omics-Lab?quickstart=1" target="_blank" rel="noopener" class="launch-btn launch-btn-codespace">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M1 4a2 2 0 0 1 2-2h18a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V4zm7.5 5.5a1 1 0 0 0 0 1.414L11.086 13.5 8.5 16.086A1 1 0 0 0 9.914 17.5l3-3a1 1 0 0 0 0-1.414l-3-3A1 1 0 0 0 8.5 9.5zm5 4a1 1 0 0 0 0 1h4a1 1 0 0 0 0-1h-4z"/></svg>
            Open in GitHub Codespaces
          </a>
          <a href="https://mybinder.org/v2/gh/Simon-Mufara/Omics-Lab/main" target="_blank" rel="noopener" class="launch-btn launch-btn-binder">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
            Binder (JupyterLab)
          </a>
          <button class="launch-btn launch-btn-sim" onclick="OmicsLab.Terminal.focusInput()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>
            Browser Simulator
          </button>
        </div>

        <!-- Mode tabs -->
        <div class="term-mode-tabs">
          <button class="term-mode-tab active" onclick="OmicsLab.Terminal.switchMode('terminal',this)">⚡ Terminal</button>
          <button class="term-mode-tab" onclick="OmicsLab.Terminal.switchMode('editor',this)">📝 Script Editor</button>
        </div>

        <!-- Terminal panel -->
        <div class="terminal-panel active" id="term-panel">
          <div class="terminal-layout">
            <!-- Terminal window -->
            <div>
              <div class="term-window">
                <div class="term-titlebar">
                  <span class="term-dot term-dot-red"></span>
                  <span class="term-dot term-dot-yellow"></span>
                  <span class="term-dot term-dot-green"></span>
                  <span class="term-title">user@omicslab — ~/workspace</span>
                  <button class="term-clear-btn" onclick="OmicsLab.Terminal.clearTerminal()">clear</button>
                </div>
                <div class="term-output" id="term-output"></div>
                <div class="term-input-row">
                  <span class="term-prompt-label" id="term-prompt">user@omicslab:~/workspace$</span>
                  <input class="term-input" id="term-input" type="text"
                    placeholder="type a command or click a preset →"
                    autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false">
                  <button class="term-run-btn" id="term-run-btn">Run ↵</button>
                </div>
              </div>
            </div>

            <!-- Sidebar -->
            <div class="term-sidebar">
              <!-- Pipeline presets -->
              <div class="ts-card">
                <div class="ts-card-header">
                  <span>⚡ Pipeline Presets</span>
                </div>
                <div class="ts-card-body">
                  <div class="preset-list" id="preset-list">
                    ${PRESETS.map(p => `
                      <button class="preset-btn" onclick="OmicsLab.Terminal.runPreset('${p.id}')">
                        <span class="preset-icon">${p.icon}</span>
                        <span class="preset-info">
                          <span class="preset-name">${p.name}</span>
                          <span class="preset-cmd">${p.desc}</span>
                        </span>
                      </button>`).join('')}
                  </div>
                </div>
              </div>

              <!-- Output files -->
              <div class="ts-card">
                <div class="ts-card-header">
                  <span>📁 Output Files</span>
                  <span style="font-size:0.68rem;font-weight:400;color:var(--text-muted)">results/</span>
                </div>
                <div class="ts-card-body">
                  <div class="vfs-tree" id="vfs-display">
                    <span class="to-dim">No output files yet — run a pipeline</span>
                  </div>
                </div>
              </div>

              <!-- Tools -->
              <div class="ts-card">
                <div class="ts-card-header">Installed Tools (22)</div>
                <div class="ts-card-body">
                  <div class="tool-chips">
                    ${['fastqc','fastp','bwa','samtools','picard','gatk4','star','salmon',
                       'hisat2','featureCounts','trim-galore','bcftools','vep','multiqc',
                       'kraken2','bracken','snakemake','nextflow','python','R','conda','bedtools']
                      .map(t => `<span class="tool-chip tool-chip-active">${t}</span>`).join('')}
                  </div>
                </div>
              </div>

              <!-- Codespace CTA -->
              <div class="codespace-cta">
                <div class="ccs-title">🚀 Want to run real data?</div>
                <div class="ccs-desc">
                  Open a GitHub Codespace — a full VS Code environment in your browser with all tools pre-installed via conda. Run your own FASTQ files, store results, download reports.
                </div>
                <div class="ccs-tools">
                  ${['BWA-MEM2','GATK4','STAR','Salmon','Nextflow','Snakemake','DESeq2','Seurat'].map(t =>
                    `<span class="ccs-tool">${t}</span>`).join('')}
                </div>
                <a href="https://codespaces.new/Simon-Mufara/Omics-Lab?quickstart=1"
                   target="_blank" rel="noopener" class="ccs-open-btn">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M1 4a2 2 0 0 1 2-2h18a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V4zm7.5 5.5a1 1 0 0 0 0 1.414L11.086 13.5 8.5 16.086A1 1 0 0 0 9.914 17.5l3-3a1 1 0 0 0 0-1.414l-3-3A1 1 0 0 0 8.5 9.5zm5 4a1 1 0 0 0 0 1h4a1 1 0 0 0 0-1h-4z"/></svg>
                  Launch GitHub Codespace
                </a>
              </div>
            </div>
          </div>
        </div>

        <!-- Script Editor panel -->
        <div class="script-editor-panel" id="editor-panel">
          <div class="terminal-layout">
            <div class="script-editor-wrap">
              <div class="se-topbar">
                <span class="se-filename" id="se-filename">pipeline.sh</span>
                <span class="se-lang-badge">bash</span>
                <button class="se-action-btn" onclick="OmicsLab.Terminal.copyScript()">📋 Copy</button>
                <button class="se-action-btn" onclick="OmicsLab.Terminal.downloadScript()">⬇ Download</button>
                <a href="https://codespaces.new/Simon-Mufara/Omics-Lab?quickstart=1"
                   target="_blank" rel="noopener" class="se-run-btn">▶ Run in Codespace</a>
              </div>
              <textarea class="script-textarea" id="script-editor" spellcheck="false"
                placeholder="# Paste your pipeline script here or choose a template →">${_WGS_SCRIPT}</textarea>
              <div class="script-output-wrap" id="script-output" style="display:none"></div>
            </div>

            <div class="term-sidebar">
              <div class="ts-card">
                <div class="ts-card-header">📄 Script Templates</div>
                <div class="ts-card-body">
                  <div class="script-templates">
                    ${SCRIPT_TEMPLATES.map((t, i) => `
                      <button class="st-btn" onclick="OmicsLab.Terminal.loadTemplate(${i})">
                        ${t.icon} ${t.name}
                      </button>`).join('')}
                  </div>
                </div>
              </div>
              <div class="codespace-cta">
                <div class="ccs-title">💡 Run this script</div>
                <div class="ccs-desc">
                  Open a Codespace, paste your script, and run it on real data with all tools pre-installed.
                </div>
                <a href="https://codespaces.new/Simon-Mufara/Omics-Lab?quickstart=1"
                   target="_blank" rel="noopener" class="ccs-open-btn">
                  Open Codespace →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>`;

    /* Wire up elements */
    _outputEl = container.querySelector('#term-output');
    _inputEl  = container.querySelector('#term-input');
    _promptEl = container.querySelector('#term-prompt');
    _runBtn   = container.querySelector('#term-run-btn');
    _vfsDisplay = container.querySelector('#vfs-display');

    _welcome();

    /* Event listeners */
    _runBtn.addEventListener('click', () => {
      const v = _inputEl.value.trim();
      if (v) { _inputEl.value = ''; _run(v); }
    });

    _inputEl.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        const v = _inputEl.value.trim();
        if (v) { _inputEl.value = ''; _run(v); }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (histIdx < history.length - 1) { histIdx++; _inputEl.value = history[histIdx]; }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (histIdx > 0) { histIdx--; _inputEl.value = history[histIdx]; }
        else { histIdx = -1; _inputEl.value = ''; }
      } else if (e.key === 'Tab') {
        e.preventDefault();
        _tabComplete(_inputEl.value);
      }
    });

    /* Clicking anywhere on terminal focuses input */
    container.querySelector('.term-window').addEventListener('click', () => _inputEl.focus());
  }

  /* ─── Public API ─── */
  function runPreset(id) {
    const preset = PRESETS.find(p => p.id === id);
    if (!preset || _running) return;
    _inputEl.value = '';
    /* Switch to terminal panel if not active */
    const termPanel = document.getElementById('term-panel');
    if (termPanel) termPanel.parentElement.querySelector('.terminal-panel').classList.add('active');
    _run(`run-pipeline ${id}`);
    _inputEl.focus();
  }

  function clearTerminal() {
    if (_outputEl) { _outputEl.innerHTML = ''; _welcome(); }
  }

  function focusInput() {
    if (_inputEl) _inputEl.focus();
  }

  function switchMode(mode, btn) {
    document.querySelectorAll('.term-mode-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.terminal-panel, .script-editor-panel').forEach(el => el.classList.remove('active'));
    const panel = document.getElementById(mode === 'editor' ? 'editor-panel' : 'term-panel');
    if (panel) panel.classList.add('active');
  }

  function loadTemplate(idx) {
    const t = SCRIPT_TEMPLATES[idx];
    if (!t) return;
    const editor = document.getElementById('script-editor');
    const nameEl = document.getElementById('se-filename');
    if (editor) editor.value = t.content;
    if (nameEl) nameEl.textContent = t.name.toLowerCase().replace(/\s+/g,'_') + (t.name.includes('next') ? '.nf' : '.sh');
  }

  function copyScript() {
    const editor = document.getElementById('script-editor');
    if (!editor) return;
    navigator.clipboard.writeText(editor.value).then(() => {
      const btn = document.querySelector('.se-action-btn');
      if (btn) { btn.textContent = '✔ Copied!'; setTimeout(() => btn.textContent = '📋 Copy', 1800); }
    }).catch(() => {
      editor.select();
      document.execCommand('copy');
    });
  }

  function downloadScript() {
    const editor = document.getElementById('script-editor');
    const name = document.getElementById('se-filename')?.textContent || 'pipeline.sh';
    if (!editor) return;
    const blob = new Blob([editor.value], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return { init, runPreset, clearTerminal, focusInput, switchMode, loadTemplate, copyScript, downloadScript };
})();
