import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

/* Two separate single-series charts (not one dual-axis chart) — views
   and downloads are already the same unit (events/day), but the spec
   calls for two distinct charts, and each gets its own validated hue
   from the Hub's dark categorical set so the two are never confused
   even side by side without a legend. */
const VIEWS_COLOR = '#199e70';
const DOWNLOADS_COLOR = '#c98500';

function dayTick(iso) {
  const d = new Date(iso + 'T00:00:00');
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function MiniAreaChart({ data, dataKey, color, label }) {
  const total = data.reduce((sum, d) => sum + d[dataKey], 0);
  return (
    <div className="ds-activity-chart">
      <div className="ds-activity-chart-head">
        <span className="ds-activity-chart-label">{label}</span>
        <span className="ds-activity-chart-total">{total.toLocaleString()} in last 30 days</span>
      </div>
      <ResponsiveContainer width="100%" height={140}>
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
          <defs>
            <linearGradient id={`ds-grad-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.35} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#182236" vertical={false} />
          <XAxis
            dataKey="day"
            tickFormatter={dayTick}
            tick={{ fill: '#a8a098', fontSize: 11 }}
            axisLine={{ stroke: '#182236' }}
            tickLine={false}
            interval={6}
          />
          <YAxis tick={{ fill: '#a8a098', fontSize: 11 }} axisLine={false} tickLine={false} width={28} allowDecimals={false} />
          <Tooltip
            contentStyle={{ background: '#0d1524', border: '1px solid #182236', borderRadius: 8, fontSize: 12 }}
            labelStyle={{ color: '#a8a098' }}
            itemStyle={{ color: '#e4ddd2' }}
            labelFormatter={dayTick}
          />
          <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} fill={`url(#ds-grad-${dataKey})`} isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function ActivityCharts({ activity, viewCount, downloadCount }) {
  const engagement = viewCount > 0 ? (downloadCount / viewCount) * 100 : null;

  return (
    <div className="ds-activity">
      <div className="ds-activity-charts">
        <MiniAreaChart data={activity} dataKey="views" color={VIEWS_COLOR} label="Views" />
        <MiniAreaChart data={activity} dataKey="downloads" color={DOWNLOADS_COLOR} label="Downloads" />
      </div>
      <div className="ds-activity-stat">
        <span className="ds-activity-stat-value">{engagement == null ? '—' : `${engagement.toFixed(1)}%`}</span>
        <span className="ds-activity-stat-label">Engagement (downloads / views, all-time)</span>
      </div>
    </div>
  );
}
