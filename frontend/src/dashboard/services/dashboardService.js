import { fetchWithAuth } from './apiConfig';

export const dashboardService = {
  /**
   * Fetch core compliance KPIs, 7-rule violation breakdown, regional and brand analytics.
   */
  async getStats(filters = {}) {
    const params = new URLSearchParams();
    if (filters.dateFrom) params.append('date_from', filters.dateFrom);
    if (filters.dateTo) params.append('date_to', filters.dateTo);
    if (filters.coarseLocation && filters.coarseLocation !== 'ALL') {
      params.append('coarse_location', filters.coarseLocation);
    }
    if (filters.brand && filters.brand !== 'ALL') params.append('brand', filters.brand);
    if (filters.category && filters.category !== 'ALL') params.append('category', filters.category);
    if (filters.overallStatus && filters.overallStatus !== 'ALL') {
      params.append('overall_status', filters.overallStatus);
    }
    if (filters.rule && filters.rule !== 'ALL') params.append('rule', filters.rule);

    const query = params.toString() ? `?${params.toString()}` : '';
    return fetchWithAuth(`/dashboard/stats${query}`);
  },

  /**
   * Fetch scans flagged for human review under Adaptive Evidence-Driven Inspection.
   */
  async getHumanReviews(filters = {}) {
    const params = new URLSearchParams();
    if (filters.coarseLocation && filters.coarseLocation !== 'ALL') {
      params.append('coarse_location', filters.coarseLocation);
    }
    if (filters.brand && filters.brand !== 'ALL') params.append('brand', filters.brand);
    if (filters.category && filters.category !== 'ALL') params.append('category', filters.category);

    const query = params.toString() ? `?${params.toString()}` : '';
    return fetchWithAuth(`/dashboard/reviews${query}`);
  },

  /**
   * Fetch explainable inspection priority queue for enforcement officers.
   */
  async getPriorityQueue(filters = {}) {
    const params = new URLSearchParams();
    if (filters.coarseLocation && filters.coarseLocation !== 'ALL') {
      params.append('coarse_location', filters.coarseLocation);
    }
    if (filters.brand && filters.brand !== 'ALL') params.append('brand', filters.brand);
    if (filters.category && filters.category !== 'ALL') params.append('category', filters.category);
    if (filters.priorityLevel && filters.priorityLevel !== 'ALL') {
      params.append('priority_level', filters.priorityLevel);
    }

    const query = params.toString() ? `?${params.toString()}` : '';
    return fetchWithAuth(`/dashboard/priority-queue${query}`);
  },

  /**
   * Fetch distinct filter options dynamically based on consented data.
   */
  async getFilterOptions() {
    return fetchWithAuth('/dashboard/filter-options');
  },
};
