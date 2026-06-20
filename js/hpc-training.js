/* ═══════════════════════════════════════════════════════════════
   OmicsLab — HPC Training Layer
   Teaches SLURM, job scheduling, resource requests, workflow
   engines, and containerized pipelines via interactive simulation.
   Reuses existing pipeline examples; adds educational sim only.
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.HPCTraining = (function () {

  /* ─── SLURM script generator ─── */
  function _buildSlurmScript(cfg) {
    const pipelineCmd = _pipelineCmdFor(cfg.step);
    const lines = [
      '#!/usr/bin/env bash',
      '#SBATCH --job-name=' + cfg.jobName,
      '#SBATCH --cpus-per-task=' + cfg.cpus,
      '#SBATCH --mem=' + cfg.mem + 'G',
      '#SBATCH --time=' + cfg.time,
      '#SBATCH --partition=' + cfg.partition,
      '#SBATCH --output=logs/%x_%j.out',
      '#SBATCH --error=logs/%x_%j.err',
      '',
      '# Load required modules',
      'module load singularity/3.9',
      'module load anaconda3',
      '',
      '# Activate conda environment',
      'source activate omicslab-env',
      '',
      '# Pipeline step: ' + cfg.step,
      pipelineCmd,
      '',
      'echo "Job $SLURM_JOB_ID finished on $(date)"'
    ];
    return lines.join('\n');
  }

  function _pipelineCmdFor(step) {
    const cmds = {
      'FastQC + MultiQC':
        'fastqc reads/${SAMPLE}_R1.fastq.gz reads/${SAMPLE}_R2.fastq.gz -o qc/ -t $SLURM_CPUS_PER_TASK\nmultiqc qc/ -o qc/multiqc/',
      'Read Trimming':
        'fastp \\\n  -i reads/${SAMPLE}_R1.fastq.gz \\\n  -I reads/${SAMPLE}_R2.fastq.gz \\\n  -o trimmed/${SAMPLE}_R1.trimmed.fastq.gz \\\n  -O trimmed/${SAMPLE}_R2.trimmed.fastq.gz \\\n  --thread $SLURM_CPUS_PER_TASK',
      'Alignment + Sort':
        'bwa-mem2 mem -t $SLURM_CPUS_PER_TASK resources/GRCh38.fa \\\n  trimmed/${SAMPLE}_R1.trimmed.fastq.gz \\\n  trimmed/${SAMPLE}_R2.trimmed.fastq.gz \\\n  | samtools sort -@ $SLURM_CPUS_PER_TASK -o bam/${SAMPLE}.sorted.bam\nsamtools index bam/${SAMPLE}.sorted.bam',
      'Duplicate Marking + BQSR':
        'picard MarkDuplicates \\\n  I=bam/${SAMPLE}.sorted.bam \\\n  O=bam/${SAMPLE}.dedup.bam \\\n  M=qc/${SAMPLE}.dup_metrics.txt\ngatk BaseRecalibrator -R resources/GRCh38.fa -I bam/${SAMPLE}.dedup.bam \\\n  --known-sites resources/known_sites.vcf.gz -O bam/${SAMPLE}.recal.table\ngatk ApplyBQSR -R resources/GRCh38.fa -I bam/${SAMPLE}.dedup.bam \\\n  --bqsr-recal-file bam/${SAMPLE}.recal.table -O bam/${SAMPLE}.bqsr.bam',
      'Variant Calling + Annotation':
        'gatk HaplotypeCaller -R resources/GRCh38.fa \\\n  -I bam/${SAMPLE}.bqsr.bam \\\n  -O vcf/${SAMPLE}.g.vcf.gz -ERC GVCF\nvep -i vcf/${SAMPLE}.g.vcf.gz -o report/${SAMPLE}.vep.tsv --tab'
    };
    return cmds[step] || 'echo "Running ' + step + '"';
  }

  /* ─── Queue simulation ─── */
  const _queue = [];
  let _jobCounter = 1000;

  function _estimateWait(cpus, mem, partition) {
    if (partition === 'gpu')     return Math.floor(Math.random() * 20 + 10);
    if (cpus >= 16 || mem >= 64) return Math.floor(Math.random() * 15 + 5);
    if (cpus >= 8  || mem >= 32) return Math.floor(Math.random() * 8  + 2);
    return Math.floor(Math.random() * 3 + 1);
  }

  function _estimateRuntime(step, cpus, mem) {
    const base = { 'FastQC + MultiQC': 12, 'Read Trimming': 25, 'Alignment + Sort': 90,
                   'Duplicate Marking + BQSR': 60, 'Variant Calling + Annotation': 120 };
    const mins = (base[step] || 30) * (16 / cpus);
    return Math.round(mins);
  }

  function _submitJob(cfg) {
    const jid = ++_jobCounter;
    const waitMins  = _estimateWait(cfg.cpus, cfg.mem, cfg.partition);
    const runMins   = _estimateRuntime(cfg.step, cfg.cpus, cfg.mem);
    const job = { jid, cfg, waitMins, runMins, status: 'PENDING', submitted: new Date() };
    _queue.unshift(job);
    return job;
  }

  /* ─── Scenario simulator ─── */
  const SCENARIOS = {
    success: {
      label: 'Successful Run',
      description: 'All resources sufficient — job completes cleanly.',
      lines: (cfg) => [
        { t: '00:00', cls: 'hpc-sim-info', msg: `Submitted batch job ${1001 + _jobCounter % 50}` },
        { t: '00:01', cls: 'hpc-sim-warn', msg: `PENDING — waiting for ${_estimateWait(cfg.cpus, cfg.mem, cfg.partition)} min in queue` },
        { t: '+wait', cls: 'hpc-sim-info', msg: 'RUNNING — allocated on node compute-01' },
        { t: '+03m',  cls: 'hpc-sim-ok',   msg: `[QC]  FastQC complete: Q30 = 94.2%, adapter = 1.1%` },
        { t: '+12m',  cls: 'hpc-sim-ok',   msg: `[ALN] BWA-MEM2 alignment: 98.7% mapped` },
        { t: '+' + _estimateRuntime(cfg.step, cfg.cpus, cfg.mem) + 'm',
          cls: 'hpc-sim-ok', msg: 'COMPLETED — exit code 0. Results in results/' }
      ]
    },
    oom: {
      label: 'Out of Memory (OOM)',
      description: 'Job killed by the scheduler when it exceeds its memory limit.',
      lines: () => [
        { t: '00:00', cls: 'hpc-sim-info', msg: 'Submitted batch job 10042' },
        { t: '+02m',  cls: 'hpc-sim-info', msg: 'RUNNING on node compute-04' },
        { t: '+08m',  cls: 'hpc-sim-warn', msg: 'Memory usage approaching limit (95%)' },
        { t: '+09m',  cls: 'hpc-sim-err',  msg: 'slurmstepd: error: Exceeded job memory limit' },
        { t: '+09m',  cls: 'hpc-sim-err',  msg: 'FAILED — OOM Kill (signal 9). Increase --mem' },
        { t: '',      cls: 'hpc-sim-info', msg: '→ Tip: re-submit with --mem 64G or stream with pipes to reduce peak memory' }
      ]
    },
    timeout: {
      label: 'Time Limit Exceeded',
      description: 'Job killed because it ran past its requested wall-clock time.',
      lines: () => [
        { t: '00:00', cls: 'hpc-sim-info', msg: 'Submitted batch job 10055' },
        { t: '+05m',  cls: 'hpc-sim-info', msg: 'RUNNING on node compute-07' },
        { t: '+59m',  cls: 'hpc-sim-warn', msg: '1 min remaining — checkpoint if possible' },
        { t: '+60m',  cls: 'hpc-sim-err',  msg: 'DUE TIME: slurmstepd: Timeout reached' },
        { t: '+60m',  cls: 'hpc-sim-err',  msg: 'FAILED — TIMEOUT. Increase --time or split the job' },
        { t: '',      cls: 'hpc-sim-info', msg: '→ Tip: use --time 4:00:00 and consider checkpointing with GATK scatter/gather' }
      ]
    },
    optimize: {
      label: 'Runtime Optimization',
      description: 'Compare two resource profiles: see how more CPUs and memory cut wall time.',
      lines: () => [
        { t: '', cls: 'hpc-sim-info', msg: '── Profile A: --cpus-per-task=4 --mem=16G ──' },
        { t: '', cls: 'hpc-sim-warn', msg: 'Alignment runtime: ~95 min  |  Queue wait: ~2 min' },
        { t: '', cls: 'hpc-sim-info', msg: '── Profile B: --cpus-per-task=16 --mem=64G ──' },
        { t: '', cls: 'hpc-sim-ok',   msg: 'Alignment runtime: ~24 min  |  Queue wait: ~12 min' },
        { t: '', cls: 'hpc-sim-info', msg: '── Verdict ──' },
        { t: '', cls: 'hpc-sim-ok',   msg: 'Profile B is 4× faster in wall time. If the queue is short, the extra wait is worth it.' },
        { t: '', cls: 'hpc-sim-warn', msg: '→ Tip: use "seff <jobid>" after a run to see actual CPU and memory efficiency' }
      ]
    }
  };

  /* ─── Workflow engines data ─── */
  const ENGINES = [
    { name: 'Snakemake', tag: 'Python-based', points: [
      'Rules define inputs → outputs', 'Auto-parallelises on HPC/cloud',
      'Native SLURM integration via --cluster', 'Large bioinformatics community',
      'Same Snakefile works locally and on HPC'
    ]},
    { name: 'Nextflow', tag: 'Groovy/DSL2', points: [
      'Dataflow concurrency model', 'nf-core: 100+ curated pipelines',
      'First-class Docker/Singularity support', 'Built-in AWS/Google Batch',
      'Excellent for large-scale production'
    ]},
    { name: 'WDL', tag: 'Workflow Description Language', points: [
      'Cromwell or MiniWDL as executor', 'Enforced input/output typing',
      'Used by GATK Best Practices', 'Terra/GCP native',
      'Verbose but very explicit'
    ]},
    { name: 'Nextflow (nf-core)', tag: 'Community pipelines', points: [
      'nf-core/sarek — WGS/somatic', 'nf-core/rnaseq — RNA-Seq',
      'nf-core/mag — metagenomics', 'Lint/CI enforced standards',
      'Drop-in SLURM config profiles'
    ]}
  ];

  /* ─── SLURM concepts ─── */
  const CONCEPTS = [
    { icon: 'cpu',       title: 'sbatch', body: 'Submits a batch script to SLURM. The scheduler reads the #SBATCH directives and places the job in a queue.' },
    { icon: 'clipboard', title: 'squeue', body: 'Lists jobs in the queue. Use squeue -u $USER to see your own jobs and their status (PENDING, RUNNING, COMPLETED).' },
    { icon: 'x-circle',  title: 'scancel', body: 'Cancels a queued or running job by job ID. Usage: scancel <jobid>. Stops execution immediately.' },
    { icon: 'server',    title: 'sinfo', body: 'Shows available partitions and node states (idle, alloc, drain). Tells you which nodes are free.' },
    { icon: 'bar-chart', title: 'seff', body: 'After a job completes, shows CPU and memory efficiency. A common result: 20% CPU efficiency means you over-requested.' },
    { icon: 'package',   title: 'Singularity/Apptainer', body: 'HPC-safe containers. Unlike Docker, they run without root. Use singularity exec biotools.sif <cmd> inside your SLURM script.' },
    { icon: 'database',  title: '--mem vs --mem-per-cpu', body: '--mem sets total job memory; --mem-per-cpu sets per-core memory (total = cpus × mem-per-cpu). Never request more than the node has.' },
    { icon: 'clock',     title: 'Wall time', body: 'The maximum clock time your job is allowed. Format: D-HH:MM:SS or HH:MM:SS. Jobs exceeding this are killed automatically.' }
  ];

  /* ─── Render helpers ─── */
  function _h(tag, cls, content) {
    return `<${tag}${cls ? ' class="' + cls + '"' : ''}>${content}</${tag}>`;
  }

  function _renderScript(script) {
    return script
      .replace(/^(#SBATCH.*)/gm, '<span class="hpc-directive">$1</span>')
      .replace(/^(#.*)/gm, '<span class="hpc-comment">$1</span>')
      .replace(/^(echo|module|source|bwa|samtools|fastqc|multiqc|fastp|picard|gatk|vep)(.*)/gm,
               '<span class="hpc-cmd">$1$2</span>');
  }

  function _renderSimOutput(lines) {
    return lines.map(l =>
      `<div class="hpc-sim-line">
        <span class="hpc-sim-time">${l.t}</span>
        <span class="${l.cls}">${l.msg}</span>
      </div>`
    ).join('');
  }

  /* ─── Panel builders ─── */
  function _buildJobSubmitPanel() {
    const steps = ['FastQC + MultiQC', 'Read Trimming', 'Alignment + Sort',
                   'Duplicate Marking + BQSR', 'Variant Calling + Annotation'];
    const partitions = ['standard', 'highmem', 'gpu', 'shortrun'];

    return `
      <div class="hpc-two-col">
        <div class="hpc-form-card">
          <h3>Build a SLURM Job Script</h3>
          <div class="hpc-field">
            <label>Job Name</label>
            <input id="hpc-job-name" type="text" value="omicslab_wgs" maxlength="32" />
          </div>
          <div class="hpc-field">
            <label>Pipeline Step</label>
            <select id="hpc-step">${steps.map(s => `<option>${s}</option>`).join('')}</select>
          </div>
          <div class="hpc-field">
            <label>CPUs per task</label>
            <select id="hpc-cpus">
              <option value="1">1 CPU</option>
              <option value="4">4 CPUs</option>
              <option value="8" selected>8 CPUs</option>
              <option value="16">16 CPUs</option>
              <option value="32">32 CPUs</option>
            </select>
          </div>
          <div class="hpc-field">
            <label>Memory (GB)</label>
            <select id="hpc-mem">
              <option value="4">4 GB</option>
              <option value="16">16 GB</option>
              <option value="32" selected>32 GB</option>
              <option value="64">64 GB</option>
              <option value="128">128 GB</option>
            </select>
          </div>
          <div class="hpc-field">
            <label>Wall time</label>
            <select id="hpc-time">
              <option value="01:00:00">1 hour</option>
              <option value="04:00:00" selected>4 hours</option>
              <option value="12:00:00">12 hours</option>
              <option value="24:00:00">24 hours</option>
              <option value="72:00:00">72 hours</option>
            </select>
          </div>
          <div class="hpc-field">
            <label>Partition</label>
            <select id="hpc-partition">${partitions.map(p => `<option>${p}</option>`).join('')}</select>
          </div>
          <button class="hpc-submit-btn" onclick="OmicsLab.HPCTraining.generateScript()">Generate Script</button>
        </div>

        <div>
          <div class="hpc-form-card" style="margin-bottom:1rem">
            <h3>SLURM Script Preview</h3>
            <pre id="hpc-script-out" class="hpc-script-preview"># Fill in the form and click Generate Script</pre>
          </div>
          <div class="hpc-form-card">
            <h3>Simulate Job Submission</h3>
            <div class="hpc-scenario-row" id="hpc-scenario-row">
              ${Object.entries(SCENARIOS).map(([k, s]) =>
                `<button class="hpc-scenario-btn" data-scenario="${k}"
                   onclick="OmicsLab.HPCTraining.runScenario('${k}',this)">${s.label}</button>`
              ).join('')}
            </div>
            <div id="hpc-scenario-desc" style="font-size:0.83rem;color:var(--text-muted);margin-bottom:0.5rem"></div>
            <div id="hpc-sim-out" class="hpc-sim-output">Click a scenario above to simulate job execution.</div>
          </div>
        </div>
      </div>
    `;
  }

  function _buildQueuePanel() {
    return `
      <div class="hpc-form-card" style="max-width:900px">
        <h3>Queue Monitor — squeue simulation</h3>
        <p style="font-size:0.85rem;color:var(--text-muted);margin-bottom:1rem">
          Each partition has shared resources. Larger resource requests wait longer.
          Submit jobs from the Job Builder tab to populate the queue.
        </p>
        <div style="display:flex;gap:0.75rem;flex-wrap:wrap;margin-bottom:1rem">
          <button class="hpc-submit-btn" style="width:auto;padding:0.45rem 1rem"
                  onclick="OmicsLab.HPCTraining.submitToQueue()">sbatch (use current settings)</button>
          <button class="hpc-submit-btn" style="width:auto;padding:0.45rem 1rem;background:var(--surface-3,#2d333b);color:var(--text)"
                  onclick="OmicsLab.HPCTraining.clearQueue()">Clear Queue</button>
        </div>
        <table class="hpc-queue-table">
          <thead>
            <tr><th>JOBID</th><th>NAME</th><th>PARTITION</th><th>CPUs</th><th>MEM</th>
                <th>TIME</th><th>WAIT</th><th>STATE</th></tr>
          </thead>
          <tbody id="hpc-queue-tbody"><tr><td colspan="8" style="color:var(--text-muted);padding:1rem">
            No jobs yet — use the Job Builder or click sbatch above.
          </td></tr></tbody>
        </table>
      </div>
    `;
  }

  function _buildConceptsPanel() {
    const cards = CONCEPTS.map(c => `
      <div class="hpc-concept-card">
        <div class="hpc-concept-icon">${OmicsLab.Icons?.svg(c.icon, 22) || ''}</div>
        <div class="hpc-concept-title">${c.title}</div>
        <div class="hpc-concept-body">${c.body}</div>
      </div>`).join('');
    return `
      <h3 style="margin-bottom:0.5rem">Essential SLURM Commands &amp; Concepts</h3>
      <p style="font-size:0.85rem;color:var(--text-muted);margin-bottom:1rem">
        Everything you need to submit, monitor, and debug jobs on a cluster.
      </p>
      <div class="hpc-concept-grid">${cards}</div>
      <div class="hpc-form-card" style="max-width:780px;margin-top:1.5rem">
        <h3>Common squeue Output Fields</h3>
        <pre style="font-size:0.78rem;line-height:1.7;color:#e6edf3;overflow-x:auto">JOBID   PARTITION     NAME       USER  ST   TIME  NODES  NODELIST(REASON)
10043   standard  omics_wgs   alice   R  0:04:13   1  compute-03
10044   highmem   gatk_gvcf    bob  PD   0:00:00   1  (Priority)
10045   standard  multiqc_qc  carol   R  0:01:05   1  compute-07

ST codes: R=RUNNING  PD=PENDING  CG=COMPLETING  F=FAILED  TO=TIMEOUT</pre>
      </div>
    `;
  }

  function _buildEnginesPanel() {
    const cards = ENGINES.map(e => `
      <div class="hpc-engine-card">
        <div class="hpc-engine-name">${e.name}</div>
        <div class="hpc-engine-tag">${e.tag}</div>
        <ul class="hpc-engine-list">${e.points.map(p => `<li>• ${p}</li>`).join('')}</ul>
      </div>`).join('');
    return `
      <h3 style="margin-bottom:0.5rem">Workflow Engines for HPC</h3>
      <p style="font-size:0.85rem;color:var(--text-muted);margin-bottom:1rem">
        Workflow engines turn ad-hoc shell scripts into reproducible, parallelised pipelines.
        All of these can submit to SLURM automatically.
      </p>
      <div class="hpc-engines-grid">${cards}</div>

      <div class="hpc-two-col" style="margin-top:1.5rem">
        <div class="hpc-form-card">
          <h3>Snakemake → SLURM (reuses existing Snakefile)</h3>
          <pre class="hpc-script-preview" style="min-height:unset"># Run from login node — Snakemake submits each rule as a SLURM job
snakemake --jobs 20 \\
  --cluster "sbatch --cpus-per-task={threads} --mem={resources.mem_mb}M --time=4:00:00" \\
  --use-singularity \\
  --singularity-args "--bind /data:/data"

# Or with a Snakemake SLURM profile (recommended):
snakemake --profile slurm --jobs 20 --use-singularity</pre>
        </div>
        <div class="hpc-form-card">
          <h3>Nextflow → SLURM</h3>
          <pre class="hpc-script-preview" style="min-height:unset"># nextflow.config
process {
  executor = 'slurm'
  queue    = 'standard'
  cpus     = 8
  memory   = '32 GB'
  time     = '4h'
  container = 'nfcore/sarek:3.4.0'
}

singularity {
  enabled    = true
  autoMounts = true
}

# Submit:
nextflow run nf-core/sarek -profile singularity,slurm \\
  --input samplesheet.csv --genome GRCh38</pre>
        </div>
      </div>
    `;
  }

  function _buildContainersPanel() {
    return `
      <h3 style="margin-bottom:0.5rem">Containerised Pipelines on HPC</h3>
      <p style="font-size:0.85rem;color:var(--text-muted);margin-bottom:1rem">
        Docker cannot run on most HPC clusters (requires root). Singularity/Apptainer runs
        as a normal user and is the standard HPC container runtime.
      </p>
      <div class="hpc-two-col">
        <div class="hpc-form-card">
          <h3>Using Singularity in a SLURM script</h3>
          <pre class="hpc-script-preview" style="min-height:unset">#!/usr/bin/env bash
#SBATCH --job-name=bwa_singularity
#SBATCH --cpus-per-task=16
#SBATCH --mem=64G
#SBATCH --time=04:00:00
#SBATCH --partition=standard

module load singularity/3.9

# Pull image (once — cache in $HOME/.singularity)
singularity pull --name bwakit.sif \\
  docker://quay.io/biocontainers/bwa-mem2:2.2.1--he513fc3_0

# Run alignment inside the container
singularity exec --bind /scratch:/scratch bwakit.sif \\
  bwa-mem2 mem -t 16 GRCh38.fa R1.fq.gz R2.fq.gz \\
  | samtools sort -o sample.sorted.bam

echo "Done: $(date)"</pre>
        </div>
        <div>
          <div class="hpc-concept-grid" style="grid-template-columns:1fr">
            <div class="hpc-concept-card">
              <div class="hpc-concept-icon">${OmicsLab.Icons?.svg('package', 22) || ''}</div>
              <div class="hpc-concept-title">Why not Docker on HPC?</div>
              <div class="hpc-concept-body">Docker requires a daemon running as root, which is a security
              risk on multi-tenant clusters. Singularity converts Docker images and runs them as the
              submitting user — no root needed.</div>
            </div>
            <div class="hpc-concept-card">
              <div class="hpc-concept-icon">${OmicsLab.Icons?.svg('rotate-cw', 22) || ''}</div>
              <div class="hpc-concept-title">Converting Docker → Singularity</div>
              <div class="hpc-concept-body"><span class="hpc-code-inline">singularity pull docker://biocontainers/fastqc:0.12</span>
              converts any Docker Hub or quay.io image to a <span class="hpc-code-inline">.sif</span> file you can cache and reuse.</div>
            </div>
            <div class="hpc-concept-card">
              <div class="hpc-concept-icon">${OmicsLab.Icons?.svg('archive', 22) || ''}</div>
              <div class="hpc-concept-title">Bind mounts</div>
              <div class="hpc-concept-body">Use <span class="hpc-code-inline">--bind /scratch:/scratch</span> to make
              your HPC scratch storage visible inside the container. Without a bind, the container only sees its own filesystem.</div>
            </div>
            <div class="hpc-concept-card">
              <div class="hpc-concept-icon">${OmicsLab.Icons?.svg('globe', 22) || ''}</div>
              <div class="hpc-concept-title">Africa HPC resources</div>
              <div class="hpc-concept-body">H3ABioNet provides cluster access and training for African researchers.
              CHPC (South Africa), ILRI (Kenya), and WACCBIP (Ghana) all run SLURM clusters with Singularity.</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /* ─── Public API ─── */
  function generateScript() {
    const cfg = _readForm();
    const script = _buildSlurmScript(cfg);
    const pre = document.getElementById('hpc-script-out');
    if (pre) pre.innerHTML = _renderScript(script);
  }

  function runScenario(key, btn) {
    document.querySelectorAll('.hpc-scenario-btn').forEach(b => b.classList.remove('selected'));
    if (btn) btn.classList.add('selected');
    const scenario = SCENARIOS[key];
    if (!scenario) return;
    const desc = document.getElementById('hpc-scenario-desc');
    if (desc) desc.textContent = scenario.description;
    const cfg = _readForm();
    const lines = scenario.lines(cfg);
    const out = document.getElementById('hpc-sim-out');
    if (!out) return;
    out.innerHTML = '';
    let i = 0;
    function addLine() {
      if (i >= lines.length) return;
      out.innerHTML += _renderSimOutput([lines[i]]);
      out.scrollTop = out.scrollHeight;
      i++;
      setTimeout(addLine, 400 + Math.random() * 300);
    }
    addLine();
  }

  function submitToQueue() {
    const cfg = _readForm();
    const job = _submitJob(cfg);
    _renderQueue();
    setTimeout(() => {
      job.status = 'RUNNING';
      _renderQueue();
      setTimeout(() => {
        job.status = Math.random() > 0.15 ? 'COMPLETED' : 'FAILED';
        _renderQueue();
      }, job.runMins * 400);
    }, job.waitMins * 200);
  }

  function clearQueue() {
    _queue.length = 0;
    _renderQueue();
  }

  function _renderQueue() {
    const tbody = document.getElementById('hpc-queue-tbody');
    if (!tbody) return;
    if (_queue.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" style="color:var(--text-muted);padding:1rem">No jobs in queue.</td></tr>';
      return;
    }
    tbody.innerHTML = _queue.map(j => {
      const stClass = { PENDING: 'hpc-status-pending', RUNNING: 'hpc-status-running',
                        COMPLETED: 'hpc-status-done', FAILED: 'hpc-status-failed' }[j.status] || '';
      return `<tr>
        <td>${j.jid}</td>
        <td>${j.cfg.jobName}</td>
        <td>${j.cfg.partition}</td>
        <td>${j.cfg.cpus}</td>
        <td>${j.cfg.mem}G</td>
        <td>${j.cfg.time}</td>
        <td>~${j.waitMins}m</td>
        <td><span class="hpc-status-badge ${stClass}">${j.status}</span></td>
      </tr>`;
    }).join('');
  }

  function _readForm() {
    return {
      jobName:   (document.getElementById('hpc-job-name')  || {}).value || 'omicslab_wgs',
      step:      (document.getElementById('hpc-step')      || {}).value || 'Alignment + Sort',
      cpus:      parseInt((document.getElementById('hpc-cpus')      || {}).value || '8'),
      mem:       parseInt((document.getElementById('hpc-mem')       || {}).value || '32'),
      time:      (document.getElementById('hpc-time')      || {}).value || '04:00:00',
      partition: (document.getElementById('hpc-partition') || {}).value || 'standard'
    };
  }

  /* ─── Tab switching ─── */
  function switchTab(id) {
    document.querySelectorAll('.hpc-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === id));
    document.querySelectorAll('.hpc-panel').forEach(p => p.classList.toggle('active', p.id === 'hpc-panel-' + id));
  }

  /* ─── Init ─── */
  function init() {
    const container = document.getElementById('hpc-training-content');
    if (!container) return;

    const tabs = [
      { id: 'submit',     label: 'Job Builder' },
      { id: 'queue',      label: 'Queue Monitor' },
      { id: 'concepts',   label: 'SLURM Concepts' },
      { id: 'engines',    label: 'Workflow Engines' },
      { id: 'containers', label: 'Containers' }
    ];

    const tabBar = tabs.map(t =>
      `<button class="hpc-tab${t.id === 'submit' ? ' active' : ''}" data-tab="${t.id}"
         onclick="OmicsLab.HPCTraining.switchTab('${t.id}')">${t.label}</button>`
    ).join('');

    const panels = [
      { id: 'submit',     html: _buildJobSubmitPanel() },
      { id: 'queue',      html: _buildQueuePanel() },
      { id: 'concepts',   html: _buildConceptsPanel() },
      { id: 'engines',    html: _buildEnginesPanel() },
      { id: 'containers', html: _buildContainersPanel() }
    ].map(p => `<div id="hpc-panel-${p.id}" class="hpc-panel${p.id === 'submit' ? ' active' : ''}">${p.html}</div>`).join('');

    container.innerHTML = `<div class="hpc-tab-bar">${tabBar}</div>${panels}`;
  }

  return { init, generateScript, runScenario, submitToQueue, clearQueue, switchTab };
})();
