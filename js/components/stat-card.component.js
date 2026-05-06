function escapeHtml(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function createStatCard({
  label   = '',
  value   = '—',
  sub     = '',
  icon    = '',
  variant = '',
} = {}) {
  const modClass  = variant === 'red' ? ' stat-card--red' : '';
  const iconHtml  = icon ? `<div class="stat-card__icon">${escapeHtml(icon)}</div>` : '';
  const subHtml   = sub  ? `<div class="stat-card__sub">${escapeHtml(sub)}</div>`  : '';
  const valueText = escapeHtml(String(value ?? '—'));

  return `<div class="stat-card${modClass}">
  ${iconHtml}
  <div class="stat-card__label">${escapeHtml(label)}</div>
  <div class="stat-card__value">${valueText}</div>
  ${subHtml}
</div>`.trim();
}

export function createStatsGrid(stats = []) {
  if (!stats || stats.length === 0) return '';
  return `<div class="stats-row">${stats.map(s => createStatCard(s)).join('')}</div>`;
}
