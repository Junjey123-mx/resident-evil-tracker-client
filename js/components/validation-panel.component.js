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
