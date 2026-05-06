import { formatDateTime, formatText } from '../core/formatters.js';
import { createEmptyState } from './empty-state.component.js';

function escapeHtml(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function createActivityMessage(item) {
  if (!item) return '';

  const action  = escapeHtml(item.action_label || item.action || 'ACCIÓN');
  const message = escapeHtml(formatText(item.message, ''));
  const entity  = item.series_title ? `<span class="activity-item__entity">${escapeHtml(item.series_title)}</span>` : '';

  const parts = [action, entity, message].filter(Boolean);
  return parts.join(' — ');
}

export function createActivityItem(item) {
  if (!item) return '';

  const time    = escapeHtml(formatDateTime(item.created_at));
  const content = createActivityMessage(item);

  return `<div class="activity-item">
  <span class="activity-item__time">${time}</span>
  <span class="activity-item__text">${content}</span>
</div>`.trim();
}

export function createActivityList(items = []) {
  if (!items || items.length === 0) {
    return createEmptyState({
      title:   'SIN ACTIVIDAD',
      message: 'No hay registros de actividad disponibles.',
      icon:    '◷',
    });
  }

  const rows = items.map(item => createActivityItem(item)).join('');
  return `<div class="activity-list">${rows}</div>`;
}
