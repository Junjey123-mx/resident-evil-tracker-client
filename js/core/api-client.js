import { API_BASE_URL, DEFAULT_TIMEOUT_MS } from './config.js';

export class ApiError extends Error {
  constructor({ message, status, statusText, data, url }) {
    super(message);
    this.name       = 'ApiError';
    this.status     = status;
    this.statusText = statusText;
    this.data       = data;
    this.url        = url;
  }
}

export function buildUrl(path, params) {
  const base = API_BASE_URL.replace(/\/$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = `${base}${normalizedPath}`;

  if (!params) return url;
  const entries = Object.entries(params).filter(
    ([, v]) => v !== null && v !== undefined && v !== ''
  );
  if (entries.length === 0) return url;

  const qs = entries
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');
  return `${url}?${qs}`;
}

export async function request(path, options = {}) {
  const { params, timeout = DEFAULT_TIMEOUT_MS, ...fetchOptions } = options;
  const url = buildUrl(path, params);

  const controller = new AbortController();
  const timerId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, { ...fetchOptions, signal: controller.signal });
    clearTimeout(timerId);

    let data = null;
    if (response.status !== 204) {
      const ct = response.headers.get('content-type') ?? '';
      data = ct.includes('application/json')
        ? await response.json()
        : await response.text();
    }

    if (!response.ok) {
      const message =
        (data && typeof data === 'object' && (data.detail || data.message)) ||
        response.statusText ||
        `HTTP ${response.status}`;
      throw new ApiError({ message, status: response.status, statusText: response.statusText, data, url });
    }

    return data;
  } catch (err) {
    clearTimeout(timerId);
    if (err instanceof ApiError) throw err;
    if (err.name === 'AbortError') {
      throw new ApiError({
        message: `La solicitud excedió el tiempo límite (${timeout}ms)`,
        status: 0, statusText: 'Timeout', data: null, url,
      });
    }
    throw new ApiError({
      message: err.message || 'Error de red. Verifica la conexión y que el servidor esté activo.',
      status: 0, statusText: 'Network Error', data: null, url,
    });
  }
}

export function get(path, params) {
  return request(path, { method: 'GET', params });
}

export function post(path, body) {
  return request(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

export function put(path, body) {
  return request(path, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

export function del(path) {
  return request(path, { method: 'DELETE' });
}

export function upload(path, formData) {
  // No Content-Type header — browser sets multipart/form-data with boundary automatically
  return request(path, { method: 'POST', body: formData });
}
