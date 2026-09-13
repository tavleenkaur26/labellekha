import { useEffect, useMemo, useState } from 'react';
import {
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type {
  DashboardStats,
  NavigateFn,
  PriorityQueueItem,
  ReviewQueueItem,
  ScanListItem,
  UserSession,
} from '../types';
import { api, downloadAuthenticated } from '../utils/api';
import { Page } from './NewScan';

const fmt = (s?: string | null) =>
  s ? s.replaceAll('-', ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : '—';

const pct = (part?: number, total?: number) =>
  total ? Math.round(((part ?? 0) / total) * 100) : 0;

const chartData = (values: Record<string, number> = {}) =>
  Object.entries(values)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, value]) => ({ name, value }));

const ACTIVITY_DAYS = 14;

function buildActivitySeries(scans: ScanListItem[]) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = Array.from({ length: ACTIVITY_DAYS }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (ACTIVITY_DAYS - 1 - i));
    return {
      time: d.getTime(),
      label: d.toLocaleDateString(undefined, { day: '2-digit', month: 'short' }),
      total: 0,
      compliant: 0,
      violations: 0,
    };
  });
  scans.forEach((s) => {
    const c = new Date(s.created_at);
    c.setHours(0, 0, 0, 0);
    const day = days.find((d) => d.time === c.getTime());
    if (!day) return;
    day.total += 1;
    if (s.overall_status === 'compliant') day.compliant += 1;
    else if (s.overall_status === 'non-compliant') day.violations += 1;
  });
  return days;
}

function previousWindowCount(scans: ScanListItem[]) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return scans.filter((s) => {
    const c = new Date(s.created_at);
    c.setHours(0, 0, 0, 0);
    const diffDays = Math.round((today.getTime() - c.getTime()) / 86400000);
    return diffDays >= 7 && diffDays <= 13;
  }).length;
}

interface MyStats {
  total_scans: number;
  compliant_count: number;
  non_compliant_count: number;
  review_count: number;
}

