/* ═══════════════════════════════════════════════════════════════
   OmicsLab — Adaptive Skill Tree & XP Engine (Prompt 41)
   ─ Persistent skill tree with XP, prerequisites, unlocks
   ─ SVG canvas rendered on Profile page
   ─ XP awarded from simulations, quizzes, protocols
   ─ 5% XP decay per 14-day inactivity window
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.SkillTree = (function () {

  const XP_KEY      = 'omicslab_xp_v1';
  const UNLOCK_KEY  = 'omicslab_skills_v1';
  const LAST_KEY    = 'omicslab_last_active';

  /* ─── Skill definitions ─── */
  const SKILLS = [
    /* ── Tier 0: Foundation ── */
    { id:'lab-basics',      label:'Lab Basics',          tier:0, x:300, y:60,  xpCost:0,   prereqs:[],                          icon:'flask',       color:'#3fb950', desc:'Core wet-lab safety, equipment, and contamination control.' },
    { id:'seq-concepts',    label:'Seq Concepts',         tier:0, x:560, y:60,  xpCost:0,   prereqs:[],                          icon:'dna',         color:'#58a6ff', desc:'Illumina, Nanopore, and PacBio sequencing principles.' },
    { id:'bioinf-intro',    label:'Bioinf Intro',         tier:0, x:820, y:60,  xpCost:0,   prereqs:[],                          icon:'cpu',         color:'#bc8cff', desc:'Linux, conda, and bioinformatics environment basics.' },

    /* ── Tier 1: Core Tools ── */
    { id:'dna-extraction',  label:'DNA Extraction',       tier:1, x:180, y:180, xpCost:30,  prereqs:['lab-basics'],              icon:'droplet',     color:'#3fb950', desc:'Buffer chemistry, yield, and purity metrics for DNA.' },
    { id:'library-prep',    label:'Library Prep',         tier:1, x:360, y:180, xpCost:40,  prereqs:['lab-basics'],              icon:'scissors',    color:'#3fb950', desc:'End-repair, A-tailing, adapter ligation, size selection.' },
    { id:'fastq-qc',        label:'FASTQ QC',             tier:1, x:540, y:180, xpCost:35,  prereqs:['seq-concepts'],            icon:'check-circle',color:'#58a6ff', desc:'FastQC, MultiQC, Phred scores, adapter trimming.' },
    { id:'alignment',       label:'Read Alignment',       tier:1, x:720, y:180, xpCost:40,  prereqs:['seq-concepts'],            icon:'git-branch',  color:'#58a6ff', desc:'BWA-MEM2, samtools, flagstat, MAPQ scores.' },
    { id:'cli-basics',      label:'CLI Basics',           tier:1, x:900, y:180, xpCost:25,  prereqs:['bioinf-intro'],            icon:'cpu',         color:'#bc8cff', desc:'Bash, pipes, sed, awk, grep for bioinformatics.' },

    /* ── Tier 2: Analysis ── */
    { id:'variant-calling', label:'Variant Calling',      tier:2, x:270, y:300, xpCost:60,  prereqs:['library-prep','alignment'],icon:'dna',         color:'#3fb950', desc:'GATK HaplotypeCaller, joint genotyping, GVCF workflow.' },
    { id:'qc-gatk',         label:'QC & Filtering',       tier:2, x:450, y:300, xpCost:50,  prereqs:['fastq-qc','alignment'],    icon:'check-circle',color:'#58a6ff', desc:'VQSR, hard filtering, H3Africa QC thresholds.' },
    { id:'rnaseq',          label:'RNA-seq Analysis',      tier:2, x:630, y:300, xpCost:55,  prereqs:['fastq-qc','alignment'],    icon:'activity',    color:'#58a6ff', desc:'STAR alignment, featureCounts, DESeq2 DE testing.' },
    { id:'scripting',       label:'Python/R Scripting',   tier:2, x:810, y:300, xpCost:50,  prereqs:['cli-basics'],              icon:'code',        color:'#bc8cff', desc:'Biopython, pandas, ggplot2, Bioconductor basics.' },
    { id:'nanopore',        label:'Nanopore QC',          tier:2, x:990, y:300, xpCost:45,  prereqs:['cli-basics','fastq-qc'],   icon:'zap',         color:'#bc8cff', desc:'NanoStat, Filtlong, medaka variant calling.' },

    /* ── Tier 3: Specialisations ── */
    { id:'acmg-interp',     label:'ACMG Interpretation',  tier:3, x:180, y:420, xpCost:80,  prereqs:['variant-calling'],         icon:'shield',      color:'#3fb950', desc:'ACMG/AMP 2015 criteria, ClinVar, African AF context.' },
    { id:'pop-genomics',    label:'Population Genomics',  tier:3, x:360, y:420, xpCost:75,  prereqs:['variant-calling','qc-gatk'],icon:'globe',      color:'#3fb950', desc:'PCA, ADMIXTURE, FST, African population structure.' },
    { id:'phylogenomics',   label:'Phylogenomics',         tier:3, x:540, y:420, xpCost:80,  prereqs:['qc-gatk','rnaseq'],        icon:'git-branch',  color:'#58a6ff', desc:'IQ-TREE2, NJ, UPGMA, bootstrap, outbreak reconstruction.' },
    { id:'metagenomics',    label:'Metagenomics',          tier:3, x:720, y:420, xpCost:70,  prereqs:['rnaseq','scripting'],      icon:'virus',       color:'#58a6ff', desc:'Kraken2, Bracken, HUMAnN3, diversity metrics.' },
    { id:'long-read',       label:'Long-read Assembly',    tier:3, x:900, y:420, xpCost:65,  prereqs:['nanopore','scripting'],    icon:'layers',      color:'#bc8cff', desc:'Flye, Medaka, Bandage — complete genome assembly.' },
    { id:'amr-profiling',   label:'AMR Profiling',         tier:3, x:1080,y:420, xpCost:60,  prereqs:['nanopore','metagenomics'], icon:'shield',      color:'#bc8cff', desc:'AMRFinder, CARD, ResFinder — resistance gene detection.' },

    /* ── Tier 4: Advanced ── */
    { id:'clinical-genomics',label:'Clinical Genomics',   tier:4, x:270, y:540, xpCost:120, prereqs:['acmg-interp','pop-genomics'],icon:'heart-pulse',color:'#e3b341', desc:'Clinical variant reporting, LIMS integration, ethics.' },
    { id:'gwas',            label:'GWAS Analysis',         tier:4, x:450, y:540, xpCost:110, prereqs:['pop-genomics','phylogenomics'],icon:'bar-chart',color:'#e3b341', desc:'PLINK2, SAIGE, meta-GWAS, African GWAS reporting.' },
    { id:'outbreak-genomics',label:'Outbreak Genomics',   tier:4, x:630, y:540, xpCost:100, prereqs:['phylogenomics','metagenomics'],icon:'alert-triangle',color:'#f97316', desc:'SARS-CoV-2 / Mpox genomic epi, Nextstrain, Auspice.' },
    { id:'one-health',      label:'One Health Science',    tier:4, x:810, y:540, xpCost:95,  prereqs:['metagenomics','amr-profiling'],icon:'globe',   color:'#f97316', desc:'Zoonotic surveillance, environmental genomics.' },
    { id:'pipeline-eng',    label:'Pipeline Engineering',  tier:4, x:990, y:540, xpCost:90,  prereqs:['scripting','long-read'],   icon:'git-branch',  color:'#bc8cff', desc:'Nextflow DSL2, Snakemake, nf-core, CI/CD.' },

    /* ── Tier 5: Master ── */
    { id:'variant-analyst', label:'Variant Analyst',       tier:5, x:360, y:660, xpCost:200, prereqs:['clinical-genomics','gwas'],icon:'dna',        color:'#e3b341', desc:'Expert-level clinical and population variant interpretation.' },
    { id:'genomic-epi',     label:'Genomic Epidemiologist',tier:5, x:630, y:660, xpCost:200, prereqs:['gwas','outbreak-genomics','one-health'],icon:'map-pin',color:'#f97316', desc:'Lead genomic outbreak investigations and surveillance.' },
    { id:'pipeline-master', label:'Pipeline Architect',    tier:5, x:900, y:660, xpCost:200, prereqs:['pipeline-eng','one-health'],icon:'layers',    color:'#bc8cff', desc:'Design and deploy production-grade omics pipelines for Africa.' },
  ];

  /* ─── XP award table (event → XP) ─── */
  const XP_AWARDS = {
    'lab_step_complete':    10,
    'quiz_correct':          5,
    'quiz_battle_win':      25,
    'protocol_completed':   30,
    'variant_interpreted':  20,
    'phylo_tree_built':     25,
    'certificate_earned':  100,
    'outbreak_solved':      40,
    'primer_designed':      15,
    'analysis_run':         10,
    'labnotebook_entry':    10,
    'grant_generated':      30,
    'pipeline_built':       20,
    'mentor_session':       15,
    'peer_review':          20,
  };

  /* ─── Levels ─── */
  const LEVELS = [
    { xp:0,    title:'Aspiring Scientist',    icon:'target' },
    { xp:50,   title:'Lab Technician',         icon:'flask' },
    { xp:150,  title:'Junior Bioinformatician',icon:'cpu' },
    { xp:300,  title:'Sequence Analyst',        icon:'dna' },
    { xp:500,  title:'Variant Scientist',       icon:'activity' },
    { xp:750,  title:'Omics Researcher',        icon:'bar-chart' },
    { xp:1100, title:'Population Geneticist',   icon:'globe' },
    { xp:1500, title:'Genomic Epidemiologist',  icon:'alert-triangle' },
    { xp:2000, title:'Clinical Genomicist',     icon:'heart-pulse' },
    { xp:2800, title:'Pipeline Architect',      icon:'layers' },
    { xp:4000, title:'Africa Genomics Champion',icon:'award' },
  ];

  /* ─── State ─── */
  let _state = null;

  function _load() {
    if (_state) return _state;
    const raw = localStorage.getItem(XP_KEY);
    _state = raw ? JSON.parse(raw) : { xp: 0, events: [], lastDecay: Date.now() };
    _applyDecay();
    return _state;
  }

  function _save() { localStorage.setItem(XP_KEY, JSON.stringify(_state)); }

  function _unlockedIds() {
    const raw = localStorage.getItem(UNLOCK_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  }

  function _saveUnlocks(set) { localStorage.setItem(UNLOCK_KEY, JSON.stringify([...set])); }

  /* ─── Decay: 5% per 14-day gap ─── */
  function _applyDecay() {
    const now = Date.now();
    const lastActive = parseInt(localStorage.getItem(LAST_KEY) || String(now));
    const gaps = Math.floor((now - lastActive) / (14 * 24 * 3600 * 1000));
    if (gaps > 0 && _state.xp > 0) {
      const before = _state.xp;
      _state.xp = Math.floor(_state.xp * Math.pow(0.95, gaps));
      if (_state.xp < before) {
        _state.events.push({ type: 'decay', delta: _state.xp - before, ts: now });
      }
    }
    localStorage.setItem(LAST_KEY, String(now));
  }

  /* ─── Award XP ─── */
  function awardXP(eventType, multiplier = 1) {
    const base = XP_AWARDS[eventType] || 0;
    if (!base) return;
    _load();
    const delta = Math.round(base * multiplier);
    _state.xp += delta;
    _state.events.push({ type: eventType, delta, ts: Date.now() });
    _save();
    _checkUnlocks();
    _showXPToast(delta, eventType);
    _updateNavXP();
    return delta;
  }

  /* ─── Auto-unlock skills when XP threshold met ─── */
  function _checkUnlocks() {
    const unlocked = _unlockedIds();
    let changed = false;
    SKILLS.forEach(sk => {
      if (unlocked.has(sk.id)) return;
      const prereqsMet = sk.prereqs.every(p => unlocked.has(p));
      const xpMet = _state.xp >= sk.xpCost;
      if (prereqsMet && xpMet && sk.tier === 0) { unlocked.add(sk.id); changed = true; }
    });
    if (changed) _saveUnlocks(unlocked);
  }

  /* ─── Get current level ─── */
  function getLevel() {
    _load();
    let lv = 0;
    for (let i = LEVELS.length - 1; i >= 0; i--) {
      if (_state.xp >= LEVELS[i].xp) { lv = i; break; }
    }
    return { index: lv, ...LEVELS[lv], xp: _state.xp, nextXp: LEVELS[lv + 1]?.xp || null };
  }

  /* ─── XP toast ─── */
  function _showXPToast(delta, type) {
    if (!document.body) return;
    const t = document.createElement('div');
    t.className = 'st-xp-toast';
    t.innerHTML = `<span class="st-xp-plus">+${delta} XP</span><span class="st-xp-label">${type.replace(/_/g,' ')}</span>`;
    document.body.appendChild(t);
    requestAnimationFrame(() => t.classList.add('st-xp-toast--in'));
    setTimeout(() => { t.classList.remove('st-xp-toast--in'); setTimeout(() => t.remove(), 400); }, 2000);
  }

  /* ─── Nav XP bar ─── */
  function _updateNavXP() {
    const bar = document.getElementById('st-nav-bar');
    if (!bar) return;
    const lv = getLevel();
    const pct = lv.nextXp ? Math.round((lv.xp - LEVELS[lv.index].xp) / (lv.nextXp - LEVELS[lv.index].xp) * 100) : 100;
    bar.querySelector('.st-nav-fill').style.width = pct + '%';
    bar.querySelector('.st-nav-label').textContent = lv.title;
    bar.querySelector('.st-nav-xp').textContent = lv.xp + ' XP';
  }

  /* ─── Render nav XP bar — only shown after first XP earned ─── */
  function initNavBar() {
    const nav = document.getElementById('main-nav');
    if (!nav) return;
    const lv = getLevel();
    /* Don't show the bar until the user has earned at least 1 XP */
    if (lv.xp < 1) return;
    if (document.getElementById('st-nav-bar')) { _updateNavXP(); return; }
    const pct = lv.nextXp ? Math.round((lv.xp - LEVELS[lv.index].xp) / (lv.nextXp - LEVELS[lv.index].xp) * 100) : 100;
    const bar = document.createElement('div');
    bar.id = 'st-nav-bar';
    bar.className = 'st-nav-bar';
    bar.innerHTML = `
      <span class="st-nav-label">${lv.title}</span>
      <div class="st-nav-track" title="${lv.xp} XP"><div class="st-nav-fill" style="width:${pct}%"></div></div>
      <span class="st-nav-xp">${lv.xp} XP</span>
    `;
    nav.appendChild(bar);
  }

  /* ─── Render full skill tree on Profile page ─── */
  function render(container) {
    _load();
    const unlocked = _unlockedIds();
    const lv = getLevel();
    const W = 1200, H = 780;
    const pct = lv.nextXp ? Math.round((lv.xp - LEVELS[lv.index].xp) / (lv.nextXp - LEVELS[lv.index].xp) * 100) : 100;

    container.innerHTML = `
      <div class="st-wrap">
        <div class="st-header">
          <div class="st-level-block">
            <div class="st-level-icon">${OmicsLab.Icons?.svg(lv.icon, 24) || ''}</div>
            <div>
              <div class="st-level-title">${lv.title}</div>
              <div class="st-level-xp">${lv.xp} XP${lv.nextXp ? ` · ${lv.nextXp - lv.xp} to next level` : ' · Max Level'}</div>
            </div>
          </div>
          <div class="st-progress-wrap">
            <div class="st-progress-track">
              <div class="st-progress-fill" style="width:${pct}%"></div>
            </div>
            <div class="st-progress-labels">
              <span>Level ${lv.index + 1}</span>
              <span>${pct}%</span>
              <span>Level ${Math.min(lv.index + 2, LEVELS.length)}</span>
            </div>
          </div>
          <button class="btn btn-ghost btn-sm" onclick="OmicsLab.SkillTree.unlockSkill(null)" style="font-size:.72rem">
            ${OmicsLab.Icons?.svg('lock-open', 12) || ''} Unlock with XP
          </button>
        </div>

        <div class="st-canvas-wrap" tabindex="0" aria-label="Skill tree — use arrow keys to navigate">
          <svg class="st-svg" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg"
               role="img" aria-label="OmicsLab Skill Tree">
            <defs>
              <filter id="st-glow"><feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur"/>
                <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
              <marker id="st-arrow" viewBox="0 0 10 10" refX="9" refY="5"
                markerWidth="5" markerHeight="5" orient="auto">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#30363d"/>
              </marker>
            </defs>

            <!-- Edges -->
            ${SKILLS.flatMap(sk => sk.prereqs.map(pid => {
              const par = SKILLS.find(s => s.id === pid);
              if (!par) return '';
              const active = unlocked.has(sk.id);
              return `<line x1="${par.x}" y1="${par.y + 28}" x2="${sk.x}" y2="${sk.y - 28}"
                stroke="${active ? sk.color : '#30363d'}" stroke-width="${active ? 1.5 : 1}"
                stroke-dasharray="${active ? 'none' : '4 3'}" opacity="${active ? 0.7 : 0.4}"
                marker-end="url(#st-arrow)"/>`;
            })).join('')}

            <!-- Nodes -->
            ${SKILLS.map(sk => {
              const is_unlocked = unlocked.has(sk.id);
              const canUnlock = !is_unlocked && sk.prereqs.every(p => unlocked.has(p)) && _state.xp >= sk.xpCost;
              const state = is_unlocked ? 'unlocked' : canUnlock ? 'available' : 'locked';
              const alpha = is_unlocked ? 1 : canUnlock ? 0.75 : 0.35;
              return `<g class="st-node st-node--${state}" data-id="${sk.id}"
                onclick="OmicsLab.SkillTree.unlockSkill('${sk.id}')"
                role="button" tabindex="0" aria-label="${sk.label} — ${state}"
                style="cursor:${canUnlock ? 'pointer' : is_unlocked ? 'default' : 'not-allowed'}">
                <circle cx="${sk.x}" cy="${sk.y}" r="28" fill="${sk.color}"
                  fill-opacity="${is_unlocked ? 0.18 : 0.08}"
                  stroke="${sk.color}" stroke-width="${is_unlocked ? 2 : 1}"
                  stroke-opacity="${alpha}"
                  ${is_unlocked ? 'filter="url(#st-glow)"' : ''}/>
                <g transform="translate(${sk.x - 10},${sk.y - 18})" opacity="${alpha}">
                  ${_nodeIcon(sk.icon)}
                </g>
                <text x="${sk.x}" y="${sk.y + 44}" text-anchor="middle"
                  fill="${sk.color}" fill-opacity="${alpha}"
                  font-size="9.5" font-family="Inter,sans-serif" font-weight="${is_unlocked ? '600' : '400'}">
                  ${sk.label}
                </text>
                ${canUnlock ? `<circle cx="${sk.x + 20}" cy="${sk.y - 20}" r="7" fill="#e3b341"/><text x="${sk.x + 20}" y="${sk.y - 17}" text-anchor="middle" fill="#000" font-size="8" font-weight="700">!</text>` : ''}
                ${is_unlocked ? `<circle cx="${sk.x + 20}" cy="${sk.y - 20}" r="7" fill="${sk.color}"/><text x="${sk.x + 20}" y="${sk.y - 17}" text-anchor="middle" fill="#fff" font-size="8">[OK]</text>` : ''}
                <title>${sk.label} — ${sk.desc}${!is_unlocked ? ` (Costs ${sk.xpCost} XP)` : ' (Unlocked)'}</title>
              </g>`;
            }).join('')}

            <!-- Tier labels -->
            ${[0,1,2,3,4,5].map(t => `<text x="20" y="${60 + t * 120}" fill="#8b949e" font-size="9" font-family="Inter,sans-serif" opacity="0.6">Tier ${t}</text>`).join('')}
          </svg>
        </div>

        <div id="st-skill-detail" class="st-detail" hidden>
          <button class="st-detail-close" onclick="document.getElementById('st-skill-detail').hidden=true">
            ${OmicsLab.Icons?.svg('x', 14) || 'x'}
          </button>
          <div id="st-detail-body"></div>
        </div>

        <div class="st-legend">
          <span class="st-leg-item"><span class="st-leg-dot" style="background:#3fb950;opacity:.9"></span> Lab & Wet</span>
          <span class="st-leg-item"><span class="st-leg-dot" style="background:#58a6ff;opacity:.9"></span> Sequencing</span>
          <span class="st-leg-item"><span class="st-leg-dot" style="background:#bc8cff;opacity:.9"></span> Computation</span>
          <span class="st-leg-item"><span class="st-leg-dot" style="background:#e3b341;opacity:.9"></span> Advanced</span>
          <span class="st-leg-item"><span class="st-leg-dot" style="background:#f97316;opacity:.9"></span> Epidemiology</span>
        </div>
      </div>
    `;

    /* click → show detail panel */
    container.querySelectorAll('.st-node').forEach(nd => {
      nd.addEventListener('click', () => {
        const sid = nd.dataset.id;
        _showDetail(sid, container);
      });
    });
  }

  function _nodeIcon(name) {
    const icons = {
      flask:`<path d="M9 3h6M8 9l-4 11h16L16 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`,
      dna:`<path d="M2 15c6.667-6 13.333 0 20-6M2 9c6.667 6 13.333 0 20 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" fill="none"/>`,
      cpu:`<rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" stroke-width="1.5" fill="none"/><rect x="8" y="8" width="8" height="8" stroke="currentColor" stroke-width="1.2" fill="none"/>`,
      droplet:`<path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" stroke="currentColor" stroke-width="1.5" fill="none"/>`,
      scissors:`<circle cx="6" cy="6" r="3" stroke="currentColor" stroke-width="1.5" fill="none"/><circle cx="6" cy="18" r="3" stroke="currentColor" stroke-width="1.5" fill="none"/><line x1="20" y1="4" x2="8.12" y2="15.88" stroke="currentColor" stroke-width="1.5"/>`,
      'check-circle':`<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" stroke-width="1.5" fill="none"/><polyline points="22 4 12 14.01 9 11.01" stroke="currentColor" stroke-width="1.5" fill="none"/>`,
      'git-branch':`<line x1="6" y1="3" x2="6" y2="15" stroke="currentColor" stroke-width="1.5"/><circle cx="18" cy="6" r="3" stroke="currentColor" stroke-width="1.5" fill="none"/><circle cx="6" cy="18" r="3" stroke="currentColor" stroke-width="1.5" fill="none"/><path d="M18 9a9 9 0 0 1-9 9" stroke="currentColor" stroke-width="1.5" fill="none"/>`,
      activity:`<polyline points="22 12 18 12 15 21 9 3 6 12 2 12" stroke="currentColor" stroke-width="1.5" fill="none"/>`,
      code:`<polyline points="16 18 22 12 16 6" stroke="currentColor" stroke-width="1.5" fill="none"/><polyline points="8 6 2 12 8 18" stroke="currentColor" stroke-width="1.5" fill="none"/>`,
      zap:`<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" stroke="currentColor" stroke-width="1.5" fill="none"/>`,
      shield:`<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" stroke-width="1.5" fill="none"/>`,
      globe:`<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5" fill="none"/><line x1="2" y1="12" x2="22" y2="12" stroke="currentColor" stroke-width="1.5"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" stroke="currentColor" stroke-width="1.5" fill="none"/>`,
      virus:`<circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="1.5" fill="none"/><line x1="12" y1="2" x2="12" y2="6" stroke="currentColor" stroke-width="1.5"/><line x1="12" y1="18" x2="12" y2="22" stroke="currentColor" stroke-width="1.5"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76" stroke="currentColor" stroke-width="1.5"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07" stroke="currentColor" stroke-width="1.5"/>`,
      layers:`<polygon points="12 2 2 7 12 12 22 7 12 2" stroke="currentColor" stroke-width="1.5" fill="none"/><polyline points="2 17 12 22 22 17" stroke="currentColor" stroke-width="1.5" fill="none"/><polyline points="2 12 12 17 22 12" stroke="currentColor" stroke-width="1.5" fill="none"/>`,
      'heart-pulse':`<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" stroke="currentColor" stroke-width="1.5" fill="none"/>`,
      'bar-chart':`<line x1="18" y1="20" x2="18" y2="10" stroke="currentColor" stroke-width="1.5"/><line x1="12" y1="20" x2="12" y2="4" stroke="currentColor" stroke-width="1.5"/><line x1="6" y1="20" x2="6" y2="14" stroke="currentColor" stroke-width="1.5"/>`,
      'alert-triangle':`<path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="currentColor" stroke-width="1.5" fill="none"/><line x1="12" y1="9" x2="12" y2="13" stroke="currentColor" stroke-width="1.5"/><line x1="12" y1="17" x2="12.01" y2="17" stroke="currentColor" stroke-width="2"/>`,
      'map-pin':`<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" stroke-width="1.5" fill="none"/><circle cx="12" cy="10" r="3" stroke="currentColor" stroke-width="1.5" fill="none"/>`,
      target:`<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.5" fill="none"/><circle cx="12" cy="12" r="6" stroke="currentColor" stroke-width="1.5" fill="none"/><circle cx="12" cy="12" r="2" stroke="currentColor" stroke-width="1.5" fill="none"/>`,
      award:`<circle cx="12" cy="8" r="6" stroke="currentColor" stroke-width="1.5" fill="none"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" stroke="currentColor" stroke-width="1.5" fill="none"/>`,
      'lock-open':`<rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" stroke-width="1.5" fill="none"/><path d="M7 11V7a5 5 0 0 1 9.9-1" stroke="currentColor" stroke-width="1.5" fill="none"/>`,
    };
    const d = icons[name] || icons['target'];
    return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style="color:currentColor">${d}</svg>`;
  }

  function _showDetail(sid, container) {
    const sk = SKILLS.find(s => s.id === sid);
    if (!sk) return;
    const unlocked = _unlockedIds();
    const is_unlocked = unlocked.has(sk.id);
    const canUnlock = !is_unlocked && sk.prereqs.every(p => unlocked.has(p)) && _load().xp >= sk.xpCost;
    const panel = container.querySelector('#st-skill-detail');
    const body  = container.querySelector('#st-detail-body');
    body.innerHTML = `
      <div class="st-detail-header" style="color:${sk.color}">
        <span class="st-detail-icon">${OmicsLab.Icons?.svg(sk.icon, 20) || ''}</span>
        <strong>${sk.label}</strong>
        <span class="st-detail-state ${is_unlocked ? 'unlocked' : canUnlock ? 'available' : 'locked'}">
          ${is_unlocked ? 'Unlocked' : canUnlock ? 'Available' : 'Locked'}
        </span>
      </div>
      <p class="st-detail-desc">${sk.desc}</p>
      <div class="st-detail-meta">
        <span>Cost: <strong>${sk.xpCost} XP</strong></span>
        <span>Tier: <strong>${sk.tier}</strong></span>
        ${sk.prereqs.length ? `<span>Requires: <strong>${sk.prereqs.map(p => SKILLS.find(s=>s.id===p)?.label||p).join(', ')}</strong></span>` : ''}
      </div>
      ${canUnlock ? `<button class="btn btn-primary btn-sm" style="margin-top:.75rem;width:100%" onclick="OmicsLab.SkillTree.unlockSkill('${sk.id}', true)">Unlock — ${sk.xpCost} XP</button>` : ''}
      ${is_unlocked ? `<div class="st-detail-success">${OmicsLab.Icons?.svg('check-circle',14)||''} You have mastered this skill!</div>` : ''}
    `;
    panel.hidden = false;
  }

  /* ─── Public: manually unlock skill ─── */
  function unlockSkill(sid, confirm = false) {
    if (!sid) return;
    _load();
    const unlocked = _unlockedIds();
    const sk = SKILLS.find(s => s.id === sid);
    if (!sk || unlocked.has(sk.id)) return;
    const prereqsMet = sk.prereqs.every(p => unlocked.has(p));
    if (!prereqsMet) { OmicsLab.Toast?.show('Complete prerequisite skills first', 'warning'); return; }
    if (_state.xp < sk.xpCost) { OmicsLab.Toast?.show(`Need ${sk.xpCost - _state.xp} more XP to unlock ${sk.label}`, 'warning'); return; }
    _state.xp -= sk.xpCost;
    _save();
    unlocked.add(sk.id);
    _saveUnlocks(unlocked);
    OmicsLab.Toast?.show(`${sk.label} unlocked!`, 'success');
    /* Re-render */
    const wrap = document.querySelector('.st-wrap')?.parentElement;
    if (wrap) render(wrap);
  }

  return { render, awardXP, getLevel, initNavBar, unlockSkill, SKILLS, LEVELS, XP_AWARDS };
})();
