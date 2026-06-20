/* ═══════════════════════════════════════════════════════════════
   OmicsLab — One Health Surveillance Dashboard (Prompt 56)
   ─ Human–Animal–Environment disease nexus in Africa
   ─ Interactive SVG concentric circles + zoonotic data
   ─ Risk radar by country/region + season
   ─ Links to Outbreak Simulator and Alerts feed
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.OneHealth = (function () {

  /* ─── Zoonotic disease database ─── */
  const DISEASES = [
    { id:'mpox',        name:'Mpox (Monkeypox)',  humanCases:15000, reservoirs:['Rodents','Squirrels','Non-human primates'], environment:['Deforestation','Human encroachment'], regions:['Central Africa','West Africa','East Africa'], season:['year-round'], genomicMarkers:'Clade I (DRC) · Clade IIb (global 2022)', climate:0.7, genomicsPage:'outbreak', color:'#f97316', icon:'virus', acuteRisk:0.8 },
    { id:'ebola',       name:'Ebola Virus Disease',humanCases:500,  reservoirs:['Fruit bats (Pteropodidae)','Non-human primates'], environment:['Forest clearance','Bushmeat'], regions:['Central Africa','West Africa'], season:['year-round'], genomicMarkers:'EBOV GP · NP sequencing for clade assignment', climate:0.5, genomicsPage:'outbreak', color:'#ff6b6b', icon:'alert-triangle', acuteRisk:0.9 },
    { id:'rift-valley', name:'Rift Valley Fever', humanCases:2000, reservoirs:['Cattle','Sheep','Goats','Camels'], environment:['Flooding','Irrigation','Heavy rainfall'], regions:['East Africa','North Africa','West Africa'], season:['rainy'], genomicMarkers:'Phlebovirus RNA segments (L/M/S)', climate:0.9, genomicsPage:'outbreak', color:'#e3b341', icon:'droplet', acuteRisk:0.6 },
    { id:'anthrax',     name:'Anthrax',           humanCases:300,  reservoirs:['Cattle','Goats','Sheep','Wildlife'], environment:['Alkaline soil','Drought','Flooding'], regions:['East Africa','West Africa','Southern Africa'], season:['dry'], genomicMarkers:'B. anthracis MLVA/MLST genotyping', climate:0.6, genomicsPage:'alerts', color:'#8b949e', icon:'shield', acuteRisk:0.7 },
    { id:'brucellosis', name:'Brucellosis',        humanCases:12000,reservoirs:['Cattle','Goats','Sheep','Camels'], environment:['Livestock husbandry','Unpasteurised dairy'], regions:['East Africa','North Africa','West Africa'], season:['year-round'], genomicMarkers:'Brucella MLVA15 for outbreak tracing', climate:0.3, genomicsPage:'alerts', color:'#58a6ff', icon:'activity', acuteRisk:0.4 },
    { id:'leptospirosis',name:'Leptospirosis',     humanCases:8000, reservoirs:['Rodents','Cattle','Dogs','Wildlife'], environment:['Flooding','Urban slums','Agricultural land'], regions:['East Africa','West Africa','Southern Africa'], season:['rainy'], genomicMarkers:'Leptospira MLST · serogrouping', climate:0.8, genomicsPage:'alerts', color:'#3fb950', icon:'droplet', acuteRisk:0.5 },
    { id:'rabies',      name:'Rabies',             humanCases:24000,reservoirs:['Dogs (primary)','Bats','Jackals'], environment:['Dog vaccination gap','Wildlife corridors'], regions:['All Africa'], season:['year-round'], genomicMarkers:'Rabies virus N gene phylogeny — lineage tracking', climate:0.2, genomicsPage:'outbreak', color:'#bc8cff', icon:'zap', acuteRisk:0.95 },
    { id:'hmpv',        name:'Human Metapneumovirus', humanCases:45000, reservoirs:['Birds (HMPV ancestor)'], environment:['Urban crowding','Poultry markets'], regions:['All Africa'], season:['cool-dry'], genomicMarkers:'HMPV F gene phylogeny · genotype A/B', climate:0.4, genomicsPage:'outbreak', color:'#79c0ff', icon:'activity', acuteRisk:0.3 },
    { id:'trypanosomiasis',name:'African Sleeping Sickness', humanCases:1000, reservoirs:['Cattle','Wildlife (buffalo,warthog)'], environment:['Savanna','Riverine woodland','Tsetse habitat'], regions:['Central Africa','East Africa','West Africa'], season:['year-round'], genomicMarkers:'T. brucei MLST · VSG gene switching analysis', climate:0.4, genomicsPage:'alerts', color:'#f97316', icon:'virus', acuteRisk:0.8 },
    { id:'q-fever',     name:'Q Fever (Coxiella)', humanCases:3000, reservoirs:['Cattle','Sheep','Goats'], environment:['Livestock aerosols','Wind dispersal'], regions:['East Africa','North Africa'], season:['dry'], genomicMarkers:'Coxiella burnetii SNP typing · Phase I/II antigen', climate:0.3, genomicsPage:'alerts', color:'#e3b341', icon:'thermometer', acuteRisk:0.5 },
    { id:'hanta',       name:'Hantavirus',          humanCases:200,  reservoirs:['Rodents (Mastomys,Rattus)'], environment:['Rodent-human contact','Urban agriculture'], regions:['Southern Africa','East Africa'], season:['year-round'], genomicMarkers:'Hantavirus M and S segment sequencing', climate:0.5, genomicsPage:'outbreak', color:'#ff6b6b', icon:'thermometer', acuteRisk:0.65 },
    { id:'salmonella',  name:'Non-typhoidal Salmonella', humanCases:680000,reservoirs:['Poultry','Cattle','Reptiles'], environment:['Food systems','Water contamination'], regions:['All Africa'], season:['year-round'], genomicMarkers:'Salmonella Typhimurium/Enteritidis WGS for outbreak attribution', climate:0.3, genomicsPage:'alerts', color:'#58a6ff', icon:'activity', acuteRisk:0.4 },
    { id:'avian-flu',   name:'Avian Influenza H5N1',humanCases:8,   reservoirs:['Wild birds (Anatidae)','Poultry'], environment:['Migratory flyways','Poultry markets','Wetlands'], regions:['North Africa','East Africa','West Africa'], season:['migration'], genomicMarkers:'IAV HA/NA segment surveillance — H5 clade 2.3.4.4b', climate:0.6, genomicsPage:'outbreak', color:'#bc8cff', icon:'wind', acuteRisk:0.6 },
    { id:'plague',      name:'Bubonic Plague',       humanCases:500,  reservoirs:['Rodents (Rattus)','Fleas (Xenopsylla)'], environment:['Highland rodent habitat','Climate warming'], regions:['East Africa','Madagascar','DRC'], season:['cool'], genomicMarkers:'Yersinia pestis MLVA · wgSNP outbreak cluster', climate:0.7, genomicsPage:'outbreak', color:'#8b949e', icon:'alert-triangle', acuteRisk:0.85 },
    { id:'leishmaniasis',name:'Leishmaniasis',       humanCases:50000,reservoirs:['Sandflies','Dogs','Rodents','Hyraxes'], environment:['Sandfly habitat expansion','Deforestation'], regions:['East Africa','North Africa','West Africa'], season:['dry'], genomicMarkers:'Leishmania ITS1/Hsp70 species typing', climate:0.8, genomicsPage:'alerts', color:'#3fb950', icon:'map-pin', acuteRisk:0.5 },
  ];

  /* ─── Environmental drivers ─── */
  const ENV_DRIVERS = [
    { id:'deforestation', label:'Deforestation',      color:'#f97316', diseases:['mpox','ebola','leishmaniasis','trypanosomiasis'] },
    { id:'flooding',      label:'Flooding',            color:'#58a6ff', diseases:['rift-valley','leptospirosis','hanta','salmonella'] },
    { id:'drought',       label:'Drought & Heat',      color:'#e3b341', diseases:['anthrax','q-fever','plague','leishmaniasis'] },
    { id:'urbanisation',  label:'Rapid Urbanisation',  color:'#bc8cff', diseases:['rabies','salmonella','hmpv','leptospirosis'] },
    { id:'livestock',     label:'Livestock Expansion', color:'#3fb950', diseases:['rift-valley','brucellosis','q-fever','anthrax','avian-flu'] },
    { id:'wildlife',      label:'Wildlife-Livestock Interface', color:'#79c0ff', diseases:['ebola','mpox','trypanosomiasis','anthrax'] },
  ];

  /* ─── Risk regions ─── */
  const REGIONS = [
    { id:'west-africa',     label:'West Africa',     high:['mpox','rabies','ebola','brucellosis'] },
    { id:'east-africa',     label:'East Africa',     high:['rift-valley','brucellosis','anthrax','trypanosomiasis','plague'] },
    { id:'central-africa',  label:'Central Africa',  high:['mpox','ebola','trypanosomiasis','mpox'] },
    { id:'southern-africa', label:'Southern Africa', high:['rabies','leptospirosis','hanta','anthrax'] },
    { id:'north-africa',    label:'North Africa',    high:['rift-valley','brucellosis','q-fever','avian-flu','leishmaniasis'] },
  ];

  const SEASONS = ['year-round','rainy','dry','cool','cool-dry','migration'];

  let _activeDisease  = null;
  let _activeRegion   = 'all';
  let _activeSeason   = 'all';

  /* ─── Main render ─── */
  function render(container) {
    container.innerHTML = `
      <div class="oh-wrap">
        <!-- Hero -->
        <div class="oh-hero">
          <div class="oh-hero-icon">${OmicsLab.Icons?.svg('globe',32)||''}</div>
          <div>
            <h2 class="oh-hero-title">One Health Surveillance Dashboard</h2>
            <p class="oh-hero-sub">The human–animal–environment disease nexus in Africa. Explore 15 zoonotic diseases, their reservoirs, environmental drivers, genomic surveillance methods, and your region's risk profile.</p>
          </div>
        </div>

        <!-- Main content grid -->
        <div class="oh-main">
          <!-- Concentric circle diagram -->
          <div class="oh-diagram-wrap">
            <h3 class="oh-panel-title">One Health Nexus</h3>
            <div class="oh-diagram-sub">Click any disease to explore its full transmission chain</div>
            ${_renderNexusDiagram()}
            <div class="oh-diagram-legend">
              <span class="oh-leg"><span class="oh-leg-dot" style="background:#ff6b6b"></span>Human diseases</span>
              <span class="oh-leg"><span class="oh-leg-dot" style="background:#3fb950"></span>Animal reservoirs</span>
              <span class="oh-leg"><span class="oh-leg-dot" style="background:#58a6ff"></span>Environment</span>
            </div>
          </div>

          <!-- Disease list + filters -->
          <div class="oh-list-wrap">
            <div class="oh-filters">
              <select class="select oh-select" onchange="OmicsLab.OneHealth._setRegion(this.value)" aria-label="Filter by region">
                <option value="all">All Regions</option>
                ${REGIONS.map(r => `<option value="${r.id}">${r.label}</option>`).join('')}
              </select>
              <select class="select oh-select" onchange="OmicsLab.OneHealth._setSeason(this.value)" aria-label="Filter by season">
                <option value="all">All Seasons</option>
                ${SEASONS.map(s => `<option value="${s}">${s.charAt(0).toUpperCase()+s.slice(1).replace('-',' ')}</option>`).join('')}
              </select>
            </div>
            <div class="oh-disease-list" id="oh-disease-list">
              ${_renderDiseaseList()}
            </div>
          </div>
        </div>

        <!-- Risk Radar -->
        <div class="oh-risk-section">
          <h3 class="oh-panel-title">${OmicsLab.Icons?.svg('target',15)||''} Regional Risk Radar</h3>
          <div class="oh-risk-grid" id="oh-risk-grid">
            ${_renderRiskGrid()}
          </div>
        </div>

        <!-- Environmental Drivers -->
        <div class="oh-env-section">
          <h3 class="oh-panel-title">${OmicsLab.Icons?.svg('alert-triangle',15)||''} Environmental Drivers & Linked Diseases</h3>
          <div class="oh-env-grid">
            ${ENV_DRIVERS.map(d => `
              <div class="oh-env-card" onclick="OmicsLab.OneHealth._highlightByEnv('${d.id}')">
                <div class="oh-env-dot" style="background:${d.color}"></div>
                <div class="oh-env-label">${d.label}</div>
                <div class="oh-env-diseases">${d.diseases.map(did => DISEASES.find(x=>x.id===did)?.name||did).join(' · ')}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Detail panel -->
        <div class="oh-detail" id="oh-detail" hidden>
          <button class="oh-detail-close" onclick="document.getElementById('oh-detail').hidden=true;OmicsLab.OneHealth._activeDisease=null">
            ${OmicsLab.Icons?.svg('x',14)||'x'}
          </button>
          <div id="oh-detail-body"></div>
        </div>
      </div>
    `;
  }

  function _renderNexusDiagram() {
    const W = 520, H = 380, cx = 260, cy = 190;
    const rings = [
      { r:60,  fill:'rgba(255,107,107,.06)', stroke:'#ff6b6b', label:'Human' },
      { r:120, fill:'rgba(63,185,80,.04)',   stroke:'#3fb950', label:'Animal' },
      { r:180, fill:'rgba(88,166,255,.03)',  stroke:'#58a6ff', label:'Environment' },
    ];

    /* Place diseases around the inner ring */
    const diseaseAngles = DISEASES.slice(0, 15).map((d, i, arr) => ({
      ...d, angle: (i / arr.length) * Math.PI * 2 - Math.PI / 2
    }));

    return `<svg class="oh-svg" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" aria-label="One Health nexus diagram">
      ${rings.map(r => `
        <circle cx="${cx}" cy="${cy}" r="${r.r}" fill="${r.fill}" stroke="${r.stroke}" stroke-width="1" stroke-dasharray="4 3" opacity=".6"/>
        <text x="${cx + r.r - 4}" y="${cy}" fill="${r.stroke}" font-size="8" font-family="Inter,sans-serif" opacity=".7">${r.label}</text>
      `).join('')}

      <!-- Center label -->
      <text x="${cx}" y="${cy - 8}" text-anchor="middle" fill="#8b949e" font-size="9" font-family="Inter,sans-serif">ONE</text>
      <text x="${cx}" y="${cy + 5}" text-anchor="middle" fill="#8b949e" font-size="9" font-family="Inter,sans-serif">HEALTH</text>
      <text x="${cx}" y="${cy + 17}" text-anchor="middle" fill="#8b949e" font-size="7" font-family="Inter,sans-serif">15 diseases</text>

      <!-- Disease nodes -->
      ${diseaseAngles.map(d => {
        const px = cx + Math.cos(d.angle) * 155;
        const py = cy + Math.sin(d.angle) * 155;
        const tx = cx + Math.cos(d.angle) * 195;
        const ty = cy + Math.sin(d.angle) * 195;
        const riskAlpha = d.acuteRisk;
        return `
          <line x1="${cx}" y1="${cy}" x2="${px}" y2="${py}" stroke="${d.color}" stroke-width=".8" opacity=".25"/>
          <circle cx="${px}" cy="${py}" r="9" fill="${d.color}" fill-opacity="${riskAlpha * 0.25 + 0.1}"
            stroke="${d.color}" stroke-width="${_activeDisease===d.id?2:1}" stroke-opacity="${riskAlpha * 0.8 + 0.2}"
            class="oh-node" style="cursor:pointer"
            onclick="OmicsLab.OneHealth._selectDisease('${d.id}')"
            role="button" aria-label="${d.name}">
            <title>${d.name} — Click for details</title>
          </circle>
          <text x="${tx}" y="${ty + 3}" text-anchor="middle" fill="${d.color}"
            font-size="6.5" font-family="Inter,sans-serif" opacity=".85"
            style="pointer-events:none">
            ${d.name.split(' ')[0]}
          </text>
        `;
      }).join('')}
    </svg>`;
  }

  function _renderDiseaseList() {
    let list = DISEASES;
    if (_activeRegion !== 'all') {
      const reg = REGIONS.find(r => r.id === _activeRegion);
      list = list.filter(d => reg?.high.includes(d.id) || d.regions.some(r => r.toLowerCase().includes(_activeRegion.replace('-',' '))));
    }
    if (_activeSeason !== 'all') {
      list = list.filter(d => d.season.includes(_activeSeason) || d.season.includes('year-round'));
    }
    if (!list.length) return `<div class="oh-no-results">${OmicsLab.Icons?.svg('search',20)||''} No diseases match this filter.</div>`;
    return list.map(d => `
      <div class="oh-disease-item${_activeDisease===d.id?' oh-disease-active':''}" onclick="OmicsLab.OneHealth._selectDisease('${d.id}')">
        <div class="oh-disease-dot" style="background:${d.color}"></div>
        <div class="oh-disease-info">
          <div class="oh-disease-name">${d.name}</div>
          <div class="oh-disease-meta">${Number(d.humanCases).toLocaleString()} cases/yr · ${d.reservoirs.slice(0,2).join(', ')}</div>
        </div>
        <div class="oh-risk-pill" style="background:${d.color}18;color:${d.color}" title="Acute risk score">
          ${Math.round(d.acuteRisk * 10)}/10
        </div>
      </div>
    `).join('');
  }

  function _renderRiskGrid() {
    return REGIONS.map(reg => {
      const topDiseases = reg.high.map(id => DISEASES.find(d => d.id === id)).filter(Boolean);
      const avgRisk = topDiseases.reduce((s, d) => s + d.acuteRisk, 0) / (topDiseases.length || 1);
      const riskColor = avgRisk > 0.7 ? '#ff6b6b' : avgRisk > 0.5 ? '#f97316' : '#e3b341';
      return `
        <div class="oh-risk-card">
          <div class="oh-risk-header">
            <span class="oh-risk-region">${reg.label}</span>
            <span class="oh-risk-score" style="color:${riskColor}">${Math.round(avgRisk * 10)}/10</span>
          </div>
          <div class="oh-risk-bar-track">
            <div class="oh-risk-bar-fill" style="width:${Math.round(avgRisk*100)}%;background:${riskColor}"></div>
          </div>
          <div class="oh-risk-diseases">
            ${topDiseases.slice(0,3).map(d => `<span class="oh-risk-tag" style="color:${d.color};background:${d.color}18">${d.name.split(' ')[0]}</span>`).join('')}
          </div>
        </div>
      `;
    }).join('');
  }

  function _selectDisease(id) {
    _activeDisease = id;
    const d = DISEASES.find(x => x.id === id);
    if (!d) return;
    const panel = document.getElementById('oh-detail');
    const body  = document.getElementById('oh-detail-body');
    body.innerHTML = `
      <div class="oh-det-header">
        <div class="oh-det-dot" style="background:${d.color}"></div>
        <div>
          <h3 class="oh-det-name">${d.name}</h3>
          <div class="oh-det-meta">~${Number(d.humanCases).toLocaleString()} human cases/year in Africa</div>
        </div>
        <div class="oh-det-risk" style="color:${d.acuteRisk>0.7?'#ff6b6b':d.acuteRisk>0.5?'#f97316':'#e3b341'}">
          Risk ${Math.round(d.acuteRisk * 10)}/10
        </div>
      </div>

      <div class="oh-det-grid">
        <div class="oh-det-block">
          <div class="oh-det-block-title">${OmicsLab.Icons?.svg('activity',12)||''} Animal Reservoirs</div>
          <ul class="oh-det-list">${d.reservoirs.map(r=>`<li>${r}</li>`).join('')}</ul>
        </div>
        <div class="oh-det-block">
          <div class="oh-det-block-title">${OmicsLab.Icons?.svg('globe',12)||''} Environmental Drivers</div>
          <ul class="oh-det-list">${d.environment.map(e=>`<li>${e}</li>`).join('')}</ul>
        </div>
        <div class="oh-det-block">
          <div class="oh-det-block-title">${OmicsLab.Icons?.svg('map-pin',12)||''} Affected Regions</div>
          <ul class="oh-det-list">${d.regions.map(r=>`<li>${r}</li>`).join('')}</ul>
        </div>
        <div class="oh-det-block">
          <div class="oh-det-block-title">${OmicsLab.Icons?.svg('dna',12)||''} Genomic Markers</div>
          <div class="oh-det-genomic">${d.genomicMarkers}</div>
        </div>
      </div>

      <div class="oh-det-climate">
        <span>Climate sensitivity:</span>
        <div class="oh-climate-track"><div class="oh-climate-fill" style="width:${Math.round(d.climate*100)}%"></div></div>
        <span>${Math.round(d.climate*100)}%</span>
      </div>

      <div class="oh-det-actions">
        <button class="btn btn-primary btn-sm" onclick="OmicsLab.Router?.navigate('${d.genomicsPage}')">
          ${OmicsLab.Icons?.svg('git-branch',12)||''} Run in Outbreak Simulator
        </button>
        <button class="btn btn-ghost btn-sm" onclick="OmicsLab.Router?.navigate('alerts')">
          ${OmicsLab.Icons?.svg('alert-triangle',12)||''} View Alerts
        </button>
      </div>
    `;
    panel.hidden = false;
    /* Update list highlight */
    document.querySelectorAll('.oh-disease-item').forEach(el => el.classList.remove('oh-disease-active'));
    document.querySelector(`.oh-disease-item[onclick*="'${id}'"]`)?.classList.add('oh-disease-active');
  }

  function _setRegion(r) {
    _activeRegion = r;
    const el = document.getElementById('oh-disease-list');
    if (el) el.innerHTML = _renderDiseaseList();
  }

  function _setSeason(s) {
    _activeSeason = s;
    const el = document.getElementById('oh-disease-list');
    if (el) el.innerHTML = _renderDiseaseList();
  }

  function _highlightByEnv(envId) {
    const drv = ENV_DRIVERS.find(d => d.id === envId);
    if (!drv || !drv.diseases.length) return;
    _selectDisease(drv.diseases[0]);
  }

  return { render, _selectDisease, _setRegion, _setSeason, _highlightByEnv };
})();
