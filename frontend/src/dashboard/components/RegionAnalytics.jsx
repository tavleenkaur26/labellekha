import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { MapPin, ShieldAlert } from 'lucide-react';
import { formatPercent } from '../utils/formatters';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export function RegionAnalytics({ stats }) {
  const regions = stats?.region_analytics || [];

  const topRegions = regions.slice(0, 6);
  const labels = topRegions.map((r) => r.region);
  const totalScans = topRegions.map((r) => r.total_scans);
  const nonCompliantScans = topRegions.map((r) => r.non_compliant_count);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Total Inspections',
        data: totalScans,
        backgroundColor: '#38bdf8',
        borderRadius: 4,
      },
      {
        label: 'Non-Compliant',
        data: nonCompliantScans,
        backgroundColor: '#f43f5e',
        borderRadius: 4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: { color: '#cbd5e1', font: { size: 11 } },
      },
    },
    scales: {
      x: {
        ticks: { color: '#94a3b8' },
        grid: { display: false },
      },
      y: {
        ticks: { color: '#94a3b8', precision: 0 },
        grid: { color: 'rgba(36, 53, 115, 0.5)' },
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="panel-card">
      <div className="panel-title">
        <MapPin size={20} color="var(--accent-blue)" />
        <span>Regional Compliance Analytics</span>
      </div>

      {regions.length === 0 ? (
        <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
          No regional inspection data available for the selected filters.
        </div>
      ) : (
        <>
          <div style={{ height: '220px', marginBottom: '20px' }}>
            <Bar data={chartData} options={chartOptions} />
          </div>

          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Jurisdiction / Coarse Region</th>
                  <th style={{ textAlign: 'right' }}>Total</th>
                  <th style={{ textAlign: 'right' }}>Compliant</th>
                  <th style={{ textAlign: 'right' }}>Non-Compliant</th>
                  <th style={{ textAlign: 'right' }}>Compliance Rate</th>
                  <th style={{ textAlign: 'right' }}>Violations</th>
                  <th>Top Violated Clause</th>
                </tr>
              </thead>
              <tbody>
                {regions.map((reg) => (
                  <tr key={reg.region}>
                    <td style={{ fontWeight: 600, color: '#f8fafc' }}>
                      {reg.region}
                    </td>
                    <td style={{ textAlign: 'right' }}>{reg.total_scans}</td>
                    <td style={{ textAlign: 'right', color: 'var(--accent-emerald)' }}>
                      {reg.compliant_count}
                    </td>
                    <td style={{ textAlign: 'right', color: reg.non_compliant_count > 0 ? 'var(--accent-rose)' : 'inherit' }}>
                      {reg.non_compliant_count}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>
                      {formatPercent(reg.compliance_rate)}
                    </td>
                    <td style={{ textAlign: 'right' }}>{reg.total_violations}</td>
                    <td>
                      {reg.top_violation ? (
                        <span className="badge badge-priority-high">
                          {reg.top_violation}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>None</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: '12px', fontSize: '0.775rem', color: 'var(--text-muted)' }}>
            * Analytics strictly utilize non-identifiable coarse geographical units (localities/cities/districts). GPS tracking is prohibited.
          </div>
        </>
      )}
    </div>
  );
}
