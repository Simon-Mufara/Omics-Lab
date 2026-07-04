/* ═══════════════════════════════════════════════════════
   OmicsLab — Africa Researcher Directory (Part 4)
   Search and connect with African genomics researchers.
   50 synthetic researcher profiles pre-populated.
   Users can register their own profile (localStorage).
   ═══════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.Directory = (function () {

  const BASE_PROFILES = [
    { id:'p1',  name:'Dr. Amara Osei-Bonsu',     country:'Kenya',        city:'Nairobi',      inst:'KEMRI-Wellcome Trust',           degree:'PhD',    role:'PI',            focus:['Malaria genomics','WGS','Population genetics'], skills:['GATK','R','Python'], contact:'a.osei@kemri.org' },
    { id:'p2',  name:'Sipho Dlamini',             country:'South Africa', city:'Cape Town',    inst:'University of Cape Town',        degree:'PhD',    role:'Student',       focus:['Sickle cell disease','Transcriptomics','RNA-seq'], skills:['DESeq2','STAR','Bioconductor'] },
    { id:'p3',  name:'Fatima Al-Rashidi',         country:'Uganda',       city:'Entebbe',      inst:'APCDR',                          degree:'MSc',    role:'Postdoc',       focus:['Population genomics','H3Africa','Bioinformatics pipelines'], skills:['Nextflow','BWA','VEP'] },
    { id:'p4',  name:'Dr. Kwame Mensah',          country:'Ghana',        city:'Accra',        inst:'WACSBIP / Noguchi Institute',    degree:'PhD',    role:'PI',            focus:['TB genomics','WGS','AMR'], skills:['Illumina','GATK','R'] },
    { id:'p5',  name:'Ngozi Adeyemi',             country:'Nigeria',      city:'Ibadan',       inst:'IITA / University of Ibadan',    degree:'PhD',    role:'Researcher',    focus:['Metagenomics','Soil microbiome','Plant genomics'], skills:['Kraken2','QIIME2','Python'] },
    { id:'p6',  name:'Dr. Meriem Bensalem',       country:'Morocco',      city:'Rabat',        inst:'Mohammed V University',          degree:'PhD',    role:'PI',            focus:['Genomics of North African populations','GWAS'], skills:['PLINK','SAIGE','R'] },
    { id:'p7',  name:'Emmanuel Kiplangat',        country:'Kenya',        city:'Kisumu',       inst:'KEMRI CDC',                      degree:'MSc',    role:'Student',       focus:['Malaria drug resistance','kelch13','P. falciparum'], skills:['Python','GATK','R'] },
    { id:'p8',  name:'Dr. Aissata Coulibaly',     country:'Mali',         city:'Bamako',       inst:'MRTC / USTTB',                   degree:'PhD',    role:'Postdoc',       focus:['Malaria genomics','Vaccine trials','GWAS'], skills:['BWA-MEM2','R','bcftools'] },
    { id:'p9',  name:'Dr. Tendai Mutisi',         country:'Zimbabwe',     city:'Harare',       inst:'University of Zimbabwe',         degree:'PhD',    role:'PI',            focus:['HIV genomics','TB co-infection','Phylogenomics'], skills:['IQ-TREE','BEAST','Nextstrain'] },
    { id:'p10', name:'Yemi Ogunleye',             country:'Nigeria',      city:'Lagos',        inst:'Lagos State University',         degree:'BSc',    role:'Student',       focus:['Bioinformatics','Machine learning genomics'], skills:['Python','scikit-learn'] },
    { id:'p11', name:'Dr. Seun Adesanya',         country:'Nigeria',      city:'Ibadan',       inst:'NIMR Nigeria',                   degree:'PhD',    role:'Researcher',    focus:['Sickle cell genomics','Pharmacogenomics','CYP2D6'], skills:['R','GATK','VEP'] },
    { id:'p12', name:'Marianne Diallo',           country:'Senegal',      city:'Dakar',        inst:'Institut Pasteur Dakar',         degree:'PhD',    role:'Student',       focus:['Dengue surveillance','Metagenomics','Viral genomics'], skills:['Minimap2','Nanopore','Python'] },
    { id:'p13', name:'Dr. Beatrice Mutua',        country:'Kenya',        city:'Nairobi',      inst:'CGIAR / ILRI',                   degree:'PhD',    role:'PI',            focus:['One Health','Livestock genomics','Zoonoses'], skills:['GATK','R','PLINK'] },
    { id:'p14', name:'Abebe Gebreselassie',       country:'Ethiopia',     city:'Addis Ababa',  inst:'AHRI / Addis Ababa University',  degree:'MSc',    role:'Researcher',    focus:['TB genomics','Drug resistance','WGS'], skills:['TB-Profiler','R','Python'] },
    { id:'p15', name:'Dr. Nkemdirim Uchenna',     country:'Nigeria',      city:'Enugu',        inst:'University of Nigeria Nsukka',   degree:'PhD',    role:'PI',            focus:['Cancer genomics','Breast cancer Africa','NGS'], skills:['Mutect2','GATK','R'] },
    { id:'p16', name:'Ayasha Ndlovu',             country:'Botswana',     city:'Gaborone',     inst:'University of Botswana',         degree:'MSc',    role:'Student',       focus:['HIV phylogenomics','Outbreak genomics'], skills:['Nextstrain','BEAST','Python'] },
    { id:'p17', name:'Dr. Cheikh Diagne',         country:'Senegal',      city:'Dakar',        inst:'Institut Pasteur Dakar',         degree:'PhD',    role:'Postdoc',       focus:['Flavivirus genomics','Zika','Yellow fever'], skills:['Minimap2','iVar','R'] },
    { id:'p18', name:'Lebogang Mokhele',          country:'South Africa', city:'Johannesburg', inst:'NHLS / University of Witwatersrand', degree:'PhD', role:'Student',    focus:['APOL1','Kidney disease','GWAS'], skills:['PLINK','SAIGE','R'] },
    { id:'p19', name:'Dr. Grace Kiptoo',          country:'Kenya',        city:'Eldoret',      inst:'Moi University',                 degree:'PhD',    role:'PI',            focus:['Single-cell RNA-seq','Immunogenomics','Malaria'], skills:['Seurat','10x Genomics','R'] },
    { id:'p20', name:'Théodore Nzinga',           country:'DRC',          city:'Kinshasa',     inst:'University of Kinshasa',         degree:'MSc',    role:'Student',       focus:['Mpox genomics','Outbreak response'], skills:['Illumina','Python','GISAID'] },
    { id:'p21', name:'Dr. Oluwaseun Afolabi',     country:'Nigeria',      city:'Abuja',        inst:'NPHCDA / NCDC',                  degree:'PhD',    role:'PI',            focus:['Genomic surveillance','SARS-CoV-2','Pandemic preparedness'], skills:['Nextstrain','GISAID','Python'] },
    { id:'p22', name:'Awa Ba-Diallo',             country:'Guinea',       city:'Conakry',      inst:'National Reference Laboratory',  degree:'MSc',    role:'Researcher',    focus:['Ebola genomics','Outbreak genomics'], skills:['Minimap2','Nextstrain','R'] },
    { id:'p23', name:'Dr. Moses Mutuku',          country:'Kenya',        city:'Kilifi',       inst:'KWTRP Kilifi',                   degree:'PhD',    role:'PI',            focus:['Malaria vectors','Anopheles genomics','WGS'], skills:['GATK','R','VectorBase'] },
    { id:'p24', name:'Mariam Yousif',             country:'Sudan',        city:'Khartoum',     inst:'University of Khartoum',         degree:'PhD',    role:'Student',       focus:['Leishmaniasis genomics','NTDs'], skills:['GATK','R','Python'] },
    { id:'p25', name:'Dr. Kofi Asante',           country:'Ghana',        city:'Kumasi',       inst:'KNUST',                          degree:'PhD',    role:'Researcher',    focus:['Hypertension GWAS','Cardiometabolic disease','AWI-Gen'], skills:['PLINK','SAIGE','R'] },
    { id:'p26', name:'Aminata Kouyaté',           country:'Ivory Coast',  city:'Abidjan',      inst:'IPR / Félix Houphouët-Boigny',   degree:'MSc',    role:'Student',       focus:['Malaria GWAS','West African populations'], skills:['GATK','R','PLINK'] },
    { id:'p27', name:'Dr. Adaeze Okafor',         country:'Nigeria',      city:'Lagos',        inst:'Eko Hospital / UniLag',          degree:'PhD',    role:'PI',            focus:['Pharmacogenomics','CYP2D6','Codeine metabolism Africa'], skills:['R','GATK','Pharmacogx'] },
    { id:'p28', name:'Hailemariam Gebreegziabher',country:'Ethiopia',     city:'Gondar',       inst:'University of Gondar',           degree:'PhD',    role:'Student',       focus:['Schistosomiasis','Helminth genomics','NTDs'], skills:['GATK','R','WormBase'] },
    { id:'p29', name:'Dr. Nadia Mokhachane',      country:'South Africa', city:'Bloemfontein', inst:'University of the Free State',   degree:'PhD',    role:'Postdoc',       focus:['Diabetes genetics','Type 2 diabetes Africa','Biobank'], skills:['PLINK','R','SAIGE'] },
    { id:'p30', name:'Victor Asante Gyamfi',      country:'Ghana',        city:'Accra',        inst:'WASCAL / UG',                    degree:'MSc',    role:'Student',       focus:['Climate change and disease','Genomic epidemiology'], skills:['Python','R','GIS'] },
    { id:'p31', name:'Dr. Irene Njuguna',         country:'Kenya',        city:'Nairobi',      inst:'AMREF / University of Nairobi',  degree:'PhD',    role:'PI',            focus:['Paediatric HIV','ARV resistance','PMTCT'], skills:['HIV-GRADE','R','Python'] },
    { id:'p32', name:'Opeoluwa Fawole',           country:'Nigeria',      city:'Ile-Ife',      inst:'Obafemi Awolowo University',     degree:'BSc',    role:'Student',       focus:['Bioinformatics pipeline development','Python'], skills:['Python','Snakemake','R'] },
    { id:'p33', name:'Dr. Malick Sembène',        country:'Senegal',      city:'Dakar',        inst:'UCAD',                           degree:'PhD',    role:'PI',            focus:['Agricultural genomics','Crop pests','Stored grain insects'], skills:['GATK','R','OrthoFinder'] },
    { id:'p34', name:'Mekdes Getnet',             country:'Ethiopia',     city:'Addis Ababa',  inst:'EthiopianPublic Health Institute',degree:'MSc',   role:'Researcher',    focus:['COVID-19 surveillance','Genomic epidemiology'], skills:['Nextstrain','Python','R'] },
    { id:'p35', name:'Dr. Wande Olatunbosun',     country:'Nigeria',      city:'Lagos',        inst:'NIMR / UniLag',                  degree:'PhD',    role:'PI',            focus:['Genomics of African populations','Admixture'], skills:['PLINK','ADMIXTURE','R'] },
    { id:'p36', name:'Chibuzor Ezeugwu',          country:'Nigeria',      city:'Enugu',        inst:'UNEC Teaching Hospital',         degree:'MSc',    role:'Student',       focus:['G6PD deficiency','Neonatal screening','Genomics'], skills:['R','Python'] },
    { id:'p37', name:'Dr. Yaovi Ameyapoh',        country:'Togo',         city:'Lomé',         inst:'University of Lomé',             degree:'PhD',    role:'PI',            focus:['Food safety genomics','E. coli AMR','One Health'], skills:['Prokka','Roary','R'] },
    { id:'p38', name:'Asmaa Ahmed',               country:'Egypt',        city:'Cairo',        inst:'Cairo University',               degree:'PhD',    role:'Student',       focus:['Hepatitis C genomics','HCV resistance','Viral evolution'], skills:['IQ-TREE','Python','R'] },
    { id:'p39', name:'Dr. Dickens Onyango',       country:'Kenya',        city:'Kisumu',       inst:'Maseno University',              degree:'PhD',    role:'Researcher',    focus:['Malnutrition and gut microbiome','Metagenomics'], skills:['QIIME2','R','Python'] },
    { id:'p40', name:'Namugenyi Harriet',         country:'Uganda',       city:'Kampala',      inst:'MRC/UVRI Uganda',                degree:'MSc',    role:'Student',       focus:['HIV drug resistance','TAMs','Phylogenomics'], skills:['HIV-GRADE','BEAST','R'] },
    { id:'p41', name:'Dr. Yaw Bediako',           country:'Ghana',        city:'Accra',        inst:'Noguchi / West Africa Centre for Cell Biology', degree:'PhD', role:'PI', focus:['Malaria immunity','Single-cell genomics','IgG responses'], skills:['10x Genomics','Seurat','R'] },
    { id:'p42', name:'Fadekemi Adesanya',         country:'Nigeria',      city:'Ibadan',       inst:'University of Ibadan',           degree:'BSc',    role:'Student',       focus:['Computational biology','Machine learning'], skills:['Python','TensorFlow','R'] },
    { id:'p43', name:'Dr. Olayinka Stephen-Ola',  country:'Nigeria',      city:'Abuja',        inst:'NCDC Nigeria',                   degree:'PhD',    role:'PI',            focus:['Genomic surveillance Nigeria','Monkeypox','WGS'], skills:['Nextstrain','Python','GISAID'] },
    { id:'p44', name:'Dawit Tesfaye',             country:'Ethiopia',     city:'Jimma',        inst:'Jimma University',               degree:'MSc',    role:'Researcher',    focus:['Kala-azar genomics','Leishmania donovani'], skills:['GATK','R','VEUPathDB'] },
    { id:'p45', name:'Dr. Dolapo Babalola',       country:'Nigeria',      city:'Lagos',        inst:'UCH Ibadan / UniLag',            degree:'PhD',    role:'Postdoc',       focus:['HLA genomics','Transplant medicine Africa'], skills:['HLA-HD','R','IPD-IMGT'] },
    { id:'p46', name:'Sandra Chipeta',            country:'Zambia',       city:'Lusaka',       inst:'University of Zambia',           degree:'MSc',    role:'Student',       focus:['Drug-resistant malaria','Zambia surveillance'], skills:['Python','GATK','R'] },
    { id:'p47', name:'Dr. Amr Ibrahim',           country:'Egypt',        city:'Alexandria',   inst:'Alexandria University',          degree:'PhD',    role:'PI',            focus:['Colorectal cancer genomics','North Africa GWAS'], skills:['Mutect2','R','GATK'] },
    { id:'p48', name:'Bisola Adegoke',            country:'Nigeria',      city:'Lagos',        inst:'LUTH / University of Lagos',     degree:'MSc',    role:'Researcher',    focus:['Pharmacogenomics Africa','CYP2B6','Efavirenz'], skills:['R','GATK','PharmGKB'] },
    { id:'p49', name:'Dr. Pule Lehana',           country:'South Africa', city:'Pretoria',     inst:'NICD / NHLS',                    degree:'PhD',    role:'PI',            focus:['Outbreak genomics','Pathogen WGS','Africa CDC'], skills:['Nextstrain','GISAID','Python'] },
    { id:'p50', name:'Grace Muwema',              country:'Uganda',       city:'Mbarara',      inst:'Mbarara University',             degree:'MSc',    role:'Student',       focus:['Sickle cell in Uganda','Newborn screening'], skills:['R','Python','GATK'] },
  ];

  let _myProfile = null;

  function _allProfiles() {
    const stored = JSON.parse(localStorage.getItem('omicslab_my_dir_profile') || 'null');
    return stored ? [...BASE_PROFILES, stored] : BASE_PROFILES;
  }

  function _filter() {
    const q = (document.getElementById('dir-q')?.value || '').toLowerCase();
    const country = document.getElementById('dir-country')?.value || '';
    const role = document.getElementById('dir-role')?.value || '';
    const focus = (document.getElementById('dir-focus')?.value || '').toLowerCase();
    const profiles = _allProfiles().filter(p => {
      const txt = (p.name + p.country + p.inst + p.focus.join(' ') + p.skills.join(' ')).toLowerCase();
      return (!q || txt.includes(q))
        && (!country || p.country === country)
        && (!role || p.role === role)
        && (!focus || p.focus.some(f => f.toLowerCase().includes(focus)) || p.skills.some(s => s.toLowerCase().includes(focus)));
    });
    _renderCards(profiles);
  }

  function _renderCards(profiles) {
    const list = document.getElementById('dir-list');
    if (!list) return;
    if (!profiles.length) { list.innerHTML = '<div class="dir-empty">No researchers match your search.</div>'; return; }
    const focusColors = ['#00C4A0','#58a6ff','#bc8cff','#e3b341','#f97316'];
    list.innerHTML = profiles.map(p => `
      <div class="dir-card">
        <div class="dir-card-hdr">
          <div class="dir-avatar">${p.name.split(' ').map(w=>w[0]).join('').substring(0,2)}</div>
          <div class="dir-card-info">
            <div class="dir-name">${p.name}</div>
            <div class="dir-role-country"><span class="dir-role-badge">${p.role}</span> · ${p.city}, ${p.country}</div>
            <div class="dir-inst">${p.inst}</div>
          </div>
        </div>
        <div class="dir-focus-tags">${p.focus.map((f,i) => `<span class="dir-tag" style="color:${focusColors[i%5]};border-color:${focusColors[i%5]}40">${f}</span>`).join('')}</div>
        <div class="dir-skills">${p.skills.map(s => `<span class="dir-skill">${s}</span>`).join('')}</div>
        ${p.contact ? `<div class="dir-contact">${p.contact}</div>` : ''}
      </div>`).join('');
  }

  function _showRegisterModal() {
    const overlay = document.createElement('div');
    overlay.className = 'dir-modal-overlay';
    overlay.innerHTML = `
      <div class="dir-modal">
        <div class="dir-modal-title">Add Your Profile to the Directory</div>
        ${[['Name','dir-r-name','Your full name'],['Institution','dir-r-inst','University, hospital, research institute'],['City','dir-r-city','City'],['Country','dir-r-country','Country'],['Degree','dir-r-degree','PhD / MSc / BSc / MD'],['Role','dir-r-role','PI / Postdoc / Researcher / Student'],['Research focus','dir-r-focus','e.g. Malaria genomics, TB, GWAS'],['Skills/Tools','dir-r-skills','e.g. GATK, R, Python'],['Email (optional)','dir-r-email','contact@example.com']].map(([lbl,id,ph]) => `
          <div class="dir-modal-field">
            <label class="dir-modal-label">${lbl}</label>
            <input class="dir-modal-input" id="${id}" placeholder="${ph}">
          </div>`).join('')}
        <div class="dir-modal-actions">
          <button class="dir-modal-cancel" onclick="this.closest('.dir-modal-overlay').remove()">Cancel</button>
          <button class="dir-modal-save" onclick="OmicsLab.Directory._saveProfile()">Save to Directory</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
  }

  function _saveProfile() {
    const g = id => document.getElementById(id)?.value.trim() || '';
    const profile = {
      id:'my_'+Date.now(),
      name:g('dir-r-name'),
      inst:g('dir-r-inst'),
      city:g('dir-r-city'),
      country:g('dir-r-country'),
      degree:g('dir-r-degree'),
      role:g('dir-r-role'),
      focus:g('dir-r-focus').split(',').map(s=>s.trim()).filter(Boolean),
      skills:g('dir-r-skills').split(',').map(s=>s.trim()).filter(Boolean),
      contact:g('dir-r-email'),
    };
    if (!profile.name) return;
    localStorage.setItem('omicslab_my_dir_profile', JSON.stringify(profile));
    document.querySelector('.dir-modal-overlay')?.remove();
    _filter();
  }

  function init() {
    const section = document.getElementById('directory-section');
    if (!section || section.dataset.dirReady) return;
    section.dataset.dirReady = '1';
    const countries = [...new Set(BASE_PROFILES.map(p => p.country))].sort();
    section.innerHTML = `
      <div class="dir-wrap">
        <div class="dir-header">
          <div>
            <div class="dir-header-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#58a6ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              Africa Researcher Directory
            </div>
            <div class="dir-header-sub">${BASE_PROFILES.length} African genomics researchers · Search by country, expertise, tools</div>
          </div>
          <button class="dir-register-btn" onclick="OmicsLab.Directory._showRegisterModal()">Add Your Profile</button>
        </div>
        <div class="dir-search-bar">
          <input class="dir-search-input" id="dir-q" placeholder="Search by name, institution, focus area..." oninput="OmicsLab.Directory._filter()">
          <select class="dir-filter-sel" id="dir-country" onchange="OmicsLab.Directory._filter()">
            <option value="">All countries</option>
            ${countries.map(c => `<option>${c}</option>`).join('')}
          </select>
          <select class="dir-filter-sel" id="dir-role" onchange="OmicsLab.Directory._filter()">
            <option value="">All roles</option>
            <option>PI</option><option>Postdoc</option><option>Researcher</option><option>Student</option>
          </select>
          <input class="dir-search-input" id="dir-focus" style="max-width:160px" placeholder="Skill or tool..." oninput="OmicsLab.Directory._filter()">
        </div>
        <div id="dir-list" class="dir-list"></div>
      </div>`;
    _filter();
  }

  return { init, _filter, _showRegisterModal, _saveProfile };
})();
