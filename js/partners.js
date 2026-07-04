/* ═══════════════════════════════════════════════════════
   OmicsLab — About & Inspiration (Part 8)
   About the OmicsLab mission, contributors,
   and open-source foundation page.
   ═══════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.Partners = (function () {

  const PARTNERS = [
    { name:'H3Africa Consortium', type:'Inspiration', region:'Pan-African', desc:'Human Heredity and Health in Africa — a landmark African genomics initiative that inspires OmicsLab\'s Africa-first data philosophy.', link:'https://h3africa.org' },
    { name:'H3ABioNet', type:'Inspiration', region:'Pan-African', desc:'Pan-African bioinformatics network whose open training resources inspire OmicsLab\'s community-oriented approach.', link:'https://h3abionet.org' },
    { name:'Africa CDC', type:'Public Health', region:'Pan-African', desc:'African Union\'s public health agency — a model for data-driven genomic surveillance that shapes the Pathogen Tracker module.', link:'https://africacdc.org' },
    { name:'MalariaGEN', type:'Open Data', region:'Global', desc:'Malaria Genomic Epidemiology Network — open malaria genomics datasets used as reference material in OmicsLab modules.', link:'https://malariagen.net' },
    { name:'Wellcome Sanger Institute', type:'Inspiration', region:'UK/Global', desc:'World-class genomic resources and African genomics programmes that inspire OmicsLab\'s pathogen and population modules.', link:'https://www.sanger.ac.uk' },
    { name:'WACCBIP, Univ. of Ghana', type:'Inspiration', region:'Ghana', desc:'West Africa Centre for Cell Biology of Infectious Pathogens — whose training model inspires OmicsLab\'s disease-focused content.', link:'https://waccbip.org' },
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
    const typeColor = { Academic:'#58a6ff', Infrastructure:'#00C4A0', 'Public Health':'#f97316', Research:'#bc8cff', Technology:'#e3b341', Global:'#79c0ff' };
    section.innerHTML = `
      <div class="pr-wrap">
        <div class="pr-header">
          <div class="pr-header-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#58a6ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            About &amp; Inspiration
          </div>
          <div class="pr-header-sub">The mission, values, and organisations that inspire OmicsLab</div>
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
        <div class="pr-section-label">Organisations that inspire OmicsLab</div>
        <div class="pr-partners-grid">
          ${PARTNERS.map(p => `<div class="pr-partner-card">
            <div class="pr-partner-hdr">
              <span class="pr-partner-name">${p.name}</span>
              <span class="pr-partner-type" style="color:${typeColor[p.type]||'#A8A098'};border-color:${typeColor[p.type]||'#A8A098'}30">${p.type}</span>
            </div>
            <div class="pr-partner-region">${p.region}</div>
            <div class="pr-partner-desc">${p.desc}</div>
            <a class="pr-partner-link" href="${p.link}" target="_blank" rel="noopener">Visit →</a>
          </div>`).join('')}
        </div>
        <!-- Developer spotlight -->
        <div class="pr-dev-card">
          <div class="pr-dev-photo-wrap">
            <img class="pr-dev-photo" src="images/simon-mufara.jpg" alt="Simon Mufara — Creator of OmicsLab" loading="lazy">
          </div>
          <div class="pr-dev-info">
            <div class="pr-dev-eyebrow">Creator &amp; Lead Developer</div>
            <div class="pr-dev-name">Simon Mufara</div>
            <div class="pr-dev-role">Computational Biologist &amp; Bioinformatician &nbsp;·&nbsp; University of Cape Town</div>
            <div class="pr-dev-bio">Simon built OmicsLab from the ground up to give every African researcher access to professional-grade bioinformatics training — offline, multilingual, and free. Every tool, module, simulation, and embedded app on this platform was independently designed, coded, and published by Simon.</div>
            <div class="pr-dev-tags">
              <span class="pr-dev-tag">scRNA-seq</span>
              <span class="pr-dev-tag">Variant Analysis</span>
              <span class="pr-dev-tag">HIV Genomics</span>
              <span class="pr-dev-tag">Africa-first</span>
              <span class="pr-dev-tag">Open Source</span>
            </div>
            <div class="pr-dev-links">
              <a class="pr-dev-link pr-dev-link-primary" href="https://github.com/Simon-Mufara" target="_blank" rel="noopener">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
                GitHub
              </a>
              <a class="pr-dev-link" href="https://linkedin.com/in/simon-mufara" target="_blank" rel="noopener">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
                LinkedIn
              </a>
              <a class="pr-dev-link" href="mailto:simon.mufara1@gmail.com">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                Contact
              </a>
            </div>
          </div>
        </div>
        <!-- Other contributors -->
        <div class="pr-section-label">Contributors</div>
        <div class="pr-contributors">
          <div class="pr-contrib-card">
            <div class="pr-contrib-name">Open Contributions</div>
            <div class="pr-contrib-role">Community-driven bug reports, translations, and dataset curation</div>
            <div class="pr-contrib-country">Pan-Africa</div>
            <a class="pr-contrib-gh" href="https://github.com/omicslab-africa" target="_blank" rel="noopener">@omicslab-africa</a>
          </div>
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
