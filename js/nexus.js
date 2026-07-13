/* ═══════════════════════════════════════════════════════════════
   OmicsLab Nexus — Research Communication Hub (Prompt 22)
   Persistent offline channels, threaded discussions, pinned
   resources, and @mention notifications. Slack-inspired design
   built entirely with localStorage — no server required.
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.Nexus = (function () {

  const STORE = 'omicslab_nexus_v1';
  const IC = OmicsLab.Icons?.svg || (() => '');

  /* ─── Default channels ─── */
  const DEFAULT_CHANNELS = [
    { id: 'general',        name: 'general',         icon: 'hash', desc: 'General discussion for the OmicsLab community', color: '#00C4A0', pinned: [] },
    { id: 'announcements',  name: 'announcements',   icon: 'bell', desc: 'Platform updates and new feature releases', color: '#58a6ff', pinned: [] },
    { id: 'wgs-genomics',   name: 'wgs-genomics',    icon: 'dna',  desc: 'Whole Genome Sequencing — methods, QC, GATK, variant calling', color: '#bc8cff', pinned: [] },
    { id: 'rna-seq',        name: 'rna-seq',          icon: 'activity', desc: 'Bulk RNA-seq, differential expression, DESeq2, edgeR', color: '#e3b341', pinned: [] },
    { id: 'africa-science', name: 'africa-science',  icon: 'globe', desc: 'H3Africa, AWI-Gen, APCDR, African genomics initiatives', color: '#f97316', pinned: [] },
    { id: 'outbreaks',      name: 'outbreak-response',icon: 'alert-triangle', desc: 'Epidemics, surveillance, One Health, genomic epidemiology', color: '#ff6b6b', pinned: [] },
    { id: 'bioinformatics', name: 'bioinformatics',  icon: 'terminal', desc: 'Tools, pipelines, HPC, cloud computing, reproducibility', color: '#00C4A0', pinned: [] },
    { id: 'papers',         name: 'paper-discussion', icon: 'file-text', desc: 'Discuss recent publications in African genomics', color: '#58a6ff', pinned: [] },
    { id: 'help',           name: 'help',             icon: 'message-circle', desc: 'Ask questions, get support from the community', color: '#bc8cff', pinned: [] },
  ];

  /* ─── Seed messages ─── */
  const SEED_MESSAGES = {
    'general': [
      { id: 'gm1', author: 'Dr. Amara Osei', role: 'KEMRI · Kenya', avatar: 'AO', color: '#00C4A0', ts: Date.now() - 86400000*3, text: 'Welcome to OmicsLab Nexus! This is the community hub for African genomics researchers, students, and instructors. Introduce yourself below.', reactions: { '+1': 12, 'check-circle': 5 }, pinned: false, thread: [] },
      { id: 'gm2', author: 'Sipho Dlamini', role: 'UCT · South Africa', avatar: 'SD', color: '#58a6ff', ts: Date.now() - 86400000*2, text: 'Just completed the WGS curriculum track — the error propagation simulation in the DNA extraction step was incredibly realistic. Lost 40% of my reads because of a mis-calibrated bead ratio. Lesson learned!', reactions: { 'zap': 8 }, pinned: false, thread: [{ id: 'gm2r1', author: 'Platform', role: 'OmicsLab', avatar: 'OL', color: '#00C4A0', ts: Date.now() - 86400000*2 + 3600000, text: 'That is exactly the kind of mistake that costs real experiments. The bead ratio step has a 15% pass rate on first attempt.', reactions: {}, pinned: false }] },
      { id: 'gm3', author: 'Fatima Al-Rashidi', role: 'APCDR · Uganda', avatar: 'FA', color: '#bc8cff', ts: Date.now() - 86400000, text: 'Anyone working on APOL1 kidney disease variants in Ugandan cohorts? Looking to compare gnomAD AFR frequencies with local data.', reactions: { 'heart-pulse': 4 }, pinned: false, thread: [] },
    ],
    'announcements': [
      { id: 'an1', author: 'OmicsLab Platform', role: 'System', avatar: 'OL', color: '#58a6ff', ts: Date.now() - 86400000*5, text: 'Version 2.0 is live. Major additions: Phylo Tree Builder (NJ + UPGMA), Expression Visualiser (volcano + heatmap), Peer Review Simulator, Citation Manager, and Multiplayer Quiz Battle. See the changelog for full details.', reactions: { '+1': 24, 'zap': 18 }, pinned: true, thread: [] },
      { id: 'an2', author: 'OmicsLab Platform', role: 'System', avatar: 'OL', color: '#58a6ff', ts: Date.now() - 86400000*2, text: 'New tools live: Sample Quality Predictor (GATK/ENCODE/H3Africa thresholds), Variant Interpreter (ACMG/AMP 2015 + 20 Africa variants), and Primer Design (Wallace Tm + dimer checks). Access them all under Tools.', reactions: { '+1': 31 }, pinned: true, thread: [] },
    ],
    'africa-science': [
      { id: 'af1', author: 'Dr. Kagiso Motsepe', role: 'KRISP · South Africa', avatar: 'KM', color: '#f97316', ts: Date.now() - 86400000*4, text: 'The AWI-Gen study published new GWAS hits for cardiometabolic traits across 6 African sites — including Burkina Faso, Ghana, Kenya, Nigeria, South Africa and Tanzania. Strong population stratification signals in PCA. Worth discussing the ancestry inference methods used.', reactions: { 'bar-chart': 7, '+1': 9 }, pinned: false, thread: [] },
      { id: 'af2', author: 'Amira Hassan', role: 'ACEGID · Nigeria', avatar: 'AH', color: '#e3b341', ts: Date.now() - 86400000*2, text: 'H3Africa data governance workshop recordings are available. Key takeaway: community advisory boards are now required for any genomic data sharing outside the country of origin. Important for all research using African cohort data.', reactions: { 'shield': 11, '+1': 6 }, pinned: true, thread: [] },
    ],
    'outbreaks': [
      { id: 'ob1', author: 'Dr. Yewande Adeyemi', role: 'IHVN · Nigeria', avatar: 'YA', color: '#ff6b6b', ts: Date.now() - 86400000*6, text: 'Mpox clade Ib update: 847 confirmed cases in DRC this week. Genome sequences now available on GISAID. The phylo clustering suggests two distinct transmission chains — one linked to the healthcare setting, one community-acquired. Real-time tree is in the OmicsLab Journal Club.', reactions: { 'alert-triangle': 14, '+1': 8 }, pinned: false, thread: [] },
      { id: 'ob2', author: 'Platform', role: 'OmicsLab', avatar: 'OL', color: '#00C4A0', ts: Date.now() - 86400000*3, text: 'Outbreak Alert feed updated: Marburg Rwanda (active · 28 cases), XDR-TB South Africa (ongoing), Oropouche West Africa (new · 14 cases). Use the Outbreak Alerts section for genomic readiness scores per country.', reactions: {}, pinned: false, thread: [] },
    ],
  };

  /* ─── State ─── */
  let _state = { channels: [], activeChannel: 'general', profile: null };
  let _view = 'channel'; /* 'channel' | 'forum' | 'people' — not persisted, always lands on Channels */

  /* ─── Storage ─── */
  function _load() {
    try {
      const raw = localStorage.getItem(STORE);
      if (raw) _state = { ..._state, ...JSON.parse(raw) };
    } catch {}
    if (!_state.channels || !_state.channels.length) {
      _state.channels = DEFAULT_CHANNELS.map(c => ({
        ...c,
        messages: SEED_MESSAGES[c.id] || [],
      }));
    }
    _state.profile = _state.profile || { name: 'You', role: 'OmicsLab User', avatar: 'YO', color: '#00C4A0' };
    _syncProfileFromAuth();
  }

  function _save() {
    try { localStorage.setItem(STORE, JSON.stringify(_state)); } catch {}
  }

  /* Binds the real signed-in identity onto the chat profile — previously
     Nexus never checked auth at all, so every message was posted as a
     generic "You" even when signed in. Guests can still post (Nexus has
     no login gate by design), this only personalizes it once a real
     identity is available. institution/country come from the app's own
     profile settings since they aren't on the Clerk user object. */
  function _syncProfileFromAuth() {
    const cu = OmicsLab.AuthClerk?.getUser?.();
    if (!cu) return;
    let extra = {};
    try { extra = JSON.parse(localStorage.getItem('omicslab_user') || '{}'); } catch {}
    const initials = (cu.name || 'OmicsLab User').trim().split(/\s+/).slice(0, 2).map(w => w[0] || '').join('').toUpperCase() || 'OL';
    _state.profile = { ..._state.profile, name: cu.name || _state.profile.name, avatar: initials, role: extra.institution || _state.profile.role };
    _save();
  }

  /* ─── Get channel ─── */
  function _ch(id) {
    return _state.channels.find(c => c.id === id);
  }

  /* ─── Format timestamp ─── */
  function _fmtTime(ts) {
    const d = new Date(ts);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    if (isToday) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }

  /* ─── Inject a message received from another user (realtime) ─── */
  function _injectMessage(msg, channelId) {
    channelId = channelId || _state.activeChannel;
    const ch = _ch(channelId);
    if (!ch) return;
    if (_hasMessage(msg.id, channelId)) return; /* deduplicate */

    ch.messages.push(msg);
    _save();

    if (channelId === _state.activeChannel) {
      /* Append to DOM without full re-render */
      const list = document.getElementById('nx-messages-list');
      if (list) {
        const empty = list.querySelector('.nx-empty-ch');
        if (empty) empty.remove();
        list.insertAdjacentHTML('beforeend', _msgHtml(msg));
        _scrollBottom();
      }
      /* Animate the new message in */
      const el = document.querySelector(`[data-msgid="${msg.id}"]`);
      if (el) el.classList.add('nx-msg-new');
    } else {
      /* Re-render sidebar to update unread badge */
      _renderSidebar();
    }
  }

  function _hasMessage(id, channelId) {
    channelId = channelId || _state.activeChannel;
    const ch = _ch(channelId);
    return !!(ch?.messages.find(m => m.id === id));
  }

  function _getActiveChannel() { return _state.activeChannel; }

  /* ─── Render sidebar ─── */
  function _renderSidebar() {
    const s = document.getElementById('nx-sidebar');
    if (!s) return;

    const channelItems = _state.channels.map(c => {
      const active = c.id === _state.activeChannel;
      const unread = (c.messages || []).length;
      return `
        <button class="nx-ch-item ${active ? 'nx-ch-active' : ''}" onclick="OmicsLab.Nexus._switchChannel('${c.id}')">
          <span class="nx-ch-icon" style="color:${c.color}">#</span>
          <span class="nx-ch-name">${c.name}</span>
          ${!active && unread > 0 ? `<span class="nx-ch-badge">${Math.min(unread, 99)}</span>` : ''}
        </button>`;
    }).join('');

    s.innerHTML = `
      <div class="nx-sidebar-header">
        <div class="nx-workspace-name">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
          OmicsLab Nexus
        </div>
        <div class="nx-workspace-sub">African Genomics Network <span id="nx-online-count"></span></div>
      </div>

      <div class="nx-view-nav">
        <button class="nx-ch-item ${_view==='forum'?'nx-ch-active':''}" onclick="OmicsLab.Nexus._switchView('forum')">
          <span class="nx-ch-icon">${IC('file-text',13) || '◆'}</span><span class="nx-ch-name">Forum</span>
        </button>
        <button class="nx-ch-item ${_view==='people'?'nx-ch-active':''}" onclick="OmicsLab.Nexus._switchView('people')">
          <span class="nx-ch-icon">${IC('users',13) || '@'}</span><span class="nx-ch-name">People</span>
        </button>
      </div>

      <div class="nx-sidebar-section">
        <div class="nx-sidebar-label">Channels</div>
        <div class="nx-channel-list">${channelItems}</div>
      </div>

      <div class="nx-sidebar-footer">
        <div class="nx-profile-pill">
          <div class="nx-avatar" style="background:${_state.profile.color}">${_state.profile.avatar}</div>
          <div class="nx-profile-info">
            <div class="nx-profile-name">${_state.profile.name}</div>
            <div class="nx-profile-status"><span class="nx-status-dot"></span>Active</div>
          </div>
        </div>
      </div>`;
  }

  /* ─── Render message ─── */
  function _msgHtml(msg, inThread = false) {
    const reactionHtml = Object.entries(msg.reactions || {}).map(([icon, n]) =>
      n > 0 ? `<button class="nx-reaction" onclick="OmicsLab.Nexus._react('${msg.id}','${icon}')">${icon === '+1' ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>' : OmicsLab.Icons.svg(icon, 12)} ${n}</button>` : ''
    ).join('');

    const threadCount = msg.thread?.length || 0;

    return `
      <div class="nx-message ${msg.pinned ? 'nx-msg-pinned' : ''}" data-msgid="${msg.id}">
        <div class="nx-avatar nx-msg-avatar" style="background:${msg.color}">${msg.avatar}</div>
        <div class="nx-msg-body">
          <div class="nx-msg-header">
            <span class="nx-msg-author">${msg.author}</span>
            <span class="nx-msg-role">${msg.role}</span>
            <span class="nx-msg-time">${_fmtTime(msg.ts)}</span>
            ${msg.pinned ? '<span class="nx-pinned-badge"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> Pinned</span>' : ''}
          </div>
          <div class="nx-msg-text">${_linkify(msg.text)}</div>
          ${reactionHtml ? `<div class="nx-reactions">${reactionHtml}</div>` : ''}
          ${!inThread && threadCount > 0 ? `
            <button class="nx-thread-btn" onclick="OmicsLab.Nexus._openThread('${msg.id}')">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              ${threadCount} ${threadCount === 1 ? 'reply' : 'replies'}
            </button>` : ''}
          ${!inThread ? `
            <div class="nx-msg-actions">
              <button class="nx-msg-action" title="Reply in thread" onclick="OmicsLab.Nexus._openThread('${msg.id}')"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></button>
              <button class="nx-msg-action" title="Add reaction" onclick="OmicsLab.Nexus._react('${msg.id}','+1')"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M8 13s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg></button>
            </div>` : ''}
        </div>
      </div>`;
  }

  /* ─── Basic @mention + URL linkify ─── */
  function _linkify(text) {
    return text
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/@(\w+)/g, '<span class="nx-mention">@$1</span>')
      .replace(/`([^`]+)`/g, '<code class="nx-code">$1</code>');
  }

  /* ─── Render messages panel ─── */
  function _renderMessages() {
    const panel = document.getElementById('nx-messages');
    if (!panel) return;

    const ch = _ch(_state.activeChannel);
    if (!ch) return;

    const msgs = (ch.messages || []).map(m => _msgHtml(m)).join('');
    const pinned = (ch.messages || []).filter(m => m.pinned);

    panel.innerHTML = `
      <div class="nx-channel-header">
        <div class="nx-ch-header-name">
          <span class="nx-ch-hash" style="color:${ch.color}">#</span>
          ${ch.name}
        </div>
        <div class="nx-ch-header-desc">${ch.desc}</div>
        ${pinned.length ? `<div class="nx-pinned-strip"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> ${pinned.length} pinned message${pinned.length > 1 ? 's' : ''}</div>` : ''}
      </div>
      <div class="nx-messages-list" id="nx-messages-list">${msgs || '<div class="nx-empty-ch">No messages yet. Start the conversation.</div>'}</div>
      <div class="nx-composer">
        <textarea class="nx-composer-input" id="nx-composer-input" rows="1"
          placeholder="Message #${ch.name} — Shift+Enter for new line, Enter to send"
          onkeydown="OmicsLab.Nexus._composerKey(event)"></textarea>
        <div class="nx-composer-actions">
          <button class="nx-send-btn" onclick="OmicsLab.Nexus._send()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>
        </div>
      </div>`;

    _scrollBottom();
  }

  /* ─── Render thread panel ─── */
  function _openThread(msgId) {
    const ch = _ch(_state.activeChannel);
    if (!ch) return;
    const msg = ch.messages.find(m => m.id === msgId);
    if (!msg) return;

    const panel = document.getElementById('nx-thread');
    if (!panel) return;

    panel.classList.add('nx-thread-open');
    panel.innerHTML = `
      <div class="nx-thread-header">
        <div class="nx-thread-title">Thread</div>
        <button class="nx-thread-close" onclick="OmicsLab.Nexus._closeThread()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <div class="nx-thread-parent">${_msgHtml(msg, true)}</div>
      <div class="nx-thread-divider">${(msg.thread || []).length} ${(msg.thread || []).length === 1 ? 'reply' : 'replies'}</div>
      <div class="nx-thread-replies">${(msg.thread || []).map(r => _msgHtml(r, true)).join('')}</div>
      <div class="nx-thread-composer">
        <textarea class="nx-composer-input" id="nx-thread-input" rows="1"
          placeholder="Reply in thread…"
          onkeydown="OmicsLab.Nexus._threadKey(event, '${msgId}')"></textarea>
        <button class="nx-send-btn" onclick="OmicsLab.Nexus._sendThread('${msgId}')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </button>
      </div>`;
  }

  function _closeThread() {
    const panel = document.getElementById('nx-thread');
    if (panel) panel.classList.remove('nx-thread-open');
  }

  /* ─── Switch channel ─── */
  function _switchChannel(id) {
    _state.activeChannel = id;
    _view = 'channel';
    _renderSidebar();
    _renderMessages();
    _closeThread();
    OmicsLab.NexusRealtime?.switchChannel?.(id);
  }

  /* ─── Switch top-level view (Channels / Forum / People) ───
     Forum and People used to be separate standalone pages
     (js/community.js, js/social.js) — merged in here as tabs of one
     communication hub instead of three fragmented, inconsistently
     auth-gated destinations. */
  function _switchView(view) {
    _view = view;
    _closeThread();
    _renderSidebar();
    _renderMain();
  }

  function _renderMain() {
    if (_view === 'forum')  { OmicsLab.Community?.mountInto?.('nx-messages'); return; }
    if (_view === 'people') { OmicsLab.Social?.mountInto?.('nx-messages'); return; }
    _renderMessages();
  }

  /* ─── Send message ─── */
  function _send() {
    const ta = document.getElementById('nx-composer-input');
    if (!ta) return;
    const text = ta.value.trim();
    if (!text) return;

    const ch = _ch(_state.activeChannel);
    if (!ch) return;

    const msg = {
      id: 'msg_' + Date.now(),
      author: _state.profile.name,
      role: _state.profile.role,
      avatar: _state.profile.avatar,
      color: _state.profile.color,
      ts: Date.now(),
      text,
      reactions: {},
      pinned: false,
      thread: [],
    };
    ch.messages.push(msg);
    _save();
    ta.value = '';
    ta.style.height = '';
    _renderMessages();

    /* Broadcast to other users via Supabase Realtime if available */
    OmicsLab.NexusRealtime?.broadcast?.(_state.activeChannel, msg);
  }

  /* ─── Send thread reply ─── */
  function _sendThread(msgId) {
    const ta = document.getElementById('nx-thread-input');
    if (!ta) return;
    const text = ta.value.trim();
    if (!text) return;

    const ch = _ch(_state.activeChannel);
    const msg = ch?.messages.find(m => m.id === msgId);
    if (!msg) return;

    msg.thread = msg.thread || [];
    msg.thread.push({
      id: 'rep_' + Date.now(),
      author: _state.profile.name,
      role: _state.profile.role,
      avatar: _state.profile.avatar,
      color: _state.profile.color,
      ts: Date.now(),
      text,
      reactions: {},
    });
    _save();
    ta.value = '';
    _openThread(msgId);
    _renderMessages();
  }

  /* ─── Reactions ─── */
  function _react(msgId, icon) {
    const ch = _ch(_state.activeChannel);
    if (!ch) return;
    const msg = ch.messages.find(m => m.id === msgId);
    if (!msg) return;
    msg.reactions = msg.reactions || {};
    msg.reactions[icon] = (msg.reactions[icon] || 0) + 1;
    _save();
    _renderMessages();
  }

  /* ─── Keyboard shortcuts ─── */
  function _composerKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); _send(); }
  }
  function _threadKey(e, msgId) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); _sendThread(msgId); }
  }

  /* ─── Auto-resize textarea ─── */
  function _scrollBottom() {
    const list = document.getElementById('nx-messages-list');
    if (list) list.scrollTop = list.scrollHeight;
  }

  /* ─── Init ─── */
  function init() {
    const section = document.getElementById('nexus-section');
    if (!section || section.dataset.nxReady) return;
    section.dataset.nxReady = '1';

    _load();

    section.innerHTML = `
      <div class="nx-wrap">
        <div class="nx-layout">
          <aside class="nx-sidebar" id="nx-sidebar"></aside>
          <main class="nx-main" id="nx-messages"></main>
          <aside class="nx-thread" id="nx-thread"></aside>
        </div>
      </div>`;

    _renderSidebar();
    _renderMain();
  }

  /* Re-sync identity + re-render whichever view is open once Clerk
     resolves (async SDK boot) or the user signs in/out mid-session. */
  OmicsLab.AuthClerk?.onAuthChange?.(() => {
    _syncProfileFromAuth();
    const section = document.getElementById('nexus-section');
    if (!section?.dataset.nxReady) return;
    _renderSidebar();
    if (_view === 'channel') _renderMain();
  });

  return {
    init,
    _switchChannel, _switchView, _send, _sendThread, _react, _openThread, _closeThread,
    _composerKey, _threadKey,
    /* Realtime hooks */
    _injectMessage, _hasMessage, _getActiveChannel,
  };
})();
