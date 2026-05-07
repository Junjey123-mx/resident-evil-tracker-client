import { createCategoryBadge, createStatusBadge, createThreatBadge } from './rating-badge.component.js';
import { createValidationPanel } from './validation-panel.component.js';

function escapeHtml(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const CATEGORY_OPTIONS = [
  { value: '',            label: 'SELECCIONAR...' },
  { value: 'MAINLINE',    label: 'MAINLINE'        },
  { value: 'SPINOFF',     label: 'SPINOFF'         },
  { value: 'REMAKE',      label: 'REMAKE'          },
  { value: 'REMASTER',    label: 'REMASTER'        },
  { value: 'CANON_MEDIA', label: 'MEDIOS CANON'    },
  { value: 'OTHER',       label: 'OTRO'            },
];

const STATUS_OPTIONS = [
  { value: '',           label: 'SELECCIONAR...' },
  { value: 'DRAFT',      label: 'BORRADOR'       },
  { value: 'REGISTERED', label: 'REGISTRADO'     },
  { value: 'ACTIVE',     label: 'ACTIVO'         },
  { value: 'ARCHIVED',   label: 'ARCHIVADO'      },
];

const THREAT_LEVEL_OPTIONS = [
  { value: '',         label: 'SELECCIONAR...' },
  { value: 'LOW',      label: 'BAJO'           },
  { value: 'MEDIUM',   label: 'MEDIO'          },
  { value: 'HIGH',     label: 'ALTO'           },
  { value: 'CRITICAL', label: 'CRÍTICO'        },
];

function createSelectOptions(options, selectedValue) {
  return options.map(({ value, label }) => {
    const sel = String(value) === String(selectedValue ?? '') ? ' selected' : '';
    return `<option value="${escapeHtml(String(value))}"${sel}>${escapeHtml(label)}</option>`;
  }).join('');
}

function createFormGroup({ id, label, required = false, input, hint = '' }) {
  const labelClass = `form-label${required ? ' form-label--required' : ''}`;
  const hintHtml   = hint ? `<span class="form-hint">${escapeHtml(hint)}</span>` : '';
  return `<div class="form-group">
  <label class="${labelClass}" for="${escapeHtml(id)}">${escapeHtml(label)}</label>
  ${input}
  ${hintHtml}
</div>`.trim();
}

export function getDefaultArchiveEntryValues() {
  return {
    title:                   '',
    file_code:               '',
    release_year:            '',
    original_platform:       '',
    main_protagonist:        '',
    chronology_order:        '',
    description:             '',
    category:                '',
    status:                  'DRAFT',
    threat_level:            '',
    display_score:           '',
    cover_image_url:         '',
    director:                '',
    developer:               '',
    genre:                   '',
    engine:                  '',
    umbrella_classification: '',
    survival_index:          '',
    players:                 '',
    estimated_duration:      '',
    chronology_era:          '',
    alias_title:             '',
    main_locations:          '',
    threat_type:             '',
    registered_platforms:    '',
  };
}

export function normalizeArchiveFormValues(values = {}) {
  const v = { ...values };
  const stringFields = [
    'title', 'file_code', 'original_platform', 'main_protagonist',
    'description', 'cover_image_url', 'category', 'status', 'threat_level',
    'director', 'developer', 'genre', 'engine', 'umbrella_classification',
    'estimated_duration', 'chronology_era', 'alias_title', 'main_locations',
    'threat_type', 'registered_platforms',
  ];
  for (const f of stringFields) {
    if (typeof v[f] === 'string') v[f] = v[f].trim() || null;
  }
  const numericFields = ['release_year', 'chronology_order', 'display_score', 'survival_index', 'players'];
  for (const f of numericFields) {
    if (v[f] === '' || v[f] === null || v[f] === undefined) {
      v[f] = null;
    } else {
      const n = Number(v[f]);
      v[f] = Number.isNaN(n) ? null : n;
    }
  }
  return v;
}

export function createArchiveFormStatusBar({ status = 'idle', message = '' } = {}) {
  const modClass  = status !== 'idle' ? ` form-status-bar--${escapeHtml(status)}` : '';
  const defaults  = { idle: 'EN ESPERA', loading: 'PROCESANDO...', error: 'ERROR EN FORMULARIO', success: 'GUARDADO CORRECTAMENTE' };
  const dot       = { idle: '◉', loading: '◌', error: '✕', success: '✓' }[status] || '◉';
  const text      = message ? escapeHtml(message) : (defaults[status] || 'EN ESPERA');
  return `<div class="form-status-bar${modClass}">
  <span>${dot}</span>
  <span>${text}</span>
</div>`.trim();
}

export function createArchivePreview(entry = {}) {
  const e        = { ...getDefaultArchiveEntryValues(), ...entry };
  const title    = escapeHtml(e.title || 'SIN TÍTULO');
  const fileCode = escapeHtml(e.file_code || '—');

  const coverHtml = e.cover_image_url
    ? `<img class="card__cover" src="${escapeHtml(e.cover_image_url)}" alt="${title}" loading="lazy">`
    : `<div class="card__cover"></div>`;

  const rawScore  = e.display_score != null && e.display_score !== '' ? e.display_score : null;
  const scoreHtml = rawScore != null
    ? `<span class="badge badge--default">${escapeHtml(String(rawScore))}</span>`
    : `<span class="badge badge--inactive">S/R</span>`;

  const metaParts = [
    e.release_year      ? escapeHtml(String(e.release_year))  : '',
    e.original_platform ? escapeHtml(e.original_platform)     : '',
    e.main_protagonist  ? escapeHtml(e.main_protagonist)      : '',
  ].filter(Boolean);
  const metaHtml = metaParts.length ? `<div class="label">${metaParts.join(' · ')}</div>` : '';

  const catBadge    = e.category     ? createCategoryBadge(null, e.category)              : '';
  const statusBadge = e.status       ? createStatusBadge(e.status, e.status)              : '';
  const threatBadge = e.threat_level ? createThreatBadge(e.threat_level, e.threat_level)  : '';
  const badgesHtml  = [catBadge, statusBadge, threatBadge].filter(Boolean).join('');

  return `<div class="archive-form__preview panel panel--tech">
  <div class="panel__header">
    <span class="panel__title">VISTA PREVIA</span>
  </div>
  <div class="panel__body stack stack--3">
    ${coverHtml}
    <div class="split">
      <span class="label">${fileCode}</span>
      ${scoreHtml}
    </div>
    <div><strong>${title}</strong></div>
    ${metaHtml}
    ${badgesHtml ? `<div class="cluster cluster--2">${badgesHtml}</div>` : ''}
  </div>
</div>`.trim();
}

export function createArchiveFormFields(entry = {}) {
  const e = { ...getDefaultArchiveEntryValues(), ...entry };

  const identSection = `<div class="archive-form__section">
  <div class="archive-form__section-title">IDENTIFICACIÓN</div>
  <div class="form-row">
    ${createFormGroup({ id: 'field-title', label: 'TÍTULO', required: true,
      input: `<input class="form-input" type="text" id="field-title" name="title" value="${escapeHtml(e.title || '')}" placeholder="RESIDENT EVIL..." required maxlength="200">` })}
    ${createFormGroup({ id: 'field-file-code', label: 'CÓDIGO DE ARCHIVO',
      input: `<input class="form-input" type="text" id="field-file-code" name="file_code" value="${escapeHtml(e.file_code || '')}" placeholder="RE-001" maxlength="20">`,
      hint: 'AUTO-GENERADO SI SE OMITE' })}
  </div>
</div>`;

  const dataSection = `<div class="archive-form__section">
  <div class="archive-form__section-title">DATOS PRINCIPALES</div>
  <div class="form-row">
    ${createFormGroup({ id: 'field-release-year', label: 'AÑO DE LANZAMIENTO',
      input: `<input class="form-input" type="number" id="field-release-year" name="release_year" value="${escapeHtml(String(e.release_year || ''))}" placeholder="1996" min="1990" max="2099">` })}
    ${createFormGroup({ id: 'field-chronology-order', label: 'ORDEN CRONOLÓGICO',
      input: `<input class="form-input" type="number" id="field-chronology-order" name="chronology_order" value="${escapeHtml(String(e.chronology_order || ''))}" placeholder="1" min="1">`,
      hint: 'POSICIÓN EN LA LÍNEA CRONOLÓGICA' })}
  </div>
  <div class="form-row">
    ${createFormGroup({ id: 'field-original-platform', label: 'PLATAFORMA ORIGINAL',
      input: `<input class="form-input" type="text" id="field-original-platform" name="original_platform" value="${escapeHtml(e.original_platform || '')}" placeholder="PLAYSTATION, PC, GBA...">` })}
    ${createFormGroup({ id: 'field-main-protagonist', label: 'PROTAGONISTA PRINCIPAL',
      input: `<input class="form-input" type="text" id="field-main-protagonist" name="main_protagonist" value="${escapeHtml(e.main_protagonist || '')}" placeholder="LEON S. KENNEDY...">` })}
  </div>
</div>`;

  const classSection = `<div class="archive-form__section">
  <div class="archive-form__section-title">CLASIFICACIÓN</div>
  <div class="form-row">
    ${createFormGroup({ id: 'field-category', label: 'CATEGORÍA',
      input: `<select class="form-select" id="field-category" name="category">${createSelectOptions(CATEGORY_OPTIONS, e.category)}</select>` })}
    ${createFormGroup({ id: 'field-status', label: 'ESTADO',
      input: `<select class="form-select" id="field-status" name="status">${createSelectOptions(STATUS_OPTIONS, e.status)}</select>` })}
  </div>
  <div class="form-row">
    ${createFormGroup({ id: 'field-threat-level', label: 'NIVEL DE AMENAZA',
      input: `<select class="form-select" id="field-threat-level" name="threat_level">${createSelectOptions(THREAT_LEVEL_OPTIONS, e.threat_level)}</select>` })}
    ${createFormGroup({ id: 'field-display-score', label: 'PUNTUACIÓN',
      input: `<input class="form-input" type="number" id="field-display-score" name="display_score" value="${escapeHtml(String(e.display_score ?? ''))}" placeholder="0.0" min="0" max="10" step="0.1">`,
      hint: 'PUNTUACIÓN DE 0 A 10' })}
  </div>
</div>`;

  const descSection = `<div class="archive-form__section">
  <div class="archive-form__section-title">DESCRIPCIÓN</div>
  ${createFormGroup({ id: 'field-description', label: 'DESCRIPCIÓN',
    input: `<textarea class="form-textarea" id="field-description" name="description" placeholder="SINOPSIS Y DESCRIPCIÓN DEL ARCHIVO..." rows="4">${escapeHtml(e.description || '')}</textarea>` })}
</div>`;

  const survivalVal  = e.survival_index != null && e.survival_index !== '' ? String(e.survival_index) : '';
  const playersVal   = e.players        != null && e.players        !== '' ? String(e.players)        : '';

  const extendedSection = `<div class="archive-form__section">
  <div class="archive-form__section-title">DATOS EXTENDIDOS</div>
  <div class="form-row">
    ${createFormGroup({ id: 'field-director', label: 'DIRECTOR',
      input: `<input class="form-input" type="text" id="field-director" name="director" value="${escapeHtml(e.director || '')}" placeholder="NOMBRE DEL DIRECTOR...">` })}
    ${createFormGroup({ id: 'field-developer', label: 'DESARROLLADOR',
      input: `<input class="form-input" type="text" id="field-developer" name="developer" value="${escapeHtml(e.developer || '')}" placeholder="CAPCOM...">` })}
  </div>
  <div class="form-row">
    ${createFormGroup({ id: 'field-genre', label: 'GÉNERO',
      input: `<input class="form-input" type="text" id="field-genre" name="genre" value="${escapeHtml(e.genre || '')}" placeholder="SURVIVAL HORROR...">` })}
    ${createFormGroup({ id: 'field-engine', label: 'ENGINE',
      input: `<input class="form-input" type="text" id="field-engine" name="engine" value="${escapeHtml(e.engine || '')}" placeholder="RE ENGINE...">` })}
  </div>
  <div class="form-row">
    ${createFormGroup({ id: 'field-survival-index', label: 'SURVIVAL INDEX',
      input: `<input class="form-input" type="number" id="field-survival-index" name="survival_index" value="${escapeHtml(survivalVal)}" placeholder="0-100" min="0" max="100">`,
      hint: 'ÍNDICE DE SUPERVIVENCIA (0-100)' })}
    ${createFormGroup({ id: 'field-players', label: 'JUGADORES',
      input: `<input class="form-input" type="number" id="field-players" name="players" value="${escapeHtml(playersVal)}" placeholder="1" min="1">` })}
  </div>
  <div class="form-row">
    ${createFormGroup({ id: 'field-estimated-duration', label: 'DURACIÓN ESTIMADA',
      input: `<input class="form-input" type="text" id="field-estimated-duration" name="estimated_duration" value="${escapeHtml(e.estimated_duration || '')}" placeholder="8-10 horas...">` })}
    ${createFormGroup({ id: 'field-umbrella-classification', label: 'CLASIFICACIÓN UMBRELLA',
      input: `<input class="form-input" type="text" id="field-umbrella-classification" name="umbrella_classification" value="${escapeHtml(e.umbrella_classification || '')}" placeholder="CLASE A...">` })}
  </div>
  <div class="form-row">
    ${createFormGroup({ id: 'field-chronology-era', label: 'ERA CRONOLÓGICA',
      input: `<input class="form-input" type="text" id="field-chronology-era" name="chronology_era" value="${escapeHtml(e.chronology_era || '')}" placeholder="ERA T-VIRUS...">` })}
    ${createFormGroup({ id: 'field-alias-title', label: 'TÍTULO ALTERNATIVO',
      input: `<input class="form-input" type="text" id="field-alias-title" name="alias_title" value="${escapeHtml(e.alias_title || '')}" placeholder="BIO HAZARD...">` })}
  </div>
  <div class="form-row">
    ${createFormGroup({ id: 'field-main-locations', label: 'LOCACIONES PRINCIPALES',
      input: `<input class="form-input" type="text" id="field-main-locations" name="main_locations" value="${escapeHtml(e.main_locations || '')}" placeholder="RACCOON CITY...">` })}
    ${createFormGroup({ id: 'field-threat-type', label: 'TIPO DE AMENAZA',
      input: `<input class="form-input" type="text" id="field-threat-type" name="threat_type" value="${escapeHtml(e.threat_type || '')}" placeholder="BIOTERRORISMO...">` })}
  </div>
  ${createFormGroup({ id: 'field-registered-platforms', label: 'PLATAFORMAS REGISTRADAS',
    input: `<input class="form-input" type="text" id="field-registered-platforms" name="registered_platforms" value="${escapeHtml(e.registered_platforms || '')}" placeholder="PS4, PS5, PC, SWITCH...">` })}
</div>`;

  return [identSection, dataSection, classSection, descSection, extendedSection].join('\n');
}

export function createArchiveFormActions({
  submitLabel = 'GUARDAR REGISTRO',
  cancelHref  = 'games.html',
  showReset   = false,
  loading     = false,
} = {}) {
  const disabledAttr = loading ? ' disabled aria-disabled="true"' : '';
  const label        = loading ? 'PROCESANDO...' : escapeHtml(submitLabel);
  const resetBtn     = showReset
    ? `<button type="reset" class="btn btn--ghost">LIMPIAR</button>`
    : '';
  return `<div class="form-actions form-actions--split">
  <div class="cluster cluster--2">
    <button type="submit" class="btn btn--primary"${disabledAttr}>${label}</button>
    ${resetBtn}
  </div>
  <a href="${escapeHtml(cancelHref)}" class="btn btn--ghost">CANCELAR</a>
</div>`.trim();
}

export function createArchiveForm({
  entry            = null,
  mode             = 'create',
  validationErrors = null,
  statusBar        = null,
  formId           = 'archive-form',
} = {}) {
  const e      = entry ? { ...getDefaultArchiveEntryValues(), ...entry } : getDefaultArchiveEntryValues();
  const isEdit = mode === 'edit';

  const cancelHref = isEdit && e.id != null
    ? `game-detail.html?id=${encodeURIComponent(e.id)}`
    : 'games.html';

  const statusBarHtml  = statusBar        ? createArchiveFormStatusBar(statusBar) : '';
  const validationHtml = validationErrors ? createValidationPanel(validationErrors) : '';
  const fieldsHtml     = createArchiveFormFields(e);
  const previewHtml    = createArchivePreview(e);
  const actionsHtml    = createArchiveFormActions({
    submitLabel: isEdit ? 'ACTUALIZAR REGISTRO' : 'CREAR REGISTRO',
    cancelHref,
    showReset:   !isEdit,
    loading:     statusBar?.status === 'loading',
  });

  return `<form id="${escapeHtml(formId)}" class="form archive-form" novalidate>
  ${statusBarHtml}
  ${validationHtml}
  <div class="archive-form__grid">
    <div class="stack stack--5">${fieldsHtml}</div>
    <aside>${previewHtml}</aside>
  </div>
  ${actionsHtml}
</form>`.trim();
}
