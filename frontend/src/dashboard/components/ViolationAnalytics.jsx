import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { AlertOctagon, Info } from 'lucide-react';
import { formatPercent } from '../utils/formatters';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export function ViolationAnalytics({ stats }) {
  const ruleAnalytics = stats?.rule_analytics || [];

  const labels = ruleAnalytics.map((r) => r.clause);
  const violationCounts = ruleAnalytics.map((r) => r.violations_count);
  const backgroundColors = ruleAnalytics.map((r) =>
    r.is_rule_6 ? '#f43f5e' : '#a855f7'
  );

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Violations Detected',
        data: violationCounts,
        backgroundColor: backgroundColors,
        borderRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          title: (items) => {
            const index = items[0].dataIndex;
            const r = ruleAnalytics[index];
            return `${r.clause}: ${r.title}`;
          },
          label: (context) => {
            const index = context.dataIndex;
            const r = ruleAnalytics[index];
            const typeStr = r.is_rule_6 ? 'Rule 6 Mandatory Declaration' : 'Rule 7 Font Size Heuristic';
            return [
              `Violations: ${r.violations_count} (${formatPercent(r.percentage_of_total_violations)})`,
              `Pass Count: ${r.pass_count}`,
              `Low Confidence: ${r.low_confidence_count}`,
              `Type: ${typeStr}`,
            ];
          },
        },
      },
    },
    scales: {
      x: {
        ticks: { color: '#94a3b8', font: { size: 11 } },
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
        <div className="panel-title" style={{ margin: 0 }}>
          <AlertOctagon size={20} color="var(--accent-rose)" />
          <span>Rule Violation Analytics</span>
        </div>
        <div style={{ display: 'flex', gap: '12px', fontSize: '0.75rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '10px', height: '10px', background: '#f43f5e', borderRadius: '2px', display: 'inline-block' }}></span>
            Rule 6 (Mandatory Declarations)
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '10px', height: '10px', background: '#a855f7', borderRadius: '2px', display: 'inline-block' }}></span>
            Rule 7 (Font Size Check)
          </span>
        </div>
      </div>

      <div style={{ height: '240px', marginBottom: '20px' }}>
        <Bar data={chartData} options={chartOptions} />
      </div>

      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Rule / Clause</th>
              <th>Requirement Title</th>
              <th>Type</th>
              <th style={{ textAlign: 'right' }}>Violations</th>
              <th style={{ textAlign: 'right' }}>Passes</th>
              <th style={{ textAlign: 'right' }}>Low Confidence</th>
              <th style={{ textAlign: 'right' }}>% of Violations</th>
            </tr>
          </thead>
          <tbody>
            {ruleAnalytics.map((rule) => (
              <tr key={rule.clause}>
                <td style={{ fontWeight: 600, color: '#f8fafc', whiteSpace: 'nowrap' }}>
                  {rule.clause}
                </td>
                <td>{rule.title}</td>
                <td>
                  <span className={rule.is_rule_6 ? 'badge badge-rule6' : 'badge badge-rule7'}>
                    {rule.is_rule_6 ? 'Rule 6' : 'Rule 7 (Font)'}
                  </span>
                </td>
                <td style={{ textAlign: 'right', fontWeight: 700, color: rule.violations_count > 0 ? 'var(--accent-rose)' : 'inherit' }}>
                  {rule.violations_count}
                </td>
                <td style={{ textAlign: 'right', color: 'var(--accent-emerald)' }}>
                  {rule.pass_count}
                </td>
                <td style={{ textAlign: 'right', color: rule.low_confidence_count > 0 ? 'var(--accent-gold)' : 'var(--text-muted)' }}>
                  {rule.low_confidence_count}
                </td>
                <td style={{ textAlign: 'right' }}>
                  {formatPercent(rule.percentage_of_total_violations)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: '12px', fontSize: '0.775rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <Info size={14} />
        <span>Rule 7 is evaluated as an uncalibrated optical height screening check and does not penalize the overall Rule 6 compliance score.</span>
      </div>
    </div>
  );
}
