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

  /* ── Init ────────────────────────────────────────────────────── */
  function init() {
    const db = OmicsLab.DB;
    if (!db?.isReady) {
      /* Supabase not configured — Nexus stays localStorage-only */
      return;
    }

    _client = db.client;
    _selfId = _getSelfId();
    _ready  = true;

    /* Subscribe to the default channel first */
    _activeChannelId = OmicsLab.Nexus?._getActiveChannel?.() || 'general';
    _subscribeMessages(_activeChannelId);
    _subscribePresence();
    _loadHistory(_activeChannelId);
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

    const user = _getDisplayUser();

    _presenceChannel = _client.channel('nexus-presence', {
      config: { presence: { key: _selfId } },
    });

    _presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = _presenceChannel.presenceState();
        _updateOnlineCount(Object.keys(state).length);
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        /* Could show "X joined" notification — skip for now */
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await _presenceChannel.track({
            selfId:    _selfId,
            name:      user.name,
            avatar:    user.avatar,
            online_at: new Date().toISOString(),
          });
        }
      });
  }

  /* ── Handle incoming broadcast message ──────────────────────── */
  function _onBroadcastMessage(msg, channelId) {
    if (!msg?.id) return;

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
        .select('id, content, reactions, author_meta, created_at')
        .eq('channel', channelId)
        .is('thread_id', null)            /* top-level messages only */
        .order('created_at', { ascending: true })
        .limit(80);

      if (error || !data?.length) return;

      /* Map DB rows → Nexus message shape */
      const msgs = data.map(row => ({
        id:        row.id,
        author:    row.author_meta?.name   || 'Community Member',
        role:      row.author_meta?.role   || '',
        avatar:    row.author_meta?.avatar || '??',
        color:     row.author_meta?.color  || '#3fb950',
        ts:        new Date(row.created_at).getTime(),
        text:      row.content,
        reactions: row.reactions || {},
        pinned:    false,
        thread:    [],
      }));

      /* Inject each message that isn't already in state */
      msgs.forEach(msg => {
        if (OmicsLab.Nexus?._injectMessage) {
          OmicsLab.Nexus._injectMessage(msg, channelId);
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

    /* Persist to DB (fire-and-forget) */
    if (_client) {
      const userId = _getDbUserId();
      _client.from('nexus_messages').insert({
        id:          msg.id,
        user_id:     userId || null,
        channel:     channelId,
        content:     msg.text,
        reactions:   msg.reactions || {},
        author_meta: {
          name:   msg.author,
          avatar: msg.avatar,
          color:  msg.color,
          role:   msg.role,
        },
      }).then(({ error }) => {
        if (error) console.warn('[NexusRealtime] DB insert failed:', error.message);
      });
    }
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
      return {
        name:   p.name   || 'OmicsLab User',
        avatar: p.name   ? p.name.split(' ').slice(0,2).map(w => w[0]).join('').toUpperCase() : 'OU',
        color:  '#3fb950',
        role:   p.role   || 'student',
      };
    } catch { return { name: 'OmicsLab User', avatar: 'OU', color: '#3fb950', role: 'student' }; }
  }

  function _getDbUserId() {
    try {
      const p = JSON.parse(localStorage.getItem('omicslab_user_profile') || '{}');
      return p.id || null;
    } catch { return null; }
  }

  /* ── Public API ─────────────────────────────────────────────── */
  return { init, broadcast, switchChannel };

})();
