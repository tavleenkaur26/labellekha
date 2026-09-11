import { fetchWithAuth, API_BASE_URL, getAuthToken } from './apiConfig';

export const scanService = {
  /**
   * Fetch all scans (inspectors see all; regular users see only their own).
   */
  async listScans() {
    return fetchWithAuth('/scans');
  },

  /**
   * Fetch complete clause-by-clause scan results with evidence and confidence.
   */
  async getScanDetails(scanId) {
    return fetchWithAuth(`/scans/${scanId}`);
  },

  /**
   * Build URL to stream original scanned label image.
   */
  getScanImageUrl(scanId) {
    return `${API_BASE_URL}/scans/${scanId}/image`;
  },
};
