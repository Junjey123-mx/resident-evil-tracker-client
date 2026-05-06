function escapeHtml(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatFileSize(bytes) {
  if (!bytes || bytes <= 0) return '';
  const kb = bytes / 1024;
  if (kb < 1024) return `${Math.round(kb)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

export function normalizeCoverUploadState(state = {}) {
  return {
    status:         state.status         || 'idle',
    currentUrl:     state.currentUrl     || null,
    fileName:       state.fileName       || null,
    fileSize:       state.fileSize != null ? Number(state.fileSize) : null,
    errorMessage:   state.errorMessage   || null,
    successMessage: state.successMessage || null,
  };
}

export function createCoverFileMeta(fileLike) {
  if (!fileLike) return '';
  const name = String(fileLike.name || '').trim();
  if (!name) return '';
  const size = fileLike.size != null ? formatFileSize(Number(fileLike.size)) : '';
  const display = size ? `${escapeHtml(name)} · ${escapeHtml(size)}` : escapeHtml(name);
  return `<span class="cover-upload__meta">${display}</span>`;
}

export function createCoverUploadHint({ maxSizeMb = 1 } = {}) {
  return `<span class="upload-zone__hint">JPEG, PNG o WEBP · máximo ${escapeHtml(String(maxSizeMb))} MB</span>`;
}

export function createCoverUploadStatus({ status = 'idle', message = '' } = {}) {
  const defaults = {
    idle:      '',
    uploading: 'SUBIENDO IMAGEN...',
    error:     'ERROR AL SUBIR IMAGEN',
    success:   'IMAGEN GUARDADA CORRECTAMENTE',
  };
  const text = message || defaults[status] || '';
  if (!text) return '';
  const modClass = status !== 'idle' ? ` cover-upload__status--${escapeHtml(status)}` : '';
  return `<span class="cover-upload__status${modClass}">${escapeHtml(text)}</span>`;
}

export function createCoverPreview({ currentUrl = null, altText = 'PORTADA' } = {}) {
  const inner = currentUrl
    ? `<img src="${escapeHtml(currentUrl)}" alt="${escapeHtml(altText)}" loading="lazy">`
    : `<span class="upload-zone__label">SIN PORTADA</span>`;
  return `<div class="cover-upload__preview">${inner}</div>`;
}

export function createCoverUpload({
  inputId    = 'cover-upload',
  currentUrl = null,
  state      = null,
  labelText  = 'SELECCIONAR IMAGEN',
} = {}) {
  const s           = normalizeCoverUploadState(state || {});
  const previewHtml = createCoverPreview({ currentUrl: currentUrl || s.currentUrl });
  const statusHtml  = createCoverUploadStatus({
    status:  s.status,
    message: s.errorMessage || s.successMessage || '',
  });
  const hintHtml  = createCoverUploadHint();
  const metaHtml  = s.fileName
    ? createCoverFileMeta({ name: s.fileName, size: s.fileSize })
    : '';

  return `<div class="cover-upload">
  ${previewHtml}
  <label class="upload-zone">
    <input
      type="file"
      id="${escapeHtml(inputId)}"
      name="cover_image"
      accept="image/jpeg,image/png,image/webp"
    >
    <span class="upload-zone__label">${escapeHtml(labelText)}</span>
    ${hintHtml}
  </label>
  ${metaHtml}
  ${statusHtml}
</div>`.trim();
}
