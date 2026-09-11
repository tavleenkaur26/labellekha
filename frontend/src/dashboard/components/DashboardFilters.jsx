import React from 'react';
import { Filter, RotateCcw, RefreshCw } from 'lucide-react';

export function DashboardFilters({
  filters,
  filterOptions,
  onUpdateFilter,
  onResetFilters,
  onRefresh,
  loading,
}) {
  const regions = filterOptions?.regions || [];
  const brands = filterOptions?.brands || [];
  const categories = filterOptions?.categories || [];
  const rules = filterOptions?.rules || [
    'Rule 6(1)(a)',
    'Rule 6(1)(b)',
    'Rule 6(1)(c)',
    'Rule 6(1)(d)',
    'Rule 6(1)(e)',
    'Rule 6(2)',
    'Rule 7',
  ];

  return (
    <div className="filter-bar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', marginRight: '8px' }}>
        <Filter size={16} />
        <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>Filters</span>
      </div>

      {/* Date From */}
      <div className="filter-group">
        <label className="filter-label">From Date</label>
        <input
          type="date"
          className="filter-input"
          value={filters.dateFrom || ''}
          onChange={(e) => onUpdateFilter('dateFrom', e.target.value)}
        />
      </div>

      {/* Date To */}
      <div className="filter-group">
        <label className="filter-label">To Date</label>
        <input
          type="date"
          className="filter-input"
          value={filters.dateTo || ''}
          onChange={(e) => onUpdateFilter('dateTo', e.target.value)}
        />
      </div>

      {/* Status */}
      <div className="filter-group">
        <label className="filter-label">Compliance</label>
        <select
          className="filter-select"
          value={filters.overallStatus || 'ALL'}
          onChange={(e) => onUpdateFilter('overallStatus', e.target.value)}
        >
          <option value="ALL">All Statuses</option>
          <option value="compliant">Compliant</option>
          <option value="non-compliant">Non-Compliant</option>
        </select>
      </div>

      {/* Rule / Clause */}
      <div className="filter-group">
        <label className="filter-label">Clause / Rule</label>
        <select
          className="filter-select"
          value={filters.rule || 'ALL'}
          onChange={(e) => onUpdateFilter('rule', e.target.value)}
        >
          <option value="ALL">All Rules</option>
          {rules.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      {/* Region (Coarse Location) */}
      <div className="filter-group">
        <label className="filter-label">Region</label>
        <select
          className="filter-select"
          value={filters.coarseLocation || 'ALL'}
          onChange={(e) => onUpdateFilter('coarseLocation', e.target.value)}
        >
          <option value="ALL">All Regions</option>
          {regions.map((reg) => (
            <option key={reg} value={reg}>
              {reg}
            </option>
          ))}
        </select>
      </div>

      {/* Brand */}
      <div className="filter-group">
        <label className="filter-label">Brand</label>
        <select
          className="filter-select"
          value={filters.brand || 'ALL'}
          onChange={(e) => onUpdateFilter('brand', e.target.value)}
        >
          <option value="ALL">All Brands</option>
          {brands.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      </div>

      {/* Category */}
      <div className="filter-group">
        <label className="filter-label">Category</label>
        <select
          className="filter-select"
          value={filters.category || 'ALL'}
          onChange={(e) => onUpdateFilter('category', e.target.value)}
        >
          <option value="ALL">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Action Buttons */}
      <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
        <button className="btn-reset" onClick={onResetFilters} title="Reset all active filters">
          <RotateCcw size={14} />
          Reset
        </button>
        <button className="btn-refresh" onClick={onRefresh} disabled={loading} title="Refresh dataset">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>
    </div>
  );
}
