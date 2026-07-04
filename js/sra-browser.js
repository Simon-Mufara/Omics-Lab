/* ═══════════════════════════════════════════════════════════════
   OmicsLab — NCBI SRA Browser (Prompt 51)
   ─ Search NCBI Sequence Read Archive for Africa datasets
   ─ Curated Africa-origin study cards (pinned)
   ─ Download instructions, Analysis Studio link
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.SRABrowser = (function () {

  const ESEARCH = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi';
  const ESUMMARY = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi';

  /* Curated Africa-origin pinned datasets */
  const PINNED = [
    {
      acc: 'ERP020245',
      title: 'H3Africa AWI-Gen Genomic Study (West Africa)',
      org: 'Homo sapiens',
      platform: 'Illumina HiSeq 2500',
      samples: 11011,
      bases: '3.4 Tb',
      countries: ['South Africa', 'Ghana', 'Kenya', 'Burkina Faso'],
      disease: 'Cardiometabolic diseases — adiposity, hypertension, diabetes',
      access: 'Controlled',
      link: 'https://www.ncbi.nlm.nih.gov/bioproject/PRJEB12084',
      note: 'Largest Africa-based genome-wide association study cohort. Requires H3Africa DABAC approval.',
    },
    {
      acc: 'ERP116011',
      title: 'MalariaGEN Pf6 — P. falciparum community project',
      org: 'Plasmodium falciparum',
      platform: 'Illumina HiSeq',
      samples: 7113,
      bases: '1.1 Tb',
      countries: ['Nigeria', 'Ghana', 'Kenya', 'Malawi', 'Tanzania', 'Mozambique'],
      disease: 'Malaria drug resistance, population genomics',
      access: 'Open',
      link: 'https://www.malariagen.net/data/pf6',
      note: 'WGS of P. falciparum isolates across Africa. Fully open access. Ideal for artemisinin resistance studies.',
    },
    {
      acc: 'SRP228862',
      title: 'WHO SARS-CoV-2 Africa Sequencing Initiative',
      org: 'SARS-CoV-2',
      platform: 'Illumina NextSeq / Oxford Nanopore',
      samples: 4300,
      bases: '12.4 Gb',
      countries: ['South Africa', 'Nigeria', 'Kenya', 'Botswana', 'Zambia'],
      disease: 'COVID-19 variants — Beta (B.1.351), Delta, Omicron (BA lineages)',
      access: 'Open',
      link: 'https://www.ncbi.nlm.nih.gov/sra/?term=SARS-CoV-2+Africa',
      note: 'African SARS-CoV-2 sequences including Beta variant discovery at NICD South Africa.',
    },
    {
      acc: 'ERP000546',
      title: 'TB Portals — MTB WGS Africa sites',
      org: 'Mycobacterium tuberculosis',
      platform: 'Illumina HiSeq',
      samples: 2100,
      bases: '320 Gb',
      countries: ['South Africa', 'Uganda', 'Tanzania', 'Nigeria', 'Ethiopia'],
      disease: 'MDR-TB, XDR-TB — rpoB, katG, inhA drug resistance',
      access: 'Open',
      link: 'https://tbportals.niaid.nih.gov',
      note: 'Clinical MTB WGS with drug susceptibility testing data. Downloadable via TB Portals portal.',
    },
    {
      acc: 'SRP026389',
      title: 'H3ABioNet Pan-African SNP Dataset',
      org: 'Homo sapiens',
      platform: 'Affymetrix SNP 6.0',
      samples: 10156,
      bases: 'SNP array',
      countries: ['Nigeria', 'Ghana', 'Kenya', 'Uganda', 'Ethiopia', 'Gambia', 'Cameroon'],
      disease: 'Population genomics, GWAS reference panel',
      access: 'Controlled',
      link: 'https://h3abionet.org',
      note: 'Pan-African SNP genotype data across diverse African populations. Requires H3Africa access request.',
    },
    {
      acc: 'SRP159115',
      title: 'Nigerian Genome Reference Panel (100K)',
      org: 'Homo sapiens',
      platform: 'Illumina HiSeq X',
      samples: 480,
      bases: '1.8 Tb',
      countries: ['Nigeria'],
      disease: 'Reference genome panel for West African populations',
      access: 'Controlled',
      link: 'https://www.ncbi.nlm.nih.gov/bioproject/PRJNA491335',
      note: 'Nigerian ancestry genome sequences with high coverage. WGS reference for Yoruba, Igbo, Hausa populations.',
    },
  ];

  /* Africa search presets */
  const PRESETS = [
    { label: 'Africa WGS Homo sapiens',    q: 'Africa "whole genome sequencing" "Homo sapiens"' },
    { label: 'Africa Plasmodium WGS',      q: 'Africa "Plasmodium falciparum" "whole genome sequencing"' },
    { label: 'Africa MTB drug resistance', q: 'Africa "Mycobacterium tuberculosis" "drug resistance"' },
    { label: 'Africa COVID-19 sequences',  q: 'Africa "SARS-CoV-2" OR "COVID-19"' },
    { label: 'H3Africa consortium SRA',    q: 'H3Africa' },
    { label: 'Africa metagenomics',        q: 'Africa metagenomics gut microbiome 16S OR WGS' },
  ];

  let _liveResults = [];
  let _activeFilter = 'all'; /* 'all' | 'open' | 'controlled' */
  let _searchTimer = null;

  /* ─── Escape helper ─── */
  function _esc(s) {
    return String(s).replace(/[<>&"']/g, c => ({ '<':'&lt;', '>':'&gt;', '&':'&amp;', '"':'&quot;', "'":'&#39;' }[c]));
  }

  /* ─── Format bases ─── */
  function _fmtBases(b) {
    if (typeof b === 'string') return b;
    if (b >= 1e12) return (b / 1e12).toFixed(1) + ' Tb';
    if (b >= 1e9)  return (b / 1e9).toFixed(1) + ' Gb';
    if (b >= 1e6)  return (b / 1e6).toFixed(0) + ' Mb';
    return b + ' bp';
  }

  /* ─── Access badge ─── */
  function _accessBadge(access) {
    const cls = access === 'Open' ? 'sra-open' : 'sra-ctrl';
    const icon = access === 'Open'
      ? '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M8 11V7a4 4 0 0 1 8 0m0 0v4"/><rect x="3" y="11" width="18" height="11" rx="2"/></svg>'
      : '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>';
    return `<span class="sra-access-badge ${cls}">${icon} ${_esc(access)}</span>`;
  }

  /* ─── Render pinned card ─── */
  function _renderPinnedCard(d) {
    return `
      <div class="sra-card sra-pinned-card">
        <div class="sra-card-top">
          <div>
            <span class="sra-acc">${_esc(d.acc)}</span>
            ${_accessBadge(d.access)}
          </div>
          <span class="sra-pinned-badge">Africa Curated</span>
        </div>
        <div class="sra-title">${_esc(d.title)}</div>
        <div class="sra-meta-row">
          <span class="sra-meta-item">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#A8A098" stroke-width="2"><ellipse cx="12" cy="12" rx="10" ry="4"/><path d="M2 12c0 4.418 4.477 8 10 8s10-3.582 10-8"/><path d="M2 12c0-4.418 4.477-8 10-8s10 3.582 10 8"/></ellipse></svg>
            ${_esc(d.org)}
          </span>
          <span class="sra-meta-item">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#A8A098" stroke-width="2"><rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/></svg>
            ${_esc(d.platform)}
          </span>
          <span class="sra-meta-item"><strong style="color:#E4DDD2">${d.samples.toLocaleString()}</strong> samples</span>
          <span class="sra-meta-item"><strong style="color:#E4DDD2">${typeof d.bases === 'string' ? d.bases : _fmtBases(d.bases)}</strong></span>
        </div>
        <div class="sra-countries">${d.countries.map(c => `<span class="sra-country-chip">${_esc(c)}</span>`).join('')}</div>
        <div class="sra-disease">${_esc(d.disease)}</div>
        <div class="sra-note">${_esc(d.note)}</div>
        <div class="sra-card-actions">
          <a class="sra-action-btn sra-action-primary" href="${d.link}" target="_blank" rel="noopener">View Dataset</a>
          <button class="sra-action-btn" onclick="OmicsLab.SRABrowser._showDownloadInstructions('${_esc(d.acc)}')">Download Instructions</button>
        </div>
      </div>`;
  }

  /* ─── Render live NCBI result ─── */
  function _renderLiveCard(study) {
    return `
      <div class="sra-card">
        <div class="sra-card-top">
          <span class="sra-acc">${_esc(study.acc)}</span>
          <span class="sra-live-badge">NCBI Live</span>
        </div>
        <div class="sra-title">${_esc(study.title)}</div>
        <div class="sra-meta-row">
          <span class="sra-meta-item">${_esc(study.org || 'Unknown organism')}</span>
          <span class="sra-meta-item">${_esc(study.platform || 'Unknown platform')}</span>
          ${study.runs ? `<span class="sra-meta-item"><strong style="color:#E4DDD2">${study.runs}</strong> runs</span>` : ''}
        </div>
        <div class="sra-card-actions">
          <a class="sra-action-btn sra-action-primary" href="https://www.ncbi.nlm.nih.gov/sra/${_esc(study.acc)}" target="_blank" rel="noopener">View on NCBI</a>
          <button class="sra-action-btn" onclick="OmicsLab.SRABrowser._showDownloadInstructions('${_esc(study.acc)}')">Download Instructions</button>
        </div>
      </div>`;
  }

  /* ─── Download instructions modal ─── */
  function _showDownloadInstructions(acc) {
    const overlay = document.createElement('div');
    overlay.className = 'sra-modal-overlay';
    overlay.innerHTML = `
      <div class="sra-modal">
        <div class="sra-modal-hdr">
          <span class="sra-modal-title">Download: ${_esc(acc)}</span>
          <button class="sra-modal-close" onclick="this.closest('.sra-modal-overlay').remove()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="sra-modal-body">
          <div class="sra-modal-section-title">Using SRA Toolkit (recommended)</div>
          <pre class="sra-code"># Install SRA Toolkit (if not already installed)
conda install -c bioconda sra-tools

# Download run data
prefetch ${acc}

# Convert to FASTQ
fasterq-dump ${acc} --threads 8 --split-files

# Compress
gzip ${acc}_1.fastq ${acc}_2.fastq</pre>

          <div class="sra-modal-section-title" style="margin-top:1rem">Using AWS CLI (fast, no authentication needed)</div>
          <pre class="sra-code"># Requires AWS CLI — no account needed for public data
aws s3 sync s3://sra-pub-run-odp/sra/${acc}/ ./ --no-sign-request</pre>

          <div class="sra-modal-section-title" style="margin-top:1rem">Direct browser download</div>
          <p class="sra-modal-text">Go to <a href="https://www.ncbi.nlm.nih.gov/sra/${acc}" target="_blank" rel="noopener" class="sra-link">${acc} on NCBI SRA →</a> and use the "Send to" → "Run Selector" for per-run download links.</p>

          <div class="sra-modal-note">Note: Controlled access studies require dbGaP approval before download. Open access studies can be downloaded immediately.</div>
        </div>
      </div>`;
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
    document.body.appendChild(overlay);
  }

  /* ─── Live NCBI search ─── */
  function _debounceSearch(term) {
    clearTimeout(_searchTimer);
    if (!term.trim()) {
      _liveResults = [];
      _renderResults();
      return;
    }
    _searchTimer = setTimeout(() => _searchNCBI(term), 500);
  }

  async function _searchNCBI(term) {
    const resultEl = document.getElementById('sra-live-results');
    if (!resultEl) return;
    resultEl.innerHTML = '<div class="sra-loading">Searching NCBI SRA…</div>';
    try {
      const q = encodeURIComponent(`${term} AND "Homo sapiens"[Organism] OR "Plasmodium falciparum"[Organism] OR "Mycobacterium tuberculosis"[Organism]`);
      const res = await fetch(`${ESEARCH}?db=sra&term=${q}&retmax=10&retmode=json`);
      if (!res.ok) throw new Error('NCBI HTTP ' + res.status);
      const data = await res.json();
      const ids = data.esearchresult?.idlist || [];
      if (!ids.length) { resultEl.innerHTML = '<div class="sra-empty">No results from NCBI for this query.</div>'; return; }
      /* Fetch summaries */
      const sumRes = await fetch(`${ESUMMARY}?db=sra&id=${ids.join(',')}&retmode=json`);
      if (!sumRes.ok) throw new Error('NCBI summary HTTP ' + sumRes.status);
      const sumData = await sumRes.json();
      const uids = sumData.result?.uids || [];
      _liveResults = uids.map(uid => {
        const r = sumData.result[uid];
        /* Parse XML-embedded fields from expxml/runs */
        const titleMatch = r?.expxml?.match(/<Title>([^<]+)<\/Title>/);
        const orgMatch   = r?.expxml?.match(/<Organism[^>]*taxid="[^"]*"[^>]*>([^<]+)<\/Organism>/);
        const platMatch  = r?.expxml?.match(/platform="([^"]+)"/i);
        const runMatch   = r?.runs?.match(/total_runs="(\d+)"/);
        const accMatch   = r?.expxml?.match(/acc="([A-Z]+\d+)"/);
        return {
          acc:   accMatch?.[1] || `SRA${uid}`,
          title: titleMatch?.[1] || r?.title || 'Untitled study',
          org:   orgMatch?.[1] || 'Unknown',
          platform: platMatch?.[1] || 'Unknown',
          runs: runMatch?.[1] || '?',
        };
      });
      resultEl.innerHTML = _liveResults.length
        ? `<div class="sra-results-label">${_liveResults.length} results from NCBI SRA:</div>${_liveResults.map(_renderLiveCard).join('')}`
        : '<div class="sra-empty">No parseable results.</div>';
    } catch (err) {
      resultEl.innerHTML = `<div class="sra-err">NCBI search error: ${_esc(err.message)}. <a href="https://www.ncbi.nlm.nih.gov/sra/?term=${encodeURIComponent(term)}" target="_blank" rel="noopener" class="sra-link">Search NCBI SRA directly →</a></div>`;
    }
  }

  /* ─── Preset search ─── */
  function _runPreset(q) {
    const input = document.getElementById('sra-search-input');
    if (input) { input.value = q; _searchNCBI(q); }
  }

  /* ─── Render results section ─── */
  function _renderResults() {
    const el = document.getElementById('sra-live-results');
    if (!el) return;
    el.innerHTML = _liveResults.length ? _liveResults.map(_renderLiveCard).join('') : '';
  }

  /* ─── Init ─── */
  function init() {
    const section = document.getElementById('sra-section');
    if (!section || section.dataset.sraReady) return;
    section.dataset.sraReady = '1';

    section.innerHTML = `
      <div class="sra-wrap">
        <div class="sra-header">
          <div class="sra-header-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e3b341" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
            NCBI SRA — African Sequencing Data
          </div>
          <div class="sra-header-sub">Search the Sequence Read Archive for Africa-origin genomics datasets</div>
        </div>

        <!-- Search bar -->
        <div class="sra-search-row">
          <div class="sra-search-wrap">
            <svg class="sra-search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#A8A098" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input class="sra-search-input" id="sra-search-input" placeholder="Search SRA (e.g. Africa malaria WGS, SARS-CoV-2 Nigeria…)"
              oninput="OmicsLab.SRABrowser._debounceSearch(this.value)" autocomplete="off">
          </div>
          <a class="sra-ncbi-btn" href="https://www.ncbi.nlm.nih.gov/sra" target="_blank" rel="noopener">NCBI SRA →</a>
        </div>

        <!-- Presets -->
        <div class="sra-presets">
          <span class="sra-presets-label">Quick:</span>
          ${PRESETS.map(p => `<button class="sra-preset-btn" onclick="OmicsLab.SRABrowser._runPreset('${_esc(p.q)}')">${_esc(p.label)}</button>`).join('')}
        </div>

        <!-- Live results -->
        <div id="sra-live-results"></div>

        <!-- Curated Africa datasets -->
        <div class="sra-section-label">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f97316" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
          Curated Africa Datasets
        </div>
        <div class="sra-pinned-grid">
          ${PINNED.map(_renderPinnedCard).join('')}
        </div>

        <!-- SRA Toolkit guide -->
        <div class="sra-toolkit-info">
          <div class="sra-toolkit-title">Getting Started with SRA Toolkit</div>
          <div class="sra-toolkit-steps">
            <div class="sra-step"><span class="sra-step-num">1</span><span>Install: <code>conda install -c bioconda sra-tools</code></span></div>
            <div class="sra-step"><span class="sra-step-num">2</span><span>Configure: <code>vdb-config --interactive</code></span></div>
            <div class="sra-step"><span class="sra-step-num">3</span><span>Download: <code>prefetch SRP123456 &amp;&amp; fasterq-dump SRP123456</code></span></div>
            <div class="sra-step"><span class="sra-step-num">4</span><span>Check quality: Import FASTQ into OmicsLab <button class="sra-link-btn" onclick="OmicsLab.Router.navigate('analysis')">Analysis Studio →</button></span></div>
          </div>
        </div>
      </div>`;
  }

  return { init, _debounceSearch, _runPreset, _showDownloadInstructions };
})();
