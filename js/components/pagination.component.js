function escapeHtml(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function createPaginationButton({ label, page, disabled = false, active = false }) {
  const classes = ['pagination__btn', active ? 'pagination__btn--active' : '']
    .filter(Boolean).join(' ');
  const disabledAttr = disabled ? ' disabled aria-disabled="true"' : '';
  const dataPage     = (!disabled && page != null) ? ` data-page="${Number(page)}"` : '';

  return `<button type="button" class="${classes}"${disabledAttr}${dataPage}>${escapeHtml(String(label))}</button>`;
}

export function createPaginationInfo({ page = 1, pages = 1, total = 0 } = {}) {
  return `<span class="pagination__info">PÁG ${Number(page)} / ${Number(pages)} · ${Number(total)} REGISTROS</span>`;
}

export function createPagination({
  page         = 1,
  pages        = 1,
  total        = 0,
  has_next     = false,
  has_previous = false,
} = {}) {
  const currentPage = Math.max(1, Number(page)  || 1);
  const totalPages  = Math.max(1, Number(pages) || 1);

  if (totalPages <= 1 && total <= 0) return '';

  const buttons = [];

  // Prev
  buttons.push(createPaginationButton({ label: '‹', page: currentPage - 1, disabled: !has_previous }));

  // Page numbers — up to 5 around current
  const rangeStart = Math.max(1, currentPage - 2);
  const rangeEnd   = Math.min(totalPages, currentPage + 2);

  if (rangeStart > 1) {
    buttons.push(createPaginationButton({ label: '1', page: 1 }));
    if (rangeStart > 2) buttons.push(`<span class="pagination__info">…</span>`);
  }

  for (let p = rangeStart; p <= rangeEnd; p++) {
    buttons.push(createPaginationButton({ label: String(p), page: p, active: p === currentPage }));
  }

  if (rangeEnd < totalPages) {
    if (rangeEnd < totalPages - 1) buttons.push(`<span class="pagination__info">…</span>`);
    buttons.push(createPaginationButton({ label: String(totalPages), page: totalPages }));
  }

  // Next
  buttons.push(createPaginationButton({ label: '›', page: currentPage + 1, disabled: !has_next }));

  return `<div class="cluster cluster--2">
  <div class="pagination">${buttons.join('')}</div>
  ${createPaginationInfo({ page: currentPage, pages: totalPages, total })}
</div>`.trim();
}
