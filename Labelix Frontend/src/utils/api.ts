import type { DashboardStats, PriorityQueueItem, ReviewQueueItem, ScanDetail, ScanListItem } from '../types';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

function authHeaders(extra: HeadersInit = {}) {
  const token = localStorage.getItem('labelix_token');
  return { ...extra, ...(token ? { Authorization: `Bearer ${token}` } : {}) };
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers: authHeaders(init.headers) });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    if (response.status === 401) localStorage.removeItem('labelix_token');
    throw new Error(body.detail || body.message || `Request failed (${response.status})`);
  }
  return response.json() as Promise<T>;
}

export const api = {
  async login(email: string, password: string) {
    const body = new URLSearchParams({ username: email, password });
    return request<{ access_token: string; token_type: string }>('/auth/login', {
      method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body,
    });
  },
  async register(name: string, email: string, password: string, role: string) {
    return request<{ id: number; name: string; email: string; role: string }>('/auth/register', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role }),
    });
  },
  async uploadScan(file: File, fields: { consent_given: boolean; coarse_location?: string; product_name?: string; brand?: string; category?: string }) {
    const form = new FormData();
    form.append('image', file);
    form.append('consent_given', String(fields.consent_given));
    if (fields.coarse_location) form.append('coarse_location', fields.coarse_location);
    if (fields.product_name) form.append('product_name', fields.product_name);
    if (fields.brand) form.append('brand', fields.brand);
    if (fields.category) form.append('category', fields.category);
    return request<{ scan_id: number; status: string; message?: string }>('/scans', { method: 'POST', body: form });
  },
  getScan: (id: number) => request<ScanDetail>(`/scans/${id}`),
  getScans: () => request<ScanListItem[]>('/scans'),
  getMyScans: (params = '') => request<{ count: number; results: any[] }>(`/scans/my${params}`),
  searchScans: (params = '') => request<{ count: number; results: any[] }>(`/scans/search${params}`),
  getDashboardStats: (params = '') => request<DashboardStats>(`/dashboard/stats${params}`),
  getReviewQueue: () => request<ReviewQueueItem[]>('/dashboard/review-queue'),
  getPriorityQueue: () => request<PriorityQueueItem[]>('/dashboard/priority-queue'),
  scanImageUrl: (id: number) => `${API_BASE_URL}/scans/${id}/image`,
  reportUrl: (id: number, format: 'pdf' | 'csv') => `${API_BASE_URL}/scans/${id}/report?format=${format}`,
};

export async function downloadAuthenticated(url: string, filename: string) {
  const response = await fetch(url, { headers: authHeaders() });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.detail || `Download failed (${response.status})`);
  }
  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);
}

export async function loadAuthenticatedImage(url: string) {
  const response = await fetch(url, { headers: authHeaders() });
  if (!response.ok) throw new Error(`Image request failed (${response.status})`);
  const blob = await response.blob();
  return URL.createObjectURL(blob);
}
