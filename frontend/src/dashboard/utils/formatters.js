export function formatPercent(value) {
  if (value === null || value === undefined || isNaN(value)) return '0.0%';
  return `${Number(value).toFixed(1)}%`;
}

export function formatDate(isoString) {
  if (!isoString) return '—';
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}

export function getStatusBadgeClass(status) {
  if (!status) return 'badge badge-priority-low';
  const s = status.toLowerCase();
  if (s === 'compliant') return 'badge badge-compliant';
  if (s === 'non-compliant') return 'badge badge-non-compliant';
  if (s === 'recapture_needed') return 'badge badge-recapture';
  return 'badge badge-priority-low';
}

export function getPriorityBadgeClass(level) {
  if (!level) return 'badge badge-priority-low';
  const l = level.toUpperCase();
  if (l === 'CRITICAL') return 'badge badge-priority-critical';
  if (l === 'HIGH') return 'badge badge-priority-high';
  if (l === 'MEDIUM') return 'badge badge-priority-medium';
  return 'badge badge-priority-low';
}
