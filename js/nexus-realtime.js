/* ═══════════════════════════════════════════════════════════════
   OmicsLab Nexus — Supabase Realtime Layer
   Adds live messaging and presence to the existing Nexus module.
   Falls back gracefully to localStorage-only when Supabase is
   not configured or the user is offline.

   Strategy:
   • Realtime BROADCAST → instant delivery (no DB read needed)
   • DB INSERT          → persistence for history
   • PRESENCE tracking  → online user count in sidebar
   • History load       → replaces seed messages when DB is ready
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.NexusRealtime = (function () {
  'use strict';

  let _client          = null;
  let _msgChannel      = null;  /* Realtime broadcast channel for messages */
  let _presenceChannel = null;  /* Realtime presence channel */
  let _activeChannelId = 'general';
  let _ready           = false;
  let _selfId          = null;  /* to skip echoing our own broadcast */
  let _onlineUsers     = {};    /* real cross-device presence, keyed by Clerk user id */
  let _retrackTimer    = null;  /* periodic online_at refresh so presence never looks stale */

  /* ── Init ────────────────────────────────────────────────────── */
  function init() {
    const db = OmicsLab.DB;
    if (!db) return;
    /* db.isReady used to be checked exactly once here, synchronously.
       The Supabase CDN script loads async, so DB.init() almost never
       finishes booting before this ran — this module would see
       isReady===false, bail out, and NEVER retry, permanently disabling
       cross-device chat and presence for the rest of the session even
       after Supabase genuinely became ready moments later. onReady()
       fires immediately if already ready, or queues for when it is. */
    db.onReady(() => {
      _client = db.client;
      _selfId = _getSelfId();
      _ready  = true;

      /* Subscribe to the default channel first */
      _activeChannelId = OmicsLab.Nexus?._getActiveChannel?.() || 'general';
      _subscribeMessages(_activeChannelId);
      _subscribePresence();
      _loadHistory(_activeChannelId);

      /* Refresh our presence payload's online_at every 20s. js/social.js's
         "Online Now" list and per-friend online check both treat any
         presence entry older than 45s as stale (a rule that makes sense
         for its OWN local BroadcastChannel presence, which really does
         need periodic proof-of-life writes) — but this module only ever
         called track() once, so a real Supabase-connected user's entry
         silently aged past that 45s window and vanished from "who's
         online" for everyone else even though their connection never
         dropped. Two people who stayed on the People tab for more than
         45 seconds while checking whether they could see each other
         would reliably lose each other. */
      clearInterval(_retrackTimer);
      _retrackTimer = setInterval(_retrack, 20000);

      /* Browsers throttle setInterval heavily (sometimes to once/minute
         or less) in backgrounded/inactive tabs, so the 20s heartbeat
         above can't be relied on to fire promptly the moment someone
         actually looks at the tab again — retrack immediately on
         visibility regain so "are you online right now" doesn't depend
         on background-timer throttling lining up. */
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') _retrack();
      });
    });

    /* Re-send our presence payload whenever Clerk's auth state resolves
       or changes, not just once at initial subscribe — see _retrack()
       for why the one-shot track() left signed-in users invisible to
       each other. Fires on sign-in, sign-out, and Clerk's first-ever
       resolution of a persisted session (which frequently lands after
       the presence channel has already subscribed). */
    OmicsLab.AuthClerk?.onAuthChange?.(() => _retrack());
  }

  /* ── Message broadcast subscription ─────────────────────────── */
  function _subscribeMessages(channelId) {
    if (_msgChannel) {
      _client.removeChannel(_msgChannel);
      _msgChannel = null;
    }

    _msgChannel = _client
      .channel(`nexus-msg:${channelId}`, {
        config: { broadcast: { self: false } },
      })
      .on('broadcast', { event: 'nexus_message' }, ({ payload }) => {
        _onBroadcastMessage(payload, channelId);
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          _setConnectionBadge('live');
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          _setConnectionBadge('offline');
        }
      });
  }

  /* ── Presence subscription ───────────────────────────────────── */
  function _subscribePresence() {
    if (_presenceChannel) {
      _client.removeChannel(_presenceChannel);
    }

    _presenceChannel = _client.channel('nexus-presence', {
      config: { presence: { key: _selfId } },
    });

    _presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = _presenceChannel.presenceState();
        _updateOnlineCount(Object.keys(state).length);

        /* Rebuild the real, cross-device online-user list (keyed by the
           actual signed-in Clerk user id, not the per-browser selfId) so
           js/social.js's "who's online" / friend-code lookup can find
           genuinely remote users instead of only same-browser tabs. */
        _onlineUsers = {};
        Object.values(state).forEach(entries => {
          /* Supabase Realtime Presence appends a new metadata entry to this
             key's array on every track() call rather than replacing it in
             place — entries[0] is the FIRST-ever track for that key, not
             the current one. Reading entries[0] meant every re-track (the
             periodic online_at refresh below, or the auth-resolves-late
             retrack) silently had no visible effect: the timestamp/name/etc
             other clients actually read never advanced past the original
             value, which is what made two genuinely still-connected users
             look "stale" and drop off each other's Online Now list. */
          const meta = entries[entries.length - 1];
          if (meta?.userId) _onlineUsers[meta.userId] = meta;
        });
        OmicsLab.Social?._onPresenceUpdate?.();
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        /* Could show "X joined" notification — skip for now */
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') _retrack();
      });
  }

  /* Sends (or re-sends) our presence payload with whatever identity is
     currently known. track() used to be called exactly once, inside the
     subscribe() callback above — but Clerk's session hydration is an
     async network round-trip that frequently hasn't finished by the time
     Supabase's presence channel subscribes, so the very first track()
     often fired with userId===null (identity not resolved yet) and was
     NEVER retried. That user's own presence.track payload permanently
     lacked a userId for the rest of the tab's life, silently excluding
     them from everyone else's "who's online" list (getOnlineUsers()
     only keeps entries with a truthy meta.userId) even though the
     channel connection itself was completely healthy — which is exactly
     what made two genuinely-online, genuinely-chatting users invisible
     to each other in Nexus's People tab. Re-tracking on every auth
     change (see the AuthClerk.onAuthChange wiring below) fixes this by
     re-sending the payload once the real Clerk id is actually known. */
  function _retrack() {
    if (!_presenceChannel || !_ready) return;
    const user = _getDisplayUser();
    _presenceChannel.track({
      selfId:      _selfId,
      userId:      _getDbUserId(),
      name:        user.name,
      avatar:      user.avatar,
      institution: user.institution,
      country:     user.country,
      online_at:   new Date().toISOString(),
    }).catch(() => {});
  }

  /* Real cross-device online users (excludes self), for js/social.js.
     Only signed-in users are trackable this way — presence is keyed by
     Clerk user id, so a guest has no userId and can't be "found". */
  function getOnlineUsers() {
    const selfDbId = _getDbUserId();
    return Object.entries(_onlineUsers)
      .filter(([id]) => id && id !== selfDbId)
      .map(([id, meta]) => ({
        id, name: meta.name || 'OmicsLab User',
        institution: meta.institution || '', country: meta.country || '',
        t: meta.online_at ? new Date(meta.online_at).getTime() : Date.now(),
      }));
  }

  /* ── Handle incoming broadcast message ──────────────────────── */
  function _onBroadcastMessage(msg, channelId) {
    if (!msg?.id) return;

    /* Direct messages (js/social.js's Friends → Messages tab) share this
       same broadcast+persist machinery via a 'dm:<sortedIds>' channel id
       instead of a named Nexus channel — see broadcast()/switchChannel()
       below. Route those to Social instead of Nexus's channel-chat UI. */
    if (channelId.startsWith('dm:')) {
      OmicsLab.Social?._onDMMessage?.(msg, channelId);
      return;
    }

    /* Nexus.injectMessage handles deduplication + DOM append */
    if (OmicsLab.Nexus?._injectMessage) {
      OmicsLab.Nexus._injectMessage(msg, channelId);
    }
  }

  /* ── Load history from Supabase DB ──────────────────────────── */
  async function _loadHistory(channelId) {
    if (!_client) return;
    try {
      const { data, error } = await _client
        .from('nexus_messages')
        .select('id, user_id, content, reactions, author_meta, created_at')
        .eq('channel', channelId)
        .is('thread_id', null)            /* top-level messages only */
        .order('created_at', { ascending: true })
        .limit(80);

      if (error || !data?.length) return;

      /* Map DB rows → Nexus message shape. `from` (the sender's user id)
         is only needed by DM history (js/social.js needs to tell "mine"
         apart from "theirs" on reload) — harmless extra field for the
         named-channel case, which ignores it. */
      const msgs = data.map(row => ({
        id:        row.id,
        from:      row.user_id,
        author:    row.author_meta?.name   || 'Community Member',
        role:      row.author_meta?.role   || '',
        avatar:    row.author_meta?.avatar || '??',
        color:     row.author_meta?.color  || '#00C4A0',
        ts:        new Date(row.created_at).getTime(),
        text:      row.content,
        reactions: row.reactions || {},
        pinned:    false,
        thread:    [],
      }));

      /* Inject each message that isn't already in state */
      msgs.forEach(msg => {
        if (channelId.startsWith('dm:')) {
          OmicsLab.Social?._onDMMessage?.(msg, channelId, /* fromHistory */ true);
        } else if (OmicsLab.Nexus?._injectMessage) {
          OmicsLab.Nexus._injectMessage(msg, channelId, /* fromHistory */ true);
        }
      });

    } catch (err) {
      /* Silently fail — localStorage messages still show */
    }
  }

  /* ── Broadcast + persist a message ──────────────────────────── */
  async function broadcast(channelId, msg) {
    if (!_ready || !_msgChannel) return;

    /* Broadcast to all other subscribers (instant, no DB needed) */
    _msgChannel.send({
      type:    'broadcast',
      event:   'nexus_message',
      payload: msg,
    }).catch(() => {});

    /* Persist via the server (fire-and-forget) — NOT a direct client
       insert. nexus_messages.user_id is a uuid FK into public.users(id),
       a Supabase-internal row id the browser never has (only the raw
       Clerk id, e.g. "user_2NNXf...", never a valid UUID); the insert
       RLS policy requires it to match auth.uid(), which can't resolve
       correctly against a Clerk JWT client-side. That made every insert
       fail silently — live broadcast still worked (a separate, unrelated
       channel) but nothing ever actually persisted, so a message sent
       while the recipient wasn't already looking at that exact
       conversation was gone for good. api/nexus-message.js verifies the
       Clerk session server-side and resolves + writes with the service
       role instead, sidestepping the broken client-side RLS path
       entirely — the same pattern api/ai-tutor-chat.js and
       api/forum-comments.js already use. Guests (no token) simply don't
       persist, matching prior behaviour for them. */
    OmicsLab.AuthClerk?.getToken?.().then(token => {
      if (!token) return;
      fetch('/api/nexus-message', {
        method:  'POST',
        headers: { 'content-type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          id:      msg.id,
          channel: channelId,
          content: msg.text,
          reactions: msg.reactions || {},
          authorMeta: {
            name:   msg.author,
            avatar: msg.avatar,
            color:  msg.color,
            role:   msg.role,
          },
        }),
      }).then(res => {
        if (!res.ok) console.warn('[NexusRealtime] Message persist failed:', res.status);
      }).catch(() => {});
    }).catch(() => {});
  }

  /* ── Switch realtime subscription when user changes channel ─── */
  function switchChannel(newChannelId) {
    if (newChannelId === _activeChannelId || !_ready) return;
    _activeChannelId = newChannelId;
    _subscribeMessages(newChannelId);
    _loadHistory(newChannelId);
  }

  /* ── UI helpers ──────────────────────────────────────────────── */
  function _updateOnlineCount(count) {
    const el = document.getElementById('nx-online-count');
    if (!el) return;
    if (count > 1) {
      el.textContent = `· ${count} online`;
      el.style.display = 'inline';
    } else {
      el.textContent = '';
    }
  }

  function _setConnectionBadge(state) {
    const el = document.getElementById('nx-online-count');
    if (!el) return;
    if (state === 'live') {
      el.setAttribute('data-rt', 'live');
    } else {
      el.setAttribute('data-rt', 'offline');
    }
  }

  /* ── Identity helpers ────────────────────────────────────────── */
  function _getSelfId() {
    const k = 'omicslab_nexus_selfid';
    let id = localStorage.getItem(k);
    if (!id) { id = 'u_' + Math.random().toString(36).slice(2) + Date.now().toString(36); localStorage.setItem(k, id); }
    return id;
  }

  function _getDisplayUser() {
    try {
      const p = JSON.parse(localStorage.getItem('omicslab_user_profile') || '{}');
      let extra = {};
      try { extra = JSON.parse(localStorage.getItem('omicslab_user') || '{}'); } catch {}
      return {
        name:   p.name   || 'OmicsLab User',
        avatar: p.name   ? p.name.split(' ').slice(0,2).map(w => w[0]).join('').toUpperCase() : 'OU',
        color:  '#00C4A0',
        role:   p.role   || 'student',
        institution: extra.institution || '',
        country:     extra.country || '',
      };
    } catch { return { name: 'OmicsLab User', avatar: 'OU', color: '#00C4A0', role: 'student', institution: '', country: '' }; }
  }

  function _getDbUserId() {
    try {
      const p = JSON.parse(localStorage.getItem('omicslab_user_profile') || '{}');
      return p.id || null;
    } catch { return null; }
  }

  /* ── Public API ─────────────────────────────────────────────── */
  return { init, broadcast, switchChannel, getOnlineUsers, get isReady() { return _ready; } };

})();
