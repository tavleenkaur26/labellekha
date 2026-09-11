import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, XCircle, AlertTriangle, Image as ImageIcon, MapPin, Tag, Calendar, UserCheck } from 'lucide-react';
import { scanService } from '../services/scanService';
import { formatDate, getStatusBadgeClass } from '../utils/formatters';

export function ScanDetailsModal({ scanId, onClose }) {
  const [scan, setScan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!scanId) return;
    setLoading(true);
    setError(null);
    scanService
      .getScanDetails(scanId)
      .then((data) => {
        setScan(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load scan details');
        setLoading(false);
      });
  }, [scanId]);

  if (!scanId) return null;

  const imageUrl = scanService.getScanImageUrl(scanId);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc' }}>
              Inspection Detail — Scan #{scanId}
            </h2>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Legal Metrology (Packaged Commodities) Rule 6 & Rule 7 Verification
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Fetching scan records and rule verification evidence...
          </div>
        ) : error ? (
          <div style={{ padding: '24px', background: 'rgba(244, 63, 94, 0.1)', border: '1px solid var(--accent-rose)', borderRadius: '8px', color: '#fb7185' }}>
            {error}
          </div>
        ) : !scan ? null : (
          <div>
            {/* Metadata Summary Banner */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                gap: '12px',
                background: 'var(--bg-primary)',
                padding: '16px',
                borderRadius: '8px',
                marginBottom: '20px',
                border: '1px solid var(--border-color)',
              }}
            >
              <div>
                <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>Status</div>
                <div style={{ marginTop: '4px' }}>
                  <span className={getStatusBadgeClass(scan.overall_status)}>
                    {scan.overall_status || scan.status}
                  </span>
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>Brand & Category</div>
                <div style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.85rem' }}>
                  {scan.brand || 'Unbranded'} ({scan.category || 'General'})
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>Jurisdiction / Coarse Region</div>
                <div style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.85rem' }}>
                  {scan.coarse_location || 'Unspecified'}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>Timestamp</div>
                <div style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>
                  {formatDate(scan.created_at)}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>Checks Passed</div>
                <div style={{ fontWeight: 700, color: 'var(--accent-blue)', fontSize: '0.9rem' }}>
                  {scan.passed_count ?? '—'} / {scan.total_checks ?? '—'}
                </div>
              </div>
            </div>

            {/* Split View: Label Image & 7 Rule Checks */}
            <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '20px' }}>
              {/* Image Panel */}
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ImageIcon size={16} />
                  <span>Scanned Label Image</span>
                </div>
                <div
                  style={{
                    background: '#070d1e',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '260px',
                  }}
                >
                  <img
                    src={imageUrl}
                    alt={`Scan #${scanId} Label`}
                    style={{ maxWidth: '100%', maxHeight: '380px', objectFit: 'contain' }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentNode.innerHTML =
                        '<div style="color: #64748b; font-size: 0.8rem; padding: 24px; text-align: center;">Label image not stored on disk or preview unavailable</div>';
                    }}
                  />
                </div>
              </div>

              {/* Clause-by-Clause Checks */}
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '8px' }}>
                  Clause-by-Clause Rule Results & Evidence
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {(scan.results || []).map((result, idx) => {
                    const isPass = result.pass_fail === true;
                    const isFail = result.pass_fail === false;
                    const isNotEval = result.pass_fail === null;

                    return (
                      <div
                        key={idx}
                        style={{
                          background: 'var(--bg-primary)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '8px',
                          padding: '12px',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', flexWrap: 'wrap', gap: '6px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <strong style={{ color: '#f8fafc', fontSize: '0.85rem' }}>{result.clause}</strong>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                              {result.title || ''}
                            </span>
                          </div>

                          <div style={{ display: 'flex', gap: '6px' }}>
                            {/* Confidence Badge */}
                            {result.confidence && (
                              <span
                                style={{
                                  fontSize: '0.7rem',
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  background: result.confidence === 'high' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                                  color: result.confidence === 'high' ? 'var(--accent-emerald)' : 'var(--accent-gold)',
                                  border: `1px solid ${result.confidence === 'high' ? 'rgba(16, 185, 129, 0.25)' : 'rgba(245, 158, 11, 0.25)'}`,
                                }}
                              >
                                {result.confidence} conf
                              </span>
                            )}

                            {/* Pass / Fail Badge */}
                            <span
                              className={
                                isPass
                                  ? 'badge badge-compliant'
                                  : isFail
                                  ? 'badge badge-non-compliant'
                                  : 'badge badge-priority-low'
                              }
                            >
                              {isPass ? 'PASS' : isFail ? 'VIOLATION' : 'NOT EVALUATED'}
                            </span>
                          </div>
                        </div>

                        {/* Extracted Evidence */}
                        <div style={{ fontSize: '0.775rem', marginTop: '6px' }}>
                          <div style={{ color: 'var(--text-muted)', marginBottom: '2px', fontWeight: 600 }}>
                            Extracted Evidence:
                          </div>
                          <div
                            style={{
                              background: 'rgba(11, 19, 41, 0.8)',
                              padding: '6px 10px',
                              borderRadius: '4px',
                              color: result.extracted_text ? '#e2e8f0' : 'var(--text-muted)',
                              fontFamily: 'monospace',
                              fontSize: '0.75rem',
                              border: '1px solid var(--border-subtle)',
                            }}
                          >
                            {result.extracted_text || 'No declaration text detected matching this clause.'}
                          </div>
                        </div>

                        {/* Note */}
                        {result.note && (
                          <div style={{ fontSize: '0.725rem', color: '#fde68a', marginTop: '6px' }}>
                            <strong>Note:</strong> {result.note}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
