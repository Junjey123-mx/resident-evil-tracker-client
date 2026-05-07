const CONTAINER_ID = 'toast-container';

export function ensureToastContainer() {
  let container = document.getElementById(CONTAINER_ID);
  if (!container) {
    container = document.createElement('div');
    container.id = CONTAINER_ID;
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  return container;
}

export function showToast(message, { type = 'info', duration = 4000, closeable = true } = {}) {
  const container = ensureToastContainer();

  const safeMessage = (message != null && String(message).trim()) ? String(message) : 'Notificación.';
  const safeType    = ['success', 'error', 'warning', 'info'].includes(type) ? type : 'info';
  const typeModifier = `toast--${safeType}`;

  const toast = document.createElement('div');
  toast.className = ['toast', typeModifier, 'toast--enter'].join(' ');

  const messageEl = document.createElement('span');
  messageEl.className = 'toast__message';
  messageEl.textContent = safeMessage;
  toast.appendChild(messageEl);

  if (closeable) {
    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'toast__close';
    closeBtn.textContent = '×';
    closeBtn.setAttribute('aria-label', 'Cerrar notificación');
    closeBtn.addEventListener('click', () => _dismiss(toast));
    toast.appendChild(closeBtn);
  }

  container.appendChild(toast);

  if (duration > 0) setTimeout(() => _dismiss(toast), duration);

  return toast;
}

function _dismiss(toast) {
  if (!toast || !toast.parentNode) return;
  toast.classList.remove('toast--enter');
  toast.classList.add('toast--exit');
  toast.addEventListener('animationend', () => toast.remove(), { once: true });
  setTimeout(() => toast.remove(), 500);
}

export function showSuccess(message) {
  return showToast(message, { type: 'success' });
}

export function showError(message) {
  return showToast(message, { type: 'error' });
}

export function showWarning(message) {
  return showToast(message, { type: 'warning' });
}

export function showInfo(message) {
  return showToast(message, { type: 'info' });
}

export function clearToasts() {
  const container = document.getElementById(CONTAINER_ID);
  if (container) container.innerHTML = '';
}
