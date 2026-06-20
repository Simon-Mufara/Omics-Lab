/* ═══════════════════════════════════════════════════════════════
   OmicsLab — Workshop / Instructor Mode
   Create session codes, track cohort progress, export attendance
   reports, and manage workshop delivery.
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.Workshop = (function () {

  const STORE_KEY = 'omicslab_workshop_v1';

  const MODULES = [
    { id: 'disease-explorer',  label: 'Disease Explorer',   section: 'disease-explorer-section' },
    { id: 'learning-journey',  label: 'Learning Journey',   section: 'disease-learning-section' },
    { id: 'workflow-sim',      label: 'Workflow Simulation', section: 'domain-section' },
    { id: 'pipeline-guide',    label: 'Pipeline Guide',     section: 'bioinfo-pipeline-section' },
    { id: 'hpc-training',      label: 'HPC Training',       section: 'hpc-training-section' },
    { id: 'repro-hub',         label: 'Repro Hub',          section: 'repro-hub-section' },
    { id: 'africa-hub',        label: 'Africa Science Hub', section: 'africa-hub-section' },
    { id: 'equipment-gallery', label: 'Equipment Gallery',  section: 'equipment-gallery-section' }
  ];

  /* ─── Storage ─── */
  function _load() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY) || 'null') || { sessions: {}, activeSession: null }; }
    catch { return { sessions: {}, activeSession: null }; }
  }
  function _save(data) { try { localStorage.setItem(STORE_KEY, JSON.stringify(data)); } catch {} }

  /* ─── Session management ─── */
  function createSession() {
    const name     = (document.getElementById('ws-session-name') || {}).value || '';
    const location = (document.getElementById('ws-location') || {}).value || '';
    const date     = (document.getElementById('ws-date') || {}).value || new Date().toISOString().slice(0,10);
    const track    = (document.getElementById('ws-track') || {}).value || 'bioinformatics';

    if (!name.trim()) { alert('Please enter a session name.'); return; }

    const code = _genCode();
    const data = _load();
    data.sessions[code] = {
      code, name: name.trim(), location: location.trim(), date, track,
      created: new Date().toISOString(), students: [], modulesRequired: MODULES.map(m => m.id)
    };
    data.activeSession = code;
    _save(data);
    if (OmicsLab.Badges) OmicsLab.Badges.unlock('workshop-host');
    _refresh();
    alert(`Session created! Code: ${code}\nShare this code with your students so they can join.`);
  }

  function joinSession() {
    const code = ((document.getElementById('ws-join-code') || {}).value || '').trim().toUpperCase();
    const name = ((document.getElementById('ws-student-name') || {}).value || '').trim();
    if (!code || !name) { alert('Enter both session code and your name.'); return; }
    const data = _load();
    const session = data.sessions[code];
    if (!session) { alert('Session not found. Check the code and try again.'); return; }
    if (!session.students.find(s => s.name === name)) {
      session.students.push({ name, joined: new Date().toISOString(), completed: [] });
    }
    data.activeSession = code;
    _save(data);
    _refresh();
    alert(`Joined session "${session.name}". Good luck!`);
  }

  function markModuleDone(moduleId) {
    const data = _load();
    const session = data.sessions[data.activeSession];
    if (!session) return;
    const studentName = _getCurrentStudentName();
    let student = session.students.find(s => s.name === studentName);
    if (!student) {
      student = { name: studentName, joined: new Date().toISOString(), completed: [] };
      session.students.push(student);
    }
    if (!student.completed.includes(moduleId)) {
      student.completed.push(moduleId);
    }
    _save(data);
    _refresh();
    const mod = MODULES.find(m => m.id === moduleId);
    if (mod && OmicsLab.App) OmicsLab.App.scrollTo(mod.section);
    if (session.students.length >= 5) OmicsLab.Badges && OmicsLab.Badges.unlock('cohort-complete');
  }

  function _getCurrentStudentName() {
    const data = _load();
    const session = data.sessions[data.activeSession];
    if (!session || !session.students.length) return 'Instructor';
    return session.students[session.students.length - 1].name;
  }

  function _genCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  }

  /* ─── Export ─── */
  function exportReport() {
    const data = _load();
    const code = data.activeSession;
    const session = code ? data.sessions[code] : null;
    if (!session) { alert('No active session to export.'); return; }

    const rows = [['Student Name', 'Joined', ...MODULES.map(m => m.label), 'Completed', 'Completion %']];
    session.students.forEach(s => {
      const pct = Math.round(s.completed.length / MODULES.length * 100);
      rows.push([s.name, s.joined.slice(0,10), ...MODULES.map(m => s.completed.includes(m.id) ? '[OK]' : ''), s.completed.length, pct + '%']);
    });

    const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    const a = document.createElement('a');
    a.href = blob; a.download = `workshop-${code}-report.csv`;
    document.body.appendChild(a); a.click(); a.remove();
  }

  function exportJSON() {
    const data = _load();
    const code = data.activeSession;
    const session = code ? data.sessions[code] : null;
    if (!session) { alert('No active session.'); return; }
    const blob = 'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(session, null, 2));
    const a = document.createElement('a');
    a.href = blob; a.download = `workshop-${code}.json`;
    document.body.appendChild(a); a.click(); a.remove();
  }

  /* ─── Render ─── */
  function _renderActiveSession() {
    const data = _load();
    const code = data.activeSession;
    const session = code ? data.sessions[code] : null;
    if (!session) return '<div class="ws-no-session">No active session. Create or join one above.</div>';

    const totalStudents = session.students.length;
    const avgCompletion = totalStudents
      ? Math.round(session.students.reduce((s, st) => s + st.completed.length, 0) / totalStudents / MODULES.length * 100)
      : 0;

    const studentRows = session.students.map(s => {
      const pct = Math.round(s.completed.length / MODULES.length * 100);
      const color = pct >= 80 ? '#3fb950' : pct >= 50 ? '#d29922' : '#8b949e';
      return `<tr>
        <td>${s.name}</td>
        <td>${s.joined.slice(0,10)}</td>
        <td>
          <div style="display:flex;align-items:center;gap:0.5rem">
            <div style="flex:1;height:6px;background:rgba(255,255,255,0.08);border-radius:3px">
              <div style="height:100%;width:${pct}%;background:${color};border-radius:3px"></div>
            </div>
            <span style="font-size:0.78rem;color:${color};min-width:30px">${pct}%</span>
          </div>
        </td>
        <td>${MODULES.filter(m => s.completed.includes(m.id)).map(m => `<span class="ws-mod-tag done">${m.label}</span>`).join('')}
            ${MODULES.filter(m => !s.completed.includes(m.id)).map(m => `<span class="ws-mod-tag">${m.label}</span>`).join('')}
        </td>
      </tr>`;
    }).join('') || '<tr><td colspan="4" style="color:var(--text-muted);padding:1rem">No students have joined yet.</td></tr>';

    const myCompleted = (session.students.find(s => s.name === _getCurrentStudentName()) || {}).completed || [];

    const moduleChecks = MODULES.map(m => `
      <div class="ws-module-check ${myCompleted.includes(m.id) ? 'done' : ''}">
        <span>${myCompleted.includes(m.id) ? '[OK]' : '○'}</span>
        <span>${m.label}</span>
        <button class="ws-go-btn" onclick="OmicsLab.Workshop.markModuleDone('${m.id}')">
          ${myCompleted.includes(m.id) ? 'Review' : 'Go →'}
        </button>
      </div>`).join('');

    return `
    <div class="ws-session-header">
      <div class="ws-session-info">
        <div class="ws-session-name">${session.name}</div>
        <div class="ws-session-meta">${session.location || 'Online'} · ${session.date} · Code: <strong>${code}</strong></div>
      </div>
      <div class="ws-session-stats">
        <div class="ws-session-stat"><div class="ws-stat-n">${totalStudents}</div><div class="ws-stat-l">Students</div></div>
        <div class="ws-session-stat"><div class="ws-stat-n">${avgCompletion}%</div><div class="ws-stat-l">Avg completion</div></div>
      </div>
    </div>

    <div class="ws-two-col">
      <div>
        <div class="ws-col-head">Your Progress</div>
        <div class="ws-module-list">${moduleChecks}</div>
      </div>
      <div>
        <div class="ws-col-head">Cohort Progress</div>
        <div style="overflow-x:auto">
          <table class="ws-cohort-table">
            <thead><tr><th>Student</th><th>Joined</th><th>Progress</th><th>Modules</th></tr></thead>
            <tbody>${studentRows}</tbody>
          </table>
        </div>
        <div class="ws-export-row">
          <button class="ws-btn" onclick="OmicsLab.Workshop.exportReport()">${OmicsLab.Icons?.svg('bar-chart', 13) || ''} Export CSV Report</button>
          <button class="ws-btn" onclick="OmicsLab.Workshop.exportJSON()">⬇ Export JSON</button>
        </div>
      </div>
    </div>`;
  }

  function _refresh() {
    const panel = document.getElementById('ws-active-panel');
    if (panel) panel.innerHTML = _renderActiveSession();
    const allSessions = _load().sessions;
    const histPanel = document.getElementById('ws-history-list');
    if (histPanel) {
      const sessions = Object.values(allSessions);
      histPanel.innerHTML = sessions.length
        ? sessions.map(s => `<div class="ws-hist-row" onclick="OmicsLab.Workshop.loadSession('${s.code}')">
            <div><strong>${s.name}</strong> · ${s.code}</div>
            <div style="font-size:0.78rem;color:var(--text-muted)">${s.location||'Online'} · ${s.date} · ${s.students.length} students</div>
          </div>`).join('')
        : '<div style="color:var(--text-muted);font-size:0.85rem">No sessions yet.</div>';
    }
  }

  function loadSession(code) {
    const data = _load();
    if (data.sessions[code]) { data.activeSession = code; _save(data); _refresh(); }
  }

  /* ─── Init ─── */
  function init() {
    const container = document.getElementById('workshop-content');
    if (!container) return;

    const tracks = OmicsLab.Curriculum
      ? Object.values(OmicsLab.Curriculum.TRACKS).map(t => `<option value="${t.id}">${t.title}</option>`).join('')
      : '<option value="bioinformatics">Bioinformatics</option><option value="wetlab">Wet-Lab</option><option value="publichealth">Public Health</option>';

    container.innerHTML = `
    <div class="ws-layout">
      <div class="ws-setup-col">
        <div class="ws-card">
          <div class="ws-card-head">${OmicsLab.Icons?.svg('layers', 14) || ''} Create Session (Instructor)</div>
          <div class="ws-field"><label>Session Name</label><input id="ws-session-name" type="text" placeholder="e.g. H3ABioNet Workshop 2026" /></div>
          <div class="ws-field"><label>Location / Institution</label><input id="ws-location" type="text" placeholder="e.g. KEMRI, Nairobi" /></div>
          <div class="ws-field"><label>Date</label><input id="ws-date" type="date" value="${new Date().toISOString().slice(0,10)}" /></div>
          <div class="ws-field"><label>Primary Track</label><select id="ws-track">${tracks}</select></div>
          <button class="ws-btn-primary" onclick="OmicsLab.Workshop.createSession()">Create Session</button>
        </div>

        <div class="ws-card" style="margin-top:1rem">
          <div class="ws-card-head">${OmicsLab.Icons?.svg('award', 14) || ''} Join Session (Student)</div>
          <div class="ws-field"><label>Session Code</label><input id="ws-join-code" type="text" placeholder="e.g. ABC123" maxlength="6" style="text-transform:uppercase" /></div>
          <div class="ws-field"><label>Your Name</label><input id="ws-student-name" type="text" placeholder="Full name" /></div>
          <button class="ws-btn-primary" onclick="OmicsLab.Workshop.joinSession()">Join Session</button>
        </div>

        <div class="ws-card" style="margin-top:1rem">
          <div class="ws-card-head">${OmicsLab.Icons?.svg('archive', 14) || ''} Past Sessions</div>
          <div id="ws-history-list"></div>
        </div>
      </div>

      <div class="ws-main-col">
        <div id="ws-active-panel" class="ws-active-panel"></div>
      </div>
    </div>`;

    _refresh();
  }

  return { init, createSession, joinSession, markModuleDone, exportReport, exportJSON, loadSession };
})();
