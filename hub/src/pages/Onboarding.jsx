import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UsernameField from '../components/UsernameField.jsx';
import ProfileFields from '../components/ProfileFields.jsx';
import Avatar from '../components/Avatar.jsx';
import { saveProfile } from '../lib/profileApi.js';

const UNIQUE_VIOLATION = '23505';

export default function Onboarding({ clerkUser, onComplete }) {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [usernameStatus, setUsernameStatus] = useState('idle');
  const [fields, setFields] = useState({ display_name: clerkUser?.fullName || '', bio: '', institution: '', country: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

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

    onComplete?.(data);
    navigate('/', { replace: true });
  }

  return (
    <div className="ol-page ol-page-narrow">
      <div className="ol-onboard-head">
        <Avatar src={clerkUser?.imageUrl} name={clerkUser?.fullName} size="lg" />
        <h1 className="ol-title">Complete your profile</h1>
        <p className="ol-sub">
          Pick a unique @username — this is separate from your email or GitHub handle, and it's how other
          researchers will find you on OmicsLab.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="ol-form">
        <UsernameField value={username} onChange={setUsername} currentUsername={null} onStatusChange={setUsernameStatus} />
        <ProfileFields values={fields} onChange={setFields} />

        {submitError && <div className="ol-error">{submitError}</div>}

        <button type="submit" className="ol-btn-primary" disabled={!canSubmit}>
          {submitting ? 'Saving…' : 'Continue'}
        </button>
      </form>
    </div>
  );
}
