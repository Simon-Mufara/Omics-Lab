import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Avatar from '../components/Avatar.jsx';
import ColumnCard from '../components/ColumnCard.jsx';
import ActivityCharts from '../components/ActivityCharts.jsx';
import VersionHistory from '../components/VersionHistory.jsx';
import DatasetComments from '../components/DatasetComments.jsx';
import {
  CATEGORY_LABELS,
  downloadDatasetFile,
  formatBytes,
  getDatasetActivity,
  getDatasetBySlug,
  getDatasetColumns,
  getDatasetFiles,
  getDatasetVersions,
  getOwnersByIds,
  logDatasetEvent,
} from '../lib/datasetsApi.js';

const RUBRIC_LABELS = {
  has_description: 'Has a description',
  has_column_docs: 'Has column-level documentation',
  has_license: 'Has a license',
  has_tags: 'Has tags',
  has_preview: 'Has a data preview',
  parses_cleanly: 'Files parse cleanly',
};

const PREVIEW_PAGE_SIZE = 10;

function UsabilityBreakdown({ score, components }) {
  return (
    <div className="ds-usability">
      <div className="ds-usability-score">★ {Number(score).toFixed(1)}/10</div>
      <ul className="ds-usability-list">
        {Object.entries(RUBRIC_LABELS).map(([key, label]) => (
          <li key={key} className={components?.[key] ? 'ds-rubric-hit' : 'ds-rubric-miss'}>
            {components?.[key] ? '✓' : '✗'} {label}
          </li>
        ))}
      </ul>
    </div>
  );
}

