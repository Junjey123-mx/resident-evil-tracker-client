import { mountSidebar }        from '../components/sidebar.component.js';
import { mountStatusStrip }     from '../components/status-strip.component.js';
import { createArchiveEntry }   from '../services/archive-entry.service.js';
import { uploadCover }          from '../services/cover.service.js';
import {
  createArchiveFormFields,
  createArchiveFormStatusBar,
  createArchiveFormActions,
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
import { showError, showWarning } from '../core/notifications.js';

mountSidebar({ activePage: 'create' });
mountStatusStrip({ pageLabel: 'NUEVO REGISTRO' });

// ------------------------------------------------------------------ State
let blobUrl     = null;
let submitting  = false;

// ------------------------------------------------------------------ Helpers
function revokeBlobUrl() {
  if (blobUrl) { URL.revokeObjectURL(blobUrl); blobUrl = null; }
}

function readFormValues() {
  const form = document.getElementById('archive-form');
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
    status:                  el.status?.value                  ?? 'DRAFT',
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
    cover_image_url:         blobUrl ?? '',
  };
}

function validateCreateForm(values, file) {
  const errors = [];

  // title
  const title = String(values.title ?? '').trim();
  if (!title)           errors.push('El título es obligatorio.');
  else if (title.length < 2) errors.push('El título debe tener al menos 2 caracteres.');

  // release_year
  const yearRaw = String(values.release_year ?? '').trim();
  if (!yearRaw) {
    errors.push('El año de lanzamiento es obligatorio.');
  } else {
    const year = Number(yearRaw);
    if (!Number.isInteger(year) || year < 1996 || year > 2026)
      errors.push('El año de lanzamiento debe estar entre 1996 y 2026.');
  }

  // main_protagonist
  if (!String(values.main_protagonist ?? '').trim())
    errors.push('El protagonista principal es obligatorio.');

  // original_platform
  if (!String(values.original_platform ?? '').trim())
    errors.push('La plataforma original es obligatoria.');

  // chronology_order
  const orderRaw = String(values.chronology_order ?? '').trim();
  if (!orderRaw) {
    errors.push('El orden cronológico es obligatorio.');
  } else {
    const order = Number(orderRaw);
    if (!Number.isInteger(order) || order < 1)
      errors.push('El orden cronológico debe ser un entero positivo.');
  }

  // description
  const desc = String(values.description ?? '').trim();
  if (!desc)               errors.push('La descripción es obligatoria.');
  else if (desc.length < 10) errors.push('La descripción debe tener al menos 10 caracteres.');

  // survival_index (optional)
  const survivalRaw = String(values.survival_index ?? '').trim();
  if (survivalRaw !== '') {
    const si = Number(survivalRaw);
    if (Number.isNaN(si) || si < 0 || si > 100)
      errors.push('El survival index debe estar entre 0 y 100.');
  }

  // players (optional)
  const playersRaw = String(values.players ?? '').trim();
  if (playersRaw !== '') {
    const pl = Number(playersRaw);
    if (!Number.isInteger(pl) || pl < 1)
      errors.push('La cantidad de jugadores debe ser mayor o igual a 1.');
  }

  // cover file (optional)
  if (file) {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type))
      errors.push('La portada debe ser JPEG, PNG o WEBP.');
    else if (file.size > 1 * 1024 * 1024)
      errors.push('La portada no debe superar 1 MB.');
  }

  return errors;
}

// ------------------------------------------------------------------ Partial DOM updates (preserve form + file input state)
function setStatusBar(data) {
  const wrap = document.getElementById('form-status-wrap');
  if (wrap) wrap.innerHTML = createArchiveFormStatusBar(data);
}

function setValidation(messages) {
  const wrap = document.getElementById('form-validation-wrap');
  if (wrap) wrap.innerHTML = messages.length ? createValidationPanel(messages) : '';
}

function setSubmitLoading(loading) {
  const btn = document.querySelector('#archive-form [type="submit"]');
  if (!btn) return;
  btn.disabled = loading;
  btn.setAttribute('aria-disabled', String(loading));
  btn.textContent = loading ? 'PROCESANDO...' : 'CREAR REGISTRO';
}

function updatePreview(rawValues) {
  const aside = document.getElementById('form-preview-aside');
  if (aside) aside.innerHTML = createArchivePreview(rawValues);
}

