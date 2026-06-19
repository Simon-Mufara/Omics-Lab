/* ═══════════════════════════════════════════════════════════════
   OmicsLab — 5-Step Onboarding Flow (Prompt 7)
   ─ Triggered once on first visit (localStorage flag)
   ─ Role-aware: student | researcher | instructor
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.Onboarding = (function () {

  const FLAG = 'omicslab_onboarded';
  const ROLE_KEY = 'omicslab_onboarding_role';

  let _step = 1;
  let _role = null;
  let _overlay = null;
  let _confettiDone = false;

  /* ─── Role-specific first workflow suggestion ─── */
  const ROLE_SUGGEST = {
    student: {
      label: 'WGS Beginner',
      desc: 'Walk through a whole-genome sequencing protocol step-by-step. No prior experience needed.',
      icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path d="M2 15c6.667-6 13.333 0 20-6"/><path d="M2 9c6.667 6 13.333 0 20 6"/></svg>',
      page: 'lab',
      color: '#3fb950',
    },
    researcher: {
      label: 'Analysis Suite',
      desc: 'Jump straight to FASTQ QC, VCF explorer, expression matrix, and variant interpretation.',
      icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>',
      page: 'analysis',
      color: '#58a6ff',
    },
    instructor: {
      label: 'Curriculum Tracks',
      desc: 'Set up structured learning tracks for your students across 12 omics domains.',
      icon: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>',
      page: 'learn',
      color: '#bc8cff',
    },
  };

  /* ─── Hotspot highlights ─── */
  const HOTSPOTS = [
    { label: 'Lab', sub: '14 interactive protocols from WGS to metagenomics', page: 'lab', color: '#3fb950' },
    { label: 'Tools', sub: '55+ API-powered tools: gene lookup, pathways, SRA, variant interpretation', page: 'variantinterp', color: '#58a6ff' },
    { label: 'Africa Hub', sub: 'Genomics map, H3Africa portal, pathogen surveillance, offline datasets', page: 'africa', color: '#f97316' },
    { label: 'Nexus', sub: 'Research communication hub with channels, threads, and @mentions', page: 'nexus', color: '#bc8cff' },
  ];

  /* ─── Init ─── */
  function init() {
    if (localStorage.getItem(FLAG)) return;
    _injectStyles();
    /* Small delay so the home page renders first */
    setTimeout(_showStep1, 600);
  }

  function _esc(s) { return String(s||'').replace(/[<>&"']/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&#39;'}[c])); }

  /* ─── Overlay helpers ─── */
  function _modal(content, opts = {}) {
    if (_overlay) _overlay.remove();
    _overlay = document.createElement('div');
    _overlay.className = 'ob-overlay' + (opts.fullscreen ? ' ob-fullscreen' : '');
    _overlay.setAttribute('role', 'dialog');
    _overlay.setAttribute('aria-modal', 'true');
    _overlay.setAttribute('aria-label', 'Welcome to OmicsLab');
    _overlay.innerHTML = `<div class="ob-modal">${content}</div>`;
    document.body.appendChild(_overlay);
    /* Focus first interactive element */
    setTimeout(() => {
      const first = _overlay.querySelector('button, [tabindex="0"]');
      if (first) first.focus();
    }, 50);
  }

  function _close() {
    if (_overlay) { _overlay.classList.add('ob-out'); setTimeout(() => _overlay?.remove(), 220); }
    _overlay = null;
  }

  /* ─── Step indicator ─── */
  function _dots(current, total = 5) {
    return `<div class="ob-dots">${Array.from({length:total},(_,i)=>
      `<span class="ob-dot${i+1===current?' ob-dot-active':''}"></span>`).join('')}</div>`;
  }

  /* ─── Step 1: Welcome + Role ─── */
  function _showStep1() {
    _step = 1;
    _modal(`
      <div class="ob-logo">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#3fb950" stroke-width="1.75"><path d="M2 15c6.667-6 13.333 0 20-6"/><path d="M9 22c1.798-1.998 2.518-3.995 2.807-5.993"/><path d="M15 2c-1.798 1.998-2.518 3.995-2.807 5.993"/><path d="M2 9c6.667 6 13.333 0 20 6"/></svg>
      </div>
      <div class="ob-welcome-title">Welcome to OmicsLab</div>
      <div class="ob-welcome-sub">Africa's open genomics training platform. Let's personalise your experience in 30 seconds.</div>
      <div class="ob-role-label">I am a…</div>
      <div class="ob-role-cards">
        <button class="ob-role-card" onclick="OmicsLab.Onboarding._pickRole('student',this)">
          <div class="ob-role-icon">🎓</div>
          <div class="ob-role-name">Student</div>
          <div class="ob-role-desc">Learning omics for the first time</div>
        </button>
        <button class="ob-role-card" onclick="OmicsLab.Onboarding._pickRole('researcher',this)">
          <div class="ob-role-icon">🔬</div>
          <div class="ob-role-name">Researcher</div>
          <div class="ob-role-desc">Running my own genomics projects</div>
        </button>
        <button class="ob-role-card" onclick="OmicsLab.Onboarding._pickRole('instructor',this)">
          <div class="ob-role-icon">📚</div>
          <div class="ob-role-name">Instructor</div>
          <div class="ob-role-desc">Teaching genomics to others</div>
        </button>
      </div>
      ${_dots(1)}
      <div class="ob-skip"><button class="ob-skip-btn" onclick="OmicsLab.Onboarding.skip()">Skip for now</button></div>
    `);
  }

  function _pickRole(role, btn) {
    _role = role;
    localStorage.setItem(ROLE_KEY, role);
    /* visual selection */
    _overlay.querySelectorAll('.ob-role-card').forEach(c => c.classList.remove('ob-role-selected'));
    btn.classList.add('ob-role-selected');
    setTimeout(_showStep2, 350);
  }

  /* ─── Step 2: First workflow ─── */
  function _showStep2() {
    _step = 2;
    const sug = ROLE_SUGGEST[_role] || ROLE_SUGGEST.researcher;
    _modal(`
      <div class="ob-step-label">Step 2 of 5</div>
      <div class="ob-step-title">Pick your first workflow</div>
      <div class="ob-step-sub">Based on your role, we recommend starting here:</div>
      <div class="ob-suggest-card" style="border-color:${sug.color}30">
        <div class="ob-sug-icon" style="color:${sug.color}">${sug.icon}</div>
        <div class="ob-sug-body">
          <div class="ob-sug-name" style="color:${sug.color}">${_esc(sug.label)}</div>
          <div class="ob-sug-desc">${_esc(sug.desc)}</div>
        </div>
      </div>
      <div class="ob-step-actions">
        <button class="ob-btn ob-btn-primary" style="background:${sug.color};border-color:${sug.color}"
          onclick="OmicsLab.Onboarding._startPage('${sug.page}')">
          Start: ${_esc(sug.label)}
        </button>
        <button class="ob-btn ob-btn-ghost" onclick="OmicsLab.Onboarding._showStep3()">
          I'll explore on my own →
        </button>
      </div>
      ${_dots(2)}
      <div class="ob-back"><button class="ob-skip-btn" onclick="OmicsLab.Onboarding._showStep1()">← Back</button></div>
    `);
  }

  /* ─── Step 3: Feature hotspots ─── */
  function _showStep3() {
    _step = 3;
    _modal(`
      <div class="ob-step-label">Step 3 of 5</div>
      <div class="ob-step-title">Four things to know</div>
      <div class="ob-step-sub">Click any feature to navigate there:</div>
      <div class="ob-hotspots">
        ${HOTSPOTS.map(h => `
          <button class="ob-hotspot" onclick="OmicsLab.Onboarding._gotoHotspot('${h.page}')">
            <div class="ob-hotspot-dot" style="background:${h.color}"></div>
            <div class="ob-hotspot-body">
              <div class="ob-hotspot-label" style="color:${h.color}">${_esc(h.label)}</div>
              <div class="ob-hotspot-sub">${_esc(h.sub)}</div>
            </div>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>`).join('')}
      </div>
      <div class="ob-step-actions">
        <button class="ob-btn ob-btn-primary" onclick="OmicsLab.Onboarding._showStep4()">Got it →</button>
      </div>
      ${_dots(3)}
    `);
  }

  function _gotoHotspot(page) {
    OmicsLab.Router?.navigate(page);
    _showStep4();
  }

  /* ─── Step 4: Profile nudge ─── */
  function _showStep4() {
    _step = 4;
    const isSignedIn = !!localStorage.getItem('omicslab_user');
    _modal(`
      <div class="ob-step-label">Step 4 of 5</div>
      <div class="ob-step-title">${isSignedIn ? 'You\'re signed in!' : 'Save your progress'}</div>
      <div class="ob-step-sub">${isSignedIn
        ? 'Your badges, curriculum progress, and outputs are saved across sessions.'
        : 'Create a free account to sync your badges, curriculum progress, and research outputs across devices.'}</div>
      ${!isSignedIn ? `
        <div class="ob-auth-options">
          <button class="ob-btn ob-btn-primary" onclick="OmicsLab.App?.openSignIn?.();OmicsLab.Onboarding._showStep5()">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            Create free account
          </button>
          <button class="ob-btn ob-btn-ghost" onclick="OmicsLab.Onboarding._showStep5()">Skip — continue without account</button>
        </div>` : `
        <div class="ob-step-actions">
          <button class="ob-btn ob-btn-primary" onclick="OmicsLab.Onboarding._showStep5()">Continue →</button>
        </div>`}
      ${_dots(4)}
    `);
  }

  /* ─── Step 5: Ready + confetti ─── */
  function _showStep5() {
    _step = 5;
    _modal(`
      <div class="ob-confetti" id="ob-confetti"></div>
      <div class="ob-ready-icon">🌍</div>
      <div class="ob-welcome-title">You're ready!</div>
      <div class="ob-welcome-sub">
        Welcome to OmicsLab — Africa's open genomics training platform.<br>
        Everything runs in your browser, no installation needed.
      </div>
      <div class="ob-step-actions">
        <button class="ob-btn ob-btn-primary" onclick="OmicsLab.Onboarding.done()">
          Start exploring OmicsLab →
        </button>
      </div>
      ${_dots(5)}
    `);
    _runConfetti();
  }

  function _runConfetti() {
    if (_confettiDone) return;
    _confettiDone = true;
    const container = document.getElementById('ob-confetti');
    if (!container) return;
    const COLORS = ['#3fb950','#58a6ff','#bc8cff','#f97316','#e3b341','#ff6b6b'];
    for (let i = 0; i < 48; i++) {
      const p = document.createElement('div');
      p.className = 'ob-confetti-piece';
      p.style.cssText = `
        left:${Math.random()*100}%;
        background:${COLORS[Math.floor(Math.random()*COLORS.length)]};
        width:${6+Math.random()*8}px;height:${6+Math.random()*8}px;
        border-radius:${Math.random()>.5?'50%':'2px'};
        animation-delay:${Math.random()*600}ms;
        animation-duration:${800+Math.random()*600}ms;`;
      container.appendChild(p);
    }
  }

  /* ─── Public API ─── */
  function _startPage(page) {
    OmicsLab.Router?.navigate(page);
    _showStep3();
  }

  function skip() {
    localStorage.setItem(FLAG, '1');
    _close();
  }

  function done() {
    localStorage.setItem(FLAG, '1');
    const sug = ROLE_SUGGEST[_role] || ROLE_SUGGEST.researcher;
    _close();
    OmicsLab.Router?.navigate(sug.page);
  }

  /* ─── Styles ─── */
  function _injectStyles() {
    if (document.getElementById('ob-styles')) return;
    const s = document.createElement('style');
    s.id = 'ob-styles';
    s.textContent = `
      .ob-overlay{position:fixed;inset:0;background:rgba(1,4,9,.82);z-index:7000;display:flex;align-items:center;justify-content:center;padding:1rem;animation:ob-fade .2s ease both;backdrop-filter:blur(4px)}
      .ob-overlay.ob-out{animation:ob-fade-out .22s ease both}
      @keyframes ob-fade{from{opacity:0}to{opacity:1}}
      @keyframes ob-fade-out{to{opacity:0}}
      .ob-modal{background:#161b22;border:1px solid #21262d;border-radius:16px;padding:2rem 2.25rem;max-width:480px;width:100%;position:relative;animation:ob-slide .25s var(--ease-out,cubic-bezier(.16,1,.3,1)) both;text-align:center}
      @keyframes ob-slide{from{transform:translateY(16px) scale(.96);opacity:0}to{transform:none;opacity:1}}
      .ob-logo{margin-bottom:.75rem}
      .ob-welcome-title{font-size:1.35rem;font-weight:800;color:#e6edf3;margin-bottom:.5rem;font-family:'Sora','Inter',sans-serif}
      .ob-welcome-sub{font-size:.85rem;color:#8b949e;line-height:1.6;margin-bottom:1.4rem}
      .ob-ready-icon{font-size:2.5rem;margin-bottom:.6rem}
      .ob-step-label{font-size:.7rem;font-weight:700;color:#484f58;text-transform:uppercase;letter-spacing:.06em;margin-bottom:.4rem}
      .ob-step-title{font-size:1.1rem;font-weight:800;color:#e6edf3;margin-bottom:.4rem}
      .ob-step-sub{font-size:.82rem;color:#8b949e;line-height:1.6;margin-bottom:1.25rem}
      .ob-role-label{font-size:.72rem;font-weight:700;color:#8b949e;text-transform:uppercase;letter-spacing:.05em;margin-bottom:.65rem}
      .ob-role-cards{display:grid;grid-template-columns:repeat(3,1fr);gap:.5rem;margin-bottom:1.4rem}
      .ob-role-card{background:#0d1117;border:1px solid #21262d;border-radius:10px;padding:.85rem .5rem;cursor:pointer;text-align:center;transition:border-color .12s,background .12s}
      .ob-role-card:hover{background:#161b22;border-color:#30363d}
      .ob-role-selected{border-color:#3fb950!important;background:rgba(63,185,80,.06)!important}
      .ob-role-icon{font-size:1.6rem;margin-bottom:.35rem}
      .ob-role-name{font-size:.82rem;font-weight:700;color:#e6edf3;margin-bottom:.15rem}
      .ob-role-desc{font-size:.68rem;color:#8b949e;line-height:1.4}
      .ob-suggest-card{display:flex;align-items:flex-start;gap:.75rem;background:#0d1117;border:1px solid #21262d;border-radius:10px;padding:.9rem;margin-bottom:1.1rem;text-align:left}
      .ob-sug-icon{flex-shrink:0;margin-top:.15rem}
      .ob-sug-name{font-size:.88rem;font-weight:700;margin-bottom:.25rem}
      .ob-sug-desc{font-size:.78rem;color:#8b949e;line-height:1.5}
      .ob-step-actions{display:flex;flex-direction:column;gap:.4rem;margin-bottom:1.1rem}
      .ob-hotspots{display:flex;flex-direction:column;gap:.4rem;margin-bottom:1.1rem;text-align:left}
      .ob-hotspot{display:flex;align-items:flex-start;gap:.6rem;background:#0d1117;border:1px solid #21262d;border-radius:8px;padding:.6rem .75rem;cursor:pointer;transition:background .1s,border-color .1s;width:100%;text-align:left}
      .ob-hotspot:hover{background:#161b22;border-color:#30363d}
      .ob-hotspot-dot{width:9px;height:9px;border-radius:50%;flex-shrink:0;margin-top:.35rem}
      .ob-hotspot-body{flex:1}
      .ob-hotspot-label{font-size:.82rem;font-weight:700;margin-bottom:.1rem}
      .ob-hotspot-sub{font-size:.72rem;color:#8b949e;line-height:1.45}
      .ob-auth-options{display:flex;flex-direction:column;gap:.4rem;margin-bottom:1.1rem}
      .ob-btn{display:flex;align-items:center;justify-content:center;gap:.35rem;padding:.46rem 1rem;border-radius:8px;font-size:.83rem;font-weight:600;cursor:pointer;border:1px solid transparent;transition:background .12s,opacity .12s;width:100%}
      .ob-btn-primary{background:#238636;border-color:#3fb950;color:#fff}
      .ob-btn-primary:hover{background:#2ea043}
      .ob-btn-ghost{background:#21262d;border-color:#30363d;color:#c9d1d9}
      .ob-btn-ghost:hover{background:#2d333b}
      .ob-dots{display:flex;justify-content:center;gap:.35rem;margin-bottom:.85rem}
      .ob-dot{width:7px;height:7px;border-radius:50%;background:#21262d}
      .ob-dot-active{background:#3fb950}
      .ob-skip,.ob-back{margin-top:.35rem}
      .ob-skip-btn{background:none;border:none;font-size:.72rem;color:#484f58;cursor:pointer;padding:.15rem .3rem;border-radius:4px}
      .ob-skip-btn:hover{color:#8b949e}
      /* Confetti */
      .ob-confetti{position:absolute;inset:0;pointer-events:none;overflow:hidden;border-radius:16px}
      .ob-confetti-piece{position:absolute;top:-12px;animation:ob-confetti-fall ease-in both}
      @keyframes ob-confetti-fall{to{transform:translateY(420px) rotate(360deg);opacity:0}}
    `;
    document.head.appendChild(s);
  }

  return { init, skip, done, _showStep1, _showStep2, _showStep3, _showStep4, _showStep5, _pickRole, _startPage, _gotoHotspot };
})();
