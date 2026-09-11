/**
 * Role 5 — Dashboard & Analytics Module
 * Plug-and-Play exports for Person 3's main frontend integration.
 */

export { DashboardPage } from './pages/DashboardPage';
export { KpiCards } from './components/KpiCards';
export { ComplianceOverview } from './components/ComplianceOverview';
export { ViolationAnalytics } from './components/ViolationAnalytics';
export { RegionAnalytics } from './components/RegionAnalytics';
export { BrandCategoryAnalytics } from './components/BrandCategoryAnalytics';
export { HumanReviewQueue } from './components/HumanReviewQueue';
export { PriorityQueue } from './components/PriorityQueue';
export { DashboardFilters } from './components/DashboardFilters';
export { ScanDetailsModal } from './components/ScanDetailsModal';

export { dashboardService } from './services/dashboardService';
export { scanService } from './services/scanService';
export { useDashboardData } from './hooks/useDashboardData';
export * from './services/apiConfig';
