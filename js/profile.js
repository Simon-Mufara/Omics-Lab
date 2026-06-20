/* ═══════════════════════════════════════════════════════════════
   OmicsLab — Profile & First-Visit Setup
   Stores profile in localStorage as 'omicslab_profile'
   Time spent in 'omicslab_time_spent' (minutes)
   Streak in 'omicslab_streak' + 'omicslab_last_visit' (date string)
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.Profile = (function () {

  const KEY      = 'omicslab_profile';
  const TIME_KEY = 'omicslab_time_spent';
  const STREAK_KEY     = 'omicslab_streak';
  const LAST_VISIT_KEY = 'omicslab_last_visit';
  const BADGES_KEY     = 'omicslab_badges_earned';

  /* ── 54 African countries + international ── */
  const COUNTRIES = [
    { name:'Algeria',                    flag:'🇩🇿' },
    { name:'Angola',                     flag:'🇦🇴' },
    { name:'Benin',                      flag:'🇧🇯' },
    { name:'Botswana',                   flag:'🇧🇼' },
    { name:'Burkina Faso',               flag:'🇧🇫' },
    { name:'Burundi',                    flag:'🇧🇮' },
    { name:'Cabo Verde',                 flag:'🇨🇻' },
    { name:'Cameroon',                   flag:'🇨🇲' },
    { name:'Central African Republic',   flag:'🇨🇫' },
    { name:'Chad',                       flag:'🇹🇩' },
    { name:'Comoros',                    flag:'🇰🇲' },
    { name:'DR Congo',                   flag:'🇨🇩' },
    { name:'Republic of Congo',          flag:'🇨🇬' },
    { name:'Djibouti',                   flag:'🇩🇯' },
    { name:'Egypt',                      flag:'🇪🇬' },
    { name:'Equatorial Guinea',          flag:'🇬🇶' },
    { name:'Eritrea',                    flag:'🇪🇷' },
    { name:'Eswatini',                   flag:'🇸🇿' },
    { name:'Ethiopia',                   flag:'🇪🇹' },
    { name:'Gabon',                      flag:'🇬🇦' },
    { name:'Gambia',                     flag:'🇬🇲' },
    { name:'Ghana',                      flag:'🇬🇭' },
    { name:'Guinea',                     flag:'🇬🇳' },
    { name:'Guinea-Bissau',              flag:'🇬🇼' },
    { name:'Ivory Coast',                flag:'🇨🇮' },
    { name:'Kenya',                      flag:'🇰🇪' },
    { name:'Lesotho',                    flag:'🇱🇸' },
    { name:'Liberia',                    flag:'🇱🇷' },
    { name:'Libya',                      flag:'🇱🇾' },
    { name:'Madagascar',                 flag:'🇲🇬' },
    { name:'Malawi',                     flag:'🇲🇼' },
    { name:'Mali',                       flag:'🇲🇱' },
    { name:'Mauritania',                 flag:'🇲🇷' },
    { name:'Mauritius',                  flag:'🇲🇺' },
    { name:'Morocco',                    flag:'🇲🇦' },
    { name:'Mozambique',                 flag:'🇲🇿' },
    { name:'Namibia',                    flag:'🇳🇦' },
    { name:'Niger',                      flag:'🇳🇪' },
    { name:'Nigeria',                    flag:'🇳🇬' },
    { name:'Rwanda',                     flag:'🇷🇼' },
    { name:'São Tomé and Príncipe',      flag:'🇸🇹' },
    { name:'Senegal',                    flag:'🇸🇳' },
    { name:'Seychelles',                 flag:'🇸🇨' },
    { name:'Sierra Leone',               flag:'🇸🇱' },
    { name:'Somalia',                    flag:'🇸🇴' },
    { name:'South Africa',               flag:'🇿🇦' },
    { name:'South Sudan',                flag:'🇸🇸' },
    { name:'Sudan',                      flag:'🇸🇩' },
    { name:'Tanzania',                   flag:'🇹🇿' },
    { name:'Togo',                       flag:'🇹🇬' },
    { name:'Tunisia',                    flag:'🇹🇳' },
    { name:'Uganda',                     flag:'🇺🇬' },
    { name:'Zambia',                     flag:'🇿🇲' },
    { name:'Zimbabwe',                   flag:'🇿🇼' },
    { divider: true },
    { name:'International (outside Africa)', flag:'' },
  ];

  const ROLES = [
    { id:'Student',    icon:'award',       desc:'Studying omics or bioinformatics' },
    { id:'Researcher', icon:'microscope',  desc:'Academic or industry research' },
    { id:'Instructor', icon:'layers',      desc:'Teaching or training others' },
    { id:'Clinician',  icon:'heart-pulse', desc:'Clinical or public health work' },
  ];

  const ROLE_RECS = {
    Student: [
      { page:'lab',      icon:'flask',      color:'rgba(63,185,80,0.12)',   name:'WGS Simulation',        desc:'Build wet-lab fundamentals step by step' },
      { page:'learn',    icon:'virus',      color:'rgba(88,166,255,0.12)',  name:'Disease Explorer',       desc:'Study 40+ Africa-relevant diseases' },
      { page:'learn',    icon:'award',      color:'rgba(188,140,255,0.12)', name:'Curriculum Tracks',      desc:'Follow a structured path, earn certificates' },
    ],
    Researcher: [
      { page:'lab',      icon:'dna',        color:'rgba(63,185,80,0.12)',   name:'Advanced WGS / GATK4',   desc:'Full variant calling pipeline' },
      { page:'research', icon:'search',     color:'rgba(188,140,255,0.12)', name:'Research Mode',          desc:'Design reproducible FAIR studies' },
      { page:'terminal', icon:'cpu',        color:'rgba(88,166,255,0.12)',  name:'Pipeline Terminal',      desc:'Run Snakemake & Nextflow workflows' },
    ],
    Instructor: [
      { page:'research', icon:'layers',     color:'rgba(188,140,255,0.12)', name:'Workshop Mode',          desc:'Set up cohort training sessions' },
      { page:'learn',    icon:'clipboard',  color:'rgba(88,166,255,0.12)',  name:'Curriculum Builder',     desc:'Customise learning tracks for your class' },
      { page:'research', icon:'rotate-cw',  color:'rgba(227,179,65,0.12)',  name:'Repro Hub',              desc:'Share reproducible protocols' },
    ],
    Clinician: [
      { page:'learn',    icon:'heart-pulse',color:'rgba(255,107,107,0.12)', name:'Clinical Disease Profiles', desc:'Genomics of 22 diseases' },
      { page:'africa',   icon:'globe',      color:'rgba(249,115,22,0.12)',  name:'Africa Hub',             desc:'One Health · H3Africa governance' },
      { page:'learn',    icon:'cpu',        color:'rgba(63,185,80,0.12)',   name:'Clinical Tools',         desc:'Bioinformatics for the clinic' },
    ],
  };

  const TRACKS = [
    { id:'wgs',      name:'WGS Foundation',     icon:'dna',        color:'#3fb950', bg:'rgba(63,185,80,0.1)',   desc:'DNA extraction → GATK4 variant annotation',  steps:8,  page:'lab' },
    { id:'rnaseq',   name:'RNA-seq Essentials',  icon:'microscope', color:'#58a6ff', bg:'rgba(88,166,255,0.1)', desc:'FastQC → STAR → DESeq2 differential expression', steps:6, page:'lab' },
    { id:'africa',   name:'Africa Omics',        icon:'globe',      color:'#f97316', bg:'rgba(249,115,22,0.1)', desc:'H3Africa, AWI-Gen, population genomics',     steps:5,  page:'africa' },
    { id:'meta',     name:'Metagenomics Intro',  icon:'virus',      color:'#bc8cff', bg:'rgba(188,140,255,0.1)',desc:'Kraken2 · Bracken · community profiling',      steps:5,  page:'lab' },
    { id:'hpc',      name:'HPC & Pipelines',     icon:'cpu',        color:'#e3b341', bg:'rgba(227,179,65,0.1)', desc:'Slurm, Snakemake, Nextflow on HPC clusters',  steps:6,  page:'learn' },
    { id:'clinical', name:'Clinical Genomics',   icon:'heart-pulse',color:'#ff6b6b', bg:'rgba(255,107,107,0.1)',desc:'Variant interpretation for clinical practice', steps:4,  page:'learn' },
  ];

  const BADGES = [
    { id:'first_workflow', name:'First Workflow',  icon:'flask',      desc:'Complete your first simulation' },
    { id:'qc_master',      name:'QC Master',       icon:'bar-chart',  desc:'Score 95%+ on any workflow QC' },
    { id:'pipeline_pro',   name:'Pipeline Pro',    icon:'cpu',        desc:'Run 5 different pipelines' },
    { id:'africa_exp',     name:'Africa Explorer', icon:'globe',      desc:'Complete the Africa Hub tour' },
    { id:'researcher',     name:'Researcher',      icon:'search',     desc:'Design your first study' },
    { id:'instructor',     name:'Instructor',      icon:'layers',     desc:'Launch a workshop session' },
    { id:'speed_run',      name:'Speed Run',       icon:'zap',        desc:'Complete a workflow in < 5 min' },
    { id:'perfectionist',  name:'Perfectionist',   icon:'award',      desc:'Score 100% on any workflow' },
    { id:'multilingual',   name:'Multilingual',    icon:'globe',      desc:'Switch to 3+ languages' },
    { id:'night_owl',      name:'Night Owl',       icon:'eye',        desc:'Study past midnight' },
    { id:'streak_7',       name:'7-Day Streak',    icon:'flame',      desc:'Use OmicsLab 7 days in a row' },
    { id:'community',      name:'Community',       icon:'link',       desc:'Share your results' },
  ];

  /* ── Session time tracking ── */
  let _sessionStart = Date.now();

  function _commitTime() {
    const mins = Math.round((Date.now() - _sessionStart) / 60000);
    if (mins > 0) {
      const total = parseInt(localStorage.getItem(TIME_KEY) || '0');
      localStorage.setItem(TIME_KEY, String(total + mins));
      _sessionStart = Date.now();
    }
  }

  function getTotalTime() {
    return parseInt(localStorage.getItem(TIME_KEY) || '0');
  }

  function _formatTime(mins) {
    if (mins < 1)   return '< 1 min';
    if (mins < 60)  return mins + ' min';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? h + 'h ' + m + 'm' : h + 'h';
  }

  /* ── Streak tracking ── */
  function _updateStreak() {
    const today    = new Date().toISOString().slice(0, 10);
    const lastVisit = localStorage.getItem(LAST_VISIT_KEY);
    let streak = parseInt(localStorage.getItem(STREAK_KEY) || '1');

    if (lastVisit) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      if (lastVisit === yesterday) {
        streak += 1;
        if (streak >= 7) _awardBadge('streak_7');
      } else if (lastVisit !== today) {
        streak = 1;
      }
    }
    localStorage.setItem(STREAK_KEY, String(streak));
    localStorage.setItem(LAST_VISIT_KEY, today);
    return streak;
  }

  function getStreak() { return parseInt(localStorage.getItem(STREAK_KEY) || '1'); }

  /* ── Badge helpers ── */
  function _awardBadge(id) {
    const earned = _getEarnedBadges();
    if (!earned.includes(id)) {
      earned.push(id);
      localStorage.setItem(BADGES_KEY, JSON.stringify(earned));
    }
  }

  function _getEarnedBadges() {
    try { return JSON.parse(localStorage.getItem(BADGES_KEY) || '[]'); } catch { return []; }
  }

  /* Award first_workflow if any workflow completion score exists */
  function _checkAutoAwards() {
    if (localStorage.getItem('omicslab_last_score')) _awardBadge('first_workflow');
    /* Night owl */
    const h = new Date().getHours();
    if (h >= 0 && h < 5) _awardBadge('night_owl');
  }

  /* ── Profile helpers ── */
  function getProfile() {
    try { return JSON.parse(localStorage.getItem(KEY)); } catch { return null; }
  }

  function _countryFlag(name) {
    const c = COUNTRIES.find(c => c.name === name);
    return c ? c.flag : '';
  }

  function _initials(name) {
    return name.trim().split(/\s+/).slice(0, 2).map(w => w[0] || '').join('').toUpperCase() || 'U';
  }

  function _countWorkflows() {
    let count = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && (k.startsWith('omicslab_score_') || k.startsWith('omicslab_completed_'))) count++;
    }
    return count;
  }

  /* ── Personalize app after profile is set ── */
  function personalize(profile) {
    if (!profile) return;

    /* Nav user pill */
    const avatarEl = document.getElementById('nav-user-avatar');
    const nameEl   = document.getElementById('nav-user-name');
    if (avatarEl) avatarEl.textContent = _initials(profile.name || 'User');
    if (nameEl) {
      const parts = (profile.name || '').trim().split(/\s+/);
      nameEl.textContent = parts[0] + (parts[1] ? ' ' + parts[1][0] + '.' : '');
    }

    /* Hero personalised greeting */
    let welcomeEl = document.getElementById('hero-welcome');
    if (!welcomeEl) {
      welcomeEl = document.createElement('div');
      welcomeEl.id = 'hero-welcome';
      welcomeEl.className = 'hero-welcome';
      const badge = document.querySelector('.hero-badge');
      if (badge) badge.after(welcomeEl);
    }
    const firstName = (profile.name || '').trim().split(/\s+/)[0] || 'Researcher';
    const flag      = _countryFlag(profile.country);
    const isNew     = (Date.now() - (profile.createdAt || 0)) < 300000; /* within 5 min */
    const greeting  = isNew ? `Welcome to OmicsLab, ` : `Welcome back, `;
    welcomeEl.innerHTML = `<span class="hero-welcome-wave">${flag}</span> ${greeting}<span class="hero-welcome-name">${firstName}</span>`;
    welcomeEl.style.display = 'flex';
  }

  /* ── Save profile ── */
  function saveProfile(data) {
    const existing = getProfile() || {};
    const profile  = { ...existing, ...data, updatedAt: Date.now() };
    if (!existing.createdAt) profile.createdAt = Date.now();
    localStorage.setItem(KEY, JSON.stringify(profile));
    personalize(profile);
  }

  /* ════════════════════════════════════════════════════════
     SETUP MODAL
     ════════════════════════════════════════════════════════ */
  let _selectedRole = '';
  let _modalStep    = 1;

  function openSetupModal(prefill) {
    _selectedRole = prefill?.role || '';
    _modalStep    = 1;

    let overlay = document.getElementById('setup-modal-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'setup-modal-overlay';
      overlay.className = 'setup-modal-overlay';
      overlay.innerHTML = '<div id="setup-modal-card" class="setup-modal-card"></div>';
      document.body.appendChild(overlay);
    }
    overlay.removeAttribute('hidden');
    _renderModalStep(prefill);

    /* Close on backdrop click */
    overlay.addEventListener('click', e => { if (e.target === overlay) _skip(); });
  }

  function _renderModalStep(prefill) {
    const card = document.getElementById('setup-modal-card');
    if (!card) return;

    const countriesHTML = COUNTRIES.map(c =>
      c.divider
        ? `<option disabled>────────────────────</option>`
        : `<option value="${c.name}" ${prefill?.country === c.name ? 'selected' : ''}>${c.flag} ${c.name}</option>`
    ).join('');

    card.innerHTML = `
      <div class="sm-top">
        <div class="sm-logo">
          <span class="sm-logo-dot"></span>
          OmicsLab
        </div>
        <div class="sm-steps">
          <div class="sm-step done"></div>
          <div class="sm-step active"></div>
          <div class="sm-step"></div>
        </div>
      </div>

      <div class="sm-eyebrow">Getting started</div>
      <div class="sm-title">Tell us about yourself<br>so we can personalise your<br>experience</div>
      <div class="sm-sub">
        Your profile is stored locally on your device — nothing is sent to a server.
        You can update it anytime from your profile page.
      </div>

      <div class="sm-field-row">
        <div class="sm-field">
          <label class="sm-label" for="sm-name">Your full name</label>
          <input class="sm-input" id="sm-name" type="text" placeholder="e.g. Amara Osei" value="${prefill?.name || ''}" autocomplete="name" maxlength="80">
        </div>
        <div class="sm-field">
          <label class="sm-label" for="sm-institution">Institution / Organisation</label>
          <input class="sm-input" id="sm-institution" type="text" placeholder="e.g. University of Cape Town" value="${prefill?.institution || ''}" maxlength="100">
        </div>
      </div>

      <div class="sm-field">
        <label class="sm-label" for="sm-country">Country</label>
        <select class="sm-select" id="sm-country">
          <option value="">Select your country…</option>
          ${countriesHTML}
        </select>
      </div>

      <div class="sm-role-label">Your role</div>
      <div class="sm-roles" id="sm-roles">
        ${ROLES.map(r => `
          <button type="button" class="sm-role-card${_selectedRole === r.id ? ' selected' : ''}"
                  data-role="${r.id}" onclick="OmicsLab.Profile._selectRole('${r.id}')">
            <span class="sm-role-icon">${OmicsLab.Icons?.svg(r.icon,20)||''}</span>
            <span class="sm-role-text">
              <span class="sm-role-name">${r.id}</span>
              <span class="sm-role-desc">${r.desc}</span>
            </span>
          </button>`).join('')}
      </div>

      <button class="sm-submit" id="sm-submit" onclick="OmicsLab.Profile._submitSetup()">
        Start Learning →
      </button>
      <button class="sm-skip" onclick="OmicsLab.Profile._skip()">
        Skip for now — I'll set up my profile later
      </button>`;

    /* Autofocus name on open */
    setTimeout(() => { document.getElementById('sm-name')?.focus(); }, 120);
  }

  function _selectRole(roleId) {
    _selectedRole = roleId;
    document.querySelectorAll('.sm-role-card').forEach(c => {
      c.classList.toggle('selected', c.dataset.role === roleId);
    });
  }

  function _submitSetup() {
    const name        = document.getElementById('sm-name')?.value.trim();
    const institution = document.getElementById('sm-institution')?.value.trim();
    const country     = document.getElementById('sm-select')?.value || document.getElementById('sm-country')?.value;

    if (!name) {
      document.getElementById('sm-name')?.focus();
      _shake('sm-name');
      return;
    }
    if (!country) {
      document.getElementById('sm-country')?.focus();
      _shake('sm-country');
      return;
    }
    if (!_selectedRole) {
      _shake('sm-roles');
      return;
    }

    saveProfile({ name, institution: institution || '', country, role: _selectedRole });
    _closeModal();

    /* Show a welcome toast */
    _toast(`Welcome, ${name.split(' ')[0]}! Your profile has been saved.`);

    /* Auto-award if needed */
    _checkAutoAwards();

    /* Launch the guided tour after the modal closes */
    setTimeout(() => { OmicsLab.Tour && OmicsLab.Tour.start(); }, 650);
  }

  function _skip() {
    saveProfile({ name: 'Researcher', institution: '', country: '', role: 'Researcher', skipped: true });
    _closeModal();
  }

  function _closeModal() {
    const overlay = document.getElementById('setup-modal-overlay');
    if (overlay) overlay.setAttribute('hidden', '');
  }

  function _shake(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.style.animation = 'none';
    el.offsetHeight; /* reflow */
    el.style.animation = 'shakeField 0.35s ease';
    setTimeout(() => { el.style.animation = ''; }, 400);
  }

  /* ════════════════════════════════════════════════════════
     PROFILE PAGE
     ════════════════════════════════════════════════════════ */
  function openProfile() {
    const wrap = document.getElementById('profile-page-content');
    if (!wrap) return;

    const profile    = getProfile() || { name:'Researcher', role:'Researcher', country:'', institution:'' };
    const totalTime  = getTotalTime();
    const streak     = getStreak();
    const earnedBadges = _getEarnedBadges();
    const workflows  = _countWorkflows();
    const recs       = ROLE_RECS[profile.role] || ROLE_RECS.Student;
    const flag       = _countryFlag(profile.country);
    const joinedDate = profile.createdAt
      ? new Date(profile.createdAt).toLocaleDateString('en-GB', { month:'long', year:'numeric' })
      : 'Recently';

    /* Read track progress from localStorage */
    const trackProgress = TRACKS.map(t => {
      const done = parseInt(localStorage.getItem('omicslab_track_' + t.id) || '0');
      const pct  = Math.min(100, Math.round((done / t.steps) * 100));
      return { ...t, done, pct };
    });

    wrap.innerHTML = `
      <!-- Profile header -->
      <div class="profile-header-card">
        <div class="profile-avatar">${_initials(profile.name)}</div>
        <div class="profile-info">
          <div class="profile-name">${_esc(profile.name)}</div>
          <div class="profile-meta">
            ${profile.institution ? `<span class="profile-meta-item">${OmicsLab.Icons?.svg('layers',12)||''} ${_esc(profile.institution)}</span>` : ''}
            ${profile.country    ? `<span class="profile-meta-item">${flag} ${_esc(profile.country)}</span>` : ''}
            <span class="profile-role-pill role-pill-${profile.role}">${profile.role}</span>
          </div>
          <div class="profile-joined">Member since ${joinedDate}</div>
        </div>
        <button class="profile-edit-btn" onclick="OmicsLab.Profile.openSetupModal(OmicsLab.Profile.getProfile())">
          <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          Edit Profile
        </button>
      </div>

      <!-- Stats row -->
      <div class="profile-stats-row">
        <div class="profile-stat">
          <div class="profile-stat-num">${_formatTime(totalTime).split(' ')[0]}<span class="acc">${totalTime < 60 ? '' : 'h'}</span></div>
          <div class="profile-stat-label">Time studying</div>
        </div>
        <div class="profile-stat">
          <div class="profile-stat-num">${workflows}<span class="acc">+</span></div>
          <div class="profile-stat-label">Workflows completed</div>
        </div>
        <div class="profile-stat">
          <div class="profile-stat-num">${earnedBadges.length}<span class="acc">/${BADGES.length}</span></div>
          <div class="profile-stat-label">Badges earned</div>
        </div>
        <div class="profile-stat">
          <div class="profile-stat-num">${streak}<span class="acc" style="display:inline-flex;vertical-align:middle;color:#f97316">${OmicsLab.Icons?.svg('flame',14)||''}</span></div>
          <div class="profile-stat-label">Day streak</div>
        </div>
      </div>

      <!-- Recommendations -->
      <div class="profile-sec-head">
        <div class="profile-sec-title">Recommended for ${_esc(profile.name.split(' ')[0])}</div>
        <span class="profile-sec-count">${profile.role}</span>
      </div>
      <div class="recs-grid">
        ${recs.map(r => `
          <button class="rec-card" onclick="OmicsLab.Router&&OmicsLab.Router.navigate('${r.page}')">
            <span class="rec-icon" style="background:${r.color}">${OmicsLab.Icons?.svg(r.icon,18)||''}</span>
            <span class="rec-text">
              <span class="rec-name">${r.name}</span>
              <span class="rec-desc">${r.desc}</span>
            </span>
          </button>`).join('')}
      </div>

      <!-- Curriculum progress -->
      <div class="profile-sec-head">
        <div class="profile-sec-title">Curriculum Progress</div>
        <span class="profile-sec-count">${trackProgress.filter(t => t.pct > 0).length} started</span>
      </div>
      <div class="tracks-grid">
        ${trackProgress.map(t => `
          <div class="track-card">
            <div class="track-card-head">
              <div class="track-card-left">
                <span class="track-icon" style="background:${t.bg};color:${t.color}">${OmicsLab.Icons?.svg(t.icon,18)||''}</span>
                <span class="track-name">${t.name}</span>
              </div>
              <span class="track-pct" style="color:${t.color}">${t.pct}%</span>
            </div>
            <div class="track-desc">${t.desc}</div>
            <div class="track-bar-wrap">
              <div class="track-bar-bg">
                <div class="track-bar-fill" style="width:${t.pct}%;background:${t.color}"></div>
              </div>
              <div class="track-meta-row">
                <span>${t.done} / ${t.steps} steps</span>
                <span>${t.pct === 100 ? '[OK] Complete' : t.pct > 0 ? 'In progress' : 'Not started'}</span>
              </div>
            </div>
            <button class="track-cta-btn" style="color:${t.color}" onclick="OmicsLab.Router&&OmicsLab.Router.navigate('${t.page}')">
              ${t.pct === 0 ? 'Start track' : t.pct === 100 ? 'Review' : 'Continue'}
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </div>`).join('')}
      </div>

      <!-- Badges -->
      <div class="profile-sec-head">
        <div class="profile-sec-title">Badges</div>
        <span class="profile-sec-count">${earnedBadges.length} earned</span>
      </div>
      <div class="badges-grid">
        ${BADGES.map(b => {
          const isEarned = earnedBadges.includes(b.id);
          return `<div class="badge-tile ${isEarned ? 'earned' : 'locked'}" title="${b.desc}">
            ${isEarned ? `<div class="badge-earned-star">${OmicsLab.Icons?.svg('check-circle',12)||''}</div>` : ''}
            <div class="badge-tile-icon">${OmicsLab.Icons?.svg(b.icon,24)||''}</div>
            <div class="badge-tile-name">${b.name}</div>
          </div>`;
        }).join('')}
      </div>`;

    /* Animate progress bars on next frame */
    requestAnimationFrame(() => {
      wrap.querySelectorAll('.track-bar-fill').forEach(el => {
        const w = el.style.width;
        el.style.width = '0%';
        setTimeout(() => { el.style.width = w; }, 50);
      });
    });
  }

  /* ── Toast notification ── */
  function _toast(msg) {
    OmicsLab.Notify.success(msg);
  }

  /* ── HTML escape ── */
  function _esc(s) {
    return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  /* ── Public init ── */
  function init() {
    /* Time tracking */
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') _commitTime();
    });
    window.addEventListener('beforeunload', _commitTime);

    /* Streak */
    _updateStreak();
    _checkAutoAwards();

    /* Personalize or show first-visit modal */
    const profile = getProfile();
    if (profile) {
      personalize(profile);
    } else {
      setTimeout(openSetupModal, 900);
    }
  }

  /* Expose internal helpers needed by inline onclick handlers */
  return {
    init,
    getProfile,
    saveProfile,
    personalize,
    openSetupModal,
    openProfile,
    getTotalTime,
    getStreak,
    /* Private methods called from inline HTML */
    _selectRole,
    _submitSetup,
    _skip,
    _awardBadge,
  };

})();
