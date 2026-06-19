/* ═══════════════════════════════════════════════════════
   OmicsLab — Peer Mentorship Network (Part 4)
   Connect African bioinformatics students with mentors.
   All data in localStorage — fully offline.
   ═══════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.Mentorship = (function () {

  const SEED_MENTORS = [
    { id:'m1', name:'Dr. Nneka Obi', country:'Nigeria', city:'Abuja', inst:'NIMR', role:'Senior Researcher', focus:['Genomics','Metagenomics'], skills:['Python','R','Nextflow','BWA','GATK'], bio:'10 years in infectious disease genomics. Focus on AMR and NTDs. Open to mentoring MSc and PhD students.', openSlots:2, languages:['English','Yoruba'], contact:'nneka.obi@example.org' },
    { id:'m2', name:'Dr. Kwesi Asante', country:'Ghana', city:'Kumasi', inst:'KNUST', role:'Associate Professor', focus:['GWAS','Population Genetics'], skills:['PLINK2','SAIGE','R/Bioconductor','ADMIXTURE'], bio:'Lead investigator on AWI-Gen GWAS sub-study. Mentoring graduate students in population genetics.', openSlots:3, languages:['English','Twi'], contact:'kwesi.asante@example.edu.gh' },
    { id:'m3', name:'Dr. Tigist Worku', country:'Ethiopia', city:'Addis Ababa', inst:'AHRI', role:'Principal Scientist', focus:['TB Genomics','Phylogenetics'], skills:['Snippy','IQ-TREE','BEAST2','Python'], bio:'Whole-genome sequencing of M. tuberculosis strains in Ethiopia. Trained 40+ researchers in WGS analysis.', openSlots:1, languages:['English','Amharic'], contact:'tigist.worku@example.org.et' },
    { id:'m4', name:'Dr. Amara Diallo', country:'Senegal', city:'Dakar', inst:'UCAD / WACCBIP', role:'Postdoctoral Fellow', focus:['Malaria Genomics','ML in Genomics'], skills:['Python','scikit-learn','MalariaGEN tools','R'], bio:'Working on kelch13 resistance evolution. Happy to mentor students in malaria genomics and ML approaches.', openSlots:3, languages:['English','French','Wolof'], contact:'amara.diallo@example.ucad.sn' },
    { id:'m5', name:'Dr. Patience Mwangi', country:'Kenya', city:'Nairobi', inst:'KEMRI-Wellcome', role:'Research Scientist', focus:['Clinical Genomics','Sickle Cell'], skills:['GATK','ClinVar','R','BWA-MEM'], bio:'Variant interpretation for sickle cell disease and G6PD. Passionate about training the next generation.', openSlots:2, languages:['English','Swahili'], contact:'patience.mwangi@example.kemri.org' },
    { id:'m6', name:'Dr. Oladapo Fadahunsi', country:'Nigeria', city:'Ibadan', inst:'UI-IAMRAT', role:'Lecturer II', focus:['Epigenomics','RNA-seq'], skills:['DESeq2','STAR','Bismark','Python'], bio:'Epigenetic regulation in sickle cell anaemia. MSc and PhD supervision available.', openSlots:2, languages:['English','Yoruba'], contact:'oladapo.fadahunsi@example.ui.edu.ng' },
    { id:'m7', name:'Dr. Cedric Gondwe', country:'Malawi', city:'Blantyre', inst:'MLW', role:'Clinical Research Fellow', focus:['Bacterial Genomics','AMR'], skills:['ARIBA','ResFinder','Kraken2','Nextflow'], bio:'AMR and phylogenomics of Salmonella in Malawi. Collaborative mentor for early-stage researchers.', openSlots:2, languages:['English','Chichewa'], contact:'cedric.gondwe@example.mlw.mw' },
    { id:'m8', name:'Dr. Saoussane Ouedraogo', country:"Burkina Faso", city:'Ouagadougou', inst:'IRSS', role:'Research Director', focus:['Epidemiology Genomics','NTDs'], skills:['BEAST','MEGA','Python','R'], bio:'Phylogeography of neglected tropical diseases. Bilingual mentorship in English and French.', openSlots:1, languages:['English','French','Mooré'], contact:'saoussane.ouedraogo@example.irss.bf' },
    { id:'m9', name:'Dr. Leontine Nkurunziza', country:'Rwanda', city:'Kigali', inst:'UR-CBE', role:'Senior Lecturer', focus:['Bioinformatics Education','Pipeline Dev'], skills:['Nextflow','Snakemake','Docker','Python','R'], bio:'Founded Rwanda bioinformatics training program. Mentoring on pipeline development and reproducible research.', openSlots:4, languages:['English','French','Kinyarwanda'], contact:'leontine.nkurunziza@example.ur.ac.rw' },
    { id:'m10', name:'Dr. Mustapha Ibrahim', country:'Sudan', city:'Khartoum', inst:'U of Khartoum', role:'Asst. Professor', focus:['Population Genomics','GWAS'], skills:['PLINK','SHAPEIT','R','Python'], bio:'Genetic determinants of malaria susceptibility in Sudan. First point of contact for anglophone and arabophone students.', openSlots:2, languages:['English','Arabic'], contact:'mustapha.ibrahim@example.uofk.edu' },
  ];

  function _getMentors() {
    const saved = JSON.parse(localStorage.getItem('omicslab_mentor_profiles') || '[]');
    return [...SEED_MENTORS, ...saved];
  }
  function _getMyProfile() { return JSON.parse(localStorage.getItem('omicslab_my_mentor_profile') || 'null'); }
  function _getConnections() { return JSON.parse(localStorage.getItem('omicslab_mentorship_conns') || '[]'); }
  function _saveConnections(c) { localStorage.setItem('omicslab_mentorship_conns', JSON.stringify(c)); }

  function _connect(mid) {
    const me = _getMyProfile();
    if (!me) { _showRegisterModal('mentee'); return; }
    const conns = _getConnections();
    if (conns.find(c => c.mid === mid)) { _toast('Already connected with this mentor.'); return; }
    conns.push({ mid, date: new Date().toISOString().slice(0,10), status:'pending' });
    _saveConnections(conns);
    _toast('Connection request sent!');
    _renderCards(_currentFilter());
  }

  function _toast(msg) {
    const t = document.createElement('div');
    t.className = 'ms-toast';
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2800);
  }

  function _currentFilter() {
    return {
      q: document.getElementById('ms-q')?.value.toLowerCase() || '',
      country: document.getElementById('ms-country')?.value || '',
      focus: document.getElementById('ms-focus')?.value || '',
    };
  }

  function _filter() { _renderCards(_currentFilter()); }

  function _renderCards({ q, country, focus }) {
    const conns = _getConnections();
    const el = document.getElementById('ms-list');
    if (!el) return;
    const all = _getMentors().filter(m => {
      const txt = [m.name, m.country, m.city, m.inst, m.bio, ...m.focus, ...m.skills].join(' ').toLowerCase();
      return (!q || txt.includes(q))
        && (!country || m.country === country)
        && (!focus || m.focus.some(f => f.toLowerCase().includes(focus.toLowerCase())));
    });
    if (!all.length) { el.innerHTML = '<div class="ms-empty">No mentors found.</div>'; return; }
    el.innerHTML = all.map(m => {
      const conn = conns.find(c => c.mid === m.id);
      const slotColor = m.openSlots > 2 ? '#3fb950' : m.openSlots === 1 ? '#e3b341' : '#58a6ff';
      return `<div class="ms-card">
        <div class="ms-card-hdr">
          <div class="ms-avatar">${m.name.split(' ').map(w=>w[0]).slice(0,2).join('')}</div>
          <div class="ms-meta">
            <div class="ms-name">${m.name}</div>
            <div class="ms-role-loc">${m.role} · ${m.city}, ${m.country}</div>
            <div class="ms-inst">${m.inst}</div>
          </div>
        </div>
        <div class="ms-bio">${m.bio}</div>
        <div class="ms-focus-row">${m.focus.map(f => `<span class="ms-focus-tag">${f}</span>`).join('')}</div>
        <div class="ms-skills-row">${m.skills.map(s => `<span class="ms-skill">${s}</span>`).join('')}</div>
        <div class="ms-footer">
          <span class="ms-slots" style="color:${slotColor}">${m.openSlots} slot${m.openSlots!==1?'s':''} open</span>
          <span class="ms-langs">${m.languages.join(' · ')}</span>
          ${conn
            ? `<span class="ms-conn-badge ms-conn-${conn.status}">${conn.status === 'pending' ? 'Request sent' : 'Connected'}</span>`
            : `<button class="ms-connect-btn" onclick="OmicsLab.Mentorship._connect('${m.id}')">Connect</button>`}
        </div>
      </div>`;
    }).join('');
  }

  function _showRegisterModal(role) {
    const overlay = document.createElement('div');
    overlay.className = 'ms-modal-overlay';
    overlay.innerHTML = `
      <div class="ms-modal">
        <div class="ms-modal-title">${role === 'mentor' ? 'Offer Mentorship' : 'Create Your Mentee Profile'}</div>
        <div class="ms-modal-field"><label class="ms-modal-label">Full name</label><input class="ms-modal-input" id="ms-r-name"></div>
        <div class="ms-modal-field"><label class="ms-modal-label">Country</label><input class="ms-modal-input" id="ms-r-country"></div>
        <div class="ms-modal-field"><label class="ms-modal-label">Institution</label><input class="ms-modal-input" id="ms-r-inst"></div>
        <div class="ms-modal-field"><label class="ms-modal-label">Degree level / role</label><input class="ms-modal-input" id="ms-r-degree" placeholder="e.g. MSc student, PhD candidate, Postdoc"></div>
        <div class="ms-modal-field"><label class="ms-modal-label">Research focus (comma-separated)</label><input class="ms-modal-input" id="ms-r-focus" placeholder="e.g. GWAS, Malaria Genomics"></div>
        <div class="ms-modal-field"><label class="ms-modal-label">Bio / goals (2–3 sentences)</label><textarea class="ms-modal-input" id="ms-r-bio" rows="3"></textarea></div>
        <div class="ms-modal-actions">
          <button class="ms-modal-cancel" onclick="this.closest('.ms-modal-overlay').remove()">Cancel</button>
          <button class="ms-modal-save" onclick="OmicsLab.Mentorship._saveProfile('${role}')">Save Profile</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
  }

  function _saveProfile(role) {
    const p = {
      role,
      name: document.getElementById('ms-r-name')?.value.trim(),
      country: document.getElementById('ms-r-country')?.value.trim(),
      inst: document.getElementById('ms-r-inst')?.value.trim(),
      degree: document.getElementById('ms-r-degree')?.value.trim(),
      focus: (document.getElementById('ms-r-focus')?.value || '').split(',').map(s=>s.trim()).filter(Boolean),
      bio: document.getElementById('ms-r-bio')?.value.trim(),
    };
    if (!p.name) return;
    localStorage.setItem('omicslab_my_mentor_profile', JSON.stringify(p));
    document.querySelector('.ms-modal-overlay')?.remove();
    _renderMyProfile();
    _toast('Profile saved!');
  }

  function _renderMyProfile() {
    const el = document.getElementById('ms-my-profile');
    if (!el) return;
    const p = _getMyProfile();
    const conns = _getConnections();
    if (!p) {
      el.innerHTML = `
        <div class="ms-no-profile">
          Create a profile to connect with mentors or offer mentorship.
          <div class="ms-reg-btns">
            <button class="ms-reg-btn-mentee" onclick="OmicsLab.Mentorship._showRegisterModal('mentee')">I am looking for a mentor</button>
            <button class="ms-reg-btn-mentor" onclick="OmicsLab.Mentorship._showRegisterModal('mentor')">I want to mentor others</button>
          </div>
        </div>`;
      return;
    }
    const connList = conns.map(c => {
      const m = _getMentors().find(x => x.id === c.mid);
      return m ? `<span class="ms-conn-chip">${m.name} (${c.status})</span>` : '';
    }).join('');
    el.innerHTML = `
      <div class="ms-my-card">
        <div class="ms-my-hdr">
          <span class="ms-my-name">${p.name}</span>
          <span class="ms-role-badge">${p.role}</span>
        </div>
        <div class="ms-my-meta">${p.degree || '—'} · ${p.inst || '—'} · ${p.country || '—'}</div>
        <div class="ms-my-bio">${p.bio || ''}</div>
        ${conns.length ? `<div class="ms-my-conns">Connections: ${connList}</div>` : ''}
        <button class="ms-edit-btn" onclick="OmicsLab.Mentorship._showRegisterModal('${p.role}')">Edit Profile</button>
      </div>`;
  }

  function init() {
    const section = document.getElementById('mentorship-section');
    if (!section || section.dataset.msReady) return;
    section.dataset.msReady = '1';
    const allCountries = [...new Set(SEED_MENTORS.map(m => m.country))].sort();
    const allFoci = [...new Set(SEED_MENTORS.flatMap(m => m.focus))].sort();
    section.innerHTML = `
      <div class="ms-wrap">
        <div class="ms-header">
          <div class="ms-header-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#bc8cff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            Peer Mentorship Network
          </div>
          <div class="ms-header-sub">Connect African bioinformatics students with experienced researchers</div>
        </div>
        <div class="ms-my-profile-section">
          <div class="ms-section-label">My Profile</div>
          <div id="ms-my-profile"></div>
        </div>
        <div class="ms-section-label">Find a Mentor</div>
        <div class="ms-filters">
          <input class="ms-search" id="ms-q" placeholder="Search name, skills, focus..." oninput="OmicsLab.Mentorship._filter()">
          <select class="ms-filter-sel" id="ms-country" onchange="OmicsLab.Mentorship._filter()">
            <option value="">All countries</option>
            ${allCountries.map(c => `<option>${c}</option>`).join('')}
          </select>
          <select class="ms-filter-sel" id="ms-focus" onchange="OmicsLab.Mentorship._filter()">
            <option value="">All focus areas</option>
            ${allFoci.map(f => `<option>${f}</option>`).join('')}
          </select>
        </div>
        <div id="ms-list" class="ms-list"></div>
      </div>`;
    _renderMyProfile();
    _renderCards({ q:'', country:'', focus:'' });
  }

  return { init, _connect, _filter, _showRegisterModal, _saveProfile };
})();
