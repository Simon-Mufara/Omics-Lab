import { CATEGORY_LABELS } from '../lib/datasetsApi.js';

const DIFFICULTIES = ['beginner', 'intermediate', 'advanced'];

export default function DatasetFilters({ facets, filters, onChange }) {
  const set = (key, value) => onChange({ ...filters, [key]: value });

  const toggleTag = (tag) => {
    const next = filters.tags.includes(tag) ? filters.tags.filter((t) => t !== tag) : [...filters.tags, tag];
    set('tags', next);
  };

  return (
    <aside className="ds-filters">
      <div className="ds-filter-group">
        <div className="ds-filter-label">Category</div>
        <select className="ol-input" value={filters.category || ''} onChange={(e) => set('category', e.target.value || null)}>
          <option value="">All categories</option>
          {facets.categories.map((c) => (
            <option key={c} value={c}>
              {CATEGORY_LABELS[c] || c}
            </option>
          ))}
        </select>
      </div>

      <div className="ds-filter-group">
        <div className="ds-filter-label">Difficulty</div>
        {DIFFICULTIES.map((d) => (
          <label key={d} className="ds-filter-radio">
            <input
              type="radio"
              name="difficulty"
              checked={filters.difficulty === d}
              onChange={() => set('difficulty', filters.difficulty === d ? null : d)}
            />
            {d}
          </label>
        ))}
        {filters.difficulty && (
          <button type="button" className="ds-filter-clear" onClick={() => set('difficulty', null)}>
            Clear
          </button>
        )}
      </div>

      <div className="ds-filter-group">
        <div className="ds-filter-label">License</div>
        <select className="ol-input" value={filters.license || ''} onChange={(e) => set('license', e.target.value || null)}>
          <option value="">Any license</option>
          {facets.licenses.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
      </div>

      <div className="ds-filter-group">
        <div className="ds-filter-label">Tags</div>
        <div className="ds-filter-tag-list">
          {facets.tags.map((t) => (
            <button
              key={t}
              type="button"
              className={`ds-tag ds-tag-toggle${filters.tags.includes(t) ? ' ds-tag-active' : ''}`}
              onClick={() => toggleTag(t)}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <label className="ol-toggle-row">
        <input
          type="checkbox"
          checked={!!filters.hasStarterExercise}
          onChange={(e) => set('hasStarterExercise', e.target.checked ? true : null)}
        />
        <span>Has starter exercise</span>
      </label>
    </aside>
  );
}
