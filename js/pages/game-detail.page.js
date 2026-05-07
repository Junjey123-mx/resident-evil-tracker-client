import { mountSidebar }           from '../components/sidebar.component.js';
import { mountStatusStrip }        from '../components/status-strip.component.js';
import { getArchiveEntryById, deleteArchiveEntry } from '../services/archive-entry.service.js';
import {
  getRatingBySeriesId,
  createRating,
  updateRating,
  deleteRating,
}                                  from '../services/rating.service.js';
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
  createFormValidationSummary,
  normalizeValidationMessages,
} from '../components/validation-panel.component.js';
import {
  formatText,
  formatDate,
  formatYear,
  formatDisplayScore,
  formatSurvivalIndex,
  formatFileCode,
} from '../core/formatters.js';
import { showError, showSuccess, showInfo } from '../core/notifications.js';

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

// ------------------------------------------------------------------ Rating — form HTML builder
function buildRatingFormHtml(rating) {
  const hasRating = !!rating;
  const scoreNum  = hasRating ? Math.round(Number(rating.rating_score ?? rating.score ?? 0)) : 0;
  const reviewVal = hasRating ? (rating.personal_review ?? rating.review ?? '') : '';

  let scoreOptions = '<option value="">-- SELECCIONAR --</option>';
  for (let i = 1; i <= 10; i++) {
    const sel = (scoreNum === i) ? ' selected' : '';
    scoreOptions += `<option value="${i}"${sel}>${i} / 10</option>`;
  }

  const submitLabel = hasRating ? 'ACTUALIZAR RATING' : 'GUARDAR RATING';
  const deleteBtn   = hasRating
    ? `<button type="button" id="btn-rating-delete" class="btn btn--danger btn--sm">ELIMINAR RATING</button>`
    : '';

  return `<div class="rating-form">
  <div class="archive-form__section-title">CALIFICAR REGISTRO</div>
  <div id="rating-validation" class="rating-form__validation"></div>
  <form id="rating-form" class="form" novalidate>
    <div class="rating-form__grid">
      <div class="form-group">
        <label for="rating-score" class="form-label form-label--required">PUNTUACIÓN</label>
        <select id="rating-score" name="score" class="form-select" required>
          ${scoreOptions}
        </select>
        <span class="form-hint">Del 1 al 10</span>
      </div>
      <div class="form-group">
        <label for="rating-review" class="form-label">RESEÑA PERSONAL</label>
        <textarea id="rating-review" name="review" class="form-textarea" maxlength="500" placeholder="Escribe tu reseña personal...">${escapeHtml(String(reviewVal))}</textarea>
        <span class="form-hint">Opcional. Máximo 500 caracteres.</span>
      </div>
    </div>
    <div class="rating-form__actions">
      <button type="submit" id="btn-rating-submit" class="btn btn--primary btn--sm">${submitLabel}</button>
      ${deleteBtn}
    </div>
  </form>
</div>`;
}

