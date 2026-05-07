import { mountSidebar }           from '../components/sidebar.component.js';
import { mountStatusStrip }        from '../components/status-strip.component.js';
import { getArchiveEntryById }     from '../services/archive-entry.service.js';
import { getRatingBySeriesId }     from '../services/rating.service.js';
import { listActivityBySeriesId }  from '../services/activity.service.js';
import { getIdFromQuery }          from '../core/query-params.js';
import { createActivityList }      from '../components/activity-list.component.js';
import {
  createRatingBadge,
  createCategoryBadge,
  createStatusBadge,
  createThreatBadge,
} from '../components/rating-badge.component.js';
import {
  createLoadingState,
  createErrorState,
  createEmptyState,
} from '../components/empty-state.component.js';
import {
  formatText,
  formatDate,
  formatYear,
  formatDisplayScore,
  formatSurvivalIndex,
  formatFileCode,
} from '../core/formatters.js';
import { showError, showInfo } from '../core/notifications.js';

mountSidebar({ activePage: 'games' });
mountStatusStrip({ pageLabel: 'DETALLE' });

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

function dataRow(label, value) {
  const str = (value !== null && value !== undefined) ? String(value).trim() : '';
  const displayHtml = (str && str !== 'N/D')
    ? escapeHtml(str)
    : '<span class="label">N/D</span>';
  return `<div class="detail-data-item">
  <span class="detail-data-label">${escapeHtml(label)}</span>
  <span class="detail-data-value">${displayHtml}</span>
</div>`;
}

function sectionPanel(title, bodyHtml) {
  return `<div class="panel panel--tech">
  <div class="panel__header"><span class="panel__title">${escapeHtml(title)}</span></div>
  <div class="panel__body">${bodyHtml}</div>
</div>`;
}

// ------------------------------------------------------------------ Hero
function buildHero(entry, id) {
  const title    = escapeHtml(formatText(entry.title, 'SIN TÍTULO'));
  const fileCode = escapeHtml(entry.file_code ?? formatFileCode(entry.id) ?? '—');
  const descRaw  = entry.description ?? entry.synopsis ?? '';
  const desc     = descRaw ? escapeHtml(String(descRaw)) : '';

  const coverUrl  = entry.cover_image_url ?? entry.coverImageUrl ?? null;
  const coverHtml = coverUrl
    ? `<img class="game-detail__cover" src="${escapeHtml(coverUrl)}" alt="${title}" loading="lazy">`
    : `<div class="game-detail__cover-placeholder"><span class="label">SIN PORTADA</span></div>`;

  const score      = entry.display_score ?? entry.rating_score ?? null;
  const scoreBadge = createRatingBadge(score);

  const catBadge    = (entry.category    || entry.category_label)
    ? createCategoryBadge(entry.category, entry.category_label) : '';
  const statusBadge = (entry.status      || entry.status_label)
    ? createStatusBadge(entry.status, entry.status_label) : '';
  const threatBadge = (entry.threat_level || entry.threat_level_label)
    ? createThreatBadge(entry.threat_level, entry.threat_level_label) : '';

  const badgesHtml = [scoreBadge, catBadge, statusBadge, threatBadge].filter(Boolean).join('');
  const editHref   = `edit-game.html?id=${encodeURIComponent(id)}`;

  return `<div class="stack stack--4">
  <div class="detail-actions">
    <a href="games.html" class="btn btn--ghost btn--sm">← VOLVER AL ARCHIVO</a>
    <a href="${editHref}" class="btn btn--secondary btn--sm">EDITAR</a>
    <button type="button" id="btn-delete" class="btn btn--danger btn--sm" data-action="delete" data-id="${escapeHtml(String(id))}">ELIMINAR</button>
  </div>
  <div class="game-detail__hero">
    ${coverHtml}
    <div class="game-detail__meta">
      <div>
        <span class="label">${fileCode}</span>
        <h2 class="game-detail__title">${title}</h2>
      </div>
      ${badgesHtml ? `<div class="game-detail__meta-row">${badgesHtml}</div>` : ''}
      ${desc ? `<p class="game-detail__description">${desc}</p>` : ''}
    </div>
  </div>
</div>`;
}

