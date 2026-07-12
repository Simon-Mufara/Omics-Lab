const BIO_MAX = 280;

/* Display name, bio, institution, country — the fields shared by both
   the onboarding screen and the edit-profile settings page. Username
   is deliberately NOT here — it has its own live-availability field
   (UsernameField) and different edit semantics (allowed to be locked
   post-onboarding in the future; today it's just always editable). */
export default function ProfileFields({ values, onChange }) {
  const set = (key) => (e) => onChange({ ...values, [key]: e.target.value });

  return (
    <>
      <div className="ol-field">
        <label className="ol-label" htmlFor="display_name">
          Display name
        </label>
        <input
          id="display_name"
          className="ol-input"
          value={values.display_name}
          onChange={set('display_name')}
          placeholder="How your name appears to others"
          maxLength={80}
        />
      </div>

      <div className="ol-field">
        <label className="ol-label" htmlFor="bio">
          Bio
        </label>
        <textarea
          id="bio"
          className="ol-input ol-textarea"
          value={values.bio}
          onChange={set('bio')}
          placeholder="A short line about your work"
          maxLength={BIO_MAX}
          rows={3}
        />
        <div className="ol-field-hint">
          {values.bio.length}/{BIO_MAX}
        </div>
      </div>

      <div className="ol-field-row">
        <div className="ol-field">
          <label className="ol-label" htmlFor="institution">
            Institution
          </label>
          <input
            id="institution"
            className="ol-input"
            value={values.institution}
            onChange={set('institution')}
            placeholder="University / research institute"
            maxLength={100}
          />
        </div>
        <div className="ol-field">
          <label className="ol-label" htmlFor="country">
            Country
          </label>
          <input
            id="country"
            className="ol-input"
            value={values.country}
            onChange={set('country')}
            placeholder="Country"
            maxLength={60}
          />
        </div>
      </div>
    </>
  );
}
