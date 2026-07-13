import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Avatar from '../components/Avatar.jsx';
import DatasetCard from '../components/DatasetCard.jsx';
import { getOrCreateDM } from '../lib/chatApi.js';
import {
  getPublicBadges,
  getPublicProfile,
  getPublicProfileActivity,
  getPublicProfileStats,
  getUserDatasets,
  profileExists,
} from '../lib/profilePublicApi.js';

const ROLE_LABELS = {
  student: 'Student',
  researcher: 'Researcher',
  instructor: 'Instructor',
  clinician: 'Clinician',
  bioinformatician: 'Bioinformatician',
  'public-health': 'Public Health',
};

const ACTIVITY_STATUS_LABEL = { viewed: 'viewed', started: 'started', completed: 'completed' };

function timeAgo(iso) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

function levelFromPoints(points) {
  return Math.floor(Math.sqrt(points || 0) / 5) + 1;
}

function StatTile({ value, label }) {
  return (
    <div className="profile-stat">
      <div className="profile-stat-value">{value ?? 0}</div>
      <div className="profile-stat-label">{label}</div>
    </div>
  );
}

function ActivityFeed({ activity }) {
  if (!activity.length) return <p className="ol-sub">No recent activity.</p>;
  return (
    <ul className="profile-activity-list">
      {activity.map((a, i) => (
        <li key={i} className="profile-activity-item">
          {a.activity_type === 'dataset_progress' ? (
            <span>
              {ACTIVITY_STATUS_LABEL[a.detail] || a.detail}{' '}
              <Link to={`/datasets/${a.dataset_slug}`}>{a.dataset_title}</Link>
            </span>
          ) : (
            <span>
              Scored {a.score != null ? Number(a.score).toFixed(3) : '—'} on{' '}
              <Link to={`/datasets/${a.dataset_slug}`}>{a.dataset_title}</Link> challenge
            </span>
          )}
          <span className="ol-sub"> · {timeAgo(a.occurred_at)}</span>
        </li>
      ))}
    </ul>
  );
}

