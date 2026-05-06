function escapeHtml(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function createEmptyState({
  title       = 'SIN RESULTADOS',
  message     = '',
  actionLabel = '',
  actionHref  = '',
  icon        = '◻',
} = {}) {
  const msgHtml = message
    ? `<p class="empty-state__text">${escapeHtml(message)}</p>`
    : '';
  const actionHtml = (actionLabel && actionHref)
    ? `<a href="${escapeHtml(actionHref)}" class="btn btn--secondary btn--sm">${escapeHtml(actionLabel)}</a>`
    : '';

  return `<div class="empty-state">
  <div class="empty-state__icon">${escapeHtml(icon)}</div>
  <div class="empty-state__title">${escapeHtml(title)}</div>
  ${msgHtml}
  ${actionHtml}
</div>`.trim();
}

export function createLoadingState(message = 'CARGANDO ARCHIVO...') {
  return `<div class="empty-state">
  <div class="empty-state__icon">◌</div>
  <div class="empty-state__title">${escapeHtml(message)}</div>
</div>`.trim();
}

export function createErrorState({ title = 'ERROR DE SISTEMA', message = '' } = {}) {
  const msgHtml = message
    ? `<p class="empty-state__text">${escapeHtml(message)}</p>`
    : '';

  return `<div class="empty-state panel--tech">
  <div class="empty-state__icon">⚠</div>
  <div class="empty-state__title">${escapeHtml(title)}</div>
  ${msgHtml}
</div>`.trim();
}

export function createConstructionState(moduleName = '') {
  const label = moduleName ? escapeHtml(String(moduleName).toUpperCase()) : 'MÓDULO';

  return `<div class="panel panel--tech">
  <div class="panel__header">
    <span class="panel__title">MÓDULO EN ESPERA — ${label}</span>
  </div>
  <div class="panel__body">
    <p>La conexión de datos se implementará en una tarea posterior.</p>
  </div>
</div>`.trim();
}
