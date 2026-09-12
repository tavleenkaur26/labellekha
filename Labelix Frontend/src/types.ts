export type Page = 'dashboard' | 'new-scan' | 'processing' | 'inspection-result' | 'consumer-result' | 'producer-precheck' | 'ai-assistant' | 'products' | 'reports' | 'settings' | 'login';
export type NavigateFn = (page: Page) => void;

export interface ScanResultItem {
  clause: string;
  title?: string;
  extracted_text?: string;
  pass_fail?: boolean | null;
  confidence?: string | null;
  note?: string | null;
  needs_review: boolean;
}

export interface ScanDetail {
  scan_id: number;
  status: string;
  product_name?: string;
  overall_status?: string | null;
  needs_human_review?: boolean | null;
  coarse_location?: string | null;
  brand?: string | null;
  category?: string | null;
  consent_given: boolean;
  passed_count?: number | null;
  total_checks?: number | null;
  created_at: string;
  results: ScanResultItem[];
}

export interface ScanListItem {
  scan_id: number;
  product_name?: string | null;
  brand?: string | null;
  category?: string | null;
  region?: string | null;
  overall_status?: string | null;
  violations: number;
  confidence?: string | null;
  needs_human_review: boolean;
  created_at: string;
}

export interface DashboardStats {
  total_scans: number;
  compliant_count: number;
  non_compliant_count: number;
  compliance_rate: number;
  recapture_needed_count: number;
  human_review_count: number;
  total_violations: number;
  most_violated_rule?: string | null;
  violations_by_brand: Record<string, number>;
  violations_by_category: Record<string, number>;
  violations_by_area: Record<string, number>;
  scans_by_area: Record<string, number>;
  violations_by_clause: Record<string, number>;
}

export interface ReviewQueueItem {
  scan_id: number;
  product_name?: string | null;
  brand?: string | null;
  reason: string;
  confidence: string;
  status: string;
  created_at: string;
}

export interface PriorityQueueItem {
  scan_id: number;
  product_name?: string | null;
  brand?: string | null;
  priority_score: number;
  reason: string;
}

export interface UserSession {
  name: string;
  email: string;
  role: string;
}
