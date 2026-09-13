import { useEffect, useMemo, useState } from 'react';
import type { NavigateFn, ScanListItem } from '../types';
import { api, downloadAuthenticated } from '../utils/api';
import { Page } from './NewScan';

function formatStatus(status?: string | null) {
  if (!status) return 'Pending';

  return status
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function statusClass(status?: string | null) {
  if (status === 'compliant') return 'report-status compliant';
  if (status === 'non-compliant') return 'report-status violation';
  if (status === 'recapture_needed') return 'report-status review';

  return 'report-status pending';
}

function formatDate(value: string) {
  const date = new Date(value);

  return {
    date: date.toLocaleDateString(undefined, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }),
    time: date.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    }),
  };
}

export default function Reports({
  navigate,
}: {
  navigate: NavigateFn;
}) {
  const [rows, setRows] = useState<ScanListItem[]>([]);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    api
      .getScans()
      .then(setRows)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const completedReports = useMemo(() => {
    return rows
      .filter((row) => row.overall_status)
      .filter((row) => {
        const searchText = [
          row.scan_id,
          row.product_name,
          row.brand,
          row.category,
        ]
          .join(' ')
          .toLowerCase();

        return searchText.includes(query.toLowerCase());
      })
      .filter((row) => !status || row.overall_status === status);
  }, [rows, query, status]);

  const compliantCount = rows.filter(
    (row) => row.overall_status === 'compliant'
  ).length;

  const violationCount = rows.filter(
    (row) => row.overall_status === 'non-compliant'
  ).length;

  const reviewCount = rows.filter(
    (row) =>
      row.needs_human_review ||
      row.overall_status === 'recapture_needed'
  ).length;

  return (
    <Page
      title="Reports & exports"
      subtitle="Generate and retrieve inspection reports from completed scans."
    >
      <div className="reports-page">

        {/* Header actions */}
        <div className="reports-toolbar">
          <div>
            <span className="reports-eyebrow">REPORT MANAGEMENT</span>
            <h2>Inspection reports</h2>
            <p>
              Download official report files generated from completed
              inspections.
            </p>
          </div>

          <button
            className="reports-history-button"
            onClick={() => navigate('products')}
          >
            <span>⌕</span>
            Search history
          </button>
        </div>

        {/* Summary */}
        <div className="reports-summary">
          <div className="report-stat">
            <span className="report-stat-label">Total reports</span>
            <strong>{rows.filter((r) => r.overall_status).length}</strong>
            <small>Completed inspections</small>
          </div>

          <div className="report-stat">
            <span className="report-stat-label">Compliant</span>
            <strong>{compliantCount}</strong>
            <small>Passed inspections</small>
          </div>

          <div className="report-stat">
            <span className="report-stat-label">Non-compliant</span>
            <strong>{violationCount}</strong>
            <small>Recorded violations</small>
          </div>

          <div className="report-stat">
            <span className="report-stat-label">Review required</span>
            <strong>{reviewCount}</strong>
            <small>Human verification</small>
          </div>
        </div>

        {/* Report list */}
        <section className="reports-panel">

          <div className="reports-panel-header">
            <div>
              <h3>Generated reports</h3>
              <p>
                {completedReports.length} report
                {completedReports.length !== 1 ? 's' : ''} available
              </p>
            </div>

            <div className="reports-filters">
              <div className="reports-search">
                <span>⌕</span>
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search reports..."
                />
              </div>

              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
              >
                <option value="">All statuses</option>
                <option value="compliant">Compliant</option>
                <option value="non-compliant">Non-compliant</option>
                <option value="recapture_needed">
                  Recapture needed
                </option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="reports-loading">
              <div />
              <div />
              <div />
            </div>
          ) : completedReports.length === 0 ? (
            <div className="reports-empty">
              <div className="reports-empty-icon">▤</div>
              <h3>No reports found</h3>
              <p>
                Completed inspection reports will appear here once scans
                have been processed.
              </p>
            </div>
          ) : (
            <div className="reports-table-wrap">
              <table className="reports-table">
                <thead>
                  <tr>
                    <th>REPORT</th>
                    <th>PRODUCT</th>
                    <th>STATUS</th>
                    <th>VIOLATIONS</th>
                    <th>GENERATED</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>

                <tbody>
                  {completedReports.map((row) => {
                    const date = formatDate(row.created_at);

                    return (
                      <tr key={row.scan_id}>
                        <td>
                          <div className="report-id">
                            <span className="report-file-icon">PDF</span>

                            <div>
                              <strong>
                                Scan #{row.scan_id}
                              </strong>
                              <small>
                                Inspection report
                              </small>
                            </div>
                          </div>
                        </td>

                        <td>
                          <div className="report-product">
                            <strong>
                              {row.product_name || 'Unnamed product'}
                            </strong>

                            <small>
                              {row.brand || 'No brand'}
                              {row.category
                                ? ` · ${row.category}`
                                : ''}
                            </small>
                          </div>
                        </td>

                        <td>
                          <span className={statusClass(row.overall_status)}>
                            <span className="status-dot" />
                            {formatStatus(row.overall_status)}
                          </span>
                        </td>

                        <td>
                          <span
                            className={
                              row.violations > 0
                                ? 'violation-count'
                                : 'violation-count zero'
                            }
                          >
                            {row.violations}
                          </span>
                        </td>

                        <td>
                          <div className="report-date">
                            <strong>{date.date}</strong>
                            <small>{date.time}</small>
                          </div>
                        </td>

                        <td>
                          <div className="report-actions">
                            <button
                              className="report-action secondary"
                              onClick={() =>
                                downloadAuthenticated(
                                  api.reportUrl(
                                    row.scan_id,
                                    'csv'
                                  ),
                                  `scan_${row.scan_id}_report.csv`
                                )
                              }
                            >
                              CSV
                            </button>

                            <button
                              className="report-action primary"
                              onClick={() =>
                                downloadAuthenticated(
                                  api.reportUrl(
                                    row.scan_id,
                                    'pdf'
                                  ),
                                  `scan_${row.scan_id}_report.pdf`
                                )
                              }
                            >
                              PDF
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      <style>{`
        .reports-page {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .reports-toolbar {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 24px;
        }

        .reports-eyebrow {
          display: block;
          margin-bottom: 6px;
          color: var(--olive, #58613a);
          font-family: 'IBM Plex Mono', monospace;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.12em;
        }

        .reports-toolbar h2 {
          margin: 0;
          color: var(--charcoal, #252923);
          font-size: 25px;
          font-weight: 700;
          letter-spacing: -0.025em;
        }

        .reports-toolbar p {
          margin: 5px 0 0;
          color: #777b74;
          font-size: 13px;
        }

        .reports-history-button {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          height: 38px;
          padding: 0 14px;
          border: 1px solid #d9ddd5;
          border-radius: 7px;
          background: #fff;
          color: #42473f;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
        }

        .reports-history-button:hover {
          border-color: #aeb5a5;
          background: #f8f9f6;
        }

        .reports-summary {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          border: 1px solid #e1e4df;
          border-radius: 9px;
          background: #fff;
          overflow: hidden;
        }

        .report-stat {
          min-height: 104px;
          padding: 17px 20px;
          border-right: 1px solid #e6e8e4;
        }

        .report-stat:last-child {
          border-right: 0;
        }

        .report-stat-label {
          display: block;
          margin-bottom: 8px;
          color: #7a7f77;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        .report-stat strong {
          display: block;
          color: #292d28;
          font-size: 25px;
          line-height: 1;
        }

        .report-stat small {
          display: block;
          margin-top: 7px;
          color: #92968f;
          font-size: 11px;
        }

        .reports-panel {
          overflow: hidden;
          border: 1px solid #e1e4df;
          border-radius: 9px;
          background: #fff;
        }

        .reports-panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          padding: 18px 20px;
          border-bottom: 1px solid #e5e7e3;
        }

        .reports-panel-header h3 {
          margin: 0;
          color: #30342f;
          font-size: 14px;
          font-weight: 700;
        }

        .reports-panel-header p {
          margin: 4px 0 0;
          color: #92968f;
          font-size: 11px;
        }

        .reports-filters {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .reports-search {
          display: flex;
          align-items: center;
          gap: 7px;
          width: 210px;
          height: 34px;
          padding: 0 10px;
          border: 1px solid #dfe2dd;
          border-radius: 6px;
          background: #fff;
        }

        .reports-search span {
          color: #8b9088;
          font-size: 15px;
        }

        .reports-search input {
          width: 100%;
          border: 0;
          outline: 0;
          background: transparent;
          color: #30342f;
          font: inherit;
          font-size: 12px;
        }

        .reports-search input::placeholder {
          color: #9b9f98;
        }

        .reports-filters select {
          height: 34px;
          min-width: 140px;
          padding: 0 28px 0 10px;
          border: 1px solid #dfe2dd;
          border-radius: 6px;
          background: #fff;
          color: #4c514a;
          font-size: 12px;
          outline: none;
        }

        .reports-table-wrap {
          width: 100%;
          overflow-x: auto;
        }

        .reports-table {
          width: 100%;
          border-collapse: collapse;
          table-layout: fixed;
        }

        .reports-table th {
          padding: 11px 16px;
          border-bottom: 1px solid #e5e7e3;
          background: #fafbf9;
          color: #858a82;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 9px;
          font-weight: 500;
          letter-spacing: 0.08em;
          text-align: left;
        }

        .reports-table td {
          padding: 14px 16px;
          border-bottom: 1px solid #eceeea;
          vertical-align: middle;
        }

        .reports-table tbody tr:last-child td {
          border-bottom: 0;
        }

        .reports-table tbody tr:hover {
          background: #fafbf9;
        }

        .report-id {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .report-file-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 31px;
          height: 31px;
          border: 1px solid #dce0da;
          border-radius: 5px;
          background: #f7f8f5;
          color: #686e63;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 8px;
          font-weight: 600;
        }

        .report-id strong,
        .report-product strong,
        .report-date strong {
          display: block;
          color: #343832;
          font-size: 12px;
          font-weight: 600;
        }

        .report-id small,
        .report-product small,
        .report-date small {
          display: block;
          margin-top: 3px;
          color: #969a93;
          font-size: 10px;
        }

        .report-product small {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .report-status {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 8px;
          border-radius: 5px;
          font-size: 10px;
          font-weight: 600;
          white-space: nowrap;
        }

        .report-status.compliant {
          background: #edf4ed;
          color: #4d7050;
        }

        .report-status.violation {
          background: #f8eded;
          color: #9a5555;
        }

        .report-status.review {
          background: #f8f2e5;
          color: #8b6d39;
        }

        .report-status.pending {
          background: #f1f2ef;
          color: #747971;
        }

        .status-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: currentColor;
        }

        .violation-count {
          color: #9a5555;
          font-size: 12px;
          font-weight: 700;
        }

        .violation-count.zero {
          color: #737970;
        }

        .report-actions {
          display: flex;
          justify-content: flex-end;
          gap: 6px;
        }

        .report-action {
          height: 30px;
          padding: 0 10px;
          border-radius: 5px;
          font-size: 10px;
          font-weight: 700;
          cursor: pointer;
        }

        .report-action.secondary {
          border: 1px solid #d9ddd5;
          background: #fff;
          color: #596057;
        }

        .report-action.primary {
          border: 1px solid #59613e;
          background: #59613e;
          color: #fff;
        }

        .report-action:hover {
          opacity: 0.88;
        }

        .reports-empty {
          display: flex;
          min-height: 270px;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px;
          text-align: center;
        }

        .reports-empty-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 42px;
          height: 42px;
          margin-bottom: 12px;
          border: 1px solid #dfe2dc;
          border-radius: 7px;
          background: #f8f9f6;
          color: #737970;
        }

        .reports-empty h3 {
          margin: 0;
          color: #3a3e38;
          font-size: 14px;
        }

        .reports-empty p {
          max-width: 360px;
          margin: 6px 0 0;
          color: #92968f;
          font-size: 12px;
          line-height: 1.5;
        }

        .reports-loading {
          display: flex;
          flex-direction: column;
        }

        .reports-loading div {
          height: 61px;
          border-bottom: 1px solid #eceeea;
          background: linear-gradient(
            90deg,
            #fff 0%,
            #f6f7f4 50%,
            #fff 100%
          );
          animation: reportPulse 1.4s ease-in-out infinite;
        }

        @keyframes reportPulse {
          0%, 100% {
            opacity: 0.55;
          }
          50% {
            opacity: 1;
          }
        }

        @media (max-width: 900px) {
          .reports-summary {
            grid-template-columns: repeat(2, 1fr);
          }

          .report-stat:nth-child(2) {
            border-right: 0;
          }

          .report-stat:nth-child(-n+2) {
            border-bottom: 1px solid #e6e8e4;
          }

          .reports-panel-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .reports-filters {
            width: 100%;
          }

          .reports-search {
            flex: 1;
          }
        }

        @media (max-width: 640px) {
          .reports-toolbar {
            align-items: flex-start;
            flex-direction: column;
          }

          .reports-summary {
            grid-template-columns: 1fr 1fr;
          }

          .reports-filters {
            align-items: stretch;
            flex-direction: column;
          }

          .reports-search,
          .reports-filters select {
            width: 100%;
          }
        }
      `}</style>
    </Page>
  );
}