export default function Dashboard({
  navigate,
  session,
}: {
  navigate: NavigateFn;
  session: UserSession | null;
}) {
  const isInspector = session?.role === 'inspector';

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [myStats, setMyStats] = useState<MyStats | null>(null);
  const [scans, setScans] = useState<ScanListItem[]>([]);
  const [review, setReview] = useState<ReviewQueueItem[]>([]);
  const [priority, setPriority] = useState<PriorityQueueItem[]>([]);
  const [error, setError] = useState('');
  const [category, setCategory] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [loading, setLoading] = useState(true);

  const categories = useMemo(
    () => Array.from(new Set(scans.map((s) => s.category).filter(Boolean) as string[])).sort(),
    [scans],
  );

  const filteredRecentScans = useMemo(() => {
    return scans.filter((scan) => {
      if (category && scan.category !== category) return false;
      const created = new Date(scan.created_at).getTime();
      if (dateFrom && created < new Date(`${dateFrom}T00:00:00`).getTime()) return false;
      if (dateTo && created > new Date(`${dateTo}T23:59:59`).getTime()) return false;
      return true;
    });
  }, [scans, category, dateFrom, dateTo]);

  const goToScan = (scanId: number) => {
    localStorage.setItem('labelix_last_scan', String(scanId));
    navigate('inspection-result');
  };

  const loadDashboard = async () => {
    setLoading(true);
    setError('');
    try {
      const allScans = await api.getScans();
      setScans(allScans);

      if (isInspector) {
        const params = new URLSearchParams();
        if (dateFrom) params.set('date_from', `${dateFrom}T00:00:00`);
        if (dateTo) params.set('date_to', `${dateTo}T23:59:59`);
        if (category) params.set('category', category);

        const query = params.toString() ? `?${params.toString()}` : '';
        const dashboardStats = await api.getDashboardStats(query);
        setStats(dashboardStats);

        try {
          setReview(await api.getReviewQueue());
        } catch {
          setReview([]);
        }
        try {
          setPriority(await api.getPriorityQueue());
        } catch {
          setPriority([]);
        }
      } else {
        const m = await api.getMyStats();
        setMyStats(m);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [isInspector]);

  const applyFilters = () => loadDashboard();
  const clearFilters = () => {
    setCategory('');
    setDateFrom('');
    setDateTo('');
    window.setTimeout(() => loadDashboard(), 0);
  };

  // ============================================================
  // CONSUMER / REGULAR USER VIEW — simpler, personal-scans only
  // ============================================================
  if (!isInspector) {
    return (
      <Page title="Dashboard" subtitle={`Your scan activity, ${session?.name || 'welcome'}.`}>
        <div className="toolbar dashboard-toolbar">
          <button className="primary-button small" onClick={() => navigate('new-scan')}>＋ New scan</button>
        </div>

        {error && <div className="error-box">{error}</div>}

        <div className="stat-grid kpi-grid">
          <div className="stat-card kpi-card kpi-neutral">
            <div className="stat-icon">▤</div>
            <div><span>Total scans</span><strong>{myStats?.total_scans ?? '—'}</strong></div>
          </div>
          <div className="stat-card kpi-card kpi-good">
            <div className="stat-icon">✓</div>
            <div><span>Compliant</span><strong>{myStats?.compliant_count ?? '—'}</strong></div>
          </div>
          <div className="stat-card kpi-card kpi-bad">
            <div className="stat-icon">!</div>
            <div><span>Non-compliant</span><strong>{myStats?.non_compliant_count ?? '—'}</strong></div>
          </div>
          <div className="stat-card kpi-card kpi-warn">
            <div className="stat-icon">◔</div>
            <div><span>Needs review</span><strong>{myStats?.review_count ?? '—'}</strong></div>
          </div>
        </div>

        <div className="panel recent-inspections-panel">
          <div className="panel-header">
            <div><h3>Your recent scans</h3><p className="muted">Scans you've submitted.</p></div>
            <button className="text-button" onClick={() => navigate('products')}>View all →</button>
          </div>
          <div className="table-wrap compact-table">
            <table>
              <thead><tr><th>Scan ID</th><th>Product</th><th>Result</th><th>Date</th><th>Actions</th></tr></thead>
              <tbody>
                {scans.slice(0, 8).map((s) => (
                  <tr key={s.scan_id} onClick={() => goToScan(s.scan_id)}>
                    <td>#{s.scan_id}</td>
                    <td><strong>{s.product_name || 'Unnamed product'}</strong></td>
                    <td><span className={`status ${s.overall_status === 'compliant' ? 'good' : s.overall_status === 'non-compliant' ? 'bad' : 'neutral'}`}>{fmt(s.overall_status)}</span></td>
                    <td>{new Date(s.created_at).toLocaleDateString()}</td>
                    <td className="row-actions" onClick={(e) => e.stopPropagation()}>
                      <button className="icon-action" title="View result" onClick={() => goToScan(s.scan_id)}>view</button>
                      {s.overall_status && (
                        <button
                          className="icon-action"
                          title="Download PDF report"
                          onClick={() => downloadAuthenticated(api.reportUrl(s.scan_id, 'pdf'), `scan_${s.scan_id}_report.pdf`)}
                        >
                          pdf
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {!scans.length && <tr><td colSpan={5} className="empty-table">No scans yet — run your first scan to see it here.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        {loading && <div className="dashboard-loading">Refreshing dashboard data…</div>}
      </Page>
    );
  }

  // ============================================================
  // INSPECTOR VIEW — unchanged, exactly Trisha's design
  // ============================================================
  const categoryData = chartData(stats?.violations_by_category);
  const brandData = chartData(stats?.violations_by_brand);
  const regionData = chartData(stats?.violations_by_area);
  const clauseData = chartData(stats?.violations_by_clause);
  const topClause = clauseData[0] || null;

  const complianceData = stats
    ? [
        { name: 'Compliant', value: stats.compliant_count },
        { name: 'Non-compliant', value: stats.non_compliant_count },
      ]
    : [];

  const activity = useMemo(() => buildActivitySeries(scans), [scans]);
  const activityTotal = activity.reduce((sum, d) => sum + d.total, 0);
  const activityPrev = useMemo(() => previousWindowCount(scans), [scans]);
  const last7 = activity.slice(-7).reduce((sum, d) => sum + d.total, 0);
  const scansTrend = activityPrev > 0 ? Math.round(((last7 - activityPrev) / activityPrev) * 100) : null;

  const highPriority = priority.filter((p) => p.priority_score >= 7);
  const mediumPriority = priority.filter((p) => p.priority_score >= 4 && p.priority_score < 7);
  const lowPriority = priority.filter((p) => p.priority_score < 4);

  return (
    <Page
      title="Dashboard"
      subtitle="Monitor compliance findings, track inspections, and identify key risk areas."
    >
      <div className="toolbar dashboard-toolbar">
        <div className="filter-group">
          <label>
            From
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          </label>
          <label>
            To
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          </label>
          <label>
            Category
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">All categories</option>
              {categories.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          <button className="secondary-button small" onClick={applyFilters}>Apply</button>
          <button className="text-button" onClick={clearFilters}>Clear</button>
        </div>
        <button className="primary-button small" onClick={() => navigate('new-scan')}>＋ New scan</button>
      </div>

      {error && <div className="error-box">{error}</div>}

      <div className="stat-grid kpi-grid">
        <div className="stat-card kpi-card kpi-neutral">
          <div className="stat-icon">▤</div>
          <div>
            <span>Total scans</span>
            <strong>{stats?.total_scans ?? '—'}</strong>
            {scansTrend !== null && <small className={scansTrend >= 0 ? 'trend-up' : 'trend-down'}>{scansTrend >= 0 ? '↑' : '↓'} {Math.abs(scansTrend)}% vs previous 7 days</small>}
          </div>
        </div>
        <div className="stat-card kpi-card kpi-good">
          <div className="stat-icon">✓</div>
          <div>
            <span>Compliant</span>
            <strong>{stats?.compliant_count ?? '—'}</strong>
            {!!stats?.total_scans && <small>{pct(stats.compliant_count, stats.total_scans)}% of total</small>}
          </div>
        </div>
        <div className="stat-card kpi-card kpi-bad">
          <div className="stat-icon">!</div>
          <div>
            <span>Violations</span>
            <strong>{stats?.non_compliant_count ?? '—'}</strong>
            {!!stats?.total_scans && <small>{pct(stats.non_compliant_count, stats.total_scans)}% of total</small>}
          </div>
        </div>
        <div className="stat-card kpi-card kpi-warn">
          <div className="stat-icon">◔</div>
          <div>
            <span>Review required</span>
            <strong>{stats?.human_review_count ?? '—'}</strong>
            {!!stats?.total_scans && <small>{pct(stats.human_review_count, stats.total_scans)}% of total</small>}
          </div>
        </div>
      </div>

      <div className="primary-analytics-grid">
        <div className="panel chart-panel activity-panel-lg">
          <div className="panel-header">
            <div><h3>Inspection activity</h3><p className="muted">Last {ACTIVITY_DAYS} days, aggregated from your scan records.</p></div>
          </div>
          <div className="chart-box chart-box-lg">
            {activityTotal ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={activity} margin={{ top: 4, right: 16, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--line-soft)" />
                  <XAxis dataKey="label" tick={{ fontSize: 10.5 }} interval={Math.ceil(ACTIVITY_DAYS / 8)} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 10.5 }} width={28} />
                  <Tooltip />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="total" name="Total scans" stroke="#3d4630" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="compliant" name="Compliant" stroke="#4a7a56" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="violations" name="Violations" stroke="#a65650" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-chart">No scans recorded in the last {ACTIVITY_DAYS} days.</div>
            )}
          </div>
        </div>

        <div className="panel chart-panel compliance-panel-lg">
          <div className="panel-header"><div><h3>Compliance distribution</h3><p className="muted">Outcome of the selected scans.</p></div></div>
          {stats?.total_scans ? (
            <div className="donut-block">
              <div className="donut-center-wrap">
                <ResponsiveContainer width={148} height={148}>
                  <PieChart>
                    <Pie data={complianceData} dataKey="value" nameKey="name" innerRadius={48} outerRadius={68} paddingAngle={2}>
                      {complianceData.map((entry) => <Cell key={entry.name} className={entry.name === 'Compliant' ? 'slice-good' : 'slice-bad'} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="donut-center-label"><strong>{stats.compliance_rate}%</strong><span>Compliant</span></div>
              </div>
              <div className="donut-legend legend-table">
                <div><i className="dot-good" /><span>Compliant</span><strong>{stats.compliant_count}</strong><em>{pct(stats.compliant_count, stats.total_scans)}%</em></div>
                <div><i className="dot-bad" /><span>Non-compliant</span><strong>{stats.non_compliant_count}</strong><em>{pct(stats.non_compliant_count, stats.total_scans)}%</em></div>
                <div><i className="dot-warn" /><span>Review required</span><strong>{stats.human_review_count}</strong><em>{pct(stats.human_review_count, stats.total_scans)}%</em></div>
              </div>
            </div>
          ) : (
            <div className="empty-chart">No scans in this selection.</div>
          )}
        </div>
      </div>

      <div className="panel priority-panel-full">
        <div className="panel-header"><h3>Inspection priority</h3></div>
        <div className="severity-hero">
          <div className="severity-tile severity-high">
            <span className="status bad">High priority</span>
            <strong>{highPriority.length}</strong>
            <small>Immediate attention required</small>
          </div>
          <div className="severity-tile severity-medium">
            <span className="status warn">Medium priority</span>
            <strong>{mediumPriority.length}</strong>
            <small>Should be reviewed soon</small>
          </div>
          <div className="severity-tile severity-low">
            <span className="status neutral">Low priority</span>
            <strong>{lowPriority.length}</strong>
            <small>For reference</small>
          </div>
          <div className="severity-tile severity-review">
            <span className="status warn">Review required</span>
            <strong>{stats?.human_review_count ?? review.length}</strong>
            <small>{!!stats?.total_scans && `${pct(stats.human_review_count, stats.total_scans)}% of total scans`}</small>
          </div>
        </div>
        {(review.length > 0 || priority.length > 0) ? (
          <div className="priority-list-full">
            {review.slice(0, 4).map((r) => (
              <div className="priority-row-compact" key={`rv-${r.scan_id}`} onClick={() => goToScan(r.scan_id)}>
                <span className="status warn">Review</span>
                <strong>#{r.scan_id} · {r.product_name || 'Unnamed'}</strong>
                <span>{r.reason}</span>
              </div>
            ))}
            {priority.slice(0, 4).map((p) => (
              <div className="priority-row-compact" key={`pr-${p.scan_id}`} onClick={() => goToScan(p.scan_id)}>
                <span className="status bad">Priority</span>
                <strong>#{p.scan_id} · {p.product_name || 'Unnamed'}</strong>
                <span>score {p.priority_score} · {p.reason}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="muted">No inspections currently require manual review or elevated priority.</p>
        )}
      </div>

      <div className="panel recent-inspections-panel">
        <div className="panel-header">
          <div><h3>Recent inspections</h3><p className="muted">Latest scans from your activity.</p></div>
          <button className="text-button" onClick={() => navigate('products')}>View all →</button>
        </div>
        <div className="table-wrap compact-table">
          <table>
            <thead><tr><th>Scan ID</th><th>Product</th><th>Brand</th><th>Result</th><th>Issues</th><th>Date</th><th>Actions</th></tr></thead>
            <tbody>
              {filteredRecentScans.slice(0, 8).map((s) => (
                <tr key={s.scan_id} onClick={() => goToScan(s.scan_id)}>
                  <td>#{s.scan_id}</td>
                  <td><strong>{s.product_name || 'Unnamed product'}</strong></td>
                  <td>{s.brand || '—'}</td>
                  <td><span className={`status ${s.overall_status === 'compliant' ? 'good' : s.overall_status === 'non-compliant' ? 'bad' : 'neutral'}`}>{fmt(s.overall_status)}</span></td>
                  <td>{s.overall_status === 'compliant' ? '—' : s.violations}</td>
                  <td>{new Date(s.created_at).toLocaleDateString()}</td>
                  <td className="row-actions" onClick={(e) => e.stopPropagation()}>
                    <button className="icon-action" title="View result" onClick={() => goToScan(s.scan_id)}>view</button>
                    {s.overall_status && (
                      <button
                        className="icon-action"
                        title="Download PDF report"
                        onClick={() => downloadAuthenticated(api.reportUrl(s.scan_id, 'pdf'), `scan_${s.scan_id}_report.pdf`)}
                      >
                        pdf
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {!filteredRecentScans.length && <tr><td colSpan={7} className="empty-table">No scans match the current filters.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <div className="breakdown-grid">
        <div className="panel compact-panel">
          <div className="panel-header"><h3>Violations by category</h3></div>
          {categoryData.length ? (
            <div className="bars compact-bars">
              {categoryData.map((row) => (
                <div className="bar-row" key={row.name}>
                  <span>{row.name}</span>
                  <div><i style={{ width: `${pct(row.value, categoryData[0].value)}%` }} /></div>
                  <span>{row.value}</span>
                </div>
              ))}
            </div>
          ) : <p className="muted">No category violations in this selection.</p>}
        </div>
        <div className="panel compact-panel">
          <div className="panel-header"><h3>Violations by brand</h3></div>
          {brandData.length ? (
            <div className="bars compact-bars">
              {brandData.map((row) => (
                <div className="bar-row" key={row.name}>
                  <span>{row.name}</span>
                  <div><i style={{ width: `${pct(row.value, brandData[0].value)}%` }} /></div>
                  <span>{row.value}</span>
                </div>
              ))}
            </div>
          ) : <p className="muted">No brand violations in this selection.</p>}
        </div>
        <div className="panel compact-panel">
          <div className="panel-header"><h3>Violations by region</h3></div>
          {regionData.length ? (
            <div className="bars compact-bars">
              {regionData.map((row) => (
                <div className="bar-row" key={row.name}>
                  <span>{row.name}</span>
                  <div><i style={{ width: `${pct(row.value, regionData[0].value)}%` }} /></div>
                  <span>{row.value}</span>
                </div>
              ))}
            </div>
          ) : <p className="muted">No regional violations in this selection.</p>}
        </div>
        <div className="panel compact-panel">
          <div className="panel-header"><h3>Most-violated clause</h3></div>
          {clauseData.length && topClause?.value ? (
            <div className="bars compact-bars">
              {clauseData.map((row) => (
                <div className="bar-row" key={row.name}>
                  <span>{row.name}</span>
                  <div><i style={{ width: `${pct(row.value, clauseData[0].value)}%` }} /></div>
                  <span>{row.value}</span>
                </div>
              ))}
            </div>
          ) : <p className="muted">No clause violations in this selection.</p>}
        </div>
      </div>

      {loading && <div className="dashboard-loading">Refreshing dashboard data…</div>}
    </Page>
  );
}