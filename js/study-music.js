/* ═══════════════════════════════════════════════════════════════
   OmicsLab — Study Music Player
   Offline ambient sound generator using Web Audio API only.
   No external files — all sounds synthesized in-browser.
   Modes: Pink Noise · Brown Noise · Rain · Ocean · Binaural Focus
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.StudyMusic = (function () {

  const PREF_MODE   = 'omicslab_music_mode';
  const PREF_VOL    = 'omicslab_music_vol';
  const PREF_ACTIVE = 'omicslab_music_active';

  const MODES = [
    { id: 'pink',     label: 'Pink Noise',      icon: '〰', desc: 'Balanced focus noise' },
    { id: 'brown',    label: 'Brown Noise',      icon: '🌊', desc: 'Deep rumble for flow' },
    { id: 'rain',     label: 'Rain',             icon: '🌧', desc: 'Gentle steady rain' },
    { id: 'ocean',    label: 'Ocean Waves',      icon: '🌊', desc: 'Rhythmic wave crests' },
    { id: 'binaural', label: 'Binaural Focus',   icon: '🧠', desc: '40 Hz gamma for concentration' },
  ];

  let _ctx     = null;
  let _master  = null;   /* master GainNode */
  let _nodes   = [];     /* active source / effect nodes for teardown */
  let _playing = false;
  let _mode    = localStorage.getItem(PREF_MODE)   || 'pink';
  let _vol     = parseFloat(localStorage.getItem(PREF_VOL) || '0.35');
  let _widget  = null;

  /* ── AudioContext (lazy, resumed on first user gesture) ── */
  function _ctx_() {
    if (!_ctx) {
      try {
        _ctx = new (window.AudioContext || window.webkitAudioContext)();
      } catch {
        return null;
      }
    }
    if (_ctx.state === 'suspended') _ctx.resume();
    return _ctx;
  }

  /* ── Tear down all running nodes ── */
  function _stop() {
    _nodes.forEach(n => {
      try { n.stop?.(); } catch {}
      try { n.disconnect(); } catch {}
    });
    _nodes = [];
    _playing = false;
  }

  /* ─────────────────────────────────────────────────────────────
     NOISE GENERATORS
  ───────────────────────────────────────────────────────────── */

  /* White noise buffer (2 seconds, looping) */
  function _whiteNoiseBuffer(ctx, duration = 2) {
    const len = Math.floor(ctx.sampleRate * duration);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d   = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    return buf;
  }

  /* Pink noise via Paul Kellett's method (filtered white) */
  function _pinkNoiseBuffer(ctx, duration = 2) {
    const len = Math.floor(ctx.sampleRate * duration);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d   = buf.getChannelData(0);
    let b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0;
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1;
      b0 = 0.99886*b0 + w*0.0555179;
      b1 = 0.99332*b1 + w*0.0750759;
      b2 = 0.96900*b2 + w*0.1538520;
      b3 = 0.86650*b3 + w*0.3104856;
      b4 = 0.55000*b4 + w*0.5329522;
      b5 = -0.7616*b5 - w*0.0168980;
      d[i] = (b0+b1+b2+b3+b4+b5+b6 + w*0.5362) / 6;
      b6 = w * 0.115926;
    }
    return buf;
  }

  /* Brown noise (integrated white noise) */
  function _brownNoiseBuffer(ctx, duration = 2) {
    const len = Math.floor(ctx.sampleRate * duration);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d   = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1;
      last = (last + 0.02 * w) / 1.02;
      d[i] = last * 3.5;
    }
    return buf;
  }

  /* ─────────────────────────────────────────────────────────────
     MODE IMPLEMENTATIONS
  ───────────────────────────────────────────────────────────── */

  function _playPink() {
    const ctx = _ctx_();
    if (!ctx) return;
    const src  = ctx.createBufferSource();
    src.buffer = _pinkNoiseBuffer(ctx);
    src.loop   = true;
    /* gentle high-shelf cut to soften harshness */
    const eq = ctx.createBiquadFilter();
    eq.type      = 'highshelf';
    eq.frequency.value = 6000;
    eq.gain.value      = -6;
    src.connect(eq);
    eq.connect(_master);
    src.start();
    _nodes = [src, eq];
  }

  function _playBrown() {
    const ctx = _ctx_();
    if (!ctx) return;
    const src  = ctx.createBufferSource();
    src.buffer = _brownNoiseBuffer(ctx);
    src.loop   = true;
    /* boost low-mids for warmth */
    const eq = ctx.createBiquadFilter();
    eq.type            = 'lowpass';
    eq.frequency.value = 900;
    eq.Q.value         = 0.5;
    src.connect(eq);
    eq.connect(_master);
    src.start();
    _nodes = [src, eq];
  }

  function _playRain() {
    const ctx = _ctx_();
    if (!ctx) return;

    /* Base layer: filtered white noise for rain texture */
    const base = ctx.createBufferSource();
    base.buffer = _whiteNoiseBuffer(ctx, 3);
    base.loop   = true;
    const lp = ctx.createBiquadFilter();
    lp.type            = 'lowpass';
    lp.frequency.value = 3500;
    lp.Q.value         = 1;
    const hp = ctx.createBiquadFilter();
    hp.type            = 'highpass';
    hp.frequency.value = 300;
    base.connect(lp);
    lp.connect(hp);
    hp.connect(_master);
    base.start();

    /* Drip layer: periodic pitch-modulated short bursts */
    let _dripTimeout = null;
    function _drip() {
      if (!_playing) return;
      const osc   = ctx.createOscillator();
      const gn    = ctx.createGain();
      const freq  = 800 + Math.random() * 1200;
      osc.type              = 'sine';
      osc.frequency.value   = freq;
      gn.gain.setValueAtTime(0.025 * Math.random(), ctx.currentTime);
      gn.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.08);
      osc.connect(gn);
      gn.connect(_master);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
      _dripTimeout = setTimeout(_drip, 50 + Math.random() * 200);
    }
    _drip();

    _nodes = [base, lp, hp];
    /* Store timeout stopper */
    _nodes._dripStop = () => clearTimeout(_dripTimeout);
  }

  function _playOcean() {
    const ctx = _ctx_();
    if (!ctx) return;

    /* Filtered noise for surf texture */
    const surf = ctx.createBufferSource();
    surf.buffer = _whiteNoiseBuffer(ctx, 4);
    surf.loop   = true;
    const lp = ctx.createBiquadFilter();
    lp.type            = 'lowpass';
    lp.frequency.value = 1800;
    surf.connect(lp);
    lp.connect(_master);
    surf.start();

    /* LFO-modulated wave swell (~6 second period) */
    const lfo = ctx.createOscillator();
    lfo.type             = 'sine';
    lfo.frequency.value  = 1 / 6;  /* one wave per 6 seconds */
    const lfoGain = ctx.createGain();
    lfoGain.gain.value   = 0.25;
    lfo.connect(lfoGain);
    lfoGain.connect(_master.gain);
    lfo.start();

    _nodes = [surf, lp, lfo, lfoGain];
  }

  function _playBinaural() {
    const ctx = _ctx_();
    if (!ctx) return;

    /*
      Binaural beat: 40 Hz gamma band (linked to focused cognition).
      Left ear: 200 Hz carrier
      Right ear: 240 Hz carrier
      Brain perceives: 40 Hz beat
    */
    const merger = ctx.createChannelMerger(2);
    merger.connect(_master);

    function _tone(freq, channelIndex) {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      const pan  = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
      osc.type            = 'sine';
      osc.frequency.value = freq;
      gain.gain.value     = 0.12;
      osc.connect(gain);
      if (pan) {
        pan.pan.value = channelIndex === 0 ? -1 : 1;
        gain.connect(pan);
        pan.connect(_master);
      } else {
        gain.connect(_master);
      }
      osc.start();
      _nodes.push(osc, gain);
      if (pan) _nodes.push(pan);
    }

    _tone(200, 0);   /* left  */
    _tone(240, 1);   /* right */

    /* Soft pink noise bed at very low volume for context */
    const bed = ctx.createBufferSource();
    bed.buffer = _pinkNoiseBuffer(ctx);
    bed.loop   = true;
    const bedGain = ctx.createGain();
    bedGain.gain.value = 0.04;
    bed.connect(bedGain);
    bedGain.connect(_master);
    bed.start();
    _nodes.push(bed, bedGain);
  }

  /* ─────────────────────────────────────────────────────────────
     PUBLIC PLAY / STOP / TOGGLE
  ───────────────────────────────────────────────────────────── */

  function play(mode) {
    const ctx = _ctx_();
    if (!ctx) return;

    _stop();

    /* (Re)create master gain */
    _master = ctx.createGain();
    _master.gain.value = _vol;
    _master.connect(ctx.destination);

    _mode    = mode || _mode;
    _playing = true;
    localStorage.setItem(PREF_MODE,   _mode);
    localStorage.setItem(PREF_ACTIVE, '1');

    switch (_mode) {
      case 'pink':     _playPink();     break;
      case 'brown':    _playBrown();    break;
      case 'rain':     _playRain();     break;
      case 'ocean':    _playOcean();    break;
      case 'binaural': _playBinaural(); break;
      default:         _playPink();
    }

    _updateWidget();
  }

  function stop() {
    if (_nodes._dripStop) _nodes._dripStop();
    _stop();
    localStorage.setItem(PREF_ACTIVE, '0');
    _updateWidget();
  }

  function toggle() {
    if (_playing) stop(); else play();
  }

  function setVolume(v) {
    _vol = Math.max(0, Math.min(1, v));
    if (_master) _master.gain.setTargetAtTime(_vol, _ctx.currentTime, 0.05);
    localStorage.setItem(PREF_VOL, String(_vol));
    _updateWidget();
  }

  function setMode(m) {
    _mode = m;
    if (_playing) play(_mode);
    else { _updateWidget(); localStorage.setItem(PREF_MODE, m); }
  }

  function isPlaying() { return _playing; }

  /* ─────────────────────────────────────────────────────────────
     WIDGET UI
  ───────────────────────────────────────────────────────────── */

  function _injectStyles() {
    if (document.getElementById('sm-styles')) return;
    const s = document.createElement('style');
    s.id = 'sm-styles';
    s.textContent = `
      /* ── Topbar trigger button ── */
      #sm-btn {
        display: inline-flex; align-items: center; gap: .3rem;
        background: none; border: 1px solid transparent;
        border-radius: 8px; padding: .28rem .55rem;
        font-size: .72rem; font-weight: 600; color: #8b949e;
        cursor: pointer; transition: color .12s, border-color .12s, background .12s;
        white-space: nowrap;
      }
      #sm-btn:hover { color: #e6edf3; border-color: #30363d; background: #21262d; }
      #sm-btn.sm-playing {
        color: #3fb950; border-color: rgba(63,185,80,.35); background: rgba(63,185,80,.08);
      }
      #sm-btn .sm-icon { display: flex; align-items: center; }
      #sm-btn .sm-label { font-size: .68rem; }

      /* ── Floating panel ── */
      #sm-panel {
        position: fixed; bottom: 72px; right: 16px; z-index: 4900;
        width: 280px;
        background: #161b22; border: 1px solid #21262d; border-radius: 14px;
        box-shadow: 0 8px 32px rgba(0,0,0,.5);
        padding: 1rem 1rem .85rem;
        animation: sm-pop .18s cubic-bezier(.16,1,.3,1) both;
        display: none;
      }
      #sm-panel.sm-open { display: block; }
      @keyframes sm-pop { from { opacity:0; transform:translateY(8px) scale(.96); } to { opacity:1; transform:none; } }

      .sm-panel-header {
        display: flex; align-items: center; justify-content: space-between;
        margin-bottom: .75rem;
      }
      .sm-panel-title {
        font-size: .82rem; font-weight: 700; color: #e6edf3;
        display: flex; align-items: center; gap: .4rem;
      }
      .sm-close-btn {
        background: none; border: none; cursor: pointer; color: #484f58; padding: .15rem;
        border-radius: 4px; line-height: 1;
      }
      .sm-close-btn:hover { color: #8b949e; }

      /* Mode chips */
      .sm-modes {
        display: grid; grid-template-columns: 1fr 1fr; gap: .35rem; margin-bottom: .85rem;
      }
      .sm-mode-btn {
        background: #0d1117; border: 1px solid #21262d; border-radius: 8px;
        padding: .45rem .5rem; text-align: left; cursor: pointer;
        transition: border-color .1s, background .1s;
      }
      .sm-mode-btn:hover { background: #21262d; border-color: #30363d; }
      .sm-mode-btn.sm-mode-active {
        border-color: rgba(63,185,80,.5); background: rgba(63,185,80,.07);
      }
      .sm-mode-name { font-size: .73rem; font-weight: 700; color: #e6edf3; display: block; }
      .sm-mode-desc { font-size: .62rem; color: #8b949e; display: block; margin-top: .1rem; }
      .sm-mode-btn.sm-mode-active .sm-mode-name { color: #3fb950; }

      /* Volume */
      .sm-vol-row {
        display: flex; align-items: center; gap: .55rem; margin-bottom: .75rem;
      }
      .sm-vol-icon { color: #8b949e; flex-shrink: 0; }
      .sm-vol-slider {
        flex: 1; -webkit-appearance: none; appearance: none;
        height: 4px; border-radius: 2px;
        background: linear-gradient(to right, #3fb950 var(--pct,35%), #30363d var(--pct,35%));
        cursor: pointer; outline: none;
      }
      .sm-vol-slider::-webkit-slider-thumb {
        -webkit-appearance: none; width: 14px; height: 14px;
        border-radius: 50%; background: #3fb950; cursor: pointer;
        border: 2px solid #161b22;
      }
      .sm-vol-slider::-moz-range-thumb {
        width: 14px; height: 14px; border-radius: 50%; background: #3fb950;
        cursor: pointer; border: 2px solid #161b22;
      }
      .sm-vol-val { font-size: .68rem; color: #8b949e; min-width: 28px; text-align: right; }

      /* Play/stop */
      .sm-play-btn {
        width: 100%; padding: .42rem; border-radius: 8px;
        background: #21262d; border: 1px solid #30363d;
        color: #e6edf3; font-size: .78rem; font-weight: 700;
        cursor: pointer; display: flex; align-items: center; justify-content: center; gap: .4rem;
        transition: background .12s, border-color .12s;
      }
      .sm-play-btn:hover { background: #2d333b; }
      .sm-play-btn.sm-btn-playing {
        background: rgba(63,185,80,.12); border-color: rgba(63,185,80,.4); color: #3fb950;
      }

      .sm-note {
        margin-top: .6rem; font-size: .62rem; color: #484f58; text-align: center; line-height: 1.4;
      }
    `;
    document.head.appendChild(s);
  }

  function _buildWidget() {
    if (_widget) return;
    _injectStyles();

    /* Button is static in index.html (#sm-btn) — just wire it up */
    const btn = document.getElementById('sm-btn');
    if (!btn) return;
    btn.addEventListener('click', (e) => { e.stopPropagation(); _togglePanel(); });

    /* ── Floating panel ── */
    const panel = document.createElement('div');
    panel.id = 'sm-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Study Music Player');
    panel.innerHTML = `
      <div class="sm-panel-header">
        <div class="sm-panel-title">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3fb950" stroke-width="2" stroke-linecap="round" aria-hidden="true">
            <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
          </svg>
          Study &amp; Focus Music
        </div>
        <button class="sm-close-btn" onclick="OmicsLab.StudyMusic._closePanel()" aria-label="Close music player">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>

      <div class="sm-modes" id="sm-mode-grid"></div>

      <div class="sm-vol-row">
        <span class="sm-vol-icon">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
          </svg>
        </span>
        <input type="range" class="sm-vol-slider" id="sm-vol-slider"
          min="0" max="100" value="${Math.round(_vol*100)}"
          style="--pct:${Math.round(_vol*100)}%"
          aria-label="Volume">
        <span class="sm-vol-val" id="sm-vol-val">${Math.round(_vol*100)}%</span>
      </div>

      <button class="sm-play-btn" id="sm-play-btn" onclick="OmicsLab.StudyMusic.toggle()">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" id="sm-play-icon" aria-hidden="true"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        <span id="sm-play-label">Play</span>
      </button>

      <div class="sm-note">🎧 Use headphones for binaural beats</div>`;
    document.body.appendChild(panel);

    /* Build mode buttons */
    const grid = panel.querySelector('#sm-mode-grid');
    MODES.forEach(m => {
      const b = document.createElement('button');
      b.className = 'sm-mode-btn' + (m.id === _mode ? ' sm-mode-active' : '');
      b.dataset.mode = m.id;
      b.innerHTML = `<span class="sm-mode-name">${m.icon} ${m.label}</span><span class="sm-mode-desc">${m.desc}</span>`;
      b.addEventListener('click', () => { OmicsLab.StudyMusic.setMode(m.id); });
      grid.appendChild(b);
    });

    /* Volume slider */
    const slider = panel.querySelector('#sm-vol-slider');
    slider.addEventListener('input', () => {
      const v = parseInt(slider.value) / 100;
      slider.style.setProperty('--pct', slider.value + '%');
      panel.querySelector('#sm-vol-val').textContent = slider.value + '%';
      OmicsLab.StudyMusic.setVolume(v);
    });

    /* Close on outside click */
    document.addEventListener('click', (e) => {
      if (_widget && _widget.panel.classList.contains('sm-open') &&
          !_widget.panel.contains(e.target) && e.target !== _widget.btn) {
        _closePanel();
      }
    });

    _widget = { btn, panel };
    _updateWidget();
  }

  function _togglePanel() {
    if (!_widget) return;
    const isOpen = _widget.panel.classList.contains('sm-open');
    if (isOpen) _closePanel();
    else _openPanel();
  }

  function _openPanel() {
    if (!_widget) return;
    _widget.panel.classList.add('sm-open');
  }

  function _closePanel() {
    if (!_widget) return;
    _widget.panel.classList.remove('sm-open');
  }

  function _updateWidget() {
    if (!_widget) return;

    /* Topbar button state */
    _widget.btn.classList.toggle('sm-playing', _playing);
    _widget.btn.querySelector('.sm-label').textContent = _playing
      ? (MODES.find(m => m.id === _mode)?.label || 'Playing')
      : 'Focus';

    /* Play button */
    const playBtn   = _widget.panel.querySelector('#sm-play-btn');
    const playIcon  = _widget.panel.querySelector('#sm-play-icon');
    const playLabel = _widget.panel.querySelector('#sm-play-label');
    if (playBtn) playBtn.classList.toggle('sm-btn-playing', _playing);
    if (playLabel) playLabel.textContent = _playing ? 'Stop' : 'Play';
    if (playIcon) {
      playIcon.innerHTML = _playing
        ? '<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>'
        : '<polygon points="5 3 19 12 5 21 5 3"/>';
    }

    /* Mode active state */
    _widget.panel.querySelectorAll('.sm-mode-btn').forEach(b => {
      b.classList.toggle('sm-mode-active', b.dataset.mode === _mode);
    });

    /* Volume */
    const slider = _widget.panel.querySelector('#sm-vol-slider');
    if (slider) {
      slider.value = Math.round(_vol * 100);
      slider.style.setProperty('--pct', Math.round(_vol * 100) + '%');
      const volVal = _widget.panel.querySelector('#sm-vol-val');
      if (volVal) volVal.textContent = Math.round(_vol * 100) + '%';
    }
  }

  /* ─────────────────────────────────────────────────────────────
     INIT
  ───────────────────────────────────────────────────────────── */

  function init() {
    _buildWidget();
    /* Resume previously active session */
    if (localStorage.getItem(PREF_ACTIVE) === '1') {
      /* Autoplay requires user gesture — just restore the mode/vol state visually */
      _updateWidget();
    }
  }

  return { init, play, stop, toggle, setMode, setVolume, isPlaying, _closePanel, _togglePanel };

})();