function FilePreview({ file }) {
  const rows = file.preview_json;
  const [page, setPage] = useState(0);
  if (!rows || !rows.length) return <p className="ol-sub">No preview available for this file.</p>;

  const columns = Object.keys(rows[0]);
  const pageCount = Math.ceil(rows.length / PREVIEW_PAGE_SIZE);
  const start = page * PREVIEW_PAGE_SIZE;
  const pageRows = rows.slice(start, start + PREVIEW_PAGE_SIZE);

  return (
    <div>
      <div className="ds-preview-scroll">
        <table className="ds-preview-table">
          <thead>
            <tr>
              {columns.map((c) => (
                <th key={c}>{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.map((row, i) => (
              <tr key={start + i}>
                {columns.map((c) => (
                  <td key={c}>{row[c] === null || row[c] === undefined ? '—' : String(row[c])}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pageCount > 1 && (
        <div className="ds-preview-pagination">
          <button type="button" className="ol-btn-ghost" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
            ← Prev
          </button>
          <span className="ol-sub">
            Rows {start + 1}–{Math.min(start + PREVIEW_PAGE_SIZE, rows.length)} of {rows.length}
          </span>
          <button type="button" className="ol-btn-ghost" disabled={page >= pageCount - 1} onClick={() => setPage((p) => p + 1)}>
            Next →
          </button>
        </div>
      )}
    </div>
  );
}

function DatasetFile({ file, datasetId, userId }) {
  const [expanded, setExpanded] = useState(false);
  const [downloading, setDownloading] = useState(false);

  async function handleDownload() {
    if (!file.storage_path || downloading) return;
    setDownloading(true);
    const { error } = await downloadDatasetFile(file.storage_path, file.filename);
    if (!error) await logDatasetEvent(datasetId, 'download', userId);
    setDownloading(false);
  }

  return (
    <div className="ds-file">
      <div className="ds-file-row">
        <div>
          <div className="ds-file-name">{file.filename}</div>
          <div className="ol-sub">
            {formatBytes(file.size_bytes)}
            {file.row_count ? ` · ${file.row_count.toLocaleString()} rows` : ''}
            {file.column_count ? ` · ${file.column_count} columns` : ''}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button type="button" className="ol-btn-ghost" onClick={() => setExpanded((v) => !v)}>
            {expanded ? 'Hide preview' : 'Preview'}
          </button>
          <button type="button" className="ol-btn-primary" onClick={handleDownload} disabled={!file.storage_path || downloading}>
            {downloading ? 'Downloading…' : 'Download'}
          </button>
        </div>
      </div>
      {expanded && (
        <div className="ds-file-expanded">
          {file.columns_doc?.length > 0 && (
            <table className="ds-coldoc-table">
              <thead>
                <tr>
                  <th>Column</th>
                  <th>Type</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {file.columns_doc.map((c) => (
                  <tr key={c.name}>
                    <td>
                      <code>{c.name}</code>
                    </td>
                    <td>{c.type}</td>
                    <td>{c.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <FilePreview file={file} />
        </div>
      )}
    </div>
  );
}

export default function DatasetDetail({ profile, isSignedIn }) {
  const { slug } = useParams();
  const [dataset, setDataset] = useState(undefined); // undefined = loading, null = not found
  const [files, setFiles] = useState([]);
  const [owner, setOwner] = useState(null);
  const [columns, setColumns] = useState([]);
  const [versions, setVersions] = useState([]);
  const [activity, setActivity] = useState([]);
  const [error, setError] = useState(null);
  const viewLogged = useRef(false);

  useEffect(() => {
    let cancelled = false;
    setDataset(undefined);
    viewLogged.current = false;
    getDatasetBySlug(slug).then(async ({ data, error: err }) => {
      if (cancelled) return;
      if (err) {
        setError(err);
        setDataset(null);
        return;
      }
      if (!data) {
        setDataset(null);
        return;
      }
      setDataset(data);

      const [{ data: fileRows }, ownerMap, { data: columnRows }, { data: versionRows }, { data: activityRows }] = await Promise.all([
        getDatasetFiles(data.id),
        getOwnersByIds([data.owner_id]),
        getDatasetColumns(data.id),
        getDatasetVersions(data.id),
        getDatasetActivity(data.id),
      ]);
      if (cancelled) return;
      setFiles(fileRows);
      setOwner(ownerMap[data.owner_id] || null);
      setColumns(columnRows);
      setVersions(versionRows);
      setActivity(activityRows);

      if (!viewLogged.current) {
        viewLogged.current = true;
        logDatasetEvent(data.id, 'view', profile?.id || null);
      }
    });
    return () => {
      cancelled = true;
    };
    // profile.id is intentionally excluded — logging the view once per
    // mount is enough; a profile finishing its own async load shouldn't
    // re-trigger the dataset fetch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  if (dataset === undefined) {
    return (
      <div className="ol-page ol-center">
        <div className="ol-spinner" aria-label="Loading" />
      </div>
    );
  }

  if (dataset === null) {
    return (
      <div className="ol-page ol-center">
        <div className="ol-error">{error ? `Couldn't load this dataset: ${error.message}` : 'Dataset not found.'}</div>
        <Link to="/datasets" className="ol-btn-ghost" style={{ marginTop: '1rem' }}>
          ← Back to Dataset Hub
        </Link>
      </div>
    );
  }

  return (
    <div className="ol-page ds-detail">
      <Link to="/datasets" className="ol-nav-link" style={{ marginBottom: '1rem', display: 'inline-block' }}>
        ← Back to Dataset Hub
      </Link>

      <div className="ds-detail-head">
        <div>
          <span className="ds-card-category">{CATEGORY_LABELS[dataset.category] || dataset.category}</span>
          <h1 className="ol-title">{dataset.title}</h1>
          {dataset.subtitle && <p className="ol-sub">{dataset.subtitle}</p>}
          <div className="ds-card-owner" style={{ marginTop: '0.5rem' }}>
            {owner ? (
              <>
                <Avatar src={owner.avatar_url} name={owner.display_name || owner.name} size="sm" />
                <span>@{owner.username}</span>
              </>
            ) : (
              <span className="ds-card-official">OmicsLab Team</span>
            )}
          </div>
          <div className="ds-detail-actions">
            <button
              type="button"
              className="ol-btn-ghost"
              disabled
              title="Coming soon — opens this dataset directly in the Lab workflow"
            >
              Open in Lab
            </button>
          </div>
        </div>
        <UsabilityBreakdown score={dataset.usability_score} components={dataset.usability_components} />
      </div>

      <div className="ds-detail-stats">
        <span>{dataset.difficulty}</span>
        <span>{dataset.license || 'License not specified'}</span>
        <span>{dataset.view_count.toLocaleString()} views</span>
        <span>{dataset.download_count.toLocaleString()} downloads</span>
        {dataset.has_starter_exercise && <span className="ds-badge">Starter exercise available</span>}
      </div>

      {dataset.tags?.length > 0 && (
        <div className="ds-card-tags" style={{ margin: '1rem 0' }}>
          {dataset.tags.map((t) => (
            <span key={t} className="ds-tag">
              {t}
            </span>
          ))}
        </div>
      )}

      <h2 className="ds-section-title">About this dataset</h2>
      {dataset.description_md && (
        <div className="ds-description">
          {dataset.description_md.split('\n').map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
      )}

      {dataset.external_download_url && (
        <div className="ol-error" style={{ color: 'var(--ol-text-muted)', borderColor: 'var(--ol-border)', background: 'var(--ol-surface)' }}>
          Full-size files for this dataset are hosted externally:{' '}
          <a href={dataset.external_download_url} target="_blank" rel="noopener noreferrer">
            {dataset.external_download_url}
          </a>
        </div>
      )}

      {columns.length > 0 && (
        <>
          <h2 className="ds-section-title">Columns</h2>
          <div className="ds-col-grid">
            {columns.map((c) => (
              <ColumnCard key={c.id} column={c} />
            ))}
          </div>
        </>
      )}

      <h2 className="ds-section-title">Data Explorer</h2>
      <div className="ds-file-list">
        {files.map((f) => (
          <DatasetFile key={f.id} file={f} datasetId={dataset.id} userId={profile?.id || null} />
        ))}
      </div>

      <h2 className="ds-section-title">Activity Overview</h2>
      <ActivityCharts activity={activity} viewCount={dataset.view_count} downloadCount={dataset.download_count} />

      <h2 className="ds-section-title">Version history</h2>
      <VersionHistory versions={versions} />

      <h2 className="ds-section-title">Discussion</h2>
      <DatasetComments datasetId={dataset.id} currentUser={profile} isSignedIn={isSignedIn} />
    </div>
  );
}
