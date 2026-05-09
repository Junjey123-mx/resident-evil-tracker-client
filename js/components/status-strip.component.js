export function createStatusStrip(pageLabel = '') {
  const pageItem = pageLabel
    ? `<span class="status-strip__item">${pageLabel}</span>`
    : '';

  return `
    <div class="status-strip">
      <div class="status-strip__left">
        <span class="status-strip__item status-strip__item--active">
          <span class="chip__dot"></span>SYSTEM ONLINE
        </span>
        <span class="status-strip__item">UMBRELLA RECORDS</span>
      </div>
      <div class="status-strip__right">
        <span class="status-strip__item">ACCESO: AUTORIZADO</span>
        ${pageItem}
      </div>
    </div>
  `;
}

export function mountStatusStrip({ rootId = 'status-strip-root', pageLabel = '' } = {}) {
  const root = document.getElementById(rootId);
  if (!root) return;
  root.innerHTML = createStatusStrip(pageLabel);
}
