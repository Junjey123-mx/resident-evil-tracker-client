export function getSearchParams(search = window.location.search) {
  return new URLSearchParams(search);
}

export function getQueryParam(name, fallback = null) {
  const value = getSearchParams().get(name);
  return value !== null && value !== '' ? value : fallback;
}

export function getNumberQueryParam(name, fallback = null) {
  const value = getQueryParam(name);
  if (value === null) return fallback;
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export function buildQueryString(params) {
  if (!params) return '';
  const entries = Object.entries(params).filter(
    ([, v]) => v !== null && v !== undefined && v !== ''
  );
  if (entries.length === 0) return '';
  return entries
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');
}

export function setQueryParams(params, { replace = false } = {}) {
  const qs = buildQueryString(params);
  const newUrl = `${window.location.pathname}${qs ? `?${qs}` : ''}`;
  if (replace) {
    window.history.replaceState(null, '', newUrl);
  } else {
    window.history.pushState(null, '', newUrl);
  }
}

export function getIdFromQuery(paramName = 'id') {
  return getNumberQueryParam(paramName, null);
}

export function requireIdFromQuery(paramName = 'id') {
  const id = getIdFromQuery(paramName);
  if (id === null || !Number.isFinite(id) || id <= 0) {
    throw new Error(
      `Parámetro requerido "${paramName}" no encontrado o inválido. URL: ${window.location.href}`
    );
  }
  return id;
}
