/* ═══════════════════════════════════════════════════════════════
   OmicsLab — Research Project Mode
   Orchestrates a simulated research project using existing modules
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.ResearchMode = (function() {
  let _projects = {};

  function _populateSelectors() {
    const dsel = document.getElementById('rm-disease');
    const wsel = document.getElementById('rm-workflow');
    const lsel = document.getElementById('rm-lab');
    if (dsel && OmicsLab.DISEASES) {
      dsel.innerHTML = Object.entries(OmicsLab.DISEASES).map(([id,d]) => `<option value="${id}">${d.name}</option>`).join('');
    }
    if (wsel && OmicsLab.Workflows) {
      wsel.innerHTML = Object.entries(OmicsLab.Workflows).map(([id,w]) => `<option value="${id}">${w.name}</option>`).join('');
    }
    if (lsel && OmicsLab.AfricaMap && OmicsLab.AfricaMap.CENTRES) {
      lsel.innerHTML = OmicsLab.AfricaMap.CENTRES.map(c => `<option value="${c.id}">${c.name} — ${c.country}</option>`).join('');
    }
  }

  function _bindActions() {
    const start = document.getElementById('rm-start');
    const exp = document.getElementById('rm-export');
    if (start) start.addEventListener('click', _startProject);
    if (exp)   exp.addEventListener('click', exportProject);
  }

  function _startProject() {
    const did = document.getElementById('rm-disease').value;
    const wf  = document.getElementById('rm-workflow').value;
    const lab = document.getElementById('rm-lab').value;
    const n   = parseInt(document.getElementById('rm-samples').value || '10', 10);
    const pid = 'proj-' + Date.now();
    const project = { id: pid, disease: did, workflow: wf, lab, samples: n, started: new Date().toISOString() };
    _projects[pid] = project;

    // Light-weight simulation: compute expected score average from Engine heuristics
    const baseQuality = OmicsLab.Engine ? OmicsLab.Engine.computeBaselineQuality ? OmicsLab.Engine.computeBaselineQuality() : 75 : 70;
    const workflowPenalty = (OmicsLab.Workflows && OmicsLab.Workflows[wf] && OmicsLab.Workflows[wf].difficulty === 'advanced') ? -8 : 0;
    project.estimatedScore = Math.max(40, Math.round(baseQuality + workflowPenalty - (n>50?5:0)));

    _renderProjectSummary(project);
    // Optionally launch the workflow in the app to let user run steps
    if (confirm('Open the lab workflow for this project now?')) {
      OmicsLab.App.startWorkflow(wf);
    }
  }

  function _renderProjectSummary(p) {
    const container = document.getElementById('research-summary');
    if (!container) return;
    const disease = OmicsLab.DISEASES && OmicsLab.DISEASES[p.disease];
    const lab = (OmicsLab.AfricaMap && OmicsLab.AfricaMap.CENTRES) ? OmicsLab.AfricaMap.CENTRES.find(c=>c.id===p.lab) : null;
    container.innerHTML = `
      <div class="rm-card">
        <div class="rm-card-head">
          <div class="rm-title">Project: ${disease ? disease.name : p.disease}</div>
          <div class="rm-meta">Samples: ${p.samples} · Est. Score: ${p.estimatedScore}</div>
        </div>
        <div class="rm-body">
          <div><strong>Workflow:</strong> ${OmicsLab.Workflows && OmicsLab.Workflows[p.workflow] ? OmicsLab.Workflows[p.workflow].name : p.workflow}</div>
          <div><strong>Host lab:</strong> ${lab ? lab.name + ' (' + lab.country + ')' : p.lab}</div>
          <div style="margin-top:0.6rem;color:var(--text-muted)">${disease ? disease.africanContext || disease.description.substring(0,240) : ''}</div>
        </div>
        <div class="rm-actions">
          <button class="btn-result-primary" onclick="OmicsLab.ResearchMode.runSimulation('${p.id}')">Run Simulation</button>
          <button class="btn-result-secondary" onclick="OmicsLab.ResearchMode.export('${p.id}')">Download Project JSON</button>
        </div>
      </div>`;
  }

  function runSimulation(pid) {
    const p = _projects[pid];
    if (!p) return alert('Project not found');
    // Simple simulation: run the workflow with randomized mistakes to populate State
    if (confirm('Simulate the wet-lab run in the active workflow? This will reset current lab state. Continue?')) {
      OmicsLab.Engine.reset(p.workflow);
      // set a few state knobs to reflect project difficulty
      OmicsLab.State.timerStart = Date.now();
      OmicsLab.State.quality = OmicsLab.State.quality || {};
      OmicsLab.State.quality.sampleIntegrity = Math.max(50, p.estimatedScore);
      OmicsLab.State.quality.libraryComplexity = Math.max(50, p.estimatedScore - 5);
      OmicsLab.State.mistakes = [];
      // show results
      OmicsLab.App.showResults();
    }
  }

  function exportProject() {
    const latest = Object.values(_projects).pop();
    if (!latest) return alert('No projects to export');
    _downloadJSON(latest, `omicslab-project-${latest.id}.json`);
  }

  function exportById(pid) { const p = _projects[pid]; if (!p) return alert('Project not found'); _downloadJSON(p, `omicslab-project-${pid}.json`); }

  function _downloadJSON(obj, filename) {
    const data = 'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(obj, null, 2));
    const a = document.createElement('a'); a.href = data; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
  }

  function init() {
    _populateSelectors();
    _bindActions();
  }

  return { init, runSimulation, export: exportById, exportProject };
})();
