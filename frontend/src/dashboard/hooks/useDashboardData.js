import { useState, useEffect, useCallback } from 'react';
import { dashboardService } from '../services/dashboardService';

export function useDashboardData() {
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    coarseLocation: 'ALL',
    brand: 'ALL',
    category: 'ALL',
    overallStatus: 'ALL',
    rule: 'ALL',
    priorityLevel: 'ALL',
  });

  const [stats, setStats] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [priorityQueue, setPriorityQueue] = useState([]);
  const [filterOptions, setFilterOptions] = useState({
    regions: [],
    brands: [],
    categories: [],
    rules: [],
    statuses: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsData, reviewsData, queueData, optionsData] = await Promise.all([
        dashboardService.getStats(filters),
        dashboardService.getHumanReviews(filters),
        dashboardService.getPriorityQueue(filters),
        dashboardService.getFilterOptions(),
      ]);

      setStats(statsData);
      setReviews(reviewsData);
      setPriorityQueue(queueData);
      if (optionsData) {
        setFilterOptions(optionsData);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      dateFrom: '',
      dateTo: '',
      coarseLocation: 'ALL',
      brand: 'ALL',
      category: 'ALL',
      overallStatus: 'ALL',
      rule: 'ALL',
      priorityLevel: 'ALL',
    });
  };

  return {
    filters,
    stats,
    reviews,
    priorityQueue,
    filterOptions,
    loading,
    error,
    updateFilter,
    resetFilters,
    refreshData: loadData,
  };
}
