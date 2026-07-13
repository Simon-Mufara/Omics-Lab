import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Avatar from '../components/Avatar.jsx';
import { searchUsers } from '../lib/userSearchApi.js';

const ROLE_LABELS = {
  student: 'Student',
  researcher: 'Researcher',
  instructor: 'Instructor',
  clinician: 'Clinician',
  bioinformatician: 'Bioinformatician',
  'public-health': 'Public Health',
};

const PAGE_SIZE = 24;
const SEARCH_DEBOUNCE_MS = 300;

function MemberCard({ member }) {
  return (
    <Link to={`/u/${member.username}`} className="ds-card member-card">
      <Avatar src={member.avatar_url} name={member.display_name} size="lg" />
      <div className="member-card-name">{member.display_name || member.username}</div>
      <div className="ol-sub">@{member.username}</div>
      {member.role && <span className="ds-badge">{ROLE_LABELS[member.role] || member.role}</span>}
      {(member.institution || member.country) && (
        <div className="ol-sub member-card-meta">{[member.institution, member.country].filter(Boolean).join(' · ')}</div>
      )}
    </Link>
  );
}

export default function MemberDirectory() {
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [country, setCountry] = useState('');
  const [institution, setInstitution] = useState('');
  const [page, setPage] = useState(0);
  const [members, setMembers] = useState(null);
  const [facets, setFacets] = useState({ countries: [], institutions: [] });
  const debounceRef = useRef(null);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(0);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(debounceRef.current);
  }, [searchInput]);

  useEffect(() => {
    searchUsers({ limit: 500 }).then(({ data }) => {
      setFacets({
        countries: [...new Set(data.map((m) => m.country).filter(Boolean))].sort(),
        institutions: [...new Set(data.map((m) => m.institution).filter(Boolean))].sort(),
      });
    });
  }, []);

  useEffect(() => {
    setMembers(null);
    searchUsers({ q: search, role: role || null, country: country || null, institution: institution || null, limit: PAGE_SIZE, offset: page * PAGE_SIZE }).then(
      ({ data }) => setMembers(data)
    );
  }, [search, role, country, institution, page]);

  return (
    <div className="ds-hub">
      <div className="ds-hub-head">
        <h1 className="ol-title">Member Directory</h1>
        <p className="ol-sub">Find other researchers, students, and instructors on OmicsLab.</p>
        <input
          className="ol-input ds-search"
          type="search"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search name, @username, GitHub, institution…"
          aria-label="Search members"
        />
      </div>

      <div className="ds-hub-body">
        <div className="ds-filters">
          <div className="ds-filter-group">
            <span className="ds-filter-label">Role</span>
            {Object.entries(ROLE_LABELS).map(([value, label]) => (
              <label key={value} className="ds-filter-radio">
                <input
                  type="radio"
                  name="role"
                  checked={role === value}
                  onChange={() => {
                    setPage(0);
                    setRole(value);
                  }}
                />
                {label}
              </label>
            ))}
            {role && (
              <button type="button" className="ds-filter-clear" onClick={() => setRole('')}>
                Clear
              </button>
            )}
          </div>

          {facets.countries.length > 0 && (
            <div className="ds-filter-group">
              <span className="ds-filter-label">Country</span>
              <select className="ol-input" value={country} onChange={(e) => { setPage(0); setCountry(e.target.value); }}>
                <option value="">All countries</option>
                {facets.countries.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          )}

          {facets.institutions.length > 0 && (
            <div className="ds-filter-group">
              <span className="ds-filter-label">Institution</span>
              <select className="ol-input" value={institution} onChange={(e) => { setPage(0); setInstitution(e.target.value); }}>
                <option value="">All institutions</option>
                {facets.institutions.map((i) => (
                  <option key={i} value={i}>
                    {i}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="ds-hub-main">
          {members === null && (
            <div className="ds-grid">
              {Array.from({ length: 8 }).map((_, i) => (
                <div className="ds-card ds-card-skeleton" key={i} aria-hidden="true">
                  <div className="ol-skel" style={{ width: 64, height: 64, borderRadius: '50%' }} />
                  <div className="ol-skel" style={{ width: '60%', height: 16, marginTop: 10 }} />
                </div>
              ))}
            </div>
          )}

          {members !== null && members.length === 0 && (
            <div className="ds-empty">
              <div className="ds-empty-title">No members match your filters</div>
            </div>
          )}

          {members !== null && members.length > 0 && (
            <>
              <div className="ds-grid member-grid">
                {members.map((m) => (
                  <MemberCard key={m.id} member={m} />
                ))}
              </div>
              <div className="ds-preview-pagination" style={{ marginTop: '1.5rem' }}>
                <button type="button" className="ol-btn-ghost" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
                  ← Prev
                </button>
                <span className="ol-sub">Page {page + 1}</span>
                <button type="button" className="ol-btn-ghost" disabled={members.length < PAGE_SIZE} onClick={() => setPage((p) => p + 1)}>
                  Next →
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
