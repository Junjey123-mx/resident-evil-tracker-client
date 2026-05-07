import { mountSidebar }       from '../components/sidebar.component.js';
import { mountStatusStrip }   from '../components/status-strip.component.js';
import { listArchiveEntries, deleteArchiveEntry } from '../services/archive-entry.service.js';
import { createArchiveGrid }  from '../components/archive-grid.component.js';
import { createPagination }   from '../components/pagination.component.js';
import { createStatsGrid }    from '../components/stat-card.component.js';
import {
  createEmptyState,
  createLoadingState,
  createErrorState,
} from '../components/empty-state.component.js';
import {
  getQueryParam,
  getNumberQueryParam,
  setQueryParams,
} from '../core/query-params.js';
import { showError, showSuccess, showInfo } from '../core/notifications.js';

mountSidebar({ activePage: 'games' });
mountStatusStrip({ pageLabel: 'ARCHIVO' });

// ------------------------------------------------------------------ Defaults
const DEFAULTS = { q: '', sort: 'title', order: 'asc', page: 1, limit: 8 };

// ------------------------------------------------------------------ Helpers
function escapeHtml(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ------------------------------------------------------------------ URL params
function readParams() {
  return {
    q:     getQueryParam('q',     DEFAULTS.q),
    sort:  getQueryParam('sort',  DEFAULTS.sort),
    order: getQueryParam('order', DEFAULTS.order),
    page:  getNumberQueryParam('page',  DEFAULTS.page),
    limit: getNumberQueryParam('limit', DEFAULTS.limit),
  };
}

// ------------------------------------------------------------------ Toolbar
function buildSortOptions(current) {
  const opts = [
    { value: 'title',            label: 'TÍTULO' },
    { value: 'release_year',     label: 'AÑO DE LANZAMIENTO' },
    { value: 'chronology_order', label: 'ORDEN CRONOLÓGICO' },
    { value: 'rating',           label: 'RATING' },
    { value: 'created_at',       label: 'FECHA DE REGISTRO' },
  ];
  return opts.map(o =>
    `<option value="${o.value}"${current === o.value ? ' selected' : ''}>${o.label}</option>`
  ).join('');
}

function buildOrderOptions(current) {
  return [
    { value: 'asc',  label: 'ASCENDENTE' },
    { value: 'desc', label: 'DESCENDENTE' },
  ].map(o =>
    `<option value="${o.value}"${current === o.value ? ' selected' : ''}>${o.label}</option>`
  ).join('');
}

function buildLimitOptions(current) {
  return [8, 12, 16, 24].map(n =>
    `<option value="${n}"${current === n ? ' selected' : ''}>${n} POR PÁGINA</option>`
  ).join('');
}

function buildToolbar(params) {
  return `<div class="panel panel--tech">
  <div class="panel__header">
    <span class="panel__title">BÚSQUEDA Y FILTROS</span>
    <a href="create-game.html" class="btn btn--primary btn--sm">+ NUEVO REGISTRO</a>
  </div>
  <div class="panel__body">
    <form id="archive-search-form" class="archive-toolbar-form" novalidate>
      <div class="archive-search-wrap search-input">
        <span class="search-input__icon">◎</span>
        <input
          type="search"
          id="search-q"
          name="q"
          class="search-input__field"
          placeholder="BUSCAR JUEGO..."
          value="${escapeHtml(params.q)}"
          autocomplete="off"
        >
      </div>
      <select id="select-sort" name="sort" class="form-select archive-select">
        ${buildSortOptions(params.sort)}
      </select>
      <select id="select-order" name="order" class="form-select archive-select">
        ${buildOrderOptions(params.order)}
      </select>
      <select id="select-limit" name="limit" class="form-select archive-select">
        ${buildLimitOptions(params.limit)}
      </select>
      <div class="cluster cluster--2">
        <button type="submit" class="btn btn--secondary btn--sm">BUSCAR</button>
        <button type="button" id="btn-clear" class="btn btn--ghost btn--sm">LIMPIAR</button>
      </div>
    </form>
  </div>
</div>`;
}

// ------------------------------------------------------------------ Active filters
function buildActiveFilters(params) {
  const chips = [];
  if (params.q) {
    chips.push(`<span class="archive-filter-chip">BÚSQUEDA: ${escapeHtml(params.q)}</span>`);
  }
  chips.push(`<span class="archive-filter-chip">SORT: ${escapeHtml(params.sort)} ${escapeHtml(params.order)}</span>`);
  chips.push(`<span class="archive-filter-chip">PÁG: ${params.page}</span>`);
  chips.push(`<span class="archive-filter-chip">${params.limit} / PÁG</span>`);
  return `<div class="archive-filter-row">${chips.join('')}</div>`;
}

// ------------------------------------------------------------------ Side panel
function buildSidePanel(params, { total, pages }) {
  const q = params.q ? escapeHtml(params.q) : null;
  return `<div class="stack stack--4">
  <div class="panel panel--tech">
    <div class="panel__header"><span class="panel__title">ESTADO DEL ARCHIVO</span></div>
    <div class="panel__body stack stack--3">
      <div class="split">
        <span class="label">TOTAL DE REGISTROS</span>
        <span class="archive-count__num">${escapeHtml(String(total))}</span>
      </div>
      <div class="split">
        <span class="label">PÁGINA ACTUAL</span>
        <span class="archive-count__num">${params.page} / ${escapeHtml(String(pages))}</span>
      </div>
      <div class="split">
        <span class="label">POR PÁGINA</span>
        <span class="archive-count__num">${params.limit}</span>
      </div>
      <div class="split">
        <span class="label">ORDENADO POR</span>
        <span class="archive-count__num">${escapeHtml(params.sort)} ${escapeHtml(params.order)}</span>
      </div>
      ${q ? `<div class="split"><span class="label">BÚSQUEDA</span><span class="archive-count__num">${q}</span></div>` : ''}
    </div>
    <div class="panel__footer">
      <a href="create-game.html" class="btn btn--primary btn--sm">+ NUEVO REGISTRO</a>
    </div>
  </div>
  <div class="panel">
    <div class="panel__header"><span class="panel__title">GUÍA DE BÚSQUEDA</span></div>
    <div class="panel__body">
      <p class="archive-count">Filtra por título con el campo de búsqueda. Ajusta el ordenamiento, dirección y cantidad de registros con los selectores del toolbar.</p>
    </div>
  </div>
</div>`;
}

// ------------------------------------------------------------------ Shell render (first paint)
function renderShell(root, params) {
  root.innerHTML = `<div class="archive-page">
  <div class="archive-page__main">
    ${buildToolbar(params)}
    <div id="archive-filters-area">${buildActiveFilters(params)}</div>
    <div id="archive-stats-area"></div>
    <div id="archive-grid-area">${createLoadingState('CARGANDO REGISTROS DEL ARCHIVO...')}</div>
    <div id="archive-pagination-area" class="archive-pagination-wrap"></div>
  </div>
  <aside class="archive-page__side">
    <div id="archive-side-panel"></div>
  </aside>
</div>`;
}

// ------------------------------------------------------------------ Data load (API → DOM update)
async function loadData(params) {
  const gridEl    = document.getElementById('archive-grid-area');
  const paginEl   = document.getElementById('archive-pagination-area');
  const statsEl   = document.getElementById('archive-stats-area');
  const filtersEl = document.getElementById('archive-filters-area');
  const sideEl    = document.getElementById('archive-side-panel');

  if (gridEl) gridEl.innerHTML = createLoadingState('CARGANDO REGISTROS DEL ARCHIVO...');

  const apiParams = { sort: params.sort, order: params.order, page: params.page, limit: params.limit };
  if (params.q) apiParams.q = params.q;

  let response;
  try {
    response = await listArchiveEntries(apiParams);
  } catch (err) {
    const detail = err?.message || 'Error de red o de servidor.';
    const status = err?.status  ? ` [HTTP ${err.status}]` : '';
    if (gridEl)    gridEl.innerHTML    = createErrorState({ title: 'ERROR DE SISTEMA', message: `No se pudo cargar el archivo.${status}` });
    if (paginEl)   paginEl.innerHTML   = '';
    if (statsEl)   statsEl.innerHTML   = '';
    if (filtersEl) filtersEl.innerHTML = buildActiveFilters(params);
    if (sideEl)    sideEl.innerHTML    = '';
    showError(detail);
    return;
  }

  const items   = response.items        ?? response.results      ?? [];
  const total   = response.total        ?? response.total_entries ?? 0;
  const pages   = response.pages        ?? response.total_pages   ?? 1;
  const hasNext = response.has_next     ?? response.hasNext       ?? false;
  const hasPrev = response.has_previous ?? response.hasPrevious   ?? false;

  if (gridEl) {
    gridEl.innerHTML = items.length > 0
      ? createArchiveGrid(items)
      : createEmptyState({
          title:       'NO HAY REGISTROS',
          message:     'No se encontraron juegos con los filtros actuales.',
          actionLabel: 'NUEVO REGISTRO',
          actionHref:  'create-game.html',
          icon:        '◻',
        });
  }

  if (paginEl) {
    paginEl.innerHTML = createPagination({ page: params.page, pages, total, has_next: hasNext, has_previous: hasPrev });
  }

  if (statsEl) {
    statsEl.innerHTML = createStatsGrid([
      { label: 'TOTAL DE RESULTADOS',  value: String(total) },
      { label: 'PÁGINA ACTUAL',        value: `${params.page} / ${pages}` },
      { label: 'REGISTROS POR PÁGINA', value: String(params.limit) },
      { label: 'TOTAL DE PÁGINAS',     value: String(pages) },
    ]);
  }

  if (filtersEl) filtersEl.innerHTML = buildActiveFilters(params);
  if (sideEl)    sideEl.innerHTML    = buildSidePanel(params, { total, pages });
}

// ------------------------------------------------------------------ Form sync
function syncFormToParams(params) {
  const qInput   = document.getElementById('search-q');
  const selSort  = document.getElementById('select-sort');
  const selOrder = document.getElementById('select-order');
  const selLimit = document.getElementById('select-limit');
  if (qInput)   qInput.value   = params.q;
  if (selSort)  selSort.value  = params.sort;
  if (selOrder) selOrder.value = params.order;
  if (selLimit) selLimit.value = String(params.limit);
}

// ------------------------------------------------------------------ Events
function attachEvents(root) {
  const form     = document.getElementById('archive-search-form');
  const btnClear = document.getElementById('btn-clear');
  const selSort  = document.getElementById('select-sort');
  const selOrder = document.getElementById('select-order');
  const selLimit = document.getElementById('select-limit');

  // Submit search
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const q     = (document.getElementById('search-q')?.value ?? '').trim();
    const sort  = selSort?.value  || DEFAULTS.sort;
    const order = selOrder?.value || DEFAULTS.order;
    const limit = Number(selLimit?.value) || DEFAULTS.limit;
    currentParams = { q, sort, order, page: 1, limit };
    setQueryParams(currentParams);
    loadData(currentParams);
  });

  // Clear filters
  btnClear?.addEventListener('click', () => {
    currentParams = { ...DEFAULTS };
    setQueryParams(currentParams);
    syncFormToParams(currentParams);
    loadData(currentParams);
  });

  // Sort change
  selSort?.addEventListener('change', () => {
    currentParams = { ...currentParams, sort: selSort.value, page: 1 };
    setQueryParams(currentParams);
    loadData(currentParams);
  });

  // Order change
  selOrder?.addEventListener('change', () => {
    currentParams = { ...currentParams, order: selOrder.value, page: 1 };
    setQueryParams(currentParams);
    loadData(currentParams);
  });

  // Limit change
  selLimit?.addEventListener('change', () => {
    currentParams = { ...currentParams, limit: Number(selLimit.value) || DEFAULTS.limit, page: 1 };
    setQueryParams(currentParams);
    loadData(currentParams);
  });

  // Pagination (delegation on pagination wrapper)
  const paginWrap = document.getElementById('archive-pagination-area');
  paginWrap?.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-page]');
    if (!btn || btn.disabled || btn.getAttribute('aria-disabled') === 'true') return;
    const page = Number(btn.dataset.page);
    if (!Number.isFinite(page) || page < 1) return;
    currentParams = { ...currentParams, page };
    setQueryParams(currentParams);
    loadData(currentParams);
    document.getElementById('archive-grid-area')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  // Delete button (delegation on root)
  const deletingIds = new Set();
  root.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-action="delete"]');
    if (!btn) return;

    const rawId = btn.dataset.id;
    const id    = Number(rawId);
    if (!Number.isFinite(id) || id <= 0) {
      showError('ID de registro inválido.');
      return;
    }
    if (deletingIds.has(id)) return;
    if (!window.confirm('¿Eliminar este registro del archivo? Esta acción no se puede deshacer.')) return;

    deletingIds.add(id);
    btn.disabled = true;

    try {
      await deleteArchiveEntry(id);
      showSuccess('Registro eliminado correctamente.');
      await loadData(currentParams);
      if (currentParams.page > 1) {
        const gridEl = document.getElementById('archive-grid-area');
        if (gridEl && gridEl.querySelector('.empty-state')) {
          currentParams = { ...currentParams, page: currentParams.page - 1 };
          setQueryParams(currentParams);
          loadData(currentParams);
        }
      }
    } catch (err) {
      btn.disabled = false;
      const status = err?.status;
      showError(
        status === 404
          ? 'El registro ya no existe o fue eliminado.'
          : err?.message || 'No se pudo eliminar el registro.'
      );
    } finally {
      deletingIds.delete(id);
    }
  });
}

// ------------------------------------------------------------------ Init
let currentParams = readParams();

async function init() {
  const root = document.getElementById('games-root');
  if (!root) return;

  renderShell(root, currentParams);
  await loadData(currentParams);
  attachEvents(root);

  window.addEventListener('popstate', () => {
    currentParams = readParams();
    syncFormToParams(currentParams);
    loadData(currentParams);
  });
}

init();
