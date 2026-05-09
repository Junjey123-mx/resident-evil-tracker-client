import { createCategoryBadge, createStatusBadge, createThreatBadge } from './rating-badge.component.js';

function getCoverUrl(entry) {
  return entry.cover_image_url
    || entry.coverImageUrl
    || entry.cover_url
    || entry.coverUrl
    || entry.image_url
    || entry.imageUrl
    || (entry.cover && entry.cover.url)
    || null;
}

function escapeHtml(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function createArchiveCardMeta(entry) {
  if (!entry) return '';
  const parts = [
    entry.release_year    ? escapeHtml(String(entry.release_year))  : '',
    entry.original_platform ? escapeHtml(entry.original_platform)   : '',
    entry.main_protagonist  ? escapeHtml(entry.main_protagonist)    : '',
  ].filter(Boolean);
  return parts.length > 0 ? `<div class="label">${parts.join(' · ')}</div>` : '';
}

export function createArchiveCardActions(entry) {
  if (!entry) return '';
  const id         = entry.id != null ? encodeURIComponent(entry.id) : null;
  const detailHref = id ? `game-detail.html?id=${id}` : '#';
  const editHref   = id ? `edit-game.html?id=${id}`   : '#';

  return `<div class="cluster cluster--2">
  <a href="${detailHref}" class="btn btn--ghost btn--sm">VER</a>
  <a href="${editHref}" class="btn btn--secondary btn--sm">EDITAR</a>
</div>`.trim();
}

export function createArchiveCard(entry, options = {}) {
  if (!entry) return '';

  const compact    = options.compact === true;
  const id         = entry.id != null ? encodeURIComponent(entry.id) : null;
  const rawId      = entry.id != null ? escapeHtml(String(entry.id)) : '';
  const detailHref = id ? `game-detail.html?id=${id}` : '#';
  const editHref   = id ? `edit-game.html?id=${id}`   : '#';
  const title      = escapeHtml(entry.title || 'SIN TÍTULO');
  const fileCode   = escapeHtml(entry.file_code || '—');

  // Cover: resolve URL from any backend field name, or show placeholder
  const coverUrl  = getCoverUrl(entry);
  const coverHtml = coverUrl
    ? `<img class="card__cover" src="${escapeHtml(coverUrl)}" alt="${title}" loading="lazy">`
    : `<div class="card__cover"></div>`;

  // Score badge
  const rawScore  = entry.display_score ?? entry.rating_score ?? null;
  const scoreHtml = rawScore != null
    ? `<span class="badge badge--default">${escapeHtml(String(rawScore))}</span>`
    : `<span class="badge badge--inactive">S/R</span>`;

  // Meta row
  const metaHtml = createArchiveCardMeta(entry);

  // Classification badges
  const catBadge    = entry.category_label    ? createCategoryBadge(null, entry.category_label)                   : '';
  const statusBadge = entry.status_label      ? createStatusBadge(entry.status_label, entry.status_label)          : '';
  const threatBadge = entry.threat_level_label ? createThreatBadge(entry.threat_level_label, entry.threat_level_label) : '';
  const badgesHtml  = [catBadge, statusBadge, threatBadge].filter(Boolean).join('');

  const editBtn   = compact ? '' : `<a href="${editHref}" class="btn btn--secondary btn--sm">EDITAR</a>`;
  const deleteBtn = compact || !rawId ? '' : `<button type="button" class="btn btn--danger btn--sm" data-action="delete" data-id="${rawId}">ELIMINAR</button>`;

  return `<article class="card card--interactive card--cover">
  ${coverHtml}
  <div class="card__body stack stack--3">
    <div class="split">
      <span class="label">${fileCode}</span>
      ${scoreHtml}
    </div>
    <div class="card__title"><a href="${detailHref}">${title}</a></div>
    ${metaHtml}
    ${badgesHtml ? `<div class="cluster cluster--2">${badgesHtml}</div>` : ''}
  </div>
  <div class="card__footer">
    <a href="${detailHref}" class="btn btn--ghost btn--sm">VER DETALLE</a>
    ${editBtn}
    ${deleteBtn}
  </div>
</article>`.trim();
}
