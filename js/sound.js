/* ═══════════════════════════════════════════════════════════════
   OmicsLab — Sound Feedback Module (Web Audio API, no library)
   Optional auditory feedback for step completion and choices.
   User-toggled; persists preference in localStorage.
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.Sound = (function () {

  const PREF_KEY = 'omicslab_sound_enabled';

  let _ctx  = null;
  let _on   = localStorage.getItem(PREF_KEY) === '1'; /* off by default */

  /* Lazy-init AudioContext (required by browser autoplay policy) */
  function _ctx_() {
    if (!_ctx) {
      try {
        _ctx = new (window.AudioContext || window.webkitAudioContext)();
      } catch {
        _ctx = null;
      }
    }
    return _ctx;
  }

  /* ── Generic tone generator ─────────────────────────────────── */
  function _tone(freq, type, gainVal, duration, fadeStart) {
    const ctx = _ctx_();
    if (!ctx) return;
    /* Resume suspended context (autoplay policy) */
    if (ctx.state === 'suspended') ctx.resume();

    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    gain.gain.setValueAtTime(gainVal, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      ctx.currentTime + (fadeStart || duration)
    );

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  }

  /* ── Public sounds ──────────────────────────────────────────── */

  /* Step completion — pleasant ascending two-note ding */
  function step() {
    if (!_on) return;
    _tone(660,  'sine', 0.22, 0.35, 0.25);
    setTimeout(() => _tone(880, 'sine', 0.18, 0.45, 0.35), 120);
  }

  /* Reagent/choice selection — soft click */
  function pick() {
    if (!_on) return;
    _tone(420, 'triangle', 0.08, 0.07, 0.05);
  }

  /* Error / bad choice — low dull buzz */
  function error() {
    if (!_on) return;
    _tone(160, 'square', 0.06, 0.22, 0.18);
    setTimeout(() => _tone(120, 'square', 0.04, 0.18, 0.14), 80);
  }

  /* Workflow complete — triumphant 3-note chord */
  function complete() {
    if (!_on) return;
    _tone(523, 'sine', 0.2, 0.7, 0.55);   /* C5 */
    setTimeout(() => _tone(659, 'sine', 0.16, 0.65, 0.5), 80);   /* E5 */
    setTimeout(() => _tone(784, 'sine', 0.14, 0.9, 0.75), 160);  /* G5 */
  }

  /* ── Toggle (called by UI button) ───────────────────────────── */
  function toggle() {
    _on = !_on;
    localStorage.setItem(PREF_KEY, _on ? '1' : '0');
    _updateBtn();
    /* Play a sample sound to confirm it's on */
    if (_on) setTimeout(pick, 10);
    return _on;
  }

  function isOn() { return _on; }

  /* ── Sync the topbar toggle button state ─────────────────────── */
  function _updateBtn() {
    const btn = document.getElementById('sound-toggle-btn');
    if (!btn) return;
    btn.setAttribute('aria-pressed', String(_on));
    btn.title = _on ? 'Sound on — click to mute' : 'Sound off — click to enable';
    btn.classList.toggle('sound-on', _on);
    /* Update the icon inside */
    const icon = btn.querySelector('.sound-icon');
    if (icon) icon.innerHTML = _on ? _iconOn() : _iconOff();
  }

  function _iconOn() {
    return `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
    </svg>`;
  }
  function _iconOff() {
    return `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
      <line x1="23" y1="9" x2="17" y2="15"/>
      <line x1="17" y1="9" x2="23" y2="15"/>
    </svg>`;
  }

  /* ── Init: set initial button state after DOM loads ─────────── */
  function init() {
    _updateBtn();
  }

  return { step, pick, error, complete, toggle, isOn, init };

})();
