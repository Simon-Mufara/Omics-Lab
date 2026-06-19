/* ═══════════════════════════════════════════════════════
   OmicsLab — Africa Pathogen Genomics Tracker (Part 5)
   Live-look dashboard of priority pathogen genomic
   surveillance across African countries. All data is
   illustrative / educational — no live external API.
   ═══════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.PathogenTracker = (function () {

  /* Illustrative surveillance data (WHO / Africa CDC-inspired) */
  const PATHOGENS = [
    {
      id:'sars2', name:'SARS-CoV-2', class:'RNA virus', priority:'high',
      color:'#ff6b6b',
      summary:'Ongoing genomic surveillance of SARS-CoV-2 lineages across Africa, tracking variant emergence and spread.',
      countries: [
        { name:'South Africa', sequences:142000, variants:['XBB.1.5','EG.5','JN.1'], status:'active', capacity:'high' },
        { name:'Nigeria', sequences:8200, variants:['JN.1','BA.2.86'], status:'active', capacity:'med' },
        { name:'Kenya', sequences:12400, variants:['XBB.1.16','JN.1'], status:'active', capacity:'high' },
        { name:'Ethiopia', sequences:3100, variants:['BA.5','XBB.1'], status:'active', capacity:'low' },
        { name:'Ghana', sequences:4700, variants:['BA.2','XBB.1.5'], status:'active', capacity:'med' },
        { name:'Senegal', sequences:2900, variants:['BA.5','JN.1'], status:'surveillance', capacity:'med' },
      ],
      keyVariants: [
        { lineage:'JN.1', type:'variant of interest', desc:'Dominant lineage 2024–2025; high immune evasion.', afShare:62 },
        { lineage:'XBB.1.5', type:'previous VOI', desc:'Previously dominant; declining in Africa.', afShare:18 },
        { lineage:'BA.2.86/JN.1', type:'parent', desc:'High spike mutations; spread rapidly after 2023.', afShare:12 },
      ],
    },
    {
      id:'mtb', name:'M. tuberculosis', class:'Bacterium', priority:'high',
      color:'#e3b341',
      summary:'WGS-based drug resistance surveillance of M. tuberculosis, tracking MDR-TB and XDR-TB emergence.',
      countries: [
        { name:'South Africa', sequences:31000, variants:['F28 (LAM)','Beijing','Euro-American'], status:'active', capacity:'high' },
        { name:'Nigeria', sequences:1800, variants:['LAM9','Haarlem'], status:'active', capacity:'med' },
        { name:'Ethiopia', sequences:4200, variants:['CAS1-Delhi','LAM'], status:'active', capacity:'med' },
        { name:'Mozambique', sequences:900, variants:['Euro-American'], status:'surveillance', capacity:'low' },
        { name:'Tanzania', sequences:1400, variants:['Beijing','CAS1-Delhi'], status:'active', capacity:'low' },
      ],
      keyVariants: [
        { lineage:'LAM (Lineage 4)', type:'dominant', desc:'Most prevalent TB lineage in sub-Saharan Africa.', afShare:45 },
        { lineage:'CAS1-Delhi (Lineage 3)', type:'dominant', desc:'Prevalent in East Africa; some fluoroquinolone resistance.', afShare:22 },
        { lineage:'Beijing (Lineage 2)', type:'watch', desc:'Associated with MDR-TB; rising in Southern Africa.', afShare:18 },
      ],
    },
    {
      id:'pfalc', name:'P. falciparum', class:'Parasite', priority:'high',
      color:'#3fb950',
      summary:'MalariaGEN-led genomic surveillance of P. falciparum drug resistance markers across the continent.',
      countries: [
        { name:'Ghana', sequences:9800, variants:['kelch13 R622I','pfhrp2 del'], status:'active', capacity:'high' },
        { name:'Uganda', sequences:7400, variants:['kelch13 F446I','crt 76T'], status:'active', capacity:'high' },
        { name:'Kenya', sequences:5600, variants:['kelch13 wild-type','dhfr triple'], status:'active', capacity:'high' },
        { name:'Cameroon', sequences:3200, variants:['pfhrp2/3 del'], status:'surveillance', capacity:'med' },
        { name:'Tanzania', sequences:4100, variants:['kelch13 A675V','mdr1 86N'], status:'active', capacity:'med' },
      ],
      keyVariants: [
        { lineage:'kelch13 artemisinin resistance', type:'critical', desc:'Partial resistance to artemisinin emerging in East Africa.', afShare:8 },
        { lineage:'pfhrp2/3 deletion', type:'diagnostic concern', desc:'Causes false-negative RDTs; reported in > 10 countries.', afShare:15 },
        { lineage:'dhfr triple mutant (SP resistance)', type:'common', desc:'Nearly fixed in East Africa — renders SP prophylaxis less effective.', afShare:78 },
      ],
    },
    {
      id:'mpox', name:'Mpox (MPXV)', class:'DNA virus', priority:'high',
      color:'#bc8cff',
      summary:'Genomic tracking of mpox (monkeypox virus) clade Ib outbreak in Central and East Africa.',
      countries: [
        { name:'DRC', sequences:1800, variants:['Clade Ib','Clade Ia'], status:'outbreak', capacity:'low' },
        { name:'Rwanda', sequences:420, variants:['Clade Ib'], status:'outbreak', capacity:'med' },
        { name:'Uganda', sequences:310, variants:['Clade Ib'], status:'active', capacity:'med' },
        { name:'Burundi', sequences:190, variants:['Clade Ib'], status:'surveillance', capacity:'low' },
        { name:'Kenya', sequences:140, variants:['Clade Ib'], status:'surveillance', capacity:'high' },
      ],
      keyVariants: [
        { lineage:'Clade Ib', type:'outbreak', desc:'More transmissible sub-clade; responsible for 2024–2025 Africa outbreak.', afShare:72 },
        { lineage:'Clade Ia', type:'endemic', desc:'Long-established clade in DRC basin; lower transmissibility.', afShare:26 },
        { lineage:'Clade IIb', type:'imported', desc:'Rare African imports from 2022 global spread.', afShare:2 },
      ],
    },
    {
      id:'cholera', name:'V. cholerae O1', class:'Bacterium', priority:'med',
      color:'#58a6ff',
      summary:'Genomic epidemiology of cholera outbreaks in sub-Saharan Africa, characterising spread and AMR.',
      countries: [
        { name:'DRC', sequences:640, variants:['El Tor 7th pandemic'], status:'outbreak', capacity:'low' },
        { name:'Mozambique', sequences:380, variants:['El Tor Haitian variant'], status:'active', capacity:'low' },
        { name:'Malawi', sequences:210, variants:['El Tor'], status:'active', capacity:'low' },
        { name:'Ethiopia', sequences:290, variants:['El Tor'], status:'active', capacity:'low' },
      ],
      keyVariants: [
        { lineage:'7th pandemic El Tor', type:'dominant', desc:'Global lineage responsible for all recent African cholera outbreaks.', afShare:97 },
        { lineage:'Haitian variant (altered El Tor)', type:'watch', desc:'Carries VSP-II island; associated with severe disease.', afShare:35 },
      ],
    },
  ];

  let _activePath = 'sars2';

  function _selectPath(id) {
    _activePath = id;
    document.querySelectorAll('.pt-path-btn').forEach(b => b.classList.toggle('pt-path-active', b.dataset.pid === id));
    _renderDetail();
  }

  function _renderDetail() {
    const p = PATHOGENS.find(x => x.id === _activePath);
    const el = document.getElementById('pt-detail');
    if (!el || !p) return;
    const capacityColor = { high:'#3fb950', med:'#e3b341', low:'#ff6b6b' };
    const statusColor = { active:'#3fb950', outbreak:'#ff6b6b', surveillance:'#58a6ff' };
    el.innerHTML = `
      <div class="pt-detail-hdr" style="border-left-color:${p.color}">
        <div>
          <span class="pt-detail-name">${p.name}</span>
          <span class="pt-detail-class">${p.class}</span>
        </div>
        <span class="pt-priority-badge pt-priority-${p.priority}">${p.priority} priority</span>
      </div>
      <div class="pt-summary">${p.summary}</div>
      <div class="pt-sub-label">Lineages / Markers of Concern</div>
      <div class="pt-variant-list">
        ${p.keyVariants.map(v => `<div class="pt-variant-row">
          <div class="pt-var-name">${v.lineage}</div>
          <div class="pt-var-type">${v.type}</div>
          <div class="pt-var-desc">${v.desc}</div>
          <div class="pt-var-bar-wrap">
            <div class="pt-var-bar" style="width:${v.afShare}%;background:${p.color}"></div>
            <span class="pt-var-pct">${v.afShare}%</span>
          </div>
        </div>`).join('')}
      </div>
      <div class="pt-sub-label" style="margin-top:1.25rem">Country Surveillance</div>
      <div class="pt-country-grid">
        ${p.countries.map(c => `<div class="pt-country-card">
          <div class="pt-cc-hdr">
            <span class="pt-cc-name">${c.name}</span>
            <span class="pt-cc-status" style="color:${statusColor[c.status]||'#8b949e'}">${c.status}</span>
          </div>
          <div class="pt-cc-seqs">${c.sequences.toLocaleString()} seqs</div>
          <div class="pt-cc-cap" style="color:${capacityColor[c.capacity]||'#8b949e'}">Capacity: ${c.capacity}</div>
          <div class="pt-cc-vars">${c.variants.join(' · ')}</div>
        </div>`).join('')}
      </div>`;
  }

  function init() {
    const section = document.getElementById('pathogen-tracker-section');
    if (!section || section.dataset.ptReady) return;
    section.dataset.ptReady = '1';
    const totalSeqs = PATHOGENS.reduce((sum, p) => sum + p.countries.reduce((s, c) => s + c.sequences, 0), 0);
    section.innerHTML = `
      <div class="pt-wrap">
        <div class="pt-header">
          <div class="pt-header-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ff6b6b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            Africa Pathogen Genomics Tracker
          </div>
          <div class="pt-header-sub">Genomic surveillance of priority pathogens across Africa · Illustrative educational data</div>
        </div>
        <div class="pt-overview-row">
          <div class="pt-ov-chip"><span class="pt-ov-n">${PATHOGENS.length}</span><span class="pt-ov-l">Pathogens tracked</span></div>
          <div class="pt-ov-chip"><span class="pt-ov-n">${totalSeqs.toLocaleString()}</span><span class="pt-ov-l">Total sequences</span></div>
          <div class="pt-ov-chip"><span class="pt-ov-n">30+</span><span class="pt-ov-l">Countries</span></div>
          <div class="pt-ov-chip"><span class="pt-ov-n">WHO/Africa CDC</span><span class="pt-ov-l">Data sources</span></div>
        </div>
        <div class="pt-path-row">
          ${PATHOGENS.map(p => `<button class="pt-path-btn${p.id===_activePath?' pt-path-active':''}" data-pid="${p.id}" style="--pc:${p.color}" onclick="OmicsLab.PathogenTracker._selectPath('${p.id}')">
            <span class="pt-path-dot" style="background:${p.color}"></span>${p.name}
          </button>`).join('')}
        </div>
        <div id="pt-detail" class="pt-detail"></div>
        <div class="pt-disclaimer">Data shown is illustrative and for educational purposes only. For live surveillance data visit Africa CDC (<a href="https://africacdc.org" target="_blank" rel="noopener">africacdc.org</a>) and WHO (<a href="https://www.who.int/emergencies/disease-outbreak-news" target="_blank" rel="noopener">who.int</a>).</div>
      </div>`;
    _renderDetail();
  }

  return { init, _selectPath };
})();
