/* ═══════════════════════════════════════════════════════════════
   OmicsLab — Plans & Pricing
   Institutional licensing tiers, feature comparison, and inquiry form.
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.Pricing = (function () {

  const TIERS = [
    {
      id: 'community',
      name: 'Community',
      price: 'Free',
      priceSub: 'forever',
      color: '#3fb950',
      badge: null,
      desc: 'For individual researchers, students, and self-directed learners anywhere in Africa and beyond.',
      cta: 'Start Learning',
      ctaAction: "OmicsLab.Router.navigate('lab')",
      features: [
        { ok: true,  text: '87+ interactive modules & tools' },
        { ok: true,  text: 'Full offline PWA (no internet needed)' },
        { ok: true,  text: '21 African languages' },
        { ok: true,  text: 'Community certificates' },
        { ok: true,  text: 'Social Hub & peer learning' },
        { ok: true,  text: 'AI Assistant (bring your own key)' },
        { ok: true,  text: 'scRNA-seq & Variant Analysis apps' },
        { ok: false, text: 'Instructor admin dashboard' },
        { ok: false, text: 'Cohort enrollment & tracking' },
        { ok: false, text: 'Branded institutional certificates' },
        { ok: false, text: 'Cohort CSV reports' },
        { ok: false, text: 'Priority support' },
      ],
    },
    {
      id: 'campus',
      name: 'Campus License',
      price: 'From $1,200',
      priceSub: 'per year',
      color: '#58a6ff',
      badge: 'Most Popular',
      desc: 'For universities, research institutes, and training programmes running structured bioinformatics cohorts.',
      cta: 'Request a Quote',
      ctaAction: "_openInquiry('campus')",
      features: [
        { ok: true,  text: 'Everything in Community' },
        { ok: true,  text: 'Up to 200 enrolled learners' },
        { ok: true,  text: 'Instructor admin dashboard' },
        { ok: true,  text: '12-week cohort curriculum' },
        { ok: true,  text: 'Student progress import/export' },
        { ok: true,  text: 'Cohort CSV reports' },
        { ok: true,  text: 'Branded institutional certificates' },
        { ok: true,  text: 'Priority email support (48h)' },
        { ok: true,  text: '1-hour onboarding call with Simon' },
        { ok: true,  text: 'LMS integration guide (Moodle/Canvas)' },
        { ok: false, text: 'White-label branding' },
        { ok: false, text: 'Custom module development' },
      ],
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 'Custom',
      priceSub: 'contact us',
      color: '#bc8cff',
      badge: null,
      desc: 'For government ministries, multi-site institutions, and organisations needing custom deployment or branding.',
      cta: 'Talk to Simon',
      ctaAction: "_openInquiry('enterprise')",
      features: [
        { ok: true,  text: 'Everything in Campus' },
        { ok: true,  text: 'Unlimited learners' },
        { ok: true,  text: 'White-label & custom branding' },
        { ok: true,  text: 'Self-hosted deployment option' },
        { ok: true,  text: 'Custom curriculum development' },
        { ok: true,  text: 'API access for LMS integration' },
        { ok: true,  text: 'Dedicated support (24h SLA)' },
        { ok: true,  text: 'Staff training workshops' },
        { ok: true,  text: 'Quarterly programme reviews' },
        { ok: true,  text: 'Grant application support' },
        { ok: true,  text: 'Data sovereignty / offline deployment' },
        { ok: true,  text: 'Multi-language content customisation' },
      ],
    },
  ];

  const COMPARISON = [
    { feature: 'Modules & tools',             community: 'All 87+',    campus: 'All 87+',      enterprise: 'All 87+ + custom' },
    { feature: 'Offline PWA',                 community: true,         campus: true,           enterprise: true },
    { feature: 'Languages',                   community: '21',         campus: '21',           enterprise: '21 + custom' },
    { feature: 'Learners',                    community: 'Unlimited',  campus: 'Up to 200',    enterprise: 'Unlimited' },
    { feature: 'Instructor dashboard',        community: false,        campus: true,           enterprise: true },
    { feature: 'Cohort management',           community: false,        campus: true,           enterprise: true },
    { feature: 'Progress reports (CSV)',      community: false,        campus: true,           enterprise: true },
    { feature: 'Branded certificates',        community: false,        campus: true,           enterprise: true },
    { feature: 'LMS integration guide',       community: false,        campus: true,           enterprise: true },
    { feature: 'White-label branding',        community: false,        campus: false,          enterprise: true },
    { feature: 'Custom modules',              community: false,        campus: false,          enterprise: true },
    { feature: 'Self-hosted deployment',      community: false,        campus: false,          enterprise: true },
    { feature: 'Support',                     community: 'Community',  campus: 'Email 48h',    enterprise: 'Dedicated 24h' },
  ];

  const FAQS = [
    {
      q: 'How does OmicsLab work offline?',
      a: 'OmicsLab is a Progressive Web App (PWA). Once loaded, all 87+ modules, tools, and datasets are cached locally. Students can use the full platform in areas with no internet — perfect for field research and institutions with unreliable connectivity.',
    },
    {
      q: 'How does the instructor dashboard work without a server?',
      a: 'The instructor sets up a cohort code and shares it with students. Each student exports a small JSON progress file from their device and sends it (email, WhatsApp, USB) to the instructor, who imports it into their dashboard. No server or accounts needed.',
    },
    {
      q: 'Is there a discount for African universities and NGOs?',
      a: 'Yes — academic institutions and NGOs based in Africa receive a 60% discount on all Campus License tiers. We also offer free 3-month pilot programmes for institutions applying for bioinformatics training grants.',
    },
    {
      q: 'Can we run OmicsLab on our own infrastructure?',
      a: 'Enterprise customers can self-host the entire platform on institutional servers. Since OmicsLab is a pure static web app, deployment requires only a basic web server (nginx, Apache, or a CDN). No database or backend needed.',
    },
    {
      q: 'Do the certificates have any external validity?',
      a: "OmicsLab certificates are issued under the Open Badge 3.0 W3C Verifiable Credentials standard. For Campus and Enterprise tiers, certificates carry your institution's seal and Simon Mufara's digital signature. We are working toward formal accreditation partnerships with H3ABioNet and African bioinformatics networks.",
    },
    {
      q: 'How do we integrate with Moodle or Canvas?',
      a: 'Campus and Enterprise licenses include a detailed LMS integration guide covering iframe embedding, SCORM-compatible progress tracking, and xAPI (Tin Can) activity statements. Simon provides direct technical support during integration.',
    },
    {
      q: 'What happens after we pay?',
      a: "Simon personally onboards every Campus and Enterprise customer. You receive: institution mode unlock documentation, a 1-hour onboarding call, your institution's branded certificate template, and a direct support channel. Most institutions are live within 48 hours.",
    },
  ];

  const WHO_FOR = [
    { icon: '○', label: 'Universities & Medical Schools', desc: 'Structured 12-week cohort curriculum for genomics and bioinformatics degree programmes.' },
    { icon: '○', label: 'Research Institutes', desc: 'Train wet-lab teams on bioinformatics pipelines and data interpretation without constant expert supervision.' },
    { icon: '○', label: 'Government Health Ministries', desc: 'Build national capacity in genomic surveillance, outbreak analysis, and variant interpretation.' },
    { icon: '○', label: 'H3ABioNet Member Nodes', desc: 'Deliver standardised Pan-African training materials offline across multiple countries simultaneously.' },
    { icon: '○', label: 'NGOs & Training Programmes', desc: 'Run short courses and workshops with zero connectivity requirements and no per-seat costs.' },
    { icon: '○', label: 'Clinical Labs & Hospitals', desc: 'Upskill clinical bioinformatics staff on ACMG classification, variant reporting, and pharmacogenomics.' },
  ];

  /* ─── Inquiry modal ─── */
  function _openInquiry(tier) {
    const tierName = tier === 'enterprise' ? 'Enterprise' : 'Campus License';
    const overlay = document.createElement('div');
    overlay.id = 'pricing-inquiry-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(1,4,9,.85);z-index:9999;display:flex;align-items:center;justify-content:center;padding:1rem';
    overlay.innerHTML = `
      <div class="prc-modal" role="dialog" aria-label="Institutional enquiry">
        <div class="prc-modal-hdr">
          <div>
            <div class="prc-modal-title">Request ${tierName}</div>
            <div class="prc-modal-sub">Simon will respond within 24 hours</div>
          </div>
          <button class="prc-modal-close" onclick="document.getElementById('pricing-inquiry-overlay')?.remove()" aria-label="Close">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="prc-modal-body">
          <div class="prc-form-row">
            <div class="prc-field">
              <label class="prc-label">Your Name *</label>
              <input class="prc-input" id="prc-name" type="text" placeholder="Prof. / Dr. / Mr. / Ms.">
            </div>
            <div class="prc-field">
              <label class="prc-label">Institution / Organisation *</label>
              <input class="prc-input" id="prc-inst" type="text" placeholder="e.g. University of Nairobi">
            </div>
          </div>
          <div class="prc-form-row">
            <div class="prc-field">
              <label class="prc-label">Email *</label>
              <input class="prc-input" id="prc-email" type="email" placeholder="you@institution.ac">
            </div>
            <div class="prc-field">
              <label class="prc-label">Country</label>
              <input class="prc-input" id="prc-country" type="text" placeholder="e.g. Kenya">
            </div>
          </div>
          <div class="prc-field">
            <label class="prc-label">Number of learners expected</label>
            <select class="prc-input" id="prc-size">
              <option value="">Select cohort size</option>
              <option>1–25 students</option>
              <option>26–50 students</option>
              <option>51–100 students</option>
              <option>101–200 students</option>
              <option>200+ students</option>
            </select>
          </div>
          <div class="prc-field">
            <label class="prc-label">What are you training people to do? Tell Simon about your programme</label>
            <textarea class="prc-input prc-textarea" id="prc-msg" placeholder="e.g. We run an annual 3-month bioinformatics bootcamp for MSc students across East Africa. We need cohort tracking and branded certificates..."></textarea>
          </div>
          <div class="prc-discount-note">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#3fb950" stroke-width="2" stroke-linecap="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
            African academic institutions and NGOs qualify for a <strong>60% discount</strong>. Mention your organisation type in the message above.
          </div>
          <button class="prc-submit-btn" onclick="OmicsLab.Pricing._sendInquiry('${tier}')">
            Send Enquiry
          </button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
  }

  function _sendInquiry(tier) {
    const name    = document.getElementById('prc-name')?.value.trim();
    const inst    = document.getElementById('prc-inst')?.value.trim();
    const email   = document.getElementById('prc-email')?.value.trim();
    const country = document.getElementById('prc-country')?.value.trim();
    const size    = document.getElementById('prc-size')?.value;
    const msg     = document.getElementById('prc-msg')?.value.trim();

    if (!name || !inst || !email) {
      OmicsLab.Toast?.show('Please fill in your name, institution, and email', 'warning');
      return;
    }

    const tierLabel = tier === 'enterprise' ? 'Enterprise License' : 'Campus License';
    const body = [
      `OmicsLab ${tierLabel} Enquiry`,
      ``,
      `Name: ${name}`,
      `Institution: ${inst}`,
      `Email: ${email}`,
      `Country: ${country || '—'}`,
      `Cohort size: ${size || '—'}`,
      ``,
      `Message:`,
      msg || '(no message)',
    ].join('\n');

    const mailto = `mailto:kaykayxsimon@gmail.com?subject=${encodeURIComponent(`OmicsLab ${tierLabel} — ${inst}`)}&body=${encodeURIComponent(body)}`;
    window.open(mailto, '_blank');

    document.getElementById('pricing-inquiry-overlay')?.remove();
    OmicsLab.Toast?.show('Email client opened — send the email to complete your enquiry', 'success');
  }

  /* ─── Main render ─── */
  function init() {
    const section = document.getElementById('pricing-section');
    if (!section || section.dataset.prcReady) return;
    section.dataset.prcReady = '1';
    _render(section);
  }

  function _render(section) {
    const _ck = (ok) => ok === true
      ? `<svg class="prc-feat-icon prc-ok" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>`
      : ok === false
        ? `<svg class="prc-feat-icon prc-no" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`
        : `<span class="prc-feat-val">${ok}</span>`;

    section.innerHTML = `
    <div class="prc-wrap">

      <!-- Header -->
      <div class="prc-header">
        <div class="prc-eyebrow">Plans &amp; Pricing</div>
        <h1 class="prc-title">Professional bioinformatics training<br>built for Africa</h1>
        <p class="prc-subtitle">Free for individual learners. Structured licensing for institutions that need cohort management, branded certificates, and support.</p>
        <div class="prc-africa-badge">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
          60% discount for African academic institutions &amp; NGOs &nbsp;·&nbsp; Free 3-month pilot available
        </div>
      </div>

      <!-- Pricing cards -->
      <div class="prc-cards">
        ${TIERS.map(t => `
          <div class="prc-card${t.badge ? ' prc-card-featured' : ''}" style="--tier-color:${t.color}">
            ${t.badge ? `<div class="prc-card-badge">${t.badge}</div>` : ''}
            <div class="prc-card-name">${t.name}</div>
            <div class="prc-card-price">${t.price}</div>
            <div class="prc-card-price-sub">${t.priceSub}</div>
            <p class="prc-card-desc">${t.desc}</p>
            <button class="prc-card-btn" style="background:${t.badge ? t.color : 'transparent'};border-color:${t.color};color:${t.badge ? '#0d1117' : t.color}"
              onclick="${t.ctaAction}">${t.cta}</button>
            <ul class="prc-feat-list">
              ${t.features.map(f => `
                <li class="prc-feat-item${f.ok ? '' : ' prc-feat-off'}">
                  ${_ck(f.ok)}
                  <span>${f.text}</span>
                </li>`).join('')}
            </ul>
          </div>
        `).join('')}
      </div>

      <!-- Who is it for -->
      <div class="prc-who">
        <div class="prc-section-label">Who uses OmicsLab</div>
        <div class="prc-who-grid">
          ${WHO_FOR.map(w => `
            <div class="prc-who-card">
              <div class="prc-who-title">${w.label}</div>
              <div class="prc-who-desc">${w.desc}</div>
            </div>`).join('')}
        </div>
      </div>

      <!-- Comparison table -->
      <div class="prc-compare">
        <div class="prc-section-label">Full feature comparison</div>
        <div class="prc-compare-wrap">
          <table class="prc-table">
            <thead>
              <tr>
                <th class="prc-th-feat">Feature</th>
                <th class="prc-th-tier" style="color:#3fb950">Community</th>
                <th class="prc-th-tier prc-th-mid" style="color:#58a6ff">Campus</th>
                <th class="prc-th-tier" style="color:#bc8cff">Enterprise</th>
              </tr>
            </thead>
            <tbody>
              ${COMPARISON.map(row => `
                <tr>
                  <td class="prc-td-feat">${row.feature}</td>
                  <td class="prc-td">${_ck(row.community)}</td>
                  <td class="prc-td prc-td-mid">${_ck(row.campus)}</td>
                  <td class="prc-td">${_ck(row.enterprise)}</td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Pilot programme CTA -->
      <div class="prc-pilot">
        <div class="prc-pilot-inner">
          <div class="prc-pilot-left">
            <div class="prc-pilot-title">Free 3-month pilot for grant-funded programmes</div>
            <p class="prc-pilot-desc">If your institution is applying for a bioinformatics training grant (H3ABioNet, NIH Fogarty, Wellcome Trust, Gates Foundation), Simon will provide a full Campus License free for 3 months to support your application with documented learner outcomes and platform usage statistics.</p>
          </div>
          <button class="prc-pilot-btn" onclick="_openInquiry('campus')">Apply for Pilot</button>
        </div>
      </div>

      <!-- FAQ -->
      <div class="prc-faq">
        <div class="prc-section-label">Frequently asked questions</div>
        <div class="prc-faq-list">
          ${FAQS.map((f, i) => `
            <div class="prc-faq-item" id="prc-faq-${i}">
              <button class="prc-faq-q" onclick="OmicsLab.Pricing._toggleFaq(${i})" aria-expanded="false">
                <span>${f.q}</span>
                <svg class="prc-faq-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="6 9 12 15 18 9"/></svg>
              </button>
              <div class="prc-faq-a" style="display:none">${f.a}</div>
            </div>`).join('')}
        </div>
      </div>

      <!-- Bottom CTA -->
      <div class="prc-bottom-cta">
        <div class="prc-bottom-title">Ready to bring OmicsLab to your institution?</div>
        <p class="prc-bottom-sub">Simon personally handles every institutional onboarding. Expect a response within 24 hours.</p>
        <div class="prc-bottom-btns">
          <button class="prc-bottom-btn-primary" onclick="_openInquiry('campus')">Request Campus Quote</button>
          <button class="prc-bottom-btn-ghost" onclick="_openInquiry('enterprise')">Discuss Enterprise</button>
        </div>
        <div class="prc-bottom-contact">
          Or email directly:
          <a href="mailto:kaykayxsimon@gmail.com" class="prc-bottom-email">kaykayxsimon@gmail.com</a>
        </div>
      </div>

    </div>`;
  }

  function _toggleFaq(i) {
    const item = document.getElementById(`prc-faq-${i}`);
    if (!item) return;
    const ans = item.querySelector('.prc-faq-a');
    const btn = item.querySelector('.prc-faq-q');
    const arrow = item.querySelector('.prc-faq-arrow');
    const open = ans.style.display !== 'none';
    ans.style.display = open ? 'none' : 'block';
    btn.setAttribute('aria-expanded', String(!open));
    arrow.style.transform = open ? '' : 'rotate(180deg)';
  }

  return { init, _openInquiry, _sendInquiry, _toggleFaq };
})();
