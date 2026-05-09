import { mountSidebar }      from '../components/sidebar.component.js';
import { mountStatusStrip }  from '../components/status-strip.component.js';
import { getDashboardStats } from '../services/dashboard.service.js';
import { createStatsGrid }   from '../components/stat-card.component.js';
import { createActivityList } from '../components/activity-list.component.js';
import { createArchiveGrid }  from '../components/archive-grid.component.js';
import {
  createEmptyState,
  createLoadingState,
  createErrorState,
} from '../components/empty-state.component.js';
import { createRatingBadge }  from '../components/rating-badge.component.js';
import { formatDisplayScore, formatYear, formatText } from '../core/formatters.js';
import { showError }          from '../core/notifications.js';

mountSidebar({ activePage: 'dashboard' });
mountStatusStrip({ pageLabel: 'DASHBOARD' });

function escapeHtml(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function sectionPanel(title, bodyHtml, footerHtml = '') {
  const footer = footerHtml
    ? `<div class="panel__footer">${footerHtml}</div>`
    : '';
  return `<div class="panel panel--tech">
  <div class="panel__header"><span class="panel__title">${escapeHtml(title)}</span></div>
  <div class="panel__body">${bodyHtml}</div>
  ${footer}
</div>`;
}

function buildStats(stats) {
  const total = stats.total_entries  ?? stats.totalEntries  ?? 0;
  const avg   = stats.average_rating ?? stats.averageRating ?? null;
  const best  = stats.best_rated_entry ?? stats.best_entry  ?? stats.best  ?? null;
  const last  = stats.latest_entry     ?? stats.last_entry  ?? null;

  return createStatsGrid([
    {
      label: 'TOTAL DE JUEGOS REGISTRADOS',
      value: String(total),
    },
    {
      label: 'JUEGO MEJOR CALIFICADO',
      value: formatText(best?.title, '—'),
      sub:   best?.release_year ? formatYear(best.release_year) : '',
    },
    {
      label: 'ÚLTIMO JUEGO AGREGADO',
      value: formatText(last?.title, '—'),
      sub:   last?.release_year ? formatYear(last.release_year) : '',
    },
    {
      label:   'PROMEDIO GENERAL DE RATING',
      value:   avg != null ? formatDisplayScore(avg) : '—',
      variant: 'red',
    },
  ]);
}

function buildTimeline(timeline) {
  if (!Array.isArray(timeline) || timeline.length === 0) {
    return createEmptyState({
      title:   'SIN DATOS',
      message: 'No hay datos de línea de tiempo disponibles.',
      icon:    '◷',
    });
  }

  const rows = timeline.map(item => {
    const year  = escapeHtml(String(item.year ?? item.release_year ?? '—'));
    const count = item.count ?? item.total ?? null;
    const raw   = item.title ?? item.label
      ?? (count != null ? `${count} entrada${count !== 1 ? 's' : ''}` : '');
    const label = escapeHtml(String(raw));
    const countHtml = count != null
      ? `<span class="timeline-item__count">${escapeHtml(String(count))}</span>`
      : '';
    return `<li class="timeline-item">
  <span class="timeline-item__year">${year}</span>
  <span class="timeline-item__label">${label}</span>
  ${countHtml}
</li>`;
  }).join('');

  return `<ul class="timeline-list">${rows}</ul>`;
}

function getEntryRating(entry) {
  return entry.rating_score
    ?? entry.average_rating
    ?? entry.personal_rating
    ?? entry.score
    ?? entry.rating
    ?? entry.rating_value
    ?? null;
}

function buildTopRated(entries) {
  if (!Array.isArray(entries) || entries.length === 0) {
    return createEmptyState({
      title:   'SIN REGISTROS',
      message: 'No hay entradas mejor calificadas.',
      icon:    '◻',
    });
  }

  const rows = entries.map((entry, i) => {
    const title = escapeHtml(formatText(entry.title, 'SIN TÍTULO'));
    const year  = entry.release_year
      ? `<span class="label">${escapeHtml(formatYear(entry.release_year))}</span>`
      : '';
    const score = getEntryRating(entry);
    const badge = createRatingBadge(score);
    return `<li class="top-rated-item">
  <div class="top-rated-item__left">
    <span class="top-rated-rank">${i + 1}.</span>
    <span class="top-rated-item__title">${title}</span>
    ${year}
  </div>
  <div class="top-rated-item__right">${badge}</div>
</li>`;
  }).join('');

  return `<ol class="top-rated-list">${rows}</ol>`;
}

async function initDashboard() {
  const root = document.getElementById('dashboard-root');
  if (!root) return;

  root.innerHTML = createLoadingState('CARGANDO DASHBOARD DEL ARCHIVO...');

  let stats;
  try {
    stats = await getDashboardStats();
  } catch (err) {
    const detail = err?.message || 'Error de red o de servidor.';
    const status = err?.status  ? ` [HTTP ${err.status}]` : '';
    root.innerHTML = createErrorState({
      title:   'ERROR DE SISTEMA',
      message: `No se pudo cargar el dashboard.${status}`,
    });
    showError(detail);
    return;
  }

  const recentEntries = stats.recent_entries   ?? stats.recentEntries   ?? [];
  const timeline      = stats.release_timeline ?? stats.releaseTimeline ?? [];
  const topRated      = stats.top_rated_entries ?? stats.topRatedEntries ?? [];
  const activity      = stats.recent_activity  ?? stats.recentActivity  ?? [];

  root.innerHTML = `<div class="stack stack--6">
  ${buildStats(stats)}
  ${sectionPanel(
    'REGISTROS RECIENTES',
    createArchiveGrid(recentEntries, { compact: true }),
    '<a href="games.html" class="btn btn--ghost btn--sm">VER TODOS LOS REGISTROS</a>'
  )}
  <div class="grid grid--2">
    ${sectionPanel('LÍNEA DE TIEMPO DE LANZAMIENTOS', buildTimeline(timeline))}
    ${sectionPanel('MEJORES CALIFICADOS', buildTopRated(topRated))}
  </div>
  ${sectionPanel('ACTIVIDAD RECIENTE', createActivityList(activity))}
</div>`;
}

initDashboard();
