import { NavLink } from 'react-router-dom';
import Avatar from '../Avatar.jsx';

export default function ChatSidebar({ channels, conversations, unread }) {
  return (
    <aside className="chat-sidebar">
      <div className="chat-sidebar-section">
        <div className="chat-sidebar-label">Channels</div>
        <ul className="chat-sidebar-list">
          {channels.map((c) => (
            <li key={c.id}>
              <NavLink to={`/chat/c/${c.slug}`} className={({ isActive }) => `chat-sidebar-item ${isActive ? 'chat-sidebar-item-active' : ''}`}>
                <span># {c.slug}</span>
                {unread.channels.has(c.id) && <span className="chat-unread-dot" />}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>

      <div className="chat-sidebar-section">
        <div className="chat-sidebar-label">Direct messages</div>
        {conversations.length === 0 ? (
          <p className="ol-sub" style={{ padding: '0 0.6rem' }}>
            No conversations yet.
          </p>
        ) : (
          <ul className="chat-sidebar-list">
            {conversations.map((c) => (
              <li key={c.id}>
                <NavLink to={`/chat/dm/${c.id}`} className={({ isActive }) => `chat-sidebar-item ${isActive ? 'chat-sidebar-item-active' : ''}`}>
                  <Avatar src={c.otherUser?.avatar_url} name={c.otherUser?.display_name || c.otherUser?.name} size="sm" />
                  <span>{c.otherUser?.username ? `@${c.otherUser.username}` : 'Unknown user'}</span>
                  {unread.conversations.has(c.id) && <span className="chat-unread-dot" />}
                </NavLink>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}
