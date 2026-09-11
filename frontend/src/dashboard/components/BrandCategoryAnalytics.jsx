import React from 'react';
import { Tag, Layers } from 'lucide-react';
import { formatPercent } from '../utils/formatters';

export function BrandCategoryAnalytics({ stats }) {
  const brands = stats?.brand_analytics || [];
  const categories = stats?.category_analytics || [];

  return (
    <div className="analytics-grid-two-col">
      {/* Brands Panel */}
      <div className="panel-card" style={{ marginBottom: 0 }}>
        <div className="panel-title">
          <Tag size={20} color="var(--accent-emerald)" />
          <span>Brand Compliance Analytics</span>
        </div>

        {brands.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No brand data available.
          </div>
        ) : (
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Brand</th>
                  <th style={{ textAlign: 'right' }}>Scans</th>
                  <th style={{ textAlign: 'right' }}>Violations</th>
                  <th style={{ textAlign: 'right' }}>Compliance</th>
                </tr>
              </thead>
              <tbody>
                {brands.slice(0, 8).map((b) => (
                  <tr key={b.brand}>
                    <td style={{ fontWeight: 600, color: '#f8fafc' }}>{b.brand}</td>
                    <td style={{ textAlign: 'right' }}>{b.total_scans}</td>
                    <td style={{ textAlign: 'right', color: b.total_violations > 0 ? 'var(--accent-rose)' : 'inherit' }}>
                      {b.total_violations}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>
                      {formatPercent(b.compliance_rate)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Categories Panel */}
      <div className="panel-card" style={{ marginBottom: 0 }}>
        <div className="panel-title">
          <Layers size={20} color="var(--accent-indigo)" />
          <span>Commodity Category Analytics</span>
        </div>

        {categories.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No category data available.
          </div>
        ) : (
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th style={{ textAlign: 'right' }}>Scans</th>
                  <th style={{ textAlign: 'right' }}>Violations</th>
                  <th style={{ textAlign: 'right' }}>Compliance</th>
                </tr>
              </thead>
              <tbody>
                {categories.slice(0, 8).map((c) => (
                  <tr key={c.category}>
                    <td style={{ fontWeight: 600, color: '#f8fafc' }}>{c.category}</td>
                    <td style={{ textAlign: 'right' }}>{c.total_scans}</td>
                    <td style={{ textAlign: 'right', color: c.total_violations > 0 ? 'var(--accent-rose)' : 'inherit' }}>
                      {c.total_violations}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>
                      {formatPercent(c.compliance_rate)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
