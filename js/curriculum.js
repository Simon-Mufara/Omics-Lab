/* ═══════════════════════════════════════════════════════════════
   OmicsLab — Curriculum Learning Paths
   Structured tracks with progress tracking, prerequisites,
   next-lesson flow, and completion triggers for the badge system.
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.Curriculum = (function () {

  const STORE_KEY = 'omicslab_curriculum_v1';

  /* ─── Track definitions ─── */
  const TRACKS = {
    wetlab: {
      id: 'wetlab',
      icon: 'microscope',
      title: 'Wet-Lab Scientist',
      subtitle: 'From sample to sequencer',
      color: '#3fb950',
      audience: 'Lab technicians, biomedical scientists, sample handlers',
      outcome: 'Understand every bench step of an omics experiment and how to maximise data quality before sequencing.',
      badge: 'wetlab-certified',
      lessons: [
        { id: 'wl-01', title: 'Sample Collection & Integrity', duration: '15 min',
          icon: 'droplet', section: 'disease-explorer-section',
          summary: 'Learn biobanking standards, cold-chain requirements, and how poor sample integrity cascades into bad sequencing data.',
          keyPoints: ['DIN/RIN scores and what they mean', 'Cold-chain failures in field conditions', 'Africa-specific sample transport challenges'],
          action: 'disease-explorer-section' },
        { id: 'wl-02', title: 'DNA & RNA Extraction', duration: '20 min',
          icon: 'flask', section: 'domain-section',
          summary: 'Compare extraction kits, troubleshoot inhibitor contamination, and understand why extraction method affects downstream results.',
          keyPoints: ['Phenol-chloroform vs. column methods', 'Inhibitor removal for soil/blood', 'Yield vs. purity trade-offs'],
          action: 'domain-section' },
        { id: 'wl-03', title: 'Library Preparation', duration: '25 min',
          icon: 'layers', section: 'domain-section',
          summary: 'Walk through adapter ligation, PCR amplification, and size selection. Understand how each step can introduce bias.',
          keyPoints: ['Fragmentation methods', 'Adapter ligation efficiency', 'PCR duplicate rates and how to minimise them'],
          action: 'domain-section' },
        { id: 'wl-04', title: 'Sequencing Platforms', duration: '20 min',
          icon: 'zap', section: 'equipment-gallery-section',
          summary: 'Compare Illumina, Oxford Nanopore, and PacBio. Know when each platform is right for Africa-based research.',
          keyPoints: ['Short-read vs. long-read trade-offs', 'Nanopore field sequencing for outbreaks', 'Cost per base in African lab context'],
          action: 'equipment-gallery-section' },
        { id: 'wl-05', title: 'QC & Run Metrics', duration: '15 min',
          icon: 'bar-chart', section: 'bioinfo-pipeline-section',
          summary: 'Interpret FastQC reports, identify run failures early, and decide whether to re-sequence.',
          keyPoints: ['Q30 thresholds', 'Adapter content and GC bias', 'When to flag a run as failed'],
          action: 'bioinfo-pipeline-section' }
      ]
    },

    bioinformatics: {
      id: 'bioinformatics',
      icon: 'cpu',
      title: 'Bioinformatician',
      subtitle: 'From reads to results',
      color: '#58a6ff',
      audience: 'Bioinformatics students, computational researchers, data analysts',
      outcome: 'Run a complete omics analysis pipeline from raw FASTQ to interpreted variant calls using best-practice tools.',
      badge: 'bioinfo-certified',
      lessons: [
        { id: 'bi-01', title: 'Linux & HPC Fundamentals', duration: '20 min',
          icon: 'server', section: 'hpc-training-section',
          summary: 'Navigate a Linux cluster, write SLURM job scripts, and manage files on HPC storage systems.',
          keyPoints: ['Essential bash commands', 'SLURM sbatch / squeue / scancel', 'File transfer with rsync and scp'],
          action: 'hpc-training-section' },
        { id: 'bi-02', title: 'Quality Control', duration: '15 min',
          icon: 'check-circle', section: 'bioinfo-pipeline-section',
          summary: 'Run FastQC and MultiQC, interpret every report section, and decide on trimming parameters.',
          keyPoints: ['Per-base quality scores', 'Overrepresented sequences', 'When to trim vs. discard'],
          action: 'bioinfo-pipeline-section' },
        { id: 'bi-03', title: 'Alignment & Sorting', duration: '25 min',
          icon: 'dna', section: 'bioinfo-pipeline-section',
          summary: 'Align reads to a reference genome, sort and index BAM files, and interpret mapping statistics.',
          keyPoints: ['BWA-MEM2 vs. STAR for DNA vs. RNA', 'Mapping rate interpretation', 'SAMtools view, sort, index'],
          action: 'bioinfo-pipeline-section' },
        { id: 'bi-04', title: 'Variant Calling & Annotation', duration: '30 min',
          icon: 'microscope', section: 'bioinfo-pipeline-section',
          summary: 'Call SNPs and indels with GATK, filter variants, and annotate with VEP against African population databases.',
          keyPoints: ['GVCF workflow for cohorts', 'VQSR vs. hard filtering', 'gnomAD AFR frequency context'],
          action: 'bioinfo-pipeline-section' },
        { id: 'bi-05', title: 'Workflow Engines & Reproducibility', duration: '20 min',
          icon: 'rotate-cw', section: 'hpc-training-section',
          summary: 'Write a Snakemake or Nextflow workflow, containerise it with Singularity, and submit it to SLURM.',
          keyPoints: ['Snakemake rules and DAGs', 'Singularity on HPC', 'Sharing workflows via Repro Hub'],
          action: 'repro-hub-section' }
      ]
    },

    publichealth: {
      id: 'publichealth',
      icon: 'globe',
      title: 'Public Health Researcher',
      subtitle: 'From variants to impact',
      color: '#d2a8ff',
      audience: 'Epidemiologists, public health officers, policy researchers',
      outcome: 'Translate genomic findings into disease surveillance insights, policy recommendations, and fundable research proposals.',
      badge: 'pubhealth-certified',
      lessons: [
        { id: 'ph-01', title: 'Genomic Epidemiology Basics', duration: '20 min',
          icon: 'trending-up', section: 'disease-explorer-section',
          summary: 'Understand how pathogen genomics tracks outbreaks, drug resistance, and transmission chains across Africa.',
          keyPoints: ['Phylogenetic trees in plain language', 'Nextstrain & outbreak.info', 'COVID-19 and Mpox case studies from Africa'],
          action: 'disease-explorer-section' },
        { id: 'ph-02', title: 'Disease Surveillance Workflows', duration: '20 min',
          icon: 'virus', section: 'domain-section',
          summary: 'Follow a complete surveillance workflow from sample to sequencing report, as used by Africa CDC and WHO.',
          keyPoints: ['Sentinel site selection', 'SARS-CoV-2 sequencing for variants', 'Reporting chains to WHO GOARN'],
          action: 'domain-section' },
        { id: 'ph-03', title: 'Data Governance & Ethics', duration: '25 min',
          icon: 'scale', section: 'africa-hub-section',
          summary: 'Apply H3Africa data governance principles, understand data sovereignty, and navigate material transfer agreements.',
          keyPoints: ['H3Africa data access policy', 'AU data governance framework', 'Community engagement requirements'],
          action: 'africa-hub-section' },
        { id: 'ph-04', title: 'Communicating Genomic Findings', duration: '15 min',
          icon: 'globe', section: 'disease-learning-section',
          summary: 'Translate variant calls and surveillance data into actionable public health language for ministers and media.',
          keyPoints: ['Avoiding genomics jargon', 'Visualisations for non-scientists', 'Risk communication during outbreaks'],
          action: 'disease-learning-section' },
        { id: 'ph-05', title: 'Publishing, Depositing & Sharing Data', duration: '20 min',
          icon: 'database', section: 'repro-hub-section',
          summary: 'Deposit data in ENA/SRA, write a reproducible methods section, and calculate your FAIR score.',
          keyPoints: ['ENA submission walkthrough', 'Writing a reproducible methods section', 'FAIR score checklist'],
          action: 'repro-hub-section' }
      ]
    }
  };

  /* ─── Progress store ─── */
  function _loadProgress() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY) || '{}'); }
    catch { return {}; }
  }
  function _saveProgress(p) {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(p)); } catch {}
  }
  function _markComplete(lessonId) {
    const p = _loadProgress();
    p[lessonId] = { done: true, ts: new Date().toISOString() };
    _saveProgress(p);
    _checkTrackCompletion();
    _refresh();
  }
  function _isComplete(lessonId) { return !!_loadProgress()[lessonId]; }

  function _trackProgress(trackId) {
    const track = TRACKS[trackId];
    if (!track) return { done: 0, total: 0, pct: 0 };
    const done = track.lessons.filter(l => _isComplete(l.id)).length;
    return { done, total: track.lessons.length, pct: Math.round(done / track.lessons.length * 100) };
  }

  function _checkTrackCompletion() {
    Object.values(TRACKS).forEach(t => {
      const p = _trackProgress(t.id);
      if (p.pct === 100 && OmicsLab.Badges) OmicsLab.Badges.unlock(t.badge);
    });
  }

  /* ─── Render helpers ─── */
  function _renderTrackCard(track) {
    const prog = _trackProgress(track.id);
    return `
    <div class="curr-track-card" onclick="OmicsLab.Curriculum.openTrack('${track.id}')">
      <div class="curr-track-top" style="--track-color:${track.color}">
        <div class="curr-track-icon">${OmicsLab.Icons?.svg(track.icon, 28) || track.icon}</div>
        <div class="curr-track-badge-area" id="curr-badge-${track.id}">
          ${prog.pct === 100 ? '<span class="curr-complete-badge">[OK] Complete</span>' : ''}
        </div>
      </div>
      <div class="curr-track-body">
        <div class="curr-track-title">${track.title}</div>
        <div class="curr-track-subtitle">${track.subtitle}</div>
        <div class="curr-track-audience">${track.audience}</div>
        <div class="curr-progress-wrap">
          <div class="curr-progress-bar">
            <div class="curr-progress-fill" style="width:${prog.pct}%;background:${track.color}"></div>
          </div>
          <div class="curr-progress-label">${prog.done}/${prog.total} lessons · ${prog.pct}%</div>
        </div>
        <button class="curr-start-btn" style="background:${track.color}">
          ${prog.done === 0 ? 'Start Track' : prog.pct === 100 ? 'Review Track' : 'Continue →'}
        </button>
      </div>
    </div>`;
  }

  function _renderLessonList(trackId) {
    const track = TRACKS[trackId];
    if (!track) return '';
    const nextIdx = track.lessons.findIndex(l => !_isComplete(l.id));
    return track.lessons.map((l, i) => {
      const done = _isComplete(l.id);
      const isNext = i === nextIdx;
      return `
      <div class="curr-lesson-row ${done ? 'done' : isNext ? 'next' : 'locked'}">
        <div class="curr-lesson-num">${done ? '[OK]' : (i + 1)}</div>
        <div class="curr-lesson-info">
          <div class="curr-lesson-title">${OmicsLab.Icons?.svg(l.icon, 14) || ''} ${l.title}</div>
          <div class="curr-lesson-meta">${l.duration} · ${l.summary.substring(0, 90)}…</div>
          <div class="curr-key-points">
            ${l.keyPoints.map(p => `<span class="curr-kp">• ${p}</span>`).join('')}
          </div>
        </div>
        <div class="curr-lesson-actions">
          ${isNext || done ? `<button class="curr-go-btn" onclick="OmicsLab.Curriculum.goToLesson('${l.id}','${l.action}','${trackId}')">
            ${done ? 'Review' : 'Start'}
          </button>` : ''}
          ${!done ? `<button class="curr-mark-btn" onclick="OmicsLab.Curriculum.markDone('${l.id}','${trackId}')">Mark done</button>` : ''}
        </div>
      </div>`;
    }).join('');
  }

  function _renderDetailPanel(trackId) {
    const track = TRACKS[trackId];
    if (!track) return '';
    const prog = _trackProgress(trackId);
    return `
    <div class="curr-detail-panel" id="curr-detail-${trackId}">
      <div class="curr-detail-header" style="border-left-color:${track.color}">
        <div class="curr-detail-title">${OmicsLab.Icons?.svg(track.icon, 20) || ''} ${track.title}</div>
        <div class="curr-detail-sub">${track.subtitle}</div>
        <div class="curr-detail-outcome"><strong>Learning outcome:</strong> ${track.outcome}</div>
        <div class="curr-detail-progress">
          <div class="curr-progress-bar" style="max-width:300px">
            <div class="curr-progress-fill" style="width:${prog.pct}%;background:${track.color}"></div>
          </div>
          <span style="font-size:0.82rem;color:var(--text-muted)">${prog.done}/${prog.total} complete</span>
        </div>
      </div>
      <div class="curr-lesson-list" id="curr-lessons-${trackId}">${_renderLessonList(trackId)}</div>
    </div>`;
  }

  /* ─── Public API ─── */
  let _activeTrack = null;

  function openTrack(trackId) {
    _activeTrack = trackId;
    const panel = document.getElementById('curr-detail-area');
    if (!panel) return;
    panel.innerHTML = _renderDetailPanel(trackId);
    panel.scrollIntoView({ behavior: 'smooth', block: 'start' });

    document.querySelectorAll('.curr-track-card').forEach(c => {
      c.classList.toggle('active', c.getAttribute('onclick').includes(trackId));
    });
  }

  function markDone(lessonId, trackId) {
    _markComplete(lessonId);
    const list = document.getElementById('curr-lessons-' + trackId);
    if (list) list.innerHTML = _renderLessonList(trackId);
    const prog = _trackProgress(trackId);
    const track = TRACKS[trackId];
    const fill = document.querySelector(`#curr-detail-${trackId} .curr-progress-fill`);
    if (fill && track) fill.style.width = prog.pct + '%';
    if (prog.pct === 100) {
      const detail = document.getElementById(`curr-detail-${trackId}`);
      if (detail) detail.innerHTML = _renderDetailPanel(trackId);
    }
  }

  function goToLesson(lessonId, sectionId, trackId) {
    if (OmicsLab.App) OmicsLab.App.scrollTo(sectionId);
    setTimeout(() => _markComplete(lessonId), 800);
    const list = document.getElementById('curr-lessons-' + trackId);
    if (list) setTimeout(() => { list.innerHTML = _renderLessonList(trackId); }, 900);
  }

  function _refresh() {
    Object.keys(TRACKS).forEach(tid => {
      const badgeArea = document.getElementById('curr-badge-' + tid);
      const prog = _trackProgress(tid);
      if (badgeArea && prog.pct === 100) badgeArea.innerHTML = '<span class="curr-complete-badge">[OK] Complete</span>';
      const fill = document.querySelector(`.curr-track-card[onclick*="${tid}"] .curr-progress-fill`);
      if (fill) { fill.style.width = prog.pct + '%'; fill.style.background = TRACKS[tid].color; }
      const label = document.querySelector(`.curr-track-card[onclick*="${tid}"] .curr-progress-label`);
      if (label) label.textContent = `${prog.done}/${prog.total} lessons · ${prog.pct}%`;
    });
  }

  function resetProgress() {
    if (!confirm('Reset all curriculum progress?')) return;
    localStorage.removeItem(STORE_KEY);
    init();
  }

  function getCompletedCount() {
    return Object.keys(_loadProgress()).length;
  }

  function init() {
    const container = document.getElementById('curriculum-content');
    if (!container) return;

    const totalDone = Object.values(TRACKS).reduce((s, t) => s + _trackProgress(t.id).done, 0);
    const totalAll  = Object.values(TRACKS).reduce((s, t) => s + t.lessons.length, 0);
    const overallPct = Math.round(totalDone / totalAll * 100);

    container.innerHTML = `
      <div class="curr-overview-bar">
        <div class="curr-overview-stat">
          <div class="curr-stat-n">${totalDone}</div>
          <div class="curr-stat-l">Lessons complete</div>
        </div>
        <div class="curr-overview-stat">
          <div class="curr-stat-n">${totalAll - totalDone}</div>
          <div class="curr-stat-l">Remaining</div>
        </div>
        <div class="curr-overview-stat">
          <div class="curr-stat-n">${overallPct}%</div>
          <div class="curr-stat-l">Overall progress</div>
        </div>
        <button class="curr-reset-btn" onclick="OmicsLab.Curriculum.resetProgress()">Reset progress</button>
      </div>

      <div class="curr-track-grid">
        ${Object.values(TRACKS).map(_renderTrackCard).join('')}
      </div>

      <div id="curr-detail-area" class="curr-detail-area"></div>
    `;
  }

  return { init, openTrack, markDone, goToLesson, resetProgress, getCompletedCount, TRACKS };
})();
