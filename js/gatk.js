/* ═══════════════════════════════════════════════════════════════
   OmicsLab — GATK Command Builder (#11)
   Builds GATK4 best-practices commands for variant calling
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.GATK = (function () {

  const TOOLS = [
    {
      id: 'haplotypecaller',
      label: 'HaplotypeCaller',
      desc: 'Call germline SNPs and indels via local re-assembly',
      fields: [
        { id: 'input', label: 'Input BAM', type: 'text', placeholder: '/data/sample.bam', flag: '-I' },
        { id: 'ref', label: 'Reference FASTA', type: 'text', placeholder: '/ref/GRCh38.fa', flag: '-R' },
        { id: 'output', label: 'Output VCF', type: 'text', placeholder: '/out/sample.g.vcf.gz', flag: '-O' },
        { id: 'sample', label: 'Sample name', type: 'text', placeholder: 'SAMPLE_001', flag: '--sample-name' },
        { id: 'ploidy', label: 'Ploidy', type: 'select', options: ['2','1','4'], flag: '--sample-ploidy', default: '2' },
        { id: 'mode', label: 'Mode', type: 'select', options: ['GVCF','BP_RESOLUTION'], flag: '-ERC', default: 'GVCF' },
        { id: 'pcr', label: 'PCR model', type: 'select', options: ['CONSERVATIVE','HOSTILE','AGGRESSIVE','NONE'], flag: '--pcr-indel-model', default: 'CONSERVATIVE' },
        { id: 'dbsnp', label: 'dbSNP VCF (optional)', type: 'text', placeholder: '/ref/dbsnp.vcf.gz', flag: '--dbsnp' },
        { id: 'threads', label: 'Native pair HMM threads', type: 'select', options: ['2','4','8','16'], flag: '--native-pair-hmm-threads', default: '4' },
      ],
    },
    {
      id: 'bqsr',
      label: 'BaseRecalibrator',
      desc: 'Base quality score recalibration (BQSR step 1)',
      fields: [
        { id: 'input', label: 'Input BAM', type: 'text', placeholder: '/data/sample_markdup.bam', flag: '-I' },
        { id: 'ref', label: 'Reference FASTA', type: 'text', placeholder: '/ref/GRCh38.fa', flag: '-R' },
        { id: 'output', label: 'Recal table', type: 'text', placeholder: '/out/recal.table', flag: '-O' },
        { id: 'known1', label: 'Known sites VCF 1 (dbSNP)', type: 'text', placeholder: '/ref/dbsnp.vcf.gz', flag: '--known-sites' },
        { id: 'known2', label: 'Known sites VCF 2 (Mills)', type: 'text', placeholder: '/ref/Mills_indels.vcf.gz', flag: '--known-sites' },
      ],
    },
    {
      id: 'applybqsr',
      label: 'ApplyBQSR',
      desc: 'Apply recalibration to produce final analysis-ready BAM',
      fields: [
        { id: 'input', label: 'Input BAM', type: 'text', placeholder: '/data/sample_markdup.bam', flag: '-I' },
        { id: 'ref', label: 'Reference FASTA', type: 'text', placeholder: '/ref/GRCh38.fa', flag: '-R' },
        { id: 'table', label: 'BQSR table', type: 'text', placeholder: '/out/recal.table', flag: '--bqsr-recal-file' },
        { id: 'output', label: 'Output BAM', type: 'text', placeholder: '/out/sample.bqsr.bam', flag: '-O' },
        { id: 'static', label: 'Static quantized quals', type: 'select', options: ['true','false'], flag: '--static-quantized-quals', default: 'true' },
      ],
    },
    {
      id: 'markdup',
      label: 'MarkDuplicates (Picard)',
      desc: 'Mark or remove PCR duplicates before variant calling',
      fields: [
        { id: 'input', label: 'Input BAM', type: 'text', placeholder: '/data/sample_sorted.bam', flag: '-I' },
        { id: 'output', label: 'Output BAM', type: 'text', placeholder: '/out/sample_markdup.bam', flag: '-O' },
        { id: 'metrics', label: 'Metrics file', type: 'text', placeholder: '/out/markdup_metrics.txt', flag: '-M' },
        { id: 'remove', label: 'Remove duplicates', type: 'select', options: ['false','true'], flag: '--REMOVE_DUPLICATES', default: 'false' },
        { id: 'optical', label: 'Optical dup pixel dist', type: 'select', options: ['100','2500'], flag: '--OPTICAL_DUPLICATE_PIXEL_DISTANCE', default: '100' },
      ],
    },
    {
      id: 'genotypegvcfs',
      label: 'GenotypeGVCFs',
      desc: 'Joint genotyping of one or more GVCF samples',
      fields: [
        { id: 'input', label: 'Input GVCF / GenomicsDB', type: 'text', placeholder: '/out/cohort.db', flag: '-V' },
        { id: 'ref', label: 'Reference FASTA', type: 'text', placeholder: '/ref/GRCh38.fa', flag: '-R' },
        { id: 'output', label: 'Output VCF', type: 'text', placeholder: '/out/cohort.vcf.gz', flag: '-O' },
        { id: 'dbsnp', label: 'dbSNP VCF', type: 'text', placeholder: '/ref/dbsnp.vcf.gz', flag: '--dbsnp' },
        { id: 'stand', label: 'Min call confidence', type: 'select', options: ['10','20','30'], flag: '--standard-min-confidence-threshold-for-calling', default: '20' },
      ],
    },
    {
      id: 'vqsr_snp',
      label: 'VariantRecalibrator — SNPs',
      desc: 'VQSR model training for SNP filtering',
      fields: [
        { id: 'input', label: 'Input VCF', type: 'text', placeholder: '/out/cohort.vcf.gz', flag: '-V' },
        { id: 'ref', label: 'Reference FASTA', type: 'text', placeholder: '/ref/GRCh38.fa', flag: '-R' },
        { id: 'res_hapmap', label: 'HapMap VCF', type: 'text', placeholder: '/ref/hapmap.vcf.gz', flag: '--resource:hapmap,known=false,training=true,truth=true,prior=15.0' },
        { id: 'res_omni', label: 'Omni VCF', type: 'text', placeholder: '/ref/1000G_omni.vcf.gz', flag: '--resource:omni,known=false,training=true,truth=true,prior=12.0' },
        { id: 'res_1kg', label: '1000G VCF', type: 'text', placeholder: '/ref/1000G_phase1.snps.vcf.gz', flag: '--resource:1000G,known=false,training=true,truth=false,prior=10.0' },
        { id: 'output', label: 'Output recal file', type: 'text', placeholder: '/out/snp.recal', flag: '-O' },
        { id: 'tranches', label: 'Tranches file', type: 'text', placeholder: '/out/snp.tranches', flag: '--tranches-file' },
      ],
    },
  ];

  let _tool = TOOLS[0].id;

  function _currentTool() {
    return TOOLS.find(t => t.id === _tool) || TOOLS[0];
  }

  function _buildCommand() {
    const t = _currentTool();
    const isMarkDup = t.id === 'markdup';
    let cmd = isMarkDup
      ? 'gatk MarkDuplicates \\\n'
      : `gatk ${t.id.charAt(0).toUpperCase() + t.id.slice(1).replace('_snp','').replace('applybqsr','ApplyBQSR').replace('bqsr','BaseRecalibrator').replace('genotypegvcfs','GenotypeGVCFs').replace('vqsr_snp','VariantRecalibrator')} \\\n`;

    /* For tools with a more complex name mapping */
    const nameMap = {
      haplotypecaller: 'HaplotypeCaller',
      bqsr: 'BaseRecalibrator',
      applybqsr: 'ApplyBQSR',
      markdup: 'MarkDuplicates',
      genotypegvcfs: 'GenotypeGVCFs',
      vqsr_snp: 'VariantRecalibrator',
    };
    cmd = `gatk ${nameMap[t.id]} \\\n`;

    const lines = [];
    t.fields.forEach(f => {
      const el = document.getElementById(`gatk-f-${f.id}`);
      const val = el ? el.value.trim() : (f.default || '');
      if (!val) return;
      if (f.type === 'select' && val === f.default && f.id !== 'ploidy') {
        /* omit defaults to keep command clean */
      }
      if (f.flag.startsWith('--resource:')) {
        lines.push(`  ${f.flag} ${val}`);
      } else {
        lines.push(`  ${f.flag} ${val}`);
      }
    });

    /* Add mode flag for HaplotypeCaller */
    if (t.id === 'haplotypecaller') {
      const modeEl = document.getElementById('gatk-f-mode');
      if (modeEl && modeEl.value !== 'BP_RESOLUTION') {
        lines.push(`  -ERC ${modeEl.value}`);
      }
    }

    cmd += lines.join(' \\\n');
    return cmd;
  }

  function _renderFields() {
    const t = _currentTool();
    const out = document.getElementById('gatk-fields');
    if (!out) return;
    out.innerHTML = t.fields.map(f => `
      <div class="gatk-field">
        <label class="gatk-label" for="gatk-f-${f.id}">${f.label}</label>
        ${f.type === 'select'
          ? `<select class="gatk-input" id="gatk-f-${f.id}" onchange="OmicsLab.GATK._preview()">
               ${f.options.map(o => `<option${o===(f.default||f.options[0])?' selected':''}>${o}</option>`).join('')}
             </select>`
          : `<input class="gatk-input" id="gatk-f-${f.id}" type="text" placeholder="${f.placeholder||''}" oninput="OmicsLab.GATK._preview()">`
        }
        <span class="gatk-flag-hint">${f.flag}</span>
      </div>`).join('');
    _preview();
  }

  function _preview() {
    const out = document.getElementById('gatk-cmd-out');
    if (!out) return;
    out.textContent = _buildCommand();
  }

  function _copy() {
    const text = document.getElementById('gatk-cmd-out')?.textContent || '';
    navigator.clipboard?.writeText(text).then(() => {
      const btn = document.getElementById('gatk-copy-btn');
      if (btn) { btn.textContent = 'Copied!'; setTimeout(() => { btn.textContent = 'Copy'; }, 2000); }
    });
  }

  function selectTool(id) {
    _tool = id;
    document.querySelectorAll('.gatk-tool-btn').forEach(b => b.classList.toggle('gatk-tool-active', b.dataset.tool === id));
    const t = _currentTool();
    const desc = document.getElementById('gatk-tool-desc');
    if (desc) desc.textContent = t.desc;
    _renderFields();
  }

  function init() {
    const section = document.getElementById('gatk-section');
    if (!section || section.dataset.gatkReady) return;
    section.dataset.gatkReady = '1';

    section.innerHTML = `
      <div class="gatk-wrap">
        <div class="gatk-header">
          <div class="gatk-eyebrow">GATK4 Best Practices</div>
          <h2 class="gatk-title">GATK Command Builder</h2>
          <p class="gatk-sub">Build production-ready GATK4 variant calling commands. All flags follow GATK4 best practices for human genomics. Copy and paste directly into your pipeline.</p>
        </div>

        <div class="gatk-body">
          <div class="gatk-tools-row">
            ${TOOLS.map(t => `
              <button class="gatk-tool-btn${t.id===_tool?' gatk-tool-active':''}" data-tool="${t.id}"
                onclick="OmicsLab.GATK.selectTool('${t.id}')">
                ${t.label}
              </button>`).join('')}
          </div>
          <div id="gatk-tool-desc" class="gatk-tool-desc">${_currentTool().desc}</div>

          <div class="gatk-layout">
            <div class="gatk-left">
              <div class="gatk-fields-title">Parameters</div>
              <div id="gatk-fields" class="gatk-fields"></div>
            </div>
            <div class="gatk-right">
              <div class="gatk-cmd-header">
                <span class="gatk-cmd-title">Generated Command</span>
                <button class="gatk-copy-btn" id="gatk-copy-btn" onclick="OmicsLab.GATK._copy()">Copy</button>
              </div>
              <pre id="gatk-cmd-out" class="gatk-cmd-out"></pre>
              <div class="gatk-tip">
                <strong>Tip:</strong> Pipe this into a Snakemake rule or Nextflow process by replacing backslash continuations with the appropriate syntax for your workflow manager.
              </div>
            </div>
          </div>
        </div>
      </div>`;

    _renderFields();
  }

  return { init, selectTool, _preview, _copy };
})();
