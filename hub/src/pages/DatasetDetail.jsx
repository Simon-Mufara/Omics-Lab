import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Avatar from '../components/Avatar.jsx';
import { supabase } from '../lib/supabaseClient.js';
import {
  CATEGORY_LABELS,
  formatBytes,
  getDatasetBySlug,
  getDatasetFiles,
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
  if (!rows || !rows.length) return <p className="ol-sub">No preview available for this file.</p>;
  const columns = Object.keys(rows[0]);
  return (
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
          {rows.map((row, i) => (
            <tr key={i}>
              {columns.map((c) => (
                <td key={c}>{row[c] === null || row[c] === undefined ? '—' : String(row[c])}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DatasetFile({ file, datasetId }) {
  const [expanded, setExpanded] = useState(false);

  async function handleDownload() {
    await logDatasetEvent(datasetId, 'download');
    if (file.storage_path) {
      const { data } = supabase.storage.from('datasets').getPublicUrl(file.storage_path);
      if (data?.publicUrl) window.open(data.publicUrl, '_blank', 'noopener');
    }
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
          <button type="button" className="ol-btn-primary" onClick={handleDownload}>
            Download
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

export default function DatasetDetail() {
  const { slug } = useParams();
  const [dataset, setDataset] = useState(undefined); // undefined = loading, null = not found
  const [files, setFiles] = useState([]);
  const [owner, setOwner] = useState(null);
  const [error, setError] = useState(null);
  const viewLogged = useRef(false);

  useEffect(() => {
    let cancelled = false;
    setDataset(undefined);
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

      const [{ data: fileRows }, ownerMap] = await Promise.all([
        getDatasetFiles(data.id),
        getOwnersByIds([data.owner_id]),
      ]);
      if (cancelled) return;
      setFiles(fileRows);
      setOwner(ownerMap[data.owner_id] || null);

      if (!viewLogged.current) {
        viewLogged.current = true;
        logDatasetEvent(data.id, 'view');
      }
    });
    return () => {
      cancelled = true;
    };
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

      <h2 className="ds-section-title">Files</h2>
      <div className="ds-file-list">
        {files.map((f) => (
          <DatasetFile key={f.id} file={f} datasetId={dataset.id} />
        ))}
      </div>
    </div>
  );
}
