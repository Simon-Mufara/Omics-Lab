/* ═══════════════════════════════════════════════════════════════
   OmicsLab — Client-side entitlements
   Single source of truth for "can this visitor use feature X" in the
   UI. This is UX only — it makes gated features look and feel right
   (upgrade prompts instead of broken buttons), but a technical user
   can always bypass it in devtools. The features that actually need
   protecting (certificate issuance, AI Tutor quota) are re-checked
   server-side by their own API routes — see api/me.js's header comment
   and lib/entitlements.js.

   Mirrors lib/entitlements.js's FEATURES map; fetched fresh from
   /api/me each session (not persisted to localStorage) so a
   cancelled subscription can't leave a stale "paid" flag behind.
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.Entitlements = (function () {

  const RANKS = ['free', 'scholar', 'practitioner', 'campus', 'enterprise'];

  /* Kept in sync with lib/entitlements.js — this copy exists purely so
     the UI can gate instantly without waiting on a network round trip
     for the common case (feature list rarely changes mid-session). */
  const FEATURES = {
    'variant-interpreter.custom-data': 'scholar',
    'scrna.unlimited':                 'scholar',
    'scrna.export':                    'scholar',
    'certificate.verified':            'scholar',
    'ai-tutor.unlimited':              'scholar',
    'sandbox.export':                  'practitioner',
    'grant-generator':                 'practitioner',
    'thesis-coach':                    'practitioner',
    'ai-tutor.priority':               'practitioner',
  };

  const TIER_LABEL = { scholar: 'Scholar', practitioner: 'Practitioner', campus: 'Campus', enterprise: 'Enterprise' };
  const TIER_COLOR = { scholar: '#00C4A0', practitioner: '#bc8cff', campus: '#58a6ff', enterprise: '#bc8cff' };

  let _state = { plan: 'free', billingPeriod: null, studentVerified: false, ready: false };
  let _fetchPromise = null;

  function tier() { return _state.plan; }

  function hasAccess(feature) {
    const required = FEATURES[feature];
    if (!required) return true;
    return RANKS.indexOf(_state.plan) >= RANKS.indexOf(required);
  }

  async function _fetchMe() {
    if (!OmicsLab.AuthClerk?.getUser?.()) { _state = { plan: 'free', billingPeriod: null, studentVerified: false, ready: true }; return; }
    try {
      const token = await OmicsLab.AuthClerk.getToken();
      if (!token) throw new Error('no token');
      const res = await fetch('/api/me', { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('me fetch failed');
      const data = await res.json();
      _state = { plan: data.plan || 'free', billingPeriod: data.billingPeriod, studentVerified: !!data.studentVerified, ready: true };
    } catch {
      _state = { plan: 'free', billingPeriod: null, studentVerified: false, ready: true };
    }
  }

  function init() {
    _fetchPromise = _fetchMe();
    OmicsLab.AuthClerk?.onAuthChange?.(() => { _fetchPromise = _fetchMe(); });
  }

  async function ready() {
    if (!_fetchPromise) _fetchPromise = _fetchMe();
    await _fetchPromise;
  }

  /* ── <Gate> equivalent ──
     If entitled: leaves `container`'s existing content untouched.
     If not: replaces it with an on-brand, non-punitive upgrade prompt
     naming exactly what the feature unlocks and linking to Pricing. */
  function gate(container, feature, opts) {
    if (typeof container === 'string') container = document.querySelector(container);
    if (!container) return;
    opts = opts || {};

    if (hasAccess(feature)) { container.classList.remove('ol-gated'); return; }

    const required = FEATURES[feature] || 'scholar';
    const label = TIER_LABEL[required] || 'Scholar';
    const color = TIER_COLOR[required] || '#00C4A0';

    container.classList.add('ol-gated');
    container.innerHTML = `
      <div class="ol-gate-card" style="--gate-color:${color}">
        <div class="ol-gate-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        </div>
        <div class="ol-gate-title">${opts.title || `${label} unlocks this`}</div>
        <p class="ol-gate-desc">${opts.desc || 'Upgrade to keep going — see exactly what changes on the Pricing page.'}</p>
        <button type="button" class="ol-gate-btn" onclick="OmicsLab.Router.navigate('pricing')">
          See ${label} plans
        </button>
      </div>`;
  }

  return { init, ready, tier, hasAccess, gate };
})();