function updateCoverPreview(url) {
  const previewEl = document.querySelector('.cover-upload__preview');
  if (!previewEl) return;
  previewEl.innerHTML = url
    ? `<img src="${url}" alt="PORTADA SELECCIONADA" loading="lazy">`
    : `<span class="upload-zone__label">SIN PORTADA</span>`;
}

function updateCoverMeta(file) {
  const wrap = document.getElementById('cover-file-info');
  if (wrap) wrap.innerHTML = file ? createCoverFileMeta(file) : '';
}

// ------------------------------------------------------------------ Initial render
function renderForm() {
  const root = document.getElementById('create-game-root');
  if (!root) return;

  const defaults    = getDefaultArchiveEntryValues();
  const fieldsHtml  = createArchiveFormFields(defaults);
  const coverHtml   = createCoverUpload({ inputId: 'cover-upload' });
  const previewHtml = createArchivePreview(defaults);
  const actionsHtml = createArchiveFormActions({
    submitLabel: 'CREAR REGISTRO',
    cancelHref:  'games.html',
    showReset:   true,
  });

  root.innerHTML = `<form id="archive-form" class="form archive-form" novalidate>
  <div id="form-status-wrap">${createArchiveFormStatusBar({ status: 'idle' })}</div>
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
  const form = document.getElementById('archive-form');
  if (!form) return;

  // Live preview on field input/change (skip file inputs)
  form.addEventListener('input', (e) => {
    if (e.target.type !== 'file') updatePreview(readFormValues());
  });
  form.addEventListener('change', (e) => {
    if (e.target.type !== 'file') updatePreview(readFormValues());
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
      updateCoverPreview(null);
      updateCoverMeta(null);
    }
    updatePreview(readFormValues());
  });

  // Reset — clear cover state and refresh preview after browser resets values
  form.addEventListener('reset', () => {
    revokeBlobUrl();
    updateCoverPreview(null);
    updateCoverMeta(null);
    setTimeout(() => updatePreview(readFormValues()), 0);
  });

  form.addEventListener('submit', handleSubmit);
}

// ------------------------------------------------------------------ Submit
async function handleSubmit(e) {
  e.preventDefault();
  if (submitting) return;

  const rawValues    = readFormValues();
  const coverFile    = document.getElementById('cover-upload')?.files?.[0] ?? null;
  const clientErrors = validateCreateForm(rawValues, coverFile);

  if (clientErrors.length > 0) {
    setValidation(clientErrors);
    setStatusBar({ status: 'error', message: 'REVISA LOS CAMPOS REQUERIDOS.' });
    showError(clientErrors[0]);
    const firstInvalid = document.querySelector(
      '#archive-form input:invalid, #archive-form select:invalid, #archive-form textarea:invalid'
    );
    firstInvalid?.focus();
    return;
  }

  setValidation([]);
  setStatusBar({ status: 'loading' });
  submitting = true;
  setSubmitLoading(true);

  // Exclude blob URL — cover comes from file upload, not a text field
  const { cover_image_url, ...formData } = rawValues;
  const payload = normalizeArchiveFormValues(formData);

  let createdEntry;
  try {
    createdEntry = await createArchiveEntry(payload);
  } catch (err) {
    const msgs = normalizeValidationMessages(err);
    setValidation(msgs.length ? msgs : [err?.message || 'Error al crear el registro.']);
    setStatusBar({ status: 'error', message: 'ERROR AL CREAR EL REGISTRO.' });
    submitting = false;
    setSubmitLoading(false);
    showError(err?.message || 'Error al crear el registro.');
    return;
  }

  const createdId = createdEntry?.id ?? createdEntry?.series_id ?? null;

  // Optional cover upload — failure warns but does not block redirect
  if (coverFile && createdId != null) {
    try {
      await uploadCover(createdId, coverFile);
    } catch (coverErr) {
      revokeBlobUrl();
      const coverMsg = coverErr?.status === 503
        ? 'REGISTRO CREADO. El servicio de portadas no está disponible (503). Puedes subirla desde la edición.'
        : 'REGISTRO CREADO. La portada no pudo subirse. Puedes subirla desde la edición del registro.';
      showWarning(coverMsg);
      window.location.href = `game-detail.html?id=${encodeURIComponent(createdId)}`;
      return;
    }
  }

  revokeBlobUrl();
  window.location.href = `game-detail.html?id=${encodeURIComponent(createdId)}`;
}

// ------------------------------------------------------------------ Init
renderForm();
attachEvents();
