/**
 * auth.js — localStorage helpers for user session management
 */

function getUser() {
  try { return JSON.parse(localStorage.getItem('userInfo')); } catch { return null; }
}
function getToken() { return getUser()?.token || null; }
function setUser(data) { localStorage.setItem('userInfo', JSON.stringify(data)); }
function clearUser() { localStorage.removeItem('userInfo'); }

/** Redirect to login if not authenticated */
function requireAuth(redirectTo = '/login') {
  if (!getToken()) { window.location.href = redirectTo; return false; }
  return true;
}

/** Redirect if already logged in */
function redirectIfLoggedIn(to = '/admin/') {
  if (getToken()) { window.location.href = to; }
}
