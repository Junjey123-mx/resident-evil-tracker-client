export function qs(selector, parent = document) {
  return parent ? parent.querySelector(selector) : null;
}

export function qsa(selector, parent = document) {
  return parent ? Array.from(parent.querySelectorAll(selector)) : [];
}

export function byId(id) {
  return document.getElementById(id);
}

export function createElement(tag, {
  className, id, text, html, attrs = {}, dataset = {},
} = {}) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (id)        el.id = id;
  if (text)      el.textContent = text;
  if (html)      el.innerHTML = html;
  Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
  Object.entries(dataset).forEach(([k, v]) => { el.dataset[k] = v; });
  return el;
}

export function clearElement(element) {
  if (!element) return;
  while (element.firstChild) element.removeChild(element.firstChild);
}

export function setHTML(element, html) {
  if (!element) return;
  element.innerHTML = html;
}

export function showElement(element) {
  if (!element) return;
  element.hidden = false;
  element.style.display = '';
}

export function hideElement(element) {
  if (!element) return;
  element.hidden = true;
}

export function toggleElement(element, visible) {
  if (!element) return;
  visible ? showElement(element) : hideElement(element);
}

export function setText(element, value) {
  if (!element) return;
  element.textContent = value ?? '';
}

export function on(element, eventName, handler, options) {
  if (!element) return;
  element.addEventListener(eventName, handler, options);
}

export function delegate(parent, selector, eventName, handler) {
  if (!parent) return;
  parent.addEventListener(eventName, (event) => {
    const target = event.target.closest(selector);
    if (target && parent.contains(target)) handler(event, target);
  });
}

export function safeRender(root, renderFn) {
  if (!root) return;
  try {
    renderFn(root);
  } catch (err) {
    clearElement(root);
    const panel = createElement('div', { className: 'panel' });
    const body  = createElement('div', { className: 'panel__body' });
    const msg   = createElement('p',   { className: 'label', text: 'Error al renderizar el módulo.' });
    body.appendChild(msg);
    panel.appendChild(body);
    root.appendChild(panel);
    console.error('[safeRender]', err);
  }
}
