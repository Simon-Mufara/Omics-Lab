/* ═══════════════════════════════════════════════════════════════
   OmicsLab — Live Collaboration  (redesigned)
   Mode A: BroadcastChannel  — same browser, multiple tabs (instant)
   Mode B: Video Session     — Jitsi Meet room (cross-device video)
   Mode C: Peer Link         — WebRTC DataChannel (cross-device data)
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.Collab = (function () {

  const ICE = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun.cloudflare.com:3478' },
  ];

  /* ─── State ─── */
  let _bc    = null;   // BroadcastChannel
  let _pc    = null;   // RTCPeerConnection
  let _dc    = null;   // RTCDataChannel
  let _bcId  = null;
  let _myName = '';
  let _peers = [];
  let _iceDone = false;

  /* ─── IDs ─── */
  function _genCode() {
    return Math.random().toString(36).slice(2, 8).toUpperCase();
  }

  /* ─── Messaging ─── */
  function _broadcastState(type, data) {
    const msg = JSON.stringify({ type, data, from: _myName, ts: Date.now() });
    if (_dc && _dc.readyState === 'open') _dc.send(msg);
    if (_bc) _bc.postMessage({ type, data, from: _myName });
  }

  function _handleMsg(raw) {
    let msg;
    try { msg = typeof raw === 'string' ? JSON.parse(raw) : raw; } catch { return; }
    if (msg.type === 'chat')       _appendChat(msg.from, msg.data.text, false);
    if (msg.type === 'join')       _onPeerJoin(msg.from);
    if (msg.type === 'leave')      _onPeerLeave(msg.from);
    if (msg.type === 'ping')       _broadcastState('pong', {});
    if (msg.type === 'lab_step')   _appendSystemMsg(`${msg.from} started: ${msg.data.step}`);
    if (msg.type === 'nav')        { if (OmicsLab.Router) OmicsLab.Router.navigate(msg.data.page); _appendSystemMsg(`${msg.from} navigated to ${msg.data.page}`); }
    _renderActivity(msg);
  }

  function _onPeerJoin(name) {
    if (!_peers.includes(name)) _peers.push(name);
    _updateMemberList();
    _appendSystemMsg(`${name} joined the session`);
  }

  function _onPeerLeave(name) {
    _peers = _peers.filter(p => p !== name);
    _updateMemberList();
    _appendSystemMsg(`${name} left the session`);
  }

  /* ─── Mode A: BroadcastChannel ─── */
  function _joinBC(id) {
    if (_bc) { _bc.close(); _bc = null; }
    _bcId = id;
    _bc = new BroadcastChannel('omicslab_' + id);
    _bc.onmessage = e => _handleMsg(e.data);
    _broadcastState('join', { name: _myName });
    _setConnected(true, 'bc');
    _updateMemberList();
    _appendSystemMsg(`Connected to session ${id} (same-device sync active)`);
    document.getElementById('collab-live-panel').style.display = '';
  }

  /* ─── Mode B: Video Session (Jitsi Meet embedded) ─── */
  function _openVideo(code) {
    const room = 'OmicsLab-' + code;
    const userName = _myName || 'OmicsLab User';
    const jitsiUrl = 'https://meet.jit.si/' + room
      + '#userInfo.displayName=' + encodeURIComponent(userName)
      + '&config.prejoinPageEnabled=false';

    /* Update share link row */
    const linkEl = document.getElementById('collab-video-link');
    const rowEl  = document.getElementById('collab-video-row');
    if (linkEl) linkEl.textContent = 'meet.jit.si/' + room;
    if (rowEl)  rowEl.style.display = '';

    /* Embed iframe inside the Mode B card */
    let embedEl = document.getElementById('collab-jitsi-embed');
    if (!embedEl) {
      embedEl = document.createElement('div');
      embedEl.id = 'collab-jitsi-embed';
      const modeB = document.querySelector('.collab-mode-b');
      if (modeB) modeB.appendChild(embedEl);
    }
    embedEl.style.marginTop = '1rem';
    embedEl.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:.6rem;flex-wrap:wrap;gap:.35rem">
        <span style="font-size:.78rem;color:#8b949e">
          Session active — share code
          <strong style="color:#c9d1d9;font-family:monospace">${code}</strong>
          with collaborators on any device
        </span>
        <div style="display:flex;gap:.4rem">
          <button class="collab-copy-tiny" onclick="navigator.clipboard.writeText('${code}').then(()=>{this.textContent='Copied!';setTimeout(()=>this.textContent='Copy code',1500)})">Copy code</button>
          <button class="collab-copy-tiny" onclick="const e=document.getElementById('collab-jitsi-embed');e.innerHTML='';e.style.display='none'">Close</button>
        </div>
      </div>
      <iframe
        src="${jitsiUrl}"
        allow="camera *; microphone *; fullscreen *; display-capture *; autoplay *"
        allowfullscreen
        style="width:100%;height:500px;border:none;border-radius:12px;background:#0d1117"
        title="OmicsLab Video Session">
      </iframe>`;
    embedEl.style.display = '';

    _appendSystemMsg('Video session started — code "' + code + '" — anyone entering this code joins the same call');
    _setConnected(true, 'jitsi');
    document.getElementById('collab-live-panel').style.display = '';
  }

  /* ─── Mode C: WebRTC ─── */
  async function _rtcHost() {
    _pc = new RTCPeerConnection({ iceServers: ICE });
    _dc = _pc.createDataChannel('omicslab');
    _setupDC(_dc);

    let candidates = [];
    _iceDone = false;

    _pc.onicecandidate = e => {
      if (e.candidate) { candidates.push(e.candidate); return; }
      /* Gathering complete */
      _iceDone = true;
      const sdp = JSON.stringify(_pc.localDescription);
      document.getElementById('collab-offer-out').value = sdp;
      _showStep('collab-rtc-step2');
      _setProgress('offer-ready');
    };

    _pc.onicegatheringstatechange = () => {
      if (_pc.iceGatheringState === 'complete' && !_iceDone) {
        _iceDone = true;
        document.getElementById('collab-offer-out').value = JSON.stringify(_pc.localDescription);
        _showStep('collab-rtc-step2');
        _setProgress('offer-ready');
      }
    };

    /* Timeout fallback at 8s */
    setTimeout(() => {
      if (!_iceDone && _pc.localDescription) {
        _iceDone = true;
        document.getElementById('collab-offer-out').value = JSON.stringify(_pc.localDescription);
        _showStep('collab-rtc-step2');
        _setProgress('offer-ready');
      }
    }, 8000);

    const offer = await _pc.createOffer();
    await _pc.setLocalDescription(offer);
    _setProgress('gathering');
  }

  async function _rtcAnswer(offerJson) {
    const offer = JSON.parse(offerJson);
    _pc = new RTCPeerConnection({ iceServers: ICE });
    _pc.ondatachannel = e => { _dc = e.channel; _setupDC(_dc); };

    _iceDone = false;
    _pc.onicecandidate = e => {
      if (e.candidate) return;
      _iceDone = true;
      document.getElementById('collab-answer-out').value = JSON.stringify(_pc.localDescription);
      _showStep('collab-rtc-step3-guest');
      _setProgress('answer-ready');
    };

    setTimeout(() => {
      if (!_iceDone && _pc.localDescription) {
        _iceDone = true;
        document.getElementById('collab-answer-out').value = JSON.stringify(_pc.localDescription);
        _showStep('collab-rtc-step3-guest');
        _setProgress('answer-ready');
      }
    }, 8000);

    await _pc.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await _pc.createAnswer();
    await _pc.setLocalDescription(answer);
    _setProgress('gathering');
  }

  async function _rtcAcceptAnswer(answerJson) {
    const answer = JSON.parse(answerJson);
    await _pc.setRemoteDescription(new RTCSessionDescription(answer));
    _setProgress('connecting');
  }

  function _setupDC(dc) {
    dc.onopen = () => {
      _appendSystemMsg('Peer-to-peer connection established');
      _setConnected(true, 'rtc');
      _broadcastState('join', { name: _myName });
      _setProgress('connected');
      document.getElementById('collab-live-panel').style.display = '';
    };
    dc.onclose  = () => { _setConnected(false, 'rtc'); _appendSystemMsg('Peer disconnected'); };
    dc.onmessage = e => _handleMsg(e.data);
    dc.onerror  = () => _appendSystemMsg('Connection error — check network and try again');
  }

  /* ─── Chat ─── */
  function sendChat(text) {
    text = (text || '').trim();
    if (!text) return;
    _appendChat(_myName, text, true);
    _broadcastState('chat', { text });
    const inp = document.getElementById('collab-chat-input');
    if (inp) inp.value = '';
  }

  function _appendChat(from, text, mine) {
    const feed = document.getElementById('collab-chat-feed');
    if (!feed) return;
    const d = document.createElement('div');
    d.className = 'collab-chat-msg' + (mine ? ' mine' : '');
    d.innerHTML = `<span class="collab-chat-name">${_esc(from)}</span><span class="collab-chat-text">${_esc(text)}</span>`;
    feed.appendChild(d);
    feed.scrollTop = feed.scrollHeight;
  }

  function _appendSystemMsg(msg) {
    const feed = document.getElementById('collab-chat-feed');
    if (!feed) return;
    const d = document.createElement('div');
    d.className = 'collab-sys-msg';
    d.textContent = msg;
    feed.appendChild(d);
    feed.scrollTop = feed.scrollHeight;
  }

  function _renderActivity(msg) {
    const feed = document.getElementById('collab-activity');
    if (!feed) return;
    const d = document.createElement('div');
    d.className = 'collab-act-item';
    d.innerHTML = `<span class="collab-act-time">${new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</span>
      <span class="collab-act-who">${_esc(msg.from)}</span>
      <span class="collab-act-what">${msg.type.replace(/_/g,' ')}</span>`;
    feed.insertBefore(d, feed.firstChild);
    while (feed.children.length > 25) feed.removeChild(feed.lastChild);
  }

  /* ─── UI helpers ─── */
  function _setConnected(yes, mode) {
    const dot   = document.getElementById('collab-status-dot');
    const label = document.getElementById('collab-status-label');
    const badge = document.getElementById('collab-mode-badge');
    if (dot)   { dot.className = 'collab-status-dot' + (yes ? ' connected' : ''); }
    if (label) { label.textContent = yes ? 'Connected' : 'Disconnected'; }
    if (badge && yes) {
      const LABELS = { bc: 'SAME-DEVICE SYNC', rtc: 'PEER-TO-PEER LINK', jitsi: 'VIDEO SESSION ACTIVE' };
      badge.textContent = LABELS[mode] || 'CONNECTED';
      badge.style.display = '';
    }
  }

  function _updateMemberList() {
    const el = document.getElementById('collab-members');
    if (!el) return;
    const all = [{ name: _myName, me: true }, ..._peers.map(n => ({ name: n, me: false }))];
    el.innerHTML = all.map(p => `
      <div class="collab-member">
        <div class="collab-member-av">${p.name.charAt(0).toUpperCase()}</div>
        <div class="collab-member-name">${_esc(p.name)}${p.me ? '<span class="collab-me-tag">you</span>' : ''}</div>
      </div>`).join('');
  }

  function _showStep(id) {
    ['collab-rtc-step2','collab-rtc-step3','collab-rtc-step3-guest'].forEach(s => {
      const el = document.getElementById(s);
      if (el) el.style.display = s === id ? '' : 'none';
    });
  }

  function _setProgress(state) {
    const bar  = document.getElementById('collab-rtc-progress');
    const label = document.getElementById('collab-rtc-progress-label');
    if (!bar) return;
    const MAP = {
      gathering:    { w:'40%',  text:'Gathering connection info…', color:'#e3b341' },
      'offer-ready':{ w:'65%',  text:'Offer ready — share it with your partner', color:'#58a6ff' },
      'answer-ready':{ w:'65%', text:'Answer ready — send it back to the host', color:'#58a6ff' },
      connecting:   { w:'85%',  text:'Connecting to peer…', color:'#f97316' },
      connected:    { w:'100%', text:'Connected!', color:'#3fb950' },
    };
    const s = MAP[state] || {};
    bar.style.width = s.w || '0%';
    bar.style.background = s.color || '#58a6ff';
    if (label) label.textContent = s.text || '';
  }

  function _copyField(id, btn) {
    const el = document.getElementById(id);
    if (!el || !el.value) return;
    navigator.clipboard.writeText(el.value).then(() => {
      const orig = btn.innerHTML;
      btn.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> Copied!`;
      btn.style.color = '#3fb950';
      setTimeout(() => { btn.innerHTML = orig; btn.style.color = ''; }, 2000);
    });
  }

  function _esc(s) { return (s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  /* ─── Broadcast nav event ─── */
  function shareNav(page) {
    _broadcastState('nav', { page });
    _appendSystemMsg(`Shared navigation to ${page}`);
  }

  /* ─── Init ─── */
  function init() {
    const section = document.getElementById('collab-section');
    if (!section || section.dataset.collabReady) return;
    section.dataset.collabReady = '1';
    _render(section);
  }

  /* ─── Main render ─── */
  function _render(section) {
    section.innerHTML = `
    <div class="collab-wrap">

      <!-- Header -->
      <div class="collab-header">
        <div>
          <div class="collab-badge-label">LIVE COLLABORATION</div>
          <h2 class="collab-title">Real-Time Lab Sessions</h2>
          <p class="collab-subtitle">Work together on protocols and analysis — chat, sync lab steps, share navigation. Choose the connection mode that fits your setup.</p>
        </div>
        <div class="collab-conn-status">
          <span class="collab-status-dot" id="collab-status-dot"></span>
          <span id="collab-status-label">Not connected</span>
          <span class="collab-mode-badge" id="collab-mode-badge" style="display:none"></span>
        </div>
      </div>

      <!-- Name entry -->
      <div class="collab-name-row" id="collab-name-row">
        <label class="collab-label">Your display name</label>
        <div style="display:flex;gap:.5rem;align-items:center;flex-wrap:wrap">
          <input class="collab-input" id="collab-name" placeholder="e.g. Kwame Asante" maxlength="30" style="max-width:220px"/>
          <button class="collab-btn-go" id="collab-name-confirm" onclick="OmicsLab.Collab._confirmName()">Set name →</button>
        </div>
      </div>

      <!-- MODE PANELS (hidden until name set) -->
      <div id="collab-modes-wrap" style="display:none">

        <!-- ══ MODE A: Same-Device BroadcastChannel ══ -->
        <div class="collab-mode-card collab-mode-a">
          <div class="collab-mode-head">
            <div class="collab-mode-icon-wrap" style="background:rgba(63,185,80,.12);color:#3fb950">${OmicsLab.Icons?.svg('zap', 20) || ''}</div>
            <div>
              <div class="collab-mode-name">Quick Sync <span class="collab-mode-tag collab-tag-green">SAME DEVICE</span></div>
              <div class="collab-mode-desc">All browser tabs on this device share a session code — instant sync, no copy-paste required. Perfect for instructor + student setups on one computer.</div>
            </div>
          </div>
          <div class="collab-bc-grid">
            <div class="collab-bc-col">
              <div class="collab-step-head">
                <div class="collab-step-num">A</div>
                <div><strong>Create session</strong></div>
              </div>
              <button class="collab-btn-primary" onclick="OmicsLab.Collab._bcCreate()">Create Quick Session</button>
              <div id="collab-bc-code-row" style="display:none">
                <div class="collab-code-display" id="collab-bc-code-display">——</div>
                <div style="font-size:.75rem;color:#8b949e;margin-top:.35rem">Share this code with collaborators on this device</div>
              </div>
            </div>
            <div class="collab-bc-col">
              <div class="collab-step-head">
                <div class="collab-step-num">B</div>
                <div><strong>Join session</strong></div>
              </div>
              <div style="display:flex;gap:.35rem">
                <input class="collab-input" id="collab-bc-join-code" placeholder="Session code" maxlength="6" style="text-transform:uppercase;max-width:130px"/>
                <button class="collab-btn-primary" onclick="OmicsLab.Collab._bcJoin()">Join</button>
              </div>
            </div>
          </div>
        </div>

        <!-- ══ MODE B: Video Session ══ -->
        <div class="collab-mode-card collab-mode-b">
          <div class="collab-mode-head">
            <div class="collab-mode-icon-wrap" style="background:rgba(88,166,255,.12);color:#58a6ff">${OmicsLab.Icons?.svg('link', 20) || ''}</div>
            <div>
              <div class="collab-mode-name">Video Session <span class="collab-mode-tag collab-tag-blue">CROSS-DEVICE</span></div>
              <div class="collab-mode-desc">Embedded video call via Jitsi Meet — anyone on any device who enters the same code joins the same room instantly. No sign-up, no install needed.</div>
            </div>
          </div>
          <div style="display:flex;gap:.5rem;flex-wrap:wrap;align-items:center">
            <input class="collab-input" id="collab-video-code" placeholder="Room code (auto-filled)" maxlength="12" style="max-width:180px"/>
            <button class="collab-btn-primary" style="background:#1a56a0;border-color:#1a56a0" onclick="OmicsLab.Collab._startVideo()">Open Video Room</button>
          </div>
          <div id="collab-video-row" style="display:none;margin-top:.75rem">
            <div class="collab-video-link-row">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#58a6ff" stroke-width="2"><path d="M15 10l4.553-2.069A1 1 0 0 1 21 8.82v6.36a1 1 0 0 1-1.447.89L15 14M3 8a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8z"/></svg>
              Share: <span id="collab-video-link" class="collab-video-link-text"></span>
              <button class="collab-copy-tiny" onclick="navigator.clipboard.writeText('https://'+document.getElementById('collab-video-link').textContent).then(()=>{this.textContent='Copied!';setTimeout(()=>this.textContent='Copy',1500)})">Copy</button>
            </div>
            <div style="font-size:.73rem;color:#8b949e;margin-top:.3rem">Send this link to anyone — no account or install needed</div>
          </div>
        </div>

        <!-- ══ How it works note ══ -->
        <div class="collab-mode-card" style="background:rgba(88,166,255,0.04);border-color:rgba(88,166,255,0.18)">
          <div class="collab-mode-head">
            <div class="collab-mode-icon-wrap" style="background:rgba(88,166,255,.12);color:#58a6ff">${OmicsLab.Icons?.svg('info', 20) || ''}</div>
            <div>
              <div class="collab-mode-name">How cross-device collaboration works</div>
              <div class="collab-mode-desc">
                Use <strong style="color:#c9d1d9">Video Session</strong> above for real-time collaboration across different computers and phones.
                One person generates a room code — everyone who enters the same code joins the same call automatically, with no account or installation needed.
                The same-device Quick Sync is ideal for instructor + student setups on one computer.
              </div>
            </div>
          </div>
          <div style="display:flex;flex-wrap:wrap;gap:.5rem;margin-top:.35rem">
            <div style="display:flex;align-items:center;gap:.4rem;font-size:.76rem;color:#8b949e;padding:.4rem .75rem;background:#0d1117;border-radius:7px">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#3fb950" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              Works on any device, anywhere in the world
            </div>
            <div style="display:flex;align-items:center;gap:.4rem;font-size:.76rem;color:#8b949e;padding:.4rem .75rem;background:#0d1117;border-radius:7px">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#3fb950" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              No sign-up, no installation
            </div>
            <div style="display:flex;align-items:center;gap:.4rem;font-size:.76rem;color:#8b949e;padding:.4rem .75rem;background:#0d1117;border-radius:7px">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#3fb950" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              Video, audio, and screen sharing included
            </div>
          </div>
        </div>

      </div><!-- /modes-wrap -->

      <!-- ══ LIVE PANEL (shown when any connection active) ══ -->
      <div class="collab-live-panel" id="collab-live-panel" style="display:none">
        <div class="collab-live-grid">

          <!-- Members -->
          <div class="collab-panel-box">
            <div class="collab-panel-label">Session Members</div>
            <div id="collab-members" class="collab-members-list"></div>
            <div class="collab-shared-tools">
              <div style="font-size:.72rem;font-weight:600;color:#8b949e;margin-bottom:.4rem;text-transform:uppercase;letter-spacing:.06em">Broadcast lab events</div>
              <div class="collab-tools-row">
                <button class="collab-tool-btn" onclick="OmicsLab.Collab._broadcastState('lab_step',{step:'DNA Extraction',status:'started'})">${OmicsLab.Icons?.svg('flask',12)||''} DNA Extraction</button>
                <button class="collab-tool-btn" onclick="OmicsLab.Collab._broadcastState('lab_step',{step:'Library Prep',status:'started'})">${OmicsLab.Icons?.svg('package',12)||''} Library Prep</button>
                <button class="collab-tool-btn" onclick="OmicsLab.Collab._broadcastState('lab_step',{step:'Sequencing',status:'started'})">${OmicsLab.Icons?.svg('microscope',12)||''} Sequencing</button>
                <button class="collab-tool-btn" onclick="OmicsLab.Collab._broadcastState('lab_step',{step:'QC',status:'started'})">${OmicsLab.Icons?.svg('bar-chart',12)||''} Run QC</button>
              </div>
              <div class="collab-tools-row" style="margin-top:.3rem">
                <button class="collab-tool-btn" onclick="OmicsLab.Collab.shareNav('lab')" style="color:#3fb950">${OmicsLab.Icons?.svg('flask',12)||''} Send to Lab</button>
                <button class="collab-tool-btn" onclick="OmicsLab.Collab.shareNav('africa')" style="color:#f97316">${OmicsLab.Icons?.svg('globe',12)||''} Send to Africa Hub</button>
                <button class="collab-tool-btn" onclick="OmicsLab.Collab.shareNav('analysis')" style="color:#e3b341">${OmicsLab.Icons?.svg('bar-chart',12)||''} Send to Analysis</button>
              </div>
            </div>
          </div>

          <!-- Activity feed -->
          <div class="collab-panel-box">
            <div class="collab-panel-label">Activity</div>
            <div id="collab-activity" class="collab-activity-feed"></div>
          </div>

          <!-- Chat -->
          <div class="collab-panel-box collab-chat-panel">
            <div class="collab-panel-label">Session Chat</div>
            <div id="collab-chat-feed" class="collab-chat-feed"></div>
            <div class="collab-chat-row">
              <input class="collab-input" id="collab-chat-input" placeholder="Message…"
                     onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();OmicsLab.Collab.sendChat(this.value)}"/>
              <button class="collab-send-btn" onclick="OmicsLab.Collab.sendChat(document.getElementById('collab-chat-input').value)">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              </button>
            </div>
          </div>

        </div>
      </div>

    </div>`;

    /* Pre-fill video code input */
    const vc = document.getElementById('collab-video-code');
    if (vc) vc.value = _genCode();
  }

  /* ─── Flow handlers ─── */
  function _confirmName() {
    const name = document.getElementById('collab-name')?.value?.trim();
    if (!name) { OmicsLab.Notify.error('Please enter your display name'); return; }
    _myName = name;
    document.getElementById('collab-name-row').innerHTML = `
      <div style="display:flex;align-items:center;gap:.5rem;font-size:.83rem;color:#8b949e">
        <div class="collab-member-av" style="width:28px;height:28px;font-size:.75rem">${name.charAt(0).toUpperCase()}</div>
        Signed in as <strong style="color:#e6edf3">${_esc(name)}</strong>
        <button class="collab-copy-tiny" onclick="OmicsLab.Collab._resetName()" style="margin-left:.25rem">Change</button>
      </div>`;
    document.getElementById('collab-modes-wrap').style.display = '';
    _updateMemberList();
  }

  function _resetName() {
    _myName = '';
    document.getElementById('collab-modes-wrap').style.display = 'none';
    document.getElementById('collab-name-row').innerHTML = `
      <label class="collab-label">Your display name</label>
      <div style="display:flex;gap:.5rem;align-items:center;flex-wrap:wrap">
        <input class="collab-input" id="collab-name" placeholder="e.g. Kwame Asante" maxlength="30" style="max-width:220px"/>
        <button class="collab-btn-go" onclick="OmicsLab.Collab._confirmName()">Set name →</button>
      </div>`;
  }

  function _bcCreate() {
    const code = _genCode();
    _joinBC(code);
    document.getElementById('collab-bc-code-row').style.display = '';
    document.getElementById('collab-bc-code-display').textContent = code;
    document.getElementById('collab-bc-join-code').value = code;
  }

  function _bcJoin() {
    const code = (document.getElementById('collab-bc-join-code')?.value || '').trim().toUpperCase();
    if (code.length < 4) { OmicsLab.Notify.error('Enter a valid session code'); return; }
    _joinBC(code);
  }

  function _startVideo() {
    const code = (document.getElementById('collab-video-code')?.value || '').trim().toUpperCase() || _genCode();
    _openVideo(code);
  }

  function _rtcStartHost() {
    document.getElementById('collab-rtc-host-flow').style.display = '';
    document.getElementById('collab-rtc-guest-flow').style.display = 'none';
    document.getElementById('collab-rtc-host-btn').classList.add('active');
    document.getElementById('collab-rtc-guest-btn').classList.remove('active');
    document.getElementById('collab-rtc-progress-wrap').style.display = '';
    _rtcHost().catch(e => _appendSystemMsg('WebRTC error: ' + e.message));
  }

  function _rtcStartGuest() {
    document.getElementById('collab-rtc-guest-flow').style.display = '';
    document.getElementById('collab-rtc-host-flow').style.display = 'none';
    document.getElementById('collab-rtc-guest-btn').classList.add('active');
    document.getElementById('collab-rtc-host-btn').classList.remove('active');
    document.getElementById('collab-rtc-progress-wrap').style.display = '';
    _setProgress('gathering');
  }

  function _rtcGuestAnswer() {
    const json = document.getElementById('collab-offer-in')?.value?.trim();
    if (!json) { OmicsLab.Notify.error('Paste the host offer first'); return; }
    try {
      _rtcAnswer(json).catch(e => OmicsLab.Notify.error('Invalid offer: ' + e.message));
    } catch(e) { OmicsLab.Notify.error('Could not parse offer — make sure you pasted the full text'); }
  }

  function _rtcFinish() {
    const json = document.getElementById('collab-answer-in')?.value?.trim();
    if (!json) { OmicsLab.Notify.error('Paste the answer first'); return; }
    document.getElementById('collab-rtc-step3').style.display = '';
    try {
      _rtcAcceptAnswer(json).catch(e => OmicsLab.Notify.error('Could not accept answer: ' + e.message));
    } catch(e) { OmicsLab.Notify.error('Invalid answer — make sure you pasted the full text'); }
  }

  /* Expose _copyField so inline onclick can call it */
  function _copyField(id, btn) {
    const el = document.getElementById(id);
    if (!el || !el.value) return;
    navigator.clipboard.writeText(el.value).then(() => {
      const orig = btn.innerHTML;
      btn.innerHTML = `${OmicsLab.Icons?.svg('check',12)||''} Copied!`;
      btn.style.color = '#3fb950';
      setTimeout(() => { btn.innerHTML = orig; btn.style.color = ''; }, 2000);
    }).catch(() => {
      el.select();
      document.execCommand('copy');
    });
  }

  return {
    init, sendChat, shareNav,
    _confirmName, _resetName,
    _bcCreate, _bcJoin,
    _startVideo,
    _rtcStartHost, _rtcStartGuest, _rtcGuestAnswer, _rtcFinish,
    _broadcastState, _copyField,
  };
})();
