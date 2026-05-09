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

const ACTION_LABELS = {
  'rating_updated': 'SE ACTUALIZÓ EL RATING',
  'rating_created': 'SE AGREGÓ UN RATING',
  'rating_deleted': 'SE ELIMINÓ UN RATING',
  'cover_uploaded': 'IMAGEN SUBIDA',
  'cover_updated':  'IMAGEN ACTUALIZADA',
  'game_created':   'REGISTRO CREADO',
  'game_updated':   'REGISTRO ACTUALIZADO',
  'game_deleted':   'REGISTRO ELIMINADO',
};

function normalizeActionKey(value) {
  if (!value) return '';
  return String(value).trim().replace(/[\s\-]+/g, '_').toLowerCase();
}

function humanizeAction(item) {
  const keyFromAction = normalizeActionKey(item.action);
  if (keyFromAction && ACTION_LABELS[keyFromAction]) return ACTION_LABELS[keyFromAction];

  const keyFromLabel = normalizeActionKey(item.action_label);
  if (keyFromLabel && ACTION_LABELS[keyFromLabel]) return ACTION_LABELS[keyFromLabel];

  const raw = item.action || item.action_label || '';
  if (!raw) return 'ACTIVIDAD DEL ARCHIVO';
  return raw.replace(/[_\s\-]+/g, ' ').trim().toUpperCase();
}

export function createActivityMessage(item) {
  if (!item) return '';

  const action  = escapeHtml(humanizeAction(item));
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
