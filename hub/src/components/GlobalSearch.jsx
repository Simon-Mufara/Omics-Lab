import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Avatar from './Avatar.jsx';
import { searchDatasets } from '../lib/datasetsApi.js';
import { searchUsers } from '../lib/userSearchApi.js';

const DEBOUNCE_MS = 300;

export default function GlobalSearch() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [datasets, setDatasets] = useState([]);
  const [people, setPeople] = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const debounceRef = useRef(null);
  const rootRef = useRef(null);

  const items = [
    ...datasets.map((d) => ({ kind: 'dataset', to: `/datasets/${d.slug}`, key: `d-${d.id}` })),
    ...people.map((p) => ({ kind: 'person', to: `/u/${p.username}`, key: `p-${p.id}` })),
  ];

  useEffect(() => {
    clearTimeout(debounceRef.current);
    const trimmed = query.trim();
    if (!trimmed) {
      setDatasets([]);
      setPeople([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      const [{ data: dsRows }, { data: userRows }] = await Promise.all([
        searchDatasets({ search: trimmed, sort: 'downloads' }),
        searchUsers({ q: trimmed, limit: 6 }),
      ]);
      setDatasets(dsRows.slice(0, 5));
      setPeople(userRows);
      setActiveIndex(-1);
    }, DEBOUNCE_MS);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function go(item) {
    if (!item) return;
    setOpen(false);
    setQuery('');
    navigate(item.to);
  }

  function handleKeyDown(e) {
    if (!open || items.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % items.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? items.length - 1 : i - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      go(items[activeIndex] ?? items[0]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  return (
    <div className="global-search" ref={rootRef}>
      <input
        type="search"
        className="ol-input global-search-input"
        placeholder="Search datasets or people…"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        aria-label="Search datasets or people"
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
      />
      {open && query.trim() && (datasets.length > 0 || people.length > 0) && (
        <div className="global-search-dropdown" role="listbox">
          {datasets.length > 0 && (
            <div className="global-search-group">
              <div className="global-search-group-label">Datasets</div>
              {datasets.map((d, i) => (
                <button
                  key={d.id}
                  type="button"
                  className={`global-search-item ${items[i]?.key === `d-${d.id}` && activeIndex === i ? 'global-search-item-active' : ''}`}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => go({ to: `/datasets/${d.slug}` })}
                >
                  <span className="global-search-item-title">{d.title}</span>
                  <span className="ol-sub">{d.category}</span>
                </button>
              ))}
            </div>
          )}
          {people.length > 0 && (
            <div className="global-search-group">
              <div className="global-search-group-label">People</div>
              {people.map((p, i) => {
                const idx = datasets.length + i;
                return (
                  <button
                    key={p.id}
                    type="button"
                    className={`global-search-item ${activeIndex === idx ? 'global-search-item-active' : ''}`}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => go({ to: `/u/${p.username}` })}
                  >
                    <Avatar src={p.avatar_url} name={p.display_name} size="sm" />
                    <span className="global-search-item-title">
                      @{p.username} <span className="ol-sub">{p.display_name}</span>
                    </span>
                    {p.institution && <span className="ol-sub">{p.institution}</span>}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
