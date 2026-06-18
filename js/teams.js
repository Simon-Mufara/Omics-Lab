/* ═══════════════════════════════════════════════════════════════
   OmicsLab Teams — Research Meeting & Collaboration Platform
   ─ Meeting rooms, video/audio, screen sharing, in-call chat
   ─ Graceful microphone/camera permission error handling
   ─ BroadcastChannel signaling for same-device multi-tab testing
   ─ Designed to plug into WebSocket signaling backend (see spec)
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.Teams = (function () {

  const STORE = 'omicslab_teams_v1';

  /* ─── Seed rooms ─── */
  const SEED_ROOMS = [
    { id: 'rm-genomics',   name: 'African Genomics Lab Meeting', icon: 'dna', color: '#3fb950', desc: 'Weekly WGS pipeline review and data governance updates', scheduled: 'Mondays 10:00 WAT', participants: 4, locked: false },
    { id: 'rm-outbreak',   name: 'Outbreak Response Coordination', icon: 'alert-triangle', color: '#ff6b6b', desc: 'Real-time outbreak genomics coordination across APSED/WHO nodes', scheduled: 'On demand', participants: 7, locked: false },
    { id: 'rm-h3africa',   name: 'H3Africa Consortium Call', icon: 'globe', color: '#f97316', desc: 'Consortium-wide biannual review — data governance, ethics, publications', scheduled: 'Biannual', participants: 12, locked: true },
    { id: 'rm-training',   name: 'Bioinformatics Training Room', icon: 'book-open', color: '#58a6ff', desc: 'Live hands-on training sessions and student office hours', scheduled: 'Thursdays 14:00 EAT', participants: 0, locked: false },
    { id: 'rm-journal',    name: 'Journal Club',                 icon: 'file-text', color: '#bc8cff', desc: 'Weekly paper discussion — African genomics, outbreak genomics, methods', scheduled: 'Fridays 15:00 SAST', participants: 3, locked: false },
  ];

  /* ─── State ─── */
  let _rooms     = [];
  let _inMeeting = false;
  let _roomId    = null;
  let _stream    = null;     // local MediaStream
  let _screen    = null;     // screen share stream
  let _muted     = false;
  let _camOff    = false;
  let _handRaised = false;
  let _chatMessages = [];
  let _channel   = null;     // BroadcastChannel for same-device testing
  let _peers     = [];       // connected peer display names

  /* ─── Storage ─── */
  function _load() {
    try {
      const raw = localStorage.getItem(STORE);
      if (raw) {
        const s = JSON.parse(raw);
        _rooms = s.rooms || SEED_ROOMS;
        return;
      }
    } catch {}
    _rooms = SEED_ROOMS.map(r => ({ ...r }));
    _save();
  }

  function _save() {
    try { localStorage.setItem(STORE, JSON.stringify({ rooms: _rooms })); } catch {}
  }

  /* ──────────────────────────────────────────────────────────────
     Media permission handling — central helper used by all calls
     Returns { stream, audioOnly, denied, error }
     ────────────────────────────────────────────────────────────── */
  async function _requestMedia(wantVideo = true, wantAudio = true) {
    /* First: enumerate devices to understand what's available */
    let hasVideo = false, hasAudio = false;
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      hasVideo = devices.some(d => d.kind === 'videoinput');
      hasAudio = devices.some(d => d.kind === 'audioinput');
    } catch {}

    /* Attempt with both video+audio */
    if (wantVideo && hasVideo && wantAudio && hasAudio) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 360, facingMode: 'user' }, audio: { echoCancellation: true, noiseSuppression: true } });
        return { stream, audioOnly: false, denied: false };
      } catch (err) {
        if (_isDenied(err)) return { stream: null, denied: true, reason: 'both', err };
      }
    }

    /* Fallback: audio only */
    if (wantAudio && hasAudio) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
        return { stream, audioOnly: true, denied: false };
      } catch (err) {
        if (_isDenied(err)) return { stream: null, denied: true, reason: 'audio', err };
      }
    }

    /* No device available */
    if (!hasAudio && !hasVideo) return { stream: null, denied: false, noDevice: true };

    return { stream: null, denied: false, error: 'Could not access media devices' };
  }

  function _isDenied(err) {
    return err && (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError' ||
      err.name === 'SecurityError' || (err.message && err.message.toLowerCase().includes('denied')));
  }

  /* ─── Render rooms list ─── */
  function _renderRooms() {
    const section = document.getElementById('teams-section');
    if (!section) return;

    const user = OmicsLab.Auth?.currentUser();

    section.innerHTML = `
      <div class="tm-wrap">
        <div class="tm-header">
          <div class="tm-header-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            OmicsLab Teams
          </div>
          <div class="tm-header-sub">Research meetings and collaboration across Africa's genomics network</div>
          <div class="tm-header-actions">
            <button class="tm-btn-primary" onclick="OmicsLab.Teams._showCreateRoom()">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              New meeting room
            </button>
          </div>
        </div>

        ${!user ? `<div class="tm-auth-notice">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
          Sign in to create rooms, record meetings, and sync your meeting history across devices.
          <button class="tm-auth-link" onclick="OmicsLab.Auth.openModal('signin')">Sign in</button>
        </div>` : ''}

        <div class="tm-rooms-grid" id="tm-rooms-grid">
          ${_rooms.map(r => _roomCardHtml(r)).join('')}
        </div>

        <div class="tm-info-strip">
          <div class="tm-info-item">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
            <span>Same-device multi-tab meetings work now. Cross-device calls require the backend signaling server — see <strong>docs/backend-api.md</strong>.</span>
          </div>
          <div class="tm-info-item">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            <span>All video is processed locally — no video leaves your device without the backend server.</span>
          </div>
        </div>
      </div>`;
  }

  function _roomCardHtml(r) {
    const active = r.participants > 0;
    return `
      <div class="tm-room-card ${active ? 'tm-room-active' : ''}">
        <div class="tm-room-top">
          <div class="tm-room-icon" style="background:${r.color}22;border-color:${r.color}44">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${r.color}" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              ${_iconPath(r.icon)}
            </svg>
          </div>
          <div class="tm-room-meta">
            ${active ? `<span class="tm-live-badge"><span class="tm-live-dot"></span>Live · ${r.participants} in call</span>` : ''}
            ${r.locked ? `<span class="tm-locked-badge"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg> Invite only</span>` : ''}
          </div>
        </div>
        <h3 class="tm-room-name">${r.name}</h3>
        <p class="tm-room-desc">${r.desc}</p>
        <div class="tm-room-schedule">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          ${r.scheduled}
        </div>
        <div class="tm-room-footer">
          <button class="tm-join-btn" onclick="OmicsLab.Teams.joinRoom('${r.id}')">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            ${active ? 'Join now' : 'Join room'}
          </button>
        </div>
      </div>`;
  }

  /* ─── Icon path lookup ─── */
  function _iconPath(name) {
    const P = {
      'dna': '<path d="M2 15c6.667-6 13.333 0 20-6"/><path d="M9 22c1.798-1.998 2.518-3.995 2.807-5.993"/><path d="M15 2c-1.798 1.998-2.518 3.995-2.807 5.993"/>',
      'alert-triangle': '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
      'globe': '<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
      'book-open': '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
      'file-text': '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>',
      'users': '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    };
    return P[name] || P['users'];
  }

  /* ─── Show create room dialog ─── */
  function _showCreateRoom() {
    const overlay = document.createElement('div');
    overlay.id = 'tm-create-overlay';
    overlay.className = 'tm-overlay';
    overlay.onclick = e => { if (e.target === overlay) overlay.remove(); };
    overlay.innerHTML = `
      <div class="tm-dialog">
        <div class="tm-dialog-header">
          <span>Create a new room</span>
          <button class="auth-close" onclick="document.getElementById('tm-create-overlay').remove()">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="tm-dialog-body">
          <div class="auth-field">
            <label class="auth-label">Room name</label>
            <input class="auth-input" id="tmcr-name" type="text" placeholder="e.g. African Genomics Lab Meeting"/>
          </div>
          <div class="auth-field">
            <label class="auth-label">Description</label>
            <input class="auth-input" id="tmcr-desc" type="text" placeholder="Brief description of this room's purpose"/>
          </div>
          <div class="auth-field-row">
            <div class="auth-field">
              <label class="auth-label">Schedule</label>
              <input class="auth-input" id="tmcr-schedule" type="text" placeholder="e.g. Mondays 10:00 WAT"/>
            </div>
            <div class="auth-field">
              <label class="auth-label">Access</label>
              <select class="auth-input auth-select" id="tmcr-locked">
                <option value="0">Open — anyone can join</option>
                <option value="1">Invite only</option>
              </select>
            </div>
          </div>
          <button class="auth-submit-btn" onclick="OmicsLab.Teams._createRoom()">Create room</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    setTimeout(() => document.getElementById('tmcr-name')?.focus(), 100);
  }

  function _createRoom() {
    const name     = document.getElementById('tmcr-name')?.value?.trim();
    const desc     = document.getElementById('tmcr-desc')?.value?.trim();
    const schedule = document.getElementById('tmcr-schedule')?.value?.trim() || 'On demand';
    const locked   = document.getElementById('tmcr-locked')?.value === '1';
    if (!name) return;
    const room = {
      id: 'rm-' + Date.now().toString(36),
      name, desc: desc || 'Custom meeting room',
      icon: 'users', color: '#58a6ff',
      scheduled: schedule, participants: 0, locked,
    };
    _rooms.push(room);
    _save();
    document.getElementById('tm-create-overlay')?.remove();
    _renderRooms();
  }

  /* ─── Join a room → request media → show meeting UI ─── */
  async function joinRoom(roomId) {
    const room = _rooms.find(r => r.id === roomId);
    if (!room) return;

    _roomId = roomId;

    /* Show loading / permission request state */
    const section = document.getElementById('teams-section');
    if (section) {
      section.innerHTML = `
        <div class="tm-meeting-loading">
          <div class="tm-perm-card" id="tm-perm-card">
            <div class="tm-perm-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#58a6ff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
            </div>
            <h3 class="tm-perm-title">Allow microphone and camera</h3>
            <p class="tm-perm-desc">OmicsLab needs access to your camera and microphone for the meeting.<br>Your browser will ask for permission — click <strong>Allow</strong>.</p>
            <div class="tm-perm-spinner" id="tm-perm-spinner">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3fb950" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
              Requesting permission…
            </div>
            <button class="tm-btn-secondary" onclick="OmicsLab.Teams._cancelJoin()" style="margin-top:1rem">Cancel</button>
          </div>
        </div>`;
    }

    /* Request media */
    const result = await _requestMedia(true, true);

    if (result.denied) {
      _showPermDenied(room, result.reason);
      return;
    }

    if (result.noDevice) {
      _showNoDevice(room);
      return;
    }

    _stream = result.stream;

    /* Update room participant count */
    room.participants = (room.participants || 0) + 1;
    _save();

    /* Setup BroadcastChannel for same-device signaling */
    try {
      _channel = new BroadcastChannel('omicslab_meeting_' + roomId);
      _channel.onmessage = _onBroadcastMsg;
      _channel.postMessage({ type: 'JOINED', name: _myName() });
    } catch {}

    _chatMessages = [];
    _inMeeting = true;
    _muted = false;
    _camOff = result.audioOnly;
    _handRaised = false;
    _peers = [];

    _renderMeeting(room, result.audioOnly);
  }

  /* ─── Permission denied UI ─── */
  function _showPermDenied(room, reason) {
    const section = document.getElementById('teams-section');
    if (!section) return;

    const isAudio = reason === 'audio';
    const browserGuide = _getBrowserGuide();

    section.innerHTML = `
      <div class="tm-meeting-loading">
        <div class="tm-perm-card tm-perm-denied">
          <div class="tm-perm-denied-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ff6b6b" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
          </div>
          <h3 class="tm-perm-title" style="color:#ff6b6b">${isAudio ? 'Microphone' : 'Camera &amp; microphone'} access denied</h3>
          <p class="tm-perm-desc">
            Your browser blocked access. To join the meeting you need to grant permission.
          </p>
          <div class="tm-perm-steps">
            <div class="tm-perm-step-label">How to fix this in ${browserGuide.name}:</div>
            ${browserGuide.steps.map((s, i) => `<div class="tm-perm-step"><span class="tm-perm-step-num">${i+1}</span>${s}</div>`).join('')}
          </div>
          <div class="tm-perm-actions">
            <button class="tm-btn-primary" onclick="OmicsLab.Teams.joinRoom('${room.id}')">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-.18-5.57"/></svg>
              Try again
            </button>
            <button class="tm-btn-secondary" onclick="OmicsLab.Teams._joinAudioOnly('${room.id}')">Join with audio only</button>
            <button class="tm-btn-secondary" onclick="OmicsLab.Teams._cancelJoin()">Back to rooms</button>
          </div>
        </div>
      </div>`;
  }

  function _showNoDevice(room) {
    const section = document.getElementById('teams-section');
    if (!section) return;
    section.innerHTML = `
      <div class="tm-meeting-loading">
        <div class="tm-perm-card tm-perm-denied">
          <div class="tm-perm-denied-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#e3b341" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
          </div>
          <h3 class="tm-perm-title" style="color:#e3b341">No microphone found</h3>
          <p class="tm-perm-desc">No microphone or camera was detected on this device. Connect a headset or USB microphone and try again.</p>
          <div class="tm-perm-actions">
            <button class="tm-btn-primary" onclick="OmicsLab.Teams.joinRoom('${room.id}')">Try again</button>
            <button class="tm-btn-secondary" onclick="OmicsLab.Teams._cancelJoin()">Back to rooms</button>
          </div>
        </div>
      </div>`;
  }

  /* ─── Browser-specific permission guide ─── */
  function _getBrowserGuide() {
    const ua = navigator.userAgent;
    if (/Firefox/i.test(ua)) return {
      name: 'Firefox',
      steps: [
        'Click the camera/microphone icon in the address bar.',
        'Select <strong>Allow</strong> for both camera and microphone.',
        'Reload the page and click Try again.',
      ],
    };
    if (/Edg/i.test(ua)) return {
      name: 'Edge',
      steps: [
        'Click the lock icon (or camera icon) in the address bar.',
        'Set Camera and Microphone to <strong>Allow</strong>.',
        'Click Try again — no reload needed.',
      ],
    };
    if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) return {
      name: 'Safari',
      steps: [
        'Go to <strong>Safari → Settings → Websites → Camera</strong>.',
        'Find this website and set it to <strong>Allow</strong>.',
        'Do the same under <strong>Microphone</strong>.',
        'Reload the page and click Try again.',
      ],
    };
    /* Default Chrome */
    return {
      name: 'Chrome',
      steps: [
        'Click the camera/microphone icon on the right side of the address bar.',
        'Select <strong>Always allow</strong> for both camera and microphone.',
        'Click Try again — no reload needed.',
      ],
    };
  }

  /* ─── Join audio only ─── */
  async function _joinAudioOnly(roomId) {
    const room = _rooms.find(r => r.id === roomId);
    if (!room) return;
    _roomId = roomId;
    const result = await _requestMedia(false, true);
    if (result.denied) { _showPermDenied(room, 'audio'); return; }
    if (result.noDevice) { _showNoDevice(room); return; }
    _stream = result.stream;
    _camOff = true;
    _inMeeting = true;
    _muted = false;
    _handRaised = false;
    _peers = [];
    try {
      _channel = new BroadcastChannel('omicslab_meeting_' + roomId);
      _channel.onmessage = _onBroadcastMsg;
      _channel.postMessage({ type: 'JOINED', name: _myName() });
    } catch {}
    _chatMessages = [];
    _renderMeeting(room, true);
  }

  function _cancelJoin() {
    _cleanup();
    init();
  }

  /* ─── Render meeting view ─── */
  function _renderMeeting(room, audioOnly) {
    const section = document.getElementById('teams-section');
    if (!section) return;

    section.innerHTML = `
      <div class="tm-meeting">
        <!-- Header bar -->
        <div class="tm-meeting-header">
          <div class="tm-meeting-title">
            <span class="tm-meeting-name">${room.name}</span>
            <span class="tm-meeting-live"><span class="tm-live-dot"></span>Live</span>
          </div>
          <div class="tm-meeting-timer" id="tm-timer">00:00</div>
          <div style="flex:1"></div>
          <div class="tm-meeting-participants-count" id="tm-participants-count">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            <span id="tm-count-num">1</span>
          </div>
        </div>

        <!-- Main area: video grid + sidebar -->
        <div class="tm-meeting-body">
          <div class="tm-video-area" id="tm-video-area">
            <!-- Local tile -->
            <div class="tm-video-tile tm-tile-self" id="tm-tile-self">
              ${audioOnly || _camOff ? `
                <div class="tm-video-avatar">${_myName()[0].toUpperCase()}</div>
              ` : ''}
              <video id="tm-local-video" autoplay muted playsinline style="${audioOnly || _camOff ? 'display:none' : ''}"></video>
              <div class="tm-tile-label">
                <span class="tm-tile-name">${_myName()} (You)</span>
                ${audioOnly ? '<span class="tm-tile-audio-only">Audio only</span>' : ''}
              </div>
              ${_muted ? `<div class="tm-mute-overlay"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ff6b6b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg></div>` : ''}
            </div>
            <div id="tm-peer-tiles"></div>
          </div>

          <!-- Chat sidebar -->
          <div class="tm-chat-sidebar" id="tm-chat-sidebar">
            <div class="tm-chat-header">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              Meeting chat
            </div>
            <div class="tm-chat-messages" id="tm-chat-messages">
              <div class="tm-chat-system">Meeting started. Messages are visible to everyone in this room.</div>
            </div>
            <div class="tm-chat-composer">
              <input type="text" class="tm-chat-input" id="tm-chat-input" placeholder="Type a message…" onkeydown="OmicsLab.Teams._chatKey(event)"/>
              <button class="tm-chat-send" onclick="OmicsLab.Teams._sendChat()">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Controls bar -->
        <div class="tm-controls">
          <button class="tm-ctrl-btn ${_muted ? 'tm-ctrl-off' : ''}" id="tm-btn-mute" onclick="OmicsLab.Teams.toggleMute()" title="Toggle mute (M)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" id="tm-icon-mic">${_muted ? '<line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>' : '<path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>'}</svg>
            <span>${_muted ? 'Unmute' : 'Mute'}</span>
          </button>

          <button class="tm-ctrl-btn ${_camOff || audioOnly ? 'tm-ctrl-off' : ''}" id="tm-btn-cam" onclick="OmicsLab.Teams.toggleCamera()" title="Toggle camera (V)" ${audioOnly ? 'disabled title="No camera"' : ''}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" id="tm-icon-cam">${_camOff || audioOnly ? '<line x1="1" y1="1" x2="23" y2="23"/><path d="M21 21H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3m3-3h6l2 3h4a2 2 0 0 1 2 2v9.34"/>' : '<path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>'}</svg>
            <span>${_camOff || audioOnly ? 'Camera off' : 'Camera'}</span>
          </button>

          <button class="tm-ctrl-btn" id="tm-btn-screen" onclick="OmicsLab.Teams.toggleScreenShare()" title="Share screen">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
            <span>Share</span>
          </button>

          <button class="tm-ctrl-btn ${_handRaised ? 'tm-ctrl-hand' : ''}" id="tm-btn-hand" onclick="OmicsLab.Teams.toggleHand()" title="Raise hand">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 11.5v-5a2 2 0 0 0-4 0v4.5"/><path d="M14 10.5V6a2 2 0 0 0-4 0v5"/><path d="M10 10.5V8a2 2 0 0 0-4 0v8a6 6 0 0 0 6 6h2a6 6 0 0 0 6-6v-2.5a2 2 0 0 0-4 0"/></svg>
            <span>${_handRaised ? 'Lower hand' : 'Raise hand'}</span>
          </button>

          <button class="tm-ctrl-btn tm-ctrl-leave" onclick="OmicsLab.Teams.leaveMeeting()" title="Leave meeting">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            <span>Leave</span>
          </button>
        </div>
      </div>`;

    /* Attach local video */
    if (_stream && !audioOnly && !_camOff) {
      const vid = document.getElementById('tm-local-video');
      if (vid) { vid.srcObject = _stream; vid.play().catch(() => {}); }
    }

    /* Start timer */
    _startTimer();

    /* Keyboard shortcuts */
    document.addEventListener('keydown', _meetingKeydown, { once: false });
  }

  /* ─── Controls ─── */
  function toggleMute() {
    if (!_stream) return;
    _muted = !_muted;
    _stream.getAudioTracks().forEach(t => { t.enabled = !_muted; });
    _broadcastEvent({ type: 'MUTE', muted: _muted, name: _myName() });
    _updateControlBtn('tm-btn-mute', _muted, 'Mute', 'Unmute', '<path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>', '<line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>');
  }

  function toggleCamera() {
    if (!_stream) return;
    const tracks = _stream.getVideoTracks();
    if (!tracks.length) return;
    _camOff = !_camOff;
    tracks.forEach(t => { t.enabled = !_camOff; });
    const tile = document.getElementById('tm-tile-self');
    const vid  = document.getElementById('tm-local-video');
    let av = tile?.querySelector('.tm-video-avatar');
    if (_camOff) {
      if (vid) vid.style.display = 'none';
      if (!av) { av = document.createElement('div'); av.className = 'tm-video-avatar'; av.textContent = _myName()[0].toUpperCase(); tile?.prepend(av); }
    } else {
      if (vid) vid.style.display = '';
      if (av) av.remove();
    }
    _updateControlBtn('tm-btn-cam', _camOff, 'Camera', 'Camera off', '<path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>', '<line x1="1" y1="1" x2="23" y2="23"/><path d="M21 21H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3m3-3h6l2 3h4a2 2 0 0 1 2 2v9.34"/>');
  }

  async function toggleScreenShare() {
    const btn = document.getElementById('tm-btn-screen');
    if (_screen) {
      _screen.getTracks().forEach(t => t.stop());
      _screen = null;
      if (btn) btn.classList.remove('tm-ctrl-active');
      const vid = document.getElementById('tm-local-video');
      if (vid && _stream) { vid.srcObject = _stream; }
      return;
    }
    try {
      _screen = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      _screen.getVideoTracks()[0].onended = () => { _screen = null; if (btn) btn.classList.remove('tm-ctrl-active'); };
      if (btn) btn.classList.add('tm-ctrl-active');
      const vid = document.getElementById('tm-local-video');
      if (vid) { vid.srcObject = _screen; vid.play().catch(() => {}); }
    } catch (err) {
      if (err.name !== 'NotAllowedError') {
        const msg = document.createElement('div');
        msg.className = 'tm-toast';
        msg.textContent = 'Screen sharing not available in this browser.';
        document.body.appendChild(msg);
        setTimeout(() => msg.remove(), 3000);
      }
    }
  }

  function toggleHand() {
    _handRaised = !_handRaised;
    _broadcastEvent({ type: 'HAND', raised: _handRaised, name: _myName() });
    const btn = document.getElementById('tm-btn-hand');
    if (btn) {
      btn.classList.toggle('tm-ctrl-hand', _handRaised);
      btn.querySelector('span').textContent = _handRaised ? 'Lower hand' : 'Raise hand';
    }
    if (_handRaised) _addChatSystem(_myName() + ' raised their hand.');
  }

  function _updateControlBtn(id, isOff, labelOn, labelOff, pathOn, pathOff) {
    const btn = document.getElementById(id);
    if (!btn) return;
    btn.classList.toggle('tm-ctrl-off', isOff);
    btn.querySelector('svg').innerHTML = isOff ? pathOff : pathOn;
    btn.querySelector('span').textContent = isOff ? labelOff : labelOn;
  }

  /* ─── Chat ─── */
  function _chatKey(e) { if (e.key === 'Enter') _sendChat(); }

  function _sendChat() {
    const input = document.getElementById('tm-chat-input');
    const text = input?.value?.trim();
    if (!text) return;
    const msg = { name: _myName(), text, ts: Date.now() };
    _chatMessages.push(msg);
    _broadcastEvent({ type: 'CHAT', ...msg });
    _appendChatMsg(msg.name, msg.text, true);
    if (input) input.value = '';
  }

  function _appendChatMsg(name, text, isSelf) {
    const list = document.getElementById('tm-chat-messages');
    if (!list) return;
    const div = document.createElement('div');
    div.className = 'tm-chat-msg ' + (isSelf ? 'tm-chat-self' : '');
    div.innerHTML = `<span class="tm-chat-name">${_escHtml(name)}</span><span class="tm-chat-text">${_escHtml(text)}</span>`;
    list.appendChild(div);
    list.scrollTop = list.scrollHeight;
  }

  function _addChatSystem(text) {
    const list = document.getElementById('tm-chat-messages');
    if (!list) return;
    const div = document.createElement('div');
    div.className = 'tm-chat-system';
    div.textContent = text;
    list.appendChild(div);
    list.scrollTop = list.scrollHeight;
  }

  /* ─── BroadcastChannel (same-device multi-tab) ─── */
  function _broadcastEvent(data) {
    try { _channel?.postMessage(data); } catch {}
  }

  function _onBroadcastMsg(e) {
    const { type, name } = e.data || {};
    if (type === 'JOINED') {
      if (!_peers.includes(name)) {
        _peers.push(name);
        _updatePeerCount();
        _addPeerTile(name);
        _addChatSystem(name + ' joined the meeting.');
        _broadcastEvent({ type: 'ANNOUNCE', name: _myName() });
      }
    } else if (type === 'ANNOUNCE') {
      if (!_peers.includes(name)) {
        _peers.push(name);
        _updatePeerCount();
        _addPeerTile(name);
      }
    } else if (type === 'LEFT') {
      _peers = _peers.filter(p => p !== name);
      _updatePeerCount();
      _removePeerTile(name);
      _addChatSystem(name + ' left the meeting.');
    } else if (type === 'CHAT') {
      _appendChatMsg(name, e.data.text, false);
    } else if (type === 'HAND' && e.data.raised) {
      _addChatSystem(name + ' raised their hand.');
    } else if (type === 'MUTE') {
      const tile = document.querySelector(`[data-peer="${name}"]`);
      if (tile) {
        let badge = tile.querySelector('.tm-mute-overlay');
        if (e.data.muted && !badge) {
          badge = document.createElement('div');
          badge.className = 'tm-mute-overlay';
          badge.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ff6b6b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/></svg>`;
          tile.appendChild(badge);
        } else if (!e.data.muted && badge) badge.remove();
      }
    }
  }

  function _addPeerTile(name) {
    const area = document.getElementById('tm-peer-tiles');
    if (!area) return;
    const tile = document.createElement('div');
    tile.className = 'tm-video-tile';
    tile.dataset.peer = name;
    tile.innerHTML = `<div class="tm-video-avatar">${name[0].toUpperCase()}</div><div class="tm-tile-label"><span class="tm-tile-name">${_escHtml(name)}</span></div>`;
    area.appendChild(tile);
  }

  function _removePeerTile(name) {
    document.querySelector(`[data-peer="${name}"]`)?.remove();
  }

  function _updatePeerCount() {
    const el = document.getElementById('tm-count-num');
    if (el) el.textContent = 1 + _peers.length;
  }

  /* ─── Leave meeting ─── */
  function leaveMeeting() {
    _broadcastEvent({ type: 'LEFT', name: _myName() });
    /* Decrement participant count */
    const room = _rooms.find(r => r.id === _roomId);
    if (room && room.participants > 0) room.participants--;
    _save();
    _cleanup();
    init();
  }

  function _cleanup() {
    _inMeeting = false;
    if (_stream)  { _stream.getTracks().forEach(t => t.stop());  _stream = null; }
    if (_screen)  { _screen.getTracks().forEach(t => t.stop());  _screen = null; }
    if (_channel) { try { _channel.close(); } catch {} _channel = null; }
    if (_timerInterval) { clearInterval(_timerInterval); _timerInterval = null; }
    document.removeEventListener('keydown', _meetingKeydown);
  }

  /* ─── Timer ─── */
  let _timerInterval = null;
  let _timerStart = 0;

  function _startTimer() {
    _timerStart = Date.now();
    _timerInterval = setInterval(() => {
      const el = document.getElementById('tm-timer');
      if (!el) { clearInterval(_timerInterval); return; }
      const s = Math.floor((Date.now() - _timerStart) / 1000);
      const m = Math.floor(s / 60);
      el.textContent = String(m).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
    }, 1000);
  }

  /* ─── Keyboard shortcuts ─── */
  function _meetingKeydown(e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (e.key === 'm' || e.key === 'M') { e.preventDefault(); toggleMute(); }
    if (e.key === 'v' || e.key === 'V') { e.preventDefault(); toggleCamera(); }
  }

  /* ─── Helpers ─── */
  function _myName() {
    return OmicsLab.Auth?.currentUser()?.name || 'You';
  }

  function _escHtml(s) {
    return (s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  /* ─── Init ─── */
  function init() {
    const section = document.getElementById('teams-section');
    if (!section) return;
    section.dataset.tmReady = '1';
    _load();
    _renderRooms();
  }

  return { init, joinRoom, leaveMeeting, toggleMute, toggleCamera, toggleScreenShare, toggleHand, _chatKey, _sendChat, _cancelJoin, _joinAudioOnly, _showCreateRoom, _createRoom };
})();
