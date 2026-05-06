export function formatText(value, fallback = 'N/D') {
  if (value === null || value === undefined || value === '') return fallback;
  return String(value);
}

export function formatDate(value) {
  if (!value) return 'N/D';
  try {
    const d = new Date(value);
    if (isNaN(d.getTime())) return 'N/D';
    const day   = String(d.getUTCDate()).padStart(2, '0');
    const month = String(d.getUTCMonth() + 1).padStart(2, '0');
    const year  = d.getUTCFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return 'N/D';
  }
}

export function formatDateTime(value) {
  if (!value) return 'N/D';
  try {
    const d = new Date(value);
    if (isNaN(d.getTime())) return 'N/D';
    const day   = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year  = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const mins  = String(d.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${mins}`;
  } catch {
    return 'N/D';
  }
}

export function formatYear(value) {
  if (!value) return 'N/D';
  const s = String(value).trim();
  if (/^\d{4}$/.test(s)) return s;
  try {
    const d = new Date(s);
    if (isNaN(d.getTime())) return 'N/D';
    return String(d.getUTCFullYear());
  } catch {
    return 'N/D';
  }
}

export function formatRating(value) {
  if (value === null || value === undefined) return null;
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return Math.round(n * 10) / 10;
}

export function formatDisplayScore(value) {
  const n = formatRating(value);
  if (n === null) return 'N/D';
  return `${n}/10`;
}

export function formatSurvivalIndex(value) {
  if (value === null || value === undefined) return 'N/D';
  const n = parseInt(value, 10);
  if (!Number.isFinite(n)) return 'N/D';
  return `${Math.min(100, Math.max(0, n))}/100`;
}

export function formatFileCode(id) {
  if (id === null || id === undefined) return 'N/D';
  const n = parseInt(id, 10);
  if (!Number.isFinite(n)) return 'N/D';
  return `#${String(n).padStart(3, '0')}`;
}

export function formatUpperLabel(value) {
  if (!value) return '';
  return String(value).toUpperCase().trim();
}

export function formatPlatform(value) {
  return formatText(value, 'N/D').trim();
}

export function formatBoolean(value) {
  if (value === true  || value === 1 || value === 'true')  return 'Sí';
  if (value === false || value === 0 || value === 'false') return 'No';
  return 'N/D';
}

export function truncateText(value, maxLength = 120) {
  if (!value) return '';
  const s = String(value);
  if (s.length <= maxLength) return s;
  return `${s.slice(0, maxLength).trimEnd()}…`;
}

export function normalizeApiText(value) {
  if (value === null || value === undefined) return '';
  return String(value).trim();
}