function AchievementsTab({ badges, stats }) {
  const level = levelFromPoints(stats?.total_points);
  return (
    <div>
      <div className="profile-level-row">
        <span className="profile-level-badge">Level {level}</span>
        <span className="ol-sub">{stats?.total_points ?? 0} points</span>
      </div>
      {badges.length === 0 ? (
        <p className="ol-sub" style={{ marginTop: '1rem' }}>
          No badges earned yet.
        </p>
      ) : (
        <ul className="profile-badge-grid">
          {badges.map((b) => (
            <li key={b.key} className="profile-badge">
              <span className="profile-badge-icon">🏅</span>
              <span>{b.key}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function PublicProfile({ currentProfile, isSignedIn }) {
  const { username } = useParams();
  const navigate = useNavigate();
  const [state, setState] = useState('loading'); // loading | private | not-found | ready
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [datasets, setDatasets] = useState([]);
  const [badges, setBadges] = useState([]);
  const [tab, setTab] = useState('overview');

  const isOwnProfile = isSignedIn && currentProfile?.username === username;

  async function handleMessage() {
    const { data: conversationId, error } = await getOrCreateDM(profile.id);
    if (!error && conversationId) navigate(`/chat/dm/${conversationId}`);
  }

  useEffect(() => {
    let cancelled = false;
    setState('loading');
    setTab('overview');

    getPublicProfile(username).then(async ({ data }) => {
      if (cancelled) return;
      if (data) {
        setProfile(data);
        const [{ data: statsRow }, { data: activityRows }, { data: datasetRows }, { data: badgeRows }] = await Promise.all([
          getPublicProfileStats(username),
          getPublicProfileActivity(username),
          getUserDatasets(data.id),
          getPublicBadges(data.id),
        ]);
        if (cancelled) return;
        setStats(statsRow);
        setActivity(activityRows);
        setDatasets(datasetRows);
        setBadges(badgeRows);
        setState('ready');
        return;
      }

      const { exists } = await profileExists(username);
      if (cancelled) return;
      setState(exists ? 'private' : 'not-found');
    });

    return () => {
      cancelled = true;
    };
  }, [username]);

  if (state === 'loading') {
    return (
      <div className="ol-page ol-center">
        <div className="ol-spinner" aria-label="Loading" />
      </div>
    );
  }

  if (state === 'not-found') {
    return (
      <div className="ol-page ol-center">
        <div className="ol-error">No profile found for @{username}.</div>
        <Link to="/datasets" className="ol-btn-ghost" style={{ marginTop: '1rem' }}>
          ← Back to Dataset Hub
        </Link>
      </div>
    );
  }

  if (state === 'private') {
    return (
      <div className="ol-page ol-center">
        <div className="profile-private-icon">🔒</div>
        <h1 className="ol-title">This profile is private</h1>
        <p className="ol-sub">@{username} hasn't made their profile public.</p>
      </div>
    );
  }

  return (
    <div className="ol-page profile-page">
      <div className="profile-header">
        <Avatar src={profile.avatar_url} name={profile.display_name || profile.name} size="xl" />
        <div className="profile-header-info">
          <div className="profile-name-row">
            <h1 className="ol-title" style={{ margin: 0 }}>
              {profile.display_name || profile.name}
            </h1>
            {profile.role && <span className="ds-badge">{ROLE_LABELS[profile.role] || profile.role}</span>}
          </div>
          <p className="ol-sub">@{profile.username}</p>
          {(profile.institution || profile.country) && (
            <p className="ol-sub">{[profile.institution, profile.country].filter(Boolean).join(' · ')}</p>
          )}
          {profile.bio && <p className="profile-bio">{profile.bio}</p>}
          {profile.github_username && (
            <a className="profile-github-link" href={`https://github.com/${profile.github_username}`} target="_blank" rel="noopener noreferrer">
              ↗ github.com/{profile.github_username}
            </a>
          )}
        </div>
        <div className="profile-header-actions">
          {isOwnProfile ? (
            <Link to="/settings/profile" className="ol-btn-primary" style={{ textDecoration: 'none' }}>
              Edit profile
            </Link>
          ) : isSignedIn ? (
            <button type="button" className="ol-btn-primary" onClick={handleMessage}>
              Message
            </button>
          ) : (
            <Link to="/sign-in" className="ol-btn-primary" style={{ textDecoration: 'none' }}>
              Sign in to message
            </Link>
          )}
        </div>
      </div>

      <div className="profile-stats-row">
        <StatTile value={stats?.datasets_count} label="Datasets" />
        <StatTile value={stats?.exercises_completed_count} label="Exercises completed" />
        <StatTile value={stats?.challenge_submissions_count} label="Challenge submissions" />
        <StatTile value={stats?.certifications_count} label="Certifications" />
      </div>

      <div className="profile-tabs">
        {['overview', 'datasets', 'achievements'].map((t) => (
          <button key={t} type="button" className={`profile-tab ${tab === t ? 'profile-tab-active' : ''}`} onClick={() => setTab(t)}>
            {t === 'overview' ? 'Overview' : t === 'datasets' ? 'Datasets' : 'Achievements'}
          </button>
        ))}
      </div>

      <div className="profile-tab-body">
        {tab === 'overview' && <ActivityFeed activity={activity} />}
        {tab === 'datasets' &&
          (datasets.length === 0 ? (
            <p className="ol-sub">No public datasets yet.</p>
          ) : (
            <div className="ds-grid">
              {datasets.map((d) => (
                <DatasetCard key={d.id} dataset={d} owner={profile} />
              ))}
            </div>
          ))}
        {tab === 'achievements' && <AchievementsTab badges={badges} stats={stats} />}
      </div>
    </div>
  );
}
