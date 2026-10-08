/* ═══════════════════════════════════════════════════════════════
   OmicsLab — Research Project Mode
   Orchestrates a simulated research project using existing modules
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.ResearchMode = (function () {
  let _projects = {};

  function _populateSelectors() {
    const dsel = document.getElementById('rm-disease');
    const wsel = document.getElementById('rm-workflow');
    const xsel = document.getElementById('rm-dataset');
    if (dsel && OmicsLab.DISEASES) {
      dsel.innerHTML = Object.entries(OmicsLab.DISEASES)
        .map(([id, d]) => `<option value="${id}">${d.name}</option>`)
        .join('');
    }
    if (wsel && OmicsLab.Workflows) {
      wsel.innerHTML = Object.entries(OmicsLab.Workflows)
        .map(([id, w]) => `<option value="${id}">${w.name}</option>`)
        .join('');
    }
    if (xsel) {
      xsel.innerHTML = [
        ['public-african-cohort', 'Public African cohort dataset'],
        ['ncbi-sra', 'NCBI SRA / ENA reads'],
        ['expression-matrix', 'Expression matrix for differential analysis'],
        ['vcf-variants', 'VCF variant dataset'],
        ['microbiome-table', 'Microbiome abundance table'],
        ['my-own-data', 'My own dataset'],
      ]
        .map(([id, label]) => `<option value="${id}">${label}</option>`)
        .join('');
    }
  }

  function _bindActions() {
    const start = document.getElementById('rm-start');
    const exp = document.getElementById('rm-export');
    if (start) start.addEventListener('click', _startProject);
    if (exp) exp.addEventListener('click', exportProject);
  }

  function _startProject() {
    const did = document.getElementById('rm-disease').value;
    const wf = Array.from(document.getElementById('rm-workflow').selectedOptions).map((option) => option.value);
    const dataset = document.getElementById('rm-dataset').value;
    const n = parseInt(document.getElementById('rm-samples').value || '10', 10);
    const pid = 'proj-' + Date.now();
    const project = {
      id: pid,
      disease: did,
      workflow: wf,
      dataset,
      samples: n,
      created: new Date().toISOString(),
    };
    _projects[pid] = project;

    _renderProjectSummary(project);
    const workspace = document.getElementById('research-workspace-section');
    workspace?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function _renderProjectSummary(p) {
    const container = document.getElementById('research-summary');
    if (!container) return;
    const disease = OmicsLab.DISEASES && OmicsLab.DISEASES[p.disease];
    const toolNames = (p.workflow || [])
      .map((id) => OmicsLab.Workflows?.[id]?.name || id)
      .join(', ');
    container.innerHTML = `
      <div class="rm-card">
        <div class="rm-card-head">
          <div class="rm-title">Project: ${disease ? disease.name : p.disease}</div>
          <div class="rm-meta">Planning only · Samples: ${p.samples}</div>
        </div>
        <div class="rm-body">
          <div><strong>Selected tools:</strong> ${toolNames || 'Choose tools when you are ready.'}</div>
          <div><strong>Dataset:</strong> ${p.dataset}</div>
          <div style="margin-top:0.6rem;color:var(--text-muted)">${disease ? disease.africanContext || disease.description.substring(0, 240) : ''}</div>
        </div>
        <div class="rm-actions">
          <button class="btn-result-primary" onclick="document.getElementById('research-workspace-section')?.scrollIntoView({behavior:'smooth', block:'start'})">Continue writing</button>
          <button class="btn-result-secondary" onclick="OmicsLab.ResearchMode.export('${p.id}')">Download Project JSON</button>
        </div>
      </div>`;
  }

  function runSimulation(pid) {
    console.warn('[ResearchMode] Simulation is no longer started from Research.', pid);
  }

  function exportProject() {
    const latest = Object.values(_projects).pop();
    if (!latest) return alert('No projects to export');
    _downloadJSON(latest, `omicslab-project-${latest.id}.json`);
  }

  function exportById(pid) {
    const p = _projects[pid];
    if (!p) return alert('Project not found');
    _downloadJSON(p, `omicslab-project-${pid}.json`);
  }

  function _downloadJSON(obj, filename) {
    const data =
      'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(obj, null, 2));
    const a = document.createElement('a');
    a.href = data;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  function init() {
    _populateSelectors();
    _bindActions();
  }

  return { init, runSimulation, export: exportById, exportProject };
})();
