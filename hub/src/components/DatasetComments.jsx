import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Avatar from './Avatar.jsx';
import { deleteDatasetComment, getDatasetComments, getOwnersByIds, postDatasetComment } from '../lib/datasetsApi.js';

function timeAgo(iso) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function CommentAuthor({ user }) {
  return (
    <span className="ds-comment-author">
      <Avatar src={user?.avatar_url} name={user?.display_name || user?.name} size="sm" />
      {user?.username ? <Link to={`/u/${user.username}`}>@{user.username}</Link> : <span>deleted user</span>}
    </span>
  );
}

function CommentComposer({ placeholder, onSubmit, onCancel, autoFocus }) {
  const [body, setBody] = useState('');
  const [posting, setPosting] = useState(false);

  async function submit() {
    const trimmed = body.trim();
    if (!trimmed || posting) return;
    setPosting(true);
    await onSubmit(trimmed);
    setPosting(false);
    setBody('');
  }

  return (
    <div className="ds-comment-composer">
      <textarea
        className="ol-textarea"
        rows={2}
        placeholder={placeholder}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        autoFocus={autoFocus}
        maxLength={2000}
      />
      <div className="ds-comment-composer-actions">
        {onCancel && (
          <button type="button" className="ol-btn-ghost" onClick={onCancel}>
            Cancel
          </button>
        )}
        <button type="button" className="ol-btn-primary" onClick={submit} disabled={!body.trim() || posting}>
          {posting ? 'Posting…' : 'Post'}
        </button>
      </div>
    </div>
  );
}

export default function DatasetComments({ datasetId, currentUser, isSignedIn }) {
  const [comments, setComments] = useState(null);
  const [owners, setOwners] = useState({});
  const [replyingTo, setReplyingTo] = useState(null);
  const [error, setError] = useState(null);

  async function load() {
    const { data, error: err } = await getDatasetComments(datasetId);
    if (err) {
      setError(err);
      return;
    }
    setComments(data);
    const ownerMap = await getOwnersByIds(data.map((c) => c.user_id));
    setOwners(ownerMap);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [datasetId]);

  async function handlePost(body, parentId) {
    const { error: err } = await postDatasetComment(datasetId, currentUser.id, body, parentId);
    if (err) {
      setError(err);
      return;
    }
    setReplyingTo(null);
    await load();
  }

  async function handleDelete(commentId) {
    await deleteDatasetComment(commentId);
    await load();
  }

  if (comments === null) return <p className="ol-sub">Loading comments…</p>;

  const topLevel = comments.filter((c) => !c.parent_id);
  const repliesByParent = comments.reduce((acc, c) => {
    if (c.parent_id) (acc[c.parent_id] ||= []).push(c);
    return acc;
  }, {});

  return (
    <div className="ds-comments">
      {error && <div className="ol-error">Couldn't load comments: {error.message}</div>}

      {isSignedIn ? (
        <CommentComposer placeholder="Ask a question or share a note about this dataset…" onSubmit={(body) => handlePost(body, null)} />
      ) : (
        <p className="ol-sub">
          <Link to="/sign-in">Sign in</Link> to join the discussion.
        </p>
      )}

      {topLevel.length === 0 && <p className="ol-sub" style={{ marginTop: '1rem' }}>No comments yet — be the first.</p>}

      <ul className="ds-comment-list">
        {topLevel.map((c) => (
          <li key={c.id} className="ds-comment">
            <div className="ds-comment-head">
              <CommentAuthor user={owners[c.user_id]} />
              <span className="ol-sub">{timeAgo(c.created_at)}</span>
            </div>
            <p className="ds-comment-body">{c.body}</p>
            <div className="ds-comment-actions">
              {isSignedIn && (
                <button type="button" className="ds-comment-action" onClick={() => setReplyingTo(replyingTo === c.id ? null : c.id)}>
                  Reply
                </button>
              )}
              {currentUser?.id === c.user_id && (
                <button type="button" className="ds-comment-action ds-comment-action-danger" onClick={() => handleDelete(c.id)}>
                  Delete
                </button>
              )}
            </div>

            {replyingTo === c.id && (
              <CommentComposer
                placeholder={`Reply to @${owners[c.user_id]?.username || 'this comment'}…`}
                onSubmit={(body) => handlePost(body, c.id)}
                onCancel={() => setReplyingTo(null)}
                autoFocus
              />
            )}

            {repliesByParent[c.id]?.length > 0 && (
              <ul className="ds-comment-replies">
                {repliesByParent[c.id].map((r) => (
                  <li key={r.id} className="ds-comment ds-comment-reply">
                    <div className="ds-comment-head">
                      <CommentAuthor user={owners[r.user_id]} />
                      <span className="ol-sub">{timeAgo(r.created_at)}</span>
                    </div>
                    <p className="ds-comment-body">{r.body}</p>
                    {currentUser?.id === r.user_id && (
                      <div className="ds-comment-actions">
                        <button type="button" className="ds-comment-action ds-comment-action-danger" onClick={() => handleDelete(r.id)}>
                          Delete
                        </button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
