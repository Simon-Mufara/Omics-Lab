import { useState } from 'react';
import UsernameField from '../components/UsernameField.jsx';
import ProfileFields from '../components/ProfileFields.jsx';
import Avatar from '../components/Avatar.jsx';
import { saveProfile } from '../lib/profileApi.js';

const UNIQUE_VIOLATION = '23505';

export default function EditProfile({ clerkUser, profile, onSaved }) {
  const [username, setUsername] = useState(profile?.username || '');
  const [usernameStatus, setUsernameStatus] = useState('available'); // starts valid: it's already theirs
  const [fields, setFields] = useState({
    display_name: profile?.display_name || '',
    bio: profile?.bio || '',
    institution: profile?.institution || '',
    country: profile?.country || '',
  });
  const [isPublic, setIsPublic] = useState(profile?.is_public ?? true);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [savedAt, setSavedAt] = useState(null);

  const canSubmit = usernameStatus === 'available' && !submitting;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setSubmitError('');

    const { data, error } = await saveProfile(clerkUser, {
      username: username.trim().toLowerCase(),
      display_name: fields.display_name.trim() || null,
      bio: fields.bio.trim() || null,
      institution: fields.institution.trim() || null,
      country: fields.country.trim() || null,
      is_public: isPublic,
    });

    setSubmitting(false);

    if (error) {
      if (error.code === UNIQUE_VIOLATION) {
        setSubmitError('That username was just taken — pick another.');
        setUsernameStatus('taken');
      } else {
        setSubmitError(error.message || 'Could not save your profile — try again.');
      }
      return;
    }

    setSavedAt(Date.now());
    onSaved?.(data);
  }

  return (
    <div className="ol-page ol-page-narrow">
      <div className="ol-onboard-head">
        <Avatar src={clerkUser?.imageUrl} name={fields.display_name || clerkUser?.fullName} size="lg" />
        <h1 className="ol-title">Edit profile</h1>
      </div>

      <form onSubmit={handleSubmit} className="ol-form">
        <UsernameField
          value={username}
          onChange={setUsername}
          currentUsername={profile?.username || null}
          onStatusChange={setUsernameStatus}
        />
        <ProfileFields values={fields} onChange={setFields} />

        <label className="ol-toggle-row">
          <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
          <span>
            <strong>Public profile</strong> — visible to other OmicsLab users in search and the directory.
            Your email is never shown either way.
          </span>
        </label>

        {submitError && <div className="ol-error">{submitError}</div>}
        {savedAt && !submitError && <div className="ol-success">Saved.</div>}

        <button type="submit" className="ol-btn-primary" disabled={!canSubmit}>
          {submitting ? 'Saving…' : 'Save changes'}
        </button>
      </form>
    </div>
  );
}
