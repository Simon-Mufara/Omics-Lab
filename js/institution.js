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
    const weekProgress = _computeCohortWeekProgress(students);

    container.innerHTML = `
      <div class="in-wrap">
        <div class="in-dash-header">
          <div>
            <h2 class="in-dash-title">${inst.name}</h2>
            <div class="in-dash-meta">Admin: ${inst.admin} · Cohort Code: <strong class="in-code">${inst.code}</strong> · ${students.length} student${students.length!==1?'s':''}</div>
          </div>
          <button class="btn btn-ghost btn-sm" onclick="OmicsLab.Institution._resetInstitution()" title="Leave/reset institution mode">Reset</button>
        </div>

        <!-- Cohort code QR area -->
        <div class="in-code-share">
          <div class="in-code-badge">${inst.code}</div>
          <div class="in-code-hint">Share this code with students so they can join your cohort and sync their progress to you.</div>
          <button class="btn btn-ghost btn-sm" onclick="navigator.clipboard?.writeText('${inst.code}').then(()=>OmicsLab.Toast?.show('Code copied!','success'))">
            ${OmicsLab.Icons?.svg('clipboard',13)||''} Copy Code
          </button>
        </div>

        <!-- 12-week curriculum tracker -->
        <div class="in-curriculum">
          <h3 class="in-section-title">${OmicsLab.Icons?.svg('layers',14)||''} 12-Week Cohort Curriculum</h3>
          <div class="in-weeks">
            ${CURRICULUM_12W.map(w => {
              const isActive = w.week === inst.cohortWeek;
              const isDone   = w.week < inst.cohortWeek;
              return `
                <div class="in-week${isActive?' in-week-active':''}${isDone?' in-week-done':''}">
                  <div class="in-week-num">W${w.week}</div>
                  <div class="in-week-body">
                    <div class="in-week-title">${w.title}</div>
                    ${isActive ? `<div class="in-week-goal">${w.goal}</div>` : ''}
                  </div>
                  ${isActive ? `<button class="btn btn-primary btn-sm" onclick="OmicsLab.Institution._advanceWeek()">Next Week →</button>` : ''}
                  ${isDone ? `<span class="in-week-check">${OmicsLab.Icons?.svg('check-circle',14)||''}</span>` : ''}
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Student progress table -->
        <div class="in-students">
          <div class="in-students-header">
            <h3 class="in-section-title">${OmicsLab.Icons?.svg('users',14)||''} Student Progress</h3>
            <div class="in-students-actions">
              <button class="btn btn-ghost btn-sm" onclick="OmicsLab.Institution._importStudent()">
                ${OmicsLab.Icons?.svg('package',13)||''} Import Student Export
              </button>
              <button class="btn btn-primary btn-sm" onclick="OmicsLab.Institution._exportCohortReport()">
                ${OmicsLab.Icons?.svg('trending-up',13)||''} Export Cohort Report
              </button>
            </div>
          </div>
          ${students.length === 0 ? `
            <div class="in-no-students">
              <div>${OmicsLab.Icons?.svg('users',28)||''}</div>
              <div>No students yet. Share your cohort code <strong>${inst.code}</strong> to get started. Students export their data and you import it here.</div>
            </div>
          ` : `
            <table class="in-table">
              <thead><tr><th>Student</th><th>XP</th><th>Skills</th><th>Certs</th><th>Last Active</th></tr></thead>
              <tbody>
                ${students.map(s => `
                  <tr>
                    <td class="in-student-name">${s.name}</td>
                    <td class="in-student-xp">${s.xp || 0} XP</td>
                    <td>${s.skillCount || 0} unlocked</td>
                    <td>${s.certCount || 0}</td>
                    <td class="in-student-date">${s.lastActive ? new Date(s.lastActive).toLocaleDateString() : '—'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          `}
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
