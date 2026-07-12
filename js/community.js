/* ═══════════════════════════════════════════════════════════════
   OmicsLab — Community
   Kaggle-style discussion forum: topics, threaded replies, upvotes.
   Backed by Supabase (api/forum-topics.js, api/forum-comments.js,
   api/forum-react.js) so discussions are genuinely shared across
   every OmicsLab user, not a local-only demo.
   ═══════════════════════════════════════════════════════════════ */
window.OmicsLab = window.OmicsLab || {};

OmicsLab.Community = (function () {

  const CATS = [
    { id: 'all',      label: 'All Topics' },
    { id: 'general',  label: 'General' },
    { id: 'help',     label: 'Help' },
    { id: 'showcase', label: 'Showcase' },
    { id: 'africa',   label: 'African Genomics' },
    { id: 'careers',  label: 'Careers' },
  ];

  let _cat = 'all', _sort = 'new', _topics = [], _activeTopic = null, _comments = [];

  /* ── Helpers ── */
  function _relTime(iso) {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return mins + (mins === 1 ? ' minute ago' : ' minutes ago');
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return hrs + (hrs === 1 ? ' hour ago' : ' hours ago');
    const days = Math.floor(hrs / 24);
    if (days < 7) return days + (days === 1 ? ' day ago' : ' days ago');
    const weeks = Math.floor(days / 7);
    if (weeks < 5) return weeks + (weeks === 1 ? ' week ago' : ' weeks ago');
    const months = Math.floor(days / 30);
    return months <= 1 ? 'a month ago' : months + ' months ago';
  }

  function _initials(name) {
    return (name || 'O L').trim().split(/\s+/).slice(0, 2).map(s => s[0]?.toUpperCase() || '').join('');
  }

  function _esc(s) { return String(s || '').replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c])); }

  async function _authHeader() {
    if (!OmicsLab.AuthClerk?.isSignedIn?.()) return null;
    const token = await OmicsLab.AuthClerk.getToken();
    return token ? { Authorization: `Bearer ${token}` } : null;
  }

  /* ── Data ── */
  async function _fetchTopics() {
    const q = new URLSearchParams();
    if (_cat !== 'all') q.set('category', _cat);
    if (_sort === 'hot') q.set('sort', 'hot');
    try {
      const res = await fetch('/api/forum-topics?' + q.toString());
      const data = await res.json();
      _topics = data.topics || [];
    } catch { _topics = []; }
  }

  async function _fetchComments(topicId) {
    try {
      const res = await fetch('/api/forum-comments?topic_id=' + encodeURIComponent(topicId));
      const data = await res.json();
      _comments = data.comments || [];
    } catch { _comments = []; }
  }

  /* ── Render: list ── */
  function _topicCardHtml(t) {
    const author = t.users?.name || 'OmicsLab Member';
    const avatar = t.users?.avatar_url;
    const meFlag = OmicsLab.AuthClerk?.getUser?.()?.id === t.user_id ? '' : '';
    const reacted = (t.reacted_by || []).includes(OmicsLab.AuthClerk?.getUser?.()?.id);
    const catMeta = CATS.find(c => c.id === t.category) || CATS[1];
    return `
<div class="comm-card" onclick="OmicsLab.Community.openTopic('${t.id}')">
  <div class="comm-card-vote" onclick="event.stopPropagation();OmicsLab.Community.react('topic','${t.id}')">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="${reacted ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
    <span>${(t.reacted_by || []).length}</span>
  </div>
  <div class="comm-card-body">
    <div class="comm-card-top">
      <span class="comm-cat-tag" data-cat="${t.category}">${catMeta.label}</span>
      <span class="comm-card-title">${_esc(t.title)}</span>
    </div>
    <p class="comm-card-snippet">${_esc((t.body || '').slice(0, 160))}${(t.body || '').length > 160 ? '…' : ''}</p>
    <div class="comm-card-meta">
      <span class="comm-avatar">${avatar ? `<img src="${avatar}" alt="">` : _initials(author)}</span>
      <span class="comm-author">${_esc(author)}</span>
      <span class="comm-dot">·</span>
      <span class="comm-time">${_relTime(t.created_at)}</span>
      <span class="comm-dot">·</span>
      <span class="comm-replies">${t.comment_count || 0} comment${t.comment_count === 1 ? '' : 's'}</span>
    </div>
  </div>
</div>`;
  }

  function _renderList() {
    const el = document.getElementById('community-section');
    if (!el) return;
    const signedIn = !!OmicsLab.AuthClerk?.isSignedIn?.();

    el.innerHTML = `
<div class="comm-wrap">
  <div class="comm-header">
    <div>
      <div class="comm-eyebrow">OmicsLab · Community</div>
      <h1 class="comm-title">Discussions</h1>
      <p class="comm-sub">Ask questions, share results, and connect with genomics learners and researchers across Africa and beyond.</p>
    </div>
    <button class="comm-new-btn" onclick="OmicsLab.Community.openComposer()">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
      New Topic
    </button>
  </div>

  <div class="comm-toolbar">
    <div class="comm-cats">
      ${CATS.map(c => `<button class="comm-cat-btn${c.id === _cat ? ' comm-cat-active' : ''}" onclick="OmicsLab.Community.onCat('${c.id}')">${c.label}</button>`).join('')}
    </div>
    <div class="comm-sorts">
      <button class="comm-sort-btn${_sort === 'new' ? ' comm-sort-active' : ''}" onclick="OmicsLab.Community.onSort('new')">New</button>
      <button class="comm-sort-btn${_sort === 'hot' ? ' comm-sort-active' : ''}" onclick="OmicsLab.Community.onSort('hot')">Hotness</button>
    </div>
  </div>

  <div id="comm-list" class="comm-list"><div class="comm-loading">Loading discussions…</div></div>

  ${signedIn ? '' : `<div class="comm-signin-note">Browsing as a guest. <button class="comm-inline-link" onclick="OmicsLab.AuthClerk.signIn()">Sign in</button> to post, reply, or react.</div>`}
</div>`;

    _fetchTopics().then(() => {
      const list = document.getElementById('comm-list');
      if (!list) return;
      list.innerHTML = _topics.length
        ? _topics.map(_topicCardHtml).join('')
        : '<div class="comm-empty">No discussions yet in this category — be the first to start one.</div>';
    });
  }

  /* ── Render: topic detail ── */
  function _commentHtml(c, byId) {
    const author = c.users?.name || 'OmicsLab Member';
    const avatar = c.users?.avatar_url;
    const reacted = (c.reacted_by || []).includes(OmicsLab.AuthClerk?.getUser?.()?.id);
    const replies = _comments.filter(r => r.parent_comment_id === c.id);
    return `
<div class="comm-comment" id="comm-c-${c.id}">
  <span class="comm-avatar comm-avatar-sm">${avatar ? `<img src="${avatar}" alt="">` : _initials(author)}</span>
  <div class="comm-comment-body">
    <div class="comm-comment-meta"><strong>${_esc(author)}</strong><span class="comm-dot">·</span>${_relTime(c.created_at)}</div>
    <p class="comm-comment-text">${_esc(c.body)}</p>
    <div class="comm-comment-actions">
      <button class="comm-react-mini" onclick="OmicsLab.Community.react('comment','${c.id}')">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="${reacted ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
        ${(c.reacted_by || []).length}
      </button>
      <button class="comm-reply-mini" onclick="OmicsLab.Community.toggleReplyBox('${c.id}')">Reply</button>
    </div>
    <div class="comm-reply-box" id="comm-reply-${c.id}" style="display:none"></div>
    ${replies.length ? `<div class="comm-replies-nested">${replies.map(r => _commentHtml(r)).join('')}</div>` : ''}
  </div>
</div>`;
  }

  function _renderDetail(topic) {
    const el = document.getElementById('community-section');
    if (!el) return;
    const author = topic.users?.name || 'OmicsLab Member';
    const avatar = topic.users?.avatar_url;
    const reacted = (topic.reacted_by || []).includes(OmicsLab.AuthClerk?.getUser?.()?.id);
    const catMeta = CATS.find(c => c.id === topic.category) || CATS[1];
    const signedIn = !!OmicsLab.AuthClerk?.isSignedIn?.();
    const topLevel = _comments.filter(c => !c.parent_comment_id);

    el.innerHTML = `
<div class="comm-wrap">
  <button class="comm-back-btn" onclick="OmicsLab.Community.backToList()">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
    Back to Discussions
  </button>

  <div class="comm-detail-card">
    <div class="comm-card-vote comm-card-vote-lg" onclick="OmicsLab.Community.react('topic','${topic.id}')">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="${reacted ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
      <span>${(topic.reacted_by || []).length}</span>
    </div>
    <div>
      <span class="comm-cat-tag" data-cat="${topic.category}">${catMeta.label}</span>
      <h1 class="comm-detail-title">${_esc(topic.title)}</h1>
      <div class="comm-card-meta">
        <span class="comm-avatar">${avatar ? `<img src="${avatar}" alt="">` : _initials(author)}</span>
        <span class="comm-author">${_esc(author)}</span>
        <span class="comm-dot">·</span>
        <span class="comm-time">Posted ${_relTime(topic.created_at)}</span>
      </div>
      <p class="comm-detail-body">${_esc(topic.body)}</p>
    </div>
  </div>

  <div class="comm-comments-head">${_comments.length} Comment${_comments.length === 1 ? '' : 's'}</div>

  ${signedIn ? `
  <div class="comm-composer">
    <textarea id="comm-new-comment" class="comm-composer-ta" rows="3" placeholder="Share your thoughts or answer this question…"></textarea>
    <button class="comm-composer-btn" onclick="OmicsLab.Community.submitComment('${topic.id}', null)">Post Comment</button>
  </div>` : `<div class="comm-signin-note">Please <button class="comm-inline-link" onclick="OmicsLab.AuthClerk.signIn()">sign in</button> to reply to this topic.</div>`}

  <div id="comm-thread" class="comm-thread">
    ${topLevel.length ? topLevel.map(c => _commentHtml(c)).join('') : '<div class="comm-empty">No comments yet — start the conversation.</div>'}
  </div>
</div>`;
  }

  /* ── Public: navigation ── */
  async function openTopic(id) {
    const topic = _topics.find(t => t.id === id);
    if (!topic) return;
    _activeTopic = topic;
    await _fetchComments(id);
    _renderDetail(topic);
  }

  function backToList() { _activeTopic = null; _renderList(); }

  function onCat(id) { _cat = id; _renderList(); }
  function onSort(id) { _sort = id; _renderList(); }

  /* ── Public: react ── */
  async function react(targetType, targetId) {
    const headers = await _authHeader();
    if (!headers) { OmicsLab.AuthClerk?.signIn?.(); return; }
    try {
      const res = await fetch('/api/forum-react', {
        method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetType, targetId }),
      });
      if (!res.ok) return;
      const { reacted } = await res.json();
      const myId = OmicsLab.AuthClerk?.getUser?.()?.id;
      if (targetType === 'topic') {
        const t = _topics.find(x => x.id === targetId) || (_activeTopic?.id === targetId ? _activeTopic : null);
        if (t) {
          t.reacted_by = reacted ? [...(t.reacted_by || []).filter(id => id !== myId), myId] : (t.reacted_by || []).filter(id => id !== myId);
          if (_activeTopic?.id === targetId) _activeTopic.reacted_by = t.reacted_by;
        }
        _activeTopic ? _renderDetail(_activeTopic) : _renderList();
      } else {
        const c = _comments.find(x => x.id === targetId);
        if (c) c.reacted_by = reacted ? [...(c.reacted_by || []).filter(id => id !== myId), myId] : (c.reacted_by || []).filter(id => id !== myId);
        _renderDetail(_activeTopic);
      }
    } catch {}
  }

  /* ── Public: new topic composer ── */
  function openComposer() {
    if (!OmicsLab.AuthClerk?.isSignedIn?.()) { OmicsLab.AuthClerk?.signIn?.(); return; }
    let overlay = document.getElementById('comm-composer-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'comm-composer-overlay';
      overlay.className = 'comm-modal-overlay';
      overlay.onclick = e => { if (e.target === overlay) overlay.remove(); };
      document.body.appendChild(overlay);
    }
    overlay.innerHTML = `
<div class="comm-modal">
  <div class="comm-modal-head">
    <strong>Start a new discussion</strong>
    <button class="comm-modal-close" onclick="document.getElementById('comm-composer-overlay').remove()">×</button>
  </div>
  <select id="comm-new-cat" class="comm-modal-select">
    ${CATS.filter(c => c.id !== 'all').map(c => `<option value="${c.id}">${c.label}</option>`).join('')}
  </select>
  <input id="comm-new-title" class="comm-modal-input" type="text" maxlength="200" placeholder="Title — be specific">
  <textarea id="comm-new-body" class="comm-modal-textarea" rows="6" maxlength="5000" placeholder="Share details, context, or your question…"></textarea>
  <div class="comm-modal-actions">
    <button class="comm-modal-cancel" onclick="document.getElementById('comm-composer-overlay').remove()">Cancel</button>
    <button class="comm-modal-submit" onclick="OmicsLab.Community.submitTopic()">Post Topic</button>
  </div>
</div>`;
  }

  async function submitTopic() {
    const category = document.getElementById('comm-new-cat')?.value || 'general';
    const title = document.getElementById('comm-new-title')?.value.trim();
    const body = document.getElementById('comm-new-body')?.value.trim();
    if (!title || !body) return;
    const headers = await _authHeader();
    if (!headers) { OmicsLab.AuthClerk?.signIn?.(); return; }

    const res = await fetch('/api/forum-topics', {
      method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ category, title, body }),
    }).catch(() => null);

    document.getElementById('comm-composer-overlay')?.remove();
    if (res && res.ok) { _cat = 'all'; _sort = 'new'; _renderList(); }
  }

  /* ── Public: comments ── */
  function toggleReplyBox(commentId) {
    const box = document.getElementById('comm-reply-' + commentId);
    if (!box) return;
    if (box.style.display !== 'none') { box.style.display = 'none'; box.innerHTML = ''; return; }
    if (!OmicsLab.AuthClerk?.isSignedIn?.()) { OmicsLab.AuthClerk?.signIn?.(); return; }
    box.style.display = 'block';
    box.innerHTML = `
<textarea class="comm-composer-ta comm-composer-ta-sm" id="comm-reply-ta-${commentId}" rows="2" placeholder="Write a reply…"></textarea>
<button class="comm-composer-btn comm-composer-btn-sm" onclick="OmicsLab.Community.submitComment('${_activeTopic.id}', '${commentId}')">Reply</button>`;
  }

  async function submitComment(topicId, parentId) {
    const taId = parentId ? `comm-reply-ta-${parentId}` : 'comm-new-comment';
    const ta = document.getElementById(taId);
    const body = ta?.value.trim();
    if (!body) return;
    const headers = await _authHeader();
    if (!headers) { OmicsLab.AuthClerk?.signIn?.(); return; }

    const res = await fetch('/api/forum-comments', {
      method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic_id: topicId, body, parent_comment_id: parentId || null }),
    }).catch(() => null);

    if (res && res.ok) {
      await _fetchComments(topicId);
      if (_activeTopic) { _activeTopic.comment_count = _comments.length; _renderDetail(_activeTopic); }
    }
  }

  /* ── Init ── */
  function init() {
    const el = document.getElementById('community-section');
    if (!el || el.dataset.commReady) return;
    el.dataset.commReady = '1';
    _renderList();
  }

  return { init, onCat, onSort, openTopic, backToList, react, openComposer, submitTopic, toggleReplyBox, submitComment };
})();
