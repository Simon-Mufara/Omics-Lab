import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';
import Avatar from './Avatar.jsx';
import { getChallengeLeaderboard, getMySubmissions, scoreChallenge, uploadSubmissionFile } from '../lib/learningApi.js';

const METRIC_LABELS = { accuracy: 'Accuracy', f1: 'F1 score', rmse: 'RMSE (lower is better)', auc: 'AUC' };

function fmtScore(score, metric) {
  if (score == null) return '—';
  return metric === 'rmse' ? Number(score).toFixed(3) : `${(Number(score) * 100).toFixed(1)}%`;
}

export default function ChallengePanel({ challenge, currentUser, isSignedIn }) {
  const { getToken } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [mySubmissions, setMySubmissions] = useState([]);
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState(null); // { kind: 'error'|'success', message }
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    const [{ data: lb }, { data: subs }] = await Promise.all([
      getChallengeLeaderboard(challenge.id),
      getMySubmissions(challenge.id, currentUser?.id),
    ]);
    setLeaderboard(lb);
    setMySubmissions(subs);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [challenge.id, currentUser?.id]);

  async function handleSubmit() {
    if (!file || submitting) return;
    setSubmitting(true);
    setStatus(null);

    const { path, error: uploadErr } = await uploadSubmissionFile(challenge.id, currentUser.id, file);
    if (uploadErr) {
      setStatus({ kind: 'error', message: `Upload failed: ${uploadErr.message}` });
      setSubmitting(false);
      return;
    }

    const { data, error: scoreErr } = await scoreChallenge(getToken, challenge.id, path);
    setSubmitting(false);
    if (scoreErr) {
      setStatus({ kind: 'error', message: scoreErr.message });
      return;
    }
    setStatus({ kind: 'success', message: `Scored ${fmtScore(data.score, challenge.metric)} (${METRIC_LABELS[challenge.metric]}) across ${data.matchedRows} rows.` });
    setFile(null);
    await load();
  }

  const deadlinePassed = challenge.deadline && new Date(challenge.deadline) < new Date();

  return (
    <div className="challenge-panel">
      <div className="challenge-head">
        <h3 className="ds-section-title" style={{ margin: 0 }}>
          {challenge.title}
        </h3>
        <span className="ds-badge">{METRIC_LABELS[challenge.metric] || challenge.metric}</span>
      </div>
      {challenge.description_md && (
        <div className="ds-description">
          {challenge.description_md.split('\n').map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
      )}
      {challenge.deadline && <p className="ol-sub">Deadline: {new Date(challenge.deadline).toLocaleString()}</p>}

      {isSignedIn ? (
        <div className="challenge-submit">
          <input type="file" accept=".csv" onChange={(e) => setFile(e.target.files?.[0] || null)} disabled={deadlinePassed} />
          <button type="button" className="ol-btn-primary" onClick={handleSubmit} disabled={!file || submitting || deadlinePassed}>
            {submitting ? 'Scoring…' : 'Submit predictions'}
          </button>
          {deadlinePassed && <p className="ol-sub">This challenge's deadline has passed.</p>}
          {status && <div className={status.kind === 'error' ? 'ol-error' : 'ol-success'}>{status.message}</div>}
        </div>
      ) : (
        <p className="ol-sub">
          <Link to="/sign-in">Sign in</Link> to submit predictions.
        </p>
      )}

      {mySubmissions.length > 0 && (
        <div className="challenge-history">
          <div className="learn-subhead">Your submissions</div>
          <ul>
            {mySubmissions.map((s) => (
              <li key={s.id}>
                {fmtScore(s.score, challenge.metric)} · {new Date(s.created_at).toLocaleString()}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="challenge-leaderboard">
        <div className="learn-subhead">Leaderboard</div>
        {leaderboard.length === 0 ? (
          <p className="ol-sub">No submissions yet — be the first.</p>
        ) : (
          <table className="ds-preview-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>User</th>
                <th>Best score</th>
                <th>Submissions</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((row) => (
                <tr key={row.user_id} className={row.user_id === currentUser?.id ? 'challenge-row-self' : ''}>
                  <td>#{row.rank}</td>
                  <td>
                    <span className="ds-comment-author">
                      <Avatar src={row.avatar_url} name={row.display_name} size="sm" />
                      {row.username ? <Link to={`/u/${row.username}`}>@{row.username}</Link> : '—'}
                    </span>
                  </td>
                  <td>{fmtScore(row.best_score, challenge.metric)}</td>
                  <td>{row.submission_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
