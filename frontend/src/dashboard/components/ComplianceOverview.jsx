import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { formatPercent } from '../utils/formatters';

ChartJS.register(ArcElement, Tooltip, Legend);

export function ComplianceOverview({ stats }) {
  const compliant = stats?.compliant_count ?? 0;
  const nonCompliant = stats?.non_compliant_count ?? 0;
  const recapture = stats?.recapture_needed_count ?? 0;
  const total = compliant + nonCompliant + recapture;

  const chartData = {
    labels: ['Compliant', 'Non-Compliant', 'Recapture Needed'],
    datasets: [
      {
        data: total === 0 ? [1] : [compliant, nonCompliant, recapture],
        backgroundColor:
          total === 0
            ? ['#334155']
            : ['#10b981', '#f43f5e', '#f59e0b'],
        borderColor: ['#111d40'],
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#cbd5e1',
          font: { size: 12, family: 'Inter' },
          padding: 14,
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            if (total === 0) return ' No inspections available';
            const val = context.raw || 0;
            const pct = Math.round((val / total) * 100);
            return ` ${context.label}: ${val} (${pct}%)`;
          },
        },
      },
    },
    cutout: '72%',
  };

  return (
    <div className="panel-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="panel-title">
        <span>Compliance Overview</span>
      </div>

      <div style={{ position: 'relative', height: '240px', flex: 1 }}>
        <Doughnut data={chartData} options={chartOptions} />
        <div
          style={{
            position: 'absolute',
            top: '42%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            pointerEvents: 'none',
          }}
        >
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff' }}>
            {formatPercent(stats?.compliance_rate)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Compliance Rate
          </div>
        </div>
      </div>

      <div style={{ marginTop: '16px', fontSize: '0.8rem', color: 'var(--text-secondary)', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
          <span>Eligible Scans Evaluated:</span>
          <strong style={{ color: '#fff' }}>{compliant + nonCompliant}</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Quality Gate Rejections:</span>
          <strong style={{ color: 'var(--accent-amber)' }}>{recapture}</strong>
        </div>
      </div>
    </div>
  );
}
