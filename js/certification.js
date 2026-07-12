/* ═══════════════════════════════════════════════════════
   OmicsLab — Certification Program (Part 8)
   Track learning progress across OmicsLab modules,
   earn badges, and generate a verifiable certificate.
   All stored in localStorage.
   ═══════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.Certification = (function () {

  const TRACKS = [
    {
      id: 'genomics-foundations',
      title: 'Genomics Foundations',
      level: 'Beginner',
      color: '#58a6ff',
      badge: 'GF',
      desc: 'Core concepts in genomics, sequencing, and variant calling.',
      modules: [
        { id:'m-variants', title:'Variant Interpreter', page:'variants', points:20 },
        { id:'m-bionlp', title:'BioNLP Entity Recogniser', page:'bionlp', points:15 },
        { id:'m-glossary', title:'Multilingual Glossary (50 terms)', page:'glossary', points:10 },
        { id:'m-genome', title:'Genome Browser Exploration', page:'genome-browser', points:25 },
      ],
    },
    {
      id: 'africa-omics',
      title: 'Africa-Focused Omics',
      level: 'Intermediate',
      color: '#f97316',
      badge: 'AO',
      desc: 'Population genetics, H3Africa resources, and African pathogen genomics.',
      modules: [
        { id:'m-popstruct', title:'Population Structure Analysis', page:'popstruct', points:30 },
        { id:'m-h3africa', title:'H3Africa Portal Explorer', page:'h3africa', points:20 },
        { id:'m-pathogen', title:'Pathogen Tracker Review', page:'pathogen-tracker', points:20 },
        { id:'m-amr', title:'AMR Resistance Profiling', page:'amr', points:25 },
      ],
    },
    {
      id: 'computational-tools',
      title: 'Computational Bioinformatics',
      level: 'Intermediate',
      color: '#bc8cff',
      badge: 'CB',
      desc: 'Bioinformatics workflows, QC, and sequence analysis.',
      modules: [
        { id:'m-nanopore', title:'Oxford Nanopore QC', page:'nanopore', points:25 },
        { id:'m-codon', title:'Codon Usage Analysis', page:'codon', points:20 },
        { id:'m-kraken', title:'Metagenomics with Kraken2', page:'kraken', points:25 },
        { id:'m-pipeline', title:'Pipeline Generator', page:'pipeline-gen', points:30 },
      ],
    },
    {
      id: 'research-skills',
      title: 'Research & Communication',
      level: 'Advanced',
      color: '#00C4A0',
      badge: 'RS',
      desc: 'Scientific writing, grant applications, meta-analysis, and lab documentation.',
      modules: [
        { id:'m-thesis', title:'Thesis Coach (3 sessions)', page:'thesis', points:30 },
        { id:'m-grant', title:'Grant Writing (2 applications)', page:'grants', points:35 },
        { id:'m-meta', title:'Meta-analysis with Forest Plot', page:'metaanalysis', points:30 },
        { id:'m-lab', title:'Digital Lab Notebook (5 entries)', page:'labnotebook', points:20 },
      ],
    },
    {
      id: 'ai-genomics',
      title: 'AI in Genomics',
      level: 'Advanced',
      color: '#e3b341',
      badge: 'AI',
      desc: 'Using AI tools for bioinformatics interpretation and research acceleration.',
      modules: [
        { id:'m-ai', title:'AI Assistant (10 conversations)', page:'ai', points:25 },
        { id:'m-vi-ai', title:'AI-Enhanced Variant Interpretation', page:'variants', points:25 },
        { id:'m-grant-ai', title:'AI Grant Polish', page:'grants', points:20 },
        { id:'m-api', title:'Developer API Exploration', page:'api-docs', points:20 },
      ],
    },
  ];

  const CERT_KEY = 'omicslab_certification';

  function _getState() { return JSON.parse(localStorage.getItem(CERT_KEY) || '{"completed":{},"profile":{}}'); }
  function _saveState(s) { localStorage.setItem(CERT_KEY, JSON.stringify(s)); }

  function _toggleModule(moduleId) {
    const s = _getState();
    if (s.completed[moduleId]) delete s.completed[moduleId];
    else s.completed[moduleId] = new Date().toISOString().slice(0,10);
    _saveState(s);
    _render();
  }

  function _trackProgress(trackId) {
    const s = _getState();
    const track = TRACKS.find(t => t.id === trackId);
    if (!track) return { done: 0, total: track?.modules.length || 0, points: 0, maxPoints: 0, pct: 0 };
    const done = track.modules.filter(m => s.completed[m.id]).length;
    const points = track.modules.filter(m => s.completed[m.id]).reduce((a, m) => a + m.points, 0);
    const maxPoints = track.modules.reduce((a, m) => a + m.points, 0);
    return { done, total: track.modules.length, points, maxPoints, pct: Math.round((done / track.modules.length) * 100) };
  }

  function _totalPoints() {
    const s = _getState();
    return TRACKS.flatMap(t => t.modules).filter(m => s.completed[m.id]).reduce((a, m) => a + m.points, 0);
  }

  function _generateCertificate() {
    const s = _getState();
    const name = s.profile?.name || 'OmicsLab Learner';
    const completedTracks = TRACKS.filter(t => _trackProgress(t.id).pct === 100);
    if (!completedTracks.length) {
      alert('Complete at least one full track to generate a certificate.');
      return;
    }
    const today = new Date().toISOString().slice(0,10);
    const certId = 'OL-' + Date.now().toString(36).toUpperCase();
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="560" viewBox="0 0 800 560" style="font-family:Georgia,serif;background:#0D1524">
      <rect width="800" height="560" fill="#0D1524"/>
      <rect x="20" y="20" width="760" height="520" fill="none" stroke="#e3b341" stroke-width="2" rx="12"/>
      <rect x="28" y="28" width="744" height="504" fill="none" stroke="#e3b341" stroke-width="0.5" rx="10"/>
      <text x="400" y="80" text-anchor="middle" font-size="13" fill="#e3b341" font-family="Georgia,serif" letter-spacing="4">CERTIFICATE OF COMPLETION</text>
      <text x="400" y="120" text-anchor="middle" font-size="28" fill="#E4DDD2" font-weight="bold">OmicsLab Bioinformatics Platform</text>
      <text x="400" y="165" text-anchor="middle" font-size="15" fill="#A8A098">This certifies that</text>
      <text x="400" y="215" text-anchor="middle" font-size="34" fill="#58a6ff" font-style="italic">${name}</text>
      <line x1="160" y1="230" x2="640" y2="230" stroke="#e3b341" stroke-width="0.5"/>
      <text x="400" y="265" text-anchor="middle" font-size="14" fill="#A8A098">has successfully completed the following tracks:</text>
      ${completedTracks.map((t, i) => `<text x="400" y="${300 + i * 28}" text-anchor="middle" font-size="15" fill="${t.color}" font-weight="bold">${t.badge} · ${t.title} (${t.level})</text>`).join('')}
      <text x="400" y="${300 + completedTracks.length * 28 + 30}" text-anchor="middle" font-size="12" fill="#354060">Total points earned: ${_totalPoints()}</text>
      <text x="400" y="${300 + completedTracks.length * 28 + 60}" text-anchor="middle" font-size="12" fill="#354060">Issued: ${today} · Certificate ID: ${certId}</text>
      <text x="400" y="${300 + completedTracks.length * 28 + 90}" text-anchor="middle" font-size="11" fill="#243048">omicslab.africa · Built for Africa's bioinformatics community</text>
    </svg>`;
    const blob = new Blob([svg], { type:'image/svg+xml' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `omicslab-certificate-${name.replace(/\s+/g,'-')}.svg`; a.click();
  }

  function _saveProfile() {
    const name = document.getElementById('cert-name')?.value.trim();
    const inst = document.getElementById('cert-inst')?.value.trim();
    if (!name) return;
    const s = _getState();
    s.profile = { name, inst };
    _saveState(s);
    _render();
  }

  function _render() {
    const s = _getState();
    const total = _totalPoints();
    const maxTotal = TRACKS.flatMap(t => t.modules).reduce((a, m) => a + m.points, 0);
    const completed = TRACKS.filter(t => _trackProgress(t.id).pct === 100).length;
    const el = document.getElementById('cert-body');
    if (!el) return;
    el.innerHTML = `
      <div class="ct-profile-card">
        <div class="ct-profile-title">Your Profile</div>
        <div class="ct-profile-row">
          <input class="ct-input" id="cert-name" placeholder="Full name" value="${s.profile?.name || ''}">
          <input class="ct-input" id="cert-inst" placeholder="Institution" value="${s.profile?.inst || ''}">
          <button class="ct-save-profile-btn" onclick="OmicsLab.Certification._saveProfile()">Save</button>
        </div>
        <div class="ct-totals">
          <div class="ct-total-chip"><span class="ct-total-n">${total}</span><span class="ct-total-l">Points earned</span></div>
          <div class="ct-total-chip"><span class="ct-total-n">${completed}/${TRACKS.length}</span><span class="ct-total-l">Tracks complete</span></div>
          <div class="ct-total-chip"><span class="ct-total-n">${Math.round((total/maxTotal)*100)}%</span><span class="ct-total-l">Overall progress</span></div>
        </div>
        <div style="display:flex;gap:.6rem;flex-wrap:wrap">
          <button class="ct-cert-btn" onclick="OmicsLab.Certification._generateCertificate()">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>
            Download Certificate (SVG)
          </button>
          <button class="ct-cert-btn" style="background:rgba(88,166,255,.12);border-color:rgba(88,166,255,.3);color:#58a6ff" onclick="OmicsLab.Certification._generateOpenBadge()">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            Open Badge 3.0 JSON-LD
          </button>
        </div>
      </div>
      ${TRACKS.map(t => {
        const prog = _trackProgress(t.id);
        return `<div class="ct-track-card" style="border-left-color:${t.color}">
          <div class="ct-track-hdr">
            <div>
              <span class="ct-track-badge" style="background:${t.color}20;color:${t.color}">${t.badge}</span>
              <span class="ct-track-title">${t.title}</span>
              <span class="ct-track-level">${t.level}</span>
            </div>
            <span class="ct-track-pct" style="color:${prog.pct===100?'#00C4A0':t.color}">${prog.pct}%</span>
          </div>
          <div class="ct-track-desc">${t.desc}</div>
          <div class="ct-prog-bar-wrap"><div class="ct-prog-bar" style="width:${prog.pct}%;background:${t.color}"></div></div>
          <div class="ct-module-list">
            ${t.modules.map(m => `<div class="ct-module-row">
              <button class="ct-check-btn ct-check-${s.completed[m.id]?'done':''}" onclick="OmicsLab.Certification._toggleModule('${m.id}')">
                ${s.completed[m.id] ? `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#00C4A0" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>` : ''}
              </button>
              <span class="ct-module-title ${s.completed[m.id]?'ct-module-done':''}">${m.title}</span>
              <button class="ct-goto-btn" onclick="OmicsLab.Router&&OmicsLab.Router.navigate('${m.page}')">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                Go
              </button>
              <span class="ct-module-pts" style="color:${s.completed[m.id]?t.color:'#354060'}">${s.completed[m.id]?'+':''}${m.points}pts</span>
            </div>`).join('')}
          </div>
        </div>`;
      }).join('')}`;
  }

  /* ─── Open Badges 3.0 / W3C Verifiable Credential ─── */
  function _generateOpenBadge() {
    /* Client-side UX gate only — see js/entitlements.js's header comment.
       A verifiable Open Badge credential naming a real "issuer" is exactly
       the kind of thing worth a real check; today that check is the same
       trust boundary as everything else in this file (a local SVG/JSON
       download), so treat this as a UX nudge, not a security boundary,
       until credential issuance moves server-side. */
    if (OmicsLab.Entitlements && !OmicsLab.Entitlements.hasAccess('certificate.verified')) {
      OmicsLab.Toast?.show('Verifiable Open Badge credentials are a Scholar feature — see Pricing', 'warning');
      OmicsLab.Router?.navigate('pricing');
      return;
    }
    const s = _getState();
    const name = s.profile?.name || 'OmicsLab Learner';
    const inst = s.profile?.inst || '';
    const completedTracks = TRACKS.filter(t => _trackProgress(t.id).pct === 100);
    if (!completedTracks.length) {
      OmicsLab.Toast?.show('Complete at least one full track to generate a credential', 'warning');
      return;
    }
    const credId   = 'urn:uuid:' + 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0;
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    const issuedAt = new Date().toISOString();

    const credential = {
      '@context': [
        'https://www.w3.org/2018/credentials/v1',
        'https://purl.imsglobal.org/spec/ob/v3p0/context.json',
      ],
      id: credId,
      type: ['VerifiableCredential', 'OpenBadgeCredential'],
      issuer: {
        id: 'https://omicsdatalab.tech/',
        type: 'Profile',
        name: 'OmicsLab Bioinformatics Platform',
        url: 'https://omicsdatalab.tech/',
        description: 'Africa-first interactive omics training platform — offline, free, open source.',
      },
      issuanceDate: issuedAt,
      credentialSubject: {
        id: 'did:omicslab:' + btoa(name).replace(/[+=\/]/g, '').slice(0, 16),
        type: 'AchievementSubject',
        name,
        institution: inst || undefined,
        achievement: completedTracks.map(t => ({
          id: `https://omicsdatalab.tech/achievements/${t.id}`,
          type: 'Achievement',
          name: t.title,
          description: t.desc,
          level: t.level,
          points: _trackProgress(t.id).maxPoints,
          criteria: { narrative: `Completed all modules in the ${t.title} track on OmicsLab.` },
        })),
        totalPoints: _totalPoints(),
        completedAt: issuedAt,
      },
      proof: {
        type: 'Ed25519Signature2020',
        created: issuedAt,
        verificationMethod: 'https://omicsdatalab.tech/#key-1',
        proofPurpose: 'assertionMethod',
        proofValue: 'SELF_ISSUED_DEMO_' + Date.now().toString(36).toUpperCase(),
        warning: 'Self-issued for demonstration — not cryptographically signed by a CA.',
      },
    };

    /* Save to localStorage */
    const existing = JSON.parse(localStorage.getItem('omicslab_credentials') || '[]');
    existing.push(credential);
    localStorage.setItem('omicslab_credentials', JSON.stringify(existing));

    /* Download JSON-LD */
    const blob = new Blob([JSON.stringify(credential, null, 2)], { type: 'application/ld+json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `omicslab-credential-${name.replace(/\s+/g,'-')}-${issuedAt.slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);

    OmicsLab.Toast?.show('Open Badge 3.0 credential downloaded!', 'success');
    /* Show verification modal */
    _showCredentialModal(credential);
    /* Award XP */
    OmicsLab.SkillTree?.awardXP('certificate_earned');
  }

  function _showCredentialModal(cred) {
    const existing = document.getElementById('ct-cred-modal');
    if (existing) existing.remove();
    const modal = document.createElement('div');
    modal.id = 'ct-cred-modal';
    modal.className = 'ct-modal-overlay';
    modal.innerHTML = `
      <div class="ct-modal">
        <div class="ct-modal-header">
          <span>${OmicsLab.Icons?.svg('award',16)||''} Open Badge 3.0 Credential</span>
          <button onclick="document.getElementById('ct-cred-modal').remove()">${OmicsLab.Icons?.svg('x',14)||'x'}</button>
        </div>
        <div class="ct-modal-body">
          <p class="ct-cred-note">Your W3C Verifiable Credential has been downloaded and saved locally. Share the JSON file with employers or institutions — they can paste it below to verify.</p>
          <div class="ct-cred-id">ID: <code>${cred.id}</code></div>
          <div class="ct-cred-tracks">
            ${(cred.credentialSubject?.achievement || []).map(a => `
              <div class="ct-cred-track-row">
                ${OmicsLab.Icons?.svg('check-circle',12)||''} ${a.name} — ${a.level}
              </div>
            `).join('')}
          </div>
          <button class="btn btn-ghost btn-sm ct-copy-cred" onclick="navigator.clipboard?.writeText(${JSON.stringify(JSON.stringify(cred,null,2))}).then(()=>OmicsLab.Toast?.show('Credential JSON copied','success'))">
            ${OmicsLab.Icons?.svg('clipboard',12)||''} Copy Credential JSON
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
  }

  /* ─── Verify pasted credential ─── */
  function verifyCredential(jsonText) {
    try {
      const cred = JSON.parse(jsonText);
      if (!cred['@context'] || !cred.type?.includes('OpenBadgeCredential')) {
        return { valid: false, reason: 'Not a valid Open Badge 3.0 credential.' };
      }
      const subject = cred.credentialSubject || {};
      return {
        valid: true,
        name: subject.name,
        institution: subject.institution,
        tracks: (subject.achievement || []).map(a => a.name),
        points: subject.totalPoints,
        issued: cred.issuanceDate,
        issuer: cred.issuer?.name,
        id: cred.id,
        warning: cred.proof?.warning,
      };
    } catch { return { valid: false, reason: 'Invalid JSON — paste the full credential file content.' }; }
  }

  function init() {
    const section = document.getElementById('certification-section');
    if (!section || section.dataset.ctReady) return;
    section.dataset.ctReady = '1';
    section.innerHTML = `
      <div class="ct-wrap">
        <div class="ct-header">
          <div class="ct-header-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e3b341" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>
            Certification Program
          </div>
          <div class="ct-header-sub">Track your OmicsLab learning journey · Earn verifiable badges · Download Open Badge 3.0 credentials</div>
        </div>
        <div id="cert-body"></div>
      </div>`;
    _render();
  }

  return { init, _toggleModule, _generateCertificate, _generateOpenBadge, verifyCredential, _showCredentialModal, _saveProfile, _render };
})();
