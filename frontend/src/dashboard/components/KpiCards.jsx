import React from 'react';
import {
  FileCheck2,
  CheckCircle2,
  XCircle,
  Percent,
  Eye,
  AlertTriangle,
} from 'lucide-react';
import { formatPercent } from '../utils/formatters';

export function KpiCards({ stats, loading }) {
  if (loading && !stats) {
    return (
      <div className="kpi-grid">
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <div key={n} className="metric-card" style={{ opacity: 0.6 }}>
            <div className="metric-header">Loading...</div>
            <div className="metric-value">—</div>
            <div className="metric-caption">Fetching metrics...</div>
          </div>
        ))}
      </div>
    );
  }

  const totalScans = stats?.total_scans ?? 0;
  const compliantCount = stats?.compliant_count ?? 0;
  const nonCompliantCount = stats?.non_compliant_count ?? 0;
  const complianceRate = stats?.compliance_rate ?? 0;
  const reviewsRequired = stats?.needs_human_review_count ?? 0;
  const totalViolations = stats?.total_violations ?? 0;
  const mostViolated = stats?.most_violated_rule;

  return (
    <div className="kpi-grid">
      {/* 1. Total Inspections */}
      <div className="metric-card">
        <div className="metric-header">
          <span>Total Inspections</span>
          <FileCheck2 size={20} color="var(--accent-blue)" />
        </div>
        <div className="metric-value">{totalScans}</div>
        <div className="metric-caption">Eligible consented scans in database</div>
      </div>

      {/* 2. Compliant Inspections */}
      <div className="metric-card">
        <div className="metric-header">
          <span>Compliant</span>
          <CheckCircle2 size={20} color="var(--accent-emerald)" />
        </div>
        <div className="metric-value" style={{ color: 'var(--accent-emerald)' }}>
          {compliantCount}
        </div>
        <div className="metric-caption">Passed all Rule 6 mandatory declarations</div>
      </div>

      {/* 3. Non-Compliant Inspections */}
      <div className="metric-card">
        <div className="metric-header">
          <span>Non-Compliant</span>
          <XCircle size={20} color="var(--accent-rose)" />
        </div>
        <div className="metric-value" style={{ color: 'var(--accent-rose)' }}>
          {nonCompliantCount}
        </div>
        <div className="metric-caption">One or more mandatory declarations missing</div>
      </div>

      {/* 4. Compliance Rate */}
      <div className="metric-card">
        <div className="metric-header">
          <span>Compliance Rate</span>
          <Percent size={20} color="var(--accent-gold)" />
        </div>
        <div className="metric-value" style={{ color: 'var(--accent-gold)' }}>
          {formatPercent(complianceRate)}
        </div>
        <div className="metric-caption">Rule 7 font-size excluded from rate</div>
      </div>

      {/* 5. Reviews Required */}
      <div className="metric-card">
        <div className="metric-header">
          <span>Reviews Required</span>
          <Eye size={20} color="var(--accent-amber)" />
        </div>
        <div className="metric-value" style={{ color: 'var(--accent-amber)' }}>
          {reviewsRequired}
        </div>
        <div className="metric-caption">Uncertain OCR / low-confidence evidence</div>
      </div>

      {/* 6. Total Violations */}
      <div className="metric-card">
        <div className="metric-header">
          <span>Total Violations</span>
          <AlertTriangle size={20} color="var(--accent-rose)" />
        </div>
        <div className="metric-value">{totalViolations}</div>
        <div className="metric-caption">
          {mostViolated
            ? `Top: ${mostViolated.clause} (${mostViolated.violations_count})`
            : 'No violations detected'}
        </div>
      </div>
    </div>
  );
}