// ------------------------------------------------------------------ Rating personal — panel builder
function buildRatingPanel(rating) {
  if (!rating) {
    const body = `<div class="stack stack--4">
  ${createEmptyState({
    title:   'SIN RATING PERSONAL',
    message: 'Este registro todavía no tiene calificación personal.',
    icon:    '◎',
  })}
  ${buildRatingFormHtml(null)}
</div>`;
    return `<div id="rating-panel-root">${sectionPanel('RATING PERSONAL', body)}</div>`;
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

  const summaryHtml = `<div class="stack stack--4">
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

  const body = `<div class="stack stack--4">
  ${summaryHtml}
  ${buildRatingFormHtml(rating)}
</div>`;

  return `<div id="rating-panel-root">${sectionPanel('RATING PERSONAL', body)}</div>`;
}

// ------------------------------------------------------------------ Rating — client-side validation
function validateRatingClientSide(score, review) {
  const errors = [];
  if (!score) {
    errors.push('La puntuación es requerida.');
  } else {
    const n = Number(score);
    if (!Number.isFinite(n) || n < 1 || n > 10) {
      errors.push('La puntuación debe ser un número entre 1 y 10.');
    }
  }
  if (review && String(review).length > 500) {
    errors.push('La reseña no puede superar los 500 caracteres.');
  }
  return errors;
}

// ------------------------------------------------------------------ Rating — re-render panel only
async function rerenderRatingPanel(seriesId) {
  const root = document.getElementById('rating-panel-root');
  if (!root) return;

  root.innerHTML = sectionPanel('RATING PERSONAL', createLoadingState('ACTUALIZANDO RATING...'));

  let rating = null;
  try {
    rating = await getRatingBySeriesId(seriesId);
  } catch (err) {
    if (err?.status !== 404) {
      root.innerHTML = sectionPanel('RATING PERSONAL', createErrorState({
        title:   'ERROR AL CARGAR RATING',
        message: 'No se pudo actualizar el panel de rating.',
      }));
      return;
    }
  }

  const temp = document.createElement('div');
  temp.innerHTML = buildRatingPanel(rating);
  root.replaceWith(temp.firstElementChild);

  wireRatingSection(seriesId);
}

// ------------------------------------------------------------------ Rating — delete handler
async function handleRatingDelete(seriesId) {
  if (!window.confirm('¿Eliminar el rating personal de este registro?')) return;

  const deleteBtn = document.getElementById('btn-rating-delete');
  const submitBtn = document.getElementById('btn-rating-submit');

  if (deleteBtn) { deleteBtn.disabled = true; deleteBtn.textContent = 'ELIMINANDO...'; }
  if (submitBtn) submitBtn.disabled = true;

  try {
    await deleteRating(seriesId);
    showSuccess('Rating eliminado correctamente.');
    await rerenderRatingPanel(seriesId);
  } catch (err) {
    if (err?.status === 404) {
      showInfo('El rating ya no existía. Actualizando vista.');
      await rerenderRatingPanel(seriesId);
    } else {
      if (deleteBtn) { deleteBtn.disabled = false; deleteBtn.textContent = 'ELIMINAR RATING'; }
      if (submitBtn) submitBtn.disabled = false;
      showError(err?.message || 'Error al eliminar el rating.');
    }
  }
}

// ------------------------------------------------------------------ Rating — submit handler
async function handleRatingSubmit(seriesId, hasRating) {
  const scoreEl      = document.getElementById('rating-score');
  const reviewEl     = document.getElementById('rating-review');
  const submitBtn    = document.getElementById('btn-rating-submit');
  const validationEl = document.getElementById('rating-validation');

  if (!scoreEl || !submitBtn || !validationEl) return;

  const score  = scoreEl.value.trim();
  const review = reviewEl ? reviewEl.value.trim() : '';

  const errors = validateRatingClientSide(score, review);
  if (errors.length > 0) {
    validationEl.innerHTML = createFormValidationSummary(errors);
    return;
  }
  validationEl.innerHTML = '';

  submitBtn.disabled = true;
  submitBtn.textContent = 'GUARDANDO...';

  const payload = { score: Number(score), review: review || null };

  try {
    if (hasRating) {
      await updateRating(seriesId, payload);
      showSuccess('Rating actualizado correctamente.');
    } else {
      await createRating(seriesId, payload);
      showSuccess('Rating creado correctamente.');
    }
    await rerenderRatingPanel(seriesId);
  } catch (err) {
    submitBtn.disabled = false;
    submitBtn.textContent = hasRating ? 'ACTUALIZAR RATING' : 'GUARDAR RATING';

    const status = err?.status;
    if (status === 409) {
      validationEl.innerHTML = createFormValidationSummary([
        'Este registro ya tiene rating. Recarga o actualiza la calificación existente.',
      ]);
    } else if (status === 422) {
      const msgs = normalizeValidationMessages(err?.data ?? err);
      validationEl.innerHTML = createFormValidationSummary(
        msgs.length > 0 ? msgs : ['Error de validación. Revisa los datos ingresados.']
      );
    } else if (status === 404 && hasRating) {
      validationEl.innerHTML = createFormValidationSummary([
        'El rating ya no existe. Actualizando vista.',
      ]);
      await rerenderRatingPanel(seriesId);
    } else {
      showError(err?.message || 'Error al guardar el rating.');
    }
  }
}

// ------------------------------------------------------------------ Rating — wire events
function wireRatingSection(seriesId) {
  const form = document.getElementById('rating-form');
  if (!form) return;

  const hasRating = !!document.getElementById('btn-rating-delete');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    handleRatingSubmit(seriesId, hasRating);
  });

  const deleteBtn = document.getElementById('btn-rating-delete');
  if (deleteBtn) {
    deleteBtn.addEventListener('click', () => {
      handleRatingDelete(seriesId);
    });
  }
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

  const [entryResult, ratingResult, activityResult] = await Promise.allSettled([
    getArchiveEntryById(id),
    getRatingBySeriesId(id),
    listActivityBySeriesId(id),
  ]);

  if (entryResult.status === 'rejected') {
    const err   = entryResult.reason;
    const is404 = err?.status === 404;
    root.innerHTML = createErrorState({
      title:   is404 ? 'REGISTRO NO ENCONTRADO' : 'ERROR AL CARGAR EL REGISTRO',
      message: is404
        ? 'El registro solicitado no existe o fue eliminado.'
        : `No se pudo cargar el detalle del registro.${err?.status ? ` [HTTP ${err.status}]` : ''}`,
    });
    showError(err?.message || 'Error al cargar el registro.');
    return;
  }

  const entry = entryResult.value;

  let rating = null;
  if (ratingResult.status === 'fulfilled') {
    rating = ratingResult.value;
  } else if (ratingResult.reason?.status !== 404) {
    console.warn('[game-detail] rating load error:', ratingResult.reason?.message);
  }

  let activityItems = [];
  let activityError = null;
  if (activityResult.status === 'fulfilled') {
    const actData = activityResult.value;
    activityItems = actData?.items ?? actData?.results ?? (Array.isArray(actData) ? actData : []);
  } else {
    activityError = activityResult.reason;
  }

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

  document.getElementById('btn-delete')?.addEventListener('click', async () => {
    if (!window.confirm('¿Eliminar este registro del archivo? Esta acción no se puede deshacer.')) return;

    const btn = document.getElementById('btn-delete');
    if (btn) { btn.disabled = true; btn.textContent = 'ELIMINANDO...'; }

    try {
      await deleteArchiveEntry(id);
      showSuccess('Registro eliminado correctamente.');
      window.location.href = 'games.html';
    } catch (err) {
      if (btn) { btn.disabled = false; btn.textContent = 'ELIMINAR'; }
      const status = err?.status;
      showError(
        status === 404
          ? 'El registro ya no existe o fue eliminado.'
          : err?.message || 'No se pudo eliminar el registro.'
      );
    }
  });

  wireRatingSection(id);
}

init();
