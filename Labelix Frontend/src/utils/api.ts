import { ScanResult, ProductSummary, ReportFilter } from "../types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData.detail || errorData.message || `Request failed with status ${response.status}`;
    throw new Error(message);
  }
  return response.json();
}

export const api = {
  // Upload and process image through OCR & Compliance engine
  async uploadScan(file: File, options?: { category?: string }): Promise<ScanResult> {
    const formData = new FormData();
    formData.append("file", file);
    if (options?.category) {
      formData.append("category", options.category);
    }

    const response = await fetch(`${API_BASE_URL}/api/scan`, {
      method: "POST",
      body: formData,
    });
    return handleResponse<ScanResult>(response);
  },

  // Retrieve single scan result
  async getScanResult(scanId: string): Promise<ScanResult> {
    const response = await fetch(`${API_BASE_URL}/api/scan/${scanId}`);
    return handleResponse<ScanResult>(response);
  },

  // Fetch all recent scans
  async getRecentScans(limit = 10): Promise<ScanResult[]> {
    const response = await fetch(`${API_BASE_URL}/api/scans?limit=${limit}`);
    return handleResponse<ScanResult[]>(response);
  },

  // Fetch registered products
  async getProducts(): Promise<ProductSummary[]> {
    const response = await fetch(`${API_BASE_URL}/api/products`);
    return handleResponse<ProductSummary[]>(response);
  },

  // Fetch reports with optional filters
  async getReports(filters?: ReportFilter): Promise<ScanResult[]> {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append("start_date", filters.startDate);
    if (filters?.endDate) params.append("end_date", filters.endDate);
    if (filters?.status) params.append("status", filters.status);
    if (filters?.category) params.append("category", filters.category);

    const query = params.toString() ? `?${params.toString()}` : "";
    const response = await fetch(`${API_BASE_URL}/api/reports${query}`);
    return handleResponse<ScanResult[]>(response);
  },
};