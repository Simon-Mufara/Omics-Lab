/* ═══════════════════════════════════════════════════════════════
   OmicsLab — Institution Admin Mode (Prompt 48)
   ─ Institution code creation and student cohort management
   ─ Instructor dashboard: aggregated progress, offline P2P
   ─ 12-week cohort curriculum + student progress import/export
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.Institution = (function () {

  const INST_KEY      = 'omicslab_institution_v1';
  const COHORT_KEY    = 'omicslab_cohort_students_v1';
  const ROLE_KEY      = 'omicslab_inst_role';  /* 'admin' | 'student' */

  /* ─── 12-week cohort curriculum ─── */
  const CURRICULUM_12W = [
    { week:1,  title:'Foundations of Genomics',     modules:['lab','learn'],       goal:'Navigate OmicsLab · understand WGS/RNA-seq concepts',    quiz:'Genomics basics quiz (Q1–10)' },
    { week:2,  title:'DNA Extraction & QC',          modules:['lab','qualitypredictor'], goal:'Complete DNA extraction workflow · interpret QC metrics', quiz:'QC metrics assessment' },
    { week:3,  title:'Sequencing Technologies',      modules:['learn','nanopore'], goal:'Compare Illumina vs Nanopore · complete Nanopore QC',      quiz:'Sequencing platforms quiz' },
    { week:4,  title:'Read Alignment & Variant Calling', modules:['analysis','variantinterp'], goal:'Run alignment pipeline · interpret first VCF',          quiz:'GATK variant calling quiz' },
    { week:5,  title:'ACMG Variant Classification',  modules:['variantinterp','variant-atlas'], goal:'Classify 5 variants using ACMG criteria · use Variant Atlas', quiz:'ACMG criteria assessment' },
    { week:6,  title:'Africa Genomics Context',      modules:['africa','h3africa','knowledge-graph'], goal:'Explore H3Africa portal · trace 3 Africa-specific variants', quiz:'Africa genomics quiz' },
    { week:7,  title:'RNA-seq Analysis',             modules:['heatmap','analysis','pathways'], goal:'Run DE analysis · build volcano plot · pathway enrichment', quiz:'DESeq2 interpretation quiz' },
    { week:8,  title:'Phylogenomics & Outbreak',     modules:['phylo','outbreak'],  goal:'Build NJ phylo tree · run full outbreak simulation',        quiz:'Phylogenomics quiz' },
    { week:9,  title:'Clinical Genomics',            modules:['clinical-decision','variantinterp'], goal:'Complete 3 clinical decision scenarios · write brief report', quiz:'Clinical interpretation assessment' },
    { week:10, title:'Bioinformatics Pipelines',     modules:['pipeline-gen','terminal'], goal:'Generate Nextflow + Snakemake pipeline · run terminal scripts', quiz:'Pipeline design assessment' },
    { week:11, title:'Research & Communication',     modules:['labnotebook','grant','peerreview'], goal:'Create 3 lab notebook entries · draft grant aims · peer review', quiz:'Research skills quiz' },
    { week:12, title:'Final Project & Certification',modules:['certification','skill-tree'], goal:'Complete all certification modules · unlock 3 skill tree nodes', quiz:'Final comprehensive assessment' },
  ];

  /* ─── State helpers ─── */
  function _loadInstitution() {
    const raw = localStorage.getItem(INST_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  function _saveInstitution(inst) {
    localStorage.setItem(INST_KEY, JSON.stringify(inst));
  }

  function _loadStudents() {
    const raw = localStorage.getItem(COHORT_KEY);
    return raw ? JSON.parse(raw) : [];
  }

  function _saveStudents(arr) {
    localStorage.setItem(COHORT_KEY, JSON.stringify(arr));
  }

  function getRole() { return localStorage.getItem(ROLE_KEY) || 'student'; }
  function isAdmin()  { return getRole() === 'admin'; }

  /* ─── Generate institution code ─── */
  function _genCode(name) {
    const slug = name.toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,8);
    const rand = Math.random().toString(36).slice(2,6).toUpperCase();
    return `${slug}-${rand}`;
  }

  /* ─── Main render ─── */
  function render(container) {
    const inst = _loadInstitution();
    const role = getRole();

    if (!inst) {
      _renderSetup(container);
    } else if (role === 'admin') {
      _renderAdminDashboard(container);
    } else {
      _renderStudentView(container);
    }
  }

  /* ─── Setup screen ─── */
  function _renderSetup(container) {
    container.innerHTML = `
      <div class="in-wrap">
        <div class="in-hero">
          <div class="in-hero-icon">${OmicsLab.Icons?.svg('layers',32)||''}</div>
          <div>
            <h2 class="in-hero-title">Institution Mode</h2>
            <p class="in-hero-sub">Manage a cohort of students, track their OmicsLab progress offline, and run a 12-week structured genomics curriculum — no server required.</p>
          </div>
        </div>

        <div class="in-setup-grid">
          <!-- Create institution (admin) -->
          <div class="in-setup-card">
            <div class="in-setup-icon">${OmicsLab.Icons?.svg('award',24)||''}</div>
            <h3 class="in-setup-card-title">I'm an Instructor</h3>
            <p class="in-setup-card-desc">Create an institution, generate a cohort code, and share it with students to track their progress.</p>
            <div class="in-field">
              <label class="in-label">Institution Name</label>
              <input class="in-input" id="in-inst-name" type="text" placeholder="e.g. UCT Department of Bioinformatics">
            </div>
            <div class="in-field">
              <label class="in-label">Your Name</label>
              <input class="in-input" id="in-admin-name" type="text" placeholder="Your full name">
            </div>
            <div class="in-field">
              <label class="in-label">Country</label>
              <input class="in-input" id="in-admin-country" type="text" placeholder="e.g. South Africa">
            </div>
            <button class="btn btn-primary in-btn" onclick="OmicsLab.Institution._createInstitution()">
              ${OmicsLab.Icons?.svg('check-circle',14)||''} Create Institution
            </button>
          </div>

          <!-- Join institution (student) -->
          <div class="in-setup-card">
            <div class="in-setup-icon">${OmicsLab.Icons?.svg('users',24)||''}</div>
            <h3 class="in-setup-card-title">I'm a Student</h3>
            <p class="in-setup-card-desc">Enter the cohort code your instructor shared to join their cohort and sync your progress.</p>
            <div class="in-field">
              <label class="in-label">Cohort Code</label>
              <input class="in-input" id="in-cohort-code" type="text" placeholder="e.g. UCT-BIOINF-A1B2" style="text-transform:uppercase">
            </div>
            <div class="in-field">
              <label class="in-label">Your Name</label>
              <input class="in-input" id="in-student-name" type="text" placeholder="Your full name">
            </div>
            <button class="btn btn-ghost in-btn" onclick="OmicsLab.Institution._joinInstitution()">
              ${OmicsLab.Icons?.svg('link',14)||''} Join Cohort
            </button>
          </div>
        </div>
      </div>
    `;
  }

  function _createInstitution() {
    const name    = document.getElementById('in-inst-name')?.value.trim();
    const admin   = document.getElementById('in-admin-name')?.value.trim();
    const country = document.getElementById('in-admin-country')?.value.trim();
    if (!name || !admin) { OmicsLab.Toast?.show('Enter institution name and your name', 'warning'); return; }
    const code = _genCode(name);
    const inst = { name, admin, country, code, created: Date.now(), cohortWeek: 1 };
    _saveInstitution(inst);
    localStorage.setItem(ROLE_KEY, 'admin');
    render(document.querySelector('.in-wrap')?.parentElement || document.getElementById('institution-section'));
  }

  function _joinInstitution() {
    const code   = document.getElementById('in-cohort-code')?.value.trim().toUpperCase();
    const sname  = document.getElementById('in-student-name')?.value.trim();
    if (!code || !sname) { OmicsLab.Toast?.show('Enter cohort code and your name', 'warning'); return; }
    const inst = { name: 'Joined Cohort', admin: 'Instructor', country: '', code, created: Date.now(), cohortWeek: 1 };
    _saveInstitution(inst);
    localStorage.setItem(ROLE_KEY, 'student');
    localStorage.setItem('omicslab_student_name', sname);
    render(document.querySelector('.in-wrap')?.parentElement || document.getElementById('institution-section'));
  }

  /* ─── Admin Dashboard ─── */
  function _renderAdminDashboard(container) {
    const inst = _loadInstitution();
    const students = _loadStudents();
    const stats = _computeCohortWeekProgress(students);
    const activeWeek = CURRICULUM_12W.find(w => w.week === inst.cohortWeek) || CURRICULUM_12W[0];
    const weeksPct = Math.round(((inst.cohortWeek - 1) / 12) * 100);
    const avgXP = stats.avgXP || 0;
    const totalCerts = students.reduce((s, x) => s + (x.certCount || 0), 0);
    const avgSkills = students.length ? Math.round(students.reduce((s, x) => s + (x.skillCount || 0), 0) / students.length) : 0;

    container.innerHTML = `
      <div class="in-wrap">

        <!-- Dashboard header -->
        <div class="in-dash-header">
          <div class="in-dash-hdr-left">
            <div class="in-dash-title">${inst.name}</div>
            <div class="in-dash-meta">
              Instructor: <strong>${inst.admin}</strong>
              &nbsp;·&nbsp; ${inst.country || 'Africa'}
              &nbsp;·&nbsp; Week ${inst.cohortWeek}/12
            </div>
          </div>
          <div class="in-dash-hdr-right">
            <div class="in-code-pill" title="Share this code with students">
              <span class="in-code-label">Cohort Code</span>
              <span class="in-code-val">${inst.code}</span>
              <button class="in-code-copy" onclick="navigator.clipboard?.writeText('${inst.code}').then(()=>OmicsLab.Toast?.show('Copied!','success'))" aria-label="Copy code">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
              </button>
            </div>
            <button class="in-reset-btn" onclick="OmicsLab.Institution._resetInstitution()">Leave Institution</button>
          </div>
        </div>

        <!-- KPI strip -->
        <div class="in-kpi-strip">
          <div class="in-kpi">
            <div class="in-kpi-val">${students.length}</div>
            <div class="in-kpi-label">Students enrolled</div>
          </div>
          <div class="in-kpi">
            <div class="in-kpi-val">${inst.cohortWeek}<span class="in-kpi-of">/12</span></div>
            <div class="in-kpi-label">Week in programme</div>
          </div>
          <div class="in-kpi">
            <div class="in-kpi-val">${avgXP}</div>
            <div class="in-kpi-label">Avg XP per student</div>
          </div>
          <div class="in-kpi">
            <div class="in-kpi-val">${avgSkills}</div>
            <div class="in-kpi-label">Avg skills unlocked</div>
          </div>
          <div class="in-kpi">
            <div class="in-kpi-val">${totalCerts}</div>
            <div class="in-kpi-label">Certificates earned</div>
          </div>
        </div>

        <!-- Programme progress bar -->
        <div class="in-prog-bar-wrap">
          <div class="in-prog-bar-hdr">
            <span class="in-prog-bar-label">Programme progress — Week ${inst.cohortWeek} of 12: <strong>${activeWeek.title}</strong></span>
            <span class="in-prog-bar-pct">${weeksPct}%</span>
          </div>
          <div class="in-prog-bar-track">
            <div class="in-prog-bar-fill" style="width:${weeksPct}%"></div>
          </div>
          <div class="in-prog-bar-goal">${activeWeek.goal}</div>
        </div>

        <!-- Two-column layout: curriculum + students -->
        <div class="in-dash-body">

          <!-- Curriculum column -->
          <div class="in-curriculum">
            <div class="in-section-hdr">
              <h3 class="in-section-title">12-Week Curriculum</h3>
              ${inst.cohortWeek < 12 ? `<button class="in-advance-btn" onclick="OmicsLab.Institution._advanceWeek()">Advance to Week ${inst.cohortWeek + 1} →</button>` : '<span class="in-complete-badge">Programme complete</span>'}
            </div>
            <div class="in-weeks">
              ${CURRICULUM_12W.map(w => {
                const isActive = w.week === inst.cohortWeek;
                const isDone   = w.week < inst.cohortWeek;
                return `
                  <div class="in-week${isActive ? ' in-week-active' : ''}${isDone ? ' in-week-done' : ''}">
                    <div class="in-week-dot">${isDone
                      ? '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>'
                      : w.week}</div>
                    <div class="in-week-body">
                      <div class="in-week-title">${w.title}</div>
                      ${isActive ? `<div class="in-week-modules">${w.modules.map(m => `<button class="in-mod-btn" onclick="OmicsLab.Router?.navigate('${m}')">${m}</button>`).join('')}</div>` : ''}
                    </div>
                  </div>`;
              }).join('')}
            </div>
          </div>

          <!-- Students column -->
          <div class="in-students">
            <div class="in-section-hdr">
              <h3 class="in-section-title">Cohort Progress</h3>
              <div class="in-students-actions">
                <button class="in-ghost-btn" onclick="OmicsLab.Institution._importStudent()">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  Import
                </button>
                <button class="in-primary-btn" onclick="OmicsLab.Institution._exportCohortReport()">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  Export CSV
                </button>
              </div>
            </div>
            ${students.length === 0 ? `
              <div class="in-no-students">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#484f58" stroke-width="1.5" stroke-linecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                <div class="in-no-students-text">No students yet.</div>
                <div class="in-no-students-hint">Share your cohort code <strong>${inst.code}</strong> with students. They open Institution Mode, enter the code, complete modules, then export their progress file to you.</div>
              </div>
            ` : `
              <div class="in-table-wrap">
                <table class="in-table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>XP</th>
                      <th>Skills</th>
                      <th>Certs</th>
                      <th>Last active</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${students.map(s => {
                      const xpPct = Math.min(100, Math.round((s.xp || 0) / 5));
                      return `
                        <tr>
                          <td>
                            <div class="in-student-av">${s.name.charAt(0).toUpperCase()}</div>
                            <span class="in-student-name">${s.name}</span>
                          </td>
                          <td>
                            <div class="in-xp-wrap">
                              <span class="in-xp-num">${s.xp || 0}</span>
                              <div class="in-xp-bar"><div class="in-xp-fill" style="width:${xpPct}%"></div></div>
                            </div>
                          </td>
                          <td>${s.skillCount || 0}</td>
                          <td>${s.certCount || 0}</td>
                          <td class="in-date">${s.lastActive ? new Date(s.lastActive).toLocaleDateString() : '—'}</td>
                        </tr>`;
                    }).join('')}
                  </tbody>
                </table>
              </div>
            `}
          </div>

        </div><!-- end in-dash-body -->

        <!-- Upgrade notice (shown when on free/community tier) -->
        <div class="in-upgrade-notice">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#58a6ff" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <span>You are on the <strong>Community</strong> tier. <a class="in-upgrade-link" onclick="OmicsLab.Router?.navigate('pricing')">Upgrade to Campus License</a> to unlock branded certificates, a shareable progress dashboard link, and priority support.</span>
        </div>

      </div>
    `;
  }

  /* ─── Student View ─── */
  function _renderStudentView(container) {
    const inst = _loadInstitution();
    const sname = localStorage.getItem('omicslab_student_name') || 'Student';
    const xpState = JSON.parse(localStorage.getItem('omicslab_xp_v1') || '{"xp":0}');
    const skills  = JSON.parse(localStorage.getItem('omicslab_skills_v1') || '[]');
    const certs   = JSON.parse(localStorage.getItem('omicslab_certification') || '{"completed":{}}');
    const certCount = Object.keys(certs.completed || {}).length;

    container.innerHTML = `
      <div class="in-wrap">
        <div class="in-student-banner">
          <div class="in-student-av">${sname.charAt(0).toUpperCase()}</div>
          <div>
            <div class="in-student-greeting">Welcome, ${sname}</div>
            <div class="in-student-cohort">Cohort: <strong>${inst.code}</strong> · ${inst.name}</div>
          </div>
          <button class="btn btn-ghost btn-sm" onclick="OmicsLab.Institution._resetInstitution()">Leave</button>
        </div>

        <div class="in-student-stats">
          <div class="in-stat-card"><div class="in-stat-val">${xpState.xp || 0}</div><div class="in-stat-label">XP Earned</div></div>
          <div class="in-stat-card"><div class="in-stat-val">${skills.length}</div><div class="in-stat-label">Skills Unlocked</div></div>
          <div class="in-stat-card"><div class="in-stat-val">${certCount}</div><div class="in-stat-label">Certificates</div></div>
        </div>

        <div class="in-export-section">
          <h3 class="in-section-title">${OmicsLab.Icons?.svg('package',14)||''} Share Progress with Instructor</h3>
          <p class="in-export-desc">Export your progress data and send it to your instructor. They import it into their dashboard to track your cohort performance.</p>
          <button class="btn btn-primary" onclick="OmicsLab.Institution._exportStudentData()">
            ${OmicsLab.Icons?.svg('trending-up',14)||''} Export My Progress
          </button>
        </div>

        <div class="in-curriculum-student">
          <h3 class="in-section-title">${OmicsLab.Icons?.svg('layers',14)||''} Your 12-Week Plan</h3>
          <div class="in-weeks">
            ${CURRICULUM_12W.map(w => `
              <div class="in-week-mini">
                <div class="in-week-num-mini">W${w.week}</div>
                <div class="in-week-mini-content">
                  <div class="in-week-title">${w.title}</div>
                  <div class="in-week-modules">${w.modules.map(m => `<button class="btn btn-ghost btn-xs" onclick="OmicsLab.Router?.navigate('${m}')">${m}</button>`).join('')}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  /* ─── Actions ─── */
  function _advanceWeek() {
    const inst = _loadInstitution();
    if (!inst) return;
    inst.cohortWeek = Math.min((inst.cohortWeek || 1) + 1, 12);
    _saveInstitution(inst);
    render(document.getElementById('institution-section'));
  }

  function _exportStudentData() {
    const sname   = localStorage.getItem('omicslab_student_name') || 'Student';
    const inst    = _loadInstitution();
    const xpState = JSON.parse(localStorage.getItem('omicslab_xp_v1') || '{"xp":0}');
    const skills  = JSON.parse(localStorage.getItem('omicslab_skills_v1') || '[]');
    const certs   = JSON.parse(localStorage.getItem('omicslab_certification') || '{"completed":{}}');
    const payload = {
      schemaVersion: '1.0',
      name: sname,
      cohortCode: inst?.code || '',
      exportedAt: new Date().toISOString(),
      xp: xpState.xp || 0,
      skillCount: skills.length,
      certCount: Object.keys(certs.completed || {}).length,
      lastActive: Date.now(),
      skills,
      certCompleted: Object.keys(certs.completed || {}),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `omicslab-progress-${sname.replace(/\s/g,'-')}-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    OmicsLab.Toast?.show('Progress exported — send this file to your instructor', 'success');
  }

  function _importStudent() {
    const inp = document.createElement('input');
    inp.type = 'file';
    inp.accept = '.json';
    inp.onchange = e => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = ev => {
        try {
          const data = JSON.parse(ev.target.result);
          if (!data.schemaVersion || !data.name) throw new Error('Invalid format');
          const students = _loadStudents();
          const idx = students.findIndex(s => s.name === data.name);
          const entry = { name: data.name, xp: data.xp, skillCount: data.skillCount, certCount: data.certCount, lastActive: data.lastActive };
          if (idx >= 0) students[idx] = entry;
          else students.push(entry);
          _saveStudents(students);
          OmicsLab.Toast?.show(`Imported progress for ${data.name}`, 'success');
          render(document.getElementById('institution-section'));
        } catch { OmicsLab.Toast?.show('Invalid student export file', 'error'); }
      };
      reader.readAsText(file);
    };
    inp.click();
  }

  function _exportCohortReport() {
    const inst = _loadInstitution();
    const students = _loadStudents();
    const lines = [
      `OmicsLab Cohort Report — ${inst?.name || 'Unknown'}`,
      `Code: ${inst?.code} | Exported: ${new Date().toISOString()}`,
      '',
      'Student,XP,Skills,Certificates,Last Active',
      ...students.map(s => `${s.name},${s.xp||0},${s.skillCount||0},${s.certCount||0},${s.lastActive?new Date(s.lastActive).toLocaleDateString():'—'}`),
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `cohort-report-${(inst?.code||'cohort')}-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function _resetInstitution() {
    if (!confirm('Leave institution mode? Your personal progress will not be affected.')) return;
    localStorage.removeItem(INST_KEY);
    localStorage.removeItem(COHORT_KEY);
    localStorage.removeItem(ROLE_KEY);
    render(document.getElementById('institution-section'));
  }

  function _computeCohortWeekProgress(students) {
    if (!students.length) return {};
    return { avgXP: Math.round(students.reduce((s, x) => s + (x.xp || 0), 0) / students.length) };
  }

  return { render, getRole, isAdmin, _createInstitution, _joinInstitution, _advanceWeek, _exportStudentData, _importStudent, _exportCohortReport, _resetInstitution };
})();
