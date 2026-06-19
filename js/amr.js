/* ═══════════════════════════════════════════════════════
   OmicsLab — AMR Resistance Profiler (Part 3)
   Antimicrobial resistance profiling for key African pathogens:
   M. tuberculosis, P. falciparum, ESKAPE organisms, HIV.
   Fully offline — integrated resistance mutation database.
   ═══════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.AMR = (function () {

  /* Resistance mutation database */
  const AMR_DB = {
    mtb: {
      label: 'M. tuberculosis',
      drugs: {
        Rifampicin:    { genes:['rpoB'], key_mutations:['Ser450Leu','His445Tyr','His445Asp','Asp435Val','Leu430Pro'], class:'First-line', who:'Group A' },
        Isoniazid:     { genes:['katG','inhA','ahpC'], key_mutations:['Ser315Thr','Ser315Asn','Ile194Thr','C(-15)T','C(-17)T'], class:'First-line', who:'Group A' },
        Pyrazinamide:  { genes:['pncA'], key_mutations:['multiple frameshift/nonsense','Asp8Asn','Thr76Pro'], class:'First-line', who:'Group B' },
        Ethambutol:    { genes:['embB'], key_mutations:['Met306Ile','Met306Val','Asp328Asn','Gln497Arg'], class:'First-line', who:'Group C' },
        Fluoroquinolones: { genes:['gyrA','gyrB'], key_mutations:['Asp94Gly','Asp94Asn','Ala90Val','Ser91Pro'], class:'Second-line', who:'Group A' },
        Bedaquiline:   { genes:['atpE','mmpR5'], key_mutations:['Ala63Pro','Ile66Met','Val65Met'], class:'New drugs', who:'Group B' },
        Delamanid:     { genes:['ddn','fbiA','fbiB','fbiC','cofC'], key_mutations:['Gly81Asp','Trp88*'], class:'New drugs', who:'Group C' },
        Linezolid:     { genes:['rrl','rplC'], key_mutations:['A2062C (23S rRNA)','Leu101Pro'], class:'Second-line', who:'Group B' },
        Amikacin:      { genes:['rrs','eis'], key_mutations:['A1401G (16S rRNA)','G878A','C(-10)T (eis promoter)'], class:'Second-line', who:'Group C' },
        Kanamycin:     { genes:['rrs','eis'], key_mutations:['A1401G (16S rRNA)','C(-10)T (eis promoter)'], class:'Second-line', who:'Group C' },
      }
    },
    pfalciparum: {
      label: 'P. falciparum (malaria)',
      drugs: {
        Chloroquine:    { genes:['pfcrt','pfmdr1'], key_mutations:['Lys76Thr (pfcrt)','Asn86Tyr (pfmdr1)','Tyr184Phe'], class:'Aminoquinoline', who:'First-line (historical)' },
        Artemisinin:    { genes:['kelch13','fd','mdr2'], key_mutations:['Arg539Thr','Ile543Thr','Met476Ile','Phe446Ile'], class:'Artemisinin', who:'WHO validated ART-R markers' },
        Sulfadoxine:    { genes:['dhps'], key_mutations:['Ala437Gly','Lys540Glu','Ala581Gly','Ala613Ser'], class:'Antifolate', who:'SP (IPTp-SP)' },
        Pyrimethamine:  { genes:['dhfr'], key_mutations:['Asn51Ile','Cys59Arg','Ser108Asn','Ile164Leu'], class:'Antifolate', who:'SP (IPTp-SP)' },
        Lumefantrine:   { genes:['pfmdr1','pfcrt'], key_mutations:['Asn86 (WT = sensitive)','Lys76 (WT = sensitive)'], class:'Aryl-amino alcohol', who:'Part of ACT (AL)' },
        Piperaquine:    { genes:['plasmepsin23','pfcrt'], key_mutations:['Amplification of Pm2/3','Thr93Ser+His97Tyr+Ile218Phe'], class:'Bisquinoline', who:'Part of DHA-PPQ' },
      }
    },
    enterobacteriaceae: {
      label: 'Enterobacteriaceae (ESKAPE)',
      drugs: {
        Carbapenems:    { genes:['blaKPC','blaNDM','blaOXA-48','blaVIM','blaIMP'], key_mutations:['Gene acquisition (mobile elements)','Porin loss (ompK35/36)'], class:'β-lactam', who:'Last-resort' },
        Cephalosporins: { genes:['blaCTX-M-15','blaTEM','blaSHV','blaAmpC'], key_mutations:['Gene acquisition (CTX-M-15 dominant in Africa)'], class:'β-lactam (3GC)', who:'Watch-care' },
        Colistin:       { genes:['mcr-1','mcr-2','mgrB','pmrA','pmrB'], key_mutations:['mcr-1 gene acquisition','mgrB insertion/truncation'], class:'Polymyxin', who:'Last-resort' },
        Fluoroquinolones: { genes:['gyrA','parC','qnrA/B/S'], key_mutations:['Ser83Leu gyrA','Asp87Asn gyrA','Ser80Ile parC','qnr genes'], class:'Fluoroquinolone', who:'Access' },
        Aminoglycosides: { genes:['aac(3)','ant(2)','armA','rmtC'], key_mutations:['16S methyltransferase (armA) — pan-aminoglycoside resistance'], class:'Aminoglycoside', who:'Watch-care' },
      }
    },
    hiv: {
      label: 'HIV-1 (ARV resistance)',
      drugs: {
        NRTI:  { genes:['RT'], key_mutations:['M184V (3TC/FTC)','K65R (TDF)','K70E','TAMs: M41L/D67N/K70R/L210W/T215Y/K219Q'], class:'NRTI', who:'1st line backbone' },
        NNRTI: { genes:['RT'], key_mutations:['K103N (EFV/NVP)','Y181C','Y188L','V106M','E138A (RPV)','K101P'], class:'NNRTI', who:'1st/2nd line' },
        PI:    { genes:['PR'], key_mutations:['D30N (NFV)','I50V (ATV)','I84V','L90M','M46I','V82A'], class:'PI', who:'2nd line' },
        INSTI: { genes:['IN'], key_mutations:['N155H (RAL)','Q148H/R/K','Y143R','R263K (DTG)','E138K'], class:'INSTI', who:'1st/2nd line (DTG preferred)' },
      }
    }
  };

  let _currentOrg = 'mtb';
  let _detected = {};

  function _setOrg(org) {
    _currentOrg = org;
    _detected = {};
    _renderDrugSelector(org);
    document.getElementById('amr-output')?.replaceChildren();
  }

  function _renderDrugSelector(org) {
    const db = AMR_DB[org];
    if (!db) return;
    const panel = document.getElementById('amr-mutation-panel');
    if (!panel) return;
    panel.innerHTML = `
      <div class="amr-panel-label">Enter detected mutations (comma-separated per gene):</div>
      ${Object.entries(db.drugs).map(([drug, info]) => `
        <div class="amr-drug-row">
          <div class="amr-drug-name">${drug}</div>
          <div class="amr-drug-genes">Genes: ${info.genes.join(', ')}</div>
          <input class="amr-mut-input" id="amr-mut-${drug.replace(/[\s\/]/g,'_')}"
            placeholder="e.g. ${info.key_mutations[0]}"
            oninput="OmicsLab.AMR._detectResistance()">
        </div>`).join('')}
      <div class="amr-quick-label">Or load a pre-set:</div>
      <div class="amr-quick-btns">
        ${org === 'mtb' ? `
          <button class="amr-quick-btn" onclick="OmicsLab.AMR._loadPreset('mtb_xdr')">XDR-TB (Ethiopia)</button>
          <button class="amr-quick-btn" onclick="OmicsLab.AMR._loadPreset('mtb_mdr')">MDR-TB (SA)</button>
        ` : org === 'pfalciparum' ? `
          <button class="amr-quick-btn" onclick="OmicsLab.AMR._loadPreset('pf_cq')">CQ-resistant (East Africa)</button>
          <button class="amr-quick-btn" onclick="OmicsLab.AMR._loadPreset('pf_k13')">Kelch13 variant (WHO validated)</button>
        ` : org === 'hiv' ? `
          <button class="amr-quick-btn" onclick="OmicsLab.AMR._loadPreset('hiv_M184V')">M184V + K103N (common Africa)</button>
        ` : `
          <button class="amr-quick-btn" onclick="OmicsLab.AMR._loadPreset('entero_ndm')">NDM-1 carbapenem resistant</button>
        `}
      </div>`;
  }

  const PRESETS = {
    mtb_xdr:  { 'Rifampicin':'Ser450Leu', 'Isoniazid':'Ser315Thr', 'Fluoroquinolones':'Asp94Gly', 'Amikacin':'A1401G (16S rRNA)', 'Bedaquiline':'Ala63Pro' },
    mtb_mdr:  { 'Rifampicin':'Ser450Leu', 'Isoniazid':'Ser315Thr' },
    pf_cq:    { 'Chloroquine':'Lys76Thr (pfcrt)' },
    pf_k13:   { 'Artemisinin':'Arg539Thr' },
    hiv_M184V:{ 'NRTI':'M184V (3TC/FTC)', 'NNRTI':'K103N (EFV/NVP)' },
    entero_ndm:{ 'Carbapenems':'blaNDM' },
  };

  function _loadPreset(key) {
    const preset = PRESETS[key];
    if (!preset) return;
    for (const [drug, mut] of Object.entries(preset)) {
      const el = document.getElementById('amr-mut-' + drug.replace(/[\s\/]/g,'_'));
      if (el) el.value = mut;
    }
    _detectResistance();
  }

  function _detectResistance() {
    const db = AMR_DB[_currentOrg];
    if (!db) return;
    const results = {};
    for (const [drug, info] of Object.entries(db.drugs)) {
      const input = (document.getElementById('amr-mut-' + drug.replace(/[\s\/]/g,'_'))?.value || '').toLowerCase().trim();
      if (!input) { results[drug] = { status:'Not tested', muts:[], info }; continue; }
      const muts = input.split(/[,;\/\n]+/).map(s => s.trim()).filter(Boolean);
      const hits = muts.filter(m => info.key_mutations.some(km => km.toLowerCase().includes(m.toLowerCase()) || m.toLowerCase().includes(km.substring(0,6).toLowerCase())));
      results[drug] = { status: hits.length ? 'Resistant' : 'No known resistance mutation detected', muts, hits, info };
    }
    _renderResults(results);
  }

  function _renderResults(results) {
    const out = document.getElementById('amr-output');
    if (!out) return;
    const resistant = Object.entries(results).filter(([, r]) => r.status === 'Resistant');
    const patternLabel = _classifyPattern(resistant.map(([drug]) => drug));
    out.innerHTML = `
      <div class="amr-pattern-banner">
        <div class="amr-pattern-label">Resistance Pattern</div>
        <div class="amr-pattern-val ${resistant.length ? 'amr-resistant' : 'amr-sensitive'}">${patternLabel}</div>
      </div>
      <div class="amr-results-grid">
        ${Object.entries(results).map(([drug, r]) => {
          const isRes = r.status === 'Resistant';
          const isTested = r.status !== 'Not tested';
          const color = isRes ? '#ff6b6b' : isTested ? '#3fb950' : '#484f58';
          return `<div class="amr-drug-card">
            <div class="amr-drug-card-hdr">
              <span class="amr-drug-card-name">${drug}</span>
              <span class="amr-drug-card-class" style="color:${color}">${r.status}</span>
            </div>
            <div class="amr-drug-card-meta">
              <span class="amr-drug-class-badge">${r.info.class}</span>
              <span class="amr-drug-who">WHO: ${r.info.who}</span>
            </div>
            ${r.hits?.length ? `<div class="amr-mut-found">Mutations: ${r.hits.join('; ')}</div>` : ''}
            <div class="amr-key-muts">Key mutations: ${r.info.key_mutations.slice(0,3).join(', ')}</div>
          </div>`;
        }).join('')}
      </div>`;
  }

  function _classifyPattern(resistantDrugs) {
    const rd = resistantDrugs.map(s => s.toLowerCase());
    if (_currentOrg === 'mtb') {
      const hasRIF = rd.includes('rifampicin'), hasINH = rd.includes('isoniazid');
      const hasFQ = rd.includes('fluoroquinolones');
      const hasAMK = rd.includes('amikacin') || rd.includes('kanamycin');
      if (hasRIF && hasINH && hasFQ && hasAMK) return 'Extensively Drug-Resistant TB (XDR-TB)';
      if (hasRIF && hasINH) return 'Multidrug-Resistant TB (MDR-TB)';
      if (hasRIF) return 'Rifampicin-Resistant TB (RR-TB)';
      if (rd.length === 0) return 'Drug-Susceptible (no resistance detected)';
      return `Mono/Poly-Resistant TB (${rd.join(', ')})`;
    }
    if (_currentOrg === 'pfalciparum') {
      if (rd.includes('artemisinin')) return 'Partial Artemisinin Resistance (ART-R) — WHO validated';
      if (rd.includes('chloroquine') && rd.includes('sulfadoxine') && rd.includes('pyrimethamine')) return 'Chloroquine + SP Resistant';
      if (rd.includes('chloroquine')) return 'Chloroquine Resistant';
      return rd.length ? `Resistance to: ${rd.join(', ')}` : 'Drug-Susceptible';
    }
    if (_currentOrg === 'hiv') {
      if (rd.length >= 3) return 'Multi-Class Resistance';
      if (rd.length > 0) return rd.map(d => d.toUpperCase() + ' Resistance').join(' + ');
      return 'No resistance detected';
    }
    if (rd.includes('carbapenems')) return 'Carbapenem-Resistant Enterobacteriaceae (CRE)';
    if (rd.includes('cephalosporins')) return 'ESBL-Producing / 3GC-Resistant';
    return rd.length ? `Resistance to: ${rd.join(', ')}` : 'Susceptible';
  }

  function init() {
    const section = document.getElementById('amr-section');
    if (!section || section.dataset.amrReady) return;
    section.dataset.amrReady = '1';
    const orgOpts = Object.entries(AMR_DB).map(([k, v]) => `<option value="${k}">${v.label}</option>`).join('');
    section.innerHTML = `
      <div class="amr-wrap">
        <div class="amr-header">
          <div class="amr-header-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ff6b6b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v11m0 0H5m4 0h5m-5 0v7m5-7v7m0 0H9"/></svg>
            AMR Resistance Profiler
          </div>
          <div class="amr-header-sub">Profile antimicrobial resistance mutations — TB, malaria, HIV, ESKAPE pathogens · WHO 2023 database</div>
        </div>
        <div class="amr-layout">
          <div class="amr-left">
            <div class="amr-org-card">
              <div class="amr-org-label">Select pathogen</div>
              <select class="amr-org-select" onchange="OmicsLab.AMR._setOrg(this.value)">${orgOpts}</select>
            </div>
            <div id="amr-mutation-panel" class="amr-mutation-panel"></div>
          </div>
          <div class="amr-right" id="amr-output">
            <div class="amr-empty">Select a pathogen and enter detected mutations to profile resistance</div>
          </div>
        </div>
      </div>`;
    _setOrg('mtb');
  }

  return { init, _setOrg, _loadPreset, _detectResistance };
})();
