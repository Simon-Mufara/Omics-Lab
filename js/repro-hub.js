/* ═══════════════════════════════════════════════════════════════
   OmicsLab — Research Metadata & Reproducibility Hub
   Collaborative repository for reproducible omics science.
   Stores submissions in localStorage; no server required.
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.ReproHub = (function () {

  const STORE_KEY = 'omicslab_repro_hub_v1';

  /* ─── Scoring weights ─── */
  const SCORE_WEIGHTS = {
    // Reproducibility
    workflow_script: 15, container_spec: 12, software_versions: 10,
    protocol_description: 8, data_location: 8,
    // Completeness
    title: 5, description: 5, disease: 4, workflow_type: 4,
    sample_count: 3, sequencing_platform: 4, reference_genome: 4,
    qc_report: 6, publication_doi: 3,
    // FAIR
    dataset_id: 8, license: 5, contact_email: 3, keywords: 4
  };

  const FAIR_FIELDS = {
    findable:    ['title', 'keywords', 'dataset_id', 'disease'],
    accessible:  ['data_location', 'contact_email', 'license'],
    interoperable: ['workflow_type', 'reference_genome', 'container_spec'],
    reusable:    ['protocol_description', 'software_versions', 'qc_report', 'publication_doi']
  };

  /* ─── Seed community submissions ─── */
  const SEED_SUBMISSIONS = [
    {
      id: 'seed-001', submittedBy: 'Dr. A. Okonkwo', institution: 'KEMRI, Kenya',
      timestamp: '2026-04-12T08:30:00Z', disease: 'Malaria', workflow_type: 'WGS',
      title: 'P. falciparum drug resistance variant calling — Kenya cohort 2025',
      description: 'Whole-genome sequencing of 140 P. falciparum isolates from Western Kenya to identify artemisinin resistance markers using GATK HaplotypeCaller.',
      sample_count: '140', sequencing_platform: 'Illumina NovaSeq 6000', reference_genome: 'Pf3D7 v3.1',
      protocol_description: 'DNA extraction via QIAamp, library prep with Nextera XT, 150bp paired-end sequencing at 30× coverage.',
      software_versions: 'BWA-MEM 0.7.17, GATK 4.4.0, VEP 110, fastp 0.23.4',
      workflow_script: 'https://github.com/h3africa/pf-resistance-wgs/blob/main/Snakefile',
      container_spec: 'docker://biocontainers/gatk4:4.4.0.0\ndocker://quay.io/biocontainers/bwa:0.7.17',
      data_location: 'ENA: PRJEB55123', dataset_id: 'PRJEB55123', license: 'CC-BY 4.0',
      keywords: 'malaria, drug-resistance, P.falciparum, Kenya, WGS',
      contact_email: 'a.okonkwo@kemri.go.ke', qc_report: 'MultiQC report attached', publication_doi: '10.1101/2026.03.01.XXXXXX',
      forks: 3, validations: 7, reproduced_runs: 2, status: 'community-validated'
    },
    {
      id: 'seed-002', submittedBy: 'Dr. M. Dlamini', institution: 'NHLS, South Africa',
      timestamp: '2026-03-28T14:15:00Z', disease: 'TB', workflow_type: 'Metagenomics',
      title: 'Mycobacterium tuberculosis whole-genome sequencing for drug susceptibility — SA',
      description: 'WGS-based DST for MDR-TB isolates from the Western Cape. Variant calling with Snippy and resistance prediction with TB-Profiler.',
      sample_count: '85', sequencing_platform: 'Oxford Nanopore MinION', reference_genome: 'H37Rv NC_000962.3',
      protocol_description: 'Rapid library prep with Oxford Nanopore SQK-RBK004. Basecalling with Guppy 6.5. Assembly with Medaka.',
      software_versions: 'Guppy 6.5.7, Snippy 4.6, TB-Profiler 5.0.1, Medaka 1.8',
      workflow_script: 'https://github.com/h3africa/tb-dst-nanopore/blob/main/workflow.nf',
      container_spec: 'singularity pull docker://staphb/tb-profiler:5.0.1',
      data_location: 'SRA: PRJNA987654', dataset_id: 'PRJNA987654', license: 'CC-BY 4.0',
      keywords: 'tuberculosis, MDR-TB, nanopore, drug-resistance, South Africa',
      contact_email: 'm.dlamini@nhls.ac.za', qc_report: 'NanoStat QC attached', publication_doi: '',
      forks: 1, validations: 4, reproduced_runs: 1, status: 'peer-reviewed'
    },
    {
      id: 'seed-003', submittedBy: 'Dr. F. Asante', institution: 'WACCBIP, Ghana',
      timestamp: '2026-05-10T09:00:00Z', disease: 'COVID-19', workflow_type: 'Transcriptomics',
      title: 'Host transcriptomics of severe vs. mild COVID-19 in West African patients',
      description: 'RNA-seq differential expression analysis comparing 30 severe and 30 mild COVID-19 patients to identify African-specific immune signatures.',
      sample_count: '60', sequencing_platform: 'Illumina HiSeq 2500', reference_genome: 'GRCh38',
      protocol_description: 'Total RNA extraction, rRNA depletion, strand-specific library prep. Alignment with STAR, quantification with featureCounts.',
      software_versions: 'STAR 2.7.11, DESeq2 1.42, featureCounts 2.0.6, fastp 0.23.4',
      workflow_script: '#!/bin/bash\n# See Snakefile in repository',
      container_spec: 'docker://biocontainers/star:2.7.11\ndocker://bioconductor/bioconductor_docker:RELEASE_3_18',
      data_location: 'GEO: GSE245678', dataset_id: 'GSE245678', license: 'CC0 1.0',
      keywords: 'COVID-19, transcriptomics, RNA-seq, Ghana, host-response',
      contact_email: 'f.asante@waccbip.edu.gh', qc_report: 'FastQC/MultiQC attached', publication_doi: '10.1101/2026.05.01.XXXXXX',
      forks: 5, validations: 12, reproduced_runs: 3, status: 'community-validated'
    }
  ];

  /* ─── Storage ─── */
  function _load() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      return raw ? JSON.parse(raw) : [...SEED_SUBMISSIONS];
    } catch { return [...SEED_SUBMISSIONS]; }
  }

  function _save(submissions) {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(submissions)); } catch {}
  }

  function _getAll() {
    const stored = _load();
    if (!stored.some(s => s.id === 'seed-001')) stored.unshift(...SEED_SUBMISSIONS.filter(s => !stored.some(x => x.id === s.id)));
    return stored;
  }

  /* ─── Scoring engine ─── */
  function _computeScores(fields) {
    let repro = 0, completeness = 0, fair = 0;

    // Reproducibility (max 53)
    ['workflow_script','container_spec','software_versions','protocol_description','data_location'].forEach(f => {
      if (fields[f] && fields[f].trim().length > 3) repro += SCORE_WEIGHTS[f];
    });

    // Completeness (max 38)
    ['title','description','disease','workflow_type','sample_count','sequencing_platform','reference_genome','qc_report','publication_doi'].forEach(f => {
      if (fields[f] && fields[f].trim().length > 1) completeness += SCORE_WEIGHTS[f];
    });

    // FAIR (max 20)
    ['dataset_id','license','contact_email','keywords'].forEach(f => {
      if (fields[f] && fields[f].trim().length > 1) fair += SCORE_WEIGHTS[f];
    });

    return {
      reproducibility: Math.min(100, Math.round(repro / 53 * 100)),
      completeness:    Math.min(100, Math.round(completeness / 38 * 100)),
      fair:            Math.min(100, Math.round(fair / 20 * 100))
    };
  }

  function _fairChecklist(fields) {
    return Object.entries(FAIR_FIELDS).map(([principle, flds]) => {
      const passed = flds.filter(f => fields[f] && fields[f].trim().length > 1);
      return { principle: principle.charAt(0).toUpperCase() + principle.slice(1), passed: passed.length, total: flds.length, items: flds, fields };
    });
  }

  function _scoreColor(n) {
    if (n >= 80) return '#3fb950';
    if (n >= 50) return '#d29922';
    return '#f85149';
  }

  function _scoreGauge(label, value, color) {
    return `<div class="rh-gauge">
      <svg viewBox="0 0 80 80" width="80" height="80">
        <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.07)" stroke-width="8"/>
        <circle cx="40" cy="40" r="34" fill="none" stroke="${color}" stroke-width="8"
          stroke-dasharray="${2*Math.PI*34}" stroke-dashoffset="${2*Math.PI*34*(1-value/100)}"
          stroke-linecap="round" transform="rotate(-90 40 40)"/>
        <text x="40" y="44" text-anchor="middle" font-size="16" font-weight="800" fill="${color}">${value}</text>
      </svg>
      <div class="rh-gauge-label">${label}</div>
    </div>`;
  }

  /* ─── Form HTML ─── */
  function _buildSubmitPanel() {
    const diseases  = OmicsLab.DISEASES ? Object.values(OmicsLab.DISEASES).map(d => d.name) : ['Malaria','TB','HIV','COVID-19','Cancer','Ebola','Dengue'];
    const workflows = OmicsLab.Workflows ? Object.values(OmicsLab.Workflows).map(w => w.name) : ['WGS','RNA-seq','Metagenomics','Proteomics'];

    return `
    <div class="rh-submit-layout">
      <div class="rh-form-col">
        <div class="rh-section-head">Study Information</div>
        <div class="rh-field-row">
          <div class="rh-field">
            <label>Title *</label>
            <input id="rh-title" type="text" placeholder="Descriptive study title" />
          </div>
        </div>
        <div class="rh-field">
          <label>Description *</label>
          <textarea id="rh-description" rows="3" placeholder="Briefly describe the study aims, cohort, and findings"></textarea>
        </div>
        <div class="rh-field-row">
          <div class="rh-field">
            <label>Disease</label>
            <select id="rh-disease"><option value="">-- select --</option>${diseases.map(d => `<option>${d}</option>`).join('')}</select>
          </div>
          <div class="rh-field">
            <label>Workflow Type</label>
            <select id="rh-workflow_type"><option value="">-- select --</option>${workflows.map(w => `<option>${w}</option>`).join('')}</select>
          </div>
        </div>

        <div class="rh-section-head" style="margin-top:1rem">Sample &amp; Sequencing Metadata</div>
        <div class="rh-field-row">
          <div class="rh-field">
            <label>Sample Count</label>
            <input id="rh-sample_count" type="number" min="1" placeholder="e.g. 120" />
          </div>
          <div class="rh-field">
            <label>Sequencing Platform</label>
            <input id="rh-sequencing_platform" type="text" placeholder="e.g. Illumina NovaSeq" />
          </div>
        </div>
        <div class="rh-field">
          <label>Reference Genome / Assembly</label>
          <input id="rh-reference_genome" type="text" placeholder="e.g. GRCh38, Pf3D7 v3.1" />
        </div>
        <div class="rh-field">
          <label>Protocol Description</label>
          <textarea id="rh-protocol_description" rows="2" placeholder="Wet-lab methods: extraction, library prep, sequencing conditions"></textarea>
        </div>

        <div class="rh-section-head" style="margin-top:1rem">Bioinformatics &amp; Reproducibility</div>
        <div class="rh-field">
          <label>Software Versions</label>
          <textarea id="rh-software_versions" rows="2" placeholder="e.g. BWA-MEM 0.7.17, GATK 4.4.0, DESeq2 1.42"></textarea>
        </div>
        <div class="rh-field">
          <label>Workflow Script (URL or paste)</label>
          <textarea id="rh-workflow_script" rows="3" placeholder="GitHub URL, Snakefile, Nextflow script, CWL, WDL, or bash script"></textarea>
        </div>
        <div class="rh-field">
          <label>Container Specification</label>
          <textarea id="rh-container_spec" rows="2" placeholder="Docker image, Singularity .def file, or container registry URL"></textarea>
        </div>

        <div class="rh-section-head" style="margin-top:1rem">FAIR Metadata</div>
        <div class="rh-field-row">
          <div class="rh-field">
            <label>Dataset ID (ENA / SRA / GEO)</label>
            <input id="rh-dataset_id" type="text" placeholder="e.g. PRJEB12345" />
          </div>
          <div class="rh-field">
            <label>Data Location / URL</label>
            <input id="rh-data_location" type="text" placeholder="Repository URL or accession" />
          </div>
        </div>
        <div class="rh-field-row">
          <div class="rh-field">
            <label>License</label>
            <select id="rh-license">
              <option value="">-- select --</option>
              <option>CC-BY 4.0</option><option>CC0 1.0</option>
              <option>CC-BY-NC 4.0</option><option>MIT</option><option>Apache 2.0</option>
            </select>
          </div>
          <div class="rh-field">
            <label>Publication DOI</label>
            <input id="rh-publication_doi" type="text" placeholder="e.g. 10.1038/s41467-..." />
          </div>
        </div>
        <div class="rh-field-row">
          <div class="rh-field">
            <label>Keywords</label>
            <input id="rh-keywords" type="text" placeholder="comma-separated" />
          </div>
          <div class="rh-field">
            <label>Contact Email</label>
            <input id="rh-contact_email" type="email" placeholder="researcher@institution.ac" />
          </div>
        </div>
        <div class="rh-field">
          <label>QC Report (attach description or URL)</label>
          <input id="rh-qc_report" type="text" placeholder="MultiQC URL or summary" />
        </div>
        <div class="rh-field-row">
          <div class="rh-field">
            <label>Your Name / Lab</label>
            <input id="rh-submittedBy" type="text" placeholder="Dr. Name, Institution" />
          </div>
        </div>

        <div class="rh-submit-actions">
          <button class="rh-btn-primary" onclick="OmicsLab.ReproHub.submitEntry()">Submit to Hub</button>
          <button class="rh-btn-secondary" onclick="OmicsLab.ReproHub.previewScores()">Preview Scores</button>
          <button class="rh-btn-ghost" onclick="OmicsLab.ReproHub.clearForm()">Clear</button>
        </div>
      </div>

      <div class="rh-scores-col">
        <div class="rh-scores-card" id="rh-live-scores">
          <div class="rh-scores-title">Reproducibility Scores</div>
          <p class="rh-scores-hint">Fill in the form to see your scores update automatically.</p>
          <div id="rh-gauge-row" class="rh-gauge-row">
            ${_scoreGauge('Reproducibility', 0, '#444')}
            ${_scoreGauge('Completeness', 0, '#444')}
            ${_scoreGauge('FAIR', 0, '#444')}
          </div>
          <div id="rh-checklist" class="rh-checklist"></div>
        </div>
      </div>
    </div>`;
  }

  /* ─── Browse panel ─── */
  function _buildBrowsePanel(submissions) {
    const cards = submissions.map(s => {
      const scores = _computeScores(s);
      const statusColors = { 'community-validated': '#3fb950', 'peer-reviewed': '#58a6ff', 'submitted': '#d29922' };
      const statusColor = statusColors[s.status] || '#8b949e';
      return `
      <div class="rh-browse-card" onclick="OmicsLab.ReproHub.viewSubmission('${s.id}')">
        <div class="rh-browse-head">
          <div class="rh-browse-title">${_esc(s.title)}</div>
          <div class="rh-browse-meta">${_esc(s.submittedBy || 'Anonymous')} · ${_formatDate(s.timestamp)}</div>
        </div>
        <div class="rh-browse-tags">
          <span class="rh-tag rh-tag-disease">${_esc(s.disease || '—')}</span>
          <span class="rh-tag rh-tag-workflow">${_esc(s.workflow_type || '—')}</span>
          ${s.sequencing_platform ? `<span class="rh-tag">${_esc(s.sequencing_platform)}</span>` : ''}
          <span class="rh-tag" style="color:${statusColor};border-color:${statusColor}">${s.status || 'submitted'}</span>
        </div>
        <div class="rh-browse-desc">${_esc((s.description || '').substring(0, 140))}…</div>
        <div class="rh-browse-footer">
          <div class="rh-mini-scores">
            <span style="color:${_scoreColor(scores.reproducibility)}">⟳ ${scores.reproducibility}</span>
            <span style="color:${_scoreColor(scores.completeness)}">◉ ${scores.completeness}</span>
            <span style="color:${_scoreColor(scores.fair)}">FAIR ${scores.fair}</span>
          </div>
          <div class="rh-browse-stats">
            <span>🔀 ${s.forks || 0} forks</span>
            <span>✓ ${s.validations || 0} validations</span>
            <span>▶ ${s.reproduced_runs || 0} reproduced</span>
          </div>
        </div>
      </div>`;
    }).join('');

    return `
    <div class="rh-browse-controls">
      <input class="rh-search" id="rh-browse-search" type="search" placeholder="Search submissions…"
             oninput="OmicsLab.ReproHub.filterBrowse(this.value)" />
      <select id="rh-browse-filter" onchange="OmicsLab.ReproHub.filterBrowse(document.getElementById('rh-browse-search').value)"
              class="rh-filter-select">
        <option value="">All diseases</option>
        ${[...new Set(submissions.map(s => s.disease).filter(Boolean))].map(d => `<option>${d}</option>`).join('')}
      </select>
    </div>
    <div id="rh-browse-grid" class="rh-browse-grid">${cards}</div>`;
  }

  /* ─── Validate panel ─── */
  function _buildValidatePanel() {
    return `
    <div class="rh-validate-layout">
      <div class="rh-form-col">
        <div class="rh-section-head">FAIR Principles Checker</div>
        <p style="font-size:0.85rem;color:var(--text-muted);margin-bottom:1rem">
          Paste a dataset accession or DOI to check FAIR compliance. Or use the form in Submit to see live scoring.
        </p>
        <div class="rh-field">
          <label>Dataset Accession / DOI</label>
          <input id="rh-val-accession" type="text" placeholder="e.g. PRJEB12345 or 10.1038/..." />
        </div>
        <button class="rh-btn-primary" onclick="OmicsLab.ReproHub.runFAIRCheck()">Run FAIR Check</button>
        <div id="rh-fair-result" style="margin-top:1.5rem"></div>
      </div>
      <div class="rh-scores-col">
        <div class="rh-scores-card">
          <div class="rh-scores-title">What is FAIR?</div>
          ${[
            ['Findable',     '#58a6ff', 'Data has a globally unique identifier, rich metadata, and is registered in a searchable resource.'],
            ['Accessible',   '#3fb950', 'Data can be retrieved using open, free, and universally implementable protocols.'],
            ['Interoperable','#d29922', 'Data uses formal, accessible, shared, and broadly applicable language for knowledge representation.'],
            ['Reusable',     '#d2a8ff', 'Data is richly described with provenance, meets community standards, and has a clear usage license.']
          ].map(([p,c,d]) => `
            <div class="rh-fair-principle" style="border-left-color:${c}">
              <div class="rh-fair-letter" style="color:${c}">${p[0]}</div>
              <div><strong>${p}</strong><br><span style="font-size:0.8rem;color:var(--text-muted)">${d}</span></div>
            </div>`).join('')}
        </div>
      </div>
    </div>`;
  }

  /* ─── My Submissions ─── */
  function _buildMyPanel() {
    const all = _getAll();
    const mine = all.filter(s => !s.id.startsWith('seed-'));
    if (!mine.length) {
      return `<div class="rh-empty"><div style="font-size:2rem;margin-bottom:0.5rem">📋</div>
        <div>No submissions yet. Use the <strong>Submit</strong> tab to add your first study.</div></div>`;
    }
    return `<div class="rh-browse-grid">${mine.map(s => {
      const sc = _computeScores(s);
      return `<div class="rh-browse-card">
        <div class="rh-browse-head">
          <div class="rh-browse-title">${_esc(s.title)}</div>
          <div class="rh-browse-meta">${_formatDate(s.timestamp)}</div>
        </div>
        <div class="rh-browse-tags">
          <span class="rh-tag rh-tag-disease">${_esc(s.disease||'—')}</span>
          <span class="rh-tag rh-tag-workflow">${_esc(s.workflow_type||'—')}</span>
        </div>
        <div class="rh-mini-scores" style="margin-top:0.6rem">
          <span style="color:${_scoreColor(sc.reproducibility)}">⟳ ${sc.reproducibility}</span>
          <span style="color:${_scoreColor(sc.completeness)}">◉ ${sc.completeness}</span>
          <span style="color:${_scoreColor(sc.fair)}">FAIR ${sc.fair}</span>
        </div>
        <div style="margin-top:0.6rem;display:flex;gap:0.5rem">
          <button class="rh-btn-secondary" style="font-size:0.8rem;padding:0.3rem 0.7rem"
                  onclick="OmicsLab.ReproHub.viewSubmission('${s.id}')">View</button>
          <button class="rh-btn-ghost" style="font-size:0.8rem;padding:0.3rem 0.7rem"
                  onclick="OmicsLab.ReproHub.deleteSubmission('${s.id}')">Delete</button>
        </div>
      </div>`;
    }).join('')}</div>`;
  }

  /* ─── View modal ─── */
  function viewSubmission(id) {
    const s = _getAll().find(x => x.id === id);
    if (!s) return;
    const scores = _computeScores(s);
    const checklist = _fairChecklist(s);
    const modal = document.getElementById('rh-modal');
    const body  = document.getElementById('rh-modal-body');
    if (!modal || !body) return;

    const checklistHtml = checklist.map(c => `
      <div class="rh-fair-check-group">
        <div class="rh-fair-check-title" style="color:${c.passed===c.total?'#3fb950':c.passed>0?'#d29922':'#f85149'}">
          ${c.principle} — ${c.passed}/${c.total}
        </div>
        ${c.items.map(f => `
          <div class="rh-fair-item ${c.fields[f]&&c.fields[f].trim().length>1?'rh-fair-pass':'rh-fair-fail'}">
            ${c.fields[f]&&c.fields[f].trim().length>1?'✓':'✗'} ${f.replace(/_/g,' ')}
          </div>`).join('')}
      </div>`).join('');

    const rows = [
      ['Disease', s.disease], ['Workflow Type', s.workflow_type],
      ['Samples', s.sample_count], ['Platform', s.sequencing_platform],
      ['Reference', s.reference_genome], ['Dataset ID', s.dataset_id],
      ['License', s.license], ['DOI', s.publication_doi],
      ['Data Location', s.data_location], ['Contact', s.contact_email]
    ].filter(([,v]) => v).map(([k,v]) => `<tr><td class="rh-meta-key">${k}</td><td>${_esc(v)}</td></tr>`).join('');

    body.innerHTML = `
      <div class="rh-modal-header">
        <div class="rh-modal-title">${_esc(s.title)}</div>
        <div class="rh-modal-sub">${_esc(s.submittedBy||'Anonymous')} · ${_formatDate(s.timestamp)}</div>
      </div>
      <div class="rh-modal-gauges">
        ${_scoreGauge('Reproducibility', scores.reproducibility, _scoreColor(scores.reproducibility))}
        ${_scoreGauge('Completeness',    scores.completeness,    _scoreColor(scores.completeness))}
        ${_scoreGauge('FAIR',            scores.fair,            _scoreColor(scores.fair))}
      </div>
      <div class="rh-modal-desc">${_esc(s.description||'')}</div>
      <div class="rh-modal-two-col">
        <div>
          <div class="rh-section-head">Study Metadata</div>
          <table class="rh-meta-table">${rows}</table>
        </div>
        <div>
          <div class="rh-section-head">FAIR Checklist</div>
          <div class="rh-fair-checklist-grid">${checklistHtml}</div>
        </div>
      </div>
      ${s.protocol_description ? `<div class="rh-section-head" style="margin-top:1rem">Protocol</div>
        <div class="rh-modal-pre">${_esc(s.protocol_description)}</div>` : ''}
      ${s.software_versions ? `<div class="rh-section-head" style="margin-top:1rem">Software Versions</div>
        <pre class="rh-modal-pre">${_esc(s.software_versions)}</pre>` : ''}
      ${s.workflow_script ? `<div class="rh-section-head" style="margin-top:1rem">Workflow Script</div>
        <pre class="rh-modal-pre">${_esc(s.workflow_script)}</pre>` : ''}
      ${s.container_spec ? `<div class="rh-section-head" style="margin-top:1rem">Container Specification</div>
        <pre class="rh-modal-pre">${_esc(s.container_spec)}</pre>` : ''}
      <div class="rh-modal-actions">
        <button class="rh-btn-primary" onclick="OmicsLab.ReproHub.forkSubmission('${s.id}')">🔀 Fork &amp; Improve</button>
        <button class="rh-btn-secondary" onclick="OmicsLab.ReproHub.validateSubmission('${s.id}')">✓ Mark as Validated</button>
        <button class="rh-btn-secondary" onclick="OmicsLab.ReproHub.exportSubmission('${s.id}')">⬇ Export JSON</button>
        <button class="rh-btn-ghost" onclick="OmicsLab.ReproHub.closeModal()">Close</button>
      </div>`;
    modal.classList.add('open');
  }

  function closeModal() {
    const modal = document.getElementById('rh-modal');
    if (modal) modal.classList.remove('open');
  }

  /* ─── Live score updates ─── */
  function _updateLiveScores() {
    const fields = _readForm();
    const scores = _computeScores(fields);
    const gaugeRow = document.getElementById('rh-gauge-row');
    if (!gaugeRow) return;
    gaugeRow.innerHTML =
      _scoreGauge('Reproducibility', scores.reproducibility, _scoreColor(scores.reproducibility)) +
      _scoreGauge('Completeness',    scores.completeness,    _scoreColor(scores.completeness)) +
      _scoreGauge('FAIR',            scores.fair,            _scoreColor(scores.fair));

    const checklist = _fairChecklist(fields);
    const cl = document.getElementById('rh-checklist');
    if (cl) {
      cl.innerHTML = checklist.map(c => {
        const pct = Math.round(c.passed / c.total * 100);
        const col = pct === 100 ? '#3fb950' : pct > 0 ? '#d29922' : '#f85149';
        return `<div class="rh-cl-row">
          <span class="rh-cl-label" style="color:${col}">${c.principle[0]} — ${c.principle}</span>
          <div class="rh-cl-bar"><div class="rh-cl-fill" style="width:${pct}%;background:${col}"></div></div>
          <span class="rh-cl-pct">${c.passed}/${c.total}</span>
        </div>`;
      }).join('');
    }
  }

  function _readForm() {
    const ids = ['title','description','disease','workflow_type','sample_count','sequencing_platform',
                 'reference_genome','protocol_description','software_versions','workflow_script',
                 'container_spec','dataset_id','data_location','license','publication_doi',
                 'keywords','contact_email','qc_report','submittedBy'];
    const out = {};
    ids.forEach(id => {
      const el = document.getElementById('rh-' + id);
      out[id] = el ? el.value : '';
    });
    return out;
  }

  function _bindLiveScoring() {
    const ids = ['rh-title','rh-description','rh-disease','rh-workflow_type','rh-sample_count',
                 'rh-sequencing_platform','rh-reference_genome','rh-protocol_description',
                 'rh-software_versions','rh-workflow_script','rh-container_spec',
                 'rh-dataset_id','rh-data_location','rh-license','rh-publication_doi',
                 'rh-keywords','rh-contact_email','rh-qc_report'];
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('input', _updateLiveScores);
      if (el && el.tagName === 'SELECT') el.addEventListener('change', _updateLiveScores);
    });
  }

  /* ─── Public actions ─── */
  function previewScores() { _updateLiveScores(); }

  function submitEntry() {
    const fields = _readForm();
    if (!fields.title || fields.title.trim().length < 3) {
      alert('Please enter a title (at least 3 characters).'); return;
    }
    const id = 'sub-' + Date.now();
    const entry = { ...fields, id, timestamp: new Date().toISOString(), forks: 0, validations: 0, reproduced_runs: 0, status: 'submitted' };
    const all = _getAll();
    all.unshift(entry);
    _save(all);

    const scores = _computeScores(fields);
    alert(`Submitted! Scores — Reproducibility: ${scores.reproducibility} | Completeness: ${scores.completeness} | FAIR: ${scores.fair}`);
    clearForm();
    _refreshBrowse();
    _refreshMyPanel();
  }

  function clearForm() {
    ['rh-title','rh-description','rh-sample_count','rh-sequencing_platform','rh-reference_genome',
     'rh-protocol_description','rh-software_versions','rh-workflow_script','rh-container_spec',
     'rh-dataset_id','rh-data_location','rh-publication_doi','rh-keywords','rh-contact_email',
     'rh-qc_report','rh-submittedBy'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    ['rh-disease','rh-workflow_type','rh-license'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.selectedIndex = 0;
    });
    _updateLiveScores();
  }

  function filterBrowse(query) {
    const filter = (document.getElementById('rh-browse-filter')||{}).value || '';
    const all = _getAll();
    const q = (query||'').toLowerCase();
    const filtered = all.filter(s => {
      const matchQ = !q || [s.title,s.description,s.disease,s.workflow_type,s.keywords,s.submittedBy]
        .some(v => v && v.toLowerCase().includes(q));
      const matchF = !filter || s.disease === filter;
      return matchQ && matchF;
    });
    const grid = document.getElementById('rh-browse-grid');
    if (grid) {
      if (!filtered.length) { grid.innerHTML = '<div class="rh-empty">No submissions match your search.</div>'; return; }
      const tmp = document.createElement('div');
      tmp.innerHTML = _buildBrowsePanel(filtered);
      const inner = tmp.querySelector('#rh-browse-grid');
      if (inner) grid.innerHTML = inner.innerHTML;
    }
  }

  function forkSubmission(id) {
    const s = _getAll().find(x => x.id === id);
    if (!s) return;
    closeModal();
    // Pre-fill form with forked data
    const map = ['title','description','disease','workflow_type','sample_count','sequencing_platform',
                 'reference_genome','protocol_description','software_versions','workflow_script',
                 'container_spec','dataset_id','data_location','license','publication_doi','keywords','contact_email','qc_report'];
    map.forEach(f => {
      const el = document.getElementById('rh-' + f);
      if (el && s[f]) el.value = (f === 'title') ? 'Fork of: ' + s[f] : s[f];
    });
    switchTab('submit');
    _updateLiveScores();
    const all = _getAll();
    const orig = all.find(x => x.id === id);
    if (orig) { orig.forks = (orig.forks || 0) + 1; _save(all); }
  }

  function validateSubmission(id) {
    const all = _getAll();
    const s = all.find(x => x.id === id);
    if (s) { s.validations = (s.validations || 0) + 1; s.status = 'community-validated'; _save(all); }
    closeModal();
    _refreshBrowse();
    alert('Validation recorded. Thank you for helping verify this study!');
  }

  function exportSubmission(id) {
    const s = _getAll().find(x => x.id === id);
    if (!s) return;
    const blob = 'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(s, null, 2));
    const a = document.createElement('a'); a.href = blob; a.download = `repro-hub-${id}.json`;
    document.body.appendChild(a); a.click(); a.remove();
  }

  function deleteSubmission(id) {
    if (!confirm('Delete this submission?')) return;
    const all = _getAll().filter(x => x.id !== id);
    _save(all);
    _refreshMyPanel();
    _refreshBrowse();
  }

  function runFAIRCheck() {
    const acc = (document.getElementById('rh-val-accession')||{}).value || '';
    const result = document.getElementById('rh-fair-result');
    if (!result) return;
    if (!acc.trim()) { result.innerHTML = '<div style="color:#f85149">Please enter an accession or DOI.</div>'; return; }

    const mock = {
      findable:     acc.match(/PRJ|SRA|GEO|GSE|ERP/) ? 100 : 50,
      accessible:   acc.startsWith('10.') ? 90 : 70,
      interoperable: 60,
      reusable:     acc.match(/PRJ|GSE/) ? 80 : 55
    };
    const avg = Math.round(Object.values(mock).reduce((a,b) => a+b) / 4);
    result.innerHTML = `
      <div class="rh-fair-result-title">FAIR Assessment for: <code>${_esc(acc)}</code></div>
      <div class="rh-gauge-row" style="justify-content:flex-start;gap:1rem">
        ${Object.entries(mock).map(([p,v]) => _scoreGauge(p[0].toUpperCase() + p.slice(1), v, _scoreColor(v))).join('')}
        ${_scoreGauge('Overall', avg, _scoreColor(avg))}
      </div>
      <p style="font-size:0.82rem;color:var(--text-muted);margin-top:0.75rem">
        Note: this is an educational estimate based on the accession format. Full FAIR assessment requires manual metadata review.
      </p>`;
  }

  function _refreshBrowse() {
    const panel = document.getElementById('hpc-panel-browse'); // wrong id — use rh panel
    const browsePanel = document.getElementById('rh-panel-browse');
    if (browsePanel) browsePanel.innerHTML = _buildBrowsePanel(_getAll());
  }

  function _refreshMyPanel() {
    const myPanel = document.getElementById('rh-panel-my');
    if (myPanel) myPanel.innerHTML = _buildMyPanel();
  }

  /* ─── Tab switching ─── */
  function switchTab(id) {
    document.querySelectorAll('.rh-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === id));
    document.querySelectorAll('.rh-panel').forEach(p => p.classList.toggle('active', p.id === 'rh-panel-' + id));
    if (id === 'browse') _refreshBrowse();
    if (id === 'my') _refreshMyPanel();
  }

  /* ─── Helpers ─── */
  function _esc(s) {
    return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function _formatDate(iso) {
    try { return new Date(iso).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' }); }
    catch { return iso || ''; }
  }

  /* ─── Init ─── */
  function init() {
    const container = document.getElementById('repro-hub-content');
    if (!container) return;

    const tabs = [
      { id: 'submit',   label: '📤 Submit Study' },
      { id: 'browse',   label: '🔍 Browse Community' },
      { id: 'validate', label: '✅ FAIR Validator' },
      { id: 'my',       label: '👤 My Submissions' }
    ];

    const tabBar = tabs.map(t =>
      `<button class="rh-tab${t.id==='submit'?' active':''}" data-tab="${t.id}"
         onclick="OmicsLab.ReproHub.switchTab('${t.id}')">${t.label}</button>`
    ).join('');

    const allSubs = _getAll();
    const panels = [
      { id: 'submit',   html: _buildSubmitPanel() },
      { id: 'browse',   html: _buildBrowsePanel(allSubs) },
      { id: 'validate', html: _buildValidatePanel() },
      { id: 'my',       html: _buildMyPanel() }
    ].map(p => `<div id="rh-panel-${p.id}" class="rh-panel${p.id==='submit'?' active':''}">${p.html}</div>`).join('');

    container.innerHTML = `
      <div class="rh-tab-bar">${tabBar}</div>
      ${panels}
      <div id="rh-modal" class="rh-modal-overlay" onclick="if(event.target===this)OmicsLab.ReproHub.closeModal()">
        <div class="rh-modal-box">
          <button class="rh-modal-close" onclick="OmicsLab.ReproHub.closeModal()">✕</button>
          <div id="rh-modal-body"></div>
        </div>
      </div>`;

    setTimeout(_bindLiveScoring, 50);
  }

  return { init, submitEntry, previewScores, clearForm, viewSubmission, closeModal,
           forkSubmission, validateSubmission, exportSubmission, deleteSubmission,
           filterBrowse, runFAIRCheck, switchTab };
})();
