import { Link } from 'react-router-dom';
import Avatar from './Avatar.jsx';
import { CATEGORY_LABELS, formatBytes } from '../lib/datasetsApi.js';

const DIFFICULTY_COLOR = {
  beginner: '#00c4a0',
  intermediate: '#e3b341',
  advanced: '#ff6b6b',
};

export default function DatasetCard({ dataset, owner }) {
  const ownerName = owner?.display_name || owner?.name || null;

  return (
    <Link to={`/datasets/${dataset.slug}`} className="ds-card">
      <div className="ds-card-top">
        <span className="ds-badge" style={{ color: DIFFICULTY_COLOR[dataset.difficulty], borderColor: DIFFICULTY_COLOR[dataset.difficulty] }}>
          {dataset.difficulty}
        </span>
        <span className="ds-card-category">{CATEGORY_LABELS[dataset.category] || dataset.category}</span>
      </div>

      <h3 className="ds-card-title">{dataset.title}</h3>
      {dataset.subtitle && <p className="ds-card-subtitle">{dataset.subtitle}</p>}

      <div className="ds-card-owner">
        {owner ? (
          <>
            <Avatar src={owner.avatar_url} name={ownerName} size="sm" />
            <span>@{owner.username}</span>
          </>
        ) : (
          <span className="ds-card-official">OmicsLab Team</span>
        )}
      </div>

      {dataset.tags?.length > 0 && (
        <div className="ds-card-tags">
          {dataset.tags.slice(0, 4).map((t) => (
            <span key={t} className="ds-tag">
              {t}
            </span>
          ))}
        </div>
      )}

      <div className="ds-card-stats">
        <span title="Files / total size">
          {dataset.file_count} file{dataset.file_count === 1 ? '' : 's'} · {formatBytes(dataset.total_size_bytes)}
        </span>
        <span title="Usability score">★ {Number(dataset.usability_score).toFixed(1)}/10</span>
      </div>
      <div className="ds-card-stats ds-card-stats-secondary">
        <span>{dataset.view_count.toLocaleString()} views</span>
        <span>{dataset.download_count.toLocaleString()} downloads</span>
      </div>
    </Link>
  );
}

export function DatasetCardSkeleton() {
  return (
    <div className="ds-card ds-card-skeleton" aria-hidden="true">
      <div className="ol-skel" style={{ width: '40%', height: 18 }} />
      <div className="ol-skel" style={{ width: '80%', height: 22, marginTop: 10 }} />
      <div className="ol-skel" style={{ width: '95%', height: 14, marginTop: 10 }} />
      <div className="ol-skel" style={{ width: '60%', height: 14, marginTop: 6 }} />
      <div className="ol-skel" style={{ width: '50%', height: 24, marginTop: 14 }} />
    </div>
  );
}
