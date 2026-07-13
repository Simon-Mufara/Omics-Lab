import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Avatar from '../Avatar.jsx';

function dayLabel(iso) {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
}

function timeLabel(iso) {
  return new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

function MessageRow({ message, author, isOwn, onEdit, onDelete, onReport, online }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(message.body);
  const [menuOpen, setMenuOpen] = useState(false);

  function submitEdit() {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== message.body) onEdit(message.id, trimmed);
    setEditing(false);
  }

  return (
    <div className="chat-message">
      <div className="chat-avatar-wrap">
        <Avatar src={author?.avatar_url} name={author?.display_name || author?.name} size="sm" />
        {online && <span className="chat-presence-dot" title="Online" />}
      </div>
      <div className="chat-message-body">
        <div className="chat-message-head">
          {author?.username ? (
            <Link to={`/u/${author.username}`} className="chat-message-author">
              @{author.username}
            </Link>
          ) : (
            <span className="chat-message-author">deleted user</span>
          )}
          <span className="ol-sub">{timeLabel(message.created_at)}</span>
          {message.edited_at && <span className="ol-sub">(edited)</span>}
        </div>
        {editing ? (
          <div className="chat-edit-row">
            <input className="ol-input" value={draft} onChange={(e) => setDraft(e.target.value)} autoFocus />
            <button type="button" className="ol-btn-ghost" onClick={submitEdit}>
              Save
            </button>
            <button type="button" className="ol-btn-ghost" onClick={() => setEditing(false)}>
              Cancel
            </button>
          </div>
        ) : (
          <p className="chat-message-text">{message.body}</p>
        )}
      </div>
      <div className="chat-message-menu-wrap">
        <button type="button" className="chat-message-menu-btn" onClick={() => setMenuOpen((v) => !v)} aria-label="Message actions">
          ⋯
        </button>
        {menuOpen && (
          <div className="chat-message-menu">
            {isOwn ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setEditing(true);
                    setMenuOpen(false);
                  }}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="chat-message-menu-danger"
                  onClick={() => {
                    onDelete(message.id);
                    setMenuOpen(false);
                  }}
                >
                  Delete
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => {
                  onReport(message.id);
                  setMenuOpen(false);
                }}
              >
                Report
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function MessageList({ messages, usersById, currentUserId, onlineIds, onEdit, onDelete, onReport }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' });
  }, [messages.length]);

  let lastDay = null;

  return (
    <div className="chat-message-list">
      {messages.length === 0 && <p className="ol-sub" style={{ padding: '1rem' }}>No messages yet — say hello.</p>}
      {messages.map((m) => {
        const day = dayLabel(m.created_at);
        const showDaySeparator = day !== lastDay;
        lastDay = day;
        return (
          <div key={m.id}>
            {showDaySeparator && (
              <div className="chat-day-separator">
                <span>{day}</span>
              </div>
            )}
            <MessageRow
              message={m}
              author={usersById[m.user_id]}
              isOwn={m.user_id === currentUserId}
              onEdit={onEdit}
              onDelete={onDelete}
              onReport={onReport}
              online={onlineIds.has(m.user_id)}
            />
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}
