import { mountSidebar }                         from '../components/sidebar.component.js';
import { mountStatusStrip }                      from '../components/status-strip.component.js';
import { getArchiveEntryById, updateArchiveEntry } from '../services/archive-entry.service.js';
import { uploadCover }                           from '../services/cover.service.js';
import {
  createArchiveFormFields,
  createArchiveFormStatusBar,
  createArchivePreview,
  normalizeArchiveFormValues,
  getDefaultArchiveEntryValues,
} from '../components/archive-form.component.js';
import {
  createCoverUpload,
  createCoverFileMeta,
} from '../components/cover-upload.component.js';
import {
  normalizeValidationMessages,
  createValidationPanel,
} from '../components/validation-panel.component.js';
import {
  createLoadingState,
  createErrorState,
} from '../components/empty-state.component.js';
import { getIdFromQuery } from '../core/query-params.js';
import { showSuccess, showError, showWarning, showInfo } from '../core/notifications.js';

mountSidebar({ activePage: 'games' });
mountStatusStrip({ pageLabel: 'EDITAR REGISTRO' });

// ------------------------------------------------------------------ State
let entryId       = null;
let originalEntry = null;
let blobUrl       = null;

// ------------------------------------------------------------------ escapeHtml
function escapeHtml(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ------------------------------------------------------------------ Helpers
function revokeBlobUrl() {
  if (blobUrl) { URL.revokeObjectURL(blobUrl); blobUrl = null; }
}

// Map API entry → raw string values matching what form elements produce
function entryToFormValues(entry) {
  return {
    title:                   String(entry.title ?? ''),
    file_code:               String(entry.file_code ?? ''),
    release_year:            entry.release_year        != null ? String(entry.release_year)        : '',
    original_platform:       String(entry.original_platform ?? ''),
    main_protagonist:        String(entry.main_protagonist  ?? ''),
    chronology_order:        entry.chronology_order    != null ? String(entry.chronology_order)    : '',
    description:             String(entry.description ?? entry.synopsis ?? ''),
    category:                String(entry.category    ?? ''),
    status:                  String(entry.status       ?? ''),
    threat_level:            String(entry.threat_level ?? ''),
    display_score:           entry.display_score       != null ? String(entry.display_score)       : '',
    director:                String(entry.director                ?? ''),
    developer:               String(entry.developer               ?? ''),
    genre:                   String(entry.genre                   ?? ''),
    engine:                  String(entry.engine                  ?? ''),
    umbrella_classification: String(entry.umbrella_classification ?? ''),
    survival_index:          entry.survival_index  != null ? String(entry.survival_index)  : '',
    players:                 entry.players         != null ? String(entry.players)         : '',
    estimated_duration:      String(entry.estimated_duration   ?? ''),
    chronology_era:          String(entry.chronology_era       ?? ''),
    alias_title:             String(entry.alias_title          ?? ''),
    main_locations:          String(entry.main_locations       ?? ''),
    threat_type:             String(entry.threat_type          ?? ''),
    registered_platforms:    String(entry.registered_platforms ?? ''),
  };
}

// Read all current values from the edit form DOM
function getFormValues() {
  const form = document.getElementById('edit-form');
  if (!form) return getDefaultArchiveEntryValues();
  const el = form.elements;
  return {
    title:                   el.title?.value                   ?? '',
    file_code:               el.file_code?.value               ?? '',
    release_year:            el.release_year?.value            ?? '',
    original_platform:       el.original_platform?.value       ?? '',
    main_protagonist:        el.main_protagonist?.value        ?? '',
    chronology_order:        el.chronology_order?.value        ?? '',
    description:             el.description?.value             ?? '',
    category:                el.category?.value                ?? '',
    status:                  el.status?.value                  ?? '',
    threat_level:            el.threat_level?.value            ?? '',
    display_score:           el.display_score?.value           ?? '',
    director:                el.director?.value                ?? '',
    developer:               el.developer?.value               ?? '',
    genre:                   el.genre?.value                   ?? '',
    engine:                  el.engine?.value                  ?? '',
    umbrella_classification: el.umbrella_classification?.value ?? '',
    survival_index:          el.survival_index?.value          ?? '',
    players:                 el.players?.value                 ?? '',
    estimated_duration:      el.estimated_duration?.value      ?? '',
    chronology_era:          el.chronology_era?.value          ?? '',
    alias_title:             el.alias_title?.value             ?? '',
    main_locations:          el.main_locations?.value          ?? '',
    threat_type:             el.threat_type?.value             ?? '',
    registered_platforms:    el.registered_platforms?.value    ?? '',
  };
}

function normalizeForCompare(values) {
  const { cover_image_url, ...v } = normalizeArchiveFormValues({ ...values, cover_image_url: '' });
  return JSON.stringify(v);
}

function getCoverFile() {
  return document.getElementById('cover-upload')?.files?.[0] ?? null;
}

function detectFieldChanges() {
  if (!originalEntry) return false;
  return normalizeForCompare(entryToFormValues(originalEntry)) !== normalizeForCompare(getFormValues());
}

function detectChanges() {
  return { fieldChanges: detectFieldChanges(), hasFile: !!getCoverFile() };
}

// ------------------------------------------------------------------ Validation
function validateEditForm(values, file) {
  const errors = [];

  const title = String(values.title ?? '').trim();
  if (!title)               errors.push('El título es obligatorio.');
  else if (title.length < 2) errors.push('El título debe tener al menos 2 caracteres.');

  const yearRaw = String(values.release_year ?? '').trim();
  if (!yearRaw) {
    errors.push('El año de lanzamiento es obligatorio.');
  } else {
    const year = Number(yearRaw);
    if (!Number.isInteger(year) || year < 1996 || year > 2026)
      errors.push('El año de lanzamiento debe estar entre 1996 y 2026.');
  }

  if (!String(values.main_protagonist ?? '').trim())
    errors.push('El protagonista principal es obligatorio.');

  if (!String(values.original_platform ?? '').trim())
    errors.push('La plataforma original es obligatoria.');

  const orderRaw = String(values.chronology_order ?? '').trim();
  if (!orderRaw) {
    errors.push('El orden cronológico es obligatorio.');
  } else {
    const order = Number(orderRaw);
    if (!Number.isInteger(order) || order < 1)
      errors.push('El orden cronológico debe ser un entero positivo.');
  }

  const desc = String(values.description ?? '').trim();
  if (!desc)                 errors.push('La descripción es obligatoria.');
  else if (desc.length < 10) errors.push('La descripción debe tener al menos 10 caracteres.');

  const survivalRaw = String(values.survival_index ?? '').trim();
  if (survivalRaw !== '') {
    const si = Number(survivalRaw);
    if (Number.isNaN(si) || si < 0 || si > 100)
      errors.push('El survival index debe estar entre 0 y 100.');
  }

  const playersRaw = String(values.players ?? '').trim();
  if (playersRaw !== '') {
    const pl = Number(playersRaw);
    if (!Number.isInteger(pl) || pl < 1)
      errors.push('La cantidad de jugadores debe ser mayor o igual a 1.');
  }

  if (file) {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type))
      errors.push('La portada debe ser JPEG, PNG o WEBP.');
    else if (file.size > 1 * 1024 * 1024)
      errors.push('La portada no debe superar 1 MB.');
  }

  return errors;
}

