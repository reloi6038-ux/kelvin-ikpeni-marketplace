/**
 * toast.js — non-blocking notifications.
 */

let container;

const getContainer = () => {
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  return container;
};

const ICONS = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ',
};

export const toast = (message, type = 'info', title = '') => {
  const c = getContainer();
  const el = document.createElement('div');
  el.className = `toast toast--${type}`;
  el.innerHTML = `
    <span class="toast__icon">${ICONS[type] || ICONS.info}</span>
    <div class="toast__content">
      ${title ? `<div class="toast__title">${title}</div>` : ''}
      <p class="toast__message">${message}</p>
    </div>
    <button class="toast__close" aria-label="Close">×</button>
  `;

  const close = () => {
    el.classList.add('is-leaving');
    setTimeout(() => el.remove(), 300);
  };

  el.querySelector('.toast__close').addEventListener('click', close);
  c.appendChild(el);

  setTimeout(close, 4000);
};

export default toast;