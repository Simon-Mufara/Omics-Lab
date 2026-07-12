/* ═══════════════════════════════════════════════════════════════
   OmicsLab — Badge & Certificate System
   Tracks achievements, unlocks badges, generates printable
   certificates and shareable badge cards.
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.Badges = (function () {

  const STORE_KEY = 'omicslab_badges_v1';

  const ALL_BADGES = [
    /* Curriculum */
    { id: 'wetlab-certified',   icon: 'microscope',   title: 'Wet-Lab Certified',
      desc: 'Completed the Wet-Lab Scientist learning track.',
      color: '#00C4A0', category: 'Curriculum', earnedBy: 'Complete all 5 wet-lab lessons' },
    { id: 'bioinfo-certified',  icon: 'cpu',          title: 'Bioinformatics Certified',
      desc: 'Completed the Bioinformatician learning track.',
      color: '#58a6ff', category: 'Curriculum', earnedBy: 'Complete all 5 bioinformatics lessons' },
    { id: 'pubhealth-certified',icon: 'globe',        title: 'Public Health Researcher',
      desc: 'Completed the Public Health Researcher learning track.',
      color: '#d2a8ff', category: 'Curriculum', earnedBy: 'Complete all 5 public health lessons' },
    { id: 'aiml-certified',     icon: 'cpu',          title: 'AI/ML for Omics Certified',
      desc: 'Completed the AI & Machine Learning for Omics learning track.',
      color: '#bc8cff', category: 'Curriculum', earnedBy: 'Complete all 4 AI/ML lessons' },
    { id: 'all-tracks',         icon: 'ribbon',       title: 'OmicsLab Graduate',
      desc: 'Completed all three learning tracks — the full OmicsLab curriculum.',
      color: '#f7c948', category: 'Curriculum', earnedBy: 'Complete all three tracks' },

    /* Lab simulation */
    { id: 'first-workflow',     icon: 'flask',        title: 'First Experiment',
      desc: 'Completed your first omics workflow simulation.',
      color: '#00C4A0', category: 'Lab', earnedBy: 'Run any workflow to completion' },
    { id: 'pipeline-pro',       icon: 'dna',          title: 'Pipeline Pro',
      desc: 'Followed the complete bioinformatics pipeline guide.',
      color: '#58a6ff', category: 'Lab', earnedBy: 'View the Pipeline Guide section' },
    { id: 'sabotage-hunter',    icon: 'eye',          title: 'Sabotage Hunter',
      desc: 'Found and identified a hidden error in Sabotage Mode.',
      color: '#f85149', category: 'Lab', earnedBy: 'Detect the error in Sabotage Mode' },
    { id: 'hpc-operator',       icon: 'server',       title: 'HPC Operator',
      desc: 'Generated a SLURM job script and simulated a job run.',
      color: '#d29922', category: 'Lab', earnedBy: 'Use the HPC Job Builder' },

    /* Research */
    { id: 'fair-champion',      icon: 'clipboard',    title: 'FAIR Champion',
      desc: 'Submitted a study to the Reproducibility Hub with a FAIR score above 80.',
      color: '#58a6ff', category: 'Research', earnedBy: 'Submit to Repro Hub with FAIR ≥ 80' },
    { id: 'peer-validator',     icon: 'check-circle', title: 'Peer Validator',
      desc: 'Validated another researcher\'s submission in the Reproducibility Hub.',
      color: '#00C4A0', category: 'Research', earnedBy: 'Validate a community submission' },
    { id: 'repro-score-90',     icon: 'award',        title: 'Reproducibility Star',
      desc: 'Achieved a reproducibility score of 90 or above.',
      color: '#f7c948', category: 'Research', earnedBy: 'Submit with Reproducibility score ≥ 90' },

    /* Knowledge */
    { id: 'disease-expert',     icon: 'virus',        title: 'Disease Expert',
      desc: 'Explored 10 or more diseases in the Disease Explorer.',
      color: '#d2a8ff', category: 'Knowledge', earnedBy: 'Open 10 disease profiles' },
    { id: 'africa-explorer',    icon: 'map-pin',      title: 'Africa Explorer',
      desc: 'Visited all genomics laboratory locations on the Africa Map.',
      color: '#00C4A0', category: 'Knowledge', earnedBy: 'Click all centres on the Africa Map' },
    { id: 'quiz-ace',           icon: 'target',       title: 'Quiz Ace',
      desc: 'Scored 80% or above in a workflow quiz.',
      color: '#58a6ff', category: 'Knowledge', earnedBy: 'Score ≥ 80% in the quiz' },
    { id: 'data-sovereign',     icon: 'scale',        title: 'Data Sovereignty Advocate',
      desc: 'Completed the Africa Data Governance module.',
      color: '#d2a8ff', category: 'Knowledge', earnedBy: 'Read the Data Governance section in Africa Hub' },

    /* Workshop */
    { id: 'workshop-host',      icon: 'layers',       title: 'Workshop Host',
      desc: 'Created and ran an OmicsLab training workshop session.',
      color: '#d29922', category: 'Workshop', earnedBy: 'Start a workshop session' },
    { id: 'cohort-complete',    icon: 'award',        title: 'Cohort Trainer',
      desc: 'Guided a cohort of 5 or more students through a workshop.',
      color: '#f7c948', category: 'Workshop', earnedBy: 'Track 5+ students in workshop mode' },
  ];

  /* ─── Storage ─── */
  function _load() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY) || '{}'); } catch { return {}; }
  }
  function _save(data) { try { localStorage.setItem(STORE_KEY, JSON.stringify(data)); } catch {} }

  function isUnlocked(id) { return !!_load()[id]; }

  function unlock(id) {
    const badge = ALL_BADGES.find(b => b.id === id);
    if (!badge) return;
    const data = _load();
    if (data[id]) return; // already unlocked
    data[id] = { ts: new Date().toISOString() };
    _save(data);
    _showToast(badge);
    _refreshBadgeDisplay();
    // Check all-tracks badge
    const tracks = ['wetlab-certified','bioinfo-certified','pubhealth-certified'];
    if (tracks.every(b => !!data[b])) unlock('all-tracks');
  }

  function _showToast(badge) {
    OmicsLab.Notify.success('Badge unlocked: ' + badge.title, { duration: 5000 });
  }

  function _refreshBadgeDisplay() {
    const grid = document.getElementById('badges-grid');
    if (grid) grid.innerHTML = _renderGrid();
    const count = document.getElementById('badges-count');
    if (count) count.textContent = Object.keys(_load()).length;
  }

  /* ─── Render ─── */
  function _renderGrid() {
    const unlocked = _load();
    const cats = [...new Set(ALL_BADGES.map(b => b.category))];
    return cats.map(cat => {
      const badges = ALL_BADGES.filter(b => b.category === cat);
      return `<div class="badge-category">
        <div class="badge-cat-label">${cat}</div>
        <div class="badge-row">
          ${badges.map(b => {
            const earned = !!unlocked[b.id];
            const ts = unlocked[b.id] ? unlocked[b.id].ts : null;
            return `<div class="badge-item ${earned ? 'earned' : 'locked'}" title="${b.earnedBy}"
                       onclick="${earned ? `OmicsLab.Badges.viewCertificate('${b.id}')` : ''}">
              <div class="badge-circle" style="${earned ? `background:${b.color}20;border-color:${b.color}` : ''}">
                <span class="badge-icon">${earned ? (OmicsLab.Icons?.svg(b.icon, 20) || '') : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>'}</span>
              </div>
              <div class="badge-name">${b.title}</div>
              ${earned && ts ? `<div class="badge-date">${new Date(ts).toLocaleDateString('en-GB',{day:'2-digit',month:'short'})}</div>` : ''}
              ${!earned ? `<div class="badge-hint">${b.earnedBy}</div>` : ''}
            </div>`;
          }).join('')}
        </div>
      </div>`;
    }).join('');
  }

  /* ─── Certificate generator ─── */
  function viewCertificate(badgeId) {
    const badge = ALL_BADGES.find(b => b.id === badgeId);
    const unlocked = _load();
    if (!badge || !unlocked[badgeId]) return;
    const ts = new Date(unlocked[badgeId].ts).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });

    let modal = document.getElementById('cert-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'cert-modal';
      modal.className = 'cert-modal-overlay';
      modal.onclick = (e) => { if (e.target === modal) modal.classList.remove('open'); };
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div class="cert-modal-box">
        <button class="cert-close" onclick="document.getElementById('cert-modal').classList.remove('open')"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
        <div class="cert-paper" id="cert-paper">
          <div class="cert-header">
            <div class="cert-logo">OmicsLab</div>
            <div class="cert-issuer">Interactive Omics Training Platform</div>
          </div>
          <div class="cert-divider"></div>
          <div class="cert-body">
            <div class="cert-presents">This certifies that</div>
            <div class="cert-name" id="cert-name-display">OmicsLab User</div>
            <div class="cert-earned">has successfully earned the badge</div>
            <div class="cert-badge-display" style="color:${badge.color}">
              <span style="display:flex;align-items:center;justify-content:center">${OmicsLab.Icons?.svg(badge.icon, 40) || ''}</span>
              <div class="cert-badge-title" style="color:${badge.color}">${badge.title}</div>
            </div>
            <div class="cert-desc">${badge.desc}</div>
          </div>
          <div class="cert-divider"></div>
          <div class="cert-footer">
            <div class="cert-date">Awarded: ${ts}</div>
            <div class="cert-sig">OmicsLab · omics-lab.github.io</div>
            <div class="cert-consortium">In partnership with H3Africa · H3ABioNet · Africa CDC</div>
          </div>
        </div>
        <div class="cert-actions">
          <input id="cert-name-input" type="text" class="cert-name-field"
                 placeholder="Enter your name for the certificate"
                 oninput="document.getElementById('cert-name-display').textContent=this.value||'OmicsLab User'" />
          <button class="cert-print-btn" onclick="OmicsLab.Badges.printCertificate()"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg> Print / Save PDF</button>
          <button class="cert-close-btn" onclick="document.getElementById('cert-modal').classList.remove('open')">Close</button>
        </div>
      </div>`;
    modal.classList.add('open');
  }

  function printCertificate() {
    const paper = document.getElementById('cert-paper');
    if (!paper) return;
    const win = window.open('', '_blank');
    win.document.write(`<!DOCTYPE html><html><head><title>OmicsLab Certificate</title>
      <style>
        body { margin:0; background:#fff; font-family: Georgia, serif; }
        .cert-paper { max-width:700px; margin:2rem auto; padding:3rem; border:3px solid #00C4A0;
          border-radius:12px; text-align:center; }
        .cert-logo { font-size:1.8rem; font-weight:900; color:#00C4A0; margin-bottom:0.3rem; }
        .cert-issuer { font-size:0.85rem; color:#666; margin-bottom:1.5rem; }
        .cert-divider { border-top:1px solid #ccc; margin:1.2rem 0; }
        .cert-presents { color:#888; font-size:0.9rem; margin-bottom:0.5rem; }
        .cert-name { font-size:2rem; font-weight:700; color:#111; margin:0.5rem 0 1rem; }
        .cert-earned { color:#888; margin-bottom:0.75rem; }
        .cert-badge-title { font-size:1.3rem; font-weight:700; margin-top:0.5rem; }
        .cert-desc { color:#555; margin:0.75rem 0; font-size:0.92rem; }
        .cert-footer { font-size:0.8rem; color:#999; }
        .cert-consortium { margin-top:0.5rem; font-size:0.75rem; }
        @media print { body { -webkit-print-color-adjust:exact; } }
      </style></head><body>${paper.outerHTML}</body></html>`);
    win.document.close();
    setTimeout(() => win.print(), 400);
  }

  /* ─── Panel builder ─── */
  function _buildPanel() {
    const count = Object.keys(_load()).length;
    return `
    <div class="badges-header">
      <div class="badges-total">
        <span id="badges-count">${count}</span> / ${ALL_BADGES.length} badges earned
      </div>
      <p class="badges-hint">Badges unlock automatically as you use OmicsLab. Click any earned badge to view your certificate.</p>
    </div>
    <div id="badges-grid">${_renderGrid()}</div>`;
  }

  /* ─── Dev helper for testing ─── */
  function _unlockAll() {
    ALL_BADGES.forEach(b => {
      const data = _load(); if (!data[b.id]) { data[b.id] = { ts: new Date().toISOString() }; _save(data); }
    });
    _refreshBadgeDisplay();
  }

  function init() {
    const container = document.getElementById('badges-content');
    if (container) container.innerHTML = _buildPanel();
  }

  return { init, unlock, isUnlocked, viewCertificate, printCertificate, _unlockAll, getAllBadges: () => ALL_BADGES };
})();