// ------------------------------------------------------------------ Partial DOM updates (preserve form + file state)
function setStatusBar(data) {
  const wrap = document.getElementById('form-status-wrap');
  if (wrap) wrap.innerHTML = createArchiveFormStatusBar(data);
}

function setValidation(messages) {
  const wrap = document.getElementById('form-validation-wrap');
  if (wrap) wrap.innerHTML = messages.length ? createValidationPanel(messages) : '';
}

function setSubmitLoading(loading) {
  const btn = document.getElementById('btn-save');
  if (!btn) return;
  btn.disabled = loading;
  btn.setAttribute('aria-disabled', String(loading));
  btn.textContent = loading ? 'GUARDANDO CAMBIOS...' : 'GUARDAR CAMBIOS';
}

function updatePreview() {
  const aside = document.getElementById('form-preview-aside');
  if (!aside) return;
  const values   = getFormValues();
  const coverUrl = blobUrl || (originalEntry?.cover_image_url ?? '');
  aside.innerHTML = createArchivePreview({ ...values, cover_image_url: coverUrl });
}

function updateCoverPreview(url) {
  const previewEl = document.querySelector('.cover-upload__preview');
  if (!previewEl) return;
  previewEl.innerHTML = url
    ? `<img src="${escapeHtml(url)}" alt="PORTADA" loading="lazy">`
    : `<span class="upload-zone__label">SIN PORTADA</span>`;
}

