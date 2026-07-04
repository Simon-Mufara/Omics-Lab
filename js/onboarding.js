/* ═══════════════════════════════════════════════════════════════
   OmicsLab — 3-Step Onboarding Flow
   Role-aware: student | researcher | instructor | healthcare
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.Onboarding = (function () {

  const FLAG     = 'omicslab_onboarded';
  const ROLE_KEY = 'omicslab_onboarding_role';

  let _step  = 1;
  let _role  = null;
  let _dest  = null;
  let _overlay      = null;
  let _confettiDone = false;

  /* ─── Role → 3 curated starting points ─── */
  const ROLE_OPTIONS = {
    student: [
      { label: 'WGS Step-by-Step',    desc: 'Walk through a whole-genome sequencing protocol. No experience needed.',        page: 'lab',         color: '#00C4A0', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path d="M2 15c6.667-6 13.333 0 20-6"/><path d="M2 9c6.667 6 13.333 0 20 6"/></svg>' },
      { label: 'RNA-seq Terminal',     desc: 'Run a live pipeline — STAR, DESeq2, volcano plots — step by step.',            page: 'terminal',    color: '#58a6ff', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>' },
      { label: 'Genomics Glossary',    desc: 'Learn 200+ key terms — DNA, SNP, variant, allele — with simple definitions.', page: 'glossary',    color: '#bc8cff', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>' },
    ],
    researcher: [
      { label: 'Analysis Suite',       desc: 'FASTQ QC, VCF explorer, RNA-seq expression matrix, and variant interpretation.', page: 'analysis',     color: '#58a6ff', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>' },
      { label: 'Variant Interpreter',  desc: 'Classify VCF variants with ACMG criteria and gnomAD African frequencies.',     page: 'variantinterp',color: '#bc8cff', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path d="M10 2v7.527a2 2 0 0 1-.211.896L4.72 20.55a1 1 0 0 0 .9 1.45h12.76a1 1 0 0 0 .9-1.45l-5.069-10.127A2 2 0 0 1 14 9.527V2"/><path d="M8.5 2h7"/><path d="M7 16h10"/></svg>' },
      { label: 'Africa Hub',           desc: 'H3Africa datasets, population structure, AMR, and pathogen surveillance.',      page: 'africa',       color: '#f97316', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>' },
    ],
    instructor: [
      { label: 'Curriculum Tracks',    desc: 'Structured learning tracks across 12 omics domains for your students.',          page: 'learn',       color: '#bc8cff', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>' },
      { label: 'Skill Tree',           desc: 'Track student XP, badge progress, and unlock bioinformatics milestones.',       page: 'skill-tree',  color: '#f97316', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>' },
      { label: 'Lab Protocols',        desc: '14 interactive protocols — assign specific modules to your class.',              page: 'lab',         color: '#00C4A0', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v11m0 0l-2 2h14l-2-2M9 14H3l2.5 4.5M15 14h6l-2.5 4.5"/></svg>' },
    ],
    healthcare: [
      { label: 'Disease Explorer',     desc: 'Plain-language disease profiles — genes, mutations, and what they mean clinically.', page: 'learn',    color: '#ff6b6b', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>' },
      { label: 'Genomics Glossary',    desc: '200+ terms explained simply — no biology degree required.',                         page: 'glossary', color: '#e3b341', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>' },
      { label: 'AI Mentor',            desc: 'Ask any clinical genomics question in plain English — available 24/7.',             page: 'mentor',   color: '#00C4A0', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path d="M12 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16z"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>' },
    ],
  };

  /* ─── Init ─── */
  function init() {
    if (localStorage.getItem(FLAG)) return;
    _injectStyles();
    setTimeout(_showStep1, 600);
  }

  function _esc(s) { return String(s||'').replace(/[<>&"']/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&#39;'}[c])); }

  /* ─── Overlay helpers ─── */
  function _modal(content) {
    if (_overlay) _overlay.remove();
    _overlay = document.createElement('div');
    _overlay.className = 'ob-overlay';
    _overlay.setAttribute('role', 'dialog');
    _overlay.setAttribute('aria-modal', 'true');
    _overlay.setAttribute('aria-label', 'Welcome to OmicsLab');
    _overlay.innerHTML = `<div class="ob-modal">${content}</div>`;
    document.body.appendChild(_overlay);
    setTimeout(() => {
      const first = _overlay.querySelector('button, [tabindex="0"]');
      if (first) first.focus();
    }, 50);
  }

  function _close() {
    if (_overlay) {
      const el = _overlay;
      el.classList.add('ob-out');
      setTimeout(() => el.remove(), 220);
    }
    _overlay = null;
  }

  /* ─── Step dots (3 total) ─── */
  function _dots(current) {
    return `<div class="ob-dots" aria-label="Step ${current} of 3">${[1,2,3].map(i =>
      `<span class="ob-dot${i===current?' ob-dot-active':''}"></span>`).join('')}</div>`;
  }

  /* ═══════════════════════════════════════════
     STEP 1 — Who are you?
  ═══════════════════════════════════════════ */
  function _showStep1() {
    _step = 1;
    _modal(`
      <div class="ob-logo">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#00C4A0" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
          <path d="M2 15c6.667-6 13.333 0 20-6"/>
          <path d="M9 22c1.798-1.998 2.518-3.995 2.807-5.993"/>
          <path d="M15 2c-1.798 1.998-2.518 3.995-2.807 5.993"/>
          <path d="M2 9c6.667 6 13.333 0 20 6"/>
        </svg>
      </div>
      <div class="ob-welcome-title">Welcome to OmicsLab</div>
      <div class="ob-welcome-sub">Africa's open genomics platform — free, offline, built for you.<br>One quick question to personalise your experience.</div>
      <div class="ob-role-label">How do you describe yourself?</div>
      <div class="ob-role-grid">
        <button class="ob-role-card" onclick="OmicsLab.Onboarding._pickRole('student',this)">
          <div class="ob-role-icon"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg></div>
          <div class="ob-role-name">Student</div>
          <div class="ob-role-desc">Learning omics from scratch</div>
        </button>
        <button class="ob-role-card" onclick="OmicsLab.Onboarding._pickRole('researcher',this)">
          <div class="ob-role-icon"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 2v7.527a2 2 0 0 1-.211.896L4.72 20.55a1 1 0 0 0 .9 1.45h12.76a1 1 0 0 0 .9-1.45l-5.069-10.127A2 2 0 0 1 14 9.527V2"/><path d="M8.5 2h7"/><path d="M7 16h10"/></svg></div>
          <div class="ob-role-name">Researcher</div>
          <div class="ob-role-desc">Running active genomics projects</div>
        </button>
        <button class="ob-role-card" onclick="OmicsLab.Onboarding._pickRole('instructor',this)">
          <div class="ob-role-icon"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg></div>
          <div class="ob-role-name">Instructor</div>
          <div class="ob-role-desc">Teaching genomics to others</div>
        </button>
        <button class="ob-role-card" onclick="OmicsLab.Onboarding._pickRole('healthcare',this)">
          <div class="ob-role-icon"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg></div>
          <div class="ob-role-name">Nurse / Clinician</div>
          <div class="ob-role-desc">Healthcare, new to genomics</div>
        </button>
      </div>
      ${_dots(1)}
      <button class="ob-skip-btn" onclick="OmicsLab.Onboarding.skip()">Skip personalisation</button>
    `);
  }

  function _pickRole(role, btn) {
    _role = role;
    localStorage.setItem(ROLE_KEY, role);
    _overlay.querySelectorAll('.ob-role-card').forEach(c => c.classList.remove('ob-role-selected'));
    btn.classList.add('ob-role-selected');
    setTimeout(_showStep2, 320);
  }

  /* ═══════════════════════════════════════════
     STEP 2 — Pick your starting point
  ═══════════════════════════════════════════ */
  function _showStep2() {
    _step = 2;
    const options = ROLE_OPTIONS[_role] || ROLE_OPTIONS.researcher;
    _modal(`
      <div class="ob-step-eyebrow">Step 2 of 3</div>
      <div class="ob-step-title">Where do you want to start?</div>
      <div class="ob-step-sub">Pick one — you can change this any time from the nav.</div>
      <div class="ob-options">
        ${options.map((o, i) => `
          <button class="ob-option" onclick="OmicsLab.Onboarding._pickDest('${o.page}', this)">
            <span class="ob-option-icon" style="color:${o.color}">${o.icon}</span>
            <span class="ob-option-body">
              <span class="ob-option-name" style="color:${o.color}">${_esc(o.label)}</span>
              <span class="ob-option-desc">${_esc(o.desc)}</span>
            </span>
            <svg class="ob-option-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>`).join('')}
      </div>
      <button class="ob-skip-btn ob-skip-center" onclick="OmicsLab.Onboarding._showStep3()">I'll explore on my own</button>
      ${_dots(2)}
      <button class="ob-back-btn" onclick="OmicsLab.Onboarding._showStep1()">← Back</button>
    `);
  }

  function _pickDest(page, btn) {
    _dest = page;
    _overlay.querySelectorAll('.ob-option').forEach(o => o.classList.remove('ob-option-selected'));
    btn.classList.add('ob-option-selected');
    OmicsLab.Router?.navigate(page);
    setTimeout(_showStep3, 280);
  }

  /* ═══════════════════════════════════════════
     STEP 3 — Ready!
  ═══════════════════════════════════════════ */
  function _showStep3() {
    _step = 3;
    const isSignedIn = !!(localStorage.getItem('omicslab_user') || window.OmicsLab?.AuthClerk?.getUser?.());
    _modal(`
      <div class="ob-confetti" id="ob-confetti"></div>
      <div class="ob-ready-icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#00C4A0" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
          <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
      </div>
      <div class="ob-welcome-title">You're all set!</div>
      <div class="ob-welcome-sub">Everything runs in your browser — no install, no cost. 54 African nations already training here.</div>
      ${!isSignedIn ? `
        <div class="ob-account-nudge">
          <div class="ob-nudge-label">Save your progress across devices</div>
          <button class="ob-btn ob-btn-account" onclick="OmicsLab.AuthClerk?OmicsLab.AuthClerk.signUp():OmicsLab.Auth&&OmicsLab.Auth.openModal('register');OmicsLab.Onboarding.done()">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            Create free account
          </button>
        </div>` : ''}
      <div class="ob-step-actions">
        <button class="ob-btn ob-btn-primary" onclick="OmicsLab.Onboarding.done()">
          Start exploring →
        </button>
        ${!isSignedIn ? `<button class="ob-btn ob-btn-ghost" onclick="OmicsLab.Onboarding.done()">Continue without account</button>` : ''}
      </div>
      ${_dots(3)}
    `);
    _runConfetti();
  }

  function _runConfetti() {
    if (_confettiDone) return;
    _confettiDone = true;
    const container = document.getElementById('ob-confetti');
    if (!container) return;
    const COLORS = ['#00C4A0','#58a6ff','#bc8cff','#f97316','#e3b341','#ff6b6b'];
    for (let i = 0; i < 52; i++) {
      const p = document.createElement('div');
      p.className = 'ob-confetti-piece';
      p.style.cssText = `left:${Math.random()*100}%;background:${COLORS[i%COLORS.length]};width:${6+Math.random()*8}px;height:${6+Math.random()*8}px;border-radius:${Math.random()>.5?'50%':'2px'};animation-delay:${Math.random()*700}ms;animation-duration:${900+Math.random()*600}ms;`;
      container.appendChild(p);
    }
  }

  /* ─── Public API ─── */
  function skip() {
    localStorage.setItem(FLAG, '1');
    _close();
  }

  function done() {
    localStorage.setItem(FLAG, '1');
    const dest = _dest || (ROLE_OPTIONS[_role]?.[0]?.page) || 'lab';
    _close();
    if (dest && !_dest) OmicsLab.Router?.navigate(dest);
  }

  /* ─── Styles ─── */
  function _injectStyles() {
    if (document.getElementById('ob-styles')) return;
    const s = document.createElement('style');
    s.id = 'ob-styles';
    s.textContent = `
      /* Overlay */
      .ob-overlay{position:fixed;inset:0;background:rgba(6,10,20,.85);z-index:7000;display:flex;align-items:center;justify-content:center;padding:1rem;animation:ob-fade .22s ease both;backdrop-filter:blur(6px)}
      .ob-overlay.ob-out{animation:ob-fade-out .22s ease both}
      @keyframes ob-fade{from{opacity:0}to{opacity:1}}
      @keyframes ob-fade-out{to{opacity:0}}

      /* Modal */
      .ob-modal{background:var(--bg-surface,#111B2E);border:1px solid var(--border-default,rgba(255,255,255,0.08));border-radius:18px;padding:2.25rem 2.25rem 1.75rem;max-width:500px;width:100%;position:relative;animation:ob-slide .28s cubic-bezier(.16,1,.3,1) both;text-align:center;box-shadow:0 0 0 1px rgba(255,255,255,0.04),0 32px 80px rgba(0,0,0,0.6)}
      @keyframes ob-slide{from{transform:translateY(20px) scale(.96);opacity:0}to{transform:none;opacity:1}}

      /* Logo + header */
      .ob-logo{margin-bottom:.9rem}
      .ob-welcome-title{font-size:1.4rem;font-weight:800;color:var(--text-primary,#E4DDD2);margin-bottom:.45rem;font-family:'Sora','Inter',sans-serif;line-height:1.25}
      .ob-welcome-sub{font-size:.84rem;color:var(--text-muted,#6E6860);line-height:1.65;margin-bottom:1.5rem}

      /* Step label */
      .ob-step-eyebrow{font-size:.68rem;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:#00C4A0;margin-bottom:.35rem}
      .ob-step-title{font-size:1.1rem;font-weight:800;color:var(--text-primary,#E4DDD2);margin-bottom:.35rem;font-family:'Sora','Inter',sans-serif}
      .ob-step-sub{font-size:.82rem;color:var(--text-muted,#6E6860);line-height:1.6;margin-bottom:1.2rem}

      /* Role question */
      .ob-role-label{font-size:.75rem;font-weight:700;color:var(--text-secondary,#A8A098);margin-bottom:.75rem;text-align:left}

      /* Role grid */
      .ob-role-grid{display:grid;grid-template-columns:1fr 1fr;gap:.55rem;margin-bottom:1.4rem}
      .ob-role-card{background:var(--bg-canvas,#0D1524);border:1px solid var(--border-default,rgba(255,255,255,0.08));border-radius:12px;padding:1rem .75rem;cursor:pointer;text-align:center;transition:border-color .14s,background .14s,transform .12s;font-family:inherit}
      .ob-role-card:hover{background:var(--bg-overlay,#182236);border-color:var(--border-muted,rgba(255,255,255,0.12));transform:translateY(-1px)}
      .ob-role-selected{border-color:#00C4A0 !important;background:rgba(0,196,160,0.07) !important;transform:translateY(-1px)}
      .ob-role-selected .ob-role-icon{color:#00C4A0}
      .ob-role-icon{display:flex;justify-content:center;align-items:center;height:2.25rem;margin-bottom:.45rem;color:var(--text-muted,#6E6860);transition:color .14s}
      .ob-role-name{font-size:.84rem;font-weight:800;color:var(--text-primary,#E4DDD2);margin-bottom:.2rem;line-height:1.2}
      .ob-role-desc{font-size:.7rem;color:var(--text-muted,#6E6860);line-height:1.4}

      /* Destination options */
      .ob-options{display:flex;flex-direction:column;gap:.45rem;margin-bottom:.85rem;text-align:left}
      .ob-option{display:flex;align-items:center;gap:.7rem;background:var(--bg-canvas,#0D1524);border:1px solid var(--border-default,rgba(255,255,255,0.08));border-radius:10px;padding:.75rem .85rem;cursor:pointer;font-family:inherit;transition:background .12s,border-color .12s,transform .12s;width:100%;text-align:left}
      .ob-option:hover{background:var(--bg-overlay,#182236);border-color:var(--border-muted,rgba(255,255,255,0.12));transform:translateX(2px)}
      .ob-option-selected{border-color:#00C4A0 !important;background:rgba(0,196,160,0.07) !important}
      .ob-option-icon{flex-shrink:0}
      .ob-option-body{flex:1;display:flex;flex-direction:column;gap:.15rem}
      .ob-option-name{font-size:.84rem;font-weight:800;line-height:1.2}
      .ob-option-desc{font-size:.72rem;color:var(--text-muted,#6E6860);line-height:1.4}
      .ob-option-arrow{flex-shrink:0;color:var(--text-faint,#4A4440);transition:transform .12s}
      .ob-option:hover .ob-option-arrow{transform:translateX(3px)}

      /* Account nudge */
      .ob-account-nudge{background:rgba(0,196,160,0.06);border:1px solid rgba(0,196,160,0.2);border-radius:10px;padding:.85rem 1rem;margin-bottom:1rem;text-align:left}
      .ob-nudge-label{font-size:.72rem;font-weight:700;color:var(--text-secondary,#A8A098);margin-bottom:.55rem}
      .ob-btn-account{display:flex;align-items:center;justify-content:center;gap:.4rem;padding:.5rem 1rem;background:#00C4A0;color:#060A14;border:none;border-radius:8px;font-size:.82rem;font-weight:700;cursor:pointer;font-family:inherit;transition:background .14s;width:100%}
      .ob-btn-account:hover{background:#00B390}

      /* Actions */
      .ob-step-actions{display:flex;flex-direction:column;gap:.4rem;margin-bottom:.85rem}
      .ob-btn{display:flex;align-items:center;justify-content:center;gap:.4rem;padding:.55rem 1rem;border-radius:8px;font-size:.84rem;font-weight:700;cursor:pointer;border:1px solid transparent;transition:background .12s;width:100%;font-family:inherit}
      .ob-btn-primary{background:#00C4A0;border-color:#00C4A0;color:#060A14}
      .ob-btn-primary:hover{background:#00B390}
      .ob-btn-ghost{background:var(--bg-overlay,#182236);border-color:var(--border-muted,rgba(255,255,255,0.12));color:var(--text-secondary,#A8A098)}
      .ob-btn-ghost:hover{background:var(--bg-surface,#111B2E)}

      /* Ready icon */
      .ob-ready-icon{display:flex;justify-content:center;margin-bottom:.85rem}

      /* Progress dots */
      .ob-dots{display:flex;justify-content:center;gap:.4rem;margin-bottom:.75rem}
      .ob-dot{width:8px;height:8px;border-radius:50%;background:var(--bg-overlay,#182236);border:1px solid var(--border-default,rgba(255,255,255,0.08));transition:background .2s,border-color .2s}
      .ob-dot-active{background:#00C4A0;border-color:#00C4A0}

      /* Skip / back links */
      .ob-skip-btn{background:none;border:none;font-size:.75rem;color:var(--text-faint,#4A4440);cursor:pointer;padding:.2rem .4rem;border-radius:4px;font-family:inherit;transition:color .12s;display:block;margin:0 auto .2rem}
      .ob-skip-btn:hover{color:var(--text-muted,#6E6860)}
      .ob-skip-center{margin-bottom:.75rem}
      .ob-back-btn{background:none;border:none;font-size:.72rem;color:var(--text-faint,#4A4440);cursor:pointer;padding:.2rem .4rem;font-family:inherit;transition:color .12s}
      .ob-back-btn:hover{color:var(--text-muted,#6E6860)}

      /* Confetti */
      .ob-confetti{position:absolute;inset:0;pointer-events:none;overflow:hidden;border-radius:18px}
      .ob-confetti-piece{position:absolute;top:-14px;animation:ob-confetti-fall ease-in both}
      @keyframes ob-confetti-fall{to{transform:translateY(480px) rotate(540deg);opacity:0}}

      /* Responsive */
      @media(max-width:480px){
        .ob-modal{padding:1.75rem 1.25rem 1.5rem;border-radius:14px}
        .ob-role-grid{grid-template-columns:1fr 1fr;gap:.4rem}
        .ob-welcome-title,.ob-step-title{font-size:1.1rem}
      }
    `;
    document.head.appendChild(s);
  }

  return { init, skip, done, _showStep1, _showStep2, _showStep3, _pickRole, _pickDest };
})();
