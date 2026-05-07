function escapeHtml(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function normalizeValidationMessages(errorOrMessages) {
  if (!errorOrMessages) return [];

  if (Array.isArray(errorOrMessages)) {
    return errorOrMessages
      .map(m => {
        if (typeof m === 'string') return m;
        if (m && typeof m === 'object') {
          // FastAPI 422 field error: { msg, loc, type }
          if (m.msg) {
            const loc = Array.isArray(m.loc) ? m.loc.slice(1).join('.') : '';
            return loc ? `${loc}: ${m.msg}` : m.msg;
          }
          if (m.message) return m.message;
        }
        return String(m);
      })
      .filter(Boolean);
  }

  if (typeof errorOrMessages === 'object') {
    // ApiError: has .data property
    if (errorOrMessages.data) return normalizeValidationMessages(errorOrMessages.data);
    // FastAPI response body: { detail: [...] | "string" }
    if (errorOrMessages.detail) {
      if (Array.isArray(errorOrMessages.detail))    return normalizeValidationMessages(errorOrMessages.detail);
      if (typeof errorOrMessages.detail === 'string') return [errorOrMessages.detail];
    }
    if (errorOrMessages.message) return [errorOrMessages.message];
    if (typeof errorOrMessages.error === 'string' && errorOrMessages.error) return [errorOrMessages.error];
  }

  if (typeof errorOrMessages === 'string') return [errorOrMessages];

  return [];
}

export function createValidationList(messages = []) {
  if (!messages || messages.length === 0) return '';
  const items = messages
    .map(m => `<li class="validation-panel__item">${escapeHtml(m)}</li>`)
    .join('');
  return `<ul class="validation-panel__list">${items}</ul>`;
}

export function createValidationPanel(messages = [], { title = 'ERRORES DE VALIDACIÓN' } = {}) {
  const normalized = normalizeValidationMessages(messages);
  if (normalized.length === 0) return '';

  return `<div class="validation-panel">
  <div class="validation-panel__title">${escapeHtml(title)}</div>
  ${createValidationList(normalized)}
</div>`.trim();
}

export function normalizeFieldErrors(errorOrMessages) {
  const fieldErrors = {};
  let rawDetail = null;

  if (Array.isArray(errorOrMessages)) {
    rawDetail = errorOrMessages;
  } else if (errorOrMessages && typeof errorOrMessages === 'object') {
    const src = errorOrMessages.data || errorOrMessages;
    if (Array.isArray(src)) {
      rawDetail = src;
    } else if (src.detail && Array.isArray(src.detail)) {
      rawDetail = src.detail;
    }
  }

  if (!rawDetail) return fieldErrors;

  for (const item of rawDetail) {
    if (item && typeof item === 'object' && item.msg && Array.isArray(item.loc) && item.loc.length > 1) {
      const field = item.loc.slice(1).join('.');
      if (field) {
        if (!fieldErrors[field]) fieldErrors[field] = [];
        fieldErrors[field].push(item.msg);
      }
    }
  }

  return fieldErrors;
}

export function createFieldErrorList(errors = []) {
  if (!errors || errors.length === 0) return '';
  const items = errors
    .map(e => `<li class="field-error">${escapeHtml(String(e))}</li>`)
    .join('');
  return `<ul class="field-error-list">${items}</ul>`;
}

export function createFormValidationSummary(errorOrMessages, { title = 'ERRORES DE VALIDACIÓN' } = {}) {
  const normalized = normalizeValidationMessages(errorOrMessages);
  if (normalized.length === 0) return '';
  const items = normalized
    .map(m => `<li class="form-validation-summary__item">${escapeHtml(m)}</li>`)
    .join('');
  return `<div class="form-validation-summary">
  <div class="form-validation-summary__title">${escapeHtml(title)}</div>
  <ul class="form-validation-summary__list">${items}</ul>
</div>`.trim();
}