function updateCoverMeta(file) {
  const wrap = document.getElementById('cover-file-info');
  if (wrap) wrap.innerHTML = file ? createCoverFileMeta(file) : '';
}

function updateChangeIndicator() {
  const { fieldChanges, hasFile } = detectChanges();
  const pending = fieldChanges || hasFile;
  setStatusBar(pending
    ? { status: 'pending', message: 'CAMBIOS PENDIENTES' }
    : { status: 'idle',    message: 'SIN CAMBIOS' }
  );
}

// ------------------------------------------------------------------ Restore original
function restoreOriginal() {
  if (!originalEntry) return;
  const form = document.getElementById('edit-form');
  if (!form) return;

  const vals = entryToFormValues(originalEntry);
  const el   = form.elements;
  Object.entries(vals).forEach(([name, value]) => {
    const input = el[name];
    if (input) input.value = value;
  });

  const coverInput = document.getElementById('cover-upload');
  if (coverInput) coverInput.value = '';
  revokeBlobUrl();

  updateCoverPreview(originalEntry.cover_image_url ?? null);
  updateCoverMeta(null);
  updatePreview();
  setValidation([]);
  setStatusBar({ status: 'idle', message: 'SIN CAMBIOS' });
}

// ------------------------------------------------------------------ Actions HTML
function buildEditActions(cancelHref) {
  return `<div class="form-actions form-actions--split">
  <div class="cluster cluster--2">
    <button type="submit" id="btn-save" class="btn btn--primary">GUARDAR CAMBIOS</button>
    <button type="button" id="btn-restore" class="btn btn--ghost">RESTABLECER</button>
  </div>
  <a href="${escapeHtml(cancelHref)}" class="btn btn--ghost">CANCELAR</a>
</div>`.trim();
}

// ------------------------------------------------------------------ Render
function renderForm(entry) {
  const root = document.getElementById('edit-game-root');
  if (!root) return;

  const cancelHref  = `game-detail.html?id=${encodeURIComponent(entryId)}`;
  const fieldsHtml  = createArchiveFormFields(entry);
  const coverHtml   = createCoverUpload({
    inputId:    'cover-upload',
    currentUrl: entry.cover_image_url ?? null,
  });
  const previewHtml = createArchivePreview({
    ...entry,
    cover_image_url: entry.cover_image_url ?? '',
  });
  const actionsHtml = buildEditActions(cancelHref);

  root.innerHTML = `<form id="edit-form" class="form archive-form" novalidate>
  <div id="form-status-wrap">${createArchiveFormStatusBar({ status: 'idle', message: 'SIN CAMBIOS' })}</div>
  <div id="form-validation-wrap"></div>
  <div class="archive-form__grid">
    <div class="stack stack--5">
      ${fieldsHtml}
      <div class="archive-form__section">
        <div class="archive-form__section-title">PORTADA</div>
        ${coverHtml}
        <div id="cover-file-info"></div>
      </div>
    </div>
    <aside id="form-preview-aside">${previewHtml}</aside>
  </div>
  ${actionsHtml}
</form>`;
}

// ------------------------------------------------------------------ Events
function attachEvents() {
  const form = document.getElementById('edit-form');
  if (!form) return;

  // Live preview + change detection (skip file inputs)
  form.addEventListener('input', (e) => {
    if (e.target.type !== 'file') { updatePreview(); updateChangeIndicator(); }
  });
  form.addEventListener('change', (e) => {
    if (e.target.type !== 'file') { updatePreview(); updateChangeIndicator(); }
  });

  // Cover file selection
  document.getElementById('cover-upload')?.addEventListener('change', (e) => {
    const file = e.target.files?.[0] ?? null;
    revokeBlobUrl();
    if (file) {
      blobUrl = URL.createObjectURL(file);
      updateCoverPreview(blobUrl);
      updateCoverMeta(file);
    } else {
      updateCoverPreview(originalEntry?.cover_image_url ?? null);
      updateCoverMeta(null);
    }
    updatePreview();
    updateChangeIndicator();
  });

  // Restore button
  document.getElementById('btn-restore')?.addEventListener('click', restoreOriginal);

  form.addEventListener('submit', handleSubmit);
}

