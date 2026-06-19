/* ═══════════════════════════════════════════════════════
   OmicsLab — Partners & Open-Source Foundation (Part 8)
   About the OmicsLab mission, partners, contributors,
   and open-source foundation page.
   ═══════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.Partners = (function () {

  const PARTNERS = [
    { name:'H3Africa Consortium', type:'Academic', region:'Pan-African', desc:'Human Heredity and Health in Africa — largest African genomics network, co-developing curricula and datasets.', link:'https://h3africa.org' },
    { name:'H3ABioNet', type:'Infrastructure', region:'Pan-African', desc:'Pan-African bioinformatics network providing training resources, data infrastructure and collaborative analysis.', link:'https://h3abionet.org' },
    { name:'Africa CDC', type:'Public Health', region:'Pan-African', desc:'African Union\'s public health agency — genomic surveillance data partnership for the Pathogen Tracker.', link:'https://africacdc.org' },
    { name:'MalariaGEN', type:'Research', region:'Global', desc:'Malaria Genomic Epidemiology Network — providing malaria genomics datasets, reference materials and expertise.', link:'https://malariagen.net' },
    { name:'University of Cape Town', type:'Academic', region:'South Africa', desc:'Computational Biology Group — co-development of course content and validation of tools for African researchers.', link:'https://www.uct.ac.za' },
    { name:'Wellcome Sanger Institute', type:'Research', region:'UK/Global', desc:'Genomic resources, pathogen reference datasets, and African genomics programme expertise.', link:'https://www.sanger.ac.uk' },
    { name:'KEMRI-Wellcome', type:'Academic', region:'Kenya', desc:'Kenya Medical Research Institute — user community, testing partners, and field deployment support.', link:'https://kemri-wellcome.org' },
    { name:'WACCBIP, Univ. of Ghana', type:'Academic', region:'Ghana', desc:'West Africa Centre for Cell Biology of Infectious Pathogens — training partner and content validators.', link:'https://waccbip.org' },
    { name:'Anthropic (Claude API)', type:'Technology', region:'Global', desc:'Large language model provider — powering the AI Assistant, Thesis Coach, and Grant Writing features.', link:'https://anthropic.com' },
  ];

  const CONTRIBUTORS = [
    { name:'Simon Mufara', role:'Lead Developer & Vision', country:'South Africa', github:'simonmufara' },
    { name:'Open Contributions', role:'Community-driven bug reports, translations, and dataset curation', country:'Pan-Africa', github:'omicslab-africa' },
  ];

  const FOUNDATION = {
    name: 'OmicsLab Open Foundation (proposed)',
    mission: 'To make cutting-edge bioinformatics tools freely available to every researcher in Africa, with zero barriers to access — online, offline, and in every major African language.',
    pillars: [
      { icon:'○', title:'Open Source', desc:'All OmicsLab code is open source under MIT licence. Fork it, adapt it, build on it.' },
      { icon:'○', title:'Offline-First', desc:'Every module works without internet. Designed for Africa\'s connectivity realities.' },
      { icon:'○', title:'Multilingual', desc:'21 languages — English, Swahili, Hausa, Yoruba, Amharic, French, Arabic and more.' },
      { icon:'○', title:'Community-Governed', desc:'Roadmap decisions informed by African researchers, not external funders alone.' },
    ],
    github: 'https://github.com/omicslab-africa',
    email: 'hello@omicslab.africa',
  };

  function init() {
    const section = document.getElementById('partners-section');
    if (!section || section.dataset.prReady) return;
    section.dataset.prReady = '1';
    const typeColor = { Academic:'#58a6ff', Infrastructure:'#3fb950', 'Public Health':'#f97316', Research:'#bc8cff', Technology:'#e3b341', Global:'#79c0ff' };
    section.innerHTML = `
      <div class="pr-wrap">
        <div class="pr-header">
          <div class="pr-header-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#58a6ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            Partners &amp; Foundation
          </div>
          <div class="pr-header-sub">The organisations and people making OmicsLab possible</div>
        </div>
        <!-- Foundation -->
        <div class="pr-foundation-card">
          <div class="pr-foundation-name">${FOUNDATION.name}</div>
          <div class="pr-foundation-mission">${FOUNDATION.mission}</div>
          <div class="pr-pillars">
            ${FOUNDATION.pillars.map(p => `<div class="pr-pillar">
              <div class="pr-pillar-title">${p.title}</div>
              <div class="pr-pillar-desc">${p.desc}</div>
            </div>`).join('')}
          </div>
          <div class="pr-foundation-links">
            <a class="pr-gh-link" href="${FOUNDATION.github}" target="_blank" rel="noopener">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
              GitHub
            </a>
            <a class="pr-email-link" href="mailto:${FOUNDATION.email}">${FOUNDATION.email}</a>
          </div>
        </div>
        <!-- Partners grid -->
        <div class="pr-section-label">Partner Organisations</div>
        <div class="pr-partners-grid">
          ${PARTNERS.map(p => `<div class="pr-partner-card">
            <div class="pr-partner-hdr">
              <span class="pr-partner-name">${p.name}</span>
              <span class="pr-partner-type" style="color:${typeColor[p.type]||'#8b949e'};border-color:${typeColor[p.type]||'#8b949e'}30">${p.type}</span>
            </div>
            <div class="pr-partner-region">${p.region}</div>
            <div class="pr-partner-desc">${p.desc}</div>
            <a class="pr-partner-link" href="${p.link}" target="_blank" rel="noopener">Visit →</a>
          </div>`).join('')}
        </div>
        <!-- Contributors -->
        <div class="pr-section-label">Contributors</div>
        <div class="pr-contributors">
          ${CONTRIBUTORS.map(c => `<div class="pr-contrib-card">
            <div class="pr-contrib-name">${c.name}</div>
            <div class="pr-contrib-role">${c.role}</div>
            <div class="pr-contrib-country">${c.country}</div>
            <a class="pr-contrib-gh" href="https://github.com/${c.github}" target="_blank" rel="noopener">@${c.github}</a>
          </div>`).join('')}
        </div>
        <!-- CTA -->
        <div class="pr-cta">
          <div class="pr-cta-title">Contribute to OmicsLab</div>
          <div class="pr-cta-desc">OmicsLab is community-driven. You can contribute by: adding new tools, translating the glossary, submitting bug reports, curating African genomics datasets, or helping maintain the platform.</div>
          <a class="pr-cta-btn" href="https://github.com/omicslab-africa" target="_blank" rel="noopener">Contribute on GitHub</a>
        </div>
      </div>`;
  }

  return { init };
})();
