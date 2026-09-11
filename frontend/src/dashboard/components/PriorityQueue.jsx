import React from 'react';
import { ShieldAlert, CheckCircle, ExternalLink, HelpCircle } from 'lucide-react';
import { formatDate, getPriorityBadgeClass, getStatusBadgeClass } from '../utils/formatters';

export function PriorityQueue({ queue, onSelectScan, selectedPriority, onPriorityChange }) {
  return (
    <div className="panel-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
        <div className="panel-title" style={{ margin: 0 }}>
          <ShieldAlert size={20} color="var(--accent-rose)" />
          <span>Explainable Enforcement Priority Queue</span>
        </div>

        {/* Priority Filter Buttons */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((lvl) => (
            <button
              key={lvl}
              onClick={() => onPriorityChange(lvl)}
              style={{
                background: selectedPriority === lvl ? 'var(--accent-blue)' : 'var(--bg-primary)',
                color: selectedPriority === lvl ? '#0b1329' : 'var(--text-secondary)',
                border: '1px solid var(--border-color)',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      <div style={{ background: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.25)', borderRadius: '8px', padding: '12px 16px', marginBottom: '16px', fontSize: '0.825rem', color: '#bae6fd', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
        <HelpCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <strong>Transparent Ranking Rationale:</strong> Prioritization is calculated via explainable non-black-box factors: non-compliance (+30), violations (+10/ea), quality issues (+25), human review (+15), and repeat offender patterns (+15).
        </div>
      </div>

      {queue.length === 0 ? (
        <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
          No scans match the selected priority criteria.
        </div>
      ) : (
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Priority Level</th>
                <th style={{ textAlign: 'center' }}>Score</th>
                <th>Scan ID</th>
                <th>Brand / Commodity</th>
                <th>Coarse Location</th>
                <th>Status</th>
                <th>Transparent Factor Breakdown</th>
                <th>Scanned At</th>
                <th style={{ textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {queue.map((item) => (
                <tr key={item.scan_id}>
                  <td>
                    <span className={getPriorityBadgeClass(item.priority_level)}>
                      {item.priority_level}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center', fontWeight: 800, color: '#f8fafc' }}>
                    {item.priority_score}
                  </td>
                  <td style={{ fontWeight: 700, color: 'var(--accent-blue)', whiteSpace: 'nowrap' }}>
                    #{item.scan_id}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#f8fafc' }}>
                      {item.brand || 'Unbranded'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {item.category || 'General Goods'}
                    </div>
                  </td>
                  <td>{item.coarse_location || '—'}</td>
                  <td>
                    <span className={getStatusBadgeClass(item.overall_status)}>
                      {item.overall_status || 'processing'}
                    </span>
                  </td>
                  <td>
                    <ul style={{ listStyleType: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      {item.priority_reasons.map((reason, idx) => (
                        <li
                          key={idx}
                          style={{
                            fontSize: '0.725rem',
                            color: '#cbd5e1',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <span style={{ width: '4px', height: '4px', background: 'var(--accent-blue)', borderRadius: '50%', display: 'inline-block' }}></span>
                          {reason}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                    {formatDate(item.created_at)}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button
                      onClick={() => onSelectScan(item.scan_id)}
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
