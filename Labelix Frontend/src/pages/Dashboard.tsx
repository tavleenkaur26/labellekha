import { useEffect, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
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
import { api } from '../utils/api';
import { Page } from './NewScan';

const CLAUSES = [
  'Rule 6(1)(a)',
  'Rule 6(1)(b)',
  'Rule 6(1)(c)',
  'Rule 6(1)(d)',
  'Rule 6(1)(e)',
  'Rule 6(2)',
];

const fmt = (s?: string | null) =>
  s ? s.replaceAll('-', ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : '—';

const chartData = (values: Record<string, number> = {}) =>
  Object.entries(values)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, value]) => ({ name, value }));

const clauseData = (values: Record<string, number> = {}) =>
  CLAUSES.map((clause) => ({ name: clause, value: values[clause] || 0 }));

export default function Dashboard({
  navigate,
  session,
}: {
  navigate: NavigateFn;
  session: UserSession | null;
}) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
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

  const loadDashboard = async () => {
    setLoading(true);
    setError('');
    try {
      const allScans = await api.getScans();
      setScans(allScans);

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
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  loadDashboard();
}, []);

  const applyFilters = () => loadDashboard();
  const clearFilters = () => {
    setCategory('');
    setDateFrom('');
    setDateTo('');
    window.setTimeout(() => loadDashboard(), 0);
  };

  const categoryData = chartData(stats?.violations_by_category);
  const brandData = chartData(stats?.violations_by_brand);
  const regionData = chartData(stats?.violations_by_area);
  const clauseValues = clauseData(stats?.violations_by_clause);
  const topClause = clauseValues.reduce(
    (top, item) => (item.value > top.value ? item : top),
    { name: 'No violations', value: 0 },
  );

  const complianceData = stats
    ? [
        { name: 'Compliant', value: stats.compliant_count },
        { name: 'Non-compliant', value: stats.non_compliant_count },
      ]
    : [];

  return (
    <Page
      title="Dashboard"
      subtitle={`Inspection intelligence for ${session?.name || 'your account'}. Use the patterns below to prioritize field inspections.`}
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

      <div className="stat-grid">
        {[
          ['Total scans', stats?.total_scans ?? '—'],
          ['Compliance rate', stats ? `${stats.compliance_rate}%` : '—'],
          ['Non-compliant', stats?.non_compliant_count ?? '—'],
          ['Needs inspection', stats?.human_review_count ?? '—'],
        ].map(([label, value]) => (
          <div className="stat-card" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>

      <div className="priority-banner">
        <div>
          <span className="eyebrow">Inspection priority signal</span>
          <h3>{topClause.value ? `${topClause.name} is the most violated clause` : 'No violation pattern yet'}</h3>
          <p>
            {topClause.value
              ? `${topClause.value} recorded failure${topClause.value === 1 ? '' : 's'} in the selected dataset. Use this signal to focus inspection attention where risk is concentrated.`
              : 'Run more scans to surface the strongest compliance patterns and prioritize inspections.'}
          </p>
        </div>
        <div className="priority-banner-score">
          <strong>{stats?.total_violations ?? 0}</strong>
          <span>Total violations</span>
        </div>
      </div>

      <div className="analytics-grid">
        <div className="panel chart-panel">
          <div className="panel-header"><div><h3>Violations by category</h3><p className="muted">Where non-compliance is concentrated.</p></div></div>
          <div className="chart-box">
            {categoryData.length ? <ResponsiveContainer width="100%" height="100%"><BarChart data={categoryData} margin={{ top: 8, right: 10, left: -15, bottom: 45 }}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="name" angle={-30} textAnchor="end" interval={0} tick={{ fontSize: 10 }} /><YAxis allowDecimals={false} tick={{ fontSize: 10 }} /><Tooltip /><Bar dataKey="value" name="Violations" radius={[4,4,0,0]} /></BarChart></ResponsiveContainer> : <div className="empty-chart">No category violations in this selection.</div>}
          </div>
        </div>

        <div className="panel chart-panel">
          <div className="panel-header"><div><h3>Violations by brand</h3><p className="muted">Brands generating the highest violation counts.</p></div></div>
          <div className="chart-box">
            {brandData.length ? <ResponsiveContainer width="100%" height="100%"><BarChart data={brandData} margin={{ top: 8, right: 10, left: -15, bottom: 45 }}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="name" angle={-30} textAnchor="end" interval={0} tick={{ fontSize: 10 }} /><YAxis allowDecimals={false} tick={{ fontSize: 10 }} /><Tooltip /><Bar dataKey="value" name="Violations" radius={[4,4,0,0]} /></BarChart></ResponsiveContainer> : <div className="empty-chart">No brand violations in this selection.</div>}
          </div>
        </div>

        <div className="panel chart-panel">
          <div className="panel-header"><div><h3>Violations by region</h3><p className="muted">Geographic hotspots for inspection planning.</p></div></div>
          <div className="chart-box">
            {regionData.length ? <ResponsiveContainer width="100%" height="100%"><BarChart data={regionData} margin={{ top: 8, right: 10, left: -15, bottom: 45 }}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="name" angle={-30} textAnchor="end" interval={0} tick={{ fontSize: 10 }} /><YAxis allowDecimals={false} tick={{ fontSize: 10 }} /><Tooltip /><Bar dataKey="value" name="Violations" radius={[4,4,0,0]} /></BarChart></ResponsiveContainer> : <div className="empty-chart">No regional violations in this selection.</div>}
          </div>
        </div>

        <div className="panel chart-panel clause-panel">
          <div className="panel-header"><div><h3>Most-violated clause</h3><p className="muted">All six compliance rules across the selected dataset.</p></div><span className="count">{topClause.value} top failures</span></div>
          <div className="chart-box clause-chart">
            <ResponsiveContainer width="100%" height="100%"><BarChart data={clauseValues} layout="vertical" margin={{ top: 5, right: 20, left: 35, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" horizontal={false} /><XAxis type="number" allowDecimals={false} tick={{ fontSize: 10 }} /><YAxis type="category" dataKey="name" width={105} tick={{ fontSize: 10 }} /><Tooltip /><Bar dataKey="value" name="Failures" radius={[0,4,4,0]}>{clauseValues.map((entry) => <Cell key={entry.name} />)}</Bar></BarChart></ResponsiveContainer>
          </div>
        </div>

        <div className="panel chart-panel compliance-panel">
          <div className="panel-header"><div><h3>Compliance mix</h3><p className="muted">Overall outcome of the selected scans.</p></div></div>
          <div className="donut-wrap">
            {stats?.total_scans ? <><ResponsiveContainer width="58%" height="100%"><PieChart><Pie data={complianceData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={82} paddingAngle={3}>{complianceData.map((entry) => <Cell key={entry.name} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer><div className="donut-legend">{complianceData.map((item) => <div key={item.name}><i /> <span>{item.name}</span><strong>{item.value}</strong></div>)}</div></> : <div className="empty-chart">No scans in this selection.</div>}
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="panel">
          <div className="panel-header"><div><h3>Recent scans</h3><p className="muted">Records available to this account.</p></div><button className="text-button" onClick={() => navigate('products')}>View all</button></div>
          <div className="table-wrap"><table><thead><tr><th>Scan</th><th>Product</th><th>Status</th><th>Violations</th><th>Date</th></tr></thead><tbody>
            {filteredRecentScans.slice(0, 8).map((s) => <tr key={s.scan_id} onClick={() => { localStorage.setItem('labelix_last_scan', String(s.scan_id)); navigate('inspection-result'); }}><td>#{s.scan_id}</td><td><strong>{s.product_name || 'Unnamed product'}</strong><small>{s.brand || 'No brand'}</small></td><td><span className={`status ${s.overall_status === 'compliant' ? 'good' : s.overall_status === 'non-compliant' ? 'bad' : 'neutral'}`}>{fmt(s.overall_status)}</span></td><td>{s.violations}</td><td>{new Date(s.created_at).toLocaleDateString()}</td></tr>)}
            {!filteredRecentScans.length && <tr><td colSpan={5} className="empty-table">No scans match the current filters.</td></tr>}
          </tbody></table></div>
        </div>
        <div className="side-stack">
          <div className="panel"><div className="panel-header"><h3>Review queue</h3><span className="count">{review.length}</span></div>{review.slice(0,5).map((r) => <div className="queue-row" key={r.scan_id}><div><strong>#{r.scan_id} · {r.product_name || 'Unnamed'}</strong><p>{r.reason}</p></div><span className="status neutral">{r.confidence}</span></div>)}{!review.length && <p className="muted">No scans currently require manual review.</p>}</div>
          <div className="panel"><div className="panel-header"><div><h3>Priority queue</h3><p className="muted">Higher score = stronger inspection signal.</p></div></div>{priority.slice(0,5).map((p) => <div className="queue-row" key={p.scan_id}><div><strong>#{p.scan_id} · {p.product_name || 'Unnamed'}</strong><p>{p.reason}</p></div><strong className="priority-score">{p.priority_score}</strong></div>)}{!priority.length && <p className="muted">No non-compliant scans are currently prioritized.</p>}</div>
        </div>
      </div>

      {loading && <div className="dashboard-loading">Refreshing dashboard data…</div>}
    </Page>
  );
}
