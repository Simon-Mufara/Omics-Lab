import { useRef, useState } from 'react';
import Avatar from '../Avatar.jsx';
import { searchUsers } from '../../lib/userSearchApi.js';

const MENTION_DEBOUNCE_MS = 200;

export default function Composer({ onSend }) {
  const [body, setBody] = useState('');
  const [mentionQuery, setMentionQuery] = useState(null); // null = no active mention
  const [mentionResults, setMentionResults] = useState([]);
  const [sending, setSending] = useState(false);
  const debounceRef = useRef(null);
  const textareaRef = useRef(null);

  function handleChange(e) {
    const value = e.target.value;
    setBody(value);

    const caret = e.target.selectionStart;
    const upToCaret = value.slice(0, caret);
    const match = upToCaret.match(/(?:^|\s)@([a-z0-9_]{0,30})$/i);
    if (match) {
      const q = match[1];
      setMentionQuery(q);
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(async () => {
        const { data } = await searchUsers({ q, limit: 6 });
        setMentionResults(data);
      }, MENTION_DEBOUNCE_MS);
    } else {
      setMentionQuery(null);
      setMentionResults([]);
    }
  }

  function insertMention(username) {
    const textarea = textareaRef.current;
    const caret = textarea.selectionStart;
    const upToCaret = body.slice(0, caret);
    const replaced = upToCaret.replace(/@([a-z0-9_]{0,30})$/i, `@${username} `);
    const newBody = replaced + body.slice(caret);
    setBody(newBody);
    setMentionQuery(null);
    setMentionResults([]);
    requestAnimationFrame(() => textarea.focus());
  }

  async function handleSend() {
    const trimmed = body.trim();
    if (!trimmed || sending) return;
    setSending(true);
    await onSend(trimmed);
    setSending(false);
    setBody('');
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (mentionQuery === null) handleSend();
    }
  }

  return (
    <div className="chat-composer">
      {mentionQuery !== null && mentionResults.length > 0 && (
        <div className="chat-mention-dropdown">
          {mentionResults.map((u) => (
            <button key={u.id} type="button" className="chat-mention-item" onMouseDown={(e) => e.preventDefault()} onClick={() => insertMention(u.username)}>
              <Avatar src={u.avatar_url} name={u.display_name} size="sm" />@{u.username}
            </button>
          ))}
        </div>
      )}
      <textarea
        ref={textareaRef}
        className="ol-textarea chat-composer-input"
        rows={1}
        placeholder="Message… (Enter to send, Shift+Enter for a new line)"
        value={body}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
      />
      <button type="button" className="ol-btn-primary" onClick={handleSend} disabled={!body.trim() || sending}>
        Send
      </button>
    </div>
  );
}
