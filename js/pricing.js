/* ═══════════════════════════════════════════════════════════════
   OmicsLab — Plans & Pricing  (v2 — redesigned)
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.Pricing = (function () {

  /* ── Tier data ── */
  const TIERS = [
    {
      id:'community', name:'Community', price:'Free', priceSub:'forever — no card needed',
      color:'#00C4A0', badge:null,
      desc:'Every individual researcher, student, and self-directed learner. No account. No install. No expiry.',
      cta:'Start Learning Free', ctaStyle:'outline',
      ctaAction:"OmicsLab.Router.navigate('lab')",
      features:[
        '87+ interactive modules & tools',
        'Full offline PWA (no internet needed)',
        '21 African languages',
        'Community Open Badge certificates',
        'Social Hub & peer learning network',
        'AI Assistant (bring your own key)',
        'scRNA-seq & Variant Analysis live apps',
      ],
      missing:['Instructor admin dashboard','Cohort tracking','Branded certificates','CSV progress exports','Priority support'],
    },
    {
      id:'campus', name:'Campus License', price:'From $1,200', priceSub:'per year · 60% off for Africa',
      color:'#58a6ff', badge:'Most Popular',
      desc:'Universities, research institutes, and training programmes delivering structured bioinformatics cohorts.',
      cta:'Request a Quote', ctaStyle:'solid',
      ctaAction:"OmicsLab.Pricing._openInquiry('campus')",
      features:[
        'Everything in Community',
        'Up to 200 enrolled learners',
        'Instructor admin dashboard',
        '12-week cohort curriculum engine',
        'Student progress import / export (JSON)',
        'Cohort CSV & summary reports',
        'Branded institutional certificates',
        'Priority email support — 48h response',
        '1-hour onboarding call with Simon',
        'LMS integration guide (Moodle / Canvas)',
      ],
      missing:['White-label branding','Custom module development'],
    },
    {
      id:'enterprise', name:'Enterprise', price:'Custom', priceSub:'contact Simon directly',
      color:'#bc8cff', badge:null,
      desc:'Government ministries, multi-site networks, and organisations needing custom deployment or content.',
      cta:'Talk to Simon', ctaStyle:'outline',
      ctaAction:"OmicsLab.Pricing._openInquiry('enterprise')",
      features:[
        'Everything in Campus',
        'Unlimited learners across any number of sites',
        'White-label & custom institutional branding',
        'Self-hosted deployment (nginx / CDN)',
        'Custom curriculum & module development',
        'API access for LMS / SCORM / xAPI integration',
        'Dedicated support — 24h SLA',
        'Staff training workshops (in-person or virtual)',
        'Quarterly programme review sessions',
        'Grant application support with usage evidence',
        'Data sovereignty: full offline deployment',
        'Multi-language content customisation',
      ],
      missing:[],
    },
  ];

  /* ── Comparison rows ── */
  const CMP = [
    { f:'87+ modules & tools',          c:'All',         k:'All',         e:'All + custom' },
    { f:'Offline PWA',                  c:true,          k:true,          e:true },
    { f:'African languages',            c:'21',          k:'21',          e:'21 + custom' },
    { f:'Learner accounts',             c:'Unlimited',   k:'Up to 200',   e:'Unlimited' },
    { f:'Instructor dashboard',         c:false,         k:true,          e:true },
    { f:'Cohort management',            c:false,         k:true,          e:true },
    { f:'Progress reports (CSV)',       c:false,         k:true,          e:true },
    { f:'Branded certificates',         c:false,         k:true,          e:true },
    { f:'LMS integration guide',        c:false,         k:true,          e:true },
    { f:'White-label branding',         c:false,         k:false,         e:true },
    { f:'Custom modules',               c:false,         k:false,         e:true },
    { f:'Self-hosted deployment',       c:false,         k:false,         e:true },
    { f:'Support tier',                 c:'Community',   k:'Email 48h',   e:'Dedicated 24h' },
  ];

  /* ── FAQs ── */
  const FAQS = [
    {
      q:'How does OmicsLab work offline?',
      a:"OmicsLab is a Progressive Web App (PWA). Once loaded in any browser, all 87+ modules, tools, and datasets are cached locally via a Service Worker. Students can use the full platform in areas with no internet — ideal for field research or institutions with unreliable connectivity. No app install required.",
    },
    {
      q:'How does the instructor dashboard work without a server?',
      a:"The instructor creates a cohort and shares a unique code with students. Each student exports a small JSON progress file from their device and sends it (email, WhatsApp, USB drive) to the instructor, who imports it into their dashboard. No server, no student accounts, no GDPR headaches.",
    },
    {
      q:'Is there a discount for African universities and NGOs?',
      a:'Yes — academic institutions and NGOs based in Africa receive a 60% discount on all Campus License tiers. Pricing starts from $480/year after the Africa discount. We also offer free 3-month pilot programmes for institutions applying for bioinformatics training grants.',
    },
    {
      q:'Can we run OmicsLab on our own servers?',
      a:"Enterprise customers can self-host the entire platform on institutional servers or a CDN. Since OmicsLab is a pure static web application, deployment requires only nginx or Apache — no database or backend needed. Simon provides the deployment guide and supports the initial setup.",
    },
    {
      q:'What gives the certificates any validity?',
      a:"OmicsLab certificates are issued under the Open Badge 3.0 W3C Verifiable Credentials standard — shareable, cryptographically signed, and verifiable at any time. Campus and Enterprise certificates carry your institution's seal alongside Simon's digital signature. We are pursuing formal accreditation partnerships with H3ABioNet and African bioinformatics networks.",
    },
    {
      q:'How do we embed OmicsLab inside Moodle or Canvas?',
      a:'Campus and Enterprise licenses include a full LMS integration guide covering iframe embedding, SCORM-compatible progress export, and xAPI (Tin Can) activity statements. Simon provides direct technical support during integration — most institutions complete it within a day.',
    },
    {
      q:'What happens after we request a quote?',
      a:"Simon personally handles every institutional enquiry. You receive a response within 24 hours with a formal quote document. On agreement: institution mode unlock documentation, a 1-hour onboarding call, your branded certificate template, and a direct support channel. Most institutions are live within 48 hours of signing.",
    },
  ];

  /* ── Value differentiators ── */
  const DIFF = [
    {
      icon:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',
      color:'#f97316', title:'Africa-First Content',
      desc:'Real datasets from H3Africa, MalariaGEN, and AWI-Gen. Disease contexts chosen for their relevance to African health. Population frequencies from African cohorts, not European ones.',
    },
    {
      icon:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.36 9.8 19.79 19.79 0 0 1 1.27 1.22 2 2 0 0 1 3.26 0h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 7.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 14.92l.92 2z"/></svg>',
      color:'#00C4A0', title:'Zero Connectivity Required',
      desc:'Full PWA with Service Worker caching. Every module, tool, and dataset works offline after the first load — critical for African field settings and institutions with inconsistent bandwidth.',
    },
    {
      icon:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>',
      color:'#e3b341', title:'Verifiable Credentials',
      desc:'Open Badge 3.0 W3C-standard certificates — cryptographically signed, shareable on LinkedIn, and independently verifiable. Institutional seals on Campus and Enterprise plans.',
    },
    {
      icon:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
      color:'#58a6ff', title:'Personal Founder Support',
      desc:'Simon Mufara personally onboards every institutional customer, responds to support queries, and iterates the platform based on real training feedback. You speak to the person who built it.',
    },
  ];

  /* ── Who it\'s for ── */
  const WHO = [
    { label:'Universities & Medical Schools',     desc:'Structured 12-week cohort curricula for genomics and bioinformatics degree programmes.' },
    { label:'Research Institutes',               desc:'Train wet-lab teams on bioinformatics pipelines and data interpretation without ongoing expert supervision.' },
    { label:'Government Health Ministries',       desc:'Build national capacity in genomic surveillance, outbreak analysis, and clinical variant interpretation.' },
    { label:'H3ABioNet Member Nodes',             desc:'Standardised Pan-African training materials delivered offline across multiple countries simultaneously.' },
    { label:'NGOs & Training Programmes',         desc:'Short courses and workshops with zero connectivity requirements and no per-seat costs.' },
    { label:'Clinical Labs & Hospitals',          desc:'Upskill clinical bioinformatics staff in ACMG classification, variant reporting, and pharmacogenomics.' },
  ];

  /* ── Inquiry modal ── */
  function _openInquiry(tier) {
    const tierName = tier === 'enterprise' ? 'Enterprise' : 'Campus License';
    const overlay  = document.createElement('div');
    overlay.id = 'pricing-inquiry-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(1,4,9,.88);z-index:9999;display:flex;align-items:center;justify-content:center;padding:1rem';
    overlay.innerHTML = `
      <div class="prc-modal" role="dialog" aria-label="Institutional enquiry">
        <div class="prc-modal-hdr">
          <div>
            <div class="prc-modal-title">Request ${tierName}</div>
            <div class="prc-modal-sub">Simon responds within 24 hours — usually much sooner</div>
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
              <label class="prc-label">Institution *</label>
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
            <label class="prc-label">Expected cohort size</label>
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
            <label class="prc-label">Tell Simon about your programme</label>
            <textarea class="prc-input prc-textarea" id="prc-msg" placeholder="e.g. We run an annual 3-month bioinformatics bootcamp for MSc students across East Africa. We need cohort tracking and branded certificates…"></textarea>
          </div>
          <div class="prc-discount-note">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#00C4A0" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
            African academic institutions &amp; NGOs qualify for a <strong>60% discount</strong>. Mention your organisation type above.
          </div>
          <button class="prc-submit-btn" onclick="OmicsLab.Pricing._sendInquiry('${tier}')">Send Enquiry via Email</button>
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
    const label = tier === 'enterprise' ? 'Enterprise License' : 'Campus License';
    const body = [`OmicsLab ${label} Enquiry`,``,`Name: ${name}`,`Institution: ${inst}`,
      `Email: ${email}`,`Country: ${country||'—'}`,`Cohort size: ${size||'—'}`,``,`Message:`,msg||'(no message)'].join('\n');
    window.open(`mailto:simon.mufara1@gmail.com?subject=${encodeURIComponent(`OmicsLab ${label} — ${inst}`)}&body=${encodeURIComponent(body)}`,'_blank');
    document.getElementById('pricing-inquiry-overlay')?.remove();
    OmicsLab.Toast?.show('Email client opened — send the message to complete your enquiry', 'success');
  }

  function _toggleFaq(i) {
    const item  = document.getElementById(`prc-faq-${i}`);
    if (!item) return;
    const ans   = item.querySelector('.prc-faq-a');
    const btn   = item.querySelector('.prc-faq-q');
    const arrow = item.querySelector('.prc-faq-arrow');
    const open  = ans.style.display !== 'none';
    ans.style.display = open ? 'none' : 'block';
    btn.setAttribute('aria-expanded', String(!open));
    arrow.style.transform = open ? '' : 'rotate(180deg)';
  }

  /* ── Check / cross SVGs ── */
  const _OK  = `<svg class="prc-feat-icon prc-ok" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>`;
  const _NO  = `<svg class="prc-feat-icon prc-no" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
  const _ck  = v => v === true ? _OK : v === false ? _NO : `<span class="prc-feat-val">${v}</span>`;

  /* ── Main render ── */
  function init() {
    const section = document.getElementById('pricing-section');
    if (!section || section.dataset.prcReady) return;
    section.dataset.prcReady = '1';

    section.innerHTML = `

    <!-- ══ STICKY SUBNAV ══ -->
    <div class="prc-subnav" id="prc-subnav">
      <div class="prc-subnav-inner">
        <a class="prc-subnav-link" href="#prc-plans">Plans</a>
        <a class="prc-subnav-link" href="#prc-diff-section">Why OmicsLab</a>
        <a class="prc-subnav-link" href="#prc-who-section">Who it's for</a>
        <a class="prc-subnav-link" href="#prc-compare-section">Compare</a>
        <a class="prc-subnav-link" href="#prc-pilot-section">Pilot</a>
        <a class="prc-subnav-link" href="#prc-faq-section">FAQ</a>
        <a class="prc-subnav-link prc-subnav-cta" href="#prc-contact">Get a Quote</a>
      </div>
    </div>

    <!-- ══ HERO ══ -->
    <div class="prc2-hero" id="prc-plans">
      <div class="prc2-hero-bg"></div>
      <div class="prc2-hero-inner">
        <div class="prc2-eyebrow">Plans &amp; Pricing</div>
        <h1 class="prc2-hero-title">
          Professional bioinformatics training<br>
          <span class="prc2-hero-accent">built for African institutions</span>
        </h1>
        <p class="prc2-hero-sub">
          Free for every individual learner — forever. Structured licensing for institutions
          that need cohort management, branded certificates, and founder-level support.
        </p>
        <div class="prc2-hero-badges">
          <span class="prc2-hero-badge prc2-badge-green">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
            60% off for Africa academic &amp; NGO
          </span>
          <span class="prc2-hero-badge prc2-badge-blue">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
            Free 3-month pilot available
          </span>
          <span class="prc2-hero-badge prc2-badge-gray">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
            No server · 100% offline · No student accounts
          </span>
        </div>
      </div>
    </div>

    <!-- ══ IMPACT STRIP ══ -->
    <div class="prc2-impact-strip">
      <div class="prc2-impact-inner">
        <div class="prc2-impact-stat">
          <div class="prc2-impact-num">87<span>+</span></div>
          <div class="prc2-impact-label">Interactive tools & modules</div>
        </div>
        <div class="prc2-impact-div"></div>
        <div class="prc2-impact-stat">
          <div class="prc2-impact-num">54</div>
          <div class="prc2-impact-label">African countries with users</div>
        </div>
        <div class="prc2-impact-div"></div>
        <div class="prc2-impact-stat">
          <div class="prc2-impact-num">$0</div>
          <div class="prc2-impact-label">Per-student cost — Community tier</div>
        </div>
        <div class="prc2-impact-div"></div>
        <div class="prc2-impact-stat">
          <div class="prc2-impact-num">48<span>h</span></div>
          <div class="prc2-impact-label">Max institutional onboarding time</div>
        </div>
      </div>
    </div>

    <div class="prc-wrap">

      <!-- ══ TIER CARDS ══ -->
      <div class="prc-cards">
        ${TIERS.map(t => `
          <div class="prc-card${t.badge ? ' prc-card-featured' : ''}" style="--tier-color:${t.color}">
            ${t.badge ? `<div class="prc-card-badge">${t.badge}</div>` : ''}
            <div class="prc-card-name" style="color:${t.color}">${t.name}</div>
            <div class="prc-card-price">${t.price}</div>
            <div class="prc-card-price-sub">${t.priceSub}</div>
            <p class="prc-card-desc">${t.desc}</p>
            <button class="prc-card-btn"
              style="${t.ctaStyle==='solid'
                ? `background:${t.color};border-color:${t.color};color:#0D1524`
                : `background:transparent;border-color:${t.color};color:${t.color}`}"
              onclick="${t.ctaAction}">${t.cta}</button>
            <div class="prc2-feat-section">
              <ul class="prc-feat-list">
                ${t.features.map(f=>`<li class="prc-feat-item">${_OK}<span>${f}</span></li>`).join('')}
              </ul>
              ${t.missing.length ? `<ul class="prc-feat-list" style="margin-top:.5rem">
                ${t.missing.map(f=>`<li class="prc-feat-item prc-feat-off">${_NO}<span>${f}</span></li>`).join('')}
              </ul>` : ''}
            </div>
          </div>
        `).join('')}
      </div>

      <!-- ══ WHY OMICSLAB ══ -->
      <div class="prc2-diff" id="prc-diff-section">
        <div class="prc-section-label">Why institutions choose OmicsLab</div>
        <div class="prc2-diff-grid">
          ${DIFF.map(d=>`
            <div class="prc2-diff-card">
              <div class="prc2-diff-icon" style="color:${d.color};background:${d.color}18;border-color:${d.color}28">
                ${d.icon}
              </div>
              <div class="prc2-diff-title">${d.title}</div>
              <div class="prc2-diff-desc">${d.desc}</div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- ══ WHO IT'S FOR ══ -->
      <div class="prc-who" id="prc-who-section">
        <div class="prc-section-label">Institutions using OmicsLab</div>
        <div class="prc-who-grid">
          ${WHO.map(w=>`
            <div class="prc-who-card">
              <div class="prc-who-title">${w.label}</div>
              <div class="prc-who-desc">${w.desc}</div>
            </div>`).join('')}
        </div>
      </div>

      <!-- ══ COMPARISON TABLE ══ -->
      <div class="prc-compare" id="prc-compare-section">
        <div class="prc-section-label">Full feature comparison</div>
        <div class="prc-compare-wrap">
          <table class="prc-table">
            <thead>
              <tr>
                <th class="prc-th-feat">Feature</th>
                <th class="prc-th-tier" style="color:#00C4A0">Community</th>
                <th class="prc-th-tier prc-th-mid" style="color:#58a6ff">Campus</th>
                <th class="prc-th-tier" style="color:#bc8cff">Enterprise</th>
              </tr>
            </thead>
            <tbody>
              ${CMP.map(r=>`<tr>
                <td class="prc-td-feat">${r.f}</td>
                <td class="prc-td">${_ck(r.c)}</td>
                <td class="prc-td prc-td-mid">${_ck(r.k)}</td>
                <td class="prc-td">${_ck(r.e)}</td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- ══ PILOT PROGRAMME ══ -->
      <div class="prc-pilot" id="prc-pilot-section">
        <div class="prc-pilot-inner">
          <div class="prc-pilot-left">
            <div class="prc-pilot-title">Free 3-month pilot for grant-funded programmes</div>
            <p class="prc-pilot-desc">
              Applying for a bioinformatics training grant (H3ABioNet, NIH Fogarty, Wellcome Trust, Gates Foundation)?
              Simon will provide a full Campus License free for 3 months to support your application — including documented
              learner outcomes, usage statistics, and a letter of collaboration.
            </p>
          </div>
          <button class="prc-pilot-btn" onclick="OmicsLab.Pricing._openInquiry('campus')">Apply for Pilot</button>
        </div>
      </div>

      <!-- ══ FAQ ══ -->
      <div class="prc-faq" id="prc-faq-section">
        <div class="prc-section-label">Frequently asked questions</div>
        <div class="prc-faq-list">
          ${FAQS.map((f,i)=>`
            <div class="prc-faq-item" id="prc-faq-${i}">
              <button class="prc-faq-q" onclick="OmicsLab.Pricing._toggleFaq(${i})" aria-expanded="false">
                <span>${f.q}</span>
                <svg class="prc-faq-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="6 9 12 15 18 9"/></svg>
              </button>
              <div class="prc-faq-a" style="display:none">${f.a}</div>
            </div>`).join('')}
        </div>
      </div>

      <!-- ══ BOTTOM CTA ══ -->
      <div class="prc-bottom-cta prc2-cta" id="prc-contact">
        <div class="prc2-cta-left">
          <div class="prc-bottom-title">Ready to bring OmicsLab to your institution?</div>
          <p class="prc-bottom-sub">Simon personally handles every institutional onboarding. Expect a response within 24 hours.</p>
          <div class="prc-bottom-btns">
            <button class="prc-bottom-btn-primary" onclick="OmicsLab.Pricing._openInquiry('campus')">Request Campus Quote</button>
            <button class="prc-bottom-btn-ghost" onclick="OmicsLab.Pricing._openInquiry('enterprise')">Discuss Enterprise</button>
          </div>
          <div class="prc-bottom-contact">
            Or email directly:
            <a href="mailto:simon.mufara1@gmail.com" class="prc-bottom-email">simon.mufara1@gmail.com</a>
          </div>
        </div>
        <div class="prc2-cta-photo-wrap">
          <img src="images/simon-mufara.jpg" alt="Simon Mufara" class="prc2-cta-photo" loading="lazy">
          <div class="prc2-cta-photo-caption">
            <strong>Simon Mufara</strong>
            <span>Creator & Lead Developer · UCT Computational Biology</span>
          </div>
        </div>
      </div>

    </div>`;
  }

  return { init, _openInquiry, _sendInquiry, _toggleFaq };
})();
