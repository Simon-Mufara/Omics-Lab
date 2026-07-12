/* ═══════════════════════════════════════════════════════
   OmicsLab — Bioinformatics Hackathon Platform (Part 4)
   Virtual hackathon challenges for African genomics.
   Team formation, submission tracking, leaderboard.
   All data stored in localStorage.
   ═══════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.Hackathon = (function () {

  const CHALLENGES = [
    {
      id:'h1', status:'active',
      title:'Identifying AMR Transmission Clusters in East Africa',
      theme:'Antimicrobial Resistance',
      color:'#ff6b6b',
      deadline:'2026-09-30',
      description:'Using publicly available Klebsiella pneumoniae WGS data from East African hospitals, identify transmission clusters, infer phylogenies, and predict AMR gene profiles. Deliverable: a Nextflow pipeline and a 2-page report.',
      datasets:[{label:'NCBI BioProject PRJNA12345 (illustrative)',url:'https://www.ncbi.nlm.nih.gov/sra'},{label:'ResFinder database',url:'https://cge.cbs.dtu.dk/services/ResFinder/'}],
      prizes:['$500 (first)','$250 (second)','Certificate for all teams'],
      skills:['Nextflow/Snakemake','GATK/Snippy','IQ-TREE','ResFinder'],
      judges:['Dr. Kwame Mensah (WASCIP)','Dr. Beatrice Mutua (ILRI)'],
    },
    {
      id:'h2', status:'active',
      title:'H3Africa GWAS for Type 2 Diabetes — Sub-Saharan Africa',
      theme:'Complex Disease Genomics',
      color:'#58a6ff',
      deadline:'2026-10-15',
      description:'Using simulated GWAS summary statistics based on the AWI-Gen cohort design, identify and replicate Type 2 Diabetes loci using African-ancestry-specific methods. Visualise population stratification and create a LocusZoom-style plot.',
      datasets:[{label:'AWI-Gen GWAS design docs',url:'https://awigen.org'},{label:'gnomAD AFR reference',url:'https://gnomad.broadinstitute.org'}],
      prizes:['$400 (first)','$200 (second)','H3Africa letter of recognition'],
      skills:['PLINK2','SAIGE','R/ggplot2','FUMA'],
      judges:['Dr. Nadia Mokhachane (UFS)','Dr. Kofi Asante (KNUST)'],
    },
    {
      id:'h3', status:'upcoming',
      title:'Machine Learning for Malaria Drug Resistance Prediction',
      theme:'Computational Genomics / ML',
      color:'#00C4A0',
      deadline:'2026-11-30',
      description:'Build an ML model to predict artemisinin partial resistance in P. falciparum isolates from WGS data. Input: VCF-derived feature matrix. Output: binary classification (sensitive/resistant) with AUC >0.85 target.',
      datasets:[{label:'MalariaGEN Pf7 dataset',url:'https://www.malariagen.net/data/pf7'},{label:'WHO validated kelch13 markers',url:'https://www.who.int/docs/default-source/malaria/artemisinin-resistance/artemisinin-resistance-markers.pdf'}],
      prizes:['$600 (first)','$300 (second)','Sanger/MalariaGEN mentorship session'],
      skills:['Python scikit-learn','Random Forest','XGBoost','pandas'],
      judges:['Dr. Aissata Coulibaly (MRTC)','Dr. Moses Mutuku (KWTRP)'],
    },
  ];

  const LEADERBOARD_SEED = [
    { team:'GenomicsNG Team',        country:'Nigeria',      score:94, members:4, challenge:'h1', status:'submitted' },
    { team:'UCT Computational Bio',  country:'South Africa', score:91, members:3, challenge:'h1', status:'submitted' },
    { team:'KEMRI Bioinformatics',   country:'Kenya',        score:89, members:5, challenge:'h2', status:'submitted' },
    { team:'WACSBIP Coders',         country:'Ghana',        score:87, members:3, challenge:'h2', status:'submitted' },
    { team:'Dakar Data Science',     country:'Senegal',      score:85, members:4, challenge:'h1', status:'submitted' },
    { team:'EthioGenomics Lab',      country:'Ethiopia',     score:82, members:3, challenge:'h2', status:'submitted' },
    { team:'NTD Fighters UG',        country:'Uganda',       score:79, members:2, challenge:'h1', status:'submitted' },
    { team:'BioInfo Togo',           country:'Togo',         score:76, members:3, challenge:'h2', status:'submitted' },
  ];

  function _getMyTeams() { return OmicsLab.Utils?.safeParse('omicslab_hackathon_teams', []) || []; }
  function _saveMyTeams(t) { (OmicsLab.Utils?.safeSet || function(k,v){localStorage.setItem(k, JSON.stringify(v));})('omicslab_hackathon_teams', t); }

  function _joinChallenge(cid) {
    const ch = CHALLENGES.find(c => c.id === cid);
    if (!ch) return;
    const overlay = document.createElement('div');
    overlay.className = 'hk-modal-overlay';
    overlay.innerHTML = `
      <div class="hk-modal">
        <div class="hk-modal-title">Register Team — ${ch.title}</div>
        <div class="hk-modal-field">
          <label class="hk-modal-label">Team name</label>
          <input class="hk-modal-input" id="hk-team-name" placeholder="Your team name">
        </div>
        <div class="hk-modal-field">
          <label class="hk-modal-label">Members (comma-separated names)</label>
          <input class="hk-modal-input" id="hk-team-members" placeholder="Alice, Bob, Carol">
        </div>
        <div class="hk-modal-field">
          <label class="hk-modal-label">Country</label>
          <input class="hk-modal-input" id="hk-team-country" placeholder="e.g. Nigeria">
        </div>
        <div class="hk-modal-actions">
          <button class="hk-modal-cancel" onclick="this.closest('.hk-modal-overlay').remove()">Cancel</button>
          <button class="hk-modal-save" onclick="OmicsLab.Hackathon._registerTeam('${cid}')">Register Team</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
  }

  function _registerTeam(cid) {
    const name = document.getElementById('hk-team-name')?.value.trim();
    const members = document.getElementById('hk-team-members')?.value.trim();
    const country = document.getElementById('hk-team-country')?.value.trim();
    if (!name) return;
    const teams = _getMyTeams();
    teams.push({ id:'t'+Date.now(), cid, name, members, country, status:'registered', score:null, submitted:false });
    _saveMyTeams(teams);
    document.querySelector('.hk-modal-overlay')?.remove();
    _renderMyTeams();
  }

  function _submitWork(teamId) {
    const teams = _getMyTeams();
    const t = teams.find(t => t.id === teamId);
    if (!t) return;
    t.submitted = true;
    t.status = 'submitted';
    _saveMyTeams(teams);
    _renderMyTeams();
  }

  function _renderMyTeams() {
    const el = document.getElementById('hk-my-teams');
    if (!el) return;
    const teams = _getMyTeams();
    if (!teams.length) { el.innerHTML = '<div class="hk-no-teams">No teams registered yet. Join a challenge below.</div>'; return; }
    el.innerHTML = teams.map(t => {
      const ch = CHALLENGES.find(c => c.id === t.cid);
      return `<div class="hk-my-team-card">
        <div class="hk-my-team-hdr">
          <span class="hk-my-team-name">${t.name}</span>
          <span class="hk-status-badge hk-status-${t.status}">${t.status}</span>
        </div>
        <div class="hk-my-team-ch">Challenge: ${ch?.title || t.cid}</div>
        <div class="hk-my-team-meta">${t.members || '—'} · ${t.country || '—'}</div>
        ${!t.submitted ? `<button class="hk-submit-btn" onclick="OmicsLab.Hackathon._submitWork('${t.id}')">Mark as Submitted</button>` : '<div class="hk-submitted-label">Submission recorded</div>'}
      </div>`;
    }).join('');
  }

  function init() {
    const section = document.getElementById('hackathon-section');
    if (!section || section.dataset.hkReady) return;
    section.dataset.hkReady = '1';
    const lb = [...LEADERBOARD_SEED, ..._getMyTeams().filter(t => t.submitted).map(t => ({ team:t.name, country:t.country||'—', score:Math.floor(60+Math.random()*20), members:(t.members||'').split(',').length, challenge:t.cid, status:'submitted' }))].sort((a,b)=>b.score-a.score);
    section.innerHTML = `
      <div class="hk-wrap">
        <div class="hk-header">
          <div class="hk-header-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f97316" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            Africa Bioinformatics Hackathon
          </div>
          <div class="hk-header-sub">Virtual challenges for African genomics researchers · Team up, build, and submit</div>
        </div>
        <div class="hk-my-teams-section">
          <div class="hk-section-label">My Teams</div>
          <div id="hk-my-teams"></div>
        </div>
        <div class="hk-section-label">Active &amp; Upcoming Challenges</div>
        <div class="hk-challenges">
          ${CHALLENGES.map(ch => `
            <div class="hk-challenge-card" style="--ch-color:${ch.color}">
              <div class="hk-ch-hdr">
                <div>
                  <div class="hk-ch-theme">${ch.theme}</div>
                  <div class="hk-ch-title">${ch.title}</div>
                </div>
                <span class="hk-ch-status hk-ch-${ch.status}">${ch.status}</span>
              </div>
              <div class="hk-ch-desc">${ch.description}</div>
              <div class="hk-ch-meta">
                <span>Deadline: <strong>${ch.deadline}</strong></span>
                <span>Skills: ${ch.skills.join(' · ')}</span>
              </div>
              <div class="hk-ch-prizes">Prizes: ${ch.prizes.join(' | ')}</div>
              <div class="hk-ch-datasets">
                Datasets: ${ch.datasets.map(d => `<a class="hk-ds-link" href="${d.url}" target="_blank" rel="noopener">${d.label}</a>`).join(', ')}
              </div>
              ${ch.status === 'active' ? `<button class="hk-join-btn" style="background:${ch.color}20;color:${ch.color};border-color:${ch.color}40" onclick="OmicsLab.Hackathon._joinChallenge('${ch.id}')">Register Team</button>` : '<div class="hk-upcoming-note">Opens soon — watch for announcements</div>'}
            </div>`).join('')}
        </div>
        <div class="hk-section-label" style="margin-top:2rem">Leaderboard</div>
        <div class="hk-leaderboard">
          ${lb.slice(0,10).map((t, i) => `<div class="hk-lb-row">
            <span class="hk-lb-rank" style="color:${['#e3b341','#A8A098','#f97316'][i]||'#354060'}">#${i+1}</span>
            <span class="hk-lb-team">${t.team}</span>
            <span class="hk-lb-country">${t.country}</span>
            <span class="hk-lb-score">${t.score || '—'}</span>
          </div>`).join('')}
        </div>
      </div>`;
    _renderMyTeams();
  }

  return { init, _joinChallenge, _registerTeam, _submitWork };
})();
