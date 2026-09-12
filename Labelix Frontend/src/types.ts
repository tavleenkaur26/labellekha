export interface OCRField {
  value: string;
  confidence: number;
  bbox?: [number, number, number, number];
}

export interface RuleViolation {
  id: string;
  rule_id: string;
  severity: "critical" | "warning" | "info";
  description: string;
  field?: string;
  suggested_action?: string;
}

export interface ScanResult {
  scan_id: string;
  timestamp: string;
  filename: string;
  product_name?: string;
  brand_name?: string;
  category?: string;
  compliance_score: number;
  status: "COMPLIANT" | "NON_COMPLIANT" | "FLAGGED";
  extracted_fields: Record<string, OCRField>;
  violations: RuleViolation[];
  image_url?: string;
}

export interface ProductSummary {
  id: string;
  name: string;
  category: string;
  manufacturer?: string;
  last_scan_date: string;
  compliance_rate: number;
  total_scans: number;
}

export interface ReportFilter {
  startDate?: string;
  endDate?: string;
  status?: string;
  category?: string;
}