// ------------------------------------------------------------------ Datos principales
function buildDataPanel(entry) {
  const survivalRaw = entry.display_survival_index ?? entry.survival_index ?? null;

  const rows = [
    dataRow('AÑO DE LANZAMIENTO',  formatYear(entry.release_year)),
    dataRow('PROTAGONISTA',        entry.main_protagonist),
    dataRow('PLATAFORMA ORIGINAL', entry.original_platform),
    dataRow('ORDEN CRONOLÓGICO',   entry.chronology_order),
    dataRow('GÉNERO',              entry.genre),
    dataRow('ENGINE',              entry.engine),
    dataRow('DURACIÓN ESTIMADA',   entry.estimated_duration),
    dataRow('JUGADORES',           entry.players),
    dataRow('DIRECTOR',            entry.director),
    dataRow('DESARROLLADOR',       entry.developer),
  ].join('');

  return sectionPanel('DATOS PRINCIPALES', `<div class="detail-data-list">${rows}</div>`);
}

// ------------------------------------------------------------------ Información del archivo
function buildArchivePanel(entry) {
  const survivalRaw = entry.display_survival_index ?? entry.survival_index ?? null;
  const survivalStr = survivalRaw != null ? formatSurvivalIndex(survivalRaw) : '';

  const rows = [
    dataRow('CLASIFICACIÓN UMBRELLA',  entry.umbrella_classification),
    dataRow('SURVIVAL INDEX',          survivalStr),
    dataRow('ERA CRONOLÓGICA',         entry.chronology_era),
    dataRow('TÍTULO ALTERNATIVO',      entry.alias_title),
    dataRow('TIPO DE AMENAZA',         entry.threat_type),
    dataRow('LOCACIONES PRINCIPALES',  entry.main_locations),
    dataRow('PLATAFORMAS REGISTRADAS', entry.registered_platforms),
    dataRow('FECHA DE REGISTRO',       formatDate(entry.created_at)),
    dataRow('ÚLTIMA ACTUALIZACIÓN',    formatDate(entry.updated_at)),
  ].join('');

  return sectionPanel('INFORMACIÓN DEL ARCHIVO', `<div class="detail-data-list">${rows}</div>`);
}

// ------------------------------------------------------------------ Rating personal
function buildRatingPanel(rating) {
  if (!rating) {
    return sectionPanel('RATING PERSONAL', createEmptyState({
      title:   'SIN RATING PERSONAL',
      message: 'Este registro todavía no tiene calificación personal.',
      icon:    '◎',
    }));
  }

  const score   = rating.rating_score ?? rating.score ?? null;
  const review  = rating.personal_review ?? rating.review ?? null;
  const ratedAt = rating.created_at ?? rating.rated_at ?? null;

  const badge        = createRatingBadge(score);
  const scoreDisplay = score != null ? escapeHtml(formatDisplayScore(score)) : '—';
  const dateDisplay  = ratedAt ? escapeHtml(formatDate(ratedAt)) : '';

  const reviewHtml = review
    ? `<div class="review-box"><p>${escapeHtml(String(review))}</p></div>`
    : `<p class="label">SIN RESEÑA PERSONAL.</p>`;

  const bodyHtml = `<div class="stack stack--4">
  <div class="detail-data-list">
    <div class="detail-data-item">
      <span class="detail-data-label">PUNTUACIÓN</span>
      <span class="detail-data-value">${badge} ${scoreDisplay}</span>
    </div>
    ${dateDisplay
      ? `<div class="detail-data-item"><span class="detail-data-label">CALIFICADO</span><span class="detail-data-value">${dateDisplay}</span></div>`
      : ''}
  </div>
  <div>
    <span class="label">RESEÑA PERSONAL</span>
    ${reviewHtml}
  </div>
</div>`;

  return sectionPanel('RATING PERSONAL', bodyHtml);
}