// ------------------------------------------------------------------ Submit
async function handleSubmit(e) {
  e.preventDefault();

  const currentValues = getFormValues();
  const coverFile     = getCoverFile();
  const clientErrors  = validateEditForm(currentValues, coverFile);

  if (clientErrors.length > 0) {
    setValidation(clientErrors);
    setStatusBar({ status: 'error', message: 'REVISA LOS CAMPOS REQUERIDOS.' });
    showError(clientErrors[0]);
    const firstInvalid = document.querySelector(
      '#edit-form input:invalid, #edit-form select:invalid, #edit-form textarea:invalid'
    );
    firstInvalid?.focus();
    return;
  }

  const { fieldChanges, hasFile } = detectChanges();
  if (!fieldChanges && !hasFile) {
    showInfo('No hay cambios pendientes.');
    return;
  }

  setValidation([]);
  setStatusBar({ status: 'loading', message: 'GUARDANDO CAMBIOS...' });
  setSubmitLoading(true);

  // PUT only if there are field changes
  if (fieldChanges) {
    const { cover_image_url, ...formData } = currentValues;
    const payload = normalizeArchiveFormValues(formData);

    try {
      await updateArchiveEntry(entryId, payload);
    } catch (err) {
      const msgs = normalizeValidationMessages(err);
      setValidation(msgs.length ? msgs : [err?.message || 'Error al actualizar el registro.']);
      setStatusBar({ status: 'error', message: 'ERROR AL GUARDAR CAMBIOS.' });
      setSubmitLoading(false);
      showError(err?.message || 'Error al actualizar el registro.');
      return;
    }
  }

  // Upload cover if a new file was selected
  if (hasFile) {
    try {
      await uploadCover(entryId, coverFile);
    } catch {
      revokeBlobUrl();
      showWarning('El registro fue actualizado, pero la portada no pudo subirse. Puedes intentarlo de nuevo desde la edición.');
      window.location.href = `game-detail.html?id=${encodeURIComponent(entryId)}`;
      return;
    }
  }

  revokeBlobUrl();
  showSuccess('Registro actualizado correctamente.');
  window.location.href = `game-detail.html?id=${encodeURIComponent(entryId)}`;
}

// ------------------------------------------------------------------ Init
async function init() {
  const root = document.getElementById('edit-game-root');
  if (!root) return;

  root.innerHTML = createLoadingState('CARGANDO REGISTRO PARA EDICIÓN...');

  const id = getIdFromQuery('id');
  if (!id || !Number.isFinite(id) || id <= 0) {
    root.innerHTML = `<div class="stack stack--4">
  ${createErrorState({
    title:   'IDENTIFICADOR INVÁLIDO',
    message: 'No se encontró el ID del registro en la URL.',
  })}
  <div><a href="games.html" class="btn btn--ghost btn--sm">← VOLVER AL ARCHIVO</a></div>
</div>`;
    return;
  }

  entryId = id;

  let entry;
  try {
    entry = await getArchiveEntryById(id);
  } catch (err) {
    const status = err?.status ? ` [HTTP ${err.status}]` : '';
    root.innerHTML = `<div class="stack stack--4">
  ${createErrorState({
    title:   'ERROR AL CARGAR EL REGISTRO',
    message: `No se pudo cargar el registro para edición.${status}`,
  })}
  <div><a href="games.html" class="btn btn--ghost btn--sm">← VOLVER AL ARCHIVO</a></div>
</div>`;
    showError(err?.message || 'Error al cargar el registro.');
    return;
  }

  originalEntry = entry;
  renderForm(entry);
  attachEvents();
}

init();
