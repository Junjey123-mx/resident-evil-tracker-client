function escapeHtml(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function scoreVariant(n) {
  if (n >= 9) return 'badge--active';
  if (n >= 7) return 'badge--warning';
  return 'badge--red';
}

export function createRatingBadge(score) {
  if (score === null || score === undefined) {
    return `<span class="badge badge--inactive">SIN RATING</span>`;
  }
  const n = Number(score);
  if (!Number.isFinite(n)) {
    return `<span class="badge badge--inactive">SIN RATING</span>`;
  }
  const rounded = Math.round(n * 10) / 10;
  return `<span class="badge ${scoreVariant(rounded)}">${rounded}/10</span>`;
}

export function createCategoryBadge(category, label) {
  const text = escapeHtml(label || category || 'N/D');
  return `<span class="badge badge--default">${text}</span>`;
}

export function createThreatBadge(threatLevel, label) {
  const text = escapeHtml(label || threatLevel || 'N/D');
  let variant = 'badge--default';
  if (threatLevel) {
    const tl = String(threatLevel).toUpperCase();
    if (tl === 'CRITICAL' || tl === 'HIGH') variant = 'badge--red';
    else if (tl === 'MEDIUM')               variant = 'badge--warning';
    else if (tl === 'LOW')                  variant = 'badge--inactive';
  }
  return `<span class="badge ${variant}">${text}</span>`;
}

export function createStatusBadge(status, label) {
  const text = escapeHtml(label || status || 'N/D');
  let variant = 'badge--default';
  if (status) {
    const s = String(status).toUpperCase();
    if (s === 'REGISTERED' || s === 'ACTIVE')      variant = 'badge--active';
    else if (s === 'DRAFT'  || s === 'PENDING')     variant = 'badge--warning';
    else if (s === 'ARCHIVED' || s === 'INACTIVE')  variant = 'badge--inactive';
  }
  return `<span class="badge ${variant}">${text}</span>`;
}

export function createBadge({ label = '', variant = 'badge--default' } = {}) {
  return `<span class="badge ${escapeHtml(variant)}">${escapeHtml(label)}</span>`;
}