// ------------------------------------------------------------------ Relacionados
function buildRelatedPanel(entry) {
  const related = entry.related_entries ?? entry.relatedEntries ?? [];
  if (!Array.isArray(related) || related.length === 0) {
    return sectionPanel('REGISTROS RELACIONADOS', createEmptyState({
      title:   'SIN RELACIONADOS',
      message: 'Este registro no tiene entradas relacionadas.',
      icon:    '◻',
    }));
  }

  const items = related.map(rel => {
    const relTitle = escapeHtml(formatText(rel.title, 'SIN TÍTULO'));
    const relId    = rel.id != null ? encodeURIComponent(rel.id) : null;
    const relHref  = relId ? `game-detail.html?id=${relId}` : '#';
    const relYear  = rel.release_year ? escapeHtml(formatYear(rel.release_year)) : '';
    const relBadge = createRatingBadge(rel.display_score ?? rel.rating_score ?? null);
    return `<li class="detail-related-item">
  <a href="${relHref}" class="detail-related-item__title">${relTitle}</a>
  ${relYear ? `<span class="label">${relYear}</span>` : ''}
  ${relBadge}
</li>`;
  }).join('');

  return sectionPanel('REGISTROS RELACIONADOS', `<ul class="detail-related-list">${items}</ul>`);
}

// ------------------------------------------------------------------ Actividad
function buildActivityPanel(items, error) {
  if (error) {
    const msg = error?.message || 'No se pudo cargar el historial de actividad.';
    return sectionPanel('HISTORIAL DE ACTIVIDAD', createErrorState({
      title:   'ERROR AL CARGAR ACTIVIDAD',
      message: escapeHtml(msg),
    }));
  }
  return sectionPanel('HISTORIAL DE ACTIVIDAD', createActivityList(items));
}

// ------------------------------------------------------------------ Init
async function init() {
  const root = document.getElementById('game-detail-root');
  if (!root) return;

  root.innerHTML = createLoadingState('CARGANDO DETALLE DEL ARCHIVO...');

  // Validate id from URL
  const id = getIdFromQuery('id');
  if (!id || !Number.isFinite(id) || id <= 0) {
    root.innerHTML = createEmptyState({
      title:       'REGISTRO NO ENCONTRADO',
      message:     'No se encontró el identificador del registro en la URL.',
      actionLabel: '← VOLVER AL ARCHIVO',
      actionHref:  'games.html',
      icon:        '⚠',
    });
    return;
  }

  // Parallel fetch — rating and activity are optional
  const [entryResult, ratingResult, activityResult] = await Promise.allSettled([
    getArchiveEntryById(id),
    getRatingBySeriesId(id),
    listActivityBySeriesId(id),
  ]);

  // Entry is required — any failure shows error page
  if (entryResult.status === 'rejected') {
    const err    = entryResult.reason;
    const status = err?.status ? ` [HTTP ${err.status}]` : '';
    root.innerHTML = createErrorState({
      title:   'ERROR AL CARGAR EL REGISTRO',
      message: `No se pudo cargar el detalle del registro.${status}`,
    });
    showError(err?.message || 'Error al cargar el registro.');
    return;
  }

  const entry = entryResult.value;

  // Rating: 404 = no rating yet (acceptable), other errors = warn in console
  let rating = null;
  if (ratingResult.status === 'fulfilled') {
    rating = ratingResult.value;
  } else if (ratingResult.reason?.status !== 404) {
    console.warn('[game-detail] rating load error:', ratingResult.reason?.message);
  }

  // Activity: any failure → show error state inside the section
  let activityItems = [];
  let activityError = null;
  if (activityResult.status === 'fulfilled') {
    const actData = activityResult.value;
    activityItems = actData?.items ?? actData?.results ?? (Array.isArray(actData) ? actData : []);
  } else {
    activityError = activityResult.reason;
  }

  // Render complete detail
  root.innerHTML = `<div class="stack stack--6">
  ${buildHero(entry, id)}
  <div class="grid grid--2">
    ${buildDataPanel(entry)}
    ${buildArchivePanel(entry)}
  </div>
  ${buildRatingPanel(rating)}
  ${buildRelatedPanel(entry)}
  ${buildActivityPanel(activityItems, activityError)}
</div>`;

  // Delete button listener (no DELETE real)
  document.getElementById('btn-delete')?.addEventListener('click', () => {
    showInfo('LA ELIMINACIÓN SE IMPLEMENTARÁ EN UNA TAREA POSTERIOR.');
  });
}

init();
