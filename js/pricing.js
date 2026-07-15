/* ═══════════════════════════════════════════════════════════════
   OmicsLab — Plans & Pricing  (v2 — redesigned)
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.Pricing = (function () {

  /* ── Individual tiers (ZAR) — ids referenced by _openCheckout() ── */
  const IND_TIERS = [
    {
      id:'bench', name:'Bench', color:'#00C4A0', badge:null,
      desc:'Every self-directed learner. No card. No expiry. Run any of the 14 lab workflows start to finish.',
      priceM:0, priceY:0, studentM:0, studentY:0,
      cta:'Start Learning Free', ctaStyle:'outline',
      ctaAction:"OmicsLab.Router.navigate('lab')",
      outcomes:[
        'Run all 14 lab workflows end-to-end, with live QC',
        'Track your progress across every curriculum track',
        '3 Socratic AI Tutor questions a day',
        'Try the Variant Interpreter on 5 teaching variants',
        'Preview the scRNA-seq Explorer on a guided dataset',
        'Full offline PWA, all 21 languages',
      ],
      missing:['A verifiable certificate on completion','Unlimited AI Tutor','Your own data in the Variant Interpreter & scRNA-seq Explorer'],
    },
    {
      id:'scholar', name:'Scholar', color:'#00C4A0', badge:'Most students choose this',
      desc:'For students who want the full toolkit and a certificate that actually counts.',
      priceM:79, priceY:790, studentM:49, studentY:490,
      cta:'Subscribe', ctaStyle:'solid',
      ctaAction:"OmicsLab.Pricing._openCheckout('scholar')",
      outcomes:[
        'Master ACMG variant classification on your own VCF data',
        'Run unlimited scRNA-seq clustering analyses, saved & exported',
        'Ask the Socratic AI Tutor unlimited questions',
        'Earn a verifiable Open Badge 3.0 certificate per track',
        'Get early access to every new module',
      ],
      missing:['Pipeline Sandbox export to real Snakemake/Nextflow files','Grant Generator & Thesis Coach AI tools'],
    },
    {
      id:'practitioner', name:'Practitioner', color:'#bc8cff', badge:null,
      desc:'For postgrads and working bioinformaticians who need professional-grade output.',
      priceM:199, priceY:1990, studentM:null, studentY:null,
      cta:'Subscribe', ctaStyle:'outline',
      ctaAction:"OmicsLab.Pricing._openCheckout('practitioner')",
      outcomes:[
        'Everything in Scholar',
        'Export real pipelines from the Sandbox — Snakemake, Nextflow',
        'Draft grant sections and thesis chapters with the AI writing tools',
        'Priority AI Tutor — faster responses, longer context',
        'A CPD-style professional development credential',
      ],
      missing:[],
    },
  ];

  /* ── Institutional tiers (unchanged pricing, kept as a separate on-ramp) ── */
  const TIERS = [
    {
      id:'campus', name:'Campus License', price:'From $1,200', priceSub:'per year · 60% off for Africa',
      color:'#58a6ff', badge:'Most Popular',
      desc:'Universities, research institutes, and training programmes delivering structured bioinformatics cohorts.',
      cta:'Request a Quote', ctaStyle:'solid',
      ctaAction:"OmicsLab.Pricing._openInquiry('campus')",
      features:[
        'Give every enrolled student the full Scholar toolkit at once',
        'Run a 12-week cohort with built-in curriculum pacing, up to 200 learners',
        'See every student\'s progress and where they\'re stuck from one dashboard',
        'Hand out certificates that carry your institution\'s seal, not just OmicsLab\'s',
        'Import/export a whole cohort\'s progress as JSON when the term ends',
        'Get a real person — Simon, on a call — for onboarding and 48h support',
        'Drop OmicsLab straight into Moodle or Canvas with the LMS guide',
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
        'Everything a Campus license gives, with no cap on learners or sites',
        'Put your own name on it — full white-label branding, top to bottom',
        'Run it entirely on your own servers — no dependency on OmicsLab\'s uptime',
        'Commission modules built for your specific curriculum or disease context',
        'Plug into your existing LMS/SCORM/xAPI infrastructure via API',
        'A 24-hour SLA and a dedicated contact, not a shared support queue',
        'Quarterly reviews and grant-application support backed by real usage data',
      ],
      missing:[],
    },
  ];

  /* ── Billing period + student-verified state (session-only, not persisted) ── */
  let _period = 'monthly'; /* 'monthly' | 'annual' */
  let _verified = false;

  function _fmtZAR(n) {
    return n === 0 ? 'Free' : `R${n.toLocaleString('en-ZA')}`;
  }

  /* Returns: amount (ZAR), period ('/mo' | '/yr' | ''), sub (the line shown
     under the price — free tier, annual monthly-equivalent, or plain monthly). */
  function _price(tier) {
    if (tier.priceM === 0) return { amount: 0, period: '', sub: 'forever — no card needed' };
    const annual = _period === 'annual';
    const base = annual ? tier.priceY : tier.priceM;
    const studentPrice = annual ? tier.studentY : tier.studentM;
    const amount = (_verified && studentPrice != null) ? studentPrice : base;
    return annual
      ? { amount, period: '/yr', sub: `≈${_fmtZAR(Math.round(amount / 12))}/mo billed yearly` }
      : { amount, period: '/mo', sub: 'billed monthly · cancel anytime' };
  }

  function setPeriod(period) {
    _period = period;
    const section = document.getElementById('pricing-section');
    if (section) _renderIndividualCards(section);
  }

  function toggleVerified() {
    _verified = !_verified;
    const section = document.getElementById('pricing-section');
    if (section) _renderIndividualCards(section);
  }

  function _individualCardsHtml() {
    return IND_TIERS.map(t => {
      const { amount, period, sub } = _price(t);
      return `
        <div class="prc-card${t.badge ? ' prc-card-featured' : ''}" style="--tier-color:${t.color}">
          ${t.badge ? `<div class="prc-card-badge">${t.badge}</div>` : ''}
          <div class="prc-card-name" style="color:${t.color}">${t.name}</div>
          <div class="prc-card-price">${_fmtZAR(amount)}${period ? `<span class="prc-price-period">${period}</span>` : ''}</div>
          <div class="prc-card-price-sub">${sub}</div>
          ${(_verified && t.studentM != null && amount > 0) ? `<div class="prc-student-badge">Verified-student rate applied</div>` : ''}
          <p class="prc-card-desc">${t.desc}</p>
          <button class="prc-card-btn"
            style="${t.ctaStyle==='solid'
              ? `background:${t.color};border-color:${t.color};color:#0D1524`
              : `background:transparent;border-color:${t.color};color:${t.color}`}"
            onclick="${t.ctaAction}">${t.cta}</button>
          <div class="prc2-feat-section">
            <ul class="prc-feat-list">
              ${t.outcomes.map(f=>`<li class="prc-feat-item">${_OK}<span>${f}</span></li>`).join('')}
            </ul>
            ${t.missing.length ? `<ul class="prc-feat-list" style="margin-top:.5rem">
              ${t.missing.map(f=>`<li class="prc-feat-item prc-feat-off">${_NO}<span>${f}</span></li>`).join('')}
            </ul>` : ''}
          </div>
        </div>`;
    }).join('');
  }

  function _renderIndividualCards(section) {
    const mount = section.querySelector('#prc-ind-cards');
    if (mount) mount.innerHTML = _individualCardsHtml();
    const toggle = section.querySelector('#prc-period-toggle');
    if (toggle) toggle.querySelectorAll('.prc-toggle-opt').forEach(b =>
      b.classList.toggle('active', b.dataset.period === _period));
    const vbtn = section.querySelector('#prc-verified-toggle');
    if (vbtn) vbtn.classList.toggle('active', _verified);
  }

  /* ── Checkout summary modal ──
     This is OmicsLab's own screen — the actual card-entry step happens on
     Paystack's hosted, PCI-compliant page after "Continue to secure payment",
     never inside our own DOM. */
  function _openCheckout(tierId) {
    const tier = IND_TIERS.find(t => t.id === tierId);
    if (!tier) return;
    const { amount, sub } = _price(tier);

    const overlay = document.createElement('div');
    overlay.id = 'checkout-overlay';
    overlay.className = 'checkout-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', `Subscribe to ${tier.name}`);
    overlay.innerHTML = `
      <div class="checkout-card">
        <button type="button" class="checkout-close" onclick="OmicsLab.Pricing._closeCheckout()" aria-label="Close">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>

        <div class="checkout-eyebrow">Confirm your plan</div>
        <div class="checkout-plan-row">
          <div class="checkout-plan-dot" style="background:${tier.color}"></div>
          <div class="checkout-plan-name">${tier.name}</div>
          <div class="checkout-plan-price">${_fmtZAR(amount)}<span>/${_period === 'annual' ? 'yr' : 'mo'}</span></div>
        </div>
        <div class="checkout-plan-sub">${sub}${_verified && tier.studentM != null ? ' · verified-student rate' : ''}</div>

        <div class="checkout-outcomes">
          <div class="checkout-outcomes-label">What you're unlocking</div>
          <ul class="checkout-outcomes-list">
            ${tier.outcomes.slice(0, 4).map(o => `<li>${_OK}<span>${o}</span></li>`).join('')}
          </ul>
        </div>

        <div class="checkout-trust-row">
          <span>${_OK} No lock-in — cancel anytime, access continues to period end</span>
          <span>${_OK} Secure payment via Paystack — card details never touch our servers</span>
        </div>

        <button type="button" class="checkout-pay-btn" id="checkout-pay-btn" onclick="OmicsLab.Pricing._confirmCheckout('${tierId}')">
          Continue to secure payment
        </button>
        <div class="checkout-status" id="checkout-status" style="display:none"></div>
      </div>`;
    document.body.appendChild(overlay);
    overlay.addEventListener('click', e => { if (e.target === overlay) _closeCheckout(); });
  }

  function _closeCheckout() {
    document.getElementById('checkout-overlay')?.remove();
  }

  async function _confirmCheckout(tierId) {
    const tier = IND_TIERS.find(t => t.id === tierId);
    const btn    = document.getElementById('checkout-pay-btn');
    const status = document.getElementById('checkout-status');
    if (!tier || !btn || !status) return;

    if (!OmicsLab.AuthClerk?.getUser?.()) {
      status.style.display = 'block';
      status.className = 'checkout-status checkout-status-info';
      status.innerHTML = `You'll need to sign in first — it's how we know which account to attach the subscription to.`;
      OmicsLab.AuthClerk?.signIn?.();
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Setting up secure payment…';
    status.style.display = 'none';

    try {
      const token = await OmicsLab.AuthClerk.getToken();
      const { amount } = _price(tier);
      const res = await fetch('/api/create-paystack-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          plan: tier.id,
          period: _period,
          verified: _verified,
          amountZAR: amount,
          successUrl: `${location.origin}/?payment=success`,
          cancelUrl:  `${location.origin}/pricing?payment=cancelled`,
        }),
      });
      const data = await res.json();

      if (res.status === 503) {
        status.style.display = 'block';
        status.className = 'checkout-status checkout-status-info';
        status.innerHTML = `Card payments aren't switched on yet — Simon's finishing the Paystack setup. Email <a href="mailto:simon.mufara1@gmail.com?subject=${encodeURIComponent('OmicsLab ' + tier.name + ' waitlist')}">simon.mufara1@gmail.com</a> and you'll be first notified when it's live.`;
        btn.disabled = false;
        btn.textContent = 'Continue to secure payment';
        return;
      }
      if (!res.ok || !data.authorization_url) {
        /* Temporary: put Paystack's full raw rejection directly in the
           thrown message (console logging turned out unreliable to get
           relayed back — screenshots kept missing it) so it shows up
           on the page itself with zero devtools steps needed. Remove
           once "Plan not found" for a plan confirmed to exist is
           resolved — see api/create-paystack-checkout.js. */
        const detail = data.paystackRaw ? ` [${JSON.stringify(data.paystackRaw)}]` : '';
        const planDetail = data.planCodeUsed ? ` (sent plan="${data.planCodeUsed}" key="${data.planKeyUsed}")` : '';
        throw new Error((data.error || 'Checkout failed') + detail + planDetail);
      }

      window.location.href = data.authorization_url;
    } catch (err) {
      /* Used to always show a fixed generic string here regardless of
         what actually failed — meant a real backend error (e.g. a
         missing required field Paystack rejected) was indistinguishable
         from a network hiccup, in the UI or to anyone debugging it
         after the fact without direct server log access. Show the
         specific message when there is one. */
      status.style.display = 'block';
      status.className = 'checkout-status checkout-status-error';
      status.textContent = err?.message && err.message !== 'Checkout failed'
        ? `Couldn't start checkout: ${err.message}`
        : 'Something went wrong starting checkout. Please try again in a moment.';
      btn.disabled = false;
      btn.textContent = 'Continue to secure payment';
    }
  }

  /* ── Comparison rows — individual tiers only; institutional tiers have
     their own full feature lists on the Campus/Enterprise cards above ── */
  const CMP = [
    { f:'All 14 lab workflows, live QC',        c:true,           k:true,             e:true },
    { f:'Curriculum tracks & progress',         c:true,           k:true,             e:true },
    { f:'Socratic AI Tutor',                    c:'3 / day',      k:'Unlimited',      e:'Unlimited, priority' },
    { f:'Variant Interpreter',                  c:'5 presets',    k:'Your own VCF',   e:'Your own VCF' },
    { f:'scRNA-seq Explorer',                   c:'1 demo, view only', k:'Unlimited, exportable', e:'Unlimited, exportable' },
    { f:'Verifiable Open Badge certificate',    c:false,          k:true,             e:true },
    { f:'Pipeline Sandbox → real pipeline export', c:false,       k:false,            e:true },
    { f:'Grant Generator & Thesis Coach AI',    c:false,          k:false,            e:true },
    { f:'Offline PWA, 21 languages',            c:true,           k:true,             e:true },
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

      <!-- ══ INDIVIDUAL PLANS ══ -->
      <div class="prc-section-label">For individual learners</div>
      <div class="prc-controls-row">
        <div class="prc-toggle" id="prc-period-toggle">
          <button type="button" class="prc-toggle-opt active" data-period="monthly" onclick="OmicsLab.Pricing.setPeriod('monthly')">Monthly</button>
          <button type="button" class="prc-toggle-opt" data-period="annual" onclick="OmicsLab.Pricing.setPeriod('annual')">Annual <span class="prc-toggle-save">save ~17%</span></button>
        </div>
        <button type="button" class="prc-verified-toggle" id="prc-verified-toggle" onclick="OmicsLab.Pricing.toggleVerified()">
          <span class="prc-verified-check">${_OK}</span>
          I have a valid African university email (.ac.za etc.)
        </button>
      </div>
      <div class="prc-cards" id="prc-ind-cards">${_individualCardsHtml()}</div>

      <!-- ══ INSTITUTIONAL PLANS ══ -->
      <div class="prc-inst-divider">
        <span>Need this for a whole class or department?</span>
      </div>
      <div class="prc-section-label">Institutional licensing</div>
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
        <div class="prc-section-label">Individual plans, feature by feature</div>
        <p class="prc-compare-sub">Bringing this to a whole class or department instead? Compare Campus and Enterprise on their cards above.</p>
        <div class="prc-compare-wrap">
          <table class="prc-table">
            <thead>
              <tr>
                <th class="prc-th-feat">Feature</th>
                <th class="prc-th-tier" style="color:#00C4A0">Bench</th>
                <th class="prc-th-tier prc-th-mid" style="color:#00C4A0">Scholar</th>
                <th class="prc-th-tier" style="color:#bc8cff">Practitioner</th>
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

  return {
    init, _openInquiry, _sendInquiry, _toggleFaq,
    setPeriod, toggleVerified,
    _openCheckout, _closeCheckout, _confirmCheckout,
  };
})();
