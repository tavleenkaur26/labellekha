import React from 'react';
import { Eye, AlertCircle, ExternalLink, HelpCircle } from 'lucide-react';
import { formatDate, getStatusBadgeClass } from '../utils/formatters';

export function HumanReviewQueue({ reviews, onSelectScan }) {
  return (
    <div className="panel-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
        <div className="panel-title" style={{ margin: 0 }}>
          <Eye size={20} color="var(--accent-amber)" />
          <span>Adaptive Evidence-Driven Human Review Queue</span>
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          Flagged Inspections: <strong style={{ color: 'var(--accent-amber)' }}>{reviews.length}</strong>
        </div>
      </div>

      <div style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: '8px', padding: '12px 16px', marginBottom: '16px', fontSize: '0.825rem', color: '#fde68a', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
        <HelpCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <strong>Adaptive Evidence Policy:</strong> The engine avoids penalizing missing declarations as confirmed violations when OCR or visual evidence is ambiguous. Scans below undergo secondary inspector verification.
        </div>
      </div>

      {reviews.length === 0 ? (
        <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
          No scans currently require human review.
        </div>
      ) : (
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Scan ID</th>
                <th>Brand / Commodity</th>
                <th>Coarse Location</th>
                <th>Recorded Status</th>
                <th>Flagged Triggers / Uncertainty Reasons</th>
                <th>Scanned At</th>
                <th style={{ textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((scan) => (
                <tr key={scan.scan_id}>
                  <td style={{ fontWeight: 700, color: 'var(--accent-blue)', whiteSpace: 'nowrap' }}>
                    #{scan.scan_id}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#f8fafc' }}>
                      {scan.brand || 'Unbranded / Unknown'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {scan.category || 'Packaged Commodity'}
                    </div>
                  </td>
                  <td>{scan.coarse_location || '—'}</td>
                  <td>
                    <span className={getStatusBadgeClass(scan.overall_status || scan.status)}>
                      {scan.overall_status || scan.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {scan.review_reasons.map((reason, idx) => (
                        <span
                          key={idx}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '0.75rem',
                            color: '#fde68a',
                            background: 'rgba(245, 158, 11, 0.12)',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            border: '1px solid rgba(245, 158, 11, 0.2)',
                          }}
                        >
                          <AlertCircle size={12} />
                          {reason}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                    {formatDate(scan.created_at)}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button
                      onClick={() => onSelectScan(scan.scan_id)}
                      style={{
                        background: 'rgba(56, 189, 248, 0.15)',
                        color: 'var(--accent-blue)',
                        border: '1px solid rgba(56, 189, 248, 0.3)',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <ExternalLink size={12} />
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
