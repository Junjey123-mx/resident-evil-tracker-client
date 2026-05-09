import { createArchiveCard } from './archive-card.component.js';
import { createEmptyState }  from './empty-state.component.js';

function escapeHtml(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function createArchiveGrid(entries = [], options = {}) {
  if (!entries || entries.length === 0) {
    return createEmptyState({
      title:       'ARCHIVO VACÍO',
      message:     'No se encontraron registros en el archivo.',
      actionLabel: 'NUEVO REGISTRO',
      actionHref:  'create-game.html',
      icon:        '◻',
    });
  }

  const cards = entries.map(e => createArchiveCard(e, options)).join('');
  return `<div class="grid grid--auto">${cards}</div>`;
}

export function createArchiveResultsSummary({ total = 0, page = 1, pages = 1, limit = 8 } = {}) {
  const from  = total === 0 ? 0 : (page - 1) * limit + 1;
  const to    = Math.min(page * limit, total);
  const safeTotal = Number(total) || 0;

  return `<span class="archive-count">
  MOSTRANDO <span class="archive-count__num">${from}–${to}</span>
  DE <span class="archive-count__num">${safeTotal}</span> REGISTROS
</span>`.trim();
}

export function createArchiveToolbarState(params = {}) {
  const q       = params.q       ? escapeHtml(params.q)       : '';
  const orderBy = params.order_by ? escapeHtml(params.order_by) : 'title';
  const dir     = params.dir     ? escapeHtml(params.dir)     : 'asc';

  const filterLabel = q
    ? `BÚSQUEDA: <span class="archive-count__num">${q}</span>`
    : `<span class="archive-count__num">TODOS LOS REGISTROS</span>`;

  return `<div class="archive-toolbar">
  <div class="archive-toolbar__left">
    <span class="archive-count">${filterLabel}</span>
  </div>
  <div class="archive-toolbar__right">
    <span class="archive-count">ORDEN: <span class="archive-count__num">${orderBy} ${dir}</span></span>
  </div>
</div>`.trim();
}
