import { useEffect, useMemo, useRef, useState } from 'react';
import DatasetCard, { DatasetCardSkeleton } from '../components/DatasetCard.jsx';
import DatasetFilters from '../components/DatasetFilters.jsx';
import { getOwnersByIds, searchDatasets, SORT_OPTIONS } from '../lib/datasetsApi.js';

const SEARCH_DEBOUNCE_MS = 350;
const EMPTY_FILTERS = { category: null, tags: [], difficulty: null, license: null, hasStarterExercise: null };

export default function DatasetHub() {
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [sort, setSort] = useState('newest');

  const [datasets, setDatasets] = useState(null); // null = not loaded yet (distinct from [] = loaded, empty)
  const [owners, setOwners] = useState({});
  const [error, setError] = useState(null);
  const [facets, setFacets] = useState({ categories: [], licenses: [], tags: [] });

  const debounceRef = useRef(null);

  /* Debounced search: typing updates searchInput immediately (so the
     box feels responsive) but only triggers a query after the user
     pauses. */
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setSearch(searchInput.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(debounceRef.current);
  }, [searchInput]);

  /* Facets come from the full unfiltered catalog once, so filter
     options don't shrink/disappear as the user narrows results. */
  useEffect(() => {
    searchDatasets({}).then(({ data }) => {
      const categories = [...new Set(data.map((d) => d.category))].sort();
      const licenses = [...new Set(data.map((d) => d.license).filter(Boolean))].sort();
      const tags = [...new Set(data.flatMap((d) => d.tags || []))].sort();
      setFacets({ categories, licenses, tags });
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    searchDatasets({
      search,
      category: filters.category,
      tags: filters.tags,
      difficulty: filters.difficulty,
      license: filters.license,
      hasStarterExercise: filters.hasStarterExercise,
      sort,
    }).then(async ({ data, error: err }) => {
      if (cancelled) return;
      if (err) {
        setError(err);
        setDatasets([]);
        return;
      }
      setDatasets(data);
      const ownerMap = await getOwnersByIds(data.map((d) => d.owner_id));
      if (!cancelled) setOwners(ownerMap);
    });
    return () => {
      cancelled = true;
    };
  }, [search, filters, sort]);

  const resultCountLabel = useMemo(() => {
    if (datasets === null) return '';
    return `${datasets.length} dataset${datasets.length === 1 ? '' : 's'}`;
  }, [datasets]);

  return (
    <div className="ds-hub">
      <div className="ds-hub-head">
        <h1 className="ol-title">Dataset Hub</h1>
        <p className="ol-sub">Real bioinformatics datasets to explore, practice, and train on.</p>
        <input
          className="ol-input ds-search"
          type="search"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search title, tags, description…"
          aria-label="Search datasets"
        />
      </div>

      <div className="ds-hub-body">
        <DatasetFilters facets={facets} filters={filters} onChange={setFilters} />

        <div className="ds-hub-main">
          <div className="ds-hub-toolbar">
            <span className="ds-hub-count">{resultCountLabel}</span>
            <select className="ol-input ds-sort-select" value={sort} onChange={(e) => setSort(e.target.value)}>
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          {error && <div className="ol-error">Couldn't load datasets: {error.message}</div>}

          {datasets === null && (
            <div className="ds-grid">
              {Array.from({ length: 6 }).map((_, i) => (
                <DatasetCardSkeleton key={i} />
              ))}
            </div>
          )}

          {datasets !== null && datasets.length === 0 && !error && (
            <div className="ds-empty">
              <div className="ds-empty-title">No datasets match your filters</div>
              <p className="ol-sub">Try clearing a filter or searching a broader term.</p>
              <button
                type="button"
                className="ol-btn-ghost"
                onClick={() => {
                  setFilters(EMPTY_FILTERS);
                  setSearchInput('');
                }}
              >
                Clear all filters
              </button>
            </div>
          )}

          {datasets !== null && datasets.length > 0 && (
            <div className="ds-grid">
              {datasets.map((d) => (
                <DatasetCard key={d.id} dataset={d} owner={owners[d.owner_id]} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
