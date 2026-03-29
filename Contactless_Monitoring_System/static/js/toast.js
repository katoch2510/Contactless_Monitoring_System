/**
 * toast.js — lightweight toast notification system
 * Call: showToast('Message', 'success' | 'error' | 'warning' | 'info')
 */

(function() {
  function ensureContainer() {
    let c = document.getElementById('toast-container');
    if (!c) {
      c = document.createElement('div');
      c.id = 'toast-container';
      document.body.appendChild(c);
    }
    return c;
  }

  function iconFor(type) {
    const icons = {
      success: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="#10b981" stroke-width="2.2" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>`,
      error:   `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="#ef4444" stroke-width="2.2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
      warning: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="#f59e0b" stroke-width="2.2" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
      info:    `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="#3b82f6" stroke-width="2.2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
    };
    return icons[type] || icons.info;
  }

  window.showToast = function(message, type = 'info', duration = 3500) {
    const container = ensureContainer();
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.innerHTML = `${iconFor(type)}<span>${message}</span>`;
    container.appendChild(el);
    setTimeout(() => {
      el.style.transition = 'opacity .35s, transform .35s';
      el.style.opacity = '0';
      el.style.transform = 'translateX(100%)';
      setTimeout(() => el.remove(), 400);
    }, duration);
  };
})();
