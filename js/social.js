/* ═══════════════════════════════════════════════════════════════
   OmicsLab — Social Hub
   Online presence · Friend codes · Direct messaging
   All data: localStorage + BroadcastChannel (same-device sync)
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.Social = (function () {

  const S_FRIENDS  = 'omicslab_friends_v1';
  const S_MSGS     = 'omicslab_messages_v1';
  const S_PRESENCE = 'omicslab_presence_v1';
  const HEARTBEAT  = 25000; /* ms — update last-active every 25s */

  let _heartbeatTimer = null;
  let _bc = null;       /* BroadcastChannel for same-tab/device sync */
  let _activeChat = null;  /* userId of open chat */
  let _tab = 'discover';

  /* ─── Persistence helpers ─── */
  function _loadFriends()  { try { return JSON.parse(localStorage.getItem(S_FRIENDS)  || '[]'); } catch { return []; } }
  function _saveFriends(f) { try { localStorage.setItem(S_FRIENDS, JSON.stringify(f)); } catch {} }
  function _loadMsgs()     { try { return JSON.parse(localStorage.getItem(S_MSGS)     || '{}'); } catch { return {}; } }
  function _saveMsgs(m)    { try { localStorage.setItem(S_MSGS, JSON.stringify(m)); } catch {} }
  function _loadPresence()  { try { return JSON.parse(localStorage.getItem(S_PRESENCE) || '{}'); } catch { return {}; } }
  function _savePresence(p) { try { localStorage.setItem(S_PRESENCE, JSON.stringify(p)); } catch {} }

  /* ─── My friend code (derived from user ID) ─── */
  function _myCode() {
    const u = OmicsLab.Auth?.currentUser();
    if (!u) return null;
    return 'OL-' + (u.id || '').slice(0, 8).toUpperCase();
  }

  /* ─── Heartbeat: update my presence ─── */
  function _beat() {
    const u = OmicsLab.Auth?.currentUser();
    if (!u) return;
    const presence = _loadPresence();
    presence[u.id] = { name: u.name, institution: u.institution || '', country: u.country || '', t: Date.now() };
    _savePresence(presence);
    /* Broadcast to other tabs */
    try { _bc?.postMessage({ type: 'presence', userId: u.id, name: u.name, t: Date.now() }); } catch {}
  }

  /* ─── Is user online? (< 45s since heartbeat) ─── */
  function _isOnline(userId) {
    const p = _loadPresence();
    return p[userId] && (Date.now() - p[userId].t < 45000);
  }

  /* ─── Send a message ─── */
  function _sendMsg(toId, text) {
    const u = OmicsLab.Auth?.currentUser();
    if (!u || !text.trim()) return;
    const msgs = _loadMsgs();
    const key = _chatKey(u.id, toId);
    if (!msgs[key]) msgs[key] = [];
    const msg = { id: Date.now() + Math.random().toString(36).slice(2), from: u.id, to: toId, text: text.trim(), t: Date.now(), read: false };
    msgs[key].push(msg);
    _saveMsgs(msgs);
    try { _bc?.postMessage({ type: 'message', key, msg }); } catch {}
    _renderChat(toId);
  }

  function _chatKey(a, b) { return [a, b].sort().join('::'); }

  /* ─── Unread count for a chat ─── */
  function _unread(friendId) {
    const u = OmicsLab.Auth?.currentUser();
    if (!u) return 0;
    const msgs = _loadMsgs();
    const key = _chatKey(u.id, friendId);
    return (msgs[key] || []).filter(m => m.to === u.id && !m.read).length;
  }

  /* ─── Mark chat as read ─── */
  function _markRead(friendId) {
    const u = OmicsLab.Auth?.currentUser();
    if (!u) return;
    const msgs = _loadMsgs();
    const key = _chatKey(u.id, friendId);
    if (!msgs[key]) return;
    msgs[key].forEach(m => { if (m.to === u.id) m.read = true; });
    _saveMsgs(msgs);
  }

  /* ─── Add friend by code ─── */
  function addFriendByCode(code) {
    const u = OmicsLab.Auth?.currentUser();
    if (!u) { OmicsLab.Notify?.error('Sign in to add friends.'); return; }
    if (!code || !code.startsWith('OL-')) { OmicsLab.Notify?.error('Invalid code. Codes start with OL-'); return; }

    const presence = _loadPresence();
    const found = Object.entries(presence).find(([id]) => {
      const fCode = 'OL-' + id.slice(0, 8).toUpperCase();
      return fCode === code.toUpperCase();
    });

    if (!found) {
      OmicsLab.Notify?.error('No user found with that code. They must be online or have logged in recently.');
      return;
    }

    const [friendId, friendData] = found;
    if (friendId === u.id) { OmicsLab.Notify?.error("That's your own code!"); return; }

    const friends = _loadFriends();
    if (friends.find(f => f.id === friendId)) { OmicsLab.Notify?.error('Already friends!'); return; }

    friends.push({ id: friendId, name: friendData.name, institution: friendData.institution || '', country: friendData.country || '', addedAt: Date.now() });
    _saveFriends(friends);
    OmicsLab.Notify?.success('Friend added: ' + friendData.name);
    _renderFriendsList();
  }

  function removeFriend(friendId) {
    const friends = _loadFriends().filter(f => f.id !== friendId);
    _saveFriends(friends);
    if (_activeChat === friendId) _activeChat = null;
    _render();
  }

  /* ─── Init ─── */
  function init() {
    const section = document.getElementById('social-section');
    if (!section || section.dataset.socReady) { if (section?.dataset.socReady) _render(); return; }
    section.dataset.socReady = '1';

    /* BroadcastChannel for same-device tab sync */
    try {
      _bc = new BroadcastChannel('omicslab_social');
      _bc.onmessage = e => {
        if (e.data.type === 'presence') {
          const p = _loadPresence();
          p[e.data.userId] = { name: e.data.name, t: e.data.t };
          _savePresence(p);
          _softRefreshPresence();
        }
        if (e.data.type === 'message' && _activeChat) {
          _renderChat(_activeChat);
          _renderFriendsList();
        }
      };
    } catch {}

    /* Start heartbeat */
    _beat();
    clearInterval(_heartbeatTimer);
    _heartbeatTimer = setInterval(_beat, HEARTBEAT);

    _render();
  }

  /* ─── Master render ─── */
  function _render() {
    const section = document.getElementById('social-section');
    if (!section) return;
    const u = OmicsLab.Auth?.currentUser();

    section.innerHTML = `
    <div class="soc-page">
      <div class="soc-header">
        <div class="soc-badge">SOCIAL HUB</div>
        <h1 class="soc-title">OmicsLab Community</h1>
        <p class="soc-sub">Connect with other researchers, share your code, and collaborate — right inside OmicsLab.</p>
      </div>

      ${!u ? _renderSignInPrompt() : _renderMain(u)}
    </div>`;
  }

  function _renderSignInPrompt() {
    return `
    <div class="soc-signin-prompt">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#A8A098" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
      <div class="soc-signin-msg">Sign in to connect with other OmicsLab researchers</div>
      <button class="soc-btn-primary" onclick="OmicsLab.Auth.openModal('signin')">Sign in or create account</button>
    </div>`;
  }

  function _renderMain(u) {
    const friends = _loadFriends();
    const totalUnread = friends.reduce((acc, f) => acc + _unread(f.id), 0);
    const tabs = [
      { key: 'discover', label: 'Online Now' },
      { key: 'friends',  label: `Friends${friends.length ? ' (' + friends.length + ')' : ''}` },
      { key: 'messages', label: `Messages${totalUnread ? ' (' + totalUnread + ')' : ''}` },
      { key: 'mycode',   label: 'My Code' },
    ];
    return `
    <div class="soc-tabs">
      ${tabs.map(t => `<button class="soc-tab ${_tab === t.key ? 'soc-tab-active' : ''}" onclick="OmicsLab.Social._setTab('${t.key}')">${t.label}</button>`).join('')}
    </div>
    <div id="soc-tab-body">${_renderTab(u)}</div>`;
  }

  function _renderTab(u) {
    if (_tab === 'discover')  return _renderDiscover(u);
    if (_tab === 'friends')   return _renderFriends(u);
    if (_tab === 'messages')  return _activeChat ? _renderChatView(_activeChat) : _renderFriends(u);
    if (_tab === 'mycode')    return _renderMyCode(u);
    return '';
  }

  /* ─── Discover: users online now ─── */
  function _renderDiscover(me) {
    const presence = _loadPresence();
    const friends = _loadFriends();
    const now = Date.now();
    const online = Object.entries(presence)
      .filter(([id, p]) => id !== me.id && (now - p.t < 45000))
      .map(([id, p]) => ({ id, ...p }));

    const isFriend = id => friends.some(f => f.id === id);

    return `
    <div class="soc-section">
      <div class="soc-section-hdr">
        <div class="soc-section-title">
          <span class="soc-online-dot"></span>
          ${online.length} researcher${online.length !== 1 ? 's' : ''} online now
        </div>
        <div class="soc-section-sub">People currently using OmicsLab on this device or in nearby browser sessions.</div>
      </div>
      ${online.length === 0 ? `
        <div class="soc-empty">
          <div class="soc-empty-msg">No other users detected online right now.</div>
          <div class="soc-empty-hint">Share your code with colleagues so they can find and add you as a friend.</div>
        </div>` : `
        <div class="soc-user-grid">
          ${online.map(u => `
            <div class="soc-user-card">
              <div class="soc-user-avatar">${_initials(u.name)}</div>
              <div class="soc-user-info">
                <div class="soc-user-name">${_esc(u.name)}</div>
                ${u.institution ? `<div class="soc-user-inst">${_esc(u.institution)}</div>` : ''}
                ${u.country ? `<div class="soc-user-country">${_esc(u.country)}</div>` : ''}
              </div>
              <div class="soc-user-online"><span class="soc-online-dot soc-dot-sm"></span> Online</div>
              ${!isFriend(u.id) ? `<button class="soc-btn-add" onclick="OmicsLab.Social._addFromPresence('${u.id}')">+ Add</button>` : `<span class="soc-friend-tag">Friend</span>`}
            </div>`).join('')}
        </div>`}
      <div class="soc-discover-note">
        <strong>How does this work?</strong> OmicsLab detects nearby sessions using your browser's shared storage. All data stays on your device — nothing is sent to any server.
      </div>
    </div>`;
  }

  /* ─── Friends tab ─── */
  function _renderFriends(me) {
    const friends = _loadFriends();
    return `
    <div class="soc-section" id="soc-friends-list">
      ${_renderAddFriendBar()}
      ${friends.length === 0 ? `
        <div class="soc-empty">
          <div class="soc-empty-msg">No friends added yet.</div>
          <div class="soc-empty-hint">Ask a colleague for their OmicsLab code (shown in "My Code" tab) and enter it above.</div>
        </div>` : `
        <div class="soc-friends-list">
          ${friends.map(f => `
            <div class="soc-friend-row">
              <div class="soc-user-avatar soc-av-sm">${_initials(f.name)}</div>
              <div class="soc-friend-info">
                <div class="soc-friend-name">${_esc(f.name)}</div>
                ${f.institution ? `<div class="soc-friend-inst">${_esc(f.institution)}</div>` : ''}
              </div>
              <div class="soc-friend-status">${_isOnline(f.id) ? '<span class="soc-online-dot soc-dot-sm"></span> Online' : '<span class="soc-offline-dot"></span> Offline'}</div>
              <div class="soc-friend-actions">
                ${_unread(f.id) ? `<span class="soc-unread-badge">${_unread(f.id)}</span>` : ''}
                <button class="soc-btn-msg" onclick="OmicsLab.Social._openChat('${f.id}')">Message</button>
                <button class="soc-btn-remove" onclick="OmicsLab.Social.removeFriend('${f.id}')">Remove</button>
              </div>
            </div>`).join('')}
        </div>`}
    </div>`;
  }

  function _renderAddFriendBar() {
    return `
    <div class="soc-add-bar">
      <input class="soc-code-input" id="soc-add-code" placeholder="Enter friend's code (e.g. OL-A1B2C3D4)" maxlength="20"/>
      <button class="soc-btn-primary" onclick="OmicsLab.Social.addFriendByCode(document.getElementById('soc-add-code').value.trim())">Add friend</button>
    </div>`;
  }

  /* ─── Chat view ─── */
  function _renderChatView(friendId) {
    const friends = _loadFriends();
    const friend = friends.find(f => f.id === friendId);
    if (!friend) { _activeChat = null; _tab = 'friends'; return _renderFriends(OmicsLab.Auth?.currentUser()); }

    _markRead(friendId);
    const me = OmicsLab.Auth?.currentUser();
    const msgs = _loadMsgs();
    const key = _chatKey(me.id, friendId);
    const chat = (msgs[key] || []).slice(-60);

    return `
    <div class="soc-chat-wrap">
      <div class="soc-chat-header">
        <button class="soc-back-btn" onclick="OmicsLab.Social._openChat(null)">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><polyline points="15 18 9 12 15 6"/></svg>
          Back
        </button>
        <div class="soc-user-avatar soc-av-sm">${_initials(friend.name)}</div>
        <div>
          <div class="soc-chat-name">${_esc(friend.name)}</div>
          <div class="soc-chat-status">${_isOnline(friendId) ? '<span class="soc-online-dot soc-dot-sm"></span> Online' : 'Offline'}</div>
        </div>
      </div>
      <div class="soc-chat-msgs" id="soc-chat-msgs">
        ${chat.length === 0 ? '<div class="soc-chat-empty">No messages yet. Say hello!</div>' : ''}
        ${chat.map(m => `
          <div class="soc-msg-row ${m.from === me.id ? 'soc-msg-mine' : 'soc-msg-theirs'}">
            <div class="soc-msg-bubble">${_escMsg(m.text)}</div>
            <div class="soc-msg-time">${_timeAgo(m.t)}</div>
          </div>`).join('')}
      </div>
      <div class="soc-chat-input-bar">
        <textarea class="soc-chat-input" id="soc-chat-text" placeholder="Type a message…" rows="1"
          onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();OmicsLab.Social._send('${friendId}')}"></textarea>
        <button class="soc-send-btn" onclick="OmicsLab.Social._send('${friendId}')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </button>
      </div>
    </div>`;
  }

  /* ─── My Code tab ─── */
  function _renderMyCode(u) {
    const code = _myCode();
    return `
    <div class="soc-section">
      <div class="soc-mycode-card">
        <div class="soc-mycode-label">Your OmicsLab Code</div>
        <div class="soc-mycode-code" id="soc-mycode">${code || 'Sign in to generate your code'}</div>
        ${code ? `
          <button class="soc-btn-copy" onclick="OmicsLab.Social._copyCode('${code}')">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            Copy code
          </button>` : ''}
        <p class="soc-mycode-hint">Share this code with colleagues so they can find and add you as a friend. Your code stays the same as long as you use the same account on this device.</p>
      </div>
      <div class="soc-profile-preview">
        <div class="soc-section-title" style="margin-bottom:.75rem">Your public profile</div>
        <div class="soc-friend-row" style="background:#111B2E;border-radius:8px;padding:.75rem">
          <div class="soc-user-avatar">${_initials(u.name)}</div>
          <div class="soc-friend-info">
            <div class="soc-friend-name">${_esc(u.name)}</div>
            ${u.institution ? `<div class="soc-friend-inst">${_esc(u.institution)}</div>` : ''}
            ${u.country ? `<div class="soc-friend-inst">${_esc(u.country)}</div>` : ''}
          </div>
          <div class="soc-friend-status"><span class="soc-online-dot soc-dot-sm"></span> Online</div>
        </div>
        <div class="soc-mycode-hint" style="margin-top:.6rem">Update your name and institution in <strong>Account Settings</strong> (click your name in the top bar).</div>
      </div>
    </div>`;
  }

  /* ─── UI handlers ─── */
  function _setTab(key) { _tab = key; _activeChat = null; _render(); }

  function _openChat(friendId) {
    _activeChat = friendId;
    _tab = 'messages';
    _render();
    /* Scroll to bottom of chat */
    setTimeout(() => {
      const el = document.getElementById('soc-chat-msgs');
      if (el) el.scrollTop = el.scrollHeight;
    }, 50);
  }

  function _send(toId) {
    const input = document.getElementById('soc-chat-text');
    if (!input) return;
    _sendMsg(toId, input.value);
    input.value = '';
    input.focus();
  }

  function _addFromPresence(userId) {
    const presence = _loadPresence();
    const data = presence[userId];
    if (!data) { OmicsLab.Notify?.error('User not found in presence data.'); return; }
    const friends = _loadFriends();
    if (friends.find(f => f.id === userId)) { OmicsLab.Notify?.error('Already friends!'); return; }
    friends.push({ id: userId, name: data.name, institution: data.institution || '', country: data.country || '', addedAt: Date.now() });
    _saveFriends(friends);
    OmicsLab.Notify?.success('Friend added: ' + data.name);
    _render();
  }

  function _copyCode(code) {
    navigator.clipboard?.writeText(code).then(() => OmicsLab.Notify?.success('Code copied to clipboard')).catch(() => OmicsLab.Notify?.error('Copy failed — select and copy manually'));
  }

  function _renderFriendsList() {
    const el = document.getElementById('soc-friends-list');
    const u = OmicsLab.Auth?.currentUser();
    if (el && u) el.innerHTML = _renderFriends(u).replace('<div class="soc-section" id="soc-friends-list">', '').replace(/^[\s\S]*?<div class="soc-section" id="soc-friends-list">/, '');
  }

  function _renderChat(friendId) {
    const el = document.getElementById('soc-chat-msgs');
    if (el && _activeChat === friendId) {
      const me = OmicsLab.Auth?.currentUser();
      _markRead(friendId);
      const msgs = _loadMsgs();
      const key = _chatKey(me.id, friendId);
      const chat = (msgs[key] || []).slice(-60);
      el.innerHTML = chat.map(m => `
        <div class="soc-msg-row ${m.from === me.id ? 'soc-msg-mine' : 'soc-msg-theirs'}">
          <div class="soc-msg-bubble">${_escMsg(m.text)}</div>
          <div class="soc-msg-time">${_timeAgo(m.t)}</div>
        </div>`).join('');
      el.scrollTop = el.scrollHeight;
    }
  }

  function _softRefreshPresence() {
    if (_tab === 'discover') _render();
  }

  /* ─── Helpers ─── */
  function _initials(name) { return (name||'?').split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase(); }
  function _esc(s) { return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function _escMsg(s) { return _esc(s).replace(/\n/g,'<br>'); }
  function _timeAgo(ts) {
    const d = Date.now() - ts;
    if (d < 60000)  return 'just now';
    if (d < 3600000) return Math.floor(d/60000) + 'm ago';
    if (d < 86400000) return Math.floor(d/3600000) + 'h ago';
    return new Date(ts).toLocaleDateString();
  }

  /* ─── Auth state listener ─── */
  function _onAuth(user) {
    if (user) _beat();
    const section = document.getElementById('social-section');
    if (section?.dataset.socReady) _render();
  }

  /* ─── Wire auth listener once ─── */
  OmicsLab.Auth?.onAuthStateChange?.(_onAuth);

  return { init, addFriendByCode, removeFriend, _setTab, _openChat, _send, _addFromPresence, _copyCode };
})();
