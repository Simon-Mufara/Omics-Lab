/* ═══════════════════════════════════════════════════════════════
   OmicsLab — Live Collaboration (Prompt 7)
   WebRTC peer-to-peer + BroadcastChannel for same-device/tab sync.
   Copy-paste SDP signaling for cross-device (no server needed).
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.Collab = (function () {

  const ICE_SERVERS = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ];

  /* ─── State ─── */
  let _role = null;       /* 'host' | 'guest' */
  let _pc = null;         /* RTCPeerConnection */
  let _dc = null;         /* RTCDataChannel */
  let _bc = null;         /* BroadcastChannel (same-browser sync) */
  let _sessionId = null;
  let _peers = [];        /* connected peer names */
  let _myName = '';
  let _labState = {};     /* shared lab step state */

  /* ─── Unique session ID ─── */
  function _genId() {
    return Math.random().toString(36).slice(2, 8).toUpperCase();
  }

  /* ─── Shared lab state helpers ─── */
  function _broadcastState(type, data) {
    const msg = JSON.stringify({ type, data, from: _myName, ts: Date.now() });
    if (_dc && _dc.readyState === 'open') _dc.send(msg);
    if (_bc) _bc.postMessage({ type, data, from: _myName });
  }

  function _handleMessage(raw) {
    let msg;
    try { msg = typeof raw === 'string' ? JSON.parse(raw) : raw; } catch { return; }
    _renderIncomingMessage(msg);
    if (msg.type === 'lab_step') _applyRemoteStep(msg.data);
    if (msg.type === 'cursor') _renderRemoteCursor(msg);
    if (msg.type === 'chat') _appendChat(msg.from, msg.data.text, false);
    if (msg.type === 'join') _onPeerJoined(msg.from);
    if (msg.type === 'state_sync') _applyFullState(msg.data);
  }

  function _applyRemoteStep(data) { /* hook into bench.js step state if available */ }
  function _renderRemoteCursor(msg) { /* show remote cursor indicator */ }
  function _applyFullState(data) { _labState = data; }

  function _onPeerJoined(name) {
    if (!_peers.includes(name)) _peers.push(name);
    _updatePeerList();
    _appendSystemMsg(name + ' joined the session');
    /* Send full state to new peer */
    _broadcastState('state_sync', _labState);
  }

  /* ─── BroadcastChannel (same-browser / multiple tabs) ─── */
  function _initBC(sessionId) {
    if (!('BroadcastChannel' in window)) return;
    _bc = new BroadcastChannel('omicslab_session_' + sessionId);
    _bc.onmessage = e => _handleMessage(e.data);
  }

  /* ─── WebRTC host: create offer ─── */
  async function _createOffer() {
    _pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    _dc = _pc.createDataChannel('omicslab_collab');
    _setupDataChannel(_dc);

    _pc.onicecandidate = e => {
      if (!e.candidate) {
        /* ICE gathering complete — offer is ready */
        const offer = JSON.stringify(_pc.localDescription);
        document.getElementById('collab-offer-box').value = offer;
        document.getElementById('collab-offer-step').style.display = '';
        _appendSystemMsg('Offer ready — share it with your collaborator');
      }
    };

    const offer = await _pc.createOffer();
    await _pc.setLocalDescription(offer);
  }

  /* ─── WebRTC host: receive answer ─── */
  async function _receiveAnswer(answerJson) {
    try {
      const answer = JSON.parse(answerJson);
      await _pc.setRemoteDescription(new RTCSessionDescription(answer));
      _appendSystemMsg('Answer accepted — waiting for peer connection…');
    } catch (e) {
      _appendSystemMsg('Invalid answer — please paste the full JSON from your collaborator.');
    }
  }

  /* ─── WebRTC guest: receive offer, create answer ─── */
  async function _receiveOffer(offerJson) {
    try {
      const offer = JSON.parse(offerJson);
      _pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });

      _pc.ondatachannel = e => {
        _dc = e.channel;
        _setupDataChannel(_dc);
      };

      _pc.onicecandidate = e => {
        if (!e.candidate) {
          const answer = JSON.stringify(_pc.localDescription);
          document.getElementById('collab-answer-box').value = answer;
          document.getElementById('collab-answer-step').style.display = '';
          _appendSystemMsg('Answer ready — share it back with the host');
        }
      };

      await _pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await _pc.createAnswer();
      await _pc.setLocalDescription(answer);
    } catch (e) {
      _appendSystemMsg('Invalid offer — please paste the full JSON from the host.');
    }
  }

  /* ─── DataChannel setup ─── */
  function _setupDataChannel(dc) {
    dc.onopen = () => {
      _appendSystemMsg('Peer connection established!');
      _updateConnStatus(true);
      /* Announce presence */
      _broadcastState('join', { name: _myName });
    };
    dc.onclose = () => {
      _appendSystemMsg('Peer disconnected.');
      _updateConnStatus(false);
    };
    dc.onmessage = e => _handleMessage(e.data);
    dc.onerror = e => _appendSystemMsg('Connection error: ' + e.message);
  }

  /* ─── Chat ─── */
  function sendChat(text) {
    text = (text || '').trim();
    if (!text) return;
    _appendChat(_myName, text, true);
    _broadcastState('chat', { text });
    const input = document.getElementById('collab-chat-input');
    if (input) input.value = '';
  }

  function _appendChat(from, text, isMine) {
    const feed = document.getElementById('collab-chat-feed');
    if (!feed) return;
    const div = document.createElement('div');
    div.className = 'collab-chat-msg' + (isMine ? ' mine' : '');
    div.innerHTML = `<span class="collab-chat-name">${from}</span><span class="collab-chat-text">${text.replace(/</g,'&lt;')}</span>`;
    feed.appendChild(div);
    feed.scrollTop = feed.scrollHeight;
  }

  function _appendSystemMsg(msg) {
    const feed = document.getElementById('collab-chat-feed');
    if (!feed) return;
    const div = document.createElement('div');
    div.className = 'collab-system-msg';
    div.textContent = msg;
    feed.appendChild(div);
    feed.scrollTop = feed.scrollHeight;
  }

  function _renderIncomingMessage(msg) {
    /* Generic activity feed */
    const feed = document.getElementById('collab-activity');
    if (!feed) return;
    const div = document.createElement('div');
    div.className = 'collab-activity-item';
    div.innerHTML = `<span class="collab-act-time">${new Date().toLocaleTimeString()}</span>
      <span class="collab-act-peer">${msg.from}</span>
      <span class="collab-act-type">${msg.type.replace(/_/g,' ')}</span>`;
    feed.insertBefore(div, feed.firstChild);
    if (feed.children.length > 20) feed.removeChild(feed.lastChild);
  }

  /* ─── UI helpers ─── */
  function _updateConnStatus(connected) {
    const dot = document.getElementById('collab-status-dot');
    const label = document.getElementById('collab-status-label');
    if (dot) dot.className = 'collab-status-dot' + (connected ? ' connected' : '');
    if (label) label.textContent = connected ? 'Connected' : 'Disconnected';
    /* Show/hide session panels */
    const live = document.getElementById('collab-live-panel');
    if (live) live.style.display = connected ? '' : 'none';
  }

  function _updatePeerList() {
    const el = document.getElementById('collab-peers');
    if (!el) return;
    el.innerHTML = [{ name: _myName, me: true }, ..._peers.map(n => ({ name: n, me: false }))].map(p => `
      <div class="collab-peer">
        <div class="collab-peer-avatar">${p.name.charAt(0).toUpperCase()}</div>
        <span class="collab-peer-name">${p.name}${p.me ? ' (you)' : ''}</span>
        ${p.me ? '<span class="collab-peer-host">HOST</span>' : ''}
      </div>`).join('');
  }

  /* ─── Init ─── */
  function init() {
    const section = document.getElementById('collab-section');
    if (!section || section.dataset.collabReady) return;
    section.dataset.collabReady = '1';
    _render(section);
  }

  function _render(section) {
    section.innerHTML = `
      <div class="collab-wrap">
        <div class="collab-header">
          <div>
            <div class="collab-badge">LIVE COLLABORATION</div>
            <h2 class="collab-title">Real-Time Lab Sessions</h2>
            <p class="collab-subtitle">Work on lab protocols together with colleagues — see each other's steps, chat, and sync state in real time. WebRTC peer-to-peer, no server required.</p>
          </div>
          <div class="collab-conn-status">
            <div class="collab-status-dot" id="collab-status-dot"></div>
            <span id="collab-status-label">Not connected</span>
          </div>
        </div>

        <!-- Name + session setup -->
        <div class="collab-setup-card" id="collab-setup">
          <div class="collab-setup-title">Set up your session</div>
          <div class="collab-setup-row">
            <div class="collab-field">
              <label class="collab-label">Your display name</label>
              <input class="collab-input" id="collab-name" placeholder="e.g. Kwame A." maxlength="30"/>
            </div>
          </div>
          <div class="collab-mode-choice">
            <button class="collab-mode-btn" id="collab-host-btn" onclick="OmicsLab.Collab._startHost()">
              <div class="collab-mode-icon">👑</div>
              <div class="collab-mode-label">Host Session</div>
              <div class="collab-mode-desc">Create a new session and invite a collaborator</div>
            </button>
            <button class="collab-mode-btn" id="collab-guest-btn" onclick="OmicsLab.Collab._startGuest()">
              <div class="collab-mode-icon">🤝</div>
              <div class="collab-mode-label">Join Session</div>
              <div class="collab-mode-desc">Paste an offer from your host to join</div>
            </button>
          </div>
        </div>

        <!-- Host flow -->
        <div class="collab-flow-card" id="collab-host-flow" style="display:none">
          <div class="collab-flow-title">Host — Share your offer</div>
          <div class="collab-step-box">
            <div class="collab-step-num">1</div>
            <div class="collab-step-body">
              <div class="collab-step-title">Your connection offer</div>
              <div class="collab-step-desc">Copy this and send to your collaborator (chat, email, WhatsApp)</div>
              <textarea class="collab-sdp-box" id="collab-offer-box" readonly placeholder="Generating offer…" rows="4"></textarea>
              <button class="collab-copy-btn" onclick="OmicsLab.Collab._copyBox('collab-offer-box',this)">Copy Offer</button>
            </div>
          </div>
          <div class="collab-step-box" id="collab-offer-step" style="display:none">
            <div class="collab-step-num">2</div>
            <div class="collab-step-body">
              <div class="collab-step-title">Paste your collaborator's answer</div>
              <textarea class="collab-sdp-box" id="collab-answer-input" placeholder="Paste answer JSON here…" rows="4"></textarea>
              <button class="collab-accept-btn" onclick="OmicsLab.Collab._acceptAnswer()">Connect</button>
            </div>
          </div>
        </div>

        <!-- Guest flow -->
        <div class="collab-flow-card" id="collab-guest-flow" style="display:none">
          <div class="collab-flow-title">Guest — Join a session</div>
          <div class="collab-step-box">
            <div class="collab-step-num">1</div>
            <div class="collab-step-body">
              <div class="collab-step-title">Paste the host's offer</div>
              <textarea class="collab-sdp-box" id="collab-offer-input" placeholder="Paste offer JSON from host…" rows="4"></textarea>
              <button class="collab-accept-btn" onclick="OmicsLab.Collab._acceptOffer()">Generate Answer</button>
            </div>
          </div>
          <div class="collab-step-box" id="collab-answer-step" style="display:none">
            <div class="collab-step-num">2</div>
            <div class="collab-step-body">
              <div class="collab-step-title">Send your answer to the host</div>
              <textarea class="collab-sdp-box" id="collab-answer-box" readonly placeholder="Answer will appear here…" rows="4"></textarea>
              <button class="collab-copy-btn" onclick="OmicsLab.Collab._copyBox('collab-answer-box',this)">Copy Answer</button>
            </div>
          </div>
        </div>

        <!-- Same-browser / BroadcastChannel session -->
        <div class="collab-bc-card">
          <div class="collab-bc-icon">⚡</div>
          <div class="collab-bc-body">
            <div class="collab-bc-title">Same-Device / Same-Browser Quick Connect</div>
            <div class="collab-bc-desc">Open this page in a second tab or window — they'll sync automatically using the same session ID without any copy-paste signaling.</div>
            <div class="collab-bc-row">
              <input class="collab-input" id="collab-bc-id" placeholder="Session ID (e.g. AB12CD)" style="max-width:180px"/>
              <button class="collab-accept-btn" onclick="OmicsLab.Collab._joinBC()">Join BroadcastChannel</button>
            </div>
          </div>
        </div>

        <!-- Live panel (shown when connected) -->
        <div class="collab-live-panel" id="collab-live-panel" style="display:none">
          <div class="collab-live-grid">
            <!-- Peers -->
            <div class="collab-panel-box">
              <div class="collab-panel-label">Session Members</div>
              <div id="collab-peers" class="collab-peers-list"></div>
            </div>

            <!-- Shared state / activity -->
            <div class="collab-panel-box">
              <div class="collab-panel-label">Activity Feed</div>
              <div id="collab-activity" class="collab-activity-feed"></div>
            </div>

            <!-- Chat -->
            <div class="collab-panel-box collab-chat-panel">
              <div class="collab-panel-label">Session Chat</div>
              <div id="collab-chat-feed" class="collab-chat-feed"></div>
              <div class="collab-chat-input-row">
                <input class="collab-input" id="collab-chat-input" placeholder="Send a message…"
                       onkeydown="if(event.key==='Enter')OmicsLab.Collab.sendChat(this.value)"/>
                <button class="collab-send-btn" onclick="OmicsLab.Collab.sendChat(document.getElementById('collab-chat-input').value)">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                </button>
              </div>
            </div>
          </div>

          <!-- Shared lab tools -->
          <div class="collab-shared-tools">
            <div class="collab-panel-label">Broadcast Lab Events to Peers</div>
            <div class="collab-tools-row">
              <button class="collab-tool-btn" onclick="OmicsLab.Collab._broadcastState('lab_step',{step:'DNA Extraction',status:'started'})">
                🧪 Start DNA Extraction
              </button>
              <button class="collab-tool-btn" onclick="OmicsLab.Collab._broadcastState('lab_step',{step:'Library Prep',status:'started'})">
                📚 Start Library Prep
              </button>
              <button class="collab-tool-btn" onclick="OmicsLab.Collab._broadcastState('lab_step',{step:'Sequencing',status:'started'})">
                🔬 Start Sequencing
              </button>
              <button class="collab-tool-btn" onclick="OmicsLab.Collab._broadcastState('lab_step',{step:'QC',status:'started'})">
                📊 Run QC
              </button>
            </div>
          </div>
        </div>

        <!-- How it works -->
        <div class="collab-how-section">
          <div class="collab-how-title">How it works</div>
          <div class="collab-how-steps">
            <div class="collab-how-step">
              <div class="collab-how-num">1</div>
              <div class="collab-how-text"><strong>Host</strong> clicks "Host Session", waits for offer JSON to appear</div>
            </div>
            <div class="collab-how-step">
              <div class="collab-how-num">2</div>
              <div class="collab-how-text"><strong>Host</strong> copies offer JSON, sends to collaborator via WhatsApp / email / chat</div>
            </div>
            <div class="collab-how-step">
              <div class="collab-how-num">3</div>
              <div class="collab-how-text"><strong>Guest</strong> clicks "Join Session", pastes offer, generates answer JSON</div>
            </div>
            <div class="collab-how-step">
              <div class="collab-how-num">4</div>
              <div class="collab-how-text"><strong>Guest</strong> sends answer JSON back to host; host pastes it and clicks Connect</div>
            </div>
            <div class="collab-how-step">
              <div class="collab-how-num">5</div>
              <div class="collab-how-text">Direct WebRTC connection established — peer-to-peer, no server, no cloud</div>
            </div>
          </div>
          <div class="collab-tech-note">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
            Uses WebRTC DataChannel + Google STUN servers for NAT traversal. Works on Chrome, Firefox, Edge, Safari 15+. Both peers must be online for initial handshake; after connection, data flows directly between browsers.
          </div>
        </div>
      </div>`;
  }

  /* ─── Flow handlers ─── */
  function _startHost() {
    const name = document.getElementById('collab-name')?.value?.trim();
    if (!name) { alert('Please enter your display name first.'); return; }
    _myName = name;
    _role = 'host';
    _sessionId = _genId();
    document.getElementById('collab-host-flow').style.display = '';
    document.getElementById('collab-guest-flow').style.display = 'none';
    _initBC(_sessionId);
    _createOffer();
    document.getElementById('collab-bc-id').value = _sessionId;
    _updatePeerList();
  }

  function _startGuest() {
    const name = document.getElementById('collab-name')?.value?.trim();
    if (!name) { alert('Please enter your display name first.'); return; }
    _myName = name;
    _role = 'guest';
    document.getElementById('collab-guest-flow').style.display = '';
    document.getElementById('collab-host-flow').style.display = 'none';
    _updatePeerList();
  }

  function _acceptOffer() {
    const json = document.getElementById('collab-offer-input')?.value?.trim();
    if (!json) { alert('Please paste the offer JSON first.'); return; }
    _receiveOffer(json);
  }

  function _acceptAnswer() {
    const json = document.getElementById('collab-answer-input')?.value?.trim();
    if (!json) { alert('Please paste the answer JSON first.'); return; }
    _receiveAnswer(json);
  }

  function _joinBC() {
    const id = document.getElementById('collab-bc-id')?.value?.trim().toUpperCase();
    if (!id) { alert('Please enter a session ID.'); return; }
    const name = document.getElementById('collab-name')?.value?.trim() || 'Collaborator';
    _myName = name;
    _sessionId = id;
    _initBC(id);
    _updateConnStatus(true);
    _updatePeerList();
    _broadcastState('join', { name: _myName });
    _appendSystemMsg('Joined BroadcastChannel session: ' + id);
    document.getElementById('collab-live-panel').style.display = '';
  }

  function _copyBox(id, btn) {
    const box = document.getElementById(id);
    if (!box || !box.value) return;
    navigator.clipboard.writeText(box.value).then(() => {
      const orig = btn.textContent;
      btn.textContent = 'Copied!';
      btn.style.color = '#3fb950';
      setTimeout(() => { btn.textContent = orig; btn.style.color = ''; }, 1800);
    });
  }

  return { init, sendChat, _startHost, _startGuest, _acceptOffer, _acceptAnswer, _joinBC, _copyBox, _broadcastState };
})();
