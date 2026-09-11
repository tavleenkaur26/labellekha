// API configuration and authentication helpers

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export const TOKEN_STORAGE_KEY = 'labellekha_auth_token';
export const USER_STORAGE_KEY = 'labellekha_current_user';

export function getAuthToken() {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY) || '';
  } catch {
    return '';
  }
}

export function setAuthToken(token) {
  try {
    if (token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  } catch (err) {
    console.error('Failed to update auth token in localStorage', err);
  }
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStoredUser(user) {
  try {
    if (user) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  } catch (err) {
    console.error('Failed to update user in localStorage', err);
  }
}

export async function fetchWithAuth(url, options = {}) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    throw new Error('UNAUTHORIZED: Please login with valid inspector credentials.');
  }

  if (response.status === 403) {
    throw new Error('FORBIDDEN: Inspector access required to view dashboard analytics.');
  }

  if (!response.ok) {
    let errorDetail = `HTTP ${response.status} Error`;
    try {
      const errJson = await response.json();
      errorDetail = errJson.detail || errorDetail;
    } catch {
      // Ignored
    }
    throw new Error(errorDetail);
  }

  return response.json();
}
