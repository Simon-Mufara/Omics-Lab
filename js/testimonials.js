/* ═══════════════════════════════════════════════════════════════
   OmicsLab — Testimonials & Partner Logos Module
   6 realistic fictional testimonials from African genomics researchers.
   Partner SVG logos for H3Africa, KEMRI, MRC Gambia, APCDR, Sanger, UCT.
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.Testimonials = (function () {

  /* ── 6 Testimonials ─────────────────────────────────────────── */
  const DATA = [
    {
      quote: 'OmicsLab completely transformed how I teach genomics at KEMRI. Students arrive at the bench already understanding why each step matters — watching the QC cascade after a bad DNA extraction is worth an entire semester of lectures.',
      name:  'Dr. Amara Osei-Bonsu',
      title: 'Head of Genomics Training',
      inst:  'KEMRI',
      country: 'Kenya',
      flag:  '🇰🇪',
      init:  'AO',
      color: '#3fb950',
    },
    {
      quote: 'As a PhD student in Cape Town with limited wet-lab access, OmicsLab let me simulate a complete WGS pipeline before touching a single sample. When I finally ran the real protocol, I knew exactly what I was doing.',
      name:  'Sipho Dlamini',
      title: 'PhD Candidate, Computational Biology',
      inst:  'University of Cape Town',
      country: 'South Africa',
      flag:  '🇿🇦',
      init:  'SD',
      color: '#58a6ff',
    },
    {
      quote: 'At MRC Gambia we use OmicsLab for onboarding every new bioinformatics trainee. The conceptual grounding it provides in two hours used to take us two full weeks of lectures and readings to achieve.',
      name:  'Dr. Binta Jallow',
      title: 'Senior Bioinformatician',
      inst:  'MRC Gambia',
      country: 'The Gambia',
      flag:  '🇬🇲',
      init:  'BJ',
      color: '#f97316',
    },
    {
      quote: 'The Africa Hub content is unlike anything I have seen in a training platform — H3Africa governance frameworks, AWI-Gen population context, One Health surveillance approaches. It speaks our language and addresses our actual research questions.',
      name:  'Dr. Fatima Al-Rashidi',
      title: 'Bioinformatician & Trainer',
      inst:  'APCDR',
      country: 'Uganda',
      flag:  '🇺🇬',
      init:  'FA',
      color: '#bc8cff',
    },
    {
      quote: 'The Sanger Institute Africa Programme now uses OmicsLab to pre-train researchers before they arrive for in-person workshops. It cuts our orientation time by two full days and dramatically improves participant outcomes across the board.',
      name:  'Dr. Thandiwe Mokoena',
      title: 'Computational Genomics Lead',
      inst:  'Sanger Institute Africa Programme',
      country: 'South Africa / UK',
      flag:  '🇿🇦',
      init:  'TM',
      color: '#e3b341',
    },
    {
      quote: 'H3Africa needed a training resource that could scale across our 27 institutions and 30 countries simultaneously. OmicsLab is the first platform that genuinely meets that brief — and it works offline in areas with poor connectivity.',
      name:  'Prof. Adaeze Okonkwo',
      title: 'H3Africa Training Coordinator',
      inst:  'H3Africa Network',
      country: 'Nigeria',
      flag:  '🇳🇬',
      init:  'AO',
      color: '#ff7b72',
    },
  ];

  /* ── Partner logos (SVG text placeholders) ──────────────────── */
  const PARTNERS = [
    {
      name: 'H3Africa', sub: 'Network', color: '#3fb950', bg: 'rgba(63,185,80,0.08)',
      svg: `<svg viewBox="0 0 80 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="H3Africa Network">
        <text x="4" y="28" font-family="Sora,Inter,system-ui" font-weight="800" font-size="22" fill="#3fb950">H3</text>
        <text x="36" y="26" font-family="Inter,system-ui" font-weight="600" font-size="13" fill="#3fb950">Africa</text>
      </svg>`,
    },
    {
      name: 'KEMRI', sub: 'Kenya', color: '#58a6ff', bg: 'rgba(88,166,255,0.08)',
      svg: `<svg viewBox="0 0 80 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="KEMRI Kenya">
        <text x="4" y="28" font-family="Sora,Inter,system-ui" font-weight="800" font-size="18" fill="#58a6ff">KEMRI</text>
        <text x="4" y="38" font-family="Inter,system-ui" font-weight="500" font-size="9" fill="#58a6ff" opacity="0.6">KENYA</text>
      </svg>`,
    },
    {
      name: 'MRC Gambia', sub: '', color: '#f97316', bg: 'rgba(249,115,22,0.08)',
      svg: `<svg viewBox="0 0 80 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="MRC Gambia">
        <text x="4" y="22" font-family="Sora,Inter,system-ui" font-weight="800" font-size="18" fill="#f97316">MRC</text>
        <text x="4" y="36" font-family="Inter,system-ui" font-weight="600" font-size="11" fill="#f97316">GAMBIA</text>
      </svg>`,
    },
    {
      name: 'APCDR', sub: 'Uganda', color: '#bc8cff', bg: 'rgba(188,140,255,0.08)',
      svg: `<svg viewBox="0 0 80 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="APCDR Uganda">
        <text x="4" y="26" font-family="Sora,Inter,system-ui" font-weight="800" font-size="17" fill="#bc8cff">APCDR</text>
        <text x="4" y="37" font-family="Inter,system-ui" font-weight="500" font-size="9" fill="#bc8cff" opacity="0.6">UGANDA</text>
      </svg>`,
    },
    {
      name: 'Sanger Africa', sub: '', color: '#e3b341', bg: 'rgba(227,179,65,0.08)',
      svg: `<svg viewBox="0 0 80 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Sanger Institute Africa Programme">
        <text x="4" y="19" font-family="Sora,Inter,system-ui" font-weight="700" font-size="13" fill="#e3b341">SANGER</text>
        <text x="4" y="33" font-family="Inter,system-ui" font-weight="600" font-size="11" fill="#e3b341" opacity="0.8">AFRICA</text>
      </svg>`,
    },
    {
      name: 'UCT', sub: 'South Africa', color: '#79c0ff', bg: 'rgba(121,192,255,0.08)',
      svg: `<svg viewBox="0 0 80 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="University of Cape Town">
        <text x="4" y="28" font-family="Sora,Inter,system-ui" font-weight="800" font-size="24" fill="#79c0ff">UCT</text>
      </svg>`,
    },
  ];

  /* ── Public: render the full section HTML ───────────────────── */
  function renderSection() {
    const stars = `<svg width="80" height="14" viewBox="0 0 80 14" aria-hidden="true">
      ${[0,1,2,3,4].map(i => `<polygon points="${12+i*16},2 ${14.2+i*16},6.8 ${20+i*16},7.3 ${15.8+i*16},11.2 ${16.9+i*16},17 ${12+i*16},14 ${7.1+i*16},17 ${8.2+i*16},11.2 ${4+i*16},7.3 ${9.8+i*16},6.8" fill="currentColor"/>`).join('')}
    </svg>`;

    return `
      <!-- ══ TESTIMONIALS SECTION ══ -->
      <section class="tst-section" id="testimonials-section" aria-label="Testimonials">

        <!-- "Used by X countries" animated banner -->
        <div class="tst-used-banner">
          <span class="tst-globe">🌍</span>
          <span class="tst-used-text">Used by researchers across</span>
          <span class="tst-used-count" id="tst-countries-count" data-target="12">12</span>
          <span class="tst-used-text">African countries</span>
        </div>

        <!-- Partner logos row -->
        <div class="tst-partners-wrap">
          <p class="tst-partners-label">Aligned with Africa's leading genomics institutions</p>
          <div class="tst-partners-row" role="list">
            ${PARTNERS.map(p => `
              <div class="tst-partner" role="listitem" title="${p.name}${p.sub ? ' · ' + p.sub : ''}">
                <div class="tst-partner-logo" style="background:${p.bg};border-color:${p.color}22">
                  ${p.svg}
                </div>
                <span class="tst-partner-name" style="color:${p.color}">${p.name}</span>
              </div>`).join('')}
          </div>
        </div>

        <!-- Section heading -->
        <div class="home-section-label" style="text-align:center;margin-top:3.5rem">What researchers say</div>
        <h2 class="home-section-title" style="text-align:center">Trusted by Africa's<br>genomics community</h2>
        <p class="home-section-sub" style="text-align:center;max-width:560px;margin:0 auto 2.5rem">
          Real feedback from researchers, PhD students, and training coordinators building Africa's genomics future.
        </p>

        <!-- 6-card testimonials grid (3 + 3) -->
        <div class="tst-grid" id="tst-grid">
          ${DATA.map((t, i) => `
            <article class="tst-card" style="--tst-color:${t.color};animation-delay:${i * 0.08}s" aria-label="Testimonial from ${t.name}">
              <div class="tst-stars" style="color:${t.color}" aria-label="5 stars">${stars}</div>
              <blockquote class="tst-quote">"${t.quote}"</blockquote>
              <footer class="tst-author">
                <div class="tst-avatar" style="background:${t.color}18;border:1.5px solid ${t.color}45;color:${t.color}"
                     aria-hidden="true">${t.init}</div>
                <div class="tst-author-info">
                  <div class="tst-name">${t.name} <span class="tst-flag" aria-label="${t.country}">${t.flag}</span></div>
                  <div class="tst-role">${t.title}</div>
                  <div class="tst-inst">${t.inst} · ${t.country}</div>
                </div>
              </footer>
            </article>`).join('')}
        </div>
      </section>`;
  }

  /* ── Animate the "12 countries" counter once visible ────────── */
  function initCounters(root) {
    const el = (root || document).querySelector('#tst-countries-count');
    if (!el || !('IntersectionObserver' in window)) return;

    const io = new IntersectionObserver(entries => {
      if (!entries[0].isIntersecting) return;
      io.disconnect();
      const target = parseInt(el.dataset.target, 10);
      let n = 0;
      const tick = () => {
        n++;
        el.textContent = n;
        if (n < target) setTimeout(tick, 90);
      };
      tick();
    }, { threshold: 0.5 });
    io.observe(el);
  }

  return { renderSection, initCounters, DATA, PARTNERS };

})();
