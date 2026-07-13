import { useState } from 'react';

function timeAgo(iso) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

const SNAPSHOT_LABELS = {
  title: 'Title',
  subtitle: 'Subtitle',
  description_md: 'Description',
  tags: 'Tags',
  license: 'License',
  category: 'Category',
  difficulty: 'Difficulty',
};

function VersionSnapshot({ snapshot }) {
  if (!snapshot) return null;
  return (
    <dl className="ds-version-snapshot">
      {Object.entries(SNAPSHOT_LABELS).map(([key, label]) => {
        const value = snapshot[key];
        if (value == null || value === '') return null;
        return (
          <div key={key} className="ds-version-snapshot-row">
            <dt>{label}</dt>
            <dd>{Array.isArray(value) ? value.join(', ') : String(value)}</dd>
          </div>
        );
      })}
      {snapshot.files?.length > 0 && (
        <div className="ds-version-snapshot-row">
          <dt>Files</dt>
          <dd>{snapshot.files.map((f) => f.filename).join(', ')}</dd>
        </div>
      )}
    </dl>
  );
}

export default function VersionHistory({ versions }) {
  const [expandedId, setExpandedId] = useState(null);

  if (!versions.length) return <p className="ol-sub">No version history yet.</p>;

  return (
    <ul className="ds-version-list">
      {versions.map((v) => {
        const expanded = expandedId === v.id;
        return (
          <li key={v.id} className="ds-version-item">
            <div className="ds-version-row">
              <div>
                <span className="ds-version-number">v{v.version_number}</span>
                <span className="ds-version-changelog">{v.changelog}</span>
              </div>
              <div className="ds-version-meta">
                <span className="ol-sub">{timeAgo(v.created_at)}</span>
                <button type="button" className="ol-btn-ghost" onClick={() => setExpandedId(expanded ? null : v.id)}>
                  {expanded ? 'Hide' : 'View metadata'}
                </button>
              </div>
            </div>
            {expanded && <VersionSnapshot snapshot={v.metadata_snapshot} />}
          </li>
        );
      })}
    </ul>
  );
}
