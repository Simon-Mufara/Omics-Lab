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
      icon: 'dna',
      name: 'WGS Pipeline',
      desc: 'BWA-MEM2 > GATK HaplotypeCaller',
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
      icon: 'trending-up',
      name: 'RNA-seq Pipeline',
      desc: 'STAR align > Salmon quant > DESeq2',
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
      icon: 'microscope',
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
      icon: 'virus',
      name: 'Metagenomics',
      desc: 'Kraken2 classify > Bracken abundance',
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
    if (!_outputEl) return null;
    const div = document.createElement('div');
    div.className = 'to-line';
    div.innerHTML = parts.map(([c, t]) => `<span class="${c}">${_esc(t)}</span>`).join('');
    _outputEl.appendChild(div);
    return div;
  }
  function _raw(html) {
    if (!_outputEl) return;
    const div = document.createElement('div');
    div.innerHTML = html;
    _outputEl.appendChild(div);
  }
  function _blank() { _raw('<div class="to-blank"></div>'); }
  function _esc(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function _scroll() { if (_outputEl) _outputEl.scrollTop = _outputEl.scrollHeight; }

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
      _line('to-line', ['to-success', `[OK] ${base}_fastqc.html written`]);
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
    _line('to-line', ['to-success', '[OK] fastp complete']);
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
    _line('to-line', ['to-success', '[OK] Alignment complete']);
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
      _line('to-line', ['to-success', '[OK] Sorted BAM written']);
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
    _line('to-line', ['to-success', '[OK] MarkDuplicates complete']);
    return true;
  }

  async function _gatk(args) {
    const sub = args[0] || 'HaplotypeCaller';
    _line('to-line', ['to-info', `GATK v4.5.0.0 — ${sub}`]);
    if (sub === 'BaseRecalibrator') {
      await _animateProgress('Counting covariates', 1200);
      _addVFS('results/recal.table','28K','new');
      _line('to-line', ['to-success', '[OK] BQSR table written']);
    } else if (sub === 'ApplyBQSR') {
      await _animateProgress('Applying recalibration', 900);
      _addVFS('results/recal.bam','5.8G','new');
      _line('to-line', ['to-success', '[OK] Recalibrated BAM written']);
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
      _line('to-line', ['to-success', '[OK] HaplotypeCaller complete']);
    } else if (sub === 'VariantFiltration') {
      await _animateProgress('Applying VQSR filters', 700);
      _addVFS('results/filtered_variants.vcf.gz','298M','new');
      _line('to-line', ['to-success', '[OK] Variant filtration complete']);
      _line('to-line', ['to-stdout', '  PASS variants: '], ['to-success', '4,218,902 (86.2%)']);
    } else if (sub === 'Mutect2') {
      await _animateProgress('Calling somatic variants', 2000);
      _addVFS('results/somatic_variants.vcf.gz','48M','new');
      _line('to-line', ['to-success', '[OK] Mutect2 complete']);
    } else {
      await _animateProgress(`Running ${sub}`, 1000);
      _line('to-line', ['to-success', `[OK] ${sub} complete`]);
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
    _line('to-line', ['to-success', '[OK] STAR alignment complete']);
    return true;
  }

  async function _salmon(args) {
    const sub = args[0] || 'quant';
    _line('to-line', ['to-info', `Salmon v1.10.2 — ${sub}`]);
    if (sub === 'index') {
      await _animateProgress('Building k-mer index', 1200);
      _addVFS('results/salmon_index/','—','new');
      _line('to-line', ['to-success', '[OK] Index built']);
    } else {
      await _animateProgress('Quasi-mapping reads',  900);
      await _animateProgress('EM quantification',    600);
      _blank();
      _line('to-line', ['to-stdout', '  Mapping rate: '], ['to-success', '91.34%']);
      _line('to-line', ['to-stdout', '  Transcripts:  '], ['to-number',  '228,418']);
      _addVFS('results/salmon_quant/quant.sf','3.8M','new');
      _addVFS('results/salmon_quant/cmd_info.json','420B','new');
      _line('to-line', ['to-success', '[OK] Salmon quant complete']);
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
    _line('to-line', ['to-success', '[OK] Feature counting complete']);
    return true;
  }

  async function _trimGalore(args) {
    _line('to-line', ['to-info', 'Trim Galore! v0.6.10 (Cutadapt wrapper)']);
    await _animateProgress('Adapter detection', 400);
    await _animateProgress('Quality trimming',  700);
    _line('to-line', ['to-stdout', '  Reads written (quality):   '], ['to-success', '97.12%']);
    _line('to-line', ['to-stdout', '  Total bases trimmed:       '], ['to-warn',    '1.24%']);
    _addVFS('results/trimmed_R1.fastq.gz','1.8G','new');
    _line('to-line', ['to-success', '[OK] Trim Galore complete']);
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
    _line('to-line', ['to-success', '[OK] HISAT2 alignment complete']);
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
    _line('to-line', ['to-success', `[OK] bcftools ${sub} done`]);
    return true;
  }

  async function _bgzip(args) {
    _line('to-line', ['to-info', 'bgzip + tabix indexing']);
    await _animateProgress('bgzip compress',  400);
    await _animateProgress('tabix index',     300);
    _addVFS('results/calls.vcf.gz.tbi','840K','new');
    _line('to-line', ['to-success', '[OK] bgzip+tabix done']);
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
    _line('to-line', ['to-success', '[OK] Kraken2 classification done']);
    return true;
  }

  async function _bracken(args) {
    _line('to-line', ['to-info', 'Bracken v2.9 — Bayesian Re-estimation of Abundance']);
    await _animateProgress('Re-estimating species abundance', 700);
    _addVFS('results/bracken_output.txt','12K','new');
    _addVFS('results/bracken_species_report.txt','22K','new');
    _line('to-line', ['to-stdout', '  Top species: Homo sapiens (47.2%), Bacteroides fragilis (8.4%), ...']);
    _line('to-line', ['to-success', '[OK] Bracken re-estimation done']);
    return true;
  }

  async function _krona(args) {
    _line('to-line', ['to-info', 'KronaTools — generating interactive HTML pie']);
    await _animateProgress('Building Krona chart', 400);
    _addVFS('results/krona_chart.html','2.8M','new');
    _line('to-line', ['to-success', '[OK] Krona chart saved > results/krona_chart.html']);
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
    _line('to-line', ['to-success', '[OK] MultiQC report: results/multiqc_report.html']);
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
    _line('to-line', ['to-success', '[OK] VEP annotation complete']);
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
      _line('to-line', ['to-success', '[OK] Snakemake completed successfully']);
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
      _line('to-line', ['to-success', `[OK] ${pipeline} complete`]);
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
    _line('to-line', ['to-success', `[OK] All ${preset.steps.length} steps finished successfully`]);
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
    _line('to-line', ['to-success', '[OK] 22 bioinformatics tools available']);
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
R1="data/\${SAMPLE}_R1.fastq.gz"
R2="data/\${SAMPLE}_R2.fastq.gz"
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
fastqc data/\${SAMPLE}_R1.fastq.gz -o $OUT

# Step 2: Trim reads
trim_galore --paired --cores $THREADS \\
  data/\${SAMPLE}_R1.fastq.gz \\
  data/\${SAMPLE}_R2.fastq.gz \\
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
    { icon: 'dna', name: 'WGS Pipeline', content: _WGS_SCRIPT },
    { icon: 'trending-up', name: 'RNA-seq Pipeline', content: _RNASEQ_SCRIPT },
    {
      icon: 'git-branch', name: 'Snakemake Workflow', content: `# Snakemake WGS Workflow
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
      icon: 'activity', name: 'Nextflow (nf-core)', content: `// nf-core/rnaseq pipeline launch
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

  /* ─── Python Notebook (Pyodide) ─── */
  let _py = null;
  let _pyLoading = false;
  let _cellSeq = 0;
  let _activeNb = 'seq';
  let _runLog = [];

  const _NB_DATA = [
    {
      id: 'seq', name: 'Sequence Analysis', icon: 'dna',
      desc: 'DNA analysis, GC content, quality metrics, HBB gene',
      dataset: 'HBB Gene Reference (chr11)',
      cells: [
        {
          title: 'HBB Gene Segment Analysis',
          code: `# OmicsLab — Sequence Analysis
# Analyzing the HBB (beta-globin) gene — sickle cell locus

seq = "ATGGTGCACCTGACTCCTGAGGAGAAGTCTGCCGTTACTGCCCTGTGGGGCAAGGTGAACGTGGATGAAGTTGGTGGTGAGGCCCTGGGCAGG"
gc  = (seq.count('G') + seq.count('C')) / len(seq) * 100

print("Gene: HBB — beta-globin (chr11:5,246,696-5,248,301)")
print(f"Segment length : {len(seq)} bp")
print(f"GC content     : {gc:.1f}%")
print()
print("First 10 codons:")
codons = [seq[i:i+3] for i in range(0, 30, 3)]
codon_table = {"ATG":"Met","GTG":"Val","CAC":"His","CTG":"Leu","ACT":"Thr",
               "CCT":"Pro","GAG":"Glu","GAA":"Glu","GTC":"Val","TCA":"Ser"}
for i,c in enumerate(codons):
    aa = codon_table.get(c, "???")
    print(f"  codon {i+1:2d}: {c} = {aa}")
print()
print("SCD mutation: codon 6 GAG→GTG (Glu→Val) causes HbS aggregation")`
        },
        {
          title: 'Mutation Detection',
          code: `# rs334 (HbS): single nucleotide change causing sickle cell disease
ref_codon = "GAG"  # Glutamic acid (charged, hydrophilic)
scd_codon = "GTG"  # Valine        (nonpolar, hydrophobic)

print("HBB codon 6 comparison:")
print(f"  Reference: {ref_codon} > Glu (hydrophilic, charged)")
print(f"  SCD allele: {scd_codon} > Val (hydrophobic)")
print()
print("Consequence: Val at position 6 causes HbS polymerization under low O2")
print()

# Simulated cohort
import random
random.seed(42)
n = 1000
af_scd = 0.056  # African allele frequency of HbS

alleles = [random.random() < af_scd for _ in range(n*2)]
HbAA = sum(1 for i in range(n) if not alleles[2*i] and not alleles[2*i+1])
HbAS = sum(1 for i in range(n) if alleles[2*i] != alleles[2*i+1])
HbSS = sum(1 for i in range(n) if alleles[2*i] and alleles[2*i+1])
print(f"Simulated cohort (N={n}, AF={af_scd}):")
print(f"  HbAA (normal)         : {HbAA} ({HbAA/n*100:.1f}%)")
print(f"  HbAS (carrier/trait)  : {HbAS} ({HbAS/n*100:.1f}%)")
print(f"  HbSS (sickle disease) : {HbSS} ({HbSS/n*100:.1f}%)")
print(f"  Note: HbAS confers ~50% protection against severe malaria")`
        },
        {
          title: 'FASTQ Quality Simulation',
          code: `# Simulate Phred quality scores — typical Illumina NovaSeq pattern
import random, math
random.seed(2024)

n_reads, read_len = 200, 150

def sim_quals(length):
    return [max(10, min(40, int(36 - (i/length)**2.5*18 + random.gauss(0,1.5))))
            for i in range(length)]

all_quals = [sim_quals(read_len) for _ in range(n_reads)]
means = [sum(q)/len(q) for q in all_quals]
overall = sum(means)/len(means)
q30_pct = sum(m>=30 for m in means)/len(means)*100

print(f"FastQC Summary  ({n_reads} reads x {read_len} bp)")
print("="*42)
print(f"  Mean quality score  : Q{overall:.1f}")
print(f"  % reads Q>=30       : {q30_pct:.1f}%  ({'PASS' if q30_pct>80 else 'WARN'})")
print()
print("Per-base quality profile (every 15 bp):")
pos_means = [sum(all_quals[r][i] for r in range(n_reads))/n_reads for i in range(read_len)]
for i in range(0, read_len, 15):
    q = pos_means[i]
    bar = '█'*int(q/40*24) + '░'*(24-int(q/40*24))
    flag = 'PASS' if q>=30 else ('WARN' if q>=20 else 'FAIL')
    print(f"  bp {i+1:3d}: {bar} Q{q:.0f} {flag}")`
        }
      ]
    },
    {
      id: 'variants', name: 'African Variants', icon: 'activity',
      desc: 'Allele frequencies, HWE test, ACMG classification',
      dataset: 'African Variant Panel (H3Africa)',
      cells: [
        {
          title: 'African Variant Landscape',
          code: `# Key disease variants enriched in African populations
# Source: 1000 Genomes, gnomAD v4

variants = [
    dict(rsid="rs334",      gene="HBB",   change="p.Glu7Val",   afr=0.056, eur=0.003, cond="Sickle Cell Disease"),
    dict(rsid="rs76723693", gene="APOL1", change="G2 allele",   afr=0.135, eur=0.002, cond="CKD / FSGS risk"),
    dict(rsid="rs1050828",  gene="G6PD",  change="p.Asn126Asp", afr=0.180, eur=0.010, cond="G6PD Deficiency (A-)"),
    dict(rsid="rs8176719",  gene="ABO",   change="O del",        afr=0.620, eur=0.490, cond="Blood group O"),
    dict(rsid="rs4986790",  gene="TLR4",  change="p.Asp299Gly", afr=0.040, eur=0.070, cond="Malaria susceptibility"),
]

print(f"{'rsID':<14} {'Gene':<7} {'AFR':>6} {'EUR':>6} {'Fold':>6}  Condition")
print("-"*68)
for v in variants:
    fold = v['afr']/v['eur'] if v['eur']>0 else 99
    print(f"{v['rsid']:<14} {v['gene']:<7} {v['afr']:>6.3f} {v['eur']:>6.3f} {fold:>6.1f}x  {v['cond']}")
print()
print("AFR = African ancestry (gnomAD)   EUR = European ancestry")
print("Fold = enrichment in African relative to European populations")`
        },
        {
          title: 'Hardy-Weinberg Equilibrium',
          code: `# HWE test (chi-square, 1 df)
import math

def hwe(AA, Aa, aa, label):
    n = AA+Aa+aa
    p = (2*AA+Aa)/(2*n)
    q = 1-p
    eAA, eAa, eaa = p**2*n, 2*p*q*n, q**2*n
    x2 = sum((o-e)**2/e for o,e in [(AA,eAA),(Aa,eAa),(aa,eaa)] if e>0)
    sig = x2 > 3.841  # chi2(df=1, p=0.05)
    print(f"{'='*52}")
    print(f"  Variant: {label}")
    print(f"  p(ref)={p:.4f}  q(alt)={q:.4f}")
    print(f"  Observed : AA={AA}  Aa={Aa}  aa={aa}")
    print(f"  Expected : AA={eAA:.0f}  Aa={eAa:.0f}  aa={eaa:.0f}")
    print(f"  Chi²={x2:.3f} > {'HWE REJECTED (p<0.05)' if sig else 'Not rejected (p>0.05)'}")
    if sig: print(f"  Likely cause: selection / stratification / genotyping error")

# Malaria-endemic African cohort
hwe(845, 100, 55,  "HBB rs334 (SCD) — N=1000, heterozygote advantage")
hwe(710, 255, 35,  "APOL1 G2 — N=1000, CKD risk variant")`
        },
        {
          title: 'ACMG/AMP Pathogenicity Scoring',
          code: `# ACMG/AMP 2015 classification framework
# Richards et al. Genet Med 2015;17:405-424

WEIGHTS = {
    "PVS1":("Pathogenic","Very Strong",8), "PS1":("Pathogenic","Strong",4),
    "PS3":("Pathogenic","Strong",4),       "PM1":("Pathogenic","Moderate",2),
    "PM2":("Pathogenic","Moderate",2),     "PM5":("Pathogenic","Moderate",2),
    "PP3":("Pathogenic","Supporting",1),   "PP5":("Pathogenic","Supporting",1),
    "BA1":("Benign","Stand-Alone",16),     "BS1":("Benign","Strong",4),
    "BP4":("Benign","Supporting",1),       "BP7":("Benign","Supporting",1),
}

LABELS = {
    "PVS1":"Null variant (LOF mechanism)", "PS1":"Same AA change, established path.",
    "PS3":"Functional studies — deleterious", "PM1":"Critical functional domain",
    "PM2":"Absent from population databases", "PP3":"Computational predictions: deleterious",
    "PP5":"Classified pathogenic in ClinVar",
}

def classify(met_criteria):
    p = sum(WEIGHTS[c][2] for c in met_criteria if c in WEIGHTS and WEIGHTS[c][0]=="Pathogenic")
    b = sum(WEIGHTS[c][2] for c in met_criteria if c in WEIGHTS and WEIGHTS[c][0]=="Benign")
    if p>=10:   cls="PATHOGENIC"
    elif p>=6:  cls="LIKELY PATHOGENIC"
    elif b>=16: cls="BENIGN"
    elif b>=4:  cls="LIKELY BENIGN"
    else:       cls="VARIANT OF UNCERTAIN SIGNIFICANCE"
    return cls, p, b

# rs334
crit = ["PVS1","PS1","PS3","PM1","PM2"]
cls, p, b = classify(crit)
print(f"Variant: HBB p.Glu7Val (rs334)")
print(f"Criteria: {', '.join(crit)}")
print(f"Path score: {p}  |  Benign score: {b}")
print(f"Classification: {cls}")
print()
print("Criteria details:")
for c in crit:
    print(f"  {c}: {LABELS.get(c,'')}")`
        }
      ]
    },
    {
      id: 'rnaseq', name: 'RNA-seq DEG', icon: 'trending-up',
      desc: 'Count matrices, fold-change, pathway analysis',
      dataset: 'GEO Bulk RNA-seq Counts',
      cells: [
        {
          title: 'Simulate Count Matrix',
          code: `# RNA-seq: 20 genes, 6 samples (3 ctrl vs 3 malaria-treated)
import random
random.seed(2024)

GENES = ["HBB","APOL1","G6PD","TNF","IL6","CCL2","STAT3","NFKB1",
         "BCL2","MYC","TP53","IFNG","IL10","CXCL10","VCAM1",
         "GAPDH","ACTB","B2M","RPLP0","EEF1A1"]  # last 5 = housekeeping

# Malaria-induced expression changes
UP   = {"TNF":8.0,"IL6":6.5,"CCL2":5.0,"NFKB1":3.2,"CXCL10":7.0,"VCAM1":4.5,"IFNG":5.5}
DOWN = {"HBB":0.35,"G6PD":0.6,"BCL2":0.5,"IL10":0.45}

base = {g: random.randint(300,8000) for g in GENES}
ctrl = {g: [max(1,int(base[g]*(1+random.gauss(0,.2)))) for _ in range(3)] for g in GENES}
treat= {g: [max(1,int(base[g]*UP.get(g,DOWN.get(g,1.0))*(1+random.gauss(0,.2)))) for _ in range(3)] for g in GENES}

print(f"{'Gene':<10} {'Ctrl1':>6} {'Ctrl2':>6} {'Ctrl3':>6} | {'Trt1':>6} {'Trt2':>6} {'Trt3':>6}")
print("-"*52)
for g in GENES[:12]:
    c = ctrl[g]; t = treat[g]
    print(f"{g:<10} {c[0]:>6} {c[1]:>6} {c[2]:>6} | {t[0]:>6} {t[1]:>6} {t[2]:>6}")`
        },
        {
          title: 'Differential Expression (Log2FC)',
          code: `# DEG analysis: log2 fold-change + simulated adjusted p-value
import random, math
random.seed(2024)

GENES = ["HBB","APOL1","G6PD","TNF","IL6","CCL2","STAT3","NFKB1",
         "BCL2","MYC","TP53","IFNG","IL10","CXCL10","VCAM1",
         "GAPDH","ACTB","B2M","RPLP0","EEF1A1"]
UP   = {"TNF":8.0,"IL6":6.5,"CCL2":5.0,"NFKB1":3.2,"CXCL10":7.0,"VCAM1":4.5,"IFNG":5.5}
DOWN = {"HBB":0.35,"G6PD":0.6,"BCL2":0.5,"IL10":0.45}

def l2fc(fc): return math.log2(fc) if fc>0 else 0
results = []
for g in GENES:
    fc = UP.get(g, DOWN.get(g, 1.0 + random.gauss(0,0.1)))
    lfc = l2fc(fc)
    padj = 0.0001 if abs(lfc)>2 else (0.02 if abs(lfc)>1 else 0.35+random.random()*0.5)
    results.append((g, lfc, padj))

results.sort(key=lambda x: -abs(x[1]))
print(f"{'Gene':<10} {'log2FC':>8} {'padj':>10}  {'Sig':>4}  Direction")
print("-"*46)
for g,lfc,p in results:
    sig = "***" if p<0.001 else ("*" if p<0.05 else "ns")
    dr = "UP  " if lfc>0 else "DOWN"
    mark = "<-- DEG" if abs(lfc)>1 and p<0.05 else ""
    print(f"{g:<10} {lfc:>+8.3f} {p:>10.5f}  {sig:>4}  {dr} {mark}")`
        },
        {
          title: 'Pathway Enrichment (ORA)',
          code: `# Over-Representation Analysis — simulated pathway enrichment
# Significant DEGs from malaria infection model
import math

DEGS = {"TNF","IL6","CCL2","NFKB1","CXCL10","VCAM1","IFNG","STAT3"}

PATHWAYS = {
    "Cytokine signaling (KEGG)":       {"TNF","IL6","CCL2","CXCL10","IL10","IFNG","IL1B","IL12A"},
    "NF-kB signaling":                  {"NFKB1","TNF","IL6","VCAM1","BCL2","BIRC3","TRAF2"},
    "Malaria (KEGG)":                   {"TNF","IL6","IFNG","VCAM1","CXCL10","ICAM1","IL10"},
    "Interferon-gamma response":        {"IFNG","STAT3","CXCL10","IRF1","SOCS1","GBP1"},
    "Complement activation":            {"C3","C4A","CFB","CFH","C1Q","MBL2"},
    "Glycolysis / Gluconeogenesis":     {"HBB","G6PD","GAPDH","LDHA","TPI1","ENO1"},
}

UNIVERSE = 20000

def ora(pathway_genes, deg_set, universe=UNIVERSE):
    k  = len(deg_set & pathway_genes)
    n  = len(deg_set)
    K  = len(pathway_genes)
    N  = universe
    if k == 0: return k, 1.0
    # Hypergeometric approximation (Fisher exact-like)
    fold = (k/n) / (K/N)
    p = max(1e-8, 1 - (k/K)**2 * fold / 10)  # simplified
    return k, round(p, 5)

print(f"{'Pathway':<35} {'k':>3} {'K':>5} {'p-value':>10}  Sig")
print("-"*58)
for pw, genes in PATHWAYS.items():
    k, p = ora(genes, DEGS)
    sig = "***" if p<0.001 else ("*" if p<0.05 else "ns")
    print(f"{pw[:34]:<35} {k:>3} {len(genes):>5} {p:>10.5f}  {sig}")`
        }
      ]
    },
    {
      id: 'popgen', name: 'Population Genetics', icon: 'globe',
      desc: 'FST, HWE, admixture, African diversity',
      dataset: '1000 Genomes African Superpopulation',
      cells: [
        {
          title: 'Population Differentiation (FST)',
          code: `# Weir & Cockerham FST — African population structure
import random
random.seed(42)

POPS = ["YRI (Yoruba,NG)","LWK (Luhya,KE)","GWD (Gambia)","MSL (Mende,SL)","ASW (Afr-Am,US)"]
N_LOCI = 15

# Simulate allele frequencies with drift from shared ancestral freq
anc = [random.uniform(0.1, 0.9) for _ in range(N_LOCI)]
drift = [0.06, 0.07, 0.08, 0.07, 0.15]  # ASW has more drift (admixture)
pop_freqs = [[max(0,min(1,anc[j]+random.gauss(0,drift[i]))) for j in range(N_LOCI)] for i in range(5)]

def fst_locus(freqs):
    n = len(freqs)
    pb = sum(freqs)/n
    if pb in (0,1): return None
    Ht = 2*pb*(1-pb)
    Hs = sum(2*p*(1-p) for p in freqs)/n
    return max(0,(Ht-Hs)/Ht)

fsts = [fst_locus([pop_freqs[i][j] for i in range(5)]) for j in range(N_LOCI)]
fsts = [f for f in fsts if f is not None]
print(f"FST across {len(fsts)} SNPs, 5 African populations")
print(f"  Mean FST : {sum(fsts)/len(fsts):.4f}")
print(f"  Min / Max: {min(fsts):.4f} / {max(fsts):.4f}")
print()
print(f"Reference values (1000G):")
print(f"  Within Africa:        FST ~ 0.015-0.030")
print(f"  Africa vs. Europe:    FST ~ 0.10-0.15")
print(f"  Africa vs. East Asia: FST ~ 0.15-0.18")
print()
for i,f in enumerate(fsts[:8]):
    bar = '█'*int(f*200) + '░'*(int(0.15*200)-int(f*200))
    print(f"  SNP {i+1:2d}: {bar} {f:.4f}")`
        },
        {
          title: 'Admixture Proportions (K=3)',
          code: `# ADMIXTURE-like output: 3 ancestral components
import random
random.seed(99)

SAMPLES = [
    ("NA18501","YRI"),("NA18502","YRI"),("NA18504","YRI"),
    ("NA19099","LWK"),("NA19102","LWK"),
    ("HG02922","GWD"),("HG02923","GWD"),
    ("NA20502","TSI"),("NA20503","TSI"),
    ("NA21732","GIH"),
]

def admix(pop):
    r = random.gauss
    if pop=="YRI": k1,k2,k3 = 0.93+r(0,.02), 0.05+r(0,.01), 0.02
    elif pop=="LWK": k1,k2,k3 = 0.72+r(0,.03), 0.24+r(0,.02), 0.04
    elif pop=="GWD": k1,k2,k3 = 0.89+r(0,.02), 0.07+r(0,.01), 0.04
    elif pop=="TSI": k1,k2,k3 = 0.02, 0.04, 0.94+r(0,.01)
    else: k1,k2,k3 = 0.05, 0.06, 0.89+r(0,.02)
    t=k1+k2+k3; return k1/t,k2/t,k3/t

print(f"{'Sample':<11} {'Pop':<5}  {'K1 W.Afr':>9} {'K2 E.Afr':>9} {'K3 non-Afr':>10}  Stacked bar")
print("-"*65)
for s,p in SAMPLES:
    k1,k2,k3 = admix(p)
    bar = '█'*int(k1*20)+'▓'*int(k2*20)+'░'*int(k3*20)
    print(f"{s:<11} {p:<5}  {k1:>9.3f} {k2:>9.3f} {k3:>10.3f}  {bar}")
print()
print("█=West African  ▓=East African  ░=Non-African")`
        }
      ]
    }
  ];

  /* Reject a promise if it doesn't settle within `ms` — without this,
     a slow/blocked CDN (common on low-bandwidth African connections)
     left the kernel hanging on "loading" forever with no feedback. */
  function _withTimeout(promise, ms, message) {
    return Promise.race([
      promise,
      new Promise((_, reject) => setTimeout(() => reject(new Error(message)), ms)),
    ]);
  }

  async function _loadPyodide() {
    if (_py) return _py;
    if (_pyLoading) {
      await new Promise(r => { const t = setInterval(() => { if (_py || !_pyLoading) { clearInterval(t); r(); } }, 200); });
      return _py;
    }
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      _setKernelStatus('error', 'You appear to be offline. Connect to the internet once to download the Python kernel — it will then work offline on this device.');
      return null;
    }
    _pyLoading = true;
    _setKernelStatus('loading');
    try {
      if (!window.loadPyodide) {
        await _withTimeout(new Promise((resolve, reject) => {
          const s = document.createElement('script');
          s.src = 'https://cdn.jsdelivr.net/pyodide/v0.26.2/full/pyodide.js';
          s.onload = resolve;
          s.onerror = () => reject(new Error('Failed to load Pyodide from CDN'));
          document.head.appendChild(s);
        }), 30000, 'Pyodide script load timed out — check your connection and retry');
      }
      /* The runtime download (wasm + stdlib, several more MB on top of the
         initial script) is the slow part on real low-bandwidth connections
         — this platform's actual target audience. 45s was tuned against a
         fast test connection and timed out on a genuinely slow-but-working
         download; 3 minutes is still bounded (never hangs forever, the
         original bug) but gives a real African connection room to finish. */
      _py = await _withTimeout(
        window.loadPyodide({ indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.2/full/' }),
        180000, 'Python kernel took too long to start (over 3 minutes) — this may be a slow connection or a network/firewall blocking cdn.jsdelivr.net. Retry, or check your network.'
      );
      _pyLoading = false;
      _setKernelStatus('ready');
      return _py;
    } catch (e) {
      _pyLoading = false;
      _setKernelStatus('error', e.message);
      return null;
    }
  }

  function _setKernelStatus(state, msg) {
    const el = document.getElementById('nb-kernel-status');
    if (el) {
      const labels = { loading:'Python kernel loading — first time takes ~20s on fast connections, longer on slower ones…', ready:'Kernel ready — Python 3.x via Pyodide', error:'Kernel error — check internet connection' };
      const colors = { loading:'#e3b341', ready:'#00C4A0', error:'#f85149' };
      el.textContent = msg || labels[state] || state;
      el.style.color = colors[state] || '#A8A098';
      const dot = document.getElementById('nb-kernel-dot');
      if (dot) { dot.style.background = colors[state] || '#A8A098'; dot.className = 'nb-kernel-dot' + (state==='loading'?' nb-kernel-dot--pulse':''); }
    }
    const retryWrap = document.getElementById('nb-kernel-retry');
    if (retryWrap) retryWrap.style.display = state === 'error' ? '' : 'none';
  }

  function _renderNotebook(nbId) {
    const nb = _NB_DATA.find(n => n.id === nbId);
    if (!nb) return;
    _activeNb = nbId;

    /* Update tab active state */
    document.querySelectorAll('.nb-selector-btn').forEach(b => b.classList.toggle('active', b.dataset.nb === nbId));

    const cells = document.getElementById('nb-cells');
    if (!cells) return;
    _cellSeq = 0;
    cells.innerHTML = nb.cells.map((cell, i) => _cellHTML(cell, i)).join('');

    _runLog = [];
    _renderMetaBar(nb);
    _switchNbView('output');
    _renderNbComments(nb.id);
  }

  /* ─── Kaggle-style kernel meta bar: version, Copy & Edit, runtime, input ─── */
  function _nbVersion(id) { return parseInt(localStorage.getItem('omicslab_nb_version_' + id) || '1', 10); }

  function _renderMetaBar(nb) {
    const bar = document.getElementById('nb-meta-bar');
    if (!bar) return;
    const v = _nbVersion(nb.id);
    bar.innerHTML = `
      <div class="nb-meta-left">
        <span class="nb-input-chip" title="Input dataset">${OmicsLab.Icons?.svg('database',12)||''} ${_esc(nb.dataset || 'Reference data')}</span>
        <span class="nb-version-chip">Version ${v} of ${v}</span>
        <span class="nb-runtime-chip">${OmicsLab.Icons?.svg('cpu',12)||''} Python 3.11 · Pyodide WASM · CPU</span>
      </div>
      <button class="nb-copyedit-btn" onclick="OmicsLab.Terminal.copyAndEdit()">${OmicsLab.Icons?.svg('copy',12)||''} Copy &amp; Edit</button>`;
  }

  function copyAndEdit() {
    const nb = _NB_DATA.find(n => n.id === _activeNb);
    if (!nb) return;
    const v = _nbVersion(nb.id) + 1;
    localStorage.setItem('omicslab_nb_version_' + nb.id, String(v));
    localStorage.setItem('omicslab_nb_forked_' + nb.id, String(Date.now()));
    _renderMetaBar(nb);
    OmicsLab.Notify?.success(`Notebook copied — now editing your own Version ${v}`);
  }

  /* ─── Output / Logs tabs ─── */
  function _switchNbView(view) {
    document.querySelectorAll('.nb-view-tab').forEach(b => b.classList.toggle('active', b.dataset.view === view));
    const cells = document.getElementById('nb-cells');
    const logs  = document.getElementById('nb-logs');
    if (view === 'logs') {
      if (cells) cells.style.display = 'none';
      if (logs) {
        logs.style.display = '';
        logs.innerHTML = _runLog.length
          ? _runLog.slice().reverse().map(l => `<div class="nb-log-line"><span class="nb-log-time">${l.time}</span><span class="nb-log-cell">Cell ${l.cell}</span><span class="nb-log-status nb-log-status-${l.status}">${l.status}</span></div>`).join('')
          : '<div class="nb-log-empty">No runs yet this session.</div>';
      }
    } else {
      if (cells) cells.style.display = '';
      if (logs) logs.style.display = 'none';
    }
  }

  /* ─── Comments (Kaggle-style kernel discussion, backed by the Community forum) ─── */
  async function _nbAuthHeader() {
    if (!OmicsLab.AuthClerk?.isSignedIn?.()) return null;
    const token = await OmicsLab.AuthClerk.getToken();
    return token ? { Authorization: `Bearer ${token}` } : null;
  }

  function _nbTopicId(nbId) { return localStorage.getItem('omicslab_nb_topicid_' + nbId); }

  async function _renderNbComments(nbId) {
    const el = document.getElementById('nb-comments');
    if (!el) return;
    const topicId = _nbTopicId(nbId);
    const signedIn = !!OmicsLab.AuthClerk?.isSignedIn?.();
    let comments = [];
    if (topicId) {
      try {
        const res = await fetch('/api/forum-comments?topic_id=' + encodeURIComponent(topicId));
        const data = await res.json();
        comments = data.comments || [];
      } catch {}
    }
    el.innerHTML = `
      <div class="nb-comments-head">${comments.length} Comment${comments.length === 1 ? '' : 's'}</div>
      <div class="nb-comments-list">
        ${comments.length ? comments.map(c => `
          <div class="nb-comment">
            <span class="nb-comment-author">${_esc(c.users?.name || 'OmicsLab Member')}</span>
            <span class="nb-comment-text">${_esc(c.body)}</span>
          </div>`).join('') : '<div class="nb-comments-empty">No comments yet — be the first to discuss this notebook.</div>'}
      </div>
      ${signedIn
        ? `<textarea class="nb-comment-ta" id="nb-comment-ta" rows="2" placeholder="Add a comment…"></textarea>
           <button class="nb-comment-btn" onclick="OmicsLab.Terminal.submitNbComment()">Post</button>`
        : `<div class="nb-comments-signin">Please <button class="nb-inline-link" onclick="OmicsLab.AuthClerk.signIn()">sign in</button> to comment.</div>`}`;
  }

  async function submitNbComment() {
    const ta = document.getElementById('nb-comment-ta');
    const body = ta?.value.trim();
    if (!body) return;
    const headers = await _nbAuthHeader();
    if (!headers) { OmicsLab.AuthClerk?.signIn?.(); return; }
    const nb = _NB_DATA.find(n => n.id === _activeNb);
    if (!nb) return;

    let topicId = _nbTopicId(nb.id);
    if (!topicId) {
      const res = await fetch('/api/forum-topics', {
        method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: 'showcase', title: `Notebook: ${nb.name}`, body: `Discussion thread for the ${nb.name} notebook.` }),
      }).catch(() => null);
      if (!res || !res.ok) return;
      const data = await res.json();
      topicId = data.topic?.id;
      if (topicId) localStorage.setItem('omicslab_nb_topicid_' + nb.id, topicId);
    }
    if (!topicId) return;

    await fetch('/api/forum-comments', {
      method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic_id: topicId, body }),
    }).catch(() => {});
    await _renderNbComments(nb.id);
  }

  function _cellHTML(cell, idx) {
    _cellSeq++;
    const n = _cellSeq;
    return `<div class="nb-cell" data-cell-idx="${idx}">
      <div class="nb-cell-gutter">
        <span class="nb-cell-num" id="nb-num-${n}">In [${n}]:</span>
        <button class="nb-run-btn" onclick="OmicsLab.Terminal.runCell(this)" data-cell-n="${n}" title="Run cell (Shift+Enter)">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><polygon points="5,3 19,12 5,21"/></svg>
        </button>
      </div>
      <div class="nb-cell-body">
        <div class="nb-cell-title">${cell.title || ''}</div>
        <textarea class="nb-code-area" id="nb-code-${n}" spellcheck="false" rows="${cell.code.split('\n').length + 1}">${_esc(cell.code)}</textarea>
        <div class="nb-output" id="nb-out-${n}"></div>
      </div>
    </div>`;
  }

  async function runCell(btn) {
    const n = parseInt(btn.dataset.cellN);
    const codeEl = document.getElementById('nb-code-' + n);
    const outEl  = document.getElementById('nb-out-'  + n);
    const numEl  = document.getElementById('nb-num-'  + n);
    if (!codeEl || !outEl) return;

    btn.disabled = true;
    btn.innerHTML = '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><line x1="9" y1="9" x2="15" y2="15"/><line x1="15" y1="9" x2="9" y2="15"/></svg>';
    outEl.innerHTML = '<div class="nb-running">Running…</div>';
    if (numEl) numEl.textContent = 'In [*]:';

    const py = await _loadPyodide();
    if (!py) {
      outEl.innerHTML = '<div class="nb-out-error">Kernel unavailable. Check internet connection and try again.</div>';
      btn.disabled = false;
      btn.innerHTML = '<svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><polygon points="5,3 19,12 5,21"/></svg>';
      return;
    }

    const code = codeEl.value;
    let stdout = '';
    py.setStdout({ batched: s => { stdout += s + '\n'; } });

    const logTime = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    try {
      const result = await py.runPythonAsync(code);
      let out = stdout;
      if (result !== undefined && result !== null && String(result) !== 'None') out += String(result);
      outEl.innerHTML = out
        ? `<div class="nb-out-stdout"><pre>${_esc(out.trimEnd())}</pre></div>`
        : '<div class="nb-out-empty">Cell executed — no output</div>';
      _runLog.push({ cell: n, status: 'ok', time: logTime });
    } catch (err) {
      outEl.innerHTML = `<div class="nb-out-error"><b>Error:</b> ${_esc(String(err))}</div>`;
      _runLog.push({ cell: n, status: 'error', time: logTime });
    }

    if (numEl) numEl.textContent = 'Out[' + n + ']:';
    btn.disabled = false;
    btn.innerHTML = '<svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><polygon points="5,3 19,12 5,21"/></svg>';
    OmicsLab.SkillTree?.awardXP('notebook_run');
  }

  function addNotebookCell() {
    const cells = document.getElementById('nb-cells');
    if (!cells) return;
    _cellSeq++;
    const n = _cellSeq;
    const div = document.createElement('div');
    div.className = 'nb-cell nb-cell--new';
    div.dataset.cellIdx = n;
    div.innerHTML = `
      <div class="nb-cell-gutter">
        <span class="nb-cell-num" id="nb-num-${n}">In [${n}]:</span>
        <button class="nb-run-btn" onclick="OmicsLab.Terminal.runCell(this)" data-cell-n="${n}" title="Run cell">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><polygon points="5,3 19,12 5,21"/></svg>
        </button>
      </div>
      <div class="nb-cell-body">
        <div class="nb-cell-title"></div>
        <textarea class="nb-code-area" id="nb-code-${n}" spellcheck="false" rows="5" placeholder="# Write Python code here…"></textarea>
        <div class="nb-output" id="nb-out-${n}"></div>
      </div>`;
    cells.appendChild(div);
    div.querySelector('textarea')?.focus();
    div.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function clearNotebook() {
    document.querySelectorAll('.nb-output').forEach(el => { el.innerHTML = ''; });
    document.querySelectorAll('.nb-cell-num').forEach((el,i) => { el.textContent = 'In [' + (i+1) + ']:'; });
  }

  function restartKernel() {
    _py = null; _pyLoading = false;
    clearNotebook();
    _setKernelStatus('loading');
    setTimeout(() => _loadPyodide(), 200);
  }

  /* ─── Render the full terminal section ─── */
  function init() {
    const container = document.getElementById('terminal-studio-content');
    if (!container) return;
    if (container.querySelector('.terminal-page')) return; /* already init */
    try {
    container.innerHTML = `
      <div class="terminal-page">
        <div class="terminal-page-header">
          <div class="terminal-page-title">${OmicsLab.Icons?.svg('cpu',18)||''} Bioinformatics Terminal</div>
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
          <button class="term-mode-tab active" onclick="OmicsLab.Terminal.switchMode('terminal',this)">${OmicsLab.Icons?.svg('cpu',13)||''} Terminal</button>
          <button class="term-mode-tab" onclick="OmicsLab.Terminal.switchMode('editor',this)">${OmicsLab.Icons?.svg('file-text',13)||''} Script Editor</button>
          <button class="term-mode-tab nb-tab-btn" onclick="OmicsLab.Terminal.switchMode('notebook',this)">
            ${OmicsLab.Icons?.svg('book-open',13)||''} Python Notebook
            <span class="nb-badge">NEW</span>
          </button>
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
                  <button class="term-run-btn" id="term-run-btn">Run</button>
                </div>
              </div>
            </div>

            <!-- Sidebar -->
            <div class="term-sidebar">
              <!-- Pipeline presets -->
              <div class="ts-card">
                <div class="ts-card-header">
                  <span>${OmicsLab.Icons?.svg('zap',13)||''} Pipeline Presets</span>
                </div>
                <div class="ts-card-body">
                  <div class="preset-list" id="preset-list">
                    ${PRESETS.map(p => `
                      <button class="preset-btn" onclick="OmicsLab.Terminal.runPreset('${p.id}')">
                        <span class="preset-icon">${OmicsLab.Icons?.svg(p.icon,16)||''}</span>
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
                  <span>${OmicsLab.Icons?.svg('package',13)||''} Output Files</span>
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
                <div class="ccs-title">${OmicsLab.Icons?.svg('zap',14)||''} Want to run real data?</div>
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
                <button class="se-action-btn" onclick="OmicsLab.Terminal.copyScript()">${OmicsLab.Icons?.svg('clipboard',13)||''} Copy</button>
                <button class="se-action-btn" onclick="OmicsLab.Terminal.downloadScript()">Download</button>
                <a href="https://codespaces.new/Simon-Mufara/Omics-Lab?quickstart=1"
                   target="_blank" rel="noopener" class="se-run-btn">Run in Codespace</a>
              </div>
              <textarea class="script-textarea" id="script-editor" spellcheck="false"
                placeholder="# Paste your pipeline script here or choose a template →">${_WGS_SCRIPT}</textarea>
              <div class="script-output-wrap" id="script-output" style="display:none"></div>
            </div>

            <div class="term-sidebar">
              <div class="ts-card">
                <div class="ts-card-header">${OmicsLab.Icons?.svg('file-text',13)||''} Script Templates</div>
                <div class="ts-card-body">
                  <div class="script-templates">
                    ${SCRIPT_TEMPLATES.map((t, i) => `
                      <button class="st-btn" onclick="OmicsLab.Terminal.loadTemplate(${i})">
                        ${OmicsLab.Icons?.svg(t.icon,14)||''} ${t.name}
                      </button>`).join('')}
                  </div>
                </div>
              </div>
              <div class="codespace-cta">
                <div class="ccs-title">${OmicsLab.Icons?.svg('lightbulb',14)||''} Run this script</div>
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

        <!-- ═══ Python Notebook Panel ═══ -->
        <div class="notebook-panel" id="notebook-panel">

          <!-- Kernel status bar -->
          <div class="nb-kernel-bar">
            <span id="nb-kernel-dot" class="nb-kernel-dot"></span>
            <span id="nb-kernel-status" class="nb-kernel-status">Kernel idle — click Run to start Python</span>
            <span id="nb-kernel-retry" style="display:none">
              <button class="nb-toolbar-btn" onclick="OmicsLab.Terminal.restartKernel()" title="Retry loading the Python kernel">
                ${OmicsLab.Icons?.svg('refresh-cw',12)||''} Retry
              </button>
            </span>
            <span class="nb-kernel-sep"></span>
            <button class="nb-toolbar-btn" onclick="OmicsLab.Terminal.clearNotebook()" title="Clear all outputs">
              ${OmicsLab.Icons?.svg('trash-2',12)||''} Clear outputs
            </button>
            <button class="nb-toolbar-btn" onclick="OmicsLab.Terminal.restartKernel()" title="Restart Python kernel">
              ${OmicsLab.Icons?.svg('refresh-cw',12)||''} Restart kernel
            </button>
            <button class="nb-toolbar-btn nb-toolbar-btn--add" onclick="OmicsLab.Terminal.addNotebookCell()" title="Add a new code cell">
              ${OmicsLab.Icons?.svg('plus',12)||''} Add cell
            </button>
          </div>

          <!-- Notebook selectors -->
          <div class="nb-selector-row">
            ${_NB_DATA.map(nb => `
              <button class="nb-selector-btn${nb.id==='seq'?' active':''}" data-nb="${nb.id}"
                onclick="OmicsLab.Terminal._renderNotebook(this.dataset.nb)">
                ${OmicsLab.Icons?.svg(nb.icon,14)||''} ${nb.name}
                <span class="nb-selector-desc">${nb.desc}</span>
              </button>`).join('')}
          </div>

          <!-- Kaggle-style kernel meta bar -->
          <div id="nb-meta-bar" class="nb-meta-bar"></div>

          <!-- Pyodide info bar -->
          <div class="nb-info-bar">
            ${OmicsLab.Icons?.svg('info',12)||''}
            <span>Real Python executes in your browser via <b>Pyodide</b> (WebAssembly). First run needs internet to download ~10 MB — this browser then caches it, so it works fully offline after that.</span>
          </div>

          <!-- Output / Logs tabs -->
          <div class="nb-view-tabs">
            <button class="nb-view-tab active" data-view="output" onclick="OmicsLab.Terminal._switchNbView('output')">Output</button>
            <button class="nb-view-tab" data-view="logs" onclick="OmicsLab.Terminal._switchNbView('logs')">Logs</button>
          </div>

          <!-- Cells -->
          <div id="nb-cells" class="nb-cells"></div>
          <div id="nb-logs" class="nb-logs" style="display:none"></div>

          <!-- Comments (Kaggle-style kernel discussion) -->
          <div class="nb-comments" id="nb-comments"></div>

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
    const tw = container.querySelector('.term-window');
    if (tw) tw.addEventListener('click', () => _inputEl && _inputEl.focus());
    } catch(err) {
      container.innerHTML = `<div style="padding:3rem 2rem;text-align:center;color:#f85149;font-family:monospace">
        <div style="font-size:1.4rem;font-weight:700;margin-bottom:1rem">Terminal failed to load</div>
        <div style="font-size:0.9rem;color:#A8A098;max-width:480px;margin:0 auto">${String(err)}</div>
        <div style="margin-top:2rem">
          <a href="https://codespaces.new/Simon-Mufara/Omics-Lab?quickstart=1" target="_blank" rel="noopener"
             style="display:inline-block;padding:0.6rem 1.5rem;background:#007A6A;color:#fff;text-decoration:none;border-radius:6px;font-size:0.88rem">
            Open in GitHub Codespaces instead
          </a>
        </div>
      </div>`;
    }
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
    document.querySelectorAll('.terminal-panel, .script-editor-panel, .notebook-panel').forEach(el => el.classList.remove('active'));
    if (mode === 'notebook') {
      const nb = document.getElementById('notebook-panel');
      if (nb) {
        nb.classList.add('active');
        if (!nb.dataset.nbReady) {
          nb.dataset.nbReady = '1';
          _renderNotebook(_activeNb);
        }
      }
    } else {
      const panel = document.getElementById(mode === 'editor' ? 'editor-panel' : 'term-panel');
      if (panel) panel.classList.add('active');
    }
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
      if (btn) { btn.innerHTML = `${OmicsLab.Icons?.svg('check',13)||''} Copied!`; setTimeout(() => { btn.innerHTML = `${OmicsLab.Icons?.svg('clipboard',13)||''} Copy`; }, 1800); }
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

  /* Opens the real notebook pre-loaded with one or more starter cells,
     e.g. from the "Visualize in Python" panel on a simulation results
     screen. `cells` is [{title, code}, ...]. Clicks the real notebook
     tab button rather than calling switchMode() directly, since
     switchMode() dereferences its `btn` argument unconditionally. */
  function openStarterSnippet(cells) {
    const tabBtn = document.querySelector('.term-mode-tab.nb-tab-btn');
    if (tabBtn) tabBtn.click();
    if (!Array.isArray(cells) || !cells.length) return;
    setTimeout(() => {
      cells.forEach(({ title, code }) => {
        addNotebookCell();
        const areas = document.querySelectorAll('.nb-code-area');
        const lastArea = areas[areas.length - 1];
        if (lastArea) lastArea.value = code || '';
        const titles = document.querySelectorAll('.nb-cell-title');
        const lastTitle = titles[titles.length - 1];
        if (lastTitle && title) lastTitle.textContent = title;
      });
    }, 150);
  }

  return { init, runPreset, clearTerminal, focusInput, switchMode, loadTemplate, copyScript, downloadScript,
           runCell, addNotebookCell, clearNotebook, restartKernel, _renderNotebook,
           copyAndEdit, _switchNbView, submitNbComment, openStarterSnippet,
           NB_LIST: _NB_DATA.map(n => ({ id: n.id, name: n.name })) };
})();
