/* ═══════════════════════════════════════════════════════════════
   OmicsLab — Africa Genomics Lab Map
   Interactive SVG map with genomics centres, H3Africa nodes,
   and sequencing facilities across Africa
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.AfricaMap = (function() {

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
    { id:'antananarivo',name:'Institut Pasteur de Madagascar',      country:'Madagascar',  lat:-18.9,  lon:47.5,   type:'research',    desc:'Genomics research on plague (Yersinia pestis), arboviruses, and enteric disease in the Indian Ocean region. WHO reference lab for plague.',               programs:['WHO','Pasteur Network'],    focus:'Plague genomics, arboviruses' }
  ];

  /* SVG coordinate projection: simple linear scale */
  /* Africa bounding box: lon -18 to 52, lat -35 to 38 */
  function _project(lat, lon) {
    const W = 520, H = 480;
    const x = ((lon - (-18)) / (52 - (-18))) * W;
    const y = ((38 - lat) / (38 - (-35))) * H;
    return { x: Math.round(x), y: Math.round(y) };
  }

  const TYPE_COLOR = {
    'sequencing':  '#3fb950',
    'surveillance':'#e3b341',
    'research':    '#58a6ff'
  };

  function init() {
    const container = document.getElementById('africa-map-container');
    if (!container) return;
    container.innerHTML = _buildHTML();
    _attachEvents();
  }

  function _buildHTML() {
    const dots = CENTRES.map(c => {
      const { x, y } = _project(c.lat, c.lon);
      const col = TYPE_COLOR[c.type] || '#aaa';
      return `<circle class="amap-dot" cx="${x}" cy="${y}" r="7"
               fill="${col}" stroke="#0d1117" stroke-width="2"
               data-id="${c.id}" tabindex="0" role="button"
               aria-label="${c.name}"/>
              <circle class="amap-pulse" cx="${x}" cy="${y}" r="7"
               fill="none" stroke="${col}" stroke-width="1.5" opacity="0.5"/>`;
    }).join('');

    return `
      <div class="amap-layout">
        <div class="amap-svg-wrap">
          <svg class="amap-svg" viewBox="0 0 520 480" xmlns="http://www.w3.org/2000/svg" aria-label="Africa Genomics Lab Map">
            ${_africaOutline()}
            ${dots}
          </svg>
          <div class="amap-legend">
            <div class="amap-leg-item"><span class="amap-leg-dot" style="background:#3fb950"></span>Sequencing centre</div>
            <div class="amap-leg-item"><span class="amap-leg-dot" style="background:#e3b341"></span>Surveillance hub</div>
            <div class="amap-leg-item"><span class="amap-leg-dot" style="background:#58a6ff"></span>Research institute</div>
          </div>
        </div>
        <div class="amap-info-panel" id="amap-info-panel">
          <div class="amap-info-placeholder">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            <p>Click any dot on the map to see details about that genomics centre.</p>
          </div>
        </div>
      </div>`;
  }

  function _attachEvents() {
    document.querySelectorAll('.amap-dot').forEach(dot => {
      dot.addEventListener('click', () => _showInfo(dot.dataset.id));
      dot.addEventListener('keydown', e => { if (e.key==='Enter'||e.key===' ') _showInfo(dot.dataset.id); });
    });
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
      d.setAttribute('stroke', d.dataset.id === id ? '#fff' : '#0d1117');
      d.setAttribute('stroke-width', d.dataset.id === id ? '3' : '2');
    });
  }

  /* Simplified Africa outline as SVG path — key-shaped continent */
  function _africaOutline() {
    return `
    <defs>
      <radialGradient id="amap-bg" cx="50%" cy="50%" r="70%">
        <stop offset="0%" stop-color="#161b22"/>
        <stop offset="100%" stop-color="#0d1117"/>
      </radialGradient>
    </defs>
    <rect width="520" height="480" fill="url(#amap-bg)" rx="12"/>
    <g fill="#1c2430" stroke="#30363d" stroke-width="0.8" opacity="0.9">
    <!-- Simplified Africa shape — key points traced from actual continent outline -->
    <path d="
      M 185,10
      C 220,6 270,4 310,8
      C 350,12 390,18 420,28
      C 445,38 460,52 468,68
      C 475,82 476,98 474,114
      C 472,130 466,144 460,156
      C 454,168 448,178 445,190
      C 442,202 442,214 446,224
      C 450,234 458,242 464,252
      C 470,262 474,272 474,284
      C 474,296 470,308 462,318
      C 454,328 442,336 432,344
      C 422,352 412,360 404,370
      C 396,380 390,392 386,404
      C 382,416 380,428 376,438
      C 372,448 366,456 356,460
      C 346,464 334,464 322,462
      C 310,460 298,456 288,450
      C 278,444 270,436 264,428
      C 258,420 254,410 252,400
      C 250,390 250,380 248,370
      C 246,360 240,352 232,348
      C 224,344 216,344 208,342
      C 200,340 192,336 186,328
      C 180,320 176,310 172,298
      C 168,286 164,274 158,264
      C 152,254 144,246 136,240
      C 128,234 120,230 114,224
      C 108,218 104,210 104,202
      C 104,194 108,186 114,180
      C 120,174 128,170 132,164
      C 136,158 136,150 134,142
      C 132,134 128,126 124,118
      C 120,110 116,100 114,90
      C 112,80 112,70 116,60
      C 120,50 128,42 138,34
      C 148,26 160,20 174,14
      C 178,12 182,11 185,10 Z
    " />
    <!-- Madagascar -->
    <ellipse cx="455" cy="340" rx="20" ry="36" transform="rotate(-15 455 340)"/>
    </g>
    <!-- Equator line -->
    <line x1="0" y1="${_project(0,0).y}" x2="520" y2="${_project(0,0).y}" stroke="#30363d" stroke-width="0.5" stroke-dasharray="4,4"/>
    <text x="8" y="${_project(0,0).y - 3}" fill="#4a5568" font-size="9" font-family="monospace">Equator</text>
    `;
  }

  return { init };
})();
