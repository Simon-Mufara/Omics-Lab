/* ═══════════════════════════════════════════════════════════════
   OmicsLab — Troubleshooting Decision Tree
   Interactive yes/no tree for QC metric failures
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.Troubleshoot = (function() {

  /* Decision trees keyed by failing metric */
  const TREES = {
    lowRIN: {
      title: 'Low RIN / RNA Degradation',
      root: {
        q: 'Was the sample stored at −80°C before extraction?',
        yes: {
          q: 'Was the sample thawed and re-frozen multiple times?',
          yes: { leaf: true, verdict:'Freeze-thaw degradation', fix:'Use a single-use aliquot policy. RIN drops ~1 point per freeze-thaw cycle. Consider extracting RNA from fresh tissue collected into RNAlater immediately post-harvest.' },
          no:  {
            q: 'Was extraction performed on ice with RNase-free reagents?',
            yes: { leaf:true, verdict:'Possible intrinsic RNA instability', fix:'Some tissues (e.g., pancreas, intestine) are naturally RNase-rich. Use RNeasy Plus with gDNA Eliminator, or TRIzol + column. Homogenise immediately in lysis buffer without pre-rinsing.' },
            no:  { leaf:true, verdict:'Room-temperature RNA degradation', fix:'Always work on ice. RNases are active at room temperature within minutes. Pre-cool all tubes, homogenisers, and rotors. Add beta-mercaptoethanol (1%) or DTT to lysis buffer.' }
          }
        },
        no: {
          q: 'Was the sample kept at −20°C or fridge temperature?',
          yes: { leaf:true, verdict:'Inadequate storage temperature', fix:'RNA requires −80°C for long-term stability. At −20°C, RNA degrades significantly within weeks. At 4°C, within hours. Switch to −80°C storage immediately. RNAlater preserves RNA at room temp for shipping.' },
          no:  { leaf:true, verdict:'Ambient temperature exposure', fix:'Sample was likely at room temperature too long post-collection. Snap-freeze in liquid nitrogen within 30 min of collection. Use PAXgene tubes for blood RNA to stabilise immediately upon collection.' }
        }
      }
    },
    lowQ30: {
      title: 'Low Q30 Score (<75%)',
      root: {
        q: 'Did Q30 decline toward the end of the reads (cycles 100–150)?',
        yes: {
          q: 'Was the cluster density within the optimal range (170–220 K/mm²)?',
          yes: { leaf:true, verdict:'Normal Illumina run-end quality decay', fix:'Illumina reads have natural Q30 decay at 3′ ends. Use quality trimming (Trimmomatic SLIDINGWINDOW:4:15). For critical analyses, use 2×100 instead of 2×150 to minimise tail-end noise.' },
          no:  { leaf:true, verdict:'Over- or under-clustering', fix:'High cluster density causes overlapping clusters reducing signal; low density wastes flow cell area. Optimise library loading concentration. Re-quantify with Qubit (not NanoDrop) and use qPCR library quantification before loading.' }
        },
        no:  {
          q: 'Was there unusually high error rate across the entire run?',
          yes: {
            q: 'Was the flow cell new and within its use-by date?',
            yes: { leaf:true, verdict:'Reagent kit or chemistry issue', fix:'Check reagent cartridge storage (2–8°C for unused, room temp only during run). Verify no air bubbles in flow cell. Contact Illumina technical support with the run metrics XML file.' },
            no:  { leaf:true, verdict:'Expired or degraded flow cell', fix:'Flow cells degrade quickly at room temperature. Check storage conditions and use-by date. Illumina flow cells must be stored at 4°C and used within 6 months of manufacture.' }
          },
          no:  { leaf:true, verdict:'Specific run segment degradation', fix:'Check if the decline is across all lanes or a specific lane. Uneven phasing or pre-phasing suggests incomplete extension — reduce library loading concentration or increase wash steps. Examine per-lane Q30 in Illumina Sequencing Analysis Viewer (SAV).' }
        }
      }
    },
    highDuplication: {
      title: 'High Duplication Rate (>20%)',
      root: {
        q: 'Was the input DNA/RNA amount very low (<50 ng)?',
        yes: {
          q: 'Were >10 PCR cycles used for library amplification?',
          yes: { leaf:true, verdict:'Over-amplification of low-input library', fix:'For low-input samples, use 4–6 PCR cycles maximum. Consider PCR-free protocol if ≥500 ng is available. Use KAPA HiFi or Phusion — they have lower amplification bias than Taq.' },
          no:  { leaf:true, verdict:'Low complexity library from limited input', fix:'Some duplication is inevitable with very low-input libraries. Consider Unique Molecular Identifiers (UMIs) to distinguish PCR duplicates from true duplicates. Target ≥100 ng input when possible.' }
        },
        no:  {
          q: 'Is the sample from a highly repetitive genomic region or clonal cell line?',
          yes: { leaf:true, verdict:'Biological duplication from clonal or repetitive source', fix:'Clonal cell lines or samples enriched for specific cell types will show high technical duplication. Use PCR-free libraries. Filter blacklisted genomic regions (ENCODE blacklist) after alignment.' },
          no:  {
            q: 'Was the library size (insert) very small (<150 bp)?',
            yes: { leaf:true, verdict:'Over-sheared library — all fragments same size', fix:'Fragmentation was too aggressive. Optimise Covaris S220 duty cycle and peak incidence power for your sample type. Target 350–500 bp insert for WGS, 300–400 bp for RNA-seq.' },
            no:  { leaf:true, verdict:'PCR bias from GC-extreme templates', fix:'High duplication at GC-extreme regions is normal even with 5 PCR cycles. Use PCR-free prep if input allows. For amplicon panels, use UMIs. Increase size selection stringency to remove <200 bp fragments.' }
          }
        }
      }
    },
    lowAlignment: {
      title: 'Low Alignment Rate (<75%)',
      root: {
        q: 'Is the alignment rate <10% (near total failure)?',
        yes: {
          q: 'Was the correct reference genome species used?',
          yes: { leaf:true, verdict:'Reference genome version mismatch', fix:'Confirm you used the correct genome build (GRCh38 vs GRCh37, or hg38 vs hg19 for human). Also verify chromosome naming convention: chr1 vs 1. Re-align after confirming reference file.' },
          no:  { leaf:true, verdict:'Wrong species reference genome', fix:'Always verify the sample organism before alignment. If working with non-model organisms, use a de novo assembled genome as reference, or the closest available reference with relaxed BWA-MEM parameters (-k 15).' }
        },
        no:  {
          q: 'Are most unmapped reads very short (<50 bp after trimming)?',
          yes: { leaf:true, verdict:'Over-trimming removed mappable sequence', fix:'Adapter trimming was too aggressive — reducing reads below the aligner\'s minimum seed length (19 bp for BWA-MEM). Use SLIDINGWINDOW:4:20 rather than MINLEN:20. Check FastQC per-base quality for trimming evidence.' },
          no:  {
            q: 'Is this an RNA-seq experiment aligned with a DNA aligner (e.g., BWA)?',
            yes: { leaf:true, verdict:'Wrong aligner for RNA-seq', fix:'RNA-seq reads span splice junctions that DNA aligners cannot handle. Use STAR or HISAT2 with your species GTF annotation. A DNA aligner will fail to map >50% of reads that cross exon-exon boundaries.' },
            no:  { leaf:true, verdict:'Contamination or wrong sample', fix:'High contamination from another organism will reduce alignment. Run FastQ Screen to identify the contaminating species. Check lab records for possible sample mix-up. Assess PhiX spike-in alignment rate as internal control.' }
          }
        }
      }
    },
    highContamination: {
      title: 'High Contamination Rate (>10%)',
      root: {
        q: 'Is contamination from another sequencing sample (index bleed-through)?',
        yes: {
          q: 'Were unique dual indexes (UDI) used?',
          yes: { leaf:true, verdict:'True contamination — not index hopping', fix:'Index hopping is <0.1% with UDI. If contamination is high with UDI, the samples were physically mixed in the lab. Check pipetting records, tip changes between samples, and seal integrity on plates.' },
          no:  { leaf:true, verdict:'Index hopping on patterned flow cell', fix:'Single-index or non-UDI libraries on NovaSeq/NextSeq2000 patterned flow cells suffer 0.5–1% index hopping per sample. Always use Unique Dual Indexes for multiplexed runs on patterned flow cells.' }
        },
        no:  {
          q: 'Does FastQC show overrepresented sequences matching rRNA or mycoplasma?',
          yes: {
            q: 'Is the contamination from rRNA (16S/18S/28S)?',
            yes: { leaf:true, verdict:'rRNA contamination in RNA-seq library', fix:'Insufficient rRNA depletion or mRNA selection failure. Check bead hybridisation temperature for polyA selection. For total RNA, use RiboZero rRNA depletion kit. Verify sample was not degraded before rRNA depletion.' },
            no:  { leaf:true, verdict:'Mycoplasma contamination', fix:'Mycoplasma is a common cell culture contaminant that does not affect cell morphology but contaminates DNA/RNA. Test cell lines with MycoAlert kit. Treat with Plasmocin or BM-Cyclin. Discard contaminated stocks.' }
          },
          no:  { leaf:true, verdict:'Environmental or cross-sample contamination', fix:'Follow strict lab contamination prevention: PCR-free clean room, dedicated pre- and post-PCR areas, UV decontamination between runs. Check negative extraction controls for reads. Consider air filtration in sequencing room.' }
        }
      }
    },
    lowLibraryComplexity: {
      title: 'Low Library Complexity (<60%)',
      root: {
        q: 'Was the starting material amount very low (<10 ng)?',
        yes: { leaf:true, verdict:'Insufficient input material — library saturated early', fix:'Low input means few unique molecules to capture. Increase input DNA/RNA if possible. For FFPE samples, use specialised low-input kits (e.g., Accel-NGS 2S Plus). Consider UMIs to distinguish true complexity from duplicates.' },
        no:  {
          q: 'Were too many PCR cycles used during library amplification?',
          yes: { leaf:true, verdict:'Over-amplification collapsed diversity', fix:'Each extra PCR cycle roughly halves effective complexity. Use qPCR library quantification (KAPA Library Quantification Kit) to calculate the minimum cycles needed. For ≥500 ng input, use PCR-free protocol.' },
          no:  {
            q: 'Does the sample represent a highly clonal population (e.g., tumour cell line)?',
            yes: { leaf:true, verdict:'Biologically low complexity — clonal sample', fix:'Clonal cell lines or highly selected tumour populations have limited sequence diversity. This is a biological property, not a technical failure. Report duplication rate but note the sample type in methods.' },
            no:  { leaf:true, verdict:'Size selection removed large fragments', fix:'Overly stringent SPRI/bead size selection may have removed most fragments. Check D1000 ScreenTape for library size distribution. Target 350–500 bp insert peak with tight distribution, not <200 bp.' }
          }
        }
      }
    }
  };

  let _history = [];
  let _currentTree = null;
  let _currentNode = null;

  function open(metric) {
    const overlay = document.getElementById('troubleshoot-modal-overlay');
    if (!overlay) return;
    overlay.classList.add('active');

    _history = [];
    _currentTree = TREES[metric] || TREES.lowRIN;
    _currentNode = _currentTree.root;
    _render();
  }

  function close() {
    const overlay = document.getElementById('troubleshoot-modal-overlay');
    if (overlay) overlay.classList.remove('active');
  }

  function answer(yes) {
    if (!_currentNode) return;
    _history.push(_currentNode);
    _currentNode = yes ? _currentNode.yes : _currentNode.no;
    _render();
  }

  function back() {
    if (!_history.length) return;
    _currentNode = _history.pop();
    _render();
  }

  function _render() {
    const box = document.getElementById('troubleshoot-modal-body');
    if (!box || !_currentTree) return;
    const node = _currentNode;

    if (node.leaf) {
      box.innerHTML = `
        <div class="ts-verdict">
          <div class="ts-verdict-label">Likely Cause</div>
          <div class="ts-verdict-title">${node.verdict}</div>
          <div class="ts-fix-label">Recommended Fix</div>
          <p class="ts-fix-text">${node.fix}</p>
          <div class="ts-actions">
            ${_history.length ? `<button class="ts-btn ts-btn-back" onclick="OmicsLab.Troubleshoot.back()">← Back</button>` : ''}
            <button class="ts-btn ts-btn-restart" onclick="OmicsLab.Troubleshoot.open('${_currentTree ? Object.keys(TREES).find(k=>TREES[k]===_currentTree)||'lowRIN' : 'lowRIN'}')">Start Over</button>
          </div>
        </div>`;
    } else {
      const depth = _history.length;
      box.innerHTML = `
        <div class="ts-question-wrap">
          <div class="ts-depth">Step ${depth+1}</div>
          <div class="ts-question">${node.q}</div>
          <div class="ts-yn-btns">
            <button class="ts-btn ts-btn-yes" onclick="OmicsLab.Troubleshoot.answer(true)">Yes</button>
            <button class="ts-btn ts-btn-no"  onclick="OmicsLab.Troubleshoot.answer(false)">No</button>
          </div>
          ${depth ? `<button class="ts-btn ts-btn-back" onclick="OmicsLab.Troubleshoot.back()">← Back</button>` : ''}
        </div>`;
    }
  }

  /* Build a metric picker for the results screen */
  function buildTrigger(failingMetrics) {
    if (!failingMetrics || !failingMetrics.length) return '';
    const METRIC_TREE_MAP = {
      'Sample Integrity': 'lowRIN',
      'Q30 Score': 'lowQ30',
      'Duplication Rate': 'highDuplication',
      'Alignment Rate': 'lowAlignment',
      'Contamination': 'highContamination',
      'Library Complexity': 'lowLibraryComplexity'
    };
    const btns = failingMetrics.map(m => {
      const treeKey = METRIC_TREE_MAP[m] || 'lowRIN';
      return `<button class="ts-trigger-btn" onclick="OmicsLab.Troubleshoot.open('${treeKey}')">
        Diagnose: ${m}
      </button>`;
    }).join('');
    return `
      <div class="results-card ts-trigger-card">
        <div class="results-card-title">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          Troubleshooting Assistant
        </div>
        <p style="color:var(--text-muted);font-size:0.82rem;margin-bottom:1rem">
          Some QC metrics failed. Use the decision tree to diagnose the root cause.
        </p>
        <div class="ts-trigger-btns">${btns}</div>
      </div>`;
  }

  return { open, close, answer, back, buildTrigger };
})();
