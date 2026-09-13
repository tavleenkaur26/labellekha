import { useEffect, useMemo, useState } from 'react';
import type { NavigateFn, ScanListItem } from '../types';
import { api, downloadAuthenticated } from '../utils/api';
import { Page } from './NewScan';

const PAGE_SIZE = 10;

function statusLabel(status?: string | null) {
  if (!status) return 'Unknown';
  if (status === 'non-compliant') return 'Non-compliant';
  if (status === 'recapture_needed') return 'Recapture needed';
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function statusClass(status?: string | null) {
  if (status === 'compliant') return 'records-status records-status-good';
  if (status === 'non-compliant') return 'records-status records-status-bad';
  if (status === 'recapture_needed') return 'records-status records-status-warn';
  return 'records-status records-status-neutral';
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function Products({ navigate }: { navigate: NavigateFn }) {
  const [rows, setRows] = useState<ScanListItem[]>([]);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');
  const [review, setReview] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [appliedFilters, setAppliedFilters] = useState({
    status: '',
    category: '',
    review: '',
    fromDate: '',
    toDate: '',
  });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reportingId, setReportingId] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    api.getScans()
      .then((data) => {
        if (active) setRows(data);
      })
      .catch((e) => {
        if (active) setError(e instanceof Error ? e.message : 'Unable to load inspection records.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  const categories = useMemo(
    () => Array.from(new Set(rows.map((r) => r.category).filter(Boolean) as string[])).sort(),
    [rows]
  );

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return rows.filter((r) => {
      const searchable = `${r.scan_id} ${r.product_name || ''} ${r.brand || ''} ${r.category || ''} ${r.region || ''}`.toLowerCase();
      const created = new Date(r.created_at);
      const from = appliedFilters.fromDate ? new Date(`${appliedFilters.fromDate}T00:00:00`) : null;
      const to = appliedFilters.toDate ? new Date(`${appliedFilters.toDate}T23:59:59.999`) : null;
      return (
        (!query || searchable.includes(query)) &&
        (!appliedFilters.status || r.overall_status === appliedFilters.status) &&
        (!appliedFilters.category || r.category === appliedFilters.category) &&
        (!appliedFilters.review || (appliedFilters.review === 'required' ? r.needs_human_review : !r.needs_human_review)) &&
        (!from || created >= from) &&
        (!to || created <= to)
      );
    });
  }, [rows, q, appliedFilters]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visibleRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const activeFilterCount = [appliedFilters.status, appliedFilters.category, appliedFilters.review, appliedFilters.fromDate, appliedFilters.toDate].filter(Boolean).length;

  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount]);

  function applyFilters() {
    setAppliedFilters({ status, category, review, fromDate, toDate });
    setPage(1);
  }

  function clearFilters() {
    setQ('');
    setStatus('');
    setCategory('');
    setReview('');
    setFromDate('');
    setToDate('');
    setAppliedFilters({ status: '', category: '', review: '', fromDate: '', toDate: '' });
    setPage(1);
  }

  function openScan(id: number) {
    localStorage.setItem('labelix_last_scan', String(id));
    navigate('inspection-result');
  }

  async function downloadPdf(id: number) {
    setReportingId(id);
    try {
      await downloadAuthenticated(api.reportUrl(id, 'pdf'), `scan_${id}_report.pdf`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Report download failed.');
    } finally {
      setReportingId(null);
    }
  }

  return (
    <Page title="Search & History" subtitle="Search, review and retrieve previous inspection records.">
      <style>{`
        .records-page{display:flex;flex-direction:column;gap:14px}
        .records-toolbar{background:#fff;border:1px solid #dfe4e8;border-radius:12px;padding:14px;box-shadow:0 1px 2px rgba(23,32,42,.03)}
        .records-search-row{display:flex;gap:10px;align-items:center}
        .records-search{position:relative;flex:1}
        .records-search-icon{position:absolute;left:13px;top:50%;transform:translateY(-50%);color:#8a959d;font-size:15px;pointer-events:none}
        .records-search input{width:100%;height:42px;border:1px solid #ccd5db;border-radius:8px;padding:0 13px 0 36px;outline:none;color:#17202a;background:#fff}
        .records-search input:focus,.records-filter select:focus,.records-date input:focus{border-color:#829a8b;box-shadow:0 0 0 3px #eef4f0}
        .records-filter-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:8px;margin-top:10px}
        .records-filter label,.records-date label{display:block;font:600 9px 'IBM Plex Mono',monospace;letter-spacing:.08em;text-transform:uppercase;color:#7b8790;margin:0 0 5px}
        .records-filter select,.records-date input{width:100%;height:38px;border:1px solid #d4dbe0;border-radius:7px;background:#fafbfb;color:#34414a;padding:0 10px;outline:none;font-size:12px}
        .records-date{min-width:0}.records-date input{font-size:12px}
        .records-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:10px}
        .records-action{height:36px;border-radius:7px;padding:0 12px;border:1px solid #ccd5db;background:#fff;color:#4d5962;font-size:12px;font-weight:600}
        .records-action:hover{background:#f5f7f7}.records-action.primary{background:#263a31;border-color:#263a31;color:#fff}.records-action.primary:hover{background:#31483c}
        .records-summary{display:flex;justify-content:space-between;align-items:end;padding:4px 2px 0}
        .records-summary h3{margin:0;font-size:14px;letter-spacing:-.01em}.records-summary p{margin:4px 0 0;color:#7b8790;font-size:11px}.records-summary-meta{display:flex;align-items:center;gap:8px;color:#7b8790;font-size:11px}.records-count{font:500 11px 'IBM Plex Mono',monospace;background:#eef1f2;border-radius:99px;padding:5px 8px;color:#53606a}
        .records-table-card{background:#fff;border:1px solid #dfe4e8;border-radius:12px;overflow:hidden;box-shadow:0 1px 2px rgba(23,32,42,.03)}
        .records-table-wrap{overflow-x:auto}.records-table{width:100%;border-collapse:collapse;min-width:820px}.records-table th{text-align:left;padding:11px 14px;border-bottom:1px solid #dfe4e8;color:#7b8790;font:600 9px 'IBM Plex Mono',monospace;letter-spacing:.09em;text-transform:uppercase;background:#fbfcfc;white-space:nowrap}.records-table td{padding:13px 14px;border-bottom:1px solid #edf0f2;font-size:12px;color:#47535c;vertical-align:middle}.records-table tbody tr{cursor:pointer;transition:background .12s ease}.records-table tbody tr:hover{background:#fafcfa}.records-table tbody tr:last-child td{border-bottom:0}
        .record-id{font:600 11px 'IBM Plex Mono',monospace;color:#5e6973}.record-product strong{display:block;font-size:12px;color:#17202a;font-weight:600}.record-product small{display:block;margin-top:3px;color:#8a959d;font-size:10px}.record-category{color:#56626c}.records-status{display:inline-flex;align-items:center;gap:5px;padding:5px 8px;border-radius:5px;font:600 9px 'IBM Plex Mono',monospace;text-transform:uppercase;white-space:nowrap}.records-status-good{color:#1d7a53;background:#eaf6ef}.records-status-bad{color:#a43d3d;background:#faeded}.records-status-warn{color:#8a651d;background:#fbf3dc}.records-status-neutral{color:#5e6b75;background:#eef1f3}.review-required{display:inline-flex;align-items:center;gap:5px;color:#8a651d;font-size:11px;font-weight:600}.review-dot{width:6px;height:6px;border-radius:50%;background:#c99a35}.review-clear{color:#a0a8ae;font-size:12px}.record-date strong{display:block;font-size:11px;color:#4c5861;font-weight:500}.record-date small{display:block;margin-top:3px;color:#969fa5;font-size:10px}.record-action{opacity:0;display:inline-flex;align-items:center;gap:6px;border:0;background:transparent;color:#526c5d;font-size:11px;font-weight:700;padding:5px 4px}.records-table tbody tr:hover .record-action{opacity:1}.record-action:disabled{opacity:.5;cursor:wait}
        .records-empty{padding:58px 24px;text-align:center}.records-empty-mark{width:42px;height:42px;border:1px solid #dfe4e8;border-radius:9px;display:grid;place-items:center;margin:0 auto 13px;color:#7f8a92;font-size:18px}.records-empty h3{margin:0;font-size:15px}.records-empty p{margin:6px 0 15px;color:#7b8790;font-size:12px}.records-error{margin:12px 14px 0}.records-loading{padding:8px 0}.records-skeleton{height:50px;border-bottom:1px solid #edf0f2;position:relative;overflow:hidden}.records-skeleton:before{content:'';position:absolute;left:14px;right:14px;top:15px;height:10px;background:#f0f2f3;border-radius:4px}.records-footer{display:flex;justify-content:space-between;align-items:center;padding:11px 14px;border-top:1px solid #edf0f2;background:#fbfcfc;color:#7b8790;font-size:11px}.records-pages{display:flex;gap:4px}.records-page-btn{min-width:29px;height:29px;border:1px solid #d6dde1;border-radius:6px;background:#fff;color:#59656e;font-size:11px}.records-page-btn.active{background:#263a31;border-color:#263a31;color:#fff}.records-page-btn:disabled{opacity:.45;cursor:not-allowed}
        @media(max-width:900px){.records-filter-grid{grid-template-columns:repeat(3,minmax(0,1fr))}.records-search-row{align-items:stretch}.records-search-row>.records-action{flex:none}}
        @media(max-width:650px){.records-filter-grid{grid-template-columns:1fr 1fr}.records-summary{align-items:flex-start;gap:10px;flex-direction:column}.records-actions{justify-content:stretch}.records-actions .records-action{flex:1}.records-footer{align-items:flex-start;gap:10px;flex-direction:column}}
      `}</style>

      <div className="records-page">
        <section className="records-toolbar" aria-label="Inspection search and filters">
          <div className="records-search-row">
            <div className="records-search">
              <span className="records-search-icon">⌕</span>
              <input
                value={q}
                onChange={(e) => { setQ(e.target.value); setPage(1); }}
                placeholder="Search inspections, products, brands or regions…"
                aria-label="Search inspections"
              />
            </div>
            <button className="records-action primary" onClick={applyFilters}>Apply filters</button>
          </div>

          <div className="records-filter-grid">
            <div className="records-filter"><label>Status</label><select value={status} onChange={(e) => setStatus(e.target.value)}><option value="">All statuses</option><option value="compliant">Compliant</option><option value="non-compliant">Non-compliant</option><option value="pending">Pending</option><option value="recapture_needed">Recapture needed</option></select></div>
            <div className="records-filter"><label>Category</label><select value={category} onChange={(e) => setCategory(e.target.value)}><option value="">All categories</option>{categories.map((item) => <option key={item} value={item}>{item}</option>)}</select></div>
            <div className="records-filter"><label>Review status</label><select value={review} onChange={(e) => setReview(e.target.value)}><option value="">All review states</option><option value="required">Needs review</option><option value="clear">No review required</option></select></div>
            <div className="records-date"><label>From date</label><input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} /></div>
            <div className="records-date"><label>To date</label><input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} /></div>
          </div>

          <div className="records-actions">
            <button className="records-action" onClick={clearFilters}>Clear {activeFilterCount ? `(${activeFilterCount})` : ''}</button>
          </div>
        </section>

        <div className="records-summary">
          <div><h3>Inspection records</h3><p>Review and retrieve scans available to your account.</p></div>
          <div className="records-summary-meta"><span>{loading ? 'Loading records…' : 'Updated recently'}</span><span className="records-count">{filtered.length} {filtered.length === 1 ? 'record' : 'records'}</span></div>
        </div>

        <section className="records-table-card">
          {error && <div className="error-box records-error">{error}</div>}
          {loading ? (
            <div className="records-loading" aria-label="Loading inspection records">{Array.from({ length: 7 }).map((_, i) => <div className="records-skeleton" key={i} />)}</div>
          ) : filtered.length === 0 ? (
            <div className="records-empty">
              <div className="records-empty-mark">⌕</div>
              <h3>No inspections found</h3>
              <p>Try adjusting your search or filters.</p>
              <button className="records-action primary" onClick={clearFilters}>Clear filters</button>
            </div>
          ) : (
            <>
              <div className="records-table-wrap">
                <table className="records-table">
                  <thead><tr><th>Inspection</th><th>Product</th><th>Category</th><th>Status</th><th>Review</th><th>Location</th><th>Date</th><th>Action</th></tr></thead>
                  <tbody>
                    {visibleRows.map((r) => (
                      <tr key={r.scan_id} onClick={() => openScan(r.scan_id)}>
                        <td><span className="record-id">#{r.scan_id}</span></td>
                        <td className="record-product"><strong>{r.product_name || 'Unnamed product'}</strong><small>{r.brand || 'Brand not recorded'}</small></td>
                        <td className="record-category">{r.category || '—'}</td>
                        <td><span className={statusClass(r.overall_status)}>{statusLabel(r.overall_status)}</span></td>
                        <td>{r.needs_human_review ? <span className="review-required"><span className="review-dot" />Needs review</span> : <span className="review-clear">—</span>}</td>
                        <td>{r.region || '—'}</td>
                        <td className="record-date"><strong>{formatDate(r.created_at)}</strong><small>{formatTime(r.created_at)}</small></td>
                        <td><button className="record-action" disabled={reportingId === r.scan_id} onClick={(e) => { e.stopPropagation(); void downloadPdf(r.scan_id); }}>{reportingId === r.scan_id ? 'Preparing…' : 'Report →'}</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="records-footer">
                <span>Showing {filtered.length ? (page - 1) * PAGE_SIZE + 1 : 0}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}</span>
                <div className="records-pages">
                  <button className="records-page-btn" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>‹</button>
                  {Array.from({ length: pageCount }, (_, i) => i + 1).slice(Math.max(0, page - 3), Math.min(pageCount, page + 2)).map((n) => <button key={n} className={`records-page-btn ${page === n ? 'active' : ''}`} onClick={() => setPage(n)}>{n}</button>)}
                  <button className="records-page-btn" disabled={page === pageCount} onClick={() => setPage((p) => Math.min(pageCount, p + 1))}>›</button>
                </div>
              </div>
            </>
          )}
        </section>
      </div>
    </Page>
  );
}
