import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const DTYPE_LABELS = {
  numeric: 'Numeric',
  categorical: 'Categorical',
  text: 'Text',
  boolean: 'Boolean',
  datetime: 'Datetime',
};

/* Both numeric histograms and categorical top-value bars render as the
   same single-series bar mark (magnitude via height, not color) — one
   validated hue (aqua, series-1 from the Hub's dark categorical set),
   so a column's dtype changes the data shape but not the chart chrome. */
const SERIES_COLOR = '#199e70';

function fmtNum(n) {
  if (n == null) return '—';
  const abs = Math.abs(n);
  if (abs !== 0 && (abs < 0.001 || abs >= 100000)) return n.toExponential(2);
  return Number(n.toFixed(abs < 10 ? 2 : 1)).toString();
}

function HistogramMini({ histogram }) {
  if (!histogram?.length) return <p className="ol-sub ds-col-empty">No distribution available.</p>;
  const data = histogram.map((b) => ({
    label: `${fmtNum(b.bin_start)}–${fmtNum(b.bin_end)}`,
    count: b.count,
  }));
  return (
    <ResponsiveContainer width="100%" height={64}>
      <BarChart data={data} margin={{ top: 4, right: 2, bottom: 0, left: 2 }} barCategoryGap={2}>
        <Tooltip
          cursor={{ fill: 'rgba(255,255,255,0.06)' }}
          contentStyle={{ background: '#0d1524', border: '1px solid #182236', borderRadius: 8, fontSize: 12 }}
          labelStyle={{ color: '#a8a098' }}
          itemStyle={{ color: '#e4ddd2' }}
          formatter={(value) => [value, 'count']}
        />
        <Bar dataKey="count" fill={SERIES_COLOR} radius={[3, 3, 0, 0]} isAnimationActive={false} />
        <XAxis dataKey="label" hide />
      </BarChart>
    </ResponsiveContainer>
  );
}

function TopCategoriesMini({ topValues }) {
  if (!topValues?.length) return <p className="ol-sub ds-col-empty">No distribution available.</p>;
  const data = topValues.slice(0, 6);
  return (
    <ResponsiveContainer width="100%" height={64}>
      <BarChart data={data} layout="vertical" margin={{ top: 2, right: 12, bottom: 2, left: 2 }} barCategoryGap={3}>
        <Tooltip
          cursor={{ fill: 'rgba(255,255,255,0.06)' }}
          contentStyle={{ background: '#0d1524', border: '1px solid #182236', borderRadius: 8, fontSize: 12 }}
          labelStyle={{ color: '#a8a098' }}
          itemStyle={{ color: '#e4ddd2' }}
        />
        <XAxis type="number" hide />
        <YAxis type="category" dataKey="value" hide />
        <Bar dataKey="count" fill={SERIES_COLOR} radius={[0, 3, 3, 0]} isAnimationActive={false} name="count" />
      </BarChart>
    </ResponsiveContainer>
  );
}

export default function ColumnCard({ column }) {
  const stats = column.summary_stats || {};
  return (
    <div className="ds-col-card">
      <div className="ds-col-head">
        <code className="ds-col-name">{column.name}</code>
        <span className="ds-col-dtype">{DTYPE_LABELS[column.dtype] || column.dtype}</span>
      </div>
      {column.description && <p className="ds-col-desc">{column.description}</p>}

      <div className="ds-col-chart">
        {column.dtype === 'numeric' && <HistogramMini histogram={stats.histogram} />}
        {column.dtype === 'categorical' && <TopCategoriesMini topValues={stats.top_values} />}
        {(column.dtype === 'text' || column.dtype === 'boolean' || column.dtype === 'datetime') && !stats.histogram && !stats.top_values && (
          <p className="ol-sub ds-col-empty">No distribution available.</p>
        )}
      </div>

      {column.dtype === 'numeric' && stats.min != null && (
        <div className="ds-col-range">
          <span>min {fmtNum(stats.min)}</span>
          <span>mean {fmtNum(stats.mean)}</span>
          <span>max {fmtNum(stats.max)}</span>
        </div>
      )}
      {column.dtype === 'categorical' && stats.top_values && (
        <div className="ds-col-range">
          {stats.top_values.slice(0, 6).map((v) => (
            <span key={v.value}>
              {v.value} · {v.count}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
