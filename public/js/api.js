/**
 * api.js
 * ------
 * Fetch wrapper with sensible defaults + small formatting helpers.
 *
 * All modules import:
 *   import { api, formatNaira, calcDiscount, renderStars } from '../api.js';
 */

const API_BASE = '/api';

/**
 * Main API client.
 */
export const api = {
  async request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;

    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      credentials: 'include',
      ...options,
    };

    if (config.body && typeof config.body !== 'string') {
      config.body = JSON.stringify(config.body);
    }

    const res = await fetch(url, config);

    let data;
    try {
      data = await res.json();
    } catch {
      throw new Error(`HTTP ${res.status} — invalid JSON response`);
    }

    if (!res.ok || data.success === false) {
      throw new Error(
        data.message || `Request failed with status ${res.status}`
      );
    }

    return data.data;
  },

  get: (endpoint) => api.request(endpoint, { method: 'GET' }),
  post: (endpoint, body) => api.request(endpoint, { method: 'POST', body }),
  put: (endpoint, body) => api.request(endpoint, { method: 'PUT', body }),
  patch: (endpoint, body) => api.request(endpoint, { method: 'PATCH', body }),
  delete: (endpoint) => api.request(endpoint, { method: 'DELETE' }),
};

/**
 * Format a number as Nigerian naira.
 */
export const formatNaira = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) return '₦0';
  return (
    '₦' +
    Number(amount).toLocaleString('en-NG', { maximumFractionDigits: 0 })
  );
};

/**
 * Calculate percentage discount.
 */
export const calcDiscount = (current, previous) => {
  if (!previous || previous <= current) return 0;
  return Math.round(((previous - current) / previous) * 100);
};

/**
 * Render a star rating string (5 stars max).
 */
export const renderStars = (rating = 0) => {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  let html = '';
  for (let i = 0; i < full; i++) html += '★';
  if (half) html += '☆';
  for (let i = full + (half ? 1 : 0); i < 5; i++) html += '☆';
  return html;
};

// Default export for flexibility
export default { api, formatNaira, calcDiscount, renderStars };