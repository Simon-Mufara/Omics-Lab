/* ═══════════════════════════════════════════════════════════════
   OmicsLab — Africa Genomics Lab Map
   Interactive SVG map with genomics centres, H3Africa nodes,
   and sequencing facilities across Africa
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.AfricaMap = (function() {

  const W = 520, H = 480;

  /* Static data: genomics centres and programmes */
  const CENTRES = [
    { id:'capetown',   name:'H3Africa APCDR Cape Town',           country:'South Africa',  lat:-33.9,  lon:18.4,   type:'sequencing',  desc:'African Population Cohort Disease Research hub at UCT. Focus: cardiometabolic disease genetics, pharmacogenomics across African ancestry groups.',       programs:['H3Africa','APCDR','AWI-Gen'], focus:'Pharmacogenomics, CVD, Diabetes' },
    { id:'joburg',     name:'NHLS / NICD Johannesburg',           country:'South Africa',  lat:-26.1,  lon:28.0,   type:'surveillance', desc:'National Institute for Communicable Diseases — outbreak genomic surveillance hub. Sequenced >10 000 SARS-CoV-2 genomes; key for Omicron discovery.',   programs:['NICD','PANGO','H3Africa'],   focus:'Outbreak surveillance, SARS-CoV-2, AMR' },
    { id:'nairobi',    name:'KEMRI-Wellcome Trust Research Programme',country:'Kenya',     lat:-1.3,   lon:36.8,   type:'research',    desc:'Leading African research institute in infectious disease genomics. Major malaria, HIV, and typhoid genomics programmes; trains African bioinformaticians.',  programs:['H3Africa','MalariaGEN','COMBAT-TB'], focus:'Malaria, HIV, typhoid genomics' },
    { id:'ibadan',     name:'IITA / Ibadan Genomics Hub',          country:'Nigeria',      lat:7.4,    lon:3.9,    type:'research',    desc:'H3Africa member node in Nigeria. Contributes to the AWI-Gen study (cardiometabolic traits) and APCDR. Key for West African population genetic studies.',   programs:['H3Africa','AWI-Gen','APCDR'], focus:'Population genetics, cardiometabolic' },
    { id:'accra',      name:'Noguchi Memorial Inst. for Medical Research',country:'Ghana', lat:5.6,    lon:-0.2,   type:'research',    desc:'Ghana\'s national biomedical research institute. Contributes to H3Africa and West African malaria genomics. Partner of MalariaGEN consortium.',              programs:['H3Africa','MalariaGEN'],    focus:'Malaria, infectious disease' },
    { id:'dakar',      name:'Institut Pasteur de Dakar',            country:'Senegal',     lat:14.7,   lon:-17.4,  type:'surveillance', desc:'Regional reference lab for West Africa. Led Africa\'s first COVID-19 genomic surveillance network. Manufactures Africa\'s first WHO-approved yellow fever vaccine.', programs:['AFREID','H3Africa','WHO'],  focus:'Arboviruses, yellow fever, COVID-19' },
    { id:'kampala',    name:'MRC/UVRI Uganda Research Unit',        country:'Uganda',      lat:0.3,    lon:32.6,   type:'research',    desc:'Leading HIV cohort genomics centre in East Africa. Key partner of the International AIDS Vaccine Initiative (IAVI) and the H3Africa consortium.',              programs:['H3Africa','IAVI','MRC'],    focus:'HIV, infectious disease genomics' },
    { id:'lusaka',     name:'CIDRZ / Zambia CDC Hub',               country:'Zambia',      lat:-15.4,  lon:28.3,   type:'surveillance', desc:'Centre for Infectious Disease Research in Zambia. TB, HIV, malaria genomics; COVID-19 surveillance. Collaborates with Africa CDC for outbreak response.',     programs:['Africa CDC','H3Africa','CIDRZ'], focus:'HIV, TB, COVID-19 surveillance' },
    { id:'kigali',     name:'Rwanda Biomedical Centre',             country:'Rwanda',      lat:-1.9,   lon:30.1,   type:'surveillance', desc:'Africa\'s model public health genomics programme. Deployed whole-genome sequencing for COVID-19 contact tracing within 48 hours of first case.',           programs:['Africa CDC','NCDC','WHO'],  focus:'COVID-19, AMR, national genomics' },
    { id:'cairo',      name:'National Research Centre (NRC) Cairo', country:'Egypt',       lat:30.1,   lon:31.2,   type:'research',    desc:'Egypt\'s largest research centre. Genomics focus on familial Mediterranean fever, thalassaemia, and North African population genetics studies.',         programs:['H3Africa','APCDR'],         focus:'Haematology genetics, N. African genomics' },
    { id:'addis',      name:'Armauer Hansen Research Institute',    country:'Ethiopia',    lat:9.0,    lon:38.7,   type:'research',    desc:'Ethiopia\'s leading infectious disease research institute. Major TB and leprosy genomics programmes. Partners with FIND and WHO Global TB Programme.',         programs:['WHO-TB','H3Africa','FIND'], focus:'TB genomics, leprosy, infectious disease' },
    { id:'harare',     name:'Biomedical Research Training Institute',country:'Zimbabwe',   lat:-17.8,  lon:31.1,   type:'research',    desc:'BRTI Zimbabwe. Active in HIV drug resistance genomics and African pharmacogenomics. Key partner in the AWI-Gen (Aging, Well-being & Genetics) study.',      programs:['H3Africa','AWI-Gen','PAHO'], focus:'HIV resistance, pharmacogenomics' },
    { id:'dar',        name:'Muhimbili University (MUHAS)',          country:'Tanzania',    lat:-6.8,   lon:39.3,   type:'research',    desc:'Tanzania\'s flagship health sciences university. Malaria genomics, sickle cell research, and African genomics training. H3Africa network member.',           programs:['H3Africa','MalariaGEN'],    focus:'Malaria, sickle cell, genomics training' },
    { id:'yaounde',    name:'Centre Pasteur du Cameroun',            country:'Cameroon',    lat:3.9,    lon:11.5,   type:'surveillance', desc:'Cameroon\'s national reference laboratory for infectious diseases. Active in SARS-CoV-2 genomic surveillance and H3Africa network.',                      programs:['H3Africa','IPG','WHO'],     focus:'Arbovirus, SARS-CoV-2, outbreak genomics' },
    { id:'gambia',     name:'MRC Unit The Gambia at LSHTM',          country:'The Gambia',  lat:13.3,   lon:-16.6,  type:'research',    desc:'Long-running West African cohort and pathogen genomics centre. Strong in malaria, nutrition, TB, and infant health research.',                            programs:['H3Africa','MRC','LSHTM'],   focus:'Malaria, child health, pathogen genomics' },
    { id:'botswana',   name:'Botswana Harvard AIDS Institute',       country:'Botswana',    lat:-24.6,  lon:25.9,   type:'research',    desc:'Regional HIV genomics and cohort research hub. Supports longitudinal studies on HIV resistance, viral evolution, and host genetics.',                      programs:['H3Africa','HIVDB','BHP'],   focus:'HIV, host genetics, cohort genomics' },
    { id:'ifakara',    name:'Ifakara Health Institute',              country:'Tanzania',    lat:-8.1,   lon:36.7,   type:'research',    desc:'Tanzanian institute with strong malaria, vector, and infectious disease genomics programmes. Active in field-ready sequencing and training.',              programs:['MalariaGEN','H3Africa','KEMRI'], focus:'Malaria, vectors, training' },
    { id:'ouaga',      name:'Institut de Recherche en Sciences de la Santé', country:'Burkina Faso', lat:12.4, lon:-1.5, type:'surveillance', desc:'National health research institute with strong malaria, arbovirus, and public health genomics links across West Africa.',                          programs:['H3Africa','WHO','West Africa'], focus:'Malaria, arboviruses, surveillance' },
    { id:'mbarara',    name:'Mbarara University Research Centre',    country:'Uganda',      lat:-0.6,   lon:30.6,   type:'research',    desc:'Ugandan genomics and clinical research centre supporting HIV, TB, and implementation science projects with H3Africa collaborators.',                     programs:['H3Africa','MRC','IAVI'],     focus:'HIV, TB, implementation science' },
    { id:'antananarivo',name:'Institut Pasteur de Madagascar',      country:'Madagascar',  lat:-18.9,  lon:47.5,   type:'research',    desc:'Genomics research on plague (Yersinia pestis), arboviruses, and enteric disease in the Indian Ocean region. WHO reference lab for plague.',               programs:['WHO','Pasteur Network'],    focus:'Plague genomics, arboviruses' }
    ,
    { id:'acegid',     name:"ACEGID — African Centre of Excellence for Genomics of Infectious Diseases (Redeemer's University)", country:'Nigeria', lat:7.7, lon:5.2, type:'research', desc:'Regional centre focusing on pathogen genomics, outbreak response, and training. Strong capacity building and sequencing for SARS-CoV-2, Lassa and other viruses.', programs:['ACEGID','H3Africa'], focus:'Pathogen genomics, outbreak response, training' },
    { id:'lagos',      name:'University of Lagos Genomics Hub',    country:'Nigeria',      lat:6.52,   lon:3.38,   type:'research',    desc:'Emerging genomics node providing training and short-read sequencing services for West Africa. Engages in population genetics and infectious disease projects.', programs:['H3Africa','ACEGID'], focus:'Population genetics, infectious disease' },
    { id:'tunis',      name:'Institut Pasteur de Tunis',            country:'Tunisia',      lat:36.8,   lon:10.18,  type:'research',    desc:'North African Pasteur institute with genomics capabilities — supports arbovirus surveillance and regional training programmes.', programs:['Pasteur Network','H3Africa'], focus:'Arboviruses, surveillance, training' },
    { id:'kinshasa',   name:'University of Kinshasa — Molecular Lab', country:'DRC',        lat:-4.33,  lon:15.31,  type:'research',    desc:'Central African genomics facility supporting viral and bacterial genomics, capacity building, and regional surveillance collaborations.', programs:['WHO','H3Africa'], focus:'Pathogen genomics, training' },
    { id:'algiers',    name:'Institut Pasteur d\'Algérie',         country:'Algeria',     lat:36.75,  lon:3.06,   type:'research',    desc:'Algeria\'s national Pasteur institute with genomic research and public health sequencing for North Africa.', programs:['Pasteur Network','WHO'], focus:'Public health genomics, surveillance' }
  ];

  const TYPE_COLOR = {
    'sequencing':  '#00C4A0',
    'surveillance':'#e3b341',
    'research':    '#58a6ff'
  };

  /* SVG coordinate projection — delegates to the shared real-geography
     module (js/africa-geo.js) so centre dots stay pixel-aligned with
     the real country polygons drawn underneath them. */
  function _project(lat, lon) {
    const { x, y } = OmicsLab.AfricaGeo.project(lat, lon, W, H);
    return { x: Math.round(x), y: Math.round(y) };
  }

  let _selectedSlug = null;

  function init() {
    const container = document.getElementById('africa-map-container');
    if (!container) return;
    container.innerHTML = _buildHTML();
    _attachEvents();
  }

  function _countrySelectOptions() {
    const names = OmicsLab.AfricaGeo.COUNTRIES.features
      .map(f => f.properties.name)
      .sort((a, b) => a.localeCompare(b));
    return names.map(n => `<option value="${OmicsLab.AfricaGeo.slugify(n)}">${n}</option>`).join('');
  }

  function _buildHTML() {
    const countryPaths = OmicsLab.AfricaGeo.allCountryPaths(W, H).map(c =>
      `<path class="amap-country" d="${c.d}" data-slug="${c.slug}" data-name="${c.name}"
        tabindex="0" role="button" aria-label="${c.name}"><title>${c.name}</title></path>`
    ).join('');

    const dots = CENTRES.map(c => {
      const { x, y } = _project(c.lat, c.lon);
      const col = TYPE_COLOR[c.type] || '#aaa';
      const slug = OmicsLab.AfricaGeo.slugify(OmicsLab.AfricaGeo.resolveName(c.country));
      return `<circle class="amap-dot" cx="${x}" cy="${y}" r="7"
               fill="${col}" stroke="#0D1524" stroke-width="2"
               data-id="${c.id}" data-country-slug="${slug}" tabindex="0" role="button"
               aria-label="${c.name}"/>
              <circle class="amap-pulse" cx="${x}" cy="${y}" r="7"
               fill="none" stroke="${col}" stroke-width="1.5" opacity="0.5"/>`;
    }).join('');

    return `
      <div class="amap-layout">
        <div class="amap-svg-wrap">
          <div class="amap-country-picker">
            <label for="amap-country-select">Focus on a country</label>
            <select id="amap-country-select" class="amap-country-select" onchange="OmicsLab.AfricaMap._selectCountry(this.value)">
              <option value="">All of Africa</option>
              ${_countrySelectOptions()}
            </select>
            <button type="button" class="amap-reset-btn" id="amap-reset-btn" style="display:none" onclick="OmicsLab.AfricaMap._selectCountry('')">
              ${OmicsLab.Icons?.svg('x',12)||''} Show all Africa
            </button>
          </div>
          <svg class="amap-svg" id="amap-svg" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" aria-label="Africa Genomics Lab Map">
            <defs>
              <radialGradient id="amap-bg" cx="50%" cy="50%" r="70%">
                <stop offset="0%" stop-color="#111B2E"/>
                <stop offset="100%" stop-color="#0D1524"/>
              </radialGradient>
            </defs>
            <rect width="${W}" height="${H}" fill="url(#amap-bg)" rx="12"/>
            <g class="amap-countries" fill="#1c2430" stroke="#243048" stroke-width="0.8">${countryPaths}</g>
            ${dots}
          </svg>
          <div class="amap-legend">
            <div class="amap-leg-item"><span class="amap-leg-dot" style="background:#00C4A0"></span>Sequencing centre</div>
            <div class="amap-leg-item"><span class="amap-leg-dot" style="background:#e3b341"></span>Surveillance hub</div>
            <div class="amap-leg-item"><span class="amap-leg-dot" style="background:#58a6ff"></span>Research institute</div>
          </div>
        </div>
        <div class="amap-info-panel" id="amap-info-panel">
          <div class="amap-info-placeholder">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            <p>Click any dot on the map, or pick a country above, to see details.</p>
          </div>
        </div>
      </div>`;
  }

  function _attachEvents() {
    document.querySelectorAll('.amap-dot').forEach(dot => {
      dot.addEventListener('click', () => _showInfo(dot.dataset.id));
      dot.addEventListener('keydown', e => { if (e.key==='Enter'||e.key===' ') _showInfo(dot.dataset.id); });
    });
    document.querySelectorAll('.amap-country').forEach(path => {
      path.addEventListener('click', () => _selectCountry(path.dataset.slug));
      path.addEventListener('keydown', e => { if (e.key==='Enter'||e.key===' ') _selectCountry(path.dataset.slug); });
    });
  }

  /* Zoom the map to one country and filter the centre list to it — lets
     users looking at a geographically-limited situation (e.g. a single
     country's genomics infrastructure) drill in instead of scanning the
     whole continent. Empty slug resets to the full-continent view. */
  function _selectCountry(slug) {
    _selectedSlug = slug || null;
    const svg = document.getElementById('amap-svg');
    const select = document.getElementById('amap-country-select');
    const resetBtn = document.getElementById('amap-reset-btn');
    if (select && select.value !== (slug || '')) select.value = slug || '';

    document.querySelectorAll('.amap-country').forEach(p => {
      p.classList.toggle('amap-country--selected', !!slug && p.dataset.slug === slug);
    });
    document.querySelectorAll('.amap-dot, .amap-pulse').forEach(d => {
      const dim = !!slug && d.dataset.countrySlug && d.dataset.countrySlug !== slug;
      d.classList.toggle('amap-dot--dim', dim);
    });

    if (svg) {
      if (slug) {
        const feature = OmicsLab.AfricaGeo.COUNTRIES.features.find(f => OmicsLab.AfricaGeo.slugify(f.properties.name) === slug);
        if (feature) svg.setAttribute('viewBox', OmicsLab.AfricaGeo.countryViewBox(feature, W, H));
      } else {
        svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
      }
    }
    if (resetBtn) resetBtn.style.display = slug ? '' : 'none';

    const panel = document.getElementById('amap-info-panel');
    if (!panel) return;
    if (!slug) {
      panel.innerHTML = `
        <div class="amap-info-placeholder">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          <p>Click any dot on the map, or pick a country above, to see details.</p>
        </div>`;
      return;
    }
    const inCountry = CENTRES.filter(c => OmicsLab.AfricaGeo.slugify(OmicsLab.AfricaGeo.resolveName(c.country)) === slug);
    const countryName = document.querySelector(`.amap-country[data-slug="${slug}"]`)?.dataset.name || slug;
    panel.innerHTML = inCountry.length
      ? `<div class="amap-country-summary">
          <div class="amap-info-name">${countryName}</div>
          <div class="amap-info-country">${inCountry.length} genomics ${inCountry.length===1?'centre':'centres'}</div>
          <ul class="amap-country-list">
            ${inCountry.map(c => `<li><button type="button" onclick="OmicsLab.AfricaMap._showInfo('${c.id}')">${c.name}</button></li>`).join('')}
          </ul>
        </div>`
      : `<div class="amap-info-placeholder">
          <p><strong>${countryName}</strong> has no genomics centre in this dataset yet.</p>
        </div>`;
  }

  function _showInfo(id) {
    const c = CENTRES.find(x => x.id === id);
    if (!c) return;
    const panel = document.getElementById('amap-info-panel');
    if (!panel) return;
    const col = TYPE_COLOR[c.type] || '#aaa';
    const progs = c.programs.map(p => `<span class="amap-prog-tag">${p}</span>`).join('');
    panel.innerHTML = `
      <div class="amap-info-card" style="--ac:${col}">
        <button type="button" class="amap-back-btn" onclick="OmicsLab.AfricaMap._selectCountry('${_selectedSlug||''}')">← Back</button>
        <div class="amap-info-head">
          <div class="amap-info-dot" style="background:${col}"></div>
          <div>
            <div class="amap-info-name">${c.name}</div>
            <div class="amap-info-country">${c.country} &nbsp;·&nbsp; ${c.type}</div>
          </div>
        </div>
        <div class="amap-info-focus">${c.focus}</div>
        <p class="amap-info-desc">${c.desc}</p>
        <div class="amap-prog-label">Programmes & Networks</div>
        <div class="amap-progs">${progs}</div>
      </div>`;

    /* Highlight selected dot */
    document.querySelectorAll('.amap-dot').forEach(d => {
      d.setAttribute('stroke', d.dataset.id === id ? '#fff' : '#0D1524');
      d.setAttribute('stroke-width', d.dataset.id === id ? '3' : '2');
    });
  }

  return { init, CENTRES, _selectCountry, _showInfo };
})();
